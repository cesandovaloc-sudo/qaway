-- ============================================================
-- SaaS COMERCIAL: condiciones congeladas por contratacion
-- El plan define capacidades. Esta capa conserva el precio, la promocion
-- y el trial con que se realizo cada contratacion.
-- 2026-09-30. Idempotente. No modifica limites ni features de Inventario.
-- ============================================================

-- ─── 0. Precios regulares de Inventi Pro ─────────────────────
insert into public.app_plan_pricing (app_id, plan, price, currency, trial_days, trial_requires_card, is_available)
select a.id, p.plan, p.price, 'PEN', 0, false, true
from public.app_catalog a
cross join (values
  ('basico', 60::numeric),
  ('intermedio', 100::numeric),
  ('premium', 140::numeric)
) as p(plan, price)
where a.slug = 'inventario'
on conflict (app_id, plan) do update
set price = excluded.price,
    currency = excluded.currency,
    trial_days = 0,
    trial_requires_card = false,
    is_available = excluded.is_available,
    updated_at = now();

-- ─── 1. Ofertas configurables ───────────────────────────────
create table if not exists public.saas_commercial_offers (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  app_id uuid references public.app_catalog (id) on delete cascade,
  addon_slug text,
  plan text check (plan is null or plan in ('basico', 'intermedio', 'premium')),
  price_override numeric(10,2),
  discount_percent numeric(5,2),
  trial_days int not null default 0 check (trial_days >= 0),
  trial_requires_card boolean not null default false,
  starts_at timestamptz,
  ends_at timestamptz,
  max_redemptions int check (max_redemptions is null or max_redemptions > 0),
  redemption_count int not null default 0 check (redemption_count >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint saas_offer_price_mode check (
    price_override is null or discount_percent is null
  ),
  constraint saas_offer_discount_range check (
    discount_percent is null or (discount_percent >= 0 and discount_percent <= 100)
  ),
  constraint saas_offer_target_check check (
    app_id is not null or addon_slug is not null
  )
);

create index if not exists idx_saas_offers_lookup
  on public.saas_commercial_offers (app_id, plan, is_active);

alter table public.saas_commercial_offers
  add column if not exists addon_slug text;

alter table public.saas_commercial_offers enable row level security;

drop policy if exists "saas_offers_public_read" on public.saas_commercial_offers;
create policy "saas_offers_public_read" on public.saas_commercial_offers
  for select using (
    is_active
    and (starts_at is null or starts_at <= now())
    and (ends_at is null or ends_at > now())
  );

drop policy if exists "saas_offers_admin_all" on public.saas_commercial_offers;
create policy "saas_offers_admin_all" on public.saas_commercial_offers
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.saas_commercial_offers to anon, authenticated;
grant all on public.saas_commercial_offers to service_role;

-- ─── 1b. Precios vigentes de add-ons ────────────────────────
create table if not exists public.saas_addon_pricing (
  id uuid primary key default gen_random_uuid(),
  addon_slug text not null,
  plan text not null check (plan in ('basico', 'intermedio', 'premium')),
  price numeric(10,2) not null check (price >= 0),
  currency text not null default 'PEN',
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_saas_addon_plan unique (addon_slug, plan)
);

alter table public.saas_addon_pricing enable row level security;

drop policy if exists "saas_addon_pricing_public_read" on public.saas_addon_pricing;
create policy "saas_addon_pricing_public_read" on public.saas_addon_pricing
  for select using (is_available or auth.role() = 'authenticated');

drop policy if exists "saas_addon_pricing_admin_all" on public.saas_addon_pricing;
create policy "saas_addon_pricing_admin_all" on public.saas_addon_pricing
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.saas_addon_pricing to anon, authenticated;
grant all on public.saas_addon_pricing to service_role;

insert into public.saas_addon_pricing (addon_slug, plan, price, currency, is_available)
values
  ('catalogo_publico', 'basico', 60, 'PEN', true),
  ('catalogo_publico', 'intermedio', 80, 'PEN', true),
  ('catalogo_publico', 'premium', 100, 'PEN', true)
on conflict (addon_slug, plan) do update
set price = excluded.price,
    currency = excluded.currency,
    is_available = excluded.is_available,
    updated_at = now();

-- Oferta de lanzamiento vigente. El precio regular permanece en los catálogos;
-- solo estas filas representan el importe promocional actual.
insert into public.saas_commercial_offers
  (code, name, app_id, plan, price_override, trial_days, trial_requires_card, is_active)
select
  'lanzamiento-inventi-' || p.plan,
  'Lanzamiento Inventi Pro ' || initcap(p.plan),
  a.id,
  p.plan,
  p.offer_price,
  0,
  false,
  true
from public.app_catalog a
cross join (values
  ('basico', 30::numeric),
  ('intermedio', 50::numeric),
  ('premium', 70::numeric)
) as p(plan, offer_price)
where a.slug = 'inventario'
on conflict (code) do update
set name = excluded.name,
    app_id = excluded.app_id,
    plan = excluded.plan,
    price_override = excluded.price_override,
    discount_percent = null,
    is_active = excluded.is_active,
    updated_at = now();

insert into public.saas_commercial_offers
  (code, name, addon_slug, plan, price_override, trial_days, trial_requires_card, is_active)
select
  'lanzamiento-catalogo-' || p.plan,
  'Lanzamiento Catalogo Publico ' || initcap(p.plan),
  'catalogo_publico',
  p.plan,
  p.offer_price,
  0,
  false,
  true
from (values
  ('basico', 30::numeric),
  ('intermedio', 40::numeric),
  ('premium', 50::numeric)
) as p(plan, offer_price)
on conflict (code) do update
set name = excluded.name,
    addon_slug = excluded.addon_slug,
    plan = excluded.plan,
    price_override = excluded.price_override,
    discount_percent = null,
    is_active = excluded.is_active,
    updated_at = now();

-- ─── 2. Snapshot de la condicion de la app contratada ───────
alter table public.tenant_app_subscriptions
  add column if not exists list_price_at_signup numeric(10,2),
  add column if not exists contracted_price numeric(10,2),
  add column if not exists price_currency text not null default 'PEN',
  add column if not exists commercial_offer_id uuid references public.saas_commercial_offers (id) on delete set null,
  add column if not exists promotion_code text,
  add column if not exists promotion_name text,
  add column if not exists trial_days_granted int not null default 0,
  add column if not exists trial_requires_card boolean not null default false,
  add column if not exists trial_source text;

update public.app_plan_pricing
set trial_days = 0,
    trial_requires_card = false
where app_id = (select id from public.app_catalog where slug = 'inventario');

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tenant_app_subscriptions'::regclass
      and conname = 'tenant_app_subscriptions_trial_days_check'
  ) then
    alter table public.tenant_app_subscriptions
      add constraint tenant_app_subscriptions_trial_days_check
      check (trial_days_granted >= 0);
  end if;
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tenant_app_subscriptions'::regclass
      and conname = 'tenant_app_subscriptions_trial_offer_check'
  ) then
    alter table public.tenant_app_subscriptions
      add constraint tenant_app_subscriptions_trial_offer_check
      check (
        (trial_days_granted = 0 and trial_requires_card = false)
        or commercial_offer_id is not null
      );
  end if;
