import { useMemo, useState } from 'react'
import { Ban, ChevronLeft, ChevronRight, Clock, Flag, Link2, MapPin, Plus, Search, User } from 'lucide-react'
import { useProjectWorkItems } from '@/hooks/useProjects'
import { projectsService } from '@/services/projectsService'
import {
  FOLLOW_UP_META,
  KANBAN_STATE_ORDER,
  KANBAN_WIP_LIMITS,
  WORK_ITEM_PRIORITY_META,
  WORK_ITEM_STATE_META,
  type WorkItemState,
} from '@/types/project.types'
import { formatFollowUpDate, getFollowUpStatus } from '@/utils/followUp'

// ─────────────────────────────────────────────────────────────────────────
// KanbanBoardTab.tsx — b) Tablero Kanban interactivo (Task 4.2)
// Columnas fluidas con tarjetas interactivas (prioridad, story points,
// asignado), cambio de estado inline y alta rápida por columna.
// ─────────────────────────────────────────────────────────────────────────

interface KanbanBoardTabProps {
  projectId: string
  onOpenTask: (taskId: string) => void
}

const emptyDrafts: Record<WorkItemState, string> = {
  backlog: '',
  todo: '',
  in_progress: '',
  review: '',
  done: '',
}

export function KanbanBoardTab({ projectId, onOpenTask }: KanbanBoardTabProps) {
  const workItems = useProjectWorkItems(projectId)
  const [drafts, setDrafts] = useState<Record<WorkItemState, string>>(emptyDrafts)
  const [memberFilter, setMemberFilter] = useState<string | null>(null)
  const [ugelQuery, setUgelQuery] = useState('')

  const members = useMemo(() => {
    const map = new Map<string, number>()
    for (const item of workItems) {
      const name = item.assignee.name.trim() || 'Sin asignar'
      map.set(name, (map.get(name) ?? 0) + 1)
    }
    return [...map.entries()].sort((a, b) => b[1] - a[1])
  }, [workItems])

  const visibleItems = useMemo(() => {
    const term = ugelQuery.trim().toLowerCase()
    return workItems.filter((item) => {
      const matchesMember = !memberFilter || (item.assignee.name.trim() || 'Sin asignar') === memberFilter
      const matchesUgel =
        !term ||
        (item.scopeTag ?? '').toLowerCase().includes(term) ||
        item.title.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        item.assignee.name.toLowerCase().includes(term)
      return matchesMember && matchesUgel
    })
  }, [workItems, memberFilter, ugelQuery])

  const move = (taskId: string, direction: -1 | 1) => {
    const current = workItems.find((item) => item.id === taskId)
    if (!current) return
    const index = KANBAN_STATE_ORDER.indexOf(current.state)
    const next = KANBAN_STATE_ORDER[index + direction]
    if (!next) return
    // Sellado de cierre: alimenta el burndown en tiempo real (Fase 9).
    projectsService.updateWorkItem(taskId, {
      state: next,
      completedAt: next === 'done' ? new Date().toISOString() : undefined,
    })
  }

  const quickAdd = (state: WorkItemState) => {
    const title = drafts[state].trim()
    if (!title) return
    projectsService.createWorkItem({
      projectId,
      title,
      state,
      priority: 'MEDIA',
      assignee: { name: 'Sin asignar', role: 'Equipo' },
    })
    setDrafts((prev) => ({ ...prev, [state]: '' }))
  }

  return (
    <>
      {/* Filtro rápido por integrante + buscador UGEL (Fase 9/10) */}
      <div className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-zinc-200 bg-white px-3 py-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="relative min-w-[200px] flex-1">
          <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={ugelQuery}
            onChange={(event) => setUgelQuery(event.target.value)}
            placeholder="Buscar por UGEL, tarea o gestor…"
            aria-label="Buscar por UGEL"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-xs text-zinc-800 outline-none transition-all placeholder:text-zinc-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>
        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">Equipo</span>
        <button
          type="button"
          onClick={() => setMemberFilter(null)}
          className={`rounded-full px-3 py-1 text-xs font-bold transition-colors ${
            memberFilter === null
              ? 'bg-zinc-900 text-white'
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
          }`}
        >
          Todos ({workItems.length})
        </button>
        {members.map(([name, count]) => {
          const active = memberFilter === name
          return (
            <button
              key={name}
              type="button"
              onClick={() => setMemberFilter(active ? null : name)}
              title={`${name} · ${count} tareas`}
              className={`inline-flex items-center gap-1.5 rounded-full py-1 pl-1 pr-2.5 text-xs font-bold transition-colors ${
                active ? 'bg-brand text-white' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center rounded-full text-[10px] font-extrabold ${
                  active ? 'bg-white/25 text-white' : 'bg-zinc-900 text-white'
                }`}
              >
                {name.trim().charAt(0).toUpperCase()}
              </span>
              <span className="max-w-[120px] truncate">{name}</span>
              <span className="font-mono opacity-70">{count}</span>
            </button>
          )
        })}
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3 xl:grid-cols-5">
      {KANBAN_STATE_ORDER.map((state) => {
        const meta = WORK_ITEM_STATE_META[state]
        const columnTotal = workItems.filter((item) => item.state === state).length
        const cards = visibleItems.filter((item) => item.state === state)
        const wipLimit = KANBAN_WIP_LIMITS[state]
        const bottleneck = columnTotal > wipLimit
        return (
          <section
            key={state}
            className={`flex min-h-[280px] flex-col rounded-2xl border bg-zinc-50/70 p-2.5 transition-colors ${
              bottleneck ? 'border-rose-300 ring-1 ring-rose-200' : 'border-zinc-200'
            }`}
          >
            <header className="flex items-center gap-2 px-1.5 pb-2">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.accent }} />
              <h3 className="text-xs font-extrabold uppercase tracking-wide text-zinc-700">
                {meta.label}
              </h3>
              <span
                className={`ml-auto rounded-full px-2 py-0.5 font-mono text-[11px] font-bold shadow-sm ${
                  bottleneck ? 'bg-rose-500 text-white' : 'bg-white text-zinc-500'
                }`}
                title={wipLimit >= 99 ? `${columnTotal} tarjetas` : `WIP ${columnTotal}/${wipLimit}`}
              >
                {wipLimit >= 99 ? columnTotal : `${columnTotal}/${wipLimit}`}
              </span>
            </header>
            {bottleneck && (
              <p className="mb-2 flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wide text-rose-700">
                <Ban size={12} /> Cuello de botella
              </p>
            )}

            <div className="flex-1 space-y-2">
              {cards.map((card) => {
                const priorityMeta = WORK_ITEM_PRIORITY_META[card.priority]
                const index = KANBAN_STATE_ORDER.indexOf(card.state)
                const followStatus = getFollowUpStatus(card.followUpDate, card.state)
                const followMeta = FOLLOW_UP_META[followStatus]
                return (
                  <article
                    key={card.id}
                    className={`rounded-xl border bg-white p-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_6px_16px_rgba(0,0,0,0.07)] ${
                      card.isBlocked
                        ? 'border-rose-300'
                        : card.isCriticalPath
                          ? 'border-rose-200'
                          : 'border-zinc-200'
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-1.5">
                      {card.isBlocked && (
                        <span className="inline-flex items-center gap-1 rounded border border-rose-300 bg-rose-50 px-1.5 py-px text-[9px] font-extrabold tracking-wide text-rose-700">
                          <Ban size={10} /> BLOQUEADA
                        </span>
                      )}
                      <span
                        className="rounded border px-1.5 py-px text-[9px] font-extrabold tracking-wide"
                        style={{
                          color: priorityMeta.color,
                          borderColor: 'currentColor',
                          backgroundColor: `${priorityMeta.color}12`,
                        }}
                      >
                        {card.priority}
                      </span>
                      <span className="font-mono text-[10px] text-zinc-400">{card.id}</span>
                      {card.tShirtSize && (
                        <span className="rounded bg-zinc-900 px-1.5 py-px font-mono text-[9px] font-extrabold text-white" title={`Talla ${card.tShirtSize}`}>
                          {card.tShirtSize}
                        </span>
                      )}
                      {card.isCriticalPath && (
                        <span className="ml-auto inline-flex items-center gap-1 text-[9px] font-extrabold uppercase text-rose-600">
                          <Flag size={10} /> Crítica
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenTask(card.id)}
                      className="mt-1.5 block w-full text-left text-[13px] font-bold leading-snug text-zinc-900 hover:text-brand"
                    >
                      {card.title}
                    </button>
                    {card.isBlocked && card.blockerReason && (
                      <p className="mt-1.5 flex items-start gap-1 rounded-lg bg-rose-50 px-2 py-1 text-[10px] font-semibold leading-snug text-rose-700">
                        <Ban size={10} className="mt-0.5 shrink-0" />
                        <span className="line-clamp-2">{card.blockerReason}</span>
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                      <span className="inline-flex items-center gap-1 font-semibold">
                        <span className="grid h-5 w-5 place-items-center rounded-full bg-zinc-900 text-[9px] font-extrabold text-white">
                          {card.assignee.name.trim().charAt(0).toUpperCase() || <User size={10} />}
                        </span>
                        {card.assignee.name}
                      </span>
                      {card.storyPoints !== undefined && (
                        <span className="font-mono font-bold">{card.storyPoints} pts</span>
                      )}
                      {card.durationDays !== undefined && (
                        <span className="inline-flex items-center gap-1">
                          <Clock size={11} /> {card.durationDays}d
                        </span>
                      )}
                      {card.predecessors && card.predecessors.length > 0 && (
                        <span className="inline-flex items-center gap-1">
                          <Link2 size={11} /> {card.predecessors.length} FS
                        </span>
                      )}
                    </div>

                    {/* Semáforo de seguimiento + UGEL (Fase 10) */}
                    {(card.followUpDate || card.scopeTag) && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {card.scopeTag && (
                          <span className="inline-flex max-w-full items-center gap-1 truncate rounded-md bg-sky-50 px-1.5 py-0.5 text-[10px] font-extrabold text-sky-700">
                            <MapPin size={10} className="shrink-0" />
                            <span className="truncate">{card.scopeTag}</span>
                          </span>
                        )}
                        {card.followUpDate && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] font-extrabold ${followMeta.badgeClass}`}
                            title={`Seguimiento: ${formatFollowUpDate(card.followUpDate)} · ${followMeta.label}`}
                          >
                            <span
                              className="h-1.5 w-1.5 rounded-full"
                              style={{ backgroundColor: followMeta.color }}
                            />
                            {formatFollowUpDate(card.followUpDate)}
                          </span>
                        )}
                      </div>
                    )}

                    <div className="mt-2 flex items-center justify-between border-t border-zinc-100 pt-2">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => move(card.id, -1)}
                        aria-label={`Retroceder ${card.title}`}
                        className="grid h-7 w-7 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30"
                      >
                        <ChevronLeft size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenTask(card.id)}
                        className="text-[11px] font-bold text-zinc-400 transition-colors hover:text-brand"
                      >
                        Abrir
                      </button>
                      <button
                        type="button"
                        disabled={index === KANBAN_STATE_ORDER.length - 1}
                        onClick={() => move(card.id, 1)}
                        aria-label={`Avanzar ${card.title}`}
                        className="grid h-7 w-7 place-items-center rounded-lg text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-800 disabled:opacity-30"
                      >
                        <ChevronRight size={15} />
                      </button>
                    </div>
                  </article>
                )
              })}

              {cards.length === 0 && (
                <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-6 text-center text-[11px] text-zinc-400">
                  Sin tarjetas
                </p>
              )}
            </div>

            <div className="mt-2 flex items-center gap-1.5 rounded-xl bg-white p-1.5 shadow-sm">
              <input
                value={drafts[state]}
                onChange={(event) =>
                  setDrafts((prev) => ({ ...prev, [state]: event.target.value }))
                }
                onKeyDown={(event) => {
                  if (event.key === 'Enter') quickAdd(state)
                }}
                placeholder="+ Añadir tarea"
                aria-label={`Añadir tarea en ${meta.label}`}
                className="h-8 min-w-0 flex-1 bg-transparent px-2 text-xs text-zinc-800 outline-none placeholder:text-zinc-400"
              />
              <button
                type="button"
                onClick={() => quickAdd(state)}
                disabled={!drafts[state].trim()}
                aria-label="Crear tarea"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-brand text-white transition-colors hover:bg-brand-hover disabled:opacity-40"
              >
                <Plus size={15} />
              </button>
            </div>
          </section>
        )
      })}
      </div>
    </>
  )
}

export default KanbanBoardTab
