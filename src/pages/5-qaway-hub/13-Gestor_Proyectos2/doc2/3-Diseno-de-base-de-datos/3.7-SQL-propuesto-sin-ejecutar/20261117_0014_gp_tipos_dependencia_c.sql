-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN 0014 (aditiva, idempotente)
-- Fecha: 2026-11-17 | Convención: gp_* / _c catálogos / _r relaciones
-- Objetivo: catálogo de TIPOS DE DEPENDENCIA entre tareas y nodos EDT.
--   Valores estándar PMI/PMBOK: FS, SS, FF, SF.
-- SIN DROP / SIN TRUNCATE / SOLO ADITIVO.
-- Nota: si la tabla ya existía (creada antes sin la columna `alias`), este
--   script la completa con ALTER ADD COLUMN + backfill, sin perder datos.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ==============================================================================
-- §1 · TABLA (crea si no existe; si ya existe, no hace nada)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.gp_tipos_dependencia_c (
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
ALTER TABLE public.gp_tipos_dependencia_c
  ADD COLUMN IF NOT EXISTS alias text;

-- Backfill de alias para filas que aún no lo tengan (no pisa valores existentes)
UPDATE public.gp_tipos_dependencia_c
   SET alias = CASE codigo
                 WHEN 'FS' THEN 'Fin a comienzo'
                 WHEN 'SS' THEN 'Comienzo a comienzo'
                 WHEN 'FF' THEN 'Fin a fin'
                 WHEN 'SF' THEN 'Comienzo a fin'
                 ELSE alias
               END
 WHERE alias IS NULL;

-- ==============================================================================
-- §2 · SEED — 4 tipos estándar (idempotente)
-- ==============================================================================
INSERT INTO public.gp_tipos_dependencia_c (codigo, nombre, alias, descripcion, activo, orden, metadata)
VALUES
  ('FS', 'Finish-to-Start', 'Fin a comienzo',     'La tarea dependiente no puede EMPEZAR hasta que la tarea predecesora TERMINE. Es el tipo más común en cronogramas.', true, 1, '{}'::jsonb),
  ('SS', 'Start-to-Start',   'Comienzo a comienzo', 'La tarea dependiente no puede EMPEZAR hasta que la tarea predecesora EMPIECE.', true, 2, '{}'::jsonb),
  ('FF', 'Finish-to-Finish', 'Fin a fin',          'La tarea dependiente no puede TERMINAR hasta que la tarea predecesora TERMINE.', true, 3, '{}'::jsonb),
  ('SF', 'Start-to-Finish',  'Comienzo a fin',     'La tarea dependiente no puede TERMINAR hasta que la tarea predecesora EMPIECE. (Poco frecuente, se usa en just-in-time.)', true, 4, '{}'::jsonb)
ON CONFLICT (codigo) DO UPDATE
SET nombre      = EXCLUDED.nombre,
    alias       = EXCLUDED.alias,
    descripcion = EXCLUDED.descripcion,
    activo      = EXCLUDED.activo,
    orden       = EXCLUDED.orden,
    updated_at  = now();

-- Refuerzo: asegura alias poblado (por si el seed no alcanzó alguna fila)
UPDATE public.gp_tipos_dependencia_c
   SET alias = CASE codigo
                 WHEN 'FS' THEN 'Fin a comienzo'
                 WHEN 'SS' THEN 'Comienzo a comienzo'
                 WHEN 'FF' THEN 'Fin a fin'
                 WHEN 'SF' THEN 'Comienzo a fin'
                 ELSE alias
               END
 WHERE alias IS NULL;

-- (Opcional) endurecer NOT NULL solo si no quedan NULLs:
-- ALTER TABLE public.gp_tipos_dependencia_c ALTER COLUMN alias SET NOT NULL;

-- ==============================================================================
-- §3 · COMENTARIO (regla vigente: un solo COMMENT ON TABLE, sin COMMENT ON COLUMN)
-- ==============================================================================
COMMENT ON TABLE public.gp_tipos_dependencia_c IS
'Catálogo de tipos de DEPENDENCIA entre tareas y nodos EDT (estándar PMI/PMBOK). Glosario de valores: FS = Fin a comienzo (la dependiente no puede empezar hasta que la predecesora termine; el más común) · SS = Comienzo a comienzo (la dependiente no puede empezar hasta que la predecesora empiece) · FF = Fin a fin (la dependiente no puede terminar hasta que la predecesora termine) · SF = Comienzo a fin (la dependiente no puede terminar hasta que la predecesora empiece; poco frecuente, just-in-time). Columnas: id = identificador técnico uuid · codigo = código internacional del tipo (FS/SS/FF/SF), UNIQUE, clave referenciada por gp_nodo_dependencias_r.tipo_codigo y gp_tarea_dependencias_r.tipo_codigo (default FS) · nombre = término estándar en inglés (Finish-to-Start, etc.), no se traduce · alias = nombre en ESPAÑOL que ve el usuario (Fin a comienzo, Comienzo a comienzo, Fin a fin, Comienzo a fin) · descripcion = definición amigable de la dependencia · activo = baja lógica (true = vigente) · orden = orden de presentación (1..4) · metadata = extensión jsonb reservada ({}) · created_at = creación de la fila · updated_at = última modificación. Referenciado por gp_nodo_dependencias_r (tabla 31) y gp_tarea_dependencias_r (tabla 32).';

-- ==============================================================================
-- §4 · RLS — mismo patrón que las tablas ya creadas y verificadas
-- ==============================================================================
ALTER TABLE public.gp_tipos_dependencia_c ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS gp_tipos_dependencia_c_select ON public.gp_tipos_dependencia_c;
CREATE POLICY gp_tipos_dependencia_c_select ON public.gp_tipos_dependencia_c
  FOR SELECT TO authenticated
  USING (public.user_can_use_app('gestor-proyectos'));

DROP POLICY IF EXISTS gp_tipos_dependencia_c_insert ON public.gp_tipos_dependencia_c;
CREATE POLICY gp_tipos_dependencia_c_insert ON public.gp_tipos_dependencia_c
  FOR INSERT TO authenticated
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_tipos_dependencia_c_update ON public.gp_tipos_dependencia_c;
CREATE POLICY gp_tipos_dependencia_c_update ON public.gp_tipos_dependencia_c
  FOR UPDATE TO authenticated
  USING (public.is_platform_admin())
  WITH CHECK (public.is_platform_admin());

DROP POLICY IF EXISTS gp_tipos_dependencia_c_delete ON public.gp_tipos_dependencia_c;
CREATE POLICY gp_tipos_dependencia_c_delete ON public.gp_tipos_dependencia_c
  FOR DELETE TO authenticated
  USING (public.is_platform_admin());

-- ==============================================================================
-- §6 · LIMPIEZA DE SEGURIDAD (autorizada "aplica")
--   Elimina `select_auth` (qual=true) que permitía lectura a cualquier
--   autenticado, anulando `_select` (app contratada).
--   Se conserva `admin_all` (ALL, is_platform_admin) para no bloquear a
--   admins sin app contratada.
-- ==============================================================================
DROP POLICY IF EXISTS gp_tipos_dependencia_c_select_auth ON public.gp_tipos_dependencia_c;

-- ==============================================================================
-- §5 · POST-VERIFICACIÓN
--   Esperado tras §6: filas=4 · politicas=5 · rls=true · alias sin NULL
--   (admin_all + _select + _insert + _update + _delete)
-- ==============================================================================
SELECT
  (SELECT count(*) FROM information_schema.columns
     WHERE table_schema='public' AND table_name='gp_tipos_dependencia_c') AS columnas,
  (SELECT count(*) FROM public.gp_tipos_dependencia_c)                   AS filas,
  (SELECT count(*) FROM pg_policies
     WHERE schemaname='public' AND tablename='gp_tipos_dependencia_c')    AS politicas,
  (SELECT relrowsecurity FROM pg_class
     WHERE oid='public.gp_tipos_dependencia_c'::regclass)                 AS rls,
  (SELECT count(*) FROM public.gp_tipos_dependencia_c WHERE alias IS NULL) AS alias_nulos;

SELECT codigo, nombre, alias, descripcion, orden, activo
  FROM public.gp_tipos_dependencia_c
 ORDER BY orden;
