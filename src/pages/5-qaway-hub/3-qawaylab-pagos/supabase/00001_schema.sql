-- ============================================================
-- QA PAGOS by Qaway Lab — Schema
-- Migration 00001
-- Tablas: profiles, products, orders, order_items, payments
-- Compatible con cualquier proyecto del ecosistema Qaway Lab
-- ============================================================

-- ─── Helper functions ────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.get_user_role()
returns text
language sql
stable
as $$
  select coalesce(
    (select raw_user_meta_data ->> 'role' from auth.users where id = auth.uid()),
    'user'
  )
$$;

-- ─── Profiles (referenciada por orders, creada aquí para ser autonómo) ───

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admin read all profiles"
  on public.profiles for select
  using (public.get_user_role() = 'admin');

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

-- ─── Products (cursos, digitales, servicios, físicos) ────────

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  price decimal(10,2) not null default 0,
  compare_price decimal(10,2),
  image_url text,
  type text not null default 'digital' check (type in ('course', 'digital', 'service', 'physical')),
  category text,
  stock int not null default 0,
  status text not null default 'draft' check (status in ('active', 'draft', 'archived')),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Orders ──────────────────────────────────────────────────

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  -- user_id NULL = pedido de invitado (sin sesión); con sesión lleva el id de auth
  user_id uuid,
  status text not null default 'pending' check (status in ('pending', 'paid', 'cancelled', 'refunded')),
  total decimal(10,2) not null default 0,
  payment_method text check (payment_method in ('yape', 'card', 'pagoefectivo', 'directo', 'stripe', 'mercadopago')),
  shipping_address jsonb default null,
  notes text,
  created_at timestamptz default now(),
  paid_at timestamptz,
  cancelled_at timestamptz
);

-- ─── Order Items ─────────────────────────────────────────────

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_type text,
  product_title text,
  quantity int not null default 1,
  unit_price decimal(10,2) not null,
  subtotal decimal(10,2) not null,
  created_at timestamptz default now()
);

-- ─── Payments ────────────────────────────────────────────────

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  -- user_id NULL = pago de invitado (sin sesión)
  user_id uuid,
  order_id uuid references public.orders(id) on delete set null,
  product_id uuid,
  product_title text,
  amount decimal(10,2) not null default 0,
  currency text not null default 'PEN',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  provider text not null default 'manual' check (provider in ('stripe', 'culqi', 'mercadopago', 'manual', 'woocommerce')),
  provider_id text,
  proof_url text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ─── Indexes ─────────────────────────────────────────────────

create index if not exists idx_products_slug on public.products(slug);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_products_type on public.products(type);
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_provider on public.payments(provider);

-- ─── RLS: Products ───────────────────────────────────────────

alter table public.products enable row level security;

create policy "Anyone can read active products"
  on public.products for select
  using (status = 'active');

create policy "Admin can manage products"
  on public.products for all
  using (public.get_user_role() = 'admin');

-- ─── RLS: Orders ─────────────────────────────────────────────

alter table public.orders enable row level security;

-- SELECT estricta: el servicio inserta pedidos de invitado SIN .select()
-- (id generado client-side), así que no hace falta exponer filas de invitado
create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create orders" on public.orders;
create policy "Users can create orders"
  on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Users can update own pending orders"
  on public.orders for update
  using (auth.uid() = user_id and status = 'pending');

create policy "Admin can read all orders"
  on public.orders for select
  using (public.get_user_role() = 'admin');

create policy "Admin can update orders"
  on public.orders for update
  using (public.get_user_role() = 'admin');

-- ─── RLS: Order Items ────────────────────────────────────────

alter table public.order_items enable row level security;

create policy "Users can read own order items"
  on public.order_items for select
  using (exists (select 1 from public.orders where id = order_id and user_id = auth.uid()));

-- Helper security definer: verifica que una orden es de invitado (user_id NULL)
-- sin exponer la lectura de orders (la SELECT es estricta para proteger PII)
create or replace function public.is_guest_order(check_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.orders where id = check_id and user_id is null)
$$;

drop policy if exists "Users can create order items" on public.order_items;
create policy "Users can create order items"
  on public.order_items for insert
  with check (exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
              or public.is_guest_order(order_id));

create policy "Admin can read all order items"
  on public.order_items for select
  using (public.get_user_role() = 'admin');

create policy "Admin can update order items"
  on public.order_items for update
  using (public.get_user_role() = 'admin');

-- ─── RLS: Payments ───────────────────────────────────────────

alter table public.payments enable row level security;

create policy "Users can read own payments"
  on public.payments for select
  using (auth.uid() = user_id);

drop policy if exists "Users can create payments" on public.payments;
create policy "Users can create payments"
  on public.payments for insert
  with check (auth.uid() = user_id or user_id is null);

create policy "Admin can read all payments"
  on public.payments for select
  using (public.get_user_role() = 'admin');

-- ─── Grants ─────────────────────────────────────────────────
-- Las tablas nuevas NO tienen permisos por defecto para anon/authenticated;
-- se declaran explícitamente (en la plataforma Supabase los default privileges
-- suelen cubrirlo, pero no depende de ello).

grant select, insert on public.orders, public.order_items, public.payments to anon;
grant select, insert, update, delete on public.orders, public.order_items, public.payments to authenticated;
grant all on public.orders, public.order_items, public.payments to service_role;

grant select on public.products to anon;
grant select, insert, update, delete on public.products to authenticated;
grant all on public.products to service_role;

grant select on public.profiles to anon, authenticated;
grant all on public.profiles to service_role;

-- ─── Triggers ────────────────────────────────────────────────

-- Nota: Postgres no soporta `create trigger if not exists` (PG<18); se usa drop+create
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();
