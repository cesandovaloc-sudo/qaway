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
    // Módulo nativo del Hub: delegar al /login central con retorno.
    // Standalone (sin prefijo /hub/inventario): login propio relativo.
    if (location.pathname.startsWith('/hub/inventario')) {
      const redirect = encodeURIComponent(location.pathname + location.search)
      return <Navigate to={`/login?redirect=${redirect}`} replace />
    }
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}
