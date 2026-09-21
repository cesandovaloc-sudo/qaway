# REPORTE DE ESTADO — Módulo Hub: Agentes de IA Responsable
**Para:** Agente Validador / Revisión Técnica  
**Fecha:** 2026-09-21  
**Rama:** `main` | **Commit:** `4c34bf29`  
**Ubicación:** `src/pages/5-qaway-hub/2-Agentes/`

---

## 1. ARQUITECTURA ACTUAL (Lo que YA funciona)

### 1.1 Motor de Prompts en 3 Capas (`services/promptEngine.ts`)
| Capa | Responsabilidad | Inviolable |
|------|-----------------|------------|
| **Capa 0** | Ley 31814 (Transparencia, Human Handoff), Ley 29733 (Datos sensibles), Anti-Prompt Injection, Anti-Alucinación (PAIR), Contención insultos | ✅ Sí — inyectada programáticamente |
| **Capa 1** | Personalidad: Nombre, Tono (4 arquetipos), Canal (WhatsApp/Web), Reglas WhatsApp-First (≤4 líneas, emojis moderados, sin muletillas) | ⚙️ Configurable por tenant |
| **Capa 2** | Knowledge Base (productos/precios), FAQs, Handoff Keywords personalizadas, Regla de precios | ⚙️ Configurable por tenant |
| **Few-Shot** | Golden Examples aprobados → inyectados dinámicamente en prompt | ✅ Activo |

### 1.2 Multi-Tenant Nativo (`types/agent.types.ts`, `data/defaultAgents.ts`)
```typescript
interface TenantAgentWorkspace {
  id, slug, name, industry, role, agentName, tone
  aiSettings: { provider, model, mode, temperature, waba_phone_number_id, human_handoff_keywords[], system_prompt }
  knowledgeBase: KnowledgeItem[]
  faqs: FaqItem[]
  goldenExamples: GoldenExample[]      // Few-Shot
  correctionLogs: CorrectionLogItem[]  // Human-in-the-loop
  metrics: { conversations, simulations, handoffs, complianceScore }
}
```
**3 Tenants semilla listos:**
1. **Qaway Lab Master** — `consultoria_ventas` — WhatsApp (`10987654321`) — 3 Golden Examples — Temp 0.3
2. **CoraVet Veterinaria** — `agendamiento_citas` — WhatsApp (`10987654322`) — 1 Golden Example — Temp 0.25
3. **Vallet Inmobiliaria** — `calificacion_leads` — Web — 0 Golden Examples — Temp 0.2 (BYOK OpenAI)

### 1.3 UI Content Studio (`AgentesHubPage.tsx` + 8 Sub-Studios)
| Studio | Función | Estado |
|--------|---------|--------|
| `AgentTrainingStudio` | CRUD Golden Examples por categoría (precio, fuera_catalogo, queja_insulto, tecnica, casual) | ✅ Completo |
| `AgentStressTestStudio` | 4 Rondas Red Teaming (Happy Path, Fuera Catálogo, Handoff, Insultos/Jailbreak/Datos) + Promote to Gold | ✅ Completo |
| `AgentPlaygroundSimulator` | Chat en vivo **mock WhatsApp WABA** (verde) / **Widget Web** (índigo) + Semáforo compliance Ley 31814 | ✅ Completo |
| `AgentCorrectionLogStudio` | Registrar: consulta real → respuesta mala → corrección humana → Convertir a Golden Example | ✅ Completo |
| `AgentKnowledgeStudio` | CRUD Knowledge Base + FAQs | ✅ Completo |
| `AgentIdentityStudio` | Identidad, Rol, Tono, Motor LLM, Temperatura | ✅ Completo |
| `AgentVoiceStudio` | Voz, PAIR, Degradación elegante, Emojis | ✅ Completo |
| `AgentDeploymentStudio` | **Placeholder** — Despliegue WABA/Web (pendiente wizard real) | ⚠️ Parcial |
| `AgentExecutiveDashboard` | Métricas preservadas, accesible via footer sidebar | ✅ Completo |

### 1.4 Persistencia Dual
- **LocalStorage** (`qaway_responsible_agents_v2`) — inmediato, offline
- **Supabase** (`tenants.ai_settings` JSONB) — sync cloud + base para webhook real

