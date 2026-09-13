-- ============================================================
-- BASELINE INVENTARIO — Versión del schema de inventario que
-- hasta ahora se aplicó DIRECTAMENTE en Supabase (sin versionar).
-- -----------------------------------------------------------------
-- Objetivo (FASE 0.1 de PLAN-IMPLEMENTACION-FISCAL.md): eliminar el
-- riesgo de drift. La migración:
--   1) Crea las tablas en entornos nuevos (create table if not exists)
--   2) CONVERGE entornos existentes: cada columna se agrega con
--      `add column if not exists` (no rompe lo que ya está)
--   3) Reconstruye tipos/constraints/índices con nombres estables
--
-- Reconstruido desde los TIPOS y SERVICIOS del repo (src/types,
-- src/services, src/test) — no desde un pg_dump. Si en la BD real
-- existen columnas adicionales no cubiertas aquí, este baseline NO
-- las borra (los ALTER solo agregan): se detectan comparando con
-- `pg_dump --schema-only` y se suman en una migración de ajuste.
--
-- ⚠️ TAREAS PENDIENTES (documentadas, no resueltas aquí):
--   • Políticas RLS reales de estas tablas (aplicadas directo en la
--     BD) NO se versionan: adivinarlas podría romper o abrir acceso.
--     Se dejan como tarea explícita de revisión.
--   • Grants anon para catálogos públicos (/remates/:slug) pendientes
--     de definir con cuidado (no exponer el inventario completo).
--   • `users`, `orders`, `order_items`, `payments` ya están versionadas
--     en 20260812000000 y 20260812000001 — no se duplican aquí.
--
-- IDEMPOTENTE: re-ejecutable sin riesgo.
-- ============================================================

-- ============================================================
-- 1) CATEGORIES (árbol con parent_id)
-- ============================================================
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text not null,
  parent_id  uuid references public.categories (id) on delete set null,
  icon       text,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);
alter table public.categories add column if not exists name       text;
alter table public.categories add column if not exists slug       text;
alter table public.categories add column if not exists parent_id  uuid references public.categories (id) on delete set null;
alter table public.categories add column if not exists icon       text;
alter table public.categories add column if not exists sort_order int  not null default 0;
alter table public.categories add column if not exists created_at timestamptz not null default now();
create index if not exists categories_parent_idx on public.categories (parent_id);
create index if not exists categories_slug_idx   on public.categories (slug);

-- ============================================================
-- 2) INVENTORY_LOCATIONS (almacenes/zonas; la app usa `slug`)
-- ============================================================
create table if not exists public.inventory_locations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text,
  code       text,
  type       text not null default 'warehouse',
  parent_id  uuid references public.inventory_locations (id) on delete set null,
  address    text,
  created_at timestamptz not null default now(),
  constraint inventory_locations_type_check
    check (type in ('warehouse', 'room', 'office', 'depot', 'project', 'shelf', 'zone'))
);
alter table public.inventory_locations add column if not exists name       text;
alter table public.inventory_locations add column if not exists slug       text;
alter table public.inventory_locations add column if not exists code       text;
alter table public.inventory_locations add column if not exists type       text;
alter table public.inventory_locations add column if not exists parent_id  uuid references public.inventory_locations (id) on delete set null;
alter table public.inventory_locations add column if not exists address    text;
alter table public.inventory_locations add column if not exists created_at timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'inventory_locations_type_check' and conrelid = 'public.inventory_locations'::regclass) then
    alter table public.inventory_locations add constraint inventory_locations_type_check
      check (type in ('warehouse', 'room', 'office', 'depot', 'project', 'shelf', 'zone'));
  end if;
end $$;
create index if not exists inventory_locations_parent_idx on public.inventory_locations (parent_id);

