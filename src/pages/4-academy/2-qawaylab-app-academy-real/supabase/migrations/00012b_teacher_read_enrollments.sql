-- Migration 00012: Teacher can read enrollments of own courses
-- Fix: missing RLS policy was causing Alumnos count to show 0

create policy "Teacher can read own course enrollments"
  on public.enrollments for select
  using (exists (
    select 1 from public.courses
    where id = course_id and instructor_id = auth.uid()
  ));
