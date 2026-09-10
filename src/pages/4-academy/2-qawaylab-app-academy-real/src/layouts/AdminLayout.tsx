import { Suspense } from 'react'
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import GlobalSearch from '@/components/common/GlobalSearch'
import UserMenu from '@/components/common/UserMenu'
import RouteFallback from '@/components/common/RouteFallback'

const sidebarLinks = [
  { to: '/academy/app/admin', label: 'Dashboard', icon: '📊' },
  { to: '/academy/app/admin/cursos', label: 'Cursos', icon: '📚' },
  { to: '/academy/app/admin/alumnos', label: 'Usuarios', icon: '👥' },
  { to: '/academy/app/admin/docentes', label: 'Docentes', icon: '👨‍🏫' },
  { to: '/academy/app/admin/pagos', label: 'Pagos', icon: '💰' },
  { to: '/academy/app/admin/permisos', label: 'Permisos', icon: '🔐' },
]

const ALLOWED_ROLES = ['admin', 'support']

export default function AdminLayout() {
  const { user, profile, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!user) return <Navigate to="/academy/app/acceder" replace />
  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    )
  }
  if (!ALLOWED_ROLES.includes(profile.role || '')) return <Navigate to="/academy/app/acceder" replace />

  return (
    <div className="flex min-h-screen bg-surface-50">
      <aside className="fixed left-0 top-0 z-40 flex h-full w-64 flex-col border-r border-surface-200 bg-white">
        <div className="flex h-16 items-center border-b border-surface-200 px-6" />

        <nav className="flex-1 space-y-1 p-4">
          {sidebarLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === link.to || location.pathname.startsWith(link.to + '/')
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
              }`}
            >
              <span className="text-lg">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="border-t border-surface-200 p-4">
          <Link
            to="/academy/app/cursos"
            className="flex items-center gap-3 rounded-none px-3 py-2 text-sm font-medium text-surface-500 transition-colors hover:bg-surface-100 hover:text-surface-700"
          >
            ← Volver a Cursos
          </Link>
        </div>
      </aside>

      <div className="ml-64 flex flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-surface-200 bg-white/80 backdrop-blur-xl px-8">
          <div className="flex items-center gap-4">
            <GlobalSearch />
          </div>
          <div className="flex items-center gap-3">
            <UserMenu user={user} profile={profile} signOut={signOut} />
          </div>
        </header>

        <main className="flex-1 p-8">
          <Suspense fallback={<RouteFallback />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  )
}
