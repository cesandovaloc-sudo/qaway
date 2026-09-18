# Qaway Academy — Fase 2: Auditoría y Saneamiento

**Fecha:** 2026-07-10
**Rama:** `main-academy`
**Último commit:** `cc1bed4`

---

## ✅ Estado final — Fase 2 COMPLETADA

| Área | Estado inicial | Estado final |
|------|---------------|--------------|
| **Build** | ✅ Pasa | ✅ Pasa (chunk ~628 kB) |
| **Rutas** | ✅ 21 rutas | ✅ 21 rutas + role checks |
| **Capa pública** | ✅ Conectada | ✅ Sin cambios |
| **Capa alumno** | ✅ Conectada | ✅ + Settings guarda perfil, Purchases conectado, Google Docs Viewer |
| **Capa docente** | 🔶 2 páginas mock | ✅ Datos reales desde Supabase |
| **Capa admin** | 🔶 5 páginas mock/sin guardar | ✅ Datos reales + formularios de guardado |
| **Seguridad (RLS)** | ✅ Bucket privado + signed URLs | ✅ + Role verification en layouts |
| **Limpieza** | 🔶 4 residuos scaffold | ✅ Residuos eliminados, refactors aplicados |

---

## Progreso real

| Fase | Items | Commits |
|------|-------|---------|
| **2A — P0 Crítico** | CourseNew, Settings, Purchases | `952d16e` |
| **2B — P1 Admin** | Dashboard, Courses, Students, CourseEdit | `bb4de36` |
| **2C — P1 Teacher** | Dashboard, TaskReview | `e58827b` |
| **2D — P2 Layouts** | Role check, GlobalSearch, UserMenu | `625a55b` |
| **2E — P3 Limpieza** | Refactors, residuos, +fix Students email | `f2a55e3` + `a651dc0` |
| **Extra** | Google Docs Viewer preview | `f3ef98d` |
| **Fix Viewer** | Native object/iframe en vez de Google Docs (no funciona con signed URLs) | `617d967` |
| **Fix Nav** | Simplificar nav pública: Acceder+Registrarse → Empieza Ahora | `c439e60` |
| **Fix Panel** | Agregar tab "Todos" a filtros del panel estudiante | `dc6830e` |
| **Fix Panel** | Unificar tab "En curso" a formato filas consistente | `6ea76be` |
| **Doc** | ACADEMY-TASK-FASE2.md creado + residuos scaffold commiteados | `cc1bed4` |

## Detalle por prioridad

### P0 — CRÍTICO ✅

| Item | Archivo | Commit | Cambio |
|------|---------|--------|--------|
| CourseNew | `src/pages/admin/CourseNew.jsx` | `952d16e` | `createCourse()` en lugar de `console.log` + `// TODO` |
| Settings | `src/pages/student/Settings.jsx` | `952d16e` | Formulario editable con `supabase.from('profiles').update()` |
| Purchases | `src/pages/student/Purchases.jsx` | `952d16e` | `useData(() => getPayments(user.id))` en lugar de `const purchases = []` |

### P1 — ALTA ✅

| Item | Archivo | Commit | Cambio |
|------|---------|--------|--------|
| Admin Dashboard | `src/pages/admin/Dashboard.jsx` | `bb4de36` | Stats desde 4 queries paralelas + `getRecentActivity()` |
| Admin Courses | `src/pages/admin/Courses.jsx` | `bb4de36` | `loadAllCourses()` directo a Supabase con filtros |
| Admin Students | `src/pages/admin/Students.jsx` | `bb4de36` + `a651dc0` | Query a `profiles` con role=student (fix: sin campo email) |
| Teacher Dashboard | `src/pages/teacher/Dashboard.jsx` | `e58827b` | Cursos, enrollments y submissions desde Supabase |
| Teacher TaskReview | `src/pages/teacher/TaskReview.jsx` | `e58827b` | Submissions reales con filtros y contadores |

### P2 — MEDIA ✅

| Item | Archivo | Commit | Cambio |
|------|---------|--------|--------|
| Role check layouts | Todos los layouts | `625a55b` | `!ALLOWED_ROLES.includes(profile.role)` → redirect |
| GlobalSearch | `src/components/common/GlobalSearch.jsx` | `625a55b` | Extraído de StudentLayout a componente compartido |
| UserMenu Teacher/Admin | `src/layouts/TeacherLayout.jsx`, `AdminLayout.jsx` | `625a55b` | Header con GlobalSearch + UserMenu |
| CourseEdit formulario | `src/pages/admin/CourseEdit.jsx` | `bb4de36` | Formulario completo con `updateCourse()` |

