-- Qaway Academy - Storage Buckets for Resources & Certificates
-- Migration 00010
-- ============================================================
-- Crea buckets de almacenamiento para archivos subidos por
-- docentes/administradores (resources) y certificados PDF
-- generados automáticamente (certificates).
-- ============================================================

-- ============================================================
-- Helper: Check if bucket exists
-- ============================================================
create or replace function public.bucket_exists(bucket_name text)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from storage.buckets where name = bucket_name
  );
end;
$$;

-- ============================================================
-- 1. Bucket: resources (público lectura, escritura solo auth)
-- ============================================================
do $$
begin
  if not public.bucket_exists('resources') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'resources',
      'resources',
      true,                          -- public read
      52428800,                      -- 50 MB file size limit
      array[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'application/zip',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'text/plain',
        'text/csv'
      ]
    );
  end if;
end;
$$;

-- RLS policies for storage.objects in resources bucket

-- Teachers can upload files to their courses
create policy "Teachers can upload resources"
  on storage.objects for insert
  with check (
    bucket_id = 'resources'
    and exists (
      select 1 from public.courses c
      where c.instructor_id = auth.uid()
        and (storage.foldername(name))[1] = c.id::text
    )
  );

-- Teachers can update/delete their own files
create policy "Teachers can manage their resources"
  on storage.objects for all
  using (
    bucket_id = 'resources'
    and exists (
      select 1 from public.courses c
      where c.instructor_id = auth.uid()
        and (storage.foldername(name))[1] = c.id::text
    )
  );

-- Admin can manage all files
create policy "Admin can manage all resources"
  on storage.objects for all
  using (
    bucket_id = 'resources'
    and public.get_user_role() = 'admin'
  );

-- Anyone can read (public bucket)
create policy "Anyone can read resources"
  on storage.objects for select
  using (bucket_id = 'resources');

-- ============================================================
-- 2. Bucket: certificates (público lectura, solo servidor escribe)
-- ============================================================
do $$
begin
  if not public.bucket_exists('certificates') then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values (
      'certificates',
      'certificates',
      true,                          -- public read (for download)
      10485760,                      -- 10 MB
      array['application/pdf']
    );
  end if;
end;
$$;

-- Only admin/service can write certificates
create policy "Admin can manage certificates"
  on storage.objects for all
  using (
    bucket_id = 'certificates'
    and public.get_user_role() = 'admin'
  );

-- Student can read their own certificate
create policy "Student can read their certificates"
  on storage.objects for select
  using (
    bucket_id = 'certificates'
    and exists (
      select 1 from public.certificates c
      where c.student_id = auth.uid()
        and c.certificate_url like '%' || name
    )
  );

-- Drop helper
drop function if exists public.bucket_exists;