### 1.5 Rutas Registradas (`AppRouter.jsx`)
- `/hub/agentes` y `hub/agentes` → `AgentesHubPage` (standalone, sin Layout público)

---

## 2. GAPS CRÍTICOS PARA FLUJO SaaS REAL (Lo que FALTA)

### 2.1 Onboarding WABA Real ❌
- No hay wizard para conectar WhatsApp Business del cliente
- No hay validación de Access Token + Phone Number ID contra Meta Graph API
- No hay almacenamiento seguro de credenciales por tenant

### 2.2 Webhook Real → LLM Real ❌
- `supabase/functions/whatsapp-webhook/` existe pero **no llama a LLM**
- No lee `tenant.aiSettings` compilado (`assembleCompleteSystemPrompt`)
- No distingue `trainingMode` vs `productionMode`

### 2.3 Modo Entrenamiento 24h Obligatorio ❌
- No existe flag `trainingMode` en `AiSettingsPayload`
- No hay lógica: "mientras trainingMode = true → TODAS las respuestas requieren validación humana"
- No hay dashboard de supervisión en vivo para el dueño/entrenador

### 2.4 Dashboard Supervisión Humana en Vivo ❌
- Falta `AgentLiveTrainingStudio.tsx`: lista conversaciones activas, botón "Corregir → Golden Example", métricas tiempo real

### 2.5 Graduación Automática ❌
- No hay job/cron: `trainingMode + 24h + compliance ≥ 90% + 0 fallos críticos → trainingMode = false`

### 2.6 Sandbox Meta (5 números) ❌
- No documentado ni automatizado para onboarding

---

## 3. PLAN DE ACCIÓN PRIORIZADO (Sugerencias)

### FASE 1 — Puerta de Entrada: Onboarding WABA Real
**Archivo:** `AgentDeploymentStudio.tsx` → nuevo `wabaOnboarding.ts`
- Wizard paso a paso: "Conectar mi WhatsApp Business"
  - Opción A: OAuth Meta Business (recomendado)
  - Opción B: Entrada manual Access Token + Phone Number ID
- Validación: `GET /{phone_id}/whatsapp_business_account` + `GET /{phone_id}?fields=verified_name,quality_rating`
- Guardado en `tenant.aiSettings`: `waba_phone_number_id`, `waba_access_token` (encrypted), `waba_verified_name`
- Test de conectividad: enviar template HSM a número de prueba

### FASE 2 — Cerebro Real: Webhook + LLM
**Archivo:** `supabase/functions/whatsapp-webhook/index.ts`
- Leer `tenant` por `waba_phone_number_id`
- Compilar `systemPrompt = assembleCompleteSystemPrompt(tenant)`
- Llamar LLM real (Gemini 2.5 Flash / OpenAI / Anthropic) según `tenant.aiSettings.provider`
- Responder a Meta Cloud API
- Log completo en `conversations` table (auditoría)

### FASE 3 — Modo Entrenamiento Obligatorio
**Archivos:** `agent.types.ts` + `promptEngine.ts` + webhook
```typescript
// Extensión AiSettingsPayload
trainingMode: boolean
trainingStartedAt?: number
supervisorIds?: string[]
llmProvider: 'gemini' | 'openai' | 'anthropic'
llmApiKey?: string
```
- Webhook: si `trainingMode === true` → **fuerza handoff humano en TODAS las respuestas** + notifica a supervisores
- UI: badge visible "🟡 MODO ENTRENAMIENTO — Supervisión obligatoria"

### FASE 4 — Dashboard Supervisión en Vivo
**Nuevo:** `components/AgentLiveTrainingStudio.tsx`
- Lista conversaciones activas (WebSocket / Supabase Realtime)
- Vista lado a lado: Mensaje cliente → Respuesta bot → [✅ Aprobar] [✏️ Corregir]
- "Corregir" abre modal → crea Golden Example instantáneo → recompila prompt → siguiente mensaje ya lo usa
- Métricas: % aprobadas, handoffs, alucinaciones detectadas, tiempo medio respuesta

