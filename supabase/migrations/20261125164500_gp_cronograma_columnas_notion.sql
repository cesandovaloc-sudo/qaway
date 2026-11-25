-- ============================================================================
-- Fase 1 · Columnas dinámicas estilo Notion + Entidad + Observaciones
-- ============================================================================
-- Aislado por tenant_id / proyecto: cada tenant define sus propias columnas
-- en gestor_proyectos.custom_columns y sus valores por fila en
-- gestor_cronograma_items.custom_fields, sin contaminar a otros tenants.
-- ============================================================================

ALTER TABLE public.gestor_cronograma_items
  ADD COLUMN IF NOT EXISTS entidad_responsable text,
  ADD COLUMN IF NOT EXISTS observaciones text NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS custom_fields jsonb NOT NULL DEFAULT '{}'::jsonb;

ALTER TABLE public.gestor_proyectos
  ADD COLUMN IF NOT EXISTS custom_columns jsonb NOT NULL DEFAULT '[]'::jsonb;
