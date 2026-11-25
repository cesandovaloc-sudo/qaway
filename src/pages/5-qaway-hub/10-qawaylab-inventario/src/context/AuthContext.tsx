import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/config/supabase'
import { userService } from '@/services/userService'
import type { User } from '@/types/user'

export interface TenantMembership {
  membership_id: string
  tenant_id: string
  tenant_slug: string | null
  tenant_name: string | null
  tenant_status: string | null
  membership_role: string
  membership_status: string
  is_default: boolean
  is_active_context: boolean
}

interface AuthContextValue {
  session: Session | null
  profile: User | null
  loading: boolean
  memberships: TenantMembership[]
  activeTenantId: string | null
  tenantLoading: boolean
  needsTenantSelection: boolean
  selectTenant: (tenantId: string) => Promise<void>
  refreshTenantContext: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithOAuth: (provider: 'google') => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [memberships, setMemberships] = useState<TenantMembership[]>([])
  const [activeTenantId, setActiveTenantId] = useState<string | null>(null)
  const [tenantLoading, setTenantLoading] = useState(false)

  // Restaurar sesión persistida y suscribirse a cambios de auth
  useEffect(() => {
    let mounted = true

    // Temporizador de seguridad (failsafe)
    const failsafe = setTimeout(() => {
      if (mounted) setLoading(false)
    }, 1500)

    // Validar sesión persistida
    supabase.auth
      .getSession()
      .then(async ({ data: sessionData, error: sessionErr }) => {
        if (!mounted) return
        if (sessionErr || !sessionData?.session) {
          setSession(null)
          return
        }

        // Validación activa contra Supabase Auth: confirma si el token no fue revocado en servidor
        const { data: userData, error: userErr } = await supabase.auth.getUser()
        if (!mounted) return

        if (userErr || !userData?.user) {
          // Token inválido, expirado en servidor o revocado
          setSession(null)
          setProfile(null)
        } else {
          setSession(sessionData.session)
        }
      })
      .catch(() => {
        if (mounted) setSession(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
      if (!mounted) return
      if (event === 'SIGNED_OUT' || !nextSession) {
        setSession(null)
        setProfile(null)
        setMemberships([])
        setActiveTenantId(null)
      } else {
        setSession(nextSession)
      }
    })

    return () => {
      mounted = false
      clearTimeout(failsafe)
      subscription.unsubscribe()
    }
  }, [])

  const loadTenantContext = useCallback(async (user: User | null) => {
    setTenantLoading(true)
    try {
      const { data, error } = await supabase.rpc('get_my_tenant_memberships')
      if (error) throw error
      const rows = (data ?? []) as TenantMembership[]
      setMemberships(rows)

      const active = rows.find((m) => m.is_active_context)
      if (active) {
        setActiveTenantId(active.tenant_id)
        return
      }

      if (rows.length === 1) {
        const only = rows[0]
        const { error: setErr } = await supabase.rpc('set_active_tenant', { p_tenant_id: only.tenant_id })
        if (setErr) throw setErr
        setActiveTenantId(only.tenant_id)
        setMemberships(rows.map((m) => ({ ...m, is_active_context: m.tenant_id === only.tenant_id })))
        return
      }

      // Múltiples membresías sin contexto activo: exigir selección explícita.
      if (rows.length > 1) {
        setActiveTenantId(null)
        return
      }

      // 0 membresías: fallback legacy no destructivo
      setActiveTenantId(user?.tenant_id ?? null)
    } catch {
      // Fallback no destructivo: mantener comportamiento previo basado en users.tenant_id
      setMemberships([])
      setActiveTenantId(user?.tenant_id ?? null)
    } finally {
      setTenantLoading(false)
    }
  }, [])

  const refreshTenantContext = useCallback(async () => {
    await loadTenantContext(profile)
  }, [loadTenantContext, profile])

  // Cargar perfil (rol/permisos) desde la tabla `users` cuando hay sesión
  const userId = session?.user?.id
  useEffect(() => {
    let cancelled = false
    if (!userId) {
      setProfile(null)
      setMemberships([])
      setActiveTenantId(null)
      setTenantLoading(false)
      return
    }
    ;(async () => {
      try {
        const user = await userService.getCurrentUser()
        if (cancelled) return
        setProfile(user)
        await loadTenantContext(user)
      } catch {
        if (!cancelled) {
          setProfile(null)
          setMemberships([])
          setActiveTenantId(null)
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [userId, loadTenantContext])

  // Auto-refresh: refrescar sesión antes de que expire
  const refreshTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!session) {
      if (refreshTimer.current) clearTimeout(refreshTimer.current)
      return
    }

    const refreshSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      if (!currentSession) return

      const expiresAt = currentSession.expires_at
      if (!expiresAt) return

      const now = Math.floor(Date.now() / 1000)
      const secondsUntilExpiry = expiresAt - now

      // Si expira en menos de 5 minutos, refrescar
      if (secondsUntilExpiry < 300) {
        const { error } = await supabase.auth.refreshSession()
        if (error) {
          // Token no se pudo refrescar → sesión expirada
          setSession(null)
          setProfile(null)
          setMemberships([])
          setActiveTenantId(null)
        }
      }
    }

    // Verificar cada 60 segundos
    refreshSession()
    refreshTimer.current = setInterval(refreshSession, 60_000)

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current)
    }
  }, [session])

  const selectTenant = useCallback(async (tenantId: string) => {
    const { error } = await supabase.rpc('set_active_tenant', { p_tenant_id: tenantId })
    if (error) throw error
    setActiveTenantId(tenantId)
    setMemberships((prev) => prev.map((m) => ({ ...m, is_active_context: m.tenant_id === tenantId })))
    // Compatibilidad: mantener profile.tenant_id alineado con contexto activo
    setProfile((prev) => (prev ? { ...prev, tenant_id: tenantId } : prev))
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signInWithOAuth = useCallback(async (provider: 'google') => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/hub/inventario` },
    })
    if (error) throw error
  }, [])

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setSession(null)
    setProfile(null)
    setMemberships([])
    setActiveTenantId(null)
  }, [])

  const needsTenantSelection =
    !!session &&
    !tenantLoading &&
    memberships.length > 1 &&
    !activeTenantId

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading,
        memberships,
        activeTenantId,
        tenantLoading,
        needsTenantSelection,
        selectTenant,
        refreshTenantContext,
        signIn,
        signInWithOAuth,
        resetPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
