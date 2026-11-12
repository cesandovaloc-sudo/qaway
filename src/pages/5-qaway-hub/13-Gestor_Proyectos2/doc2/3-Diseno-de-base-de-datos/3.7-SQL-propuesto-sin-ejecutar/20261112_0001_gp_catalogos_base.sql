-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0001
-- Fecha: 2026-11-12 | Convención: gp_* / _c catálogos / _r relaciones
-- Objetivo: Catálogos del dominio. SIN DROP/TRUNCATE. SOLO ADITIVO.
-- Dependencias plataforma (BD Central): public.tenants(id), auth.users(id), public.users
-- NOTA (evaluación 3.6 §7.1): los roles de empresa y los ámbitos de gobernanza NO se definen aquí;
-- los provee la plataforma (public.user_app_roles.role + public.is_platform_admin()).
-- Los tipos de unidad territorial tampoco: viven en public.gestor_unidades.unit_type + CHECK.
-- Total de tablas de este archivo: 12 catálogos.
-- ==============================================================================

-- Extensiones necesarias (idempotentes)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Catálogos de estados/tipos de proyecto
CREATE TABLE IF NOT EXISTS public.gp_estados_proyecto_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

CREATE TABLE IF NOT EXISTS public.gp_tipos_proyecto_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

-- Catálogos tareas
CREATE TABLE IF NOT EXISTS public.gp_estados_tarea_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  color text,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

CREATE TABLE IF NOT EXISTS public.gp_prioridades_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  nivel integer,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

-- Rol DENTRO del proyecto (la gobernanza de empresa la provee public.user_app_roles)
CREATE TABLE IF NOT EXISTS public.gp_roles_proyecto_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  permisos jsonb NOT NULL DEFAULT '{}'::jsonb,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

-- Dependencias / entregables / reuniones / archivos de proyecto
CREATE TABLE IF NOT EXISTS public.gp_tipos_dependencia_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

CREATE TABLE IF NOT EXISTS public.gp_tipos_entregable_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

CREATE TABLE IF NOT EXISTS public.gp_estados_entregable_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

CREATE TABLE IF NOT EXISTS public.gp_tipos_reunion_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

CREATE TABLE IF NOT EXISTS public.gp_estados_reunion_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

CREATE TABLE IF NOT EXISTS public.gp_tipos_avance_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

CREATE TABLE IF NOT EXISTS public.gp_tipos_archivo_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

-- Seeds mínimos idempotentes (no destructivos)
INSERT INTO public.gp_tipos_dependencia_c (codigo, nombre) VALUES ('FS','Finish-to-Start'),('SS','Start-to-Start'),('FF','Finish-to-Finish'),('SF','Start-to-Finish')
ON CONFLICT (codigo) DO NOTHING;
INSERT INTO public.gp_roles_proyecto_c (codigo, nombre) VALUES ('administrador','Administrador'),('gestor','Gestor'),('coordinador','Coordinador'),('supervisor','Supervisor'),('colaborador','Colaborador'),('lector','Lector')
ON CONFLICT (codigo) DO NOTHING;
INSERT INTO public.gp_estados_proyecto_c (codigo, nombre) VALUES ('planificacion','Planificación'),('en_curso','En curso'),('pausado','Pausado'),('completado','Completado'),('cancelado','Cancelado')
ON CONFLICT (codigo) DO NOTHING;
INSERT INTO public.gp_estados_tarea_c (codigo, nombre) VALUES ('pendiente','Pendiente'),('en_proceso','En proceso'),('revision','En revisión'),('completado','Completado'),('bloqueado','Bloqueado')
ON CONFLICT (codigo) DO NOTHING;
INSERT INTO public.gp_prioridades_c (codigo, nombre, nivel) VALUES ('baja','Baja',1),('media','Media',2),('alta','Alta',3),('critica','Crítica',4)
ON CONFLICT (codigo) DO NOTHING;
