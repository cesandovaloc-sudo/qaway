-- ============================================================
-- CONFIG FISCAL — Empresa, impuestos, unidades SUNAT y series
-- de comprobantes (FASE 0 del PLAN-IMPLEMENTACION-FISCAL.md)
--
-- Crea:
--   business_settings (una fila por empresa: RUC, razón social, IGV)
--   taxes             (catálogo SUNAT: 10=IGV, 11=Exonerado, 12=Inafecto...)
--   sunat_units       (catálogo de unidades SUNAT: NIU, KGM, MTR...)
--   series            (series de comprobantes: B001, F001, BC01, FC01...)
--
-- La conexión con SUNAT NO se activa aquí: solo queda la estructura
-- y el interruptor `sunat_connected` en false, listo para el alta.
--
-- IDEMPOTENTE: re-ejecutable sin riesgo.
-- ============================================================

-- 1) BUSINESS_SETTINGS — datos de la empresa (una sola fila)
create table if not exists public.business_settings (
  id                   uuid primary key default '00000000-0000-0000-0000-000000000001',
  ruc                  text,
  razon_social         text,
  nombre_comercial     text,
  direccion            text,
  regimen              text not null default 'general',
  igv_rate             numeric not null default 18,
  moneda               text not null default 'PEN',
  sunat_connected      boolean not null default false,
  sunat_connection_meta jsonb,
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);

insert into public.business_settings (id, ruc, razon_social, nombre_comercial, direccion, regimen, igv_rate, moneda)
values ('00000000-0000-0000-0000-000000000001', null, null, null, null, 'general', 18, 'PEN')
on conflict (id) do nothing;

-- 2) TAXES — catálogo de impuestos SUNAT
create table if not exists public.taxes (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null,
  descripcion text not null,
  tasa        numeric,
  tipo        text not null default 'igv',
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint taxes_codigo_unique unique (codigo),
  constraint taxes_tipo_check check (tipo in ('igv', 'isc', 'exonerado', 'inafecto', 'gratuito'))
);

insert into public.taxes (codigo, descripcion, tasa, tipo, active) values
  ('10', 'IGV',                 18, 'igv',       true),
  ('11', 'Exonerado',           0,  'exonerado', true),
  ('12', 'Inafecto',            0,  'inafecto',  true),
  ('13', 'Gratuito',            0,  'gratuito',  true),
  ('15', 'ISC',                 4,  'isc',       true),
  ('30', 'Otros conceptos',     0,  'inafecto',  false)
on conflict (codigo) do nothing;

-- 3) SUNAT_UNITS — catálogo de unidades de medida (códigos SUNAT)
create table if not exists public.sunat_units (
  id          uuid primary key default gen_random_uuid(),
  codigo      text not null,
  descripcion text not null,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  constraint sunat_units_codigo_unique unique (codigo)
);

insert into public.sunat_units (codigo, descripcion, active) values
  ('NIU', 'Unidad',            true),
  ('KGM', 'Kilogramo',         true),
  ('GRM', 'Gramo',             true),
  ('LBR', 'Libra',             true),
  ('MTR', 'Metro',             true),
  ('MTS', 'Metro cuadrado',    true),
  ('MTK', 'Metro cúbico',      true),
  ('LTR', 'Litro',             true),
  ('MLT', 'Mililitro',         true),
  ('FOT', 'Pie',               true),
  ('YDS', 'Yarda',             true),
  ('BX',  'Caja',              true),
  ('CT',  'Cartón',            true),
  ('SET', 'Set',               true),
  ('PAR', 'Par',               true),
  ('DOC', 'Docena',            true),
  ('CEN', 'Ciento',            true),
  ('MIL', 'Millar',            true),
  ('KTM', 'Kilómetro',         true),
  ('HUR', 'Hora',              true),
  ('DZN', 'Docena',            false),
  ('ZZ',  'Servicios',         true)
on conflict (codigo) do nothing;

-- 4) SERIES — series de comprobantes de pago
-- tipo_doc SUNAT: 01=Factura, 03=Boleta, 07=Nota crédito, 08=Nota débito
create table if not exists public.series (
  id                 uuid primary key default gen_random_uuid(),
  tipo_doc           text not null,
  serie              text not null,
  descripcion        text,
  correlativo_actual integer not null default 0,
  active             boolean not null default true,
  created_at         timestamptz not null default now(),
  constraint series_tipo_doc_check check (tipo_doc in ('01', '03', '07', '08')),
  constraint series_unique unique (tipo_doc, serie)
);

