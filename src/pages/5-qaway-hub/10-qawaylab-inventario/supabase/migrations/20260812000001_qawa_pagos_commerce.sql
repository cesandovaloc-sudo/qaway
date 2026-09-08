-- ============================================================
-- QA PAGOS — Integración del módulo @qawaylab/pago (repo 3-qawaylab-pagos)
-- en el proyecto de inventario (§47.2: cada dominio con un solo dueño)
--
-- Aplica SOLO el dominio commerce: orders, order_items, payments,
-- helpers, bucket de comprobantes y RLS coherente con pedidos de
-- invitado (checkout público sin login).
--
-- NO toca `products` (dominio del inventario) ni `users` (identidad
-- del inventario). El rol admin se lee desde public.users.
--
-- IDEMPOTENTE: se puede re-ejecutar sin riesgo.
-- Cómo usar: pegar en el SQL Editor de Supabase del proyecto
-- feagklyootogvdwgfmfr.supabase.co (o `supabase db push`).
-- ============================================================

-- 1) Helper updated_at
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) get_user_role: identidad del inventario (public.users) primero,
-- fallback a metadata de auth. (El schema genérico del módulo lee
-- raw_user_meta_data; aquí el inventario es la fuente de verdad de roles.)
create or replace function public.get_user_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role from public.users where id = auth.uid()),
    (select raw_user_meta_data ->> 'role' from auth.users where id = auth.uid()),
    'user'
  )
$$;

-- 3) Orders (user_id NULL = pedido de invitado sin sesión)
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
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

-- 4) Order items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid,
  product_type text,
  product_title text,
  quantity int not null default 1,
  unit_price decimal(10,2) not null,
  subtotal decimal(10,2) not null,
  created_at timestamptz default now()
);

-- FK opcional a products: solo si products.id existe y es uuid.
-- (El DDL real de products vive en el proyecto; este repo no lo define.)
do $$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'products'
      and column_name = 'id' and data_type = 'uuid'
  ) and not exists (
    select 1 from pg_constraint where conname = 'order_items_product_id_fkey'
  ) then
    alter table public.order_items
      add constraint order_items_product_id_fkey
      foreign key (product_id) references public.products(id) on delete set null;
  end if;
end $$;

-- 5) Payments (user_id NULL = pago de invitado)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
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

-- 6) Índices
create index if not exists idx_orders_user on public.orders(user_id);
create index if not exists idx_orders_status on public.orders(status);
create index if not exists idx_order_items_order on public.order_items(order_id);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_payments_order on public.payments(order_id);
create index if not exists idx_payments_status on public.payments(status);
create index if not exists idx_payments_provider on public.payments(provider);

-- 7) RLS: Orders
alter table public.orders enable row level security;

-- SELECT estricta: el módulo inserta pedidos de invitado SIN .select() (id
-- generado client-side), así los datos de invitados NO son legibles por anónimos.
drop policy if exists "orders_read_own_or_admin" on public.orders;
create policy "orders_read_own_or_admin" on public.orders for select
  using (auth.uid() = user_id or public.get_user_role() = 'admin');

drop policy if exists "orders_insert_user_or_guest" on public.orders;
create policy "orders_insert_user_or_guest" on public.orders for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "orders_update_own_pending" on public.orders;
create policy "orders_update_own_pending" on public.orders for update
  using (auth.uid() = user_id and status = 'pending');

drop policy if exists "orders_update_admin" on public.orders;
create policy "orders_update_admin" on public.orders for update
  using (public.get_user_role() = 'admin');

-- Helper security definer: verifica que una orden es de invitado (user_id NULL)
-- sin exponer la lectura de orders (SELECT estricta para proteger PII).
-- Un anónimo puede saber si un id es una orden de invitado, pero no leer su contenido.
create or replace function public.is_guest_order(check_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.orders where id = check_id and user_id is null)
$$;

-- 8) RLS: Order items
alter table public.order_items enable row level security;

drop policy if exists "order_items_read_own_or_admin" on public.order_items;
create policy "order_items_read_own_or_admin" on public.order_items for select
  using (exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
         or public.get_user_role() = 'admin');

drop policy if exists "order_items_insert_own_or_guest" on public.order_items;
create policy "order_items_insert_own_or_guest" on public.order_items for insert
  with check (exists (select 1 from public.orders where id = order_id and user_id = auth.uid())
              or public.is_guest_order(order_id));

drop policy if exists "order_items_update_admin" on public.order_items;
create policy "order_items_update_admin" on public.order_items for update
  using (public.get_user_role() = 'admin');

-- 9) RLS: Payments
alter table public.payments enable row level security;

drop policy if exists "payments_read_own_or_admin" on public.payments;
create policy "payments_read_own_or_admin" on public.payments for select
  using (auth.uid() = user_id or public.get_user_role() = 'admin');

drop policy if exists "payments_insert_user_or_guest" on public.payments;
create policy "payments_insert_user_or_guest" on public.payments for insert
  with check (auth.uid() = user_id or user_id is null);

drop policy if exists "payments_update_admin" on public.payments;
create policy "payments_update_admin" on public.payments for update
  using (public.get_user_role() = 'admin');

-- 9b) Grants: las tablas nuevas no tienen permisos por defecto para
-- anon/authenticated; se declaran explícitamente. anon solo lee y crea
-- (pedidos de invitado); authenticated opera sus propios registros.
grant select, insert on public.orders, public.order_items, public.payments to anon;
grant select, insert, update, delete on public.orders, public.order_items, public.payments to authenticated;
grant all on public.orders, public.order_items, public.payments to service_role;

-- 10) Trigger updated_at en payments
drop trigger if exists set_payments_updated_at on public.payments;
create trigger set_payments_updated_at
  before update on public.payments
  for each row execute function public.handle_updated_at();

-- 11) Bucket de comprobantes (vouchers) — lectura pública, subida para invitados,
-- límite de 10 MB por archivo (evita abuso de almacenamiento)
insert into storage.buckets (id, name, public, file_size_limit)
values ('resources', 'resources', true, 10485760)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

drop policy if exists "resources_public_read" on storage.objects;
create policy "resources_public_read" on storage.objects for select
  using (bucket_id = 'resources');

drop policy if exists "resources_public_insert" on storage.objects;
create policy "resources_public_insert" on storage.objects for insert
  with check (bucket_id = 'resources');
