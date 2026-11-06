-- Gestor: capa organizacional aditiva.
-- Esta migración prepara el modelo, pero no conecta auth ni activa RLS tenant-aware.

create table if not exists public.gestor_unidades (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  parent_unit_id uuid references public.gestor_unidades(id) on delete set null,
  name text not null,
  code text,
  unit_type text not null default 'other',
  region text,
  macroregion text,
  address text,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gestor_unidades_tenant_idx on public.gestor_unidades(tenant_id);
create index if not exists gestor_unidades_parent_idx on public.gestor_unidades(parent_unit_id);

create table if not exists public.gestor_unidad_miembros (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  unit_id uuid not null references public.gestor_unidades(id) on delete cascade,
  user_id uuid references public.users(id) on delete set null,
  responsibility text,
  is_primary boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gestor_unidad_miembros_unit_idx on public.gestor_unidad_miembros(unit_id);
create index if not exists gestor_unidad_miembros_user_idx on public.gestor_unidad_miembros(user_id);

alter table public.gestor_proyectos add column if not exists tenant_id uuid references public.tenants(id) on delete set null;
alter table public.gestor_proyectos add column if not exists central_unit_id uuid references public.gestor_unidades(id) on delete set null;
create index if not exists gestor_proyectos_tenant_idx on public.gestor_proyectos(tenant_id);
create index if not exists gestor_proyectos_central_unit_idx on public.gestor_proyectos(central_unit_id);

create table if not exists public.gestor_proyecto_unidades (
  project_id text not null references public.gestor_proyectos(id) on delete cascade,
  unit_id uuid not null references public.gestor_unidades(id) on delete cascade,
  responsibility text,
  created_at timestamptz not null default now(),
  primary key (project_id, unit_id)
);

create index if not exists gestor_proyecto_unidades_unit_idx on public.gestor_proyecto_unidades(unit_id);

-- Preparación solamente: no se cambian las políticas permisivas existentes.
-- El endurecimiento requiere primero clasificar los proyectos históricos.
