-- ============================================================
-- ESQUEMA DE SUSCRIPCIONES Y COBROS RECURRENTES (COMMERCE)
-- ============================================================
-- 1. Tabla subscription_plans: Planes multi-tenant.
-- 2. Tabla subscription_plan_courses: Tabla intermedia de cursos
--    incluidos por plan (UUID lógico sin FK física a Academy).
-- 3. Tabla subscriptions: Ciclo de vida y renovación de suscripciones
--    conectadas a Mercado Pago Preapproval.
-- 4. RPC check_user_course_access: Verificación de acceso en 1ms.
-- 5. RLS estricto multi-tenant.
-- 6. Semilla de planes iniciales para Master Tenant Qaway Lab.
-- ============================================================

begin;

-- 1. Tabla de Planes de Suscripción
create table if not exists public.subscription_plans (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict default '00000000-0000-0000-0000-000000000001'::uuid,
  name text not null,
  slug text not null,
  description text,
  price numeric(10,2) not null default 0,
  currency text not null default 'PEN',
  frequency int not null default 1,
  frequency_type text not null default 'months' check (frequency_type in ('days', 'months')),
  mp_plan_id text,
  is_all_courses boolean not null default false,
  status text not null default 'active' check (status in ('active', 'inactive', 'archived')),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_tenant_plan_slug unique (tenant_id, slug)
);

-- 2. Tabla Intermedia: Cursos incluidos por Plan
create table if not exists public.subscription_plan_courses (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.subscription_plans(id) on delete cascade,
  course_id uuid not null,
  created_at timestamptz not null default now(),
  constraint uq_plan_course unique (plan_id, course_id)
);

-- 3. Tabla de Suscripciones Activas
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete restrict default '00000000-0000-0000-0000-000000000001'::uuid,
  user_id uuid not null,
  plan_id uuid not null references public.subscription_plans(id) on delete restrict,
  status text not null default 'pending' check (status in ('pending', 'authorized', 'active', 'paused', 'cancelled', 'expired')),
  mp_preapproval_id text unique,
  payer_email text not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancelled_at timestamptz,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Índices de Alto Rendimiento
create index if not exists idx_sub_plans_tenant on public.subscription_plans(tenant_id);
create index if not exists idx_sub_plans_status on public.subscription_plans(status);
create index if not exists idx_sub_plan_courses_plan on public.subscription_plan_courses(plan_id);
create index if not exists idx_sub_plan_courses_course on public.subscription_plan_courses(course_id);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);
create index if not exists idx_subscriptions_user_status on public.subscriptions(user_id, status);
create index if not exists idx_subscriptions_tenant on public.subscriptions(tenant_id);
create index if not exists idx_subscriptions_preapproval on public.subscriptions(mp_preapproval_id);

-- 5. Row Level Security (RLS)
alter table public.subscription_plans enable row level security;
alter table public.subscription_plan_courses enable row level security;
alter table public.subscriptions enable row level security;

-- subscription_plans: lectura pública de activos
drop policy if exists "Plans Public Read Active" on public.subscription_plans;
create policy "Plans Public Read Active"
  on public.subscription_plans for select
  using (status = 'active');

-- subscription_plan_courses: lectura pública
drop policy if exists "Plan Courses Public Read" on public.subscription_plan_courses;
create policy "Plan Courses Public Read"
  on public.subscription_plan_courses for select
  using (true);

-- subscriptions: usuario solo lee sus propias suscripciones
drop policy if exists "Users Read Own Subscriptions" on public.subscriptions;
create policy "Users Read Own Subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- 6. Función RPC de Verificación Ultrarrápida de Acceso
create or replace function public.check_user_course_access(
  p_user_id uuid,
  p_course_id uuid
)
returns boolean
language plpgsql
security definer
as $$
declare
  v_has_access boolean := false;
begin
  select exists (
    select 1
    from public.subscriptions s
    join public.subscription_plans p on p.id = s.plan_id
    where s.user_id = p_user_id
      and s.status in ('active', 'authorized')
      and (s.current_period_end is null or s.current_period_end > now())
      and (
        p.is_all_courses = true
        or exists (
          select 1
          from public.subscription_plan_courses spc
          where spc.plan_id = p.id
            and spc.course_id = p_course_id
        )
      )
  ) into v_has_access;

  return v_has_access;
end;
$$;

-- 7. Sembrado de Planes Base para Master Tenant Qaway Lab
insert into public.subscription_plans (
  id,
  tenant_id,
  name,
  slug,
  description,
  price,
  currency,
  frequency,
  frequency_type,
  is_all_courses,
  status
) values
(
  'b0000000-0001-0000-0000-000000000001'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Pase Total Academy',
  'pase-total-academy',
  'Acceso ilimitado a todos los cursos actuales y futuros de Qaway Academy con mentoría y certificados.',
  99.00,
  'PEN',
  1,
  'months',
  true,
  'active'
),
(
  'b0000000-0002-0000-0000-000000000002'::uuid,
  '00000000-0000-0000-0000-000000000001'::uuid,
  'Ruta Frontend & UI/UX Pro',
  'ruta-frontend-ui-ux-pro',
  'Acceso a la ruta completa de desarrollo web moderno: JavaScript Avanzado, React 19, Vue 3 y Diseño UX/UI.',
  59.00,
  'PEN',
  1,
  'months',
  false,
  'active'
)
on conflict (tenant_id, slug) do update set
  name = excluded.name,
  price = excluded.price,
  is_all_courses = excluded.is_all_courses,
  status = excluded.status,
  updated_at = now();

-- 8. Asignación de cursos a la Ruta Frontend & UI/UX Pro
insert into public.subscription_plan_courses (plan_id, course_id) values
  ('b0000000-0002-0000-0000-000000000002'::uuid, 'c0000000-0002-0000-0000-000000000002'::uuid), -- JS Avanzado
  ('b0000000-0002-0000-0000-000000000002'::uuid, 'c0000000-0003-0000-0000-000000000003'::uuid), -- React Modern Frontend
  ('b0000000-0002-0000-0000-000000000002'::uuid, 'c0000000-0004-0000-0000-000000000004'::uuid), -- Diseño UX/UI
  ('b0000000-0002-0000-0000-000000000002'::uuid, 'c0000000-0007-0000-0000-000000000007'::uuid)  -- Vue.js
on conflict (plan_id, course_id) do nothing;

commit;
