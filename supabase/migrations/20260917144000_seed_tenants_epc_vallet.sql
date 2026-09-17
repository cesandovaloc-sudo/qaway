-- ============================================================
-- SEED TENANTS & SERVICES: EPC ESTUDIO CONTABLE & VALLET INMOBILIARIA
-- ============================================================
-- Objetivo:
-- 1. Registrar a EPC Estudio Contable y Vallet Inmobiliaria en public.tenants
--    completando el cuarteto de tenants de Qaway Lab (Qaway Lab, CoraVet, EPC, Vallet).
-- 2. Cargar los 6 servicios profesionales de EPC Contable en public.products.
-- 3. Cargar los 3 servicios inmobiliarios de Vallet en public.products.
-- 4. Mantener la idempotencia total (on conflict do update).
-- ============================================================

-- ─── 1. REGISTRO DE TENANTS COMPLEMENTARIOS ──────────────────

-- Tenant 002: EPC Estudio Contable
insert into public.tenants (
  id,
  client_code,
  slug,
  name,
  legal_name,
  subdomain,
  status,
  branding,
  content,
  features,
  payment_settings
) values (
  '11111111-2222-3333-4444-555555555555'::uuid,
  'QW-3M9K1',
  'epc-contable',
  'Estudio Contable Pro',
  'Estudio Contable Pro S.A.C.',
  'epc',
  'active',
  '{
    "colors": {
      "primary": "#1e3a8a",
      "secondary": "#3b82f6",
      "accent": "#60a5fa"
    },
    "typography": "Inter, sans-serif",
    "logo_url": "https://www.estudiocontablepro.pe/images/hero-contadora-duotono.png"
  }'::jsonb,
  '{
    "tagline": "Contabilidad clara para decisiones más seguras",
    "contact": {
      "email": "hola@ecpcontablepro.pe",
      "phone": "+51 998 888 777",
      "address": "Av. Caminos del Inca 1234, Of. 502, Surco, Lima"
    }
  }'::jsonb,
  '{"ecommerce": false, "catalog": true, "services": true, "quotations": true}'::jsonb,
  '{"currency": "PEN", "allow_cash": true, "allow_transfer": true}'::jsonb
)
on conflict (slug) do update set
  name             = excluded.name,
  legal_name       = excluded.legal_name,
  subdomain        = excluded.subdomain,
  status           = excluded.status,
  branding         = excluded.branding,
  content          = excluded.content,
  features         = excluded.features,
  payment_settings = excluded.payment_settings,
  updated_at       = now();

-- Tenant 003: Vallet Inmobiliaria
insert into public.tenants (
  id,
  client_code,
  slug,
  name,
  legal_name,
  subdomain,
  status,
  branding,
  content,
  features,
  payment_settings
) values (
  '22222222-3333-4444-5555-666666666666'::uuid,
  'QW-4V8L2',
  'vallet-inmobiliaria',
  'Vallet Inmobiliaria',
  'Vallet Real Estate Group S.A.C.',
  'vallet',
  'active',
  '{
    "colors": {
      "primary": "#0f172a",
      "secondary": "#b45309",
      "accent": "#f59e0b"
    },
    "typography": "Outfit, sans-serif"
  }'::jsonb,
  '{
    "tagline": "Asesoría Inmobiliaria y Gestión Patrimonial de Alto Nivel",
    "contact": {
      "email": "contacto@vallet.pe",
      "phone": "+51 987 654 321",
      "address": "Miraflores, Lima, Perú"
    }
  }'::jsonb,
  '{"ecommerce": false, "catalog": true, "properties": true, "advisory": true}'::jsonb,
  '{"currency": "USD", "allow_transfer": true}'::jsonb
)
on conflict (slug) do update set
  name             = excluded.name,
  legal_name       = excluded.legal_name,
  subdomain        = excluded.subdomain,
  status           = excluded.status,
  branding         = excluded.branding,
  content          = excluded.content,
  features         = excluded.features,
  payment_settings = excluded.payment_settings,
  updated_at       = now();

