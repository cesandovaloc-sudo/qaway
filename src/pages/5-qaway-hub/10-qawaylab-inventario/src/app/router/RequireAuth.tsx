import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    )
  }

  if (!session) {
    const loginPath = location.pathname.startsWith('/hub/inventario') ? '/hub/inventario/login' : '/login'
    return <Navigate to={loginPath} replace state={{ from: location }} />
  }

  return <Outlet />
}
