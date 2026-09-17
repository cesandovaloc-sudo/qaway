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

  // 1. PING DE PRUEBA DE CONECTIVIDAD DEL PANEL DE MERCADO PAGO
  if (dataId === '123456' || (evento?.action === 'order.processed' && dataId === '123456')) {
    console.log('[Webhook MP Prod] Ping de prueba de Mercado Pago verificado con éxito')
    return json({ ok: true, message: 'Webhook endpoint verified successfully' }, 200)
  }

  const secret =
    Deno.env.get('MERCADOPAGO_PROD_WEBHOOK_SECRET') ??
    Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET') ?? ''

  // 2. R3: Verificar firma criptográfica si viene secret
  if (secret) {
    const valida = await firmaMpValida(req, dataId, secret)
    if (!valida) {
      console.warn('[Webhook MP Prod] Firma inválida para data.id:', dataId)
      return json({ error: 'Firma inválida' }, 401)
    }
  }

  const token =
    Deno.env.get('MERCADOPAGO_PROD_ACCESS_TOKEN') ??
    Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? ''

  let orderId: string | null = null
  let providerId: string = dataId
  let montoPagado = 0
  let pagadoAprobado = false

  // 3. Identificar si es evento de Orders o de Payments
  const esEventoOrder = evento?.type === 'order' || evento?.action === 'order.processed'

  if (esEventoOrder) {
    // Si viene la info directa en data
    if (evento?.data?.status === 'processed' || evento?.data?.status_detail === 'accredited') {
      pagadoAprobado = true
      montoPagado = Number(evento?.data?.total_paid_amount ?? 0) / 100 // En centavos si viene total_paid_amount
      orderId = evento?.data?.external_reference ?? null
    }

    // Consultar el estado oficial en GET /v1/orders/{id}
    if (token && dataId) {
      const respOrder = await fetch(`${MP_API}/v1/orders/${dataId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (respOrder.ok) {
        const orderInfo = await respOrder.json()
        providerId = String(orderInfo.id ?? dataId)
        orderId = orderInfo.external_reference ?? orderId
        montoPagado = Number(orderInfo.total_amount ?? montoPagado)
        pagadoAprobado = orderInfo.status === 'processed' || orderInfo.status === 'closed'
      }
    }
  } else {
    // Flujo payment tradicional
    if (token && dataId) {
      const respMp = await fetch(`${MP_API}/v1/payments/${dataId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (respMp.ok) {
        const pago = await respMp.json()
        providerId = String(pago.id ?? dataId)
        montoPagado = Number(pago.transaction_amount ?? 0)
        orderId = pago?.metadata?.order_id ?? pago?.external_reference ?? null
        pagadoAprobado = pago.status === 'approved'
      }
    }
  }

  if (!pagadoAprobado) {
    console.log('[Webhook MP Prod] Evento no aprobado aún:', { dataId, esEventoOrder, pagadoAprobado })
    return json({ ok: true, ignorado: 'Estado pendiente o no aprobado' })
  }

  // 4. R4: Idempotencia - verificar si ya fue completado
  const { data: yaProcesado } = await supabase
    .from('payments')
    .select('id')
    .eq('provider', 'mercadopago')
    .eq('provider_id', providerId)
    .eq('status', 'completed')
    .limit(1)

  if (yaProcesado?.length) {
    return json({ ok: true, repetido: true })
  }

  // 5. R5: Buscar intento pendiente y verificar monto
  const { data: intento } = await supabase
    .from('payments')
    .select('id, amount, order_id')
    .eq('provider', 'mercadopago')
    .or(`provider_id.eq.${providerId},order_id.eq.${orderId}`)
    .eq('status', 'pending')
    .limit(1)

  const intentoValido = intento?.[0]
  if (!intentoValido) {
    console.warn('[Webhook MP Prod] No se encontró intento pendiente para:', { providerId, orderId })
    return json({ error: 'No se encontró intento pendiente' }, 409)
  }

  if (montoPagado > 0 && Math.abs(Number(intentoValido.amount) - montoPagado) > 0.01) {
    console.error('[Webhook MP Prod] R5 MONTO DISCREPANTE:', {
      esperado: intentoValido.amount,
      recibido: montoPagado,
    })
    return json({ error: 'Monto discrepante' }, 409)
  }

  // 6. R6: Marcar como pagado
  await supabase
    .from('payments')
    .update({ status: 'completed', provider_id: providerId })
    .eq('id', intentoValido.id)

  await supabase
    .from('orders')
    .update({ status: 'paid', paid_at: new Date().toISOString() })
    .eq('id', intentoValido.order_id)

  console.log('[Webhook MP Prod] Pedido marcado como pagado exitosamente:', intentoValido.order_id)
  return json({ ok: true, orderId: intentoValido.order_id })
})
