import React, { useState, useMemo, useEffect } from 'react';
import type { Integrante, AsignacionViva, SedeFrente } from './types';
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  Search,
  Building2,
  X,
  ChevronDown,
  Check,
} from 'lucide-react';

interface EquipoCargaViewProps {
  integrantes: Integrante[];
  asignaciones: AsignacionViva[];
  sedes: SedeFrente[];
  onSelectIntegrante: (id: string) => void;
  onReasignarTarea: (asignacionId: string, nuevoIntegranteId: string) => void;
}

export default function EquipoCargaView({
  integrantes,
  asignaciones,
  sedes,
  onSelectIntegrante,
  onReasignarTarea,
}: EquipoCargaViewProps) {
  const [filtroSede, setFiltroSede] = useState('todas');
  const [filtroNivelCarga, setFiltroNivelCarga] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'sede' | 'nivel' | null>(null);

  useEffect(() => {
    const handleDocClick = () => setOpenDropdown(null);
    document.addEventListener('mousedown', handleDocClick);
    return () => document.removeEventListener('mousedown', handleDocClick);
  }, []);

  const [modalRebalanceo, setModalRebalanceo] = useState<{
    integranteOrigen: Integrante;
    tarea: AsignacionViva;
  } | null>(null);
  const [targetIntegranteId, setTargetIntegranteId] = useState<string>('');

  const listaCarga = useMemo(() => {
    return integrantes.map((integ) => {
      const tareasPersona = asignaciones.filter((a) => a.integranteId === integ.id);
      const tareasActivas = tareasPersona.filter((a) => a.estado !== 'Completado');
      const esfuerzoTotal = tareasActivas.reduce((sum, a) => sum + a.esfuerzoHoras, 0);
      const capacidad = Math.max(1, integ.capacidadNominalHorasSemana);
      const porcentaje = Math.round((esfuerzoTotal / capacidad) * 100);

      return {
        integrante: integ,
        tareasTotal: tareasPersona.length,
        tareasActivas,
        esfuerzoTotal,
        capacidad,
        porcentaje,
      };
    });
  }, [integrantes, asignaciones]);

  const filteredList = useMemo(() => {
    return listaCarga.filter((item) => {
      const matchesSede = filtroSede === 'todas' || item.integrante.sedeId === filtroSede;
      const matchesCarga =
        filtroNivelCarga === 'todos' ||
        (filtroNivelCarga === 'sobrecargado' && item.porcentaje > 100) ||
        (filtroNivelCarga === 'disponible' && item.porcentaje < 50) ||
        (filtroNivelCarga === 'optimo' && item.porcentaje >= 50 && item.porcentaje <= 100);

      const matchesQuery =
        !busqueda.trim() ||
        item.integrante.nombreCompleto.toLowerCase().includes(busqueda.toLowerCase()) ||
        item.integrante.cargo.toLowerCase().includes(busqueda.toLowerCase());

      return matchesSede && matchesCarga && matchesQuery;
    });
  }, [listaCarga, filtroSede, filtroNivelCarga, busqueda]);

  const resumenGlobal = useMemo(() => {
    const totalEsfuerzo = listaCarga.reduce((sum, i) => sum + i.esfuerzoTotal, 0);
    const totalCapacidad = listaCarga.reduce((sum, i) => sum + i.capacidad, 0);
    const sobrecargados = listaCarga.filter((i) => i.porcentaje > 100).length;
    const disponibles = listaCarga.filter((i) => i.porcentaje < 50).length;

    return { totalEsfuerzo, totalCapacidad, sobrecargados, disponibles };
  }, [listaCarga]);

  const handleConfirmRebalanceo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalRebalanceo || !targetIntegranteId) return;
    onReasignarTarea(modalRebalanceo.tarea.id, targetIntegranteId);
    setModalRebalanceo(null);
  };

  return (
    <div className="cronograma-lista-container" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      {/* Barra de Filtros Nativa */}
      <div className="filters">
        <label className="search">
          <Search size={16} />
          <input
            placeholder="Buscar integrante en la matriz de capacidad..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
          />
          {busqueda && (
            <button onClick={() => setBusqueda('')}>
              <X size={14} />
            </button>
          )}
        </label>

        {/* Filtro Ubicación con estilo oficial Cronograma */}
        <div className="filter-dropdown-wrap">
          <button
            type="button"
            className={`filter-card-btn ${openDropdown === 'sede' ? 'active' : ''} ${filtroSede !== 'todas' ? 'filtered' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === 'sede' ? null : 'sede');
            }}
            title="Filtrar por sede"
          >
            <div className="filter-card-copy">
              <small>Ubicación</small>
              <span>{sedes.find((s) => s.id === filtroSede)?.nombre || 'Todas las sedes'}</span>
            </div>
            <ChevronDown size={14} className="filter-chevron" />
          </button>
          {openDropdown === 'sede' && (
            <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 220 }}>
              <div className="filter-popover-title">Filtrar por Ubicación</div>
              <div className="filter-popover-list">
                <button
                  type="button"
                  className={`filter-item-btn ${filtroSede === 'todas' ? 'selected' : ''}`}
                  onClick={() => {
                    setFiltroSede('todas');
                    setOpenDropdown(null);
                  }}
                >
                  <span>Todas las sedes</span>
                  {filtroSede === 'todas' && <Check size={14} className="item-check" />}
                </button>
                {sedes.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`filter-item-btn ${filtroSede === s.id ? 'selected' : ''}`}
                    onClick={() => {
                      setFiltroSede(s.id);
                      setOpenDropdown(null);
                    }}
                  >
                    <span>{s.nombre}</span>
                    {filtroSede === s.id && <Check size={14} className="item-check" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Filtro Nivel de Ocupación con estilo oficial Cronograma */}
        <div className="filter-dropdown-wrap">
          <button
            type="button"
            className={`filter-card-btn ${openDropdown === 'nivel' ? 'active' : ''} ${filtroNivelCarga !== 'todos' ? 'filtered' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setOpenDropdown(openDropdown === 'nivel' ? null : 'nivel');
            }}
            title="Filtrar por nivel de ocupación"
          >
            <div className="filter-card-copy">
              <small>Nivel</small>
              <span>
                {filtroNivelCarga === 'todos'
                  ? 'Toda la ocupación'
                  : filtroNivelCarga === 'sobrecargado'
                  ? 'Sobrecargados (>100%)'
                  : filtroNivelCarga === 'optimo'
                  ? 'Carga Óptima (50%-100%)'
                  : 'Con Disponibilidad (<50%)'}
              </span>
            </div>
            <ChevronDown size={14} className="filter-chevron" />
          </button>
          {openDropdown === 'nivel' && (
            <div className="filter-card-popover" onClick={(e) => e.stopPropagation()} style={{ minWidth: 230 }}>
              <div className="filter-popover-title">Filtrar por Nivel de Carga</div>
              <div className="filter-popover-list">
                {[
                  { id: 'todos', label: 'Toda la ocupación' },
                  { id: 'sobrecargado', label: 'Sobrecargados (>100%)' },
                  { id: 'optimo', label: 'Carga Óptima (50% - 100%)' },
                  { id: 'disponible', label: 'Con Disponibilidad (<50%)' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`filter-item-btn ${filtroNivelCarga === opt.id ? 'selected' : ''}`}
                    onClick={() => {
                      setFiltroNivelCarga(opt.id);
                      setOpenDropdown(null);
                    }}
                  >
                    <span>{opt.label}</span>
                    {filtroNivelCarga === opt.id && <Check size={14} className="item-check" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {(busqueda || filtroSede !== 'todas' || filtroNivelCarga !== 'todos') && (
          <button
            className="clear-btn"
            onClick={() => {
              setBusqueda('');
              setFiltroSede('todas');
              setFiltroNivelCarga('todos');
            }}
            title="Limpiar todos los filtros"
          >
            Limpiar
          </button>
        )}

        <div style={{ flex: 1 }} />
      </div>

      {/* Tabla de Capacidad dentro del Contenedor de Scroll */}
      <div className="cronograma-lista-table-wrap" style={{ flex: 1, overflow: 'auto' }}>
        <table className="cronograma-lista-table">
          <thead>
            <tr>
              <th className="col-name" style={{ paddingLeft: '16px' }}>Integrante</th>
              <th className="col-region">Frente Asignado</th>
              <th className="col-dur">Capacidad Base</th>
              <th className="col-dur">Esfuerzo Comprometido</th>
              <th className="col-progress" style={{ minWidth: '160px' }}>Índice de Carga</th>
              <th>Tareas Concurrentes Activas</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((row) => {
              const { integrante, tareasActivas, esfuerzoTotal, capacidad, porcentaje } = row;

              return (
                <tr key={integrante.id} className="lista-row">
                  <td className="col-name" style={{ paddingLeft: '16px' }}>
                    <div className="gestor-cell" style={{ gap: '10px' }}>
                      <div className="gestor-avatar" style={{ background: '#1e293b' }}>
                        {integrante.iniciales}
                      </div>
                      <div>
                        <b
                          onClick={() => onSelectIntegrante(integrante.id)}
                          style={{ fontSize: '13px', color: '#0f172a', cursor: 'pointer', fontWeight: 650 }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = '#0066ff')}
                          onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
                        >
                          {integrante.nombreCompleto}
                        </b>
                        <small style={{ color: '#64748b', fontSize: '11px', display: 'block' }}>{integrante.cargo}</small>
                      </div>
                    </div>
                  </td>

                  <td className="col-region">
                    <span className="region-text">{integrante.sedeNombre}</span>
                  </td>

                  <td className="col-dur" style={{ fontWeight: 600 }}>
                    {capacidad}h / semana
                  </td>

                  <td className="col-dur" style={{ fontWeight: 700, color: '#0f172a' }}>
                    {esfuerzoTotal} horas
                  </td>

                  <td className="col-progress">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '80px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, porcentaje)}%`,
                            height: '100%',
                            background:
                              porcentaje > 100
                                ? '#dc2626'
                                : porcentaje > 80
                                ? '#f59e0b'
                                : porcentaje < 50
                                ? '#0066ff'
                                : '#10b981',
                          }}
                        />
                      </div>
                      <b style={{ fontSize: '11.5px', color: porcentaje > 100 ? '#dc2626' : '#0f172a' }}>
                        {porcentaje}%
                      </b>
                    </div>
                  </td>

                  <td>
                    {tareasActivas.length === 0 ? (
                      <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>Sin tareas concurrentes</span>
                    ) : (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {tareasActivas.map((tarea) => (
                          <div
                            key={tarea.id}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              background: '#f8fafc',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              padding: '2px 8px',
                              fontSize: '11px',
                              color: '#334155',
                            }}
                          >
                            <span>{tarea.titulo.length > 26 ? tarea.titulo.slice(0, 26) + '...' : tarea.titulo}</span>
                            <span style={{ fontWeight: 700, color: '#0066ff' }}>({tarea.esfuerzoHoras}h)</span>

                            {porcentaje > 85 && (
                              <button
                                onClick={() => {
                                  setModalRebalanceo({ integranteOrigen: integrante, tarea });
                                  const disponibles = listaCarga
                                    .filter((l) => l.integrante.id !== integrante.id)
                                    .sort((a, b) => a.porcentaje - b.porcentaje);
                                  setTargetIntegranteId(disponibles[0]?.integrante.id || '');
                                }}
                                style={{
                                  border: 'none',
                                  background: 'none',
                                  cursor: 'pointer',
                                  padding: '1px',
                                  color: '#0066ff',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Rebalancear tarea"
                              >
                                <ArrowRightLeft size={11} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer que cierra la cápsula */}
      <footer className="footer">
        <span>Balance de Capacidad: {resumenGlobal.totalEsfuerzo}h esfuerzo asignado / {resumenGlobal.totalCapacidad}h capacidad base</span>
        <span>Ocupación global: {Math.round((resumenGlobal.totalEsfuerzo / Math.max(1, resumenGlobal.totalCapacidad)) * 100)}%</span>
      </footer>

      {/* Modal de Rebalanceo */}
      {modalRebalanceo && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 2500, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center' }}
          onClick={() => setModalRebalanceo(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '10px', padding: '22px', width: '420px', boxShadow: '0 20px 45px rgba(0,0,0,0.25)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0f172a' }}>
              Rebalancear Carga Operativa
            </h3>
            <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: '#64748b' }}>
              Transferir la tarea <b>"{modalRebalanceo.tarea.titulo}"</b> ({modalRebalanceo.tarea.esfuerzoHoras}h) de{' '}
              <b>{modalRebalanceo.integranteOrigen.nombreCompleto}</b>.
            </p>

            <select
              value={targetIntegranteId}
              onChange={(e) => setTargetIntegranteId(e.target.value)}
              style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', marginBottom: '16px' }}
            >
              {listaCarga
                .filter((l) => l.integrante.id !== modalRebalanceo.integranteOrigen.id)
                .sort((a, b) => a.porcentaje - b.porcentaje)
                .map((l) => (
                  <option key={l.integrante.id} value={l.integrante.id}>
                    {l.integrante.nombreCompleto} ({l.porcentaje}% ocupación · {l.integrante.sedeNombre})
                  </option>
                ))}
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setModalRebalanceo(null)}
                className="btn secondary"
                style={{ height: '32px' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRebalanceo}
                className="btn primary"
                style={{ height: '32px' }}
              >
                Reasignar Tarea
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
