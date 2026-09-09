-- Qaway Academy - Seed Data
-- Run AFTER migrations 00001, 00002, 00003
-- Usage: Paste into Supabase SQL Editor or run via CLI

-- ============================================================
-- 1. BYPASS FK RESTRICTIONS FOR SEED PROFILES
-- ============================================================
SET session_replication_role = 'replica';

INSERT INTO public.profiles (id, full_name, role) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Carlos López', 'teacher'),
  ('00000000-0000-0000-0000-000000000002', 'Ana Martínez', 'teacher');

SET session_replication_role = 'origin';

-- ============================================================
-- 2. COURSES (8)
-- ============================================================
INSERT INTO public.courses (id, title, slug, description, short_description, instructor_id, category, level, duration, price, is_free, image_url, status, featured, free_preview_lessons, what_you_learn, requirements, target_audience) VALUES

('c0000000-0001-0000-0000-000000000001',
 'Introducción al Desarrollo Web',
 'introduccion-al-desarrollo-web',
 'Aprende los fundamentos del desarrollo web desde cero. HTML5, CSS3, JavaScript y herramientas modernas para construir tu primera aplicación web profesional. Este curso te guiará paso a paso desde los conceptos más básicos hasta crear un sitio web completo y funcional.',
 'Domina HTML, CSS y JavaScript desde cero y construye tu primera web.',
 '00000000-0000-0000-0000-000000000001',
 'Desarrollo', 'Principiante', '20h', 0, true,
 'https://picsum.photos/id/1/640/360',
 'published', true, 2,
 '["Construir páginas web con HTML5 y CSS3", "Programar con JavaScript moderno", "Usar herramientas de desarrollo profesional", "Publicar tu sitio web en producción"]',
 '["No se requiere experiencia previa", "Una computadora con conexión a internet", "Ganas de aprender"]',
 '["Principiantes en programación", "Profesionales que quieren cambiar de carrera", "Estudiantes de tecnología"]'),

('c0000000-0002-0000-0000-000000000002',
 'JavaScript Avanzado',
 'javascript-avanzado',
 'Lleva tus habilidades de JavaScript al siguiente nivel. Closures, promesas, async/await, patrones de diseño, testing y optimización. Un curso intensivo para desarrolladores que ya conocen lo básico y quieren dominar el lenguaje.',
 'Domina closures, promesas, async/await y patrones avanzados.',
 '00000000-0000-0000-0000-000000000001',
 'Desarrollo', 'Intermedio', '30h', 49.99, false,
 'https://picsum.photos/id/10/640/360',
 'published', true, 1,
 '["Dominar closures y scope avanzado", "Programación asíncrona con promesas y async/await", "Patrones de diseño en JavaScript", "Testing y debugging profesional"]',
 '["Conocimientos básicos de JavaScript", "Experiencia con HTML y CSS", "Familiaridad con la terminal"]',
 '["Desarrolladores frontend con 6+ meses de experiencia", "Profesionales que quieren profundizar en JS", "Estudiantes de bootcamp"]'),

('c0000000-0003-0000-0000-000000000003',
 'React & Modern Frontend',
 'react-modern-frontend',
 'Construye aplicaciones web modernas con React 19, hooks, Context API, React Router, y herramientas del ecosistema actual. Proyectos prácticos y mejores prácticas de la industria.',
 'Aprende React 19 con hooks, rutas y proyectos reales.',
 '00000000-0000-0000-0000-000000000002',
 'Desarrollo', 'Avanzado', '40h', 79.99, false,
 'https://picsum.photos/id/20/640/360',
 'published', true, 1,
 '["Crear componentes con React y hooks", "Manejo de estado global con Context API", "Enrutamiento con React Router", "Despliegue y optimización de producción"]',
 '["JavaScript intermedio", "Conocimientos de HTML y CSS", "Familiaridad con npm y la terminal"]',
 '["Desarrolladores frontend con experiencia", "Profesionales que migran de otros frameworks", "Estudiantes avanzados"]'),

