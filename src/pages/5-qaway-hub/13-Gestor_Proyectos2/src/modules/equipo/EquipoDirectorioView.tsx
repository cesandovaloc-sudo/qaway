import React, { useMemo, useState, useEffect } from 'react';
import { ProjectShellFilters } from '../../shared/project-shell';
import type { Integrante, SedeFrente, AsignacionViva, PresetVista, EstadoOperativo, EstadoCuenta } from './types';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  MoreHorizontal,
  Mail,
  Phone,
  MessageSquare,
  Building2,
  Check,
  Maximize2,
  Download,
  Trash2,
  X,
  Send,
  UserCheck,
  Filter,
  CheckSquare,
  Square,
  Bookmark,
  Plus,
} from 'lucide-react';

interface EquipoDirectorioViewProps {
  integrantes: Integrante[];
  selectedId: string | null;
  onSelectIntegrante: (id: string) => void;
  onOpenExpediente: (integrante: Integrante) => void;
  onUpdateIntegrante: (updated: Integrante) => void;
  onBulkUpdateSede: (ids: string[], sedeId: string) => void;
  onBulkUpdateEstadoOperativo: (ids: string[], estado: EstadoOperativo) => void;
  onBulkReenviarInvitaciones: (ids: string[]) => void;
  sedes: SedeFrente[];
  asignaciones: AsignacionViva[];
  visibleColumns: string[];
  onOpenColumnasModal: () => void;
  activePresetId: string;
  presets: PresetVista[];
  onSelectPreset: (preset: PresetVista) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  sedeFilter: string;
  setSedeFilter: (s: string) => void;
  estadoOpFilter: string;
  setEstadoOpFilter: (s: string) => void;
  estadoCuentaFilter: string;
  setEstadoCuentaFilter: (s: string) => void;
  onClearFilters: () => void;
}

