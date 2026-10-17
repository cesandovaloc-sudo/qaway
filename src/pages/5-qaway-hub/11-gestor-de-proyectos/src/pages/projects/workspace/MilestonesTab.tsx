import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertTriangle,
  BarChart3,
  Check,
  ChevronDown,
  Clock,
  Flag,
  MessageCircle,
  Plus,
  X,
} from 'lucide-react'
import { useProjectsDataset } from '@/hooks/useProjects'
import { projectsService } from '@/services/projectsService'
import {
  FOLLOW_UP_META,
  MILESTONE_STATUS_META,
  WORK_ITEM_STATE_META,
  type MilestoneStatus,
  type TaskNature,
  type WorkItem,
  type WorkItemPriority,
} from '@/types/project.types'
import {
  buildFollowUpMessage,
  buildWhatsAppUrl,
  formatFollowUpDate,
  getFollowUpStatus,
  toFollowUpContact,
} from '@/utils/followUp'

// ─────────────────────────────────────────────────────────────────────────
// MilestonesTab.tsx — d) Hitos PMBOK + Acordeón territorial (Fase 10)
// Línea de tiempo por fases con estado contractual, entregables, firma
// requerida y tareas hijas vinculadas con contacto WhatsApp en 1 clic.
// ─────────────────────────────────────────────────────────────────────────

interface MilestonesTabProps {
  projectId: string
  onOpenTask: (taskId: string) => void
}

const NEXT_STATUS: Record<MilestoneStatus, MilestoneStatus | null> = {
  pendiente: 'en_revision',
  en_revision: 'aprobado',
  aprobado: null,
}

const NEXT_LABEL: Record<Exclude<MilestoneStatus, 'aprobado'>, string> = {
  pendiente: 'Enviar a revisión',
  en_revision: 'Aprobar hito',
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

/** Riesgo accionable para la salud del hito: no cerrada + (bloqueada | urgente | vencida). */
function isMilestoneTaskAtRisk(item: WorkItem): boolean {
  if (item.state === 'done') return false
  return (
    Boolean(item.isBlocked) ||
    item.priority === 'URGENTE' ||
    getFollowUpStatus(item.followUpDate, item.state) === 'vencido'
  )
}

function MilestoneChildRow({
  child,
  onOpenTask,
}: {
  child: WorkItem
  onOpenTask: (taskId: string) => void
}) {
  const followStatus = getFollowUpStatus(child.followUpDate, child.state)
  const followMeta = FOLLOW_UP_META[followStatus]
  const contact = toFollowUpContact(child)
  const waUrl = buildWhatsAppUrl(child.assignee.phone, buildFollowUpMessage(contact))
  return (
    <li className="flex items-center gap-2.5 rounded-xl border border-zinc-100 bg-white p-2.5 shadow-sm">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-zinc-900 text-[11px] font-extrabold text-white">
        {child.assignee.name.trim().charAt(0).toUpperCase()}
      </span>
      <button
        type="button"
        onClick={() => onOpenTask(child.id)}
        className="min-w-0 flex-1 text-left"
      >
        <span className="block truncate text-[13px] font-bold text-zinc-800 hover:text-brand">
          {child.title}
        </span>
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] text-zinc-500">
          <span className="font-mono">{child.id}</span>
          <span className="font-semibold">{WORK_ITEM_STATE_META[child.state].label}</span>
          <span className="truncate">{child.assignee.name}</span>
          {child.scopeTag && (
            <span className="rounded bg-sky-50 px-1.5 py-px font-bold text-sky-700">
              {child.scopeTag}
            </span>
          )}
          <span
            className="inline-flex items-center gap-1 font-bold"
            style={{ color: followMeta.color }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: followMeta.color }}
            />
            {formatFollowUpDate(child.followUpDate)}
          </span>
        </span>
        {child.threatensMilestone && child.threatNote && (
          <span className="mt-0.5 flex items-start gap-1 text-[11px] font-semibold leading-snug text-amber-700">
            <AlertTriangle size={11} className="mt-0.5 shrink-0" />
            {child.threatNote}
          </span>
        )}
      </button>
      {waUrl ? (
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          title={`WhatsApp a ${child.assignee.name}`}
          aria-label={`WhatsApp a ${child.assignee.name}`}
          onClick={(event) => event.stopPropagation()}
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#25d366] text-white shadow-sm transition-transform hover:scale-105"
        >
          <MessageCircle size={16} />
        </a>
      ) : (
        <span
          title="Sin teléfono registrado"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-zinc-100 text-zinc-300"
        >
          <MessageCircle size={16} />
        </span>
      )}
    </li>
  )
}

