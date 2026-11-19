// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import '../cronograma-gantt/gantt.css';
import './reuniones.css';
import { generateGoogleCalendarUrl, downloadIcsFile } from './calendarExport';
import { useTableEngine, ColumnHeader, TableEngineStatus, type ColumnDef } from '../../shared/table-engine';
import {
  Activity,
  ArrowDownUp,
  ArrowLeft,
  ArrowRight,
  Bell,
  CalendarDays,
  CalendarPlus,
  Check,
  CheckCheck,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Clock3,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  Flag,
  Globe2,
  LayoutGrid,
  List as ListIcon,
  Map as MapIcon,
  MapPin,
  Menu,
  MoreHorizontal,
  Navigation,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Share2,
  Sparkles,
  Users,
  Video,
  X,
  Route,
  CalendarClock,
  Paperclip,
  Trash2,
  CircleCheck,
  CircleAlert,
  Building2,
  Link2,
  CheckCircle2,
  Pencil,
  Eye,
  MessageSquareText,
  ChartNoAxesColumnIncreasing,
} from 'lucide-react';

import EstadoReunionCatalogoSelect from './EstadoReunionCatalogoSelect';
import TipoReunionCatalogoSelect from './TipoReunionCatalogoSelect';
import {
  ESTADOS_REUNION,
  claseEstadoReunion,
  etiquetaEstadoReunion,
  normalizarEstadoReunion,
  type EstadoReunionCodigo,
} from './estadoReunion';

/** Estado = código del catálogo real `gp_estados_reunion_c` (ver estadoReunion.ts). */
type MeetingStatus = EstadoReunionCodigo;
type Modality = 'Presencial' | 'Google Meet';
type Meeting = {
  id: string;
  title: string;
  project: string;
  purpose: string;
  date: string;
  start: string;
  end: string;
  modality: Modality;
  region: string;
  site: string;
  address: string;
  status: MeetingStatus;
  tipoCodigo?: string;
  attendees: string[];
  owner: string;
  meetUrl: string;
  agenda: string;
  travel: number;
  buffer: number;
  notes: string;
  actStatus: 'Pendiente' | 'En proceso' | 'Cumple';
  agreements: number;
};
type ViewKey = 'Agenda' | 'Lista' | 'Mapa' | 'Itinerario' | 'Actas';

const initialMeetings: Meeting[] = [];

const views: { label: ViewKey; icon: typeof CalendarDays }[] = [
  { label: 'Agenda', icon: CalendarDays },
  { label: 'Lista', icon: ListIcon },
  { label: 'Mapa', icon: MapIcon },
  { label: 'Itinerario', icon: Route },
  { label: 'Actas', icon: FileText },
];

const formatDate = (date: string) =>
  new Date(`${date}T12:00:00`)
    .toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
    .replace('.', '');

const dayName = (date: string) =>
  new Date(`${date}T12:00:00`).toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' });

const durationMins = (start: string, end: string) => {
  const [sh, sm] = start.split(':').map(Number);
  const [eh, em] = end.split(':').map(Number);
  return eh! * 60 + em! - (sh! * 60 + sm!);
};

const uid = () => `QW-${Math.floor(100 + Math.random() * 899)}`;

/** Flujo de estados = catálogo vivo, en su columna `orden`. */
const MEETING_STATUS_FLOW: MeetingStatus[] = ESTADOS_REUNION.map((e) => e.codigo);
const MEETING_ACT_STATUS = ['Pendiente', 'En proceso', 'Cumple'];

const MEETING_COLUMNS: ColumnDef<Meeting>[] = [
  { id: 'title', label: 'Reunión', type: 'text', accessor: (m) => `${m.title} ${m.id} ${m.project}` },
  { id: 'date', label: 'Fecha y hora', type: 'date', accessor: (m) => m.date },
  { id: 'modality', label: 'Modalidad / sede', type: 'select', accessor: (m) => `${m.modality} ${m.site}` },
  { id: 'owner', label: 'Responsable', type: 'person', accessor: (m) => m.owner },
  {
    id: 'status',
    label: 'Estado',
    type: 'processState',
    accessor: (m) => m.status,
    options: MEETING_STATUS_FLOW.map((s) => ({ value: s, label: etiquetaEstadoReunion(s) })),
  },
  {
    id: 'actStatus',
    label: 'Acta',
    type: 'processState',
    accessor: (m) => m.actStatus,
    options: MEETING_ACT_STATUS.map((s) => ({ value: s, label: s })),
  },
];

