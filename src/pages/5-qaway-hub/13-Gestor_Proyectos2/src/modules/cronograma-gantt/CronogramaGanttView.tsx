import { GanttEditorDrawer } from './GanttEditorDrawer';
// @ts-nocheck
import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { useTableEngine, ColumnHeaderMenu, type ColumnDef, type Hierarchy } from '../../shared/table-engine';
import {
  applyActuals,
  formatDeviation,
  freezeBaseline,
  getDeviationDays,
  getDeviationTone,
  hasBaseline,
} from './scheduleMetrics';
import './gantt.css';
import { ProjectShellHeader, ProjectShellWorkspace, ProjectShellFilters } from '../../shared/project-shell';
import CronogramaKanbanView from './CronogramaKanbanView';
import CronogramaListaView from './CronogramaListaView';
import { PERSON_AVATARS } from '../tareas-2/TareasSideCards';
import CronogramaCalendarioView from './CronogramaCalendarioView';
import MapaTerritorialView, { type TerritorialSubView } from '../sedes/MapaTerritorialView';
import SedesCaratulaView from '../sedes/SedesCaratulaView';
import { CronogramaArbolView } from './CronogramaArbolView';
import { CronogramaOrganigramaView } from './CronogramaOrganigramaView';
import EquipoOrganigramaView from '../equipo/EquipoOrganigramaView';
import EquipoOrganigramaFlowView from '../equipo/EquipoOrganigramaFlowView';
import EquipoSedesView from '../equipo/EquipoSedesView';
import EquipoCargaView from '../equipo/EquipoCargaView';
import EquipoDrawer from '../equipo/EquipoDrawer';
import EquipoExpedienteModal from '../equipo/EquipoExpedienteModal';
import EquipoNuevoModal from '../equipo/EquipoNuevoModal';
import SedeNuevaModal from '../sedes/SedeNuevaModal';
import {
  fetchEquipoIntegrantesFromSupabase,
  fetchEquipoSedesFromSupabase,
  updateCachedIntegrante,
} from '../../services/gestorEquipoService';
import {
  fetchCronogramaFromSupabase,
  syncAllCronogramaItemsToSupabase,
  deleteCronogramaItemFromSupabase,
  type GanttItemData
} from '../../services/gestorCronogramaService';
import {
  type EdtNodeType,
  type Fase,
  PROJECT_PHASES_CATALOG,
  EDT_NODE_LABELS,
  resolveEdtNodeType,
  getEdtNodeDisplayLabel,
  DRE_JUNIN_DOTACION_2027_EDT,
  sortWbsHierarchy,
  compareWbsCodes,
  isLegacyCronogramaItem,
} from './edtPmbokModel';
import { computeWbsHierarchy, getLinkedTasksSummary } from './wbsHierarchy';
import {
  MACROREGIONES,
  REGIONES_PROYECTO,
  REGIONAL_NODE_SEEDS,
  MULTI_REGION_VALUE,
  getRegionalSeed,
  getRegionCoordinador,
  getMacroById,
  resolveItemRegion,
  MACROREGIONES_NACIONAL,
  normalizeRegionKey,
} from './regionalCoordinationModel';
import { ALL_SEDES_EDT_ITEMS } from './sedesCatalogSeeds';
import { MINEDU_UNIDADES } from '../../data/mineduUnidades';
import { listGestorUnits } from '../../services/gestorOrganizacionService';

/** Cache a nivel de módulo: un solo fetch de gestor_unidades para todas las instancias montadas. */
let UNIDADES_REMOTAS: { name: string; region: string; unitType: string; status: string }[] | null = null;

export {
  type EdtNodeType,
  type Fase,
  PROJECT_PHASES_CATALOG,
  EDT_NODE_LABELS,
  resolveEdtNodeType,
  getEdtNodeDisplayLabel,
  DRE_JUNIN_DOTACION_2027_EDT,
  sortWbsHierarchy,
  compareWbsCodes,
  isLegacyCronogramaItem,
};
import {
  Activity,
  GitBranch,
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Building,
  Building2,
  CalendarDays,
  CalendarRange,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCircle2,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsUpDown,
  Clock,
  Clock3,
  PanelLeftClose,
  PanelLeftOpen,
  CornerDownRight,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  FileSpreadsheet,
  FileText,
  FileUp,
  Filter,
  FilterX,
  Flag,
  Folder,
  FolderMinus,
  FolderOpen,
  FolderPlus,
  Globe,
  Hash,
  HelpCircle,
  Layers,
  Layers3,
  LayoutDashboard,
  List,
  ListChecks,
  FolderKanban,
  GitCompareArrows,
  GitFork,
  GripVertical,
  Link2,
  MapPin,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  Package,
  PanelRightOpen,
  Paperclip,
  Pencil,
  Percent,
  Plus,
  Presentation,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  Anchor,
  Columns3,
  SlidersHorizontal,
  Tag,
  Target,
  Trash2,
  Undo2,
  Redo2,
  Upload,
  User,
  UserCheck,
  UserPlus,
  Users,
  Network,
  Zap,
  ZoomIn,
  ZoomOut,
  Sigma,
  X
} from 'lucide-react';

// Tipos canonicos: cronograma-core/types (sin duplicados locales).
import type {
  AttachmentItem,
  ColKey,
  DeliverableItem,
  EditField,
  Item,
  Kind,
  Status,
  WbsNodeType,
} from '../cronograma-core/types';
import type { DeliverableFormat } from '../../shared/deliverableTypes';
export type { AttachmentItem, DeliverableItem, DeliverableFormat, Item, Kind, Status, WbsNodeType };

export const OFFICIAL_WBS_DEPENDENCIES: Record<string, string[]> = {
  // Componente 1: Planificación
  'pt-1.6': ['pt-1.4'],   // CDL depende de Plan de Distribución Local aprobado
  'pt-1.7.1': ['pt-1.6'], // Comunicación a II.EE. depende de CDL validado
  'pt-1.7.2': ['pt-1.7.1'], // Capacitación a directores depende de Comunicación inicial
  'pt-1.7a': ['pt-1.6'],  // retrocompatibilidad
  'pt-1.7b': ['pt-1.7.1'], // retrocompatibilidad

  // Dependencias macro entre componentes rectores
  'comp-3': ['comp-2'],   // Recepción en DRE/UGEL depende de Habilitación de Almacenes
  'comp-4': ['comp-1'],   // Contratos de transporte depende de Planificación y CDL
  'comp-5': ['comp-4'],   // Distribución a IIEE depende de Contratación de Transporte
  'comp-6': ['comp-5'],   // Recepción en IIEE depende de Distribución a IIEE
  'comp-10': ['comp-5'],  // Monitoreo intensivo depende de inicio de Distribución
  'comp-11': ['comp-5'],  // Alerta temprana depende de inicio de Distribución
};


/* Motor WBS centralizado en cronograma-core: sin copia local. */
export { computeWbsHierarchy, getLinkedTasksSummary };

const resolveDefaultGestor = (code: string, name: string): string => {
  const c = code || '';
  const n = (name || '').toLowerCase();
  if (n.includes('dre junín') || n.includes('dre junin') || n.includes('comité regional') || n.includes('plan de monitoreo regional')) return 'María Salazar';
  if (n.includes('chanchamayo') || n.includes('pichanaki') || n.includes('perené') || n.includes('perene') || n.includes('satipo') || n.includes('río tambo') || n.includes('rio tambo') || n.includes('pangoa')) {
    return 'Lucía Ramos';
  }
  if (n.includes('huancayo') || n.includes('jauja') || n.includes('tarma') || n.includes('yauli') || n.includes('chupaca') || n.includes('concepción') || n.includes('concepcion') || n.includes('plan de distribución local') || n.includes('comité de distribución')) {
    return 'Javier Ruiz';
  }
  if (n.includes('siga') || n.includes('código') || n.includes('cdl') || n.includes('matriz')) return 'Lucía Flores';
  if (c.startsWith('1.') || c === '1.') {
    if (n.includes('comunicación') || n.includes('capacitación')) return 'María Jara';
    return 'Javier Ruiz';
  }
  if (c.startsWith('2.') || c === '2.' || n.includes('almacén') || n.includes('pecosa')) return 'Javier Ruiz';
  if (c.startsWith('3.') || c === '3.' || n.includes('transporte') || n.includes('distribución') || n.includes('ruta')) return 'Juan Pérez';
  if (c.startsWith('4.') || c === '4.' || n.includes('cierre') || n.includes('auditoría')) return 'Ana Torres';
  if (c.startsWith('5.') || c === '5.' || n.includes('informe') || n.includes('balance')) return 'María Jara';
  return 'Javier Ruiz';
};

const baseEdtIds = new Set([
  ...DRE_JUNIN_DOTACION_2027_EDT.map((r) => r.id),
  ...REGIONAL_NODE_SEEDS.map((s) => s.row.id),
]);

const extraSedesItems: Item[] = ALL_SEDES_EDT_ITEMS.filter((s) => !baseEdtIds.has(s.id)).map((s) => ({
  id: s.id,
  code: s.code || '',
  name: s.name,
  kind: 'subproceso' as const,
  edtType: (s.edtType as Item['edtType']) || 'PAQUETE_TRABAJO',
  faseId: s.faseId || 'FASE-PLANIFICACION',
  parentId: s.parentId || 'comp-1',
  start: s.start,
  end: s.end,
  dependencies: [],
  progress: s.progress,
  status: s.status,
  expanded: false,
  description: s.entregableVerificable || `Seguimiento territorial en ${s.name}`,
  deliverable: s.entregableVerificable || `Entregable verificado - ${s.name}`,
  deliverables: [{
    id: `deliv-${s.id}`,
    name: s.entregableVerificable || `Entregable verificado - ${s.name}`,
    type: 'spreadsheet' as const,
  }],
  region: s.region,
  sede: s.name,
  gestor: s.gestor,
  gestores: [s.gestor],
  entidadResponsable: s.entidadResponsable,
  tasks: 0,
  done: 0,
  baselineStart: s.start,
  baselineEnd: s.end,
}));

// Cronograma Maestro de Proyecto: contiene exclusivamente los Componentes y Paquetes de Trabajo de entregables (cero sedes territoriales)
export const MASTER_INITIAL_ITEMS: Item[] = computeWbsHierarchy(sortWbsHierarchy(([
  ...DRE_JUNIN_DOTACION_2027_EDT.filter((r) => !r.id.startsWith('pt-1.6-') && r.parentId !== 'pt-1.6'),
].map((r) => {
  // Paquetes regionales (DRE fuera de Junín): responsable = Coordinador Regional de su región
  const regionalSeed = getRegionalSeed(r.id);
  const defaultGestor = regionalSeed
    ? getRegionCoordinador(regionalSeed.region) || resolveDefaultGestor(r.code, r.name)
    : resolveDefaultGestor(r.code, r.name);
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    kind: r.kind,
    edtType: r.id === 'pt-1.6' ? 'PAQUETE_TRABAJO' : r.edtType,
    faseId: r.faseId,
    parentId: r.parentId,
    start: r.start,
    end: r.end,
    dependencies: OFFICIAL_WBS_DEPENDENCIES[r.id] || [],
    progress: regionalSeed
      ? regionalSeed.progress
      : r.id === 'pt-1.6-chupaca' || r.id === 'pt-1.6-concepcion'
        ? 100
        : r.id === 'pt-1.6-dre-junin' || r.id === 'pt-1.6-huancayo'
        ? 75
        : r.id === 'pt-1.6-jauja' || r.id === 'pt-1.6-junin'
        ? 50
        : r.id === 'pt-1.6-satipo'
        ? 33
        : r.id === 'pt-1.6-tarma' || r.id === 'pt-1.6-chanchamayo'
        ? 20
        : r.id === 'pt-1.6-yauli'
        ? 10
        : r.id.startsWith('pt-1.6-')
        ? 0
        : r.kind === 'hito' ? 18 : (r.code === '1.1' || r.code === '2.1' ? 100 : (r.code.startsWith('1.') ? 50 : 0)),
    status: (regionalSeed
      ? regionalSeed.status
      : r.id === 'pt-1.6-chupaca' || r.id === 'pt-1.6-concepcion'
        ? 'Cumple'
        : r.id === 'pt-1.6-dre-junin' || r.id === 'pt-1.6-huancayo' || r.id === 'pt-1.6-jauja' || r.id === 'pt-1.6-junin'
        ? 'En proceso'
        : r.id === 'pt-1.6-pangoa'
        ? 'Pendiente'
        : r.id.startsWith('pt-1.6-')
        ? 'Con retraso'
        : r.code === '1.1' || r.code === '2.1' ? 'Completado' : (r.code.startsWith('1.') ? 'En proceso' : 'Pendiente')) as Status,
    expanded: true,
    description: r.entregableVerificable ? `Entregable oficial: ${r.entregableVerificable}` : '',
    deliverable: r.entregableVerificable || '',
    deliverables: r.entregableVerificable ? [{
      id: `deliv-${r.id}`,
      name: r.entregableVerificable,
      type: r.entregableVerificable.toLowerCase().includes('resolución') || r.entregableVerificable.toLowerCase().includes('informe') || r.entregableVerificable.toLowerCase().includes('oficio') ? 'document' : (r.entregableVerificable.toLowerCase().includes('excel') || r.entregableVerificable.toLowerCase().includes('directorio') || r.entregableVerificable.toLowerCase().includes('cuadro') ? 'spreadsheet' : 'document'),
    }] : [],
    region: resolveItemRegion(r.id),
    sede: r.name.includes('UGEL') || r.name.includes('DRE') ? r.name : undefined,
    gestor: defaultGestor,
    gestores: [defaultGestor],
    entidadResponsable: r.entidadResponsable,
  };
}) as Item[])));

const baseTerritorialComponents: Item[] = MASTER_INITIAL_ITEMS.filter((it) => !it.parentId).map((c) => ({
  ...c,
  expanded: false,
}));

export const TERRITORIAL_INITIAL_ITEMS: Item[] = computeWbsHierarchy(
  sortWbsHierarchy([...baseTerritorialComponents, ...extraSedesItems])
);

export const INITIAL_ITEMS: Item[] = TERRITORIAL_INITIAL_ITEMS;

const extraSedesIdSet = new Set(extraSedesItems.map((s) => s.id));
export function isTerritorialSedeOnlyItem(item: { id: string; name?: string | undefined; edtType?: string | undefined; sede?: string | undefined; parentId?: string | undefined }): boolean {
  if (extraSedesIdSet.has(item.id)) return true;
  if (item.id.includes('-unit-')) return true;
  if (item.id.includes('-dre-')) return true;
  if (item.id.startsWith('pt-1.6-') || item.parentId === 'pt-1.6') return true;
  if (REGIONAL_NODE_SEEDS.some((s) => s.row.id === item.id)) return true;
  if (item.edtType === 'PAQUETE_TRABAJO' && (item.name?.startsWith('UGEL') || item.name?.startsWith('DRE '))) {
    return true;
  }
  return false;
}

export function isSedeItem(item: any): boolean {
  if (!item) return false;
  if (item.wbsNodeType === 'COMPONENTE' || item.edtType === 'COMPONENTE') return false;
  if (item.code && /^\d+(\.\d+)+$/.test(String(item.code).trim())) return false;
  if (item.unitType === 'dre' || item.unitType === 'regional' || item.unitType === 'ugel' || item.unitType === 'operativa' || item.unitType === 'central') return true;
  if (item.isSede) return true;
  if (isTerritorialSedeOnlyItem(item)) return true;
  if (typeof item.name === 'string') {
    const trimmed = item.name.trim();
    if (trimmed.startsWith('DRE ') || trimmed.startsWith('GRE ') || trimmed.startsWith('UGEL ') || trimmed.includes('Regional Matriz')) {
      return true;
    }
  }
  return false;
}

export function getSedeType(itemOrName: any): 'dre' | 'ugel' | 'central' | null {
  if (!itemOrName) return null;
  const name = typeof itemOrName === 'string' ? itemOrName : String(itemOrName.sede || itemOrName.name || '');
  const unitType = typeof itemOrName === 'object' ? itemOrName.unitType : undefined;

  if (unitType === 'dre' || unitType === 'regional' || name.startsWith('DRE ') || name.startsWith('GRE ') || name.includes('Regional Matriz')) {
    return 'dre';
  }
  if (unitType === 'ugel' || unitType === 'operativa' || unitType === 'oficina' || unitType === 'obra' || name.startsWith('UGEL ')) {
    return 'ugel';
  }
  if (unitType === 'central' || name.includes('Sede Central')) {
    return 'central';
  }
  return null;
}


const MONTHS = [
  { label: 'Sep', start: '2026-09-01' },
  { label: 'Oct', start: '2026-10-01' },
  { label: 'Nov', start: '2026-11-01' },
  { label: 'Dic', start: '2026-12-01' },
  { label: 'Ene', start: '2027-01-01' },
  { label: 'Feb', start: '2027-02-01' },
  { label: 'Mar', start: '2027-03-01' },
  { label: 'Abr', start: '2027-04-01' },
];

export const STATUS_CLASS: Record<Status, string> = {
  'Cumple': 'complete',
  'Completado': 'complete',
  'En curso': 'progress',
  'En proceso': 'progress',
  'Pendiente': 'pending',
  'Con retraso': 'late',
};

/* Semáforo oficial de 5 estados (tablero operativo). 'Completado' se mantiene
   como señal de retrocompatibilidad para datos persistidos previos. */
const STATUS_OPTIONS: Status[] = ['Cumple', 'En curso', 'En proceso', 'Con retraso', 'Pendiente'];

export interface LocationHierarchyNode {
  name: string;
  count: number;
  distritos: {
    distrito: string;
    sede: string;
    count: number;
  }[];
}

const LOCATION_HIERARCHY: LocationHierarchyNode[] = [
  {
    name: 'Junín',
    count: 18,
    distritos: [
      { distrito: 'Tarma', sede: 'UGEL Tarma', count: 8 },
      { distrito: 'Concepción', sede: 'UGEL Concepción', count: 6 },
      { distrito: 'Huancayo', sede: 'UGEL Huancayo', count: 4 },
    ],
  },
  {
    name: 'Lima',
    count: 10,
    distritos: [
      { distrito: 'San Juan de Miraflores', sede: 'UGEL 01 San Juan', count: 6 },
      { distrito: 'Huaral', sede: 'UGEL 10 Huaral', count: 4 },
    ],
  },
  {
    name: 'Tumbes',
    count: 8,
    distritos: [
      { distrito: 'Tumbes', sede: 'UGEL Tumbes', count: 5 },
      { distrito: 'Zarumilla', sede: 'UGEL Zarumilla', count: 3 },
    ],
  },
  {
    name: 'Loreto',
    count: 2,
    distritos: [
      { distrito: 'Maynas', sede: 'UGEL Maynas', count: 2 },
    ],
  },
  {
    name: 'Huancavelica',
    count: 1,
    distritos: [
      { distrito: 'Tayacaja', sede: 'UGEL Tayacaja', count: 1 },
    ],
  },
];

const REGION_OPTIONS = [
  { value: 'Todas', label: 'Todas las Ubicaciones' },
  { value: 'Junín', label: 'Junín' },
  { value: 'Lima', label: 'Lima' },
  { value: 'Tumbes', label: 'Tumbes' },
  { value: 'Loreto', label: 'Loreto' },
  { value: 'Huancavelica', label: 'Huancavelica' },
  { value: 'Todas las Regiones', label: 'Multi-región / Nacional' },
];

const GESTOR_OPTIONS = [
  { value: 'Todos', label: 'Todos los Responsables' },
  { value: 'Carlos Sandoval', label: 'Carlos Sandoval (Coordinador General)' },
  { value: 'María Jara', label: 'María Jara (Directora de Operaciones)' },
  { value: 'Lucía Flores', label: 'Lucía Flores (Especialista SIGA)' },
  { value: 'Javier Ruiz', label: 'Javier Ruiz (Logística y Almacenes)' },
  { value: 'Juan Pérez', label: 'Juan Pérez (Responsable Operativo)' },
  { value: 'Ana Torres', label: 'Ana Torres (Supervisora Territorial)' },
  { value: 'Elena Rojas', label: 'Elena Rojas (Base Logística)' },
];

const GESTOR_COLORS: Record<string, string> = {
  'Carlos Sandoval': '#0284c7',
  'María Jara': '#2563eb',
  'Lucía Flores': '#7c3aed',
  'Javier Ruiz': '#059669',
  'Juan Pérez': '#d97706',
  'Ana Torres': '#dc2626',
  'Elena Rojas': '#475569',
  'María Salazar': '#2563eb',
  'Lucía Ramos': '#7c3aed',
};

const getGestorInitials = (name: string): string => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  const first = parts[0] ?? '';
  const last = parts[parts.length - 1] ?? '';
  if (parts.length === 1) return first.slice(0, 2).toUpperCase();
  return `${first[0] ?? ''}${last[0] ?? ''}`.toUpperCase();
};

const getGestorColor = (name: string): string => {
  if (GESTOR_COLORS[name]) return GESTOR_COLORS[name];
  const colors = ['#2563eb', '#0284c7', '#7c3aed', '#059669', '#d97706', '#dc2626'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[Math.abs(hash) % colors.length] ?? '#2563eb';
};

export const getPersonInstitutionalRole = (name: string): string => {
  switch (name) {
    case 'Carlos Mendoza':
    case 'Carlos Sandoval':
      return 'Coordinador General (MINEDU)';
    case 'María Salazar':
      return 'Coordinadora Regional Junín';
    case 'Javier Ruiz':
      return 'Gestor Territorial de Campo (Valle / Andina)';
    case 'Lucía Ramos':
      return 'Gestora Territorial de Campo (Selva Central)';
    case 'Lucía Flores':
      return 'Especialista SIGA / CDL';
    case 'Rosa Quispe':
      return 'Coord. Macro-regional (Centro)';
    case 'Ana Torres':
      return 'Coord. Macro-regional (Centro Sur)';
    case 'Miguel Paredes':
      return 'Coord. Macro-regional (Oriente)';
    case 'Luis Ccori':
      return 'Coordinador Regional Pasco';
    case 'Elena Rojas':
      return 'Coordinadora Regional Huancavelica';
    case 'Jorge Huamán':
      return 'Coordinador Regional Ayacucho';
    case 'Patricia Vela':
      return 'Coordinadora Regional Huánuco';
    case 'Renzo Tapia':
      return 'Coordinador Regional Ucayali';
    case 'Roberto Méndez':
      return 'Gestor Territorial Áncash';
    case 'Gabriel Delgado':
      return 'Gestor Territorial Arequipa';
    case 'Ronald Quispe':
      return 'Gestor Territorial Cusco';
    case 'Carlos Vílchez':
      return 'Gestor Territorial Piura';
    case 'Walter Mamani':
      return 'Gestor Territorial Puno';
    case 'Segundo Díaz':
      return 'Gestor Territorial Cajamarca';
    case 'Víctor Chávez':
      return 'Gestor Territorial La Libertad';
    case 'Miguel Benites':
      return 'Gestor Territorial Lambayeque';
    case 'Marcos Reátegui':
      return 'Gestor Territorial Loreto';
    case 'Dante Arévalo':
      return 'Gestor Territorial San Martín';
    case 'Wilson Valqui':
      return 'Gestor Territorial Amazonas';
    case 'Julio Morales':
      return 'Gestor Territorial Ica';
    case 'Edwin Palomino':
      return 'Gestor Territorial Apurímac';
    case 'Hernán Castro':
      return 'Gestor Territorial Lima Provincias';
    case 'César Farfán':
      return 'Gestor Territorial Lima Metro';
    case 'Jorge Barreto':
      return 'Gestor Territorial Callao';
    case 'Daniel Condori':
      return 'Gestor Territorial Moquegua';
    case 'Óscar Calizaya':
      return 'Gestor Territorial Tacna';
    case 'Pedro Morán':
      return 'Gestor Territorial Tumbes';
    case 'Néstor Rengifo':
      return 'Gestor Territorial Madre de Dios';
    case 'María Jara':
      return 'Directora de Operaciones';
    case 'Juan Pérez':
      return 'Gestor Logístico / Transporte';
    default:
      return 'Gestor Territorial de Campo';
  }
};

const getItemGestores = (item: Item): string[] => {
  if (item.gestores && item.gestores.length > 0) return item.gestores;
  if (item.gestor) return [item.gestor];
  return [];
};

const TYPE_OPTIONS = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Hitos', label: 'Solo Componentes' },
  { value: 'Subprocesos', label: 'Solo Productos' },
];

const PROJECT_MONTHS = [
  { label: 'Sep 2026', start: '2026-09-01', end: '2026-09-30' },
  { label: 'Oct 2026', start: '2026-10-01', end: '2026-10-31' },
  { label: 'Nov 2026', start: '2026-11-01', end: '2026-11-30' },
  { label: 'Dic 2026', start: '2026-12-01', end: '2026-12-31' },
  { label: 'Ene 2027', start: '2027-01-01', end: '2027-01-31' },
  { label: 'Feb 2027', start: '2027-02-01', end: '2027-02-28' },
  { label: 'Mar 2027', start: '2027-03-01', end: '2027-03-31' },
  { label: 'Abr 2027', start: '2027-04-01', end: '2027-04-30' },
];

const RANGE_MIN = '2026-09-01';
const RANGE_MAX = '2027-04-30';

const CANONICAL_COLS: ColKey[] = ['code', 'name', 'kind', 'deliverable', 'parent', 'start', 'end', 'duration', 'progress', 'deviation', 'status', 'dependencies', 'successors', 'gestor', 'region', 'actualEnd', 'reportType', 'actions'];

const DEFAULT_COLS: Record<ColKey, number> = {
  code: 80,
  name: 420,
  kind: 145,
  deliverable: 240,
  parent: 260,
  start: 135,
  end: 135,
  duration: 115,
  progress: 130,
  status: 125,
  dependencies: 130,
  successors: 130,
  gestor: 165,
  region: 140,
  deviation: 120,
  actualEnd: 130,
  reportType: 185,
  actions: 75,
  distrito: 130,
  sede: 130,
};

const MIN_COLS: Record<ColKey, number> = {
  code: 60,
  name: 260,
  kind: 80,
  deliverable: 140,
  parent: 90,
  start: 90,
  end: 90,
  duration: 80,
  progress: 100,
  status: 90,
  dependencies: 90,
  successors: 90,
  gestor: 110,
  region: 95,
  deviation: 90,
  actualEnd: 100,
  reportType: 140,
  actions: 60,
  distrito: 90,
  sede: 90,
};

const ALL_COL_META: { key: ColKey; label: string; fixed?: boolean }[] = [
  { key: 'name', label: 'COMPONENTE / PRODUCTO', fixed: true },
  { key: 'code', label: 'Código' },
  { key: 'kind', label: 'Tipo' },
  { key: 'deliverable', label: 'Entregable' },
  { key: 'parent', label: 'Componente padre' },
  { key: 'start', label: 'Inicio' },
  { key: 'end', label: 'Fin' },
  { key: 'duration', label: 'Duración' },
  { key: 'progress', label: 'Avance' },
  { key: 'deviation', label: 'Desviación' },
  { key: 'status', label: 'Estado' },
  { key: 'dependencies', label: 'Predecesores' },
  { key: 'successors', label: 'Sucesores' },
  { key: 'gestor', label: 'Responsable' },
  { key: 'region', label: 'Ámbito' },
  { key: 'actualEnd', label: 'Fecha real' },
  { key: 'reportType', label: 'Formato de Reporte' },
  { key: 'actions', label: 'Acción' },
];

// Preset inicial y predeterminado para vista Gantt (7 columnas compactas alineadas con la línea de tiempo)
const GANTT_PRESET_COLS: ColKey[] = ['name', 'start', 'end', 'duration', 'progress', 'status', 'gestor'];
// Preset inicial y predeterminado para vista Lista (14 columnas canónicas completas ordenadas)
const LISTA_PRESET_COLS: ColKey[] = ['code', 'name', 'kind', 'deliverable', 'start', 'end', 'duration', 'progress', 'deviation', 'status', 'region', 'actualEnd', 'actions'];
const DEFAULT_VISIBLE_COLS: ColKey[] = GANTT_PRESET_COLS;
const LISTA_VISIBLE_COLS: ColKey[] = LISTA_PRESET_COLS;
const getDays = (a?: string, b?: string) => {
  if (!a || !b) return 1;
  const da = new Date(a).getTime();
  const db = new Date(b).getTime();
  if (isNaN(da) || isNaN(db)) return 1;
  return Math.max(1, Math.round((db - da) / 86400000) + 1);
};

/* Definición de columnas para el motor universal: el tipo determina filtros, orden y controles. */
const STATUS_FLOW: Status[] = ['Pendiente', 'En proceso', 'En curso', 'Con retraso', 'Completado', 'Cumple'];

const GANTT_HIERARCHY: Hierarchy<Item> = {
  getId: (r) => r.id,
  getParentId: (r) => r.parentId,
};

const GANTT_COLUMNS: ColumnDef<Item>[] = [
  { id: 'name', label: 'COMPONENTE / PRODUCTO', type: 'text', accessor: (r) => `${r?.code ?? ''} ${r?.name ?? ''}`.trim() },
  { id: 'start', label: 'Inicio', type: 'date', accessor: (r) => r?.start },
  { id: 'end', label: 'Fin', type: 'date', accessor: (r) => r?.end },
  { id: 'duration', label: 'Duración', type: 'number', accessor: (r) => getDays(r?.start, r?.end) },
  { id: 'progress', label: 'Avance', type: 'percent', accessor: (r) => r?.progress ?? 0 },
  {
    id: 'status',
    label: 'Estado',
    type: 'processState',
    accessor: (r) => r?.status,
    options: STATUS_FLOW.map((s) => ({ value: s, label: s })),
  },
  {
    id: 'dependencies',
    label: 'Predecesores',
    type: 'text',
    accessor: (r) => (r?.dependencies || []).join(', '),
  },
  {
    id: 'successors',
    label: 'Sucesores',
    type: 'text',
    accessor: () => '',
  },
  { id: 'gestor', label: 'Responsable', type: 'person', accessor: (r) => (r ? getItemGestores(r) : []), emptyLabel: 'Sin asignar' },
  { id: 'region', label: 'Región', type: 'select', accessor: (r) => r?.region },
  { id: 'distrito', label: 'Distrito', type: 'select', accessor: (r) => r?.distrito },
  { id: 'sede', label: 'Sede', type: 'select', accessor: (r) => r?.sede },
  { id: 'code', label: 'Código', type: 'text', accessor: (r) => r?.code ?? '' },
  { id: 'kind', label: 'Tipo', type: 'select', accessor: (r) => (r ? getEdtNodeDisplayLabel(r) : 'Producto') },
  { id: 'deliverable', label: 'Entregable', type: 'text', accessor: (r) => r?.deliverable || r?.deliverables?.[0]?.name || '' },
  { id: 'parent', label: 'Componente padre', type: 'text', accessor: (r) => r?.parentId ?? '' },
];

export const formatDate = (s: string) =>
  new Date(s + 'T12:00:00')
    .toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '');

const formatDateRange = (from: string, to: string) => {
  if (from === RANGE_MIN && to === RANGE_MAX) {
    return '01 Sep 2026 – 30 Abr 2027';
  }
  return `${formatDate(from)} – ${formatDate(to)}`;
};

const formatDatePE = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
};

const formatDateDash = (iso: string) => {
  if (!iso) return '';
  const [y, m, d] = iso.slice(0, 10).split('-');
  if (!y || !m || !d) return iso;
  return `${d}-${m}-${y}`;
};

export function MiniCalendar({
  value,
  onChange,
  min = RANGE_MIN,
  max = RANGE_MAX,
  onClose,
  align = 'left',
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  onClose: () => void;
  align?: 'left' | 'right';
}) {
  const navigate = useNavigate();
  const [viewDate, setViewDate] = useState(() =>
    value ? new Date(value + 'T12:00:00') : new Date('2026-10-27T12:00:00')
  );

  useEffect(() => {
    if (value) {
      setViewDate(new Date(value + 'T12:00:00'));
    }
  }, [value]);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthName = viewDate.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  const capitalizedMonth = monthName.charAt(0).toUpperCase() + monthName.slice(1);
  const firstDayOfWeek = (new Date(year, month, 1).getDay() + 6) % 7; // Lunes = 0
  const totalDays = new Date(year, month + 1, 0).getDate();
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const prevMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month - 1, 1, 12));
  };

  const nextMonth = (e: React.MouseEvent) => {
    e.stopPropagation();
    setViewDate(new Date(year, month + 1, 1, 12));
  };

  const days: { day: number; currentMonth: boolean; iso: string }[] = [];
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthTotalDays - i;
    const prevDate = new Date(year, month - 1, d, 12);
    const mStr = String(prevDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    days.push({ day: d, currentMonth: false, iso: `${prevDate.getFullYear()}-${mStr}-${dStr}` });
  }
  for (let d = 1; d <= totalDays; d++) {
    const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ day: d, currentMonth: true, iso });
  }
  const remaining = (7 - (days.length % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, month + 1, d, 12);
    const mStr = String(nextDate.getMonth() + 1).padStart(2, '0');
    const dStr = String(d).padStart(2, '0');
    days.push({ day: d, currentMonth: false, iso: `${nextDate.getFullYear()}-${mStr}-${dStr}` });
  }

  return (
    <div
      className={`custom-calendar-pop ${align === 'right' ? 'align-right' : 'align-left'}`}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="cal-head">
        <span className="cal-title">{capitalizedMonth}</span>
        <div className="cal-arrows">
          <button type="button" onClick={prevMonth} title="Mes anterior">
            <ChevronLeft size={14} />
          </button>
          <button type="button" onClick={nextMonth} title="Mes siguiente">
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div className="cal-weekdays">
        <span>LU</span>
        <span>MA</span>
        <span>MI</span>
        <span>JU</span>
        <span>VI</span>
        <span>SA</span>
        <span>DO</span>
      </div>
      <div className="cal-grid">
        {days.map((item, idx) => {
          const isSelected = item.iso === value;
          const isToday = item.iso === TODAY_ISO;
          const isDisabled = (!!min && item.iso < min) || (!!max && item.iso > max);
          return (
            <button
              key={idx}
              type="button"
              disabled={isDisabled}
              className={`cal-day ${item.currentMonth ? '' : 'outside'} ${isSelected ? 'selected' : ''} ${
                isToday ? 'today-day' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation();
                if (!isDisabled) {
                  onChange(item.iso);
                  onClose();
                }
              }}
            >
              {item.day}
            </button>
          );
        })}
      </div>
      <div className="cal-footer">
        <button
          type="button"
          className="cal-today-btn"
          onClick={(e) => {
            e.stopPropagation();
            onChange(TODAY_ISO);
            onClose();
          }}
        >
          Hoy
        </button>
        <button
          type="button"
          className="cal-close-btn"
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          Cerrar
        </button>
      </div>
    </div>
  );
}


const monthDays = (iso: string) => {
  const y = Number(iso.slice(0, 4));
  const m = Number(iso.slice(5, 7));
  return new Date(y, m, 0).getDate();
};

/* Nuevo fin = inicio + (días - 1). El mediodía evita desfases de zona horaria. */
const shiftDays = (iso: string, delta: number) => {
  const d = new Date(iso + 'T12:00:00');
  d.setDate(d.getDate() + delta);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const START_TIMESTAMP = new Date('2026-09-01T12:00:00').getTime();
const TOTAL_SPAN_DAYS = getDays('2026-09-01', '2027-04-30');

const calcPosition = (s: string) =>
  (((new Date(s + 'T12:00:00').getTime() - START_TIMESTAMP) / 86400000) / TOTAL_SPAN_DAYS) * 100;

const calcWidth = (a: string, b: string) => (getDays(a, b) / TOTAL_SPAN_DAYS) * 100;

const getSystemTodayIso = () => {
  try {
    const mode = localStorage.getItem('qaway-system-date-mode-v1') || 'custom';
    const custom = localStorage.getItem('qaway-system-date-v1');
    if (mode === 'custom' && custom && custom >= RANGE_MIN && custom <= RANGE_MAX) {
      return custom;
    }
    const tz = localStorage.getItem('qaway-system-timezone-v1') || 'America/Lima';
    const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: tz });
    const nowIso = formatter.format(new Date());
    if (nowIso >= RANGE_MIN && nowIso <= RANGE_MAX) {
      return nowIso;
    }
  } catch {
    /* fallback */
  }
  return '2026-10-28';
};

/* Línea "Hoy" dinámica calibrada con zona horaria o fecha de corte operativa MINEDU */
const TODAY_ISO = getSystemTodayIso();

const MONTH_NAMES = [
  'Septiembre 2026',
  'Octubre 2026',
  'Noviembre 2026',
  'Diciembre 2026',
  'Enero 2027',
  'Febrero 2027',
  'Marzo 2027',
  'Abril 2027',
];

const monthCols = MONTHS.map((m) => `${monthDays(m.start)}fr`).join(' ');

/* Segmentación del eje temporal según escala (Día / Semana / Mes / Trimestre).
   Los pesos "fr" derivan de días reales, por lo que las barras (%) y la línea
   "Hoy" quedan sempre alineadas con la cuadrícula. */
const buildSegments = (zoom: string) => {
  const segs: { label: string; days: number; key: string }[] = [];

  if (zoom === 'Día') {
    for (let i = 0; i < TOTAL_SPAN_DAYS; i++) {
      const d = new Date(START_TIMESTAMP + i * 86400000);
      const dom = d.getDate();
      segs.push({ label: String(dom), days: 1, key: `d${i}` });
    }
    return segs;
  }

  if (zoom === 'Semana') {
    let i = 0;
    while (i < TOTAL_SPAN_DAYS) {
      const d = new Date(START_TIMESTAMP + i * 86400000);
      const dow = (d.getDay() + 6) % 7; /* lunes = 0 */
      const take = Math.min(dow === 0 ? 7 : 7 - dow, TOTAL_SPAN_DAYS - i);
      segs.push({ label: `S${segs.length + 1}`, days: take, key: `w${segs.length}` });
      i += take;
    }
    return segs;
  }

  if (zoom === 'Trimestre') {
    const quarters: Record<string, { label: string; days: number }> = {};
    const order: string[] = [];
    MONTHS.forEach((m) => {
      const q = `${Math.ceil(Number(m.start.slice(5, 7)) / 3)}-${Number(m.start.slice(2, 4))}`;
      if (!quarters[q]) {
        quarters[q] = { label: `T${q.split('-')[0]}-${q.split('-')[1]}`, days: 0 };
        order.push(q);
      }
      quarters[q].days += monthDays(m.start);
    });
    return order.map((q, i) => ({ ...quarters[q], key: `q${i}` }));
  }

  /* Escala por defecto: Mes */
  return MONTHS.map((m, i) => ({ label: m.label, days: monthDays(m.start), key: `m${i}` }));
};


interface ExcelFilterOption {
  value: string;
  label: string;
  count?: number;
}

interface ExcelFilterPopoverProps {
  title: string;
  placeholder?: string;
  options: ExcelFilterOption[];
  selectedValues: string[];
  onApply: (selected: string[]) => void;
  onClear: () => void;
  onClose: () => void;
}

const ExcelFilterPopover: React.FC<ExcelFilterPopoverProps> = ({
  title,
  placeholder = 'Buscar...',
  options,
  selectedValues,
  onApply,
  onClear,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [tempSelected, setTempSelected] = useState<string[]>(() => [...selectedValues]);

  const filtered = useMemo(() => {
    if (!query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const isAllSelected = filtered.length > 0 && filtered.every((o) => tempSelected.includes(o.value));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      const filteredValues = new Set(filtered.map((o) => o.value));
      setTempSelected((prev) => prev.filter((v) => !filteredValues.has(v)));
    } else {
      const currentSet = new Set(tempSelected);
      filtered.forEach((o) => currentSet.add(o.value));
      setTempSelected(Array.from(currentSet));
    }
  };

  const toggleOption = (val: string) => {
    setTempSelected((prev) =>
      prev.includes(val) ? prev.filter((v) => v !== val) : [...prev, val]
    );
  };

  return (
    <div className="th-filter-popover excel-filter-popover" onClick={(e) => e.stopPropagation()}>
      <div className="excel-filter-head">
        <strong>{title}</strong>
        <button type="button" className="excel-filter-close" onClick={onClose} title="Cerrar filtro">
          <X size={13} />
        </button>
      </div>

      <div className="excel-filter-search">
        <Search size={13} />
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        {query && (
          <button type="button" onClick={() => setQuery('')}>
            <X size={12} />
          </button>
        )}
      </div>

      <div className="excel-filter-select-all">
        <label className="excel-filter-checkbox-label">
          <input
            type="checkbox"
            checked={isAllSelected}
            onChange={toggleSelectAll}
          />
          <span>(Seleccionar todo)</span>
          <small>({filtered.length})</small>
        </label>
      </div>

      <div className="excel-filter-list">
        {filtered.length === 0 ? (
          <div className="excel-filter-empty">Sin resultados para "{query}"</div>
        ) : (
          filtered.map((opt) => {
            const isChecked = tempSelected.includes(opt.value);
            return (
              <label key={opt.value} className={`excel-filter-item ${isChecked ? 'checked' : ''}`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOption(opt.value)}
                />
                <span className="excel-filter-item-text">{opt.label}</span>
                {opt.count !== undefined && <span className="excel-filter-count">{opt.count}</span>}
              </label>
            );
          })
        )}
      </div>

      <div className="excel-filter-actions">
        <button
          type="button"
          className="excel-btn-clear"
          onClick={() => {
            setTempSelected([]);
            onClear();
          }}
        >
          Limpiar
        </button>
        <button
          type="button"
          className="excel-btn-apply"
          onClick={() => {
            onApply(tempSelected);
          }}
        >
          Aplicar
        </button>
      </div>
    </div>
  );
};

/* Componente de Desplegable Institucional Estilizado (Cero menús nativos rectos de Windows) */
interface CustomSelectOption {
  value: string;
  label: string;
}

const CustomSelect = ({
  value,
  options,
  onChange,
  className,
}: {
  value: string;
  options: CustomSelectOption[];
  onChange: (v: string) => void;
  className?: string;
}) => {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value) || options[0];

  return (
    <div className={`qm-custom-select-wrap ${className || ''}`} onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        className={`qm-custom-select-btn ${open ? 'active' : ''}`}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{selected ? selected.label : 'Seleccionar...'}</span>
        <ChevronDown size={13} className={`qm-select-chevron ${open ? 'is-open' : ''}`} />
      </button>

      {open && (
        <>
          <div
            className="qm-select-backdrop"
            onClick={() => setOpen(false)}
            style={{ position: 'fixed', inset: 0, zIndex: 599 }}
          />
          <div className="qm-custom-select-menu">
            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`qm-custom-select-option ${opt.value === value ? 'selected' : ''}`}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
              >
                <span>{opt.label}</span>
                {opt.value === value && <Check size={13} className="qm-check-icon" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default function CronogramaGanttView({
  onActions,
  onSwitchPerspective,
  activeProject,
  perspective = 'maestro',
  isActive = true,
}: {
  onActions?: ((h: any) => void) | undefined;
  onSwitchPerspective?: ((p: any) => void) | undefined;
  activeProject?: {
    id: string;
    code: string;
    name: string;
    region: string;
    subtext?: string | undefined;
    descProyecto?: string | undefined;
    descSedes?: string | undefined;
    moduleDescriptions?: Record<string, string> | undefined;
  } | undefined;
  perspective?: 'maestro' | 'territorial' | 'equipo';
  isActive?: boolean;
}) {
  const projectId = activeProject?.id || 'p1';
  const currentPidRef = useRef(projectId);

  /* FASE 1 — Aislamiento de UI: claves de configuración de columnas/anchos por módulo+perspectiva
     (qaway-cronograma-{maestro|territorial|equipo}-*) para que la config de un módulo no pise la de otro. */
  const uiKey = (k: string) => `qaway-cronograma-${perspective}-${k}`;

  // Estado reactivo de tareas operativas sincronizadas desde /tareas
  const [rawTasks, setRawTasks] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('qaway-tasks-v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const loadProjectItems = (pid: string, tasksOverride?: any[]): Item[] => {
    const isMaestro = perspective === 'maestro' || perspective === 'equipo';
    const targetInitialItems = isMaestro ? MASTER_INITIAL_ITEMS : TERRITORIAL_INITIAL_ITEMS;
    const storageKey = isMaestro ? `qaway-gantt-items-${pid}-maestro` : `qaway-gantt-items-${pid}`;

    try {
      const saved = localStorage.getItem(storageKey) || (!isMaestro ? localStorage.getItem(`qaway-gantt-items-${pid}`) : null);
      if (saved) {
        let parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (isMaestro) {
            parsed = parsed.filter((it: Item) => !isTerritorialSedeOnlyItem(it));
            const hasAllComponents = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].every((n) =>
              parsed.some((it: Item) => it.id === `comp-${n}`)
            );
            const hasLegacy17 = parsed.some((it: Item) => it.id === 'pt-1.7a' || it.code === '1.7a');
            if (!hasAllComponents || parsed.length < 50 || hasLegacy17) {
              try {
                localStorage.setItem(storageKey, JSON.stringify(MASTER_INITIAL_ITEMS));
              } catch {}
              return MASTER_INITIAL_ITEMS;
            }
          }
          if (pid !== 'p1') {
            const isPolluted = parsed.some((it: Item) => it.id === 's11' || it.code === '1.1');
            if (isPolluted) {
              localStorage.setItem(storageKey, JSON.stringify([]));
              return [];
            }
          } else {
            // Detectar si el proyecto activo p1 contiene datos obsoletos de prueba (h1..h5, s11..s52, 'Nuevo hito', 'Nuevo subproceso', huérfanos)
            const hasLegacyMocks = parsed.some(
              (it: Item) =>
                isLegacyCronogramaItem(it) ||
                (Boolean(it.parentId) && !parsed.some((p: Item) => p.id === it.parentId)) ||
                it.name.toLowerCase().includes('husyan') ||
                it.name.toLowerCase().includes('adad')
            );
            if (!isMaestro && (hasLegacyMocks || parsed.length > 3000 || !parsed.some((it: Item) => it.id === 'comp-11') || !parsed.some((it: Item) => it.id === 'comp-1-dre-ancash') || parsed.some((it: Item) => it.id === 'pt-2.1-unit-001'))) {
              // Limpieza y migración automática y definitiva a los registros oficiales con desglose territorial de sedes completas
              try {
                localStorage.setItem(storageKey, JSON.stringify(TERRITORIAL_INITIAL_ITEMS));
                localStorage.removeItem(uiKey('collapsed-by-mode-v1'));
              } catch {}
              return TERRITORIAL_INITIAL_ITEMS;
            }
            if (isMaestro && (hasLegacyMocks || !parsed.some((it: Item) => it.id === 'comp-11') || parsed.some((it: Item) => isTerritorialSedeOnlyItem(it)))) {
              try {
                localStorage.setItem(storageKey, JSON.stringify(MASTER_INITIAL_ITEMS));
              } catch {}
              return MASTER_INITIAL_ITEMS;
            }
          }
          // Sincronizar dependencias maestras para ítems persistidos sin campo dependencies
          const initialMap = new Map(targetInitialItems.map((x) => [x.id, x]));
          const upgraded = parsed.map((it: Item) => {
            const init = initialMap.get(it.id);
            const isEntity = it.gestor === 'DRE / UGEL' || it.gestor === 'DRE' || it.gestor === 'UGEL' || it.gestor === 'DRE/UGEL' || !it.gestor;
            const finalGestor = isEntity ? (init?.gestor || resolveDefaultGestor(it.code, it.name)) : (it.gestor ?? '');
            const finalGestores = isEntity ? [finalGestor] : (it.gestores && it.gestores.length > 0 ? it.gestores : [finalGestor]);
            return {
              ...it,
              edtType: it.edtType || init?.edtType || resolveEdtNodeType(it, parsed),
              faseId: it.faseId !== undefined ? it.faseId : (init?.faseId ?? null),
              dependencies: (it.dependencies && it.dependencies.length > 0)
                ? it.dependencies
                : (init?.dependencies && init.dependencies.length > 0 ? init.dependencies : (OFFICIAL_WBS_DEPENDENCIES[it.id] || [])),
              gestor: finalGestor,
              gestores: finalGestores,
              entidadResponsable: it.entidadResponsable || init?.entidadResponsable,
            };
          });
          return computeWbsHierarchy(sortWbsHierarchy(upgraded), tasksOverride || rawTasks);
        }
      }
      if (pid === 'p1') {
        try {
          localStorage.setItem(storageKey, JSON.stringify(targetInitialItems));
          localStorage.removeItem(uiKey('collapsed-by-mode-v1'));
        } catch {
          /* fallback */
        }
        return targetInitialItems;
      }
      return []; // Nuevo proyecto siempre inicia completamente vacío / calato
    } catch {
      return pid === 'p1' ? targetInitialItems : [];
    }
  };

  const [items, setItems] = useState<Item[]>(() => loadProjectItems(projectId, rawTasks));

  // Sincronización reactiva con Keep-Alive al conmutar de proyecto o perspectiva
  const currentPerspectiveRef = useRef(perspective);
  useEffect(() => {
    if (currentPidRef.current !== projectId || currentPerspectiveRef.current !== perspective) {
      currentPidRef.current = projectId;
      currentPerspectiveRef.current = perspective;
      const loaded = loadProjectItems(projectId, rawTasks);
      setItems(loaded);
      setSelectedId(null);
    }
  }, [projectId, perspective]);

  /* Índices O(1) del EDT: evitan recorridos O(n²) al filtrar miles de ítems territoriales */
  const itemsById = useMemo(() => {
    const map = new Map<string, Item>();
    for (const it of items) map.set(it.id, it);
    return map;
  }, [items]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string, Item[]>();
    for (const it of items) {
      if (!it.parentId) continue;
      const bucket = map.get(it.parentId);
      if (bucket) bucket.push(it);
      else map.set(it.parentId, [it]);
    }
    return map;
  }, [items]);

  // Autocuración y persistencia inmediata de dependencias si provienen de caché anterior sin dependencias
  useEffect(() => {
    const hasAnyDep = items.some((it) => it.dependencies && it.dependencies.length > 0);
    if (!hasAnyDep && items.length > 0) {
      const targetInitial = perspective === 'maestro' ? MASTER_INITIAL_ITEMS : TERRITORIAL_INITIAL_ITEMS;
      const initialMap = new Map(targetInitial.map((x) => [x.id, x]));
      setItems((prev) =>
        prev.map((it) => {
          const init = initialMap.get(it.id);
          const official = OFFICIAL_WBS_DEPENDENCIES[it.id] || [];
          return {
            ...it,
            dependencies: it.dependencies && it.dependencies.length > 0 ? it.dependencies : (init?.dependencies && init.dependencies.length > 0 ? init.dependencies : official),
          };
        })
      );
    }
  }, [items, perspective]);

  // Carga asíncrona de datos desde Supabase (respaldo en nube permanente)
  useEffect(() => {
    if (!isActive || perspective !== 'maestro') return;
    let isCancelled = false;
    fetchCronogramaFromSupabase(projectId).then((cloudItems) => {
      if (!isCancelled && cloudItems && cloudItems.length > 0) {
        const isMaestro = perspective === 'maestro';
        const storageKey = isMaestro ? `qaway-gantt-items-${projectId}-maestro` : `qaway-gantt-items-${projectId}`;

        // Filtrar datos contaminados obsoletos si provienen de sesiones anteriores en BD y ordenar canónicamente
        let cleanCloudItems = sortWbsHierarchy(
          cloudItems.filter(
            (it) =>
              !isLegacyCronogramaItem(it) &&
              (!it.parentId || cloudItems.some((p) => p.id === it.parentId))
          ) as Item[]
        );

        if (isMaestro) {
          cleanCloudItems = cleanCloudItems.filter((it) => !isTerritorialSedeOnlyItem(it));
          // Reconciliar sobre MASTER_INITIAL_ITEMS garantizando los 11 componentes completos siempre
          const cloudMap = new Map(cleanCloudItems.map((c) => [c.id, c]));
          const merged: Item[] = MASTER_INITIAL_ITEMS.map((masterItem) => {
            const cloud = cloudMap.get(masterItem.id);
            if (!cloud) return masterItem;
            const updated: Item = { ...masterItem };
            if (typeof cloud.progress === 'number') updated.progress = cloud.progress;
            if (cloud.status) updated.status = cloud.status;
            if (cloud.start) updated.start = cloud.start;
            if (cloud.end) updated.end = cloud.end;
            if (cloud.actualStart) updated.actualStart = cloud.actualStart;
            if (cloud.actualEnd) updated.actualEnd = cloud.actualEnd;
            if (cloud.baselineStart) updated.baselineStart = cloud.baselineStart;
            if (cloud.baselineEnd) updated.baselineEnd = cloud.baselineEnd;
            return updated;
          });
          const recomputed = computeWbsHierarchy(merged, rawTasks);
          setItems(recomputed);
          try {
            localStorage.setItem(storageKey, JSON.stringify(recomputed));
            window.dispatchEvent(new CustomEvent('qaway-gantt-items-updated'));
          } catch {}
          return;
        }

        if (projectId === 'p1' && (cleanCloudItems.length < 5000 || !cleanCloudItems.some((it) => it.id === 'pt-2.1-unit-001'))) {
          setItems(TERRITORIAL_INITIAL_ITEMS);
          try {
            localStorage.setItem(storageKey, JSON.stringify(TERRITORIAL_INITIAL_ITEMS));
            window.dispatchEvent(new CustomEvent('qaway-gantt-items-updated'));
          } catch {}
        } else if (cleanCloudItems.length >= 5000) {
          const recomputed = computeWbsHierarchy(cleanCloudItems, rawTasks);
          setItems(recomputed);
          try {
            localStorage.setItem(storageKey, JSON.stringify(recomputed));
            window.dispatchEvent(new CustomEvent('qaway-gantt-items-updated'));
          } catch {}
        }
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [projectId, isActive, perspective]);

  // Sincronización reactiva bidireccional con el módulo de tareas operativas (/tareas)
  useEffect(() => {
    if (!isActive) return;
    const handleTasksUpdated = () => {
      try {
        const saved = localStorage.getItem('qaway-tasks-v1');
        const parsed = saved ? JSON.parse(saved) : [];
        setRawTasks(parsed);
        setItems((prevItems) => {
          const recomputed = computeWbsHierarchy(prevItems, parsed);
          try {
            localStorage.setItem(`qaway-gantt-items-${projectId}`, JSON.stringify(recomputed));
            window.dispatchEvent(new CustomEvent('qaway-gantt-items-updated'));
          } catch {}
          return recomputed;
        });
      } catch (e) {
        console.error('Error sincronizando tareas operativas con WBS:', e);
      }
    };

    window.addEventListener('qaway-tasks-updated', handleTasksUpdated);
    window.addEventListener('storage', handleTasksUpdated);
    return () => {
      window.removeEventListener('qaway-tasks-updated', handleTasksUpdated);
      window.removeEventListener('storage', handleTasksUpdated);
    };
  }, [projectId, isActive]);

  // Persistencia segura por proyecto activo (Doble capa: LocalStorage inmediato + Sincronización Supabase)
  useEffect(() => {
    if (!isActive) return;
    if (currentPidRef.current === projectId) {
      const isMaestro = perspective === 'maestro';
      const storageKey = isMaestro ? `qaway-gantt-items-${projectId}-maestro` : `qaway-gantt-items-${projectId}`;
      try {
        localStorage.setItem(storageKey, JSON.stringify(items));
        window.dispatchEvent(new CustomEvent('qaway-gantt-items-updated'));
      } catch {
        /* fallback */
      }
      // Sincronización a Supabase con debounce de 2.5s para no saturar la red ni congelar la UI
      if (isMaestro && items.length > 0) {
        const timer = setTimeout(() => {
          syncAllCronogramaItemsToSupabase(projectId, items as GanttItemData[]);
        }, 2500);
        return () => clearTimeout(timer);
      }
    }
  }, [items, projectId, isActive, perspective]);

  const [resizingCol, setResizingCol] = useState<ColKey | null>(null);
  const prevVisibleColsRef = useRef<ColKey[]>([...DEFAULT_VISIBLE_COLS]);

  const toggleCompactColumns = () => {
    if (visibleCols.length > 1) {
      prevVisibleColsRef.current = [...visibleCols];
      setVisibleCols(['name']);
      notify('Vista compacta: solo Componente/Subcomponente y lienzo Gantt visible');
    } else {
      const restored = prevVisibleColsRef.current.length > 1 ? prevVisibleColsRef.current : [...DEFAULT_VISIBLE_COLS];
      setVisibleCols(restored);
      notify('Todas las columnas del cronograma restauradas');
    }
  };

  const [colWidths, setColWidths] = useState<Record<ColKey, number>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(uiKey('gantt-cols-v5')) || 'null');
      if (saved && typeof saved === 'object') {
        const merged: Record<ColKey, number> = { ...DEFAULT_COLS };
        (Object.keys(DEFAULT_COLS) as ColKey[]).forEach((k) => {
          if (typeof saved[k] === 'number' && saved[k] >= (MIN_COLS[k] ?? 0)) merged[k] = saved[k];
        });
        return merged;
      }
    } catch {
      /* almacenamiento no disponible */
    }
    return { ...DEFAULT_COLS };
  });

  const [selectedId, setSelectedId] = useState<string | null>('h1');
  const selected = items.find((x) => x.id === selectedId);

  const getItemDepth = (item: Item): number => {
    let d = 0;
    let curr = item.parentId;
    while (curr) {
      d++;
      const p = items.find((it) => it.id === curr);
      curr = p?.parentId;
    }
    return d;
  };

  // Estados del editor y panel lateral (Drawer de Coordinador)
  const [drawerDraft, setDrawerDraft] = useState<Item | null>(null);
  const [isNewDraft, setIsNewDraft] = useState<boolean>(false);
  const [editorTab, setEditorTab] = useState<'info' | 'subprocesos' | 'dependencias'>('info');
  const [editorInitialSnapshot, setEditorInitialSnapshot] = useState<string>('');
  const [panelOpen, setPanelOpen] = useState(false);
  const [unsavedAlertOpen, setUnsavedAlertOpen] = useState(false);
  const [pendingCloseAction, setPendingCloseAction] = useState<(() => void) | null>(null);
  const [editorReportTypeOpen, setEditorReportTypeOpen] = useState(false);
  const [editorStatusOpen, setEditorStatusOpen] = useState(false);
  const [editorCalOpen, setEditorCalOpen] = useState<'start' | 'end' | null>(null);
  const [editorHitoSelectOpen, setEditorHitoSelectOpen] = useState(false);
  const [editorParentSelectOpen, setEditorParentSelectOpen] = useState(false);
  const [editorDepSelectOpen, setEditorDepSelectOpen] = useState(false);

  const [showAddDeliverable, setShowAddDeliverable] = useState(false);
  const [newDelivName, setNewDelivName] = useState('');
  const [newDelivType, setNewDelivType] = useState<DeliverableFormat>('document');
  const [newDelivUrl, setNewDelivUrl] = useState('');
  const [, setForceTasksNonce] = useState(0);

  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [taskModalMilestone, setTaskModalMilestone] = useState('');
  const [taskOwnerOpen, setTaskOwnerOpen] = useState(false);
  const [taskPriorityOpen, setTaskPriorityOpen] = useState(false);
  const [newTaskCalOpen, setNewTaskCalOpen] = useState(false);
  const [newTaskForm, setNewTaskForm] = useState({
    title: '',
    owner: 'Carlos Sandoval',
    due: '2026-11-30',
    priority: 'Media' as 'Alta' | 'Media' | 'Baja',
  });

  const activeItem = drawerDraft || selected;

  // Referencias para blindaje contra stale closures y escape handler
  const drawerDraftRef = useRef(drawerDraft);
  drawerDraftRef.current = drawerDraft;
  const editorInitialSnapshotRef = useRef(editorInitialSnapshot);
  editorInitialSnapshotRef.current = editorInitialSnapshot;
  const panelOpenRef = useRef(panelOpen);
  panelOpenRef.current = panelOpen;
  const deleteConfirmModalOpenRef = useRef(deleteConfirmModalOpen);
  const unsavedAlertOpenRef = useRef(unsavedAlertOpen);
  unsavedAlertOpenRef.current = unsavedAlertOpen;
  deleteConfirmModalOpenRef.current = deleteConfirmModalOpen;
  const isNewDraftRef = useRef(isNewDraft);
  isNewDraftRef.current = isNewDraft;
  const selectedRef = useRef(selected);
  selectedRef.current = selected;

  const captureSnapshot = (item: Item | undefined | null) => {
    if (!item) return '';
    return JSON.stringify({
      name: item.name || '',
      description: item.description || '',
      start: item.start || '',
      end: item.end || '',
      reportType: item.reportType || '',
      status: item.status || '',
      progress: item.progress || 0,
      deliverable: item.deliverable || '',
      deliverables: item.deliverables || [],
      attachments: item.attachments || [],
      parentId: item.parentId || '',
      edtType: item.edtType || '',
      faseId: item.faseId || null,
      baselineStart: item.baselineStart || '',
      baselineEnd: item.baselineEnd || '',
      actualStart: item.actualStart || '',
      actualEnd: item.actualEnd || '',
    });
  };

  const isEditorDirty = () => {
    const target = drawerDraftRef.current || selectedRef.current;
    if (!target || !editorInitialSnapshotRef.current) return false;
    const current = captureSnapshot(target);
    return current !== editorInitialSnapshotRef.current;
  };

  const requestCloseDrawer = (action?: () => void) => {
    setEditorCalOpen(null);
    setEditorReportTypeOpen(false);
    setEditorStatusOpen(false);
    setEditorHitoSelectOpen(false);
    setEditorParentSelectOpen(false);
    setEditorDepSelectOpen(false);

    if (isEditorDirty()) {
      setPendingCloseAction(() => action || (() => {
        setPanelOpen(false);
        setDrawerDraft(null);
        setIsNewDraft(false);
        setEditorInitialSnapshot('');
      }));
      setUnsavedAlertOpen(true);
    } else {
      setPanelOpen(false);
      setDrawerDraft(null);
      setIsNewDraft(false);
      setEditorInitialSnapshot('');
      if (action) {
        action();
      }
    }
  };

  const openEditorForItem = (item: Item, preserveTab: boolean = false) => {
    setSelectedId(item.id);
    setDrawerDraft({ ...item });
    setIsNewDraft(false);
    setEditorInitialSnapshot(captureSnapshot(item));
    if (!preserveTab) {
      setEditorTab('info');
    }
    setPanelOpen(true);
  };

  const updateDraft = (p: Partial<Item>) => {
    setDrawerDraft((prev) => (prev ? { ...prev, ...p } : null));
  };

  const setDraftStart = (v: string) => {
    if (!v || !drawerDraft) return;
    updateDraft(v > drawerDraft.end ? { start: v, end: v } : { start: v });
  };

  const setDraftEnd = (v: string) => {
    if (!v || !drawerDraft) return;
    updateDraft(v < drawerDraft.start ? { start: v, end: v } : { end: v });
  };

  const setDraftProgress = (v: number) => {
    if (!drawerDraft) return;
    updateDraft({
      progress: v,
      status: v >= 100 ? 'Cumple' : v === 0 ? 'Pendiente' : 'En proceso',
    });
  };

  const setDraftStatus = (s: Status) => {
    if (!drawerDraft) return;
    let newProgress = drawerDraft.progress;
    if (s === 'Pendiente') {
      newProgress = 0;
    } else if (s === 'Completado' || s === 'Cumple') {
      newProgress = 100;
    } else if (s === 'En proceso' || s === 'En curso') {
      if (newProgress === 0 || newProgress === 100) newProgress = 50;
    }
    updateDraft({ status: s, progress: newProgress });
  };

  const handleSaveDrawer = () => {
    if (!drawerDraft) return;
    if (!drawerDraft.name.trim()) {
      notify('El nombre no puede estar vacío');
      return;
    }
    if (isNewDraft) {
      commitChange((old) =>
        drawerDraft.kind === 'subproceso' && drawerDraft.parentId
          ? old.flatMap((x) => (x.id === drawerDraft.parentId ? [x, drawerDraft] : [x]))
          : [...old, drawerDraft]
      );
      notify(`Nuevo ${drawerDraft.kind === 'hito' ? 'componente' : 'subcomponente'} guardado con éxito en el cronograma maestro`);
    } else {
      commitChange((old) => old.map((x) => (x.id === drawerDraft.id ? applyActuals(x, drawerDraft, currentTodayIso) : x)));
      notify('Cambios guardados con éxito en el cronograma maestro');
    }
    setEditorInitialSnapshot('');
    setDrawerDraft(null);
    setIsNewDraft(false);
    setPanelOpen(false);
  };

  const getLinkedTasks = (milestoneName?: string) => {
    if (!milestoneName) return [];
    try {
      const raw = JSON.parse(localStorage.getItem('qaway-tasks-v1') || '[]');
      if (Array.isArray(raw)) {
        return raw.filter((t: any) => t.milestone === milestoneName);
      }
    } catch {
      /* fallback */
    }
    return [];
  };

  const handleOpenCreateTaskModal = (milestoneName: string) => {
    setTaskModalMilestone(milestoneName);
    setTaskOwnerOpen(false);
    setTaskPriorityOpen(false);
    setNewTaskCalOpen(false);
    setNewTaskForm({
      title: '',
      owner: activeItem?.gestor || 'Carlos Sandoval',
      due: activeItem?.end || '2026-11-30',
      priority: 'Media',
    });
    setCreateTaskModalOpen(true);
  };

  const handleConfirmCreateTask = () => {
    if (!newTaskForm.title.trim()) {
      notify('Ingresa el título de la tarea');
      return;
    }
    try {
      const raw = JSON.parse(localStorage.getItem('qaway-tasks-v1') || '[]');
      const list = Array.isArray(raw) ? raw : [];
      const newTask = {
        id: Math.max(0, ...list.map((x: any) => x.id || 0)) + 1,
        title: newTaskForm.title.trim(),
        milestone: taskModalMilestone || activeItem?.name || 'Hito del cronograma',
        owner: newTaskForm.owner,
        due: newTaskForm.due || activeItem?.end || '2026-11-30',
        status: 'Pendiente',
        priority: newTaskForm.priority,
        origin: 'Hito del proyecto',
        kind: 'Vinculada al cronograma',
        deliverable: activeItem?.deliverable || 'Entregable de hito',
        description: `Tarea operativa para el cumplimiento de ${taskModalMilestone}`,
        checklist: [],
        comments: [],
        attachments: [],
        history: [{ text: 'Tarea creada desde el cronograma maestro', date: new Date().toLocaleString('es-PE') }],
      };
      const nextList = [newTask, ...list];
      localStorage.setItem('qaway-tasks-v1', JSON.stringify(nextList));
      setForceTasksNonce((n) => n + 1);
      setCreateTaskModalOpen(false);
      notify(`Tarea "${newTaskForm.title.trim()}" vinculada y agregada al módulo Tareas`);
      window.dispatchEvent(new CustomEvent('qaway-tasks-updated'));
    } catch {
      notify('Error al crear tarea vinculada');
    }
  };

  const handleToggleTask = (taskId: number) => {
    try {
      const raw = JSON.parse(localStorage.getItem('qaway-tasks-v1') || '[]');
      if (Array.isArray(raw)) {
        const nextList = raw.map((t: any) => {
          if (t.id === taskId) {
            const isDone = t.status === 'Cumple' || t.status === 'Completado' || t.status === 'Completada';
            return { ...t, status: isDone ? 'Pendiente' : 'Cumple' };
          }
          return t;
        });
        localStorage.setItem('qaway-tasks-v1', JSON.stringify(nextList));
        window.dispatchEvent(new CustomEvent('qaway-tasks-updated'));
        setForceTasksNonce((n) => n + 1);
        notify('Estado de tarea operativa actualizado');
      }
    } catch {
      /* fallback */
    }
  };

  const handleSwitchActiveHito = (targetHito: Item) => {
    if (targetHito.id === activeItem?.id) return;
    if (isEditorDirty()) {
      setPendingCloseAction(() => () => {
        openEditorForItem(targetHito, true);
      });
      setUnsavedAlertOpen(true);
    } else {
      openEditorForItem(targetHito, true);
    }
  };

  const getActiveDeliverables = (item: Item): DeliverableItem[] => {
    if (item.deliverables && item.deliverables.length > 0) {
      return item.deliverables;
    }
    if (item.deliverable && item.deliverable.trim()) {
      return [
        {
          id: 'deliv-legacy',
          name: item.deliverable.trim(),
          type: 'document',
        },
      ];
    }
    return [];
  };

  const handleAddDeliverable = (deliv: Omit<DeliverableItem, 'id'>) => {
    if (!activeItem) return;
    const currentList = getActiveDeliverables(activeItem);
    const itemToAdd: DeliverableItem = {
      ...deliv,
      id: `deliv-${Date.now()}`,
    };
    const updated = [...currentList, itemToAdd];
    updateDraft({
      deliverables: updated,
      deliverable: updated.map((d) => d.name).join('; '),
    });
    setShowAddDeliverable(false);
    setNewDelivName('');
    setNewDelivUrl('');
    notify(`Entregable "${deliv.name}" agregado`);
  };

  const handleRemoveDeliverable = (delivId: string) => {
    if (!activeItem) return;
    const currentList = getActiveDeliverables(activeItem);
    const updated = currentList.filter((d) => d.id !== delivId);
    updateDraft({
      deliverables: updated,
      deliverable: updated.map((d) => d.name).join('; '),
    });
    notify('Entregable eliminado');
  };

  const handleOpenDeliverable = (deliv: DeliverableItem) => {
    if (deliv.url && (deliv.url.startsWith('http://') || deliv.url.startsWith('https://'))) {
      window.open(deliv.url, '_blank', 'noopener,noreferrer');
      return;
    }
    const typeLabel =
      deliv.type === 'spreadsheet'
        ? 'Hoja de Cálculo / Matriz'
        : deliv.type === 'presentation'
        ? 'Presentación / Canva'
        : deliv.type === 'link'
        ? 'Enlace Externo'
        : deliv.type === 'physical'
        ? 'Entrega Física / Inspección'
        : 'Documento Oficial';

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${deliv.name} · Visor de Entregable Oficial - Qaway Lab</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 40px 20px; display: flex; justify-content: center; }
          .container { max-width: 800px; width: 100%; background: #ffffff; color: #0f172a; border-radius: 12px; padding: 32px; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.3); }
          .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; background: #e0f2fe; color: #0369a1; text-transform: uppercase; margin-bottom: 12px; }
          h1 { margin: 0 0 8px; font-size: 22px; color: #0f172a; }
          p { margin: 4px 0 20px; color: #64748b; font-size: 14px; line-height: 1.5; }
          .meta-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 24px; }
          .btn-group { display: flex; gap: 12px; }
          .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px; font-size: 13px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; }
          .btn-primary { background: #2563eb; color: #ffffff; }
          .btn-secondary { background: #f1f5f9; color: #334155; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="badge">${typeLabel}</div>
          <h1>${deliv.name}</h1>
          <p>Entregable oficial vinculado al proyecto ${activeProject?.name || 'Gestión de Proyectos'}.</p>
          <div class="meta-box">
            <div><strong>Hito / Etapa Asociada:</strong> ${activeItem?.name || 'Hito del cronograma'}</div>
            <div style="margin-top:6px;"><strong>Estado Actual:</strong> ${activeItem?.status || 'En proceso'} (${activeItem?.progress || 0}%)</div>
            <div style="margin-top:6px;"><strong>Tipo de Instrumento:</strong> ${typeLabel}</div>
            ${deliv.url ? `<div style="margin-top:6px;"><strong>URL Origen:</strong> <a href="${deliv.url}" target="_blank">${deliv.url}</a></div>` : ''}
          </div>
          <div class="btn-group">
            <button class="btn btn-primary" onclick="window.print()">Imprimir / Guardar como PDF</button>
            <button class="btn btn-secondary" onclick="window.close()">Cerrar visor</button>
          </div>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  };

  const getActiveAttachments = (item: Item): AttachmentItem[] => {
    if (item.attachments && item.attachments.length > 0) {
      return item.attachments;
    }
    if (attachment && attachment.trim()) {
      return [
        {
          id: 'att-legacy',
          name: attachment.trim(),
          date: '28/10/2026',
        },
      ];
    }
    return [];
  };

  const handleAddAttachments = (fileList: FileList | null) => {
    if (!fileList || !activeItem) return;
    const currentList = getActiveAttachments(activeItem);
    const newItems: AttachmentItem[] = [];
    const dateStr = new Date().toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      if (!file) continue;
      newItems.push({
        id: `att-${Date.now()}-${i}`,
        name: file.name,
        date: dateStr,
        type: file.type || 'application/octet-stream',
      });
    }
    const updated = [...currentList, ...newItems];
    updateDraft({
      attachments: updated,
    });
    setAttachment(updated[0]?.name || '');
    notify(`${newItems.length} documento(s) de sustento adjuntado(s)`);
  };

  const handleRemoveAttachment = (attId: string) => {
    if (!activeItem) return;
    const currentList = getActiveAttachments(activeItem);
    const updated = currentList.filter((a) => a.id !== attId);
    updateDraft({ attachments: updated });
    setAttachment(updated[0]?.name || '');
    notify('Documento de sustento eliminado');
  };

  const handleOpenAttachment = (att: AttachmentItem) => {
    if (att.url && (att.url.startsWith('http://') || att.url.startsWith('https://'))) {
      window.open(att.url, '_blank', 'noopener,noreferrer');
      return;
    }
    const htmlContent = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>${att.name} · Sustento Oficial - Qaway Lab</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; margin: 0; padding: 24px; color: #f8fafc; }
          .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
          .title { font-size: 18px; font-weight: 700; }
          .content-preview { background: #ffffff; color: #0f172a; border-radius: 8px; padding: 36px; min-height: 450px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
          .btn { background: #0284c7; color: white; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 13px; border: none; cursor: pointer; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="title">📄 ${att.name}</div>
          <div>
            <button class="btn" onclick="window.print()">Descargar / Imprimir</button>
          </div>
        </div>
        <div class="content-preview">
          <h2>Sustento Oficial del Proyecto</h2>
          <p><strong>Archivo:</strong> ${att.name}</p>
          <p><strong>Fecha de carga:</strong> ${att.date || new Date().toLocaleDateString('es-PE')}</p>
          <p><strong>Asociado a:</strong> ${activeItem?.name || 'Hito del cronograma'}</p>
          <hr style="margin: 20px 0; border: 0; border-top: 1px solid #e2e8f0;" />
          <p style="color: #64748b; font-size: 14px;">
            Este documento está certificado en el repositorio del proyecto ${activeProject?.name || 'Gestión de Proyectos'}.
          </p>
        </div>
      </body>
      </html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const blobUrl = URL.createObjectURL(blob);
    window.open(blobUrl, '_blank');
  };
  interface ColConfigSnapshot {
    visibleCols: ColKey[];
    customCols: CustomColDef[];
    colTypeOverrides: Record<string, string>;
    colCustomLabels: Record<string, string>;
    colCalculations: Record<string, string>;
    percentGraphFormats: Record<string, 'bar' | 'ring' | 'number'>;
    wrappedCols: string[];
    frozenCols: string[];
  }
  interface GanttHistoryEntry {
    items: Item[];
    colConfig: ColConfigSnapshot;
  }
  const [history, setHistory] = useState<GanttHistoryEntry[]>([]);
  const [redoHistory, setRedoHistory] = useState<GanttHistoryEntry[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [isDocked] = useState(false);
  const [viewMode, setViewMode] = useState<
    'portada' | 'gantt' | 'lista' | 'kanban' | 'calendario' | 'mapa' | 'arbol' | 'organigrama' | 'organigrama-flow' | 'directorio' | 'sedes' | 'carga'
  >(() => (perspective === 'equipo' ? 'lista' : (perspective === 'territorial' ? 'portada' : 'gantt')));

  useEffect(() => {
    if (perspective !== 'territorial' && viewMode === 'portada') {
      setViewMode('gantt');
    }
  }, [perspective, viewMode]);

  // Estado dedicado para perspectiva equipo (100% Supabase directo, cero datos locales estáticos)
  const [equipoIntegrantes, setEquipoIntegrantes] = useState<any[]>([]);
  const [equipoSedes, setEquipoSedes] = useState<any[]>([]);
  const [equipoAreas] = useState<any[]>([]);
  const [equipoAsignaciones, setEquipoAsignaciones] = useState<any[]>([]);
  const [isEquipoLoading, setIsEquipoLoading] = useState<boolean>(true);
  const [equipoSelectedId, setEquipoSelectedId] = useState<string | null>(null);
  const [equipoExpediente, setEquipoExpediente] = useState<any | null>(null);
  const [isEquipoNuevoOpen, setIsEquipoNuevoOpen] = useState(false);
  const [isSedeNuevaOpen, setIsSedeNuevaOpen] = useState(false);
  const [equipoSedeFilter, setEquipoSedeFilter] = useState('todas');
  const [equipoEstadoOpFilter, setEquipoEstadoOpFilter] = useState('todos');
  const [equipoEstadoCuentaFilter, setEquipoEstadoCuentaFilter] = useState('todos');
  const [equipoAreaFilter, setEquipoAreaFilter] = useState('todas');
  const [equipoPill, setEquipoPill] = useState('Todos');

  // Carga reactiva de integrantes y sedes directamente desde Supabase (cero fallbacks locales)
  useEffect(() => {
    if (perspective === 'equipo' && isActive) {
      let isMounted = true;
      setIsEquipoLoading(true);

      Promise.all([
        fetchEquipoIntegrantesFromSupabase(),
        fetchEquipoSedesFromSupabase(),
      ])
        .then(([integrantes, sedes]) => {
          if (isMounted) {
            setEquipoIntegrantes(Array.isArray(integrantes) ? integrantes : []);
            setEquipoSedes(Array.isArray(sedes) ? sedes : []);
            setIsEquipoLoading(false);
          }
        })
        .catch((e) => {
          console.warn('[CronogramaGanttView] Error cargando equipo Supabase:', e);
          if (isMounted) setIsEquipoLoading(false);
        });

      return () => {
        isMounted = false;
      };
    }
  }, [perspective, isActive]);

  const equipoMetrics = useMemo(() => {
    const total = equipoIntegrantes.length;
    const activos = equipoIntegrantes.filter((i) => i.estadoOperativo === 'En funciones').length;
    const licencias = equipoIntegrantes.filter((i) => i.estadoOperativo === 'Licencia / Permiso').length;
    const pendientesCuenta = equipoIntegrantes.filter((i) => i.estadoCuenta === 'Invitación Pendiente').length;
    const alertasAtrasadas = equipoAsignaciones.filter((a) => a.estado === 'Atrasado').length;
    const totalEsfuerzoActivo = equipoAsignaciones
      .filter((a) => a.estado !== 'Completado')
      .reduce((sum, a) => sum + (a.esfuerzoHoras || 0), 0);
    const totalCapacidad = equipoIntegrantes.reduce((sum, i) => sum + (i.capacidadNominalHorasSemana || 40), 0);
    const ocupacionPromedio = totalCapacidad > 0 ? Math.round((totalEsfuerzoActivo / totalCapacidad) * 100) : 0;
    return { total, activos, licencias, pendientesCuenta, alertasAtrasadas, ocupacionPromedio };
  }, [equipoIntegrantes, equipoAsignaciones]);

  const equipoSelectedIntegrante = useMemo(() => {
    return equipoIntegrantes.find((i) => i.id === equipoSelectedId) || null;
  }, [equipoIntegrantes, equipoSelectedId]);

  const handleUpdateIntegrante = (updated: any) => {
    const next = equipoIntegrantes.map((i) => (i.id === updated.id ? updated : i));
    setEquipoIntegrantes(next);
    updateCachedIntegrante(updated);
    notify(`Integrante "${updated.nombreCompleto}" actualizado`);
  };

  const handleCreateIntegrante = (nuevo: any) => {
    const next = [nuevo, ...equipoIntegrantes];
    setEquipoIntegrantes(next);
    notify(`Integrante "${nuevo.nombreCompleto}" registrado exitosamente`);
  };

  const handleCreateSede = (nueva: any) => {
    const formatted = {
      id: nueva.id,
      name: nueva.name,
      region: nueva.region || '',
      unitType: nueva.unitType || 'ugel',
      status: nueva.status || 'active',
      gestor: nueva.gestor || 'Gestor Territorial',
    };
    UNIDADES_REMOTAS = null;
    setUnidades((prev) => [formatted, ...prev]);

    if (perspective === 'territorial') {
      const isDre = nueva.unitType === 'dre' || nueva.unitType === 'central';
      const newItem: any = {
        id: nueva.id || `sede-${Date.now()}`,
        code: nueva.code || '',
        name: nueva.name,
        edtType: isDre ? 'PRODUCTO' : 'PAQUETE_TRABAJO',
        wbsNodeType: isDre ? 'PRODUCTO' : 'PAQUETE_TRABAJO',
        kind: 'subproceso',
        faseId: 'FASE-PLANIFICACION',
        parentId: nueva.parentUnitId || 'comp-1',
        entidadResponsable: isDre ? 'DRE' : 'UGEL',
        unitType: nueva.unitType,
        region: nueva.region || 'Junín',
        gestor: nueva.gestor || 'Gestor Territorial',
        start: new Date().toISOString().split('T')[0],
        end: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
        progress: 0,
        status: 'En proceso',
      };
      commitChange((old) => [newItem, ...old]);
    }
    notify(`Sede "${nueva.name}" registrada exitosamente en Supabase`);
  };

  const handleBulkUpdateSede = (ids: string[], targetSedeId: string) => {
    const sedeObj = equipoSedes.find((s) => s.id === targetSedeId);
    const next = equipoIntegrantes.map((i) =>
      ids.includes(i.id) ? { ...i, sedeId: targetSedeId, sedeNombre: sedeObj?.nombre || i.sedeNombre } : i
    );
    setEquipoIntegrantes(next);
    notify(`${ids.length} integrantes reasignados a ${sedeObj?.nombre || 'nueva sede'}`);
  };

  const handleBulkUpdateEstadoOperativo = (ids: string[], targetEstado: any) => {
    const next = equipoIntegrantes.map((i) => (ids.includes(i.id) ? { ...i, estadoOperativo: targetEstado } : i));
    setEquipoIntegrantes(next);
    notify(`${ids.length} integrantes actualizados a estado "${targetEstado}"`);
  };

  const handleBulkReenviarInvitaciones = (ids: string[]) => {
    notify(`Invitaciones de acceso reenviadas a ${ids.length} integrantes`);
  };

  const handleUpdateSede = (updatedSede: any) => {
    const next = equipoSedes.map((s) => (s.id === updatedSede.id ? updatedSede : s));
    setEquipoSedes(next);
    notify(`Sede "${updatedSede.nombre}" actualizada`);
  };

  const handleReasignarTarea = (asignacionId: string, nuevoIntegranteId: string) => {
    const nuevoIntegrante = equipoIntegrantes.find((i) => i.id === nuevoIntegranteId);
    const next = equipoAsignaciones.map((a) => (a.id === asignacionId ? { ...a, integranteId: nuevoIntegranteId } : a));
    setEquipoAsignaciones(next);
    notify(`Tarea reasignada a ${nuevoIntegrante?.nombreCompleto || 'nuevo integrante'}`);
  };
  // Las tarjetas superiores se ocultan de entrada en pantallas pequeñas (<1024px),
  // tal como se pidió; el botón del ojo alterna como siempre.
  // Las tarjetas superiores cargan ocultas por defecto en todas las resoluciones;
  // el usuario las activa haciendo clic en el botón del ojo.
  const [showSummaryCards, setShowSummaryCards] = useState(false);
  const [tab, setTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  // Multiselección de estados operativos
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const toggleState = (st: string) => {
    setSelectedStates((prev) =>
      prev.includes(st) ? prev.filter((x) => x !== st) : [...prev, st]
    );
  };
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [expandedRegion, setExpandedRegion] = useState<string | null>(null);

  const toggleRegion = (regionName: string) => {
    setSelectedRegions((prev) => {
      if (prev.includes(regionName)) {
        return prev.filter((r) => r !== regionName);
      } else {
        return [...prev, regionName];
      }
    });
  };

  // Selecciona / quita todas las regiones de una macro-region (preserva las demas).
  const toggleMacroRegions = (regiones: string[]) => {
    setSelectedRegions((prev) => {
      const todasMarcadas = regiones.every((r) => prev.includes(r));
      if (todasMarcadas) return prev.filter((r) => !regiones.includes(r));
      const next = [...prev];
      regiones.forEach((r) => {
        if (!next.includes(r)) next.push(r);
      });
      return next;
    });
  };

  const regionButtonText = useMemo(() => {
    if (selectedRegions.length === 0) return 'Todas';
    if (selectedRegions.length === 1) return selectedRegions[0];
    if (selectedRegions.length === 2) return `${selectedRegions[0]}, ${selectedRegions[1]}`;
    return `${selectedRegions.length} regiones`;
  }, [selectedRegions]);
  const [phaseFilter, setPhaseFilter] = useState('Todas');
  const selectedPhaseLabel = useMemo(() => {
    if (phaseFilter === 'Todas') return 'Todas las fases';
    const found = PROJECT_PHASES_CATALOG.find((p) => p.id === phaseFilter || p.name === phaseFilter);
    return found ? found.name : phaseFilter;
  }, [phaseFilter]);

  const getPhaseItemCount = useCallback(
    (phaseIdOrName: string) => {
      const pObj = PROJECT_PHASES_CATALOG.find((p) => p.id === phaseIdOrName || p.name === phaseIdOrName);
      const targetId = pObj?.id || phaseIdOrName;
      const targetName = pObj?.name || phaseIdOrName;
      return items.filter((it) => {
        const parent = it.parentId ? items.find((p) => p.id === it.parentId) : undefined;
        return (
          it.phase === targetId ||
          it.phase === targetName ||
          it.faseId === targetId ||
          it.faseId === targetName ||
          parent?.phase === targetId ||
          parent?.phase === targetName ||
          parent?.faseId === targetId ||
          parent?.faseId === targetName
        );
      }).length;
    },
    [items]
  );
  const [gestorFilter, setGestorFilter] = useState('Todos');
  const [selectedSedes, setSelectedSedes] = useState<string[]>([]);
  const [selectedEdtCodes, setSelectedEdtCodes] = useState<string[]>([]);

  // Unidades operativas (DRE / UGEL) del filtro territorial: Supabase gestor_unidades
  // (REGION_UGEL.xlsx) con respaldo inmediato del catálogo local idéntico.
  const [unidades, setUnidades] = useState<any[]>(() =>
    MINEDU_UNIDADES.map((u) => ({ name: u.name, region: u.region, unitType: u.unitType, status: u.status }))
  );

  useEffect(() => {
    if (UNIDADES_REMOTAS) {
      setUnidades(UNIDADES_REMOTAS);
      return;
    }
    let alive = true;
    listGestorUnits(null)
      .then((rows) => {
        if (!alive || !rows || rows.length === 0) return;
        const mapped = rows
          .filter((u) => u.status !== 'archived')
          .map((u) => ({
            name: u.name,
            region: u.region ?? '',
            unitType: u.unitType ?? 'ugel',
            status: u.status ?? 'active',
          }));
        if (mapped.length > 0) {
          UNIDADES_REMOTAS = mapped;
          setUnidades(mapped);
        }
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  const availableSedes = useMemo(() => {
    const set = new Set<string>();
    unidades.forEach((u) => {
      if (u.name) set.add(u.name);
    });
    if (items && Array.isArray(items)) {
      items.forEach((it) => {
        if (it?.sede) set.add(it.sede);
        if (it?.name?.startsWith('UGEL ')) set.add(it.name);
      });
    }
    return Array.from(set);
  }, [unidades, items]);

  // El catálogo de unidades siembra la lista SIEMPRE; el filtro REGIÓN recorta por
  // 'region' de la unidad (ambito). Las sedes que solo viven en los ítems del
  // cronograma conservan la cascada original ítem-impulsada.
  const availableSedesCascaded = useMemo(() => {
    const regionsUpper = selectedRegions.map((r) => normalizeRegionKey(r));
    const enAmbito = unidades
      .filter(
        (u) => u.name && (regionsUpper.length === 0 || regionsUpper.includes(normalizeRegionKey(u.region)))
      )
      .map((u) => u.name);
    const unitNames = new Set(enAmbito);
    const extras = availableSedes.filter((sede) => !unitNames.has(sede));
    if (regionsUpper.length === 0) return [...enAmbito, ...extras];
    return [
      ...enAmbito,
      ...extras.filter((sedeName) =>
        items.some((it) => {
          const matchRegion = it.region && selectedRegions.includes(it.region);
          const matchSede =
            it.sede === sedeName ||
            it.distrito === sedeName ||
            (it.name && it.name.includes(sedeName));
          return matchRegion && matchSede;
        })
      ),
    ];
  }, [unidades, availableSedes, selectedRegions, items]);

  // Dropdown SEDE agrupado por región: mismos títulos de región que el picker REGIÓN
  // (orden macro-regional del catálogo). La cascada ítem-impulsada queda intacta;
  // sedes fuera del catálogo (ítems) caen al grupo final "Otras sedes".
  const sedesAgrupadas = useMemo(() => {
    const regionDeSede = new Map<string, string>();
    unidades.forEach((u) => {
      if (u.name && !regionDeSede.has(u.name)) regionDeSede.set(u.name, normalizeRegionKey(u.region));
    });
    const grupos: { region: string; sedes: string[] }[] = [];
    const enGrupo = new Set<string>();
    MACROREGIONES_NACIONAL.forEach((macro) => {
      macro.regiones.forEach((regName) => {
        const key = normalizeRegionKey(regName);
        const sedes = availableSedesCascaded
          .filter((sede) => regionDeSede.get(sede) === key)
          .sort((a, b) => a.localeCompare(b, 'es'));
        if (sedes.length > 0) {
          grupos.push({ region: regName, sedes });
          sedes.forEach((s) => enGrupo.add(s));
        }
      });
    });
    const resto = availableSedesCascaded.filter((s) => !enGrupo.has(s));
    if (resto.length > 0) {
      if (grupos.length > 0) grupos.push({ region: 'Otras sedes', sedes: resto });
      else grupos.push({ region: 'Sedes / UGEL Operativas', sedes: resto });
    }
    return grupos;
  }, [unidades, availableSedesCascaded]);

  const availableGestores = useMemo(() => {
    const set = new Set<string>();
    if (items && Array.isArray(items)) {
      items.forEach((it) => {
        getItemGestores(it).forEach((g) => {
          if (g && g !== 'Sin asignar') set.add(g);
        });
      });
    }
    GESTOR_OPTIONS.forEach((g) => {
      if (g.value !== 'Todos' && g.value !== 'Sin asignar') set.add(g.value);
    });
    return Array.from(set);
  }, [items]);

  const availableGestoresCascaded = useMemo(() => {
    if (selectedSedes.length > 0) {
      const gSet = new Set<string>();
      items.forEach((it) => {
        const matchSede = selectedSedes.some((s) => {
          const tLower = s.toLowerCase();
          return (
            (it.sede && it.sede.toLowerCase().includes(tLower)) ||
            (it.distrito && it.distrito.toLowerCase().includes(tLower)) ||
            (it.name && it.name.toLowerCase().includes(tLower))
          );
        });
        if (matchSede) {
          getItemGestores(it).forEach((g) => {
            if (g && g !== 'Sin asignar') gSet.add(g);
          });
        }
      });
      if (gSet.size > 0) return Array.from(gSet);
    }
    if (selectedRegions.length > 0) {
      const gSet = new Set<string>();
      items.forEach((it) => {
        if (it.region && selectedRegions.includes(it.region)) {
          getItemGestores(it).forEach((g) => {
            if (g && g !== 'Sin asignar') gSet.add(g);
          });
        }
      });
      if (gSet.size > 0) return Array.from(gSet);
    }
    return availableGestores;
  }, [availableGestores, selectedSedes, selectedRegions, items]);

  const sedeButtonText = useMemo(() => {
    if (selectedSedes.length === 0) {
      if (gestorFilter !== 'Todos') return gestorFilter;
      return 'Todas las sedes';
    }
    if (selectedSedes.length === 1) {
      const short = (selectedSedes[0] || '').replace(' (Sede Regional Matriz)', '');
      if (gestorFilter !== 'Todos') {
        return `${short} · ${gestorFilter.split(' ')[0]}`;
      }
      return short;
    }
    return `${selectedSedes.length} sedes`;
  }, [selectedSedes, gestorFilter]);

  const edtComponentsWithProducts = useMemo(() => {
    const components = items.filter((x) => !x.parentId && (x.kind === 'hito' || x.edtType === 'COMPONENTE'));
    return components.map((comp) => {
      const products = items.filter(
        (p) => p.parentId === comp.id && (p.edtType === 'PRODUCTO' || p.edtType === 'PAQUETE_TRABAJO' || (p.code && p.code.includes('.')))
      );
      return { comp, products };
    });
  }, [items]);

  const edtButtonText = useMemo(() => {
    if (selectedEdtCodes.length === 0) return 'Todos los componentes';
    if (selectedEdtCodes.length === 1) {
      const target = selectedEdtCodes[0];
      const it = items.find((x) => x.id === target || x.code === target);
      if (it) {
        const prefix = it.code ? `${it.code} ` : '';
        const namePart = it.name.length > 20 ? `${it.name.slice(0, 20)}...` : it.name;
        return `${prefix}${namePart}`;
      }
      return target;
    }
    return `${selectedEdtCodes.length} componentes/prod.`;
  }, [selectedEdtCodes, items]);

  // Filtro de cargo territorial: Coordinador Macro-regional (supervisa 2 regiones)
  const [macroFilter, setMacroFilter] = useState<string>('Todos');
  const regionItemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    items.forEach((it) => {
      if (it.region && it.region !== MULTI_REGION_VALUE) counts[it.region] = (counts[it.region] || 0) + 1;
    });
    return counts;
  }, [items]);

  // Verificación en pantalla: número de sedes (DRE/UGEL) del catálogo por región.
  const sedesPorRegion = useMemo(() => {
    const m = new Map<string, number>();
    unidades.forEach((u) => {
      const region = normalizeRegionKey(u.region);
      if (region) m.set(region, (m.get(region) || 0) + 1);
    });
    return m;
  }, [unidades]);
  const [rangeFrom, setRangeFrom] = useState(RANGE_MIN);
  const [rangeTo, setRangeTo] = useState(RANGE_MAX);
  const [listaTemporalFilter, setListaTemporalFilter] = useState<'Todos' | 'Hoy' | 'Semana' | 'Mes' | 'Trimestre'>('Todos');
  // Control de Vencimientos y Alertas Críticas mediante Desplegable Formal
  const [vencimientosFilter, setVencimientosFilter] = useState<'todos' | 'hoy' | 'semana' | 'mes' | 'trimestre' | 'retraso'>('todos');

  // Selector doble ESTRUCTURA WBS: Profundidad Jerárquica + Rol Metodológico (PM4R / BID)
  const [wbsDepthFilter, setWbsDepthFilter] = useState<number | 'todos'>('todos');
  const [wbsRoleFilter, setWbsRoleFilter] = useState<'todos' | 'componentes' | 'productos' | 'paquetes'>('todos');
  const [wbsLevelFilter, setWbsLevelFilter] = useState<'todos' | 'componentes' | 'intermedios' | 'paquetes'>('todos');
  const [zoom, setZoom] = useState('Mes');
  const [organigramaZoom, setOrganigramaZoom] = useState<number>(100);
  const [organigramaFitTrigger, setOrganigramaFitTrigger] = useState<number>(0);
  const [currentTodayIso, setCurrentTodayIso] = useState<string>(getSystemTodayIso);
  const [hoveredTask, setHoveredTask] = useState<{
    item: Item;
    x: number;
    y: number;
  } | null>(null);
  const [hoveredDep, setHoveredDep] = useState<{
    sourceItem: Item;
    targetItem: Item;
    x: number;
    y: number;
  } | null>(null);
  const [inlineDraftCreatedId, setInlineDraftCreatedId] = useState<string | null>(null);
  const depHoverTimeoutRef = useRef<any>(null);
  const [showBarLabels, setShowBarLabels] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);
  const [calShowBarLabels, setCalShowBarLabels] = useState(true);
  const [calShowBaseline, setCalShowBaseline] = useState(false);
  const [showCriticalPath, setShowCriticalPath] = useState(false);
  const [showBarAvatars, setShowBarAvatars] = useState(false);
  const [resizingTaskId, setResizingTaskId] = useState<string | null>(null);
  const [resizeTempWidth, setResizeTempWidth] = useState<number | null>(null);
  const [resizeTempEndDate, setResizeTempEndDate] = useState<string | null>(null);

  useEffect(() => {
    const onDateChanged = (e: any) => {
      const detailDate = e?.detail?.date;
      if (detailDate) {
        setCurrentTodayIso(detailDate);
      } else {
        setCurrentTodayIso(getSystemTodayIso());
      }
    };
    window.addEventListener('qaway-date-changed', onDateChanged);
    return () => window.removeEventListener('qaway-date-changed', onDateChanged);
  }, []);
  const [newMenu, setNewMenu] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [attachment, setAttachment] = useState('');
  const [pickedFile, setPickedFile] = useState('');
  const [toast, setToast] = useState('');
  const [edit, setEdit] = useState<{ id: string; field: EditField } | null>(null);
  
  type FilterMenuKey = 'region' | 'gestor' | 'state' | 'type' | 'dates' | 'wbsLevel' | 'vencimientos' | 'macro' | 'sede' | 'phase' | 'edtComponent' | 'equipoSede' | 'equipoEstado' | 'equipoCuenta' | 'equipoArea' | null;
  const [activeMenu, setActiveMenu] = useState<FilterMenuKey>(null);
  const [mapSubView, setMapSubView] = useState<TerritorialSubView>('geo-real');
  const [calOpen, setCalOpen] = useState<'from' | 'to' | null>(null);
  const [colsMenuOpen, setColsMenuOpen] = useState(false);
  const [colFilterOpen, setColFilterOpen] = useState<ColKey | null>(null);
  const [advancedFiltersOpen, setAdvancedFiltersOpen] = useState(false);
  const [customRules, setCustomRules] = useState<Array<{ id: string; field: string; op: string; val: string }>>([]);

  // Columnas dinámicas estilo Notion (matriz de base de datos extendible)
  interface CustomColDef {
    key: string;
    label: string;
    type: 'text' | 'percent' | 'number' | 'select' | 'date' | 'person';
    required?: boolean;
    showInList?: boolean;
    appliesTo?: 'all' | 'hitos' | 'subprocesos';
    encapsular?: boolean;
  }

  const [customCols, setCustomCols] = useState<CustomColDef[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(uiKey('custom-cols-v1')) || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [colTypeOverrides, setColTypeOverrides] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(uiKey('col-types-v1')) || '{}');
    } catch {
      return {};
    }
  });

  const [colCustomLabels, setColCustomLabels] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(uiKey('col-labels-v1')) || '{}');
    } catch {
      return {};
    }
  });

  const [colCalculations, setColCalculations] = useState<Record<string, string>>(() => {
    try {
      return JSON.parse(localStorage.getItem(uiKey('col-calcs-v1')) || '{}');
    } catch {
      return {};
    }
  });

  const [wrappedCols, setWrappedCols] = useState<Set<string>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(uiKey('wrapped-cols-v1')) || '[]');
      return new Set(Array.isArray(saved) ? saved : []);
    } catch {
      return new Set();
    }
  });

  const [percentGraphFormats, setPercentGraphFormats] = useState<Record<string, 'bar' | 'ring' | 'number'>>(() => {
    try {
      return JSON.parse(localStorage.getItem(uiKey('percent-formats-v1')) || '{}');
    } catch {
      return {};
    }
  });

  const [frozenCols, setFrozenCols] = useState<Set<string>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(uiKey('frozen-cols-v1')) || '[]');
      return new Set(Array.isArray(saved) ? saved : []);
    } catch {
      return new Set();
    }
  });

  const [newColModalOpen, setNewColModalOpen] = useState(false);
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState<CustomColDef['type']>('text');
  const [newColRequired, setNewColRequired] = useState(false);
  const [newColShowInList, setNewColShowInList] = useState(true);
  const [newColEncapsular, setNewColEncapsular] = useState(false);
  const [newColAppliesTo, setNewColAppliesTo] = useState<'all' | 'hitos' | 'subprocesos'>('all');

  const handleCreateCustomCol = () => {
    if (!newColLabel.trim()) return;
    const key = 'c_' + Date.now().toString(36);
    const newCol: CustomColDef = {
      key,
      label: newColLabel.trim(),
      type: newColType,
      required: newColRequired,
      showInList: newColShowInList,
      appliesTo: newColAppliesTo,
      encapsular: newColEncapsular,
    };
    const updated = [...customCols, newCol];
    setCustomCols(updated);
    try {
      localStorage.setItem(uiKey('custom-cols-v1'), JSON.stringify(updated));
    } catch {}

    const isLista = viewMode === 'lista';
    const storageKey = isLista ? uiKey('visible-cols-lista-v4') : uiKey('visible-cols-gantt-v3');

    setVisibleCols((prev) => {
      const next = [...prev, key as ColKey];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });

    setColWidths((prev) => {
      const next = { ...prev, [key]: 140 };
      colRef.current = next;
      try {
        localStorage.setItem(uiKey('gantt-cols-v5'), JSON.stringify(next));
      } catch {}
      return next;
    });

    setNewColLabel('');
    setNewColType('text');
    setNewColRequired(false);
    setNewColShowInList(true);
    setNewColEncapsular(false);
    setNewColAppliesTo('all');
    setNewColModalOpen(false);
    notify(`Campo personalizado "${newCol.label}" creado con éxito`);
  };

  const resetSingleColWidth = (key: ColKey) => {
    const isLista = viewMode === 'lista';
    const defaultW = isLista
      ? (DEFAULT_COLS[key] || 140)
      : (key === 'name' ? 300 : (DEFAULT_COLS[key] || 115));
    setColWidths((prev) => {
      const next = { ...prev, [key]: defaultW };
      colRef.current = next;
      try {
        localStorage.setItem(uiKey('gantt-cols-v5'), JSON.stringify(next));
      } catch {}
      return next;
    });
    notify(`Columna restablecida a ancho óptimo (${defaultW}px)`);
  };

  // Arquitectura Notion: Cada vista (Gantt o Lista) tiene su propio preset de columnas visibles
  const loadSavedCols = (mode: string): ColKey[] => {
    if (mode === 'gantt') {
      try {
        const saved = JSON.parse(localStorage.getItem(uiKey('visible-cols-gantt-v3')) || 'null');
        if (Array.isArray(saved) && saved.length > 0 && saved.includes('name') && !saved.includes('code') && saved.length <= 6) {
          return saved;
        }
      } catch {}
      // En modo Gantt, el lienzo temporal es protagonista absoluto: inicia en vista compacta con solo 'name'
      return ['name'];
    }
    try {
      const storageKey = uiKey('visible-cols-lista-v4');
      const saved = JSON.parse(localStorage.getItem(storageKey) || 'null');
      if (Array.isArray(saved) && saved.length > 0 && saved.includes('name')) {
        const canonicalPart = CANONICAL_COLS.filter((k) => saved.includes(k));
        const customPart = saved.filter((k) => typeof k === 'string' && k.startsWith('c_'));
        return [...canonicalPart, ...customPart] as ColKey[];
      }
    } catch {
      /* almacenamiento no disponible */
    }
    return [...LISTA_PRESET_COLS];
  };

  const [visibleCols, setVisibleCols] = useState<ColKey[]>(() => loadSavedCols(viewMode));

  // Al conmutar entre vistas, se carga el preset o configuración guardada de ESA vista específica
  const prevViewModeRef = useRef<string>(viewMode);
  const handleViewModeChange = (newMode: 'portada' | 'gantt' | 'lista' | 'kanban' | 'calendario' | 'mapa' | 'arbol' | 'organigrama' | 'organigrama-flow' | 'directorio' | 'sedes' | 'carga') => {
    if (newMode === viewMode) return;
    try {
      if (viewMode === 'lista' && visibleCols.includes('code')) {
        localStorage.setItem(uiKey('visible-cols-lista-v4'), JSON.stringify(visibleCols));
      } else if (viewMode === 'gantt' && !visibleCols.includes('code') && visibleCols.length <= 6) {
        localStorage.setItem(uiKey('visible-cols-gantt-v3'), JSON.stringify(visibleCols));
      }
    } catch {}

    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    if (tableHeadRef.current) tableHeadRef.current.scrollLeft = 0;
    if (headScrollRef.current) headScrollRef.current.scrollLeft = 0;

    const nextCols = loadSavedCols(newMode);
    setVisibleCols(nextCols);
    prevViewModeRef.current = newMode;
    setViewMode(newMode);
  };

  useEffect(() => {
    if (viewMode === prevViewModeRef.current) return;
    try {
      if (prevViewModeRef.current === 'lista') {
        localStorage.setItem(uiKey('visible-cols-lista-v4'), JSON.stringify(visibleCols));
      } else if (prevViewModeRef.current === 'gantt' && !visibleCols.includes('code') && visibleCols.length <= 6) {
        localStorage.setItem(uiKey('visible-cols-gantt-v3'), JSON.stringify(visibleCols));
      }
    } catch {}

    prevViewModeRef.current = viewMode;
    const nextCols = loadSavedCols(viewMode);
    setVisibleCols(nextCols);
  }, [viewMode]);

  // Persistir cambios de columnas en la vista actualmente activa
  useEffect(() => {
    try {
      if (viewMode === 'lista' && visibleCols.includes('code')) {
        localStorage.setItem(uiKey('visible-cols-lista-v4'), JSON.stringify(visibleCols));
      } else if (viewMode === 'gantt' && !visibleCols.includes('code') && visibleCols.length <= 6) {
        localStorage.setItem(uiKey('visible-cols-gantt-v3'), JSON.stringify(visibleCols));
      }
    } catch {
      /* almacenamiento no disponible */
    }
  }, [visibleCols, viewMode]);

  const ganttColumns = useMemo<ColumnDef<Item>[]>(
    () => [
      ...GANTT_COLUMNS.map((col) => ({
        ...col,
        label: colCustomLabels[col.id] || col.label,
        type: (colTypeOverrides[col.id] || col.type) as any,
      })),
      {
        id: 'deviation',
        label: colCustomLabels['deviation'] || 'Desviación',
        type: (colTypeOverrides['deviation'] || 'number') as any,
        accessor: (r) => (r ? getDeviationDays(r, currentTodayIso) : undefined),
      },
      {
        id: 'actualEnd',
        label: colCustomLabels['actualEnd'] || 'Fecha real',
        type: (colTypeOverrides['actualEnd'] || 'date') as any,
        accessor: (r) => r?.actualEnd,
      },
      ...customCols.map((c) => ({
        id: c.key,
        label: colCustomLabels[c.key] || c.label,
        type: (colTypeOverrides[c.key] || c.type || 'text') as any,
        accessor: (r: Item) => (r as any)?.[c.key],
      })),
    ],
    [currentTodayIso, customCols, colCustomLabels, colTypeOverrides]
  );

  const engine = useTableEngine<Item>({
    tableId: 'gantt',
    columns: ganttColumns,
    rows: items,
    today: currentTodayIso,
    hierarchy: GANTT_HIERARCHY,
  });

  const toggleColVisibility = (key: ColKey) => {
    if (key === 'name') return;
    setVisibleCols((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      // Reinsertar respetando el orden canónico de la tabla matriz + columnas custom
      const allAllowed = [...CANONICAL_COLS, ...customCols.map((c) => c.key as ColKey)];
      return allAllowed.filter((k) => prev.includes(k) || k === key);
    });
  };

  const resetColWidths = () => {
    const isLista = viewMode === 'lista';
    const calibratedWidths: Record<string, number> = {
      code: 80,
      name: isLista ? 420 : 320,
      kind: 145,
      deliverable: 240,
      parent: 260,
      start: 135,
      end: 135,
      duration: 115,
      progress: 130,
      status: 125,
      dependencies: 130,
      successors: 130,
      gestor: 165,
      region: 140,
      deviation: 120,
      actualEnd: 130,
      actions: 75,
    };

    customCols.forEach((col) => {
      calibratedWidths[col.key] = 140;
    });

    const pristineCols: ColKey[] = isLista ? [...LISTA_PRESET_COLS] : [...GANTT_PRESET_COLS];
    customCols.forEach((col) => {
      if (visibleCols.includes(col.key as ColKey)) {
        pristineCols.push(col.key as ColKey);
      }
    });

    colRef.current = { ...(calibratedWidths as any) };
    setColWidths(calibratedWidths as any);
    setVisibleCols(pristineCols);

    // Reiniciar scroll horizontal para que la primera columna jamás quede fuera de vista
    if (scrollRef.current) scrollRef.current.scrollLeft = 0;
    if (tableHeadRef.current) tableHeadRef.current.scrollLeft = 0;
    if (headScrollRef.current) headScrollRef.current.scrollLeft = 0;

    try {
      const storageKey = isLista ? uiKey('visible-cols-lista-v4') : uiKey('visible-cols-gantt-v3');
      localStorage.setItem(storageKey, JSON.stringify(pristineCols));
      localStorage.setItem(uiKey('gantt-cols-v5'), JSON.stringify(calibratedWidths));
    } catch {
      /* almacenamiento no disponible */
    }

    notify(
      `Columnas ordenadas y anchos ajustados al contenido óptimo (${isLista ? 'Modo Lista' : 'Modo Gantt'})`
    );
  };
  const toggleMenu = (key: FilterMenuKey) => {
    setActiveMenu((cur) => (cur === key ? null : key));
    setCalOpen(null);
  };
  const closeMenus = () => {
    setActiveMenu(null);
    setCalOpen(null);
  };

  const fileRef = useRef<HTMLInputElement>(null);

  // --- Estado y Navegación para Vista Calendario Institucional ---
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(9); // 0-indexed: 9 = Octubre
  const [calDay, setCalDay] = useState(27);
  const [calSubView, setCalSubView] = useState<'Mes' | 'Semana' | 'Día' | 'Agenda'>('Mes');

  const CAL_MONTH_NAMES = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const CAL_SHORT_MONTHS = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Set', 'Oct', 'Nov', 'Dic'
  ];

  const calPeriodLabel = useMemo(() => {
    if (calSubView === 'Mes' || calSubView === 'Agenda') {
      return `${CAL_MONTH_NAMES[calMonth]} ${calYear}`;
    }
    if (calSubView === 'Semana') {
      const current = new Date(calYear, calMonth, calDay);
      const dayOfWeek = (current.getDay() + 6) % 7;
      const monday = new Date(current);
      monday.setDate(current.getDate() - dayOfWeek);
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(monday.getDate())} – ${pad(sunday.getDate())} ${CAL_SHORT_MONTHS[sunday.getMonth()]}, ${sunday.getFullYear()}`;
    }
    if (calSubView === 'Día') {
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(calDay)} ${CAL_SHORT_MONTHS[calMonth]} ${calYear}`;
    }
    return `${CAL_MONTH_NAMES[calMonth]} ${calYear}`;
  }, [calSubView, calYear, calMonth, calDay]);

  const handlePrevCalPeriod = () => {
    if (calSubView === 'Mes' || calSubView === 'Agenda') {
      if (calMonth === 0) {
        setCalMonth(11);
        setCalYear((y) => y - 1);
      } else {
        setCalMonth((m) => m - 1);
      }
    } else if (calSubView === 'Semana') {
      const cur = new Date(calYear, calMonth, calDay);
      cur.setDate(cur.getDate() - 7);
      setCalYear(cur.getFullYear());
      setCalMonth(cur.getMonth());
      setCalDay(cur.getDate());
    } else if (calSubView === 'Día') {
      const cur = new Date(calYear, calMonth, calDay);
      cur.setDate(cur.getDate() - 1);
      setCalYear(cur.getFullYear());
      setCalMonth(cur.getMonth());
      setCalDay(cur.getDate());
    }
  };

  const handleNextCalPeriod = () => {
    if (calSubView === 'Mes' || calSubView === 'Agenda') {
      if (calMonth === 11) {
        setCalMonth(0);
        setCalYear((y) => y + 1);
      } else {
        setCalMonth((m) => m + 1);
      }
    } else if (calSubView === 'Semana') {
      const cur = new Date(calYear, calMonth, calDay);
      cur.setDate(cur.getDate() + 7);
      setCalYear(cur.getFullYear());
      setCalMonth(cur.getMonth());
      setCalDay(cur.getDate());
    } else if (calSubView === 'Día') {
      const cur = new Date(calYear, calMonth, calDay);
      cur.setDate(cur.getDate() + 1);
      setCalYear(cur.getFullYear());
      setCalMonth(cur.getMonth());
      setCalDay(cur.getDate());
    }
  };

  const handleTodayCal = () => {
    setCalYear(2026);
    setCalMonth(9);
    setCalDay(27);
  };
  const scrollRef = useRef<HTMLDivElement>(null);
  const prefetchSentinelRef = useRef<HTMLDivElement>(null);
  const [renderedRowCount, setRenderedRowCount] = useState(120);
  const headScrollRef = useRef<HTMLDivElement>(null);
  const tableHeadRef = useRef<HTMLDivElement>(null);
  const colRef = useRef(colWidths);
  const dragRef = useRef<{ key: ColKey; startX: number; startW: number } | null>(null);
  colRef.current = colWidths;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (viewMode === 'gantt') {
      if (headScrollRef.current) {
        headScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }
    } else {
      if (tableHeadRef.current) {
        tableHeadRef.current.scrollLeft = e.currentTarget.scrollLeft;
      }
    }

  };

  // Scroll progresivo: el siguiente bloque se prepara antes de que el usuario
  // llegue al final, evitando pintar miles de filas en el primer render.

  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(''), 2600);
  };

  useEffect(() => {
    onActions?.({ notify: (m: string) => notify(m) });
  }, [onActions]);

  /* ---------- Historial de Deshacer y Rehacer (Buildern standard) ---------- */
  const getColSnapshot = useCallback((): ColConfigSnapshot => ({
    visibleCols: [...visibleCols],
    customCols: [...customCols],
    colTypeOverrides: { ...colTypeOverrides },
    colCustomLabels: { ...colCustomLabels },
    colCalculations: { ...colCalculations },
    percentGraphFormats: { ...percentGraphFormats },
    wrappedCols: Array.from(wrappedCols),
    frozenCols: Array.from(frozenCols),
  }), [visibleCols, customCols, colTypeOverrides, colCustomLabels, colCalculations, wrappedCols, frozenCols]);

  const applyColSnapshot = useCallback((snap: ColConfigSnapshot) => {
    if (!snap) return;
    setVisibleCols(snap.visibleCols || []);
    setCustomCols(snap.customCols || []);
    setColTypeOverrides(snap.colTypeOverrides || {});
    setColCustomLabels(snap.colCustomLabels || {});
    setColCalculations(snap.colCalculations || {});
    setPercentGraphFormats(snap.percentGraphFormats || {});
    setWrappedCols(new Set(snap.wrappedCols || []));
    setFrozenCols(new Set(snap.frozenCols || []));
    try {
      localStorage.setItem(uiKey('custom-cols-v1'), JSON.stringify(snap.customCols || []));
      localStorage.setItem(uiKey('col-types-v1'), JSON.stringify(snap.colTypeOverrides || {}));
      localStorage.setItem(uiKey('col-labels-v1'), JSON.stringify(snap.colCustomLabels || {}));
      localStorage.setItem(uiKey('col-calcs-v1'), JSON.stringify(snap.colCalculations || {}));
      localStorage.setItem(uiKey('percent-formats-v1'), JSON.stringify(snap.percentGraphFormats || {}));
      localStorage.setItem(uiKey('wrapped-cols-v1'), JSON.stringify(snap.wrappedCols || []));
      localStorage.setItem(uiKey('frozen-cols-v1'), JSON.stringify(snap.frozenCols || []));
    } catch {}
  }, []);

  const recordColumnChange = useCallback(() => {
    setHistory((h) => [{ items, colConfig: getColSnapshot() }, ...h].slice(0, 30));
    setRedoHistory([]);
  }, [items, getColSnapshot]);

  const getColLabel = (key: ColKey | string, defaultLabel: string) => colCustomLabels[key] || defaultLabel;

  const handleRenameColumn = useCallback((columnId: string, newLabel: string) => {
    recordColumnChange();
    setColCustomLabels((prev) => {
      const next = { ...prev, [columnId]: newLabel };
      try { localStorage.setItem(uiKey('col-labels-v1'), JSON.stringify(next)); } catch {}
      return next;
    });
    notify(`Columna renombrada a "${newLabel}"`);
  }, [recordColumnChange, notify]);

  const handleChangeGraphFormat = useCallback((columnId: string, format: 'bar' | 'ring' | 'number') => {
    recordColumnChange();
    setPercentGraphFormats((prev) => {
      const next = { ...prev, [columnId]: format };
      try { localStorage.setItem(uiKey('percent-formats-v1'), JSON.stringify(next)); } catch {}
      return next;
    });
    notify(`Formato visual cambiado a "${format === 'ring' ? 'Circular / Anillo' : format === 'number' ? 'Solo número' : 'Barra horizontal'}"`);
  }, [recordColumnChange, notify]);

  const handleChangeType = useCallback((columnId: string, newType: string) => {
    recordColumnChange();
    setColTypeOverrides((prev) => {
      const next = { ...prev, [columnId]: newType };
      try { localStorage.setItem(uiKey('col-types-v1'), JSON.stringify(next)); } catch {}
      return next;
    });
    notify(`Tipo de columna cambiado a "${newType}"`);
  }, [recordColumnChange, notify]);

  const handleCalculate = useCallback((columnId: string, calculation: string) => {
    recordColumnChange();
    setColCalculations((prev) => {
      const next = { ...prev };
      if (!calculation) delete next[columnId];
      else next[columnId] = calculation;
      try { localStorage.setItem(uiKey('col-calcs-v1'), JSON.stringify(next)); } catch {}
      return next;
    });
    notify(calculation ? `Cálculo activado: ${calculation}` : 'Cálculo desactivado');
  }, [recordColumnChange, notify]);

  const handleToggleWrap = useCallback((columnId: string) => {
    recordColumnChange();
    setWrappedCols((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) next.delete(columnId);
      else next.add(columnId);
      try { localStorage.setItem(uiKey('wrapped-cols-v1'), JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  }, [recordColumnChange]);

  const handleFreezeColumn = useCallback((columnId: string) => {
    recordColumnChange();
    setFrozenCols((prev) => {
      const next = new Set(prev);
      if (next.has(columnId)) {
        next.delete(columnId);
        notify('Columna desinmovilizada');
      } else {
        next.add(columnId);
        notify('Columna inmovilizada');
      }
      try { localStorage.setItem(uiKey('frozen-cols-v1'), JSON.stringify(Array.from(next))); } catch {}
      return next;
    });
  }, [recordColumnChange, notify]);

  const handleInsertColumn = useCallback((columnId: string, insertRight: boolean) => {
    recordColumnChange();
    const newKey = 'c_' + Date.now().toString(36);
    const newCol: CustomColDef = {
      key: newKey,
      label: 'Nueva propiedad',
      type: 'text',
      required: false,
      showInList: true,
      appliesTo: 'all',
      encapsular: false,
    };
    const updatedCustom = [...customCols, newCol];
    setCustomCols(updatedCustom);
    try { localStorage.setItem(uiKey('custom-cols-v1'), JSON.stringify(updatedCustom)); } catch {}

    setVisibleCols((prev) => {
      const idx = prev.indexOf(columnId as ColKey);
      const next = [...prev];
      if (idx >= 0) {
        next.splice(insertRight ? idx + 1 : idx, 0, newKey as ColKey);
      } else {
        next.push(newKey as ColKey);
      }
      return next;
    });
    notify(`Nueva columna insertada a la ${insertRight ? 'derecha' : 'izquierda'}`);
  }, [recordColumnChange, customCols, notify]);

  const handleDuplicateColumn = useCallback((columnId: string) => {
    recordColumnChange();
    const sourceDef = ganttColumns.find((c) => c.id === columnId);
    const currentLabel = colCustomLabels[columnId] || sourceDef?.label || columnId;
    const newKey = 'c_' + Date.now().toString(36);
    const newType = (colTypeOverrides[columnId] || sourceDef?.type || 'text') as CustomColDef['type'];
    const newCol: CustomColDef = {
      key: newKey,
      label: `${currentLabel} (copia)`,
      type: newType,
      required: false,
      showInList: true,
      appliesTo: 'all',
      encapsular: false,
    };
    const updatedCustom = [...customCols, newCol];
    setCustomCols(updatedCustom);
    try { localStorage.setItem(uiKey('custom-cols-v1'), JSON.stringify(updatedCustom)); } catch {}

    setItems((prev) =>
      prev.map((item) => {
        const val = (item as any)[columnId];
        return val !== undefined ? { ...item, [newKey]: val } : item;
      })
    );

    setVisibleCols((prev) => {
      const idx = prev.indexOf(columnId as ColKey);
      const next = [...prev];
      if (idx >= 0) next.splice(idx + 1, 0, newKey as ColKey);
      else next.push(newKey as ColKey);
      return next;
    });
    notify(`Columna duplicada como "${currentLabel} (copia)"`);
  }, [recordColumnChange, ganttColumns, colCustomLabels, colTypeOverrides, customCols, notify]);

  const handleDeleteColumn = useCallback((columnId: string) => {
    recordColumnChange();
    const isCustom = customCols.some((c) => c.key === columnId);
    if (isCustom) {
      const nextCustom = customCols.filter((c) => c.key !== columnId);
      setCustomCols(nextCustom);
      try { localStorage.setItem(uiKey('custom-cols-v1'), JSON.stringify(nextCustom)); } catch {}
    }
    setVisibleCols((prev) => prev.filter((k) => k !== columnId));
    notify('Propiedad eliminada');
  }, [recordColumnChange, customCols, notify]);

  const renderColumnHeaderMenu = (columnId: string, btnClass = 'th-action-btn') => (
    <ColumnHeaderMenu
      engine={engine}
      columnId={columnId}
      buttonClassName={btnClass}
      onHideColumn={(id) => toggleColVisibility(id as ColKey)}
      onFreezeColumn={handleFreezeColumn}
      isFrozen={frozenCols.has(columnId)}
      onRenameColumn={handleRenameColumn}
      onChangeType={handleChangeType}
      graphFormat={percentGraphFormats[columnId] || 'bar'}
      onChangeGraphFormat={handleChangeGraphFormat}
      onToggleWrap={handleToggleWrap}
      isWrapped={wrappedCols.has(columnId)}
      onCalculate={handleCalculate}
      activeCalculation={colCalculations[columnId]}
      onInsertLeft={(id) => handleInsertColumn(id, false)}
      onInsertRight={(id) => handleInsertColumn(id, true)}
      onDuplicate={handleDuplicateColumn}
      onDelete={handleDeleteColumn}
    />
  );

  const computeColumnCalculation = useCallback((colId: string, calcId: string, rows: Item[]): string => {
    if (!rows.length) return '—';
    if (calcId === 'count') return `${rows.length} registros`;

    const values: number[] = [];
    for (const r of rows) {
      let val: number | undefined;
      if (colId === 'duration') val = getDays(r.start, r.end);
      else if (colId === 'progress') val = r.progress;
      else if (colId === 'deviation') val = getDeviationDays(r, currentTodayIso);
      else {
        const raw = (r as any)[colId];
        if (typeof raw === 'number') val = raw;
        else if (typeof raw === 'string') {
          const parsed = parseFloat(raw.replace(/[^\d.-]/g, ''));
          if (!isNaN(parsed)) val = parsed;
        }
      }
      if (val !== undefined && !isNaN(val)) values.push(val);
    }

    if (values.length === 0) return `${rows.length} registros`;
    const isPercent = colTypeOverrides[colId] === 'percent' || colId === 'progress';

    switch (calcId) {
      case 'sum': {
        const sum = values.reduce((a, b) => a + b, 0);
        return isPercent ? `${Math.round(sum)}%` : colId === 'duration' && colTypeOverrides[colId] !== 'number' ? `${Math.round(sum)} días` : `${Math.round(sum * 100) / 100}`;
      }
      case 'avg': {
        const avg = values.reduce((a, b) => a + b, 0) / values.length;
        return isPercent ? `${Math.round(avg)}%` : colId === 'duration' && colTypeOverrides[colId] !== 'number' ? `${Math.round(avg)} días` : `${Math.round(avg * 10) / 10}`;
      }
      case 'min': {
        const min = Math.min(...values);
        return isPercent ? `${min}%` : colId === 'duration' && colTypeOverrides[colId] !== 'number' ? `${min} días` : `${min}`;
      }
      case 'max': {
        const max = Math.max(...values);
        return isPercent ? `${max}%` : colId === 'duration' && colTypeOverrides[colId] !== 'number' ? `${max} días` : `${max}`;
      }
      default:
        return `${rows.length} registros`;
    }
  }, [currentTodayIso, colTypeOverrides]);

  const commitChange = (nextOrUpdater: Item[] | ((prev: Item[]) => Item[])) => {
    setItems((prev) => {
      const rawNext = typeof nextOrUpdater === 'function' ? nextOrUpdater(prev) : nextOrUpdater;
      const next = computeWbsHierarchy(rawNext, rawTasks);
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        setHistory((h) => [{ items: prev, colConfig: getColSnapshot() }, ...h].slice(0, 30));
        setRedoHistory([]);
      }
      return next;
    });
  };

  const handleUndo = () => {
    if (history.length === 0) {
      notify('No hay cambios previos para deshacer');
      return;
    }
    const [previous, ...rest] = history;
    if (!previous) {
      notify('No hay cambios previos para deshacer');
      return;
    }
    setRedoHistory((r) => [{ items, colConfig: getColSnapshot() }, ...r].slice(0, 30));
    setItems(previous.items);
    applyColSnapshot(previous.colConfig);
    setHistory(rest);
    notify('Cambio deshecho con éxito');
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) {
      notify('No hay cambios posteriores para rehacer');
      return;
    }
    const [next, ...rest] = redoHistory;
    if (!next) {
      notify('No hay cambios posteriores para rehacer');
      return;
    }
    setHistory((h) => [{ items, colConfig: getColSnapshot() }, ...h].slice(0, 30));
    setItems(next.items);
    applyColSnapshot(next.colConfig);
    setRedoHistory(rest);
    notify('Cambio rehecho con éxito');
  };

  /* ---------- Selección masiva en lote (Modo Lista) ---------- */
  const [selectedRowIds, setSelectedRowIds] = useState<Set<string>>(new Set());

  const toggleSelectRow = useCallback((id: string) => {
    setSelectedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const toggleSelectAllShown = useCallback((shownItems: Item[]) => {
    setSelectedRowIds((prev) => {
      const allShownSelected = shownItems.length > 0 && shownItems.every((it) => prev.has(it.id));
      if (allShownSelected) {
        return new Set();
      } else {
        return new Set(shownItems.map((it) => it.id));
      }
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedRowIds(new Set());
  }, []);

  const handleBulkStatusChange = useCallback(
    (newStatus: Status) => {
      if (selectedRowIds.size === 0) return;
      commitChange((prev) =>
        prev.map((item) => {
          if (selectedRowIds.has(item.id)) {
            return {
              ...item,
              status: newStatus,
              progress: newStatus === 'Completado' || newStatus === 'Cumple' ? 100 : item.progress,
            };
          }
          return item;
        })
      );
      notify(`${selectedRowIds.size} registros actualizados a "${newStatus}"`);
      setSelectedRowIds(new Set());
    },
    [selectedRowIds, notify]
  );

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (workspaceRef.current?.requestFullscreen) {
        workspaceRef.current.requestFullscreen().catch(() => {});
      }
      setIsFullscreen(true);
      notify('Modo pantalla completa activado');
    } else {
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
      notify('Modo pantalla completa desactivado');
    }
  };

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isEditingInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
      if (isEditingInput) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [history, redoHistory]);

  /* ---------- Redimensionamiento de columnas (Agrandar y Disminuir) ---------- */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const d = dragRef.current;
      if (!d) return;
      const w = Math.max(MIN_COLS[d.key] || 60, Math.min(800, d.startW + (e.clientX - d.startX)));
      setColWidths((c) => ({ ...c, [d.key]: w }));
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setResizingCol(null);
      document.body.classList.remove('gantt-resizing');
      try {
        localStorage.setItem(uiKey('gantt-cols-v5'), JSON.stringify(colRef.current));
      } catch {
        /* almacenamiento no disponible */
      }
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.body.classList.remove('gantt-resizing');
    };
  }, []);

  const startResize = (e: React.MouseEvent, key: ColKey) => {
    e.preventDefault();
    e.stopPropagation();
    setResizingCol(key);
    dragRef.current = { key, startX: e.clientX, startW: colRef.current[key] || DEFAULT_COLS[key] || 140 };
    document.body.classList.add('gantt-resizing');
  };

  const effectiveRenderedCols = useMemo(() => {
    const allAllowed = new Set([...CANONICAL_COLS, ...customCols.map((c) => c.key as ColKey)]);
    return visibleCols.filter((k) => allAllowed.has(k));
  }, [visibleCols, customCols]);

  const fixedWidth = useMemo(
    () => effectiveRenderedCols.reduce((acc, k) => acc + (colWidths[k] || DEFAULT_COLS[k] || 140), 0),
    [effectiveRenderedCols, colWidths]
  );

  const timelineMinWidth = useMemo(() => {
    if (zoom === 'Día') return `${TOTAL_SPAN_DAYS * 34}px`;
    if (zoom === 'Semana') return `${Math.ceil(TOTAL_SPAN_DAYS / 7) * 80}px`;
    if (zoom === 'Mes') return `${MONTHS.length * 170}px`;
    if (zoom === 'Trimestre') return '1160px';
    return '1200px';
  }, [zoom]);

  const fixedGridCols = useMemo(
    () => effectiveRenderedCols.map((k) => `${colWidths[k] || DEFAULT_COLS[k] || 140}px`).join(' '),
    [effectiveRenderedCols, colWidths]
  );

  const listaGridCols = useMemo(() => {
    return effectiveRenderedCols
      .map((k) => {
        if (k === 'name') {
          const userW = colWidths['name'] || DEFAULT_COLS['name'] || 280;
          return `minmax(${userW}px, 1fr)`;
        }
        return `${colWidths[k] || DEFAULT_COLS[k] || 140}px`;
      })
      .join(' ');
  }, [effectiveRenderedCols, colWidths]);

  const rowGridCols = useMemo(
    () => `var(--fixed) minmax(${timelineMinWidth}, 1fr)`,
    [timelineMinWidth]
  );

  /* Función matemática unificada de posición en píxeles según escala de zoom (0% margen de error) */
  const getDatePixelOffset = (iso: string, targetZoom: string = zoom): number => {
    const targetTime = new Date(iso + 'T12:00:00').getTime();
    const daysDiff = (targetTime - START_TIMESTAMP) / 86400000;
    const clampedDays = Math.max(0, Math.min(TOTAL_SPAN_DAYS, daysDiff));

    if (targetZoom === 'Día') {
      return clampedDays * 34;
    }
    if (targetZoom === 'Semana') {
      return (clampedDays / 7) * 80;
    }
    if (targetZoom === 'Mes') {
      let px = 0;
      for (const m of MONTHS) {
        const mDays = monthDays(m.start);
        const mStartTime = new Date(m.start + 'T12:00:00').getTime();
        const mEndTime = mStartTime + (mDays - 1) * 86400000;
        if (targetTime >= mStartTime && targetTime <= mEndTime) {
          const dayInMonth = (targetTime - mStartTime) / 86400000;
          px += (dayInMonth / mDays) * 170;
          break;
        } else if (targetTime > mEndTime) {
          px += 170;
        }
      }
      return px;
    }
    const totalPx = targetZoom === 'Trimestre' ? 1160 : (parseFloat(timelineMinWidth) || 1200);
    return (clampedDays / TOTAL_SPAN_DAYS) * totalPx;
  };

  /* ---------- Deslizador Temporal por Escalas y Centrado en Hoy / Fechas ---------- */
  const scrollToToday = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const todayPx = getDatePixelOffset(currentTodayIso, zoom) + (zoom === 'Día' ? 17 : 0);
    const timelineVisibleWidth = Math.max(200, container.clientWidth - fixedWidth);
    const targetScroll = Math.max(0, todayPx - timelineVisibleWidth * 0.45);
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    if (headScrollRef.current) {
      headScrollRef.current.scrollLeft = targetScroll;
    }
    notify(`Vista centrada en Hoy (${formatDate(currentTodayIso)})`);
  };

  const scrollToDate = (iso: string, label?: string) => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const targetPx = getDatePixelOffset(iso, zoom);
    const timelineVisibleWidth = Math.max(200, container.clientWidth - fixedWidth);
    const targetScroll = Math.max(0, targetPx - timelineVisibleWidth / 4);
    container.scrollTo({ left: targetScroll, behavior: 'smooth' });
    if (headScrollRef.current) {
      headScrollRef.current.scrollLeft = targetScroll;
    }
    if (label) notify(label);
  };

  const handleSelectFrom = (v: string) => {
    setRangeFrom(v);
    if (v > rangeTo) {
      setRangeTo(v);
    }
  };

  const handleSelectTo = (v: string) => {
    setRangeTo(v);
    if (v < rangeFrom) {
      setRangeFrom(v);
    }
  };

  const scrollTimeline = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const factor = dir === 'left' ? -1 : 1;
    let delta = 240;
    if (zoom === 'Día') {
      delta = 7 * 34;
    } else if (zoom === 'Semana') {
      delta = 4 * 80;
    } else if (zoom === 'Mes') {
      delta = 170;
    } else if (zoom === 'Trimestre') {
      delta = 290;
    }
    scrollRef.current.scrollBy({ left: factor * delta, behavior: 'smooth' });
  };

  const handleZoomChange = (z: string) => {
    setZoom(z);
  };

  /* Centrado fluido con física suave en la fecha actual al inicializar la vista o cambiar de escala (Día/Semana/Mes/Trimestre) */
  useEffect(() => {
    if (viewMode !== 'gantt') return; // Bloqueo: Modo Lista y vistas tabulares jamás se desplazan horizontalmente
    const timer = setTimeout(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const todayPx = getDatePixelOffset(currentTodayIso, zoom) + (zoom === 'Día' ? 17 : 0);
      const timelineVisibleWidth = Math.max(200, container.clientWidth - fixedWidth);
      const targetScroll = Math.max(0, todayPx - timelineVisibleWidth * 0.45);
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      if (headScrollRef.current) {
        headScrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [zoom, currentTodayIso, viewMode]);

  /* Reencuadre instantáneo en Modo Lista a la posición inicial (columna 0) */
  useEffect(() => {
    if (viewMode === 'lista') {
      if (scrollRef.current) scrollRef.current.scrollLeft = 0;
      if (tableHeadRef.current) tableHeadRef.current.scrollLeft = 0;
      if (headScrollRef.current) headScrollRef.current.scrollLeft = 0;
    }
  }, [viewMode]);

  /* ---------- Cierre global de menús y editores (clic externo / Escape) ---------- */
  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (!t.closest('.menu-wrap')) {
        setNewMenu(false);
      }
      if (!t.closest('.cell-editor, .col-resizer, .editable, .cell-pop')) {
        setEdit(null);
      }
      if (!t.closest('.name-head, .cols-dropdown-wrap, .cols-popover, .cols-trigger-btn')) {
        setColsMenuOpen(false);
      }
      if (!t.closest('.th-col-header')) {
        setColFilterOpen(null);
      }
      if (!t.closest('.filter-dropdown-wrap')) {
        setActiveMenu(null);
        setCalOpen(null);
      }
      if (!t.closest('.dr-input-box')) {
        setCalOpen(null);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (deleteConfirmModalOpenRef.current) {
          setDeleteConfirmModalOpen(false);
          return;
        }
        if (unsavedAlertOpenRef.current) {
          // Si la alerta de confirmación está abierta y presiona Escape, se cancela la intención de salir (permanece en el editor)
          setUnsavedAlertOpen(false);
          setPendingCloseAction(null);
          return;
        }
        if (panelOpenRef.current) {
          requestCloseDrawer();
          return;
        }
        setNewMenu(false);
        setEdit(null);
        setActiveMenu(null);
        setCalOpen(null);
        setColsMenuOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const closeEdit = () => setEdit(null);
  const isEditing = (x: Item, field: EditField) => !!edit && edit.id === x.id && edit.field === field;
  const toggleEdit = (x: Item, field: EditField) =>
    setEdit((cur) => (cur && cur.id === x.id && cur.field === field ? null : { id: x.id, field }));

  /* ---------- Mutaciones de datos (retroalimentan Duración, barras e Historial) ---------- */
  const update = (id: string, p: Partial<Item>) => {
    commitChange((old) => old.map((x) => (x.id === id ? applyActuals(x, { ...x, ...p }, currentTodayIso) : x)));
  };

  /* Fija la línea base solo en registros que aún no la tienen (nunca pisa una existente). */
  const freezeBaselines = () => {
    const pending = items.filter((x) => !hasBaseline(x)).length;
    if (pending === 0) {
      notify('Todos los registros ya tienen línea base');
      return;
    }
    commitChange((old) => old.map((x) => (hasBaseline(x) ? x : freezeBaseline(x))));
    notify(`Línea base fijada en ${pending} registro${pending === 1 ? '' : 's'} (Ctrl+Z para deshacer)`);
  };

  /* Recalibra o limpia la línea base contractual en caso de adenda formal MINEDU */
  const resetBaselines = () => {
    const withBaseline = items.filter((x) => hasBaseline(x)).length;
    if (withBaseline === 0) {
      notify('No hay líneas base fijadas para recalibrar');
      return;
    }
    commitChange((old) =>
      old.map((x) => {
        const next = { ...x };
        delete next.baselineStart;
        delete next.baselineEnd;
        return next;
      })
    );
    notify(`Línea base restablecida en ${withBaseline} registro${withBaseline === 1 ? '' : 's'} (Ctrl+Z para deshacer)`);
  };

  const setStart = (x: Item, v: string) => {
    if (!v) return;
    update(x.id, v > x.end ? { start: v, end: v } : { start: v });
  };

  const setEnd = (x: Item, v: string) => {
    if (!v) return;
    update(x.id, v < x.start ? { start: v, end: v } : { end: v });
  };

  const setDuration = (x: Item, raw: string) => {
    const d = Math.max(1, Math.min(365, parseInt(raw || '1', 10) || 1));
    update(x.id, { end: shiftDays(x.start, d - 1) });
  };

  const setProgress = (x: Item, v: number) =>
    update(x.id, {
      progress: v,
      status: v >= 100 ? 'Cumple' : v === 0 ? 'Pendiente' : 'En proceso',
    });

  /* Sincronización bidireccional Estado <-> Avance */
  const setStatusWithSync = (x: Item, s: Status) => {
    let newProgress = x.progress;
    if (s === 'Pendiente') {
      newProgress = 0;
    } else if (s === 'Completado' || s === 'Cumple') {
      newProgress = 100;
    } else if (s === 'En proceso' || s === 'En curso') {
      if (newProgress === 0 || newProgress === 100) newProgress = 50;
    } else if (s === 'Con retraso') {
      if (newProgress === 100) newProgress = 50;
    }
    update(x.id, { status: s, progress: newProgress });
    notify(`Estado: ${s} (${newProgress}%)`);
  };

  /* Asignación multi-responsables */
  const toggleItemGestor = (item: Item, gestorName: string) => {
    const current = getItemGestores(item);
    let updated: string[];
    if (current.includes(gestorName)) {
      updated = current.filter((g) => g !== gestorName);
    } else {
      updated = [...current, gestorName];
    }
    update(item.id, {
      gestores: updated,
      gestor: updated[0] || '',
    });
    notify(`Responsables actualizados (${updated.length})`);
  };

  /* Modificación interactiva de fechas por arrastre de barra */
  const handleResizeMouseDown = (e: React.MouseEvent, item: Item) => {
    e.stopPropagation();
    e.preventDefault();

    const startMouseX = e.clientX;
    const startOffset = getDatePixelOffset(item.start);
    const initialWidth = Math.max(8, getDatePixelOffset(shiftDays(item.end, 1)) - startOffset);

    let pxPerDay = 34; // default Día
    if (zoom === 'Semana') pxPerDay = 80 / 7;
    else if (zoom === 'Mes') pxPerDay = 170 / 30.41;
    else if (zoom === 'Trimestre') pxPerDay = 1160 / 242;

    setResizingTaskId(item.id);
    setResizeTempWidth(initialWidth);
    setResizeTempEndDate(item.end);
    setHoveredTask(null);

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startMouseX;
      const newWidth = Math.max(pxPerDay, initialWidth + deltaX);
      const addedDays = Math.round((newWidth - initialWidth) / pxPerDay);
      const newEnd = shiftDays(item.end, addedDays);

      if (newEnd >= item.start) {
        setResizeTempWidth(newWidth);
        setResizeTempEndDate(newEnd);
      }
    };

    const onMouseUp = (upEvent: MouseEvent) => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      dragCleanupRef.current = null;

      const deltaX = upEvent.clientX - startMouseX;
      const addedDays = Math.round(deltaX / pxPerDay);
      let finalEnd = shiftDays(item.end, addedDays);
      if (finalEnd < item.start) finalEnd = item.start;

      setResizingTaskId(null);
      setResizeTempWidth(null);
      setResizeTempEndDate(null);

      if (finalEnd !== item.end) {
        update(item.id, { end: finalEnd });
        notify(`Plazo actualizado: hasta ${formatDate(finalEnd)} (${getDays(item.start, finalEnd)} días)`);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    // D3: registra el desarme automático por si el módulo se desmonta a mitad del redimensionado
    dragCleanupRef.current = () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  };

  // D3: desarme de listeners de drag si el módulo se desmonta a mitad de un redimensionado
  const dragCleanupRef = useRef<(() => void) | null>(null);
  useEffect(() => () => dragCleanupRef.current?.(), []);

  // D1: conteo territorial DINÁMICO desde la BD (antes: "251" fijo en 4 sitios del UI; la BD puede ganar/perder unidades)
  const countTerritorial = unidades.length;

  const isItemLate = (x: Item) => {
    if (x.status === 'Con retraso') return true;
    if (x.status === 'Completado' || x.status === 'Cumple' || (x.progress ?? 0) >= 100) return false;
    return !!(x.end && currentTodayIso > x.end);
  };

  // D2: métricas globales memoizadas (antes: 5 recorridos completos del array de ítems en CADA render, con ~6,000 ítems)
  const { hitos, subs, inprog, late, complete, overall } = useMemo(() => ({
    hitos: items.filter((x) => x.kind === 'hito'),
    subs: items.filter((x) => x.kind === 'subproceso'),
    inprog: items.filter((x) => x.status === 'En proceso' || x.status === 'En curso').length,
    late: items.filter(isItemLate).length,
    complete: items.filter((x) => x.status === 'Completado' || x.status === 'Cumple').length,
    overall: items.length > 0 ? Math.round(items.reduce((a, x) => a + x.progress, 0) / items.length) : 0,
  }), [items, currentTodayIso]);

  // Mapa de profundidad y niveles WBS (1 al 5) según PMI / PMBOK
  const itemDepthMap = useMemo(() => {
    const dMap = new Map<string, number>();
    const getDepth = (id: string): number => {
      if (dMap.has(id)) return dMap.get(id)!;
      const it = itemsById.get(id);
      if (!it || !it.parentId) {
        dMap.set(id, 0);
        return 0;
      }
      const d = 1 + getDepth(it.parentId);
      dMap.set(id, d);
      return d;
    };
    items.forEach((it) => getDepth(it.id));
    return dMap;
  }, [items, itemsById]);

  // Profundidad máxima real presente en los datos
  const maxProjectDepth = useMemo(() => {
    let maxD = 0;
    items.forEach((it) => {
      const d = itemDepthMap.get(it.id) ?? 0;
      if (d > maxD) maxD = d;
    });
    return maxD;
  }, [items, itemDepthMap]);

  // Conteos por piso jerárquico dinámico
  const dynamicLevelCounts = useMemo(() => {
    const map: Record<number, number> = {};
    for (let d = 0; d <= maxProjectDepth; d++) {
      map[d] = 0;
    }
    items.forEach((it) => {
      const d = itemDepthMap.get(it.id) ?? 0;
      map[d] = (map[d] || 0) + 1;
    });
    return map;
  }, [items, itemDepthMap, maxProjectDepth]);

  // Roles metodológicos PM4R / BID:
  // Componentes: parentId === null
  // Productos / Entregables: hasChildren === true && parentId !== null
  // Paquetes de trabajo: hasChildren === false (nodos terminales con fechas y entregable)
  const rolesCounts = useMemo(() => {
    const componentes = items.filter((x) => !x.parentId).length;
    const productos = items.filter((x) => Boolean(x.parentId) && childrenByParent.has(x.id)).length;
    const paquetes = items.filter((x) => !childrenByParent.has(x.id)).length;
    return { componentes, productos, paquetes };
  }, [items, childrenByParent]);

  // Desglose oficial de niveles WBS según taxonomía PM4R (BID)
  const intermediosCount = useMemo(() => {
    return items.filter((x) => Boolean(x.parentId) && childrenByParent.has(x.id)).length;
  }, [items, childrenByParent]);

  const paquetesCount = useMemo(() => {
    return items.filter((x) => !childrenByParent.has(x.id)).length;
  }, [items, childrenByParent]);

  // Conteo de elementos por período de vencimiento
  const criticalItemsCount = useMemo(() => {
    return items.filter(isItemLate).length;
  }, [items, currentTodayIso]);

  const vencenHoyCount = useMemo(() => {
    return items.filter((x) => x.end === currentTodayIso && x.status !== 'Completado' && x.status !== 'Cumple').length;
  }, [items, currentTodayIso]);

  const vencenSemanaCount = useMemo(() => {
    const curr = new Date(currentTodayIso + 'T12:00:00');
    const dayOfWeek = (curr.getDay() + 6) % 7;
    const monday = new Date(curr);
    monday.setDate(curr.getDate() - dayOfWeek);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const monIso = monday.toISOString().slice(0, 10);
    const sunIso = sunday.toISOString().slice(0, 10);
    return items.filter((x) => x.end >= monIso && x.end <= sunIso && x.status !== 'Completado' && x.status !== 'Cumple').length;
  }, [items, currentTodayIso]);

  const vencenMesCount = useMemo(() => {
    const curr = new Date(currentTodayIso + 'T12:00:00');
    const y = curr.getFullYear();
    const m = curr.getMonth();
    const firstDay = new Date(y, m, 1).toISOString().slice(0, 10);
    const lastDay = new Date(y, m + 1, 0).toISOString().slice(0, 10);
    return items.filter((x) => x.end >= firstDay && x.end <= lastDay && x.status !== 'Completado' && x.status !== 'Cumple').length;
  }, [items, currentTodayIso]);

  const vencenTrimestreCount = useMemo(() => {
    const curr = new Date(currentTodayIso + 'T12:00:00');
    const y = curr.getFullYear();
    const m = curr.getMonth();
    const qStartMonth = Math.floor(m / 3) * 3;
    const firstDay = new Date(y, qStartMonth, 1).toISOString().slice(0, 10);
    const lastDay = new Date(y, qStartMonth + 3, 0).toISOString().slice(0, 10);
    return items.filter((x) => x.end >= firstDay && x.end <= lastDay && x.status !== 'Completado' && x.status !== 'Cumple').length;
  }, [items, currentTodayIso]);

  /* Rango predeterminado del botón Limpiar */
  const DEFAULT_RANGE = { from: RANGE_MIN, to: RANGE_MAX };
  const isRangeActive = rangeFrom !== RANGE_MIN || rangeTo !== RANGE_MAX;

  /* Filtros de columna del motor universal (OR dentro de la columna, AND entre columnas) */
  const engineMatchIds = useMemo(
    () => (engine.hasFilters ? new Set(engine.filter(items).map((r) => r.id)) : null),
    [engine.filter, engine.hasFilters, items]
  );

  const [collapsedByMode, setCollapsedByMode] = useState<{
    gantt: Record<string, boolean>;
    lista: Record<string, boolean>;
  }>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(uiKey('collapsed-by-mode-v1')) || 'null');
      if (saved && typeof saved === 'object') return saved;
    } catch {}
    return { gantt: {}, lista: {} };
  });

  const isItemExpanded = (id: string, defaultExpanded: boolean = true): boolean => {
    // Si hay un filtro de sedes activo y este nodo forma parte del árbol de la sede seleccionada, mantenerlo siempre expandido
    if (matchingSedeIds && matchingSedeIds.has(id)) {
      return true;
    }
    // Si hay un filtro de regiones activo y este nodo forma parte del árbol de la región seleccionada, mantenerlo expandido
    if (matchingRegionIds && matchingRegionIds.has(id)) {
      return true;
    }
    // Si hay un filtro de componente/producto EDT activo y este nodo forma parte del árbol seleccionado, mantenerlo expandido
    if (matchingEdtIds && matchingEdtIds.has(id)) {
      return true;
    }
    const mode = viewMode === 'lista' ? 'lista' : 'gantt';
    const modeMap = collapsedByMode[mode];
    if (modeMap && id in modeMap) {
      return !modeMap[id];
    }
    // En perspectiva territorial (Módulo Sedes), las regiones y sedes inician colapsadas para evitar carga masiva de inicio
    if (perspective === 'territorial') {
      return false;
    }
    return defaultExpanded;
  };

  const toggleItemExpand = (id: string, defaultExpanded: boolean = true) => {
    const canvasEl = (workspaceRef.current?.closest('.qm-canvas') || document.querySelector('.qm-canvas')) as HTMLElement | null;
    const prevCanvasScroll = canvasEl ? canvasEl.scrollTop : 0;

    const mode = viewMode === 'lista' ? 'lista' : 'gantt';
    setCollapsedByMode((prev) => {
      const modeMap = prev[mode] || {};
      const currentlyExpanded = isItemExpanded(id, defaultExpanded);
      const nextCollapsed = currentlyExpanded;
      const next = {
        ...prev,
        [mode]: {
          ...modeMap,
          [id]: nextCollapsed,
        },
      };
      try {
        localStorage.setItem(uiKey('collapsed-by-mode-v1'), JSON.stringify(next));
      } catch {}
      return next;
    });

    if (canvasEl && prevCanvasScroll > 0) {
      requestAnimationFrame(() => {
        canvasEl.scrollTop = prevCanvasScroll;
        requestAnimationFrame(() => {
          canvasEl.scrollTop = prevCanvasScroll;
        });
      });
    }
  };

  const matchingSedeIds = useMemo(() => {
    if (selectedSedes.length === 0) return null;
    const ids = new Set<string>();
    const parentMap = new Map<string, string>();
    items.forEach((it) => {
      if (it.parentId) parentMap.set(it.id, it.parentId);
    });

    items.forEach((it) => {
      const itNameLower = (it.name || '').toLowerCase().trim();
      const itSedeLower = (it.sede || '').toLowerCase().trim();
      const itDistritoLower = (it.distrito || '').toLowerCase().trim();

      const matches = selectedSedes.some((target) => {
        const targetLower = target.toLowerCase().trim();
        return (
          (itSedeLower && (itSedeLower.includes(targetLower) || targetLower.includes(itSedeLower))) ||
          (itDistritoLower && (itDistritoLower.includes(targetLower) || targetLower.includes(itDistritoLower))) ||
          (itNameLower && (itNameLower.includes(targetLower) || targetLower.includes(itNameLower)))
        );
      });

      if (matches) {
        let curr: string | undefined = it.id;
        while (curr) {
          ids.add(curr);
          curr = parentMap.get(curr);
        }
      }
    });
    return ids;
  }, [items, selectedSedes]);

  const matchingEdtIds = useMemo(() => {
    if (selectedEdtCodes.length === 0) return null;
    const ids = new Set<string>();
    const parentMap = new Map<string, string>();
    const childrenMap = new Map<string, string[]>();

    items.forEach((it) => {
      if (it.parentId) {
        parentMap.set(it.id, it.parentId);
        if (!childrenMap.has(it.parentId)) childrenMap.set(it.parentId, []);
        childrenMap.get(it.parentId)!.push(it.id);
      }
    });

    const addDescendants = (id: string) => {
      const children = childrenMap.get(id);
      if (children) {
        children.forEach((cId) => {
          ids.add(cId);
          addDescendants(cId);
        });
      }
    };

    items.forEach((it) => {
      const isSelected = selectedEdtCodes.some(
        (target) => it.id === target || it.code === target || (it.code && it.code.trim() === target.trim())
      );

      if (isSelected) {
        ids.add(it.id);
        let curr: string | undefined = it.id;
        while (curr) {
          ids.add(curr);
          curr = parentMap.get(curr);
        }
        addDescendants(it.id);
      }
    });

    return ids;
  }, [items, selectedEdtCodes]);

  const matchingRegionIds = useMemo(() => {
    if (selectedRegions.length === 0) return null;
    const ids = new Set<string>();
    const normSelected = selectedRegions.map((r) => normalizeRegionKey(r));

    const parentMap = new Map<string, string>();
    items.forEach((it) => {
      if (it.parentId) parentMap.set(it.id, it.parentId);
    });

    items.forEach((it) => {
      const itReg = it.region ? normalizeRegionKey(it.region) : '';
      if (itReg && normSelected.includes(itReg)) {
        ids.add(it.id);
        let curr = it.parentId;
        while (curr) {
          ids.add(curr);
          curr = parentMap.get(curr);
        }
      }
    });

    return ids;
  }, [items, selectedRegions]);

  const matchingGestorIds = useMemo(() => {
    if (gestorFilter === 'Todos') return null;
    const ids = new Set<string>();

    const parentMap = new Map<string, string>();
    items.forEach((it) => {
      if (it.parentId) parentMap.set(it.id, it.parentId);
    });

    items.forEach((it) => {
      const gList = getItemGestores(it);
      if (it.gestor === gestorFilter || gList.includes(gestorFilter)) {
        ids.add(it.id);
        let curr = it.parentId;
        while (curr) {
          ids.add(curr);
          curr = parentMap.get(curr);
        }
      }
    });

    return ids;
  }, [items, gestorFilter]);

  const shownBase = useMemo(() => {
    const isMaestro = perspective === 'maestro';
    const macroDef = macroFilter !== 'Todos' ? getMacroById(macroFilter) : undefined;
    const targetPhaseDef =
      phaseFilter !== 'Todas'
        ? PROJECT_PHASES_CATALOG.find((p) => p.id === phaseFilter || p.name === phaseFilter)
        : undefined;
    const targetPhaseId = targetPhaseDef?.id || phaseFilter;
    const targetPhaseName = targetPhaseDef?.name || phaseFilter;
    return items.filter((x) => {
      if (isMaestro && isTerritorialSedeOnlyItem(x)) {
        return false;
      }
      const parent = x.parentId ? itemsById.get(x.parentId) : undefined;
      const matchSearch = `${x.code} ${x.name}`.toLowerCase().includes(search.toLowerCase());
      const matchEngine = !engineMatchIds || engineMatchIds.has(x.id);
      const matchState =
        stateFilter === 'Todos' ||
        x.status === stateFilter ||
        (stateFilter === 'Cumple' && x.status === 'Completado');
      const matchType =
        typeFilter === 'Todos' || (typeFilter === 'Hitos' ? x.kind === 'hito' : x.kind === 'subproceso');
      const isLateItem = isItemLate(x);
      const matchStateMulti =
        selectedStates.length === 0 ||
        selectedStates.some((st) => {
          if (st === 'En proceso') return x.status === 'En proceso' || x.status === 'En curso';
          if (st === 'Con retraso') return isLateItem;
          if (st === 'Completados') return x.status === 'Completado' || x.status === 'Cumple';
          if (st === 'Pendiente') return x.status === 'Pendiente';
          return x.status === st;
        });
      const matchTab =
        matchStateMulti &&
        (tab === 'Todos' ||
          (tab === 'Hitos' && x.kind === 'hito') ||
          (tab === 'Subprocesos' && x.kind === 'subproceso') ||
          (tab === 'Completados' && (x.status === 'Completado' || x.status === 'Cumple')) ||
          (tab === 'En proceso' && (x.status === 'En proceso' || x.status === 'En curso')) ||
          (tab === 'Con retraso' && isLateItem) ||
          x.status === tab);

      const isExplicitSedeMatch = Boolean(matchingSedeIds && matchingSedeIds.has(x.id));

      const matchRegion =
        selectedRegions.length === 0 ||
        isExplicitSedeMatch ||
        x.region === 'Todas las Regiones' ||
        (matchingRegionIds ? matchingRegionIds.has(x.id) : false);

      const matchGestor =
        gestorFilter === 'Todos' ||
        isExplicitSedeMatch ||
        (matchingGestorIds ? matchingGestorIds.has(x.id) : false);

      const matchMacro =
        !macroDef || !x.region || x.region === MULTI_REGION_VALUE || macroDef.regiones.includes(x.region);
      const matchPhase =
        phaseFilter === 'Todas' ||
        x.phase === targetPhaseId ||
        x.phase === targetPhaseName ||
        x.faseId === targetPhaseId ||
        x.faseId === targetPhaseName ||
        parent?.phase === targetPhaseId ||
        parent?.phase === targetPhaseName ||
        parent?.faseId === targetPhaseId ||
        parent?.faseId === targetPhaseName;

      const matchSede = !matchingSedeIds || matchingSedeIds.has(x.id);
      const matchEdt = !matchingEdtIds || matchingEdtIds.has(x.id);

      // Solapamiento de fechas con el período oficial consultado
      let matchRange = true;
      if (isRangeActive) {
        if (x.kind === 'hito') {
          // El hito coincide si su propio rango se solapa O si cualquiera de sus subprocesos se solapa
          const selfOverlaps = x.start <= rangeTo && x.end >= rangeFrom;
          const anyChildOverlaps = (childrenByParent.get(x.id) ?? []).some(
            (c) => c.start <= rangeTo && c.end >= rangeFrom
          );
          matchRange = selfOverlaps || anyChildOverlaps;
        } else {
          // El subproceso coincide si sus fechas se solapan con el período
          matchRange = x.start <= rangeTo && x.end >= rangeFrom;
        }
      }

      // Ocultar si cualquiera de sus ancestros en la jerarquía (padre, abuelo, etc.) está colapsado (independiente por vista)
      let notCollapsed = true;
      if (isExplicitSedeMatch || (matchingEdtIds && matchingEdtIds.has(x.id))) {
        notCollapsed = true;
      } else {
        let currParentId = x.parentId;
        while (currParentId) {
          const pNode = itemsById.get(currParentId);
          if (!pNode) {
            // Si el padre no existe en el conjunto de items, es un elemento huérfano. Ocultar.
            notCollapsed = false;
            break;
          }
          if (!isItemExpanded(pNode.id, pNode.expanded !== false)) {
            notCollapsed = false;
            break;
          }
          currParentId = pNode.parentId;
        }
      }

      // Reglas de filtros personalizados avanzados
      let matchCustom = true;
      if (customRules.length > 0) {
        matchCustom = customRules.every((r) => {
          if (!r.val) return true;
          const queryVal = r.val.trim().toLowerCase();
          if (r.field === 'name') {
            const full = `${x.code} ${x.name}`.toLowerCase();
            return r.op === 'not_contains' ? !full.includes(queryVal) : full.includes(queryVal);
          }
          if (r.field === 'status') {
            const st = x.status.toLowerCase();
            return r.op === 'neq' ? st !== queryVal : st === queryVal;
          }
          if (r.field === 'progress') {
            const num = parseFloat(r.val) || 0;
            if (r.op === 'gte') return x.progress >= num;
            if (r.op === 'lte') return x.progress <= num;
            return x.progress === num;
          }
          if (r.field === 'gestor') {
            const gList = getItemGestores(x).map((g) => g.toLowerCase());
            return r.op === 'neq'
              ? !gList.some((g) => g.includes(queryVal))
              : gList.some((g) => g.includes(queryVal));
          }
          if (r.field === 'region') {
            const reg = (x.region || 'Todas').toLowerCase();
            return r.op === 'neq' ? !reg.includes(queryVal) : reg.includes(queryVal);
          }
          return true;
        });
      }

      // Filtro doble Estructura WBS: Sección 1 Profundidad + Sección 2 Rol PM4R
      const depth = itemDepthMap.get(x.id) ?? 0;
      const matchDepth = wbsDepthFilter === 'todos' || depth === wbsDepthFilter;

      const hasChildren = childrenByParent.has(x.id);
      let matchRole = true;
      if (wbsRoleFilter === 'componentes') {
        matchRole = !x.parentId;
      } else if (wbsRoleFilter === 'productos') {
        matchRole = Boolean(x.parentId) && hasChildren;
      } else if (wbsRoleFilter === 'paquetes') {
        matchRole = !hasChildren;
      }

      // Compatibilidad con accesos directos existentes (tarjetas métricas)
      let matchWbsLegacy = true;
      if (wbsLevelFilter === 'componentes') matchWbsLegacy = !x.parentId;
      else if (wbsLevelFilter === 'intermedios') matchWbsLegacy = Boolean(x.parentId) && hasChildren;
      else if (wbsLevelFilter === 'paquetes') matchWbsLegacy = !hasChildren;

      const matchWbsLevel = matchDepth && matchRole && matchWbsLegacy;

      // Filtro de Vencimientos y Alertas Críticas (Desplegable formal)
      let matchVencimiento = true;
      if (vencimientosFilter === 'retraso') {
        matchVencimiento = isItemLate(x);
      } else if (vencimientosFilter === 'hoy') {
        matchVencimiento = x.end === currentTodayIso && x.status !== 'Completado' && x.status !== 'Cumple';
      } else if (vencimientosFilter === 'semana') {
        const curr = new Date(currentTodayIso + 'T12:00:00');
        const dayOfWeek = (curr.getDay() + 6) % 7;
        const monday = new Date(curr);
        monday.setDate(curr.getDate() - dayOfWeek);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        const monIso = monday.toISOString().slice(0, 10);
        const sunIso = sunday.toISOString().slice(0, 10);
        matchVencimiento = x.end >= monIso && x.end <= sunIso && x.status !== 'Completado' && x.status !== 'Cumple';
      } else if (vencimientosFilter === 'mes') {
        const curr = new Date(currentTodayIso + 'T12:00:00');
        const y = curr.getFullYear();
        const m = curr.getMonth();
        const firstDay = new Date(y, m, 1).toISOString().slice(0, 10);
        const lastDay = new Date(y, m + 1, 0).toISOString().slice(0, 10);
        matchVencimiento = x.end >= firstDay && x.end <= lastDay && x.status !== 'Completado' && x.status !== 'Cumple';
      } else if (vencimientosFilter === 'trimestre') {
        const curr = new Date(currentTodayIso + 'T12:00:00');
        const y = curr.getFullYear();
        const m = curr.getMonth();
        const qStartMonth = Math.floor(m / 3) * 3;
        const firstDay = new Date(y, qStartMonth, 1).toISOString().slice(0, 10);
        const lastDay = new Date(y, qStartMonth + 3, 0).toISOString().slice(0, 10);
        matchVencimiento = x.end >= firstDay && x.end <= lastDay && x.status !== 'Completado' && x.status !== 'Cumple';
      }

      return (
        matchSearch &&
        matchState &&
        matchType &&
        matchTab &&
        matchRegion &&
        matchGestor &&
        matchMacro &&
        matchSede &&
        matchEdt &&
        matchPhase &&
        matchRange &&
        notCollapsed &&
        matchCustom &&
        matchEngine &&
        matchWbsLevel &&
        matchVencimiento &&
        (() => {
          if (viewMode !== 'lista' || listaTemporalFilter === 'Todos') return true;
          const targetIso = currentTodayIso;
          const curr = new Date(targetIso + 'T12:00:00');
          if (isNaN(curr.getTime())) return true;

          // Helper de solapamiento: la tarea o hito está activa/vigente dentro del rango [fStart, fEnd]
          const isOverlapping = (itemStart: string, itemEnd: string, fStart: string, fEnd: string) => {
            return itemStart <= fEnd && itemEnd >= fStart;
          };

          const checkItemMatch = (item: Item, fStart: string, fEnd: string) => {
            const selfMatch = isOverlapping(item.start, item.end, fStart, fEnd);
            if (selfMatch) return true;
            if (item.kind === 'hito') {
              return (childrenByParent.get(item.id) ?? []).some((c) => isOverlapping(c.start, c.end, fStart, fEnd));
            }
            return false;
          };

          if (listaTemporalFilter === 'Hoy') {
            return checkItemMatch(x, targetIso, targetIso);
          }

          if (listaTemporalFilter === 'Semana') {
            const dayOfWeek = curr.getDay(); // 0 domingo, 1 lunes...
            const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
            const monday = new Date(curr);
            monday.setDate(curr.getDate() + diffToMonday);
            const sunday = new Date(monday);
            sunday.setDate(monday.getDate() + 6);
            const fStart = monday.toISOString().slice(0, 10);
            const fEnd = sunday.toISOString().slice(0, 10);
            return checkItemMatch(x, fStart, fEnd);
          }

          if (listaTemporalFilter === 'Mes') {
            const y = curr.getFullYear();
            const m = curr.getMonth();
            const firstDay = new Date(y, m, 1);
            const lastDay = new Date(y, m + 1, 0);
            const fStart = firstDay.toISOString().slice(0, 10);
            const fEnd = lastDay.toISOString().slice(0, 10);
            return checkItemMatch(x, fStart, fEnd);
          }

          if (listaTemporalFilter === 'Trimestre') {
            const y = curr.getFullYear();
            const q = Math.floor(curr.getMonth() / 3);
            const firstDay = new Date(y, q * 3, 1);
            const lastDay = new Date(y, q * 3 + 3, 0);
            const fStart = firstDay.toISOString().slice(0, 10);
            const fEnd = lastDay.toISOString().slice(0, 10);
            return checkItemMatch(x, fStart, fEnd);
          }

          return true;
        })()
      );
    });
  }, [
    items,
    search,
    stateFilter,
    typeFilter,
    tab,
    selectedRegions,
    phaseFilter,
    gestorFilter,
    rangeFrom,
    rangeTo,
    customRules,
    engineMatchIds,
    collapsedByMode,
    viewMode,
    listaTemporalFilter,
    currentTodayIso,
    wbsDepthFilter,
    wbsRoleFilter,
    wbsLevelFilter,
    vencimientosFilter,
    selectedStates,
    macroFilter,
    selectedSedes,
    matchingSedeIds,
    matchingRegionIds,
    matchingGestorIds,
    selectedEdtCodes,
    matchingEdtIds,
    itemDepthMap,
    itemsById,
    childrenByParent
  ]);

  /* Orden multi-criterio del motor universal (respeta la jerarquía hito > subproceso) */
  const shown = useMemo(() => engine.sortRows(shownBase), [engine.sortRows, shownBase]);

  useEffect(() => {
    setRenderedRowCount(120);
  }, [projectId, perspective, engine.hasFilters]);

  useEffect(() => {
    const sentinel = prefetchSentinelRef.current;
    const container = scrollRef.current;
    if (!sentinel || !container) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setRenderedRowCount((count) => Math.min(count + 120, shown.length));
        }
      },
      { root: container, rootMargin: '900px 0px' }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [shown.length, viewMode]);

  /* Control de Colapso / Despliegue 100% INDEPENDIENTE por vista (Gantt vs Lista) */
  const parentItems = useMemo(() => {
    return items.filter((it) => childrenByParent.has(it.id));
  }, [items, childrenByParent]);

  // Si al menos un nodo contenedor está expandido, el botón de colapso contraerá todo a Nivel 1.
  const hasAnyExpanded = useMemo(() => {
    return parentItems.length > 0 && parentItems.some((h) => isItemExpanded(h.id, h.expanded !== false));
  }, [parentItems, collapsedByMode, viewMode]);

  const allHitosExpanded = hasAnyExpanded;

  const toggleAllHitosExpand = () => {
    const canvasEl = (workspaceRef.current?.closest('.qm-canvas') || document.querySelector('.qm-canvas')) as HTMLElement | null;
    const prevCanvasScroll = canvasEl ? canvasEl.scrollTop : 0;

    // Si hay alguno expandido, la intención universal es contraer todo. Si ya están todos colapsados, expandir.
    const nextState = !hasAnyExpanded;
    const mode = viewMode === 'lista' ? 'lista' : 'gantt';
    setCollapsedByMode((prev) => {
      const nextModeMap: Record<string, boolean> = { ...(prev[mode] || {}) };
      parentItems.forEach((p) => {
        nextModeMap[p.id] = !nextState;
      });
      const next = { ...prev, [mode]: nextModeMap };
      try {
        localStorage.setItem(uiKey('collapsed-by-mode-v1'), JSON.stringify(next));
      } catch {}
      return next;
    });

    if (canvasEl && prevCanvasScroll > 0) {
      // Preservar la posición de scroll de .qm-canvas para que las tarjetas de métricas permanezcan ancladas arriba
      requestAnimationFrame(() => {
        canvasEl.scrollTop = prevCanvasScroll;
        requestAnimationFrame(() => {
          canvasEl.scrollTop = prevCanvasScroll;
        });
      });
    }

    notify(
      nextState
        ? `Todos los niveles desplegados en ${viewMode === 'lista' ? 'Modo Lista' : 'Modo Gantt'}`
        : `Vista colapsada a niveles principales en ${viewMode === 'lista' ? 'Modo Lista' : 'Modo Gantt'}`
    );
  };

  /* Exportación de Plantilla Oficial de Cronograma para completar en Excel */
  const exportExcelTemplate = () => {
    const headers = [
      'Código',
      'Nombre de Componente o Subcomponente',
      'Tipo (COMPONENTE/PRODUCTO)',
      'Componente Padre (Código)',
      'Fecha Inicio (YYYY-MM-DD)',
      'Fecha Fin (YYYY-MM-DD)',
      'Avance (%)',
      'Estado',
      'Responsable(s)',
      'Región',
      'Descripción'
    ];

    const sampleRows = items.map((x) => {
      const parent = items.find((p) => p.id === x.parentId);
      const gestoresList = getItemGestores(x);
      return [
        x.code,
        `"${x.name.replace(/"/g, '""')}"`,
        resolveEdtNodeType(x, items),
        parent ? parent.code : '',
        x.start,
        x.end,
        x.progress,
        x.status,
        `"${gestoresList.join(', ')}"`,
        `"${x.region || 'Nacional'}"`,
        `"${(x.description || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = '\uFEFF' + [headers.join(','), ...sampleRows.map((r) => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Plantilla_Cronograma_QawayLab_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify('Plantilla oficial de cronograma descargada. Completa en Excel y vuelve a subir.');
  };

  const segments = useMemo(() => buildSegments(zoom), [zoom]);
  const segCols = useMemo(() => segments.map((s) => `${s.days}fr`).join(' '), [segments]);
  const yearCols = useMemo(() => ['2026', '2027'].map((y, i) => `${getDays(i === 0 ? RANGE_MIN : '2027-01-01', i === 0 ? '2026-12-31' : RANGE_MAX)}fr`).join(' '), []);
  const todayPos = calcPosition(currentTodayIso);
  const denseZoom = zoom === 'Día' || zoom === 'Semana';

  const add = (kind: Kind, parentHitoId?: string, openInline: boolean = false, initialStatus?: Status) => {
    const id = (kind === 'hito' ? 'comp-' : 'sub-') + Date.now();
    const pId = parentHitoId || (kind === 'subproceso' ? (drawerDraft?.id || hitos[0]?.id) : undefined);
    let code = `${hitos.length + 1}.`;
    let defaultStart = '2026-10-26';
    let defaultEnd = '2026-11-30';
    if (kind === 'subproceso') {
      const parent = items.find((x) => x.id === pId);
      if (parent) {
        const siblings = items.filter((x) => x.parentId === pId);
        const childIndex = siblings.length + 1;
        const parentCodeClean = parent.code.endsWith('.') ? parent.code.slice(0, -1) : parent.code;
        code = `${parentCodeClean}.${childIndex}`;
        defaultStart = parent.start;
        defaultEnd = parent.end;
      } else {
        code = `1.${subs.length + 1}`;
      }
    }
    if (kind === 'subproceso' && pId) {
      const parentDepth = itemDepthMap.get(pId) ?? 0;
      if (parentDepth >= 4) {
        notify('Límite metodológico alcanzado (5 niveles según PMI/PMBOK). La creación de niveles adicionales requiere aprobación formal del Coordinador General.');
        return;
      }
      const existingSiblings = items.filter((x) => x.parentId === pId);
      if (existingSiblings.length === 0) {
        notify('Aviso metodológico EDT (PMI): Según la regla del 100%, todo contenedor desglosado debe constar de al menos dos elementos para representar la totalidad del alcance.');
      }
    }

    const draftItem: Item = {
      id,
      code,
      name: kind === 'hito' ? 'Nuevo componente' : 'Nuevo paquete de trabajo',
      kind,
      edtType: kind === 'hito' ? 'COMPONENTE' : 'PAQUETE_TRABAJO',
      wbsNodeType: kind === 'hito' ? 'COMPONENTE' : 'PAQUETE_TRABAJO',
      faseId: null,
      parentId: pId,
      start: defaultStart,
      end: defaultEnd,
      progress: 0,
      status: initialStatus || 'Pendiente',
      expanded: true,
      description: '',
      deliverable: '',
      reportType: 'Línea de tiempo',
      region: 'Todas',
      gestor: 'Sin asignar',
    };

    if (openInline) {
      if (pId) {
        const mode = viewMode === 'lista' ? 'lista' : 'gantt';
        setCollapsedByMode((prev) => {
          const next = {
            ...prev,
            [mode]: {
              ...(prev[mode] || {}),
              [pId]: false,
            },
          };
          try {
            localStorage.setItem(uiKey('collapsed-by-mode-v1'), JSON.stringify(next));
          } catch {}
          return next;
        });
      }
      commitChange((old) => {
        if (pId) {
          const withExpanded = old.map((it) => (it.id === pId ? { ...it, expanded: true } : it));
          const parentIdx = withExpanded.findIndex((it) => it.id === pId);
          if (parentIdx >= 0) {
            const isDescendant = (itemId: string, ancestorId: string): boolean => {
              let curr = withExpanded.find((x) => x.id === itemId)?.parentId;
              while (curr) {
                if (curr === ancestorId) return true;
                curr = withExpanded.find((x) => x.id === curr)?.parentId;
              }
              return false;
            };

            let lastChildIdx = parentIdx;
            for (let idx = parentIdx + 1; idx < withExpanded.length; idx++) {
              const row = withExpanded[idx];
              if (!row) break;
              if (row.parentId === pId || isDescendant(row.id, pId)) {
                lastChildIdx = idx;
              } else if (row.kind === 'hito') {
                break;
              }
            }
            const copy = [...withExpanded];
            copy.splice(lastChildIdx + 1, 0, draftItem);
            return copy;
          }
        }
        return [...old, draftItem];
      });
      setSelectedId(id);
      setInlineDraftCreatedId(id);
      toggleEdit(draftItem, 'name');
      notify(`Nuevo ${kind === 'hito' ? 'componente' : 'subcomponente'} creado. Escribe el nombre y pulsa Enter para guardar.`);
      return;
    };

    setSelectedId(id);
    setDrawerDraft(draftItem);
    setIsNewDraft(true);
    setEditorInitialSnapshot(captureSnapshot(draftItem));
    setEditorTab('info');
    setPanelOpen(true);
    setNewMenu(false);
    notify(`Borrador de nuevo ${kind === 'hito' ? 'componente' : 'subcomponente'} abierto. Configura y pulsa "Guardar cambios".`);
  };

  const exportCSV = () => {
    const csv = [
      ['Código', 'Nombre', 'Tipo', 'Inicio', 'Fin', 'Duración (días)', 'Avance', 'Estado', 'Región', 'Gestor'],
      ...items.map((x) => [
        x.code,
        x.name,
        getEdtNodeDisplayLabel(x, items),
        x.start,
        x.end,
        getDays(x.start, x.end),
        x.progress + '%',
        x.status,
        x.region || 'Nacional',
        x.gestor || 'Coordinador',
      ]),
    ]
      .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `Cronograma_Maestro_${(activeProject?.name || 'Proyecto').replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify('Cronograma maestro exportado a CSV');
  };

  const deleteItem = () => {
    if (!activeItem) return;
    if (isNewDraft) {
      setPanelOpen(false);
      setDrawerDraft(null);
      setIsNewDraft(false);
      setEditorInitialSnapshot('');
      notify('Borrador descartado');
      return;
    }
    setDeleteConfirmModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!activeItem) return;
    const idsToDelete = new Set<string>();
    idsToDelete.add(activeItem.id);
    const collectDescendants = (parentId: string) => {
      items.filter((x) => x.parentId === parentId).forEach((child) => {
        idsToDelete.add(child.id);
        collectDescendants(child.id);
      });
    };
    collectDescendants(activeItem.id);

    const remaining = items.filter((x) => !idsToDelete.has(x.id));
    commitChange(() => remaining);
    deleteCronogramaItemFromSupabase(projectId, activeItem.id, Array.from(idsToDelete));
    setDrawerDraft(null);
    setSelectedId(null);
    setPanelOpen(false);
    notify('Elemento y sus dependientes eliminados con éxito del cronograma maestro');
  };

  const renderProgressInner = (val: number, statusTone: string, format: 'bar' | 'ring' | 'number') => {
    if (format === 'ring') {
      const radius = 7.5;
      const circ = 2 * Math.PI * radius;
      const offset = circ * (1 - Math.min(100, Math.max(0, val)) / 100);
      const strokeColor =
        val === 100 ? '#10b981' : statusTone === 'red' ? '#ef4444' : statusTone === 'gray' ? '#94a3b8' : '#2563eb';
      return (
        <div className="progress-ring-wrap" title={`${val}%`}>
          <svg width="20" height="20" viewBox="0 0 20 20" className="progress-ring-svg">
            <circle cx="10" cy="10" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="2.5" />
            <circle
              cx="10"
              cy="10"
              r={radius}
              fill="none"
              stroke={strokeColor}
              strokeWidth="2.5"
              strokeDasharray={circ}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="progress-ring-circle"
            />
          </svg>
          <b style={{ fontWeight: 500 }}>{val}%</b>
        </div>
      );
    }
    if (format === 'number') {
      return <b style={{ fontWeight: 500 }}>{val}%</b>;
    }
    const barColorClass =
      val === 100 ? 'green' : statusTone === 'red' ? 'red' : statusTone === 'gray' ? 'gray' : 'blue';
    return (
      <>
        <span>
          <i className={barColorClass} style={{ width: `${val}%` }} />
        </span>
        <b style={{ fontWeight: 500 }}>{val}%</b>
      </>
    );
  };

  const renderProgressVisual = (progressVal: number, statusTone: string, colId: string) => {
    const format = percentGraphFormats[colId] || 'bar';
    return (
      <div className="progress editable" style={{ width: '100%' }}>
        {renderProgressInner(progressVal, statusTone, format)}
      </div>
    );
  };

  const renderHeaderCell = (colKey: ColKey) => {
    if (colKey === 'code') {
      return (
        <div key="code" className="th-col-header th-col-code">
          <input
            type="checkbox"
            aria-label="Seleccionar todos los registros visibles"
            checked={shown.length > 0 && shown.every((it) => selectedRowIds.has(it.id))}
            ref={(input) => {
              if (input) {
                const allSel = shown.length > 0 && shown.every((it) => selectedRowIds.has(it.id));
                const someSel = shown.some((it) => selectedRowIds.has(it.id));
                input.indeterminate = !allSel && someSel;
              }
            }}
            onChange={() => toggleSelectAllShown(shown)}
            title={
              shown.length > 0 && shown.every((it) => selectedRowIds.has(it.id))
                ? 'Deseleccionar todos'
                : 'Seleccionar todos los registros visibles'
            }
          />
          <span className="th-label">Código</span>
          <div className={`col-resizer ${resizingCol === 'code' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'code')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('code'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
        </div>
      );
    }
    if (colKey === 'name') {
      const colLabelText = getColLabel('name', viewMode === 'lista' ? 'Nombre' : 'COMPONENTE / PRODUCTO');
      return (
        <div key="name" className="name-head">
          <span className="name-head-label" title={colLabelText}>
            {colLabelText}
          </span>
          <div className="head-col-actions">
            {renderColumnHeaderMenu("name", "cols-trigger-btn")}
            <button
              type="button"
              className={`cols-trigger-btn collapse-toggle-btn ${!allHitosExpanded ? 'collapsed' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                toggleAllHitosExpand();
              }}
              title={allHitosExpanded ? "Colapsar todos los componentes y subcomponentes" : "Expandir todos los componentes y subcomponentes"}
            >
              <ChevronsUpDown size={14} />
            </button>
            {viewMode === 'gantt' && (
              <button
                type="button"
                className={`cols-trigger-btn panel-collapse-btn ${visibleCols.length === 1 ? 'active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCompactColumns();
                }}
                title={visibleCols.length === 1 ? "Mostrar todas las columnas del cronograma" : "Colapsar columnas y dejar solo la columna principal"}
              >
                {visibleCols.length === 1 ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
              </button>
            )}
          </div>
          <div className={`col-resizer ${resizingCol === 'name' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'name')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('name'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
        </div>
      );
    }
    if (colKey === 'actions') {
      return (
        <div key="actions" className="th-col-header th-col-actions">
          <span className="th-label">Acciones</span>
        </div>
      );
    }

    const customDef = customCols.find((c) => c.key === colKey);
    const defaultLabel = customDef?.label || ALL_COL_META.find((c) => c.key === colKey)?.label || colKey;
    const label = getColLabel(colKey, defaultLabel);

    return (
      <div key={colKey} className="th-col-header">
        <span className="th-label">{label}</span>
        <div className="th-actions">
          <button
            type="button"
            className="th-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              toggleColVisibility(colKey as ColKey);
              notify(`Columna "${label}" ocultada.`);
            }}
            title={`Ocultar columna ${label}`}
          >
            <EyeOff size={11} />
          </button>
          {renderColumnHeaderMenu(colKey)}
        </div>
        <div
          className={`col-resizer ${resizingCol === colKey ? 'is-resizing' : ''}`}
          onMouseDown={(e) => startResize(e, colKey as ColKey)}
          onDoubleClick={(e) => {
            e.stopPropagation();
            resetSingleColWidth(colKey as ColKey);
          }}
          title="Arrastra para redimensionar · Doble clic para auto-ajustar"
        />
      </div>
    );
  };

  const renderRowCell = (x: Item, colKey: ColKey) => {
    if (colKey === 'code') {
      return (
        <div key="code" className="code-cell-col" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selectedRowIds.has(x.id)}
            aria-label={`Seleccionar ${x.code} ${x.name}`}
            onChange={(e) => {
              e.stopPropagation();
              toggleSelectRow(x.id);
            }}
          />
          <span className="code-num">{x.code || (x.sede ? (x.name.startsWith('DRE') || x.name.startsWith('GRE') ? 'DRE' : 'UGEL') : '')}</span>
        </div>
      );
    }

    if (colKey === 'name') {
      const hasChildren = childrenByParent.has(x.id);
      const nodeType: 'COMPONENTE' | 'PRODUCTO' | 'PAQUETE_TRABAJO' | 'HITO' =
        x.wbsNodeType === 'PRODUCTO'
          ? 'PRODUCTO'
          : (x.wbsNodeType as any) ||
            (!x.parentId ? (hasChildren ? 'COMPONENTE' : 'PAQUETE_TRABAJO') : hasChildren ? 'PRODUCTO' : (x.kind === 'hito' || x.start === x.end ? 'HITO' : 'PAQUETE_TRABAJO'));

      return (
        <div key="name" className="name-cell">
          {getItemDepth(x) > 0 && (
            <span style={{ width: `${getItemDepth(x) * 10}px`, flexShrink: 0 }} />
          )}
          {hasChildren ? (
            <button
              className="expand"
              onClick={(e) => {
                e.stopPropagation();
                toggleItemExpand(x.id, x.expanded !== false);
              }}
              title={isItemExpanded(x.id, x.expanded !== false) ? "Colapsar nodo" : "Expandir nodo"}
            >
              {isItemExpanded(x.id, x.expanded !== false) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </button>
          ) : (
            <span className="expand-spacer" style={{ width: 16, height: 20, display: 'inline-block', flexShrink: 0 }} />
          )}
          {nodeType === 'COMPONENTE' ? (
            <span className="gantt-row-icon componente" title="Componente rector">
              <Layers size={14} />
            </span>
          ) : isSedeItem(x) && getSedeType(x) === 'dre' ? (
            <span className="gantt-row-icon dre" title="Sede Regional Matriz (DRE / GRE)">
              <Building2 size={13} style={{ color: '#1e40af' }} />
            </span>
          ) : isSedeItem(x) && getSedeType(x) === 'ugel' ? (
            <span className="gantt-row-icon ugel" title="Unidad Territorial Operativa (UGEL)">
              <Building size={13} style={{ color: '#0284c7' }} />
            </span>
          ) : isSedeItem(x) && getSedeType(x) === 'central' ? (
            <span className="gantt-row-icon central" title="Sede Central Matriz">
              <Building2 size={13} style={{ color: '#0f172a' }} />
            </span>
          ) : (
            <>
              {nodeType === 'PRODUCTO' && (
                <span className="gantt-row-icon producto" title="Producto entregable">
                  <Package size={13} />
                </span>
              )}
              {nodeType === 'HITO' && (
                <span className="gantt-row-icon hito" title="Hito clave">
                  <Flag size={13} />
                </span>
              )}
              {nodeType === 'PAQUETE_TRABAJO' && (
                <span className="gantt-row-icon paquete" title="Paquete de trabajo / Entregable">
                  <ListChecks size={13} />
                </span>
              )}
            </>
          )}
          {Boolean(x.code) && (
            <span className="code" style={{ fontWeight: 500, color: '#64748b', fontSize: '12.5px', flexShrink: 0 }}>
              {x.code}
            </span>
          )}
          {isEditing(x, 'name') ? (
            <input
              className="cell-editor cell-input name-edit"
              autoFocus
              onFocus={(e) => e.currentTarget.select()}
              defaultValue={x.name}
              title="Enter para guardar · Shift+Enter para agregar otro · Esc para cancelar"
              onBlur={(e) => {
                const val = e.target.value.trim();
                if (inlineDraftCreatedId === x.id && (!val || val === 'Nuevo componente' || val === 'Nuevo subcomponente')) {
                  commitChange((old) => old.filter((it) => it.id !== x.id));
                  setInlineDraftCreatedId(null);
                  closeEdit();
                  notify('Borrador sin nombre descartado.');
                  return;
                }
                update(x.id, { name: val || x.name });
                setInlineDraftCreatedId(null);
                closeEdit();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const val = e.currentTarget.value.trim();
                  if (inlineDraftCreatedId === x.id && (!val || val === 'Nuevo componente' || val === 'Nuevo subcomponente')) {
                    commitChange((old) => old.filter((it) => it.id !== x.id));
                    setInlineDraftCreatedId(null);
                    closeEdit();
                    notify('Borrador sin nombre descartado.');
                    return;
                  }
                  update(x.id, { name: val || x.name });
                  setInlineDraftCreatedId(null);
                  closeEdit();
                  if (e.shiftKey) {
                    setTimeout(() => {
                      add(x.kind, x.parentId, true);
                    }, 50);
                  }
                }
                if (e.key === 'Escape') {
                  e.preventDefault();
                  if (inlineDraftCreatedId === x.id) {
                    commitChange((old) => old.filter((it) => it.id !== x.id));
                    setInlineDraftCreatedId(null);
                    closeEdit();
                    notify('Creación cancelada.');
                    return;
                  }
                  closeEdit();
                }
              }}
            />
          ) : (
            <span
              className="name"
              title="Clic para editar nombre · Doble clic para detalle"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(x.id);
                toggleEdit(x, 'name');
              }}
            >
              {x.name}
            </span>
          )}

          {/* Micro-acciones rápidas inline */}
          {edit?.id !== x.id && (
            <div className="quick-inline-actions" onClick={(e) => e.stopPropagation()}>
              <button
                type="button"
                className="quick-inline-icon-btn"
                title={`Crear nueva tarea rápida subordinada a "${x.name}"`}
                onClick={(e) => {
                  e.stopPropagation();
                  add('subproceso', x.id, true);
                }}
              >
                <Plus size={13} style={{ color: '#0066ff' }} />
              </button>
              {x.wbsNodeType === 'COMPONENTE' && (
                <>
                  <button
                    type="button"
                    className="quick-inline-icon-btn"
                    title={`Agregar subcomponente hijo para este componente (${x.code})`}
                    onClick={(e) => {
                      e.stopPropagation();
                      add('subproceso', x.id, true);
                    }}
                  >
                    <CornerDownRight size={13} style={{ color: '#0284c7' }} />
                  </button>
                  <button
                    type="button"
                    className="quick-inline-icon-btn"
                    title={isItemExpanded(x.id, x.expanded !== false) ? "Colapsar subcomponentes" : "Expandir subcomponentes"}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleItemExpand(x.id, x.expanded !== false);
                    }}
                  >
                    {isItemExpanded(x.id, x.expanded !== false) ? (
                      <ChevronDown size={13} style={{ color: '#0284c7' }} />
                    ) : (
                      <ChevronRight size={13} style={{ color: '#64748b' }} />
                    )}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      );
    }

    if (colKey === 'kind') {
      return (
        <div key="kind" className="kind-cell-col">
          <span className={`type-text-label ${x.kind === 'hito' ? 'is-hito' : 'is-sub'}`}>
            {getEdtNodeDisplayLabel(x, items)}
          </span>
        </div>
      );
    }

    if (colKey === 'deliverable') {
      const firstDeliv = x.deliverables && x.deliverables.length > 0 ? x.deliverables[0] : null;
      const delivText = x.deliverable || firstDeliv?.name || '';
      const delivFormat = firstDeliv?.type || 'document';
      const DelivIcon =
        delivFormat === 'spreadsheet'
          ? FileSpreadsheet
          : delivFormat === 'presentation'
          ? Presentation
          : delivFormat === 'link'
          ? Link2
          : delivFormat === 'physical'
          ? Package
          : FileText;
      const delivColor =
        delivFormat === 'spreadsheet'
          ? '#16a34a'
          : delivFormat === 'presentation'
          ? '#ea580c'
          : delivFormat === 'link'
          ? '#7c3aed'
          : delivFormat === 'physical'
          ? '#d97706'
          : '#2563eb';

      return (
        <div
          key="deliverable"
          className="deliverable-cell-col editable"
          style={{ display: 'flex', alignItems: 'center', minWidth: 0, padding: '0 8px', gap: '6px' }}
          title={delivText || 'Clic para definir entregable oficial del EDT'}
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'deliverable');
          }}
        >
          {isEditing(x, 'deliverable') ? (
            <input
              className="cell-editor cell-input"
              type="text"
              autoFocus
              defaultValue={delivText}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                const val = e.target.value.trim();
                update(x.id, {
                  deliverable: val,
                  deliverables: val ? [{ id: firstDeliv?.id || `deliv-${x.id}`, name: val, type: delivFormat }] : [],
                });
                closeEdit();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') closeEdit();
              }}
            />
          ) : delivText ? (
            <>
              <DelivIcon size={13} style={{ color: delivColor, flexShrink: 0 }} />
              <span
                className="cell-text"
                style={{ fontSize: '12.5px', color: '#334155', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {delivText}
              </span>
            </>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: '12.5px' }}>—</span>
          )}
        </div>
      );
    }

    if (colKey === 'parent') {
      const parentItem = x.parentId ? itemsById.get(x.parentId) ?? null : null;
      return (
        <div
          key="parent"
          className="parent-cell-col editable"
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'parent');
          }}
        >
          {isEditing(x, 'parent') ? (
            <select
              className="cell-editor cell-select"
              autoFocus
              defaultValue={x.parentId || ''}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                update(x.id, { parentId: e.target.value || undefined });
                closeEdit();
              }}
              onBlur={closeEdit}
            >
              <option value="">— Ninguno (Nivel raíz) —</option>
              {items
                .filter((p) => p.id !== x.id)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} {p.name}
                  </option>
                ))}
            </select>
          ) : (
            <span className="cell-text">
              {parentItem ? `${parentItem.code} ${parentItem.name}` : '—'}
            </span>
          )}
        </div>
      );
    }

    if (colKey === 'start') {
      return (
        <div
          key="start"
          className="start editable"
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'start');
          }}
        >
          {isEditing(x, 'start') ? (
            <input
              className="cell-editor cell-input date-edit"
              type="date"
              autoFocus
              defaultValue={x.start}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                setStart(x, e.target.value);
                closeEdit();
              }}
              onBlur={closeEdit}
            />
          ) : (
            <span className="cell-text">{formatDatePE(x.start)}</span>
          )}
        </div>
      );
    }

    if (colKey === 'end') {
      return (
        <div
          key="end"
          className="end editable"
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'end');
          }}
        >
          {isEditing(x, 'end') ? (
            <input
              className="cell-editor cell-input date-edit"
              type="date"
              autoFocus
              defaultValue={x.end}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                setEnd(x, e.target.value);
                closeEdit();
              }}
              onBlur={closeEdit}
            />
          ) : (
            <span className="cell-text">{formatDatePE(x.end)}</span>
          )}
        </div>
      );
    }

    if (colKey === 'duration') {
      const isPercent = colTypeOverrides['duration'] === 'percent';
      const isPlainNum = colTypeOverrides['duration'] === 'number';
      const durationVal = getDays(x.start, x.end);
      return (
        <div
          key="duration"
          className="duration editable"
          title="Editar días: recalcula la fecha de fin"
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'duration');
          }}
        >
          {isEditing(x, 'duration') ? (
            <input
              className="cell-editor cell-input num-edit"
              type="number"
              min={1}
              max={365}
              autoFocus
              defaultValue={durationVal}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                setDuration(x, e.target.value);
                closeEdit();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') closeEdit();
              }}
            />
          ) : isPercent ? (
            renderProgressVisual(durationVal, 'blue', 'duration')
          ) : (
            <span className="cell-text">
              {isPlainNum ? durationVal : `${durationVal} días`}
            </span>
          )}
        </div>
      );
    }

    if (colKey === 'progress') {
      const statusTone = x.progress === 100 ? 'green' : x.status === 'Con retraso' ? 'red' : x.status === 'Pendiente' ? 'gray' : 'blue';
      const isContainer = Boolean((x.children && x.children.length > 0) || x.wbsNodeType === 'COMPONENTE' || x.wbsNodeType === 'PRODUCTO' || childrenByParent.has(x.id));
      const linkedTaskSummary = !isContainer ? getLinkedTasksSummary(x, rawTasks) : null;
      const format = percentGraphFormats['progress'] || 'bar';

      if (isContainer) {
        return (
          <div
            key="progress"
            className="progress is-rollup"
            title="Avance calculado por rollup de subelementos (PMI - Regla del 100%)"
            style={{ cursor: 'default' }}
          >
            {renderProgressInner(x.progress, statusTone, format)}
          </div>
        );
      }

      if (linkedTaskSummary) {
        return (
          <div
            key="progress"
            className="progress is-linked-tasks"
            title={`Avance gobernado por tareas operativas: ${linkedTaskSummary.completed}/${linkedTaskSummary.total} completadas (Regla del 100%)`}
            style={{ cursor: 'default' }}
          >
            {renderProgressInner(x.progress, statusTone, format)}
          </div>
        );
      }

      return (
        <div
          key="progress"
          className="progress editable"
          title="Clic para ajustar el avance (0–100%)"
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'progress');
          }}
        >
          {isEditing(x, 'progress') ? (
            <div className="cell-editor cell-pop progress-pop" onClick={(e) => e.stopPropagation()}>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={x.progress}
                onChange={(e) => setProgress(x, +e.target.value)}
              />
              <b style={{ fontWeight: 500 }}>{x.progress}%</b>
            </div>
          ) : (
            renderProgressInner(x.progress, statusTone, format)
          )}
        </div>
      );
    }

    if (colKey === 'deviation') {
      const dev = getDeviationDays(x, currentTodayIso);
      const tone = getDeviationTone(dev);
      const isEditingDev = isEditing(x, 'deviation');
      return (
        <div
          key="deviation"
          className="deviation-cell editable"
          style={{ cursor: 'pointer', position: 'relative' }}
          title={
            dev === undefined
              ? 'Clic para fijar línea base y medir desviación'
              : `Desviación: ${formatDeviation(dev)} · Fin aprobado: ${formatDate(x.baselineEnd ?? '')} · Clic para ajustar fecha base`
          }
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'deviation');
          }}
        >
          <span className={`dev-text ${tone}`} style={{ fontWeight: 500 }}>
            {formatDeviation(dev)}
          </span>
          {isEditingDev && (
            <div
              className="cell-editor cell-pop dev-baseline-pop"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="dev-baseline-pop-title">Línea base contractual</div>
              <label className="dev-baseline-pop-field">
                <span>Fin aprobado:</span>
                <input
                  type="date"
                  defaultValue={x.baselineEnd || x.end}
                  onChange={(e) => {
                    const nextEnd = e.target.value;
                    if (!nextEnd) return;
                    update(x.id, {
                      baselineStart: x.baselineStart || x.start,
                      baselineEnd: nextEnd,
                    });
                  }}
                />
              </label>
              <div className="dev-baseline-pop-actions">
                {!hasBaseline(x) ? (
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => {
                      update(x.id, freezeBaseline(x));
                      closeEdit();
                      notify(`Línea base fijada en ${formatDate(x.end)}`);
                    }}
                  >
                    Fijar línea base actual
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => {
                      const next = { ...x };
                      delete next.baselineStart;
                      delete next.baselineEnd;
                      commitChange((old) => old.map((it) => (it.id === x.id ? next : it)));
                      closeEdit();
                      notify('Línea base restablecida');
                    }}
                  >
                    Restablecer
                  </button>
                )}
                <button type="button" className="btn secondary" onClick={closeEdit}>
                  Listo
                </button>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (colKey === 'status') {
      return (
        <div
          key="status"
          className="status-cell editable"
          title={`Estado: ${x.status} · Clic para cambiar`}
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'status');
          }}
        >
          {isEditing(x, 'status') ? (
            <div className="cell-editor cell-pop status-pop" onClick={(e) => e.stopPropagation()}>
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className={s === x.status ? 'cur' : ''}
                  onClick={(e) => {
                    e.stopPropagation();
                    setStatusWithSync(x, s);
                    closeEdit();
                  }}
                >
                  <span className={`status-item ${STATUS_CLASS[s]}`}>
                    <span className="status-dot" />
                    <span className="status-label">{s}</span>
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <span className={`status-item ${STATUS_CLASS[x.status]}`}>
              <span className="status-dot" />
              <span className="status-label">{x.status}</span>
            </span>
          )}
        </div>
      );
    }

    if (colKey === 'dependencies') {
      const deps = (x.dependencies ?? []).filter((id) => id && id !== x.id);
      return (
        <div
          key="dependencies"
          className="dependencies editable"
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'dependencies');
          }}
        >
          {isEditing(x, 'dependencies') ? (
            <div className="cell-editor cell-pop dep-picker-pop" onClick={(e) => e.stopPropagation()}>
              <div className="dep-picker-header">
                <span>Predecesores de {x.code}</span>
                <button type="button" className="dep-picker-close" onClick={closeEdit}>
                  <X size={12} />
                </button>
              </div>
              <div className="dep-picker-list">
                {items
                  .filter((c) => c.id !== x.id)
                  .map((c) => {
                    const isChecked = deps.includes(c.id);
                    return (
                      <label key={c.id} className="dep-picker-item">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...deps, c.id]
                              : deps.filter((id) => id !== c.id);
                            update(x.id, { dependencies: next });
                          }}
                        />
                        <span className="dep-code">{c.code}</span>
                        <span className="dep-name">{c.name}</span>
                      </label>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="dep-tags">
              {deps.length > 0 ? (
                deps.map((depId) => {
                  const depItem = items.find((it) => it.id === depId);
                  return (
                    <span key={depId} className="dep-tag" title={depItem ? `${depItem.code} - ${depItem.name}` : depId}>
                      {depItem?.code || depId}
                    </span>
                  );
                })
              ) : (
                <span className="cell-text" style={{ color: '#94a3b8' }}>—</span>
              )}
            </div>
          )}
        </div>
      );
    }

    if (colKey === 'successors') {
      const succs = items.filter((it) => it.id !== x.id && (it.dependencies || []).includes(x.id));
      return (
        <div
          key="successors"
          className="dependencies editable"
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'successors');
          }}
        >
          {isEditing(x, 'successors') ? (
            <div className="cell-editor cell-pop dep-picker-pop" onClick={(e) => e.stopPropagation()}>
              <div className="dep-picker-header">
                <span>Sucesores de {x.code}</span>
                <button type="button" className="dep-picker-close" onClick={closeEdit}>
                  <X size={12} />
                </button>
              </div>
              <div className="dep-picker-list">
                {items
                  .filter((c) => c.id !== x.id)
                  .map((c) => {
                    const isChecked = (c.dependencies || []).includes(x.id);
                    return (
                      <label key={c.id} className="dep-picker-item">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            commitChange((old) =>
                              old.map((it) => {
                                if (it.id !== c.id) return it;
                                const curr = new Set(it.dependencies || []);
                                if (checked) curr.add(x.id);
                                else curr.delete(x.id);
                                return { ...it, dependencies: Array.from(curr) };
                              })
                            );
                          }}
                        />
                        <span className="dep-code">{c.code}</span>
                        <span className="dep-name">{c.name}</span>
                      </label>
                    );
                  })}
              </div>
            </div>
          ) : (
            <div className="dep-tags">
              {succs.length > 0 ? (
                succs.map((succItem) => (
                  <span key={succItem.id} className="dep-tag" title={`${succItem.code} - ${succItem.name}`}>
                    {succItem.code || succItem.id}
                  </span>
                ))
              ) : (
                <span className="cell-text" style={{ color: '#94a3b8' }}>—</span>
              )}
            </div>
          )}
        </div>
      );
    }

    if (colKey === 'gestor') {
      return (
        <div
          key="gestor"
          className="gestor editable"
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'gestor');
          }}
        >
          {isEditing(x, 'gestor') ? (
            <select
              className="cell-editor cell-select"
              autoFocus
              defaultValue={x.gestor || 'Carlos Sandoval'}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                update(x.id, { gestor: e.target.value });
                closeEdit();
              }}
              onBlur={closeEdit}
            >
              <option value="Carlos Sandoval">Carlos Sandoval</option>
              <option value="Lucía Flores">Lucía Flores</option>
              <option value="María Salazar">María Salazar</option>
              <option value="Juan Pérez">Juan Pérez</option>
            </select>
          ) : (
            (() => {
              const primaryName = x.gestor || 'Carlos Sandoval';
              const avatarUrl = PERSON_AVATARS[primaryName];
              const initials = primaryName
                .split(' ')
                .map((w: string) => w[0])
                .join('')
                .slice(0, 2)
                .toUpperCase();
              return (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={primaryName}
                      title={primaryName}
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '1.5px solid #ffffff',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                        flexShrink: 0,
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        background: primaryName === 'Lucía Flores' ? '#9333ea' : '#0284c7',
                        color: '#fff',
                        fontSize: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 600,
                        flexShrink: 0,
                      }}
                    >
                      {initials}
                    </span>
                  )}
                  <span className="cell-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {primaryName}
                  </span>
                </div>
              );
            })()
          )}
        </div>
      );
    }

    if (colKey === 'region') {
      return (
        <div
          key="region"
          className="region-cell editable"
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'region');
          }}
        >
          {isEditing(x, 'region') ? (
            <select
              className="cell-editor cell-select"
              autoFocus
              defaultValue={x.region || 'Todas las Regiones'}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                update(x.id, { region: e.target.value });
                closeEdit();
              }}
              onBlur={closeEdit}
            >
              <option value="Todas las Regiones">Todas las Regiones</option>
              <option value="Amazonas">Amazonas</option>
              <option value="Áncash">Áncash</option>
              <option value="Apurímac">Apurímac</option>
              <option value="Arequipa">Arequipa</option>
              <option value="Ayacucho">Ayacucho</option>
              <option value="Cajamarca">Cajamarca</option>
              <option value="Cusco">Cusco</option>
              <option value="Huancavelica">Huancavelica</option>
              <option value="Huánuco">Huánuco</option>
              <option value="Ica">Ica</option>
              <option value="Junín">Junín</option>
              <option value="La Libertad">La Libertad</option>
              <option value="Lambayeque">Lambayeque</option>
              <option value="Lima">Lima</option>
              <option value="Loreto">Loreto</option>
              <option value="Madre de Dios">Madre de Dios</option>
              <option value="Moquegua">Moquegua</option>
              <option value="Pasco">Pasco</option>
              <option value="Piura">Piura</option>
              <option value="Puno">Puno</option>
              <option value="San Martín">San Martín</option>
              <option value="Tacna">Tacna</option>
              <option value="Tumbes">Tumbes</option>
              <option value="Ucayali">Ucayali</option>
            </select>
          ) : (
            <span className="cell-text">{x.region || 'Todas las Regiones'}</span>
          )}
        </div>
      );
    }

    if (colKey === 'sede') {
      const rawVal = x.sede || (isSedeItem(x) ? x.name : undefined);
      const sType = getSedeType(rawVal || x);
      return (
        <div key="sede" className="sede-cell-col" style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {sType === 'dre' ? (
            <Building2 size={13} style={{ color: '#1e40af', flexShrink: 0 }} />
          ) : sType === 'ugel' ? (
            <Building size={13} style={{ color: '#0284c7', flexShrink: 0 }} />
          ) : sType === 'central' ? (
            <Building2 size={13} style={{ color: '#0f172a', flexShrink: 0 }} />
          ) : null}
          <span className="cell-text" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {rawVal || '—'}
          </span>
        </div>
      );
    }

    if (colKey === 'actualEnd') {
      return (
        <div
          key="actualEnd"
          className="actual-end-cell editable"
          onClick={(e) => {
            e.stopPropagation();
            toggleEdit(x, 'actualEnd');
          }}
        >
          {isEditing(x, 'actualEnd') ? (
            <input
              className="cell-editor cell-input date-edit"
              type="date"
              autoFocus
              defaultValue={x.actualEnd || ''}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                update(x.id, { actualEnd: e.target.value || undefined });
                closeEdit();
              }}
              onBlur={closeEdit}
            />
          ) : (
            <span className="cell-text">{x.actualEnd ? formatDate(x.actualEnd) : '—'}</span>
          )}
        </div>
      );
    }

    if (colKey === 'reportType') {
      const isHeaderLevel = !x.parentId || x.wbsNodeType === 'COMPONENTE' || x.wbsNodeType === 'PRODUCTO' || x.kind === 'hito';
      return (
        <div
          key="reportType"
          className="report-type-cell"
          title={isHeaderLevel ? `Formato: ${x.reportType || 'Matriz de entregables'}` : 'Subproceso operativo territorial'}
          onClick={(e) => {
            e.stopPropagation();
            if (isHeaderLevel) {
              openEditorForItem(x);
            }
          }}
        >
          {isHeaderLevel ? (
            <span className="presentation-badge">
              <BarChart3 size={13} />
              <span>{x.reportType || 'Matriz de entregables'}</span>
            </span>
          ) : (
            <small className="subproceso-text">
              Subproceso operativo territorial
            </small>
          )}
        </div>
      );
    }

    if (colKey === 'actions') {
      return (
        <div
          key="actions"
          className="actions-cell-col"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="lista-action-btn"
            title="Ver detalle / Editar ficha"
            aria-label="Ver detalle"
            onClick={(e) => {
              e.stopPropagation();
              openEditorForItem(x);
            }}
            style={{
              width: 30,
              height: 28,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid transparent',
              background: 'transparent',
              borderRadius: 6,
              color: '#64748b',
              cursor: 'pointer',
            }}
          >
            <MoreHorizontal size={16} />
          </button>
        </div>
      );
    }

    // Custom column
    const cCol = customCols.find((c) => c.key === colKey);
    if (!cCol) return <div key={colKey} />;

    const cellVal = (x as any)[cCol.key];
    const isEditingCol = isEditing(x, cCol.key as ColKey);
    const effectiveType = colTypeOverrides[cCol.key] || cCol.type || 'text';

    return (
      <div
        key={cCol.key}
        className="custom-cell-col editable"
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 10px',
          minWidth: 0,
          cursor: 'pointer',
        }}
        onClick={(e) => {
          e.stopPropagation();
          toggleEdit(x, cCol.key as ColKey);
        }}
      >
        {isEditingCol ? (
          effectiveType === 'number' || effectiveType === 'percent' ? (
            <input
              className="cell-editor cell-input num-edit"
              type="number"
              autoFocus
              defaultValue={cellVal ?? ''}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                const val = e.target.value === '' ? undefined : Number(e.target.value);
                update(x.id, { [cCol.key]: val } as any);
                closeEdit();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') closeEdit();
              }}
            />
          ) : effectiveType === 'date' ? (
            <input
              className="cell-editor cell-input date-edit"
              type="date"
              autoFocus
              defaultValue={cellVal || ''}
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => {
                update(x.id, { [cCol.key]: e.target.value || undefined } as any);
                closeEdit();
              }}
              onBlur={closeEdit}
            />
          ) : effectiveType === 'select' ? (
            <div className="cell-editor cell-pop" onClick={(e) => e.stopPropagation()} style={{ padding: 6, minWidth: 120 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', marginBottom: 4 }}>Etiqueta rápida</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                {['Alta', 'Media', 'Baja', 'Urgente', 'Revisión', 'Aprobado'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    style={{ fontSize: 10.5, padding: '2px 6px', borderRadius: 4, border: '1px solid #cbd5e1', background: cellVal === tag ? '#dbeafe' : '#f8fafc', cursor: 'pointer' }}
                    onClick={() => {
                      update(x.id, { [cCol.key]: tag } as any);
                      closeEdit();
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <input
              className="cell-editor cell-input"
              type="text"
              autoFocus
              defaultValue={cellVal || ''}
              onClick={(e) => e.stopPropagation()}
              onBlur={(e) => {
                update(x.id, { [cCol.key]: e.target.value.trim() } as any);
                closeEdit();
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') e.currentTarget.blur();
                if (e.key === 'Escape') closeEdit();
              }}
            />
          )
        ) : effectiveType === 'percent' ? (
          renderProgressVisual(Number(cellVal) || 0, 'blue', cCol.key)
        ) : effectiveType === 'select' ? (
          cellVal ? (
            <span style={{ fontSize: 11.5, fontWeight: 500, background: '#f1f5f9', color: '#1e293b', padding: '2px 8px', borderRadius: 4, border: '1px solid #e2e8f0' }}>
              {cellVal}
            </span>
          ) : (
            <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
          )
        ) : effectiveType === 'date' ? (
          <span style={{ fontSize: 12, color: '#334155' }}>
            {cellVal ? formatDatePE(cellVal) : '—'}
          </span>
        ) : (
          <span style={{ fontSize: 12, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {cellVal !== undefined && cellVal !== '' ? String(cellVal) : '—'}
          </span>
        )}
      </div>
    );
  };

  return (
    <div className={`gantt-v2 perspective-${perspective}`}>
      <div className="app">
        {/* Header Principal */}
        <ProjectShellHeader
          perspective={perspective}
          title={
            perspective === 'equipo'
              ? `Equipo del Proyecto · ${activeProject?.name || 'MINEDU · Dotación 2026'}`
              : perspective === 'territorial'
              ? `Sedes · ${activeProject?.name || 'Gestión del Proyecto'}`
              : `Cronograma Maestro · ${activeProject?.name || 'Gestión del Proyecto'}`
          }
          description={
            perspective === 'equipo'
              ? (activeProject?.moduleDescriptions?.['usuarios'] || 'Padrón operativo y frentes territoriales.')
              : perspective === 'territorial'
              ? (activeProject?.moduleDescriptions?.['sedes'] || activeProject?.descSedes || 'Seguimiento territorial de DRE y UGEL en tiempo real.')
              : (activeProject?.moduleDescriptions?.['cronograma'] || activeProject?.descProyecto || 'Línea de tiempo oficial y calibración de entregables.')
          }
          actions={
            <>
              <button
                className="btn secondary"
                onClick={() => setShowSummaryCards((visible) => !visible)}
                title={showSummaryCards ? 'Ocultar tarjetas superiores' : 'Mostrar tarjetas superiores'}
                aria-label={showSummaryCards ? 'Ocultar tarjetas superiores' : 'Mostrar tarjetas superiores'}
              >
                {showSummaryCards ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button
                className="btn secondary"
                onClick={exportExcelTemplate}
                title="Descargar plantilla de cronograma para completar en Excel"
              >
                <FileSpreadsheet size={15} />
                <span>Plantilla Excel</span>
              </button>
              <button
                className="btn secondary"
                onClick={() => {
                  setImportOpen(true);
                  setPickedFile('');
                }}
              >
                <Upload size={15} />
                <span>Importar Cronograma</span>
                <ChevronDown size={14} />
              </button>
              {perspective === 'territorial' ? (
                <button
                  className="btn primary"
                  onClick={() => setIsSedeNuevaOpen(true)}
                  title="Registrar nueva sede territorial u operativa"
                >
                  <Plus size={16} />
                  <span>Nueva sede</span>
                </button>
              ) : (
                <div className="menu-wrap">
                  <button className="btn primary" onClick={() => setNewMenu((v) => !v)}>
                    <Plus size={16} />
                    <span>Agregar Componente</span>
                    <ChevronDown size={14} />
                  </button>
                  {newMenu && (
                    <div className="menu" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => {
                          setNewMenu(false);
                          add('hito');
                        }}
                      >
                        <Folder size={15} />
                        <span>Nuevo componente principal</span>
                      </button>
                      <button
                        onClick={() => {
                          setNewMenu(false);
                          add('subproceso');
                        }}
                      >
                        <FileText size={15} />
                        <span>Nuevo subcomponente / subproceso</span>
                      </button>
                      {perspective === 'equipo' && (
                        <button
                          onClick={() => {
                            setNewMenu(false);
                            setIsEquipoNuevoOpen(true);
                          }}
                        >
                          <Users size={15} />
                          <span>Nuevo integrante del equipo</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          }
        />

        {/* Tarjetas Métricas Directivas */}
        {showSummaryCards && (
          perspective === 'equipo' ? (
            <section className="metrics">
              <article
                className="metric blue"
                onClick={() => {
                  setEquipoPill('Todos');
                  setEquipoEstadoOpFilter('todos');
                }}
              >
                <span className="metric-icon">
                  <Users size={22} />
                </span>
                <div className="metric-copy">
                  <b>{equipoMetrics.total}</b>
                  <strong>Total Integrantes</strong>
                  <small>padrón del proyecto</small>
                </div>
                <ChartNoAxesColumnIncreasing className="bars" />
              </article>

              <article
                className="metric green"
                onClick={() => {
                  setEquipoPill('En funciones');
                  setEquipoEstadoOpFilter('En funciones');
                }}
              >
                <span className="metric-icon">
                  <UserCheck size={22} />
                </span>
                <div className="metric-copy">
                  <b>{equipoMetrics.activos}</b>
                  <strong>En Funciones</strong>
                  <small>{equipoMetrics.total > 0 ? Math.round((equipoMetrics.activos / equipoMetrics.total) * 100) : 0}% operativos</small>
                </div>
                <ChartNoAxesColumnIncreasing className="bars" />
              </article>

              <article
                className="metric amber"
                onClick={() => {
                  setEquipoPill('Cuentas por activar');
                  setEquipoEstadoCuentaFilter('Invitación Pendiente');
                }}
              >
                <span className="metric-icon">
                  <Clock3 size={22} />
                </span>
                <div className="metric-copy">
                  <b>{equipoMetrics.pendientesCuenta}</b>
                  <strong>Cuentas por Activar</strong>
                  <small>invitación pendiente</small>
                </div>
                <ChartNoAxesColumnIncreasing className="bars" />
              </article>

              <article
                className="metric red"
                onClick={() => {
                  setEquipoPill('Con alerta');
                }}
              >
                <span className="metric-icon">
                  <AlertTriangle size={22} />
                </span>
                <div className="metric-copy">
                  <b>{equipoMetrics.alertasAtrasadas}</b>
                  <strong>Con Alerta</strong>
                  <small>atención requerida</small>
                </div>
                <ChartNoAxesColumnIncreasing className="bars" />
              </article>

              <article className="metric overall">
                <div className="circle-progress" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: '#f1f5f9', border: '3px solid #3b82f6', fontWeight: 700, fontSize: 13, color: '#1e40af' }}>
                  <span>{equipoMetrics.ocupacionPromedio}%</span>
                </div>
                <div className="metric-copy">
                  <strong>Carga Promedio</strong>
                  <small>capacidad del equipo</small>
                </div>
                <ChartNoAxesColumnIncreasing className="bars" />
              </article>
            </section>
          ) : (
            <section className="metrics">
          <article
            className="metric blue"
            onClick={() => {
              setTab('Hitos');
              setWbsLevelFilter('componentes');
            }}
          >
            <span className="metric-icon">
              <CalendarDays size={22} />
            </span>
            <div className="metric-copy">
              <b>{hitos.length}</b>
              <strong>Componentes Principales</strong>
              <small>del proyecto (EDT Nivel 1)</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric green"
            title="Hitos y paquetes de trabajo completados / cumplidos"
            onClick={() => {
              setTab('Completados');
              setWbsLevelFilter('todos');
            }}
          >
            <span className="metric-icon">
              <CheckCircle2 size={22} />
            </span>
            <div className="metric-copy">
              <b>{complete}</b>
              <strong>Completados</strong>
              <small>metas y entregables cumplidos</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric amber"
            onClick={() => {
              setTab('En proceso');
              setWbsLevelFilter('todos');
            }}
          >
            <span className="metric-icon">
              <Clock3 size={22} />
            </span>
            <div className="metric-copy">
              <b>{inprog}</b>
              <strong>En proceso</strong>
              <small>en ejecución activa</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric red"
            onClick={() => {
              setTab('Con retraso');
              setWbsLevelFilter('todos');
            }}
          >
            <span className="metric-icon">
              <AlertTriangle size={22} />
            </span>
            <div className="metric-copy">
              <b>{late}</b>
              <strong>Con retraso</strong>
              <small>atención requerida</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric overall"
            onClick={() => {
              setTab('Todos');
              setWbsLevelFilter('todos');
            }}
          >
            <div className="ring" style={{ '--p': `${overall}%` } as React.CSSProperties}>
              <b>{overall}%</b>
            </div>
            <div>
              <strong>Avance Global</strong>
              <small>según cronograma</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>
        </section>
      ))}

        {/* Workspace Central */}
        <ProjectShellWorkspace
          ref={workspaceRef}
          id="edt-workspace-toolbar"
          isFullscreen={isFullscreen}
          isDocked={isDocked}
        >
          {/* Barra superior de salida en pantalla completa */}
          {isFullscreen && (
            <div className="fullscreen-exit-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                <span>Modo Pantalla Completa — Vista {viewMode === 'gantt' ? 'Gantt' : viewMode === 'lista' ? 'Lista' : viewMode === 'kanban' ? 'Kanban' : viewMode === 'mapa' ? 'Mapa' : 'Calendario'}</span>
              </div>
              <button
                type="button"
                className="fullscreen-exit-btn"
                onClick={toggleFullscreen}
                title="Salir de pantalla completa (o pulsa Esc)"
              >
                <Minimize2 size={13} />
                <span>Salir de pantalla completa (Esc)</span>
              </button>
            </div>
          )}

          {/* Tabs Superiores con Switcher de Modos a la Derecha */}
          <nav className="tabs">
            <div className="tabs-list">
              <button
                type="button"
                className={tab === 'Todos' && wbsDepthFilter === 'todos' && wbsRoleFilter === 'todos' && wbsLevelFilter === 'todos' && vencimientosFilter === 'todos' && selectedStates.length === 0 ? 'active' : ''}
                onClick={() => {
                  setTab('Todos');
                  setSelectedStates([]);
                  setWbsDepthFilter('todos');
                  setWbsRoleFilter('todos');
                  setWbsLevelFilter('todos');
                  setVencimientosFilter('todos');
                  closeMenus();
                }}
              >
                Todos <span>({perspective === 'territorial' ? countTerritorial : items.length})</span>
              </button>

              {/* Filtro Universal 1: Estructura WBS (Doble Sección: Profundidad y Rol PM4R / BID) */}
              <div className="filter-dropdown-wrap wbs-filter-wrap tabs-filter-wrap">
                <button
                  type="button"
                  className={`filter-card-btn wbs-card-btn ${activeMenu === 'wbsLevel' ? 'active' : ''} ${
                    wbsDepthFilter !== 'todos' || wbsRoleFilter !== 'todos' || wbsLevelFilter !== 'todos' ? 'filtered' : ''
                  }`}
                  onClick={() => toggleMenu('wbsLevel')}
                  title="Filtrar por estructura WBS (profundidad jerárquica y rol metodológico PM4R)"
                >
                  <div className="filter-card-copy">
                    <small>Nivel</small>
                    <span>
                      {(() => {
                        const depthLabels: Record<string, string> = {
                          todos: 'Todos los niveles',
                          0: 'Nivel 1',
                          1: 'Nivel 2',
                          2: 'Nivel 3',
                          3: 'Nivel 4',
                          4: 'Nivel 5',
                        };
                        const roleLabels: Record<string, string> = {
                          todos: 'Todos los roles',
                          componentes: 'Componentes',
                          productos: 'Productos / Entregables',
                          paquetes: 'Paquetes de trabajo',
                        };

                        const dStr = depthLabels[String(wbsDepthFilter)];
                        const rStr = roleLabels[wbsRoleFilter];

                        if (wbsDepthFilter === 'todos' && wbsRoleFilter === 'todos') {
                          return `Todos los niveles (${perspective === 'territorial' ? countTerritorial : items.length})`;
                        }
                        if (wbsDepthFilter !== 'todos' && wbsRoleFilter === 'todos') {
                          return dStr;
                        }
                        if (wbsDepthFilter === 'todos' && wbsRoleFilter !== 'todos') {
                          return rStr;
                        }
                        return `${dStr} · ${rStr}`;
                      })()}
                    </span>
                  </div>
                  <ChevronDown size={14} className="filter-chevron" />
                </button>
                {activeMenu === 'wbsLevel' && (
                  <div
                    className="filter-card-popover phase-filter-popover"
                    onClick={(e) => e.stopPropagation()}
                    onWheel={(e) => {
                      e.stopPropagation();
                      const list = e.currentTarget.querySelector('.filter-popover-list') as HTMLElement | null;
                      if (list && e.target !== list && !list.contains(e.target as Node)) {
                        list.scrollTop += e.deltaY;
                      }
                    }}
                    style={{ minWidth: 320, maxWidth: 380 }}
                  >
                    {/* Cabecera general */}
                    <div className="filter-popover-title filter-popover-title-row">
                      <span>Estructura WBS</span>
                      {(wbsDepthFilter !== 'todos' || wbsRoleFilter !== 'todos' || wbsLevelFilter !== 'todos') && (
                        <button
                          type="button"
                          className="filter-reset-link"
                          onClick={() => {
                            setWbsDepthFilter('todos');
                            setWbsRoleFilter('todos');
                            setWbsLevelFilter('todos');
                          }}
                        >
                          Restablecer
                        </button>
                      )}
                    </div>

                    {/* SECCIÓN 1: PROFUNDIDAD JERÁRQUICA (DINÁMICA SEGÚN NIVELES REALES) */}
                    <div className="filter-popover-title filter-popover-subtitle">
                      <span>Profundidad jerárquica</span>
                    </div>
                    <div className="filter-popover-list">
                      {/* Todos los niveles */}
                      <button
                        type="button"
                        className={`filter-item-btn filter-item-check ${wbsDepthFilter === 'todos' ? 'selected' : ''}`}
                        onClick={() => {
                          setWbsDepthFilter('todos');
                          setWbsLevelFilter('todos');
                        }}
                      >
                        <span className="filter-item-main">
                          <span className={`filter-radio ${wbsDepthFilter === 'todos' ? 'checked' : ''}`}>
                            {wbsDepthFilter === 'todos' && <span className="filter-radio-dot" />}
                          </span>
                          <span className="filter-item-text">
                            <strong>Todos los niveles</strong>
                          </span>
                        </span>
                        <span className="wbs-level-badge">{perspective === 'territorial' ? countTerritorial : items.length}</span>
                      </button>

                      {/* Niveles dinámicos 1..n existentes en el proyecto (no se renderizan si el conteo es 0) */}
                      {Array.from({ length: maxProjectDepth + 1 }, (_, idx) => idx).map((depthIdx) => {
                        const count = dynamicLevelCounts[depthIdx] || 0;
                        if (count === 0) return null;
                        const isSelected = wbsDepthFilter === depthIdx;
                        return (
                          <button
                            key={depthIdx}
                            type="button"
                            className={`filter-item-btn filter-item-check ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setWbsDepthFilter(depthIdx);
                              setWbsLevelFilter('todos');
                            }}
                          >
                            <span className="filter-item-main">
                              <span className={`filter-radio ${isSelected ? 'checked' : ''}`}>
                                {isSelected && <span className="filter-radio-dot" />}
                              </span>
                              <span className="filter-item-text">
                                <strong>Nivel {depthIdx + 1}</strong>
                              </span>
                            </span>
                            <span className="wbs-level-badge">{count}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* SECCIÓN 2: ROL METODOLÓGICO (PM4R / BID) */}
                    <div className="filter-popover-title filter-popover-subtitle">
                      <span>Rol metodológico</span>
                    </div>
                    <div className="filter-popover-list">
                      {[
                        { id: 'todos', label: 'Todos los roles', count: items.length },
                        { id: 'componentes', label: 'Componentes', count: rolesCounts.componentes },
                        { id: 'productos', label: 'Productos / Entregables', count: rolesCounts.productos },
                        { id: 'paquetes', label: 'Paquetes de trabajo', count: rolesCounts.paquetes },
                      ].map((role) => {
                        const isSelected = wbsRoleFilter === role.id && wbsLevelFilter === 'todos';
                        return (
                          <button
                            key={role.id}
                            type="button"
                            className={`filter-item-btn filter-item-check ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setWbsRoleFilter(role.id as any);
                              setWbsLevelFilter('todos');
                            }}
                          >
                            <span className="filter-item-main">
                              <span className={`filter-radio ${isSelected ? 'checked' : ''}`}>
                                {isSelected && <span className="filter-radio-dot" />}
                              </span>
                              <span className="filter-item-text">
                                <strong>{role.label}</strong>
                              </span>
                            </span>
                            <span className="wbs-level-badge">{role.count}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Filtro Universal 2: Estado de avance (Multiselección) + plazos de vencimiento */}
              <div className="filter-dropdown-wrap estado-filter-wrap tabs-filter-wrap">
                <button
                  type="button"
                  className={`filter-card-btn estado-card-btn ${activeMenu === 'state' ? 'active' : ''} ${
                    selectedStates.length > 0 || vencimientosFilter !== 'todos' ? 'filtered' : ''
                  }`}
                  onClick={() => toggleMenu('state')}
                  title="Filtrar por estado de avance y plazos de vencimiento"
                >
                  <div className="filter-card-copy">
                    <small>Estado</small>
                    <span>
                      {(() => {
                        const vencLabels: Record<string, string> = {
                          hoy: 'Vencen hoy',
                          semana: 'Vencen esta semana',
                          mes: 'Vencen este mes',
                          trimestre: 'Vencen este trimestre',
                          retraso: 'Retraso crítico',
                        };
                        const venc = vencLabels[vencimientosFilter];
                        if (selectedStates.length === 0) {
                          return venc || 'Todos los estados';
                        }
                        if (selectedStates.length === 1) {
                          return venc ? `${selectedStates[0]} · ${venc}` : selectedStates[0];
                        }
                        const multiStr = `${selectedStates.length} seleccionados`;
                        return venc ? `${multiStr} · ${venc}` : multiStr;
                      })()}
                    </span>
                  </div>
                  <ChevronDown size={14} className="filter-chevron" />
                </button>
                {activeMenu === 'state' && (
                  <div
                    className="filter-card-popover"
                    onClick={(e) => e.stopPropagation()}
                    onWheel={(e) => {
                      e.stopPropagation();
                      const list = e.currentTarget.querySelector('.filter-popover-list') as HTMLElement | null;
                      if (list && e.target !== list && !list.contains(e.target as Node)) {
                        list.scrollTop += e.deltaY;
                      }
                    }}
                    style={{ minWidth: 300 }}
                  >
                    <div className="filter-popover-title filter-popover-title-row">
                      <span>Estado de avance</span>
                      {(selectedStates.length > 0 || vencimientosFilter !== 'todos') && (
                        <button
                          type="button"
                          className="filter-reset-link"
                          onClick={() => {
                            setSelectedStates([]);
                            setTab('Todos');
                            setVencimientosFilter('todos');
                          }}
                        >
                          Restablecer
                        </button>
                      )}
                    </div>
                    <div className="filter-popover-list">
                      {/* Opción Todos los estados: limpia la multiselección */}
                      <button
                        type="button"
                        className={`filter-item-btn filter-item-check ${selectedStates.length === 0 ? 'selected' : ''}`}
                        onClick={() => {
                          setSelectedStates([]);
                          setTab('Todos');
                        }}
                      >
                        <span className="filter-item-main">
                          <span className={`filter-radio ${selectedStates.length === 0 ? 'checked' : ''}`}>
                            {selectedStates.length === 0 && <span className="filter-radio-dot" />}
                          </span>
                          <span className="filter-item-text">
                            <strong>Todos los estados</strong>
                          </span>
                        </span>
                        <span className="wbs-level-badge">{items.length}</span>
                      </button>

                      {/* Estados con multiselección via Checkbox */}
                      {[
                        { id: 'Completados', label: 'Completados', count: complete, dotColor: '#16a34a', badgeClass: 'badge-cumple' },
                        { id: 'En proceso', label: 'En proceso', count: inprog, dotColor: '#0284c7', badgeClass: 'badge-enproceso' },
                        { id: 'Con retraso', label: 'Con retraso', count: late, dotColor: '#dc2626', badgeClass: 'badge-retraso' },
                        { id: 'Pendiente', label: 'Pendientes', count: items.filter((x) => x.status === 'Pendiente').length, dotColor: '#94a3b8', badgeClass: 'badge-pendiente' },
                      ].map((opt) => {
                        const isChecked = selectedStates.includes(opt.id);
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            className={`filter-item-btn filter-item-check ${isChecked ? 'selected' : ''}`}
                            onClick={() => toggleState(opt.id)}
                            aria-pressed={isChecked}
                          >
                            <span className="filter-item-main">
                              <span className={`filter-checkbox ${isChecked ? 'checked' : ''}`}>
                                {isChecked && <Check size={10} strokeWidth={3} />}
                              </span>
                              <span className="filter-status-dot" style={{ background: opt.dotColor }} />
                              <span className="filter-item-text">
                                <strong>{opt.label}</strong>
                              </span>
                            </span>
                            <span className={`wbs-level-badge ${opt.badgeClass}`}>{opt.count}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div className="filter-popover-title filter-popover-subtitle">
                      <span>Plazos de vencimiento</span>
                    </div>
                    <div className="filter-popover-list">
                      {[
                        { id: 'todos', label: 'Todos los plazos', badge: items.length, icon: CalendarDays },
                        { id: 'hoy', label: 'Vencen hoy', badge: vencenHoyCount, icon: Clock, alert: vencenHoyCount > 0 },
                        { id: 'semana', label: 'Vencen esta semana', badge: vencenSemanaCount, icon: Clock3, alert: vencenSemanaCount > 0 },
                        { id: 'mes', label: 'Vencen este mes', badge: vencenMesCount, icon: CalendarRange, alert: false },
                        { id: 'trimestre', label: 'Vencen este trimestre', badge: vencenTrimestreCount, icon: CalendarRange, alert: false },
                        { id: 'retraso', label: 'Con retraso crítico', badge: criticalItemsCount, icon: AlertTriangle, alert: criticalItemsCount > 0 },
                      ].map((opt) => {
                        const isSelected = vencimientosFilter === opt.id;
                        const IconComponent = opt.icon;
                        return (
                          <button
                            key={opt.id}
                            type="button"
                            className={`filter-item-btn filter-item-check ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setVencimientosFilter(opt.id as any);
                            }}
                          >
                            <span className="filter-item-main">
                              <span className={`filter-radio ${isSelected ? 'checked' : ''}`}>
                                {isSelected && <span className="filter-radio-dot" />}
                              </span>
                              <IconComponent size={14} className={opt.alert ? 'filter-icon-alert' : 'filter-icon-muted'} />
                              <span className="filter-item-text">
                                <strong style={opt.alert ? { color: '#b91c1c' } : undefined}>{opt.label}</strong>
                              </span>
                            </span>
                            <span className={`wbs-level-badge ${opt.alert ? 'is-late' : ''}`}>{opt.badge}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Filtro Contextual 3 (Caja Roja): Componente / Producto EDT */}
              <div className="filter-dropdown-wrap contextual-filter-wrap edt-filter-wrap">
                <button
                  type="button"
                  className={`filter-card-btn ${activeMenu === 'edtComponent' ? 'active' : ''} ${
                    selectedEdtCodes.length > 0 ? 'filtered' : ''
                  }`}
                  onClick={() => toggleMenu('edtComponent')}
                  title="Filtrar por Componente o Producto EDT"
                >
                  <div className="filter-card-copy">
                    <small>Componente / Producto</small>
                    <span>{edtButtonText}</span>
                  </div>
                  <ChevronDown size={14} className="filter-chevron" />
                </button>
                {activeMenu === 'edtComponent' && (
                  <div
                    className="filter-card-popover"
                    onClick={(e) => e.stopPropagation()}
                    onWheel={(e) => {
                      e.stopPropagation();
                      const list = e.currentTarget.querySelector('.filter-popover-list') as HTMLElement | null;
                      if (list && e.target !== list && !list.contains(e.target as Node)) {
                        list.scrollTop += e.deltaY;
                      }
                    }}
                    style={{ minWidth: 320 }}
                  >
                    <div className="filter-popover-title filter-popover-title-row">
                      <span>Componentes y Productos EDT</span>
                      {selectedEdtCodes.length > 0 && (
                        <button
                          type="button"
                          className="filter-reset-link"
                          onClick={() => setSelectedEdtCodes([])}
                        >
                          Restablecer
                        </button>
                      )}
                    </div>
                    <div className="filter-popover-list" style={{ maxHeight: 380 }}>
                      {/* Opción Todos */}
                      {(() => {
                        const isAll = selectedEdtCodes.length === 0;
                        return (
                          <button
                            type="button"
                            className={`filter-item-btn filter-item-check ${isAll ? 'selected' : ''}`}
                            onClick={() => setSelectedEdtCodes([])}
                          >
                            <span className="filter-item-main">
                              <span className={`filter-radio ${isAll ? 'checked' : ''}`}>
                                {isAll && <span className="filter-radio-dot" />}
                              </span>
                              <span className="filter-item-text">
                                <strong>Todos los componentes</strong>
                              </span>
                            </span>
                            <span className="wbs-level-badge">{items.length}</span>
                          </button>
                        );
                      })()}

                      {/* Grupos de Componentes y sus Productos */}
                      {edtComponentsWithProducts.map(({ comp, products }) => {
                        const isCompChecked = selectedEdtCodes.includes(comp.id) || selectedEdtCodes.includes(comp.code);
                        const compTotalItems = items.filter((x) => x.id === comp.id || x.parentId === comp.id || items.some(p => p.id === x.parentId && p.parentId === comp.id)).length;
                        return (
                          <React.Fragment key={comp.id}>
                            <div
                              className="filter-popover-group-label"
                              style={{
                                marginTop: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                background: 'rgba(37, 99, 235, 0.05)',
                                padding: '5px 8px',
                                borderRadius: 4,
                              }}
                            >
                              <button
                                type="button"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  textAlign: 'left',
                                  font: 'inherit',
                                  color: 'inherit',
                                  flex: 1,
                                }}
                                onClick={() => {
                                  setSelectedEdtCodes((prev) =>
                                    prev.includes(comp.id) ? prev.filter((c) => c !== comp.id) : [...prev, comp.id]
                                  );
                                }}
                              >
                                <span className={`filter-checkbox ${isCompChecked ? 'checked' : ''}`}>
                                  {isCompChecked && <Check size={10} strokeWidth={3} />}
                                </span>
                                <strong style={{ fontSize: 11, color: '#0f172a' }}>
                                  {comp.code} {comp.name}
                                </strong>
                              </button>
                              <span className="wbs-level-badge">{compTotalItems}</span>
                            </div>

                            {products.map((prod) => {
                              const isProdChecked = selectedEdtCodes.includes(prod.id) || selectedEdtCodes.includes(prod.code);
                              const prodSedesCount = items.filter((x) => x.parentId === prod.id).length;
                              return (
                                <button
                                  key={prod.id}
                                  type="button"
                                  className={`filter-item-btn filter-item-check ${isProdChecked ? 'selected' : ''}`}
                                  style={{ paddingLeft: 18 }}
                                  onClick={() => {
                                    setSelectedEdtCodes((prev) =>
                                      prev.includes(prod.id) ? prev.filter((c) => c !== prod.id) : [...prev, prod.id]
                                    );
                                  }}
                                >
                                  <span className="filter-item-main">
                                    <span className={`filter-checkbox ${isProdChecked ? 'checked' : ''}`}>
                                      {isProdChecked && <Check size={10} strokeWidth={3} />}
                                    </span>
                                    <span className="filter-item-text">
                                      <strong>{prod.code ? `${prod.code} ` : ''}{prod.name}</strong>
                                    </span>
                                  </span>
                                  {prodSedesCount > 0 && <span className="wbs-level-badge">{prodSedesCount}</span>}
                                </button>
                              );
                            })}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="view-mode-switcher" role="tablist" aria-label="Modo de presentación">
              {perspective === 'equipo' ? (
                <>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'lista' || viewMode === 'directorio' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('lista')}
                    title="Lista y Cronograma Oficial"
                  >
                    <List size={14} />
                    <span>Lista</span>
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'organigrama' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('organigrama')}
                    title="Organigrama Estructural (Respaldo)"
                  >
                    <GitBranch size={14} />
                    <span>Organigrama</span>
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'organigrama-flow' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('organigrama-flow')}
                    title="Organigrama Interactivo (React Flow + Dagre)"
                  >
                    <Network size={14} />
                    <span>Organigrama Flow</span>
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'sedes' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('sedes')}
                    title="Frentes Territoriales y Sedes"
                  >
                    <Building2 size={14} />
                    <span>Frentes Territoriales</span>
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'carga' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('carga')}
                    title="Carga de Trabajo Operativa"
                  >
                    <Activity size={14} />
                    <span>Carga de Trabajo</span>
                  </button>
                </>
              ) : (
                <>
                  {perspective === 'territorial' && (
                    <button
                      type="button"
                      className={`view-mode-btn view-mode-btn-portada ${viewMode === 'portada' ? 'active' : ''}`}
                      onClick={() => handleViewModeChange('portada')}
                      title="Vista Carátula Territorial y Cobertura"
                    >
                      <CheckSquare size={14} />
                      <span>Carátula</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'gantt' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('gantt')}
                    title="Vista Cronograma Gantt"
                  >
                    <FolderKanban size={14} />
                    <span>Gantt</span>
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'lista' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('lista')}
                    title="Vista Tabla Analítica"
                  >
                    <List size={14} />
                    <span>Lista</span>
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('kanban')}
                    title="Vista Tablero Kanban"
                  >
                    <LayoutDashboard size={14} />
                    <span>Kanban</span>
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'calendario' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('calendario')}
                    title="Vista Calendario Mensual"
                  >
                    <CalendarDays size={14} />
                    <span>Calendario</span>
                  </button>
                  <button
                    type="button"
                    className={`view-mode-btn ${viewMode === 'mapa' ? 'active' : ''}`}
                    onClick={() => handleViewModeChange('mapa')}
                    title="Vista Mapa Territorial"
                  >
                    <MapPin size={14} />
                    <span>Mapa</span>
                  </button>
                </>
              )}
            </div>
          </nav>

          {/* Filtros Contextuales y Macro */}
          <ProjectShellFilters>
            {/* Filtro Contextual 1 (Vista Proyecto): Región / DRE */}
            <div className="filter-dropdown-wrap contextual-filter-wrap region-filter-wrap">
              <button
                type="button"
                className={`filter-card-btn ${activeMenu === 'region' ? 'active' : ''} ${
                  selectedRegions.length > 0 ? 'filtered' : ''
                }`}
                onClick={() => toggleMenu('region')}
                title="Filtrar por región (DRE) del proyecto"
              >
                <div className="filter-card-copy">
                  <small>Región</small>
                  <span>{selectedRegions.length === 0 ? 'Todas las regiones' : regionButtonText}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>
              {activeMenu === 'region' && (
                <div
                  className="filter-card-popover"
                  onClick={(e) => e.stopPropagation()}
                  onWheel={(e) => {
                    e.stopPropagation();
                    const list = e.currentTarget.querySelector('.filter-popover-list') as HTMLElement | null;
                    if (list && e.target !== list && !list.contains(e.target as Node)) {
                      list.scrollTop += e.deltaY;
                    }
                  }}
                  style={{ minWidth: 270 }}
                >
                  <div className="filter-popover-title filter-popover-title-row">
                    <span>Regiones y sedes del catálogo</span>
                    {selectedRegions.length > 0 && (
                      <button type="button" className="filter-reset-link" onClick={() => setSelectedRegions([])}>
                        Limpiar ({selectedRegions.length})
                      </button>
                    )}
                  </div>
                  <div className="filter-popover-list" style={{ maxHeight: 320 }}>
                    <button
                      type="button"
                      className={`filter-item-btn ${selectedRegions.length === 0 ? 'selected' : ''}`}
                      onClick={() => setSelectedRegions([])}
                    >
                      <span className="filter-item-text">
                        <strong>Todas las regiones</strong>
                        <small>{MACROREGIONES_NACIONAL.length} macro-regiones · {unidades.length} sedes</small>
                      </span>
                      <span className="wbs-level-badge">{unidades.length}</span>
                    </button>
                    {MACROREGIONES_NACIONAL.map((macro) => {
                      const todasMacro = macro.regiones.every((r) => selectedRegions.includes(r));
                      return (
                        <React.Fragment key={macro.id}>
                          <div className="filter-popover-group-label macro-group-row">
                            <span>{macro.name}</span>
                            <button
                              type="button"
                              className={`filter-reset-link ${todasMacro ? 'macro-all-active' : ''}`}
                              onClick={() => toggleMacroRegions(macro.regiones)}
                              aria-pressed={todasMacro}
                              title={
                                todasMacro
                                  ? `Quitar las ${macro.regiones.length} regiones de esta macro`
                                  : `Seleccionar las ${macro.regiones.length} regiones de esta macro`
                              }
                            >
                              {todasMacro ? `Quitar (${macro.regiones.length})` : `Todas (${macro.regiones.length})`}
                            </button>
                          </div>
                        {macro.regiones.map((regName) => {
                          const isChecked = selectedRegions.includes(regName);
                          const coordinador = getRegionCoordinador(regName);
                          return (
                            <button
                              key={regName}
                              type="button"
                              className={`filter-item-btn filter-item-check ${isChecked ? 'selected' : ''}`}
                              onClick={() => toggleRegion(regName)}
                              aria-pressed={isChecked}
                            >
                              <span className="filter-item-main">
                                <span className={`filter-checkbox ${isChecked ? 'checked' : ''}`}>
                                  {isChecked && <Check size={10} strokeWidth={3} />}
                                </span>
                                <span className="filter-item-text">
                                  <strong>{regName}</strong>
                                  <small>
                                    {sedesPorRegion.get(normalizeRegionKey(regName)) || 0} sedes
                                    {coordinador ? ` · Coord. regional: ${coordinador}` : ''}
                                  </small>
                                </span>
                              </span>
                              {(regionItemCounts[regName] || 0) > 0 && (
                                <span className="wbs-level-badge">{regionItemCounts[regName]}</span>
                              )}
                            </button>
                          );
                        })}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}
            </div>

            {/* Filtro Contextual 2 (Vista Territorial): Sede Territorial / UGEL o Gestor de Campo */}
            {perspective === 'territorial' ? (
              <div className="filter-dropdown-wrap contextual-filter-wrap sede-filter-wrap">
                <button
                  type="button"
                  className={`filter-card-btn ${activeMenu === 'sede' ? 'active' : ''} ${
                    selectedSedes.length > 0 || gestorFilter !== 'Todos' ? 'filtered' : ''
                  }`}
                  onClick={() => toggleMenu('sede')}
                  title="Filtrar por Sede Territorial / UGEL o Gestor de Campo"
                >
                  <div className="filter-card-copy">
                    <small>Sede / UGEL</small>
                    <span>{sedeButtonText}</span>
                  </div>
                  <ChevronDown size={14} className="filter-chevron" />
                </button>
                {activeMenu === 'sede' && (
                  <div
                    className="filter-card-popover"
                    onClick={(e) => e.stopPropagation()}
                    onWheel={(e) => {
                      e.stopPropagation();
                      const list = e.currentTarget.querySelector('.filter-popover-list') as HTMLElement | null;
                      if (list && e.target !== list && !list.contains(e.target as Node)) {
                        list.scrollTop += e.deltaY;
                      }
                    }}
                    style={{ minWidth: 310 }}
                  >
                    <div className="filter-popover-title filter-popover-title-row">
                      <span>Sedes y Gestores de Campo</span>
                      {(selectedSedes.length > 0 || gestorFilter !== 'Todos') && (
                        <button
                          type="button"
                          className="filter-reset-link"
                          onClick={() => {
                            setSelectedSedes([]);
                            setGestorFilter('Todos');
                          }}
                        >
                          Restablecer
                        </button>
                      )}
                    </div>
                    <div className="filter-popover-list" style={{ maxHeight: 360 }}>
                      {/* Sección 1: Sedes / UGEL */}
                      <div className="filter-popover-group-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Sedes / UGEL Operativas</span>
                        <span className="wbs-level-badge">{availableSedesCascaded.length}</span>
                      </div>
                      {(() => {
                        const isAllSedes = selectedSedes.length === 0;
                        return (
                          <button
                            type="button"
                            className={`filter-item-btn filter-item-check ${isAllSedes ? 'selected' : ''}`}
                            onClick={() => setSelectedSedes([])}
                          >
                            <span className="filter-item-main">
                              <span className={`filter-radio ${isAllSedes ? 'checked' : ''}`}>
                                {isAllSedes && <span className="filter-radio-dot" />}
                              </span>
                              <span className="filter-item-text">
                                <strong>Todas las sedes</strong>
                              </span>
                            </span>
                            <span className="wbs-level-badge">{items.length}</span>
                          </button>
                        );
                      })()}
                      {sedesAgrupadas.length > 1
                        ? sedesAgrupadas.map((grupo) => (
                            <React.Fragment key={grupo.region}>
                              <div className="filter-popover-group-label">{grupo.region}</div>
                              {grupo.sedes.map((sede) => {
                                const isChecked = selectedSedes.includes(sede);
                                const sLower = sede.toLowerCase().trim();
                                const count = items.filter((it) => {
                                  const itS = (it.sede || '').toLowerCase().trim();
                                  const itD = (it.distrito || '').toLowerCase().trim();
                                  const itN = (it.name || '').toLowerCase().trim();
                                  return (
                                    (itS && (itS.includes(sLower) || sLower.includes(itS))) ||
                                    (itD && (itD.includes(sLower) || sLower.includes(itD))) ||
                                    (itN && (itN.includes(sLower) || sLower.includes(itN)))
                                  );
                                }).length;
                                return (
                                  <button
                                    key={sede}
                                    type="button"
                                    className={`filter-item-btn filter-item-check ${isChecked ? 'selected' : ''}`}
                                    onClick={() => {
                                      setSelectedSedes((prev) =>
                                        prev.includes(sede)
                                          ? prev.filter((s) => s !== sede)
                                          : [...prev, sede]
                                      );
                                    }}
                                  >
                                    <span className="filter-item-main">
                                      <span className={`filter-checkbox ${isChecked ? 'checked' : ''}`}>
                                        {isChecked && <Check size={10} strokeWidth={3} />}
                                      </span>
                                      <span className="filter-item-text">
                                        <strong>{sede}</strong>
                                      </span>
                                    </span>
                                    {count > 0 && <span className="wbs-level-badge">{count}</span>}
                                  </button>
                                );
                              })}
                            </React.Fragment>
                          ))
                        : availableSedesCascaded.map((sede) => {
                            const isChecked = selectedSedes.includes(sede);
                            const sLower = sede.toLowerCase().trim();
                            const count = items.filter((it) => {
                              const itS = (it.sede || '').toLowerCase().trim();
                              const itD = (it.distrito || '').toLowerCase().trim();
                              const itN = (it.name || '').toLowerCase().trim();
                              return (
                                (itS && (itS.includes(sLower) || sLower.includes(itS))) ||
                                (itD && (itD.includes(sLower) || sLower.includes(itD))) ||
                                (itN && (itN.includes(sLower) || sLower.includes(itN)))
                              );
                            }).length;
                            return (
                              <button
                                key={sede}
                                type="button"
                                className={`filter-item-btn filter-item-check ${isChecked ? 'selected' : ''}`}
                                onClick={() => {
                                  setSelectedSedes((prev) =>
                                    prev.includes(sede)
                                      ? prev.filter((s) => s !== sede)
                                      : [...prev, sede]
                                  );
                                }}
                              >
                                <span className="filter-item-main">
                                  <span className={`filter-checkbox ${isChecked ? 'checked' : ''}`}>
                                    {isChecked && <Check size={10} strokeWidth={3} />}
                                  </span>
                                  <span className="filter-item-text">
                                    <strong>{sede}</strong>
                                  </span>
                                </span>
                                {count > 0 && <span className="wbs-level-badge">{count}</span>}
                              </button>
                            );
                          })}

                      {/* Sección 2: Gestores de Campo Asignados */}
                      <div className="filter-popover-group-label" style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Gestor de Campo Asignado</span>
                        <span className="wbs-level-badge">{availableGestoresCascaded.length}</span>
                      </div>
                      <button
                        type="button"
                        className={`filter-item-btn filter-item-check ${gestorFilter === 'Todos' ? 'selected' : ''}`}
                        onClick={() => {
                          setGestorFilter('Todos');
                          closeMenus();
                        }}
                      >
                        <span className="filter-item-main">
                          <span className={`filter-radio ${gestorFilter === 'Todos' ? 'checked' : ''}`}>
                            {gestorFilter === 'Todos' && <span className="filter-radio-dot" />}
                          </span>
                          <span className="filter-item-text">
                            <strong>Todos los gestores</strong>
                            <small>Sin filtro de responsable</small>
                          </span>
                        </span>
                      </button>
                      {availableGestoresCascaded.map((gName) => {
                        const isSelected = gestorFilter === gName;
                        const count = items.filter((it) => getItemGestores(it).includes(gName)).length;
                        return (
                          <button
                            key={gName}
                            type="button"
                            className={`filter-item-btn filter-item-check ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setGestorFilter(gName);
                              closeMenus();
                            }}
                          >
                            <span className="filter-item-main">
                              <span className={`filter-radio ${isSelected ? 'checked' : ''}`}>
                                {isSelected && <span className="filter-radio-dot" />}
                              </span>
                              <span className="filter-avatar macro-avatar">{getGestorInitials(gName)}</span>
                              <span className="filter-item-text">
                                <strong>{gName}</strong>
                                <small>{getPersonInstitutionalRole(gName)}</small>
                              </span>
                            </span>
                            {count > 0 && <span className="wbs-level-badge">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="filter-dropdown-wrap contextual-filter-wrap phase-filter-wrap">
                <button
                  type="button"
                  className={`filter-card-btn ${activeMenu === 'phase' ? 'active' : ''} ${
                    phaseFilter !== 'Todas' ? 'filtered' : ''
                  }`}
                  onClick={() => toggleMenu('phase')}
                  title="Filtrar por Fase del Proyecto (PMBOK / Metodología de Dotación)"
                >
                  <div className="filter-card-copy">
                    <small>Fase</small>
                    <span title={selectedPhaseLabel}>{selectedPhaseLabel}</span>
                  </div>
                  <ChevronDown size={14} className="filter-chevron" />
                </button>
                {activeMenu === 'phase' && (
                  <div
                    className="filter-card-popover phase-filter-popover"
                    onClick={(e) => e.stopPropagation()}
                    onWheel={(e) => {
                      e.stopPropagation();
                      const list = e.currentTarget.querySelector('.filter-popover-list') as HTMLElement | null;
                      if (list && e.target !== list && !list.contains(e.target as Node)) {
                        list.scrollTop += e.deltaY;
                      }
                    }}
                    style={{ minWidth: 320, maxWidth: 380 }}
                  >
                    <div className="filter-popover-title filter-popover-title-row">
                      <span>Fases del Proyecto</span>
                      {phaseFilter !== 'Todas' && (
                        <button type="button" className="filter-reset-link" onClick={() => setPhaseFilter('Todas')}>
                          Restablecer
                        </button>
                      )}
                    </div>
                    <div className="filter-popover-list">
                      <button
                        type="button"
                        className={`filter-item-btn ${phaseFilter === 'Todas' ? 'selected' : ''}`}
                        onClick={() => {
                          setPhaseFilter('Todas');
                          closeMenus();
                        }}
                      >
                        <span className="filter-item-text">
                          <strong>Todas las fases</strong>
                          <small>Ciclo de vida completo del proyecto</small>
                        </span>
                        <span className="wbs-level-badge">{items.length}</span>
                      </button>
                      {PROJECT_PHASES_CATALOG.map((fase) => {
                        const isSelected = phaseFilter === fase.id || phaseFilter === fase.name;
                        const count = getPhaseItemCount(fase.id);
                        return (
                          <button
                            key={fase.id}
                            type="button"
                            className={`filter-item-btn filter-item-check ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setPhaseFilter(fase.id);
                              closeMenus();
                            }}
                          >
                            <span className="filter-item-main">
                              <span className={`filter-radio ${isSelected ? 'checked' : ''}`}>
                                {isSelected && <span className="filter-radio-dot" />}
                              </span>
                              <span className="filter-item-text">
                                <strong>{fase.code} · {fase.name}</strong>
                                <small>{fase.description}</small>
                              </span>
                            </span>
                            {count > 0 && <span className="wbs-level-badge">{count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Filtro Avanzado Compacto (Zona 1: Filtros de datos) */}
            <button
              type="button"
              className={`btn secondary custom-filter-trigger-btn qm-btn-icon ${advancedFiltersOpen || customRules.length > 0 ? "active" : ""}`}
              onClick={() => setAdvancedFiltersOpen((v) => !v)}
              data-tooltip="Filtros avanzados"
              aria-label="Condiciones de filtrado avanzado"
            >
              <SlidersHorizontal size={15} />
              {customRules.length > 0 && (
                <span className="custom-filter-counter-badge">{customRules.length}</span>
              )}
            </button>

            {/* Separador vertical: Bloque 2 (Datos del proyecto) | Bloque 3 (Navegación temporal / corte) */}
            <div className="filter-group-divider" aria-hidden="true" />

            {/* Bloque 3: Navegación temporal y selector de escala para todas las vistas */}
            {viewMode === 'mapa' ? (
              /* En Modo Mapa: Conmutador Oficial de Sub-Vistas Territoriales (Geográfico, Temático Poligonal, Analítica Power BI) */
              <div className="zoom map-subview-switcher" title="Modo de representación del mapa territorial">
                <button
                  type="button"
                  className={mapSubView === 'geo-real' ? 'active' : ''}
                  onClick={() => setMapSubView('geo-real')}
                  title="Vista 1: Mapa Geográfico Satelital Interactivo con Pines"
                >
                  <MapPin size={13} style={{ marginRight: 4 }} />
                  Geográfico
                </button>
                <button
                  type="button"
                  className={mapSubView === 'tematico-regional' ? 'active' : ''}
                  onClick={() => setMapSubView('tematico-regional')}
                  title="Vista 2: Mapa Regional Temático por Provincias y Fases (HubPro)"
                >
                  <Layers size={13} style={{ marginRight: 4 }} />
                  Temático Poligonal
                </button>
                <button
                  type="button"
                  className={mapSubView === 'powerbi-analitico' ? 'active' : ''}
                  onClick={() => setMapSubView('powerbi-analitico')}
                  title="Vista 3: Tablero Analítico Territorial tipo Power BI"
                >
                  <BarChart3 size={13} style={{ marginRight: 4 }} />
                  Analítica Power BI
                </button>
              </div>
            ) : viewMode === 'lista' ? (
              /* En Modo Lista: Filtros Rápidos Semánticos de Fecha con Diseño Oficial Homologado */
              <>
                <button
                  type="button"
                  className={`today-pill ${listaTemporalFilter === 'Hoy' ? 'active' : ''}`}
                  onClick={() => {
                    const next = listaTemporalFilter === 'Hoy' ? 'Todos' : 'Hoy';
                    setListaTemporalFilter(next);
                    notify(next === 'Hoy' ? 'Filtrando actividades de Hoy' : 'Mostrando todas las actividades');
                  }}
                  title={listaTemporalFilter === 'Hoy' ? 'Quitar filtro de Hoy' : `Actividades en curso hoy (${formatDatePE(currentTodayIso)})`}
                >
                  Hoy
                </button>

                <div className="zoom" title="Filtrar actividades por período de corte">
                  {(['Todos', 'Semana', 'Mes', 'Trimestre'] as const).map((x) => (
                    <button
                      type="button"
                      key={x}
                      className={listaTemporalFilter === x ? 'active' : ''}
                      onClick={() => {
                        setListaTemporalFilter(x);
                        notify(x === 'Todos' ? 'Mostrando todas las actividades' : `Filtrando actividades en: ${x}`);
                      }}
                    >
                      {x === 'Semana' ? 'Esta Semana' : x === 'Mes' ? 'Este Mes' : x}
                    </button>
                  ))}
                </div>
              </>
            ) : viewMode === 'organigrama' && (perspective === 'maestro' || perspective === 'territorial') ? (
              /* En Modo Organigrama EDT: Controles Oficiales de Zoom y Ajuste */
              <>
                <button
                  type="button"
                  className="today-pill"
                  onClick={() => setOrganigramaFitTrigger((c) => c + 1)}
                  title="Ajustar vista del organigrama EDT al ancho de pantalla"
                >
                  Ajustar
                </button>

                <div className="zoom" title="Escala de zoom del organigrama EDT">
                  <button
                    type="button"
                    className="zoom-nav-arrow"
                    onClick={() => setOrganigramaZoom((z) => Math.max(40, z - 10))}
                    title="Reducir zoom EDT"
                    aria-label="Reducir zoom"
                  >
                    <ZoomOut size={14} />
                  </button>
                  {([50, 75, 100, 125] as const).map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      className={organigramaZoom === pct ? 'active' : ''}
                      onClick={() => setOrganigramaZoom(pct)}
                      title={`Zoom ${pct}%`}
                    >
                      {pct}%
                    </button>
                  ))}
                  <button
                    type="button"
                    className="zoom-nav-arrow"
                    onClick={() => setOrganigramaZoom((z) => Math.min(150, z + 10))}
                    title="Aumentar zoom EDT"
                    aria-label="Aumentar zoom"
                  >
                    <ZoomIn size={14} />
                  </button>
                </div>
              </>
            ) : (
              /* En Modo Gantt, Calendario, Kanban y Jerárquica: Barra de Navegación y Escala Oficial Homologada 1:1 */
              <>
                <button
                  type="button"
                  className="today-pill"
                  onClick={viewMode === 'calendario' ? handleTodayCal : scrollToToday}
                  title={viewMode === 'calendario' ? "Ir a hoy en el calendario" : "Ir y centrar en la fecha actual de hoy"}
                >
                  Hoy
                </button>

                <div className="zoom">
                  <button
                    type="button"
                    className="zoom-nav-arrow"
                    onClick={() => {
                      if (viewMode === 'calendario') {
                        handlePrevCalPeriod();
                      } else {
                        scrollTimeline('left');
                      }
                    }}
                    title={viewMode === 'calendario' ? "Período anterior" : "Desplazar línea de tiempo a la izquierda"}
                    aria-label="Desplazar hacia el pasado"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {(['Día', 'Semana', 'Mes', 'Trimestre'] as const).map((x) => (
                    <button
                      type="button"
                      key={x}
                      className={(viewMode === 'calendario' ? (x === 'Día' ? calSubView === 'Día' : x === 'Semana' ? calSubView === 'Semana' : calSubView === 'Mes') : zoom === x) ? 'active' : ''}
                      onClick={() => {
                        if (viewMode === 'calendario') {
                          if (x === 'Día' || x === 'Semana' || x === 'Mes') {
                            setCalSubView(x);
                          }
                        } else {
                          handleZoomChange(x);
                        }
                      }}
                      title={`Escala ${x}`}
                    >
                      {x}
                    </button>
                  ))}
                  <button
                    type="button"
                    className="zoom-nav-arrow"
                    onClick={() => {
                      if (viewMode === 'calendario') {
                        handleNextCalPeriod();
                      } else {
                        scrollTimeline('right');
                      }
                    }}
                    title={viewMode === 'calendario' ? "Período siguiente" : "Desplazar línea de tiempo a la derecha"}
                    aria-label="Desplazar hacia el futuro"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </>
            )}

            {/* Separador vertical: Bloque 2 (Tiempo) | Bloque 3 (Capas y Visualización de Cronograma) */}
            {(viewMode === 'gantt' || viewMode === 'calendario' || perspective === 'equipo') && (
              <div className="filter-group-divider" aria-hidden="true" />
            )}

            {/* Bloque 3: Acordeón Maestro de Capas y Visualización de Barras (Línea Base + %, dependencias y responsables) */}
            {(viewMode === 'gantt' || viewMode === 'calendario' || perspective === 'equipo') && (
              <div
                className={'bar-tools-accordion ' + (
                  (viewMode === 'calendario' ? (calShowBaseline || calShowBarLabels) : (showBaseline || showBarLabels || showCriticalPath || showBarAvatars)) ? 'has-active' : ''
                )}
              >
                {/* Botón Principal siempre visible: Conmutar Línea Base Oficial */}
                <button
                  type="button"
                  className={'btn secondary qm-btn-icon accordion-primary-btn ' + ((viewMode === 'calendario' ? calShowBaseline : showBaseline) ? 'active' : '')}
                  onClick={() => {
                    if (viewMode === 'calendario') {
                      setCalShowBaseline((v) => !v);
                      notify(calShowBaseline ? 'Línea base oculta' : 'Línea base oficial visible');
                    } else {
                      setShowBaseline((v) => !v);
                      notify(showBaseline ? 'Línea base oculta' : 'Línea base oficial visible');
                    }
                  }}
                  data-tooltip={(viewMode === 'calendario' ? calShowBaseline : showBaseline) ? "Ocultar línea base oficial" : "Mostrar línea base oficial"}
                  aria-label="Conmutar visualización de la línea base oficial"
                >
                  <Layers3 size={15} />
                </button>

                {/* Despliegue suave al pasar el mouse (hover): Fijar Línea Base + Porcentaje + Dependencias + Responsables */}
                <div className="accordion-expandable-items">
                  {/* [ ⚓ ] Fijar / Congelar fechas actuales como Línea Base Oficial */}
                  <button
                    type="button"
                    className="btn secondary qm-btn-icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      freezeBaselines();
                    }}
                    data-tooltip="Fijar / Congelar fechas actuales como línea base oficial"
                    aria-label="Fijar línea base del cronograma (PMBOK)"
                  >
                    <Anchor size={14} />
                  </button>

                  {/* [ % ] Conmutar etiquetas de Porcentaje en barras */}
                  <button
                    type="button"
                    className={'btn secondary qm-btn-icon ' + ((viewMode === 'calendario' ? calShowBarLabels : showBarLabels) ? 'active' : '')}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (viewMode === 'calendario') {
                        setCalShowBarLabels((prev) => !prev);
                      } else {
                        setShowBarLabels((prev) => !prev);
                      }
                    }}
                    data-tooltip={(viewMode === 'calendario' ? calShowBarLabels : showBarLabels) ? "Ocultar porcentaje en barras" : "Mostrar porcentaje en barras"}
                    aria-label="Mostrar u ocultar porcentaje de avance en barras"
                  >
                    <Percent size={14} />
                  </button>

                  {/* [ ☍ ] Conmutar Líneas de Dependencia y Ruta Crítica */}
                  <button
                    type="button"
                    className={'btn secondary qm-btn-icon ' + (showCriticalPath ? 'active' : '')}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCriticalPath((v) => !v);
                      notify(!showCriticalPath ? 'Líneas de dependencia visibles' : 'Líneas de dependencia ocultas');
                    }}
                    data-tooltip={showCriticalPath ? 'Ocultar dependencias' : 'Mostrar dependencias'}
                    aria-label="Conmutar líneas de dependencia y prelación entre tareas"
                  >
                    <Link2 size={15} />
                  </button>

                  {/* [ 👤 ] Conmutar Avatares de Responsables en Barras */}
                  <button
                    type="button"
                    className={'btn secondary qm-btn-icon ' + (showBarAvatars ? 'active' : '')}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowBarAvatars((v) => !v);
                      notify(!showBarAvatars ? 'Responsables visibles en las barras' : 'Responsables ocultos de las barras');
                    }}
                    data-tooltip={showBarAvatars ? 'Ocultar responsables' : 'Mostrar responsables'}
                    aria-label="Conmutar avatares de responsables en barras de Gantt"
                  >
                    <UserCheck size={15} />
                  </button>
                </div>
              </div>
            )}

            {/* Separador vertical: Capas y Visualización | Pantalla y Ajuste */}
            <div className="filter-group-divider" aria-hidden="true" />

            {/* Bloque 5: Ajuste de Pantalla y Cuadrícula */}
            {(viewMode === 'gantt' || viewMode === 'lista' || viewMode === 'calendario' || viewMode === 'mapa' || perspective === 'equipo') && (
              <button
                type="button"
                className={`btn secondary qm-btn-icon ${isFullscreen ? "active" : ""}`}
                onClick={toggleFullscreen}
                data-tooltip={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                aria-label="Alternar modo pantalla completa"
              >
                {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
            )}

            {/* Botón directo: Ajustar y ordenar anchos automáticamente */}
            <button
              type="button"
              className="btn secondary qm-btn-icon"
              onClick={(e) => {
                e.stopPropagation();
                resetColWidths();
              }}
              data-tooltip="Ajustar anchos de columnas automáticamente"
              aria-label="Ajustar anchos de columnas al contenido"
            >
              <ArrowLeftRight size={14} />
            </button>

            {/* Separador vertical: Ajustes | Historial de Deshacer */}
            <div className="filter-group-divider" aria-hidden="true" />

            {/* Bloque 6: Historial de Deshacer y Rehacer */}
            <button
              type="button"
              className={`btn secondary qm-btn-icon ${history.length === 0 ? 'disabled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleUndo();
              }}
              disabled={history.length === 0}
              data-tooltip={history.length > 0 ? "Retroceder / Deshacer (Ctrl+Z)" : "Sin cambios para retroceder"}
              aria-label="Retroceder o deshacer último cambio"
            >
              <Undo2 size={14} />
            </button>

            <button
              type="button"
              className={`btn secondary qm-btn-icon ${redoHistory.length === 0 ? 'disabled' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleRedo();
              }}
              disabled={redoHistory.length === 0}
              data-tooltip={redoHistory.length > 0 ? "Adelantar / Rehacer (Ctrl+Y)" : "Sin cambios para adelantar"}
              aria-label="Adelantar o rehacer último cambio"
            >
              <Redo2 size={14} />
            </button>

            {/* Separador vertical: Historial | Restablecer filtros */}
            <div className="filter-group-divider" aria-hidden="true" />

            {/* Bloque 7: Restablecimiento Universal de Todos los Filtros y Orden */}
            <button
              type="button"
              className="btn secondary clear-btn qm-btn-icon"
              onClick={(e) => {
                e.stopPropagation();
                setSearch('');
                if (perspective === 'equipo') {
                  setEquipoSedeFilter('todas');
                  setEquipoEstadoOpFilter('todos');
                  setEquipoEstadoCuentaFilter('todos');
                  setEquipoAreaFilter('todas');
                  setEquipoPill('Todos');
                }
                setStateFilter('Todos');
                setTypeFilter('Todos');
                setSelectedRegions([]);
                setPhaseFilter('Todas');
                setGestorFilter('Todos');
                setMacroFilter('Todos');
                setSelectedStates([]);
                setWbsDepthFilter('todos');
                setWbsRoleFilter('todos');
                setWbsLevelFilter('todos');
                setVencimientosFilter('todos');
                setListaTemporalFilter('Todos');
                setRangeFrom(DEFAULT_RANGE.from);
                setRangeTo(DEFAULT_RANGE.to);
                setTab('Todos');
                setCustomRules([]);
                setSelectedEdtCodes([]);
                setAdvancedFiltersOpen(false);
                setColFilterOpen(null);
                setShowBaseline(false);
                setCalShowBarLabels(true);
                setCalShowBaseline(false);
                setShowCriticalPath(false);
                engine.clearAllFilters();
                engine.clearSort();
                resetColWidths();
                closeMenus();
                if (viewMode === 'calendario') {
                  handleTodayCal();
                } else {
                  scrollToDate(RANGE_MIN);
                }
                notify('Todos los filtros restablecidos');
              }}
              data-tooltip="Restablecer todos los filtros"
              aria-label="Restablecer todos los filtros y limpiar vista"
            >
              <RotateCcw size={15} />
            </button>

            {/* Bloque 8: Extremo Derecho · Botón de Columnas en Azul App Primario */}
            <div className="filter-dropdown-wrap cols-dropdown-wrap cols-right-aligned">
              <button
                type="button"
                className={`btn primary cols-trigger-main-btn btn-primary-blue ${colsMenuOpen ? "active" : ""}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setColsMenuOpen((v) => !v);
                }}
                title={viewMode === 'lista' ? "Configurar columnas de la lista" : "Configurar columnas del cronograma"}
                data-tooltip="Configurar columnas visibles"
                aria-label="Configurar columnas visibles de la tabla"
              >
                <Columns3 size={15} />
                <span className="cols-btn-label">Columnas</span>
              </button>

              {colsMenuOpen && (
                <div
                  className="cols-popover"
                  onClick={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  onWheel={(e) => {
                    e.stopPropagation();
                    const list = e.currentTarget.querySelector('.cols-pop-list') as HTMLElement | null;
                    if (list && e.target !== list && !list.contains(e.target as Node)) {
                      list.scrollTop += e.deltaY;
                    }
                  }}
                >
                  <div className="cols-pop-head">
                    <div>
                      <strong>Columnas de la vista</strong>
                      <span className="cols-pop-subtitle">Selecciona las columnas que deseas mostrar.</span>
                    </div>
                    <button type="button" onClick={() => setColsMenuOpen(false)} title="Cerrar panel">
                      <X size={14} />
                    </button>
                  </div>
                  <div className="cols-pop-list">
                    {[
                      ...ALL_COL_META,
                      ...customCols.map((c) => ({ key: c.key as ColKey, label: c.label, fixed: false })),
                    ].map((col) => {
                      const isVisible = visibleCols.includes(col.key);
                      return (
                        <label key={col.key} className={`col-option ${col.fixed ? 'disabled' : ''}`}>
                          <input
                            type="checkbox"
                            checked={isVisible}
                            disabled={col.fixed}
                            onChange={() => toggleColVisibility(col.key)}
                          />
                          <span className="col-option-name">{col.label}</span>
                          {col.fixed ? (
                            <small className="fixed-pill">Fija</small>
                          ) : (
                            <GripVertical size={13} className="col-grip-icon" />
                          )}
                        </label>
                      );
                    })}
                  </div>

                  {/* Botón Destacado: Crear campo personalizado (Abre Modal Centrado) */}
                  <div className="cols-new-col-section">
                    <button
                      type="button"
                      className="cols-new-col-toggle-btn"
                      onClick={() => {
                        setColsMenuOpen(false);
                        setNewColModalOpen(true);
                      }}
                    >
                      <Plus size={14} />
                      <span>Crear campo personalizado</span>
                    </button>
                  </div>

                  <div className="cols-pop-foot">
                    <button
                      type="button"
                      className="cols-reorder-btn"
                      onClick={() => {
                        resetColWidths();
                        setColsMenuOpen(false);
                        notify('Anchos de columna auto-ajustados al contenido');
                      }}
                    >
                      <ArrowLeftRight size={13} />
                      <span>Ajustar anchos al contenido</span>
                    </button>

                    <button
                      type="button"
                      className="cols-reset-defaults-btn"
                      onClick={() => {
                        const isLista = viewMode === 'lista';
                        const defaultCols = isLista ? LISTA_PRESET_COLS : GANTT_PRESET_COLS;
                        setVisibleCols(defaultCols);
                        const storageKey = isLista ? uiKey('visible-cols-lista-v4') : uiKey('visible-cols-gantt-v3');
                        try {
                          localStorage.setItem(storageKey, JSON.stringify(defaultCols));
                        } catch {}
                        notify('Columnas restablecidas al orden predeterminado');
                      }}
                    >
                      <RotateCcw size={12} />
                      <span>Restablecer columnas</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </ProjectShellFilters>

          {/* Fila extra expandible de Filtros Personalizados */}
          {advancedFiltersOpen && (
            <div className="advanced-filter-row">
              {/* Sección Rango de Fechas Operativo */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 14px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', fontSize: '12px' }}>
                <span style={{ fontWeight: 650, color: '#334155', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <CalendarDays size={14} color="#0066ff" />
                  Rango de Fechas del Proyecto:
                </span>
                <span style={{ color: '#64748b' }}>Desde</span>
                <input
                  type="date"
                  value={rangeFrom}
                  min={RANGE_MIN}
                  max={rangeTo}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                />
                <span style={{ color: '#64748b' }}>Hasta</span>
                <input
                  type="date"
                  value={rangeTo}
                  min={rangeFrom}
                  max={RANGE_MAX}
                  onChange={(e) => setRangeTo(e.target.value)}
                  style={{ padding: '3px 8px', borderRadius: 6, border: '1px solid #cbd5e1', fontSize: '12px', background: '#fff' }}
                />
                {(rangeFrom !== RANGE_MIN || rangeTo !== RANGE_MAX) && (
                  <button
                    type="button"
                    onClick={() => {
                      setRangeFrom(RANGE_MIN);
                      setRangeTo(RANGE_MAX);
                    }}
                    style={{ background: 'none', border: 'none', color: '#0066ff', cursor: 'pointer', fontWeight: 600, fontSize: '11.5px' }}
                  >
                    Restablecer a todo el proyecto
                  </button>
                )}
              </div>
              <div className="advanced-filter-header">
                <div className="advanced-filter-title">
                  <Filter size={14} className="af-title-icon" />
                  <span>Condiciones de filtrado personalizadas</span>
                </div>
                <div className="advanced-filter-actions">
                  <button
                    type="button"
                    className="af-btn-add"
                    onClick={() => {
                      const newId = 'rule-' + Date.now();
                      setCustomRules((prev) => [
                        ...prev,
                        { id: newId, field: 'name', op: 'contains', val: '' }
                      ]);
                    }}
                  >
                    <Plus size={13} />
                    <span>Agregar condición</span>
                  </button>
                  {customRules.length > 0 && (
                    <button
                      type="button"
                      className="af-btn-clear"
                      onClick={() => {
                        setCustomRules([]);
                        notify('Condiciones personalizadas eliminadas');
                      }}
                    >
                      <Trash2 size={13} />
                      <span>Limpiar reglas</span>
                    </button>
                  )}
                  <button
                    type="button"
                    className="af-btn-close"
                    onClick={() => setAdvancedFiltersOpen(false)}
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {customRules.length === 0 ? (
                <div className="af-empty-state">
                  <span>Sin reglas activas. Pulsa <b>"Agregar condición"</b> para filtrar por estado, avance, responsable o texto.</span>
                </div>
              ) : (
                <div className="af-rules-list">
                  {customRules.map((rule, idx) => (
                    <div key={rule.id} className="af-rule-item">
                      <span className="af-rule-badge">{idx === 0 ? 'Donde' : 'Y'}</span>
                      <CustomSelect
                        value={rule.field}
                        options={[
                          { value: 'name', label: 'Componente / Subcomponente (Nombre o Código)' },
                          { value: 'status', label: 'Estado Oficial' },
                          { value: 'progress', label: 'Avance (%)' },
                          { value: 'gestor', label: 'Responsable' },
                          { value: 'region', label: 'Ubicación / Región' },
                        ]}
                        onChange={(newField) => {
                          setCustomRules((prev) =>
                            prev.map((r) =>
                              r.id === rule.id
                                ? {
                                    ...r,
                                    field: newField,
                                    op: newField === 'progress' ? 'gte' : newField === 'name' ? 'contains' : 'eq',
                                    val: ''
                                  }
                                : r
                            )
                          );
                        }}
                      />

                      <CustomSelect
                        className="af-select-op"
                        value={rule.op}
                        options={
                          rule.field === 'name'
                            ? [
                                { value: 'contains', label: 'Contiene' },
                                { value: 'not_contains', label: 'No contiene' },
                              ]
                            : rule.field === 'status'
                            ? [
                                { value: 'eq', label: 'Es igual a' },
                                { value: 'neq', label: 'No es igual a' },
                              ]
                            : rule.field === 'progress'
                            ? [
                                { value: 'gte', label: 'Mayor o igual a (≥)' },
                                { value: 'lte', label: 'Menor o igual a (≤)' },
                                { value: 'eq', label: 'Exactamente igual a (=)' },
                              ]
                            : [
                                { value: 'contains', label: 'Contiene / Es' },
                                { value: 'neq', label: 'No contiene' },
                              ]
                        }
                        onChange={(newOp) => {
                          setCustomRules((prev) =>
                            prev.map((r) => (r.id === rule.id ? { ...r, op: newOp } : r))
                          );
                        }}
                      />

                      {rule.field === 'status' ? (
                        <CustomSelect
                          className="af-select-val"
                          value={rule.val}
                          options={[
                            { value: '', label: 'Seleccionar estado...' },
                            ...STATUS_OPTIONS.map((st) => ({
                              value: st.toLowerCase(),
                              label: st,
                            })),
                          ]}
                          onChange={(v) => {
                            setCustomRules((prev) =>
                              prev.map((r) => (r.id === rule.id ? { ...r, val: v } : r))
                            );
                          }}
                        />
                      ) : rule.field === 'progress' ? (
                        <div className="af-input-group">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Ej. 50"
                            className="af-input af-input-num"
                            value={rule.val}
                            onChange={(e) => {
                              const v = e.target.value;
                              setCustomRules((prev) =>
                                prev.map((r) => (r.id === rule.id ? { ...r, val: v } : r))
                              );
                            }}
                          />
                          <span className="af-input-affix">%</span>
                        </div>
                      ) : (
                        <input
                          type="text"
                          placeholder={
                            rule.field === 'gestor'
                              ? 'Escribe nombre del responsable...'
                              : rule.field === 'region'
                              ? 'Escribe sede o región...'
                              : 'Término a buscar...'
                          }
                          className="af-input"
                          value={rule.val}
                          onChange={(e) => {
                            const v = e.target.value;
                            setCustomRules((prev) =>
                              prev.map((r) => (r.id === rule.id ? { ...r, val: v } : r))
                            );
                          }}
                        />
                      )}

                      <button
                        type="button"
                        className="af-btn-remove"
                        onClick={() => {
                          setCustomRules((prev) => prev.filter((r) => r.id !== rule.id));
                        }}
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}


          {/* Vistas específicas de perspectiva Equipo */}
          {perspective === 'equipo' && viewMode === 'organigrama' && (
            <EquipoOrganigramaView
              integrantes={equipoIntegrantes}
              areas={equipoAreas}
              sedes={equipoSedes}
              onSelectIntegrante={(id) => setEquipoSelectedId(id)}
            />
          )}
          {perspective === 'equipo' && viewMode === 'organigrama-flow' && (
            <EquipoOrganigramaFlowView />
          )}
          {perspective === 'equipo' && viewMode === 'sedes' && (
            <EquipoSedesView
              integrantes={equipoIntegrantes}
              sedes={equipoSedes}
              onSelectIntegrante={(id) => setEquipoSelectedId(id)}
              onUpdateIntegrante={handleUpdateIntegrante}
              onUpdateSede={handleUpdateSede}
            />
          )}
          {perspective === 'equipo' && viewMode === 'carga' && (
            <EquipoCargaView
              integrantes={equipoIntegrantes}
              asignaciones={equipoAsignaciones}
              sedes={equipoSedes}
              onSelectIntegrante={(id) => setEquipoSelectedId(id)}
              onReasignarTarea={handleReasignarTarea}
            />
          )}

          {/* Presentación Carátula Territorial Oficial (Sedes) */}
          {perspective === 'territorial' && viewMode === 'portada' && (
            <SedesCaratulaView
              items={items}
              unidades={unidades}
              onSelectSede={(sede) => {
                const target = items.find((x) => x.id === sede.id || x.name === sede.name);
                if (target) openEditorForItem(target);
              }}
            />
          )}

          {/* Presentación Oficial Aprobada: Gantt y Lista comparten 100% el mismo tablero unificado */}
          {(viewMode === 'gantt' || viewMode === 'lista' || (perspective === 'equipo' && !['organigrama', 'organigrama-flow', 'sedes', 'carga'].includes(viewMode))) && (
            <div className={`gantt-master-view-wrap ${viewMode === 'lista' || perspective === 'equipo' ? 'view-lista-fullwidth' : ''}`}>
          {/* Cabecera Fija Inmutable (Desacoplada del scroll horizontal para evitar desalineamiento) */}
          <div className="table-head" ref={tableHeadRef}>
            <div
                    className="fixed-cols"
                    style={{
                      width: `${fixedWidth}px`,
                      minWidth: `${fixedWidth}px`,
                      gridTemplateColumns: fixedGridCols,
                    }}
                  >
                    {effectiveRenderedCols.map((colKey) => renderHeaderCell(colKey))}
                  </div>

                  {viewMode === 'gantt' && (
              <div className="timeline-head-viewport" ref={headScrollRef}>
                <div className="timeline-head" style={{ width: timelineMinWidth, minWidth: timelineMinWidth }}>
                  <div
                    className="years"
                    style={{
                      gridTemplateColumns: zoom === 'Día' || zoom === 'Semana' ? monthCols : yearCols,
                    }}
                  >
                    {zoom === 'Día' || zoom === 'Semana' ? (
                      MONTH_NAMES.map((name, idx) => <span key={idx}>{name}</span>)
                    ) : (
                      <>
                        <span>2026</span>
                        <span>2027</span>
                      </>
                    )}
                  </div>
                  <div className="months" style={{ gridTemplateColumns: segCols }}>
                    {segments.map((s) => (
                      <span key={s.key}>{s.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Tabla Gantt con Timeline (Filas operativas con scroll 2D) */}
          <div className="gantt-scroll" ref={scrollRef} onScroll={handleScroll}>
            {items.length === 0 ? (
              <div
                style={{
                  padding: '70px 24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  width: '100%',
                  background: '#ffffff',
                }}
              >
                <div
                  style={{
                    width: '54px',
                    height: '54px',
                    borderRadius: '14px',
                    background: '#eff6ff',
                    color: '#2563eb',
                    display: 'grid',
                    placeItems: 'center',
                    boxShadow: '0 2px 6px rgba(37, 99, 235, 0.15)',
                  }}
                >
                  <FolderPlus size={26} />
                </div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 750, color: '#0f172a' }}>
                  Cronograma nuevo · Listo para estructurar
                </h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', maxWidth: '440px', textAlign: 'center', lineHeight: 1.45 }}>
                  Este proyecto inicia desde cero (completamente en blanco). Agrega tu primer componente o importa un cronograma oficial para comenzar.
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                  <button
                    type="button"
                    className="btn primary"
                    onClick={() => add('hito')}
                    style={{ height: '38px', padding: '0 18px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Plus size={15} />
                    <span>Agregar Primer Componente</span>
                  </button>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => {
                      setImportOpen(true);
                      setPickedFile('');
                    }}
                    style={{ height: '38px', padding: '0 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  >
                    <Upload size={14} />
                    <span>Importar Plantilla</span>
                  </button>
                </div>
              </div>
            ) : (
            <div
              className="gantt"
              style={
                viewMode === 'lista'
                  ? ({ width: `${fixedWidth}px`, minWidth: `${fixedWidth}px` } as React.CSSProperties)
                  : ({
                      '--fixed': `${fixedWidth}px`,
                      width: `calc(var(--fixed) + ${timelineMinWidth})`,
                      minWidth: `calc(var(--fixed) + ${timelineMinWidth})`,
                    } as React.CSSProperties)
              }
            >
              {/* Filas */}
              {shown.slice(0, renderedRowCount).map((x, i) => (
                <div
                  key={x.id}
                  className={`row ${x.kind === 'hito' ? 'hito' : 'sub'} ${i % 2 ? 'stripe' : ''} ${
                    selectedId === x.id ? 'selected' : ''
                  } ${selectedRowIds.has(x.id) ? 'batch-selected-row' : ''} ${edit?.id === x.id ? 'is-editing-row' : ''}`}
                  onClick={() => {
                    setSelectedId(x.id);
                  }}
                  onDoubleClick={() => {
                    openEditorForItem(x);
                  }}
                >
                  <div
                    className="fixed-cols"
                    style={{
                      width: `${fixedWidth}px`,
                      minWidth: `${fixedWidth}px`,
                      gridTemplateColumns: fixedGridCols,
                    }}
                  >
                    {effectiveRenderedCols.map((colKey) => renderRowCell(x, colKey))}
                </div>

                {viewMode === 'gantt' && (
                  <div className="timeline" style={{ width: timelineMinWidth, minWidth: timelineMinWidth }}>
                    <div className="month-grid" style={{ gridTemplateColumns: segCols }}>
                      {segments.map((s) => (
                        <span key={s.key} />
              ))}
              <div ref={prefetchSentinelRef} aria-hidden="true" style={{ height: 1, width: '100%' }} />
                    </div>
                    {/* Sombra de Línea Base Desacoplada (Punto 2.A: coordenadas absolutas independientes) */}
                    {showBaseline && (() => {
                      const bStart = x.baselineStart || x.start;
                      const bEnd = x.baselineEnd || x.end;
                      if (!bStart || !bEnd) return null;
                      const bLeft = getDatePixelOffset(bStart);
                      const bWidth = Math.max(8, getDatePixelOffset(shiftDays(bEnd, 1)) - bLeft);
                      const hasDev = x.baselineEnd && x.end !== x.baselineEnd;
                      return (
                        <div
                          className="baseline-shadow-bar"
                          style={{
                            left: `${bLeft}px`,
                            width: `${bWidth}px`,
                          }}
                          title={`Línea base aprobada: ${formatDatePE(bStart)} – ${formatDatePE(bEnd)}${hasDev ? ` (Desvío con fecha viva: ${getDays(x.baselineEnd, x.end)}d)` : ''}`}
                        />
                      );
                    })()}
                    {(() => {
                      const barWidthPx =
                        resizingTaskId === x.id && resizeTempWidth !== null
                          ? resizeTempWidth
                          : Math.max(8, getDatePixelOffset(shiftDays(x.end, 1)) - getDatePixelOffset(x.start));
                      // El relleno físico real en píxeles que tiene el color de avance
                      const fillWidthPx = barWidthPx * (Math.min(100, Math.max(0, x.progress)) / 100);
                      // Vive dentro de la barra si el relleno físico tiene al menos 42px para el texto
                      const fitsInsideBar = fillWidthPx >= 42;
                      const barStartX = getDatePixelOffset(x.start);
                      const labelPosition = fitsInsideBar || barStartX < 45 ? 'in-bar' : 'before-bar';

                      return (
                        <div
                          className={`bar ${STATUS_CLASS[x.status]} ${x.kind === 'hito' ? 'major' : ''} ${
                            isRangeActive && x.end > rangeTo ? 'exceeds-range' : ''
                          } ${resizingTaskId === x.id ? 'is-resizing' : ''}`}
                          style={{
                            left: `${getDatePixelOffset(x.start)}px`,
                            width: `${barWidthPx}px`,
                            animationDelay: `${Math.min(i * 35, 320)}ms`,
                          }}
                          onDoubleClick={(e) => {
                            e.stopPropagation();
                            openEditorForItem(x);
                          }}
                          onMouseEnter={(e) => {
                            if (resizingTaskId) return;
                            const rect = e.currentTarget.getBoundingClientRect();
                            setHoveredTask({
                              item: x,
                              x: rect.left + rect.width / 2,
                              y: rect.top - 2,
                            });
                          }}
                          onMouseLeave={() => {
                            if (!resizingTaskId) setHoveredTask(null);
                          }}
                        >
                          {/* Relleno de avance proporcional (refleja el % real de cumplimiento) */}
                          <div
                            className="bar-progress-fill"
                            style={{
                              width: `${Math.min(100, Math.max(0, x.progress))}%`,
                              borderTopRightRadius: x.progress >= 98 ? 'inherit' : 0,
                              borderBottomRightRadius: x.progress >= 98 ? 'inherit' : 0,
                            }}
                          />

                          {/* Contenido interior secuencial: 1° Porcentaje (%) + 2° Iconos de responsables (sin salir del nodo) */}
                          {(showBarLabels || showBarAvatars) && (
                            <div className={`bar-inner-content ${labelPosition}`}>
                              {/* 1. Porcentaje de avance: espacio numérico natural (máx 100%) */}
                              {showBarLabels && (
                                <span className={`bar-percent-tag ${labelPosition}`}>
                                  {x.progress}%
                                </span>
                              )}

                              {/* 2. Iconos de responsables: a continuación del porcentaje sin solapar */}
                              {showBarAvatars && (() => {
                                const gList = getItemGestores(x);
                                const mainGestor = gList[0];
                                if (!mainGestor || mainGestor === 'Sin asignar') return null;
                                return (
                                  <div className="bar-avatars-group" title={`Responsable: ${gList.join(', ')}`}>
                                    {gList.slice(0, 2).map((gName, idx) => (
                                      <span
                                        key={gName}
                                        className="gantt-bar-avatar"
                                        style={{
                                          backgroundColor: getGestorColor(gName),
                                          zIndex: 5 - idx,
                                          marginLeft: idx > 0 ? -5 : 0,
                                        }}
                                      >
                                        {getGestorInitials(gName)}
                                      </span>
                                    ))}
                                    {gList.length > 2 && (
                                      <span className="gantt-bar-avatar-more">+{gList.length - 2}</span>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                          {x.kind === 'hito' ? (
                            <span className="hito-diamond-badge" title="Componente Principal">
                              <span className="diamond-shape" />
                            </span>
                          ) : null}
                          {isRangeActive && x.end > rangeTo && (
                            <span
                              className={`exceed-pill ${x.kind === 'hito' ? 'pill-with-diamond' : ''}`}
                              title="Finaliza después del rango de fechas seleccionado"
                            >
                              +fuera rango
                            </span>
                          )}

                      {/* Manillar interactivo de estiramiento / redimensión de fechas */}
                      <div
                        className="bar-resizer-right"
                        title="Arrastra para modificar la fecha de fin (o doble clic para editar)"
                        onMouseDown={(e) => handleResizeMouseDown(e, x)}
                      />

                      {/* Badge flotante en vivo durante el arrastre */}
                      {resizingTaskId === x.id && resizeTempEndDate && (
                        <div className="resize-live-badge">
                          Hasta {formatDate(resizeTempEndDate)} ({getDays(x.start, resizeTempEndDate)}d)
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}
            </div>
          ))}

              {/* Fila interactiva para creación rápida de nuevo Componente Principal al pie */}
              <div
                className="row quick-add-row"
                onClick={() => add('hito', undefined, true)}
                title="Haz clic para agregar un nuevo componente principal al cronograma"
              >
                <div
                  className="fixed-cols"
                  style={{
                    width: `${fixedWidth}px`,
                    minWidth: `${fixedWidth}px`,
                    gridTemplateColumns: fixedGridCols,
                  }}
                >
                  <div className="name-cell quick-add-cell" style={{ gridColumn: '1 / -1' }}>
                    <span className="indent" />
                    <div className="quick-add-icon-box">
                      <Plus size={14} />
                    </div>
                    <span className="quick-add-text">+ Agregar nuevo componente principal</span>
                  </div>
                </div>
              </div>

              {/* Capa Overlay de Línea de Tiempo (Mismas dimensiones y alineación absoluta que las barras del timeline) */}
              {viewMode === 'gantt' && (
              <div
                className="timeline-grid-overlay"
                style={{
                  left: `${fixedWidth}px`,
                  width: timelineMinWidth,
                  minWidth: timelineMinWidth,
                }}
              >
                {/* Máscara visual de zona fuera de rango (cuando hay filtro de rango activo) */}
                {isRangeActive && (
                  <>
                    {/* Zona previa al inicio del rango */}
                    {getDatePixelOffset(rangeFrom) > 0 && (
                      <div
                        className="range-mask-before"
                        style={{
                          left: 0,
                          width: `${getDatePixelOffset(rangeFrom)}px`,
                        }}
                        title={`Zona fuera de rango: previa al ${formatDate(rangeFrom)}`}
                      />
                    )}

                    {/* Línea divisoria de Inicio de Rango */}
                    <div
                      className="range-boundary-line start-line"
                      style={{
                        left: `${getDatePixelOffset(rangeFrom)}px`,
                      }}
                      title={`Rango Inicio: ${formatDate(rangeFrom)}`}
                    >
                      <span className="range-boundary-tag start-tag">Rango Inicio</span>
                    </div>

                    {/* Zona posterior al fin del rango */}
                    {getDatePixelOffset(shiftDays(rangeTo, 1)) < (parseFloat(timelineMinWidth) || 8228) && (
                      <div
                        className="range-mask-after"
                        style={{
                          left: `${getDatePixelOffset(shiftDays(rangeTo, 1))}px`,
                          width: `${Math.max(0, (parseFloat(timelineMinWidth) || 8228) - getDatePixelOffset(shiftDays(rangeTo, 1)))}px`,
                        }}
                        title={`Zona fuera de rango: posterior al ${formatDate(rangeTo)}`}
                      />
                    )}

                    {/* Línea divisoria de Fin de Rango */}
                    <div
                      className="range-boundary-line end-line"
                      style={{
                        left: `${getDatePixelOffset(shiftDays(rangeTo, 1))}px`,
                      }}
                      title={`Rango Fin: ${formatDate(rangeTo)}`}
                    >
                      <span className="range-boundary-tag end-tag">Rango Fin</span>
                    </div>
                  </>
                )}

                {/* Indicador dinámico de "Hoy" */}
                <div
                  className="today"
                  style={{
                    left: `${getDatePixelOffset(currentTodayIso) + (zoom === 'Día' ? 17 : 0)}px`,
                  }}
                >
                  <span>Hoy</span>
                </div>
              </div>
            )}
            </div>
            )}

            {/* Capa SVG Maestra de Flechas y Líneas de Dependencia / Prelación */}
            {showCriticalPath && viewMode === 'gantt' && (
              <svg
                className="gantt-dependency-svg"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: `${fixedWidth}px`,
                  width: timelineMinWidth,
                  height: `${shown.length * 48}px`,
                  pointerEvents: 'none',
                  zIndex: 12,
                  overflow: 'visible',
                }}
              >
                <defs>
                  <marker
                    id="dep-arrow"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#475569" />
                  </marker>
                  <marker
                    id="dep-arrow-active"
                    viewBox="0 0 10 10"
                    refX="7"
                    refY="5"
                    markerWidth="7"
                    markerHeight="7"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#0066ff" />
                  </marker>
                </defs>

                {(() => {
                  const itemIndexMap = new Map<string, number>();
                  shown.forEach((it, idx) => itemIndexMap.set(it.id, idx));

                  const allMap = new Map<string, Item>(items.map((it) => [it.id, it]));
                  const shownSet = new Set<string>(shown.map((it) => it.id));

                  // Resolver el nodo ancestro visible si el elemento específico está colapsado
                  const resolveVisibleId = (id: string): string | null => {
                    if (shownSet.has(id)) return id;
                    let curr = allMap.get(id);
                    while (curr && curr.parentId) {
                      if (shownSet.has(curr.parentId)) return curr.parentId;
                      curr = allMap.get(curr.parentId);
                    }
                    return null;
                  };

                  const renderedPairs = new Set<string>();

                  return shown.flatMap((item) => {
                    const targetIndex = itemIndexMap.get(item.id);
                    if (targetIndex === undefined) return [];

                    // 1. Predecesores directos y reales del ítem (según WBS oficial o editados por el usuario)
                    const predecessorRawIds = new Set<string>();
                    if (item.dependencies && item.dependencies.length > 0) {
                      item.dependencies.forEach((d) => predecessorRawIds.add(d));
                    }

                    // 2. Si el contenedor tiene hijos ocultos/colapsados (no mostrados en pantalla), recolectar dependencias externas
                    const hasVisibleChildren = (childrenByParent.get(item.id) ?? []).some((c) => shownSet.has(c.id));
                    if (!hasVisibleChildren) {
                      items.forEach((subIt) => {
                        if (subIt.parentId === item.id && subIt.dependencies && subIt.dependencies.length > 0) {
                          subIt.dependencies.forEach((d) => {
                            const depItem = allMap.get(d);
                            if (depItem && depItem.parentId !== item.id && d !== item.id) {
                              predecessorRawIds.add(d);
                            }
                          });
                        }
                      });
                    }

                    return Array.from(predecessorRawIds).flatMap((predRawId) => {
                      const visiblePredId = resolveVisibleId(predRawId);
                      if (!visiblePredId || visiblePredId === item.id) return [];

                      const pairKey = `${visiblePredId}->${item.id}`;
                      if (renderedPairs.has(pairKey)) return [];
                      renderedPairs.add(pairKey);

                      const sourceIndex = itemIndexMap.get(visiblePredId);
                      if (sourceIndex === undefined) return [];
                      const sourceItem = shown[sourceIndex];
                      if (!sourceItem) return [];

                      const rowHeight = 48;
                      const fromEndX = getDatePixelOffset(shiftDays(sourceItem.end, 1));
                      const fromY = sourceIndex * rowHeight + rowHeight / 2;
                      const toX = getDatePixelOffset(item.start);
                      const toY = targetIndex * rowHeight + rowHeight / 2;

                      // Determinar si la barra destino tiene el porcentaje fuera (lado izquierdo)
                      const targetBarWidthPx = Math.max(8, getDatePixelOffset(shiftDays(item.end, 1)) - getDatePixelOffset(item.start));
                      const targetFillWidthPx = targetBarWidthPx * (Math.min(100, Math.max(0, item.progress)) / 100);
                      const targetFitsInsideBar = targetFillWidthPx >= 42;

                      let pathD = '';
                      if (toX >= fromEndX + 8) {
                        // Trazo secuencial clásico ortogonal (Fin a Inicio: ──┐ └──►)
                        const midX = fromEndX + Math.max(8, (toX - fromEndX) / 2);
                        if (!targetFitsInsideBar && toX - midX > 24) {
                          // Resguardar holgura para la etiqueta de porcentaje situada a la izquierda de la barra
                          const laneY = toY - 8;
                          pathD = `M ${fromEndX} ${fromY} L ${midX} ${fromY} L ${midX} ${laneY} L ${toX - 4} ${laneY} L ${toX - 2} ${toY}`;
                        } else {
                          pathD = `M ${fromEndX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX - 2} ${toY}`;
                        }
                      } else {
                        // Trazo con canal de retorno en vacío para evitar cruzar sobre nodos
                        const exitX = fromEndX + 10;
                        const backX = Math.min(toX - 12, fromEndX - 10);
                        const interY = fromY + (toY > fromY ? 24 : -24);
                        pathD = `M ${fromEndX} ${fromY} L ${exitX} ${fromY} L ${exitX} ${interY} L ${backX} ${interY} L ${backX} ${toY} L ${toX - 2} ${toY}`;
                      }

                      // Solo resaltar la línea si el puntero se posiciona exactamente sobre ella
                      const isHighlighted =
                        hoveredDep !== null &&
                        hoveredDep.sourceItem.id === visiblePredId &&
                        hoveredDep.targetItem.id === item.id;

                      const strokeColor = isHighlighted ? '#0066ff' : '#94a3b8';
                      const strokeWidth = isHighlighted ? '1.8' : '1.3';
                      const markerId = isHighlighted ? 'url(#dep-arrow-active)' : 'url(#dep-arrow)';
                      const pathOpacity = isHighlighted ? 1 : 0.85;

                      return (
                        <g
                          key={pairKey}
                          className={`dep-line-group ${isHighlighted ? 'is-active' : ''}`}
                        >
                          {/* Hit area invisible ajustada (10px) para interacción directa y certera sin parpadeo ni auras */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="transparent"
                            strokeWidth="10"
                            className="dep-line-hit"
                            style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                            onMouseEnter={(e) => {
                              if (depHoverTimeoutRef.current) {
                                clearTimeout(depHoverTimeoutRef.current);
                                depHoverTimeoutRef.current = null;
                              }
                              setHoveredDep({
                                sourceItem,
                                targetItem: item,
                                x: e.clientX,
                                y: e.clientY - 14,
                              });
                            }}
                            onMouseMove={(e) => {
                              if (depHoverTimeoutRef.current) {
                                clearTimeout(depHoverTimeoutRef.current);
                                depHoverTimeoutRef.current = null;
                              }
                              setHoveredDep((prev) => (prev ? { ...prev, x: e.clientX, y: e.clientY - 14 } : prev));
                            }}
                            onMouseLeave={() => {
                              if (depHoverTimeoutRef.current) clearTimeout(depHoverTimeoutRef.current);
                              depHoverTimeoutRef.current = setTimeout(() => {
                                setHoveredDep(null);
                              }, 140);
                            }}
                          />
                          <path
                            d={pathD}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth={strokeWidth}
                            markerEnd={markerId}
                            opacity={pathOpacity}
                            className="dep-line-visible"
                            style={{ pointerEvents: 'none' }}
                          />
                        </g>
                      );
                    });
                  });
                })()}
              </svg>
            )}
          </div>

          {/* Tooltip Minimalista estilo Módulo Reportes (1-2 datos limpios, cero sobrecarga) */}
          {hoveredTask && !resizingTaskId && (
            <div
              className="gantt-modern-tooltip"
              style={{
                left: `${hoveredTask.x}px`,
                top: `${hoveredTask.y}px`,
              }}
            >
              <div className="tooltip-header">
                {hoveredTask.item.kind === 'hito' ? '◆ ' : ''}
                {hoveredTask.item.code} {hoveredTask.item.name}
              </div>
              <div className="tooltip-metric">
                <span>Cumplimiento : {hoveredTask.item.progress}%</span>
                {hoveredTask.item.end && (
                  <span className="tooltip-fc">
                    <span className="tooltip-sep">·</span> FC: {formatDateDash(hoveredTask.item.end)}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Tooltip Ultra-Minimalista de 2 Líneas para Dependencias */}
          {hoveredDep && !resizingTaskId && (
            <div
              className="gantt-dep-tooltip"
              style={{
                left: `${hoveredDep.x}px`,
                top: `${hoveredDep.y}px`,
              }}
            >
              <div className="dep-tip-source" title={`${hoveredDep.sourceItem?.code || ''} ${hoveredDep.sourceItem?.name || ''}`}>
                <b>{hoveredDep.sourceItem?.code || ''}</b> {(hoveredDep.sourceItem?.name || '').slice(0, 22)}…
              </div>
              <div className="dep-tip-target" title={`${hoveredDep.targetItem?.code || ''} ${hoveredDep.targetItem?.name || ''}`}>
                <CornerDownRight size={13} style={{ color: '#0066ff', flexShrink: 0 }} strokeWidth={2.5} />
                <span><b>{hoveredDep.targetItem?.code || ''}</b> {(hoveredDep.targetItem?.name || '').slice(0, 22)}…</span>
              </div>
            </div>
          )}

            </div>
          )}

          {/* Presentación 3: Tablero Visual Kanban (Punto 3 Conectado) */}
          {viewMode === 'kanban' && (
            <CronogramaKanbanView
              items={shown}
              allItems={items}
              onSelectItem={openEditorForItem}
              todayIso={currentTodayIso}
              onAddItem={(targetStatus) => {
                add('subproceso', undefined, true, targetStatus);
              }}
              onUpdateStatus={(itemId, nextStatus) => {
                setItems((prev) => {
                  const updated = prev.map((x) =>
                    x.id === itemId
                      ? {
                          ...x,
                          status: nextStatus,
                          progress:
                            nextStatus === 'Completado' || nextStatus === 'Cumple'
                              ? 100
                              : nextStatus === 'Pendiente'
                              ? 0
                              : x.progress > 0
                              ? x.progress
                              : 40,
                        }
                      : x
                  );
                  const recomputed = computeWbsHierarchy(updated, rawTasks);
                  try {
                    localStorage.setItem(`qaway-gantt-items-${projectId}`, JSON.stringify(recomputed));
                    window.dispatchEvent(new CustomEvent('qaway-gantt-items-updated'));
                  } catch {}
                  return recomputed;
                });
                notify(`Estado actualizado a: ${nextStatus}`);
              }}
              formatDatePE={formatDatePE}
            />
          )}

          {/* Presentación 4: Calendario Mensual */}
          {viewMode === 'calendario' && (
            <CronogramaCalendarioView
              items={shown}
              onSelectItem={openEditorForItem}
              formatDatePE={formatDatePE}
              calYear={calYear}
              calMonth={calMonth}
              calDay={calDay}
              calSubView={calSubView}
              onNavPrev={handlePrevCalPeriod}
              onNavNext={handleNextCalPeriod}
              onNavToday={handleTodayCal}
              onSubViewChange={setCalSubView}
              typeFilter={typeFilter}
              tab={tab}
              stateFilter={stateFilter}
              selectedRegions={selectedRegions}
              search={search}
              showBarLabels={calShowBarLabels}
              showBaseline={calShowBaseline}
              showBarAvatars={showBarAvatars}
            />
          )}

          {/* Presentación Mapa Territorial */}
          {viewMode === 'mapa' && (
            <MapaTerritorialView
              items={shown}
              allItems={items}
              subView={mapSubView}
              onSubViewChange={setMapSubView}
              selectedRegion={selectedRegions.length > 0 ? (selectedRegions[0] ?? 'Todas') : 'Todas'}
              onSelectRegion={(reg) => {
                if (reg === 'Todas') {
                  setSelectedRegions([]);
                } else {
                  setSelectedRegions([reg]);
                }
              }}
              selectedPhase={phaseFilter}
              unidades={unidades}
              isFullscreen={isFullscreen}
              onToggleFullscreen={toggleFullscreen}
            />
          )}

          {/* Presentación 5: Estructura Jerárquica WBS / Árbol (Imagen de referencia 1) */}
          {viewMode === 'arbol' && (
            <CronogramaArbolView
              items={shown}
              allItems={items}
              selectedId={selectedId}
              onSelectItem={openEditorForItem}
              onAddItem={(kind, pId) => add(kind, pId, true)}
              formatDatePE={formatDatePE}
            />
          )}

          {/* Presentación 6: Vista Organigrama WBS por Niveles (EDT Estructurada - solo fuera de Equipo) */}
          {perspective !== 'equipo' && viewMode === 'organigrama' && (
            <CronogramaOrganigramaView
              items={shown}
              allItems={items}
              selectedId={selectedId}
              projectName={activeProject?.name || 'Distribución de Materiales DOT 2027'}
              zoomLevel={organigramaZoom}
              onZoomChange={setOrganigramaZoom}
              fitViewTrigger={organigramaFitTrigger}
              onSelectItem={openEditorForItem}
              onAddItem={(kind, pId) => add(kind, pId, true)}
              formatDatePE={formatDatePE}
              onMoveNode={(draggedId, targetId, mode) => {
                commitChange((prev) => {
                  const dragged = prev.find((x) => x.id === draggedId);
                  const target = prev.find((x) => x.id === targetId);
                  if (!dragged || !target || dragged.id === target.id) return prev;

                  // Colectar subárbol completo del elemento arrastrado (en caso sea Componente o Agrupador)
                  const subtreeIds = new Set<string>([dragged.id]);
                  const collectDescendants = (pId: string) => {
                    prev.forEach((it) => {
                      if (it.parentId === pId && !subtreeIds.has(it.id)) {
                        subtreeIds.add(it.id);
                        collectDescendants(it.id);
                      }
                    });
                  };
                  collectDescendants(dragged.id);

                  // Evitar ciclos: el destino jamás puede estar dentro del subárbol arrastrado
                  if (subtreeIds.has(target.id)) return prev;

                  const newParentId = mode === 'reparent' ? target.id : target.parentId;
                  const updatedDragged: Item = {
                    ...dragged,
                    parentId: newParentId,
                    kind: newParentId ? 'subproceso' : 'hito',
                  };

                  const draggedBlock = prev
                    .filter((x) => subtreeIds.has(x.id))
                    .map((x) => (x.id === dragged.id ? updatedDragged : x));

                  const remaining = prev.filter((x) => !subtreeIds.has(x.id));

                  if (mode === 'reparent') {
                    // Insertar al final de los hijos actuales del contenedor destino
                    const targetSubtreeIds = new Set<string>([target.id]);
                    const collectTargetDesc = (pId: string) => {
                      remaining.forEach((it) => {
                        if (it.parentId === pId && !targetSubtreeIds.has(it.id)) {
                          targetSubtreeIds.add(it.id);
                          collectTargetDesc(it.id);
                        }
                      });
                    };
                    collectTargetDesc(target.id);

                    let insertIdx = remaining.findIndex((x) => x.id === target.id);
                    remaining.forEach((it, idx) => {
                      if (targetSubtreeIds.has(it.id)) insertIdx = idx;
                    });

                    const nextList = [...remaining];
                    nextList.splice(insertIdx + 1, 0, ...draggedBlock);
                    return nextList;
                  } else {
                    // Reordenamiento en el mismo nivel junto al elemento objetivo
                    const origDraggedIdx = prev.findIndex((x) => x.id === dragged.id);
                    const origTargetIdx = prev.findIndex((x) => x.id === target.id);
                    const targetIdxInRemaining = remaining.findIndex((x) => x.id === target.id);
                    if (targetIdxInRemaining === -1) return [...remaining, ...draggedBlock];

                    // Si venía de antes y se suelta sobre un hermano posterior, insertar después del subárbol del hermano
                    if (origDraggedIdx < origTargetIdx) {
                      const targetSubtreeIds = new Set<string>([target.id]);
                      const collectTargetDesc = (pId: string) => {
                        remaining.forEach((it) => {
                          if (it.parentId === pId && !targetSubtreeIds.has(it.id)) {
                            targetSubtreeIds.add(it.id);
                            collectTargetDesc(it.id);
                          }
                        });
                      };
                      collectTargetDesc(target.id);
                      let afterIdx = targetIdxInRemaining;
                      remaining.forEach((it, idx) => {
                        if (targetSubtreeIds.has(it.id)) afterIdx = idx;
                      });
                      const nextList = [...remaining];
                      nextList.splice(afterIdx + 1, 0, ...draggedBlock);
                      return nextList;
                    } else {
                      const nextList = [...remaining];
                      nextList.splice(targetIdxInRemaining, 0, ...draggedBlock);
                      return nextList;
                    }
                  }
                });
                const draggedItem = items.find((x) => x.id === draggedId);
                const targetItem = items.find((x) => x.id === targetId);
                if (draggedItem && targetItem) {
                  notify(
                    mode === 'reparent'
                      ? `"${draggedItem.code} ${draggedItem.name}" movido dentro de "${targetItem.code} ${targetItem.name}"`
                      : `"${draggedItem.code} ${draggedItem.name}" reordenado junto a "${targetItem.code} ${targetItem.name}"`
                  );
                }
              }}
              onAutoSort={() => {
                commitChange((prev) => sortWbsHierarchy(prev));
                notify('Diagrama EDT autoordenado según jerarquía y numeración WBS');
              }}
            />
          )}

          {/* Barra Flotante de Acciones en Lote (Modo Lista) */}
          {viewMode === 'lista' && selectedRowIds.size > 0 && (
            <aside className="batch-floating-bar" aria-label="Acciones en lote para registros seleccionados">
              <div className="batch-pill-count">
                <span className="count-number">{selectedRowIds.size}</span>
                <span>{selectedRowIds.size === 1 ? 'fila seleccionada' : 'filas seleccionadas'}</span>
              </div>
              <div className="batch-divider" />
              <div className="batch-actions-group">
                <span className="batch-group-title">Cambiar estado:</span>
                <button
                  type="button"
                  className="batch-action-btn is-success"
                  onClick={() => handleBulkStatusChange('Completado')}
                  title="Marcar registros seleccionados como Completado"
                >
                  <Check size={13} />
                  <span>Completado</span>
                </button>
                <button
                  type="button"
                  className="batch-action-btn is-progress"
                  onClick={() => handleBulkStatusChange('En proceso')}
                  title="Marcar registros seleccionados como En proceso"
                >
                  <Clock size={13} />
                  <span>En proceso</span>
                </button>
                <button
                  type="button"
                  className="batch-action-btn is-pending"
                  onClick={() => handleBulkStatusChange('Pendiente')}
                  title="Marcar registros seleccionados como Pendiente"
                >
                  <span>Pendiente</span>
                </button>
              </div>
              <div className="batch-divider" />
              <button
                type="button"
                className="batch-cancel-btn"
                onClick={clearSelection}
                title="Deseleccionar todos los registros"
              >
                <X size={14} />
                <span>Deseleccionar</span>
              </button>
            </aside>
          )}

          {/* Barra de Cálculos al pie Notion / Excel */}
          {(perspective === 'maestro' || perspective === 'territorial') && Object.keys(colCalculations).length > 0 && (
            <div className="te-table-calc-bar" role="status" aria-label="Cálculos de columna activos">
              <div className="te-calc-bar-header">
                <Sigma size={13} className="te-calc-bar-icon" />
                <span className="te-calc-bar-title">Cálculo al pie:</span>
              </div>
              <div className="te-calc-bar-pills">
                {Object.entries(colCalculations).map(([colId, calcType]) => {
                  const colDef = ganttColumns.find((c) => c.id === colId);
                  const colLabel = getColLabel(colId, colDef?.label || colId);
                  const calcName = calcType === 'sum' ? 'Suma' : calcType === 'avg' ? 'Promedio' : calcType === 'min' ? 'Mínimo' : calcType === 'max' ? 'Máximo' : 'Conteo';
                  const result = computeColumnCalculation(colId, calcType, shown);
                  return (
                    <div key={colId} className="te-calc-summary-pill" title={`${colLabel}: ${calcName} = ${result}`}>
                      <span className="te-calc-pill-name">{colLabel}</span>
                      <span className="te-calc-pill-type">({calcName})</span>
                      <span className="te-calc-pill-sep">:</span>
                      <strong className="te-calc-pill-val">{result}</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer de Paginación */}
          <footer className="footer">
            <span>
              {perspective === 'territorial' && viewMode === 'portada'
                ? `Mostrando 1–28 de 28 entidades y unidades asignadas`
                : (perspective === 'equipo' && viewMode === 'organigrama-flow')
                ? `Organigrama Interactivo · Datos de demostración`
                : (perspective === 'equipo' && ['organigrama', 'sedes', 'carga'].includes(viewMode))
                ? `Mostrando ${equipoIntegrantes.length ? 1 : 0}–${equipoIntegrantes.length} de ${equipoIntegrantes.length} integrantes registrados`
                : `Mostrando ${shown.length ? 1 : 0}–${shown.length} de ${perspective === 'territorial' ? (countTerritorial || 251) : items.length} ${perspective === 'territorial' ? 'sedes territoriales' : 'registros'}`}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="btn secondary"
                style={{ minHeight: '32px', fontSize: '12px' }}
                onClick={() => {
                  if (perspective === 'equipo' && ['organigrama', 'sedes', 'carga'].includes(viewMode)) {
                    if (equipoSelectedId) {
                      setEquipoSelectedId(null);
                    } else if (equipoIntegrantes[0]) {
                      setEquipoSelectedId(equipoIntegrantes[0].id);
                    }
                  } else if (panelOpen) {
                    requestCloseDrawer();
                  } else {
                    const target = selected || hitos[0] || items[0];
                    if (target) {
                      openEditorForItem(target);
                    }
                  }
                }}
                title="Abrir o cerrar panel de detalles del elemento seleccionado"
              >
                <PanelRightOpen size={14} />
                <span>{((perspective === 'equipo' && ['organigrama', 'sedes', 'carga'].includes(viewMode)) ? Boolean(equipoSelectedId) : panelOpen) ? 'Ocultar Detalle' : 'Ver Detalle'}</span>
              </button>
              <button
                className="btn secondary"
                style={{ minHeight: '32px', fontSize: '12px' }}
                onClick={() => notify('Cronograma maestro sincronizado con el equipo')}
              >
                <CheckCircle2 size={14} color="#16a34a" />
                <span>Publicar Cronograma</span>
              </button>
            </div>
          </footer>
        </ProjectShellWorkspace>

        {/* Modales y Drawer Exclusivos de la Perspectiva Equipo */}
        {perspective === 'equipo' && (
          <>
            {equipoSelectedIntegrante && (
              <EquipoDrawer
                integrante={equipoSelectedIntegrante}
                onClose={() => setEquipoSelectedId(null)}
                onUpdateIntegrante={handleUpdateIntegrante}
                onOpenExpediente={(i) => setEquipoExpediente(i)}
                sedes={equipoSedes}
                asignaciones={equipoAsignaciones}
              />
            )}

            <EquipoExpedienteModal
              isOpen={Boolean(equipoExpediente)}
              onClose={() => setEquipoExpediente(null)}
              integrante={equipoExpediente}
              onUpdateIntegrante={handleUpdateIntegrante}
              sedes={equipoSedes}
              areas={equipoAreas}
              asignaciones={equipoAsignaciones}
            />

            <EquipoNuevoModal
              isOpen={isEquipoNuevoOpen}
              onClose={() => setIsEquipoNuevoOpen(false)}
              onSave={handleCreateIntegrante}
              sedes={equipoSedes}
              areas={equipoAreas}
            />
          </>
        )}

        {/* Modal Oficial de Registro de Sede Territorial / Unidad Operativa */}
        <SedeNuevaModal
          isOpen={isSedeNuevaOpen}
          onClose={() => setIsSedeNuevaOpen(false)}
          onSave={handleCreateSede}
          unidadesExistentes={unidades}
        />

        {/* Panel Lateral Editor Aislado y Memoizado (Cero re-renders en el Gantt al escribir) */}
        <GanttEditorDrawer
          panelOpen={panelOpen}
          selectedItem={selected ?? null}
          isNewDraft={isNewDraft}
          items={items}
          hitos={hitos}
          currentTodayIso={currentTodayIso}
          onSave={(updated, isNew) => {
            if (isNew) {
              commitChange((old) =>
                updated.kind === 'subproceso' && updated.parentId
                  ? old.flatMap((x) => (x.id === updated.parentId ? [x, updated] : [x]))
                  : [...old, updated]
              );
              notify(`Nuevo ${updated.kind === 'hito' ? 'componente' : 'subcomponente'} guardado con éxito en el cronograma maestro`);
            } else {
              commitChange((old) => old.map((x) => (x.id === updated.id ? applyActuals(x, updated, currentTodayIso) : x)));
              notify('Cambios guardados con éxito en el cronograma maestro');
            }
            setPanelOpen(false);
            setIsNewDraft(false);
          }}
          onClose={() => {
            setPanelOpen(false);
            setIsNewDraft(false);
          }}
          onDeleteItem={(item) => {
            setSelectedId(item.id);
            setDeleteConfirmModalOpen(true);
          }}
          onAddSubItem={(kind, parentId) => add(kind, parentId)}
          onSelectSubItem={(it) => openEditorForItem(it)}
          onSelectItem={(id) => setSelectedId(id)}
          notify={notify}
           activeProject={activeProject}
           onToggleSuccessor={(sourceId, successorId, shouldAdd) => {
             commitChange((old) =>
               old.map((it) => {
                 if (it.id !== successorId) return it;
                 const deps = new Set(it.dependencies || []);
                 if (shouldAdd) deps.add(sourceId);
                 else deps.delete(sourceId);
                 return { ...it, dependencies: Array.from(deps) };
               })
             );
           }}
            onOpenFullDetail={(item) => {
              setPanelOpen(false);
              window.history.pushState({}, '', `/hub/gestor_proyectos/proyecto/gantt/elemento/${encodeURIComponent(item.id)}`);
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
         />

                {/* Modal Institucional: Confirmar Eliminación de Hito / Subproceso */}
        {deleteConfirmModalOpen && activeItem && (
          <div
            className="overlay"
            style={{ zIndex: 99999 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setDeleteConfirmModalOpen(false);
            }}
          >
            <div className="unsaved-alert-modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: '#fee2e2',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#dc2626',
                    flexShrink: 0,
                  }}
                >
                  <Trash2 size={22} />
                </div>
                <div>
                  <h3 style={{ margin: '2px 0 4px', fontSize: '16.5px', fontWeight: 750, color: '#0f172a' }}>
                    ¿Eliminar {activeItem.kind === 'hito' ? 'componente' : 'subcomponente'}?
                  </h3>
                  <small style={{ fontSize: '12px', color: '#64748b' }}>
                    Esta acción retirará el registro y sus dependencias directas del cronograma maestro.
                  </small>
                </div>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
                Estás a punto de eliminar permanentemente <b>"{activeItem.code} {activeItem.name}"</b>.
                {activeItem.kind === 'hito' && (
                  <span> Todos los subcomponentes y actividades vinculadas a este componente también serán removidos.</span>
                )}
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ height: '38px', padding: '0 16px', fontSize: '12.5px', fontWeight: 600 }}
                  onClick={() => setDeleteConfirmModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  style={{
                    height: '38px',
                    padding: '0 18px',
                    background: '#dc2626',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 650,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'background 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = '#b91c1c')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = '#dc2626')}
                  onClick={handleConfirmDelete}
                >
                  <Trash2 size={14} />
                  <span>Eliminar definitivamente</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Institucional: Nueva Tarea Vinculada */}
        {createTaskModalOpen && (
          <div
            className="overlay"
            style={{ zIndex: 99999 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setCreateTaskModalOpen(false);
            }}
          >
            <div className="unsaved-alert-modal" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '16px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1d4ed8', flexShrink: 0 }}>
                  <CheckSquare size={22} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Nueva Tarea Operativa
                  </h3>
                  <small style={{ fontSize: '12px', color: '#64748b', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Vinculada a: <b>{taskModalMilestone}</b>
                  </small>
                </div>
                <button
                  type="button"
                  style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                  onClick={() => setCreateTaskModalOpen(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>
                    Título de la Tarea *
                  </label>
                  <input
                    autoFocus
                    value={newTaskForm.title}
                    onChange={(e) => setNewTaskForm((p) => ({ ...p, title: e.target.value }))}
                    placeholder="Ej. Elaborar informe técnico, coordinar entregas o validar requerimientos..."
                    style={{
                      width: '100%',
                      height: '36px',
                      borderRadius: '6px',
                      border: '1px solid #cbd5e1',
                      padding: '0 10px',
                      fontSize: '12.5px',
                      boxSizing: 'border-box',
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleConfirmCreateTask();
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>
                      Responsable
                    </label>
                    <div className="filter-dropdown-wrap" style={{ position: 'relative' }}>
                      <button
                        type="button"
                        className={`filter-card-btn ${taskOwnerOpen ? 'active' : ''}`}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaskPriorityOpen(false);
                          setNewTaskCalOpen(false);
                          setTaskOwnerOpen((v) => !v);
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {newTaskForm.owner}
                        </span>
                        <ChevronDown
                          size={14}
                          className="filter-chevron"
                          style={{
                            transform: taskOwnerOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.15s ease',
                            color: '#64748b',
                            flexShrink: 0,
                            marginLeft: 6,
                          }}
                        />
                      </button>
                      {taskOwnerOpen && (
                        <div
                          className="filter-card-popover"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 9999,
                            marginTop: '4px',
                            maxHeight: '180px',
                            overflowY: 'auto',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="filter-popover-title">Responsable de Tarea</div>
                          {GESTOR_OPTIONS.filter((g) => g.value !== 'Todos').map((g) => {
                            const isSelected = newTaskForm.owner === g.value;
                            return (
                              <button
                                key={g.value}
                                type="button"
                                className={`filter-item-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  setNewTaskForm((p) => ({ ...p, owner: g.value }));
                                  setTaskOwnerOpen(false);
                                }}
                                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                              >
                                <span style={{ fontSize: '12px' }}>{g.label}</span>
                                {isSelected && <Check size={14} className="item-check" style={{ color: '#0284c7', flexShrink: 0 }} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  <div style={{ position: 'relative' }}>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>
                      Prioridad
                    </label>
                    <div className="filter-dropdown-wrap" style={{ position: 'relative' }}>
                      <button
                        type="button"
                        className={`filter-card-btn ${taskPriorityOpen ? 'active' : ''}`}
                        style={{
                          width: '100%',
                          height: '36px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          borderRadius: '6px',
                          padding: '0 10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setTaskOwnerOpen(false);
                          setNewTaskCalOpen(false);
                          setTaskPriorityOpen((v) => !v);
                        }}
                      >
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                          {newTaskForm.priority}
                        </span>
                        <ChevronDown
                          size={14}
                          className="filter-chevron"
                          style={{
                            transform: taskPriorityOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.15s ease',
                            color: '#64748b',
                            flexShrink: 0,
                            marginLeft: 6,
                          }}
                        />
                      </button>
                      {taskPriorityOpen && (
                        <div
                          className="filter-card-popover"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 9999,
                            marginTop: '4px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="filter-popover-title">Nivel de Prioridad</div>
                          {(['Alta', 'Media', 'Baja'] as const).map((prio) => {
                            const isSelected = newTaskForm.priority === prio;
                            return (
                              <button
                                key={prio}
                                type="button"
                                className={`filter-item-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  setNewTaskForm((p) => ({ ...p, priority: prio }));
                                  setTaskPriorityOpen(false);
                                }}
                                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                              >
                                <span style={{ fontSize: '12px' }}>{prio}</span>
                                {isSelected && <Check size={14} className="item-check" style={{ color: '#0284c7', flexShrink: 0 }} />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{ position: 'relative' }}>
                  <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 650, color: '#334155', marginBottom: '4px' }}>
                    Fecha Límite
                  </label>
                  <button
                    type="button"
                    className={`custom-date-btn ${newTaskCalOpen ? 'active' : ''}`}
                    style={{
                      width: '100%',
                      height: '36px',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      borderRadius: '6px',
                      padding: '0 10px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskOwnerOpen(false);
                      setTaskPriorityOpen(false);
                      setNewTaskCalOpen((v) => !v);
                    }}
                  >
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#0f172a' }}>
                      {formatDatePE(newTaskForm.due)}
                    </span>
                    <CalendarDays size={14} className="date-btn-icon" style={{ color: '#64748b' }} />
                  </button>
                  {newTaskCalOpen && (
                    <MiniCalendar
                      value={newTaskForm.due}
                      onChange={(newDate) => {
                        setNewTaskForm((p) => ({ ...p, due: newDate }));
                        setNewTaskCalOpen(false);
                      }}
                      onClose={() => setNewTaskCalOpen(false)}
                      align="left"
                    />
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ height: '34px', padding: '0 14px', fontSize: '12px' }}
                  onClick={() => setCreateTaskModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn primary"
                  style={{ height: '34px', padding: '0 16px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                  onClick={handleConfirmCreateTask}
                >
                  <Plus size={14} />
                  <span>Crear Tarea</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal para Importar Cronograma Oficial */}
        {importOpen && (
          <div
            className="overlay"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) setImportOpen(false);
            }}
          >
            <div className="import-modal">
              <button className="modal-x" onClick={() => setImportOpen(false)}>
                <X size={16} />
              </button>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: '#e0f2fe',
                  color: '#0284c7',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: 14,
                }}
              >
                <FileUp size={22} />
              </div>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                Importar Cronograma desde Cero
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 16px', lineHeight: 1.5 }}>
                Sube el archivo de cronograma o plan de trabajo (PDF, Excel o CSV) para vincularlo como base de los hitos del proyecto.
              </p>
              <button className="drop" onClick={() => fileRef.current?.click()}>
                <Upload size={24} />
                <b style={{ fontSize: '13px' }}>{pickedFile || 'Arrastra un archivo o haz clic aquí'}</b>
                <small style={{ fontSize: '11px', color: '#64748b' }}>PDF, Excel, Word o CSV</small>
              </button>
              <div
                style={{
                  marginTop: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  borderRadius: 8,
                  border: '1px solid #e2e8f0',
                }}
              >
                <div>
                  <b style={{ fontSize: '12px', color: '#1e293b', display: 'block' }}>¿No tienes la plantilla de cronograma?</b>
                  <small style={{ fontSize: '11px', color: '#64748b' }}>Descarga la plantilla estructurada para completar en Excel</small>
                </div>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ height: 28, fontSize: '11px', padding: '0 10px', gap: 6 }}
                  onClick={exportExcelTemplate}
                >
                  <FileSpreadsheet size={13} />
                  <span>Descargar Plantilla</span>
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  fontSize: '12px',
                  color: '#64748b',
                  marginTop: 14,
                }}
              >
                <HelpCircle size={15} />
                <span>El archivo se vinculará como sustento rector visible para los gestores.</span>
              </div>
              <div className="modal-actions">
                <button className="btn secondary" onClick={() => setImportOpen(false)}>
                  Cancelar
                </button>
                <button
                  className="btn primary"
                  onClick={() => {
                    if (pickedFile) setAttachment(pickedFile);
                    setImportOpen(false);
                    notify(
                      pickedFile
                        ? 'Cronograma oficial importado y vinculado con éxito'
                        : 'Selecciona un archivo para continuar'
                    );
                  }}
                >
                  <Check size={15} />
                  <span>Confirmar Referencia</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal Centrado Ergonómico: Crear Campo Personalizado (Fiel a HubPro) */}
        {newColModalOpen && (
          <div className="custom-col-modal-backdrop" onClick={() => setNewColModalOpen(false)}>
            <div className="custom-col-modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="custom-col-modal-header">
                <div className="custom-col-modal-title-box">
                  <div className="custom-col-modal-icon-badge">
                    <FileSpreadsheet size={20} />
                  </div>
                  <div className="custom-col-modal-title-text">
                    <h3>Crear campo personalizado</h3>
                    <p>Agrega un nuevo campo al cronograma del proyecto.</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="custom-col-modal-close-btn"
                  onClick={() => setNewColModalOpen(false)}
                  title="Cerrar ventana"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="custom-col-modal-body">
                <div className="custom-col-form-row">
                  <div className="custom-col-form-group">
                    <label className="custom-col-label">
                      Nombre del campo <span className="req">*</span>
                    </label>
                    <input
                      type="text"
                      className="custom-col-input"
                      placeholder="Código de referencia"
                      value={newColLabel}
                      onChange={(e) => setNewColLabel(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateCustomCol();
                        if (e.key === 'Escape') setNewColModalOpen(false);
                      }}
                      autoFocus
                    />
                  </div>

                  <div className="custom-col-form-group">
                    <label className="custom-col-label">
                      Tipo de dato <span className="req">*</span>
                    </label>
                    <div className="custom-col-select-wrap">
                      <select
                        className="custom-col-select"
                        value={newColType}
                        onChange={(e) => setNewColType(e.target.value as any)}
                      >
                        <option value="text">Texto</option>
                        <option value="number">Número</option>
                        <option value="percent">Porcentaje (%)</option>
                        <option value="select">Etiqueta / Estado</option>
                        <option value="date">Fecha</option>
                        <option value="person">Persona / Responsable</option>
                      </select>
                      <ChevronDown size={14} className="custom-col-select-chevron" />
                    </div>
                  </div>
                </div>

                <div className="custom-col-checkbox-group">
                  <label className="custom-col-checkbox-label">
                    <input
                      type="checkbox"
                      checked={newColRequired}
                      onChange={(e) => setNewColRequired(e.target.checked)}
                    />
                    <span>Obligatorio</span>
                  </label>

                  <label className="custom-col-checkbox-label">
                    <input
                      type="checkbox"
                      checked={newColShowInList}
                      onChange={(e) => setNewColShowInList(e.target.checked)}
                    />
                    <span>Mostrar en la vista Lista</span>
                  </label>

                  <label className="custom-col-checkbox-label" title="Encapsular valores dentro de una etiqueta o tarjeta de color">
                    <input
                      type="checkbox"
                      checked={newColEncapsular}
                      onChange={(e) => setNewColEncapsular(e.target.checked)}
                    />
                    <span>Encapsular valores (tarjeta/etiqueta)</span>
                  </label>
                </div>

                <div className="custom-col-radio-section">
                  <label className="custom-col-label">
                    Aplica a <span className="req">*</span>
                  </label>
                  <div className="custom-col-radio-group">
                    <label className="custom-col-radio-label">
                      <input
                        type="radio"
                        name="colAppliesTo"
                        value="all"
                        checked={newColAppliesTo === 'all'}
                        onChange={() => setNewColAppliesTo('all')}
                      />
                      <span>Componentes y subcomponentes</span>
                    </label>

                    <label className="custom-col-radio-label">
                      <input
                        type="radio"
                        name="colAppliesTo"
                        value="hitos"
                        checked={newColAppliesTo === 'hitos'}
                        onChange={() => setNewColAppliesTo('hitos')}
                      />
                      <span>Solo componentes</span>
                    </label>

                    <label className="custom-col-radio-label">
                      <input
                        type="radio"
                        name="colAppliesTo"
                        value="subprocesos"
                        checked={newColAppliesTo === 'subprocesos'}
                        onChange={() => setNewColAppliesTo('subprocesos')}
                      />
                      <span>Solo subcomponentes</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="custom-col-modal-footer">
                <button
                  type="button"
                  className="btn secondary custom-col-btn-cancel"
                  onClick={() => setNewColModalOpen(false)}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn primary custom-col-btn-submit"
                  onClick={handleCreateCustomCol}
                  disabled={!newColLabel.trim()}
                >
                  Crear campo
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notificación Toast */}
        {toast && (
          <div className="toast">
            <CheckCircle2 size={16} color="#4ade80" />
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
