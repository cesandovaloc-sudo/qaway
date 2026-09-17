import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'QAWAY_VERIFY_TOKEN_123'
const APP_SECRET = Deno.env.get('WHATSAPP_APP_SECRET') || ''

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

