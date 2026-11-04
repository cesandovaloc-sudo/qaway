// @ts-nocheck
import React, { useState, useMemo, useEffect } from 'react';
import './gantt.css';
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
  const [toastMessage, setToastMessage] = useState('');

  const notify = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 2800);
  };

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
      <main className="gantt-main">
        {/* Cabecera Principal / Page-Head con neutralidad institucional */}
        <section className="page-head">
          <div>
            <div className="eyebrow">GESTIÓN DE PERSONAS Y OPERACIONES</div>
            <h1>Equipo del Proyecto · {projectName}</h1>
            <p>Padrón operativo, organigrama, distribución de frentes territoriales y balance de capacidad de trabajo.</p>
          </div>

          <div className="head-actions">
            <button
              className="btn secondary"
              onClick={() => setIsColumnasModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Download size={14} />
              <span>Configurar Columnas</span>
            </button>

            <button
              className="btn primary"
              onClick={() => setIsNuevoModalOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={15} />
              <span>Nuevo Integrante</span>
            </button>
          </div>
        </section>

        {/* Tarjetas KPI Superiores Desacopladas (Idénticas a Cronograma) */}
        <section className="metrics">
          {/* Card 1: Azul - Total Integrantes */}
          <div className="metric blue">
            <div className="metric-icon">
              <Users size={22} />
            </div>
            <div className="metric-copy">
              <small>Total Integrantes</small>
              <b>{metrics.total}</b>
            </div>
            <div className="bars">
              <span style={{ width: '100%' }} />
            </div>
          </div>

          {/* Card 2: Verde - En Funciones (Activos) */}
          <div className="metric green">
            <div className="metric-icon">
              <UserCheck size={22} />
            </div>
            <div className="metric-copy">
              <small>En Funciones</small>
              <b>
                {metrics.activos}{' '}
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#166534' }}>
                  ({Math.round((metrics.activos / Math.max(1, metrics.total)) * 100)}%)
                </span>
              </b>
            </div>
            <div className="bars">
              <span style={{ width: `${(metrics.activos / Math.max(1, metrics.total)) * 100}%` }} />
            </div>
          </div>

          {/* Card 3: Ámbar - Cuentas por Activar */}
          <div className="metric amber">
            <div className="metric-icon">
              <Clock3 size={22} />
            </div>
            <div className="metric-copy">
              <small>Cuentas por Activar</small>
              <b>{metrics.pendientesCuenta}</b>
            </div>
            <div className="bars">
              <span style={{ width: `${(metrics.pendientesCuenta / Math.max(1, metrics.total)) * 100}%` }} />
            </div>
          </div>

          {/* Card 4: Rojo - Asignaciones Atrasadas */}
          <div className="metric red">
            <div className="metric-icon">
              <AlertTriangle size={22} />
            </div>
            <div className="metric-copy">
              <small>Asignaciones con Alerta</small>
              <b>{metrics.alertasAtrasadas}</b>
            </div>
            <div className="bars">
              <span style={{ width: `${(metrics.alertasAtrasadas / Math.max(1, asignaciones.length)) * 100}%` }} />
            </div>
          </div>

          {/* Card 5: Circular - Carga Promedio */}
          <div
            className="metric"
            style={{
              background: '#ffffff',
              border: '1px solid #dfe8f4',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 18px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  border: '3px solid #0066ff',
                  borderTopColor: '#e0f2fe',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 700,
                  fontSize: '13px',
                  color: '#0f172a',
                }}
              >
                {metrics.ocupacionPromedio}%
              </div>
              <div>
                <small style={{ display: 'block', fontSize: '11px', fontWeight: 650, color: '#64748b', textTransform: 'uppercase' }}>
                  Carga Promedio
                </small>
                <b style={{ fontSize: '13px', color: '#0f172a' }}>
                  Capacidad de Trabajo
                </b>
              </div>
            </div>
          </div>
        </section>

        {/* =========================================================================
            LA CÁPSULA UNIFICADA: Workspace Central encapsulado con bordes y sombra
           ========================================================================= */}
        <main className="workspace">
          {/* Tabs Superiores con Switcher de Modos a la Derecha */}
          <nav className="tabs">
            <div className="tabs-list">
              {tabPills.map((t) => (
                <button
                  key={t.n}
                  type="button"
                  className={selectedPill === t.n ? 'active' : ''}
                  onClick={() => handlePillClick(t.n)}
                >
                  {t.n} <span>({t.c})</span>
                </button>
              ))}
            </div>

            {/* Switcher de Modos con cápsula azul activa (Exacto a Cronograma) */}
            <div className="view-mode-switcher" role="tablist">
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
            </div>
          </nav>

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
        </main>
      </main>

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
