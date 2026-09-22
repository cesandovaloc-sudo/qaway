-- ============================================================
-- FASE 1 · Módulo 2-Agentes · Esquema + RLS estricto por tenant
-- 2026-09-22 · Autoptr: agente-supabase
--
-- Patrón de aislamiento (el MISMO del núcleo central, nunca GUC):
--   SELECT : public.is_admin() OR tenant_id = public.get_auth_tenant_id()
--   WRITE : public.is_admin() OR (public.is_tenant_admin() AND tenant_id = public.get_auth_tenant_id())
--
-- No crea policies nuevas sobre tenants; solo agrega agent_config.
-- ai_settings YA existe (20260917170000): no se toca su default.
-- golden_examples incluye columna embedding (exigida por search_unified_context).
-- Idempotente (IF NOT EXISTS + drop policy if exists).
-- ============================================================

alter table public.tenants
  add column if not exists agent_config jsonb default '{"agent_name":"Asistente Virtual","tone":"ejecutivo_formal","role":"consultoria_ventas","welcome_greeting":"¡Hola! Soy tu asistente virtual. ¿En qué te ayudo?","handover_message":"Te conecto con un asesor humano.","channel":"whatsapp"}'::jsonb;

-- ------------------------------------------------------------
-- conversations
-- ------------------------------------------------------------
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  user_id text not null,
  user_name text,
  channel text not null check (channel in ('whatsapp', 'web')),
  status text default 'active' check (status in ('active', 'closed', 'handoff')),
  metadata jsonb default '{}'::jsonb,
  started_at timestamptz default now(),
  last_activity_at timestamptz default now(),
  closed_at timestamptz
);

alter table public.conversations enable row level security;

drop policy if exists "conversations_select" on public.conversations;
create policy "conversations_select" on public.conversations
  for select using (public.is_admin() or tenant_id = public.get_auth_tenant_id());

drop policy if exists "conversations_manage" on public.conversations;
create policy "conversations_manage" on public.conversations
  for insert with check (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));
-- ALTER POLICY: reutilizar conversations_manage para update/delete
drop policy if exists "conversations_manage_write" on public.conversations;
create policy "conversations_manage_write" on public.conversations
  for update using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()))
  with check (tenant_id = public.get_auth_tenant_id());

drop policy if exists "conversations_manage_delete" on public.conversations;
create policy "conversations_manage_delete" on public.conversations
  for delete using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

create index if not exists idx_conversations_tenant on public.conversations(tenant_id);
create index if not exists idx_conversations_user on public.conversations(tenant_id, user_id);
create index if not exists idx_conversations_status on public.conversations(tenant_id, status);

-- ------------------------------------------------------------
-- messages
-- ------------------------------------------------------------
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  sender text not null check (sender in ('user', 'agent', 'system')),
  text text not null,
  metadata jsonb default '{}'::jsonb,
  tokens_used int default 0,
  latency_ms int,
  created_at timestamptz default now()
);

alter table public.messages enable row level security;

drop policy if exists "messages_select" on public.messages;
create policy "messages_select" on public.messages
  for select using (public.is_admin() or tenant_id = public.get_auth_tenant_id());

drop policy if exists "messages_manage" on public.messages;
create policy "messages_manage" on public.messages
  for insert with check (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

drop policy if exists "messages_manage_write" on public.messages;
create policy "messages_manage_write" on public.messages
  for update using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()))
  with check (tenant_id = public.get_auth_tenant_id());

drop policy if exists "messages_manage_delete" on public.messages;
create policy "messages_manage_delete" on public.messages
  for delete using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

create index if not exists idx_messages_conversation on public.messages(conversation_id);
create index if not exists idx_messages_tenant_created on public.messages(tenant_id, created_at desc);

-- ------------------------------------------------------------
-- message_embeddings (pgvector)
-- ------------------------------------------------------------
create table if not exists public.message_embeddings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  message_id uuid not null references public.messages(id) on delete cascade,
  conversation_id uuid not null references public.conversations(id) on delete cascade,
  content text not null,
  embedding vector(768),
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

alter table public.message_embeddings enable row level security;

drop policy if exists "message_embeddings_select" on public.message_embeddings;
create policy "message_embeddings_select" on public.message_embeddings
  for select using (public.is_admin() or tenant_id = public.get_auth_tenant_id());

drop policy if exists "message_embeddings_manage" on public.message_embeddings;
create policy "message_embeddings_manage" on public.message_embeddings
  for insert with check (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

drop policy if exists "message_embeddings_manage_write" on public.message_embeddings;
create policy "message_embeddings_manage_write" on public.message_embeddings
  for update using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()))
  with check (tenant_id = public.get_auth_tenant_id());

