import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ArrowLeftRight,
  Tag,
  Tags,
  Gift,
  Zap,
  FileText,
  Users,
  ClipboardList,
  Settings,
  ShoppingCart,
  Globe,
  Layers,
  Receipt,
  Building2,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useTenant } from '@/context/TenantContext'
import { isInventoryModuleReleased, type InventoryModuleKey } from '@/config/moduleRelease'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  section?: string
  end?: boolean
  moduleKey: InventoryModuleKey
}

const navItems: NavItem[] = [
  { to: '/', label: 'Resumen', icon: <LayoutDashboard size={18} />, end: true, moduleKey: 'dashboard' },

  { to: '/productos', label: 'Productos', icon: <Package size={18} />, section: 'LOGÍSTICA', end: true, moduleKey: 'products' },
  { to: '/logistica/categorias', label: 'Categorías', icon: <FolderTree size={18} />, moduleKey: 'categories' },
  { to: '/logistica/movimientos', label: 'Movimientos', icon: <ArrowLeftRight size={18} />, moduleKey: 'movements' },
  { to: '/sedes', label: 'Sedes', icon: <Building2 size={18} />, moduleKey: 'sedes' },

  { to: '/clientes', label: 'Clientes', icon: <Users size={18} />, section: 'COMERCIAL', moduleKey: 'clientes' },
  { to: '/promociones/catalogos', label: 'Catálogos', icon: <FileText size={18} />, moduleKey: 'catalogos' },
  { to: '/precios', label: 'Precios', icon: <Tag size={18} />, moduleKey: 'precios' },
  { to: '/precios/listas', label: 'Listas', icon: <Tags size={18} />, moduleKey: 'precios' },
  { to: '/precios-panel', label: 'Precios (Diseño)', icon: <Layers size={18} />, moduleKey: 'precios_panel' },
  { to: '/paquetes', label: 'Paquetes', icon: <Gift size={18} />, moduleKey: 'paquetes' },
  { to: '/kits', label: 'Kits', icon: <Layers size={18} />, moduleKey: 'kits' },
  { to: '/cotizaciones', label: 'Cotizaciones', icon: <ClipboardList size={18} />, moduleKey: 'cotizaciones' },

  { to: '/ventas', label: 'Ventas', icon: <Receipt size={18} />, section: 'VENTAS', end: true, moduleKey: 'ventas' },
  { to: '/punto-de-venta', label: 'Punto de Venta', icon: <ShoppingCart size={18} />, moduleKey: 'punto_de_venta' },
  { to: '/ventas/registro', label: 'Registro de Ventas', icon: <FileText size={18} />, moduleKey: 'registro_ventas' },
  { to: '/ventas/pedidos-web', label: 'Pedidos Web', icon: <Globe size={18} />, moduleKey: 'pedidos_web' },
  { to: '/pedidos', label: 'Pedidos', icon: <Package size={18} />, moduleKey: 'pedidos' },

  { to: '/compras', label: 'Compras', icon: <ShoppingCart size={18} />, section: 'COMPRAS', moduleKey: 'compras' },
  { to: '/compras/proveedores', label: 'Proveedores', icon: <Users size={18} />, moduleKey: 'proveedores' },
  { to: '/compras/ordenes', label: 'Órdenes de Compra', icon: <ClipboardList size={18} />, moduleKey: 'ordenes_compra' },
  { to: '/compras-panel', label: 'Compras (Diseño)', icon: <Layers size={18} />, moduleKey: 'compras_panel' },

  { to: '/promociones', label: 'Campañas', icon: <Zap size={18} />, section: 'PROMOCIONES', end: true, moduleKey: 'promociones' },
  { to: '/liquidaciones', label: 'Liquidaciones', icon: <Receipt size={18} />, moduleKey: 'liquidaciones' },

  { to: '/caja', label: 'Caja Chica', icon: <Tag size={18} />, section: 'FINANZAS', moduleKey: 'caja' },
  { to: '/gastos', label: 'Gastos', icon: <Tag size={18} />, moduleKey: 'gastos' },
  { to: '/contabilidad', label: 'Contabilidad', icon: <Tag size={18} />, moduleKey: 'contabilidad' },

  { to: '/reportes', label: 'Reportes', icon: <FileText size={18} />, section: 'REPORTES', moduleKey: 'reportes' },
]