-- ============================================================
-- 3) PRODUCTS
--    `stock` existe en BD (lo usa dashboard y la importación Excel)
--    aunque el tipo TS no lo exponga. `category` (text) es columna
--    legacy usada por factories de test; la app usa category_id.
-- ============================================================
create table if not exists public.products (
  id                uuid primary key default gen_random_uuid(),
  sku               text not null,
  name              text not null,
  slug              text not null,
  description       text,
  category_id       uuid references public.categories (id) on delete set null,
  subcategory_id    uuid references public.categories (id) on delete set null,
  category          text,
  brand             text,
  type              text not null default 'simple',
  status            text not null default 'active',
  condition         int  not null default 5,
  unit              text not null default 'UNIDAD',
  min_stock         numeric not null default 0,
  stock             numeric not null default 0,
  location_id       uuid references public.inventory_locations (id) on delete set null,
  cost              numeric,
  base_price        numeric,
  commercial_status text not null default 'available',
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  constraint products_type_check
    check (type in ('simple', 'variant', 'composite')),
  constraint products_status_check
    check (status in ('active', 'inactive', 'archived')),
  constraint products_commercial_status_check
    check (commercial_status in ('available', 'reserved', 'sold', 'out_of_stock', 'unavailable')),
  constraint products_condition_check
    check (condition between 1 and 10)
);
alter table public.products add column if not exists sku               text;
alter table public.products add column if not exists name              text;
alter table public.products add column if not exists slug              text;
alter table public.products add column if not exists description       text;
alter table public.products add column if not exists category_id       uuid references public.categories (id) on delete set null;
alter table public.products add column if not exists subcategory_id    uuid references public.categories (id) on delete set null;
alter table public.products add column if not exists category          text;
alter table public.products add column if not exists brand             text;
alter table public.products add column if not exists type              text not null default 'simple';
alter table public.products add column if not exists status            text not null default 'active';
alter table public.products add column if not exists condition         int  not null default 5;
alter table public.products add column if not exists unit              text not null default 'UNIDAD';
alter table public.products add column if not exists min_stock         numeric not null default 0;
alter table public.products add column if not exists stock             numeric not null default 0;
alter table public.products add column if not exists location_id       uuid references public.inventory_locations (id) on delete set null;
alter table public.products add column if not exists cost              numeric;
alter table public.products add column if not exists base_price        numeric;
alter table public.products add column if not exists commercial_status text not null default 'available';
alter table public.products add column if not exists notes             text;
alter table public.products add column if not exists created_at        timestamptz not null default now();
alter table public.products add column if not exists updated_at        timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'products_type_check' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_type_check check (type in ('simple', 'variant', 'composite'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_status_check' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_status_check check (status in ('active', 'inactive', 'archived'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_commercial_status_check' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_commercial_status_check
      check (commercial_status in ('available', 'reserved', 'sold', 'out_of_stock', 'unavailable'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'products_condition_check' and conrelid = 'public.products'::regclass) then
    alter table public.products add constraint products_condition_check check (condition between 1 and 10);
  end if;
end $$;
create index if not exists products_sku_idx             on public.products (sku);
create index if not exists products_slug_idx            on public.products (slug);
create index if not exists products_category_id_idx     on public.products (category_id);
create index if not exists products_subcategory_id_idx  on public.products (subcategory_id);
create index if not exists products_status_idx          on public.products (status);
create index if not exists products_commercial_status_idx on public.products (commercial_status);
create index if not exists products_location_id_idx     on public.products (location_id);

-- Trigger updated_at (el helper handle_updated_at lo define la migración commerce)
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
drop trigger if exists set_products_updated_at on public.products;
create trigger set_products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- ============================================================
-- 4) PRODUCT_VARIANTS
-- ============================================================
create table if not exists public.product_variants (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name       text not null,
  sku        text not null,
  attributes jsonb not null default '{}'::jsonb,
  stock      numeric not null default 0,
  cost       numeric,
  price      numeric,
  condition  int  not null default 5,
  created_at timestamptz not null default now()
);
alter table public.product_variants add column if not exists product_id uuid not null references public.products (id) on delete cascade;
alter table public.product_variants add column if not exists name       text;
alter table public.product_variants add column if not exists sku        text;
alter table public.product_variants add column if not exists attributes jsonb not null default '{}'::jsonb;
alter table public.product_variants add column if not exists stock      numeric not null default 0;
alter table public.product_variants add column if not exists cost       numeric;
alter table public.product_variants add column if not exists price      numeric;
alter table public.product_variants add column if not exists condition  int  not null default 5;
alter table public.product_variants add column if not exists created_at timestamptz not null default now();
create index if not exists product_variants_product_idx on public.product_variants (product_id);

-- ============================================================
-- 5) PRODUCT_IMAGES
-- ============================================================
create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  original_url  text not null,
  processed_url text,
  is_primary    boolean not null default false,
  alt           text,
  sort_order    int  not null default 0,
  created_at    timestamptz not null default now()
);
alter table public.product_images add column if not exists product_id    uuid not null references public.products (id) on delete cascade;
alter table public.product_images add column if not exists original_url  text;
alter table public.product_images add column if not exists processed_url text;
alter table public.product_images add column if not exists is_primary    boolean not null default false;
alter table public.product_images add column if not exists alt           text;
alter table public.product_images add column if not exists sort_order    int  not null default 0;
alter table public.product_images add column if not exists created_at    timestamptz not null default now();
create index if not exists product_images_product_idx on public.product_images (product_id);

