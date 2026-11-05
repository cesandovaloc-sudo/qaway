// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import '../cronograma-gantt/gantt.css';
import './hitos.css';
import { DRE_JUNIN_DOTACION_2027_EDT } from '../cronograma-gantt/edtPmbokModel';
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
  Layers,
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

export interface ComponenteWbs {
  id: string;
  code: string;
  title: string;
  subproceso: string;
  subcomponentsCount: number;
  phase: string;
  startDate: string;
  dueDate: string;
  deliverable: string;
  conformityRequired: boolean;
  status: 'cumple' | 'proceso' | 'riesgo' | 'programado';
  progress: number;
  totalUgels: number;
  completedUgels: number;
  subcomponents: Array<{ id: string; code: string; name: string; progress: number; status: string; end: string }>;
}

const formatDatePE = (d?: string) => {
  if (!d) return 'Por definir';
  const parts = d.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return d;
};

const getLiveWbsComponents = (): ComponenteWbs[] => {
  try {
    let items: any[] = [];
    const rawGantt = localStorage.getItem('qaway-gantt-items-p1');
    if (rawGantt) {
      try {
        const parsed = JSON.parse(rawGantt);
        if (Array.isArray(parsed) && parsed.length > 0) items = parsed;
      } catch {}
    }

    if (items.length === 0) {
      items = DRE_JUNIN_DOTACION_2027_EDT.map((r) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        kind: r.kind,
        parentId: r.parentId,
        start: r.start,
        end: r.end,
        progress: r.progress,
        status: r.status,
        deliverable: r.deliverable,
        phase: r.phase,
      }));
    }

    // Identificar los 11 Componentes principales (WBS Nivel 1)
    const rootComponents = items.filter(
      (it: any) => !it.parentId || it.id.startsWith('comp-') || it.id.startsWith('c-') || it.kind === 'hito'
    );

    return rootComponents.map((c: any, idx: number) => {
      const children = items.filter((sub: any) => sub.parentId === c.id);
      const subCount = children.length;

      let st: 'cumple' | 'proceso' | 'riesgo' | 'programado' = 'programado';
      if (c.progress >= 100 || c.status === 'Cumple' || c.status === 'Completado') {
        st = 'cumple';
      } else if (c.status === 'Con retraso' || (c.deviation !== undefined && c.deviation < 0)) {
        st = 'riesgo';
      } else if (c.progress > 0 || c.status === 'En curso' || c.status === 'En proceso') {
        st = 'proceso';
      }

      return {
        id: c.id,
        code: c.code ? (c.code.endsWith('.') ? c.code : `${c.code}.`) : `C${idx + 1}.`,
        title: c.name,
        subproceso: subCount > 0 ? `${subCount} subcomponentes vinculados` : 'Control territorial directo',
        subcomponentsCount: subCount,
        phase: c.phase || (idx < 2 ? 'Fase 1 · Planificación' : idx < 7 ? 'Fase 2 · Preparación y Ejecución' : 'Fase 3 · Cierre y Rendición'),
        startDate: formatDatePE(c.start),
        dueDate: formatDatePE(c.end),
        deliverable: c.deliverable || `Informe de cumplimiento, acta de validación y sustento del Componente ${c.code || idx + 1}`,
        conformityRequired: true,
        status: st,
        progress: typeof c.progress === 'number' ? c.progress : 0,
        totalUgels: 220,
        completedUgels: Math.round(220 * ((c.progress || 0) / 100)),
        subcomponents: children.map((sub: any) => ({
          id: sub.id,
          code: sub.code,
          name: sub.name,
          progress: sub.progress || 0,
          status: sub.status || 'Pendiente',
          end: formatDatePE(sub.end),
        })),
      };
    });
  } catch {
    return [];
  }
};

const getLiveTasksForComponent = (component: ComponenteWbs): OperationalTask[] => {
  try {
    const raw = JSON.parse(localStorage.getItem('qaway-tasks-v1') || '[]');
    if (!Array.isArray(raw)) return [];

    const cleanTitle = component.title.toLowerCase();
    const cleanCode = component.code.toLowerCase().replace('.', '');

    return raw
      .filter((t: any) => {
        if (!t.milestone) return false;
        const m = t.milestone.toLowerCase();
        return (
          m === cleanTitle ||
          m.includes(cleanTitle.slice(0, 14)) ||
          m.startsWith(cleanCode) ||
          t.componentId === component.id
        );
      })
      .map((t: any) => ({
        id: `TSK-${String(t.id).padStart(3, '0')}`,
        title: t.title,
        hitoId: component.id,
        gestor: t.owner || 'Gestor Territorial',
        phone: '+51987654321',
        email: 'gestor@qaway.pe',
        ugel: t.deliverable ? `Entregable: ${t.deliverable.slice(0, 32)}` : 'Sede Regional Junín',
        dueDate: t.due ? formatDatePE(t.due) : '30/11/2026',
        status: (t.status === 'Cumple' || t.status === 'Completado' ? 'done' : t.status === 'En proceso' ? 'in_progress' : 'todo') as any,
        priority: (t.priority === 'Alta' ? 'ALTA' : t.priority === 'Baja' ? 'MEDIA' : 'ALTA') as any,
        isBlocked: t.status === 'Bloqueada',
        blockReason: t.blockedReason,
      }));
  } catch {
    return [];
  }
};