// Uniformización Hub: el colapso se gobierna desde el topbar (AppLayout pasa
// la prop). El estado interno queda como respaldo si se usa sin prop.
export default function Sidebar({ collapsed: collapsedProp }: { collapsed?: boolean }) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const collapsed = collapsedProp ?? internalCollapsed
  const setCollapsed = setInternalCollapsed
  const { profile } = useAuth()
  const { activeTenant } = useTenant()
  const isPlatformAdmin = Boolean(
    profile?.is_platform_admin === true ||
    (profile?.role === 'admin' && !profile?.tenant_id),
  )

  const visibleNavItems = useMemo(() => {
    const released = navItems.filter((item) =>
      isInventoryModuleReleased(item.moduleKey, { isPlatformAdmin, tenant: activeTenant }),
    )
    // Ocultar etiqueta de sección si es el mismo grupo que el item visible anterior.
    let lastSection: string | undefined
    return released.map((item) => {
      const section = item.section && item.section !== lastSection ? item.section : undefined
      if (item.section) lastSection = item.section
      return { ...item, section }
    })
  }, [isPlatformAdmin, activeTenant])

  const showConfig = isInventoryModuleReleased('config', { isPlatformAdmin, tenant: activeTenant })

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
      className={`hub-chrome fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[var(--hub-bg)] border-r border-[var(--hub-border)] transition-all duration-300 ${
        collapsed ? 'w-[72px] overflow-visible' : 'w-64 overflow-hidden'
      } [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
    >
      {/* Logo Inventi Pro */}
      <div className="flex items-center gap-3 px-4 h-[72px] shrink-0 border-b border-[var(--hub-border)]">
        <div
          className="w-[30px] h-[30px] flex-shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg, #ff6b35, #ff4b0b)',
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
                  backgroundColor: '#fff2eb',
                  color: '#ff4b0b',
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
      <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visibleNavItems.map((item) => (
          <div key={item.to} className="relative group">
            {item.section && (
              collapsed ? (
                <div className="my-2.5 mx-auto w-7 h-[1px] bg-[var(--hub-border)]" />
              ) : (
                <div className="px-3 pt-4 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-[var(--hub-dim)]">
                  {item.section}
                </div>
              )
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

            {/* Pop-up flotante al pasar el mouse por el ícono (modo colapsado) */}
            {collapsed && (
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 hidden group-hover:flex items-center z-50">
                <div
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap tracking-tight"
                  style={{
                    backgroundColor: 'var(--hub-surface, #ffffff)',
                    color: 'var(--hub-text, #0f172a)',
                    border: '1px solid var(--hub-border, #e2e8f0)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  {item.label}
                </div>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Settings */}
      {showConfig && (
        <div className="p-3 border-t border-[var(--hub-border)]">
          <div className="relative group">
            <NavLink
              to={getHref('/config')}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--hub-nav-active-bg,var(--hub-hover))] text-[var(--hub-nav-active-text,var(--hub-text))] [&_svg]:text-[var(--hub-nav-active-icon,var(--color-brand))] font-semibold'
                    : 'text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)]'
                } ${collapsed ? 'justify-center' : ''}`
              }
            >
              <span className="flex-shrink-0"><Settings size={18} /></span>
              {!collapsed && <span>Configuración</span>}
            </NavLink>
            {collapsed && (
              <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 hidden group-hover:flex items-center z-50">
                <div
                  className="text-xs font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap tracking-tight"
                  style={{
                    backgroundColor: 'var(--hub-surface, #ffffff)',
                    color: 'var(--hub-text, #0f172a)',
                    border: '1px solid var(--hub-border, #e2e8f0)',
                    boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
                  }}
                >
                  Configuración
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}
