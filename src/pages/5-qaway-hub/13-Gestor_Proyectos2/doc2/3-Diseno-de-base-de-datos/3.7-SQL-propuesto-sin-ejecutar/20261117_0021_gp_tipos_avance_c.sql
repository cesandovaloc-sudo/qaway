-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN 0021 (aditiva, idempotente)
-- Fecha: 2026-11-17 | Convención: gp_* / _c catálogos / _r relaciones
-- Objetivo: catálogo de TIPOS DE AVANCE registrados en la gestión de proyectos.
--   (reporte de avance, actualización de estado, hito alcanzado, etc.)
--   Catálogo simple: se crea VACÍO por diseño; el seed se realiza manualmente
--   o por otro agente según las necesidades del proyecto.
-- SIN DROP / SIN TRUNCATE / SOLO ADITIVO.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- §1 · TABLA (crea si no existe; si ya existe, no hace nada)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gp_tipos_avance_c (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      text NOT NULL,
  nombre      text NOT NULL,
  alias       text,
  descripcion text,
  activo      boolean NOT NULL DEFAULT true,
  orden       integer DEFAULT 0,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

-- ==============================================================================
-- §1b · ADITIVO — agrega `alias` si la tabla ya existía sin esa columna
-- ==============================================================================
ALTER TABLE public.gp_tipos_avance_c
  ADD COLUMN IF NOT EXISTS alias text;

-- ==============================================================================
-- §2 · SEED — 6 tipos de avance estándar (idempotente)
-- Basado en estándares PMI/PMBOK y gestión de proyectos.
-- ==============================================================================
INSERT INTO public.gp_tipos_avance_c (codigo, nombre, alias, descripcion, activo, orden, metadata)
VALUES
  ('FISICO',       'Physical progress',   'Avance físico',        'Avance basado en cantidad de trabajo físico completado respecto al plan.', true, 1, '{}'::jsonb),
  ('FINANCIERO',   'Financial progress',  'Avance financiero',    'Avance basado en el porcentaje de presupuesto ejecutado respecto al plan.', true, 2, '{}'::jsonb),
  ('HITO',         'Milestone',           'Hito alcanzado',       'Registro de cumplimiento de un hito clave del proyecto.', true, 3, '{}'::jsonb),
  ('CRONOGRAMA',   'Schedule progress',   'Avance de cronograma', 'Avance basado en el cumplimiento de fechas del cronograma (SPI).', true, 4, '{}'::jsonb),
  ('COSTO',        'Cost progress',       'Avance de costo',      'Avance basado en el desempeño de costos (CPI) respecto al plan.', true, 5, '{}'::jsonb),
  ('CALIDAD',      'Quality progress',    'Avance de calidad',    'Avance basado en métricas de calidad y cumplimiento de estándares.', true, 6, '{}'::jsonb)
ON CONFLICT (codigo) DO UPDATE
SET nombre      = EXCLUDED.nombre,
    alias       = EXCLUDED.alias,
    descripcion = EXCLUDED.descripcion,
    activo      = EXCLUDED.activo,
    orden       = EXCLUDED.orden,
    updated_at  = now();

-- ==============================================================================
-- §3 · COMENTARIO (regla vigente: un solo COMMENT ON TABLE, sin COMMENT ON COLUMN)
-- ==============================================================================
COMMENT ON TABLE public.gp_tipos_avance_c IS
'Catálogo de TIPOS DE AVANCE registrados en la gestión de proyectos (reporte de avance, actualización de estado, hito alcanzado, etc.). Catálogo simple, vacío por diseño; el seed se realiza manualmente o por otro agente según las necesidades del proyecto. Columnas: id = identificador técnico uuid · codigo = código internacional del tipo de avance (ej. REPORTE_AVANCE, ACTUALIZACION_ESTADO, HITO_ALCANZADO), UNIQUE, clave referenciada por gp_avances.tipo_codigo · nombre = término estándar en inglés (no se traduce) · alias = nombre en ESPAÑOL que ve el usuario · descripcion = definición amigable del tipo de avance · activo = baja lógica (true = vigente) · orden = orden de presentación · metadata = extensión jsonb reservada ({}) · created_at = creación de la fila · updated_at = última modificación.';

-- ==============================================================================
-- §3 · RLS — mismo patrón que las tablas ya creadas y verificadas
-- ==============================================================================
ALTER TABLE public.gp_tipos_avance_c ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gp_tipos_avance_c_select ON public.gp_tipos_avance_c;
CREATE POLICY gp_tipos_avance_c_select ON public.gp_tipos_avance_c
  FOR SELECT TO authenticated
  USING (public.user_can_use_app('gestor-proyectos'));

DROP POLICY IF EXISTS gp_tipos_avance_c_insert ON public.gp_tipos_avance_c;
CREATE POLICY gp_tipos_avance_c_insert ON public.gp_tipos_avance_c
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_tipos_avance_c_update ON public.gp_tipos_avance_c;
CREATE POLICY gp_tipos_avance_c_update ON public.gp_tipos_avance_c
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_tipos_avance_c_delete ON public.gp_tipos_avance_c;
CREATE POLICY gp_tipos_avance_c_delete ON public.gp_tipos_avance_c
  FOR DELETE TO authenticated
  USING (public.is_platform_admin());

-- ==============================================================================
-- §4 · POST-VERIFICACIÓN
--   Esperado: columnas=10 · filas=6 · politicas=4 · rls=true · alias_nulos=0
-- ==============================================================================
SELECT
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema='public' AND table_name='gp_tipos_avance_c') AS columnas,
  (SELECT count(*) FROM public.gp_tipos_avance_c)                   AS filas,
  (SELECT count(*) FROM pg_policies
     WHERE schemaname='public' AND tablename='gp_tipos_avance_c')    AS politicas,
  (SELECT relrowsecurity FROM pg_class
     WHERE oid='public.gp_tipos_avance_c'::regclass)                 AS rls,
  (SELECT count(*) FROM public.gp_tipos_avance_c WHERE alias IS NULL) AS alias_nulos;

SELECT codigo, nombre, alias, descripcion, orden, activo
  FROM public.gp_tipos_avance_c
 ORDER BY orden;