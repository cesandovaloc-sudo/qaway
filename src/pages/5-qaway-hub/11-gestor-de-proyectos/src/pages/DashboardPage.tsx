import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertTriangle,
  CircleDollarSign,
  FolderKanban,
  Gauge,
  Plus,
  RefreshCw,
  TrendingUp,
} from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CreateProjectModal } from '@/components/projects/CreateProjectModal'
import { useProjectsDataset, useTenantFilteredProjects } from '@/hooks/useProjects'
import { useHubBrand } from '@/hooks/useHubBrand'
import { projectsService } from '@/services/projectsService'
import {
  HEALTH_SCORE,
  PROJECT_HEALTH_META,
  PROJECT_METHODOLOGY_META,
  type ProjectHealth,
  type ProjectMethodology,
} from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// DashboardPage.tsx — Dashboard de Cartera (Task 3.1)
// KPIs globales (Salud, Presupuesto Ejecutado, Velocidad, Tareas en Riesgo),
// distribución por metodología y cartera activa con barras de avance
// reactivas al store (`projectsService`).
// ─────────────────────────────────────────────────────────────────────────

const cardClass =
  'rounded-2xl border border-[var(--hub-border)] bg-[var(--hub-surface,#fff)] shadow-[0_4px_20px_rgba(0,0,0,0.03)]'

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

function MetricCard({
  icon,
  label,
  value,
  note,
  accent,
}: {
  icon: React.ReactNode
  label: string
  value: string
  note: React.ReactNode
  accent: string
}) {
  return (
    <div className="group flex flex-col rounded-xl border border-[var(--hub-border)] bg-[var(--hub-surface,#fff)] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-transform duration-200 ease-out hover:-translate-y-0.5">
      <div className="mb-1.5 flex items-center justify-between gap-2">
        <span className="truncate text-xs font-semibold text-[var(--hub-dim)]">{label}</span>
        <span
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white"
          style={{ backgroundColor: accent }}
        >
          {icon}
        </span>
      </div>
      <span className="text-2xl font-extrabold leading-tight tracking-[-0.6px] text-[var(--hub-text)]">
        {value}
      </span>
      <span className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-[var(--hub-dim)]">
        {note}
      </span>
    </div>
  )
}

