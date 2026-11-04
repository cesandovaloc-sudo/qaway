import React, { useMemo, useState } from 'react';
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
  const [menuAbiertoId, setMenuAbiertoId] = useState<string | null>(null);
  const [modalBulkSede, setModalBulkSede] = useState(false);
  const [modalBulkEstado, setModalBulkEstado] = useState(false);
  const [targetSedeId, setTargetSedeId] = useState(sedes[0]?.id || '');
  const [targetEstadoOp, setTargetEstadoOp] = useState<EstadoOperativo>('En funciones');
  const [sortField, setSortField] = useState<keyof Integrante>('nombreCompleto');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

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
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Barra de Presets de Vistas Guardadas */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 24px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', marginRight: '6px', textTransform: 'uppercase' }}>
            Vistas del Directorio:
          </span>
          {presets.map((preset) => {
            const isSel = preset.id === activePresetId;
            return (
              <button
                key={preset.id}
                onClick={() => onSelectPreset(preset)}
                style={{
                  height: '28px',
                  padding: '0 10px',
                  borderRadius: '14px',
                  border: isSel ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  background: isSel ? '#e0f2fe' : '#f8fafc',
                  color: isSel ? '#0369a1' : '#475569',
                  fontSize: '11.5px',
                  fontWeight: isSel ? 700 : 500,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease',
                }}
              >
                {preset.esPredefinido && <Bookmark size={11} color={isSel ? '#0284c7' : '#94a3b8'} />}
                {preset.nombre}
              </button>
            );
          })}
        </div>

        <button
          onClick={onOpenColumnasModal}
          style={{
            height: '28px',
            padding: '0 10px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            background: '#ffffff',
            color: '#334155',
            fontSize: '11.5px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          <SlidersHorizontal size={13} color="#0284c7" />
          Columnas ({visibleColumns.length})
        </button>
      </div>

      {/* Toolbar de Filtros Combinados y Búsqueda */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          padding: '12px 24px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          flexWrap: 'wrap',
        }}
      >
        {/* Buscador Textual en Vivo */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={15} color="#64748b" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Buscar por nombre, correo, cargo, doc..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '34px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              paddingLeft: '32px',
              paddingRight: '10px',
              fontSize: '12.5px',
              background: '#ffffff',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Filtros Desplegables */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Filtro por Sede */}
          <select
            value={sedeFilter}
            onChange={(e) => setSedeFilter(e.target.value)}
            style={{
              height: '34px',
              padding: '0 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              background: '#ffffff',
              fontSize: '12px',
              fontWeight: 500,
              color: '#334155',
            }}
          >
            <option value="todas">Todas las sedes</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nombre}
              </option>
            ))}
          </select>

          {/* Filtro por Estado Operativo */}
          <select
            value={estadoOpFilter}
            onChange={(e) => setEstadoOpFilter(e.target.value)}
            style={{
              height: '34px',
              padding: '0 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              background: '#ffffff',
              fontSize: '12px',
              fontWeight: 500,
              color: '#334155',
            }}
          >
            <option value="todos">Todos los estados laborales</option>
            <option value="En funciones">En funciones</option>
            <option value="Licencia / Permiso">Licencia / Permiso</option>
            <option value="Desvinculado">Desvinculado</option>
          </select>

          {/* Filtro por Estado de Cuenta */}
          <select
            value={estadoCuentaFilter}
            onChange={(e) => setEstadoCuentaFilter(e.target.value)}
            style={{
              height: '34px',
              padding: '0 10px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              background: '#ffffff',
              fontSize: '12px',
              fontWeight: 500,
              color: '#334155',
            }}
          >
            <option value="todos">Todos los accesos de cuenta</option>
            <option value="Habilitada">Habilitada</option>
            <option value="Invitación Pendiente">Invitación Pendiente</option>
            <option value="Suspendida">Suspendida</option>
          </select>

          {(searchQuery || sedeFilter !== 'todas' || estadoOpFilter !== 'todos' || estadoCuentaFilter !== 'todos') && (
            <button
              onClick={onClearFilters}
              style={{
                height: '34px',
                padding: '0 10px',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                background: '#ffffff',
                color: '#ef4444',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Limpiar
            </button>
          )}

          <button
            onClick={exportarSeleccionCsv}
            style={{
              height: '34px',
              padding: '0 12px',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              background: '#ffffff',
              color: '#1e293b',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabla Maestra Interactiva */}
      <div style={{ width: '100%', overflowX: 'auto', background: '#ffffff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
          <thead>
            <tr style={{ height: '42px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              {/* Checkbox Columna Maestra */}
              <th style={{ width: '44px', textAlign: 'center', padding: '0 8px' }}>
                <div
                  onClick={toggleSelectAll}
                  style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                  title="Seleccionar o desmarcar todos"
                >
                  {allFilteredSelected ? (
                    <CheckSquare size={16} color="#0284c7" />
                  ) : (
                    <Square size={16} color="#94a3b8" />
                  )}
                </div>
              </th>

              {visibleColumns.includes('integrante') && (
                <th
                  onClick={() => handleSort('nombreCompleto')}
                  style={{ padding: '0 14px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Integrante
                    <ArrowUpDown size={12} color="#94a3b8" />
                  </div>
                </th>
              )}

              {visibleColumns.includes('cargo') && (
                <th
                  onClick={() => handleSort('cargo')}
                  style={{ padding: '0 14px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Cargo Funcional
                    <ArrowUpDown size={12} color="#94a3b8" />
                  </div>
                </th>
              )}

              {visibleColumns.includes('sede') && (
                <th
                  onClick={() => handleSort('sedeNombre')}
                  style={{ padding: '0 14px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Sede / Frente
                    <ArrowUpDown size={12} color="#94a3b8" />
                  </div>
                </th>
              )}

              {visibleColumns.includes('estadoOperativo') && (
                <th
                  onClick={() => handleSort('estadoOperativo')}
                  style={{ padding: '0 14px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Estado Laboral
                    <ArrowUpDown size={12} color="#94a3b8" />
                  </div>
                </th>
              )}

              {visibleColumns.includes('estadoCuenta') && (
                <th
                  onClick={() => handleSort('estadoCuenta')}
                  style={{ padding: '0 14px', cursor: 'pointer' }}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    Cuenta de Acceso
                    <ArrowUpDown size={12} color="#94a3b8" />
                  </div>
                </th>
              )}

              {visibleColumns.includes('carga') && (
                <th style={{ padding: '0 14px' }}>
                  Carga Operativa
                </th>
              )}

              {visibleColumns.includes('email') && (
                <th style={{ padding: '0 14px' }}>Correo</th>
              )}

              {visibleColumns.includes('telefono') && (
                <th style={{ padding: '0 14px' }}>Teléfono</th>
              )}

              <th style={{ width: '48px', padding: '0 8px', textAlign: 'center' }}></th>
            </tr>
          </thead>

          <tbody>
            {filteredIntegrantes.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ padding: '48px 20px', textAlign: 'center', color: '#64748b' }}>
                  <Filter size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: '0 0 6px 0', fontSize: '14px', fontWeight: 600, color: '#0f172a' }}>
                    No se encontraron integrantes
                  </p>
                  <span style={{ fontSize: '12.5px', color: '#64748b' }}>
                    Intenta ajustar los filtros aplicados o limpia la búsqueda.
                  </span>
                  <div style={{ marginTop: '12px' }}>
                    <button
                      onClick={onClearFilters}
                      style={{
                        height: '30px',
                        padding: '0 14px',
                        background: '#0284c7',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 650,
                        cursor: 'pointer',
                      }}
                    >
                      Restablecer Filtros
                    </button>
                  </div>
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
                    style={{
                      height: '48px',
                      borderBottom: '1px solid #e2e8f0',
                      background: isSelectedRow ? '#f0f9ff' : isChecked ? '#f8fafc' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'background 0.12s ease',
                    }}
                  >
                    {/* Checkbox */}
                    <td style={{ textAlign: 'center', padding: '0 8px' }}>
                      <div
                        onClick={(e) => toggleSelectOne(item.id, e)}
                        style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}
                      >
                        {isChecked ? (
                          <CheckSquare size={16} color="#0284c7" />
                        ) : (
                          <Square size={16} color="#cbd5e1" />
                        )}
                      </div>
                    </td>

                    {/* Integrante (Avatar + Nombre + Correo) */}
                    {visibleColumns.includes('integrante') && (
                      <td style={{ padding: '0 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          {item.avatarUrl ? (
                            <img
                              src={item.avatarUrl}
                              alt={item.nombreCompleto}
                              style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: '#1e293b',
                                color: '#ffffff',
                                fontSize: '11.5px',
                                fontWeight: 700,
                                display: 'grid',
                                placeItems: 'center',
                                flexShrink: 0,
                              }}
                            >
                              {item.iniciales}
                            </div>
                          )}
                          <div style={{ minWidth: 0 }}>
                            <b style={{ display: 'block', fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.nombreCompleto}
                            </b>
                            <small style={{ display: 'block', fontSize: '11px', color: '#64748b' }}>
                              {item.email}
                            </small>
                          </div>
                        </div>
                      </td>
                    )}

                    {/* Cargo Funcional */}
                    {visibleColumns.includes('cargo') && (
                      <td style={{ padding: '0 14px', fontSize: '12.5px', color: '#334155', fontWeight: 500 }}>
                        {item.cargo}
                      </td>
                    )}

                    {/* Sede / Frente */}
                    {visibleColumns.includes('sede') && (
                      <td style={{ padding: '0 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#0f172a', fontWeight: 600 }}>
                          <Building2 size={13} color="#0284c7" />
                          <span>{item.sedeNombre}</span>
                        </div>
                      </td>
                    )}

                    {/* Estado Operativo */}
                    {visibleColumns.includes('estadoOperativo') && (
                      <td style={{ padding: '0 14px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 650,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            background:
                              item.estadoOperativo === 'En funciones'
                                ? '#dcfce7'
                                : item.estadoOperativo === 'Licencia / Permiso'
                                ? '#fef3c7'
                                : '#f1f5f9',
                            color:
                              item.estadoOperativo === 'En funciones'
                                ? '#15803d'
                                : item.estadoOperativo === 'Licencia / Permiso'
                                ? '#b45309'
                                : '#475569',
                          }}
                        >
                          <span
                            style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background:
                                item.estadoOperativo === 'En funciones'
                                  ? '#22c55e'
                                  : item.estadoOperativo === 'Licencia / Permiso'
                                  ? '#f59e0b'
                                  : '#94a3b8',
                            }}
                          />
                          {item.estadoOperativo}
                        </span>
                      </td>
                    )}

                    {/* Estado de Cuenta */}
                    {visibleColumns.includes('estadoCuenta') && (
                      <td style={{ padding: '0 14px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 600,
                            padding: '2px 8px',
                            borderRadius: '12px',
                            background:
                              item.estadoCuenta === 'Habilitada'
                                ? '#e0f2fe'
                                : item.estadoCuenta === 'Invitación Pendiente'
                                ? '#ffedd5'
                                : '#fee2e2',
                            color:
                              item.estadoCuenta === 'Habilitada'
                                ? '#0369a1'
                                : item.estadoCuenta === 'Invitación Pendiente'
                                ? '#c2410c'
                                : '#b91c1c',
                          }}
                        >
                          {item.estadoCuenta}
                        </span>
                      </td>
                    )}

                    {/* Carga Operativa */}
                    {visibleColumns.includes('carga') && (
                      <td style={{ padding: '0 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${Math.min(100, carga.porcentaje)}%`,
                                height: '100%',
                                background: carga.porcentaje > 100 ? '#ef4444' : carga.porcentaje > 75 ? '#f59e0b' : '#0284c7',
                              }}
                            />
                          </div>
                          <span style={{ fontSize: '11px', fontWeight: 650, color: carga.porcentaje > 100 ? '#ef4444' : '#0f172a' }}>
                            {carga.porcentaje}%
                          </span>
                          <span style={{ fontSize: '10.5px', color: '#64748b' }}>
                            ({carga.activas} t.)
                          </span>
                        </div>
                      </td>
                    )}

                    {visibleColumns.includes('email') && (
                      <td style={{ padding: '0 14px', fontSize: '12px', color: '#64748b' }}>
                        {item.email}
                      </td>
                    )}

                    {visibleColumns.includes('telefono') && (
                      <td style={{ padding: '0 14px', fontSize: '12px', color: '#64748b' }}>
                        {item.telefono}
                      </td>
                    )}

                    {/* Acciones */}
                    <td style={{ padding: '0 8px', textAlign: 'center' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenExpediente(item);
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#64748b',
                          padding: '4px',
                          borderRadius: '4px',
                        }}
                        title="Ver expediente completo"
                      >
                        <Maximize2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pie del Directorio: Contador */}
      <div
        style={{
          padding: '10px 24px',
          background: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          fontSize: '11.5px',
          color: '#64748b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>
          Mostrando {filteredIntegrantes.length} de {integrantes.length} integrantes registrados
        </span>
        <span>
          {selectedIds.size > 0 && `${selectedIds.size} seleccionados`}
        </span>
      </div>

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
            animation: 'fadeInPop 0.2s ease-out',
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
            <Building2 size={13} color="#0284c7" />
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
                style={{ height: '32px', padding: '0 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 650, cursor: 'pointer' }}
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
                style={{ height: '32px', padding: '0 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 650, cursor: 'pointer' }}
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
