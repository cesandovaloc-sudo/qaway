import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { AlertTriangle, Check, ChevronDown, Clock, Flag, MessageCircle } from 'lucide-react'
import { useProjectsDataset } from '@/hooks/useProjects'
import { projectsService } from '@/services/projectsService'
import {
  FOLLOW_UP_META,
  MILESTONE_STATUS_META,
  WORK_ITEM_STATE_META,
  type MilestoneStatus,
  type WorkItem,
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
  const [searchParams] = useSearchParams()
  const milestoneParam = searchParams.get('milestone')
  const [expandedId, setExpandedId] = useState<string | null>(milestoneParam)

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

  const approved = milestones.filter((milestone) => milestone.status === 'aprobado').length
  const progress =
    milestones.length > 0 ? Math.round((approved / milestones.length) * 100) : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold text-zinc-900">
            <Flag size={15} className="text-zinc-400" />
            <span>Subprocesos & Hitos · {project?.name ?? 'Proyecto'}</span>
            {project && (
              <span className="rounded-md bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-semibold text-zinc-700">
                {project.code}
              </span>
            )}
          </h3>
          <p className="text-xs text-zinc-500">
            {approved} de {milestones.length} subprocesos/fases aprobadas en este proyecto
          </p>
        </div>
        <div className="ml-auto flex min-w-[200px] items-center gap-2.5">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-[var(--hub-brand)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-zinc-700">{progress}%</span>
        </div>
      </div>

      {milestones.length === 0 ? (
        <p className="px-5 py-14 text-center text-sm text-zinc-400">
          Este proyecto aún no tiene hitos definidos.
        </p>
      ) : (
        <ol className="relative space-y-0 px-5 py-5">
          {milestones.map((milestone, index) => {
            const meta = MILESTONE_STATUS_META[milestone.status]
            const next = NEXT_STATUS[milestone.status]
            const isLast = index === milestones.length - 1
            const childTasks = dataset.workItems.filter(
              (item) => item.milestoneId === milestone.id,
            )
            // Fase 2 (A35): las complementarias no afectan la salud del hito salvo
            // amenaza explícita; las legacy sin naturaleza cuentan como normativas.
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
                    {next && (
                      <button
                        type="button"
                        onClick={() => projectsService.updateMilestone(milestone.id, { status: next })}
                        className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-xs font-bold text-white transition-colors hover:bg-brand"
                      >
                        <Check size={13} />
                        {NEXT_LABEL[milestone.status as Exclude<MilestoneStatus, 'aprobado'>]}
                      </button>
                    )}
                  </div>

                  {/* Acordeón de tareas hijas vinculadas (Fase 10) */}
                  <button
                    type="button"
                    onClick={() => setExpandedId(expanded ? null : milestone.id)}
                    aria-expanded={expanded}
                    className="mt-3 flex w-full items-center gap-2 rounded-xl bg-zinc-50 px-3 py-2 text-left text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-100"
                  >
                    <ChevronDown
                      size={14}
                      className={`shrink-0 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
                    />
                    Tareas vinculadas
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-zinc-500 shadow-sm">
                      {childTasks.length}
                    </span>
                  </button>
                  {expanded && (
                    <div className="mt-2 space-y-3">
                      {normativeTasks.length > 0 && (
                        <div>
                          <p className="mb-1.5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
                            Entregables Normativos
                            <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-zinc-500 shadow-sm">
                              {normativeTasks.length}
                            </span>
                          </p>
                          <ul className="space-y-2">
                            {normativeTasks.map((child) => (
                              <MilestoneChildRow key={child.id} child={child} onOpenTask={onOpenTask} />
                            ))}
                          </ul>
                        </div>
                      )}
                      {complementaryTasks.length > 0 && (
                        <div>
                          <p className="mb-1.5 flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wider text-zinc-500">
                            Controles Complementarios
                            <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[11px] text-zinc-500 shadow-sm">
                              {complementaryTasks.length}
                            </span>
                          </p>
                          <ul className="space-y-2">
                            {complementaryTasks.map((child) => (
                              <MilestoneChildRow key={child.id} child={child} onOpenTask={onOpenTask} />
                            ))}
                          </ul>
                        </div>
                      )}
                      {childTasks.length === 0 && (
                        <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-4 text-center text-[11px] text-zinc-400">
                          Sin tareas vinculadas a este hito.
                        </p>
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