end $$;

create index if not exists idx_tas_commercial_offer
  on public.tenant_app_subscriptions (commercial_offer_id);

-- El cliente puede crear una fila pending durante el onboarding, pero nunca
-- puede decidir por sí mismo precio, promoción o trial. Esos campos solo los
-- fijan las Edge Functions con service_role.
create or replace function public.protect_subscription_commercial_snapshot()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if coalesce(auth.role(), '') not in ('service_role', '') then
    if tg_op = 'INSERT' then
      new.list_price_at_signup := null;
      new.contracted_price := null;
      new.price_currency := 'PEN';
      new.commercial_offer_id := null;
      new.promotion_code := null;
      new.promotion_name := null;
      new.trial_days_granted := 0;
      new.trial_requires_card := false;
      new.trial_source := null;
    else
      new.list_price_at_signup := old.list_price_at_signup;
      new.contracted_price := old.contracted_price;
      new.price_currency := old.price_currency;
      new.commercial_offer_id := old.commercial_offer_id;
      new.promotion_code := old.promotion_code;
      new.promotion_name := old.promotion_name;
      new.trial_days_granted := old.trial_days_granted;
      new.trial_requires_card := old.trial_requires_card;
      new.trial_source := old.trial_source;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_subscription_commercial_snapshot
  on public.tenant_app_subscriptions;
