-- ============================================================
-- Apellido estructural en public.users + persistencia en trigger
-- Root fix: el frontend ya enviaba user_metadata.last_name en cada
-- registro (auth.users.raw_user_meta_data), pero handle_new_user()
-- solo persistia full_name y descartaba el apellido.
-- Agrega columna last_name, actualiza el trigger y backfill desde
-- el metadata existente (-> preferido) con fallback a full_name.
-- 2026-09-23. Idempotente. Sin tocar migraciones existentes.
-- ============================================================

-- ─── 1. Columna estructural ───
alter table public.users add column if not exists last_name text;

-- ─── 2. Trigger: persistir apellido desde metadata ───
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_invite public.user_invites%rowtype;
begin
  select * into v_invite from public.user_invites
  where lower(email) = lower(new.email)
    and accepted_at is null
    and expires_at > now()
  order by created_at desc
  limit 1;

  if found then
    insert into public.users (id, email, full_name, last_name, role, tenant_id)
    values (
      new.id, new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
      coalesce(new.raw_user_meta_data ->> 'last_name', null),
      v_invite.role, v_invite.tenant_id
    )
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name),
      last_name = coalesce(excluded.last_name, public.users.last_name);

    -- Roles por app de la invitación
    insert into public.user_app_roles (user_id, tenant_id, app_id, role)
    select new.id, v_invite.tenant_id, a.id, v_invite.role
    from public.app_catalog a
    where a.slug = any (v_invite.app_slugs)
    on conflict (user_id, tenant_id, app_id) do update set role = excluded.role;

    update public.user_invites set accepted_at = now() where id = v_invite.id;
  else
    -- Sin invitación: viewer sin marca (flujo público). Nada auto-asignado.
    insert into public.users (id, email, full_name, last_name, role, tenant_id)
    values (
      new.id, new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
      coalesce(new.raw_user_meta_data ->> 'last_name', null),
      'viewer', null
    )
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name),
      last_name = coalesce(excluded.last_name, public.users.last_name);
  end if;
  return new;
end;
$$;

-- Trigger existente (20260812000000) apunta a la función; se recrea
-- idempotente para que la migración sea autocontenida.
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─── 3. Backfill: apellido desde metadata (preferido) o full_name ───
update public.users u
   set last_name = coalesce(
         nullif(trim(meta.last_name), ''),
         nullif(trim(substr(u.full_name, length(split_part(u.full_name, ' ', 1)) + 1)), '')
       )
 from auth.users au
      , lateral (select au.raw_user_meta_data ->> 'last_name' as last_name) meta
where au.id = u.id
  and u.last_name is null;