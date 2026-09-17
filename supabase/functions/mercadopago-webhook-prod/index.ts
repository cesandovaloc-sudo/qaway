import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_API = 'https://api.mercadopago.com'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function firmaMpValida(req: Request, dataId: string, secret: string): Promise<boolean> {
  if (!secret) return false
  const xSignature = req.headers.get('x-signature')
  const xRequestId = req.headers.get('x-request-id')
  if (!xSignature || !xRequestId) return false

  const partes = Object.fromEntries(
    xSignature.split(',').map((p) => {
      const [k, v] = p.trim().split('=')
      return [k, v]
    }),
  )
  const ts = partes.ts
  const v1 = partes.v1
  if (!ts || !v1) return false

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const firmaBytes = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(manifest))
  const hashHex = Array.from(new Uint8Array(firmaBytes))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return hashHex === v1
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return json({ error: 'Método no permitido' }, 405)
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const rawBody = await req.text()
  let evento: any = {}
  try {
    evento = JSON.parse(rawBody || '{}')
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400)
  }

  const dataId = new URL(req.url).searchParams.get('data.id') ?? String(evento?.data?.id ?? '')

  // PING DE PRUEBA DE CONECTIVIDAD DEL PANEL DE MERCADO PAGO
  // El botón "Probar URL" de Mercado Pago envía un id ficticio "123456" para validar disponibilidad HTTP.
  if (dataId === '123456' || (evento?.action === 'order.processed' && dataId === '123456')) {
    console.log('[Webhook MP] Ping de prueba de Mercado Pago verificado exitosamente')
    return json({ ok: true, message: 'Webhook endpoint verified successfully' }, 200)
  }

  const secret =
    Deno.env.get('MERCADOPAGO_PROD_WEBHOOK_SECRET') ??
    Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET') ?? ''

  // 1. R3: Verificar firma criptográfica
  const valida = await firmaMpValida(req, dataId, secret)
  if (!valida) {
    console.warn('[Webhook MP Prod] Firma inválida para data.id:', dataId)
    return json({ error: 'Firma inválida' }, 401)
  }

  if (evento?.type && evento.type !== 'payment') {
    return json({ ok: true, ignorado: `evento ${evento.type}` })
  }

  // 2. Consultar pago en API de Mercado Pago
  const token =
    Deno.env.get('MERCADOPAGO_PROD_ACCESS_TOKEN') ??
    Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? ''

  const respMp = await fetch(`${MP_API}/v1/payments/${dataId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!respMp.ok) return json({ error: 'No se pudo consultar pago en MP' }, 502)

  const pago = await respMp.json()
  const providerId = String(pago.id ?? dataId)
  const montoPagado = Number(pago.transaction_amount ?? 0)
  const orderId = pago?.metadata?.order_id ?? pago?.external_reference ?? null
  const aprobado = pago.status === 'approved'

  if (!aprobado) return json({ ok: true, ignorado: `estado ${pago.status}` })

  // 3. R4: Idempotencia
  const { data: yaProcesado } = await supabase
    .from('payments')
    .select('id')
    .eq('provider', 'mercadopago')
    .eq('provider_id', providerId)
    .eq('status', 'completed')
    .limit(1)

  if (yaProcesado?.length) return json({ ok: true, repetido: true })

  // 4. R5: Verificar monto
  const { data: intento } = await supabase
    .from('payments')
    .select('id, amount, order_id')
    .eq('provider', 'mercadopago')
    .eq('order_id', orderId)
    .eq('status', 'pending')
    .limit(1)

  const intentoValido = intento?.[0]
  if (!intentoValido) return json({ error: 'No se encontró intento pendiente' }, 409)

  if (Math.abs(Number(intentoValido.amount) - montoPagado) > 0.01) {
    console.error('[Webhook MP Prod] R5 MONTO DISCREPANTE:', { esperado: intentoValido.amount, recibido: montoPagado })
    return json({ error: 'Monto discrepante' }, 409)
  }

  // 5. R6: Marcar como pagado
  await supabase
    .from('payments')
    .update({ status: 'completed', provider_id: providerId })
    .eq('id', intentoValido.id)

  await supabase
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', intentoValido.order_id)

  console.log('[Webhook MP Prod] Pedido pagado con éxito:', intentoValido.order_id)
  return json({ ok: true, orderId: intentoValido.order_id })
})
