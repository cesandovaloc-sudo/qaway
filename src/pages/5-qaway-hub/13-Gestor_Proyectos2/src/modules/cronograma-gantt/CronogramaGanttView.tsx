// @ts-nocheck
import React, { useMemo, useRef, useState, useEffect } from 'react';
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
import CronogramaKanbanView from './CronogramaKanbanView';
import CronogramaListaView from './CronogramaListaView';
import CronogramaCalendarioView from './CronogramaCalendarioView';
import { CronogramaArbolView } from './CronogramaArbolView';
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
  AlertTriangle,
  ArrowLeftRight,
  ArrowRight,
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
  FolderKanban,
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
  X
} from 'lucide-react';

export type Status = 'Completado' | 'En curso' | 'En proceso' | 'Pendiente' | 'Con retraso' | 'Cumple';
type Kind = 'hito' | 'subproceso';
type ColKey = 'name' | 'code' | 'kind' | 'parent' | 'start' | 'end' | 'duration' | 'progress' | 'status' | 'gestor' | 'region' | 'distrito' | 'sede' | 'deviation' | 'actualEnd' | 'actions' | (string & {});
type EditField = ColKey;

export type DeliverableType = 'document' | 'spreadsheet' | 'presentation' | 'link' | 'physical';

export interface DeliverableItem {
  id: string;
  name: string;
  type: DeliverableType;
  url?: string;
  fileName?: string;
}

export interface AttachmentItem {
  id: string;
  name: string;
  date: string;
  url?: string;
  type?: string;
}

export interface Item {
  id: string;
  code: string;
  name: string;
  kind: Kind;
  /** Clasificación metodológica formal PMI/PMBOK de la EDT/WBS */
  edtType?: EdtNodeType;
  /** Contenedor macro de ciclo de vida temporal (opcional / nullable) */
  faseId?: string | null;
  parentId?: string;
  children?: Item[];
  start: string;
  end: string;
  progress: number;
  status: Status;
  expanded?: boolean;
  description?: string;
  deliverable?: string;
  deliverables?: DeliverableItem[];
  attachments?: AttachmentItem[];
  reportType?: string;
  region?: string;
  distrito?: string;
  sede?: string;
  gestor?: string;
  gestores?: string[];
  tasks?: number;
  done?: number;
  unit?: string;
  phase?: string | null;
  /** Línea base aprobada (fechas originales contra las que se mide la desviación). */
  baselineStart?: string;
  baselineEnd?: string;
  /** Fechas reales de ejecución (se registran al iniciar/completar; editables). */
  actualStart?: string;
  actualEnd?: string;
  /** Tareas o hitos predecesores en la cadena de prelación / ruta crítica. */
  dependencies?: string[];
}

const INITIAL_ITEMS: Item[] = sortWbsHierarchy(DRE_JUNIN_DOTACION_2027_EDT.map((r) => ({
  id: r.id,
  code: r.code,
  name: r.name,
  kind: r.kind,
  edtType: r.edtType,
  faseId: r.faseId,
  parentId: r.parentId,
  start: r.start,
  end: r.end,
  progress: r.kind === 'hito' ? 18 : (r.code === '1.1' || r.code === '2.1' ? 100 : (r.code.startsWith('1.') ? 50 : 0)),
  status: r.code === '1.1' || r.code === '2.1' ? 'Completado' : (r.code.startsWith('1.') ? 'En proceso' : 'Pendiente'),
  expanded: true,
  description: r.entregableVerificable ? `Entregable oficial: ${r.entregableVerificable}` : '',
  deliverable: r.entregableVerificable || '',
  deliverables: r.entregableVerificable ? [{
    id: `deliv-${r.id}`,
    name: r.entregableVerificable,
    type: r.entregableVerificable.toLowerCase().includes('resolución') || r.entregableVerificable.toLowerCase().includes('informe') || r.entregableVerificable.toLowerCase().includes('oficio') ? 'document' : (r.entregableVerificable.toLowerCase().includes('excel') || r.entregableVerificable.toLowerCase().includes('directorio') || r.entregableVerificable.toLowerCase().includes('cuadro') ? 'spreadsheet' : 'document'),
  }] : [],
  region: 'Junín',
  gestor: r.entidadResponsable || 'Carlos Mendoza',
  gestores: [r.entidadResponsable || 'Carlos Mendoza'],
})));

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

const STATUS_CLASS: Record<Status, string> = {
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
  { value: 'Carlos Mendoza', label: 'Carlos Mendoza' },
  { value: 'María Salazar', label: 'María Salazar' },
  { value: 'Lucía Ramos', label: 'Lucía Ramos' },
  { value: 'Javier Ruiz', label: 'Javier Ruiz' },
];

const GESTOR_COLORS: Record<string, string> = {
  'María Salazar': '#2563eb',
  'Carlos Mendoza': '#0284c7',
  'Lucía Ramos': '#7c3aed',
  'Javier Ruiz': '#059669',
};

