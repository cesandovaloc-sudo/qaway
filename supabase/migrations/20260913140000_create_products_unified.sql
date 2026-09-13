-- ============================================================
-- UNIFIED PRODUCTS — Tabla de productos compatible con
-- 10-qawaylab-inventario y 3-qawaylab-pagos
-- ============================================================

create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  sku               text,
  name              text not null,
  title             text,
  slug              text unique,
  description       text,
  base_price        numeric not null default 0,
  price             numeric not null default 0,
  compare_price     numeric,
  image_url         text,
  images            jsonb default '[]'::jsonb,
  type              text not null default 'service',
  category          text,
  category_id       text,
  subcategory_id    text,
  brand             text,
  stock             numeric not null default 10,
  min_stock         numeric not null default 0,
  condition         int not null default 10,
  unit              text not null default 'UNIDAD',
  status            text not null default 'active',
  commercial_status text not null default 'available',
  metadata          jsonb default '{}'::jsonb,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Idempotencia para columnas
alter table public.products add column if not exists sku               text;
alter table public.products add column if not exists name              text;
alter table public.products add column if not exists title             text;
alter table public.products add column if not exists slug              text;
alter table public.products add column if not exists description       text;
alter table public.products add column if not exists base_price        numeric not null default 0;
alter table public.products add column if not exists price             numeric not null default 0;
alter table public.products add column if not exists compare_price     numeric;
alter table public.products add column if not exists image_url         text;
alter table public.products add column if not exists images            jsonb default '[]'::jsonb;
alter table public.products add column if not exists type              text not null default 'service';
alter table public.products add column if not exists category          text;
alter table public.products add column if not exists category_id       text;
alter table public.products add column if not exists subcategory_id    text;
alter table public.products add column if not exists brand             text;
alter table public.products add column if not exists stock             numeric not null default 10;
alter table public.products add column if not exists min_stock         numeric not null default 0;
alter table public.products add column if not exists condition         int not null default 10;
alter table public.products add column if not exists unit              text not null default 'UNIDAD';
alter table public.products add column if not exists status            text not null default 'active';
alter table public.products add column if not exists commercial_status text not null default 'available';
alter table public.products add column if not exists metadata          jsonb default '{}'::jsonb;
alter table public.products add column if not exists notes             text;
alter table public.products add column if not exists created_at        timestamptz not null default now();
alter table public.products add column if not exists updated_at        timestamptz not null default now();

-- Trigger para sincronizar title y name
create or replace function public.sync_product_title_name()
returns trigger language plpgsql as $$
begin
  if new.name is null and new.title is not null then
    new.name := new.title;
  elsif new.title is null and new.name is not null then
    new.title := new.name;
  end if;
  if new.price is null or new.price = 0 then
    new.price := coalesce(new.base_price, 0);
  end if;
  if new.base_price is null or new.base_price = 0 then
    new.base_price := coalesce(new.price, 0);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_sync_product_title_name on public.products;
create trigger trg_sync_product_title_name
  before insert or update on public.products
  for each row execute function public.sync_product_title_name();

-- Row Level Security
alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (true);

drop policy if exists "products_public_insert" on public.products;
create policy "products_public_insert" on public.products
  for insert with check (true);

drop policy if exists "products_public_update" on public.products;
create policy "products_public_update" on public.products
  for update using (true) with check (true);

drop policy if exists "products_public_delete" on public.products;
create policy "products_public_delete" on public.products
  for delete using (true);
