# App / Implementación — Resolución Causa Raíz de Cursos de Academy

Módulo: src/pages/4-academy/2-qawaylab-app-academy-real  
Rama: main-web · Repo: 1-qawaylab-web  
Fecha: 2026-09-14  

---

## 1. Problema Detectado
En la vista del catálogo de Academy (/academy/app/cursos), la pantalla mostraba el mensaje de error:
> "No pudimos cargar el catálogo. La consulta de cursos falló. Revisa seed, datos o policies antes de seguir afinando la interfaz."

## 2. Diagnóstico de Causa Raíz (Cero Parches)
- La base de datos de Academy (https://jkstekoaiwdjpivkrsil.supabase.co) contiene 15 cursos reales publicados.
- En src/pages/4-academy/2-qawaylab-app-academy-real/src/lib/supabase.ts, el cliente de Supabase resolvía las variables genéricas import.meta.env.VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY.
- En el .env del host principal, esas variables apuntan a la base de datos central de Qaway (https://qrusdsqgygfolxfrafyd.supabase.co), en la cual no existe la tabla courses.
- Por tanto, la consulta arrojaba un error 404 de tabla inexistente y activaba la pantalla de fallo.

## 3. Solución Estructural Aplicada
1. Aislamiento de Variables de Entorno en supabase.ts:
   Se configuró el cliente para priorizar estrictamente las variables de su entorno dedicadas:
   - import.meta.env.VITE_ACADEMY_SUPABASE_URL
   - import.meta.env.VITE_ACADEMY_SUPABASE_ANON_KEY
   Con fallback explícito a sus endpoints oficiales de Academy.
2. Consulta Limpia a Supabase:
   En src/lib/services/courses.ts, la función getCourses() ejecuta la consulta limpia y directa contra la tabla courses de Supabase sin datos hardcodeados ni parches provisionales.

## 4. Validación
- Conexión exitosa verificada contra la API de Supabase en vivo (15 cursos cargados).
- npm run build ejecutado exitosamente con 0 errores.
- Candado Visual 100% respetado: cero modificaciones en componentes visuales, CSS o responsive.

---

## 5. Iteración 2 — Alineación Estructural de Márgenes y Moneda en Soles (S/)
- **Problema Detectado:**
  1. La vista `/academy/app/cursos` se presentaba desbordada de extremo a extremo de la pantalla (sin margen responsivo armónico con el Navbar) y el encabezado quedaba ocluido bajo la barra de navegación fija.
  2. Los precios de las tarjetas y vista de detalle se mostraban en dólares (`$79.99`, `$69.99`) en lugar del estándar en soles peruanos de la plataforma (`S/`).
- **Causa Raíz:**
  1. La clase `.page-container` utilizada por las vistas de Academy no estaba declarada en los estilos integrados del host (`src/index.css`), dejándola sin `max-width`, centrado (`mx-auto`) ni paddings laterales.
  2. La función `formatPrice` anteponía explícitamente el caracter `$`.
- **Solución Estructural Aplicada:**
  1. **Contenedor Alineado con el Ecosistema:** Se integró en `src/index.css` el scope `.academy-app-root .page-container` con `max-w-[96rem] mx-auto` y padding responsivo idéntico al Navbar (`px-6 sm:px-10 lg:px-14`), garantizando alineación pixel-perfect con el logo y el botón CTA del sitio global.
  2. **Despeje de Navbar Fijo:** Se ajustó el espaciado superior a `pt-28 sm:pt-32` para que el título "Catálogo de Cursos" se sitúe con holgura ergonómica bajo el Navbar fijo (80px).
  3. **Normalización Monetaria:** Se actualizó `formatPrice` en `Courses.tsx` y `CourseDetail.tsx` para formatear de forma limpia y consistente en Soles (`S/ ${precio}`).

---

## 6. Iteración 3 — Corrección de Enlace "Ver contenido" (Resolución 404)
- **Problema Detectado:**
  Al hacer clic en "Ver contenido" en cualquiera de las tarjetas de curso (`WebStyleCourseCard`), el navegador era redirigido a una página 404 (Not Found).
- **Causa Raíz:**
  El componente `Courses.tsx` generaba el enlace con la ruta `/cursos/${course.slug}`. Al estar la aplicación de Academy montada en el host bajo el prefijo `/academy/app/*`, la ruta real configurada en `AcademyAppPage.jsx` es `/academy/app/cursos/:slug`.
- **Solución Estructural Aplicada:**
  Se actualizó el prop `to` del enlace `Ver contenido` en `Courses.tsx` y `Resources.tsx` para apuntar a `/academy/app/cursos/${course.slug}`.
- **Validación:**
  Ruta verificada contra `AcademyAppPage.jsx` (`Route path="cursos/:slug"`) y compilación TypeScript exitosa.

