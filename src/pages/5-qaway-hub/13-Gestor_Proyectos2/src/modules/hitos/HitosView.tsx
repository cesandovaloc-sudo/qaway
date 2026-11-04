// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import '../cronograma-gantt/gantt.css';
import './hitos.css';
import {
  AlertTriangle,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock3,
  Download,
  FileCheck,
  FileText,
  Filter,
  Flag,
  LayoutGrid,
  List,
  MessageCircle,
  Phone,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X,
  ChartNoAxesColumnIncreasing,
} from 'lucide-react';

interface OperationalTask {
  id: string;
  title: string;
  hitoId: string;
  gestor: string;
  phone: string;
  email: string;
  ugel: string;
  dueDate: string;
  status: 'done' | 'in_progress' | 'todo';
  priority: 'URGENTE' | 'ALTA' | 'MEDIA';
  isBlocked?: boolean;
  blockReason?: string;
}

interface HitoRector {
  id: string;
  code: string;
  title: string;
  subproceso: string;
  dueDate: string;
  deliverable: string;
  conformityRequired: boolean;
  status: 'cumple' | 'proceso' | 'riesgo' | 'programado';
  progress: number;
  totalUgels: number;
  completedUgels: number;
}

const OFFICIAL_HITOS: HitoRector[] = [
  {
    id: 'h1',
    code: 'H1',
    title: 'Comunicación de Directorio de Almacenes',
    subproceso: '2.2',
    dueDate: '11/09/2026',
    deliverable: 'Oficio con directorio, características y responsables de almacenes territoriales',
    conformityRequired: true,
    status: 'cumple',
    progress: 100,
    totalUgels: 220,
    completedUgels: 220,
  },
  {
    id: 'h2',
    code: 'H2',
    title: 'Solicitud de Ajustes de Códigos Modulares en Sistema de Gestión',
    subproceso: '1.5',
    dueDate: '14/09/2026',
    deliverable: 'Oficio de titular regional + Informe técnico + Formato de sustento',
    conformityRequired: true,
    status: 'cumple',
    progress: 100,
    totalUgels: 220,
    completedUgels: 220,
  },
  {
    id: 'h3',
    code: 'H3',
    title: 'Conformación del Comité de Distribución en Sedes Territoriales',
    subproceso: '1.2',
    dueDate: '25/09/2026',
    deliverable: 'Resolución de conformación del comité y designación de punto focal de enlace',
    conformityRequired: true,
    status: 'proceso',
    progress: 84,
    totalUgels: 220,
    completedUgels: 185,
  },
  {
    id: 'h4',
    code: 'H4',
    title: 'Aprobación del Plan de Distribución Local y Monitoreo',
    subproceso: '1.3 - 1.4',
    dueDate: '25/09/2026',
    deliverable: 'Resolución que aprueba el Plan de Distribución Local (cronograma, rutas y contingencias)',
    conformityRequired: true,
    status: 'proceso',
    progress: 78,
    totalUgels: 220,
    completedUgels: 172,
  },
  {
    id: 'h5',
    code: 'H5',
    title: 'Elaboración y Validación del Cuadro de Distribución Territorial (CDT)',
    subproceso: '1.6',
    dueDate: '22/10/2026',
    deliverable: 'Registro y validación completa del CDT en el aplicativo integrado de gestión',
    conformityRequired: true,
    status: 'riesgo',
    progress: 62,
    totalUgels: 220,
    completedUgels: 136,
  },
  {
    id: 'h6',
    code: 'H6',
    title: 'Requerimiento de Personal de Apoyo Operativo Territorial',
    subproceso: '5.1',
    dueDate: '30/10/2026',
    deliverable: 'Oficio de coordinación territorial solicitando ternas acreditadas para apoyo de campo',
    conformityRequired: false,
    status: 'proceso',
    progress: 45,
    totalUgels: 220,
    completedUgels: 99,
  },
  {
    id: 'h7',
    code: 'H7',
    title: 'Culminación de Actuaciones Preparatorias para Transporte',
    subproceso: '4.1',
    dueDate: '30/11/2026',
    deliverable: 'Expediente de contratación aprobado y bases técnicas del proceso de transporte',
    conformityRequired: true,
    status: 'programado',
    progress: 30,
    totalUgels: 220,
    completedUgels: 66,
  },
  {
    id: 'h8',
    code: 'H8',
    title: 'Reconocimiento de Personas de Apoyo para Recepción en Campo',
    subproceso: '5.2',
    dueDate: '18/12/2026',
    deliverable: 'Resolución que aprueba padrón formal de apoyo para recepción en puntos de destino',
    conformityRequired: true,
    status: 'programado',
    progress: 0,
    totalUgels: 220,
    completedUgels: 0,
  },
  {
    id: 'h9',
    code: 'H9',
    title: 'Adjudicación y Contrato del Servicio de Distribución y Transporte',
    subproceso: '4.2 - 4.3',
    dueDate: '05/02/2027',
    deliverable: 'Contrato suscrito de servicio de transporte territorial registrado en plataforma',
    conformityRequired: true,
    status: 'programado',
    progress: 0,
    totalUgels: 220,
    completedUgels: 0,
  },
  {
    id: 'h10',
    code: 'H10',
    title: 'Registro de Asignación y Recepción en Módulo de Control de Entregas',
    subproceso: '9.2 - 9.4',
    dueDate: '30/04/2027',
    deliverable: '100% de actas formales de entrega registradas en la plataforma de control',
    conformityRequired: true,
    status: 'programado',
    progress: 0,
    totalUgels: 220,
    completedUgels: 0,
  },
];