export default function ReunionesView({ onActions }: { onActions?: (h: { notify: (m: string) => void }) => void }) {
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    try {
      const saved = localStorage.getItem('qaway-meetings-v1');
      const list = saved ? (JSON.parse(saved) as Meeting[]) : initialMeetings;
      const fixAct = (s: any) => ({ Borrador: 'En proceso', Aprobada: 'Cumple' }[s] || s);
      // Migración de lo ya guardado en localStorage: vocabulario viejo
      // ('Programada'|'En preparación'|'Por confirmar'|'Realizada') → códigos del catálogo.
      return list.map((m: any) => ({
        ...m,
        actStatus: fixAct(m.actStatus),
        status: normalizarEstadoReunion(m.status),
      }));
    } catch {
      return initialMeetings;
    }
  });

  const engine = useTableEngine<Meeting>({ tableId: 'reuniones-lista', columns: MEETING_COLUMNS, rows: meetings });
  const [view, setView] = useState<ViewKey>('Agenda');
  const [selectedTab, setSelectedTab] = useState<string>('Todas');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos los estados');
  const [modalityFilter, setModalityFilter] = useState('Todas las modalidades');
  const [regionFilter, setRegionFilter] = useState('Todas las regiones');
  const [openDropdown, setOpenDropdown] = useState<'region' | 'modality' | 'status' | null>(null);

  const [selectedId, setSelectedId] = useState('QW-204');
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [month, setMonth] = useState('2026-10');
  const [calendarSubView, setCalendarSubView] = useState<'mes' | 'semana' | 'dia'>('mes');
  const [selectedDateKey, setSelectedDateKey] = useState<string>('2026-10-26');
  const [dayModalDate, setDayModalDate] = useState<string | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [toast, setToast] = useState('');
  const [toastState, setToastState] = useState<{ msg: string; type?: 'success' | 'warning' | 'error' } | null>(null);
  const [newActOpen, setNewActOpen] = useState(false);
  const [actText, setActText] = useState('');
  const [actFiles, setActFiles] = useState<string[]>([]);
  const [form, setForm] = useState<Partial<Meeting>>({
    title: '',
    project: 'Distribución de Materiales DOT 2027',
    purpose: '',
    date: '2026-10-29',
    start: '09:00',
    end: '10:00',
    modality: 'Google Meet',
    region: 'Junín',
    site: 'Reunión virtual',
    address: '',
    status: 'PROGRAMADA',
    attendees: [],
    owner: 'Carlos Sandoval',
    meetUrl: '',
    agenda: '',
    travel: 0,
    buffer: 10,
    notes: '',
    actStatus: 'Pendiente',
    agreements: 0,
  });

  // Cerrar desplegables al hacer click fuera
  useEffect(() => {
    const handleWindowClick = () => setOpenDropdown(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  const selected = meetings.find((m) => m.id === selectedId) ?? meetings[0]!;

  const filtered = useMemo(() => {
    return meetings
      .filter((m) => {
        const q = search.trim().toLowerCase();
        const matchSearch =
          !q ||
          [m.title, m.project, m.site, m.region, m.id, m.owner, ...m.attendees]
            .join(' ')
            .toLowerCase()
            .includes(q);

        const matchTab = selectedTab === 'Todas' || m.status === selectedTab;
        const matchStatus = statusFilter === 'Todos los estados' || m.status === statusFilter;
        const matchModality = modalityFilter === 'Todas las modalidades' || m.modality === modalityFilter;
        const matchRegion = regionFilter === 'Todas las regiones' || m.region === regionFilter;

        return matchSearch && matchTab && matchStatus && matchModality && matchRegion;
      })
      .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start));
  }, [meetings, search, selectedTab, statusFilter, modalityFilter, regionFilter]);

  const listView = useMemo(() => engine.apply(filtered), [engine.apply, filtered]);

  const upcoming = meetings.filter((m) => m.status !== 'REALIZADA').length;
  const inPerson = meetings.filter((m) => m.modality === 'Presencial' && m.status !== 'REALIZADA').length;
  const minutesTravel = meetings
    .filter((m) => m.modality === 'Presencial' && m.status !== 'REALIZADA')
    .reduce((n, m) => n + m.travel, 0);
  const pendingActs = meetings.filter((m) => m.status === 'REALIZADA' && m.actStatus !== 'Cumple').length;

  // Conteo y pestañas generados desde el catálogo (sin listas hardcodeadas).
  const conteoPorEstado = meetings.reduce<Record<string, number>>((acc, m) => {
    acc[m.status] = (acc[m.status] ?? 0) + 1;
    return acc;
  }, {});

  const tabPills = [
    { id: 'Todas', label: 'Todas las reuniones', count: meetings.length },
    ...ESTADOS_REUNION.map((e) => ({
      id: e.codigo as string,
      label: e.etiqueta,
      count: conteoPorEstado[e.codigo] ?? 0,
    })),
  ];

  const hasActiveFilters =
    search.trim() !== '' ||
    statusFilter !== 'Todos los estados' ||
    modalityFilter !== 'Todas las modalidades' ||
    regionFilter !== 'Todas las regiones';

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('Todos los estados');
    setModalityFilter('Todas las modalidades');
    setRegionFilter('Todas las regiones');
    engine.clearAllFilters();
  };

  const notify = (msg: string, type: 'success' | 'warning' | 'error' = 'success') => {
    setToast(msg);
    setToastState({ msg, type });
    window.setTimeout(() => {
      setToast('');
      setToastState(null);
    }, 2800);
  };

  const checkMeetingConflict = (meeting: Meeting, list: Meeting[] = meetings): Meeting | undefined => {
    return list.find(
      (other) =>
        other.id !== meeting.id &&
        other.date === meeting.date &&
        other.status !== 'CANCELADA' &&
        meeting.status !== 'CANCELADA' &&
        other.start < meeting.end &&
        meeting.start < other.end
    );
  };

  const handleDropOnDate = (targetDate: string, meetingId: string) => {
    setDragOverDate(null);
    const target = meetings.find((m) => m.id === meetingId);
    if (!target) return;
    if (target.date === targetDate) return;

    const next = meetings.map((m) => (m.id === meetingId ? { ...m, date: targetDate } : m));
    saveMeetings(next);
    notify(`Reunión "${target.title}" reprogramada al ${formatDate(targetDate)}`, 'success');
  };

  const saveMeetings = (next: Meeting[]) => {
    setMeetings(next);
    try {
      localStorage.setItem('qaway-meetings-v1', JSON.stringify(next));
    } catch {
      /* storage fallback */
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({
      title: '',
      project: 'Distribución de Materiales DOT 2027',
      purpose: '',
      date: '2026-10-29',
      start: '09:00',
      end: '10:00',
      modality: 'Google Meet',
      region: 'Junín',
      site: 'Reunión virtual',
      address: '',
      status: 'PROGRAMADA',
      tipoCodigo: '',
      attendees: [],
      owner: 'Carlos Sandoval',
      meetUrl: '',
      agenda: '',
      travel: 0,
      buffer: 10,
      notes: '',
      actStatus: 'Pendiente',
      agreements: 0,
    });
    setFormOpen(true);
  };

  const openEdit = (m: Meeting) => {
    setEditingId(m.id);
    setForm({ ...m, attendees: [...m.attendees] });
    setFormOpen(true);
  };

  const saveForm = () => {
    if (!form.title?.trim() || !form.date || !form.start || !form.end) {
      notify('Completa el título, la fecha y el horario.');
      return;
    }
    if (form.end <= form.start) {
      notify('La hora de fin debe ser posterior a la hora de inicio.');
      return;
    }
    const next: Meeting = {
      id: editingId ?? uid(),
      title: form.title.trim(),
      project: form.project || 'Sin proyecto',
      purpose: form.purpose || '',
      date: form.date,
      start: form.start,
      end: form.end,
      modality: form.modality || 'Google Meet',
      region: form.region || 'Nacional',
      site: form.modality === 'Google Meet' ? 'Reunión virtual' : form.site || 'Sede por definir',
      address: form.modality === 'Google Meet' ? '' : form.address || '',
      status: form.status || 'PROGRAMADA',
      tipoCodigo: form.tipoCodigo || '',
      attendees: form.attendees || [],
      owner: form.owner || 'Sin asignar',
      meetUrl: form.meetUrl || '',
      agenda: form.agenda || '',
      travel: Number(form.travel) || 0,
      buffer: Number(form.buffer) || 0,
      notes: form.notes || '',
      actStatus: form.actStatus || 'Pendiente',
      agreements: Number(form.agreements) || 0,
    };
    const updated = editingId ? meetings.map((m) => (m.id === editingId ? next : m)) : [next, ...meetings];
    saveMeetings(updated);
    setSelectedId(next.id);
    setFormOpen(false);
    notify(editingId ? 'Reunión actualizada' : 'Reunión registrada');
  };

  const deleteMeeting = (id: string) => {
    if (!window.confirm('¿Eliminar esta reunión del registro local?')) return;
    saveMeetings(meetings.filter((m) => m.id !== id));
    setDetailOpen(false);
    notify('Reunión eliminada');
  };

  const exportCSV = () => {
    const headers = [
      'Código',
      'Título',
      'Proyecto',
      'Fecha',
      'Inicio',
      'Fin',
      'Modalidad',
      'Región',
      'Sede',
      'Estado',
      'Responsable',
      'Participantes',
      'Estado del acta',
    ];
    const rows = filtered.map((m) => [
      m.id,
      m.title,
      m.project,
      m.date,
      m.start,
      m.end,
      m.modality,
      m.region,
      m.site,
      etiquetaEstadoReunion(m.status),
      m.owner,
      m.attendees.join('; '),
      m.actStatus,
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `qaway-reuniones-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    notify('Listado exportado a CSV');
  };

  const approveAct = (id: string) => {
    saveMeetings(meetings.map((m) => (m.id === id ? { ...m, actStatus: 'Cumple' } : m)));
    notify('Acta aprobada · estado Cumple');
  };

  const openAct = (m: Meeting) => {
    setSelectedId(m.id);
    setActText(
      `ACTA DE REUNIÓN\n\nReunión: ${m.title}\nFecha: ${formatDate(m.date)} · ${m.start}–${m.end}\nModalidad: ${
        m.modality
      }\nParticipantes: ${m.attendees.join(', ') || 'Por registrar'}\n\nOBJETIVO\n${
        m.purpose || 'Por completar'
      }\n\nAGENDA\n${m.agenda || 'Por completar'}\n\nTEMAS TRATADOS\n[Completar con el desarrollo de la reunión]\n\nACUERDOS Y COMPROMISOS\n1. Acuerdo: [describir]\n   Responsable: [nombre] · Fecha límite: [fecha]\n\nOBSERVACIONES\n${
        m.notes || 'Sin observaciones registradas.'
      }`
    );
    setActFiles([]);
    setNewActOpen(true);
  };

  const saveActDraft = () => {
    saveMeetings(meetings.map((m) => (m.id === selectedId ? { ...m, actStatus: 'En proceso' } : m)));
    setNewActOpen(false);
    notify('Borrador de acta guardado en el registro local');
  };

  const regions = ['Todas las regiones', 'Junín', 'Nacional', 'Pasco', 'Huancavelica', 'Ayacucho'];
  const modalities = ['Todas las modalidades', 'Presencial', 'Google Meet'];
  const statusOptions = ['Todos los estados', ...ESTADOS_REUNION.map((e) => e.codigo as string)];
  const etiquetaFiltro = (v: string) => (v === 'Todos los estados' ? v : etiquetaEstadoReunion(v));

  const monthLabel = new Date(`${month}-15T12:00:00`).toLocaleDateString('es-PE', { month: 'long', year: 'numeric' });
  const monthDays = () => {
    const [y, mo] = month.split('-').map(Number);
    const first = new Date(y!, mo! - 1, 1);
    const offset = (first.getDay() + 6) % 7;
    const days = new Date(y!, mo!, 0).getDate();
    return [...Array(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  };
  const changeMonth = (delta: number) => {
    const [y, mo] = month.split('-').map(Number);
    const d = new Date(y!, mo! - 1 + delta, 1);
    setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  };

  const getWeekDays = (refDateStr: string) => {
    const ref = new Date(`${refDateStr}T12:00:00`);
    const dayOfWeek = (ref.getDay() + 6) % 7;
    const monday = new Date(ref);
    monday.setDate(ref.getDate() - dayOfWeek);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      return {
        date: d,
        iso,
        dayNum: d.getDate(),
        dayName: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i],
        isToday: iso === '2026-10-25',
      };
    });
  };

  const currentWeekDays = useMemo(() => getWeekDays(selectedDateKey), [selectedDateKey]);

  const weekLabel = useMemo(() => {
    if (!currentWeekDays.length) return '';
    const first = currentWeekDays[0].date;
    const last = currentWeekDays[6].date;
    const fStr = first.toLocaleDateString('es-PE', { day: 'numeric', month: 'short' }).replace('.', '');
    const lStr = last.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' }).replace('.', '');
    return `${fStr} – ${lStr}`;
  }, [currentWeekDays]);

  const dayLabel = useMemo(() => {
    return new Date(`${selectedDateKey}T12:00:00`).toLocaleDateString('es-PE', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [selectedDateKey]);

  const changeDateOrPeriod = (delta: number) => {
    if (calendarSubView === 'mes') {
      changeMonth(delta);
    } else if (calendarSubView === 'semana') {
      const d = new Date(`${selectedDateKey}T12:00:00`);
      d.setDate(d.getDate() + delta * 7);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      setSelectedDateKey(iso);
      setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    } else {
      const d = new Date(`${selectedDateKey}T12:00:00`);
      d.setDate(d.getDate() + delta);
      const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      setSelectedDateKey(iso);
      setMonth(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
    }
  };

  const resetToToday = () => {
    setMonth('2026-10');
    setSelectedDateKey('2026-10-26');
  };

  useEffect(() => {
    onActions?.({ notify: (m) => notify(m) });
  }, [onActions]);

  return (
    <div className="gantt-v2">
      <div className="app">
        {/* Cabecera Principal Oficial (Idéntica a Cronograma) */}
        <header className="header">
          <div className="heading">
            <span className="heading-icon">
              <CalendarDays size={26} />
            </span>
            <div>
              <span className="super">GESTIÓN OPERATIVA · COORDINACIÓN TERRITORIAL</span>
              <h1>Reuniones y Coordinación de Trabajo</h1>
              <p>
                Coordina sesiones virtuales y presenciales, calcula tiempos de traslado y registra acuerdos de actas.
              </p>
            </div>
          </div>
          <div className="head-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={exportCSV}
              title="Descargar reporte territorial en formato CSV"
            >
              <Download size={15} />
              <span>Exportar Reporte</span>
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={openCreate}
              title="Programar una nueva reunión de trabajo"
            >
              <Plus size={16} />
              <span>Nueva Reunión</span>
            </button>
          </div>
        </header>

        {/* Tarjetas Métricas Directivas (Idénticas a Cronograma) */}
        <section className="metrics">
          <article
            className="metric blue"
            onClick={() => {
              setSelectedTab('Todas');
              setStatusFilter('Todos los estados');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <CalendarClock size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(upcoming).padStart(2, '0')}</b>
              <strong>Reuniones Pendientes</strong>
              <small>por realizar o confirmar</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric green"
            onClick={() => {
              setModalityFilter('Google Meet');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <Video size={22} />
            </span>
            <div className="metric-copy">
              <b>
                {String(
                  meetings.filter((m) => m.modality === 'Google Meet' && m.status !== 'REALIZADA').length
                ).padStart(2, '0')}
              </b>
              <strong>Sesiones Virtuales</strong>
              <small>enlace Google Meet activo</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric amber"
            onClick={() => {
              setModalityFilter('Presencial');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <Navigation size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(inPerson).padStart(2, '0')}</b>
              <strong>Visitas Presenciales</strong>
              <small>{minutesTravel} min traslado estimado</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric red"
            onClick={() => {
              setView('Actas');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <FileCheck2 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(pendingActs).padStart(2, '0')}</b>
              <strong>Actas por Completar</strong>
              <small>reuniones realizadas</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>
        </section>

        {/* =========================================================================
            LA CÁPSULA WORKSPACE CENTRAL (Idéntica a Cronograma, Sedes, Hitos y Tareas)
           ========================================================================= */}
        <main className="workspace">
          {/* Tabs Superiores con Switcher de Modos a la Derecha */}
          <nav className="tabs">
            <div className="tabs-list">
              {tabPills.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={selectedTab === t.id ? 'active' : ''}
                  onClick={() => setSelectedTab(t.id)}
                >
                  {t.label} <span>({t.count})</span>
                </button>
              ))}
            </div>

            {/* Switcher de Vistas Operativas */}
            <div className="view-mode-switcher" role="tablist">
              {views.map((v) => {
                const IconComponent = v.icon;
                return (
                  <button
                    key={v.label}
                    type="button"
                    className={`view-mode-btn ${view === v.label ? 'active' : ''}`}
                    onClick={() => setView(v.label)}
                    title={`Vista ${v.label}`}
                  >
                    <IconComponent size={14} />
                    <span>{v.label}</span>
                    {v.label === 'Actas' && pendingActs > 0 && (
                      <span className="tab-count" style={{ marginLeft: 4 }}>
                        {pendingActs}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </nav>

          {/* Barra de Filtros Nativa estilo Cronograma */}
          <div className="filters">
            <label className="search">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar reunión, proyecto, sede o participante…"
                aria-label="Buscar reuniones"
              />
              {search && (
                <button type="button" onClick={() => setSearch('')} aria-label="Limpiar búsqueda">
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Filtro Región / Ámbito */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'region' ? 'active' : ''} ${
                  regionFilter !== 'Todas las regiones' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'region' ? null : 'region');
                }}
                title="Filtrar por región"
              >
                <div className="filter-card-copy">
                  <small>Región / Ámbito</small>
                  <span>{regionFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'region' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
                  <div className="filter-popover-title">Filtrar por Región</div>
                  <div className="filter-popover-list">
                    {regions.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={`filter-item-btn ${regionFilter === r ? 'selected' : ''}`}
                        onClick={() => {
                          setRegionFilter(r);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{r}</span>
                        {regionFilter === r && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Modalidad */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'modality' ? 'active' : ''} ${
                  modalityFilter !== 'Todas las modalidades' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'modality' ? null : 'modality');
                }}
                title="Filtrar por modalidad"
              >
                <div className="filter-card-copy">
                  <small>Modalidad</small>
                  <span>{modalityFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'modality' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
                  <div className="filter-popover-title">Filtrar por Modalidad</div>
                  <div className="filter-popover-list">
                    {modalities.map((m) => (
                      <button
                        key={m}
                        type="button"
                        className={`filter-item-btn ${modalityFilter === m ? 'selected' : ''}`}
                        onClick={() => {
                          setModalityFilter(m);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{m}</span>
                        {modalityFilter === m && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Estado */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'status' ? 'active' : ''} ${
                  statusFilter !== 'Todos los estados' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'status' ? null : 'status');
                }}
                title="Filtrar por estado"
              >
                <div className="filter-card-copy">
                  <small>Estado</small>
                  <span>{etiquetaFiltro(statusFilter)}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'status' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
                  <div className="filter-popover-title">Filtrar por Estado</div>
                  <div className="filter-popover-list">
                    {statusOptions.map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`filter-item-btn ${statusFilter === st ? 'selected' : ''}`}
                        onClick={() => {
                          setStatusFilter(st);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{etiquetaFiltro(st)}</span>
                        {statusFilter === st && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className="btn secondary"
                onClick={clearAllFilters}
                style={{ height: '38px', padding: '0 14px', fontSize: '12px' }}
                title="Restablecer filtros"
              >
                <RefreshCw size={13} />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          {/* Contenedor con Ámbito CSS de Reuniones */}
          <div className="rm-v1" style={{ background: 'transparent', minHeight: 'auto', padding: '8px 0 24px' }}>
            {view === 'Agenda' && (
              <div className="agenda-layout">
                <section className="panel calendar-panel">
                  <div className="panel-head" style={{ flexWrap: 'wrap', gap: '10px' }}>
                    <div>
                      <h2>Calendario de reuniones</h2>
                      <p>
                        {calendarSubView === 'mes'
                          ? 'Vista mensual · Arrastra reuniones para reprogramar fecha o haz clic en un día'
                          : calendarSubView === 'semana'
                          ? 'Vista semanal · Franjas horarias y detección de superposiciones'
                          : 'Vista diaria · Agenda de la jornada y logística territorial'}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Selector de Sub-vistas (Mes / Semana / Día) */}
                      <div className="subview-controls" role="tablist">
                        <button
                          type="button"
                          className={`subview-btn ${calendarSubView === 'mes' ? 'active' : ''}`}
                          onClick={() => setCalendarSubView('mes')}
                        >
                          Mes
                        </button>
                        <button
                          type="button"
                          className={`subview-btn ${calendarSubView === 'semana' ? 'active' : ''}`}
                          onClick={() => setCalendarSubView('semana')}
                        >
                          Semana
                        </button>
                        <button
                          type="button"
                          className={`subview-btn ${calendarSubView === 'dia' ? 'active' : ''}`}
                          onClick={() => setCalendarSubView('dia')}
                        >
                          Día
                        </button>
                      </div>

                      {/* Controles de Navegación Temporal */}
                      <div className="calendar-controls">
                        <button
                          className="icon-button small"
                          onClick={() => changeDateOrPeriod(-1)}
                          aria-label="Periodo anterior"
                          title="Anterior"
                        >
                          <ChevronLeft size={17} />
                        </button>
                        <b style={{ minWidth: calendarSubView === 'dia' ? '140px' : calendarSubView === 'semana' ? '120px' : '100px' }}>
                          {calendarSubView === 'mes'
                            ? monthLabel
                            : calendarSubView === 'semana'
                            ? weekLabel
                            : dayLabel}
                        </b>
                        <button
                          className="icon-button small"
                          onClick={() => changeDateOrPeriod(1)}
                          aria-label="Periodo siguiente"
                          title="Siguiente"
                        >
                          <ChevronRight size={17} />
                        </button>
                        <button className="button compact secondary" onClick={resetToToday}>
                          Hoy
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ─── VISTA 1: MES (Con Drag & Drop y Popover de Día) ─── */}
                  {calendarSubView === 'mes' && (
                    <div className="calendar-grid">
                      <div className="weekday">Lun</div>
                      <div className="weekday">Mar</div>
                      <div className="weekday">Mié</div>
                      <div className="weekday">Jue</div>
                      <div className="weekday">Vie</div>
                      <div className="weekday">Sáb</div>
                      <div className="weekday">Dom</div>
                      {monthDays().map((d, i) => {
                        const date = d ? `${month}-${String(d).padStart(2, '0')}` : '';
                        const dayMeetings = d ? filtered.filter((m) => m.date === date) : [];
                        const isDragTarget = dragOverDate === date;

                        return (
                          <div
                            key={`${month}-${i}`}
                            className={`calendar-day ${!d ? 'empty-day' : ''} ${date === '2026-10-25' ? 'today' : ''} ${
                              isDragTarget ? 'drag-over' : ''
                            }`}
                            onDragOver={(e) => {
                              if (!d) return;
                              e.preventDefault();
                              if (dragOverDate !== date) setDragOverDate(date);
                            }}
                            onDragLeave={() => {
                              if (dragOverDate === date) setDragOverDate(null);
                            }}
                            onDrop={(e) => {
                              if (!d) return;
                              e.preventDefault();
                              const meetingId = e.dataTransfer.getData('text/plain');
                              if (meetingId) handleDropOnDate(date, meetingId);
                            }}
                          >
                            <span
                              className="day-num"
                              style={{ cursor: d ? 'pointer' : 'default' }}
                              onClick={() => {
                                if (d) {
                                  setSelectedDateKey(date);
                                  setDayModalDate(date);
                                }
                              }}
                              title={d ? `Ver agenda del ${d}` : undefined}
                            >
                              {d}
                            </span>
                            <div className="day-events">
                              {dayMeetings.slice(0, 2).map((m) => {
                                const conflict = checkMeetingConflict(m, filtered);
                                return (
                                  <button
                                    key={m.id}
                                    draggable={true}
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData('text/plain', m.id);
                                    }}
                                    className={`calendar-event ${
                                      m.modality === 'Presencial' ? 'event-inperson' : 'event-virtual'
                                    } ${m.id === selectedId ? 'event-active' : ''}`}
                                    onClick={() => {
                                      setSelectedId(m.id);
                                      setSelectedDateKey(m.date);
                                      setDetailOpen(true);
                                    }}
                                    title={
                                      conflict
                                        ? `⚠️ Cruce de horario con: ${conflict.title} (${conflict.start}-${conflict.end}) · Arrastra para reprogramar`
                                        : `${m.title} (${m.start}-${m.end}) · Arrastra para reprogramar`
                                    }
                                  >
                                    <span>{m.start}</span> {m.title}
                                    {conflict && (
                                      <span className="conflict-badge" title={`Cruce con: ${conflict.title}`}>
                                        <CircleAlert size={9} />
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                              {dayMeetings.length > 2 && (
                                <button
                                  className="more-events"
                                  onClick={() => {
                                    setSelectedDateKey(date);
                                    setDayModalDate(date);
                                  }}
                                  title="Ver todas las reuniones del día"
                                >
                                  +{dayMeetings.length - 2} más
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* ─── VISTA 2: SEMANA (TimeGrid con horas 08:00 a 18:00) ─── */}
                  {calendarSubView === 'semana' && (
                    <div className="week-view-wrap">
                      <div className="week-header-row">
                        <div style={{ padding: '10px 4px', textAlign: 'center', fontSize: '9px', color: '#929eaf', fontWeight: 700 }}>
                          HORA
                        </div>
                        {currentWeekDays.map((col) => (
                          <div
                            key={col.iso}
                            className={`week-header-cell ${col.isToday ? 'today' : ''}`}
                            onClick={() => {
                              setSelectedDateKey(col.iso);
                              setCalendarSubView('dia');
                            }}
                            style={{ cursor: 'pointer' }}
                            title="Ver en vista diaria"
                          >
                            <span>{col.dayName}</span>
                            <b>{col.dayNum}</b>
                          </div>
                        ))}
                      </div>

                      <div className="week-body-scroll">
                        <div className="week-grid-container">
                          {/* Columna de Horas */}
                          <div className="time-col">
                            {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((h) => (
                              <div key={h} className="time-slot-label">
                                {h}
                              </div>
                            ))}
                          </div>

                          {/* 7 Columnas de Días */}
                          {currentWeekDays.map((col) => {
                            const dayMeetings = filtered.filter((m) => m.date === col.iso);
                            return (
                              <div
                                key={col.iso}
                                className={`week-day-col ${col.isToday ? 'today' : ''}`}
                                onDragOver={(e) => {
                                  e.preventDefault();
                                  if (dragOverDate !== col.iso) setDragOverDate(col.iso);
                                }}
                                onDragLeave={() => {
                                  if (dragOverDate === col.iso) setDragOverDate(null);
                                }}
                                onDrop={(e) => {
                                  e.preventDefault();
                                  const meetingId = e.dataTransfer.getData('text/plain');
                                  if (meetingId) handleDropOnDate(col.iso, meetingId);
                                }}
                              >
                                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map((h) => (
                                  <div
                                    key={h}
                                    className="week-hour-cell"
                                    onClick={() => {
                                      setForm((prev) => ({ ...prev, date: col.iso, start: h }));
                                      openCreate();
                                    }}
                                    title={`Clic para agendar reunión el ${col.dayName} a las ${h}`}
                                  />
                                ))}

                                {/* Eventos colocados en la columna */}
                                {dayMeetings.map((m) => {
                                  const [sh, sm] = (m.start || '09:00').split(':').map(Number);
                                  const [eh, em] = (m.end || '10:00').split(':').map(Number);
                                  const startMin = (sh - 8) * 60 + (sm || 0);
                                  const durMin = Math.max((eh - sh) * 60 + ((em || 0) - (sm || 0)), 30);
                                  const topPx = Math.max(0, (startMin / 60) * 56);
                                  const heightPx = Math.max(26, (durMin / 60) * 56 - 4);
                                  const conflict = checkMeetingConflict(m, filtered);

                                  return (
                                    <div
                                      key={m.id}
                                      draggable={true}
                                      onDragStart={(e) => e.dataTransfer.setData('text/plain', m.id)}
                                      className={`week-event-card ${
                                        m.modality === 'Presencial' ? 'event-inperson' : 'event-virtual'
                                      }`}
                                      style={{ top: `${topPx}px`, height: `${heightPx}px` }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedId(m.id);
                                        setSelectedDateKey(m.date);
                                        setDetailOpen(true);
                                      }}
                                      title={`${m.title} (${m.start} - ${m.end}) · ${m.site}`}
                                    >
                                      <strong>{m.title}</strong>
                                      <small>
                                        <Clock3 size={10} /> {m.start}–{m.end}
                                        {conflict && (
                                          <span className="conflict-badge" title={`Cruce con: ${conflict.title}`}>
                                            <CircleAlert size={9} /> Solape
                                          </span>
                                        )}
                                      </small>
                                    </div>
                                  );
                                })}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* ─── VISTA 3: DÍA (Timeline detallado por horas 08:00 a 19:00) ─── */}
                  {calendarSubView === 'dia' && (
                    <div className="day-view-wrap">
                      <div className="day-view-head">
                        <div>
                          <h3>{dayLabel}</h3>
                          <span>
                            {filtered.filter((m) => m.date === selectedDateKey).length} reuniones programadas para este día
                          </span>
                        </div>
                        <button
                          className="button primary compact"
                          onClick={() => {
                            setForm((prev) => ({ ...prev, date: selectedDateKey }));
                            openCreate();
                          }}
                        >
                          <Plus size={14} /> Agendar reunión
                        </button>
                      </div>

                      <div className="day-slots-list">
                        {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'].map((h) => {
                          const slotHour = parseInt(h.slice(0, 2), 10);
                          const slotMeetings = filtered.filter((m) => {
                            if (m.date !== selectedDateKey) return false;
                            const mHour = parseInt((m.start || '').slice(0, 2), 10);
                            return mHour === slotHour;
                          });

                          return (
                            <div key={h} className="day-slot-row">
                              <span className="day-slot-time">{h}</span>
                              <div className="day-slot-events">
                                {slotMeetings.length === 0 ? (
                                  <div
                                    className="day-slot-empty"
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => {
                                      setForm((prev) => ({ ...prev, date: selectedDateKey, start: h }));
                                      openCreate();
                                    }}
                                  >
                                    + Libre · Clic para agendar a las {h}
                                  </div>
                                ) : (
                                  slotMeetings.map((m) => {
                                    const conflict = checkMeetingConflict(m, filtered);
                                    return (
                                      <div
                                        key={m.id}
                                        className={`day-card ${conflict ? 'has-conflict' : ''}`}
                                        onClick={() => {
                                          setSelectedId(m.id);
                                          setDetailOpen(true);
                                        }}
                                      >
                                        <div className="day-card-header">
                                          <strong>{m.title}</strong>
                                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            {conflict && (
                                              <span className="conflict-badge" title={`Se cruza con: ${conflict.title} (${conflict.start}-${conflict.end})`}>
                                                <CircleAlert size={10} /> Cruce de horario
                                              </span>
                                            )}
                                            <span className={`status-pill ${claseEstadoReunion(m.status)}`}>
                                              {etiquetaEstadoReunion(m.status)}
                                            </span>
                                          </div>
                                        </div>
                                        <div className="day-card-meta">
                                          <span>
                                            <Clock3 size={13} /> {m.start} – {m.end} ({durationMins(m.start, m.end)} min)
                                          </span>
                                          <span>
                                            {m.modality === 'Google Meet' ? <Video size={13} /> : <MapPin size={13} />} {m.site}
                                          </span>
                                          <span>
                                            <Users size={13} /> {m.attendees.length} asistentes
                                          </span>
                                          {m.modality === 'Presencial' && m.travel > 0 && (
                                            <span>
                                              <Navigation size={13} /> Traslado: {m.travel} min (+{m.buffer} min buffer)
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="calendar-legend">
                    <span>
                      <i className="legend-dot virtual-dot" /> Google Meet
                    </span>
                    <span>
                      <i className="legend-dot inperson-dot" /> Presencial
                    </span>
                    <span>
                      <i className="legend-dot today-dot" /> Hoy
                    </span>
                    <span>
                      <CircleAlert size={12} style={{ color: '#c9424c' }} /> Cruce de horario
                    </span>
                  </div>
                </section>

                <aside className="panel upcoming-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Próximas reuniones</h2>
                      <p>Agenda inmediata</p>
                    </div>
                    <button className="text-action" onClick={() => setView('Lista')}>
                      Ver todas <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="upcoming-list">
                    {filtered
                      .filter((m) => m.status !== 'REALIZADA')
                      .slice(0, 4)
                      .map((m) => (
                        <button
                          key={m.id}
                          className={`upcoming-item ${m.id === selectedId ? 'upcoming-active' : ''}`}
                          onClick={() => {
                            setSelectedId(m.id);
                            setDetailOpen(true);
                          }}
                        >
                          <div className="date-tile">
                            <b>{new Date(`${m.date}T12:00:00`).getDate()}</b>
                            <span>
                              {new Date(`${m.date}T12:00:00`)
                                .toLocaleDateString('es-PE', { month: 'short' })
                                .replace('.', '')}
                            </span>
                          </div>
                          <div className="upcoming-info">
                            <div className="upcoming-title-row">
                              <strong>{m.title}</strong>
                              <span className={`status-pill ${claseEstadoReunion(m.status)}`}>{etiquetaEstadoReunion(m.status)}</span>
                            </div>
                            <p>
                              <Clock3 size={13} />
                              {m.start}–{m.end}
                              <span className="bullet">·</span>
                              {m.modality === 'Google Meet' ? <Video size={13} /> : <MapPin size={13} />} {m.site}
                            </p>
                            <small>
                              {m.region} · {m.attendees.length} participantes
                            </small>
                          </div>
                          <ChevronRight className="upcoming-chevron" size={16} />
                        </button>
                      ))}
                    {filtered.filter((m) => m.status !== 'REALIZADA').length === 0 && (
                      <div className="empty-state">No hay reuniones con estos filtros.</div>
                    )}
                  </div>
                  <div className="upcoming-footer">
                    <button className="button secondary full-width" onClick={openCreate}>
                      <Plus size={15} /> Programar una reunión
                    </button>
                  </div>
                </aside>
              </div>
            )}

            {view === 'Lista' && (
              <section className="panel list-panel">
                <div className="panel-head">
                  <div>
                    <h2>Registro de reuniones</h2>
                    <p>{listView.length} resultados · Usa los filtros para acotar la lista</p>
                  </div>
                  <button className="button secondary compact" onClick={exportCSV}>
                    <Download size={15} /> Descargar CSV
                  </button>
                </div>
                <div className="table-scroll">
                  <TableEngineStatus engine={engine} />
                  <table className="meetings-table">
                    <thead>
                      <tr>
                        <th>
                          <ColumnHeader engine={engine} columnId="title" label="Reunión" />
                        </th>
                        <th>
                          <ColumnHeader engine={engine} columnId="date" label="Fecha y hora" />
                        </th>
                        <th>
                          <ColumnHeader engine={engine} columnId="modality" label="Modalidad / sede" />
                        </th>
                        <th>
                          <ColumnHeader engine={engine} columnId="owner" label="Responsable" />
                        </th>
                        <th>
                          <ColumnHeader engine={engine} columnId="status" label="Estado" />
                        </th>
                        <th>
                          <ColumnHeader engine={engine} columnId="actStatus" label="Acta" />
                        </th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {listView.map((m) => (
                        <tr
                          key={m.id}
                          onClick={() => {
                            setSelectedId(m.id);
                            setDetailOpen(true);
                          }}
                        >
                          <td>
                            <div className="table-title">
                              <span className={`modality-icon ${m.modality === 'Google Meet' ? 'virtual' : 'inperson'}`}>
                                {m.modality === 'Google Meet' ? <Video size={15} /> : <MapPin size={15} />}
                              </span>
                              <div>
                                <b>{m.title}</b>
                                <small>
                                  {m.id} · {m.project}
                                </small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <b>{formatDate(m.date)}</b>
                            <small>
                              {m.start}–{m.end}
                            </small>
                          </td>
                          <td>
                            <b>{m.modality}</b>
                            <small>{m.site}</small>
                          </td>
                          <td>{m.owner}</td>
                          <td>
                            <span className={`status-pill ${claseEstadoReunion(m.status)}`}>{etiquetaEstadoReunion(m.status)}</span>
                          </td>
                          <td>
                            <span
                              className={`act-pill ${
                                m.actStatus === 'Cumple'
                                  ? 'act-approved'
                                  : m.actStatus === 'En proceso'
                                  ? 'act-draft'
                                  : 'act-pending'
                              }`}
                            >
                              {m.actStatus}
                            </span>
                          </td>
                          <td>
                            <button
                              className="icon-button small"
                              aria-label={`Ver ${m.title}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedId(m.id);
                                setDetailOpen(true);
                              }}
                            >
                              <ChevronRight size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {listView.length === 0 && (
                    <div className="empty-state">
                      No encontramos reuniones con esos criterios. Prueba limpiando los filtros.
                    </div>
                  )}
                </div>
              </section>
            )}

            {view === 'Mapa' && (
              <div className="map-layout">
                <section className="panel map-list-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Reuniones por sede</h2>
                      <p>Distribución territorial registrada</p>
                    </div>
                    <span className="subtle-tag">
                      <MapPin size={13} />
                      {filtered.filter((m) => m.modality === 'Presencial').length} presenciales
                    </span>
                  </div>
                  <div className="site-list">
                    {filtered
                      .filter((m) => m.modality === 'Presencial')
                      .map((m) => (
                        <button
                          className={`site-row ${m.id === selectedId ? 'site-selected' : ''}`}
                          key={m.id}
                          onClick={() => setSelectedId(m.id)}
                        >
                          <div className="site-pin">
                            <MapPin size={17} />
                          </div>
                          <div>
                            <b>{m.site}</b>
                            <small>{m.address || m.region}</small>
                            <span>
                              {formatDate(m.date)} · {m.start} · {m.title}
                            </span>
                          </div>
                          <ChevronRight size={16} />
                        </button>
                      ))}
                    {filtered.filter((m) => m.modality === 'Presencial').length === 0 && (
                      <div className="empty-state">No hay reuniones presenciales para mostrar.</div>
                    )}
                  </div>
                </section>
                <section className="panel map-visual-panel">
                  <div className="panel-head">
                    <div>
                      <h2>Vista territorial</h2>
                      <p>Referencial · Ubicaciones según sede registrada</p>
                    </div>
                    <button
                      className="icon-button small"
                      onClick={() => notify('El mapa geográfico real requiere integrar un proveedor cartográfico.')}
                      aria-label="Información del mapa"
                    >
                      <CircleHelp size={16} />
                    </button>
                  </div>
                  <div className="territory-map">
                    <div className="map-gridlines" />
                    <div className="river river-one" />
                    <div className="river river-two" />
                    <div className="map-label label-huancayo">HUANCAYO</div>
                    <div className="map-label label-concepcion">CONCEPCIÓN</div>
                    <div className="map-label label-chupaca">CHUPACA</div>
                    <div className="map-label label-tarma">TARMA</div>
                    <div className="map-label label-jauja">JAUJA</div>
                    {filtered
                      .filter((m) => m.modality === 'Presencial')
                      .map((m, i) => (
                        <button
                          key={m.id}
                          className={`map-marker marker-${i % 5} ${selectedId === m.id ? 'marker-selected' : ''}`}
                          onClick={() => setSelectedId(m.id)}
                          title={m.site}
                        >
                          <MapPin size={19} />
                          <span>{m.site.replace('UGEL ', '').replace('Sede ', '')}</span>
                        </button>
                      ))}
                    <div className="map-watermark">
                      <MapIcon size={15} /> Vista esquemática · Junín
                    </div>
                  </div>
                  <div className="map-footnote">
                    <CircleAlert size={15} /> Las posiciones son ilustrativas; no representan coordenadas ni rutas
                    verificadas.
                  </div>
                </section>
              </div>
            )}

            {view === 'Itinerario' && (
              <section className="panel itinerary-panel">
                <div className="panel-head">
                  <div>
                    <h2>Plan de visitas presenciales</h2>
                    <p>Ordena la jornada, revisa tiempos estimados y deja margen entre sedes.</p>
                  </div>
                  <button className="button primary compact" onClick={openCreate}>
                    <Plus size={15} /> Añadir visita
                  </button>
                </div>
                <div className="itinerary-summary">
                  <div>
                    <span>Visitas en lista</span>
                    <b>{filtered.filter((m) => m.modality === 'Presencial').length}</b>
                  </div>
                  <div>
                    <span>Traslado estimado acumulado</span>
                    <b>
                      {minutesTravel} <small>min</small>
                    </b>
                  </div>
                  <div>
                    <span>Margen de preparación</span>
                    <b>
                      {filtered.filter((m) => m.modality === 'Presencial').reduce((n, m) => n + m.buffer, 0)}{' '}
                      <small>min</small>
                    </b>
                  </div>
                  <div>
                    <span>Primera visita</span>
                    <b>
                      {filtered
                        .filter((m) => m.modality === 'Presencial')
                        .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start))[0]?.start ?? '—'}
                    </b>
                  </div>
                </div>
                <div className="table-scroll">
                  <table className="meetings-table itinerary-table">
                    <thead>
                      <tr>
                        <th>Orden / visita</th>
                        <th>Fecha</th>
                        <th>Horario</th>
                        <th>Traslado previo</th>
                        <th>Margen</th>
                        <th>Estado</th>
                        <th />
                      </tr>
                    </thead>
                    <tbody>
                      {filtered
                        .filter((m) => m.modality === 'Presencial')
                        .map((m, i) => (
                          <tr
                            key={m.id}
                            onClick={() => {
                              setSelectedId(m.id);
                              setDetailOpen(true);
                            }}
                          >
                            <td>
                              <div className="table-title">
                                <span className="order-number">{i + 1}</span>
                                <div>
                                  <b>{m.site}</b>
                                  <small>{m.title}</small>
                                </div>
                              </div>
                            </td>
                            <td>{formatDate(m.date)}</td>
                            <td>
                              <b>
                                {m.start}–{m.end}
                              </b>
                              <small>{durationMins(m.start, m.end)} min de reunión</small>
                            </td>
                            <td>
                              <span className="travel-time">
                                <Navigation size={14} />
                                {m.travel ? `${m.travel} min` : 'No definido'}
                              </span>
                            </td>
                            <td>{m.buffer} min</td>
                            <td>
                              <span className={`status-pill ${claseEstadoReunion(m.status)}`}>{etiquetaEstadoReunion(m.status)}</span>
                            </td>
                            <td>
                              <button
                                className="icon-button small"
                                aria-label="Editar visita"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEdit(m);
                                }}
                              >
                                <Pencil size={15} />
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
                <div className="note-banner">
                  <CircleAlert size={17} />
                  <div>
                    <b>Validación antes de salir</b>
                    <span>
                      Los tiempos de traslado son estimaciones manuales. Confirma las condiciones de ruta, disponibilidad
                      del equipo y dirección exacta antes de aprobar el itinerario.
                    </span>
                  </div>
                </div>
              </section>
            )}

            {view === 'Actas' && (
              <section className="panel acts-panel">
                <div className="panel-head">
                  <div>
                    <h2>Actas y acuerdos</h2>
                    <p>Prepara el acta, adjunta evidencias y da seguimiento a compromisos.</p>
                  </div>
                  <button className="button primary compact" onClick={() => openAct(selected)}>
                    <Plus size={15} /> Crear acta
                  </button>
                </div>
                <div className="acts-summary">
                  <div>
                    <FileText size={18} />
                    <span>Por completar</span>
                    <b>{meetings.filter((m) => m.actStatus === 'Pendiente').length}</b>
                  </div>
                  <div>
                    <Pencil size={18} />
                    <span>En proceso</span>
                    <b>{meetings.filter((m) => m.actStatus === 'En proceso').length}</b>
                  </div>
                  <div>
                    <CheckCircle2 size={18} />
                    <span>Cumplen</span>
                    <b>{meetings.filter((m) => m.actStatus === 'Cumple').length}</b>
                  </div>
                </div>
                <div className="acts-list">
                  {filtered.map((m) => (
                    <div className="act-row" key={m.id}>
                      <div className="act-doc-icon">
                        <FileText size={19} />
                      </div>
                      <div className="act-row-main">
                        <b>{m.title}</b>
                        <small>
                          {m.id} · {formatDate(m.date)} · {m.modality}
                        </small>
                        <div className="act-row-meta">
                          <span
                            className={`act-pill ${
                              m.actStatus === 'Cumple'
                                ? 'act-approved'
                                : m.actStatus === 'En proceso'
                                ? 'act-draft'
                                : 'act-pending'
                            }`}
                          >
                            {m.actStatus}
                          </span>
                          <span>
                            <Users size={13} />
                            {m.attendees.length} participantes
                          </span>
                          <span>
                            <ClipboardCheck size={13} />
                            {m.agreements} acuerdos
                          </span>
                        </div>
                      </div>
                      <div className="act-actions">
                        <button className="button secondary compact" onClick={() => openAct(m)}>
                          <Pencil size={14} />
                          {m.actStatus === 'Pendiente' ? 'Preparar' : 'Editar acta'}
                        </button>
                        {m.actStatus === 'En proceso' && (
                          <button className="button success compact" onClick={() => approveAct(m.id)}>
                            <Check size={14} /> Aprobar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Pie de página canónico */}
          <footer className="footer">
            <span>
              Mostrando {filtered.length} de {meetings.length} reuniones registradas
            </span>
          </footer>
        </main>

        {/* Modal de Detalle de Reunión (Drawer) */}
        {detailOpen && selected && (
          <div className="rm-v1">
            <button className="drawer-scrim" onClick={() => setDetailOpen(false)} aria-label="Cerrar detalle" />
            <aside className="detail-drawer">
              <div className="drawer-header">
                <div>
                  <span className="drawer-kicker">DETALLE DE REUNIÓN · {selected.id}</span>
                  <h2>{selected.title}</h2>
                </div>
                <button className="icon-button" onClick={() => setDetailOpen(false)} aria-label="Cerrar detalle">
                  <X size={19} />
                </button>
              </div>
              <div className="drawer-body">
                <div className="drawer-status-row">
                  <span className={`status-pill ${claseEstadoReunion(selected.status)}`}>{etiquetaEstadoReunion(selected.status)}</span>
                  <span
                    className={`act-pill ${
                      selected.actStatus === 'Cumple'
                        ? 'act-approved'
                        : selected.actStatus === 'En proceso'
                        ? 'act-draft'
                        : 'act-pending'
                    }`}
                  >
                    Acta: {selected.actStatus}
                  </span>
                </div>
                <div className="drawer-date-card">
                  <div className="drawer-date-icon">
                    <CalendarDays size={21} />
                  </div>
                  <div>
                    <b>{dayName(selected.date)}</b>
                    <span>
                      {selected.start} – {selected.end} · {durationMins(selected.start, selected.end)} min
                    </span>
                  </div>
                  <button
                    className="icon-button small"
                    onClick={() => openEdit(selected)}
                    aria-label="Editar reunión"
                  >
                    <Pencil size={15} />
                  </button>
                </div>

                {/* Sincronización Externa de Calendario */}
                <div className="export-calendar-group">
                  <button
                    type="button"
                    className="export-calendar-btn"
                    title="Añadir a Google Calendar"
                    onClick={() => {
                      const url = generateGoogleCalendarUrl({
                        id: selected.id,
                        title: selected.title,
                        description: `${selected.purpose || ''}\n\nModalidad: ${selected.modality}\nProyecto: ${selected.project}`,
                        location:
                          selected.modality === 'Google Meet'
                            ? selected.meetUrl || 'Reunión Virtual'
                            : `${selected.site} ${selected.address ? `· ${selected.address}` : ''} (${selected.region})`,
                        date: selected.date,
                        start: selected.start,
                        end: selected.end,
                      });
                      window.open(url, '_blank', 'noopener,noreferrer');
                      notify('Abriendo Google Calendar...', 'success');
                    }}
                  >
                    <CalendarPlus size={14} /> Google Calendar
                  </button>
                  <button
                    type="button"
                    className="export-calendar-btn"
                    title="Descargar archivo universal .ics (Outlook, Apple Calendar)"
                    onClick={() => {
                      downloadIcsFile({
                        id: selected.id,
                        title: selected.title,
                        description: `${selected.purpose || ''}\n\nModalidad: ${selected.modality}\nProyecto: ${selected.project}`,
                        location:
                          selected.modality === 'Google Meet'
                            ? selected.meetUrl || 'Reunión Virtual'
                            : `${selected.site} ${selected.address ? `· ${selected.address}` : ''} (${selected.region})`,
                        date: selected.date,
                        start: selected.start,
                        end: selected.end,
                      });
                      notify('Archivo .ics descargado correctamente', 'success');
                    }}
                  >
                    <Download size={14} /> Descargar .ics
                  </button>
                </div>
                <div className="detail-section">
                  <h3>Información general</h3>
                  <div className="detail-line">
                    <span>
                      <ClipboardList size={15} /> Proyecto
                    </span>
                    <b>{selected.project}</b>
                  </div>
                  <div className="detail-line">
                    <span>
                      <Globe2 size={15} /> Modalidad
                    </span>
                    <b>{selected.modality}</b>
                  </div>
                  <div className="detail-line">
                    <span>
                      <MapPin size={15} /> Sede / región
                    </span>
                    <b>
                      {selected.site} · {selected.region}
                    </b>
                  </div>
                  {selected.address && (
                    <div className="detail-line">
                      <span>
                        <Navigation size={15} /> Dirección
                      </span>
                      <b>{selected.address}</b>
                    </div>
                  )}
                  <div className="detail-line">
                    <span>
                      <Users size={15} /> Responsable
                    </span>
                    <b>{selected.owner}</b>
                  </div>
                </div>
                <div className="detail-section">
                  <h3>Objetivo</h3>
                  <p className="detail-copy">{selected.purpose || 'Todavía no se ha definido un objetivo.'}</p>
                </div>
                <div className="detail-section">
                  <div className="section-title-row">
                    <h3>
                      Participantes <span className="count-chip">{selected.attendees.length}</span>
                    </h3>
                    <button className="text-action" onClick={() => openEdit(selected)}>
                      Editar
                    </button>
                  </div>
                  <div className="participant-list">
                    {selected.attendees.length ? (
                      selected.attendees.map((p, i) => (
                        <div className="participant" key={p}>
                          <div className={`mini-avatar avatar-color-${i % 4}`}>
                            {p
                              .split(' ')
                              .map((s) => s[0])
                              .slice(0, 2)
                              .join('')}
                          </div>
                          <span>{p}</span>
                        </div>
                      ))
                    ) : (
                      <p className="muted-copy">Participantes por registrar.</p>
                    )}
                  </div>
                </div>
                <div className="detail-section">
                  <h3>Agenda</h3>
                  <div className="agenda-points">
                    {(selected.agenda || 'Agenda pendiente de definir')
                      .split('\n')
                      .filter(Boolean)
                      .map((a, i) => (
                        <div key={a}>
                          <span>{String(i + 1).padStart(2, '0')}</span>
                          {a}
                        </div>
                      ))}
                  </div>
                </div>
                {selected.modality === 'Google Meet' && (
                  <div className="meet-link-card">
                    <div className="meet-link-icon">
                      <Video size={18} />
                    </div>
                    <div>
                      <b>Enlace de Google Meet</b>
                      <span>{selected.meetUrl ? 'Enlace registrado' : 'Todavía no se ha añadido un enlace'}</span>
                    </div>
                    {selected.meetUrl ? (
                      <button
                        className="icon-button small"
                        onClick={() => window.open(selected.meetUrl, '_blank', 'noopener,noreferrer')}
                        aria-label="Abrir Google Meet"
                      >
                        <ExternalLink size={16} />
                      </button>
                    ) : (
                      <button className="icon-button small" onClick={() => openEdit(selected)} aria-label="Añadir enlace">
                        <Plus size={16} />
                      </button>
                    )}
                  </div>
                )}
                {selected.modality === 'Presencial' && (
                  <div className="travel-card">
                    <div className="travel-card-title">
                      <Route size={17} />
                      <b>Logística de visita</b>
                    </div>
                    <div className="travel-numbers">
                      <div>
                        <span>Traslado previo</span>
                        <b>{selected.travel} min</b>
                      </div>
                      <div>
                        <span>Margen previsto</span>
                        <b>{selected.buffer} min</b>
                      </div>
                    </div>
                    <p>Valores estimados ingresados por el equipo. No son tiempos calculados por GPS.</p>
                  </div>
                )}
                {selected.notes && (
                  <div className="detail-section">
                    <h3>Notas de preparación</h3>
                    <p className="detail-copy">{selected.notes}</p>
                  </div>
                )}
                <div className="drawer-callout">
                  <Sparkles size={17} />
                  <div>
                    <b>Acta asistida por IA</b>
                    <span>
                      Al conectar una transcripción o cargar notas autorizadas, este registro podrá usarse para preparar un
                      borrador que debe revisarse antes de aprobarse.
                    </span>
                  </div>
                </div>
              </div>
              <div className="drawer-footer">
                <button className="button secondary" onClick={() => openEdit(selected)}>
                  <Pencil size={15} /> Editar
                </button>
                <button className="button primary" onClick={() => openAct(selected)}>
                  <FileText size={15} /> {selected.actStatus === 'Pendiente' ? 'Preparar acta' : 'Abrir acta'}
                </button>
                <button
                  className="icon-button danger-icon"
                  onClick={() => deleteMeeting(selected.id)}
                  aria-label="Eliminar reunión"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* Modal de Formulario Crear/Editar Reunión */}
        {formOpen && (
          <div className="rm-v1">
            <div
              className="modal-overlay"
              role="presentation"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setFormOpen(false);
              }}
            >
              <section className="meeting-modal" role="dialog" aria-modal="true" aria-labelledby="meeting-form-title">
                <div className="modal-header">
                  <div>
                    <span className="drawer-kicker">REGISTRO OPERATIVO</span>
                    <h2 id="meeting-form-title">{editingId ? 'Editar reunión' : 'Nueva reunión'}</h2>
                    <p>Registra la sesión antes de realizarla para centralizar agenda, participantes y seguimiento.</p>
                  </div>
                  <button className="icon-button" onClick={() => setFormOpen(false)} aria-label="Cerrar formulario">
                    <X size={19} />
                  </button>
                </div>
                <div className="modal-progress">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="form-body">
                  <div className="form-section">
                    <div className="form-section-heading">
                      <span>01</span>
                      <div>
                        <b>Información de la reunión</b>
                        <small>Datos principales y objetivo de la sesión</small>
                      </div>
                    </div>
                    <label className="field full">
                      <span>
                        Título de la reunión <i>*</i>
                      </span>
                      <input
                        autoFocus
                        value={form.title || ''}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Ej. Coordinación de planificación regional"
                      />
                    </label>
                    <div className="form-grid">
                      <label className="field">
                        <span>Proyecto</span>
                        <input
                          value={form.project || ''}
                          onChange={(e) => setForm({ ...form, project: e.target.value })}
                          placeholder="Nombre del proyecto"
                        />
                      </label>
                      <label className="field">
                        <span>Responsable</span>
                        <input
                          value={form.owner || ''}
                          onChange={(e) => setForm({ ...form, owner: e.target.value })}
                          placeholder="Persona responsable"
                        />
                      </label>
                    </div>
                    <label className="field full">
                      <span>Objetivo / motivo</span>
                      <textarea
                        rows={2}
                        value={form.purpose || ''}
                        onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                        placeholder="¿Qué se busca lograr con la reunión?"
                      />
                    </label>
                  </div>

                  <div className="form-section">
                    <div className="form-section-heading">
                      <span>02</span>
                      <div>
                        <b>Modalidad y ubicación</b>
                        <small>Define dónde se realizará la sesión</small>
                      </div>
                    </div>
                    <div className="modality-options">
                      <button
                        type="button"
                        className={`modality-option ${form.modality === 'Google Meet' ? 'option-selected' : ''}`}
                        onClick={() =>
                          setForm({ ...form, modality: 'Google Meet', site: 'Reunión virtual', address: '' })
                        }
                      >
                        <div className="option-icon virtual">
                          <Video size={19} />
                        </div>
                        <div>
                          <b>Google Meet</b>
                          <small>Reunión virtual existente</small>
                        </div>
                        {form.modality === 'Google Meet' && <CheckCircle2 size={17} />}
                      </button>
                      <button
                        type="button"
                        className={`modality-option ${form.modality === 'Presencial' ? 'option-selected' : ''}`}
                        onClick={() => setForm({ ...form, modality: 'Presencial', site: '', meetUrl: '' })}
                      >
                        <div className="option-icon inperson">
                          <MapPin size={19} />
                        </div>
                        <div>
                          <b>Presencial</b>
                          <small>Sede o visita territorial</small>
                        </div>
                        {form.modality === 'Presencial' && <CheckCircle2 size={17} />}
                      </button>
                    </div>
                    {form.modality === 'Presencial' ? (
                      <>
                        <div className="form-grid">
                          <label className="field">
                            <span>Región</span>
                            <select
                              value={form.region || 'Junín'}
                              onChange={(e) => setForm({ ...form, region: e.target.value })}
                            >
                              <option>Junín</option>
                              <option>Pasco</option>
                              <option>Huancavelica</option>
                              <option>Ayacucho</option>
                              <option>Lima</option>
                              <option>Nacional</option>
                            </select>
                          </label>
                          <label className="field">
                            <span>
                              Sede / institución <i>*</i>
                            </span>
                            <input
                              value={form.site || ''}
                              onChange={(e) => setForm({ ...form, site: e.target.value })}
                              placeholder="Ej. Sede Central Huancayo"
                            />
                          </label>
                        </div>
                        <label className="field full">
                          <span>Dirección de la sede</span>
                          <input
                            value={form.address || ''}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            placeholder="Dirección, distrito, referencia"
                          />
                        </label>
                        <div className="form-grid">
                          <label className="field">
                            <span>Traslado previo (min)</span>
                            <input
                              type="number"
                              min="0"
                              value={form.travel ?? 0}
                              onChange={(e) => setForm({ ...form, travel: Number(e.target.value) })}
                            />
                          </label>
                          <label className="field">
                            <span>Margen de preparación (min)</span>
                            <input
                              type="number"
                              min="0"
                              value={form.buffer ?? 0}
                              onChange={(e) => setForm({ ...form, buffer: Number(e.target.value) })}
                            />
                          </label>
                        </div>
                        <div className="inline-hint">
                          <Navigation size={15} /> Registra una estimación de traslado; no se calcula automáticamente.
                        </div>
                      </>
                    ) : (
                      <label className="field full">
                        <span>Enlace de Google Meet</span>
                        <div className="input-with-icon">
                          <Link2 size={16} />
                          <input
                            value={form.meetUrl || ''}
                            onChange={(e) => setForm({ ...form, meetUrl: e.target.value })}
                            placeholder="https://meet.google.com/…"
                          />
                        </div>
                        <small className="field-help">
                          Pega el enlace de una reunión existente. Este formulario no crea una sala de Meet.
                        </small>
                      </label>
                    )}
                  </div>

                  <div className="form-section">
                    <div className="form-section-heading">
                      <span>03</span>
                      <div>
                        <b>Fecha, horario y participantes</b>
                        <small>Organiza el tiempo y las personas convocadas</small>
                      </div>
                    </div>
                    <div className="form-grid">
                      <label className="field">
                        <span>
                          Fecha <i>*</i>
                        </span>
                        <input
                          type="date"
                          value={form.date || ''}
                          onChange={(e) => setForm({ ...form, date: e.target.value })}
                        />
                      </label>
                      <label className="field">
                        <span>Estado inicial</span>
                        <EstadoReunionCatalogoSelect
                          value={form.status || 'PROGRAMADA'}
                          onChange={(status) => setForm({ ...form, status })}
                        />
                        <small className="field-help">
                          Catálogo gp_estados_reunion_c (Supabase): Programada · En curso · Realizada ·
                          Cancelada · Pospuesta · Reprogramada.
                        </small>
                      </label>
                      <label className="field">
                        <span>Tipo de reunión</span>
                        <TipoReunionCatalogoSelect
                          value={form.tipoCodigo || ''}
                          onChange={(tipoCodigo) => setForm({ ...form, tipoCodigo })}
                        />
                        <small className="field-help">
                          Catálogo gp_tipos_reunion_c (Supabase, 8 tipos PMI): Reunión de inicio ·
                          Seguimiento · Comité directivo · Planificación · Revisión · Retrospectiva ·
                          Cierre · Diaria.
                        </small>
                      </label>
                      <label className="field">
                        <span>
                          Hora de inicio <i>*</i>
                        </span>
                        <input
                          type="time"
                          value={form.start || ''}
                          onChange={(e) => setForm({ ...form, start: e.target.value })}
                        />
                      </label>
                      <label className="field">
                        <span>
                          Hora de fin <i>*</i>
                        </span>
                        <input
                          type="time"
                          value={form.end || ''}
                          onChange={(e) => setForm({ ...form, end: e.target.value })}
                        />
                      </label>
                    </div>
                    <label className="field full">
                      <span>
                        Participantes <small>(separa los nombres con comas)</small>
                      </span>
                      <input
                        value={(form.attendees || []).join(', ')}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            attendees: e.target.value
                              .split(',')
                              .map((s) => s.trim())
                              .filter(Boolean),
                          })
                        }
                        placeholder="Ej. María Rojas, Luis Salazar"
                      />
                    </label>
                    <label className="field full">
                      <span>Agenda propuesta</span>
                      <textarea
                        rows={3}
                        value={form.agenda || ''}
                        onChange={(e) => setForm({ ...form, agenda: e.target.value })}
                        placeholder={'Un punto por línea\n1. Revisión de avances\n2. Acuerdos y responsables'}
                      />
                    </label>
                    <label className="field full">
                      <span>Notas de preparación</span>
                      <textarea
                        rows={2}
                        value={form.notes || ''}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        placeholder="Materiales, confirmaciones, contexto…"
                      />
                    </label>
                  </div>

                  <div className="privacy-note">
                    <CircleHelp size={16} />
                    <span>Los datos se guardan en el almacenamiento local de este navegador.</span>
                  </div>
                </div>
                <div className="modal-footer">
                  <span>
                    <i>*</i> Campos obligatorios
                  </span>
                  <div>
                    <button className="button secondary" onClick={() => setFormOpen(false)}>
                      Cancelar
                    </button>
                    <button className="button primary" onClick={saveForm}>
                      <Check size={16} />
                      {editingId ? 'Guardar cambios' : 'Registrar reunión'}
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Modal de Acta de Reunión */}
        {newActOpen && (
          <div className="rm-v1">
            <div
              className="modal-overlay"
              role="presentation"
              onMouseDown={(e) => {
                if (e.target === e.currentTarget) setNewActOpen(false);
              }}
            >
              <section className="act-modal" role="dialog" aria-modal="true" aria-labelledby="act-title">
                <div className="modal-header">
                  <div>
                    <span className="drawer-kicker">DOCUMENTACIÓN · {selected.id}</span>
                    <h2 id="act-title">Acta de reunión</h2>
                    <p>Prepara y revisa el borrador antes de aprobarlo.</p>
                  </div>
                  <button className="icon-button" onClick={() => setNewActOpen(false)} aria-label="Cerrar acta">
                    <X size={19} />
                  </button>
                </div>
                <div className="act-modal-context">
                  <FileText size={17} />
                  <div>
                    <b>{selected.title}</b>
                    <span>
                      {formatDate(selected.date)} · {selected.start}–{selected.end} · {selected.modality}
                    </span>
                  </div>
                  <span
                    className={`act-pill ${
                      selected.actStatus === 'Cumple'
                        ? 'act-approved'
                        : selected.actStatus === 'En proceso'
                        ? 'act-draft'
                        : 'act-pending'
                    }`}
                  >
                    {selected.actStatus}
                  </span>
                </div>
                <label className="field full act-editor-label">
                  <span>Contenido del acta</span>
                  <textarea
                    className="act-editor"
                    rows={17}
                    value={actText}
                    onChange={(e) => setActText(e.target.value)}
                  />
                </label>
                <div className="upload-area">
                  <Paperclip size={18} />
                  <div>
                    <b>Adjuntar evidencias</b>
                    <span>Fotografías de la reunión, registro de asistencia u otros archivos.</span>
                    <small>En esta versión se registran los nombres de archivo.</small>
                  </div>
                  <label className="button secondary compact upload-button">
                    Añadir archivos
                    <input
                      type="file"
                      multiple
                      accept="image/*,.pdf,.doc,.docx"
                      onChange={(e) => setActFiles(Array.from(e.target.files || []).map((f) => f.name))}
                      hidden
                    />
                  </label>
                </div>
                {actFiles.length > 0 && (
                  <div className="attached-files">
                    {actFiles.map((f) => (
                      <span key={f}>
                        <Paperclip size={13} />
                        {f}
                      </span>
                    ))}
                  </div>
                )}
                <div className="privacy-note">
                  <CircleAlert size={16} />
                  <span>
                    El contenido generado o editado aquí es un borrador. Verifica acuerdos y responsables antes de aprobar.
                  </span>
                </div>
                <div className="modal-footer">
                  <span>La aprobación es una acción manual.</span>
                  <div>
                    <button className="button secondary" onClick={() => setNewActOpen(false)}>
                      Cancelar
                    </button>
                    <button className="button secondary" onClick={saveActDraft}>
                      <Pencil size={15} /> Guardar borrador
                    </button>
                    <button
                      className="button primary"
                      onClick={() => {
                        saveActDraft();
                        saveMeetings(
                          meetings.map((m) => (m.id === selectedId ? { ...m, actStatus: 'Cumple' } : m))
                        );
                        setNewActOpen(false);
                        notify('Acta aprobada · estado Cumple. Revisa el contenido antes de usarla oficialmente.');
                      }}
                    >
                      <CheckCircle2 size={15} /> Marcar aprobada
                    </button>
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {/* Modal de Reuniones del Día (Popover / Detalle diario) */}
        {dayModalDate && (
          <div className="rm-v1">
            <div
              className="modal-overlay"
              role="presentation"
              onMouseDown={() => setDayModalDate(null)}
            >
              <div
                className="day-events-modal"
                role="dialog"
                aria-modal="true"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="day-events-modal-head">
                  <div>
                    <span className="drawer-kicker">AGENDA DEL DÍA</span>
                    <h3>{dayName(dayModalDate)} · {formatDate(dayModalDate)}</h3>
                  </div>
                  <button
                    className="icon-button small"
                    onClick={() => setDayModalDate(null)}
                    aria-label="Cerrar"
                  >
                    <X size={17} />
                  </button>
                </div>
                <div className="day-events-modal-body">
                  {filtered.filter((m) => m.date === dayModalDate).length === 0 ? (
                    <div className="empty-state">No hay reuniones programadas para este día.</div>
                  ) : (
                    filtered
                      .filter((m) => m.date === dayModalDate)
                      .map((m) => {
                        const conflict = checkMeetingConflict(m, filtered);
                        return (
                          <div
                            key={m.id}
                            className={`day-card ${conflict ? 'has-conflict' : ''}`}
                            onClick={() => {
                              setSelectedId(m.id);
                              setSelectedDateKey(m.date);
                              setDetailOpen(true);
                              setDayModalDate(null);
                            }}
                          >
                            <div className="day-card-header">
                              <strong>{m.title}</strong>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {conflict && (
                                  <span className="conflict-badge" title={`Se cruza con: ${conflict.title}`}>
                                    <CircleAlert size={10} /> Cruce de horario
                                  </span>
                                )}
                                <span className={`status-pill ${claseEstadoReunion(m.status)}`}>
                                  {etiquetaEstadoReunion(m.status)}
                                </span>
                              </div>
                            </div>
                            <div className="day-card-meta">
                              <span>
                                <Clock3 size={13} /> {m.start} – {m.end} ({durationMins(m.start, m.end)} min)
                              </span>
                              <span>
                                {m.modality === 'Google Meet' ? <Video size={13} /> : <MapPin size={13} />} {m.site}
                              </span>
                              <span>
                                <Users size={13} /> {m.attendees.length} participantes
                              </span>
                            </div>
                          </div>
                        );
                      })
                  )}
                  <button
                    className="button secondary full-width"
                    style={{ marginTop: '8px' }}
                    onClick={() => {
                      setDayModalDate(null);
                      setForm((prev) => ({ ...prev, date: dayModalDate }));
                      openCreate();
                    }}
                  >
                    <Plus size={15} /> Programar reunión en este día
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Notificación Toast Enriquecida */}
        {toast && (
          <div
            className={`toast ${
              toastState?.type === 'warning'
                ? 'toast-warning'
                : toastState?.type === 'error'
                ? 'toast-error'
                : 'toast-success'
            }`}
          >
            {toastState?.type === 'warning' ? (
              <CircleAlert size={17} />
            ) : toastState?.type === 'error' ? (
              <CircleAlert size={17} />
            ) : (
              <CheckCircle2 size={17} />
            )}
            <span>{toast}</span>
          </div>
        )}
      </div>
    </div>
  );
}
