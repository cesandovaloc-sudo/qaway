import { useMemo, useState, useRef, useEffect } from 'react'
import {
  AlertTriangle,
  Ban,
  Bell,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileText,
  Flag,
  Link2,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  User,
  Users,
  X,
  Zap,
} from 'lucide-react'
import { useProjectWorkItems } from '@/hooks/useProjects'
import { projectsService } from '@/services/projectsService'
import { useProjectPerspective } from '../../../context/ProjectPerspectiveContext'
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
// KanbanBoardTab.tsx — b) Tablero Kanban interactivo (Task 4.2 & Fase 11)
// Supervisión territorial ergonómica: filtro dropdown sin saturación horizontal,
// avatares de alerta crítica con pulso, triple-check de contacto, feedback y
// tareas normativas vs. acciones emergentes de campo.
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
  const { perspective, isGestor, isCoordinador, isSuperAdmin, currentPersona } = useProjectPerspective()
  const [drafts, setDrafts] = useState<Record<WorkItemState, string>>(emptyDrafts)
  const [memberFilter, setMemberFilter] = useState<string | null>(() => {
    return perspective === 'gestor' ? 'Carlos Sandoval' : null
  })
  const [ugelQuery, setUgelQuery] = useState('')

  // Sincronizar filtro territorial con la perspectiva activa conmutada en el Header
  useEffect(() => {
    if (perspective === 'gestor') {
      setMemberFilter('Carlos Sandoval')
    } else {
      setMemberFilter(null)
    }
  }, [perspective])
  const [responseFilter, setResponseFilter] = useState<
    'todos' | 'esperando_respuesta' | 'respondido' | 'sin_notificar'
  >('todos')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [memberSearch, setMemberSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isDropdownOpen])

  const memberStats = useMemo(() => {
    interface Stat {
      name: string
      count: number
      urgentCount: number
      hasUrgent: boolean
    }
    const map = new Map<string, Stat>()

    for (const item of workItems) {
      const names = [item.assignee.name.trim() || 'Sin asignar']
      if (item.multiAssignees) {
        for (const co of item.multiAssignees) {
          if (co.name.trim() && !names.includes(co.name.trim())) {
            names.push(co.name.trim())
          }
        }
      }

      const followStatus = getFollowUpStatus(item.followUpDate, item.state)
      const isUrgent =
        item.priority === 'URGENTE' || followStatus === 'vencido' || Boolean(item.isBlocked)

      for (const name of names) {
        const existing = map.get(name) || { name, count: 0, urgentCount: 0, hasUrgent: false }
        existing.count += 1
        if (isUrgent) {
          existing.urgentCount += 1
          existing.hasUrgent = true
        }
        map.set(name, existing)
      }
    }

    return [...map.values()].sort((a, b) => b.urgentCount - a.urgentCount || b.count - a.count)
  }, [workItems])

  const urgentMembers = useMemo(() => {
    return memberStats.filter((m) => m.hasUrgent && m.name !== 'Sin asignar')
  }, [memberStats])

  const filteredMembersList = useMemo(() => {
    const q = memberSearch.trim().toLowerCase()
    if (!q) return memberStats
    return memberStats.filter((m) => m.name.toLowerCase().includes(q))
  }, [memberStats, memberSearch])

  const responseCounts = useMemo(() => {
    let esperando = 0
    let respondido = 0
    let sinNotificar = 0
    for (const item of workItems) {
      const st = item.gestorFeedback?.responseStatus || 'sin_notificar'
      if (st === 'esperando_respuesta') esperando++
      else if (st === 'respondido') respondido++
      else sinNotificar++
    }
    return { esperando, respondido, sinNotificar }
  }, [workItems])

  const visibleItems = useMemo(() => {
    const term = ugelQuery.trim().toLowerCase()
    return workItems.filter((item) => {
      const matchesMember =
        !memberFilter ||
        (item.assignee.name.trim() || 'Sin asignar') === memberFilter ||
        Boolean(item.multiAssignees?.some((co) => co.name.trim() === memberFilter))

      const matchesSearch =
        !term ||
        (item.scopeTag ?? '').toLowerCase().includes(term) ||
        item.title.toLowerCase().includes(term) ||
        item.id.toLowerCase().includes(term) ||
        item.assignee.name.toLowerCase().includes(term) ||
        Boolean(item.multiAssignees?.some((co) => co.name.toLowerCase().includes(term))) ||
        (item.milestoneRef ?? '').toLowerCase().includes(term)

      const responseStatus = item.gestorFeedback?.responseStatus || 'sin_notificar'
      const matchesResponse =
        responseFilter === 'todos' || responseStatus === responseFilter

      return matchesMember && matchesSearch && matchesResponse
    })
  }, [workItems, memberFilter, ugelQuery, responseFilter])

  const move = (taskId: string, direction: -1 | 1) => {
    const current = workItems.find((item) => item.id === taskId)
    if (!current) return
    const index = KANBAN_STATE_ORDER.indexOf(current.state)
    const next = KANBAN_STATE_ORDER[index + direction]
    if (!next) return
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
      originType: 'accion_emergente',
    })
    setDrafts((prev) => ({ ...prev, [state]: '' }))
  }

  return (
    <>
      {/* Barra de Filtros Ergonómica (Solución a la saturación horizontal) */}
      <div className="mb-3 space-y-2 rounded-xl border border-zinc-200 bg-white p-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="flex flex-wrap items-center gap-2">
          {/* Buscador reactivo */}
          <div className="relative min-w-[200px] flex-1">
            <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={ugelQuery}
              onChange={(event) => setUgelQuery(event.target.value)}
              placeholder="Buscar por UGEL, tarea, código o gestor…"
              aria-label="Buscar tareas"
              className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-7 text-xs text-zinc-800 outline-none transition-all placeholder:text-zinc-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
            />
            {ugelQuery && (
              <button
                type="button"
                onClick={() => setUgelQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Selector Desplegable de Gestores (Elimina botones infinitos) */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className={`inline-flex h-9 items-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors ${
                memberFilter
                  ? 'border-brand bg-brand/5 text-brand ring-2 ring-brand/15'
                  : 'border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100'
              }`}
            >
              <Users size={14} className={memberFilter ? 'text-brand' : 'text-zinc-500'} />
              <span>
                {memberFilter ? `Gestor: ${memberFilter}` : `Filtrar Gestor [Todos (${workItems.length})]`}
              </span>
              <ChevronDown size={13} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Menú flotante del selector */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-1.5 w-72 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl ring-1 ring-black/5 animate-in fade-in-50 zoom-in-95">
                <div className="relative mb-2">
                  <Search size={12} className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    value={memberSearch}
                    onChange={(e) => setMemberSearch(e.target.value)}
                    placeholder="Buscar gestor..."
                    className="h-7 w-full rounded-md border border-zinc-200 bg-zinc-50 pl-7 pr-2 text-xs outline-none focus:border-brand focus:bg-white"
                  />
                </div>

                <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
                  <button
                    type="button"
                    onClick={() => {
                      setMemberFilter(null)
                      setIsDropdownOpen(false)
                    }}
                    className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                      memberFilter === null ? 'bg-zinc-900 text-white' : 'text-zinc-700 hover:bg-zinc-100'
                    }`}
                  >
                    <span>Todos los gestores</span>
                    <span className="font-mono text-[11px] opacity-70">{workItems.length}</span>
                  </button>

                  {filteredMembersList.map((stat) => {
                    const isSelected = memberFilter === stat.name
                    return (
                      <button
                        key={stat.name}
                        type="button"
                        onClick={() => {
                          setMemberFilter(isSelected ? null : stat.name)
                          setIsDropdownOpen(false)
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs transition-colors ${
                          isSelected ? 'bg-brand text-white font-bold' : 'text-zinc-700 hover:bg-zinc-100'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[9px] font-extrabold ${
                              isSelected ? 'bg-white/20 text-white' : 'bg-zinc-200 text-zinc-800'
                            }`}
                          >
                            {stat.name.charAt(0).toUpperCase()}
                          </span>
                          <span className="truncate">{stat.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {stat.urgentCount > 0 && (
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-semibold ${
                                isSelected ? 'bg-white/20 text-white' : 'bg-zinc-100 text-zinc-600'
                              }`}
                            >
                              {stat.urgentCount} prio
                            </span>
                          )}
                          <span className="font-mono text-[11px] opacity-70">{stat.count}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Miembros prioritarios (Acceso directo sobrio) */}
          {urgentMembers.length > 0 && (
            <div className="flex items-center gap-1.5 border-l border-zinc-200 pl-2.5">
              <span className="hidden sm:inline text-[11px] font-medium text-zinc-400">
                Prioritarios:
              </span>
              <div className="flex items-center gap-1">
                {urgentMembers.map((m) => {
                  const isActive = memberFilter === m.name
                  return (
                    <button
                      key={m.name}
                      type="button"
                      onClick={() => setMemberFilter(isActive ? null : m.name)}
                      title={`${m.name}: ${m.urgentCount} tarea(s) prioritarias`}
                      className={`relative grid h-6 w-6 place-items-center rounded-full text-[10px] font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-zinc-900 text-white ring-1 ring-zinc-900 ring-offset-1'
                          : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 border border-zinc-200'
                      }`}
                    >
                      {m.name.charAt(0).toUpperCase()}
                      <span className="absolute -top-1 -right-1 grid h-3.5 w-3.5 place-items-center rounded-full bg-zinc-700 text-[8px] font-bold text-white">
                        {m.urgentCount}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Auditoría de Jornada del Coordinador (Segmentación rápida) */}
        <div className="flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 mr-1">
            Auditoría de hoy:
          </span>
          <button
            type="button"
            onClick={() => setResponseFilter('todos')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
              responseFilter === 'todos'
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
            }`}
          >
            Todas ({workItems.length})
          </button>
          <button
            type="button"
            onClick={() => setResponseFilter('esperando_respuesta')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
              responseFilter === 'esperando_respuesta'
                ? 'bg-amber-500 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200/60'
            }`}
          >
            <Clock size={11} /> Esperando Respuesta ({responseCounts.esperando})
          </button>
          <button
            type="button"
            onClick={() => setResponseFilter('respondido')}
            className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
              responseFilter === 'respondido'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <CheckCircle2 size={11} /> Respondidos ({responseCounts.respondido})
          </button>
          <button
            type="button"
            onClick={() => setResponseFilter('sin_notificar')}
            className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
              responseFilter === 'sin_notificar'
                ? 'bg-zinc-600 text-white'
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            Sin Notificar ({responseCounts.sinNotificar})
          </button>
        </div>
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
                    {/* Badge de Origen de Tarea: Oficial OM 032 vs Acción Táctica */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {card.originType === 'oficial_oficio' ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50/90 px-1.5 py-0.5 text-[9px] font-extrabold text-indigo-700"
                          title="Subproceso formal normativo del Oficio Múltiple"
                        >
                          <FileText size={10} className="shrink-0 text-indigo-600" />
                          {card.milestoneRef || 'Oficial OM 032'}
                        </span>
                      ) : card.originType === 'accion_emergente' ? (
                        <span
                          className="inline-flex items-center gap-1 rounded-md border border-amber-300 bg-amber-50 px-1.5 py-0.5 text-[9px] font-extrabold text-amber-900"
                          title="Acción táctica del equipo de gestores en campo (Excel, traslados, contingencia)"
                        >
                          <Zap size={10} className="shrink-0 text-amber-600" />
                          Acción Táctica
                        </span>
                      ) : null}

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

                    {/* Fila del Asignado y Co-Responsables */}
                    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-zinc-500">
                      <div className="inline-flex items-center gap-1.5 font-semibold">
                        <div className="flex -space-x-1.5 overflow-hidden">
                          <span
                            className="grid h-5 w-5 place-items-center rounded-full bg-zinc-900 text-[9px] font-extrabold text-white ring-1 ring-white"
                            title={`${card.assignee.name} (${card.assignee.role})`}
                          >
                            {card.assignee.name.trim().charAt(0).toUpperCase() || <User size={10} />}
                          </span>
                          {card.multiAssignees?.map((co) => (
                            <span
                              key={co.name}
                              className="grid h-5 w-5 place-items-center rounded-full bg-brand text-[9px] font-extrabold text-white ring-1 ring-white"
                              title={`Co-responsable: ${co.name} (${co.role})`}
                            >
                              {co.name.trim().charAt(0).toUpperCase()}
                            </span>
                          ))}
                        </div>
                        <span className="max-w-[130px] truncate text-zinc-700 font-bold">
                          {card.assignee.name}
                          {card.multiAssignees && card.multiAssignees.length > 0 && ` +${card.multiAssignees.length}`}
                        </span>
                      </div>
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

                    {/* Semáforo de seguimiento + UGEL */}
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

                    {/* Trazabilidad (Triple-Check) & Feedback del Gestor */}
                    {(card.notificationAudit || card.gestorFeedback) && (
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 border-t border-zinc-100 pt-1.5">
                        {card.notificationAudit?.whatsappSentAt && (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-extrabold text-emerald-700 border border-emerald-200/80"
                            title={`WhatsApp enviado: ${new Date(card.notificationAudit.whatsappSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          >
                            <MessageSquare size={9} /> ✓ WA
                          </span>
                        )}
                        {card.notificationAudit?.emailSentAt && (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-sky-50 px-1.5 py-0.5 text-[9px] font-extrabold text-sky-700 border border-sky-200/80"
                            title={`Correo enviado: ${new Date(card.notificationAudit.emailSentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                          >
                            <Mail size={9} /> ✓ Mail
                          </span>
                        )}
                        {card.notificationAudit?.appNotifiedAt && (
                          <span
                            className="inline-flex items-center gap-1 rounded bg-purple-50 px-1.5 py-0.5 text-[9px] font-extrabold text-purple-700 border border-purple-200/80"
                            title="Notificado en App"
                          >
                            <Bell size={9} /> ✓ App
                          </span>
                        )}

                        {card.gestorFeedback?.responseStatus === 'respondido' ? (
                          <span
                            className="ml-auto inline-flex items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-800 shadow-sm ring-1 ring-emerald-500/30 animate-pulse"
                            title={card.gestorFeedback.lastResponseNote ? `Respondido: "${card.gestorFeedback.lastResponseNote}"` : 'El gestor reportó cumplimiento'}
                          >
                            <CheckCircle2 size={10} className="text-emerald-600 shrink-0" /> RESPONDIDO
                          </span>
                        ) : card.gestorFeedback?.responseStatus === 'esperando_respuesta' ? (
                          <span
                            className="ml-auto inline-flex items-center gap-1 rounded-md border border-amber-200 bg-amber-50/70 px-1.5 py-0.5 text-[9px] font-semibold text-amber-800"
                            title="Esperando respuesta del gestor territorial"
                          >
                            <Clock size={9} className="shrink-0" /> Esperando respuesta
                          </span>
                        ) : null}
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
