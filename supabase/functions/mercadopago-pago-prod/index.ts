import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const MP_API = 'https://api.mercadopago.com'

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  try {
    const { orderId } = await req.json().catch(() => ({}))
    if (!orderId) return json({ error: 'Falta orderId' }, 400)

    // 1. R1: Leer el pedido y sus ítems de la base de datos
    const { data: orden, error: errOrden } = await supabase
      .from('orders')
      .select('id, total, status')
      .eq('id', orderId)
      .single()

    if (errOrden || !orden) return json({ error: 'Pedido no encontrado' }, 404)

    const { data: itemsBd, error: errItems } = await supabase
      .from('order_items')
      .select('product_title, quantity, unit_price')
      .eq('order_id', orderId)

    if (errItems || !itemsBd?.length) return json({ error: 'El pedido no tiene ítems' }, 400)

    const items = itemsBd.map((it: any) => ({
      title: it.product_title,
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
      currency_id: 'PEN',
    }))

    const totalCalculado = items.reduce((acc: number, it: any) => acc + it.unit_price * it.quantity, 0)
    const total = Math.round(totalCalculado * 100) / 100

    // 2. Secret oficial de producción (con fallback automático)
    const token =
      Deno.env.get('MERCADOPAGO_PROD_ACCESS_TOKEN') ??
      Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')

    if (!token) return json({ error: 'Falta MERCADOPAGO_PROD_ACCESS_TOKEN' }, 501)

    const base = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://www.qawaylab.com'
    const webhookBase = Deno.env.get('SUPABASE_URL') ?? ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''

    // 3. Crear preferencia en Mercado Pago
    const cuerpo = {
      items,
      external_reference: orderId,
      metadata: { order_id: orderId },
      back_urls: {
        success: `${base}/carrito/compras`,
        failure: `${base}/carrito/checkout`,
        pending: `${base}/carrito/compras`,
      },
      auto_return: 'approved',
      notification_url: webhookBase && anonKey
        ? `${webhookBase}/functions/v1/mercadopago-webhook-prod?apikey=${anonKey}`
        : undefined,
      statement_descriptor: 'QAWAYLAB',
    }

    const respuestaMp = await fetch(`${MP_API}/checkout/preferences`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': `pref-${orderId}`,
      },
      body: JSON.stringify(cuerpo),
    })

    if (!respuestaMp.ok) {
      const detalle = await respuestaMp.text().catch(() => '')
      console.error('[MP Prod] Error creando cobro:', respuestaMp.status, detalle)
      return json({ error: `Mercado Pago rechazó el cobro (${respuestaMp.status}): ${detalle}` }, 502)
    }

    const preferencia = await respuestaMp.json()
    const url = preferencia.init_point ?? preferencia.sandbox_init_point

    if (!url) return json({ error: 'MP no devolvió URL de cobro' }, 502)

    // 4. Registrar intento en payments
    await supabase.from('payments').insert({
      order_id: orderId,
      amount: total,
      currency: 'PEN',
      status: 'pending',
      provider: 'mercadopago',
      provider_id: String(preferencia.id),
    })

    return json({
      orderId,
      provider: 'mercadopago',
      amount: total,
      currency: 'PEN',
      providerId: String(preferencia.id),
      redirectUrl: String(url),
    })
  } catch (err: any) {
    console.error('[mercadopago-pago-prod]', err)
    return json({ error: err?.message || 'Error interno' }, 500)
  }
})
