import { useState } from 'react'
import { Search, Bell, LogOut, User, Menu, Shield, ChevronDown, Warehouse, Users, Settings, Sun, Moon, Contrast } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const roleLabels: Record<string, string> = {
  admin: 'Super Administrador',
  editor: 'Administrador de empresa',
  viewer: 'Miembro del equipo',
  guest: 'Invitado',
}

/**
 * Etapa 1 — Uniformización con el panel principal (Hub, HubPanelPage.jsx:2574):
 * - Alto del topbar: h-[72px] (antes h-16).
 * - Cromo oscuro bg-ink con texto blanco (el Hub usa #111111 + tokens).
 * - Hamburguesa de colapso a la izquierda (antes vivía abajo del sidebar).
 * - Buscador redondo (rounded-full) con ancho responsivo 240/320/420px.
 * - Campana redonda p-2 con badge puntito marca + ring oscuro.
 * - Círculo de perfil w-8 lg:w-9 con nombre + rol a la derecha (13px/10px).
 * Las cápsulas de acción: h-10 text-sm (fila 2 del plan).
 */
export default function Header({
  collapsed,
  onToggleSidebar,
}: {
  collapsed: boolean
  onToggleSidebar: () => void
}) {
  const { session, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [warehouse, setWarehouse] = useState('Todos los almacenes')
  const [themeMode, setThemeMode] = useState<'claro' | 'contraste' | 'oscuro'>('contraste')

  const email = session?.user?.email ?? ''
  const userMetadataName = session?.user?.user_metadata?.full_name || session?.user?.user_metadata?.name || ''
  const fullNameRaw = profile?.full_name || userMetadataName || email.split('@')[0] || 'Usuario'

  // Formato oficial del Hub: "Carlos Sandoval" -> "Carlos S."
  const shortName = (str: string) => {
    if (!str || !str.trim()) return 'Usuario'
    let clean = str.trim()
    // Si viene un correo (ej: s.admin@qawaylab.com), extraer la parte del usuario
    if (clean.includes('@')) {
      clean = clean.split('@')[0].replace(/[._-]/g, ' ')
    }
    const parts = clean.split(/\s+/).filter(Boolean)
    if (parts.length === 0) return 'Usuario'
    if (parts.length === 1) {
      const single = parts[0]
      return single.charAt(0).toUpperCase() + single.slice(1)
    }
    const firstName = parts[0].charAt(0).toUpperCase() + parts[0].slice(1)
    const lastNameInit = parts[1].charAt(0).toUpperCase()
    return `${firstName} ${lastNameInit}.`
  }

  const displayName = shortName(fullNameRaw)
  const avatarUrl = profile?.avatar_url || session?.user?.user_metadata?.avatar_url || null
  const roleLabel = profile ? roleLabels[profile.role] || profile.role : ''
  const initials = (fullNameRaw || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch {
      // Ignorar errores de logout
    }
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-[72px] shrink-0 bg-ink border-b border-white/10 flex items-center justify-between px-5 lg:px-6 relative z-50">
      {/* Lado izquierdo: hamburguesa + Apps + Marca activa */}
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <button
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Menu size={20} className={collapsed ? '' : 'rotate-180'} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/hub')}
          className="group hidden sm:flex items-center gap-2 h-10 px-3 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white/70 hover:text-white transition-all cursor-pointer"
          title="Ecosistema de Aplicaciones"
        >
          <span className="grid grid-cols-3 gap-[3px] w-4 h-4 place-items-center">
            {[...Array(9)].map((_, i) => (
              <span key={i} className="w-[3px] h-[3px] rounded-full bg-white/60 group-hover:bg-brand transition-colors" />
            ))}
          </span>
          <span className="text-sm font-bold max-w-0 overflow-hidden group-hover:max-w-16 transition-all duration-300 whitespace-nowrap">Apps</span>
        </button>

        <div
          className="hidden md:flex items-center gap-2 h-10 px-3 rounded-full border border-white/10 bg-white/5 text-white text-sm font-bold cursor-default"
          title="Marca activa"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="max-w-40 truncate">Qaway Lab</span>
        </div>
      </div>

      {/* Lado derecho: buscador con Ctrl K + campana + perfil Supabase */}
      <div className="flex items-center gap-3 lg:gap-5 ml-auto">
        <div className="relative hidden sm:block w-[220px] md:w-[280px] lg:w-[360px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Buscar productos, SKU, categorías..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-16 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand/50 focus:bg-white/10 transition-colors"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1 pointer-events-none">
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-white/50 border border-white/10">Ctrl</kbd>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white/10 rounded text-white/50 border border-white/10">K</kbd>
          </div>
        </div>

        <button
          className="relative p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Notificaciones"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full ring-2 ring-ink" />
        </button>

        {/* Dropdown de perfil */}
        <div className="relative z-[100]">
          <button
            onClick={() => setIsProfileOpen((o) => !o)}
            aria-label={displayName}
            className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-3 pr-1 cursor-pointer rounded-full hover:bg-white/10 transition-colors text-left border border-transparent focus:outline-none"
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt={displayName} className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-white/20 object-cover" />
            ) : (
              <span className="relative inline-flex w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-white/15 bg-white/10 text-white/70 font-bold items-center justify-center text-xs lg:text-sm select-none">
                {initials || <User size={16} className="text-brand" />}
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-ink" aria-hidden="true" />
              </span>
            )}

            <div className="hidden lg:flex flex-col justify-center">
              <span className="text-white text-[13px] font-bold leading-none">{displayName}</span>
              <span className="text-[10px] text-white/40 leading-none mt-1.5">
                {roleLabel || email}
              </span>
            </div>
            <ChevronDown
              size={16}
              className={`hidden lg:block text-white/40 transition-transform duration-200 ${isProfileOpen ? 'rotate-180 text-white' : ''}`}
            />
          </button>

          {isProfileOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)} aria-label="Cerrar perfil" />
              <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-ink-2 border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden text-left">
                {/* Encabezado identidad */}
                <div className="p-4 border-b border-white/10 bg-white/5 flex items-center gap-3.5">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt={displayName} className="w-11 h-11 rounded-full border border-white/20 object-cover shrink-0" />
                  ) : (
                    <span className="relative inline-flex w-11 h-11 rounded-full border border-white/15 bg-white/10 text-white/70 font-bold items-center justify-center text-sm select-none shrink-0">
                      {initials || <User size={18} className="text-brand" />}
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-ink" aria-hidden="true" />
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{displayName}</p>
                    <p className="text-[11px] text-white/50 truncate mt-0.5">{roleLabel || 'Miembro del equipo'}</p>
                    <p className="text-[11px] text-white/30 truncate">{email || 'admin@qawaylab.pe'}</p>
                  </div>
                </div>

                {/* Selector contextual de Almacén (Regla 1-ResumenPanel.js:139-146) */}
                <div className="px-3.5 py-2.5 border-b border-white/10 bg-white/[0.02]">
                  <label className="flex items-center gap-2 text-[11px] font-semibold text-white/50 mb-1.5 uppercase tracking-wider">
                    <Warehouse size={13} className="text-brand" /> Almacén actual
                  </label>
                  <select
                    value={warehouse}
                    onChange={(e) => setWarehouse(e.target.value)}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-brand/50 cursor-pointer"
                  >
                    <option value="Todos los almacenes" className="bg-ink text-white">Todos los almacenes</option>
                    <option value="Almacén Principal" className="bg-ink text-white">Almacén Principal</option>
                    <option value="Almacén Surco" className="bg-ink text-white">Almacén Surco</option>
                    <option value="Almacén Secundario" className="bg-ink text-white">Almacén Secundario</option>
                  </select>
                </div>

                {/* Menú de navegación (Regla 1-ResumenPanel.js:147-155 + HubPanelPage.jsx:2940-2945) */}
                <div className="p-2 space-y-0.5">
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/hub/inventario/config') }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-semibold cursor-pointer"
                  >
                    <User size={14} className="text-white/50 shrink-0" /> Mi cuenta
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/hub/inventario/organizacion/usuarios') }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-semibold cursor-pointer"
                  >
                    <Users size={14} className="text-white/50 shrink-0" /> Usuarios y permisos
                  </button>
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/hub/inventario/config') }}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-semibold cursor-pointer"
                  >
                    <Settings size={14} className="text-white/50 shrink-0" /> Configuración de la empresa
                  </button>
                  <button
                    onClick={() => window.alert('Sección Seguridad disponible próximamente.')}
                    className="w-full flex items-center gap-3 px-3 py-2 text-xs text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-semibold cursor-pointer"
                  >
                    <Shield size={14} className="text-white/40 shrink-0" /> Seguridad
                    <span className="ml-auto text-[10px] text-white/30 bg-white/5 px-1.5 py-0.5 rounded">Próximamente</span>
                  </button>

                  <div className="h-px bg-white/10 my-1.5" />

                  {/* Selector de Tema (Regla 1-ResumenPanel.js:156-161 + HubPanelPage.jsx:2947-2960) */}
                  <div className="flex items-center justify-between px-3 py-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-white/40">Tema</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setThemeMode('claro')}
                        title="Claro"
                        aria-label="Tema claro"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeMode === 'claro' ? 'text-white bg-white/20' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                      >
                        <Sun size={14} />
                      </button>
                      <button
                        onClick={() => setThemeMode('contraste')}
                        title="Claro-Oscuro (Contraste)"
                        aria-label="Tema contraste"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeMode === 'contraste' ? 'text-white bg-white/20' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                      >
                        <Contrast size={14} />
                      </button>
                      <button
                        onClick={() => setThemeMode('oscuro')}
                        title="Oscuro"
                        aria-label="Tema oscuro"
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${themeMode === 'oscuro' ? 'text-white bg-white/20' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
                      >
                        <Moon size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="h-px bg-white/10 my-1.5" />

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
