-- ============================================================
-- SaaS usuarios: invitaciones + vínculo auto + sync de email
-- Flujo: admin invita (edge) → fila en user_invites → invitado
-- acepta y fija password (Auth nativo) → trigger lo vincula a la
-- marca+rol de la invitación. Nada lo decide el cliente.
-- Cambio de correo: trigger sincroniza public.users (id intacto,
-- tenant/roles intactos). 2026-09-21. Idempotente. Sin commit.
-- ============================================================

-- ─── 1. Tabla de invitaciones ───
create table if not exists public.user_invites (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer', 'guest')),
  app_slugs text[] not null default '{}',
  token uuid not null default gen_random_uuid(),
  expires_at timestamptz not null default (now() + interval '7 days'),
  accepted_at timestamptz,
  created_by uuid references public.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint uq_invite_pending unique (email, tenant_id)
);

alter table public.user_invites enable row level security;

drop policy if exists "invites_admin_all" on public.user_invites;
create policy "invites_admin_all" on public.user_invites
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "invites_tenant_read" on public.user_invites;
create policy "invites_tenant_read" on public.user_invites
  for select using (tenant_id = public.get_auth_tenant_id());

grant select, insert, update, delete on public.user_invites to authenticated;
grant all on public.user_invites to service_role;

-- ─── 2. Trigger: vincular invitación al registrarse ───
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
    insert into public.users (id, email, full_name, role, tenant_id)
    values (
      new.id, new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
      v_invite.role, v_invite.tenant_id
    )
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name);

    -- Roles por app de la invitación
    insert into public.user_app_roles (user_id, tenant_id, app_id, role)
    select new.id, v_invite.tenant_id, a.id, v_invite.role
    from public.app_catalog a
    where a.slug = any (v_invite.app_slugs)
    on conflict (user_id, tenant_id, app_id) do update set role = excluded.role;

    update public.user_invites set accepted_at = now() where id = v_invite.id;
  else
    -- Sin invitación: viewer sin marca (flujo público). Nada auto-asignado.
    insert into public.users (id, email, full_name, role, tenant_id)
    values (
      new.id, new.email,
      coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
      'viewer', null
    )
    on conflict (id) do update set
      email = excluded.email,
      full_name = coalesce(excluded.full_name, public.users.full_name);
  end if;
  return new;
end;
$$;

-- ─── 3. Sync de email: cambio conserva id/tenant/roles ───
create or replace function public.sync_user_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.users set email = new.email where id = new.id;
  end if;
  return new;
end;
$$;

drop trigger if exists users_sync_email on auth.users;
create trigger users_sync_email
  after update of email on auth.users
  for each row execute function public.sync_user_email();
