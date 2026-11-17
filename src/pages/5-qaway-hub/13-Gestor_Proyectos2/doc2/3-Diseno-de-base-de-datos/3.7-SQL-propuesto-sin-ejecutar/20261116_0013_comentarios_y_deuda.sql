-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN 0013
-- Fecha: 2026-11-16
-- Objetivo: (1) dejar COMMENT ON TABLE + COMMENT ON COLUMN en las 5 tablas ya
--          creadas (gp_estados_proyecto_c, gp_tipos_proyecto_c,
--          gp_estados_ejecucion_c, gp_prioridades_c, gp_roles_proyecto_c),
--          que hasta hoy solo tenían glosario en gp_prioridades_c.
--          (2) marcar gp_roles_proyecto_c como DEPRECIADA (deuda), sin borrarla
--          (nada está en producción).
-- REGLA (vigente desde esta migración): toda tabla nueva del módulo lleva
--          COMMENT ON TABLE con glosario de sus valores + COMMENT ON COLUMN por
--          columna. Sin excepciones, incluso catálogos "obvios".
-- SIN DROP / SIN TRUNCATE / SOLO ADITIVO. Idempotente.
-- ==============================================================================

-- ==============================================================================
-- 1) gp_estados_proyecto_c — ciclo de vida del proyecto (5 valores)
-- ==============================================================================
COMMENT ON TABLE public.gp_estados_proyecto_c IS
'Catálogo de estados del ciclo de vida de un proyecto. Glosario: planificacion = definido, aún no arranca · en_curso = ejecución activa · pausado = detenido temporalmente · completado = cerrado con éxito · cancelado = cancelado definitivamente. UN catálogo por proyecto (no confundir con los estados de ejecución de tareas/nodos).';

COMMENT ON COLUMN public.gp_estados_proyecto_c.id          IS 'Identificador técnico (uuid).';
COMMENT ON COLUMN public.gp_estados_proyecto_c.codigo      IS 'Código del estado. UNIQUE. Clave referenciada por gp_proyectos.estado_codigo (ON UPDATE CASCADE).';
COMMENT ON COLUMN public.gp_estados_proyecto_c.nombre      IS 'Etiqueta visible del estado.';
COMMENT ON COLUMN public.gp_estados_proyecto_c.descripcion IS 'Texto libre opcional.';
COMMENT ON COLUMN public.gp_estados_proyecto_c.activo      IS 'Baja lógica del valor (true = vigente).';
COMMENT ON COLUMN public.gp_estados_proyecto_c.orden       IS 'Orden de presentación.';
COMMENT ON COLUMN public.gp_estados_proyecto_c.metadata    IS 'Extensión jsonb reservada ({}).';
COMMENT ON COLUMN public.gp_estados_proyecto_c.created_at  IS 'Creación de la fila.';
COMMENT ON COLUMN public.gp_estados_proyecto_c.updated_at  IS 'Última modificación.';

-- ==============================================================================
-- 2) gp_tipos_proyecto_c — tipología de proyecto (VACÍA por diseño, E6)
-- ==============================================================================
COMMENT ON TABLE public.gp_tipos_proyecto_c IS
'Catálogo de tipos de proyecto. CREADO VACÍO por diseño: la clasificación funcional está pendiente de decisión de negocio (E6). No inventar valores. gp_proyectos.tipo_proyecto_codigo es NULL-able; los formularios no deben ofrecer opciones hasta que el seed sea aprobado.';

COMMENT ON COLUMN public.gp_tipos_proyecto_c.id          IS 'Identificador técnico (uuid).';
COMMENT ON COLUMN public.gp_tipos_proyecto_c.codigo      IS 'Código del tipo. UNIQUE.';
COMMENT ON COLUMN public.gp_tipos_proyecto_c.nombre      IS 'Etiqueta visible del tipo.';
COMMENT ON COLUMN public.gp_tipos_proyecto_c.descripcion IS 'Texto libre opcional.';
COMMENT ON COLUMN public.gp_tipos_proyecto_c.activo      IS 'Baja lógica del valor (true = vigente).';
COMMENT ON COLUMN public.gp_tipos_proyecto_c.orden       IS 'Orden de presentación.';
COMMENT ON COLUMN public.gp_tipos_proyecto_c.metadata    IS 'Extensión jsonb reservada ({}).';
COMMENT ON COLUMN public.gp_tipos_proyecto_c.created_at  IS 'Creación de la fila.';
COMMENT ON COLUMN public.gp_tipos_proyecto_c.updated_at  IS 'Última modificación.';

-- ==============================================================================
-- 3) gp_estados_ejecucion_c — estados de ejecución UNIFICADO (tareas + nodos)
-- ==============================================================================
COMMENT ON TABLE public.gp_estados_ejecucion_c IS
'Catálogo UNIFICADO de estados de ejecución para tareas y nodos EDT (un solo catálogo, no duplicar). Glosario: pendiente = por hacer · en_proceso = en trabajo · en_revision = entregado para revisión · completada = terminada · bloqueada = detenida por impedimento · cancelada = descartada.';

