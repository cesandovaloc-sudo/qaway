# 🎓 Qaway Academy

Plataforma de aprendizaje moderna, premium y vendible. Construida como producto autónomo con React + Supabase.

## ✨ Stack

| Capa | Tecnología |
|------|-----------|
| **Frontend** | React 19 + React Router 7 + Tailwind CSS 4 |
| **Backend** | Supabase (PostgreSQL, Auth, Storage, RLS) |
| **Build** | Vite 8 |
| **Linting** | Oxlint |

## 📁 Estructura

```
src/
├── layouts/         # PublicLayout, AuthLayout, StudentLayout, TeacherLayout, AdminLayout
├── pages/           # public/, student/, teacher/, admin/ + Checkout, NotFound
├── components/      # common/ (UserMenu, GlobalSearch), teacher/, student/
├── lib/services/    # Capa de datos (courses, enrollments, lessons, payments, etc.)
├── hooks/           # useData (fetch con loading/error/empty state)
└── contexts/        # AuthContext, CourseSidebarContext, TeacherPreviewContext
```

## 🚀 Áreas funcionales

| Área | Rutas | Descripción |
|------|-------|-------------|
| **🏠 Público** | `/`, `/cursos`, `/cursos/:slug`, `/acceder`, `/registro`, `/recuperar` | Landing, catálogo, detalle de curso, autenticación |
| **🎓 Alumno** | `/panel/**` | Panel, cursos, lecciones, progreso, certificados, recursos |
| **👨‍🏫 Docente** | `/docente/**` | Dashboard, gestión de cursos, contenido, tareas, alumnos |
| **⚙️ Admin** | `/admin/**` | Dashboard, CRUD usuarios/cursos, pagos, permisos |

## 🔧 Requisitos

- Node.js 20+
- Proyecto Supabase con migraciones aplicadas (`supabase/migrations/`)