-- ─── 2. SIEMBRA DE SERVICIOS PARA EPC ESTUDIO CONTABLE ───────
-- UUID EPC: 11111111-2222-3333-4444-555555555555
insert into public.products (
  tenant_id,
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
  commercial_status
) values 
(
  '11111111-2222-3333-4444-555555555555'::uuid,
  'Contabilidad General',
  'Contabilidad General',
  'EPC-SRV-001',
  'contabilidad-general',
  'Registro y control contable preciso para una gestión financiera ordenada y cumplimiento normativo.',
  350.00,
  350.00,
  'Contabilidad',
  'service',
  999,
  'active',
  'available'
),
(
  '11111111-2222-3333-4444-555555555555'::uuid,
  'Declaraciones Tributarias SUNAT',
  'Declaraciones Tributarias SUNAT',
  'EPC-SRV-002',
  'declaraciones-tributarias-sunat',
  'Presentación mensual y anual puntual y segura de obligaciones tributarias ante SUNAT.',
  280.00,
  280.00,
  'Tributación',
  'service',
  999,
  'active',
  'available'
),
(
  '11111111-2222-3333-4444-555555555555'::uuid,
  'Asesoría y Planeamiento Tributario',
  'Asesoría y Planeamiento Tributario',
  'EPC-SRV-003',
  'asesoria-planeamiento-tributario',
  'Estrategias legales para optimizar la carga impositiva y prevenir contingencias fiscales.',
  450.00,
  450.00,
  'Asesoría',
  'service',
  999,
  'active',
  'available'
),
(
  '11111111-2222-3333-4444-555555555555'::uuid,
  'Gestión de Planillas y RRHH',
  'Gestión de Planillas y RRHH',
  'EPC-SRV-004',
  'gestion-planillas-rrhh',
  'Cálculo de remuneraciones, boletas, beneficios sociales y cumplimiento laboral estricto.',
  300.00,
  300.00,
  'Planillas',
  'service',
  999,
  'active',
  'available'
),
(
  '11111111-2222-3333-4444-555555555555'::uuid,
  'Estados Financieros y Auditoría',
  'Estados Financieros y Auditoría',
  'EPC-SRV-005',
  'estados-financieros-auditoria',
  'Elaboración de balances, estados de resultados y reportes ejecutivos para bancos y directores.',
  500.00,
  500.00,
  'Finanzas',
  'service',
  999,
  'active',
  'available'
),
(
  '11111111-2222-3333-4444-555555555555'::uuid,
  'Asesoría Empresarial Estratégica',
  'Asesoría Empresarial Estratégica',
  'EPC-SRV-006',
  'asesoria-empresarial-estrategica',
  'Acompañamiento financiero para el crecimiento estructurado y sostenible de tu empresa.',
  400.00,
  400.00,
  'Asesoría',
  'service',
  999,
  'active',
  'available'
)
on conflict (tenant_id, slug) do update set
  name              = excluded.name,
  title             = excluded.title,
  price             = excluded.price,
  base_price        = excluded.base_price,
  description       = excluded.description,
  category          = excluded.category,
  type              = excluded.type,
  stock             = excluded.stock,
  status            = excluded.status,
  commercial_status = excluded.commercial_status,
  updated_at        = now();

-- ─── 3. SIEMBRA DE SERVICIOS PARA VALLET INMOBILIARIA ────────
-- UUID Vallet: 22222222-3333-4444-5555-666666666666
insert into public.products (
  tenant_id,
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
  commercial_status
) values 
(
  '22222222-3333-4444-5555-666666666666'::uuid,
  'Gestión Integral de Alquiler Residencial',
  'Gestión Integral de Alquiler Residencial',
  'VAL-SRV-001',
  'gestion-alquiler-residencial',
  'Filtro de inquilinos, contratos blindados, cobranza mensual y administración total de tu propiedad.',
  1200.00,
  1200.00,
  'Alquileres',
  'service',
  999,
  'active',
  'available'
),
(
  '22222222-3333-4444-5555-666666666666'::uuid,
  'Corretaje y Venta de Inmuebles Prime',
  'Corretaje y Venta de Inmuebles Prime',
  'VAL-SRV-002',
  'corretaje-venta-inmuebles-prime',
  'Promoción premium con tours virtuales, fotografía profesional y cierre notarial garantizado.',
  2500.00,
  2500.00,
  'Ventas',
  'service',
  999,
  'active',
  'available'
),
(
  '22222222-3333-4444-5555-666666666666'::uuid,
  'Asesoría de Inversión y Gestión Patrimonial',
  'Asesoría de Inversión y Gestión Patrimonial',
  'VAL-SRV-003',
  'asesoria-inversion-patrimonial',
  'Análisis de rentabilidad CAP rate, plusvalía de zonas y estructuración de carteras inmobiliarias.',
  800.00,
  800.00,
  'Asesoría',
  'service',
  999,
  'active',
  'available'
)
on conflict (tenant_id, slug) do update set
  name              = excluded.name,
  title             = excluded.title,
  price             = excluded.price,
  base_price        = excluded.base_price,
  description       = excluded.description,
  category          = excluded.category,
  type              = excluded.type,
  stock             = excluded.stock,
  status            = excluded.status,
  commercial_status = excluded.commercial_status,
  updated_at        = now();
