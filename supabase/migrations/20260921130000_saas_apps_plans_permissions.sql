-- ============================================================
-- SaaS: marcas → apps contratadas → planes + permisos usuario-marca-app
-- Estructura NUEVA, sin tocar Academy (suscripciones intactas) ni
-- flujos existentes. Todo IF NOT EXISTS / OR REPLACE / idempotente.
-- Gates en servidor via helpers (las apps los consumen, no solo UI).
-- 2026-09-21. Sin commit automático.
-- ============================================================

-- ─── 1. Catálogo de apps del Hub ───
create table if not exists public.app_catalog (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  created_at timestamptz not null default now()
);

insert into public.app_catalog (slug, name) values
  ('crm', 'CRM'),
  ('inventario', 'Inventario'),
  ('agenda', 'Agenda'),
  ('blog', 'Blog')
on conflict (slug) do nothing;

-- ─── 2. Contratación: tenant × app → plan ───
create table if not exists public.tenant_app_subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  app_id uuid not null references public.app_catalog (id) on delete cascade,
  plan text not null default 'basico' check (plan in ('basico', 'intermedio', 'premium')),
  status text not null default 'active' check (status in ('active', 'suspended', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_tenant_app unique (tenant_id, app_id)
);
create index if not exists idx_tenant_app_tenant on public.tenant_app_subscriptions (tenant_id);
create index if not exists idx_tenant_app_active on public.tenant_app_subscriptions (tenant_id, app_id) where status = 'active';

-- ─── 3. Roles por usuario × marca × app ───
create table if not exists public.user_app_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users (id) on delete cascade,
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  app_id uuid not null references public.app_catalog (id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer', 'guest')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_user_tenant_app unique (user_id, tenant_id, app_id)
);
create index if not exists idx_user_app_user on public.user_app_roles (user_id);
create index if not exists idx_user_app_tenant_app on public.user_app_roles (tenant_id, app_id);

-- ─── 4. RLS ───
alter table public.app_catalog enable row level security;
alter table public.tenant_app_subscriptions enable row level security;
alter table public.user_app_roles enable row level security;

drop policy if exists "app_catalog_read" on public.app_catalog;
create policy "app_catalog_read" on public.app_catalog
  for select using (true);

drop policy if exists "tas_admin_all" on public.tenant_app_subscriptions;
create policy "tas_admin_all" on public.tenant_app_subscriptions
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "tas_tenant_read" on public.tenant_app_subscriptions;
create policy "tas_tenant_read" on public.tenant_app_subscriptions
  for select using (tenant_id = public.get_auth_tenant_id());

drop policy if exists "uar_admin_all" on public.user_app_roles;
create policy "uar_admin_all" on public.user_app_roles
  for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "uar_own_read" on public.user_app_roles;
create policy "uar_own_read" on public.user_app_roles
  for select using (user_id = auth.uid());

-- ─── 5. Helpers servidor (gates para las apps) ───
-- Plan contratado y activo de una marca en una app (null si no hay).
create or replace function public.tenant_app_plan(p_tenant_id uuid, p_app_slug text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select tas.plan
  from public.tenant_app_subscriptions tas
  join public.app_catalog a on a.id = tas.app_id
  where tas.tenant_id = p_tenant_id and a.slug = p_app_slug and tas.status = 'active'
  limit 1
$$;

-- ¿El usuario autenticado puede usar la app (rol propio o admin)?
create or replace function public.user_can_use_app(p_app_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1 from public.user_app_roles uar
      join public.app_catalog a on a.id = uar.app_id
      where uar.user_id = auth.uid()
        and a.slug = p_app_slug
        and uar.tenant_id = public.get_auth_tenant_id()
    )
$$;

-- Rol del usuario en (marca actual, app). Null = sin acceso.
create or replace function public.user_app_role(p_app_slug text)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select uar.role
  from public.user_app_roles uar
  join public.app_catalog a on a.id = uar.app_id
  where uar.user_id = auth.uid()
    and a.slug = p_app_slug
    and uar.tenant_id = public.get_auth_tenant_id()
  limit 1
$$;

grant execute on function public.tenant_app_plan(uuid, text) to anon, authenticated;
grant execute on function public.user_can_use_app(text) to anon, authenticated;
grant execute on function public.user_app_role(text) to anon, authenticated;
grant select on public.app_catalog to anon, authenticated;
grant select on public.tenant_app_subscriptions to authenticated;
grant select on public.user_app_roles to authenticated;
grant insert, update, delete on public.tenant_app_subscriptions to authenticated;
grant insert, update, delete on public.user_app_roles to authenticated;
grant all on public.tenant_app_subscriptions to service_role;
grant all on public.user_app_roles to service_role;
