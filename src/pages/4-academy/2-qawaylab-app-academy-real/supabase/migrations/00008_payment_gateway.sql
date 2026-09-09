-- Qaway Lab Payment Gateway - Products & Orders
-- Migration 00008
-- Run AFTER migration 00007
-- ============================================================

-- 1. Products (courses, digital goods, services, physical merch)
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  price decimal(10,2) not null default 0,
  compare_price decimal(10,2),  -- Precio antes de descuento (opcional)
  image_url text,
  type text not null default 'digital' check (type in ('course', 'digital', 'service', 'physical')),
  category text,
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  metadata jsonb default '{}',  -- peso, link_descarga, duracion_servicio, etc
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Orders (one order = multiple items)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'approved', 'shipped', 'cancelled')),
  total decimal(10,2) not null default 0,
  payment_method text check (payment_method in ('yape', 'card', 'pagoefectivo', 'directo')),
  notes text,
  shipping_address jsonb default null,
  created_at timestamptz default now(),
  paid_at timestamptz,
  approved_at timestamptz,
  approved_by uuid references public.profiles(id)
);

-- 3. Order items (line items within an order)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_type text, -- snapshot del tipo al momento de la compra
  product_title text, -- snapshot del título al momento de la compra
  quantity int not null default 1,
  unit_price decimal(10,2) not null,
  subtotal decimal(10,2) not null,
  created_at timestamptz default now()
);

-- 4. Modify existing payments table to support orders and manual payments
alter table public.payments
  add column if not exists order_id uuid references public.orders(id) on delete set null,
  add column if not exists proof_url text,       -- URL del comprobante (Pago Directo)
  add column if not exists approved_by uuid references public.profiles(id),
  add column if not exists notes text,
  alter column currency set default 'PEN',
  alter column course_id drop not null, -- payments can now be for any product
  add constraint payments_provider_check check (provider in ('culqi', 'manual', 'woocommerce'));

-- Indexes
create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_type on public.products(type);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_provider on public.payments(provider);

-- RLS: Enable on new tables
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- ============================================
-- PRODUCTS RLS
-- ============================================
-- Anyone can read active products
create policy "Anyone can read active products"
  on public.products for select
  using (status = 'active');

-- Admin can read/manage all products
create policy "Admin manage products"
  on public.products for all
  using (public.get_user_role() = 'admin');

-- ============================================
-- ORDERS RLS
-- ============================================
-- Users can read own orders
create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

-- Users can create own orders
create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

-- Admin can read all orders
create policy "Admin read all orders"
  on public.orders for select
  using (public.get_user_role() = 'admin');

-- Admin can update orders (approve Pago Directo, etc)
create policy "Admin update orders"
  on public.orders for update
  using (public.get_user_role() = 'admin');

-- ============================================
-- ORDER ITEMS RLS
-- ============================================
-- Users can read own order items (via order)
create policy "Users can read own order items"
  on public.order_items for select
  using (exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));

-- Users can create own order items
create policy "Users can create order items"
  on public.order_items for insert
  with check (exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));

-- Admin can read all order items
create policy "Admin read all order items"
  on public.order_items for select
  using (public.get_user_role() = 'admin');

-- Admin can update order items
create policy "Admin update order items"
  on public.order_items for update
  using (public.get_user_role() = 'admin');

-- ============================================
-- PAYMENTS RLS (add missing policies)
-- ============================================
-- Admin can update payments (approve Pago Directo)
create policy "Admin update payments"
  on public.payments for update
  using (public.get_user_role() = 'admin');

-- Auto-update trigger for products
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();
