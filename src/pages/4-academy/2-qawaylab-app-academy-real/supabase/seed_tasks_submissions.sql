-- Seed: Tasks & Submissions for testing TaskReview
-- Run this in Supabase SQL Editor AFTER migrations and seed.sql

-- ============================================================
-- 1. Create student profiles (they need auth users, but profiles
--    are created by trigger on signup. For seed, insert manually)
-- ============================================================
INSERT INTO public.profiles (id, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000003', 'Luis García', 'student'),
  ('00000000-0000-0000-0000-000000000004', 'María Torres', 'student'),
  ('00000000-0000-0000-0000-000000000005', 'Pedro Sánchez', 'student')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 2. Enroll students in teacher's courses
--    Teacher 1 (Carlos López): curso 1 (Desarrollo Web)
-- ============================================================
INSERT INTO public.enrollments (student_id, course_id, status) VALUES
  ('00000000-0000-0000-0000-000000000003', 'c0000000-0001-0000-0000-000000000001', 'active'),
  ('00000000-0000-0000-0000-000000000004', 'c0000000-0001-0000-0000-000000000001', 'active'),
  ('00000000-0000-0000-0000-000000000005', 'c0000000-0001-0000-0000-000000000001', 'active')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- ============================================================
-- 3. Create tasks for lessons of Course 1 (Desarrollo Web)
--    Lessons: b0000101, b0000102, b0000103, etc.
-- ============================================================
INSERT INTO public.tasks (id, lesson_id, title, description, due_days) VALUES
  ('d0000001-0000-0000-0000-000000000001', 'b0000101-0000-0000-0000-000000000001',
   'Ejercicio: Tu primera página HTML',
   'Crea una página HTML con tu biografía personal. Debe incluir: título, párrafos, una imagen y un enlace a tu red social favorita.',
   7),
  ('d0000001-0000-0000-0000-000000000002', 'b0000102-0000-0000-0000-000000000001',
   'Ejercicio: Lista de tareas con etiquetas',
   'Usa etiquetas semánticas HTML para crear una lista de tareas pendientes. Incluye header, main, section, article y footer.',
   7),
  ('d0000001-0000-0000-0000-000000000003', 'b0000103-0000-0000-0000-000000000001',
   'Formulario de registro',
   'Diseña un formulario de registro con: nombre, email, contraseña, selección de país y checkbox de términos.',
   5),
  ('d0000001-0000-0000-0000-000000000004', 'b0000106-0000-0000-0000-000000000001',
   'Manipulación del DOM',
   'Crea un script que modifique el DOM: agregar elementos, cambiar estilos y responder a clicks del usuario.',
   10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- 4. Create submissions (some pending, some reviewed)
-- ============================================================
INSERT INTO public.submissions (id, task_id, student_id, file_url, notes, status, submitted_at) VALUES
  -- Luis García: 1 pending, 1 reviewed
  ('e0000001-0000-0000-0000-000000000001', 'd0000001-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000003',
   'https://example.com/submissions/luis-html-biografia.html',
   'Profesor, aquí está mi biografía. Usé las etiquetas que vimos en clase: header, section y footer. Espero sus comentarios.',
   'pending', now() - interval '2 days'),

  ('e0000001-0000-0000-0000-000000000002', 'd0000001-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000003',
   'https://example.com/submissions/luis-lista-tareas.html',
   'Lista de tareas con HTML semántico. Incluí article para cada tarea y un progress bar de ejemplo.',
   'approved', now() - interval '5 days'),

  -- María Torres: 2 pending
  ('e0000001-0000-0000-0000-000000000003', 'd0000001-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000004',
   'https://example.com/submissions/maria-biografia.html',
   'Mi primera página web. Está sencilla pero espero mejorar con las siguientes lecciones.',
   'pending', now() - interval '1 day'),

  ('e0000001-0000-0000-0000-000000000004', 'd0000001-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000004',
   'https://example.com/submissions/maria-formulario.html',
   'Formulario de registro completo con validación básica en HTML5.',
   'pending', now() - interval '12 hours'),

  -- Pedro Sánchez: 1 pending, 1 returned
  ('e0000001-0000-0000-0000-000000000005', 'd0000001-0000-0000-0000-000000000001',
   '00000000-0000-0000-0000-000000000005',
   NULL,
   'No pude agregar la imagen porque no sé cómo subirla a internet. El resto está bien.',
   'pending', now() - interval '3 days'),

  ('e0000001-0000-0000-0000-000000000006', 'd0000001-0000-0000-0000-000000000002',
   '00000000-0000-0000-0000-000000000005',
   'https://example.com/submissions/pedro-lista-tareas.html',
   'Lista de tareas con sus etiquetas semánticas.',
   'returned', now() - interval '7 days'),

  -- Luis García: 1 more pending (formulario)
  ('e0000001-0000-0000-0000-000000000007', 'd0000001-0000-0000-0000-000000000003',
   '00000000-0000-0000-0000-000000000003',
   'https://example.com/submissions/luis-formulario.html',
   'Formulario completo con validación. Usé input types de HTML5.',
   'pending', now() - interval '6 hours')
ON CONFLICT (id) DO NOTHING;
