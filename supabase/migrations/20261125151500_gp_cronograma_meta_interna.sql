-- Agrega columna meta_interna_end (3.ª línea exclusiva de meta interna asignada al equipo)
ALTER TABLE public.gestor_cronograma_items
  ADD COLUMN IF NOT EXISTS meta_interna_end text;
