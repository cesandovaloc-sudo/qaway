import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Procesa los callbacks que GoTrue/Supabase dejan en el URL de la app:
//  - #access_token=... / ?code=...  -> flujo EXITOSO: lo consume supabase-js solo.
//  - #error=...&error_code=...&error_description=... -> enlace rechazado por el
//    servidor (caducado, ya usado o inválido). Se redirige a /login con los datos
//    del error para mostrar un aviso accionable (reenviar correo) en lugar de
//    dejar al usuario en una página muerta con el fragment en la barra.
export default function AuthLinkHandler() {
  const navigate = useNavigate()

  useEffect(() => {
    const hash = window.location.hash
    if (!hash || !hash.includes('error')) return

    const params = new URLSearchParams(hash.replace(/^#/, ''))
    if (params.has('access_token') || params.has('code') || params.has('state')) return

    const qs = new URLSearchParams({
      linkError: params.get('error_code') || 'unknown',
      linkErrorDesc:
        params.get('error_description') ||
        'El enlace es inválido o ha expirado. Solicita uno nuevo.',
    })
    navigate(`/login?${qs.toString()}`, { replace: true })
  }, [navigate])

  return null
}