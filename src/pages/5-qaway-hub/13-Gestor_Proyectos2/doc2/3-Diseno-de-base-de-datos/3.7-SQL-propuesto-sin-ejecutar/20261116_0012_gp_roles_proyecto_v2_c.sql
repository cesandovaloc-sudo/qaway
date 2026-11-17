-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN 0012
-- Fecha: 2026-11-16 | Convención: gp_* / _c catálogos / _r relaciones
-- Objetivo: catálogo de roles DENTRO del proyecto con TERMINOLOGÍA INTERNACIONAL
--           en `codigo`/`nombre` y el nombre en ESPAÑOL en `alias`.
-- Motivo: los 6 códigos de 0001 (administrador/gestor/coordinador/supervisor/
--         colaborador/lector) son terminología local, no estándar: ninguna
--         aplicación de referencia (Jira, Asana, ClickUp) usa esos nombres.
--         Además 4 de los 6 roles tenían permisos idénticos ({}), es decir eran
--         4 nombres para la misma facultad. Se sustituyen por 4 roles con
--         comportamiento DISTINTO entre sí y nombres tomados de las referencias:
--           owner / manager / member / viewer
-- SIN DROP / SIN TRUNCATE / SOLO ADITIVO.
-- Relación con gp_roles_proyecto_c: NO se borra en esta migración. Esa tabla
--   queda marcada como DEUDA (ver 0013) y se retirará cuando
--   gp_proyecto_miembros_r (tabla 27) apunte aquí y no existan datos en ella.
--
-- ┌──────────────────────────────────────────────────────────────────────────┐
-- │ GLOSARIO — QUIÉN ES QUIÉN (queda grabado en la BD vía COMMENT, ver abajo) │
-- ├──────────────┬───────────────────────┬───────────────────────────────────┤
-- │ codigo       │ alias (español)       │ Qué significa exactamente          │
-- ├──────────────┼───────────────────────┼───────────────────────────────────┤
-- │ owner        │ Propietario proyecto  │ Responsable final ante el cliente  │
-- │              │                       │ y la empresa. Uno solo por         │
-- │              │                       │ proyecto. Todas las acciones +     │
-- │              │                       │ asignar roles.  (Jira: Project     │
-- │              │                       │ Lead · ClickUp: Owner)             │
-- │ manager      │ Gestor del proyecto   │ Dirige la ejecución del día a día  │
-- │              │                       │ y responde por plazos. Mueve el    │
-- │              │                       │ estado salvo cancelar/reabrir.     │
-- │              │                       │ (Jira: Administrators · Asana:     │
-- │              │                       │ Admin)                             │
-- │ member       │ Miembro del equipo    │ Ejecuta tareas del proyecto.       │
-- │              │                       │ Trabaja lo suyo; NO mueve el       │
-- │              │                       │ estado del proyecto. (Jira:        │
-- │              │                       │ Developers · Asana: Editor)        │
-- │ viewer       │ Observador            │ Solo lectura: ve avance e          │
-- │              │                       │ historial. Cliente, dirección,     │
-- │              │                       │ auditoría. (Asana: Viewer ·        │
-- │              │                       │ ClickUp: guest)                    │
-- └──────────────┴───────────────────────┴───────────────────────────────────┘
--
-- IMPORTANTE — dos capas de permiso que NO se mezclan:
--   · Esta tabla = rol DENTRO del proyecto (no da acceso a la aplicación).
--   · Acceso a la app = public.user_app_roles.role (admin/editor/viewer/guest).
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- §1 · TABLA
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gp_roles_proyecto_v2_c (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  codigo      text NOT NULL,                          -- término internacional (owner/manager/member/viewer)
  nombre      text NOT NULL,                          -- etiqueta del término estándar (Owner, Manager…)
  alias       text NOT NULL,                          -- nombre en ESPAÑOL que ve el usuario
  descripcion text,                                   -- definición exacta de quién es
  permisos    jsonb NOT NULL DEFAULT '{}'::jsonb,     -- acciones de dirección permitidas
  activo      boolean NOT NULL DEFAULT true,
  orden       integer DEFAULT 0,
  metadata    jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE(codigo)
);

