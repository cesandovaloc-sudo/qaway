import { supabase } from '@/config/supabase'

/**
 * Detecta si un error de Supabase es por sesión expirada o token inválido.
 *
 * Escenarios que cubre:
 * - 401: sesión inválida o token faltante
 * - "jwt expired" / "token expired": JWT expirado directo
 * - 42501 / "permission denied": viene de RLS cuando el JWT es inválido
 *   (Supabase no retorna 401, retorna error de RLS)
 * - "invalid claim": token malformado o revocado
 */
interface AuthErrorLike {
  status?: unknown
  statusCode?: unknown
  code?: unknown
  message?: unknown
}

function isAuthError(error: unknown): boolean {
  if (!error) return false

  const e = error as AuthErrorLike
  const status = String(e.status ?? e.statusCode ?? '')
  const code = String(e.code ?? '')
  const msg = String(e.message ?? '').toLowerCase()

  // 401 = sesión inválida o token faltante
  if (status === '401' || code === '401') return true
  // JWT o token expirado
  if (msg.includes('jwt expired') || msg.includes('token expired')) return true
  // Token malformado o revocado
  if (msg.includes('invalid claim') || msg.includes('invalid token')) return true
  // RLS falla porque el token es inválido (42501 = permission denied)
  // Solo detectamos si el error viene de una tabla que debería tener acceso
  if (code === '42501' && msg.includes('permission denied')) return true

  return false
}

/**
 * Verifica si la sesión actual es válida haciendo una query ligera.
 * Retorna true si la sesión es válida, false si está expirada.
 */
export async function isSessionValid(): Promise<boolean> {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return false

    // Verificar que el JWT no esté expirado comparando expires_at
    const expiresAt = session.expires_at
    if (expiresAt) {
      const now = Math.floor(Date.now() / 1000)
      // Si expira en menos de 30 segundos, considerar expirada
      if (expiresAt - now < 30) return false
    }

    return true
  } catch {
    return false
  }
}

/**
 * Maneja un error de autenticación forzando el cierre de sesión.
 * Esto hace que AuthContext detecte el cambio de estado (via onAuthStateChange)
 * y setee session a null, lo que dispara el <Navigate to="/login">
 * en los layouts protegidos.
 *
 * @returns true si el error era de sesión expirada y se procesó
 */
export async function handleAuthError(error: unknown): Promise<boolean> {
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
