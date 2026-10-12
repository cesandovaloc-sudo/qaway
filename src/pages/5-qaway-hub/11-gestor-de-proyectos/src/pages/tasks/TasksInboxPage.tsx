import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Circle,
  Clock,
  Download,
  Eye,
  Flag,
  FolderKanban,
  Inbox,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from 'lucide-react'
import { SlideOverTaskSheet } from '@/components/projects/SlideOverTaskSheet'
import { useProjectsDataset, useTenantFilteredProjects } from '@/hooks/useProjects'
import { useTenant } from '@/context/TenantContext'
import { useProjectPerspective } from '../../context/ProjectPerspectiveContext'
import { projectsService } from '@/services/projectsService'
import {
  TASK_NATURE_META,
  WORK_ITEM_PRIORITY_META,
  type WorkItem,
  type WorkItemPriority,
  type WorkItemState,
} from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// TasksInboxPage.tsx — Bandeja de Tareas Ejecutiva (Task Inbox)
//
// Vista dedicada de listas agrupadas colapsables (estilo ClickUp/Asana):
// agrupamiento por estado/proyecto/prioridad/vencimiento, mini-KPIs,
// semáforo de vencimiento y apertura de SlideOverTaskSheet. Datos 100%
// reactivos del store local-first, filtrados por organización activa.
// ─────────────────────────────────────────────────────────────────────────

type GroupBy = 'estado' | 'proyecto' | 'prioridad' | 'vencimiento'
type AssigneeFilter = 'mias' | 'equipo'

interface TaskGroup {
  key: string
  title: string
  accentBar: string
  dot: string
  icon: LucideIcon
  tasks: WorkItem[]
  presetState: WorkItemState
  projectId: string | null
}

const GROUP_OPTIONS: { key: GroupBy; label: string }[] = [
  { key: 'estado', label: 'Estado' },
  { key: 'proyecto', label: 'Proyecto' },
  { key: 'prioridad', label: 'Prioridad' },
  { key: 'vencimiento', label: 'Vencimiento' },
]

const PRIORITY_ORDER: WorkItemPriority[] = ['URGENTE', 'ALTA', 'MEDIA', 'BAJA']

const DAY_MS = 86_400_000

function startOfDay(time: number): number {
  const d = new Date(time)
  d.setHours(0, 0, 0, 0)
  return d.getTime()
}

function parseDateOnly(value: string | undefined): number | null {
  if (!value) return null
  const t = new Date(value.length <= 10 ? `${value}T00:00:00` : value).getTime()
  return Number.isNaN(t) ? null : t
}

/** Fecha límite operativa: fin planificado o seguimiento preventivo. */
function dueOf(item: WorkItem): string | undefined {
  return item.endDate ?? item.followUpDate
}

