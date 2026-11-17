-- ==============================================================================
-- GESTOR DE PROYECTOS 2 . MIGRACION 0017 (aditiva, idempotente)
-- Fecha: 2026-11-17 | Convencion: gp_* / _c catalogos
-- Objetivo: catalogo de ESTADOS DE ENTREGABLE (tabla 8) con columnas canonicas
--   (codigo, nombre, alias, descripcion, icono, activo, orden, metadata).
--   Seed unificado con terminologia existente (pendiente, en_proceso, en_revision,
--   completado, bloqueada, cancelado) + aprobado/rechazado especificos.
-- SIN DROP / SIN TRUNCATE / SOLO ADITIVO / idempotente.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- S1 . TABLA DE ESTADOS DE ENTREGABLE (8) - nueva (o upgrade si existia con esquema viejo)
CREATE TABLE IF NOT EXISTS public.gp_estados_entregable_c (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      text NOT NULL,
  nombre      text NOT NULL,
  alias       text NOT NULL,
  descripcion text,
  icono       text,
  activo      boolean NOT NULL DEFAULT true,
  orden       integer DEFAULT 0,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

-- Upgrade defensivo por si la tabla existia con el esquema viejo (0001)
ALTER TABLE public.gp_estados_entregable_c
  ADD COLUMN IF NOT EXISTS alias text;
ALTER TABLE public.gp_estados_entregable_c
  ADD COLUMN IF NOT EXISTS descripcion text;
ALTER TABLE public.gp_estados_entregable_c
  ADD COLUMN IF NOT EXISTS icono text;
-- alias obligatorio: si quedo NULL, rellenar con nombre antes de NOT NULL
UPDATE public.gp_estados_entregable_c SET alias = nombre WHERE alias IS NULL;
ALTER TABLE public.gp_estados_entregable_c
  ALTER COLUMN alias SET NOT NULL;

ALTER TABLE public.gp_estados_entregable_c ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gp_estados_entregable_c_select ON public.gp_estados_entregable_c;
CREATE POLICY gp_estados_entregable_c_select ON public.gp_estados_entregable_c
  FOR SELECT TO authenticated
  USING (public.user_can_use_app('gestor-proyectos'));

DROP POLICY IF EXISTS gp_estados_entregable_c_insert ON public.gp_estados_entregable_c;
CREATE POLICY gp_estados_entregable_c_insert ON public.gp_estados_entregable_c
  FOR INSERT TO authenticated WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_estados_entregable_c_update ON public.gp_estados_entregable_c;
CREATE POLICY gp_estados_entregable_c_update ON public.gp_estados_entregable_c
  FOR UPDATE TO authenticated USING (public.is_platform_admin()) WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_estados_entregable_c_delete ON public.gp_estados_entregable_c;
CREATE POLICY gp_estados_entregable_c_delete ON public.gp_estados_entregable_c
  FOR DELETE TO authenticated USING (public.is_platform_admin());

COMMENT ON TABLE public.gp_estados_entregable_c IS
'Catalogo de ESTADOS DE ENTREGABLE (pendiente, en revision, aprobado, rechazado, etc.). Columnas: id = identificador tecnico uuid (PK) . codigo = codigo estable del estado (ej. PEND, APRO), UNIQUE . nombre = termino en espanol . alias = nombre en ESPANOL que ve el usuario (igual a nombre) . descripcion = definicion amigable . icono = nombre de icono Lucide (kebab-case) . activo = baja logica . orden = orden de presentacion . metadata = extension jsonb reservada . created_at = creacion de la fila . updated_at = ultima modificacion. Referenciado por gp_entregables (tabla 19, estado_codigo NULL-able).';

-- S2 . SEED ESTADOS (unificado con terminologia existente)
-- Terminos reutilizados de gp_estados_ejecucion_c / gp_estados_proyecto_c:
--   pendiente, en_proceso, en_revision, completado (masculino, como proyecto),
--   bloqueada, cancelada (cancelada -> cancelado unificado a masculino).
-- Estados especificos del ciclo de revision del entregable: aprobado, rechazado.
-- activo=false en los que aun no tienen uso adecuado definido (en_revision,
-- bloqueada, cancelada), pero se mantienen en el catalogo.
INSERT INTO public.gp_estados_entregable_c (codigo, nombre, alias, descripcion, icono, activo, orden, metadata)
VALUES
  ('pendiente',   'Pendiente',   'Pendiente',   'Entregable aun no iniciado.',                    'clock',         true,  1, jsonb_build_object('alcance','Proyectos')),
  ('en_proceso',  'En proceso',  'En proceso',  'Entregable en elaboracion.',                     'loader',        true,  2, jsonb_build_object('alcance','Proyectos')),
  ('en_revision', 'En revisión', 'En revisión', 'Entregable enviado a revision.',                 'eye',           false, 3, jsonb_build_object('alcance','Proyectos')),
  ('aprobado',    'Aprobado',    'Aprobado',    'Entregable aprobado por revisor.',               'check-circle',  true,  4, jsonb_build_object('alcance','Proyectos')),
  ('rechazado',   'Rechazado',   'Rechazado',   'Entregable rechazado, requiere correcciones.',   'x-circle',      true,  5, jsonb_build_object('alcance','Proyectos')),
  ('completado',  'Completado',  'Completado',  'Entregable finalizado y entregado.',             'check-circle-2',true,  6, jsonb_build_object('alcance','Proyectos')),
  ('bloqueada',   'Bloqueada',   'Bloqueada',   'Entregable bloqueado por dependencia.',          'lock',          false, 7, jsonb_build_object('alcance','Proyectos')),
  ('cancelado',   'Cancelado',   'Cancelado',   'Entregable cancelado.',                          'ban',           false, 8, jsonb_build_object('alcance','Proyectos'))
ON CONFLICT (codigo) DO NOTHING;

-- S3 . POST-VERIFICACION
SELECT 'estados_entregable' AS tabla,
  (SELECT count(*) FROM information_schema.columns WHERE table_schema='public' AND table_name='gp_estados_entregable_c') AS columnas,
  (SELECT count(*) FROM public.gp_estados_entregable_c) AS filas,
  (SELECT count(*) FROM pg_policies WHERE schemaname='public' AND tablename='gp_estados_entregable_c') AS politicas,
  (SELECT relrowsecurity FROM pg_class WHERE oid='public.gp_estados_entregable_c'::regclass) AS rls;
