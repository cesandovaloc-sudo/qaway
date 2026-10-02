import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const MP_API = 'https://api.mercadopago.com'
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...CORS, 'Content-Type': 'application/json' } })
}

const PLAN_NAMES = new Set(['basico', 'intermedio', 'premium'])

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ error: 'Metodo no permitido' }, 405)

  const url = Deno.env.get('SUPABASE_URL') ?? ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  const supabase = createClient(url, serviceKey)
  const callerClient = createClient(url, Deno.env.get('SUPABASE_ANON_KEY') ?? '', {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
  })
  const { data: { user: caller } } = await callerClient.auth.getUser()
  if (!caller) return json({ error: 'No autorizado' }, 401)

  const body = await req.json().catch(() => ({}))
  const tenantId = typeof body.tenant_id === 'string' ? body.tenant_id : ''
  const plan = typeof body.plan_id === 'string' ? body.plan_id : ''
  const token = typeof body.card_token_id === 'string' ? body.card_token_id.trim() : ''
  const paymentMethodId = typeof body.card_payment_method_id === 'string' ? body.card_payment_method_id.trim() : ''
  const requestedAmount = Number(body.amount)
  const appSlugs = Array.isArray(body.app_slugs) ? body.app_slugs.filter((x: unknown) => typeof x === 'string') : ['inventario']
  if (!tenantId || !PLAN_NAMES.has(plan) || !token || !paymentMethodId || !Number.isFinite(requestedAmount)) {
    return json({ error: 'Faltan tenant_id, plan_id, amount o card_token_id' }, 400)
  }

  const { data: me } = await supabase.from('users').select('tenant_id, is_platform_admin').eq('id', caller.id).single()
  if (!me || (me.tenant_id !== tenantId && !me.is_platform_admin)) return json({ error: 'Fuera de tu marca' }, 403)
  const { data: tenant } = await supabase.from('tenants').select('id').eq('id', tenantId).single()
  if (!tenant) return json({ error: 'Marca invalida' }, 400)

  // El monto autoritativo se resuelve en el servidor desde la oferta vigente.
  const { data: offer } = await supabase.from('saas_commercial_offers')
    .select('price_override, discount_percent, app_id')
    .eq('code', `lanzamiento-inventi-${plan}`).eq('is_active', true).maybeSingle()
  const { data: inventoryApp } = await supabase.from('app_catalog').select('id').eq('slug', 'inventario').single()
  const { data: pricing } = inventoryApp
    ? await supabase.from('app_plan_pricing').select('price, currency').eq('app_id', inventoryApp.id).eq('plan', plan).eq('is_available', true).maybeSingle()
    : { data: null }
  const baseAmount = Number(pricing?.price ?? 0)
  const amount = offer?.price_override != null
    ? Number(offer.price_override)
    : Math.round(baseAmount * (1 - Number(offer?.discount_percent ?? 0) / 100) * 100) / 100
  if (!(amount > 0) || Math.round(requestedAmount * 100) !== Math.round(amount * 100)) {
    return json({ error: 'El monto no coincide con el precio vigente' }, 409)
  }

  const mpToken = Deno.env.get('MERCADOPAGO_PROD_ACCESS_TOKEN') ?? Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!mpToken) return json({ error: 'Pasarela sin configurar' }, 501)
  const externalReference = `qaway-saas:${tenantId}:${plan}:${crypto.randomUUID()}`
  const mpResponse = await fetch(`${MP_API}/v1/payments`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${mpToken}`,
      'Content-Type': 'application/json',
      'X-Idempotency-Key': `qaway-one-time-${tenantId}-${plan}-${crypto.randomUUID()}`,
    },
    body: JSON.stringify({
      transaction_amount: amount,
      description: `Qaway Hub - ${plan} - 30 dias`,
      payment_method_id: paymentMethodId,
      token: token,
      installments: 1,
      payer: { email: caller.email },
      external_reference: externalReference,
      metadata: { tenant_id: tenantId, plan, app_slugs: appSlugs },
      notification_url: `${url}/functions/v1/mp-onetime-webhook`,
    }),
  })
  const payment = await mpResponse.json().catch(() => ({}))
  if (!mpResponse.ok || !payment.id) return json({ error: 'Mercado Pago rechazo el pago' }, 502)

  const now = new Date()
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  const { data: apps } = await supabase.from('app_catalog').select('id, slug').in('slug', appSlugs)
  if (payment.status !== 'approved' && payment.status !== 'pending' && payment.status !== 'in_process') {
    return json({ payment_id: String(payment.id), status: payment.status || 'rejected' }, 402)
  }
  for (const app of apps ?? []) {
    const { error } = await supabase.from('tenant_app_subscriptions').upsert({
      tenant_id: tenantId, app_id: app.id, plan, status: payment.status === 'approved' ? 'active' : 'pending',
      billing_type: 'one_time', auto_renew: false,
      mp_payment_id: String(payment.id),
      current_period_start: now.toISOString(), current_period_end: end.toISOString(),
      contracted_price: amount, price_currency: 'PEN', trial_days_granted: 0,
      trial_requires_card: false, trial_source: 'onboarding_one_time',
    }, { onConflict: 'tenant_id,app_id' })
    if (error) return json({ error: 'No se pudo registrar la suscripcion' }, 500)
  }
  if (payment.status === 'approved') {
    await supabase.from('tenants').update({ status: 'active' }).eq('id', tenantId)
  }
  return json({ payment_id: String(payment.id), status: payment.status, current_period_end: end.toISOString() }, payment.status === 'approved' ? 200 : 202)
})
