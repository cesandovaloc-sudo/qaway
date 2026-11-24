import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'
import { getSesionCompartida, consultaCacheada, invalidarCacheAcceso } from './sessionCache'
import { getAppIdCacheado } from '@/config/appCatalogCache'
import { logoutUser } from '@/config/auth'
import AppAccessLockedView from '@/components/ui/AppAccessLockedView'
import { hasPendingPasswordChange } from '@/components/auth/UpdatePasswordCard'
import { RouteLoading } from './RouteSuspense'

function resolveHubAccessRule(pathname) {
  const path = String(pathname || '').toLowerCase()
  if (
    path === '/hub/panel' || path.startsWith('/hub/panel/') ||
    path === '/hub/gestor_proyecto_eliminar' || path.startsWith('/hub/gestor_proyecto_eliminar/') ||
    path === '/hub/proyectos' || path.startsWith('/hub/proyectos/') ||
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
  // Centro de Notificaciones y Perfiles: núcleo interno del Hub. Basta con
  // tener sesión (no depende de app_catalog ni de suscripción): guarda solo
  // datos locales de demostración, nunca datos de negocio.
  if (path === '/hub/notificaciones' || path.startsWith('/hub/notificaciones/')) {
    return { type: 'session', moduleKey: 'notificaciones' }
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
 * La caché de autorización (consultaCacheada / invalidarCacheAcceso) vive en
 * sessionCache.js para que HubAccessGuard y el Gestor compartan la misma
 * lectura de users y tenants (respetando RLS y TTL de 15 s).
 */

export default function HubAccessGuard({ children, loadingFallback = null }) {
  const location = useLocation()
  const [state, setState] = useState({ checking: true, redirect: null, locked: false, moduleKey: null })

  // El search no cambia la regla de acceso: solo se usa para construir el
  // redirect. Depender de él hacía que el guard repitiera 5 consultas en cada
  // cambio de query string.
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
      // Ante lentitud se cierra por defecto: NUNCA se abre una ruta protegida
      // apoyándose solo en una sesión guardada en el navegador.
      if (rule.type === 'platform_only') {
        resolve(null, true, rule.moduleKey)
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

      // ProtectedRoute ya pidió la sesión: reutilizamos esa promesa.
      // app_catalog no depende del usuario, así que se pide en paralelo.
      const [{ data: sessionData, error: sessionError }, { data: appRow, error: appErr }] = await Promise.all([
        getSesionCompartida(),
        getAppIdCacheado(rule.appSlug, supabase),
      ])
      const session = sessionData?.session
      if (sessionError || !session) {
        resolve(loginHref)
        return
      }

      const { data: user, error: userError } = await consultaCacheada(
        `user:${session.user.id}`,
        () => supabase
          .from('users')
          .select('id, full_name, last_name, email, role, is_platform_admin, tenant_id, avatar_url')
          .eq('id', session.user.id)
          .maybeSingle(),
      )

      if (userError || !user) {
        invalidarCacheAcceso()
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

      // Ruta de sesión: cualquier usuario autenticado con ficha válida.
      if (rule.type === 'session') {
        resolve(null)
        return
      }

      if (!user.tenant_id) {
        resolve(null, true, rule.moduleKey)
        return
      }

      const { data: tenant, error: tenantError } = await consultaCacheada(
        `tenant:${user.tenant_id}`,
        () => supabase
          .from('tenants')
          .select('id, name, legal_name, status, branding, content, features')
          .eq('id', user.tenant_id)
          .maybeSingle(),
      )

      if (tenantError || !tenant) {
        resolve(null, true, rule.moduleKey)
        return
      }

      // ONBOARDING GATE: deshabilitado temporalmente (no eliminado) para validar
      // el flujo operativo de la app primero. Rehabilitar poniendo en false.
      const ONBOARDING_GATE_DISABLED = true
      const locallyCompleted = localStorage.getItem(`qaway.onboarding_completed.${user.tenant_id}`) === 'true'
      const onboardingCompleted = tenant.features?.onboarding_completed === true || locallyCompleted
      const needsOnboarding = tenant.status !== 'active' && (tenant.status === 'draft' || !onboardingCompleted)

      if (!ONBOARDING_GATE_DISABLED && needsOnboarding) {
        // Solo una app puede pedir el perfil de empresa. Las rutas
        // platform_only (/hub/panel y legacy) siguen en candado absoluto:
        // ningún tenant las ve "por donde sea que ingrese".
        if (rule.type === 'app') {
          const destino = `${location.pathname}${location.search}`
          resolve(`/completar-perfil?redirect=${encodeURIComponent(destino)}`)
          return
        }
        resolve(null, true, rule.moduleKey)
        return
      }

      if (appErr || !appRow?.id) {
        resolve(null, true, rule.moduleKey)
        return
      }

      const { data: subRows, error: subErr } = await consultaCacheada(
        `sub:${user.tenant_id}:${appRow.id}`,
        () => supabase
          .from('tenant_app_subscriptions')
          .select('id, status')
          .eq('tenant_id', user.tenant_id)
          .eq('app_id', appRow.id)
          .in('status', ['active', 'trialing'])
          .limit(1),
      )

      if (subErr || !Array.isArray(subRows) || subRows.length === 0) {
        resolve(null, true, rule.moduleKey)
        return
      }

      resolve(null)
    }

    checkAccess().catch(() => resolve(loginHref))
    return () => { alive = false }
  }, [location.pathname])

  if (state.checking) return loadingFallback || <RouteLoading />
  if (state.locked) return <AppAccessLockedView moduleKey={state.moduleKey} />
  if (state.redirect) return <Navigate to={state.redirect} replace />
  return children
}
