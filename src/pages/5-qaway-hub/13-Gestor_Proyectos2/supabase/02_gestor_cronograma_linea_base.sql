-- ==============================================================================
-- QAWAY LAB · GESTOR DE PROYECTOS · Fase 1 de control de plazos
-- Línea base (fechas aprobadas) y fechas reales de ejecución por ítem del cronograma.
-- Es seguro ejecutarlo más de una vez (IF NOT EXISTS). No borra ni altera datos existentes.
-- Ejecutar en el SQL Editor de Supabase.
-- ==============================================================================

alter table public.gestor_cronograma_items
  add column if not exists baseline_start date,
  add column if not exists baseline_end   date,
  add column if not exists actual_start   date,
  add column if not exists actual_end     date;
