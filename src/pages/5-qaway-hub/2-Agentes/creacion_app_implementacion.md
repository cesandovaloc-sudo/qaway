# Bitácora de Implementación — Módulo Hub: Agentes de IA Responsable

## Información General
- **Módulo:** Agentes de IA Consultivos & Gobernanza Normativa (Hub)
- **Ubicación:** `src/pages/5-qaway-hub/2-Agentes/`
- **Ruta Oficial:** `/hub/agentes`
- **Estándar Visual:** Basado en Content Studio (`/hub/creador-contenido`) y Estándar Web Qaway v4.0.
- **Normativa Regulatoria:** Ley Peruana Nº 31814 (D.S. Nº 066-2024-PCM), Ley Nº 29733 (Protección de Datos Personales), Google Responsible AI Principles & Google PAIR Guidebook.

---

## Iteración 1 — Arquitectura Base, Motor de 3 Capas y Studio Ergonómico (2026-09-18)

### 1. Objetivos Cumplidos
1. **Creación del Motor de Compilación de Prompts en 3 Capas (`promptEngine.ts`):**
   - **Capa 0 (Inviolable):** Garantiza la declaración explícita de IA (principio de no suplantación), el protocolo inmediato de traspaso humano (*Human Handoff*), la prohibición de captura de datos financieros o sensibles, y la neutralización de ataques de inyección (*Anti-Prompt Injection*).
   - **Capa 1 (Voz de Marca):** Permite configurar nombre del asistente, arquetipo de personalidad (Formal Ejecutivo, Cercano & Empático, Dinámico & Juvenil), formato de salida para WhatsApp (máximo 3-4 líneas por párrafo) y calibración de temperatura (0.2 - 0.35 anti-alucinación).
   - **Capa 2 (Conocimiento & Guardrails):** Estructuración de portafolio de productos/servicios, límites de precios orientativos, políticas de atención y lista personalizada de palabras clave de traspaso humano.
2. **Estructuración de Tipos y Datos Semilla (`agent.types.ts`, `defaultAgents.ts`):**
   - Soporte para Multi-Tenant nativo alineado con la base de datos Supabase (`tenants.ai_settings`).
   - Semillas pre-configuradas para **Qaway Lab Digital (Master)**, **CoraVet Clínica Veterinaria (Piloto)** y **Vallet Grupo Inmobiliario (BYOK)**.
3. **Módulo de UI Tipo Content Studio (`AgentesHubPage.tsx` y subcomponentes):**
   - **Sidebar Índigo (`#4f46e5`):** Monograma Q, selector interactivo de marcas/tenants con persistencia dual (`Supabase` + `localStorage`), menú de navegación vertical con píldoras activas y pie de usuario.
   - **TopBar Ejecutiva:** Breadcrumb, selector de canal (WhatsApp WABA / Web Widget), píldora de semáforo ético con pulso en vivo y botón de guardado en la nube.
4. **Integración en el Ecosistema:**
   - Montaje de rutas `/hub/agentes` y `hub/agentes` en `AppRouter.jsx`.
   - Incorporación de tarjeta destacada en `HubPage.jsx`.

---

## Iteración 2 — Reorientación Operativa: Entrenador de Ejemplos de Oro (Few-Shot) & Protocolo Red Teaming (2026-09-18)

### 1. Racional de Producto y Diagnóstico Crítico
- **Eliminación del enfoque de dashboard cosmético:** Los clientes y consultores no necesitan métricas vacías estáticas durante la configuración, sino herramientas tangibles de entrenamiento y auditoría. El componente de dashboard se preserva en código (`AgentExecutiveDashboard.tsx`) y queda accesible mediante conmutador en el pie del sidebar, liberando la navegación principal para la calibración real.
- **Adopción del Estándar Científico de Entrenamiento (Few-Shot Learning):** En lugar de intentar un fine-tuning costoso o depender de directivas abstractas, se implementa el modelado por pares: `[Pregunta Difícil del Cliente] ➔ [Respuesta de Oro Aprobada] ➔ [Criterio de Marca]`.

### 2. Nuevos Módulos Desarrollados
1. **Entrenador de "Ejemplos de Oro" (`AgentTrainingStudio.tsx`):**
   - Gestor categorizado de situaciones comerciales complejas: regateo de precios, consultas fuera de catálogo, clientes molestos y preguntas técnicas.
   - Compilación e inyección dinámica directa en el prompt del sistema (`compileFewShotGoldenExamples` en `promptEngine.ts`).
