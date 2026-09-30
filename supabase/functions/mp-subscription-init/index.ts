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
    const addonSlug = typeof it.addon_slug === 'string' ? it.addon_slug.trim() : ''
    const pricingQuery = addonSlug
      ? supabase.from('saas_addon_pricing').select('price, currency').eq('addon_slug', addonSlug).eq('plan', it.plan).eq('is_available', true).single()
      : supabase.from('app_plan_pricing').select('price, currency').eq('app_id', app.id).eq('plan', it.plan).eq('is_available', true).single()
    const { data: pricing } = await pricingQuery
    if (!pricing) return json({ error: `Sin precio vigente para ${addonSlug ? `${addonSlug}/${it.plan}` : `${it.app_slug}/${it.plan}`}` }, 409)
    const offerCode = typeof it.offer_code === 'string' ? it.offer_code.trim() : ''
    let offer: any = null
    if (offerCode) {
      let offerQuery = supabase.from('saas_commercial_offers')
        .select('id, code, name, price_override, discount_percent, trial_days, trial_requires_card')
        .eq('code', offerCode)
        .eq('plan', it.plan)
        .eq('is_active', true)
        .or(`starts_at.is.null,starts_at.lte.${new Date().toISOString()}`)
        .or(`ends_at.is.null,ends_at.gt.${new Date().toISOString()}`)
      offerQuery = addonSlug ? offerQuery.eq('addon_slug', addonSlug) : offerQuery.eq('app_id', app.id)
      const { data: offerRow } = await offerQuery.maybeSingle()
      if (!offerRow) return json({ error: `Oferta inválida o vencida: ${offerCode}` }, 409)
      offer = offerRow
    }
    const { data: existingBase } = await supabase.from('tenant_app_subscriptions')
      .select('id, list_price_at_signup, contracted_price, price_currency, status, commercial_offer_id')
      .eq('tenant_id', tenant_id).eq('app_id', app.id).maybeSingle()
    if (existingBase?.status && existingBase.status !== 'pending') {
      return json({ error: `La suscripción ${it.app_slug} ya fue contratada o está activa` }, 409)
    }
    if (addonSlug && !existingBase) {
      return json({ error: `El add-on ${addonSlug} requiere una suscripción base pendiente` }, 409)
    }
    const { data: existingAddon } = addonSlug && existingBase
      ? await supabase.from('tenant_app_subscription_addons')
        .select('list_price_at_signup, contracted_price, price_currency, commercial_offer_id, status')
        .eq('subscription_id', existingBase.id).eq('addon_slug', addonSlug).maybeSingle()
      : { data: null }
    if (existingAddon?.status && existingAddon.status !== 'cancelled') {
      return json({ error: `El add-on ${addonSlug} ya fue contratado` }, 409)
    }
    const listPrice = (addonSlug ? existingAddon?.list_price_at_signup : existingBase?.list_price_at_signup) ?? Number(pricing.price)
    const offerPrice = offer
      ? offer.price_override !== null
        ? Number(offer.price_override)
        : Math.round(Number(pricing.price) * (1 - Number(offer.discount_percent || 0) / 100) * 100) / 100
      : Number(pricing.price)
    const priorOfferId = addonSlug ? existingAddon?.commercial_offer_id : existingBase?.commercial_offer_id
    const priorContractedPrice = addonSlug ? existingAddon?.contracted_price : existingBase?.contracted_price
    const contractedPrice = priorOfferId
      ? Number(priorContractedPrice)
      : offerPrice
    const lineCurrency = (addonSlug ? existingAddon?.price_currency : existingBase?.price_currency) || pricing.currency
    total = Math.round((total + Number(contractedPrice)) * 100) / 100
    lines.push({
      app_id: app.id,
      addon_slug: addonSlug || null,
      subscription_id: existingBase?.id || null,
      plan: it.plan,
      list_price: Number(listPrice),
      price: Number(contractedPrice),
      currency: lineCurrency,
      existing_status: (addonSlug ? existingAddon?.status : existingBase?.status) || null,
      offer,
    })
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

  // La app base conserva su snapshot; los add-ons se guardan en su tabla propia.
  for (const line of lines) {
    if (line.addon_slug) continue
    await supabase.from('tenant_app_subscriptions').upsert({
      tenant_id,
      app_id: line.app_id,
      plan: line.plan,
      status: 'pending',
      list_price_at_signup: line.list_price,
      contracted_price: line.price,
      price_currency: line.currency,
      trial_days_granted: line.offer?.trial_days || 0,
      trial_requires_card: line.offer?.trial_requires_card || false,
      trial_source: line.offer ? 'commercial_offer' : null,
      commercial_offer_id: line.offer?.id || null,
      promotion_code: line.offer?.code || null,
      promotion_name: line.offer?.name || null,
      mp_preapproval_id: String(mp.id),
    }, { onConflict: 'tenant_id,app_id' })
  }
  for (const line of lines) {
    if (!line.addon_slug || !line.subscription_id) continue
    await supabase.from('tenant_app_subscription_addons').upsert({
      subscription_id: line.subscription_id,
      addon_slug: line.addon_slug,
      list_price_at_signup: line.list_price,
      contracted_price: line.price,
      price_currency: line.currency,
      commercial_offer_id: line.offer?.id || null,
      promotion_code: line.offer?.code || null,
      promotion_name: line.offer?.name || null,
      trial_days_granted: line.offer?.trial_days || 0,
      trial_requires_card: line.offer?.trial_requires_card || false,
      trial_source: line.offer ? 'commercial_offer' : null,
      status: 'active',
    }, { onConflict: 'subscription_id,addon_slug' })
  }

  return json({ init_point: mp.init_point, preapproval_id: String(mp.id), total, currency })
})
