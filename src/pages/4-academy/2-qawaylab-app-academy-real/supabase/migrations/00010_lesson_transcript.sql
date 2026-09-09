-- Qaway Academy - Add Transcript Support to Lessons
-- Migration 00010
--
-- Añade columna transcript a lessons para almacenar la transcripción
-- del video, ya sea obtenida automáticamente desde YouTube o subida manualmente.

alter table public.lessons
  add column if not exists transcript text,
  add column if not exists transcript_status text default 'none'
    check (transcript_status in ('none', 'auto', 'manual', 'pending'));
