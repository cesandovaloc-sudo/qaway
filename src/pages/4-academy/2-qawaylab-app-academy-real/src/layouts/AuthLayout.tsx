import { Suspense } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import Logo from '@/components/common/Logo'
import RouteFallback from '@/components/common/RouteFallback'

export default function AuthLayout() {
  const { user, profile, loading } = useAuth()

  // Si ya está logueado, redirigir a su panel según rol
  const roleRoutes: Record<string, string> = {
    student: '/academy/app/panel',
    teacher: '/academy/app/docente',
    editor: '/academy/app/docente',
    admin: '/academy/app/admin',
    support: '/academy/app/admin',
  }

  // Mientras se resuelve la sesión NO mostramos el formulario: así un usuario ya
  // logueado nunca ve el login/registro parpadeando antes de ser redirigido a su panel
  // (el segundo guard cubre el caso de sesión activa cuyo perfil aún no cargó)
  if (loading || (user && !profile)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface-50">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (user && profile) {
    const redirectTo = roleRoutes[profile.role || '']
    if (redirectTo) return <Navigate to={redirectTo} replace />
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface-50">
      <div className="flex items-center justify-center px-4 pt-8">
        <Logo />
      </div>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </div>
      </main>
    </div>
  )
}
