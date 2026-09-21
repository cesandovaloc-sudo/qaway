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
  if (me.tenant_id !== null) return json({ error: 'Ya perteneces a una marca' }, 403)

  const { name, slug } = await req.json()
  if (!name || typeof name !== 'string' || name.trim().length < 2) return json({ error: 'Nombre inválido' }, 400)
  if (!slug || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(String(slug))) return json({ error: 'Slug inválido (minúsculas y guiones)' }, 400)

  const { data: tenant, error: tErr } = await admin.from('tenants').insert({
    name: String(name).trim().slice(0, 120),
    slug: String(slug).toLowerCase(),
    status: 'active',
  }).select('id, slug, client_code').single()
  if (tErr || !tenant) return json({ error: 'Slug en uso o marca inválida' }, 400)

  const { error: uErr } = await admin.from('users').update({
    tenant_id: tenant.id,
    role: 'admin',
  }).eq('id', caller.id)
  if (uErr) return json({ error: 'No se pudo vincular' }, 500)

  return json({ ok: true, tenant })
})
