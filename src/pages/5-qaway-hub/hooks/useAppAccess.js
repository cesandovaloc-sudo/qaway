import { useEffect, useState } from 'react'
import { supabase } from '@/config/supabase'

// UX únicamente: oculta apps sin derecho. La seguridad real es RLS.
// denied contiene slugs a ocultar (solo cuando loaded=true).
const SLUGS = ['crm', 'inventario', 'agenda', 'blog']

export function useAppAccess() {
  const [denied, setDenied] = useState(new Set())
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          if (alive) setLoaded(true)
          return
        }
        const res = await Promise.all(
          SLUGS.map(async (slug) => {
            const { data } = await supabase.rpc('user_can_use_app', { p_app_slug: slug })
            return [slug, data === true]
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
  }, [])

  return { denied, loaded }
}
