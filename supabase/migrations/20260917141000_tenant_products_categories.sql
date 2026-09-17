-- ============================================================
-- MULTI-TENANT PRODUCTS & CATEGORIES — FASE 2
-- ============================================================
-- Objetivo:
-- 1. Agregar tenant_id a public.products y public.categories
--    con default al Master Tenant Qaway Lab ('00000000-0000-0000-0000-000000000001')
--    para preservar el 100% de operatividad del sistema e-commerce de Fase 2.
-- 2. Asegurar unicidad compuesta (tenant_id, slug) para permitir
--    que cada tenant tenga su propio espacio de nombres de productos.
-- 3. Crear índices de búsqueda rápida (tenant_id, status).
-- 4. Sembrar catálogo inicial para Tenant Piloto CoraVet ('06bacf31-6699-4ef5-9843-e58b835c6b2b').
-- ============================================================

-- ─── 1. EXTENSIÓN DE TABLA PRODUCTS ──────────────────────────
alter table public.products 
  add column if not exists tenant_id uuid references public.tenants(id) on delete restrict default '00000000-0000-0000-0000-000000000001'::uuid;

-- Backfill de seguridad: ningún producto existente queda huérfano
update public.products 
set tenant_id = '00000000-0000-0000-0000-000000000001'::uuid 
where tenant_id is null;

alter table public.products 
  alter column tenant_id set not null;

-- Desactivar constraint global de slug único para habilitar catálogo multi-tenant
alter table public.products 
  drop constraint if exists products_slug_key;

-- Añadir constraint compuesto de slug único por tenant
alter table public.products 
  drop constraint if exists products_tenant_slug_key;

alter table public.products 
  add constraint products_tenant_slug_key unique (tenant_id, slug);

-- Índices de alto rendimiento para filtrado por tenant
create index if not exists idx_products_tenant_id 
  on public.products(tenant_id);

create index if not exists idx_products_tenant_id_status 
  on public.products(tenant_id, status);

-- ─── 2. EXTENSIÓN DE TABLA CATEGORIES ────────────────────────
alter table public.categories 
  add column if not exists tenant_id uuid references public.tenants(id) on delete restrict default '00000000-0000-0000-0000-000000000001'::uuid;

update public.categories 
set tenant_id = '00000000-0000-0000-0000-000000000001'::uuid 
where tenant_id is null;

create index if not exists idx_categories_tenant_id 
  on public.categories(tenant_id);

-- ─── 3. SIEMBRA DE PRODUCTOS CORAVET (TENANT PILOTO 001) ─────
-- UUID CoraVet: 06bacf31-6699-4ef5-9843-e58b835c6b2b
insert into public.products (
  tenant_id,
  name,
  title,
  sku,
  slug,
  description,
  price,
  base_price,
  compare_price,
  category,
  type,
  stock,
  status,
  commercial_status,
  image_url
) values 
(
  '06bacf31-6699-4ef5-9843-e58b835c6b2b'::uuid,
  'Royal Canin Adulto',
  'Royal Canin Adulto',
  'CV-ALM-001',
  'royal-canin-adulto',
  'Alimento premium para perros adultos con nutrientes esenciales para su pelaje y vitalidad.',
  89.90,
  89.90,
  null,
  'Alimentos',
  'physical',
  25,
  'active',
  'available',
  'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?auto=format&fit=crop&w=600&q=80'
),
(
  '06bacf31-6699-4ef5-9843-e58b835c6b2b'::uuid,
  'Bravecto Antipulgas',
  'Bravecto Antipulgas',
  'CV-MED-002',
  'bravecto-antipulgas',
  'Comprimido masticable para el tratamiento y prevención de infestaciones por pulgas y garrapatas.',
  159.90,
  159.90,
  null,
  'Medicamentos',
  'physical',
  18,
  'active',
  'available',
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80'
),
(
  '06bacf31-6699-4ef5-9843-e58b835c6b2b'::uuid,
  'Shampoo Dermocare',
  'Shampoo Dermocare',
  'CV-HIG-003',
  'shampoo-dermocare',
  'Fórmula hipoalergénica con extractos naturales para el cuidado de pieles sensibles.',
  69.90,
  69.90,
  null,
  'Higiene y cuidado',
  'physical',
  30,
  'active',
  'available',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80'
),
(
  '06bacf31-6699-4ef5-9843-e58b835c6b2b'::uuid,
  'Cama Premium Confort',
  'Cama Premium Confort',
  'CV-ACC-004',
  'cama-premium-confort',
  'Cama ergonómica lavable con relleno viscoelástico para un descanso reparador.',
  149.90,
  149.90,
  null,
  'Accesorios',
  'physical',
  12,
  'active',
  'available',
  'https://images.unsplash.com/photo-1541781774459-bb2af2f05b55?auto=format&fit=crop&w=600&q=80'
),
(
  '06bacf31-6699-4ef5-9843-e58b835c6b2b'::uuid,
  'Pelota Interactiva Mordedera',
  'Pelota Interactiva Mordedera',
  'CV-JUG-005',
  'pelota-interactiva',
  'Juguete de caucho natural ultra resistente para estimular la actividad y limpieza dental.',
  35.00,
  35.00,
  null,
  'Juguetes',
  'physical',
  40,
  'active',
  'available',
  'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?auto=format&fit=crop&w=600&q=80'
),
(
  '06bacf31-6699-4ef5-9843-e58b835c6b2b'::uuid,
  'Pack Nutrición + Protección',
  'Pack Nutrición + Protección',
  'CV-PRO-006',
  'pack-nutricion-proteccion',
  'Combo especial de Alimento Royal Canin + Antipulgas Bravecto con precio promocional.',
  219.00,
  249.80,
  249.80,
  'Promociones',
  'physical',
  10,
  'active',
  'available',
  'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80'
)
on conflict (tenant_id, slug) do update set
  name              = excluded.name,
  title             = excluded.title,
  price             = excluded.price,
  base_price        = excluded.base_price,
  compare_price     = excluded.compare_price,
  description       = excluded.description,
  category          = excluded.category,
  type              = excluded.type,
  stock             = excluded.stock,
  status            = excluded.status,
  commercial_status = excluded.commercial_status,
  image_url         = excluded.image_url,
  updated_at        = now();