drop policy if exists "message_embeddings_manage_delete" on public.message_embeddings;
create policy "message_embeddings_manage_delete" on public.message_embeddings
  for delete using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

create index if not exists idx_message_embeddings_vector on public.message_embeddings
  using hnsw (embedding vector_cosine_ops) with (m = 16, ef_construction = 64);
create index if not exists idx_embeddings_tenant on public.message_embeddings(tenant_id);
create index if not exists idx_embeddings_conversation on public.message_embeddings(conversation_id);

-- ------------------------------------------------------------
-- knowledge_base
-- ------------------------------------------------------------
create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  category text,
  content text not null,
  reference_price text,
  source_url text,
  embedding vector(768),
  metadata jsonb default '{}'::jsonb,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.knowledge_base enable row level security;

drop policy if exists "knowledge_base_select" on public.knowledge_base;
create policy "knowledge_base_select" on public.knowledge_base
  for select using (public.is_admin() or tenant_id = public.get_auth_tenant_id());

drop policy if exists "knowledge_base_manage" on public.knowledge_base;
create policy "knowledge_base_manage" on public.knowledge_base
  for insert with check (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

drop policy if exists "knowledge_base_manage_write" on public.knowledge_base;
create policy "knowledge_base_manage_write" on public.knowledge_base
  for update using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()))
  with check (tenant_id = public.get_auth_tenant_id());

drop policy if exists "knowledge_base_manage_delete" on public.knowledge_base;
create policy "knowledge_base_manage_delete" on public.knowledge_base
  for delete using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

create index if not exists idx_kb_embedding on public.knowledge_base
  using hnsw (embedding vector_cosine_ops) with (m = 16, ef_construction = 64);
create index if not exists idx_kb_tenant on public.knowledge_base(tenant_id);
create index if not exists idx_kb_category on public.knowledge_base(tenant_id, category);

-- ------------------------------------------------------------
-- faqs
-- ------------------------------------------------------------
create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  question text not null,
  answer text not null,
  embedding vector(768),
  category text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.faqs enable row level security;

drop policy if exists "faqs_select" on public.faqs;
create policy "faqs_select" on public.faqs
  for select using (public.is_admin() or tenant_id = public.get_auth_tenant_id());

drop policy if exists "faqs_manage" on public.faqs;
create policy "faqs_manage" on public.faqs
  for insert with check (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

drop policy if exists "faqs_manage_write" on public.faqs;
create policy "faqs_manage_write" on public.faqs
  for update using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()))
  with check (tenant_id = public.get_auth_tenant_id());

drop policy if exists "faqs_manage_delete" on public.faqs;
create policy "faqs_manage_delete" on public.faqs
  for delete using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

create index if not exists idx_faqs_embedding on public.faqs using hnsw (embedding vector_cosine_ops);
create index if not exists idx_faqs_tenant on public.faqs(tenant_id);

-- ------------------------------------------------------------
-- golden_examples (incluye embedding: exigido por search_unified_context)
-- ------------------------------------------------------------
create table if not exists public.golden_examples (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  category text not null check (category in ('precio', 'fuera_catalogo', 'queja_insulto', 'tecnica', 'casual')),
  user_question text not null,
  ideal_answer text not null,
  rationale text,
  embedding vector(768),
  is_approved boolean default false,
  source text default 'manual',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.golden_examples enable row level security;

drop policy if exists "golden_examples_select" on public.golden_examples;
create policy "golden_examples_select" on public.golden_examples
  for select using (public.is_admin() or tenant_id = public.get_auth_tenant_id());

drop policy if exists "golden_examples_manage" on public.golden_examples;
create policy "golden_examples_manage" on public.golden_examples
  for insert with check (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

drop policy if exists "golden_examples_manage_write" on public.golden_examples;
create policy "golden_examples_manage_write" on public.golden_examples
  for update using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()))
  with check (tenant_id = public.get_auth_tenant_id());

drop policy if exists "golden_examples_manage_delete" on public.golden_examples;
create policy "golden_examples_manage_delete" on public.golden_examples
  for delete using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

create index if not exists idx_golden_embedding on public.golden_examples using hnsw (embedding vector_cosine_ops);
create index if not exists idx_golden_tenant on public.golden_examples(tenant_id);
create index if not exists idx_golden_approved on public.golden_examples(tenant_id, is_approved);

-- ------------------------------------------------------------
-- correction_logs
-- ------------------------------------------------------------
create table if not exists public.correction_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  message_id uuid references public.messages(id) on delete set null,
  user_query text not null,
  bad_agent_reply text not null,
  human_correction text not null,
  status text default 'pendiente' check (status in ('pendiente', 'aplicado', 'descartado')),
  reviewer_id text,
  created_at timestamptz default now(),
  applied_at timestamptz
);

