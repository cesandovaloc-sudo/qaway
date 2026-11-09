import React, { useState, useRef, useEffect } from 'react';
import type { ModuleKey, UserRole } from '../types';
import { NotificationPopover } from './NotificationPopover';
import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  LogOut,
  Mail,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface TopbarProps {
  activeModule: ModuleKey;
  userRole: UserRole;
  onChangeRole: (role: UserRole) => void;
  notify: (msg: string) => void;
  sidebarCollapsed?: boolean;
  onToggleSidebar?: () => void;
  activeProject?: {
    id: string;
    code: string;
    name: string;
    region: string;
    subtext?: string | undefined;
  } | undefined;
}

const MODULE_LABELS: Record<ModuleKey, string> = {
  resumen: 'Resumen del proyecto',
  cronograma: 'Proyecto',
  sedes: 'Sedes',
  tareas: 'Tareas',
  tareas2: 'Tareas 2',
  hitos: 'Componentes del proyecto',
  reuniones: 'Reuniones',
  reuniones2: 'Reuniones 2',
  reportes: 'Reportes y estadísticas',
  reportes2: 'Reportes 2',
  usuarios: 'Equipo del proyecto',
  actas: 'Actas y acuerdos',
  pruebas: 'PRUEBAS',
  configuracion: 'Configuración del sistema',
};

export default function Topbar({
  activeModule,
  userRole,
  onChangeRole,
  notify,
  sidebarCollapsed = false,
  onToggleSidebar,
  activeProject,
}: TopbarProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileTriggerRef = useRef<HTMLDivElement | null>(null);

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
        ? 'Perspectiva cambiada: Carlos Sandoval (Coordinador General · Creación de Proyectos y Gantt)'
        : 'Perspectiva cambiada: María Salazar (Gestora Territorial · Monitoreo Operativo)'
    );
  };

  const projectContext = activeProject?.subtext || activeProject?.region || 'Qaway Lab';
  const projectName = activeProject?.name || 'Proyecto';

  return (
    <header className="qm-topbar">
      {/* Botón de colapso/expansión del Sidebar + Breadcrumb dinámico sincronizado con el proyecto activo */}
      <div className="qm-topbar-left">
        {onToggleSidebar && (
          <button
            type="button"
            className="qm-topbar-btn qm-btn-toggle-sidebar"
            onClick={onToggleSidebar}
            title={sidebarCollapsed ? 'Expandir panel lateral' : 'Colapsar panel lateral'}
            aria-label={sidebarCollapsed ? 'Expandir panel lateral' : 'Colapsar panel lateral'}
          >
            {sidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
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

        <NotificationPopover />

        {/* Botón de Perfil en Topbar */}
        <div
          ref={profileTriggerRef}
          className="qm-topbar-profile"
          onClick={() => setIsProfileMenuOpen((prev) => !prev)}
          title="Opciones de perfil institucional"
          style={{
            borderColor: isProfileMenuOpen ? '#0066ff' : '#e2e8f0',
            boxShadow: isProfileMenuOpen ? '0 0 0 3px rgba(0, 102, 255, 0.15)' : 'none',
            background: isProfileMenuOpen ? '#f8faff' : '#ffffff',
          }}
        >
          <div
            className="qm-topbar-avatar"
            style={{
              background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
              color: '#ffffff',
              boxShadow: '0 2px 6px rgba(0, 102, 255, 0.28)',
            }}
          >
             CS
          </div>
          <div className="qm-topbar-profile-info">
            <b>Carlos Sandoval</b>
            <small>Coordinador General</small>
          </div>
          <ChevronDown
            size={14}
            color="#64748b"
            style={{
              transform: isProfileMenuOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>

        {/* Menú Desplegable de Perfil */}
        {isProfileMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '52px',
              right: '0',
              width: '310px',
              background: '#ffffff',
              borderRadius: '14px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 16px 36px -4px rgba(15, 23, 42, 0.14), 0 4px 12px -2px rgba(15, 23, 42, 0.06)',
              zIndex: 9999,
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              animation: 'qmFadeInScale 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            {/* Header de Usuario Activo */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '14px', borderBottom: '1px solid #f1f5f9' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  display: 'grid',
                  placeItems: 'center',
                  fontSize: '14px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #0066ff 0%, #0052cc 100%)',
                  color: '#ffffff',
                  boxShadow: '0 3px 8px rgba(0, 102, 255, 0.3)',
                  flexShrink: 0,
                }}
              >
                CM
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <b style={{ fontSize: '14px', color: '#0f172a', display: 'block', fontWeight: 700, lineHeight: 1.3 }}>
                  Carlos Sandoval
                </b>
                <span style={{ fontSize: '12px', color: '#64748b', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                  csandoval.digere@gmail.com
                </span>
                <span
                  style={{
                    display: 'inline-block',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '6px',
                    background: '#eff6ff',
                    color: '#0066ff',
                    border: '1px solid #bfdbfe',
                    marginTop: '5px',
                    letterSpacing: '0.2px',
                  }}
                >
                  Coordinador General
                </span>
              </div>
            </div>

            {/* Opciones de Perfil del Usuario */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingBottom: '10px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ fontSize: '10.5px', fontWeight: 800, letterSpacing: '0.6px', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '4px', paddingLeft: '4px' }}>
                OPCIONES DE PERFIL
              </div>
              <button
                className="qm-profile-dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#0066ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#334155';
                }}
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  notify('Ficha institucional del usuario y permisos de sistema');
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#eff6ff', display: 'grid', placeItems: 'center', color: '#0066ff', flexShrink: 0 }}>
                  <UserRound size={15} />
                </div>
                <span>Mi perfil institucional</span>
              </button>
              <button
                className="qm-profile-dropdown-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 500,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s, color 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#f8fafc';
                  e.currentTarget.style.color = '#0066ff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#334155';
                }}
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  notify('Configuración de cuenta y notificaciones territoriales');
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#f1f5f9', display: 'grid', placeItems: 'center', color: '#475569', flexShrink: 0 }}>
                  <SlidersHorizontal size={15} />
                </div>
                <span>Preferencias de la cuenta</span>
              </button>
            </div>

            {/* Cerrar sesión */}
            <div style={{ paddingTop: '2px' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 10px',
                  border: 'none',
                  background: 'transparent',
                  color: '#dc2626',
                  fontSize: '13px',
                  fontWeight: 600,
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#fef2f2';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                }}
                onClick={() => {
                  setIsProfileMenuOpen(false);
                  notify('Sesión cerrada en modo demostración');
                }}
              >
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: '#fee2e2', display: 'grid', placeItems: 'center', color: '#dc2626', flexShrink: 0 }}>
                  <LogOut size={15} />
                </div>
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
