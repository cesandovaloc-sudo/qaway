import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2, Shield } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { userService } from '@/services/userService'
import type { UserPermissions } from '@/types/user'

/**
 * C-4 (run-2 · inventario.route-gate.session-only-admin-ui):
 * Gate de autorización por ruta, unificado con el comportamiento del panel
 * principal Hub (HubPanelPage.jsx): la sesión habilita, el permiso habilita la
 * sección, y la denegación muestra una tarjeta de "Acceso restringido" con el
 * mismo mensaje del Hub ("es una sección administrativa. Solicita acceso a tu
 * administrador"). Adaptado al tema visual del inventario (clases del design
 * system propio: surface/ink/muted-light), sin duplicar lógica de roles.
 *
 * Estructura: <RequirePermission permission="can_access_fiscal_settings">
 *   <Route path="contabilidad" element={<AccountingPage />} />
 *   ...
 * </RequirePermission>
 *
 * El gate complementa el RLS (Bloque 2); no lo reemplaza.
 */

/** Cualquier principal autenticado del proyecto compartido con este permiso
 * resuelto a true pasa. Se resuelve SIEMPRE contra el perfil real (role +
 * permissions via resolvePermissions en userService), jamás contra session. */
export type RoutePermission = keyof UserPermissions

export default function RequirePermission({ permission }: { permission: RoutePermission }) {
  const { session, loading, profile } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      </div>
    )
  }

  // Misma semántica de retorno de HubPanelPage: sin sesión → /login con retorno.
  if (!session) {
    if (location.pathname.startsWith('/hub/inventario')) {
      const redirect = encodeURIComponent(location.pathname + location.search)
      return <Navigate to={`/login?redirect=${redirect}`} replace />
    }
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  // Fail-closed: perfil sin resolver (o sin el permiso) → tarjeta restringida
  // del Hub, no silencio ni acceso. La decisión usa SIEMPRE la resolución
  // efectiva de la app (rol base + overrides via resolvePermissions), igual
  // que el resto del sistema.
  const allowed =
    Boolean(profile) &&
    userService.getEffectivePermissions(profile!)[permission as keyof UserPermissions] === true

  if (!allowed) {
    // Igual que el Hub: la tarjeta se renderiza DENTRO del shell (AppLayout
    // sigue montado via Outlet chain), no en página aparte.
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <div className="border border-white/10 rounded-2xl bg-surface p-10 text-center max-w-md">
          <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-white/5 text-muted-light/60">
            <Shield size={18} />
          </div>
          <p className="mt-3 text-sm font-extrabold text-white">Acceso restringido</p>
          <p className="mt-1 text-xs text-muted-light/60">
            Esta sección es administrativa. Solicita acceso a tu administrador para poder verla.
          </p>
        </div>
      </div>
    )
  }

  return <Outlet />
}