export default function EquipoDirectorioView({
  integrantes,
  selectedId,
  onSelectIntegrante,
  onOpenExpediente,
  onUpdateIntegrante,
  onBulkUpdateSede,
  onBulkUpdateEstadoOperativo,
  onBulkReenviarInvitaciones,
  sedes,
  asignaciones,
  visibleColumns,
  onOpenColumnasModal,
  activePresetId,
  presets,
  onSelectPreset,
  searchQuery,
  setSearchQuery,
  sedeFilter,
  setSedeFilter,
  estadoOpFilter,
  setEstadoOpFilter,
  estadoCuentaFilter,
  setEstadoCuentaFilter,
  onClearFilters,
}: EquipoDirectorioViewProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [modalBulkSede, setModalBulkSede] = useState(false);
  const [modalBulkEstado, setModalBulkEstado] = useState(false);
  const [targetSedeId, setTargetSedeId] = useState(sedes[0]?.id || '');
  const [targetEstadoOp, setTargetEstadoOp] = useState<EstadoOperativo>('En funciones');
  const [sortField, setSortField] = useState<keyof Integrante>('nombreCompleto');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [openDropdown, setOpenDropdown] = useState<'sede' | 'estadoOp' | 'estadoCuenta' | null>(null);

  useEffect(() => {
    const handleDocClick = () => setOpenDropdown(null);
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  // Filtrado y ordenamiento en memoria
  const filteredIntegrantes = useMemo(() => {
    return integrantes
      .filter((item) => {
        const matchesQuery =
          !searchQuery.trim() ||
          item.nombreCompleto.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.cargo.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.documentoIdentidad.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesSede = sedeFilter === 'todas' || item.sedeId === sedeFilter;
        const matchesOp = estadoOpFilter === 'todos' || item.estadoOperativo === estadoOpFilter;
        const matchesCuenta = estadoCuentaFilter === 'todos' || item.estadoCuenta === estadoCuentaFilter;

        return matchesQuery && matchesSede && matchesOp && matchesCuenta;
      })
      .sort((a, b) => {
        const valA = a[sortField] || '';
        const valB = b[sortField] || '';
        const comp = String(valA).localeCompare(String(valB), 'es', { numeric: true, sensitivity: 'base' });
        return sortDir === 'asc' ? comp : -comp;
      });
  }, [integrantes, searchQuery, sedeFilter, estadoOpFilter, estadoCuentaFilter, sortField, sortDir]);

  // Selección múltiple
  const allFilteredSelected =
    filteredIntegrantes.length > 0 &&
    filteredIntegrantes.every((it) => selectedIds.has(it.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredIntegrantes.map((it) => it.id)));
    }
  };

  const toggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSort = (field: keyof Integrante) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Cálculo de carga por integrante
  const getCargaStats = (integranteId: string, capacidadHoras: number) => {
    const tareas = asignaciones.filter((a) => a.integranteId === integranteId);
    const activas = tareas.filter((a) => a.estado !== 'Completado');
    const horasActivas = activas.reduce((sum, a) => sum + a.esfuerzoHoras, 0);
    const porcentaje = Math.round((horasActivas / Math.max(1, capacidadHoras)) * 100);
    return { total: tareas.length, activas: activas.length, horasActivas, porcentaje };
  };

  // Exportar Selección a CSV
  const exportarSeleccionCsv = () => {
    const target =
      selectedIds.size > 0
        ? integrantes.filter((i) => selectedIds.has(i.id))
        : filteredIntegrantes;

    const headers = ['Código', 'Nombre Completo', 'Correo', 'Teléfono', 'Documento', 'Cargo', 'Sede', 'Estado Operativo', 'Estado Cuenta'];
    const rows = target.map((i) => [
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

    const csvContent =
      '\uFEFF' +
      [headers, ...rows]
        .map((e) => e.map((x) => `"${String(x).replaceAll('"', '""')}"`).join(';'))
        .join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `directorio_equipo_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="cronograma-lista-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Barra de Filtros Nativa compartida estilo Cronograma */}
      <ProjectShellFilters>
        <label className="search">
          <Search size={16} />
          <input
            placeholder="Buscar por integrante, correo, cargo, documento..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </label>

        {/* Filtro Sede */}
        <div className="filter-dropdown-wrap">
          <button
            type="button"
            className={`filter-card-btn ${openDropdown === 'sede' ? 'active' : ''} ${sedeFilter !== 'todas' ? 'filtered' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === 'sede' ? null : 'sede');
            }}
            title="Filtrar por sede"
          >
            <div className="filter-card-copy">
              <small>Ubicación</small>
              <span>{sedes.find((s) => s.id === sedeFilter)?.nombre || 'Todas las sedes'}</span>
            </div>
            <ChevronDown size={14} className="filter-chevron" />
          </button>
          {openDropdown === 'sede' && (
            <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
              <div className="filter-popover-title">Filtrar por Ubicación</div>
              <div className="filter-popover-list">
                <button
                  type="button"
                  className={`filter-item-btn ${sedeFilter === 'todas' ? 'selected' : ''}`}
                  onClick={() => {
                    setSedeFilter('todas');
                    setOpenDropdown(null);
                  }}
                >
                  <span>Todas las sedes</span>
                  {sedeFilter === 'todas' && <Check size={14} className="item-check" />}
                </button>
                {sedes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`filter-item-btn ${sedeFilter === s.id ? 'selected' : ''}`}
                    onClick={() => {
                      setSedeFilter(s.id);
                      setOpenDropdown(null);
                    }}
                  >
                    <span>{s.nombre}</span>
                    {sedeFilter === s.id && <Check size={14} className="item-check" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filtro Estado Laboral */}
        <div className="filter-dropdown-wrap">
          <button
            type="button"
            className={`filter-card-btn ${openDropdown === 'estadoOp' ? 'active' : ''} ${estadoOpFilter !== 'todos' ? 'filtered' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === 'estadoOp' ? null : 'estadoOp');
            }}
            title="Filtrar por estado laboral"
          >
            <div className="filter-card-copy">
              <small>Estado</small>
              <span>{estadoOpFilter === 'todos' ? 'Todos los estados' : estadoOpFilter}</span>
            </div>
            <ChevronDown size={14} className="filter-chevron" />
          </button>
          {openDropdown === 'estadoOp' && (
            <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 210 }}>
              <div className="filter-popover-title">Filtrar por Estado Laboral</div>
              <div className="filter-popover-list">
                {['todos', 'En funciones', 'Licencia / Permiso', 'Desvinculado'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    className={`filter-item-btn ${estadoOpFilter === st ? 'selected' : ''}`}
                    onClick={() => {
                      setEstadoOpFilter(st);
                      setOpenDropdown(null);
                    }}
                  >
                    <span>{st === 'todos' ? 'Todos los estados' : st}</span>
                    {estadoOpFilter === st && <Check size={14} className="item-check" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filtro Cuenta de Acceso */}
        <div className="filter-dropdown-wrap">
          <button
            type="button"
            className={`filter-card-btn ${openDropdown === 'estadoCuenta' ? 'active' : ''} ${estadoCuentaFilter !== 'todos' ? 'filtered' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === 'estadoCuenta' ? null : 'estadoCuenta');
            }}
            title="Filtrar por acceso a cuenta"
          >
            <div className="filter-card-copy">
              <small>Cuenta</small>
              <span>{estadoCuentaFilter === 'todos' ? 'Todos los accesos' : estadoCuentaFilter}</span>
            </div>
            <ChevronDown size={14} className="filter-chevron" />
          </button>
          {openDropdown === 'estadoCuenta' && (
            <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 210 }}>
              <div className="filter-popover-title">Filtrar por Acceso</div>
              <div className="filter-popover-list">
                {['todos', 'Habilitada', 'Invitación Pendiente', 'Suspendida'].map((acc) => (
                  <button
                    key={acc}
                    type="button"
                    className={`filter-item-btn ${estadoCuentaFilter === acc ? 'selected' : ''}`}
                    onClick={() => {
                      setEstadoCuentaFilter(acc);
                      setOpenDropdown(null);
                    }}
                  >
                    <span>{acc === 'todos' ? 'Todos los accesos' : acc}</span>
                    {estadoCuentaFilter === acc && <Check size={14} className="item-check" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {(searchQuery || sedeFilter !== 'todas' || estadoOpFilter !== 'todos' || estadoCuentaFilter !== 'todos') && (
          <button className="clear-btn" onClick={onClearFilters} title="Limpiar todos los filtros">
            Limpiar
          </button>
        )}

        <div style={{ flex: 1 }} />

        {/* Configurar Columnas */}
        <button
          type="button"
          className="btn secondary"
          style={{ height: '34px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={onOpenColumnasModal}
        >
          <SlidersHorizontal size={13} color="#0066ff" />
          <span>Columnas</span>
        </button>

        {/* Exportar */}
        <button
          type="button"
          className="btn secondary"
          style={{ height: '34px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          onClick={exportarSeleccionCsv}
        >
          <Download size={13} />
          <span>Exportar</span>
        </button>
      </ProjectShellFilters>

      {/* Contenedor de Tabla con Scroll Interno Encapsulado */}
      <div className="cronograma-lista-table-wrap" style={{ flex: 1, overflow: 'auto' }}>
        <table className="cronograma-lista-table">
          <thead>
            <tr>
              <th className="col-chk" style={{ width: '40px', textAlign: 'center' }}>
                <input
                  type="checkbox"
                  checked={allFilteredSelected}
                  onChange={toggleSelectAll}
                  aria-label="Seleccionar todos"
                  style={{ cursor: 'pointer' }}
                />
              </th>

              {visibleColumns.includes('integrante') && (
                <th onClick={() => handleSort('nombreCompleto')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Integrante / Especialista
                    <ArrowUpDown size={11} color="#94a3b8" />
                  </div>
                </th>
              )}

              {visibleColumns.includes('cargo') && (
                <th onClick={() => handleSort('cargo')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Cargo Funcional
                    <ArrowUpDown size={11} color="#94a3b8" />
                  </div>
                </th>
              )}

              {visibleColumns.includes('sede') && (
                <th onClick={() => handleSort('sedeNombre')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Sede / Frente
                    <ArrowUpDown size={11} color="#94a3b8" />
                  </div>
                </th>
              )}

              {visibleColumns.includes('estadoOperativo') && (
                <th onClick={() => handleSort('estadoOperativo')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Estado Laboral
                    <ArrowUpDown size={11} color="#94a3b8" />
                  </div>
                </th>
              )}

              {visibleColumns.includes('estadoCuenta') && (
                <th onClick={() => handleSort('estadoCuenta')} style={{ cursor: 'pointer' }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                    Acceso de Cuenta
                    <ArrowUpDown size={11} color="#94a3b8" />
                  </div>
                </th>
              )}

              {visibleColumns.includes('carga') && (
                <th style={{ minWidth: '150px' }}>Carga Operativa</th>
              )}

              {visibleColumns.includes('email') && <th>Correo Institucional</th>}
              {visibleColumns.includes('telefono') && <th>Teléfono Móvil</th>}

              <th className="col-actions" style={{ width: '44px', textAlign: 'center' }}></th>
            </tr>
          </thead>

          <tbody>
            {filteredIntegrantes.length === 0 ? (
              <tr>
                <td colSpan={10} className="empty-row">
                  No se encontraron integrantes registrados con los filtros seleccionados
                </td>
              </tr>
            ) : (
              filteredIntegrantes.map((item) => {
                const isSelectedRow = selectedId === item.id;
                const isChecked = selectedIds.has(item.id);
                const carga = getCargaStats(item.id, item.capacidadNominalHorasSemana);

                return (
                  <tr
                    key={item.id}
                    onClick={() => onSelectIntegrante(item.id)}
                    className={`lista-row ${isSelectedRow ? 'selected-row' : ''}`}
                    style={{ background: isSelectedRow ? '#f0f9ff' : isChecked ? '#f8fafc' : undefined }}
                  >
                    {/* Checkbox */}
                    <td className="col-chk" onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => toggleSelectOne(item.id, e as any)}
                        style={{ cursor: 'pointer' }}
                      />
                    </td>

                    {/* Integrante */}
                    {visibleColumns.includes('integrante') && (
                      <td className="col-name">
                        <div className="gestor-cell" style={{ gap: '10px' }}>
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={item.nombreCompleto}
                              style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div className="gestor-avatar" style={{ background: '#1e293b', width: '28px', height: '28px', fontSize: '11px' }}>
                              {item.iniciales}
                            </div>
                          )}
                          <div>
                            <b
                              style={{ display: 'block', fontSize: '13px', color: '#0f172a', fontWeight: 650, cursor: 'pointer' }}
                              onMouseEnter={(e) => (e.currentTarget.style.color = '#0066ff')}
                              onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
                            >
                              {item.nombreCompleto}
                            </b>
                            <small style={{ color: '#64748b', fontSize: '11px' }}>{item.email}</small>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Cargo */}
                    {visibleColumns.includes('cargo') && (
                      <td style={{ fontSize: '12.5px', color: '#334155' }}>{item.cargo}</td>
                    )}

                    {/* Sede */}
                    {visibleColumns.includes('sede') && (
                      <td className="col-region">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Building2 size={13} color="#0066ff" />
                          <span className="region-text">{item.sedeNombre}</span>
                        </div>
                      </td>
                    )}

                    {/* Estado Operativo */}
                    {visibleColumns.includes('estadoOperativo') && (
                      <td className="col-status">
                        <span
                          className={`status-pill ${
                            item.estadoOperativo === 'En funciones'
                              ? 'badge-complete'
                              : item.estadoOperativo === 'Licencia / Permiso'
                              ? 'badge-progress'
                              : 'badge-pending'
                          }`}
                        >
                          {item.estadoOperativo}
                        </span>
                      </td>
                    )}

                    {/* Estado Cuenta */}
                    {visibleColumns.includes('estadoCuenta') && (
                      <td>
                        <span
                          className={`status-pill ${
                            item.estadoCuenta === 'Habilitada'
                              ? 'badge-progress'
                              : item.estadoCuenta === 'Invitación Pendiente'
                              ? 'badge-late'
                              : 'badge-pending'
                          }`}
                        >
                          {item.estadoCuenta}
                        </span>
                      </td>
                    )}

                    {/* Carga Operativa */}
                    {visibleColumns.includes('carga') && (
                      <td className="col-progress">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '70px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, carga.porcentaje)}%`,
                                height: '100%',
                                background: carga.porcentaje > 100 ? '#dc2626' : carga.porcentaje > 80 ? '#f59e0b' : '#0066ff',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '11.5px', fontWeight: 650, color: carga.porcentaje > 100 ? '#dc2626' : '#0f172a' }}>
                            {carga.porcentaje}%
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#64748b' }}>({carga.activas} t.)</span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('email') && <td style={{ fontSize: '12px', color: '#64748b' }}>{item.email}</td>}
                    {visibleColumns.includes('telefono') && <td style={{ fontSize: '12px', color: '#64748b' }}>{item.telefono}</td>}

                    {/* Acciones */}
                    <td className="col-actions" style={{ textAlign: 'center' }}>
                      <button
                        type="button"
                        className="lista-action-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenExpediente(item);
                        }}
                        title="Ver expediente completo"
                      >
                        <Maximize2 size={13} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer de Paginación que cierra la cápsula */}
      <footer className="footer">
        <span>
          Mostrando {filteredIntegrantes.length ? 1 : 0}-{filteredIntegrantes.length} de {integrantes.length} integrantes registrados
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {selectedIds.size > 0 && (
            <span style={{ fontWeight: 600, color: '#0066ff' }}>
              {selectedIds.size} seleccionados
            </span>
          )}
          <button
            className="btn secondary"
            style={{ minHeight: '30px', fontSize: '12px' }}
            onClick={exportarSeleccionCsv}
          >
            Descargar Listado
          </button>
        </div>
      </footer>

      {/* BARRA FLOTANTE INFERIOR DE ACCIONES MASIVAS */}
      {selectedIds.size > 0 && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            background: '#0f172a',
            color: '#ffffff',
            borderRadius: '10px',
            padding: '8px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            boxShadow: '0 12px 35px rgba(0, 0, 0, 0.4)',
            border: '1px solid #334155',
          }}
        >
          <span style={{ fontSize: '12.5px', fontWeight: 650 }}>
            {selectedIds.size} integrantes seleccionados
          </span>

          <div style={{ width: '1px', height: '18px', background: '#334155' }} />

          <button
            onClick={() => setModalBulkSede(true)}
            style={{
              height: '30px',
              padding: '0 10px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Building2 size={13} color="#0066ff" />
            Reasignar Sede
          </button>

          <button
            onClick={() => setModalBulkEstado(true)}
            style={{
              height: '30px',
              padding: '0 10px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <UserCheck size={13} color="#22c55e" />
            Cambiar Estado
          </button>

          <button
            onClick={() => {
              onBulkReenviarInvitaciones(Array.from(selectedIds));
              setSelectedIds(new Set());
            }}
            style={{
              height: '30px',
              padding: '0 10px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Send size={13} color="#f59e0b" />
            Reenviar Invitaciones
          </button>

          <button
            onClick={exportarSeleccionCsv}
            style={{
              height: '30px',
              padding: '0 10px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '11.5px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Download size={13} />
            Exportar
          </button>

          <button
            onClick={() => setSelectedIds(new Set())}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              display: 'grid',
              placeItems: 'center',
            }}
            title="Deseleccionar todos"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* MODAL MASIVO: REASIGNAR SEDE */}
      {modalBulkSede && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 2500, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center' }}
          onClick={() => setModalBulkSede(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: '10px', padding: '20px', width: '380px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>
              Reasignar Sede a {selectedIds.size} integrantes
            </h3>
            <select
              value={targetSedeId}
              onChange={(e) => setTargetSedeId(e.target.value)}
              style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', marginBottom: '16px' }}
            >
              {sedes.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.nombre} ({s.ambito})
                </option>
              ))}
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setModalBulkSede(false)} style={{ height: '32px', padding: '0 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
              <button
                onClick={() => {
                  onBulkUpdateSede(Array.from(selectedIds), targetSedeId);
                  setModalBulkSede(false);
                  setSelectedIds(new Set());
                }}
                style={{ height: '32px', padding: '0 14px', background: '#0066ff', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 650, cursor: 'pointer' }}
              >
                Aplicar Reasignación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL MASIVO: CAMBIAR ESTADO */}
      {modalBulkEstado && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 2500, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center' }}
          onClick={() => setModalBulkEstado(false)}
        >
          <div
            style={{ background: '#fff', borderRadius: '10px', padding: '20px', width: '380px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 12px 0', fontSize: '15px', color: '#0f172a' }}>
              Cambiar Estado Operativo a {selectedIds.size} integrantes
            </h3>
            <select
              value={targetEstadoOp}
              onChange={(e) => setTargetEstadoOp(e.target.value as EstadoOperativo)}
              style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', marginBottom: '16px' }}
            >
              <option value="En funciones">En funciones</option>
              <option value="Licencia / Permiso">Licencia / Permiso</option>
              <option value="Desvinculado">Desvinculado</option>
            </select>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button onClick={() => setModalBulkEstado(false)} style={{ height: '32px', padding: '0 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
              <button
                onClick={() => {
                  onBulkUpdateEstadoOperativo(Array.from(selectedIds), targetEstadoOp);
                  setModalBulkEstado(false);
                  setSelectedIds(new Set());
                }}
                style={{ height: '32px', padding: '0 14px', background: '#0066ff', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 650, cursor: 'pointer' }}
              >
                Actualizar Estados
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
