import { useMemo, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { useProjectsDataset } from '@/hooks/useProjects'
import { useProjectPerspective } from '../../../context/ProjectPerspectiveContext'
import { projectsService } from '@/services/projectsService'
import {
  TASK_NATURE_META,
  type Milestone,
  type TaskNature,
  type WorkItem,
} from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// CalendarTab.tsx — Calendario mensual conectado (Fase 3 A36)
// Hitos normativos con fecha fija inmutable + tareas operativas (endDate →
// startDate → followUpDate) con semáforo de atraso. Coordinador/SuperAdmin
// ajusta endDate in situ; Gestor en solo lectura.
// ─────────────────────────────────────────────────────────────────────────

interface CalendarTabProps {
  projectId: string
  onOpenTask: (taskId: string) => void
}

const WEEKDAYS = ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM']

const NATURE_CODE: Record<TaskNature, string> = {
  obligacion_normativa: 'NORM',
  control_complementario: 'COMPL',
  contingencia_operativa: 'CONTING',
}

const PRIORITY_WEIGHT: Record<WorkItem['priority'], number> = {
  URGENTE: 0,
  ALTA: 1,
  MEDIA: 2,
  BAJA: 3,
}

function toLocalKey(year: number, month: number, day: number): string {
  const m = String(month + 1).padStart(2, '0')
  const d = String(day).padStart(2, '0')
  return `${year}-${m}-${d}`
}

function dateKey(value: string | undefined): string | null {
  if (!value) return null
  return value.length <= 10 ? value : value.slice(0, 10)
}

function todayKey(): string {
  const now = new Date()
  return toLocalKey(now.getFullYear(), now.getMonth(), now.getDate())
}

interface DayCell {
  key: string
  day: number
  inMonth: boolean
}

export function CalendarTab({ projectId, onOpenTask }: CalendarTabProps) {
  const dataset = useProjectsDataset()
  const { isCoordinador, isSuperAdmin } = useProjectPerspective()
  const canEditDates = isCoordinador || isSuperAdmin

  const now = new Date()
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() })
  const [editingDateFor, setEditingDateFor] = useState<string | null>(null)

  const projectTasks = useMemo(
    () => dataset.workItems.filter((item) => item.projectId === projectId),
    [dataset, projectId],
  )
  const projectMilestones = useMemo(
    () => dataset.milestones.filter((milestone) => milestone.projectId === projectId),
    [dataset, projectId],
  )

  const today = todayKey()

  const cells: DayCell[] = useMemo(() => {
    const firstWeekday = (new Date(cursor.year, cursor.month, 1).getDay() + 6) % 7
    const daysInMonth = new Date(cursor.year, cursor.month + 1, 0).getDate()
    const total = Math.ceil((firstWeekday + daysInMonth) / 7) * 7
    return Array.from({ length: total }, (_, i) => {
      const dayNum = i - firstWeekday + 1
      const date = new Date(cursor.year, cursor.month, dayNum)
      return {
        key: toLocalKey(date.getFullYear(), date.getMonth(), date.getDate()),
        day: date.getDate(),
        inMonth: dayNum >= 1 && dayNum <= daysInMonth,
      }
    })
  }, [cursor])

  const tasksByDay = useMemo(() => {
    const map = new Map<string, WorkItem[]>()
    for (const item of projectTasks) {
      const key = dateKey(item.endDate ?? item.startDate ?? item.followUpDate)
      if (!key) continue
      const list = map.get(key) ?? []
      list.push(item)
      map.set(key, list)
    }
    for (const list of map.values()) {
      list.sort((a, b) => PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority])
    }
    return map
  }, [projectTasks])

  const milestonesByDay = useMemo(() => {
    const map = new Map<string, Milestone[]>()
    for (const milestone of projectMilestones) {
      const key = dateKey(milestone.targetDate)
      if (!key) continue
      const list = map.get(key) ?? []
      list.push(milestone)
      map.set(key, list)
    }
    return map
  }, [projectMilestones])

  const monthLabel = new Date(cursor.year, cursor.month, 1).toLocaleDateString('es-PE', {
    month: 'long',
    year: 'numeric',
  })
  const capitalizedMonth = monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)

  const shiftMonth = (delta: number) => {
    setCursor((prev) => {
      const date = new Date(prev.year, prev.month + delta, 1)
      return { year: date.getFullYear(), month: date.getMonth() }
    })
    setEditingDateFor(null)
  }

  const goToday = () => {
    const current = new Date()
    setCursor({ year: current.getFullYear(), month: current.getMonth() })
    setEditingDateFor(null)
  }

  const saveEndDate = (taskId: string, value: string) => {
    projectsService.updateWorkItem(taskId, { endDate: value || undefined })
    setEditingDateFor(null)
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <CalendarDays size={15} className="text-zinc-400" /> Calendario del proyecto
          </h3>
          <p className="text-xs text-zinc-500">
            Hitos normativos con fecha fija + tareas operativas
          </p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => shiftMonth(-1)}
            aria-label="Mes anterior"
            className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="h-8 rounded-lg border border-zinc-200 px-3 text-xs font-bold text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => shiftMonth(1)}
            aria-label="Mes siguiente"
            className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="px-5 pt-4">
        <p className="text-base font-extrabold tracking-tight text-zinc-900">{capitalizedMonth}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-semibold text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <Flag size={11} className="text-[var(--hub-brand)]" /> Hito normativo (fecha fija)
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" /> Tarea atrasada
          </span>
          {canEditDates && (
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays size={11} /> Puedes ajustar la fecha fin desde cada tarea
            </span>
          )}
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="min-w-[700px]">
          <div className="grid grid-cols-7 gap-1">
            {WEEKDAYS.map((weekday) => (
              <p
                key={weekday}
                className="py-1 text-center text-[11px] font-bold uppercase tracking-wider text-zinc-400"
              >
                {weekday}
              </p>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const dayMilestones = milestonesByDay.get(cell.key) ?? []
              const dayTasks = tasksByDay.get(cell.key) ?? []
              const isToday = cell.key === today
              return (
                <div
                  key={cell.key}
                  className={`min-h-[104px] rounded-xl border p-1.5 ${
                    cell.inMonth ? 'border-zinc-100 bg-white' : 'border-zinc-50 bg-zinc-50/60'
                  }`}
                >
                  <span
                    className={`grid h-6 w-6 place-items-center rounded-full text-[11px] font-bold ${
                      isToday
                        ? 'bg-zinc-900 text-white'
                        : cell.inMonth
                          ? 'text-zinc-700'
                          : 'text-zinc-300'
                    }`}
                  >
                    {cell.day}
                  </span>
                  <div className="mt-1 space-y-1">
                    {dayMilestones.map((milestone) => (
                      <div
                        key={milestone.id}
                        title={`${milestone.name} · Vence ${milestone.targetDate}`}
                        className="flex items-center gap-1 truncate rounded-md border border-[var(--hub-brand)] bg-[var(--hub-brand)]/5 px-1.5 py-1"
                      >
                        <Flag size={10} className="shrink-0 text-[var(--hub-brand)]" />
                        <span className="truncate text-[10px] font-extrabold text-zinc-800">
                          {milestone.name}
                        </span>
                      </div>
                    ))}
                    {dayTasks.map((task) => {
                      const overdue = cell.key < today && task.state !== 'done'
                      const taskDate =
                        task.endDate ?? task.startDate ?? task.followUpDate ?? ''
                      return (
                        <div
                          key={task.id}
                          className={`flex items-center gap-1 rounded-md border border-zinc-200 bg-zinc-50 px-1.5 py-1 ${
                            task.state === 'done' ? 'opacity-60' : ''
                          }`}
                        >
                          {overdue && (
                            <span
                              className="h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500"
                              title="Tarea atrasada"
                            />
                          )}
                          {task.taskNature && (
                            <span
                              className={`shrink-0 rounded border px-1 text-[9px] font-extrabold tracking-wide ${TASK_NATURE_META[task.taskNature].badgeClass}`}
                              title={TASK_NATURE_META[task.taskNature].label}
                            >
                              {NATURE_CODE[task.taskNature]}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => onOpenTask(task.id)}
                            title={task.title}
                            className="min-w-0 flex-1 truncate text-left text-[10px] font-bold text-zinc-700 hover:text-brand"
                          >
                            {task.title}
                          </button>
                          {canEditDates &&
                            (editingDateFor === task.id ? (
                              <input
                                type="date"
                                autoFocus
                                defaultValue={taskDate}
                                onChange={(event) => saveEndDate(task.id, event.target.value)}
                                onBlur={() => setEditingDateFor(null)}
                                onClick={(event) => event.stopPropagation()}
                                aria-label={`Ajustar fecha fin de ${task.title}`}
                                className="h-5 w-[104px] shrink-0 rounded border border-zinc-300 bg-white px-0.5 text-[10px] text-zinc-700 outline-none focus:border-brand"
                              />
                            ) : (
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation()
                                  setEditingDateFor(task.id)
                                }}
                                title="Ajustar fecha fin"
                                aria-label={`Ajustar fecha fin de ${task.title}`}
                                className="grid h-5 w-5 shrink-0 place-items-center rounded text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-700"
                              >
                                <CalendarDays size={11} />
                              </button>
                            ))}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarTab
