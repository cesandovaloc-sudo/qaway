import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// F-FAILCLOSED run-2: sin defaults públicos. Si falta secreto, se rechaza (500/401), nunca permisivo.
//
// v31 [2026-09-23 · agente-supabase] — upgrade RAG + doble escritura (transición):
//   • Retrieval multi-tenant vía RPC search_unified_context (módulo 2-Agentes).
//   • Embedding del query con Gemini text-embedding-004 (768d). Sin key → RAG degrada
//     a prompt estático; el chat NUNCA se bloquea (fail-open solo para el contexto).
//   • Doble escritura: además de leads (flujo v30 intacto), sincroniza conversations/
//     messages del módulo agents. Nunca rompe el flujo principal (try/catch).
//   • Config por tenant: ai_settings.rag_enabled === false desactiva retrieval.
const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || ''
const APP_SECRET = Deno.env.get('WHATSAPP_APP_SECRET') || ''
const MASTER_GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''
const MASTER_OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''
const MASTER_ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY') || ''
const DEFAULT_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || ''
const ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || ''

/**
 * System Prompt de respaldo por defecto (Qaway Lab Digital)
 */
const DEFAULT_SYSTEM_PROMPT = `
Eres el Asistente Virtual Oficial de Qaway Lab Digital. Tu misión es brindar atención consultiva, responder dudas sobre nuestros servicios y productos, y calificar prospectos a través de WhatsApp.

DIRECTRICES DE PERSONALIDAD Y TONO:
- Tono: Profesional, ejecutivo, ergonómico, claro y empático.
- Respuestas para WhatsApp: Párrafos cortos (máximo 3-4 líneas), viñetas limpias, sin textos abrumadores.
- Usa emojis profesionales con moderación (⚡, 🚀, 💼, 📋).
- Lenguaje: Español neutro profesional.

PORTAFOLIO DE SOLUCIONES DE QAWAY LAB:
1. Sistemas Web y Apps a Medida: Desarrollo frontend y backend en React, Vite, Supabase y arquitecturas SaaS de alto rendimiento.
2. Notion Enterprise & SOPs: Sistemas operativos de negocio en Notion para estructurar procesos, CRM y gestión operativa de empresas y creadores.
3. Comercio Conversacional (WhatsApp CRM WABA): Integración oficial de WhatsApp Business API, flujos nativos WhatsApp Flows 3.0, cobros y catálogos en el chat.
4. Identidad Visual y ADN de Marca: Sistemas de diseño, diseño web ergonómico estilo Airbnb y branding digital para diferenciarse en el mercado.

REGLAS CRÍTICAS DE NEGOCIO:
- NO inventes precios finales cerrados para proyectos a medida; ofrece rangos orientativos o invita a una llamada de diagnóstico.
- Si el cliente pregunta por la plantilla Notion Pro, su valor promocional es S/ 49 o $15 USD.
- Si el cliente solicita hablar con un asesor o una cotización personalizada corporativa, responde amablemente que lo transfieres con el equipo especializado y mantén el mensaje breve.
- Responde siempre de forma directa a la duda del prospecto sin rodeos.
- Fluidez conversacional humana: NO repitas la misma pregunta de cierre en cada mensaje (evita decir siempre "¿Hay algo más en lo que te pueda ayudar?" o "¿Tienes alguna otra duda?"). Varía tus respuestas con naturalidad.
- Si el usuario te hace preguntas casuales ("y como estás", "¿cómo te va?"), responde con calidez humana y simpatía brevemente, sin repetir menús de servicios.
`

const DEFAULT_HUMAN_KEYWORDS = [
  'humano', 'asesor', 'persona', 'hablar con alguien', 'queja', 'reclamo',
  'soporte humano', 'atencion personalizada', 'asesora', 'ejecutivo'
]

/**
 * 1. Conector Google Gemini REST API (gemini-2.0-flash, gemini-1.5-pro)
 */