('c0000000-0004-0000-0000-000000000004',
 'Diseño UX/UI Profesional',
 'diseno-ux-ui-profesional',
 'Aprende diseño de experiencia de usuario e interfaces desde la investigación hasta el prototipo final. Figma, design systems, testing con usuarios y portfolio profesional.',
 'Domina Figma, design systems y creación de interfaces profesionales.',
 '00000000-0000-0000-0000-000000000002',
 'Diseño', 'Principiante', '15h', 39.99, false,
 'https://picsum.photos/id/30/640/360',
 'published', false, 2,
 '["Investigar y entender las necesidades del usuario", "Crear wireframes y prototipos en Figma", "Aplicar principios de diseño visual", "Construir un portfolio profesional"]',
 '["No se requiere experiencia en diseño", "Una computadora con Figma instalado", "Interés por el diseño digital"]',
 '["Principiantes en diseño UX/UI", "Desarrolladores que quieren mejorar su ojo de diseño", "Profesionales de marketing"]'),

('c0000000-0005-0000-0000-000000000005',
 'Backend con Node.js',
 'backend-con-nodejs',
 'Construye APIs robustas y escalables con Node.js, Express, bases de datos SQL y NoSQL, autenticación, despliegue y mejores prácticas de seguridad.',
 'Crea APIs escalables con Node.js, Express y bases de datos.',
 '00000000-0000-0000-0000-000000000001',
 'Desarrollo', 'Intermedio', '35h', 59.99, false,
 'https://picsum.photos/id/40/640/360',
 'published', false, 1,
 '["Crear APIs RESTful con Express", "Conectar bases de datos SQL y NoSQL", "Implementar autenticación y autorización", "Desplegar en producción"]',
 '["JavaScript básico", "Conceptos de programación", "Familiaridad con terminal"]',
 '["Desarrolladores frontend que quieren pasarse al backend", "Estudiantes de programación con bases sólidas"]'),

('c0000000-0006-0000-0000-000000000006',
 'Data Science Fundamentals',
 'data-science-fundamentals',
 'Introducción al mundo de la ciencia de datos. Python, pandas, visualización, estadística básica y machine learning introductorio. Sin matemáticas avanzadas.',
 'Python, pandas y visualización de datos para principiantes.',
 '00000000-0000-0000-0000-000000000002',
 'Inteligencia Artificial', 'Principiante', '25h', 0, true,
 'https://picsum.photos/id/50/640/360',
 'published', false, 2,
 '["Programar en Python para análisis de datos", "Manipular datos con pandas", "Crear visualizaciones efectivas", "Entender conceptos básicos de ML"]',
 '["No se requiere experiencia en datos", "Lógica de programación básica", "Una computadora con Python instalado"]',
 '["Profesionales que quieren incursionar en datos", "Estudiantes de carreras técnicas", "Analistas que usan Excel y quieren avanzar"]'),

('c0000000-0007-0000-0000-000000000007',
 'Vue.js para Aplicaciones Web',
 'vuejs-para-aplicaciones-web',
 'Aprende Vue.js 3 desde cero: Composition API, Pinia, Vue Router, testing y despliegue. Ideal para quienes buscan un framework progresivo y flexible.',
 'Crea aplicaciones dinámicas con Vue 3 y Composition API.',
 '00000000-0000-0000-0000-000000000002',
 'Desarrollo', 'Intermedio', '28h', 44.99, false,
 'https://picsum.photos/id/60/640/360',
 'published', false, 1,
 '["Componentes con Composition API", "Estado global con Pinia", "Enrutamiento con Vue Router", "Testing y optimización"]',
 '["JavaScript intermedio", "HTML y CSS", "Conceptos de SPA"]',
 '["Desarrolladores frontend", "Profesionales que exploran alternativas a React"]'),

