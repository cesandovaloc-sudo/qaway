-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN 0020 (aditiva, idempotente)
-- Fecha: 2026-11-17 | Convención: gp_* / _c catálogos / _r relaciones
-- Objetivo: catálogo de ESTADOS DE REUNIÓN en el ciclo de gestión de proyectos.
--   (programada, en curso, realizada, cancelada, pospuesta, etc.)
--   Catálogo simple: se crea VACÍO por diseño; el seed se realiza manualmente
--   o por otro agente según las necesidades del proyecto.
-- SIN DROP / SIN TRUNCATE / SOLO ADITIVO.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- §1 · TABLA (crea si no existe; si ya existe, no hace nada)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gp_estados_reunion_c (
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
ALTER TABLE public.gp_estados_reunion_c
  ADD COLUMN IF NOT EXISTS alias text;

-- ==============================================================================
-- §2 · SEED — 6 estados de reunión estándar (idempotente)
-- Basado en estándares PMI/PMBOK y gestión de proyectos.
-- ==============================================================================
INSERT INTO public.gp_estados_reunion_c (codigo, nombre, alias, descripcion, activo, orden, metadata)
VALUES
  ('PROGRAMADA',   'Scheduled',     'Programada',    'La reunión está agendada pero aún no se ha realizado.', true, 1, '{}'::jsonb),
  ('EN_CURSO',     'In progress',   'En curso',      'La reunión está actualmente en desarrollo.', true, 2, '{}'::jsonb),
  ('REALIZADA',    'Completed',     'Realizada',     'La reunión se llevó a cabo y se registraron las actas.', true, 3, '{}'::jsonb),
  ('CANCELADA',    'Cancelled',     'Cancelada',     'La reunión fue cancelada y no se realizará.', true, 4, '{}'::jsonb),
  ('POSPUESTA',    'Postponed',     'Pospuesta',     'La reunión se pospuso para una fecha posterior.', true, 5, '{}'::jsonb),
  ('REPROGRAMADA', 'Rescheduled',   'Reprogramada',  'La reunión cambió de fecha/hora pero sigue vigente.', true, 6, '{}'::jsonb)
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
COMMENT ON TABLE public.gp_estados_reunion_c IS
'Catálogo de ESTADOS DE REUNIÓN en el ciclo de gestión de proyectos (programada, en curso, realizada, cancelada, pospuesta, etc.). Catálogo simple, vacío por diseño; el seed se realiza manualmente o por otro agente según las necesidades del proyecto. Columnas: id = identificador técnico uuid · codigo = código internacional del estado de reunión (ej. PROGRAMADA, EN_CURSO, REALIZADA, CANCELADA, POSPUESTA), UNIQUE, clave referenciada por gp_reuniones.estado_codigo · nombre = término estándar en inglés (no se traduce) · alias = nombre en ESPAÑOL que ve el usuario · descripcion = definición amigable del estado · activo = baja lógica (true = vigente) · orden = orden de presentación · metadata = extensión jsonb reservada ({}) · created_at = creación de la fila · updated_at = última modificación.';

-- ==============================================================================
-- §3 · RLS — mismo patrón que las tablas ya creadas y verificadas
-- ==============================================================================
ALTER TABLE public.gp_estados_reunion_c ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gp_estados_reunion_c_select ON public.gp_estados_reunion_c;
CREATE POLICY gp_estados_reunion_c_select ON public.gp_estados_reunion_c
  FOR SELECT TO authenticated
  USING (public.user_can_use_app('gestor-proyectos'));

DROP POLICY IF EXISTS gp_estados_reunion_c_insert ON public.gp_estados_reunion_c;
CREATE POLICY gp_estados_reunion_c_insert ON public.gp_estados_reunion_c
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_estados_reunion_c_update ON public.gp_estados_reunion_c;
CREATE POLICY gp_estados_reunion_c_update ON public.gp_estados_reunion_c
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_estados_reunion_c_delete ON public.gp_estados_reunion_c;
CREATE POLICY gp_estados_reunion_c_delete ON public.gp_estados_reunion_c
  FOR DELETE TO authenticated
  USING (public.is_platform_admin());

-- ==============================================================================
-- §4 · POST-VERIFICACIÓN
--   Esperado: columnas=10 · filas=6 · politicas=4 · rls=true · alias_nulos=0
-- ==============================================================================
SELECT
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema='public' AND table_name='gp_estados_reunion_c') AS columnas,
  (SELECT count(*) FROM public.gp_estados_reunion_c)                   AS filas,
  (SELECT count(*) FROM pg_policies
     WHERE schemaname='public' AND tablename='gp_estados_reunion_c')    AS politicas,
  (SELECT relrowsecurity FROM pg_class
     WHERE oid='public.gp_estados_reunion_c'::regclass)                 AS rls,
  (SELECT count(*) FROM public.gp_estados_reunion_c WHERE alias IS NULL) AS alias_nulos;

SELECT codigo, nombre, alias, descripcion, orden, activo
  FROM public.gp_estados_reunion_c
 ORDER BY orden;