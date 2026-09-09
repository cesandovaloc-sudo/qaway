-- Qaway Lab - Categories table
-- Migration 00014
-- Unified category system for both Academy and Web
-- ============================================================

-- 1. Create categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text default '',
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Seed base categories
insert into public.categories (name, slug, description, sort_order) values
  ('Inteligencia Artificial', 'inteligencia-artificial', 'Cursos sobre IA aplicada, machine learning y herramientas cognitivas', 1),
  ('Productividad', 'productividad', 'Cursos para optimizar tiempo, procesos y organización personal y empresarial', 2),
  ('Marketing', 'marketing', 'Cursos de marketing digital, redes sociales, branding y comunicación', 3),
  ('Diseño', 'diseno', 'Cursos de diseño gráfico, UX/UI, identidad visual y herramientas creativas', 4),
  ('Automatización', 'automatizacion', 'Cursos sobre automatización de procesos, workflows y herramientas no-code', 5),
  ('Desarrollo', 'desarrollo', 'Cursos de programación, desarrollo web y tecnologías digitales', 6)
on conflict (name) do nothing;

-- 3. Indexes
create index if not exists idx_categories_slug on public.categories(slug);
create index if not exists idx_categories_sort on public.categories(sort_order);
create index if not exists idx_categories_active on public.categories(is_active);

-- 4. Auto-update trigger
create trigger set_categories_updated_at
  before update on public.categories
  for each row execute function public.handle_updated_at();

-- ============================================
-- RLS POLICIES
-- ============================================
alter table public.categories enable row level security;

-- Anyone can read active categories
create policy "Anyone can read categories"
  on public.categories for select
  using (true);

-- Admin can manage all categories
create policy "Admin manage categories"
  on public.categories for all
  using (public.get_user_role() = 'admin')
  with check (public.get_user_role() = 'admin');
