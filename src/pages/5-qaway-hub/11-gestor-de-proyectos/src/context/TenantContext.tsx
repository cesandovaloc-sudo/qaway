import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { useAuth } from './AuthContext'

export interface ScopedTenant {
  id: string
  name: string
  client_code?: string
  legal_name?: string | null
  branding?: Record<string, unknown> | null
  content?: Record<string, unknown> | null
  /** Subcadena (normalizada, sin tildes) para filtrar proyectos por cliente. */
  projectClientMatch?: string
}

// ── Organizaciones reales de proyectos (Fase 17): cero marcas de tienda ──
// Reemplaza la consulta a `tenants` de Supabase. El filtrado por cliente se
// resuelve en `useTenantFilteredProjects` (hooks/useProjects).
export const PROJECT_ORGANIZATIONS: ScopedTenant[] = [
  { id: 'org-qaway', name: 'Qaway Lab (Corporativo)', client_code: 'QAW', projectClientMatch: 'qaway lab' },
  { id: 'org-minedu', name: 'MINEDU - DIGERE', client_code: 'DIGERE', projectClientMatch: 'minedu' },
  { id: 'org-mml', name: 'Municipalidad Metropolitana', client_code: 'MML', projectClientMatch: 'municipalidad metropolitana' },
  { id: 'org-andina', name: 'Corporación Andina', client_code: 'CAD', projectClientMatch: 'corporacion andina' },
  { id: 'org-pacifico', name: 'Distribuidora Pacífico', client_code: 'DPI', projectClientMatch: 'distribuidora pacifico' },
  { id: 'org-aurea', name: 'Aurea Skincare', client_code: 'AUR', projectClientMatch: 'aurea skincare' },
]

function findStaticOrg(id: string | null | undefined): ScopedTenant | null {
  if (!id) return null
  return PROJECT_ORGANIZATIONS.find((org) => org.id === id) ?? null
}

interface TenantContextValue {
  scopedTenant: ScopedTenant | null
  activeTenant: ScopedTenant | null
  activeTenantId: string | null
  isPlatformAdmin: boolean
  tenantOptions: ScopedTenant[]
  loadingTenants: boolean
  setScopedTenant: (tenant: ScopedTenant | null) => void
  canCreateProduct: boolean
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined)

const SCOPED_TENANT_STORAGE_KEY = 'qaway.scopedTenant'

export function TenantProvider({ children }: { children: ReactNode }) {
  const { profile } = useAuth() ?? { profile: null }

  // Determinar si el usuario conectado es Super Administrador de plataforma
  // (HOTFIX-01: profile puede ser null fuera de sesión; jamás debe reventar).
  const safeProfile = profile ?? null
  const isPlatformAdmin = Boolean(
    safeProfile?.is_platform_admin === true ||
    (safeProfile?.role === 'admin' && !safeProfile?.tenant_id)
  )

  // Cargar scopedTenant desde sessionStorage al iniciar (solo IDs estáticos;
  // valores antiguos de tienda se descartan → cero marcas ajenas).
  const [scopedTenant, setScopedTenantState] = useState<ScopedTenant | null>(() => {
    try {
      const raw = sessionStorage.getItem(SCOPED_TENANT_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed.id === 'string') {
          const known = findStaticOrg(parsed.id)
          if (known) return known
        }
      }
    } catch {}
    return null
  })

  // Lista estática de organizaciones: sin consultas remotas, sin loading.
  const [tenantOptions] = useState<ScopedTenant[]>(PROJECT_ORGANIZATIONS)
  const [loadingTenants] = useState(false)

  // Resolución local del tenant corriente (sin Supabase).
  const selectedTenantId = isPlatformAdmin ? scopedTenant?.id : safeProfile?.tenant_id
  const currentTenant = findStaticOrg(selectedTenantId)

  // Modificar scopedTenant y sincronizarlo con sessionStorage y eventos
  const setScopedTenant = useCallback((tenant: ScopedTenant | null) => {
    setScopedTenantState(tenant)
    try {
      if (tenant) {
        sessionStorage.setItem(SCOPED_TENANT_STORAGE_KEY, JSON.stringify(tenant))
      } else {
        sessionStorage.removeItem(SCOPED_TENANT_STORAGE_KEY)
      }
    } catch (e) {
      console.warn('[TenantContext] Storage error:', e)
    }

    // Disparar evento global para sincronizar componentes o pestañas
    window.dispatchEvent(new CustomEvent('qaway-tenant-change', { detail: tenant }))
  }, [])

  // Escuchar cambios de storage y eventos personalizados entre pestañas/vistas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === SCOPED_TENANT_STORAGE_KEY) {
        try {
          const parsed = e.newValue ? JSON.parse(e.newValue) : null
          setScopedTenantState(parsed)
        } catch {
          setScopedTenantState(null)
        }
      }
    }

    const handleCustomChange = (e: Event) => {
      const detail = (e as CustomEvent<ScopedTenant | null>).detail
      setScopedTenantState(detail || null)
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('qaway-tenant-change', handleCustomChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('qaway-tenant-change', handleCustomChange)
    }
  }, [])

  // Calcular el tenant activo efectivo
  // Si es Super Administrador: depende de scopedTenant (puede ser null si no ha elegido empresa)
  // Si es usuario regular o tenant admin: se bloquea a su propio profile.tenant_id
  let activeTenant: ScopedTenant | null = null
  if (isPlatformAdmin) {
    activeTenant = scopedTenant ? (currentTenant || scopedTenant) : null
  } else if (safeProfile?.tenant_id) {
    activeTenant = currentTenant || { id: safeProfile.tenant_id, name: 'Mi Empresa' }
  }

  const activeTenantId = activeTenant?.id || null
  const canCreateProduct = !isPlatformAdmin || Boolean(activeTenantId)

  return (
    <TenantContext.Provider
      value={{
        scopedTenant,
        activeTenant,
        activeTenantId,
        isPlatformAdmin,
        tenantOptions,
        loadingTenants,
        setScopedTenant,
        canCreateProduct,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider')
  }
  return context
}
