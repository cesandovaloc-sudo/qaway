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
// TerritoryReporterV2Tab.tsx — Reporteador Territorial V2 (3 FILAS SEPARADAS)
// Fila 1: Fase 1 - Carga Inicial MC SIGA MINEDU
// Fila 2: Fase Intermedia - Evidencias Drive Regional (Declarativo — Corte 22/10/2026)
// Fila 3: Fase 2 - Cierre Oficial RAR MC SIGA MINEDU (Formal — Corte 26/10/2026)
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
  // Fila 1: Fase 1 - Carga Inicial MC SIGA
  phase1Files: number // 0..3
  phase1Total: number
  phase1Date: string
  // Fila 2: Fase Intermedia - Drive Regional (Declarativo — Corte 22/10/2026)
  driveStatus: TerritoryStatus
  driveFiles: number // 0..1
  driveTotal: number
  driveDate: string
  // Fila 3: Fase 2 - Cierre Oficial RAR (Corte 26/10/2026)
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
                ? 'En preparación'
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
    <div className="space-y-6 pb-36 print:space-y-3 print:pb-0 font-sans text-slate-800">
      {/* ── BANNER INFORMATIVO MINEDU / DRE: 3 FASES ── */}
      <section className="rounded-2xl border border-blue-200 bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-white p-5 shadow-sm print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-blue-600 text-white shadow-md">
              <FolderArchive size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-blue-600 px-2 py-0.5 text-[10.5px] font-black uppercase tracking-wider text-white">
                  3 FILAS DE SEGUIMIENTO TERRITORIAL
                </span>
                <span className="text-xs font-bold text-slate-500">Hito 1.6: MC SIGA MINEDU</span>
              </div>
              <h2 className="mt-1 text-base font-extrabold text-slate-900">
                Monitoreo Territorial V2: Carga Inicial, Evidencia Drive y Cierre Oficial RAR
              </h2>
              <p className="mt-1 text-xs text-slate-600 leading-relaxed max-w-4xl">
                Haz clic directamente en cualquier celda de la cinta superior o en la tabla inferior para cambiar el estado en tiempo real. 
                El envío de evidencias al <strong>DRIVE</strong> (Corte: <strong>22/10/2026</strong>) es declarativo para facilitar el seguimiento de la DRE. El <strong>cierre oficial</strong> se ejecuta en el MC SIGA con archivo <strong>RAR de la FASE 2</strong> al Residente SIGA (Corte: <strong>26/10/2026</strong>).
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

      {/* ════════════════════════════════════════════════════════════════════════
          1. CINTA SUPERIOR: 3 FILAS SEPARADAS, UNA DEBAJO DE OTRA
          Fila 1: Fase 1 (Carga Inicial MC SIGA)
          Fila 2: Fase Intermedia (Drive Regional - Corte 22/10/2026)
          Fila 3: Fase 2 (Cierre Oficial RAR - Corte 26/10/2026)
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            <h3 className="text-sm font-extrabold uppercase tracking-wide text-slate-800">
              Estado por UGEL — 3 Filas Separadas de Control Territorial
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-slate-500">
            (Haz clic en cualquier pastilla para alternar el estado en campo)
          </span>
        </div>

        {/* FILA 1: FASE 1 (CARGA INICIAL MC SIGA) */}
        <div className="overflow-x-auto rounded-xl border border-blue-200 bg-white p-1.5 shadow-2xs">
          <div className="grid min-w-[1050px] grid-cols-14 overflow-hidden rounded-lg">
            {/* Header Fila 1 */}
            <div className="flex flex-col items-center justify-center bg-blue-900 px-3 py-3 min-h-[92px] text-center text-white shrink-0">
              <span className="rounded bg-blue-700 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-blue-100">
                Fila 1
              </span>
              <span className="mt-1 text-xs font-extrabold leading-tight">Fase 1: MC SIGA</span>
              <span className="mt-0.5 text-[10px] text-blue-200 font-medium">Carga Inicial</span>
            </div>

            {/* 13 UGEL Fila 1 */}
            {ugels.map((u) => {
              const st = computePhaseStatus(u.phase1Files, u.phase1Total)
              const bgClass =
                st === 'completado'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : st === 'en_proceso'
                    ? 'bg-amber-400 text-slate-900 hover:bg-amber-500'
                    : 'bg-rose-600 text-white hover:bg-rose-700'

              return (
                <button
                  key={`f1-${u.id}`}
                  type="button"
                  onClick={() => handleCycleUgelFiles(u.id, 1)}
                  title={`Fase 1: ${u.name} — ${u.phase1Files}/${u.phase1Total} archivos (Clic para ciclar)`}
                  className={`group flex flex-col items-center justify-between border-l border-white/20 px-1.5 py-2.5 min-h-[92px] text-center transition-all duration-150 hover:brightness-105 cursor-pointer ${bgClass}`}
                >
                  <span className="w-full truncate text-[10px] font-black uppercase tracking-tight">
                    {u.name}
                  </span>
                  <span className="my-1 grid h-5 w-5 place-items-center rounded-full bg-white/95 shadow-2xs transition-transform group-hover:scale-110">
                    {st === 'completado' ? (
                      <Check size={12} strokeWidth={3} className="text-emerald-600" />
                    ) : st === 'en_proceso' ? (
                      <Clock size={12} strokeWidth={2.6} className="text-amber-600" />
                    ) : (
                      <X size={12} strokeWidth={3} className="text-rose-600" />
                    )}
                  </span>
                  <span className="tabular-nums text-xs font-black leading-none">
                    {u.phase1Files}/{u.phase1Total}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* FILA 2: FASE INTERMEDIA (DRIVE REGIONAL - CORTE 22/10/2026) */}
        <div className="overflow-x-auto rounded-xl border border-amber-300 bg-white p-1.5 shadow-2xs">
          <div className="grid min-w-[1050px] grid-cols-14 overflow-hidden rounded-lg">
            {/* Header Fila 2 */}
            <div className="flex flex-col items-center justify-center bg-amber-900 px-3 py-3 min-h-[92px] text-center text-white shrink-0">
              <span className="rounded bg-amber-700 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-100">
                Fila 2
              </span>
              <span className="mt-1 text-xs font-extrabold leading-tight">Drive Regional</span>
              <span className="mt-0.5 text-[10px] text-amber-200 font-medium">Excel · Corte 22/10</span>
            </div>

            {/* 13 UGEL Fila 2 */}
            {ugels.map((u) => {
              const st = u.driveStatus
              const bgClass =
                st === 'completado'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : st === 'en_proceso'
                    ? 'bg-amber-400 text-slate-900 hover:bg-amber-500'
                    : 'bg-rose-600 text-white hover:bg-rose-700'

              return (
                <button
                  key={`dr-${u.id}`}
                  type="button"
                  onClick={() => handleCycleDriveStatus(u.id)}
                  title={`Drive Regional: ${u.name} — ${u.driveStatus} (Clic para cambiar)`}
                  className={`group flex flex-col items-center justify-between border-l border-white/20 px-1.5 py-2.5 min-h-[92px] text-center transition-all duration-150 hover:brightness-105 cursor-pointer ${bgClass}`}
                >
                  <span className="w-full truncate text-[10px] font-black uppercase tracking-tight">
                    {u.name}
                  </span>
                  <span className="my-1 grid h-5 w-5 place-items-center rounded-full bg-white/95 shadow-2xs transition-transform group-hover:scale-110">
                    {st === 'completado' ? (
                      <Check size={12} strokeWidth={3} className="text-emerald-600" />
                    ) : st === 'en_proceso' ? (
                      <Clock size={12} strokeWidth={2.6} className="text-amber-600" />
                    ) : (
                      <X size={12} strokeWidth={3} className="text-rose-600" />
                    )}
                  </span>
                  <span className="text-[10.5px] font-black leading-none">
                    {st === 'completado' ? '1/1 Excel' : st === 'en_proceso' ? 'Proceso' : '0/1'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* FILA 3: FASE 2 (CIERRE OFICIAL RAR MC SIGA - CORTE 26/10/2026) */}
        <div className="overflow-x-auto rounded-xl border border-indigo-200 bg-white p-1.5 shadow-2xs">
          <div className="grid min-w-[1050px] grid-cols-14 overflow-hidden rounded-lg">
            {/* Header Fila 3 */}
            <div className="flex flex-col items-center justify-center bg-indigo-950 px-3 py-3 min-h-[92px] text-center text-white shrink-0">
              <span className="rounded bg-indigo-800 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-indigo-100">
                Fila 3
              </span>
              <span className="mt-1 text-xs font-extrabold leading-tight">Fase 2: Oficial RAR</span>
              <span className="mt-0.5 text-[10px] text-indigo-200 font-medium">MC SIGA · Corte 26/10</span>
            </div>

            {/* 13 UGEL Fila 3 */}
            {ugels.map((u) => {
              const st = computePhaseStatus(u.phase2Files, u.phase2Total)
              const bgClass =
                st === 'completado'
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                  : st === 'en_proceso'
                    ? 'bg-amber-400 text-slate-900 hover:bg-amber-500'
                    : 'bg-rose-600 text-white hover:bg-rose-700'

              return (
                <button
                  key={`f2-${u.id}`}
                  type="button"
                  onClick={() => handleCycleUgelFiles(u.id, 2)}
                  title={`Fase 2 RAR: ${u.name} — ${u.phase2Files}/${u.phase2Total} archivos (Clic para ciclar)`}
                  className={`group flex flex-col items-center justify-between border-l border-white/20 px-1.5 py-2.5 min-h-[92px] text-center transition-all duration-150 hover:brightness-105 cursor-pointer ${bgClass}`}
                >
                  <span className="w-full truncate text-[10px] font-black uppercase tracking-tight">
                    {u.name}
                  </span>
                  <span className="my-1 grid h-5 w-5 place-items-center rounded-full bg-white/95 shadow-2xs transition-transform group-hover:scale-110">
                    {st === 'completado' ? (
                      <Check size={12} strokeWidth={3} className="text-emerald-600" />
                    ) : st === 'en_proceso' ? (
                      <Clock size={12} strokeWidth={2.6} className="text-amber-600" />
                    ) : (
                      <X size={12} strokeWidth={3} className="text-rose-600" />
                    )}
                  </span>
                  <span className="tabular-nums text-xs font-black leading-none">
                    {u.phase2Files}/{u.phase2Total}
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

      {/* ── 3. FILA DE 3 GRÁFICOS EJECUTIVOS ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3 print:grid-cols-3 print:gap-2.5">
        {/* Card 1: Avance por fase (3 FILAS) */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[295px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Avance por fase (todas las UGEL)</h3>
              <p className="text-[11px] text-slate-400">Distribución de cumplimiento en territorio</p>
            </div>
            <span className="rounded-md bg-blue-100 px-2 py-0.5 text-[10px] font-extrabold text-blue-700">
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
                <div className="w-16 shrink-0 text-left">
                  <span className="block text-xs font-extrabold text-slate-800 leading-none">
                    {f.label}
                  </span>
                  <span className="block text-[9.5px] font-semibold text-slate-400 leading-tight">
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
                  <span className="block text-[8px] font-bold text-slate-400 uppercase leading-none">UGEL</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-500">
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
              <h3 className="text-sm font-bold text-slate-900">Estado global (3 fases)</h3>
              <p className="text-[11px] text-slate-400">Consolidado regional en territorio</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              Total
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
            Resumen porcentual de cumplimiento
          </div>
        </div>

        {/* Card 3: Avance por dirección pedagógica */}
        <div className="flex flex-col justify-between rounded-xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[295px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Avance por dirección (todas las UGEL)</h3>
              <p className="text-[11px] text-slate-400">7 Direcciones de línea pedagógicas</p>
            </div>
            <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
              DEI - DITEN
            </span>
          </div>

          <div className="my-auto space-y-2 py-2">
            {ugelStats.directionStats.map((d) => (
              <div key={d.code} className="flex items-center gap-2 text-xs">
                <span className="w-12 font-bold text-slate-700 text-[11px]">{d.code}</span>
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

      {/* ════════════════════════════════════════════════════════════════════════
          4. TABLERO INFERIOR (100% INTERACTIVO Y CLIQUEABLE)
          Cada estado, botón y círculo de dirección responde a clics directos
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden mb-16">
        {/* Cabecera del Tablero Inferior */}
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-600 animate-pulse" />
              <h3 className="text-base font-extrabold text-slate-900">
                Tablero de Control por UGEL – Región Junín (3 Fases)
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic directamente en cualquier celda de <strong>Fase 1</strong>, <strong>Drive</strong>, <strong>Fase 2</strong> o en los <strong>puntos de direcciones</strong> para actualizar los datos al instante.
            </p>
          </div>

          {/* Filtros superiores */}
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
                {/* BLOQUE FASE INTERMEDIA DRIVE */}
                <th colSpan={3} className="border-r border-slate-200 px-3 py-1.5 text-center bg-amber-50/80 text-amber-950">
                  Drive Regional (Declarativo 22/10)
                </th>
                {/* BLOQUE FASE 2 CIERRE RAR */}
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
                {/* Subcolumnas Fase 1 */}
                <th className="border-l border-slate-200 px-2 py-1 text-center">Estado (clic)</th>
                <th className="px-2 py-1">Fecha</th>
                <th className="border-r border-slate-200 px-1.5 py-1 text-center">Archivos</th>
                {/* Subcolumnas Drive */}
                <th className="px-2 py-1 text-center">Drive (clic)</th>
                <th className="px-2 py-1">Fecha entrega</th>
                <th className="border-r border-slate-200 px-1.5 py-1 text-center">Excel</th>
                {/* Subcolumnas Fase 2 */}
                <th className="px-2 py-1 text-center">RAR (clic)</th>
                <th className="px-2 py-1">Fecha cierre</th>
                <th className="border-r border-slate-200 px-1.5 py-1 text-center">Archivos</th>
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
                        className="hover:underline cursor-pointer text-left font-extrabold text-blue-900"
                      >
                        {u.name}
                      </button>
                    </td>

                    {/* BLOQUE FASE 1 (CLIQUEABLE) */}
                    <td className="border-l border-slate-100 px-2 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 1)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-blue-100/60 transition-colors cursor-pointer text-left"
                        title="Clic para cambiar estado de Fase 1"
                      >
                        <span className={`grid h-4 w-4 place-items-center rounded-full text-white ${
                          p1Status === 'completado' ? 'bg-emerald-600' : p1Status === 'en_proceso' ? 'bg-amber-500' : 'bg-rose-600'
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
                        title="Clic para ciclar archivos Fase 1 (0 -> 1 -> 2 -> 3)"
                        className="rounded-md bg-blue-50 border border-blue-200 px-2 py-1 font-bold text-blue-800 hover:bg-blue-100 tabular-nums cursor-pointer transition-colors"
                      >
                        {u.phase1Files}/{u.phase1Total}
                      </button>
                    </td>

                    {/* BLOQUE DRIVE REGIONAL (CLIQUEABLE) */}
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleDriveStatus(u.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-amber-100/60 transition-colors cursor-pointer text-left"
                        title="Clic para cambiar estado de entrega en Drive"
                      >
                        <span className={`grid h-4 w-4 place-items-center rounded-full text-white ${
                          u.driveStatus === 'completado' ? 'bg-emerald-600' : u.driveStatus === 'en_proceso' ? 'bg-amber-500' : 'bg-rose-600'
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
                        title="Clic para alternar evidencia en Drive"
                        className={`rounded-md px-2 py-1 font-bold text-xs tabular-nums cursor-pointer transition-colors ${
                          u.driveStatus === 'completado'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                            : u.driveStatus === 'en_proceso'
                              ? 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                        }`}
                      >
                        {u.driveStatus === 'completado' ? '1/1 Excel' : '0/1'}
                      </button>
                    </td>

                    {/* BLOQUE FASE 2 (CLIQUEABLE) */}
                    <td className="px-2 py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 2)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 hover:bg-indigo-100/60 transition-colors cursor-pointer text-left"
                        title="Clic para cambiar estado de Fase 2 RAR"
                      >
                        <span className={`grid h-4 w-4 place-items-center rounded-full text-white ${
                          p2Status === 'completado' ? 'bg-emerald-600' : p2Status === 'en_proceso' ? 'bg-amber-500' : 'bg-rose-600'
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
                        title="Clic para ciclar archivos RAR Fase 2 (0 -> 1 -> 2 -> 3)"
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

                    {/* 7 DIRECCIONES (CLIQUEABLES PARA CAMBIAR CADA PUNTO) */}
                    {DIRECTION_CODES.map((code) => {
                      const st = u.directions[code]
                      const color =
                        st === 'completado'
                          ? 'bg-emerald-600 ring-2 ring-emerald-300'
                          : st === 'en_proceso'
                            ? 'bg-amber-400 ring-2 ring-amber-200'
                            : 'bg-rose-600 ring-2 ring-rose-200'
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
