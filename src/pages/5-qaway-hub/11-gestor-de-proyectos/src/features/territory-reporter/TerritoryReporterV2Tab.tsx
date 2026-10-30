import React, { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
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
import { territoryMonitoringService } from './territoryMonitoringService'

// ─────────────────────────────────────────────────────────────────────────────
// TerritoryReporterV2Tab.tsx — Matriz Ejecutiva Institucional (3 ETAPAS)
// Etapa 1: Fase 1 · Registro MC SIGA
// Etapa 2: Drive · Evidencia declarativa (Corte 22/10/2026)
// Etapa 3: Fase 2 · RAR oficial (Corte 26/10/2026)
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
  | 'DEBEDSAR'
  | 'DIGESE (SEHO)'

export const JUNIN_DIRECTION_CODES: DirectionCode[] = [
  'DEI',
  'DEP',
  'DES',
  'DEBA',
  'DEBE',
  'DEIB',
  'DISER',
]

export const PASCO_DIRECTION_CODES: DirectionCode[] = [
  'DEI',
  'DEP',
  'DES',
  'DEBA',
  'DEBE',
  'DEIB',
  'DISER',
  'DIGESE (SEHO)',
]

export const DIRECTION_CODES: DirectionCode[] = JUNIN_DIRECTION_CODES

// Mapeo oficial de Direcciones aplicables por UGEL (MINEDU - Dotación 2027)
export const UGEL_APPLICABLE_DIRECTIONS: Record<string, DirectionCode[]> = {
  // Región Junín (13 UGEL)
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
  // Región Pasco (DRE Pasco + 4 UGEL ordenadas alfabéticamente)
  'pasco-dre-pasco': ['DEBE', 'DEI', 'DEIB', 'DEP'],
  'pasco-ugel-daniel-alcides-carrion': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'pasco-ugel-oxapampa': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
  'pasco-ugel-pasco': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DIGESE (SEHO)', 'DISER'],
  'pasco-ugel-puerto-bermudez': ['DEBA', 'DEBE', 'DEI', 'DEIB', 'DEP', 'DES', 'DISER'],
}

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
  // Etapa 3: Fase 2 - RAR oficial
  phase2Files: number // 0..3
  phase2Total: number
  phase2Date: string
  // Direcciones pedagógicas (Solo aplican las asignadas oficialmente)
  directions: Partial<Record<DirectionCode, TerritoryStatus>>
  observation: string
  gestorName: string
  gestorPhone: string
}

const STORAGE_KEY_V2 = 'qaway_territory_reporter_v2_fase1_green_f2_neutral_dirs_v5'
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
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
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
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
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
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
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
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
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
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
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
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
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
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
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
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
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
      DEBA: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
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
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
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
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEIB: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
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
      DEBA: 'pendiente',
      DEBE: 'pendiente',
      DEI: 'pendiente',
      DEP: 'pendiente',
      DES: 'pendiente',
      DISER: 'pendiente',
    },
    observation: 'Fase 1 OK. Subida a Drive en proceso; cierre oficial RAR en plazo.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
]

export const STORAGE_KEY_PASCO_V6 = 'qaway_territory_reporter_v2_pasco_v6'

export const INITIAL_PASCO_UGELS_V2: UgelMonitoringV2Row[] = [
  {
    id: 'pasco-dre-pasco',
    number: 1,
    name: 'DRE Pasco',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '15/10/2026 11:30',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 09:00',
    phase2Files: 3,
    phase2Total: 3,
    phase2Date: '16/10/2026 14:00',
    directions: {
      DEBE: 'completado',
      DEI: 'completado',
      DEIB: 'completado',
      DEP: 'completado',
    },
    observation: 'Validación regional consolidada DRE Pasco.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'pasco-ugel-daniel-alcides-carrion',
    number: 2,
    name: 'Daniel A. Carrión',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '16/10/2026 09:40',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 12:30',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'completado',
      DEBE: 'completado',
      DEI: 'completado',
      DEIB: 'completado',
      DEP: 'completado',
      DES: 'completado',
      DISER: 'completado',
    },
    observation: 'Fase 1 y Drive 100% completados. Fase 2 en plazo regular.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'pasco-ugel-oxapampa',
    number: 3,
    name: 'Oxapampa',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '15/10/2026 14:20',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 10:15',
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
    observation: 'Fase 1, Drive y Fase 2 completadas conforme.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'pasco-ugel-pasco',
    number: 4,
    name: 'Pasco',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '16/10/2026 15:00',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 11:00',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'completado',
      DEBE: 'completado',
      DEI: 'completado',
      DEIB: 'completado',
      DEP: 'completado',
      DES: 'completado',
      'DIGESE (SEHO)': 'completado',
      DISER: 'completado',
    },
    observation: 'Fase 1 y Drive OK. Cierre RAR en plazo.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
  {
    id: 'pasco-ugel-puerto-bermudez',
    number: 5,
    name: 'Puerto Bermúdez',
    phase1Files: 3,
    phase1Total: 3,
    phase1Date: '17/10/2026 10:10',
    driveStatus: 'completado',
    driveFiles: 1,
    driveTotal: 1,
    driveDate: '22/10/2026 15:45',
    phase2Files: 0,
    phase2Total: 3,
    phase2Date: 'En plazo hasta 26/10',
    directions: {
      DEBA: 'completado',
      DEBE: 'completado',
      DEI: 'completado',
      DEIB: 'completado',
      DEP: 'completado',
      DES: 'completado',
      DISER: 'completado',
    },
    observation: 'Avance en zona selva Oxapampa. Cierre RAR en coordinación.',
    gestorName: 'Carlos Sandoval',
    gestorPhone: '+51964112233',
  },
]

export function formatUgelDisplayName(name: string): string {
  const upper = name.trim().toUpperCase()
  if (upper === 'DRE PASCO') return 'DRE Pasco'
  if (upper === 'DANIEL ALCIDES CARRIÓN' || upper === 'DANIEL A. CARRIÓN') return 'Daniel A. Carrión'
  if (upper === 'PUERTO BERMÚDEZ' || upper === 'PUERTO BERMUDEZ') return 'Puerto Bermúdez'
  if (upper === 'RÍO ENE MANTARO' || upper === 'RIO ENE MANTARO') return 'Río Ene'
  if (upper === 'RÍO TAMBO' || upper === 'RIO TAMBO') return 'Río Tambo'
  if (upper === 'OXAPAMPA') return 'Oxapampa'
  if (upper === 'PASCO') return 'Pasco'
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
}

