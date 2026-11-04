// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import '../cronograma-gantt/gantt.css';
import './reporteador.css';
import { useTableEngine, ColumnHeader, TableEngineStatus, type ColumnDef } from '../../shared/table-engine';
import {
  Activity, ArrowLeft, BarChart3, Bell, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight,
  Clock3, Download, ExternalLink, FileCheck2, FileText, Filter, Flag, FolderKanban,
  LayoutDashboard, ListChecks, MoreHorizontal, RefreshCw, Search, ShieldCheck, Users, X,
  ChartNoAxesColumnIncreasing
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

export type ReportBinds = {
  notify: (m: string) => void;
  setView?: (v: string) => void;
  exportOverviewCsv?: () => void;
  exportUgelCsv?: () => void;
};

type Sub = {
  id: string;
  name: string;
  dates: string;
  progress: number;
  status: 'Cumple' | 'En proceso' | 'Pendiente';
  children?: Sub[];
};

type Milestone = {
  id: string;
  name: string;
  description: string;
  dates: string;
  progress: number;
  status: 'Cumple' | 'En proceso' | 'Pendiente';
  presentation: string;
  children: Sub[];
};

const initialMilestones: Milestone[] = [
  {
    id: '1.4',
    name: 'Preparación de la distribución regional',
    description: 'Conformación de comités operativos y validación del plan',
    dates: '04 sep. – 30 oct. 2026',
    progress: 100,
    status: 'Cumple',
    presentation: 'Matriz de entregables',
    children: [
      { id: '1.4.1', name: 'Conformación de comités UGEL', dates: '04–18 sep. 2026', progress: 100, status: 'Cumple' },
      { id: '1.4.2', name: 'Planificación regional validada', dates: '19 sep.–30 oct. 2026', progress: 100, status: 'Cumple' },
    ],
  },
  {
    id: '1.6',
    name: 'Elaboración del CDL en MC SIGA',
    description: 'Corte regional: Fase 1, Fase 2 y validación DEI',
    dates: '12 oct. – 30 nov. 2026',
    progress: 67,
    status: 'En proceso',
    presentation: 'Línea de tiempo',
    children: [
      {
        id: '1.6.1',
        name: 'Fase 1 · Planificación y CDL preliminar',
        dates: '14–30 oct. 2026',
        progress: 100,
        status: 'Cumple',
        children: [
          { id: '1.6.1.a', name: 'Conformar comité UGEL', dates: '14–16 oct.', progress: 100, status: 'Cumple' },
          { id: '1.6.1.b', name: 'Remitir CDL preliminar', dates: '16–20 oct.', progress: 100, status: 'Cumple' },
          { id: '1.6.1.c', name: 'Validar modificaciones', dates: '20–30 oct.', progress: 100, status: 'Cumple' },
        ],
      },
      {
        id: '1.6.2',
        name: 'Fase 2 · Registro en MC SIGA (RAR / NEA)',
        dates: '02–20 nov. 2026',
        progress: 50,
        status: 'En proceso',
        children: [
          { id: '1.6.2.a', name: 'Carga de archivo RAR', dates: '02–05 nov.', progress: 100, status: 'Cumple' },
          { id: '1.6.2.b', name: 'Registro de NEA por UGEL', dates: '06–15 nov.', progress: 50, status: 'En proceso' },
          { id: '1.6.2.c', name: 'Revisión de inconsistencias', dates: '16–20 nov.', progress: 0, status: 'Pendiente' },
        ],
      },
      {
        id: '1.6.3',
        name: 'Fase 3 · Validación DEI – Nivel Inicial',
        dates: '21–30 nov. 2026',
        progress: 0,
        status: 'Pendiente',
        children: [
          { id: '1.6.3.a', name: 'Validación de matrícula inicial', dates: '21–24 nov.', progress: 0, status: 'Pendiente' },
          { id: '1.6.3.b', name: 'Registro final en MC SIGA', dates: '25–30 nov.', progress: 0, status: 'Pendiente' },
        ],
      },
    ],
  },
  {
    id: '2.1',
    name: 'Gestión de Almacenes y Recepción RAR / NEA',
    description: 'Control de recepción física y pecosas de materiales',
    dates: '11 sep. 2026 – 30 ene. 2027',
    progress: 42,
    status: 'En proceso',
    presentation: 'Matriz de entregables',
    children: [
      { id: '2.1.1', name: 'Recepción de archivos RAR', dates: 'Sep.–nov. 2026', progress: 65, status: 'En proceso' },
      { id: '2.1.2', name: 'Registro de NEA en almacén', dates: 'Nov. 2026–ene. 2027', progress: 20, status: 'En proceso' },
    ],
  },
  {
    id: '3.1',
    name: 'Distribución a Instituciones Educativas',
    description: 'Entrega final y actas de recepción con directores',
    dates: '05 nov. 2026 – 28 feb. 2027',
    progress: 18,
    status: 'Pendiente',
    presentation: 'Registro de cantidades',
    children: [
      { id: '3.1.1', name: 'Programación de rutas territoriales', dates: 'Nov. 2026', progress: 30, status: 'En proceso' },
      { id: '3.1.2', name: 'Confirmación de recepción en II. EE.', dates: 'Dic. 2026–feb. 2027', progress: 0, status: 'Pendiente' },
    ],
  },
  {
    id: '4.1',
    name: 'Cierre y Consolidado Regional Junín',
    description: 'Auditoría de consistencia de pecosas y cierre',
    dates: '01 mar. – 30 mar. 2027',
    progress: 0,
    status: 'Pendiente',
    presentation: 'Resumen ejecutivo',
    children: [
      { id: '4.1.1', name: 'Validación de actas y pecosas', dates: '01–15 mar. 2027', progress: 0, status: 'Pendiente' },
      { id: '4.1.2', name: 'Consolidación regional territorial', dates: '16–30 mar. 2027', progress: 0, status: 'Pendiente' },
    ],
  },
  {
    id: '5.1',
    name: 'Informe Final de Gestión Territorial',
    description: 'Remisión formal de informe de cumplimiento institucional',
    dates: '01 abr. – 30 abr. 2027',
    progress: 0,
    status: 'Pendiente',
    presentation: 'Resumen ejecutivo',
    children: [
      { id: '5.1.1', name: 'Elaboración del informe de cierre', dates: '01–20 abr. 2027', progress: 0, status: 'Pendiente' },
      { id: '5.1.2', name: 'Remisión formal del informe final', dates: '21–30 abr. 2027', progress: 0, status: 'Pendiente' },
    ],
  },
];

const generalTrend = [
  { date: '01 oct.', v: 18 },
  { date: '08 oct.', v: 31 },
  { date: '15 oct.', v: 49 },
  { date: '22 oct.', v: 61 },
  { date: '30 oct.', v: 67 },
];

const stepsHito16 = [
  { name: 'Elaboración del oficio múltiple UGEL', dates: '01–10 oct. 2026', s: 'done', p: 100 },
  { name: 'Envío y notificación a II. EE.', dates: '11–20 oct. 2026', s: 'done', p: 100 },
  { name: 'Registro de respuestas y CDL en MC SIGA', dates: '21–30 oct. 2026', s: 'active', p: 62 },
  { name: 'Validación regional de inconsistencias', dates: '31 oct.–05 nov. 2026', s: 'next', p: 0 },
  { name: 'Cierre del hito y conformidad de sede', dates: '06–10 nov. 2026', s: 'next', p: 0 },
];

const juninUgels = [
  { name: 'UGEL Huancayo', p: 100, s: 'done' },
  { name: 'UGEL Concepción', p: 100, s: 'done' },
  { name: 'UGEL Chupaca', p: 100, s: 'done' },
  { name: 'UGEL Jauja', p: 100, s: 'done' },
  { name: 'UGEL Tarma', p: 100, s: 'done' },
  { name: 'UGEL Yauli', p: 100, s: 'done' },
  { name: 'UGEL Junín', p: 100, s: 'done' },
  { name: 'UGEL Chanchamayo', p: 100, s: 'done' },
  { name: 'UGEL Satipo', p: 100, s: 'done' },
  { name: 'UGEL Pichanaki', p: 100, s: 'done' },
  { name: 'UGEL Pangoa', p: 100, s: 'done' },
  { name: 'UGEL Río Tambo', p: 50, s: 'work' },
  { name: 'UGEL Perené', p: 0, s: 'none' },
];

const historyHito = [
  { d: '05 oct.', a: 10, b: 0, c: 0 },
  { d: '09 oct.', a: 50, b: 20, c: 5 },
  { d: '12 oct.', a: 80, b: 45, c: 10 },
  { d: '15 oct.', a: 100, b: 65, c: 18 },
  { d: '18 oct.', a: 100, b: 85, c: 35 },
  { d: '21 oct.', a: 100, b: 92, c: 42 },
  { d: '24 oct.', a: 100, b: 95, c: 50 },
  { d: '27 oct.', a: 100, b: 95, c: 58 },
  { d: '30 oct.', a: 100, b: 100, c: 62 },
];

const colorFor = (s: string) =>
  s === 'Cumple' || s === 'done' ? 'green' : s === 'En proceso' || s === 'work' ? 'amber' : 'slate';

const REPORTEADOR_STATUS = [
  { value: 'Cumple', label: 'Cumple', color: '#10b981' },
  { value: 'En proceso', label: 'En proceso', color: '#f59e0b' },
  { value: 'Pendiente', label: 'Pendiente', color: '#94a3b8' },
];

const REPORTEADOR_COLUMNS: ColumnDef<Milestone>[] = [
  { id: 'name', label: 'Hito / Subproceso', type: 'text', accessor: (m) => `${m.id} ${m.name} ${m.description}` },
  { id: 'dates', label: 'Periodo', type: 'text', accessor: (m) => m.dates },
  { id: 'progress', label: 'Avance', type: 'percent', accessor: (m) => m.progress },
  { id: 'status', label: 'Estado', type: 'processState', accessor: (m) => m.status, options: REPORTEADOR_STATUS },
  { id: 'presentation', label: 'Formato de reporte', type: 'select', accessor: (m) => m.presentation },
];

export default function ReporteadorView({
  notify: externalNotify,
  setView,
  onActions,
}: {
  notify?: (m: string) => void;
  setView?: (v: string) => void;
  onActions?: (h: any) => void;
}) {
  const [viewMode, setViewMode] = useState<'overview' | 'hito'>('overview');
  const [selectedTab, setSelectedTab] = useState<string>('Todos');
  const [selectedHitoId, setSelectedHitoId] = useState<string>('1.6');
  const [milestones] = useState<Milestone[]>(initialMilestones);
  const engine = useTableEngine<Milestone>({ tableId: 'reporteador-hitos', columns: REPORTEADOR_COLUMNS, rows: milestones });
  const [expanded, setExpanded] = useState<string[]>(['1.6', '1.6.1', '1.6.2']);
  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState('Región Junín (13 UGEL)');
  const [scopeFilter, setScopeFilter] = useState('Región Junín (13 UGEL)');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [openDropdown, setOpenDropdown] = useState<'region' | 'status' | 'type' | 'hito' | 'scope' | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Estados de vista de hito individual
  const [stage, setStage] = useState(2);
  const [ugelSearch, setUgelSearch] = useState('');

  const notify = (msg: string) => {
    if (externalNotify) externalNotify(msg);
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
  }, []);

  const selectedMilestone = useMemo(
    () => milestones.find((m) => m.id === selectedHitoId) || milestones[1],
    [milestones, selectedHitoId]
  );

  const filteredMilestonesBase = useMemo(
    () =>
      milestones.filter((m) => {
        const matchSearch = (m.name + ' ' + m.id + ' ' + m.description).toLowerCase().includes(search.toLowerCase());
        const matchStatus = statusFilter === 'Todos' || m.status === statusFilter;
        const matchType = typeFilter === 'Todos' || m.presentation === typeFilter;
        const matchTab =
          selectedTab === 'Todos' ||
          (selectedTab === 'Cumplidos' && m.status === 'Cumple') ||
          (selectedTab === 'En proceso' && m.status === 'En proceso') ||
          (selectedTab === 'Pendientes' && m.status === 'Pendiente');

        return matchSearch && matchStatus && matchType && matchTab;
      }),
    [milestones, search, statusFilter, typeFilter, selectedTab]
  );

  const filteredMilestones = useMemo(
    () => engine.apply(filteredMilestonesBase),
    [engine.apply, filteredMilestonesBase]
  );

  const toggleExpand = (id: string) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const openMilestoneDetail = (id: string) => {
    const rootId = id.split('.')[0] + '.' + (id.split('.')[1] || '1');
    setSelectedHitoId(milestones.some((m) => m.id === rootId) ? rootId : '1.6');
    setViewMode('hito');
    notify(`Abriendo presentación de cumplimiento: Hito ${id}`);
  };

  const exportOverviewCsv = () => {
    const rows = [
      ['Hito', 'Descripción', 'Periodo', 'Avance', 'Estado', 'Presentación'],
      ...milestones.map((m) => [m.id + ' ' + m.name, m.description, m.dates, m.progress + '%', m.status, m.presentation]),
    ];
    const csv = '\ufeff' + rows.map((r) => r.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = 'reporte-hitos-gestion-territorial-2027.csv';
    a.click();
    URL.revokeObjectURL(a.href);
    notify('Reporte general de hitos exportado en CSV');
  };

  const exportUgelCsv = () => {
    const rows = [
      ['UGEL', 'Estado', 'Avance %', 'Región'],
      ...juninUgels.map((u) => [u.name, u.s === 'done' ? 'Cumple' : u.s === 'work' ? 'En proceso' : 'Sin registro', u.p + '%', 'Junín']),
    ];
    const csv = '\ufeff' + rows.map((r) => r.map((v) => '"' + String(v).replaceAll('"', '""') + '"').join(',')).join('\r\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = `cumplimiento-ugels-hito-${selectedHitoId}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
    notify('Cumplimiento por UGEL exportado en CSV');
  };

  useEffect(() => {
    onActions?.({
      notify,
      setView: (v: string) => setViewMode(v === 'hito' ? 'hito' : 'overview'),
      exportOverviewCsv,
      exportUgelCsv,
    });
  }, [onActions]);

  const filteredUgels = useMemo(
    () => juninUgels.filter((u) => u.name.toLowerCase().includes(ugelSearch.toLowerCase())),
    [ugelSearch]
  );

  const doneUgels = juninUgels.filter((u) => u.s === 'done').length;
  const workUgels = juninUgels.filter((u) => u.s === 'work').length;
  const noneUgels = juninUgels.filter((u) => u.s === 'none').length;
  const activeStep = stepsHito16[stage];

  const cumplidosCount = milestones.filter((m) => m.status === 'Cumple').length;
  const enProcesoCount = milestones.filter((m) => m.status === 'En proceso').length;
  const pendientesCount = milestones.filter((m) => m.status === 'Pendiente').length;

  return (
    <div className="gantt-v2">
      <div className="app rep-v1">
        {/* Cabecera Principal Oficial (Estándar Cronograma Maestro) */}
        <header className="header">
          <div className="heading">
            <span className="heading-icon">
              <BarChart3 size={26} />
            </span>
            <div>
              <span className="super">ANALÍTICA Y RENDICIÓN DE CUENTAS · DOTACIÓN 2027</span>
              <h1>Reporteador Territorial y Analítica</h1>
              <p>
                Evaluación estructural de hitos normativos, tendencias de aceleración y generación de dossiers ejecutivos.
              </p>
            </div>
          </div>
          <div className="head-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={() => notify('Generación de informe ejecutivo en formato PDF programada.')}
              title="Generar informe estructurado"
            >
              <FileText size={15} />
              <span>Generar Informe</span>
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={viewMode === 'overview' ? exportOverviewCsv : exportUgelCsv}
              title="Descargar datos en formato CSV institucional"
            >
              <Download size={15} />
              <span>{viewMode === 'overview' ? 'Exportar Dossier CSV' : 'Exportar UGELs CSV'}</span>
            </button>
          </div>
        </header>

        {/* Tarjetas Métricas Directivas (Idénticas a Cronograma y Resumen) */}
        <section className="metrics">
          <article
            className="metric blue"
            onClick={() => {
              setSelectedTab('Todos');
              setStatusFilter('Todos');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <ListChecks size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(milestones.length).padStart(2, '0')}</b>
              <strong>Hitos Rectores WBS</strong>
              <small>en el proyecto Dotación</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric green"
            onClick={() => {
              setSelectedTab('Cumplidos');
              setStatusFilter('Cumple');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <CheckCircle2 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(cumplidosCount).padStart(2, '0')}</b>
              <strong>Hitos Cumplidos ({Math.round((cumplidosCount / milestones.length) * 100)}%)</strong>
              <small>alcance normativo cubierto</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric amber"
            onClick={() => {
              setSelectedTab('En proceso');
              setStatusFilter('En proceso');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <Clock3 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(enProcesoCount).padStart(2, '0')}</b>
              <strong>En Proceso ({Math.round((enProcesoCount / milestones.length) * 100)}%)</strong>
              <small>monitoreo activo regional</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric red"
            onClick={() => {
              setSelectedTab('Pendientes');
              setStatusFilter('Pendiente');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <Flag size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(pendientesCount).padStart(2, '0')}</b>
              <strong>Pendientes ({Math.round((pendientesCount / milestones.length) * 100)}%)</strong>
              <small>por iniciar en calendario</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>
        </section>

        {/* =========================================================================
            LA CÁPSULA WORKSPACE CENTRAL (Idéntica a Cronograma, Hitos, Reuniones y Resumen)
           ========================================================================= */}
        <main className="workspace">
          {/* Tabs Superiores con Switcher de Vistas a la Derecha */}
          <nav className="tabs">
            <div className="tabs-list">
              {[
                { id: 'Todos', label: 'Todos los hitos', count: milestones.length },
                { id: 'Cumplidos', label: 'Cumplidos', count: cumplidosCount },
                { id: 'En proceso', label: 'En proceso', count: enProcesoCount },
                { id: 'Pendientes', label: 'Pendientes', count: pendientesCount },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={selectedTab === t.id ? 'active' : ''}
                  onClick={() => {
                    setSelectedTab(t.id);
                    setStatusFilter(t.id === 'Todos' ? 'Todos' : t.id === 'Cumplidos' ? 'Cumple' : t.id);
                  }}
                >
                  {t.label} <span>({t.count})</span>
                </button>
              ))}
            </div>

            {/* Switcher de Vistas Especializadas */}
            <div className="view-mode-switcher" role="tablist">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'overview' ? 'active' : ''}`}
                onClick={() => setViewMode('overview')}
                title="Resumen Analítico y WBS"
              >
                <LayoutDashboard size={14} />
                <span>Resumen Analítico</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'hito' ? 'active' : ''}`}
                onClick={() => setViewMode('hito')}
                title="Detalle Especializado por Hito"
              >
                <FileText size={14} />
                <span>Detalle por Hito</span>
              </button>
            </div>
          </nav>

          {/* Barra de Filtros Homologada */}
          <div className="filters">
            {/* Buscador de Hito */}
            <label className="search">
              <Search size={16} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por código, nombre o descripción..."
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Filtro Región */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'region' ? 'active' : ''} ${
                  regionFilter !== 'Región Junín (13 UGEL)' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'region' ? null : 'region');
                }}
                title="Filtrar por ámbito territorial"
              >
                <div className="filter-card-copy">
                  <small>Región</small>
                  <span>{regionFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'region' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
                  <div className="filter-popover-title">Filtrar por Región</div>
                  <div className="filter-popover-list">
                    {['Región Junín (13 UGEL)', 'Todas las regiones'].map((r) => (
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

            {/* Filtro Estado del Hito */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'status' ? 'active' : ''} ${
                  statusFilter !== 'Todos' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'status' ? null : 'status');
                }}
                title="Filtrar por estado del hito"
              >
                <div className="filter-card-copy">
                  <small>Estado del Hito</small>
                  <span>{statusFilter === 'Todos' ? 'Todos los estados' : statusFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'status' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
                  <div className="filter-popover-title">Filtrar por Estado</div>
                  <div className="filter-popover-list">
                    {['Todos', 'Cumple', 'En proceso', 'Pendiente'].map((s) => (
                      <button
                        key={s}
                        type="button"
                        className={`filter-item-btn ${statusFilter === s ? 'selected' : ''}`}
                        onClick={() => {
                          setStatusFilter(s);
                          setSelectedTab(s === 'Todos' ? 'Todos' : s === 'Cumple' ? 'Cumplidos' : s);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{s === 'Todos' ? 'Todos los estados' : s}</span>
                        {statusFilter === s && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Formato de Reporte */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'type' ? 'active' : ''} ${
                  typeFilter !== 'Todos' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'type' ? null : 'type');
                }}
                title="Filtrar por formato de presentación del entregable"
              >
                <div className="filter-card-copy">
                  <small>Formato de Reporte</small>
                  <span>{typeFilter === 'Todos' ? 'Todos los formatos' : typeFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'type' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 230 }}>
                  <div className="filter-popover-title">Formato de Reporte</div>
                  <div className="filter-popover-list">
                    {[
                      'Todos',
                      'Línea de tiempo',
                      'Matriz de entregables',
                      'Registro de cantidades',
                      'Resumen ejecutivo',
                    ].map((t) => (
                      <button
                        key={t}
                        type="button"
                        className={`filter-item-btn ${typeFilter === t ? 'selected' : ''}`}
                        onClick={() => {
                          setTypeFilter(t);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{t === 'Todos' ? 'Todos los formatos' : t}</span>
                        {typeFilter === t && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Selector de Hito activo si estamos en vista 'hito' */}
            {viewMode === 'hito' && (
              <div className="filter-dropdown-wrap">
                <button
                  type="button"
                  className={`filter-card-btn ${openDropdown === 'hito' ? 'active' : ''}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenDropdown(openDropdown === 'hito' ? null : 'hito');
                  }}
                  title="Cambiar hito en consulta"
                >
                  <div className="filter-card-copy">
                    <small>Hito en Consulta</small>
                    <span>{selectedMilestone.id} · {selectedMilestone.name.slice(0, 24)}...</span>
                  </div>
                  <ChevronDown size={14} className="filter-chevron" />
                </button>

                {openDropdown === 'hito' && (
                  <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 320, maxHeight: 260, overflowY: 'auto' }}>
                    <div className="filter-popover-title">Seleccionar Hito</div>
                    <div className="filter-popover-list">
                      {milestones.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          className={`filter-item-btn ${selectedHitoId === m.id ? 'selected' : ''}`}
                          onClick={() => {
                            setSelectedHitoId(m.id);
                            setOpenDropdown(null);
                            notify(`Consultando: Hito ${m.id} · ${m.name}`);
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', textAlign: 'left' }}>
                            <span style={{ fontWeight: 600 }}>{m.id} · {m.name}</span>
                            <small style={{ fontSize: '11px', color: '#64748b' }}>{m.presentation} · {m.progress}%</small>
                          </div>
                          {selectedHitoId === m.id && <Check size={14} className="item-check" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Etiqueta de Corte Territorial */}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#64748b', padding: '6px 12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <CalendarDays size={14} className="text-blue-600" />
              <span>Corte: <b>26 oct. 2026 · 17:30</b></span>
            </div>
          </div>

          {/* =====================================================================
              CONTENIDO DEL WORKSPACE SEGÚN VISTA SELECCIONADA
             ===================================================================== */}
          {viewMode === 'overview' ? (
            <>
              {/* Paneles de Gráficos Analíticos Superiores */}
              <div className="charts" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginBottom: '20px' }}>
                {/* 1. Avance regional por hito */}
                <section className="panel" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                  <div className="panel-head" style={{ marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Avance regional por hito</h2>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Porcentaje promedio de cumplimiento en las 13 UGEL.</p>
                  </div>
                  <div className="bar-chart" style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { id: '1.4', name: 'Preparación', v: 100 },
                          { id: '1.6', name: 'CDL SIGA', v: 67 },
                          { id: '2.1', name: 'Recepción', v: 42 },
                          { id: '3.1', name: 'Distribución', v: 18 },
                          { id: '4.1', name: 'Cierre', v: 0 },
                          { id: '5.1', name: 'Informe', v: 0 },
                        ]}
                        margin={{ top: 14, right: 8, bottom: 0, left: -18 }}
                      >
                        <CartesianGrid stroke="#e2e8f0" vertical={false} strokeDasharray="3 4" />
                        <XAxis dataKey="id" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(v) => [`${v}%`, 'Cumplimiento']}
                          cursor={{ fill: 'rgba(37, 99, 235, 0.08)', radius: 4 }}
                          contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 14px rgba(15,23,42,0.08)' }}
                        />
                        <Bar
                          dataKey="v"
                          radius={[5, 5, 0, 0]}
                          fill="#2563eb"
                          isAnimationActive={true}
                          animationBegin={150}
                          animationDuration={1200}
                          animationEasing="ease-out"
                          activeBar={{ fill: '#1d4ed8', stroke: '#1e40af', strokeWidth: 1.5 }}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                {/* 2. Estado de los hitos (Donut) */}
                <section className="panel" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                  <div className="panel-head" style={{ marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Estado de los hitos</h2>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Distribución porcentual actual.</p>
                  </div>
                  <div className="donut-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '220px' }}>
                    <div className="donut" style={{ position: 'relative', width: '136px', height: '136px', background: 'transparent' }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Tooltip
                            formatter={(v: any, name: any) => [`${v} hitos (${Math.round((Number(v) / 6) * 100)}%)`, name]}
                            contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 14px rgba(15,23,42,0.08)' }}
                          />
                          <Pie
                            data={[
                              { name: 'Cumplidos', value: 1, color: '#10b981' },
                              { name: 'En proceso', value: 3, color: '#f59e0b' },
                              { name: 'Pendientes', value: 2, color: '#ef4444' },
                            ]}
                            innerRadius={42}
                            outerRadius={65}
                            paddingAngle={3}
                            dataKey="value"
                            isAnimationActive={true}
                            animationBegin={200}
                            animationDuration={1300}
                            animationEasing="ease-out"
                          >
                            <Cell fill="#10b981" />
                            <Cell fill="#f59e0b" />
                            <Cell fill="#ef4444" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <b style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>06</b>
                        <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>hitos</small>
                      </div>
                    </div>
                    <div className="donut-legend" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div className="legend-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                        <span className="legend-dot green" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ color: '#475569' }}>Cumplidos</span>
                        <b style={{ marginLeft: 'auto', color: '#0f172a' }}>1 (17%)</b>
                      </div>
                      <div className="legend-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                        <span className="legend-dot amber" style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                        <span style={{ color: '#475569' }}>En proceso</span>
                        <b style={{ marginLeft: 'auto', color: '#0f172a' }}>3 (50%)</b>
                      </div>
                      <div className="legend-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px' }}>
                        <span className="legend-dot red" style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                        <span style={{ color: '#475569' }}>Pendientes</span>
                        <b style={{ marginLeft: 'auto', color: '#0f172a' }}>2 (33%)</b>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 3. Evolución del avance regional (LineChart) */}
                <section className="panel" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                  <div className="panel-head" style={{ marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Evolución del avance regional</h2>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Curva de cumplimiento acumulado.</p>
                  </div>
                  <div className="line-chart" style={{ height: '220px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={generalTrend} margin={{ top: 14, right: 8, bottom: 0, left: -18 }}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 4" vertical={false} />
                        <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          formatter={(v) => [`${v}%`, 'Avance']}
                          cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                          contentStyle={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '12px', boxShadow: '0 4px 14px rgba(15,23,42,0.08)' }}
                        />
                        <Line
                          dataKey="v"
                          name="Avance"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={{ r: 4, fill: '#2563eb' }}
                          isAnimationActive={true}
                          animationBegin={250}
                          animationDuration={1300}
                          animationEasing="ease-out"
                          activeDot={{ r: 6.5, stroke: '#2563eb', strokeWidth: 2.5, fill: '#ffffff' }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>

              {/* Tabla Principal Jerárquica de Hitos y Subprocesos */}
              <div className="cronograma-lista-table" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', background: '#f8fafc' }}>
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Hitos y Subprocesos Reportables</h2>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                      Estructura WBS desglosada. Haz clic en "Abrir reporte" para consultar el cumplimiento y evidencias por UGEL.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <button
                      type="button"
                      className="btn secondary"
                      onClick={() => setExpanded(expanded.length > 0 ? [] : ['1.4', '1.6', '1.6.1', '1.6.2', '2.1', '3.1'])}
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                    >
                      {expanded.length > 0 ? 'Colapsar todo' : 'Expandir todo'}
                    </button>
                  </div>
                </div>

                <div className="table-scroll" style={{ overflowX: 'auto' }}>
                  <TableEngineStatus engine={engine} />
                  <table>
                    <thead>
                      <tr>
                        <th style={{ paddingLeft: '24px' }}>
                          <ColumnHeader engine={engine} columnId="name" label="Hito / Subproceso" />
                        </th>
                        <th><ColumnHeader engine={engine} columnId="dates" label="Periodo" /></th>
                        <th><ColumnHeader engine={engine} columnId="progress" label="Avance" /></th>
                        <th><ColumnHeader engine={engine} columnId="status" label="Estado" /></th>
                        <th><ColumnHeader engine={engine} columnId="presentation" label="Formato de Reporte" /></th>
                        <th style={{ width: '130px', textAlign: 'right', paddingRight: '20px' }}>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredMilestones.map((m) => (
                        <React.Fragment key={m.id}>
                          <tr className="root-row">
                            <td style={{ paddingLeft: '20px' }}>
                              <div className="name-cell">
                                {m.children && m.children.length > 0 ? (
                                  <button
                                    type="button"
                                    className="expand-btn"
                                    onClick={() => toggleExpand(m.id)}
                                    title={expanded.includes(m.id) ? 'Colapsar subprocesos' : 'Expandir subprocesos'}
                                  >
                                    {expanded.includes(m.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                  </button>
                                ) : (
                                  <span className="expand-btn" style={{ visibility: 'hidden' }} />
                                )}
                                <button
                                  type="button"
                                  className="name-button"
                                  onClick={() => openMilestoneDetail(m.id)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}
                                >
                                  <span className={`row-icon ${colorFor(m.status)}`}>
                                    <FileText size={16} />
                                  </span>
                                  <div>
                                    <b style={{ color: '#0f172a' }}>{m.id} · {m.name}</b>
                                    <small style={{ color: '#64748b' }}>{m.description}</small>
                                  </div>
                                </button>
                              </div>
                            </td>
                            <td style={{ whiteSpace: 'nowrap', fontSize: '13px', color: '#475569' }}>{m.dates}</td>
                            <td>
                              <div className="progress-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div className="progress-track" style={{ flex: 1, minWidth: '70px', height: '6px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                  <i
                                    className={colorFor(m.status)}
                                    style={{
                                      display: 'block',
                                      height: '100%',
                                      borderRadius: '999px',
                                      width: `${m.progress}%`,
                                      background: m.status === 'Cumple' ? '#10b981' : m.status === 'En proceso' ? '#f59e0b' : '#94a3b8'
                                    }}
                                  />
                                </div>
                                <b style={{ fontSize: '12.5px', color: '#0f172a', minWidth: '36px' }}>{m.progress}%</b>
                              </div>
                            </td>
                            <td>
                              <span className={`status ${colorFor(m.status)}`}>{m.status}</span>
                            </td>
                            <td>
                              <span className="presentation-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '12px', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', color: '#334155', fontWeight: 500 }}>
                                <BarChart3 size={13} className="text-blue-600" /> {m.presentation}
                              </span>
                            </td>
                            <td style={{ textAlign: 'right', paddingRight: '20px' }}>
                              <button
                                type="button"
                                className="btn secondary"
                                style={{ padding: '5px 10px', fontSize: '12px', gap: '4px' }}
                                onClick={() => openMilestoneDetail(m.id)}
                              >
                                <span>Abrir reporte</span>
                                <ChevronRight size={12} />
                              </button>
                            </td>
                          </tr>

                          {/* Subhitos si está expandido */}
                          {expanded.includes(m.id) &&
                            m.children.map((sub) => (
                              <tr className="child-row" key={sub.id} style={{ background: '#fcfdfd' }}>
                                <td style={{ paddingLeft: '56px' }}>
                                  <div className="name-cell">
                                    <span className="row-icon child"><ListChecks size={13} /></span>
                                    <div>
                                      <b style={{ fontSize: '13px', color: '#334155' }}>{sub.id} · {sub.name}</b>
                                    </div>
                                  </div>
                                </td>
                                <td style={{ whiteSpace: 'nowrap', fontSize: '12.5px', color: '#64748b' }}>{sub.dates}</td>
                                <td>
                                  <div className="progress-cell" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div className="progress-track" style={{ flex: 1, minWidth: '70px', height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                      <i
                                        style={{
                                          display: 'block',
                                          height: '100%',
                                          borderRadius: '999px',
                                          width: `${sub.progress}%`,
                                          background: sub.status === 'Cumple' ? '#10b981' : sub.status === 'En proceso' ? '#f59e0b' : '#94a3b8'
                                        }}
                                      />
                                    </div>
                                    <b style={{ fontSize: '12px', color: '#475569', minWidth: '36px' }}>{sub.progress}%</b>
                                  </div>
                                </td>
                                <td>
                                  <span className={`status ${colorFor(sub.status)}`} style={{ fontSize: '11px', padding: '2px 8px' }}>{sub.status}</span>
                                </td>
                                <td colSpan={2}>
                                  <small style={{ color: '#94a3b8', fontSize: '11.5px' }}>Subproceso operativo territorial</small>
                                </td>
                              </tr>
                            ))}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* =====================================================================
                VISTA DETALLE ESPECIALIZADA POR HITO
               ===================================================================== */
            <div className="report-detail-view">
              {/* Barra de Retorno y Contexto del Hito */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', background: '#f8fafc', borderRadius: '10px', marginBottom: '18px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => setViewMode('overview')}
                    style={{ gap: '6px', fontSize: '12.5px' }}
                  >
                    <ArrowLeft size={15} />
                    <span>Volver al Resumen Analítico</span>
                  </button>
                  <div>
                    <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                      Hito {selectedMilestone.id} · {selectedMilestone.name}
                    </h2>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>
                      {selectedMilestone.description} · Formato: <b>{selectedMilestone.presentation}</b>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span className={`status ${colorFor(selectedMilestone.status)}`} style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '6px' }}>
                    {selectedMilestone.status} ({selectedMilestone.progress}%)
                  </span>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={exportUgelCsv}
                    style={{ fontSize: '12px', padding: '6px 12px' }}
                  >
                    <Download size={14} />
                    <span>Exportar UGELs CSV</span>
                  </button>
                </div>
              </div>

              {/* Secuencia del proceso (Steps del Hito) */}
              <section className="box timeline" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                <div className="section-head" style={{ marginBottom: '16px' }}>
                  <div>
                    <small style={{ fontSize: '11px', fontWeight: 800, color: '#2563eb', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                      SECUENCIA DEL PROCESO
                    </small>
                    <h2 style={{ fontSize: '15.5px', fontWeight: 700, color: '#0f172a', margin: '3px 0 0' }}>Ruta de cumplimiento del hito</h2>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                      Selecciona una etapa para consultar el cumplimiento y las evidencias reportadas por las UGEL.
                    </p>
                  </div>
                </div>

                <div className="steps">
                  {stepsHito16.map((s, i) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => setStage(i)}
                      className={`step ${s.s} ${stage === i ? 'chosen' : ''}`}
                    >
                      <div className="step-top">
                        <span className="step-num">{s.s === 'done' ? <Check size={14} /> : i + 1}</span>
                        <small>ETAPA {String(i + 1).padStart(2, '0')}</small>
                      </div>
                      <h3>{s.name}</h3>
                      <p><CalendarDays size={12} /> {s.dates}</p>
                      <div className="progress-track" style={{ marginTop: 'auto', height: '5px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                        <i style={{ width: `${s.p}%`, display: 'block', height: '100%', background: s.s === 'done' ? '#10b981' : '#2563eb', borderRadius: '999px' }} />
                      </div>
                      <div className="step-bottom">
                        <b>{s.p}%</b>
                        <span>{s.s === 'done' ? '13/13' : s.s === 'active' ? '11/13' : '0/13'} UGEL</span>
                      </div>
                    </button>
                  ))}
                </div>
              </section>

              {/* Grilla de Cumplimiento por UGEL */}
              <section className="box ugel-strip" style={{ background: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px', marginBottom: '20px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                <div className="strip-head" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <h2 style={{ fontSize: '15.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Cumplimiento en las 13 UGEL de Junín</h2>
                    <p style={{ fontSize: '12.5px', color: '#64748b', margin: '2px 0 0' }}>
                      Etapa activa: <b>{activeStep.name}</b> ({activeStep.dates})
                    </p>
                  </div>
                  <div className="table-search" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f8fafc', padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <Search size={14} className="text-slate-400" />
                    <input
                      style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '12.5px', color: '#0f172a', width: '160px' }}
                      placeholder="Buscar UGEL..."
                      value={ugelSearch}
                      onChange={(e) => setUgelSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="ugel-grid">
                  {filteredUgels.map((u) => (
                    <article className={`ugel-card ${u.s}`} key={u.name}>
                      <div className="ugel-card-top">
                        <span className="ugel-dot">
                          {u.s === 'done' ? <Check size={11} /> : u.s === 'work' ? <Clock3 size={11} /> : <X size={11} />}
                        </span>
                        <b>{u.p}%</b>
                      </div>
                      <strong>{u.name}</strong>
                      <div className="progress-track" style={{ height: '4px', margin: '4px 0', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                        <i style={{ width: `${u.p}%`, display: 'block', height: '100%', background: u.s === 'done' ? '#10b981' : u.s === 'work' ? '#f59e0b' : '#ef4444', borderRadius: '999px' }} />
                      </div>
                      <small>{u.s === 'done' ? 'Cumple' : u.s === 'work' ? 'En proceso' : 'Sin registro'}</small>
                    </article>
                  ))}
                </div>
              </section>

              {/* Gráficos de evolución del hito */}
              <div className="charts" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px' }}>
                <section className="panel" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
                  <div className="panel-head" style={{ marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Resumen de la etapa {stage + 1}</h2>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Estado de atención de las 13 UGEL.</p>
                  </div>
                  <div className="donut-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', height: '200px' }}>
                    <div className="donut" style={{ background: `conic-gradient(#10b981 0 ${(doneUgels / 13) * 100}%, #f59e0b ${(doneUgels / 13) * 100}% ${((doneUgels + workUgels) / 13) * 100}%, #ef4444 ${((doneUgels + workUgels) / 13) * 100}% 100%)`, width: '120px', height: '120px', borderRadius: '50%', display: 'grid', placeItems: 'center', position: 'relative' }}>
                      <div style={{ width: '82px', height: '82px', borderRadius: '50%', background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                        <b style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>13</b>
                        <small style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>UGEL</small>
                      </div>
                    </div>
                    <div className="donut-legend" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div className="legend-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span className="legend-dot green" style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                        <span style={{ color: '#475569' }}>Cumplieron</span>
                        <b style={{ marginLeft: 'auto', color: '#0f172a' }}>{doneUgels}</b>
                      </div>
                      <div className="legend-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span className="legend-dot amber" style={{ width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                        <span style={{ color: '#475569' }}>En proceso</span>
                        <b style={{ marginLeft: 'auto', color: '#0f172a' }}>{workUgels}</b>
                      </div>
                      <div className="legend-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                        <span className="legend-dot red" style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
                        <span style={{ color: '#475569' }}>Sin registro</span>
                        <b style={{ marginLeft: 'auto', color: '#0f172a' }}>{noneUgels}</b>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="panel" style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '18px 20px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)', gridColumn: 'span 2' }}>
                  <div className="panel-head" style={{ marginBottom: '14px' }}>
                    <h2 style={{ fontSize: '14.5px', fontWeight: 700, color: '#0f172a', margin: 0 }}>Histórico de avance por etapa del hito</h2>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0' }}>Evolución temporal del registro en MC SIGA.</p>
                  </div>
                  <div className="line-chart" style={{ height: '200px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={historyHito} margin={{ top: 14, right: 12, bottom: 0, left: -18 }}>
                        <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 4" vertical={false} />
                        <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                        <Tooltip formatter={(v) => [`${v}%`, 'Cumplimiento']} />
                        <Line dataKey="a" name="Etapa 1 · Oficio" stroke="#10b981" strokeWidth={2.5} dot={false} />
                        <Line dataKey="b" name="Etapa 2 · Notificación" stroke="#f59e0b" strokeWidth={2.5} dot={false} />
                        <Line dataKey="c" name="Etapa 3 · CDL MC SIGA" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </section>
              </div>
            </div>
          )}

          {/* Footer de Auditoría de la Cápsula Workspace */}
          <footer className="footer">
            <span>
              Mostrando {viewMode === 'overview' ? filteredMilestones.length : filteredUgels.length} {viewMode === 'overview' ? 'hitos rectores analizados' : 'UGEL de Junín'}
            </span>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center', fontSize: '12px', color: '#64748b' }}>
              <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981', marginRight: 4 }} /> Cumple</span>
              <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#f59e0b', marginRight: 4 }} /> En proceso</span>
              <span><i style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#94a3b8', marginRight: 4 }} /> Pendiente / Sin registro</span>
            </div>
          </footer>
        </main>
      </div>

      {toast && (
        <div
          className="toast"
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 18px',
            borderRadius: '8px',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
          }}
        >
          <Check size={16} className="text-green-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
