-- ============================================================
-- STRICT MULTI-TENANT ISOLATION — Users, Leads & Campaigns RLS
-- ============================================================
-- Objetivo:
--   1. Vincular usuarios de public.users con su tenant (columna tenant_id).
--   2. Crear helper de seguridad get_auth_tenant_id() que resuelve el tenant del usuario conectado.
--   3. Actualizar trigger handle_new_user() para asignar tenant_id desde metadata si existe.
--   4. Sanear 49 leads históricos huérfanos y campañas asignándolos al Master Tenant (Qaway Lab).
--   5. Eliminar políticas permisivas (using true) y blindar public.leads y public.campaigns
--      con Row Level Security estricto para que NUNCA se crucen datos entre empresas.
-- ============================================================

-- ─── 1. TABLA `public.users` — Vincular Usuario con Tenant ────
alter table public.users 
  add column if not exists tenant_id uuid references public.tenants(id) on delete set null;

create index if not exists idx_users_tenant_id on public.users(tenant_id);

-- Helper SQL seguro que retorna el tenant_id del usuario autenticado (evita recursión RLS)
create or replace function public.get_auth_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.users where id = auth.uid();
$$;

-- Trigger actualizado para registrar nuevos usuarios con su tenant_id
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid;
begin
  if (new.raw_user_meta_data ->> 'tenant_id') is not null then
    begin
      v_tenant_id := (new.raw_user_meta_data ->> 'tenant_id')::uuid;
    exception when others then
      v_tenant_id := null;
    end;
  end if;

  insert into public.users (id, email, full_name, role, tenant_id)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    coalesce(new.raw_user_meta_data ->> 'role', 'viewer'),
    v_tenant_id
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(excluded.full_name, public.users.full_name),
    tenant_id = coalesce(excluded.tenant_id, public.users.tenant_id);
  return new;
end;
$$;

-- ─── 2. SANEAMIENTO DE DATOS HISTÓRICOS ───────────────────────
-- Asignar leads y campañas sin tenant al Master Tenant de Qaway Lab (00000000-0000-0000-0000-000000000001)
update public.leads
set tenant_id = '00000000-0000-0000-0000-000000000001'
where tenant_id is null;

update public.campaigns
set tenant_id = '00000000-0000-0000-0000-000000000001'
where tenant_id is null;

-- ─── 3. BLINDAJE RLS ESTRICTO EN `public.leads` ───────────────
alter table public.leads enable row level security;

-- Limpieza de políticas previas permisivas
drop policy if exists "leads_read_policy" on public.leads;
drop policy if exists "leads_all_policy" on public.leads;
drop policy if exists "leads_tenant_isolation" on public.leads;
drop policy if exists "leads_select_tenant_isolation" on public.leads;
drop policy if exists "leads_modify_tenant_isolation" on public.leads;
drop policy if exists "leads_insert_secure" on public.leads;
drop policy if exists "leads_public_insert" on public.leads;
drop policy if exists "leads_public_read" on public.leads;
drop policy if exists "leads_tenant_select" on public.leads;
drop policy if exists "leads_tenant_insert" on public.leads;
drop policy if exists "leads_tenant_update" on public.leads;
drop policy if exists "leads_tenant_delete" on public.leads;

-- Lectura: SuperAdmin ve todo; Usuario autenticado SOLO ve los leads de su propio tenant
-- En modo anónimo público (desarrollo o widget), permite lectura filtrada por tenant explícito
create policy "leads_tenant_select" on public.leads
  for select
  using (
    public.is_admin() or 
    (auth.uid() is not null and tenant_id = public.get_auth_tenant_id()) or
    (auth.uid() is null and tenant_id is not null)
  );

-- Inserción: Formularios públicos (ej. Landing CoraVet Booking/Contact) o usuarios autorizados
create policy "leads_tenant_insert" on public.leads
  for insert
  with check (
    tenant_id is not null and (
      public.is_admin() or
      auth.uid() is null or
      tenant_id = public.get_auth_tenant_id()
    )
  );

-- Actualización: Solo SuperAdmin o usuario que pertenece al mismo tenant del lead
create policy "leads_tenant_update" on public.leads
  for update
  using (
    public.is_admin() or 
    (auth.uid() is not null and tenant_id = public.get_auth_tenant_id())
  )
  with check (
    public.is_admin() or 
    (auth.uid() is not null and tenant_id = public.get_auth_tenant_id())
  );

-- Eliminación: Solo SuperAdmin o usuario del mismo tenant
create policy "leads_tenant_delete" on public.leads
  for delete
  using (
    public.is_admin() or 
    (auth.uid() is not null and tenant_id = public.get_auth_tenant_id())
  );

-- ─── 4. BLINDAJE RLS ESTRICTO EN `public.campaigns` ───────────
alter table public.campaigns enable row level security;

drop policy if exists "campaigns_all_policy" on public.campaigns;
drop policy if exists "campaigns_tenant_select" on public.campaigns;
drop policy if exists "campaigns_tenant_modify" on public.campaigns;

create policy "campaigns_tenant_select" on public.campaigns
  for select
  using (
    public.is_admin() or 
    (auth.uid() is not null and tenant_id = public.get_auth_tenant_id()) or
    (auth.uid() is null and tenant_id is not null)
  );

create policy "campaigns_tenant_modify" on public.campaigns
  for all
  using (
    public.is_admin() or 
    (auth.uid() is not null and tenant_id = public.get_auth_tenant_id())
  )
  with check (
    public.is_admin() or 
    (auth.uid() is not null and tenant_id = public.get_auth_tenant_id())
  );
