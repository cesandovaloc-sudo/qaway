import { Fragment, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Circle,
  Clock,
  FolderKanban,
  Plus,
  RefreshCw,
  Search,
  SlidersHorizontal,
  TrendingDown,
  TrendingUp,
  Users,
  Wallet,
} from 'lucide-react'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { useProjectsDataset, useTenantFilteredProjects } from '@/hooks/useProjects'
import { projectsService } from '@/services/projectsService'
import {
  PROJECT_METHODOLOGY_META,
  type Project,
  type ProjectMethodology,
  type WorkItem,
} from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// DashboardPage.tsx — Resumen Ejecutivo de Cartera (Rediseño PMBOK/ISO 21500)
//
// Cartera = visión consolidada de la organización: avance global, desvíos en
// días, presupuesto ejecutado y proyectos en riesgo. Sin tortas de
// metodología ni scores abstractos: semáforo operativo real (En objetivo /
// En riesgo / Bloqueado), Macro-Roadmap con línea de Hoy, tabla interactiva
// con Curva S y agenda lateral. Todo deriva del store reactivo.
// ─────────────────────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
const BAR_COLORS = ['#c8102e', '#1d4ed8', '#0d9488', '#d97706', '#7c3aed', '#0284c7']
const USD_PEN = 3.75 // T.C. referencial para consolidar el KPI en soles
const DAY_MS = 86_400_000

type OpStatus = 'objetivo' | 'riesgo' | 'bloqueado'
type PortfolioView = 'resumen' | 'cronograma' | 'hitos' | 'riesgos' | 'presupuesto'
type StatusFilter = 'todos' | OpStatus
type SideTab = 'hoy' | 'proximos' | 'criticas'

const STATUS_META: Record<OpStatus, { label: string; color: string; badge: string; dot: string }> = {
  objetivo: { label: 'En objetivo', color: '#059669', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  riesgo: { label: 'En riesgo', color: '#d97706', badge: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  bloqueado: { label: 'Bloqueado', color: '#dc2626', badge: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' },
}

const VIEW_TABS: { key: PortfolioView; label: string }[] = [
  { key: 'resumen', label: 'Resumen' },
  { key: 'cronograma', label: 'Cronograma' },
  { key: 'hitos', label: 'Hitos' },
  { key: 'riesgos', label: 'Riesgos' },
  { key: 'presupuesto', label: 'Presupuesto' },
]

function parseTime(value: string | undefined): number | null {
  if (!value) return null
  const t = new Date(value.length <= 10 ? `${value}T00:00:00` : value).getTime()
  return Number.isNaN(t) ? null : t
}

function toISODate(t: number): string {
  return new Date(t).toISOString().slice(0, 10)
}

function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
  } catch {
    return `${currency} ${Math.round(value).toLocaleString('es-PE')}`
  }
}

function formatShortDate(value: string): string {
  const t = parseTime(value)
  if (t === null) return '—'
  return new Date(t).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' })
}

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[1][0]).toUpperCase()
}

/** Estado operativo real: bloqueado > en riesgo > en objetivo. */
function resolveOpStatus(project: Project, items: WorkItem[]): OpStatus {
  if (project.health === 'critico' || items.some((i) => i.isBlocked && i.state !== 'done')) return 'bloqueado'
  if (
    project.health === 'atencion' ||
    items.some((i) => i.state !== 'done' && (i.priority === 'URGENTE' || i.priority === 'ALTA' || i.isCriticalPath))
  ) {
    return 'riesgo'
  }
  return 'objetivo'
}

function plannedPctOf(project: Project, now: number): number {
  const start = parseTime(project.startDate)
  const target = parseTime(project.targetDate)
  if (start === null || target === null || target <= start) return project.progress
  if (now <= start) return 0
  if (now >= target) return 100
  return ((now - start) / (target - start)) * 100
}

/** Desvío en días: positivo = atraso, negativo = adelanto. */
function deviationDaysOf(project: Project, now: number): number {
  const start = parseTime(project.startDate)
  const target = parseTime(project.targetDate)
  if (start === null || target === null || target <= start) return 0
  const durationDays = (target - start) / DAY_MS
  return ((plannedPctOf(project, now) - project.progress) / 100) * durationDays
}

function toPEN(value: number, currency: string): number {
  return currency === 'PEN' ? value : value * USD_PEN
}

