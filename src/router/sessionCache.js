/**
 * Sesión compartida del Hub (solución estructural, no fallback).
 *
 * Antes, cada capa volvía a pedir `auth.getSession()`: ProtectedRoute,
 * HubAccessGuard y HubPanelPage. En frío cada llamada ronda los 2-3 s, así que
 * la cadena se pagaba tres veces por arranque y otra vez por módulo.
 *
 * Esta caché solo comparte la petición en vuelo y su resultado por un TTL
 * corto. Nunca sustituye la autorización: el guard sigue consultando users,
 * tenants y suscripciones con RLS.
 */
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'

const TTL_MS = 15000
let memo = null

export function getSesionCompartida() {
  const ahora = Date.now()
  if (memo && ahora - memo.at < TTL_MS) {
    return memo.promise || Promise.resolve(memo.value)
  }

  const supabase = getSupabaseClient()
  if (!supabase) return Promise.resolve({ data: { session: null }, error: null })

  const promise = supabase.auth.getSession().then((res) => {
    memo = { at: Date.now(), value: res }
    return res
  }).catch((error) => {
    memo = null
    throw error
  })
  memo = { at: ahora, promise }
  return promise
}

export function invalidarSesionCompartida() {
  memo = null
}