### P3 — BAJA ✅

| Item | Archivo | Commit | Cambio |
|------|---------|--------|--------|
| getPendingSubmissions | `src/lib/services/tasks.js` | `f2a55e3` | Filtro en BD con `.eq('task.lesson...instructor_id', ...)` |
| getCourseProgress | `src/lib/services/lessons.js` | `f2a55e3` | 1 query en lugar de 2 (progress: `lesson_id, completed, seconds_watched`) |
| Code-splitting | `vite.config.js` | ⬜ Pendiente | Chunk ~628 kB. Requiere `React.lazy()` en rutas |
| Residuos scaffold | `App.css`, `assets/`, `icons.svg`, `ui/`, `README.md` | `f2a55e3` | Eliminados + reemplazados |
| framer-motion | `package.json` | ⬜ Pendiente | Instalado pero sin imports. Decidir: remover o integrar |
| Permissions | `src/pages/admin/Permissions.jsx` | ⬜ Pendiente | Matriz estática documentativa. Conexión a BD requiere nueva migración |

### Extra — Google Docs Viewer ✅

| Item | Archivo | Commit | Cambio |
|------|---------|--------|--------|
| Preview recursos | `src/pages/student/Lesson.jsx` | `f3ef98d` | `ResourcePreview` con iframe de Google Docs Viewer para PDF/Word/Excel |

---

## Estado actual del mapa de conexión

| Página | Layout | Estado |
|--------|--------|--------|
| `/` Home | PublicLayout | ✅ Conectado |
| `/cursos` | PublicLayout | ✅ Conectado |
| `/cursos/:slug` | PublicLayout | ✅ Conectado |
| `/cursos/:slug/leccion/:id` (public) | PublicLayout | ✅ Conectado |
| `/acceder`, `/registro`, `/recuperar` | AuthLayout | ✅ Conectado |
| `/panel` | StudentLayout | ✅ Conectado (role: student) — tabs: Todos/En curso/Completados/Certificados |
| `/panel/cursos` | StudentLayout | ✅ Conectado |
| `/panel/cursos/:slug` | StudentLayout | ✅ Conectado |
| `/panel/cursos/:slug/leccion/:id` | StudentLayout | ✅ Conectado + ResourcePreview (PDF/Word/Excel viewer nativo) |
| `/panel/recursos` | StudentLayout | ✅ Conectado |
| `/panel/certificados` | StudentLayout | ✅ Conectado |
| `/panel/configuracion` | StudentLayout | ✅ Conectado + guarda perfil |
| `/panel/compras` | StudentLayout | ✅ Conectado a `getPayments()` |
| `/docente` | TeacherLayout | ✅ Conectado (role: teacher/editor) |
| `/docente/cursos/:slug` | TeacherLayout | ✅ Conectado |
| `/docente/tareas` | TeacherLayout | ✅ Conectado |
| `/admin` | AdminLayout | ✅ Conectado (role: admin/support) |
| `/admin/alumnos` | AdminLayout | ✅ Conectado |
| `/admin/docentes` | AdminLayout | ✅ Conectado |
| `/admin/cursos` | AdminLayout | ✅ Conectado |
| `/admin/cursos/nuevo` | AdminLayout | ✅ Conectado + guarda |
| `/admin/cursos/:slug/editar` | AdminLayout | ✅ Conectado + guarda |
| `/admin/permisos` | AdminLayout | 🔶 Estático (requiere migración BD) |

---

## Pendientes (post-Fase 2)

| Item | Prioridad | Notas |
|------|-----------|-------|
| Code-splitting (chunk 628 kB) | Baja | `React.lazy()` en `src/App.jsx` para rutas de admin y docente |
| framer-motion (decidir) | Baja | 0 imports en el proyecto. Remover o integrar |
| Permissions → BD real | Baja | Requiere nueva migración + tabla `role_permissions` |
| Preview de recursos en /panel/recursos | Media | Replicar ResourcePreview en la página global de recursos |

---

*Documento actualizado al cierre de la Fase 2. 6 commits, ~13h de trabajo efectivo.*
