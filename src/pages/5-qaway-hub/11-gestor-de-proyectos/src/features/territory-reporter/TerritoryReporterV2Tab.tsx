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
// TerritoryReporterV2Tab.tsx — Matriz Ejecutiva Institucional (3 ETAPAS)
// Etapa 1: Fase 1 · Registro MC SIGA
// Etapa 2: Drive · Evidencia declarativa (Corte 22/10/2026)
// Etapa 3: Fase 2 · RAR oficial (Corte 26/10/2026)
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
  // Etapa 1: Fase 1 - Registro MC SIGA
  phase1Files: number // 0..3
  phase1Total: number
  phase1Date: string
  // Etapa 2: Drive - Evidencia declarativa (Corte 22/10/2026)
  driveStatus: TerritoryStatus
  driveFiles: number // 0..1
  driveTotal: number
  driveDate: string
  // Etapa 3: Fase 2 - RAR oficial (Corte 26/10/2026)
  phase2Files: number // 0..3
  phase2Total: number
  phase2Date: string
  // Direcciones pedagógicas
  directions: Record<DirectionCode, TerritoryStatus>
  observation: string
  gestorName: string
  gestorPhone: string
}

const STORAGE_KEY_V2 = 'qaway_territory_reporter_v2_fase1_green_f2_neutral'
export const REGIONAL_DRIVE_URL = 'https://drive.google.com/drive/folders/1QawayLab_Regional_Junin_Evidencias'

const INITIAL_JUNIN_UGELS_V2: UgelMonitoringV2Row[] = [
  {
    id: 'ugel-chanchamayo',
    number: 1,
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
    observation: 'Culminación completa certificada en las 3 etapas.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-chupaca',
    number: 2,
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
    observation: 'Evidencia en Drive OK. Cierre oficial notificado al Residente SIGA.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-concepcion',
    number: 3,
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
    id: 'ugel-huancayo',
    number: 4,
    name: 'HUANCAYO',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '13/10/2026 10:15',
    driveStatus: 'pendiente',
    driveFiles: 0,
    driveTotal: 1,
    driveDate: 'Sin evidencia',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEI: 'completado',
      DEBA: 'completado',
      DISER: 'completado',
      DIGEBR: 'completado',
      DIGEDD: 'completado',
      DIFOID: 'completado',
      DITEN: 'completado',
    },
    observation: 'Fase 1 completada; pendiente subida de evidencia en Drive. Cierre oficial en plazo.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-jauja',
    number: 5,
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
    id: 'ugel-junin',
    number: 6,
    name: 'JUNÍN',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '15/10/2026 12:00',
    driveStatus: 'pendiente',
    driveFiles: 0,
    driveTotal: 1,
    driveDate: 'Sin evidencia',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'pendiente',
      DIGEBR: 'completado',
      DIGEDD: 'pendiente',
      DIFOID: 'pendiente',
      DITEN: 'en_proceso',
    },
    observation: 'Fase 1 OK; pendiente evidencia en Drive (corte 22/10). RAR oficial en plazo.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-pangoa',
    number: 7,
    name: 'PANGOA',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '16/10/2026 10:20',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 08:40',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'completado',
      DIGEDD: 'en_proceso',
      DIFOID: 'en_proceso',
      DITEN: 'completado',
    },
    observation: 'Fase 1 y Drive OK. Consolidando generación de RAR en MC SIGA hasta el 26/10.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-pichanaqui',
    number: 8,
    name: 'PICHANAQUI',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '16/10/2026 17:10',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 09:10',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'completado',
      DIGEDD: 'en_proceso',
      DIFOID: 'en_proceso',
      DITEN: 'completado',
    },
    observation: 'Fase 1 y Drive OK; procesando cierre oficial en MC SIGA hasta el 26/10.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-rio-ene-mantaro',
    number: 9,
    name: 'RÍO ENE MANTARO',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '17/10/2026 11:30',
    driveStatus: 'en_proceso',
    driveFiles: 0,
    driveTotal: 1,
    driveDate: 'En proceso',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEI: 'en_proceso',
      DEBA: 'en_proceso',
      DISER: 'pendiente',
      DIGEBR: 'en_proceso',
      DIGEDD: 'pendiente',
      DIFOID: 'pendiente',
      DITEN: 'en_proceso',
    },
    observation: 'Fase 1 OK. Subida a Drive en proceso (22/10). Cierre oficial en plazo regular.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-rio-tambo',
    number: 10,
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
    id: 'ugel-satipo',
    number: 11,
    name: 'SATIPO',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '16/10/2026 12:40',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '21/10/2026 19:00',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'completado',
      DIGEDD: 'en_proceso',
      DIFOID: 'en_proceso',
      DITEN: 'completado',
    },
    observation: 'Drive cargado oportunamente (21/10); elaboración de RAR en plazo oficial.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-tarma',
    number: 12,
    name: 'TARMA',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '15/10/2026 14:10',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 10:30',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'completado',
      DIGEDD: 'en_proceso',
      DIFOID: 'en_proceso',
      DITEN: 'completado',
    },
    observation: 'Excel en Drive OK; procesando cierre oficial RAR en MC SIGA hasta 26/10.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-yauli',
    number: 13,
    name: 'YAULI',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '15/10/2026 16:00',
    driveStatus: 'en_proceso',
    driveFiles: 0,
    driveTotal: 1,
    driveDate: 'En proceso',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEI: 'completado',
      DEBA: 'en_proceso',
      DISER: 'en_proceso',
      DIGEBR: 'completado',
      DIGEDD: 'en_proceso',
      DIFOID: 'en_proceso',
      DITEN: 'completado',
    },
    observation: 'Fase 1 OK. Subida a Drive en proceso; cierre oficial RAR en plazo.',
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

