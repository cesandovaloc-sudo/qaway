import { useEffect, useState } from 'react'
import { supabase } from '@/config/supabase'

// UX únicamente: oculta apps sin derecho. La seguridad real es RLS.
// denied contiene slugs a ocultar (solo cuando loaded=true).
// Re-evalúa al cambiar contexto de tenant (qaway:tenant-context-changed).
const FALLBACK_SLUGS = ['crm', 'inventario', 'agenda', 'blog', 'proyectos', 'tareas']

export function useAppAccess() {
  const [denied, setDenied] = useState(new Set())
  const [loaded, setLoaded] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const onCtx = () => setVersion((v) => v + 1)
    window.addEventListener('qaway:tenant-context-changed', onCtx)
    return () => window.removeEventListener('qaway:tenant-context-changed', onCtx)
  }, [])

  useEffect(() => {
    let alive = true
    setLoaded(false)
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (alive) { setDenied(new Set()); setLoaded(true) }
          return
        }
        let slugs = FALLBACK_SLUGS
        try {
          const { data: catalog } = await supabase.from('app_catalog').select('slug')
          const fromCatalog = (catalog || []).map((r) => r?.slug).filter(Boolean)
          if (fromCatalog.length) slugs = Array.from(new Set([...fromCatalog, ...FALLBACK_SLUGS]))
        } catch (_) {}
        const res = await Promise.all(
          slugs.map(async (slug) => {
            try {
              const { data } = await supabase.rpc('user_can_use_app', { p_app_slug: slug })
              return [slug, data === true]
            } catch (_) {
              return [slug, true]
            }
          }),
        )
        if (!alive) return
        setDenied(new Set(res.filter(([, ok]) => !ok).map(([s]) => s)))
        setLoaded(true)
      } catch {
        if (alive) setLoaded(true)
      }
    })()
    return () => {
      alive = false
    }
  }, [version])

  return { denied, loaded }
}
