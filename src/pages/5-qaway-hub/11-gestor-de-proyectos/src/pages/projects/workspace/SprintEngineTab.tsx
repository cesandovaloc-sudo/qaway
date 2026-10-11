import { useEffect, useMemo, useState } from 'react'
import {
  ArrowRightLeft,
  Calendar,
  Check,
  Flame,
  ListTodo,
  Play,
} from 'lucide-react'
import {
  useProject,
  useProjectWorkItems,
  useSprintBurndown,
} from '@/hooks/useProjects'
import { useProjectsDataset } from '@/hooks/useProjects'
import { useHubBrand } from '@/hooks/useHubBrand'
import { projectsService } from '@/services/projectsService'
import {
  TSHIRT_POINTS,
  WORK_ITEM_STATE_META,
  type SprintStatus,
} from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// SprintEngineTab.tsx — Motor Scrum Pro (Task 9.3)
// Cabecera con ciclo Iniciar/Completar sprint, burndown SVG interactivo
// (ideal vs. real) y planificación Sprint Backlog vs. Product Backlog.
// ─────────────────────────────────────────────────────────────────────────

interface SprintEngineTabProps {
  projectId: string
  onOpenTask: (taskId: string) => void
}

const SPRINT_STATUS_META: Record<SprintStatus, { label: string; badgeClass: string }> = {
  planificacion: {
    label: 'En planificación',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  activo: {
    label: 'Activo',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
  },
  cerrado: {
    label: 'Cerrado',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
}

const CHART_W = 660
const CHART_H = 300
const PAD = { l: 46, r: 16, t: 16, b: 36 }

function itemPoints(item: {
  storyPoints?: number
  tShirtSize?: keyof typeof TSHIRT_POINTS
  durationDays?: number
}): number {
  if (typeof item.storyPoints === 'number') return Math.max(0, item.storyPoints)
  if (item.tShirtSize) return TSHIRT_POINTS[item.tShirtSize]
  if (typeof item.durationDays === 'number') return Math.max(0, Math.round(item.durationDays))
  return 0
}

function formatDate(value: string) {
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

export function SprintEngineTab({ projectId, onOpenTask }: SprintEngineTabProps) {
  const project = useProject(projectId)
  const hubBrand = useHubBrand()
  const workItems = useProjectWorkItems(projectId)
  const dataset = useProjectsDataset()

  const sprints = useMemo(
    () => dataset.sprints.filter((sprint) => sprint.projectId === projectId),
    [dataset, projectId],
  )

  const defaultSprintId = useMemo(() => {
    if (project?.activeSprint && sprints.some((sprint) => sprint.id === project.activeSprint)) {
      return project.activeSprint
    }
    const active = sprints.find((sprint) => sprint.status === 'activo')
    if (active) return active.id
    const planned = sprints.find((sprint) => sprint.status === 'planificacion')
    if (planned) return planned.id
    return sprints[0]?.id ?? null
  }, [project, sprints])

  const [selectedId, setSelectedId] = useState<string | null>(defaultSprintId)
  const [carryTarget, setCarryTarget] = useState('')
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)

  useEffect(() => {
    setSelectedId(defaultSprintId)
    setCarryTarget('')
    setHoverIndex(null)
  }, [defaultSprintId, projectId])

  const sprint = sprints.find((item) => item.id === selectedId) ?? null
  const burndown = useSprintBurndown(sprint?.id)

  const sprintItems = useMemo(
    () => (sprint ? workItems.filter((item) => item.sprintId === sprint.id) : []),
    [workItems, sprint],
  )
  const productBacklog = useMemo(
    () => workItems.filter((item) => !item.sprintId),
    [workItems],
  )
  const carryOptions = useMemo(
    () => sprints.filter((item) => item.status === 'planificacion' && item.id !== sprint?.id),
    [sprints, sprint],
  )

  const scopeTotal = sprintItems.reduce((sum, item) => sum + itemPoints(item), 0)
  const donePoints = sprintItems
    .filter((item) => item.state === 'done')
    .reduce((sum, item) => sum + itemPoints(item), 0)
  const completionPct = scopeTotal > 0 ? Math.round((donePoints / scopeTotal) * 100) : 0

  // ── Geometría del burndown ──
  const innerW = CHART_W - PAD.l - PAD.r
  const innerH = CHART_H - PAD.t - PAD.b
  const maxPoints = Math.max(1, ...burndown.map((d) => Math.max(d.ideal, d.actual ?? 0)))
  const niceMax = Math.max(1, Math.ceil(maxPoints))
  const xOf = (i: number) =>
    PAD.l + (burndown.length <= 1 ? innerW / 2 : (i / (burndown.length - 1)) * innerW)
  const yOf = (v: number) => PAD.t + innerH - (v / niceMax) * innerH

  const idealPath = burndown.map((d, i) => `${i === 0 ? 'M' : 'L'}${xOf(i)},${yOf(d.ideal)}`).join(' ')
  const actualDots = burndown
    .map((d, i) => ({ ...d, i }))
    .filter((d) => d.actual !== null)
  const actualPath = actualDots
    .map((d, k) => `${k === 0 ? 'M' : 'L'}${xOf(d.i)},${yOf(d.actual as number)}`)
    .join(' ')
  const xLabelEvery = Math.max(1, Math.ceil(burndown.length / 6))
  const yTicks = [0, niceMax / 2, niceMax]

  const handleMouseMove = (event: React.MouseEvent<SVGSVGElement>) => {
    if (burndown.length === 0) return
    const rect = event.currentTarget.getBoundingClientRect()
    const svgX = ((event.clientX - rect.left) / rect.width) * CHART_W
    const raw =
      burndown.length <= 1 ? 0 : ((svgX - PAD.l) / innerW) * (burndown.length - 1)
    setHoverIndex(Math.min(burndown.length - 1, Math.max(0, Math.round(raw))))
  }

  const statusMeta = sprint ? SPRINT_STATUS_META[sprint.status] : null
  const hovered = hoverIndex !== null ? burndown[hoverIndex] : null

  return (
    <div className="space-y-4">
      {/* Cabecera del sprint */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex flex-wrap items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-orange-50 text-brand">
            <Flame size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
              Motor Scrum · Sprint {sprints.length > 0 ? `${sprints.findIndex((s) => s.id === sprint?.id) + 1}/${sprints.length}` : '—'}
            </p>
            {sprints.length > 0 ? (
              <select
                value={sprint?.id ?? ''}
                onChange={(event) => {
                  setSelectedId(event.target.value || null)
                  setCarryTarget('')
                }}
                aria-label="Seleccionar sprint"
                className="mt-0.5 max-w-full bg-transparent text-lg font-extrabold tracking-tight text-zinc-900 outline-none"
              >
                {sprints.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-lg font-extrabold text-zinc-900">Sin sprints</p>
            )}
            {sprint && (
              <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[12px] text-zinc-500">
                <span className="inline-flex items-center gap-1">
                  <Calendar size={12} /> {formatDate(sprint.startDate)} → {formatDate(sprint.endDate)}
                </span>
                <span className="truncate">· {sprint.goal}</span>
              </p>
            )}
          </div>
          {statusMeta && (
            <span
              className={`inline-flex items-center rounded-md border px-2 py-1 text-[10px] font-bold uppercase tracking-wide ${statusMeta.badgeClass}`}
            >
              {statusMeta.label}
            </span>
          )}
          {sprint?.status === 'planificacion' && (
            <button
              type="button"
              onClick={() => projectsService.startSprint(sprint.id)}
              className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white shadow-[0_2px_8px_rgba(255,75,11,0.28)] transition-colors hover:bg-brand-hover"
            >
              <Play size={15} /> Iniciar sprint
            </button>
          )}
          {sprint?.status === 'activo' && (
            <div className="flex flex-wrap items-center gap-2">
              {carryOptions.length > 0 && (
                <select
                  value={carryTarget}
                  onChange={(event) => setCarryTarget(event.target.value)}
                  aria-label="Sprint destino del remanente"
                  title="Mover tareas incompletas al cerrar"
                  className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-xs font-semibold text-zinc-600 outline-none focus:border-brand"
                >
                  <option value="">Sin arrastre</option>
                  {carryOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      Arrastrar a: {option.name}
                    </option>
                  ))}
                </select>
              )}
              <button
                type="button"
                onClick={() => projectsService.closeSprint(sprint.id, carryTarget || undefined)}
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-zinc-900 px-4 text-sm font-bold text-white transition-colors hover:bg-emerald-600"
              >
                <Check size={15} /> Completar sprint
              </button>
            </div>
          )}
        </div>

        {sprint && (
          <div className="mt-4 flex items-center gap-2.5">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-brand transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
            <span className="font-mono text-xs font-bold text-zinc-700">
              {donePoints}/{scopeTotal} pts · {completionPct}%
            </span>
          </div>
        )}
      </div>

      {/* Burndown SVG */}
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="mb-2 flex flex-wrap items-center gap-4">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Burndown del sprint</h3>
            <p className="text-xs text-zinc-500">Puntos restantes · ideal vs. real (pasa el cursor)</p>
          </div>
          <div className="ml-auto flex items-center gap-4 text-[11px] font-semibold text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-6 border-t-2 border-dashed border-zinc-400" /> Ideal
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-[3px] w-6 rounded-full bg-brand" /> Real
            </span>
          </div>
        </div>

        {burndown.length === 0 ? (
          <p className="py-10 text-center text-sm text-zinc-400">Selecciona un sprint para graficar.</p>
        ) : (
          <div className="relative">
            <svg
              viewBox={`0 0 ${CHART_W} ${CHART_H}`}
              className="h-auto w-full cursor-crosshair"
              role="img"
              aria-label="Gráfico burndown del sprint"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {yTicks.map((tick) => (
                <g key={tick}>
                  <line
                    x1={PAD.l}
                    x2={CHART_W - PAD.r}
                    y1={yOf(tick)}
                    y2={yOf(tick)}
                    stroke="#f4f4f5"
                    strokeWidth={1}
                  />
                  <text x={PAD.l - 8} y={yOf(tick) + 4} textAnchor="end" fontSize={11} fill="#a1a1aa" fontWeight={700}>
                    {Math.round(tick)}
                  </text>
                </g>
              ))}
              {burndown.map((d, i) =>
                i % xLabelEvery === 0 || i === burndown.length - 1 ? (
                  <text
                    key={d.date}
                    x={xOf(i)}
                    y={CHART_H - 12}
                    textAnchor="middle"
                    fontSize={11}
                    fill="#a1a1aa"
                    fontWeight={600}
                  >
                    {d.label}
                  </text>
                ) : null,
              )}
              <path d={idealPath} fill="none" stroke="#a1a1aa" strokeWidth={2} strokeDasharray="7 5" strokeLinecap="round" />
              {actualPath && (
                <path d={actualPath} fill="none" stroke={hubBrand} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
              )}
              {actualDots.map((d) => (
                <circle
                  key={d.date}
                  cx={xOf(d.i)}
                  cy={yOf(d.actual as number)}
                  r={hoverIndex === d.i ? 6 : 4}
                  fill={hubBrand}
                  stroke="#fff"
                  strokeWidth={2}
                />
              ))}
              {hovered && hoverIndex !== null && (
                <line
                  x1={xOf(hoverIndex)}
                  x2={xOf(hoverIndex)}
                  y1={PAD.t}
                  y2={CHART_H - PAD.b}
                  stroke={hubBrand}
                  strokeOpacity={0.35}
                  strokeWidth={1.5}
                />
              )}
            </svg>
            {hovered && hoverIndex !== null && (
              <div
                className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border border-zinc-200 bg-white px-3 py-2 text-xs shadow-lg"
                style={{ left: `${(xOf(hoverIndex) / CHART_W) * 100}%`, top: 8 }}
              >
                <p className="font-bold text-zinc-800">{hovered.label}</p>
                <p className="mt-0.5 text-zinc-500">
                  Ideal <span className="font-mono font-bold text-zinc-700">{hovered.ideal}</span>
                  {' · '}Real{' '}
                  <span className="font-mono font-bold text-brand">
                    {hovered.actual ?? '—'}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Backlogs */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h3 className="mb-1 flex items-center gap-2 px-1 text-sm font-bold text-zinc-900">
            <Flame size={15} className="text-brand" /> Sprint Backlog
            <span className="ml-auto rounded-full bg-orange-50 px-2 py-0.5 font-mono text-[11px] font-bold text-orange-700">
              {sprintItems.length} · {scopeTotal} pts
            </span>
          </h3>
          <p className="mb-3 px-1 text-[11px] text-zinc-400">Compromiso del sprint seleccionado</p>
          <BacklogList
            items={sprintItems.map((item) => ({ id: item.id, title: item.title, points: itemPoints(item), state: item.state, epic: item.epicTitle, blocked: Boolean(item.isBlocked) }))}
            emptyText="Sprint vacío. Mueve tareas desde el Product Backlog."
            actionLabel="Sacar"
            onAction={(taskId) => projectsService.updateWorkItem(taskId, { sprintId: undefined })}
            onOpenTask={onOpenTask}
          />
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          <h3 className="mb-1 flex items-center gap-2 px-1 text-sm font-bold text-zinc-900">
            <ListTodo size={15} className="text-zinc-400" /> Product Backlog
            <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 font-mono text-[11px] font-bold text-zinc-500">
              {productBacklog.length}
            </span>
          </h3>
          <p className="mb-3 px-1 text-[11px] text-zinc-400">Pendiente de planificar en un sprint</p>
          <BacklogList
            items={productBacklog.map((item) => ({ id: item.id, title: item.title, points: itemPoints(item), state: item.state, epic: item.epicTitle, blocked: Boolean(item.isBlocked) }))}
            emptyText="Sin backlog. Todo está planificado."
            actionLabel={sprint ? 'Al sprint' : '—'}
            actionDisabled={!sprint}
            onAction={(taskId) => {
              if (sprint) projectsService.updateWorkItem(taskId, { sprintId: sprint.id })
            }}
            onOpenTask={onOpenTask}
          />
        </div>
      </div>
    </div>
  )
}

interface BacklogRow {
  id: string
  title: string
  points: number
  state: keyof typeof WORK_ITEM_STATE_META
  epic?: string
  blocked: boolean
}

function BacklogList({
  items,
  emptyText,
  actionLabel,
  actionDisabled,
  onAction,
  onOpenTask,
}: {
  items: BacklogRow[]
  emptyText: string
  actionLabel: string
  actionDisabled?: boolean
  onAction: (taskId: string) => void
  onOpenTask: (taskId: string) => void
}) {
  if (items.length === 0) {
    return <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-8 text-center text-xs text-zinc-400">{emptyText}</p>
  }
  return (
    <ul className="max-h-[380px] space-y-2 overflow-y-auto pr-0.5">
      {items.map((row) => (
        <li
          key={row.id}
          className={`flex items-center gap-2.5 rounded-xl border p-2.5 ${row.blocked ? 'border-rose-200 bg-rose-50/40' : 'border-zinc-100'}`}
        >
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-zinc-900 font-mono text-[11px] font-extrabold text-white">
            {row.points}
          </span>
          <button type="button" onClick={() => onOpenTask(row.id)} className="min-w-0 flex-1 text-left">
            <span className="block truncate text-[13px] font-bold text-zinc-800 hover:text-brand">
              {row.title}
            </span>
            <span className="block truncate font-mono text-[10px] text-zinc-400">
              {row.id} · {WORK_ITEM_STATE_META[row.state].label}
              {row.epic ? ` · ${row.epic}` : ''}
            </span>
          </button>
          <button
            type="button"
            onClick={() => onAction(row.id)}
            disabled={actionDisabled}
            title={actionLabel}
            aria-label={`${actionLabel}: ${row.title}`}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-zinc-200 text-zinc-500 transition-colors hover:border-brand hover:text-brand disabled:opacity-30"
          >
            <ArrowRightLeft size={14} />
          </button>
        </li>
      ))}
    </ul>
  )
}

export default SprintEngineTab
