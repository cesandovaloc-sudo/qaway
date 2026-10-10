import { useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Inbox,
  AlertCircle,
  GanttChart,
  Milestone,
  Users,
  BookOpen,
  ChevronDown,
} from 'lucide-react'
import { useProjectsDataset } from '@/hooks/useProjects'
import { useProjectPerspective } from '../../context/ProjectPerspectiveContext'

interface NavChild {
  to: string
  label: string
  statusColor: string
}

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number | string
  badgeVariant?: 'neutral' | 'urgent'
  end?: boolean
  children?: NavChild[]
}

interface NavSection {
  title: string
  items: NavItem[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar.tsx — Panel Izquierdo Canónico (Estándar visual 100% App Inventario / CRM)
// Tokens inmutables: text-sm font-medium, px-3 py-2.5 rounded-lg, iconos Lucide size={18}.
// Borde lateral izquierdo en items con desplegables para affordance visual claro.
// ─────────────────────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed: collapsedProp }: { collapsed?: boolean }) {
  const [internalCollapsed] = useState(false)
  const collapsed = collapsedProp ?? internalCollapsed
  const [isProjectsExpanded, setIsProjectsExpanded] = useState(true)

  const { projects, workItems } = useProjectsDataset()
  const { currentPersona, isGestor } = useProjectPerspective()

  const myTaskCount = useMemo(() => {
    if (isGestor) {
      return workItems.filter(
        (i) => i.assignee.name.toLowerCase().includes('carlos') && i.state !== 'done'
      ).length
    }
    return workItems.filter((i) => i.state !== 'done').length
  }, [workItems, isGestor])

  const urgentCount = useMemo(() => {
    return workItems.filter(
      (i) => (i.priority === 'URGENTE' || Boolean(i.isBlocked)) && i.state !== 'done'
    ).length
  }, [workItems])

  const getHref = (to: string) => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    const basePrefix =
      ['/hub/proyectos', '/hub/gestor-proyectos-app', '/hub/inventario', '/inventario'].find(
        (prefix) => pathname.startsWith(prefix)
      ) ?? ''
    if (!basePrefix) return to
    if (to === '/') return basePrefix
    return `${basePrefix}${to.startsWith('/') ? to : `/${to}`}`
  }

  const sections: NavSection[] = [
    {
      title: 'OPERACIÓN',
      items: [
        {
          to: '/',
          label: 'Resumen',
          icon: <LayoutDashboard size={18} />,
          end: true,
        },
        {
          to: '/proyectos/proj-minedu-2027?tab=kanban',
          label: isGestor ? 'Mi Bandeja' : 'Bandeja de Tareas',
          icon: <Inbox size={18} />,
          badge: myTaskCount,
          badgeVariant: 'neutral',
        },
        {
          to: '/proyectos/proj-minedu-2027?tab=kanban',
          label: 'Alertas Críticas',
          icon: <AlertCircle size={18} />,
          badge: urgentCount,
          badgeVariant: 'urgent',
        },
      ],
    },
    {
      title: 'CARTERA',
      items: [
        {
          to: '/proyectos',
          label: 'Proyectos',
          icon: <FolderKanban size={18} />,
          badge: projects.length,
          badgeVariant: 'neutral',
          end: true,
          children: [
            {
              to: '/proyectos/proj-minedu-2027',
              label: 'Dotación MINEDU 2027',
              statusColor: 'bg-emerald-500',
            },
            {
              to: '/proyectos/proj-minedu-2027?tab=gantt',
              label: 'Redistribución OM 050',
              statusColor: 'bg-amber-500',
            },
          ],
        },
      ],
    },
    {
      title: 'PLANIFICACIÓN',
      items: [
        {
          to: '/proyectos/proj-minedu-2027?tab=gantt',
          label: 'Cronograma Maestro',
          icon: <GanttChart size={18} />,
        },
        {
          to: '/proyectos/proj-minedu-2027?tab=hitos',
          label: 'Hitos & Entregables',
          icon: <Milestone size={18} />,
        },
        {
          to: '/proyectos/proj-minedu-2027?tab=kanban',
          label: 'Gestores & Territorio',
          icon: <Users size={18} />,
        },
        {
          to: '/proyectos/proj-minedu-2027?tab=docs',
          label: 'Normativa & Wiki',
          icon: <BookOpen size={18} />,
        },
      ],
    },
  ]

  const location = useLocation()

  // URL actual completa (ruta + query). NavLink solo compara el pathname, por eso
  // todos los items que comparten /proyectos/proj-minedu-2027 se encendían a la
  // vez al cambiar de ?tab=. La coincidencia aquí es exacta e incluye el query.
  const currentUrl = `${location.pathname}${location.search}`

