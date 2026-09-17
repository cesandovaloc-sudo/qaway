import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req: Request) => {
  // Manejo de Preflight CORS para navegadores
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
    const payload = await req.json()
    const {
      origen = 'proyectos',
      subject,
      nombre,
      name,
      correo,
      email,
      telefono,
      phone,
      mensaje,
      message,
      empresa,
      company,
      tipo_proyecto,
      ...extraData
    } = payload

    // 1. Obtener la clave correspondiente desde Supabase Secrets
    let accessKey = ''
    if (origen === 'proyectos') {
      accessKey = Deno.env.get('WEB3FORMS_PROYECTOS_KEY') || ''
    } else if (origen === 'ventas') {
      accessKey = Deno.env.get('WEB3FORMS_VENTAS_KEY') || Deno.env.get('WEB3FORMS_PROYECTOS_KEY') || ''
    } else if (origen === 'marketing') {
      accessKey = Deno.env.get('WEB3FORMS_MARKETING_KEY') || Deno.env.get('WEB3FORMS_PROYECTOS_KEY') || ''
    } else if (origen === 'academy') {
      accessKey = Deno.env.get('WEB3FORMS_ACADEMY_KEY') || Deno.env.get('WEB3FORMS_PROYECTOS_KEY') || ''
    } else {
      accessKey = Deno.env.get('WEB3FORMS_PROYECTOS_KEY') || ''
    }

    // Si no está la específica, usar el secret de respaldo
    if (!accessKey) {
      accessKey = Deno.env.get('WEB3FORMS_BACKUP_KEY') || ''
    }

    if (!accessKey) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Error de configuración: Faltan los secrets de Web3Forms en Supabase'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // 2. Normalizar datos del prospecto
    const prospectoNombre = nombre || name || 'Prospecto Web'
    const prospectoEmail = correo || email || ''
    const prospectoTelefono = telefono || phone || ''
    const prospectoMensaje = mensaje || message || ''
    const prospectoEmpresa = empresa || company || ''

    const web3Payload = {
      access_key: accessKey,
      subject: subject || `Nuevo contacto desde Qaway Lab [${origen.toUpperCase()}] - ${prospectoNombre}`,
      from_name: 'Qaway Lab Web',
      name: prospectoNombre,
      email: prospectoEmail,
      phone: prospectoTelefono,
      company: prospectoEmpresa,
      message: prospectoMensaje,
      origen: origen,
      tipo_proyecto: tipo_proyecto || 'No especificado',
      ...extraData
    }

    // 3. Despachar a Web3Forms API desde el servidor de Supabase
    let web3Result: any = null
    try {
      const resp = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(web3Payload)
      })
      web3Result = await resp.json()
    } catch (apiErr) {
      console.warn('[web3forms-mensaje-enviar] Falló intento primario:', apiErr)
      const backupKey = Deno.env.get('WEB3FORMS_BACKUP_KEY')
      if (backupKey && backupKey !== accessKey) {
        const respBackup = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({ ...web3Payload, access_key: backupKey })
        })
        web3Result = await respBackup.json()
      }
    }

    // 4. Copia de respaldo opcional en Supabase (si existe tabla leads)
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        await supabase.from('leads').insert({
          name: prospectoNombre,
          email: prospectoEmail,
          phone: prospectoTelefono,
          company: prospectoEmpresa,
          message: prospectoMensaje,
          source: `web_${origen}`,
          created_at: new Date().toISOString()
        })
      }
    } catch (_dbErr) {
      // Si la tabla leads aún no está creada, no interrumpe el flujo
    }

    const ok = web3Result?.success ?? true
    return new Response(JSON.stringify({
      success: ok,
      message: ok ? 'Mensaje enviado correctamente' : (web3Result?.message || 'No se pudo enviar el mensaje'),
      data: web3Result
    }), {
      status: ok ? 200 : 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error: any) {
    console.error('[web3forms-mensaje-enviar] Error interno:', error)
    return new Response(JSON.stringify({ success: false, error: error?.message || 'Error interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