('c0000000-0008-0000-0000-000000000008',
 'Arquitectura de Microservicios',
 'arquitectura-de-microservicios',
 'Diseña y construye sistemas escalables con microservicios. Docker, Kubernetes, mensajería asíncrona, API Gateway, monitoreo y patrones de resiliencia.',
 'Diseña sistemas escalables con Docker, Kubernetes y patrones cloud.',
 '00000000-0000-0000-0000-000000000001',
 'Desarrollo', 'Avanzado', '45h', 69.99, false,
 'https://picsum.photos/id/70/640/360',
 'published', false, 1,
 '["Diseñar arquitecturas de microservicios", "Containerizar con Docker y orquestar con Kubernetes", "Implementar mensajería asíncrona", "Monitoreo y resiliencia"]',
 '["Experiencia con Node.js o Python", "Bases de datos SQL y NoSQL", "Conceptos de APIs REST"]',
 '["Desarrolladores senior", "Arquitectos de software", "Tech leads"]');

-- ============================================================
-- 3. MODULES (28)
-- ============================================================
INSERT INTO public.modules (id, course_id, title, description, sort_order) VALUES
-- Course 1: Desarrollo Web (4)
('a0000001-0000-0000-0000-000000000001', 'c0000000-0001-0000-0000-000000000001', 'Fundamentos de HTML', 'Aprende la estructura básica de las páginas web', 1),
('a0000001-0000-0000-0000-000000000002', 'c0000000-0001-0000-0000-000000000001', 'CSS y Estilos Modernos', 'Dale estilo y personalidad a tus sitios', 2),
('a0000001-0000-0000-0000-000000000003', 'c0000000-0001-0000-0000-000000000001', 'JavaScript Interactivo', 'Agrega comportamiento y dinamismo', 3),
('a0000001-0000-0000-0000-000000000004', 'c0000000-0001-0000-0000-000000000001', 'Proyecto Final', 'Construye tu primer sitio web completo', 4),
-- Course 2: JS Avanzado (3)
('a0000002-0000-0000-0000-000000000001', 'c0000000-0002-0000-0000-000000000002', 'Fundamentos Avanzados', 'Closures, hoisting y el event loop profundo', 1),
('a0000002-0000-0000-0000-000000000002', 'c0000000-0002-0000-0000-000000000002', 'Programación Asíncrona', 'Promesas, async/await y streams', 2),
('a0000002-0000-0000-0000-000000000003', 'c0000000-0002-0000-0000-000000000002', 'Patrones y Testing', 'Patrones de diseño y testing profesional', 3),
-- Course 3: React (3)
('a0000003-0000-0000-0000-000000000001', 'c0000000-0003-0000-0000-000000000003', 'Componentes y Hooks', 'La base de React moderna', 1),
('a0000003-0000-0000-0000-000000000002', 'c0000000-0003-0000-0000-000000000003', 'Estado y Routing', 'Manejo de estado y navegación', 2),
('a0000003-0000-0000-0000-000000000003', 'c0000000-0003-0000-0000-000000000003', 'Proyecto Final: Dashboard', 'Construye un dashboard completo', 3),
-- Course 4: Diseño UX/UI (4)
('a0000004-0000-0000-0000-000000000001', 'c0000000-0004-0000-0000-000000000004', 'Fundamentos de UX', 'Investigación y arquitectura de información', 1),
('a0000004-0000-0000-0000-000000000002', 'c0000000-0004-0000-0000-000000000004', 'Diseño en Figma', 'De wireframes a prototipos interactivos', 2),
('a0000004-0000-0000-0000-000000000003', 'c0000000-0004-0000-0000-000000000004', 'Design Systems', 'Crea sistemas de diseño consistentes', 3),
('a0000004-0000-0000-0000-000000000004', 'c0000000-0004-0000-0000-000000000004', 'Portfolio y Testing', 'Testing con usuarios y portfolio listo', 4),
-- Course 5: Backend Node.js (3)
('a0000005-0000-0000-0000-000000000001', 'c0000000-0005-0000-0000-000000000005', 'Node.js y Express', 'Fundamentos del backend con Node', 1),
('a0000005-0000-0000-0000-000000000002', 'c0000000-0005-0000-0000-000000000005', 'Bases de Datos', 'SQL y NoSQL práctico', 2),
('a0000005-0000-0000-0000-000000000003', 'c0000000-0005-0000-0000-000000000005', 'API REST Completa', 'Autenticación, seguridad y despliegue', 3),
-- Course 6: Data Science (3)
('a0000006-0000-0000-0000-000000000001', 'c0000000-0006-0000-0000-000000000006', 'Python para Datos', 'Introducción a Python y pandas', 1),
('a0000006-0000-0000-0000-000000000002', 'c0000000-0006-0000-0000-000000000006', 'Visualización', 'Gráficos con matplotlib y seaborn', 2),
('a0000006-0000-0000-0000-000000000003', 'c0000000-0006-0000-0000-000000000006', 'ML Introductorio', 'Machine learning para principiantes', 3),
-- Course 7: Vue.js (3)
('a0000007-0000-0000-0000-000000000001', 'c0000000-0007-0000-0000-000000000007', 'Vue 3 Fundamentals', 'Composition API y componentes', 1),
('a0000007-0000-0000-0000-000000000002', 'c0000000-0007-0000-0000-000000000007', 'Estado y Enrutamiento', 'Pinia y Vue Router en profundidad', 2),
('a0000007-0000-0000-0000-000000000003', 'c0000000-0007-0000-0000-000000000007', 'App Completa', 'CRUD completo con Vue', 3),
-- Course 8: Microservicios (4)
('a0000008-0000-0000-0000-000000000001', 'c0000000-0008-0000-0000-000000000008', 'Fundamentos de Microservicios', 'Conceptos y patrones arquitectónicos', 1),
('a0000008-0000-0000-0000-000000000002', 'c0000000-0008-0000-0000-000000000008', 'Docker y Kubernetes', 'Containerización y orquestación', 2),
('a0000008-0000-0000-0000-000000000003', 'c0000000-0008-0000-0000-000000000008', 'Comunicación y Mensajería', 'Mensajería asíncrona y API Gateway', 3),
('a0000008-0000-0000-0000-000000000004', 'c0000000-0008-0000-0000-000000000008', 'Monitoreo y Resiliencia', 'Observabilidad, tolerancia a fallos', 4);

