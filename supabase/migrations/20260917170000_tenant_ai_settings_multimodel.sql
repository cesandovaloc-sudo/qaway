-- ============================================================
-- MULTI-TENANT & MULTI-MODEL AI ARCHITECTURE — Qaway Lab SaaS
-- ============================================================
-- Objetivo:
--   1. Añadir/asegurar la columna `ai_settings` en `public.tenants` con soporte para:
--      - Multi-proveedor: 'gemini', 'openai', 'anthropic'
--      - Modelos: 'gemini-2.0-flash', 'gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet-20241022', etc.
--      - Facturación: 'managed' (usa clave de Qaway) o 'byok' (Bring Your Own Key del cliente)
--      - System Prompt 100% personalizado por empresa/tenant
--      - Enrutamiento por WhatsApp: `waba_phone_number_id` exclusivo
--      - Disparadores de Handover a humano personalizados
--   2. Índices de alta velocidad para búsqueda de tenant por phone_number_id de Meta
--   3. Actualizar sembrado para Qaway Lab (Master), CoraVet (Piloto) y Vallet (Inmobiliaria)
--
-- IDEMPOTENTE: re-ejecutable sin riesgo.
-- ============================================================

-- 1. Añadir columna ai_settings a public.tenants
alter table public.tenants add column if not exists ai_settings jsonb not null default '{
  "enabled": false,
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "mode": "managed",
  "api_key": null,
  "system_prompt": null,
  "temperature": 0.3,
  "waba_phone_number_id": null,
  "human_handoff_keywords": ["humano", "asesor", "persona", "queja", "reclamo"]
}'::jsonb;

-- 2. Índice para resolución en sub-milisegundos al recibir Webhook de Meta
create index if not exists idx_tenants_waba_phone_number_id
  on public.tenants ((ai_settings->>'waba_phone_number_id'))
  where (ai_settings->>'waba_phone_number_id') is not null;

-- 3. Índice GIN sobre ai_settings para consultas JSONB complejas
create index if not exists idx_tenants_ai_settings_gin
  on public.tenants using gin (ai_settings);

-- 4. Sembrar Configuración AI para Tenant 000: Qaway Lab Digital (Master)
update public.tenants
set ai_settings = '{
  "enabled": true,
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "mode": "managed",
  "api_key": null,
  "waba_phone_number_id": null,
  "temperature": 0.3,
  "human_handoff_keywords": ["humano", "asesor", "persona", "hablar con alguien", "queja", "reclamo", "cotizacion personalizada"],
  "system_prompt": "Eres el Asistente Virtual Oficial de Qaway Lab Digital. Tu misión es brindar atención consultiva, responder dudas sobre nuestros servicios y productos, y calificar prospectos a través de WhatsApp.\n\nDIRECTRICES DE TONO:\n- Profesional, ejecutivo, ergonómico, claro y empático.\n- Respuestas para WhatsApp: Párrafos cortos (máx 3-4 líneas), viñetas limpias.\n\nPORTAFOLIO:\n1. Sistemas Web y Apps a Medida en React, Vite, Supabase.\n2. Notion Enterprise & SOPs: Plantilla Pro a S/ 49 o $15 USD.\n3. Comercio Conversacional (WhatsApp CRM WABA).\n4. Identidad Visual y ADN de Marca."
}'::jsonb
where slug = 'qaway-lab' or client_code = 'QW-00000';

-- 5. Sembrar Configuración AI para Tenant 001: CoraVet Veterinaria (Piloto)
update public.tenants
set ai_settings = '{
  "enabled": true,
  "provider": "gemini",
  "model": "gemini-2.5-flash",
  "mode": "managed",
  "api_key": null,
  "waba_phone_number_id": null,
  "temperature": 0.3,
  "human_handoff_keywords": ["doctor", "veterinario", "emergencia", "urgencia", "humano", "asesor"],
  "system_prompt": "Eres Luna, la Asistente Médica y de Atención de CoraVet Clínica Veterinaria. Tu misión es orientar a los tutores de mascotas con calidez, agendar consultas médicas, citas de pet shop/baño y resolver dudas sobre productos.\n\nDIRECTRICES:\n- Tono: Muy cálido, empático con los animales y profesional.\n- Si el tutor menciona síntomas graves (convulsiones, vómitos con sangre, atropello), indica INMEDIATAMENTE acudir al área de Urgencias 24h.\n- Para citas regulares, solicita: Nombre de la mascota, especie/raza, motivo de consulta y día de preferencia."
}'::jsonb
where slug = 'coravet' or client_code = 'QW-00001';

-- 6. Sembrar Configuración AI para Vallet Inmobiliaria (Ejemplo BYOK con OpenAI)
update public.tenants
set ai_settings = '{
  "enabled": true,
  "provider": "openai",
  "model": "gpt-4o-mini",
  "mode": "byok",
  "api_key": null,
  "waba_phone_number_id": null,
  "temperature": 0.2,
  "human_handoff_keywords": ["agente", "asesor", "visita", "precio negociable", "humano"],
  "system_prompt": "Eres el Asesor Inmobiliario Digital de Vallet Grupo Inmobiliario. Tu objetivo es calificar compradores interesados en departamentos de estreno y lotes residenciales.\n\nDIRECTRICES:\n- Tono: Ejecutivo, sobrio y enfocado en inversión patrimonial.\n- Pregunta por rango de presupuesto, zona de interés (Miraflores, San Isidro, Surco) y si cuenta con crédito hipotecario pre-aprobado."
}'::jsonb
where slug = 'vallet' or client_code = 'QW-00002';