const OPERATIONAL_TASKS: OperationalTask[] = [
  {
    id: 'TSK-M01',
    title: 'Consolidar padrón de miembros del comité territorial Huancavelica vía matriz',
    hitoId: 'h3',
    gestor: 'Carlos Mendoza (Coordinador Sierra Centro)',
    phone: '+51987654321',
    email: 'cmendoza@gestor.pe',
    ugel: 'Sede Huancavelica',
    dueDate: '20/09/2026',
    status: 'in_progress',
    priority: 'ALTA',
  },
  {
    id: 'TSK-M02',
    title: 'Emitir alerta preventiva por retraso en resolución de comité en Sede Maynas',
    hitoId: 'h3',
    gestor: 'Lucía Ramos (Coordinadora Selva)',
    phone: '+51976543210',
    email: 'lramos@gestor.pe',
    ugel: 'Sede Maynas',
    dueDate: '22/09/2026',
    status: 'todo',
    priority: 'URGENTE',
    isBlocked: true,
    blockReason: 'Dificultad de enlace en zona ribereña',
  },
  {
    id: 'TSK-M03',
    title: 'Validar consistencia de códigos modulares de Sede 03 Centro',
    hitoId: 'h2',
    gestor: 'Roberto Farfán (Especialista Técnico)',
    phone: '+51965432109',
    email: 'rfarfan@gestor.pe',
    ugel: 'Sede 03 Metropolitana',
    dueDate: '12/09/2026',
    status: 'done',
    priority: 'MEDIA',
  },
  {
    id: 'TSK-M04',
    title: 'Asistencia técnica virtual a responsables sobre plataforma operativa',
    hitoId: 'h5',
    gestor: 'Ana Paola Quispe (Especialista Territorial)',
    phone: '+51954321098',
    email: 'aquispe@gestor.pe',
    ugel: 'Sede Cusco Sur',
    dueDate: '15/10/2026',
    status: 'in_progress',
    priority: 'ALTA',
  },
  {
    id: 'TSK-M05',
    title: 'Revisar Términos de Referencia de transporte para ruta fluvial Condorcanqui',
    hitoId: 'h7',
    gestor: 'Javier Ruiz (Especialista en Contrataciones)',
    phone: '+51943210987',
    email: 'jruiz@gestor.pe',
    ugel: 'Sede Condorcanqui',
    dueDate: '20/11/2026',
    status: 'todo',
    priority: 'URGENTE',
  },
  {
    id: 'TSK-M06',
    title: 'Comprobar recepción de directorio de almacén Satipo con personal acreditado',
    hitoId: 'h1',
    gestor: 'Carlos Mendoza (Coordinador Sierra Centro)',
    phone: '+51987654321',
    email: 'cmendoza@gestor.pe',
    ugel: 'Sede Satipo',
    dueDate: '10/09/2026',
    status: 'done',
    priority: 'MEDIA',
  },
  {
    id: 'TSK-M07',
    title: 'Revisión y visado del plan de contingencia de transporte fluvial Sede Nauta',
    hitoId: 'h4',
    gestor: 'Lucía Ramos (Coordinadora Selva)',
    phone: '+51976543210',
    email: 'lramos@gestor.pe',
    ugel: 'Sede Nauta',
    dueDate: '24/09/2026',
    status: 'in_progress',
    priority: 'ALTA',
  },
];

