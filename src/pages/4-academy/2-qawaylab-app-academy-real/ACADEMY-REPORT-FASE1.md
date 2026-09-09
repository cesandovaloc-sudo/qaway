# Qaway Academy — Reporte de Avance (Fase 1)

**Fecha del reporte:** 2026-07-05
**Commit:** `c0e81b9`
**Rama:** `master`
**Ubicación del proyecto:** `C:\LEO\EMPRESAS\Qawa Lab Proyectos\1-Qaway-Academy`

---

## 1. Stack técnico

Fuente: archivo `package.json` en la raíz del proyecto. Cada dependencia fue extraída textualmente de ese archivo. Todas las versiones usan prefijo `^` (compatible con parches dentro de la minor version).

### Dependencias de producción

```json
"dependencies": {
  "@supabase/supabase-js": "^2.110.0",
  "framer-motion": "^12.42.2",
  "react": "^19.2.7",
  "react-dom": "^19.2.7",
  "react-router-dom": "^7.18.1"
}
```

### Dependencias de desarrollo

```json
"devDependencies": {
  "@tailwindcss/vite": "^4.3.2",
  "@types/react": "^19.2.17",
  "@types/react-dom": "^19.2.3",
  "@vitejs/plugin-react": "^6.0.3",
  "oxlint": "^1.71.0",
  "tailwindcss": "^4.3.2",
  "vite": "^8.1.1"
}
```

### Tabla resumen

| Paquete | Versión en package.json | Categoría |
|---------|------------------------|-----------|
| react | `^19.2.7` | Producción |
| react-dom | `^19.2.7` | Producción |
| react-router-dom | `^7.18.1` | Producción |
| @supabase/supabase-js | `^2.110.0` | Producción |
| framer-motion | `^12.42.2` | Producción |
| vite | `^8.1.1` | Desarrollo |
| @vitejs/plugin-react | `^6.0.3` | Desarrollo |
| tailwindcss | `^4.3.2` | Desarrollo |
| @tailwindcss/vite | `^4.3.2` | Desarrollo |
| oxlint | `^1.71.0` | Desarrollo |
| @types/react | `^19.2.17` | Desarrollo |
| @types/react-dom | `^19.2.3` | Desarrollo |

---

## 2. Estructura del proyecto

Árbol real verificado contra el sistema de archivos. Se excluyen `node_modules/` y `dist/` (cubiertos por `.gitignore`). **Nota:** este árbol mezcla 3 categorías: código fuente (`.jsx`, `.css`, `.js`), configuración (`.json`, `.js`, `.html`), documentación (`.md`) y base de datos (`.sql`). El conteo de "archivos" al final del reporte especifica qué entra en cada categoría.