insert into public.series (tipo_doc, serie, descripcion, correlativo_actual, active) values
  ('03', 'B001', 'Boleta principal',      0, true),
  ('01', 'F001', 'Factura principal',     0, true),
  ('03', 'BC01', 'Boleta consumidor final', 0, true),
  ('01', 'FC01', 'Factura contigencia',   0, false),
  ('07', 'BD01', 'Nota de crédito (boleta)', 0, false),
  ('08', 'FD01', 'Nota de débito (factura)', 0, false)
on conflict (tipo_doc, serie) do nothing;

-- 5) Helper de permisos granulares (reusa la columna permissions de users)
create or replace function public.has_permission(pname text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid()
      and (role = 'admin' or permissions ->> pname = 'true')
  );
$$;

-- 6) RLS
alter table public.business_settings enable row level security;
alter table public.taxes             enable row level security;
alter table public.sunat_units       enable row level security;
alter table public.series            enable row level security;

drop policy if exists "business_settings_select_admin" on public.business_settings;
create policy "business_settings_select_admin" on public.business_settings
  for select using (public.has_permission('can_access_fiscal_settings'));

drop policy if exists "business_settings_write_admin" on public.business_settings;
create policy "business_settings_write_admin" on public.business_settings
  for insert with check (public.has_permission('can_access_fiscal_settings'));
create policy "business_settings_update_admin" on public.business_settings
  for update using (public.has_permission('can_access_fiscal_settings'))
  with check (public.has_permission('can_access_fiscal_settings'));
create policy "business_settings_delete_admin" on public.business_settings
  for delete using (public.has_permission('can_access_fiscal_settings'));

drop policy if exists "taxes_select_authenticated" on public.taxes;
create policy "taxes_select_authenticated" on public.taxes
  for select using (auth.role() = 'authenticated');
create policy "taxes_write_admin" on public.taxes
  for insert with check (public.has_permission('can_access_fiscal_settings'));
create policy "taxes_update_admin" on public.taxes
  for update using (public.has_permission('can_access_fiscal_settings'))
  with check (public.has_permission('can_access_fiscal_settings'));
create policy "taxes_delete_admin" on public.taxes
  for delete using (public.has_permission('can_access_fiscal_settings'));

drop policy if exists "sunat_units_select_authenticated" on public.sunat_units;
create policy "sunat_units_select_authenticated" on public.sunat_units
  for select using (auth.role() = 'authenticated');
create policy "sunat_units_write_admin" on public.sunat_units
  for insert with check (public.has_permission('can_access_fiscal_settings'));
create policy "sunat_units_update_admin" on public.sunat_units
  for update using (public.has_permission('can_access_fiscal_settings'))
  with check (public.has_permission('can_access_fiscal_settings'));
create policy "sunat_units_delete_admin" on public.sunat_units
  for delete using (public.has_permission('can_access_fiscal_settings'));

drop policy if exists "series_select_authenticated" on public.series;
create policy "series_select_authenticated" on public.series
  for select using (auth.role() = 'authenticated');
create policy "series_write_admin" on public.series
  for insert with check (public.has_permission('can_access_fiscal_settings'));
create policy "series_update_admin" on public.series
  for update using (public.has_permission('can_access_fiscal_settings'))
  with check (public.has_permission('can_access_fiscal_settings'));
create policy "series_delete_admin" on public.series
  for delete using (public.has_permission('can_access_fiscal_settings'));

-- 7) Grants
grant select on public.business_settings to authenticated;
grant insert, update, delete on public.business_settings to authenticated;
grant select, insert, update, delete on public.taxes       to authenticated;
grant select, insert, update, delete on public.sunat_units to authenticated;
grant select, insert, update, delete on public.series      to authenticated;
grant all on public.business_settings to service_role;
grant all on public.taxes             to service_role;
grant all on public.sunat_units       to service_role;
grant all on public.series            to service_role;

-- 8) Índices
create index if not exists taxes_active_idx on public.taxes (active);
create index if not exists sunat_units_active_idx on public.sunat_units (active);
create index if not exists series_active_idx on public.series (active);
