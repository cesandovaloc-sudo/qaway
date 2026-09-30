import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react'
import { supabase } from '@/config/supabase'
import { useAuth } from './AuthContext'

export interface ScopedTenant {
  id: string
  name: string
  client_code?: string
  legal_name?: string | null
  branding?: Record<string, unknown> | null
  content?: Record<string, unknown> | null
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
  const { session, profile, loading: authLoading } = useAuth()

  // Determinar si el usuario conectado es Super Administrador de plataforma
  const isPlatformAdmin = Boolean(
    profile?.is_platform_admin === true ||
    (profile?.role === 'admin' && !profile?.tenant_id)
  )

  // Cargar scopedTenant desde sessionStorage al iniciar
  const [scopedTenant, setScopedTenantState] = useState<ScopedTenant | null>(() => {
    try {
      const raw = sessionStorage.getItem(SCOPED_TENANT_STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed.id === 'string') return parsed
      }
    } catch {}
    return null
  })

  const [tenantOptions, setTenantOptions] = useState<ScopedTenant[]>([])
  const [loadingTenants, setLoadingTenants] = useState(false)
  const [currentTenant, setCurrentTenant] = useState<ScopedTenant | null>(null)

  // Cargar lista de tenants activos si es Super Administrador
  useEffect(() => {
    let alive = true
    if (!isPlatformAdmin || !session) {
      setTenantOptions([])
      return
    }

    setLoadingTenants(true)
    supabase
      .from('tenants')
      .select('id, name, client_code, legal_name, branding, content, status')
      .eq('status', 'active')
      .order('name')
      .then(({ data, error }) => {
        if (!alive) return
        if (error) {
          console.error('[TenantContext] Error loading tenants:', error)
          setTenantOptions([])
        } else {
          setTenantOptions((data || []).map((t) => ({
            id: t.id,
            name: t.name,
            client_code: t.client_code,
            legal_name: t.legal_name,
            branding: t.branding,
            content: t.content,
          })))
        }
      })
      .catch(() => {
        if (alive) setTenantOptions([])
      })
      .finally(() => {
        if (alive) setLoadingTenants(false)
      })

    return () => {
      alive = false
    }
  }, [isPlatformAdmin, session])

  // Q Panel es la fuente de identidad compartida de la empresa. Inventario
  // consume sus datos, pero no los administra desde su configuración fiscal.
  const selectedTenantId = isPlatformAdmin ? scopedTenant?.id : profile?.tenant_id
  useEffect(() => {
    let alive = true
    if (!selectedTenantId || !session) {
      setCurrentTenant(null)
      return
    }

    supabase
      .from('tenants')
      .select('id, name, client_code, legal_name, branding, content, status')
      .eq('id', selectedTenantId)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!alive) return
        if (error || !data) {
          setCurrentTenant(null)
          return
        }
        setCurrentTenant(data)
      })
      .catch(() => {
        if (alive) setCurrentTenant(null)
      })

    return () => {
      alive = false
    }
  }, [selectedTenantId, session])

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
  } else if (profile?.tenant_id) {
    activeTenant = currentTenant || { id: profile.tenant_id, name: 'Mi Empresa' }
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
