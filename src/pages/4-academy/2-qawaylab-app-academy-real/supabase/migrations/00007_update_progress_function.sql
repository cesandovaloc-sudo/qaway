-- Qaway Academy - Update Progress Function
-- Migration 00007
-- Server-side validation: only accepts increasing seconds_watched
-- COMPLETION_THRESHOLD = 0.95
-- ============================================================

create or replace function public.update_lesson_progress(
  p_student_id uuid,
  p_lesson_id uuid,
  p_current_time int,
  p_duration int
) returns jsonb
language plpgsql
security definer
as $$
declare
  v_existing_seconds int;
  v_existing_completed boolean;
  v_new_seconds int;
  v_new_completed boolean;
  v_progress_pct float;
  v_result jsonb;
begin
  -- Read current progress
  select seconds_watched, coalesce(completed, false)
  into v_existing_seconds, v_existing_completed
  from public.progress
  where student_id = p_student_id and lesson_id = p_lesson_id;

  -- If already completed, return early (no changes needed)
  if v_existing_completed then
    return jsonb_build_object(
      'updated', false,
      'completed', true,
      'seconds_watched', v_existing_seconds,
      'reason', 'already_completed'
    );
  end if;

  -- VALIDATION: only accept if current_time > stored seconds_watched
  -- This prevents skipping forward without actually watching
  if v_existing_seconds is not null and p_current_time <= v_existing_seconds then
    return jsonb_build_object(
      'updated', false,
      'completed', false,
      'seconds_watched', v_existing_seconds,
      'reason', 'not_monotonic'
    );
  end if;

  -- Calculate progress percentage
  v_progress_pct := case when p_duration > 0 then p_current_time::float / p_duration else 0 end;

  -- Determine if completed (threshold >= 0.95 = 95%)
  v_new_completed := v_progress_pct >= 0.95;

  -- Upsert progress
  insert into public.progress (student_id, lesson_id, seconds_watched, total_watch_time, last_position, completed, completed_at, updated_at)
  values (
    p_student_id,
    p_lesson_id,
    p_current_time,
    p_current_time,
    p_current_time,
    v_new_completed,
    case when v_new_completed then now() else null end,
    now()
  )
  on conflict (student_id, lesson_id) do update set
    seconds_watched = p_current_time,
    total_watch_time = public.progress.total_watch_time + (p_current_time - coalesce(v_existing_seconds, 0)),
    last_position = p_current_time,
    completed = case when v_new_completed then true else public.progress.completed end,
    completed_at = case when v_new_completed and not public.progress.completed then now() else public.progress.completed_at end,
    updated_at = now();

  return jsonb_build_object(
    'updated', true,
    'completed', v_new_completed,
    'seconds_watched', p_current_time,
    'progress_pct', round((v_progress_pct * 100)::numeric, 1),
    'reason', case when v_new_completed then 'completed_95' else 'in_progress' end
  );
end;
$$;
