-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0003
-- Fecha: 2026-11-12 | Entidades operativas restantes y relaciones (_r)
-- SIN DROP/TRUNCATE. SOLO ADITIVO.
-- Ajustado según evaluación 3.6 §7.3:
--   · se eliminan gp_persona_cuentas_r (vive en gp_personas.user_id)
--   · se eliminan gp_empresa_miembros_r (la membresía la gobierna public.user_app_roles)
--   · gp_proyecto_unidades_r apunta a public.gestor_unidades(id) con una sola columna unidad_id
--   · (v2.2) unidad_id es text: coincide con gestor_unidades.id (TEXT en vivo,
--     verificado 14-nov); misma corrección aplicada a gp_nodos_edt.sede_unidad_id en 0002
-- Tablas de este archivo: 16 (8 operativas + 8 relaciones; las 2 de control vienen incluidas)
-- (M-7) PRERREQUISITOS: 0002 aplicado y public.gestor_unidades existente
-- (supabase\03_gestor_unidades.sql, id = text — v2.2): gp_proyecto_unidades_r
-- tiene FK a ella con unidad_id text.
-- ==============================================================================

-- Entregables verificables
CREATE TABLE IF NOT EXISTS public.gp_entregables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  nodo_edt_id uuid REFERENCES public.gp_nodos_edt(id) ON UPDATE CASCADE ON DELETE SET NULL,
  tarea_id uuid REFERENCES public.gp_tareas(id) ON UPDATE CASCADE ON DELETE SET NULL,
  tipo_codigo text REFERENCES public.gp_tipos_entregable_c(codigo) ON UPDATE CASCADE,
  estado_codigo text REFERENCES public.gp_estados_entregable_c(codigo) ON UPDATE CASCADE,
  nombre text NOT NULL,
  descripcion text,
  formato text,
  url text,
  fecha_compromiso date,
  fecha_entrega date,
  orden integer,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  legacy_source_id text,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);
CREATE INDEX IF NOT EXISTS idx_gp_entregables_proyecto ON public.gp_entregables (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gp_entregables_nodo ON public.gp_entregables (nodo_edt_id);
CREATE INDEX IF NOT EXISTS idx_gp_entregables_tarea ON public.gp_entregables (tarea_id);

-- Líneas base
CREATE TABLE IF NOT EXISTS public.gp_lineas_base (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  nombre text NOT NULL,
  descripcion text,
  version integer NOT NULL DEFAULT 1,
  estado text NOT NULL DEFAULT 'borrador', -- borrador/aprobada/vigente/cerrada
  aprobada_por_persona_id uuid REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE SET NULL,
  aprobada_en timestamptz,
  congelada_en timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  legacy_source_id text,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);
CREATE INDEX IF NOT EXISTS idx_gp_lineas_base_proyecto ON public.gp_lineas_base (proyecto_id);

CREATE TABLE IF NOT EXISTS public.gp_linea_base_nodos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  linea_base_id uuid NOT NULL REFERENCES public.gp_lineas_base(id) ON UPDATE CASCADE ON DELETE CASCADE,
  nodo_edt_id uuid NOT NULL REFERENCES public.gp_nodos_edt(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  wbs_code text,
  fecha_inicio_plan date,
  fecha_fin_plan date,
  progreso_plan numeric(5,2),
  estado_plan text,
  snapshot jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(linea_base_id, nodo_edt_id)
);
CREATE INDEX IF NOT EXISTS idx_gp_linea_base_nodos_lb ON public.gp_linea_base_nodos (linea_base_id);

-- Avances históricos (serie temporal)
CREATE TABLE IF NOT EXISTS public.gp_avances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  nodo_edt_id uuid REFERENCES public.gp_nodos_edt(id) ON UPDATE CASCADE ON DELETE SET NULL,
  tarea_id uuid REFERENCES public.gp_tareas(id) ON UPDATE CASCADE ON DELETE SET NULL,
  tipo_codigo text REFERENCES public.gp_tipos_avance_c(codigo) ON UPDATE CASCADE,
  fecha_registro date NOT NULL DEFAULT CURRENT_DATE,
  progreso_anterior numeric(5,2),
  progreso_nuevo numeric(5,2) CHECK (progreso_nuevo IS NULL OR (progreso_nuevo >= 0 AND progreso_nuevo <= 100)),
  estado_anterior text,
  estado_nuevo text,
  comentario text,
  registrado_por_persona_id uuid REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  legacy_source_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid
);
CREATE INDEX IF NOT EXISTS idx_gp_avances_proyecto_fecha ON public.gp_avances (proyecto_id, fecha_registro);
CREATE INDEX IF NOT EXISTS idx_gp_avances_nodo ON public.gp_avances (nodo_edt_id);
CREATE INDEX IF NOT EXISTS idx_gp_avances_tarea ON public.gp_avances (tarea_id);

