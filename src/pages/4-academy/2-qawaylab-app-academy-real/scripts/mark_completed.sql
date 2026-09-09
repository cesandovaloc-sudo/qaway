-- Marcar "Data Science Fundamentals" como completado para el usuario de prueba
-- Pegar esto en el SQL Editor de Supabase (Dashboard > SQL Editor) y ejecutar

DO $$
DECLARE
  v_student_id uuid := '6025d56b-aefe-41b7-b14a-700089eb8879';
  v_course_id uuid := 'c0000000-0006-0000-0000-000000000006';
BEGIN
  -- 1. Marcar todas las lecciones del curso como completadas
  INSERT INTO public.progress (student_id, lesson_id, completed, seconds_watched, completed_at)
  SELECT
    v_student_id,
    l.id,
    true,
    600,
    now() - (random() * interval '30 days')
  FROM public.lessons l
  JOIN public.modules m ON m.id = l.module_id
  WHERE m.course_id = v_course_id
    AND l.status = 'published'
  ON CONFLICT (student_id, lesson_id) DO UPDATE
    SET completed = true,
        completed_at = EXCLUDED.completed_at,
        seconds_watched = GREATEST(progress.seconds_watched, EXCLUDED.seconds_watched);

  -- 2. Actualizar la inscripción a completada
  UPDATE public.enrollments
  SET status = 'completed',
      completed_at = now()
  WHERE student_id = v_student_id
    AND course_id = v_course_id;

  RAISE NOTICE '✅ Curso marcado como completado exitosamente';
END $$;
