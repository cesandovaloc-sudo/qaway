-- Bucket de storage 'avatars' para las fotos de perfil de Mi cuenta (30.X).
-- Causa: el upload del shell (HubPanelPage.handleUploadAvatar → avatars/{user_id}.webp)
-- fallaba porque el bucket y sus políticas no existían en el proyecto remoto.
-- ADITIVO e IDEMPOTENTE: no toca buckets existentes (mismo patrón que 20260924130000).
-- Seguridad: lectura pública, escritura SOLO en el archivo propio avatars/{auth.uid()}.*,
-- límite 2 MB y solo imágenes (el cliente ya comprime a WebP <200 KB vía optimizeAvatar).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'avatars',
  'avatars',
  true,
  2097152, -- 2 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = true,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Nota: no se emite ALTER TABLE ... ENABLE ROW LEVEL SECURITY sobre storage.objects:
-- la tabla pertenece al rol de plataforma (supabase_storage_admin) y RLS ya está activo
-- por defecto en todo proyecto Supabase. Emitirlo falla con SQLSTATE 42501.

-- Lectura pública: cualquier visitante ve las fotos de perfil (URLs públicas).
drop policy if exists "avatars_public_read" on storage.objects;
create policy "avatars_public_read"
  on storage.objects for select
  using (bucket_id = 'avatars');

-- Escritura: solo tu propio archivo. La ruta del código es avatars/{selfId}.webp.
drop policy if exists "avatars_user_insert" on storage.objects;
create policy "avatars_user_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars' and
    (name = 'avatars/' || auth.uid()::text || '.webp' or name like 'avatars/' || auth.uid()::text || '.%')
  );

-- Reemplazo (upsert con upsert:true) de tu propia foto.
drop policy if exists "avatars_user_update" on storage.objects;
create policy "avatars_user_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars' and
    (name = 'avatars/' || auth.uid()::text || '.webp' or name like 'avatars/' || auth.uid()::text || '.%')
  );

-- Eliminación: botón "Eliminar" de Mi cuenta sobre tu propia foto.
drop policy if exists "avatars_user_delete" on storage.objects;
create policy "avatars_user_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars' and
    (name = 'avatars/' || auth.uid()::text || '.webp' or name like 'avatars/' || auth.uid()::text || '.%')
  );
