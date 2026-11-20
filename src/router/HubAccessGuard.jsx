import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'
import { logoutUser } from '@/config/auth'
import AppAccessLockedView from '@/components/ui/AppAccessLockedView'
import { hasPendingPasswordChange } from '@/components/auth/UpdatePasswordCard'
import { RouteLoading } from './RouteSuspense'

function resolveHubAccessRule(pathname) {
  const path = String(pathname || '').toLowerCase()
  if (
    path === '/hub/panel' || path.startsWith('/hub/panel/') ||
    path === '/hub/gestor_proyecto_eliminar' || path.startsWith('/hub/gestor_proyecto_eliminar/') ||
    path === '/hub/analytics' || path.startsWith('/hub/analytics/') ||
    path === '/hub/dashboards' || path.startsWith('/hub/dashboards/') ||
    path === '/hub/descargador-ig' || path.startsWith('/hub/descargador-ig/')
  ) {
    return { type: 'platform_only', moduleKey: path.includes('/hub/panel') ? 'panel' : null }
  }
  if (
    path === '/hub/gestor_proyectos' || path.startsWith('/hub/gestor_proyectos/') ||
    path === '/hub/gestor_proyecto' || path.startsWith('/hub/gestor_proyecto/')
  ) {
    return { type: 'app', appSlug: 'gestor-proyectos', moduleKey: 'gestor-proyectos' }
  }
  if (path === '/hub/inventario' || path.startsWith('/hub/inventario/')) {
    return { type: 'app', appSlug: 'inventario', moduleKey: 'inventario' }
  }
  if (path === '/hub/crm' || path.startsWith('/hub/crm/') || path === '/hub/waba-crm' || path.startsWith('/hub/waba-crm/')) {
    return { type: 'app', appSlug: 'crm', moduleKey: 'crm' }
  }
  if (path === '/hub/agenda' || path.startsWith('/hub/agenda/')) {
    return { type: 'app', appSlug: 'agenda', moduleKey: 'agenda' }
  }
  if (path === '/hub/blog-editor' || path.startsWith('/hub/blog-editor/')) {
    return { type: 'app', appSlug: 'blog', moduleKey: 'blog' }
  }
  if (path === '/hub/marketing' || path.startsWith('/hub/marketing/')) {
    return { type: 'app', appSlug: 'marketing', moduleKey: 'marketing' }
  }
  return { type: 'platform_only', moduleKey: null }
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
  const [state, setState] = useState({ checking: true, redirect: null, locked: false, moduleKey: null })

  useEffect(() => {
    let alive = true
    const rule = resolveHubAccessRule(location.pathname)

    const loginHref = `/login?redirect=${encodeURIComponent(location.pathname + location.search)}`

    const resolve = (next, locked = false, moduleKey = rule.moduleKey ?? null) => {
      clearTimeout(timeoutId)
      if (alive) setState({ checking: false, redirect: next, locked, moduleKey })
    }

    const timeoutId = setTimeout(() => {
      if (!alive) return
      if (hasLocalSupabaseSession()) {
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

      // Mientras Hub Panel esté en construcción y rutas legacy estén marcadas para eliminar,
      // ningún tenant puede ingresar: se muestra pantalla de acceso restringido (candado).
      if (rule.type === 'platform_only') {
        resolve(null, true, rule.moduleKey)
        return
      }

      if (hasPendingPasswordChange(session.user)) {
        resolve(`/update-password?redirect=${encodeURIComponent(location.pathname + location.search)}`)
        return
      }

      if (!user.tenant_id) {
        resolve(null, true, rule.moduleKey)
        return
      }

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('status, features')
        .eq('id', user.tenant_id)
        .maybeSingle()

      if (tenantError || !tenant) {
        resolve(null, true, rule.moduleKey)
        return
      }

      const locallyCompleted = localStorage.getItem(`qaway.onboarding_completed.${user.tenant_id}`) === 'true'
      const onboardingCompleted = tenant.features?.onboarding_completed === true || locallyCompleted
      const needsOnboarding = tenant.status !== 'active' && (tenant.status === 'draft' || !onboardingCompleted)

      if (needsOnboarding) {
        resolve(null, true, rule.moduleKey)
        return
      }

      const { data: appRow, error: appErr } = await supabase
        .from('app_catalog')
        .select('id')
        .eq('slug', rule.appSlug)
        .maybeSingle()

      if (appErr || !appRow?.id) {
        resolve(null, true, rule.moduleKey)
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
        resolve(null, true, rule.moduleKey)
        return
      }

      resolve(null)
    }

    checkAccess().catch(() => resolve(loginHref))
    return () => { alive = false }
  }, [location.pathname, location.search])

  if (state.checking) return <RouteLoading />
  if (state.locked) return <AppAccessLockedView moduleKey={state.moduleKey} />
  if (state.redirect) return <Navigate to={state.redirect} replace />
  return children
}
