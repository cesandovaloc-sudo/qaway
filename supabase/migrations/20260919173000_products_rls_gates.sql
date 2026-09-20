-- ============================================================
-- FIX: RLS real en public.products (estaba USING(true) total)
-- Hallazgo auditoría 2026-09-19: RLS habilitado pero políticas
-- abiertas en select/insert/update/delete para quien tuviera grants.
-- Datos piloto (EPC/Vallet) viven en esta tabla compartida.
-- Flujos verificados en código: tienda lee (anon, status active),
-- staff escribe (authenticated). Sin deletes/inserts anon en cliente.
-- + Columna tenant_id (nullable, preparatoria fase 2 multi-tenant).
-- IDEMPOTENTE. Sin commit automático.
-- ============================================================

-- 1. Columna tenant preparatoria (nullable: cero ruptura)
alter table public.products
  add column if not exists tenant_id uuid references public.tenants (id) on delete set null;
create index if not exists products_tenant_idx on public.products (tenant_id);

-- 2. Cerrar políticas abiertas
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (status = 'active' or auth.role() = 'authenticated');

drop policy if exists "products_public_insert" on public.products;
create policy "products_staff_insert" on public.products
  for insert with check (auth.role() = 'authenticated');

drop policy if exists "products_public_update" on public.products;
create policy "products_staff_update" on public.products
  for update using (auth.role() = 'authenticated') with check (auth.role() = 'authenticated');

drop policy if exists "products_public_delete" on public.products;
create policy "products_staff_delete" on public.products
  for delete using (auth.role() = 'authenticated');
