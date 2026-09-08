-- ============================================================
-- VENTAS AL CRÉDITO — POS de mostrador (FASE 2 del PLAN-IMPLEMENTACION-FISCAL.md)
--
-- Crea:
--   sales           (cabecera de venta, dominio propio del inventario)
--   sale_items      (líneas de la venta)
--   sale_payments   (pagos parciales / abonos)
--   next_sale_number()  correlativo sin huecos ni colisiones
--   trigger de stock    genera inventory_movements tipo 'sale' y descuenta stock
--
-- El ecommerce online (@qawaylab/pago) NO cambia: sigue creando `orders`.
-- La venta de mostrador vive en `sales`. El IGV queda en 0 hasta la FASE 3.
--
-- IDEMPOTENTE: re-ejecutable sin riesgo.
-- ============================================================

-- 1) SALES
create table if not exists public.sales (
  id             uuid primary key default gen_random_uuid(),
  sale_number    text not null,
  customer_id    uuid references public.customers (id) on delete set null,
  customer_name  text,
  doc_type       text,
  doc_number     text,
  fiscal_name    text,
  fiscal_address text,
  subtotal       numeric not null default 0,
  discount       numeric not null default 0,
  igv_total      numeric not null default 0,
  total          numeric not null default 0,
  currency       text not null default 'PEN',
  payment_status text not null default 'pagado',
  status         text not null default 'active',
  payment_method text,
  notes          text,
  created_by     uuid references public.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  paid_at        timestamptz,
  constraint sales_number_unique unique (sale_number),
  constraint sales_payment_status_check check (payment_status in ('pagado', 'deuda', 'parcial')),
  constraint sales_status_check check (status in ('active', 'cancelled'))
);

create unique index if not exists sales_sale_number_idx on public.sales (sale_number);

-- 2) SALE_ITEMS
create table if not exists public.sale_items (
  id            uuid primary key default gen_random_uuid(),
  sale_id       uuid not null references public.sales (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_title text not null,
  quantity      numeric not null default 1,
  unit_price    numeric not null default 0,
  subtotal      numeric not null default 0,
  tax_code      text default '10',
  unit_sunat    text default 'NIU'
);

-- 3) SALE_PAYMENTS
create table if not exists public.sale_payments (
  id          uuid primary key default gen_random_uuid(),
  sale_id     uuid not null references public.sales (id) on delete cascade,
  amount      numeric not null default 0,
  method      text not null default 'efectivo',
  received_at timestamptz not null default now(),
  created_by  uuid references public.users (id) on delete set null,
  notes       text,
  constraint sale_payments_method_check check (method in ('efectivo', 'yape', 'tarjeta', 'transferencia'))
);

-- 4) Correlativo de venta: sin huecos ni colisiones (bloqueo de asesoría
--    + máximo correlativo; equivalente transaccional al FOR UPDATE de series).
create or replace function public.next_sale_number()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  next_num integer;
begin
  perform pg_advisory_xact_lock(hashtext('qawaylab_sale_counter'));
  select coalesce(max(substring(sale_number from '[0-9]+$')::integer), 0) + 1
    into next_num
    from public.sales;
  return 'V-' || lpad(next_num::text, 6, '0');
end;
$$;

-- 5) Trigger: al insertar líneas → movimiento de inventario tipo 'sale'
--    y descuento de stock (solo si hay producto y la venta no está cancelada).
create or replace function public.apply_sale_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_number text;
  v_status      text;
begin
  if new.product_id is null then
    return new;
  end if;

  select sale_number, status into v_sale_number, v_status
    from public.sales
    where id = new.sale_id;

  if v_status = 'cancelled' then
    return new;
  end if;

  insert into public.inventory_movements (product_id, type, quantity, reference, notes, created_by)
  values (new.product_id, 'sale', -new.quantity, v_sale_number, 'Venta ' || v_sale_number, auth.uid());

  update public.products
     set stock = stock - new.quantity,
         commercial_status = case
           when stock - new.quantity <= 0 then 'sold'
           else commercial_status
         end
   where id = new.product_id;

  return new;
end;
$$;

drop trigger if exists sale_items_apply_stock on public.sale_items;
create trigger sale_items_apply_stock
  after insert on public.sale_items
  for each row execute procedure public.apply_sale_stock();

-- 5b) Restaurar stock al anular una venta (llamado desde el servicio)
create or replace function public.restore_stock(p_product_id uuid, p_quantity numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.products
     set stock = stock + p_quantity,
         commercial_status = case
           when stock + p_quantity > 0 and commercial_status = 'sold' then 'available'
           else commercial_status
         end
   where id = p_product_id;
end;
$$;

-- 6) RLS
alter table public.sales         enable row level security;
alter table public.sale_items    enable row level security;
alter table public.sale_payments enable row level security;

drop policy if exists "sales_select" on public.sales;
create policy "sales_select" on public.sales
  for select using (public.has_permission('can_view_sales'));

drop policy if exists "sales_insert" on public.sales;
create policy "sales_insert" on public.sales
  for insert with check (public.has_permission('can_create_sales'));

drop policy if exists "sales_update" on public.sales;
create policy "sales_update" on public.sales
  for update using (public.has_permission('can_create_sales'))
  with check (public.has_permission('can_create_sales'));

drop policy if exists "sales_delete" on public.sales;
create policy "sales_delete" on public.sales
  for delete using (public.has_permission('can_create_sales'));

drop policy if exists "sale_items_select" on public.sale_items;
create policy "sale_items_select" on public.sale_items
  for select using (public.has_permission('can_view_sales'));

drop policy if exists "sale_items_insert" on public.sale_items;
create policy "sale_items_insert" on public.sale_items
  for insert with check (public.has_permission('can_create_sales'));

drop policy if exists "sale_items_update" on public.sale_items;
create policy "sale_items_update" on public.sale_items
  for update using (public.has_permission('can_create_sales'))
  with check (public.has_permission('can_create_sales'));

drop policy if exists "sale_items_delete" on public.sale_items;
create policy "sale_items_delete" on public.sale_items
  for delete using (public.has_permission('can_create_sales'));

drop policy if exists "sale_payments_select" on public.sale_payments;
create policy "sale_payments_select" on public.sale_payments
  for select using (public.has_permission('can_view_sales'));

drop policy if exists "sale_payments_insert" on public.sale_payments;
create policy "sale_payments_insert" on public.sale_payments
  for insert with check (public.has_permission('can_register_payments'));

drop policy if exists "sale_payments_update" on public.sale_payments;
create policy "sale_payments_update" on public.sale_payments
  for update using (public.has_permission('can_register_payments'))
  with check (public.has_permission('can_register_payments'));

drop policy if exists "sale_payments_delete" on public.sale_payments;
create policy "sale_payments_delete" on public.sale_payments
  for delete using (public.has_permission('can_register_payments'));

-- 7) Grants
grant select, insert, update, delete on public.sales         to authenticated;
grant select, insert, update, delete on public.sale_items    to authenticated;
grant select, insert, update, delete on public.sale_payments to authenticated;
grant all on public.sales         to service_role;
grant all on public.sale_items    to service_role;
grant all on public.sale_payments to service_role;

-- 8) Índices
create index if not exists sales_customer_idx       on public.sales (customer_id);
create index if not exists sales_payment_status_idx on public.sales (payment_status);
create index if not exists sales_created_idx        on public.sales (created_at desc);
create index if not exists sale_items_product_idx   on public.sale_items (product_id);
create index if not exists sale_payments_sale_idx   on public.sale_payments (sale_id);
