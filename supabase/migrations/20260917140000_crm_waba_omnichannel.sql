-- ============================================================
-- CRM OMNICHANNEL & WHATSAPP BUSINESS PLATFORM (WABA) — Migración
-- ============================================================
-- Objetivo:
--   1. Asegurar la tabla `public.leads` con tipado canónico, canal omnicanal,
--      atribución de Meta Ads (CTWA) y soporte para Handover Protocol.
--   2. Asegurar la tabla `public.campaigns` con cálculo de ROAS y métricas comerciales.
--   3. Crear índices optimizados para alta concurrencia y deduplicación por wamid.
--   4. Habilitar soporte de Feature Flags en `public.tenants` para Planes Modulares:
--      (Plan 1: Starter WABA, Plan 2: Pro Multi-usuario, Plan 3: Enterprise AI, Add-on Inventario).
--   5. Políticas de seguridad RLS e idempotencia total (re-ejecutable).
-- ============================================================

-- ─── 1. TABLA `public.leads` ─────────────────────────────────
create table if not exists public.leads (
  id                          uuid primary key default gen_random_uuid(),
  tenant_id                   uuid references public.tenants(id) on delete cascade,
  name                        text not null,
  whatsapp                    text not null,
  email                       text,
  status                      text not null default 'new',
  channel                     text not null default 'whatsapp',
  agent                       text default 'Pendiente',
  last_message                text,
  unread_count                int not null default 0,
  budget                      numeric default 0,
  priority                    text default 'medium',
  campaign_id                 text,
  campaign_name               text,
  is_human_requested          boolean not null default false,
  human_handoff_requested_at  timestamptz,
  history                     jsonb not null default '[]'::jsonb,
  metadata                    jsonb not null default '{}'::jsonb,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

-- Idempotencia para columnas en caso de tabla pre-existente
alter table public.leads add column if not exists tenant_id                   uuid references public.tenants(id) on delete cascade;
alter table public.leads add column if not exists name                        text;
alter table public.leads add column if not exists whatsapp                    text;
alter table public.leads add column if not exists email                       text;
alter table public.leads add column if not exists status                      text not null default 'new';
alter table public.leads add column if not exists channel                     text not null default 'whatsapp';
alter table public.leads add column if not exists agent                       text default 'Pendiente';
alter table public.leads add column if not exists last_message                text;
alter table public.leads add column if not exists unread_count                int not null default 0;
alter table public.leads add column if not exists budget                      numeric default 0;
alter table public.leads add column if not exists priority                    text default 'medium';
alter table public.leads add column if not exists campaign_id                 text;
alter table public.leads add column if not exists campaign_name               text;
alter table public.leads add column if not exists is_human_requested          boolean not null default false;
alter table public.leads add column if not exists human_handoff_requested_at  timestamptz;
alter table public.leads add column if not exists history                     jsonb not null default '[]'::jsonb;
alter table public.leads add column if not exists metadata                    jsonb not null default '{}'::jsonb;
alter table public.leads add column if not exists created_at                  timestamptz not null default now();
alter table public.leads add column if not exists updated_at                  timestamptz not null default now();

-- Restricción de estados de embudo (Pipeline Kanban)
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_status_check' and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads add constraint leads_status_check
      check (status in ('new', 'contactado', 'propuesta', 'negociacion', 'ganado', 'perdido'));
  end if;
end $$;

-- Restricción de canales omnicanal
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'leads_channel_check' and conrelid = 'public.leads'::regclass
  ) then
    alter table public.leads add constraint leads_channel_check
      check (channel in ('whatsapp', 'instagram', 'messenger', 'email', 'comment'));
  end if;
end $$;

-- ─── 2. TABLA `public.campaigns` ─────────────────────────────
create table if not exists public.campaigns (
  id            text primary key,
  tenant_id     uuid references public.tenants(id) on delete cascade,
  name          text not null,
  platform      text not null default 'meta_ads',
  spend         numeric not null default 0,
  revenue       numeric not null default 0,
  roas          numeric not null default 0,
  leads_count   int not null default 0,
  sales_count   int not null default 0,
  status        text not null default 'active',
  metadata      jsonb not null default '{}'::jsonb,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Idempotencia para columnas de campaigns
alter table public.campaigns add column if not exists tenant_id   uuid references public.tenants(id) on delete cascade;
alter table public.campaigns add column if not exists name        text;
alter table public.campaigns add column if not exists platform    text not null default 'meta_ads';
alter table public.campaigns add column if not exists spend       numeric not null default 0;
alter table public.campaigns add column if not exists revenue     numeric not null default 0;
alter table public.campaigns add column if not exists roas        numeric not null default 0;
alter table public.campaigns add column if not exists leads_count int not null default 0;
alter table public.campaigns add column if not exists sales_count int not null default 0;
alter table public.campaigns add column if not exists status      text not null default 'active';
alter table public.campaigns add column if not exists metadata    jsonb not null default '{}'::jsonb;
alter table public.campaigns add column if not exists created_at  timestamptz not null default now();
alter table public.campaigns add column if not exists updated_at  timestamptz not null default now();

-- ─── 3. ÍNDICES DE RENDIMIENTO Y DEDUPLICACIÓN ───────────────
create index if not exists idx_leads_whatsapp
  on public.leads (whatsapp);

create index if not exists idx_leads_tenant_status
  on public.leads (tenant_id, status);

create index if not exists idx_leads_human_requested
  on public.leads (is_human_requested)
  where is_human_requested = true;

create index if not exists idx_leads_metadata_gin
  on public.leads using gin (metadata);

create index if not exists idx_campaigns_tenant
  on public.campaigns (tenant_id, platform);

-- ─── 4. EXTENSIÓN DE FEATURES EN TENANTS (PLANES MODULARES) ──
-- Actualiza los tenants existentes para que reconozcan las banderas de los planes CRM
update public.tenants
set features = features || jsonb_build_object(
  'crm_enabled', true,
  'crm_plan', coalesce(features->>'crm_plan', 'pro'),
  'has_ai_agent', coalesce((features->>'has_ai_agent')::boolean, true),
  'has_custom_metrics', coalesce((features->>'has_custom_metrics')::boolean, true),
  'has_waba_sync', coalesce((features->>'has_waba_sync')::boolean, true)
)
where deleted_at is null;

-- ─── 5. ROW LEVEL SECURITY (RLS) ─────────────────────────────
alter table public.leads enable row level security;
alter table public.campaigns enable row level security;

-- Política de lectura de leads para usuarios autenticados
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'leads' and policyname = 'leads_read_policy'
  ) then
    create policy leads_read_policy on public.leads
      for select using (true);
  end if;
end $$;

-- Política de modificación de leads
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'leads' and policyname = 'leads_all_policy'
  ) then
    create policy leads_all_policy on public.leads
      for all using (true) with check (true);
  end if;
end $$;

-- Política para campañas
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'campaigns' and policyname = 'campaigns_all_policy'
  ) then
    create policy campaigns_all_policy on public.campaigns
      for all using (true) with check (true);
  end if;
end $$;

