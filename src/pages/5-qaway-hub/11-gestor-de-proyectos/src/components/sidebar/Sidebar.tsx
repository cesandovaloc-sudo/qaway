import { useState, useMemo, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Inbox,
  AlertCircle,
  BarChart3,
  ChevronDown,
  Plus,
  Check,
  Workflow,
} from 'lucide-react'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { useProjectsDataset, useTenantFilteredProjects } from '@/hooks/useProjects'
import { useDismissOnEscapeOrOutside } from '@/hooks/useDismissOnEscapeOrOutside'
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
  subtitle?: string
  items: NavItem[]
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar.tsx — Panel Izquierdo en Cascada (Alternativa A + Opción A)
// 1. Selector superior de PROYECTO ACTIVO con desplegable flotante (no empuja).
// 2. Botón directo "+ Nuevo Proyecto".
// 3. OPERACIÓN & CARTERA sin duplicar la lista de proyectos ni las pestañas superiores.
// 4. Hitos & Fases con 3 filtros semafóricos (Pendientes, En revisión, Aprobados)
//    + acceso directo al Reporteador de Monitoreo Territorial (CdD - SIGA).
// ─────────────────────────────────────────────────────────────────────────────

interface SidebarProps {
  collapsed?: boolean
  width?: number
  onStartResize?: (e: React.MouseEvent) => void
}

