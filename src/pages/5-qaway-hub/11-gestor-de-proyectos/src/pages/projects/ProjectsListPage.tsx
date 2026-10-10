import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Filter, FolderKanban, Plus, Search } from 'lucide-react'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { useProjects } from '@/hooks/useProjects'
import {
  PROJECT_HEALTH_META,
  PROJECT_METHODOLOGY_META,
  PROJECT_STATUS_META,
  type ProjectMethodology,
  type ProjectStatus,
} from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// ProjectsListPage.tsx — Directorio de Proyectos (Task 3.2)
// Tabla interactiva estilo 10-inventario con filtros por metodología/estado
// y buscador en tiempo real sobre el store reactivo.
// ─────────────────────────────────────────────────────────────────────────

type MethodologyFilter = 'todas' | ProjectMethodology
type StatusFilter = 'todos' | ProjectStatus

const selectClass =
  'h-10 rounded-lg border border-zinc-200 bg-white pl-9 pr-9 text-sm font-medium text-zinc-700 outline-none transition-all appearance-none focus:border-brand focus:ring-2 focus:ring-brand/15'

function formatCurrency(value: number, currency: string) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: '2-digit' })
}

export default function ProjectsListPage() {
  const projects = useProjects()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [methodology, setMethodology] = useState<MethodologyFilter>('todas')
  const [status, setStatus] = useState<StatusFilter>('todos')
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    return projects.filter((project) => {
      const matchesMethodology = methodology === 'todas' || project.methodology === methodology
      const matchesStatus = status === 'todos' || project.status === status
      const matchesSearch =
        !term ||
        project.code.toLowerCase().includes(term) ||
        project.name.toLowerCase().includes(term) ||
        project.client.toLowerCase().includes(term) ||
        project.manager.toLowerCase().includes(term)
      return matchesMethodology && matchesStatus && matchesSearch
    })
  }, [projects, search, methodology, status])

  return (
    <div className="mx-auto max-w-[1800px]">
      {/* Encabezado */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="grid h-[38px] w-[38px] place-items-center rounded-[10px] border border-zinc-200 bg-zinc-100 text-zinc-900">
            <FolderKanban size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.8px] text-zinc-900">
              Proyectos
            </h1>
            <p className="text-[13px] text-zinc-500">
              Directorio universal de proyectos: metodología, avance, presupuesto y salud.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-brand px-4 text-sm font-bold text-white shadow-[0_2px_8px_rgba(255,75,11,0.28)] transition-colors hover:bg-brand-hover"
        >
          <Plus size={16} />
          Nuevo proyecto
        </button>
      </div>

      {/* Toolbar */}
      <div className="sticky top-0 z-20 mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-zinc-200 bg-white/95 p-3 shadow-[0_2px_10px_rgba(0,0,0,0.03)] backdrop-blur">
        <div className="relative min-w-[240px] flex-1">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por código, nombre, cliente o responsable…"
            className="h-10 w-full rounded-lg border border-zinc-200 bg-white pl-9 pr-3 text-sm text-zinc-800 outline-none transition-all placeholder:text-zinc-400 focus:border-brand focus:ring-2 focus:ring-brand/15"
          />
        </div>

        <div className="relative">
          <Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <select
            value={methodology}
            onChange={(event) => setMethodology(event.target.value as MethodologyFilter)}
            aria-label="Filtrar por metodología"
            className={selectClass}
          >
            <option value="todas">Todas las metodologías</option>
            {(Object.keys(PROJECT_METHODOLOGY_META) as ProjectMethodology[]).map((key) => (
              <option key={key} value={key}>
                {PROJECT_METHODOLOGY_META[key].label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        </div>

        <div className="relative">
          <Filter size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as StatusFilter)}
            aria-label="Filtrar por estado"
            className={selectClass}
          >
            <option value="todos">Todos los estados</option>
            {(Object.keys(PROJECT_STATUS_META) as ProjectStatus[]).map((key) => (
              <option key={key} value={key}>
                {PROJECT_STATUS_META[key].label}
              </option>
            ))}
          </select>
          <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400" />
        </div>

        <span className="ml-auto text-xs font-semibold text-zinc-500">
          {filtered.length} de {projects.length} proyectos
        </span>
      </div>

      {/* Tabla */}
      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <table className="w-full min-w-[1040px] border-collapse text-left">
          <thead>
            <tr className="border-b border-zinc-100 text-[11px] font-bold uppercase tracking-wider text-zinc-500">
              <th className="px-5 py-3">Código</th>
              <th className="px-5 py-3">Proyecto</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Metodología</th>
              <th className="px-5 py-3">Responsable</th>
              <th className="px-5 py-3 w-[190px]">Avance</th>
              <th className="px-5 py-3">Fechas</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Salud</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => {
              const methodologyMeta = PROJECT_METHODOLOGY_META[project.methodology]
              const statusMeta = PROJECT_STATUS_META[project.status]
              const healthMeta = PROJECT_HEALTH_META[project.health]
              return (
                <tr
                  key={project.id}
                  onClick={() => navigate(project.id)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') navigate(project.id)
                  }}
                  tabIndex={0}
                  title={`Abrir ${project.name}`}
                  className="cursor-pointer border-b border-zinc-50 transition-colors outline-none last:border-0 hover:bg-zinc-50/70 focus-visible:ring-2 focus-visible:ring-brand/40"
                >
                  <td className="px-5 py-3.5">
                    <span className="font-mono text-[12px] font-semibold text-zinc-500">
                      {project.code}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-bold text-zinc-900">{project.name}</p>
                    <p className="mt-0.5 text-[11px] text-zinc-400">
                      {project.membersCount} integrantes ·{' '}
                      {formatCurrency(project.budget.allocated, project.budget.currency)}
                    </p>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-zinc-600">{project.client}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${methodologyMeta.badgeClass}`}
                    >
                      {methodologyMeta.short}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-[13px] text-zinc-600">{project.manager}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="h-1.5 w-full min-w-[80px] overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-brand transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                        />
                      </div>
                      <span className="w-9 shrink-0 text-right font-mono text-[12px] font-bold text-zinc-700">
                        {project.progress}%
                      </span>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-5 py-3.5 text-[12px] text-zinc-500">
                    {formatDate(project.startDate)}
                    <span className="mx-1 text-zinc-300">→</span>
                    {formatDate(project.targetDate)}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${statusMeta.badgeClass}`}
                    >
                      {statusMeta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: healthMeta.color }}
                      />
                      <span style={{ color: healthMeta.color }}>{healthMeta.label}</span>
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-16 text-center">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-zinc-100 text-zinc-400">
              <FolderKanban size={22} />
            </div>
            <p className="text-sm font-semibold text-zinc-700">Sin proyectos que coincidan</p>
            <p className="max-w-sm text-[13px] text-zinc-400">
              Ajusta los filtros o crea un nuevo proyecto para empezar a poblar tu cartera.
            </p>
          </div>
        )}
      </div>

      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  )
}