async function callGemini(apiKey: string, model: string, systemPrompt: string, history: any[], userMessage: string, temperature = 0.3): Promise<string | null> {
  try {
    const contents: any[] = []
    
    // Add sanitized history (alternating user and model if valid)
    const validHistory = (history || []).slice(-4)
    for (const m of validHistory) {
      if (m.text && typeof m.text === 'string') {
        contents.push({
          role: m.sender === 'agent' ? 'model' : 'user',
          parts: [{ text: m.text }]
        })
      }
    }

    // Always append current user message
    contents.push({
      role: 'user',
      parts: [{ text: userMessage }]
    })

    const payload: any = {
      contents: contents,
      generationConfig: {
        temperature: temperature,
        maxOutputTokens: 800
      }
    }

    if (systemPrompt && systemPrompt.trim()) {
      payload.systemInstruction = {
        parts: [{ text: systemPrompt.trim() }]
      }
    }

    let targetModel = model || 'gemini-2.5-flash'
    let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok && targetModel !== 'gemini-1.5-flash') {
      console.warn(`[whatsapp-webhook] Fallback a gemini-1.5-flash tras error ${res.status} con ${targetModel}`)
      targetModel = 'gemini-1.5-flash'
      res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    }

    if (!res.ok) {
      console.warn(`[whatsapp-webhook] Error en Gemini API (${res.status}):`, await res.text())
      return null
    }

    const data = await res.json()
    const parts = data.candidates?.[0]?.content?.parts || []
    const textParts = parts
      .filter((p: any) => p.text && !p.thought)
      .map((p: any) => p.text)
    const text = textParts.length > 0 ? textParts.join('\n') : (parts.map((p: any) => p.text || '').join('\n'))
    return text ? text.trim() : null
  } catch (err) {
    console.error('[whatsapp-webhook] Excepción en callGemini:', err)
    return null
  }
}

/**
 * 2. Conector OpenAI REST API (gpt-4o, gpt-4o-mini)
 */
async function callOpenAI(apiKey: string, model: string, systemPrompt: string, history: any[], userMessage: string, temperature = 0.3): Promise<string | null> {
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []).slice(-4).map((m: any) => ({
        role: m.sender === 'agent' ? 'assistant' : 'user',
        content: m.text || ''
      })),
      { role: 'user', content: userMessage }
    ]

    const targetModel = model || 'gpt-4o-mini'
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: targetModel,
        messages: messages,
        temperature: temperature,
        max_tokens: 300
      })
    })

    if (!res.ok) {
      console.warn(`[whatsapp-webhook] Error en OpenAI API (${res.status}):`, await res.text())
      return null
    }

    const data = await res.json()
    const text = data.choices?.[0]?.message?.content
    return text ? text.trim() : null
  } catch (err) {
    console.error('[whatsapp-webhook] Excepción en callOpenAI:', err)
    return null
  }
}

/**
 * 3. Conector Anthropic Claude REST API (claude-3-5-sonnet, claude-3-haiku)
 */
async function callAnthropic(apiKey: string, model: string, systemPrompt: string, history: any[], userMessage: string, temperature = 0.3): Promise<string | null> {
  try {
    const messages = [
      ...(history || []).slice(-4).map((m: any) => ({
        role: m.sender === 'agent' ? 'assistant' : 'user',
        content: m.text || ''
      })),
      { role: 'user', content: userMessage }
    ]

    const targetModel = model || 'claude-3-5-sonnet-20241022'
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: targetModel,
        system: systemPrompt,
        messages: messages,
        temperature: temperature,
        max_tokens: 300
      })
    })

    if (!res.ok) {
      console.warn(`[whatsapp-webhook] Error en Anthropic API (${res.status}):`, await res.text())
      return null
    }

    const data = await res.json()
    const text = data.content?.[0]?.text
    return text ? text.trim() : null
  } catch (err) {
    console.error('[whatsapp-webhook] Excepción en callAnthropic:', err)
    return null
  }
}

/**
 * Despachador Multi-Modelo Universal con Soporte BYOK vs Managed
 */
async function dispatchMultiModelAi(
  aiSettings: any,
  customerMessage: string,
  history: any[]
): Promise<string | null> {
  if (!aiSettings || !aiSettings.enabled) return null

  const provider = (aiSettings.provider || 'gemini').toLowerCase()
  const model = aiSettings.model || ''
  const systemPrompt = aiSettings.system_prompt || DEFAULT_SYSTEM_PROMPT
  const temperature = aiSettings.temperature ?? 0.3

  // Resolución de credencial: BYOK (del cliente) vs Managed (de Qaway Lab)
  let apiKey = ''
  if (aiSettings.mode === 'byok' && aiSettings.api_key) {
    apiKey = aiSettings.api_key
  } else {
    if (provider === 'gemini') apiKey = MASTER_GEMINI_API_KEY
    else if (provider === 'openai') apiKey = MASTER_OPENAI_API_KEY
    else if (provider === 'anthropic') apiKey = MASTER_ANTHROPIC_API_KEY
  }

  if (!apiKey) {
    console.warn(`[whatsapp-webhook] Proveedor ${provider} configurado pero falta API Key (BYOK o Master).`)
    return null
  }

  if (provider === 'openai') {
    return await callOpenAI(apiKey, model, systemPrompt, history, customerMessage, temperature)
  } else if (provider === 'anthropic') {
    return await callAnthropic(apiKey, model, systemPrompt, history, customerMessage, temperature)
  } else {
    return await callGemini(apiKey, model, systemPrompt, history, customerMessage, temperature)
  }
}

