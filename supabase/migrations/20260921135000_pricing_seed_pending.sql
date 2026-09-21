-- ============================================================
-- Pricing por app×plan SIN inventar + enlace MP en suscripciones
-- Precios reales aún no definidos: filas is_available=false,
-- price 0, trial 0 (pendientes explícitos, no datos falsos).
-- tenant_app_subscriptions += mp_preapproval_id + periodos para
-- que el webhook Preapproval actualice sin duplicar sistemas.
-- 2026-09-21. Idempotente. Sin commit ni push.
-- ============================================================

insert into public.app_plan_pricing (app_id, plan, price, currency, trial_days, trial_requires_card, is_available)
select a.id, p.plan, 0, 'PEN', 0, false, false
from public.app_catalog a
cross join (values ('basico'), ('intermedio'), ('premium')) as p(plan)
where a.slug in ('crm', 'inventario', 'agenda', 'blog')
on conflict (app_id, plan) do nothing;

alter table public.tenant_app_subscriptions
  add column if not exists mp_preapproval_id text,
  add column if not exists current_period_start timestamptz,
  add column if not exists current_period_end timestamptz;

create index if not exists idx_tas_preapproval on public.tenant_app_subscriptions (mp_preapproval_id);
