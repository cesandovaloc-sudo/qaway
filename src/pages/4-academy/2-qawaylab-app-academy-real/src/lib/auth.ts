import { supabase } from '@/lib/supabase'

/**
 * Detecta si un error de Supabase es por sesión expirada.
 * Solo consideramos 401 (no autenticado) o mensajes específicos
 * de JWT expirado. NO atrapamos 403 porque pueden ser errores
 * legítimos de RLS (usuario autenticado sin permiso para ese recurso).
 */
interface AuthErrorLike { status?: unknown; statusCode?: unknown; code?: unknown; message?: unknown }

function isAuthError(error: unknown) {
  if (!error) return false

  const e = error as AuthErrorLike
  const status = String(e.status ?? e.statusCode ?? '')
  const code = String(e.code ?? '')
  const msg = String(e.message ?? '').toLowerCase()

  // 401 = sesión inválida o token faltante
  if (status === '401' || code === '401') return true
  // JWT o token expirado (puede venir como 403 desde storage)
  if (msg.includes('jwt expired') || msg.includes('token expired')) return true

  return false
}

/**
 * Maneja un error de autenticación forzando el cierre de sesión.
 * Esto hace que AuthContext detecte el cambio de estado (via onAuthStateChange)
 * y setee user a null, lo que dispara el <Navigate to="/acceder">
 * en los layouts protegidos.
 *
 * Solo actúa si es un error de sesión expirada (no RLS).
 */
export async function handleAuthError(error: unknown) {
  if (!isAuthError(error)) return false

  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (session) {
      await supabase.auth.signOut()
    }
  } catch {
    // Si falla el signOut, no podemos hacer mucho más
  }

  return true
}
