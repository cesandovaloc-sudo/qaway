import React, { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  AlertCircle,
  BarChart3,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  Eye,
  FileSpreadsheet,
  FileText,
  FolderArchive,
  LayoutGrid,
  MessageCircle,
  Plus,
  Printer,
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
// TerritoryReporterV2Tab.tsx — Reporteador Territorial V2 (3 FILAS / 3 FASES)
// Fase 1: Carga inicial MC SIGA MINEDU
// Fase Intermedia: Evidencia Drive Regional (Declarativo — Corte 22/10/2026)
// Fase 2: Cierre Oficial RAR MC SIGA MINEDU (Formal — Corte 26/10/2026)
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

export interface UgelMonitoringV2Row {
  id: string
  number: number
  name: string
  // Fase 1: Carga Inicial MC SIGA
  phase1Files: number // 0..3
  phase1Total: number
  phase1Date: string
  // Fase Intermedia: Drive Regional (Declarativo — Corte 22/10/2026)
  driveStatus: TerritoryStatus
  driveFiles: number // 0..1
  driveTotal: number
  driveDate: string
  driveUrl?: string
  // Fase 2: Cierre Oficial RAR (Corte 26/10/2026)
  phase2Files: number // 0..3
  phase2Total: number
  phase2Date: string
  // Direcciones pedagógicas
  directions: Record<DirectionCode, TerritoryStatus>
  observation: string
  gestorName: string
  gestorPhone: string
}

const STORAGE_KEY_V2 = 'qaway_territory_reporter_v2'
export const REGIONAL_DRIVE_URL = 'https://drive.google.com/drive/folders/1QawayLab_Regional_Junin_Evidencias'

const INITIAL_JUNIN_UGELS_V2: UgelMonitoringV2Row[] = [
  {
    id: 'ugel-huancayo',
    number: 1,
    name: 'HUANCAYO',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '13/10/2026 10:15',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '21/10/2026 16:30',
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
    observation: 'Evidencia Excel cargada en Drive y RAR generado en SIGA.',
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
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '21/10/2026 18:10',
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
    observation: 'Validado con acta de AGP y archivo RAR enviado.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-chupaca',
    number: 3,
    name: 'CHUPACA',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '14/10/2026 11:00',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 09:45',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '14/10/2026 16:45',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: 'Evidencia en Drive OK. Cierre oficial notificado al Residente.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-jauja',
    number: 4,
    name: 'JAUJA',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '14/10/2026 08:30',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 08:15',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '14/10/2026 17:20',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: 'Culminación completa de las 3 etapas.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-tarma',
    number: 5,
    name: 'TARMA',
    phase1Files: 2,
    phase1Total: 3,
    phase1Date: '15/10/2026 14:10',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 10:30',
    phase2Files: 1,
    phase2Total: 3,
    phase2Date: 'En proceso',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'completado',
      DIGEDD: 'en_proceso',
      DIFOID: 'en_proceso',
      DITEN: 'completado',
    },
    observation: 'Cargó Excel en Drive preliminar; pendiente cierre RAR en MC SIGA.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-yauli',
    number: 6,
    name: 'YAULI',
    phase1Files: 2,
    phase1Total: 3,
    phase1Date: '15/10/2026 16:00',
    driveStatus: 'en_proceso',
    driveFiles: 0,
    driveTotal: 1,
    driveDate: 'Pendiente',
    phase2Files: 1,
    phase2Total: 3,
    phase2Date: 'En proceso',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'completado',
      DIGEDD: 'en_proceso',
      DIFOID: 'en_proceso',
      DITEN: 'completado',
    },
    observation: 'Subiendo archivos al Drive. Falta cerrar en MC SIGA.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-junin',
    number: 7,
    name: 'JUNÍN',
    phase1Files: 0,
    phase1Total: 3,
    phase1Date: 'Sin carga',
    driveStatus: 'pendiente',
    driveFiles: 0,
    driveTotal: 1,
    driveDate: 'Sin evidencia',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'Sin carga',
    directions: {
      DEI: 'pendiente',
      DEBA: 'pendiente',
      DISER: 'pendiente',
      DIGEBR: 'pendiente',
      DIGEDD: 'pendiente',
      DIFOID: 'pendiente',
      DITEN: 'pendiente',
    },
    observation: 'Alerta crítica: sin avance en SIGA ni evidencias en Drive.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-satipo',
    number: 8,
    name: 'SATIPO',
    phase1Files: 2,
    phase1Total: 3,
    phase1Date: '16/10/2026 12:40',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '21/10/2026 19:00',
    phase2Files: 1,
    phase2Total: 3,
    phase2Date: 'En proceso',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'completado',
      DIGEDD: 'en_proceso',
      DIFOID: 'en_proceso',
      DITEN: 'completado',
    },
    observation: 'Drive cargado oportunamente (21/10); procesando RAR oficial.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-chanchamayo',
    number: 9,
    name: 'CHANCHAMAYO',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '14/10/2026 15:30',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 07:30',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '15/10/2026 10:15',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: 'Culminación completa certificada.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-chupingo',
    number: 10,
    name: 'CHUPINGO',
    phase1Files: 0,
    phase1Total: 3,
    phase1Date: 'Sin carga',
    driveStatus: 'pendiente',
    driveFiles: 0,
    driveTotal: 1,
    driveDate: 'Sin evidencia',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'Sin carga',
    directions: {
      DEI: 'pendiente',
      DEBA: 'pendiente',
      DISER: 'pendiente',
      DIGEBR: 'pendiente',
      DIGEDD: 'pendiente',
      DIFOID: 'pendiente',
      DITEN: 'pendiente',
    },
    observation: 'Sin reporte en MC SIGA ni Drive regional.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-pichanaqui',
    number: 11,
    name: 'PICHANAQUI',
    phase1Files: 2,
    phase1Total: 3,
    phase1Date: '16/10/2026 17:10',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 09:10',
    phase2Files: 1,
    phase2Total: 3,
    phase2Date: 'En proceso',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'completado',
      DIGEDD: 'en_proceso',
      DIFOID: 'en_proceso',
      DITEN: 'completado',
    },
    observation: 'Evidencia en Drive OK; culminando cierre en MC SIGA.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-rio-tambo',
    number: 12,
    name: 'RÍO TAMBO',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '15/10/2026 11:20',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '21/10/2026 15:40',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '15/10/2026 18:00',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: 'Culminación completa de las 3 fases.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-vitoc',
    number: 13,
    name: 'VITOC',
    phase1Files: 2,
    phase1Total: 3,
    phase1Date: '16/10/2026 09:00',
    driveStatus: 'en_proceso',
    driveFiles: 0,
    driveTotal: 1,
    driveDate: 'En preparación',
    phase2Files: 1,
    phase2Total: 3,
    phase2Date: 'En proceso',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'completado',
      DIGEDD: 'en_proceso',
      DIFOID: 'en_proceso',
      DITEN: 'completado',
    },
    observation: 'Validando Excel para carga en Drive antes de corte 22/10.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
]