// ── Mini sparkline SVG ──
function Spark({ values, width = 72, height = 22, stroke = '#d97706', fill = false }: { values: number[]; width?: number; height?: number; stroke?: string; fill?: boolean }) {
  if (values.length < 2) return <span className="text-[11px] text-zinc-400">—</span>
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * (width - 4) + 2
    const y = height - 3 - ((v - min) / span) * (height - 6)
    return `${x.toFixed(1)},${y.toFixed(1)}`
  })
  const line = pts.join(' ')
  return (
    <svg width={width} height={height} className="shrink-0" aria-hidden="true">
      {fill && <polygon points={`2,${height - 2} ${line} ${width - 2},${height - 2}`} fill={`${stroke}22`} />}
      <polyline points={line} fill="none" stroke={stroke} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

// ── Curva S del proyecto: planificado (punteado) vs ejecutado (sólido + área) ──
function CurvaS({ progress, hoyIdx }: { progress: number; hoyIdx: number }) {
  const W = 560
  const H = 190
  const PAD = { l: 34, r: 12, t: 12, b: 24 }
  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const x = (m: number) => PAD.l + (m / 11) * iw
  const y = (pct: number) => PAD.t + (1 - Math.min(100, Math.max(0, pct)) / 100) * ih
  const planned = MONTHS_SHORT.map((_, m) => ({ x: x(m), y: y(((m + 1) / 12) * 100) }))
  const execPts: { x: number; y: number }[] = []
  for (let m = 0; m <= hoyIdx; m++) execPts.push({ x: x(m), y: y((progress * (m + 1)) / (hoyIdx + 1)) })
  const plannedLine = planned.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const execLine = execPts.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const area = execPts.length > 1 ? `${x(0).toFixed(1)},${y(0).toFixed(1)} ${execLine} ${x(hoyIdx).toFixed(1)},${y(0).toFixed(1)}` : ''
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Curva S: avance ${progress}%`}>
      {[0, 25, 50, 75, 100].map((g) => (
        <g key={g}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(g)} y2={y(g)} stroke="#e4e4e7" strokeWidth="1" strokeDasharray={g === 0 ? 'none' : '3 4'} />
          <text x={4} y={y(g) + 3.5} fontSize="9" fill="#a1a1aa" fontWeight="600">{g}%</text>
        </g>
      ))}
      {MONTHS_SHORT.map((m, i) => (
        <text key={m} x={x(i)} y={H - 8} fontSize="9" fill={i === hoyIdx ? '#18181b' : '#a1a1aa'} fontWeight={i === hoyIdx ? '800' : '500'} textAnchor="middle">
          {m}
        </text>
      ))}
      {area && <polygon points={area} fill="rgba(200,16,46,0.10)" />}
      <polyline points={plannedLine} fill="none" stroke="#a1a1aa" strokeWidth="1.6" strokeDasharray="5 4" />
      {execPts.length > 1 && <polyline points={execLine} fill="none" stroke="#c8102e" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />}
      <line x1={x(hoyIdx)} x2={x(hoyIdx)} y1={PAD.t} y2={H - PAD.b} stroke="#18181b" strokeWidth="1.2" strokeDasharray="4 3" />
      <text x={x(hoyIdx)} y={PAD.t - 2} fontSize="9" fill="#18181b" fontWeight="800" textAnchor="middle">Hoy</text>
      <g fontSize="10" fontWeight="600">
        <line x1={PAD.l} x2={PAD.l + 16} y1={H - 1} y2={H - 1} stroke="#a1a1aa" strokeWidth="1.6" strokeDasharray="4 3" />
        <text x={PAD.l + 20} y={H + 2} fill="#71717a">Planificado</text>
        <line x1={PAD.l + 108} x2={PAD.l + 124} y1={H - 1} y2={H - 1} stroke="#c8102e" strokeWidth="2.2" />
        <text x={PAD.l + 128} y={H + 2} fill="#3f3f46">Ejecutado</text>
      </g>
    </svg>
  )
}

function StatusBadge({ status }: { status: OpStatus }) {
  const meta = STATUS_META[status]
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${meta.badge}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  )
}

export default function DashboardPage() {
  const allProjects = useTenantFilteredProjects()
  const dataset = useProjectsDataset()
  const navigate = useNavigate()
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [view, setView] = useState<PortfolioView>('resumen')
  const now = useMemo(() => Date.now(), [])
  const today = useMemo(() => new Date(), [])
  const year = today.getFullYear()
  const currentMonth = today.getMonth()
  const [analysisMonth, setAnalysisMonth] = useState(currentMonth)
  const [methodFilter, setMethodFilter] = useState<'todas' | ProjectMethodology>('todas')
  const [showFilters, setShowFilters] = useState(false)

  const projects = useMemo(
    () => (methodFilter === 'todas' ? allProjects : allProjects.filter((p) => p.methodology === methodFilter)),
    [allProjects, methodFilter],
  )
  const projectIds = useMemo(() => new Set(projects.map((p) => p.id)), [projects])

  const itemsByProject = useMemo(() => {
    const map = new Map<string, WorkItem[]>()
    for (const item of dataset.workItems) {
      if (!projectIds.has(item.projectId)) continue
      const list = map.get(item.projectId) ?? []
      list.push(item)
      map.set(item.projectId, list)
    }
    return map
  }, [dataset.workItems, projectIds])

  const milestonesByProject = useMemo(() => {
    const map = new Map<string, typeof dataset.milestones>()
    for (const m of dataset.milestones) {
      if (!projectIds.has(m.projectId)) continue
      const list = map.get(m.projectId) ?? []
      list.push(m)
      map.set(m.projectId, list)
    }
    for (const list of map.values()) list.sort((a, b) => a.targetDate.localeCompare(b.targetDate))
    return map
  }, [dataset.milestones, projectIds])

  const statusOf = useMemo(() => {
    const map = new Map<string, OpStatus>()
    for (const p of projects) map.set(p.id, resolveOpStatus(p, itemsByProject.get(p.id) ?? []))
    return map
  }, [projects, itemsByProject])

  const activeProjects = useMemo(() => projects.filter((p) => p.status !== 'completado'), [projects])
  const counts = useMemo(() => {
    let riesgo = 0
    let bloqueado = 0
    let objetivo = 0
    for (const p of activeProjects) {
      const s = statusOf.get(p.id) ?? 'objetivo'
      if (s === 'riesgo') riesgo += 1
      else if (s === 'bloqueado') bloqueado += 1
      else objetivo += 1
    }
    return { total: activeProjects.length, riesgo, bloqueado, objetivo }
  }, [activeProjects, statusOf])

  const avgProgress = useMemo(
    () => (projects.length ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length) : 0),
    [projects],
  )
  const avgPlanned = useMemo(
    () => (projects.length ? Math.round(projects.reduce((s, p) => s + plannedPctOf(p, now), 0) / projects.length) : 0),
    [projects, now],
  )
  const avgDeviation = useMemo(
    () => (projects.length ? Math.round(projects.reduce((s, p) => s + deviationDaysOf(p, now), 0) / projects.length) : 0),
    [projects, now],
  )
  const deviationSpark = useMemo(() => projects.map((p) => Math.round(deviationDaysOf(p, now))), [projects, now])

  const budget = useMemo(() => {
    const allocated = projects.reduce((s, p) => s + toPEN(p.budget.allocated, p.budget.currency), 0)
    const spent = projects.reduce((s, p) => s + toPEN(p.budget.spent, p.budget.currency), 0)
    return { allocated: Math.round(allocated), spent: Math.round(spent), pct: allocated > 0 ? Math.round((spent / allocated) * 100) : 0 }
  }, [projects])

  // ── Roadmap: ventana Ene–Dic del año en curso ──
  const yearStart = useMemo(() => new Date(year, 0, 1).getTime(), [year])
  const yearEnd = useMemo(() => new Date(year, 11, 31, 23, 59, 59).getTime(), [year])
  const pctOf = (t: number) => Math.min(100, Math.max(0, ((t - yearStart) / (yearEnd - yearStart)) * 100))
  const hoyPct = pctOf(now)
  const hoyIdx = Math.min(11, Math.max(0, currentMonth))

  const roadmapRows = useMemo(
    () =>
      [...activeProjects]
        .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
        .slice(0, 6)
        .map((p) => {
          const s = parseTime(p.startDate) ?? yearStart
          const e = parseTime(p.targetDate) ?? yearEnd
          const left = Math.min(100, pctOf(Math.max(s, yearStart)))
          const right = Math.max(left + 1.5, Math.min(100, pctOf(Math.min(e, yearEnd + 1))))
          return { project: p, left, width: Math.max(1.5, right - left) }
        }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [activeProjects, yearStart, yearEnd],
  )

  const nextMilestoneOf = (projectId: string) => {
    const list = milestonesByProject.get(projectId) ?? []
    return list.find((m) => m.status !== 'aprobado')
  }

  const upcomingMilestones = useMemo(
    () =>
      dataset.milestones
        .filter((m) => projectIds.has(m.projectId) && m.status !== 'aprobado')
        .sort((a, b) => a.targetDate.localeCompare(b.targetDate)),
    [dataset.milestones, projectIds],
  )

  const monthMilestones = useMemo(
    () =>
      upcomingMilestones.filter((m) => {
        const t = parseTime(m.targetDate)
        if (t === null) return false
        const d = new Date(t)
        return d.getFullYear() === year && d.getMonth() === analysisMonth
      }),
    [upcomingMilestones, analysisMonth, year],
  )

  const todayKey = toISODate(now)
  const todayMilestones = useMemo(
    () => upcomingMilestones.filter((m) => m.targetDate.slice(0, 10) === todayKey),
    [upcomingMilestones, todayKey],
  )

  const criticalTasks = useMemo(
    () =>
      dataset.workItems
        .filter(
          (i) =>
            projectIds.has(i.projectId) &&
            i.state !== 'done' &&
            (i.isBlocked || i.priority === 'URGENTE' || i.priority === 'ALTA'),
        )
        .sort((a, b) => {
          const rank = (w: WorkItem) => (w.isBlocked ? 0 : w.priority === 'URGENTE' ? 1 : 2)
          return rank(a) - rank(b)
        })
        .slice(0, 6),
    [dataset.workItems, projectIds],
  )

  const attentionProjects = useMemo(
    () =>
      activeProjects
        .filter((p) => (statusOf.get(p.id) ?? 'objetivo') !== 'objetivo')
        .sort((a, b) => {
          const order: Record<OpStatus, number> = { bloqueado: 0, riesgo: 1, objetivo: 2 }
          return (order[statusOf.get(a.id) ?? 'objetivo'] ?? 2) - (order[statusOf.get(b.id) ?? 'objetivo'] ?? 2)
        })
        .slice(0, 3),
    [activeProjects, statusOf],
  )

  const recentActivity = useMemo(
    () =>
      dataset.workItems
        .filter((i) => projectIds.has(i.projectId) && i.state === 'done' && i.completedAt)
        .sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? ''))
        .slice(0, 5),
    [dataset.workItems, projectIds],
  )

  const projectNameOf = (id: string) => projects.find((p) => p.id === id)?.name ?? 'Proyecto'

  const analysisLabel = useMemo(() => {
    const label = new Date(year, analysisMonth, 1).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }, [year, analysisMonth])

  const stepMonth = (delta: number) => setAnalysisMonth((m) => (m + delta + 12) % 12)

  return (
    <div className="mx-auto max-w-[1800px]">
      {/* Encabezado */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="grid h-[38px] w-[38px] place-items-center rounded-[10px] border border-zinc-200 bg-zinc-100 text-zinc-900">
            <FolderKanban size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.8px] text-zinc-900">
              Cartera de Proyectos
            </h1>
            <p className="text-[13px] text-zinc-500">
              Visión ejecutiva consolidada: avance global, desvíos en días, presupuesto y riesgo.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => projectsService.resetDemoData()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
            title="Restablecer datos de demostración"
          >
            <RefreshCw size={15} />
            Datos demo
          </button>
          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white shadow-[0_2px_8px_rgba(255,75,11,0.28)] transition-colors hover:bg-brand-hover"
          >
            <Plus size={16} />
            Nuevo proyecto
          </button>
        </div>
      </div>

      {/* Pestañas de vista + mes de análisis + filtros */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white p-1">
          {VIEW_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setView(t.key)}
              className={`h-9 rounded-lg px-3.5 text-sm font-medium transition-colors ${
                view === t.key ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-2">
          <div className="flex items-center gap-1 rounded-xl border border-zinc-200 bg-white px-2 py-1">
            <button type="button" onClick={() => stepMonth(-1)} aria-label="Mes anterior" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
              <ChevronLeft size={16} />
            </button>
            <span className="min-w-[130px] text-center text-sm font-bold text-zinc-900">{analysisLabel}</span>
            <button type="button" onClick={() => stepMonth(1)} aria-label="Mes siguiente" className="grid h-8 w-8 place-items-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900">
              <ChevronRight size={16} />
            </button>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-semibold transition-colors ${
              showFilters ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            <SlidersHorizontal size={15} />
            Filtros
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white p-3">
          <label className="text-xs font-semibold text-zinc-500" htmlFor="resumen-method">Metodología</label>
          <select
            id="resumen-method"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value as 'todas' | ProjectMethodology)}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-700 outline-none focus:border-brand"
          >
            <option value="todas">Todas las metodologías</option>
            {(Object.keys(PROJECT_METHODOLOGY_META) as ProjectMethodology[]).map((m) => (
              <option key={m} value={m}>{PROJECT_METHODOLOGY_META[m].label}</option>
            ))}
          </select>
          <span className="text-xs font-medium text-zinc-400">{projects.length} proyectos en el alcance</span>
        </div>
      )}

      {/* ── Macro-Roadmap de cartera ── */}
      {(view === 'resumen' || view === 'cronograma') && (
        <section className="mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between gap-3 border-b border-zinc-100 px-5 py-3.5">
            <div>
              <h2 className="text-sm font-bold text-zinc-900">Macro-Roadmap de cartera · {year}</h2>
              <p className="text-[13px] text-zinc-500">Cronograma consolidado con hitos clave y línea de Hoy</p>
            </div>
            <span className="hidden items-center gap-2 text-[11px] font-semibold text-zinc-500 sm:flex">
              <span className="inline-block h-2 w-2 rotate-45 bg-zinc-700" /> Hito
              <span className="ml-2 inline-block h-2.5 w-2.5 rounded-full border-2 border-zinc-700 bg-white" /> En revisión
            </span>
          </div>
          <div className="overflow-x-auto px-5 py-4">
            <div className="min-w-[860px]">
              {/* Eje de meses */}
              <div className="relative mb-2 ml-[220px]">
                <div className="grid grid-cols-12">
                  {MONTHS_SHORT.map((m, i) => (
                    <div
                      key={m}
                      className={`rounded-md py-1 text-center text-[11px] font-bold uppercase tracking-wide ${i === analysisMonth ? 'bg-zinc-900 text-white' : 'text-zinc-400'}`}
                    >
                      {m}
                    </div>
                  ))}
                </div>
              </div>
              {/* Filas por proyecto */}
              <div className="relative">
                {/* Línea de Hoy */}
                <div className="pointer-events-none absolute inset-y-0 z-10" style={{ left: `calc(220px + (100% - 220px) * ${hoyPct / 100})` }}>
                  <div className="absolute inset-y-0 -translate-x-1/2 border-l-2 border-dashed border-zinc-900/70" />
                  <span className="absolute -top-1 -translate-x-1/2 rounded-md bg-zinc-900 px-2 py-0.5 text-[10px] font-bold text-white">Hoy</span>
                </div>
                <div className="space-y-2.5 pb-1">
                  {roadmapRows.map(({ project, left, width }, i) => {
                    const color = BAR_COLORS[i % BAR_COLORS.length]
                    const marks = (milestonesByProject.get(project.id) ?? []).filter((m) => {
                      const t = parseTime(m.targetDate)
                      return t !== null && t >= yearStart && t <= yearEnd
                    })
                    return (
                      <div key={project.id} className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => navigate(`proyectos/${project.id}`)}
                          title={`Abrir ${project.name}`}
                          className="w-[208px] shrink-0 truncate text-left text-[13px] font-semibold text-zinc-700 hover:text-zinc-900"
                        >
                          {project.name}
                        </button>
                        <div className="relative h-9 flex-1 rounded-lg bg-zinc-50">
                          <div
                            className="absolute top-1/2 h-[14px] -translate-y-1/2 rounded-full opacity-90"
                            style={{ left: `${left}%`, width: `${width}%`, backgroundColor: color }}
                            title={`${project.name}: ${formatShortDate(project.startDate)} → ${formatShortDate(project.targetDate)}`}
                          />
                          {marks.map((m) => (
                            <span
                              key={m.id}
                              title={`${m.name} · ${formatShortDate(m.targetDate)}`}
                              className={`absolute top-1/2 -translate-x-1/2 -translate-y-1/2 ${
                                m.status === 'aprobado'
                                  ? 'inline-block h-2.5 w-2.5 rotate-45 bg-zinc-900 ring-2 ring-white'
                                  : 'inline-block h-2.5 w-2.5 rounded-full border-2 border-zinc-900 bg-white'
                              }`}
                              style={{ left: `${pctOf(parseTime(m.targetDate) ?? yearStart)}%` }}
                            />
                          ))}
                        </div>
                      </div>
                    )
                  })}
                  {roadmapRows.length === 0 && (
                    <p className="py-8 text-center text-sm font-medium text-zinc-500">Sin proyectos en el roadmap.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Tira ejecutiva de 4 KPIs ── */}
      {(view === 'resumen' || view === 'presupuesto') && (
        <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-semibold text-zinc-500">Proyectos activos</p>
            <p className="mt-1 text-[28px] font-extrabold leading-none tracking-tight text-zinc-900">{counts.total}</p>
            <p className="mt-2 flex items-center gap-2 text-[11px] font-semibold">
              <span className="inline-flex items-center gap-1 text-amber-700"><span className="h-1.5 w-1.5 rounded-full bg-amber-500" />{counts.riesgo} en riesgo</span>
              <span className="inline-flex items-center gap-1 text-red-700"><span className="h-1.5 w-1.5 rounded-full bg-red-500" />{counts.bloqueado} bloqueado</span>
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-semibold text-zinc-500">Avance promedio</p>
            <p className="mt-1 text-[28px] font-extrabold leading-none tracking-tight text-zinc-900">{avgProgress}%</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.min(100, Math.max(0, avgProgress))}%` }} />
            </div>
            <p className={`mt-1.5 flex items-center gap-1 text-[11px] font-semibold ${avgProgress - avgPlanned >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {avgProgress - avgPlanned >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
              {avgProgress - avgPlanned >= 0 ? '+' : ''}{avgProgress - avgPlanned} pts vs. planificado ({avgPlanned}%)
            </p>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-semibold text-zinc-500">Desviación de cronograma</p>
            <p className={`mt-1 flex items-center gap-1.5 text-[28px] font-extrabold leading-none tracking-tight ${avgDeviation > 0 ? 'text-red-700' : avgDeviation < 0 ? 'text-emerald-700' : 'text-zinc-900'}`}>
              {avgDeviation > 0 ? `+${avgDeviation}` : avgDeviation} días
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Spark values={deviationSpark.length ? deviationSpark : [0, 0]} stroke={avgDeviation > 0 ? '#dc2626' : '#059669'} />
              <span className="text-[11px] font-medium text-zinc-500">desviación de cronograma</span>
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
            <p className="text-xs font-semibold text-zinc-500">Presupuesto ejecutado</p>
            <p className="mt-1 text-[28px] font-extrabold leading-none tracking-tight text-zinc-900">{formatCurrency(budget.spent, 'PEN')}</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-zinc-100">
              <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.min(100, budget.pct)}%` }} />
            </div>
            <p className="mt-1.5 text-[11px] font-semibold text-zinc-500">de {formatCurrency(budget.allocated, 'PEN')} ({budget.pct}%)</p>
          </div>
        </section>
      )}

      {/* ── Hitos (vista) ── */}
      {view === 'hitos' && (
        <section className="mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="border-b border-zinc-100 px-5 py-3.5">
            <h2 className="text-sm font-bold text-zinc-900">Próximos hitos de la cartera</h2>
            <p className="text-[13px] text-zinc-500">{upcomingMilestones.length} hitos pendientes ordenados por fecha</p>
          </div>
          <ul className="divide-y divide-zinc-50">
            {upcomingMilestones.slice(0, 12).map((m) => (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => navigate(`proyectos/${m.projectId}?tab=hitos`)}
                  className="flex w-full items-center gap-3 px-5 py-3 text-left transition-colors hover:bg-zinc-50"
                >
                  {m.status === 'en_revision'
                    ? <Clock size={16} className="shrink-0 text-amber-600" />
                    : <Circle size={16} className="shrink-0 text-zinc-300" />}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900">{m.name}</span>
                    <span className="block truncate text-[13px] text-zinc-500">{projectNameOf(m.projectId)}</span>
                  </span>
                  <span className="shrink-0 text-[12px] font-semibold text-zinc-500">{formatShortDate(m.targetDate)}</span>
                </button>
              </li>
            ))}
            {upcomingMilestones.length === 0 && (
              <li className="px-5 py-10 text-center text-sm font-medium text-zinc-500">Sin hitos pendientes.</li>
            )}
          </ul>
        </section>
      )}

      {/* ── Presupuesto (vista) ── */}
      {view === 'presupuesto' && (
        <section className="mb-4 overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
          <div className="border-b border-zinc-100 px-5 py-3.5">
            <h2 className="text-sm font-bold text-zinc-900">Ejecución presupuestaria por proyecto</h2>
            <p className="text-[13px] text-zinc-500">Montos nativos por proyecto · consolidado en soles (T.C. ref. {USD_PEN})</p>
          </div>
          <div className="space-y-3 px-5 py-4">
            {projects.map((p) => {
              const pct = p.budget.allocated > 0 ? Math.round((p.budget.spent / p.budget.allocated) * 100) : 0
              return (
                <div key={p.id}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="truncate font-semibold text-zinc-700">{p.name}</span>
                    <span className="shrink-0 font-mono font-bold text-zinc-700">{pct}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
                    <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.min(100, Math.max(2, pct))}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-zinc-500">
                    {formatCurrency(p.budget.spent, p.budget.currency)} de {formatCurrency(p.budget.allocated, p.budget.currency)}
                  </p>
                </div>
              )
            })}
          </div>
        </section>
      )}

      {/* ── Contenido principal + lateral ── */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <PortfolioTable
            projects={view === 'riesgos' ? activeProjects.filter((p) => (statusOf.get(p.id) ?? 'objetivo') !== 'objetivo') : [...activeProjects].sort((a, b) => {
              const order: Record<OpStatus, number> = { bloqueado: 0, riesgo: 1, objetivo: 2 }
              return (order[statusOf.get(a.id) ?? 'objetivo'] ?? 2) - (order[statusOf.get(b.id) ?? 'objetivo'] ?? 2)
            })}
            statusOf={statusOf}
            milestonesByProject={milestonesByProject}
            itemsByProject={itemsByProject}
            nextMilestoneOf={nextMilestoneOf}
            hoyIdx={hoyIdx}
            now={now}
            onOpen={(id) => navigate(`proyectos/${id}`)}
            showRiskBanner={view === 'riesgos'}
          />
        </div>

        <aside className="space-y-4">
          <AgendaCard
            todayMilestones={todayMilestones}
            monthMilestones={monthMilestones}
            criticalTasks={criticalTasks}
            projectNameOf={projectNameOf}
            analysisLabel={analysisLabel}
            onOpenProject={(id, tab) => navigate(tab ? `proyectos/${id}?tab=${tab}` : `proyectos/${id}`)}
          />
          <AttentionCard
            attentionProjects={attentionProjects}
            statusOf={statusOf}
            nextMilestoneOf={nextMilestoneOf}
            onOpen={(id) => navigate(`proyectos/${id}`)}
          />
          <ActivityCard recentActivity={recentActivity} />
        </aside>
      </div>

      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  )
}

// ── Tabla de cartera con acordeón y Curva S ──
function PortfolioTable({
  projects,
  statusOf,
  milestonesByProject,
  itemsByProject,
  nextMilestoneOf,
  hoyIdx,
  now,
  onOpen,
  showRiskBanner,
}: {
  projects: Project[]
  statusOf: Map<string, OpStatus>
  milestonesByProject: Map<string, { id: string; name: string; targetDate: string; status: string }[]>
  itemsByProject: Map<string, WorkItem[]>
  nextMilestoneOf: (projectId: string) => { id: string; name: string; targetDate: string; status: string } | undefined
  hoyIdx: number
  now: number
  onOpen: (id: string) => void
  showRiskBanner: boolean
}) {
  const [filter, setFilter] = useState<StatusFilter>('todos')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const counts = useMemo(() => {
    let riesgo = 0
    let bloqueado = 0
    let objetivo = 0
    for (const p of projects) {
      const s = statusOf.get(p.id) ?? 'objetivo'
      if (s === 'riesgo') riesgo += 1
      else if (s === 'bloqueado') bloqueado += 1
      else objetivo += 1
    }
    return { todos: projects.length, riesgo, bloqueados: bloqueado, objetivo }
  }, [projects, statusOf])

  const rows = useMemo(() => {
    const term = search.trim().toLowerCase()
    return projects.filter((p) => {
      if (filter !== 'todos' && (statusOf.get(p.id) ?? 'objetivo') !== filter) return false
      if (!term) return true
      return `${p.name} ${p.client} ${p.code} ${p.manager}`.toLowerCase().includes(term)
    })
  }, [projects, filter, search, statusOf])

  const pills: { key: StatusFilter; label: string; count: number }[] = [
    { key: 'todos', label: 'Todos', count: counts.todos },
    { key: 'riesgo', label: 'En riesgo', count: counts.riesgo },
    { key: 'bloqueado', label: 'Bloqueados', count: counts.bloqueados },
    { key: 'objetivo', label: 'En objetivo', count: counts.objetivo },
  ]

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      {showRiskBanner && (
        <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-5 py-2.5 text-[13px] font-semibold text-red-700">
          <AlertTriangle size={15} /> Vista: proyectos que requieren atención
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-100 px-5 py-3">
        {pills.map((pill) => (
          <button
            key={pill.key}
            type="button"
            onClick={() => setFilter(pill.key)}
            className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors ${
              filter === pill.key
                ? 'border-zinc-900 bg-zinc-900 text-white font-semibold'
                : 'border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50'
            }`}
          >
            {pill.label}
            <span className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold ${filter === pill.key ? 'bg-white/20' : 'bg-zinc-100 text-zinc-600'}`}>
              {pill.count}
            </span>
          </button>
        ))}
        <div className="relative ml-auto min-w-[200px] flex-1 sm:max-w-[240px]">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar proyecto…"
            className="h-9 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-800 outline-none placeholder:text-zinc-400 focus:border-brand"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table data-testid="portfolio-table" className="w-full min-w-[860px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-2.5">Proyecto</th>
              <th className="px-4 py-2.5">Metodología</th>
              <th className="px-4 py-2.5">Avance</th>
              <th className="px-4 py-2.5">Cronograma</th>
              <th className="px-4 py-2.5">Próximo hito</th>
              <th className="px-5 py-2.5">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => {
              const status = statusOf.get(p.id) ?? 'objetivo'
              const meta = PROJECT_METHODOLOGY_META[p.methodology]
              const next = nextMilestoneOf(p.id)
              const dev = Math.round(deviationDaysOf(p, now))
              const expanded = expandedId === p.id
              const milestones = milestonesByProject.get(p.id) ?? []
              const team = (itemsByProject.get(p.id) ?? []).map((i) => i.assignee.name).filter(Boolean)
              const uniqueTeam = [...new Set(team)].slice(0, 4)
              const extraTeam = new Set(team).size - uniqueTeam.length
              const budgetPct = p.budget.allocated > 0 ? Math.round((p.budget.spent / p.budget.allocated) * 100) : 0
              return (
                <Fragment key={p.id}>
                  <tr
                    onClick={() => setExpandedId(expanded ? null : p.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') setExpandedId(expanded ? null : p.id)
                    }}
                    tabIndex={0}
                    title={expanded ? 'Contraer detalle' : `Desplegar detalle de ${p.name}`}
                    className={`cursor-pointer border-b border-zinc-50 transition-colors outline-none hover:bg-zinc-50/70 focus-visible:ring-2 focus-visible:ring-brand/40 ${expanded ? 'bg-zinc-50/70' : ''}`}
                  >
                    <td className="px-5 py-3">
                      <p className="flex items-center gap-1.5 text-sm font-bold text-zinc-900">
                        {p.name}
                        <ChevronDown size={14} className={`shrink-0 text-zinc-400 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                      </p>
                      <p className="mt-0.5 truncate text-[11px] text-zinc-400">{p.client}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.badgeClass}`}>
                        {meta.short}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-[90px] overflow-hidden rounded-full bg-zinc-100">
                          <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${Math.min(100, Math.max(0, p.progress))}%` }} />
                        </div>
                        <span className="font-mono text-[12px] font-bold text-zinc-700">{p.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5" title={`Desvío: ${dev > 0 ? `+${dev}` : dev} días`}>
                        <Spark values={[0, p.progress / 2, p.progress]} stroke={dev > 0 ? '#dc2626' : '#059669'} />
                        <span className={`font-mono text-[11px] font-bold ${dev > 0 ? 'text-red-700' : dev < 0 ? 'text-emerald-700' : 'text-zinc-400'}`}>
                          {dev > 0 ? `+${dev}d` : `${dev}d`}
                        </span>
                      </span>
                    </td>
                    <td className="max-w-[190px] px-4 py-3">
                      {next ? (
                        <>
                          <p className="truncate text-[13px] font-semibold text-zinc-700">{next.name}</p>
                          <p className="text-[11px] text-zinc-400">{formatShortDate(next.targetDate)}</p>
                        </>
                      ) : (
                        <span className="text-[13px] text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3"><StatusBadge status={status} /></td>
                  </tr>
                  {expanded && (
                    <tr key={`${p.id}-detail`} className="border-b border-zinc-100 bg-zinc-50/60">
                      <td colSpan={6} className="px-5 py-4">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                          <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Hitos principales</h4>
                            <ul className="mt-2.5 space-y-2">
                              {milestones.slice(0, 5).map((m) => (
                                <li key={m.id} className="flex items-start gap-2 text-[13px]">
                                  {m.status === 'aprobado'
                                    ? <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"><Check size={11} strokeWidth={3} /></span>
                                    : <Circle size={15} className="mt-0.5 shrink-0 text-zinc-300" />}
                                  <span className={m.status === 'aprobado' ? 'text-zinc-400 line-through' : 'font-medium text-zinc-700'}>
                                    {m.name}
                                    <span className="block text-[11px] font-normal text-zinc-400">{formatShortDate(m.targetDate)}</span>
                                  </span>
                                </li>
                              ))}
                              {milestones.length === 0 && <li className="text-[13px] text-zinc-400">Sin hitos registrados.</li>}
                            </ul>
                          </div>
                          <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Avance del proyecto · Curva S</h4>
                            <div className="mt-2"><CurvaS progress={p.progress} hoyIdx={hoyIdx} /></div>
                          </div>
                          <div className="rounded-xl border border-zinc-200 bg-white p-4">
                            <h4 className="text-xs font-bold uppercase tracking-wide text-zinc-500">Presupuesto y equipo</h4>
                            <p className="mt-2.5 font-mono text-sm font-bold text-zinc-900">
                              {formatCurrency(p.budget.spent, p.budget.currency)}
                              <span className="font-sans font-medium text-zinc-400"> de {formatCurrency(p.budget.allocated, p.budget.currency)} ({budgetPct}%)</span>
                            </p>
                            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-100">
                              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, Math.max(2, budgetPct))}%` }} />
                            </div>
                            <div className="mt-3 flex items-center">
                              {uniqueTeam.map((name) => (
                                <span key={name} title={name} className="-ml-1.5 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-zinc-200 text-[10px] font-bold text-zinc-700 first:ml-0">
                                  {initialsOf(name)}
                                </span>
                              ))}
                              {extraTeam > 0 && (
                                <span className="-ml-1.5 grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-zinc-900 text-[10px] font-bold text-white">+{extraTeam}</span>
                              )}
                              {uniqueTeam.length === 0 && <span className="text-[13px] text-zinc-400">Sin equipo asignado.</span>}
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation()
                                onOpen(p.id)
                              }}
                              className="mt-4 inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-900 px-3.5 text-xs font-bold text-white transition-colors hover:bg-zinc-700"
                            >
                              Abrir proyecto <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
        {rows.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400">
              <FolderKanban size={22} />
            </div>
            <p className="text-sm font-semibold text-zinc-700">Sin proyectos que coincidan</p>
            <p className="max-w-sm text-[13px] text-zinc-400">Ajusta los filtros o el buscador para ver la cartera.</p>
          </div>
        )}
      </div>
    </section>
  )
}

// ── Agenda lateral ──
function AgendaCard({
  todayMilestones,
  monthMilestones,
  criticalTasks,
  projectNameOf,
  analysisLabel,
  onOpenProject,
}: {
  todayMilestones: { id: string; projectId: string; name: string; targetDate: string }[]
  monthMilestones: { id: string; projectId: string; name: string; targetDate: string }[]
  criticalTasks: WorkItem[]
  projectNameOf: (id: string) => string
  analysisLabel: string
  onOpenProject: (id: string, tab?: string) => void
}) {
  const [tab, setSideTab] = useState<SideTab>('hoy')
  const times = ['09:00', '11:00', '15:00']
  const sideTabs: { key: SideTab; label: string }[] = [
    { key: 'hoy', label: 'Hoy' },
    { key: 'proximos', label: 'Próximos' },
    { key: 'criticas', label: 'Tareas críticas' },
  ]
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center gap-1 border-b border-zinc-100 px-3 pt-3">
        {sideTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSideTab(t.key)}
            className={`h-9 rounded-lg px-3 text-sm font-medium transition-colors ${tab === t.key ? 'bg-zinc-100 text-zinc-900 font-semibold' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="px-4 py-3">
        {tab === 'hoy' && (
          <ul className="space-y-1">
            {todayMilestones.slice(0, 5).map((m, i) => (
              <li key={m.id}>
                <button type="button" onClick={() => onOpenProject(m.projectId, 'hitos')} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-zinc-50">
                  <span className="w-11 shrink-0 font-mono text-[12px] font-bold text-zinc-500">{times[i % times.length]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900">{m.name}</span>
                    <span className="block truncate text-[11px] text-zinc-400">{projectNameOf(m.projectId)} · Hito</span>
                  </span>
                </button>
              </li>
            ))}
            {todayMilestones.length === 0 && (
              <li className="flex items-center gap-2 px-2 py-4 text-[13px] text-zinc-400">
                <CalendarDays size={15} /> Sin actividades para hoy.
              </li>
            )}
          </ul>
        )}
        {tab === 'proximos' && (
          <ul className="space-y-1">
            {monthMilestones.slice(0, 6).map((m) => (
              <li key={m.id}>
                <button type="button" onClick={() => onOpenProject(m.projectId, 'hitos')} className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-zinc-50">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-zinc-100 text-[12px] font-extrabold text-zinc-700">
                    {formatShortDate(m.targetDate).slice(0, 2)}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900">{m.name}</span>
                    <span className="block truncate text-[11px] text-zinc-400">{projectNameOf(m.projectId)} · {formatShortDate(m.targetDate)}</span>
                  </span>
                </button>
              </li>
            ))}
            {monthMilestones.length === 0 && (
              <li className="px-2 py-4 text-[13px] text-zinc-400">Sin hitos en {analysisLabel}.</li>
            )}
          </ul>
        )}
        {tab === 'criticas' && (
          <ul className="space-y-1">
            {criticalTasks.map((t) => (
              <li key={t.id}>
                <button type="button" onClick={() => onOpenProject(t.projectId, 'kanban')} className="flex w-full items-center gap-2.5 rounded-lg px-2 py-2 text-left transition-colors hover:bg-zinc-50">
                  <AlertTriangle size={15} className={`shrink-0 ${t.isBlocked ? 'text-red-600' : 'text-amber-600'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-zinc-900">{t.title}</span>
                    <span className="block truncate text-[11px] text-zinc-400">
                      {projectNameOf(t.projectId)} · {t.isBlocked ? 'Bloqueada' : t.priority}
                    </span>
                  </span>
                </button>
              </li>
            ))}
            {criticalTasks.length === 0 && (
              <li className="px-2 py-4 text-[13px] text-zinc-400">Sin tareas críticas abiertas.</li>
            )}
          </ul>
        )}
        <button
          type="button"
          onClick={() => onOpenProject(monthMilestones[0]?.projectId ?? todayMilestones[0]?.projectId ?? criticalTasks[0]?.projectId ?? '', 'calendar')}
          className="mt-2 inline-flex items-center gap-1 px-2 py-1 text-[13px] font-semibold text-zinc-700 hover:text-zinc-900"
        >
          Ver calendario completo <ArrowRight size={13} />
        </button>
      </div>
    </section>
  )
}

// ── Proyectos en atención ──
function AttentionCard({
  attentionProjects,
  statusOf,
  nextMilestoneOf,
  onOpen,
}: {
  attentionProjects: Project[]
  statusOf: Map<string, OpStatus>
  nextMilestoneOf: (projectId: string) => { id: string; name: string; targetDate: string; status: string } | undefined
  onOpen: (id: string) => void
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <h3 className="text-sm font-bold text-zinc-900">Proyectos en atención ({attentionProjects.length})</h3>
        <AlertTriangle size={16} className="text-amber-600" />
      </div>
      <ul className="divide-y divide-zinc-50">
        {attentionProjects.map((p) => {
          const next = nextMilestoneOf(p.id)
          return (
            <li key={p.id}>
              <button type="button" onClick={() => onOpen(p.id)} className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left transition-colors hover:bg-zinc-50">
                <span className={`h-2 w-2 shrink-0 rounded-full ${STATUS_META[statusOf.get(p.id) ?? 'riesgo'].dot}`} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-zinc-900">{p.name}</span>
                  <span className="block truncate text-[11px] text-zinc-400">
                    {next ? `${next.name} · ${formatShortDate(next.targetDate)}` : 'Sin hito próximo'}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
        {attentionProjects.length === 0 && (
          <li className="px-4 py-6 text-center text-[13px] text-zinc-400">Cartera sin proyectos en atención.</li>
        )}
      </ul>
    </section>
  )
}

// ── Actividad reciente ──
function ActivityCard({ recentActivity }: { recentActivity: WorkItem[] }) {
  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between border-b border-zinc-100 px-4 py-3">
        <h3 className="text-sm font-bold text-zinc-900">Actividad reciente</h3>
        <Users size={16} className="text-zinc-400" />
      </div>
      <ul className="space-y-1 px-2 py-2">
        {recentActivity.map((item) => (
          <li key={item.id} className="flex items-center gap-2.5 rounded-lg px-2 py-1.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-zinc-100 text-[10px] font-bold text-zinc-700">
              {initialsOf(item.assignee.name)}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] text-zinc-700">
                <span className="font-semibold text-zinc-900">{item.assignee.name}</span> cerró {item.title}
              </span>
              <span className="block text-[11px] text-zinc-400">
                {item.completedAt ? formatShortDate(item.completedAt) : ''} · <Wallet size={10} className="inline" /> tarea completada
              </span>
            </span>
          </li>
        ))}
        {recentActivity.length === 0 && (
          <li className="px-2 py-4 text-center text-[13px] text-zinc-400">Sin actividad reciente registrada.</li>
        )}
      </ul>
    </section>
  )
}
