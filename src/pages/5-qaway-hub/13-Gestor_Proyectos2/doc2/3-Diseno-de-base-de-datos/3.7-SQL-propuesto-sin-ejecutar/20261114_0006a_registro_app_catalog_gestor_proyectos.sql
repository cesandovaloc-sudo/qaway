-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0006a
-- Archivo: 20261114_0006a_registro_app_catalog_gestor_proyectos.sql
-- Fecha: 2026-11-14 | Registro idempotente de 'gestor-proyectos' en app_catalog
-- SIN DROP/TRUNCATE. NO crea suscripciones ni roles (dependencias del admin del
-- Hub, documentadas al final). Re-ejecutable sin duplicar (on conflict do nothing).
-- ==============================================================================
-- Estructura REAL verificada en el proyecto (20260921130000_saas_apps_plans_permissions.sql:10-22):
--   public.app_catalog ( id uuid primary key default gen_random_uuid(),
--                        slug text unique not null,
--                        name text not null,
--                        created_at timestamptz not null default now() )
--   · SIN columna 'status' (el DDL del Hub no la define; si el proyecto vivo
--     añadió columnas extra, el INSERT de abajo solo usa slug+name y sigue válido).
--   · Semillas actuales: crm, inventario, agenda, blog (sin slug de Gestor).
--
-- Nota de gobernanza (requisito Etapa 4): el acceso de EMPRESA a Gestor de
-- Proyectos se resuelve con los helpers del Hub —
--   user_can_use_app('gestor-proyectos')  (20260921134000: v2, rol + suscripción)
--   user_app_role('gestor-proyectos')     (admin|editor|viewer|guest)
-- Ambos hacen JOIN app_catalog por slug: sin este registro, el acceso de
-- empresa queda DENEGADO (solo plataforma opera) — fail-closed, no error.
-- ==============================================================================

-- 1) Guardia de estructura: aborta ANTES de escribir si la tabla no es la esperada.
DO $$
DECLARE v_cols text;
BEGIN
  IF to_regclass('public.app_catalog') IS NULL THEN
    RAISE EXCEPTION
      '0006a: public.app_catalog no existe. Aplica 20260921130000_saas_apps_plans_permissions.sql antes. Migración abortada SIN cambios.';
  END IF;
  SELECT string_agg(column_name || ':' || data_type, ', ' ORDER BY ordinal_position)
    INTO v_cols
    FROM information_schema.columns
   WHERE table_schema = 'public' AND table_name = 'app_catalog';
  RAISE NOTICE '0006a · app_catalog en vivo: %', coalesce(v_cols, '(sin columnas?)');
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'app_catalog' AND column_name = 'slug'
  ) OR NOT EXISTS (
    SELECT 1 FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'app_catalog' AND column_name = 'name'
  ) THEN
    RAISE EXCEPTION
      '0006a: app_catalog no tiene las columnas (slug, name) verificadas. Migración abortada SIN cambios.';
  END IF;
END $$;

-- 2) Registro idempotente con SOLO las columnas verificadas (sin inventar nada).
INSERT INTO public.app_catalog (slug, name)
VALUES ('gestor-proyectos', 'Gestor de Proyectos')
ON CONFLICT (slug) DO NOTHING;

-- ==============================================================================
-- 3) Verificación posterior (ejecutar después de aplicar):
--
--    SELECT id, slug, name, created_at FROM public.app_catalog ORDER BY slug;
--    → debe listar 5 filas: agenda, blog, crm, gestor-proyectos, inventario.
--    SELECT id FROM public.app_catalog WHERE slug = 'gestor-proyectos';
--    → 1 fila; guarda ese uuid para los pasos del admin.
--
-- 4) ACCIONES DEL ADMIN DEL HUB para habilitar la app a cada empresa
--    (vía la UI EXISTENTE del Hub; aquí NO se crean filas ficticias):
--
--    a) Contratar/suscribir la app para la marca:
--       Flujo comercial del Hub, o equivalentemente:
--       INSERT INTO public.tenant_app_subscriptions (tenant_id, app_id, plan, status)
--       VALUES (<tenant uuid>, <id de gestor-proyectos>, 'basico', 'active');
--       · plan ∈ (basico|intermedio|premium); status ∈ (pending|trialing|active|
--         suspended|cancelled|expired) según CHECK vigente (20260921134000).
--       · user_can_use_app v2: si la empresa NO tiene fila de suscripción,
--         el rol basta (legacy abierto); CON fila exige 'active' o 'trialing'
--         vigente. Recomendado: dejar suscripción 'active'.
--
--    b) Asignar rol por usuario:
--       INSERT INTO public.user_app_roles (user_id, tenant_id, app_id, role)
--       VALUES (<user uuid>, <tenant uuid>, <id de gestor-proyectos>, 'admin')
--       ON CONFLICT (user_id, tenant_id, app_id)
--       DO UPDATE SET role = excluded.role, updated_at = now();
--       · role ∈ (admin|editor|viewer|guest). Escritura de unidades exige
--         admin|editor (migración 0006b y contexto de sesión del módulo).
--
--    c) Opcional (comercial): fila en public.app_plan_pricing por plan
--       (uq (app_id, plan)) para que la UI de contratación ofrezca precio/trial
--       de gestor-proyectos. Solo el admin decide montos; no se seeda aquí.
-- ==============================================================================
