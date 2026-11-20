/**
 * Sesión y caché de acceso compartida del Hub (solución estructural, no fallback).
 *
 * Antes, cada capa volvía a pedir `auth.getSession()`, `users` y `tenants`:
 * ProtectedRoute, HubAccessGuard, contextoSesion, gpPermisosService y
 * perfilVisibleService. Aquí se comparte la petición en vuelo y su resultado
 * por un TTL corto (15 s). Nunca sustituye la autorización: las consultas
 * siguen pasando por RLS y se invalidan ante cualquier cambio de identidad.
 */
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'
import { invalidarAppCatalog } from '@/config/appCatalogCache'

const TTL_MS = 15000
let memo = null
const cacheAcceso = new Map()

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

export function consultaCacheada(key, loader, ttl = TTL_MS) {
  const ahora = Date.now()
  const hit = cacheAcceso.get(key)
  if (hit?.promise) return hit.promise
  if (hit && ahora - hit.at < ttl) return Promise.resolve(hit.value)

  const promise = loader().then((res) => {
    if (res && res.error) cacheAcceso.delete(key)
    else cacheAcceso.set(key, { value: res, at: Date.now() })
    return res
  }).catch((error) => {
    cacheAcceso.delete(key)
    throw error
  })
  cacheAcceso.set(key, { promise })
  return promise
}

export function invalidarCacheAcceso() {
  cacheAcceso.clear()
  invalidarSesionCompartida()
  invalidarAppCatalog()
}
