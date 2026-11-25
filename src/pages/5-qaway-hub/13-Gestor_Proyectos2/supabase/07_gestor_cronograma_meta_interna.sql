-- ==============================================================================
-- QAWAY LAB · GESTOR DE PROYECTOS · Fecha de Meta Interna persistida
-- Guarda en BD la fecha de meta interna (adelanto sobre fecha oficial según
-- días hábiles configurados por el Administrador) para que persista entre
-- sesiones y esté disponible en tabla y exportaciones PDF.
-- Idempotente (IF NOT EXISTS).
-- ==============================================================================

alter table public.gestor_cronograma_items
  add column if not exists meta_interna_end date;

comment on column public.gestor_cronograma_items.meta_interna_end is
  'Fecha de meta interna (adelanto sobre fecha oficial según días hábiles configurados por el Administrador).';
