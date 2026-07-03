import { useState, useEffect, useCallback } from 'react'
import supabase, { getProfile, signOut as supabaseSignOut, isSupabaseConfigured } from '@/lib/supabase'

/**
 * Hook personalizado que maneja el estado de autenticación,
 * sesión, perfil del usuario y rol.
 */
export default function useAuth() {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userRole, setUserRole] = useState(null)

  useEffect(() => {
    let mounted = true

    async function init() {
      if (!isSupabaseConfigured()) {
        setLoading(false)
        return
      }

      // Obtener sesión actual
      const { data: { session: currentSession } } = await supabase.auth.getSession()

      if (!mounted) return

      setSession(currentSession)

      if (currentSession?.user) {
        const profileData = await getProfile(currentSession.user.id)
        if (mounted) {
          setProfile(profileData)
          setUserRole(profileData?.role || 'student')
        }
      }

      if (mounted) setLoading(false)
    }

    init()

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!mounted) return

      setSession(newSession)

      if (newSession?.user) {
        const profileData = await getProfile(newSession.user.id)
        if (mounted) {
          setProfile(profileData)
          setUserRole(profileData?.role || 'student')
        }
      } else {
        setProfile(null)
        setUserRole(null)
      }
    })

    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const logout = useCallback(async () => {
    await supabaseSignOut()
    setSession(null)
    setProfile(null)
    setUserRole(null)
  }, [])

  return {
    session,
    profile,
    loading,
    userRole,
    isAuthenticated: !!session,
    isAdmin: userRole === 'admin',
    isInstructor: userRole === 'instructor',
    isStudent: userRole === 'student',
    logout,
  }
}
