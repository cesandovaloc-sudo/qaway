-- =====================================================================
-- D-10 / doc 1.9 · Tabla de productos propia del Inventario
--
-- Motivo: `public.products` es compartida con Academy, CoraVet, la tienda
-- y las webs de marketing (todas en modo prueba). El Inventario deja de
-- depender de ella y estrena su propia tabla, con su propia RLS.
--
-- `products` NO se modifica: queda intacta para las apps en prueba.
--
-- Las 11 tablas que apuntaban a `products` con llave foránea están vacías
-- (0 filas, medido 23-11-2026), por lo que reconectar sus llaves no mueve
-- ni un dato.
-- =====================================================================

-- ── 1. Tabla nueva: mismas 30 columnas, mismos tipos y defaults ────────
create table if not exists public.inv_products (
  id                uuid        primary key default gen_random_uuid(),
  sku               text,
  name              text        not null,
  title             text,
  slug              text,
  description       text,
  base_price        numeric     not null default 0,
  price             numeric     not null default 0,
  compare_price     numeric,
  image_url         text,
  images            jsonb       default '[]'::jsonb,
  type              text        not null default 'service',
  category          text,
  category_id       text,
  subcategory_id    text,
  brand             text,
  stock             numeric     not null default 10,
  min_stock         numeric     not null default 0,
  condition         integer     not null default 10,
  unit              text        not null default 'UNIDAD',
  status            text        not null default 'active',
  commercial_status text        not null default 'available',
  metadata          jsonb       not null default '{}'::jsonb,
  notes             text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  tenant_id         uuid        not null default public.get_auth_tenant_id(),
  course_id         uuid,
  location_id       uuid,
  cost              numeric
);

comment on table public.inv_products is
  'Catálogo de productos del módulo Inventario (app inventario). Separada de public.products, que sigue sirviendo a Academy, CoraVet y la tienda.';

-- ── 2. Índices ────────────────────────────────────────────────────────
create index if not exists inv_products_tenant_idx
  on public.inv_products (tenant_id);
create index if not exists inv_products_tenant_status_idx
  on public.inv_products (tenant_id, status);
create unique index if not exists inv_products_tenant_slug_key
  on public.inv_products (tenant_id, slug);
create unique index if not exists inv_products_tenant_sku_key
  on public.inv_products (tenant_id, sku) where sku is not null;

-- ── 3. Triggers (reutilizan las funciones ya existentes) ──────────────
drop trigger if exists set_inv_products_updated_at on public.inv_products;
create trigger set_inv_products_updated_at
  before update on public.inv_products
  for each row execute function public.handle_updated_at();

drop trigger if exists trg_sync_inv_product_title_name on public.inv_products;
create trigger trg_sync_inv_product_title_name
  before insert or update on public.inv_products
  for each row execute function public.sync_product_title_name();

-- ── 4. RLS: staff del tenant y admin de plataforma ────────────────────
alter table public.inv_products enable row level security;

drop policy if exists inv_products_staff_select on public.inv_products;
create policy inv_products_staff_select on public.inv_products
  for select to authenticated
  using (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'products'))
  );

drop policy if exists inv_products_staff_insert on public.inv_products;
create policy inv_products_staff_insert on public.inv_products
  for insert to authenticated
  with check (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'products'))
  );

drop policy if exists inv_products_staff_update on public.inv_products;
create policy inv_products_staff_update on public.inv_products
  for update to authenticated
  using (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'products'))
  )
  with check (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'products'))
  );

drop policy if exists inv_products_staff_delete on public.inv_products;
create policy inv_products_staff_delete on public.inv_products
  for delete to authenticated
  using (
    public.is_platform_admin()
    or (tenant_id = public.get_auth_tenant_id()
        and public.user_can_use_feature('inventario', 'products'))
  );

-- Lectura pública (anon): solo productos activos de empresas que tengan
-- Inventario contratado. Es lo que usan la tienda y los enlaces de invitado.
-- No permite ver productos inactivos ni de empresas sin el módulo.
drop policy if exists inv_products_public_select on public.inv_products;
create policy inv_products_public_select on public.inv_products
  for select to anon
  using (
    status = 'active'
    and public.tenant_has_app_feature(tenant_id, 'inventario', 'products')
  );

-- ── 5. Permisos de tabla ──────────────────────────────────────────────
revoke all on public.inv_products from anon;
grant select, insert, update, delete on public.inv_products to authenticated;
grant all on public.inv_products to service_role;

-- anon solo ve columnas públicas: nunca cost, stock, min_stock, notes,
-- metadata, tenant_id, course_id ni location_id.
grant select (
  id, sku, name, title, slug, description,
  base_price, price, compare_price, image_url, images,
  type, category, category_id, subcategory_id, brand,
  condition, unit, status, commercial_status, created_at, updated_at
) on public.inv_products to anon;

-- ── 6. Reconectar las 11 llaves foráneas (tablas vacías) ──────────────
alter table public.ai_suggestions        drop constraint if exists ai_suggestions_product_id_fkey;
alter table public.ai_suggestions        add  constraint ai_suggestions_product_id_fkey        foreign key (product_id) references public.inv_products (id) on delete set null;

