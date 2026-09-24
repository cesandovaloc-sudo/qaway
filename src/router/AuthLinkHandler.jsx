import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

// Procesa los callbacks que GoTrue/Supabase dejan en el URL de la app:
//  - #access_token=... / ?code=... -> si cae en la raíz '/', se redirige de inmediato a /onboarding
//  - #error=...&error_code=... -> enlace rechazado por el servidor (caducado/usado)
export default function AuthLinkHandler() {
  const navigate = useNavigate()
  const location = useLocation()

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

    // Si la confirmación de email llega a la raíz '/' con access_token / type=signup,
    // redirigir inmediatamente a /onboarding sin mostrar la landing page de Inicio.
    if (location.pathname === '/' && (hash.includes('access_token') || hash.includes('type=signup') || hash.includes('type=recovery'))) {
      navigate(`/onboarding${hash}`, { replace: true })
    }
  }, [navigate, location])

  return null
}