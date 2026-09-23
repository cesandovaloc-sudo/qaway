# Vault — Secretos de Fase 2 (módulo 2-Agentes)

> Contrato de secretos. **Nunca guardar valores reales aquí ni en el repo.**
> Los valores viven en Edge Function Secrets (`supabase secrets set`), en Vault
> de Dashboard, o (para el cron) compilados en SECURITY DEFINER. Las Edge
> Functions los leen con `Deno.env.get(...)`.

## Secretos WABA (WhatsApp Business Cloud API)

Nombres REALES configurados en la función (desde 2026-09-18, sandbox validado):

| Secret | Uso | Dónde se lee |
|---|---|---|
| `WHATSAPP_VERIFY_TOKEN` | Handshake webhook (GET hub.challenge) | `whatsapp-webhook` |
| `WHATSAPP_APP_SECRET` | Firma `X-Hub-Signature-256` (HMAC-SHA256) | `whatsapp-webhook` |
| `WHATSAPP_ACCESS_TOKEN` | Envío de respuestas (Graph API) | `whatsapp-webhook` (outbound) |
| `WHATSAPP_PHONE_NUMBER_ID` | Referencia por tenant | `tenants.ai_settings->>'waba_phone_number_id'` + RPC `resolve_tenant_by_waba` |

## Secretos LLM / Embeddings

| Secret | Uso | Dónde se lee |
|---|---|---|
| `GEMINI_API_KEY` | Embeddings (`text-embedding-004`, dim 768) y LLM | `generate-embeddings`, `whatsapp-webhook` |
| `OPENAI_API_KEY` | Alternativa LLM | `whatsapp-webhook` |
| `ANTHROPIC_API_KEY` | Alternativa LLM | `whatsapp-webhook` |
| `EMBEDDING_PROVIDER` | `gemini` (default) / `openai` | `generate-embeddings` |

## Credencial para pg_cron → Edge Function

- El cron `embeddings-nightly` (diario 03:00 UTC) llama a `net.http_post` hacia
  `generate-embeddings` con `Authorization: Bearer <service role>`.
- La GUC `app.service_role_key` (definible una sola vez por el superusuario:
  `alter database postgres set app.service_role_key = '<service role>';`) es la
  fuente oficial; `cron_embeddings_job()` la lee con `current_setting`.
- El valor aplicado en el entorno quedó compilado en `cron_embeddings_job()`
  (SECURITY DEFINER, owner postgres, EXECUTE revocado a public). No commitear
  literales en migraciones.

## Equivalentes en Dashboard

- Vault (Dashboard → Vault) guarda claves con el MISMO nombre para lectura por
  Edge Function.
- `tenants.ai_settings` guarda SOLO referencias/valores no sensibles:
  `waba_phone_number_id`, `llm_provider`, `llm_model`, `trainingMode`,
  `rag_enabled`.

## Reglas críticas

1. Claves NUNCA en tablas expuestas ni en el repo. Solo referencias.
2. El GUC `app.current_tenant_id` se usa SOLO dentro de Edge Functions con rol
   de servicio (`SET LOCAL`). La app/clientes nunca setean GUCs.
3. Los seeds demo (`metadata->>'is_demo'='true'`, tenant qaway-lab) son válidos
   SOLO mientras no haya credenciales reales.
4. Acceso: `resolve_tenant_by_waba(p_waba_phone_number_id)` es el único puente
   WABA→tenant; ninguna función debe autoconfiar en payloads del cliente.
5. `cron_embeddings_job()` NO es invocable vía REST (execute revocado a public);
   solo el dueño (postgres) y pg_cron lo ejecutan.