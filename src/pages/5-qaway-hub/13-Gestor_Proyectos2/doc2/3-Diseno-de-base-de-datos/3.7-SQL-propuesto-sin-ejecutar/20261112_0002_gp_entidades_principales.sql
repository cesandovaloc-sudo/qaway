-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0002
-- Fecha: 2026-11-12 | Entidades principales
-- SIN DROP/TRUNCATE. SOLO ADITIVO.
-- Ajustado según evaluación 3.6 §7.2:
--   · empresa_id es FK real a public.tenants(id) y NOT NULL en proyectos y personas
--   · gp_personas incorpora user_id (sustituye a gp_persona_cuentas_r)
--   · se eliminan gp_unidades_territoriales y gp_sedes: la jerarquía es public.gestor_unidades
--   · gp_nodos_edt apunta a gestor_unidades con UNA sola columna (sede_unidad_id)
-- Tablas de este archivo: 6 (gp_proyectos, gp_personas, gp_fases, gp_nodos_edt, gp_tareas, gp_equipos)
-- ==============================================================================

-- Proyectos (principal). empresa_id = tenant del Hub; NO se duplica la tabla de empresas.
CREATE TABLE IF NOT EXISTS public.gp_proyectos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  codigo_proyecto text NOT NULL, -- código de negocio, no PK
  nombre text NOT NULL,
  descripcion text,
  tipo_proyecto_codigo text REFERENCES public.gp_tipos_proyecto_c(codigo) ON UPDATE CASCADE,
  estado_codigo text NOT NULL DEFAULT 'planificacion' REFERENCES public.gp_estados_proyecto_c(codigo) ON UPDATE CASCADE,
  fecha_inicio date,
  fecha_fin date,
  presupuesto numeric(18,2),
  moneda text DEFAULT 'PEN',
  responsable_principal_persona_id uuid, -- FK diferida a gp_personas
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  legacy_source_id text,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid, -- auth.users(id)
  updated_by uuid,
  CONSTRAINT gp_proyectos_fechas_ck CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_gp_proyectos_empresa_codigo ON public.gp_proyectos (empresa_id, codigo_proyecto) WHERE is_deleted = false;
CREATE INDEX IF NOT EXISTS idx_gp_proyectos_empresa ON public.gp_proyectos (empresa_id);
CREATE INDEX IF NOT EXISTS idx_gp_proyectos_estado ON public.gp_proyectos (estado_codigo);

-- Personas = directorio del tenant. NO es la tabla de usuarios: users/auth viven en el Hub.
-- user_id es OPCIONAL (permite registrar personal sin cuenta) y único por empresa.
CREATE TABLE IF NOT EXISTS public.gp_personas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  user_id uuid REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL,
  nombres text NOT NULL,
  apellidos text,
  nombre_completo text GENERATED ALWAYS AS (trim(coalesce(nombres,'') || ' ' || coalesce(apellidos,''))) STORED,
  tipo_documento text,
  numero_documento text,
  correo text,
  telefono text,
  cargo text,
  activo boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  legacy_source_id text,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);
CREATE INDEX IF NOT EXISTS idx_gp_personas_empresa ON public.gp_personas (empresa_id);
CREATE INDEX IF NOT EXISTS idx_gp_personas_user ON public.gp_personas (user_id);
CREATE INDEX IF NOT EXISTS idx_gp_personas_documento ON public.gp_personas (empresa_id, tipo_documento, numero_documento) WHERE numero_documento IS NOT NULL;
-- Regla: una persona = una cuenta como máximo dentro de la misma empresa.
CREATE UNIQUE INDEX IF NOT EXISTS uq_gp_personas_empresa_user ON public.gp_personas (empresa_id, user_id) WHERE user_id IS NOT NULL;
-- Y el mismo documento no puede repetirse dos veces en la misma empresa.
CREATE UNIQUE INDEX IF NOT EXISTS uq_gp_personas_empresa_documento ON public.gp_personas (empresa_id, tipo_documento, numero_documento)
  WHERE numero_documento IS NOT NULL AND is_deleted = false;

