import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  MapPin,
  ArrowLeftRight,
  Tag,
  Tags,
  Gift,
  Zap,
  FileText,
  Users,
  ClipboardList,
  Settings,
  Camera,
  ChevronLeft,
  ChevronRight,
  ShoppingCart,
} from 'lucide-react'
import { useState } from 'react'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  section?: string
  end?: boolean
}

const navItems: NavItem[] = [
  { to: '/', label: 'Inicio', icon: <LayoutDashboard size={18} /> },

  { to: '/logistica', label: 'Productos', icon: <Package size={18} />, section: 'LOGÍSTICA', end: true },
  { to: '/logistica/categorias', label: 'Categorías', icon: <FolderTree size={18} /> },
  { to: '/logistica/ubicaciones', label: 'Ubicaciones', icon: <MapPin size={18} /> },
  { to: '/logistica/movimientos', label: 'Movimientos', icon: <ArrowLeftRight size={18} /> },

  { to: '/clientes', label: 'Clientes', icon: <Users size={18} />, section: 'COMERCIAL' },
  { to: '/precios', label: 'Precios', icon: <Tag size={18} /> },
  { to: '/precios/listas', label: 'Listas', icon: <Tags size={18} /> },
  { to: '/paquetes', label: 'Paquetes', icon: <Gift size={18} /> },
  { to: '/cotizaciones', label: 'Cotizaciones', icon: <ClipboardList size={18} /> },

  { to: '/ventas', label: 'Punto de Venta', icon: <ShoppingCart size={18} />, section: 'VENTAS' },

  { to: '/compras', label: 'Compras', icon: <ShoppingCart size={18} />, section: 'COMPRAS' },
  { to: '/compras/proveedores', label: 'Proveedores', icon: <Users size={18} /> },
  { to: '/compras/ordenes', label: 'Órdenes de Compra', icon: <ClipboardList size={18} /> },

  { to: '/promociones', label: 'Campañas', icon: <Zap size={18} />, section: 'PROMOCIONES', end: true },
  { to: '/promociones/catalogos', label: 'Catálogos', icon: <FileText size={18} /> },

  { to: '/caja', label: 'Caja Chica', icon: <Tag size={18} />, section: 'FINANZAS' },
  { to: '/gastos', label: 'Gastos', icon: <Tag size={18} /> },
  { to: '/contabilidad', label: 'Contabilidad', icon: <Tag size={18} /> },

  { to: '/reportes', label: 'Reportes', icon: <FileText size={18} />, section: 'REPORTES' },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-ink transition-all duration-300 overflow-y-auto ${
        collapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-16 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-brand flex items-center justify-center flex-shrink-0">
          <Package size={18} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display text-white text-sm font-medium tracking-tight">
            Inventario
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        {navItems.map((item) => (
          <div key={item.to}>
            {item.section && !collapsed && (
              <div className="px-3 pt-4 pb-2 text-[10px] font-mono uppercase tracking-[0.15em] text-muted-light/60">
                {item.section}
              </div>
            )}
            <NavLink
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-brand/10 text-brand'
                    : 'text-muted-light hover:text-white hover:bg-white/5'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <span className="flex-shrink-0">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          </div>
        ))}
      </nav>

      {/* Quick actions */}
      {!collapsed && (
        <div className="px-3 pb-3">
          <NavLink
            to="/captura"
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-light transition-colors"
          >
            <Camera size={16} />
            <span>Capturar con IA</span>
          </NavLink>
        </div>
      )}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-12 border-t border-white/10 text-muted-light hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Settings */}
      <NavLink
        to="/config"
        className={({ isActive }) =>
          `flex items-center gap-3 px-3 py-3 border-t border-white/10 text-sm transition-colors ${
            isActive ? 'text-brand' : 'text-muted-light hover:text-white'
          } ${collapsed ? 'justify-center' : ''}`
        }
      >
        <Settings size={18} />
        {!collapsed && <span>Configuración</span>}
      </NavLink>
    </aside>
  )
}