```
C:\LEO\EMPRESAS\Qawa Lab Proyectos\1-Qaway-Academy\
│
├── .env.example                              # Template de variables de entorno
├── .gitignore                                # Ignora node_modules, dist, .env
├── .oxlintrc.json                            # Configuración del linter
├── ACADEMY-BRIEF.md                          # Documento de visión del proyecto
├── ACADEMY-TASK.md                           # Plan de ejecución por fases
├── ACADEMY-REPORT-FASE1.md                   # Este reporte
├── index.html                                # HTML entry (lang="es", title="Qaway Academy")
├── package.json                              # Dependencias y scripts
├── package-lock.json                         # Lock file de npm
├── vite.config.js                            # Vite + React + Tailwind + alias "@"
│
├── public/
│   ├── favicon.svg                           # Favicon del scaffold Vite
│   └── icons.svg                             # Iconos del scaffold Vite (no referenciado)
│
├── src/
│   ├── main.jsx                              # Entry point (StrictMode + App)
│   ├── App.jsx                               # Router principal con 21 rutas
│   ├── index.css                             # Tailwind v4 + estilos de componentes en CSS plano
│   ├── App.css                               # ⚠️ RESIDUO (ver sección 8)
│   │
│   ├── assets/
│   │   ├── hero.png                          # ⚠️ RESIDUO (ver sección 8)
│   │   ├── react.svg                         # ⚠️ RESIDUO (ver sección 8)
│   │   └── vite.svg                          # ⚠️ RESIDUO (ver sección 8)
│   │
│   ├── lib/
│   │   ├── supabase.js                       # Cliente Supabase (desde VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY)
│   │   └── services/
│   │       ├── index.js                      # Barrel export de 7 servicios
│   │       ├── courses.js                    # CRUD cursos
│   │       ├── enrollments.js                # Inscripciones
│   │       ├── lessons.js                    # Lecciones + progreso
│   │       ├── tasks.js                      # Tareas + entregas
│   │       ├── certificates.js               # Certificados
│   │       ├── payments.js                   # Pagos + WooCommerce
│   │       └── activity.js                   # Logging de actividad
│   │
│   ├── hooks/
│   │   └── useData.js                        # Hook: useData(fetcher, deps) → {data, loading, error, refetch}
│   │
│   ├── contexts/
│   │   └── AuthContext.jsx                   # Auth Supabase: sesión, perfil, signIn, signUp, signOut
│   │
│   ├── layouts/
│   │   ├── PublicLayout.jsx                  # Header + Footer (para rutas públicas)
│   │   ├── AuthLayout.jsx                    # Minimalista (para login/registro/recuperar)
│   │   ├── StudentLayout.jsx                 # Sidebar + header. Redirige si no hay sesión.
│   │   ├── TeacherLayout.jsx                 # Sidebar + header. Redirige si no hay sesión.
│   │   └── AdminLayout.jsx                   # Sidebar + header. Redirige si no hay sesión.
│   │
│   ├── components/
│   │   └── ui/                               # Vacío. Placeholder para componentes reutilizables.
│   │
│   └── pages/
│       ├── public/
│       │   ├── Home.jsx                      # Landing: hero + beneficios + cursos destacados + CTA
│       │   ├── Courses.jsx                   # Catálogo: 6 cursos, filtros (categoría, nivel, búsqueda)
│       │   ├── CourseDetail.jsx              # Detalle: breadcrumbs, módulos, requisitos, instructor
│       │   ├── Login.jsx                     # Formulario email+password
│       │   ├── Register.jsx                  # Formulario nombre+email+password
│       │   └── Recover.jsx                   # Envío de email de recuperación
│       │
│       ├── student/
│       │   ├── Panel.jsx                     # Dashboard: cursos activos, stats, recursos
│       │   ├── CourseHub.jsx                 # Hub: módulos, lecciones, progreso
│       │   ├── Lesson.jsx                    # Reproductor: video, tabs, sidebar de lecciones
│       │   ├── Resources.jsx                 # Lista de descargables
│       │   └── Certificates.jsx              # Lista de certificados
│       │
│       ├── teacher/
│       │   ├── Dashboard.jsx                 # Panel: stats, cursos, entregas recientes
│       │   ├── CourseManage.jsx              # Gestión de módulos/lecciones
│       │   └── TaskReview.jsx                # Revisión de tareas con filtros
│       │
│       └── admin/
│           ├── Dashboard.jsx                 # Métricas, accesos rápidos, actividad
│           ├── Students.jsx                  # Tabla de alumnos con búsqueda
│           ├── Teachers.jsx                  # Tabla de docentes
│           ├── Courses.jsx                   # Tabla de cursos
│           ├── CourseNew.jsx                 # Formulario de creación
│           ├── CourseEdit.jsx                # Formulario de edición
│           └── Permissions.jsx               # Matriz roles × acciones
│
└── supabase/
    └── migrations/
        ├── 00001_initial_schema.sql          # 12 tablas + índices + triggers
        └── 00002_rls_policies.sql            # RLS policies
```

---

## 3. Routing

Archivo fuente: `src/App.jsx`. **21 rutas** distribuidas en 4 contextos de navegación con layouts anidados.

**Precisión sobre protección:** En el frontend, los layouts verifican solo existencia de sesión (`user != null`), **no el rol**. Por tanto, los nombres de contexto abajo ("alumno", "docente", "admin") indican la **intención de diseño** y la **estructura de URLs**, pero no implican que haya autorización por rol en esta capa. La autorización real está delegada a RLS en Supabase (lado BD) y está pendiente de implementar en el frontend (ver Issue 5).

### Rutas públicas (sin autenticación)

