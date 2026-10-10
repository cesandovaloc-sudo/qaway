import { useMemo } from 'react'
import { Check, Clock, Flag } from 'lucide-react'
import { useProjectsDataset } from '@/hooks/useProjects'
import { projectsService } from '@/services/projectsService'
import {
  MILESTONE_STATUS_META,
  type MilestoneStatus,
} from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// MilestonesTab.tsx — d) Hitos PMBOK
// Línea de tiempo por fases con estado contractual, entregables, firma
// requerida y avance de aprobación.
// ─────────────────────────────────────────────────────────────────────────

interface MilestonesTabProps {
  projectId: string
}

const NEXT_STATUS: Record<MilestoneStatus, MilestoneStatus | null> = {
  pendiente: 'en_revision',
  en_revision: 'aprobado',
  aprobado: null,
}

const NEXT_LABEL: Record<Exclude<MilestoneStatus, 'aprobado'>, string> = {
  pendiente: 'Enviar a revisión',
  en_revision: 'Aprobar hito',
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function MilestonesTab({ projectId }: MilestonesTabProps) {
  const dataset = useProjectsDataset()

  const milestones = useMemo(
    () =>
      dataset.milestones
        .filter((milestone) => milestone.projectId === projectId)
        .sort((a, b) => a.phaseNumber - b.phaseNumber),
    [dataset, projectId],
  )

  const approved = milestones.filter((milestone) => milestone.status === 'aprobado').length
  const progress =
    milestones.length > 0 ? Math.round((approved / milestones.length) * 100) : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-100 px-5 py-4">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-zinc-900">
            <Flag size={15} className="text-zinc-400" /> Hitos contractuales PMBOK
          </h3>
          <p className="text-xs text-zinc-500">
            {approved} de {milestones.length} fases aprobadas
          </p>
        </div>
        <div className="ml-auto flex min-w-[200px] items-center gap-2.5">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="font-mono text-xs font-bold text-zinc-700">{progress}%</span>
        </div>
      </div>

      {milestones.length === 0 ? (
        <p className="px-5 py-14 text-center text-sm text-zinc-400">
          Este proyecto aún no tiene hitos definidos.
        </p>
      ) : (
        <ol className="relative space-y-0 px-5 py-5">
          {milestones.map((milestone, index) => {
            const meta = MILESTONE_STATUS_META[milestone.status]
            const next = NEXT_STATUS[milestone.status]
            const isLast = index === milestones.length - 1
            return (
              <li key={milestone.id} className="relative flex gap-4 pb-6 last:pb-0">
                {!isLast && (
                  <span
                    className="absolute left-[19px] top-11 h-[calc(100%-2.5rem)] w-0.5 rounded-full"
                    style={{
                      backgroundColor:
                        milestone.status === 'aprobado' ? '#10b981' : '#e4e4e7',
                    }}
                  />
                )}
                <span
                  className="z-10 grid h-10 w-10 shrink-0 place-items-center rounded-2xl border text-sm font-extrabold"
                  style={{
                    backgroundColor: milestone.status === 'aprobado' ? '#ecfdf5' : '#fafafa',
                    borderColor: milestone.status === 'aprobado' ? '#a7f3d0' : '#e4e4e7',
                    color: milestone.status === 'aprobado' ? '#059669' : '#71717a',
                  }}
                >
                  {milestone.status === 'aprobado' ? <Check size={17} /> : milestone.phaseNumber}
                </span>

                <div className="min-w-0 flex-1 rounded-2xl border border-zinc-100 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-zinc-900">
                      Fase {milestone.phaseNumber} · {milestone.name}
                    </p>
                    <span
                      className={`ml-auto inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${meta.badgeClass}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <p className="mt-1 text-[13px] leading-relaxed text-zinc-600">
                    {milestone.deliverableSummary}
                  </p>
                  <div className="mt-2.5 flex flex-wrap items-center gap-2 text-[11px] text-zinc-500">
                    <span className="inline-flex items-center gap-1 font-semibold">
                      <Clock size={12} /> {formatDate(milestone.targetDate)}
                    </span>
                    {milestone.signOffRequired && (
                      <span className="rounded-md bg-amber-50 px-2 py-0.5 font-bold uppercase tracking-wide text-amber-700">
                        Requiere firma
                      </span>
                    )}
                    {next && (
                      <button
                        type="button"
                        onClick={() => projectsService.updateMilestone(milestone.id, { status: next })}
                        className="ml-auto inline-flex h-8 items-center gap-1.5 rounded-lg bg-zinc-900 px-3 text-xs font-bold text-white transition-colors hover:bg-brand"
                      >
                        <Check size={13} />
                        {NEXT_LABEL[milestone.status as Exclude<MilestoneStatus, 'aprobado'>]}
                      </button>
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

export default MilestonesTab
