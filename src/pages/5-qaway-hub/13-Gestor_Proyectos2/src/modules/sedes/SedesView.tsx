// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import '../cronograma-gantt/gantt.css';
import './sedes.css';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  LayoutGrid,
  List,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  X,
  ChartNoAxesColumnIncreasing,
} from 'lucide-react';

export interface SedeItem {
  id: string;
  name: string;
  zona: string;
  sedeFisica: string;
  coordinadorZonal: string;
  gestorCampo: string;
  status: 'En plazo' | 'En curso' | 'Con retraso' | 'Completado';
  progress: number;
  tasksTotal: number;
  tasksDone: number;
  presupuesto: string;
  lastInspection: string;
}

const INITIAL_SEDES: SedeItem[] = [
  {
    id: 's-1',
    name: 'Sede Chupaca',
    zona: 'Valle del Mantaro',
    sedeFisica: 'Chupaca Centro',
    coordinadorZonal: 'Carlos Mendoza',
    gestorCampo: 'María Salazar',
    status: 'Completado',
    progress: 100,
    tasksTotal: 4,
    tasksDone: 4,
    presupuesto: 'S/ 65,000',
    lastInspection: '24 oct. 2026',
  },
  {
    id: 's-2',
    name: 'Sede Concepción',
    zona: 'Valle del Mantaro',
    sedeFisica: 'Concepción Norte',
    coordinadorZonal: 'Carlos Mendoza',
    gestorCampo: 'María Salazar',
    status: 'En plazo',
    progress: 85,
    tasksTotal: 4,
    tasksDone: 3,
    presupuesto: 'S/ 72,000',
    lastInspection: '26 oct. 2026',
  },
  {
    id: 's-3',
    name: 'Sede Huancayo Central',
    zona: 'Valle del Mantaro',
    sedeFisica: 'Huancayo Metropolitano',
    coordinadorZonal: 'Carlos Mendoza',
    gestorCampo: 'Carlos Mendoza',
    status: 'En curso',
    progress: 55,
    tasksTotal: 13,
    tasksDone: 5,
    presupuesto: 'S/ 140,000',
    lastInspection: '25 oct. 2026',
  },
  {
    id: 's-4',
    name: 'Sede Jauja',
    zona: 'Valle del Mantaro',
    sedeFisica: 'Jauja Aeropuerto',
    coordinadorZonal: 'Carlos Mendoza',
    gestorCampo: 'Carlos Mendoza',
    status: 'En curso',
    progress: 50,
    tasksTotal: 4,
    tasksDone: 2,
    presupuesto: 'S/ 58,000',
    lastInspection: '22 oct. 2026',
  },
  {
    id: 's-5',
    name: 'Sede Tarma',
    zona: 'Zona Sierra Central',
    sedeFisica: 'Tarma Alta',
    coordinadorZonal: 'Lucía Ramos',
    gestorCampo: 'Carlos Mendoza',
    status: 'En curso',
    progress: 45,
    tasksTotal: 5,
    tasksDone: 2,
    presupuesto: 'S/ 80,000',
    lastInspection: '20 oct. 2026',
  },
  {
    id: 's-6',
    name: 'Sede Chanchamayo',
    zona: 'Selva Central',
    sedeFisica: 'La Merced',
    coordinadorZonal: 'Lucía Ramos',
    gestorCampo: 'Lucía Ramos',
    status: 'En curso',
    progress: 35,
    tasksTotal: 6,
    tasksDone: 2,
    presupuesto: 'S/ 95,000',
    lastInspection: '21 oct. 2026',
  },
  {
    id: 's-7',
    name: 'Sede Yauli - La Oroya',
    zona: 'Zona Minera / Sierra',
    sedeFisica: 'La Oroya Antigua',
    coordinadorZonal: 'Carlos Mendoza',
    gestorCampo: 'Carlos Mendoza',
    status: 'Con retraso',
    progress: 30,
    tasksTotal: 4,
    tasksDone: 1,
    presupuesto: 'S/ 50,000',
    lastInspection: '18 oct. 2026',
  },
  {
    id: 's-8',
    name: 'Sede Satipo',
    zona: 'Selva Central',
    sedeFisica: 'Satipo Urbano',
    coordinadorZonal: 'Lucía Ramos',
    gestorCampo: 'María Salazar',
    status: 'Con retraso',
    progress: 20,
    tasksTotal: 5,
    tasksDone: 1,
    presupuesto: 'S/ 110,000',
    lastInspection: '19 oct. 2026',
  },
  {
    id: 's-9',
    name: 'Sede Pichanaki',
    zona: 'Selva Central',
    sedeFisica: 'Pichanaki Eje Cafetero',
    coordinadorZonal: 'Lucía Ramos',
    gestorCampo: 'Lucía Ramos',
    status: 'Con retraso',
    progress: 20,
    tasksTotal: 5,
    tasksDone: 1,
    presupuesto: 'S/ 88,000',
    lastInspection: '17 oct. 2026',
  },
  {
    id: 's-10',
    name: 'Sede Río Tambo',
    zona: 'Selva Frontera',
    sedeFisica: 'Puerto Prado',
    coordinadorZonal: 'Lucía Ramos',
    gestorCampo: 'Javier Ruiz',
    status: 'Con retraso',
    progress: 10,
    tasksTotal: 4,
    tasksDone: 0,
    presupuesto: 'S/ 75,000',
    lastInspection: '15 oct. 2026',
  },
];

