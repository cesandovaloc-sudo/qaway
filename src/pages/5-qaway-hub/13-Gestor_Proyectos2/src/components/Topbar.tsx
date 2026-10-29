import React, { useState, useRef, useEffect } from 'react';
import type { ModuleKey, UserRole } from '../types';
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  LogOut,
  Mail,
  ShieldCheck,
  Sliders,
  User,
} from 'lucide-react';

interface TopbarProps {
  activeModule: ModuleKey;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  notify: (msg: string) => void;
  activeProject?: {
    id: string;
    code: string;
    name: string;
    region: string;
    subtext?: string;
  };
}

const MODULE_LABELS: Record<ModuleKey, string> = {
  resumen: 'Resumen del proyecto',
  cronograma: 'Cronograma del proyecto',
  sedes: 'Sedes de Supervisión',
  tareas: 'Tareas',
  hitos: 'Hitos rectores',
  reuniones: 'Reuniones',
  reportes: 'Reportes y estadísticas',
  usuarios: 'Equipo del proyecto',
  actas: 'Actas y acuerdos',
  configuracion: 'Configuración del sistema',
};

export default function Topbar({
  activeModule,
  userRole,
  onChangeRole,
  notify,
  activeProject,
}: TopbarProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectRole = (newRole: UserRole) => {
    if (newRole === userRole) return;
    onChangeRole(newRole);
    setIsProfileMenuOpen(false);
    notify(
      newRole === 'coordinador'
        ? 'Perspectiva cambiada: Carlos Mendoza (Coordinador General · Creación de Proyectos y Gantt)'
        : 'Perspectiva cambiada: María Salazar (Gestora Territorial · Monitoreo Operativo)'
    );
  };

  const projectContext = activeProject?.subtext || activeProject?.region || 'Qaway Lab';
  const projectName = activeProject?.name || 'Proyecto';

  return (
    <header className="qm-topbar">
      {/* Breadcrumb dinámico sincronizado con el proyecto activo */}
      <div className="qm-topbar-left">
        <span>{projectContext}</span>
        <ChevronRight size={13} color="#94a3b8" />
        <span style={{ fontWeight: 650, color: '#0f172a' }}>{projectName}</span>
        <ChevronRight size={13} color="#94a3b8" />
        <b>{MODULE_LABELS[activeModule] || 'Panel'}</b>
      </div>

      {/* Acciones institucionales y conmutador de perfil en el extremo derecho */}
      <div className="qm-topbar-right" style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          className="qm-topbar-btn"
          aria-label="Ayuda del sistema"
          title="Ayuda y documentación normativa"
          onClick={() =>
            notify('Guía oficial de uso del gestor de proyectos')
          }
        >
          <CircleHelp size={18} />
        </button>

        <button
          className="qm-topbar-btn"
          style={{ position: 'relative' }}
          aria-label="Notificaciones"
          title="Notificaciones y alertas preventivas"
          onClick={() =>
            notify('Tienes 3 alertas preventivas de seguimiento territorial')
          }
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              background: '#dc2626',
              color: 'white',
              fontSize: '9px',
              fontWeight: 800,
              display: 'grid',
              placeItems: 'center',
            }}
          >
            3
          </span>
        </button>

        {/* Botón de Perfil en Topbar (Solo despliega u oculta el menú, NO cambia directamente el perfil) */}
        <div
          className="qm-topbar-profile"
          onClick={() => setIsProfileMenuOpen((prev) => !prev)}
          title="Clic para abrir opciones de perfil y cambio de usuario"
          style={{
            borderColor: isProfileMenuOpen ? '#0284c7' : '#e2e8f0',
            boxShadow: isProfileMenuOpen ? '0 0 0 3px rgba(2, 132, 199, 0.12)' : 'none',
          }}
        >
          <div
            className="qm-topbar-avatar"
            style={{
              background: userRole === 'coordinador' ? '#0f172a' : '#2563eb',
            }}
          >
            {userRole === 'coordinador' ? 'CM' : 'MS'}
          </div>
          <div className="qm-topbar-profile-info">
            <b>{userRole === 'coordinador' ? 'Carlos Mendoza' : 'María Salazar'}</b>
            <small>{userRole === 'coordinador' ? 'Coordinador General' : 'Gestora Territorial'}</small>
          </div>
          <ChevronDown
            size={14}
            color="#64748b"
            style={{
              transform: isProfileMenuOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </div>

        {/* Menú Desplegable de Perfil */}
        {isProfileMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '50px',
              right: '0',
              width: '350px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 12px 36px rgba(15, 23, 42, 0.16)',
              zIndex: 9999,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* Header de Usuario Activo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  background: userRole === 'coordinador' ? '#0f172a' : '#2563eb',
                  color: '#ffffff',
                }}
              >
                {userRole === 'coordinador' ? 'CM' : 'MS'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: '14px', color: '#0f172a', display: 'block' }}>
                  {userRole === 'coordinador' ? 'Carlos Mendoza' : 'María Salazar'}
                </b>
                <span style={{ fontSize: '11.5px', color: '#64748b', display: 'block' }}>
                  {userRole === 'coordinador' ? 'cmendoza@qawaylab.com' : 'msalazar@qawaylab.com'}
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '10px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: userRole === 'coordinador' ? '#f1f5f9' : '#eff6ff',
                    color: userRole === 'coordinador' ? '#334155' : '#1d4ed8',
                    marginTop: '3px',
                  }}
                >
                  {userRole === 'coordinador' ? 'Coordinador General' : 'Gestora Territorial'}
                </span>
              </div>
            </div>

            {/* Opciones de Perfil del Usuario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', paddingBottom: '8px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.8px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px' }}>
                OPCIONES DE PERFIL
              </div>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: '12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  notify('Ficha institucional del usuario y permisos de sistema');
                }}
              >
                <User size={15} color="#64748b" />
                <span>Mi perfil institucional</span>
              </button>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: '12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  notify('Configuración de cuenta y notificaciones territoriales');
                }}
              >
                <Sliders size={15} color="#64748b" />
                <span>Preferencias de la cuenta</span>
              </button>
            </div>

            {/* Selector Especial con CHECK para Cambiar de Usuario */}
            <div>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 800,
                  letterSpacing: '0.8px',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  marginBottom: '8px',
                }}
              >
                CAMBIAR PERSPECTIVA DE USUARIO
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {/* Opción 1: Gestora Territorial (María Salazar) */}
                <div
                  onClick={() => handleSelectRole('gestor')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: userRole === 'gestor' ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                    background: userRole === 'gestor' ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Seleccionar perspectiva: Gestora Territorial"
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: userRole === 'gestor' ? '2px solid #2563eb' : '2px solid #cbd5e1',
                      background: userRole === 'gestor' ? '#2563eb' : '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    {userRole === 'gestor' && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>María Salazar</strong>
                      {userRole === 'gestor' && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a' }}>● Activo</span>
                      )}
                    </div>
                    <small style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                      Gestora Territorial (Monitoreo Operativo)
                    </small>
                  </div>
                </div>

                {/* Opción 2: Coordinador General (Carlos Mendoza) */}
                <div
                  onClick={() => handleSelectRole('coordinador')}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px',
                    borderRadius: '8px',
                    border: userRole === 'coordinador' ? '1.5px solid #0f172a' : '1px solid #e2e8f0',
                    background: userRole === 'coordinador' ? '#f8fafc' : '#ffffff',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  title="Seleccionar perspectiva: Coordinador General"
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      border: userRole === 'coordinador' ? '2px solid #0f172a' : '2px solid #cbd5e1',
                      background: userRole === 'coordinador' ? '#0f172a' : '#ffffff',
                      display: 'grid',
                      placeItems: 'center',
                      color: '#ffffff',
                      flexShrink: 0,
                    }}
                  >
                    {userRole === 'coordinador' && <Check size={12} strokeWidth={3} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '13px', color: '#0f172a' }}>Carlos Mendoza</strong>
                      {userRole === 'coordinador' && (
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#16a34a' }}>● Activo</span>
                      )}
                    </div>
                    <small style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>
                      Coordinador General (Creación de Proyectos y Gantt)
                    </small>
                  </div>
                </div>
              </div>
            </div>

            {/* Cerrar sesión */}
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '8px' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#dc2626',
                  fontSize: '12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                }}
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  notify('Sesión cerrada en modo demostración');
                }}
              >
                <LogOut size={15} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
