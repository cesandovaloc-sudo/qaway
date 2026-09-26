-- ============================================================
-- MIGRACIÓN DE SEGURIDAD CONSOLIDADA — RUN-2 SUPABASE
-- Fecha: 2026-09-26
-- 1. C-1 HIGH: Bloqueo de auto-asignación de permissions en public.users
-- 2. Revocación de EXECUTE a anon/PUBLIC en RPCs sensibles
-- ============================================================

-- ─── 1. C-1: Trigger prevent_permissions_selfwrite ──────────
-- Evita que cualquier usuario no-admin modifique 'permissions' o 'role' en su propia fila.
create or replace function public.prevent_permissions_selfwrite()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Solo un admin puede cambiar role o permissions
  if not public.is_admin() then
    if (new.permissions is distinct from old.permissions) or (new.role is distinct from old.role) then
      raise exception 'Operacion no permitida: Solo los administradores pueden modificar roles o permisos.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists users_guard_permissions on public.users;
create trigger users_guard_permissions
  before update on public.users
  for each row
  execute function public.prevent_permissions_selfwrite();

-- ─── 2. Revocación de permisos en RPCs sensibles ─────────────
-- Bloque condicional por si alguna de las funciones no fue creada en producción
do $$
begin
  -- restore_stock
  if exists (select 1 from pg_proc where proname = 'restore_stock') then
    revoke execute on function public.restore_stock(uuid, numeric) from public, anon;
    grant execute on function public.restore_stock(uuid, numeric) to authenticated, service_role;
    raise notice 'restore_stock: permisos public/anon revocados.';
  end if;

  -- next_correlativo
  if exists (select 1 from pg_proc where proname = 'next_correlativo') then
    revoke execute on function public.next_correlativo(uuid) from public, anon;
    grant execute on function public.next_correlativo(uuid) to authenticated, service_role;
    raise notice 'next_correlativo: permisos public/anon revocados.';
  end if;

  -- next_sale_number
  if exists (select 1 from pg_proc where proname = 'next_sale_number') then
    revoke execute on function public.next_sale_number() from public, anon;
    grant execute on function public.next_sale_number() to authenticated, service_role;
    raise notice 'next_sale_number: permisos public/anon revocados.';
  end if;
end $$;

-- ─── 3. Bucket avatars ──────────────────────────────────────
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'storage' and table_name = 'buckets') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'avatars',
      'avatars',
      true,
      2097152, -- 2MB
      array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    )
    on conflict (id) do update set
      public = true,
      file_size_limit = 2097152,
      allowed_mime_types = array['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  end if;
end $$;