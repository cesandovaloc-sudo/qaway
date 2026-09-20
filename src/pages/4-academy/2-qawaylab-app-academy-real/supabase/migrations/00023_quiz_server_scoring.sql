-- 00023 Quiz scoring servidor + progreso con enrollment (run-2)
-- La app enviaba score calculado en cliente y marcaba progreso libre.
-- Trigger SECURITY DEFINER recalifica desde correct_index (el cliente
-- ya no decide la nota) y exige enrollment para marcar progreso.
-- Auditoría run-2, 2026-09-20. Idempotente.

-- ─── 1. Recalificar intentos en servidor ───
create or replace function public.grade_quiz_attempt()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total int;
  v_ok int;
begin
  select count(*) into v_total from public.quiz_questions where quiz_id = new.quiz_id;
  if coalesce(v_total, 0) = 0 then
    new.score := 0;
    return new;
  end if;
  select count(*) into v_ok
  from public.quiz_questions q
  where q.quiz_id = new.quiz_id
    and exists (
      select 1 from jsonb_array_elements(coalesce(new.answers, '[]'::jsonb)) a
      where (a->>'question_id') = q.id::text
        and (a->>'selected_index')::int = q.correct_index
    );
  new.score := round((v_ok::numeric / v_total::numeric) * 100)::int;
  new.student_id := coalesce(new.student_id, auth.uid());
  return new;
end;
$$;

drop trigger if exists quiz_attempts_grade on public.quiz_attempts;
create trigger quiz_attempts_grade
  before insert or update on public.quiz_attempts
  for each row execute function public.grade_quiz_attempt();

-- ─── 2. Progreso solo con enrollment (o curso gratis, instructor, admin) ───
create or replace function public.require_enrollment_for_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course uuid;
  v_free boolean;
begin
  select c.id, c.is_free into v_course, v_free
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where l.id = new.lesson_id;
  if v_course is null then
    raise exception 'Leccion inexistente';
  end if;
  if v_free then
    return new;
  end if;
  if exists (
    select 1 from public.enrollments e
    where e.course_id = v_course and e.student_id = new.student_id
      and e.status in ('active', 'completed')
  ) then
    return new;
  end if;
  if exists (
    select 1 from public.courses c
    where c.id = v_course and c.instructor_id = auth.uid()
  ) then
    return new;
  end if;
  if exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin') then
    return new;
  end if;
  raise exception 'Requiere inscripcion activa';
end;
$$;

drop trigger if exists progress_require_enrollment on public.progress;
create trigger progress_require_enrollment
  before insert or update on public.progress
  for each row execute function public.require_enrollment_for_progress();
