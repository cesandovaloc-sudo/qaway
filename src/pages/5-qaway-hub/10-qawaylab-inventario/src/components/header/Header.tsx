import { Search, Bell, LogOut, User } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

const roleLabels: Record<string, string> = {
  admin: 'Administrador',
  editor: 'Editor',
  viewer: 'Lector',
  guest: 'Invitado',
}

export default function Header() {
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
    <header className="h-16 bg-white border-b border-surface-muted flex items-center justify-between px-6">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            type="text"
            placeholder="Buscar productos, SKU, categorías..."
            className="w-full pl-9 pr-4 py-2 bg-surface rounded-lg text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/30 transition-shadow"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 ml-4">
        <button className="relative p-2 rounded-lg hover:bg-surface transition-colors">
          <Bell size={18} className="text-muted" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand rounded-full" />
        </button>
        <div className="flex items-center gap-2 pl-4 border-l border-surface-muted">
          <div className="w-8 h-8 rounded-full bg-brand/10 flex items-center justify-center">
            <User size={16} className="text-brand" />
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium text-ink">{displayName}</p>
            <p className="text-xs text-muted">{roleLabel ? `${roleLabel} · ${email}` : email}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Cerrar sesión"
            className="p-2 rounded-lg text-muted hover:text-ink hover:bg-surface transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  )
}
