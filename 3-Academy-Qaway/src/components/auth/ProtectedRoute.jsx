import { Navigate } from 'react-router-dom'
import useAuth from '@/hooks/useAuth'

/**
 * Protege rutas según autenticación y rol.
 *
 * Uso:
 *   <Route path="/panel" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
 *   <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminDashboard /></ProtectedRoute>} />
 *   <Route path="/docente" element={<ProtectedRoute roles={['admin','instructor']}><DocenteDashboard /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, roles = [] }) {
  const { session, loading, userRole } = useAuth()

  // Mostrar nada mientras se resuelve la sesión
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f5f5f4]">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#ff4b0b] border-t-transparent animate-spin mx-auto" />
          <p className="mt-3 text-xs text-[#666860]">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // No autenticado → redirigir a login
  if (!session) {
    return <Navigate to="/acceder" replace />
  }

  // Si se requiere un rol específico, verificar
  if (roles.length > 0 && !roles.includes(userRole)) {
    // Si es alumno pero no tiene permisos de admin/docente, redirigir al panel
    if (userRole === 'student') {
      return <Navigate to="/panel" replace />
    }
    // Si es instructor pero no admin, redirigir a su panel
    if (userRole === 'instructor' && !roles.includes('instructor')) {
      return <Navigate to="/docente" replace />
    }
    // Fallback: redirigir al home
    return <Navigate to="/" replace />
  }

  return children
}
