import { useEffect, useState } from 'react'
import { AlertTriangle, Ban, Calendar, Check, Link2, ListChecks, Save, Trash2, User, X } from 'lucide-react'
import { useDismissOnEscapeOrOutside } from '@/hooks/useDismissOnEscapeOrOutside'
import { useProjectsDataset } from '@/hooks/useProjects'
import { projectsService } from '@/services/projectsService'
import {
  KANBAN_STATE_ORDER,
  TSHIRT_POINTS,
  WORK_ITEM_PRIORITY_META,
  WORK_ITEM_STATE_META,
  type TShirtSize,
  type WorkItemPriority,
  type WorkItemState,
} from '@/types/project.types'

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

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [criteriaText, setCriteriaText] = useState('')
  const [state, setState] = useState<WorkItemState>('backlog')
  const [priority, setPriority] = useState<WorkItemPriority>('MEDIA')
  const [assigneeName, setAssigneeName] = useState('')
  const [assigneeRole, setAssigneeRole] = useState('')
  const [storyPoints, setStoryPoints] = useState('')
  const [tShirtSize, setTShirtSize] = useState<TShirtSize | ''>('')
  const [durationDays, setDurationDays] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCritical, setIsCritical] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [blockerReason, setBlockerReason] = useState('')
  const [confirmDelete, setConfirmDelete] = useState(false)

  useEffect(() => {
    if (!task) return
    setTitle(task.title)
    setDescription(task.description ?? '')
    setCriteriaText((task.acceptanceCriteria ?? []).join('\n'))
    setState(task.state)
    setPriority(task.priority)
    setAssigneeName(task.assignee.name)
    setAssigneeRole(task.assignee.role)
    setStoryPoints(task.storyPoints !== undefined ? String(task.storyPoints) : '')
    setTShirtSize(task.tShirtSize ?? '')
    setDurationDays(task.durationDays !== undefined ? String(task.durationDays) : '')
    setStartDate(task.startDate ?? '')
    setEndDate(task.endDate ?? '')
    setIsCritical(Boolean(task.isCriticalPath))
    setIsBlocked(Boolean(task.isBlocked))
    setBlockerReason(task.blockerReason ?? '')
    setConfirmDelete(false)
  }, [task])

  if (!task) return null

  const priorityMeta = WORK_ITEM_PRIORITY_META[priority]
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
    assigneeName.trim() !== task.assignee.name ||
    assigneeRole.trim() !== task.assignee.role ||
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
      assignee: { name: assigneeName.trim(), role: assigneeRole.trim() || task.assignee.role },
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
