-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN 0023 (aditiva, idempotente)
-- Fecha: 2026-11-17 | Convención: gp_* / _c catálogos / _r relaciones
-- Objetivo: catálogo de TIPOS DE ARCHIVO adjunto en la gestión de proyectos.
--   (plano, contrato, foto, acta, informe, correspondencia, etc.)
--   Seed incluido basado en estándares de gestión documental de proyectos.
-- SIN DROP / SIN TRUNCATE / SOLO ADITIVO.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- §1 · TABLA (crea si no existe; si ya existe, no hace nada)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gp_tipos_archivo_c (
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
ALTER TABLE public.gp_tipos_archivo_c
  ADD COLUMN IF NOT EXISTS alias text;

-- ==============================================================================
-- §2 · SEED — 7 tipos de archivo estándar (idempotente)
-- Basado en gestión documental de proyectos (PMI/PMBOK).
-- ==============================================================================
INSERT INTO public.gp_tipos_archivo_c (codigo, nombre, alias, descripcion, activo, orden, metadata)
VALUES
  ('PLANO',            'Drawing',        'Plano',            'Planos, dibujos técnicos y diagramas de ingeniería.', true, 1, '{}'::jsonb),
  ('CONTRATO',         'Contract',       'Contrato',         'Contratos, acuerdos y documentos legales del proyecto.', true, 2, '{}'::jsonb),
  ('FOTO',             'Photo',          'Fotografía',       'Fotografías de avance, inspección o evidencia del proyecto.', true, 3, '{}'::jsonb),
  ('ACTA',             'Minutes',        'Acta',             'Actas de reunión, minutas y registros de decisiones.', true, 4, '{}'::jsonb),
  ('INFORME',          'Report',         'Informe',          'Informes de avance, cierre y reportes técnicos.', true, 5, '{}'::jsonb),
  ('CORRESPONDENCIA',  'Correspondence', 'Correspondencia',  'Cartas, correos y comunicaciones formales del proyecto.', true, 6, '{}'::jsonb),
  ('OTRO',             'Other',          'Otro',             'Otros documentos no clasificados en las categorías anteriores.', true, 7, '{}'::jsonb)
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
COMMENT ON TABLE public.gp_tipos_archivo_c IS
'Catálogo de TIPOS DE ARCHIVO adjunto en la gestión de proyectos (plano, contrato, foto, acta, informe, correspondencia, etc.). Basado en estándares de gestión documental PMI/PMBOK. Catálogo simple con seed estándar. Columnas: id = identificador técnico uuid · codigo = código internacional del tipo de archivo (PLANO, CONTRATO, FOTO, ACTA, INFORME, CORRESPONDENCIA, OTRO), UNIQUE, clave referenciada por gp_archivos.tipo_codigo · nombre = término estándar en inglés (no se traduce) · alias = nombre en ESPAÑOL que ve el usuario · descripcion = definición amigable del tipo de archivo · activo = baja lógica (true = vigente) · orden = orden de presentación · metadata = extensión jsonb reservada ({}) · created_at = creación de la fila · updated_at = última modificación.';

-- ==============================================================================
-- §4 · RLS — mismo patrón que las tablas ya creadas y verificadas
-- ==============================================================================
ALTER TABLE public.gp_tipos_archivo_c ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gp_tipos_archivo_c_select ON public.gp_tipos_archivo_c;
CREATE POLICY gp_tipos_archivo_c_select ON public.gp_tipos_archivo_c
  FOR SELECT TO authenticated
  USING (public.user_can_use_app('gestor-proyectos'));

DROP POLICY IF EXISTS gp_tipos_archivo_c_insert ON public.gp_tipos_archivo_c;
CREATE POLICY gp_tipos_archivo_c_insert ON public.gp_tipos_archivo_c
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_tipos_archivo_c_update ON public.gp_tipos_archivo_c;
CREATE POLICY gp_tipos_archivo_c_update ON public.gp_tipos_archivo_c
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_tipos_archivo_c_delete ON public.gp_tipos_archivo_c;
CREATE POLICY gp_tipos_archivo_c_delete ON public.gp_tipos_archivo_c
  FOR DELETE TO authenticated
  USING (public.is_platform_admin());

-- ==============================================================================
-- §5 · POST-VERIFICACIÓN
--   Esperado: columnas=10 · filas=7 · politicas=4 · rls=true · alias_nulos=0
-- ==============================================================================
SELECT
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema='public' AND table_name='gp_tipos_archivo_c') AS columnas,
  (SELECT count(*) FROM public.gp_tipos_archivo_c)                   AS filas,
  (SELECT count(*) FROM pg_policies
     WHERE schemaname='public' AND tablename='gp_tipos_archivo_c')    AS politicas,
  (SELECT relrowsecurity FROM pg_class
     WHERE oid='public.gp_tipos_archivo_c'::regclass)                 AS rls,
  (SELECT count(*) FROM public.gp_tipos_archivo_c WHERE alias IS NULL) AS alias_nulos;

SELECT codigo, nombre, alias, descripcion, orden, activo
  FROM public.gp_tipos_archivo_c
 ORDER BY orden;