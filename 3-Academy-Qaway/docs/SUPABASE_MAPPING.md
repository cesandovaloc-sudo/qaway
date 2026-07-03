# Mapeo Supabase — Qaway Academy

Cada pagina y componente del frontend esta mapeado a las tablas de Supabase que lo alimentan.
Donde dice `(mock)` significa que aun se usa datos de prueba de `src/data/`.

---

## Capa Publica

| Pagina | Tablas Supabase | Estado |
|---|---|---|
| Home (`/`) | `courses` | (mock) |
| Catalog (`/cursos`) | `courses` | (mock) |
| CourseDetail (`/cursos/:slug`) | `courses`, `instructors` | (mock) |
| Login (`/acceder`) | `auth.users` (Supabase Auth) | ✅ Listo |
| Register (`/registro`) | `auth.users` (Supabase Auth) | ✅ Listo |
| Recover (`/recuperar`) | `auth.users` (Supabase Auth) | ✅ Listo |

---

## Capa Alumno (requiere auth)

| Pagina | Tablas Supabase | Estado |
|---|---|---|
| Dashboard (`/panel`) | `enrollments`, `courses`, `lesson_progress` | (mock) |
| CourseHub (`/panel/cursos/:slug`) | `courses`, `modules`, `lessons`, `lesson_progress`, `resources`, `assignments` | (mock) |
| LessonView (`/panel/cursos/:slug/leccion/:id`) | `lessons`, `lesson_progress`, `resources` | (mock) |
| Certificates (`/panel/certificados`) | `certificates` | (mock) |
| Resources (`/panel/recursos`) | `resources` | (mock) |

---

## Capa Admin

| Pagina | Tablas Supabase | Estado |
|---|---|---|
| Dashboard (`/admin`) | `profiles`, `courses`, `enrollments`, `activity_logs` | (mock) |
| Students (`/admin/alumnos`) | `profiles` (role=student), `enrollments`, `lesson_progress`, `activity_logs` | (mock) |
| Courses (`/admin/cursos`) | `courses` | (mock) |
| CourseForm (`/admin/cursos/nuevo`, `/admin/cursos/:slug/editar`) | `courses` | (mock) |
| Teachers (`/admin/docentes`) | `profiles` (role=instructor), `courses` | (mock) |
| Permissions (`/admin/permisos`) | `profiles` (role update) | (mock) |

---

## Capa Docente

| Pagina | Tablas Supabase | Estado |
|---|---|---|
| Dashboard (`/docente`) | `profiles`, `courses` (assigned), `assignments`, `assignment_submissions` | (mock) |
| CourseManage (`/docente/cursos/:slug`) | `modules`, `lessons`, `resources`, `assignments` | (mock) |
| Tasks (`/docente/tareas`) | `assignment_submissions`, `assignments` | (mock) |

---

## Esquema completo de tablas

### Migracion 1 — `00001_initial_schema.sql` (Fase 1)

| Tabla | Proposito | Usada por |
|---|---|---|
| `profiles` | Perfiles de usuario (alumno, instructor, admin) | Auth layer, admin, docente |
| `courses` | Catalogo de cursos | Home, Catalog, CourseDetail, admin |
| `enrollments` | Inscripciones de alumnos a cursos | Dashboard, CourseHub |
| `orders` | Pedidos (WooCommerce bridge) | Payments |

### Migracion 2 — `00002_internal_layer.sql` (Fase 2)

| Tabla | Proposito | Usada por |
|---|---|---|
| `modules` | Modulos dentro de cada curso | CourseHub, CourseManage |
| `lessons` | Lecciones con video, contenido, recursos | LessonView, CourseManage |
| `lesson_progress` | Progreso individual por leccion | Dashboard, CourseHub |
| `resources` | Archivos descargables | Resources, CourseHub, CourseManage |
| `assignments` | Tareas definidas por el docente | CourseHub, CourseManage, Tasks |
| `assignment_submissions` | Entregas de los alumnos | Tasks |
| `activity_logs` | Registro de actividad (monitoreo) | Admin dashboard, STUDENT_MONITORING.md |
| `payments` | Transacciones y metodos de pago | Guia de pagos |

---

## Orden recomendado para migrar de mock a Supabase

1. **Auth** — Ya funcional (Login, Register, Recover)
2. **`courses`** — Reemplazar `src/data/courses.js` con consulta `supabase.from('courses').select('*')`
3. **`profiles`** — Al registrarse, crear perfil en `profiles` con rol `student`
4. **`enrollments`** — Al comprar o inscribirse gratis, crear registro
5. **`modules` + `lessons`** — Reemplazar `generateMockModules()` con consulta real
6. **`lesson_progress`** — Cada vez que el alumno ve una leccion, actualizar
7. **`resources` + `assignments` + `submissions`** — Reemplazar mocks restantes
8. **`activity_logs`** — Trigger automatico desde backend o Edge Function
9. **`payments`** — Cuando se integre WooCommerce o Stripe
