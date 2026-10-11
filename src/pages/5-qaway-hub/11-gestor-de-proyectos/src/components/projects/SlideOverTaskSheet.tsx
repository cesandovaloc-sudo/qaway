import { useEffect, useState } from 'react'
import {
  AlertTriangle,
  Ban,
  Calendar,
  CalendarClock,
  Check,
  CheckCircle2,
  FileText,
  Link2,
  ListChecks,
  Mail,
  MapPin,
  MessageCircle,
  Plus,
  Save,
  Trash2,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useDismissOnEscapeOrOutside } from '@/hooks/useDismissOnEscapeOrOutside'
import { useProjectsDataset } from '@/hooks/useProjects'
import { useProjectPerspective } from '../../context/ProjectPerspectiveContext'
import { projectsService } from '@/services/projectsService'
import {
  FOLLOW_UP_META,
  KANBAN_STATE_ORDER,
  TSHIRT_POINTS,
  WORK_ITEM_PRIORITY_META,
  WORK_ITEM_STATE_META,
  type TaskOriginType,
  type TaskResponseStatus,
  type TShirtSize,
  type WorkItemAssignee,
  type WorkItemPriority,
  type WorkItemState,
} from '@/types/project.types'
import {
  buildFollowUpMessage,
  buildMailtoUrl,
  buildWhatsAppUrl,
  formatFollowUpDate,
  getFollowUpStatus,
} from '@/utils/followUp'

// ─────────────────────────────────────────────────────────────────────────
// SlideOverTaskSheet.tsx — Ver y editar tareas al hacer clic (Task 4.3)
// Panel lateral que lee la tarea del store reactivo; guarda, cambia estado,
// gestiona dependencias FS y permite eliminar.
// ─────────────────────────────────────────────────────────────────────────

interface SlideOverTaskSheetProps {
  taskId: string | null
  onClose: () => void
  onOpenTask: (taskId: string) => void
}

const inputClass =
  'w-full h-10 px-3 rounded-lg border border-zinc-200 bg-white text-sm text-zinc-900 outline-none transition-all focus:border-brand focus:ring-2 focus:ring-brand/15'
const labelClass = 'text-xs font-semibold text-zinc-600 mb-1.5 block'

const PRIORITIES: WorkItemPriority[] = ['URGENTE', 'ALTA', 'MEDIA', 'BAJA']
const SHIRT_SIZES: TShirtSize[] = ['XS', 'S', 'M', 'L', 'XL']

