-- Qaway Academy - Initial Database Schema
-- Migration 00001

-- 1. Profiles (extends auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  avatar_url text,
  role text not null default 'student' check (role in ('student', 'teacher', 'editor', 'support', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Courses
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  description text,
  short_description text,
  instructor_id uuid references public.profiles(id) on delete set null,
  category text,
  level text check (level in ('Principiante', 'Intermedio', 'Avanzado')),
  duration text,
  price decimal(10,2) default 0,
  is_free boolean default false,
  image_url text,
  status text not null default 'draft' check (status in ('draft', 'review', 'published', 'archived')),
  featured boolean default false,
  what_you_learn jsonb default '[]',
  requirements jsonb default '[]',
  target_audience jsonb default '[]',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 3. Modules
create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references public.courses(id) on delete cascade not null,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 4. Lessons
create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid references public.modules(id) on delete cascade not null,
  title text not null,
  content text,
  video_url text,
  duration text,
  sort_order integer not null default 0,
  status text not null default 'draft' check (status in ('draft', 'review', 'published')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 5. Resources (per lesson)
create table public.resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade,
  course_id uuid references public.courses(id) on delete cascade,
  title text not null,
  type text not null check (type in ('PDF', 'Video', 'Enlace', 'Ejercicio', 'Plantilla', 'Archivo')),
  file_url text,
  file_size text,
  is_global boolean default false,
  created_at timestamptz default now()
);

-- 6. Tasks (assignments per lesson)
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  title text not null,
  description text,
  due_days integer,
  created_at timestamptz default now()
);

-- 7. Submissions (student task submissions)
create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  task_id uuid references public.tasks(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  file_url text,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'reviewed', 'approved', 'returned')),
  grade text,
  feedback text,
  submitted_at timestamptz default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles(id)
);

-- 8. Enrollments
create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  status text not null default 'active' check (status in ('active', 'completed', 'cancelled')),
  enrolled_at timestamptz default now(),
  completed_at timestamptz,
  unique(student_id, course_id)
);

-- 9. Progress (lesson completion tracking)
create table public.progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(student_id, lesson_id)
);

-- 10. Certificates
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  certificate_url text,
  issued_at timestamptz default now(),
  unique(student_id, course_id)
);

-- 11. Payments
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references public.profiles(id) on delete cascade not null,
  course_id uuid references public.courses(id) on delete cascade not null,
  amount decimal(10,2) not null,
  currency text default 'USD',
  status text not null default 'pending' check (status in ('pending', 'completed', 'failed', 'refunded')),
  provider text default 'woocommerce',
  provider_id text,
  created_at timestamptz default now()
);

-- 12. Activity Log
create table public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Indexes
create index idx_courses_slug on public.courses(slug);
create index idx_courses_status on public.courses(status);
create index idx_modules_course on public.modules(course_id);
create index idx_lessons_module on public.lessons(module_id);
create index idx_resources_lesson on public.resources(lesson_id);
create index idx_enrollments_student on public.enrollments(student_id);
create index idx_enrollments_course on public.enrollments(course_id);
create index idx_progress_student on public.progress(student_id);
create index idx_progress_lesson on public.progress(lesson_id);
create index idx_submissions_task on public.submissions(task_id);
create index idx_submissions_student on public.submissions(student_id);
create index idx_certificates_student on public.certificates(student_id);
create index idx_payments_student on public.payments(student_id);
create index idx_activity_user on public.activity_logs(user_id);

-- Auto-update updated_at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_courses_updated_at
  before update on public.courses
  for each row execute function public.handle_updated_at();

create trigger set_modules_updated_at
  before update on public.modules
  for each row execute function public.handle_updated_at();

create trigger set_lessons_updated_at
  before update on public.lessons
  for each row execute function public.handle_updated_at();

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    'student'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
