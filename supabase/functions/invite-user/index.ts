// Invita personal por correo (Supabase Auth nativo). Solo admins.
// Flujo: upsert user_invites → inviteUserByEmail → trigger vincula a marca+rol+apps.
// Manejo de errores: estados estructurados + mensajes humanos; detalle técnico solo en logs.
// 2026-09-21.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ROLES = ['admin', 'editor', 'viewer', 'guest']

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

    const url = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const siteUrl = Deno.env.get('PUBLIC_SITE_URL') || ''
    if (!url || !serviceKey || !anonKey || !siteUrl) return json({ error: 'No se pudo enviar la invitación. Intenta nuevamente.' })

    if (req.method !== 'POST') return json({ error: 'No se pudo enviar la invitación. Intenta nuevamente.' })

    const callerClient = createClient(url, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    })
    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) return json({ error: 'Tu sesión expiró. Vuelve a iniciar sesión.' })

    const admin = createClient(url, serviceKey)
    const { data: callerRow } = await admin.from('users').select('role, tenant_id, is_platform_admin').eq('id', caller.id).single()
    if (!callerRow) return json({ error: 'Tu perfil no está asociado a una empresa.' })
    // Plataforma global vs admin de marca (ver migración platform_vs_brand_admin).
    const isGlobalAdmin = callerRow.role === 'admin' && callerRow.is_platform_admin === true
    const isBrandAdmin = callerRow.role === 'admin' && callerRow.tenant_id !== null
    if (!isGlobalAdmin && !isBrandAdmin) return json({ error: 'No tienes permisos para realizar esta acción.' })

    const { email, tenant_id, role = 'viewer', app_slugs = [] } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return json({ error: 'Introduce un correo válido.' })
    if (!ROLES.includes(role)) return json({ error: 'Rol inválido.' })
    // Solo el global puede crear otros admin; el de marca invita viewer/editor/guest en SU marca.
    if (!isGlobalAdmin && (role === 'admin' || tenant_id !== callerRow.tenant_id)) {
      return json({ error: 'No tienes permisos para realizar esta acción.' })
    }

    const { data: tenant } = await admin.from('tenants').select('id, status').eq('id', tenant_id).single()
    if (!tenant || tenant.status !== 'active') return json({ error: 'La empresa destino no es válida.' })

    const { data: apps } = await admin.from('app_catalog').select('slug').in('slug', app_slugs)
    const validSlugs = (apps || []).map((a: { slug: string }) => a.slug)
    if (!validSlugs.length) return json({ error: 'Selecciona al menos una aplicación válida.' })

    const inviteEmail = String(email).toLowerCase()

    const { error: invErr } = await admin.from('user_invites').upsert(
      { email: inviteEmail, tenant_id, role, app_slugs: validSlugs, expires_at: new Date(Date.now() + 7 * 864e5).toISOString(), accepted_at: null, created_by: caller.id },
      { onConflict: 'email,tenant_id' },
    )
    if (invErr) return json({ error: 'No se pudo enviar la invitación. Intenta nuevamente.' })

    const { error: mailErr } = await admin.auth.admin.inviteUserByEmail(inviteEmail, {
      redirectTo: `${siteUrl}/login`,
    })

    if (mailErr) {
      // Clasificación por código estructurado (user_already_exists) con respaldo
      // sobre el texto para versiones del SDK sin código.
      const code = mailErr.code || ''
      const detail = `${mailErr.message || ''} ${mailErr.status ?? ''}`.toLowerCase()
      const alreadyExists = code === 'user_already_exists'
        || detail.includes('already registered')
        || detail.includes('already exists')
        || detail.includes('user_already_exists')
        || detail.includes('email taken')
        || detail.includes('duplicate')

      if (alreadyExists) {
        // Sin segunda invitación ni cuenta nueva: el correo ya pertenece a Qaway.
        // Se elimina la fila de invitación huérfana (no habrá envío a un existente).
        await admin.from('user_invites').delete().eq('email', inviteEmail).eq('tenant_id', tenant_id)

        const { data: existingUser } = await admin.from('users').select('id, tenant_id').eq('email', inviteEmail).maybeSingle()
        if (existingUser) {
          const { data: roleRows } = await admin.from('user_app_roles').select('id').eq('user_id', existingUser.id).eq('tenant_id', tenant_id).limit(1)
          const alreadyMember = existingUser.tenant_id === tenant_id || (roleRows && roleRows.length > 0)
          if (alreadyMember) return json({ status: 'already_member' })
        }
        return json({ status: 'existing_account' })
      }

      console.error('[invite-user] email_error', JSON.stringify({ email: inviteEmail, code: mailErr.code || null, status: mailErr.status || null, message: mailErr.message || null }))
      return json({ error: 'No se pudo enviar la invitación. Intenta nuevamente.' })
    }

    return json({ ok: true })
  } catch (err) {
    console.error('[invite-user] unexpected', (err as Error)?.message || String(err))
    return json({ error: 'Ocurrió un error inesperado. Intenta nuevamente.' })
  }
})