alter table public.correction_logs enable row level security;

drop policy if exists "correction_logs_select" on public.correction_logs;
create policy "correction_logs_select" on public.correction_logs
  for select using (public.is_admin() or tenant_id = public.get_auth_tenant_id());

drop policy if exists "correction_logs_manage" on public.correction_logs;
create policy "correction_logs_manage" on public.correction_logs
  for insert with check (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

drop policy if exists "correction_logs_manage_write" on public.correction_logs;
create policy "correction_logs_manage_write" on public.correction_logs
  for update using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()))
  with check (tenant_id = public.get_auth_tenant_id());

drop policy if exists "correction_logs_manage_delete" on public.correction_logs;
create policy "correction_logs_manage_delete" on public.correction_logs
  for delete using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

create index if not exists idx_corrections_tenant on public.correction_logs(tenant_id);
create index if not exists idx_corrections_status on public.correction_logs(tenant_id, status);

-- ------------------------------------------------------------
-- stress_test_results
-- ------------------------------------------------------------
create table if not exists public.stress_test_results (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  test_case_id text not null,
  round text not null check (round in ('1_happy_path', '2_fuera_catalogo', '3_human_handoff', '4_insultos_seguridad')),
  user_prompt text not null,
  expected_behavior text not null,
  actual_reply text,
  result text check (result in ('passed', 'failed', 'untested')),
  promoted_to_golden boolean default false,
  run_at timestamptz default now()
);

alter table public.stress_test_results enable row level security;

drop policy if exists "stress_test_results_select" on public.stress_test_results;
create policy "stress_test_results_select" on public.stress_test_results
  for select using (public.is_admin() or tenant_id = public.get_auth_tenant_id());

drop policy if exists "stress_test_results_manage" on public.stress_test_results;
create policy "stress_test_results_manage" on public.stress_test_results
  for insert with check (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

drop policy if exists "stress_test_results_manage_write" on public.stress_test_results;
create policy "stress_test_results_manage_write" on public.stress_test_results
  for update using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()))
  with check (tenant_id = public.get_auth_tenant_id());

drop policy if exists "stress_test_results_manage_delete" on public.stress_test_results;
create policy "stress_test_results_manage_delete" on public.stress_test_results
  for delete using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

create index if not exists idx_stress_tenant on public.stress_test_results(tenant_id);
create index if not exists idx_stress_result on public.stress_test_results(tenant_id, result);

-- ------------------------------------------------------------
-- training_sessions
-- ------------------------------------------------------------
create table if not exists public.training_sessions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  started_at timestamptz default now(),
  graduated_at timestamptz,
  supervisor_id text,
  metrics jsonb default '{"total_conversations":0,"approved_messages":0,"rejected_messages":0,"corrections_made":0,"golden_examples_created":0,"handoffs_triggered":0,"compliance_score":100}'::jsonb,
  status text default 'active' check (status in ('active', 'graduated', 'extended', 'failed'))
);

alter table public.training_sessions enable row level security;

drop policy if exists "training_sessions_select" on public.training_sessions;
create policy "training_sessions_select" on public.training_sessions
  for select using (public.is_admin() or tenant_id = public.get_auth_tenant_id());

drop policy if exists "training_sessions_manage" on public.training_sessions;
create policy "training_sessions_manage" on public.training_sessions
  for insert with check (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

drop policy if exists "training_sessions_manage_write" on public.training_sessions;
create policy "training_sessions_manage_write" on public.training_sessions
  for update using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()))
  with check (tenant_id = public.get_auth_tenant_id());

drop policy if exists "training_sessions_manage_delete" on public.training_sessions;
create policy "training_sessions_manage_delete" on public.training_sessions
  for delete using (public.is_admin() or (public.is_tenant_admin() and tenant_id = public.get_auth_tenant_id()));

create index if not exists idx_training_tenant on public.training_sessions(tenant_id);
create index if not exists idx_training_status on public.training_sessions(tenant_id, status);

-- ------------------------------------------------------------
-- Grants mínimos: authenticated opera bajo RLS; anon nada.
-- ------------------------------------------------------------
grant select, insert, update, delete on
  public.conversations, public.messages, public.message_embeddings,
  public.knowledge_base, public.faqs, public.golden_examples,
  public.correction_logs, public.stress_test_results, public.training_sessions
  to authenticated;

revoke all on
  public.conversations, public.messages, public.message_embeddings,
  public.knowledge_base, public.faqs, public.golden_examples,
  public.correction_logs, public.stress_test_results, public.training_sessions
  from anon;