-- ============================================================
-- 6) INVENTORY_MOVEMENTS
--    `reference` (documento origen: venta/compra) la usa la
--    FASE 2 del plan fiscal — se incluye ya como columna opcional.
-- ============================================================
create table if not exists public.inventory_movements (
  id                uuid primary key default gen_random_uuid(),
  product_id        uuid not null references public.products (id) on delete cascade,
  variant_id        uuid references public.product_variants (id) on delete set null,
  type              text not null default 'adjustment',
  quantity          numeric not null default 0,
  from_location_id  uuid references public.inventory_locations (id) on delete set null,
  to_location_id    uuid references public.inventory_locations (id) on delete set null,
  reference         text,
  notes             text,
  created_by        uuid references public.users (id) on delete set null,
  created_at        timestamptz not null default now(),
  constraint inventory_movements_type_check
    check (type in ('entry', 'exit', 'transfer', 'adjustment', 'sale', 'reservation'))
);
alter table public.inventory_movements add column if not exists product_id       uuid;
alter table public.inventory_movements add column if not exists variant_id       uuid references public.product_variants (id) on delete set null;
alter table public.inventory_movements add column if not exists type             text not null default 'adjustment';
alter table public.inventory_movements add column if not exists quantity         numeric not null default 0;
alter table public.inventory_movements add column if not exists from_location_id uuid references public.inventory_locations (id) on delete set null;
alter table public.inventory_movements add column if not exists to_location_id   uuid references public.inventory_locations (id) on delete set null;
alter table public.inventory_movements add column if not exists reference        text;
alter table public.inventory_movements add column if not exists notes            text;
alter table public.inventory_movements add column if not exists created_by       uuid references public.users (id) on delete set null;
alter table public.inventory_movements add column if not exists created_at       timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'inventory_movements_type_check' and conrelid = 'public.inventory_movements'::regclass) then
    alter table public.inventory_movements add constraint inventory_movements_type_check
      check (type in ('entry', 'exit', 'transfer', 'adjustment', 'sale', 'reservation'));
  end if;
end $$;
create index if not exists inventory_movements_product_idx on public.inventory_movements (product_id);
create index if not exists inventory_movements_type_idx    on public.inventory_movements (type);
create index if not exists inventory_movements_created_idx on public.inventory_movements (created_at desc);

-- ============================================================
-- 7) PRICE_LISTS
-- ============================================================
create table if not exists public.price_lists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null default 'normal',
  is_active   boolean not null default true,
  description text,
  created_at  timestamptz not null default now(),
  constraint price_lists_type_check
    check (type in ('normal', 'wholesale', 'offer', 'liquidation', 'institutional', 'campaign'))
);
alter table public.price_lists add column if not exists name        text;
alter table public.price_lists add column if not exists type        text not null default 'normal';
alter table public.price_lists add column if not exists is_active   boolean not null default true;
alter table public.price_lists add column if not exists description text;
alter table public.price_lists add column if not exists created_at  timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'price_lists_type_check' and conrelid = 'public.price_lists'::regclass) then
    alter table public.price_lists add constraint price_lists_type_check
      check (type in ('normal', 'wholesale', 'offer', 'liquidation', 'institutional', 'campaign'));
  end if;
end $$;

