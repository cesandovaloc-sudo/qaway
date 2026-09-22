// Invita personal por correo (Supabase Auth nativo). Solo admins.
// El invitado fija su password con el link; el trigger lo vincula
// a marca+rol+apps. Fail-closed. 2026-09-21.
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
    if (!url || !serviceKey || !anonKey || !siteUrl) return json({ error: 'Función sin configurar' })

    if (req.method !== 'POST') return json({ error: 'Método no permitido' })

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
    if (!isGlobalAdmin && !isBrandAdmin) return json({ error: 'Solo los administradores pueden invitar.' })

    const { email, tenant_id, role = 'viewer', app_slugs = [] } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return json({ error: 'Introduce un correo válido.' })
    if (!ROLES.includes(role)) return json({ error: 'Rol inválido.' })
    // Solo el global puede crear otros admin; el de marca invita viewer/editor/guest en SU marca.
    if (!isGlobalAdmin && (role === 'admin' || tenant_id !== callerRow.tenant_id)) {
      return json({ error: 'Fuera de tu marca o rol no permitido.' })
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
    if (invErr) return json({ error: 'No se pudo registrar la invitación.' })

    const { error: mailErr } = await admin.auth.admin.inviteUserByEmail(inviteEmail, {
      redirectTo: `${siteUrl}/login`,
    })

    if (mailErr) {
      const detail = `${mailErr.message || ''} ${mailErr.code || ''}`.toLowerCase()
      const alreadyExists = detail.includes('already registered')
        || detail.includes('user_already_exists')
        || detail.includes('email taken')
        || detail.includes('duplicate')

      if (alreadyExists) {
        // Fallo informativo: el correo ya es cuenta Qaway. Invitar es para quien
        // NO tiene cuenta; un usuario existente se asigna desde Usuarios.
        return json({ error: `${inviteEmail} ya es una cuenta de Qaway. Asígnalo desde Usuarios en la empresa destino, o usa otro correo.` })
      }

      return json({ error: 'No se pudo enviar el correo de invitación.' })
    }

    return json({ ok: true })
  } catch (err) {
    return json({ error: `Ocurrió un error inesperado: ${(err as Error).message || 'inténtalo de nuevo'}` })
  }
})
