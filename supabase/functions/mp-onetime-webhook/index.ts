import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { firmaMercadoPagoValida } from '../_shared/pagos.ts'

const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' }
const MP_API = 'https://api.mercadopago.com'

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'Metodo no permitido' }), { status: 405, headers: CORS })
  const id = new URL(req.url).searchParams.get('data.id') || ''
  const token = Deno.env.get('MERCADOPAGO_PROD_ACCESS_TOKEN') ?? Deno.env.get('MERCADOPAGO_ACCESS_TOKEN')
  if (!id || !token) return new Response(JSON.stringify({ error: 'Webhook sin configurar' }), { status: 400, headers: CORS })
  const secret = Deno.env.get('MERCADOPAGO_PROD_WEBHOOK_SECRET') ?? Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET')
  if (!(await firmaMercadoPagoValida(req, id, secret))) {
    return new Response(JSON.stringify({ error: 'Firma invalida' }), { status: 401, headers: CORS })
  }
  const response = await fetch(`${MP_API}/v1/payments/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${token}` } })
  if (!response.ok) return new Response(JSON.stringify({ ok: true }), { headers: CORS })
  const payment = await response.json()
  if (payment.status !== 'approved') return new Response(JSON.stringify({ ok: true, ignored: payment.status }), { headers: CORS })

  const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
  const { data: rows } = await supabase.from('tenant_app_subscriptions')
    .select('id, tenant_id, current_period_end, status').eq('mp_payment_id', String(id))
  if (!rows?.length) return new Response(JSON.stringify({ ok: true, ignored: 'unknown payment' }), { headers: CORS })
  const now = new Date()
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  for (const row of rows) {
    await supabase.from('tenant_app_subscriptions').update({ status: 'active', billing_type: 'one_time', auto_renew: false, current_period_start: now.toISOString(), current_period_end: end.toISOString() }).eq('id', row.id)
    await supabase.from('tenants').update({ status: 'active' }).eq('id', row.tenant_id)
  }
  return new Response(JSON.stringify({ ok: true, processed: true }), { headers: CORS })
})
