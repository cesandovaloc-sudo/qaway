// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import '../cronograma-gantt/gantt.css';
import './resumen.css';
import { useTableEngine, ColumnHeader, TableEngineStatus, type ColumnDef } from '../../shared/table-engine';
import PanelCicloVidaProyecto from '../../components/PanelCicloVidaProyecto';
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  Bell,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  FileText,
  Filter,
  LayoutGrid,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
  ChartNoAxesColumnIncreasing,
  Clock3,
} from 'lucide-react';

/** Forma de una fila del resumen. La maqueta se conserva; las filas llegan
 *  del tenant activo y arrancan vacías para un proyecto nuevo. */
type ResumenRow = {
  nombre: string;
  estado: string;
  avance: number;
  fase1: boolean;
  fase2: boolean;
  dei: boolean;
  hito: string;
  fecha: string;
};

const RESUMEN_ROWS: ResumenRow[] = [];

const PHASES = [
  { nombre: 'Fase 1 — Planificación y CDT', avance: 0, inicio: 3, fin: 34, estado: 'green' },
  { nombre: 'Fase 2 — Registro en Plataforma (RAR / NEA)', avance: 0, inicio: 17, fin: 47, estado: 'amber' },
  { nombre: 'Fase 3 — Validación DEI Nivel Inicial', avance: 0, inicio: 34, fin: 66, estado: 'red' },
];

const RESUMEN_ESTADOS = [
  { value: 'proceso', label: 'En proceso' },
  { value: 'incumple', label: 'No cumple' },
  { value: 'cumple', label: 'Cumple' },
];

const RESUMEN_COLUMNS: ColumnDef<ResumenRow>[] = [
  { id: 'nombre', label: 'Sede Territorial', type: 'select', accessor: (r) => r.nombre },
  { id: 'estado', label: 'Estado', type: 'processState', accessor: (r) => r.estado, options: RESUMEN_ESTADOS },
  { id: 'avance', label: 'Avance Físico', type: 'percent', accessor: (r) => r.avance },
  { id: 'hito', label: 'Próximo Hito Crítico', type: 'text', accessor: (r) => r.hito },
];