| Ruta | Página | Layout |
|------|--------|--------|
| `/` | Home | PublicLayout |
| `/cursos` | Courses | PublicLayout |
| `/cursos/:slug` | CourseDetail | PublicLayout |
| `/acceder` | Login | AuthLayout |
| `/registro` | Register | AuthLayout |
| `/recuperar` | Recover | AuthLayout |

### Rutas bajo `/panel` (contexto alumno — requieren sesión, NO verifican rol)

| Ruta | Página | Layout | Protección real |
|------|--------|--------|----------------|
| `/panel` | StudentPanel | StudentLayout | Redirige a `/acceder` si `!user`. No verifica rol. |
| `/panel/cursos/:slug` | CourseHub | StudentLayout | 〃 |
| `/panel/cursos/:slug/leccion/:lessonId` | Lesson | StudentLayout | 〃 |
| `/panel/recursos` | Resources | StudentLayout | 〃 |
| `/panel/certificados` | Certificates | StudentLayout | 〃 |

### Rutas bajo `/docente` (contexto docente — requieren sesión, NO verifican rol)

| Ruta | Página | Layout | Protección real |
|------|--------|--------|----------------|
| `/docente` | TeacherDashboard | TeacherLayout | Redirige a `/acceder` si `!user`. No verifica rol. |
| `/docente/cursos/:slug` | CourseManage | TeacherLayout | 〃 |
| `/docente/tareas` | TaskReview | TeacherLayout | 〃 |

### Rutas bajo `/admin` (contexto admin — requieren sesión, NO verifican rol)

| Ruta | Página | Layout | Protección real |
|------|--------|--------|----------------|
| `/admin` | AdminDashboard | AdminLayout | Redirige a `/acceder` si `!user`. No verifica rol. |
| `/admin/alumnos` | Students | AdminLayout | 〃 |
| `/admin/docentes` | Teachers | AdminLayout | 〃 |
| `/admin/cursos` | AdminCourses | AdminLayout | 〃 |
| `/admin/cursos/nuevo` | CourseNew | AdminLayout | 〃 |
| `/admin/cursos/:slug/editar` | CourseEdit | AdminLayout | 〃 |
| `/admin/permisos` | Permissions | AdminLayout | 〃 |

**Total verificable: 6 públicas + 5 contexto alumno + 3 contexto docente + 7 contexto admin = 21 rutas.**

---

## 4. Base de datos — Esquema Supabase

Fuente: `supabase/migrations/00001_initial_schema.sql`. 12 tablas con relaciones, índices y triggers.

### Lista de tablas

| # | Tabla | FK a | Univo | Columnas clave |
|---|-------|------|-------|---------------|
| 1 | `profiles` | `auth.users.id` | — | `id`, `full_name`, `avatar_url`, `role` (student/teacher/editor/support/admin) |
| 2 | `courses` | `profiles.id` | `slug` | `title`, `instructor_id`, `category`, `level`, `price`, `status` (draft/review/published/archived), `featured`, `what_you_learn` (jsonb) |
| 3 | `modules` | `courses.id` (cascade) | — | `course_id`, `title`, `sort_order` |
| 4 | `lessons` | `modules.id` (cascade) | — | `module_id`, `title`, `content`, `video_url`, `duration`, `sort_order`, `status` |
| 5 | `resources` | `lessons.id`, `courses.id` (cascade) | — | `lesson_id`, `course_id`, `title`, `type` (PDF/Video/Enlace/Ejercicio/Plantilla/Archivo) |
| 6 | `tasks` | `lessons.id` (cascade) | — | `lesson_id`, `title`, `description`, `due_days` |
| 7 | `submissions` | `tasks.id`, `profiles.id` (cascade) | — | `task_id`, `student_id`, `file_url`, `status` (pending/reviewed/approved/returned), `grade`, `feedback` |
| 8 | `enrollments` | `profiles.id`, `courses.id` (cascade) | `(student_id, course_id)` | `student_id`, `course_id`, `status` (active/completed/cancelled) |
| 9 | `progress` | `profiles.id`, `lessons.id` (cascade) | `(student_id, lesson_id)` | `student_id`, `lesson_id`, `completed`, `completed_at` |
| 10 | `certificates` | `profiles.id`, `courses.id` (cascade) | `(student_id, course_id)` | `student_id`, `course_id`, `certificate_url`, `issued_at` |
| 11 | `payments` | `profiles.id`, `courses.id` (cascade) | — | `student_id`, `course_id`, `amount`, `currency`, `status` (pending/completed/failed/refunded), `provider` |
| 12 | `activity_logs` | `profiles.id` (cascade) | — | `user_id`, `action`, `entity_type`, `entity_id`, `metadata` (jsonb) |