export function SlideOverTaskSheet({ taskId, onClose, onOpenTask }: SlideOverTaskSheetProps) {
  const dataset = useProjectsDataset()
  const task = taskId ? dataset.workItems.find((item) => item.id === taskId) : undefined
  const panelRef = useDismissOnEscapeOrOutside(taskId !== null, onClose)
  const { currentPersona, isCoordinador, isSuperAdmin } = useProjectPerspective()
  const canManageChecklist = isCoordinador || isSuperAdmin

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [criteriaText, setCriteriaText] = useState('')
  const [state, setState] = useState<WorkItemState>('backlog')
  const [priority, setPriority] = useState<WorkItemPriority>('MEDIA')
  const [originType, setOriginType] = useState<TaskOriginType>('accion_emergente')
  const [milestoneRef, setMilestoneRef] = useState('')
  const [responseStatus, setResponseStatus] = useState<TaskResponseStatus>('sin_notificar')
  const [lastResponseNote, setLastResponseNote] = useState('')
  const [coAssigneeName, setCoAssigneeName] = useState('')
  const [coAssigneeRole, setCoAssigneeRole] = useState('')
  const [multiAssignees, setMultiAssignees] = useState<WorkItemAssignee[]>([])
  const [milestoneId, setMilestoneId] = useState('')
  const [followUpDate, setFollowUpDate] = useState('')
  const [scopeTag, setScopeTag] = useState('')
  const [assigneeName, setAssigneeName] = useState('')
  const [assigneeRole, setAssigneeRole] = useState('')
  const [assigneePhone, setAssigneePhone] = useState('')
  const [assigneeEmail, setAssigneeEmail] = useState('')
  const [storyPoints, setStoryPoints] = useState('')
  const [tShirtSize, setTShirtSize] = useState<TShirtSize | ''>('')
  const [durationDays, setDurationDays] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCritical, setIsCritical] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockerReason, setBlockerReason] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [checkDraft, setCheckDraft] = useState('')

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description ?? '')
    setCriteriaText((task.acceptanceCriteria ?? []).join('\n'))
    setState(task.state)
    setPriority(task.priority)
    setOriginType(task.originType ?? (task.milestoneId ? 'oficial_oficio' : 'accion_emergente'))
    setMilestoneRef(task.milestoneRef ?? '')
    setResponseStatus(task.gestorFeedback?.responseStatus ?? 'sin_notificar')
    setLastResponseNote(task.gestorFeedback?.lastResponseNote ?? '')
    setMultiAssignees(task.multiAssignees ?? [])
    setCoAssigneeName('')
    setCoAssigneeRole('')
    setMilestoneId(task.milestoneId ?? '')
    setFollowUpDate(task.followUpDate ?? '')
    setScopeTag(task.scopeTag ?? '')
    setAssigneeName(task.assignee.name)
    setAssigneeRole(task.assignee.role)
    setAssigneePhone(task.assignee.phone ?? '')
    setAssigneeEmail(task.assignee.email ?? '')
    setStoryPoints(task.storyPoints !== undefined ? String(task.storyPoints) : '')
    setTShirtSize(task.tShirtSize ?? '')
    setDurationDays(task.durationDays !== undefined ? String(task.durationDays) : '')
    setStartDate(task.startDate ?? '')
    setEndDate(task.endDate ?? '')
    setIsCritical(Boolean(task.isCriticalPath))
    setIsBlocked(Boolean(task.isBlocked))
    setBlockerReason(task.blockerReason ?? '')
    setConfirmDelete(false)
    setCheckDraft('')
  }, [task])

  if (!task) return null

  const priorityMeta = WORK_ITEM_PRIORITY_META[priority]
  const checklist = task.checklist ?? []
  const checksDone = checklist.filter((sub) => sub.completed).length
  const projectMilestones = dataset.milestones
    .filter((milestone) => milestone.projectId === task.projectId)
    .sort((a, b) => a.phaseNumber - b.phaseNumber)
  const scopeOptions = [
    ...new Set(
      dataset.workItems
        .filter((item) => item.projectId === task.projectId && item.scopeTag)
        .map((item) => item.scopeTag as string),
    ),
  ]
  const followMeta = FOLLOW_UP_META[getFollowUpStatus(followUpDate, state)]
  const draftContact = {
    gestor: assigneeName.trim() || task.assignee.name,
    ugel: scopeTag.trim() || 'ámbito por definir',
    titulo: title.trim() || task.title,
    fecha: formatFollowUpDate(followUpDate),
    bloqueada: isBlocked,
    motivoBloqueo: blockerReason.trim() || undefined,
  }
  const waUrl = buildWhatsAppUrl(assigneePhone, buildFollowUpMessage(draftContact))
  const mailUrl = buildMailtoUrl(assigneeEmail, draftContact)
  const criteria = criteriaText
    .split('\n')
    .map((line) => line.trim().replace(/^[-•\d.)\s]+/, ''))
    .filter((line) => line !== '')
  const dirty =
    title.trim() !== task.title ||
    description.trim() !== (task.description ?? '') ||
    criteria.join('\n') !== (task.acceptanceCriteria ?? []).join('\n') ||
    state !== task.state ||
    priority !== task.priority ||
    originType !== (task.originType ?? (task.milestoneId ? 'oficial_oficio' : 'accion_emergente')) ||
    milestoneRef.trim() !== (task.milestoneRef ?? '') ||
    responseStatus !== (task.gestorFeedback?.responseStatus ?? 'sin_notificar') ||
    lastResponseNote.trim() !== (task.gestorFeedback?.lastResponseNote ?? '') ||
    JSON.stringify(multiAssignees) !== JSON.stringify(task.multiAssignees ?? []) ||
    milestoneId !== (task.milestoneId ?? '') ||
    followUpDate !== (task.followUpDate ?? '') ||
    scopeTag.trim() !== (task.scopeTag ?? '') ||
    assigneeName.trim() !== task.assignee.name ||
    assigneeRole.trim() !== task.assignee.role ||
    assigneePhone.trim() !== (task.assignee.phone ?? '') ||
    assigneeEmail.trim() !== (task.assignee.email ?? '') ||
    storyPoints !== (task.storyPoints !== undefined ? String(task.storyPoints) : '') ||
    tShirtSize !== (task.tShirtSize ?? '') ||
    durationDays !== (task.durationDays !== undefined ? String(task.durationDays) : '') ||
    startDate !== (task.startDate ?? '') ||
    endDate !== (task.endDate ?? '') ||
    isCritical !== Boolean(task.isCriticalPath) ||
    isBlocked !== Boolean(task.isBlocked) ||
    blockerReason.trim() !== (task.blockerReason ?? '')

  const handleSave = () => {
    if (!title.trim() || !assigneeName.trim()) return
    const points = storyPoints.trim() === '' ? undefined : Math.max(0, Number(storyPoints))
    const duration = durationDays.trim() === '' ? undefined : Math.max(0, Number(durationDays))
    projectsService.updateWorkItem(task.id, {
      title: title.trim(),
      description: description.trim() || undefined,
      acceptanceCriteria: criteria.length > 0 ? criteria : undefined,
      state,
      priority,
      originType,
      milestoneRef: milestoneRef.trim() || undefined,
      multiAssignees: multiAssignees.length > 0 ? multiAssignees : undefined,
      gestorFeedback: {
        responseStatus,
        lastResponseNote: lastResponseNote.trim() || undefined,
        respondedAt:
          responseStatus === 'respondido'
            ? task.gestorFeedback?.respondedAt || new Date().toISOString()
            : undefined,
        respondedBy: responseStatus === 'respondido' ? assigneeName.trim() : undefined,
      },
      milestoneId: milestoneId || undefined,
      followUpDate: followUpDate || undefined,
      scopeTag: scopeTag.trim() || undefined,
      assignee: {
        name: assigneeName.trim(),
        role: assigneeRole.trim() || task.assignee.role,
        phone: assigneePhone.trim() || undefined,
        email: assigneeEmail.trim() || undefined,
      },
      storyPoints: points,
      tShirtSize: tShirtSize || undefined,
      durationDays: duration,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      isCriticalPath: isCritical || undefined,
      isBlocked: isBlocked || undefined,
      blockerReason: isBlocked ? blockerReason.trim() || 'Bloqueo reportado por el equipo.' : task.blockerReason,
    })
    onClose()
  }

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true)
      return
    }
    projectsService.deleteWorkItem(task.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-[70] flex justify-end bg-zinc-950/50 backdrop-blur-[2px]">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Tarea ${task.id}`}
        className="flex h-full w-full max-w-md flex-col border-l border-zinc-200 bg-white shadow-[-20px_0_60px_rgba(0,0,0,0.2)]"
        style={{ animation: 'gp-sheet-in .28s cubic-bezier(0.16, 1, 0.3, 1)' }}
      >
        <style>{`@keyframes gp-sheet-in{from{opacity:.4;transform:translateX(48px)}to{opacity:1;transform:none}}`}</style>

        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-zinc-100 px-5 py-4">
          <div className="min-w-0">
            <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              {task.id}
            </p>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Título de la tarea"
              className="mt-1 w-full bg-transparent text-lg font-bold tracking-tight text-zinc-900 outline-none placeholder:text-zinc-300 focus:border-b focus:border-brand"
            />
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar detalle"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="gp-task-state">Estado</label>
              <select
                id="gp-task-state"
                value={state}
                onChange={(event) => setState(event.target.value as WorkItemState)}
                className={inputClass}
              >
                {KANBAN_STATE_ORDER.map((option) => (
                  <option key={option} value={option}>
                    {WORK_ITEM_STATE_META[option].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} htmlFor="gp-task-priority">Prioridad</label>
              <select
                id="gp-task-priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value as WorkItemPriority)}
                className={inputClass}
              >
                {PRIORITIES.map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>

          <div
            className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-semibold ${priorityMeta.badgeClass}`}
          >
            <AlertTriangle size={14} />
            Prioridad {priority}
            {isCritical && <span className="ml-auto uppercase tracking-wide">· Ruta crítica</span>}
          </div>

          {/* Vinculación territorial MINEDU & Coordinación de Campo (Fase 10/11) */}
          <div className="space-y-3 rounded-xl border border-sky-200 bg-sky-50/50 p-3.5">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-sky-800">
                <MapPin size={12} /> Coordinación Territorial & Hitos
              </p>
              {originType === 'oficial_oficio' ? (
                <span className="inline-flex items-center gap-1 rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-700">
                  <FileText size={10} /> Oficial OM 032
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-800">
                  <Zap size={10} /> Acción Táctica
                </span>
              )}
            </div>

            {/* Clasificación de origen */}
            <div>
              <span className={labelClass}>Tipo de tarea</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setOriginType('oficial_oficio')}
                  className={`flex-1 rounded-lg border py-1.5 px-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    originType === 'oficial_oficio'
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-500/15'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <FileText size={13} className={originType === 'oficial_oficio' ? 'text-indigo-600' : 'text-zinc-400'} />
                  Oficial OM 032
                </button>
                <button
                  type="button"
                  onClick={() => setOriginType('accion_emergente')}
                  className={`flex-1 rounded-lg border py-1.5 px-2.5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 ${
                    originType === 'accion_emergente'
                      ? 'border-amber-600 bg-amber-50 text-amber-800 ring-2 ring-amber-500/15'
                      : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <Zap size={13} className={originType === 'accion_emergente' ? 'text-amber-600' : 'text-zinc-400'} />
                  Acción Táctica
                </button>
              </div>
              {originType === 'oficial_oficio' && (
                <input
                  value={milestoneRef}
                  onChange={(e) => setMilestoneRef(e.target.value)}
                  placeholder="Referencia: ej. OM 032 · Hito 3"
                  className={`${inputClass} mt-2 text-xs`}
                />
              )}
            </div>

            <div>
              <label className={labelClass} htmlFor="gp-task-milestone">Hito rector asociado</label>
              <select
                id="gp-task-milestone"
                value={milestoneId}
                onChange={(event) => setMilestoneId(event.target.value)}
                className={inputClass}
              >
                <option value="">Sin hito asociado</option>
                {projectMilestones.map((milestone) => (
                  <option key={milestone.id} value={milestone.id}>
                    Fase {milestone.phaseNumber} · {milestone.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass} htmlFor="gp-task-followup">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock size={12} /> Fecha de seguimiento
                  </span>
                </label>
                <input
                  id="gp-task-followup"
                  type="date"
                  value={followUpDate}
                  onChange={(event) => setFollowUpDate(event.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass} htmlFor="gp-task-scope">UGEL / Ámbito</label>
                <input
                  id="gp-task-scope"
                  value={scopeTag}
                  onChange={(event) => setScopeTag(event.target.value)}
                  placeholder="UGEL Huancavelica"
                  list="gp-scope-options"
                  className={inputClass}
                />
                <datalist id="gp-scope-options">
                  {scopeOptions.map((option) => (
                    <option key={option} value={option} />
                  ))}
                </datalist>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-1 text-[10px] font-extrabold uppercase tracking-wide ${followMeta.badgeClass}`}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: followMeta.color }} />
                {followMeta.label}
                {followUpDate ? ` · ${formatFollowUpDate(followUpDate)}` : ''}
              </span>
              {waUrl ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => projectsService.recordNotificationSent(task.id, 'whatsapp')}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25d366] px-3 text-xs font-extrabold text-white shadow-sm transition-transform hover:scale-[1.02] sm:flex-none sm:px-4"
                >
                  <MessageCircle size={14} /> WhatsApp
                </a>
              ) : (
                <span
                  title="Registra el teléfono del gestor para activar WhatsApp"
                  className="inline-flex h-9 flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-zinc-100 px-3 text-xs font-bold text-zinc-400 sm:flex-none sm:px-4"
                >
                  <MessageCircle size={14} /> WhatsApp
                </span>
              )}
              {mailUrl ? (
                <a
                  href={mailUrl}
                  onClick={() => projectsService.recordNotificationSent(task.id, 'email')}
                  className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-xs font-extrabold text-white transition-colors hover:bg-brand sm:flex-none sm:px-4"
                >
                  <Mail size={14} /> Correo
                </a>
              ) : (
                <span
                  title="Registra el correo del gestor para activar el contacto"
                  className="inline-flex h-9 flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg bg-zinc-100 px-3 text-xs font-bold text-zinc-400 sm:flex-none sm:px-4"
                >
                  <Mail size={14} /> Correo
                </span>
              )}
            </div>

            {/* Evidencia de contacto registrada */}
            {(task.notificationAudit?.whatsappSentAt || task.notificationAudit?.emailSentAt) && (
              <div className="rounded-lg border border-sky-200 bg-white p-2.5 text-[10px] text-zinc-600 space-y-1">
                <span className="font-extrabold uppercase tracking-wide text-zinc-400 block">
                  Evidencia de Contacto Registrada
                </span>
                {task.notificationAudit.whatsappSentAt && (
                  <p className="flex items-center gap-1.5 text-emerald-700 font-bold">
                    <MessageCircle size={11} className="text-[#25d366]" />
                    WhatsApp: {new Date(task.notificationAudit.whatsappSentAt).toLocaleString()} ({task.notificationAudit.whatsappSentBy || 'Coordinador'})
                  </p>
                )}
                {task.notificationAudit.emailSentAt && (
                  <p className="flex items-center gap-1.5 text-sky-700 font-bold">
                    <Mail size={11} className="text-sky-600" />
                    Correo: {new Date(task.notificationAudit.emailSentAt).toLocaleString()} ({task.notificationAudit.emailSentBy || 'Coordinador'})
                  </p>
                )}
              </div>
            )}

            {/* Reporte & Descargo de campo del gestor */}
            <div className="rounded-lg border border-zinc-200 bg-white p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                  <CheckCircle2 size={13} className={responseStatus === 'respondido' ? 'text-emerald-600' : 'text-zinc-400'} />
                  Reporte & Descargo del Gestor
                </span>
                {task.gestorFeedback?.respondedAt && (
                  <span className="font-mono text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    Respondido {new Date(task.gestorFeedback.respondedAt).toLocaleDateString()}
                  </span>
                )}
              </div>

              <div className="flex gap-1.5">
                {(['sin_notificar', 'esperando_respuesta', 'respondido'] as TaskResponseStatus[]).map((status) => {
                  const active = responseStatus === status
                  const labels: Record<TaskResponseStatus, string> = {
                    sin_notificar: 'Sin notificar',
                    esperando_respuesta: 'Esperando respuesta',
                    respondido: 'Respondido',
                  }
                  const activeClasses: Record<TaskResponseStatus, string> = {
                    sin_notificar: 'bg-zinc-800 text-white border-zinc-800',
                    esperando_respuesta: 'bg-amber-500 text-white border-amber-500',
                    respondido: 'bg-emerald-600 text-white border-emerald-600',
                  }
                  return (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setResponseStatus(status)}
                      className={`flex-1 rounded-md border py-1 text-[10px] font-extrabold transition-colors ${
                        active
                          ? activeClasses[status]
                          : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                      }`}
                    >
                      <span className="inline-flex items-center justify-center gap-1">
                        {status === 'respondido' && <Check size={10} />}
                        {labels[status]}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div>
                <label className="text-[11px] font-semibold text-zinc-500 mb-1 block" htmlFor="gp-task-response-note">
                  Minuta de descargo / acuerdos en campo
                </label>
                <textarea
                  id="gp-task-response-note"
                  rows={2}
                  value={lastResponseNote}
                  onChange={(e) => setLastResponseNote(e.target.value)}
                  placeholder="ej. Acta de recepción suscrita con el director de UGEL, padrón validado sin observaciones..."
                  className={`${inputClass} h-auto resize-none py-2 text-xs`}
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelClass} htmlFor="gp-task-desc">Descripción</label>
            <textarea
              id="gp-task-desc"
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Contexto, criterios de aceptación…"
              className={`${inputClass} h-auto resize-none py-2.5`}
            />
          </div>

          <div>
            <label className={labelClass} htmlFor="gp-task-criteria">
              <span className="inline-flex items-center gap-1">
                <ListChecks size={12} /> Criterios de aceptación ({criteria.length})
              </span>
            </label>
            <textarea
              id="gp-task-criteria"
              rows={3}
              value={criteriaText}
              onChange={(event) => setCriteriaText(event.target.value)}
              placeholder={'Un criterio por línea…\nEj: Login con Google y GitHub'}
              className={`${inputClass} h-auto resize-none py-2.5 font-mono text-[13px]`}
            />
          </div>

          {/* Subetapas operativas verificables (Fase 4 A37) */}
          <div>
            <span className={labelClass}>
              <span className="inline-flex items-center gap-1">
                <ListChecks size={12} /> Subetapas operativas ({checksDone}/{checklist.length})
              </span>
            </span>
            {checklist.length > 0 && (
              <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-300"
                  style={{
                    width: `${checklist.length > 0 ? Math.round((checksDone / checklist.length) * 100) : 0}%`,
                  }}
                />
              </div>
            )}
            {checklist.length === 0 ? (
              <p className="rounded-lg border border-dashed border-zinc-200 px-3 py-3 text-center text-[11px] text-zinc-400">
                Sin subetapas. La coordinación puede añadir pasos verificables.
              </p>
            ) : (
              <ul className="space-y-1.5">
                {checklist.map((sub) => (
                  <li
                    key={sub.id}
                    className="flex items-start gap-2 rounded-lg border border-zinc-200 px-2.5 py-2"
                  >
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() =>
                        projectsService.toggleTaskChecklistItem(
                          task.id,
                          sub.id,
                          currentPersona.name,
                        )
                      }
                      aria-label={`Marcar: ${sub.title}`}
                      style={{ accentColor: 'var(--hub-brand)' }}
                      className="mt-0.5 h-4 w-4 shrink-0"
                    />
                    <span className="min-w-0 flex-1">
                      <span
                        className={`block text-[13px] font-medium leading-snug ${
                          sub.completed ? 'text-zinc-400 line-through' : 'text-zinc-800'
                        }`}
                      >
                        {sub.title}
                      </span>
                      {sub.completed && (sub.completedBy || sub.completedAt) && (
                        <span className="mt-0.5 flex items-center gap-1 text-[11px] text-zinc-400">
                          <Check size={11} className="shrink-0" />
                          {sub.completedBy ?? 'Equipo'}
                          {sub.completedAt ? ` · ${formatFollowUpDate(sub.completedAt)}` : ''}
                        </span>
                      )}
                    </span>
                    {canManageChecklist && (
                      <button
                        type="button"
                        onClick={() => projectsService.deleteTaskChecklistItem(task.id, sub.id)}
                        aria-label={`Eliminar: ${sub.title}`}
                        title="Eliminar subetapa"
                        className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-zinc-300 transition-colors hover:bg-rose-50 hover:text-rose-600"
                      >
                        <X size={12} />
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
            {canManageChecklist ? (
              <div className="mt-2 flex items-center gap-1.5">
                <input
                  value={checkDraft}
                  onChange={(event) => setCheckDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && checkDraft.trim()) {
                      projectsService.addTaskChecklistItem(task.id, checkDraft)
                      setCheckDraft('')
                    }
                  }}
                  placeholder="+ Añadir subetapa verificable"
                  aria-label="Añadir subetapa"
                  className="h-9 min-w-0 flex-1 rounded-lg border border-zinc-200 bg-white px-3 text-xs text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-brand"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!checkDraft.trim()) return
                    projectsService.addTaskChecklistItem(task.id, checkDraft)
                    setCheckDraft('')
                  }}
                  disabled={!checkDraft.trim()}
                  aria-label="Crear subetapa"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-900 text-white transition-colors hover:bg-brand disabled:opacity-40"
                >
                  <Plus size={15} />
                </button>
              </div>
            ) : (
              <p className="mt-2 text-[11px] text-zinc-400">
                Marca los pasos al completarlos. Solo coordinación añade subetapas.
              </p>
            )}
          </div>

          <div>
            <span className={labelClass}>Talla de estimación</span>
            <div className="flex gap-1.5" role="group" aria-label="Talla de estimación">
              {SHIRT_SIZES.map((size) => {
                const selected = tShirtSize === size
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setTShirtSize(selected ? '' : size)}
                    title={`${size} ≈ ${TSHIRT_POINTS[size]} pts`}
                    aria-pressed={selected}
                    className={`h-10 flex-1 rounded-lg border font-mono text-sm font-extrabold transition-colors ${
                      selected
                        ? 'border-zinc-900 bg-zinc-900 text-white'
                        : 'border-zinc-200 bg-white text-zinc-500 hover:border-zinc-400'
                    }`}
                  >
                    {size}
                  </button>
                )
              })}
            </div>
            <p className="mt-1 text-[11px] text-zinc-400">
              {tShirtSize
                ? `${tShirtSize} ≈ ${TSHIRT_POINTS[tShirtSize]} story points`
                : 'Sin talla asignada'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="gp-task-assignee">
                <span className="inline-flex items-center gap-1"><User size={12} /> Responsable</span>
              </label>
              <input
                id="gp-task-assignee"
                value={assigneeName}
                onChange={(event) => setAssigneeName(event.target.value)}
                placeholder="Nombre"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="gp-task-role">Rol</label>
              <input
                id="gp-task-role"
                value={assigneeRole}
                onChange={(event) => setAssigneeRole(event.target.value)}
                placeholder="Rol"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="gp-task-phone">Teléfono / WhatsApp</label>
              <input
                id="gp-task-phone"
                value={assigneePhone}
                onChange={(event) => setAssigneePhone(event.target.value)}
                placeholder="+51987654321"
                inputMode="tel"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="gp-task-email">Correo institucional</label>
              <input
                id="gp-task-email"
                value={assigneeEmail}
                onChange={(event) => setAssigneeEmail(event.target.value)}
                placeholder="gestor@minedu.gob.pe"
                inputMode="email"
                className={inputClass}
              />
            </div>
          </div>

          {/* Co-Responsables Territoriales */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-3 space-y-2">
            <span className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <Users size={13} className="text-brand" />
              Co-Responsables Territoriales ({multiAssignees.length})
            </span>

            {multiAssignees.length > 0 && (
              <div className="space-y-1.5">
                {multiAssignees.map((co, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-2.5 py-1.5 text-xs"
                  >
                    <div>
                      <p className="font-bold text-zinc-800">{co.name}</p>
                      <p className="text-[10px] text-zinc-400">{co.role}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMultiAssignees((prev) => prev.filter((_, i) => i !== idx))}
                      className="rounded p-1 text-zinc-400 hover:bg-rose-50 hover:text-rose-600"
                      title="Remover co-responsable"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2 pt-1">
              <input
                value={coAssigneeName}
                onChange={(e) => setCoAssigneeName(e.target.value)}
                placeholder="Nombre de co-gestor..."
                className="h-8 flex-1 rounded-md border border-zinc-200 bg-white px-2.5 text-xs outline-none focus:border-brand"
              />
              <input
                value={coAssigneeRole}
                onChange={(e) => setCoAssigneeRole(e.target.value)}
                placeholder="Rol..."
                className="h-8 w-28 rounded-md border border-zinc-200 bg-white px-2.5 text-xs outline-none focus:border-brand"
              />
              <button
                type="button"
                disabled={!coAssigneeName.trim()}
                onClick={() => {
                  if (!coAssigneeName.trim()) return
                  setMultiAssignees((prev) => [
                    ...prev,
                    { name: coAssigneeName.trim(), role: coAssigneeRole.trim() || 'Co-Gestor' },
                  ])
                  setCoAssigneeName('')
                  setCoAssigneeRole('')
                }}
                className="h-8 rounded-md bg-zinc-900 px-3 text-xs font-bold text-white hover:bg-brand disabled:opacity-40"
              >
                + Añadir
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="gp-task-points">Story points</label>
              <input
                id="gp-task-points"
                type="number"
                min={0}
                value={storyPoints}
                onChange={(event) => setStoryPoints(event.target.value)}
                placeholder="—"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="gp-task-duration">Duración (días P6)</label>
              <input
                id="gp-task-duration"
                type="number"
                min={0}
                value={durationDays}
                onChange={(event) => setDurationDays(event.target.value)}
                placeholder="—"
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className={labelClass} htmlFor="gp-task-start">
                <span className="inline-flex items-center gap-1"><Calendar size={12} /> Inicio</span>
              </label>
              <input
                id="gp-task-start"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass} htmlFor="gp-task-end">Fin</label>
              <input
                id="gp-task-end"
                type="date"
                min={startDate || undefined}
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className={inputClass}
              />
            </div>
          </div>

          <label className="flex cursor-pointer items-center gap-2.5 rounded-lg border border-zinc-200 px-3 py-2.5 text-sm font-medium text-zinc-700">
            <input
              type="checkbox"
              checked={isCritical}
              onChange={(event) => setIsCritical(event.target.checked)}
              className="h-4 w-4 accent-[#e11d48]"
            />
            Parte de la ruta crítica (CPM)
          </label>

          <div
            className={`rounded-lg border px-3 py-2.5 transition-colors ${
              isBlocked ? 'border-rose-300 bg-rose-50/60' : 'border-zinc-200'
            }`}
          >
            <label className="flex cursor-pointer items-center gap-2.5 text-sm font-bold text-zinc-700">
              <input
                type="checkbox"
                checked={isBlocked}
                onChange={(event) => setIsBlocked(event.target.checked)}
                className="h-4 w-4 accent-[#e11d48]"
              />
              <Ban size={14} className={isBlocked ? 'text-rose-600' : 'text-zinc-400'} />
              Tarea bloqueada
              <button
                type="button"
                onClick={() => projectsService.toggleBlockWorkItem(task.id)}
                title="Alternar bloqueo al instante"
                className="ml-auto text-[11px] font-bold text-zinc-400 hover:text-brand"
              >
                toggle rápido
              </button>
            </label>
            {isBlocked && (
              <input
                value={blockerReason}
                onChange={(event) => setBlockerReason(event.target.value)}
                placeholder="Motivo del bloqueo…"
                aria-label="Motivo del bloqueo"
                className={`${inputClass} mt-2 border-rose-200 focus:border-rose-400 focus:ring-rose-100`}
              />
            )}
          </div>

          {task.predecessors && task.predecessors.length > 0 && (
            <div>
              <span className={labelClass}>
                <span className="inline-flex items-center gap-1"><Link2 size={12} /> Dependencias FS</span>
              </span>
              <div className="flex flex-wrap gap-2">
                {task.predecessors.map((predecessorId) => {
                  const predecessor = dataset.workItems.find((item) => item.id === predecessorId)
                  return (
                    <button
                      key={predecessorId}
                      type="button"
                      onClick={() => onOpenTask(predecessorId)}
                      title={predecessor ? predecessor.title : predecessorId}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1.5 font-mono text-[11px] font-bold text-zinc-600 transition-colors hover:border-brand hover:text-brand"
                    >
                      {predecessor && predecessor.state === 'done' ? (
                        <Check size={12} className="text-emerald-600" />
                      ) : (
                        <Link2 size={12} />
                      )}
                      {predecessorId}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-zinc-100 px-5 py-4">
          <button
            type="button"
            onClick={handleDelete}
            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors ${
              confirmDelete
                ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
                : 'border-zinc-200 bg-white text-zinc-500 hover:bg-zinc-50 hover:text-rose-600'
            }`}
          >
            <Trash2 size={15} />
            {confirmDelete ? 'Confirmar' : 'Eliminar'}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty || !title.trim() || !assigneeName.trim()}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white shadow-[0_2px_8px_rgba(255,75,11,0.28)] transition-colors hover:bg-brand-hover disabled:opacity-50"
          >
            <Save size={15} />
            Guardar
          </button>
        </div>
      </div>
    </div>
  )
}

export default SlideOverTaskSheet
