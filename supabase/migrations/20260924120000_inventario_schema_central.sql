-- ============================================================
-- INVENTARIO → SCHEMA CENTRAL (Opción 1)
-- Puerto limpio del dominio 10-qawaylab-inventario a la BD central.
-- ADITIVO e IDEMPOTENTE: crea tablas/funciones/RLS que no existen;
-- NO toca products/users/categories/orders/order_items/payments
-- (solo añade 2 columnas inocuas a products para compatibilidad).
-- Cada tabla nueva incorpora tenant_id (default Master Qaway Lab)
-- y RLS tenant-coherente con el patrón central (is_admin OR tenant).
-- ============================================================

-- ─── 0. Helper: añadir tenant_id cuando la tabla ya existe ───
do $do$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'inventory_locations', 'product_variants', 'product_images',
    'inventory_movements', 'price_lists', 'product_prices', 'customers',
    'bundles', 'bundle_items', 'quotations', 'quotation_items',
    'liquidation_campaigns', 'liquidation_items', 'catalogs', 'catalog_items',
    'ai_suggestions', 'pricing_rules', 'shared_access_links',
    'business_settings', 'taxes', 'sunat_units', 'series',
    'sales', 'sale_items', 'sale_payments',
    'invoices', 'invoice_lines',
    'purchase_orders', 'purchase_order_items',
    'petty_cash_movements', 'expenses', 'transactions',
    'accounting_entries', 'accounting_entry_lines'
  ] loop
    if exists (
      select 1 from pg_tables where schemaname = 'public' and tablename = t
    ) then
      execute format('alter table public.%I add column if not exists tenant_id uuid references public.tenants (id) on delete restrict default ''00000000-0000-0000-0000-000000000001''::uuid', t);
      execute format('update public.%I set tenant_id = ''00000000-0000-0000-0000-000000000001''::uuid where tenant_id is null', t);
      execute format('create index if not exists %I on public.%I (tenant_id)', t || '_tenant_idx', t);
    end if;
  end loop;
end;
$do$;

-- ─── 1. CATEGORIES: convergencia aditiva (tolerante a id text central) ───
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text,
  parent_id  uuid references public.categories (id) on delete set null,
  icon       text,
  sort_order int  not null default 0,
  created_at timestamptz not null default now()
);
alter table public.categories add column if not exists slug       text;
alter table public.categories add column if not exists icon       text;
alter table public.categories add column if not exists sort_order int  not null default 0;
alter table public.categories add column if not exists created_at timestamptz not null default now();
do $do$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'categories'
      and column_name = 'id' and data_type = 'uuid'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'categories'
      and column_name = 'parent_id'
  ) then
    alter table public.categories
      add column parent_id uuid references public.categories (id) on delete set null;
  end if;
end;
$do$;
create index if not exists categories_slug_idx on public.categories (slug);
do $do$
begin
  if exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'categories'
      and column_name = 'parent_id'
  ) then
    execute 'create index if not exists categories_parent_idx on public.categories (parent_id)';
  end if;
end;
$do$;

-- ─── 3. ALMACENES ───
create table if not exists public.inventory_locations (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text,
  code       text,
  type       text not null default 'warehouse',
  parent_id  uuid references public.inventory_locations (id) on delete set null,
  address    text,
  tenant_id  uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint inventory_locations_type_check
    check (type in ('warehouse', 'room', 'office', 'depot', 'project', 'shelf', 'zone'))
);
create index if not exists inventory_locations_parent_idx on public.inventory_locations (parent_id);

-- ─── 2. PRODUCTS: solo 2 columnas de compatibilidad (sin constraints/RLS) ───
alter table public.products add column if not exists location_id uuid references public.inventory_locations (id) on delete set null;
alter table public.products add column if not exists cost         numeric;
create index if not exists products_location_id_idx on public.products (location_id);

-- ─── 4. VARIANTES E IMÁGENES ───
create table if not exists public.product_variants (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references public.products (id) on delete cascade,
  name        text not null,
  sku         text not null,
  attributes  jsonb not null default '{}'::jsonb,
  stock       numeric not null default 0,
  cost        numeric,
  price       numeric,
  condition   int  not null default 5,
  tenant_id   uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at  timestamptz not null default now()
);
create index if not exists product_variants_product_idx on public.product_variants (product_id);