export function TerritoryReporterV2Tab({
  projectId: _projectId,
  onOpenTask,
}: {
  projectId: string
  onOpenTask?: (taskId: string) => void
}) {
  const brand = useHubBrand()
  const { workItems } = useProjectsDataset()

  const [ugels, setUgels] = useState<UgelMonitoringV2Row[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_V2)
      if (saved) {
        const parsed = JSON.parse(saved) as UgelMonitoringV2Row[]
        const hasInvalid = parsed.some((u) => u.name === 'CHUPINGO' || u.name === 'VITOC')
        const allPhase1Done = parsed.every((u) => u.phase1Files === 3)
        if (!hasInvalid && parsed.length === 13 && allPhase1Done) {
          return parsed
        }
      }
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
  const [filterDirection, setFilterDirection] = useState<'Todas' | DirectionCode>('Todas')
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Completado' | 'En proceso' | 'Pendiente'>('Todos')

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

      const isP2Done = u.phase2Files >= u.phase2Total
      if (isP2Done) p2Completed++
      else p2InProgress++ // En plazo técnico regular hasta el 26/10 (cero alarma roja)
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

  // Ciclador de archivos en Fase 1 y Fase 2 (0 -> 1 -> 2 -> 3 -> 0)
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

  // Ciclador de estado Drive Regional ('pendiente' -> 'en_proceso' -> 'completado')
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
          driveDate:
            nextStatus === 'completado'
              ? 'Evidencia cargada'
              : nextStatus === 'en_proceso'
                ? 'En proceso'
                : 'Sin evidencia',
        }
      }),
    )
  }

  // Ciclador de Direcciones Pedagógicas (DEI .. DITEN)
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

  return (
    <div className="space-y-6 pb-36 print:space-y-3 print:pb-0 font-['DM_Sans',sans-serif] text-slate-800 antialiased">
      {/* ════════════════════════════════════════════════════════════════════════
          1. CABECERA INSTITUCIONAL + MATRIZ DE AVANCE POR UGEL (3 ETAPAS)
          Diseño limpio, neutro y de alta legibilidad estilo infografía ejecutiva
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        {/* Cabecera oficial: Kicker | Título | Subtítulo | Hito 1.6 */}
        <div className="border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <span className="h-1 w-7 bg-[#dc2626] rounded-full" />
            <span className="text-[12px] font-bold uppercase tracking-wider text-slate-500">
              DISTRIBUCIÓN DE MATERIALES EDUCATIVOS | DOTACIÓN 2027 | SEGUIMIENTO REGIONAL
            </span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
            Estado de avance
          </h2>
          <p className="text-[13.5px] font-semibold text-slate-600 mt-0.5">
            Región Junín · 13 UGEL (Orden Alfabético)
          </p>

          {/* Banner Institucional de Hito 1.6 */}
          <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5">
            <span className="inline-flex items-center gap-1 rounded-md bg-[#1055b8] px-2.5 py-0.5 text-[11.5px] font-black text-white">
              HITO 1.6
            </span>
            <span className="text-[13.5px] font-bold text-slate-900">
              Elaboración del Cuadro de Distribución Local en el MC SIGA
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="text-[12.5px] font-medium text-slate-600">
              Evidencia preliminar Drive: <strong className="text-slate-900 font-bold">Corte 22/10/2026</strong> (Declarativo)
            </span>
            <span className="hidden sm:inline text-slate-300">·</span>
            <span className="text-[12.5px] font-medium text-slate-600">
              Cierre oficial RAR: <strong className="text-slate-900 font-bold">Hasta 26/10/2026</strong> (Formal)
            </span>
          </div>
        </div>

        {/* Matriz Ejecutiva Limpia: Etapa (1, 2, 3) vs 13 UGEL con Ancho Estrictamente Idéntico */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 [scrollbar-width:thin]">
          <table className="w-full min-w-[1340px] border-collapse text-center table-fixed">
            <thead>
              <tr className="border-b border-slate-200 text-xs">
                <th className="bg-[#142d54] text-white font-black text-[13.5px] py-3.5 px-3.5 text-left w-48 min-w-[192px] max-w-[192px]">
                  Etapa
                </th>
                {ugels.map((u) => (
                  <th
                    key={u.id}
                    className="bg-[#f0f4f9] text-slate-800 font-bold text-[12.5px] py-3 px-1 border-l border-white text-center w-[88px] min-w-[88px] max-w-[88px] truncate"
                    title={u.name}
                  >
                    {u.name.charAt(0).toUpperCase() + u.name.slice(1).toLowerCase()}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {/* FILA 1: FASE 1 (REGISTRO MC SIGA - 100% CUMPLIDA EN TODAS LAS UGEL) */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="bg-[#f8fafc] px-3.5 py-3 text-left border-r border-slate-100 w-48 min-w-[192px] max-w-[192px]">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1055b8] text-white text-xs font-black shadow-2xs">
                      1
                    </span>
                    <div>
                      <span className="block text-[14px] font-extrabold text-slate-900 leading-tight">Fase 1</span>
                      <span className="block text-[12px] font-medium text-slate-600 leading-tight mt-0.5">Registro MC SIGA</span>
                    </div>
                  </div>
                </td>
                {ugels.map((u) => {
                  return (
                    <td key={`f1-${u.id}`} className="py-2.5 px-1 text-center border-l border-slate-100 w-[88px] min-w-[88px] max-w-[88px]">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 1)}
                        className="mx-auto flex flex-col items-center justify-center p-1 rounded-lg hover:bg-slate-100/80 transition-all cursor-pointer group"
                        title={`Fase 1: ${u.name} · Carga inicial completada (3/3)`}
                      >
                        <span className="grid h-7 w-7 place-items-center rounded-full text-white shadow-2xs transition-transform group-hover:scale-110 bg-[#16a34a]">
                          <Check size={14} strokeWidth={3} />
                        </span>
                        <span className="mt-1 text-[12px] font-extrabold text-slate-800 tabular-nums">
                          3/3
                        </span>
                      </button>
                    </td>
                  )
                })}
              </tr>

              {/* FILA 2: DRIVE (EVIDENCIA DECLARATIVA - CORTE HOY 22/10) */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="bg-[#f8fafc] px-3.5 py-3 text-left border-r border-slate-100 w-48 min-w-[192px] max-w-[192px]">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1055b8] text-white text-xs font-black shadow-2xs">
                      2
                    </span>
                    <div>
                      <span className="block text-[14px] font-extrabold text-slate-900 leading-tight">Drive</span>
                      <span className="block text-[12px] font-medium text-slate-600 leading-tight mt-0.5">Evidencia declarativa</span>
                    </div>
                  </div>
                </td>
                {ugels.map((u) => {
                  const st = u.driveStatus
                  const ratioText = st === 'completado' ? '1/1' : st === 'en_proceso' ? 'Proceso' : '0/1'
                  return (
                    <td key={`dr-${u.id}`} className="py-2.5 px-1 text-center border-l border-slate-100 w-[88px] min-w-[88px] max-w-[88px]">
                      <button
                        type="button"
                        onClick={() => handleCycleDriveStatus(u.id)}
                        className="mx-auto flex flex-col items-center justify-center p-1 rounded-lg hover:bg-slate-100/80 transition-all cursor-pointer group"
                        title={`Drive: ${u.name} · ${ratioText} (Clic para cambiar)`}
                      >
                        <span className={`grid h-7 w-7 place-items-center rounded-full text-white shadow-2xs transition-transform group-hover:scale-110 ${
                          st === 'completado' ? 'bg-[#16a34a]' : st === 'en_proceso' ? 'bg-[#f59e0b]' : 'bg-[#dc2626]'
                        }`}>
                          {st === 'completado' ? <Check size={14} strokeWidth={3} /> : st === 'en_proceso' ? <Clock size={14} strokeWidth={2.6} /> : <X size={14} strokeWidth={3} />}
                        </span>
                        <span className="mt-1 text-[12px] font-extrabold text-slate-800 tabular-nums">
                          {ratioText}
                        </span>
                      </button>
                    </td>
                  )
                })}
              </tr>

              {/* FILA 3: FASE 2 (RAR OFICIAL - CORTE 26/10 · CERO ROJOS, GRIS NEUTRO EN PLAZO) */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="bg-[#f8fafc] px-3.5 py-3 text-left border-r border-slate-100 w-48 min-w-[192px] max-w-[192px]">
                  <div className="flex items-center gap-2.5">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#1055b8] text-white text-xs font-black shadow-2xs">
                      3
                    </span>
                    <div>
                      <span className="block text-[14px] font-extrabold text-slate-900 leading-tight">Fase 2</span>
                      <span className="block text-[12px] font-medium text-slate-600 leading-tight mt-0.5">RAR oficial (26/10)</span>
                    </div>
                  </div>
                </td>
                {ugels.map((u) => {
                  const isDone = u.phase2Files >= u.phase2Total
                  return (
                    <td key={`f2-${u.id}`} className="py-2.5 px-1 text-center border-l border-slate-100 w-[88px] min-w-[88px] max-w-[88px]">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 2)}
                        className="mx-auto flex flex-col items-center justify-center p-1 rounded-lg hover:bg-slate-100/80 transition-all cursor-pointer group"
                        title={`Fase 2 RAR: ${u.name} · ${isDone ? 'Culminado (3/3)' : 'En plazo técnico hasta el 26/10'} (Clic para cambiar)`}
                      >
                        <span className={`grid h-7 w-7 place-items-center rounded-full shadow-2xs transition-transform group-hover:scale-110 ${
                          isDone ? 'bg-[#16a34a] text-white' : 'bg-slate-200 text-slate-600 border border-slate-300/80'
                        }`}>
                          {isDone ? <Check size={14} strokeWidth={3} /> : <Clock size={13} strokeWidth={2.4} />}
                        </span>
                        <span className={`mt-1 text-[11.5px] font-extrabold tabular-nums ${
                          isDone ? 'text-slate-900' : 'text-slate-600'
                        }`}>
                          {isDone ? '3/3' : 'En plazo'}
                        </span>
                      </button>
                    </td>
                  )
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          2. FILA DE 4 TARJETAS KPI RESUMEN (ESTILO EJECUTIVO DEL FLYER)
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 print:grid-cols-4 print:gap-2">
        {/* TOTAL DE UGEL */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-slate-200/90 bg-white p-4.5 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-50 text-blue-700">
            <Building2 size={22} />
          </div>
          <div>
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400">TOTAL DE UGEL</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tabular-nums">{ugelStats.total}</span>
              <span className="text-[13px] font-semibold text-slate-500">Región Junín</span>
            </div>
          </div>
        </div>

        {/* UGEL QUE COMPLETAN LAS 3 ETAPAS */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200/90 bg-[#f4fbf7] p-4.5 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#16a34a] text-white">
              <Check size={16} strokeWidth={3} />
            </span>
          </div>
          <div>
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-emerald-800">
              UGEL QUE COMPLETAN LAS 3 ETAPAS
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tabular-nums">{ugelStats.completed}</span>
              <span className="text-[13px] font-bold text-slate-500">{ugelStats.completedPct}% del total</span>
            </div>
          </div>
        </div>

        {/* UGEL EN PROCESO */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-amber-200/90 bg-[#fefbf3] p-4.5 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f59e0b] text-white">
              <Clock size={16} strokeWidth={2.6} />
            </span>
          </div>
          <div>
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-amber-800">
              UGEL EN PROCESO
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tabular-nums">{ugelStats.inProgress}</span>
              <span className="text-[13px] font-bold text-slate-500">{ugelStats.inProgressPct}% del total</span>
            </div>
          </div>
        </div>

        {/* UGEL PENDIENTES */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-rose-200/90 bg-[#fef5f5] p-4.5 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-rose-100 text-rose-700">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dc2626] text-white">
              <X size={16} strokeWidth={3} />
            </span>
          </div>
          <div>
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-rose-800">
              UGEL PENDIENTES
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tabular-nums">{ugelStats.pending}</span>
              <span className="text-[13px] font-bold text-slate-500">{ugelStats.pendingPct}% del total</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. FILA DE 3 GRÁFICOS EJECUTIVOS ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 print:grid-cols-3 print:gap-2.5">
        {/* Card 1: Avance por fase (3 FILAS) */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[295px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">Avance de 3 Fases por UGEL</h3>
              <p className="text-[12px] text-slate-500">Distribución de las 13 UGEL en Fase 1, Drive y Fase 2</p>
            </div>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10.5px] font-extrabold text-blue-700">
              3 Fases de Control
            </span>
          </div>

          <div className="my-auto space-y-3.5 py-3">
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
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-18 shrink-0 text-left">
                  <span className="block text-[13px] font-bold text-slate-900 leading-none">
                    {f.label}
                  </span>
                  <span className="block text-[11px] font-medium text-slate-500 leading-tight mt-0.5">
                    {f.sublabel}
                  </span>
                </div>

                <div className="relative flex-1">
                  <div className="flex h-8 overflow-hidden rounded-lg bg-slate-100 shadow-inner">
                    {f.ok > 0 && (
                      <div
                        style={{ width: `${(f.ok / ugelStats.total) * 100}%` }}
                        className="flex h-full items-center justify-center bg-emerald-600 border-r border-white/20"
                      >
                        <span className="text-xs font-black text-white tabular-nums">{f.ok}</span>
                      </div>
                    )}
                    {f.prog > 0 && (
                      <div
                        style={{ width: `${(f.prog / ugelStats.total) * 100}%` }}
                        className="flex h-full items-center justify-center bg-amber-400 border-r border-white/20"
                      >
                        <span className="text-xs font-black text-slate-900 tabular-nums">{f.prog}</span>
                      </div>
                    )}
                    {f.pend > 0 && (
                      <div
                        style={{ width: `${(f.pend / ugelStats.total) * 100}%` }}
                        className="flex h-full items-center justify-center bg-rose-600"
                      >
                        <span className="text-xs font-black text-white tabular-nums">{f.pend}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-10 text-right">
                  <span className="text-xs font-black text-slate-900 tabular-nums">13</span>
                  <span className="block text-[8.5px] font-bold text-slate-400 uppercase leading-none">UGEL</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-[11.5px] font-semibold text-slate-500">
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

        {/* Card 2: Estado global */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[295px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">Consolidado Global de 3 Fases</h3>
              <p className="text-[12px] text-slate-500">Cumplimiento regional integrado de las 13 UGEL</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600">
              Total 3 Fases
            </span>
          </div>

          <div className="my-auto flex items-center justify-center gap-6 py-2">
            <div className="relative flex items-center justify-center">
              <svg width="130" height="130" viewBox="0 0 130 130" className="-rotate-90">
                <circle cx="65" cy="65" r="50" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
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
                <circle
                  cx="65"
                  cy="65"
                  r="50"
                  fill="transparent"
                  stroke="#dc2626"
                  strokeWidth="18"
                  strokeDasharray={`${(ugelStats.pending / ugelStats.total) * 314.16} 314.16`}
                  strokeDashoffset={`-${((ugelStats.completed + ugelStats.inProgress) / ugelStats.total) * 314.16}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 leading-none tabular-nums">
                  {ugelStats.total}
                </span>
                <span className="text-[10.5px] font-bold uppercase text-slate-400 leading-tight">
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

          <div className="text-center border-t border-slate-100 pt-2 text-[11px] text-slate-400">
            Resumen porcentual de cumplimiento
          </div>
        </div>

        {/* Card 3: Avance por dirección pedagógica */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[295px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-[15px] font-bold text-slate-900">Avance por Direcciones en 3 Fases</h3>
              <p className="text-[12px] text-slate-500">Progreso de las 7 líneas pedagógicas en las 3 fases</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10.5px] font-semibold text-slate-600">
              Líneas · 3 Fases
            </span>
          </div>

          <div className="my-auto space-y-2 py-2">
            {ugelStats.directionStats.map((d) => (
              <div key={d.code} className="flex items-center gap-2 text-xs">
                <span className="w-12 font-bold text-slate-700 text-[12px]">{d.code}</span>
                <div className="relative flex-1">
                  <div className="flex h-3.5 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                    <div style={{ width: `${(d.ok / d.total) * 100}%` }} className="bg-emerald-600" />
                    <div style={{ width: `${(d.prog / d.total) * 100}%` }} className="bg-amber-400" />
                    <div style={{ width: `${(d.pend / d.total) * 100}%` }} className="bg-rose-600" />
                  </div>
                </div>
                <span className="w-10 text-right font-black text-slate-900 tabular-nums text-[12px]">
                  {d.pct}%
                </span>
                <span className="text-[10.5px] text-slate-400 tabular-nums">
                  {d.ok}/{d.total}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2 text-[11.5px] text-slate-500 font-semibold">
            <span>7 Direcciones evaluadas</span>
            <span>13 UGEL Junín</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          4. TABLERO INFERIOR (100% INTERACTIVO Y CLIQUEABLE)
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden mb-16">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="text-base font-extrabold text-slate-900">
                Tablero de Control por UGEL – Región Junín (3 Etapas)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic directamente en cualquier celda para actualizar los datos al instante en campo.
            </p>
          </div>

          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar UGEL u observación..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8 w-48 rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
            >
              <option value="Todos">Todos los estados</option>
              <option value="Completado">Solo Completados</option>
              <option value="En proceso">Solo En proceso</option>
              <option value="Pendiente">Solo Pendientes</option>
            </select>

            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value as any)}
              className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none cursor-pointer"
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

        {/* Tabla responsive con todas las celdas cliqueables */}
        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full min-w-[1340px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-100/90 text-[11px] font-bold text-slate-700">
                <th rowSpan={2} className="px-2.5 py-2 text-center w-10">
                  N°
                </th>
                <th rowSpan={2} className="px-3 py-2 w-36">
                  UGEL
                </th>
                {/* BLOQUE FASE 1 */}
                <th colSpan={3} className="border-x border-slate-200 px-3 py-1.5 text-center bg-blue-50/70 text-blue-900">
                  Fase 1 (MC SIGA Carga Inicial)
                </th>
                {/* BLOQUE DRIVE */}
                <th colSpan={3} className="border-r border-slate-200 px-3 py-1.5 text-center bg-amber-50/80 text-amber-950">
                  Drive Regional (Declarativo 22/10)
                </th>
                {/* BLOQUE FASE 2 */}
                <th colSpan={3} className="border-r border-slate-200 px-3 py-1.5 text-center bg-indigo-50/70 text-indigo-950">
                  Fase 2 (Oficial RAR 26/10)
                </th>
                <th rowSpan={2} className="px-3 py-2 text-center w-28">
                  Estado general
                </th>
                <th colSpan={7} className="border-x border-slate-200 px-2 py-1.5 text-center">
                  Direcciones (clic para alternar)
                </th>
                <th rowSpan={2} className="px-3 py-2 w-52">
                  Observaciones
                </th>
                <th rowSpan={2} className="px-3 py-2 text-right w-24">
                  Acción
                </th>
              </tr>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-bold text-slate-500">
                <th className="border-l border-slate-200 px-2 py-1 text-center">Estado</th>
                <th className="px-2 py-1">Fecha</th>
                <th className="border-r border-slate-200 px-1.5 py-1 text-center">Archivos</th>
                <th className="px-2 py-1 text-center">Drive</th>
                <th className="px-2 py-1">Fecha entrega</th>
                <th className="border-r border-slate-200 px-1.5 py-1 text-center">Excel</th>
                <th className="px-2 py-1 text-center">RAR</th>
                <th className="px-2 py-1">Fecha cierre</th>
                <th className="border-r border-slate-200 px-1.5 py-1 text-center">Archivos</th>
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
                        className="hover:underline cursor-pointer text-left font-extrabold text-blue-900"
                      >
                        {u.name}
                      </button>
                    </td>

                    {/* FASE 1 */}
                    <td className="border-l border-slate-100 px-2 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 1)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-blue-100/60 transition-colors cursor-pointer text-left"
                      >
                        <span className={`grid h-4 w-4 place-items-center rounded-full text-white ${
                          p1Status === 'completado' ? 'bg-[#16a34a]' : p1Status === 'en_proceso' ? 'bg-[#f59e0b]' : 'bg-[#dc2626]'
                        }`}>
                          {p1Status === 'completado' ? <Check size={10} strokeWidth={3} /> : p1Status === 'en_proceso' ? <Clock size={10} strokeWidth={2.6} /> : <X size={10} strokeWidth={3} />}
                        </span>
                        <span className="font-bold capitalize">{p1Status.replace('_', ' ')}</span>
                      </button>
                    </td>
                    <td className="px-2 py-2.5 text-[11px] text-slate-500 tabular-nums">
                      {u.phase1Date}
                    </td>
                    <td className="border-r border-slate-100 px-1.5 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 1)}
                        className="rounded-md bg-blue-50 border border-blue-200 px-2 py-1 font-bold text-blue-800 hover:bg-blue-100 tabular-nums cursor-pointer transition-colors"
                      >
                        {u.phase1Files}/{u.phase1Total}
                      </button>
                    </td>

                    {/* DRIVE */}
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleDriveStatus(u.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-amber-100/60 transition-colors cursor-pointer text-left"
                      >
                        <span className={`grid h-4 w-4 place-items-center rounded-full text-white ${
                          u.driveStatus === 'completado' ? 'bg-[#16a34a]' : u.driveStatus === 'en_proceso' ? 'bg-[#f59e0b]' : 'bg-[#dc2626]'
                        }`}>
                          {u.driveStatus === 'completado' ? <Check size={10} strokeWidth={3} /> : u.driveStatus === 'en_proceso' ? <Clock size={10} strokeWidth={2.6} /> : <X size={10} strokeWidth={3} />}
                        </span>
                        <span className="font-bold capitalize">{u.driveStatus.replace('_', ' ')}</span>
                      </button>
                    </td>
                    <td className="px-2 py-2.5 text-[11px] text-slate-500 tabular-nums">
                      {u.driveDate}
                    </td>
                    <td className="border-r border-slate-100 px-1.5 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleDriveStatus(u.id)}
                        className={`rounded-md px-2 py-1 font-bold text-xs tabular-nums cursor-pointer transition-colors ${
                          u.driveStatus === 'completado'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : u.driveStatus === 'en_proceso'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                        }`}
                      >
                        {u.driveStatus === 'completado' ? '1/1' : u.driveStatus === 'en_proceso' ? 'Proceso' : '0/1'}
                      </button>
                    </td>

                    {/* FASE 2 RAR */}
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 2)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-indigo-100/60 transition-colors cursor-pointer text-left"
                      >
                        <span className={`grid h-4 w-4 place-items-center rounded-full text-white ${
                          p2Status === 'completado' ? 'bg-[#16a34a]' : p2Status === 'en_proceso' ? 'bg-[#f59e0b]' : 'bg-[#dc2626]'
                        }`}>
                          {p2Status === 'completado' ? <Check size={10} strokeWidth={3} /> : p2Status === 'en_proceso' ? <Clock size={10} strokeWidth={2.6} /> : <X size={10} strokeWidth={3} />}
                        </span>
                        <span className="font-bold capitalize">{p2Status.replace('_', ' ')}</span>
                      </button>
                    </td>
                    <td className="px-2 py-2.5 text-[11px] text-slate-500 tabular-nums">
                      {u.phase2Date}
                    </td>
                    <td className="border-r border-slate-100 px-1.5 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 2)}
                        className="rounded-md bg-indigo-50 border border-indigo-200 px-2 py-1 font-bold text-indigo-800 hover:bg-indigo-100 tabular-nums cursor-pointer transition-colors"
                      >
                        {u.phase2Files}/{u.phase2Total}
                      </button>
                    </td>

                    {/* ESTADO GENERAL */}
                    <td className="px-3 py-2.5 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                        genStatus === 'completado' ? 'bg-emerald-100 text-emerald-800' : genStatus === 'en_proceso' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {genStatus === 'completado' ? 'Completado' : genStatus === 'en_proceso' ? 'En proceso' : 'Pendiente'}
                      </span>
                    </td>

                    {/* DIRECCIONES */}
                    {DIRECTION_CODES.map((code) => {
                      const st = u.directions[code]
                      const color =
                        st === 'completado'
                          ? 'bg-[#16a34a] ring-2 ring-emerald-300'
                          : st === 'en_proceso'
                            ? 'bg-[#f59e0b] ring-2 ring-amber-200'
                            : 'bg-[#dc2626] ring-2 ring-rose-200'
                      return (
                        <td key={code} className="px-1.5 py-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleCycleDirectionStatus(u.id, code)}
                            title={`${u.name} · ${code}: ${st} (Clic para cambiar estado)`}
                            className="p-1 rounded-full hover:bg-slate-200/60 transition-transform active:scale-90 cursor-pointer"
                          >
                            <span className={`inline-block h-3.5 w-3.5 rounded-full ${color}`} />
                          </button>
                        </td>
                      )
                    })}

                    {/* OBSERVACIONES */}
                    <td className="px-3 py-2.5 text-[11.5px] text-slate-600 leading-snug">
                      {u.observation}
                    </td>

                    {/* ACCIÓN DETALLE */}
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
                  Inspección Territorial 3 Etapas
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
                    {inspectedUgel.driveStatus === 'completado' ? '1/1' : inspectedUgel.driveStatus === 'en_proceso' ? 'Proceso' : '0/1'}
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
