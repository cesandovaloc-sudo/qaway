# Vault — Secretos de Fase 2 (módulo 2-Agentes)

> Contrato de secretos. **Nunca guardar valores reales aquí ni en el repo.**
> Los valores se cargan en Supabase Dashboard → Vault y se exponen a las Edge
> Functions vía `SUPABASE_VARTS`/secrets de la función (deploy: `--secret-name`),
> o `Deno.env.get(...)` al deployar con `supabase secrets set`.

## Secretos WABA (WhatsApp Business Cloud API)

| Secret | Uso | Dónde se lee |
|---|---|---|
| `WABA_VERIFY_TOKEN` | Handshake webhook (GET hub.challenge) | `whatsapp-webhook` |
| `WABA_APP_SECRET` | Firma `X-Hub-Signature-256` (HMAC-SHA256) | `whatsapp-webhook` |
| `WABA_PHONE_NUMBER_ID` | Referencia por tenant (en `tenants.ai_settings->>'waba_phone_number_id'`) | `resolve_tenant_by_waba` (RPC) |
| `WABA_ACCESS_TOKEN` | Envío de respuestas (Graph API) | `whatsapp-webhook` (outbound, Fase 2.2) |

## Secretos LLM / Embeddings

| Secret | Uso | Dónde se lee |
|---|---|---|
| `LLM_API_KEY` | Embeddings (Gemini `text-embedding-004`, dim 768) y LLM conversacional por tenant | `generate-embeddings`, `whatsapp-webhook` |
| `EMBEDDING_PROVIDER` | `gemini` (default) / `openai` | `generate-embeddings` |
| `EMBEDDING_MODEL` | `text-embedding-004` (default) | `generate-embeddings` |

## Equivalentes en Dashboard

- Vault (Dashboard → Vault) guarda las claves con el MISMO nombre para lectura
  por Edge Function.
- `tenants.ai_settings` guarda SOLO referencias/valores no sensibles:
  `waba_phone_number_id`, `llm_provider`, `llm_model`, `trainingMode`.

## Reglas críticas

1. Claves NUNCA en tablas ni en el repo. Solo referencias.
2. El GUC `app.current_tenant_id` se usa SOLO dentro de Edge Functions con rol
   de servicio (`SET LOCAL`). La app/clientes nunca setean GUCs.
3. Los seeds demo (`metadata->>'is_demo'='true'`, tenant qaway-lab) son válidos
   SOLO mientras no haya credenciales reales.
4. Acceso: `resolve_tenant_by_waba(p_waba_phone_number_id)` es el único puente
   WABA→tenant; ninguna función debe autoconfiar en payloads del cliente.