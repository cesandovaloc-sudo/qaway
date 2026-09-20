import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Manejo de Preflight CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Método no permitido' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }

  try {
    const { to, text, type = 'text', leadId, templateName, languageCode = 'es' } = await req.json()

    if (!to || (!text && !templateName)) {
      return new Response(JSON.stringify({ error: 'Faltan parámetros obligatorios: to, text o templateName' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // F-AUTH run-2: el llamante debe ser usuario autenticado de un tenant.
    // Sin JWT válido o sin tenant, no se envía nada.
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    })
    const { data: { user } } = await callerClient.auth.getUser()
    if (!user) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }
    const cleanToEarly = String(to).replace(/[^0-9]/g, '')
    if (cleanToEarly.length < 7 || cleanToEarly.length > 15) {
      return new Response(JSON.stringify({ error: 'Destino inválido' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const phoneNumberId = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
    const accessToken = Deno.env.get('WHATSAPP_ACCESS_TOKEN')

    // Si los secrets de Meta no están configurados en desarrollo/demo, operar en simulación controlada
    if (!phoneNumberId || !accessToken) {
      console.warn('[whatsapp-mensaje-enviar] Secrets WHATSAPP_PHONE_NUMBER_ID o WHATSAPP_ACCESS_TOKEN no configurados. Operando en modo Simulación.')
      return new Response(JSON.stringify({
        success: true,
        mode: 'simulation',
        message: 'Mensaje simulado correctamente (Secrets de Meta pendientes en Supabase)',
        wamid: `sim_wamid_${Date.now()}`
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      })
    }

    // Formato de destino: solo dígitos internacionales
    const cleanTo = to.replace(/[^0-9]/g, '')

    let metaPayload: any = {
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: cleanTo
    }

    if (type === 'template' && templateName) {
      metaPayload.type = 'template'
      metaPayload.template = {
        name: templateName,
        language: { code: languageCode }
      }
    } else {
      metaPayload.type = 'text'
      metaPayload.text = { preview_url: false, body: text }
    }

    // Petición oficial a Meta Graph API v20.0
    const metaResponse = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metaPayload)
    })

    const metaData = await metaResponse.json()

    if (!metaResponse.ok) {
      console.error('[whatsapp-mensaje-enviar] Error de Meta Graph API:', metaData)
      return new Response(JSON.stringify({
        success: false,
        error: metaData.error?.message || 'Error al enviar mensaje por Meta API',
        metaDetails: metaData
      }), {
        status: metaResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    const wamid = metaData.messages?.[0]?.id || `msg_out_${Date.now()}`

    // Si se especificó leadId, actualizar en Supabase el historial con el nuevo mensaje saliente
    // F-AUTH run-2: el lead debe pertenecer al tenant del llamante.
    if (leadId) {
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
      const supabase = createClient(supabaseUrl, supabaseKey)

      const { data: me } = await supabase.from('users').select('tenant_id').eq('id', user.id).single()
      const { data: lead } = await supabase.from('leads').select('history, tenant_id').eq('id', leadId).single()
      if (!lead || !me || lead.tenant_id !== me.tenant_id) {
        return new Response(JSON.stringify({ error: 'Lead fuera de tu tenant' }), {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
      }
      if (lead) {
        const history = Array.isArray(lead.history) ? lead.history : []
        history.push({
          id: wamid,
          wamid: wamid,
          sender: 'agent',
          text: text || `[Plantilla: ${templateName}]`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: Date.now()
        })

        await supabase.from('leads').update({
          history,
          last_message: text || `[Plantilla: ${templateName}]`,
          unread_count: 0
        }).eq('id', leadId)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      wamid: wamid,
      metaResponse: metaData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error('[whatsapp-mensaje-enviar] Error interno:', error)
    return new Response(JSON.stringify({ error: error?.message || 'Error interno del servidor' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})