-- ============================================================
-- 8) PRODUCT_PRICES
--    El upsert del servicio usa onConflict
--    'product_id,price_list_id,min_quantity' → requiere constraint
--    único sobre esas 3 columnas (imprescindible para que funcione).
-- ============================================================
create table if not exists public.product_prices (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  price_list_id uuid not null references public.price_lists (id) on delete cascade,
  price         numeric not null default 0,
  min_quantity  numeric not null default 1,
  valid_from    timestamptz,
  valid_to      timestamptz,
  constraint product_prices_unique unique (product_id, price_list_id, min_quantity)
);
alter table public.product_prices add column if not exists product_id    uuid;
alter table public.product_prices add column if not exists price_list_id uuid;
alter table public.product_prices add column if not exists price         numeric not null default 0;
alter table public.product_prices add column if not exists min_quantity  numeric not null default 1;
alter table public.product_prices add column if not exists valid_from    timestamptz;
alter table public.product_prices add column if not exists valid_to      timestamptz;
create unique index if not exists product_prices_unique_idx
  on public.product_prices (product_id, price_list_id, min_quantity);

-- ============================================================
-- 9) CUSTOMERS (incluye documento fiscal — ver 20260813000002)
--    La función validate_doc_number se define aquí (create or replace)
--    para que el baseline funcione en entornos nuevos ANTES de que
--    corra la migración fiscal; la 20260813000002 la re-define igual.
-- ============================================================
create or replace function public.validate_doc_number(doc_type text, doc_number text)
returns boolean
language plpgsql
immutable
as $$
declare
  weights int[] := array[5, 4, 3, 2, 7, 6, 5, 4, 3, 2];
  total int := 0;
  remainder int;
  check_digit int;
  i int;
begin
  if doc_number is null or trim(doc_number) = '' then
    return true;
  end if;

  case doc_type
    when 'DNI' then
      return doc_number ~ '^[0-9]{8}$';
    when 'RUC' then
      if not doc_number ~ '^[0-9]{11}$' then
        return false;
      end if;
      for i in 1..10 loop
        total := total + (substring(doc_number from i for 1)::int * weights[i]);
      end loop;
      remainder := total % 11;
      check_digit := case when remainder = 0 then 0 else 11 - remainder end;
      return check_digit = substring(doc_number from 11 for 1)::int;
    when 'CE' then
      return doc_number ~ '^[0-9A-Za-z]{8,12}$';
    when 'PASAPORTE' then
      return char_length(doc_number) between 6 and 15;
    else
      return true;
  end case;
end;
$$;

create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  company     text,
  email       text,
  phone       text,
  type        text not null default 'individual',
  doc_type    text not null default 'SIN_DOC',
  doc_number  text,
  fiscal_name text,
  address     text,
  extra_data  jsonb,
  notes       text,
  created_at  timestamptz not null default now(),
  constraint customers_type_check
    check (type in ('individual', 'company', 'wholesale', 'reseller')),
  constraint customers_doc_type_check
    check (doc_type in ('DNI', 'RUC', 'CE', 'PASAPORTE', 'SIN_DOC')),
  constraint customers_doc_number_check
    check (public.validate_doc_number(doc_type, doc_number))
);
alter table public.customers add column if not exists name        text;
alter table public.customers add column if not exists company     text;
alter table public.customers add column if not exists email       text;
alter table public.customers add column if not exists phone       text;
alter table public.customers add column if not exists type        text not null default 'individual';
alter table public.customers add column if not exists doc_type    text not null default 'SIN_DOC';
alter table public.customers add column if not exists doc_number  text;
alter table public.customers add column if not exists fiscal_name text;
alter table public.customers add column if not exists address     text;
alter table public.customers add column if not exists extra_data  jsonb;
alter table public.customers add column if not exists notes       text;
alter table public.customers add column if not exists created_at  timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'customers_type_check' and conrelid = 'public.customers'::regclass) then
    alter table public.customers add constraint customers_type_check
      check (type in ('individual', 'company', 'wholesale', 'reseller'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'customers_doc_type_check' and conrelid = 'public.customers'::regclass) then
    alter table public.customers add constraint customers_doc_type_check
      check (doc_type in ('DNI', 'RUC', 'CE', 'PASAPORTE', 'SIN_DOC'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'customers_doc_number_check' and conrelid = 'public.customers'::regclass) then
    alter table public.customers add constraint customers_doc_number_check
      check (public.validate_doc_number(doc_type, doc_number));
  end if;
end $$;
create unique index if not exists customers_doc_unique
  on public.customers (doc_type, doc_number)
  where doc_type is not null
    and doc_type <> 'SIN_DOC'
    and doc_number is not null
    and doc_number <> '';
create index if not exists customers_doc_number_idx on public.customers (doc_number);

-- ============================================================
-- 10) BUNDLES
-- ============================================================
create table if not exists public.bundles (
  id                    uuid primary key default gen_random_uuid(),
  name                  text not null,
  sku                   text not null,
  description           text,
  image_url             text,
  total_individual_price numeric not null default 0,
  bundle_price          numeric not null default 0,
  discount              numeric not null default 0,
  status                text not null default 'active',
  created_at            timestamptz not null default now(),
  constraint bundles_status_check
    check (status in ('active', 'inactive', 'archived'))
);
alter table public.bundles add column if not exists name                   text;
alter table public.bundles add column if not exists sku                    text;
alter table public.bundles add column if not exists description            text;
alter table public.bundles add column if not exists image_url              text;
alter table public.bundles add column if not exists total_individual_price numeric not null default 0;
alter table public.bundles add column if not exists bundle_price           numeric not null default 0;
alter table public.bundles add column if not exists discount               numeric not null default 0;
alter table public.bundles add column if not exists status                 text not null default 'active';
alter table public.bundles add column if not exists created_at             timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'bundles_status_check' and conrelid = 'public.bundles'::regclass) then
    alter table public.bundles add constraint bundles_status_check
      check (status in ('active', 'inactive', 'archived'));
  end if;
