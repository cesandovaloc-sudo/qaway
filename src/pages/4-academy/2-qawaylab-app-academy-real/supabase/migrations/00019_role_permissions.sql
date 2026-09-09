-- Qaway Lab - Role Permissions System
-- Migration 00019
-- ============================================================

-- 1. Create role_permissions table
create table if not exists public.role_permissions (
  id uuid primary key default gen_random_uuid(),
  role text not null,
  action text not null,
  allowed boolean not null default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(role, action)
);

-- 2. Indexes
create index if not exists idx_role_permissions_role on public.role_permissions(role);
create index if not exists idx_role_permissions_action on public.role_permissions(action);

-- 3. Auto-update trigger
create trigger set_role_permissions_updated_at
  before update on public.role_permissions
  for each row execute function public.handle_updated_at();

-- 4. Seed permissions matrix
-- Actions: view_courses, create_courses, edit_courses, publish_courses,
--          archive_courses, manage_users, view_reports, manage_roles
-- Roles: admin, teacher, editor, support, student

insert into public.role_permissions (role, action, allowed) values
  -- Admin (full access)
  ('admin', 'view_courses', true),
  ('admin', 'create_courses', true),
  ('admin', 'edit_courses', true),
  ('admin', 'publish_courses', true),
  ('admin', 'archive_courses', true),
  ('admin', 'manage_users', true),
  ('admin', 'view_reports', true),
  ('admin', 'manage_roles', true),

  -- Teacher (course management + reports)
  ('teacher', 'view_courses', true),
  ('teacher', 'create_courses', true),
  ('teacher', 'edit_courses', true),
  ('teacher', 'publish_courses', false),
  ('teacher', 'archive_courses', false),
  ('teacher', 'manage_users', false),
  ('teacher', 'view_reports', true),
  ('teacher', 'manage_roles', false),

  -- Editor (content creation only, no publishing)
  ('editor', 'view_courses', true),
  ('editor', 'create_courses', true),
  ('editor', 'edit_courses', true),
  ('editor', 'publish_courses', false),
  ('editor', 'archive_courses', false),
  ('editor', 'manage_users', false),
  ('editor', 'view_reports', false),
  ('editor', 'manage_roles', false),

  -- Support (user management only)
  ('support', 'view_courses', false),
  ('support', 'create_courses', false),
  ('support', 'edit_courses', false),
  ('support', 'publish_courses', false),
  ('support', 'archive_courses', false),
  ('support', 'manage_users', true),
  ('support', 'view_reports', false),
  ('support', 'manage_roles', false),

  -- Student (consume courses only)
  ('student', 'view_courses', true),
  ('student', 'create_courses', false),
  ('student', 'edit_courses', false),
  ('student', 'publish_courses', false),
  ('student', 'archive_courses', false),
  ('student', 'manage_users', false),
  ('student', 'view_reports', false),
  ('student', 'manage_roles', false)
on conflict (role, action) do nothing;

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.role_permissions enable row level security;

-- Anyone authenticated can read permissions (for frontend checks)
create policy "Authenticated users can read permissions"
  on public.role_permissions for select
  using (auth.role() = 'authenticated');

-- Only admin can manage permissions
create policy "Admin can manage permissions"
  on public.role_permissions for all
  using (public.get_user_role() = 'admin')
  with check (public.get_user_role() = 'admin');