export default function HitosView({ onActions }: { onActions?: (h: any) => void }) {
  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterConformity, setFilterConformity] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'Matriz' | 'Lista'>('Matriz');
  const [openDropdown, setOpenDropdown] = useState<'status' | 'conformity' | null>(null);

  const [openHitos, setOpenHitos] = useState<Record<string, boolean>>({
    h3: true,
    h5: true,
  });
  const [notice, setNotice] = useState<string>('');

  const notify = (msg: string) => {
    setNotice(msg);
    setTimeout(() => setNotice(''), 3000);
  };

  useEffect(() => {
    onActions?.({
      notify,
      setView: (v: string) => setSelectedTab(v),
    });
  }, [onActions]);

  // Cerrar desplegables con clic fuera
  useEffect(() => {
    const handleWindowClick = () => setOpenDropdown(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  const toggleHito = (id: string) => {
    setOpenHitos((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const kpis = useMemo(() => {
    const total = OFFICIAL_HITOS.length;
    const cumplidos = OFFICIAL_HITOS.filter((h) => h.status === 'cumple').length;
    const riesgo = OFFICIAL_HITOS.filter((h) => h.status === 'riesgo').length;
    const proceso = OFFICIAL_HITOS.filter((h) => h.status === 'proceso').length;
    const programado = OFFICIAL_HITOS.filter((h) => h.status === 'programado').length;
    return { total, cumplidos, riesgo, proceso, programado };
  }, []);

  const tabPills = [
    { id: 'todos', label: 'Todos los hitos', count: kpis.total },
    { id: 'cumple', label: 'Cumplidos', count: kpis.cumplidos },
    { id: 'proceso', label: 'En proceso', count: kpis.proceso },
    { id: 'riesgo', label: 'En riesgo', count: kpis.riesgo },
    { id: 'programado', label: 'Programados', count: kpis.programado },
  ];

  const filteredHitos = useMemo(() => {
    return OFFICIAL_HITOS.filter((h) => {
      const matchSearch =
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.code.toLowerCase().includes(search.toLowerCase()) ||
        h.subproceso.toLowerCase().includes(search.toLowerCase()) ||
        h.deliverable.toLowerCase().includes(search.toLowerCase());

      const matchTab = selectedTab === 'todos' || h.status === selectedTab;
      const matchStatus = filterStatus === 'todos' || h.status === filterStatus;
      const matchConformity =
        filterConformity === 'todas' ||
        (filterConformity === 'requerida' && h.conformityRequired) ||
        (filterConformity === 'informativa' && !h.conformityRequired);

      return matchSearch && matchTab && matchStatus && matchConformity;
    });
  }, [search, selectedTab, filterStatus, filterConformity]);

  const hasActiveFilters =
    search !== '' ||
    filterStatus !== 'todos' ||
    filterConformity !== 'todas';

  const clearAllFilters = () => {
    setSearch('');
    setFilterStatus('todos');
    setFilterConformity('todas');
  };

  const getHitoTasks = (hitoId: string) => {
    return OPERATIONAL_TASKS.filter((t) => t.hitoId === hitoId);
  };

  const buildWhatsAppLink = (task: OperationalTask) => {
    const cleanPhone = task.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(
      `Estimado ${task.gestor}, recordatorio institucional sobre ${task.ugel}: La tarea "${task.title}" vence el ${task.dueDate}. Favor remitir estado de avance.`
    );
    return `https://wa.me/${cleanPhone}?text=${message}`;
  };

  const exportCSV = () => {
    const headers = ['Código', 'Hito Rector', 'Subproceso', 'Fecha Límite', 'Estado', 'Avance Regional', 'Conformidad', 'Entregable Oficial'];
    const rows = filteredHitos.map((h) => [
      `"${h.code}"`,
      `"${h.title}"`,
      `"${h.subproceso}"`,
      `"${h.dueDate}"`,
      `"${h.status}"`,
      `"${h.progress}% (${h.completedUgels}/${h.totalUgels})"`,
      `"${h.conformityRequired ? 'Requerida' : 'No requerida'}"`,
      `"${h.deliverable.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Hitos_Rectores_Dotacion_2027_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    notify('Matriz de Hitos exportada correctamente en formato CSV');
  };

  const getStatusBadge = (status: string, progress: number) => {
    switch (status) {
      case 'cumple':
        return <span className="status-pill badge-complete">✓ Cumple (100%)</span>;
      case 'riesgo':
        return <span className="status-pill badge-late">⚠ En riesgo ({progress}%)</span>;
      case 'proceso':
        return <span className="status-pill badge-progress">● En proceso ({progress}%)</span>;
      default:
        return <span className="status-pill badge-pending">○ Programado</span>;
    }
  };

  const getFillColor = (status: string) => {
    if (status === 'cumple') return '#16a34a';
    if (status === 'riesgo') return '#dc2626';
    if (status === 'proceso') return '#2563eb';
    return '#94a3b8';
  };

  return (
    <div className="gantt-v2">
      <div className="app">
        {/* Cabecera Principal Oficial (Idéntica a Cronograma) */}
        <header className="header">
          <div className="heading">
            <span className="heading-icon">
              <Flag size={26} />
            </span>
            <div>
              <span className="super">MONITOREO DE CUMPLIMIENTO REGIONAL · DOTACIÓN 2027</span>
              <h1>Hitos Rectores y Matriz Contractual</h1>
              <p>
                Monitoreo de cumplimiento por hito normativo, validación documental y tareas operativas territoriales.
              </p>
            </div>
          </div>
          <div className="head-actions">
            <button
              type="button"
              className="btn secondary"
              onClick={exportCSV}
              title="Descargar matriz en CSV institucional"
            >
              <Download size={15} />
              <span>Exportar Matriz</span>
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={() => notify('Sincronización con el sistema completada')}
              title="Actualizar estado y sincronizar"
            >
              <RefreshCw size={15} />
              <span>Actualizar Estado</span>
            </button>
          </div>
        </header>

        {/* Tarjetas Métricas Directivas (Idénticas a Cronograma) */}
        <section className="metrics">
          <article
            className="metric blue"
            onClick={() => {
              setSelectedTab('todos');
              setFilterStatus('todos');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <Flag size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(kpis.total).padStart(2, '0')}</b>
              <strong>Hitos Rectores</strong>
              <small>matriz de cumplimiento activa</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric green"
            onClick={() => {
              setSelectedTab('cumple');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <CheckCircle2 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(kpis.cumplidos).padStart(2, '0')}</b>
              <strong>Conformidad 100%</strong>
              <small>hitos culminados formalmente</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric amber"
            onClick={() => {
              setSelectedTab('proceso');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <AlertTriangle size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(kpis.riesgo + kpis.proceso).padStart(2, '0')}</b>
              <strong>En Curso y Alerta</strong>
              <small>seguimiento activo en campo</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric red"
            onClick={() => {
              setSelectedTab('programado');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <Clock3 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(kpis.programado).padStart(2, '0')}</b>
              <strong>Hitos Programados</strong>
              <small>planificación 2026-2027</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>
        </section>

        {/* =========================================================================
            LA CÁPSULA WORKSPACE CENTRAL (Idéntica a Cronograma, Sedes, Tareas y Equipo)
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

            {/* Switcher de Modos (Matriz / Lista) */}
            <div className="view-mode-switcher" role="tablist">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'Matriz' ? 'active' : ''}`}
                onClick={() => setViewMode('Matriz')}
                title="Vista Matriz de Acordeón con Tareas"
              >
                <LayoutGrid size={14} />
                <span>Matriz</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'Lista' ? 'active' : ''}`}
                onClick={() => setViewMode('Lista')}
                title="Vista Lista Tabular"
              >
                <List size={14} />
                <span>Lista</span>
              </button>
            </div>
          </nav>

          {/* Barra de Filtros Nativa estilo Cronograma */}
          <div className="filters">
            <label className="search">
              <Search size={16} />
              <input
                placeholder="Buscar por nombre, código de hito (ej. H3) o subproceso..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Filtro Estado */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'status' ? 'active' : ''} ${
                  filterStatus !== 'todos' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'status' ? null : 'status');
                }}
                title="Filtrar por estado del hito"
              >
                <div className="filter-card-copy">
                  <small>Estado</small>
                  <span>
                    {filterStatus === 'todos'
                      ? 'Todos los estados'
                      : filterStatus === 'cumple'
                      ? 'Cumplidos'
                      : filterStatus === 'proceso'
                      ? 'En proceso'
                      : filterStatus === 'riesgo'
                      ? 'En riesgo'
                      : 'Programados'}
                  </span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'status' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
                  <div className="filter-popover-title">Filtrar por Estado</div>
                  <div className="filter-popover-list">
                    {[
                      { id: 'todos', label: 'Todos los estados' },
                      { id: 'cumple', label: 'Cumplidos (100%)' },
                      { id: 'proceso', label: 'En proceso' },
                      { id: 'riesgo', label: 'En riesgo' },
                      { id: 'programado', label: 'Programados' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        className={`filter-item-btn ${filterStatus === st.id ? 'selected' : ''}`}
                        onClick={() => {
                          setFilterStatus(st.id);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{st.label}</span>
                        {filterStatus === st.id && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Conformidad */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'conformity' ? 'active' : ''} ${
                  filterConformity !== 'todas' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'conformity' ? null : 'conformity');
                }}
                title="Filtrar por requerimiento de conformidad"
              >
                <div className="filter-card-copy">
                  <small>Conformidad</small>
                  <span>
                    {filterConformity === 'todas'
                      ? 'Todas'
                      : filterConformity === 'requerida'
                      ? 'Requerida'
                      : 'Informativa'}
                  </span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'conformity' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 210 }}>
                  <div className="filter-popover-title">Filtrar por Conformidad</div>
                  <div className="filter-popover-list">
                    {[
                      { id: 'todas', label: 'Todas las conformidades' },
                      { id: 'requerida', label: 'Conformidad Requerida' },
                      { id: 'informativa', label: 'Solo Informativos' },
                    ].map((cf) => (
                      <button
                        key={cf.id}
                        type="button"
                        className={`filter-item-btn ${filterConformity === cf.id ? 'selected' : ''}`}
                        onClick={() => {
                          setFilterConformity(cf.id);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{cf.label}</span>
                        {filterConformity === cf.id && <Check size={14} className="item-check" />}
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

          {/* Vistas: Matriz (Acordeón) o Lista Tabular */}
          {viewMode === 'Matriz' ? (
            <div className="hit-list" style={{ padding: '8px 0 24px' }}>
              {filteredHitos.map((hito) => {
                const isOpen = !!openHitos[hito.id];
                const tasks = getHitoTasks(hito.id);

                return (
                  <div key={hito.id} className={`hit-card ${isOpen ? 'open' : ''}`}>
                    <div className="hit-row-head" onClick={() => toggleHito(hito.id)}>
                      <div className="hit-code-badge">{hito.code}</div>
                      <div className="hit-info-main">
                        <div className="hit-info-top">
                          <span className="hit-name">{hito.title}</span>
                          <span className="hit-subproc">Subproceso {hito.subproceso}</span>
                          {hito.conformityRequired ? (
                            <span className="hit-conformity-tag">
                              <ShieldCheck size={12} /> Conformidad Requerida
                            </span>
                          ) : (
                            <span className="hit-conformity-tag no-req">Informativo</span>
                          )}
                        </div>
                      </div>

                      <div className="hit-due-box">
                        <Calendar size={15} />
                        <span>Límite: {hito.dueDate}</span>
                      </div>

                      <div className="hit-progress-box">
                        <div className="hit-progress-labels">
                          <span>Avance Territorial</span>
                          <span>{hito.completedUgels}/{hito.totalUgels} Puntos</span>
                        </div>
                        <div className="hit-progress-track">
                          <div
                            className="hit-progress-fill"
                            style={{
                              width: `${hito.progress}%`,
                              backgroundColor: getFillColor(hito.status),
                            }}
                          />
                        </div>
                      </div>

                      <div>{getStatusBadge(hito.status, hito.progress)}</div>

                      <ChevronDown size={19} className={`hit-chevron ${isOpen ? 'open' : ''}`} />
                    </div>

                    {isOpen && (
                      <div className="hit-body">
                        {/* Entregable Oficial */}
                        <div className="hit-deliverable-box">
                          <div className="hit-deliverable-title">
                            <FileText size={14} />
                            Entregable Oficial y Sustento Normativo Requerido
                          </div>
                          <p className="hit-deliverable-text">{hito.deliverable}</p>
                        </div>

                        {/* Tareas Operativas del Hito */}
                        <div className="hit-tasks-header">
                          <div className="hit-tasks-title">
                            <Users size={16} />
                            <span>Tareas Operativas y Seguimiento de Gestores</span>
                            <span className="hit-tasks-count">{tasks.length} vinculadas</span>
                          </div>
                          <button
                            type="button"
                            className="btn secondary"
                            style={{ height: '30px', padding: '0 12px', fontSize: '12px' }}
                            onClick={() => notify(`Añadir tarea vinculada a ${hito.code}`)}
                          >
                            <Plus size={13} />
                            <span>Vincular Tarea</span>
                          </button>
                        </div>

                        {tasks.length > 0 ? (
                          <div className="hit-tasks-grid">
                            {tasks.map((task) => (
                              <div key={task.id} className={`hit-task-card ${task.isBlocked ? 'blocked' : ''}`}>
                                <div className="hit-task-top">
                                  <span className="hit-task-id">{task.id}</span>
                                  <span className={`hit-priority-tag ${task.priority}`}>{task.priority}</span>
                                </div>

                                <div className="hit-task-title">{task.title}</div>

                                {task.isBlocked && (
                                  <div className="hit-task-blocked-msg">
                                    <ShieldAlert size={14} />
                                    <span>Alerta: {task.blockReason}</span>
                                  </div>
                                )}

                                <div className="hit-task-meta">
                                  <div className="hit-task-meta-row">
                                    <strong>Ámbito Territorial:</strong>
                                    <span>{task.ugel}</span>
                                  </div>
                                  <div className="hit-task-meta-row">
                                    <strong>Gestor Asignado:</strong>
                                    <span>{task.gestor}</span>
                                  </div>
                                  <div className="hit-task-meta-row">
                                    <strong>Fecha Límite:</strong>
                                    <span>{task.dueDate}</span>
                                  </div>
                                </div>

                                <div className="hit-task-actions">
                                  <span
                                    style={{
                                      fontSize: '12px',
                                      fontWeight: '600',
                                      color:
                                        task.status === 'done'
                                          ? '#16a34a'
                                          : task.status === 'in_progress'
                                          ? '#0284c7'
                                          : '#e11d48',
                                    }}
                                  >
                                    {task.status === 'done'
                                      ? '✓ Completada'
                                      : task.status === 'in_progress'
                                      ? '● En progreso'
                                      : '○ Pendiente'}
                                  </span>

                                  <a
                                    href={buildWhatsAppLink(task)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="hit-wa-btn"
                                    title="Enviar recordatorio inteligente por WhatsApp"
                                  >
                                    <MessageCircle size={14} />
                                    <span>WhatsApp 1-Clic</span>
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="hit-empty-tasks">
                            No hay tareas operativas en curso vinculadas directamente a este hito rector.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div
              className="cronograma-lista-table-wrap"
              style={{
                overflowX: 'auto',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                margin: '8px 0 20px',
              }}
            >
              <table className="cronograma-lista-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 16px', width: '90px' }}>Código</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Hito Rector</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', width: '110px' }}>Subproceso</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px', width: '120px' }}>Límite</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', minWidth: '160px' }}>Avance Regional</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', width: '130px' }}>Conformidad</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', width: '140px' }}>Estado</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px', width: '100px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHitos.map((h) => (
                    <tr key={h.id}>
                      <td style={{ padding: '12px 16px', fontWeight: 800, color: '#0f172a' }}>
                        <span className="hit-code-badge" style={{ padding: '4px 8px', fontSize: '11px' }}>
                          {h.code}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', fontWeight: 650, color: '#0f172a' }}>
                        <div>{h.title}</div>
                        <small style={{ color: '#64748b', fontSize: '11.5px', fontWeight: 400 }}>
                          {h.deliverable}
                        </small>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', color: '#475569', fontSize: '12.5px' }}>
                        <span className="hit-subproc">{h.subproceso}</span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155', fontSize: '13px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                          <Calendar size={13} color="#94a3b8" /> {h.dueDate}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                          <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${h.progress}%`,
                                height: '100%',
                                backgroundColor: getFillColor(h.status),
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{h.progress}%</span>
                        </div>
                        <small style={{ display: 'block', fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                          {h.completedUgels} / {h.totalUgels} puntos
                        </small>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {h.conformityRequired ? (
                          <span className="hit-conformity-tag">
                            <ShieldCheck size={12} /> Requerida
                          </span>
                        ) : (
                          <span className="hit-conformity-tag no-req">Informativo</span>
                        )}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        {getStatusBadge(h.status, h.progress)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ height: '30px', padding: '0 10px', fontSize: '12px' }}
                          onClick={() => {
                            setViewMode('Matriz');
                            setOpenHitos((prev) => ({ ...prev, [h.id]: true }));
                          }}
                          title="Ver detalle y microtareas del hito"
                        >
                          Ver
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pie de página canónico */}
          <footer className="footer">
            <span>
              Mostrando {filteredHitos.length} de {kpis.total} hitos rectores registrados
            </span>
          </footer>
        </main>

        {notice && (
          <div className="hit-toast">
            <CheckCircle2 size={18} color="#4ade80" />
            <span>{notice}</span>
          </div>
        )}
      </div>
    </div>
  );
}
