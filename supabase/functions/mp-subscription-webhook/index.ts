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

// MP status preapproval -> nuestro estado. 'paused' MP equivale a 'suspended'.
function mapStatus(s: string): string | null {
  if (s === 'authorized') return 'active'
  if (s === 'paused') return 'suspended'
  if (s === 'cancelled') return 'cancelled'
  if (s === 'pending') return 'pending'
  return null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  )

  const secret =
    Deno.env.get('MERCADOPAGO_PROD_WEBHOOK_SECRET') ??
    Deno.env.get('MERCADOPAGO_WEBHOOK_SECRET') ?? ''
  if (!secret) return json({ error: 'Webhook sin configurar' }, 500)

  const rawBody = await req.text()
  let evento: any = {}
  try {
    evento = JSON.parse(rawBody || '{}')
  } catch {
    return json({ error: 'Cuerpo inválido' }, 400)
  }
  const dataId = new URL(req.url).searchParams.get('data.id') ?? String(evento?.data?.id ?? '')
  if (!dataId) return json({ ok: true, ignorado: 'Sin data.id' })

  if (!(await firmaMpValida(req, dataId, secret))) {
    return json({ error: 'Firma inválida' }, 401)
  }

  const token =
    Deno.env.get('MERCADOPAGO_PROD_ACCESS_TOKEN') ??
    Deno.env.get('MERCADOPAGO_ACCESS_TOKEN') ?? ''
  if (!token) return json({ error: 'Sin token MP' }, 500)

  // Fuente autoritativa: GET al recurso (no se confía en el cuerpo).
  const resp = await fetch(`${MP_API}/preapproval/${dataId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!resp.ok) return json({ ok: true, ignorado: 'Recurso no verificable' })
  const pre = await resp.json()
  const target = mapStatus(String(pre.status || ''))
  if (!target) return json({ ok: true, ignorado: 'Estado no mapeable' })

  const summarized = pre.summarized || {}
  const periodEnd = summarized.next_payment_date || null
  const periodStart = summarized.last_charged_date || null

  // Idempotencia: solo actualiza si algo cambia.
  const { data: rows } = await supabase
    .from('tenant_app_subscriptions')
    .select('id, status, current_period_end')
    .eq('mp_preapproval_id', String(pre.id))

  if (!rows || rows.length === 0) return json({ ok: true, ignorado: 'Preapproval desconocido' })

  let changed = 0
  for (const row of rows) {
    if (row.status === target && String(row.current_period_end || '') === String(periodEnd || '')) continue
    const patch: Record<string, unknown> = { status: target }
    if (periodStart) patch.current_period_start = periodStart
    if (periodEnd) patch.current_period_end = periodEnd
    const { error } = await supabase.from('tenant_app_subscriptions').update(patch).eq('id', row.id)
    if (!error) changed++
  }

  return json({ ok: true, actualizadas: changed, estado: target })
})
