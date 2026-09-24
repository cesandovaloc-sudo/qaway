# AGENTS.md — Módulo Hub de Agentes de IA Responsable (`2-Agentes`)

Este archivo es el contexto operativo para cualquier agente/sesión que trabaje dentro de
`src/pages/5-qaway-hub/2-Agentes/`. Complementa el `AGENTS.md` de la raíz del repo (más corto
y de alcance monorepo). No lo reemplaza.

## 1. Qué es el módulo

Hub multi-tenant para que cada cliente de Qaway Lab diseñe, entrene, audite y despliegue su
agente de IA consultivo conforme a la Ley Peruana Nº 31814 (D.S. Nº 066-2024-PCM),
Ley Nº 29733 y Google Responsible AI / PAIR.

- **Ruta web:** `/hub/agentes`
- **Entry point:** `AgentesHubPage.tsx` (tabs: builder / entrenamiento / estrés / correcciones / live / deploy)
- **Estándar visual:** Estilo Content Studio, sidebar índigo `#4f46e5`, semáforo ético.

## 2. Arquitectura de gobernanza (3 Capas)

- **Capa 0 (Inviolable):** Declaración explícita de IA (no suplantación), Human Handoff obligatorio,
  anti-prompt-injection, prohibición de captura de datos financieros/sensibles. Nunca editable por cliente.
- **Capa 1 (Voz de Marca):** Nombre, tono, formato, temperatura (0.2–0.35 anti-alucinación).
- **Capa 2 (Conocimiento):** Portafolio, precios orientativos, FAQs, políticas, golden examples — retrievable por turno.

> Regla de oro: ninguna instrucción de Capa 1/2 anula la Capa 0.

## 3. Estructura de rutas clave

| Ruta | Contenido |
| :--- | :--- |
| `AgentesHubPage.tsx` | Orquestador de tabs + switch de tenant (Supabase + localStorage) |
| `components/AgentDeploymentStudio.tsx` | Despliegue: Embedded Signup Meta (WABA) + widget web + webhook real |
| `components/AgentLiveTrainingStudio.tsx` | Entrenamiento en vivo: aprobar/rechazar/corregir → Golden Example |
| `components/AgentStressTestStudio.tsx` | Red Teaming (4 rondas) |
| `components/AgentCorrectionLogStudio.tsx` | Bitácora de correcciones |
| `components/AgentTrainingStudio.tsx` | Entrenador de Ejemplos de Oro (few-shot) |
| `components/AgentPlaygroundSimulator.tsx` | Simulador + inspector de contexto recuperado |
| `services/contextEngine.ts` | BuildTenantContext + buildContextForTurn (retrieval por tenant) |
| `services/promptEngine.ts` | Compilación prompt 3 capas + negativas contextuales |
| `types/agent.types.ts` | Tipos del módulo (ai_settings, LiveMessage, ContextPackage, etc.) |
| `data/defaultAgents.ts` | Seeds: QawayLab (master), CoraVet (piloto), Vallet (BYOK) |

## 4. Sub-agentes del módulo (cada uno con su README)

| Carpeta | Rol |
| :--- | :--- |
| `1-agente-supabase/_privado` | Supabase DBA & Arquitecto multi-tenant (zona `supabase/`) |
| `2-agente-consultor-ventas` | Consultor comercial & cierre de ventas |
| `3-agente-agendamiento-citas` | Agendamiento & calendario |
| `4-agente-soporte-triaje` | Soporte, FAQs & Human Handoff |
| `5-agente-supervisor-auditor` | Gobernanza, ética & Red Teaming |

Cada sub-agente tiene su `README.md` y su carpeta `_privado` (con `.gitignore` candado `*`) para
bitácoras/credenciales locales que no deben versionarse.

## 5. Documentos de referencia del módulo

- `marco_maestro_agentes_ia_responsable.md` — marco de gobernanza y normativa (Ley 31814, Google AI).
- `creacion_app_implementacion.md` — bitácora de implementación por iteración (contexto histórico).
- `SUPABASE_MIGRATION.md` — esquema SQL (11 tablas), RPCs, Edge Functions, Vault, pg_cron. **Zona del agente Supabase.**
- `REPORTE_ESTADO_VALIDADOR.md` — reporte de estado del validador.
- `_docs/` — documentos sensibles/protocolos locales protegidos por `.gitignore` (no salen en git ni a build).

## 6. Reglas de oro del módulo (obligatorias)

1. **Nunca tocar `supabase/functions/` ni migraciones** — pertenecen al agente `1-agente-supabase`.
2. **No editar archivos de otros módulos/agentes** (`HubPanelPage.jsx`, `src/index.css`, `vite.config.js`
   salvo el bloque de test, módulos 6/8/9/10, landings, blog, etc.).
3. **Validación:** correr la suite del módulo → `npx vitest run src/tests/agents` (y la raíz
   `npx vitest run` sin regresiones fuera del módulo). Tests: `src/tests/agents/{playground,live-training,cross-tenant}`.
4. **Typecheck puntual de componentes tocados** (tsc CLI con flags; el tsconfig raíz no cubre este módulo).
5. **Commits:** totales con `git add -A`; mensaje con prefijo numérico (ej. `11_: ...`). No push/deploy.
6. **Si el mensaje/instrucción no corresponde al frontend de este módulo, avisar y no ejecutar** (evitar pisar zonas ajenas).

## 7. Estado de frontend relevantes (no inventar)

- Deploy: webhook real `https://qrusdsqgygfolxfrafyd.supabase.co/functions/v1/whatsapp-webhook`;
  Verify Token fijo `QAWAY_WB_VT_9f3a7c2e5b81d4a0` (env del servidor debe coincidir para handshake OK).
- Tests del módulo actualmente 23/23 verdes (junto con academy-catalog: suite raíz 49/49).