// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import '../cronograma-gantt/gantt.css';
import type { Integrante, SedeFrente, UnidadOrganizacional, AsignacionViva, PresetVista, EstadoOperativo } from './types';
import {
  getStoredIntegrantes,
  saveStoredIntegrantes,
  getStoredSedes,
  saveStoredSedes,
  getStoredAreas,
  getStoredAsignaciones,
  saveStoredAsignaciones,
  getStoredPresets,
  saveStoredPresets,
} from './mockData';
import EquipoDirectorioView from './EquipoDirectorioView';
import EquipoSedesView from './EquipoSedesView';
import EquipoOrganigramaView from './EquipoOrganigramaView';
import EquipoCargaView from './EquipoCargaView';
import EquipoDrawer from './EquipoDrawer';
import EquipoExpedienteModal from './EquipoExpedienteModal';
import EquipoNuevoModal from './EquipoNuevoModal';
import EquipoColumnasModal from './EquipoColumnasModal';
import { ProjectShellHeader, ProjectShellWorkspace, ProjectShellTabs } from '../../shared/project-shell';
import {
  Users,
  UserCheck,
  Clock3,
  AlertTriangle,
  Download,
  Plus,
  GitBranch,
  Building2,
  Activity,
  List,
  CheckCircle2,
  SlidersHorizontal,
  ChartNoAxesColumnIncreasing,
  Eye,
  EyeOff,
  ChevronDown,
  Check,
} from 'lucide-react';

const ALL_COLUMNS = [
  { id: 'integrante', label: 'Integrante (Avatar y Correo)' },
  { id: 'cargo', label: 'Cargo Funcional' },
  { id: 'sede', label: 'Sede / Frente Asignado' },
  { id: 'estadoOperativo', label: 'Estado Laboral' },
  { id: 'estadoCuenta', label: 'Cuenta de Acceso' },
  { id: 'carga', label: 'Carga Operativa (%)' },
  { id: 'email', label: 'Correo Electrónico' },
  { id: 'telefono', label: 'Teléfono Móvil' },
];

