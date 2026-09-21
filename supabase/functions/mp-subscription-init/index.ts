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
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') ?? ''
  const callerClient = createClient(Deno.env.get('SUPABASE_URL') ?? '', anonKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
  })
  const { data: { user: caller } } = await callerClient.auth.getUser()
  if (!caller) return json({ error: 'No autorizado' }, 401)

  const { tenant_id, items } = await req.json().catch(() => ({}))
  if (!tenant_id || !Array.isArray(items) || items.length === 0) {
    return json({ error: 'Faltan tenant_id e items' }, 400)
  }

  // El llamante debe pertenecer al tenant (o ser plataforma). Precio NUNCA del cliente.
  const { data: me } = await supabase.from('users').select('tenant_id').eq('id', caller.id).single()
  const { data: tenant } = await supabase.from('tenants').select('id, status').eq('id', tenant_id).single()
  if (!tenant) return json({ error: 'Marca inválida' }, 400)
  const mine = me && me.tenant_id === tenant_id
  const { data: plat } = await supabase.from('users').select('is_platform_admin').eq('id', caller.id).single()
  if (!mine && !plat?.is_platform_admin) return json({ error: 'Fuera de tu marca' }, 403)

  // Resolver precio real desde catálogo (is_available). Sin precio real no hay cobro.
  let total = 0
  const lines = []
  for (const it of items) {
    if (!it || typeof it.app_slug !== 'string' || !['basico', 'intermedio', 'premium'].includes(it.plan)) {
      return json({ error: 'Item inválido' }, 400)
    }
    const { data: app } = await supabase.from('app_catalog').select('id, name').eq('slug', it.app_slug).single()
    if (!app) return json({ error: `App inválida: ${it.app_slug}` }, 400)
    const { data: pricing } = await supabase.from('app_plan_pricing')
      .select('price, currency').eq('app_id', app.id).eq('plan', it.plan).eq('is_available', true).single()
    if (!pricing) return json({ error: `Sin precio vigente para ${it.app_slug}/${it.plan}` }, 409)
    total = Math.round((total + Number(pricing.price)) * 100) / 100
    lines.push({ app_id: app.id, plan: it.plan, price: Number(pricing.price), currency: pricing.currency })
  }
  const currency = lines[0]?.currency || 'PEN'

  const token =
    Deno.env.get('MERCADOPAGO_PROD_ACCESS_TOKEN') ??
    Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!token) return json({ error: 'Pasarela sin configurar' }, 501)

  const base = Deno.env.get('PUBLIC_SITE_URL') ?? 'https://www.qawaylab.com'

  // Preapproval MP: un cobro recurrente mensual por el total.
  const mpRes = await fetch(`${MP_API}/preapproval`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reason: `Qaway Hub — ${lines.length} app(s) — ${tenant_id.slice(0, 8)}`,
      payer_email: caller.email,
      back_url: `${base}/onboarding?done=1`,
      external_reference: tenant_id,
      auto_recurring: {
        frequency: 1,
        frequency_type: 'months',
        transaction_amount: total,
        currency_id: currency,
      },
    }),
  })
  const mp = await mpRes.json().catch(() => ({}))
  if (!mpRes.ok || !mp.id || !mp.init_point) {
    return json({ error: 'Mercado Pago rechazó la suscripción' }, 502)
  }

  // Filas pending + preapproval id (upsert idempotente por tenant+app).
  for (const line of lines) {
    await supabase.from('tenant_app_subscriptions').upsert({
      tenant_id,
      app_id: line.app_id,
      plan: line.plan,
      status: 'pending',
      mp_preapproval_id: String(mp.id),
    }, { onConflict: 'tenant_id,app_id' })
  }

  return json({ init_point: mp.init_point, preapproval_id: String(mp.id), total, currency })
})
