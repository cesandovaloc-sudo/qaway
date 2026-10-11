import { useMemo } from 'react'
import { Calendar, Flag, Gauge, Link2 } from 'lucide-react'
import { useProject, useProjectEVM, useProjectWorkItems } from '@/hooks/useProjects'
import {
  COST_STATUS_META,
  SCHEDULE_STATUS_META,
} from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// GanttTab.tsx — c) Diagrama Gantt Primavera P6 (Task 5.1)
// Escala de tiempo en semanas, barras proporcionales a durationDays/fechas,
// resaltado de Ruta Crítica CPM e indicadores de dependencias FS.
// ─────────────────────────────────────────────────────────────────────────

interface GanttTabProps {
  projectId: string
  onOpenTask: (taskId: string) => void
}

const DAY_MS = 86_400_000

function parseDay(value: string | undefined): number | null {
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

function formatTick(time: number) {
  return new Date(time).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

interface GanttRow {
  id: string
  title: string
  start: number
  end: number
  isCritical: boolean
  isDone: boolean
  predecessors: string[]
}

export function GanttTab({ projectId, onOpenTask }: GanttTabProps) {
  const project = useProject(projectId)
  const workItems = useProjectWorkItems(projectId)
  const evm = useProjectEVM(projectId)

  const schedule = useMemo(() => {
    if (workItems.length === 0) return null

    const projectStart = parseDay(project?.startDate) ?? Date.now()
    const explicitStarts = workItems
      .map((item) => parseDay(item.startDate))
      .filter((value): value is number => value !== null)
    const rangeStart = Math.min(projectStart, ...(explicitStarts.length ? explicitStarts : [projectStart]))

    let cursor = rangeStart
    const rows: GanttRow[] = workItems.map((item) => {
      const explicitStart = parseDay(item.startDate)
      const explicitEnd = parseDay(item.endDate)
      const duration = Math.max(1, Math.round(item.durationDays ?? item.storyPoints ?? 2))
      let start: number
      let end: number
      if (explicitStart !== null && explicitEnd !== null && explicitEnd >= explicitStart) {
        start = explicitStart
        end = explicitEnd
      } else if (explicitStart !== null) {
        start = explicitStart
        end = start + duration * DAY_MS
      } else {
        start = cursor
        end = start + duration * DAY_MS
      }
      cursor = Math.max(cursor, end + DAY_MS)
      return {
        id: item.id,
        title: item.title,
        start,
        end,
        isCritical: Boolean(item.isCriticalPath),
        isDone: item.state === 'done',
        predecessors: item.predecessors ?? [],
      }
    })

    rows.sort((a, b) => a.start - b.start)
    const rangeEnd = Math.max(...rows.map((row) => row.end), rangeStart + 7 * DAY_MS)
    const totalDays = Math.max(1, Math.round((rangeEnd - rangeStart) / DAY_MS))

    const ticks: number[] = []
    for (let offset = 0; offset <= totalDays; offset += 7) {
      ticks.push(rangeStart + offset * DAY_MS)
    }

    const today = Date.now()
    const todayPct =
      today >= rangeStart && today <= rangeEnd
        ? ((today - rangeStart) / (rangeEnd - rangeStart)) * 100
        : null

    return { rows, rangeStart, rangeEnd, totalDays, ticks, todayPct }
  }, [workItems, project])

  const criticalCount = schedule?.rows.filter((row) => row.isCritical).length ?? 0
  const scheduleMeta = evm ? SCHEDULE_STATUS_META[evm.scheduleStatus] : null
  const costMeta = evm ? COST_STATUS_META[evm.costStatus] : null

  const formatMoney = (value: number) =>
    new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: project?.budget.currency ?? 'PEN',
      maximumFractionDigits: 0,
    }).format(value)

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      {/* Barra EVM: CPI y SPI (Fase 9) */}
      {evm && scheduleMeta && costMeta && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-zinc-100 bg-zinc-50/70 px-5 py-3">
          <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            <Gauge size={13} /> Valor ganado
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-zinc-700">
            CPI
            <span className="font-mono text-sm" style={{ color: costMeta.color }}>
              {evm.cpi.toFixed(2)}
            </span>
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase"
              style={{ color: costMeta.color, backgroundColor: `${costMeta.color}14` }}
            >
              {costMeta.label}
            </span>
          </span>
          <span className="inline-flex items-center gap-2 text-xs font-bold text-zinc-700">
            SPI
            <span className="font-mono text-sm" style={{ color: scheduleMeta.color }}>
              {evm.spi.toFixed(2)}
            </span>
            <span
              className="rounded-md px-1.5 py-0.5 text-[10px] font-extrabold uppercase"
              style={{ color: scheduleMeta.color, backgroundColor: `${scheduleMeta.color}14` }}
            >
              {scheduleMeta.label}
            </span>
          </span>
          <span className="ml-auto font-mono text-[11px] text-zinc-500">
            PV {formatMoney(evm.plannedValue)} · EV {formatMoney(evm.earnedValue)} · AC{' '}
            {formatMoney(evm.actualCost)} · EAC {formatMoney(evm.estimateAtCompletion)}
          </span>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <Calendar size={15} className="text-zinc-400" /> Diagrama Gantt
          </h3>
          <p className="text-xs text-zinc-500">
            Barras proporcionales a duración · dependencias Fin-Comienzo (FS)
          </p>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-4 text-[11px] font-semibold text-zinc-500">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-8 rounded-full bg-brand" /> Normal
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-8 rounded-full bg-[#b83328]" /> Ruta crítica ({criticalCount})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-8 rounded-full bg-[#404040]" /> Completada
          </span>
        </div>
      </div>

      {!schedule ? (
        <p className="px-5 py-14 text-center text-sm text-zinc-400">
          Este proyecto aún no tiene tareas para graficar.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[860px]">
            {/* Escala de semanas */}
            <div className="flex border-b border-zinc-100">
              <div className="w-[260px] shrink-0 px-5 py-2 text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                Tarea
              </div>
              <div className="relative flex-1 py-2">
                {schedule.ticks.map((tick) => {
                  const left = ((tick - schedule.rangeStart) / (schedule.rangeEnd - schedule.rangeStart)) * 100
                  return (
                    <span
                      key={tick}
                      className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-mono text-[10px] text-zinc-400"
                      style={{ left: `${Math.min(98, Math.max(1, left))}%` }}
                    >
                      {formatTick(tick)}
                    </span>
                  )
                })}
              </div>
            </div>

            {/* Filas */}
            <div className="relative">
              {schedule.todayPct !== null && (
                <div
                  className="pointer-events-none absolute bottom-0 top-0 z-10 ml-[260px] w-px bg-sky-500/70"
                  style={{ left: `calc((100% - 260px) * ${schedule.todayPct / 100})` }}
                  title="Hoy"
                />
              )}
              {schedule.rows.map((row) => {
                const left = ((row.start - schedule.rangeStart) / (schedule.rangeEnd - schedule.rangeStart)) * 100
                const width = Math.max(
                  2,
                  ((row.end - row.start) / (schedule.rangeEnd - schedule.rangeStart)) * 100,
                )
                const days = Math.max(1, Math.round((row.end - row.start) / DAY_MS))
                return (
                  <div
                    key={row.id}
                    className="flex items-center border-b border-zinc-50 last:border-0 hover:bg-zinc-50/60"
                  >
                    <div className="w-[260px] shrink-0 px-5 py-2.5">
                      <button
                        type="button"
                        onClick={() => onOpenTask(row.id)}
                        className="block w-full text-left"
                      >
                        <p className="flex items-center gap-1.5 truncate text-[13px] font-bold text-zinc-800 hover:text-brand">
                          {row.isCritical && <Flag size={12} className="shrink-0 text-[#b83328]" />}
                          <span className="truncate">{row.title}</span>
                        </p>
                        <p className="mt-0.5 flex items-center gap-2 font-mono text-[10px] text-zinc-400">
                          {row.id} · {days}d
                          {row.predecessors.length > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[#8b829e]">
                              <Link2 size={10} /> {row.predecessors.join(', ')}
                            </span>
                          )}
                        </p>
                      </button>
                    </div>
                    <div className="relative h-12 flex-1">
                      <div className="absolute inset-y-0 left-0 right-0 bg-[repeating-linear-gradient(90deg,transparent_0,transparent_39px,#f4f4f5_39px,#f4f4f5_40px)]" />
                      <button
                        type="button"
                        onClick={() => onOpenTask(row.id)}
                        title={`${row.title} · ${days} días${row.isCritical ? ' · RUTA CRÍTICA' : ''}`}
                        className="absolute top-1/2 h-5 -translate-y-1/2 rounded-full shadow-sm transition-transform hover:scale-y-110"
                        style={{
                          left: `${left}%`,
                          width: `${Math.min(100 - left, width)}%`,
                          backgroundColor: row.isDone
                            ? '#404040'
                            : row.isCritical
                              ? '#b83328'
                              : 'var(--hub-brand, #d9532f)',
                          boxShadow: row.isCritical
                            ? '0 0 0 3px rgba(184,51,40,0.18)'
                            : '0 2px 6px var(--hub-brand-glow, rgba(217,83,47,0.22))',
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GanttTab