create table if not exists public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  original_url  text not null,
  processed_url text,
  is_primary    boolean not null default false,
  alt           text,
  sort_order    int  not null default 0,
  tenant_id     uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at    timestamptz not null default now()
);
create index if not exists product_images_product_idx on public.product_images (product_id);

-- ─── 5. MOVIMIENTOS DE INVENTARIO ───
create table if not exists public.inventory_movements (
  id               uuid primary key default gen_random_uuid(),
  product_id       uuid not null references public.products (id) on delete cascade,
  variant_id       uuid references public.product_variants (id) on delete set null,
  type             text not null default 'adjustment',
  quantity         numeric not null default 0,
  from_location_id uuid references public.inventory_locations (id) on delete set null,
  to_location_id   uuid references public.inventory_locations (id) on delete set null,
  reference        text,
  notes            text,
  tenant_id        uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_by       uuid references public.users (id) on delete set null,
  created_at       timestamptz not null default now(),
  constraint inventory_movements_type_check
    check (type in ('entry', 'exit', 'transfer', 'adjustment', 'sale', 'reservation'))
);
create index if not exists inventory_movements_product_idx on public.inventory_movements (product_id);
create index if not exists inventory_movements_type_idx    on public.inventory_movements (type);
create index if not exists inventory_movements_created_idx on public.inventory_movements (created_at desc);

-- ─── 6. LISTAS DE PRECIOS ───
create table if not exists public.price_lists (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  type        text not null default 'normal',
  is_active   boolean not null default true,
  description text,
  tenant_id   uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at  timestamptz not null default now(),
  constraint price_lists_type_check
    check (type in ('normal', 'wholesale', 'offer', 'liquidation', 'institutional', 'campaign'))
);

create table if not exists public.product_prices (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  price_list_id uuid not null references public.price_lists (id) on delete cascade,
  price         numeric not null default 0,
  min_quantity  numeric not null default 1,
  valid_from    timestamptz,
  valid_to      timestamptz,
  tenant_id     uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  constraint product_prices_unique unique (product_id, price_list_id, min_quantity)
);

-- ─── 7. CLIENTES (con validación SUNAT) ───
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
      if not doc_number ~ '^[0-9]{11}$' then return false; end if;
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
  tenant_id   uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at  timestamptz not null default now(),
  constraint customers_type_check
    check (type in ('individual', 'company', 'wholesale', 'reseller')),
  constraint customers_doc_type_check
    check (doc_type in ('DNI', 'RUC', 'CE', 'PASAPORTE', 'SIN_DOC')),
  constraint customers_doc_number_check
    check (public.validate_doc_number(doc_type, doc_number))
);
create unique index if not exists customers_doc_unique
  on public.customers (doc_type, doc_number)
  where doc_type is not null and doc_type <> 'SIN_DOC' and doc_number is not null and doc_number <> '';
create index if not exists customers_doc_number_idx on public.customers (doc_number);

-- ─── 8. PAQUETES (bundles) ───
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
  tenant_id             uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at            timestamptz not null default now(),
  constraint bundles_status_check
    check (status in ('active', 'inactive', 'archived'))
);

create table if not exists public.bundle_items (
  id         uuid primary key default gen_random_uuid(),
  bundle_id  uuid not null references public.bundles (id) on delete cascade,
  product_id uuid references public.products (id) on delete cascade,
  variant_id uuid references public.product_variants (id) on delete set null,
  quantity   numeric not null default 1,
  tenant_id  uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict
);
create index if not exists bundle_items_bundle_idx  on public.bundle_items (bundle_id);
create index if not exists bundle_items_product_idx on public.bundle_items (product_id);

-- ─── 9. COTIZACIONES ───
create table if not exists public.quotations (
  id          uuid primary key default gen_random_uuid(),
  customer_id uuid references public.customers (id) on delete set null,
  status      text not null default 'draft',
  subtotal    numeric not null default 0,
  discount    numeric not null default 0,
  total       numeric not null default 0,
  valid_until timestamptz,
  notes       text,
  tenant_id   uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at  timestamptz not null default now(),
  constraint quotations_status_check
    check (status in ('draft', 'sent', 'accepted', 'rejected', 'expired'))
);
create index if not exists quotations_customer_idx on public.quotations (customer_id);
create index if not exists quotations_status_idx   on public.quotations (status);

