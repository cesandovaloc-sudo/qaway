-- Qaway Academy - Seed Resources (vinculados a lecciones específicas)
-- Requisito: Ejecutar ANTES supabase/migrations/00008_resource_types.sql
--            (agrega 'Excel' y 'Word' a los tipos permitidos)
-- Ejecutar DESPUÉS de haber generado los archivos con scripts/generate-resources.js
-- ============================================================

INSERT INTO public.resources (lesson_id, course_id, title, type, file_url, file_size) VALUES

-- CURSO 1: Introducción al Desarrollo Web
('b0000101-0000-0000-0000-000000000001', 'c0000000-0001-0000-0000-000000000001',
 'Guía de HTML5 - Estructura Básica', 'PDF',
 '/resources/guia-html5-estructura.pdf', '148.5 KB'),

('b0000102-0000-0000-0000-000000000001', 'c0000000-0001-0000-0000-000000000001',
 'Ejercicios de Etiquetas HTML', 'Excel',
 '/resources/ejercicios-etiquetas-html.xlsx', '12.3 KB'),

('b0000105-0000-0000-0000-000000000001', 'c0000000-0001-0000-0000-000000000001',
 'Práctica Flexbox y Grid', 'Excel',
 '/resources/practica-flexbox-grid.xlsx', '11.8 KB'),

('b0000109-0000-0000-0000-000000000001', 'c0000000-0001-0000-0000-000000000001',
 'Plantilla de Despliegue Web', 'Word',
 '/resources/plantilla-despliegue-web.docx', '18.2 KB'),

-- CURSO 2: JavaScript Avanzado
('b0000201-0000-0000-0000-000000000001', 'c0000000-0002-0000-0000-000000000002',
 'Guía de Closures y Event Loop', 'PDF',
 '/resources/guia-closures-event-loop.pdf', '152.1 KB'),

('b0000204-0000-0000-0000-000000000001', 'c0000000-0002-0000-0000-000000000002',
 'Ejercicios de Async/Await', 'Excel',
 '/resources/ejercicios-async-await.xlsx', '11.5 KB'),

-- CURSO 6: Data Science Fundamentals
('b0000601-0000-0000-0000-000000000001', 'c0000000-0006-0000-0000-000000000006',
 'Cheatsheet Python para Data Science', 'PDF',
 '/resources/cheatsheet-python-data-science.pdf', '155.2 KB'),

('b0000603-0000-0000-0000-000000000001', 'c0000000-0006-0000-0000-000000000006',
 'Datos de Ejemplo para Gráficos', 'Excel',
 '/resources/datos-ejemplo-graficos.xlsx', '13.1 KB'),

('b0000606-0000-0000-0000-000000000001', 'c0000000-0006-0000-0000-000000000006',
 'Guía del Proyecto Final - Data Science', 'Word',
 '/resources/guia-proyecto-final-ds.docx', '19.5 KB'),

('b0000606-0000-0000-0000-000000000001', 'c0000000-0006-0000-0000-000000000006',
 'Datos Complementarios - Proyecto Final', 'Excel',
 '/resources/datos-proyecto-ds.xlsx', '12.7 KB')

ON CONFLICT DO NOTHING;