### Triggers

| Trigger | Evento | Acción |
|---------|--------|--------|
| `set_profiles_updated_at` | BEFORE UPDATE ON profiles | `updated_at = now()` |
| `set_courses_updated_at` | BEFORE UPDATE ON courses | 〃 |
| `set_modules_updated_at` | BEFORE UPDATE ON modules | 〃 |
| `set_lessons_updated_at` | BEFORE UPDATE ON lessons | 〃 |
| `on_auth_user_created` | AFTER INSERT ON auth.users | Crea registro en `profiles` con rol `'student'` |

### Índices (14)

```sql
idx_courses_slug, idx_courses_status, idx_modules_course, idx_lessons_module,
idx_resources_lesson, idx_enrollments_student, idx_enrollments_course,
idx_progress_student, idx_progress_lesson, idx_submissions_task,
idx_submissions_student, idx_certificates_student, idx_payments_student,
idx_activity_user
```

### RLS Policies por tabla

**Aclaración importante:** `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` se ejecutó en las 12 tablas. Esto significa que **el 100% de las tablas están bloqueadas por defecto**. Luego se definieron policies en 11 de ellas para permitir accesos específicos. La tabla `resources` tiene RLS activado pero **0 policies definidas**.

**Matiz necesario:** En PostgreSQL, RLS activado + 0 policies = **denegado total a través de la API pública de Supabase** (la que usa la app, tanto con anon key como con authenticated key). Esto significa que ningún flujo de la aplicación (público, alumno, docente ni admin) puede leer, insertar, actualizar ni eliminar registros de `resources` usando el cliente `supabase-js` desde el frontend.

**No obstante**, esto no es una imposibilidad absoluta en toda forma de acceso:
- Un backend con `service_role` key puede saltarse RLS
- Un administrador de BD con acceso directo puede consultar la tabla
- El dueño de la tabla (postgres) puede modificarla

Dentro del **perímetro de la aplicación cliente** (que es el contexto relevante para esta Fase 1), el bloqueo es completo. Pero no es una imposibilidad ontológica — es una restricción de la API pública de Supabase. La distinción importa porque si en el futuro se implementa un backend intermedio con service_role, esa capa sí podría acceder a `resources`.

| Tabla | RLS | Policies | Acceso efectivo |
|-------|-----|----------|----------------|
| `profiles` | ✅ ON | 4 | Usuario: propio perfil. Admin: todos. |
| `courses` | ✅ ON | 7 | Público: solo published. Teacher: propios. Admin: todos. |
| `modules` | ✅ ON | 5 | Público: si curso published. Teacher: si curso propio. Admin: todos. |
| `lessons` | ✅ ON | 5 | Mismo criterio que modules (vía module → course join). |
| `resources` | ✅ ON | **0** | **🔴 Bloqueado vía API Supabase. Accesible solo con service_role o acceso directo a BD.** |
| `tasks` | ✅ ON | 1 | Alumnos: solo si inscritos en el curso. |
| `submissions` | ✅ ON | 4 | Alumnos: propias. Teacher: de cursos propios. |
| `enrollments` | ✅ ON | 3 | Alumnos: propias + auto-inscripción. Admin: todas. |
| `progress` | ✅ ON | 4 | Alumnos: propio. Teacher: de cursos propios. |
| `certificates` | ✅ ON | 2 | Alumnos: propios. Admin: todos. |
| `payments` | ✅ ON | 3 | Alumnos: propios + creación. Admin: todos. |
| `activity_logs` | ✅ ON | 2 | Admin: lectura. Sistema: creación. |

**Cobertura:** 12/12 RLS habilitado. 11/12 con policies. 1 tabla (resources) con denegado total.

---

## 5. Servicios de datos

Fuente: archivos en `src/lib/services/`. 7 servicios, cada uno con funciones exportadas.