create table if not exists public.quotation_items (
  id           uuid primary key default gen_random_uuid(),
  quotation_id uuid not null references public.quotations (id) on delete cascade,
  product_id   uuid references public.products (id) on delete set null,
  bundle_id    uuid references public.bundles (id) on delete set null,
  quantity     numeric not null default 1,
  unit_price   numeric not null default 0,
  discount     numeric not null default 0,
  subtotal     numeric not null default 0,
  tenant_id    uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict
);
create index if not exists quotation_items_quotation_idx on public.quotation_items (quotation_id);

-- ─── 10. CAMPAÑAS DE LIQUIDACIÓN ───
create table if not exists public.liquidation_campaigns (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  description   text,
  start_date    timestamptz,
  end_date      timestamptz,
  status        text not null default 'draft',
  discount_type text,
  catalog_id    uuid,
  tenant_id     uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at    timestamptz not null default now(),
  constraint liquidation_campaigns_status_check
    check (status in ('draft', 'preparing', 'active', 'paused', 'finished', 'archived'))
);

create table if not exists public.liquidation_items (
  id                uuid primary key default gen_random_uuid(),
  campaign_id       uuid not null references public.liquidation_campaigns (id) on delete cascade,
  product_id        uuid references public.products (id) on delete cascade,
  liquidation_price numeric,
  package_price     numeric,
  max_quantity      numeric,
  tenant_id         uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict
);
create index if not exists liquidation_items_campaign_idx on public.liquidation_items (campaign_id);
create index if not exists liquidation_items_product_idx  on public.liquidation_items (product_id);

-- ─── 11. CATÁLOGOS ───
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
  tenant_id   uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at  timestamptz not null default now(),
  constraint catalogs_template_check
    check (template in ('minimal', 'professional', 'premium'))
);
create index if not exists catalogs_slug_idx     on public.catalogs (slug);
create index if not exists catalogs_campaign_idx on public.catalogs (campaign_id);
create index if not exists catalogs_public_idx   on public.catalogs (is_public);

create table if not exists public.catalog_items (
  id               uuid primary key default gen_random_uuid(),
  catalog_id       uuid not null references public.catalogs (id) on delete cascade,
  product_id       uuid references public.products (id) on delete cascade,
  bundle_id        uuid references public.bundles (id) on delete set null,
  sort_order       int not null default 0,
  show_price       boolean not null default true,
  show_description boolean not null default true,
  tenant_id        uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict
);
create index if not exists catalog_items_catalog_idx on public.catalog_items (catalog_id);
create index if not exists catalog_items_product_idx on public.catalog_items (product_id);

-- ─── 12. AI SUGGESTIONS Y REGLAS DE PRECIO ───
create table if not exists public.ai_suggestions (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid references public.products (id) on delete set null,
  type       text not null,
  value      text not null,
  confidence text not null default 'medium',
  source     text not null default 'ai',
  status     text not null default 'pending',
  tenant_id  uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint ai_suggestions_type_check
    check (type in ('product_name', 'category', 'description', 'attributes', 'condition', 'price', 'bundle')),
  constraint ai_suggestions_confidence_check
    check (confidence in ('high', 'medium', 'low')),
  constraint ai_suggestions_status_check
    check (status in ('pending', 'approved', 'rejected'))
);

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
  tenant_id     uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at    timestamptz not null default now(),
  constraint pricing_rules_type_check
    check (type in ('quantity', 'date', 'customer', 'product', 'campaign', 'global')),
  constraint pricing_rules_discount_type_check
    check (discount_type in ('percentage', 'fixed', 'fixed_price'))
);
create index if not exists pricing_rules_priority_idx on public.pricing_rules (priority);

