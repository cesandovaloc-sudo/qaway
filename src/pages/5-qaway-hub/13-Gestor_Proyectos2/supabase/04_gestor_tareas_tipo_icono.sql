-- ==============================================================================
-- QAWAY LAB · GESTOR DE PROYECTOS REGIONALES 2027
-- Esquema Supabase: Tipo de Tarea Oficial e Icono para Tareas de Gestión y Monitoreo
-- Idempotente: puede ejecutarse de forma segura sin alterar datos existentes.
-- ==============================================================================

alter table public.gestor_cronograma_items
  add column if not exists task_type text default 'Trabajo EDT',
  add column if not exists icon text;
