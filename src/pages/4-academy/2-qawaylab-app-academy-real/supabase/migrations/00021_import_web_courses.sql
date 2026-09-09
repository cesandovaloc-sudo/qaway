-- Qaway Academy - Import Web Hardcoded Courses
-- Migration 00021
-- ============================================================
-- IMPORTACIÓN: cursos que estaban hardcodeados en la página
-- /academy de la web principal (src/data/academyCourses.js).
--
-- REGLA DE ARQUITECTURA: la Academy es la fuente de verdad de
-- cursos. Estos 7 cursos se importan para que tanto la app como
-- la web se alimenten de la misma Supabase.
--
-- Las portadas se copiaron al repo de la Academy en:
--   public/assets/pages/4-academy/        (3 imágenes)
--   public/assets/pages/9-pruebas/academy/ (1 imagen)
-- Se usa la MISMA ruta relativa que la web, para que ambos
-- frontends (web y academy) resuelvan la imagen en su propio
-- dominio sin depender del otro.
-- ============================================================

insert into public.courses (id, title, slug, description, short_description, instructor_id, category, level, duration, price, is_free, image_url, status, featured, free_preview_lessons, what_you_learn, requirements, target_audience) values
-- ============================================================
-- 1-3. CURSOS DESTACADOS (featured = true)
-- ============================================================
('c1000000-0001-0000-0000-000000000001',
 'Identidad Visual con IA',
 'identidad-visual-con-ia',
 'Construye una identidad coherente usando criterio visual, herramientas de IA y un sistema que puedas seguir aplicando. Un curso práctico para crear marcas con identidad sólida y reproducible.',
 'Construye una identidad coherente usando criterio visual, herramientas de IA y un sistema que puedas seguir aplicando.',
 null,
 'Diseño', null, '6 módulos', null, false,
 '/assets/pages/4-academy/curso-identidad-visual-ia2.png',
 'published', true, 0, '[]', '[]', '[]'),

('c1000000-0002-0000-0000-000000000002',
 'WhatsApp Business para negocios',
 'whatsapp-business-para-negocios',
 'Organiza consultas, respuestas, catálogo y seguimiento para convertir conversaciones en una mejor experiencia comercial. Taller guiado con aplicación inmediata.',
 'Organiza consultas, respuestas, catálogo y seguimiento para convertir conversaciones en una mejor experiencia comercial.',
 null,
 'Marketing', null, '4 sesiones', null, false,
 '/assets/pages/4-academy/curso-whatsapp-business2.png',
 'published', true, 0, '[]', '[]', '[]'),

('c1000000-0003-0000-0000-000000000003',
 'Antigravity desde cero',
 'antigravity-desde-cero',
 'Una ruta audiovisual para comprender la herramienta, experimentar con ella y llevarla a proyectos creativos reales. Serie gratuita disponible en YouTube.',
 'Una ruta audiovisual para comprender Antigravity y llevarla a proyectos creativos reales.',
 null,
 'Inteligencia Artificial', null, 'En YouTube', 0, true,
 '/assets/pages/4-academy/curso-antigravity-youtube2.png',
 'published', true, 0, '[]', '[]', '[]'),

-- ============================================================
-- 4-7. CATÁLOGO (featured = false)
-- ============================================================
('c1000000-0004-0000-0000-000000000004',
 'IA para equipos pequeños',
 'ia-para-equipos-pequenos',
 'Organiza tareas, reuniones e información con un sistema sencillo y colaborativo. Programa de 5 semanas para equipos que quieren adoptar IA sin fricción.',
 'Organiza tareas, reuniones e información con un sistema sencillo y colaborativo.',
 null,
 'Productividad', null, '5 semanas', null, false,
 '/assets/pages/9-pruebas/academy/curso-productividad-ia.png',
 'published', false, 0, '[]', '[]', '[]'),

('c1000000-0005-0000-0000-000000000005',
 'Sistema de contenido con IA',
 'sistema-de-contenido-con-ia',
 'Diseña una ruta sostenible para investigar, crear y adaptar contenido sin improvisar. Un curso de 7 módulos para profesionales del contenido.',
 'Diseña una ruta sostenible para investigar, crear y adaptar contenido sin improvisar.',
 null,
 'Inteligencia Artificial', null, '7 módulos', null, false,
 '/assets/pages/4-academy/curso-identidad-visual-ia2.png',
 'published', false, 0, '[]', '[]', '[]'),

('c1000000-0006-0000-0000-000000000006',
 'Workflows sin código',
 'workflows-sin-codigo',
 'Conecta herramientas y construye automatizaciones útiles sin depender de desarrollo complejo. Taller en vivo sobre automatización no-code.',
 'Conecta herramientas y construye automatizaciones útiles sin depender de desarrollo complejo.',
 null,
 'Automatización', null, 'En vivo', null, false,
 '/assets/pages/9-pruebas/academy/curso-productividad-ia.png',
 'published', false, 0, '[]', '[]', '[]'),

('c1000000-0007-0000-0000-000000000007',
 'Presencia digital para emprender',
 'presencia-digital-para-emprender',
 'Ordena tu propuesta, tus canales y tu comunicación para presentarte con claridad. Una ruta de 4 semanas para emprendedores.',
 'Ordena tu propuesta, tus canales y tu comunicación para presentarte con claridad.',
 null,
 'Marketing', null, '4 semanas', null, false,
 '/assets/pages/4-academy/curso-whatsapp-business2.png',
 'published', false, 0, '[]', '[]', '[]')
on conflict (slug) do nothing;
