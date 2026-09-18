import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'QAWAY_VERIFY_TOKEN_123'
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
    const recentHistory = (history || []).slice(-4).map((m: any) => ({
      role: m.sender === 'agent' ? 'model' : 'user',
      parts: [{ text: m.text || '' }]
    }))

    let targetModel = model || 'gemini-2.5-flash'
    let res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok && targetModel !== 'gemini-1.5-flash') {
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
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
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
  const targetPhoneId = phoneNumberId || DEFAULT_PHONE_NUMBER_ID
  if (!targetPhoneId || !accessToken) return null
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${targetPhoneId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
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
  if (!signatureHeader || !appSecret) {
    return true
  }

  const [prefix, signature] = signatureHeader.split('=')
  if (prefix !== 'sha256' || !signature) return false

  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(appSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signatureBytes = await crypto.subtle.sign('HMAC', key, encoder.encode(rawBody))
  const hashArray = Array.from(new Uint8Array(signatureBytes))
  const computedHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')

  return computedHex.toLowerCase() === signature.toLowerCase()
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

      // Validación criptográfica de la firma de Meta
      const isAuthentic = await verifySignature(rawBody, signatureHeader, APP_SECRET)
      if (!isAuthentic) {
        console.error('[whatsapp-webhook] Firma x-hub-signature-256 no coincide con APP_SECRET.')
        return new Response('Firma no autorizada', { status: 401 })
      }

      const payload = JSON.parse(rawBody)

      // Verificamos que sea un evento de la cuenta oficial de WhatsApp Business
      if (payload.object === 'whatsapp_business_account' && Array.isArray(payload.entry)) {
        const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
        const supabase = createClient(supabaseUrl, supabaseKey)

        for (const entry of payload.entry) {
          for (const change of (entry.changes || [])) {
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

                // Buscar lead existente
                const { data: existingLeads } = await supabase
                  .from('leads')
                  .select('*')
                  .eq('whatsapp', senderPhone)

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
                        metadata: metadataUpdate
                      })
                      .eq('id', lead.id)

                    console.log(`[whatsapp-webhook] Lead ${senderPhone} actualizado (${activeTenant?.name || 'Qaway'}). Handoff: ${isHumanRequested}, CTWA: ${Boolean(referral)}`)
                  } else {
                    console.log(`[whatsapp-webhook] Mensaje duplicado omitido (${wamid})`)
                  }
                } else {
                  // Creación de Nuevo Lead
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

                  await supabase
                    .from('leads')
                    .insert([{
                      tenant_id: activeTenant?.id || null,
                      name: senderName,
                      whatsapp: senderPhone,
                      email: 'No especificado',
                      status: isHumanRequested ? 'negociacion' : 'new',
                      agent: isHumanRequested ? 'Asesor Humano Requerido' : (activeTenant ? `${activeTenant.name} Inbox` : 'Pendiente'),
                      last_message: messageText,
                      history: [newMessageObj],
                      unread_count: 1,
                      is_human_requested: isHumanRequested,
                      metadata: metadataNew
                    }])

                  console.log(`[whatsapp-webhook] Nuevo lead creado ${senderPhone} (${activeTenant?.name || 'Qaway'}). CTWA: ${Boolean(referral)}`)
                }

                // ── AUTO-RESPUESTA MULTI-MODELO IA (Si no se requiere humano y el tenant tiene IA activa) ──
                if (!isHumanRequested && aiSettings.enabled && ACCESS_TOKEN) {
                  try {
                    const { data: currentLeadData } = await supabase
                      .from('leads')
                      .select('id, history')
                      .eq('whatsapp', senderPhone)
                      .single()

                    const activeHistory = currentLeadData?.history || [newMessageObj]
                    const aiReply = await dispatchMultiModelAi(aiSettings, messageText, activeHistory)

                    if (aiReply) {
                      console.log(`[whatsapp-webhook] Auto-respuesta despachada para ${senderPhone} vía ${aiSettings.provider || 'gemini'} (${aiSettings.mode || 'managed'})`)
                      const outWamid = await sendWhatsAppDirect(senderPhone, aiReply, phoneNumberIdIncoming, ACCESS_TOKEN)

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
                    }
                  } catch (aiErr) {
                    console.error('[whatsapp-webhook] Error ejecutando auto-respuesta Multi-Modelo:', aiErr)
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