  // Primer href (orden de documento, hijos incluidos) con coincidencia exacta.
  // Desempata URLs idénticas: Mi Bandeja / Alertas Críticas / Gestores &
  // Territorio comparten ?tab=kanban → gana el primero (Mi Bandeja).
  let activeHref: string | null = null
  for (const sec of sections) {
    for (const item of sec.items) {
      const candidates = [item.to, ...(item.children ?? []).map((child) => child.to)]
      for (const to of candidates) {
        if (activeHref === null && getHref(to) === currentUrl) {
          activeHref = getHref(to)
        }
      }
    }
  }
  const isHrefActive = (to: string) => activeHref !== null && getHref(to) === activeHref

  return (
    <aside
      className={`hub-chrome fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[var(--hub-bg)] border-r border-[var(--hub-border)] transition-all duration-300 ${
        collapsed ? 'w-[72px] overflow-visible' : 'w-64 overflow-hidden'
      } [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
    >
      {/* Logo Gestor Pro (Tamaño canónico de App Inventario: 30x30 y 20px) */}
      <div className="flex items-center gap-3 px-4 h-[72px] shrink-0 border-b border-[var(--hub-border)]">
        <div
          className="w-[30px] h-[30px] flex-shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg, var(--hub-brand-hover, #c44523), var(--hub-brand, #d9532f))',
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
                  backgroundColor: 'var(--hub-brand-soft, #fbf0ec)',
                  color: 'var(--hub-brand, #d9532f)',
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

      {/* Nav (Espaciado canónico App Inventario: py-4 px-3) */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-4 px-3 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-0.5">
            {collapsed ? (
              <div className="my-2.5 mx-auto w-7 h-[1px] bg-[var(--hub-border)]" />
            ) : (
              <div className="px-3 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-[var(--hub-dim)] select-none">
                {sec.title}
              </div>
            )}

            {sec.items.map((item) => {
              const hasChildren = Boolean(item.children && item.children.length > 0)

              return (
                <div key={item.to + item.label} className="relative group">
                  <div className="flex items-center">
                    <NavLink
                      to={getHref(item.to)}
                      end={item.end}
                      className={() =>
                        `flex-1 flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                          hasChildren && isProjectsExpanded && !collapsed
                            ? 'border-l-2 border-[var(--hub-brand)] bg-[var(--hub-chip)] text-[var(--hub-text)]'
                            : ''
                        } ${
                          isHrefActive(item.to)
                            ? 'bg-[var(--hub-nav-active-bg,var(--hub-hover))] text-[var(--hub-nav-active-text,var(--hub-text))] [&_svg]:text-[var(--hub-nav-active-icon,var(--color-brand))] font-semibold'
                            : 'text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)]'
                        } ${collapsed ? 'justify-center' : ''}`
                      }
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!collapsed && (
                        <>
                          <span className="truncate">{item.label}</span>
                          {typeof item.badge !== 'undefined' && item.badge > 0 && (
                            <span
                              className={`ml-auto font-mono text-[11px] px-1.5 py-0.2 rounded shrink-0 ${
                                item.badgeVariant === 'urgent'
                                  ? 'bg-zinc-200/80 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 font-bold'
                                  : 'text-[var(--hub-dim)] bg-[var(--hub-chip)]'
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>

                    {/* Botón chevron para desplegar opciones hijas */}
                    {hasChildren && !collapsed && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault()
                          setIsProjectsExpanded((prev) => !prev)
                        }}
                        className="p-2 ml-1 rounded-md text-[var(--hub-dim)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-hover)] transition-colors cursor-pointer"
                        title={isProjectsExpanded ? 'Contraer proyectos' : 'Desplegar proyectos'}
                        aria-label="Desplegar sub-opciones"
                      >
                        <ChevronDown
                          size={14}
                          className={`transition-transform duration-200 ${
                            isProjectsExpanded ? 'rotate-180' : ''
                          }`}
                        />
                      </button>
                    )}
                  </div>

                  {/* Sub-elementos desplegados */}
                  {hasChildren && isProjectsExpanded && !collapsed && item.children && (
                    <div className="ml-5 pl-3 border-l border-[var(--hub-border)] my-1 space-y-0.5">
                      {item.children.map((child) => (
                        <NavLink
                          key={child.to}
                          to={getHref(child.to)}
                          className={() =>
                            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-xs transition-colors truncate ${
                              isHrefActive(child.to)
                                ? 'bg-[var(--hub-hover)] text-[var(--hub-text)] font-semibold'
                                : 'text-[var(--hub-dim)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)] font-medium'
                            }`
                          }
                        >
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${child.statusColor}`} />
                          <span className="truncate">{child.label}</span>
                        </NavLink>
                      ))}
                    </div>
                  )}

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
              )
            })}
          </div>
        ))}
      </nav>

      {/* Settings (Exacto a App Inventario) */}
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
            <span className="flex-shrink-0">
              <Settings size={18} />
            </span>
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
