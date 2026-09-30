-- ============================================================
-- MIGRACIÓN DE DATOS: POBLAR CATEGORIES Y ENLAZAR PRODUCTS
-- Modelo estricto: Tenant -> Categories -> Products (FK category_id)
-- ============================================================

-- 1. Asegurar default gen_random_uuid() en categories.id
alter table public.categories alter column id set default gen_random_uuid();

-- 2. Poblar public.categories desde los productos existentes por tenant
insert into public.categories (id, tenant_id, name, slug)
select distinct
  gen_random_uuid(),
  p.tenant_id,
  trim(p.category) as name,
  lower(regexp_replace(trim(p.category), '[^a-zA-Z0-9]+', '-', 'g')) as slug
from public.products p
where p.category is not null 
  and trim(p.category) <> ''
  and not exists (
    select 1 from public.categories c 
    where c.tenant_id = p.tenant_id 
      and lower(trim(c.name)) = lower(trim(p.category))
  );

-- 3. Vincular products.category_id con categories.id de su respectivo tenant
update public.products p
set category_id = c.id
from public.categories c
where p.category_id is null
  and p.tenant_id = c.tenant_id
  and lower(trim(p.category)) = lower(trim(c.name));
