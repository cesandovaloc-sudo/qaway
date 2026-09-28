import { useState, useEffect } from 'react'
import { Search, Bell, LogOut, User, Menu, Shield, ChevronDown, Warehouse, Users, Settings, Sun, Moon, Contrast } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const roleLabels: Record<string, string> = {
  admin: 'Super Administrador',
  editor: 'Administrador de empresa',
  viewer: 'Miembro del equipo',
  guest: 'Invitado',
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
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isWarehouseOpen, setIsWarehouseOpen] = useState(false)
  const [selectedWarehouse, setSelectedWarehouse] = useState<{ id: string; name: string; code: string } | null>(null)
  const [themeMode, setThemeMode] = useState<'claro' | 'contraste' | 'oscuro'>(() => {
    return (localStorage.getItem('qaway.hubTheme') as 'claro' | 'contraste' | 'oscuro') || 'contraste'
  })

  // Sincronización del tema con document.documentElement y localStorage (HubPanelPage.jsx:2144-2148)
  useEffect(() => {
    localStorage.setItem('qaway.hubTheme', themeMode)
    document.documentElement.style.colorScheme = themeMode === 'claro' ? 'light' : 'dark'
    if (themeMode === 'claro') {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'light')
    } else if (themeMode === 'oscuro') {
      document.documentElement.classList.add('dark')
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      document.documentElement.setAttribute('data-theme', 'contraste')
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

        <button
          type="button"
          onClick={() => navigate('/hub')}
          className="group hidden sm:flex items-center gap-2 h-10 px-3 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] hover:border-white/20 text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] transition-all cursor-pointer"
          title="Ecosistema de Aplicaciones"
        >
          <span className="grid grid-cols-3 gap-[3px] w-4 h-4 place-items-center">
            {[...Array(9)].map((_, i) => (
              <span key={i} className="w-[3px] h-[3px] rounded-full bg-[var(--hub-text-soft)] group-hover:bg-brand transition-colors" />
            ))}
          </span>
          <span className="text-sm font-bold text-[var(--hub-text)] max-w-0 overflow-hidden group-hover:max-w-16 transition-all duration-300 whitespace-nowrap">Apps</span>
        </button>

        {/* Selector moderno de Almacén (reutilizado de HubPanelPage.jsx:2600-2660) */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsWarehouseOpen((o) => !o)}
            className="hidden md:flex items-center gap-2 h-10 px-3.5 rounded-full border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] text-[var(--hub-text)] text-sm font-bold focus:outline-none focus:ring-2 focus:ring-brand/40 cursor-pointer transition-all"
            title="Seleccionar almacén (ver como)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="max-w-40 truncate">{selectedWarehouse ? selectedWarehouse.name : 'Todos los almacenes'}</span>
            <ChevronDown size={14} className={`w-3.5 h-3.5 text-[var(--hub-dim)] transition-transform duration-200 ${isWarehouseOpen ? 'rotate-180 text-[var(--hub-text)]' : ''}`} />
          </button>
          {isWarehouseOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsWarehouseOpen(false)} aria-label="Cerrar selector" />
              <div className="hub-chrome absolute left-0 top-[calc(100%+8px)] w-72 rounded-2xl bg-[var(--hub-surface)] border border-[var(--hub-border)] shadow-[0_20px_60px_rgba(0,0,0,0.6)] z-[100] overflow-hidden text-left text-[var(--hub-text)]">
                <div className="p-4 border-b border-[var(--hub-border-soft)] bg-[var(--hub-chip)]">
                  <p className="text-xs font-extrabold text-[var(--hub-text)]">Cambiar de almacén</p>
                  <p className="text-[10px] text-[var(--hub-dim)] mt-0.5">Filtra el inventario y operaciones por sede o almacén.</p>
                </div>
                <div className="p-2 max-h-64 overflow-y-auto space-y-0.5">
                  {warehousesList.map((w) => (
                    <button
                      key={w.id}
                      type="button"
                      onClick={() => {
                        setSelectedWarehouse(w)
                        setIsWarehouseOpen(false)
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-left text-xs font-bold transition-colors cursor-pointer ${selectedWarehouse?.id === w.id ? 'bg-brand/15 text-brand font-bold' : 'text-[var(--hub-text-soft)] hover:bg-[var(--hub-hover)] hover:text-[var(--hub-text)]'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedWarehouse?.id === w.id ? 'bg-brand' : 'bg-white/20'}`} />
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
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold transition-colors ${selectedWarehouse ? 'text-red-400 hover:bg-red-400/10 cursor-pointer' : 'text-[var(--hub-faint)] cursor-default'}`}
                  >
                    <Warehouse size={14} className="w-3.5 h-3.5" />
                    Todos los almacenes (Vista global)
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lado derecho: buscador con Ctrl K + campana + perfil Supabase */}
      <div className="flex items-center gap-3 lg:gap-5 ml-auto">
        <div className="relative hidden sm:block w-[220px] md:w-[280px] lg:w-[360px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--hub-dim)]" />
          <input
            type="text"
            placeholder="Buscar productos, SKU, categorías..."
            className="w-full bg-[var(--hub-chip)] border border-[var(--hub-border)] rounded-full pl-10 pr-16 py-2 text-sm text-[var(--hub-text)] placeholder:text-[var(--hub-faint)] focus:outline-none focus:border-brand/50 focus:bg-[var(--hub-hover)] transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--hub-chip)] rounded text-[var(--hub-faint)] border border-[var(--hub-border)]">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-[var(--hub-chip)] rounded text-[var(--hub-faint)] border border-[var(--hub-border)]">K</kbd>
          </div>
        </div>

        <button
          className="relative p-2 rounded-full text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-hover)] transition-colors cursor-pointer"
          title="Notificaciones"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full ring-2 ring-[var(--hub-bg)]" />
        </button>

        {/* Dropdown de perfil */}
        <div className="relative z-[100]">
          <button
            onClick={() => setIsProfileOpen((o) => !o)}
            aria-label={identityResolved ? displayName : 'Cargando perfil'}
            className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-3 pr-1 cursor-pointer rounded-full hover:bg-[var(--hub-chip)] transition-colors text-left border border-transparent focus:outline-none"
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

                {/* Selector contextual de Almacén (Regla 1-ResumenPanel.js:139-146 + Hub cápsula) */}
                <div className="p-2 border-b border-[var(--hub-border-soft)] bg-[var(--hub-chip)]/40">
                  <div className="px-2 py-1 text-[11px] font-semibold text-[var(--hub-dim)] uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Warehouse size={13} className="text-brand" /> Almacén actual</span>
                    <span className="text-[10px] text-[var(--hub-faint)]">{selectedWarehouse ? selectedWarehouse.code : 'GLOBAL'}</span>
                  </div>
                  <div className="mt-1 space-y-0.5 max-h-40 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => setSelectedWarehouse(null)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${!selectedWarehouse ? 'bg-brand/15 text-brand font-bold' : 'text-[var(--hub-text-soft)] hover:bg-[var(--hub-hover)] hover:text-[var(--hub-text)]'}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${!selectedWarehouse ? 'bg-brand' : 'bg-[var(--hub-border)]'}`} />
                      <span>Todos los almacenes</span>
                    </button>
                    {warehousesList.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => setSelectedWarehouse(w)}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs font-semibold transition-colors cursor-pointer ${selectedWarehouse?.id === w.id ? 'bg-brand/15 text-brand font-bold' : 'text-[var(--hub-text-soft)] hover:bg-[var(--hub-hover)] hover:text-[var(--hub-text)]'}`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${selectedWarehouse?.id === w.id ? 'bg-brand' : 'bg-[var(--hub-border)]'}`} />
                          <span className="truncate">{w.name}</span>
                        </div>
                        <span className="text-[10px] text-[var(--hub-dim)] ml-2 font-mono shrink-0">{w.code}</span>
                      </button>
                    ))}
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
                        onClick={() => setThemeMode('claro')}
                        title="Claro"
                        aria-label="Tema claro"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeMode === 'claro' ? 'text-[var(--hub-text)] bg-[var(--hub-hover)]' : 'text-[var(--hub-faint)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)]'}`}
                      >
                        <Sun size={14} />
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
                        title="Oscuro"
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