const getGestorInitials = (name: string): string => {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getGestorColor = (name: string): string => {
  if (GESTOR_COLORS[name]) return GESTOR_COLORS[name];
  const colors = ['#2563eb', '#0284c7', '#7c3aed', '#059669', '#d97706', '#dc2626'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash += name.charCodeAt(i);
  return colors[Math.abs(hash) % colors.length];
};

const getItemGestores = (item: Item): string[] => {
  if (item.gestores && item.gestores.length > 0) return item.gestores;
  if (item.gestor) return [item.gestor];
  return [];
};

const TYPE_OPTIONS = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Hitos', label: 'Solo Componentes' },
  { value: 'Subprocesos', label: 'Solo Subcomponentes' },
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

const CANONICAL_COLS: ColKey[] = ['code', 'name', 'kind', 'parent', 'start', 'end', 'duration', 'progress', 'deviation', 'status', 'gestor', 'region', 'actualEnd', 'actions'];

const DEFAULT_COLS: Record<string, number> = {
  code: 80,
  name: 440,
  kind: 110,
  parent: 160,
  start: 125,
  end: 125,
  duration: 105,
  progress: 130,
  status: 125,
  gestor: 165,
  region: 140,
  deviation: 120,
  actualEnd: 130,
  actions: 80,
};

const MIN_COLS: Record<string, number> = {
  code: 60,
  name: 200,
  kind: 80,
  parent: 90,
  start: 90,
  end: 90,
  duration: 80,
  progress: 100,
  status: 90,
  gestor: 110,
  region: 95,
  deviation: 90,
  actualEnd: 100,
  actions: 60,
};

const ALL_COL_META: { key: ColKey; label: string; fixed?: boolean }[] = [
  { key: 'name', label: 'Componente / Subcomponente', fixed: true },
  { key: 'code', label: 'Código' },
  { key: 'kind', label: 'Tipo' },
  { key: 'parent', label: 'Componente padre' },
  { key: 'start', label: 'Inicio' },
  { key: 'end', label: 'Fin' },
  { key: 'duration', label: 'Duración' },
  { key: 'progress', label: 'Avance' },
  { key: 'deviation', label: 'Desviación' },
  { key: 'status', label: 'Estado' },
  { key: 'gestor', label: 'Responsable' },
  { key: 'region', label: 'Ámbito' },
  { key: 'actualEnd', label: 'Fecha real' },
  { key: 'actions', label: 'Acciones' },
];

// Preset inicial y predeterminado para vista Gantt (7 columnas compactas alineadas con la línea de tiempo)
const GANTT_PRESET_COLS: ColKey[] = ['name', 'start', 'end', 'duration', 'progress', 'status', 'gestor'];
// Preset inicial y predeterminado para vista Lista (14 columnas canónicas completas ordenadas)
const LISTA_PRESET_COLS: ColKey[] = [...CANONICAL_COLS];
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
  { id: 'name', label: 'Componente / Subcomponente', type: 'text', accessor: (r) => `${r?.code ?? ''} ${r?.name ?? ''}`.trim() },
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
  { id: 'gestor', label: 'Responsable', type: 'person', accessor: (r) => (r ? getItemGestores(r) : []), emptyLabel: 'Sin asignar' },
  { id: 'region', label: 'Región', type: 'select', accessor: (r) => r?.region },
  { id: 'distrito', label: 'Distrito', type: 'select', accessor: (r) => r?.distrito },
  { id: 'sede', label: 'Sede', type: 'select', accessor: (r) => r?.sede },
  { id: 'code', label: 'Código', type: 'text', accessor: (r) => r?.code ?? '' },
  { id: 'kind', label: 'Tipo', type: 'select', accessor: (r) => (r ? getEdtNodeDisplayLabel(r) : 'Subcomponente') },
  { id: 'parent', label: 'Componente padre', type: 'text', accessor: (r) => r?.parentId ?? '' },
];

const formatDate = (s: string) =>
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

function MiniCalendar({
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
          const isDisabled = (min && item.iso < min) || (max && item.iso > max);
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
}: {
  onActions?: (h: any) => void;
  onSwitchPerspective?: (p: 'maestro' | 'territorial') => void;
  activeProject?: {
    id: string;
    code: string;
    name: string;
    region: string;
    subtext?: string;
  };
}) {
  const projectId = activeProject?.id || 'p1';
  const currentPidRef = useRef(projectId);

  const loadProjectItems = (pid: string): Item[] => {
    try {
      const saved = localStorage.getItem(`qaway-gantt-items-${pid}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (pid !== 'p1') {
            const isPolluted = parsed.some((it) => it.id === 's11' || it.code === '1.1');
            if (isPolluted) {
              localStorage.setItem(`qaway-gantt-items-${pid}`, JSON.stringify([]));
              return [];
            }
          } else {
            // Detectar si el proyecto activo p1 contiene datos obsoletos de prueba (h1..h5, s11..s52, 'Nuevo hito', 'Nuevo subproceso', huérfanos)
            const hasLegacyMocks = parsed.some(
              (it) =>
                isLegacyCronogramaItem(it) ||
                (Boolean(it.parentId) && !parsed.some((p) => p.id === it.parentId))
            );
            if (hasLegacyMocks || parsed.length !== 62 || !parsed.some((it) => it.id === 'comp-11')) {
              // Limpieza y migración automática y definitiva a los 62 registros oficiales del Excel DRE Junín
              try {
                localStorage.setItem('qaway-gantt-items-p1', JSON.stringify(INITIAL_ITEMS));
                localStorage.removeItem('qaway-collapsed-by-mode-v1');
              } catch {}
              return INITIAL_ITEMS;
            }
          }
          // Sincronizar dependencias maestras para ítems persistidos sin campo dependencies
          const initialMap = new Map(INITIAL_ITEMS.map((x) => [x.id, x]));
          const upgraded = parsed.map((it: Item) => {
            const init = initialMap.get(it.id);
            return {
              ...it,
              edtType: it.edtType || init?.edtType || resolveEdtNodeType(it, parsed),
              faseId: it.faseId !== undefined ? it.faseId : (init?.faseId ?? null),
              dependencies: (it.dependencies && it.dependencies.length > 0)
                ? it.dependencies
                : (init?.dependencies || []),
            };
          });
          return sortWbsHierarchy(upgraded);
        }
      }
      if (pid === 'p1') {
        try {
          localStorage.setItem('qaway-gantt-items-p1', JSON.stringify(INITIAL_ITEMS));
          localStorage.removeItem('qaway-collapsed-by-mode-v1');
        } catch {
          /* fallback */
        }
        return INITIAL_ITEMS;
      }
      return []; // Nuevo proyecto siempre inicia completamente vacío / calato
    } catch {
      return pid === 'p1' ? INITIAL_ITEMS : [];
    }
  };

  const [items, setItems] = useState<Item[]>(() => loadProjectItems(projectId));

  // Sincronización reactiva con Keep-Alive al conmutar de proyecto
  useEffect(() => {
    if (currentPidRef.current !== projectId) {
      currentPidRef.current = projectId;
      const loaded = loadProjectItems(projectId);
      setItems(loaded);
      setSelectedId(null);
    }
  }, [projectId]);

  // Autocuración y persistencia inmediata de dependencias si provienen de caché anterior sin dependencias
  useEffect(() => {
    const hasAnyDep = items.some((it) => it.dependencies && it.dependencies.length > 0);
    if (!hasAnyDep && items.length > 0) {
      const initialMap = new Map(INITIAL_ITEMS.map((x) => [x.id, x]));
      setItems((prev) =>
        prev.map((it) => {
          const init = initialMap.get(it.id);
          return {
            ...it,
            dependencies: it.dependencies && it.dependencies.length > 0 ? it.dependencies : (init?.dependencies || []),
          };
        })
      );
    }
  }, [items]);

  // Carga asíncrona de datos desde Supabase (respaldo en nube permanente)
  useEffect(() => {
    let isCancelled = false;
    fetchCronogramaFromSupabase(projectId).then((cloudItems) => {
      if (!isCancelled && cloudItems && cloudItems.length > 0) {
        // Filtrar datos contaminados obsoletos si provienen de sesiones anteriores en BD y ordenar canónicamente
        const cleanCloudItems = sortWbsHierarchy(
          cloudItems.filter(
            (it) =>
              !isLegacyCronogramaItem(it) &&
              (!it.parentId || cloudItems.some((p) => p.id === it.parentId))
          ) as Item[]
        );
        if (cleanCloudItems.length >= 50) {
          setItems(cleanCloudItems);
        }
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [projectId]);

  // Persistencia segura por proyecto activo (Doble capa: LocalStorage inmediato + Sincronización Supabase)
  useEffect(() => {
    if (currentPidRef.current === projectId) {
      try {
        localStorage.setItem(`qaway-gantt-items-${projectId}`, JSON.stringify(items));
      } catch {
        /* fallback */
      }
      if (items.length > 0) {
        syncAllCronogramaItemsToSupabase(projectId, items as GanttItemData[]);
      }
    }
  }, [items, projectId]);

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
      const saved = JSON.parse(localStorage.getItem('qaway-gantt-cols-v4') || 'null');
      if (saved && typeof saved === 'object') {
        const merged: Record<ColKey, number> = { ...DEFAULT_COLS };
        (Object.keys(DEFAULT_COLS) as ColKey[]).forEach((k) => {
          if (typeof saved[k] === 'number' && saved[k] >= MIN_COLS[k]) merged[k] = saved[k];
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
  const [newDelivType, setNewDelivType] = useState<DeliverableType>('document');
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
    owner: 'Carlos Mendoza',
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
      owner: activeItem?.gestor || 'Carlos Mendoza',
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
  const [history, setHistory] = useState<Item[][]>([]);
  const [redoHistory, setRedoHistory] = useState<Item[][]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const workspaceRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'gantt' | 'lista' | 'kanban' | 'calendario' | 'arbol'>('gantt');
  const [tab, setTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
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

  const regionButtonText = useMemo(() => {
    if (selectedRegions.length === 0) return 'Todas';
    if (selectedRegions.length === 1) return selectedRegions[0];
    if (selectedRegions.length === 2) return `${selectedRegions[0]}, ${selectedRegions[1]}`;
    return `${selectedRegions.length} regiones`;
  }, [selectedRegions]);
  const [phaseFilter, setPhaseFilter] = useState('Todas');
  const [gestorFilter, setGestorFilter] = useState('Todos');
  const [rangeFrom, setRangeFrom] = useState(RANGE_MIN);
  const [rangeTo, setRangeTo] = useState(RANGE_MAX);
  const [listaTemporalFilter, setListaTemporalFilter] = useState<'Todos' | 'Hoy' | 'Semana' | 'Mes' | 'Trimestre'>('Todos');
  const [zoom, setZoom] = useState('Mes');
  const [currentTodayIso, setCurrentTodayIso] = useState<string>(getSystemTodayIso);
  const [hoveredTask, setHoveredTask] = useState<{
    item: Item;
    x: number;
    y: number;
  } | null>(null);
  const [showBarLabels, setShowBarLabels] = useState(false);
  const [showBaseline, setShowBaseline] = useState(false);
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
  
  type FilterMenuKey = 'region' | 'gestor' | 'state' | 'type' | 'dates' | null;
  const [activeMenu, setActiveMenu] = useState<FilterMenuKey>(null);
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
  }

  const [customCols, setCustomCols] = useState<CustomColDef[]>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('qaway-custom-cols-v1') || '[]');
      return Array.isArray(saved) ? saved : [];
    } catch {
      return [];
    }
  });

  const [newColModalOpen, setNewColModalOpen] = useState(false);
  const [newColLabel, setNewColLabel] = useState('');
  const [newColType, setNewColType] = useState<CustomColDef['type']>('text');
  const [newColRequired, setNewColRequired] = useState(false);
  const [newColShowInList, setNewColShowInList] = useState(true);
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
    };
    const updated = [...customCols, newCol];
    setCustomCols(updated);
    try {
      localStorage.setItem('qaway-custom-cols-v1', JSON.stringify(updated));
    } catch {}

    const isLista = viewMode === 'lista';
    const storageKey = isLista ? 'qaway-visible-cols-lista-v3' : 'qaway-visible-cols-gantt-v3';

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
        localStorage.setItem('qaway-gantt-cols-v4', JSON.stringify(next));
      } catch {}
      return next;
    });

    setNewColLabel('');
    setNewColType('text');
    setNewColRequired(false);
    setNewColShowInList(true);
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
        localStorage.setItem('qaway-gantt-cols-v4', JSON.stringify(next));
      } catch {}
      return next;
    });
    notify(`Columna restablecida a ancho óptimo (${defaultW}px)`);
  };

  // Arquitectura Notion: Cada vista (Gantt o Lista) tiene su propio preset de columnas visibles
  const loadSavedCols = (mode: string): ColKey[] => {
    if (mode === 'gantt') {
      try {
        const saved = JSON.parse(localStorage.getItem('qaway-visible-cols-gantt-v3') || 'null');
        if (Array.isArray(saved) && saved.length > 0 && saved.includes('name') && !saved.includes('code') && saved.length <= 6) {
          return saved;
        }
      } catch {}
      // En modo Gantt, el lienzo temporal es protagonista absoluto: inicia en vista compacta con solo 'name'
      return ['name'];
    }
    try {
      const storageKey = 'qaway-visible-cols-lista-v3';
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
  const handleViewModeChange = (newMode: 'gantt' | 'lista' | 'kanban' | 'calendario' | 'arbol') => {
    if (newMode === viewMode) return;
    try {
      if (viewMode === 'lista' && visibleCols.includes('code')) {
        localStorage.setItem('qaway-visible-cols-lista-v3', JSON.stringify(visibleCols));
      } else if (viewMode === 'gantt' && !visibleCols.includes('code') && visibleCols.length <= 6) {
        localStorage.setItem('qaway-visible-cols-gantt-v3', JSON.stringify(visibleCols));
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
        localStorage.setItem('qaway-visible-cols-lista-v3', JSON.stringify(visibleCols));
      } else if (prevViewModeRef.current === 'gantt' && !visibleCols.includes('code') && visibleCols.length <= 6) {
        localStorage.setItem('qaway-visible-cols-gantt-v3', JSON.stringify(visibleCols));
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
        localStorage.setItem('qaway-visible-cols-lista-v3', JSON.stringify(visibleCols));
      } else if (viewMode === 'gantt' && !visibleCols.includes('code') && visibleCols.length <= 6) {
        localStorage.setItem('qaway-visible-cols-gantt-v3', JSON.stringify(visibleCols));
      }
    } catch {
      /* almacenamiento no disponible */
    }
  }, [visibleCols, viewMode]);

  const ganttColumns = useMemo<ColumnDef<Item>[]>(
    () => [
      ...GANTT_COLUMNS,
      { id: 'deviation', label: 'Desviación', type: 'number', accessor: (r) => (r ? getDeviationDays(r, currentTodayIso) : undefined) },
      { id: 'actualEnd', label: 'Fecha real', type: 'date', accessor: (r) => r?.actualEnd },
      ...customCols.map((c) => ({
        id: c.key,
        label: c.label,
        type: (c.type === 'percent' ? 'percent' : c.type === 'number' ? 'number' : c.type === 'date' ? 'date' : c.type === 'person' ? 'person' : c.type === 'select' ? 'select' : 'text') as any,
        accessor: (r: Item) => (r as any)?.[c.key],
      })),
    ],
    [currentTodayIso, customCols]
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
      name: isLista ? 440 : 300,
      kind: 110,
      parent: 160,
      start: 125,
      end: 125,
      duration: 105,
      progress: 130,
      status: 125,
      gestor: 165,
      region: 140,
      deviation: 120,
      actualEnd: 130,
      actions: 80,
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
      const storageKey = isLista ? 'qaway-visible-cols-lista-v3' : 'qaway-visible-cols-gantt-v3';
      localStorage.setItem(storageKey, JSON.stringify(pristineCols));
      localStorage.setItem('qaway-gantt-cols-v4', JSON.stringify(calibratedWidths));
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


  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(''), 2600);
  };

  useEffect(() => {
    onActions?.({ notify: (m: string) => notify(m) });
  }, [onActions]);

  /* ---------- Historial de Deshacer y Rehacer (Buildern standard) ---------- */
  const commitChange = (nextOrUpdater: Item[] | ((prev: Item[]) => Item[])) => {
    setItems((prev) => {
      const next = typeof nextOrUpdater === 'function' ? nextOrUpdater(prev) : nextOrUpdater;
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        setHistory((h) => [prev, ...h].slice(0, 30));
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
    setRedoHistory((r) => [items, ...r].slice(0, 30));
    setItems(previous);
    setHistory(rest);
    notify('Cambio deshecho con éxito');
  };

  const handleRedo = () => {
    if (redoHistory.length === 0) {
      notify('No hay cambios posteriores para rehacer');
      return;
    }
    const [next, ...rest] = redoHistory;
    setHistory((h) => [items, ...h].slice(0, 30));
    setItems(next);
    setRedoHistory(rest);
    notify('Cambio rehecho con éxito');
  };

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
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        const target = e.target as HTMLElement | null;
        const isEditingInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA');
        if (!isEditingInput) {
          e.preventDefault();
          handleUndo();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [history]);

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
        localStorage.setItem('qaway-gantt-cols-v4', JSON.stringify(colRef.current));
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
    const validCanonical = CANONICAL_COLS.filter((k) => visibleCols.includes(k));
    const validCustom = customCols.filter((c) => visibleCols.includes(c.key as ColKey)).map((c) => c.key as ColKey);
    return [...validCanonical, ...validCustom];
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
    const targetScroll = Math.max(0, todayPx - timelineVisibleWidth / 2);
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
    const timer = setTimeout(() => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const todayPx = getDatePixelOffset(currentTodayIso, zoom) + (zoom === 'Día' ? 17 : 0);
      const timelineVisibleWidth = Math.max(200, container.clientWidth - fixedWidth);
      const targetScroll = Math.max(0, todayPx - timelineVisibleWidth / 2);
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      if (headScrollRef.current) {
        headScrollRef.current.scrollTo({ left: targetScroll, behavior: 'smooth' });
      }
    }, 60);
    return () => clearTimeout(timer);
  }, [zoom, currentTodayIso]);

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
  };

  const hitos = items.filter((x) => x.kind === 'hito');
  const subs = items.filter((x) => x.kind === 'subproceso');
  const inprog = items.filter((x) => x.status === 'En proceso' || x.status === 'En curso').length;
  const late = items.filter((x) => x.status === 'Con retraso').length;
  const complete = items.filter((x) => x.status === 'Completado' || x.status === 'Cumple').length;
  const overall = items.length > 0 ? Math.round(items.reduce((a, x) => a + x.progress, 0) / items.length) : 0;

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
      const saved = JSON.parse(localStorage.getItem('qaway-collapsed-by-mode-v1') || 'null');
      if (saved && typeof saved === 'object') return saved;
    } catch {}
    return { gantt: {}, lista: {} };
  });

  const isItemExpanded = (id: string, defaultExpanded: boolean = true): boolean => {
    const mode = viewMode === 'lista' ? 'lista' : 'gantt';
    const modeMap = collapsedByMode[mode];
    if (modeMap && id in modeMap) {
      return !modeMap[id];
    }
    return defaultExpanded;
  };

  const toggleItemExpand = (id: string, defaultExpanded: boolean = true) => {
    const mode = viewMode === 'lista' ? 'lista' : 'gantt';
    setCollapsedByMode((prev) => {
      const modeMap = prev[mode] || {};
      const currentlyCollapsed = typeof modeMap[id] === 'boolean' ? modeMap[id] : !defaultExpanded;
      const nextCollapsed = !currentlyCollapsed;
      const next = {
        ...prev,
        [mode]: {
          ...modeMap,
          [id]: nextCollapsed,
        },
      };
      try {
        localStorage.setItem('qaway-collapsed-by-mode-v1', JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const shownBase = useMemo(() => {
    return items.filter((x) => {
      const parent = items.find((p) => p.id === x.parentId);
      const matchSearch = `${x.code} ${x.name}`.toLowerCase().includes(search.toLowerCase());
      const matchEngine = !engineMatchIds || engineMatchIds.has(x.id);
      const matchState =
        stateFilter === 'Todos' ||
        x.status === stateFilter ||
        (stateFilter === 'Cumple' && x.status === 'Completado');
      const matchType =
        typeFilter === 'Todos' || (typeFilter === 'Hitos' ? x.kind === 'hito' : x.kind === 'subproceso');
      const matchTab =
        tab === 'Todos' ||
        (tab === 'Hitos' && x.kind === 'hito') ||
        (tab === 'Subprocesos' && x.kind === 'subproceso') ||
        (tab === 'Completados' && (x.status === 'Completado' || x.status === 'Cumple')) ||
        (tab === 'En proceso' && (x.status === 'En proceso' || x.status === 'En curso')) ||
        x.status === tab;
      const matchRegion =
        selectedRegions.length === 0 ||
        x.region === 'Todas las Regiones' ||
        (x.region && selectedRegions.includes(x.region));
      const matchGestor =
        gestorFilter === 'Todos' || x.gestor === gestorFilter || getItemGestores(x).includes(gestorFilter);
      const matchPhase =
        phaseFilter === 'Todas' || x.phase === phaseFilter || parent?.phase === phaseFilter;

      // Solapamiento de fechas con el período oficial consultado
      let matchRange = true;
      if (isRangeActive) {
        if (x.kind === 'hito') {
          // El hito coincide si su propio rango se solapa O si cualquiera de sus subprocesos se solapa
          const selfOverlaps = x.start <= rangeTo && x.end >= rangeFrom;
          const anyChildOverlaps = items.some(
            (c) => c.parentId === x.id && c.start <= rangeTo && c.end >= rangeFrom
          );
          matchRange = selfOverlaps || anyChildOverlaps;
        } else {
          // El subproceso coincide si sus fechas se solapan con el período
          matchRange = x.start <= rangeTo && x.end >= rangeFrom;
        }
      }

      // Ocultar si cualquiera de sus ancestros en la jerarquía (padre, abuelo, etc.) está colapsado (independiente por vista)
      let notCollapsed = true;
      let currParentId = x.parentId;
      while (currParentId) {
        const pNode = items.find((p) => p.id === currParentId);
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

      return (
        matchSearch &&
        matchState &&
        matchType &&
        matchTab &&
        matchRegion &&
        matchGestor &&
        matchPhase &&
        matchRange &&
        notCollapsed &&
        matchCustom &&
        matchEngine &&
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
              return items.some((c) => c.parentId === item.id && isOverlapping(c.start, c.end, fStart, fEnd));
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
    currentTodayIso
  ]);

  /* Orden multi-criterio del motor universal (respeta la jerarquía hito > subproceso) */
  const shown = useMemo(() => engine.sortRows(shownBase), [engine.sortRows, shownBase]);

  /* Control de Colapso / Despliegue 100% INDEPENDIENTE por vista (Gantt vs Lista) */
  const parentItems = useMemo(() => {
    return items.filter((it) => items.some((child) => child.parentId === it.id));
  }, [items]);

  // Si al menos un nodo contenedor está expandido, el botón de colapso contraerá todo a Nivel 1.
  const hasAnyExpanded = useMemo(() => {
    return parentItems.length > 0 && parentItems.some((h) => isItemExpanded(h.id, h.expanded !== false));
  }, [parentItems, collapsedByMode, viewMode]);

  const allHitosExpanded = hasAnyExpanded;

  const toggleAllHitosExpand = () => {
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
        localStorage.setItem('qaway-collapsed-by-mode-v1', JSON.stringify(next));
      } catch {}
      return next;
    });
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
      'Tipo (COMPONENTE/SUBCOMPONENTE)',
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

  const add = (kind: Kind, parentHitoId?: string, openInline: boolean = false) => {
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
    const draftItem: Item = {
      id,
      code,
      name: kind === 'hito' ? 'Nuevo componente' : 'Nuevo subcomponente',
      kind,
      edtType: kind === 'hito' ? 'COMPONENTE' : 'SUBCOMPONENTE',
      faseId: null,
      parentId: pId,
      start: defaultStart,
      end: defaultEnd,
      progress: 0,
      status: 'Pendiente',
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
            localStorage.setItem('qaway-collapsed-by-mode-v1', JSON.stringify(next));
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
              if (withExpanded[idx].parentId === pId || isDescendant(withExpanded[idx].id, pId)) {
                lastChildIdx = idx;
              } else if (withExpanded[idx].kind === 'hito') {
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
      toggleEdit(draftItem, 'name');
      notify(`Nuevo ${kind === 'hito' ? 'componente' : 'subcomponente'} creado. Escribe el nombre y pulsa Enter.`);
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

  return (
    <div className="gantt-v2">
      <div className="app">
        {/* Header Principal */}
        <header className="header">
          <div className="heading">
            <span className="heading-icon">
              <CalendarDays size={26} />
            </span>
            <div>
              <h1>Cronograma Maestro · {activeProject?.name || 'Gestión del Proyecto'}</h1>
              <p>
                Línea de tiempo oficial, calibración de hitos clave, entregables y sincronización de plazos para los frentes operativos.
              </p>
            </div>
          </div>
          <div className="head-actions">
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
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tarjetas Métricas Directivas */}
        <section className="metrics">
          <article className="metric blue">
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

          <article className="metric green">
            <span className="metric-icon">
              <Layers3 size={22} />
            </span>
            <div className="metric-copy">
              <b>{subs.length}</b>
              <strong>Subcomponentes</strong>
              <small>y paquetes de trabajo</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article className="metric amber">
            <span className="metric-icon">
              <Clock3 size={22} />
            </span>
            <div className="metric-copy">
              <b>{inprog}</b>
              <strong>En Curso</strong>
              <small>en ejecución activa</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article className="metric red">
            <span className="metric-icon">
              <AlertTriangle size={22} />
            </span>
            <div className="metric-copy">
              <b>{late}</b>
              <strong>Con Retraso</strong>
              <small>atención requerida</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article className="metric overall">
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

        {/* Workspace Central */}
        <main ref={workspaceRef} className={`workspace ${isFullscreen ? 'fullscreen-mode' : ''}`}>
          {/* Barra superior de salida en pantalla completa */}
          {isFullscreen && (
            <div className="fullscreen-exit-bar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }} />
                <span>Modo Pantalla Completa — Vista {viewMode === 'gantt' ? 'Gantt' : viewMode === 'lista' ? 'Lista' : viewMode === 'kanban' ? 'Kanban' : 'Calendario'}</span>
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
              {[
                { n: 'Todos', label: 'Todos', c: items.length },
                { n: 'Hitos', label: 'Componentes', c: hitos.length },
                { n: 'Subprocesos', label: 'Subcomponentes', c: items.length - hitos.length },
                { n: 'En proceso', label: 'En proceso', c: inprog },
                { n: 'Con retraso', label: 'Con retraso', c: late },
                { n: 'Completados', label: 'Completados', c: complete },
              ].map((t) => (
                <button
                  key={t.n}
                  className={tab === t.n ? 'active' : ''}
                  onClick={() => setTab(t.n)}
                >
                  {t.label} <span>({t.c})</span>
                </button>
              ))}
            </div>

            <div className="view-mode-switcher" role="tablist" aria-label="Modo de presentación">
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
                className={`view-mode-btn ${viewMode === 'arbol' ? 'active' : ''}`}
                onClick={() => handleViewModeChange('arbol')}
                title="Vista Estructura Jerárquica WBS (Árbol de trabajo)"
              >
                <GitFork size={14} />
                <span>Jerárquica</span>
              </button>
            </div>
          </nav>

          {/* Filtros Macro para Coordinador */}
          <div className="filters">
            <label className="search">
              <Search size={16} />
              <input
                placeholder="Buscar componente, subcomponente o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Filtro Ubicación Multirregión con Árbol de Sedes */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${activeMenu === 'region' ? 'active' : ''} ${
                  selectedRegions.length > 0 ? 'filtered' : ''
                }`}
                onClick={() => toggleMenu('region')}
                title="Filtrar por una o varias regiones y sedes"
              >
                <div className="filter-card-copy">
                  <small>Ubicación</small>
                  <span>{regionButtonText}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>
              {activeMenu === 'region' && (
                <div
                  className="filter-card-popover"
                  onClick={(e) => e.stopPropagation()}
                  style={{ minWidth: 260, maxWidth: 320 }}
                >
                  <div className="filter-popover-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Filtrar por Ubicación</span>
                    {selectedRegions.length > 0 && (
                      <button
                        type="button"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#0066ff',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          padding: 0,
                        }}
                        onClick={() => setSelectedRegions([])}
                      >
                        Limpiar ({selectedRegions.length})
                      </button>
                    )}
                  </div>
                  <div className="filter-popover-list" style={{ maxHeight: 290 }}>
                    {/* Opción Todas las Ubicaciones */}
                    <button
                      type="button"
                      className={`filter-item-btn ${selectedRegions.length === 0 ? 'selected' : ''}`}
                      onClick={() => setSelectedRegions([])}
                    >
                      <span style={{ fontWeight: selectedRegions.length === 0 ? 700 : 500 }}>
                        Todas las Ubicaciones
                      </span>
                      <span style={{ fontSize: '11px', color: '#94a3b8' }}>({items.length})</span>
                    </button>

                    <div style={{ height: 1, background: '#f1f5f9', margin: '4px 0' }} />

                    {/* Regiones con selección múltiple y árbol de distritos/sedes */}
                    {LOCATION_HIERARCHY.map((reg) => {
                      const isChecked = selectedRegions.includes(reg.name);
                      const isExpanded = expandedRegion === reg.name;
                      return (
                        <div key={reg.name} className="location-tree-group">
                          <div
                            className={`filter-item-btn ${isChecked ? 'selected' : ''}`}
                            style={{ gap: 8, padding: '6px 8px', display: 'flex', alignItems: 'center' }}
                            onClick={() => toggleRegion(reg.name)}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {}}
                              style={{ cursor: 'pointer', accentColor: '#0066ff', width: 14, height: 14, margin: 0 }}
                            />
                            <span style={{ flex: 1, fontWeight: isChecked ? 600 : 500 }}>
                              {reg.name}
                            </span>
                            <span style={{ fontSize: '11px', color: '#94a3b8' }}>({reg.count})</span>
                            {reg.distritos && reg.distritos.length > 0 && (
                              <button
                                type="button"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: '2px 4px',
                                  cursor: 'pointer',
                                  color: '#64748b',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedRegion(isExpanded ? null : reg.name);
                                }}
                                title={isExpanded ? 'Contraer distritos y sedes' : 'Ver distritos y sedes'}
                              >
                                {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                              </button>
                            )}
                          </div>

                          {/* Sub-lista en cascada de distritos y sedes del proyecto */}
                          {isExpanded && reg.distritos && (
                            <div
                              className="location-sub-tree"
                              style={{
                                paddingLeft: 26,
                                paddingRight: 8,
                                paddingTop: 3,
                                paddingBottom: 5,
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 3,
                                background: '#f8fafc',
                                borderRadius: 6,
                                margin: '2px 0 4px',
                              }}
                            >
                              {reg.distritos.map((dist) => (
                                <div
                                  key={dist.distrito}
                                  style={{
                                    fontSize: '11.5px',
                                    color: '#475569',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '2px 4px',
                                  }}
                                >
                                  <span>
                                    <strong style={{ fontWeight: 600 }}>{dist.distrito}</strong> ·{' '}
                                    <span style={{ color: '#64748b' }}>{dist.sede}</span>
                                  </span>
                                  <span style={{ fontSize: '10.5px', color: '#94a3b8' }}>({dist.count})</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Botón Limpiar para Calendario */}
            {viewMode === 'calendario' && (
              <button
                type="button"
                className="btn secondary clear-btn"
                onClick={() => {
                  setSearch('');
                  setTypeFilter('Todos');
                  setStateFilter('Todos');
                  setSelectedRegions([]);
                  setGestorFilter('Todos');
                  setTab('Todos');
                  handleTodayCal();
                  closeMenus();
                  notify('Filtros del calendario restablecidos');
                }}
                style={{
                  height: '42px',
                  padding: '0 12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  color: '#475569',
                  borderRadius: '10px',
                }}
                title="Limpiar filtros del calendario"
              >
                <RotateCcw size={14} />
                <span>Limpiar</span>
              </button>
            )}

            {/* Navegación temporal y selector de escala para todas las vistas */}
            {viewMode === 'calendario' ? (
              <>
                <div className="filter-group-divider" aria-hidden="true" />
                <div className="timeline-nav" title="Navegar por el calendario">
                  <button
                    type="button"
                    className="nav-arrow"
                    onClick={handlePrevCalPeriod}
                    title="Período anterior"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="cal-nav-label" style={{ fontWeight: 700, fontSize: '13px', color: '#0f172a', padding: '0 8px', whiteSpace: 'nowrap' }}>
                    {calPeriodLabel}
                  </span>
                  <button
                    type="button"
                    className="nav-arrow"
                    onClick={handleNextCalPeriod}
                    title="Período siguiente"
                  >
                    <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    className="today-pill"
                    onClick={handleTodayCal}
                    title="Ir a hoy (Octubre 2026)"
                  >
                    Hoy
                  </button>
                </div>

                <div className="zoom">
                  {(['Mes', 'Semana', 'Día', 'Agenda'] as const).map((v) => (
                    <button
                      type="button"
                      key={v}
                      className={calSubView === v ? 'active' : ''}
                      onClick={() => setCalSubView(v)}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* En Modo Gantt, Lista, Kanban y Jerárquica: Barra de Navegación y Escala Oficial Homologada 1:1 */
              <>
                <div className="filter-group-divider" aria-hidden="true" />
                <button
                  type="button"
                  className={`today-pill ${viewMode === 'lista' && listaTemporalFilter === 'Hoy' ? 'active' : ''}`}
                  onClick={() => {
                    if (viewMode === 'lista') {
                      const next = listaTemporalFilter === 'Hoy' ? 'Todos' : 'Hoy';
                      setListaTemporalFilter(next);
                      notify(next === 'Hoy' ? 'Filtrando actividades de Hoy' : 'Mostrando todas las actividades');
                    } else {
                      scrollToToday();
                    }
                  }}
                  title={
                    viewMode === 'lista'
                      ? (listaTemporalFilter === 'Hoy' ? 'Quitar filtro de Hoy' : `Filtrar actividades activas hoy (${formatDatePE(currentTodayIso)})`)
                      : 'Ir y centrar en la fecha actual de hoy'
                  }
                >
                  Hoy
                </button>

                <div className="zoom">
                  <button
                    type="button"
                    className="zoom-nav-arrow"
                    onClick={() => scrollTimeline('left')}
                    title="Desplazar línea de tiempo a la izquierda"
                    aria-label="Desplazar hacia el pasado"
                  >
                    <ChevronLeft size={15} />
                  </button>
                  {['Día', 'Semana', 'Mes', 'Trimestre'].map((x) => {
                    const isActive = viewMode === 'lista' ? listaTemporalFilter === x : zoom === x;
                    return (
                      <button
                        type="button"
                        key={x}
                        className={isActive ? 'active' : ''}
                        onClick={() => {
                          if (viewMode === 'lista') {
                            const next = listaTemporalFilter === x ? 'Todos' : x;
                            setListaTemporalFilter(next);
                            handleZoomChange(x);
                            notify(next === 'Todos' ? 'Mostrando todas las actividades' : `Filtrando actividades por: ${x}`);
                          } else {
                            handleZoomChange(x);
                          }
                        }}
                      >
                        {x}
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    className="zoom-nav-arrow"
                    onClick={() => scrollTimeline('right')}
                    title="Desplazar línea de tiempo a la derecha"
                    aria-label="Desplazar hacia el futuro"
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </>
            )}

            {/* Filtro Avanzado Compacto (Zona 1: Filtros de datos) */}
            {viewMode !== 'calendario' && (
              <button
                type="button"
                className={`btn secondary custom-filter-trigger-btn qm-btn-icon ${advancedFiltersOpen || customRules.length > 0 ? "active" : ""}`}
                onClick={() => setAdvancedFiltersOpen((v) => !v)}
                data-tooltip="Filtros avanzados"
                aria-label="Condiciones de filtrado avanzado"
              >
                <Filter size={15} />
                {customRules.length > 0 && (
                  <span className="custom-filter-counter-badge">{customRules.length}</span>
                )}
              </button>
            )}

            {/* Separador vertical: Filtros de datos | Tiempo Gantt */}
            {viewMode !== 'calendario' && <div className="filter-group-divider" aria-hidden="true" />}
            {/* Rango de Fechas Operativo con Popover Redondeado Moderno (Cero calendarios nativos rectos) */}
            {viewMode !== 'calendario' && (
            <div className="filter-dropdown-wrap date-range-wrap">
              <button
                type="button"
                className={`filter-card-btn date-range-btn ${activeMenu === 'dates' ? 'active' : ''} ${
                  rangeFrom !== RANGE_MIN || rangeTo !== RANGE_MAX ? 'filtered' : ''
                }`}
                onClick={() => toggleMenu('dates')}
              >
                <CalendarDays size={15} className="dr-icon" />
                <div className="filter-card-copy">
                  <small>Rango de Fechas</small>
                  <span>{formatDateRange(rangeFrom, rangeTo)}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {activeMenu === 'dates' && (
                <div className="date-range-popover" onClick={(e) => e.stopPropagation()}>
                  <div className="dr-pop-header">
                    <div className="dr-pop-title">
                      <CalendarDays size={16} />
                      <strong>Rango de Fechas Oficial</strong>
                    </div>
                    <button
                      type="button"
                      className="dr-close"
                      onClick={closeMenus}
                      title="Cerrar selector"
                    >
                      <X size={14} />
                    </button>
                  </div>

                  <div className="dr-section-label">Accesos Rápidos</div>
                  <div className="dr-presets">
                    <button
                      type="button"
                      className={rangeFrom === RANGE_MIN && rangeTo === RANGE_MAX ? 'active' : ''}
                      onClick={() => {
                        setRangeFrom(RANGE_MIN);
                        setRangeTo(RANGE_MAX);
                        scrollToDate(RANGE_MIN);
                        notify('Visualizando todo el cronograma oficial');
                      }}
                    >
                      Todo el proyecto
                    </button>
                    <button
                      type="button"
                      className={rangeFrom === '2026-10-01' && rangeTo === '2026-12-31' ? 'active' : ''}
                      onClick={() => {
                        setRangeFrom('2026-10-01');
                        setRangeTo('2026-12-31');
                        scrollToDate('2026-10-01');
                        notify('Enfocando Q4 2026 (Octubre – Diciembre)');
                      }}
                    >
                      Q4 2026 (Oct-Dic)
                    </button>
                    <button
                      type="button"
                      className={rangeFrom === '2027-01-01' && rangeTo === '2027-03-31' ? 'active' : ''}
                      onClick={() => {
                        setRangeFrom('2027-01-01');
                        setRangeTo('2027-03-31');
                        scrollToDate('2027-01-01');
                        notify('Enfocando Q1 2027 (Enero – Marzo)');
                      }}
                    >
                      Q1 2027 (Ene-Mar)
                    </button>
                    <button
                      type="button"
                      className={rangeFrom === TODAY_ISO ? 'active' : ''}
                      onClick={() => {
                        const next30 = shiftDays(TODAY_ISO, 30);
                        setRangeFrom(TODAY_ISO);
                        setRangeTo(next30);
                        scrollToDate(TODAY_ISO);
                        notify('Enfocando próximos 30 días de actividad territorial');
                      }}
                    >
                      Próximos 30 días
                    </button>
                  </div>

                  <div className="dr-inputs">
                    <div className="dr-input-box">
                      <span>Desde</span>
                      <button
                        type="button"
                        className={`dr-date-field ${calOpen === 'from' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCalOpen((c) => (c === 'from' ? null : 'from'));
                        }}
                      >
                        <span>{formatDatePE(rangeFrom)}</span>
                        <CalendarDays size={14} className="dr-field-icon" />
                      </button>
                      {calOpen === 'from' && (
                        <MiniCalendar
                          value={rangeFrom}
                          min={RANGE_MIN}
                          max={RANGE_MAX}
                          onChange={handleSelectFrom}
                          onClose={() => setCalOpen(null)}
                          align="left"
                        />
                      )}
                    </div>
                    <div className="dr-input-box">
                      <span>Hasta</span>
                      <button
                        type="button"
                        className={`dr-date-field ${calOpen === 'to' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCalOpen((c) => (c === 'to' ? null : 'to'));
                        }}
                      >
                        <span>{formatDatePE(rangeTo)}</span>
                        <CalendarDays size={14} className="dr-field-icon" />
                      </button>
                      {calOpen === 'to' && (
                        <MiniCalendar
                          value={rangeTo}
                          min={RANGE_MIN}
                          max={RANGE_MAX}
                          onChange={handleSelectTo}
                          onClose={() => setCalOpen(null)}
                          align="right"
                        />
                      )}
                    </div>
                  </div>

                  <div className="dr-footer">
                    <button
                      type="button"
                      className="dr-reset"
                      onClick={() => {
                        setRangeFrom(RANGE_MIN);
                        setRangeTo(RANGE_MAX);
                        scrollToDate(RANGE_MIN);
                        notify('Rango restablecido a todo el proyecto');
                      }}
                    >
                      Restablecer
                    </button>
                    <button
                      type="button"
                      className="dr-apply"
                      onClick={() => {
                        closeMenus();
                        scrollToDate(rangeFrom);
                        notify(`Rango oficial aplicado: ${formatDate(rangeFrom)} – ${formatDate(rangeTo)}`);
                      }}
                    >
                      Aplicar Rango
                    </button>
                  </div>
                </div>
              )}
            </div>
            )}

            {/* Controles exclusivos de visualización Gantt (Capas y dependencias) */}
            {viewMode === 'gantt' && (
              <>
                <button
                  type="button"
                  className={`btn-toggle-labels qm-btn-icon ${showBarLabels ? "active" : ""}`}
                  onClick={() => setShowBarLabels((prev) => !prev)}
                  data-tooltip="Mostrar % en barras"
                  aria-label="Mostrar u ocultar porcentaje de avance en barras"
                >
                  <Percent size={14} />
                </button>

                <button
                  type="button"
                  className={`btn secondary qm-btn-icon ${showBaseline ? "active" : ""}`}
                  onClick={() => {
                    setShowBaseline((v) => !v);
                    notify(showBaseline ? "Línea base oculta" : "Línea base oficial visible");
                  }}
                  data-tooltip="Línea base"
                  aria-label="Mostrar u ocultar línea base oficial"
                >
                  <Layers3 size={15} />
                </button>

                <button
                  type="button"
                  className={`btn secondary qm-btn-icon ${showCriticalPath ? "active" : ""}`}
                  onClick={() => {
                    setShowCriticalPath((v) => !v);
                    notify(!showCriticalPath ? "Líneas de dependencia y prelación visibles" : "Líneas de dependencia ocultas");
                  }}
                  data-tooltip={showCriticalPath ? "Ocultar dependencias" : "Mostrar líneas de dependencia"}
                  aria-label="Conmutar líneas de dependencia y prelación entre tareas"
                >
                  <Link2 size={15} />
                </button>

                <button
                  type="button"
                  className={`btn secondary qm-btn-icon ${showBarAvatars ? "active" : ""}`}
                  onClick={() => {
                    setShowBarAvatars((v) => !v);
                    notify(!showBarAvatars ? "Responsables visibles en las barras" : "Responsables ocultos de las barras");
                  }}
                  data-tooltip={showBarAvatars ? "Ocultar responsables en barras" : "Mostrar responsables en barras"}
                  aria-label="Conmutar avatares de responsables en barras de Gantt"
                >
                  <UserCheck size={15} />
                </button>

                <div className="filter-group-divider" aria-hidden="true" />
              </>
            )}

            {/* Controles de expansión y pantalla completa para modo Gantt y Lista */}
            {(viewMode === 'gantt' || viewMode === 'lista') && (
              <>
                <button
                  type="button"
                  className={`btn secondary qm-btn-icon ${isFullscreen ? "active" : ""}`}
                  onClick={toggleFullscreen}
                  data-tooltip={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                  aria-label="Alternar modo pantalla completa"
                >
                  {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                </button>

                <button
                  type="button"
                  className={`btn secondary qm-btn-icon ${!allHitosExpanded ? "collapsed" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAllHitosExpand();
                  }}
                  data-tooltip={allHitosExpanded ? "Colapsar componentes" : "Expandir componentes"}
                  aria-label={allHitosExpanded ? "Colapsar todos los componentes y subcomponentes" : "Expandir todos los componentes y subcomponentes"}
                >
                  <ChevronsUpDown size={15} />
                </button>
              </>
            )}

            {/* Controles de columnas y línea base para Gantt y Lista */}
            {viewMode !== 'calendario' && (
              <>
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

                {/* Fijar línea base: congela las fechas actuales de los registros que aún no tienen línea base (en Gantt y Lista) */}
                <button
                  type="button"
                  className="btn secondary qm-btn-icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    freezeBaselines();
                  }}
                  data-tooltip="Fijar línea base (fechas actuales) en registros sin línea base"
                  aria-label="Fijar línea base del cronograma"
                >
                  <Anchor size={14} />
                </button>

                {/* Configurar Columnas Visibles (Disponible en Gantt y Lista estilo Notion / HubPro) */}
                <div className="filter-dropdown-wrap cols-dropdown-wrap">
                  <button
                    type="button"
                    className={`btn secondary qm-btn-icon ${colsMenuOpen ? "active" : ""}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setColsMenuOpen((v) => !v);
                    }}
                    data-tooltip={viewMode === 'lista' ? "Configurar columnas de la lista" : "Configurar columnas del cronograma"}
                    aria-label="Configurar columnas visibles de la tabla"
                  >
                    <Columns3 size={14} />
                  </button>

                  {colsMenuOpen && (
                    <div className="cols-popover" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
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
                            const storageKey = isLista ? 'qaway-visible-cols-lista-v3' : 'qaway-visible-cols-gantt-v3';
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

                <div className="filter-group-divider" aria-hidden="true" />

                {/* Zona 4: Restablecimiento Integral de Filtros y Orden */}
                <button
                  type="button"
                  className="btn secondary clear-btn qm-btn-icon"
                  onClick={() => {
                    setSearch('');
                    setStateFilter('Todos');
                    setTypeFilter('Todos');
                    setSelectedRegions([]);
                    setPhaseFilter('Todas');
                    setGestorFilter('Todos');
                    setRangeFrom(DEFAULT_RANGE.from);
                    setRangeTo(DEFAULT_RANGE.to);
                    setTab('Todos');
                    setCustomRules([]);
                    setShowBaseline(false);
                    setShowCriticalPath(false);
                    engine.clearAllFilters();
                    engine.clearAllSort();
                    resetColWidths();
                    closeMenus();
                    scrollToDate(RANGE_MIN);
                    notify('Filtros, orden y visualización restablecidos');
                  }}
                  data-tooltip="Restablecer filtros y orden"
                  aria-label="Restablecer filtros, orden y rango temporal"
                >
                  <RotateCcw size={15} />
                </button>
              </>
            )}
          </div>

          {/* Fila extra expandible de Filtros Personalizados */}
          {advancedFiltersOpen && (
            <div className="advanced-filter-row">
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


          {/* Presentación Maestro: Gantt y Lista comparten 100% el mismo tablero unificado */}
          {(viewMode === 'gantt' || viewMode === 'lista') && (
            <div className={`gantt-master-view-wrap ${viewMode === 'lista' ? 'view-lista-fullwidth' : ''}`}>
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
              {/* ── Columna Código (Primera en modo lista) ── */}
              {visibleCols.includes('code') && (
                <div className="th-col-header th-col-code">
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los registros visibles"
                    onChange={(e) =>
                      notify(e.target.checked ? 'Registros visibles seleccionados' : 'Selección cancelada')
                    }
                  />
                  <span className="th-label">Código</span>
                  <div className={`col-resizer ${resizingCol === 'code' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'code')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('code'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}

              {/* ── Columna Nombre (Segunda en lista, primera en Gantt) ── */}
              <div className="name-head">
                {viewMode === 'gantt' && (
                  <input
                    type="checkbox"
                    aria-label="Seleccionar todos los registros visibles"
                    onChange={(e) =>
                      notify(e.target.checked ? 'Registros visibles seleccionados' : 'Selección cancelada')
                    }
                  />
                )}
                <span>{viewMode === 'lista' ? 'Nombre' : 'Componente / Subcomponente'}</span>
                <div className="head-col-actions">
                  <ColumnHeaderMenu engine={engine} columnId="name" buttonClassName="cols-trigger-btn" />
                  <button
                    type="button"
                    className={`cols-trigger-btn collapse-toggle-btn ${!allHitosExpanded ? 'collapsed' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAllHitosExpand();
                    }}
                    title={allHitosExpanded ? "Colapsar todos los componentes y subcomponentes" : "Expandir todos los componentes y subcomponentes"}
                  >
                    <ChevronsUpDown size={13} />
                  </button>
                  <button
                    type="button"
                    className={`cols-trigger-btn ${colsMenuOpen ? 'active' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setColsMenuOpen((v) => !v);
                    }}
                    title="Configurar columnas visibles"
                  >
                    <Columns3 size={13} />
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
                      {visibleCols.length === 1 ? <PanelLeftOpen size={13} /> : <PanelLeftClose size={13} />}
                    </button>
                  )}
                </div>

                <div className={`col-resizer ${resizingCol === 'name' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'name')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('name'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
              </div>
              {visibleCols.includes('kind') && (
                <div className="th-col-header">
                  <span className="th-label">Tipo</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility('kind');
                        notify('Columna "Tipo" ocultada.');
                      }}
                      title="Ocultar columna Tipo"
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId="kind" buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === 'kind' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'kind')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('kind'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}
              {visibleCols.includes('parent') && (
                <div className="th-col-header">
                  <span className="th-label">Componente padre</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility('parent');
                        notify('Columna "Componente padre" ocultada.');
                      }}
                      title="Ocultar columna Componente padre"
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId="parent" buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === 'parent' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'parent')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('parent'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}
              {visibleCols.includes('start') && (
                <div className="th-col-header">
                  <span className="th-label">Inicio</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility('start');
                        notify('Columna "Inicio" ocultada. Recupérala desde el icono de columnas.');
                      }}
                      title="Ocultar columna Inicio"
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId="start" buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === 'start' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'start')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('start'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}
              {visibleCols.includes('end') && (
                <div className="th-col-header">
                  <span className="th-label">Fin</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility('end');
                        notify('Columna "Fin" ocultada. Recupérala desde el icono de columnas.');
                      }}
                      title="Ocultar columna Fin"
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId="end" buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === 'end' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'end')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('end'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}
              {visibleCols.includes('duration') && (
                <div className="th-col-header">
                  <span className="th-label">Duración</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility('duration');
                        notify('Columna "Duración" ocultada.');
                      }}
                      title="Ocultar columna Duración"
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId="duration" buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === 'duration' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'duration')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('duration'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}
              {visibleCols.includes('progress') && (
                <div className="th-col-header">
                  <span className="th-label">Avance</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility('progress');
                        notify('Columna "Avance" ocultada.');
                      }}
                      title="Ocultar columna Avance"
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId="progress" buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === 'progress' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'progress')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('progress'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}
              {visibleCols.includes('deviation') && (
                <div className="th-col-header">
                  <span className="th-label">Desviación</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility('deviation');
                        notify('Columna "Desviación" ocultada.');
                      }}
                      title="Ocultar columna Desviación"
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId="deviation" buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === 'deviation' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'deviation')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('deviation'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}
              {visibleCols.includes('status') && (
                <div className="th-col-header">
                  <span className="th-label">Estado</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility('status');
                        notify('Columna "Estado" ocultada.');
                      }}
                      title="Ocultar columna Estado"
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId="status" buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === 'status' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'status')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('status'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}
              {visibleCols.includes('gestor') && (
                <div className="th-col-header">
                  <span className="th-label">Responsable</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility('gestor');
                        notify('Columna "Responsable" ocultada.');
                      }}
                      title="Ocultar columna Responsable"
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId="gestor" buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === 'gestor' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'gestor')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('gestor'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}
              {visibleCols.includes('region') && (
                <div className="th-col-header">
                  <span className="th-label">Ámbito</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility('region');
                        notify('Columna "Ámbito" ocultada.');
                      }}
                      title="Ocultar columna Ámbito"
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId="region" buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === 'region' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'region')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('region'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}
              {visibleCols.includes('actualEnd') && (
                <div className="th-col-header">
                  <span className="th-label">Fecha real</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility('actualEnd');
                        notify('Columna "Fecha real" ocultada.');
                      }}
                      title="Ocultar columna Fecha real"
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId="actualEnd" buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === 'actualEnd' ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, 'actualEnd')} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth('actualEnd'); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              )}
              {visibleCols.includes('actions') && (
                <div className="th-col-header th-col-actions">
                  <span className="th-label">Acciones</span>
                </div>
              )}

              {/* Columnas personalizadas Notion en cabecera con micro-filtro y resizer sincronizado */}
              {customCols.map((cCol) => visibleCols.includes(cCol.key as ColKey) && (
                <div key={cCol.key} className="th-col-header">
                  <span className="th-label">{cCol.label}</span>
                  <div className="th-actions">
                    <button
                      type="button"
                      className="th-action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleColVisibility(cCol.key as ColKey);
                        notify(`Columna "${cCol.label}" ocultada.`);
                      }}
                      title={`Ocultar ${cCol.label}`}
                    >
                      <EyeOff size={11} />
                    </button>
                    <ColumnHeaderMenu engine={engine} columnId={cCol.key} buttonClassName="th-action-btn" />
                  </div>
                  <div className={`col-resizer ${resizingCol === cCol.key ? 'is-resizing' : ''}`} onMouseDown={(e) => startResize(e, cCol.key as ColKey)} onDoubleClick={(e) => { e.stopPropagation(); resetSingleColWidth(cCol.key as ColKey); }} title="Arrastra para redimensionar · Doble clic para auto-ajustar" />
                </div>
              ))}
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
              {shown.map((x, i) => (
                <div
                  key={x.id}
                  className={`row ${x.kind === 'hito' ? 'hito' : 'sub'} ${i % 2 ? 'stripe' : ''} ${
                    selectedId === x.id ? 'selected' : ''
                  } ${edit?.id === x.id ? 'is-editing-row' : ''}`}
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
                    {/* ── Columna Código (Primera en modo lista) ── */}
                    {visibleCols.includes('code') && (
                      <div className="code-cell-col" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar ${x.code} ${x.name}`}
                          onChange={(e) => e.stopPropagation()}
                        />
                        {x.kind === 'hito' ? (
                          <Flag size={13} className="code-icon-flag is-hito" />
                        ) : (
                          <FileText size={13} className="code-icon-flag is-sub" />
                        )}
                        <span className="code-num">{x.code}</span>
                      </div>
                    )}

                    <div className="name-cell">
                    {/* Sangría proporcional limpia y alineada: exactamente 20px por nivel de jerarquía */}
                    {getItemDepth(x) > 0 && (
                      <span style={{ width: `${getItemDepth(x) * 20}px`, flexShrink: 0 }} />
                    )}
                    {items.some((c) => c.parentId === x.id) ? (
                      <button
                        className="expand"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleItemExpand(x.id, x.expanded !== false);
                        }}
                      >
                        {isItemExpanded(x.id, x.expanded !== false) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    ) : (
                      <span className="indent" />
                    )}
                    {x.kind === 'hito' ? (
                      <button
                        type="button"
                        className="row-icon-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditorForItem(x);
                        }}
                      >
                        <FolderOpen size={16} className="folder" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="row-icon-action"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditorForItem(x);
                        }}
                      >
                        <FileText size={15} className="file" />
                      </button>
                    )}
                    {viewMode === 'gantt' && (
                      <b className="code">
                        {x.kind === 'hito' && (
                          <span className="hito-micro-diamond">◆</span>
                        )}
                        {x.code}
                      </b>
                    )}
                    {isEditing(x, 'name') ? (
                      <input
                        className="cell-editor cell-input name-edit"
                        autoFocus
                        onFocus={(e) => e.currentTarget.select()}
                        defaultValue={x.name}
                        onBlur={(e) => {
                          update(x.id, { name: e.target.value.trim() || x.name });
                          closeEdit();
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            update(x.id, { name: e.currentTarget.value.trim() || x.name });
                            closeEdit();
                            setTimeout(() => {
                              add(x.kind, x.parentId, true);
                            }, 50);
                          }
                          if (e.key === 'Escape') closeEdit();
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

                    {!isEditing(x, 'name') && (
                      <div className="quick-row-actions">
                        {x.kind === 'subproceso' ? (
                          <>
                            {/* 1. Mismo nivel (+ Hermano) */}
                            <button
                              type="button"
                              className="quick-inline-icon-btn"
                              title="Agregar fila al mismo nivel (hermano)"
                              onClick={(e) => {
                                e.stopPropagation();
                                add('subproceso', x.parentId, true);
                              }}
                            >
                              <Plus size={13} style={{ color: '#475569' }} />
                            </button>

                            {/* 2. Nivel inferior (↳ Enter / Sub-hijo) */}
                            <button
                              type="button"
                              className="quick-inline-icon-btn"
                              title={`Agregar sub-hijo / nivel inferior bajo ${x.code}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                add('subproceso', x.id, true);
                              }}
                            >
                              <CornerDownRight size={13} style={{ color: '#0284c7' }} />
                            </button>

                            {/* 3. Colapsador propio si tiene hijos anidados */}
                            {items.some((c) => c.parentId === x.id) && (
                              <button
                                type="button"
                                className="quick-inline-icon-btn"
                                title={isItemExpanded(x.id, x.expanded !== false) ? "Colapsar sub-procesos hijos" : "Expandir sub-procesos hijos"}
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
                            )}
                          </>
                        ) : (
                          <>
                            {/* 1. Mismo nivel (+ Componente Principal) */}
                            <button
                              type="button"
                              className="quick-inline-icon-btn"
                              title="Agregar nuevo componente al mismo nivel"
                              onClick={(e) => {
                                e.stopPropagation();
                                add('hito', undefined, true);
                              }}
                            >
                              <Plus size={13} style={{ color: '#0f172a' }} />
                            </button>

                            {/* 2. Nivel inferior (↳ Enter / Subcomponente hijo) */}
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

                            {/* 3. Colapsador de este componente */}
                            <button
                              type="button"
                              className="quick-inline-icon-btn"
                              title={isItemExpanded(x.id, x.expanded !== false) ? "Colapsar subcomponentes de este componente" : "Expandir subcomponentes de este componente"}
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




                  {/* ── Columna Tipo ── */}
                  {visibleCols.includes('kind') && (
                    <div className="kind-cell-col">
                      <span className={`type-badge-pill ${x.kind === 'hito' ? 'is-hito' : 'is-sub'}`}>
                        {getEdtNodeDisplayLabel(x, items)}
                      </span>
                    </div>
                  )}

                  {/* ── Columna Hito padre ── */}
                  {visibleCols.includes('parent') && (
                    <div className="parent-cell-col" title={x.parentId ? (items.find(p => p.id === x.parentId)?.name ?? '—') : '—'}>
                      {x.parentId ? (
                        <span className="parent-text-pill">
                          {items.find(p => p.id === x.parentId)?.code ?? ''} {items.find(p => p.id === x.parentId)?.name ?? '—'}
                        </span>
                      ) : (
                        <span className="parent-none-dash">—</span>
                      )}
                    </div>
                  )}
                  {visibleCols.includes('start') && (
                    <div
                      className="date editable"
                      style={{ position: 'relative' }}
                      title="Clic para cambiar la fecha de inicio con calendario institucional"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEdit(x, 'start');
                      }}
                    >
                      <span className="cell-text">{viewMode === 'lista' ? formatDatePE(x.start) : formatDate(x.start)}</span>
                      {isEditing(x, 'start') && (
                        <MiniCalendar
                          value={x.start}
                          onChange={(newDate) => {
                            setStart(x, newDate);
                            closeEdit();
                          }}
                          onClose={closeEdit}
                          align="left"
                        />
                      )}
                    </div>
                  )}

                  {visibleCols.includes('end') && (
                    <div
                      className="date editable"
                      style={{ position: 'relative' }}
                      title="Clic para cambiar la fecha de fin con calendario institucional"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEdit(x, 'end');
                      }}
                    >
                      <span className="cell-text">{viewMode === 'lista' ? formatDatePE(x.end) : formatDate(x.end)}</span>
                      {isEditing(x, 'end') && (
                        <MiniCalendar
                          value={x.end}
                          min={x.start}
                          onChange={(newDate) => {
                            setEnd(x, newDate);
                            closeEdit();
                          }}
                          onClose={closeEdit}
                          align="right"
                        />
                      )}
                    </div>
                  )}

                  {visibleCols.includes('duration') && (
                    <div
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
                          defaultValue={getDays(x.start, x.end)}
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
                      ) : (
                        <span className="cell-text">{getDays(x.start, x.end)} días</span>
                      )}
                    </div>
                  )}

                  {visibleCols.includes('progress') && (
                    <div
                      className="progress editable"
                      title="Clic para ajustar el avance (0–100%)"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEdit(x, 'progress');
                      }}
                    >
                      {isEditing(x, 'progress') ? (
                        <div className="cell-editor cell-pop progress-pop">
                          <input
                            type="range"
                            min={0}
                            max={100}
                            step={5}
                            value={x.progress}
                            onChange={(e) => setProgress(x, +e.target.value)}
                          />
                          <b>{x.progress}%</b>
                        </div>
                      ) : (
                        <>
                          <span>
                            <i
                              className={
                                x.progress === 100
                                  ? 'green'
                                  : x.status === 'Con retraso'
                                  ? 'red'
                                  : x.status === 'Pendiente'
                                  ? 'gray'
                                  : 'blue'
                              }
                              style={{ width: `${x.progress}%` }}
                            />
                          </span>
                          <b>{x.progress}%</b>
                        </>
                      )}
                    </div>
                  )}
                  {visibleCols.includes('deviation') && (() => {
                    const dev = getDeviationDays(x, currentTodayIso);
                    const tone = getDeviationTone(dev);
                    const isEditingDev = isEditing(x, 'deviation');
                    return (
                      <div
                        className="deviation-cell editable"
                        style={{ cursor: 'pointer', position: 'relative' }}
                        title={
                          dev === undefined
                            ? 'Clic para fijar línea base y medir desviación'
                            : `Desviación: ${formatDeviation(dev)} · Fin aprobado: ${formatDate(x.baselineEnd)} · Clic para ajustar fecha base`
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEdit(x, 'deviation');
                        }}
                      >
                        {isEditingDev ? (
                          <div className="cell-editor cell-pop" style={{ padding: '8px 10px', display: 'flex', flexDirection: 'column', gap: '6px', minWidth: '160px' }} onClick={(e) => e.stopPropagation()}>
                            <span style={{ fontSize: '11px', fontWeight: 650, color: '#334155' }}>Fin de Línea Base</span>
                            <MiniCalendar
                              value={x.baselineEnd || x.end}
                              onChange={(newDate) => {
                                update(x.id, { baselineEnd: newDate });
                                closeEdit();
                                notify(`Línea base fijada en ${formatDate(newDate)}`);
                              }}
                              onClose={closeEdit}
                              align="left"
                            />
                            {x.baselineEnd && (
                              <button
                                type="button"
                                style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer', marginTop: 4 }}
                                onClick={() => {
                                  update(x.id, { baselineEnd: undefined });
                                  closeEdit();
                                  notify('Línea base removida');
                                }}
                              >
                                Quitar línea base
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className={`dev-pill ${tone}`}>{formatDeviation(dev)}</span>
                        )}
                      </div>
                    );
                  })()}


                  {visibleCols.includes('status') && (
                    <div
                      className="status-cell editable"
                      title={`Estado: ${x.status} · Clic para cambiar`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEdit(x, 'status');
                      }}
                    >
                      {isEditing(x, 'status') ? (
                        <div className="cell-editor cell-pop status-pop">
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              className={s === x.status ? 'cur' : ''}
                              onClick={(e) => {
                                e.stopPropagation();
                                setStatusWithSync(x, s);
                                closeEdit();
                              }}
                            >
                              <span className={'status ' + STATUS_CLASS[s]}>{s}</span>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className={'status ' + STATUS_CLASS[x.status]}>{x.status}</span>
                      )}
                    </div>
                  )}

                  {visibleCols.includes('gestor') && (
                    <div
                      className="gestor-cell editable"
                      title="Clic para gestionar responsables asignados"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEdit(x, 'gestor');
                      }}
                    >
                      {isEditing(x, 'gestor') ? (
                        <div className="cell-editor cell-pop gestor-pop" onClick={(e) => e.stopPropagation()}>
                          <div className="gestor-pop-head">
                            <span>Asignar Responsables</span>
                          </div>
                          <div className="gestor-pop-list">
                            {GESTOR_OPTIONS.filter((g) => g.value !== 'Todos').map((g) => {
                              const currentGestores = getItemGestores(x);
                              const isAssigned = currentGestores.includes(g.value);
                              return (
                                <button
                                  key={g.value}
                                  type="button"
                                  className={`gestor-pop-item ${isAssigned ? 'selected' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItemGestor(x, g.value);
                                  }}
                                >
                                  <span className="gestor-pop-check">
                                    {isAssigned && <Check size={11} strokeWidth={3} />}
                                  </span>
                                  <span
                                    className="gestor-circle-avatar mini"
                                    style={{ backgroundColor: getGestorColor(g.value) }}
                                  >
                                    {getGestorInitials(g.value)}
                                  </span>
                                  <span className="gestor-pop-name">{g.label}</span>
                                </button>
                              );
                            })}
                          </div>
                          <div className="gestor-pop-footer">
                            <button
                              type="button"
                              className="gestor-pop-done-btn"
                              onClick={(e) => {
                                e.stopPropagation();
                                closeEdit();
                              }}
                            >
                              Listo
                            </button>
                          </div>
                        </div>
                      ) : (
                        (() => {
                          const gestoresList = getItemGestores(x);
                          if (gestoresList.length === 0) {
                            return (
                              <span className="cell-text gestor-text unassigned">
                                <span className="gestor-dot empty" />
                                Sin asignar
                              </span>
                            );
                          }
                          if (gestoresList.length === 1) {
                            const gName = gestoresList[0];
                            return (
                              <div className="gestor-single-badge" title={gName}>
                                <span
                                  className="gestor-circle-avatar"
                                  style={{ backgroundColor: getGestorColor(gName) }}
                                >
                                  {getGestorInitials(gName)}
                                </span>
                                <span className="gestor-name-text">{gName}</span>
                              </div>
                            );
                          }
                          return (
                            <div className="gestor-multi-stack" title={gestoresList.join(', ')}>
                              <div className="gestor-stacked-circles">
                                {gestoresList.slice(0, 3).map((g, idx) => (
                                  <span
                                    key={g}
                                    className="gestor-circle-avatar stacked"
                                    style={{
                                      backgroundColor: getGestorColor(g),
                                      zIndex: 10 - idx,
                                    }}
                                    title={g}
                                  >
                                    {getGestorInitials(g)}
                                  </span>
                                ))}
                                {gestoresList.length > 3 && (
                                  <span className="gestor-circle-avatar stacked more-count" style={{ zIndex: 6 }}>
                                    +{gestoresList.length - 3}
                                  </span>
                                )}
                              </div>
                              <span className="gestor-stack-label">{gestoresList.length}</span>
                            </div>
                          );
                        })()
                      )}
                    </div>
                  )}

                  {visibleCols.includes('region') && (
                    <div
                      className="region-cell editable"
                      title="Clic para cambiar región"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleEdit(x, 'region');
                      }}
                    >
                      {isEditing(x, 'region') ? (
                        <div className="cell-editor cell-pop region-pop" onClick={(e) => e.stopPropagation()}>
                          {REGION_OPTIONS.filter((r) => r.value !== 'Todas').map((r) => (
                            <button
                              key={r.value}
                              className={x.region === r.value ? 'cur' : ''}
                              onClick={() => {
                                update(x.id, { region: r.value });
                                closeEdit();
                                notify(`Región asignada: ${r.value}`);
                              }}
                            >
                              <span>{r.label}</span>
                              {x.region === r.value && <Check size={12} />}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <span className="region-badge-pill">{x.region || 'Nacional'}</span>
                      )}
                    </div>
                  )}

                  {visibleCols.includes('actualEnd') && (
                    <div className="date" title={x.actualEnd ? 'Fecha real de cumplimiento' : 'Aún sin cumplir'}>
                      <span className="cell-text">{x.actualEnd ? formatDate(x.actualEnd) : '—'}</span>
                    </div>
                  )}

                  {/* ── Columna Acciones ── */}
                  {visibleCols.includes('actions') && (
                    <div
                      className="actions-cell-col"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        className="row-action-btn"
                        title="Ver detalle del registro"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditorForItem(x);
                        }}
                      >
                        <MoreHorizontal size={14} />
                      </button>
                    </div>
                  )}

                  {/* Celdas interactivas editables de columnas personalizadas */}
                  {customCols.map((cCol) => visibleCols.includes(cCol.key as ColKey) && (() => {
                    const cellVal = (x as any)[cCol.key];
                    const isEditingCol = isEditing(x, cCol.key as ColKey);
                    return (
                      <div
                        key={cCol.key}
                        className="custom-cell-col editable"
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 10px',
                          overflow: 'hidden',
                          height: '100%',
                          position: 'relative',
                          cursor: 'pointer',
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleEdit(x, cCol.key as ColKey);
                        }}
                        title={`Clic para editar ${cCol.label}`}
                      >
                        {isEditingCol ? (
                          cCol.type === 'number' ? (
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
                          ) : cCol.type === 'percent' ? (
                            <div className="cell-editor cell-pop progress-pop" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={5}
                                value={Number(cellVal) || 0}
                                onChange={(e) => update(x.id, { [cCol.key]: +e.target.value } as any)}
                              />
                              <b>{cellVal || 0}%</b>
                              <button type="button" className="btn primary" style={{ height: 22, fontSize: 10.5, padding: '0 6px', marginLeft: 6 }} onClick={closeEdit}>OK</button>
                            </div>
                          ) : cCol.type === 'date' ? (
                            <MiniCalendar
                              value={cellVal || ''}
                              onChange={(newDate) => {
                                update(x.id, { [cCol.key]: newDate } as any);
                                closeEdit();
                              }}
                              onClose={closeEdit}
                              align="left"
                            />
                          ) : cCol.type === 'select' ? (
                            <div className="cell-editor cell-pop" style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 150 }} onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                autoFocus
                                className="cell-input"
                                placeholder="Etiqueta personalizada..."
                                defaultValue={cellVal || ''}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    update(x.id, { [cCol.key]: e.currentTarget.value.trim() } as any);
                                    closeEdit();
                                  }
                                  if (e.key === 'Escape') closeEdit();
                                }}
                              />
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                                {['Prioritario', 'En revisión', 'Aprobado', 'Observado'].map((tag) => (
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
                        ) : (
                          cCol.type === 'percent' ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
                              <div style={{ flex: 1, height: 6, background: '#e2e8f0', borderRadius: 3, overflow: 'hidden' }}>
                                <div style={{ width: `${Math.min(100, Math.max(0, Number(cellVal) || 0))}%`, height: '100%', background: '#0066ff' }} />
                              </div>
                              <small style={{ fontSize: 11, fontWeight: 600, color: '#475569' }}>{cellVal !== undefined ? `${cellVal}%` : '0%'}</small>
                            </div>
                          ) : cCol.type === 'select' ? (
                            cellVal ? (
                              <span style={{ fontSize: 11.5, fontWeight: 600, background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: 4, border: '1px solid #bfdbfe' }}>
                                {cellVal}
                              </span>
                            ) : (
                              <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>
                            )
                          ) : cCol.type === 'date' ? (
                            <span style={{ fontSize: 12, color: '#334155' }}>
                              {cellVal ? formatDatePE(cellVal) : '—'}
                            </span>
                          ) : (
                            <span style={{ fontSize: 12, color: '#334155', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {cellVal !== undefined && cellVal !== '' ? String(cellVal) : '—'}
                            </span>
                          )
                        )}
                      </div>
                    );
                  })())}

                  {/* ── Columna Código ── */}

                  {/* ── Columna Tipo ── */}

                  {/* ── Columna Hito padre ── */}

                  {/* ── Columna Acciones ── */}
                </div>

                {viewMode === 'gantt' && (
                  <div className="timeline" style={{ width: timelineMinWidth, minWidth: timelineMinWidth }}>
                    <div className="month-grid" style={{ gridTemplateColumns: segCols }}>
                      {segments.map((s) => (
                        <span key={s.key} />
                      ))}
                    </div>
                    {(() => {
                      const barWidthPx =
                        resizingTaskId === x.id && resizeTempWidth !== null
                          ? resizeTempWidth
                          : Math.max(8, getDatePixelOffset(shiftDays(x.end, 1)) - getDatePixelOffset(x.start));
                      // El relleno físico real en píxeles que tiene el color de avance
                      const fillWidthPx = barWidthPx * (Math.min(100, Math.max(0, x.progress)) / 100);
                      // Vive dentro de la barra si el relleno físico tiene al menos 42px para el texto
                      const fitsInsideBar = fillWidthPx >= 42;

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

                          {showBaseline && (
                            <div
                              className="baseline-shadow-bar"
                              style={{ left: 0, width: "100%" }}
                              title={`Línea base contractual: ${formatDatePE(x.start)} – ${formatDatePE(x.end)}`}
                            />
                          )}

                          {/* Contenido interior secuencial: 1° Porcentaje (%) + 2° Iconos de responsables (sin salir del nodo) */}
                          {(showBarLabels || showBarAvatars) && (
                            <div className={`bar-inner-content ${fitsInsideBar ? 'in-bar' : 'after-bar'}`}>
                              {/* 1. Porcentaje de avance: espacio numérico natural (máx 100%) */}
                              {showBarLabels && (
                                <span className={`bar-percent-tag ${fitsInsideBar ? 'in-bar' : 'after-bar'}`}>
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
                  zIndex: 2,
                  overflow: 'visible',
                }}
              >
                <defs>
                  <marker
                    id="dep-arrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 2 L 7 5 L 0 8 z" fill="#64748b" />
                  </marker>
                  <marker
                    id="dep-arrow-critical"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 2 L 7 5 L 0 8 z" fill="#ea580c" />
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

                    // 1. Predecesores directos del ítem
                    const predecessorRawIds = new Set<string>();
                    if (item.dependencies && item.dependencies.length > 0) {
                      item.dependencies.forEach((d) => predecessorRawIds.add(d));
                    }
                    if (item.kind === 'hito' && item.parentId) {
                      predecessorRawIds.add(item.parentId);
                    }

                    // 2. Si el ítem es un hito con hijos ocultos, recolectar dependencias de sus hijos
                    items.forEach((subIt) => {
                      if (subIt.parentId === item.id && subIt.dependencies) {
                        subIt.dependencies.forEach((d) => predecessorRawIds.add(d));
                      }
                    });

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

                      let pathD = '';
                      if (toX >= fromEndX + 8) {
                        // Trazo secuencial clásico ortogonal (Fin a Inicio: ──┐ └──►)
                        const midX = fromEndX + Math.max(8, (toX - fromEndX) / 2);
                        pathD = `M ${fromEndX} ${fromY} L ${midX} ${fromY} L ${midX} ${toY} L ${toX - 2} ${toY}`;
                      } else {
                        // Trazo con canal de retorno en vacío para evitar cruzar sobre nodos
                        const exitX = fromEndX + 10;
                        const backX = Math.min(toX - 12, fromEndX - 10);
                        const interY = fromY + (toY > fromY ? 24 : -24);
                        pathD = `M ${fromEndX} ${fromY} L ${exitX} ${fromY} L ${exitX} ${interY} L ${backX} ${interY} L ${backX} ${toY} L ${toX - 2} ${toY}`;
                      }

                      const isCritical = (sourceItem.progress < 100 && item.progress === 0) || item.status === 'Con retraso';

                      return (
                        <path
                          key={pairKey}
                          d={pathD}
                          fill="none"
                          stroke={isCritical ? '#ea580c' : '#64748b'}
                          strokeWidth="1.6"
                          markerEnd={isCritical ? 'url(#dep-arrow-critical)' : 'url(#dep-arrow)'}
                          opacity={0.88}
                        />
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
                Cumplimiento : {hoveredTask.item.progress}%
                {hoveredTask.item.kind === 'hito' && (
                  <span className="tooltip-sub"> · Corte: {formatDate(hoveredTask.item.end)}</span>
                )}
              </div>
            </div>
          )}

            </div>
          )}

          {/* Presentación 3: Tablero Visual Kanban */}
          {viewMode === 'kanban' && (
            <CronogramaKanbanView
              items={shown}
              allItems={items}
              onSelectItem={openEditorForItem}
              onAddItem={() => add('hito')}
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

          {/* Footer de Paginación */}
          <footer className="footer">
            <span>
              Mostrando {shown.length ? 1 : 0}–{shown.length} de {items.length} registros
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="btn secondary"
                style={{ minHeight: '32px', fontSize: '12px' }}
                onClick={() => {
                  if (panelOpen) {
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
                <span>{panelOpen ? 'Ocultar Detalle' : 'Ver Detalle'}</span>
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
        </main>

        {/* Backdrop Scrim para cerrar drawer al hacer clic afuera */}
        {panelOpen && (
          <div
            className="editor-backdrop"
            onClick={() => requestCloseDrawer()}
            aria-label="Cerrar panel lateral"
          />
        )}

        {/* Panel Lateral Editor (Drawer de Coordinador) */}
        {panelOpen && activeItem && (
          <aside className="editor" onClick={() => {
            setEditorCalOpen(null);
            setEditorReportTypeOpen(false);
            setEditorStatusOpen(false);
            setEditorHitoSelectOpen(false);
            setEditorParentSelectOpen(false);
            setEditorDepSelectOpen(false);
          }}>
            <div className="editor-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
                <button
                  type="button"
                  className="editor-icon-btn"
                  onClick={() => requestCloseDrawer()}
                  title="Volver"
                >
                  <ChevronLeft size={18} />
                </button>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h2 style={{ fontSize: '15px', margin: 0, fontWeight: 700 }}>
                    {isNewDraft ? 'Crear' : 'Editar'} {getEdtNodeDisplayLabel(activeItem, items)}
                  </h2>
                </div>
              </div>
              <button
                type="button"
                className="editor-icon-btn"
                onClick={() => requestCloseDrawer()}
                aria-label="Cerrar editor"
                title="Cerrar panel de detalles"
              >
                <X size={18} />
              </button>
            </div>

            {/* Selector permanente de componente con diseño oficial de la página */}
            {hitos.length > 0 && (
              <div
                style={{
                  padding: '9px 16px',
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Componente:
                </span>
                <div className="filter-dropdown-wrap" style={{ flex: 1, minWidth: 0, position: 'relative' }}>
                  <button
                    type="button"
                    className={`filter-card-btn ${editorHitoSelectOpen ? 'active' : ''}`}
                    style={{
                      width: '100%',
                      height: '32px',
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
                      setEditorCalOpen(null);
                      setEditorStatusOpen(false);
                      setEditorReportTypeOpen(false);
                      setEditorHitoSelectOpen((v) => !v);
                    }}
                  >
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: 650,
                        color: '#0f172a',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        textAlign: 'left',
                      }}
                    >
                      {isNewDraft
                        ? `+ ${activeItem.kind === 'hito' ? 'Nuevo componente' : 'Nuevo subcomponente'} (en borrador)`
                        : activeItem.kind === 'hito'
                        ? `${activeItem.code} ${activeItem.name}`
                        : `${hitos.find((h) => h.id === activeItem.parentId)?.code || ''} ${hitos.find((h) => h.id === activeItem.parentId)?.name || 'Componente padre'}`}
                    </span>
                    <ChevronDown
                      size={14}
                      className="filter-chevron"
                      style={{
                        transform: editorHitoSelectOpen ? 'rotate(180deg)' : 'none',
                        transition: 'transform 0.15s ease',
                        color: '#64748b',
                        flexShrink: 0,
                        marginLeft: 6,
                      }}
                    />
                  </button>
                  {editorHitoSelectOpen && (
                    <div
                      className="filter-card-popover"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        zIndex: 9999,
                        marginTop: '4px',
                        maxHeight: '260px',
                        overflowY: 'auto',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="filter-popover-title">Componentes del Cronograma</div>
                      {hitos.map((h) => {
                        const isSelected = activeItem.kind === 'hito' && !isNewDraft && activeItem.id === h.id;
                        return (
                          <button
                            key={h.id}
                            type="button"
                            className={`filter-item-btn ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              setEditorHitoSelectOpen(false);
                              handleSwitchActiveHito(h);
                            }}
                            style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                          >
                            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                              <b style={{ color: '#0284c7', marginRight: 5 }}>{h.code}</b> {h.name}
                            </span>
                            {isSelected && <Check size={14} className="item-check" style={{ color: '#0284c7', flexShrink: 0 }} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="editor-tabs">
              <button
                type="button"
                className={editorTab === 'info' ? 'active' : ''}
                onClick={() => setEditorTab('info')}
              >
                {activeItem.kind === 'hito' ? 'Componente' : 'Subcomponente'}
              </button>
              <button
                type="button"
                className={editorTab === 'subprocesos' ? 'active' : ''}
                onClick={() => setEditorTab('subprocesos')}
              >
                Subcomponentes
              </button>
              <button
                type="button"
                className={editorTab === 'dependencias' ? 'active' : ''}
                onClick={() => setEditorTab('dependencias')}
              >
                Dependencias
              </button>
            </div>

            {editorTab === 'info' && (
              <div className="editor-body">
                {/* Selector de Elemento Padre si es subcomponente (admite Componentes y Subcomponentes para multinivel) */}
                {activeItem.kind === 'subproceso' && (
                  <div className="field relative" style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '10px' }}>
                    <span style={{ fontSize: '11.5px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.03em', display: 'block', marginBottom: '6px' }}>
                      Elemento Padre (Asociado a)
                    </span>
                    <div className="filter-dropdown-wrap" style={{ position: 'relative' }}>
                      <button
                        type="button"
                        className={`filter-card-btn ${editorParentSelectOpen ? 'active' : ''}`}
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
                          setEditorCalOpen(null);
                          setEditorStatusOpen(false);
                          setEditorReportTypeOpen(false);
                          setEditorHitoSelectOpen(false);
                          setEditorDepSelectOpen(false);
                          setEditorParentSelectOpen((v) => !v);
                        }}
                      >
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 600,
                            color: '#0f172a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            textAlign: 'left',
                          }}
                        >
                          {(() => {
                            const parent = items.find((x) => x.id === activeItem.parentId);
                            if (!parent) return 'Selecciona el elemento padre...';
                            return parent.kind === 'hito'
                              ? `[Componente] ${parent.code} ${parent.name}`
                              : `└ [Subcomponente] ${parent.code} ${parent.name}`;
                          })()}
                        </span>
                        <ChevronDown
                          size={14}
                          className="filter-chevron"
                          style={{
                            transform: editorParentSelectOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.15s ease',
                            color: '#64748b',
                            flexShrink: 0,
                            marginLeft: 6,
                          }}
                        />
                      </button>
                      {editorParentSelectOpen && (
                        <div
                          className="filter-card-popover"
                          style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            right: 0,
                            zIndex: 9999,
                            marginTop: '4px',
                            maxHeight: '220px',
                            overflowY: 'auto',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="filter-popover-title">Seleccionar Elemento Padre</div>
                          {items
                            .filter((x) => x.id !== activeItem.id)
                            .map((cand) => {
                              const isSelected = activeItem.parentId === cand.id;
                              return (
                                <button
                                  key={cand.id}
                                  type="button"
                                  className={`filter-item-btn ${isSelected ? 'selected' : ''}`}
                                  onClick={() => {
                                    updateDraft({ parentId: cand.id });
                                    setEditorParentSelectOpen(false);
                                  }}
                                  style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                                >
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                                    <b style={{ color: cand.kind === 'hito' ? '#0284c7' : '#64748b', marginRight: 5 }}>
                                      {cand.kind === 'hito' ? `[Componente] ${cand.code}` : `└ ${cand.code}`}
                                    </b>
                                    {cand.name}
                                  </span>
                                  {isSelected && <Check size={14} className="item-check" style={{ color: '#0284c7', flexShrink: 0 }} />}
                                </button>
                              );
                            })}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Contenedor Opcional PMBOK: Fase del Ciclo de Vida y Clasificación EDT */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '4px' }}>
                  <label className="field" style={{ margin: 0 }}>
                    <span>Clasificación EDT (PMBOK)</span>
                    <select
                      value={activeItem.edtType || resolveEdtNodeType(activeItem, items)}
                      onChange={(e) => updateDraft({ edtType: e.target.value as EdtNodeType })}
                      style={{
                        height: '34px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        padding: '0 8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0f172a',
                        background: '#ffffff',
                      }}
                    >
                      {activeItem.kind === 'hito' ? (
                        <>
                          <option value="COMPONENTE">Componente (Nivel 1 EDT)</option>
                          <option value="HITO">Hito (Control Duración 0)</option>
                        </>
                      ) : (
                        <>
                          <option value="SUBCOMPONENTE">Subcomponente (Subdivisión EDT)</option>
                          <option value="PAQUETE_TRABAJO">Paquete de Trabajo (Ejecutable)</option>
                          <option value="ENTREGABLE">Entregable (Producto / Evidencia)</option>
                          <option value="HITO">Hito (Control Duración 0)</option>
                        </>
                      )}
                    </select>
                  </label>
                  <label className="field" style={{ margin: 0 }}>
                    <span>Fase del Ciclo de Vida (Opcional)</span>
                    <select
                      value={activeItem.faseId || ''}
                      onChange={(e) => updateDraft({ faseId: e.target.value ? e.target.value : null })}
                      style={{
                        height: '34px',
                        borderRadius: '6px',
                        border: '1px solid #cbd5e1',
                        padding: '0 8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: '#0f172a',
                        background: '#ffffff',
                      }}
                    >
                      <option value="">Sin fase asignada (Directo en EDT)</option>
                      {PROJECT_PHASES_CATALOG.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.code} · {f.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* 1. Nombre */}
                <label className="field">
                  <span>Nombre ({getEdtNodeDisplayLabel(activeItem, items)})</span>
                  <input
                    value={activeItem.name}
                    onChange={(e) => updateDraft({ name: e.target.value })}
                    placeholder="Nombre del componente o subcomponente..."
                  />
                </label>

                {/* 2. Descripción y Alcance */}
                <label className="field">
                  <span>Descripción y Alcance</span>
                  <textarea
                    value={activeItem.description || ''}
                    onChange={(e) => updateDraft({ description: e.target.value })}
                    placeholder="Describe el alcance y el resultado esperado..."
                  />
                </label>

                {/* 3. Entregables Oficiales (Criterios de Cumplimiento) */}
                <div className="field">
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 650, color: '#334155' }}>
                      <Target size={13} style={{ color: '#2563eb' }} />
                      Entregables Oficiales ({getActiveDeliverables(activeItem).length})
                    </span>
                    <button
                      type="button"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#0284c7',
                        fontSize: '11.5px',
                        fontWeight: 650,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: 0,
                      }}
                      onClick={() => setShowAddDeliverable((v) => !v)}
                    >
                      <Plus size={12} />
                      <span>Agregar entregable</span>
                    </button>
                  </div>

                  {/* Formulario en línea para nuevo entregable */}
                  {showAddDeliverable && (
                    <div style={{ background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '12px', marginBottom: '8px' }}>
                      <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#1e293b', marginBottom: '8px' }}>
                        Nuevo Entregable Oficial
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginBottom: '8px' }}>
                        {[
                          { type: 'document' as DeliverableType, label: 'Doc / PDF', icon: FileText, color: '#2563eb' },
                          { type: 'spreadsheet' as DeliverableType, label: 'Excel / Sheets', icon: FileSpreadsheet, color: '#16a34a' },
                          { type: 'presentation' as DeliverableType, label: 'Canva / PPT', icon: Presentation, color: '#ea580c' },
                          { type: 'link' as DeliverableType, label: 'Enlace Web', icon: ExternalLink, color: '#7c3aed' },
                          { type: 'physical' as DeliverableType, label: 'Físico', icon: Package, color: '#d97706' },
                        ].map((btn) => {
                          const IconComponent = btn.icon;
                          const isSel = newDelivType === btn.type;
                          return (
                            <button
                              key={btn.type}
                              type="button"
                              onClick={() => setNewDelivType(btn.type)}
                              style={{
                                flex: 1,
                                padding: '6px 4px',
                                borderRadius: '6px',
                                border: isSel ? `1.5px solid ${btn.color}` : '1px solid #e2e8f0',
                                background: isSel ? '#ffffff' : '#f1f5f9',
                                color: isSel ? btn.color : '#64748b',
                                fontSize: '10.5px',
                                fontWeight: isSel ? 700 : 500,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '3px',
                                cursor: 'pointer',
                              }}
                            >
                              <IconComponent size={14} />
                              <span>{btn.label}</span>
                            </button>
                          );
                        })}
                      </div>
                      <input
                        value={newDelivName}
                        onChange={(e) => setNewDelivName(e.target.value)}
                        placeholder="Nombre del entregable (ej. Acta de Conformidad, Plan Excel)..."
                        style={{
                          width: '100%',
                          height: '34px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          padding: '0 10px',
                          fontSize: '12px',
                          marginBottom: '6px',
                          boxSizing: 'border-box',
                        }}
                      />
                      <input
                        value={newDelivUrl}
                        onChange={(e) => setNewDelivUrl(e.target.value)}
                        placeholder="URL de enlace en línea (opcional: Canva, OneDrive, Google Drive...)"
                        style={{
                          width: '100%',
                          height: '34px',
                          borderRadius: '6px',
                          border: '1px solid #cbd5e1',
                          padding: '0 10px',
                          fontSize: '12px',
                          marginBottom: '8px',
                          boxSizing: 'border-box',
                        }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '4px' }}>
                        <button
                          type="button"
                          style={{
                            minHeight: 'unset',
                            height: '30px',
                            padding: '0 12px',
                            fontSize: '11.5px',
                            fontWeight: 600,
                            borderRadius: '6px',
                            border: '1px solid #cbd5e1',
                            background: '#ffffff',
                            color: '#475569',
                            cursor: 'pointer',
                          }}
                          onClick={() => setShowAddDeliverable(false)}
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          style={{
                            minHeight: 'unset',
                            height: '30px',
                            padding: '0 14px',
                            fontSize: '11.5px',
                            fontWeight: 650,
                            borderRadius: '6px',
                            border: '1px solid #0066ff',
                            background: '#0066ff',
                            color: '#ffffff',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            boxShadow: 'none',
                          }}
                          onClick={() => {
                            if (!newDelivName.trim()) {
                              notify('Ingresa el nombre del entregable');
                              return;
                            }
                            handleAddDeliverable({
                              name: newDelivName.trim(),
                              type: newDelivType,
                              url: newDelivUrl.trim() || undefined,
                            });
                          }}
                        >
                          <Plus size={13} />
                          <span>Guardar entregable</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Lista de Entregables */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {getActiveDeliverables(activeItem).map((deliv) => {
                      const IconComp =
                        deliv.type === 'spreadsheet'
                          ? FileSpreadsheet
                          : deliv.type === 'presentation'
                          ? Presentation
                          : deliv.type === 'link'
                          ? Link2
                          : deliv.type === 'physical'
                          ? Package
                          : FileText;
                      const iconColor =
                        deliv.type === 'spreadsheet'
                          ? '#16a34a'
                          : deliv.type === 'presentation'
                          ? '#ea580c'
                          : deliv.type === 'link'
                          ? '#7c3aed'
                          : deliv.type === 'physical'
                          ? '#d97706'
                          : '#2563eb';
                      return (
                        <div
                          key={deliv.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '8px 10px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '7px',
                            gap: '8px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                width: '28px',
                                height: '28px',
                                borderRadius: '6px',
                                background: `${iconColor}15`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                flexShrink: 0,
                              }}
                            >
                              <IconComp size={15} style={{ color: iconColor }} />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <b
                                style={{
                                  fontSize: '12px',
                                  color: '#0f172a',
                                  display: 'block',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {deliv.name}
                              </b>
                              <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                                {deliv.type === 'spreadsheet'
                                  ? 'Matriz Excel'
                                  : deliv.type === 'presentation'
                                  ? 'Presentación / Canva'
                                  : deliv.type === 'link'
                                  ? 'Enlace Web'
                                  : deliv.type === 'physical'
                                  ? 'Bien / Entrega Física'
                                  : 'Documento Oficial'}
                                {deliv.url ? ' · En línea' : ''}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenDeliverable(deliv)}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: '5px',
                                padding: '4px 7px',
                                color: '#0f172a',
                                fontSize: '11px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                              }}
                              title="Abrir en pestaña nueva del navegador"
                            >
                              <ExternalLink size={12} color="#0284c7" />
                              <span style={{ fontWeight: 600 }}>Abrir</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleRemoveDeliverable(deliv.id)}
                              style={{
                                background: 'transparent',
                                border: 'none',
                                color: '#94a3b8',
                                padding: '4px',
                                cursor: 'pointer',
                              }}
                              title="Eliminar entregable"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                    {getActiveDeliverables(activeItem).length === 0 && !showAddDeliverable && (
                      <div
                        style={{
                          padding: '10px',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '6px',
                          textAlign: 'center',
                          color: '#64748b',
                          fontSize: '11.5px',
                        }}
                      >
                        Sin entregables oficiales vinculados
                      </div>
                    )}
                  </div>
                </div>

                {/* 4. Fechas (Inicio y Fin) */}
                <div className="date-fields">
                  <div className="field relative">
                    <span>Fecha de inicio</span>
                    <button
                      type="button"
                      className={`custom-date-btn ${editorCalOpen === 'start' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditorReportTypeOpen(false);
                        setEditorStatusOpen(false);
                        setEditorCalOpen((p) => p === 'start' ? null : 'start');
                      }}
                      title="Seleccionar fecha de inicio con calendario institucional"
                    >
                      <span>{formatDatePE(activeItem.start)}</span>
                      <CalendarDays size={14} className="date-btn-icon" />
                    </button>
                    {editorCalOpen === 'start' && (
                      <MiniCalendar
                        value={activeItem.start}
                        onChange={(newDate) => {
                          setDraftStart(newDate);
                          setEditorCalOpen(null);
                        }}
                        onClose={() => setEditorCalOpen(null)}
                        align="left"
                      />
                    )}
                  </div>

                  <div className="field relative">
                    <span>Fecha de fin</span>
                    <button
                      type="button"
                      className={`custom-date-btn ${editorCalOpen === 'end' ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditorReportTypeOpen(false);
                        setEditorStatusOpen(false);
                        setEditorCalOpen((p) => p === 'end' ? null : 'end');
                      }}
                      title="Seleccionar fecha de fin con calendario institucional"
                    >
                      <span>{formatDatePE(activeItem.end)}</span>
                      <CalendarDays size={14} className="date-btn-icon" />
                    </button>
                    {editorCalOpen === 'end' && (
                      <MiniCalendar
                        value={activeItem.end}
                        min={activeItem.start}
                        onChange={(newDate) => {
                          setDraftEnd(newDate);
                          setEditorCalOpen(null);
                        }}
                        onClose={() => setEditorCalOpen(null)}
                        align="right"
                      />
                    )}
                  </div>
                </div>

                {/* 4b. Línea base y cumplimiento real */}
                <div className="baseline-box">
                  <div className="baseline-head">
                    <b>Línea base y cumplimiento</b>
                    {(() => {
                      const dev = getDeviationDays(activeItem, currentTodayIso);
                      return <span className={`dev-pill ${getDeviationTone(dev)}`}>{formatDeviation(dev)}</span>;
                    })()}
                  </div>
                  <div className="baseline-row">
                    <span className="baseline-label">Línea base</span>
                    <span className="baseline-value">
                      {hasBaseline(activeItem)
                        ? `${formatDatePE(activeItem.baselineStart)} — ${formatDatePE(activeItem.baselineEnd)}`
                        : 'Sin línea base'}
                    </span>
                    <button
                      type="button"
                      className="baseline-btn"
                      onClick={() => updateDraft({ baselineStart: activeItem.start, baselineEnd: activeItem.end })}
                      title="Congela las fechas de inicio y fin actuales como planificación aprobada"
                    >
                      <Anchor size={12} />
                      {hasBaseline(activeItem) ? 'Actualizar con fechas actuales' : 'Fijar con fechas actuales'}
                    </button>
                  </div>
                  <div className="date-fields">
                    <div className="field relative">
                      <span>Inicio real</span>
                      <button
                        type="button"
                        className={`custom-date-btn ${editorCalOpen === 'actualStart' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditorReportTypeOpen(false);
                          setEditorStatusOpen(false);
                          setEditorCalOpen((p) => (p === 'actualStart' ? null : 'actualStart'));
                        }}
                        title="Fecha en que realmente comenzó (se registra sola al iniciar)"
                      >
                        <span>{activeItem.actualStart ? formatDatePE(activeItem.actualStart) : '—'}</span>
                        <CalendarDays size={14} className="date-btn-icon" />
                      </button>
                      {editorCalOpen === 'actualStart' && (
                        <MiniCalendar
                          value={activeItem.actualStart || activeItem.start}
                          onChange={(newDate) => {
                            updateDraft({ actualStart: newDate || undefined });
                            setEditorCalOpen(null);
                          }}
                          onClose={() => setEditorCalOpen(null)}
                          align="left"
                        />
                      )}
                    </div>
                    <div className="field relative">
                      <span>Fin real</span>
                      <button
                        type="button"
                        className={`custom-date-btn ${editorCalOpen === 'actualEnd' ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditorReportTypeOpen(false);
                          setEditorStatusOpen(false);
                          setEditorCalOpen((p) => (p === 'actualEnd' ? null : 'actualEnd'));
                        }}
                        title="Fecha en que realmente se cumplió (se registra sola al completar)"
                      >
                        <span>{activeItem.actualEnd ? formatDatePE(activeItem.actualEnd) : '—'}</span>
                        <CalendarDays size={14} className="date-btn-icon" />
                      </button>
                      {editorCalOpen === 'actualEnd' && (
                        <MiniCalendar
                          value={activeItem.actualEnd || activeItem.end}
                          onChange={(newDate) => {
                            updateDraft({ actualEnd: newDate || undefined });
                            setEditorCalOpen(null);
                          }}
                          onClose={() => setEditorCalOpen(null)}
                          align="right"
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* 5. Estado de cumplimiento */}
                <div className="field relative">
                  <span>Estado de cumplimiento</span>
                  <div className="filter-dropdown-wrap">
                    <button
                      type="button"
                      className={`filter-card-btn ${editorStatusOpen ? 'active' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditorCalOpen(null);
                        setEditorReportTypeOpen(false);
                        setEditorStatusOpen((v) => !v);
                      }}
                    >
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span className={`status ${STATUS_CLASS[activeItem.status]}`}>
                          {activeItem.status}
                        </span>
                      </span>
                      <ChevronDown
                        size={14}
                        className="filter-chevron"
                        style={{
                          transform: editorStatusOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.15s ease',
                          color: '#64748b',
                        }}
                      />
                    </button>
                    {editorStatusOpen && (
                      <div className="filter-card-popover" onClick={(e) => e.stopPropagation()}>
                        <div className="filter-popover-title">Estado Oficial</div>
                        {STATUS_OPTIONS.map((st) => (
                          <button
                            key={st}
                            type="button"
                            className={`filter-item-btn ${activeItem.status === st ? 'selected' : ''}`}
                            onClick={() => {
                              setDraftStatus(st);
                              setEditorStatusOpen(false);
                            }}
                          >
                            <span className={`status ${STATUS_CLASS[st]}`}>{st}</span>
                            {activeItem.status === st && (
                              <Check size={14} className="item-check" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* 6. Avance */}
                <div className="progress-edit">
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Avance</span>
                    <b style={{ fontSize: '13px', color: '#0f172a' }}>{activeItem.progress}%</b>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={activeItem.progress}
                    onChange={(e) => setDraftProgress(+e.target.value)}
                  />
                </div>

                {/* 7. Tipo de reporte */}
                {activeItem.kind === 'hito' && (
                  <div className="field relative">
                    <span>Tipo de reporte</span>
                    <div className="filter-dropdown-wrap">
                      <button
                        type="button"
                        className={`filter-card-btn ${editorReportTypeOpen ? 'active' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditorCalOpen(null);
                          setEditorStatusOpen(false);
                          setEditorReportTypeOpen((v) => !v);
                        }}
                      >
                        <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#0f172a' }}>
                          {activeItem.reportType || 'Línea de tiempo'}
                        </span>
                        <ChevronDown
                          size={14}
                          className="filter-chevron"
                          style={{
                            transform: editorReportTypeOpen ? 'rotate(180deg)' : 'none',
                            transition: 'transform 0.15s ease',
                            color: '#64748b',
                          }}
                        />
                      </button>
                      {editorReportTypeOpen && (
                        <div className="filter-card-popover" onClick={(e) => e.stopPropagation()}>
                          <div className="filter-popover-title">Formato de Reporte</div>
                          {[
                            'Línea de tiempo',
                            'Matriz de entregables',
                            'Registro de entregas',
                            'Consolidado de datos',
                            'Informe de cierre',
                          ].map((opt) => (
                            <button
                              key={opt}
                              type="button"
                              className={`filter-item-btn ${(activeItem.reportType || 'Línea de tiempo') === opt ? 'selected' : ''}`}
                              onClick={() => {
                                updateDraft({ reportType: opt });
                                setEditorReportTypeOpen(false);
                              }}
                            >
                              <span>{opt}</span>
                              {(activeItem.reportType || 'Línea de tiempo') === opt && (
                                <Check size={14} className="item-check" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. Desglose de Tareas vinculadas (100% Dinámico) */}
                {(() => {
                  const tasks = getLinkedTasks(activeItem.name);
                  const total = tasks.length;
                  const completed = tasks.filter((t: any) => t.status === 'Cumple' || t.status === 'Completado' || t.status === 'Completada').length;
                  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                  return (
                    <div className="field" style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                          <CheckSquare size={15} style={{ color: '#0284c7' }} />
                          Tareas vinculadas ({total})
                        </span>
                        <button
                          type="button"
                          style={{
                            background: '#f0f9ff',
                            border: '1px solid #bae6fd',
                            borderRadius: '6px',
                            color: '#0284c7',
                            fontSize: '12px',
                            fontWeight: 650,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 10px',
                            transition: 'all 0.15s ease',
                          }}
                          onClick={() => handleOpenCreateTaskModal(activeItem.name)}
                        >
                          <Plus size={13} />
                          <span>Crear tarea para este componente</span>
                        </button>
                      </div>

                      <div className="task-relation-box">
                        <div className="task-relation-head">
                          <span style={{ fontSize: '13.5px', fontWeight: 650, color: '#0f172a' }}>
                            {total === 0 ? 'Sin tareas operativas asignadas' : `${completed} de ${total} completadas`}
                          </span>
                          <span className="task-relation-badge">
                            {total === 0 ? '0 tareas · 0%' : `${pct}% ejecutado`}
                          </span>
                        </div>
                        <div className="task-relation-bar">
                          <div
                            className="task-relation-fill"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: pct === 100 ? '#16a34a' : pct >= 40 ? '#0284c7' : '#f59e0b',
                            }}
                          />
                        </div>

                        {/* Lista interactiva de tareas vinculadas si existen */}
                        {total > 0 && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '4px 0' }}>
                            {tasks.map((task: any) => {
                              const isDone = task.status === 'Cumple' || task.status === 'Completado' || task.status === 'Completada';
                              return (
                                <div
                                  key={task.id}
                                  style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    padding: '8px 12px',
                                    background: '#f8fafc',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '7px',
                                    fontSize: '13px',
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isDone}
                                    onChange={() => handleToggleTask(task.id)}
                                    style={{ cursor: 'pointer', accentColor: '#16a34a', width: '15px', height: '15px' }}
                                  />
                                  <span
                                    style={{
                                      flex: 1,
                                      color: isDone ? '#94a3b8' : '#0f172a',
                                      textDecoration: isDone ? 'line-through' : 'none',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      fontWeight: 500,
                                    }}
                                  >
                                    {task.title}
                                  </span>
                                  <span
                                    style={{
                                      fontSize: '11px',
                                      fontWeight: 700,
                                      padding: '2px 8px',
                                      borderRadius: '4px',
                                      background: isDone ? '#dcfce7' : '#f1f5f9',
                                      color: isDone ? '#15803d' : '#475569',
                                    }}
                                  >
                                    {task.status || 'Pendiente'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '2px' }}>
                          <span style={{ fontSize: '12px', color: '#64748b' }}>
                            {total > 0
                              ? `${total} tarea(s) sincronizadas con módulo Tareas Kanban`
                              : 'Vincula tareas operativas con responsables y fechas para medir el avance del componente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 9. Documentos de Sustento (Múltiples con apertura en pestaña nueva) */}
                <div className="field" style={{ marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                      <Paperclip size={15} style={{ color: '#0284c7' }} />
                      Documentos de Sustento ({getActiveAttachments(activeItem).length})
                    </span>
                    <button
                      type="button"
                      style={{
                        background: '#f0f9ff',
                        border: '1px solid #bae6fd',
                        borderRadius: '6px',
                        color: '#0284c7',
                        fontSize: '12px',
                        fontWeight: 650,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        padding: '4px 10px',
                        transition: 'all 0.15s ease',
                      }}
                      onClick={() => fileRef.current?.click()}
                    >
                      <Plus size={13} />
                      <span>Adjuntar archivo</span>
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {getActiveAttachments(activeItem).map((att) => {
                      const isPdf = att.name.toLowerCase().endsWith('.pdf');
                      const isExcel = att.name.toLowerCase().endsWith('.xls') || att.name.toLowerCase().endsWith('.xlsx') || att.name.toLowerCase().endsWith('.csv');
                      return (
                        <div
                          key={att.id}
                          className="file-card"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            padding: '10px 14px',
                            background: '#ffffff',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                          }}
                        >
                          <span
                            className={isPdf ? 'pdf' : isExcel ? 'status' : 'pdf'}
                            style={{
                              background: isExcel ? '#16a34a' : isPdf ? '#dc2626' : '#2563eb',
                              color: '#ffffff',
                              fontSize: '10.5px',
                              fontWeight: 750,
                              padding: '3px 7px',
                              borderRadius: '5px',
                              flexShrink: 0,
                            }}
                          >
                            {isPdf ? 'PDF' : isExcel ? 'XLS' : 'DOC'}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <b style={{ fontSize: '13px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#0f172a' }}>
                              {att.name}
                            </b>
                            <small style={{ fontSize: '11.5px', color: '#64748b' }}>
                              {att.date || 'Sustento oficial'}
                            </small>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <button
                              type="button"
                              onClick={() => handleOpenAttachment(att)}
                              style={{
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                padding: '4px 9px',
                                color: '#0f172a',
                                fontSize: '11.5px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                cursor: 'pointer',
                                fontWeight: 600,
                              }}
                              title="Abrir documento en pestaña nueva"
                            >
                              <ExternalLink size={12} color="#0284c7" />
                              <span>Ver</span>
                            </button>
                            <button
                              type="button"
                              style={{ border: 0, background: 'transparent', cursor: 'pointer', padding: '4px', color: '#94a3b8' }}
                              onClick={() => handleRemoveAttachment(att.id)}
                              title="Eliminar archivo"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {getActiveAttachments(activeItem).length === 0 && (
                      <div
                        style={{
                          padding: '16px',
                          border: '1px dashed #cbd5e1',
                          borderRadius: '8px',
                          textAlign: 'center',
                          color: '#64748b',
                          fontSize: '12.5px',
                          background: '#f8fafc',
                        }}
                      >
                        Sin documentos de sustento adjuntos
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileRef}
                    hidden
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleAddAttachments(e.target.files);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Pestaña: Subcomponentes del Componente */}
            {editorTab === 'subprocesos' && (
              <div className="editor-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>
                      {activeItem.kind === 'hito' ? 'Subcomponentes' : 'Sub-elementos / Paquetes de trabajo'} ({items.filter((x) => x.parentId === activeItem.id).length})
                    </b>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>
                      {activeItem.kind === 'hito'
                        ? 'Desglose de subcomponentes, paquetes de trabajo y entregables hijos.'
                        : 'Subdivisiones y paquetes de trabajo vinculados.'}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn primary"
                    style={{ height: '32px', padding: '0 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                    onClick={() => add('subproceso', activeItem.id)}
                  >
                    <Plus size={14} />
                    <span>{activeItem.kind === 'hito' ? 'Agregar Subcomponente' : 'Agregar Sub-elemento'}</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {items.filter((x) => x.parentId === activeItem.id).map((sub) => (
                    <div
                      key={sub.id}
                      style={{
                        padding: '12px 14px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                          <FileText size={14} style={{ color: '#0284c7', flexShrink: 0 }} />
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>{sub.code}</span>
                          <b style={{ fontSize: '12.5px', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sub.name}
                          </b>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '11.5px', color: '#64748b' }}>
                          <span>{formatDatePE(sub.start)} – {formatDatePE(sub.end)}</span>
                          <span>•</span>
                          <b>{sub.progress}%</b>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        <span className={`status ${STATUS_CLASS[sub.status]}`} style={{ fontSize: '11px' }}>
                          {sub.status}
                        </span>
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ height: '28px', padding: '0 10px', fontSize: '11.5px' }}
                          onClick={() => openEditorForItem(sub)}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  ))}
                  {items.filter((x) => x.parentId === activeItem.id).length === 0 && (
                    <div style={{ textAlign: 'center', padding: '36px 16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                      <FileText size={28} style={{ color: '#94a3b8', margin: '0 auto 8px' }} />
                      <b style={{ fontSize: '13px', color: '#334155', display: 'block' }}>
                        {activeItem.kind === 'hito' ? 'No hay subcomponentes asignados' : 'No hay sub-elementos asignados'}
                      </b>
                      <span style={{ fontSize: '12px', color: '#64748b', display: 'block', margin: '4px 0 14px' }}>
                        {activeItem.kind === 'hito'
                          ? 'Desglosa este componente en subcomponentes o paquetes de trabajo estructurados.'
                          : 'Desglosa este subcomponente en niveles operativos de mayor detalle.'}
                      </span>
                      <button
                        type="button"
                        className="btn primary"
                        style={{ height: '32px', padding: '0 14px', fontSize: '12px', margin: '0 auto', display: 'inline-flex', alignItems: 'center', gap: '5px' }}
                        onClick={() => add('subproceso', activeItem.id)}
                      >
                        <Plus size={14} />
                        <span>{activeItem.kind === 'hito' ? 'Crear primer subcomponente' : 'Crear primer sub-elemento'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pestaña: Dependencias y Prelaciones */}
            {editorTab === 'dependencias' && (
              <div className="editor-body">
                <div style={{ marginBottom: 12 }}>
                  <b style={{ fontSize: '13.5px', color: '#0f172a', display: 'block' }}>
                    Dependencias y Prelación (Ruta Crítica)
                  </b>
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    Configura qué hitos deben finalizar antes de iniciar esta etapa (Finish-to-Start).
                  </span>
                </div>

                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '12px 14px', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '12.5px', fontWeight: 650 }}>
                    <ArrowRight size={15} />
                    <span>Cadena de Prelación Oficial</span>
                  </div>
                  <p style={{ margin: '4px 0 0', fontSize: '11.5px', color: '#15803d', lineHeight: 1.4 }}>
                    Los desfases en el hito predecesor alertarán automáticamente sobre posibles cuellos de botella en la entrega.
                  </p>
                </div>

                <div className="field relative">
                  <span>Vincular Componente Predecesor (Requisito previo)</span>
                  <div className="filter-dropdown-wrap" style={{ position: 'relative' }}>
                    <button
                      type="button"
                      className={`filter-card-btn ${editorDepSelectOpen ? 'active' : ''}`}
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
                        setEditorCalOpen(null);
                        setEditorStatusOpen(false);
                        setEditorReportTypeOpen(false);
                        setEditorHitoSelectOpen(false);
                        setEditorParentSelectOpen(false);
                        setEditorDepSelectOpen((v) => !v);
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          fontWeight: 600,
                          color: '#0f172a',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          textAlign: 'left',
                        }}
                      >
                        {(() => {
                          const currentPredecessorId = activeItem.dependencies?.[0] || (activeItem.kind === 'hito' ? activeItem.parentId : undefined);
                          const dep = items.find((x) => x.id === currentPredecessorId);
                          return dep ? `${dep.code} ${dep.name}` : 'Sin predecesor (Actividad inicial o independiente)';
                        })()}
                      </span>
                      <ChevronDown
                        size={14}
                        className="filter-chevron"
                        style={{
                          transform: editorDepSelectOpen ? 'rotate(180deg)' : 'none',
                          transition: 'transform 0.15s ease',
                          color: '#64748b',
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      />
                    </button>
                    {editorDepSelectOpen && (
                      <div
                        className="filter-card-popover"
                        style={{
                          position: 'absolute',
                          top: '100%',
                          left: 0,
                          right: 0,
                          zIndex: 9999,
                          marginTop: '4px',
                          maxHeight: '220px',
                          overflowY: 'auto',
                          background: '#ffffff',
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px',
                          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="filter-popover-title">Predecesor en Cadena / Ruta Crítica</div>
                        <button
                          type="button"
                          className={`filter-item-btn ${!(activeItem.dependencies?.[0] || (activeItem.kind === 'hito' && activeItem.parentId)) ? 'selected' : ''}`}
                          onClick={() => {
                            updateDraft({ dependencies: [] });
                            setEditorDepSelectOpen(false);
                          }}
                          style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                        >
                          <span style={{ fontSize: '12px' }}>Sin predecesor (Actividad inicial o independiente)</span>
                          {!(activeItem.dependencies?.[0] || (activeItem.kind === 'hito' && activeItem.parentId)) && (
                            <Check size={14} className="item-check" style={{ color: '#0284c7', flexShrink: 0 }} />
                          )}
                        </button>
                        {items
                          .filter((h) => h.id !== activeItem.id)
                          .map((h) => {
                            const currentPredecessorId = activeItem.dependencies?.[0] || (activeItem.kind === 'hito' ? activeItem.parentId : undefined);
                            const isSelected = currentPredecessorId === h.id;
                            return (
                              <button
                                key={h.id}
                                type="button"
                                className={`filter-item-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  updateDraft({ dependencies: [h.id] });
                                  setEditorDepSelectOpen(false);
                                }}
                                style={{ width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                              >
                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12px' }}>
                                  <b style={{ color: '#0284c7', marginRight: 5 }}>{h.code}</b> {h.name} (Fin: {formatDatePE(h.end)})
                                </span>
                                {isSelected && <Check size={14} className="item-check" style={{ color: '#0284c7', flexShrink: 0 }} />}
                              </button>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>

                {(() => {
                  const currentPredecessorId = activeItem.dependencies?.[0] || (activeItem.kind === 'hito' ? activeItem.parentId : undefined);
                  const predItem = currentPredecessorId ? items.find((x) => x.id === currentPredecessorId) : null;
                  if (!predItem) return null;
                  return (
                    <div style={{ marginTop: 12, padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                      <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Flujo de Prelación Configurado
                      </small>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: 8 }}>
                        <div style={{ padding: '6px 10px', background: '#e2e8f0', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#1e293b' }}>
                          {predItem.code} {predItem.name}
                        </div>
                        <ArrowRight size={16} color="#0284c7" />
                        <div style={{ padding: '6px 10px', background: '#dbeafe', border: '1px solid #bfdbfe', borderRadius: '6px', fontSize: '12px', fontWeight: 700, color: '#1d4ed8' }}>
                          {activeItem.code} {activeItem.name}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="editor-footer">
              <button className="delete" onClick={deleteItem}>
                <Trash2 size={15} />
                <span>{isNewDraft ? 'Cancelar borrador' : 'Eliminar'}</span>
              </button>
              <button
                className="btn primary"
                style={{ flex: 1 }}
                onClick={handleSaveDrawer}
              >
                <Save size={15} />
                <span>Guardar cambios</span>
              </button>
            </div>
          </aside>
        )}

        {/* Modal Pop-up de Alerta Centrado: Salir sin Guardar */}
        {unsavedAlertOpen && (
          <div
            className="overlay"
            style={{ zIndex: 99999 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setUnsavedAlertOpen(false);
                setPendingCloseAction(null);
              }
            }}
          >
            <div className="unsaved-alert-modal" onClick={(e) => e.stopPropagation()}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '14px' }}>
                <div className="unsaved-alert-icon">
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 style={{ margin: '2px 0 4px', fontSize: '16.5px', fontWeight: 750, color: '#0f172a' }}>
                    ¿Salir sin guardar cambios?
                  </h3>
                  <small style={{ fontSize: '12px', color: '#64748b' }}>
                    Hay modificaciones o datos pendientes en este {selected?.kind === 'hito' ? 'componente' : 'subcomponente'}.
                  </small>
                </div>
              </div>
              <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#475569', lineHeight: 1.55 }}>
                Has cargado o editado información en el formulario lateral. Si sales ahora, se descartarán los cambios no confirmados.
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn secondary"
                  style={{ height: '38px', padding: '0 16px', fontSize: '12.5px', fontWeight: 600 }}
                  onClick={() => {
                    setUnsavedAlertOpen(false);
                    setPendingCloseAction(null);
                  }}
                >
                  Continuar editando
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
                  onClick={() => {
                    setUnsavedAlertOpen(false);
                    setPanelOpen(false);
                    setDrawerDraft(null);
                    setIsNewDraft(false);
                    setEditorInitialSnapshot('');
                    if (pendingCloseAction) {
                      pendingCloseAction();
                      setPendingCloseAction(null);
                    }
                    notify('Cambios descartados');
                  }}
                >
                  <Trash2 size={14} />
                  <span>Descartar y salir</span>
                </button>
              </div>
            </div>
          </div>
        )}

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
