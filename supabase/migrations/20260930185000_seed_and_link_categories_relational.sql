-- ============================================================
-- MIGRACIÓN DE DATOS: POBLAR CATEGORIES Y ENLAZAR PRODUCTS
-- Modelo estricto: Tenant -> Categories -> Products (FK category_id)
-- ============================================================

-- 1. Eliminar restricciones únicas globales previas (en multi-tenant el nombre es único por tenant)
alter table public.categories drop constraint if exists categories_name_key;
alter table public.categories drop constraint if exists categories_slug_key;

-- 2. Asegurar default gen_random_uuid() en categories.id
alter table public.categories alter column id set default gen_random_uuid();

-- 3. Poblar public.categories desde los productos existentes por tenant (deduplicado a nivel tenant + nombre)
insert into public.categories (tenant_id, name, slug)
select
  sub.tenant_id,
  max(sub.name) as name,
  lower(regexp_replace(max(sub.name), '[^a-zA-Z0-9]+', '-', 'g')) as slug
from (
  select distinct
    p.tenant_id,
    trim(p.category) as name
  from public.products p
  where p.category is not null 
    and trim(p.category) <> ''
) sub
where not exists (
  select 1 from public.categories c 
  where (c.tenant_id = sub.tenant_id or (c.tenant_id is null and sub.tenant_id is null))
    and lower(trim(c.name)) = lower(sub.name)
)
group by sub.tenant_id, lower(sub.name);

-- 4. Vincular products.category_id con categories.id de su respectivo tenant
update public.products p
set category_id = c.id
from public.categories c
where p.category_id is null
  and (p.tenant_id = c.tenant_id or (p.tenant_id is null and c.tenant_id is null))
  and lower(trim(p.category)) = lower(trim(c.name));

-- 5. Crear índice único multi-tenant para consistencia
create unique index if not exists categories_tenant_name_idx 
on public.categories (coalesce(tenant_id, '00000000-0000-0000-0000-000000000001'::uuid), lower(trim(name)));
