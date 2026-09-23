# MIGRACIÓN SUPABASE — Agentes de IA Responsable (Multi-Tenant)

**Para:** Agente Supabase / Database Engineer  
**Versión:** 2.0 — Septiembre 2026  
**Contexto:** Hub Qaway Lab — Módulo 2-Agentes  
**Objetivo:** Persistencia real + RLS estricto (public.get_auth_tenant_id()) + pgvector para RAG + Webhook WhatsApp + Fase 2 (Edge Functions + Vault + Cron)

---

## 1. ESQUEMA COMPLETO (SQL)

### 1.1 Extensiones requeridas
```sql
-- Habilitar pgvector para embeddings (RAG)
CREATE EXTENSION IF NOT EXISTS vector;

-- UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### 1.2 Tabla `tenants` (extendida)
```sql
-- Si no existe, crear base
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  industry TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Campos NUEVOS para agentes
ALTER TABLE tenants ADD COLUMN IF NOT EXISTS ai_settings JSONB DEFAULT '{
  "enabled": true,
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "mode": "managed",
  "temperature": 0.3,
  "waba_phone_number_id": null,
  "waba_access_token_encrypted": null,
  "human_handoff_keywords": ["humano", "asesor", "queja", "reclamo"],
  "system_prompt": "",
  "training_mode": false,
  "training_started_at": null,
  "supervisor_ids": [],
  "llm_provider": "gemini",
  "llm_api_key_encrypted": null
}'::jsonb;

ALTER TABLE tenants ADD COLUMN IF NOT EXISTS agent_config JSONB DEFAULT '{
  "agent_name": "Asistente Virtual",
  "tone": "ejecutivo_formal",
  "role": "consultoria_ventas",
  "welcome_greeting": "¡Hola! Soy tu asistente virtual. ¿En qué te ayudo?",
  "handover_message": "Te conecto con un asesor humano.",
  "channel": "whatsapp"
}'::jsonb;

-- Índices
CREATE INDEX IF NOT EXISTS idx_tenants_slug ON tenants(slug);
CREATE INDEX IF NOT EXISTS idx_tenants_ai_settings_training ON tenants USING GIN ((ai_settings->'training_mode'));
```

### 1.3 Tabla `conversations` (RLS por tenant)
```sql
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL, -- phone number o session ID
  user_name TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('whatsapp', 'web')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'closed', 'handoff')),
  metadata JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

-- RLS: Cada tenant solo ve sus conversaciones (usa public.get_auth_tenant_id() security definer)
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_conversations" ON conversations
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Índices
CREATE INDEX IF NOT EXISTS idx_conversations_tenant ON conversations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_conversations_user ON conversations(tenant_id, user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(tenant_id, status);
```

### 1.4 Tabla `messages` (RLS por tenant via conversation)
```sql
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE, -- duplicado para RLS directo
  sender TEXT NOT NULL CHECK (sender IN ('user', 'agent', 'system')),
  text TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb, -- compliance flags, matched_golden_example, etc.
  tokens_used INT DEFAULT 0,
  latency_ms INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_messages" ON messages
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Índices
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_tenant_created ON messages(tenant_id, created_at DESC);
```

### 1.5 Tabla `message_embeddings` (pgvector para RAG)
```sql
CREATE TABLE IF NOT EXISTS message_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL, -- texto original para referencia
  embedding VECTOR(768), -- dimensión 768 (Gemini text-embedding-004)
  metadata JSONB DEFAULT '{}'::jsonb, -- {type: 'user'|'agent', topic: '...'}
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE message_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_embeddings" ON message_embeddings
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Índice vectorial (HNSW para búsqueda aproximada rápida)
CREATE INDEX IF NOT EXISTS idx_message_embeddings_vector 
  ON message_embeddings USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Índices adicionales
CREATE INDEX IF NOT EXISTS idx_embeddings_tenant ON message_embeddings(tenant_id);
CREATE INDEX IF NOT EXISTS idx_embeddings_conversation ON message_embeddings(conversation_id);
```

### 1.6 Tabla `knowledge_base` (documentos estructurados + embeddings)
```sql
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  category TEXT,
  content TEXT NOT NULL,
  reference_price TEXT,
  source_url TEXT,
  embedding VECTOR(768),
  metadata JSONB DEFAULT '{}'::jsonb, -- {tags: [], priority: 1, is_demo: boolean}
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_kb" ON knowledge_base
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

-- Índice vectorial
CREATE INDEX IF NOT EXISTS idx_kb_embedding 
  ON knowledge_base USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS idx_kb_tenant ON knowledge_base(tenant_id);
CREATE INDEX IF NOT EXISTS idx_kb_category ON knowledge_base(tenant_id, category);
```

### 1.7 Tabla `faqs` (preguntas frecuentes + embeddings)
```sql
CREATE TABLE IF NOT EXISTS faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  embedding VECTOR(768),
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_faqs" ON faqs
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

CREATE INDEX IF NOT EXISTS idx_faqs_embedding 
  ON faqs USING hnsw (embedding vector_cosine_ops);
CREATE INDEX IF NOT EXISTS idx_faqs_tenant ON faqs(tenant_id);
```

### 1.8 Tabla `golden_examples` (Few-Shot aprobados)
```sql
CREATE TABLE IF NOT EXISTS golden_examples (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('precio', 'fuera_catalogo', 'queja_insulto', 'tecnica', 'casual')),
  user_question TEXT NOT NULL,
  ideal_answer TEXT NOT NULL,
  rationale TEXT,
  is_approved BOOLEAN DEFAULT false,
  source TEXT DEFAULT 'manual', -- 'manual' | 'live_training' | 'stress_test'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE golden_examples ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_golden" ON golden_examples
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

CREATE INDEX IF NOT EXISTS idx_golden_tenant ON golden_examples(tenant_id);
CREATE INDEX IF NOT EXISTS idx_golden_approved ON golden_examples(tenant_id, is_approved);
```

### 1.9 Tabla `correction_logs` (Human-in-the-loop)
```sql
CREATE TABLE IF NOT EXISTS correction_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  user_query TEXT NOT NULL,
  bad_agent_reply TEXT NOT NULL,
  human_correction TEXT NOT NULL,
  status TEXT DEFAULT 'pendiente' CHECK (status IN ('pendiente', 'aplicado', 'descartado')),
  reviewer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  applied_at TIMESTAMPTZ
);