function formatDue(value: string): string {
  const t = parseDateOnly(value)
  if (t === null) return '—'
  return new Date(t).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/** Coincidencia de asignación contra la identidad de la perspectiva activa. */
function isMine(item: WorkItem, me: string): boolean {
  const assignee = item.assignee.name.trim().toLowerCase()
  const mine = me.trim().toLowerCase()
  const firstName = mine.split(/\s+/)[0] ?? ''
  return assignee === mine || (firstName !== '' && (assignee.split(/\s+/)[0] ?? '') === firstName)
}

export default function TasksInboxPage() {
  const dataset = useProjectsDataset()
  const scopedProjects = useTenantFilteredProjects()
  const { scopedTenant } = useTenant()
  const { currentPersona, isGestor } = useProjectPerspective()

  const [groupBy, setGroupBy] = useState<GroupBy>('estado')
  const [groupOpen, setGroupOpen] = useState(false)
  const [assigneeFilter, setAssigneeFilter] = useState<AssigneeFilter>(() => (isGestor ? 'mias' : 'equipo'))
  const [assigneeOpen, setAssigneeOpen] = useState(false)
  const [showClosed, setShowClosed] = useState(false)
  const [closedOpen, setClosedOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [colsOpen, setColsOpen] = useState(false)
  const [visibleCols, setVisibleCols] = useState({
    proyecto: true,
    responsable: true,
    vencimiento: true,
    prioridad: true,
    etiquetas: true,
  })
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [drafts, setDrafts] = useState<Record<string, string>>({})

  const todayStart = useMemo(() => startOfDay(Date.now()), [])

  const projectById = useMemo(() => new Map(scopedProjects.map((p) => [p.id, p])), [scopedProjects])
  const projectIds = useMemo(() => new Set(scopedProjects.map((p) => p.id)), [scopedProjects])

  // Base: organización activa + filtro de asignación (sin buscador).
  const baseTasks = useMemo(
    () =>
      dataset.workItems.filter((item) => {
        if (!projectIds.has(item.projectId)) return false
        if (assigneeFilter === 'mias' && !isMine(item, currentPersona.name)) return false
        return true
      }),
    [dataset.workItems, projectIds, assigneeFilter, currentPersona.name],
  )

  const kpis = useMemo(() => {
    const open = baseTasks.filter((t) => t.state !== 'done')
    const overdue = open.filter((t) => {
      const due = parseDateOnly(dueOf(t))
      return due !== null && startOfDay(due) < todayStart
    }).length
    return {
      total: open.length,
      overdue,
      inProgress: open.filter((t) => t.state === 'in_progress').length,
      done: baseTasks.length - open.length,
    }
  }, [baseTasks, todayStart])

  // Filas visibles: base + buscador + completadas.
  const visibleTasks = useMemo(() => {
    const term = search.trim().toLowerCase()
    return baseTasks.filter((item) => {
      if (item.state === 'done' && !showClosed) return false
      if (!term) return true
      const project = projectById.get(item.projectId)
      const haystack =
        `${item.title} ${item.id} ${item.assignee.name} ${item.scopeTag ?? ''} ${item.milestoneRef ?? ''} ${project?.name ?? ''} ${project?.code ?? ''}`.toLowerCase()
      return haystack.includes(term)
    })
  }, [baseTasks, search, showClosed, projectById])

  const groups: TaskGroup[] = useMemo(() => {
    if (groupBy === 'proyecto') {
      return [...scopedProjects]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => ({
          key: `proyecto:${p.id}`,
          title: p.name,
          accentBar: 'bg-zinc-800',
          dot: 'bg-zinc-500',
          icon: FolderKanban,
          tasks: visibleTasks.filter((t) => t.projectId === p.id),
          presetState: 'todo' as WorkItemState,
          projectId: p.id,
        }))
        .filter((g) => g.tasks.length > 0)
    }
    if (groupBy === 'prioridad') {
      const colors: Record<WorkItemPriority, { bar: string; dot: string }> = {
        URGENTE: { bar: 'bg-red-500', dot: 'bg-red-500' },
        ALTA: { bar: 'bg-amber-500', dot: 'bg-amber-500' },
        MEDIA: { bar: 'bg-sky-500', dot: 'bg-sky-500' },
        BAJA: { bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
      }
      return PRIORITY_ORDER.map((priority) => ({
        key: `prioridad:${priority}`,
        title: priority.charAt(0) + priority.slice(1).toLowerCase(),
        accentBar: colors[priority].bar,
        dot: colors[priority].dot,
        icon: Flag,
        tasks: visibleTasks.filter((t) => t.priority === priority),
        presetState: 'todo' as WorkItemState,
        projectId: null,
      })).filter((g) => g.tasks.length > 0)
    }
    if (groupBy === 'vencimiento') {
      const bucketOf = (t: WorkItem): string => {
        if (t.state === 'done') return 'hechas'
        const due = parseDateOnly(dueOf(t))
        if (due === null) return 'proximas'
        const diff = Math.round((startOfDay(due) - todayStart) / DAY_MS)
        if (diff < 0) return 'atrasadas'
        if (diff === 0) return 'hoy'
        if (diff <= 7) return 'semana'
        return 'proximas'
      }
      const defs: { key: string; title: string; bar: string; dot: string }[] = [
        { key: 'atrasadas', title: 'Atrasadas', bar: 'bg-red-500', dot: 'bg-red-500' },
        { key: 'hoy', title: 'Hoy', bar: 'bg-amber-500', dot: 'bg-amber-500' },
        { key: 'semana', title: 'Esta semana', bar: 'bg-sky-500', dot: 'bg-sky-500' },
        { key: 'proximas', title: 'Próximas', bar: 'bg-zinc-400', dot: 'bg-zinc-400' },
        { key: 'hechas', title: 'Completadas', bar: 'bg-emerald-500', dot: 'bg-emerald-500' },
      ]
      return defs
        .map((d) => ({
          key: `vencimiento:${d.key}`,
          title: d.title,
          accentBar: d.bar,
          dot: d.dot,
          icon: CalendarDays,
          tasks: visibleTasks.filter((t) => bucketOf(t) === d.key),
          presetState: 'todo' as WorkItemState,
          projectId: null,
        }))
        .filter((g) => g.tasks.length > 0)
    }
    // Por defecto: estado.
    const defs: { key: string; title: string; bar: string; dot: string; icon: LucideIcon; states: WorkItemState[]; preset: WorkItemState }[] = [
      { key: 'nuevas', title: 'No iniciadas', bar: 'bg-indigo-500', dot: 'bg-indigo-500', icon: Circle, states: ['backlog', 'todo'], preset: 'todo' },
      { key: 'progreso', title: 'En progreso', bar: 'bg-sky-500', dot: 'bg-sky-500', icon: Clock, states: ['in_progress'], preset: 'in_progress' },
      { key: 'revision', title: 'En revisión', bar: 'bg-amber-500', dot: 'bg-amber-500', icon: Eye, states: ['review'], preset: 'review' },
      { key: 'hechas', title: 'Completadas', bar: 'bg-emerald-500', dot: 'bg-emerald-500', icon: CheckCircle2, states: ['done'], preset: 'done' },
    ]
    return defs
      .map((d) => ({
        key: `estado:${d.key}`,
        title: d.title,
        accentBar: d.bar,
        dot: d.dot,
        icon: d.icon,
        tasks: visibleTasks.filter((t) => d.states.includes(t.state)),
        presetState: d.preset,
        projectId: null,
      }))
      .filter((g) => g.tasks.length > 0)
  }, [groupBy, visibleTasks, scopedProjects, todayStart])

  const toggleCollapsed = (key: string) => setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))

  const quickAdd = (group: TaskGroup) => {
    const title = (drafts[group.key] ?? '').trim()
    if (!title) return
    const projectId = group.projectId ?? scopedProjects[0]?.id
    if (!projectId) return
    projectsService.createWorkItem({
      projectId,
      title,
      state: group.presetState,
      priority: 'MEDIA',
      assignee: isGestor
        ? { name: currentPersona.name, role: currentPersona.title }
        : { name: 'Sin asignar', role: 'Equipo' },
      originType: 'accion_emergente',
    })
    setDrafts((prev) => ({ ...prev, [group.key]: '' }))
  }

  const exportCsv = () => {
    const rows = visibleTasks.map((t) => {
      const project = projectById.get(t.projectId)
      return [t.id, `"${t.title.replace(/"/g, '""')}"`, project?.name ?? '', t.state, t.priority, t.assignee.name, dueOf(t) ?? '', t.scopeTag ?? '']
    })
    const csv = ['id,titulo,proyecto,estado,prioridad,responsable,vencimiento,ambito', ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'bandeja-tareas.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const title = isGestor ? 'Mi Bandeja' : 'Bandeja de Tareas'

  return (
    <div className="mx-auto max-w-[1800px]">
      {/* Cabecera */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="grid h-[38px] w-[38px] place-items-center rounded-[10px] border border-zinc-200 bg-zinc-100 text-zinc-900">
            <Inbox size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.8px] text-zinc-900">{title}</h1>
            <p className="text-[13px] text-zinc-500">
              {kpis.total} pendientes · {kpis.overdue} atrasadas · {kpis.done} completadas
              {scopedTenant ? ` · ${scopedTenant.name}` : ' · Todas las entidades'}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            <Download size={15} /> Exportar
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setColsOpen((v) => !v)}
              className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              <SlidersHorizontal size={15} /> Columnas
            </button>
            {colsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setColsOpen(false)} aria-label="Cerrar columnas" />
                <div className="absolute right-0 top-[calc(100%+6px)] z-50 w-52 rounded-xl border border-zinc-200 bg-white p-2 shadow-lg">
                  {(['proyecto', 'responsable', 'vencimiento', 'prioridad', 'etiquetas'] as const).map((col) => (
                    <label key={col} className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50">
                      <input
                        type="checkbox"
                        checked={visibleCols[col]}
                        onChange={(e) => setVisibleCols((prev) => ({ ...prev, [col]: e.target.checked }))}
                        className="h-4 w-4 accent-zinc-900"
                      />
                      <span className="capitalize">{col === 'responsable' ? 'Responsable' : col === 'vencimiento' ? 'Vencimiento' : col}</span>
                    </label>
                  ))}
                </div>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white shadow-[0_2px_8px_rgba(255,75,11,0.28)] transition-colors hover:bg-brand-hover"
          >
            <Plus size={16} /> Nueva tarea
          </button>
        </div>
      </div>

      {/* Mini-KPIs */}
      <section className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MiniKpi label="Total tareas" value={kpis.total} accent="text-zinc-900" />
        <MiniKpi label="Atrasadas" value={kpis.overdue} accent="text-red-700" />
        <MiniKpi label="En curso" value={kpis.inProgress} accent="text-sky-700" />
        <MiniKpi label="Completadas" value={kpis.done} accent="text-emerald-700" />
      </section>

      {/* Toolbar */}
      <div className="sticky top-0 z-20 mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white/95 p-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.03)] backdrop-blur">
        {/* Agrupador */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setGroupOpen((v) => !v)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <span className="text-zinc-400 font-normal">Grupo:</span>
            <span className="font-semibold">{GROUP_OPTIONS.find((o) => o.key === groupBy)?.label}</span>
            <ChevronDown size={14} className={`text-zinc-400 transition-transform ${groupOpen ? 'rotate-180' : ''}`} />
          </button>
          {groupOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setGroupOpen(false)} aria-label="Cerrar agrupador" />
              <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
                {GROUP_OPTIONS.map((o) => (
                  <button
                    key={o.key}
                    type="button"
                    onClick={() => {
                      setGroupBy(o.key)
                      setGroupOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      groupBy === o.key ? 'bg-zinc-100 font-semibold text-zinc-900' : 'font-medium text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {o.label}
                    {groupBy === o.key && <CheckCircle2 size={14} className="text-zinc-900" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Asignación */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setAssigneeOpen((v) => !v)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            {assigneeFilter === 'mias' ? 'Mis tareas' : 'Todo el equipo'}
            <ChevronDown size={14} className={`text-zinc-400 transition-transform ${assigneeOpen ? 'rotate-180' : ''}`} />
          </button>
          {assigneeOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setAssigneeOpen(false)} aria-label="Cerrar asignación" />
              <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
                {(['mias', 'equipo'] as AssigneeFilter[]).map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setAssigneeFilter(f)
                      setAssigneeOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      assigneeFilter === f ? 'bg-zinc-100 font-semibold text-zinc-900' : 'font-medium text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {f === 'mias' ? 'Mis tareas' : 'Todo el equipo'}
                    {assigneeFilter === f && <CheckCircle2 size={14} className="text-zinc-900" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Completadas */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setClosedOpen((v) => !v)}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Cerradas: {showClosed ? 'Visibles' : 'Ocultas'}
            <ChevronDown size={14} className={`text-zinc-400 transition-transform ${closedOpen ? 'rotate-180' : ''}`} />
          </button>
          {closedOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setClosedOpen(false)} aria-label="Cerrar filtro" />
              <div className="absolute left-0 top-[calc(100%+6px)] z-50 w-48 rounded-xl border border-zinc-200 bg-white p-1.5 shadow-lg">
                {([false, true] as const).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => {
                      setShowClosed(v)
                      setClosedOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                      showClosed === v ? 'bg-zinc-100 font-semibold text-zinc-900' : 'font-medium text-zinc-600 hover:bg-zinc-50'
                    }`}
                  >
                    {v ? 'Mostrar' : 'Ocultar'}
                    {showClosed === v && <CheckCircle2 size={14} className="text-zinc-900" />}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Buscador */}
        <div className="relative min-w-[200px] flex-1">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por tarea, código, responsable o ámbito…"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-8 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-brand"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Limpiar búsqueda"
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
            >
              <X size={14} />
            </button>
          )}
        </div>
        <span className="ml-auto text-xs font-semibold text-zinc-500">{visibleTasks.length} tareas</span>
      </div>

      {/* Grupos colapsables */}
      <div className="space-y-3">
        {groups.map((group) => {
          const isCollapsed = collapsed[group.key] ?? false
          const Icon = group.icon
          return (
            <section key={group.key} className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
              <div className={`h-1 w-full ${group.accentBar}`} />
              <button
                type="button"
                onClick={() => toggleCollapsed(group.key)}
                className="flex w-full items-center gap-2.5 px-4 py-3 text-left transition-colors hover:bg-zinc-50/60"
              >
                <Icon size={16} className="shrink-0 text-zinc-500" />
                <span className="text-sm font-bold text-zinc-900">{group.title}</span>
                <span className="rounded-md bg-zinc-100 px-1.5 py-0.5 font-mono text-[11px] font-bold text-zinc-600">
                  {group.tasks.length}
                </span>
                <ChevronDown size={16} className={`ml-auto shrink-0 text-zinc-400 transition-transform duration-200 ${isCollapsed ? '' : 'rotate-180'}`} />
              </button>

              {!isCollapsed && (
                <div className="border-t border-zinc-100">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[860px] border-collapse text-left">
                      <thead>
                        <tr className="border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
                          <th className="px-4 py-2.5">Tarea</th>
                          {visibleCols.proyecto && <th className="px-4 py-2.5">Proyecto</th>}
                          {visibleCols.responsable && <th className="px-4 py-2.5">Responsable</th>}
                          {visibleCols.vencimiento && <th className="px-4 py-2.5">Vencimiento</th>}
                          {visibleCols.prioridad && <th className="px-4 py-2.5">Prioridad</th>}
                          {visibleCols.etiquetas && <th className="px-4 py-2.5">Etiquetas</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {group.tasks.map((task) => (
                          <TaskRow
                            key={task.id}
                            task={task}
                            projectName={projectById.get(task.projectId)?.name ?? '—'}
                            projectCode={projectById.get(task.projectId)?.code}
                            visibleCols={visibleCols}
                            todayStart={todayStart}
                            onOpen={() => setSelectedTaskId(task.id)}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {/* Agregar rápido con estado preasignado */}
                  <div className="flex items-center gap-2 border-t border-zinc-100 bg-zinc-50/50 px-4 py-2.5">
                    <Plus size={14} className="shrink-0 text-zinc-400" />
                    <input
                      value={drafts[group.key] ?? ''}
                      onChange={(e) => setDrafts((prev) => ({ ...prev, [group.key]: e.target.value }))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') quickAdd(group)
                      }}
                      placeholder={`Agregar tarea en ${group.title}…`}
                      aria-label={`Agregar tarea en ${group.title}`}
                      className="h-8 flex-1 rounded-lg border border-transparent bg-transparent px-2 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-zinc-200 focus:bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => quickAdd(group)}
                      disabled={!(drafts[group.key] ?? '').trim()}
                      className="h-8 shrink-0 rounded-lg bg-zinc-900 px-3 text-xs font-bold text-white transition-colors hover:bg-zinc-700 disabled:opacity-40"
                    >
                      Agregar
                    </button>
                  </div>
                </div>
              )}
            </section>
          )
        })}

        {groups.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400">
              <Inbox size={22} />
            </div>
            <p className="text-sm font-semibold text-zinc-700">Bandeja vacía</p>
            <p className="max-w-sm text-[13px] text-zinc-400">
              No hay tareas con los filtros actuales. Ajusta la búsqueda o crea una nueva tarea.
            </p>
          </div>
        )}
      </div>

      {isCreateOpen && (
        <CreateTaskModal
          projects={scopedProjects.map((p) => ({ id: p.id, name: p.name }))}
          defaultAssignee={isGestor ? currentPersona.name : 'Sin asignar'}
          onClose={() => setIsCreateOpen(false)}
        />
      )}

      <SlideOverTaskSheet
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onOpenTask={(id) => setSelectedTaskId(id)}
      />
    </div>
  )
}

function MiniKpi({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <p className="text-xs font-semibold text-zinc-500">{label}</p>
      <p className={`mt-1 text-[28px] font-extrabold leading-none tracking-tight ${accent}`}>{value}</p>
    </div>
  )
}

function TaskRow({
  task,
  projectName,
  projectCode,
  visibleCols,
  todayStart,
  onOpen,
}: {
  task: WorkItem
  projectName: string
  projectCode?: string
  visibleCols: { proyecto: boolean; responsable: boolean; vencimiento: boolean; prioridad: boolean; etiquetas: boolean }
  todayStart: number
  onOpen: () => void
}) {
  const priorityMeta = WORK_ITEM_PRIORITY_META[task.priority]
  const due = dueOf(task)
  const dueNode = (() => {
    if (!due) return <span className="text-[13px] text-zinc-400">Sin fecha</span>
    if (task.state === 'done') return <span className="text-[13px] text-zinc-500">{formatDue(due)}</span>
    const parsed = parseDateOnly(due)
    if (parsed === null) return <span className="text-[13px] text-zinc-500">{formatDue(due)}</span>
    const diff = Math.round((startOfDay(parsed) - todayStart) / DAY_MS)
    if (diff < 0) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-[12px] font-bold text-red-700">
          <AlertTriangle size={12} /> Atrasada · {formatDue(due)}
        </span>
      )
    }
    if (diff === 0) {
      return (
        <span className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[12px] font-bold text-amber-700">
          <Clock size={12} /> Vence hoy
        </span>
      )
    }
    if (diff <= 3) {
      return (
        <span className="inline-flex items-center gap-1.5 text-[12px] font-bold text-sky-700">
          <Clock size={12} /> Vence en {diff}d · {formatDue(due)}
        </span>
      )
    }
    return <span className="text-[13px] text-zinc-600">{formatDue(due)}</span>
  })()

  return (
    <tr
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') onOpen()
      }}
      tabIndex={0}
      title={`Abrir ${task.title}`}
      className="cursor-pointer border-b border-zinc-50 transition-colors outline-none last:border-0 hover:bg-zinc-50/70 focus-visible:ring-2 focus-visible:ring-brand/40"
    >
      <td className="max-w-[320px] px-4 py-2.5">
        <p className="truncate text-sm font-medium text-zinc-900">{task.title}</p>
        <p className="mt-0.5 font-mono text-[11px] text-zinc-400">
          {task.id}
          {projectCode ? ` · ${projectCode}` : ''}
          {task.isBlocked ? ' · Bloqueada' : ''}
        </p>
      </td>
      {visibleCols.proyecto && <td className="max-w-[200px] truncate px-4 py-2.5 text-[13px] text-zinc-600">{projectName}</td>}
      {visibleCols.responsable && (
        <td className="px-4 py-2.5">
          <span className="flex items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
              {initialsOf(task.assignee.name)}
            </span>
            <span className="max-w-[140px] truncate text-[13px] text-zinc-600">{task.assignee.name}</span>
          </span>
        </td>
      )}
      {visibleCols.vencimiento && <td className="whitespace-nowrap px-4 py-2.5">{dueNode}</td>}
      {visibleCols.prioridad && (
        <td className="px-4 py-2.5">
          <span className="inline-flex items-center gap-1.5 text-[12px] font-bold" style={{ color: priorityMeta.color }}>
            <Flag size={13} /> {task.priority.charAt(0) + task.priority.slice(1).toLowerCase()}
          </span>
        </td>
      )}
      {visibleCols.etiquetas && (
        <td className="px-4 py-2.5">
          <span className="flex max-w-[220px] flex-wrap gap-1">
            {task.scopeTag && (
              <span className="inline-flex items-center rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-px text-[11px] font-semibold text-zinc-600">
                {task.scopeTag}
              </span>
            )}
            {task.taskNature && (
              <span className={`inline-flex items-center rounded-md border px-1.5 py-px text-[11px] font-semibold ${TASK_NATURE_META[task.taskNature].badgeClass}`}>
                {TASK_NATURE_META[task.taskNature].label}
              </span>
            )}
            {!task.scopeTag && !task.taskNature && <span className="text-[13px] text-zinc-300">—</span>}
          </span>
        </td>
      )}
    </tr>
  )
}

function CreateTaskModal({
  projects,
  defaultAssignee,
  onClose,
}: {
  projects: { id: string; name: string }[]
  defaultAssignee: string
  onClose: () => void
}) {
  const [projectId, setProjectId] = useState(projects[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [state, setState] = useState<WorkItemState>('todo')
  const [priority, setPriority] = useState<WorkItemPriority>('MEDIA')
  const [assignee, setAssignee] = useState(defaultAssignee === 'Sin asignar' ? '' : defaultAssignee)
  const [due, setDue] = useState('')
  const [error, setError] = useState<string | null>(null)

  const inputCls =
    'w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 placeholder:text-zinc-400 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/15'
  const labelCls = 'mb-1.5 block text-xs font-semibold text-zinc-600'

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      setError('Ingresa el título de la tarea.')
      return
    }
    if (!projectId) {
      setError('Selecciona un proyecto.')
      return
    }
    projectsService.createWorkItem({
      projectId,
      title: title.trim(),
      state,
      priority,
      assignee: { name: assignee.trim() || 'Sin asignar', role: 'Equipo' },
      originType: 'accion_emergente',
      ...(due ? { endDate: due } : {}),
    })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-zinc-950/50 p-4 backdrop-blur-[2px]">
      <div role="dialog" aria-modal="true" aria-label="Nueva tarea" className="w-full max-w-lg rounded-2xl border border-zinc-200 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
        <div className="flex items-center justify-between gap-4 border-b border-zinc-100 px-5 py-4">
          <div>
            <h2 className="text-sm font-bold text-zinc-900">Nueva tarea</h2>
            <p className="text-[13px] text-zinc-500">Créala en segundos y aparecerá en la bandeja.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Cerrar" className="grid h-9 w-9 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 px-5 py-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelCls} htmlFor="inbox-title">Título *</label>
            <input id="inbox-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej. Validar PECOSA en UGEL…" className={inputCls} />
          </div>
          <div className="md:col-span-2">
            <label className={labelCls} htmlFor="inbox-project">Proyecto *</label>
            <select id="inbox-project" value={projectId} onChange={(e) => setProjectId(e.target.value)} className={inputCls}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="inbox-state">Estado</label>
            <select id="inbox-state" value={state} onChange={(e) => setState(e.target.value as WorkItemState)} className={inputCls}>
              <option value="backlog">Backlog</option>
              <option value="todo">Por hacer</option>
              <option value="in_progress">En desarrollo</option>
              <option value="review">En revisión</option>
              <option value="done">Completado</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="inbox-priority">Prioridad</label>
            <select id="inbox-priority" value={priority} onChange={(e) => setPriority(e.target.value as WorkItemPriority)} className={inputCls}>
              {PRIORITY_ORDER.map((p) => (
                <option key={p} value={p}>{p.charAt(0) + p.slice(1).toLowerCase()}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="inbox-assignee">Responsable</label>
            <input id="inbox-assignee" value={assignee} onChange={(e) => setAssignee(e.target.value)} placeholder="Nombre del gestor" className={inputCls} />
          </div>
          <div>
            <label className={labelCls} htmlFor="inbox-due">Vencimiento</label>
            <input id="inbox-due" type="date" value={due} onChange={(e) => setDue(e.target.value)} className={`${inputCls} cursor-pointer`} />
          </div>
          {error && <p className="md:col-span-2 text-[11px] font-medium text-rose-600">{error}</p>}
          <div className="flex items-center justify-end gap-2 border-t border-zinc-100 pt-3 md:col-span-2">
            <button type="button" onClick={onClose} className="h-10 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50">
              Cancelar
            </button>
            <button type="submit" className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white transition-colors hover:bg-brand-hover">
              <Plus size={16} /> Crear tarea
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
