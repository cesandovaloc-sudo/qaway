import { useAuth } from '@/contexts/AuthContext'
import { Navigate } from 'react-router-dom'

const ROLE_ROUTES: Record<string, string> = {
  student: '/academy/app/panel',
  teacher: '/academy/app/docente',
  editor: '/academy/app/docente',
  admin: '/academy/app/admin',
  support: '/academy/app/admin',
}

export function useAuthGuard() {
  const { user, profile, loading } = useAuth()

  // Mientras se resuelve la sesión o el profile, mostramos loading
  if (loading || (user && !profile)) {
    return { guard: 'loading' }
  }

  // Usuario autenticado con profile: redirigir al panel según rol
  if (user && profile) {
    const redirectTo = ROLE_ROUTES[profile.role || '']
    if (redirectTo) {
      return { guard: 'redirect', target: redirectTo }
    }
  }

  // No hay usuario autenticado: permite acceder al formulario
  return { guard: 'allow' }
}