/**
 * Despacha un mensaje de texto saliente por WhatsApp Cloud API
 */
async function sendWhatsAppDirect(to: string, text: string, phoneNumberId: string, accessToken: string): Promise<string | null> {
  const targetPhoneId = phoneNumberId || Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || DEFAULT_PHONE_NUMBER_ID
  const targetToken = accessToken || Deno.env.get('WHATSAPP_ACCESS_TOKEN') || ACCESS_TOKEN
  console.log(`[whatsapp-webhook] sendWhatsAppDirect: to=${to}, targetPhoneId=${targetPhoneId}, tokenPresent=${Boolean(targetToken)}`)
  if (!targetPhoneId || !targetToken) {
    console.error('[whatsapp-webhook] Falta targetPhoneId o targetToken para despachar')
    return null
  }
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${targetPhoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${targetToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: to.replace(/[^0-9]/g, ''),
        type: 'text',
        text: { preview_url: false, body: text }
      })
    })
    const data = await res.json()
    console.log(`[whatsapp-webhook] Meta status ${res.status}:`, JSON.stringify(data))
    return data.messages?.[0]?.id || null
  } catch (err) {
    console.error('[whatsapp-webhook] Error en sendWhatsAppDirect:', err)
    return null
  }
}

/**
 * Valida la firma criptográfica x-hub-signature-256 enviada por Meta
 */
async function verifySignature(rawBody: string, signatureHeader: string | null, appSecret: string): Promise<boolean> {
  const cleanSecret = (appSecret || '').trim()
  if (!signatureHeader || !cleanSecret) {
    return false
  }

  const [prefix, signature] = signatureHeader.split('=')
  if (prefix !== 'sha256' || !signature) return false

  try {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(cleanSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
    const hashArray = Array.from(new Uint8Array(signatureBytes))
    const computedHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

    const matches = computedHex.toLowerCase() === signature.toLowerCase().trim()
    if (!matches) {
      console.warn('[whatsapp-webhook] Firma x-hub no coincide. Rechazado.')
    }
    return matches
  } catch (err) {
    console.error('[whatsapp-webhook] Error verificando firma:', err)
    return false
  }
}

/**
 * v31 (RAG): Embedding del query con Gemini text-embedding-004 (768d).
 * Fail-closed: sin key o error → null (el retrieval se omite, no el chat).
 */
async function embedTextRag(text: string): Promise<number[] | null> {
  const key = Deno.env.get('GEMINI_API_KEY') || ''
  if (!key) return null
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: { parts: [{ text: text.slice(0, 4000) }] },
        outputDimensionality: 768
      })
    })
    if (!res.ok) {
      console.warn(`[whatsapp-webhook] Embedding API ${res.status}`)
      return null
    }
    const data = await res.json()
    const values = data.embedding?.values as number[] | undefined
    return Array.isArray(values) && values.length === 768 ? values : null
  } catch (err) {
    console.error('[whatsapp-webhook] embedTextRag:', err)
    return null
  }
}

/**
 * v31 (RAG): Retrieval sobre el módulo 2-Agentes (search_unified_context RPC).
 * Devuelve contexto con fuentes; cadena vacía si no hay key/resultados → prompt estático.
 */
async function retrieveRagContext(
  supabase: any,
  tenantId: string,
  query: string,
  topK = 3
): Promise<string> {
  try {
    const embedding = await embedTextRag(query)
    if (!embedding) return ''
    const { data, error } = await supabase.rpc('search_unified_context', {
      p_tenant_id: tenantId,
      p_query_embedding: embedding,
      p_top_k: topK
    })
    if (error) {
      console.warn('[whatsapp-webhook] search_unified_context:', error.message)
      return ''
    }
    const rows: any[] = Array.isArray(data) ? data : []
    if (rows.length === 0) return ''
    return rows
      .map((r, i) => `### Fuente ${i + 1} (${r.source || '?'}) — título: ${r.title || ''} — sim ${(r.similarity || 0).toFixed(3)}\n${r.content || ''}`)
      .join('\n\n')
  } catch (err) {
    console.error('[whatsapp-webhook] retrieveRagContext:', err)
    return ''
  }
}