-- ─── 13. ACCESOS INVITADOS ───
create table if not exists public.shared_access_links (
  id           uuid primary key default gen_random_uuid(),
  token        text not null,
  tenant_id    uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
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
create index if not exists shared_access_links_token_idx   on public.shared_access_links (token);
create index if not exists shared_access_links_created_idx on public.shared_access_links (created_by);

-- ─── 14. CONFIG FISCAL ───
create table if not exists public.business_settings (
  id                   uuid primary key default '00000000-0000-0000-0000-000000000001',
  ruc                  text,
  razon_social         text,
  nombre_comercial     text,
  direccion            text,
  regimen              text not null default 'general',
  igv_rate             numeric not null default 18,
  moneda               text not null default 'PEN',
  sunat_connected      boolean not null default false,
  sunat_connection_meta jsonb,
  tenant_id            uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
insert into public.business_settings (id, ruc, razon_social, regimen, igv_rate, moneda)
values ('00000000-0000-0000-0000-000000000001', null, null, 'general', 18, 'PEN')
on conflict (id) do nothing;

create table if not exists public.taxes (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null,
  descripcion text not null,
  tasa        numeric,
  tipo        text not null default 'igv',
  active      boolean not null default true,
  tenant_id   uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at  timestamptz not null default now(),
  constraint taxes_codigo_unique unique (codigo),
  constraint taxes_tipo_check check (tipo in ('igv', 'isc', 'exonerado', 'inafecto', 'gratuito'))
);
insert into public.taxes (codigo, descripcion, tasa, tipo, active) values
  ('10', 'IGV',                 18, 'igv',       true),
  ('11', 'Exonerado',           0,  'exonerado', true),
  ('12', 'Inafecto',            0,  'inafecto',  true),
  ('13', 'Gratuito',            0,  'gratuito',  true),
  ('15', 'ISC',                 4,  'isc',       true),
  ('30', 'Otros conceptos',     0,  'inafecto',  false)
on conflict (codigo) do nothing;

create table if not exists public.sunat_units (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null,
  descripcion text not null,
  active      boolean not null default true,
  tenant_id   uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at  timestamptz not null default now(),
  constraint sunat_units_codigo_unique unique (codigo)
);
insert into public.sunat_units (codigo, descripcion, active) values
  ('NIU', 'Unidad', true), ('KGM', 'Kilogramo', true), ('GRM', 'Gramo', true),
  ('LBR', 'Libra', true), ('MTR', 'Metro', true), ('MTS', 'Metro cuadrado', true),
  ('MTK', 'Metro cúbico', true), ('LTR', 'Litro', true), ('MLT', 'Mililitro', true),
  ('FOT', 'Pie', true), ('YDS', 'Yarda', true), ('BX', 'Caja', true),
  ('CT', 'Cartón', true), ('SET', 'Set', true), ('PAR', 'Par', true),
  ('DOC', 'Docena', true), ('CEN', 'Ciento', true), ('MIL', 'Millar', true),
  ('KTM', 'Kilómetro', true), ('HUR', 'Hora', true), ('DZN', 'Docena', false),
  ('ZZ', 'Servicios', true)
on conflict (codigo) do nothing;

create table if not exists public.series (
  id                 uuid primary key default gen_random_uuid(),
  tipo_doc           text not null,
  serie              text not null,
  descripcion        text,
  correlativo_actual integer not null default 0,
  active             boolean not null default true,
  tenant_id          uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at         timestamptz not null default now(),
  constraint series_tipo_doc_check check (tipo_doc in ('01', '03', '07', '08')),
  constraint series_unique unique (tipo_doc, serie)
);
insert into public.series (tipo_doc, serie, descripcion, correlativo_actual, active) values
  ('03', 'B001', 'Boleta principal',          0, true),
  ('01', 'F001', 'Factura principal',         0, true),
  ('03', 'BC01', 'Boleta consumidor final',    0, true),
  ('01', 'FC01', 'Factura contigencia',       0, false),
  ('07', 'BD01', 'Nota de crédito (boleta)',   0, false),
  ('08', 'FD01', 'Nota de débito (factura)',   0, false)
on conflict (tipo_doc, serie) do nothing;

-- ─── 15. VENTAS DE MOSTRADOR (POS) ───
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
  tenant_id      uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_by     uuid references public.users (id) on delete set null,
  created_at     timestamptz not null default now(),
  paid_at        timestamptz,
  constraint sales_number_unique unique (sale_number),
  constraint sales_payment_status_check check (payment_status in ('pagado', 'deuda', 'parcial')),
  constraint sales_status_check check (status in ('active', 'cancelled'))
);
create unique index if not exists sales_sale_number_idx on public.sales (sale_number);

create table if not exists public.sale_items (
  id            uuid primary key default gen_random_uuid(),
  sale_id       uuid not null references public.sales (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_title text not null,
  quantity      numeric not null default 1,
  unit_price    numeric not null default 0,
  subtotal      numeric not null default 0,
  tax_code      text default '10',
  unit_sunat    text default 'NIU',
  tenant_id     uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict
);

create table if not exists public.sale_payments (
  id          uuid primary key default gen_random_uuid(),
  sale_id     uuid not null references public.sales (id) on delete cascade,
  amount      numeric not null default 0,
  method      text not null default 'efectivo',
  tenant_id   uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  received_at timestamptz not null default now(),
  created_by  uuid references public.users (id) on delete set null,
  notes       text,
  constraint sale_payments_method_check check (method in ('efectivo', 'yape', 'tarjeta', 'transferencia'))
);

-- Correlativo de venta sin huecos ni colisiones
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

-- Trigger endurecido: descuenta stock y crea movimiento 'sale'
create or replace function public.apply_sale_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_number text;
  v_status      text;
  v_stock       numeric;
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

  if new.quantity is null or new.quantity <= 0 then
    raise exception 'Cantidad de venta inválida';
  end if;

  perform pg_advisory_xact_lock(hashtext('qawaylab_stock_' || new.product_id::text));

  select stock into v_stock from public.products where id = new.product_id;
  if v_stock is null then
    raise exception 'El producto no existe';
  end if;
  if v_stock < new.quantity then
    raise exception 'Stock insuficiente: disponible %, se intentó vender %', v_stock, new.quantity;
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

-- Restaurar stock al anular venta
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

-- ─── 16. FACTURACIÓN ───
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
  tenant_id       uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_by      uuid references public.users (id) on delete set null,
  emitted_at      timestamptz,
  created_at      timestamptz not null default now(),
  constraint invoices_tipo_doc_check check (tipo_doc in ('01', '03')),
  constraint invoices_estado_check check (estado in ('generado', 'enviado', 'aceptado', 'rechazado', 'anulado')),
  constraint invoices_numero_unique unique (numero)
);

create table if not exists public.invoice_lines (
  id            uuid primary key default gen_random_uuid(),
  invoice_id    uuid not null references public.invoices (id) on delete cascade,
  product_title text not null,
  quantity      numeric not null default 1,
  unit_price    numeric not null default 0,
  tax_code      text default '10',
  igv_amount    numeric not null default 0,
  total         numeric not null default 0,
  tenant_id     uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict
);

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

-- ─── 17. COMPRAS, CAJA Y GASTOS ───
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
  tenant_id       uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_by      uuid references public.users (id) on delete set null,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  constraint purchase_orders_number_unique unique (order_number),
  constraint purchase_orders_status_check check (status in ('draft', 'pending', 'approved', 'received', 'cancelled'))
);
create unique index if not exists purchase_orders_number_idx on public.purchase_orders (order_number);

