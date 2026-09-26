import { useState } from 'react'
import { Search, Bell, LogOut, User, Menu, Shield, ChevronDown } from 'lucide-react'
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
  // Fila 36 plan v3: dropdown de perfil idéntico en estructura al Hub
  // (encabezado con identidad + Mi cuenta + Seguridad + Cerrar Sesión)
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const email = session?.user?.email ?? ''
  const displayName = profile?.full_name || email.split('@')[0] || 'Usuario'
  const roleLabel = profile ? roleLabels[profile.role] || profile.role : ''
  // Iniciales: 2 palabras, igual que el Hub (nameWords)
  const initials = (displayName || '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()

  const handleLogout = async () => {
    try {
      await signOut()
    } catch {
      // Ignorar errores de logout: la sesión local se limpia igualmente
    }
    navigate('/login', { replace: true })
  }

  return (
    <header className="h-[72px] bg-ink border-b border-white/10 flex items-center justify-between px-5 lg:px-6 relative z-50">
      {/* Lado izquierdo: hamburguesa (colapso) + buscador, como el Hub */}
      <div className="flex items-center gap-2 lg:gap-3 flex-1 min-w-0">
        <button
          onClick={onToggleSidebar}
          aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
          title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          className="p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
        >
          <Menu size={20} className={collapsed ? '' : 'rotate-180'} />
        </button>

        <div className="relative flex-1 max-w-md lg:max-w-[420px] min-w-0">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Buscar productos, SKU, categorías..."
            className="w-full bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-2.5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-brand/50 focus:bg-white/10 transition-colors"
          />
        </div>
      </div>

      {/* Lado derecho: campana + perfil (alineación Hub) */}
      <div className="flex items-center gap-2 lg:gap-3 ml-4">
        <button
          className="relative p-2 rounded-full text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          title="Notificaciones"
        >
          <Bell size={18} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-brand rounded-full ring-2 ring-ink" />
        </button>

        {/* Dropdown de perfil (fila 34/36): botón circular + nombre/rol + chevron */}
        <div className="relative z-[100]">
          <button
            onClick={() => setIsProfileOpen((o) => !o)}
            aria-label={displayName}
            className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-3 pr-1 cursor-pointer rounded-full hover:bg-white/10 transition-colors text-left border border-transparent focus:outline-none"
          >
            {/* Círculo de identidad (fila 34): iniciales 2 palabras + punto naranja */}
            <span className="relative inline-flex w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-white/15 bg-white/10 text-white/70 font-bold items-center justify-center text-xs lg:text-sm select-none">
              {initials || <User size={16} className="text-brand" />}
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-brand ring-2 ring-ink" aria-hidden="true" />
            </span>
            {/* Nombre + rol: 13px bold + 10px, igual que el Hub */}
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
              <div className="absolute right-0 top-[calc(100%+8px)] w-72 bg-ink-2 border border-white/10 rounded-2xl shadow-2xl z-[100] overflow-hidden">
                <div className="p-5 border-b border-white/10 bg-white/5 flex items-center gap-4">
                  <span className="inline-flex w-12 h-12 rounded-full border border-white/15 bg-white/10 text-white/70 font-bold items-center justify-center text-sm select-none shrink-0">
                    {initials || '?'}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{displayName}</p>
                    <p className="text-xs text-white/40 truncate mt-0.5">{email || 'Sesión activa'}</p>
                  </div>
                </div>
                <div className="p-2 border-t border-white/10 space-y-0.5">
                  <button
                    onClick={() => { setIsProfileOpen(false); navigate('/config') }}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-semibold cursor-pointer"
                  >
                    <User size={15} className="text-white/50 shrink-0" /> Mi cuenta
                  </button>
                  <button
                    onClick={() => window.alert('Sección Seguridad disponible próximamente.')}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors font-semibold cursor-pointer"
                  >
                    <Shield size={15} className="text-white/40 shrink-0" /> Seguridad
                    <span className="ml-auto text-[10px] text-white/30">Próximamente</span>
                  </button>
                  <div className="h-px bg-white/10 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors font-bold cursor-pointer"
                  >
                    <LogOut size={15} className="mr-3" /> Cerrar Sesión
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