/**
 * Inyecta el contexto interno en el system prompt (si hay retrieval) SIN pisar
 * el system_prompt que el tenant ya configure.
 */
function enrichSystemPrompt(systemPrompt: string, ragContext: string): string {
  if (!ragContext) return systemPrompt
  return `${systemPrompt}\n\nCONTEXTO INTERNO DE LA EMPRESA (úsalo SOLO si responde la duda del cliente; si no aplica, ignóralo):\n${ragContext}`
}

/**
 * v31: Doble escritura al módulo 2-Agentes (conversations + messages).
 * No sustituye a leads (transición). Errores logueados, nunca rompen el flujo v30.
 */
async function syncAgentsConversation(
  supabase: any,
  payload: {
    tenantId: string
    userId: string
    userName?: string | null
    wamid: string
    text: string
    sender: 'user' | 'agent'
    status?: 'active' | 'handoff' | 'closed'
  }
): Promise<void> {
  try {
    const { tenantId, userId, userName, wamid, text, sender } = payload
    if (!tenantId || !userId) return

    let conversationId: string | null = null
    const { data: existing } = await supabase
      .from('conversations')
      .select('id, status')
      .eq('tenant_id', tenantId)
      .eq('user_id', userId)
      .eq('channel', 'whatsapp')
      .order('last_activity_at', { ascending: false })
      .limit(1)

    if (existing && existing.length > 0) {
      conversationId = existing[0].id
      await supabase
        .from('conversations')
        .update({
          last_activity_at: new Date().toISOString(),
          status: payload.status || existing[0].status
        })
        .eq('id', conversationId)
    } else {
      const { data: created, error: cErr } = await supabase
        .from('conversations')
        .insert({
          tenant_id: tenantId,
          user_id: userId,
          user_name: userName || 'Nuevo Contacto WA',
          channel: 'whatsapp',
          status: payload.status || 'active',
          metadata: { wamid, dual_write: true, source: 'whatsapp-cloud-api' }
        })
        .select('id')
        .single()
      if (cErr) {
        console.warn('[whatsapp-webhook] conversations insert:', cErr.message)
        return
      }
      conversationId = created?.id || null
    }

    if (!conversationId) return

    await supabase.from('messages').insert({
      conversation_id: conversationId,
      tenant_id: tenantId,
      sender,
      text,
      metadata: { wamid, channel: 'whatsapp' }
    })
  } catch (err) {
    console.error('[whatsapp-webhook] syncAgentsConversation:', err)
  }
}

