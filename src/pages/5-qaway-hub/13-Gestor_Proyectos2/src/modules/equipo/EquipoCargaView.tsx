import React, { useState, useMemo } from 'react';
import type { Integrante, AsignacionViva, SedeFrente } from './types';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRightLeft,
  Filter,
  Search,
  Building2,
  Calendar,
  ChevronRight,
  TrendingUp,
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

  // Estadísticas y cálculo objetivo por integrante
  const listaCarga = useMemo(() => {
    return integrantes.map((integ) => {
      const tareasPersona = asignaciones.filter((a) => a.integranteId === integ.id);
      const tareasActivas = tareasPersona.filter((a) => a.estado !== 'Completado');
      const esfuerzoTotal = tareasActivas.reduce((sum, a) => sum + a.esfuerzoHoras, 0);
      const capacidad = Math.max(1, integ.capacidadNominalHorasSemana);
      const porcentaje = Math.round((esfuerzoTotal / capacidad) * 100);

      let estadoCarga: 'disponible' | 'optimo' | 'alta' | 'sobrecargado' = 'optimo';
      if (porcentaje < 50) estadoCarga = 'disponible';
      else if (porcentaje <= 85) estadoCarga = 'optimo';
      else if (porcentaje <= 100) estadoCarga = 'alta';
      else estadoCarga = 'sobrecargado';

      return {
        integrante: integ,
        tareasTotal: tareasPersona.length,
        tareasActivas,
        esfuerzoTotal,
        capacidad,
        porcentaje,
        estadoCarga,
      };
    });
  }, [integrantes, asignaciones]);

  // Filtrado de la matriz
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

  // Resumen global de capacidad
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
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Indicadores de Balance de Capacidad */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '14px',
          padding: '16px 24px',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
        }}
      >
        <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
            ESFUERZO COMPROMETIDO
          </span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            {resumenGlobal.totalEsfuerzo}h <small style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>/ {resumenGlobal.totalCapacidad}h</small>
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Horas de esfuerzo activas en el equipo</span>
        </div>

        <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
            CON DISPONIBILIDAD (&lt;50%)
          </span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>
            {resumenGlobal.disponibles} integrantes
          </div>
          <span style={{ fontSize: '11px', color: '#166534' }}>Listos para absorber nuevas tareas</span>
        </div>

        <div style={{ background: resumenGlobal.sobrecargados > 0 ? '#fef2f2' : '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: resumenGlobal.sobrecargados > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: resumenGlobal.sobrecargados > 0 ? '#991b1b' : '#64748b', textTransform: 'uppercase' }}>
            SOBRECARGADOS (&gt;100%)
          </span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: resumenGlobal.sobrecargados > 0 ? '#dc2626' : '#0f172a', marginTop: '4px' }}>
            {resumenGlobal.sobrecargados} integrantes
          </div>
          <span style={{ fontSize: '11px', color: resumenGlobal.sobrecargados > 0 ? '#b91c1c' : '#64748b' }}>
            {resumenGlobal.sobrecargados > 0 ? 'Riesgo de cuello de botella' : 'Carga balanceada'}
          </span>
        </div>

        <div style={{ background: '#f0f9ff', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0369a1', textTransform: 'uppercase' }}>
            BALANCE GENERAL
          </span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0284c7', marginTop: '4px' }}>
            {Math.round((resumenGlobal.totalEsfuerzo / Math.max(1, resumenGlobal.totalCapacidad)) * 100)}%
          </div>
          <span style={{ fontSize: '11px', color: '#0369a1' }}>Ocupación promedio del padrón</span>
        </div>
      </div>

      {/* Toolbar de Filtros de Carga */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 24px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '9px' }} />
          <input
            type="text"
            placeholder="Buscar integrante..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ width: '100%', height: '32px', border: '1px solid #cbd5e1', borderRadius: '6px', paddingLeft: '30px', fontSize: '12px', boxSizing: 'border-box' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <select
            value={filtroSede}
            onChange={(e) => setFiltroSede(e.target.value)}
            style={{ height: '32px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', background: '#fff' }}
          >
            <option value="todas">Todas las sedes</option>
            {sedes.map((s) => (
              <option key={s.id} value={s.id}>{s.nombre}</option>
            ))}
          </select>

          <select
            value={filtroNivelCarga}
            onChange={(e) => setFiltroNivelCarga(e.target.value)}
            style={{ height: '32px', padding: '0 10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '12px', background: '#fff' }}
          >
            <option value="todos">Todos los niveles de ocupación</option>
            <option value="sobrecargado">Solo Sobrecargados (&gt;100%)</option>
            <option value="optimo">Carga Óptima (50% - 100%)</option>
            <option value="disponible">Con Disponibilidad (&lt;50%)</option>
          </select>
        </div>
      </div>

      {/* Matriz de Capacidad y Tareas Concurrentes */}
      <div style={{ width: '100%', overflowX: 'auto', background: '#ffffff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '950px' }}>
          <thead>
            <tr style={{ height: '40px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
              <th style={{ padding: '0 20px' }}>Integrante</th>
              <th style={{ padding: '0 16px' }}>Sede</th>
              <th style={{ padding: '0 16px' }}>Capacidad Base</th>
              <th style={{ padding: '0 16px' }}>Esfuerzo Comprometido</th>
              <th style={{ padding: '0 16px', minWidth: '180px' }}>Índice de Ocupación</th>
              <th style={{ padding: '0 16px' }}>Tareas Activas Concurrentes</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((row) => {
              const { integrante, tareasActivas, esfuerzoTotal, capacidad, porcentaje, estadoCarga } = row;

              return (
                <tr
                  key={integrante.id}
                  style={{ height: '54px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}
                >
                  {/* Integrante */}
                  <td style={{ padding: '0 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#1e293b',
                          color: '#fff',
                          fontSize: '11px',
                          fontWeight: 700,
                          display: 'grid',
                          placeItems: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {integrante.iniciales}
                      </div>
                      <div>
                        <b
                          onClick={() => onSelectIntegrante(integrante.id)}
                          style={{ display: 'block', fontSize: '13px', color: '#0f172a', cursor: 'pointer', textDecoration: 'underline' }}
                        >
                          {integrante.nombreCompleto}
                        </b>
                        <small style={{ color: '#64748b', fontSize: '11px' }}>{integrante.cargo}</small>
                      </div>
                    </div>
                  </td>

                  {/* Sede */}
                  <td style={{ padding: '0 16px', fontSize: '12px', color: '#334155' }}>
                    {integrante.sedeNombre}
                  </td>

                  {/* Capacidad Base */}
                  <td style={{ padding: '0 16px', fontSize: '12px', color: '#0f172a', fontWeight: 600 }}>
                    {capacidad}h / semana
                  </td>

                  {/* Esfuerzo */}
                  <td style={{ padding: '0 16px', fontSize: '12.5px', color: '#0f172a', fontWeight: 650 }}>
                    {esfuerzoTotal} horas
                  </td>

                  {/* Barra de Ocupación */}
                  <td style={{ padding: '0 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(100, porcentaje)}%`,
                            height: '100%',
                            background:
                              porcentaje > 100
                                ? '#ef4444'
                                : porcentaje > 85
                                ? '#f59e0b'
                                : porcentaje < 50
                                ? '#0284c7'
                                : '#22c55e',
                          }}
                        />
                      </div>
                      <b
                        style={{
                          fontSize: '12px',
                          color: porcentaje > 100 ? '#dc2626' : '#0f172a',
                          minWidth: '40px',
                        }}
                      >
                        {porcentaje}%
                      </b>
                    </div>
                  </td>

                  {/* Tareas Concurrentes con Botón Rebalanceo */}
                  <td style={{ padding: '0 16px' }}>
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
                            <span>{tarea.titulo.length > 28 ? tarea.titulo.slice(0, 28) + '...' : tarea.titulo}</span>
                            <span style={{ fontWeight: 700, color: '#0284c7' }}>({tarea.esfuerzoHoras}h)</span>

                            {porcentaje > 85 && (
                              <button
                                onClick={() => {
                                  setModalRebalanceo({ integranteOrigen: integrante, tarea });
                                  // Sugerir el integrante con menor carga
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
                                  color: '#0284c7',
                                  display: 'flex',
                                  alignItems: 'center',
                                }}
                                title="Rebalancear: Reasignar tarea a otro colega con disponibilidad"
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

      {/* MODAL DE REBALANCEO DE TAREA */}
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
              <b>{modalRebalanceo.integranteOrigen.nombreCompleto}</b> para mitigar sobrecarga.
            </p>

            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Reasignar a integrante con capacidad:
            </label>
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
                style={{ height: '32px', padding: '0 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRebalanceo}
                style={{ height: '32px', padding: '0 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 650, cursor: 'pointer' }}
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
