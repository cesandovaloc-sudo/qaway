import { useMemo } from 'react'
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  CircleDollarSign,
  Flag,
  Gauge,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useProject, useProjectWorkItems, useProjectsDataset, useTeamWorkload } from '@/hooks/useProjects'
import {
  PROJECT_CATEGORY_META,
  PROJECT_HEALTH_META,
  PROJECT_STATUS_META,
  WORKLOAD_RISK_META,
  WORK_ITEM_PRIORITY_META,
} from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// OverviewTab.tsx — a) Resumen del proyecto
// Ficha ejecutiva: descripción, metas, presupuesto, sprints, próximos hitos,
// tareas en riesgo y documentos recientes.
// ─────────────────────────────────────────────────────────────────────────

interface OverviewTabProps {
  projectId: string
  onOpenTask: (taskId: string) => void
  onGoDocs: () => void
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('es-PE', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

const panelClass =
  'rounded-2xl border border-zinc-200 bg-white p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'

export function OverviewTab({ projectId, onOpenTask, onGoDocs }: OverviewTabProps) {
  const project = useProject(projectId)
  const workItems = useProjectWorkItems(projectId)
  const dataset = useProjectsDataset()
  const workload = useTeamWorkload(projectId)
  const overloaded = workload.filter((member) => member.riskLevel === 'sobrecarga')

  const sprints = useMemo(
    () => dataset.sprints.filter((sprint) => sprint.projectId === projectId),
    [dataset, projectId],
  )
  const upcomingMilestones = useMemo(
    () =>
      dataset.milestones
        .filter((milestone) => milestone.projectId === projectId && milestone.status !== 'aprobado')
        .sort((a, b) => a.targetDate.localeCompare(b.targetDate))
        .slice(0, 3),
    [dataset, projectId],
  )
  const riskTasks = useMemo(
    () =>
      workItems
        .filter(
          (item) =>
            item.state !== 'done' &&
            (item.priority === 'URGENTE' || item.priority === 'ALTA' || Boolean(item.isCriticalPath)),
        )
        .slice(0, 5),
    [workItems],
  )
  const recentDocs = useMemo(
    () =>
      dataset.docs
        .filter((doc) => doc.projectId === projectId)
        .sort((a, b) => b.lastEdited.localeCompare(a.lastEdited))
        .slice(0, 3),
    [dataset, projectId],
  )

  if (!project) return null

  const healthMeta = PROJECT_HEALTH_META[project.health]
  const statusMeta = PROJECT_STATUS_META[project.status]
  const budgetPct =
    project.budget.allocated > 0
      ? Math.round((project.budget.spent / project.budget.allocated) * 100)
      : 0
  const doneCount = workItems.filter((item) => item.state === 'done').length

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      {/* Columna principal */}
      <div className="space-y-4 xl:col-span-2">
        <div className={panelClass}>
          <h3 className="text-sm font-bold text-zinc-900">Descripción</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">{project.description}</p>
          <div className="mt-4">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-semibold text-zinc-500">Avance global</span>
              <span className="font-mono font-bold text-zinc-800">{project.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-zinc-100">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(0, project.progress))}%` }}
              />
            </div>
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div>
              <dt className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                <Users size={12} /> Equipo
              </dt>
              <dd className="mt-0.5 font-bold text-zinc-800">{project.membersCount} personas</dd>
              <dd className="text-[11px] text-zinc-400">{project.manager}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                <CalendarDays size={12} /> Fechas
              </dt>
              <dd className="mt-0.5 font-bold text-zinc-800">{formatDate(project.targetDate)}</dd>
              <dd className="text-[11px] text-zinc-400">inicio {formatDate(project.startDate)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                Categoría
              </dt>
              <dd className="mt-0.5 font-bold text-zinc-800">
                {PROJECT_CATEGORY_META[project.category].label}
              </dd>
              <dd className="text-[11px] text-zinc-400">{project.client}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                <Gauge size={12} /> Salud
              </dt>
              <dd className="mt-0.5 font-bold" style={{ color: healthMeta.color }}>
                {healthMeta.label}
              </dd>
              <dd className="text-[11px] text-zinc-400">{statusMeta.label}</dd>
            </div>
          </dl>
        </div>

        <div className={panelClass}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <CircleDollarSign size={15} className="text-zinc-400" /> Presupuesto
            </h3>
            <span className="font-mono text-xs font-bold text-zinc-700">{budgetPct}% ejecutado</span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, budgetPct)}%`,
                backgroundColor: budgetPct >= 85 ? '#e11d48' : '#0284c7',
              }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            {formatMoney(project.budget.spent, project.budget.currency)} de{' '}
            {formatMoney(project.budget.allocated, project.budget.currency)}
          </p>
        </div>

        {sprints.length > 0 && (
          <div className={panelClass}>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900">
              <TrendingUp size={15} className="text-zinc-400" /> Sprints
            </h3>
            <div className="space-y-3">
              {sprints.map((sprint) => {
                const pct =
                  sprint.totalPoints > 0
                    ? Math.round((sprint.completedPoints / sprint.totalPoints) * 100)
                    : 0
                return (
                  <div key={sprint.id} className="rounded-xl border border-zinc-100 p-3">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <p className="font-bold text-zinc-800">{sprint.name}</p>
                      <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-zinc-500">
                        {sprint.status}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-zinc-500">{sprint.goal}</p>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100">
                        <div
                          className="h-full rounded-full bg-violet-500"
                          style={{ width: `${Math.min(100, pct)}%` }}
                        />
                      </div>
                      <span className="font-mono text-[11px] font-bold text-zinc-600">
                        {sprint.completedPoints}/{sprint.totalPoints} pts
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Columna lateral */}
      <div className="space-y-4">
        <div className={panelClass}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900">
            <AlertTriangle size={15} className="text-rose-500" /> Tareas en riesgo
            <span className="ml-auto rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-600">
              {riskTasks.length}
            </span>
          </h3>
          {riskTasks.length === 0 ? (
            <p className="text-xs text-zinc-400">Sin tareas críticas pendientes.</p>
          ) : (
            <ul className="space-y-2">
              {riskTasks.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onOpenTask(item.id)}
                    className="w-full rounded-xl border border-zinc-100 p-2.5 text-left transition-colors hover:border-brand/40 hover:bg-orange-50/40"
                  >
                    <p className="flex items-center gap-2 text-[13px] font-bold text-zinc-800">
                      <span
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ backgroundColor: WORK_ITEM_PRIORITY_META[item.priority].color }}
                      />
                      <span className="truncate">{item.title}</span>
                    </p>
                    <p className="mt-1 font-mono text-[10px] text-zinc-400">
                      {item.id} · {item.priority}
                      {item.isCriticalPath ? ' · RUTA CRÍTICA' : ''} · {item.assignee.name}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 text-[11px] text-zinc-400">
            {doneCount} de {workItems.length} tareas completadas
          </p>
        </div>

        {/* Carga del equipo + Anti-Burnout (Fase 9) */}
        <div className={panelClass}>
          <h3 className="mb-1 flex items-center gap-2 text-sm font-bold text-zinc-900">
            <Users size={15} className="text-zinc-400" /> Carga del equipo
            <span className="ml-auto rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-bold text-zinc-500">
              {workload.length}
            </span>
          </h3>
          <p className="mb-3 text-[11px] text-zinc-400">Puntos activos vs. capacidad (10 pts)</p>
          {overloaded.length > 0 && (
            <p className="mb-3 flex items-start gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] font-bold leading-snug text-rose-700">
              <AlertTriangle size={13} className="mt-0.5 shrink-0" />
              Riesgo de burnout: {overloaded.map((member) => member.memberName).join(', ')}. Redistribuye
              tareas o desbloquea impedimentos.
            </p>
          )}
          {workload.length === 0 ? (
            <p className="text-xs text-zinc-400">Sin tareas activas asignadas.</p>
          ) : (
            <ul className="space-y-2.5">
              {workload.slice(0, 6).map((member) => {
                const meta = WORKLOAD_RISK_META[member.riskLevel]
                return (
                  <li key={member.memberName}>
                    <div className="mb-1 flex items-center gap-2 text-xs">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-zinc-900 text-[10px] font-extrabold text-white">
                        {member.memberName.trim().charAt(0).toUpperCase()}
                      </span>
                      <span className="min-w-0 flex-1 truncate font-bold text-zinc-700">
                        {member.memberName}
                        <span className="ml-1.5 font-normal text-zinc-400">
                          {member.activeTasks} tareas
                          {member.blockedTasks > 0 ? ` · ${member.blockedTasks} bloq.` : ''}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-md border px-1.5 py-px text-[9px] font-extrabold uppercase ${meta.badgeClass}`}
                      >
                        {member.loadPct}%
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, member.loadPct)}%`,
                          backgroundColor: meta.color,
                        }}
                      />
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        <div className={panelClass}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-zinc-900">
            <Flag size={15} className="text-zinc-400" /> Próximos hitos
          </h3>
          {upcomingMilestones.length === 0 ? (
            <p className="text-xs text-zinc-400">Todos los hitos están aprobados.</p>
          ) : (
            <ul className="space-y-2.5">
              {upcomingMilestones.map((milestone) => (
                <li key={milestone.id} className="flex items-start gap-2.5 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-lg bg-violet-50 text-[11px] font-extrabold text-violet-700">
                    {milestone.phaseNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-bold text-zinc-800">{milestone.name}</p>
                    <p className="text-[11px] text-zinc-400">{formatDate(milestone.targetDate)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className={panelClass}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
              <BookOpen size={15} className="text-zinc-400" /> Documentos
            </h3>
            <button
              type="button"
              onClick={onGoDocs}
              className="text-xs font-bold text-brand hover:underline"
            >
              Ver wiki
            </button>
          </div>
          {recentDocs.length === 0 ? (
            <p className="text-xs text-zinc-400">Aún no hay documentos.</p>
          ) : (
            <ul className="space-y-2">
              {recentDocs.map((doc) => (
                <li key={doc.id}>
                  <button
                    type="button"
                    onClick={onGoDocs}
                    className="flex w-full items-center gap-2.5 rounded-xl border border-zinc-100 p-2.5 text-left transition-colors hover:border-brand/40"
                  >
                    <span className="text-lg leading-none">{doc.icon}</span>
                    <span className="min-w-0">
                      <span className="block truncate text-[13px] font-bold text-zinc-800">
                        {doc.title}
                      </span>
                      <span className="block text-[11px] text-zinc-400">
                        {doc.author} · {formatDate(doc.lastEdited)}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

export default OverviewTab
