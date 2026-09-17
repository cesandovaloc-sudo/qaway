import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'QAWAY_VERIFY_TOKEN_123'
const APP_SECRET = Deno.env.get('WHATSAPP_APP_SECRET') || ''
const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY') || ''
const PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID') || ''
const ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN') || ''

/**
 * System Prompt oficial del Agente de Inteligencia Artificial de Qaway Lab
 */
const QAWAY_SYSTEM_PROMPT = `
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

/**
 * Genera la respuesta del Agente usando la API de Gemini
 */
async function generateAiReply(customerMessage: string, history: any[], apiKey: string): Promise<string | null> {
  if (!apiKey) return null
  try {
    const recentHistory = (history || []).slice(-4).map((m: any) => ({
      role: m.sender === 'agent' ? 'model' : 'user',
      parts: [{ text: m.text || '' }]
    }))

    const payload = {
      systemInstruction: { parts: [{ text: QAWAY_SYSTEM_PROMPT }] },
      contents: [
        ...recentHistory,
        { role: 'user', parts: [{ text: customerMessage }] }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 300
      }
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!res.ok) {
      console.warn('[whatsapp-webhook] Respuesta no exitosa de Gemini API:', res.status)
      return null
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    return text ? text.trim() : null
  } catch (err) {
    console.error('[whatsapp-webhook] Error en generateAiReply:', err)
    return null
  }
}

/**
 * Despacha un mensaje de texto saliente por WhatsApp Cloud API
 */
async function sendWhatsAppDirect(to: string, text: string, phoneNumberId: string, accessToken: string): Promise<string | null> {
  if (!phoneNumberId || !accessToken) return null
  try {
    const res = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
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
    // Si no se ha configurado secret en desarrollo, permitir continuar registrando advertencia
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

// Disparadores semánticos para activación del Handover Protocol (Traspaso a Humano)
const HUMAN_INTENT_KEYWORDS = [
  'humano', 'asesor', 'persona', 'hablar con alguien', 'queja', 'reclamo',
  'soporte humano', 'atencion personalizada', 'asesora', 'ejecutivo'
]

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

                // Detección de solicitud explícita de atención humana
                const textLower = messageText.toLowerCase()
                const isHumanRequested = HUMAN_INTENT_KEYWORDS.some(k => textLower.includes(k))

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
                        last_message: messageText,
                        history: history,
                        unread_count: (lead.unread_count || 0) + 1,
                        is_human_requested: isHumanRequested ? true : (lead.is_human_requested || false),
                        status: isHumanRequested ? 'negociacion' : (lead.status === 'ganado' ? 'ganado' : 'contactado'),
                        metadata: metadataUpdate
                      })
                      .eq('id', lead.id)

                    console.log(`[whatsapp-webhook] Lead ${senderPhone} actualizado. Handoff: ${isHumanRequested}, CTWA: ${Boolean(referral)}`)
                  } else {
                    console.log(`[whatsapp-webhook] Mensaje duplicado omitido (${wamid})`)
                  }
                } else {
                  // Creación de Nuevo Lead
                  const metadataNew: Record<string, any> = {
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
                      name: senderName,
                      whatsapp: senderPhone,
                      email: 'No especificado',
                      status: isHumanRequested ? 'negociacion' : 'new',
                      agent: isHumanRequested ? 'Asesor Humano Requerido' : 'Pendiente',
                      last_message: messageText,
                      history: [newMessageObj],
                      unread_count: 1,
                      is_human_requested: isHumanRequested,
                      metadata: metadataNew
                    }])

                  console.log(`[whatsapp-webhook] Nuevo lead creado ${senderPhone}. CTWA: ${Boolean(referral)}`)
                }

                // ── AUTO-RESPUESTA DEL AGENTE DE IA (Si no se requiere humano) ──
                if (!isHumanRequested && GEMINI_API_KEY && PHONE_NUMBER_ID && ACCESS_TOKEN) {
                  try {
                    const { data: currentLeadData } = await supabase
                      .from('leads')
                      .select('id, history')
                      .eq('whatsapp', senderPhone)
                      .single()

                    const activeHistory = currentLeadData?.history || [newMessageObj]
                    const aiReply = await generateAiReply(messageText, activeHistory, GEMINI_API_KEY)

                    if (aiReply) {
                      console.log(`[whatsapp-webhook] Auto-respuesta IA despachada para ${senderPhone}`)
                      const outWamid = await sendWhatsAppDirect(senderPhone, aiReply, PHONE_NUMBER_ID, ACCESS_TOKEN)

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
                          agent: 'Qaway AI Agent'
                        }).eq('id', currentLeadData.id)
                      }
                    }
                  } catch (aiErr) {
                    console.error('[whatsapp-webhook] Error ejecutando auto-respuesta IA:', aiErr)
                  }
                }
            }

            // ── COEXISTENCIA HÍBRIDA: Eventos Message Echoes (Respuestas desde el Celular) ──
            if (change.value && Array.isArray(change.value.message_echoes)) {
              for (const echo of change.value.message_echoes) {
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

