import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'

// Procesa los callbacks que GoTrue/Supabase dejan en el URL de la app:
//  - #...&type=recovery -> SIEMPRE redirige a /update-password (jamás a /onboarding ni /hub/panel)
//  - #access_token=... / type=signup -> si cae en la raíz '/', se redirige a /onboarding/tu-plan
//  - #error=...&error_code=... -> enlace rechazado por el servidor (caducado/usado)
export default function AuthLinkHandler() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY' && location.pathname !== '/update-password') {
        navigate(`/update-password${window.location.hash || ''}`, { replace: true })
      }
    })
    return () => subscription?.unsubscribe()
  }, [navigate, location.pathname])

  useEffect(() => {
    const hash = window.location.hash
    if (!hash) return

    if (hash.includes('error')) {
      const params = new URLSearchParams(hash.replace(/^#/, ''))
      if (params.has('access_token') || params.has('code') || params.has('state')) return

      const qs = new URLSearchParams({
        linkError: params.get('error_code') || 'unknown',
        linkErrorDesc:
          params.get('error_description') ||
          'El enlace es inválido o ha expirado. Solicita uno nuevo.',
      })
      navigate(`/login?${qs.toString()}`, { replace: true })
      return
    }

    if (hash.includes('type=recovery')) {
      if (location.pathname !== '/update-password') {
        navigate(`/update-password${hash}`, { replace: true })
      }
      return
    }

    // Si la confirmación de email llega a la raíz '/' con access_token / type=signup,
    // redirigir inmediatamente a /onboarding/tu-plan sin mostrar la landing page de Inicio.
    if (location.pathname === '/' && (hash.includes('access_token') || hash.includes('type=signup'))) {
      navigate(`/onboarding/tu-plan${hash}`, { replace: true })
    }
  }, [navigate, location])

  return null
}
