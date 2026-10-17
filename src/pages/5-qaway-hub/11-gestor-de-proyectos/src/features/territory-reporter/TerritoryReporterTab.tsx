import React, { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  BarChart3,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  LayoutGrid,
  MessageCircle,
  Plus,
  Search,
  Sparkles,
  Table2,
  X,
  Zap,
} from 'lucide-react'
import { useProjectsDataset } from '@/hooks/useProjects'
import { useHubBrand } from '@/hooks/useHubBrand'
import { projectsService } from '@/services/projectsService'
import { WORK_ITEM_STATE_META, type WorkItem, type WorkItemPriority } from '@/types/project.types'
import { buildFollowUpMessage, buildWhatsAppUrl, toFollowUpContact } from '@/utils/followUp'

// ─────────────────────────────────────────────────────────────────────────────
// TerritoryReporterTab.tsx — Reporteador de Monitoreo Territorial y Subprocesos
// Basado en CdD – MC – SIGA (Dotación 2027 · OM N° 00032-2026-MINEDU)
// 100% amarrado a Proyectos, Hitos/Subprocesos (Milestones) y Bandeja de Tareas.
// ─────────────────────────────────────────────────────────────────────────────

export type TerritoryStatus = 'completado' | 'en_proceso' | 'pendiente'

export type DirectionCode = 'DEI' | 'DEBA' | 'DISER' | 'DIGEBR' | 'DIGEDD' | 'DIFOID' | 'DITEN'

export const DIRECTION_CODES: DirectionCode[] = [
  'DEI',
  'DEBA',
  'DISER',
  'DIGEBR',
  'DIGEDD',
  'DIFOID',
  'DITEN',
]

export interface UgelMonitoringRow {
  id: string
  number: number
  name: string
  phase1Files: number // 0..3
  phase1Total: number
  phase1Date: string
  phase2Files: number // 0..3
  phase2Total: number
  phase2Date: string
  directions: Record<DirectionCode, TerritoryStatus>
  observation: string
  gestorName: string
  gestorPhone: string
}

export interface DirectionNationalRow {
  id: string
  number: number
  code: string
  phase1: TerritoryStatus
  phase2: TerritoryStatus
  updatedAt: string
  observation: string
}

const STORAGE_KEY = 'qaway_territory_reporter_v1'

const INITIAL_JUNIN_UGELS: UgelMonitoringRow[] = [
  {
    id: 'ugel-huancayo',
    number: 1,
    name: 'HUANCAYO',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '13/10/2026 10:15',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '13/10/2026 11:40',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: '-',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-concepcion',
    number: 2,
    name: 'CONCEPCIÓN',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '13/10/2026 09:20',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '13/10/2026 15:10',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: '-',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-chupaca',
    number: 3,
    name: 'CHUPACA',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '12/10/2026 16:30',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '13/10/2026 09:45',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: '-',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-jauja',
    number: 4,
    name: 'JAUJA',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '13/10/2026 11:05',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '13/10/2026 14:20',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: '-',
    gestorName: 'Carlos Mendoza',
    gestorPhone: '+51987654321',
  },
  {
    id: 'ugel-tarma',
    number: 5,
    name: 'TARMA',
    phase1Files: 2,
    phase1Total: 3,
    phase1Date: '13/10/2026 14:10',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '13/10/2026 16:00',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'en_proceso',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: 'Fase 1: falta DISER',
    gestorName: 'Carlos Mendoza',
    gestorPhone: '+51987654321',
  },
  {
    id: 'ugel-yauli',
    number: 6,
    name: 'YAULI',
    phase1Files: 2,
    phase1Total: 3,
    phase1Date: '13/10/2026 09:50',
    phase2Files: 1,
    phase2Total: 3,
    phase2Date: '-',
    directions: {
      DEI: 'en_proceso',
      DEBA: 'completado',
      DISER: 'en_proceso',
      DIGEBR: 'en_proceso',
      DIGEDD: 'en_proceso',
      DIFOID: 'pendiente',
      DITEN: 'en_proceso',
    },
    observation: 'Fase 2: falta DIGEBR, DIFOID',
    gestorName: 'Carlos Mendoza',
    gestorPhone: '+51987654321',
  },
  {
    id: 'ugel-junin',
    number: 7,
    name: 'JUNÍN',
    phase1Files: 0,
    phase1Total: 3,
    phase1Date: '13/10/2026 12:20',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: '-',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'en_proceso',
      DIGEDD: 'pendiente',
      DIFOID: 'en_proceso',
      DITEN: 'pendiente',
    },
    observation: 'Sin archivos Fase 2',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-satipo',
    number: 8,
    name: 'SATIPO',
    phase1Files: 2,
    phase1Total: 3,
    phase1Date: '13/10/2026 15:30',
    phase2Files: 2,
    phase2Total: 3,
    phase2Date: '13/10/2026 16:10',
    directions: {
      DEI: 'completado',
      DEBA: 'pendiente',
      DISER: 'completado',
      DIGEBR: 'en_proceso',
      DIGEDD: 'pendiente',
      DIFOID: 'completado',
      DITEN: 'en_proceso',
    },
    observation: 'Faltan DEBA y DIGEDD',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-chanchamayo',
    number: 9,
    name: 'CHANCHAMAYO',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '12/10/2026 17:45',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '13/10/2026 09:30',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: '-',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-chupingo',
    number: 10,
    name: 'CHUPINGO',
    phase1Files: 0,
    phase1Total: 3,
    phase1Date: '-',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: '-',
    directions: {
      DEI: 'pendiente',
      DEBA: 'pendiente',
      DISER: 'pendiente',
      DIGEBR: 'pendiente',
      DIGEDD: 'pendiente',
      DIFOID: 'pendiente',
      DITEN: 'pendiente',
    },
    observation: 'Sin archivos',
    gestorName: 'Ana Paola Quispe',
    gestorPhone: '+51954321098',
  },
  {
    id: 'ugel-pichanaqui',
    number: 11,
    name: 'PICHANAQUI',
    phase1Files: 2,
    phase1Total: 3,
    phase1Date: '13/10/2026 13:15',
    phase2Files: 2,
    phase2Total: 3,
    phase2Date: '13/10/2026 15:50',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'en_proceso',
      DIGEDD: 'en_proceso',
      DIFOID: 'en_proceso',
      DITEN: 'pendiente',
    },
    observation: 'Falta DITEN',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-rio-tambo',
    number: 12,
    name: 'RIO TAMBO',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '13/10/2026 10:40',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '13/10/2026 14:35',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: '-',
    gestorName: 'Javier Ruiz',
    gestorPhone: '+51943210987',
  },
  {
    id: 'ugel-vitoc',
    number: 13,
    name: 'VITOC',
    phase1Files: 2,
    phase1Total: 3,
    phase1Date: '13/10/2026 11:20',
    phase2Files: 2,
    phase2Total: 3,
    phase2Date: '13/10/2026 16:20',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'pendiente',
      DITEN: 'en_proceso',
    },
    observation: 'Falta DIFOID',
    gestorName: 'Carlos Mendoza',
    gestorPhone: '+51987654321',
  },
]