create table if not exists public.purchase_order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      uuid not null references public.purchase_orders (id) on delete cascade,
  product_id    uuid references public.products (id) on delete set null,
  product_title text not null,
  quantity      integer not null default 1,
  unit_price    numeric not null default 0,
  tax_code      text default '10',
  total         numeric not null default 0,
  tenant_id     uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at    timestamptz not null default now()
);

create table if not exists public.petty_cash_movements (
  id          uuid primary key default gen_random_uuid(),
  type        text not null,
  description text not null,
  amount      numeric not null default 0,
  reference   text,
  tenant_id   uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_by  uuid references public.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  constraint petty_cash_type_check check (type in ('ingreso', 'egreso'))
);

create table if not exists public.expenses (
  id           uuid primary key default gen_random_uuid(),
  description  text not null,
  category     text,
  amount       numeric not null default 0,
  expense_date date not null default current_date,
  receipt_url  text,
  tenant_id    uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_by   uuid references public.users (id) on delete set null,
  created_at   timestamptz not null default now()
);

create table if not exists public.transactions (
  id             uuid primary key default gen_random_uuid(),
  description    text not null,
  origin         text,
  account        text,
  amount         numeric not null default 0,
  reference_id   uuid,
  reference_type text,
  tenant_id      uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_by     uuid references public.users (id) on delete set null,
  created_at     timestamptz not null default now()
);

