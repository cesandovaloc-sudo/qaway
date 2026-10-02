-- SaaS: modalidad de facturacion y referencia del pago puntual.
-- Defaults conservadores para no cambiar el comportamiento de registros existentes.
alter table public.tenant_app_subscriptions
  add column if not exists billing_type text not null default 'recurring',
  add column if not exists auto_renew boolean not null default true,
  add column if not exists mp_payment_id text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.tenant_app_subscriptions'::regclass
      and conname = 'tenant_app_subscriptions_billing_type_check'
  ) then
    alter table public.tenant_app_subscriptions
      add constraint tenant_app_subscriptions_billing_type_check
      check (billing_type in ('recurring', 'one_time'));
  end if;
end $$;

create index if not exists idx_tas_mp_payment on public.tenant_app_subscriptions (mp_payment_id);