ALTER TABLE correction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_corrections" ON correction_logs
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

CREATE INDEX IF NOT EXISTS idx_corrections_tenant ON correction_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_corrections_status ON correction_logs(tenant_id, status);
```

### 1.10 Tabla `stress_test_results` (Red Teaming)
```sql
CREATE TABLE IF NOT EXISTS stress_test_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  test_case_id TEXT NOT NULL, -- 'st-1', 'st-2', etc.
  round TEXT NOT NULL CHECK (round IN ('1_happy_path', '2_fuera_catalogo', '3_human_handoff', '4_insultos_seguridad')),
  user_prompt TEXT NOT NULL,
  expected_behavior TEXT NOT NULL,
  actual_reply TEXT,
  result TEXT CHECK (result IN ('passed', 'failed', 'untested')),
  promoted_to_golden BOOLEAN DEFAULT false,
  run_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE stress_test_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_stress" ON stress_test_results
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

CREATE INDEX IF NOT EXISTS idx_stress_tenant ON stress_test_results(tenant_id);
CREATE INDEX IF NOT EXISTS idx_stress_result ON stress_test_results(tenant_id, result);
```

### 1.11 Tabla `training_sessions` (Auditoría 24h)
```sql
CREATE TABLE IF NOT EXISTS training_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  graduated_at TIMESTAMPTZ,
  supervisor_id TEXT,
  metrics JSONB DEFAULT '{
    "total_conversations": 0,
    "approved_messages": 0,
    "rejected_messages": 0,
    "corrections_made": 0,
    "golden_examples_created": 0,
    "handoffs_triggered": 0,
    "compliance_score": 100
  }'::jsonb,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'graduated', 'extended', 'failed'))
);

ALTER TABLE training_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tenant_isolation_training" ON training_sessions
  FOR ALL USING (tenant_id = public.get_auth_tenant_id());

