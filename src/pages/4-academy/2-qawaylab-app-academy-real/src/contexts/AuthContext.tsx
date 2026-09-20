import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import type { Profile } from '@/lib/types'
import { isSuperAdmin, getAuthUser, logoutUser } from '../../../../../config/auth'
import { getSupabaseClient } from '../../../../5-qaway-hub/blog-editor/services/supabaseClient'

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ user: User | null; session: Session | null }>
  signUp: (email: string, password: string, metadata?: Record<string, unknown>) => Promise<{ user: User | null; session: Session | null }>
  signInWithOAuth: (provider: 'google') => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data: { session } }) => {
        if (session?.user) {
          setSession(session)
          setUser(session.user)
          fetchProfile(session.user.id, session.user.email)
        } else {
          // SSO: Si ya existe sesión activa de Super Administrador en la plataforma central
          const authUser = getAuthUser()
          if (authUser?.isAdmin) {
            const superUser: User = {
              id: 'superadmin-qaway',
              email: authUser.email || 'admin@qawaylab.com',
              app_metadata: {},
              user_metadata: { role: 'admin', full_name: 'Super Administrador Qaway' },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            }
            setUser(superUser)
            setProfile({
              id: 'superadmin-qaway',
              email: authUser.email || 'admin@qawaylab.com',
              full_name: 'Super Administrador Qaway',
              role: 'admin',
              created_at: new Date().toISOString(),
            })
            setLoading(false)
          } else {
            setSession(null)
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
        }
      })
      .catch((error) => {
        console.error('No se pudo leer la sesión de Academy:', error)
        const authUser = getAuthUser()
        if (authUser?.isAdmin) {
          const superUser: User = {
            id: 'superadmin-qaway',
            email: authUser.email || 'admin@qawaylab.com',
            app_metadata: {},
            user_metadata: { role: 'admin', full_name: 'Super Administrador Qaway' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          }
          setUser(superUser)
          setProfile({
            id: 'superadmin-qaway',
            email: authUser.email || 'admin@qawaylab.com',
            full_name: 'Super Administrador Qaway',
            role: 'admin',
            created_at: new Date().toISOString(),
          })
        } else {
          setSession(null)
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id, session.user.email)
      } else {
        const authUser = getAuthUser()
        if (authUser?.isAdmin) {
          const superUser: User = {
            id: 'superadmin-qaway',
            email: authUser.email || 'admin@qawaylab.com',
            app_metadata: {},
            user_metadata: { role: 'admin', full_name: 'Super Administrador Qaway' },
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          }
          setUser(superUser)
          setProfile({
            id: 'superadmin-qaway',
            email: authUser.email || 'admin@qawaylab.com',
            full_name: 'Super Administrador Qaway',
            role: 'admin',
            created_at: new Date().toISOString(),
          })
          setLoading(false)
        } else {
          setProfile(null)
          setLoading(false)
        }
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function fetchProfile(userId: string, userEmail?: string) {
    try {
      const emailToCheck = userEmail || user?.email || ''
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (isSuperAdmin(emailToCheck)) {
        setProfile({
          id: userId,
          email: emailToCheck,
          full_name: data?.full_name || 'Super Administrador Qaway',
          role: 'admin',
          avatar_url: data?.avatar_url || null,
          created_at: data?.created_at || new Date().toISOString(),
        })
        return
      }

      if (error) throw error
      setProfile(data as Profile)
    } catch {
      const emailToCheck = userEmail || user?.email || ''
      if (isSuperAdmin(emailToCheck)) {
        setProfile({
          id: userId,
          email: emailToCheck,
          full_name: 'Super Administrador Qaway',
          role: 'admin',
          created_at: new Date().toISOString(),
        })
      } else {
        setProfile(null)
      }
    } finally {
      setLoading(false)
    }
  }

  async function signIn(email: string, password: string) {
    const cleanEmail = email.trim()

    // 1. Probar autenticación en el Supabase de Academy
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password })
      if (!error && data?.user) {
        if (isSuperAdmin(cleanEmail)) {
          sessionStorage.setItem('qaway_auth_token', data.session?.access_token || 'token-superadmin')
          sessionStorage.setItem('qaway_auth_email', cleanEmail)
          sessionStorage.setItem('qaway_auth_role', 'admin')
        }
        return data
      }
      if (error && !isSuperAdmin(cleanEmail)) {
        throw error
      }
    } catch (err) {
      if (!isSuperAdmin(cleanEmail)) throw err
    }

    // 2. Si es cuenta de Super Administrador y no está registrada en Academy Supabase:
    if (isSuperAdmin(cleanEmail)) {
      // Intentar Supabase Central de Qaway Lab
      const centralClient = getSupabaseClient()
      if (centralClient) {
        try {
          const { data: cData, error: cErr } = await centralClient.auth.signInWithPassword({
            email: cleanEmail,
            password,
          })
          if (!cErr && cData?.session) {
            const token = cData.session.access_token
            sessionStorage.setItem('qaway_auth_token', token)
            sessionStorage.setItem('qaway_auth_email', cleanEmail)
            sessionStorage.setItem('qaway_auth_role', 'admin')
            const superUser: User = {
              id: cData.user.id || 'superadmin-qaway',
              email: cleanEmail,
              app_metadata: {},
              user_metadata: { role: 'admin', full_name: 'Super Administrador Qaway' },
              aud: 'authenticated',
              created_at: new Date().toISOString(),
            }
            setUser(superUser)
            setProfile({
              id: superUser.id,
              email: cleanEmail,
              full_name: 'Super Administrador Qaway',
              role: 'admin',
              created_at: new Date().toISOString(),
            })
            return { user: superUser, session: cData.session }
          }
        } catch (_) {}
      }

      // F-AUTH run-2: eliminados fallback localhost:4000 y concesión local
      // incondicional (otorgaban admin sin validar password). Solo sesiones
      // reales de Supabase (academy o central) autentican.
    }

    throw new Error('Credenciales incorrectas o usuario no registrado.')
  }

  async function signUp(email: string, password: string, metadata: Record<string, unknown> = {}) {
    // F-AUTH run-2: allowlist estricta. role/tenant_id nunca desde el cliente
    // (el trigger los fija en viewer/NULL; solo admin los asigna vía RPC).
    const safeData: Record<string, unknown> = {}
    if (typeof metadata.full_name === 'string') safeData.full_name = metadata.full_name.slice(0, 120)
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: safeData },
    })
    if (error) throw error
    return data
  }

  async function signInWithOAuth(provider: 'google') {
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/academy/app/panel` },
    })
    if (error) throw error
  }

  async function resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/academy/app/acceder`,
    })
    if (error) throw error
  }

  async function signOut() {
    try {
      await supabase.auth.signOut()
    } catch (_) {}
    logoutUser()
    setUser(null)
    setSession(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, session, profile, loading, signIn, signUp, signInWithOAuth, resetPassword, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
