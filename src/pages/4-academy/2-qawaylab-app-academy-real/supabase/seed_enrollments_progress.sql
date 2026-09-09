-- Qaway Academy - Seed Enrollments + Progress
-- Run this AFTER migrations 00001-00005 and the main seed data (courses, modules, lessons)
-- ============================================================

-- ENROLLMENTS (for popular section — varied counts)
INSERT INTO public.enrollments (student_id, course_id, status) VALUES
  -- Course 1 (desarrollo web): student + teacher
  ('6025d56b-aefe-41b7-b14a-700089eb8879', 'c0000000-0001-0000-0000-000000000001', 'active'),
  ('940192ed-dbfc-4302-ae15-a95c5205b9ba', 'c0000000-0001-0000-0000-000000000001', 'active'),
  -- Course 2 (js avanzado): student
  ('6025d56b-aefe-41b7-b14a-700089eb8879', 'c0000000-0002-0000-0000-000000000002', 'active'),
  -- Course 3 (react): teacher
  ('940192ed-dbfc-4302-ae15-a95c5205b9ba', 'c0000000-0003-0000-0000-000000000003', 'active'),
  -- Course 6 (data science): student + teacher
  ('6025d56b-aefe-41b7-b14a-700089eb8879', 'c0000000-0006-0000-0000-000000000006', 'active'),
  ('940192ed-dbfc-4302-ae15-a95c5205b9ba', 'c0000000-0006-0000-0000-000000000006', 'active')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- PROGRESS (for top-rated section)
INSERT INTO public.progress (student_id, lesson_id, completed, completed_at) VALUES
  -- Student: completed 5 lessons of Course 1
  ('6025d56b-aefe-41b7-b14a-700089eb8879', 'b0000101-0000-0000-0000-000000000001', true, now() - interval '7 days'),
  ('6025d56b-aefe-41b7-b14a-700089eb8879', 'b0000102-0000-0000-0000-000000000001', true, now() - interval '6 days'),
  ('6025d56b-aefe-41b7-b14a-700089eb8879', 'b0000103-0000-0000-0000-000000000001', true, now() - interval '5 days'),
  ('6025d56b-aefe-41b7-b14a-700089eb8879', 'b0000104-0000-0000-0000-000000000001', true, now() - interval '4 days'),
  ('6025d56b-aefe-41b7-b14a-700089eb8879', 'b0000105-0000-0000-0000-000000000001', true, now() - interval '3 days'),
  -- Teacher: completed 3 lessons of Course 3
  ('940192ed-dbfc-4302-ae15-a95c5205b9ba', 'b0000301-0000-0000-0000-000000000001', true, now() - interval '5 days'),
  ('940192ed-dbfc-4302-ae15-a95c5205b9ba', 'b0000302-0000-0000-0000-000000000001', true, now() - interval '4 days'),
  ('940192ed-dbfc-4302-ae15-a95c5205b9ba', 'b0000303-0000-0000-0000-000000000001', true, now() - interval '3 days')
ON CONFLICT (student_id, lesson_id) DO NOTHING;
