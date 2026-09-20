-- ============================================================
-- Blog posts RLS (run-2 H9): cerrar lectura de borradores
-- posts no tenía RLS versionado: anon leía/escribía todo,
-- incluidos borradores. Ahora: anon solo 'publicado'.
-- NOTA: escrituras anon se preservan temporalmente porque el
-- editor aún no tiene login Supabase (pendiente: login + rol
-- editor y cerrarlas a authenticated). No empeora nada actual.
-- Auditoría run-2, 2026-09-20. Idempotente.
-- ============================================================
do $$
begin
  if exists (select 1 from information_schema.tables where table_schema = 'public' and table_name = 'posts') then
    execute 'alter table public.posts enable row level security';

    execute 'drop policy if exists "posts_public_read" on public.posts;';
    execute 'create policy "posts_public_read" on public.posts for select using (status = ''publicado'');';

    execute 'drop policy if exists "posts_staff_all" on public.posts;';
    execute 'create policy "posts_staff_all" on public.posts for all using (auth.role() = ''authenticated'') with check (auth.role() = ''authenticated'');';

    -- Compatibilidad editor sin login (TEMPORAL, pendiente login editor):
    execute 'drop policy if exists "posts_anon_write_legacy" on public.posts;';
    execute 'create policy "posts_anon_write_legacy" on public.posts for insert with check (true);';
    execute 'drop policy if exists "posts_anon_update_legacy" on public.posts;';
    execute 'create policy "posts_anon_update_legacy" on public.posts for update using (true) with check (true);';
    execute 'drop policy if exists "posts_anon_delete_legacy" on public.posts;';
    execute 'create policy "posts_anon_delete_legacy" on public.posts for delete using (true);';

    execute 'grant select on public.posts to anon;';
    execute 'grant all on public.posts to authenticated;';
    raise notice 'posts: RLS aplicado (lectura publica solo publicado).';
  else
    raise notice 'posts no existe (saltando).';
  end if;
end $$;