export default function EquipoView({
  activeProject,
  onActions,
}: {
  activeProject?: any;
  onActions?: (h: { notify: (m: string) => void }) => void;
}) {
  const [integrantes, setIntegrantes] = useState<Integrante[]>(getStoredIntegrantes);
  const [sedes, setSedes] = useState<SedeFrente[]>(getStoredSedes);
  const [areas, setAreas] = useState<UnidadOrganizacional[]>(getStoredAreas);
  const [asignaciones, setAsignaciones] = useState<AsignacionViva[]>(getStoredAsignaciones);
  const [presets, setPresets] = useState<PresetVista[]>(getStoredPresets);
  const [activePresetId, setActivePresetId] = useState<string>('preset-todos');

  // Vistas conmutables
  const [activeView, setActiveView] = useState<'directorio' | 'organigrama' | 'sedes' | 'carga'>('directorio');
  const [selectedPill, setSelectedPill] = useState<string>('Todos');

  // Drawer y Modales
  const [selectedIntegranteId, setSelectedIntegranteId] = useState<string | null>(null);
  const [expedienteIntegrante, setExpedienteIntegrante] = useState<Integrante | null>(null);
  const [isNuevoModalOpen, setIsNuevoModalOpen] = useState(false);
  const [isColumnasModalOpen, setIsColumnasModalOpen] = useState(false);

  // Filtros combinados
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'integrante',
    'cargo',
    'sede',
    'estadoOperativo',
    'estadoCuenta',
    'carga',
  ]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sedeFilter, setSedeFilter] = useState('todas');
  const [estadoOpFilter, setEstadoOpFilter] = useState('todos');
  const [estadoCuentaFilter, setEstadoCuentaFilter] = useState('todos');
  const [showSummaryCards, setShowSummaryCards] = useState(true);
  const [activeMenu, setActiveMenu] = useState<'sede' | 'estado' | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

  useEffect(() => {
    const handleDocClick = () => setActiveMenu(null);
    document.addEventListener('click', handleDocClick);
    return () => document.removeEventListener('click', handleDocClick);
  }, []);

  useEffect(() => {
    onActions?.({ notify });
  }, [onActions]);

  const selectedIntegrante = useMemo(() => {
    return integrantes.find((i) => i.id === selectedIntegranteId) || null;
  }, [integrantes, selectedIntegranteId]);

  // Métricas KPI Superiores Desacopladas
  const metrics = useMemo(() => {
    const total = integrantes.length;
    const activos = integrantes.filter((i) => i.estadoOperativo === 'En funciones').length;
    const licencias = integrantes.filter((i) => i.estadoOperativo === 'Licencia / Permiso').length;
    const pendientesCuenta = integrantes.filter((i) => i.estadoCuenta === 'Invitación Pendiente').length;
    const alertasAtrasadas = asignaciones.filter((a) => a.estado === 'Atrasado').length;

    const totalEsfuerzoActivo = asignaciones
      .filter((a) => a.estado !== 'Completado')
      .reduce((sum, a) => sum + a.esfuerzoHoras, 0);
    const totalCapacidad = integrantes.reduce((sum, i) => sum + i.capacidadNominalHorasSemana, 0);
    const ocupacionPromedio = totalCapacidad > 0 ? Math.round((totalEsfuerzoActivo / totalCapacidad) * 100) : 0;

    return { total, activos, licencias, pendientesCuenta, alertasAtrasadas, ocupacionPromedio };
  }, [integrantes, asignaciones]);

  // Píldoras de filtrado superior
  const tabPills = [
    { n: 'Todos', c: metrics.total },
    { n: 'En funciones', c: metrics.activos },
    { n: 'Licencia / Permiso', c: metrics.licencias },
    { n: 'Cuentas por activar', c: metrics.pendientesCuenta },
    { n: 'Con alerta', c: metrics.alertasAtrasadas },
  ];

  const handlePillClick = (nombrePill: string) => {
    setSelectedPill(nombrePill);
    if (nombrePill === 'Todos') {
      setEstadoOpFilter('todos');
      setEstadoCuentaFilter('todos');
    } else if (nombrePill === 'En funciones') {
      setEstadoOpFilter('En funciones');
      setEstadoCuentaFilter('todos');
    } else if (nombrePill === 'Licencia / Permiso') {
      setEstadoOpFilter('Licencia / Permiso');
      setEstadoCuentaFilter('todos');
    } else if (nombrePill === 'Cuentas por activar') {
      setEstadoOpFilter('todos');
      setEstadoCuentaFilter('Invitación Pendiente');
    } else if (nombrePill === 'Con alerta') {
      setEstadoOpFilter('todos');
      setEstadoCuentaFilter('todos');
    }
  };

  const handleUpdateIntegrante = (updated: Integrante) => {
    const next = integrantes.map((i) => (i.id === updated.id ? updated : i));
    setIntegrantes(next);
    saveStoredIntegrantes(next);
    if (expedienteIntegrante?.id === updated.id) {
      setExpedienteIntegrante(updated);
    }
    notify(`Ficha de ${updated.nombreCompleto} actualizada`);
  };

  const handleCreateIntegrante = (nuevo: Integrante) => {
    const next = [nuevo, ...integrantes];
    setIntegrantes(next);
    saveStoredIntegrantes(next);
    setSelectedIntegranteId(nuevo.id);
    notify(`Nuevo integrante ${nuevo.nombreCompleto} registrado`);
  };

  const handleBulkUpdateSede = (ids: string[], newSedeId: string) => {
    const targetSede = sedes.find((s) => s.id === newSedeId);
    if (!targetSede) return;
    const next = integrantes.map((i) => {
      if (!ids.includes(i.id)) return i;
      return {
        ...i,
        sedeId: targetSede.id,
        sedeNombre: targetSede.nombre,
      };
    });
    setIntegrantes(next);
    saveStoredIntegrantes(next);
    notify(`Sede reasignada a ${ids.length} integrantes`);
  };

  const handleBulkUpdateEstadoOperativo = (ids: string[], nuevoEstado: EstadoOperativo) => {
    const next = integrantes.map((i) => {
      if (!ids.includes(i.id)) return i;
      return { ...i, estadoOperativo: nuevoEstado };
    });
    setIntegrantes(next);
    saveStoredIntegrantes(next);
    notify(`Estado actualizado para ${ids.length} integrantes`);
  };

  const handleBulkReenviarInvitaciones = (ids: string[]) => {
    notify(`Invitaciones de acceso reenviadas a ${ids.length} correos`);
  };

  const handleSelectPreset = (preset: PresetVista) => {
    setActivePresetId(preset.id);
    if (preset.columnasVisibles && preset.columnasVisibles.length > 0) {
      setVisibleColumns(preset.columnasVisibles);
    }
    setSearchQuery(preset.filtros.busqueda || '');
    setSedeFilter(preset.filtros.sedeId || 'todas');
    setEstadoOpFilter(preset.filtros.estadoOperativo || 'todos');
    setEstadoCuentaFilter(preset.filtros.estadoCuenta || 'todos');
    notify(`Vista aplicada: ${preset.nombre}`);
  };

  const handleSavePreset = (nombre: string) => {
    const newPreset: PresetVista = {
      id: 'preset-' + Date.now().toString(36),
      nombre,
      columnasVisibles,
      filtros: {
        busqueda: searchQuery,
        sedeId: sedeFilter,
        estadoOperativo: estadoOpFilter,
        estadoCuenta: estadoCuentaFilter,
      },
    };
    const next = [...presets, newPreset];
    setPresets(next);
    saveStoredPresets(next);
    setActivePresetId(newPreset.id);
    notify(`Vista "${nombre}" guardada`);
  };

  const handleToggleColumn = (colId: string) => {
    setVisibleColumns((prev) => {
      if (prev.includes(colId)) {
        if (prev.length <= 2) return prev;
        return prev.filter((c) => c !== colId);
      }
      return [...prev, colId];
    });
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSedeFilter('todas');
    setEstadoOpFilter('todos');
    setEstadoCuentaFilter('todos');
    setSelectedPill('Todos');
    notify('Filtros restablecidos');
  };

  const projectName = activeProject?.name || 'Proyecto Operativo';

  return (
    <div className="gantt-v2">
      <div className="app">
        {/* Header Principal universal compartido */}
        <ProjectShellHeader
          perspective="equipo"
          title={`Equipo del Proyecto · ${projectName}`}
          description="Padrón operativo, organigrama, distribución de frentes territoriales y balance de capacidad de trabajo."
          actions={
            <>
              <button
                type="button"
                className="btn secondary"
                onClick={() => setShowSummaryCards((visible) => !visible)}
                title={showSummaryCards ? 'Ocultar tarjetas superiores' : 'Mostrar tarjetas superiores'}
                aria-label={showSummaryCards ? 'Ocultar tarjetas superiores' : 'Mostrar tarjetas superiores'}
              >
                {showSummaryCards ? <Eye size={15} /> : <EyeOff size={15} />}
              </button>
              <button
                type="button"
                className="btn secondary"
                onClick={() => {
                  const headers = ['Código', 'Nombre Completo', 'Correo', 'Teléfono', 'Documento', 'Cargo', 'Sede', 'Estado Operativo', 'Estado Cuenta'];
                  const rows = integrantes.map((i) => [
                    i.codigo,
                    i.nombreCompleto,
                    i.email,
                    i.telefono,
                    i.documentoIdentidad,
                    i.cargo,
                    i.sedeNombre,
                    i.estadoOperativo,
                    i.estadoCuenta,
                  ]);
                  const csvContent = '\uFEFF' + [headers, ...rows].map((e) => e.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(';')).join('\r\n');
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `directorio_equipo_${Date.now()}.csv`;
                  link.click();
                  URL.revokeObjectURL(url);
                  notify('Directorio exportado a CSV');
                }}
                title="Exportar padrón del equipo"
              >
                <Download size={15} />
                <span>Exportar</span>
              </button>
              <button
                type="button"
                className="btn primary"
                onClick={() => setIsNuevoModalOpen(true)}
              >
                <Plus size={16} />
                <span>Nuevo Integrante</span>
              </button>
            </>
          }
        />

        {/* Tarjetas Métricas Directivas */}
        {showSummaryCards && (
          <section className="metrics">
            <article className="metric blue">
              <span className="metric-icon">
                <Users size={22} />
              </span>
              <div className="metric-copy">
                <b>{metrics.total}</b>
                <strong>Total Integrantes</strong>
                <small>padrón del proyecto</small>
              </div>
              <ChartNoAxesColumnIncreasing className="bars" />
            </article>

            <article className="metric green">
              <span className="metric-icon">
                <UserCheck size={22} />
              </span>
              <div className="metric-copy">
                <b>{metrics.activos}</b>
                <strong>En Funciones</strong>
                <small>{Math.round((metrics.activos / Math.max(1, metrics.total)) * 100)}% operativos</small>
              </div>
              <ChartNoAxesColumnIncreasing className="bars" />
            </article>

            <article className="metric amber">
              <span className="metric-icon">
                <Clock3 size={22} />
              </span>
              <div className="metric-copy">
                <b>{metrics.pendientesCuenta}</b>
                <strong>Cuentas por Activar</strong>
                <small>invitación pendiente</small>
              </div>
              <ChartNoAxesColumnIncreasing className="bars" />
            </article>

            <article className="metric red">
              <span className="metric-icon">
                <AlertTriangle size={22} />
              </span>
              <div className="metric-copy">
                <b>{metrics.alertasAtrasadas}</b>
                <strong>Con Alerta</strong>
                <small>atención requerida</small>
              </div>
              <ChartNoAxesColumnIncreasing className="bars" />
            </article>

            <article className="metric overall">
              <div className="ring" style={{ '--p': `${metrics.ocupacionPromedio}%` } as React.CSSProperties}>
                <b>{metrics.ocupacionPromedio}%</b>
              </div>
              <div>
                <strong>Carga Promedio</strong>
                <small>capacidad del equipo</small>
              </div>
              <ChartNoAxesColumnIncreasing className="bars" />
            </article>
          </section>
        )}

        {/* =========================================================================
            LA CÁPSULA UNIFICADA: Workspace Central encapsulado con bordes y sombra
           ========================================================================= */}
        <ProjectShellWorkspace>
          {/* Tabs Superiores con Switcher de Modos a la Derecha */}
          <ProjectShellTabs
            tabsList={
              <>
                <button
                  type="button"
                  className={selectedPill === 'Todos' && sedeFilter === 'todas' && estadoOpFilter === 'todos' ? 'active' : ''}
                  onClick={() => {
                    setSelectedPill('Todos');
                    setSedeFilter('todas');
                    setEstadoOpFilter('todos');
                    setEstadoCuentaFilter('todos');
                    setActiveMenu(null);
                  }}
                >
                  Todos <span>({integrantes.length})</span>
                </button>

                {/* Filtro Universal 1: Sede / Frente Territorial */}
                <div className="filter-dropdown-wrap tabs-filter-wrap">
                  <button
                    type="button"
                    className={`filter-card-btn ${activeMenu === 'sede' ? 'active' : ''} ${sedeFilter !== 'todas' ? 'filtered' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === 'sede' ? null : 'sede');
                    }}
                    title="Filtrar por sede o frente territorial"
                  >
                    <div className="filter-card-copy">
                      <small>Sede / Frente</small>
                      <span>{sedes.find((s) => s.id === sedeFilter)?.nombre || 'Todas las sedes'}</span>
                    </div>
                    <ChevronDown size={14} className="filter-chevron" />
                  </button>
                  {activeMenu === 'sede' && (
                    <div
                      className="filter-card-popover"
                      onClick={(e) => e.stopPropagation()}
                      style={{ minWidth: 240 }}
                    >
                      <div className="filter-popover-title filter-popover-title-row">
                        <span>Frentes Territoriales</span>
                        {sedeFilter !== 'todas' && (
                          <button
                            type="button"
                            className="filter-reset-link"
                            onClick={() => setSedeFilter('todas')}
                          >
                            Restablecer
                          </button>
                        )}
                      </div>
                      <div className="filter-popover-list">
                        <button
                          type="button"
                          className={`filter-item-btn filter-item-check ${sedeFilter === 'todas' ? 'selected' : ''}`}
                          onClick={() => {
                            setSedeFilter('todas');
                            setActiveMenu(null);
                          }}
                        >
                          <span className="filter-item-main">
                            <span className={`filter-radio ${sedeFilter === 'todas' ? 'checked' : ''}`}>
                              {sedeFilter === 'todas' && <span className="filter-radio-dot" />}
                            </span>
                            <span className="filter-item-text"><strong>Todas las sedes</strong></span>
                          </span>
                          <span className="wbs-level-badge">{integrantes.length}</span>
                        </button>
                        {sedes.map((s) => {
                          const count = integrantes.filter((i) => i.sedeId === s.id).length;
                          const isSelected = sedeFilter === s.id;
                          return (
                            <button
                              key={s.id}
                              type="button"
                              className={`filter-item-btn filter-item-check ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                setSedeFilter(s.id);
                                setActiveMenu(null);
                              }}
                            >
                              <span className="filter-item-main">
                                <span className={`filter-radio ${isSelected ? 'checked' : ''}`}>
                                  {isSelected && <span className="filter-radio-dot" />}
                                </span>
                                <span className="filter-item-text"><strong>{s.nombre}</strong></span>
                              </span>
                              <span className="wbs-level-badge">{count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Filtro Universal 2: Estado Laboral */}
                <div className="filter-dropdown-wrap estado-filter-wrap tabs-filter-wrap">
                  <button
                    type="button"
                    className={`filter-card-btn estado-card-btn ${activeMenu === 'estado' ? 'active' : ''} ${estadoOpFilter !== 'todos' ? 'filtered' : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveMenu(activeMenu === 'estado' ? null : 'estado');
                    }}
                    title="Filtrar por estado operativo"
                  >
                    <div className="filter-card-copy">
                      <small>Estado</small>
                      <span>{estadoOpFilter === 'todos' ? 'Todos los estados' : estadoOpFilter}</span>
                    </div>
                    <ChevronDown size={14} className="filter-chevron" />
                  </button>
                  {activeMenu === 'estado' && (
                    <div
                      className="filter-card-popover"
                      onClick={(e) => e.stopPropagation()}
                      style={{ minWidth: 230 }}
                    >
                      <div className="filter-popover-title filter-popover-title-row">
                        <span>Estado Laboral</span>
                        {estadoOpFilter !== 'todos' && (
                          <button
                            type="button"
                            className="filter-reset-link"
                            onClick={() => setEstadoOpFilter('todos')}
                          >
                            Restablecer
                          </button>
                        )}
                      </div>
                      <div className="filter-popover-list">
                        {[
                          { id: 'todos', label: 'Todos los estados', count: integrantes.length, dotColor: '#64748b', badgeClass: '' },
                          { id: 'En funciones', label: 'En funciones', count: metrics.activos, dotColor: '#16a34a', badgeClass: 'badge-cumple' },
                          { id: 'Licencia / Permiso', label: 'Licencia / Permiso', count: metrics.licencias, dotColor: '#f59e0b', badgeClass: 'badge-enproceso' },
                          { id: 'Desvinculado', label: 'Desvinculado', count: integrantes.filter(i => i.estadoOperativo === 'Desvinculado').length, dotColor: '#dc2626', badgeClass: 'badge-retraso' },
                        ].map((opt) => {
                          const isSelected = estadoOpFilter === opt.id;
                          return (
                            <button
                              key={opt.id}
                              type="button"
                              className={`filter-item-btn filter-item-check ${isSelected ? 'selected' : ''}`}
                              onClick={() => {
                                setEstadoOpFilter(opt.id);
                                setActiveMenu(null);
                              }}
                            >
                              <span className="filter-item-main">
                                <span className={`filter-radio ${isSelected ? 'checked' : ''}`}>
                                  {isSelected && <span className="filter-radio-dot" />}
                                </span>
                                <span className="filter-status-dot" style={{ background: opt.dotColor }} />
                                <span className="filter-item-text"><strong>{opt.label}</strong></span>
                              </span>
                              <span className={`wbs-level-badge ${opt.badgeClass}`}>{opt.count}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </>
            }
            viewSwitcher={
              <>
                <button
                  type="button"
                  className={`view-mode-btn ${activeView === 'directorio' ? 'active' : ''}`}
                  onClick={() => setActiveView('directorio')}
                  title="Directorio Maestro"
                >
                  <List size={14} />
                  <span>Directorio</span>
                </button>

                <button
                  type="button"
                  className={`view-mode-btn ${activeView === 'organigrama' ? 'active' : ''}`}
                  onClick={() => setActiveView('organigrama')}
                  title="Organigrama Jerárquico"
                >
                  <GitBranch size={14} />
                  <span>Organigrama</span>
                </button>

                <button
                  type="button"
                  className={`view-mode-btn ${activeView === 'sedes' ? 'active' : ''}`}
                  onClick={() => setActiveView('sedes')}
                  title="Frentes Territoriales"
                >
                  <Building2 size={14} />
                  <span>Frentes Territoriales</span>
                </button>

                <button
                  type="button"
                  className={`view-mode-btn ${activeView === 'carga' ? 'active' : ''}`}
                  onClick={() => setActiveView('carga')}
                  title="Carga de Trabajo"
                >
                  <Activity size={14} />
                  <span>Carga de Trabajo</span>
                </button>
              </>
            }
          />

          {/* VISTAS DENTRO DE LA CÁPSULA */}
          {activeView === 'directorio' && (
            <EquipoDirectorioView
              integrantes={integrantes}
              selectedId={selectedIntegranteId}
              onSelectIntegrante={(id) => setSelectedIntegranteId(id)}
              onOpenExpediente={(it) => setExpedienteIntegrante(it)}
              onUpdateIntegrante={handleUpdateIntegrante}
              onBulkUpdateSede={handleBulkUpdateSede}
              onBulkUpdateEstadoOperativo={handleBulkUpdateEstadoOperativo}
              onBulkReenviarInvitaciones={handleBulkReenviarInvitaciones}
              sedes={sedes}
              asignaciones={asignaciones}
              visibleColumns={visibleColumns}
              onOpenColumnasModal={() => setIsColumnasModalOpen(true)}
              activePresetId={activePresetId}
              presets={presets}
              onSelectPreset={handleSelectPreset}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sedeFilter={sedeFilter}
              setSedeFilter={setSedeFilter}
              estadoOpFilter={estadoOpFilter}
              setEstadoOpFilter={setEstadoOpFilter}
              estadoCuentaFilter={estadoCuentaFilter}
              setEstadoCuentaFilter={setEstadoCuentaFilter}
              onClearFilters={handleClearFilters}
            />
          )}

          {activeView === 'organigrama' && (
            <EquipoOrganigramaView
              integrantes={integrantes}
              areas={areas}
              sedes={sedes}
              onSelectIntegrante={(id) => setSelectedIntegranteId(id)}
            />
          )}

          {activeView === 'sedes' && (
            <EquipoSedesView
              sedes={sedes}
              integrantes={integrantes}
              onSelectIntegrante={(id) => setSelectedIntegranteId(id)}
              onUpdateIntegrante={handleUpdateIntegrante}
              onUpdateSede={(updatedSede) => {
                const next = sedes.map((s) => (s.id === updatedSede.id ? updatedSede : s));
                setSedes(next);
                saveStoredSedes(next);
                notify(`Sede "${updatedSede.nombre}" actualizada`);
              }}
            />
          )}

          {activeView === 'carga' && (
            <EquipoCargaView
              integrantes={integrantes}
              asignaciones={asignaciones}
              sedes={sedes}
              onSelectIntegrante={(id) => setSelectedIntegranteId(id)}
              onReasignarTarea={(asignacionId, nuevoIntegranteId) => {
                const nuevoIntegrante = integrantes.find((i) => i.id === nuevoIntegranteId);
                const next = asignaciones.map((a) => {
                  if (a.id !== asignacionId) return a;
                  return { ...a, integranteId: nuevoIntegranteId };
                });
                setAsignaciones(next);
                saveStoredAsignaciones(next);
                notify(`Tarea reasignada a ${nuevoIntegrante?.nombreCompleto || 'nuevo integrante'}`);
              }}
            />
          )}
        </ProjectShellWorkspace>
      </div>

      {/* DRAWER LATERAL DE CONSULTA Y EDICIÓN RÁPIDA (NIVEL 1) */}
      {selectedIntegrante && !expedienteIntegrante && (
        <EquipoDrawer
          integrante={selectedIntegrante}
          onClose={() => setSelectedIntegranteId(null)}
          onOpenExpediente={(it) => setExpedienteIntegrante(it)}
          onUpdateIntegrante={handleUpdateIntegrante}
          asignaciones={asignaciones}
          sedes={sedes}
        />
      )}

      {/* EXPEDIENTE COMPLETO INMERSIVO (NIVEL 2) CON PRESERVACIÓN DE CONTEXTO */}
      {expedienteIntegrante && (
        <EquipoExpedienteModal
          isOpen={true}
          onClose={() => setExpedienteIntegrante(null)}
          integrante={expedienteIntegrante}
          onUpdateIntegrante={handleUpdateIntegrante}
          asignaciones={asignaciones}
          sedes={sedes}
          areas={areas}
        />
      )}

      {/* MODAL PARA CREAR NUEVO INTEGRANTE */}
      <EquipoNuevoModal
        isOpen={isNuevoModalOpen}
        onClose={() => setIsNuevoModalOpen(false)}
        onSave={handleCreateIntegrante}
        sedes={sedes}
        areas={areas}
      />

      {/* MODAL PARA PERSONALIZAR COLUMNAS Y GUARDAR PRESETS */}
      <EquipoColumnasModal
        isOpen={isColumnasModalOpen}
        onClose={() => setIsColumnasModalOpen(false)}
        allColumns={ALL_COLUMNS}
        visibleColumns={visibleColumns}
        onToggleColumn={handleToggleColumn}
        onSavePreset={handleSavePreset}
      />

      {/* TOAST DE NOTIFICACIÓN */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 3000,
            background: '#0f172a',
            color: '#ffffff',
            padding: '10px 18px',
            borderRadius: '8px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
            fontSize: '12.5px',
            fontWeight: 650,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            border: '1px solid #334155',
            animation: 'fadeInPop 0.2s ease-out',
          }}
        >
          <CheckCircle2 size={16} color="#4ade80" />
          {toastMessage}
        </div>
      )}
    </div>
  );
}
