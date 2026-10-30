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
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Tabla de Ítems del Cronograma (Hitos y Subprocesos)
create table if not exists public.gestor_cronograma_items (
  id text primary key,
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

-- Índices para consultas ultra-rápidas por proyecto y jerarquía
create index if not exists idx_gestor_cronograma_project on public.gestor_cronograma_items(project_id);
create index if not exists idx_gestor_cronograma_parent on public.gestor_cronograma_items(parent_id);

-- Habilitar RLS (Seguridad a Nivel de Fila)
alter table public.gestor_proyectos enable row level security;
alter table public.gestor_cronograma_items enable row level security;

-- Políticas permisivas de lectura y escritura para la clave anónima / autenticada
drop policy if exists "Permitir todo en gestor_proyectos" on public.gestor_proyectos;
create policy "Permitir todo en gestor_proyectos"
  on public.gestor_proyectos
  for all
  using (true)
  with check (true);

drop policy if exists "Permitir todo en gestor_cronograma_items" on public.gestor_cronograma_items;
create policy "Permitir todo en gestor_cronograma_items"
  on public.gestor_cronograma_items
  for all
  using (true)
  with check (true);

-- Semilla inicial del proyecto MINEDU Dotación 2027
insert into public.gestor_proyectos (id, code, name, region, subtext, budget, sponsor, risk_level, metodologia)
values (
  'p1',
  'PRJ-MIN-2027-01',
  'MINEDU · Dotación 2027',
  'Junín',
  'Seguimiento de operaciones',
  'S/ 850,000',
  'Comité Directivo',
  'Medio',
  'Híbrido: Hitos Clave + Tareas de Campo'
) on conflict (id) do nothing;
