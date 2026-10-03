import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { getSupabaseClient } from '@/pages/5-qaway-hub/blog-editor/services/supabaseClient'
import { logoutUser } from '@/config/auth'
import { RouteLoading } from './RouteSuspense'

export default function HubAccessGuard({ children }) {
  const location = useLocation()
  const [state, setState] = useState({ checking: true, redirect: null })

  useEffect(() => {
    let alive = true

    const timeoutId = setTimeout(() => {
      if (alive) resolve('/login')
    }, 3500)

    const resolve = (next) => {
      clearTimeout(timeoutId)
      if (alive) setState({ checking: false, redirect: next })
    }

    const checkAccess = async () => {
      const supabase = getSupabaseClient()
      if (!supabase) {
        resolve('/login')
        return
      }

      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      const session = sessionData?.session
      if (sessionError || !session) {
        resolve(`/login?redirect=${encodeURIComponent(location.pathname + location.search)}`)
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
        resolve('/login')
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
        resolve('/onboarding')
        return
      }

      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('status, features')
        .eq('id', user.tenant_id)
        .maybeSingle()

      if (tenantError || !tenant) {
        resolve('/onboarding')
        return
      }

      const locallyCompleted = localStorage.getItem(`qaway.onboarding_completed.${user.tenant_id}`) === 'true'
      const onboardingCompleted = tenant.features?.onboarding_completed === true || locallyCompleted
      const needsOnboarding = tenant.status === 'draft' || !onboardingCompleted

      resolve(needsOnboarding ? '/onboarding' : null)
    }

    checkAccess().catch(() => resolve('/login'))
    return () => { alive = false }
  }, [location.pathname, location.search])

  if (state.checking) return <RouteLoading />
  if (state.redirect) return <Navigate to={state.redirect} replace />
  return children
}
