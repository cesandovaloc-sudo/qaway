// @ts-nocheck
import React, { useMemo, useRef, useState, useEffect } from 'react';
import './reporteador.css';
import {
  Activity, ArrowLeft, BarChart3, Bell, CalendarDays, Check, CheckCircle2, ChevronDown, ChevronRight,
  Clock3, Download, Ellipsis, ExternalLink, FileCheck2, FileText, Filter, Flag, FolderKanban,
  LayoutDashboard, ListChecks, MoreHorizontal, Search, ShieldCheck, Users, X
} from 'lucide-react';
import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis
} from 'recharts';

export type ReportBinds = { notify: (m: string) => void; setView?: (v: string) => void };

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
    description: 'Corte DRE Junín: Fase 1, Fase 2 y validación DEI',
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
      { id: '4.1.2', name: 'Consolidación regional DRE', dates: '16–30 mar. 2027', progress: 0, status: 'Pendiente' },
    ],
  },
  {
    id: '5.1',
    name: 'Informe Final de Gestión Territorial',
    description: 'Remisión de informe de cumplimiento al MINEDU',
    dates: '01 abr. – 30 abr. 2027',
    progress: 0,
    status: 'Pendiente',
    presentation: 'Resumen ejecutivo',
    children: [
      { id: '5.1.1', name: 'Elaboración del informe de cierre', dates: '01–20 abr. 2027', progress: 0, status: 'Pendiente' },
      { id: '5.1.2', name: 'Remisión formal al MINEDU', dates: '21–30 abr. 2027', progress: 0, status: 'Pendiente' },
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
  { name: 'Cierre del hito y conformidad DRE', dates: '06–10 nov. 2026', s: 'next', p: 0 },
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

const colorFor = (s: string) => (s === 'Cumple' || s === 'done' ? 'green' : s === 'En proceso' || s === 'work' ? 'amber' : 'slate');

export default function ReporteadorView({ onActions }: { onActions?: (h: ReportBinds) => void }) {
  const [viewMode, setViewMode] = useState<'overview' | 'hito'>('overview');
  const [selectedHitoId, setSelectedHitoId] = useState<string>('1.6');
  const [milestones] = useState<Milestone[]>(initialMilestones);
  const [expanded, setExpanded] = useState<string[]>(['1.6', '1.6.1', '1.6.2']);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [typeFilter, setTypeFilter] = useState('Todos');
  const [detail, setDetail] = useState<Milestone | Sub | null>(null);
  const [toast, setToast] = useState('');

  // Estados de vista de hito individual
  const [stage, setStage] = useState(2);
  const [ugelSearch, setUgelSearch] = useState('');
  const [showUgelSummary, setShowUgelSummary] = useState(false);

  const notify = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(''), 2600);
  };

  useEffect(() => {
    onActions?.({ notify, setView: (v: string) => setViewMode(v === 'hito' ? 'hito' : 'overview') });
  }, [onActions]);

  const selectedMilestone = milestones.find((m) => m.id === selectedHitoId) || milestones[1];

  const filteredMilestones = useMemo(
    () =>
      milestones.filter(
        (m) =>
          (m.name + ' ' + m.id + ' ' + m.description).toLowerCase().includes(search.toLowerCase()) &&
          (statusFilter === 'Todos' || m.status === statusFilter) &&
          (typeFilter === 'Todos' || m.presentation === typeFilter)
      ),
    [milestones, search, statusFilter, typeFilter]
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
    a.download = 'reporte-hitos-minedu-2027.csv';
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

  const filteredUgels = useMemo(
    () => juninUgels.filter((u) => u.name.toLowerCase().includes(ugelSearch.toLowerCase())),
    [ugelSearch]
  );

  const doneUgels = juninUgels.filter((u) => u.s === 'done').length;
  const workUgels = juninUgels.filter((u) => u.s === 'work').length;
  const noneUgels = juninUgels.filter((u) => u.s === 'none').length;
  const activeStep = stepsHito16[stage];

  return (
    <div className="rep-v1">
      {/* Topbar unificada del Canvas */}
      <header className="topbar">
        <div>
          Proyecto <ChevronRight size={13} /> <b>MINEDU · Dotación 2027</b> <ChevronRight size={13} />{' '}
          <b>Reportes</b> {viewMode === 'hito' && <> <ChevronRight size={13} /> <b className="text-blue-600">Hito {selectedMilestone.id}</b></>}
        </div>
        <div className="top-actions">
          <button className="iconbtn" onClick={() => notify('Reporteador conectado al marco territorial MINEDU.')}>
            <ShieldCheck size={18} />
          </button>
          <button className="iconbtn" onClick={() => notify('Sin alertas nuevas en esta demostración.')}>
            <Bell size={18} />
          </button>
          <div className="avatar">CM</div>
        </div>
      </header>

      <div className="content">
        {viewMode === 'overview' ? (
          <>
            {/* Cabecera de la Vista General */}
            <div className="page-head">
              <div>
                <div className="eyebrow">CENTRO DE PRESENTACIONES Y SEGUIMIENTO</div>
                <h1>Reporteador de Hitos y Entregables</h1>
                <p>Monitoreo del avance de los hitos del proyecto Dotación 2027 y consulta de la presentación de cumplimiento por UGEL.</p>
              </div>
              <div className="head-meta">
                <span className="tag">13 UGEL · Región Junín</span>
                <button className="outline-btn" onClick={exportOverviewCsv}>
                  <Download size={15} /> Exportar CSV
                </button>
              </div>
            </div>

            {/* Barra de Filtros */}
            <div className="filters">
              <label>
                <span>Región</span>
                <select defaultValue="Junín">
                  <option>Región Junín (13 UGEL)</option>
                  <option>Todas las regiones</option>
                </select>
              </label>
              <label>
                <span>Estado del hito</span>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                  <option>Todos</option>
                  <option>Cumple</option>
                  <option>En proceso</option>
                  <option>Pendiente</option>
                </select>
              </label>
              <label>
                <span>Tipo de presentación</span>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                  <option>Todos</option>
                  <option>Línea de tiempo</option>
                  <option>Matriz de entregables</option>
                  <option>Registro de cantidades</option>
                  <option>Resumen ejecutivo</option>
                </select>
              </label>
              <div className="updated">
                <CalendarDays size={18} />
                <div>
                  <small>ÚLTIMA ACTUALIZACIÓN REGIONAL</small>
                  <b>26 oct. 2026 · 17:30</b>
                </div>
              </div>
            </div>

            {/* Tarjetas KPI Superiores (Power BI / Trello style) */}
            <div className="kpis">
              <div className="kpi-card">
                <div className="kpi-icon blue"><ListChecks size={22} /></div>
                <div className="kpi-info">
                  <span>Total de hitos</span>
                  <b>06</b>
                  <small>en el proyecto Dotación</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon green"><CheckCircle2 size={22} /></div>
                <div className="kpi-info">
                  <span>Hitos cumplidos</span>
                  <b>01</b>
                  <small>17% del alcance meta</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon amber"><Clock3 size={22} /></div>
                <div className="kpi-info">
                  <span>En proceso</span>
                  <b>03</b>
                  <small>50% con avance activo</small>
                </div>
              </div>
              <div className="kpi-card">
                <div className="kpi-icon red"><Flag size={22} /></div>
                <div className="kpi-info">
                  <span>Pendientes</span>
                  <b>02</b>
                  <small>33% por iniciar</small>
                </div>
              </div>
            </div>

            {/* Paneles de Gráficos (Recharts) */}
            <div className="charts">
              <section className="panel">
                <div className="panel-head">
                  <h2>Avance regional por hito</h2>
                  <p>Porcentaje promedio de cumplimiento en las 13 UGEL.</p>
                </div>
                <div className="bar-chart">
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
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Bar dataKey="v" radius={[5, 5, 0, 0]} fill="#2563eb" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>

              <section className="panel">
                <div className="panel-head">
                  <h2>Estado de los hitos</h2>
                  <p>Distribución porcentual actual.</p>
                </div>
                <div className="donut-row">
                  <div className="donut">
                    <div>
                      <b>06</b>
                      <small>hitos</small>
                    </div>
                  </div>
                  <div className="donut-legend">
                    <div className="legend-row">
                      <span className="legend-dot green" />
                      <span>Cumplidos</span>
                      <b>1 (17%)</b>
                    </div>
                    <div className="legend-row">
                      <span className="legend-dot amber" />
                      <span>En proceso</span>
                      <b>3 (50%)</b>
                    </div>
                    <div className="legend-row">
                      <span className="legend-dot red" />
                      <span>Pendientes</span>
                      <b>2 (33%)</b>
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel">
                <div className="panel-head">
                  <h2>Evolución del avance regional</h2>
                  <p>Curva de cumplimiento acumulado.</p>
                </div>
                <div className="line-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={generalTrend} margin={{ top: 14, right: 8, bottom: 0, left: -18 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 4" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => `${v}%`} />
                      <Line dataKey="v" name="Avance" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 4, fill: '#2563eb' }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>

            {/* Tabla Principal de Hitos y Subprocesos */}
            <section className="panel hierarchy-panel">
              <div className="table-heading">
                <div>
                  <h2>Hitos y subprocesos reportables</h2>
                  <p>Haz clic en el nombre de un hito o en su botón para abrir la presentación especializada de cumplimiento.</p>
                </div>
                <div className="table-search">
                  <Search size={14} />
                  <input placeholder="Buscar hito..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>

              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: '24px' }}>Hito / Subproceso</th>
                      <th>Periodo</th>
                      <th>Avance</th>
                      <th>Estado</th>
                      <th>Formato de reporte</th>
                      <th>Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMilestones.map((m) => (
                      <React.Fragment key={m.id}>
                        <tr className="root-row">
                          <td style={{ paddingLeft: '20px' }}>
                            <div className="name-cell">
                              {m.children && m.children.length > 0 ? (
                                <button className="expand-btn" onClick={() => toggleExpand(m.id)}>
                                  {expanded.includes(m.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                              ) : (
                                <span className="expand-btn" style={{ visibility: 'hidden' }} />
                              )}
                              <button className="name-button" onClick={() => openMilestoneDetail(m.id)}>
                                <span className={`row-icon ${colorFor(m.status)}`}>
                                  <FileText size={16} />
                                </span>
                                <div>
                                  <b>{m.id} · {m.name}</b>
                                  <small>{m.description}</small>
                                </div>
                              </button>
                            </div>
                          </td>
                          <td>{m.dates}</td>
                          <td>
                            <div className="progress-cell">
                              <div className="progress-track">
                                <i className={colorFor(m.status)} style={{ width: `${m.progress}%` }} />
                              </div>
                              <b style={{ marginLeft: '8px', fontSize: '13px' }}>{m.progress}%</b>
                            </div>
                          </td>
                          <td>
                            <span className={`status ${colorFor(m.status)}`}>{m.status}</span>
                          </td>
                          <td>
                            <span className="presentation-badge">
                              <BarChart3 size={13} /> {m.presentation}
                            </span>
                          </td>
                          <td>
                            <button className="outline-btn" style={{ padding: '5px 10px', fontSize: '12px' }} onClick={() => openMilestoneDetail(m.id)}>
                              Abrir reporte <ChevronRight size={12} />
                            </button>
                          </td>
                        </tr>

                        {/* Subhitos si está expandido */}
                        {expanded.includes(m.id) &&
                          m.children.map((sub) => (
                            <tr className="child-row" key={sub.id}>
                              <td style={{ paddingLeft: '56px' }}>
                                <div className="name-cell">
                                  <span className="row-icon child"><ListChecks size={13} /></span>
                                  <div>
                                    <b style={{ fontSize: '13.5px' }}>{sub.id} · {sub.name}</b>
                                  </div>
                                </div>
                              </td>
                              <td>{sub.dates}</td>
                              <td>
                                <div className="progress-cell">
                                  <div className="progress-track">
                                    <i className={colorFor(sub.status)} style={{ width: `${sub.progress}%` }} />
                                  </div>
                                  <b style={{ marginLeft: '8px', fontSize: '12px' }}>{sub.progress}%</b>
                                </div>
                              </td>
                              <td>
                                <span className={`status ${colorFor(sub.status)}`}>{sub.status}</span>
                              </td>
                              <td colSpan={2}>
                                <small className="text-slate-400">Subproceso operativo</small>
                              </td>
                            </tr>
                          ))}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="table-foot">
                <span>Mostrando {filteredMilestones.length} de {milestones.length} hitos rectores</span>
                <span>
                  <i className="green-dot" /> Cumple &nbsp;
                  <i className="amber-dot" /> En proceso &nbsp;
                  <i className="gray-dot" /> Pendiente
                </span>
              </div>
            </section>
          </>
        ) : (
          /* ─────────────────────────────────────────────────────────── */
          /* VISTA DETALLE DE HITO INDIVIDUAL (Filtro 2 / Drill-down)   */
          /* ─────────────────────────────────────────────────────────── */
          <div className="report-detail-view">
            <button className="back-link" onClick={() => setViewMode('overview')}>
              <ArrowLeft size={16} /> Volver al resumen de hitos
            </button>

            <div className="page-head">
              <div>
                <div className="eyebrow">REPORTE DETALLADO DE CUMPLIMIENTO POR UGEL</div>
                <h1>Hito {selectedMilestone.id} · {selectedMilestone.name}</h1>
                <p>{selectedMilestone.description} · Formato: {selectedMilestone.presentation}</p>
              </div>
              <div className="head-actions">
                <div className="deadline">
                  <Flag size={18} />
                  <div>
                    <small>FECHA LÍMITE DEL HITO</small>
                    <b>30 oct. 2026</b>
                  </div>
                </div>
                <button className="outline-btn" onClick={exportUgelCsv}>
                  <Download size={14} /> Exportar UGELs
                </button>
              </div>
            </div>

            {/* Selector rápido de hito */}
            <div className="report-toolbar">
              <label>
                <span>Hito en consulta</span>
                <select value={selectedHitoId} onChange={(e) => setSelectedHitoId(e.target.value)}>
                  {milestones.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.id} · {m.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>Ámbito de reporte</span>
                <select defaultValue="Junín">
                  <option>Región Junín (13 UGEL)</option>
                  <option>Filtrar por sede provincial</option>
                </select>
              </label>
              <div className="updated">
                <CalendarDays size={18} />
                <div>
                  <small>CORTE TERRITORIAL</small>
                  <b>26 oct. 2026 · 17:30</b>
                </div>
              </div>
            </div>

            {/* Secuencia del proceso (Steps del Hito) */}
            <section className="box timeline" style={{ marginBottom: '22px' }}>
              <div className="section-head">
                <div>
                  <small style={{ fontSize: '11px', fontWeight: 700, color: '#2563eb', textTransform: 'uppercase' }}>
                    SECUENCIA DEL PROCESO
                  </small>
                  <h2>Ruta de cumplimiento del hito</h2>
                  <p>Selecciona una etapa para consultar el cumplimiento y las evidencias de las UGEL.</p>
                </div>
              </div>

              <div className="steps">
                {stepsHito16.map((s, i) => (
                  <button
                    key={s.name}
                    onClick={() => setStage(i)}
                    className={`step ${s.s} ${stage === i ? 'chosen' : ''}`}
                  >
                    <div className="step-top">
                      <span className="step-num">{s.s === 'done' ? <Check size={14} /> : i + 1}</span>
                      <small>ETAPA {String(i + 1).padStart(2, '0')}</small>
                    </div>
                    <h3>{s.name}</h3>
                    <p><CalendarDays size={12} /> {s.dates}</p>
                    <div className="progress-track" style={{ marginTop: 'auto' }}>
                      <i style={{ width: `${s.p}%` }} />
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
            <section className="box ugel-strip" style={{ marginBottom: '22px' }}>
              <div className="strip-head">
                <div>
                  <h2>Cumplimiento en las 13 UGEL de Junín</h2>
                  <p>Etapa actual: <b>{activeStep.name}</b> ({activeStep.dates})</p>
                </div>
                <div className="table-search">
                  <Search size={14} />
                  <input
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
                    <div className="progress-track" style={{ height: '4px', margin: '4px 0' }}>
                      <i style={{ width: `${u.p}%` }} className={u.s === 'done' ? 'green' : u.s === 'work' ? 'amber' : 'slate'} />
                    </div>
                    <small>{u.s === 'done' ? 'Cumple' : u.s === 'work' ? 'En proceso' : 'Sin registro'}</small>
                  </article>
                ))}
              </div>
            </section>

            {/* Gráficos de evolución del hito */}
            <div className="charts">
              <section className="panel">
                <div className="panel-head">
                  <h2>Resumen de la etapa {stage + 1}</h2>
                  <p>Estado de atención de las 13 UGEL.</p>
                </div>
                <div className="donut-row">
                  <div className="donut" style={{ background: `conic-gradient(#10b981 0 ${(doneUgels / 13) * 100}%, #f59e0b ${(doneUgels / 13) * 100}% ${((doneUgels + workUgels) / 13) * 100}%, #ef4444 ${((doneUgels + workUgels) / 13) * 100}% 100%)` }}>
                    <div>
                      <b>13</b>
                      <small>UGEL</small>
                    </div>
                  </div>
                  <div className="donut-legend">
                    <div className="legend-row">
                      <span className="legend-dot green" />
                      <span>Cumplieron</span>
                      <b>{doneUgels}</b>
                    </div>
                    <div className="legend-row">
                      <span className="legend-dot amber" />
                      <span>En proceso</span>
                      <b>{workUgels}</b>
                    </div>
                    <div className="legend-row">
                      <span className="legend-dot red" />
                      <span>Sin registro</span>
                      <b>{noneUgels}</b>
                    </div>
                  </div>
                </div>
              </section>

              <section className="panel" style={{ gridColumn: 'span 2' }}>
                <div className="panel-head">
                  <h2>Histórico de avance por etapa del hito</h2>
                  <p>Evolución temporal del registro en MC SIGA.</p>
                </div>
                <div className="line-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyHito} margin={{ top: 14, right: 12, bottom: 0, left: -18 }}>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 4" vertical={false} />
                      <XAxis dataKey="d" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip formatter={(v) => `${v}%`} />
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
      </div>

      {toast && (
        <div className="toast" style={{ position: 'fixed', bottom: '24px', right: '24px', background: '#0f172a', color: '#ffffff', padding: '12px 18px', borderRadius: '8px', zIndex: 1000, display: 'flex', alignItems: 'center', gap: '8px', boxShadow: '0 4px 14px rgba(0,0,0,0.2)' }}>
          <Check size={16} className="text-green-400" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}
