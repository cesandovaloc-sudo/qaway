-- Qaway Academy - Extend resource types with Excel and Word
-- Migration 00008
-- ============================================================
-- PROBLEMA: El CHECK constraint en resources.type solo permitía
-- 'PDF', 'Video', 'Enlace', 'Ejercicio', 'Plantilla', 'Archivo'
-- Pero necesitamos 'Excel' y 'Word' para los recursos generados.
-- ============================================================

-- 1. Eliminar el constraint existente
ALTER TABLE public.resources
  DROP CONSTRAINT IF EXISTS resources_type_check;

-- 2. Recrearlo con los nuevos tipos
ALTER TABLE public.resources
  ADD CONSTRAINT resources_type_check
  CHECK (type IN ('PDF', 'Video', 'Enlace', 'Ejercicio', 'Plantilla', 'Archivo', 'Excel', 'Word'));
