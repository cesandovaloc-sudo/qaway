import { useState, useMemo, useEffect } from 'react'
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FolderKanban,
  Settings,
  Inbox,
  AlertCircle,
  Milestone,
  ChevronDown,
  Plus,
  Check,
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
// Sidebar.tsx — Panel Izquierdo en Cascada (Alternativa A)
// 1. Selector superior de PROYECTO ACTIVO con desplegable flotante (no empuja).
// 2. Botón directo "+ Nuevo Proyecto".
// 3. OPERACIÓN & CARTERA sin duplicar la lista de proyectos ni las pestañas superiores.
// 4. Acordeón de SUBPROCESOS propio del proyecto activo (clic en todo el botón).
// ─────────────────────────────────────────────────────────────────────────────

export default function Sidebar({ collapsed: collapsedProp }: { collapsed?: boolean }) {
  const [internalCollapsed] = useState(false)
  const collapsed = collapsedProp ?? internalCollapsed
  const [isSubprocessesExpanded, setIsSubprocessesExpanded] = useState(true)
  const [isActiveSelectorOpen, setIsActiveSelectorOpen] = useState(false)
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false)
  const [rememberedProjectId, setRememberedProjectId] = useState<string>('proj-minedu-2027')

  const selectorRef = useDismissOnEscapeOrOutside(isActiveSelectorOpen, () =>
    setIsActiveSelectorOpen(false),
  )

  const { projects, workItems, milestones } = useProjectsDataset()
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
    '/hub/proyectos',
    '/hub/gestor-proyectos-app',
    '/hub/inventario',
    '/inventario',
  ]
  const detectBase = (pathname: string) =>
    BASE_PREFIXES.find((prefix) => pathname.startsWith(prefix)) ?? ''

  const getHref = (to: string) => {
    const pathname = typeof window !== 'undefined' ? window.location.pathname : ''
    const basePrefix = detectBase(pathname)
    if (!basePrefix) return to
    if (to === '/') return basePrefix
    return `${basePrefix}${to.startsWith('/') ? to : `/${to}`}`
  }

  const location = useLocation()

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

  // Subprocesos / Hitos propios del proyecto activo en cascada
  const activeProjectMilestones = useMemo(
    () =>
      milestones
        .filter((m) => m.projectId === activeProjectObj?.id)
        .sort((a, b) => a.phaseNumber - b.phaseNumber),
    [milestones, activeProjectObj?.id],
  )

  const sections: NavSection[] = [
    {
      title: 'OPERACIÓN & CARTERA',
      items: [
        {
          to: '/',
          label: 'Resumen',
          icon: <LayoutDashboard size={18} />,
          end: true,
        },
        {
          to: '/bandeja',
          label: isGestor ? 'Mi Bandeja' : 'Bandeja de Tareas',
          icon: <Inbox size={18} />,
          badge: myTaskCount,
          badgeVariant: 'neutral',
        },
        {
          to: '/proyectos?view=criticas',
          label: 'Alertas Críticas',
          icon: <AlertCircle size={18} />,
          badge: urgentCount,
          badgeVariant: 'urgent',
        },
        {
          to: '/proyectos',
          label: 'Proyectos',
          icon: <FolderKanban size={18} />,
          badge: scopedProjects.length,
          badgeVariant: 'neutral',
          end: true,
        },
      ],
    },
  ]

  const currentUrl = `${location.pathname}${location.search}`
  const isHrefActive = (to: string) => getHref(to) === currentUrl

  const handleSelectProjectInCascade = (projectId: string) => {
    setRememberedProjectId(projectId)
    setIsActiveSelectorOpen(false)
    const currentTab = new URLSearchParams(location.search).get('tab')
    const target = currentTab
      ? `/proyectos/${projectId}?tab=${currentTab}`
      : `/proyectos/${projectId}`
    navigate(getHref(target))
  }

  return (
    <aside
      className={`hub-chrome fixed left-0 top-0 bottom-0 z-40 flex flex-col bg-[var(--hub-bg)] border-r border-[var(--hub-border)] transition-all duration-300 ${
        collapsed ? 'w-[72px] overflow-visible' : 'w-64 overflow-hidden'
      } [scrollbar-width:none] [&::-webkit-scrollbar]:hidden`}
    >
      {/* Logo Gestor Pro (Tamaño canónico de App Inventario: 30x30 y 20px) */}
      <div className="flex items-center gap-3 px-4 h-[72px] shrink-0 border-b border-[var(--hub-border)]">
        <Link
          to={getHref('/')}
          aria-label="Ir al inicio (Dashboard de Cartera)"
          title="Ir al inicio (Dashboard de Cartera)"
          className="shrink-0 rounded-md outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-brand/40"
        >
          <div
            className="w-[30px] h-[30px] flex-shrink-0 relative"
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
        </Link>
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

      {/* NIVEL 1 EN CASCADA: PROYECTO ACTIVO (Flotante, no empuja el menú) + NUEVO PROYECTO */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-2.5 border-b border-[var(--hub-border)] space-y-2 shrink-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--hub-dim)]">
              PROYECTO ACTIVO
            </span>
            {activeProjectObj && (
              <span className="font-mono text-[11px] font-bold text-[var(--hub-brand)]">
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
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    activeProjectObj?.health === 'optimo'
                      ? 'bg-emerald-500'
                      : activeProjectObj?.health === 'atencion'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                  }`}
                />
                <div className="min-w-0">
                  <div className="text-[13.5px] font-bold text-[var(--hub-text)] truncate leading-tight">
                    {activeProjectObj?.name ?? 'Seleccionar proyecto'}
                  </div>
                  <div className="text-[11px] font-mono text-[var(--hub-dim)] truncate mt-0.5">
                    {activeProjectObj?.code ?? '—'} · En función
                  </div>
                </div>
              </div>
              <ChevronDown
                size={15}
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
                          ? 'bg-[var(--hub-chip)] text-[var(--hub-text)]'
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
                        <div className="text-[13.5px] font-medium leading-snug line-clamp-2">
                          {proj.name}
                        </div>
                        <div className="text-[11px] font-mono text-[var(--hub-dim)] mt-0.5">
                          {proj.code} · {proj.progress}% avance
                        </div>
                      </div>
                      {isSelected && (
                        <Check size={14} className="shrink-0 text-[var(--hub-brand)] mt-1" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Botón directo en cascada: + Nuevo Proyecto */}
          <button
            type="button"
            onClick={() => setIsCreateProjectOpen(true)}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-[var(--hub-brand)]/35 bg-[var(--hub-brand-soft,#fbf0ec)] hover:opacity-95 text-[13px] font-bold text-[var(--hub-brand)] transition-all cursor-pointer"
          >
            <Plus size={15} strokeWidth={2.4} />
            <span>Nuevo Proyecto</span>
          </button>
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

        {/* NIVEL 2 EN CASCADA: SUBPROCESOS / HITOS DEL PROYECTO ACTIVO */}
        {!collapsed && activeProjectObj && (
          <div className="space-y-1 pt-1">
            <div className="px-3 pb-1 flex items-center justify-between gap-2 select-none">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--hub-dim)]">
                SUBPROCESOS
              </span>
              <span
                className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded bg-[var(--hub-chip)] text-[var(--hub-text-soft)] truncate max-w-[115px]"
                title={`Subprocesos de ${activeProjectObj.name}`}
              >
                {activeProjectObj.code}
              </span>
            </div>

            {/* Botón acordeón completo: clic en cualquier parte del botón abre/cierra */}
            <button
              type="button"
              onClick={() => setIsSubprocessesExpanded((prev) => !prev)}
              aria-expanded={isSubprocessesExpanded}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${
                isSubprocessesExpanded
                  ? 'border-l-2 border-[var(--hub-brand)] bg-[var(--hub-chip)] text-[var(--hub-text)]'
                  : 'text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)]'
              }`}
            >
              <span className="flex-shrink-0">
                <Milestone size={18} />
              </span>
              <span className="truncate">Fases & Subprocesos</span>
              <span className="ml-auto font-mono text-[11px] px-1.5 py-0.2 rounded shrink-0 text-[var(--hub-dim)] bg-[var(--hub-chip)]">
                {activeProjectMilestones.length}
              </span>
              <ChevronDown
                size={15}
                className={`shrink-0 text-[var(--hub-dim)] transition-transform duration-200 ml-1 ${
                  isSubprocessesExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {isSubprocessesExpanded && (
              <div className="ml-2 pl-2.5 border-l border-[var(--hub-border)] my-1.5 space-y-1">
                {activeProjectMilestones.length === 0 ? (
                  <NavLink
                    to={getHref(`/proyectos/${activeProjectObj.id}?tab=hitos`)}
                    className={() =>
                      `block px-2.5 py-2 rounded-lg text-[13px] transition-colors ${
                        isHrefActive(`/proyectos/${activeProjectObj.id}?tab=hitos`)
                          ? 'bg-[var(--hub-hover)] text-[var(--hub-text)] font-semibold border-l-2 border-[var(--hub-brand)]'
                          : 'text-[var(--hub-dim)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)]'
                      }`
                    }
                  >
                    Sin subprocesos registrados · Configurar hitos
                  </NavLink>
                ) : (
                  activeProjectMilestones.map((m) => {
                    const targetTo = `/proyectos/${activeProjectObj.id}?tab=hitos&milestone=${m.id}`
                    const isSubprocessActive = isHrefActive(targetTo)
                    const dotColor =
                      m.status === 'aprobado'
                        ? 'bg-emerald-500'
                        : m.status === 'en_revision'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'

                    return (
                      <NavLink
                        key={m.id}
                        to={getHref(targetTo)}
                        title={`Fase ${m.phaseNumber}: ${m.name}`}
                        className={() =>
                          `flex items-start justify-between gap-2 px-2.5 py-2 rounded-lg text-[13.5px] leading-snug transition-colors ${
                            isSubprocessActive
                              ? 'bg-[var(--hub-hover)] text-[var(--hub-text)] font-semibold border-l-2 border-[var(--hub-brand)]'
                              : 'text-[var(--hub-text-soft)] hover:text-[var(--hub-text)] hover:bg-[var(--hub-chip)] font-medium'
                          }`
                        }
                      >
                        <div className="flex items-start gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${dotColor}`} />
                          <span className="line-clamp-2 break-words">{m.name}</span>
                        </div>
                        <span className="font-mono text-[11px] text-[var(--hub-dim)] shrink-0 mt-0.5">
                          F{m.phaseNumber}
                        </span>
                      </NavLink>
                    )
                  })
                )}
              </div>
            )}
          </div>
        )}
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

