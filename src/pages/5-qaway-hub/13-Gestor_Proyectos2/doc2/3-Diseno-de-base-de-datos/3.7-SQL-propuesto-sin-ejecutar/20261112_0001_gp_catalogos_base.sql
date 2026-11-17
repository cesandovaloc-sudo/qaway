-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0001
-- Fecha: 2026-11-12 | Convención: gp_* / _c catálogos / _r relaciones
-- Objetivo: Catálogos del dominio. SIN DROP/TRUNCATE. SOLO ADITIVO.
-- Dependencias plataforma (BD Central): public.tenants(id), auth.users(id), public.users
-- NOTA (evaluación 3.6 §7.1): los roles de empresa y los ámbitos de gobernanza NO se definen aquí;
-- los provee la plataforma (public.user_app_roles.role + public.is_platform_admin()).
-- Los tipos de unidad territorial tampoco: viven en public.gestor_unidades.unit_type + CHECK.
-- Total de tablas de este archivo: 12 catálogos.
--
-- v2 (2026-11-13, correcciones aprobadas): SIN cambios de esquema.
--   · (corr. 6) gp_tipos_proyecto_c NO lleva seed y NO se le inventan valores:
--     su clasificación funcional está PENDIENTE de definición por el negocio.
--     El catálogo se crea vacío. gp_proyectos.tipo_proyecto_codigo es NULL-able,
--     por lo que no hay conflicto de integridad. Los formularios no deben
--     ofrecer opciones de tipo hasta que el seed sea aprobado.
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

-- (v2, corr. 6) SIN SEED por diseño: clasificación funcional pendiente del negocio.
-- No insertar valores provisionales ni "tipos de ejemplo".
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

-- (v2.1, 14-nov) Catálogo de estados de EJECUCIÓN — UNIFICADO: sirve a tareas y
-- nodos EDT. Sustituye a gp_estados_tarea_c (decisión funcional ya implementada:
-- la tabla gp_estados_ejecucion_c existe en el proyecto; NO se crea
-- gp_estados_tarea_c para no duplicar responsabilidad entre catálogos).
CREATE TABLE IF NOT EXISTS public.gp_estados_ejecucion_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  descripcion text,          -- ADOPTADO 16-nov: existe en vivo (opcional, NULL-able)
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  color text,                -- orden real en vivo: última columna
  UNIQUE(codigo)
);

CREATE TABLE IF NOT EXISTS public.gp_prioridades_c (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo text NOT NULL,
  nombre text NOT NULL,
  descripcion text,          -- ADOPTADO 16-nov: existe en vivo (opcional, NULL-able)
  activo boolean NOT NULL DEFAULT true,
  orden integer DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  nivel integer,             -- orden real en vivo: última columna
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
-- (v2, corr. 6) gp_tipos_proyecto_c: seed PENDIENTE — requiere que el negocio
-- apruebe la clasificación funcional de proyectos. NO insertar valores aquí.
-- (v2.1, 14-nov) Valores = los 6 estados REALES de la tabla ya creada en Supabase
-- (fuente de verdad; reemplaza la seed antigua de 5 valores con 'revision'/
-- 'completado'/'bloqueado'). Nombres = etiquetas derivadas del código (ajustables).
-- ON CONFLICT DO NOTHING: jamás toca las filas ya existentes.
INSERT INTO public.gp_estados_ejecucion_c (codigo, nombre) VALUES ('pendiente','Pendiente'),('en_proceso','En proceso'),('en_revision','En revisión'),('completada','Completada'),('bloqueada','Bloqueada'),('cancelada','Cancelada')
ON CONFLICT (codigo) DO NOTHING;
-- (v2.2, 15-nov) prioridades: 4º valor = 'urgente' (NO 'critica'). El valor REAL
-- vigente en las tablas ya creadas en Supabase es urgente (fuente de verdad;
-- mismo patrón del ajuste v2.1 de estados). El nivel 4 se mantiene.
INSERT INTO public.gp_prioridades_c (codigo, nombre, nivel) VALUES ('baja','Baja',1),('media','Media',2),('alta','Alta',3),('urgente','Urgente',4)
ON CONFLICT (codigo) DO NOTHING;
