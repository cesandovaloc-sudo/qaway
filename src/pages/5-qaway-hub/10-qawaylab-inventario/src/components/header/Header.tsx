import { Search, Bell, LogOut, User, Menu } from 'lucide-react'
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

  const email = session?.user?.email ?? ''
  const displayName = profile?.full_name || email.split('@')[0] || 'Usuario'
  const roleLabel = profile ? roleLabels[profile.role] || profile.role : ''

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

        <div className="flex items-center gap-2 lg:gap-3 pl-2 lg:pl-3 border-l border-white/10">
          {/* Círculo de identidad (fila 34 plan v3): w-8 lg:w-9, borde token */}
          <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border border-white/15 bg-white/10 flex items-center justify-center">
            <User size={16} className="text-brand" />
          </div>
          {/* Nombre + rol: 13px bold + 10px, igual que el Hub */}
          <div className="hidden lg:flex flex-col justify-center">
            <span className="text-white text-[13px] font-bold leading-none">{displayName}</span>
            <span className="text-[10px] text-white/40 leading-none mt-1.5">
              {roleLabel || email}
            </span>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 rounded-full text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-colors cursor-pointer"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
