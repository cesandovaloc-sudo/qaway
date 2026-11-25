-- Paso 1: Identidad, membresías y contexto activo
-- Modelo: 1 identidad (auth.users) = N membresías tenant.
-- Compatibilidad: mantiene users.tenant_id como fallback durante migración.

begin;

-- ---------------------------------------------------------------------------
-- 1) Membresías persona-tenant
-- ---------------------------------------------------------------------------
create table if not exists public.tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  role text not null default 'viewer' check (role in ('admin', 'editor', 'viewer', 'guest')),
  status text not null default 'active' check (status in ('active', 'invited', 'suspended', 'removed')),
  is_default boolean not null default false,
  invited_by uuid references auth.users(id) on delete set null,
  approved_by uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, tenant_id)
);

create index if not exists idx_tenant_memberships_user_id on public.tenant_memberships(user_id);
create index if not exists idx_tenant_memberships_tenant_id on public.tenant_memberships(tenant_id);
create index if not exists idx_tenant_memberships_user_status on public.tenant_memberships(user_id, status);

-- ---------------------------------------------------------------------------
-- 2) Contexto activo
-- ---------------------------------------------------------------------------
create table if not exists public.user_active_context (
  user_id uuid primary key references auth.users(id) on delete cascade,
  active_tenant_id uuid not null references public.tenants(id) on delete cascade,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id) on delete set null
);

create index if not exists idx_user_active_context_tenant on public.user_active_context(active_tenant_id);

-- ---------------------------------------------------------------------------
-- 3) Aprobaciones de plataforma para crear tenants adicionales
--    Regla: bloqueado por defecto; plataforma admin puede aprobar/habilitar.
-- ---------------------------------------------------------------------------
create table if not exists public.identity_tenant_creation_grants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'approved' check (status in ('pending', 'approved', 'revoked')),
  max_additional_tenants integer check (max_additional_tenants is null or max_additional_tenants >= 0),
  reason text,
  approved_by uuid references auth.users(id) on delete set null,
  approved_at timestamptz,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_identity_tenant_creation_grants_user on public.identity_tenant_creation_grants(user_id, status);

-- ---------------------------------------------------------------------------
-- 4) Backfill desde modelo actual (users.tenant_id)
-- ---------------------------------------------------------------------------
insert into public.tenant_memberships (user_id, tenant_id, role, status, is_default, metadata)
select
  u.id,
  u.tenant_id,
  case when u.role in ('admin','editor','viewer','guest') then u.role else 'viewer' end,
  'active',
  true,
  jsonb_build_object('backfill', 'users.tenant_id', 'backfilled_at', now())
from public.users u
where u.tenant_id is not null
on conflict (user_id, tenant_id) do update
set role = excluded.role,
    status = case when public.tenant_memberships.status = 'removed' then public.tenant_memberships.status else 'active' end,
    updated_at = now();

insert into public.user_active_context (user_id, active_tenant_id, updated_at)
select u.id, u.tenant_id, now()
from public.users u
where u.tenant_id is not null
on conflict (user_id) do update
set active_tenant_id = excluded.active_tenant_id,
    updated_at = now();

-- ---------------------------------------------------------------------------
-- 5) Helpers
-- ---------------------------------------------------------------------------
create or replace function public.has_active_tenant_membership(p_user_id uuid, p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.user_id = p_user_id
      and tm.tenant_id = p_tenant_id
      and tm.status = 'active'
  );
$$;

-- get_auth_tenant_id: contexto activo válido > fallback users.tenant_id
create or replace function public.get_auth_tenant_id()
returns uuid
language sql
stable
security definer
set search_path to 'public'
as $$
  select coalesce(
    (
      select uac.active_tenant_id
      from public.user_active_context uac
      join public.tenant_memberships tm
        on tm.user_id = uac.user_id
       and tm.tenant_id = uac.active_tenant_id
       and tm.status = 'active'
      where uac.user_id = auth.uid()
      limit 1
    ),
    (
      select u.tenant_id
      from public.users u
      where u.id = auth.uid()
      limit 1
    )
  );
$$;

create or replace function public.is_tenant_member()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.user_id = auth.uid()
      and tm.tenant_id = public.get_auth_tenant_id()
      and tm.status = 'active'
      and tm.role <> 'guest'
  )
  or exists (
    -- fallback compatibilidad
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role <> 'guest'
      and u.tenant_id is not null
      and u.tenant_id = public.get_auth_tenant_id()
  );
$$;

create or replace function public.is_tenant_admin()
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select exists (
    select 1
    from public.tenant_memberships tm
    where tm.user_id = auth.uid()
      and tm.tenant_id = public.get_auth_tenant_id()
      and tm.status = 'active'
      and tm.role = 'admin'
  )
  or exists (
    -- fallback compatibilidad
    select 1
    from public.users u
    where u.id = auth.uid()
      and u.role = 'admin'
      and u.tenant_id is not null
      and u.tenant_id = public.get_auth_tenant_id()
  );
$$;

