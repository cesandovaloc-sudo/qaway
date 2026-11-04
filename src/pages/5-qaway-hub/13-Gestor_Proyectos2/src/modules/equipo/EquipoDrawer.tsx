import React, { useState } from 'react';
import type { Integrante, AsignacionViva, SedeFrente, EstadoOperativo, EstadoCuenta } from './types';
import {
  X,
  Maximize2,
  Mail,
  Phone,
  MessageSquare,
  Building2,
  Briefcase,
  UserCheck,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  History,
  FileText,
  Plus,
  Send,
  ExternalLink,
} from 'lucide-react';

interface EquipoDrawerProps {
  integrante: Integrante | null;
  onClose: () => void;
  onOpenExpediente: (integrante: Integrante) => void;
  onUpdateIntegrante: (updated: Integrante) => void;
  asignaciones: AsignacionViva[];
  sedes: SedeFrente[];
  onAddNota?: (integranteId: string, texto: string) => void;
}

export default function EquipoDrawer({
  integrante,
  onClose,
  onOpenExpediente,
  onUpdateIntegrante,
  asignaciones,
  sedes,
  onAddNota,
}: EquipoDrawerProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'asignaciones' | 'historial' | 'notas'>('info');
  const [nuevaNota, setNuevaNota] = useState('');

  if (!integrante) return null;

  const misAsignaciones = asignaciones.filter((a) => a.integranteId === integrante.id);
  const totalEsfuerzo = misAsignaciones.reduce((sum, a) => sum + (a.estado !== 'Completado' ? a.esfuerzoHoras : 0), 0);
  const porcentajeCarga = Math.round(
    (totalEsfuerzo / Math.max(1, integrante.capacidadNominalHorasSemana)) * 100
  );

  const handleEstadoOperativoChange = (nuevo: EstadoOperativo) => {
    const updated: Integrante = {
      ...integrante,
      estadoOperativo: nuevo,
      historial: [
        {
          id: 'his-' + Date.now(),
          integranteId: integrante.id,
          fechaHora: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          tipoEvento: 'cambio_estado_operativo',
          descripcion: `Estado operativo actualizado a ${nuevo}`,
          autorNombre: 'Coordinador General',
          valorAnterior: integrante.estadoOperativo,
          valorNuevo: nuevo,
        },
        ...(integrante.historial || []),
      ],
    };
    onUpdateIntegrante(updated);
  };

  const handleEstadoCuentaChange = (nuevo: EstadoCuenta) => {
    const updated: Integrante = {
      ...integrante,
      estadoCuenta: nuevo,
      historial: [
        {
          id: 'his-' + Date.now(),
          integranteId: integrante.id,
          fechaHora: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          tipoEvento: 'cambio_estado_cuenta',
          descripcion: `Estado de cuenta de acceso modificado a ${nuevo}`,
          autorNombre: 'Coordinador General',
          valorAnterior: integrante.estadoCuenta,
          valorNuevo: nuevo,
        },
        ...(integrante.historial || []),
      ],
    };
    onUpdateIntegrante(updated);
  };

  const handleAgregarNota = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaNota.trim()) return;
    if (onAddNota) {
      onAddNota(integrante.id, nuevaNota.trim());
    } else {
      const notaObj = {
        id: 'not-' + Date.now(),
        integranteId: integrante.id,
        autorNombre: 'Coordinador General',
        fechaHora: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
        contenido: nuevaNota.trim(),
      };
      onUpdateIntegrante({
        ...integrante,
        notas: [notaObj, ...(integrante.notas || [])],
      });
    }
    setNuevaNota('');
  };

  const cleanPhone = integrante.telefono.replace(/\D/g, '');

  return (
    <>
      {/* Scrim backdrop */}
      <div className="editor-backdrop" onClick={onClose} />

      {/* Drawer Panel */}
      <aside className="editor" style={{ width: '480px', maxWidth: '100vw' }}>
        {/* Cabecera del Drawer */}
        <div className="editor-head" style={{ height: '72px', borderBottom: '1px solid #e2e8f0', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#f8fafc' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
              FICHA DEL INTEGRANTE
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, color: '#0284c7', background: '#e0f2fe', padding: '2px 8px', borderRadius: '4px' }}>
              {integrante.codigo}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button
              onClick={() => onOpenExpediente(integrante)}
              className="icon-button"
              title="Abrir expediente completo en pantalla completa"
              style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#334155' }}
            >
              <Maximize2 size={15} />
            </button>
            <button
              onClick={onClose}
              className="icon-button"
              title="Cerrar panel"
              style={{ width: '32px', height: '32px', borderRadius: '6px', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', display: 'grid', placeItems: 'center', color: '#334155' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Perfil Rápido y Accesos de Contacto */}
        <div style={{ padding: '18px 20px', borderBottom: '1px solid #e2e8f0', background: '#ffffff' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            {integrante.avatarUrl ? (
              <img
                src={integrante.avatarUrl}
                alt={integrante.nombreCompleto}
                style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e2e8f0' }}
              />
            ) : (
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #1e293b, #334155)',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '18px',
                  display: 'grid',
                  placeItems: 'center',
                  border: '2px solid #e2e8f0',
                }}
              >
                {integrante.iniciales}
              </div>
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {integrante.nombreCompleto}
              </h2>
              <div style={{ fontSize: '13px', color: '#475569', fontWeight: 500, marginTop: '2px' }}>
                {integrante.cargo}
              </div>
              <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                {/* Pill Estado Operativo */}
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
                      integrante.estadoOperativo === 'En funciones'
                        ? '#dcfce7'
                        : integrante.estadoOperativo === 'Licencia / Permiso'
                        ? '#fef3c7'
                        : '#f1f5f9',
                    color:
                      integrante.estadoOperativo === 'En funciones'
                        ? '#15803d'
                        : integrante.estadoOperativo === 'Licencia / Permiso'
                        ? '#b45309'
                        : '#475569',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  <span
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background:
                        integrante.estadoOperativo === 'En funciones'
                          ? '#22c55e'
                          : integrante.estadoOperativo === 'Licencia / Permiso'
                          ? '#f59e0b'
                          : '#94a3b8',
                    }}
                  />
                  {integrante.estadoOperativo}
                </span>

                {/* Pill Estado de Cuenta */}
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    background:
                      integrante.estadoCuenta === 'Habilitada'
                        ? '#e0f2fe'
                        : integrante.estadoCuenta === 'Invitación Pendiente'
                        ? '#ffedd5'
                        : '#fee2e2',
                    color:
                      integrante.estadoCuenta === 'Habilitada'
                        ? '#0369a1'
                        : integrante.estadoCuenta === 'Invitación Pendiente'
                        ? '#c2410c'
                        : '#b91c1c',
                    border: '1px solid rgba(0,0,0,0.06)',
                  }}
                >
                  Cuenta: {integrante.estadoCuenta}
                </span>
              </div>
            </div>
          </div>

          {/* Accesos Rápidos de Contacto */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hola ${integrante.nombre}, te contacto desde la coordinación del proyecto.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                height: '34px',
                background: '#25d366',
                color: '#ffffff',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              <MessageSquare size={14} />
              WhatsApp
            </a>

            <a
              href={`mailto:${integrante.email}?subject=${encodeURIComponent('Coordinación del Proyecto')}`}
              style={{
                flex: 1,
                height: '34px',
                background: '#ffffff',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              <Mail size={14} />
              Correo
            </a>

            <a
              href={`tel:${integrante.telefono}`}
              style={{
                width: '36px',
                height: '34px',
                background: '#ffffff',
                color: '#1e293b',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title={`Llamar a ${integrante.telefono}`}
            >
              <Phone size={14} />
            </a>
          </div>
        </div>

        {/* Pestañas del Drawer */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 10px' }}>
          {[
            { id: 'info', label: 'Información', icon: Briefcase },
            { id: 'asignaciones', label: `Asignaciones (${misAsignaciones.length})`, icon: CheckCircle2 },
            { id: 'historial', label: 'Historial', icon: History },
            { id: 'notas', label: `Notas (${(integrante.notas || []).length})`, icon: FileText },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                style={{
                  padding: '10px 12px',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: isSel ? '2px solid #0284c7' : '2px solid transparent',
                  color: isSel ? '#0284c7' : '#64748b',
                  fontSize: '12px',
                  fontWeight: isSel ? 700 : 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Cuerpo del Drawer */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 20px', background: '#f8fafc' }}>
          {/* TAB 1: INFORMACIÓN GENERAL */}
          {activeTab === 'info' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Tarjeta de Capacidad Operativa */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                    CARGA DE TRABAJO COMPROMETIDA
                  </span>
                  <b style={{ fontSize: '13px', color: porcentajeCarga > 100 ? '#ef4444' : '#0284c7' }}>
                    {porcentajeCarga}%
                  </b>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${Math.min(100, porcentajeCarga)}%`,
                      height: '100%',
                      background: porcentajeCarga > 100 ? '#ef4444' : porcentajeCarga > 75 ? '#f59e0b' : '#0284c7',
                      transition: 'width 0.3s',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11.5px', color: '#64748b' }}>
                  <span>{totalEsfuerzo}h esfuerzo asignado</span>
                  <span>Capacidad base: {integrante.capacidadNominalHorasSemana}h/sem</span>
                </div>
              </div>

              {/* Datos de Estructura y Ubicación */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>
                    SEDE / FRENTE ASIGNADO
                  </label>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={15} color="#0284c7" />
                    {integrante.sedeNombre}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>
                    ÁREA / DEPENDENCIA
                  </label>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    {integrante.areaNombre}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>
                    SUPERIOR INMEDIATO (REPORTA A)
                  </label>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>
                    {integrante.reportaANombre || 'Dirección de Operaciones (Línea directa)'}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '11px', fontWeight: 700, color: '#64748b', marginBottom: '2px' }}>
                    ROL DE PERMISOS EN SISTEMA (RBAC)
                  </label>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0284c7', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ShieldCheck size={15} />
                    {integrante.rolSeguridad}
                  </div>
                </div>
              </div>

              {/* Datos de Contacto y Fechas */}
              <div style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Documento de Identidad:</span>
                  <b style={{ color: '#0f172a' }}>{integrante.documentoIdentidad}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Fecha de Incorporación:</span>
                  <b style={{ color: '#0f172a' }}>{integrante.fechaIngreso}</b>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                  <span style={{ color: '#64748b' }}>Último Acceso al Sistema:</span>
                  <b style={{ color: '#0f172a' }}>{integrante.ultimoAcceso || 'Sin registro'}</b>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ASIGNACIONES VIVAS */}
          {activeTab === 'asignaciones' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {misAsignaciones.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748b', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <CheckCircle2 size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>No tiene tareas activas asignadas en este proyecto.</p>
                </div>
              ) : (
                misAsignaciones.map((asg) => (
                  <div key={asg.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
                          {asg.tipo}
                        </span>
                        <div style={{ fontSize: '13px', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>
                          {asg.titulo}
                        </div>
                      </div>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: 650,
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background:
                            asg.estado === 'Completado'
                              ? '#dcfce7'
                              : asg.estado === 'Atrasado'
                              ? '#fee2e2'
                              : asg.estado === 'En curso'
                              ? '#e0f2fe'
                              : '#f1f5f9',
                          color:
                            asg.estado === 'Completado'
                              ? '#15803d'
                              : asg.estado === 'Atrasado'
                              ? '#b91c1c'
                              : asg.estado === 'En curso'
                              ? '#0369a1'
                              : '#475569',
                        }}
                      >
                        {asg.estado}
                      </span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '8px' }}>
                      <span>Plazo: {asg.fechaFin}</span>
                      <span>Esfuerzo: {asg.esfuerzoHoras}h</span>
                      <b>Avance: {asg.progresoPorcentaje}%</b>
                    </div>

                    <div style={{ width: '100%', height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden', marginTop: '6px' }}>
                      <div
                        style={{
                          width: `${asg.progresoPorcentaje}%`,
                          height: '100%',
                          background: asg.estado === 'Completado' ? '#22c55e' : asg.estado === 'Atrasado' ? '#ef4444' : '#0284c7',
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: HISTORIAL DE AUDITORÍA */}
          {activeTab === 'historial' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {(!integrante.historial || integrante.historial.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '30px 20px', color: '#64748b', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                  <History size={32} color="#94a3b8" style={{ margin: '0 auto 8px' }} />
                  <p style={{ margin: 0, fontSize: '13px' }}>Sin eventos registrados en la bitácora.</p>
                </div>
              ) : (
                integrante.historial.map((ev) => (
                  <div key={ev.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <b>{ev.autorNombre}</b>
                      <span>{ev.fechaHora}</span>
                    </div>
                    <div style={{ fontSize: '12.5px', color: '#1e293b', fontWeight: 500 }}>
                      {ev.descripcion}
                    </div>
                    {(ev.valorAnterior || ev.valorNuevo) && (
                      <div style={{ fontSize: '11px', color: '#0284c7', marginTop: '4px', background: '#f0f9ff', padding: '3px 6px', borderRadius: '4px' }}>
                        {ev.valorAnterior ? `De "${ev.valorAnterior}" ` : ''}➔ "{ev.valorNuevo}"
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 4: NOTAS INTERNAS */}
          {activeTab === 'notas' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {/* Formulario para agregar nota */}
              <form onSubmit={handleAgregarNota} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
                <textarea
                  value={nuevaNota}
                  onChange={(e) => setNuevaNota(e.target.value)}
                  placeholder="Escribe una nota interna sobre este integrante..."
                  rows={3}
                  style={{ width: '100%', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 10px', fontSize: '12.5px', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                  <button
                    type="submit"
                    style={{
                      height: '30px',
                      padding: '0 12px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: 650,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={13} />
                    Guardar Nota
                  </button>
                </div>
              </form>

              {/* Lista de notas */}
              {(!integrante.notas || integrante.notas.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '24px 20px', color: '#64748b' }}>
                  <p style={{ margin: 0, fontSize: '12.5px' }}>No hay notas internas registradas.</p>
                </div>
              ) : (
                integrante.notas.map((n) => (
                  <div key={n.id} style={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '10px 12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
                      <b>{n.autorNombre}</b>
                      <span>{n.fechaHora}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', lineHeight: '1.45' }}>
                      {n.contenido}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Pie del Drawer: Controles Rápidos y Maximizar */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #e2e8f0', background: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Estado:</span>
            <select
              value={integrante.estadoOperativo}
              onChange={(e) => handleEstadoOperativoChange(e.target.value as EstadoOperativo)}
              style={{
                height: '30px',
                padding: '0 8px',
                borderRadius: '6px',
                border: '1px solid #cbd5e1',
                background: '#fff',
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#1e293b',
                cursor: 'pointer',
              }}
            >
              <option value="En funciones">En funciones</option>
              <option value="Licencia / Permiso">Licencia / Permiso</option>
              <option value="Desvinculado">Desvinculado</option>
            </select>
          </div>

          <button
            onClick={() => onOpenExpediente(integrante)}
            style={{
              height: '32px',
              padding: '0 12px',
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Maximize2 size={13} />
            Ver Expediente
          </button>
        </div>
      </aside>
    </>
  );
}