-- Archivos (metadatos)
CREATE TABLE IF NOT EXISTS public.gp_archivos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE SET NULL,
  nodo_edt_id uuid REFERENCES public.gp_nodos_edt(id) ON UPDATE CASCADE ON DELETE SET NULL,
  tarea_id uuid REFERENCES public.gp_tareas(id) ON UPDATE CASCADE ON DELETE SET NULL,
  entregable_id uuid REFERENCES public.gp_entregables(id) ON UPDATE CASCADE ON DELETE SET NULL,
  reunion_id uuid, -- FK diferida a gp_reuniones
  tipo_codigo text REFERENCES public.gp_tipos_archivo_c(codigo) ON UPDATE CASCADE,
  nombre text NOT NULL,
  nombre_original text,
  mime_type text,
  tamano_bytes bigint,
  storage_bucket text,
  storage_path text,
  url_publica text,
  hash_contenido text,
  version integer NOT NULL DEFAULT 1,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  legacy_source_id text,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);
CREATE INDEX IF NOT EXISTS idx_gp_archivos_proyecto ON public.gp_archivos (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gp_archivos_nodo ON public.gp_archivos (nodo_edt_id);

-- Reuniones
CREATE TABLE IF NOT EXISTS public.gp_reuniones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  nodo_edt_id uuid REFERENCES public.gp_nodos_edt(id) ON UPDATE CASCADE ON DELETE SET NULL,
  fase_id uuid REFERENCES public.gp_fases(id) ON UPDATE CASCADE ON DELETE SET NULL,
  tipo_codigo text REFERENCES public.gp_tipos_reunion_c(codigo) ON UPDATE CASCADE,
  estado_codigo text REFERENCES public.gp_estados_reunion_c(codigo) ON UPDATE CASCADE,
  titulo text NOT NULL,
  descripcion text,
  agenda text,
  fecha_inicio timestamptz,
  fecha_fin timestamptz,
  ubicacion text,
  enlace_virtual text,
  acta_resumen text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  legacy_source_id text,
  is_deleted boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid
);
CREATE INDEX IF NOT EXISTS idx_gp_reuniones_proyecto ON public.gp_reuniones (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gp_reuniones_fecha ON public.gp_reuniones (fecha_inicio);

-- FK diferida archivos->reuniones
ALTER TABLE public.gp_archivos
  DROP CONSTRAINT IF EXISTS gp_archivos_reunion_fk,
  ADD CONSTRAINT gp_archivos_reunion_fk FOREIGN KEY (reunion_id) REFERENCES public.gp_reuniones(id) ON UPDATE CASCADE ON DELETE SET NULL;

-- Auditoría
CREATE TABLE IF NOT EXISTS public.gp_eventos_auditoria (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid,
  entidad text NOT NULL,
  entidad_id uuid,
  accion text NOT NULL, -- INSERT/UPDATE/DELETE/STATE_CHANGE/MIGRATION etc
  payload_antes jsonb,
  payload_despues jsonb,
  actor_user_id uuid, -- auth.users
  actor_persona_id uuid REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE SET NULL,
  origen text DEFAULT 'app',
  ocurrido_at timestamptz NOT NULL DEFAULT now(),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX IF NOT EXISTS idx_gp_eventos_auditoria_empresa_fecha ON public.gp_eventos_auditoria (empresa_id, ocurrido_at DESC);
CREATE INDEX IF NOT EXISTS idx_gp_eventos_auditoria_proyecto ON public.gp_eventos_auditoria (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gp_eventos_auditoria_entidad ON public.gp_eventos_auditoria (entidad, entidad_id);

-- Registro de corridas de migración (idempotencia/trazabilidad)
CREATE TABLE IF NOT EXISTS public.gp_corridas_migracion (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  corrida_key text NOT NULL UNIQUE,
  descripcion text,
  origen text,
  destino text,
  estado text NOT NULL DEFAULT 'iniciada', -- iniciada/completada/fallida/parcial
  filas_leidas bigint DEFAULT 0,
  filas_escritas bigint DEFAULT 0,
  filas_omitidas bigint DEFAULT 0,
  errores jsonb NOT NULL DEFAULT '[]'::jsonb,
  iniciado_at timestamptz NOT NULL DEFAULT now(),
  finalizado_at timestamptz,
  ejecutado_por uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);

-- =========================
-- TABLAS RELACIONALES (_r)
-- =========================

-- Persona <-> cuenta: NO existe tabla puente. La relación es gp_personas.user_id (única por empresa).

-- Membresía proyecto <-> persona: gobernanza propia del Gestor (rol DENTRO del proyecto).
CREATE TABLE IF NOT EXISTS public.gp_proyecto_miembros_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  persona_id uuid NOT NULL REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  rol_proyecto_codigo text NOT NULL REFERENCES public.gp_roles_proyecto_c(codigo) ON UPDATE CASCADE,
  estado text NOT NULL DEFAULT 'activo',
  porcentaje_dedicacion numeric(5,2),
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  UNIQUE(proyecto_id, persona_id)
);
CREATE INDEX IF NOT EXISTS idx_gp_proyecto_miembros_proyecto ON public.gp_proyecto_miembros_r (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gp_proyecto_miembros_persona ON public.gp_proyecto_miembros_r (persona_id);

-- Equipo <-> persona
CREATE TABLE IF NOT EXISTS public.gp_equipo_miembros_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  equipo_id uuid NOT NULL REFERENCES public.gp_equipos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  persona_id uuid NOT NULL REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  rol_en_equipo text,
  es_lider boolean NOT NULL DEFAULT false,
  estado text NOT NULL DEFAULT 'activo',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(equipo_id, persona_id)
);
CREATE INDEX IF NOT EXISTS idx_gp_equipo_miembros_equipo ON public.gp_equipo_miembros_r (equipo_id);

-- Responsables EDT (nodo <-> persona)
CREATE TABLE IF NOT EXISTS public.gp_edt_responsables_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  nodo_edt_id uuid NOT NULL REFERENCES public.gp_nodos_edt(id) ON UPDATE CASCADE ON DELETE CASCADE,
  persona_id uuid NOT NULL REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  tipo_responsabilidad text NOT NULL DEFAULT 'responsable', -- responsable/apoyo/supervisor
  es_principal boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE(nodo_edt_id, persona_id, tipo_responsabilidad)
);
CREATE INDEX IF NOT EXISTS idx_gp_edt_responsables_nodo ON public.gp_edt_responsables_r (nodo_edt_id);

-- Responsables tarea
CREATE TABLE IF NOT EXISTS public.gp_tarea_responsables_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  tarea_id uuid NOT NULL REFERENCES public.gp_tareas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  persona_id uuid NOT NULL REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  tipo_responsabilidad text NOT NULL DEFAULT 'asignado',
  es_principal boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE(tarea_id, persona_id, tipo_responsabilidad)
);
CREATE INDEX IF NOT EXISTS idx_gp_tarea_responsables_tarea ON public.gp_tarea_responsables_r (tarea_id);