export default function DashboardPage() {
  // Alcance por entidad (Fase 17): todos los agregados derivan de los proyectos
  // filtrados por cliente; sin selección, equivale a la cartera completa.
  const projects = useTenantFilteredProjects()
  const dataset = useProjectsDataset()
  const hubBrand = useHubBrand()
  const navigate = useNavigate()
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const projectIds = useMemo(() => new Set(projects.map((p) => p.id)), [projects])

  const kpis = useMemo(() => {
    const scopedSprints = dataset.sprints.filter((s) => projectIds.has(s.projectId))
    const scopedItems = dataset.workItems.filter((i) => projectIds.has(i.projectId))
    const totalProjects = projects.length
    const activeProjects = projects.filter((p) => p.status === 'en_curso').length
    const completedProjects = projects.filter((p) => p.status === 'completado').length
    const atRiskProjects = projects.filter((p) => p.health !== 'optimo').length
    const healthSum = projects.reduce((sum, p) => sum + HEALTH_SCORE[p.health], 0)
    const avgHealthScore = totalProjects > 0 ? Math.round(healthSum / totalProjects) : 0
    const budgetAllocated = projects.reduce((sum, p) => sum + p.budget.allocated, 0)
    const budgetSpent = projects.reduce((sum, p) => sum + p.budget.spent, 0)
    const budgetExecutionPct =
      budgetAllocated > 0 ? Math.round((budgetSpent / budgetAllocated) * 100) : 0
    const closed = scopedSprints.filter((s) => s.status === 'cerrado')
    const pool = closed.length ? closed : scopedSprints.filter((s) => s.status === 'activo')
    const sprintVelocity =
      pool.length > 0
        ? Math.round((pool.reduce((sum, s) => sum + s.completedPoints, 0) / pool.length) * 10) / 10
        : 0
    const doneTasks = scopedItems.filter((i) => i.state === 'done').length
    const tasksAtRisk = scopedItems.filter(
      (i) =>
        i.state !== 'done' &&
        (i.priority === 'URGENTE' || i.priority === 'ALTA' || Boolean(i.isCriticalPath)),
    ).length
    const progressSum = projects.reduce((sum, p) => sum + p.progress, 0)
    const globalProgress = totalProjects > 0 ? Math.round(progressSum / totalProjects) : 0
    return {
      totalProjects,
      activeProjects,
      completedProjects,
      atRiskProjects,
      avgHealthScore,
      budgetAllocated,
      budgetSpent,
      budgetExecutionPct,
      sprintVelocity,
      tasksAtRisk,
      totalTasks: scopedItems.length,
      doneTasks,
      globalProgress,
    }
  }, [projects, dataset, projectIds])

  const methodologyDistribution = useMemo(() => {
    const counts = new Map<string, number>()
    for (const project of projects) {
      counts.set(project.methodology, (counts.get(project.methodology) ?? 0) + 1)
    }
    return (Object.keys(PROJECT_METHODOLOGY_META) as ProjectMethodology[]).map(
      (methodology) => ({
        methodology,
        label: PROJECT_METHODOLOGY_META[methodology].short,
        count: counts.get(methodology) ?? 0,
        color: PROJECT_METHODOLOGY_META[methodology].color,
      }),
    )
  }, [projects])

  const budgetByProject = useMemo(
    () =>
      projects.map((project) => ({
        projectId: project.id,
        code: project.code,
        name: project.name,
        allocated: project.budget.allocated,
        spent: project.budget.spent,
        currency: project.budget.currency,
      })),
    [projects],
  )

  const methodologyData = useMemo(
    () => methodologyDistribution.filter((item) => item.count > 0),
    [methodologyDistribution],
  )

  const healthDistribution = useMemo(() => {
    const counts: Record<ProjectHealth, number> = { optimo: 0, atencion: 0, critico: 0 }
    projects.forEach((project) => {
      counts[project.health] += 1
    })
    return (Object.keys(counts) as ProjectHealth[])
      .map((health) => ({
        health,
        value: counts[health],
        label: PROJECT_HEALTH_META[health].label,
        color: PROJECT_HEALTH_META[health].color,
      }))
      .filter((item) => item.value > 0)
  }, [projects])

  const healthTotal = healthDistribution.reduce((sum, item) => sum + item.value, 0)

  const prioritizedProjects = useMemo(
    () =>
      [...projects]
        .filter((project) => project.status !== 'completado')
        .sort((a, b) => {
          const order: Record<ProjectHealth, number> = { critico: 0, atencion: 1, optimo: 2 }
          return order[a.health] - order[b.health]
        }),
    [projects],
  )

  const maxBudget = Math.max(...budgetByProject.map((item) => item.allocated), 1)

  return (
    <div className="mx-auto max-w-[1800px]">
      {/* Encabezado */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="grid h-[38px] w-[38px] place-items-center rounded-[10px] border border-[var(--hub-border)] bg-[var(--hub-chip)] text-[var(--hub-text)]">
            <FolderKanban size={22} strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.8px] text-[var(--hub-text)]">
              Cartera de Proyectos
            </h1>
            <p className="text-[13px] text-[var(--hub-dim)]">
              Salud, presupuesto, velocidad y riesgos de toda la cartera en tiempo real.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => projectsService.resetDemoData()}
            className="inline-flex h-10 items-center gap-2 rounded-lg border border-[var(--hub-border)] bg-[var(--hub-surface,#fff)] px-4 text-sm font-semibold text-[var(--hub-text-soft)] transition-colors hover:bg-[var(--hub-chip)]"
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

      {/* KPIs */}
      <section className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <MetricCard
          icon={<FolderKanban size={15} />}
          label="Proyectos activos"
          value={String(kpis.activeProjects)}
          note={`de ${kpis.totalProjects} proyectos en cartera`}
          accent="var(--hub-brand)"
        />
        <MetricCard
          icon={<Gauge size={15} />}
          label="Salud de cartera"
          value={`${kpis.avgHealthScore}%`}
          note={`${kpis.atRiskProjects} con atención requerida`}
          accent={kpis.avgHealthScore >= 80 ? '#059669' : kpis.avgHealthScore >= 50 ? '#d97706' : '#e11d48'}
        />
        <MetricCard
          icon={<CircleDollarSign size={15} />}
          label="Presupuesto ejecutado"
          value={`${kpis.budgetExecutionPct}%`}
          note="sobre el presupuesto asignado"
          accent="#0284c7"
        />
        <MetricCard
          icon={<TrendingUp size={15} />}
          label="Velocidad de sprints"
          value={`${kpis.sprintVelocity} pts`}
          note="promedio por sprint cerrado"
          accent="#7c3aed"
        />
        <MetricCard
          icon={<AlertTriangle size={15} />}
          label="Tareas en riesgo"
          value={String(kpis.tasksAtRisk)}
          note={`de ${kpis.totalTasks} tareas totales`}
          accent="#e11d48"
        />
      </section>

      {/* Gráficos */}
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Distribución por metodología */}
        <div className={`${cardClass} p-5`}>
          <h3 className="text-sm font-bold text-[var(--hub-text)]">Proyectos por metodología</h3>
          <p className="mb-2 text-xs text-[var(--hub-dim)]">Distribución Scrum · P6 · Kanban · Híbrido</p>
          {methodologyData.length > 0 ? (
            <div className="flex items-center gap-4">
              <div className="relative h-[180px] w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={methodologyData}
                      dataKey="count"
                      nameKey="label"
                      innerRadius={52}
                      outerRadius={74}
                      paddingAngle={3}
                      cornerRadius={4}
                      stroke="none"
                    >
                      {methodologyData.map((item) => (
                        <Cell
                          key={item.methodology}
                          fill={item.methodology === 'scrum' ? hubBrand : item.color}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #e4e4e7',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold uppercase text-[var(--hub-dim)]">Total</span>
                  <span className="text-2xl font-extrabold text-[var(--hub-text)]">
                    {kpis.totalProjects}
                  </span>
                </div>
              </div>
              <ul className="flex-1 space-y-2.5">
                {methodologyDistribution.map((item) => (
                  <li key={item.methodology} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-semibold text-[var(--hub-text-soft)]">
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{
                          backgroundColor:
                            item.methodology === 'scrum' ? hubBrand : item.color,
                        }}
                      />
                      {PROJECT_METHODOLOGY_META[item.methodology].short}
                    </span>
                    <span className="font-bold text-[var(--hub-dim)]">{item.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="py-16 text-center text-sm text-[var(--hub-dim)]">Sin proyectos registrados.</p>
          )}
        </div>

        {/* Ejecución presupuestaria por proyecto */}
        <div className={`${cardClass} p-5 lg:col-span-2`}>
          <h3 className="text-sm font-bold text-[var(--hub-text)]">Ejecución presupuestaria</h3>
          <p className="mb-4 text-xs text-[var(--hub-dim)]">Consumo del presupuesto asignado por proyecto</p>
          <div className="space-y-3">
            {budgetByProject.map((item) => {
              const pct = item.allocated > 0 ? Math.round((item.spent / item.allocated) * 100) : 0
              const width = Math.round((item.allocated / maxBudget) * 100)
              const overrun = pct >= 85
              return (
                <div key={item.projectId}>
                  <div className="mb-1 flex items-center justify-between gap-3 text-xs">
                    <span className="truncate font-semibold text-[var(--hub-text-soft)]">
                      <span className="mr-2 font-mono text-[11px] text-[var(--hub-dim)]">{item.code}</span>
                      {item.name}
                    </span>
                    <span
                      className="shrink-0 font-mono font-bold"
                      style={{ color: overrun ? '#e11d48' : '#059669' }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[var(--hub-chip)]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(2, width)}%`,
                        backgroundColor: overrun ? '#e11d48' : 'var(--hub-brand)',
                      }}
                    />
                  </div>
                  <p className="mt-1 text-[10px] text-[var(--hub-dim)]">
                    {formatCurrency(item.spent, item.currency)} de{' '}
                    {formatCurrency(item.allocated, item.currency)}
                  </p>
                </div>
              )
            })}
            {budgetByProject.length === 0 && (
              <p className="py-10 text-center text-sm text-[var(--hub-dim)]">Sin presupuestos registrados.</p>
            )}
          </div>
        </div>
      </section>

      {/* Salud + Cartera activa */}
      <section className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <div className={`${cardClass} p-5 lg:col-span-1`}>
          <h3 className="text-sm font-bold text-[var(--hub-text)]">Salud de cartera</h3>
          <p className="mb-4 text-xs text-[var(--hub-dim)]">Semáforo ejecutivo de proyectos</p>
          <div className="relative mx-auto h-[150px] w-[150px]">
            {healthDistribution.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={healthDistribution}
                      dataKey="value"
                      nameKey="label"
                      innerRadius={46}
                      outerRadius={68}
                      paddingAngle={3}
                      cornerRadius={4}
                      stroke="none"
                    >
                      {healthDistribution.map((item) => (
                        <Cell key={item.health} fill={item.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: 10,
                        border: '1px solid #e4e4e7',
                        fontSize: 12,
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-semibold uppercase text-[var(--hub-dim)]">Salud</span>
                  <span className="text-2xl font-extrabold text-[var(--hub-text)]">
                    {kpis.avgHealthScore}%
                  </span>
                </div>
              </>
            ) : (
              <div className="grid h-full place-items-center text-xs text-[var(--hub-dim)]">Sin datos</div>
            )}
          </div>
          <ul className="mt-4 space-y-2">
            {healthDistribution.map((item) => (
              <li key={item.health} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 font-semibold text-[var(--hub-text-soft)]">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  {item.label}
                </span>
                <span className="font-bold text-[var(--hub-dim)]">
                  {item.value}
                  <span className="ml-1 text-[10px] font-medium">
                    ({healthTotal ? Math.round((item.value / healthTotal) * 100) : 0}%)
                  </span>
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Cartera activa */}
        <div className={`${cardClass} overflow-hidden lg:col-span-3`}>
          <div className="flex items-center justify-between gap-3 border-b border-[var(--hub-border)] px-5 py-4">
            <div>
              <h3 className="text-sm font-bold text-[var(--hub-text)]">Cartera activa</h3>
              <p className="text-xs text-[var(--hub-dim)]">
                Proyectos priorizados por nivel de riesgo · avance en vivo
              </p>
            </div>
            <span className="rounded-full bg-[var(--hub-chip)] px-3 py-1 text-xs font-bold text-[var(--hub-dim)]">
              {prioritizedProjects.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-left">
              <thead>
                <tr className="border-b border-[var(--hub-border)] text-[11px] font-bold uppercase tracking-wider text-[var(--hub-dim)]">
                  <th className="px-5 py-2.5">Proyecto</th>
                  <th className="px-5 py-2.5">Metodología</th>
                  <th className="px-5 py-2.5">Avance</th>
                  <th className="px-5 py-2.5">Objetivo</th>
                  <th className="px-5 py-2.5">Salud</th>
                </tr>
              </thead>
              <tbody>
                {prioritizedProjects.map((project) => {
                  const methodologyMeta = PROJECT_METHODOLOGY_META[project.methodology]
                  const healthMeta = PROJECT_HEALTH_META[project.health]
                  return (
                    <tr
                      key={project.id}
                      onClick={() => navigate(`proyectos/${project.id}`)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          navigate(`proyectos/${project.id}`)
                        }
                      }}
                      tabIndex={0}
                      title={`Abrir ${project.name}`}
                      className="cursor-pointer border-b border-[var(--hub-border)] transition-colors outline-none last:border-0 hover:bg-[var(--hub-chip)] focus-visible:ring-2 focus-visible:ring-brand/40"
                    >
                      <td className="px-5 py-3">
                        <p className="text-sm font-bold text-[var(--hub-text)]">{project.name}</p>
                        <p className="text-[11px] text-[var(--hub-dim)]">
                          <span className="font-mono">{project.code}</span> · {project.client}
                        </p>
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${methodologyMeta.badgeClass}`}
                        >
                          {methodologyMeta.short}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-1.5 w-[110px] overflow-hidden rounded-full bg-[var(--hub-chip)]">
                            <div
                              className="h-full rounded-full bg-brand transition-all duration-500"
                              style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
                            />
                          </div>
                          <span className="font-mono text-[12px] font-bold text-[var(--hub-text-soft)]">
                            {project.progress}%
                          </span>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-3 text-[12px] text-[var(--hub-dim)]">
                        {formatDate(project.targetDate)}
                      </td>
                      <td className="px-5 py-3">
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

            {prioritizedProjects.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 px-6 py-14 text-center">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--hub-chip)] text-[var(--hub-dim)]">
                  <FolderKanban size={22} />
                </div>
                <p className="text-sm font-semibold text-[var(--hub-text)]">Sin proyectos en cartera</p>
                <p className="max-w-sm text-[13px] text-[var(--hub-dim)]">
                  Crea tu primer proyecto para empezar a monitorear salud, presupuesto y avance.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  )
}