alter table public.bundle_items          drop constraint if exists bundle_items_product_id_fkey;
alter table public.bundle_items          add  constraint bundle_items_product_id_fkey          foreign key (product_id) references public.inv_products (id) on delete cascade;

alter table public.catalog_items         drop constraint if exists catalog_items_product_id_fkey;
alter table public.catalog_items         add  constraint catalog_items_product_id_fkey         foreign key (product_id) references public.inv_products (id) on delete cascade;

alter table public.inventory_movements   drop constraint if exists inventory_movements_product_id_fkey;
alter table public.inventory_movements   add  constraint inventory_movements_product_id_fkey   foreign key (product_id) references public.inv_products (id) on delete cascade;

alter table public.liquidation_items     drop constraint if exists liquidation_items_product_id_fkey;
alter table public.liquidation_items     add  constraint liquidation_items_product_id_fkey     foreign key (product_id) references public.inv_products (id) on delete cascade;

alter table public.product_images        drop constraint if exists product_images_product_id_fkey;
alter table public.product_images        add  constraint product_images_product_id_fkey        foreign key (product_id) references public.inv_products (id) on delete cascade;

alter table public.product_prices        drop constraint if exists product_prices_product_id_fkey;
alter table public.product_prices        add  constraint product_prices_product_id_fkey        foreign key (product_id) references public.inv_products (id) on delete cascade;

alter table public.product_variants      drop constraint if exists product_variants_product_id_fkey;
alter table public.product_variants      add  constraint product_variants_product_id_fkey      foreign key (product_id) references public.inv_products (id) on delete cascade;

alter table public.purchase_order_items  drop constraint if exists purchase_order_items_product_id_fkey;
alter table public.purchase_order_items  add  constraint purchase_order_items_product_id_fkey  foreign key (product_id) references public.inv_products (id) on delete set null;

alter table public.quotation_items       drop constraint if exists quotation_items_product_id_fkey;
alter table public.quotation_items       add  constraint quotation_items_product_id_fkey       foreign key (product_id) references public.inv_products (id) on delete set null;

alter table public.sale_items            drop constraint if exists sale_items_product_id_fkey;
alter table public.sale_items            add  constraint sale_items_product_id_fkey            foreign key (product_id) references public.inv_products (id) on delete set null;

-- ── 7. Funciones de stock apuntando a la tabla nueva ──────────────────
-- `pin_order_item_price` NO se toca: es de la tienda (order_items) y lee
-- `products`, que sigue siendo la tabla de Academy y del storefront.
create or replace function public.add_stock(p_product_id uuid, p_quantity numeric)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  if p_product_id is null then
    raise exception 'add_stock: producto requerido';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'add_stock: cantidad debe ser mayor a 0';
  end if;

  perform pg_advisory_xact_lock(hashtext('qawaylab_stock_' || p_product_id::text));

  update public.inv_products
     set stock = stock + p_quantity,
         commercial_status = case
           when stock + p_quantity > 0 and commercial_status = 'sold' then 'available'
           else commercial_status
         end
   where id = p_product_id;
end;
$function$;

create or replace function public.restore_stock(p_product_id uuid, p_quantity numeric)
 returns void
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
begin
  update public.inv_products
     set stock = stock + p_quantity,
         commercial_status = case
           when stock + p_quantity > 0 and commercial_status = 'sold' then 'available'
           else commercial_status
         end
   where id = p_product_id;
end;
$function$;

create or replace function public.apply_sale_stock()
 returns trigger
 language plpgsql
 security definer
 set search_path to 'public'
as $function$
declare
  v_sale_number text;
  v_status      text;
  v_stock       numeric;
  v_sale_tenant uuid;
  v_prod_tenant uuid;
begin
  if new.product_id is null then
    return new;
  end if;

  select sale_number, status, tenant_id into v_sale_number, v_status, v_sale_tenant
    from public.sales
    where id = new.sale_id;

  if v_status = 'cancelled' then
    return new;
  end if;

  if new.quantity is null or new.quantity <= 0 then
    raise exception 'Cantidad de venta inválida';
  end if;

  perform pg_advisory_xact_lock(hashtext('qawaylab_stock_' || new.product_id::text));

  select stock, tenant_id into v_stock, v_prod_tenant
    from public.inv_products where id = new.product_id;
  if v_stock is null then
    raise exception 'El producto no existe';
  end if;
  if v_stock < new.quantity then
    raise exception 'Stock insuficiente: disponible %, se intentó vender %', v_stock, new.quantity;
  end if;

  -- El movimiento pertenece a la empresa dueña del producto y de la venta.
  -- (El default de inventory_movements apunta a Qaway Lab y ensuciaba el kardex).
  insert into public.inventory_movements (product_id, tenant_id, type, quantity, reference, notes, created_by)
  values (new.product_id, coalesce(v_sale_tenant, v_prod_tenant), 'sale', -new.quantity,
          v_sale_number, 'Venta ' || v_sale_number, auth.uid());

  update public.inv_products
     set stock = stock - new.quantity,
         commercial_status = case
           when stock - new.quantity <= 0 then 'sold'
           else commercial_status
         end
   where id = new.product_id;

  return new;
end;
$function$;
