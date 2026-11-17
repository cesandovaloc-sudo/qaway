-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN 0015 (aditiva, idempotente)
-- Fecha: 2026-11-17 | Convención: gp_* / _c catálogos / _r relaciones
-- Objetivo: catálogo de TIPOS DE ENTREGABLE (vacío por diseño; se llena
--   cuando el negocio defina la tipología: documento, hito, producto, etc.).
--   FK gp_entregables.tipo_codigo es NULL-able, así que la tabla puede estar
--   vacía sin romper nada.
-- SIN DROP / SIN TRUNCATE / SOLO ADITIVO / SIN SEED.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- §1 · TABLA (crea si no existe; si ya existe, no hace nada)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gp_tipos_entregable_c (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      text NOT NULL,                          -- código internacional (ej. DOC, HITO, PROD)
  nombre      text NOT NULL,                          -- término estándar en inglés (no se traduce)
  alias       text,                                   -- nombre en ESPAÑOL que ve el usuario
  descripcion text,                                   -- definición amigable del tipo
  activo      boolean NOT NULL DEFAULT true,
  orden       integer DEFAULT 0,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

-- ==============================================================================
-- §1b · ADITIVO — agrega columnas si la tabla ya existía sin ellas
-- ==============================================================================
ALTER TABLE public.gp_tipos_entregable_c
  ADD COLUMN IF NOT EXISTS alias       text;
ALTER TABLE public.gp_tipos_entregable_c
  ADD COLUMN IF NOT EXISTS descripcion text;

-- ==============================================================================
-- §2 · SEED — intencionalmente VACÍO (sin seed hasta definición funcional)
-- ==============================================================================
-- No se insertan filas. gp_entregables.tipo_codigo es NULL-able.

-- ==============================================================================
-- §3 · COMENTARIO (regla vigente: un solo COMMENT ON TABLE, sin COMMENT ON COLUMN)
-- ==============================================================================
COMMENT ON TABLE public.gp_tipos_entregable_c IS
'Catálogo de TIPOS DE ENTREGABLE del proyecto (documento, hito, producto, etc.). VACÍO por diseño: se llena únicamente cuando el negocio defina la tipología; no se inventan valores. Columnas: id = identificador técnico uuid · codigo = código internacional del tipo (ej. DOC, HITO, PROD), UNIQUE, clave referenciada por gp_entregables.tipo_codigo (NULL-able, ON UPDATE CASCADE) · nombre = término estándar en inglés, no se traduce · alias = nombre en ESPAÑOL que ve el usuario · descripcion = definición amigable del tipo · activo = baja lógica (true = vigente) · orden = orden de presentación · metadata = extensión jsonb reservada ({}) · created_at = creación de la fila · updated_at = última modificación. Referenciado por gp_entregables (tabla 30, tipo_codigo NULL-able).';

-- ==============================================================================
-- §4 · RLS — mismo patrón que las tablas ya creadas y verificadas
--   lectura  → user_can_use_app('gestor-proyectos')   (app contratada)
--   escritura→ is_platform_admin()                    (solo plataforma)
--   anon     → sin política (no lee)
-- ==============================================================================
ALTER TABLE public.gp_tipos_entregable_c ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gp_tipos_entregable_c_select ON public.gp_tipos_entregable_c;
CREATE POLICY gp_tipos_entregable_c_select ON public.gp_tipos_entregable_c
  FOR SELECT TO authenticated
  USING (public.user_can_use_app('gestor-proyectos'));

DROP POLICY IF EXISTS gp_tipos_entregable_c_insert ON public.gp_tipos_entregable_c;
CREATE POLICY gp_tipos_entregable_c_insert ON public.gp_tipos_entregable_c
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_tipos_entregable_c_update ON public.gp_tipos_entregable_c;
CREATE POLICY gp_tipos_entregable_c_update ON public.gp_tipos_entregable_c
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_tipos_entregable_c_delete ON public.gp_tipos_entregable_c;
CREATE POLICY gp_tipos_entregable_c_delete ON public.gp_tipos_entregable_c
  FOR DELETE TO authenticated
  USING (public.is_platform_admin());

-- ==============================================================================
-- §5 · POST-VERIFICACIÓN
--   Esperado: filas=0 · politicas=4 · rls=true · columnas=9 (con alias)
-- ==============================================================================
SELECT
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema='public' AND table_name='gp_tipos_entregable_c') AS columnas,
  (SELECT count(*) FROM public.gp_tipos_entregable_c)                   AS filas,
  (SELECT count(*) FROM pg_policies
     WHERE schemaname='public' AND tablename='gp_tipos_entregable_c')    AS politicas,
  (SELECT relrowsecurity FROM pg_class
     WHERE oid='public.gp_tipos_entregable_c'::regclass)                 AS rls,
  (SELECT count(*) FROM pg_policies
     WHERE schemaname='public' AND tablename='gp_tipos_entregable_c'
       AND 'anon'=ANY(roles))                                            AS anon;