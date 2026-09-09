-- Qaway Academy - Row Level Security Policies
-- Migration 00002

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.resources enable row level security;
alter table public.tasks enable row level security;
alter table public.submissions enable row level security;
alter table public.enrollments enable row level security;
alter table public.progress enable row level security;
alter table public.certificates enable row level security;
alter table public.payments enable row level security;
alter table public.activity_logs enable row level security;

-- ============================================
-- PROFILES
-- ============================================
-- Users can read their own profile
create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Admin can read all profiles
create policy "Admin can read all profiles"
  on public.profiles for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Users can update own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Admin can update any profile
create policy "Admin can update any profile"
  on public.profiles for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- COURSES
-- ============================================
-- Anyone can read published courses
create policy "Anyone can read published courses"
  on public.courses for select
  using (status = 'published');

-- Teacher can read own courses (including drafts)
create policy "Teacher can read own courses"
  on public.courses for select
  using (instructor_id = auth.uid());

-- Admin can read all courses
create policy "Admin can read all courses"
  on public.courses for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Teachers can create courses
create policy "Teacher can create courses"
  on public.courses for insert
  with check (
    instructor_id = auth.uid()
    and exists (select 1 from public.profiles where id = auth.uid() and role in ('teacher', 'admin'))
  );

-- Admin can create courses
create policy "Admin can create courses"
  on public.courses for insert
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Teachers can update own courses
create policy "Teacher can update own courses"
  on public.courses for update
  using (instructor_id = auth.uid())
  with check (instructor_id = auth.uid());

-- Admin can update any course
create policy "Admin can update any course"
  on public.courses for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Admin can delete/archive courses
create policy "Admin can delete courses"
  on public.courses for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- MODULES
-- ============================================
-- Anyone can read modules of published courses
create policy "Anyone can read published modules"
  on public.modules for select
  using (exists (select 1 from public.courses where id = course_id and status = 'published'));

-- Teacher can read own course modules
create policy "Teacher can read own modules"
  on public.modules for select
  using (exists (select 1 from public.courses where id = course_id and instructor_id = auth.uid()));

-- Admin can read all modules
create policy "Admin can read all modules"
  on public.modules for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Teacher can manage own course modules
create policy "Teacher can manage own modules"
  on public.modules for insert
  with check (exists (select 1 from public.courses where id = course_id and instructor_id = auth.uid()));

create policy "Teacher can update own modules"
  on public.modules for update
  using (exists (select 1 from public.courses where id = course_id and instructor_id = auth.uid()));

-- Admin can manage all modules
create policy "Admin can manage modules"
  on public.modules for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- LESSONS (same pattern as modules)
-- ============================================
create policy "Anyone can read published lessons"
  on public.lessons for select
  using (exists (
    select 1 from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = module_id and c.status = 'published'
  ));

create policy "Teacher can read own lessons"
  on public.lessons for select
  using (exists (
    select 1 from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = module_id and c.instructor_id = auth.uid()
  ));

create policy "Admin can read all lessons"
  on public.lessons for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Teacher can manage own lessons"
  on public.lessons for all
  using (exists (
    select 1 from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = module_id and c.instructor_id = auth.uid()
  ));

create policy "Admin can manage lessons"
  on public.lessons for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- ENROLLMENTS
-- ============================================
-- Students can read own enrollments
create policy "Student can read own enrollments"
  on public.enrollments for select
  using (student_id = auth.uid());

-- Admin can read all enrollments
create policy "Admin can read all enrollments"
  on public.enrollments for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Students can enroll themselves (only after payment for paid courses)
create policy "Student can enroll"
  on public.enrollments for insert
  with check (student_id = auth.uid());

-- Admin can manage enrollments
create policy "Admin can manage enrollments"
  on public.enrollments for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- PROGRESS
-- ============================================
-- Students can read own progress
create policy "Student can read own progress"
  on public.progress for select
  using (student_id = auth.uid());

-- Students can update own progress
create policy "Student can update own progress"
  on public.progress for insert
  with check (student_id = auth.uid());

create policy "Student can update own progress records"
  on public.progress for update
  using (student_id = auth.uid())
  with check (student_id = auth.uid());

-- Teacher can read progress of students in own courses
create policy "Teacher can read course progress"
  on public.progress for select
  using (exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where l.id = lesson_id and c.instructor_id = auth.uid()
  ));

-- ============================================
-- TASKS & SUBMISSIONS
-- ============================================
-- Students can read tasks for enrolled courses
create policy "Student can read tasks"
  on public.tasks for select
  using (exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.enrollments e on e.course_id = m.course_id
    where l.id = lesson_id and e.student_id = auth.uid()
  ));

-- Students can create and read own submissions
create policy "Student can read own submissions"
  on public.submissions for select
  using (student_id = auth.uid());

create policy "Student can create submissions"
  on public.submissions for insert
  with check (student_id = auth.uid());

-- Teacher can read submissions for own courses
create policy "Teacher can read course submissions"
  on public.submissions for select
  using (exists (
    select 1 from public.tasks t
    join public.lessons l on l.id = t.lesson_id
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where t.id = task_id and c.instructor_id = auth.uid()
  ));

-- Teacher can review submissions
create policy "Teacher can review submissions"
  on public.submissions for update
  using (exists (
    select 1 from public.tasks t
    join public.lessons l on l.id = t.lesson_id
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where t.id = task_id and c.instructor_id = auth.uid()
  ));

-- ============================================
-- CERTIFICATES
-- ============================================
-- Students can read own certificates
create policy "Student can read own certificates"
  on public.certificates for select
  using (student_id = auth.uid());

-- Admin can manage certificates
create policy "Admin can manage certificates"
  on public.certificates for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ============================================
-- PAYMENTS
-- ============================================
-- Students can read own payments
create policy "Student can read own payments"
  on public.payments for select
  using (student_id = auth.uid());

-- Admin can read all payments
create policy "Admin can read all payments"
  on public.payments for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- System can create payments
create policy "System can create payments"
  on public.payments for insert
  with check (auth.uid() = student_id);

-- ============================================
-- ACTIVITY LOGS
-- ============================================
-- Admin can read all logs
create policy "Admin can read activity logs"
  on public.activity_logs for select
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- System can create logs
create policy "System can create logs"
  on public.activity_logs for insert
  with check (auth.uid() = user_id);