### courses.js
- `getCourses({ category, level, search, status })` — Lista filtrada con JOIN instructor
- `getFeaturedCourses()` — Limit 6, solo published + featured
- `getCourseBySlug(slug)` — Único con JOIN instructor + modules + lessons
- `createCourse(data)` — INSERT. Retorna el curso creado.
- `updateCourse(id, data)` — UPDATE por id.
- `deleteCourse(id)` — Soft delete (status → 'archived')

### enrollments.js
- `getEnrollments(studentId)` — Lista con JOIN course + instructor
- `enrollStudent(studentId, courseId)` — INSERT
- `getEnrollment(studentId, courseId)` — Único. Ignora error PGRST116 (not found)

### lessons.js
- `getLesson(lessonId)` — Único con JOIN module + resources
- `getModuleLessons(moduleId)` — Lista ordenada, solo published
- `markLessonComplete(studentId, lessonId)` — UPSERT en progress
- `getCourseProgress(studentId, courseId)` — 2 queries separadas (ver Issue 4)

### tasks.js
- `getLessonTasks(lessonId)` — Lista por lección
- `getSubmissions(taskId, { status })` — Lista con JOIN student
- `submitTask(taskId, studentId, { file_url, notes })` — INSERT en submissions
- `reviewSubmission(submissionId, { status, grade, feedback })` — UPDATE con timestamp
- `getPendingSubmissions(teacherId)` — Filtra en cliente (ver Issue 3)

### certificates.js
- `getCertificates(studentId)` — Lista con JOIN course + instructor
- `issueCertificate(studentId, courseId)` — INSERT
- `verifyCertificate(certificateId)` — Único con JOIN student + course

### payments.js
- `createPaymentOrder(studentId, courseId, amount)` — INSERT con provider='woocommerce'
- `updatePaymentStatus(paymentId, status, providerId)` — UPDATE + upsert enrollment si completed
- `getPayments(studentId)` — Lista con JOIN course

### activity.js
- `logActivity(userId, action, entityType, entityId, metadata)` — INSERT. Errores solo en consola.
- `getRecentActivity(limit = 10)` — Lista cronológica con JOIN user
- `getCourseActivity(courseId, limit = 20)` — Filtrada por curso

---

## 6. Seguridad

### Variables de entorno requeridas

| Variable | Propósito | ¿Existe .env? |
|----------|-----------|--------------|
| `VITE_SUPABASE_URL` | URL del proyecto Supabase | ❌ Solo `.env.example` |
| `VITE_SUPABASE_ANON_KEY` | Anon key de Supabase | ❌ Solo `.env.example` |
| `VITE_WOOCOMMERCE_API_URL` | URL API de WooCommerce | ❌ Declarada en payments.js, sin valor |
| `VITE_WOOCOMMERCE_CONSUMER_KEY` | Consumer key WooCommerce | ❌ 〃 |
| `VITE_WOOCOMMERCE_CONSUMER_SECRET` | Consumer secret WooCommerce | ❌ 〃 |

### Rutas protegidas — Criterio real

3 layouts (StudentLayout, TeacherLayout, AdminLayout) implementan:

```
1. LOADING: spinner animado mientras AuthContext resuelve sesión
2. NO SESSION (<Navigate to="/acceder" replace />): redirige inmediatamente
3. SESSION OK: renderiza <Outlet /> con sidebar + header
```

**Limitación:** Solo verifican `user != null` (sesión activa). No verifican `profile.role`. Un alumno logueado puede navegar a `/admin` — verá el panel aunque las queries a Supabase fallarían por RLS. Ver Issue 5.

### RLS — Alcance real

Ver sección 4 para detalle por tabla. Resumen:
- 12/12 tablas con RLS activado
- 11/12 con al menos 1 policy
- 1 tabla (resources) con denegado total (0 policies)
- 4 niveles modelados: público, alumno, docente, admin
- Las policies de docente verifican `instructor_id = auth.uid()` mediante joins en la cadena course → module → lesson

---

## 7. Pagos — WooCommerce Bridge (alcance real)

El término "WooCommerce bridge" en esta base significa exclusivamente:

**Archivo:** `src/lib/services/payments.js` (70 líneas)

