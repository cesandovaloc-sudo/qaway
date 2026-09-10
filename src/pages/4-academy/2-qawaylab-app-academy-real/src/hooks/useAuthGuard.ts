import { useAuth } from '@/contexts/AuthContext'

const ROLE_ROUTES: Record<string, string> = {
  student: '/academy/app/panel',
  teacher: '/academy/app/docente',
  editor: '/academy/app/docente',
  admin: '/academy/app/admin',
  support: '/academy/app/admin',
}

export function useAuthGuard() {
  const { user, profile, loading } = useAuth()

  // Solo esperamos mientras la sesión se está resolviendo. Antes esta condición
  // incluía también "usuario sin profile", y como el profile puede no existir
  // (fila ausente o no legible), las páginas de acceso se quedaban girando para
  // siempre, sin formulario y sin forma de salir.
  if (loading) {
    return { guard: 'loading' }
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