-- Dependencias EDT (nodo predecesor -> sucesor)
CREATE TABLE IF NOT EXISTS public.gp_nodo_dependencias_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  predecesor_nodo_id uuid NOT NULL REFERENCES public.gp_nodos_edt(id) ON UPDATE CASCADE ON DELETE CASCADE,
  sucesor_nodo_id uuid NOT NULL REFERENCES public.gp_nodos_edt(id) ON UPDATE CASCADE ON DELETE CASCADE,
  tipo_codigo text NOT NULL DEFAULT 'FS' REFERENCES public.gp_tipos_dependencia_c(codigo) ON UPDATE CASCADE,
  desfase_dias integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT gp_nodo_dep_no_self_ck CHECK (predecesor_nodo_id <> sucesor_nodo_id),
  UNIQUE(proyecto_id, predecesor_nodo_id, sucesor_nodo_id, tipo_codigo)
);
CREATE INDEX IF NOT EXISTS idx_gp_nodo_dependencias_proyecto ON public.gp_nodo_dependencias_r (proyecto_id);

-- Dependencias tareas
CREATE TABLE IF NOT EXISTS public.gp_tarea_dependencias_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  predecesora_tarea_id uuid NOT NULL REFERENCES public.gp_tareas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  sucesora_tarea_id uuid NOT NULL REFERENCES public.gp_tareas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  tipo_codigo text NOT NULL DEFAULT 'FS' REFERENCES public.gp_tipos_dependencia_c(codigo) ON UPDATE CASCADE,
  desfase_dias integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  CONSTRAINT gp_tarea_dep_no_self_ck CHECK (predecesora_tarea_id <> sucesora_tarea_id),
  UNIQUE(proyecto_id, predecesora_tarea_id, sucesora_tarea_id, tipo_codigo)
);

-- Participantes reunión
CREATE TABLE IF NOT EXISTS public.gp_reunion_participantes_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  reunion_id uuid NOT NULL REFERENCES public.gp_reuniones(id) ON UPDATE CASCADE ON DELETE CASCADE,
  persona_id uuid NOT NULL REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  rol_en_reunion text,
  asistencia text, -- invitado/confirmado/asistio/ausente
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reunion_id, persona_id)
);

-- Proyecto <-> unidad organizacional del Hub (alcance territorial)
-- fuente única de la jerarquía: public.gestor_unidades (no se duplica)
CREATE TABLE IF NOT EXISTS public.gp_proyecto_unidades_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid REFERENCES public.tenants(id) ON UPDATE CASCADE ON DELETE RESTRICT,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  unidad_id text NOT NULL REFERENCES public.gestor_unidades(id) ON UPDATE CASCADE ON DELETE CASCADE, -- (v2.2: PK de gestor_unidades = text, verificado 14-nov)
  rol_alcance text, -- principal/secundaria/intervencion
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(proyecto_id, unidad_id)
);
CREATE INDEX IF NOT EXISTS idx_gp_proyecto_unidades_proyecto ON public.gp_proyecto_unidades_r (proyecto_id);
CREATE INDEX IF NOT EXISTS idx_gp_proyecto_unidades_unidad ON public.gp_proyecto_unidades_r (unidad_id);