-- ---------------------------------------------------------------------------
-- 6) RPCs para front / contexto
-- ---------------------------------------------------------------------------
create or replace function public.get_my_tenant_memberships()
returns table (
  membership_id uuid,
  tenant_id uuid,
  tenant_slug text,
  tenant_name text,
  tenant_status text,
  membership_role text,
  membership_status text,
  is_default boolean,
  is_active_context boolean
)
language sql
stable
security definer
set search_path to 'public'
as $$
  select
    tm.id as membership_id,
    tm.tenant_id,
    t.slug as tenant_slug,
    t.name as tenant_name,
    t.status as tenant_status,
    tm.role as membership_role,
    tm.status as membership_status,
    tm.is_default,
    (uac.active_tenant_id = tm.tenant_id) as is_active_context
  from public.tenant_memberships tm
  join public.tenants t on t.id = tm.tenant_id
  left join public.user_active_context uac on uac.user_id = tm.user_id
  where tm.user_id = auth.uid()
    and tm.status = 'active'
    and t.deleted_at is null
  order by (uac.active_tenant_id = tm.tenant_id) desc, tm.is_default desc, t.name asc;
$$;

create or replace function public.set_active_tenant(p_tenant_id uuid)
returns table (
  active_tenant_id uuid,
  tenant_slug text,
  tenant_name text
)
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_user uuid;
begin
  v_user := auth.uid();
  if v_user is null then
    raise exception 'No autenticado';
  end if;

  if not exists (
    select 1 from public.tenant_memberships tm
    where tm.user_id = v_user
      and tm.tenant_id = p_tenant_id
      and tm.status = 'active'
  ) then
    raise exception 'No tienes membresía activa en este tenant';
  end if;

  insert into public.user_active_context (user_id, active_tenant_id, updated_at, updated_by)
  values (v_user, p_tenant_id, now(), v_user)
  on conflict (user_id) do update
    set active_tenant_id = excluded.active_tenant_id,
        updated_at = now(),
        updated_by = excluded.updated_by;

  -- Compatibilidad transición: sincroniza users.tenant_id
  update public.users
  set tenant_id = p_tenant_id,
      updated_at = now()
  where id = v_user;

  return query
  select t.id, t.slug, t.name
  from public.tenants t
  where t.id = p_tenant_id;
end;
$$;

create or replace function public.can_create_additional_tenant(p_user_id uuid default auth.uid())
returns boolean
language sql
stable
security definer
set search_path to 'public'
as $$
  select case
    when p_user_id is null then false
    when public.is_platform_admin() then true
    when exists (
      select 1
      from public.tenant_memberships tm
      where tm.user_id = p_user_id
        and tm.status = 'active'
    ) then exists (
      select 1
      from public.identity_tenant_creation_grants g
      where g.user_id = p_user_id
        and g.status = 'approved'
        and (g.max_additional_tenants is null or g.max_additional_tenants > 0)
    )
    else true -- primer tenant permitido por flujo normal
  end;
$$;

grant select, insert, update, delete on public.tenant_memberships to authenticated;
grant select, insert, update, delete on public.user_active_context to authenticated;
grant select, insert, update, delete on public.identity_tenant_creation_grants to authenticated;
grant all on public.tenant_memberships to service_role;
grant all on public.user_active_context to service_role;
grant all on public.identity_tenant_creation_grants to service_role;

grant execute on function public.has_active_tenant_membership(uuid, uuid) to authenticated;
grant execute on function public.get_my_tenant_memberships() to authenticated;
grant execute on function public.set_active_tenant(uuid) to authenticated;
grant execute on function public.can_create_additional_tenant(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- 7) RLS
-- ---------------------------------------------------------------------------
alter table public.tenant_memberships enable row level security;
alter table public.user_active_context enable row level security;
alter table public.identity_tenant_creation_grants enable row level security;

drop policy if exists tenant_memberships_select_own on public.tenant_memberships;
create policy tenant_memberships_select_own
  on public.tenant_memberships
  for select
  using (
    user_id = auth.uid()
    or public.is_platform_admin()
    or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id())
  );

drop policy if exists tenant_memberships_admin_manage on public.tenant_memberships;
create policy tenant_memberships_admin_manage
  on public.tenant_memberships
  for all
  using (public.is_platform_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()))
  with check (public.is_platform_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

drop policy if exists user_active_context_select_own on public.user_active_context;
create policy user_active_context_select_own
  on public.user_active_context
  for select
  using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists user_active_context_manage_own on public.user_active_context;
create policy user_active_context_manage_own
  on public.user_active_context
  for all
  using (user_id = auth.uid() or public.is_platform_admin())
  with check (
    public.is_platform_admin()
    or (
      user_id = auth.uid()
      and public.has_active_tenant_membership(user_id, active_tenant_id)
    )
  );

drop policy if exists identity_tenant_creation_grants_select on public.identity_tenant_creation_grants;
create policy identity_tenant_creation_grants_select
  on public.identity_tenant_creation_grants
  for select
  using (user_id = auth.uid() or public.is_platform_admin());

drop policy if exists identity_tenant_creation_grants_admin_manage on public.identity_tenant_creation_grants;
create policy identity_tenant_creation_grants_admin_manage
  on public.identity_tenant_creation_grants
  for all
  using (public.is_platform_admin())
  with check (public.is_platform_admin());

commit;