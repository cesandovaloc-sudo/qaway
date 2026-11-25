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

    const { email, tenant_id, role = 'viewer', app_slugs = [], unidad_id = null, full_name = null, last_name = null } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return json({ error: 'Introduce un correo válido.' })
    if (!ROLES.includes(role)) return json({ error: 'Rol inválido.' })
    // Solo el global puede crear otros admin; el de marca invita viewer/editor/guest en SU marca.
    if (!isGlobalAdmin && (role === 'admin' || tenant_id !== callerRow.tenant_id)) {
      return json({ error: 'No tienes permisos para realizar esta acción.' })
    }

    const { data: tenant } = await admin.from('tenants').select('id, status').eq('id', tenant_id).single()
    // Marca operativa: activa o en arranque (modo prueba; el onboarding activa, y
    // un draft que vota invitar ya pasó registro). Fail-closed para lo demás.
    if (!tenant || !['active', 'draft'].includes(tenant.status)) return json({ error: 'La empresa destino no es válida.' })

    let validUnidadId: string | null = null
    if (unidad_id !== null && unidad_id !== undefined && String(unidad_id).trim() !== '') {
      const { data: unitRow } = await admin
        .from('gestor_unidades')
        .select('id')
        .eq('id', String(unidad_id).trim())
        .eq('tenant_id', String(tenant_id))
        .maybeSingle()
      if (!unitRow) return json({ error: 'El área seleccionada no pertenece a tu empresa.' })
      validUnidadId = unitRow.id
    }

    const { data: apps } = await admin.from('app_catalog').select('slug').in('slug', app_slugs)
    const validSlugs = (apps || []).map((a: { slug: string }) => a.slug)
    if (!validSlugs.length) return json({ error: 'Selecciona al menos una aplicación válida.' })

    const inviteEmail = String(email).toLowerCase()

    const { error: invErr } = await admin.from('user_invites').upsert(
      { email: inviteEmail, tenant_id, role, app_slugs: validSlugs, unidad_id: validUnidadId, expires_at: new Date(Date.now() + 7 * 864e5).toISOString(), accepted_at: null, created_by: caller.id },
      { onConflict: 'email,tenant_id' },
    )
    if (invErr) return json({ error: 'No se pudo enviar la invitación. Intenta nuevamente.' })

    const inviteData: Record<string, string> = {}
    if (typeof full_name === 'string' && full_name.trim()) inviteData.full_name = full_name.trim()
    if (typeof last_name === 'string' && last_name.trim()) inviteData.last_name = last_name.trim()

    const { error: mailErr } = await admin.auth.admin.inviteUserByEmail(inviteEmail, {
      redirectTo: `${siteUrl}/login`,
      ...(Object.keys(inviteData).length > 0 ? { data: inviteData } : {}),
    })

    if (mailErr) {
      // Clasificación por código estructurado (email_exists / user_already_exists) con respaldo
      // sobre el texto para versiones del SDK sin código.
      const code = mailErr.code || ''
      const detail = `${mailErr.message || ''} ${mailErr.status ?? ''}`.toLowerCase()
      const alreadyExists = code === 'email_exists'
        || code === 'user_already_exists'
        || detail.includes('already registered')
        || detail.includes('already exists')
        || detail.includes('user_already_exists')
        || detail.includes('email_exists')
        || detail.includes('email taken')
        || detail.includes('duplicate')

      if (alreadyExists) {
        // Identidad ya existe en Qaway: no duplicar cuenta. Agregar membresía al tenant.
        await admin.from('user_invites').delete().eq('email', inviteEmail).eq('tenant_id', tenant_id)

        const { data: existingUser } = await admin.from('users').select('id, tenant_id').eq('email', inviteEmail).maybeSingle()
        if (existingUser) {
          const { data: membershipRow } = await admin
            .from('tenant_memberships')
            .select('id, status')
            .eq('user_id', existingUser.id)
            .eq('tenant_id', tenant_id)
            .maybeSingle()

          const alreadyMember = membershipRow?.status === 'active'
          if (alreadyMember) {
            if (validUnidadId) {
              await admin.from('gestor_unidad_miembros').upsert(
                { tenant_id, unit_id: validUnidadId, user_id: existingUser.id, is_primary: true, status: 'active' },
                { onConflict: 'unit_id,user_id' },
              )
            }
            return json({ status: 'already_member' })
          }

          // Agregar/reactivar membresía (Option 1: misma identidad, múltiples tenants)
          await admin.from('tenant_memberships').upsert(
            { user_id: existingUser.id, tenant_id, role, status: 'active', is_default: false, invited_by: caller.id, updated_at: new Date().toISOString() },
            { onConflict: 'user_id,tenant_id' },
          )

          // Compatibilidad legacy: solo fijar users.tenant_id si no tiene uno
          if (!existingUser.tenant_id) {
            await admin.from('users').update({ tenant_id, role }).eq('id', existingUser.id)
          }

          // Asignar roles de app solicitados
          if (validSlugs.length) {
            const { data: appRows } = await admin.from('app_catalog').select('id, slug').in('slug', validSlugs)
            const roleRows = (appRows || []).map((a: { id: string }) => ({
              user_id: existingUser.id,
              tenant_id,
              app_id: a.id,
              role,
            }))
            if (roleRows.length) {
              await admin.from('user_app_roles').upsert(roleRows, { onConflict: 'user_id,tenant_id,app_id' })
            }
          }

          if (validUnidadId) {
            await admin.from('gestor_unidad_miembros').upsert(
              { tenant_id, unit_id: validUnidadId, user_id: existingUser.id, is_primary: true, status: 'active' },
              { onConflict: 'unit_id,user_id' },
            )
          }
          return json({ ok: true, status: 'member_added' })
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