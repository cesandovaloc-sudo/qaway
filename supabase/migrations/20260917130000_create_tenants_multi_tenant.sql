-- ============================================================
-- MULTI-TENANT ARCHITECTURE — Tabla `tenants` y Nomenclatura Profesional
-- ============================================================
-- Objetivo (Paso 1 del Plan Maestro Multi-Tenant):
--   1. Crear la tabla independiente `public.tenants` con soporte para:
--      - ID Interno inmutable (UUID)
--      - Client Code humano único (Base32 anti-confusión: QW-XXXXX)
--      - Slug público único (RFC 1123 / kebab-case)
--      - Nombre comercial (soporta nombres repetidos sin colisión)
--      - Subdominios, dominios personalizados, branding, content, features y payment_settings
--      - Soft delete (`deleted_at`) para trazabilidad histórica
--   2. Algoritmo generador de `client_code` (Trigger BEFORE INSERT)
--   3. Helper `get_current_tenant_id()` para futuras políticas RLS
--   4. RLS público para tenants activos y restringido para modificaciones
--   5. Sembrar Tenant 000 (Qaway Lab Master) y Tenant 001 (CoraVet Piloto)
--
-- IDEMPOTENTE: re-ejecutable sin riesgo.
-- ============================================================

-- ─── 1. TABLA `public.tenants` ─────────────────────────────────
create table if not exists public.tenants (
  id                uuid primary key default gen_random_uuid(),
  client_code       text unique not null,
  slug              text unique not null,
  name              text not null,
  legal_name        text,
  subdomain         text unique,
  custom_domain     text unique,
  status            text not null default 'active' check (status in ('active', 'suspended', 'draft', 'archived')),
  branding          jsonb not null default '{}'::jsonb,
  content           jsonb not null default '{}'::jsonb,
  features          jsonb not null default '{"ecommerce": true, "catalog": true}'::jsonb,
  payment_settings  jsonb not null default '{}'::jsonb,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz default null
);

-- Idempotencia para columnas en caso de tabla pre-existente
alter table public.tenants add column if not exists client_code       text;
alter table public.tenants add column if not exists slug              text;
alter table public.tenants add column if not exists name              text;
alter table public.tenants add column if not exists legal_name        text;
alter table public.tenants add column if not exists subdomain         text;
alter table public.tenants add column if not exists custom_domain     text;
alter table public.tenants add column if not exists status            text not null default 'active';
alter table public.tenants add column if not exists branding          jsonb not null default '{}'::jsonb;
alter table public.tenants add column if not exists content           jsonb not null default '{}'::jsonb;
alter table public.tenants add column if not exists features          jsonb not null default '{"ecommerce": true, "catalog": true}'::jsonb;
alter table public.tenants add column if not exists payment_settings  jsonb not null default '{}'::jsonb;
alter table public.tenants add column if not exists created_at        timestamptz not null default now();
alter table public.tenants add column if not exists updated_at        timestamptz not null default now();
alter table public.tenants add column if not exists deleted_at        timestamptz default null;

