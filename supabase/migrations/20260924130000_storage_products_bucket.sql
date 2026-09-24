-- Bucket de storage 'products' para imágenes de producto del módulo
-- inventario (pendiente en la consolidación 20260924120000).
-- ADITIVO e IDEMPOTENTE: no toca buckets existentes.

insert into storage.buckets (id, name, public, file_size_limit)
values ('products', 'products', true, 10485760)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

drop policy if exists "products_public_read" on storage.objects;
create policy "products_public_read" on storage.objects for select
  using (bucket_id = 'products');

drop policy if exists "products_authenticated_insert" on storage.objects;
create policy "products_authenticated_insert" on storage.objects for insert
  with check (bucket_id = 'products' and auth.role() = 'authenticated');