end $$;

-- ============================================================
-- 11) BUNDLE_ITEMS
-- ============================================================
create table if not exists public.bundle_items (
  id         uuid primary key default gen_random_uuid(),
  bundle_id  uuid not null references public.bundles (id) on delete cascade,
  product_id uuid references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  quantity   numeric not null default 1
);
alter table public.bundle_items add column if not exists bundle_id  uuid;
alter table public.bundle_items add column if not exists product_id uuid references public.products (id) on delete cascade;
alter table public.bundle_items add column if not exists variant_id uuid references public.product_variants (id) on delete set null;
alter table public.bundle_items add column if not exists quantity   numeric not null default 1;
create index if not exists bundle_items_bundle_idx  on public.bundle_items (bundle_id);
create index if not exists bundle_items_product_idx on public.bundle_items (product_id);

-- ============================================================
-- 12) QUOTATIONS
-- ============================================================
create table if not exists public.quotations (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  status      text not null default 'draft',
  subtotal    numeric not null default 0,
  discount    numeric not null default 0,
  total       numeric not null default 0,
  valid_until timestamptz,
  notes       text,
  created_at  timestamptz not null default now(),
  constraint quotations_status_check
    check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired'))
);
alter table public.quotations add column if not exists customer_id uuid references public.customers (id) on delete set null;
alter table public.quotations add column if not exists status      text not null default 'draft';
alter table public.quotations add column if not exists subtotal    numeric not null default 0;
alter table public.quotations add column if not exists discount    numeric not null default 0;
alter table public.quotations add column if not exists total       numeric not null default 0;
alter table public.quotations add column if not exists valid_until timestamptz;
alter table public.quotations add column if not exists notes       text;
alter table public.quotations add column if not exists created_at  timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'quotations_status_check' and conrelid = 'public.quotations'::regclass) then
    alter table public.quotations add constraint quotations_status_check
      check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired'));
  end if;
end $$;
create index if not exists quotations_customer_idx on public.quotations (customer_id);
create index if not exists quotations_status_idx   on public.quotations (status);

-- ============================================================
-- 13) QUOTATION_ITEMS
-- ============================================================
create table if not exists public.quotation_items (
  id           uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  product_id   uuid references public.products (id) on delete set null,
  bundle_id    uuid references public.bundles (id) on delete set null,
  quantity     numeric not null default 1,
  unit_price   numeric not null default 0,
  discount     numeric not null default 0,
  subtotal     numeric not null default 0
);
alter table public.quotation_items add column if not exists quotation_id uuid;
alter table public.quotation_items add column if not exists product_id   uuid references public.products (id) on delete set null;
alter table public.quotation_items add column if not exists bundle_id    uuid references public.bundles (id) on delete set null;
alter table public.quotation_items add column if not exists quantity     numeric not null default 1;
alter table public.quotation_items add column if not exists unit_price   numeric not null default 0;
alter table public.quotation_items add column if not exists discount     numeric not null default 0;
alter table public.quotation_items add column if not exists subtotal     numeric not null default 0;
create index if not exists quotation_items_quotation_idx on public.quotation_items (quotation_id);

