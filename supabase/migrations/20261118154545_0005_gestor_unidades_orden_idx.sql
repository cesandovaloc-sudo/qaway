-- GESTOR DE PROYECTOS 2 · MIGRACIÓN v2 ADITIVA 0005 (aplicada 18-nov-2026)
-- gestor_unidades: columna `orden` + índice de jerarquía. SIN DROP/TRUNCATE. IDEMPOTENTE.
-- Origen: doc2/3-Diseno-de-base-de-datos/3.7-SQL-propuesto-sin-ejecutar/20261114_0005_gestor_unidades_orden_idx.sql
ALTER TABLE public.gestor_unidades
  ADD COLUMN IF NOT EXISTS orden integer;

COMMENT ON COLUMN public.gestor_unidades.orden IS
  'Posicion entre hermanos para la numeracion visible (1.1, 1.2...). NULL = orden de insercion. Cache de presentacion; la verdad jerarquica es parent_unit_id.';

CREATE INDEX IF NOT EXISTS idx_gestor_unidades_parent
  ON public.gestor_unidades (parent_unit_id);