-- Restricción de formato para slug (kebab-case estricto en minúsculas)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'tenants_slug_format_check' and conrelid = 'public.tenants'::regclass
  ) then
    alter table public.tenants add constraint tenants_slug_format_check
      check (slug = lower(slug) and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$');
  end if;
end $$;

-- ─── 2. GENERADOR DE CLIENT_CODE ANTI-CONFUSIÓN (Crockford Base32) ───
-- Alfabeto: 23456789ABCDEFGHJKMNPQRSTUVWXYZ (Excluye 0, O, 1, I, L)
create or replace function public.generate_client_code()
returns text
language plpgsql
as $$
declare
  chars text := '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
  code text := 'QW-';
  i int;
begin
  for i in 1..5 loop
    code := code || substr(chars, floor(random() * 32)::int + 1, 1);
  end loop;
  return code;
end;
$$;

-- Trigger para auto-asignar client_code si viene nulo
create or replace function public.trg_set_tenant_client_code()
returns trigger
language plpgsql
as $$
declare
  new_code text;
  attempts int := 0;
begin
  if new.client_code is null or trim(new.client_code) = '' then
    loop
      new_code := public.generate_client_code();
      exit when not exists (select 1 from public.tenants where client_code = new_code);
      attempts := attempts + 1;
      if attempts > 30 then
        raise exception 'No se pudo generar un client_code único tras 30 intentos';
      end if;
    end loop;
    new.client_code := new_code;
  end if;
  return new;
end;
$$;

drop trigger if exists on_tenant_before_insert_code on public.tenants;
create trigger on_tenant_before_insert_code
  before insert on public.tenants
  for each row execute procedure public.trg_set_tenant_client_code();

-- Trigger para updated_at
drop trigger if exists on_tenant_updated_at on public.tenants;
create trigger on_tenant_updated_at
  before update on public.tenants
  for each row execute procedure public.handle_updated_at();

-- ─── 3. ÍNDICES DE ALTO RENDIMIENTO ────────────────────────────
create index if not exists idx_tenants_slug on public.tenants (slug);
create index if not exists idx_tenants_client_code on public.tenants (client_code);
create index if not exists idx_tenants_subdomain on public.tenants (subdomain);
create index if not exists idx_tenants_custom_domain on public.tenants (custom_domain);
create index if not exists idx_tenants_status on public.tenants (status) where deleted_at is null;

-- ─── 4. HELPER SQL PARA SESIÓN / RLS ───────────────────────────
create or replace function public.get_current_tenant_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.current_tenant_id', true), '')::uuid;
$$;

-- ─── 5. SEGURIDAD (ROW LEVEL SECURITY) ─────────────────────────
alter table public.tenants enable row level security;

-- Lectura pública: permite a cualquier visitante o web resolver el tenant activo
drop policy if exists "tenants_select_active_public" on public.tenants;
create policy "tenants_select_active_public" on public.tenants
  for select
  using (status = 'active' and deleted_at is null);

-- Lectura total para administradores de Qaway Lab
drop policy if exists "tenants_select_admin_all" on public.tenants;
create policy "tenants_select_admin_all" on public.tenants
  for select
  using (public.is_admin());

-- Modificaciones exclusivas para administradores
drop policy if exists "tenants_insert_admin" on public.tenants;
create policy "tenants_insert_admin" on public.tenants
  for insert
  with check (public.is_admin());

drop policy if exists "tenants_update_admin" on public.tenants;
create policy "tenants_update_admin" on public.tenants
  for update
  using (public.is_admin());

drop policy if exists "tenants_delete_admin" on public.tenants;
create policy "tenants_delete_admin" on public.tenants
  for delete
  using (public.is_admin());

-- ─── 6. SIEMBRA INICIAL DE TENANTS (MASTER Y PILOTO) ───────────
-- Tenant 000: Qaway Lab (Master)
insert into public.tenants (
  id,
  client_code,
  slug,
  name,
  legal_name,
  subdomain,
  custom_domain,
  status,
  branding,
  content,
  features,
  payment_settings
) values (
  '00000000-0000-0000-0000-000000000001',
  'QW-00001',
  'qaway-lab',
  'Qaway Lab',
  'Qaway Lab Digital S.A.C.',
  'qawaylab',
  'qawaylab.com',
  'active',
  '{"primaryColor": "#ff4b0b", "logo": "/logo.svg"}'::jsonb,
  '{"heroTitle": "Sistemas Digitales y Comercio con IA"}'::jsonb,
  '{"ecommerce": true, "inventory": true, "crm": true, "agenda": true}'::jsonb,
  '{"provider": "mercadopago", "mode": "direct"}'::jsonb
) on conflict (slug) do update set
  name = excluded.name,
  legal_name = excluded.legal_name,
  subdomain = excluded.subdomain,
  custom_domain = excluded.custom_domain,
  status = excluded.status,
  updated_at = now();

-- Tenant 001: CoraVet (Piloto)
insert into public.tenants (
  client_code,
  slug,
  name,
  legal_name,
  subdomain,
  custom_domain,
  status,
  branding,
  content,
  features,
  payment_settings
) values (
  'QW-7K4P2',
  'coravet',
  'CoraVet',
  'CoraVet Servicios Veterinarios Integrales',
  'coravet',
  null,
  'active',
  '{"primaryColor": "#075dcc", "tealColor": "#12b9bd", "logo": "/images/coravet-logo.svg"}'::jsonb,
  '{"heroTitle": "Cuidamos lo que más te importa", "tagline": "Atención veterinaria integral y Pet Shop"}'::jsonb,
  '{"petshop": true, "booking": true, "ecommerce": true}'::jsonb,
  '{"provider": "mercadopago", "mode": "direct"}'::jsonb
) on conflict (slug) do update set
  name = excluded.name,
  legal_name = excluded.legal_name,
  subdomain = excluded.subdomain,
  status = excluded.status,
  updated_at = now();
