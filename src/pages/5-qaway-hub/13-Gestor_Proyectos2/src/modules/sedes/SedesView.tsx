// @ts-nocheck
import React, { useMemo, useState, useEffect } from 'react';
import './sedes.css';
import {
  AlertTriangle,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  ChevronRight,
  Filter,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  User,
  UserCheck,
  Users,
  X,
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

  const [search, setSearch] = useState('');
  const [zonaFilter, setZonaFilter] = useState('Todas');
  const [coordFilter, setCoordFilter] = useState('Todos');
  const [gestorFilter, setGestorFilter] = useState('Todos');
  const [statusFilter, setStatusFilter] = useState('Todos');

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

  // Listas únicas para los selectores
  const zonas = useMemo(() => ['Todas', ...Array.from(new Set(sedes.map((s) => s.zona)))], [sedes]);
  const coords = useMemo(() => ['Todos', ...Array.from(new Set(sedes.map((s) => s.coordinadorZonal)))], [sedes]);
  const gestores = useMemo(() => ['Todos', ...Array.from(new Set(sedes.map((s) => s.gestorCampo)))], [sedes]);

  // Filtrado reactivo
  const filteredSedes = useMemo(() => {
    return sedes.filter((s) => {
      const matchSearch =
        search === '' ||
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.sedeFisica.toLowerCase().includes(search.toLowerCase());
      const matchZona = zonaFilter === 'Todas' || s.zona === zonaFilter;
      const matchCoord = coordFilter === 'Todos' || s.coordinadorZonal === coordFilter;
      const matchGestor = gestorFilter === 'Todos' || s.gestorCampo === gestorFilter;
      const matchStatus = statusFilter === 'Todos' || s.status === statusFilter;
      return matchSearch && matchZona && matchCoord && matchGestor && matchStatus;
    });
  }, [sedes, search, zonaFilter, coordFilter, gestorFilter, statusFilter]);

  // Métricas
  const totalSedes = sedes.length;
  const sedesAlDia = sedes.filter((s) => s.status === 'Completado' || s.status === 'En plazo').length;
  const sedesRetraso = sedes.filter((s) => s.status === 'Con retraso').length;
  const gestoresActivos = new Set(sedes.map((s) => s.gestorCampo)).size;

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

  return (
    <div className="sd-v1">
      {/* Cabecera del Módulo */}
      <header className="sd-header">
        <div className="sd-header-left">
          <div className="sd-header-icon">
            <Building2 size={24} />
          </div>
          <div>
            <h1 className="sd-header-title">Sedes de Supervisión y Frentes de Campo</h1>
            <p className="sd-header-desc">
              Supervisión del grado de avance físico, cumplimiento y asignación de gestores por cada sede operativa.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="sd-new-btn"
          onClick={() => setIsModalCreateOpen(true)}
          title="Dar de alta una nueva sede o frente de trabajo"
        >
          <Plus size={16} />
          <span>Nueva Sede Operativa</span>
        </button>
      </header>

      {/* Tarjetas de Métricas de Control */}
      <div className="sd-kpis">
        <div className="sd-kpi-card">
          <div className="sd-kpi-info">
            <small>Total Sedes Supervisadas</small>
            <b>{totalSedes}</b>
          </div>
          <div className="sd-kpi-badge blue">
            <Building2 size={18} />
          </div>
        </div>
        <div className="sd-kpi-card">
          <div className="sd-kpi-info">
            <small>Sedes en Plazo / Al Día</small>
            <b>{sedesAlDia}</b>
          </div>
          <div className="sd-kpi-badge green">
            <CheckCircle2 size={18} />
          </div>
        </div>
        <div className="sd-kpi-card">
          <div className="sd-kpi-info">
            <small>Sedes con Retraso (Atención)</small>
            <b>{sedesRetraso}</b>
          </div>
          <div className="sd-kpi-badge amber">
            <AlertTriangle size={18} />
          </div>
        </div>
        <div className="sd-kpi-card">
          <div className="sd-kpi-info">
            <small>Gestores de Campo Activos</small>
            <b>{gestoresActivos}</b>
          </div>
          <div className="sd-kpi-badge purple">
            <Users size={18} />
          </div>
        </div>
      </div>

      {/* Barra de Filtros Operativos */}
      <div className="sd-filters">
        <div className="sd-search-box">
          <Search size={15} color="#94a3b8" />
          <input
            type="text"
            placeholder="Buscar sede, distrito o frente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select
          className="sd-select-filter"
          value={zonaFilter}
          onChange={(e) => setZonaFilter(e.target.value)}
          title="Filtrar por Zona o Macro-región"
        >
          {zonas.map((z) => (
            <option key={z} value={z}>
              {z === 'Todas' ? 'Todas las Zonas' : z}
            </option>
          ))}
        </select>

        <select
          className="sd-select-filter"
          value={coordFilter}
          onChange={(e) => setCoordFilter(e.target.value)}
          title="Filtrar por Coordinador Zonal"
        >
          {coords.map((c) => (
            <option key={c} value={c}>
              {c === 'Todos' ? 'Todos los Coord. Zonales' : c}
            </option>
          ))}
        </select>

        <select
          className="sd-select-filter"
          value={gestorFilter}
          onChange={(e) => setGestorFilter(e.target.value)}
          title="Filtrar por Gestor de Campo asignado"
        >
          {gestores.map((g) => (
            <option key={g} value={g}>
              {g === 'Todos' ? 'Todos los Gestores' : g}
            </option>
          ))}
        </select>

        <select
          className="sd-select-filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          title="Filtrar por Estado de cumplimiento"
        >
          <option value="Todos">Todos los Estados</option>
          <option value="Completado">Completado</option>
          <option value="En plazo">En plazo</option>
          <option value="En curso">En curso</option>
          <option value="Con retraso">Con retraso</option>
        </select>

        {(search || zonaFilter !== 'Todas' || coordFilter !== 'Todos' || gestorFilter !== 'Todos' || statusFilter !== 'Todos') && (
          <button
            type="button"
            className="sd-clear-btn"
            onClick={() => {
              setSearch('');
              setZonaFilter('Todas');
              setCoordFilter('Todos');
              setGestorFilter('Todos');
              setStatusFilter('Todos');
            }}
          >
            <RefreshCw size={13} />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      {/* Grid de Sedes */}
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
                className={`sd-badge-status ${
                  s.status === 'Completado'
                    ? 'green'
                    : s.status === 'En plazo' || s.status === 'En curso'
                    ? 'blue'
                    : 'amber'
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
              className="sd-clear-btn"
              onClick={() => setSelectedSede(null)}
            >
              Cerrar
            </button>
            <button
              type="button"
              className="sd-new-btn"
              onClick={() => setSelectedSede(null)}
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
                  onClick={() => setIsModalCreateOpen(false)}
                  style={{ padding: '9px 16px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#475569' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '9px 18px', border: 'none', background: '#2563eb', color: '#fff', borderRadius: '8px', fontSize: '13px', fontWeight: 650, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
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
  );
}