const NATIONAL_DIRECTIONS: DirectionNationalRow[] = [
  {
    id: 'dir-dei',
    number: 1,
    code: 'DEI',
    phase1: 'completado',
    phase2: 'completado',
    updatedAt: '12/10/2026 16:30',
    observation: 'Sin observaciones',
  },
  {
    id: 'dir-deba',
    number: 2,
    code: 'DEBA',
    phase1: 'completado',
    phase2: 'completado',
    updatedAt: '12/10/2026 15:20',
    observation: 'Sin observaciones',
  },
  {
    id: 'dir-diser',
    number: 3,
    code: 'DISER',
    phase1: 'completado',
    phase2: 'en_proceso',
    updatedAt: '12/10/2026 11:45',
    observation: 'Revisión en curso',
  },
  {
    id: 'dir-digebr',
    number: 4,
    code: 'DIGEBR',
    phase1: 'en_proceso',
    phase2: 'en_proceso',
    updatedAt: '11/10/2026 09:10',
    observation: 'Pendiente validación',
  },
  {
    id: 'dir-digedd',
    number: 5,
    code: 'DIGEDD',
    phase1: 'completado',
    phase2: 'completado',
    updatedAt: '12/10/2026 14:05',
    observation: 'Sin observaciones',
  },
  {
    id: 'dir-digeibira',
    number: 6,
    code: 'DIGEIBIRA',
    phase1: 'completado',
    phase2: 'en_proceso',
    updatedAt: '11/10/2026 18:40',
    observation: 'Verificar consistencia',
  },
  {
    id: 'dir-difoid',
    number: 7,
    code: 'DIFOID',
    phase1: 'en_proceso',
    phase2: 'pendiente',
    updatedAt: '10/10/2026 10:15',
    observation: 'Falta archivo Fase 2',
  },
  {
    id: 'dir-diten',
    number: 8,
    code: 'DITEN',
    phase1: 'completado',
    phase2: 'completado',
    updatedAt: '12/10/2026 13:50',
    observation: 'Sin observaciones',
  },
  {
    id: 'dir-drelm',
    number: 9,
    code: 'DRELM',
    phase1: 'en_proceso',
    phase2: 'en_proceso',
    updatedAt: '11/10/2026 16:20',
    observation: 'En revisión por área',
  },
  {
    id: 'dir-otras',
    number: 10,
    code: 'OTRAS',
    phase1: 'pendiente',
    phase2: 'pendiente',
    updatedAt: '09/10/2026 17:00',
    observation: 'Pendiente inicio de subida',
  },
]

function computePhaseStatus(files: number, total: number): TerritoryStatus {
  if (files >= total) return 'completado'
  if (files > 0) return 'en_proceso'
  return 'pendiente'
}

function computeUgelGeneralStatus(row: UgelMonitoringRow): TerritoryStatus {
  const p1 = computePhaseStatus(row.phase1Files, row.phase1Total)
  const p2 = computePhaseStatus(row.phase2Files, row.phase2Total)
  if (p1 === 'completado' && p2 === 'completado') return 'completado'
  if (p1 === 'pendiente' && p2 === 'pendiente') return 'pendiente'
  if (p2 === 'pendiente' && row.phase1Files === 0) return 'pendiente'
  if (row.name === 'JUNÍN' && row.phase2Files === 0) return 'pendiente'
  return 'en_proceso'
}

function computeDirectionGeneralStatus(row: DirectionNationalRow): TerritoryStatus {
  if (row.phase1 === 'completado' && row.phase2 === 'completado') return 'completado'
  if (row.phase1 === 'pendiente' || row.phase2 === 'pendiente') return 'pendiente'
  return 'en_proceso'
}

function StatusBadge({ status }: { status: TerritoryStatus }) {
  if (status === 'completado') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100/90 px-3 py-1 text-xs font-bold text-emerald-800">
        Completado
      </span>
    )
  }
  if (status === 'en_proceso') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100/90 px-3 py-1 text-xs font-bold text-amber-800">
        En proceso
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100/90 px-3 py-1 text-xs font-bold text-rose-800">
      Pendiente
    </span>
  )
}

function StatusIconLabel({ status }: { status: TerritoryStatus }) {
  if (status === 'completado') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-emerald-600 text-white">
          <Check size={10} strokeWidth={3} />
        </span>
        Completado
      </span>
    )
  }
  if (status === 'en_proceso') {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
        <span className="grid h-4 w-4 place-items-center rounded-full bg-amber-500 text-white">
          <Clock size={10} strokeWidth={2.6} />
        </span>
        En proceso
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700">
      <span className="grid h-4 w-4 place-items-center rounded-full bg-rose-600 text-white">
        <X size={10} strokeWidth={3} />
      </span>
      Pendiente
    </span>
  )
}

function DirectionDot({
  status,
  onClick,
  title,
}: {
  status: TerritoryStatus
  onClick?: () => void
  title?: string
}) {
  const baseClass =
    status === 'completado'
      ? 'bg-emerald-600 text-white'
      : status === 'en_proceso'
        ? 'bg-amber-500 text-white'
        : 'bg-rose-600 text-white'

  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`mx-auto grid h-5 w-5 place-items-center rounded-full transition-transform hover:scale-110 cursor-pointer ${baseClass}`}
    >
      {status === 'completado' ? (
        <Check size={11} strokeWidth={3} />
      ) : status === 'en_proceso' ? (
        <Clock size={11} strokeWidth={2.5} />
      ) : (
        <X size={11} strokeWidth={3} />
      )}
    </button>
  )
}

/** Donut SVG reactivo para Estado Global */
function DonutChart({
  completed,
  inProgress,
  pending,
  centerValue,
  centerSub,
}: {
  completed: number
  inProgress: number
  pending: number
  centerValue: string | number
  centerSub: string
}) {
  const total = Math.max(1, completed + inProgress + pending)
  const radius = 52
  const circumference = 2 * Math.PI * radius

  const compLen = (completed / total) * circumference
  const progLen = (inProgress / total) * circumference
  const pendLen = (pending / total) * circumference

  return (
    <div className="relative grid h-36 w-36 shrink-0 place-items-center">
      <svg className="h-36 w-36 -rotate-90" viewBox="0 0 130 130">
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="transparent"
          stroke="#f1f5f9"
          strokeWidth="18"
        />
        {/* Completado (Verde) */}
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="transparent"
          stroke="#16a34a"
          strokeWidth="18"
          strokeDasharray={`${compLen} ${circumference}`}
          strokeDashoffset={0}
        />
        {/* En proceso (Ámbar) */}
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="transparent"
          stroke="#f59e0b"
          strokeWidth="18"
          strokeDasharray={`${progLen} ${circumference}`}
          strokeDashoffset={-compLen}
        />
        {/* Pendiente (Rojo) */}
        <circle
          cx="65"
          cy="65"
          r={radius}
          fill="transparent"
          stroke="#ef4444"
          strokeWidth="18"
          strokeDasharray={`${pendLen} ${circumference}`}
          strokeDashoffset={-(compLen + progLen)}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-extrabold leading-none text-slate-900 tabular-nums">
          {centerValue}
        </span>
        <span className="mt-0.5 text-[11px] font-medium text-slate-500">{centerSub}</span>
      </div>
    </div>
  )
}

interface TerritoryReporterTabProps {
  projectId: string
  onOpenTask: (taskId: string) => void
}

type ReporterViewMode =
  | 'matriz_ugel'
  | 'tarjetas_fase'
  | 'comparativo_ejecutivo'
  | 'direcciones_linea'

