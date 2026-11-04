import React, { useState } from 'react';
import type { SedeFrente, Integrante } from './types';
import {
  Building2,
  MapPin,
  Users,
  UserCheck,
  AlertTriangle,
  ArrowRightLeft,
  Crown,
  Phone,
  Mail,
  MessageSquare,
  Plus,
  CheckCircle2,
  XCircle,
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

  const activeSede = sedes.find((s) => s.id === selectedSedeId) || sedes[0];

  // Integrantes por sede
  const getIntegrantesDeSede = (sedeId: string) => {
    return integrantes.filter((i) => i.sedeId === sedeId);
  };

  const integrantesActiveSede = getIntegrantesDeSede(activeSede?.id || '');

  // Métricas de cobertura territorial
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

  // Manejo de transferencia territorial
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

  // Designar como responsable de sede
  const handleDesignarResponsable = (integrante: Integrante) => {
    const updatedSede: SedeFrente = {
      ...activeSede,
      responsableId: integrante.id,
      responsableNombre: integrante.nombreCompleto,
    };
    onUpdateSede(updatedSede);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      {/* Barra de Indicadores Territoriales */}
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
            SEDES Y FRENTES TOTALES
          </span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', marginTop: '4px' }}>
            {metricasCobertura.totalSedes}
          </div>
          <span style={{ fontSize: '11px', color: '#64748b' }}>Puntos operativos del proyecto</span>
        </div>

        <div style={{ background: '#f0fdf4', padding: '12px 16px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#166534', textTransform: 'uppercase' }}>
            COBERTURA COMPLETA
          </span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#15803d', marginTop: '4px' }}>
            {metricasCobertura.cubiertas}
          </div>
          <span style={{ fontSize: '11px', color: '#166534' }}>Dotación requerida alcanzada</span>
        </div>

        <div style={{ background: '#fffbeb', padding: '12px 16px', borderRadius: '8px', border: '1px solid #fde68a' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: '#92400e', textTransform: 'uppercase' }}>
            DÉFICIT DE PERSONAL
          </span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: '#b45309', marginTop: '4px' }}>
            {metricasCobertura.deficit}
          </div>
          <span style={{ fontSize: '11px', color: '#92400e' }}>Requieren asignación adicional</span>
        </div>

        <div style={{ background: metricasCobertura.desatendidas > 0 ? '#fef2f2' : '#f8fafc', padding: '12px 16px', borderRadius: '8px', border: metricasCobertura.desatendidas > 0 ? '1px solid #fecaca' : '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: metricasCobertura.desatendidas > 0 ? '#991b1b' : '#64748b', textTransform: 'uppercase' }}>
            SEDES DESATENDIDAS
          </span>
          <div style={{ fontSize: '20px', fontWeight: 700, color: metricasCobertura.desatendidas > 0 ? '#dc2626' : '#0f172a', marginTop: '4px' }}>
            {metricasCobertura.desatendidas}
          </div>
          <span style={{ fontSize: '11px', color: metricasCobertura.desatendidas > 0 ? '#b91c1c' : '#64748b' }}>
            {metricasCobertura.desatendidas > 0 ? 'Alerta: Sin personal asignado' : 'Todos los frentes cubiertos'}
          </span>
        </div>
      </div>

      {/* Contenedor Principal en Dos Columnas Sincronizadas */}
      <div style={{ display: 'flex', minHeight: '520px', background: '#f8fafc' }}>
        {/* Columna Izquierda: Catálogo de Sedes */}
        <div style={{ width: '380px', borderRight: '1px solid #e2e8f0', background: '#ffffff', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px', flexShrink: 0 }}>
          <div style={{ position: 'relative', marginBottom: '4px' }}>
            <Search size={14} color="#64748b" style={{ position: 'absolute', left: '10px', top: '9px' }} />
            <input
              type="text"
              placeholder="Buscar sede o frente..."
              value={busquedaSede}
              onChange={(e) => setBusquedaSede(e.target.value)}
              style={{ width: '100%', height: '32px', border: '1px solid #cbd5e1', borderRadius: '6px', paddingLeft: '30px', fontSize: '12px', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                      border: isSel ? '2px solid #0284c7' : '1px solid #e2e8f0',
                      background: isSel ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSel ? '0 2px 8px rgba(2, 132, 199, 0.12)' : 'none',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '10.5px', fontWeight: 700, color: isSel ? '#0284c7' : '#64748b', textTransform: 'uppercase' }}>
                          {sede.codigo}
                        </div>
                        <h4 style={{ margin: '2px 0 0 0', fontSize: '13.5px', fontWeight: 700, color: '#0f172a' }}>
                          {sede.nombre}
                        </h4>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>{sede.ambito}</span>
                      </div>

                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: esDesatendida ? '#fee2e2' : porcentaje >= 100 ? '#dcfce7' : '#fef3c7',
                          color: esDesatendida ? '#b91c1c' : porcentaje >= 100 ? '#15803d' : '#b45309',
                        }}
                      >
                        {esDesatendida ? 'Desatendida' : `${porcentaje}%`}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '10px' }}>
                      <span>Dotación: {integrantesSede.length} / {sede.dotacionRequerida}</span>
                      <span>Resp: {sede.responsableNombre || 'Sin designar'}</span>
                    </div>

                    <div style={{ width: '100%', height: '5px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', marginTop: '4px' }}>
                      <div
                        style={{
                          width: `${Math.min(100, porcentaje)}%`,
                          height: '100%',
                          background: esDesatendida ? '#ef4444' : porcentaje >= 100 ? '#22c55e' : '#f59e0b',
                        }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Columna Derecha: Detalle de Sede y Personal Adscrito */}
        <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
          {activeSede && (
            <div>
              {/* Tarjeta de Encabezado de la Sede */}
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '18px 20px', marginBottom: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#0284c7', textTransform: 'uppercase' }}>
                      FRENTE OPERATIVO ACTIVO
                    </span>
                    <h2 style={{ margin: '2px 0 0 0', fontSize: '18px', fontWeight: 700, color: '#0f172a' }}>
                      {activeSede.nombre}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                      <MapPin size={13} color="#0284c7" />
                      <span>{activeSede.direccion || 'Dirección de frente registrada'} · {activeSede.ambito}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Responsable Principal:</div>
                    <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end', marginTop: '2px' }}>
                      <Crown size={14} color="#f59e0b" />
                      {activeSede.responsableNombre || 'Sin asignar'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lista de Personal en este Frente */}
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                  <h3 style={{ margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a' }}>
                    Personal Adscrito ({integrantesActiveSede.length} de {activeSede.dotacionRequerida} requeridos)
                  </h3>
                </div>

                {integrantesActiveSede.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                    <AlertTriangle size={32} color="#f59e0b" style={{ margin: '0 auto 8px' }} />
                    <p style={{ margin: '0 0 6px 0', fontSize: '13.5px', fontWeight: 600, color: '#0f172a' }}>
                      Esta sede se encuentra actualmente desatendida
                    </p>
                    <span style={{ fontSize: '12px' }}>
                      No hay ningún integrante asignado. Reasigna integrantes desde el Directorio o transfiérelos desde otro frente.
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
                            padding: '12px 18px',
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
                                width: '36px',
                                height: '36px',
                                borderRadius: '50%',
                                background: esResponsable ? '#0284c7' : '#1e293b',
                                color: '#ffffff',
                                display: 'grid',
                                placeItems: 'center',
                                fontWeight: 700,
                                fontSize: '12px',
                                flexShrink: 0,
                              }}
                            >
                              {item.iniciales}
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <b
                                  onClick={() => onSelectIntegrante(item.id)}
                                  style={{ fontSize: '13px', color: '#0f172a', cursor: 'pointer', textDecoration: 'underline' }}
                                >
                                  {item.nombreCompleto}
                                </b>
                                {esResponsable && (
                                  <span style={{ fontSize: '10px', fontWeight: 700, color: '#f59e0b', background: '#fef3c7', padding: '1px 6px', borderRadius: '4px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                                    <Crown size={10} /> Líder de Frente
                                  </span>
                                )}
                              </div>
                              <small style={{ fontSize: '11px', color: '#64748b' }}>
                                {item.cargo} · {item.email}
                              </small>
                            </div>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {!esResponsable && (
                              <button
                                onClick={() => handleDesignarResponsable(item)}
                                style={{
                                  height: '28px',
                                  padding: '0 8px',
                                  background: '#ffffff',
                                  border: '1px solid #cbd5e1',
                                  borderRadius: '6px',
                                  fontSize: '11px',
                                  fontWeight: 600,
                                  color: '#334155',
                                  cursor: 'pointer',
                                }}
                              >
                                Designar Líder
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setModalTransferir(item);
                                setTargetSedeId(sedes.find((s) => s.id !== activeSede.id)?.id || '');
                              }}
                              style={{
                                height: '28px',
                                padding: '0 10px',
                                background: '#f1f5f9',
                                border: '1px solid #cbd5e1',
                                borderRadius: '6px',
                                fontSize: '11px',
                                fontWeight: 600,
                                color: '#0f172a',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <ArrowRightLeft size={12} />
                              Transferir Sede
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

            <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
              Seleccionar Nuevo Frente Operativo:
            </label>
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
                style={{ height: '32px', padding: '0 12px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '6px', cursor: 'pointer' }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleTransferir}
                style={{ height: '32px', padding: '0 14px', background: '#0284c7', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 650, cursor: 'pointer' }}
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
