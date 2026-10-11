import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Flame,
  FolderKanban,
  GanttChart,
  KanbanSquare,
  LayoutDashboard,
  Milestone,
} from 'lucide-react'
import { SlideOverTaskSheet } from '@/components/projects/SlideOverTaskSheet'
import { useProject, useProjectWorkItems, useProjectsDataset } from '@/hooks/useProjects'
import {
  PROJECT_HEALTH_META,
  PROJECT_METHODOLOGY_META,
  PROJECT_STATUS_META,
} from '@/types/project.types'
import { OverviewTab } from './workspace/OverviewTab'
import { KanbanBoardTab } from './workspace/KanbanBoardTab'
import { SprintEngineTab } from './workspace/SprintEngineTab'
import { CalendarTab } from './workspace/CalendarTab'
import { GanttTab } from './workspace/GanttTab'
import { MilestonesTab } from './workspace/MilestonesTab'
import { DocsTab } from './workspace/DocsTab'

// ─────────────────────────────────────────────────────────────────────────
// ProjectWorkspacePage.tsx — Espacio de Trabajo del Proyecto (Fase 4, 5, 6, 9 y 3 A36)
// Ruta /proyectos/:id con header de proyecto y pestañas completas:
// Resumen · Kanban · Sprints · Calendario · Cronograma Gantt P6 · Hitos PMBOK · Wiki.
// ─────────────────────────────────────────────────────────────────────────

type WorkspaceTab = 'resumen' | 'kanban' | 'sprints' | 'calendar' | 'gantt' | 'hitos' | 'docs'

function isWorkspaceTab(value: string | null): value is WorkspaceTab {
  return (
    value === 'resumen' ||
    value === 'kanban' ||
    value === 'sprints' ||
    value === 'calendar' ||
    value === 'gantt' ||
    value === 'hitos' ||
    value === 'docs'
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const project = useProject(id)
  const workItems = useProjectWorkItems(id)
  const dataset = useProjectsDataset()

  const tabParam = searchParams.get('tab')
  const activeTab: WorkspaceTab = isWorkspaceTab(tabParam) ? tabParam : 'resumen'
  const setActiveTab = (tab: WorkspaceTab) => {
    setSearchParams(tab === 'resumen' ? {} : { tab }, { replace: true })
  }

  const pendingMilestones = useMemo(
    () =>
      dataset.milestones.filter(
        (milestone) => milestone.projectId === id && milestone.status !== 'aprobado',
      ).length,
    [dataset, id],
  )
  const docsCount = useMemo(
    () => dataset.docs.filter((doc) => doc.projectId === id).length,
    [dataset, id],
  )
  const sprintTasksCount = useMemo(
    () =>
      dataset.workItems.filter((item) => item.projectId === id && item.sprintId).length,
    [dataset, id],
  )

  if (!project) {
    return (
      <div className="mx-auto max-w-[1800px]">
        <button
          type="button"
          onClick={() => navigate('..')}
          className="mb-4 inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
        >
          <ArrowLeft size={15} /> Volver a proyectos
        </button>
        <div className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-zinc-200 bg-white px-6 py-20 text-center">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400">
            <FolderKanban size={22} />
          </div>
          <p className="text-sm font-semibold text-zinc-700">Proyecto no encontrado</p>
          <p className="max-w-sm text-[13px] text-zinc-400">
            El proyecto “{id}” no existe o fue eliminado. Revisa el directorio de proyectos.
          </p>
        </div>
      </div>
    )
  }

  const methodologyMeta = PROJECT_METHODOLOGY_META[project.methodology]
  const statusMeta = PROJECT_STATUS_META[project.status]
  const healthMeta = PROJECT_HEALTH_META[project.health]

  const tabs: Array<{
    key: WorkspaceTab
    label: string
    icon: React.ReactNode
    badge: number | null
  }> = [
    { key: 'resumen', label: 'Resumen', icon: <LayoutDashboard size={16} />, badge: null },
    { key: 'kanban', label: 'Kanban', icon: <KanbanSquare size={16} />, badge: workItems.length },
    { key: 'sprints', label: 'Sprints', icon: <Flame size={16} />, badge: sprintTasksCount || null },
    { key: 'calendar', label: 'Calendario', icon: <CalendarDays size={16} />, badge: null },
    { key: 'gantt', label: 'Cronograma P6', icon: <GanttChart size={16} />, badge: null },
    { key: 'hitos', label: 'Hitos', icon: <Milestone size={16} />, badge: pendingMilestones || null },
    { key: 'docs', label: 'Wiki Docs', icon: <BookOpen size={16} />, badge: docsCount || null },
  ]

  return (
    <div className="mx-auto max-w-[1800px]">
      {/* Header de proyecto */}
      <div className="mb-4 rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex flex-wrap items-start gap-4">
          <button
            type="button"
            onClick={() => navigate('..')}
            aria-label="Volver al directorio"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <ArrowLeft size={17} />
          </button>
          <div className="grid h-[42px] w-[42px] shrink-0 place-items-center rounded-[12px] bg-brand/10 text-brand">
            <FolderKanban size={22} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {project.code} · {project.client}
            </p>
            <h1 className="truncate text-[24px] font-extrabold leading-tight tracking-[-0.6px] text-zinc-900">
              {project.name}
            </h1>
            <p className="mt-0.5 text-[12px] text-zinc-500">
              {project.manager} · {project.membersCount} integrantes ·{' '}
              {formatDate(project.startDate)} → {formatDate(project.targetDate)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${methodologyMeta.badgeClass}`}
            >
              {methodologyMeta.short}
            </span>
            <span
              className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: healthMeta.color }} />
              <span style={{ color: healthMeta.color }}>{healthMeta.label}</span>
            </span>
          </div>
        </div>
        <div className="mt-4 flex items-center gap-2.5">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-brand transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-zinc-700">{project.progress}%</span>
        </div>
      </div>

      {/* Selector de pestañas */}
      <div
        role="tablist"
        aria-label="Secciones del proyecto"
        className="sticky top-0 z-20 mb-4 flex gap-1.5 overflow-x-auto rounded-xl border border-zinc-200 bg-white/95 p-1.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] backdrop-blur"
      >
        {tabs.map((tab) => {
          const active = tab.key === activeTab
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex h-10 shrink-0 items-center gap-2 rounded-lg px-4 text-sm font-bold transition-colors ${
                active ? 'bg-zinc-900 text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.badge !== null && (
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[11px] font-bold ${
                    active ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-500'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Contenido */}
      {activeTab === 'resumen' && (
        <OverviewTab
          projectId={project.id}
          onOpenTask={setSelectedTaskId}
          onGoDocs={() => setActiveTab('docs')}
        />
      )}
      {activeTab === 'kanban' && (
        <KanbanBoardTab projectId={project.id} onOpenTask={setSelectedTaskId} />
      )}
      {activeTab === 'sprints' && (
        <SprintEngineTab projectId={project.id} onOpenTask={setSelectedTaskId} />
      )}
      {activeTab === 'calendar' && (
        <CalendarTab projectId={project.id} onOpenTask={setSelectedTaskId} />
      )}
      {activeTab === 'gantt' && (
        <GanttTab projectId={project.id} onOpenTask={setSelectedTaskId} />
      )}
      {activeTab === 'hitos' && (
        <MilestonesTab projectId={project.id} onOpenTask={setSelectedTaskId} />
      )}
      {activeTab === 'docs' && <DocsTab projectId={project.id} />}

      <SlideOverTaskSheet
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onOpenTask={setSelectedTaskId}
      />
    </div>
  )
}
