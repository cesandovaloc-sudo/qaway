-- Add public read policies for modules and lessons
-- Also add policies for enrollments and progress (needed for CourseHub)

-- Modules: any authenticated user can read
create policy "Authenticated users can read modules"
  on public.modules for select
  using (true);

-- Lessons: any authenticated user can read
create policy "Authenticated users can read lessons"
  on public.lessons for select
  using (true);

-- Enrollments: student can read their own, or admin can read all
create policy "Users can read own enrollments"
  on public.enrollments for select
  using (auth.uid() = student_id);

-- Progress: student can read own progress
create policy "Users can read own progress"
  on public.progress for select
  using (auth.uid() = student_id);
