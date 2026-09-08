-- ============================================================
-- COMPRAS, CAJA CHICA, GASTOS Y CONTABILIDAD
-- Módulos faltantes vs SUSII (brechas identificadas en REPORTE-COMPLETITUD.md)
--
-- Crea:
--   purchase_orders        (órdenes de compra a proveedores)
--   purchase_order_items   (líneas de la orden)
--   petty_cash_movements   (ingresos/egresos de caja chica)
--   expenses               (gastos operativos)
--   transactions           (libro de transacciones financieras)
--
-- IDEMPOTENTE: re-ejecutable sin riesgo.
-- ============================================================

-- 1) PURCHASE ORDERS
create table if not exists public.purchase_orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null,
  supplier_id     uuid references public.customers (id) on delete set null,
  supplier_name   text,
  subtotal        numeric not null default 0,
  igv_total       numeric not null default 0,
  total           numeric not null default 0,
  currency        text not null default 'PEN',
  status          text not null default 'draft',
  notes           text,
  created_by      uuid references public.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint purchase_orders_number_unique unique (order_number),
  constraint purchase_orders_status_check check (status in ('draft', 'pending', 'approved', 'received', 'cancelled'))
);

create unique index if not exists purchase_orders_number_idx on public.purchase_orders (order_number);

-- 2) PURCHASE ORDER ITEMS
create table if not exists public.purchase_order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.purchase_orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_title text not null,
  quantity      integer not null default 1,
  unit_price    numeric not null default 0,
  tax_code      text default '10',
  total         numeric not null default 0,
  created_at    timestamptz not null default now()
);

-- 3) PETTY CASH MOVEMENTS
create table if not exists public.petty_cash_movements (
  id            uuid primary key default gen_random_uuid(),
  type          text not null,
  description   text not null,
  amount        numeric not null default 0,
  reference     text,
  created_by    uuid references public.users (id) on delete set null,
  created_at    timestamptz not null default now(),
  constraint petty_cash_type_check check (type in ('ingreso', 'egreso'))
);

-- 4) EXPENSES
create table if not exists public.expenses (
  id            uuid primary key default gen_random_uuid(),
  description   text not null,
  category      text,
  amount        numeric not null default 0,
  expense_date  date not null default current_date,
  receipt_url   text,
  created_by    uuid references public.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

-- 5) TRANSACTIONS (libro contable)
create table if not exists public.transactions (
  id            uuid primary key default gen_random_uuid(),
  description   text not null,
  origin        text,
  account       text,
  amount        numeric not null default 0,
  reference_id  uuid,
  reference_type text,
  created_by    uuid references public.users (id) on delete set null,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- RLS Policies (idempotente)
-- ============================================================

-- Purchase Orders
alter table public.purchase_orders enable row level security;

do $$ begin
  create policy "purchase_orders_select" on public.purchase_orders for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "purchase_orders_insert" on public.purchase_orders for insert with check (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "purchase_orders_update" on public.purchase_orders for update using (true);
exception when duplicate_object then null;
end $$;

-- Purchase Order Items
alter table public.purchase_order_items enable row level security;

do $$ begin
  create policy "purchase_order_items_select" on public.purchase_order_items for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "purchase_order_items_insert" on public.purchase_order_items for insert with check (true);
exception when duplicate_object then null;
end $$;

-- Petty Cash
alter table public.petty_cash_movements enable row level security;

do $$ begin
  create policy "petty_cash_select" on public.petty_cash_movements for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "petty_cash_insert" on public.petty_cash_movements for insert with check (true);
exception when duplicate_object then null;
end $$;

-- Expenses
alter table public.expenses enable row level security;

do $$ begin
  create policy "expenses_select" on public.expenses for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "expenses_insert" on public.expenses for insert with check (true);
exception when duplicate_object then null;
end $$;

-- Transactions
alter table public.transactions enable row level security;

do $$ begin
  create policy "transactions_select" on public.transactions for select using (true);
exception when duplicate_object then null;
end $$;

do $$ begin
  create policy "transactions_insert" on public.transactions for insert with check (true);
exception when duplicate_object then null;
end $$;