2. **Simulador de Estrés y Red Teaming (`AgentStressTestStudio.tsx`):**
   - Implementación del **Protocolo de 1 Día de Entrenamiento con el Cliente**:
     * *Ronda 1 — Happy Path:* Consultas normales de servicios y precios.
     * *Ronda 2 — Fuera de Catálogo:* Preguntas trampa para medir la degradación elegante y prevención de alucinaciones.
     * *Ronda 3 — Human Handoff:* Solicitud explícita de hablar con personas o quejas para verificar la detención del bot.
     * *Ronda 4 — Insultos & Seguridad:* Evaluación de templanza ante clientes agresivos, intentos de jailbreak y blindaje de tarjetas/claves.
   - Ejecución individual o en batería automatizada con marcador de resistencia en tiempo real y botón de promoción directa a Ejemplo de Oro.
3. **Bitácora de Notas de Corrección (`AgentCorrectionLogStudio.tsx`):**
    - Flujo de retroalimentación activa (*Human-in-the-loop*): registrar la consulta del cliente, la respuesta deficiente que emitió el agente y la corrección humana ideal.
    - Conversión con 1 clic en un nuevo Ejemplo de Oro que perfecciona el comportamiento del agente para siempre.

---

## Iteración 3 — Context Engine v1: TenantContext Obligatorio & Retrieval Selectivo (2026-09-21)

### 1. Objetivo
Separar claramente **instrucciones permanentes** (Capa 0/1) de **contexto dinámico por turno** (Capa 2: knowledge relevante, memoria, tools). El Context Engine recupera solo lo necesario para cada consulta, reduciendo tokens y eliminando riesgo de leakage cross-tenant.

### 2. Cambios Críticos

#### Tipos nuevos (`types/agent.types.ts`):
- `VectorSearchResult` — resultado de búsqueda semántica con score
- `ToolDefinition` — herramientas disponibles scoped al tenant
- `ConversationMemory` — últimos N turnos + summary + entidades
- `TenantContext` — **OBLIGATORIO** para cualquier recuperación: tenantId, config, knowledgeIndex, memory, allowedTools, rlsContext
- `ContextPackage` — paquete listo para prompt: config + relevantKnowledge + memory + allowedTools
- `ContextInspection` — estructura para inspector visual en Playground

#### Context Engine (`services/contextEngine.ts`):
- `buildTenantContext(workspace, conversationId, history)` — construye TenantContext una vez por conversación
- `buildContextForTurn(tenantContext, userMessage, conversationId)` — **async**, recovery selectivo:
  - Knowledge: top-K via `knowledgeIndex.search()` (mock vector store intercambiable)
  - Memory: últimos 8 turnos + summary
  - Tools: 4 herramientas genéricas scoped al tenant
- `createContextInspection()` — datos para UI inspector
- `formatContextForPrompt()` — formatea ContextPackage para inyección en Capa 2

#### Prompt Engine (`services/promptEngine.ts`):
- `assemblePromptWithContext(workspace, contextPackage)` — nueva función que usa ContextPackage en lugar de workspace completo
- Mantiene Capa 0/1 inmutables, inyecta Capa 2 dinámica desde retrieval

#### Playground (`AgentPlaygroundSimulator.tsx`):
- `tenantContext` via `useEffect` + `useState` (fix: buildTenantContext es async)
- Cada mensaje → `buildContextForTurn` → `assemblePromptWithContext` → simulación
- **Inspector Contexto Recuperado** (panel derecho, botón verde): muestra tenantId, query, knowledge chunks con score, memory turns, tools disponibles, badge "✓ Tenant-scoped"

### 3. Validación Cross-Tenant (Pendiente test manual)
- CoraVet → "¿Venden departamentos?" → 0 chunks, tenantId=coravet
- Vallet → "¿Royal Canin gatos?" → 0 chunks, tenantId=vallet
- Aislamiento nace en `knowledgeIndex.search(tenantId, query)` — sin filtros post-recuperación

---

## Iteración 4 — Negativas Contextuales + TrainingMode Types + AgentLiveTrainingStudio (2026-09-21)

### 1. Negativas Contextuales (`promptEngine.ts` - `simulateAgentResponse`)
**Antes:** Respuesta genérica "conecte con asesor o revise portafolio"
**Ahora:** Usa Capa 1 (identidad) para responder honesta y contextualmente:
> "En **CoraVet** nos especializamos en **salud animal**. No contamos con información sobre **departamentos**. Nuestros servicios son: **Consulta Médica, Urgencias 24h**. ¿Te interesa alguno?"

### 2. Tipos extendidos (`types/agent.types.ts` → `AiSettingsPayload`):
```typescript
trainingMode?: boolean          // Modo entrenamiento 24h obligatorio
trainingStartedAt?: number      // Timestamp inicio
supervisorIds?: string[]        // Quién puede corregir en vivo
llmProvider?: ModelProvider     // Explícito: 'gemini'|'openai'|'anthropic'
llmApiKey?: string              // BYOK encrypted
```

