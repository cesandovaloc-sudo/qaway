-- ============================================================
-- FASE 1 · Módulo 2-Agentes · Funciones RPC
-- 2026-09-22 · Autoptr: agente-supabase
--
-- SECURITY INVOKER + RLS de las tablas => un cliente autenticado
-- solo recupera datos de su propio tenant aunque pase otro tenant_id.
-- service_role (Edge Functions) las usa sin fricción.
-- Grants: execute solo a authenticated (anon bloqueado).
-- ============================================================

-- ------------------------------------------------------------
-- 2.1 Búsqueda vectorial Knowledge Base
-- ------------------------------------------------------------
create or replace function public.search_knowledge_base(
  p_tenant_id uuid,
  p_query_embedding vector(768),
  p_top_k int default 3,
  p_category text default null
)
returns table (
  id uuid,
  title text,
  category text,
  content text,
  reference_price text,
  similarity float
)
language sql stable security invoker as $$
  select
    kb.id, kb.title, kb.category, kb.content, kb.reference_price,
    1 - (kb.embedding <=> p_query_embedding) as similarity
  from public.knowledge_base kb
  where kb.tenant_id = p_tenant_id
    and kb.is_active = true
    and (p_category is null or kb.category = p_category)
    and kb.embedding is not null
  order by kb.embedding <=> p_query_embedding
  limit p_top_k;
$$;

-- ------------------------------------------------------------
-- 2.2 Búsqueda vectorial FAQs
-- ------------------------------------------------------------
create or replace function public.search_faqs(
  p_tenant_id uuid,
  p_query_embedding vector(768),
  p_top_k int default 3
)
returns table (
  id uuid,
  question text,
  answer text,
  category text,
  similarity float
)
language sql stable security invoker as $$
  select
    f.id, f.question, f.answer, f.category,
    1 - (f.embedding <=> p_query_embedding) as similarity
  from public.faqs f
  where f.tenant_id = p_tenant_id
    and f.is_active = true
    and f.embedding is not null
  order by f.embedding <=> p_query_embedding
  limit p_top_k;
$$;

-- ------------------------------------------------------------
-- 2.3 Búsqueda unificada (KB + FAQs + Golden aprobados)
-- ------------------------------------------------------------
create or replace function public.search_unified_context(
  p_tenant_id uuid,
  p_query_embedding vector(768),
  p_top_k int default 5
)
returns table (
  source text,
  id uuid,
  title text,
  content text,
  similarity float
)
language sql stable security invoker as $$
  select 'knowledge_base'::text as source, kb.id, kb.title, kb.content,
         1 - (kb.embedding <=> p_query_embedding) as similarity
  from public.knowledge_base kb
  where kb.tenant_id = p_tenant_id
    and kb.is_active = true
    and kb.embedding is not null

  union all

  select 'faqs'::text as source, f.id, f.question as title, f.answer as content,
         1 - (f.embedding <=> p_query_embedding) as similarity
  from public.faqs f
  where f.tenant_id = p_tenant_id
    and f.is_active = true
    and f.embedding is not null

  union all

  select 'golden_examples'::text as source, ge.id, ge.user_question as title,
         ge.ideal_answer as content,
         1 - (ge.embedding <=> p_query_embedding) as similarity
  from public.golden_examples ge
  where ge.tenant_id = p_tenant_id
    and ge.is_approved = true
    and ge.embedding is not null

  order by similarity desc
  limit p_top_k;
$$;

-- ------------------------------------------------------------
-- 2.4 Resolver tenant por WhatsApp Phone Number ID
-- (RPC interna para service_role; con RLS devuelve solo el propio)
-- ------------------------------------------------------------
create or replace function public.resolve_tenant_by_waba(
  p_waba_phone_number_id text
)
returns table (
  id uuid,
  slug text,
  name text,
  ai_settings jsonb,
  agent_config jsonb
)
language sql stable security invoker as $$
  select t.id, t.slug, t.name, t.ai_settings, t.agent_config
  from public.tenants t
  where t.ai_settings->>'waba_phone_number_id' = p_waba_phone_number_id
    and t.ai_settings->>'enabled' = 'true'
  limit 1;
$$;

-- Grants: authenticated puede ejecutar; anon no.
revoke execute on function
  public.search_knowledge_base(uuid, vector(768), int, text),
  public.search_faqs(uuid, vector(768), int),
  public.search_unified_context(uuid, vector(768), int),
  public.resolve_tenant_by_waba(text)
from public;

grant execute on function
  public.search_knowledge_base(uuid, vector(768), int, text),
  public.search_faqs(uuid, vector(768), int),
  public.search_unified_context(uuid, vector(768), int),
  public.resolve_tenant_by_waba(text)
to authenticated;