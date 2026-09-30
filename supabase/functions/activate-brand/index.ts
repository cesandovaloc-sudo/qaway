// Activa una marca únicamente cuando existe una suscripción activa o un trial
// concedido por una oferta comercial explícita.
// Solo el admin de esa marca. Idempotente. Fail-closed. 2026-09-24.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const url = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  if (!url || !serviceKey || !anonKey) return json({ error: 'Función sin configurar' }, 500)

  const callerClient = createClient(url, anonKey, {
    global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
  })
  const { data: { user: caller } } = await callerClient.auth.getUser()
  if (!caller) return json({ error: 'No autorizado' }, 401)

  const admin = createClient(url, serviceKey)
  const { data: me } = await admin.from('users').select('tenant_id, role').eq('id', caller.id).single()
  if (!me || me.role !== 'admin' || me.tenant_id === null) return json({ error: 'Sin permisos' }, 403)

  const { tenant_id } = await req.json()
  if (!tenant_id || typeof tenant_id !== 'string' || tenant_id !== me.tenant_id) return json({ error: 'Empresa inválida' }, 400)

  const { data: tenant, error: tErr } = await admin.from('tenants').select('id, slug, status').eq('id', tenant_id).single()
  if (tErr || !tenant) return json({ error: 'Empresa no encontrada' }, 404)
  if (tenant.status !== 'draft') return json({ ok: true, tenant })

  const { data: subscriptions } = await admin
    .from('tenant_app_subscriptions')
    .select('status, trial_ends_at, trial_days_granted')
    .eq('tenant_id', tenant_id)
  const canActivate = (subscriptions || []).some((subscription) =>
    subscription.status === 'active'
    || (subscription.status === 'trialing'
      && Number(subscription.trial_days_granted || 0) > 0
      && (!subscription.trial_ends_at || new Date(subscription.trial_ends_at) > new Date())),
  )
  if (!canActivate) return json({ error: 'La marca requiere una contratación o una oferta con trial vigente' }, 409)

  const { error: upErr } = await admin.from('tenants').update({ status: 'active' }).eq('id', tenant_id)
  if (upErr) return json({ error: 'No se pudo activar la empresa' }, 500)

  return json({ ok: true, tenant: { ...tenant, status: 'active' } })
})
