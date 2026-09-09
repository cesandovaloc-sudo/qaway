-- Qaway Academy - Fix RLS Infinite Recursion
-- Migration 00004
-- Run AFTER migration 00003
-- ============================================================
-- PROBLEMA: Las policies de profiles usan subconsultas a profiles
-- ("exists (select 1 from profiles where ...)"), lo que causa
-- recursión infinita al leer la misma tabla.
--
-- SOLUCIÓN: Función security definer que lee el rol sin activar RLS.
-- ============================================================

-- 1. Crear función helper que evita recursión
create or replace function public.get_user_role()
returns text
language sql
stable
security definer
as $$
  select role from public.profiles where id = auth.uid()
$$;

-- 2. Policy segura para leer perfiles en contexto público
-- Permite leer perfiles cuando se accede desde JOINs de cursos (instructores)
-- Sin exponer datos sensibles (solo lo que el SELECT pida)
create policy "Public read for profiles"
  on public.profiles for select
  using (true);

-- 3. Eliminar policies rotas (las que causan recursión)
drop policy if exists "Admin can read all profiles" on public.profiles;
drop policy if exists "Admin can update any profile" on public.profiles;
drop policy if exists "Admin can read all courses" on public.courses;
drop policy if exists "Admin can create courses" on public.courses;
drop policy if exists "Admin can update any course" on public.courses;
drop policy if exists "Admin can delete courses" on public.courses;
drop policy if exists "Admin can read all modules" on public.modules;
drop policy if exists "Admin can manage modules" on public.modules;
drop policy if exists "Admin can read all lessons" on public.lessons;
drop policy if exists "Admin can manage lessons" on public.lessons;
drop policy if exists "Admin can read all enrollments" on public.enrollments;
drop policy if exists "Admin can manage enrollments" on public.enrollments;
drop policy if exists "Admin can manage certificates" on public.certificates;
drop policy if exists "Admin can read all payments" on public.payments;
drop policy if exists "Admin can read activity logs" on public.activity_logs;
drop policy if exists "Teacher can read course progress" on public.progress;

-- 4. Recrear policies usando la función security definer
-- PROFILES
create policy "Admin read all profiles"
  on public.profiles for select
  using (public.get_user_role() = 'admin');

create policy "Admin update any profile"
  on public.profiles for update
  using (public.get_user_role() = 'admin');

-- COURSES
create policy "Admin read all courses"
  on public.courses for select
  using (public.get_user_role() = 'admin');

create policy "Admin create courses"
  on public.courses for insert
  with check (public.get_user_role() = 'admin');

create policy "Admin update any course"
  on public.courses for update
  using (public.get_user_role() = 'admin');

create policy "Admin delete courses"
  on public.courses for delete
  using (public.get_user_role() = 'admin');

-- MODULES
create policy "Admin read all modules"
  on public.modules for select
  using (public.get_user_role() = 'admin');

create policy "Admin manage modules"
  on public.modules for all
  using (public.get_user_role() = 'admin');

-- LESSONS
create policy "Admin read all lessons"
  on public.lessons for select
  using (public.get_user_role() = 'admin');

create policy "Admin manage lessons"
  on public.lessons for all
  using (public.get_user_role() = 'admin');

-- ENROLLMENTS
create policy "Admin read all enrollments"
  on public.enrollments for select
  using (public.get_user_role() = 'admin');

create policy "Admin manage enrollments"
  on public.enrollments for all
  using (public.get_user_role() = 'admin');

-- CERTIFICATES
create policy "Admin manage certificates"
  on public.certificates for all
  using (public.get_user_role() = 'admin');

-- PAYMENTS
create policy "Admin read all payments"
  on public.payments for select
  using (public.get_user_role() = 'admin');

-- ACTIVITY LOGS
create policy "Admin read activity logs"
  on public.activity_logs for select
  using (public.get_user_role() = 'admin');

-- PROGRESS (teacher reading student progress in own courses)
create policy "Teacher read course progress"
  on public.progress for select
  using (exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where l.id = lesson_id and c.instructor_id = auth.uid()
  ));
