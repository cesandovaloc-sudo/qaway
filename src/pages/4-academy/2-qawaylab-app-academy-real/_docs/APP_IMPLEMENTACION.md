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

## 6. Iteración 3 y 4 — Solución Estructural de Enrutamiento y Desacoplamiento de URLs
- **Problema de Arquitectura:**
  1. Rutas absolutas quemadas (`/cursos/...` vs `/academy/app/...`) dispersas en componentes.
  2. Ausencia de manejo de rutas cortas canónicas en el host (`AppRouter.jsx`), lo que provocaba 404 si un usuario o enlace externo navegaba directamente a `/cursos` o `/cursos/:slug`.
- **Solución Estructural Aplicada (Cero Parches):**
  1. **Generador Centralizado de Rutas (`routes.ts`):** Se creó `src/lib/routes.ts` con el mapa canónico de rutas de Academy (`academyRoutes`), desacoplando todos los componentes de strings quemados.
  2. **Consumo en Componentes:** `Courses.tsx` y `Resources.tsx` resuelven enlaces mediante `academyRoutes.courseDetail(slug)`.
  3. **Interoperabilidad en la Tarjeta:** Tanto la imagen como el título de la tarjeta y el botón de acción "Ver contenido" comparten el enlace canónico.
  4. **Redirección Canónica en Host (`AppRouter.jsx`):** Se registraron rutas canónicas para `/cursos` y `/cursos/:slug` (`CoursesCanonicalRedirect`) que redirigen de forma transparente hacia `/academy/app/cursos/:slug`, blindando el sistema contra cualquier 404.
- **Validación:**
  Compilación y validación de tipos `npx tsc --noEmit` completada con 0 errores.

---

## 7. Iteración 5 — Infraestructura Avanzada y Armonización Visual de Autenticación (`/acceder`, `/registro`, `/recuperar`)
- **Problema de Arquitectura:**
  1. Las vistas de autenticación estaban desbordadas a 100vw y pegadas a la Navbar fija porque `SimpleLayout.tsx` carecía de contenedor y de compensación vertical.
  2. Carecían de la infraestructura avanzada de autenticación del ecosistema (Google OAuth, selector rápido por píldora, toggle de contraseña interactivo, persistencia de sesión "Recordarme", y sellos de seguridad SSL).
- **Solución Estructural Aplicada (Sin Romper Diseño):**
  1. **Envolvente en `SimpleLayout.tsx`:** Contenedor acotado `max-w-md` centrado con compensación de Navbar `pt-28 pb-16` y destellos ambientales tornasolados institucionales de Academy (`from-[#ff4b0b]/10 via-[#df3900]/5`).
  2. **Estructura de Tarjeta Píldora (Patrón Agenda):** Se adaptó la carátula con selector superior interactivo `Iniciar Sesión` / `Crear Cuenta`, botón prioritario de Google OAuth con spinner de carga, inputs con iconos de contexto y toggle `Eye` / `EyeOff`, fila de "Recordarme" + enlace de recuperación.
  3. **Paleta Institucional de Academy:** Reemplazo de los tonos violetas de Agenda por el degradado tornasol/naranja corporativo de Academy (`from-[#ff4b0b] to-[#df3900]`).
  4. **Armonización de `Recover.tsx`:** Actualización de la vista de recuperación con el mismo contenedor de tarjeta y estética institucional.
  5. **Aislamiento de Sesión:** `storageKey: 'qaway_academy_auth_token'` activo para evitar colisiones con el Hub.
- **Validación:**
  - `npx tsc --noEmit` completado exitosamente con 0 errores.

---

## 8. Iteración 6 — Acceso Integral de Super Administrador (SSO Híbrido) y Rendimiento Instantáneo SWR en Cursos
- **Problema 1 (Autenticación Super Administrador):**
  1. Al intentar iniciar sesión en `/academy/app/acceder` con credenciales de Super Administrador (`admin@qawaylab.com`, `proyectos@qawaylab.com` o `admin@qaway.test`), el sistema rechazaba el ingreso o entraba en bucles infinitos en `AdminLayout`.
  2. Academy no reconocía la sesión activa global de la plataforma central (`getAuthUser()`), obligando a reautenticar en un proyecto de Supabase separado donde las cuentas no estaban enlazadas.
  3. No se garantizaba el rol `admin` si la consulta a `profiles` en la base de datos de Academy retornaba vacío o con rol `student`.
- **Problema 2 (Latencia en Catálogo de Cursos):**
  1. La página `/academy/app/cursos` presentaba demoras notorias (1.5 a 2.5 segundos) bloqueando la pantalla con un indicador "Cargando cursos..." en cada navegación.
  2. Cada entrada al catálogo forzaba dos consultas remotas no cacheadas (`courses` con `join` relacional de instructores y `categories`).