serve(async (req: Request) => {
  const url = new URL(req.url)

  // 1. Verificación del Webhook por parte de Meta (Petición GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[whatsapp-webhook] Webhook validado exitosamente por Meta.')
      return new Response(challenge, { status: 200 })
    } else {
      return new Response('Error de validación de Verify Token', { status: 403 })
    }
  }

  // 2. Recepción y procesamiento de mensajes entrantes (Petición POST)
  if (req.method === 'POST') {
    try {
      const rawBody = await req.text()
      const signatureHeader = req.headers.get('x-hub-signature-256')

      console.log('[whatsapp-webhook] POST recibido de Meta!')
      console.log('[whatsapp-webhook] Raw Body:', rawBody)

      const signatureOk = await verifySignature(rawBody, signatureHeader, APP_SECRET)
      if (!signatureOk) {
        console.warn('[whatsapp-webhook] POST rechazado: firma inválida o secreto sin configurar.')
        return new Response('Firma inválida', { status: 401 })
      }
      const payload = JSON.parse(rawBody)

      // Normalizamos la lista de cambios soportando producción, webhooks directos y el modal de prueba de Meta
      const changes: any[] = []
      if (payload.object === 'whatsapp_business_account' && Array.isArray(payload.entry)) {
        for (const entry of payload.entry) {
          if (Array.isArray(entry.changes)) {
            changes.push(...entry.changes)
          }
        }
      } else if (payload.field === 'messages' && payload.value) {
        changes.push(payload)
      } else if (payload.entry && Array.isArray(payload.entry)) {
        for (const entry of payload.entry) {
          if (Array.isArray(entry.changes)) changes.push(...entry.changes)
        }
      }

      if (changes.length > 0) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        for (const change of changes) {
          const phoneNumberIdIncoming = change.value?.metadata?.phone_number_id || DEFAULT_PHONE_NUMBER_ID

            // ── RESOLUCIÓN MULTI-TENANT: Identificar qué empresa recibió el chat ──
            let activeTenant: any = null
            if (phoneNumberIdIncoming) {
              const { data: matchedTenants } = await supabase
                .from('tenants')
                .select('*')
                .eq("ai_settings->>'waba_phone_number_id'", phoneNumberIdIncoming)
                .limit(1)
              if (matchedTenants && matchedTenants.length > 0) {
                activeTenant = matchedTenants[0]
              }
            }

            // Fallback al tenant master de Qaway Lab si no hay mapeo específico
            if (!activeTenant) {
              const { data: defaultTenants } = await supabase
                .from('tenants')
                .select('*')
                .or('slug.eq.qaway-lab,client_code.eq.QW-00000')
                .limit(1)
              activeTenant = defaultTenants?.[0] || null
            }

            const aiSettings = activeTenant?.ai_settings || {
              enabled: Boolean(MASTER_GEMINI_API_KEY),
              provider: 'gemini',
              model: 'gemini-2.5-flash',
              mode: 'managed',
              system_prompt: DEFAULT_SYSTEM_PROMPT
            }

            const customKeywords = Array.isArray(aiSettings.human_handoff_keywords)
              ? aiSettings.human_handoff_keywords
              : DEFAULT_HUMAN_KEYWORDS

            // ── PROCESAMIENTO DE MENSAJES ENTRANTES (INBOUND) ──
            if (change.value && Array.isArray(change.value.messages)) {
              const messages = change.value.messages
              const contacts = change.value.contacts || []

              for (let i = 0; i < messages.length; i++) {
                const message = messages[i]
                const contact = contacts[i] || null

                const wamid = message.id || `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`
                const senderPhone = message.from
                const senderName = contact?.profile?.name || 'Nuevo Contacto WA'
                const messageText = message.type === 'text' ? message.text.body : `[${message.type || 'Multimedia'}]`
                const timestampEpoch = parseInt(message.timestamp) * 1000 || Date.now()
                const timeString = new Date(timestampEpoch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                // Detección de solicitud explícita de atención humana según keywords de la empresa
                const textLower = messageText.toLowerCase()
                const isHumanRequested = customKeywords.some((k: string) => textLower.includes(k.toLowerCase()))

                // Detección y extracción de Atribución Click-to-WhatsApp (CTWA)
                const referral = message.referral || null

                const newMessageObj = {
                  id: wamid,
                  wamid: wamid,
                  sender: 'lead',
                  text: messageText,
                  time: timeString,
                  timestamp: timestampEpoch
                }

                // Buscar lead existente (por whatsapp o contact_info)
                const { data: existingLeads } = await supabase
                  .from('leads')
                  .select('*')
                  .or(`whatsapp.eq.${senderPhone},contact_info.eq.${senderPhone}`)

                if (existingLeads && existingLeads.length > 0) {
                  const lead = existingLeads[0]
                  const history = Array.isArray(lead.history) ? lead.history : []

                  // Deduplicación e Idempotencia con wamid
                  const alreadyExists = history.some((m: any) => m.wamid === wamid || m.id === wamid)
                  if (!alreadyExists) {
                    history.push(newMessageObj)

                    const metadataUpdate = {
                      ...(lead.metadata || {}),
                      tenant_id: activeTenant?.id || lead.metadata?.tenant_id,
                      tenant_slug: activeTenant?.slug || lead.metadata?.tenant_slug,
                      last_customer_message_at: new Date(timestampEpoch).toISOString(),
                      channel: 'whatsapp'
                    }

                    if (referral) {
                      metadataUpdate.referral = referral
                      metadataUpdate.is_ctwa = true
                      metadataUpdate.ctwa_ad_id = referral.source_id || referral.ad_id
                      metadataUpdate.ctwa_headline = referral.headline
                      metadataUpdate.ctwa_expires_at = new Date(timestampEpoch + 72 * 3600 * 1000).toISOString()
                    }

                    if (isHumanRequested) {
                      metadataUpdate.is_human_requested = true
                      metadataUpdate.human_handoff_requested_at = new Date().toISOString()
                    }

                    await supabase
                      .from('leads')
                      .update({
                        tenant_id: activeTenant?.id || lead.tenant_id,
                        last_message: messageText,
                        history: history,
                        unread_count: (lead.unread_count || 0) + 1,
                        is_human_requested: isHumanRequested ? true : (lead.is_human_requested || false),
                        status: isHumanRequested ? 'negociacion' : (lead.status === 'ganado' ? 'ganado' : 'contactado'),
                        stage: isHumanRequested ? 'negociacion' : (lead.stage || 'contactado'),
                        metadata: metadataUpdate
                      })
                      .eq('id', lead.id)

                    console.log(`[whatsapp-webhook] Lead ${senderPhone} actualizado (${activeTenant?.name || 'Qaway'}). Handoff: ${isHumanRequested}, CTWA: ${Boolean(referral)}`)
                  } else {
                    console.log(`[whatsapp-webhook] Mensaje duplicado omitido (${wamid})`)
                  }
                } else {
                  // Creación de Nuevo Lead con compatibilidad dual
                  const metadataNew: Record<string, any> = {
                    tenant_id: activeTenant?.id || null,
                    tenant_slug: activeTenant?.slug || null,
                    source: 'whatsapp_cloud_api',
                    channel: 'whatsapp',
                    last_customer_message_at: new Date(timestampEpoch).toISOString(),
                    is_human_requested: isHumanRequested
                  }

                  if (referral) {
                    metadataNew.referral = referral
                    metadataNew.is_ctwa = true
                    metadataNew.ctwa_ad_id = referral.source_id || referral.ad_id
                    metadataNew.ctwa_headline = referral.headline
                    metadataNew.ctwa_expires_at = new Date(timestampEpoch + 72 * 3600 * 1000).toISOString()
                  }

                  const { error: insertErr } = await supabase
                    .from('leads')
                    .insert([{
                      tenant_id: activeTenant?.id || null,
                      client_name: senderName,
                      contact_info: senderPhone,
                      source: 'whatsapp_cloud_api',
                      stage: isHumanRequested ? 'negociacion' : 'new',
                      name: senderName,
                      whatsapp: senderPhone,
                      email: 'No especificado',
                      status: isHumanRequested ? 'negociacion' : 'new',
                      channel: 'whatsapp',
                      agent: isHumanRequested ? 'Asesor Humano Requerido' : (activeTenant ? `${activeTenant.name} Inbox` : 'Pendiente'),
                      last_message: messageText,
                      history: [newMessageObj],
                      unread_count: 1,
                      is_human_requested: isHumanRequested,
                      metadata: metadataNew
                    }])

                  if (insertErr) {
                    console.error('[whatsapp-webhook] Error al insertar nuevo lead:', insertErr)
                  } else {
                    console.log(`[whatsapp-webhook] Nuevo lead creado ${senderPhone} (${activeTenant?.name || 'Qaway'}). CTWA: ${Boolean(referral)}`)
                  }
                }

                // ── DOBLE ESCRITURA v31: sincronizar mensaje del cliente al módulo 2-Agentes ──
                await syncAgentsConversation(supabase, {
                  tenantId: activeTenant?.id,
                  userId: senderPhone,
                  userName: senderName,
                  wamid,
                  text: messageText,
                  sender: 'user',
                  status: isHumanRequested ? 'handoff' : 'active'
                })

                // ── AUTO-RESPUESTA MULTI-MODELO IA (Si no se requiere humano y el tenant tiene IA activa) ──
                const activeToken = ACCESS_TOKEN || Deno.env.get('WHATSAPP_ACCESS_TOKEN') || ''
                console.log(`[whatsapp-webhook] Verificando auto-respuesta: isHumanRequested=${isHumanRequested}, aiEnabled=${Boolean(aiSettings?.enabled)}, hasToken=${Boolean(activeToken)}`)

                if (!isHumanRequested && aiSettings?.enabled) {
                  if (!activeToken) {
                    console.error('[whatsapp-webhook] Falta WHATSAPP_ACCESS_TOKEN en variables de Supabase.')
                  } else {
                    try {
                      const { data: currentLeadList } = await supabase
                        .from('leads')
                        .select('id, history')
                        .or(`whatsapp.eq.${senderPhone},contact_info.eq.${senderPhone}`)
                        .order('created_at', { ascending: false })
                        .limit(1)

                      const currentLeadData = currentLeadList?.[0] || null

                      const activeHistory = currentLeadData?.history || [newMessageObj]

                      // v31 RAG: retrieval multi-tenant sobre search_unified_context (opcional por tenant)
                      const ragContext = aiSettings.rag_enabled === false
                        ? ''
                        : await retrieveRagContext(supabase, activeTenant?.id, messageText, 3)
                      const richSettings = ragContext
                        ? { ...aiSettings, system_prompt: enrichSystemPrompt(aiSettings.system_prompt || DEFAULT_SYSTEM_PROMPT, ragContext) }
                        : aiSettings

                      const aiReply = await dispatchMultiModelAi(richSettings, messageText, activeHistory)

                      if (aiReply) {
                        console.log(`[whatsapp-webhook] Auto-respuesta despachada para ${senderPhone} vía ${aiSettings.provider || 'gemini'} (${aiSettings.mode || 'managed'})`)
                        const outWamid = await sendWhatsAppDirect(senderPhone, aiReply, phoneNumberIdIncoming, activeToken)

                      const agentTitle = activeTenant?.name ? `${activeTenant.name} AI Agent` : 'Qaway AI Agent'
                      const aiMsgObj = {
                        id: outWamid || `ai_${Date.now()}`,
                        wamid: outWamid || `ai_${Date.now()}`,
                        sender: 'agent',
                        text: aiReply,
                        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        timestamp: Date.now()
                      }

                      const finalHistory = Array.isArray(activeHistory) ? [...activeHistory, aiMsgObj] : [aiMsgObj]
                      if (currentLeadData?.id) {
                        await supabase.from('leads').update({
                          history: finalHistory,
                          last_message: aiReply,
                          agent: agentTitle
                        }).eq('id', currentLeadData.id)
                      }
                      // v31: reflejar la respuesta del agente en conversations/messages
                      await syncAgentsConversation(supabase, {
                        tenantId: activeTenant?.id,
                        userId: senderPhone,
                        userName: senderName,
                        wamid: outWamid || `ai_${Date.now()}`,
                        text: aiReply,
                        sender: 'agent'
                      })
                    }
                  } catch (aiErr) {
                    console.error('[whatsapp-webhook] Error ejecutando auto-respuesta Multi-Modelo:', aiErr)
                  }
                }
              }
            }
          }

          // ── COEXISTENCIA HÍBRIDA: Eventos Message Echoes (Respuestas desde el Celular) ──
            const echoes = change.value?.smb_message_echoes || change.value?.message_echoes
            if (Array.isArray(echoes)) {
              for (const echo of echoes) {
                const wamid = echo.id || `echo_${Date.now()}_${Math.random().toString(36).substring(7)}`
                const customerPhone = echo.to
                const messageText = echo.type === 'text' ? echo.text.body : `[${echo.type || 'Multimedia'}]`
                const timestampEpoch = parseInt(echo.timestamp) * 1000 || Date.now()
                const timeString = new Date(timestampEpoch).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                const echoMsgObj = {
                  id: wamid,
                  wamid: wamid,
                  sender: 'agent',
                  text: messageText,
                  time: timeString,
                  timestamp: timestampEpoch
                }

                const { data: existingLeads } = await supabase
                  .from('leads')
                  .select('*')
                  .eq('whatsapp', customerPhone)

                if (existingLeads && existingLeads.length > 0) {
                  const lead = existingLeads[0]
                  const history = Array.isArray(lead.history) ? lead.history : []
                  const alreadyExists = history.some((m: any) => m.wamid === wamid || m.id === wamid)
                  if (!alreadyExists) {
                    history.push(echoMsgObj)
                    await supabase
                      .from('leads')
                      .update({
                        last_message: messageText,
                        history: history,
                        unread_count: 0
                      })
                      .eq('id', lead.id)
                    console.log(`[whatsapp-webhook] Message Echo registrado para lead ${customerPhone}`)
                  }
                }
              }
            }
          }
        }

      // Meta exige respuesta inmediata 200 OK
      return new Response('OK', { status: 200 })
    } catch (error) {
      console.error('[whatsapp-webhook] Error procesando webhook:', error)
      return new Response('Error Interno', { status: 500 })
    }
  }

  return new Response('Método no permitido', { status: 405 })
})