export function MilestonesTab({ projectId, onOpenTask }: MilestonesTabProps) {
  const dataset = useProjectsDataset()
  const [searchParams, setSearchParams] = useSearchParams()
  const milestoneParam = searchParams.get('milestone')
  const statusParam = searchParams.get('status') as MilestoneStatus | null
  const [expandedId, setExpandedId] = useState<string | null>(milestoneParam)

  // Estado del formulario rápido para crear tarea vinculada directamente a un hito
  const [creatingForMilestoneId, setCreatingForMilestoneId] = useState<string | null>(null)
  const [taskTitle, setTaskTitle] = useState('')
  const [taskAssignee, setTaskAssignee] = useState('Carlos Sandoval')
  const [taskScope, setTaskScope] = useState('UGEL Huancayo')
  const [taskPriority, setTaskPriority] = useState<WorkItemPriority>('ALTA')
  const [taskNature, setTaskNature] = useState<TaskNature>('obligacion_normativa')
  const [taskDate, setTaskDate] = useState('')

  useEffect(() => {
    if (milestoneParam) {
      setExpandedId(milestoneParam)
    }
  }, [milestoneParam])

  const project = useMemo(
    () => dataset.projects.find((item) => item.id === projectId),
    [dataset.projects, projectId],
  )

  const milestones = useMemo(
    () =>
      dataset.milestones
        .filter((milestone) => milestone.projectId === projectId)
        .sort((a, b) => a.phaseNumber - b.phaseNumber),
    [dataset, projectId],
  )

  const filteredMilestones = useMemo(() => {
    if (!statusParam) return milestones
    return milestones.filter((m) => m.status === statusParam)
  }, [milestones, statusParam])

  const counts = useMemo(
    () => ({
      all: milestones.length,
      pendiente: milestones.filter((m) => m.status === 'pendiente').length,
      en_revision: milestones.filter((m) => m.status === 'en_revision').length,
      aprobado: milestones.filter((m) => m.status === 'aprobado').length,
    }),
    [milestones],
  )

  const approved = counts.aprobado
  const progress =
    milestones.length > 0 ? Math.round((approved / milestones.length) * 100) : 0

  const handleFilterStatus = (nextStatus: MilestoneStatus | null) => {
    const next = new URLSearchParams(searchParams)
    next.set('tab', 'hitos')
    if (nextStatus) {
      next.set('status', nextStatus)
    } else {
      next.delete('status')
    }
    setSearchParams(next, { replace: true })
  }

  const openCreateForm = (milestoneId: string, defaultDate: string) => {
    setExpandedId(milestoneId)
    setCreatingForMilestoneId(milestoneId)
    setTaskTitle('')
    setTaskDate(defaultDate || new Date().toISOString().slice(0, 10))
  }

  const handleCreateLinkedTask = (
    e: React.FormEvent,
    milestone: { id: string; phaseNumber: number; name: string; targetDate: string },
  ) => {
    e.preventDefault()
    if (!taskTitle.trim()) return
    const created = projectsService.createWorkItem({
      projectId,
      milestoneId: milestone.id,
      milestoneRef: `Fase ${milestone.phaseNumber} · ${milestone.name}`,
      originType:
        taskNature === 'obligacion_normativa' ? 'oficial_oficio' : 'accion_emergente',
      taskNature,
      threatensMilestone: taskPriority === 'URGENTE',
      title: taskTitle.trim(),
      description: `Tarea vinculada directamente al hito: Fase ${milestone.phaseNumber} · ${milestone.name}`,
      state: 'todo',
      priority: taskPriority,
      assignee: {
        name: taskAssignee.trim() || 'Gestor Territorial',
        role: 'Gestor Territorial',
        phone: '+51964112233',
      },
      storyPoints: 3,
      followUpDate: taskDate || milestone.targetDate,
      scopeTag: taskScope.trim() || undefined,
    })
    setCreatingForMilestoneId(null)
    setTaskTitle('')
    setExpandedId(milestone.id)
    onOpenTask(created.id)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-900">
            <Flag size={15} className="text-zinc-400" />
            <span>Subprocesos & Hitos · {project?.name ?? 'Proyecto'}</span>
          </h3>
          <p className="text-xs text-zinc-500">
            {approved} de {milestones.length} subprocesos/fases aprobadas en este proyecto
          </p>
        </div>

        {/* Filtros por semáforo (Opción A sincronizada con Sidebar) */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => handleFilterStatus(null)}
            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              !statusParam
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Todos ({counts.all})
          </button>
          <button
            type="button"
            onClick={() => handleFilterStatus('pendiente')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              statusParam === 'pendiente'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            Pendientes ({counts.pendiente})
          </button>
          <button
            type="button"
            onClick={() => handleFilterStatus('en_revision')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              statusParam === 'en_revision'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            En revisión ({counts.en_revision})
          </button>
          <button
            type="button"
            onClick={() => handleFilterStatus('aprobado')}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              statusParam === 'aprobado'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-current" />
            Aprobados ({counts.aprobado})
          </button>
        </div>

        <div className="ml-auto flex min-w-[180px] items-center gap-2.5">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-[var(--hub-brand)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="tabular-nums text-xs font-bold text-zinc-700">{progress}%</span>
        </div>
      </div>

      {filteredMilestones.length === 0 ? (
        <div className="px-5 py-14 text-center">
          <p className="text-sm text-zinc-400">
            No hay hitos en este estado para este proyecto.
          </p>
          {statusParam && (
            <button
              type="button"
              onClick={() => handleFilterStatus(null)}
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 cursor-pointer"
            >
              Ver todos los hitos ({counts.all})
            </button>
          )}
        </div>
      ) : (
        <ol className="relative space-y-0 px-5 py-5">
          {filteredMilestones.map((milestone, index) => {
            const meta = MILESTONE_STATUS_META[milestone.status]
            const next = NEXT_STATUS[milestone.status]
            const isLast = index === filteredMilestones.length - 1
            const childTasks = dataset.workItems.filter(
              (item) => item.milestoneId === milestone.id,
            )
            const normativeTasks = childTasks.filter(
              (item) => (item.taskNature ?? 'obligacion_normativa') === 'obligacion_normativa',
            )
            const complementaryTasks = childTasks.filter(
              (item) => (item.taskNature ?? 'obligacion_normativa') !== 'obligacion_normativa',
            )
            const normativeAtRisk = normativeTasks.filter(isMilestoneTaskAtRisk)
            const threatening = complementaryTasks.filter(
              (item) => item.threatensMilestone && isMilestoneTaskAtRisk(item),
            )
            const expanded = expandedId === milestone.id
            const isSelectedFromSidebar = milestoneParam === milestone.id
            const isCreatingHere = creatingForMilestoneId === milestone.id

            return (
              <li key={milestone.id} className="relative flex gap-4 pb-6 last:pb-0">
                {!isLast && (
                  <span
                    className="absolute left-[19px] top-11 h-[calc(100%-2.5rem)] w-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        milestone.status === 'aprobado' ? '#10b981' : '#e4e4e7',
                    }}
                  />
                )}
                <span
                  className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl border text-sm font-extrabold"
                  style={{
                    backgroundColor: milestone.status === 'aprobado' ? '#ecfdf5' : '#fafafa',
                    borderColor: milestone.status === 'aprobado' ? '#a7f3d0' : '#e4e4e7',
                    color: milestone.status === 'aprobado' ? '#059669' : '#71717a',
                  }}
                >
                  {milestone.status === 'aprobado' ? <Check size={17} /> : milestone.phaseNumber}
                </span>

                <div
                  className={`min-w-0 flex-1 rounded-2xl border p-4 transition-colors ${
                    isSelectedFromSidebar
                      ? 'border-[var(--hub-brand)]/40 bg-zinc-50/60 ring-2 ring-[var(--hub-brand)]/15'
                      : 'border-zinc-100'
                  }`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-zinc-900">
                      Fase {milestone.phaseNumber} · {milestone.name}
                    </p>
                    <span
                      className={`ml-auto inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>
                    {normativeAtRisk.length > 0 && (
                      <span
                        className="inline-flex items-center gap-1 rounded-md border border-rose-200 bg-rose-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-rose-700"
                        title="Tareas normativas con retraso, bloqueo o urgencia"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                        Riesgo normativo ({normativeAtRisk.length})
                      </span>
                    )}
                    {normativeAtRisk.length === 0 && threatening.length > 0 && (
                      <span
                        className="inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700"
                        title="Una tarea complementaria amenaza preventivamente al hito"
                      >
                        <AlertTriangle size={11} />
                        Amenaza al hito ({threatening.length})
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-600">
                    {milestone.deliverableSummary}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Clock size={12} /> {formatDate(milestone.targetDate)}
                    </span>
                    {milestone.signOffRequired && (
                      <span className="rounded-md border border-[#f5d8c8] bg-[#fdf3ed] px-2 py-0.5 font-bold uppercase tracking-wide text-[#b85a2f]">
                        Requiere firma
                      </span>
                    )}

                    <div className="ml-auto flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSearchParams(
                            { tab: 'reporteador', milestone: milestone.id },
                            { replace: false },
                          )
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-700 transition-colors hover:bg-zinc-50 cursor-pointer"
                        title="Abrir matriz de monitoreo territorial vinculada a este hito"
                      >
                        <BarChart3 size={13} className="text-[var(--hub-brand)]" />
                        Monitoreo Territorial
                      </button>

                      <button
                        type="button"
                        onClick={() => openCreateForm(milestone.id, milestone.targetDate)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[var(--hub-brand)]/35 bg-[var(--hub-brand-soft,#fbf0ec)] px-3 text-xs font-bold text-[var(--hub-brand)] transition-colors hover:opacity-90 cursor-pointer"
                      >
                        <Plus size={13} strokeWidth={2.4} />
                        Crear tarea
                      </button>

                      {next && (
                        <button
                          type="button"
                          onClick={() =>
                            projectsService.updateMilestone(milestone.id, { status: next })
                          }
                          className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-xs font-bold text-white transition-colors hover:bg-brand cursor-pointer"
                        >
                          <Check size={13} />
                          {NEXT_LABEL[milestone.status as Exclude<MilestoneStatus, 'aprobado'>]}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Formulario rápido inline para crear una tarea amarrada a este hito */}
                  {isCreatingHere && (
                    <form
                      onSubmit={(e) => handleCreateLinkedTask(e, milestone)}
                      className="mt-3 rounded-xl border border-[var(--hub-brand)]/30 bg-zinc-50/90 p-3.5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-zinc-900">
                          Nueva tarea vinculada a Fase {milestone.phaseNumber} · {milestone.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => setCreatingForMilestoneId(null)}
                          className="rounded-lg p-1 text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 cursor-pointer"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
                        <div className="sm:col-span-2">
                          <label className="mb-1 block text-[11px] font-semibold text-zinc-600">
                            Título de la tarea *
                          </label>
                          <input
                            type="text"
                            required
                            value={taskTitle}
                            onChange={(e) => setTaskTitle(e.target.value)}
                            placeholder="Ej. Validar directorio de almacén UGEL Huancayo..."
                            className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none focus:border-[var(--hub-brand)]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-zinc-600">
                            UGEL / Ámbito territorial
                          </label>
                          <input
                            type="text"
                            value={taskScope}
                            onChange={(e) => setTaskScope(e.target.value)}
                            placeholder="Ej. UGEL Satipo"
                            className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none focus:border-[var(--hub-brand)]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-zinc-600">
                            Responsable / Gestor
                          </label>
                          <input
                            type="text"
                            value={taskAssignee}
                            onChange={(e) => setTaskAssignee(e.target.value)}
                            placeholder="Nombre del responsable"
                            className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-900 outline-none focus:border-[var(--hub-brand)]"
                          />
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-zinc-600">
                            Prioridad
                          </label>
                          <select
                            value={taskPriority}
                            onChange={(e) => setTaskPriority(e.target.value as WorkItemPriority)}
                            className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-900 outline-none focus:border-[var(--hub-brand)]"
                          >
                            <option value="URGENTE">Urgente</option>
                            <option value="ALTA">Alta</option>
                            <option value="MEDIA">Media</option>
                            <option value="BAJA">Baja</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-zinc-600">
                            Naturaleza
                          </label>
                          <select
                            value={taskNature}
                            onChange={(e) => setTaskNature(e.target.value as TaskNature)}
                            className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-900 outline-none focus:border-[var(--hub-brand)]"
                          >
                            <option value="obligacion_normativa">Obligación Normativa</option>
                            <option value="contingencia_operativa">Contingencia Operativa</option>
                            <option value="control_complementario">Control Complementario</option>
                          </select>
                        </div>
                        <div>
                          <label className="mb-1 block text-[11px] font-semibold text-zinc-600">
                            Fecha límite
                          </label>
                          <input
                            type="date"
                            value={taskDate}
                            onChange={(e) => setTaskDate(e.target.value)}
                            className="h-9 w-full rounded-lg border border-zinc-200 bg-white px-2.5 text-xs text-zinc-900 outline-none focus:border-[var(--hub-brand)]"
                          />
                        </div>
                        <div className="flex items-end justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setCreatingForMilestoneId(null)}
                            className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-600 hover:bg-zinc-50 cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="submit"
                            className="h-9 rounded-lg bg-[var(--hub-brand)] px-3.5 text-xs font-bold text-white hover:opacity-95 cursor-pointer"
                          >
                            Guardar tarea
                          </button>
                        </div>
                      </div>
                    </form>
                  )}

                  {/* Acordeón de tareas hijas vinculadas (Fase 10) */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : milestone.id)}
                    aria-expanded={expanded}
                    className="mt-3 flex w-full items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-left text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100 cursor-pointer"
                  >
                    <ChevronDown
                      size={14}
                      className={`shrink-0 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                    Tareas vinculadas
                    <span className="rounded-full bg-white px-2 py-0.5 tabular-nums text-[11px] text-zinc-500 shadow-sm">
                      {childTasks.length}
                    </span>
                  </button>
                  {expanded && (
                    <div className="mt-2 space-y-3">
                      {normativeTasks.length > 0 && (
                        <div>
                          <p className="mb-1.5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
                            Entregables Normativos
                            <span className="rounded-full bg-white px-2 py-0.5 tabular-nums text-[11px] text-zinc-500 shadow-sm">
                              {normativeTasks.length}
                            </span>
                          </p>
                          <ul className="space-y-2">
                            {normativeTasks.map((child) => (
                              <MilestoneChildRow
                                key={child.id}
                                child={child}
                                onOpenTask={onOpenTask}
                              />
                            ))}
                          </ul>
                        </div>
                      )}
                      {complementaryTasks.length > 0 && (
                        <div>
                          <p className="mb-1.5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
                            Controles Complementarios & Contingencias
                            <span className="rounded-full bg-white px-2 py-0.5 tabular-nums text-[11px] text-zinc-500 shadow-sm">
                              {complementaryTasks.length}
                            </span>
                          </p>
                          <ul className="space-y-2">
                            {complementaryTasks.map((child) => (
                              <MilestoneChildRow
                                key={child.id}
                                child={child}
                                onOpenTask={onOpenTask}
                              />
                            ))}
                          </ul>
                        </div>
                      )}
                      {childTasks.length === 0 && !isCreatingHere && (
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-dashed border-zinc-200 px-4 py-3 text-xs text-zinc-500">
                          <span>Sin tareas vinculadas a este hito todavía.</span>
                          <button
                            type="button"
                            onClick={() => openCreateForm(milestone.id, milestone.targetDate)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--hub-brand-soft,#fbf0ec)] px-3 py-1.5 text-xs font-bold text-[var(--hub-brand)] hover:opacity-90 cursor-pointer"
                          >
                            <Plus size={13} strokeWidth={2.4} />
                            Crear primera tarea en este hito
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

export default MilestonesTab
