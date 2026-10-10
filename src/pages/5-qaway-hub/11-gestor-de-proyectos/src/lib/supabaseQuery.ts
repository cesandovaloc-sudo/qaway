import { handleAuthError, isSessionValid } from '@/lib/auth'

/**
 * Ejecuta una función de consulta Supabase y maneja errores de sesión expirada.
 * Verifica la sesión ANTES de la query y DESPUÉS si falla.
 *
 * Uso:
 *   const data = await safeQuery(() =>
 *     supabase.from('table').select('*').single()
 *   )
 */
export async function safeQuery<T>(
  queryFn: () => PromiseLike<{ data: T | null; error: unknown }>
): Promise<T> {
  // Verificar sesión antes de la query
  const valid = await isSessionValid()
  if (!valid) {
    const { supabase } = await import('@/config/supabase')
    await supabase.auth.signOut()
    throw new Error('Sesión expirada')
  }

  const { data, error } = await queryFn()

  if (error) {
    const wasAuth = await handleAuthError(error)
    if (!wasAuth) {
      // Si no era error de auth, verificar si la sesión se invalidó después
      const stillValid = await isSessionValid()
      if (!stillValid) {
        const { supabase } = await import('@/config/supabase')
        await supabase.auth.signOut()
        throw new Error('Sesión expirada')
      }
    }
    throw error
  }

  return data as T
}

/**
 * Versión para queries que pueden retornar null (sin .single()).
 */
export async function safeQueryOptional<T>(
  queryFn: () => PromiseLike<{ data: T | null; error: unknown }>
): Promise<T | null> {
  const valid = await isSessionValid()
  if (!valid) {
    const { supabase } = await import('@/config/supabase')
    await supabase.auth.signOut()
    throw new Error('Sesión expirada')
  }

  const { data, error } = await queryFn()

  if (error) {
    const wasAuth = await handleAuthError(error)
    if (!wasAuth) {
      const stillValid = await isSessionValid()
      if (!stillValid) {
        const { supabase } = await import('@/config/supabase')
        await supabase.auth.signOut()
        throw new Error('Sesión expirada')
      }
    }
    throw error
  }

  return data
}
