import { useState, useEffect } from 'react'
import { Search, Bell, LogOut, User, Menu, Shield, ChevronDown, Warehouse, Users, Settings, Sun, Moon, Contrast, Layers, Home, Building2, MapPin, X } from 'lucide-react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
// @ts-ignore
import { AppSwitcherDropdown } from '../../../../5-gestor-de-proyectos/components/v2/AppSwitcherDropdown'

const roleLabels: Record<string, string> = {
  admin: 'Super Administrador',
  editor: 'Administrador de empresa',
  viewer: 'Miembro del equipo',
  guest: 'Invitado',
}

const sedesList = [
  { id: 'sed-01', name: 'Sede Principal', code: 'SED-01' },
  { id: 'sed-02', name: 'Sede Surco', code: 'SED-SUR' },
  { id: 'sed-03', name: 'Sede Miraflores', code: 'SED-MIR' },
  { id: 'sed-04', name: 'Sede Online', code: 'SED-ONL' },
]

const warehousesBySede: Record<string, Array<{ id: string; name: string; code: string }>> = {
  'sed-01': [
    { id: 'alm-01', name: 'Almacén Central', code: 'ALM-01' },
    { id: 'alm-02', name: 'Almacén Secundario', code: 'ALM-02' },
  ],
  'sed-02': [
    { id: 'alm-sur-01', name: 'Depósito Surco', code: 'ALM-SUR' },
    { id: 'alm-sur-02', name: 'Almacén Tienda', code: 'ALM-TND' },
  ],
  'sed-03': [
    { id: 'alm-mir-01', name: 'Almacén Exhibición', code: 'ALM-EXH' },
    { id: 'alm-mir-02', name: 'Depósito Rápido', code: 'ALM-RAP' },
  ],
  'sed-04': [
    { id: 'alm-onl-01', name: 'Almacén E-Commerce', code: 'ALM-ONL' },
  ],
}

const warehousesList = [
  { id: '1', name: 'Almacén Principal', code: 'ALM-01' },
  { id: '2', name: 'Tienda Surco', code: 'ALM-SUR' },
  { id: '3', name: 'Almacén Secundario', code: 'ALM-02' },
  { id: '4', name: 'Tienda Online', code: 'ALM-ONL' },
]

