-- Qaway Academy - Seed Certificates + Auto-issuance Trigger
-- ============================================================
-- PARTE 1: Insertar certificados para cursos completados
-- ============================================================

-- Certificado para Data Science Fundamentals
INSERT INTO public.certificates (student_id, course_id, certificate_url, issued_at)
SELECT
  '6025d56b-aefe-41b7-b14a-700089eb8879',
  'c0000000-0006-0000-0000-000000000006',
  '/certificates/data-science-fundamentals.pdf',
  now()
WHERE NOT EXISTS (
  SELECT 1 FROM public.certificates
  WHERE student_id = '6025d56b-aefe-41b7-b14a-700089eb8879'
    AND course_id = 'c0000000-0006-0000-0000-000000000006'
);

-- ============================================================
-- PARTE 2: Trigger automático — emite certificado al completar curso
-- ============================================================
CREATE OR REPLACE FUNCTION public.issue_certificate_on_completion()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Solo cuando el enrollment cambia a 'completed'
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    -- Insertar certificado si no existe ya
    INSERT INTO public.certificates (student_id, course_id, certificate_url, issued_at)
    VALUES (
      NEW.student_id,
      NEW.course_id,
      NULL, -- se actualizará cuando se genere el PDF real
      now()
    )
    ON CONFLICT (student_id, course_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Aplicar el trigger a la tabla enrollments
DROP TRIGGER IF EXISTS on_enrollment_completed ON public.enrollments;
CREATE TRIGGER on_enrollment_completed
  AFTER UPDATE OF status ON public.enrollments
  FOR EACH ROW
  WHEN (NEW.status = 'completed')
  EXECUTE FUNCTION public.issue_certificate_on_completion();
