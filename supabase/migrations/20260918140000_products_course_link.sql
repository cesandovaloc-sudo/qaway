-- ============================================================
-- ENLACE COMERCIAL DE CURSOS DE ACADEMY EN PUBLIC.PRODUCTS
-- ============================================================
-- 1. Añade la columna lógica 'course_id' en public.products
--    (sin FK física directa hacia public.courses porque Academy
--    reside en una base de datos Supabase desacoplada).
-- 2. Añade índice de búsqueda rápida por course_id.
-- 3. Añade constraint único compuesto (tenant_id, course_id)
--    para evitar duplicar la oferta comercial del mismo curso.
-- 4. Siembra los 6 cursos de pago iniciales de Academy bajo el
--    Master Tenant Qaway Lab ('00000000-0000-0000-0000-000000000001')
--    con type = 'course'.
-- ============================================================

begin;

-- 1. Columna de enlace lógico
alter table public.products 
  add column if not exists course_id uuid;

-- 2. Índice para consultas rápidas desde el frontend de Academy
create index if not exists idx_products_course_id 
  on public.products(course_id);

create index if not exists idx_products_tenant_course 
  on public.products(tenant_id, course_id);

-- 3. Constraint de unicidad por tenant (ignora nulos)
alter table public.products 
  drop constraint if exists products_tenant_course_key;

alter table public.products 
  add constraint products_tenant_course_key unique (tenant_id, course_id);

-- 4. Sembrado / Upsert de productos comerciales para cursos de pago
insert into public.products (
  tenant_id,
  course_id,
  name,
  title,
  sku,
  slug,
  description,
  price,
  base_price,
  category,
  type,
  stock,
  status,
  commercial_status,
  image_url
) values
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0002-0000-0000-000000000002'::uuid,
  'JavaScript Avanzado',
  'JavaScript Avanzado',
  'ACAD-JS-ADV',
  'curso-javascript-avanzado',
  'Lleva tus habilidades de JavaScript al siguiente nivel. Closures, promesas, async/await, patrones de diseño, testing y optimización.',
  49.99,
  49.99,
  'Academy',
  'course',
  999,
  'active',
  'available',
  'https://picsum.photos/id/10/640/360'
),
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0003-0000-0000-000000000003'::uuid,
  'React & Modern Frontend',
  'React & Modern Frontend',
  'ACAD-REACT-FE',
  'curso-react-modern-frontend',
  'Construye aplicaciones web modernas con React 19, hooks, Context API, React Router, y herramientas del ecosistema actual.',
  79.99,
  79.99,
  'Academy',
  'course',
  999,
  'active',
  'available',
  'https://picsum.photos/id/20/640/360'
),
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0004-0000-0000-000000000004'::uuid,
  'Diseño UX/UI Profesional',
  'Diseño UX/UI Profesional',
  'ACAD-UXUI-PRO',
  'curso-diseno-ux-ui-profesional',
  'Aprende diseño de experiencia de usuario e interfaces desde la investigación hasta el prototipo final con Figma.',
  39.99,
  39.99,
  'Academy',
  'course',
  999,
  'active',
  'available',
  'https://picsum.photos/id/30/640/360'
),
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0005-0000-0000-000000000005'::uuid,
  'Backend con Node.js',
  'Backend con Node.js',
  'ACAD-NODE-BE',
  'curso-backend-con-nodejs',
  'Construye APIs robustas y escalables con Node.js, Express, bases de datos SQL y NoSQL, autenticación y despliegue.',
  59.99,
  59.99,
  'Academy',
  'course',
  999,
  'active',
  'available',
  'https://picsum.photos/id/40/640/360'
),
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0007-0000-0000-000000000007'::uuid,
  'Vue.js para Aplicaciones Web',
  'Vue.js para Aplicaciones Web',
  'ACAD-VUE-SPA',
  'curso-vuejs-para-aplicaciones-web',
  'Aprende Vue.js 3 desde cero: Composition API, Pinia, Vue Router, testing y despliegue.',
  44.99,
  44.99,
  'Academy',
  'course',
  999,
  'active',
  'available',
  'https://picsum.photos/id/60/640/360'
),
(
  '00000000-0000-0000-0000-000000000001'::uuid,
  'c0000000-0008-0000-0000-000000000008'::uuid,
  'Arquitectura de Microservicios',
  'Arquitectura de Microservicios',
  'ACAD-MICRO-ARCH',
  'curso-arquitectura-de-microservicios',
  'Diseña y construye sistemas escalables con microservicios. Docker, Kubernetes, mensajería asíncrona y patrones cloud.',
  69.99,
  69.99,
  'Academy',
  'course',
  999,
  'active',
  'available',
  'https://picsum.photos/id/70/640/360'
)
on conflict (tenant_id, course_id) do update set
  price = excluded.price,
  base_price = excluded.base_price,
  status = excluded.status,
  commercial_status = excluded.commercial_status,
  updated_at = now();

commit;
