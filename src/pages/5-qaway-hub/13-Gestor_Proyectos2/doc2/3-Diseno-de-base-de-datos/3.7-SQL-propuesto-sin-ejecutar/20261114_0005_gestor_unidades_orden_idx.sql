-- ==============================================================================
-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0005
-- Archivo: 20261114_0005_gestor_unidades_orden_idx.sql
-- Fecha: 2026-11-14 | gestor_unidades: columna `orden` + índice de jerarquía
-- SIN DROP/TRUNCATE. SOLO ADITIVO. IDEMPOTENTE (re-ejecutable).
--
-- Objetivo: soporte para la numeración jerárquica visible (1, 1.1, 1.1.1…)
--   · `orden` = posición ENTRE HERMANOS, decidida por el usuario. La verdad
--     jerárquica sigue siendo parent_unit_id (decisión confirmada 2026-11).
--   · NULL en los 251 seeds DRE/UGEL existentes = orden de inserción
--     (desempate por created_at, id — ver organizacionJerarquia.ts).
--     NO se reorganiza ningún dato existente.
--   · Índice en parent_unit_id: recorridos del árbol (CTE) y joins desde
--     gp_proyecto_unidades_r.unidad_id / gp_nodos_edt.sede_unidad_id.
--
-- NO TOCA: datos existentes, RLS, otras tablas, otras columnas nuevas.
-- Tipo real verificado 14-nov-2026: id/tenant_id/parent_unit_id = TEXT.
-- ==============================================================================

ALTER TABLE public.gestor_unidades
  ADD COLUMN IF NOT EXISTS orden integer;

COMMENT ON COLUMN public.gestor_unidades.orden IS
  'Posicion entre hermanos para la numeracion visible (1.1, 1.2...). NULL = orden de insercion. Cache de presentacion; la verdad jerarquica es parent_unit_id.';

CREATE INDEX IF NOT EXISTS idx_gestor_unidades_parent
  ON public.gestor_unidades (parent_unit_id);

-- Post-check informativo (esperado 0: no se reordena nada hoy):
-- SELECT count(*) FROM public.gestor_unidades WHERE orden IS NOT NULL;