-- ============================================================
-- 14) LIQUIDATION_CAMPAIGNS
--    `catalog_id` (uuid suelto, sin FK) es columna legacy que la
--    app no escribe (el vínculo real es catalogs.campaign_id).
-- ============================================================
create table if not exists public.liquidation_campaigns (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  start_date    timestamptz,
  end_date      timestamptz,
  status        text not null default 'draft',
  discount_type text,
  catalog_id    uuid,
  created_at    timestamptz not null default now(),
  constraint liquidation_campaigns_status_check
    check (status in ('draft', 'preparing', 'active', 'paused', 'finished', 'archived'))
);
alter table public.liquidation_campaigns add column if not exists name          text;
alter table public.liquidation_campaigns add column if not exists description   text;
alter table public.liquidation_campaigns add column if not exists start_date    timestamptz;
alter table public.liquidation_campaigns add column if not exists end_date      timestamptz;
alter table public.liquidation_campaigns add column if not exists status        text not null default 'draft';
alter table public.liquidation_campaigns add column if not exists discount_type text;
alter table public.liquidation_campaigns add column if not exists catalog_id    uuid;
alter table public.liquidation_campaigns add column if not exists created_at    timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'liquidation_campaigns_status_check' and conrelid = 'public.liquidation_campaigns'::regclass) then
    alter table public.liquidation_campaigns add constraint liquidation_campaigns_status_check
      check (status in ('draft', 'preparing', 'active', 'paused', 'finished', 'archived'));
  end if;
end $$;

-- ============================================================
-- 15) LIQUIDATION_ITEMS
-- ============================================================
create table if not exists public.liquidation_items (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid not null references public.liquidation_campaigns (id) on delete cascade,
  product_id        uuid references public.products (id) on delete cascade,
  liquidation_price numeric,
  package_price     numeric,
  max_quantity      numeric
);
alter table public.liquidation_items add column if not exists campaign_id       uuid;
alter table public.liquidation_items add column if not exists product_id        uuid references public.products (id) on delete cascade;
alter table public.liquidation_items add column if not exists liquidation_price numeric;
alter table public.liquidation_items add column if not exists package_price     numeric;
alter table public.liquidation_items add column if not exists max_quantity      numeric;
create index if not exists liquidation_items_campaign_idx on public.liquidation_items (campaign_id);
create index if not exists liquidation_items_product_idx  on public.liquidation_items (product_id);

-- ============================================================
-- 16) CATALOGS
-- ============================================================
create table if not exists public.catalogs (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid references public.liquidation_campaigns (id) on delete set null,
  name        text not null,
  slug        text not null,
  description text,
  is_public   boolean not null default false,
  template    text not null default 'professional',
  pdf_url     text,
  public_url  text,
  created_at  timestamptz not null default now(),
  constraint catalogs_template_check
    check (template in ('minimal', 'professional', 'premium'))
);
alter table public.catalogs add column if not exists campaign_id uuid references public.liquidation_campaigns (id) on delete set null;
alter table public.catalogs add column if not exists name        text;
alter table public.catalogs add column if not exists slug        text;
alter table public.catalogs add column if not exists description text;
alter table public.catalogs add column if not exists is_public   boolean not null default false;
alter table public.catalogs add column if not exists template    text not null default 'professional';
alter table public.catalogs add column if not exists pdf_url     text;
alter table public.catalogs add column if not exists public_url  text;
alter table public.catalogs add column if not exists created_at  timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'catalogs_template_check' and conrelid = 'public.catalogs'::regclass) then
    alter table public.catalogs add constraint catalogs_template_check
      check (template in ('minimal', 'professional', 'premium'));
  end if;
end $$;
create index if not exists catalogs_slug_idx     on public.catalogs (slug);
create index if not exists catalogs_campaign_idx on public.catalogs (campaign_id);
create index if not exists catalogs_public_idx   on public.catalogs (is_public);

