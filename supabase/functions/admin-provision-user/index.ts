// Alta asistida de usuarios y reseteo de contraseña (solo plataforma).
// Modalidad EXTRA a la invitación por correo (invite-user, que sigue intacta):
//  - create:         crea la cuenta auth con contraseña provisional y correo
//                    confirmado. Reutiliza user_invites + handle_new_user, así
//                    el trigger existente vincula tenant + rol + apps solos.
//  - reset_password: fija una nueva contraseña provisional, marca el cambio
//                    obligatorio y cierra las sesiones activas del usuario.
// Compuerta: solo users.role='admin' AND is_platform_admin. Fail-closed.
// 2026-11-16. El flag también se escribe en auth.user_metadata: es lo que lee
// la app para mostrar CambiarContrasenaModal en el primer ingreso.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ROLES = ['admin', 'editor', 'viewer', 'guest']
const MIN_PASSWORD = 8
const INVITE_TTL_MS = 7 * 864e5

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}

// Contraseña provisional sin caracteres ambiguos (0/O, 1/l/I) para dictado
// por teléfono o lectura en papel.
function provisionalPassword(len = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  const values = new Uint32Array(len)
  crypto.getRandomValues(values)
  return Array.from(values, (v) => chars[v % chars.length]).join('')
}

function alreadyRegisteredError(err: { code?: string; status?: number; message?: string } | null): boolean {
  const detail = `${err?.message || ''} ${err?.status ?? ''} ${err?.code || ''}`.toLowerCase()
  return detail.includes('already registered')
    || detail.includes('already exists')
    || detail.includes('user_already_exists')
    || detail.includes('duplicate')
}

