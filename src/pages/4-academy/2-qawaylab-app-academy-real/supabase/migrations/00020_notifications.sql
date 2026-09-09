-- Qaway Academy - Notifications System
-- Migration 00020

-- 1. Notifications (per user)
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null default 'system' check (type in ('task', 'offer', 'system')),
  title text not null,
  message text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz default now()
);

-- Indexes
create index idx_notifications_user on public.notifications(user_id, created_at desc);
create index idx_notifications_unread on public.notifications(user_id) where is_read = false;

-- RLS Policies
alter table public.notifications enable row level security;

-- Cada usuario solo puede ver y actualizar sus propias notificaciones
create policy "Users can read own notifications"
  on public.notifications for select
  using (user_id = auth.uid());

create policy "Users can update own notifications"
  on public.notifications for update
  using (user_id = auth.uid());

-- 2. Realtime: el frontend recibe notificaciones al instante
alter publication supabase_realtime add table public.notifications;

-- 3. Trigger: al crear una tarea, notificar a los estudiantes inscritos en el curso
create or replace function public.notify_task_created()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_course_id uuid;
  v_course_title text;
  v_course_slug text;
begin
  select m.course_id, c.title, c.slug
    into v_course_id, v_course_title, v_course_slug
  from public.lessons l
  join public.modules m on m.id = l.module_id
  join public.courses c on c.id = m.course_id
  where l.id = new.lesson_id;

  if v_course_id is null then
    return new;
  end if;

  insert into public.notifications (user_id, type, title, message, link)
  select e.student_id, 'task', 'Nueva tarea asignada',
         'Se asignó la tarea "' || new.title || '" en el curso ' || v_course_title,
         '/panel/cursos/' || v_course_slug
  from public.enrollments e
  where e.course_id = v_course_id
    and e.status = 'active';

  return new;
end;
$$;

create trigger trg_notify_task_created
  after insert on public.tasks
  for each row execute function public.notify_task_created();