function computePhaseStatus(files: number, total: number): TerritoryStatus {
  if (files >= total) return 'completado'
  if (files > 0) return 'en_proceso'
  return 'pendiente'
}

function computeUgelGeneralStatusV2(row: UgelMonitoringV2Row): TerritoryStatus {
  const p1 = computePhaseStatus(row.phase1Files, row.phase1Total)
  const dr = row.driveStatus
  const p2 = computePhaseStatus(row.phase2Files, row.phase2Total)

  if (p1 === 'completado' && dr === 'completado' && p2 === 'completado') return 'completado'
  if (p1 === 'pendiente' && dr === 'pendiente' && p2 === 'pendiente') return 'pendiente'
  return 'en_proceso'
}

function computeUgelCompletedCount(row: UgelMonitoringV2Row): number {
  let count = 0
  if (row.phase1Files >= row.phase1Total) count++
  if (row.driveStatus === 'completado') count++
  if (row.phase2Files >= row.phase2Total) count++
  return count
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

export function TerritoryReporterV2Tab({
  projectId: _projectId,
  onOpenTask,
}: {
  projectId: string
  onOpenTask?: (taskId: string) => void
}) {
  const brand = useHubBrand()
  const { workItems } = useProjectsDataset()
  const [searchParams, setSearchParams] = useSearchParams()

  const [ugels, setUgels] = useState<UgelMonitoringV2Row[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_V2)
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return INITIAL_JUNIN_UGELS_V2
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(ugels))
    } catch {
      // ignore
    }
  }, [ugels])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterPhase, setFilterPhase] = useState<'Todas' | 'Fase 1' | 'Drive' | 'Fase 2'>('Todas')
  const [filterDirection, setFilterDirection] = useState<'Todas' | DirectionCode>('Todas')
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Completado' | 'En proceso' | 'Pendiente'>('Todos')

  const [activePhaseHover, setActivePhaseHover] = useState<{
    text: string
    bgColor: string
    textColor: string
    dotColor: string
  } | null>(null)

  const [activeDonutHover, setActiveDonutHover] = useState<{
    title: string
    count: number
    percentage: number
    color: string
  } | null>(null)

  const [inspectedUgel, setInspectedUgel] = useState<UgelMonitoringV2Row | null>(null)

  // Estadísticas globales de las 13 UGEL en V2
  const ugelStats = useMemo(() => {
    let completed = 0
    let inProgress = 0
    let pending = 0

    let p1Completed = 0
    let p1InProgress = 0
    let p1Pending = 0

    let driveCompleted = 0
    let driveInProgress = 0
    let drivePending = 0

    let p2Completed = 0
    let p2InProgress = 0
    let p2Pending = 0

    for (const u of ugels) {
      const gen = computeUgelGeneralStatusV2(u)
      if (gen === 'completado') completed++
      else if (gen === 'en_proceso') inProgress++
      else pending++

      const s1 = computePhaseStatus(u.phase1Files, u.phase1Total)
      if (s1 === 'completado') p1Completed++
      else if (s1 === 'en_proceso') p1InProgress++
      else p1Pending++

      if (u.driveStatus === 'completado') driveCompleted++
      else if (u.driveStatus === 'en_proceso') driveInProgress++
      else drivePending++

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
      driveCompleted,
      driveInProgress,
      drivePending,
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
        const gen = computeUgelGeneralStatusV2(u)
        const statusMap = {
          Completado: 'completado',
          'En proceso': 'en_proceso',
          Pendiente: 'pendiente',
        }
        if (gen !== statusMap[filterStatus]) return false
      }

      if (filterDirection !== 'Todas') {
        if (u.directions[filterDirection] !== 'completado') return false
      }

      return true
    })
  }, [ugels, searchQuery, filterStatus, filterDirection])

  // Ciclador de archivos en Fase 1 y Fase 2
  const handleCycleUgelFiles = (ugelId: string, phase: 1 | 2) => {
    setUgels((prev) =>
      prev.map((u) => {
        if (u.id !== ugelId) return u
        if (phase === 1) {
          const nextFiles = (u.phase1Files + 1) % (u.phase1Total + 1)
          return {
            ...u,
            phase1Files: nextFiles,
            phase1Date: nextFiles > 0 ? 'Actualizado hoy' : 'Sin carga',
          }
        }
        const nextFiles = (u.phase2Files + 1) % (u.phase2Total + 1)
        return {
          ...u,
          phase2Files: nextFiles,
          phase2Date: nextFiles > 0 ? 'Actualizado hoy' : 'Sin carga',
        }
      }),
    )
  }

  // Ciclador de estado Drive Regional
  const handleCycleDriveStatus = (ugelId: string) => {
    setUgels((prev) =>
      prev.map((u) => {
        if (u.id !== ugelId) return u
        const nextStatus: TerritoryStatus =
          u.driveStatus === 'completado'
            ? 'pendiente'
            : u.driveStatus === 'pendiente'
              ? 'en_proceso'
              : 'completado'
        return {
          ...u,
          driveStatus: nextStatus,
          driveFiles: nextStatus === 'completado' ? 1 : 0,
          driveDate: nextStatus === 'completado' ? 'Evidencia cargada (22/10)' : nextStatus === 'en_proceso' ? 'En preparación' : 'Sin evidencia',
        }
      }),
    )
  }

  const getTasksForUgel = (ugelName: string): WorkItem[] => {
    const q = ugelName.trim().toLowerCase()
    return workItems.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        (item.description && item.description.toLowerCase().includes(q)),
    )
  }

  return (
    <div className="space-y-6 pb-20 print:space-y-3 print:pb-0 font-sans text-slate-800">
      {/* ── ALERTA OFICIAL MINEDU / DRE: 3 FASES DE CONTROL ── */}
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white p-5 shadow-sm print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-md">
              <FolderArchive size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10.5px] font-black uppercase tracking-wider text-white">
                  Procedimiento Oficial 3 Fases
                </span>
                <span className="text-xs font-bold text-slate-500">Hito 1.6: MC SIGA MINEDU</span>
              </div>
              <h2 className="mt-1 text-base font-extrabold text-slate-900">
                Monitoreo Territorial V2: Carga Inicial, Evidencia Drive y Cierre Oficial RAR
              </h2>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-4xl">
                <strong>Importante:</strong> El envío al <strong>DRIVE regional</strong> es preliminar y declarativo (Corte: <strong>22/10/2026</strong>) para facilitar el seguimiento de la DRE. El <strong>cierre oficial</strong> se ejecuta en el MC SIGA MINEDU con la generación y remisión del archivo <strong>RAR de la FASE 2</strong> al Residente SIGA (Corte: <strong>26/10/2026</strong>).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href={REGIONAL_DRIVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border border-blue-300 bg-white px-3.5 py-2 text-xs font-bold text-blue-700 shadow-2xs hover:bg-blue-50 transition-colors cursor-pointer"
            >
              <FileSpreadsheet size={15} className="text-emerald-600" />
              <span>Abrir Drive Regional</span>
              <ExternalLink size={13} className="text-slate-400" />
            </a>
            <Link
              to="/monitoreo-territorial"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-900 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-slate-800 transition-colors"
              title="Volver a la versión V1 original de 2 fases"
            >
              <span>Ver V1 (2 Fases)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 1. CINTA SUPERIOR: ESTADO POR UGEL (3 FASES: F1 · DRIVE · F2) ── */}
      <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-stretch">
          {/* Header lateral de la cinta */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-3 text-white lg:w-44 lg:flex-col lg:items-start lg:justify-center lg:border-r lg:border-b-0 lg:p-4 shrink-0">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Control Junín</p>
              <h3 className="text-sm font-extrabold text-white">Estado por UGEL</h3>
              <p className="text-[10px] font-semibold text-emerald-400">(F1 · Drive · F2)</p>
            </div>
            <span className="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white">
              13 UGEL
            </span>
          </div>

          {/* Grid de las 13 UGEL en base 3 */}
          <div className="grid flex-1 grid-cols-2 divide-x divide-y divide-slate-100 sm:grid-cols-4 md:grid-cols-7 lg:grid-cols-13 lg:divide-y-0">
            {ugels.map((u) => {
              const compCount = computeUgelCompletedCount(u)
              const isAllOk = compCount === 3
              const isZero = compCount === 0

              const badgeColor = isAllOk
                ? 'bg-emerald-600 text-white'
                : isZero
                  ? 'bg-rose-600 text-white'
                  : 'bg-amber-400 text-slate-950'

              return (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setInspectedUgel(u)}
                  className={`flex flex-col items-center justify-center p-3 text-center transition-all hover:brightness-105 cursor-pointer ${
                    isAllOk
                      ? 'bg-emerald-600 text-white'
                      : isZero
                        ? 'bg-rose-600 text-white'
                        : 'bg-amber-400 text-slate-900'
                  }`}
                  title={`${u.name}: ${compCount} de 3 fases completadas (Clic para inspeccionar)`}
                >
                  <span className="text-[10.5px] font-black uppercase tracking-tight truncate max-w-full">
                    {u.name}
                  </span>
                  <div className="my-1.5 grid h-6 w-6 place-items-center rounded-full bg-white/20 backdrop-blur-xs">
                    {isAllOk ? (
                      <Check size={14} strokeWidth={3} className="text-white" />
                    ) : isZero ? (
                      <X size={14} strokeWidth={3} className="text-white" />
                    ) : (
                      <Clock size={14} strokeWidth={2.6} className="text-slate-900" />
                    )}
                  </div>
                  <span className="text-xs font-black tracking-tight tabular-nums">
                    {compCount}/3
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── 2. FILA DE 4 TARJETAS KPI RESUMEN ── */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 print:gap-2">
        <div className="flex items-center gap-3.5 rounded-xl border border-slate-200/90 bg-white p-4 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-slate-100 text-slate-700">
            <Building2 size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">TOTAL DE UGEL</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-slate-900 tabular-nums">{ugelStats.total}</span>
              <span className="text-xs font-semibold text-slate-500">Región Junín</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-4 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-100 text-emerald-700">
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">CUMPLEN (3/3)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-900 tabular-nums">{ugelStats.completed}</span>
              <span className="text-xs font-bold text-emerald-700">{ugelStats.completedPct}% del total</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-amber-200/80 bg-amber-50/40 p-4 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-700">
            <Clock size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">EN PROCESO (1-2/3)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-amber-900 tabular-nums">{ugelStats.inProgress}</span>
              <span className="text-xs font-bold text-amber-700">{ugelStats.inProgressPct}% del total</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3.5 rounded-xl border border-rose-200/80 bg-rose-50/40 p-4 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-rose-100 text-rose-700">
            <AlertCircle size={22} />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700">PENDIENTES (0/3)</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-rose-900 tabular-nums">{ugelStats.pending}</span>
              <span className="text-xs font-bold text-rose-700">{ugelStats.pendingPct}% del total</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FILA DE 3 GRÁFICOS EJECUTIVOS (CARD 1: 3 FILAS DE AVANCE) ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 print:grid-cols-3 print:gap-2.5">
        {/* Card 1: Avance por fase (3 FILAS: Fase 1 · Drive Regional · Fase 2) */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[295px] print:min-h-0 print:p-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:pb-1.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 print:text-xs">Avance por fase (todas las UGEL)</h3>
              <p className="text-[11px] text-slate-400 print:text-[9px]">
                Carga inicial, Drive declarativo y Cierre RAR
              </p>
            </div>
            {activePhaseHover ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-0.5 text-[10.5px] font-bold shadow-2xs transition-all duration-150 animate-in fade-in print:text-[8.5px]"
                style={{
                  backgroundColor: activePhaseHover.bgColor,
                  color: activePhaseHover.textColor,
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: activePhaseHover.dotColor }}
                />
                {activePhaseHover.text}
              </span>
            ) : (
              <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-700 print:text-[8px]">
                3 Fases de Control
              </span>
            )}
          </div>

          {/* LAS 3 FILAS DE BARRAS CONTINUAS */}
          <div className="my-auto space-y-3.5 py-3 print:space-y-1.5 print:py-1">
            {[
              {
                label: 'Fase 1',
                sublabel: 'MC SIGA',
                ok: ugelStats.p1Completed,
                prog: ugelStats.p1InProgress,
                pend: ugelStats.p1Pending,
              },
              {
                label: 'Drive Reg.',
                sublabel: 'Excel 22/10',
                ok: ugelStats.driveCompleted,
                prog: ugelStats.driveInProgress,
                pend: ugelStats.drivePending,
              },
              {
                label: 'Fase 2',
                sublabel: 'RAR 26/10',
                ok: ugelStats.p2Completed,
                prog: ugelStats.p2InProgress,
                pend: ugelStats.p2Pending,
              },
            ].map((f) => (
              <div key={f.label} className="flex items-center gap-3 print:gap-1.5">
                <div className="w-16 shrink-0 text-left print:w-14">
                  <span className="block text-xs font-extrabold text-slate-800 leading-none print:text-[10px]">
                    {f.label}
                  </span>
                  <span className="block text-[9.5px] font-semibold text-slate-400 leading-tight print:text-[8px]">
                    {f.sublabel}
                  </span>
                </div>

                <div className="relative flex-1">
                  <div className="flex h-8 overflow-hidden rounded-lg bg-slate-100 shadow-inner print:h-6">
                    {f.ok > 0 && (
                      <div
                        style={{ width: `${(f.ok / ugelStats.total) * 100}%` }}
                        onMouseEnter={() =>
                          setActivePhaseHover({
                            text: `${f.label} · Cumplen: ${f.ok} UGEL (${Math.round((f.ok / ugelStats.total) * 100)}%)`,
                            bgColor: '#dcfce7',
                            textColor: '#166534',
                            dotColor: '#16a34a',
                          })
                        }
                        onMouseLeave={() => setActivePhaseHover(null)}
                        className="group/seg relative flex h-full items-center justify-center bg-emerald-600 border-r border-white/20 transition-all duration-150 hover:brightness-110 cursor-pointer"
                      >
                        <span className="text-xs font-black text-white tabular-nums select-none transition-transform group-hover/seg:scale-110 print:text-[10px]">
                          {f.ok}
                        </span>
                      </div>
                    )}
                    {f.prog > 0 && (
                      <div
                        style={{ width: `${(f.prog / ugelStats.total) * 100}%` }}
                        onMouseEnter={() =>
                          setActivePhaseHover({
                            text: `${f.label} · En proceso: ${f.prog} UGEL (${Math.round((f.prog / ugelStats.total) * 100)}%)`,
                            bgColor: '#fef3c7',
                            textColor: '#92400e',
                            dotColor: '#d97706',
                          })
                        }
                        onMouseLeave={() => setActivePhaseHover(null)}
                        className="group/seg relative flex h-full items-center justify-center bg-amber-400 border-r border-white/20 transition-all duration-150 hover:brightness-110 cursor-pointer"
                      >
                        <span className="text-xs font-black text-slate-900 tabular-nums select-none transition-transform group-hover/seg:scale-110 print:text-[10px]">
                          {f.prog}
                        </span>
                      </div>
                    )}
                    {f.pend > 0 && (
                      <div
                        style={{ width: `${(f.pend / ugelStats.total) * 100}%` }}
                        onMouseEnter={() =>
                          setActivePhaseHover({
                            text: `${f.label} · Pendiente: ${f.pend} UGEL (${Math.round((f.pend / ugelStats.total) * 100)}%)`,
                            bgColor: '#ffe4e6',
                            textColor: '#9f1239',
                            dotColor: '#e11d48',
                          })
                        }
                        onMouseLeave={() => setActivePhaseHover(null)}
                        className="group/seg relative flex h-full items-center justify-center bg-rose-600 transition-all duration-150 hover:brightness-110 cursor-pointer"
                      >
                        <span className="text-xs font-black text-white tabular-nums select-none transition-transform group-hover/seg:scale-110 print:text-[10px]">
                          {f.pend}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-10 text-right print:w-8">
                  <span className="text-xs font-black text-slate-900 tabular-nums print:text-[10px]">
                    13
                  </span>
                  <span className="block text-[8px] font-bold text-slate-400 uppercase leading-none">
                    UGEL
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Leyenda inferior */}
          <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500 print:pt-1.5 print:text-[9px]">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span>Completado</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span>En proceso</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
              <span>Pendiente</span>
            </div>
          </div>
        </div>

        {/* Card 2: Estado global (Donut Chart) */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[295px] print:min-h-0 print:p-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:pb-1.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 print:text-xs">Estado global (3 fases)</h3>
              <p className="text-[11px] text-slate-400 print:text-[9px]">Consolidado regional en territorio</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 print:text-[8px]">
              Total
            </span>
          </div>

          <div className="my-auto flex items-center justify-center gap-6 py-2">
            <div className="relative flex items-center justify-center">
              <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
                <circle cx="65" cy="65" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
                {/* Completados */}
                <circle
                  cx="65"
                  cy="65"
                  r="50"
                  fill="transparent"
                  stroke="#16a34a"
                  strokeWidth="18"
                  strokeDasharray={`${(ugelStats.completed / ugelStats.total) * 314.16} 314.16`}
                  strokeDashoffset="0"
                />
                {/* En proceso */}
                <circle
                  cx="65"
                  cy="65"
                  r="50"
                  fill="transparent"
                  stroke="#fbbf24"
                  strokeWidth="18"
                  strokeDasharray={`${(ugelStats.inProgress / ugelStats.total) * 314.16} 314.16`}
                  strokeDashoffset={`-${(ugelStats.completed / ugelStats.total) * 314.16}`}
                />
                {/* Pendientes */}
                <circle
                  cx="65"
                  cy="65"
                  r="50"
                  fill="transparent"
                  stroke="#e11d48"
                  strokeWidth="18"
                  strokeDasharray={`${(ugelStats.pending / ugelStats.total) * 314.16} 314.16`}
                  strokeDashoffset={`-${((ugelStats.completed + ugelStats.inProgress) / ugelStats.total) * 314.16}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 leading-none tabular-nums">
                  {ugelStats.total}
                </span>
                <span className="text-[10px] font-bold uppercase text-slate-400 leading-tight">
                  UGEL
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-600" />
                <span className="font-semibold text-slate-700">Completado ({ugelStats.completed})</span>
                <span className="text-slate-400 font-bold">— {ugelStats.completedPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="font-semibold text-slate-700">En proceso ({ugelStats.inProgress})</span>
                <span className="text-slate-400 font-bold">— {ugelStats.inProgressPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-600" />
                <span className="font-semibold text-slate-700">Pendiente ({ugelStats.pending})</span>
                <span className="text-slate-400 font-bold">— {ugelStats.pendingPct}%</span>
              </div>
            </div>
          </div>

          <div className="text-center border-t border-slate-100 pt-2 text-[10px] text-slate-400">
            Pasa el mouse sobre el gráfico para ver detalle numérico
          </div>
        </div>

        {/* Card 3: Avance por dirección pedagógica */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[295px] print:min-h-0 print:p-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:pb-1.5">
            <div>
              <h3 className="text-sm font-bold text-slate-900 print:text-xs">Avance por dirección (todas las UGEL)</h3>
              <p className="text-[11px] text-slate-400 print:text-[9px]">7 Direcciones de línea pedagógicas</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 print:text-[8px]">
              DEI - DITEN
            </span>
          </div>

          <div className="my-auto space-y-2 py-2">
            {ugelStats.directionStats.map((d) => (
              <div key={d.code} className="flex items-center gap-2 text-xs">
                <span className="w-12 font-bold text-slate-700 print:w-10 text-[11px]">{d.code}</span>
                <div className="relative flex-1">
                  <div className="flex h-3.5 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                    <div style={{ width: `${(d.ok / d.total) * 100}%` }} className="bg-emerald-600" />
                    <div style={{ width: `${(d.prog / d.total) * 100}%` }} className="bg-amber-400" />
                    <div style={{ width: `${(d.pend / d.total) * 100}%` }} className="bg-rose-600" />
                  </div>
                </div>
                <span className="w-10 text-right font-black text-slate-900 tabular-nums text-[11px]">
                  {d.pct}%
                </span>
                <span className="text-[10px] text-slate-400 tabular-nums">
                  {d.ok}/{d.total}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[10.5px] text-slate-500 font-semibold">
            <span>7 Direcciones evaluadas</span>
            <span>13 UGEL Junín</span>
          </div>
        </div>
      </section>

      {/* ── 4. CUADRO DE MANDO INFERIOR: DETALLE POR UGEL (3 BLOQUES DE FASE) ── */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden">
        {/* Cabecera del Cuadro de Mando Inferior */}
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                Detalle por UGEL – Región Junín (Monitoreo V2 · 3 Fases)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Estado de subida por fase, evidencia Drive (Corte 22/10), cierre RAR (Corte 26/10) y direcciones pedagógicas.
            </p>
          </div>

          {/* Filtros superiores de la tabla */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar UGEL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-44 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Completado">Completados</option>
              <option value="En proceso">En proceso</option>
              <option value="Pendiente">Pendientes</option>
            </select>

            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value as any)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none"
            >
              <option value="Todas">Todas las direcciones</option>
              {DIRECTION_CODES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla responsive con las 3 fases claramente delimitadas */}
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[1300px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/90 text-[11px] font-bold text-slate-700">
                <th rowSpan={2} className="px-2.5 py-2 text-center w-10">
                  N°
                </th>
                <th rowSpan={2} className="px-3 py-2 w-36">
                  UGEL
                </th>
                {/* BLOQUE FASE 1 */}
                <th colSpan={3} className="border-x border-slate-200 px-3 py-1.5 text-center bg-blue-50/50 text-blue-900">
                  Fase 1 (MC SIGA)
                </th>
                {/* BLOQUE FASE INTERMEDIA DRIVE */}
                <th colSpan={3} className="border-r border-slate-200 px-3 py-1.5 text-center bg-amber-50/60 text-amber-900">
                  Drive Regional (Declarativo 22/10)
                </th>
                {/* BLOQUE FASE 2 CIERRE RAR */}
                <th colSpan={3} className="border-r border-slate-200 px-3 py-1.5 text-center bg-indigo-50/50 text-indigo-900">
                  Fase 2 (Cierre RAR 26/10)
                </th>
                <th rowSpan={2} className="px-3 py-2 text-center w-28">
                  Estado general
                </th>
                <th colSpan={7} className="border-x border-slate-200 px-2 py-1.5 text-center">
                  Direcciones (DEI - DITEN)
                </th>
                <th rowSpan={2} className="px-3 py-2 w-52">
                  Observaciones
                </th>
                <th rowSpan={2} className="px-3 py-2 text-right w-24">
                  Acción
                </th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500">
                {/* Subcolumnas Fase 1 */}
                <th className="border-l border-slate-200 px-2 py-1">Estado</th>
                <th className="px-2 py-1">Fecha</th>
                <th className="border-r border-slate-200 px-1.5 py-1 text-center">Archivos</th>
                {/* Subcolumnas Drive */}
                <th className="px-2 py-1">Estado Drive</th>
                <th className="px-2 py-1">Fecha entrega</th>
                <th className="border-r border-slate-200 px-1.5 py-1 text-center">Excel</th>
                {/* Subcolumnas Fase 2 */}
                <th className="px-2 py-1">Estado RAR</th>
                <th className="px-2 py-1">Fecha cierre</th>
                <th className="border-r border-slate-200 px-1.5 py-1 text-center">RAR</th>
                {/* Direcciones */}
                {DIRECTION_CODES.map((code) => (
                  <th key={code} className="px-1.5 py-1 text-center">
                    {code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUgels.map((u) => {
                const p1Status = computePhaseStatus(u.phase1Files, u.phase1Total)
                const p2Status = computePhaseStatus(u.phase2Files, u.phase2Total)
                const genStatus = computeUgelGeneralStatusV2(u)

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
                        onClick={() => setInspectedUgel(u)}
                        className="hover:underline cursor-pointer text-left"
                      >
                        {u.name}
                      </button>
                    </td>

                    {/* BLOQUE FASE 1 */}
                    <td className="border-l border-slate-100 px-2 py-2.5">
                      <StatusIconLabel status={p1Status} />
                    </td>
                    <td className="px-2 py-2.5 text-[11px] text-slate-500 tabular-nums">
                      {u.phase1Date}
                    </td>
                    <td className="border-r border-slate-100 px-1.5 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 1)}
                        title="Clic para actualizar archivos Fase 1"
                        className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-700 hover:bg-slate-200 tabular-nums cursor-pointer"
                      >
                        {u.phase1Files}/{u.phase1Total}
                      </button>
                    </td>

                    {/* BLOQUE DRIVE REGIONAL (INTERMEDIA) */}
                    <td className="px-2 py-2.5">
                      <StatusIconLabel status={u.driveStatus} />
                    </td>
                    <td className="px-2 py-2.5 text-[11px] text-slate-500 tabular-nums">
                      {u.driveDate}
                    </td>
                    <td className="border-r border-slate-100 px-1.5 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleDriveStatus(u.id)}
                        title="Clic para alternar estado de entrega en Drive"
                        className={`rounded px-2 py-0.5 font-bold text-xs tabular-nums cursor-pointer ${
                          u.driveStatus === 'completado'
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : u.driveStatus === 'en_proceso'
                              ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                        }`}
                      >
                        {u.driveStatus === 'completado' ? '1/1 Excel' : '0/1'}
                      </button>
                    </td>

                    {/* BLOQUE FASE 2 (CIERRE RAR) */}
                    <td className="px-2 py-2.5">
                      <StatusIconLabel status={p2Status} />
                    </td>
                    <td className="px-2 py-2.5 text-[11px] text-slate-500 tabular-nums">
                      {u.phase2Date}
                    </td>
                    <td className="border-r border-slate-100 px-1.5 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 2)}
                        title="Clic para actualizar archivos RAR Fase 2"
                        className="rounded bg-slate-100 px-1.5 py-0.5 font-bold text-slate-700 hover:bg-slate-200 tabular-nums cursor-pointer"
                      >
                        {u.phase2Files}/{u.phase2Total}
                      </button>
                    </td>

                    {/* ESTADO GENERAL */}
                    <td className="px-3 py-2.5 text-center">
                      <StatusBadge status={genStatus} />
                    </td>

                    {/* DIRECCIONES PEDAGÓGICAS */}
                    {DIRECTION_CODES.map((code) => {
                      const st = u.directions[code]
                      const color =
                        st === 'completado'
                          ? 'bg-emerald-600'
                          : st === 'en_proceso'
                            ? 'bg-amber-400'
                            : 'bg-rose-600'
                      return (
                        <td key={code} className="px-1.5 py-2.5 text-center">
                          <span
                            className={`inline-block h-3.5 w-3.5 rounded-full ${color}`}
                            title={`${code}: ${st}`}
                          />
                        </td>
                      )
                    })}

                    {/* OBSERVACIONES */}
                    <td className="px-3 py-2.5 text-[11.5px] text-slate-600 leading-snug">
                      {u.observation}
                    </td>

                    {/* ACCIÓN */}
                    <td className="px-3 py-2.5 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectedUgel(u)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                      >
                        Detalle
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── MODAL / DRAWER DE INSPECCIÓN DE UGEL EN V2 ── */}
      {inspectedUgel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">
                  Inspección Territorial 3 Fases
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  UGEL {inspectedUgel.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setInspectedUgel(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              {/* Controles de las 3 Fases */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Control Fase 1 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="block text-[10.5px] font-bold text-slate-500 uppercase">Fase 1: SIGA</span>
                  <span className="text-xl font-black text-slate-900 tabular-nums">
                    {inspectedUgel.phase1Files}/{inspectedUgel.phase1Total}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCycleUgelFiles(inspectedUgel.id, 1)
                      setInspectedUgel((prev) =>
                        prev
                          ? { ...prev, phase1Files: (prev.phase1Files + 1) % (prev.phase1Total + 1) }
                          : null,
                      )
                    }}
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Actualizar
                  </button>
                </div>

                {/* Control Drive */}
                <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3">
                  <span className="block text-[10.5px] font-bold text-amber-800 uppercase">Drive (22/10)</span>
                  <span className="text-xl font-black text-amber-950 tabular-nums">
                    {inspectedUgel.driveStatus === 'completado' ? '1/1 Excel' : '0/1'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCycleDriveStatus(inspectedUgel.id)
                      setInspectedUgel((prev) => {
                        if (!prev) return null
                        const next =
                          prev.driveStatus === 'completado'
                            ? 'pendiente'
                            : prev.driveStatus === 'pendiente'
                              ? 'en_proceso'
                              : 'completado'
                        return {
                          ...prev,
                          driveStatus: next,
                          driveFiles: next === 'completado' ? 1 : 0,
                        }
                      })
                    }}
                    className="mt-2 w-full rounded-md border border-amber-300 bg-white py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-100 cursor-pointer"
                  >
                    Alternar
                  </button>
                </div>

                {/* Control Fase 2 */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <span className="block text-[10.5px] font-bold text-slate-500 uppercase">Fase 2: RAR</span>
                  <span className="text-xl font-black text-slate-900 tabular-nums">
                    {inspectedUgel.phase2Files}/{inspectedUgel.phase2Total}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      handleCycleUgelFiles(inspectedUgel.id, 2)
                      setInspectedUgel((prev) =>
                        prev
                          ? { ...prev, phase2Files: (prev.phase2Files + 1) % (prev.phase2Total + 1) }
                          : null,
                      )
                    }}
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    Actualizar
                  </button>
                </div>
              </div>

              {/* Observación */}
              <div className="rounded-xl border border-slate-200 p-3 bg-slate-50">
                <span className="block text-xs font-bold text-slate-500">Observación territorial:</span>
                <p className="mt-1 text-xs text-slate-700 leading-relaxed font-medium">
                  {inspectedUgel.observation}
                </p>
              </div>

              {/* Contacto Gestor */}
              <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-3">
                <div>
                  <span className="font-bold">Gestor:</span> {inspectedUgel.gestorName}
                </div>
                <a
                  href={`https://wa.me/${inspectedUgel.gestorPhone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-emerald-600 hover:underline"
                >
                  <MessageCircle size={14} />
                  <span>Contactar WhatsApp</span>
                </a>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectedUgel(null)}
                className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