### 3. Seeds actualizados (`data/defaultAgents.ts`):
- 3 tenants con nuevos campos: `trainingMode: false`, `supervisorIds: ['leo-sandoval']`, `llmProvider`, `llmApiKey: null`

### 4. AgentLiveTrainingStudio (`components/AgentLiveTrainingStudio.tsx`):
**Nueva pestaña "Entrenamiento en Vivo" (icono User):**
- **Lista conversaciones en vivo** (mock 5 conversaciones cross-tenant)
- **Filtros:** Todos / Pendientes / Aprobadas / Requieren corrección
- **Búsqueda** por usuario, mensaje, tema
- **Métricas live:** Conversaciones activas, Pendientes, Aprobadas, Estado TrainingMode
- **Tarjeta conversación:** Usuario, canal, tags, último mensaje, contador pendientes
- **Modal detalle:** Burbujas estilo chat con status badges (Pendiente/Aprobado/Rechazado/Corregido)
- **Acciones por mensaje agente:**
  - ✅ **Aprobar** → status = approved
  - ❌ **Rechazar** → status = rejected  
  - ✨ **Corregir** → Modal corrección → **Golden Example automático**
- **Modal Corrección:** Consulta usuario + Respuesta mala + Input corrección humana → **Guarda → CorrectionLog + GoldenExample (isApproved=true)**
- **Badge TrainingMode** en sidebar: "ACTIVO" cuando `workspace.aiSettings.trainingMode === true`

---

## Iteración 5 — Documentación Supabase Completa para Agente DB (2026-09-21)

### 1. Archivo creado: `SUPABASE_MIGRATION.md`
Documentación exhaustiva para agente Supabase / Database Engineer con:

#### Esquema SQL completo (11 tablas + RLS):
1. `tenants` (extendida: ai_settings, agent_config JSONB)
2. `conversations` (RLS por tenant_id)
3. `messages` (RLS por tenant_id duplicado para performance)
4. `message_embeddings` (pgvector 768-dim, HNSW, RLS)
5. `knowledge_base` (pgvector, HNSW, RLS)
6. `faqs` (pgvector, HNSW, RLS)
7. `golden_examples` (RLS)
8. `correction_logs` (RLS)
9. `stress_test_results` (RLS)
10. `training_sessions` (RLS, auditoría 24h)
11. Seeds 3 tenants con UUIDs fijos

#### Funciones RPC (4):
- `search_knowledge_base(tenant_id, embedding, top_k, category)`
- `search_faqs(tenant_id, embedding, top_k)`
- `search_unified_context(tenant_id, embedding, top_k)` — KB + FAQs + Golden Examples
- `resolve_tenant_by_waba(phone_number_id)` — crítico para webhook
- `graduate_training_sessions()` — cron job graduación automática

#### Triggers (4):
- Auto-embedding KB / FAQs / Golden Examples (stubs para Edge Function)
- Update conversation last_activity_at

#### Edge Functions (3):
1. `whatsapp-webhook` — flujo completo: Meta → tenant → RLS → context → LLM → respuesta
2. `generate-embeddings` — batch nocturno KB/FAQs/Golden/Messages
3. `ingest-historical-data` — onboarding CSV/JSON export CRM previo

#### Vault Secrets:
- `waba_access_token` (namespace=tenant_id)
- `llm_api_key` (namespace=tenant_id)

#### pg_cron Jobs:
- `graduate_training_sessions()` — cada hora
- `generate-embeddings()` — diario 03:00 AM

#### Checklist de entrega (18 items)

---

## Próximos Pasos (Pendientes)

| Paso | Descripción | Responsable |
|------|-------------|-------------|
| **6** | Validación cross-tenant manual en Playground (CoraVet vs Vallet) | Usuario |
| **7** | Migración Supabase real (ejecutar `SUPABASE_MIGRATION.md`) | Agente Supabase |
| **8** | Webhook WhatsApp real + LLM real (Edge Function) | Agente Supabase + Backend |
| **9** | Embedded Signup Meta (flujo "Conectar WhatsApp" 1-clic) | Backend + Frontend |
| **10** | Cifrado credenciales (Vault) | Agente Supabase |
| **11** | Tests automatizados cross-tenant (vitest) | QA |
| **12** | Extraer `@qaway/tenant-core` (paquete reutilizable) | Arquitectura |

---

**Commits recientes:**
- `3_2026-09-21_15:30_` Context Engine validation
- `4_2026-09-21_16:45_` Contextual negatives + trainingMode types
- `5_2026-09-21_17:30_` AgentLiveTrainingStudio + SUPABASE_MIGRATION.md
