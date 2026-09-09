-- Qaway Academy - Quizzes System
-- Migration 00013

-- 1. Quizzes (one per lesson)
create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid references public.lessons(id) on delete cascade not null,
  title text not null default 'Quiz de la lección',
  passing_score integer not null default 70,
  max_attempts integer not null default 0, -- 0 = ilimitado
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(lesson_id)
);

-- 2. Quiz questions
create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  question text not null,
  options jsonb not null, -- ["Opción A", "Opción B", "Opción C", "Opción D"]
  correct_index integer not null, -- índice de la respuesta correcta (0-based)
  explanation text, -- se muestra después de responder
  sort_order integer not null default 0,
  created_at timestamptz default now()
);

-- 3. Quiz attempts (student progress)
create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid references public.quizzes(id) on delete cascade not null,
  student_id uuid references public.profiles(id) on delete cascade not null,
  score integer not null, -- porcentaje 0-100
  answers jsonb not null default '[]', -- [{question_id, selected_index, correct}]
  completed boolean not null default false,
  attempted_at timestamptz default now()
);

-- Indexes
create index idx_quizzes_lesson on public.quizzes(lesson_id);
create index idx_quiz_questions_quiz on public.quiz_questions(quiz_id);
create index idx_quiz_attempts_quiz on public.quiz_attempts(quiz_id);
create index idx_quiz_attempts_student on public.quiz_attempts(student_id);

-- Auto-update updated_at for quizzes
create trigger set_quizzes_updated_at
  before update on public.quizzes
  for each row execute function public.handle_updated_at();

-- RLS Policies
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;

-- Everyone can read quizzes and questions (for their courses)
create policy "Anyone can read quizzes"
  on public.quizzes for select
  using (true);

create policy "Anyone can read quiz questions"
  on public.quiz_questions for select
  using (true);

-- Teachers can manage quizzes for their lessons
create policy "Teachers can manage quizzes"
  on public.quizzes for all
  using (exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where l.id = lesson_id and c.instructor_id = auth.uid()
  ));

create policy "Teachers can manage quiz questions"
  on public.quiz_questions for all
  using (exists (
    select 1 from public.quizzes q
    join public.lessons l on l.id = q.lesson_id
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where q.id = quiz_id and c.instructor_id = auth.uid()
  ));

-- Students can manage their own attempts
create policy "Students can manage own attempts"
  on public.quiz_attempts for all
  using (student_id = auth.uid());