export default function ResumenProyectoView({
  onActions,
  userRole = 'gestor',
  canCreateProject,
  sesionReal = false,
  onOpenCreateProject,
  proyecto,
  onEstadoCambiado,
}: {
  onActions?: (h: any) => void;
  userRole?: 'gestor' | 'coordinador';
  /** 6-D: capacidad real de UI o fallback demo. */
  canCreateProject?: boolean;
  /** 6-D: true si la perspectiva viene de sesión real del Hub. */
  sesionReal?: boolean;
  onOpenCreateProject?: () => void;
  /** Etapa 6.3: proyecto activo (para el chip de estado y el menú de dirección). */
  proyecto?: {
    id: string;
    name?: string;
    code?: string;
    region?: string;
    estadoCodigo?: string | null | undefined;
    tipoProyectoCodigo?: string | null | undefined;
  } | undefined;
  /** Tras una transición exitosa (persistida en Supabase por la RPC atómica). */
  onEstadoCambiado?: (proyectoId: string, estadoNuevo: string) => void;
}) {
  const puedeCrearProyecto = canCreateProject ?? userRole === 'coordinador';
  const mostrarBannerDemoCoordinador = !sesionReal && userRole === 'coordinador';
  const engine = useTableEngine<ResumenRow>({ tableId: 'resumen-ugel', columns: RESUMEN_COLUMNS, rows: RESUMEN_ROWS });

  const [selectedTab, setSelectedTab] = useState<string>('Todas');
  const [viewMode, setViewMode] = useState<'semaforo' | 'fases'>('semaforo');

  // Datos en vivo del cronograma maestro, SIEMPRE del proyecto del tenant.
  // Sin proyecto activo no se lee ninguna clave: la maqueta se muestra vacía.
  const proyectoId = proyecto?.id;
  const [ganttItems, setGanttItems] = useState<any[]>([]);

  useEffect(() => {
    setGanttItems([]);
    if (!proyectoId) return;
    const read = () => {
      try {
        const raw =
          localStorage.getItem(`qaway-gantt-items-${proyectoId}-maestro`) ||
          localStorage.getItem(`qaway-gantt-items-${proyectoId}`);
        const parsed = raw ? JSON.parse(raw) : [];
        setGanttItems(Array.isArray(parsed) ? parsed : []);
      } catch {
        setGanttItems([]);
      }
    };
    read();
    window.addEventListener('qaway-gantt-items-updated', read);
    window.addEventListener('storage', read);
    return () => {
      window.removeEventListener('qaway-gantt-items-updated', read);
      window.removeEventListener('storage', read);
    };
  }, [proyectoId]);

  const liveHitos = useMemo(() => {
    if (ganttItems.length === 0) return [];
    const candidates = ganttItems
      .filter((it) => it.kind === 'subproceso' || it.kind === 'hito')
      .sort((a, b) => (a.end || '').localeCompare(b.end || ''));

    const priorityItems = [
      ...candidates.filter((it) => it.status === 'Con retraso'),
      ...candidates.filter((it) => it.status === 'En curso' || it.status === 'En proceso'),
      ...candidates.filter((it) => it.status === 'Pendiente'),
    ].slice(0, 4);

    if (priorityItems.length === 0) return [];

    const MONTHS_SHORT = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SET', 'OCT', 'NOV', 'DIC'];

    return priorityItems.map((it) => {
      let dia = '15';
      let mes = 'OCT';
      if (it.end) {
        const parts = it.end.split('-');
        if (parts.length === 3) {
          dia = parts[2];
          const mNum = parseInt(parts[1], 10);
          if (mNum >= 1 && mNum <= 12) mes = MONTHS_SHORT[mNum - 1];
        }
      }

      const tipo = it.status === 'Con retraso' ? 'rojo' : it.progress > 0 ? 'amarillo' : 'gris';
      const estadoLabel =
        it.status === 'Con retraso'
          ? 'Retrasado'
          : it.status === 'En curso' || it.status === 'En proceso'
          ? 'En curso'
          : 'Programado';

      return {
        dia,
        mes,
        titulo: it.name,
        unidad: it.sede || it.region || (it.gestor ? `Gestor: ${it.gestor}` : 'Sede Junín'),
        estado: estadoLabel,
        tipo,
      };
    });
  }, [ganttItems]);

  const livePhases = useMemo(() => {
    if (ganttItems.length === 0) return PHASES;

    const phaseNames = [
      'Fase 1 — Planificación y CDT',
      'Fase 2 — Registro en Plataforma (RAR / NEA)',
      'Fase 3 — Validación DEI Nivel Inicial',
    ];

    return phaseNames.map((pName, idx) => {
      const inPhase = ganttItems.filter((it) => (it.phase || '').toLowerCase().includes(`fase ${idx + 1}`));
      const avg =
        inPhase.length > 0
          ? Math.round(inPhase.reduce((acc, it) => acc + (it.progress || 0), 0) / inPhase.length)
          : 0;

      const st = avg >= 80 ? 'green' : avg >= 40 ? 'amber' : 'red';
      return {
        nombre: pName,
        avance: avg,
        inicio: idx === 0 ? 3 : idx === 1 ? 17 : 34,
        fin: idx === 0 ? 34 : idx === 1 ? 47 : 66,
        estado: st,
      };
    });
  }, [ganttItems]);

  const [fase, setFase] = useState('Todas');
  const [ugel, setUgel] = useState('Todas');
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');
  const [openDropdown, setOpenDropdown] = useState<'fase' | 'estado' | 'sede' | null>(null);

  const [actualizado, setActualizado] = useState('sin fecha de corte');
  const [notice, setNotice] = useState('');

  const notify = (m: string) => {
    setNotice(m);
    setTimeout(() => setNotice(''), 2600);
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

  const total = RESUMEN_ROWS.length;
  const cumple = RESUMEN_ROWS.filter((x) => x.estado === 'cumple').length;
  const proceso = RESUMEN_ROWS.filter((x) => x.estado === 'proceso').length;
  const incumple = RESUMEN_ROWS.filter((x) => x.estado === 'incumple').length;

  const tabPills = [
    { id: 'Todas', label: 'Todas las sedes', count: total },
    { id: 'Cumplen', label: 'Cumplen', count: cumple },
    { id: 'En proceso', label: 'En proceso', count: proceso },
    { id: 'En alerta', label: 'En alerta / No cumplen', count: incumple },
  ];

  const rows = useMemo(() => {
    const base = RESUMEN_ROWS.filter((row) => {
      const matchesUgel = ugel === 'Todas' || row.nombre === ugel;
      const matchesSearch = row.nombre.toLowerCase().includes(busqueda.toLowerCase()) || row.hito.toLowerCase().includes(busqueda.toLowerCase());

      const matchesTab =
        selectedTab === 'Todas' ||
        (selectedTab === 'Cumplen' && row.estado === 'cumple') ||
        (selectedTab === 'En proceso' && row.estado === 'proceso') ||
        (selectedTab === 'En alerta' && row.estado === 'incumple');

      const matchesStatus = filtroEstado === 'todos' || row.estado === filtroEstado;
      const matchesPhase = fase === 'Todas' || (fase === 'Fase 1' ? row.fase1 : fase === 'Fase 2' ? row.fase2 : row.dei);

      return matchesUgel && matchesSearch && matchesTab && matchesStatus && matchesPhase;
    });
    return engine.apply(base);
  }, [ugel, busqueda, selectedTab, filtroEstado, fase, engine.apply]);

  const hasActiveFilters =
    busqueda.trim() !== '' ||
    fase !== 'Todas' ||
    filtroEstado !== 'todos' ||
    ugel !== 'Todas';

  const clearAllFilters = () => {
    setBusqueda('');
    setFase('Todas');
    setFiltroEstado('todos');
    setUgel('Todas');
    engine.clearAllFilters();
  };

  const refresh = () => {
    setActualizado(
      new Date().toLocaleString('es-PE', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    );
    notify('Resumen regional sincronizado con la última fecha de corte');
  };

  return (
    <div className="gantt-v2">
      <div className="app">
        {/* Cabecera Principal Oficial (Idéntica a Cronograma) */}
        <header className="header">
          <div className="heading">
            <span className="heading-icon">
              <Activity size={26} />
            </span>
            <div>
              <span className="super">
                SALA DE SITUACIÓN OPERATIVA{proyecto?.region ? ` · ${proyecto.region.toUpperCase()}` : ''}
              </span>
              <h1>Resumen Ejecutivo del Proyecto</h1>
              <p>
                Monitoreo ejecutivo del avance físico de sedes, semáforo de cumplimiento territorial y control de fases.
              </p>
            </div>
          </div>
          <div className="head-actions">
            {/* Etapa 6.3 · Ciclo de vida del proyecto: chip de estado + menú de
                acciones de dirección (solo roles autorizados — fail-closed).
                El estado vive aquí (ficha), NO en Configuración (solo lectura). */}
            {proyecto && (
              <PanelCicloVidaProyecto
                proyecto={proyecto}
                onEstadoCambiado={onEstadoCambiado}
                notify={notify}
              />
            )}
            <button
              type="button"
              className="btn secondary"
              onClick={refresh}
              title="Sincronizar fecha de corte con el sistema"
            >
              <RefreshCw size={15} />
              <span>Sincronizar ({actualizado})</span>
            </button>
            {puedeCrearProyecto && (
              <button
                type="button"
                className="btn primary"
                onClick={onOpenCreateProject}
                title="Crear un nuevo proyecto regional"
              >
                <Plus size={16} />
                <span>Nuevo Proyecto Regional</span>
              </button>
            )}
          </div>
        </header>

        {/* Banner de Gobernanza Multirregional (demo sin sesión) */}
        {mostrarBannerDemoCoordinador && (
          <div
            style={{
              background: '#0f172a',
              color: '#ffffff',
              borderRadius: '12px',
              padding: '14px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              border: '1px solid #1e293b',
              boxShadow: '0 2px 6px rgba(15, 23, 42, 0.08)',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: 800,
                    letterSpacing: '0.8px',
                    background: '#2563eb',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  VISTA DE COORDINACIÓN GENERAL
                </span>
                <span style={{ fontSize: '12px', color: '#94a3b8' }}>Coordinación General</span>
              </div>
              <p style={{ margin: 0, fontSize: '12.5px', color: '#cbd5e1' }}>
                Como Coordinador General puedes supervisar múltiples regiones y crear proyectos adicionales desde cero.
              </p>
            </div>
            <button
              type="button"
              className="btn primary"
              onClick={onOpenCreateProject}
              style={{ padding: '8px 16px', fontSize: '12.5px' }}
            >
              <Plus size={15} />
              <span>Crear Proyecto</span>
            </button>
          </div>
        )}

        {/* Tarjetas Métricas Directivas (Idénticas a Cronograma) */}
        <section className="metrics">
          <article
            className="metric blue"
            onClick={() => {
              setSelectedTab('Todas');
              setFiltroEstado('todos');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <Building2 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(total).padStart(2, '0')}</b>
              <strong>Sedes Monitoreadas</strong>
              <small>en la región Junín</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric green"
            onClick={() => {
              setSelectedTab('Cumplen');
              setFiltroEstado('cumple');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <Check size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(cumple).padStart(2, '0')}</b>
              <strong>Cumplen ({Math.round((cumple / total) * 100)}%)</strong>
              <small>fases completadas</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric amber"
            onClick={() => {
              setSelectedTab('En proceso');
              setFiltroEstado('proceso');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <AlertTriangle size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(proceso).padStart(2, '0')}</b>
              <strong>En Proceso ({Math.round((proceso / total) * 100)}%)</strong>
              <small>avance activo parcial</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric red"
            onClick={() => {
              setSelectedTab('En alerta');
              setFiltroEstado('incumple');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <AlertTriangle size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(incumple).padStart(2, '0')}</b>
              <strong>En Alerta ({Math.round((incumple / total) * 100)}%)</strong>
              <small>requieren intervención</small>
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

            {/* Switcher de Vistas Ejecutivas */}
            <div className="view-mode-switcher" role="tablist">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'semaforo' ? 'active' : ''}`}
                onClick={() => setViewMode('semaforo')}
                title="Vista Semáforo Territorial de Sedes"
              >
                <LayoutGrid size={14} />
                <span>Semáforo de Sedes</span>
              </button>
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'fases' ? 'active' : ''}`}
                onClick={() => setViewMode('fases')}
                title="Vista Fases Operativas y Curva S"
              >
                <Activity size={14} />
                <span>Fases y Curva S</span>
              </button>
            </div>
          </nav>

          {/* Barra de Filtros Nativa estilo Cronograma */}
          <div className="filters">
            <label className="search">
              <Search size={16} />
              <input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar por sede o hito crítico..."
              />
              {busqueda && (
                <button type="button" onClick={() => setBusqueda('')}>
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Filtro Fase Operativa */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'fase' ? 'active' : ''} ${
                  fase !== 'Todas' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'fase' ? null : 'fase');
                }}
                title="Filtrar por fase del subproceso"
              >
                <div className="filter-card-copy">
                  <small>Fase Operativa</small>
                  <span>{fase === 'Todas' ? 'Todas las fases' : fase}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'fase' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
                  <div className="filter-popover-title">Filtrar por Fase</div>
                  <div className="filter-popover-list">
                    {['Todas', 'Fase 1', 'Fase 2', 'DEI'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        className={`filter-item-btn ${fase === f ? 'selected' : ''}`}
                        onClick={() => {
                          setFase(f);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{f === 'Todas' ? 'Todas las fases' : f}</span>
                        {fase === f && <Check size={14} className="item-check" />}
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
                className={`filter-card-btn ${openDropdown === 'estado' ? 'active' : ''} ${
                  filtroEstado !== 'todos' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'estado' ? null : 'estado');
                }}
                title="Filtrar por estado de cumplimiento"
              >
                <div className="filter-card-copy">
                  <small>Estado</small>
                  <span>
                    {filtroEstado === 'todos'
                      ? 'Todos los estados'
                      : filtroEstado === 'cumple'
                      ? 'Cumplen'
                      : filtroEstado === 'proceso'
                      ? 'En proceso'
                      : 'No cumplen'}
                  </span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'estado' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
                  <div className="filter-popover-title">Filtrar por Estado</div>
                  <div className="filter-popover-list">
                    {[
                      { id: 'todos', label: 'Todos los estados' },
                      { id: 'cumple', label: 'Cumplen' },
                      { id: 'proceso', label: 'En proceso' },
                      { id: 'incumple', label: 'No cumplen / En alerta' },
                    ].map((st) => (
                      <button
                        key={st.id}
                        type="button"
                        className={`filter-item-btn ${filtroEstado === st.id ? 'selected' : ''}`}
                        onClick={() => {
                          setFiltroEstado(st.id);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{st.label}</span>
                        {filtroEstado === st.id && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Sede */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'sede' ? 'active' : ''} ${
                  ugel !== 'Todas' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'sede' ? null : 'sede');
                }}
                title="Filtrar por sede territorial"
              >
                <div className="filter-card-copy">
                  <small>Sede Operativa</small>
                  <span>{ugel === 'Todas' ? 'Todas las sedes' : ugel}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'sede' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
                  <div className="filter-popover-title">Filtrar por Sede</div>
                  <div className="filter-popover-list" style={{ maxHeight: '220px', overflowY: 'auto' }}>
                    {['Todas', ...RESUMEN_ROWS.map((x) => x.nombre)].map((u) => (
                      <button
                        key={u}
                        type="button"
                        className={`filter-item-btn ${ugel === u ? 'selected' : ''}`}
                        onClick={() => {
                          setUgel(u);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{u === 'Todas' ? 'Todas las sedes' : u}</span>
                        {ugel === u && <Check size={14} className="item-check" />}
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

          {/* Vistas: Semáforo de Sedes o Fases y Curva S */}
          {viewMode === 'semaforo' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px 0 24px' }}>
              {/* Tabla de Semáforo de Sedes */}
              <div
                className="cronograma-lista-table-wrap"
                style={{
                  overflowX: 'auto',
                  background: '#fff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                }}
              >
                <TableEngineStatus engine={engine} />
                <table className="cronograma-lista-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'left', padding: '12px 16px' }}>
                        <ColumnHeader engine={engine} columnId="nombre" label="Sede Territorial" />
                      </th>
                      <th style={{ textAlign: 'center', padding: '12px 16px', width: '140px' }}>
                        <ColumnHeader engine={engine} columnId="estado" label="Estado" />
                      </th>
                      <th style={{ textAlign: 'center', padding: '12px 16px', width: '200px' }}>
                        <ColumnHeader engine={engine} columnId="avance" label="Avance Físico" />
                      </th>
                      <th style={{ textAlign: 'left', padding: '12px 16px' }}>
                        <ColumnHeader engine={engine} columnId="hito" label="Próximo Hito Crítico" />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ padding: '28px 16px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                          Sin sedes registradas para este proyecto.
                        </td>
                      </tr>
                    )}
                    {rows.map((r) => (
                      <tr key={r.nombre}>
                        <td style={{ padding: '12px 16px', fontWeight: 650, color: '#0f172a' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <Building2 size={16} color="#2563eb" />
                            <span>{r.nombre}</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <span
                            className={`status-pill ${
                              r.estado === 'cumple'
                                ? 'badge-complete'
                                : r.estado === 'proceso'
                                ? 'badge-progress'
                                : 'badge-late'
                            }`}
                          >
                            {r.estado === 'cumple' ? 'Cumple' : r.estado === 'proceso' ? 'En proceso' : 'No cumple'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                            <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${r.avance}%`,
                                  height: '100%',
                                  backgroundColor:
                                    r.avance === 100 ? '#16a34a' : r.avance >= 50 ? '#2563eb' : '#dc2626',
                                }}
                              />
                            </div>
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{r.avance}%</span>
                          </div>
                        </td>
                        <td style={{ padding: '12px 16px', color: '#475569', fontSize: '13px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                            <Clock3 size={13} color="#94a3b8" /> {r.hito}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Hitos Críticos Inmediatos */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '18px 20px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 750, color: '#0f172a' }}>
                      Hitos Críticos de Intervención Inmediata
                    </h3>
                    <small style={{ color: '#64748b', fontSize: '12px' }}>
                      Compromisos prioritarios que requieren seguimiento territorial
                    </small>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '12px' }}>
                  {liveHitos.map((h) => (
                    <div
                      key={h.titulo}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                      }}
                    >
                      <div
                        style={{
                          width: '42px',
                          height: '42px',
                          borderRadius: '8px',
                          background: '#ffffff',
                          border: '1px solid #cbd5e1',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <b style={{ fontSize: '15px', lineHeight: 1, color: '#0f172a' }}>{h.dia}</b>
                        <span style={{ fontSize: '9px', fontWeight: 800, color: '#64748b' }}>{h.mes}</span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <strong
                          style={{
                            display: 'block',
                            fontSize: '13px',
                            color: '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                          }}
                        >
                          {h.titulo}
                        </strong>
                        <small style={{ color: '#64748b', fontSize: '11.5px' }}>{h.unidad}</small>
                      </div>
                      <span
                        className={`status-pill ${
                          h.estado === 'Retrasado'
                            ? 'badge-late'
                            : h.estado === 'En riesgo'
                            ? 'badge-progress'
                            : 'badge-pending'
                        }`}
                      >
                        {h.estado}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '8px 0 24px' }}>
              {/* Sección Avance por Fase */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 750, color: '#0f172a' }}>
                      Avance por Fase de Trabajo
                    </h3>
                    <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                      Progreso reportado de subida de archivos y validaciones operativas
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: '#64748b' }}>
                    <span><i style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#16a34a', marginRight: '5px' }} /> En plazo</span>
                    <span><i style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b', marginRight: '5px' }} /> En riesgo</span>
                    <span><i style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#dc2626', marginRight: '5px' }} /> Retrasado</span>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: '220px', paddingRight: '20px', marginBottom: '10px', fontSize: '11px', fontWeight: 700, color: '#94a3b8' }}>
                  <span>OCT 2026</span>
                  <span>NOV 2026</span>
                  <span>DIC 2026</span>
                  <span>ENE 2027</span>
                  <span>FEB 2027</span>
                </div>

                {livePhases.map((p) => (
                  <div
                    key={p.nombre}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '220px 50px 1fr',
                      alignItems: 'center',
                      gap: '16px',
                      padding: '12px 0',
                      borderBottom: '1px solid #f1f5f9',
                    }}
                  >
                    <strong style={{ fontSize: '13px', fontWeight: 650, color: '#0f172a' }}>{p.nombre}</strong>
                    <b style={{ fontSize: '13px', fontWeight: 750, color: '#2563eb' }}>{p.avance}%</b>
                    <div style={{ height: '9px', background: '#f1f5f9', borderRadius: '999px', position: 'relative', overflow: 'hidden' }}>
                      <span
                        style={{
                          position: 'absolute',
                          top: 0,
                          bottom: 0,
                          left: `${p.inicio}%`,
                          width: `${p.fin - p.inicio}%`,
                          borderRadius: '999px',
                          backgroundColor: p.estado === 'green' ? '#16a34a' : p.estado === 'amber' ? '#f59e0b' : '#dc2626',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Curva Regional de Avance Acumulado */}
              <div
                style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '20px',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 750, color: '#0f172a' }}>
                    Curva S de Avance Regional
                  </h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12.5px', color: '#64748b' }}>
                    Progreso acumulado: Planificado vs. Real en territorio
                  </p>
                </div>

                <div style={{ height: '180px', position: 'relative' }}>
                  <svg viewBox="0 0 450 170" style={{ width: '100%', height: '100%' }}>
                    <line x1="10" y1="20" x2="440" y2="20" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="10" y1="60" x2="440" y2="60" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="10" y1="100" x2="440" y2="100" stroke="#f1f5f9" strokeDasharray="3 3" />
                    <line x1="10" y1="140" x2="440" y2="140" stroke="#f1f5f9" strokeDasharray="3 3" />
                    {/* Línea planeada */}
                    <path d="M 20 145 Q 150 90 430 30" fill="none" stroke="#94a3b8" strokeWidth="2" strokeDasharray="4 4" />
                    {/* Línea real */}
                    <path d="M 20 150 Q 140 120 300 75" fill="none" stroke="#2563eb" strokeWidth="3" />
                    <circle cx="300" cy="75" r="4.5" fill="#2563eb" />
                    <text x="310" y="72" fontSize="12" fontWeight="700" fill="#2563eb">
                      50%
                    </text>
                  </svg>
                </div>
                <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#64748b', marginTop: '6px' }}>
                  <span>
                    <i style={{ display: 'inline-block', width: '10px', height: '2px', background: '#94a3b8', verticalAlign: 'middle', marginRight: '4px' }} /> Planificado
                  </span>
                  <span>
                    <i style={{ display: 'inline-block', width: '10px', height: '3px', background: '#2563eb', verticalAlign: 'middle', marginRight: '4px' }} /> Real (promedio regional)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pie de página canónico */}
          <footer className="footer">
            <span>
              Mostrando {rows.length} de {total} sedes territoriales monitoreadas
            </span>
          </footer>
        </main>

        {notice && (
          <div
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
            <Check size={16} color="#4ade80" />
            <span>{notice}</span>
          </div>
        )}
      </div>
    </div>
  );
}