export default function Header({
  collapsed,
  onToggleSidebar,
}: {
  collapsed: boolean
  onToggleSidebar: () => void
}) {
  const { session, profile, signOut, loading } = useAuth()
  const { scopedTenant, setScopedTenant, isPlatformAdmin, tenantOptions, loadingTenants, activeTenant } = useTenant()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isTenantOpen, setIsTenantOpen] = useState(false)
  const [isSedeOpen, setIsSedeOpen] = useState(false)
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false)
  const [isWaffleOpen, setIsWaffleOpen] = useState(false)
  const [selectedSede, setSelectedSede] = useState<{ id: string; name: string; code: string } | null>(null)
  const [selectedWarehouse, setSelectedWarehouse] = useState<{ id: string; name: string; code: string } | null>(null)

  // Reseteo en cascada cuando cambia la empresa seleccionada
  useEffect(() => {
    setSelectedSede(null)
    setSelectedWarehouse(null)
  }, [scopedTenant?.id])

  // Reseteo en cascada cuando cambia la sede seleccionada
  useEffect(() => {
    setSelectedWarehouse(null)
  }, [selectedSede?.id])

  // Cierre unificado de todos los desplegables del Header
  const closeAllDropdowns = () => {
    setIsTenantOpen(false)
    setIsSedeOpen(false)
    setIsWarehouseOpen(false)
    setIsProfileOpen(false)
    setIsWaffleOpen(false)
  }

  // Toggles mutuamente excluyentes (abrir uno colapsa todos los demás)
  const toggleWaffle = () => {
    setIsWaffleOpen((prev) => {
      if (!prev) {
        setIsTenantOpen(false)
        setIsSedeOpen(false)
        setIsWarehouseOpen(false)
        setIsProfileOpen(false)
      }
      return !prev
    })
  }

  const toggleTenant = () => {
    setIsTenantOpen((prev) => {
      if (!prev) {
        setIsSedeOpen(false)
        setIsWarehouseOpen(false)
        setIsProfileOpen(false)
        setIsWaffleOpen(false)
      }
      return !prev
    })
  }

  const toggleSede = () => {
    setIsSedeOpen((prev) => {
      if (!prev) {
        setIsTenantOpen(false)
        setIsWarehouseOpen(false)
        setIsProfileOpen(false)
        setIsWaffleOpen(false)
      }
      return !prev
    })
  }

  const toggleWarehouse = () => {
    setIsWarehouseOpen((prev) => {
      if (!prev) {
        setIsTenantOpen(false)
        setIsSedeOpen(false)
        setIsProfileOpen(false)
        setIsWaffleOpen(false)
      }
      return !prev
    })
  }

  const toggleProfile = () => {
    setIsProfileOpen((prev) => {
      if (!prev) {
        setIsTenantOpen(false)
        setIsSedeOpen(false)
        setIsWarehouseOpen(false)
        setIsWaffleOpen(false)
      }
      return !prev
    })
  }

  // Listener para colapsar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAllDropdowns()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])
  const [themeMode, setThemeMode] = useState<'blanco' | 'grises' | 'contraste' | 'oscuro'>(() => {
    const raw = localStorage.getItem('qaway.hubTheme')
    if (raw === 'claro' || raw === 'blanco') return 'blanco'
    if (raw === 'grises') return 'grises'
    if (raw === 'oscuro') return 'oscuro'
    return 'contraste'
  })

  // Sincronización del tema con document.documentElement y localStorage (HubPanelPage.jsx:2144-2148)
  useEffect(() => {
    localStorage.setItem('qaway.hubTheme', themeMode)
    document.documentElement.style.colorScheme = (themeMode === 'blanco' || themeMode === 'grises') ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', themeMode)
    if (themeMode === 'oscuro') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    window.dispatchEvent(new CustomEvent('qaway-theme-change', { detail: themeMode }))
  }, [themeMode])

  // Caché local para eliminar al 100% el parpadeo/flash en recargas
  const [cachedProfile] = useState<{ displayName: string; avatarUrl: string | null; roleLabel: string; initials: string } | null>(() => {
    try {
      const raw = localStorage.getItem('qaway.hubProfile')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  // Regla oficial HubPanelPage.jsx:177-180:
  // "Carlos Enrique Sandoval Ocaña" → "Carlos S." · "Juanito Alimaña" → "Juanito A."
  // Si el nombre proviene de un correo administrativo (sin full_name en BD), se humaniza:
  // s.admin@qawaylab.com → "S Admin" (no siglas truncadas "S A.")
  const shortName = (str: string) => {
    if (!str || !str.trim()) return 'Usuario'
    let clean = str.trim()
    if (clean.includes('@')) {
      const parts = clean.split('@')[0].replace(/[._-]+/g, ' ').split(/\s+/).filter(Boolean)
      if (parts.length === 0) return 'Usuario'
      return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')
    }
    const parts = clean.split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'Usuario'
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    const lastNameInit = parts[1].charAt(0).toUpperCase()
    return `${firstName} ${lastNameInit}.`
  }

  // Guardar en caché cuando el perfil de Supabase esté resuelto
  useEffect(() => {
    if (profile) {
      const full = profile.full_name || ''
      const name = shortName(full)
      const role = roleLabels[profile.role] || profile.role || 'Miembro del equipo'
      const inits = (full || '?').split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase()
      try {
        localStorage.setItem(
          'qaway.hubProfile',
          JSON.stringify({
            displayName: name,
            avatarUrl: profile.avatar_url || null,
            roleLabel: role,
            initials: inits,
          })
        )
      } catch {
        // Ignorar storage errors
      }
    }
  }, [profile])

  // Anti-flash: solo se marca como resuelto si ya tenemos perfil real o perfil en caché.
  // Jamás hace fallback al email split antes de que termine de cargar.
  const hasRealData = Boolean(profile || cachedProfile)
  const identityResolved = !loading && hasRealData

  const activeData = profile
    ? {
        displayName: shortName(profile.full_name || ''),
        avatarUrl: profile.avatar_url || session?.user?.user_metadata?.avatar_url || null,
        roleLabel: roleLabels[profile.role] || profile.role || 'Miembro del equipo',
        initials: (profile.full_name || '?').split(' ').filter(Boolean).slice(0, 2).map((w: string) => w[0]).join('').toUpperCase(),
      }
    : cachedProfile || null

  const displayName = activeData?.displayName || (loading ? '' : 'Usuario')
  const avatarUrl = activeData?.avatarUrl || null
  const roleLabel = activeData?.roleLabel || (loading ? '' : 'Miembro del equipo')
  const initials = activeData?.initials || '?'
  const email = session?.user?.email ?? ''

  const handleLogout = async () => {
    try {
      localStorage.removeItem('qaway.hubProfile')
      await signOut()
    } catch {
      // Ignorar errores de logout
    }
    navigate('/login', { replace: true })
  }

  return (
    <header className="hub-chrome h-[72px] shrink-0 bg-[var(--hub-bg)] border-b border-[var(--hub-border)] flex items-center justify-between px-5 lg:px-6 relative z-50 text-[var(--hub-text)]">
      {/* Lado izquierdo: hamburguesa + Apps + Selector moderno de Almacén */}
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          className="p-2 rounded-full text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-hover)] transition-colors cursor-pointer"
        >
          <Menu size={20} className={collapsed ? '' : 'rotate-180'} />
        </button>

        {/* Waffle App Switcher con Dropdown oficial del Hub */}
        <div className="relative">
          <button
            type="button"
            onClick={toggleWaffle}
            className="group hidden sm:flex items-center gap-2 h-10 px-3 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] hover:border-white/20 text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] transition-all duration-300 ease-out cursor-pointer"
            title="Ecosistema de Aplicaciones"
          >
            <div className="grid grid-cols-3 gap-[3px] w-4 h-4 place-items-center">
              {[...Array(9)].map((_, i) => (
                <span
                  key={i}
                  className="w-[3px] h-[3px] rounded-full bg-[var(--hub-text-soft)] group-hover:bg-[#ff4b0b] transition-colors"
                />
              ))}
            </div>
            <span className="text-sm font-bold text-[var(--hub-text)] max-w-0 overflow-hidden group-hover:max-w-16 transition-all duration-350 ease-out whitespace-nowrap">
              Apps
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--hub-dim)] group-hover:text-[var(--hub-text)] transition-transform duration-200" />
          </button>

          <AppSwitcherDropdown
            isOpen={isWaffleOpen}
            onClose={() => setIsWaffleOpen(false)}
          />
        </div>

        {/* Home Animado (Volver a /hub/panel) */}
        <div className="hidden sm:block">
          <Link 
            to="/hub/panel"
            className="group flex items-center gap-2 h-10 px-3 rounded-xl border border-transparent hover:bg-[var(--hub-hover)] text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] transition-all duration-300 ease-out cursor-pointer"
            title="Volver al Panel del Hub (/hub/panel)"
          >
            <Home className="w-5 h-5 shrink-0 group-hover:text-[#ff4b0b] transition-colors" />
            <span className="text-sm font-bold text-[var(--hub-text)] max-w-0 overflow-hidden group-hover:max-w-[48px] transition-all duration-350 ease-out whitespace-nowrap">
              Inicio
            </span>
          </Link>
        </div>

        {/* Selector / Indicador de Empresa (Multi-Tenant) */}
        <div className="relative">
          {isPlatformAdmin ? (
            <>
              <button
                type="button"
                onClick={toggleTenant}
                className={`hidden md:flex items-center gap-2 h-10 px-3.5 rounded-xl border text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#ff4b0b]/40 cursor-pointer transition-all ${
                  scopedTenant
                    ? 'border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] text-[var(--hub-text)]'
                    : 'border-amber-500/25 bg-amber-500/5 text-amber-200/90 hover:bg-amber-500/10'
                }`}
                title="Seleccionar empresa de trabajo"
              >
                <Building2 size={15} className={scopedTenant ? 'text-[#ff4b0b]' : 'text-amber-400/80'} />
                <span className={`w-2 h-2 rounded-full ${scopedTenant ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400/80'}`} />
                <span className="max-w-36 truncate">
                  {scopedTenant ? scopedTenant.name : 'Sin empresa'}
                </span>
                <ChevronDown size={14} className={`w-3.5 h-3.5 text-[var(--hub-dim)] transition-transform duration-200 ${isTenantOpen ? 'rotate-180 text-[var(--hub-text)]' : ''}`} />
              </button>

              {isTenantOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsTenantOpen(false)} aria-label="Cerrar selector" />
                  <div className="hub-chrome absolute left-0 top-[calc(100%+8px)] w-80 rounded-2xl bg-[var(--hub-surface)] border border-[var(--hub-border)] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden text-left text-[var(--hub-text)]">
                    <div className="p-4 border-b border-[var(--hub-border-soft)] bg-[var(--hub-chip)]">
                      <div className="flex items-center gap-2">
                        <Building2 size={16} className="text-[#ff4b0b]" />
                        <p className="text-xs font-extrabold text-[var(--hub-text)]">Empresa de trabajo</p>
                      </div>
                      <p className="text-[10px] text-[var(--hub-dim)] mt-1">
                        Selecciona la empresa sobre la que registrarás y gestionarás productos.
                      </p>
                    </div>
                    <div className="p-2 max-h-64 overflow-y-auto space-y-0.5">
                      {loadingTenants ? (
                        <div className="p-3 text-xs text-[var(--hub-dim)] text-center">Cargando empresas...</div>
                      ) : tenantOptions.length === 0 ? (
                        <div className="p-3 text-xs text-[var(--hub-dim)] text-center">No se encontraron empresas</div>
                      ) : (
                        tenantOptions.map((t) => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => {
                              setScopedTenant(t)
                              setIsTenantOpen(false)
                            }}
                            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                              scopedTenant?.id === t.id
                                ? 'bg-[#ff4b0b]/15 text-[#ff4b0b] font-bold'
                                : 'text-[var(--hub-text-soft)] hover:bg-[var(--hub-hover)] hover:text-[var(--hub-text)] font-semibold'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${scopedTenant?.id === t.id ? 'bg-[#ff4b0b]' : 'bg-white/20'}`} />
                            <span className="truncate">{t.name}</span>
                            {t.client_code && (
                              <span className="ml-auto text-[10px] font-semibold text-[var(--hub-dim)] shrink-0">{t.client_code}</span>
                            )}
                          </button>
                        ))
                      )}
                    </div>
                    <div className="p-2 border-t border-[var(--hub-border-soft)] bg-[var(--hub-chip)]">
                      <button
                        type="button"
                        onClick={() => {
                          setScopedTenant(null)
                          setIsTenantOpen(false)
                        }}
                        disabled={!scopedTenant}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${
                          scopedTenant
                            ? 'text-red-400 hover:bg-red-400/10 cursor-pointer'
                            : 'text-[var(--hub-faint)] cursor-default'
                        }`}
                      >
                        <X size={14} className="w-3.5 h-3.5" />
                        Desactivar selección (Sin empresa)
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          ) : activeTenant ? (
            <div
              className="hidden md:flex items-center gap-2 h-10 px-3.5 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] text-[var(--hub-text)] text-sm font-bold"
              title={`Empresa asignada: ${activeTenant.name}`}
            >
              <Building2 size={15} className="text-[#ff4b0b]" />
              <span className="max-w-36 truncate">{activeTenant.name}</span>
            </div>
          ) : null}
        </div>

        {/* Selector de Sede: solo visible si hay una Empresa/Marca activa */}
        {activeTenant && (
          <div className="relative">
            <button
              type="button"
              onClick={toggleSede}
              className="hidden md:flex items-center gap-2 h-10 px-3.5 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] text-[var(--hub-text)] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer transition-all"
              title="Seleccionar sede"
            >
              <MapPin size={15} className="text-[#ff4b0b]" />
              <span className="max-w-36 truncate">{selectedSede ? selectedSede.name : 'Todas las sedes'}</span>
              <ChevronDown size={14} className={`w-3.5 h-3.5 text-[var(--hub-dim)] transition-transform duration-200 ${isSedeOpen ? 'rotate-180 text-[var(--hub-text)]' : ''}`} />
            </button>
            {isSedeOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSedeOpen(false)} aria-label="Cerrar selector" />
                <div className="hub-chrome absolute left-0 top-[calc(100%+8px)] w-72 rounded-2xl bg-[var(--hub-surface)] border border-[var(--hub-border)] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden text-left text-[var(--hub-text)]">
                  <div className="p-4 border-b border-[var(--hub-border-soft)] bg-[var(--hub-chip)]">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-[#ff4b0b]" />
                      <p className="text-xs font-extrabold text-[var(--hub-text)]">Cambiar de sede</p>
                    </div>
                    <p className="text-[10px] text-[var(--hub-dim)] mt-0.5">Filtra las operaciones por sucursal o sede física.</p>
                  </div>
                  <div className="p-2 max-h-64 overflow-y-auto space-y-0.5">
                    {sedesList.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSede(s)
                          setIsSedeOpen(false)
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          selectedSede?.id === s.id
                            ? 'bg-brand/15 text-brand font-bold'
                            : 'text-[var(--hub-text-soft)] hover:bg-[var(--hub-hover)] hover:text-[var(--hub-text)] font-semibold'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedSede?.id === s.id ? 'bg-[#ff4b0b]' : 'bg-white/20'}`} />
                        <span className="truncate">{s.name}</span>
                        <span className="ml-auto text-[10px] font-semibold text-[var(--hub-dim)] shrink-0">{s.code}</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-[var(--hub-border-soft)] bg-[var(--hub-chip)]">
                    <button
                      type="button"
                      onClick={() => { setSelectedSede(null); setIsSedeOpen(false); }}
                      disabled={!selectedSede}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${selectedSede ? 'text-red-400 hover:bg-red-400/10 cursor-pointer' : 'text-[var(--hub-faint)] cursor-default'}`}
                    >
                      <MapPin size={14} className="w-3.5 h-3.5" />
                      Todas las sedes (Vista general)
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Selector de Almacén: solo visible si hay una Sede seleccionada */}
        {activeTenant && selectedSede && (
          <div className="relative">
            <button
              type="button"
              onClick={toggleWarehouse}
              className="hidden md:flex items-center gap-2 h-10 px-3.5 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] text-[var(--hub-text)] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer transition-all"
              title="Seleccionar almacén de la sede"
            >
              <Warehouse size={15} className="text-[#ff4b0b]" />
              <span className="max-w-36 truncate">{selectedWarehouse ? selectedWarehouse.name : 'Todos los almacenes'}</span>
              <ChevronDown size={14} className={`w-3.5 h-3.5 text-[var(--hub-dim)] transition-transform duration-200 ${isWarehouseOpen ? 'rotate-180 text-[var(--hub-text)]' : ''}`} />
            </button>
            {isWarehouseOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsWarehouseOpen(false)} aria-label="Cerrar selector" />
                <div className="hub-chrome absolute left-0 top-[calc(100%+8px)] w-72 rounded-2xl bg-[var(--hub-surface)] border border-[var(--hub-border)] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden text-left text-[var(--hub-text)]">
                  <div className="p-4 border-b border-[var(--hub-border-soft)] bg-[var(--hub-chip)]">
                    <div className="flex items-center gap-2">
                      <Warehouse size={16} className="text-[#ff4b0b]" />
                      <p className="text-xs font-extrabold text-[var(--hub-text)]">Almacén en {selectedSede.name}</p>
                    </div>
                    <p className="text-[10px] text-[var(--hub-dim)] mt-0.5">Filtra el stock de esta sede por depósito o almacén.</p>
                  </div>
                  <div className="p-2 max-h-64 overflow-y-auto space-y-0.5">
                    {(warehousesBySede[selectedSede.id] || warehousesList).map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => {
                          setSelectedWarehouse(w)
                          setIsWarehouseOpen(false)
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                          selectedWarehouse?.id === w.id
                            ? 'bg-brand/15 text-brand font-bold'
                            : 'text-[var(--hub-text-soft)] hover:bg-[var(--hub-hover)] hover:text-[var(--hub-text)] font-semibold'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedWarehouse?.id === w.id ? 'bg-[#ff4b0b]' : 'bg-white/20'}`} />
                        <span className="truncate">{w.name}</span>
                        <span className="ml-auto text-[10px] font-semibold text-[var(--hub-dim)] shrink-0">{w.code}</span>
                      </button>
                    ))}
                  </div>
                  <div className="p-2 border-t border-[var(--hub-border-soft)] bg-[var(--hub-chip)]">
                    <button
                      type="button"
                      onClick={() => { setSelectedWarehouse(null); setIsWarehouseOpen(false); }}
                      disabled={!selectedWarehouse}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-colors ${selectedWarehouse ? 'text-red-400 hover:bg-red-400/10 cursor-pointer' : 'text-[var(--hub-faint)] cursor-default'}`}
                    >
                      <Warehouse size={14} className="w-3.5 h-3.5" />
                      Todos los almacenes de la sede
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Lado derecho: buscador con Ctrl K + campana + perfil Supabase */}
      <div className="flex items-center gap-3 lg:gap-5 ml-auto">
        <div className="relative hidden sm:block w-[220px] md:w-[280px] lg:w-[360px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--hub-dim)]" />
          <input
            type="text"
            placeholder="Buscar productos, SKU, categorías..."
            className="w-full bg-[var(--hub-chip)] border border-[var(--hub-border)] rounded-xl pl-10 pr-16 h-10 text-sm text-[var(--hub-text)] placeholder:text-[var(--hub-faint)] focus:outline-none focus:border-brand/50 focus:bg-[var(--hub-hover)] transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--hub-chip)] rounded text-[var(--hub-faint)] border border-[var(--hub-border)]">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--hub-chip)] rounded text-[var(--hub-faint)] border border-[var(--hub-border)]">K</kbd>
          </div>
        </div>

        <button
          className="relative p-2 rounded-xl text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-hover)] transition-colors cursor-pointer"
          title="Notificaciones"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full ring-2 ring-[var(--hub-bg)]" />
        </button>

        {/* Dropdown de perfil */}
        <div className="relative z-[100]">
          <button
            onClick={toggleProfile}
            aria-label={identityResolved ? displayName : 'Cargando perfil'}
            className="flex items-center gap-2 lg:gap-3 p-1.5 cursor-pointer rounded-xl hover:bg-[var(--hub-chip)] transition-colors text-left border border-transparent focus:outline-none"
          >
            {identityResolved && avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-[var(--hub-border)] object-cover" />
            ) : identityResolved ? (
              <span className="relative inline-flex w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] text-[var(--hub-dim)] font-bold items-center justify-center text-xs lg:text-sm select-none">
                {initials || <User size={16} className="text-brand" />}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-[var(--hub-bg)]" aria-hidden="true" />
              </span>
            ) : (
              <span className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] animate-pulse" aria-hidden="true" />
            )}

            <div className="hidden lg:flex flex-col justify-center">
              {identityResolved ? (
                <>
                  <span className="text-[var(--hub-text)] text-[13px] font-bold leading-none">{displayName}</span>
                  <span className="text-[10px] text-[var(--hub-dim)] leading-none mt-1.5">
                    {roleLabel || email}
                  </span>
                </>
              ) : (
                <>
                  <span className="h-3 w-20 rounded bg-[var(--hub-chip)] animate-pulse" aria-hidden="true" />
                  <span className="h-2 w-14 rounded bg-[var(--hub-chip)] animate-pulse mt-1" aria-hidden="true" />
                </>
              )}
            </div>
            <ChevronDown
              size={16}
              className={`hidden lg:block text-[var(--hub-dim)] transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-[var(--hub-text)]' : ''}`}
            />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} aria-label="Cerrar perfil" />
              <div className="hub-chrome absolute right-0 top-[calc(100%+8px)] w-72 bg-[var(--hub-surface)] border border-[var(--hub-border)] rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden text-left text-[var(--hub-text)]">
                {/* Encabezado identidad */}
                <div className="p-4 border-b border-[var(--hub-border-soft)] bg-[var(--hub-chip)] flex items-center gap-3.5">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-11 h-11 rounded-full border border-[var(--hub-border)] object-cover shrink-0" />
                  ) : (
                    <span className="relative inline-flex w-11 h-11 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] text-[var(--hub-dim)] font-bold items-center justify-center text-sm select-none shrink-0">
                      {initials || <User size={18} className="text-brand" />}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-[var(--hub-surface)]" aria-hidden="true" />
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[var(--hub-text)] truncate">{displayName}</p>
                    <p className="text-[11px] text-[var(--hub-dim)] truncate mt-0.5">{roleLabel || 'Miembro del equipo'}</p>
                    <p className="text-[11px] text-[var(--hub-faint)] truncate">{email || 'admin@qawaylab.pe'}</p>
                  </div>
                </div>

                {/* Menú de navegación (Regla 1-ResumenPanel.js:147-155 + HubPanelPage.jsx:2940-2945) */}
                <div className="p-2 space-y-0.5">
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/hub/inventario/config') }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-hover)] rounded-lg transition-colors font-semibold cursor-pointer"
                  >
                    <User size={14} className="text-[var(--hub-dim)] shrink-0" /> Mi cuenta
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/hub/inventario/organizacion/usuarios') }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-hover)] rounded-lg transition-colors font-semibold cursor-pointer"
                  >
                    <Users size={14} className="text-[var(--hub-dim)] shrink-0" /> Usuarios y permisos
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/hub/inventario/config') }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-hover)] rounded-lg transition-colors font-semibold cursor-pointer"
                  >
                    <Settings size={14} className="text-[var(--hub-dim)] shrink-0" /> Configuración de la empresa
                  </button>
                  <button
                    onClick={() => window.alert('Sección Seguridad disponible próximamente.')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-[var(--hub-dim)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-hover)] rounded-lg transition-colors font-semibold cursor-pointer"
                  >
                    <Shield size={14} className="text-[var(--hub-faint)] shrink-0" /> Seguridad
                    <span className="ml-auto text-[10px] text-[var(--hub-faint)] bg-[var(--hub-chip)] px-1.5 py-0.5 rounded">Próximamente</span>
                  </button>

                  <div className="h-px bg-[var(--hub-border-soft)] my-1.5" />

                  {/* Selector de Tema (Regla 1-ResumenPanel.js:156-161 + HubPanelPage.jsx:2947-2960) */}
                  <div className="flex items-center justify-between px-3 py-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--hub-dim)]">Tema</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setThemeMode('blanco')}
                        title="Blanco Puro (Inventi Pro)"
                        aria-label="Tema blanco puro"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeMode === 'blanco' ? 'text-[var(--hub-text)] bg-[var(--hub-hover)]' : 'text-[var(--hub-faint)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)]'}`}
                      >
                        <Sun size={14} />
                      </button>
                      <button
                        onClick={() => setThemeMode('grises')}
                        title="Escala de Grises"
                        aria-label="Tema escala de grises"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeMode === 'grises' ? 'text-[var(--hub-text)] bg-[var(--hub-hover)]' : 'text-[var(--hub-faint)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)]'}`}
                      >
                        <Layers size={14} />
                      </button>
                      <button
                        onClick={() => setThemeMode('contraste')}
                        title="Claro-Oscuro (Contraste)"
                        aria-label="Tema contraste"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeMode === 'contraste' ? 'text-[var(--hub-text)] bg-[var(--hub-hover)]' : 'text-[var(--hub-faint)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)]'}`}
                      >
                        <Contrast size={14} />
                      </button>
                      <button
                        onClick={() => setThemeMode('oscuro')}
                        title="Oscuro Total"
                        aria-label="Tema oscuro"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeMode === 'oscuro' ? 'text-[var(--hub-text)] bg-[var(--hub-hover)]' : 'text-[var(--hub-faint)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)]'}`}
                      >
                        <Moon size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-[var(--hub-border-soft)] my-1.5" />

                  {/* Botón de Cerrar Sesión */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-3 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors font-bold cursor-pointer"
                  >
                    <LogOut size={14} className="mr-2.5" /> Cerrar Sesión
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