-- ============================================================
-- 4. LESSONS (65 with video_urls)
-- ============================================================
-- Course 1, Module 1: HTML (3 lessons, first 2 = free preview)
INSERT INTO public.lessons (id, module_id, title, content, video_url, duration, sort_order, status) VALUES
('b0000101-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', '¿Qué es HTML? Estructura básica', '<h3>¿Qué es HTML?</h3><p>HTML (HyperText Markup Language) es el lenguaje estándar para crear páginas web. Describe la estructura de una página web mediante etiquetas.</p><h3>Estructura básica</h3><p>Todo documento HTML comienza con <code>&lt;!DOCTYPE html&gt;</code> seguido de <code>&lt;html&gt;</code>, <code>&lt;head&gt;</code> y <code>&lt;body&gt;</code>.</p>', 'https://www.youtube.com/embed/7_QoiKkLZdI', '15 min', 1, 'published'),
('b0000102-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Etiquetas HTML esenciales', '<h3>Etiquetas comunes</h3><ul><li><code>&lt;h1&gt;</code> a <code>&lt;h6&gt;</code> - Encabezados</li><li><code>&lt;p&gt;</code> - Párrafos</li><li><code>&lt;a&gt;</code> - Enlaces</li><li><code>&lt;img&gt;</code> - Imágenes</li><li><code>&lt;div&gt;</code> - Divisiones</li></ul>', 'https://www.youtube.com/embed/TBdBLNMPas4', '20 min', 2, 'published'),
('b0000103-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000001', 'Formularios y multimedia', '<h3>Formularios HTML</h3><p>Los formularios permiten recolectar datos del usuario con <code>&lt;form&gt;</code>, <code>&lt;input&gt;</code>, <code>&lt;select&gt;</code> y <code>&lt;textarea&gt;</code>.</p>', 'https://www.youtube.com/embed/74ZAUdBlStw', '18 min', 3, 'published'),
-- Course 1, Module 2: CSS (2 lessons)
('b0000104-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'Selectores CSS y modelo de caja', '<h3>Selectores</h3><p>CSS usa selectores para aplicar estilos: por etiqueta, clase, ID, atributo.</p><h3>Modelo de caja</h3><p>Cada elemento es una caja con margin, border, padding y content.</p>', 'https://www.youtube.com/embed/6CtpH1LvG_c', '22 min', 1, 'published'),
('b0000105-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000002', 'Flexbox, Grid y responsive', '<h3>Flexbox</h3><p>Distribuye elementos en una dimensión. Ideal para navbars y layouts simples.</p><h3>Grid</h3><p>Distribuye en dos dimensiones. Perfecto para layouts complejos.</p>', 'https://www.youtube.com/embed/wqKtzZwIR8M', '25 min', 2, 'published'),
-- Course 1, Module 3: JS (2 lessons)
('b0000106-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'Variables, funciones y DOM', '<h3>JavaScript básico</h3><p>Variables, tipos de datos, funciones y manipulación del DOM.</p>', 'https://www.youtube.com/embed/sriVQMM3oCU', '20 min', 1, 'published'),
('b0000107-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000003', 'Eventos y manipulación dinámica', '<h3>Eventos</h3><p>Click, submit, hover y cómo responder a acciones del usuario.</p>', 'https://www.youtube.com/embed/74ZAUdBlStw', '18 min', 2, 'published'),
-- Course 1, Module 4: Project (2 lessons)
('b0000108-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000004', 'Planificación del proyecto', '<h3>Planifica tu sitio</h3><p>Define estructura, paleta de colores y contenido de tu web final.</p>', 'https://www.youtube.com/embed/7_QoiKkLZdI', '10 min', 1, 'published'),
('b0000109-0000-0000-0000-000000000001', 'a0000001-0000-0000-0000-000000000004', 'Construcción y despliegue', '<h3>Build y deploy</h3><p>Construye y publica usando GitHub Pages o Netlify.</p>', 'https://www.youtube.com/embed/74ZAUdBlStw', '15 min', 2, 'published'),

-- Course 2: JS Avanzado (6 lessons)
('b0000201-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000001', 'Closures y el Event Loop', '<h3>Closures</h3><p>Funciones que recuerdan su entorno de creación.</p><h3>Event Loop</h3><p>Call stack, task queue y microtasks.</p>', 'https://www.youtube.com/embed/TBdBLNMPas4', '25 min', 1, 'published'),
('b0000202-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000001', 'Hoisting y Scope', '<h3>Hoisting</h3><p>Cómo JavaScript mueve declaraciones al inicio del scope.</p>', 'https://www.youtube.com/embed/74ZAUdBlStw', '20 min', 2, 'published'),
('b0000203-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002', 'Promesas en profundidad', '<h3>Promesas</h3><p>Maneja operaciones asíncronas de forma elegante.</p>', 'https://www.youtube.com/embed/wqKtzZwIR8M', '30 min', 1, 'published'),
('b0000204-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000002', 'Async/Await y Streams', '<h3>Async/Await</h3><p>Azúcar sintáctica para promesas. Código secuencial, ejecución asíncrona.</p>', 'https://www.youtube.com/embed/wqKtzZwIR8M', '28 min', 2, 'published'),
('b0000205-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000003', 'Patrones de diseño en JS', '<h3>Patrones</h3><p>Module pattern, observer, singleton, factory en JavaScript.</p>', 'https://www.youtube.com/embed/TBdBLNMPas4', '25 min', 1, 'published'),
('b0000206-0000-0000-0000-000000000001', 'a0000002-0000-0000-0000-000000000003', 'Testing con Jest', '<h3>Testing</h3><p>Unit tests, mocks, spies y cobertura de código con Jest.</p>', 'https://www.youtube.com/embed/sriVQMM3oCU', '22 min', 2, 'published'),

-- Course 3: React (6 lessons)
('b0000301-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000001', 'Componentes y JSX', '<h3>Componentes funcionales</h3><p>Los bloques de React. JSX, props y composición.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '20 min', 1, 'published'),
('b0000302-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000001', 'useState y useEffect', '<h3>Hooks fundamentales</h3><p>Estado local con useState, efectos con useEffect.</p>', 'https://www.youtube.com/embed/TBdBLNMPas4', '25 min', 2, 'published'),
('b0000303-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000002', 'Context API y estado global', '<h3>Context</h3><p>Comparte estado entre componentes sin prop drilling.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '22 min', 1, 'published'),
('b0000304-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000002', 'React Router v7', '<h3>Routing</h3><p>Navegación, rutas anidadas, loaders y actions.</p>', 'https://www.youtube.com/embed/TBdBLNMPas4', '20 min', 2, 'published'),
('b0000305-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000003', 'Dashboard: UI y componentes', '<h3>Dashboard UI</h3><p>Construye la interfaz del dashboard con componentes reutilizables.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '30 min', 1, 'published'),
('b0000306-0000-0000-0000-000000000001', 'a0000003-0000-0000-0000-000000000003', 'Dashboard: datos y gráficos', '<h3>Datos dinámicos</h3><p>Conecta el dashboard a datos reales con gráficos interactivos.</p>', 'https://www.youtube.com/embed/TBdBLNMPas4', '25 min', 2, 'published'),

-- Course 4: Diseño UX/UI (8 lessons)
('b0000401-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000001', 'Investigación de usuarios', '<h3>Research</h3><p>Entrevistas, encuestas y cómo entender a tu usuario.</p>', 'https://www.youtube.com/embed/sriVQMM3oCU', '20 min', 1, 'published'),
('b0000402-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000001', 'Arquitectura de información', '<h3>IA</h3><p>Organiza el contenido de forma que los usuarios encuentren lo que buscan.</p>', 'https://www.youtube.com/embed/sriVQMM3oCU', '18 min', 2, 'published'),
('b0000403-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000002', 'Wireframes en Figma', '<h3>Wireframing</h3><p>Bocetos de baja fidelidad para validar estructura antes del diseño.</p>', 'https://www.youtube.com/embed/sriVQMM3oCU', '25 min', 1, 'published'),
('b0000404-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000002', 'Prototipos interactivos', '<h3>Prototyping</h3><p>Convierte wireframes en prototipos cliqueables en Figma.</p>', 'https://www.youtube.com/embed/sriVQMM3oCU', '22 min', 2, 'published'),
('b0000405-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000003', 'Principios de Design System', '<h3>Design System</h3><p>Colores, tipografía, espaciado y componentes consistentes.</p>', 'https://www.youtube.com/embed/sriVQMM3oCU', '20 min', 1, 'published'),
('b0000406-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000003', 'Componentes y variantes', '<h3>Componentes atómicos</h3><p>Crea botones, inputs, cards y modales reutilizables.</p>', 'https://www.youtube.com/embed/sriVQMM3oCU', '25 min', 2, 'published'),
('b0000407-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000004', 'Testing con usuarios', '<h3>User testing</h3><p>Cómo hacer testing remoto y presencial con usuarios reales.</p>', 'https://www.youtube.com/embed/sriVQMM3oCU', '15 min', 1, 'published'),
('b0000408-0000-0000-0000-000000000001', 'a0000004-0000-0000-0000-000000000004', 'Portfolio profesional', '<h3>Portfolio</h3><p>Selecciona tus mejores trabajos y preséntalos como un profesional.</p>', 'https://www.youtube.com/embed/sriVQMM3oCU', '12 min', 2, 'published'),

-- Course 5: Backend Node.js (6 lessons)
('b0000501-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000001', 'Node.js runtime', '<h3>Node.js</h3><p>Runtime de JavaScript del lado del servidor. Módulos, npm y package.json.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '20 min', 1, 'published'),
('b0000502-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000001', 'Express: rutas y middleware', '<h3>Express</h3><p>Framework web minimalista. Rutas, middleware, request/response cycle.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '25 min', 2, 'published'),
('b0000503-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000002', 'PostgreSQL con Node', '<h3>SQL</h3><p>Conecta PostgreSQL, models, migraciones y queries con Node.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '30 min', 1, 'published'),
('b0000504-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000002', 'MongoDB y NoSQL', '<h3>NoSQL</h3><p>Documentos, esquemas flexibles y Mongoose para MongoDB.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '25 min', 2, 'published'),
('b0000505-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000003', 'JWT y autenticación', '<h3>Auth</h3><p>Tokens JWT, registro, login, protección de rutas y roles.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '28 min', 1, 'published'),
('b0000506-0000-0000-0000-000000000001', 'a0000005-0000-0000-0000-000000000003', 'Despliegue en producción', '<h3>Deploy</h3><p>Variables de entorno, PM2, Nginx, CI/CD básico.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '20 min', 2, 'published'),

-- Course 6: Data Science (6 lessons)
('b0000601-0000-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000001', 'Python básico para datos', '<h3>Python</h3><p>Variables, listas, diccionarios, numpy y por qué Python para datos.</p>', 'https://www.youtube.com/embed/6CtpH1LvG_c', '20 min', 1, 'published'),
('b0000602-0000-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000001', 'Pandas: manipulación de datos', '<h3>Pandas</h3><p>DataFrames, filtros, groupby, merge y limpieza de datos.</p>', 'https://www.youtube.com/embed/6CtpH1LvG_c', '30 min', 2, 'published'),
('b0000603-0000-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000002', 'Matplotlib y Seaborn', '<h3>Visualización</h3><p>Gráficos de línea, barra, dispersión, heatmaps y estilos.</p>', 'https://www.youtube.com/embed/6CtpH1LvG_c', '25 min', 1, 'published'),
('b0000604-0000-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000002', 'Dashboard de datos', '<h3>Dashboard</h3><p>Combina múltiples visualizaciones en un dashboard informativo.</p>', 'https://www.youtube.com/embed/6CtpH1LvG_c', '20 min', 2, 'published'),
('b0000605-0000-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000003', 'ML: regresión y clasificación', '<h3>Machine Learning</h3><p>Regresión lineal, logística, árboles de decisión, overfitting.</p>', 'https://www.youtube.com/embed/6CtpH1LvG_c', '30 min', 1, 'published'),
('b0000606-0000-0000-0000-000000000001', 'a0000006-0000-0000-0000-000000000003', 'Proyecto final de datos', '<h3>Proyecto</h3><p>Pipeline completo: carga, limpieza, análisis y visualización.</p>', 'https://www.youtube.com/embed/6CtpH1LvG_c', '25 min', 2, 'published'),

-- Course 7: Vue.js (6 lessons)
('b0000701-0000-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000001', 'Vue 3 Composition API', '<h3>Composition API</h3><p>ref, reactive, computed, watch y la nueva forma de escribir Vue.</p>', 'https://www.youtube.com/embed/TBdBLNMPas4', '22 min', 1, 'published'),
('b0000702-0000-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000001', 'Componentes y props', '<h3>Componentes</h3><p>Props, emits, slots y comunicación entre componentes.</p>', 'https://www.youtube.com/embed/TBdBLNMPas4', '20 min', 2, 'published'),
('b0000703-0000-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000002', 'Pinia: estado global', '<h3>Pinia</h3><p>Store, actions, getters y persistencia de estado.</p>', 'https://www.youtube.com/embed/TBdBLNMPas4', '25 min', 1, 'published'),
('b0000704-0000-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000002', 'Vue Router avanzado', '<h3>Router</h3><p>Rutas dinámicas, guards, lazy loading y navegación.</p>', 'https://www.youtube.com/embed/TBdBLNMPas4', '20 min', 2, 'published'),
('b0000705-0000-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000003', 'CRUD con Vue y API', '<h3>CRUD</h3><p>Consume una API REST, maneja estados de carga y error.</p>', 'https://www.youtube.com/embed/TBdBLNMPas4', '28 min', 1, 'published'),
('b0000706-0000-0000-0000-000000000001', 'a0000007-0000-0000-0000-000000000003', 'Testing y deploy de Vue', '<h3>Testing</h3><p>Vitest, Vue Test Utils y despliegue a producción.</p>', 'https://www.youtube.com/embed/TBdBLNMPas4', '20 min', 2, 'published'),

-- Course 8: Microservicios (8 lessons)
('b0000801-0000-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000001', '¿Qué son los microservicios?', '<h3>Conceptos</h3><p>Monolitos vs microservicios, bounded contexts, ventajas y costos.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '20 min', 1, 'published'),
('b0000802-0000-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000001', 'Patrones de comunicación', '<h3>Comunicación</h3><p>Síncrona vs asíncrona, REST, gRPC, eventos.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '22 min', 2, 'published'),
('b0000803-0000-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000002', 'Docker: contenedores prácticos', '<h3>Docker</h3><p>Images, containers, docker-compose y multi-stage builds.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '30 min', 1, 'published'),
('b0000804-0000-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000002', 'Kubernetes esencial', '<h3>K8s</h3><p>Pods, deployments, services, ingress y configuración.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '35 min', 2, 'published'),
('b0000805-0000-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000003', 'Mensajería con RabbitMQ', '<h3>Message Queue</h3><p>Productores, consumidores, exchanges y colas.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '25 min', 1, 'published'),
('b0000806-0000-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000003', 'API Gateway', '<h3>Gateway</h3><p>Rate limiting, autenticación centralizada, routing.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '22 min', 2, 'published'),
('b0000807-0000-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000004', 'Monitoreo y logging', '<h3>Observabilidad</h3><p>Prometheus, Grafana, ELK stack, tracing distribuido.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '25 min', 1, 'published'),
('b0000808-0000-0000-0000-000000000001', 'a0000008-0000-0000-0000-000000000004', 'Resiliencia y tolerancia a fallos', '<h3>Resiliencia</h3><p>Circuit breaker, retry, timeout, bulkhead, health checks.</p>', 'https://www.youtube.com/embed/yYZhocg1BWQ', '20 min', 2, 'published');

-- ============================================================
-- 5. ENROLLMENTS (for popular section — varied counts)
-- ============================================================
INSERT INTO public.enrollments (student_id, course_id, status) VALUES
  -- Course 1 (desarrollo web): 5 enrollments (most popular)
  ('00000000-0000-0000-0000-000000000001', 'c0000000-0001-0000-0000-000000000001', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'c0000000-0001-0000-0000-000000000001', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'c0000000-0002-0000-0000-000000000002', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'c0000000-0003-0000-0000-000000000003', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'c0000000-0006-0000-0000-000000000006', 'active'),
  ('00000000-0000-0000-0000-000000000002', 'c0000000-0006-0000-0000-000000000006', 'active');

-- ============================================================
-- 6. PROGRESS (for top-rated section)
-- ============================================================
INSERT INTO public.progress (student_id, lesson_id, completed, completed_at) VALUES
  ('00000000-0000-0000-0000-000000000001', 'b0000101-0000-0000-0000-000000000001', true, now() - interval '7 days'),
  ('00000000-0000-0000-0000-000000000001', 'b0000102-0000-0000-0000-000000000001', true, now() - interval '6 days'),
  ('00000000-0000-0000-0000-000000000001', 'b0000103-0000-0000-0000-000000000001', true, now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000001', 'b0000104-0000-0000-0000-000000000001', true, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000001', 'b0000105-0000-0000-0000-000000000001', true, now() - interval '3 days'),
  ('00000000-0000-0000-0000-000000000002', 'b0000301-0000-0000-0000-000000000001', true, now() - interval '5 days'),
  ('00000000-0000-0000-0000-000000000002', 'b0000302-0000-0000-0000-000000000001', true, now() - interval '4 days'),
  ('00000000-0000-0000-0000-000000000002', 'b0000303-0000-0000-0000-000000000001', true, now() - interval '3 days');
