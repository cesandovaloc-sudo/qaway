// Sidebar único y persistente de "Qaway Gestor de Proyectos".
// Optimizado para altura 100vh sin scroll y con Configuración en la base.
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ModuleKey, UserRole } from '../types';
import {
  BarChart3,
  Building2,
  CalendarDays,
  Check,
  CheckSquare,
  ChevronDown,
  FileText,
  Flag,
  LayoutDashboard,
  Plus,
  Settings,
  UserRound,
  Users
} from 'lucide-react';

export interface ProjectSummary {
  id: string;
  code: string;
  name: string;
  region: string;
  subtext?: string | undefined;
}

type SidebarProps = {
  active: ModuleKey;
  onModule: (k: ModuleKey) => void;
  tasksCount: number;
  notifyActive: (m: string) => void;
  setTasksView?: (v: string) => void;
  userRole: UserRole;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  projects?: ProjectSummary[];
  activeProjectId?: string;
  onSelectProject?: (id: string) => void;
  onOpenCreateProject?: () => void;
};

export default function Sidebar({
  active,
  onModule,
  tasksCount,
  notifyActive,
  userRole,
  collapsed = false,
  onToggleCollapse,
  projects = [
    { id: 'p1', code: 'PRJ-MIN-2027-01', name: 'Distribución de Materiales DOT 2027', region: 'Junín', subtext: 'Seguimiento de operaciones' },
  ],
  activeProjectId = 'p1',
  onSelectProject,
  onOpenCreateProject,
}: SidebarProps) {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) =>
      a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
    );
  }, [projects]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (projectDropdownRef.current && !projectDropdownRef.current.contains(e.target as Node)) {
        setIsProjectMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">q</div>
        <div>
          <b>qaway</b>
          <small>GESTOR DE PROYECTOS</small>
        </div>
      </div>

      {/* Sección Proyecto Activo */}
      <div style={{ position: 'relative' }} ref={projectDropdownRef}>
        <div className="side-label">PROYECTO ACTIVO</div>

        <div
          className="project"
          onClick={() => setIsProjectMenuOpen((prev) => !prev)}
          style={{ cursor: 'pointer', marginBottom: '19px' }}
          title="Clic para seleccionar proyecto regional"
        >
          <i style={{ background: userRole === 'coordinador' ? '#60a5fa' : '#7388e2' }} />
          <div>
            <b>{activeProject?.name || 'Distribución de Materiales DOT 2027'}</b>
            {activeProject?.code && <small>{activeProject.code}</small>}
          </div>
          <ChevronDown
            size={15}
            style={{
              transform: isProjectMenuOpen ? 'rotate(180deg)' : 'none',
              transition: 'transform 0.2s',
            }}
          />
        </div>

        {/* Desplegable de selección de proyectos */}
        {isProjectMenuOpen && (
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              zIndex: 100,
              background: '#19283b',
              border: '1px solid #35465a',
              borderRadius: '8px',
              padding: '8px',
              boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ fontSize: '9px', fontWeight: 700, color: '#8f9fb2', padding: '2px 6px', letterSpacing: '0.8px' }}>
              PROYECTOS REGIONALES
            </div>
            {sortedProjects.map((p) => {
              const isSelected = p.id === activeProjectId;
              return (
                <div
                  key={p.id}
                  onClick={() => {
                    onSelectProject?.(p.id);
                    setIsProjectMenuOpen(false);
                    notifyActive(`Proyecto activo cambiado a: ${p.name}`);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 8px',
                    borderRadius: '6px',
                    background: isSelected ? '#26384d' : 'transparent',
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #3c519e' : '1px solid transparent',
                  }}
                >
                  <div
                    style={{
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      background: isSelected ? '#60a5fa' : '#64748b',
                      flexShrink: 0,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <b
                      style={{
                        display: 'block',
                        fontSize: '11px',
                        color: '#ffffff',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {p.name}
                    </b>
                    <small style={{ display: 'block', fontSize: '9.5px', color: '#94a3b8' }}>
                      {p.code}
                    </small>
                  </div>
                  {isSelected && <Check size={12} color="#60a5fa" />}
                </div>
              );
            })}

            {/* Acción de creación al final del desplegable (Exclusivo Coordinador) */}
            {userRole === 'coordinador' && (
              <button
                onClick={() => {
                  setIsProjectMenuOpen(false);
                  onOpenCreateProject?.();
                }}
                style={{
                  marginTop: '6px',
                  padding: '7px 10px',
                  background: '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '11px',
                  fontWeight: 650,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'background 0.15s ease',
                }}
              >
                <Plus size={13} />
                <span>Crear nuevo proyecto</span>
              </button>
            )}
          </div>
        )}
      </div>

      <div className="side-label">PROYECTO</div>
      <button
        className={active === 'resumen' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('resumen')}
      >
        <LayoutDashboard size={18} />
        <span>Resumen del proyecto</span>
      </button>

      <button
        className={active === 'cronograma' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('cronograma')}
      >
        <CalendarDays size={18} />
        <span>Proyecto</span>
      </button>

      <button
        className={active === 'sedes' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('sedes')}
      >
        <Building2 size={18} />
        <span>Sedes</span>
      </button>

      <button
        className={active === 'tareas' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('tareas')}
      >
        <CheckSquare size={18} />
        <span>Tareas</span>
        <em>{tasksCount}</em>
      </button>

      <button
        className={active === 'hitos' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('hitos')}
      >
        <Flag size={18} />
        <span>Componentes</span>
      </button>

      <button
        className={active === 'reuniones' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('reuniones')}
      >
        <Users size={18} />
        <span>Reuniones</span>
      </button>

      <button
        className={active === 'reportes' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('reportes')}
      >
        <BarChart3 size={18} />
        <span>Reportes</span>
      </button>

      <button
        className={active === 'usuarios' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('usuarios')}
      >
        <UserRound size={18} />
        <span>Equipo</span>
      </button>

      <button
        className={active === 'actas' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('actas')}
      >
        <FileText size={18} />
        <span>Actas y acuerdos</span>
      </button>

      {/* Espacio flexible para empujar la configuración al fondo */}
      <div style={{ flex: 1, minHeight: '15px' }} />

      {/* Configuración en la base del sidebar */}
      <div style={{ borderTop: '1px solid #35465a', paddingTop: '10px' }}>
        <button
          className={active === 'configuracion' ? 'side-link active' : 'side-link'}
          style={{ width: '100%', marginBottom: 0 }}
          onClick={() => onModule('configuracion')}
        >
          <Settings size={18} />
          <span>Configuración</span>
        </button>
      </div>
    </aside>
  );
}
