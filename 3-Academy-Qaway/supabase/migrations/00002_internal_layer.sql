-- ===============================================================
-- Qaway Academy — Migración: Capa Interna (Módulos, Lecciones, Progreso)
-- ===============================================================

-- 1. MÓDULOS (dentro de cada curso)
-- ===============================================================
create table if not exists public.modules (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  position    integer not null default 0,
  description text,
  created_at  timestamptz not null default now()
);

-- 2. LECCIONES
-- ===============================================================
create table if not exists public.lessons (
  id            uuid primary key default uuid_generate_v4(),
  module_id     uuid not null references public.modules(id) on delete cascade,
  title         text not null,
  position      integer not null default 0,
  description   text,
  content       text,                          -- HTML o markdown
  video_url     text,                          -- URL del video (YouTube, Vimeo, etc.)
  video_provider text default 'youtube',        -- youtube, vimeo, local
  duration      text,                          -- "12:34"
  is_free       boolean not null default false, -- Lección de muestra
  created_at    timestamptz not null default now()
);

-- 3. RECURSOS DESCARGABLES
-- ===============================================================
create table if not exists public.resources (
  id            uuid primary key default uuid_generate_v4(),
  course_id     uuid references public.courses(id) on delete cascade,
  lesson_id     uuid references public.lessons(id) on delete cascade,
  title         text not null,
  description   text,
  file_url      text,
  file_type     text,                          -- pdf, zip, doc, etc.
  file_size     text,                          -- "2.4 MB"
  is_free       boolean not null default false,
  created_at    timestamptz not null default now()
);

-- 4. TAREAS / ASIGNACIONES
-- ===============================================================
create table if not exists public.assignments (
  id            uuid primary key default uuid_generate_v4(),
  course_id     uuid not null references public.courses(id) on delete cascade,
  lesson_id     uuid references public.lessons(id) on delete set null,
  title         text not null,
  description   text,
  due_days      integer,                       -- Días desde la inscripción para entregar
  max_score     integer default 100,
  created_at    timestamptz not null default now()
);

-- 5. ENTREGAS DE TAREAS
-- ===============================================================
create type submission_status as enum ('pending', 'submitted', 'graded', 'returned');

create table if not exists public.assignment_submissions (
  id              uuid primary key default uuid_generate_v4(),
  assignment_id   uuid not null references public.assignments(id) on delete cascade,
  user_id         uuid not null references public.profiles(id) on delete cascade,
  status          submission_status not null default 'pending',
  submission_url  text,
  score           integer,
  feedback        text,
  submitted_at    timestamptz,
  graded_at       timestamptz,
  unique(assignment_id, user_id)
);

-- 6. PROGRESO POR LECCIÓN
-- ===============================================================
create table if not exists public.lesson_progress (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  lesson_id       uuid not null references public.lessons(id) on delete cascade,
  completed       boolean not null default false,
  watched_seconds integer default 0,
  completed_at    timestamptz,
  created_at      timestamptz not null default now(),
  unique(user_id, lesson_id)
);

-- 7. CERTIFICADOS
-- ===============================================================
create table if not exists public.certificates (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  course_id       uuid not null references public.courses(id) on delete cascade,
  certificate_url text,
  issued_at       timestamptz not null default now(),
  verification_code text unique,
  unique(user_id, course_id)
);

-- 8. REGISTRO DE ACTIVIDAD (para monitoreo y emails automáticos)
-- ===============================================================
create type activity_type as enum (
  'login', 'course_start', 'lesson_view', 'lesson_complete',
  'resource_download', 'assignment_submit', 'assignment_grade',
  'certificate_issued', 'course_complete', 'inactivity_alert'
);

create table if not exists public.activity_logs (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  activity_type   activity_type not null,
  description     text,
  metadata        jsonb,                        -- Datos adicionales (course_id, lesson_id, etc.)
  created_at      timestamptz not null default now()
);

-- 9. RLS (SEGURIDAD)
-- ===============================================================
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.resources enable row level security;
alter table public.assignments enable row level security;
alter table public.assignment_submissions enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.certificates enable row level security;
alter table public.activity_logs enable row level security;

-- Módulos: visibles si el curso está publicado
create policy "Módulos visibles para cursos publicados"
  on public.modules for select
  using (exists (
    select 1 from public.courses where id = modules.course_id and is_published = true
  ));

-- Lecciones: visibles si el curso está publicado
create policy "Lecciones visibles para cursos publicados"
  on public.lessons for select
  using (exists (
    select 1 from public.modules
    join public.courses on courses.id = modules.course_id
    where modules.id = lessons.module_id and courses.is_published = true
  ));

-- Recursos: visibles si el curso está publicado o es gratis
create policy "Recursos visibles"
  on public.resources for select
  using (is_free = true or exists (
    select 1 from public.courses where id = resources.course_id and is_published = true
  ));

-- Tareas: visibles para alumnos inscritos
create policy "Tareas visibles para inscritos"
  on public.assignments for select
  using (exists (
    select 1 from public.enrollments
    where course_id = assignments.course_id and user_id = auth.uid() and status = 'active'
  ));

-- Entregas: solo el alumno dueño
create policy "Alumnos ven sus entregas"
  on public.assignment_submissions for select
  using (auth.uid() = user_id);

create policy "Alumnos crean sus entregas"
  on public.assignment_submissions for insert
  with check (auth.uid() = user_id);

-- Progreso: solo el alumno dueño
create policy "Alumnos ven su progreso"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

create policy "Alumnos actualizan su progreso"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

create policy "Alumnos modifican su progreso"
  on public.lesson_progress for update
  using (auth.uid() = user_id);

-- Certificados: solo el alumno dueño (verificación pública por código)
create policy "Alumnos ven sus certificados"
  on public.certificates for select
  using (auth.uid() = user_id);

-- Activity logs: solo el dueño y admin
create policy "Activity logs visibles para el usuario"
  on public.activity_logs for select
  using (auth.uid() = user_id);

create policy "Activity logs insertables por el sistema"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);

-- Admin puede ver todo (rol check)
create policy "Admin ve todos los activity logs"
  on public.activity_logs for select
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
  );

-- 10. ÍNDICES
-- ===============================================================
create index if not exists idx_modules_course on public.modules(course_id);
create index if not exists idx_lessons_module on public.lessons(module_id);
create index if not exists idx_resources_course on public.resources(course_id);
create index if not exists idx_resources_lesson on public.resources(lesson_id);
create index if not exists idx_assignments_course on public.assignments(course_id);
create index if not exists idx_submissions_assignment on public.assignment_submissions(assignment_id);
create index if not exists idx_submissions_user on public.assignment_submissions(user_id);
create index if not exists idx_progress_user on public.lesson_progress(user_id);
create index if not exists idx_progress_lesson on public.lesson_progress(lesson_id);
create index if not exists idx_certificates_user on public.certificates(user_id);
create index if not exists idx_certificates_code on public.certificates(verification_code);
create index if not exists idx_activity_user on public.activity_logs(user_id);
create index if not exists idx_activity_type on public.activity_logs(activity_type);
create index if not exists idx_activity_created on public.activity_logs(created_at);
