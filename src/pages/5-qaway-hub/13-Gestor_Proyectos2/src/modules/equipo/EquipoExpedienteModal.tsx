import React, { useState } from 'react';
import type { Integrante, AsignacionViva, SedeFrente, UnidadOrganizacional, RolSeguridad } from './types';
import TablaPorConectar from '../../components/TablaPorConectar';
import {
  ArrowLeft,
  Shield,
  Briefcase,
  FileText,
  History,
  Lock,
  Download,
  Check,
  Building2,
  Calendar,
  Key,
  Paperclip,
  Upload,
  UserCheck,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

interface EquipoExpedienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  integrante: Integrante | null;
  onUpdateIntegrante: (updated: Integrante) => void;
  asignaciones: AsignacionViva[];
  sedes: SedeFrente[];
  areas: UnidadOrganizacional[];
  embedded?: boolean;
  backLabel?: string;
}

export default function EquipoExpedienteModal({
  isOpen,
  onClose,
  integrante,
  onUpdateIntegrante,
  asignaciones,
  sedes,
  areas,
  embedded = false,
  backLabel = 'Volver al Directorio',
}: EquipoExpedienteModalProps) {
  const [activeTab, setActiveTab] = useState<'perfil' | 'estructura' | 'historial' | 'documentos'>('perfil');
  const [rolSeguridad, setRolSeguridad] = useState<RolSeguridad>(integrante?.rolSeguridad || 'Colaborador');
  const [alertaGuardado, setAlertaGuardado] = useState(false);

  if (!isOpen || !integrante) return null;

  const handleGuardarSeguridad = () => {
    const updated: Integrante = {
      ...integrante,
      rolSeguridad,
      historial: [
        {
          id: 'his-' + Date.now(),
          integranteId: integrante.id,
          fechaHora: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          tipoEvento: 'cambio_rol_seguridad',
          descripcion: `Rol de seguridad en plataforma actualizado a ${rolSeguridad}`,
          autorNombre: 'Coordinador General',
          valorAnterior: integrante.rolSeguridad,
          valorNuevo: rolSeguridad,
        },
        ...(integrante.historial || []),
      ],
    };
    onUpdateIntegrante(updated);
    setAlertaGuardado(true);
    setTimeout(() => setAlertaGuardado(false), 2500);
  };

  return (
    <div
      style={{
        position: embedded ? 'absolute' : 'fixed',
        inset: 0,
        zIndex: embedded ? 45 : 1800,
        background: '#f1f5f9',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'fadeInPop 0.22s ease-out',
      }}
    >
      {/* Barra Superior / Header de Expediente */}
      <header
        style={{
          height: '60px',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          borderBottom: '1px solid #1e293b',
          flexShrink: 0,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button
            onClick={onClose}
            style={{
              height: '34px',
              padding: '0 12px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 650,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'background 0.15s ease',
            }}
          >
            <ArrowLeft size={14} />
            {backLabel}
          </button>

          <div style={{ width: '1px', height: '24px', background: '#334155' }} />

          <div>
            <h1 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
              Expediente Integral · {integrante.nombreCompleto}
            </h1>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>
              Código: {integrante.codigo} · {integrante.cargo} · {integrante.sedeNombre}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {alertaGuardado && (
            <span style={{ fontSize: '12px', color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Check size={14} /> Cambios guardados
            </span>
          )}
          <button
            onClick={() => window.print()}
            style={{
              height: '34px',
              padding: '0 14px',
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              color: '#ffffff',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
            }}
          >
            <Download size={14} />
            Imprimir Expediente
          </button>
        </div>
      </header>

      {/* Contenedor Central: Barra superior horizontal de secciones + Lienzo */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Barra Superior Horizontal de Navegación de la Ficha (debajo de cabecera y migajas) */}
        <nav
          aria-label="Secciones de la ficha"
          style={{
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            padding: '8px 20px',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '6px',
            flexShrink: 0,
          }}
        >
          {[
            { id: 'perfil', label: 'Perfil y Seguridad', icon: Shield },
            { id: 'estructura', label: 'Estructura y Sede', icon: Building2 },
            { id: 'historial', label: 'Auditoría e Historial', icon: History },
            { id: 'documentos', label: 'Documentos Adjuntos', icon: FileText },
          ].map((item) => {
            const Icon = item.icon;
            const isSel = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id as any)}
                style={{
                  height: '34px',
                  padding: '0 13px',
                  borderRadius: '7px',
                  border: isSel ? '1px solid #bae6fd' : '1px solid transparent',
                  background: isSel ? '#e0f2fe' : 'transparent',
                  color: isSel ? '#0369a1' : '#334155',
                  fontSize: '12.5px',
                  fontWeight: isSel ? 700 : 550,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '7px',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} color={isSel ? '#0284c7' : '#64748b'} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Lienzo Principal de Contenido del Expediente */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          {/* TAB 1: PERFIL Y SEGURIDAD */}
          {activeTab === 'perfil' && (
            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              {/* Tarjeta de Seguridad y Credenciales */}
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
                  <Key size={18} color="#0284c7" />
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    Control de Acceso y Permisos del Sistema (RBAC)
                  </h2>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Nivel de Permisos de la Plataforma
                    </label>
                    <select
                      value={rolSeguridad}
                      onChange={(e) => setRolSeguridad(e.target.value as RolSeguridad)}
                      style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: '#fff' }}
                    >
                      <option value="Colaborador">Colaborador (Reporte de avance y consultas)</option>
                      <option value="Gestor">Gestor (Gestión de equipo y edición territorial)</option>
                      <option value="Administrador">Administrador (Control total del proyecto)</option>
                      <option value="Consulta">Consulta (Visualización sin edición)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#475569', marginBottom: '4px' }}>
                      Estado Actual de la Cuenta
                    </label>
                    <div style={{ height: '36px', display: 'flex', alignItems: 'center', fontSize: '13px', fontWeight: 650, color: '#0f172a' }}>
                      {integrante.estadoCuenta}
                    </div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '12px 14px', marginBottom: '16px', fontSize: '12.5px', color: '#475569' }}>
                  Los permisos definen las operaciones que este usuario puede ejecutar dentro del Gestor de Proyectos. No alteran su cargo funcional ni sus responsabilidades contractuales.
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleGuardarSeguridad}
                    style={{
                      height: '36px',
                      padding: '0 18px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: 650,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Check size={14} />
                    Guardar Configuración de Acceso
                  </button>
                </div>
              </div>

              {/* Datos Personales y Biográficos */}
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  Datos Biográficos e Identificación
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Nombres y Apellidos:</span>
                    <div style={{ fontSize: '13.5px', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{integrante.nombreCompleto}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Documento de Identidad:</span>
                    <div style={{ fontSize: '13.5px', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{integrante.documentoIdentidad}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Correo Institucional:</span>
                    <div style={{ fontSize: '13.5px', fontWeight: 650, color: '#0284c7', marginTop: '2px' }}>{integrante.email}</div>
                  </div>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Teléfono Móvil:</span>
                    <div style={{ fontSize: '13.5px', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{integrante.telefono}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ESTRUCTURA Y SEDE */}
          {activeTab === 'estructura' && (
            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <h2 style={{ margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  Asignación Orgánica y Frente Territorial
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px' }}>
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Cargo Operativo:</span>
                    <div style={{ fontSize: '14px', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{integrante.cargo}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Área de Adscripción:</span>
                    <div style={{ fontSize: '14px', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{integrante.areaNombre}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Sede Asignada:</span>
                    <div style={{ fontSize: '14px', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{integrante.sedeNombre}</div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Superior Jerárquico:</span>
                    <div style={{ fontSize: '14px', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>
                      {integrante.reportaANombre || 'Dirección de Operaciones'}
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Capacidad Nominal de Dedicación:</span>
                    <div style={{ fontSize: '14px', fontWeight: 650, color: '#0284c7', marginTop: '2px' }}>
                      {integrante.capacidadNominalHorasSemana} horas semanales
                    </div>
                  </div>

                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Fecha de Inicio en el Proyecto:</span>
                    <div style={{ fontSize: '14px', fontWeight: 650, color: '#0f172a', marginTop: '2px' }}>{integrante.fechaIngreso}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AUDITORÍA E HISTORIAL */}
          {activeTab === 'historial' && (
            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <h2 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                  Trazabilidad Cronológica de Eventos
                </h2>
                <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: '#64748b' }}>
                  Registro histórico e inmutable de modificaciones operativas y de seguridad en el sistema.
                </p>

                {(!integrante.historial || integrante.historial.length === 0) ? (
                  <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>Sin eventos registrados.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {integrante.historial.map((ev) => (
                      <div key={ev.id} style={{ borderLeft: '3px solid #0284c7', paddingLeft: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '0 6px 6px 0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: '#64748b' }}>
                          <b>{ev.autorNombre}</b>
                          <span>{ev.fechaHora}</span>
                        </div>
                        <div style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', marginTop: '3px' }}>{ev.descripcion}</div>
                        {(ev.valorAnterior || ev.valorNuevo) && (
                          <div style={{ fontSize: '11.5px', color: '#0284c7', marginTop: '2px' }}>
                            {ev.valorAnterior ? `Anterior: "${ev.valorAnterior}" ` : ''}➔ Nuevo: "{ev.valorNuevo}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: DOCUMENTOS ADJUNTOS */}
          {activeTab === 'documentos' && (
            <div style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Tabla 12: el catálogo existe, la clasificación de adjuntos aún no. */}
              <TablaPorConectar
                campo="Clasificación del adjunto"
                tabla="gp_tipos_archivo_c"
                nota="7 tipos PMI; al conectar se clasifican los documentos del expediente"
              />
              <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '22px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                    Documentos y Acreditaciones del Integrante
                  </h2>
                  <button
                    onClick={() => alert('Selector de carga de documentos activo.')}
                    style={{
                      height: '32px',
                      padding: '0 12px',
                      background: '#0284c7',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 650,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Upload size={13} />
                    Adjuntar Archivo
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {[
                    { nombre: 'Acta de Designación Operativa.pdf', tam: '1.2 MB', fecha: '01 ago. 2026' },
                    { nombre: 'Credencial Territorial Autorizada.pdf', tam: '480 KB', fecha: '15 ago. 2026' },
                    { nombre: 'Ficha de Registro y Declaración.pdf', tam: '850 KB', fecha: '10 set. 2026' },
                  ].map((doc, idx) => (
                    <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} color="#0284c7" />
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 650, color: '#0f172a' }}>{doc.nombre}</div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>{doc.tam} · Subido el {doc.fecha}</div>
                        </div>
                      </div>
                      <button
                        onClick={() => alert(`Descargando ${doc.nombre}`)}
                        style={{ height: '30px', padding: '0 10px', background: '#ffffff', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '11.5px', fontWeight: 600, color: '#334155', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Download size={13} />
                        Descargar
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
