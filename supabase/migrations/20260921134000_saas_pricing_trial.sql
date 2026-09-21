-- ============================================================
-- SaaS comercial: catálogo precios × plan + trial por suscripción
-- - app_plan_pricing: precio, trial_days, trial_requires_card,
--   disponibilidad por (app, plan). Independiente de Academy.
-- - tenant_app_subscriptions: + trial_started_at/trial_ends_at y
--   estados pending/trialing/expired (reemplazo de check).
-- - Marcas nuevas nacen 'draft' (tenants ya lo permite); el pago
--   o trial las activa. Trial vive en la suscripción por app.
-- - user_can_use_app v2: sin fila = legacy abierto; con fila exige
--   active o trialing vigente. 2026-09-21. Sin commit ni push.
-- ============================================================

-- ─── 1. Catálogo comercial ───
create table if not exists public.app_plan_pricing (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.app_catalog (id) on delete cascade,
  plan text not null check (plan in ('basico', 'intermedio', 'premium')),
  price numeric(10,2) not null default 0,
  currency text not null default 'PEN',
  trial_days int not null default 0,
  trial_requires_card boolean not null default false,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_app_plan_price unique (app_id, plan)
);

alter table public.app_plan_pricing enable row level security;

drop policy if exists "pricing_public_read" on public.app_plan_pricing;
create policy "pricing_public_read" on public.app_plan_pricing
  for select using (is_available = true or auth.role() = 'authenticated');

drop policy if exists "pricing_admin_all" on public.app_plan_pricing;
create policy "pricing_admin_all" on public.app_plan_pricing
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.app_plan_pricing to anon, authenticated;
grant all on public.app_plan_pricing to service_role;

-- ─── 2. Trial en suscripciones (estados + fechas) ───
alter table public.tenant_app_subscriptions
  add column if not exists trial_started_at timestamptz,
  add column if not exists trial_ends_at timestamptz;

do $$
declare
  r record;
begin
  for r in
    select conname from pg_constraint
    where conrelid = 'public.tenant_app_subscriptions'::regclass
      and contype = 'c'
      and pg_get_constraintdef(oid) like '%status%'
  loop
    execute format('alter table public.tenant_app_subscriptions drop constraint %I', r.conname);
  end loop;
end $$;

alter table public.tenant_app_subscriptions
  add constraint tenant_app_subscriptions_status_check2
  check (status in ('pending', 'trialing', 'active', 'suspended', 'cancelled', 'expired'));

-- ─── 3. Gate v2: legacy abierto, con fila exige active o trial vigente ───
create or replace function public.user_can_use_app(p_app_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.is_admin()
    or exists (
      select 1
      from public.user_app_roles uar
      join public.app_catalog a on a.id = uar.app_id
      where uar.user_id = auth.uid()
        and a.slug = p_app_slug
        and uar.tenant_id = public.get_auth_tenant_id()
        and (
          not exists (
            select 1 from public.tenant_app_subscriptions tas
            where tas.tenant_id = uar.tenant_id and tas.app_id = a.id
          )
          or exists (
            select 1 from public.tenant_app_subscriptions tas
            where tas.tenant_id = uar.tenant_id and tas.app_id = a.id
              and (
                tas.status = 'active'
                or (tas.status = 'trialing' and (tas.trial_ends_at is null or tas.trial_ends_at > now()))
              )
          )
        )
    )
$$;
