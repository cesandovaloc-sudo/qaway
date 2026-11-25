-- ============================================================================
-- Fase + Sub-fase opcionales (NULLABLE) en gestor_cronograma_items
-- ============================================================================
-- Aplica a todos los proyectos/tenants sin obligar su uso:
--   · fase_id: dimensión oficial de Fase (ej. FASE-INICIO, FASE-PLANIFICACION, etc.)
--   · subfase: sub-fase operativa vinculada (ej. Gestión de almacenes, SIAGIE ME, etc.)
-- ============================================================================

ALTER TABLE public.gestor_cronograma_items
  ADD COLUMN IF NOT EXISTS fase_id text,
  ADD COLUMN IF NOT EXISTS subfase text;