export default function HitosView({ onActions }: { onActions?: (h: any) => void }) {
  const [componentes, setComponentes] = useState<ComponenteWbs[]>(getLiveWbsComponents);
  const [tasksNonce, setTasksNonce] = useState(0);

  // Escucha activa de sincronización con Cronograma y Tareas
  useEffect(() => {
    const reload = () => {
      setComponentes(getLiveWbsComponents());
      setTasksNonce((n) => n + 1);
    };
    window.addEventListener('qaway-gantt-items-updated', reload);
    window.addEventListener('qaway-tasks-updated', reload);
    window.addEventListener('storage', reload);
    return () => {
      window.removeEventListener('qaway-gantt-items-updated', reload);
      window.removeEventListener('qaway-tasks-updated', reload);
      window.removeEventListener('storage', reload);
    };
  }, []);

  const [search, setSearch] = useState('');
  const [selectedTab, setSelectedTab] = useState<string>('todos');
  const [filterStatus, setFilterStatus] = useState<string>('todos');
  const [filterConformity, setFilterConformity] = useState<string>('todas');
  const [viewMode, setViewMode] = useState<'Matriz' | 'Lista'>('Matriz');
  const [openDropdown, setOpenDropdown] = useState<'status' | 'conformity' | null>(null);

  const [openHitos, setOpenHitos] = useState<Record<string, boolean>>({
    'comp-1': true,
    'comp-2': true,
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
    const total = componentes.length;
    const cumplidos = componentes.filter((h) => h.status === 'cumple').length;
    const riesgo = componentes.filter((h) => h.status === 'riesgo').length;
    const proceso = componentes.filter((h) => h.status === 'proceso').length;
    const programado = componentes.filter((h) => h.status === 'programado').length;
    return { total, cumplidos, riesgo, proceso, programado };
  }, [componentes]);

  const tabPills = [
    { id: 'todos', label: 'Todos los componentes', count: kpis.total },
    { id: 'cumple', label: 'Cumplidos', count: kpis.cumplidos },
    { id: 'proceso', label: 'En proceso', count: kpis.proceso },
    { id: 'riesgo', label: 'En riesgo', count: kpis.riesgo },
    { id: 'programado', label: 'Programados', count: kpis.programado },
  ];

  const filteredHitos = useMemo(() => {
    return componentes.filter((h) => {
      const matchSearch =
        h.title.toLowerCase().includes(search.toLowerCase()) ||
        h.code.toLowerCase().includes(search.toLowerCase()) ||
        h.phase.toLowerCase().includes(search.toLowerCase()) ||
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
  }, [componentes, search, selectedTab, filterStatus, filterConformity]);

  const hasActiveFilters =
    search !== '' ||
    filterStatus !== 'todos' ||
    filterConformity !== 'todas';

  const clearAllFilters = () => {
    setSearch('');
    setFilterStatus('todos');
    setFilterConformity('todas');
  };

  const getHitoTasks = (hito: ComponenteWbs) => {
    return getLiveTasksForComponent(hito);
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
              <h1>Componentes del Proyecto y Estructura WBS</h1>
              <p>
                Monitoreo de los 11 componentes rectores, fases de ejecución y paquetes de trabajo vinculados.
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
              <strong>Componentes WBS</strong>
              <small>matriz viva de cumplimiento</small>
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
                const tasks = getHitoTasks(hito);

                return (
                  <div key={hito.id} className={`hit-card ${isOpen ? 'open' : ''}`}>
                    <div className="hit-row-head" onClick={() => toggleHito(hito.id)}>
                      <div className="hit-code-badge">{hito.code}</div>
                      <div className="hit-info-main">
                        <div className="hit-info-top">
                          <span className="hit-name">{hito.title}</span>
                          <span className="hit-subproc">{hito.phase} · {hito.subproceso}</span>
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

                        {/* Subcomponentes de la Estructura WBS */}
                        {hito.subcomponents && hito.subcomponents.length > 0 && (
                          <div style={{ marginBottom: '18px' }}>
                            <div className="hit-tasks-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px', fontSize: '12px', fontWeight: 650, color: '#334155' }}>
                              <Layers size={15} color="#0066ff" />
                              <span>Subcomponentes y Paquetes de Trabajo ({hito.subcomponents.length})</span>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '8px' }}>
                              {hito.subcomponents.map((sub) => (
                                <div key={sub.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px', padding: '9px 11px', fontSize: '11.5px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                                    <b style={{ color: '#0f172a' }}>{sub.code}</b>
                                    <span style={{ fontSize: '10.5px', color: '#64748b' }}>{sub.end}</span>
                                  </div>
                                  <div style={{ color: '#334155', lineHeight: 1.3, marginBottom: '6px' }}>{sub.name}</div>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <div style={{ flex: 1, height: '4px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                                      <div style={{ width: `${sub.progress}%`, height: '100%', background: '#0066ff' }} />
                                    </div>
                                    <span style={{ fontSize: '10.5px', fontWeight: 600, color: '#0066ff' }}>{sub.progress}%</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

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
              Mostrando {filteredHitos.length} de {kpis.total} componentes WBS registrados
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
