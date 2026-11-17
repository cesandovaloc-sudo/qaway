import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'
import { logoutUser } from '@/config/auth'
import { RouteLoading } from './RouteSuspense'

/**
 * ¿Hay una sesión de Supabase guardada en el navegador?
 *
 * Supabase JS persiste la sesión como `sb-<project-ref>-auth-token` (localStorage o
 * sessionStorage). Se usa solo como último recurso cuando la verificación en red
 * tarda demasiado: la autorización real la sigue haciendo RLS en el servidor.
 */
function hasLocalSupabaseSession() {
  try {
    const stores = [localStorage, sessionStorage]
    return stores.some((store) =>
      Object.keys(store).some((key) => key.startsWith('sb-') && key.endsWith('-auth-token')),
    )
  } catch (_) {
    return false
  }
}

export default function HubAccessGuard({ children }) {
  const location = useLocation()
  const [state, setState] = useState({ checking: true, redirect: null })

  useEffect(() => {
    let alive = true

    // Destino de vuelta al login CON la ruta actual. Sin esto, cualquier fallo de la
    // verificación perdía la ruta pedida (p. ej. /hub/gestor_proyectos) y el usuario
    // acababa en el destino por defecto del login: /hub/panel.
    const loginHref = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`

    // La verificación encadena 3 llamadas a Supabase (getSession → users → tenants) y
    // en frío cada una ronda los 2-3 s. Con 3.5 s el guard se rendía en cada arranque
    // y expulsaba al login a usuarios con sesión válida.
    const timeoutId = setTimeout(() => {
      if (!alive) return
      if (hasLocalSupabaseSession()) {
        // Sesión local presente: no expulsar ni rebotar en bucle; se renderiza y RLS
        // sigue siendo la autoridad sobre los datos.
        console.warn('[HubAccessGuard] Verificación lenta; se renderiza con la sesión local.')
        resolve(null)
        return
      }
      resolve(loginHref)
    }, 10000)

    const resolve = (next) => {
      clearTimeout(timeoutId)
      if (alive) setState({ checking: false, redirect: next })
    }

    const checkAccess = async () => {
      const supabase = getSupabaseClient()
      if (!supabase) {
        resolve(loginHref)
        return
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (sessionError || !session) {
        resolve(loginHref)
        return
      }

      const { data: user, error: userError } = await supabase
        .from('users')
        .select('tenant_id, is_platform_admin, role')
        .eq('id', session.user.id)
        .maybeSingle()

      if (userError || !user) {
        // La sesión local apunta a un usuario que ya no existe en la base de datos (eliminado o revocado).
        // Limpiamos la sesión huérfana localmente para evitar bucles de rebote infinitos con /login.
        try {
          await supabase.auth.signOut({ scope: 'local' })
        } catch (_) {}
        try {
          logoutUser()
          Object.keys(localStorage).forEach((k) => {
            if (k.startsWith('sb-') && k.endsWith('-auth-token')) localStorage.removeItem(k)
          })
          Object.keys(sessionStorage).forEach((k) => {
            if (k.startsWith('sb-') && k.endsWith('-auth-token')) sessionStorage.removeItem(k)
          })
        } catch (_) {}
        resolve(loginHref)
        return
      }

      const isPlatformAdmin = user.is_platform_admin === true
        || session.user.app_metadata?.role === 'platform_admin'
        || session.user.user_metadata?.role === 'platform_admin'

      if (isPlatformAdmin) {
        resolve(null)
        return
      }

      if (!user.tenant_id) {
        resolve('/onboarding/tu-plan')
        return
      }

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('status, features')
        .eq('id', user.tenant_id)
        .maybeSingle()

      if (tenantError || !tenant) {
        resolve('/onboarding/tu-plan')
        return
      }

      const locallyCompleted = localStorage.getItem(`qaway.onboarding_completed.${user.tenant_id}`) === 'true'
      const onboardingCompleted = tenant.features?.onboarding_completed === true || locallyCompleted
      // Un tenant `active` ya salió del onboarding: el wizard lo trata asi y rebota al
      // panel (HubOnboardingPage: status active -> /hub/panel). Si aqui se le mandaba a
      // /onboarding/tu-plan, el usuario abria una app (p. ej. /hub/gestor_proyectos),
      // veia cargar y acababa devuelto a /hub/panel sin poder entrar nunca.
      const needsOnboarding = tenant.status !== 'active' && (tenant.status === 'draft' || !onboardingCompleted)

      resolve(needsOnboarding ? '/onboarding/tu-plan' : null)
    }

    checkAccess().catch(() => resolve(loginHref))
    return () => { alive = false }
  }, [location.pathname, location.search])

  if (state.checking) return <RouteLoading />
  if (state.redirect) return <Navigate to={state.redirect} replace />
  return children
}