## ⚙️ Variables de entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key
```

## 📦 Comandos

```bash
npm install        # Instalar dependencias
npm run dev        # Desarrollo (localhost:5173)
npm run build      # Producción
npm run preview    # Preview del build
npm run lint       # Linting con Oxlint
```

## 🗄️ Base de datos

Las migraciones están en `supabase/migrations/`. 12 tablas principales:

- `profiles`, `courses`, `modules`, `lessons`, `resources`
- `tasks`, `submissions`, `enrollments`, `progress`, `certificates`
- `payments`, `activity_logs`

RLS habilitado en todas las tablas con policies por rol (público, alumno, docente, admin).

## 🛠️ Registro de fixes técnicos

### Fix: pantalla "Algo salió mal" al navegar de un video gratis a una lección con candado

**Síntoma:** al pasar (navegación SPA, sin recargar) desde una lección con video visible a una lección bloqueada para usuarios sin sesión, la app caía en la pantalla de error global "Algo salió mal" y no se podía volver atrás sin refrescar la página.

**Causa raíz:** error de React `NotFoundError: Failed to execute 'removeChild' on 'Node': The node to be removed is not a child of this node.` Al navegar, React desmontaba del DOM el contenedor del reproductor de YouTube (`div ref={playerHostRef}`). Como el IFrame API de YouTube ya había modificado ese mismo nodo por dentro, el `removeChild` de React fallaba y tumbaba toda la aplicación.

**Solución (patrón canónico):** el contenedor del reproductor **permanece siempre montado** en el DOM. Cuando no hay video visible se oculta con CSS (`hidden`) en lugar de desmontarse, de modo que React nunca intenta eliminar un nodo que el API de YouTube manipula internamente.

**Archivos afectados:**
- `src/pages/student/Lesson.jsx` — contenedor del reproductor siempre montado + estados alternativos (candado / "Video próximamente") renderizados aparte con `{!hasVideo && ...}`
- `src/hooks/useVideoProgress.js` — blindaje del ciclo de vida del reproductor (try/catch en creación y destrucción, bandera de cancelación, cancelación de reintentos asíncronos, guard de contenedor conectado al DOM)
- `src/App.jsx` — red de seguridad global (ErrorBoundary) con pantalla de respaldo y botón "Recargar página" para errores imprevisibles

**Verificación:** reproducido y validado con navegador headless — la transición video → candado ya no produce errores de consola ni pantallas de error.

### Fix: destello de pantalla completa al navegar entre páginas (02/08/2026 — commit 106)

**Síntoma:** al hacer clic en los botones de navegación dentro de la Academy, aparecía un destello de pantalla blanca "Cargando..." (se desmontaba todo, incluido el sidebar) y luego se colocaba la página correcta.

**Causa raíz:** todas las páginas y los 3 layouts principales (Student/Teacher/Admin) eran `lazy()` bajo un ÚNICO `<Suspense>` global que envolvía `<Routes>`. Al navegar, React desmontaba TODO el árbol (layout incluido) y mostraba el fallback de pantalla completa mientras descargaba el chunk de la página nueva.

**Solución:** los 3 layouts pasaron de `lazy()` a imports eager (siempre montados); se eliminó el `<Suspense>` global de rutas; cada layout envuelve su `<Outlet />` con un `<Suspense>` ligero (`RouteFallback`, spinner solo del área de contenido); `Checkout` y `NotFound` se envuelven individualmente.

**Archivos afectados:**
- `src/App.jsx` — layouts eager, sin Suspense global, Suspense individual para Checkout y NotFound
- `src/components/common/RouteFallback.jsx` — nuevo: spinner ligero solo del área de contenido
- `src/layouts/PublicLayout.jsx`, `AuthLayout.jsx`, `LessonLayout.jsx`, `StudentLayout.jsx`, `TeacherLayout.jsx`, `AdminLayout.jsx` — Suspense alrededor del `<Outlet />`

**Verificación:** build 3.51s sin errores, lint 0 errores. Sidebar/navbar ya no se desmontan al navegar; solo cambia el área de contenido.

### Fix: destello al cruzar Web principal ↔ Academy (02/08/2026 — commit 107)

**Síntoma:** al hacer clic en los botones del hero/navbar de la web principal que apuntan a la Academy (y viceversa), la pestaña se recargaba por completo mostrando un destello, y luego aparecía la página correcta.

**Causa raíz:** la web (`1-qawaylab-web`) y la Academy (`2-qawaylab-academy`) son dos SPAs separadas en dominios distintos. Los enlaces entre ambas eran `<a href>` SIN `target="_blank"`, por lo que el navegador hacía un **full page load** (descargar HTML+JS+CSS y arrancar React desde cero) cada vez — el destello es inherente a navegar entre apps separadas en la misma pestaña.

**Solución:** todos los enlaces de cruce Web ↔ Academy abren en **pestaña nueva** (`target="_blank" rel="noopener noreferrer"`): la pestaña actual nunca se recarga → cero destello. La Academy ya es una app aislada; aislarla más no elimina el destello (el full load sigue existiendo), por eso se cambia el comportamiento de navegación.

**Archivos afectados (Academy):**
- `src/components/common/Logo.jsx` — acepta `target`/`rel` opcionales
- `src/layouts/PublicLayout.jsx` — logo, navbar (7 links) y footer con `target="_blank"` hacia la web principal
- `src/layouts/LessonLayout.jsx` — logos del sidebar y footer con `target="_blank"`

**Archivos afectados (Web `1-qawaylab-web`, sin commit):**
- `src/pages/4-academy/AcademyPage.jsx` — 3 botones "Ver todos los cursos" con `target="_blank"`
- `src/components/layout/Navbar.jsx` — dropdown Academy (desktop + mobile) con `target="_blank"`

**Verificación:** build web (`--mode public`) 22.73s sin errores; build Academy 1.75s; lint 0 errores. Los links internos con `<Link>` de React Router no se tocaron.

### Fix: destello de login al entrar a Acceder/Registrarse con sesión activa (02/08/2026 — commit 108)

**Síntoma:** al abrir `/acceder` o `/registro` estando ya logueado, aparecía primero el formulario (como si no hubiera sesión) y un instante después redirigía al panel del usuario.

**Causa raíz:** `AuthContext` arranca con `loading: true` hasta que `getSession()` + `fetchProfile()` terminan. `AuthLayout` redirigía solo con `!loading && user && profile`, así que mientras resolvía la sesión renderizaba el `<Outlet />` (formulario de login/registro) aunque el usuario ya estuviera logueado.

**Solución:** `AuthLayout` muestra un **spinner mientras `loading`** (o si hay `user` sin `profile` aún cargado), igual que los otros layouts; recién después decide entre redirigir al panel por rol o mostrar el formulario.

**Archivos afectados:**
- `src/layouts/AuthLayout.jsx` — guard `if (loading || (user && !profile))` con spinner + redirect simplificado

**Verificación:** build sin errores, lint 0 errores. Un usuario con sesión ya nunca ve el formulario parpadeando; ve un spinner breve y luego su panel.

## 📄 Licencia

Proyecto privado — Qawa Lab
