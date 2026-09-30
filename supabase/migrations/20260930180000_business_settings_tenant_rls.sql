-- BUSINESS_SETTINGS: allow one independent settings row per tenant.
--
-- This migration intentionally changes only business_settings. It preserves
-- existing rows and leaves the existing RLS policy untouched.

do $do$
declare
  missing_tenant_rows bigint;
  duplicate_tenants text;
  invalid_tenant_rows bigint;
begin
  if to_regclass('public.business_settings') is null then
    raise exception 'business_settings does not exist; aborting without changes';
  end if;

  if not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'business_settings'
      and column_name = 'tenant_id'
  ) then
    raise exception 'business_settings.tenant_id is missing; aborting without changes';
  end if;

  select count(*)
    into missing_tenant_rows
  from public.business_settings
  where tenant_id is null;

  if missing_tenant_rows > 0 then
    raise exception
      'business_settings contains % row(s) without tenant_id; no data was changed',
      missing_tenant_rows;
  end if;

  select string_agg(tenant_id::text, ', ' order by tenant_id::text)
    into duplicate_tenants
  from (
    select tenant_id
    from public.business_settings
    group by tenant_id
    having count(*) > 1
  ) duplicates;

  if duplicate_tenants is not null then
    raise exception
      'business_settings has duplicate tenant_id value(s): %; resolve duplicates before applying the unique index',
      duplicate_tenants;
  end if;

  select count(*)
    into invalid_tenant_rows
  from public.business_settings settings
  left join public.tenants tenants on tenants.id = settings.tenant_id
  where tenants.id is null;

  if invalid_tenant_rows > 0 then
    raise exception
      'business_settings contains % row(s) whose tenant_id does not exist in tenants; no data was changed',
      invalid_tenant_rows;
  end if;
end
$do$;

-- New tenant settings receive a new row id. Existing ids are unchanged.
alter table public.business_settings
  alter column id set default gen_random_uuid();

create unique index if not exists business_settings_one_per_tenant_idx
  on public.business_settings (tenant_id);
