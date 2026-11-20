// auth-login-guard · login con contador de intentos y mensajes claros.
// ¿POR QUÉ existe? GoTrue limita por IP y no informa cuántos intentos quedan.
// Los fallos no llegan a Postgres, así que esta función es el único punto que
// puede contar por correo: consulta/registra en public.user_login_attempts
// (RPC service_role) y delega la validación real de la clave a Supabase Auth.
// PÚBLICA (verify_jwt: false): aquí se autentica con correo+clave, no con JWT.
// NUNCA registra la contraseña en logs ni en la BD.
// Política (20-nov-2026): 6 intentos = 2 libres + avisos 3/2/1 + bloqueo 15 min.
// El correo y la clave se diferencian a propósito, porque el responsable pidió
// mensajes no ambiguos (esto permite enumeración: riesgo aceptado y documentado).
// Razones y evidencia: doc2/9-Credenciales-y-auditoria/9.3.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const LOCK_MINUTES = 15
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function lockedMessage() {
  return 'Cuenta bloqueada ' + LOCK_MINUTES + ' minutos. Recupera el acceso con «¿Olvidaste tu contraseña?» o espera a que termine el bloqueo.'
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método no permitido' }, 405)

  const url = Deno.env.get('SUPABASE_URL') || ''
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
  if (!url || !serviceKey || !anonKey) return json({ error: 'Función sin configurar' }, 500)

  const body = await req.json().catch(() => null)
  const email = String(body?.email || '').trim().toLowerCase()
  const password = String(body?.password || '')
  if (!email || !password) return json({ error: 'Correo y contraseña requeridos' }, 400)
  if (!EMAIL_RE.test(email)) {
    return json({ error: 'Correo no válido. Revisa la dirección escrita.', code: 'invalid_email' }, 401)
  }

  const admin = createClient(url, serviceKey)
  const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0]?.trim() || 'desconocida'

  const { data: state, error: stateErr } = await admin.rpc('login_guard_state', { p_email: email })
  if (stateErr) return json({ error: 'No se pudo verificar el estado de acceso.' }, 500)
  if (state?.locked) {
    return json({
      error: lockedMessage(),
      code: 'account_locked',
      locked: true,
      locked_until: state.locked_until,
      minutes_remaining: state.minutes_remaining,
    }, 429)
  }

  // Diferenciar correo inexistente de clave errónea. RPC SECURITY DEFINER
  // (solo service_role): devuelve un booleano, nunca datos personales.
  // supabase-js 2.112 no expone admin.getUserByEmail, por eso es RPC.
  const { data: found } = await admin.rpc('login_email_exists', { p_email: email })
  const emailExists = Boolean(found)

  const authClient = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  const { data, error } = await authClient.auth.signInWithPassword({ email, password })

  if (error || !data?.session) {
    // Correo sin confirmar NO es un fallo de clave: no consume intentos.
    if (String((error as { code?: string } | null)?.code || '') === 'email_not_confirmed') {
      return json({ error: 'Te falta confirmar tu correo.', code: 'email_not_confirmed' }, 403)
    }

    const { data: fail } = await admin.rpc('login_guard_failure', {
      p_email: email,
      p_user_id: ((data as { user?: { id?: string } } | null)?.user?.id) ?? null,
      p_ip: ip,
    })
    if (fail?.locked) {
      return json({
        error: lockedMessage(),
        code: 'account_locked',
        locked: true,
        remaining: 0,
        locked_until: fail.locked_until,
      }, 429)
    }

    const quedan = fail?.remaining ?? 0
    if (!emailExists) {
      // Mensaje fijo para correo inexistente: sin contador, sin ambigüedad.
      return json({ error: 'Correo no encontrado. Revisa la dirección escrita.', code: 'email_not_found' }, 401)
    }
    // Dos primeros fallos sin aviso; desde el tercero: 3, 2 y 1 intentos.
    const aviso = quedan <= 3
      ? ' Te quedan ' + quedan + (quedan === 1 ? ' intento.' : ' intentos.')
      : ''
    return json({
      error: 'Contraseña incorrecta.' + aviso,
      remaining: quedan,
      code: 'invalid_credentials',
    }, 401)
  }

  await admin.rpc('login_guard_success', { p_email: email })
  return json({
    access_token: data.session.access_token,
    refresh_token: data.session.refresh_token,
    expires_at: data.session.expires_at,
    user_id: data.session.user.id,
    metadata: data.session.user.user_metadata || {},
  }, 200)
})
