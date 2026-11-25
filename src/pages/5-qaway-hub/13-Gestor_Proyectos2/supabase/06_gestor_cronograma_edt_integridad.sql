-- ==============================================================================
-- QAWAY LAB · GESTOR DE PROYECTOS · Integridad EDT y Concurrencia (Sin borrado)
-- 1. Función RPC atómica gp_siguiente_codigo_edt(project_id, parent_id, kind)
--    Calcula el siguiente código EDT usando MAX numérico real + advisory lock.
-- 2. Trigger BEFORE INSERT para nuevos ítems:
--    - Impide insertar un 'subproceso' nuevo sin parent_id válido en el proyecto.
--    - Evita colisiones de código EDT no vacío bajo concurrencia.
--    - No altera ni elimina filas históricas existentes (ni filas con code = '').
-- ==============================================================================

create or replace function public.gp_siguiente_codigo_edt(
  p_project_id text,
  p_parent_id text,
  p_kind text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent_code text;
  v_parent_prefix text;
  v_max_num integer := 0;
  v_candidate text;
begin
  perform pg_advisory_xact_lock(
    hashtext('edt:' || coalesce(p_project_id, '') || ':' || coalesce(p_parent_id, 'ROOT'))
  );

  if p_kind = 'hito' or p_parent_id is null then
    select coalesce(max(substring(code from '^([0-9]+)')::integer), 0)
      into v_max_num
    from public.gestor_cronograma_items
    where project_id = p_project_id
      and parent_id is null
      and code ~ '^[0-9]+\.?$';

    loop
      v_max_num := v_max_num + 1;
      v_candidate := v_max_num::text || '.';
      exit when not exists (
        select 1
        from public.gestor_cronograma_items
        where project_id = p_project_id
          and code = v_candidate
      );
    end loop;

    return v_candidate;
  end if;

  select code
    into v_parent_code
  from public.gestor_cronograma_items
  where id = p_parent_id
    and project_id = p_project_id;

  if v_parent_code is null or btrim(v_parent_code) = '' then
    v_parent_prefix := '1';
  else
    v_parent_prefix := regexp_replace(btrim(v_parent_code), '\.$', '');
  end if;

  select coalesce(max(substring(code from '\.([0-9]+)$')::integer), 0)
    into v_max_num
  from public.gestor_cronograma_items
  where project_id = p_project_id
    and parent_id = p_parent_id
    and code ~ '\.[0-9]+$';

  loop
    v_max_num := v_max_num + 1;
    v_candidate := v_parent_prefix || '.' || v_max_num::text;
    exit when not exists (
      select 1
      from public.gestor_cronograma_items
      where project_id = p_project_id
        and code = v_candidate
    );
  end loop;

  return v_candidate;
end;
$$;

grant execute on function public.gp_siguiente_codigo_edt(text, text, text) to authenticated;

create or replace function public.fn_gestor_cronograma_items_edt_guard()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Si el id ya existe, el INSERT proviene de un UPSERT (ON CONFLICT DO UPDATE) sobre fila histórica.
  if exists (select 1 from public.gestor_cronograma_items where id = new.id) then
    return new;
  end if;

  -- Regla 1: Un subproceso nuevo nunca puede insertarse sin padre válido en el mismo proyecto.
  if new.kind = 'subproceso' then
    if new.parent_id is null or btrim(new.parent_id) = '' then
      raise exception 'Integridad EDT: un subproceso nuevo requiere parent_id válido.';
    end if;
    if not exists (
      select 1
      from public.gestor_cronograma_items p
      where p.id = new.parent_id
        and p.project_id = new.project_id
    ) then
      raise exception 'Integridad EDT: parent_id "%" no existe en el proyecto "%".', new.parent_id, new.project_id;
    end if;
  elsif new.parent_id is not null and btrim(new.parent_id) <> '' then
    if not exists (
      select 1
      from public.gestor_cronograma_items p
      where p.id = new.parent_id
        and p.project_id = new.project_id
    ) then
      raise exception 'Integridad EDT: parent_id "%" no existe en el proyecto "%".', new.parent_id, new.project_id;
    end if;
  end if;

  -- Regla 2: Evitar códigos EDT no vacíos duplicados en el mismo proyecto (concurrencia / cliente desactualizado).
  if new.code is not null and btrim(new.code) <> '' then
    perform pg_advisory_xact_lock(
      hashtext('edt:' || coalesce(new.project_id, '') || ':' || coalesce(new.parent_id, 'ROOT'))
    );

    if exists (
      select 1
      from public.gestor_cronograma_items e
      where e.project_id = new.project_id
        and e.code = new.code
    ) then
      new.code := public.gp_siguiente_codigo_edt(new.project_id, new.parent_id, new.kind);
    end if;
  end if;

  return new;
end;
$$;

create or replace trigger trg_gestor_cronograma_items_edt_guard
before insert on public.gestor_cronograma_items
for each row
execute function public.fn_gestor_cronograma_items_edt_guard();