**Lo que existe:**
- Registro local de pagos en tabla `payments` con `provider = 'woocommerce'`
- Actualización de estado con desbloqueo automático del curso al completarse
- Consulta de historial de pagos por alumno
- 3 variables de entorno declaradas para futura conexión HTTP con WooCommerce

**Lo que NO existe (pendiente):**
- Conexión HTTP real con la API de WooCommerce (las 3 variables WC están declaradas pero nunca se usan en llamadas fetch)
- Webhook handler para recibir confirmaciones de pago desde WooCommerce
- UI de checkout
- Manejo de errores de conexión

**Definición concreta:** Es una **arquitectura de cobro preparada pero no conectada**. La integración HTTP con WooCommerce es código muerto hasta que se implementen las llamadas fetch. La tabla `payments` almacena `provider_id` para vincular transacciones externas cuando se conecte.

---

## 8. Residuos detectados

### `src/App.css` — RESIDUO

- **Contenido:** 150+ líneas de CSS del scaffold original de Vite (clases `.counter`, `.hero`, `#center`, etc.)
- **Evidencia de desuso:** `src/main.jsx` línea 3: `import './index.css'` — no hay `import './App.css'`. Ningún componente usa estas clases.
- **Origen:** Template por defecto de `npm create vite@latest -- --template react`

### `src/assets/` — RESIDUO

- **Contenido:** `hero.png`, `react.svg`, `vite.svg`
- **Evidencia de desuso:** Búsqueda en todo el proyecto: 0 referencias a estos archivos. Las páginas usan emojis (`📚`) o gradientes CSS como placeholders visuales.
- **Origen:** Scaffold de Vite.

### `public/favicon.svg` y `public/icons.svg` — RESIDUO PARCIAL

- `favicon.svg` está referenciado en `index.html` (línea 5: `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`). El favicon actual es el logo de Vite. Debe reemplazarse por uno de Qaway Academy.
- `icons.svg` no está referenciado en ningún archivo.

### `README.md` — RESIDUO

- **Contenido:** README genérico de Vite (instrucciones para `npm run dev`, `npm run build`).
- **Evidencia de desuso:** No menciona Qaway Academy, su stack real, cómo configurar Supabase ni el propósito del proyecto.

### `src/components/ui/` — CARPETA VACÍA

- Placeholder para componentes reutilizables futuros. Sin archivos dentro.

---

## 9. Issues conocidos

### Issue 1: Páginas con datos harcodeados
**Archivos:** 16 páginas (Home, Courses, CourseDetail, Panel, CourseHub, Lesson, Resources, Certificates, TeacherDashboard, CourseManage, TaskReview, AdminDashboard, Students, Teachers, AdminCourses, Permissions)
**Problema:** Usan arrays/objetos de demostración definidos localmente en lugar de consumir los servicios de `src/lib/services/`. Solo `Home.jsx` fue parcialmente migrada.
**Impacto:** La UI se ve completa pero no opera con datos reales de Supabase.
**Solución:** Cada página debe refactorizarse para usar `useData()` + el servicio correspondiente.

### Issue 2: Framer Motion instalado sin uso
**Archivo:** `package.json` — `framer-motion@^12.42.2`
**Problema:** 0 imports en todo el proyecto. Peso añadido al bundle sin beneficio.
**Solución:** Integrar en próximas fases para animaciones, o remover.

### Issue 3: getPendingSubmissions() filtra en cliente
**Archivo:** `src/lib/services/tasks.js`
**Problema:** `getPendingSubmissions(teacherId)` obtiene todas las submissions de la BD y aplica `.filter()` en JavaScript. Ineficiente con volúmenes grandes.
**Solución:** Agregar filtro por `instructor_id` directamente en la query de Supabase.

### Issue 4: getCourseProgress() hace 2 queries
**Archivo:** `src/lib/services/lessons.js`
**Problema:** `getCourseProgress(studentId, courseId)` ejecuta 2 queries separadas (una para obtener lecciones, otra para progreso) en lugar de usar un LEFT JOIN.
**Solución:** Reemplazar por una sola query con LEFT JOIN entre lessons y progress.

