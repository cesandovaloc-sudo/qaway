import React, { useState } from 'react';
import type { Integrante, SedeFrente, UnidadOrganizacional, RolSeguridad, EstadoOperativo, EstadoCuenta } from './types';
import { X, UserPlus, Building2, Briefcase, Mail, Phone, ShieldCheck, Check } from 'lucide-react';

interface EquipoNuevoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (nuevo: Integrante) => void;
  sedes: SedeFrente[];
  areas: UnidadOrganizacional[];
}

export default function EquipoNuevoModal({
  isOpen,
  onClose,
  onSave,
  sedes,
  areas,
}: EquipoNuevoModalProps) {
  const [nombre, setNombre] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [email, setEmail] = useState('');
  // El teléfono de la persona se registra en Mi Perfil (users.phone).
  // Este formulario local no captura un segundo número.
  const telefono = '';
  const [documento, setDocumento] = useState('');
  const [cargo, setCargo] = useState('');
  const [sedeId, setSedeId] = useState(sedes[0]?.id || '');
  const [areaId, setAreaId] = useState(areas[0]?.id || '');
  const [rolSeguridad, setRolSeguridad] = useState<RolSeguridad>('Colaborador');
  const [capacidad, setCapacidad] = useState(40);
  const [enviarInvitacion, setEnviarInvitacion] = useState(true);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !apellidos.trim() || !email.trim()) return;

    const sedeSel = sedes.find((s) => s.id === sedeId) || sedes[0];
    const areaSel = areas.find((a) => a.id === areaId) || areas[0];
    const nombreCompleto = `${nombre.trim()} ${apellidos.trim()}`;
    const iniciales = `${nombre.trim()[0] || ''}${apellidos.trim()[0] || ''}`.toUpperCase();

    const nuevo: Integrante = {
      id: 'int-' + Date.now().toString(36),
      codigo: 'INT-' + Math.floor(100 + Math.random() * 900),
      nombre: nombre.trim(),
      apellidos: apellidos.trim(),
      nombreCompleto,
      email: email.trim(),
      telefono: telefono.trim(),
      documentoIdentidad: documento.trim() || '—',
      iniciales,
      estadoOperativo: 'En funciones' as EstadoOperativo,
      estadoCuenta: (enviarInvitacion ? 'Invitación Pendiente' : 'Habilitada') as EstadoCuenta,
      rolSeguridad,
      cargo: cargo.trim() || 'Especialista Operativo',
      areaId: areaSel?.id || 'area-01',
      areaNombre: areaSel?.nombre || 'Operaciones',
      sedeId: sedeSel?.id || 'sede-01',
      sedeNombre: sedeSel?.nombre || 'Sede Central',
      capacidadNominalHorasSemana: Number(capacidad) || 40,
      fechaIngreso: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }),
      ultimoAcceso: enviarInvitacion ? '—' : 'Pendiente de primer ingreso',
      notas: [],
      historial: [
        {
          id: 'his-' + Date.now(),
          integranteId: 'int-' + Date.now().toString(36),
          fechaHora: new Date().toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }) + ' · ' + new Date().toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }),
          tipoEvento: 'creacion',
          descripcion: 'Registro de incorporación del integrante al proyecto.',
          autorNombre: 'Coordinador General',
        },
      ],
    };

    onSave(nuevo);
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 2000,
        background: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(2px)',
        display: 'grid',
        placeItems: 'center',
        padding: '16px',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '560px',
          maxWidth: '100%',
          background: '#ffffff',
          borderRadius: '12px',
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          animation: 'fadeInPop 0.2s ease-out',
        }}
      >
        {/* Cabecera */}
        <div
          style={{
            padding: '16px 22px',
            borderBottom: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#f8fafc',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={19} color="#0284c7" />
            <div>
              <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f172a' }}>
                Registrar Nuevo Integrante
              </h3>
              <p style={{ margin: 0, fontSize: '11.5px', color: '#64748b' }}>
                Añade una persona al equipo operativo del proyecto.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#64748b',
              padding: '4px',
              borderRadius: '6px',
            }}
          >
            <X size={17} />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '70vh', overflowY: 'auto' }}>
          {/* Fila: Nombres y Apellidos */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Nombres *
              </label>
              <input
                required
                type="text"
                placeholder="Ej. Carmen"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Apellidos *
              </label>
              <input
                required
                type="text"
                placeholder="Ej. Soto Morales"
                value={apellidos}
                onChange={(e) => setApellidos(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Fila: Correo y Teléfono */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Correo Institucional *
              </label>
              <input
                required
                type="email"
                placeholder="c.soto@proyecto-operativo.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Teléfono / WhatsApp
              </label>
              <div style={{ height: '36px', display: 'flex', alignItems: 'center', fontSize: '12px', color: '#64748b', border: '1px dashed #cbd5e1', borderRadius: '6px', padding: '0 10px' }}>
                Se registra en Mi Perfil → Teléfono / WhatsApp
              </div>
            </div>
          </div>

          {/* Fila: Cargo y Documento */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Cargo Funcional *
              </label>
              <input
                required
                type="text"
                placeholder="Ej. Especialista de Enlace Territorial"
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Doc. Identidad
              </label>
              <input
                type="text"
                placeholder="DNI / C.E."
                value={documento}
                onChange={(e) => setDocumento(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Fila: Sede y Área */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Sede / Frente Asignado
              </label>
              <select
                value={sedeId}
                onChange={(e) => setSedeId(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: '#fff', boxSizing: 'border-box' }}
              >
                {sedes.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.nombre} ({s.ambito})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Área / Dependencia
              </label>
              <select
                value={areaId}
                onChange={(e) => setAreaId(e.target.value)}
                style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: '#fff', boxSizing: 'border-box' }}
              >
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Fila: Rol de Seguridad y Capacidad */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Permisos en Sistema (RBAC)
              </label>
              <select
                value={rolSeguridad}
                onChange={(e) => setRolSeguridad(e.target.value as RolSeguridad)}
                style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', background: '#fff', boxSizing: 'border-box' }}
              >
                <option value="Colaborador">Colaborador (Reporte operativo)</option>
                <option value="Gestor">Gestor (Coordinación y edición)</option>
                <option value="Administrador">Administrador (Control total)</option>
                <option value="Consulta">Consulta (Solo lectura)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '11.5px', fontWeight: 700, color: '#334155', marginBottom: '4px' }}>
                Capacidad Base (Horas/Semana)
              </label>
              <input
                type="number"
                min={10}
                max={60}
                value={capacidad}
                onChange={(e) => setCapacidad(Number(e.target.value))}
                style={{ width: '100%', height: '36px', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '0 10px', fontSize: '13px', boxSizing: 'border-box' }}
              />
            </div>
          </div>

          {/* Opción de enviar invitación */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
            <input
              type="checkbox"
              checked={enviarInvitacion}
              onChange={(e) => setEnviarInvitacion(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: '#0284c7' }}
            />
            <span style={{ fontSize: '12.5px', color: '#334155' }}>
              Emitir invitación automática de acceso al correo institucional
            </span>
          </label>

          {/* Botones de acción */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px', borderTop: '1px solid #e2e8f0', paddingTop: '14px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                height: '36px',
                padding: '0 16px',
                background: '#ffffff',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 600,
                color: '#334155',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              style={{
                height: '36px',
                padding: '0 20px',
                background: '#0284c7',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12.5px',
                fontWeight: 650,
                color: '#ffffff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Check size={15} />
              Registrar Integrante
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
