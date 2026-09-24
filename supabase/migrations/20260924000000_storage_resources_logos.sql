-- Bucket público de recursos (logos de empresas) + politicas.
-- Onboarding sube logos a resources/logos/<tenant_id>/logo.webp (convertidos en cliente).
create table if not exists _check (
  id serial primary key
);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
select 'resources', 'resources', true, 2097152, array['image/png', 'image/jpeg', 'image/webp']
where not exists (select 1 from storage.buckets where id = 'resources');

drop policy if exists "resources_public_select" on storage.objects;
create policy "resources_public_select" on storage.objects
  for select using (bucket_id = 'resources');

drop policy if exists "resources_auth_insert_logos" on storage.objects;
create policy "resources_auth_insert_logos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'resources' and (storage.foldername(name))[1] = 'logos');

drop policy if exists "resources_auth_update_logos" on storage.objects;
create policy "resources_auth_update_logos" on storage.objects
  for update to authenticated
  using (bucket_id = 'resources' and (storage.foldername(name))[1] = 'logos');

drop policy if exists "resources_auth_delete_logos" on storage.objects;
create policy "resources_auth_delete_logos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'resources' and (storage.foldername(name))[1] = 'logos');

drop table if exists _check;