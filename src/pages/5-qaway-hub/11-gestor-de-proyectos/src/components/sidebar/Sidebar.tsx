import { useState, useMemo } from 'react'
import { NavLink } from 'react-router-dom'
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
  Plus,
} from 'lucide-react'
import { useProjectsDataset } from '@/hooks/useProjects'
import { useProjectPerspective } from '../../context/ProjectPerspectiveContext'

interface NavItem {
  to: string
  label: string
  icon: React.ReactNode
  badge?: number | string
  badgeVariant?: 'neutral' | 'urgent'
  end?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

export default function Sidebar({ collapsed: collapsedProp }: { collapsed?: boolean }) {
  const [internalCollapsed] = useState(false)
  const collapsed = collapsedProp ?? internalCollapsed
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
        (prefix) => pathname.startsWith(prefix),
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
          label: 'Resumen General',
          icon: <LayoutDashboard size={16} />,
          end: true,
        },
        {
          to: '/proyectos/proj-minedu-2027?tab=kanban',
          label: isGestor ? 'Mi Bandeja' : 'Bandeja de Tareas',
          icon: <Inbox size={16} />,
          badge: myTaskCount,
          badgeVariant: 'neutral',
        },
        {
          to: '/proyectos/proj-minedu-2027?tab=kanban',
          label: 'Alertas Críticas',
          icon: <AlertCircle size={16} />,
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
          label: 'Todos los Proyectos',
          icon: <FolderKanban size={16} />,
          badge: projects.length,
          badgeVariant: 'neutral',
          end: true,
        },
      ],
    },
    {
      title: 'PLANIFICACIÓN',
      items: [
        {
          to: '/proyectos/proj-minedu-2027?tab=gantt',
          label: 'Cronograma Maestro',
          icon: <GanttChart size={16} />,
        },
        {
          to: '/proyectos/proj-minedu-2027?tab=hitos',
          label: 'Hitos & Entregables',
          icon: <Milestone size={16} />,
        },
        {
          to: '/proyectos/proj-minedu-2027?tab=kanban',
          label: 'Gestores & Territorio',
          icon: <Users size={16} />,
        },
        {
          to: '/proyectos/proj-minedu-2027?tab=docs',
          label: 'Normativa & Wiki',
          icon: <BookOpen size={16} />,
        },
      ],
    },
  ]

  return (
    <aside
      className={`hub-chrome fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[var(--hub-bg)] border-r border-[var(--hub-border)] transition-all duration-300 ${
        collapsed ? 'w-[72px] overflow-visible' : 'w-64 overflow-hidden'
      } [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
    >
      {/* Cabecera / Logo */}
      <div className="flex items-center gap-3 px-4 h-[72px] shrink-0 border-b border-[var(--hub-border)]">
        <div
          className="w-[28px] h-[28px] flex-shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg, #ff6b35, #ff4b0b)',
            clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
          }}
        >
          <div
            className="absolute inset-[7px]"
            style={{
              background: 'var(--hub-bg)',
              clipPath: 'polygon(50% 0, 100% 25%, 100% 75%, 50% 100%, 0 75%, 0 25%)',
            }}
          />
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="text-[17px] font-bold tracking-tight text-[var(--hub-text)]">
                Gestor
              </span>
              <span className="text-[10px] font-semibold rounded px-1.5 py-0.5 leading-none bg-[#ff4b0b]/10 text-[#ff4b0b]">
                Pro
              </span>
            </div>
            <span className="text-[10.5px] text-[var(--hub-dim)] mt-1 leading-none truncate">
              Suite de Proyectos & Cartera
            </span>
          </div>
        )}
      </div>

      {/* Navegación Principal */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-2.5 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {/* Botón Acción Rápida (Linear style) */}
        {!collapsed && (
          <div className="px-1 pt-1">
            <NavLink
              to={getHref('/proyectos/proj-minedu-2027?tab=kanban')}
              className="w-full h-8 px-2.5 rounded-lg border border-[var(--hub-border)] bg-[var(--hub-chip)] hover:bg-[var(--hub-hover)] text-xs font-medium text-[var(--hub-text)] flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2">
                <Plus size={14} className="text-zinc-400 group-hover:text-[var(--hub-text)] transition-colors" />
                <span>Nueva Tarea</span>
              </div>
              <kbd className="font-mono text-[10px] text-zinc-400 bg-zinc-200/50 dark:bg-zinc-800 px-1.5 py-0.2 rounded border border-[var(--hub-border-soft)]">
                C
              </kbd>
            </NavLink>
          </div>
        )}

        {sections.map((sec) => (
          <div key={sec.title} className="space-y-0.5">
            {collapsed ? (
              <div className="my-2 mx-auto w-6 h-px bg-[var(--hub-border)]" />
            ) : (
              <div className="px-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--hub-dim)] select-none">
                {sec.title}
              </div>
            )}

            {sec.items.map((item) => (
              <div key={item.to + item.label} className="relative group">
                <NavLink
                  to={getHref(item.to)}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                      isActive
                        ? 'bg-[var(--hub-hover)] text-[var(--hub-text)] font-semibold border-l-2 border-[#ff4b0b]'
                        : 'text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)] font-medium'
                    } ${collapsed ? 'justify-center px-0' : ''}`
                  }
                >
                  <span className="shrink-0 text-zinc-400 group-hover:text-[var(--hub-text)] transition-colors">
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span className="truncate">{item.label}</span>
                      {typeof item.badge !== 'undefined' && item.badge > 0 && (
                        <span
                          className={`ml-auto font-mono text-[10px] px-1.5 py-0.2 rounded shrink-0 ${
                            item.badgeVariant === 'urgent'
                              ? 'bg-zinc-200/70 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 font-bold'
                              : 'text-zinc-400 bg-zinc-100 dark:bg-zinc-800'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>

                {/* Tooltip flotante en colapso */}
                {collapsed && (
                  <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-2.5 hidden group-hover:flex items-center z-50">
                    <div className="text-xs font-medium px-2.5 py-1 rounded-md bg-[var(--hub-surface)] text-[var(--hub-text)] border border-[var(--hub-border)] shadow-md whitespace-nowrap">
                      {item.label}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Sub-lista de proyectos activos bajo la sección CARTERA */}
            {sec.title === 'CARTERA' && !collapsed && (
              <div className="pt-1 pl-4 space-y-0.5 border-l border-[var(--hub-border-soft)] ml-3 my-1">
                <NavLink
                  to={getHref('/proyectos/proj-minedu-2027')}
                  className={({ isActive }) =>
                    `flex items-center gap-2 px-2 py-1 rounded-md text-[11px] transition-colors truncate ${
                      isActive
                        ? 'text-[var(--hub-text)] font-semibold bg-[var(--hub-chip)]'
                        : 'text-[var(--hub-dim)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)]'
                    }`
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">Dotación MINEDU 2027</span>
                </NavLink>
                <NavLink
                  to={getHref('/proyectos/proj-minedu-2027?tab=gantt')}
                  className="flex items-center gap-2 px-2 py-1 rounded-md text-[11px] text-[var(--hub-dim)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)] transition-colors truncate"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                  <span className="truncate">Redistribución OM 050</span>
                </NavLink>
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Pie Fijo (Footer) */}
      <div className="p-2.5 border-t border-[var(--hub-border)] space-y-1">
        <NavLink
          to={getHref('/config')}
          className={({ isActive }) =>
            `flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
              isActive
                ? 'bg-[var(--hub-hover)] text-[var(--hub-text)] font-semibold'
                : 'text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)] font-medium'
            } ${collapsed ? 'justify-center' : ''}`
          }
        >
          <span className="shrink-0 text-zinc-400"><Settings size={16} /></span>
          {!collapsed && <span>Configuración</span>}
        </NavLink>

        {!collapsed && (
          <div className="px-2.5 py-1.5 rounded-md bg-[var(--hub-chip)] text-[10.5px] text-[var(--hub-dim)] flex items-center justify-between">
            <span className="truncate">Rol: {currentPersona.tag}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
          </div>
        )}
      </div>
    </aside>
  )
}
