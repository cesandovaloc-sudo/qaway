-- ============================================================
-- FACTURACIÓN ELECTRÓNICA SUNAT — schema preparado (FASE 3 del
-- PLAN-IMPLEMENTACION-FISCAL.md)
--
-- Crea la ESTRUCTURA de datos lista para cuando se contrate un
-- proveedor SUNAT. NO se envía nada: la conexión se activa luego
-- (interruptor business_settings.sunat_connected + edge functions).
--
--   invoices        (comprobante: boleta/factura con snapshot fiscal)
--   invoice_lines   (líneas del comprobante)
--   next_correlativo(serie_id) — correlativo transaccional sin huecos
--
-- IDEMPOTENTE: re-ejecutable sin riesgo.
-- ============================================================

-- 1) INVOICES
create table if not exists public.invoices (
  id              uuid primary key default gen_random_uuid(),
  sale_id         uuid references public.sales (id) on delete set null,
  series_id       uuid references public.series (id) on delete set null,
  correlativo     integer,
  numero          text not null,
  tipo_doc        text not null default '01',
  doc_type        text,
  doc_number      text,
  fiscal_name     text,
  fiscal_address  text,
  moneda          text not null default 'PEN',
  subtotal        numeric not null default 0,
  igv_total       numeric not null default 0,
  total           numeric not null default 0,
  igv_rate        numeric not null default 18,
  descuento       numeric not null default 0,
  estado          text not null default 'generado',
  sunat_response  jsonb,
  xml_url         text,
  pdf_url         text,
  created_by      uuid references public.users (id) on delete set null,
  emitted_at      timestamptz,
  created_at      timestamptz not null default now(),
  constraint invoices_tipo_doc_check check (tipo_doc in ('01', '03')),
  constraint invoices_estado_check check (estado in ('generado', 'enviado', 'aceptado', 'rechazado', 'anulado')),
  constraint invoices_numero_unique unique (numero)
);

-- 2) INVOICE_LINES
create table if not exists public.invoice_lines (
  id            uuid primary key default gen_random_uuid(),
  invoice_id    uuid not null references public.invoices (id) on delete cascade,
  product_title text not null,
  quantity      numeric not null default 1,
  unit_price    numeric not null default 0,
  tax_code      text default '10',
  igv_amount    numeric not null default 0,
  total         numeric not null default 0
);

-- 3) Correlativo por serie (SELECT ... FOR UPDATE: transaccional,
--    sin huecos ni colisiones). Usado por el proveedor de facturación.
create or replace function public.next_correlativo(p_serie_id uuid)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  next_num integer;
begin
  select correlativo_actual + 1
    into next_num
    from public.series
    where id = p_serie_id
    for update;

  if next_num is null then
    raise exception 'Serie no encontrada: %', p_serie_id;
  end if;

  update public.series
     set correlativo_actual = next_num
   where id = p_serie_id;

  return next_num;
end;
$$;

-- 4) RLS
alter table public.invoices      enable row level security;
alter table public.invoice_lines enable row level security;

drop policy if exists "invoices_select" on public.invoices;
create policy "invoices_select" on public.invoices
  for select using (public.has_permission('can_view_sales'));

drop policy if exists "invoices_insert" on public.invoices;
create policy "invoices_insert" on public.invoices
  for insert with check (public.has_permission('can_register_payments'));

drop policy if exists "invoices_update" on public.invoices;
create policy "invoices_update" on public.invoices
  for update using (public.has_permission('can_register_payments'))
  with check (public.has_permission('can_register_payments'));

drop policy if exists "invoices_delete" on public.invoices;
create policy "invoices_delete" on public.invoices
  for delete using (public.has_permission('can_register_payments'));

drop policy if exists "invoice_lines_select" on public.invoice_lines;
create policy "invoice_lines_select" on public.invoice_lines
  for select using (public.has_permission('can_view_sales'));

drop policy if exists "invoice_lines_insert" on public.invoice_lines;
create policy "invoice_lines_insert" on public.invoice_lines
  for insert with check (public.has_permission('can_register_payments'));

drop policy if exists "invoice_lines_update" on public.invoice_lines;
create policy "invoice_lines_update" on public.invoice_lines
  for update using (public.has_permission('can_register_payments'))
  with check (public.has_permission('can_register_payments'));

drop policy if exists "invoice_lines_delete" on public.invoice_lines;
create policy "invoice_lines_delete" on public.invoice_lines
  for delete using (public.has_permission('can_register_payments'));

-- 5) Grants
grant select, insert, update, delete on public.invoices      to authenticated;
grant select, insert, update, delete on public.invoice_lines to authenticated;
grant all on public.invoices      to service_role;
grant all on public.invoice_lines to service_role;

-- 6) Índices
create index if not exists invoices_sale_idx       on public.invoices (sale_id);
create index if not exists invoices_series_idx     on public.invoices (series_id);
create index if not exists invoices_estado_idx     on public.invoices (estado);
create index if not exists invoices_created_idx    on public.invoices (created_at desc);
create index if not exists invoice_lines_invoice_idx on public.invoice_lines (invoice_id);
