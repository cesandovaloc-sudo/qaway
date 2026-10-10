import { NavLink } from "react-router-dom"
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
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
  { to: '/', label: 'Resumen', icon: <LayoutDashboard size={18} />, end: true },

  { to: '/proyectos', label: 'Proyectos', icon: <FolderKanban size={18} />, section: 'CARTERA' },
]

// Uniformización Hub: el colapso se gobierna desde el topbar (AppLayout pasa
// la prop). El estado interno queda como respaldo si se usa sin prop.
export default function Sidebar({ collapsed: collapsedProp }: { collapsed?: boolean }) {
  const [internalCollapsed] = useState(false)
  const collapsed = collapsedProp ?? internalCollapsed

  const getHref = (to: string) => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    // Bases donde el Hub monta este módulo (ver src/router/AppRouter.jsx host).
    const basePrefix =
      ['/hub/proyectos', '/hub/gestor-proyectos-app', '/hub/inventario', '/inventario'].find(
        (prefix) => pathname.startsWith(prefix),
      ) ?? ''
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
      {/* Logo Gestor de Proyectos */}
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
                Gestor
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
              Proyectos Universales · P6 · Scrum
            </span>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => (
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
    </aside>
  )
}