-- ============================================================
-- 17) CATALOG_ITEMS
-- ============================================================
create table if not exists public.catalog_items (
  id               uuid primary key default gen_random_uuid(),
  catalog_id       uuid not null references public.catalogs (id) on delete cascade,
  product_id       uuid references public.products (id) on delete cascade,
  bundle_id        uuid references public.bundles (id) on delete set null,
  sort_order       int not null default 0,
  show_price       boolean not null default true,
  show_description boolean not null default true
);
alter table public.catalog_items add column if not exists catalog_id       uuid;
alter table public.catalog_items add column if not exists product_id       uuid references public.products (id) on delete cascade;
alter table public.catalog_items add column if not exists bundle_id        uuid references public.bundles (id) on delete set null;
alter table public.catalog_items add column if not exists sort_order       int not null default 0;
alter table public.catalog_items add column if not exists show_price       boolean not null default true;
alter table public.catalog_items add column if not exists show_description boolean not null default true;
create index if not exists catalog_items_catalog_idx on public.catalog_items (catalog_id);
create index if not exists catalog_items_product_idx on public.catalog_items (product_id);

-- ============================================================
-- 18) AI_SUGGESTIONS
-- ============================================================
create table if not exists public.ai_suggestions (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  type       text not null,
  value      text not null,
  confidence text not null default 'medium',
  source     text not null default 'ai',
  status     text not null default 'pending',
  created_at timestamptz not null default now(),
  constraint ai_suggestions_type_check
    check (type in ('product_name', 'category', 'description', 'attributes', 'condition', 'price', 'bundle')),
  constraint ai_suggestions_confidence_check
    check (confidence in ('high', 'medium', 'low')),
  constraint ai_suggestions_status_check
    check (status in ('pending', 'approved', 'rejected'))
);
alter table public.ai_suggestions add column if not exists product_id uuid references public.products (id) on delete set null;
alter table public.ai_suggestions add column if not exists type       text;
alter table public.ai_suggestions add column if not exists value      text;
alter table public.ai_suggestions add column if not exists confidence text not null default 'medium';
alter table public.ai_suggestions add column if not exists source     text not null default 'ai';
alter table public.ai_suggestions add column if not exists status     text not null default 'pending';
alter table public.ai_suggestions add column if not exists created_at timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'ai_suggestions_type_check' and conrelid = 'public.ai_suggestions'::regclass) then
    alter table public.ai_suggestions add constraint ai_suggestions_type_check
      check (type in ('product_name', 'category', 'description', 'attributes', 'condition', 'price', 'bundle'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ai_suggestions_confidence_check' and conrelid = 'public.ai_suggestions'::regclass) then
    alter table public.ai_suggestions add constraint ai_suggestions_confidence_check
      check (confidence in ('high', 'medium', 'low'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'ai_suggestions_status_check' and conrelid = 'public.ai_suggestions'::regclass) then
    alter table public.ai_suggestions add constraint ai_suggestions_status_check
      check (status in ('pending', 'approved', 'rejected'));
  end if;
end $$;

-- ============================================================
-- 19) PRICING_RULES
--    Shape real usado por pricingRulesService (condition jsonb +
--    discount_type + value). El tipo alternativo de src/types/index.ts
--    (condition_field/action_type…) no lo usa ningún servicio: no se
--    replica en BD.
-- ============================================================
create table if not exists public.pricing_rules (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  type          text not null,
  condition     jsonb not null default '{}'::jsonb,
  discount_type text not null default 'percentage',
  value         numeric not null default 0,
  priority      int  not null default 0,
  is_active     boolean not null default true,
  valid_from    timestamptz,
  valid_to      timestamptz,
  created_at    timestamptz not null default now(),
  constraint pricing_rules_type_check
    check (type in ('quantity', 'date', 'customer', 'product', 'campaign', 'global')),
  constraint pricing_rules_discount_type_check
    check (discount_type in ('percentage', 'fixed', 'fixed_price'))
);
alter table public.pricing_rules add column if not exists name          text;
alter table public.pricing_rules add column if not exists type          text;
alter table public.pricing_rules add column if not exists condition     jsonb not null default '{}'::jsonb;
alter table public.pricing_rules add column if not exists discount_type text not null default 'percentage';
alter table public.pricing_rules add column if not exists value         numeric not null default 0;
alter table public.pricing_rules add column if not exists priority      int  not null default 0;
alter table public.pricing_rules add column if not exists is_active     boolean not null default true;
alter table public.pricing_rules add column if not exists valid_from    timestamptz;
alter table public.pricing_rules add column if not exists valid_to      timestamptz;
alter table public.pricing_rules add column if not exists created_at    timestamptz not null default now();
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pricing_rules_type_check' and conrelid = 'public.pricing_rules'::regclass) then
    alter table public.pricing_rules add constraint pricing_rules_type_check
      check (type in ('quantity', 'date', 'customer', 'product', 'campaign', 'global'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'pricing_rules_discount_type_check' and conrelid = 'public.pricing_rules'::regclass) then
    alter table public.pricing_rules add constraint pricing_rules_discount_type_check
      check (discount_type in ('percentage', 'fixed', 'fixed_price'));
  end if;
end $$;
create index if not exists pricing_rules_priority_idx on public.pricing_rules (priority);

-- ============================================================
-- 20) SHARED_ACCESS_LINKS (acceso invitado por token)
-- ============================================================
create table if not exists public.shared_access_links (
  id           uuid primary key default gen_random_uuid(),
  token        text not null,
  created_by   uuid references public.users (id) on delete set null,
  guest_name   text,
  guest_email  text,
  permissions  jsonb not null default '{}'::jsonb,
  expires_at   timestamptz,
  max_uses     int,
  use_count    int not null default 0,
  is_active    boolean not null default true,
  products     jsonb,
  created_at   timestamptz not null default now(),
  last_used_at timestamptz
);
alter table public.shared_access_links add column if not exists token        text;
alter table public.shared_access_links add column if not exists created_by   uuid references public.users (id) on delete set null;
alter table public.shared_access_links add column if not exists guest_name   text;
alter table public.shared_access_links add column if not exists guest_email  text;
alter table public.shared_access_links add column if not exists permissions  jsonb not null default '{}'::jsonb;
alter table public.shared_access_links add column if not exists expires_at   timestamptz;
alter table public.shared_access_links add column if not exists max_uses     int;
alter table public.shared_access_links add column if not exists use_count    int not null default 0;
alter table public.shared_access_links add column if not exists is_active    boolean not null default true;
alter table public.shared_access_links add column if not exists products     jsonb;
alter table public.shared_access_links add column if not exists created_at   timestamptz not null default now();
alter table public.shared_access_links add column if not exists last_used_at timestamptz;
create index if not exists shared_access_links_token_idx   on public.shared_access_links (token);
create index if not exists shared_access_links_created_idx on public.shared_access_links (created_by);

-- ============================================================
-- 21) BUCKET DE IMÁGENES DE PRODUCTO
--    (el de comprobantes 'resources' lo crea 20260812000001)
-- ============================================================
insert into storage.buckets (id, name, public, file_size_limit)
values ('products', 'products', true, 10485760)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

drop policy if exists "products_public_read" on storage.objects;
create policy "products_public_read" on storage.objects for select
  using (bucket_id = 'products');

drop policy if exists "products_authenticated_insert" on storage.objects;
create policy "products_authenticated_insert" on storage.objects for insert
  with check (bucket_id = 'products' and auth.role() = 'authenticated');

-- ============================================================
-- 22) GRANTS (aditivos; no reemplazan políticas RLS existentes)
--     anon NO recibe acceso: los catálogos públicos necesitan una
--     política RLS explícita que aún no está versionada (ver pendientes).
-- ============================================================
grant select, insert, update, delete on
  public.categories,
  public.inventory_locations,
  public.products,
  public.product_variants,
  public.product_images,
  public.inventory_movements,
  public.price_lists,
  public.product_prices,
  public.customers,
  public.quotations,
  public.quotation_items,
  public.bundles,
  public.bundle_items,
  public.liquidation_campaigns,
  public.liquidation_items,
  public.catalogs,
  public.catalog_items,
  public.ai_suggestions,
  public.pricing_rules,
  public.shared_access_links
to authenticated;
grant all on
  public.categories,
  public.inventory_locations,
  public.products,
  public.product_variants,
  public.product_images,
  public.inventory_movements,
  public.price_lists,
  public.product_prices,
  public.customers,
  public.quotations,
  public.quotation_items,
  public.bundles,
  public.bundle_items,
  public.liquidation_campaigns,
  public.liquidation_items,
  public.catalogs,
  public.catalog_items,
  public.ai_suggestions,
  public.pricing_rules,
  public.shared_access_links
to service_role;