export default function Sidebar({
  collapsed: collapsedProp,
  width,
  onStartResize,
}: SidebarProps) {
  const [internalCollapsed] = useState(false)
  const collapsed = collapsedProp ?? internalCollapsed
  const [isActiveSelectorOpen, setIsActiveSelectorOpen] = useState(false)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [rememberedProjectId, setRememberedProjectId] = useState<string>('proj-minedu-2027')

  const selectorRef = useDismissOnEscapeOrOutside(isActiveSelectorOpen, () =>
    setIsActiveSelectorOpen(false),
  )

  const { projects, workItems } = useProjectsDataset()
  const { currentPersona, isGestor } = useProjectPerspective()
  const navigate = useNavigate()

  const myTaskCount = useMemo(() => {
    const openItems = workItems.filter((i) => i.state !== 'done')
    if (!isGestor) return openItems.length
    const me = currentPersona.name.trim().toLowerCase()
    const firstName = me.split(/\s+/)[0] ?? ''
    return openItems.filter((i) => {
      const assignee = i.assignee.name.trim().toLowerCase()
      return assignee === me || (firstName !== '' && (assignee.split(/\s+/)[0] ?? '') === firstName)
    }).length
  }, [workItems, isGestor, currentPersona])

  const urgentCount = useMemo(() => {
    return workItems.filter(
      (i) => (i.priority === 'URGENTE' || Boolean(i.isBlocked)) && i.state !== 'done',
    ).length
  }, [workItems])

  const BASE_PREFIXES = [
    '/gestor_proyectos0',
    '/hub/proyectos',
    '/hub/gestor-proyectos',
    '/hub/gestor-proyectos-app',
    '/hub/inventario',
    '/inventario',
  ]
  const detectBase = (pathname: string) =>
    BASE_PREFIXES.find((prefix) => pathname.startsWith(prefix)) ?? ''

  const getHref = (to: string) => {
    return to.startsWith('/') ? to : `/${to}`
  }

  const location = useLocation()
  const searchParams = new URLSearchParams(location.search)
  // Proyecto activo por URL (/proyectos/:id) o último proyecto seleccionado en cascada
  const modulePath = location.pathname.slice(detectBase(location.pathname).length) || '/'
  const projectIdMatch = modulePath.match(/^\/proyectos\/([^/]+)/)
  const activeProjectId = projectIdMatch ? projectIdMatch[1] : null

  useEffect(() => {
    if (activeProjectId) {
      setRememberedProjectId(activeProjectId)
    }
  }, [activeProjectId])

  const scopedProjects = useTenantFilteredProjects()

  const planningProjectId = useMemo(() => {
    if (activeProjectId && scopedProjects.some((p) => p.id === activeProjectId)) {
      return activeProjectId
    }
    if (scopedProjects.some((p) => p.id === rememberedProjectId)) return rememberedProjectId
    return scopedProjects[0]?.id ?? 'proj-minedu-2027'
  }, [activeProjectId, rememberedProjectId, scopedProjects])

  const activeProjectObj = useMemo(
    () =>
      scopedProjects.find((p) => p.id === planningProjectId) ??
      scopedProjects[0] ??
      projects.find((p) => p.id === planningProjectId) ??
      projects[0],
    [projects, planningProjectId, scopedProjects],
  )

  const sections: NavSection[] = [
    {
      title: 'OPERACIÓN Y RESUMEN',
      items: [
        {
          to: '/gestor_proyectos0/resumen',
          label: 'Resumen General',
          icon: <LayoutDashboard size={18} />,
          end: true,
        },
        {
          to: activeProjectObj ? `/gestor_proyectos0/proyectos/${activeProjectObj.id}` : '/gestor_proyectos0/proyectos',
          label: 'Espacio de Trabajo (Gantt/Kanban)',
          icon: <FolderKanban size={18} />,
        },
        {
          to: '/gestor_proyectos0/reporteador',
          label: 'Reporteador Territorial (Hito 1.6 / 1.7)',
          icon: <BarChart3 size={18} />,
          badge: 'ACTIVO',
          badgeVariant: 'urgent',
        },
        {
          to: '/gestor_proyectos0/resumen-regional',
          label: 'Resumen Regional (HubPro)',
          icon: <LayoutDashboard size={18} />,
          badge: 'MODELO',
          badgeVariant: 'neutral',
        },
      ],
    },
    {
      title: 'PLANIFICACIÓN Y CONTROL',
      items: [
        {
          to: '/gestor_proyectos0/proyectos',
          label: 'Directorio de Proyectos',
          icon: <FolderKanban size={18} />,
          badge: scopedProjects.length,
          badgeVariant: 'neutral',
          end: true,
        },
        {
          to: '/gestor_proyectos0/bandeja',
          label: isGestor ? 'Mi Bandeja' : 'Bandeja de Tareas',
          icon: <Inbox size={18} />,
          badge: myTaskCount,
          badgeVariant: 'neutral',
        },
        {
          to: '/gestor_proyectos0/proyectos?view=criticas',
          label: 'Alertas Críticas',
          icon: <AlertCircle size={18} />,
          badge: urgentCount,
          badgeVariant: 'urgent',
        },
        {
          to: '/gestor_proyectos0/cascada',
          label: 'Cascada Fractal (WBS)',
          icon: <Workflow size={18} />,
          badge: 'WBS',
        },
        {
          to: '/gestor_proyectos0/monitoreo-territorial',
          label: 'Monitoreo Territorial (v1 Base)',
          icon: <BarChart3 size={18} />,
          badge: 'v1',
        },
      ],
    },
  ]

  const currentUrl = `${location.pathname}${location.search}`
  const isHrefActive = (to: string) => {
    const current = location.pathname.replace(/\/+$/, '') || '/'
    const target = to.replace(/\/+$/, '') || '/'
    if (target === current) return true
    if (target === '/gestor_proyectos0/resumen' && (current === '/' || current === '/resumen' || current === '/gestor_proyectos0')) {
      return true
    }
    if (target.startsWith('/gestor_proyectos0/proyectos/') && current.startsWith('/gestor_proyectos0/proyectos/')) {
      return true
    }
    return false
  }

  const handleSelectProjectInCascade = (projectId: string) => {
    setRememberedProjectId(projectId)
    setIsActiveSelectorOpen(false)
    const barePath = location.pathname.slice(detectBase(location.pathname).length) || '/'
    if (barePath.startsWith('/proyectos/')) {
      const currentTab = searchParams.get('tab')
      const target = currentTab
        ? `/proyectos/${projectId}?tab=${currentTab}`
        : `/proyectos/${projectId}`
      navigate(getHref(target))
    }
  }

  return (
    <aside
      style={{ width: width ? `${width}px` : undefined }}
      className={`hub-chrome fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[var(--hub-bg)] border-r border-[var(--hub-border)] transition-[width] duration-150 ${
        collapsed ? 'w-[72px] overflow-visible' : width ? 'overflow-hidden' : 'w-64 overflow-hidden'
      } [scrollbar-width:none] [&::-webkit-scrollbar]:hidden group/sidebar`}
    >
      {/* Resizer handle (Manillar arrastrable) */}
      {!collapsed && onStartResize && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Arrastrar para redimensionar barra lateral"
          onMouseDown={onStartResize}
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize z-50 hover:bg-[var(--hub-brand,#d9532f)]/60 transition-colors group-hover/sidebar:opacity-100 opacity-0 active:bg-[var(--hub-brand,#d9532f)]"
          title="Arrastra para ajustar el ancho del panel izquierdo"
        />
      )}
      {/* Logo Gestor Pro (Tamaño canónico de App Inventario: 30x30 y 20px) — Todo el logo actúa como inicio */}
      <div className="flex items-center px-4 h-[72px] shrink-0 border-b border-[var(--hub-border)]">
        <Link
          to={getHref('/')}
          aria-label="Ir al inicio (Resumen General de Cartera)"
          title="Ir al inicio (Resumen General de Cartera)"
          className="flex items-center gap-3 w-full rounded-md outline-none transition-transform hover:opacity-90 focus-visible:ring-2 focus-visible:ring-brand/40 group cursor-pointer"
        >
          <div
            className="w-[30px] h-[30px] flex-shrink-0 relative transition-transform group-hover:scale-105"
            style={{
              background:
                'linear-gradient(135deg, var(--hub-brand-hover, #c44523), var(--hub-brand, #d9532f))',
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
                <span className="text-[20px] font-bold tracking-[-0.7px] text-[var(--hub-text)] group-hover:text-[var(--hub-brand)] transition-colors">
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
        </Link>
      </div>

      {/* PROYECTO ACTIVO (Sobrio, neutro, fiel al estándar Qaway Hub) */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-2.5 border-b border-[var(--hub-border)] space-y-1.5 shrink-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--hub-dim)]">
              PROYECTO ACTIVO
            </span>
            {activeProjectObj && (
              <span className="text-[11.5px] font-bold tabular-nums text-[var(--hub-text)]">
                {activeProjectObj.progress}%
              </span>
            )}
          </div>

          {/* Selector desplegable FLOTANTE del Proyecto en Función */}
          <div ref={selectorRef} className="relative">
            <button
              type="button"
              onClick={() => setIsActiveSelectorOpen((prev) => !prev)}
              aria-expanded={isActiveSelectorOpen}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface,#ffffff)] hover:bg-[var(--hub-chip)] text-left transition-colors cursor-pointer shadow-2xs"
              title={activeProjectObj?.name ?? 'Seleccionar proyecto'}
            >
              <div className="flex items-start gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                    activeProjectObj?.health === 'optimo'
                      ? 'bg-emerald-500'
                      : activeProjectObj?.health === 'atencion'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-[var(--hub-text)] line-clamp-2 leading-snug">
                    {activeProjectObj?.name ?? 'Seleccionar proyecto'}
                  </div>
                </div>
              </div>
              <ChevronDown
                size={14}
                className={`shrink-0 text-[var(--hub-dim)] transition-transform duration-200 ${
                  isActiveSelectorOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isActiveSelectorOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface,#ffffff)] p-1.5 shadow-xl space-y-0.5 max-h-64 overflow-y-auto z-50">
                {scopedProjects.map((proj) => {
                  const isSelected = proj.id === activeProjectObj?.id
                  return (
                    <button
                      key={proj.id}
                      type="button"
                      onClick={() => handleSelectProjectInCascade(proj.id)}
                      className={`w-full flex items-start gap-2 px-2.5 py-2 rounded-lg text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[var(--hub-chip)] text-[var(--hub-text)] font-semibold'
                          : 'text-[var(--hub-text-soft)] hover:bg-[var(--hub-chip)] hover:text-[var(--hub-text)]'
                      }`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                          proj.health === 'optimo'
                            ? 'bg-emerald-500'
                            : proj.health === 'atencion'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-[13px] font-medium leading-snug line-clamp-2">
                          {proj.name}
                        </div>
                        <div className="text-[11px] text-[var(--hub-dim)] tabular-nums mt-0.5">
                          {proj.progress}% de avance
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={14} className="shrink-0 text-[var(--hub-text)] mt-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Nav (Espaciado canónico App Inventario: py-3 px-3) */}
      <nav className="flex-1 min-h-0 overflow-y-auto py-3 px-3 space-y-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {sections.map((sec) => (
          <div key={sec.title} className="space-y-0.5">
            {collapsed ? (
              <div className="my-2.5 mx-auto w-7 h-[1px] bg-[var(--hub-border)]" />
            ) : (
              <div className="px-3 pt-1 pb-1 flex items-center justify-between gap-2 select-none">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--hub-dim)]">
                  {sec.title}
                </span>
              </div>
            )}

            {sec.items.map((item) => (
              <div key={item.to + item.label} className="relative group">
                <NavLink
                  to={getHref(item.to)}
                  end={item.end}
                  className={() =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
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
                      {item.badge !== undefined &&
                        (typeof item.badge === 'number' ? item.badge > 0 : Boolean(item.badge)) && (
                          <span
                            className={`ml-auto tabular-nums text-[11.5px] px-1.5 py-0.2 rounded shrink-0 ${
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

      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreated={(created) => {
          setRememberedProjectId(created.id)
          navigate(getHref(`/proyectos/${created.id}`))
        }}
      />
    </aside>
  )
}