const GESTOR_COLORS: Record<string, string> = {
  'María Salazar': '#0284c7',
  'Carlos Mendoza': '#2563eb',
  'Lucía Ramos': '#7c3aed',
  'Javier Ruiz': '#d97706',
  'Sin Asignar': '#94a3b8',
};

const getInitials = (name: string) => {
  if (!name) return 'S';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export default function SedesView({
  onActions,
  activeProjectId,
}: {
  onActions?: (h: any) => void;
  activeProjectId?: string;
}) {
  const storageKey = `qaway-sedes-${activeProjectId || 'default'}`;

  const [sedes, setSedes] = useState<SedeItem[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return JSON.parse(saved);
    } catch {
      /* fallback */
    }
    return INITIAL_SEDES;
  });

  // Pestañas y Vistas
  const [selectedTab, setSelectedTab] = useState<string>('Todas');
  const [viewMode, setViewMode] = useState<'Tarjetas' | 'Lista'>('Tarjetas');

  // Filtros
  const [search, setSearch] = useState('');
  const [zonaFilter, setZonaFilter] = useState('Todas las Zonas');
  const [coordFilter, setCoordFilter] = useState('Todos los Coord.');
  const [gestorFilter, setGestorFilter] = useState('Todos los Gestores');
  const [statusFilter, setStatusFilter] = useState('Todos los Estados');
  const [openDropdown, setOpenDropdown] = useState<'zona' | 'coord' | 'gestor' | 'status' | null>(null);

  // Modales y Drawer
  const [selectedSede, setSelectedSede] = useState<SedeItem | null>(null);
  const [isModalCreateOpen, setIsModalCreateOpen] = useState(false);
  const [newSedeName, setNewSedeName] = useState('');
  const [newSedeZona, setNewSedeZona] = useState('Valle del Mantaro');
  const [newSedeCoord, setNewSedeCoord] = useState('Carlos Mendoza');
  const [newSedeGestor, setNewSedeGestor] = useState('María Salazar');
  const [newSedePresupuesto, setNewSedePresupuesto] = useState('S/ 60,000');

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(sedes));
    } catch {
      /* fallback */
    }
  }, [sedes, storageKey]);

  useEffect(() => {
    onActions?.({
      notify: (m: string) => alert(m),
    });
  }, [onActions]);

  // Cerrar popovers al hacer click fuera
  useEffect(() => {
    const handleWindowClick = () => setOpenDropdown(null);
    window.addEventListener('click', handleWindowClick);
    return () => window.removeEventListener('click', handleWindowClick);
  }, []);

  // Listas únicas de opciones
  const zonas = useMemo(() => ['Todas las Zonas', ...Array.from(new Set(sedes.map((s) => s.zona)))], [sedes]);
  const coords = useMemo(() => ['Todos los Coord.', ...Array.from(new Set(sedes.map((s) => s.coordinadorZonal)))], [sedes]);
  const gestores = useMemo(() => ['Todos los Gestores', ...Array.from(new Set(sedes.map((s) => s.gestorCampo)))], [sedes]);
  const statuses = ['Todos los Estados', 'En plazo', 'En curso', 'Con retraso', 'Completado'];

  // Métricas
  const totalSedes = sedes.length;
  const sedesEnPlazo = sedes.filter((s) => s.status === 'En plazo').length;
  const sedesEnCurso = sedes.filter((s) => s.status === 'En curso').length;
  const sedesRetraso = sedes.filter((s) => s.status === 'Con retraso').length;
  const sedesCompletado = sedes.filter((s) => s.status === 'Completado').length;
  const sedesAlDia = sedes.filter((s) => s.status === 'Completado' || s.status === 'En plazo').length;
  const gestoresActivos = new Set(sedes.map((s) => s.gestorCampo)).size;

  const tabPills = [
    { id: 'Todas', label: 'Todas las sedes', count: totalSedes },
    { id: 'En plazo', label: 'En plazo', count: sedesEnPlazo },
    { id: 'En curso', label: 'En curso', count: sedesEnCurso },
    { id: 'Con retraso', label: 'Con retraso', count: sedesRetraso },
    { id: 'Completado', label: 'Completadas', count: sedesCompletado },
  ];

  // Filtrado reactivo
  const filteredSedes = useMemo(() => {
    return sedes.filter((s) => {
      const matchSearch =
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.zona.toLowerCase().includes(search.toLowerCase()) ||
        s.sedeFisica.toLowerCase().includes(search.toLowerCase()) ||
        s.coordinadorZonal.toLowerCase().includes(search.toLowerCase()) ||
        s.gestorCampo.toLowerCase().includes(search.toLowerCase());

      const matchTab = selectedTab === 'Todas' || s.status === selectedTab;
      const matchZona = zonaFilter === 'Todas las Zonas' || s.zona === zonaFilter;
      const matchCoord = coordFilter === 'Todos los Coord.' || s.coordinadorZonal === coordFilter;
      const matchGestor = gestorFilter === 'Todos los Gestores' || s.gestorCampo === gestorFilter;
      const matchStatus = statusFilter === 'Todos los Estados' || s.status === statusFilter;

      return matchSearch && matchTab && matchZona && matchCoord && matchGestor && matchStatus;
    });
  }, [sedes, search, selectedTab, zonaFilter, coordFilter, gestorFilter, statusFilter]);

  const hasActiveFilters =
    search !== '' ||
    zonaFilter !== 'Todas las Zonas' ||
    coordFilter !== 'Todos los Coord.' ||
    gestorFilter !== 'Todos los Gestores' ||
    statusFilter !== 'Todos los Estados';

  const clearAllFilters = () => {
    setSearch('');
    setZonaFilter('Todas las Zonas');
    setCoordFilter('Todos los Coord.');
    setGestorFilter('Todos los Gestores');
    setStatusFilter('Todos los Estados');
  };

  const handleCreateSede = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSedeName.trim()) return;
    const item: SedeItem = {
      id: 's-' + Date.now(),
      name: newSedeName.trim(),
      zona: newSedeZona,
      sedeFisica: newSedeName.trim(),
      coordinadorZonal: newSedeCoord,
      gestorCampo: newSedeGestor,
      status: 'En curso',
      progress: 0,
      tasksTotal: 4,
      tasksDone: 0,
      presupuesto: newSedePresupuesto.trim() || 'S/ 50,000',
      lastInspection: 'Recién asignada',
    };
    setSedes((prev) => [item, ...prev]);
    setNewSedeName('');
    setIsModalCreateOpen(false);
  };

  const updateSelectedSede = (patch: Partial<SedeItem>) => {
    if (!selectedSede) return;
    const updated = { ...selectedSede, ...patch };
    setSelectedSede(updated);
    setSedes((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
  };

  const exportCSV = () => {
    const rows = [
      ['ID', 'Sede', 'Zona', 'Sede Física', 'Coordinador Zonal', 'Gestor de Campo', 'Estado', 'Avance (%)', 'Presupuesto', 'Última Inspección'],
      ...filteredSedes.map((s) => [
        s.id,
        s.name,
        s.zona,
        s.sedeFisica,
        s.coordinadorZonal,
        s.gestorCampo,
        s.status,
        String(s.progress),
        s.presupuesto,
        s.lastInspection,
      ]),
    ];
    const url = URL.createObjectURL(
      new Blob(['\ufeff' + rows.map((r) => r.map((v) => '"' + v.replaceAll('"', '""') + '"').join(',')).join('\r\n')], {
        type: 'text/csv;charset=utf-8;',
      })
    );
    const a = document.createElement('a');
    a.href = url;
    a.download = `reporte_sedes_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="gantt-v2">
      <div className="app">
        {/* Cabecera Principal Oficial (Idéntica a Cronograma) */}
        <header className="header">
          <div className="heading">
            <span className="heading-icon">
              <Building2 size={26} />
            </span>
            <div>
              <h1>Sedes de Supervisión y Frentes de Campo</h1>
              <p>
                Supervisión del avance físico, cumplimiento y asignación de gestores por cada frente operativo territorial.
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
              <span>Exportar Sedes</span>
            </button>
            <button
              type="button"
              className="btn primary"
              onClick={() => setIsModalCreateOpen(true)}
              title="Dar de alta una nueva sede o frente de trabajo"
            >
              <Plus size={16} />
              <span>Nueva Sede Operativa</span>
            </button>
          </div>
        </header>

        {/* Tarjetas Métricas Directivas (Idénticas a Cronograma) */}
        <section className="metrics">
          <article
            className="metric blue"
            onClick={() => {
              setSelectedTab('Todas');
              setStatusFilter('Todos los Estados');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <Building2 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(totalSedes).padStart(2, '0')}</b>
              <strong>Sedes Supervisadas</strong>
              <small>frentes en seguimiento activo</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric green"
            onClick={() => {
              setSelectedTab('En plazo');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <CheckCircle2 size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(sedesAlDia).padStart(2, '0')}</b>
              <strong>En Plazo / Al Día</strong>
              <small>cumplimiento sin retrasos</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article
            className="metric amber"
            onClick={() => {
              setSelectedTab('Con retraso');
            }}
            style={{ cursor: 'pointer' }}
          >
            <span className="metric-icon">
              <AlertTriangle size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(sedesRetraso).padStart(2, '0')}</b>
              <strong>Con Retraso</strong>
              <small>requieren intervención prioritaria</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>

          <article className="metric red" style={{ cursor: 'default' }}>
            <span className="metric-icon">
              <Users size={22} />
            </span>
            <div className="metric-copy">
              <b>{String(gestoresActivos).padStart(2, '0')}</b>
              <strong>Gestores Activos</strong>
              <small>asignados en territorio</small>
            </div>
            <ChartNoAxesColumnIncreasing className="bars" />
          </article>
        </section>

        {/* =========================================================================
            LA CÁPSULA WORKSPACE CENTRAL (Idéntica a Cronograma, Tareas y Equipo)
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

            {/* Switcher de Modos (Tarjetas / Lista) */}
            <div className="view-mode-switcher" role="tablist">
              <button
                type="button"
                className={`view-mode-btn ${viewMode === 'Tarjetas' ? 'active' : ''}`}
                onClick={() => setViewMode('Tarjetas')}
                title="Vista Cuadrícula de Tarjetas"
              >
                <LayoutGrid size={14} />
                <span>Tarjetas</span>
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
                placeholder="Buscar sede, distrito o frente territorial..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button type="button" onClick={() => setSearch('')}>
                  <X size={14} />
                </button>
              )}
            </label>

            {/* Filtro Zona / Ámbito */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'zona' ? 'active' : ''} ${
                  zonaFilter !== 'Todas las Zonas' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'zona' ? null : 'zona');
                }}
                title="Filtrar por Zona o Macro-región"
              >
                <div className="filter-card-copy">
                  <small>Zona / Ámbito</small>
                  <span>{zonaFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'zona' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
                  <div className="filter-popover-title">Filtrar por Zona</div>
                  <div className="filter-popover-list">
                    {zonas.map((z) => (
                      <button
                        key={z}
                        type="button"
                        className={`filter-item-btn ${zonaFilter === z ? 'selected' : ''}`}
                        onClick={() => {
                          setZonaFilter(z);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{z}</span>
                        {zonaFilter === z && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Coordinador Zonal */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'coord' ? 'active' : ''} ${
                  coordFilter !== 'Todos los Coord.' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'coord' ? null : 'coord');
                }}
                title="Filtrar por Coordinador Zonal"
              >
                <div className="filter-card-copy">
                  <small>Coordinador Zonal</small>
                  <span>{coordFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'coord' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
                  <div className="filter-popover-title">Filtrar por Coordinador</div>
                  <div className="filter-popover-list">
                    {coords.map((c) => (
                      <button
                        key={c}
                        type="button"
                        className={`filter-item-btn ${coordFilter === c ? 'selected' : ''}`}
                        onClick={() => {
                          setCoordFilter(c);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{c}</span>
                        {coordFilter === c && <Check size={14} className="item-check" />}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Filtro Gestor de Campo */}
            <div className="filter-dropdown-wrap">
              <button
                type="button"
                className={`filter-card-btn ${openDropdown === 'gestor' ? 'active' : ''} ${
                  gestorFilter !== 'Todos los Gestores' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'gestor' ? null : 'gestor');
                }}
                title="Filtrar por Gestor de Campo asignado"
              >
                <div className="filter-card-copy">
                  <small>Gestor de Campo</small>
                  <span>{gestorFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'gestor' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
                  <div className="filter-popover-title">Filtrar por Gestor</div>
                  <div className="filter-popover-list">
                    {gestores.map((g) => (
                      <button
                        key={g}
                        type="button"
                        className={`filter-item-btn ${gestorFilter === g ? 'selected' : ''}`}
                        onClick={() => {
                          setGestorFilter(g);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{g}</span>
                        {gestorFilter === g && <Check size={14} className="item-check" />}
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
                  statusFilter !== 'Todos los Estados' ? 'filtered' : ''
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenDropdown(openDropdown === 'status' ? null : 'status');
                }}
                title="Filtrar por Estado de cumplimiento"
              >
                <div className="filter-card-copy">
                  <small>Estado</small>
                  <span>{statusFilter}</span>
                </div>
                <ChevronDown size={14} className="filter-chevron" />
              </button>

              {openDropdown === 'status' && (
                <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 200 }}>
                  <div className="filter-popover-title">Filtrar por Estado</div>
                  <div className="filter-popover-list">
                    {statuses.map((st) => (
                      <button
                        key={st}
                        type="button"
                        className={`filter-item-btn ${statusFilter === st ? 'selected' : ''}`}
                        onClick={() => {
                          setStatusFilter(st);
                          setOpenDropdown(null);
                        }}
                      >
                        <span>{st}</span>
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
                title="Restablecer todos los filtros"
              >
                <RefreshCw size={13} />
                <span>Limpiar</span>
              </button>
            )}
          </div>

          {/* Contenido de Sedes: Vista Tarjetas o Vista Lista */}
          {viewMode === 'Tarjetas' ? (
            <div className="sd-grid-container">
              {filteredSedes.map((s) => (
                <div key={s.id} className="sd-card">
                  <div className="sd-card-top">
                    <div>
                      <h3 className="sd-card-title">{s.name}</h3>
                      <span className="sd-card-sub">
                        <MapPin size={12} /> {s.zona} · {s.sedeFisica}
                      </span>
                    </div>
                    <span
                      className={`status-pill ${
                        s.status === 'Completado'
                          ? 'badge-complete'
                          : s.status === 'En plazo' || s.status === 'En curso'
                          ? 'badge-progress'
                          : 'badge-late'
                      }`}
                    >
                      {s.status}
                    </span>
                  </div>

                  <div className="sd-card-body">
                    <div className="sd-row-metric">
                      <span>Avance físico consolidado</span>
                      <b>{s.progress}%</b>
                    </div>
                    <div className="sd-progress-track">
                      <div
                        className="sd-progress-fill"
                        style={{
                          width: `${s.progress}%`,
                          backgroundColor:
                            s.progress === 100 ? '#16a34a' : s.progress >= 40 ? '#2563eb' : '#d97706',
                        }}
                      />
                    </div>
                  </div>

                  <div className="sd-team-strip">
                    <div className="sd-team-line">
                      <span>Coord. Zonal:</span>
                      <b>{s.coordinadorZonal}</b>
                    </div>
                    <div className="sd-team-line">
                      <span>Gestor de Campo:</span>
                      <div className="sd-gestor-avatar-pill">
                        <span
                          className="sd-avatar-circle"
                          style={{ backgroundColor: GESTOR_COLORS[s.gestorCampo] || '#2563eb' }}
                        >
                          {getInitials(s.gestorCampo)}
                        </span>
                        <b>{s.gestorCampo}</b>
                      </div>
                    </div>
                    <div className="sd-team-line" style={{ marginTop: '2px', borderTop: '1px dashed #e2e8f0', paddingTop: '4px' }}>
                      <span>Presupuesto sede:</span>
                      <b style={{ color: '#0f172a' }}>{s.presupuesto}</b>
                    </div>
                  </div>

                  <div className="sd-card-actions">
                    <button
                      type="button"
                      className="sd-action-inspect"
                      onClick={() => setSelectedSede(s)}
                      title="Abrir ficha técnica y asignaciones"
                    >
                      <UserCheck size={14} />
                      <span>Ficha Técnica y Gestor</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="cronograma-lista-table-wrap"
              style={{
                overflowX: 'auto',
                background: '#fff',
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                margin: '0 0 16px',
              }}
            >
              <table className="cronograma-lista-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Sede / Frente Operativo</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Zona / Ubicación</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Coordinador Zonal</th>
                    <th style={{ textAlign: 'left', padding: '12px 16px' }}>Gestor de Campo</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px' }}>Avance Físico</th>
                    <th style={{ textAlign: 'right', padding: '12px 16px' }}>Presupuesto</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px' }}>Estado</th>
                    <th style={{ textAlign: 'center', padding: '12px 16px' }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSedes.map((s) => (
                    <tr key={s.id}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#0f172a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Building2 size={16} color="#2563eb" />
                          <span>{s.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '13px' }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <MapPin size={13} color="#94a3b8" /> {s.zona} · {s.sedeFisica}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', color: '#334155', fontSize: '13px' }}>{s.coordinadorZonal}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <div className="sd-gestor-avatar-pill">
                          <span
                            className="sd-avatar-circle"
                            style={{ backgroundColor: GESTOR_COLORS[s.gestorCampo] || '#2563eb' }}
                          >
                            {getInitials(s.gestorCampo)}
                          </span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1e293b' }}>{s.gestorCampo}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center', minWidth: '130px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
                          <div style={{ flex: 1, height: '6px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${s.progress}%`,
                                height: '100%',
                                backgroundColor: s.progress === 100 ? '#16a34a' : s.progress >= 40 ? '#2563eb' : '#d97706',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{s.progress}%</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, color: '#0f172a', fontSize: '13px' }}>
                        {s.presupuesto}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span
                          className={`status-pill ${
                            s.status === 'Completado'
                              ? 'badge-complete'
                              : s.status === 'En plazo' || s.status === 'En curso'
                              ? 'badge-progress'
                              : 'badge-late'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <button
                          type="button"
                          className="btn secondary"
                          style={{ height: '30px', padding: '0 10px', fontSize: '12px' }}
                          onClick={() => setSelectedSede(s)}
                          title="Abrir ficha técnica y asignaciones"
                        >
                          Ficha
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
              Mostrando {filteredSedes.length} de {totalSedes} sedes registradas
            </span>
          </footer>
        </main>

        {/* Drawer Lateral de Ficha de Sede */}
        {selectedSede && (
          <aside className="sd-drawer">
            <div className="sd-drawer-head">
              <div>
                <h2 className="sd-drawer-title">{selectedSede.name}</h2>
                <small style={{ fontSize: '12px', color: '#64748b' }}>Ficha Operativa de Frente de Trabajo</small>
              </div>
              <button
                type="button"
                onClick={() => setSelectedSede(null)}
                style={{
                  border: 'none',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  width: '32px',
                  height: '32px',
                  display: 'grid',
                  placeItems: 'center',
                  cursor: 'pointer',
                  color: '#64748b',
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div className="sd-drawer-body">
              <label className="sd-drawer-field">
                <span>Nombre de la Sede / Obra</span>
                <input
                  type="text"
                  value={selectedSede.name}
                  onChange={(e) => updateSelectedSede({ name: e.target.value })}
                />
              </label>

              <label className="sd-drawer-field">
                <span>Zona / Distrito / Macro-región</span>
                <input
                  type="text"
                  value={selectedSede.zona}
                  onChange={(e) => updateSelectedSede({ zona: e.target.value })}
                />
              </label>

              <label className="sd-drawer-field">
                <span>Coordinador Zonal a Cargo</span>
                <select
                  value={selectedSede.coordinadorZonal}
                  onChange={(e) => updateSelectedSede({ coordinadorZonal: e.target.value })}
                >
                  <option>Carlos Mendoza</option>
                  <option>Lucía Ramos</option>
                  <option>Dirección General</option>
                </select>
              </label>

              <label className="sd-drawer-field">
                <span>Gestor de Campo Asignado</span>
                <select
                  value={selectedSede.gestorCampo}
                  onChange={(e) => updateSelectedSede({ gestorCampo: e.target.value })}
                >
                  <option>María Salazar</option>
                  <option>Carlos Mendoza</option>
                  <option>Lucía Ramos</option>
                  <option>Javier Ruiz</option>
                  <option>Sin Asignar</option>
                </select>
              </label>

              <label className="sd-drawer-field">
                <span>Presupuesto Asignado</span>
                <input
                  type="text"
                  value={selectedSede.presupuesto}
                  onChange={(e) => updateSelectedSede({ presupuesto: e.target.value })}
                />
              </label>

              <div className="sd-drawer-field">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Avance Físico</span>
                  <b>{selectedSede.progress}%</b>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={selectedSede.progress}
                  onChange={(e) => updateSelectedSede({ progress: +e.target.value })}
                  style={{ width: '100%', accentColor: '#2563eb' }}
                />
              </div>

              <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <CheckCircle2 size={16} color="#16a34a" />
                  <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>Tareas de Supervisión</span>
                </div>
                <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>
                  {selectedSede.tasksDone} de {selectedSede.tasksTotal} tareas cumplidas en campo para esta sede.
                </p>
              </div>
            </div>

            <div className="sd-drawer-footer">
              <button
                type="button"
                className="btn secondary"
                onClick={() => setSelectedSede(null)}
                style={{ height: '36px', padding: '0 16px' }}
              >
                Cerrar
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={() => setSelectedSede(null)}
                style={{ height: '36px', padding: '0 16px' }}
              >
                Guardar Cambios
              </button>
            </div>
          </aside>
        )}

        {/* Modal para Crear Nueva Sede Operativa */}
        {isModalCreateOpen && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 9999,
              background: 'rgba(15, 23, 42, 0.55)',
              backdropFilter: 'blur(3px)',
              display: 'grid',
              placeItems: 'center',
              padding: '16px',
            }}
            onClick={() => setIsModalCreateOpen(false)}
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: 'min(500px, 100%)',
                background: '#ffffff',
                borderRadius: '16px',
                boxShadow: '0 25px 60px rgba(15, 23, 42, 0.25)',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
              }}
            >
              <div
                style={{
                  padding: '20px 24px',
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '10px',
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'grid',
                      placeItems: 'center',
                    }}
                  >
                    <Building2 size={20} />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                      Alta de Sede Operativa
                    </h3>
                    <small style={{ fontSize: '12px', color: '#64748b' }}>Asignación de frente territorial</small>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalCreateOpen(false)}
                  style={{
                    border: 'none',
                    background: '#f1f5f9',
                    borderRadius: '6px',
                    width: '30px',
                    height: '30px',
                    display: 'grid',
                    placeItems: 'center',
                    cursor: 'pointer',
                    color: '#64748b',
                  }}
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleCreateSede} style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
                  Nombre de la Sede / Edificio / Frente *
                  <input
                    required
                    autoFocus
                    placeholder="Ej. Sede Central Arequipa / Edificio Miraflores"
                    value={newSedeName}
                    onChange={(e) => setNewSedeName(e.target.value)}
                    style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                  />
                </label>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
                  Zona / Distrito / Macro-región
                  <input
                    value={newSedeZona}
                    onChange={(e) => setNewSedeZona(e.target.value)}
                    placeholder="Ej. Lima Norte, Selva Central, Arequipa Sur..."
                    style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
                    Coordinador Zonal
                    <select
                      value={newSedeCoord}
                      onChange={(e) => setNewSedeCoord(e.target.value)}
                      style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff' }}
                    >
                      <option>Carlos Mendoza</option>
                      <option>Lucía Ramos</option>
                    </select>
                  </label>
                  <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
                    Gestor de Campo
                    <select
                      value={newSedeGestor}
                      onChange={(e) => setNewSedeGestor(e.target.value)}
                      style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none', background: '#fff' }}
                    >
                      <option>María Salazar</option>
                      <option>Carlos Mendoza</option>
                      <option>Lucía Ramos</option>
                      <option>Javier Ruiz</option>
                    </select>
                  </label>
                </div>

                <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12.5px', fontWeight: 650, color: '#334155' }}>
                  Presupuesto Asignado a la Sede
                  <input
                    value={newSedePresupuesto}
                    onChange={(e) => setNewSedePresupuesto(e.target.value)}
                    placeholder="Ej. S/ 85,000 ó $ 25,000"
                    style={{ padding: '9px 12px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                  />
                </label>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                  <button
                    type="button"
                    className="btn secondary"
                    onClick={() => setIsModalCreateOpen(false)}
                    style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn primary"
                    style={{ height: '36px', padding: '0 18px', fontSize: '13px' }}
                  >
                    <Check size={16} />
                    <span>Crear Sede</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
