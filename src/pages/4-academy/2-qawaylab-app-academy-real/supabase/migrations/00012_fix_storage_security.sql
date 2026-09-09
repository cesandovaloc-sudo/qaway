-- Qaway Academy - Fix Resources Storage Security
-- Migration 00012
-- ============================================================
-- CAMBIO CRÍTICO: El bucket 'resources' pasa de público a privado.
-- Ahora solo usuarios autenticados con acceso (inscritos, docentes,
-- admin) pueden generar signed URLs para leer archivos.
-- ============================================================

-- 1. Marcar bucket como privado (solo signed URLs)
update storage.buckets
set public = false
where name = 'resources';

-- 2. Reemplazar policies de storage.objects para el bucket resources
--    Eliminar la policy pública de lectura
drop policy if exists "Anyone can read resources" on storage.objects;

--    Policy: Estudiantes inscritos pueden leer archivos de sus cursos
--    Usa la convencion de ruta: courseId/lessonId/filename
--    (storage.foldername(name))[1] extrae el courseId del path
create policy "Enrolled students can read resources"
  on storage.objects for select
  using (
    bucket_id = 'resources'
    and exists (
      select 1 from public.enrollments
      where student_id = auth.uid()
        and status in ('active', 'completed')
        and course_id::text = (storage.foldername(name))[1]
    )
  );

-- 3. Asegurar que teachers pueden leer (ya tienen policy de manage)
--    y admin también (ya tiene policy de manage)
--    Las policies existentes "Teachers can manage their resources" y
--    "Admin can manage all resources" ya cubren SELECT porque usan FOR ALL.
