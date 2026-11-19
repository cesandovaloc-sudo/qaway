import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'
import { logoutUser } from '@/config/auth'
import NotFoundPage from '@/pages/NotFoundPage'
import { RouteLoading } from './RouteSuspense'

function resolveAppSlugFromPath(pathname) {
  const path = String(pathname || '').toLowerCase()
  if (
    path === '/hub/gestor_proyectos' || path.startsWith('/hub/gestor_proyectos/') ||
    path === '/hub/gestor_proyecto' || path.startsWith('/hub/gestor_proyecto/') ||
    path === '/hub/gestor-proyectos-app' || path.startsWith('/hub/gestor-proyectos-app/') ||
    path === '/hub/proyectos' || path.startsWith('/hub/proyectos/')
  ) {
    return 'gestor-proyectos'
  }
  if (path === '/hub/inventario' || path.startsWith('/hub/inventario/')) return 'inventario'
  if (path === '/hub/crm' || path.startsWith('/hub/crm/') || path === '/hub/waba-crm' || path.startsWith('/hub/waba-crm/')) return 'crm'
  if (path === '/hub/agenda' || path.startsWith('/hub/agenda/')) return 'agenda'
  if (path === '/hub/blog-editor' || path.startsWith('/hub/blog-editor/')) return 'blog'
  if (path === '/hub/marketing' || path.startsWith('/hub/marketing/')) return 'marketing'
  return null
}

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
  const [state, setState] = useState({ checking: true, redirect: null, notFound: false })

  useEffect(() => {
    let alive = true
    const requiredAppSlug = resolveAppSlugFromPath(location.pathname)

    // Destino de vuelta al login CON la ruta actual. Sin esto, cualquier fallo de la
    // verificación perdía la ruta pedida (p. ej. /hub/gestor_proyectos) y el usuario
    // acababa en el destino por defecto del login: /hub/panel.
    const loginHref = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`

    const resolve = (next, notFound = false) => {
      clearTimeout(timeoutId)
      if (alive) setState({ checking: false, redirect: next, notFound })
    }

    // La verificación encadena llamadas a Supabase (getSession → users → tenants → suscripción) y
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
        if (requiredAppSlug) {
          resolve(null, true)
          return
        }
        resolve('/onboarding/tu-plan')
        return
      }

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('status, features')
        .eq('id', user.tenant_id)
        .maybeSingle()

      if (tenantError || !tenant) {
        if (requiredAppSlug) {
          resolve(null, true)
          return
        }
        resolve('/onboarding/tu-plan')
        return
      }

      const locallyCompleted = localStorage.getItem(`qaway.onboarding_completed.${user.tenant_id}`) === 'true'
      const onboardingCompleted = tenant.features?.onboarding_completed === true || locallyCompleted
      const needsOnboarding = tenant.status !== 'active' && (tenant.status === 'draft' || !onboardingCompleted)

      if (requiredAppSlug) {
        if (needsOnboarding) {
          resolve(null, true)
          return
        }

        const { data: appRow, error: appErr } = await supabase
          .from('app_catalog')
          .select('id')
          .eq('slug', requiredAppSlug)
          .maybeSingle()

        if (appErr || !appRow?.id) {
          resolve(null, true)
          return
        }

        const { data: subRows, error: subErr } = await supabase
          .from('tenant_app_subscriptions')
          .select('id, status')
          .eq('tenant_id', user.tenant_id)
          .eq('app_id', appRow.id)
          .in('status', ['active', 'trialing'])
          .limit(1)

        if (subErr || !Array.isArray(subRows) || subRows.length === 0) {
          resolve(null, true)
          return
        }

        resolve(null)
        return
      }

      resolve(needsOnboarding ? '/onboarding/tu-plan' : null)
    }

    checkAccess().catch(() => resolve(loginHref))
    return () => { alive = false }
  }, [location.pathname, location.search])

  if (state.checking) return <RouteLoading />
  if (state.notFound) return <NotFoundPage />
  if (state.redirect) return <Navigate to={state.redirect} replace />
  return children
}