create trigger protect_subscription_commercial_snapshot
before insert or update on public.tenant_app_subscriptions
for each row execute function public.protect_subscription_commercial_snapshot();

-- Conserva una fotografia inicial para suscripciones ya existentes. No cambia
-- su precio efectivo; solo completa el dato con el precio vigente al migrar.
update public.tenant_app_subscriptions tas
set list_price_at_signup = pricing.price,
    contracted_price = case when tas.status = 'pending' then null else pricing.price end,
    price_currency = pricing.currency
from public.app_plan_pricing pricing
where pricing.app_id = tas.app_id
  and pricing.plan = tas.plan
  and tas.list_price_at_signup is null
  and tas.contracted_price is null;

update public.tenant_app_subscriptions
set trial_days_granted = 0,
    trial_requires_card = false,
    trial_source = null
where commercial_offer_id is null;

-- ─── 3. Snapshot de add-ons comercializables ────────────────
-- Se usa para Catalogo publico y futuros add-ons sin crear otra suscripcion
-- de app ni sobrescribir el precio historico del plan principal.
create table if not exists public.tenant_app_subscription_addons (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.tenant_app_subscriptions (id) on delete cascade,
  addon_slug text not null,
  list_price_at_signup numeric(10,2),
  contracted_price numeric(10,2),
  price_currency text not null default 'PEN',
  commercial_offer_id uuid references public.saas_commercial_offers (id) on delete set null,
  promotion_code text,
  promotion_name text,
  trial_days_granted int not null default 0 check (trial_days_granted >= 0),
  trial_requires_card boolean not null default false,
  trial_source text,
  included_until timestamptz,
  status text not null default 'active' check (status in ('active', 'suspended', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_tas_addon unique (subscription_id, addon_slug)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.tenant_app_subscription_addons'::regclass
      and conname = 'tenant_app_subscription_addons_trial_offer_check'
  ) then
    alter table public.tenant_app_subscription_addons
      add constraint tenant_app_subscription_addons_trial_offer_check
      check (
        (trial_days_granted = 0 and trial_requires_card = false)
        or commercial_offer_id is not null
      );
  end if;
end $$;

alter table public.tenant_app_subscription_addons enable row level security;

drop policy if exists "tas_addons_tenant_read" on public.tenant_app_subscription_addons;
create policy "tas_addons_tenant_read" on public.tenant_app_subscription_addons
  for select using (
    exists (
      select 1
      from public.tenant_app_subscriptions tas
      where tas.id = subscription_id
        and tas.tenant_id = public.get_auth_tenant_id()
    )
  );

drop policy if exists "tas_addons_admin_all" on public.tenant_app_subscription_addons;
create policy "tas_addons_admin_all" on public.tenant_app_subscription_addons
  for all using (public.is_admin()) with check (public.is_admin());

grant select on public.tenant_app_subscription_addons to authenticated;
grant all on public.tenant_app_subscription_addons to service_role;

revoke all on function public.protect_subscription_commercial_snapshot() from public;
grant execute on function public.protect_subscription_commercial_snapshot() to authenticated, service_role;
