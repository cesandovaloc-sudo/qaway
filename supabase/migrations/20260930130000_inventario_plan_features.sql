-- ============================================================
-- PROBLEMA 2: acceso funcional por plan de Inventi Pro
-- La suscripcion del tenant es la fuente del plan; el rol/permisos
-- del usuario siguen controlando sus acciones dentro de ese plan.
-- No modifica precios, promociones, trials ni snapshots comerciales.
-- ============================================================

create table if not exists public.app_plan_features (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.app_catalog (id) on delete cascade,
  plan text not null check (plan in ('basico', 'intermedio', 'premium')),
  feature_key text not null,
  created_at timestamptz not null default now(),
  constraint uq_app_plan_feature unique (app_id, plan, feature_key)
);

create index if not exists idx_app_plan_features_lookup
  on public.app_plan_features (app_id, plan, feature_key);

alter table public.app_plan_features enable row level security;

drop policy if exists "app_plan_features_read" on public.app_plan_features;
create policy "app_plan_features_read" on public.app_plan_features
  for select using (true);

grant select on public.app_plan_features to anon, authenticated;
grant all on public.app_plan_features to service_role;

insert into public.app_plan_features (app_id, plan, feature_key)
select a.id, f.plan, f.feature_key
from public.app_catalog a
cross join (
  values
    ('basico', 'products'),
    ('basico', 'categories'),
    ('basico', 'inventory'),
    ('basico', 'public_catalog'),
    ('basico', 'whatsapp'),
    ('intermedio', 'products'),
    ('intermedio', 'categories'),
    ('intermedio', 'inventory'),
    ('intermedio', 'movements'),
    ('intermedio', 'variants'),
    ('intermedio', 'price_lists'),
    ('intermedio', 'import_export'),
    ('intermedio', 'public_catalog'),
    ('intermedio', 'whatsapp'),
    ('intermedio', 'cart'),
    ('intermedio', 'orders'),
    ('intermedio', 'customers'),
    ('intermedio', 'quotations'),
    ('premium', 'products'),
    ('premium', 'categories'),
    ('premium', 'inventory'),
    ('premium', 'movements'),
    ('premium', 'variants'),
    ('premium', 'price_lists'),
    ('premium', 'import_export'),
    ('premium', 'public_catalog'),
    ('premium', 'whatsapp'),
    ('premium', 'cart'),
    ('premium', 'orders'),
    ('premium', 'customers'),
    ('premium', 'quotations'),
    ('premium', 'packages'),
    ('premium', 'promotions'),
    ('premium', 'multiple_locations'),
    ('premium', 'multiple_warehouses'),
    ('premium', 'audit'),
    ('premium', 'advanced_reports'),
    ('premium', 'automations'),
    ('premium', 'assisted_capture'),
    ('premium', 'integrations')
) as f(plan, feature_key)
where a.slug = 'inventario'
on conflict (app_id, plan, feature_key) do nothing;

create or replace function public.tenant_has_app_feature(
  p_tenant_id uuid,
  p_app_slug text,
  p_feature_key text
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.tenant_app_subscriptions tas
    join public.app_catalog a on a.id = tas.app_id
    join public.app_plan_features apf
      on apf.app_id = tas.app_id and apf.plan = tas.plan
    where tas.tenant_id = p_tenant_id
      and a.slug = p_app_slug
      and tas.status in ('active', 'trialing')
      and (tas.status = 'active' or tas.trial_ends_at is null or tas.trial_ends_at > now())
      and apf.feature_key = p_feature_key
  );
$$;

create or replace function public.user_can_use_feature(p_app_slug text, p_feature_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or (
      public.user_can_use_app(p_app_slug)
      and public.tenant_has_app_feature(public.get_auth_tenant_id(), p_app_slug, p_feature_key)
    );
$$;

create or replace function public.user_can_use_app(p_app_slug text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_admin()
    or exists (
      select 1
      from public.user_app_roles uar
      join public.app_catalog a on a.id = uar.app_id
      join public.tenant_app_subscriptions tas
        on tas.tenant_id = uar.tenant_id and tas.app_id = uar.app_id
      where uar.user_id = auth.uid()
        and a.slug = p_app_slug
        and uar.tenant_id = public.get_auth_tenant_id()
        and (
          tas.status = 'active'
          or (tas.status = 'trialing' and (tas.trial_ends_at is null or tas.trial_ends_at > now()))
        )
    );
$$;

grant execute on function public.tenant_has_app_feature(uuid, text, text) to anon, authenticated;
grant execute on function public.user_can_use_feature(text, text) to anon, authenticated;