export function sanitizePascoUgels(list: UgelMonitoringV2Row[]): UgelMonitoringV2Row[] {
  const expectedIds = INITIAL_PASCO_UGELS_V2.map((u) => u.id)
  const isOrderDifferent = list.some((u, idx) => u.id !== expectedIds[idx])
  const hasInvalid = list.some((u) => !expectedIds.includes(u.id) || u.id.includes('rio-ene') || u.id.includes('coar') || u.name.toUpperCase().includes('COAR'))
  const hasMissing = expectedIds.some((id) => !list.some((u) => u.id === id))

  if (hasInvalid || hasMissing || isOrderDifferent || list.length !== INITIAL_PASCO_UGELS_V2.length) {
    const listMap = new Map(list.map((u) => [u.id, u]))
    return INITIAL_PASCO_UGELS_V2.map((canon) => {
      const existing = listMap.get(canon.id)
      if (!existing) return canon
      return {
        ...canon,
        name: canon.name,
        phase1Files: existing.phase1Files,
        phase1Date: existing.phase1Date,
        driveStatus: existing.driveStatus,
        driveFiles: existing.driveFiles,
        driveDate: existing.driveDate,
        phase2Files: existing.phase2Files,
        phase2Date: existing.phase2Date,
        directions: {
          ...canon.directions,
          ...existing.directions,
        },
        observation: existing.observation || canon.observation,
      }
    })
  }
  return list.map((item, idx) => ({
    ...item,
    name: INITIAL_PASCO_UGELS_V2[idx]?.name || item.name,
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// DATASETS Y LLAVES DE PERSISTENCIA INDEPENDIENTES PARA HITO 1.7
// ─────────────────────────────────────────────────────────────────────────────
export const STORAGE_KEY_HITO_17_JUNIN = 'qaway_territory_reporter_v2_hito17_junin_v1'
export const STORAGE_KEY_HITO_17_PASCO = 'qaway_territory_reporter_v2_hito17_pasco_v1'

export const INITIAL_JUNIN_UGELS_V2_HITO_17: UgelMonitoringV2Row[] = INITIAL_JUNIN_UGELS_V2.map((u, idx) => ({
  ...u,
  phase1Files: idx % 3 === 0 ? 3 : 2,
  phase1Total: 3,
  phase1Date: idx % 3 === 0 ? '02/11/2026 11:30' : 'En proceso',
  driveStatus: (idx % 3 === 0 ? 'completado' : idx % 3 === 1 ? 'en_proceso' : 'pendiente') as TerritoryStatus,
  driveFiles: idx % 3 === 0 ? 1 : 0,
  driveTotal: 1,
  driveDate: idx % 3 === 0 ? '10/11/2026 09:00' : 'Sin evidencia',
  phase2Files: idx === 0 ? 3 : 0,
  phase2Total: 3,
  phase2Date: idx === 0 ? '12/11/2026 16:00' : 'En plazo hasta 25/11',
  observation: `Hito 1.7: Acondicionamiento de almacenes y contratos de transporte para UGEL ${u.name}.`,
}))

export const INITIAL_PASCO_UGELS_V2_HITO_17: UgelMonitoringV2Row[] = INITIAL_PASCO_UGELS_V2.map((u, idx) => ({
  ...u,
  phase1Files: idx % 2 === 0 ? 3 : 1,
  phase1Total: 3,
  phase1Date: idx % 2 === 0 ? '03/11/2026 10:00' : 'En proceso',
  driveStatus: (idx % 2 === 0 ? 'completado' : 'pendiente') as TerritoryStatus,
  driveFiles: idx % 2 === 0 ? 1 : 0,
  driveTotal: 1,
  driveDate: idx % 2 === 0 ? '11/11/2026 08:30' : 'Sin evidencia',
  phase2Files: 0,
  phase2Total: 3,
  phase2Date: 'En plazo hasta 25/11',
  observation: `Hito 1.7: Acondicionamiento de almacenes y contratos de transporte en ${u.name}.`,
}))

// ─────────────────────────────────────────────────────────────────────────────
// DATASETS Y LLAVES DE PERSISTENCIA INDEPENDIENTES PARA HITO 5.1a
// OM 00032-2026-MINEDU / Solicitud Personal de Apoyo a COGECO (Periodo Vacacional)
// Plazo de corte: 30 de octubre de 2026
// Drive Oficial: https://drive.google.com/drive/folders/1PET25rsk8Aa-N_Wh7tPpyu5iK_kieCUF
// ─────────────────────────────────────────────────────────────────────────────
export const STORAGE_KEY_HITO_51A_JUNIN = 'qaway_territory_reporter_v2_hito51a_junin_v1'
export const STORAGE_KEY_HITO_51A_PASCO = 'qaway_territory_reporter_v2_hito51a_pasco_v1'
export const DRIVE_URL_HITO_51A = 'https://drive.google.com/drive/folders/1PET25rsk8Aa-N_Wh7tPpyu5iK_kieCUF'

export const INITIAL_JUNIN_UGELS_V2_HITO_51A: UgelMonitoringV2Row[] = INITIAL_JUNIN_UGELS_V2.map((u, idx) => {
  const hasOficio = idx % 2 === 0 || idx === 1 || idx === 5
  const hasDifusion = idx % 3 === 0
  const difusionMedia = idx % 4 === 0 ? 'Facebook / Redes Sociales' : idx % 4 === 1 ? 'Grupos de WhatsApp' : idx % 4 === 2 ? 'Portal Web Institucional' : 'Correo electrónico masivo'

  return {
    ...u,
    phase1Files: hasOficio ? 1 : 0,
    phase1Total: 1,
    phase1Date: hasOficio ? '29/10/2026 14:20' : 'Pendiente de emisión',
    driveStatus: (hasDifusion ? 'completado' : 'pendiente') as TerritoryStatus,
    driveFiles: hasDifusion ? 1 : 0,
    driveTotal: 1,
    driveDate: hasDifusion ? '30/10/2026 09:15' : 'Sin evidencia de difusión',
    phase2Files: 0,
    phase2Total: 0,
    phase2Date: 'No aplica en 5.1a',
    observation: hasOficio && hasDifusion
      ? `Oficio cursado y sustento en Drive (${difusionMedia}).`
      : hasOficio
        ? `Oficio cargado al Drive; pendiente captura de socialización (${difusionMedia}).`
        : 'Pendiente de emisión y carga de Oficio Múltiple.',
  }
})

export const INITIAL_PASCO_UGELS_V2_HITO_51A: UgelMonitoringV2Row[] = INITIAL_PASCO_UGELS_V2
  .filter((u) => !u.id.includes('dre') && !u.name.toUpperCase().includes('DRE'))
  .map((u, idx) => {
    // 4 UGEL de Pasco: Daniel A. Carrión (idx 0), Oxapampa (idx 1), Pasco (idx 2), Puerto Bermúdez (idx 3)
    const hasOficio = idx === 0 || idx === 1 || idx === 3
    const hasDifusion = false
    return {
      ...u,
      number: idx + 1,
      phase1Files: hasOficio ? 1 : 0,
      phase1Total: 1,
      phase1Date: hasOficio ? '29/10/2026 11:00' : 'Pendiente de emisión',
      driveStatus: (hasDifusion ? 'completado' : 'pendiente') as TerritoryStatus,
      driveFiles: hasDifusion ? 1 : 0,
      driveTotal: 1,
      driveDate: hasDifusion ? '30/10/2026 10:30' : 'Sin evidencia de difusión',
      phase2Files: 0,
      phase2Total: 0,
      phase2Date: 'No aplica en 5.1a',
      observation: hasOficio
        ? 'Oficio remitido; pendiente captura de difusión.'
        : 'Pendiente de emisión y carga de Oficio Múltiple.',
    }
  })

function computePhaseStatus(files: number, total: number): TerritoryStatus {
  if (files >= total) return 'completado'
  if (files > 0) return 'en_proceso'
  return 'pendiente'
}

export function computeUgelDirectionStatus(row: UgelMonitoringV2Row): {
  pct: number
  status: TerritoryStatus
  okCount: number
  totalDirs: number
} {
  const applicableDirs = UGEL_APPLICABLE_DIRECTIONS[row.id] || DIRECTION_CODES
  const totalDirs = applicableDirs.length || 7
  let okCount = 0
  let progCount = 0

  for (const code of applicableDirs) {
    const st = row.directions[code] || 'pendiente'
    if (st === 'completado') okCount++
    else if (st === 'en_proceso') progCount++
  }

  // Ponderación de avance efectivo
  const effectiveScore = okCount + progCount * 0.5
  const pct = totalDirs > 0 ? Math.round((effectiveScore / totalDirs) * 100) : 0

  let status: TerritoryStatus = 'pendiente'
  // 1. COMPLETADO: Solo y exclusivamente si todas las direcciones aplicables (7 de 7) están 100% completadas
  if (okCount === totalDirs && totalDirs > 0) {
    status = 'completado'
  } else if (okCount > 0 || progCount > 0) {
    // 2. EN PROCESO: Si falta aunque sea 1 dirección (de 1 a 6 listas, o en proceso)
    status = 'en_proceso'
  } else {
    // 3. PENDIENTE: Si no tiene ninguna dirección completada (0 listas)
    status = 'pendiente'
  }

  return { pct, status, okCount, totalDirs }
}

function computeUgelGeneralStatusV2(row: UgelMonitoringV2Row, is51a?: boolean): TerritoryStatus {
  if (is51a) {
    const hasOficio = row.phase1Files >= 1
    const hasDifusion = row.driveStatus === 'completado'
    if (hasOficio && hasDifusion) return 'completado'
    if (hasOficio || hasDifusion) return 'en_proceso'
    return 'pendiente'
  }

  const isP1Done = row.phase1Files >= row.phase1Total
  const isP2Done = row.phase2Files >= row.phase2Total
  const dirStatus = computeUgelDirectionStatus(row).status

  // 1. Completado: Completa las 3 etapas al 100% (Fase 1 + Drive regional + Fase 2)
  if (isP1Done && dirStatus === 'completado' && isP2Done) {
    return 'completado'
  }

  // 2. En proceso:
  // - Si Drive tiene avance parcial ('en_proceso')
  // - O si Drive está completado pero le falta cerrar Fase 1 o Fase 2
  if (dirStatus === 'en_proceso' || (dirStatus === 'completado' && (!isP1Done || !isP2Done))) {
    return 'en_proceso'
  }

  // 3. Pendiente: 0% en Drive y evaluación pendiente
  return 'pendiente'
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
  const { perspective, currentPersona, setPerspective, isCoordinador, isGestor, isSuperAdmin } = useProjectPerspective()
  const [searchParams, setSearchParams] = useSearchParams()
  const location = useLocation()

  // Sincronización bidireccional de Hito (1.6 vs 1.7 vs 5.1a)
  const getHitoFromUrl = (): '1.6' | '1.7' | '5.1a' => {
    const q = searchParams.get('hito')
    if (q === '5.1a' || q === '5-1a' || location.pathname.includes('hito-5-1a') || location.pathname.includes('hito-5.1a')) {
      return '5.1a'
    }
    if (q === '1.7' || location.pathname.includes('hito-1-7')) {
      return '1.7'
    }
    return '1.6'
  }

  const [selectedHito, setSelectedHito] = useState<'1.6' | '1.7' | '5.1a'>(getHitoFromUrl)

  useEffect(() => {
    const urlHito = getHitoFromUrl()
    if (urlHito !== selectedHito) {
      setSelectedHito(urlHito)
    }
  }, [searchParams, location.pathname])

  const handleSelectHito = (newHito: '1.6' | '1.7' | '5.1a') => {
    setSelectedHito(newHito)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('hito', newHito)
    setSearchParams(nextParams, { replace: true })
  }

  const is51a = selectedHito === '5.1a'
  const is17 = selectedHito === '1.7'
  const [selectedMacrorregion, setSelectedMacrorregion] = useState('Centro')
  const [selectedRegion, setSelectedRegion] = useState('Región Junín (13 UGEL)')
  const [selectedGestorFilter, setSelectedGestorFilter] = useState('todos')
  const [selectedUgelFilter, setSelectedUgelFilter] = useState('todas')

  const isPasco = selectedRegion.includes('Pasco')

  // DATASET HITO 1.6 - JUNIN
  const [juninUgels16, setJuninUgels16] = useState<UgelMonitoringV2Row[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_V2)
      if (saved) {
        const parsed = JSON.parse(saved) as UgelMonitoringV2Row[]
        const hasInvalid = parsed.some((u) => u.name === 'CHUPINGO' || u.name === 'VITOC')
        if (!hasInvalid && parsed.length === 13) {
          return parsed
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_JUNIN_UGELS_V2
  })

  // DATASET HITO 1.6 - PASCO
  const [pascoUgels16, setPascoUgels16] = useState<UgelMonitoringV2Row[]>(() => {
    try {
      localStorage.removeItem('qaway_territory_reporter_v2_pasco_v1')
      localStorage.removeItem('qaway_territory_reporter_v2_pasco_v2')
      localStorage.removeItem('qaway_territory_reporter_v2_pasco_v3')
      localStorage.removeItem('qaway_territory_reporter_v2_pasco_v4')
      localStorage.removeItem('qaway_territory_reporter_v2_pasco_v5')
      const saved = localStorage.getItem(STORAGE_KEY_PASCO_V6)
      if (saved) {
        const parsed = JSON.parse(saved) as UgelMonitoringV2Row[]
        return sanitizePascoUgels(parsed)
      }
    } catch {
      // ignore
    }
    return INITIAL_PASCO_UGELS_V2
  })

  // DATASET HITO 1.7 - JUNIN (100% INDEPENDIENTE)
  const [juninUgels17, setJuninUgels17] = useState<UgelMonitoringV2Row[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HITO_17_JUNIN)
      if (saved) {
        const parsed = JSON.parse(saved) as UgelMonitoringV2Row[]
        if (parsed.length === 13) return parsed
      }
    } catch {
      // ignore
    }
    return INITIAL_JUNIN_UGELS_V2_HITO_17
  })

  // DATASET HITO 1.7 - PASCO (100% INDEPENDIENTE)
  const [pascoUgels17, setPascoUgels17] = useState<UgelMonitoringV2Row[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HITO_17_PASCO)
      if (saved) {
        const parsed = JSON.parse(saved) as UgelMonitoringV2Row[]
        if (parsed.length === INITIAL_PASCO_UGELS_V2_HITO_17.length) return sanitizePascoUgels(parsed)
      }
    } catch {
      // ignore
    }
    return INITIAL_PASCO_UGELS_V2_HITO_17
  })

  // DATASET HITO 5.1a - JUNIN (100% INDEPENDIENTE - OM 00032-2026 / 30 OCT)
  const [juninUgels51a, setJuninUgels51a] = useState<UgelMonitoringV2Row[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HITO_51A_JUNIN)
      if (saved) {
        const parsed = JSON.parse(saved) as UgelMonitoringV2Row[]
        if (parsed.length === 13) return parsed
      }
    } catch {
      // ignore
    }
    return INITIAL_JUNIN_UGELS_V2_HITO_51A
  })

  // DATASET HITO 5.1a - PASCO (100% INDEPENDIENTE - 4 UGEL EXCLUYENDO DRE PASCO)
  const [pascoUgels51a, setPascoUgels51a] = useState<UgelMonitoringV2Row[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_HITO_51A_PASCO)
      if (saved) {
        const parsed = JSON.parse(saved) as UgelMonitoringV2Row[]
        const nonDre = parsed
          .filter((u) => !u.id.includes('dre') && !u.name.toUpperCase().includes('DRE'))
          .map((u, idx) => ({ ...u, number: idx + 1 }))
        if (nonDre.length === 4) return nonDre
      }
    } catch {
      // ignore
    }
    return INITIAL_PASCO_UGELS_V2_HITO_51A
  })

  // Purga reactiva inmediata para Pasco Hito 1.6
  useEffect(() => {
    const expectedIds = INITIAL_PASCO_UGELS_V2.map((u) => u.id)
    const isCorrupt =
      pascoUgels16.some((u) => u.id.includes('rio-ene') || u.id.includes('coar') || u.name.toUpperCase().includes('COAR')) ||
      pascoUgels16.length !== INITIAL_PASCO_UGELS_V2.length ||
      pascoUgels16.some((u, idx) => u.id !== expectedIds[idx]) ||
      pascoUgels16.some((u, idx) => u.name !== INITIAL_PASCO_UGELS_V2[idx]?.name)

    if (isCorrupt) {
      const cleaned = sanitizePascoUgels(pascoUgels16)
      setPascoUgels16(cleaned)
      try {
        localStorage.setItem(STORAGE_KEY_PASCO_V6, JSON.stringify(cleaned))
      } catch {
        // ignore
      }
    }
  }, [pascoUgels16])

  // Datos reactivos según Hito y Región
  const ugels = isPasco
    ? (is51a ? pascoUgels51a : is17 ? pascoUgels17 : pascoUgels16)
    : (is51a ? juninUgels51a : is17 ? juninUgels17 : juninUgels16)

  const activeDirectionCodes = isPasco ? PASCO_DIRECTION_CODES : JUNIN_DIRECTION_CODES

  const setUgels = (updater: React.SetStateAction<UgelMonitoringV2Row[]>) => {
    if (is51a) {
      if (isPasco) {
        setPascoUgels51a(updater)
      } else {
        setJuninUgels51a(updater)
      }
    } else if (is17) {
      if (isPasco) {
        setPascoUgels17(updater)
      } else {
        setJuninUgels17(updater)
      }
    } else {
      if (isPasco) {
        setPascoUgels16(updater)
      } else {
        setJuninUgels16(updater)
      }
    }
  }

  // Sincronización inicial y reactiva desde Supabase (Exclusiva para Junín Hito 1.6)
  useEffect(() => {
    let isMounted = true
    territoryMonitoringService
      .fetchJuninUgels()
      .then((remoteUgels) => {
        if (isMounted && remoteUgels.length > 0) {
          setJuninUgels16(remoteUgels)
          try {
            localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(remoteUgels))
          } catch {
            // ignore
          }
        }
      })
      .catch((err) => {
        console.warn('[TerritoryV2] Usando fallback local por:', err)
      })
    return () => {
      isMounted = false
    }
  }, [])

  // Persistencia reactiva local para cada dataset por separado
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(juninUgels16))
    } catch {
      // ignore
    }
  }, [juninUgels16])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_PASCO_V6, JSON.stringify(pascoUgels16))
    } catch {
      // ignore
    }
  }, [pascoUgels16])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HITO_17_JUNIN, JSON.stringify(juninUgels17))
    } catch {
      // ignore
    }
  }, [juninUgels17])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HITO_17_PASCO, JSON.stringify(pascoUgels17))
    } catch {
      // ignore
    }
  }, [pascoUgels17])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HITO_51A_JUNIN, JSON.stringify(juninUgels51a))
    } catch {
      // ignore
    }
  }, [juninUgels51a])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_HITO_51A_PASCO, JSON.stringify(pascoUgels51a))
    } catch {
      // ignore
    }
  }, [pascoUgels51a])

  const [searchQuery, setSearchQuery] = useState('')
  const [filterDirection, setFilterDirection] = useState<'Todas' | DirectionCode>('Todas')
  const [filterStatus, setFilterStatus] = useState<'Todos' | 'Completado' | 'En proceso' | 'Pendiente'>('Todos')

  const [inspectedUgel, setInspectedUgel] = useState<UgelMonitoringV2Row | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')

  // Estado para el modal de fecha y hora de entrega en Drive
  const [editingDriveDateTarget, setEditingDriveDateTarget] = useState<{
    ugelId: string
    ugelName: string
    currentDate: string
  } | null>(null)
  const [drivePickerDate, setDrivePickerDate] = useState('')
  const [drivePickerTime, setDrivePickerTime] = useState('')
  const [drivePickerStatus, setDrivePickerStatus] = useState<TerritoryStatus>('completado')

  const parseDriveDateTime = (str: string): { date: string; time: string } => {
    const now = new Date()
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`

    if (!str || str.toLowerCase().includes('sin') || str.toLowerCase().includes('proceso')) {
      return { date: todayIso, time: nowTime }
    }
    const parts = str.trim().split(' ')
    if (parts.length >= 1) {
      const dParts = parts[0].split('/')
      if (dParts.length === 3) {
        const isoDate = `${dParts[2]}-${dParts[1].padStart(2, '0')}-${dParts[0].padStart(2, '0')}`
        const isoTime = parts[1] || '12:00'
        return { date: isoDate, time: isoTime }
      }
    }
    return { date: todayIso, time: nowTime }
  }

  const formatDriveDateTime = (dateIso: string, timeIso: string): string => {
    if (!dateIso) return 'Sin evidencia'
    const parts = dateIso.split('-')
    if (parts.length !== 3) return 'Sin evidencia'
    const [y, m, d] = parts
    return `${d}/${m}/${y} ${timeIso || '12:00'}`
  }

  useEffect(() => {
    if (inspectedUgel) {
      setNewTaskTitle(`Seguimiento de subida CdD - MC SIGA en UGEL ${inspectedUgel.name}`)
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

  const handleCreateTaskForUgel = (ugel: UgelMonitoringV2Row, customTitle?: string) => {
    const titleToUse =
      (customTitle ?? newTaskTitle).trim() ||
      (is51a
        ? `Asistencia técnica Solicitud Personal Apoyo en UGEL ${ugel.name} (Hito 5.1a)`
        : is17
          ? `Asistencia técnica Acondicionamiento y Transporte en UGEL ${ugel.name} (Hito 1.7)`
          : `Asistencia técnica CdD - MC SIGA en UGEL ${ugel.name} (Hito 1.6)`)

    const genStatus = computeUgelGeneralStatusV2(ugel, is51a)
    const created = projectsService.createWorkItem({
      projectId: _projectId,
      milestoneRef: is51a
        ? 'Hito 5.1a · Solicitud Personal de Apoyo a COGECO en II.EE. (Periodo Vacacional)'
        : is17
          ? 'Hito 1.7 · Acondicionamiento de Almacenes y Contratos de Transporte'
          : 'Hito 1.6 · Elaboración del Cuadro de Distribución Local en el MC SIGA',
      originType: 'accion_emergente',
      taskNature: 'contingencia_operativa',
      threatensMilestone: genStatus === 'pendiente',
      threatNote:
        genStatus === 'pendiente'
          ? `UGEL ${ugel.name} en estado Pendiente (${ugel.observation})`
          : undefined,
      title: titleToUse,
      description: `Tarea generada desde el Reporteador Territorial V2 para UGEL ${ugel.name} (${isPasco ? 'Región Pasco' : 'Región Junín'}). Hito: ${selectedHito}. Estado Fase 1: ${ugel.phase1Files}/${ugel.phase1Total}, Drive: ${ugel.driveStatus}, Fase 2: ${ugel.phase2Files}/${ugel.phase2Total}. Observación: ${ugel.observation}.`,
      state: 'todo',
      priority: genStatus === 'pendiente' ? 'URGENTE' : 'MEDIA',
      assignee: {
        name: ugel.gestorName,
        role: `Gestor Territorial ${isPasco ? 'Región Pasco' : 'Región Junín'}`,
        phone: ugel.gestorPhone,
      },
      storyPoints: 3,
      followUpDate: is51a ? '2026-10-30' : is17 ? '2026-11-25' : '2026-10-26',
      scopeTag: `UGEL ${ugel.name}`,
    })
    setInspectedUgel(null)
    if (onOpenTask) {
      onOpenTask(created.id)
    }
  }

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
      const gen = computeUgelGeneralStatusV2(u, is51a)
      if (gen === 'completado') completed++
      else if (gen === 'en_proceso') inProgress++
      else pending++

      if (is51a) {
        const hasOficio = u.phase1Files >= 1
        if (hasOficio) p1Completed++
        else p1Pending++

        const hasDifusion = u.driveStatus === 'completado'
        if (hasDifusion) driveCompleted++
        else drivePending++
      } else {
        const isP1Done = u.phase1Files >= u.phase1Total
        if (isP1Done) p1Completed++
        else p1Pending++

        const dirStatus = computeUgelDirectionStatus(u).status
        if (dirStatus === 'completado') driveCompleted++
        else if (dirStatus === 'en_proceso') driveInProgress++
        else drivePending++

        const isP2Done = u.phase2Files >= u.phase2Total
        if (isP2Done) p2Completed++
        else p2InProgress++ // En plazo técnico regular hasta el 26/10 (cero alarma roja)
      }
    }

    const total = ugels.length
    const completedPct = Math.round((completed / total) * 100)
    const inProgressPct = Math.round((inProgress / total) * 100)
    const pendingPct = Math.max(0, 100 - completedPct - inProgressPct)

    const directionStats = activeDirectionCodes
      .map((code) => {
        let ok = 0
        let prog = 0
        let pend = 0
        let applicableCount = 0
        for (const u of ugels) {
          const applicableDirs = UGEL_APPLICABLE_DIRECTIONS[u.id] || []
          if (!applicableDirs.includes(code)) continue // NO aplica: no entra al total ni perjudica el análisis
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
      .filter((d) => d.total > 0)

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
  }, [ugels, is51a, activeDirectionCodes])

  const filteredUgels = useMemo(() => {
    return ugels.filter((u) => {
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
        const gen = computeUgelGeneralStatusV2(u, is51a)
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
  }, [ugels, searchQuery, filterStatus, filterDirection, selectedUgelFilter, selectedGestorFilter, is51a])

  // Alternador binario en Fase 1 y Fase 2 (2 opciones: o cumplen o no)
  const handleCycleUgelFiles = (ugelId: string, phase: 1 | 2) => {
    setUgels((prev) =>
      prev.map((u) => {
        if (u.id !== ugelId) return u
        let updated: UgelMonitoringV2Row
        if (phase === 1) {
          const isDone = u.phase1Files >= (is51a ? 1 : u.phase1Total)
          const nextFiles = isDone ? 0 : (is51a ? 1 : u.phase1Total)
          updated = {
            ...u,
            phase1Files: nextFiles,
            phase1Total: is51a ? 1 : u.phase1Total,
            phase1Date: nextFiles > 0 ? (is51a ? 'Oficio emitido y en Drive' : 'Actualizado hoy') : (is51a ? 'Pendiente de emisión' : 'Sin carga'),
          }
        } else {
          const isDone = u.phase2Files >= u.phase2Total
          const nextFiles = isDone ? 0 : u.phase2Total
          updated = {
            ...u,
            phase2Files: nextFiles,
            phase2Date: nextFiles > 0 ? 'Actualizado hoy' : 'En plazo técnico',
          }
        }
        // Persistir a Supabase solo para Junín en Hito 1.6
        if (!isPasco && !is17 && !is51a) {
          territoryMonitoringService.updateUgel(updated).catch(console.error)
        }
        return updated
      }),
    )
  }

  // Ciclador de estado Drive Regional ('pendiente' -> 'en_proceso' -> 'completado')
  const handleCycleDriveStatus = (ugelId: string) => {
    setUgels((prev) =>
      prev.map((u) => {
        if (u.id !== ugelId) return u
        const nextStatus: TerritoryStatus = is51a
          ? (u.driveStatus === 'completado' ? 'pendiente' : 'completado')
          : (u.driveStatus === 'completado'
            ? 'pendiente'
            : u.driveStatus === 'pendiente'
              ? 'en_proceso'
              : 'completado')

        const updated: UgelMonitoringV2Row = {
          ...u,
          driveStatus: nextStatus,
          driveFiles: nextStatus === 'completado' ? 1 : 0,
          driveDate:
            nextStatus === 'completado'
              ? (is51a ? 'Difusión acreditada en Drive' : 'Evidencia cargada')
              : (is51a ? 'Sin evidencia de difusión' : nextStatus === 'en_proceso' ? 'En proceso' : 'Sin evidencia'),
        }
        // Persistir a Supabase solo para Junín en Hito 1.6
        if (!isPasco && !is17 && !is51a) {
          territoryMonitoringService.updateUgel(updated).catch(console.error)
        }
        return updated
      }),
    )
  }

  // Ciclador de Direcciones Pedagógicas: Binario (Verde / Rojo sin estado intermedio)
  const handleCycleDirectionStatus = (ugelId: string, code: DirectionCode) => {
    const applicableDirs = UGEL_APPLICABLE_DIRECTIONS[ugelId] || []
    if (!applicableDirs.includes(code)) return // No aplica a esta UGEL

    setUgels((prev) =>
      prev.map((u) => {
        if (u.id !== ugelId) return u
        const current = u.directions[code] || 'pendiente'
        const next: TerritoryStatus = current === 'completado' ? 'pendiente' : 'completado'
        const nextDirections = {
          ...u.directions,
          [code]: next,
        }
        const { status: nextDriveStatus } = computeUgelDirectionStatus({
          ...u,
          directions: nextDirections,
        })
        const updated: UgelMonitoringV2Row = {
          ...u,
          directions: nextDirections,
          driveStatus: nextDriveStatus,
          driveFiles: nextDriveStatus === 'completado' ? 1 : 0,
        }
        // Persistir a Supabase solo para Junín en Hito 1.6
        if (!isPasco && !is17 && !is51a) {
          territoryMonitoringService.updateUgel(updated).catch(console.error)
        }
        return updated
      }),
    )
  }

  // Guardar fecha y hora de entrega en Drive
  const handleSaveDriveDelivery = (newDateTime: string, newStatus?: TerritoryStatus) => {
    if (!editingDriveDateTarget) return
    const { ugelId } = editingDriveDateTarget
    setUgels((prev) =>
      prev.map((u) => {
        if (u.id !== ugelId) return u
        const st = newStatus || (newDateTime && newDateTime !== 'Sin evidencia' ? 'completado' : u.driveStatus)
        const updated: UgelMonitoringV2Row = {
          ...u,
          driveDate: newDateTime,
          driveStatus: st,
          driveFiles: st === 'completado' ? 1 : 0,
        }
        // Persistir a Supabase solo para Junín en Hito 1.6
        if (!isPasco && !is17 && !is51a) {
          territoryMonitoringService.updateUgel(updated).catch(console.error)
        }
        return updated
      }),
    )
    setEditingDriveDateTarget(null)
  }

  return (
    <div className="space-y-6 pb-36 print:space-y-3 print:pb-0 font-['DM_Sans',sans-serif] text-slate-800 antialiased">
      {/* ════════════════════════════════════════════════════════════════════════
          1. CABECERA INSTITUCIONAL + FILTROS EN ESCALA DE GRISES Y BLANCOS
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-1 w-6 bg-[#dc2626] rounded-full" />
              <span className="text-[11.5px] font-bold uppercase tracking-wider text-slate-500">
                DISTRIBUCIÓN DE MATERIALES EDUCATIVOS · DOTACIÓN 2027
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Reporte regional de cumplimiento
            </h2>
            <p className="text-[13px] font-semibold text-slate-600 mt-0.5">
              DRE {isPasco ? 'Pasco' : 'Junín'} – {is51a ? 'Solicitud de Personal de Apoyo a COGECO en II.EE. (Hito 5.1a - OM 00032-2026-MINEDU)' : is17 ? 'Acondicionamiento de Almacenes y Contratos de Transporte (Actividad 1.7)' : 'Elaboración del CDL en MC SIGA (Actividad 1.6)'}
            </p>
          </div>

          <div className="text-right text-[11px] text-slate-400 font-medium">
            <span>Última actualización: </span>
            <strong className="text-slate-700 font-bold">{is51a ? '30 oct. 2026' : is17 ? '15 nov. 2026' : '22 oct. 2026'}</strong>
          </div>
        </div>

        {/* BARRA DE FILTROS SOBRIA (ESCALA DE GRISES Y BLANCOS - ESTILO LÁMINA OFICIAL) */}
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

          {/* N2: Región */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-slate-500">Región:</span>
            <select
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value)
                setSelectedUgelFilter('todas')
              }}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-800 shadow-2xs outline-none cursor-pointer focus:border-slate-400"
            >
              <option value="Región Junín (13 UGEL)">Junín (13 UGEL)</option>
              <option value="Región Pasco (5 UGEL)">{is51a ? 'Pasco (4 UGEL)' : 'Pasco (5 UGEL)'}</option>
              <option value="Región Cusco (14 UGEL)">Cusco (14 UGEL)</option>
              <option value="Lima Provincias (9 UGEL)">Lima Provincias (9 UGEL)</option>
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
              <option value="todas">Todas las {ugels.length} {isPasco ? 'unidades' : 'UGEL'} ({isPasco ? 'Pasco' : 'Junín'})</option>
              {ugels.map((u) => {
                const displayName = formatUgelDisplayName(u.name)
                return (
                  <option key={u.id} value={u.id}>
                    {displayName.startsWith('DRE') ? displayName : `UGEL ${displayName}`}
                  </option>
                )
              })}
            </select>
          </div>

          <span className="text-slate-300">/</span>

          {/* N4: Hito (Selector para Hito 1.6 vs Hito 5.1a vs Hito 1.7) */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-slate-500">Hito:</span>
            <select
              value={selectedHito}
              onChange={(e) => handleSelectHito(e.target.value as '1.6' | '1.7' | '5.1a')}
              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-900 shadow-2xs outline-none cursor-pointer focus:border-slate-400"
            >
              <option value="1.6">Hito 1.6 – Elaboración del CDL en MC SIGA</option>
              <option value="5.1a">Hito 5.1a – Personal de Apoyo II.EE. (Oficio y Difusión)</option>
              <option value="1.7">Hito 1.7 – Acondicionamiento y Transporte</option>
            </select>
          </div>

          <span className="text-slate-300">/</span>

          {/* N5: Gestor asignado */}
          <div className="flex items-center gap-1.5">
            <span className="text-[10.5px] font-bold text-slate-500">Gestor de Campo:</span>
            <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-bold text-slate-700 shadow-2xs">
              Carlos Sandoval (Gestor de Materiales)
            </span>
          </div>
        </div>

        {/* Hito Banner sutil */}
        <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-100/70 border border-slate-200/80 px-3 py-2 text-[12px]">
          <span className="inline-flex items-center rounded-md bg-slate-900 px-2 py-0.5 text-[11px] font-black text-white">
            {is51a ? 'HITO 5.1a' : is17 ? 'HITO 1.7' : 'HITO 1.6'}
          </span>
          <span className="font-bold text-slate-800">
            {is51a
              ? 'Envío de oficio de UGEL solicitando listado de personal de apoyo a COGECO en II.EE. (Periodo Vacacional)'
              : is17
                ? 'Acondicionamiento de Almacenes y Contratos de Transporte'
                : 'Elaboración del Cuadro de Distribución Local en el MC SIGA'}
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="text-slate-600 font-medium text-[11.5px]">
            {is51a ? 'Fecha de Corte:' : 'Drive preliminar:'} <strong className="text-slate-900">{is51a ? '30/10/2026' : is17 ? 'Corte 15/11/2026' : 'Corte 22/10/2026'}</strong>
          </span>
          <span className="hidden sm:inline text-slate-300">·</span>
          <span className="text-slate-600 font-medium text-[11.5px]">
            {is51a ? (
              <a
                href={DRIVE_URL_HITO_51A}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-bold text-blue-700 hover:underline"
              >
                Carpeta Drive Regional Hito 5.1a <ExternalLink size={12} />
              </a>
            ) : (
              <span>Cierre RAR: <strong className="text-slate-900">{is17 ? 'Hasta 25/11/2026' : 'Hasta 26/10/2026'}</strong></span>
            )}
          </span>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════════════════════
          1.1. TARJETA INDEPENDIENTE CON CONTENEDOR BLANCO ELEGANTE
          ════════════════════════════════════════════════════════════════════════ */}
      <section className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs">
        <div className="overflow-x-auto rounded-xl border border-slate-200 [scrollbar-width:thin]">
          <table className={`w-full ${ugels.length <= 6 ? 'min-w-[780px]' : 'min-w-[1360px]'} border-collapse text-center table-fixed`}>
            <thead>
              <tr className="border-b border-slate-200 text-xs">
                <th className={`bg-[#142d54] text-white font-black text-[15px] py-4 px-4 text-left ${ugels.length <= 6 ? 'w-80 min-w-[320px] max-w-[340px]' : 'w-56 min-w-[210px] max-w-[230px]'}`}>
                  Etapa
                </th>
                {ugels.map((u) => {
                  const shortName = formatUgelDisplayName(u.name)
                  return (
                    <th
                      key={u.id}
                      className={`bg-[#f0f4f9] text-slate-900 font-black text-[15px] py-3.5 px-2 border-l border-white text-center ${ugels.length <= 6 ? 'w-52 min-w-[170px]' : 'w-[92px] min-w-[92px] max-w-[92px]'} truncate tracking-tight`}
                      title={u.name}
                    >
                      {shortName}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {is51a ? (
                <>
                  {/* FILA 1 HITO 5.1a: OFICIO MÚLTIPLE DIRIGIDO A II.EE. */}
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className={`bg-[#f8fafc] px-3.5 py-4 text-left border-r border-slate-100 ${ugels.length <= 6 ? 'w-80 min-w-[280px] max-w-[320px]' : 'w-56 min-w-[210px] max-w-[230px]'}`}>
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1055b8] text-white text-[15px] font-black shadow-xs">
                          1
                        </span>
                        <div className="min-w-0">
                          <span className="block text-[16px] font-black text-slate-900 leading-snug whitespace-nowrap">Oficio Múltiple</span>
                          <span className="block text-[12.5px] font-bold text-slate-600 leading-snug whitespace-nowrap mt-0.5">
                            A directores de II.EE.
                          </span>
                        </div>
                      </div>
                    </td>
                    {ugels.map((u) => {
                      const hasOficio = u.phase1Files >= 1
                      return (
                        <td key={`om-${u.id}`} className={`py-3.5 px-1 text-center border-l border-slate-100 ${ugels.length <= 6 ? 'w-52 min-w-[170px]' : 'w-[92px] min-w-[92px] max-w-[92px]'}`}>
                          <button
                            type="button"
                            onClick={() => handleCycleUgelFiles(u.id, 1)}
                            className="mx-auto flex items-center justify-center p-1 rounded-2xl hover:bg-slate-100/90 transition-all cursor-pointer group"
                            title={`Oficio Múltiple: ${u.name} · ${hasOficio ? 'Oficio emitido y subido (SÍ)' : 'Pendiente de emisión (NO)'} (Clic para alternar)`}
                          >
                            <span className={`grid h-11 w-11 place-items-center rounded-full text-white shadow-xs transition-transform group-hover:scale-110 ${
                              hasOficio ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
                            }`}>
                              {hasOficio ? <Check size={24} strokeWidth={3.2} /> : <X size={24} strokeWidth={3.2} />}
                            </span>
                          </button>
                        </td>
                      )
                    })}
                  </tr>

                  {/* FILA 2 HITO 5.1a: SUSTENTO DE MEDIOS DE DIFUSIÓN */}
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className={`bg-[#f8fafc] px-3.5 py-4 text-left border-r border-slate-100 ${ugels.length <= 6 ? 'w-80 min-w-[280px] max-w-[320px]' : 'w-56 min-w-[210px] max-w-[230px]'}`}>
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1055b8] text-white text-[15px] font-black shadow-xs">
                          2
                        </span>
                        <div className="min-w-0">
                          <span className="block text-[16px] font-black text-slate-900 leading-snug whitespace-nowrap">Sustento Difusión</span>
                          <span className="block text-[12.5px] font-bold text-slate-600 leading-snug whitespace-nowrap mt-0.5">
                            Redes / WhatsApp / Web
                          </span>
                        </div>
                      </div>
                    </td>
                    {ugels.map((u) => {
                      const hasDifusion = u.driveStatus === 'completado'
                      return (
                        <td key={`dif-${u.id}`} className={`py-3.5 px-1 text-center border-l border-slate-100 ${ugels.length <= 6 ? 'w-52 min-w-[170px]' : 'w-[92px] min-w-[92px] max-w-[92px]'}`}>
                          <button
                            type="button"
                            onClick={() => handleCycleDriveStatus(u.id)}
                            className="mx-auto flex items-center justify-center p-1 rounded-2xl hover:bg-slate-100/90 transition-all cursor-pointer group"
                            title={`Sustento Difusión: ${u.name} · ${hasDifusion ? 'Difusión acreditada en Drive (SÍ)' : 'Sin evidencia en Drive (NO)'} (Clic para alternar)`}
                          >
                            <span className={`grid h-11 w-11 place-items-center rounded-full text-white shadow-xs transition-transform group-hover:scale-110 ${
                              hasDifusion ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
                            }`}>
                              {hasDifusion ? <Check size={24} strokeWidth={3.2} /> : <X size={24} strokeWidth={3.2} />}
                            </span>
                          </button>
                        </td>
                      )
                    })}
                  </tr>
                </>
              ) : (
                <>
                  {/* FILA 1: FASE 1 (REGISTRO MC SIGA) */}
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className={`bg-[#f8fafc] px-3.5 py-4 text-left border-r border-slate-100 ${ugels.length <= 6 ? 'w-80 min-w-[280px] max-w-[320px]' : 'w-56 min-w-[210px] max-w-[230px]'}`}>
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1055b8] text-white text-[15px] font-black shadow-xs">
                          1
                        </span>
                        <div className="min-w-0">
                          <span className="block text-[17px] font-black text-slate-900 leading-tight">Fase 1</span>
                          <span className="block text-[13px] font-bold text-slate-600 leading-tight mt-0.5 truncate">Registro MC SIGA</span>
                        </div>
                      </div>
                    </td>
                    {ugels.map((u) => {
                      const isDone = u.phase1Files >= u.phase1Total
                      return (
                        <td key={`f1-${u.id}`} className={`py-3.5 px-1 text-center border-l border-slate-100 ${ugels.length <= 6 ? 'w-52 min-w-[170px]' : 'w-[92px] min-w-[92px] max-w-[92px]'}`}>
                          <button
                            type="button"
                            onClick={() => handleCycleUgelFiles(u.id, 1)}
                            className="mx-auto flex items-center justify-center p-1 rounded-2xl hover:bg-slate-100/90 transition-all cursor-pointer group"
                            title={`Fase 1: ${u.name} · ${isDone ? 'Carga inicial completada' : 'Pendiente de carga'} (Clic para alternar)`}
                          >
                            <span className={`grid h-11 w-11 place-items-center rounded-full text-white shadow-xs transition-transform group-hover:scale-110 ${
                              isDone ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
                            }`}>
                              {isDone ? <Check size={24} strokeWidth={3.2} /> : <X size={24} strokeWidth={3.2} />}
                            </span>
                          </button>
                        </td>
                      )
                    })}
                  </tr>

                  {/* FILA 2: DRIVE (EVIDENCIA DECLARATIVA) */}
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className={`bg-[#f8fafc] px-3.5 py-4 text-left border-r border-slate-100 ${ugels.length <= 6 ? 'w-80 min-w-[280px] max-w-[320px]' : 'w-56 min-w-[210px] max-w-[230px]'}`}>
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1055b8] text-white text-[15px] font-black shadow-xs">
                          2
                        </span>
                        <div className="min-w-0">
                          <span className="block text-[17px] font-black text-slate-900 leading-tight">Drive</span>
                          <span className="block text-[13px] font-bold text-slate-600 leading-tight mt-0.5 truncate">Evidencia declarativa</span>
                        </div>
                      </div>
                    </td>
                    {ugels.map((u) => {
                      const dirInfo = computeUgelDirectionStatus(u)
                      const st = dirInfo.status
                      const ratioText = st === 'completado' ? 'Completado' : st === 'en_proceso' ? 'En proceso' : 'Pendiente'
                      return (
                        <td key={`dr-${u.id}`} className={`py-3.5 px-1 text-center border-l border-slate-100 ${ugels.length <= 6 ? 'w-52 min-w-[170px]' : 'w-[92px] min-w-[92px] max-w-[92px]'}`}>
                          <div
                            className="mx-auto flex items-center justify-center p-1"
                            title={`Drive: ${u.name} · ${ratioText} (${dirInfo.pct}% de direcciones)`}
                          >
                            <span className={`grid h-11 w-11 place-items-center rounded-full text-white shadow-xs ${
                              st === 'completado' ? 'bg-[#16a34a]' : st === 'en_proceso' ? 'bg-[#f59e0b]' : 'bg-[#dc2626]'
                            }`}>
                              {st === 'completado' ? <Check size={24} strokeWidth={3.2} /> : st === 'en_proceso' ? <Clock size={23} strokeWidth={2.8} /> : <X size={24} strokeWidth={3.2} />}
                            </span>
                          </div>
                        </td>
                      )
                    })}
                  </tr>

                  {/* FILA 3: FASE 2 (RAR OFICIAL) */}
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className={`bg-[#f8fafc] px-3.5 py-4 text-left border-r border-slate-100 ${ugels.length <= 6 ? 'w-80 min-w-[280px] max-w-[320px]' : 'w-56 min-w-[210px] max-w-[230px]'}`}>
                      <div className="flex items-center gap-3">
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#1055b8] text-white text-[15px] font-black shadow-xs">
                          3
                        </span>
                        <div className="min-w-0">
                          <span className="block text-[17px] font-black text-slate-900 leading-tight">Fase 2</span>
                          <span className="block text-[13px] font-bold text-slate-600 leading-tight mt-0.5 truncate">RAR oficial</span>
                        </div>
                      </div>
                    </td>
                    {ugels.map((u) => {
                      const isDone = u.phase2Files >= u.phase2Total
                      return (
                        <td key={`f2-${u.id}`} className={`py-3.5 px-1 text-center border-l border-slate-100 ${ugels.length <= 6 ? 'w-52 min-w-[170px]' : 'w-[92px] min-w-[92px] max-w-[92px]'}`}>
                          <button
                            type="button"
                            onClick={() => handleCycleUgelFiles(u.id, 2)}
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
                </>
              )}
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
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-slate-400">TOTAL DE {isPasco ? 'UNIDADES' : 'UGEL'}</span>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900 tabular-nums">{ugelStats.total}</span>
              <span className="text-[13px] font-semibold text-slate-500">Región {isPasco ? 'Pasco' : 'Junín'}</span>
            </div>
          </div>
        </div>

        {/* UGEL QUE COMPLETAN LAS ETAPAS */}
        <div className="flex items-center gap-3.5 rounded-2xl border border-emerald-200/90 bg-[#f4fbf7] p-4.5 shadow-2xs">
          <div className="grid h-12 w-12 place-items-center rounded-full bg-emerald-100 text-emerald-700">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#16a34a] text-white">
              <Check size={16} strokeWidth={3} />
            </span>
          </div>
          <div>
            <span className="text-[11.5px] font-bold uppercase tracking-wider text-emerald-800">
              {is51a ? 'UGEL QUE COMPLETAN LAS 2 ETAPAS' : 'UGEL QUE COMPLETAN LAS 3 ETAPAS'}
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
              {is51a ? 'UGEL EN PROCESO (1 DE 2)' : 'UGEL EN PROCESO'}
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
              {is51a ? 'UGEL PENDIENTES (0 DE 2)' : 'UGEL PENDIENTES'}
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
        {/* Card 1: Avance por fase / criterios */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[340px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-snug">
                {is51a ? `Avance de 2 Criterios por ${isPasco ? 'Unidad' : 'UGEL'}` : `Avance de 3 Fases por ${isPasco ? 'Unidad' : 'UGEL'}`}
              </h3>
              <p className="text-[13px] font-semibold text-slate-500 mt-0.5 leading-normal">
                {is51a
                  ? `Distribución de las ${ugelStats.total} ${isPasco ? 'unidades' : 'UGEL'} en Oficio y Sustento Drive`
                  : `Distribución de las ${ugelStats.total} ${isPasco ? 'unidades' : 'UGEL'} en Fase 1, Drive y Fase 2`}
              </p>
            </div>
            <span className="rounded-md bg-blue-100 px-2.5 py-1 text-[11px] font-black text-blue-700 shrink-0">
              {is51a ? '2 Criterios Hito 5.1a' : '3 Fases de Control'}
            </span>
          </div>

          <div className="my-auto space-y-4 py-4">
            {(is51a
              ? [
                  {
                    label: 'Oficio M.',
                    sublabel: 'Personal Apoyo',
                    ok: ugelStats.p1Completed,
                    prog: 0,
                    pend: ugelStats.p1Pending,
                  },
                  {
                    label: 'Sustento',
                    sublabel: 'Difusión Drive',
                    ok: ugelStats.driveCompleted,
                    prog: 0,
                    pend: ugelStats.drivePending,
                  },
                ]
              : [
                  {
                    label: 'Fase 1',
                    sublabel: 'MC SIGA',
                    ok: ugelStats.p1Completed,
                    prog: ugelStats.p1InProgress,
                    pend: ugelStats.p1Pending,
                  },
                  {
                    label: 'Drive Reg.',
                    sublabel: is17 ? 'Almacén 15/11' : 'Excel 22/10',
                    ok: ugelStats.driveCompleted,
                    prog: ugelStats.driveInProgress,
                    pend: ugelStats.drivePending,
                  },
                  {
                    label: 'Fase 2',
                    sublabel: is17 ? 'Contratos 25/11' : 'RAR Oficial',
                    ok: ugelStats.p2Completed,
                    prog: ugelStats.p2InProgress,
                    pend: ugelStats.p2Pending,
                  },
                ]
            ).map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <div className="w-20 shrink-0 text-left">
                  <span className="block text-[13.5px] font-black text-slate-900 leading-none">
                    {f.label}
                  </span>
                  <span className="block text-[11.5px] font-semibold text-slate-500 leading-tight mt-1">
                    {f.sublabel}
                  </span>
                </div>

                <div className="relative flex-1">
                  <div className="flex h-9 overflow-hidden rounded-xl bg-slate-100 shadow-inner">
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
                  <span className="text-xs font-black text-slate-900 tabular-nums">{ugelStats.total}</span>
                  <span className="block text-[8.5px] font-bold text-slate-400 uppercase leading-none">UGEL</span>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-3 text-[12px] font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              <span>Completado</span>
            </div>
            {!is51a && (
              <div className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span>En proceso</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-600" />
              <span>Pendiente</span>
            </div>
          </div>
        </div>

        {/* Card 2: Estado global */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[340px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-snug">
                {is51a ? 'Consolidado Global Hito 5.1a' : 'Consolidado Global de 3 Fases'}
              </h3>
              <p className="text-[13px] font-semibold text-slate-500 mt-0.5 leading-normal">
                Cumplimiento regional integrado de las {ugelStats.total} {isPasco ? 'unidades' : 'UGEL'}
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-600 shrink-0">
              {is51a ? 'Hito 5.1a' : 'Total 3 Fases'}
            </span>
          </div>

          <div className="my-auto flex items-center justify-center gap-6 py-3">
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
                  strokeDasharray={`${(ugelStats.completed / ugelStats.total) * 326.72} 326.72`}
                  strokeDashoffset="0"
                />
                <circle
                  cx="68"
                  cy="68"
                  r="52"
                  fill="transparent"
                  stroke="#fbbf24"
                  strokeWidth="18"
                  strokeDasharray={`${(ugelStats.inProgress / ugelStats.total) * 326.72} 326.72`}
                  strokeDashoffset={`-${(ugelStats.completed / ugelStats.total) * 326.72}`}
                />
                <circle
                  cx="68"
                  cy="68"
                  r="52"
                  fill="transparent"
                  stroke="#dc2626"
                  strokeWidth="18"
                  strokeDasharray={`${(ugelStats.pending / ugelStats.total) * 326.72} 326.72`}
                  strokeDashoffset={`-${((ugelStats.completed + ugelStats.inProgress) / ugelStats.total) * 326.72}`}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-black text-slate-900 leading-none tabular-nums">
                  {ugelStats.total}
                </span>
                <span className="text-[10.5px] font-bold uppercase text-slate-400 leading-tight">
                  {isPasco ? 'UNIDADES' : 'UGEL'}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-emerald-600" />
                <span className="font-bold text-slate-800 text-[12.5px]">Completado ({ugelStats.completed})</span>
                <span className="text-slate-500 font-bold">— {ugelStats.completedPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="font-bold text-slate-800 text-[12.5px]">En proceso ({ugelStats.inProgress})</span>
                <span className="text-slate-500 font-bold">— {ugelStats.inProgressPct}%</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-600" />
                <span className="font-bold text-slate-800 text-[12.5px]">Pendiente ({ugelStats.pending})</span>
                <span className="text-slate-500 font-bold">— {ugelStats.pendingPct}%</span>
              </div>
            </div>
          </div>

          <div className="text-center border-t border-slate-100 pt-2.5 text-[11.5px] font-semibold text-slate-400">
            Resumen porcentual de cumplimiento
          </div>
        </div>

        {/* Card 3: Avance por dirección pedagógica (o Brecha Operativa en Hito 5.1a) */}
        <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-2xs min-h-[340px]">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div>
              <h3 className="text-[16px] font-black text-slate-900 tracking-tight leading-snug">
                {is51a ? 'Brecha y Diagnóstico Operativo' : 'Avance por Direcciones en 3 Fases'}
              </h3>
              <p className="text-[13px] font-semibold text-slate-500 mt-0.5 leading-normal">
                {is51a
                  ? 'Estado combinado de los 2 criterios exigidos'
                  : `Progreso de las ${ugelStats.directionStats.length} líneas pedagógicas en las 3 fases`}
              </p>
            </div>
            <span className="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-extrabold text-slate-600 shrink-0">
              {is51a ? 'Diagnóstico · 5.1a' : 'Líneas · 3 Fases'}
            </span>
          </div>

          <div className="my-auto space-y-3 py-3">
            {is51a ? (
              [
                {
                  label: 'Ambos Requisitos OK',
                  sub: 'Oficio cursado y difusión acreditada',
                  count: ugels.filter((u) => u.phase1Files >= 1 && u.driveStatus === 'completado').length,
                  barColor: 'bg-emerald-600',
                  textColor: 'text-emerald-700',
                  badge: 'Completado',
                  badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                },
                {
                  label: 'Solo Oficio Múltiple',
                  sub: 'Falta adjuntar evidencia de difusión',
                  count: ugels.filter((u) => u.phase1Files >= 1 && u.driveStatus !== 'completado').length,
                  barColor: 'bg-amber-500',
                  textColor: 'text-amber-700',
                  badge: 'En proceso',
                  badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
                },
                {
                  label: 'Solo Difusión Acreditada',
                  sub: 'Falta remitir documento del Oficio',
                  count: ugels.filter((u) => u.phase1Files < 1 && u.driveStatus === 'completado').length,
                  barColor: 'bg-sky-500',
                  textColor: 'text-sky-700',
                  badge: 'En proceso',
                  badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
                },
                {
                  label: 'Sin Evidencias Registradas',
                  sub: 'Brecha crítica: 0 de 2 requisitos',
                  count: ugels.filter((u) => u.phase1Files < 1 && u.driveStatus !== 'completado').length,
                  barColor: 'bg-rose-600',
                  textColor: 'text-rose-700',
                  badge: 'Pendiente',
                  badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
                },
              ].map((item) => {
                const pct = ugels.length > 0 ? Math.round((item.count / ugels.length) * 100) : 0
                return (
                  <div key={item.label} className="space-y-1 text-xs">
                    <div className="flex items-center justify-between font-bold">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="text-slate-800 font-extrabold">{item.label}</span>
                        <span className={`hidden sm:inline-block rounded px-1.5 py-0.2 text-[10px] font-black border ${item.badgeColor}`}>
                          {item.badge}
                        </span>
                      </div>
                      <span className="tabular-nums text-slate-900 font-black shrink-0">
                        {item.count} / {ugels.length} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 shadow-inner">
                      <div style={{ width: `${pct}%` }} className={`h-full rounded-full transition-all ${item.barColor}`} />
                    </div>
                  </div>
                )
              })
            ) : (
              ugelStats.directionStats.map((d) => (
                <div key={d.code} className="flex items-center gap-2.5 text-xs">
                  <span className="w-13 font-black text-slate-800 text-[12.5px]">{d.code}</span>
                  <div className="relative flex-1">
                    <div className="flex h-4 overflow-hidden rounded-full bg-slate-100 shadow-inner">
                      <div style={{ width: `${(d.ok / d.total) * 100}%` }} className="bg-emerald-600" />
                      <div style={{ width: `${(d.prog / d.total) * 100}%` }} className="bg-amber-400" />
                      <div style={{ width: `${(d.pend / d.total) * 100}%` }} className="bg-rose-600" />
                    </div>
                  </div>
                  <span className="w-11 text-right font-black text-slate-900 tabular-nums text-[12.5px]">
                    {d.pct}%
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 tabular-nums">
                    {d.ok}/{d.total}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 pt-2.5 text-[12px] text-slate-500 font-bold">
            <span>{is51a ? 'Cuello de Botella Operativo' : `${ugelStats.directionStats.length} Direcciones evaluadas`}</span>
            <span>
              {is51a
                ? `${ugels.filter((u) => u.phase1Files < 1 && u.driveStatus !== 'completado').length} críticas sin avance`
                : `${ugelStats.total} ${isPasco ? 'unidades Pasco' : 'UGEL Junín'}`}
            </span>
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
                Tablero de Control por UGEL – Región {isPasco ? 'Pasco' : 'Junín'} ({is51a ? 'Hito 5.1a: 2 Criterios' : '3 Etapas'})
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
              {activeDirectionCodes.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla responsive con todas las celdas cliqueables y encabezado sticky */}
        <div className="overflow-auto max-h-[75vh] [scrollbar-width:thin] relative">
          <table className="w-full min-w-[1120px] border-collapse text-left text-[13px]">
            <thead className="sticky top-0 z-20 shadow-xs">
              <tr className="border-b border-slate-200 text-[12px] font-black text-slate-700">
                <th rowSpan={2} className="sticky top-0 z-20 bg-slate-100 px-3 py-3 text-center w-12 text-[12px]">
                  N°
                </th>
                <th rowSpan={2} className="sticky top-0 z-20 bg-slate-100 px-3.5 py-3 w-40 text-[13px] text-slate-900">
                  UGEL
                </th>
                {/* BLOQUE FASE 1 */}
                <th className="sticky top-0 z-20 border-x border-slate-200 px-3 py-2 text-center bg-blue-50 text-blue-950 font-black">
                  Fase 1 (MC SIGA Carga Inicial)
                </th>
                {/* BLOQUE FASE 2 */}
                <th className="sticky top-0 z-20 border-r border-slate-200 px-3 py-2 text-center bg-indigo-50 text-indigo-950 font-black">
                  Fase 2 (Oficial RAR)
                </th>
                {/* BLOQUE UNIFICADO: DIRECCIONES Y EVIDENCIA DRIVE */}
                <th colSpan={activeDirectionCodes.length + 2} className="sticky top-0 z-20 border-r border-slate-200 px-3 py-2 text-center bg-amber-50 text-amber-950 font-black">
                  Direcciones y Evidencia Drive Regional (Declarativo 22/10)
                </th>
                {/* BLOQUE ESTADO GENERAL */}
                <th rowSpan={2} className="sticky top-0 z-20 bg-slate-100 px-3 py-3 text-center w-32 font-black text-slate-800">
                  Estado general
                </th>
                <th rowSpan={2} className="sticky top-0 z-20 bg-slate-100 px-3.5 py-3 text-right w-24">
                  Acción
                </th>
              </tr>
              <tr className="border-b border-slate-200 text-[11.5px] font-bold text-slate-600">
                <th className="sticky top-[37px] z-20 bg-blue-50/95 border-l border-slate-200 px-2.5 py-1.5 text-center">Estado</th>
                <th className="sticky top-[37px] z-20 bg-indigo-50/95 border-r border-slate-200 px-2.5 py-1.5 text-center">RAR</th>
                {/* 1°: Las Direcciones Pedagógicas */}
                {activeDirectionCodes.map((code) => (
                  <th key={code} className="sticky top-[37px] z-20 bg-amber-50/95 px-1.5 py-1.5 text-center truncate max-w-[65px]" title={code}>
                    {code}
                  </th>
                ))}
                {/* 2°: Luego Estado y Fecha entrega */}
                <th className="sticky top-[37px] z-20 bg-amber-50/95 border-l border-slate-200 px-2.5 py-1.5 text-center">Estado</th>
                <th className="sticky top-[37px] z-20 bg-amber-50/95 border-r border-slate-200 px-2.5 py-1.5 text-center">Fecha entrega</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUgels.map((u) => {
                const isP1Done = u.phase1Files >= u.phase1Total
                const isP2Done = u.phase2Files >= u.phase2Total
                const computedDir = computeUgelDirectionStatus(u)
                const genStatus = computeUgelGeneralStatusV2(u)

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
                        className="hover:underline cursor-pointer text-left font-black text-blue-950 text-[13.5px] tracking-tight"
                      >
                        {formatUgelDisplayName(u.name)}
                      </button>
                    </td>

                    {/* FASE 1: SOLO ESTADO (FECHA OCULTA, VISIBLE EN DETALLE DERECHO) */}
                    <td className="border-l border-slate-100 px-2.5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 1)}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 hover:bg-blue-100/60 transition-colors cursor-pointer text-left"
                        title={`Fase 1: ${isP1Done ? 'Completado' : 'Pendiente'} (Clic para alternar)`}
                      >
                        <span className={`grid h-4.5 w-4.5 place-items-center rounded-full text-white ${
                          isP1Done ? 'bg-[#16a34a]' : 'bg-[#dc2626]'
                        }`}>
                          {isP1Done ? <Check size={11} strokeWidth={3} /> : <X size={11} strokeWidth={3} />}
                        </span>
                        <span className={`font-extrabold text-[12.5px] capitalize ${isP1Done ? 'text-slate-800' : 'text-rose-700'}`}>
                          {isP1Done ? 'Completado' : 'Pendiente'}
                        </span>
                      </button>
                    </td>

                    {/* FASE 2: SOLO ESTADO RAR (FECHA LÍMITE OCULTA, VISIBLE EN DETALLE DERECHO) */}
                    <td className="border-r border-slate-100 px-2.5 py-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleCycleUgelFiles(u.id, 2)}
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

                    {/* 1°: DIRECCIONES OFICIALES */}
                    {activeDirectionCodes.map((code) => {
                      const applicableDirs = UGEL_APPLICABLE_DIRECTIONS[u.id] || []
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

                    {/* 2°: ESTADO CALCULADO AUTOMÁTICAMENTE SEGÚN GRADO DE AVANCE DE DIRECCIONES */}
                    <td className="border-l border-slate-100 px-2.5 py-3 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-left ${
                          computedDir.status === 'completado'
                            ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                            : computedDir.status === 'en_proceso'
                              ? 'bg-amber-100 text-amber-900 border border-amber-200'
                              : 'bg-rose-100 text-rose-900 border border-rose-200'
                        }`}
                        title={`Avance de Direcciones: ${computedDir.pct}% (${computedDir.okCount}/${computedDir.totalDirs})`}
                      >
                        <span
                          className={`grid h-4.5 w-4.5 place-items-center rounded-full text-white ${
                            computedDir.status === 'completado'
                              ? 'bg-[#16a34a]'
                              : computedDir.status === 'en_proceso'
                                ? 'bg-[#f59e0b]'
                                : 'bg-[#dc2626]'
                          }`}
                        >
                          {computedDir.status === 'completado' ? (
                            <Check size={11} strokeWidth={3} />
                          ) : computedDir.status === 'en_proceso' ? (
                            <Clock size={11} strokeWidth={2.6} />
                          ) : (
                            <X size={11} strokeWidth={3} />
                          )}
                        </span>
                        <span className="font-extrabold text-[12.5px] capitalize">
                          {computedDir.status.replace('_', ' ')}
                        </span>
                      </span>
                    </td>

                    {/* 3°: FECHA ENTREGA EN DRIVE (INTERACTIVA CON POP-UP) */}
                    <td className="border-r border-slate-100 px-2.5 py-3 text-[12px] text-slate-600 font-medium tabular-nums">
                      <button
                        type="button"
                        onClick={() => {
                          const parsed = parseDriveDateTime(u.driveDate)
                          setDrivePickerDate(parsed.date)
                          setDrivePickerTime(parsed.time)
                          setDrivePickerStatus(computedDir.status)
                          setEditingDriveDateTarget({
                            ugelId: u.id,
                            ugelName: u.name,
                            currentDate: u.driveDate,
                          })
                        }}
                        className="hover:text-blue-600 hover:underline cursor-pointer flex items-center gap-1 text-left"
                        title="Clic para registrar fecha y hora de entrega en Drive"
                      >
                        <Calendar size={12} className="text-slate-400 shrink-0" />
                        <span>{u.driveDate}</span>
                      </button>
                    </td>

                    {/* ESTADO GENERAL */}
                    <td className="border-l border-slate-100 px-3 py-3 text-center">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-extrabold ${
                        genStatus === 'completado' ? 'bg-emerald-100 text-emerald-800' : genStatus === 'en_proceso' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {genStatus === 'completado' ? 'Completado' : genStatus === 'en_proceso' ? 'En proceso' : 'Pendiente'}
                      </span>
                    </td>

                    {/* ACCIÓN DETALLE */}
                    <td className="px-3.5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setInspectedUgel(u)}
                        className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-[12px] font-extrabold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
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

      {/* ── SLIDE-OVER DRAWER LATERAL DERECHO DE INSPECCIÓN DE UGEL EN V2 ── */}
      {inspectedUgel && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-[1px] print:hidden">
          <div className="flex h-full w-full max-w-lg flex-col bg-white shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Cabecera del Panel */}
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <span className="text-[11.5px] font-bold uppercase tracking-wider text-[var(--hub-brand,#d9532f)]">
                  Monitoreo de Campo · Región {isPasco ? 'Pasco' : 'Junín'}
                </span>
                <h3 className="text-xl font-black text-slate-900 tracking-tight mt-0.5">
                  {formatUgelDisplayName(inspectedUgel.name).startsWith('DRE')
                    ? formatUgelDisplayName(inspectedUgel.name)
                    : `UGEL ${formatUgelDisplayName(inspectedUgel.name)}`}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Amarrado a: {is17 ? 'Hito 1.7 · Acondicionamiento de Almacenes y Contratos de Transporte' : 'Hito 1.6 · Elaboración del Cuadro de Distribución Local en el MC SIGA'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setInspectedUgel(null)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 cursor-pointer transition-colors"
                title="Cerrar panel"
              >
                <X size={20} />
              </button>
            </div>

            {/* Contenido con Scroll */}
            <div className="flex-1 space-y-5 overflow-y-auto p-5">
              {/* Control de las 3 Etapas para esta UGEL */}
              <div className="grid grid-cols-3 gap-2.5">
                {/* Fase 1: MC SIGA */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11.5px] font-bold text-slate-700">Fase 1</span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold ${
                        inspectedUgel.phase1Files >= inspectedUgel.phase1Total
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}>
                        {inspectedUgel.phase1Files >= inspectedUgel.phase1Total ? '100% OK' : 'Pendiente'}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-slate-900 tabular-nums">
                        {inspectedUgel.phase1Files >= inspectedUgel.phase1Total ? '3/3' : '0/3'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      Fecha: <strong className="text-slate-700">{inspectedUgel.phase1Date}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleCycleUgelFiles(inspectedUgel.id, 1)
                      setInspectedUgel((prev) => {
                        if (!prev) return null
                        const isDone = prev.phase1Files >= prev.phase1Total
                        const nextFiles = isDone ? 0 : prev.phase1Total
                        return {
                          ...prev,
                          phase1Files: nextFiles,
                          phase1Date: nextFiles > 0 ? 'Actualizado hoy' : 'Sin carga',
                        }
                      })
                    }}
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                  >
                    Alternar estado
                  </button>
                </div>

                {/* Drive Regional (22/10) */}
                <div className="rounded-xl border border-amber-200/90 bg-amber-50/50 p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11.5px] font-bold text-amber-950">Drive (22/10)</span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold ${
                        inspectedUgel.driveStatus === 'completado'
                          ? 'bg-emerald-100 text-emerald-800'
                          : inspectedUgel.driveStatus === 'en_proceso'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                      }`}>
                        {inspectedUgel.driveStatus === 'completado' ? 'OK' : inspectedUgel.driveStatus === 'en_proceso' ? 'Proceso' : 'Pend.'}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-slate-900 tabular-nums">
                        {inspectedUgel.driveStatus === 'completado' ? '1/1' : inspectedUgel.driveStatus === 'en_proceso' ? 'Proceso' : '0/1'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      Fecha: <strong className="text-slate-700">{inspectedUgel.driveDate}</strong>
                    </p>
                  </div>
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
                    className="mt-2 w-full rounded-md border border-amber-300 bg-white py-1 text-[11px] font-bold text-amber-900 hover:bg-amber-100 cursor-pointer shadow-2xs"
                  >
                    Actualizar Drive
                  </button>
                </div>

                {/* Fase 2: RAR Oficial */}
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11.5px] font-bold text-slate-700">Fase 2 (RAR Oficial)</span>
                      <span className={`inline-flex items-center rounded-full px-1.5 py-0.5 text-[9.5px] font-bold ${
                        inspectedUgel.phase2Files >= inspectedUgel.phase2Total
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-700'
                      }`}>
                        {inspectedUgel.phase2Files >= inspectedUgel.phase2Total ? 'Cerrado' : 'En plazo'}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-slate-900 tabular-nums">
                        {inspectedUgel.phase2Files >= inspectedUgel.phase2Total ? '3/3' : '0/3'}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-1">
                      Fecha: <strong className="text-slate-700">{inspectedUgel.phase2Date}</strong>
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      handleCycleUgelFiles(inspectedUgel.id, 2)
                      setInspectedUgel((prev) => {
                        if (!prev) return null
                        const isDone = prev.phase2Files >= prev.phase2Total
                        const nextFiles = isDone ? 0 : prev.phase2Total
                        return {
                          ...prev,
                          phase2Files: nextFiles,
                          phase2Date: nextFiles > 0 ? 'Actualizado hoy' : 'En plazo técnico',
                        }
                      })
                    }}
                    className="mt-2 w-full rounded-md border border-slate-200 bg-white py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs"
                  >
                    Alternar RAR
                  </button>
                </div>
              </div>

              {/* Observación Territorial de Campo */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Observación Territorial:</span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Gestor: <strong>{inspectedUgel.gestorName}</strong>
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  {inspectedUgel.observation}
                </p>
                <div className="pt-1 flex items-center justify-end">
                  <a
                    href={`https://wa.me/${inspectedUgel.gestorPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                  >
                    <MessageCircle size={13} />
                    <span>WhatsApp Gestor ({inspectedUgel.gestorPhone})</span>
                  </a>
                </div>
              </div>

              {/* Estado por Dirección Pedagógica en esta UGEL */}
              <div className="rounded-xl border border-slate-200 p-4 bg-slate-50/60">
                <p className="text-xs font-bold text-slate-800">
                  Checks por Dirección que aplican a {formatUgelDisplayName(inspectedUgel.name).startsWith('DRE') ? formatUgelDisplayName(inspectedUgel.name) : `UGEL ${formatUgelDisplayName(inspectedUgel.name)}`} (clic para alternar)
                </p>
                <div className="mt-3 grid grid-cols-4 sm:grid-cols-7 gap-2 text-center">
                  {activeDirectionCodes.filter((code) => {
                    const applicableDirs = UGEL_APPLICABLE_DIRECTIONS[inspectedUgel.id] || []
                    return applicableDirs.includes(code)
                  }).map((code) => {
                    const st = inspectedUgel.directions[code] || 'pendiente'
                    return (
                      <div
                        key={code}
                        className="flex flex-col items-center gap-1.5 rounded-lg bg-white border border-slate-200/80 p-2 shadow-2xs"
                      >
                        <span className="text-[10px] font-bold text-slate-600 truncate max-w-[50px]">{code}</span>
                        <button
                          type="button"
                          onClick={() => {
                            handleCycleDirectionStatus(inspectedUgel.id, code)
                            setInspectedUgel((prev) => {
                              if (!prev) return null
                              const cur = prev.directions[code] || 'pendiente'
                              const next: TerritoryStatus = cur === 'completado' ? 'pendiente' : 'completado'
                              return {
                                ...prev,
                                directions: {
                                  ...prev.directions,
                                  [code]: next,
                                },
                              }
                            })
                          }}
                          className={`grid h-6 w-6 place-items-center rounded-full text-white cursor-pointer shadow-2xs hover:scale-110 transition-transform ${
                            st === 'completado'
                              ? 'bg-emerald-600'
                              : st === 'en_proceso'
                                ? 'bg-amber-500'
                                : 'bg-rose-600'
                          }`}
                          title={`${code}: ${st} (Clic para cambiar)`}
                        >
                          {st === 'completado' ? (
                            <Check size={12} strokeWidth={3} />
                          ) : st === 'en_proceso' ? (
                            <Clock size={12} strokeWidth={2.4} />
                          ) : (
                            <X size={12} strokeWidth={3} />
                          )}
                        </button>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Tareas ya amarradas a esta UGEL */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-800">
                    Tareas vinculadas a {formatUgelDisplayName(inspectedUgel.name).startsWith('DRE') ? formatUgelDisplayName(inspectedUgel.name) : `UGEL ${formatUgelDisplayName(inspectedUgel.name)}`} ({getTasksForUgel(inspectedUgel.name).length})
                  </p>
                  <span className="text-[11px] text-slate-500 font-medium">Bandeja operativa</span>
                </div>
                {getTasksForUgel(inspectedUgel.name).length === 0 ? (
                  <p className="rounded-xl border border-dashed border-slate-200 p-3.5 text-xs text-slate-400 text-center">
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
                              setInspectedUgel(null)
                              if (onOpenTask) onOpenTask(t.id)
                            }}
                            className="min-w-0 flex-1 text-left cursor-pointer hover:opacity-80"
                          >
                            <p className="truncate font-bold text-slate-900">{t.title}</p>
                            <p className="text-[11px] text-slate-500">
                              {t.id} · {WORK_ITEM_STATE_META[t.state]?.label ?? t.state} · {t.assignee.name}
                            </p>
                          </button>
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-emerald-500 text-white shadow-2xs hover:bg-emerald-600 transition-colors"
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

              {/* Inyectar nueva tarea amarrada a esta UGEL + Hito 1.6 */}
              <div className="rounded-xl border border-[var(--hub-brand,#d9532f)]/30 bg-[var(--hub-brand-soft,#fbf0ec)]/50 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Zap size={15} className="text-[var(--hub-brand,#d9532f)]" />
                  <span className="text-xs font-black text-slate-900">
                    Inyectar Tarea de Asistencia Técnica (Bandeja + Hito)
                  </span>
                </div>
                <div>
                  <label className="mb-1 block text-[11px] font-bold text-slate-700">
                    Acción requerida para {formatUgelDisplayName(inspectedUgel.name).startsWith('DRE') ? formatUgelDisplayName(inspectedUgel.name) : `UGEL ${formatUgelDisplayName(inspectedUgel.name)}`}
                  </label>
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder={`Acción de acompañamiento en ${formatUgelDisplayName(inspectedUgel.name)}...`}
                    className="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-900 outline-none focus:border-[var(--hub-brand,#d9532f)] focus:ring-1 focus:ring-[var(--hub-brand,#d9532f)] shadow-2xs"
                  />
                </div>
                <div className="flex items-center justify-between gap-2 pt-1">
                  <span className="text-[11px] text-slate-600">
                    Responsable: <strong className="text-slate-900 font-bold">{inspectedUgel.gestorName}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCreateTaskForUgel(inspectedUgel)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--hub-brand,#d9532f)] px-3.5 py-2 text-xs font-bold text-white shadow-xs hover:opacity-95 cursor-pointer transition-opacity"
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

      {/* ── MODAL / POPOVER ÁGIL PARA REGISTRAR FECHA Y HORA EN DRIVE REGIONAL ── */}
      {editingDriveDateTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[2px] p-4 print:hidden animate-in fade-in duration-150">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-4">
            {/* Cabecera */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-700">
                  <Calendar size={19} />
                </span>
                <div>
                  <h4 className="text-sm font-black text-slate-900 leading-tight">
                    Entrega en Drive Regional (22/10)
                  </h4>
                  <p className="text-[12px] font-bold text-slate-500 mt-0.5">
                    UGEL {editingDriveDateTarget.ugelName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDriveDateTarget(null)}
                className="grid h-7 w-7 place-items-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
                title="Cerrar"
              >
                <X size={16} />
              </button>
            </div>

            {/* Accesos rápidos inmediatos para registro súper rápido */}
            <div>
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                Registro rápido con un clic
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    const now = new Date()
                    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
                    const nowTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
                    setDrivePickerDate(todayIso)
                    setDrivePickerTime(nowTime)
                    setDrivePickerStatus('completado')
                  }}
                  className="rounded-xl border border-amber-200 bg-amber-50/70 px-3 py-2 text-left font-bold text-amber-950 hover:bg-amber-100/80 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Clock size={13} className="text-amber-600 shrink-0" />
                  <span>Ahora mismo</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setDrivePickerDate('2026-10-22')
                    setDrivePickerTime('18:00')
                    setDrivePickerStatus('completado')
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-left font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Calendar size={13} className="text-blue-600 shrink-0" />
                  <span>Hoy corte 18:00</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSaveDriveDelivery('En proceso', 'en_proceso')
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-left font-bold text-slate-700 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Clock size={13} className="text-amber-500 shrink-0" />
                  <span>En proceso</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSaveDriveDelivery('Sin evidencia', 'pendiente')
                  }}
                  className="rounded-xl border border-slate-200 bg-slate-50/80 px-3 py-2 text-left font-bold text-rose-700 hover:bg-rose-50 transition-all cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <X size={13} className="text-rose-500 shrink-0" />
                  <span>Sin evidencia</span>
                </button>
              </div>
            </div>

            {/* Selectores de Fecha y Hora nativos */}
            <div className="space-y-3 rounded-xl border border-slate-200/90 bg-slate-50/60 p-3.5">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Seleccionar Fecha y Hora
              </span>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Fecha de entrega
                  </label>
                  <input
                    type="date"
                    value={drivePickerDate}
                    onChange={(e) => setDrivePickerDate(e.target.value)}
                    className="h-9.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 shadow-2xs cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Hora (24h)
                  </label>
                  <input
                    type="time"
                    value={drivePickerTime}
                    onChange={(e) => setDrivePickerTime(e.target.value)}
                    className="h-9.5 w-full rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-800 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-200 shadow-2xs cursor-pointer"
                  />
                </div>
              </div>

              {/* Selector de estado */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Estado en Drive
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(
                    [
                      { id: 'completado', label: 'Completado', color: 'bg-[#16a34a] text-white' },
                      { id: 'en_proceso', label: 'En proceso', color: 'bg-[#f59e0b] text-white' },
                      { id: 'pendiente', label: 'Pendiente', color: 'bg-[#dc2626] text-white' },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setDrivePickerStatus(opt.id)}
                      className={`rounded-lg py-1.5 text-center text-[11.5px] font-bold transition-all cursor-pointer ${
                        drivePickerStatus === opt.id
                          ? `${opt.color} shadow-xs scale-102`
                          : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Resumen previo */}
            <div className="flex items-center justify-between text-[11.5px] text-slate-500 px-1">
              <span>
                Actual: <strong className="text-slate-700">{editingDriveDateTarget.currentDate}</strong>
              </span>
              <span className="font-semibold text-slate-600">
                Nuevo: <strong className="text-amber-800">{formatDriveDateTime(drivePickerDate, drivePickerTime)}</strong>
              </span>
            </div>

            {/* Acciones */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setEditingDriveDateTarget(null)}
                className="rounded-xl px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const formatted = formatDriveDateTime(drivePickerDate, drivePickerTime)
                  handleSaveDriveDelivery(formatted, drivePickerStatus)
                }}
                className="rounded-xl bg-[#1055b8] px-5 py-2 text-xs font-black text-white hover:bg-blue-700 transition-colors shadow-xs cursor-pointer"
              >
                Guardar Fecha y Hora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
