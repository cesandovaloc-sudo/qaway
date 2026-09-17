-- ============================================================
-- MULTI-TENANT ORDERS, PAYMENTS & LEADS — FASE 3
-- ============================================================
-- Objetivo:
-- 1. Agregar tenant_id a public.orders y public.payments
--    con valor por defecto al Master Tenant Qaway Lab ('00000000-0000-0000-0000-000000000001')
--    para preservar el 100% de operatividad del checkout de Fase 2.
-- 2. Asegurar índices de alto rendimiento para filtrado por tenant.
-- 3. Habilitar políticas RLS para registro anónimo de pedidos, citas y leads por tenant.
-- ============================================================

-- ─── 1. EXTENSIÓN DE TABLA ORDERS ────────────────────────────
alter table public.orders 
  add column if not exists tenant_id uuid references public.tenants(id) on delete restrict default '00000000-0000-0000-0000-000000000001'::uuid;

update public.orders 
set tenant_id = '00000000-0000-0000-0000-000000000001'::uuid 
where tenant_id is null;

alter table public.orders 
  alter column tenant_id set not null;

create index if not exists idx_orders_tenant_id 
  on public.orders(tenant_id);

create index if not exists idx_orders_tenant_status 
  on public.orders(tenant_id, status);

-- ─── 2. EXTENSIÓN DE TABLA PAYMENTS ──────────────────────────
alter table public.payments 
  add column if not exists tenant_id uuid references public.tenants(id) on delete restrict default '00000000-0000-0000-0000-000000000001'::uuid;

update public.payments 
set tenant_id = '00000000-0000-0000-0000-000000000001'::uuid 
where tenant_id is null;

alter table public.payments 
  alter column tenant_id set not null;

create index if not exists idx_payments_tenant_id 
  on public.payments(tenant_id);

-- ─── 3. POLÍTICAS RLS PARA CHECKOUT Y FORMULARIOS PÚBLICOS ───
-- Inserción anónima de pedidos para checkout público de invitados
alter table public.orders enable row level security;

drop policy if exists "orders_public_insert" on public.orders;
create policy "orders_public_insert" on public.orders 
  for insert with check (true);

drop policy if exists "orders_public_read" on public.orders;
create policy "orders_public_read" on public.orders 
  for select using (true);

-- Inserción pública de leads y citas para los formularios de tenants
alter table public.leads enable row level security;

drop policy if exists "leads_public_insert" on public.leads;
create policy "leads_public_insert" on public.leads 
  for insert with check (true);

drop policy if exists "leads_public_read" on public.leads;
create policy "leads_public_read" on public.leads 
  for select using (true);
