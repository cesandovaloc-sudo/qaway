-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0003
-- Fecha: 2026-11-12 | Entidades operativas restantes y relaciones (_r)
-- SIN DROP/TRUNCATE. SOLO ADITIVO.
-- ==============================================================================

-- Entregables verificables
CREATE TABLE IF NOT EXISTS public.gp_entregables (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid,
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
  empresa_id uuid,
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
  empresa_id uuid,
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
  empresa_id uuid,
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
  empresa_id uuid,
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
  empresa_id uuid,
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
  empresa_id uuid,
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

-- Persona <-> cuenta de usuario (plataforma)
CREATE TABLE IF NOT EXISTS public.gp_persona_cuentas_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid,
  persona_id uuid NOT NULL REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  user_id uuid NOT NULL, -- auth.users(id) en plataforma
  es_principal boolean NOT NULL DEFAULT false,
  activo boolean NOT NULL DEFAULT true,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  UNIQUE(persona_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_gp_persona_cuentas_user ON public.gp_persona_cuentas_r (user_id);

-- Membresía empresa (tenant) <-> persona/usuario
CREATE TABLE IF NOT EXISTS public.gp_empresa_miembros_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid NOT NULL, -- public.tenants(id)
  persona_id uuid REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE SET NULL,
  user_id uuid, -- auth.users(id)
  rol_empresa_codigo text NOT NULL REFERENCES public.gp_roles_empresa_c(codigo) ON UPDATE CASCADE,
  estado text NOT NULL DEFAULT 'activo',
  es_owner boolean NOT NULL DEFAULT false,
  fecha_inicio date,
  fecha_fin date,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT gp_empresa_miembros_actor_ck CHECK (persona_id IS NOT NULL OR user_id IS NOT NULL)
);
CREATE UNIQUE INDEX IF NOT EXISTS uq_gp_empresa_miembros_persona ON public.gp_empresa_miembros_r (empresa_id, persona_id) WHERE persona_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_gp_empresa_miembros_user ON public.gp_empresa_miembros_r (empresa_id, user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_gp_empresa_miembros_empresa ON public.gp_empresa_miembros_r (empresa_id);

-- Membresía proyecto <-> persona
CREATE TABLE IF NOT EXISTS public.gp_proyecto_miembros_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid,
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
  empresa_id uuid,
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
  empresa_id uuid,
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
  empresa_id uuid,
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
  empresa_id uuid,
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
  empresa_id uuid,
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
  empresa_id uuid,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  reunion_id uuid NOT NULL REFERENCES public.gp_reuniones(id) ON UPDATE CASCADE ON DELETE CASCADE,
  persona_id uuid NOT NULL REFERENCES public.gp_personas(id) ON UPDATE CASCADE ON DELETE CASCADE,
  rol_en_reunion text,
  asistencia text, -- invitado/confirmado/asistio/ausente
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(reunion_id, persona_id)
);

-- Proyecto <-> unidad territorial / sede (alcance)
CREATE TABLE IF NOT EXISTS public.gp_proyecto_unidades_r (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id uuid,
  proyecto_id uuid NOT NULL REFERENCES public.gp_proyectos(id) ON UPDATE CASCADE ON DELETE CASCADE,
  unidad_territorial_id uuid REFERENCES public.gp_unidades_territoriales(id) ON UPDATE CASCADE ON DELETE CASCADE,
  sede_id uuid REFERENCES public.gp_sedes(id) ON UPDATE CASCADE ON DELETE CASCADE,
  rol_alcance text, -- principal/secundaria/intervencion
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT gp_proyecto_unidades_obj_ck CHECK (unidad_territorial_id IS NOT NULL OR sede_id IS NOT NULL)
);
CREATE INDEX IF NOT EXISTS idx_gp_proyecto_unidades_proyecto ON public.gp_proyecto_unidades_r (proyecto_id);
