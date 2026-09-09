-- Qaway Academy - RLS Policies for Resources
-- Migration 00009
-- ============================================================
-- PROBLEMA: resources tenía RLS habilitado pero sin policies.
-- Esto bloqueaba todos los SELECT (incluyendo estudiantes
-- que querían ver recursos de sus cursos).
-- ============================================================

-- 1. Students can read resources of courses they are enrolled in
create policy "Student can read enrolled resources"
  on public.resources for select
  using (exists (
    select 1 from public.enrollments e
    where e.course_id = resources.course_id
      and e.student_id = auth.uid()
      and e.status in ('active', 'completed')
  ));

-- 2. Anyone can read global resources (not tied to a specific course)
create policy "Anyone can read global resources"
  on public.resources for select
  using (is_global = true);

-- 3. Teachers can manage resources of their own courses
create policy "Teacher can manage own resources"
  on public.resources for all
  using (exists (
    select 1 from public.courses c
    where c.id = resources.course_id
      and c.instructor_id = auth.uid()
  ));

-- 4. Admin can manage all resources
create policy "Admin can manage resources"
  on public.resources for all
  using (public.get_user_role() = 'admin');
