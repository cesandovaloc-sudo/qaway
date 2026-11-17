-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN 0022 (aditiva, idempotente, autocontenida)
-- Fecha: 2026-11-17
-- Objetivo: crear (si no existen) y cargar seed en las tablas 9, 10 y 11.
--   Autocontenido: incluye CREATE TABLE IF NOT EXISTS + ALTER ADD COLUMN + seed.
--   Basado en estándares PMI/PMBOK y gestión de proyectos.
--   Idempotente: ON CONFLICT (codigo) DO UPDATE, no duplica ni borra datos.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ##############################################################################
-- §0 · TABLA 9: gp_tipos_reunion_c (crea si no existe)
-- ##############################################################################
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
ALTER TABLE public.gp_tipos_reunion_c ADD COLUMN IF NOT EXISTS alias text;

-- RLS (solo si no está habilitado)
ALTER TABLE public.gp_tipos_reunion_c ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_tipos_reunion_c' AND policyname='gp_tipos_reunion_c_select') THEN
    CREATE POLICY gp_tipos_reunion_c_select ON public.gp_tipos_reunion_c FOR SELECT TO authenticated USING (public.user_can_use_app('gestor-proyectos'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_tipos_reunion_c' AND policyname='gp_tipos_reunion_c_insert') THEN
    CREATE POLICY gp_tipos_reunion_c_insert ON public.gp_tipos_reunion_c FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_tipos_reunion_c' AND policyname='gp_tipos_reunion_c_update') THEN
    CREATE POLICY gp_tipos_reunion_c_update ON public.gp_tipos_reunion_c FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_tipos_reunion_c' AND policyname='gp_tipos_reunion_c_delete') THEN
    CREATE POLICY gp_tipos_reunion_c_delete ON public.gp_tipos_reunion_c FOR DELETE TO authenticated USING (public.is_platform_admin());
  END IF;
END $$;

-- Seed §1 · gp_tipos_reunion_c (8 tipos)
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

-- ##############################################################################
-- §1 · TABLA 10: gp_estados_reunion_c (crea si no existe)
-- ##############################################################################
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
ALTER TABLE public.gp_estados_reunion_c ADD COLUMN IF NOT EXISTS alias text;

ALTER TABLE public.gp_estados_reunion_c ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_estados_reunion_c' AND policyname='gp_estados_reunion_c_select') THEN
    CREATE POLICY gp_estados_reunion_c_select ON public.gp_estados_reunion_c FOR SELECT TO authenticated USING (public.user_can_use_app('gestor-proyectos'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_estados_reunion_c' AND policyname='gp_estados_reunion_c_insert') THEN
    CREATE POLICY gp_estados_reunion_c_insert ON public.gp_estados_reunion_c FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_estados_reunion_c' AND policyname='gp_estados_reunion_c_update') THEN
    CREATE POLICY gp_estados_reunion_c_update ON public.gp_estados_reunion_c FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_estados_reunion_c' AND policyname='gp_estados_reunion_c_delete') THEN
    CREATE POLICY gp_estados_reunion_c_delete ON public.gp_estados_reunion_c FOR DELETE TO authenticated USING (public.is_platform_admin());
  END IF;
END $$;

-- Seed §2 · gp_estados_reunion_c (6 estados)
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

-- ##############################################################################
-- §2 · TABLA 11: gp_tipos_avance_c (crea si no existe)
-- ##############################################################################
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
ALTER TABLE public.gp_tipos_avance_c ADD COLUMN IF NOT EXISTS alias text;

ALTER TABLE public.gp_tipos_avance_c ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_tipos_avance_c' AND policyname='gp_tipos_avance_c_select') THEN
    CREATE POLICY gp_tipos_avance_c_select ON public.gp_tipos_avance_c FOR SELECT TO authenticated USING (public.user_can_use_app('gestor-proyectos'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_tipos_avance_c' AND policyname='gp_tipos_avance_c_insert') THEN
    CREATE POLICY gp_tipos_avance_c_insert ON public.gp_tipos_avance_c FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_tipos_avance_c' AND policyname='gp_tipos_avance_c_update') THEN
    CREATE POLICY gp_tipos_avance_c_update ON public.gp_tipos_avance_c FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gp_tipos_avance_c' AND policyname='gp_tipos_avance_c_delete') THEN
    CREATE POLICY gp_tipos_avance_c_delete ON public.gp_tipos_avance_c FOR DELETE TO authenticated USING (public.is_platform_admin());
  END IF;
END $$;

-- Seed §3 · gp_tipos_avance_c (6 tipos)
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

-- ##############################################################################
-- §3 · POST-VERIFICACIÓN
-- ##############################################################################
SELECT 'gp_tipos_reunion_c' AS tabla, count(*) AS filas FROM public.gp_tipos_reunion_c
UNION ALL SELECT 'gp_estados_reunion_c', count(*) FROM public.gp_estados_reunion_c
UNION ALL SELECT 'gp_tipos_avance_c', count(*) FROM public.gp_tipos_avance_c
ORDER BY tabla;