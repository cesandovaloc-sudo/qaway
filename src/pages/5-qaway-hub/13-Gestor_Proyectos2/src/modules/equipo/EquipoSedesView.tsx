import React, { useState } from 'react';
import type { SedeFrente, Integrante } from './types';
import {
  Building2,
  MapPin,
  Users,
  AlertTriangle,
  ArrowRightLeft,
  Crown,
  Search,
} from 'lucide-react';

interface EquipoSedesViewProps {
  sedes: SedeFrente[];
  integrantes: Integrante[];
  onSelectIntegrante: (id: string) => void;
  onUpdateIntegrante: (updated: Integrante) => void;
  onUpdateSede: (updated: SedeFrente) => void;
}

export default function EquipoSedesView({
  sedes,
  integrantes,
  onSelectIntegrante,
  onUpdateIntegrante,
  onUpdateSede,
}: EquipoSedesViewProps) {
  const [selectedSedeId, setSelectedSedeId] = useState<string>(sedes[0]?.id || '');
  const [busquedaSede, setBusquedaSede] = useState('');
  const [modalTransferir, setModalTransferir] = useState<Integrante | null>(null);
  const [targetSedeId, setTargetSedeId] = useState<string>('');

  // Sincronización reactiva con sedes de Supabase (evita IDs huérfanos o stale)
  React.useEffect(() => {
    if (!selectedSedeId && sedes.length > 0 && sedes[0]) {
      setSelectedSedeId(sedes[0].id);
    } else if (selectedSedeId && !sedes.some((s) => s.id === selectedSedeId) && sedes.length > 0 && sedes[0]) {
      setSelectedSedeId(sedes[0].id);
    }
  }, [sedes, selectedSedeId]);

  const activeSede = sedes.find((s) => s.id === selectedSedeId) || sedes[0];

  const getIntegrantesDeSede = (sedeId: string) => {
    return integrantes.filter((i) => i.sedeId === sedeId);
  };

  const integrantesActiveSede = getIntegrantesDeSede(activeSede?.id || '');

  const metricasCobertura = React.useMemo(() => {
    const totalSedes = sedes.length;
    let cubiertas = 0;
    let deficit = 0;
    let desatendidas = 0;

    sedes.forEach((s) => {
      const cant = getIntegrantesDeSede(s.id).length;
      if (cant === 0) desatendidas++;
      else if (cant >= s.dotacionRequerida) cubiertas++;
      else deficit++;
    });

    return { totalSedes, cubiertas, deficit, desatendidas };
  }, [sedes, integrantes]);

  const handleTransferir = (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTransferir || !targetSedeId) return;

    const nuevaSede = sedes.find((s) => s.id === targetSedeId);
    if (!nuevaSede) return;

    const updated: Integrante = {
      ...modalTransferir,
      sedeId: nuevaSede.id,
      sedeNombre: nuevaSede.nombre,
      historial: [
        {
          id: 'his-' + Date.now(),
          integranteId: modalTransferir.id,
          fechaHora: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
          tipoEvento: 'reasignacion_sede',
          descripcion: `Transferido del frente ${modalTransferir.sedeNombre} al frente ${nuevaSede.nombre}`,
          autorNombre: 'Coordinador General',
          valorAnterior: modalTransferir.sedeNombre,
          valorNuevo: nuevaSede.nombre,
        },
        ...(modalTransferir.historial || []),
      ],
    };

    onUpdateIntegrante(updated);
    setModalTransferir(null);
  };

  const handleDesignarResponsable = (integrante: Integrante) => {
    if (!activeSede) return;
    const updatedSede: SedeFrente = {
      ...activeSede,
      responsableId: integrante.id,
      responsableNombre: integrante.nombreCompleto,
    };
    onUpdateSede(updatedSede);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
      {/* Barra de Filtros Nativa */}
      <div className="filters">
        <label className="search">
          <Search size={16} />
          <input
            placeholder="Buscar frente o sede operativa..."
            value={busquedaSede}
            onChange={(e) => setBusquedaSede(e.target.value)}
          />
        </label>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
          <span style={{ color: '#166534', background: '#dcfce7', padding: '3px 8px', borderRadius: '12px', fontWeight: 650 }}>
            {metricasCobertura.cubiertas} Cubiertas
          </span>
          <span style={{ color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '12px', fontWeight: 650 }}>
            {metricasCobertura.deficit} Con Déficit
          </span>
          {metricasCobertura.desatendidas > 0 && (
            <span style={{ color: '#b91c1c', background: '#fee2e2', padding: '3px 8px', borderRadius: '12px', fontWeight: 650 }}>
              {metricasCobertura.desatendidas} Desatendidas
            </span>
          )}
        </div>
      </div>

      {/* Contenedor Principal en Dos Columnas Sincronizadas */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden', background: '#f8fafc' }}>
        {/* Columna Izquierda: Catálogo de Sedes */}
        <div style={{ width: '360px', borderRight: '1px solid #e2e8f0', background: '#ffffff', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto', flexShrink: 0 }}>
          {sedes
            .filter((s) => s.nombre.toLowerCase().includes(busquedaSede.toLowerCase()) || s.ambito.toLowerCase().includes(busquedaSede.toLowerCase()))
            .map((sede) => {
              const isSel = sede.id === activeSede?.id;
              const integrantesSede = getIntegrantesDeSede(sede.id);
              const porcentaje = Math.round((integrantesSede.length / Math.max(1, sede.dotacionRequerida)) * 100);
              const esDesatendida = integrantesSede.length === 0;

              return (
                <div
                  key={sede.id}
                  onClick={() => setSelectedSedeId(sede.id)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: '8px',
                    border: isSel ? '2px solid #0066ff' : '1px solid #e2e8f0',
                    background: isSel ? '#f0f9ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontSize: '10.5px', fontWeight: 700, color: isSel ? '#0066ff' : '#64748b', textTransform: 'uppercase' }}>
                        {sede.codigo}
                      </div>
                      <h4 style={{ margin: '2px 0 0 0', fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                        {sede.nombre}
                      </h4>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>{sede.ambito}</span>
                    </div>

                    <span
                      className={`status-pill ${
                        esDesatendida ? 'badge-late' : porcentaje >= 100 ? 'badge-complete' : 'badge-progress'
                      }`}
                      style={{ fontSize: '10.5px' }}
                    >
                      {esDesatendida ? '0%' : `${porcentaje}%`}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                    <span>Personal: {integrantesSede.length} / {sede.dotacionRequerida}</span>
                    <span>Líder: {sede.responsableNombre?.split(' ')[0] || 'Sin asignar'}</span>
                  </div>
                </div>
              );
            })}
        </div>

        {/* Columna Derecha: Detalle de Sede y Personal Adscrito */}
        <div style={{ flex: 1, padding: '18px 22px', overflowY: 'auto' }}>
          {activeSede && (
            <div>
              {/* Tarjeta de Encabezado de la Sede */}
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '16px 18px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0066ff', textTransform: 'uppercase' }}>
                      FRENTE OPERATIVO ACTIVO
                    </span>
                    <h2 style={{ margin: '2px 0 0 0', fontSize: '17px', fontWeight: 700, color: '#0f172a' }}>
                      {activeSede.nombre}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      <MapPin size={13} color="#0066ff" />
                      <span>{activeSede.direccion || 'Dirección de frente registrada'} · {activeSede.ambito}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Líder de Frente:</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'flex-end', marginTop: '2px' }}>
                      <Crown size={13} color="#f59e0b" />
                      {activeSede.responsableNombre || 'Sin asignar'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Personal en este Frente */}
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <h3 style={{ margin: 0, fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                    Personal Adscrito ({integrantesActiveSede.length} de {activeSede.dotacionRequerida} requeridos)
                  </h3>
                </div>

                {integrantesActiveSede.length === 0 ? (
                  <div style={{ padding: '36px 20px', textAlign: 'center', color: '#64748b' }}>
                    <AlertTriangle size={28} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                      Esta sede se encuentra actualmente desatendida
                    </p>
                    <span style={{ fontSize: '11.5px' }}>
                      Reasigna integrantes desde el Directorio o transfiérelos desde otro frente operativo.
                    </span>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {integrantesActiveSede.map((item) => {
                      const esResponsable = item.id === activeSede.responsableId;
                      return (
                        <div
                          key={item.id}
                          style={{
                            padding: '11px 16px',
                            borderBottom: '1px solid #f1f5f9',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: esResponsable ? '#0066ff' : '#1e293b',
                                color: '#ffffff',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 700,
                                fontSize: '11px',
                                flexShrink: 0,
                              }}
                            >
                              {item.iniciales}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <b
                                  onClick={() => onSelectIntegrante(item.id)}
                                  style={{ fontSize: '12.5px', color: '#0f172a', cursor: 'pointer', fontWeight: 650 }}
                                  onMouseEnter={(e) => (e.currentTarget.style.color = '#0066ff')}
                                  onMouseLeave={(e) => (e.currentTarget.style.color = '#0f172a')}
                                >
                                  {item.nombreCompleto}
                                </b>
                                {esResponsable && (
                                  <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#f59e0b', background: '#fef3c7', padding: '1px 5px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                                    <Crown size={9} /> Líder
                                  </span>
                                )}
                              </div>
                              <small style={{ fontSize: '11px', color: '#64748b' }}>
                                {item.cargo} · {item.email}
                              </small>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {!esResponsable && (
                              <button
                                onClick={() => handleDesignarResponsable(item)}
                                className="btn secondary"
                                style={{ height: '28px', padding: '0 8px', fontSize: '11px' }}
                              >
                                Designar Líder
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setModalTransferir(item);
                                setTargetSedeId(sedes.find((s) => s.id !== activeSede.id)?.id || '');
                              }}
                              className="btn secondary"
                              style={{ height: '28px', padding: '0 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                              <ArrowRightLeft size={11} />
                              Transferir
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer que cierra la cápsula */}
      {activeSede && (
        <footer className="footer">
          <span>Frente Operativo: {activeSede.nombre} ({activeSede.codigo})</span>
          <span>Dotación actual: {integrantesActiveSede.length} de {activeSede.dotacionRequerida} requeridos</span>
        </footer>
      )}

      {/* MODAL DE TRANSFERENCIA INDIVIDUAL */}
      {modalTransferir && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 2500, background: 'rgba(0,0,0,0.4)', display: 'grid', placeItems: 'center' }}
          onClick={() => setModalTransferir(null)}
        >
          <div
            style={{ background: '#fff', borderRadius: '10px', padding: '20px', width: '400px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 6px 0', fontSize: '15px', color: '#0f172a' }}>
              Transferir a {modalTransferir.nombreCompleto}
            </h3>
            <p style={{ margin: '0 0 14px 0', fontSize: '12px', color: '#64748b' }}>
              Frente actual: <b>{modalTransferir.sedeNombre}</b>
            </p>

            <select
              value={targetSedeId}
              onChange={(e) => setTargetSedeId(e.target.value)}
              style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', marginBottom: '16px' }}
            >
              {sedes
                .filter((s) => s.id !== modalTransferir.sedeId)
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.ambito})
                  </option>
                ))}
            </select>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setModalTransferir(null)}
                className="btn secondary"
                style={{ height: '32px' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleTransferir}
                className="btn primary"
                style={{ height: '32px' }}
              >
                Confirmar Transferencia
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
