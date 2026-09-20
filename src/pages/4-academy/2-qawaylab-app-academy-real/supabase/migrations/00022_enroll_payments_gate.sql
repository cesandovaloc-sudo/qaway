-- 00022 F-06/F-08: cerrar self-enroll + enroll con pago + profiles/modules/lessons
-- F-08: "Student can enroll" permitía auto-inscripción sin pago (comentario
-- decía "only after payment" pero nada lo exigía). Se elimina y la única
-- vía es la RPC enroll_after_payment (gratis o payments completed).
-- F-06: profiles/modules/lessons con USING(true). Se reemplazan por
-- owner/instructor/admin y publicado+inscrito.
-- Auditoría run-1, 2026-09-19. Idempotente.

-- ─── 1. Cerrar self-enroll directo ───
drop policy if exists "Student can enroll" on public.enrollments;

-- ─── 2. RPC: inscripción solo gratis o con pago completado ───
create or replace function public.enroll_after_payment(p_course_id uuid)
returns public.enrollments
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_free boolean;
  v_row public.enrollments%rowtype;
begin
  if v_uid is null then
    raise exception 'Requiere sesion';
  end if;
  select is_free into v_free from public.courses where id = p_course_id;
  if not found then
    raise exception 'Curso no existe';
  end if;
  if not v_free
     and not exists (
       select 1 from public.payments
       where student_id = v_uid and course_id = p_course_id and status = 'completed'
     ) then
    raise exception 'Requiere pago completado';
  end if;
  insert into public.enrollments (student_id, course_id)
  values (v_uid, p_course_id)
  on conflict (student_id, course_id) do nothing;
  select * into v_row from public.enrollments
  where student_id = v_uid and course_id = p_course_id;
  return v_row;
end;
$$;

revoke all on function public.enroll_after_payment(uuid) from anon, public;
grant execute on function public.enroll_after_payment(uuid) to authenticated;

-- ─── 3. profiles: dueño, instructor de sus alumnos o admin ───
drop policy if exists "Public read for profiles" on public.profiles;
create policy "Profiles owner instructor admin" on public.profiles
  for select using (
    auth.uid() = id
    or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
    or exists (
      select 1 from public.enrollments e
      join public.courses c on c.id = e.course_id
      where e.student_id = profiles.id and c.instructor_id = auth.uid()
    )
  );

-- ─── 4. modules/lessons: publicado + (gratis, inscrito, instructor, admin) ───
drop policy if exists "Authenticated users can read modules" on public.modules;
create policy "Modules gated" on public.modules
  for select using (
    exists (
      select 1 from public.courses c
      where c.id = modules.course_id and c.status = 'published'
        and (
          c.is_free
          or c.instructor_id = auth.uid()
          or exists (
            select 1 from public.enrollments e
            where e.course_id = c.id and e.student_id = auth.uid()
              and e.status in ('active', 'completed')
          )
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
        )
    )
  );

drop policy if exists "Authenticated users can read lessons" on public.lessons;
create policy "Lessons gated" on public.lessons
  for select using (
    exists (
      select 1 from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = lessons.module_id and c.status = 'published'
        and (
          c.is_free
          or c.instructor_id = auth.uid()
          or exists (
            select 1 from public.enrollments e
            where e.course_id = c.id and e.student_id = auth.uid()
              and e.status in ('active', 'completed')
          )
          or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
        )
    )
  );