-- ==============================================================================
-- §2 · SEED — 4 roles con permisos DISTINTOS entre sí
--   Valores booleanos "true" en permisos: la RPC de ciclo de vida lee
--   permisos ->> '<accion>' y lo compara con 'true' (0010 L308).
-- ==============================================================================
INSERT INTO public.gp_roles_proyecto_v2_c
  (codigo, nombre, alias, descripcion, permisos, activo, orden, metadata)
VALUES
  ('owner',
   'Owner',
   'Propietario del proyecto',
   'Responsable final del proyecto ante el cliente y la empresa. Uno solo por proyecto. Puede todas las acciones de dirección (iniciar, pausar, reanudar, completar, cancelar, reabrir), editar la clasificación del proyecto y asignar roles a los miembros. Equivalente a Project Lead en Jira y Owner en ClickUp.',
   '{"iniciar":true,"pausar":true,"reanudar":true,"completar":true,"cancelar":true,"reabrir":true,"editar_tipo":true,"asignar_roles":true}'::jsonb,
   true, 1, '{}'::jsonb),

  ('manager',
   'Manager',
   'Gestor del proyecto',
   'Dirige la ejecución del proyecto en el día a día y responde por los plazos. Puede iniciar, pausar, reanudar y completar. NO puede cancelar ni reabrir: son actos de dirección superior reservados al owner. Equivalente a Administrators en Jira y Admin en Asana.',
   '{"iniciar":true,"pausar":true,"reanudar":true,"completar":true}'::jsonb,
   true, 2, '{}'::jsonb),

  ('member',
   'Member',
   'Miembro del equipo',
   'Ejecuta las tareas que le corresponden dentro del proyecto. Puede editar tareas y comentar. NO mueve el estado del proyecto ni edita su clasificación: eso es dirección. Equivalente a Developers en Jira y Editor en Asana.',
   '{"editar_tareas":true,"comentar":true}'::jsonb,
   true, 3, '{}'::jsonb),

  ('viewer',
   'Viewer',
   'Observador',
   'Solo lectura: consulta el estado, el avance y el historial del proyecto. Pensado para el cliente, la dirección que supervisa y auditoría. Sin ninguna acción de escritura. Equivalente a Viewer en Asana y guest en ClickUp.',
   '{}'::jsonb,
   true, 4, '{}'::jsonb)
ON CONFLICT (codigo) DO UPDATE
SET nombre      = EXCLUDED.nombre,
    alias       = EXCLUDED.alias,
    descripcion = EXCLUDED.descripcion,
    permisos    = EXCLUDED.permisos,
    activo      = EXCLUDED.activo,
    orden       = EXCLUDED.orden,
    updated_at  = now();

-- ==============================================================================
-- §3 · COMENTARIOS (obligatorios: toda tabla nueva lleva glosario en la BD)
-- ==============================================================================
COMMENT ON TABLE public.gp_roles_proyecto_v2_c IS
'Roles DENTRO de un proyecto. Glosario: owner = propietario responsable final (todas las acciones + editar_tipo + asignar_roles) · manager = dirige la ejecución (iniciar/pausar/reanudar/completar) · member = ejecuta tareas (editar_tareas/comentar), no mueve el estado · viewer = solo lectura. Terminología internacional tomada de Jira (Project Lead / Administrators / Developers), Asana (Admin/Editor/Viewer) y ClickUp (Owner). La columna alias guarda el nombre en español que ve el usuario. NO son accesos a la aplicación: el acceso se gobierna en public.user_app_roles (admin/editor/viewer/guest). Un rol de proyecto no otorga acceso a la app.';

