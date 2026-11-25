import { useState } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Building2, Loader2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

function TenantSelector() {
  const { memberships, selectTenant, signOut, profile } = useAuth()
  const [pendingId, setPendingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleSelect = async (tenantId: string) => {
    setPendingId(tenantId)
    setError(null)
    try {
      await selectTenant(tenantId)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo activar el tenant')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="min-h-dvh bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-white p-6 shadow-sm">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-brand">Contexto activo</p>
          <h1 className="mt-2 text-xl font-bold text-foreground">Selecciona una empresa</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {profile?.email ? `${profile.email} tiene acceso a varios tenants.` : 'Tu cuenta tiene acceso a varios tenants.'} Elige dónde quieres trabajar. Los datos no se mezclan.
          </p>
        </div>

        <div className="space-y-2">
          {memberships.map((m) => {
            const busy = pendingId === m.tenant_id
            return (
              <button
                key={m.membership_id}
                type="button"
                disabled={!!pendingId}
                onClick={() => handleSelect(m.tenant_id)}
                className="flex w-full items-center gap-3 rounded-xl border border-border px-4 py-3 text-left transition hover:border-brand/40 hover:bg-brand/5 disabled:opacity-60"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 text-brand">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-foreground truncate">{m.tenant_name || m.tenant_slug || m.tenant_id}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {m.tenant_slug ? `/${m.tenant_slug}` : 'Tenant'} · {m.membership_role}
                  </div>
                </div>
                {busy ? <Loader2 className="h-4 w-4 animate-spin text-brand" /> : null}
              </button>
            )
          })}
        </div>

        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}

        <div className="mt-5 flex justify-end">
          <button type="button" onClick={() => void signOut()} className="text-sm text-muted-foreground hover:text-foreground">
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  )
}

export default function RequireAuth() {
  const { session, loading, tenantLoading, needsTenantSelection } = useAuth()
  const location = useLocation()

  if (loading || (session && tenantLoading)) {
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

  if (needsTenantSelection) {
    return <TenantSelector />
  }

  return <Outlet />
}
