import { useAuth } from '@/contexts/AuthContext'
import { isSuperAdmin } from '../../../../../config/auth'

const ROLE_ROUTES: Record<string, string> = {
  student: '/academy/app/panel',
  teacher: '/academy/app/docente',
  editor: '/academy/app/docente',
  admin: '/academy/app/admin',
  support: '/academy/app/admin',
}

export function useAuthGuard() {
  const { user, profile, loading } = useAuth()

  // Solo esperamos mientras la sesión se está resolviendo
  if (loading) {
    return { guard: 'loading' }
  }

  // Superadministrador: pase directo e inmediato al panel de administración
  if (user && isSuperAdmin(user.email)) {
    return { guard: 'redirect', target: '/academy/app/admin' }
  }

  // Usuario autenticado con profile: redirigir al panel según rol
  if (user && profile) {
    const redirectTo = ROLE_ROUTES[profile.role || '']
    if (redirectTo) {
      return { guard: 'redirect', target: redirectTo }
    }
  }

  // Sin sesión utilizable: se muestra el formulario de acceso
  return { guard: 'allow' }
}
