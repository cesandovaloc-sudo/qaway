-- Ensure fiscal catalogs created by the legacy migration are tenant-scoped.
-- This migration is intentionally local until explicitly approved for deployment.

do $do$
begin
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'business_settings') then
    alter table public.business_settings add column if not exists tenant_id uuid;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'taxes') then
    alter table public.taxes add column if not exists tenant_id uuid;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'sunat_units') then
    alter table public.sunat_units add column if not exists tenant_id uuid;
  end if;
  if exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'series') then
    alter table public.series add column if not exists tenant_id uuid;
  end if;
end
$do$;

-- Existing rows belong to the legacy tenant used by the original seed.
update public.business_settings set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update public.taxes set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update public.sunat_units set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;
update public.series set tenant_id = '00000000-0000-0000-0000-000000000001' where tenant_id is null;

alter table public.business_settings alter column tenant_id set not null;
alter table public.taxes alter column tenant_id set not null;
alter table public.sunat_units alter column tenant_id set not null;
alter table public.series alter column tenant_id set not null;

create index if not exists business_settings_tenant_idx on public.business_settings (tenant_id);
create index if not exists taxes_tenant_idx on public.taxes (tenant_id);
create index if not exists sunat_units_tenant_idx on public.sunat_units (tenant_id);
create index if not exists series_tenant_idx on public.series (tenant_id);
