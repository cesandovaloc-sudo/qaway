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
import { useProjectPerspective } from '../../context/ProjectPerspectiveContext'

// ─────────────────────────────────────────────────────────────────────────────
// TerritoryReporterPhase2Tab.tsx — Monitoreo Territorial EXCLUSIVO FASE 2
// Cierre Oficial RAR (Corte 26/10/2026) y Direcciones Pedagógicas
// Soporte Multi-Región: Región Junín (13 UGEL) y Región Pasco (2 UGEL)
// ─────────────────────────────────────────────────────────────────────────────

export type TerritoryStatus = 'completado' | 'en_proceso' | 'pendiente'

export type DirectionCode =
  | 'DEI'
  | 'DEP'
  | 'DES'
  | 'DEBA'
  | 'DEBE'
  | 'DEIB'
  | 'DISER'

export const DIRECTION_CODES: DirectionCode[] = [
  'DEI',
  'DEP',
  'DES',
  'DEBA',
  'DEBE',
  'DEIB',
  'DISER',
]

// Mapeo oficial de Direcciones aplicables por UGEL (MINEDU - Dotación 2027)
export const UGEL_APPLICABLE_DIRECTIONS_P2: Record<string, DirectionCode[]> = {
  // Junín (13 UGEL)
  'ugel-chanchamayo': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-chupaca': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-concepcion': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-huancayo': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-jauja': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-junin': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-pangoa': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-pichanaqui': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-rio-ene-mantaro': ['DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-rio-tambo': ['DEBA', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-satipo': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-tarma': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-yauli': ['DEBA', 'DEBE', 'DEI', 'DEP', 'DES', 'DISER'],
  // Pasco (2 UGEL: Oxapampa y Daniel Alcides Carrión)
  'ugel-oxapampa': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'ugel-daniel-alcides-carrion': ['DEBA', 'DEBE', 'DEI', 'DEP', 'DES', 'DISER'],
}

export interface UgelMonitoringPhase2Row {
  id: string
  region: 'Junín' | 'Pasco'
  number: number
  name: string
  // Fase 2 - RAR oficial
  phase2Files: number // 0..3
  phase2Total: number
  phase2Date: string
  // Direcciones pedagógicas (Solo aplican las asignadas oficialmente)
  directions: Partial<Record<DirectionCode, TerritoryStatus>>
  observation: string
  gestorName: string
  gestorPhone: string
}

const STORAGE_KEY_PHASE2 = 'qaway_territory_reporter_phase2_v1'

const INITIAL_DATASET_PHASE2: UgelMonitoringPhase2Row[] = [
  // ─── REGIÓN JUNÍN (13 UGEL) ───
  {
    id: 'ugel-chanchamayo',
    region: 'Junín',
    number: 1,
    name: 'CHANCHAMAYO',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '15/10/2026 10:15',
    directions: {
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Cierre oficial Fase 2 RAR certificado.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-chupaca',
    region: 'Junín',
    number: 2,
    name: 'CHUPACA',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Cierre oficial en plazo hasta 26/10.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-concepcion',
    region: 'Junín',
    number: 3,
    name: 'CONCEPCIÓN',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '13/10/2026 15:10',
    directions: {
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Validado con acta de AGP y archivo RAR enviado.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-huancayo',
    region: 'Junín',
    number: 4,
    name: 'HUANCAYO',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Cierre oficial Fase 2 en plazo regular.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-jauja',
    region: 'Junín',
    number: 5,
    name: 'JAUJA',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '14/10/2026 17:20',
    directions: {
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Culminación completa RAR oficial Fase 2.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-junin',
    region: 'Junín',
    number: 6,
    name: 'JUNÍN',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Fase 2 en plazo regular técnico.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-pangoa',
    region: 'Junín',
    number: 7,
    name: 'PANGOA',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Cierre oficial RAR en coordinación con especialista.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-pichanaqui',
    region: 'Junín',
    number: 8,
    name: 'PICHANAQUI',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Cierre oficial Fase 2 programado en plazo.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-rio-ene-mantaro',
    region: 'Junín',
    number: 9,
    name: 'RÍO ENE MANTARO',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Seguimiento por conectividad en zona VRAEM.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-rio-tambo',
    region: 'Junín',
    number: 10,
    name: 'RÍO TAMBO',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Coordinación con DRE Junín para cierre RAR.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-satipo',
    region: 'Junín',
    number: 11,
    name: 'SATIPO',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Asistencia técnica presencial coordinada para Fase 2.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-tarma',
    region: 'Junín',
    number: 12,
    name: 'TARMA',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '15/10/2026 16:45',
    directions: {
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Cierre oficial Fase 2 culminado exitosamente.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-yauli',
    region: 'Junín',
    number: 13,
    name: 'YAULI',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Fase 2 RAR en proceso de revisión de actas.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  // ─── REGIÓN PASCO (2 UGEL: Oxapampa y Daniel Alcides Carrión) ───
  {
    id: 'ugel-oxapampa',
    region: 'Pasco',
    number: 1,
    name: 'OXAPAMPA',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '18/10/2026 14:20',
    directions: {
      DEBA: 'completado',
      DEBE: 'completado',
      DEI: 'completado',
      DEIB: 'completado',
      DEP: 'completado',
      DES: 'completado',
      DISER: 'completado',
    },
    observation: 'Fase 2 completada. Archivo RAR oficial y 7 direcciones pedagógicas conformes.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'ugel-daniel-alcides-carrion',
    region: 'Pasco',
    number: 2,
    name: 'DANIEL ALCIDES CARRIÓN',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'en_proceso',
      DEBE: 'pendiente',
      DEI: 'en_proceso',
      DEP: 'completado',
      DES: 'en_proceso',
      DISER: 'pendiente',
    },
    observation: 'Fase 2 en plazo. 4 direcciones avanzadas y archivo RAR pendiente de visado.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
]

export function computeUgelDirectionStatusP2(row: UgelMonitoringPhase2Row): {
  pct: number
  status: TerritoryStatus
  okCount: number
  totalDirs: number
} {
  const applicableDirs = UGEL_APPLICABLE_DIRECTIONS_P2[row.id] || DIRECTION_CODES
  const totalDirs = applicableDirs.length || 7
  let okCount = 0
  let progCount = 0

  for (const code of applicableDirs) {
    const st = row.directions[code] || 'pendiente'
    if (st === 'completado') okCount++
    else if (st === 'en_proceso') progCount++
  }

  const effectiveScore = okCount + progCount * 0.5
  const pct = totalDirs > 0 ? Math.round((effectiveScore / totalDirs) * 100) : 0

  let status: TerritoryStatus = 'pendiente'
  if (okCount === totalDirs && totalDirs > 0) {
    status = 'completado'
  } else if (okCount > 0 || progCount > 0) {
    status = 'en_proceso'
  } else {
    status = 'pendiente'
  }

  return { pct, status, okCount, totalDirs }
}

function computeUgelGeneralStatusPhase2(row: UgelMonitoringPhase2Row): TerritoryStatus {
  const isP2Done = row.phase2Files >= row.phase2Total
  const dirStatus = computeUgelDirectionStatusP2(row).status

  // Completado: Fase 2 RAR culminada Y direcciones 100% completadas
  if (isP2Done && dirStatus === 'completado') {
    return 'completado'
  }

  // En proceso: Tiene avance en Fase 2 o direcciones con avance parcial
  if (isP2Done || dirStatus === 'en_proceso' || dirStatus === 'completado') {
    return 'en_proceso'
  }

  return 'pendiente'
}

export function TerritoryReporterPhase2Tab({
  projectId: _projectId,
  onOpenTask,
}: {
  projectId: string
  onOpenTask?: (taskId: string) => void
}) {
  const brand = useHubBrand()
  const { workItems } = useProjectsDataset()
  const { perspective, currentPersona, setPerspective, isCoordinador, isGestor, isSuperAdmin } = useProjectPerspective()

  const [selectedMacrorregion, setSelectedMacrorregion] = useState('Centro')
  const [selectedRegion, setSelectedRegion] = useState<'Junín' | 'Pasco'>('Junín')
  const [selectedGestorFilter, setSelectedGestorFilter] = useState('todos')
  const [selectedUgelFilter, setSelectedUgelFilter] = useState('todas')

  const [allUgels, setAllUgels] = useState<UgelMonitoringPhase2Row[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PHASE2)
      if (saved) {
        const parsed = JSON.parse(saved) as UgelMonitoringPhase2Row[]
        if (parsed.length >= 15) {
          return parsed
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_DATASET_PHASE2
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PHASE2, JSON.stringify(allUgels))
    } catch {
      // ignore
    }
  }, [allUgels])

  // Reset ugel filter when region changes
  const handleRegionChange = (newRegion: 'Junín' | 'Pasco') => {
    setSelectedRegion(newRegion)
    setSelectedUgelFilter('todas')
  }

  // Ugels pertenecientes a la región seleccionada
  const regionUgels = useMemo(() => {
    return allUgels.filter((u) => u.region === selectedRegion)
  }, [allUgels, selectedRegion])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterDirection, setFilterDirection] = useState<'Todas' | DirectionCode>('Todas')
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Completado' | 'En proceso' | 'Pendiente'>('Todos')

  const [inspectedUgel, setInspectedUgel] = useState<UgelMonitoringPhase2Row | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  useEffect(() => {
    if (inspectedUgel) {
      setNewTaskTitle(`Cierre Fase 2 RAR - MC SIGA en UGEL ${inspectedUgel.name} (${inspectedUgel.region})`)
    }
  }, [inspectedUgel])

  const getTasksForUgel = (ugelName: string) => {
    return workItems.filter((t) => {
      const inTitle = t.title.toLowerCase().includes(ugelName.toLowerCase())
      const inScope = t.scopeTag?.toLowerCase().includes(ugelName.toLowerCase())
      const inDesc = t.description?.toLowerCase().includes(ugelName.toLowerCase())
      return inTitle || inScope || inDesc
    })
  }

  const handleCreateTaskForUgel = (ugel: UgelMonitoringPhase2Row, customTitle?: string) => {
    const titleToUse =
      (customTitle ?? newTaskTitle).trim() ||
      `Asistencia técnica Fase 2 RAR en UGEL ${ugel.name} (Hito 1.6)`

    const genStatus = computeUgelGeneralStatusPhase2(ugel)
    const created = projectsService.createWorkItem({
      projectId: _projectId,
      milestoneRef: 'Hito 1.6 · Elaboración del Cuadro de Distribución Local en el MC SIGA (Fase 2)',
      originType: 'accion_emergente',
      taskNature: 'contingencia_operativa',
      threatensMilestone: genStatus === 'pendiente',
      threatNote:
        genStatus === 'pendiente'
          ? `UGEL ${ugel.name} (${ugel.region}) en estado Pendiente Fase 2 (${ugel.observation})`
          : undefined,
      title: titleToUse,
      description: `Tarea generada desde el Reporteador Territorial Fase 2 para UGEL ${ugel.name} (Región ${ugel.region}). Fase 2 RAR: ${ugel.phase2Files}/${ugel.phase2Total}. Observación: ${ugel.observation}.`,
      state: 'todo',
      priority: genStatus === 'pendiente' ? 'URGENTE' : 'MEDIA',
      assignee: {
        name: ugel.gestorName,
        role: `Gestor Territorial Región ${ugel.region}`,
        phone: ugel.gestorPhone,
      },
      storyPoints: 3,
      followUpDate: '2026-10-26',
      scopeTag: `UGEL ${ugel.name}`,
    })
    setInspectedUgel(null)
    if (onOpenTask) {
      onOpenTask(created.id)
    }
  }

  // Estadísticas globales de las UGEL de la región seleccionada en Fase 2
  const ugelStats = useMemo(() => {
    let completed = 0
    let inProgress = 0
    let pending = 0

    let p2Completed = 0
    let p2InProgress = 0
    let p2Pending = 0

    for (const u of regionUgels) {
      const gen = computeUgelGeneralStatusPhase2(u)
      if (gen === 'completado') completed++
      else if (gen === 'en_proceso') inProgress++
      else pending++

      const isP2Done = u.phase2Files >= u.phase2Total
      if (isP2Done) p2Completed++
      else p2InProgress++
    }

    const total = regionUgels.length
    const completedPct = total > 0 ? Math.round((completed / total) * 100) : 0
    const inProgressPct = total > 0 ? Math.round((inProgress / total) * 100) : 0
    const pendingPct = Math.max(0, 100 - completedPct - inProgressPct)

    const directionStats = DIRECTION_CODES.map((code) => {
      let ok = 0
      let prog = 0
      let pend = 0
      let applicableCount = 0
      for (const u of regionUgels) {
        const applicableDirs = UGEL_APPLICABLE_DIRECTIONS_P2[u.id] || []
        if (!applicableDirs.includes(code)) continue
        applicableCount++
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
        total: applicableCount,
        pct: applicableCount > 0 ? Math.round((ok / applicableCount) * 100) : 100,
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
      p2Completed,
      p2InProgress,
      p2Pending,
      directionStats,
    }
  }, [regionUgels])

  const filteredUgels = useMemo(() => {
    return regionUgels.filter((u) => {
      if (selectedUgelFilter !== 'todas' && u.id !== selectedUgelFilter) {
        return false
      }
      if (selectedGestorFilter !== 'todos' && u.gestorName !== selectedGestorFilter) {
        return false
      }
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase()
        const matchName = u.name.toLowerCase().includes(q)
        const matchObs = u.observation.toLowerCase().includes(q)
        if (!matchName && !matchObs) return false
      }

      if (filterStatus !== 'Todos') {
        const gen = computeUgelGeneralStatusPhase2(u)
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
  }, [regionUgels, searchQuery, filterStatus, filterDirection, selectedUgelFilter, selectedGestorFilter])

  // Alternador de Fase 2
  const handleTogglePhase2 = (ugelId: string) => {
    setAllUgels((prev) =>
      prev.map((u) => {
        if (u.id !== ugelId) return u
        const isDone = u.phase2Files >= u.phase2Total
        const newFiles = isDone ? 0 : u.phase2Total
        const newDate = isDone ? 'En plazo hasta 26/10' : '22/10/2026 18:00'
        return {
          ...u,
          phase2Files: newFiles,
          phase2Date: newDate,
        }
      }),
    )
  }

  // Alternador de Dirección Pedagógica
  const handleCycleDirectionStatus = (ugelId: string, code: DirectionCode) => {
    setAllUgels((prev) =>
      prev.map((u) => {
        if (u.id !== ugelId) return u
        const current = u.directions[code] || 'pendiente'
        const next: TerritoryStatus =
          current === 'pendiente'
            ? 'en_proceso'
            : current === 'en_proceso'
              ? 'completado'
              : 'pendiente'
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
    <div className="space-y-6 pb-20 font-['DM_Sans',sans-serif]">
      {/* ════════════════════════════════════════════════════════════════════════
          1. HEADER INSTITUCIONAL + FILTROS DE AUDITORÍA FASE 2
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-xs">
                <BarChart3 size={20} strokeWidth={2.4} />
              </span>
              <div>
                <h1 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl flex items-center gap-2">
                  <span>Reporteador Territorial</span>
                  <span className="text-slate-300">·</span>
                  <span className="rounded-md bg-indigo-100 text-indigo-800 text-xs font-black px-2 py-0.5">
                    FASE 2 (RAR OFICIAL)
                  </span>
                </h1>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  Supervisión de Cierre RAR y Direcciones Pedagógicas · Región {selectedRegion} ({regionUgels.length} UGEL)
                </p>
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-slate-400 font-medium">
            <span>Cierre oficial RAR: </span>
            <strong className="text-slate-900 font-bold">26 oct. 2026</strong>
          </div>
        </div>

        {/* BARRA DE FILTROS SOBRIA */}
        <div className="flex flex-wrap items-center gap-2.5 rounded-xl border border-slate-200/90 bg-slate-50/70 p-2.5 text-xs">
          {/* N1: Macrorregión */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-slate-500">Macrorregión:</span>
            <select
              value={selectedMacrorregion}
              onChange={(e) => setSelectedMacrorregion(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs outline-none cursor-pointer focus:border-slate-400"
            >
              <option value="Centro">Centro (Junín, Pasco, Huánuco)</option>
              <option value="Norte">Norte</option>
              <option value="Sur">Sur</option>
              <option value="Oriente">Oriente</option>
            </select>
          </div>

          <span className="text-slate-300">/</span>

          {/* N2: Región (Junín vs Pasco) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-slate-700">Región:</span>
            <select
              value={selectedRegion}
              onChange={(e) => handleRegionChange(e.target.value as 'Junín' | 'Pasco')}
              className="rounded-lg border-2 border-indigo-600 bg-white px-2.5 py-1 text-xs font-black text-indigo-950 shadow-2xs outline-none cursor-pointer"
            >
              <option value="Junín">Región Junín (13 UGEL)</option>
              <option value="Pasco">Región Pasco (2 UGEL)</option>
            </select>
          </div>

          <span className="text-slate-300">/</span>

          {/* N3: UGEL */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-slate-500">UGEL:</span>
            <select
              value={selectedUgelFilter}
              onChange={(e) => setSelectedUgelFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs outline-none cursor-pointer focus:border-slate-400"
            >
              <option value="todas">Todas las {regionUgels.length} UGEL ({selectedRegion})</option>
              {regionUgels.map((u) => (
                <option key={u.id} value={u.id}>
                  UGEL {u.name}
                </option>
              ))}
            </select>
          </div>

          <span className="text-slate-300">/</span>

          {/* N4: Gestor */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-slate-500">Gestor:</span>
            <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs">
              Carlos Sandoval (Gestor de Materiales)
            </span>
          </div>
        </div>

        {/* Banner Hito 1.6 Fase 2 */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100/70 border border-slate-200/80 px-3 py-2 text-[12px]">
          <span className="inline-flex items-center rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-black text-white">
            HITO 1.6 · FASE 2
          </span>
          <span className="font-bold text-slate-800">
            Elaboración del Cuadro de Distribución Local en el MC SIGA (Fase 2)
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="text-slate-600 font-medium text-[11.5px]">
            Cierre Oficial RAR: <strong className="text-slate-900">Hasta 26/10/2026</strong>
          </span>
          <span className="hidden sm:inline text-slate-300">·</span>
          <span className="text-slate-600 font-medium text-[11.5px]">
            Alcance actual: <strong className="text-indigo-900 font-bold">Región {selectedRegion}</strong>
          </span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          1.1. MATRIZ RÁPIDA: FASE 2 RAR POR UGEL
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div className="overflow-x-auto rounded-xl border border-slate-200 [scrollbar-width:thin]">
          <table className="w-full border-collapse text-center table-fixed">
            <thead>
              <tr className="border-b border-slate-200 text-xs">
                <th className="bg-[#142d54] text-white font-black text-[15px] py-4 px-3.5 text-left w-48 min-w-[190px] max-w-[190px]">
                  Etapa de Control
                </th>
                {regionUgels.map((u) => {
                  const rawName = u.name.charAt(0).toUpperCase() + u.name.slice(1).toLowerCase()
                  const shortName = rawName.length > 10 ? rawName.slice(0, 9) + '.' : rawName
                  return (
                    <th
                      key={u.id}
                      className="bg-[#f0f4f9] text-slate-900 font-black text-[15px] py-3.5 px-0.5 border-l border-white text-center truncate tracking-tight"
                      title={u.name}
                    >
                      {shortName}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {/* FILA ÚNICA: FASE 2 (RAR OFICIAL) */}
              <tr className="hover:bg-slate-50/70 transition-colors">
                <td className="bg-[#f8fafc] px-3.5 py-4 text-left border-r border-slate-100 w-48 min-w-[190px] max-w-[190px]">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-indigo-700 text-white text-[15px] font-black shadow-xs">
                      2
                    </span>
                    <div className="min-w-0">
                      <span className="block text-[17px] font-black text-slate-900 leading-tight">Fase 2</span>
                      <span className="block text-[13px] font-bold text-slate-600 leading-tight mt-0.5 truncate">RAR oficial</span>
                    </div>
                  </div>
                </td>
                {regionUgels.map((u) => {
                  const isDone = u.phase2Files >= u.phase2Total
                  return (
                    <td key={`f2-${u.id}`} className="py-3.5 px-1 text-center border-l border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleTogglePhase2(u.id)}
                        className="mx-auto flex items-center justify-center p-1 rounded-2xl hover:bg-slate-100/90 transition-all cursor-pointer group"
                        title={`Fase 2 RAR: ${u.name} · ${isDone ? 'Culminado' : 'En plazo técnico'} (Clic para cambiar)`}
                      >
                        <span className={`grid h-11 w-11 place-items-center rounded-full shadow-xs transition-transform group-hover:scale-110 ${
                          isDone ? 'bg-[#16a34a] text-white' : 'bg-slate-200 text-slate-600 border border-slate-300/80'
                        }`}>
                          {isDone ? <Check size={24} strokeWidth={3.2} /> : <Clock size={23} strokeWidth={2.8} />}
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
          2. FILA DE 4 TARJETAS KPI RESUMEN FASE 2
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
              <span className="text-[13px] font-semibold text-slate-500">Región {selectedRegion}</span>
            </div>
          </div>
        </div>

        {/* FASE 2 CULMINADA */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200/90 bg-[#f4fbf7] p-4.5 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#16a34a] text-white">
              <Check size={16} strokeWidth={3} />
            </span>
          </div>
          <div>
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-emerald-800">
              FASE 2 CULMINADA (RAR)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tabular-nums">{ugelStats.p2Completed}</span>
              <span className="text-[13px] font-bold text-slate-500">
                {ugelStats.total > 0 ? Math.round((ugelStats.p2Completed / ugelStats.total) * 100) : 0}% del total
              </span>
            </div>
          </div>
        </div>

        {/* EN PLAZO TÉCNICO */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-amber-200/90 bg-[#fefbf3] p-4.5 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-amber-100 text-amber-700">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f59e0b] text-white">
              <Clock size={16} strokeWidth={2.6} />
            </span>
          </div>
          <div>
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-amber-800">
              EN PLAZO REGULAR (HASTA 26/10)
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tabular-nums">{ugelStats.p2InProgress}</span>
              <span className="text-[13px] font-bold text-slate-500">
                {ugelStats.total > 0 ? Math.round((ugelStats.p2InProgress / ugelStats.total) * 100) : 0}% del total
              </span>
            </div>
          </div>
        </div>

        {/* ESTADO GLOBAL FASE 2 */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-indigo-200/90 bg-indigo-50/40 p-4.5 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-indigo-100 text-indigo-700">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-indigo-600 text-white font-black text-xs">
              P2
            </span>
          </div>
          <div>
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-indigo-900">
              CONSOLIDADO 100% OK
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tabular-nums">{ugelStats.completed}</span>
              <span className="text-[13px] font-bold text-slate-500">{ugelStats.completedPct}% completo</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. GRÁFICOS EJECUTIVOS FASE 2 ── */}
      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2 print:grid-cols-2 print:gap-2.5">
        {/* Card 1: Consolidado Global de Fase 2 */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[300px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-snug">
                Cumplimiento Fase 2 · Región {selectedRegion}
              </h3>
              <p className="text-[13px] font-semibold text-slate-500 mt-0.5 leading-normal">
                Estado de las {ugelStats.total} UGEL en el Cierre Oficial RAR
              </p>
            </div>
            <span className="rounded-md bg-indigo-100 px-2.5 py-1 text-[11px] font-black text-indigo-800 shrink-0">
              Fase 2 Oficial
            </span>
          </div>

          <div className="my-auto flex items-center justify-center gap-6 py-4">
            <div className="relative flex items-center justify-center">
              <svg width="136" height="136" viewBox="0 0 136 136" className="-rotate-90">
                <circle cx="68" cy="68" r="52" fill="transparent" stroke="#f1f5f9" strokeWidth="18" />
                <circle
                  cx="68"
                  cy="68"
                  r="52"
                  fill="transparent"
                  stroke="#16a34a"
                  strokeWidth="18"
                  strokeDasharray={`${ugelStats.total > 0 ? (ugelStats.p2Completed / ugelStats.total) * 326.72 : 0} 326.72`}
                  strokeDashoffset="0"
                />
                <circle
                  cx="68"
                  cy="68"
                  r="52"
                  fill="transparent"
                  stroke="#fbbf24"
                  strokeWidth="18"
                  strokeDasharray={`${ugelStats.total > 0 ? (ugelStats.p2InProgress / ugelStats.total) * 326.72 : 0} 326.72`}
                  strokeDashoffset={`-${ugelStats.total > 0 ? (ugelStats.p2Completed / ugelStats.total) * 326.72 : 0}`}
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

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-600" />
                <span className="font-bold text-slate-800 text-[13px]">Fase 2 Culminada ({ugelStats.p2Completed})</span>
                <span className="text-slate-500 font-bold">
                  — {ugelStats.total > 0 ? Math.round((ugelStats.p2Completed / ugelStats.total) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="font-bold text-slate-800 text-[13px]">En plazo regular ({ugelStats.p2InProgress})</span>
                <span className="text-slate-500 font-bold">
                  — {ugelStats.total > 0 ? Math.round((ugelStats.p2InProgress / ugelStats.total) * 100) : 0}%
                </span>
              </div>
            </div>
          </div>

          <div className="text-center border-t border-slate-100 pt-2.5 text-[11.5px] font-semibold text-slate-400">
            Corte de control oficial: 26 de octubre de 2026
          </div>
        </div>

        {/* Card 2: Avance por Direcciones Pedagógicas en Fase 2 */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[300px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-snug">
                Avance por Direcciones Pedagógicas
              </h3>
              <p className="text-[13px] font-semibold text-slate-500 mt-0.5 leading-normal">
                Progreso de las 7 líneas en las UGEL de {selectedRegion}
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-600 shrink-0">
              Líneas Pedagógicas
            </span>
          </div>

          <div className="my-auto space-y-2 py-3">
            {ugelStats.directionStats.map((d) => (
              <div key={d.code} className="flex items-center gap-2.5 text-xs">
                <span className="w-13 font-black text-slate-800 text-[12.5px]">{d.code}</span>
                <div className="relative flex-1">
                  <div className="flex h-3.5 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                    <div style={{ width: `${d.total > 0 ? (d.ok / d.total) * 100 : 0}%` }} className="bg-emerald-600" />
                    <div style={{ width: `${d.total > 0 ? (d.prog / d.total) * 100 : 0}%` }} className="bg-amber-400" />
                    <div style={{ width: `${d.total > 0 ? (d.pend / d.total) * 100 : 0}%` }} className="bg-rose-600" />
                  </div>
                </div>
                <span className="w-11 text-right font-black text-slate-900 tabular-nums text-[12.5px]">
                  {d.pct}%
                </span>
                <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                  {d.ok}/{d.total}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[12px] text-slate-500 font-bold">
            <span>7 Direcciones evaluadas</span>
            <span>Región {selectedRegion}</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          4. TABLERO MATRICIAL COMPLETO (FASE 2 Y DIRECCIONES)
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200/90 bg-white shadow-2xs overflow-hidden mb-16">
        <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/70 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <h3 className="text-base font-extrabold text-slate-900">
                Tablero de Control Fase 2 por UGEL – Región {selectedRegion}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Haz clic en los estados de Fase 2 o en las Direcciones pedagógicas para alternar su estado.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar UGEL u observación…"
                className="h-9 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-xs font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto [scrollbar-width:thin]">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 font-black text-slate-700 bg-slate-100/80">
                <th rowSpan={2} className="sticky top-0 z-20 bg-slate-100 px-3 py-3 text-center w-12 text-[12.5px] text-slate-600">
                  N°
                </th>
                <th rowSpan={2} className="sticky top-0 z-20 bg-slate-100 px-3.5 py-3 w-48 text-[13px] text-slate-900">
                  UGEL
                </th>
                {/* BLOQUE FASE 2 */}
                <th className="sticky top-0 z-20 border-x border-slate-200 px-3 py-2 text-center bg-indigo-50 text-indigo-950 font-black">
                  Fase 2 (Oficial RAR)
                </th>
                {/* BLOQUE DIRECCIONES */}
                <th colSpan={DIRECTION_CODES.length} className="sticky top-0 z-20 border-r border-slate-200 px-3 py-2 text-center bg-amber-50 text-amber-950 font-black">
                  Direcciones Pedagógicas
                </th>
                {/* BLOQUE ESTADO GENERAL */}
                <th rowSpan={2} className="sticky top-0 z-20 bg-slate-100 px-3 py-3 text-center w-36 font-black text-slate-800">
                  Estado general
                </th>
                <th rowSpan={2} className="sticky top-0 z-20 bg-slate-100 px-3.5 py-3 text-right w-24">
                  Acción
                </th>
              </tr>
              <tr className="border-b border-slate-200 text-[11.5px] font-bold text-slate-600">
                <th className="sticky top-[37px] z-20 bg-indigo-50/95 border-x border-slate-200 px-2.5 py-1.5 text-center">RAR</th>
                {DIRECTION_CODES.map((code) => (
                  <th key={code} className="sticky top-[37px] z-20 bg-amber-50/95 px-1.5 py-1.5 text-center truncate max-w-[55px]" title={code}>
                    {code}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUgels.map((u) => {
                const isP2Done = u.phase2Files >= u.phase2Total
                const genStatus = computeUgelGeneralStatusPhase2(u)

                const rowTint =
                  genStatus === 'pendiente'
                    ? 'bg-rose-50/35 hover:bg-rose-50/70'
                    : genStatus === 'en_proceso'
                      ? 'bg-amber-50/25 hover:bg-amber-50/60'
                      : 'hover:bg-slate-50/80'

                return (
                  <tr key={u.id} className={`transition-colors ${rowTint}`}>
                    <td className="px-3 py-3 text-center font-bold text-slate-500 tabular-nums text-[12.5px]">
                      {u.number}
                    </td>
                    <td className="px-3.5 py-3 font-black text-slate-900">
                      <button
                        type="button"
                        onClick={() => setInspectedUgel(u)}
                        className="hover:underline cursor-pointer text-left font-black text-indigo-950 text-[13.5px] tracking-tight"
                      >
                        {u.name}
                      </button>
                      <span className="block text-[11px] font-semibold text-slate-400 mt-0.5 truncate">
                        {u.observation}
                      </span>
                    </td>

                    {/* FASE 2: SOLO ESTADO RAR */}
                    <td className="border-x border-slate-100 px-2.5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleTogglePhase2(u.id)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 hover:bg-indigo-100/60 transition-colors cursor-pointer text-left"
                        title={`Fase 2 RAR: ${isP2Done ? 'Completado' : 'En plazo'} (Clic para alternar)`}
                      >
                        <span className={`grid h-4.5 w-4.5 place-items-center rounded-full text-white ${
                          isP2Done ? 'bg-[#16a34a]' : 'bg-slate-400'
                        }`}>
                          {isP2Done ? <Check size={11} strokeWidth={3} /> : <Clock size={11} strokeWidth={2.4} />}
                        </span>
                        <span className={`font-extrabold text-[12.5px] capitalize ${isP2Done ? 'text-slate-900' : 'text-slate-600'}`}>
                          {isP2Done ? 'Completado' : 'En plazo'}
                        </span>
                      </button>
                    </td>

                    {/* DIRECCIONES OFICIALES (DEI..DISER) */}
                    {DIRECTION_CODES.map((code) => {
                      const applicableDirs = UGEL_APPLICABLE_DIRECTIONS_P2[u.id] || []
                      const applies = applicableDirs.includes(code)
                      const st = u.directions[code]

                      if (!applies) {
                        return (
                          <td key={code} className="px-1.5 py-3 text-center" title={`No aplica ${code} para ${u.name}`}>
                            <span className="inline-block text-[11px] font-black text-slate-300 select-none">
                              —
                            </span>
                          </td>
                        )
                      }

                      const color =
                        st === 'completado'
                          ? 'bg-[#16a34a] ring-2 ring-emerald-300'
                          : st === 'en_proceso'
                            ? 'bg-[#f59e0b] ring-2 ring-amber-200'
                            : 'bg-[#dc2626] ring-2 ring-rose-200'
                      return (
                        <td key={code} className="px-1.5 py-3 text-center">
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

                    {/* ESTADO GENERAL FASE 2 */}
                    <td className="border-l border-slate-100 px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-black ${
                        genStatus === 'completado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : genStatus === 'en_proceso'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-rose-100 text-rose-800'
                      }`}>
                        {genStatus === 'completado' ? (
                          <Check size={12} strokeWidth={3} />
                        ) : genStatus === 'en_proceso' ? (
                          <Clock size={12} strokeWidth={2.4} />
                        ) : (
                          <X size={12} strokeWidth={3} />
                        )}
                        <span className="capitalize">{genStatus === 'en_proceso' ? 'En proceso' : genStatus}</span>
                      </span>
                    </td>

                    {/* ACCIÓN: INSPECCIONAR */}
                    <td className="px-3.5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectedUgel(u)}
                        className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 shadow-2xs hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <Eye size={13} />
                        Ver
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* MODAL / DRAWER DE INSPECCIÓN DE UGEL */}
      {inspectedUgel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900">
                  UGEL {inspectedUgel.name} · Región {inspectedUgel.region}
                </h3>
                <p className="text-xs text-slate-500 font-semibold">
                  Detalle del Cierre de Fase 2 (RAR Oficial)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedUgel(null)}
                className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-600">Estado Fase 2 (RAR):</span>
                  <span className={`font-black ${inspectedUgel.phase2Files >= inspectedUgel.phase2Total ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {inspectedUgel.phase2Files >= inspectedUgel.phase2Total ? 'CULMINADO' : 'EN PLAZO HASTA 26/10'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-600">Fecha registro:</span>
                  <span className="font-bold text-slate-800">{inspectedUgel.phase2Date}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-600">Gestor asignado:</span>
                  <span className="font-bold text-slate-800">{inspectedUgel.gestorName} ({inspectedUgel.gestorPhone})</span>
                </div>
              </div>

              <div>
                <span className="block font-bold text-slate-700 mb-1">Observación técnica:</span>
                <p className="rounded-xl border border-slate-200 bg-white p-3 text-slate-700">
                  {inspectedUgel.observation}
                </p>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between gap-3">
                <button
                  type="button"
                  onClick={() => handleCreateTaskForUgel(inspectedUgel)}
                  className="flex-1 inline-flex justify-center items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 cursor-pointer transition-colors"
                >
                  <Plus size={14} />
                  Crear tarea de contingencia
                </button>
                <button
                  type="button"
                  onClick={() => setInspectedUgel(null)}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
