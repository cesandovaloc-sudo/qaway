-- ==============================================================================
-- QAWAY LAB · GESTOR DE PROYECTOS REGIONALES 2027
-- Esquema Supabase: Proyectos e Ítems del Cronograma Maestro (Hitos y Subprocesos)
-- ==============================================================================

-- 1. Tabla de Proyectos
create table if not exists public.gestor_proyectos (
  id text primary key,
  code text not null,
  name text not null,
  region text default 'Nacional',
  subtext text default '',
  budget text default '',
  sponsor text default '',
  risk_level text default 'Medio',
  metodologia text default '',
  tenant_id text default (public.get_auth_tenant_id())::text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Tabla de Ítems del Cronograma (Hitos y Subprocesos)
create table if not exists public.gestor_cronograma_items (
  id text primary key,
  tenant_id text default (public.get_auth_tenant_id())::text,
  project_id text references public.gestor_proyectos(id) on delete cascade,
  code text not null,
  name text not null,
  kind text not null check (kind in ('hito', 'subproceso')),
  parent_id text,
  start_date date not null,
  end_date date not null,
  progress integer not null default 0,
  status text not null default 'Pendiente',
  expanded boolean default true,
  description text default '',
  deliverable text default '',
  deliverables jsonb default '[]'::jsonb,
  attachments jsonb default '[]'::jsonb,
  report_type text default 'Línea de tiempo',
  region text default 'Todas',
  gestor text default 'Sin asignar',
  gestores text[] default '{}',
  tasks integer default 0,
  done integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Compatibilidad con bases ya creadas sin tenant_id (nunca quedar sin dueño)
alter table public.gestor_proyectos
  add column if not exists tenant_id text default (public.get_auth_tenant_id())::text;
alter table public.gestor_cronograma_items
  add column if not exists tenant_id text default (public.get_auth_tenant_id())::text;

-- Índices para consultas ultra-rápidas por proyecto y jerarquía
create index if not exists idx_gestor_cronograma_project on public.gestor_cronograma_items(project_id);
create index if not exists idx_gestor_cronograma_tenant on public.gestor_cronograma_items(tenant_id);
create index if not exists idx_gestor_cronograma_parent on public.gestor_cronograma_items(parent_id);

-- Habilitar RLS (Seguridad a Nivel de Fila)
alter table public.gestor_proyectos enable row level security;
alter table public.gestor_cronograma_items enable row level security;

-- RLS tenant-scoped. NINGUNA política pública: un tenant nuevo no debe ver
-- proyectos ni cronogramas de otro tenant (incluido el histórico de DIGERE).
-- Re-ejecutable: se retiran primero las políticas permisivas legacy.
drop policy if exists "Permitir todo en gestor_proyectos" on public.gestor_proyectos;
drop policy if exists "Permitir todo en gestor_cronograma_items" on public.gestor_cronograma_items;
drop policy if exists "gestor_proyectos_select_tenant" on public.gestor_proyectos;
drop policy if exists "gestor_proyectos_insert_tenant" on public.gestor_proyectos;
drop policy if exists "gestor_proyectos_update_tenant" on public.gestor_proyectos;
drop policy if exists "gestor_proyectos_delete_tenant" on public.gestor_proyectos;
drop policy if exists "gestor_cronograma_items_select_tenant" on public.gestor_cronograma_items;
drop policy if exists "gestor_cronograma_items_insert_tenant" on public.gestor_cronograma_items;
drop policy if exists "gestor_cronograma_items_update_tenant" on public.gestor_cronograma_items;
drop policy if exists "gestor_cronograma_items_delete_tenant" on public.gestor_cronograma_items;

create policy "gestor_proyectos_select_tenant" on public.gestor_proyectos
  for select to authenticated
  using (public.is_platform_admin() or (
    tenant_id = public.get_auth_tenant_id()::text
    and tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  ));

create policy "gestor_proyectos_insert_tenant" on public.gestor_proyectos
  for insert to authenticated
  with check (public.is_platform_admin() or (
    tenant_id = public.get_auth_tenant_id()::text
    and tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  ));

create policy "gestor_proyectos_update_tenant" on public.gestor_proyectos
  for update to authenticated
  using (public.is_platform_admin() or tenant_id = public.get_auth_tenant_id()::text)
  with check (public.is_platform_admin() or tenant_id = public.get_auth_tenant_id()::text);

create policy "gestor_proyectos_delete_tenant" on public.gestor_proyectos
  for delete to authenticated
  using (public.is_platform_admin() or tenant_id = public.get_auth_tenant_id()::text);

create policy "gestor_cronograma_items_select_tenant" on public.gestor_cronograma_items
  for select to authenticated
  using (public.is_platform_admin() or (
    tenant_id = public.get_auth_tenant_id()::text
    and tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  ));

create policy "gestor_cronograma_items_insert_tenant" on public.gestor_cronograma_items
  for insert to authenticated
  with check (public.is_platform_admin() or (
    tenant_id = public.get_auth_tenant_id()::text
    and tenant_id ~ '^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$'
  ));

create policy "gestor_cronograma_items_update_tenant" on public.gestor_cronograma_items
  for update to authenticated
  using (public.is_platform_admin() or tenant_id = public.get_auth_tenant_id()::text)
  with check (public.is_platform_admin() or tenant_id = public.get_auth_tenant_id()::text);

create policy "gestor_cronograma_items_delete_tenant" on public.gestor_cronograma_items
  for delete to authenticated
  using (public.is_platform_admin() or tenant_id = public.get_auth_tenant_id()::text);

-- Semilla histórica: SOLO para el tenant DIGERE MINEDU, nunca global.
-- Un tenant nuevo jamás debe heredar este proyecto. Si se re-ejecuta el script,
-- la fila sigue perteneciendo a DIGERE y RLS la oculta al resto de tenants.
insert into public.gestor_proyectos (id, tenant_id, code, name, region, subtext, budget, sponsor, risk_level, metodologia)
values (
  'p1',
  '8bbc04cb-f030-48cc-904e-954c5b5af813',
  'PRJ-MIN-2027-01',
  'MINEDU · Dotación 2027',
  'Junín',
  'Seguimiento de operaciones',
  'S/ 850,000',
  'Comité Directivo',
  'Medio',
  'Híbrido: Hitos Clave + Tareas de Campo'
) on conflict (id) do nothing;