### Issue 5: Sin verificación de rol en rutas protegidas
**Archivos:** `src/layouts/StudentLayout.jsx`, `TeacherLayout.jsx`, `AdminLayout.jsx`
**Problema:** Los 3 layouts protegen por sesión (`user != null`) pero no por rol (`profile.role`). Cualquier usuario logueado accede a URLs de cualquier contexto.
**Impacto:** Confusión de UI (el usuario ve un panel que no le corresponde). Los datos están seguros por RLS, pero la experiencia es incorrecta.
**Solución:** En los layouts, después de verificar sesión, verificar que `profile.role` coincida con el contexto esperado. Redirigir si no coincide.

---

## 10. Compilación

**Comando oficial:** `npm run build` (definido en `package.json` → `"build": "vite build"`). Es equivalente a `npx vite build`.

| Campo | Valor |
|-------|-------|
| **Fecha** | 2026-07-05 |
| **Comando ejecutado** | `npm run build` (que internamente ejecuta `vite build`) |
| **Resultado** | ✅ Éxito (exit code 0) |
| **Duración** | 629ms |
| **Errores** | 0 |
| **Advertencias** | 1: chunk `dist/assets/index-Dpnv3m3x.js` excede 500 kB (521.71 kB) |

### Cómo reproducir

```bash
cd "C:\LEO\EMPRESAS\Qawa Lab Proyectos\1-Qaway-Academy"
npm run build
```

---

## 11. Estado por fase (contra ACADEMY-TASK.md)

**Criterio:** Una fase se marca "Completo" cuando su entregable funcional está construido, aunque tenga deuda técnica menor documentada que se liquidará en fases posteriores (especialmente Fase 9: Limpieza).

| Fase | Estado | Lo que falta |
|------|--------|-------------|
| **0.** Diagnóstico | ✅ Completo | — |
| **1.** Base del producto | ✅ Completo (con deuda) | Residuos del scaffold (App.css, assets/, README) — se liquidan en Fase 9 |
| **2.** Capa pública | 🔶 Parcial | Conectar páginas a servicios reales (Issue 1) |
| **3.** Capa alumno | 🔶 Parcial | Conectar páginas a servicios reales (Issue 1) |
| **4.** Capa docente | 🔶 Parcial | Conectar páginas a servicios reales (Issue 1) |
| **5.** Capa admin | 🔶 Parcial | Conectar CRUD a servicios + validar roles en frontend (Issue 5) |
| **6.** Pagos | 🔶 Arquitectura | Implementar conexión HTTP con WooCommerce + UI checkout |
| **7.** Seguridad | ✅ RLS + rutas | Agregar verificación de rol en layouts (Issue 5) |
| **8.** Auditoría | ⬜ Pendiente | — |
| **9.** Limpieza | ⬜ Pendiente | Eliminar residuos (sección 8) + resolver Issues 2, 3, 4 |

---

## 12. Conteo de archivos (desglose)

**Total en repositorio: 59 archivos** (excluyendo `node_modules/`, `dist/` y `.git/`). Fuente: `find . -type f` en la raíz del proyecto.

| Categoría | Archivos | Detalle |
|-----------|----------|---------|
| Código fuente (`.jsx`) | **29** | src/main, src/App, AuthContext, layouts (5), páginas (21: 6 públicas + 5 alumno + 3 docente + 7 admin) |
| Código fuente (`.js`) | **10** | supabase.js, services (8: index + 7 servicios), useData.js |
| Código fuente (`.css`) | 2 | index.css (propio), App.css (residuo del scaffold) |
| Base de datos (`.sql`) | 2 | Migraciones: schema + RLS |
| Configuración (`.json`, `.js`, `.html`) | 6 | package.json, package-lock.json, vite.config.js, .oxlintrc.json, .gitignore, index.html |
| Documentación (`.md`) | 4 | ACADEMY-BRIEF.md, ACADEMY-TASK.md, ACADEMY-REPORT-FASE1.md, README.md (residuo del scaffold) |
| Assets | 5 | favicon.svg, icons.svg, hero.png, react.svg, vite.svg |
| Entorno | 1 | .env.example |

---

*Reporte generado para validación externa. Corregido según observaciones de consistencia del 2026-07-05.*

*No ejecutar cambios hasta aprobación explícita del usuario.*
