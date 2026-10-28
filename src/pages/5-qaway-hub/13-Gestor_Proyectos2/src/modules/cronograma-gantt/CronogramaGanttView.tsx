// @ts-nocheck
import React, { useMemo, useRef, useState, useEffect } from 'react';
import './gantt.css';
import {
  AlertTriangle,
  CalendarDays,
  ChartNoAxesColumnIncreasing,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  FileUp,
  Folder,
  FolderOpen,
  HelpCircle,
  Layers3,
  MapPin,
  MoreHorizontal,
  PanelRightOpen,
  Paperclip,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  Upload,
  UserCheck,
  Users,
  X
} from 'lucide-react';

type Status = 'Completado' | 'En curso' | 'En proceso' | 'Pendiente' | 'Con retraso' | 'Cumple';
type Kind = 'hito' | 'subproceso';
type ColKey = 'name' | 'start' | 'end' | 'duration' | 'progress' | 'status';
type EditField = ColKey;

interface Item {
  id: string;
  code: string;
  name: string;
  kind: Kind;
  parentId?: string;
  start: string;
  end: string;
  progress: number;
  status: Status;
  expanded?: boolean;
  description?: string;
  reportType?: string;
  region?: string;
  gestor?: string;
}

const INITIAL_ITEMS: Item[] = [
  {
    id: 'h1',
    code: '1.',
    name: 'Planificación de la distribución y conformación de comités',
    kind: 'hito',
    start: '2026-09-04',
    end: '2026-11-30',
    progress: 67,
    status: 'En proceso',
    expanded: true,
    description: 'Conformación de comités y elaboración del plan de distribución de materiales a nivel regional.',
    reportType: 'Línea de tiempo',
    region: 'Junín',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's11',
    code: '1.1',
    name: 'Conformación de comités UGEL',
    kind: 'subproceso',
    parentId: 'h1',
    start: '2026-09-04',
    end: '2026-09-25',
    progress: 100,
    status: 'Completado',
    region: 'Junín',
    gestor: 'María Salazar',
  },
  {
    id: 's12',
    code: '1.2',
    name: 'Elaboración y validación del plan de distribución',
    kind: 'subproceso',
    parentId: 'h1',
    start: '2026-09-26',
    end: '2026-11-30',
    progress: 55,
    status: 'En proceso',
    region: 'Junín',
    gestor: 'María Salazar',
  },
  {
    id: 'h2',
    code: '2.',
    name: 'Gestión de Almacenes y Recepción en MC SIGA',
    kind: 'hito',
    start: '2026-09-11',
    end: '2027-01-30',
    progress: 42,
    status: 'En proceso',
    expanded: true,
    description: 'Organización de almacenes territoriales y control de recepción de materiales educativos.',
    reportType: 'Matriz de entregables',
    region: 'Junín',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's21',
    code: '2.1',
    name: 'Identificación y directorio de almacenes',
    kind: 'subproceso',
    parentId: 'h2',
    start: '2026-09-11',
    end: '2026-10-20',
    progress: 100,
    status: 'Completado',
    region: 'Junín',
    gestor: 'María Salazar',
  },
  {
    id: 's22',
    code: '2.2',
    name: 'Registro de recepción de materiales (RAR / NEA)',
    kind: 'subproceso',
    parentId: 'h2',
    start: '2026-10-21',
    end: '2027-01-30',
    progress: 18,
    status: 'En proceso',
    region: 'Junín',
    gestor: 'María Salazar',
  },
  {
    id: 'h3',
    code: '3.',
    name: 'Distribución y Transporte a II.EE.',
    kind: 'hito',
    start: '2026-11-05',
    end: '2027-02-28',
    progress: 18,
    status: 'Pendiente',
    expanded: true,
    description: 'Coordinación y contratación de transporte para distribución de materiales a instituciones educativas.',
    reportType: 'Registro de entregas',
    region: 'Todas las Regiones',
    gestor: 'Javier Ruiz',
  },
  {
    id: 's31',
    code: '3.1',
    name: 'Preparación de expedientes de contratación de transporte',
    kind: 'subproceso',
    parentId: 'h3',
    start: '2026-11-05',
    end: '2026-11-30',
    progress: 0,
    status: 'Pendiente',
    region: 'Loreto',
    gestor: 'Lucía Ramos',
  },
  {
    id: 's32',
    code: '3.2',
    name: 'Coordinación de rutas críticas y transporte fluvial',
    kind: 'subproceso',
    parentId: 'h3',
    start: '2026-12-01',
    end: '2027-01-31',
    progress: 0,
    status: 'Pendiente',
    region: 'Loreto',
    gestor: 'Lucía Ramos',
  },
  {
    id: 's33',
    code: '3.3',
    name: 'Entrega física y actas de recepción con directores',
    kind: 'subproceso',
    parentId: 'h3',
    start: '2027-02-01',
    end: '2027-02-28',
    progress: 0,
    status: 'Pendiente',
    region: 'Huancavelica',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 'h4',
    code: '4.',
    name: 'Cierre, PECOSA y Consolidado Regional',
    kind: 'hito',
    start: '2027-03-01',
    end: '2027-03-30',
    progress: 0,
    status: 'Pendiente',
    expanded: true,
    description: 'Validación de actas PECOSA y consolidación regional en SIAGIE.',
    reportType: 'Consolidado de datos',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's41',
    code: '4.1',
    name: 'Validación y registro de PECOSA en SIAGIE',
    kind: 'subproceso',
    parentId: 'h4',
    start: '2027-03-01',
    end: '2027-03-15',
    progress: 0,
    status: 'Pendiente',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's42',
    code: '4.2',
    name: 'Consolidado final y balance de contingencias',
    kind: 'subproceso',
    parentId: 'h4',
    start: '2027-03-16',
    end: '2027-03-30',
    progress: 0,
    status: 'Pendiente',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 'h5',
    code: '5.',
    name: 'Informe Técnico Final MINEDU - DIGERE',
    kind: 'hito',
    start: '2027-04-01',
    end: '2027-04-30',
    progress: 0,
    status: 'Pendiente',
    expanded: true,
    description: 'Elaboración y presentación del informe final de cumplimiento normativo Dotación 2027.',
    reportType: 'Informe de cierre',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's51',
    code: '5.1',
    name: 'Consolidación de informes técnicos de gestores',
    kind: 'subproceso',
    parentId: 'h5',
    start: '2027-04-01',
    end: '2027-04-20',
    progress: 0,
    status: 'Pendiente',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
  {
    id: 's52',
    code: '5.2',
    name: 'Elevación de informe a DIGERE y cierre de ciclo',
    kind: 'subproceso',
    parentId: 'h5',
    start: '2027-04-21',
    end: '2027-04-30',
    progress: 0,
    status: 'Pendiente',
    region: 'Todas las Regiones',
    gestor: 'Carlos Mendoza',
  },
];

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

const REGION_OPTIONS = [
  { value: 'Todas', label: 'Todas' },
  { value: 'Junín', label: 'Junín' },
  { value: 'Loreto', label: 'Loreto' },
  { value: 'Huancavelica', label: 'Huancavelica' },
  { value: 'Cusco', label: 'Cusco' },
  { value: 'Pasco', label: 'Pasco' },
];

const GESTOR_OPTIONS = [
  { value: 'Todos', label: 'Todos' },
  { value: 'María Salazar', label: 'María Salazar (Junín)' },
  { value: 'Carlos Mendoza', label: 'Carlos Mendoza (Centro)' },
  { value: 'Lucía Ramos', label: 'Lucía Ramos (Loreto)' },
  { value: 'Javier Ruiz', label: 'Javier Ruiz (Transporte)' },
];

const TYPE_OPTIONS = [
  { value: 'Todos', label: 'Todos' },
  { value: 'Hitos', label: 'Solo Hitos' },
  { value: 'Subprocesos', label: 'Solo Subprocesos' },
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

const DEFAULT_COLS: Record<ColKey, number> = { name: 380, start: 95, end: 95, duration: 85, progress: 120, status: 105 };
const MIN_COLS: Record<ColKey, number> = { name: 180, start: 70, end: 70, duration: 60, progress: 75, status: 75 };

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
  min,
  max,
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

const getDays = (a: string, b: string) =>
  Math.max(1, Math.round((new Date(b).getTime() - new Date(a).getTime()) / 86400000) + 1);

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

/* Línea "Hoy" dinámica: fecha real del sistema o 2026-10-27 si el reloj está fuera del marco oficial. */
const TODAY_ISO = (() => {
  const n = new Date();
  const iso = `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, '0')}-${String(n.getDate()).padStart(2, '0')}`;
  if (iso >= RANGE_MIN && iso <= RANGE_MAX) return iso;
  return '2026-10-27';
})();

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

export default function CronogramaGanttView({
  onActions,
  onSwitchPerspective,
}: {
  onActions?: (h: any) => void;
  onSwitchPerspective?: (p: 'maestro' | 'territorial') => void;
}) {
  const [items, setItems] = useState<Item[]>(() => {
    try {
      const saved = localStorage.getItem('qaway-gantt-master-v1');
      return saved ? JSON.parse(saved) : INITIAL_ITEMS;
    } catch {
      return INITIAL_ITEMS;
    }
  });

  const [colWidths, setColWidths] = useState<Record<ColKey, number>>(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('qaway-gantt-cols-v1') || 'null');
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
  const [panelOpen, setPanelOpen] = useState(false);
  const [history, setHistory] = useState<Item[][]>([]);
  const [tab, setTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [stateFilter, setStateFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [regionFilter, setRegionFilter] = useState('Todas');
  const [gestorFilter, setGestorFilter] = useState('Todos');
  const [rangeFrom, setRangeFrom] = useState(RANGE_MIN);
  const [rangeTo, setRangeTo] = useState(RANGE_MAX);
  const [zoom, setZoom] = useState('Mes');
  const [newMenu, setNewMenu] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [attachment, setAttachment] = useState('OFICIO_MULTIPLE_00032-2026-MINEDU_Dotacion2027.pdf');
  const [pickedFile, setPickedFile] = useState('');
  const [toast, setToast] = useState('');
  const [edit, setEdit] = useState<{ id: string; field: EditField } | null>(null);
  
  type FilterMenuKey = 'region' | 'gestor' | 'state' | 'type' | 'dates' | null;
  const [activeMenu, setActiveMenu] = useState<FilterMenuKey>(null);
  const [calOpen, setCalOpen] = useState<'from' | 'to' | null>(null);
  const toggleMenu = (key: FilterMenuKey) => {
    setActiveMenu((cur) => (cur === key ? null : key));
    setCalOpen(null);
  };
  const closeMenus = () => {
    setActiveMenu(null);
    setCalOpen(null);
  };

  const fileRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const headScrollRef = useRef<HTMLDivElement>(null);
  const colRef = useRef(colWidths);
  const dragRef = useRef<{ key: ColKey; startX: number; startW: number } | null>(null);
  colRef.current = colWidths;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (headScrollRef.current) {
      headScrollRef.current.scrollLeft = e.currentTarget.scrollLeft;
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('qaway-gantt-master-v1', JSON.stringify(items));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [items]);

  const notify = (s: string) => {
    setToast(s);
    window.setTimeout(() => setToast(''), 2600);
  };

  useEffect(() => {
    onActions?.({ notify: (m: string) => notify(m) });
  }, [onActions]);

  /* ---------- Historial de Deshacer (Undo / Retroceder) ---------- */
  const commitChange = (nextOrUpdater: Item[] | ((prev: Item[]) => Item[])) => {
    setItems((prev) => {
      const next = typeof nextOrUpdater === 'function' ? nextOrUpdater(prev) : nextOrUpdater;
      if (JSON.stringify(prev) !== JSON.stringify(next)) {
        setHistory((h) => [prev, ...h].slice(0, 30));
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
    setItems(previous);
    setHistory(rest);
    notify('Cambio deshecho con éxito');
  };

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
      const w = Math.max(MIN_COLS[d.key], Math.min(800, d.startW + (e.clientX - d.startX)));
      setColWidths((c) => ({ ...c, [d.key]: w }));
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      document.body.classList.remove('gantt-resizing');
      try {
        localStorage.setItem('qaway-gantt-cols-v1', JSON.stringify(colRef.current));
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
    dragRef.current = { key, startX: e.clientX, startW: colRef.current[key] };
    document.body.classList.add('gantt-resizing');
  };

  const fixedWidth = useMemo(() => (Object.keys(colWidths) as ColKey[]).reduce((a, k) => a + colWidths[k], 0), [colWidths]);

  const timelineMinWidth = useMemo(() => {
    if (zoom === 'Día') return `${TOTAL_SPAN_DAYS * 34}px`;
    if (zoom === 'Semana') return `${Math.ceil(TOTAL_SPAN_DAYS / 7) * 80}px`;
    if (zoom === 'Mes') return `${MONTHS.length * 170}px`;
    if (zoom === 'Trimestre') return '1160px';
    return '1200px';
  }, [zoom]);

  const fixedGridCols = useMemo(
    () =>
      `${colWidths.name}px ${colWidths.start}px ${colWidths.end}px ${colWidths.duration}px ${colWidths.progress}px ${colWidths.status}px`,
    [colWidths]
  );

  const rowGridCols = useMemo(
    () => `var(--fixed) minmax(${timelineMinWidth}, 1fr)`,
    [timelineMinWidth]
  );

  /* ---------- Deslizador Temporal por Escalas y Centrado en Hoy ---------- */
  const scrollToToday = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const todayEl = container.querySelector('.today') as HTMLElement | null;
    if (todayEl) {
      const timelineVisibleWidth = Math.max(200, container.clientWidth - fixedWidth);
      const targetScroll = Math.max(0, todayEl.offsetLeft - fixedWidth - timelineVisibleWidth / 2);
      container.scrollTo({ left: targetScroll, behavior: 'smooth' });
      notify('Vista centrada en Hoy (27 de octubre de 2026)');
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
    setTimeout(() => {
      scrollToToday();
    }, 80);
  };

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
        setNewMenu(false);
        setEdit(null);
        setActiveMenu(null);
        setCalOpen(null);
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
    commitChange((old) => old.map((x) => (x.id === id ? { ...x, ...p } : x)));
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

  const selected = items.find((x) => x.id === selectedId);
  const hitos = items.filter((x) => x.kind === 'hito');
  const subs = items.filter((x) => x.kind === 'subproceso');
  const inprog = items.filter((x) => x.status === 'En proceso' || x.status === 'En curso').length;
  const late = items.filter((x) => x.status === 'Con retraso').length;
  const complete = items.filter((x) => x.status === 'Completado' || x.status === 'Cumple').length;
  const overall = Math.round(items.reduce((a, x) => a + x.progress, 0) / items.length);

  /* Rango predeterminado del botón Limpiar */
  const DEFAULT_RANGE = { from: RANGE_MIN, to: RANGE_MAX };

  const shown = useMemo(() => {
    return items.filter((x) => {
      const parent = items.find((p) => p.id === x.parentId);
      const matchSearch = `${x.code} ${x.name}`.toLowerCase().includes(search.toLowerCase());
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
        x.status === tab;
      const matchRegion =
        regionFilter === 'Todas' || x.region === 'Todas las Regiones' || x.region === regionFilter;
      const matchGestor = gestorFilter === 'Todos' || x.gestor === gestorFilter;
      /* Rango de fechas: solapamiento del ítem con el período consultado */
      const matchRange = x.start <= rangeTo && x.end >= rangeFrom;
      const notCollapsed = !parent || parent.expanded !== false;

      return (
        matchSearch && matchState && matchType && matchTab && matchRegion && matchGestor && matchRange && notCollapsed
      );
    });
  }, [items, search, stateFilter, typeFilter, tab, regionFilter, gestorFilter, rangeFrom, rangeTo]);

  const segments = useMemo(() => buildSegments(zoom), [zoom]);
  const segCols = useMemo(() => segments.map((s) => `${s.days}fr`).join(' '), [segments]);
  const yearCols = useMemo(() => ['2026', '2027'].map((y, i) => `${getDays(i === 0 ? RANGE_MIN : '2027-01-01', i === 0 ? '2026-12-31' : RANGE_MAX)}fr`).join(' '), []);
  const todayPos = calcPosition(TODAY_ISO);
  const denseZoom = zoom === 'Día' || zoom === 'Semana';

  const add = (kind: Kind) => {
    const id = 'new-' + Date.now();
    const n = kind === 'hito' ? hitos.length + 1 : subs.length + 1;
    const item: Item = {
      id,
      code: kind === 'hito' ? `${n}.` : `${Math.ceil(n / 3)}.${n}`,
      name: kind === 'hito' ? 'Nuevo hito oficial' : 'Nuevo subproceso operativo',
      kind,
      parentId: kind === 'subproceso' ? (selected?.kind === 'hito' ? selected.id : hitos[0]?.id) : undefined,
      start: '2026-10-26',
      end: '2026-11-30',
      progress: 0,
      status: 'Pendiente',
      expanded: true,
      description: 'Definido por el Coordinador General.',
      reportType: 'Línea de tiempo',
      region: 'Todas las Regiones',
      gestor: 'Carlos Mendoza',
    };

    commitChange((old) =>
      kind === 'subproceso' && item.parentId
        ? old.flatMap((x) => (x.id === item.parentId ? [x, item] : [x]))
        : [...old, item]
    );
    setSelectedId(id);
    setPanelOpen(true);
    setNewMenu(false);
    notify(`Nuevo ${kind} incorporado al cronograma maestro`);
  };

  const exportCSV = () => {
    const csv = [
      ['Código', 'Nombre', 'Tipo', 'Inicio', 'Fin', 'Duración (días)', 'Avance', 'Estado', 'Región', 'Gestor'],
      ...items.map((x) => [
        x.code,
        x.name,
        x.kind === 'hito' ? 'Hito' : 'Subproceso',
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
    a.download = `Cronograma_Maestro_MINEDU_Dotacion_2027_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify('Cronograma maestro exportado a CSV');
  };

  const deleteItem = () => {
    if (!selected || !confirm(`¿Eliminar “${selected.name}”?`)) return;
    commitChange((old) => old.filter((x) => x.id !== selected.id && x.parentId !== selected.id));
    setSelectedId(null);
    setPanelOpen(false);
    notify('Elemento eliminado del cronograma maestro');
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
              <h1>Gestión del Cronograma Regional (Gantt Maestro)</h1>
              <p>
                Eleva y calibra la línea de tiempo oficial, importa normativas MINEDU y sincroniza fechas límite para los gestores territoriales.
              </p>
            </div>
          </div>
          <div className="head-actions">
            <button className="square" onClick={exportCSV} title="Exportar cronograma CSV">
              <MoreHorizontal size={18} />
            </button>
            <button
              className="btn secondary"
              onClick={() => {
                setImportOpen(true);
                setPickedFile('');
              }}
            >
              <Upload size={15} />
              <span>Importar Cronograma Oficial</span>
              <ChevronDown size={14} />
            </button>
            <div className="menu-wrap">
              <button className="btn primary" onClick={() => setNewMenu((v) => !v)}>
                <Plus size={16} />
                <span>Agregar Hito</span>
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
                    <span>Nuevo hito rector</span>
                  </button>
                  <button
                    onClick={() => {
                      setNewMenu(false);
                      add('subproceso');
                    }}
                  >
                    <FileText size={15} />
                    <span>Nuevo subproceso</span>
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
              <strong>Hitos Rectores</strong>
              <small>oficiales del proyecto</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article className="metric green">
            <span className="metric-icon">
              <Layers3 size={22} />
            </span>
            <div className="metric-copy">
              <b>{subs.length}</b>
              <strong>Subprocesos</strong>
              <small>estructurados</small>
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
              <small>con actividad territorial</small>
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
              <small>alerta para gestores</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article className="metric overall">
            <div className="ring" style={{ '--p': `${overall}%` } as React.CSSProperties}>
              <b>{overall}%</b>
            </div>
            <div>
              <strong>Avance Regional Global</strong>
              <small>según cronograma oficial</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>
        </section>

        {/* Workspace Central */}
        <main className="workspace">
          {/* Tabs Superiores */}
          <nav className="tabs">
            {[
              { n: 'Todos', c: items.length },
              { n: 'Hitos', c: hitos.length },
              { n: 'Subprocesos', c: subs.length },
              { n: 'En proceso', c: inprog },
              { n: 'Con retraso', c: late },
              { n: 'Completados', c: complete },
            ].map((t) => (
              <button
                key={t.n}
                className={tab === t.n ? 'active' : ''}
                onClick={() => setTab(t.n)}
              >
                {t.n} <span>({t.c})</span>
              </button>
            ))}
          </nav>

          {/* Filtros Macro para Coordinador */}
          <div className="filters">
            <label className="search">
              <Search size={16} />
              <input
                placeholder="Buscar hito, subproceso o código..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button onClick={() => setSearch('')}>
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Macro-filtro Región (Custom Popover 12px) */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${activeMenu === 'region' ? 'active' : ''} ${
                  regionFilter !== 'Todas' ? 'filtered' : ''
                }`}
                onClick={() => toggleMenu('region')}
              >
                <div className="filter-card-copy">
                  <small>Región / Macro</small>
                  <span>{regionFilter === 'Todas' ? 'Todas' : regionFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>
              {activeMenu === 'region' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()}>
                  <div className="filter-popover-title">Filtrar por Región</div>
                  <div className="filter-popover-list">
                    {REGION_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`filter-item-btn ${regionFilter === opt.value ? 'selected' : ''}`}
                        onClick={() => {
                          setRegionFilter(opt.value);
                          closeMenus();
                        }}
                      >
                        <span>{opt.label}</span>
                        {regionFilter === opt.value && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Macro-filtro Gestor (Custom Popover 12px) */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${activeMenu === 'gestor' ? 'active' : ''} ${
                  gestorFilter !== 'Todos' ? 'filtered' : ''
                }`}
                onClick={() => toggleMenu('gestor')}
              >
                <div className="filter-card-copy">
                  <small>Gestor Territorial</small>
                  <span>{gestorFilter === 'Todos' ? 'Todos' : gestorFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>
              {activeMenu === 'gestor' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()}>
                  <div className="filter-popover-title">Gestor Asignado</div>
                  <div className="filter-popover-list">
                    {GESTOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`filter-item-btn ${gestorFilter === opt.value ? 'selected' : ''}`}
                        onClick={() => {
                          setGestorFilter(opt.value);
                          closeMenus();
                        }}
                      >
                        <span>{opt.label}</span>
                        {gestorFilter === opt.value && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Macro-filtro Estado (Custom Popover 12px) */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${activeMenu === 'state' ? 'active' : ''} ${
                  stateFilter !== 'Todos' ? 'filtered' : ''
                }`}
                onClick={() => toggleMenu('state')}
              >
                <div className="filter-card-copy">
                  <small>Estado</small>
                  <span>{stateFilter === 'Todos' ? 'Todos' : stateFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>
              {activeMenu === 'state' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()}>
                  <div className="filter-popover-title">Estado del Cronograma</div>
                  <div className="filter-popover-list">
                    <button
                      type="button"
                      className={`filter-item-btn ${stateFilter === 'Todos' ? 'selected' : ''}`}
                      onClick={() => {
                        setStateFilter('Todos');
                        closeMenus();
                      }}
                    >
                      <span>Todos</span>
                      {stateFilter === 'Todos' && <Check size={14} className="item-check" />}
                    </button>
                    {STATUS_OPTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`filter-item-btn ${stateFilter === s ? 'selected' : ''}`}
                        onClick={() => {
                          setStateFilter(s);
                          closeMenus();
                        }}
                      >
                        <span className={'status ' + STATUS_CLASS[s]}>{s}</span>
                        {stateFilter === s && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Macro-filtro Tipo (Custom Popover 12px) */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${activeMenu === 'type' ? 'active' : ''} ${
                  typeFilter !== 'Todos' ? 'filtered' : ''
                }`}
                onClick={() => toggleMenu('type')}
              >
                <div className="filter-card-copy">
                  <small>Tipo</small>
                  <span>{typeFilter === 'Todos' ? 'Todos' : typeFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>
              {activeMenu === 'type' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()}>
                  <div className="filter-popover-title">Jerarquía de Actividad</div>
                  <div className="filter-popover-list">
                    {TYPE_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className={`filter-item-btn ${typeFilter === opt.value ? 'selected' : ''}`}
                        onClick={() => {
                          setTypeFilter(opt.value);
                          closeMenus();
                        }}
                      >
                        <span>{opt.label}</span>
                        {typeFilter === opt.value && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rango de Fechas Operativo con Popover Redondeado Moderno (Cero calendarios nativos rectos) */}
            <div className="filter-dropdown-wrap date-range-wrap">
              <button
                type="button"
                className={`filter-card-btn date-range-btn ${activeMenu === 'dates' ? 'active' : ''} ${
                  rangeFrom !== RANGE_MIN || rangeTo !== RANGE_MAX ? 'filtered' : ''
                }`}
                onClick={() => toggleMenu('dates')}
                title="Filtrar por rango de fechas oficial"
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
                      }}
                    >
                      Q1 2027 (Ene-Mar)
                    </button>
                    <button
                      type="button"
                      className={rangeFrom === TODAY_ISO ? 'active' : ''}
                      onClick={() => {
                        setRangeFrom(TODAY_ISO);
                        setRangeTo(shiftDays(TODAY_ISO, 30));
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
                          max={rangeTo}
                          min={RANGE_MIN}
                          onChange={(v) => setRangeFrom(v)}
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
                          min={rangeFrom}
                          max={RANGE_MAX}
                          onChange={(v) => setRangeTo(v)}
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
                      }}
                    >
                      Restablecer
                    </button>
                    <button
                      type="button"
                      className="dr-apply"
                      onClick={closeMenus}
                    >
                      Aplicar Rango
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Deslizador temporal / Navegador Hoy (Estándar Qaway de imagen 2) */}
            <div className="timeline-nav" title="Navegar por la línea de tiempo">
              <button
                type="button"
                className="nav-arrow"
                onClick={() => scrollTimeline('left')}
                title="Desplazar línea de tiempo a la izquierda"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                className="today-pill"
                onClick={scrollToToday}
                title="Ir y centrar en la fecha actual (27 de octubre de 2026)"
              >
                Hoy
              </button>
              <button
                type="button"
                className="nav-arrow"
                onClick={() => scrollTimeline('right')}
                title="Desplazar línea de tiempo a la derecha"
              >
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="zoom">
              {['Día', 'Semana', 'Mes', 'Trimestre'].map((x) => (
                <button
                  type="button"
                  key={x}
                  className={zoom === x ? 'active' : ''}
                  onClick={() => handleZoomChange(x)}
                >
                  {x}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="btn secondary undo-btn"
              disabled={history.length === 0}
              onClick={handleUndo}
              title={
                history.length > 0
                  ? `Deshacer último cambio (Ctrl+Z) · ${history.length} en historial`
                  : 'No hay cambios para deshacer'
              }
            >
              <RotateCcw size={14} />
              <span>Deshacer</span>
              {history.length > 0 && <span className="undo-badge">{history.length}</span>}
            </button>

            <button
              type="button"
              className="btn secondary clear-btn"
              onClick={() => {
                setSearch('');
                setStateFilter('Todos');
                setTypeFilter('Todos');
                setRegionFilter('Todas');
                setGestorFilter('Todos');
                setRangeFrom(DEFAULT_RANGE.from);
                setRangeTo(DEFAULT_RANGE.to);
                setTab('Todos');
                closeMenus();
              }}
            >
              <RefreshCw size={14} />
              <span>Limpiar</span>
            </button>
          </div>

          {/* Cabecera Fija Inmutable (Desacoplada del scroll horizontal para evitar desalineamiento) */}
          <div className="table-head">
            <div
              className="fixed-cols"
              style={{
                width: `${fixedWidth}px`,
                minWidth: `${fixedWidth}px`,
                maxWidth: `${fixedWidth}px`,
                gridTemplateColumns: fixedGridCols,
              }}
            >
              <div className="name-head">
                <input
                  type="checkbox"
                  onChange={(e) =>
                    notify(e.target.checked ? 'Registros visibles seleccionados' : 'Selección cancelada')
                  }
                />
                <span>Hito Rector / Subproceso Oficial</span>
                <div className="col-resizer" onMouseDown={(e) => startResize(e, 'name')} />
              </div>
              <div>
                Inicio
                <div className="col-resizer" onMouseDown={(e) => startResize(e, 'start')} />
              </div>
              <div>
                Fin
                <div className="col-resizer" onMouseDown={(e) => startResize(e, 'end')} />
              </div>
              <div>
                Duración
                <div className="col-resizer" onMouseDown={(e) => startResize(e, 'duration')} />
              </div>
              <div>
                Avance
                <div className="col-resizer" onMouseDown={(e) => startResize(e, 'progress')} />
              </div>
              <div>
                Estado
                <div className="col-resizer" onMouseDown={(e) => startResize(e, 'status')} />
              </div>
            </div>

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
          </div>

          {/* Tabla Gantt con Timeline (Filas operativas con scroll 2D) */}
          <div className="gantt-scroll" ref={scrollRef} onScroll={handleScroll}>
            <div
              className="gantt"
              style={
                {
                  '--fixed': `${fixedWidth}px`,
                  width: `calc(var(--fixed) + ${timelineMinWidth})`,
                  minWidth: `calc(var(--fixed) + ${timelineMinWidth})`,
                } as React.CSSProperties
              }
            >
              {/* Filas */}
              {shown.map((x, i) => (
                <div
                  key={x.id}
                  className={`row ${x.kind === 'hito' ? 'hito' : 'sub'} ${i % 2 ? 'stripe' : ''} ${
                    selectedId === x.id ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedId(x.id);
                  }}
                  onDoubleClick={() => {
                    setSelectedId(x.id);
                    setPanelOpen(true);
                  }}
                >
                  <div
                    className="fixed-cols"
                    style={{
                      width: `${fixedWidth}px`,
                      minWidth: `${fixedWidth}px`,
                      maxWidth: `${fixedWidth}px`,
                      gridTemplateColumns: fixedGridCols,
                    }}
                  >
                    <div className="name-cell">
                    {x.kind === 'hito' ? (
                      <button
                        className="expand"
                        onClick={(e) => {
                          e.stopPropagation();
                          update(x.id, { expanded: !x.expanded });
                        }}
                      >
                        {x.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    ) : (
                      <span className="indent" />
                    )}
                    {x.kind === 'hito' ? (
                      <FolderOpen size={16} className="folder" />
                    ) : (
                      <FileText size={15} className="file" />
                    )}
                    <b className="code">{x.code}</b>
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
                          if (e.key === 'Enter') e.currentTarget.blur();
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
                  </div>

                  <div
                    className="date editable"
                    title="Clic para cambiar la fecha de inicio"
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
                        value={x.start}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => {
                          try {
                            (e.target as HTMLInputElement).showPicker?.();
                          } catch {
                            /* navegador sin soporte */
                          }
                        }}
                        onChange={(e) => setStart(x, e.target.value)}
                        onBlur={closeEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur();
                          if (e.key === 'Escape') closeEdit();
                        }}
                      />
                    ) : (
                      formatDate(x.start)
                    )}
                  </div>

                  <div
                    className="date editable"
                    title="Clic para cambiar la fecha de fin"
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
                        value={x.end}
                        min={x.start}
                        onClick={(e) => e.stopPropagation()}
                        onFocus={(e) => {
                          try {
                            (e.target as HTMLInputElement).showPicker?.();
                          } catch {
                            /* navegador sin soporte */
                          }
                        }}
                        onChange={(e) => setEnd(x, e.target.value)}
                        onBlur={closeEdit}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') e.currentTarget.blur();
                          if (e.key === 'Escape') closeEdit();
                        }}
                      />
                    ) : (
                      formatDate(x.end)
                    )}
                  </div>

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
                      `${getDays(x.start, x.end)} días`
                    )}
                  </div>

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

                  <div
                    className="status-cell editable"
                    title="Clic para cambiar el estado"
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
                              update(x.id, { status: s });
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
                </div>

                <div className="timeline" style={{ minWidth: timelineMinWidth }}>
                    <div className="month-grid" style={{ gridTemplateColumns: segCols }}>
                      {segments.map((s) => (
                        <span key={s.key} />
                      ))}
                    </div>
                    <div
                      className={`bar ${STATUS_CLASS[x.status]} ${x.kind === 'hito' ? 'major' : ''}`}
                      style={{
                        left: `${calcPosition(x.start)}%`,
                        width: `${calcWidth(x.start, x.end)}%`,
                      }}
                    >
                      {x.kind === 'hito' ? '◆' : ''}
                    </div>
                  </div>
                </div>
              ))}

              {/* Indicador dinámico de "Hoy" */}
              <div
                className="today"
                style={{
                  left: `calc(var(--fixed) + (100% - var(--fixed)) * ${todayPos / 100})`,
                }}
              >
                <span>Hoy</span>
              </div>
            </div>
          </div>

          {/* Footer de Paginación */}
          <footer className="footer">
            <span>
              Mostrando {shown.length ? 1 : 0}–{shown.length} de {items.length} registros oficiales
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                className="btn secondary"
                style={{ minHeight: '32px', fontSize: '12px' }}
                onClick={() => setPanelOpen((v) => !v)}
                title="Abrir o cerrar panel de detalles del elemento seleccionado"
              >
                <PanelRightOpen size={14} />
                <span>{panelOpen ? 'Ocultar Detalle' : 'Ver Detalle'}</span>
              </button>
              <button
                className="btn secondary"
                style={{ minHeight: '32px', fontSize: '12px' }}
                onClick={() => notify('Cronograma maestro sincronizado con la red de gestores')}
              >
                <CheckCircle2 size={14} color="#16a34a" />
                <span>Publicar a Gestores Territoriales</span>
              </button>
            </div>
          </footer>
        </main>

        {/* Panel Lateral Editor (Drawer de Coordinador) */}
        {panelOpen && selected && (
          <aside className="editor">
            <div className="editor-head">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  style={{ border: 0, background: 'transparent' }}
                  onClick={() => setPanelOpen(false)}
                >
                  <ChevronLeft size={18} />
                </button>
                <h2>Editar {selected.kind === 'hito' ? 'Hito Rector' : 'Subproceso'}</h2>
              </div>
              <button
                style={{ border: 0, background: 'transparent' }}
                onClick={() => setPanelOpen(false)}
                aria-label="Cerrar editor"
              >
                <X size={18} />
              </button>
            </div>

            <div className="editor-tabs">
              <button className="active">Información</button>
              <button
                onClick={() =>
                  notify(
                    `Subprocesos vinculados: ${items.filter((x) => x.parentId === selected.id).length}`
                  )
                }
              >
                Subprocesos ({items.filter((x) => x.parentId === selected.id).length})
              </button>
              <button onClick={() => notify('Selecciona un elemento para revisar dependencias')}>
                Dependencias
              </button>
            </div>

            <div className="editor-body">
              <label className="field">
                <span>Nombre oficial ({selected.kind})</span>
                <input
                  value={selected.name}
                  onChange={(e) => update(selected.id, { name: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Descripción y Alcance</span>
                <textarea
                  value={selected.description || ''}
                  onChange={(e) => update(selected.id, { description: e.target.value })}
                  placeholder="Describe el alcance y el resultado esperado..."
                />
              </label>

              <div className="date-fields">
                <label className="field">
                  <span>Fecha de inicio</span>
                  <input
                    type="date"
                    value={selected.start}
                    onChange={(e) => setStart(selected, e.target.value)}
                  />
                </label>
                <label className="field">
                  <span>Fecha de fin</span>
                  <input
                    type="date"
                    min={selected.start}
                    value={selected.end}
                    onChange={(e) => setEnd(selected, e.target.value)}
                  />
                </label>
              </div>

              {selected.kind === 'hito' && (
                <label className="field">
                  <span>Tipo de reporte para UGEL</span>
                  <select
                    value={selected.reportType || 'Línea de tiempo'}
                    onChange={(e) => update(selected.id, { reportType: e.target.value })}
                  >
                    {[
                      'Línea de tiempo',
                      'Matriz de entregables',
                      'Registro de entregas',
                      'Consolidado de datos',
                      'Informe de cierre',
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
              )}

              <label className="field">
                <span>Estado de cumplimiento</span>
                <select
                  value={selected.status}
                  onChange={(e) => update(selected.id, { status: e.target.value as Status })}
                >
                  {STATUS_OPTIONS.map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>

              <div className="progress-edit">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>Avance</span>
                  <b style={{ fontSize: '13px', color: '#0f172a' }}>{selected.progress}%</b>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selected.progress}
                  onChange={(e) => setProgress(selected, +e.target.value)}
                />
              </div>

              {/* Archivo de Referencia Normativa */}
              <div className="attachment">
                <span className="field-title">Documento de Sustento Oficial</span>
                {attachment && (
                  <div className="file-card">
                    <span className="pdf">PDF</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <b style={{ fontSize: '12px', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {attachment}
                      </b>
                      <small style={{ fontSize: '11px', color: '#64748b' }}>
                        {pickedFile ? 'Archivo seleccionado' : 'Referencia oficial MINEDU'}
                      </small>
                    </div>
                    <button
                      style={{ border: 0, background: 'transparent' }}
                      onClick={() => setAttachment('')}
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
                <button className="attach" onClick={() => fileRef.current?.click()}>
                  <Paperclip size={15} />
                  <span>Adjuntar nuevo archivo oficial</span>
                </button>
                <input
                  ref={fileRef}
                  hidden
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setPickedFile(f.name);
                      setAttachment(f.name);
                      notify(`Archivo "${f.name}" adjuntado al hito`);
                    }
                  }}
                />
              </div>
            </div>

            <div className="editor-footer">
              <button className="delete" onClick={deleteItem}>
                <Trash2 size={15} />
                <span>Eliminar</span>
              </button>
              <button
                className="btn primary"
                style={{ flex: 1 }}
                onClick={() => notify('Cambios guardados en el cronograma maestro')}
              >
                <Save size={15} />
                <span>Guardar cambios</span>
              </button>
            </div>
          </aside>
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
                Importar Cronograma Oficial desde Cero
              </h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '8px 0 16px', lineHeight: 1.5 }}>
                Sube el archivo normativo del Oficio Múltiple MINEDU (PDF o Excel) para vincularlo como base oficial de los hitos regionales.
              </p>
              <button className="drop" onClick={() => fileRef.current?.click()}>
                <Upload size={24} />
                <b style={{ fontSize: '13px' }}>{pickedFile || 'Arrastra un archivo o haz clic aquí'}</b>
                <small style={{ fontSize: '11px', color: '#64748b' }}>PDF, Excel, Word o CSV</small>
              </button>
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
