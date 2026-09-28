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
  Globe,
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
  { to: '/', label: 'Resumen', icon: <LayoutDashboard size={18} /> },

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
  { to: '/ventas/pedidos-web', label: 'Pedidos Web', icon: <Globe size={18} /> },

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

// Uniformización Hub: el colapso se gobierna desde el topbar (AppLayout pasa
// la prop). El estado interno queda como respaldo si se usa sin prop.
export default function Sidebar({ collapsed: collapsedProp }: { collapsed?: boolean }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = collapsedProp ?? internalCollapsed
  const setCollapsed = setInternalCollapsed

  const getHref = (to: string) => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    const basePrefix = pathname.startsWith('/hub/inventario')
      ? '/hub/inventario'
      : pathname.startsWith('/inventario')
      ? '/inventario'
      : ''
    if (!basePrefix) return to
    if (to === '/') return basePrefix
    return `${basePrefix}${to.startsWith('/') ? to : `/${to}`}`
  }

  return (
    <aside
      className={`hub-chrome fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[var(--hub-bg)] border-r border-[var(--hub-border)] transition-all duration-300 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${
        collapsed ? 'w-[72px]' : 'w-64'
      }`}
    >
      {/* Logo Inventi Pro */}
      <div className="flex items-center gap-3 px-4 h-[72px] shrink-0 border-b border-[var(--hub-border)]">
        <div
          className="w-[30px] h-[30px] flex-shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg, #38a5ff, #1853d9)',
            clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
          }}
        >
          <div
            className="absolute inset-[8px]"
            style={{
              background: 'var(--hub-bg)',
              clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
            }}
          />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[20px] font-bold tracking-[-0.7px] text-[var(--hub-text)]">
                Inventi
              </span>
              <span
                className="text-[11px] font-semibold rounded-[6px] px-[7px] py-[3px] leading-none"
                style={{
                  backgroundColor: '#eaf2ff',
                  color: '#1261e9',
                }}
              >
                Pro
              </span>
            </div>
            <span className="text-[11px] text-[var(--hub-dim)] mt-[3px] leading-none whitespace-nowrap">
              Inventario &amp; ERP Comercial
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3">
        {navItems.map((item) => (
          <div key={item.to}>
            {item.section && !collapsed && (
              <div className="px-3 pt-4 pb-2 text-[10px] font-mono uppercase tracking-[0.15em] text-[var(--hub-dim)]">
                {item.section}
              </div>
            )}
            <NavLink
              to={getHref(item.to)}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--hub-nav-active-bg,var(--hub-hover))] text-[var(--hub-nav-active-text,var(--hub-text))] [&_svg]:text-[var(--hub-nav-active-icon,var(--color-brand))] font-semibold'
                    : 'text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)]'
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
            to={getHref('/captura')}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-lg bg-brand text-white text-sm font-medium hover:bg-brand-hover transition-colors"
          >
            <Camera size={16} />
            <span>Capturar con IA</span>
          </NavLink>
        </div>
      )}

      {/* Collapse toggle (respaldo; el primario vive en el topbar, como el Hub) */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
        className="flex items-center justify-center h-12 border-t border-white/10 text-muted-light hover:text-white transition-colors"
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>

      {/* Settings */}
      <NavLink
        to={getHref('/config')}
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
