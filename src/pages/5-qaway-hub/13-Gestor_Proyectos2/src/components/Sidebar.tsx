// Sidebar único y persistente de "Qaway Gestor de Proyectos".
// Optimizado para altura 100vh sin scroll y con Configuración en la base.
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { ModuleKey, UserRole } from '../types';
import { MODULE_SLUGS } from '../types';
import { listGestorUnits } from '../services/gestorOrganizacionService';
import { fetchCronogramaFromSupabase } from '../services/gestorCronogramaService';
import { usePerfilVisible } from '../services/perfilVisibleService';
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
  /** 6-D: capacidad real de UI (sesión) o fallback demo por perspectiva. */
  canCreateProject?: boolean;
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
  canCreateProject,
  collapsed = false,
  onToggleCollapse,
  projects = [],
  activeProjectId = '',
  onSelectProject,
  onOpenCreateProject,
}: SidebarProps) {
  const puedeCrearProyecto = canCreateProject ?? userRole === 'coordinador';
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState(false);
  const projectDropdownRef = useRef<HTMLDivElement>(null);

  /**
   * P5 (auditoría 08): el viaje de red arranca en la INTENCIÓN del clic y no al montar el pane.
   * Los servicios compartidos (dedup en vuelo) hacen que el montaje reutilice exactamente la
   * misma promesa ya en vuelo: cero duplicación de red, cero bytes extra.
   */
  const unidadesPrefetch: ModuleKey[] = ['cronograma', 'sedes', 'usuarios', 'tareas2', 'reuniones2', 'reportes2'];
  const cronogramaPrefetch: ModuleKey[] = ['cronograma', 'tareas2', 'reuniones2', 'reportes2'];

  const handleModule = (k: ModuleKey) => {
    try {
      if (unidadesPrefetch.includes(k)) {
        listGestorUnits().catch(() => { /* sin red: cada vista usa su respaldo local */ });
      }
      if (cronogramaPrefetch.includes(k)) {
        fetchCronogramaFromSupabase(activeProjectId).catch(() => { /* respaldo local */ });
      }
    } catch {
      /* prefetch best-effort, nunca bloquea la navegación */
    }
    onModule(k);
  };

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

  const { perfil: perfilVisible } = usePerfilVisible();
  const empresaNombre = String(perfilVisible?.tenant?.name || '').trim() || 'qaway';
  const empresaLogoUrl =
    typeof perfilVisible?.tenant?.branding?.logo_url === 'string'
      ? perfilVisible.tenant.branding.logo_url
      : '';
  const logoMarcoBlanco = Boolean(perfilVisible?.tenant?.branding?.logo_marco_blanco);
  const empresaInicial = empresaNombre.charAt(0).toUpperCase() || 'q';

  const onLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, k: ModuleKey) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    e.preventDefault();
    handleModule(k);
  };

  return (
    <aside className="sidebar">
      <a
        href={MODULE_SLUGS.resumen}
        className="brand"
        title="Ir al inicio (Resumen del proyecto)"
        onClick={(e) => onLinkClick(e, 'resumen')}
        style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
      >
        {empresaLogoUrl ? (
          <img
            src={empresaLogoUrl}
            alt={empresaNombre}
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              objectFit: 'contain',
              ...(logoMarcoBlanco ? { background: '#ffffff', padding: '2px' } : {}),
              flexShrink: 0,
            }}
          />
        ) : (
          <div className="brand-mark">{empresaInicial}</div>
        )}
        <div style={{ minWidth: 0 }}>
          <b style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {empresaNombre}
          </b>
          <small>GESTOR DE PROYECTOS</small>
        </div>
      </a>

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
            <b>{activeProject?.name || 'Sin proyectos'}</b>
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

            {/* Acción de creación: capacidad real (6-B/6-D) o perspectiva demo */}
            {puedeCrearProyecto && (
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
      <a
        href={MODULE_SLUGS.resumen}
        className={active === 'resumen' ? 'side-link active' : 'side-link'}
        style={{ textDecoration: 'none' }}
        onClick={(e) => onLinkClick(e, 'resumen')}
      >
        <LayoutDashboard size={18} />
        <span>Resumen</span>
      </a>

      <a
        href={MODULE_SLUGS.cronograma}
        className={active === 'cronograma' ? 'side-link active' : 'side-link'}
        style={{ textDecoration: 'none' }}
        onClick={(e) => onLinkClick(e, 'cronograma')}
      >
        <CalendarDays size={18} />
        <span>Proyecto</span>
      </a>

      <a
        href={MODULE_SLUGS.sedes}
        className={active === 'sedes' ? 'side-link active' : 'side-link'}
        style={{ textDecoration: 'none' }}
        onClick={(e) => onLinkClick(e, 'sedes')}
      >
        <Building2 size={18} />
        <span>Sedes</span>
      </a>

      <a
        href={MODULE_SLUGS.usuarios}
        className={active === 'usuarios' ? 'side-link active' : 'side-link'}
        style={{ textDecoration: 'none' }}
        onClick={(e) => onLinkClick(e, 'usuarios')}
      >
        <UserRound size={18} />
        <span>Equipo</span>
      </a>
      <a
        href={MODULE_SLUGS.tareas2}
        className={active === 'tareas2' ? 'side-link active' : 'side-link'}
        style={{ textDecoration: 'none' }}
        onClick={(e) => onLinkClick(e, 'tareas2')}
      >
        <CheckSquare size={18} />
        <span>Tareas</span>
      </a>

      <a
        href={MODULE_SLUGS.reuniones}
        className={active === 'reuniones' ? 'side-link active' : 'side-link'}
        style={{ textDecoration: 'none' }}
        onClick={(e) => onLinkClick(e, 'reuniones')}
      >
        <Users size={18} />
        <span>Reuniones</span>
      </a>
      <a
        href={MODULE_SLUGS.reuniones2}
        className={active === 'reuniones2' ? 'side-link active' : 'side-link'}
        style={{ textDecoration: 'none' }}
        onClick={(e) => onLinkClick(e, 'reuniones2')}
      >
        <CalendarDays size={18} />
        <span>Agenda</span>
      </a>

      <a
        href={MODULE_SLUGS.reportes2}
        className={active === 'reportes2' ? 'side-link active' : 'side-link'}
        style={{ textDecoration: 'none' }}
        onClick={(e) => onLinkClick(e, 'reportes2')}
      >
        <BarChart3 size={18} />
        <span>Reportes</span>
      </a>

      {/* PRUEBAS queda oculto temporalmente para no cargar sus librerías experimentales. */}

      {/* Espacio flexible para empujar la configuración al fondo */}
      <div style={{ flex: 1, minHeight: '15px' }} />

      {/* Configuración en la base del sidebar */}
      <div style={{ borderTop: '1px solid #35465a', paddingTop: '10px' }}>
        <a
          href={MODULE_SLUGS.configuracion}
          className={active === 'configuracion' ? 'side-link active' : 'side-link'}
          style={{ width: '100%', marginBottom: 0, textDecoration: 'none' }}
          onClick={(e) => onLinkClick(e, 'configuracion')}
        >
          <Settings size={18} />
          <span>Configuración</span>
        </a>
        {!collapsed && (
          <div
            style={{
              marginTop: '8px',
              padding: '4px 6px 0',
              fontSize: '10px',
              lineHeight: 1.35,
              color: '#64748b',
              textAlign: 'center',
            }}
          >
            Sistema creado por Qaway Lab · Derechos reservados
          </div>
        )}
      </div>
    </aside>
  );
}
