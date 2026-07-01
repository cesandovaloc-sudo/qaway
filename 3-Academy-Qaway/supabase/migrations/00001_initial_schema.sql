-- ===============================================================
-- Qaway Academy — Migración Inicial
-- Supabase PostgreSQL Schema
-- ===============================================================
-- Esta migración establece la base de datos para la Academia.
-- Prioriza lo mínimo necesario para operar: usuarios, cursos,
-- inscripciones, progreso y certificados.
-- ===============================================================

-- 1. EXTENSIONES
-- ===============================================================
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";


-- 2. TABLA: PERFILES (extiende auth.users de Supabase)
-- ===============================================================
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  avatar_url  text,
  role        text not null default 'student' check (role in ('student', 'admin', 'instructor')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-crear perfil al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();


-- 3. TABLA: CATEGORÍAS
-- ===============================================================
create table if not exists public.categories (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  slug        text not null unique,
  description text,
  created_at  timestamptz not null default now()
);


-- 4. TABLA: CURSOS
-- ===============================================================
create table if not exists public.courses (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  slug          text not null unique,
  description   text,
  summary       text,
  level         text not null default 'basico' check (level in ('basico', 'intermedio', 'avanzado')),
  duration      text,         -- ej. "4 módulos"
  price         numeric(10,2) default 0,
  is_published  boolean not null default false,
  cover_url     text,
  category_id   uuid references public.categories(id) on delete set null,
  instructor_id uuid references public.profiles(id) on delete set null,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- 5. TABLA: MÓDULOS
-- ===============================================================
create table if not exists public.modules (
  id          uuid primary key default uuid_generate_v4(),
  course_id   uuid not null references public.courses(id) on delete cascade,
  title       text not null,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now()
);


-- 6. TABLA: LECCIONES
-- ===============================================================
create table if not exists public.lessons (
  id            uuid primary key default uuid_generate_v4(),
  module_id     uuid not null references public.modules(id) on delete cascade,
  title         text not null,
  content       text,          -- Markdown o HTML
  video_url     text,
  duration_min  integer,
  sort_order    integer not null default 0,
  is_free       boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- 7. TABLA: INSCRIPCIONES (matrícula)
-- ===============================================================
create type enrollment_status as enum ('active', 'completed', 'cancelled');

create table if not exists public.enrollments (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  course_id   uuid not null references public.courses(id) on delete cascade,
  status      enrollment_status not null default 'active',
  progress    integer not null default 0 check (progress between 0 and 100),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(user_id, course_id)
);


-- 8. TABLA: PROGRESO DE LECCIONES
-- ===============================================================
create table if not exists public.lesson_progress (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  lesson_id   uuid not null references public.lessons(id) on delete cascade,
  completed   boolean not null default false,
  completed_at timestamptz,
  created_at  timestamptz not null default now(),
  unique(user_id, lesson_id)
);


-- 9. TABLA: CERTIFICADOS
-- ===============================================================
create table if not exists public.certificates (
  id              uuid primary key default uuid_generate_v4(),
  user_id         uuid not null references public.profiles(id) on delete cascade,
  course_id       uuid not null references public.courses(id) on delete cascade,
  enrollment_id   uuid not null references public.enrollments(id) on delete cascade,
  issued_at       timestamptz not null default now(),
  certificate_url text,
  unique(user_id, course_id)
);


-- 10. TABLA: ÓRDENES (para integración con WooCommerce)
-- ===============================================================
create table if not exists public.orders (
  id                uuid primary key default uuid_generate_v4(),
  user_id           uuid references public.profiles(id) on delete set null,
  course_id         uuid references public.courses(id) on delete set null,
  woo_order_id      bigint,           -- ID de WooCommerce
  amount            numeric(10,2),
  status            text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  payment_method    text,             -- 'woocommerce', 'stripe', etc.
  created_at        timestamptz not null default now()
);


-- 11. RLS (SEGURIDAD A NIVEL DE FILA)
-- ===============================================================
-- Habilitar RLS en todas las tablas
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.certificates enable row level security;
alter table public.orders enable row level security;

-- Usuarios pueden ver su propio perfil
create policy "Usuarios ven su propio perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- Usuarios pueden actualizar su propio perfil
create policy "Usuarios actualizan su propio perfil"
  on public.profiles for update
  using (auth.uid() = id);

-- Catálogo visible para todos (solo cursos publicados)
create policy "Catálogo visible para todos"
  on public.courses for select
  using (is_published = true);

-- Módulos visibles si el curso es visible
create policy "Módulos visibles para todos"
  on public.modules for select
  using (
    exists (
      select 1 from public.courses
      where courses.id = modules.course_id
      and courses.is_published = true
    )
  );

-- Lecciones visibles si el curso es visible o son gratuitas
create policy "Lecciones visibles para todos (free)"
  on public.lessons for select
  using (
    is_free = true
    or exists (
      select 1 from public.modules
      join public.courses on courses.id = modules.course_id
      where modules.id = lessons.module_id
      and courses.is_published = true
    )
  );

-- Usuarios ven sus propias inscripciones
create policy "Usuarios ven sus inscripciones"
  on public.enrollments for select
  using (auth.uid() = user_id);

-- Usuarios pueden crear su propia inscripción (auto-matrícula)
create policy "Usuarios se inscriben"
  on public.enrollments for insert
  with check (auth.uid() = user_id);

-- Usuarios actualizan su propia inscripción (progreso, estado)
create policy "Usuarios actualizan sus inscripciones"
  on public.enrollments for update
  using (auth.uid() = user_id);

-- Usuarios ven su propio progreso
create policy "Usuarios ven su progreso"
  on public.lesson_progress for select
  using (auth.uid() = user_id);

-- Usuarios insertan su propio progreso
create policy "Usuarios registran su progreso"
  on public.lesson_progress for insert
  with check (auth.uid() = user_id);

-- Usuarios actualizan su propio progreso
create policy "Usuarios actualizan su progreso"
  on public.lesson_progress for update
  using (auth.uid() = user_id);

-- Usuarios ven sus certificados
create policy "Usuarios ven sus certificados"
  on public.certificates for select
  using (auth.uid() = user_id);

-- Usuarios ven sus órdenes
create policy "Usuarios ven sus órdenes"
  on public.orders for select
  using (auth.uid() = user_id);

-- Usuarios pueden crear su propia orden (auto-compra desde React)
create policy "Usuarios crean órdenes"
  on public.orders for insert
  with check (auth.uid() = user_id);


-- 12. FUNCIONES ÚTILES
-- ===============================================================

-- Actualizar progreso del alumno en un curso
create or replace function public.calculate_course_progress(
  p_user_id uuid,
  p_course_id uuid
)
returns integer
language plpgsql
security definer
as $$
declare
  total_lessons integer;
  completed_lessons integer;
  progress_pct integer;
begin
  select count(*) into total_lessons
  from public.lessons l
  join public.modules m on m.id = l.module_id
  where m.course_id = p_course_id;

  select count(*) into completed_lessons
  from public.lesson_progress lp
  join public.lessons l on l.id = lp.lesson_id
  join public.modules m on m.id = l.module_id
  where lp.user_id = p_user_id
    and m.course_id = p_course_id
    and lp.completed = true;

  if total_lessons = 0 then
    return 0;
  end if;

  progress_pct := (completed_lessons * 100) / total_lessons;

  update public.enrollments
  set progress = progress_pct,
      completed_at = case when progress_pct = 100 then now() else completed_at end,
      status = case when progress_pct = 100 then 'completed'::enrollment_status else status end
  where user_id = p_user_id and course_id = p_course_id;

  return progress_pct;
end;
$$;


-- 13. ÍNDICES
-- ===============================================================
create index if not exists idx_courses_slug on public.courses(slug);
create index if not exists idx_courses_published on public.courses(is_published);
create index if not exists idx_modules_course on public.modules(course_id, sort_order);
create index if not exists idx_lessons_module on public.lessons(module_id, sort_order);
create index if not exists idx_enrollments_user on public.enrollments(user_id);
create index if not exists idx_enrollments_course on public.enrollments(course_id);
create index if not exists idx_lesson_progress_user on public.lesson_progress(user_id);
create index if not exists idx_certificates_user on public.certificates(user_id);
create index if not exists idx_orders_user on public.orders(user_id);