COMMENT ON COLUMN public.gp_roles_proyecto_v2_c.id          IS 'Identificador técnico (uuid generado por gen_random_uuid()).';
COMMENT ON COLUMN public.gp_roles_proyecto_v2_c.codigo      IS 'Código del rol en terminología internacional: owner | manager | member | viewer. UNIQUE. Es la clave que referenciará gp_proyecto_miembros_r.rol_proyecto_codigo (tabla 27).';
COMMENT ON COLUMN public.gp_roles_proyecto_v2_c.nombre      IS 'Nombre del término estándar tal como se usa internacionalmente (Owner, Manager, Member, Viewer). No se traduce: es el nombre canónico.';
COMMENT ON COLUMN public.gp_roles_proyecto_v2_c.alias       IS 'Nombre en ESPAÑOL que se muestra al usuario (Propietario del proyecto, Gestor del proyecto, Miembro del equipo, Observador). Es la etiqueta de interfaz; el código sigue siendo el internacional.';
COMMENT ON COLUMN public.gp_roles_proyecto_v2_c.descripcion IS 'Definición exacta de quién es el rol y qué puede hacer, con su equivalente en Jira/Asana/ClickUp. Resuelve la duda de "quién es quién" sin salir de la base.';
COMMENT ON COLUMN public.gp_roles_proyecto_v2_c.permisos    IS 'Acciones de dirección permitidas: iniciar, pausar, reanudar, completar, cancelar, reabrir, editar_tipo, asignar_roles, editar_tareas, comentar. La RPC gp_cambiar_estado_proyecto (0010) lee permisos ->> <accion> y lo compara con ''true''. Objeto vacío = sin acciones de dirección.';
COMMENT ON COLUMN public.gp_roles_proyecto_v2_c.activo      IS 'Baja lógica del rol (true = vigente y asignable).';
COMMENT ON COLUMN public.gp_roles_proyecto_v2_c.orden       IS 'Orden de presentación (1 = máxima autoridad).';
COMMENT ON COLUMN public.gp_roles_proyecto_v2_c.metadata    IS 'Extensión jsonb reservada ({}).';
COMMENT ON COLUMN public.gp_roles_proyecto_v2_c.created_at  IS 'Creación de la fila.';
COMMENT ON COLUMN public.gp_roles_proyecto_v2_c.updated_at  IS 'Última modificación.';

-- ==============================================================================
-- §4 · RLS — mismo patrón que las 5 tablas ya creadas y verificadas (16-nov):
--   lectura  → user_can_use_app('gestor-proyectos')   (app contratada)
--   escritura→ is_platform_admin()                    (solo plataforma)
--   anon     → sin política (no lee)
-- ==============================================================================
ALTER TABLE public.gp_roles_proyecto_v2_c ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gp_roles_proyecto_v2_c_select ON public.gp_roles_proyecto_v2_c;
CREATE POLICY gp_roles_proyecto_v2_c_select ON public.gp_roles_proyecto_v2_c
  FOR SELECT TO authenticated
  USING (public.user_can_use_app('gestor-proyectos'));

DROP POLICY IF EXISTS gp_roles_proyecto_v2_c_insert ON public.gp_roles_proyecto_v2_c;
CREATE POLICY gp_roles_proyecto_v2_c_insert ON public.gp_roles_proyecto_v2_c
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_roles_proyecto_v2_c_update ON public.gp_roles_proyecto_v2_c;
CREATE POLICY gp_roles_proyecto_v2_c_update ON public.gp_roles_proyecto_v2_c
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_roles_proyecto_v2_c_delete ON public.gp_roles_proyecto_v2_c;
CREATE POLICY gp_roles_proyecto_v2_c_delete ON public.gp_roles_proyecto_v2_c
  FOR DELETE TO authenticated
  USING (public.is_platform_admin());

-- ==============================================================================
-- §5 · POST-VERIFICACIÓN — ejecutar y conservar la salida en la bitácora
--   Esperado: columnas=11 · filas=4 · politicas=4 · rls=true · alias no nulo
-- ==============================================================================
SELECT
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema='public' AND table_name='gp_roles_proyecto_v2_c') AS columnas,
  (SELECT count(*) FROM public.gp_roles_proyecto_v2_c)                    AS filas,
  (SELECT count(*) FROM pg_policies
     WHERE schemaname='public' AND tablename='gp_roles_proyecto_v2_c')     AS politicas,
  (SELECT relrowsecurity FROM pg_class
     WHERE oid='public.gp_roles_proyecto_v2_c'::regclass)                  AS rls,
  (SELECT count(*) FROM public.gp_roles_proyecto_v2_c WHERE alias IS NULL) AS alias_vacios;

-- Detalle del glosario (esperado: 4 filas, cada una con su alias en español)
SELECT codigo, nombre, alias, orden, activo, permisos
  FROM public.gp_roles_proyecto_v2_c
 ORDER BY orden;