### FASE 5 — Graduación Automática
**Supabase Cron / pg_cron** (diario)
```sql
-- Pseudológica
UPDATE tenants SET ai_settings = jsonb_set(ai_settings, '{trainingMode}', 'false')
WHERE ai_settings->>'trainingMode' = 'true'
  AND ai_settings->>'trainingStartedAt' < NOW() - INTERVAL '24 hours'
  AND (SELECT compliance_score FROM metrics) >= 90
  AND (SELECT critical_failures FROM stress_tests) = 0;
```

### FASE 6 — Documentación Sandbox Meta
- Guía paso a paso en `AgentDeploymentStudio` para que cliente configure sus 5 números de prueba

---

## 4. ARCHIVOS CLAVE PARA EL VALIDADOR

| Archivo | Qué Validar |
|---------|-------------|
| `types/agent.types.ts` | Tipos completos, extensibilidad `trainingMode` |
| `services/promptEngine.ts` | Capa 0 inviolable, few-shot compilation, compliance audit, simulación determinista |
| `data/defaultAgents.ts` | Seeds realistas multi-tenant, compliance 100% |
| `AgentesHubPage.tsx` | Orquestación, estado inmutable, persistencia dual, navegación |
| `components/AgentTrainingStudio.tsx` | CRUD Golden Examples, inyección inmediata |
| `components/AgentStressTestStudio.tsx` | 4 rondas, promote-to-gold, marcadores |
| `components/AgentPlaygroundSimulator.tsx` | Mock WhatsApp/Web, semáforo live, inspector prompt |
| `components/AgentCorrectionLogStudio.tsx` | Human-in-the-loop → Golden Example |
| `components/AgentDeploymentStudio.tsx` | **Punto de entrada Fase 1** — hoy placeholder |
| `marco_maestro_agentes_ia_responsable.md` | Marco normativo y arquitectónico de referencia |
| `creacion_app_implementacion.md` | Bitácora iteraciones 1 y 2 |

---

## 5. DECISIONES TÉCNICAS PENDIENTES (Para Validar)

1. **LLM Provider por defecto:** ¿Gemini 2.5 Flash (managed) para todos los tenants? ¿BYOK opcional?
2. **Cifrado `waba_access_token`:** ¿Supabase Vault? ¿Edge Function secrets? ¿KMS externo?
3. **Webhook scaling:** ¿Supabase Edge Functions (cold start) vs VPS dedicado (Node/Go)?
4. **Multi-tenant isolation:** ¿RLS en `conversations` + `tenants`? ¿Row-level encryption?
5. **Precio SaaS:** ¿Por conversación? ¿Por tenant/mes? ¿Incluye LLM tokens?
6. **SLA entrenamiento:** ¿24h fijas? ¿Configurable por plan?

---

## 6. COMANDOS ÚTILES PARA VALIDAR EN LOCAL

```bash
# Dev server
cd C:\LEO\EMPRESAS\QAWAY LAB\1-QawayLab-Digital\1-qawaylab-web
npm run dev
# → http://localhost:4100/hub/agentes

# Typecheck
npm run typecheck

# Lint
npm run lint

# Tests
npm run test

# Build
npm run build
```

---

## 7. RESUMEN EJECUTIVO PARA VALIDADOR

| ✅ LISTO (Producción Local) | ❌ FALTA (Producción SaaS Real) |
|-----------------------------|----------------------------------|
| Motor 3 capas + Ley 31814/PAIR | Onboarding WABA real (OAuth/Token) |
| Multi-tenant con seeds | Webhook → LLM real |
| Entrenador Few-Shot (UI) | Modo entrenamiento 24h obligatorio |
| Stress Testing 4 rondas | Dashboard supervisión en vivo |
| Playground mock WhatsApp/Web | Graduación automática |
| Correcciones Human-in-loop | Cifrado credenciales WABA |
| Persistencia Local + Supabase | Escalado webhook + RLS |
| Compliance audit automático | Pricing / SLA / Planes |

**Próximo hito recomendado:** **FASE 1 — Onboarding WABA en `AgentDeploymentStudio`** (puerta de entrada para todo lo demás).

---

*Generado automáticamente para revisión de Agente Validador.  
Cualquier observación o ajuste de prioridades, iterar sobre este documento.*