COMMENT ON COLUMN public.gp_estados_ejecucion_c.id          IS 'Identificador técnico (uuid).';
COMMENT ON COLUMN public.gp_estados_ejecucion_c.codigo      IS 'Código del estado. UNIQUE. Clave referenciada por gp_tareas.estado_codigo y gp_nodos_edt.estado_codigo.';
COMMENT ON COLUMN public.gp_estados_ejecucion_c.nombre      IS 'Etiqueta visible del estado.';
COMMENT ON COLUMN public.gp_estados_ejecucion_c.descripcion IS 'Texto libre opcional (adoptada 16-nov: ya existía en vivo).';
COMMENT ON COLUMN public.gp_estados_ejecucion_c.activo      IS 'Baja lógica del valor (true = vigente).';
COMMENT ON COLUMN public.gp_estados_ejecucion_c.orden       IS 'Orden de presentación.';
COMMENT ON COLUMN public.gp_estados_ejecucion_c.metadata    IS 'Extensión jsonb reservada ({}).';
COMMENT ON COLUMN public.gp_estados_ejecucion_c.created_at  IS 'Creación de la fila.';
COMMENT ON COLUMN public.gp_estados_ejecucion_c.updated_at  IS 'Última modificación.';
COMMENT ON COLUMN public.gp_estados_ejecucion_c.color       IS 'Color asociado al estado (última columna en vivo).';

-- ==============================================================================
-- 4) gp_prioridades_c — prioridades (baja/1, media/2, alta/3, urgente/4)
-- ==============================================================================
COMMENT ON TABLE public.gp_prioridades_c IS
'Catálogo de prioridades de tareas y nodos EDT. Glosario: baja = 1 · media = 2 · alta = 3 · urgente = 4 (nivel = peso numérico).';

COMMENT ON COLUMN public.gp_prioridades_c.id          IS 'Identificador técnico (uuid generado por gen_random_uuid()).';
COMMENT ON COLUMN public.gp_prioridades_c.codigo      IS 'Código único del catálogo (UNIQUE). Clave referenciada por gp_tareas.prioridad_codigo (0002) con ON UPDATE CASCADE.';
COMMENT ON COLUMN public.gp_prioridades_c.nombre      IS 'Etiqueta visible del valor del catálogo.';
COMMENT ON COLUMN public.gp_prioridades_c.descripcion IS 'Texto libre opcional (adoptada 16-nov: ya existía en vivo).';
COMMENT ON COLUMN public.gp_prioridades_c.nivel       IS 'Peso numérico de la prioridad (seed: baja=1, media=2, alta=3, urgente=4).';
COMMENT ON COLUMN public.gp_prioridades_c.activo      IS 'Baja lógica del valor (true = vigente).';
COMMENT ON COLUMN public.gp_prioridades_c.orden       IS 'Orden de presentación (default 0).';
COMMENT ON COLUMN public.gp_prioridades_c.metadata    IS 'Extensión jsonb reservada ({}).';
COMMENT ON COLUMN public.gp_prioridades_c.created_at  IS 'Creación de la fila.';
COMMENT ON COLUMN public.gp_prioridades_c.updated_at  IS 'Última modificación (el trigger trg_gp_prioridades_c_updated_at llega con 0004).';

-- ==============================================================================
-- 5) gp_roles_proyecto_c — DEPRECIADA (deuda), se mantiene hasta migrar el FK
-- ==============================================================================
COMMENT ON TABLE public.gp_roles_proyecto_c IS
'DEPRECIADA (deuda técnica). Catálogo antiguo de roles de proyecto con terminología local (administrador/gestor/coordinador/supervisor/colaborador/lector). Sustituido por gp_roles_proyecto_v2_c (owner/manager/member/viewer) con terminología internacional + alias en español. No borrar hasta: (a) gp_proyecto_miembros_r (tabla 27) referencie gp_roles_proyecto_v2_c, (b) no existan datos en gp_roles_proyecto_c o se migren, (c) se actualice gpCicloVidaService.ts. Nadie consume la tabla hoy (ninguna tabla _r creada).';

COMMENT ON COLUMN public.gp_roles_proyecto_c.id          IS 'Identificador técnico (uuid).';
COMMENT ON COLUMN public.gp_roles_proyecto_c.codigo      IS 'Código antiguo (administrador, gestor, coordinador, supervisor, colaborador, lector). DEPRECIADO.';
COMMENT ON COLUMN public.gp_roles_proyecto_c.nombre      IS 'Nombre antiguo. DEPRECIADO.';
COMMENT ON COLUMN public.gp_roles_proyecto_c.descripcion IS 'Descripción antigua. DEPRECIADO.';
COMMENT ON COLUMN public.gp_roles_proyecto_c.permisos    IS 'Matriz antigua. DEPRECIADO. Nueva matriz en gp_roles_proyecto_v2_c.permisos.';
COMMENT ON COLUMN public.gp_roles_proyecto_c.activo      IS 'Baja lógica. DEPRECIADO.';
COMMENT ON COLUMN public.gp_roles_proyecto_c.orden       IS 'Orden antiguo. DEPRECIADO.';
COMMENT ON COLUMN public.gp_roles_proyecto_c.metadata    IS 'Extensión jsonb. DEPRECIADO.';
COMMENT ON COLUMN public.gp_roles_proyecto_c.created_at  IS 'Creación de la fila.';
COMMENT ON COLUMN public.gp_roles_proyecto_c.updated_at  IS 'Última modificación.';

-- ==============================================================================
-- 6) Verificación — todas las tablas creadas tienen comentario (esperado: 5)
-- ==============================================================================
SELECT count(*) AS tablas_con_comentario
  FROM pg_description d
  JOIN pg_class c ON c.oid = d.objoid
  JOIN pg_namespace n ON n.oid = c.relnamespace
 WHERE n.nspname = 'public'
   AND c.relkind = 'r'
   AND d.objsubid = 0
   AND c.relname IN (
     'gp_estados_proyecto_c','gp_tipos_proyecto_c','gp_estados_ejecucion_c',
     'gp_prioridades_c','gp_roles_proyecto_c','gp_roles_proyecto_v2_c'
   );
