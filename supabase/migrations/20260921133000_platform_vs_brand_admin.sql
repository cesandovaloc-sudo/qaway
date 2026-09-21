-- ============================================================
-- SaaS SEGURIDAD: Super Admin plataforma vs admin de marca
-- Problema: is_admin() global permitía a CUALQUIER admin operar
-- sobre TODAS las marcas. Ahora:
--   users.is_platform_admin = plataforma Qaway (global real).
--   is_admin() = solo plataforma (cambio de semántica).
--   is_tenant_admin() = admin de su propia marca.
--   Las ramas tenant existentes siguen dando a cada marca lo suyo;
--   el bypass cruzado queda solo en plataforma.
-- Qaway Lab opera como tenant normal (sin excepciones).
-- 2026-09-21. Idempotente. Sin commit ni push.
-- ============================================================

-- ─── 1. Flag plataforma + helpers ───
alter table public.users
  add column if not exists is_platform_admin boolean not null default false;

create or replace function public.is_platform_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and coalesce(is_platform_admin, false)
  );
$$;

create or replace function public.is_tenant_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and role = 'admin' and tenant_id is not null
  );
$$;

-- is_admin() pasa a significar SOLO plataforma. Las ramas
-- `tenant_id = get_auth_tenant_id()` ya cubren a cada marca.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_platform_admin();
$$;

-- ─── 2. Trigger anti-escalada v3 ───
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
  v_tenant uuid;
begin
  -- Servicio/dashboard (sin JWT) conserva vía libre
  if auth.uid() is null then
    return new;
  end if;
  -- Plataforma: todo permitido
  if public.is_platform_admin() then
    return new;
  end if;
  select role, tenant_id into v_role, v_tenant from public.users where id = auth.uid();
  -- tenant_id e is_platform_admin: solo plataforma los mueve
  if new.tenant_id is distinct from old.tenant_id
     or coalesce(new.is_platform_admin, false) is distinct from coalesce(old.is_platform_admin, false) then
    raise exception 'Solo plataforma mueve usuarios o banderas';
  end if;
  -- role: admin de la marca gestiona viewer/editor/guest de SU marca; nunca otorga admin
  if new.role is distinct from old.role then
    if not (v_role = 'admin' and v_tenant is not null and old.tenant_id = v_tenant) then
      raise exception 'Sin permiso de rol';
    end if;
    if new.role = 'admin' then
      raise exception 'Solo plataforma otorga admin';
    end if;
  end if;
  return new;
end;
$$;

-- ─── 3. users: directorio de marca + gestión admin de marca ───
drop policy if exists "users_tenant_read" on public.users;
create policy "users_tenant_read" on public.users
  for select using (
    tenant_id is not null and tenant_id = public.get_auth_tenant_id()
  );

drop policy if exists "users_tenant_admin_update" on public.users;
create policy "users_tenant_admin_update" on public.users
  for update using (
    public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()
  )
  with check (
    tenant_id = public.get_auth_tenant_id()
  );

-- ─── 4. Contratación, roles por app e invitaciones: gestión por marca ───
drop policy if exists "tas_tenant_admin_manage" on public.tenant_app_subscriptions;
create policy "tas_tenant_admin_manage" on public.tenant_app_subscriptions
  for all using (
    public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()
  )
  with check (
    tenant_id = public.get_auth_tenant_id()
  );

drop policy if exists "uar_tenant_admin_manage" on public.user_app_roles;
create policy "uar_tenant_admin_manage" on public.user_app_roles
  for all using (
    public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()
  )
  with check (
    tenant_id = public.get_auth_tenant_id()
  );

drop policy if exists "invites_tenant_admin_manage" on public.user_invites;
create policy "invites_tenant_admin_manage" on public.user_invites
  for all using (
    public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()
  )
  with check (
    tenant_id = public.get_auth_tenant_id()
  );

-- ─── 5. Pedidos/pagos: lectura admin de su marca ───
drop policy if exists "orders_tenant_admin_read" on public.orders;
create policy "orders_tenant_admin_read" on public.orders
  for select using (
    public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()
  );

drop policy if exists "order_items_tenant_admin_read" on public.order_items;
create policy "order_items_tenant_admin_read" on public.order_items
  for select using (
    public.is_tenant_admin() and exists (
      select 1 from public.orders o
      where o.id = order_items.order_id and o.tenant_id = public.get_auth_tenant_id()
    )
  );

drop policy if exists "payments_tenant_admin_read" on public.payments;
create policy "payments_tenant_admin_read" on public.payments
  for select using (
    public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()
  );

-- ─── 6. RPC asignar: plataforma todo; marca solo la suya sin otorgar admin ───
create or replace function public.admin_assign_user_tenant(
  p_user_id   uuid,
  p_tenant_id uuid,
  p_role      text DEFAULT 'viewer'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.tenants where id = p_tenant_id) then
    raise exception 'Tenant no encontrado: %', p_tenant_id;
  end if;
  if p_role not in ('viewer', 'editor', 'manager', 'admin') then
    raise exception 'Rol invalido: %', p_role;
  end if;
  if public.is_platform_admin() then
    update public.users set tenant_id = p_tenant_id, role = p_role where id = p_user_id;
  elsif public.is_tenant_admin()
    and p_tenant_id = public.get_auth_tenant_id()
    and p_role <> 'admin' then
    update public.users set tenant_id = p_tenant_id, role = p_role where id = p_user_id;
  else
    raise exception 'Sin permiso para esta asignación';
  end if;
  if not found then
    raise exception 'Usuario no encontrado: %', p_user_id;
  end if;
end;
$$;

-- ─── 7. Grants defensivos ───
grant select on public.users to authenticated;
grant select on public.orders, public.order_items, public.payments to authenticated;
