-- ==============================================================================
-- QAWAY LAB · GESTOR DE PROYECTOS · Tipo EDT y Predecesores persistidos
-- Guarda en la base la clasificación PMI/PMBOK del nodo (COMPONENTE, PRODUCTO,
-- ENTREGABLE, PAQUETE_TRABAJO) y sus predecesores, en lugar de recalcularlos
-- siempre con las tablas fijas del código.
-- Idempotente (IF NOT EXISTS). No borra ni altera datos existentes.
-- Ejecutar en el SQL Editor de Supabase.
-- ==============================================================================

alter table public.gestor_cronograma_items
  add column if not exists edt_type text,
  add column if not exists dependencies text[] default '{}'::text[];

comment on column public.gestor_cronograma_items.edt_type is
  'Tipo de nodo EDT/WBS (COMPONENTE, PRODUCTO, ENTREGABLE, PAQUETE_TRABAJO, HITO). NULL = se deriva del árbol (fuente única: cronograma-core/edtPmbokModel.ts).';
comment on column public.gestor_cronograma_items.dependencies is
  'Predecesores del nodo: ids de otros ítems del mismo proyecto (cadena de prelación).';
