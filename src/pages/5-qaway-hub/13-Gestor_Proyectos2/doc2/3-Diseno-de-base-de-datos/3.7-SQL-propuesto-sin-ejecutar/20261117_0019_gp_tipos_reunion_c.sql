-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN 0019 (aditiva, idempotente)
-- Fecha: 2026-11-17 | Convención: gp_* / _c catálogos / _r relaciones
-- Objetivo: catálogo de TIPOS DE REUNIÓN utilizados en la gestión de proyectos.
--   (kickoff, seguimiento, revisión de sprint, retrospectiva, cierre, etc.)
--   Catálogo simple: se crea VACÍO por diseño; el seed se hace manualmente
--   o por otro agente según las necesidades del proyecto.
-- SIN DROP / SIN TRUNCATE / SOLO ADITIVO.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- §1 · TABLA (crea si no existe; si ya existe, no hace nada)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gp_tipos_reunion_c (
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
ALTER TABLE public.gp_tipos_reunion_c
  ADD COLUMN IF NOT EXISTS alias text;

-- ==============================================================================
-- §2 · SEED — 8 tipos de reunión estándar (idempotente)
-- Basado en estándares PMI/PMBOK y gestión de proyectos.
-- ==============================================================================
INSERT INTO public.gp_tipos_reunion_c (codigo, nombre, alias, descripcion, activo, orden, metadata)
VALUES
  ('KICKOFF',       'Kickoff meeting',     'Reunión de inicio',        'Reunión inicial para presentar el proyecto, objetivos, equipo y plan de trabajo a todos los involucrados.', true, 1, '{}'::jsonb),
  ('SEGUIMIENTO',   'Status meeting',      'Reunión de seguimiento',   'Reunión periódica para revisar avances, bloqueos y próximos pasos del proyecto.', true, 2, '{}'::jsonb),
  ('COMITE',        'Steering committee',  'Comité directivo',         'Reunión de alto nivel con patrocinadores y stakeholders para decisiones estratégicas.', true, 3, '{}'::jsonb),
  ('PLANIFICACION', 'Planning session',    'Sesión de planificación',  'Sesión para definir alcance, cronograma, recursos y riesgos del proyecto o sprint.', true, 4, '{}'::jsonb),
  ('REVISION',      'Review meeting',      'Reunión de revisión',      'Reunión para revisar entregables, resultados y calidad con el cliente o stakeholders.', true, 5, '{}'::jsonb),
  ('RETROSPECTIVA', 'Retrospective',       'Retrospectiva',            'Reunión de cierre de ciclo para identificar mejoras y lecciones aprendidas.', true, 6, '{}'::jsonb),
  ('CIERRE',        'Closure meeting',     'Reunión de cierre',        'Reunión final para formalizar la aceptación del proyecto y liberar recursos.', true, 7, '{}'::jsonb),
  ('DAILY',         'Daily standup',       'Reunión diaria',           'Reunión breve diaria para sincronizar al equipo sobre avances y bloqueos.', true, 8, '{}'::jsonb)
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
COMMENT ON TABLE public.gp_tipos_reunion_c IS
'Catálogo de TIPOS DE REUNIÓN utilizados en la gestión de proyectos (kickoff, seguimiento, revisión de sprint, retrospectiva, cierre, etc.). Catálogo simple, vacío por diseño; el seed se realiza manualmente o por otro agente según las necesidades del proyecto. Columnas: id = identificador técnico uuid · codigo = código internacional del tipo de reunión (ej. KICKOFF, SEGUIMIENTO, RETRO), UNIQUE, clave referenciada por gp_reuniones.tipo_codigo · nombre = término estándar en inglés (no se traduce) · alias = nombre en ESPAÑOL que ve el usuario · descripcion = definición amigable del tipo de reunión · activo = baja lógica (true = vigente) · orden = orden de presentación · metadata = extensión jsonb reservada ({}) · created_at = creación de la fila · updated_at = última modificación.';

-- ==============================================================================
-- §3 · RLS — mismo patrón que las tablas ya creadas y verificadas
-- ==============================================================================
ALTER TABLE public.gp_tipos_reunion_c ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gp_tipos_reunion_c_select ON public.gp_tipos_reunion_c;
CREATE POLICY gp_tipos_reunion_c_select ON public.gp_tipos_reunion_c
  FOR SELECT TO authenticated
  USING (public.user_can_use_app('gestor-proyectos'));

DROP POLICY IF EXISTS gp_tipos_reunion_c_insert ON public.gp_tipos_reunion_c;
CREATE POLICY gp_tipos_reunion_c_insert ON public.gp_tipos_reunion_c
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_tipos_reunion_c_update ON public.gp_tipos_reunion_c;
CREATE POLICY gp_tipos_reunion_c_update ON public.gp_tipos_reunion_c
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_tipos_reunion_c_delete ON public.gp_tipos_reunion_c;
CREATE POLICY gp_tipos_reunion_c_delete ON public.gp_tipos_reunion_c
  FOR DELETE TO authenticated
  USING (public.is_platform_admin());

-- ==============================================================================
-- §4 · POST-VERIFICACIÓN
--   Esperado: columnas=10 · filas=8 · politicas=4 · rls=true · alias_nulos=0
-- ==============================================================================
SELECT
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema='public' AND table_name='gp_tipos_reunion_c') AS columnas,
  (SELECT count(*) FROM public.gp_tipos_reunion_c)                   AS filas,
  (SELECT count(*) FROM pg_policies
     WHERE schemaname='public' AND tablename='gp_tipos_reunion_c')    AS politicas,
  (SELECT relrowsecurity FROM pg_class
     WHERE oid='public.gp_tipos_reunion_c'::regclass)                 AS rls,
  (SELECT count(*) FROM public.gp_tipos_reunion_c WHERE alias IS NULL) AS alias_nulos;

SELECT codigo, nombre, alias, descripcion, orden, activo
  FROM public.gp_tipos_reunion_c
 ORDER BY orden;