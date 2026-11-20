-- ============================================================================
-- 20261120_login_attempts_seis_intentos.sql
-- Ajuste de política pedido por el responsable: 6 intentos en total.
--   · Fallos 1 y 2: sin aviso de "intentos restantes" (dos intentos libres).
--   · Fallos 3, 4 y 5: avisos "Te quedan 3 / 2 / 1 intentos".
--   · Fallo 6: bloqueo de 15 min con mensaje de recuperación.
-- ADITIVO: solo CREATE OR REPLACE de las dos funciones de conteo; no toca
-- tablas, no borra registros y conserva los GRANT/REVOKE anteriores.
-- La Edge Function decide QUÉ mensaje mostrar; aquí solo cambia el límite.
-- ============================================================================

create or replace function public.login_guard_state(p_email text)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v public.user_login_attempts%rowtype; v_min int;
begin
  select * into v from public.user_login_attempts where email_key = lower(btrim(p_email));
  if not found then
    return jsonb_build_object('locked', false, 'failed_count', 0, 'remaining', 6);
  end if;
  if v.locked_until is not null and v.locked_until > clock_timestamp() then
    v_min := ceil(extract(epoch from (v.locked_until - clock_timestamp())) / 60)::int;
    return jsonb_build_object('locked', true, 'locked_until', v.locked_until,
                              'minutes_remaining', greatest(v_min,1), 'failed_count', v.failed_count);
  end if;
  if v.locked_until is not null and v.locked_until <= clock_timestamp() then
    update public.user_login_attempts
       set failed_count = 0, locked_until = null, first_failed_at = null,
           last_failed_at = null, updated_at = clock_timestamp()
     where email_key = v.email_key;
    return jsonb_build_object('locked', false, 'failed_count', 0, 'remaining', 6);
  end if;
  return jsonb_build_object('locked', false, 'failed_count', v.failed_count,
                            'remaining', greatest(6 - v.failed_count, 0));
end $$;

create or replace function public.login_guard_failure(p_email text, p_user_id uuid default null, p_ip text default null)
returns jsonb language plpgsql security definer set search_path = public, pg_temp
as $$
declare v_key text := lower(btrim(p_email)); v_count int; v_lock timestamptz; v_state jsonb;
begin
  v_state := public.login_guard_state(v_key);
  if (v_state->>'locked')::boolean then return v_state; end if;

  insert into public.user_login_attempts as a
    (email_key, user_id, failed_count, first_failed_at, last_failed_at, last_ip, updated_at)
  values (v_key, p_user_id, 1, clock_timestamp(), clock_timestamp(), p_ip, clock_timestamp())
  on conflict (email_key) do update set
    failed_count = a.failed_count + 1,
    user_id = coalesce(excluded.user_id, a.user_id),
    first_failed_at = coalesce(a.first_failed_at, clock_timestamp()),
    last_failed_at = clock_timestamp(),
    last_ip = excluded.last_ip,
    updated_at = clock_timestamp()
  returning a.failed_count into v_count;

  if v_count >= 6 then
    update public.user_login_attempts set locked_until = clock_timestamp() + interval '15 minutes'
     where email_key = v_key returning locked_until into v_lock;
    return jsonb_build_object('locked', true, 'remaining', 0,
                              'locked_until', v_lock, 'failed_count', v_count);
  end if;
  return jsonb_build_object('locked', false, 'remaining', 6 - v_count, 'failed_count', v_count);
end $$;

comment on function public.login_guard_state(text) is
  'Devuelve locked/remaining sobre 6 intentos. Reinicia el contador si el bloqueo ya venció.';
comment on function public.login_guard_failure(text, uuid, text) is
  'Registra un fallo; en el 6o fija locked_until = ahora + 15 min.';

do $$
begin
  if not exists (
    select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.proname = 'login_guard_failure'
      and p.proargtypes::text like '%uuid%'
  ) then raise exception 'FALLÓ: no se actualizó login_guard_failure'; end if;
  raise notice 'OK: límite de intentos actualizado a 6';
end $$;

-- Rollback documentado (NO ejecutado): volver a aplicar
-- supabase/sql/20261119_login_attempt_guard.sql (versión de 5 intentos).