-- ─── 18. CONTABILIDAD ───
create table if not exists public.accounting_entries (
  id           uuid primary key default gen_random_uuid(),
  entry_number text not null,
  description  text not null,
  entry_date   date not null default current_date,
  reference    text,
  status       text not null default 'draft',
  tenant_id    uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_by   uuid references public.users (id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint accounting_entries_status_check check (status in ('draft', 'posted', 'cancelled'))
);
create unique index if not exists accounting_entries_number_idx on public.accounting_entries (entry_number);

create table if not exists public.accounting_entry_lines (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null references public.accounting_entries (id) on delete cascade,
  account_code text not null,
  account_name text not null,
  description  text,
  debit        numeric not null default 0,
  credit       numeric not null default 0,
  tenant_id    uuid not null default '00000000-0000-0000-0000-000000000001' references public.tenants (id) on delete restrict,
  created_at   timestamptz not null default now(),
  constraint accounting_lines_debit_credit_check check (
    (debit >= 0 and credit >= 0) and (debit > 0 or credit > 0)
  )
);

create or replace function public.next_entry_number()
returns trigger as $$
declare
  next_num integer;
begin
  select coalesce(max(cast(substring(entry_number from 4) as integer)), 0) + 1
  into next_num
  from public.accounting_entries;
  new.entry_number := 'ASI-' || lpad(next_num::text, 6, '0');
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_next_entry_number on public.accounting_entries;
create trigger trg_next_entry_number
  before insert on public.accounting_entries
  for each row execute function public.next_entry_number();

create or replace view public.accounting_entry_balances as
select
  e.id as entry_id,
  e.entry_number,
  e.description,
  e.entry_date,
  e.status,
  coalesce(sum(l.debit), 0) as total_debit,
  coalesce(sum(l.credit), 0) as total_credit,
  coalesce(sum(l.debit), 0) = coalesce(sum(l.credit), 0) as is_balanced,
  e.created_at
from public.accounting_entries e
left join public.accounting_entry_lines l on l.entry_id = e.id
group by e.id, e.entry_number, e.description, e.entry_date, e.status, e.created_at;

-- ─── 19. RLS TENANT-COHERENTE (is_admin OR tenant = auth) ───
do $do$
declare
  t text;
  p text;
begin
  foreach t in array array[
    'categories', 'inventory_locations', 'product_variants', 'product_images',
    'inventory_movements', 'price_lists', 'product_prices', 'customers',
    'bundles', 'bundle_items', 'quotations', 'quotation_items',
    'liquidation_campaigns', 'liquidation_items', 'catalogs', 'catalog_items',
    'ai_suggestions', 'pricing_rules', 'shared_access_links',
    'business_settings', 'taxes', 'sunat_units', 'series',
    'sales', 'sale_items', 'sale_payments',
    'invoices', 'invoice_lines',
    'purchase_orders', 'purchase_order_items',
    'petty_cash_movements', 'expenses', 'transactions',
    'accounting_entries', 'accounting_entry_lines'
  ] loop
    if exists (
      select 1 from pg_tables where schemaname = 'public' and tablename = t
    ) then
      execute format('alter table public.%I enable row level security', t);
      p := t || '_tenant_all';
      execute format('drop policy if exists %I on public.%I', p, t);
      execute format(
        'create policy %I on public.%I for all using (public.is_admin() or tenant_id = public.get_auth_tenant_id()) with check (public.is_admin() or tenant_id = public.get_auth_tenant_id())',
        p, t
      );
    end if;
  end loop;
end;
$do$;

-- ─── 20. GRANTS ───
grant select, insert, update, delete on
  public.categories, public.inventory_locations, public.product_variants,
  public.product_images, public.inventory_movements, public.price_lists,
  public.product_prices, public.customers, public.quotations, public.quotation_items,
  public.bundles, public.bundle_items, public.liquidation_campaigns,
  public.liquidation_items, public.catalogs, public.catalog_items,
  public.ai_suggestions, public.pricing_rules, public.shared_access_links,
  public.business_settings, public.taxes, public.sunat_units, public.series,
  public.sales, public.sale_items, public.sale_payments,
  public.invoices, public.invoice_lines,
  public.purchase_orders, public.purchase_order_items,
  public.petty_cash_movements, public.expenses, public.transactions,
  public.accounting_entries, public.accounting_entry_lines
to authenticated;
grant all on
  public.categories, public.inventory_locations, public.product_variants,
  public.product_images, public.inventory_movements, public.price_lists,
  public.product_prices, public.customers, public.quotations, public.quotation_items,
  public.bundles, public.bundle_items, public.liquidation_campaigns,
  public.liquidation_items, public.catalogs, public.catalog_items,
  public.ai_suggestions, public.pricing_rules, public.shared_access_links,
  public.business_settings, public.taxes, public.sunat_units, public.series,
  public.sales, public.sale_items, public.sale_payments,
  public.invoices, public.invoice_lines,
  public.purchase_orders, public.purchase_order_items,
  public.petty_cash_movements, public.expenses, public.transactions,
  public.accounting_entries, public.accounting_entry_lines
to service_role;