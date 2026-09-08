import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/config/supabase'
import { userService } from '@/services/userService'
import type { User } from '@/types/user'

interface AuthContextValue {
  session: Session | null
  profile: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Restaurar sesión persistida y suscribirse a cambios de auth
  useEffect(() => {
    let mounted = true

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (!mounted) return
        setSession(data.session)
      })
      .catch(() => {
        if (mounted) setSession(null)
      })
      .finally(() => {
        if (mounted) setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  // Cargar perfil (rol/permisos) desde la tabla `users` cuando hay sesión
  const userId = session?.user?.id
  useEffect(() => {
    let cancelled = false
    if (!userId) {
      setProfile(null)
      return
    }
    userService
      .getCurrentUser()
      .then((user) => {
        if (!cancelled) setProfile(user)
      })
      .catch(() => {
        if (!cancelled) setProfile(null)
      })
    return () => {
      cancelled = true
    }
  }, [userId])

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

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setSession(null)
    setProfile(null)
  }, [])

  return (
    <AuthContext.Provider value={{ session, profile, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
