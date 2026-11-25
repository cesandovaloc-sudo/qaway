// Registra una marca nueva y hace admin a quien la crea.
// Solo usuarios SIN marca (tenant_id NULL). Una cuenta = una marca.
// Fail-closed. 2026-09-21.
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
  const { data: me } = await admin.from('users').select('tenant_id').eq('id', caller.id).single()
  if (!me) return json({ error: 'Sin perfil' }, 403)

  const { data: activeMemberships } = await admin
    .from('tenant_memberships')
    .select('id')
    .eq('user_id', caller.id)
    .eq('status', 'active')
    .limit(1)
  const hasExistingTenant = me.tenant_id !== null || (Array.isArray(activeMemberships) && activeMemberships.length > 0)
  if (hasExistingTenant) {
    const { data: canCreate } = await admin.rpc('can_create_additional_tenant', { p_user_id: caller.id })
    if (canCreate !== true) {
      return json({ error: 'Crear una marca adicional con este correo está bloqueado por defecto. Solicita aprobación de plataforma admin.' }, 403)
    }
  }

  const { name, slug, plans = [] } = await req.json()
  if (!name || typeof name !== 'string' || name.trim().length < 2) return json({ error: 'Nombre inválido' }, 400)
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(slug))) return json({ error: 'Slug inválido (minúsculas y guiones)' }, 400)

  // La marca nace en borrador: se activa con pago o trial (modelo comercial).
  const { data: tenant, error: tErr } = await admin.from('tenants').insert({
    name: String(name).trim().slice(0, 120),
    slug: String(slug).toLowerCase(),
    status: 'draft',
  }).select('id, slug, client_code').single()
  if (tErr || !tenant) return json({ error: 'Slug en uso o marca inválida' }, 400)

  const { error: uErr } = await admin.from('users').update({
    tenant_id: tenant.id,
    role: 'admin',
  }).eq('id', caller.id)
  if (uErr) return json({ error: 'No se pudo vincular' }, 500)

  await admin.from('tenant_memberships').upsert({
    user_id: caller.id,
    tenant_id: tenant.id,
    role: 'admin',
    status: 'active',
    is_default: !hasExistingTenant,
    invited_by: caller.id,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id,tenant_id' })

  await admin.from('user_active_context').upsert({
    user_id: caller.id,
    active_tenant_id: tenant.id,
    updated_at: new Date().toISOString(),
    updated_by: caller.id,
  }, { onConflict: 'user_id' })

  // Las condiciones comerciales se aplican en checkout, no al crear la marca.
  // Este endpoint solo deja la contratación pendiente y captura el precio de
  // lista vigente como referencia inicial.
  const wanted = Array.isArray(plans) ? plans : []
  for (const p of wanted) {
    if (!p || typeof p.slug !== 'string' || !['basico', 'intermedio', 'premium'].includes(p.plan)) continue
    const { data: app } = await admin.from('app_catalog').select('id').eq('slug', p.slug).single()
    if (!app) continue
    const { data: pricing } = await admin.from('app_plan_pricing')
      .select('price, currency, is_available').eq('app_id', app.id).eq('plan', p.plan).eq('is_available', true).single()
    if (!pricing) {
      return json({ error: `Sin precio disponible para ${p.slug}/${p.plan}` }, 409)
    }
    await admin.from('tenant_app_subscriptions').upsert({
      tenant_id: tenant.id,
      app_id: app.id,
      plan: p.plan,
      status: 'pending',
      list_price_at_signup: pricing?.is_available ? Number(pricing.price) : null,
       contracted_price: null,
      price_currency: pricing?.currency || 'PEN',
      trial_days_granted: 0,
      trial_requires_card: false,
      trial_source: null,
    }, { onConflict: 'tenant_id,app_id' })
    await admin.from('user_app_roles').upsert({
      user_id: caller.id, tenant_id: tenant.id, app_id: app.id, role: 'admin',
    }, { onConflict: 'user_id,tenant_id,app_id' })
  }

  return json({ ok: true, tenant })
})