export function TerritoryReporterTab({ projectId, onOpenTask }: TerritoryReporterTabProps) {
  const dataset = useProjectsDataset()
  const brandColor = useHubBrand()
  const [searchParams, setSearchParams] = useSearchParams()
  const milestoneParam = searchParams.get('milestone')

  const project = useMemo(
    () => dataset.projects.find((p) => p.id === projectId),
    [dataset.projects, projectId],
  )

  const projectMilestones = useMemo(
    () =>
      dataset.milestones
        .filter((m) => m.projectId === projectId)
        .sort((a, b) => a.phaseNumber - b.phaseNumber),
    [dataset.milestones, projectId],
  )

  // Por defecto se amarra al hito seleccionado en la URL, o al hito de Cuadro de Distribución SIGA (H5 / Fase 5), o al primero
  const [selectedMilestoneId, setSelectedMilestoneId] = useState<string>(() => {
    if (milestoneParam) return milestoneParam
    const sigaMilestone = projectMilestones.find(
      (m) =>
        m.name.toLowerCase().includes('siga') ||
        m.name.toLowerCase().includes('cuadro') ||
        m.phaseNumber === 5,
    )
    return sigaMilestone?.id ?? projectMilestones[0]?.id ?? ''
  })

  useEffect(() => {
    if (milestoneParam && projectMilestones.some((m) => m.id === milestoneParam)) {
      setSelectedMilestoneId(milestoneParam)
    }
  }, [milestoneParam, projectMilestones])

  const activeMilestone = useMemo(
    () =>
      projectMilestones.find((m) => m.id === selectedMilestoneId) ?? projectMilestones[0] ?? null,
    [projectMilestones, selectedMilestoneId],
  )

  // Persistencia local de la matriz territorial para que el Gestor de Campo pueda actualizar estados en vivo
  const [ugels, setUgels] = useState<UgelMonitoringRow[]>(() => {
    if (typeof window === 'undefined') return INITIAL_JUNIN_UGELS
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return INITIAL_JUNIN_UGELS
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_JUNIN_UGELS
    } catch {
      return INITIAL_JUNIN_UGELS
    }
  })

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ugels))
    } catch {
      // ignore storage errors
    }
  }, [ugels])

  const [viewMode, setViewMode] = useState<ReporterViewMode>('matriz_ugel')
  const [selectedRegion, setSelectedRegion] = useState<string>('Región Junín')
  const [filterPhase, setFilterPhase] = useState<string>('Todas')
  const [filterDirection, setFilterDirection] = useState<string>('Todas')
  const [filterStatus, setFilterStatus] = useState<string>('Todos')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // UGEL seleccionada para inspección de campo o creación de tarea vinculada
  const [inspectedUgelId, setInspectedUgelId] = useState<string | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState<string>('')
  const [newTaskPriority, setNewTaskPriority] = useState<WorkItemPriority>('URGENTE')

  const inspectedUgel = useMemo(
    () => ugels.find((u) => u.id === inspectedUgelId) ?? null,
    [ugels, inspectedUgelId],
  )

  // Tareas del proyecto vinculadas al Hito o a las UGEL
  const projectWorkItems = useMemo(
    () => dataset.workItems.filter((item) => item.projectId === projectId),
    [dataset.workItems, projectId],
  )

  const getTasksForUgel = (ugelName: string): WorkItem[] => {
    const clean = ugelName.toLowerCase()
    return projectWorkItems.filter((item) => {
      const scopeMatch = (item.scopeTag ?? '').toLowerCase().includes(clean)
      const titleMatch = item.title.toLowerCase().includes(clean)
      return scopeMatch || titleMatch
    })
  }

  // Estadísticas globales de las 13 UGEL
  const ugelStats = useMemo(() => {
    let completed = 0
    let inProgress = 0
    let pending = 0
    let p1Completed = 0
    let p1InProgress = 0
    let p1Pending = 0
    let p2Completed = 0
    let p2InProgress = 0
    let p2Pending = 0

    for (const u of ugels) {
      const gen = computeUgelGeneralStatus(u)
      if (gen === 'completado') completed++
      else if (gen === 'en_proceso') inProgress++
      else pending++

      const s1 = computePhaseStatus(u.phase1Files, u.phase1Total)
      if (s1 === 'completado') p1Completed++
      else if (s1 === 'en_proceso') p1InProgress++
      else p1Pending++

      const s2 = computePhaseStatus(u.phase2Files, u.phase2Total)
      if (s2 === 'completado') p2Completed++
      else if (s2 === 'en_proceso') p2InProgress++
      else p2Pending++
    }

    const total = ugels.length
    const completedPct = Math.round((completed / total) * 100)
    const inProgressPct = Math.round((inProgress / total) * 100)
    const pendingPct = Math.max(0, 100 - completedPct - inProgressPct)

    const directionStats = DIRECTION_CODES.map((code) => {
      let ok = 0
      let prog = 0
      let pend = 0
      for (const u of ugels) {
        const st = u.directions[code]
        if (st === 'completado') ok++
        else if (st === 'en_proceso') prog++
        else pend++
      }
      return {
        code,
        ok,
        prog,
        pend,
        total,
        pct: Math.round((ok / total) * 100),
      }
    })

    return {
      total,
      completed,
      inProgress,
      pending,
      completedPct,
      inProgressPct,
      pendingPct,
      p1Completed,
      p1InProgress,
      p1Pending,
      p2Completed,
      p2InProgress,
      p2Pending,
      directionStats,
    }
  }, [ugels])

  const filteredUgels = useMemo(() => {
    return ugels.filter((u) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matchName = u.name.toLowerCase().includes(q)
        const matchObs = u.observation.toLowerCase().includes(q)
        if (!matchName && !matchObs) return false
      }
      if (filterStatus !== 'Todos') {
        const gen = computeUgelGeneralStatus(u)
        if (filterStatus === 'Completado' && gen !== 'completado') return false
        if (filterStatus === 'En proceso' && gen !== 'en_proceso') return false
        if (filterStatus === 'Pendiente' && gen !== 'pendiente') return false
      }
      if (filterDirection !== 'Todas') {
        const code = filterDirection as DirectionCode
        if (u.directions[code] === 'completado' && filterStatus === 'Pendiente') return false
      }
      if (filterPhase === 'Fase 1' && u.phase1Files === 0 && filterStatus === 'Completado') {
        return false
      }
      return true
    })
  }, [ugels, searchQuery, filterStatus, filterDirection, filterPhase])

  const handleOpenInspectUgel = (ugel: UgelMonitoringRow) => {
    setInspectedUgelId(ugel.id)
    const defaultTitle =
      ugel.observation && ugel.observation !== '-'
        ? `Asistencia técnica UGEL ${ugel.name}: ${ugel.observation}`
        : `Seguimiento de subida CdD - MC SIGA en UGEL ${ugel.name}`
    setNewTaskTitle(defaultTitle)
    setNewTaskPriority(computeUgelGeneralStatus(ugel) === 'pendiente' ? 'URGENTE' : 'ALTA')
  }

  const handleCycleUgelFiles = (ugelId: string, phase: 1 | 2) => {
    setUgels((prev) =>
      prev.map((u) => {
        if (u.id !== ugelId) return u
        if (phase === 1) {
          const nextFiles = (u.phase1Files + 1) % (u.phase1Total + 1)
          return {
            ...u,
            phase1Files: nextFiles,
            phase1Date: nextFiles > 0 ? '17/10/2026 13:30' : '-',
          }
        }
        const nextFiles = (u.phase2Files + 1) % (u.phase2Total + 1)
        return {
          ...u,
          phase2Files: nextFiles,
          phase2Date: nextFiles > 0 ? '17/10/2026 13:30' : '-',
        }
      }),
    )
  }

  const handleCycleDirectionStatus = (ugelId: string, code: DirectionCode) => {
    const order: TerritoryStatus[] = ['completado', 'en_proceso', 'pendiente']
    setUgels((prev) =>
      prev.map((u) => {
        if (u.id !== ugelId) return u
        const current = u.directions[code]
        const next = order[(order.indexOf(current) + 1) % order.length]
        return {
          ...u,
          directions: {
            ...u.directions,
            [code]: next,
          },
        }
      }),
    )
  }

  const handleCreateTaskForUgel = (ugel: UgelMonitoringRow, customTitle?: string) => {
    const titleToUse =
      (customTitle ?? newTaskTitle).trim() ||
      `Asistencia técnica CdD - MC SIGA en UGEL ${ugel.name} (${ugel.observation !== '-' ? ugel.observation : 'Verificación'})`

    const genStatus = computeUgelGeneralStatus(ugel)
    const created = projectsService.createWorkItem({
      projectId,
      milestoneId: activeMilestone?.id,
      milestoneRef: activeMilestone
        ? `Fase ${activeMilestone.phaseNumber} · ${activeMilestone.name}`
        : 'CdD - MC SIGA',
      originType: 'accion_emergente',
      taskNature: 'contingencia_operativa',
      threatensMilestone: genStatus === 'pendiente',
      threatNote:
        genStatus === 'pendiente'
          ? `UGEL ${ugel.name} en estado Pendiente (${ugel.observation})`
          : undefined,
      title: titleToUse,
      description: `Tarea generada desde el Reporteador Territorial CdD - MC SIGA para UGEL ${ugel.name} (${selectedRegion}). Estado Fase 1: ${ugel.phase1Files}/${ugel.phase1Total}, Fase 2: ${ugel.phase2Files}/${ugel.phase2Total}. Observación: ${ugel.observation}.`,
      state: 'todo',
      priority: genStatus === 'pendiente' ? 'URGENTE' : newTaskPriority,
      assignee: {
        name: ugel.gestorName,
        role: `Gestor Territorial ${selectedRegion}`,
        phone: ugel.gestorPhone,
      },
      storyPoints: 3,
      followUpDate: activeMilestone?.targetDate ?? '2026-10-22',
      scopeTag: `UGEL ${ugel.name}`,
    })
    setInspectedUgelId(null)
    onOpenTask(created.id)
  }

  return (
    <div className="space-y-4">
      {/* BARRA SUPERIOR DE AMARRE: PROYECTO ↔ SUBPROCESO/HITO ↔ REGIÓN ↔ VISTAS */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-[0_4px_20px_rgba(15,23,42,0.04)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div
              className="mt-0.5 h-12 w-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: brandColor }}
            />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold tracking-wide text-slate-600">
                  CdD – MC – SIGA
                </span>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-700">
                  {project?.name ?? 'Proyecto Activo'}
                </span>
              </div>
              <h2 className="mt-0.5 text-xl font-extrabold tracking-tight text-slate-900 sm:text-2xl">
                Subida de información – {selectedRegion}
              </h2>
              <p className="mt-0.5 text-xs font-medium text-slate-500">
                Direcciones: DEI, DEBA, DISER, DIGEBR, DIGEDD, DIFOID y DITEN &nbsp;|&nbsp; Fase 1 y
                Fase 2
              </p>
            </div>
          </div>

          {/* Metadatos de corte y selector de Hito/Subproceso amarrado */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs">
              <Calendar size={15} className="text-slate-500 shrink-0" />
              <div>
                <div className="text-[10px] font-medium text-slate-400 leading-none">
                  Corte del día:
                </div>
                <div className="mt-0.5 font-bold text-slate-800 leading-none">
                  13 de octubre de 2026
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs">
              <Clock size={15} className="text-slate-500 shrink-0" />
              <div>
                <div className="text-[10px] font-medium text-slate-400 leading-none">
                  Última actualización:
                </div>
                <div className="mt-0.5 font-bold text-slate-800 leading-none">13/10/2026 16:30</div>
              </div>
            </div>
          </div>
        </div>

        {/* Fila de Amarre Normativo (Hito Rector) + Selector de Región + 4 Modos de Vista */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-600">Hito / Subproceso amarrado:</span>
            <select
              value={activeMilestone?.id ?? ''}
              onChange={(e) => {
                setSelectedMilestoneId(e.target.value)
                const next = new URLSearchParams(searchParams)
                next.set('tab', 'reporteador')
                next.set('milestone', e.target.value)
                setSearchParams(next, { replace: true })
              }}
              className="h-9 max-w-xs sm:max-w-md rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[var(--hub-brand)] cursor-pointer"
            >
              {projectMilestones.map((m) => (
                <option key={m.id} value={m.id}>
                  Fase {m.phaseNumber} · {m.name}
                </option>
              ))}
            </select>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="h-9 rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-800 outline-none focus:border-[var(--hub-brand)] cursor-pointer"
            >
              <option value="Región Junín">Región Junín (13 UGEL)</option>
              <option value="Región Cusco">Región Cusco (14 UGEL)</option>
              <option value="Lima Provincias">Lima Provincias (9 UGEL)</option>
            </select>
          </div>

          {/* Selector de las 4 Vistas de las láminas */}
          <div className="flex flex-wrap items-center gap-1 rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setViewMode('matriz_ugel')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'matriz_ugel'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Table2 size={14} />
              Matriz UGEL
            </button>
            <button
              type="button"
              onClick={() => setViewMode('tarjetas_fase')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'tarjetas_fase'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid size={14} />
              Tarjetas por Fase
            </button>
            <button
              type="button"
              onClick={() => setViewMode('comparativo_ejecutivo')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'comparativo_ejecutivo'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles size={14} />
              Ejecutivo F1 vs F2
            </button>
            <button
              type="button"
              onClick={() => setViewMode('direcciones_linea')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'direcciones_linea'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BarChart3 size={14} />
              Por Dirección (DEI-DITEN)
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          VISTA 1: MATRIZ INTEGRAL UGEL (Lámina 4: Cinta Semafórica + KPIs + Gráficos + Tabla)
          ════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'matriz_ugel' && (
        <div className="space-y-4">
          {/* 1. CINTA SEMAFÓRICA SUPERIOR (Quick-Status Strip de las 13 UGEL) */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xs">
            <div className="grid min-w-[980px] grid-cols-14 overflow-hidden rounded-xl">
              <div className="flex flex-col items-center justify-center bg-slate-800 px-2 py-2.5 text-center text-white">
                <span className="text-[11px] font-bold leading-tight">Estado por UGEL</span>
                <span className="mt-0.5 text-[10px] text-slate-300">(Fase 1 y Fase 2)</span>
              </div>
              {ugels.map((u) => {
                const st = computeUgelGeneralStatus(u)
                const completedPhases =
                  (u.phase1Files >= u.phase1Total ? 1 : 0) +
                  (u.phase2Files >= u.phase2Total ? 1 : 0)
                const ratioLabel =
                  st === 'completado' ? '2/2' : st === 'pendiente' ? '0/2' : `${Math.max(1, completedPhases)}/2`
                const bgClass =
                  st === 'completado'
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                    : st === 'en_proceso'
                      ? 'bg-amber-400 text-slate-900 hover:bg-amber-500'
                      : 'bg-rose-600 text-white hover:bg-rose-700'

                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleOpenInspectUgel(u)}
                    title={`Inspeccionar UGEL ${u.name} (${u.observation})`}
                    className={`flex flex-col items-center justify-center border-l border-white/20 px-1.5 py-2 text-center transition-colors cursor-pointer ${bgClass}`}
                  >
                    <span className="w-full truncate text-[10px] font-extrabold uppercase tracking-tight">
                      {u.name}
                    </span>
                    <span className="my-1 grid h-5 w-5 place-items-center rounded-full bg-white/95 shadow-2xs">
                      {st === 'completado' ? (
                        <Check size={12} strokeWidth={3} className="text-emerald-600" />
                      ) : st === 'en_proceso' ? (
                        <Clock size={12} strokeWidth={2.6} className="text-amber-600" />
                      ) : (
                        <X size={12} strokeWidth={3} className="text-rose-600" />
                      )}
                    </span>
                    <span className="tabular-nums text-[11px] font-bold leading-none">
                      {ratioLabel}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* 2. FILA DE 5 KPIs EJECUTIVOS */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                <Building2 size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total de UGEL</p>
                <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {ugelStats.total}
                </p>
                <p className="text-[11px] text-slate-400">{selectedRegion}</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-emerald-50 text-emerald-600">
                <CheckCircle2 size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">UGEL que cumplen</p>
                <p className="text-2xl font-extrabold text-emerald-600 tabular-nums">
                  {ugelStats.completed}
                </p>
                <p className="text-[11px] text-slate-400 tabular-nums">
                  {ugelStats.completedPct}% del total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-amber-50 text-amber-500">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">En proceso</p>
                <p className="text-2xl font-extrabold text-amber-500 tabular-nums">
                  {ugelStats.inProgress}
                </p>
                <p className="text-[11px] text-slate-400 tabular-nums">
                  {ugelStats.inProgressPct}% del total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-rose-50 text-rose-600">
                <AlertCircle size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Pendientes</p>
                <p className="text-2xl font-extrabold text-rose-600 tabular-nums">
                  {ugelStats.pending}
                </p>
                <p className="text-[11px] text-slate-400 tabular-nums">
                  {ugelStats.pendingPct}% del total
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200 bg-white p-4 shadow-2xs">
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-slate-100 text-slate-600">
                <FileText size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-500">Total de archivos/subidas</p>
                <p className="text-2xl font-extrabold text-slate-900 tabular-nums">
                  {ugelStats.total * 2}
                </p>
                <p className="text-[11px] text-slate-400">Fase 1 + Fase 2</p>
              </div>
            </div>
          </div>

          {/* 3. FILA DE 3 GRÁFICOS EJECUTIVOS */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Card 1: Avance por fase */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900">Avance por fase (todas las UGEL)</h3>
              <div className="mt-4 space-y-4">
                {[
                  {
                    label: 'Fase 1',
                    ok: ugelStats.p1Completed,
                    prog: ugelStats.p1InProgress,
                    pend: ugelStats.p1Pending,
                  },
                  {
                    label: 'Fase 2',
                    ok: ugelStats.p2Completed,
                    prog: ugelStats.p2InProgress,
                    pend: ugelStats.p2Pending,
                  },
                ].map((f) => (
                  <div key={f.label} className="flex items-center gap-3">
                    <span className="w-12 text-xs font-bold text-slate-700">{f.label}</span>
                    <div className="flex h-8 flex-1 overflow-hidden rounded-lg bg-slate-100 text-xs font-bold text-white">
                      {f.ok > 0 && (
                        <div
                          style={{ width: `${(f.ok / ugelStats.total) * 100}%` }}
                          className="flex items-center justify-center bg-emerald-600 tabular-nums"
                        >
                          {f.ok}
                        </div>
                      )}
                      {f.prog > 0 && (
                        <div
                          style={{ width: `${(f.prog / ugelStats.total) * 100}%` }}
                          className="flex items-center justify-center bg-amber-400 text-slate-900 tabular-nums"
                        >
                          {f.prog}
                        </div>
                      )}
                      {f.pend > 0 && (
                        <div
                          style={{ width: `${(f.pend / ugelStats.total) * 100}%` }}
                          className="flex items-center justify-center bg-rose-600 tabular-nums"
                        >
                          {f.pend}
                        </div>
                      )}
                    </div>
                    <div className="w-10 text-right leading-none">
                      <span className="block text-sm font-extrabold text-slate-900 tabular-nums">
                        {ugelStats.total}
                      </span>
                      <span className="text-[10px] text-slate-400">UGEL</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 flex items-center gap-4 text-xs text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" /> Completado
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> En proceso
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-rose-600" /> Pendiente
                </span>
              </div>
            </div>

            {/* Card 2: Estado global (Donut) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900">Estado global (todas las fases)</h3>
              <div className="mt-3 flex items-center justify-center gap-6">
                <DonutChart
                  completed={ugelStats.completed}
                  inProgress={ugelStats.inProgress}
                  pending={ugelStats.pending}
                  centerValue={ugelStats.total}
                  centerSub="UGEL"
                />
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
                    <span className="text-slate-600">
                      Completado ({ugelStats.completed}) —{' '}
                      <strong className="text-slate-900">{ugelStats.completedPct}%</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <span className="text-slate-600">
                      En proceso ({ugelStats.inProgress}) —{' '}
                      <strong className="text-slate-900">{ugelStats.inProgressPct}%</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
                    <span className="text-slate-600">
                      Pendiente ({ugelStats.pending}) —{' '}
                      <strong className="text-slate-900">{ugelStats.pendingPct}%</strong>
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Avance por dirección */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
              <h3 className="text-sm font-bold text-slate-900">
                Avance por dirección (todas las UGEL)
              </h3>
              <div className="mt-3 space-y-2">
                {ugelStats.directionStats.map((d) => (
                  <div key={d.code} className="flex items-center gap-2.5 text-xs">
                    <span className="w-14 font-bold text-slate-700">{d.code}</span>
                    <div className="flex h-3.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        style={{ width: `${(d.ok / d.total) * 100}%` }}
                        className="bg-emerald-600"
                      />
                      <div
                        style={{ width: `${(d.prog / d.total) * 100}%` }}
                        className="bg-amber-400"
                      />
                      <div
                        style={{ width: `${(d.pend / d.total) * 100}%` }}
                        className="bg-rose-600"
                      />
                    </div>
                    <span className="w-9 text-right font-bold text-slate-800 tabular-nums">
                      {d.pct}%
                    </span>
                    <span className="w-9 text-right text-[11px] text-slate-400 tabular-nums">
                      {d.ok}/{d.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. TABLA MATRICIAL INTERACTIVA: DETALLE POR UGEL – REGIÓN JUNÍN */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <div className="flex flex-wrap items-end justify-between gap-3 pb-4">
              <div className="flex items-start gap-3">
                <div
                  className="mt-0.5 h-9 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: brandColor }}
                />
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Detalle por UGEL – {selectedRegion}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Estado de subida por fase, dirección, fecha de corte y tareas amarradas (clic en
                    los checks para actualizar en campo)
                  </p>
                </div>
              </div>

              {/* Filtros rápidos */}
              <div className="flex flex-wrap items-center gap-2">
                <div>
                  <label className="mb-0.5 block text-[10px] font-semibold text-slate-500">
                    Fase
                  </label>
                  <select
                    value={filterPhase}
                    onChange={(e) => setFilterPhase(e.target.value)}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value="Todas">Todas</option>
                    <option value="Fase 1">Fase 1</option>
                    <option value="Fase 2">Fase 2</option>
                  </select>
                </div>

                <div>
                  <label className="mb-0.5 block text-[10px] font-semibold text-slate-500">
                    Dirección
                  </label>
                  <select
                    value={filterDirection}
                    onChange={(e) => setFilterDirection(e.target.value)}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value="Todas">Todas</option>
                    {DIRECTION_CODES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-0.5 block text-[10px] font-semibold text-slate-500">
                    Estado
                  </label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-medium text-slate-700 outline-none"
                  >
                    <option value="Todos">Todos</option>
                    <option value="Completado">Completado</option>
                    <option value="En proceso">En proceso</option>
                    <option value="Pendiente">Pendiente</option>
                  </select>
                </div>

                <div className="relative">
                  <Search
                    size={14}
                    className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar UGEL..."
                    className="h-8 w-44 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-[var(--hub-brand)] focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[1150px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/90 text-[11px] font-bold text-slate-700">
                    <th rowSpan={2} className="px-2.5 py-2 text-center">
                      N°
                    </th>
                    <th rowSpan={2} className="px-3 py-2">
                      UGEL
                    </th>
                    <th colSpan={3} className="border-x border-slate-200 px-3 py-1.5 text-center">
                      Fase 1
                    </th>
                    <th colSpan={3} className="border-r border-slate-200 px-3 py-1.5 text-center">
                      Fase 2
                    </th>
                    <th rowSpan={2} className="px-3 py-2 text-center">
                      Estado general
                    </th>
                    <th
                      colSpan={7}
                      className="border-x border-slate-200 px-2 py-1.5 text-center"
                    >
                      Direcciones (estado por fase 1 + 2)
                    </th>
                    <th rowSpan={2} className="px-3 py-2">
                      Observaciones
                    </th>
                    <th rowSpan={2} className="px-3 py-2 text-right">
                      Acción / Tareas
                    </th>
                  </tr>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500">
                    <th className="border-l border-slate-200 px-2.5 py-1.5">Estado</th>
                    <th className="px-2 py-1.5">Fecha de subida</th>
                    <th className="border-r border-slate-200 px-2 py-1.5 text-center">Archivos</th>
                    <th className="px-2.5 py-1.5">Estado</th>
                    <th className="px-2 py-1.5">Fecha de subida</th>
                    <th className="border-r border-slate-200 px-2 py-1.5 text-center">Archivos</th>
                    {DIRECTION_CODES.map((code) => (
                      <th key={code} className="px-1.5 py-1.5 text-center">
                        {code}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredUgels.map((u) => {
                    const p1Status = computePhaseStatus(u.phase1Files, u.phase1Total)
                    const p2Status = computePhaseStatus(u.phase2Files, u.phase2Total)
                    const genStatus = computeUgelGeneralStatus(u)
                    const linkedTasks = getTasksForUgel(u.name)
                    const rowTint =
                      genStatus === 'pendiente'
                        ? 'bg-rose-50/35 hover:bg-rose-50/70'
                        : genStatus === 'en_proceso'
                          ? 'bg-amber-50/25 hover:bg-amber-50/60'
                          : 'hover:bg-slate-50/80'

                    return (
                      <tr key={u.id} className={`transition-colors ${rowTint}`}>
                        <td className="px-2.5 py-2.5 text-center font-semibold text-slate-500 tabular-nums">
                          {u.number}
                        </td>
                        <td className="px-3 py-2.5 font-extrabold text-slate-900">
                          <button
                            type="button"
                            onClick={() => handleOpenInspectUgel(u)}
                            className="hover:underline cursor-pointer text-left"
                          >
                            {u.name}
                          </button>
                        </td>

                        {/* Fase 1 */}
                        <td className="border-l border-slate-100 px-2.5 py-2.5">
                          <StatusIconLabel status={p1Status} />
                        </td>
                        <td className="px-2 py-2.5 text-[11px] text-slate-500 tabular-nums">
                          {u.phase1Date}
                        </td>
                        <td className="border-r border-slate-100 px-2 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleCycleUgelFiles(u.id, 1)}
                            title="Clic para actualizar archivos subidos en Fase 1"
                            className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-700 hover:bg-slate-200 tabular-nums cursor-pointer"
                          >
                            {u.phase1Files}/{u.phase1Total}
                          </button>
                        </td>

                        {/* Fase 2 */}
                        <td className="px-2.5 py-2.5">
                          <StatusIconLabel status={p2Status} />
                        </td>
                        <td className="px-2 py-2.5 text-[11px] text-slate-500 tabular-nums">
                          {u.phase2Date}
                        </td>
                        <td className="border-r border-slate-100 px-2 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleCycleUgelFiles(u.id, 2)}
                            title="Clic para actualizar archivos subidos en Fase 2"
                            className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-700 hover:bg-slate-200 tabular-nums cursor-pointer"
                          >
                            {u.phase2Files}/{u.phase2Total}
                          </button>
                        </td>

                        {/* Estado General */}
                        <td className="px-3 py-2.5 text-center">
                          <StatusBadge status={genStatus} />
                        </td>

                        {/* 7 Direcciones */}
                        {DIRECTION_CODES.map((code) => (
                          <td key={code} className="px-1.5 py-2.5 text-center">
                            <DirectionDot
                              status={u.directions[code]}
                              onClick={() => handleCycleDirectionStatus(u.id, code)}
                              title={`${u.name} · ${code}: ${u.directions[code]} (clic para cambiar)`}
                            />
                          </td>
                        ))}

                        {/* Observaciones */}
                        <td className="border-l border-slate-100 px-3 py-2.5 font-medium text-slate-600">
                          {u.observation}
                        </td>

                        {/* Acciones / Tareas Amarradas */}
                        <td className="px-3 py-2.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            {linkedTasks.length > 0 && (
                              <button
                                type="button"
                                onClick={() => onOpenTask(linkedTasks[0].id)}
                                title={`Ver ${linkedTasks.length} tarea(s) vinculada(s) a UGEL ${u.name}`}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                              >
                                <CheckCircle2 size={12} className="text-emerald-600" />
                                {linkedTasks.length} tarea{linkedTasks.length > 1 ? 's' : ''}
                              </button>
                            )}
                            {genStatus !== 'completado' ? (
                              <button
                                type="button"
                                onClick={() => handleOpenInspectUgel(u)}
                                className="inline-flex items-center gap-1 rounded-lg bg-[var(--hub-brand)] px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs hover:opacity-95 cursor-pointer"
                              >
                                <Zap size={11} />
                                Destrabar
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenInspectUgel(u)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                              >
                                <Eye size={12} />
                                Detalle
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          VISTA 2: TARJETAS SEMAFÓRICAS POR FASE (Lámina 3: Fase 1 y Fase 2 con 13 UGEL cards)
          ════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'tarjetas_fase' && (
        <div className="space-y-4">
          {[
            {
              phase: 1 as const,
              title: 'Fase 1',
              ok: ugelStats.p1Completed,
              prog: ugelStats.p1InProgress,
              pend: ugelStats.p1Pending,
              barColor: '#2563eb',
            },
            {
              phase: 2 as const,
              title: 'Fase 2',
              ok: ugelStats.p2Completed,
              prog: ugelStats.p2InProgress,
              pend: ugelStats.p2Pending,
              barColor: '#7c3aed',
            },
          ].map((block) => (
            <div
              key={block.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="h-11 w-2 rounded-full"
                    style={{ backgroundColor: block.barColor }}
                  />
                  <div>
                    <h3 className="text-xl font-extrabold text-slate-900">{block.title}</h3>
                    <p className="text-xs text-slate-500">Estado de subida por UGEL</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="flex items-center gap-2.5 rounded-xl bg-slate-50 px-3.5 py-2">
                    <FileText size={18} className="text-slate-600" />
                    <div>
                      <span className="block text-[10px] text-slate-400">Total UGEL</span>
                      <span className="text-lg font-extrabold text-slate-900 tabular-nums">
                        {ugelStats.total}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3.5 py-2">
                    <CheckCircle2 size={18} className="text-emerald-600" />
                    <div>
                      <span className="text-lg font-extrabold text-emerald-700 tabular-nums">
                        {block.ok}
                      </span>
                      <span className="block text-[10px] font-semibold text-emerald-700">
                        Completadas
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-amber-50 px-3.5 py-2">
                    <Clock size={18} className="text-amber-600" />
                    <div>
                      <span className="text-lg font-extrabold text-amber-700 tabular-nums">
                        {block.prog}
                      </span>
                      <span className="block text-[10px] font-semibold text-amber-700">
                        En proceso
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3.5 py-2">
                    <AlertCircle size={18} className="text-rose-600" />
                    <div>
                      <span className="text-lg font-extrabold text-rose-700 tabular-nums">
                        {block.pend}
                      </span>
                      <span className="block text-[10px] font-semibold text-rose-700">
                        Pendientes
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 13 tarjetas UGEL */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-13">
                {ugels.map((u) => {
                  const files = block.phase === 1 ? u.phase1Files : u.phase2Files
                  const total = block.phase === 1 ? u.phase1Total : u.phase2Total
                  const st = computePhaseStatus(files, total)
                  const cardBg =
                    st === 'completado'
                      ? 'border-emerald-200 bg-emerald-50/70 hover:bg-emerald-100/70'
                      : st === 'en_proceso'
                        ? 'border-amber-200 bg-amber-50/70 hover:bg-amber-100/70'
                        : 'border-rose-200 bg-rose-50/70 hover:bg-rose-100/70'
                  const barBg =
                    st === 'completado'
                      ? 'bg-emerald-600'
                      : st === 'en_proceso'
                        ? 'bg-amber-500'
                        : 'bg-rose-500'

                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleOpenInspectUgel(u)}
                      className={`flex flex-col items-center justify-between rounded-xl border p-2.5 text-center transition-all cursor-pointer ${cardBg}`}
                    >
                      <span className="w-full truncate text-[10px] font-extrabold uppercase text-slate-800">
                        {u.name}
                      </span>
                      <span
                        className={`my-2.5 grid h-7 w-7 place-items-center rounded-full text-white shadow-xs ${barBg}`}
                      >
                        {st === 'completado' ? (
                          <Check size={15} strokeWidth={3} />
                        ) : st === 'en_proceso' ? (
                          <Clock size={15} strokeWidth={2.5} />
                        ) : (
                          <X size={15} strokeWidth={3} />
                        )}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900 tabular-nums">
                        {files}/{total}
                      </span>
                      <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                        <div
                          className={`h-full rounded-full ${barBg}`}
                          style={{ width: `${Math.max(12, (files / total) * 100)}%` }}
                        />
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          VISTA 3: COMPARATIVO EJECUTIVO F1 vs F2 CON PANEL OSCURO (Lámina 5)
          ════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'comparativo_ejecutivo' && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] text-white shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Columna izquierda ejecutiva oscura */}
            <div className="flex flex-col justify-between border-b border-slate-800 p-6 lg:col-span-3 lg:border-b-0 lg:border-r">
              <div className="space-y-5">
                <div>
                  <p className="text-xs font-semibold text-slate-400">Total de UGEL</p>
                  <p className="mt-1 text-4xl font-extrabold tracking-tight tabular-nums">
                    {ugelStats.total}
                  </p>
                  <p className="text-xs text-slate-400">{selectedRegion}</p>
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/20 text-emerald-400">
                      <Check size={16} strokeWidth={3} />
                    </span>
                    <div>
                      <p className="text-xs text-slate-300">Completadas</p>
                      <p className="text-xl font-extrabold text-emerald-400 tabular-nums">
                        {ugelStats.p1Completed}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-500/20 text-amber-400">
                      <Clock size={16} strokeWidth={2.5} />
                    </span>
                    <div>
                      <p className="text-xs text-slate-300">En proceso</p>
                      <p className="text-xl font-extrabold text-amber-400 tabular-nums">
                        {ugelStats.p1InProgress}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-rose-500/20 text-rose-400">
                      <X size={16} strokeWidth={3} />
                    </span>
                    <div>
                      <p className="text-xs text-slate-300">Pendientes</p>
                      <p className="text-xl font-extrabold text-rose-400 tabular-nums">
                        {ugelStats.p1Pending}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 border-t border-slate-800 pt-5">
                <p className="mb-3 text-xs font-bold text-slate-300">Avance general</p>
                <div className="flex justify-center rounded-2xl bg-white p-4 text-slate-900">
                  <DonutChart
                    completed={ugelStats.completed}
                    inProgress={ugelStats.inProgress}
                    pending={ugelStats.pending}
                    centerValue={`${ugelStats.completedPct}%`}
                    centerSub={`${ugelStats.completed + ugelStats.p1Completed} de 26`}
                  />
                </div>
              </div>
            </div>

            {/* Dos tablas paralelas: Fase 1 y Fase 2 */}
            <div className="grid grid-cols-1 gap-4 bg-slate-100 p-5 text-slate-900 md:grid-cols-2 lg:col-span-9">
              {[
                {
                  phase: 1 as const,
                  title: 'Fase 1',
                  ok: ugelStats.p1Completed,
                  prog: ugelStats.p1InProgress,
                  pend: ugelStats.p1Pending,
                },
                {
                  phase: 2 as const,
                  title: 'Fase 2',
                  ok: ugelStats.p2Completed,
                  prog: ugelStats.p2InProgress,
                  pend: ugelStats.p2Pending,
                },
              ].map((panel) => (
                <div
                  key={panel.title}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div>
                      <h4 className="text-lg font-extrabold text-slate-900">{panel.title}</h4>
                      <p className="text-xs text-slate-500">Estado de subida por UGEL</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400">Total UGEL</span>
                      <p className="text-xl font-extrabold text-slate-900 tabular-nums">
                        {ugelStats.total}
                      </p>
                    </div>
                  </div>

                  <div className="my-3 grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-emerald-50 p-2.5 text-center">
                      <span className="text-xs font-bold text-emerald-700">Completadas</span>
                      <p className="text-xl font-extrabold text-emerald-700 tabular-nums">
                        {panel.ok}
                      </p>
                    </div>
                    <div className="rounded-xl bg-amber-50 p-2.5 text-center">
                      <span className="text-xs font-bold text-amber-700">En proceso</span>
                      <p className="text-xl font-extrabold text-amber-700 tabular-nums">
                        {panel.prog}
                      </p>
                    </div>
                    <div className="rounded-xl bg-rose-50 p-2.5 text-center">
                      <span className="text-xs font-bold text-rose-700">Pendientes</span>
                      <p className="text-xl font-extrabold text-rose-700 tabular-nums">
                        {panel.pend}
                      </p>
                    </div>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-[11px] font-bold text-slate-500">
                        <th className="py-2">UGEL</th>
                        <th className="py-2">Estado {panel.title}</th>
                        <th className="py-2 text-right">Fecha de subida</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {ugels.map((u) => {
                        const files = panel.phase === 1 ? u.phase1Files : u.phase2Files
                        const total = panel.phase === 1 ? u.phase1Total : u.phase2Total
                        const dateStr = panel.phase === 1 ? u.phase1Date : u.phase2Date
                        const st = computePhaseStatus(files, total)
                        return (
                          <tr
                            key={u.id}
                            onClick={() => handleOpenInspectUgel(u)}
                            className="hover:bg-slate-50 cursor-pointer"
                          >
                            <td className="py-2 font-extrabold text-slate-900">{u.name}</td>
                            <td className="py-2">
                              <StatusIconLabel status={st} />
                            </td>
                            <td className="py-2 text-right text-[11px] text-slate-500 tabular-nums">
                              {dateStr}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          VISTA 4: DETALLE POR DIRECCIÓN DE LÍNEA (Lámina 2: DEI, DEBA, DISER...)
          ════════════════════════════════════════════════════════════════════════ */}
      {viewMode === 'direcciones_linea' && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-2xs">
            <h3 className="text-base font-extrabold text-slate-900">
              Detalle por dirección (Estado de subida por fase y archivo)
            </h3>
            <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
              <table className="w-full min-w-[820px] text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100 text-[11px] font-bold text-slate-700">
                    <th className="px-3 py-2.5">N°</th>
                    <th className="px-3 py-2.5">Dirección</th>
                    <th className="px-3 py-2.5">Fase 1</th>
                    <th className="px-3 py-2.5">Fase 2</th>
                    <th className="px-3 py-2.5">Estado general</th>
                    <th className="px-3 py-2.5">Última actualización</th>
                    <th className="px-3 py-2.5">Observaciones</th>
                    <th className="px-3 py-2.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {NATIONAL_DIRECTIONS.map((dir) => {
                    const gen = computeDirectionGeneralStatus(dir)
                    return (
                      <tr key={dir.id} className="hover:bg-slate-50">
                        <td className="px-3 py-2.5 font-semibold text-slate-500 tabular-nums">
                          {dir.number}
                        </td>
                        <td className="px-3 py-2.5 font-extrabold text-slate-900">{dir.code}</td>
                        <td className="px-3 py-2.5">
                          <StatusIconLabel status={dir.phase1} />
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusIconLabel status={dir.phase2} />
                        </td>
                        <td className="px-3 py-2.5">
                          <StatusBadge status={gen} />
                        </td>
                        <td className="px-3 py-2.5 text-slate-500 tabular-nums">
                          {dir.updatedAt}
                        </td>
                        <td className="px-3 py-2.5 text-slate-600">{dir.observation}</td>
                        <td className="px-3 py-2.5 text-right">
                          {gen !== 'completado' && (
                            <button
                              type="button"
                              onClick={() => {
                                const created = projectsService.createWorkItem({
                                  projectId,
                                  milestoneId: activeMilestone?.id,
                                  milestoneRef: activeMilestone
                                    ? `Fase ${activeMilestone.phaseNumber} · ${activeMilestone.name}`
                                    : 'CdD - MC SIGA',
                                  originType: 'accion_emergente',
                                  taskNature: 'contingencia_operativa',
                                  threatensMilestone: gen === 'pendiente',
                                  title: `Destrabar carga SIGA de Dirección ${dir.code}: ${dir.observation}`,
                                  description: `Seguimiento normativo a la Dirección ${dir.code} en el marco del Hito ${activeMilestone?.name ?? 'CdD - MC SIGA'}.`,
                                  state: 'todo',
                                  priority: gen === 'pendiente' ? 'URGENTE' : 'ALTA',
                                  assignee: {
                                    name: 'Coordinador DIGERE',
                                    role: 'Coordinador PMO',
                                    phone: '+51964112233',
                                  },
                                  storyPoints: 3,
                                  followUpDate: activeMilestone?.targetDate ?? '2026-10-22',
                                  scopeTag: `Dirección ${dir.code}`,
                                })
                                onOpenTask(created.id)
                              }}
                              className="inline-flex items-center gap-1 rounded-lg bg-[var(--hub-brand)] px-2.5 py-1 text-[11px] font-bold text-white hover:opacity-95 cursor-pointer"
                            >
                              <Plus size={12} />
                              Crear tarea
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          MODAL / DRAWER DE INSPECCIÓN DE UGEL Y CREACIÓN DE TAREA AMARRADA
          ════════════════════════════════════════════════════════════════════════ */}
      {inspectedUgel && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-[1px]">
          <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--hub-brand)]">
                  Monitoreo de Campo · {selectedRegion}
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  UGEL {inspectedUgel.name}
                </h3>
                <p className="text-xs text-slate-500">
                  Amarrado a: Fase {activeMilestone?.phaseNumber ?? 1} ·{' '}
                  {activeMilestone?.name ?? 'CdD - MC SIGA'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedUgelId(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {/* Control de subida de archivos por el Gestor de Campo */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Archivos Fase 1</span>
                    <StatusBadge
                      status={computePhaseStatus(
                        inspectedUgel.phase1Files,
                        inspectedUgel.phase1Total,
                      )}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                      {inspectedUgel.phase1Files}/{inspectedUgel.phase1Total}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCycleUgelFiles(inspectedUgel.id, 1)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Actualizar subida
                    </button>
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700">Archivos Fase 2</span>
                    <StatusBadge
                      status={computePhaseStatus(
                        inspectedUgel.phase2Files,
                        inspectedUgel.phase2Total,
                      )}
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-slate-900 tabular-nums">
                      {inspectedUgel.phase2Files}/{inspectedUgel.phase2Total}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCycleUgelFiles(inspectedUgel.id, 2)}
                      className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                    >
                      Actualizar subida
                    </button>
                  </div>
                </div>
              </div>

              {/* Estado por Dirección en esta UGEL */}
              <div className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-bold text-slate-800">
                  Checks por Dirección de Línea (clic para cambiar estado)
                </p>
                <div className="mt-3 grid grid-cols-7 gap-2 text-center">
                  {DIRECTION_CODES.map((code) => (
                    <div
                      key={code}
                      className="flex flex-col items-center gap-1.5 rounded-lg bg-slate-50 p-2"
                    >
                      <span className="text-[10px] font-bold text-slate-600">{code}</span>
                      <DirectionDot
                        status={inspectedUgel.directions[code]}
                        onClick={() => handleCycleDirectionStatus(inspectedUgel.id, code)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Tareas ya amarradas a esta UGEL */}
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-800">
                  Tareas vinculadas a UGEL {inspectedUgel.name} (
                  {getTasksForUgel(inspectedUgel.name).length})
                </p>
                {getTasksForUgel(inspectedUgel.name).length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-400">
                    Aún no hay tareas operativas creadas para esta UGEL.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {getTasksForUgel(inspectedUgel.name).map((t) => {
                      const contact = toFollowUpContact(t)
                      const waUrl = buildWhatsAppUrl(
                        t.assignee.phone,
                        buildFollowUpMessage(contact),
                      )
                      return (
                        <li
                          key={t.id}
                          className="flex items-center justify-between gap-2 rounded-xl border border-slate-200 bg-slate-50/70 p-2.5 text-xs"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setInspectedUgelId(null)
                              onOpenTask(t.id)
                            }}
                            className="min-w-0 flex-1 text-left"
                          >
                            <p className="truncate font-bold text-slate-900">{t.title}</p>
                            <p className="text-[11px] text-slate-500">
                              {t.id} · {WORK_ITEM_STATE_META[t.state].label} · {t.assignee.name}
                            </p>
                          </button>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500 text-white"
                              title={`WhatsApp a ${t.assignee.name}`}
                            >
                              <MessageCircle size={14} />
                            </a>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              {/* Crear nueva tarea amarrada a esta UGEL + Hito */}
              <div className="rounded-xl border border-[var(--hub-brand)]/30 bg-[var(--hub-brand-soft,#fbf0ec)]/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-[var(--hub-brand)]" />
                  <span className="text-xs font-extrabold text-slate-900">
                    Inyectar Tarea de Asistencia Técnica (Bandeja + Hito)
                  </span>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-semibold text-slate-600">
                    Acción requerida para UGEL {inspectedUgel.name}
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none focus:border-[var(--hub-brand)]"
                  />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    Responsable: <strong>{inspectedUgel.gestorName}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCreateTaskForUgel(inspectedUgel)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--hub-brand)] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer"
                  >
                    <Plus size={14} strokeWidth={2.5} />
                    Crear Tarea Vinculada
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TerritoryReporterTab
