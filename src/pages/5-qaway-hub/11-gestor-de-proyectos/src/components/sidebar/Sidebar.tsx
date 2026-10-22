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
    '/hub/proyectos',
    '/hub/gestor-proyectos',
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
      title: 'OPERACIÓN TERRITORIAL (ACTIVO)',
      items: [
        {
          to: '/',
          label: 'Resumen General',
          icon: <LayoutDashboard size={18} />,
          end: true,
        },
        {
          to: '/monitoreo-v2',
          label: 'Reporteador Territorial (Hito 1.6)',
          icon: <BarChart3 size={18} />,
          badge: 'ACTIVO',
          badgeVariant: 'urgent',
        },
      ],
    },
    {
      title: 'MÓDULOS EN ESPERA',
      items: [
        {
          to: '/proyectos',
          label: 'Proyectos & Hitos',
          icon: <FolderKanban size={18} />,
          badge: scopedProjects.length,
          badgeVariant: 'neutral',
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
          to: '/cascada',
          label: 'Cascada Fractal (WBS)',
          icon: <Workflow size={18} />,
          badge: 'WBS',
        },
        {
          to: '/monitoreo-territorial',
          label: 'Monitoreo Territorial v1',
          icon: <BarChart3 size={18} />,
          badge: 'v1',
        },
      ],
    },
  ]

  const currentUrl = `${location.pathname}${location.search}`
  const isHrefActive = (to: string) => {
    const targetHref = getHref(to)
    if (targetHref === currentUrl) return true
    const barePath = location.pathname.slice(detectBase(location.pathname).length) || '/'
    if (to === '/' && (barePath === '/' || barePath === '')) {
      return true
    }
    if (activeProjectObj && to === `/proyectos/${activeProjectObj.id}`) {
      const tab = searchParams.get('tab')
      if (barePath === '/' || (barePath === to && (!tab || tab === 'resumen'))) {
        return true
      }
    }
    return false
  }

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

      {/* NIVEL 1 EN CASCADA: CARTERA / PROGRAMA / PROYECTO (Exacto a la captura de usuario) */}
      {!collapsed && (
        <div className="px-3 pt-3 pb-2.5 border-b border-[var(--hub-border)] space-y-2 shrink-0">
          {/* Header de Cartera y Programa */}
          <div className="space-y-1 px-1">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-purple-100 dark:bg-purple-950/60 px-2 py-0.5 text-[10.5px] font-black text-purple-700 dark:text-purple-300">
                N1 • CARTERA
              </span>
              <span className="text-[11px] font-bold text-slate-500 truncate">
                Materiales Educativos
              </span>
            </div>
            <div className="text-[11px] text-slate-500 font-medium truncate">
              Prog: <strong className="text-slate-700">Monitoreo Territorial BIAE</strong>
            </div>
          </div>

          {/* Selector desplegable FLOTANTE: Intercambio Rápido de Cartera / Proyecto */}
          <div ref={selectorRef} className="relative">
            <button
              type="button"
              onClick={() => setIsActiveSelectorOpen((prev) => !prev)}
              aria-expanded={isActiveSelectorOpen}
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-gradient-to-r from-purple-50/50 to-indigo-50/30 dark:from-purple-950/20 dark:to-indigo-950/20 hover:border-purple-300 text-left transition-all cursor-pointer shadow-2xs group"
              title="MINEDU Dotación 2027 - DRE Junín (13 UGEL)"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-400">
                  <span>OM-00032-2026</span>
                </div>
                <div className="text-[13px] font-black text-slate-900 dark:text-slate-100 truncate mt-0.5">
                  Distribución ME dotación 2027
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="rounded-md bg-purple-200/70 dark:bg-purple-900/60 px-1.5 py-0.5 text-[11px] font-black tabular-nums text-purple-900 dark:text-purple-200">
                  48%
                </span>
                <ChevronDown
                  size={15}
                  className={`text-slate-400 group-hover:text-purple-600 transition-transform duration-200 ${
                    isActiveSelectorOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </button>

            {isActiveSelectorOpen && (
              <div className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#121620] p-2 shadow-2xl space-y-1 max-h-80 overflow-y-auto z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between px-2 py-1 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-wider text-slate-400">
                  <span>INTERCAMBIO RÁPIDO DE CARTERA (N1)</span>
                </div>

                {/* Proyecto 1: Dotación 2027 */}
                <button
                  type="button"
                  onClick={() => setIsActiveSelectorOpen(false)}
                  className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl bg-purple-50/80 dark:bg-purple-950/40 text-left border border-purple-200 dark:border-purple-800/60 transition-all cursor-pointer"
                >
                  <div className="min-w-0">
                    <span className="block text-[10px] font-black text-purple-600 dark:text-purple-400">
                      OM-00032-2026
                    </span>
                    <span className="block text-[12.5px] font-bold text-slate-900 dark:text-slate-100 truncate mt-0.5">
                      Distribución ME dotación 2027
                    </span>
                  </div>
                  <span className="rounded-md bg-purple-200/80 dark:bg-purple-900/70 px-1.5 py-0.5 text-[11px] font-black text-purple-900 dark:text-purple-200 tabular-nums">
                    48%
                  </span>
                </button>

                {/* Proyecto 2: Redistribución 2027 */}
                <button
                  type="button"
                  onClick={() => setIsActiveSelectorOpen(false)}
                  className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-all cursor-pointer"
                >
                  <div className="min-w-0">
                    <span className="block text-[10px] font-black text-slate-500">
                      OM-00050-2026
                    </span>
                    <span className="block text-[12.5px] font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                      Redistribución de ME dot 2027
                    </span>
                  </div>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-black text-slate-700 dark:text-slate-300 tabular-nums">
                    35%
                  </span>
                </button>

                {/* Proyecto 3: Referencia de Infraestructura */}
                <button
                  type="button"
                  onClick={() => setIsActiveSelectorOpen(false)}
                  className="w-full flex items-center justify-between gap-2 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-left transition-all cursor-pointer"
                >
                  <div className="min-w-0">
                    <span className="block text-[10px] font-black text-slate-500">
                      PRY-CASA-01
                    </span>
                    <span className="block text-[12.5px] font-bold text-slate-700 dark:text-slate-300 truncate mt-0.5">
                      Construcción Integral de Residencia Familiar
                    </span>
                  </div>
                  <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-black text-slate-700 dark:text-slate-300 tabular-nums">
                    96%
                  </span>
                </button>

                {/* Botón dentro del desplegable: + Crear Nueva Cartera / Proyecto (N1) */}
                <div className="pt-1.5 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsActiveSelectorOpen(false)
                      setIsCreateProjectOpen(true)
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[12.5px] font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus size={15} strokeWidth={2.8} />
                    <span>+ Crear Nueva Cartera / Proyecto (N1)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* N3 • SUBPROCESO ASOCIADO AL HITO ACTUAL (Tal como en la imagen) */}
          <div className="flex items-center gap-1.5 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/70 dark:bg-emerald-950/20 px-2.5 py-1.5 text-[11px]">
            <span className="font-black text-emerald-800 dark:text-emerald-400 shrink-0">
              N3 • SUBPROCESO:
            </span>
            <span className="font-semibold text-emerald-900 dark:text-emerald-300 truncate" title="1.6 Elaboración del CDL en MC SIGA (22/10)">
              1.6 Elaboración del CDL en MC SIGA
            </span>
          </div>
        </div>
      )}
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

