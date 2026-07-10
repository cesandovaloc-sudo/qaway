import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN') || 'QAWAY_VERIFY_TOKEN_123'

serve(async (req: Request) => {
  const url = new URL(req.url)

  // 1. Verificación del Webhook por parte de Meta (Petición GET)
  if (req.method === 'GET') {
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('Webhook validado exitosamente por Meta.')
      return new Response(challenge, { status: 200 })
    } else {
      return new Response('Error de validación', { status: 403 })
    }
  }

  // 2. Recepción de mensajes (Petición POST)
  if (req.method === 'POST') {
    try {
      const payload = await req.json()
      console.log('Payload recibido de WhatsApp:', JSON.stringify(payload, null, 2))

      // Verificamos que sea un evento de WhatsApp
      if (payload.object === 'whatsapp_business_account') {
        for (const entry of payload.entry) {
          for (const change of entry.changes) {
            if (change.value && change.value.messages) {
              const messages = change.value.messages
              const contacts = change.value.contacts

              for (let i = 0; i < messages.length; i++) {
                const message = messages[i]
                const contact = contacts ? contacts[i] : null

                // Extraemos los datos principales
                const senderPhone = message.from
                const senderName = contact?.profile?.name || 'Nuevo Contacto WA'
                const messageText = message.type === 'text' ? message.text.body : '[Mensaje Multimedia]'
                const timeString = new Date(parseInt(message.timestamp) * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

                // --- INSERCIÓN EN SUPABASE ---
                const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
                const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
                const supabase = createClient(supabaseUrl, supabaseKey)

                // Buscar si el lead ya existe por su número de teléfono
                const { data: existingLeads } = await supabase
                  .from('leads')
                  .select('*')
                  .eq('whatsapp', senderPhone)

                const newMessageObj = {
                  sender: 'lead',
                  text: messageText,
                  time: timeString
                }

                if (existingLeads && existingLeads.length > 0) {
                  // Actualizar lead existente
                  const lead = existingLeads[0]
                  const history = Array.isArray(lead.history) ? lead.history : []
                  history.push(newMessageObj)

                  await supabase
                    .from('leads')
                    .update({
                      last_message: messageText,
                      history: history,
                      unread_count: (lead.unread_count || 0) + 1,
                      status: lead.status === 'ganado' ? 'ganado' : 'contactado' // si nos escribe, ya fue contactado
                    })
                    .eq('id', lead.id)
                  
                  console.log(`Lead actualizado: ${senderPhone}`)
                } else {
                  // Crear nuevo lead
                  await supabase
                    .from('leads')
                    .insert([{
                      name: senderName,
                      whatsapp: senderPhone,
                      email: 'No especificado',
                      status: 'new',
                      agent: 'Pendiente', // Asignación de prueba
                      last_message: messageText,
                      history: [newMessageObj],
                      unread_count: 1,
                      metadata: { source: 'whatsapp_cloud_api' }
                    }])

                  console.log(`Nuevo lead creado: ${senderPhone}`)
                }
              }
            }
          }
        }
      }

      // Meta requiere que siempre respondamos 200 OK rápidamente para no reintentar
      return new Response('OK', { status: 200 })
    } catch (error) {
      console.error('Error procesando el webhook:', error)
      return new Response('Error Interno', { status: 500 })
    }
  }

  return new Response('Método no permitido', { status: 405 })
})
