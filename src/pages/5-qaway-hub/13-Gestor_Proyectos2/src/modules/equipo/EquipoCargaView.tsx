import React, { useState, useMemo } from 'react';
import type { Integrante, AsignacionViva, SedeFrente } from './types';
import {
  Activity,
  AlertTriangle,
  ArrowRightLeft,
  Search,
  Building2,
  X,
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

        <div className="filter-dropdown-wrap">
          <select
            value={filtroSede}
            onChange={(e) => setFiltroSede(e.target.value)}
            className="filter-card-btn"
            style={{ appearance: 'auto', paddingRight: '24px', cursor: 'pointer' }}
          >
            <option value="todas">Ubicación: Todas las sedes</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>
        </div>

        <div className="filter-dropdown-wrap">
          <select
            value={filtroNivelCarga}
            onChange={(e) => setFiltroNivelCarga(e.target.value)}
            className="filter-card-btn"
            style={{ appearance: 'auto', paddingRight: '24px', cursor: 'pointer' }}
          >
            <option value="todos">Nivel: Toda la ocupación</option>
            <option value="sobrecargado">Sobrecargados (&gt;100%)</option>
            <option value="optimo">Carga Óptima (50% - 100%)</option>
            <option value="disponible">Con Disponibilidad (&lt;50%)</option>
          </select>
        </div>

        <div style={{ flex: 1 }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ color: '#166534', background: '#dcfce7', padding: '3px 8px', borderRadius: '12px', fontWeight: 650 }}>
            {resumenGlobal.disponibles} con disponibilidad
          </span>
          {resumenGlobal.sobrecargados > 0 && (
            <span style={{ color: '#b91c1c', background: '#fee2e2', padding: '3px 8px', borderRadius: '12px', fontWeight: 650 }}>
              {resumenGlobal.sobrecargados} sobrecargados
            </span>
          )}
        </div>
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
                          style={{ fontSize: '13px', color: '#0f172a', cursor: 'pointer', textDecoration: 'underline' }}
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