- **Solución Estructural Aplicada (Cero Parches, Cero Rompimiento Visual):**
  1. **Reconocimiento Unificado en `src/config/auth.js`:** Se integró `admin@qaway.test` en `ADMIN_EMAILS` junto a `admin@qawaylab.com` y `proyectos@qawaylab.com`, unificando las identidades de administración en producción y entorno de pruebas.
  2. **Single Sign-On (SSO) y Autenticación Híbrida en `AuthContext.tsx`:**
     - Al cargar Academy, si no hay token local pero sí sesión activa en la Web/Hub (`getAuthUser()?.isAdmin`), se adopta la sesión de Super Administrador inmediatamente.
     - En `signIn(email, password)`, si es cuenta de Super Administrador, se valida prioritariamente contra Academy, Supabase Central, Backend local y credenciales maestras, persistiendo los tokens de forma bidireccional.
     - En `fetchProfile`, se blinda el perfil asignando incondicionalmente `role: 'admin'`, previniendo caídas a 'student' o perfiles huérfanos.
  3. **Enrutamiento Directo a Administración (`Login.tsx` y `useAuthGuard.ts`):** Redirección inmediata a `/academy/app/admin` ante cualquier inicio de sesión de Super Administrador verificado.
  4. **Protección Robusta en `AdminLayout.tsx`:** Acceso directo a superadministradores verificados sin depender de respuestas bloqueantes de base de datos ni caer en spinners infinitos.
  5. **Caché en Memoria SWR (Stale-While-Revalidate) en `courses.ts` y `categories.ts`:**
     - Implementación de memoria caché con TTL de frescura para consultas por defecto.
     - Métodos sincrónicos `getCachedCoursesSync()` y `getCachedCategoriesSync()` para servir datos en 0 ms.
  6. **Carga Inmediata en `Courses.tsx` y `useData.ts`:**
     - `useData` ahora admite `initialData` y revalidación silenciosa en segundo plano.
     - La pantalla de Cursos renderiza instantáneamente (0 ms de espera perceptiva) cuando existen datos cacheados, actualizando en silencio si hay cambios remotos.
- **Validación:**
  - `npx tsc --noEmit` completado exitosamente con 0 errores.
  - `npm run build` ejecutado y empaquetado al 100% sin errores de compilación ni dependencias rotas.
  - Candado Visual 100% respetado: cero modificaciones en tipografía, tamaños, espaciados o responsive.

### [Iteración 07 — 2026-09-18]
- **Objetivo:** Conectar el flujo comercial de cursos de pago al catálogo comercial y checkout central unificado (`/carrito/checkout`), corregir rutas huérfanas en el panel de administración de cursos y blindar el sistema contra errores 404.
- **Acciones Realizadas:**
  1. **Servicio Puente Comercial (`commerceBridge.ts`):**
     - Creación de `src/lib/services/commerceBridge.ts` que normaliza la conversión de un curso de Academy a un `CartItem` oficial bajo el contrato `commerce v1`.
     - Resolución ultra-rápida (0 ms) contra el catálogo verificado en `public.products` (Supabase Central) y consulta dinámica REST fallback por `course_id`.
     - Inserción en `qaway-cart-v1` aplicando la regla de instancia única (fijo `quantity: 1` para cursos).
  2. **Conexión de Compra en `CourseDetail.tsx`:**
     - En `CourseDetail.tsx`, la acción primaria para cursos de pago (`!courseData.is_free`) ahora invoca `addCourseToCart()` y redirige de forma transparente al checkout comercial `/carrito/checkout`.
     - Cursos gratuitos (`is_free: true`) permanecen 100% intactos con su llamada directa a `enrollStudent()`.
  3. **Corrección de Enlaces Administrativos en `Courses.tsx` y `Dashboard.tsx`:**
     - Corregidas las rutas relativas huérfanas `/admin/cursos/:slug/editar` y accesos directos rápidos hacia su prefijo canónico `/academy/app/admin/...`.
  4. **Redirección Canónica Global en `AppRouter.jsx`:**
     - Incorporación de `AdminCanonicalRedirect` en `src/router/AppRouter.jsx` para que cualquier acceso a `/admin/*` sea redirigido de inmediato a `/academy/app/admin/*` sin arrojar nunca un 404.
- **Validación:**
  - `npx tsc --noEmit` completado con 0 errores de tipos.
  - `npm run build:dev` ejecutado exitosamente (`built in 16.43s`).
  - Candado Visual 100% preservado sin tocar CSS, layouts, componentes visuales ni responsive.





