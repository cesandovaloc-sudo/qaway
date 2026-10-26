import React from 'react';
import type { ModuleKey, UserRole } from '../types';
import { Bell, ChevronDown, ChevronRight, CircleHelp } from 'lucide-react';

interface TopbarProps {
  activeModule: ModuleKey;
  userRole: UserRole;
  onToggleRole: () => void;
  notify: (msg: string) => void;
}

const MODULE_LABELS: Record<ModuleKey, string> = {
  resumen: 'Resumen del proyecto',
  cronograma: 'Cronograma del proyecto',
  tareas: 'Tareas',
  hitos: 'Hitos rectores',
  reuniones: 'Reuniones',
  reportes: 'Reportes y estadísticas',
  usuarios: 'Equipo del proyecto',
  actas: 'Actas y acuerdos',
};

export default function Topbar({
  activeModule,
  userRole,
  onToggleRole,
  notify,
}: TopbarProps) {
  return (
    <header className="qm-topbar">
      {/* Breadcrumb oficial en el extremo izquierdo */}
      <div className="qm-topbar-left">
        <span>MINEDU</span>
        <ChevronRight size={13} color="#94a3b8" />
        <span>Dotación 2027</span>
        <ChevronRight size={13} color="#94a3b8" />
        <b>{MODULE_LABELS[activeModule] || 'Panel'}</b>
      </div>

      {/* Acciones institucionales y conmutador de perfil en el extremo derecho */}
      <div className="qm-topbar-right">
        <button
          className="qm-topbar-btn"
          aria-label="Ayuda del sistema"
          title="Ayuda y documentación normativa"
          onClick={() =>
            notify('MINEDU - DIGERE · Guía oficial de uso para el monitoreo territorial')
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

        {/* Conmutador reactivo de Usuario / Rol en el Topbar */}
        <div
          className="qm-topbar-profile"
          onClick={onToggleRole}
          title="Clic aquí para alternar rol: Gestora Territorial (María Salazar) ↔ Coordinador General (Carlos Mendoza)"
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
          <ChevronDown size={14} color="#64748b" />
        </div>
      </div>
    </header>
  );
}