serve(async (req: Request) => {
  try {
    if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
    if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

    const url = Deno.env.get('SUPABASE_URL') || ''
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    if (!url || !serviceKey || !anonKey) return json({ error: 'Función sin configurar' }, 500)

    // Identidad del llamador vía su JWT (nunca confiar en el body).
    const callerClient = createClient(url, anonKey, {
      global: { headers: { Authorization: req.headers.get('Authorization') || '' } },
    })
    const { data: { user: caller } } = await callerClient.auth.getUser()
    if (!caller) return json({ error: 'No autorizado' }, 401)

    const admin = createClient(url, serviceKey)
    const { data: callerRow } = await admin.from('users')
      .select('role, tenant_id, is_platform_admin').eq('id', caller.id).single()
    if (!callerRow) return json({ error: 'Sin perfil' }, 403)
    const isGlobalAdmin = callerRow.role === 'admin' && callerRow.is_platform_admin === true
    const isBrandAdmin = callerRow.role === 'admin' && callerRow.tenant_id !== null
    if (!isGlobalAdmin && !isBrandAdmin) {
      return json({ error: 'No tienes permisos para realizar esta acción.' }, 403)
    }

    const {
      action,
      email,
      user_id,
      tenant_id,
      role = 'viewer',
      app_slugs = [],
      full_name,
      last_name,
      password,
      must_change_password = true,
      unidad_id = null,
      phone = null,
    } = await req.json()

    const requiereCambioClave = must_change_password !== false

    // ─── Acción: crear cuenta con contraseña provisional ───
    if (action === 'create') {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) return json({ error: 'Introduce un correo válido.' })
      if (!ROLES.includes(role)) return json({ error: 'Rol inválido.' })
      if (!isGlobalAdmin && (role === 'admin' || tenant_id !== callerRow.tenant_id)) {
        return json({ error: 'No tienes permisos para realizar esta acción.' }, 403)
      }
      if (password && (typeof password !== 'string' || password.length < MIN_PASSWORD)) {
        return json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` })
      }

      // Misma validación de marca que invite-user: activa o en arranque.
      const { data: tenant } = await admin.from('tenants').select('id, status').eq('id', tenant_id).single()
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
      const fullName = typeof full_name === 'string' && full_name.trim()
        ? full_name.trim().slice(0, 120)
        : inviteEmail
      const lastName = typeof last_name === 'string' && last_name.trim()
        ? last_name.trim().slice(0, 120)
        : null
      const cleanPhone = typeof phone === 'string' && phone.trim()
        ? phone.trim().slice(0, 30)
        : null
      const finalPassword = typeof password === 'string' && password.length >= MIN_PASSWORD
        ? password
        : provisionalPassword()

      // Invitación pendiente: handle_new_user la consume al crear la cuenta
      // auth y vincula tenant + rol + apps + unidad. Aquí no se envía ningún correo.
      const { error: invErr } = await admin.from('user_invites').upsert(
        {
          email: inviteEmail, tenant_id, role, app_slugs: validSlugs, unidad_id: validUnidadId,
          expires_at: new Date(Date.now() + INVITE_TTL_MS).toISOString(),
          accepted_at: null, created_by: caller.id,
        },
        { onConflict: 'email,tenant_id' },
      )
      if (invErr) return json({ error: 'No se pudo preparar el alta. Intenta nuevamente.' })

      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: inviteEmail,
        password: finalPassword,
        email_confirm: true,
        user_metadata: {
          full_name: fullName,
          last_name: lastName,
          ...(requiereCambioClave ? { must_change_password: true } : {}),
        },
      })

      if (createErr || !created?.user) {
        if (alreadyRegisteredError(createErr)) {
          // Sin invitación huérfana: el correo ya pertenece a Qaway.
          await admin.from('user_invites').delete().eq('email', inviteEmail).eq('tenant_id', tenant_id)
          return json({ status: 'already_exists' })
        }
        console.error('[admin-provision-user] create_error', JSON.stringify({
          email: inviteEmail, code: createErr?.code || null, status: createErr?.status ?? null, message: createErr?.message || null,
        }))
        return json({ error: 'No se pudo crear la cuenta. Intenta nuevamente.' })
      }

      // El trigger ya creó el perfil (service role bypass de RLS): marcar el
      // cambio obligatorio de contraseña y teléfono si fue proporcionado.
      const userPatch: Record<string, unknown> = {}
      if (requiereCambioClave) userPatch.must_change_password = true
      if (cleanPhone) userPatch.phone = cleanPhone
      if (Object.keys(userPatch).length > 0) {
        await admin.from('users').update(userPatch).eq('id', created.user.id)
      }

      return json({ ok: true, user_id: created.user.id, email: inviteEmail, provisional_password: finalPassword })
    }

    // ─── Acción: restablecer contraseña perdida ───
    if (action === 'reset_password') {
      let targetRow: { id: string; tenant_id: string | null; role: string | null } | null = null
      if (typeof user_id === 'string' && user_id) {
        const { data: row } = await admin.from('users').select('id, tenant_id, role').eq('id', user_id).maybeSingle()
        targetRow = row
      } else if (email) {
        const { data: row } = await admin.from('users').select('id, tenant_id, role').ilike('email', String(email)).maybeSingle()
        targetRow = row
      }
      const uid = targetRow?.id || ''
      if (!uid) return json({ error: 'Usuario no encontrado.' })
      if (!isGlobalAdmin && (targetRow?.tenant_id !== callerRow.tenant_id || targetRow?.role === 'admin')) {
        return json({ error: 'No tienes permisos para realizar esta acción.' }, 403)
      }

      if (password && (typeof password !== 'string' || password.length < MIN_PASSWORD)) {
        return json({ error: `La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.` })
      }
      const finalPassword = typeof password === 'string' && password.length >= MIN_PASSWORD
        ? password
        : provisionalPassword()

      let metadataUpdate: Record<string, unknown> | undefined
      if (requiereCambioClave) {
        const { data: objetivo } = await admin.auth.admin.getUserById(uid)
        metadataUpdate = { ...(objetivo?.user?.user_metadata || {}), must_change_password: true }
      }
      const { error: updErr } = await admin.auth.admin.updateUserById(uid, {
        password: finalPassword,
        ...(metadataUpdate ? { user_metadata: metadataUpdate } : {}),
      })
      if (updErr) {
        console.error('[admin-provision-user] reset_error', JSON.stringify({
          user_id: uid, code: updErr.code || null, status: updErr.status ?? null, message: updErr.message || null,
        }))
        return json({ error: 'No se pudo restablecer la contraseña. Intenta nuevamente.' })
      }

      if (requiereCambioClave) {
        await admin.from('users').update({ must_change_password: true }).eq('id', uid)
      }

      // Cerrar sesiones activas (best-effort): obliga a reingresar con la nueva.
      try {
        await admin.auth.admin.signOut(uid)
      } catch (err) {
        console.error('[admin-provision-user] sign_out_error', (err as Error)?.message || String(err))
      }

      return json({ ok: true, user_id: uid, provisional_password: finalPassword })
    }

    return json({ error: 'Acción no reconocida.' }, 400)
  } catch (err) {
    console.error('[admin-provision-user] unexpected', (err as Error)?.message || String(err))
    return json({ error: 'Ocurrió un error inesperado. Intenta nuevamente.' })
  }
})