-- Fases (dimensión independiente del ciclo de vida, NO nodo EDT)
CREATE TABLE IF NOT EXISTS public.gp_fases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  codigo text,
  nombre text NOT NULL,
  descripcion text,
  orden integer NOT NULL DEFAULT 0,
  fecha_inicio_plan date,
  fecha_fin_plan date,
  fecha_inicio_real date,
  fecha_fin_real date,
  estado text DEFAULT 'planificada',
  activo boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  legacy_source_id text,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT gp_fases_fechas_plan_ck CHECK (fecha_fin_plan IS NULL OR fecha_inicio_plan IS NULL OR fecha_fin_plan >= fecha_inicio_plan)
);
CREATE INDEX IF NOT EXISTS idx_gp_fases_proyecto ON public.gp_fases (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gp_fases_empresa ON public.gp_fases (empresa_id);

-- Nodos EDT/WBS (jerarquía del proyecto)
CREATE TABLE IF NOT EXISTS public.gp_nodos_edt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  nodo_padre_id uuid REFERENCES public.gp_nodos_edt(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  fase_id uuid REFERENCES public.gp_fases(id) ON UPDATE CASCADE ON DELETE SET NULL,
  wbs_code text, -- código de negocio EDT (1.7.1), no PK
  nombre text NOT NULL,
  descripcion text,
  -- kind = comportamiento del nodo en la UI (hito | subproceso).
  -- El TIPO EDT (COMPONENTE|PRODUCTO|ENTREGABLE|PAQUETE_TRABAJO|HITO) se DERIVA en código
  -- (resolveEdtNodeType) y solo se cachea en edt_type_cached. No es un CHECK de 5 valores.
  kind text NOT NULL DEFAULT 'subproceso' CHECK (kind IN ('hito','subproceso')),
  is_entregable boolean NOT NULL DEFAULT false,
  edt_type_cached text, -- cache regenerable, NO fuente de verdad
  estado text, -- Completado | En curso | En proceso | Pendiente | Con retraso | Cumple
  progreso numeric(5,2) CHECK (progreso >= 0 AND progreso <= 100),
  fecha_inicio date,
  fecha_fin date,
  fecha_inicio_real date,
  fecha_fin_real date,
  region text,
  distrito text,
  sede_texto text, -- legado: texto libre mientras dura el backfill (se retira después)
  sede_unidad_id uuid REFERENCES public.gestor_unidades(id) ON UPDATE CASCADE ON DELETE SET NULL,
  orden integer,
  task_type text,
  icon text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  legacy_source_id text,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT gp_nodos_edt_fechas_ck CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
);
CREATE INDEX IF NOT EXISTS idx_gp_nodos_edt_proyecto ON public.gp_nodos_edt (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gp_nodos_edt_empresa ON public.gp_nodos_edt (empresa_id);
CREATE INDEX IF NOT EXISTS idx_gp_nodos_edt_padre ON public.gp_nodos_edt (proyecto_id, nodo_padre_id);
CREATE INDEX IF NOT EXISTS idx_gp_nodos_edt_fase ON public.gp_nodos_edt (fase_id);
CREATE INDEX IF NOT EXISTS idx_gp_nodos_edt_unidad ON public.gp_nodos_edt (sede_unidad_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_gp_nodos_edt_wbs ON public.gp_nodos_edt (proyecto_id, wbs_code) WHERE wbs_code IS NOT NULL AND is_deleted = false;

-- Tareas operativas
CREATE TABLE IF NOT EXISTS public.gp_tareas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  nodo_edt_id uuid REFERENCES public.gp_nodos_edt(id) ON UPDATE CASCADE ON DELETE SET NULL,
  fase_id uuid REFERENCES public.gp_fases(id) ON UPDATE CASCADE ON DELETE SET NULL,
  tarea_padre_id uuid REFERENCES public.gp_tareas(id) ON UPDATE CASCADE ON DELETE SET NULL,
  codigo text,
  titulo text NOT NULL,
  descripcion text,
  estado_codigo text REFERENCES public.gp_estados_tarea_c(codigo) ON UPDATE CASCADE,
  prioridad_codigo text REFERENCES public.gp_prioridades_c(codigo) ON UPDATE CASCADE,
  fecha_inicio date,
  fecha_fin date,
  fecha_vencimiento date,
  fecha_completado timestamptz,
  progreso numeric(5,2) CHECK (progreso >= 0 AND progreso <= 100),
  estimacion_horas numeric(10,2),
  orden integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  legacy_source_id text,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT gp_tareas_fechas_ck CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio)
);
CREATE INDEX IF NOT EXISTS idx_gp_tareas_proyecto ON public.gp_tareas (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gp_tareas_empresa ON public.gp_tareas (empresa_id);
CREATE INDEX IF NOT EXISTS idx_gp_tareas_nodo ON public.gp_tareas (nodo_edt_id);
CREATE INDEX IF NOT EXISTS idx_gp_tareas_estado ON public.gp_tareas (estado_codigo);

-- Equipos de trabajo (agrupación de personas dentro de un proyecto)
CREATE TABLE IF NOT EXISTS public.gp_equipos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE SET NULL,
  nombre text NOT NULL,
  descripcion text,
  activo boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  legacy_source_id text,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);
CREATE INDEX IF NOT EXISTS idx_gp_equipos_empresa ON public.gp_equipos (empresa_id);
CREATE INDEX IF NOT EXISTS idx_gp_equipos_proyecto ON public.gp_equipos (proyecto_id);

-- Completar FKs diferidas (solo las que quedan dentro del dominio gp_*)
ALTER TABLE public.gp_proyectos
  DROP CONSTRAINT IF EXISTS gp_proyectos_responsable_fk,
  ADD CONSTRAINT gp_proyectos_responsable_fk FOREIGN KEY (responsable_principal_persona_id) REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE SET NULL;