CREATE INDEX IF NOT EXISTS idx_training_tenant ON training_sessions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_training_status ON training_sessions(tenant_id, status);
```

---

## 2. FUNCIONES RPC (Server-side para performance)

### 2.1 Búsqueda vectorial Knowledge Base
```sql
CREATE OR REPLACE FUNCTION search_knowledge_base(
  p_tenant_id UUID,
  p_query_embedding VECTOR(768),
  p_top_k INT DEFAULT 3,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  title TEXT,
  category TEXT,
  content TEXT,
  reference_price TEXT,
  similarity FLOAT
) LANGUAGE sql STABLE AS $$
  SELECT 
    kb.id, kb.title, kb.category, kb.content, kb.reference_price,
    1 - (kb.embedding <=> p_query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE kb.tenant_id = p_tenant_id
    AND kb.is_active = true
    AND (p_category IS NULL OR kb.category = p_category)
    AND kb.embedding IS NOT NULL
  ORDER BY kb.embedding <=> p_query_embedding
  LIMIT p_top_k;
$$;
```

### 2.2 Búsqueda vectorial FAQs
```sql
CREATE OR REPLACE FUNCTION search_faqs(
  p_tenant_id UUID,
  p_query_embedding VECTOR(768),
  p_top_k INT DEFAULT 3
)
RETURNS TABLE (
  id UUID,
  question TEXT,
  answer TEXT,
  category TEXT,
  similarity FLOAT
) LANGUAGE sql STABLE AS $$
  SELECT 
    f.id, f.question, f.answer, f.category,
    1 - (f.embedding <=> p_query_embedding) AS similarity
  FROM faqs f
  WHERE f.tenant_id = p_tenant_id
    AND f.is_active = true
    AND f.embedding IS NOT NULL
  ORDER BY f.embedding <=> p_query_embedding
  LIMIT p_top_k;
$$;
```

### 2.3 Búsqueda unificada (KB + FAQs + Golden Examples)
```sql
CREATE OR REPLACE FUNCTION search_unified_context(
  p_tenant_id UUID,
  p_query_embedding VECTOR(768),
  p_top_k INT DEFAULT 5
)
RETURNS TABLE (
  source TEXT, -- 'knowledge_base' | 'faqs' | 'golden_examples'
  id UUID,
  title TEXT,
  content TEXT,
  similarity FLOAT
) LANGUAGE sql STABLE AS $$
  -- Knowledge Base
  SELECT 
    'knowledge_base'::TEXT AS source,
    kb.id,
    kb.title,
    kb.content,
    1 - (kb.embedding <=> p_query_embedding) AS similarity
  FROM knowledge_base kb
  WHERE kb.tenant_id = p_tenant_id
    AND kb.is_active = true
    AND kb.embedding IS NOT NULL
  
  UNION ALL
  
  -- FAQs
  SELECT 
    'faqs'::TEXT AS source,
    f.id,
    f.question AS title,
    f.answer AS content,
    1 - (f.embedding <=> p_query_embedding) AS similarity
  FROM faqs f
  WHERE f.tenant_id = p_tenant_id
    AND f.is_active = true
    AND f.embedding IS NOT NULL
  
  UNION ALL
  
  -- Golden Examples (solo aprobados)
  SELECT 
    'golden_examples'::TEXT AS source,
    ge.id,
    ge.user_question AS title,
    ge.ideal_answer AS content,
    1 - (ge.embedding <=> p_query_embedding) AS similarity
  FROM golden_examples ge
  WHERE ge.tenant_id = p_tenant_id
    AND ge.is_approved = true
    AND ge.embedding IS NOT NULL
  
  ORDER BY similarity DESC
  LIMIT p_top_k;
$$;
```

### 2.4 Resolver tenant por WhatsApp Phone Number ID
```sql
CREATE OR REPLACE FUNCTION resolve_tenant_by_waba(
  p_waba_phone_number_id TEXT
)
RETURNS TABLE (
  id UUID,
  slug TEXT,
  name TEXT,
  ai_settings JSONB,
  agent_config JSONB
) LANGUAGE sql STABLE AS $$
  SELECT 
    t.id, t.slug, t.name, t.ai_settings, t.agent_config
  FROM tenants t
  WHERE t.ai_settings->>'waba_phone_number_id' = p_waba_phone_number_id
    AND t.ai_settings->>'enabled' = 'true'
  LIMIT 1;
$$;
```

### 2.5 Graduación automática (cron job)
```sql
CREATE OR REPLACE FUNCTION graduate_training_sessions()
RETURNS VOID LANGUAGE plpgsql AS $$
DECLARE
  rec RECORD;
BEGIN
  FOR rec IN
    SELECT ts.id, ts.tenant_id
    FROM training_sessions ts
    JOIN tenants t ON t.id = ts.tenant_id
    WHERE ts.status = 'active'
      AND ts.started_at < NOW() - INTERVAL '24 hours'
      AND (ts.metrics->>'compliance_score')::INT >= 90
      AND NOT EXISTS (
        SELECT 1 FROM stress_test_results str
        WHERE str.tenant_id = ts.tenant_id
          AND str.result = 'failed'
          AND str.run_at > ts.started_at
      )
  LOOP
    UPDATE training_sessions SET status = 'graduated', graduated_at = NOW() WHERE id = rec.id;
    UPDATE tenants SET ai_settings = jsonb_set(ai_settings, '{training_mode}', 'false') WHERE id = rec.tenant_id;
  END LOOP;
END;
$$;

-- Programar cada hora (pg_cron)
-- SELECT cron.schedule('graduate-training-hourly', '0 * * * *', 'SELECT graduate_training_sessions();');
```

---

## 3. TRIGGERS Y AUTOMATISMOS

### 3.1 Auto-embedding al insertar knowledge_base
```sql
CREATE OR REPLACE FUNCTION generate_embedding_for_kb()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- En producción: llamar a Edge Function que use embedding model
  -- NEW.embedding := get_embedding(NEW.content);
  -- Por ahora: NULL (se llena via batch job)
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_kb_embedding
  BEFORE INSERT OR UPDATE ON knowledge_base
  FOR EACH ROW EXECUTE FUNCTION generate_embedding_for_kb();
```

### 3.2 Auto-embedding al insertar faqs
```sql
CREATE OR REPLACE FUNCTION generate_embedding_for_faq()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- NEW.embedding := get_embedding(NEW.question || ' ' || NEW.answer);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_faq_embedding
  BEFORE INSERT OR UPDATE ON faqs
  FOR EACH ROW EXECUTE FUNCTION generate_embedding_for_faq();
```

### 3.3 Auto-embedding al insertar golden_examples
```sql
CREATE OR REPLACE FUNCTION generate_embedding_for_golden()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- NEW.embedding := get_embedding(NEW.user_question || ' ' || NEW.ideal_answer);
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_golden_embedding
  BEFORE INSERT OR UPDATE ON golden_examples
  FOR EACH ROW EXECUTE FUNCTION generate_embedding_for_golden();
```

### 3.4 Actualizar `last_activity_at` en conversations
```sql
CREATE OR REPLACE FUNCTION update_conversation_activity()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  UPDATE conversations 
  SET last_activity_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_conversation_activity
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION update_conversation_activity();
```

---

## 4. EDGE FUNCTIONS REQUERIDAS

### 4.1 `whatsapp-webhook` (recibe Meta → procesa → responde)
```
Endpoint: POST /functions/v1/whatsapp-webhook
Headers: X-Hub-Signature-256 (validación Meta)
Body: WhatsApp Cloud API webhook payload

Flujo:
1. Validar firma HMAC
2. Extraer: waba_phone_number_id, from (user phone), message text
3. SELECT resolve_tenant_by_waba(waba_phone_number_id) → tenant
4. SET LOCAL app.current_tenant_id = tenant.id (RLS context)
5. INSERT conversation (upsert by user_id + tenant_id)
6. INSERT message (user)
7. Generar embedding del mensaje usuario
8. CALL search_unified_context(tenant_id, embedding, 5) → context
9. Compilar prompt: Capa 0 + Capa 1 + Capa 2 (context) + Few-Shot
10. Llamar LLM (Gemini/OpenAI/Anthropic) según tenant.ai_settings
11. INSERT message (agent) con compliance flags
12. Generar embedding respuesta agente
13. Responder a Meta Cloud API (Send Message)
14. Si training_mode = true Y no handoff: forzar handoff + notificar supervisores
```

### 4.2 `generate-embeddings` (batch job nocturno)
```
Endpoint: POST /functions/v1/generate-embeddings
Schedule: Diario 03:00 AM (pg_cron)

Procesa:
- knowledge_base WHERE embedding IS NULL
- faqs WHERE embedding IS NULL  
- golden_examples WHERE embedding IS NULL
- messages (últimas 24h) WHERE embedding IS NULL

Usa: tenant.ai_settings.llm_provider + llm_api_key_encrypted (Vault)
```

### 4.3 `ingest-historical-data` (onboarding cliente)
```
Endpoint: POST /functions/v1/ingest-historical-data
Body: { tenant_id, csv_url, mapping_config }

Procesa CSV/JSON exportado de CRM anterior:
- Conversaciones → conversations + messages + embeddings
- FAQs → faqs + embeddings
- Catálogo → knowledge_base + embeddings
- Golden Examples previos → golden_examples + embeddings
```

---

## 5. VAULT / SECRETS (Credenciales sensibles)

```sql
-- En Supabase Vault (Dashboard → Vault)
-- Secrets por tenant (namespace = tenant_id):

-- waba_access_token (WhatsApp Business API)
-- name: waba_access_token
-- value: <token_meta>

-- llm_api_key (BYOK)
-- name: llm_api_key  
-- value: <sk-... o GEMINI_KEY>

-- En Edge Functions acceder via:
-- const secret = await supabase.vault.getSecret('waba_access_token', { namespace: tenantId })
```

---

## 6. POLÍTICAS RLS — RESUMEN DE SEGURIDAD

| Tabla | Policy | Condición |
|-------|--------|-----------|
| `tenants` | Solo owners/admins | `auth.uid() IN (SELECT supervisor_ids FROM tenants WHERE id = tenants.id)` |
| `conversations` | Tenant isolation | `tenant_id = public.get_auth_tenant_id()` |
| `messages` | Tenant isolation | `tenant_id = public.get_auth_tenant_id()` |
| `message_embeddings` | Tenant isolation | `tenant_id = public.get_auth_tenant_id()` |
| `knowledge_base` | Tenant isolation | `tenant_id = public.get_auth_tenant_id()` |
| `faqs` | Tenant isolation | `tenant_id = public.get_auth_tenant_id()` |
| `golden_examples` | Tenant isolation | `tenant_id = public.get_auth_tenant_id()` |
| `correction_logs` | Tenant isolation | `tenant_id = public.get_auth_tenant_id()` |
| `stress_test_results` | Tenant isolation | `tenant_id = public.get_auth_tenant_id()` |
| `training_sessions` | Tenant isolation | `tenant_id = public.get_auth_tenant_id()` |

**Crítico:** En Edge Functions, **SIEMPRE** hacer:
```typescript
await supabase.rpc('set_config', { 
  setting_name: 'app.current_tenant_id', 
  setting_value: tenantId, 
  is_local: true 
})
```
Antes de cualquier query.

**Nota:** `public.get_auth_tenant_id()` es security definer y resuelve el tenant del JWT sin confiar en input del cliente. El GUC `app.current_tenant_id` solo se usa DENTRO de Edge Functions con rol de servicio (SET LOCAL antes de cada query). Tu app/cliente NUNCA setea GUCs; tu frontend habla con su sesión normal.

---

## 7. MIGRACIÓN DE DATOS INICIALES (Seeds)

**Tenants REALES (ya existen en BD Central — NO crear):**
| Tenant | UUID | slug |
|--------|------|------|
| Qaway Lab | `00000000-0000-0000-0000-000000000001` | `qaway-lab` |
| CoraVet | `06bacf31-6699-4ef5-9843-e58b835c6b2b` | `coravet` |
| Estudio Contable | *(existe)* | `epc-contable` |
| Vallet Inmobiliaria | *(existe)* | `vallet-inmobiliaria` |

**Seeds DEMO (solo en `qaway-lab` / `00000000-0000-0000-0000-000000000001`):**
```sql
-- Vector demo DETERMINISTA (768 dims, idéntico al cliente)
-- const DEMO_VECTOR_768 = new Array(768).fill(0.01)
-- En SQL: ARRAY_FILL(0.01::float, ARRAY[768])::vector(768)

-- knowledge_base demo
INSERT INTO knowledge_base (tenant_id, title, category, content, reference_price, embedding, metadata) VALUES
('00000000-0000-0000-0000-000000000001', 'Sistemas Web y Apps a Medida', 'Desarrollo', 'Arquitecturas SaaS completas en React 19, Vite, Supabase, Tailwind v4 y PostgreSQL con alta disponibilidad y UX ergonómico.', 'Cotización sujeta a alcance tras diagnóstico técnico', ARRAY_FILL(0.01::float, ARRAY[768])::vector(768), '{"is_demo": true, "source": "seed"}'),
('00000000-0000-0000-0000-000000000001', 'Notion Enterprise & SOPs de Negocio', 'Operaciones', 'Sistemas operativos completos para empresas, gestión de procesos, CRM interno y tableros operativos en Notion.', 'Plantilla Pro oficial: S/ 49 o $15 USD', ARRAY_FILL(0.01::float, ARRAY[768])::vector(768), '{"is_demo": true, "source": "seed"}'),
('00000000-0000-0000-0000-000000000001', 'Comercio Conversacional & WhatsApp CRM WABA', 'Comercio', 'Integración oficial de WhatsApp Business API, flujos nativos de catálogo, cobros y agentes inteligentes multi-tenant.', 'Planes desde $49 USD/mes según volumen', ARRAY_FILL(0.01::float, ARRAY[768])::vector(768), '{"is_demo": true, "source": "seed"}')
ON CONFLICT DO NOTHING;

-- faqs demo
INSERT INTO faqs (tenant_id, question, answer, embedding, category) VALUES
('00000000-0000-0000-0000-000000000001', '¿Qué garantía tienen los desarrollos de Qaway Lab?', 'Todos nuestros proyectos cuentan con garantía técnica de estabilización, soporte continuo y trazabilidad de código con commits y despliegues auditados.', ARRAY_FILL(0.01::float, ARRAY[768])::vector(768), 'general'),
('00000000-0000-0000-0000-000000000001', '¿Cómo puedo agendar una llamada con un asesor?', 'Puedes escribir la palabra "asesor" en este chat o acceder a nuestro calendario público en /hub/agenda para reservar tu sesión de diagnóstico.', ARRAY_FILL(0.01::float, ARRAY[768])::vector(768), 'general')
ON CONFLICT DO NOTHING;

-- golden_examples demo (is_approved = true para aparecer en search_unified_context)
INSERT INTO golden_examples (tenant_id, category, user_question, ideal_answer, rationale, is_approved, source) VALUES
('00000000-0000-0000-0000-000000000001', 'precio', '¿Me puedes dejar la plantilla Notion a mitad de precio si te pago ya?', 'Nuestros precios reflejan la estructura lista para operar y los SOPs probados que entregamos. El valor promocional oficial es de S/ 49 o $15 USD. Si tienes un equipo de más de 3 personas, con gusto coordinamos un paquete corporativo con un asesor.', 'No regatear de forma arbitraria; mantener el valor de la solución sin ser grosero y ofrecer llamada corporativa.', true, 'seed'),
('00000000-0000-0000-0000-000000000001', 'fuera_catalogo', '¿Hacen reparación física de laptops o computadoras?', 'En Qaway Lab nos especializamos exclusivamente en software: desarrollo web, SaaS, automatizaciones con IA y Notion Enterprise. No brindamos soporte de hardware físico. ¿Hay algún sistema digital o app que te gustaría evaluar?', 'Declarar honestamente que no es nuestro rubro y reorientar al cliente hacia el catálogo oficial.', true, 'seed'),
('00000000-0000-0000-0000-000000000001', 'queja_insulto', 'Son unos estafadores, nadie me responde en soporte', 'Lamento sinceramente cualquier demora o malestar ocasionado. En Qaway Lab nos tomamos muy en serio la satisfacción de nuestros clientes. Estoy elevando tu caso de inmediato con el área de soporte técnico para que te atiendan con prioridad.', 'Desactivar la agresividad con empatía sin confrontar y activar escalamiento con prioridad.', true, 'seed')
ON CONFLICT DO NOTHING;

-- Limpieza de demo: DELETE FROM knowledge_base WHERE metadata->>'is_demo' = 'true';
-- DELETE FROM faqs WHERE metadata->>'is_demo' = 'true' (si se añade el flag);
-- DELETE FROM golden_examples WHERE source = 'seed';
```

---

## 8. CHECKLIST DE ENTREGA AL AGENTE SUPABASE

| Item | Estado | Archivo |
|------|--------|---------|
| Extensiones (vector, uuid) | ☐ Pendiente | `00_extensions.sql` |
| Tabla `tenants` extendida | ☐ Pendiente | `01_tenants.sql` |
| Tabla `conversations` + RLS | ☐ Pendiente | `02_conversations.sql` |
| Tabla `messages` + RLS | ☐ Pendiente | `03_messages.sql` |
| Tabla `message_embeddings` + HNSW + RLS | ☐ Pendiente | `04_embeddings.sql` |
| Tabla `knowledge_base` + HNSW + RLS | ☐ Pendiente | `05_knowledge_base.sql` |
| Tabla `faqs` + HNSW + RLS | ☐ Pendiente | `06_faqs.sql` |
| Tabla `golden_examples` + RLS | ☐ Pendiente | `07_golden_examples.sql` |
| Tabla `correction_logs` + RLS | ☐ Pendiente | `08_corrections.sql` |
| Tabla `stress_test_results` + RLS | ☐ Pendiente | `09_stress_tests.sql` |
| Tabla `training_sessions` + RLS | ☐ Pendiente | `10_training_sessions.sql` |
| Funciones RPC (search, resolve) | ☐ Pendiente | `11_functions.sql` |
| Triggers (embeddings, activity) | ☐ Pendiente | `12_triggers.sql` |
| Edge Function `whatsapp-webhook` | ☐ Pendiente | `/supabase/functions/whatsapp-webhook/` |
| Edge Function `generate-embeddings` | ☐ Pendiente | `/supabase/functions/generate-embeddings/` |
| Edge Function `ingest-historical-data` | ☐ Pendiente | `/supabase/functions/ingest-historical-data/` |
| Vault secrets config | ☐ Pendiente | Dashboard Supabase |
| Seeds 3 tenants | ☐ Pendiente | `99_seeds.sql` |
| pg_cron jobs (graduación, embeddings) | ☐ Pendiente | `13_cron.sql` |

---

## FASE 2 — CONTRATO EDGE FUNCTIONS + VAULT + CRON

> **NOTA:** Este documento es solo ESPECIFICACIÓN/CONTRATO. La implementación y despliegue la realiza **exclusivamente** el agente Supabase (1-agente-supabase). Fase 1 (schema + RLS + RPCs + seeds) debe estar completada y verificada antes de iniciar Fase 2.

---

### 1. EDGE FUNCTIONS (3 endpoints)

#### 1.1 `whatsapp-webhook` — Meta Cloud API → Agente
**Endpoint:** `POST /functions/v1/whatsapp-webhook`
**Auth:** `X-Hub-Signature-256` (HMAC SHA256 con App Secret)
**Rate limit:** Meta maneja (reintentos exponenciales)

**Input (Meta webhook payload):**
```json
{
  "object": "whatsapp_business_account",
  "entry": [{
    "id": "WABA_ID",
    "changes": [{
      "value": {
        "messaging_product": "whatsapp",
        "metadata": {
          "display_phone_number": "+51999888777",
          "phone_number_id": "10987654321"
        },
        "contacts": [{ "profile": { "name": "Juan Pérez" }, "wa_id": "51999888777" }],
        "messages": [{
          "from": "51999888777",
          "id": "wamid.xxxxx",
          "timestamp": "1726900000",
          "type": "text",
          "text": { "body": "Hola, ¿cuánto cuesta la consulta?" }
        }]
      },
      "field": "messages"
    }]
  }]
}
```

**Flujo interno (server-side):**
```typescript
// 1. Validar HMAC (App Secret desde Vault global)
const valid = await verifyHmac(payload, headers['x-hub-signature-256'], appSecret)
if (!valid) return new Response('Invalid signature', { status: 403 })

// 2. Extraer datos clave
const entry = payload.entry[0]
const change = entry.changes[0]
const wabaPhoneNumberId = change.value.metadata.phone_number_id
const messages = change.value.messages || []
const contacts = change.value.contacts || []

// 3. Resolver tenant por WABA Phone Number ID
const { data: tenant } = await supabase.rpc('resolve_tenant_by_waba', {
  p_waba_phone_number_id: wabaPhoneNumberId
})
if (!tenant) return new Response('Tenant not found', { status: 404 })

// 4. SET LOCAL RLS context (service_role)
await supabase.rpc('set_config', {
  setting_name: 'app.current_tenant_id',
  setting_value: tenant.id,
  is_local: true
})

// 5. Para cada mensaje entrante
for (const msg of messages) {
  const userPhone = msg.from
  const userName = contacts.find(c => c.wa_id === userPhone)?.profile?.name
  const msgText = msg.text?.body || ''
  const metaMsgId = msg.id

  // 4.1 Upsert conversation (por user_phone + tenant_id)
  const { data: conv } = await supabase.rpc('upsert_conversation_by_phone', {
    p_tenant_id: tenant.id,
    p_user_phone: userPhone,
    p_user_name: userName,
    p_channel: 'whatsapp'
  })

  // 4.2 Insert user message (idempotente por meta_msg_id)
  await supabase.from('messages').insert({
    conversation_id: conv.id,
    tenant_id: tenant.id,
    sender: 'user',
    text: msgText,
    metadata: { meta_msg_id: metaMsgId, meta_timestamp: msg.timestamp }
  }).select('id').single()

  // 4.3 Generar embedding (Edge Function async, no bloquea respuesta)
  supabase.functions.invoke('generate-single-embedding', {
    body: { tenant_id: tenant.id, text: msgText, type: 'user', source_id: messageId }
  })

  // 4.4 Recuperar contexto RAG
  const queryEmbedding = await generateEmbedding(msgText) // llama a Edge Function interna
  const { data: context } = await supabase.rpc('search_unified_context', {
    p_tenant_id: tenant.id,
    p_query_embedding: queryEmbedding,
    p_top_k: 5
  })

  // 4.5 Compilar prompt (Capa 0/1/2 + Few-Shot)
  const systemPrompt = compilePrompt(tenant, context)

  // 4.6 Llamar LLM (según tenant.ai_settings.llm_provider + llm_api_key de Vault)
  const llmResponse = await callLLM({
    provider: tenant.ai_settings.llm_provider,
    model: tenant.ai_settings.model,
    apiKey: await getVaultSecret('llm_api_key', tenant.id),
    systemPrompt,
    userMessage: msgText,
    temperature: tenant.ai_settings.temperature,
    tools: getAllowedTools(tenant)
  })

  // 4.7 Compliance checks (Capa 0)
  const compliance = checkCompliance(llmResponse, tenant)
  if (compliance.isHumanRequested) {
    await forceHandoff(conv.id, tenant)
  }

  // 4.8 Insert agent message
  const { data: agentMsg } = await supabase.from('messages').insert({
    conversation_id: conv.id,
    tenant_id: tenant.id,
    sender: 'agent',
    text: llmResponse.text,
    metadata: { compliance, toolCalls: llmResponse.toolCalls }
  }).select('id').single()

  // 4.9 Generar embedding respuesta agente (async)
  supabase.functions.invoke('generate-single-embedding', {
    body: { tenant_id: tenant.id, text: llmResponse.text, type: 'agent', source_id: agentMsg.id }
  })

  // 4.10 Responder a Meta (Send Message API)
  await sendWhatsAppMessage({
    phoneNumberId: wabaPhoneNumberId,
    accessToken: await getVaultSecret('waba_access_token', tenant.id),
    to: userPhone,
    text: llmResponse.text
  })

  // 4.11 Si training_mode = true Y no handoff: forzar handoff + notificar supervisores
  if (tenant.ai_settings?.training_mode && !compliance.isHumanRequested) {
    await forceHandoff(conv.id, tenant)
    await notifySupervisors(tenant.ai_settings.supervisor_ids, {
      conversationId: conv.id,
      userPhone,
      reason: 'training_mode_active'
    })
  }
}
```

**Output:** `200 OK` (Meta espera respuesta rápida; procesamiento async)

---

#### 1.2 `generate-embeddings` — Batch nocturno
**Endpoint:** `POST /functions/v1/generate-embeddings`
**Schedule:** `0 3 * * *` (diario 03:00 AM via pg_cron)
**Auth:** `service_role` key

**Input (opcional):**
```json
{ "tenant_id": "uuid-opcional", "batch_size": 100 }
```

**Lógica:**
```typescript
const { tenant_id, batch_size = 100 } = body
const tenants = tenant_id 
  ? [tenant_id] 
  : (await supabase.from('tenants').select('id').eq('ai_settings->enabled', true)).data.map(t => t.id)

for (const tid of tenants) {
  const apiKey = await getVaultSecret('llm_api_key', tid)
  const provider = (await supabase.from('tenants').select('ai_settings->llm_provider').eq('id', tid).single()).data?.ai_settings?.llm_provider || 'gemini'

  // 1. knowledge_base
  const { data: kb } = await supabase
    .from('knowledge_base')
    .select('id, content')
    .eq('tenant_id', tid)
    .is('embedding', null)
    .limit(batch_size)
  for (const row of kb) {
    const emb = await generateEmbedding(provider, apiKey, row.content)
    await supabase.from('knowledge_base').update({ embedding: emb }).eq('id', row.id)
  }

  // 2. faqs
  const { data: faqs } = await supabase
    .from('faqs')
    .select('id, question, answer')
    .eq('tenant_id', tid)
    .is('embedding', null)
    .limit(batch_size)
  for (const row of faqs) {
    const emb = await generateEmbedding(provider, apiKey, row.question + ' ' + row.answer)
    await supabase.from('faqs').update({ embedding: emb }).eq('id', row.id)
  }

  // 3. golden_examples (solo aprobados)
  const { data: gold } = await supabase
    .from('golden_examples')
    .select('id, user_question, ideal_answer')
    .eq('tenant_id', tid)
    .eq('is_approved', true)
    .is('embedding', null)
    .limit(batch_size)
  for (const row of gold) {
    const emb = await generateEmbedding(provider, apiKey, row.user_question + ' ' + row.ideal_answer)
    await supabase.from('golden_examples').update({ embedding: emb }).eq('id', row.id)
  }

  // 4. messages (últimas 24h sin embedding)
  const { data: msgs } = await supabase
    .from('messages')
    .select('id, text')
    .eq('tenant_id', tid)
    .is('embedding', null)
    .gte('created_at', new Date(Date.now() - 86400000).toISOString())
    .limit(batch_size)
  for (const row of msgs) {
    const emb = await generateEmbedding(provider, apiKey, row.text)
    await supabase.from('messages').update({ embedding: emb }).eq('id', row.id)
  }
}
```

**pg_cron:**
```sql
SELECT cron.schedule('generate-embeddings-daily', '0 3 * * *', $$
  SELECT net.http_post(
    url := 'https://<project-ref>.supabase.co/functions/v1/generate-embeddings',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer <service_role>"}'::jsonb,
    body := '{}'::jsonb
  );
$$);
```

---

#### 1.3 `ingest-historical-data` — Onboarding masivo
**Endpoint:** `POST /functions/v1/ingest-historical-data`
**Auth:** `service_role` (invocado desde panel admin tras onboarding)

**Input:**
```json
{
  "tenant_id": "00000000-0000-0000-0000-000000000001",
  "csv_url": "https://bucket.supabase.co/uploads/history-client-xyz.csv",
  "mapping": {
    "conversation_id_col": "conv_id",
    "user_phone_col": "phone",
    "user_name_col": "name",
    "timestamp_col": "ts",
    "sender_col": "role",
    "text_col": "message",
    "metadata_cols": ["campaign_id"]
  }
}
```

**Lógica:**
```typescript
// 1. Descargar CSV (signed URL o bucket privado)
const csv = await downloadCSV(csv_url)

// 2. Parsear y validar columnas
const rows = parseCSV(csv, mapping)

// 3. Agrupar por conversation_id
const groups = groupBy(rows, mapping.conversation_id_col)

// 4. Para cada conversación
for (const [convId, msgs] of Object.entries(groups)) {
  const first = msgs[0]
  const userPhone = first[mapping.user_phone_col]
  const userName = first[mapping.user_name_col]

  // 4.1 Upsert conversation
  const { data: conv } = await supabase.rpc('upsert_conversation_by_phone', {
    p_tenant_id: tenant_id,
    p_user_phone: userPhone,
    p_user_name: userName,
    p_channel: 'whatsapp'
  })

  // 4.2 Insert mensajes en orden
  for (const row of msgs.sort((a,b) => a.ts - b.ts)) {
    const sender = row[mapping.sender_col] === 'user' ? 'user' : 'agent'
    await supabase.from('messages').insert({
      conversation_id: conv.id,
      tenant_id,
      sender,
      text: row[mapping.text_col],
      metadata: { historical: true, ...pick(row, mapping.metadata_cols) },
      created_at: new Date(row[mapping.timestamp_col]).toISOString()
    })
  }
}

// 5. Disparar generate-embeddings para este tenant
await supabase.functions.invoke('generate-embeddings', { body: { tenant_id, batch_size: 500 } })
```

---

### 2. VAULT SECRETS (por tenant, namespace = tenant_id)

| Secret | Nombre en Vault | Descripción | Quién escribe |
|--------|-----------------|-------------|---------------|
| WhatsApp Access Token | `waba_access_token` | Token permanente Meta (60 días renovable) | Panel admin / onboarding |
| LLM API Key (BYOK) | `llm_api_key` | `sk-...` OpenAI / `GEMINI_KEY` / `ANTHROPIC_KEY` | Panel admin / onboarding |
| Meta App Secret | `meta_app_secret` | Para validar HMAC webhook (global, namespace `global`) | Plataforma |

**Acceso en Edge Functions (service_role):**
```typescript
const { data: secret } = await supabase.vault.getSecret('waba_access_token', { namespace: tenantId })
if (!secret) throw new Error('WABA token no configurado para tenant ' + tenantId)
```

---

### 3. PG_CRON JOBS

| Job | Schedule | Función SQL / HTTP |
|-----|----------|-------------------|
| `graduate-training-hourly` | `0 * * * *` | `SELECT graduate_training_sessions();` |
| `generate-embeddings-daily` | `0 3 * * *` | `net.http_post` a `/functions/v1/generate-embeddings` |
| `cleanup-expired-tokens` | `0 4 * * *` | `DELETE FROM waba_tokens WHERE expires_at < NOW();` (si se usa tabla tokens) |

---

### 4. CHECKLIST FASE 2 (entregable agente Supabase)

| Item | Estado | Archivo/Ubicación |
|------|--------|-------------------|
| Edge Function `whatsapp-webhook` | ☐ | `/supabase/functions/whatsapp-webhook/` |
| Edge Function `generate-embeddings` | ☐ | `/supabase/functions/generate-embeddings/` |
| Edge Function `generate-single-embedding` (invocación interna) | ☐ | `/supabase/functions/generate-single-embedding/` |
| Edge Function `ingest-historical-data` | ☐ | `/supabase/functions/ingest-historical-data/` |
| Vault secrets `waba_access_token` / `llm_api_key` / `meta_app_secret` | ☐ | Dashboard Vault |
| pg_cron `graduate-training-hourly` | ☐ | `13_cron.sql` |
| pg_cron `generate-embeddings-daily` | ☐ | `13_cron.sql` |
| Documentación API Edge Functions (OpenAPI) | ☐ | `docs/edge-functions-api.md` |

---

## 9. NOTAS PARA EL AGENTE SUPABASE

1. **RLS es obligatorio** — Ninguna tabla multi-tenant sin policy.
2. **`public.get_auth_tenant_id()`** — Security definer, resuelve el tenant del JWT sin confiar en input del cliente. El GUC `app.current_tenant_id` solo se usa DENTRO de Edge Functions con rol de servicio (SET LOCAL antes de cada query). Tu app/cliente NUNCA setea GUCs; tu frontend habla con su sesión normal.
3. **pgvector HNSW** — Usar `vector_cosine_ops` para similitud coseno (semántica). Dimensión fija 768 (Gemini text-embedding-004).
4. **Vault** — Tokens WhatsApp y LLM API Keys NUNCA en tablas, solo Vault. En BD solo guardo REFERENCIA al secret (nombre/namespace).
5. **Batch embeddings** — No generar embeddings en request sincrónico; job nocturno (Fase 2). En Fase 1 los triggers son no-op; seeds demo llevan vector fijo `ARRAY_FILL(0.01::float, ARRAY[768])`.
6. **Graduación automática** — Cron job cada hora evalúa 24h + compliance ≥ 90% + 0 fallos críticos.
7. **Training mode** — Flag en `tenants.ai_settings.training_mode` fuerza handoff en webhook.
8. **Webhook idempotencia** — Usar `message_id` de Meta para evitar duplicados.
9. **Escritura/Supervisión** — Lectura = cualquier miembro del tenant (o plataforma). Escribir KB/FAQ/golden/supervisar conversaciones = tenant admin o plataforma.
10. **Tenants reales** — NO crear tenants nuevos. Operan los existentes: Qaway Lab, CoraVet, Estudio Contable, Vallet. El panel obtiene tenant via `public.get_auth_tenant_id()`.

---

## 10. COMANDOS ÚTILES

```bash
# Aplicar migraciones en orden
supabase db push

# Verificar RLS
SELECT * FROM pg_policies WHERE tablename = 'conversations';

# Test búsqueda vectorial (usa DEMO_VECTOR_768 = ARRAY_FILL(0.01::float, ARRAY[768])::vector(768))
SELECT * FROM search_unified_context(
  '00000000-0000-0000-0000-000000000001'::uuid,
  ARRAY_FILL(0.01::float, ARRAY[768])::vector(768),
  5
);

# Verificar tenant resuelto por WABA
SELECT * FROM resolve_tenant_by_waba('10987654321');
```

---

**Fin del documento.**  
Cualquier duda sobre tipos TypeScript ↔ SQL, consultar `types/agent.types.ts` y `data/defaultAgents.ts` como fuente de verdad.