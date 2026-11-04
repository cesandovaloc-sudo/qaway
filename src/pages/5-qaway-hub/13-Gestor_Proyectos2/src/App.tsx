// Shell maestro consolidado: Sidebar único persistente + Canvas conmutable.
// Los tres módulos viven nativamente en src/modules (sin alias ni subproyectos).
// Keep-alive: los canvas permanecen montados (display:none en el inactivo) para
// preservar estado de UI/filtros/drawer y eliminar el parpadeo al alternar.
import { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { ModuleKey, UserRole } from './types';
import { MODULE_STORAGE_KEY, MODULE_SLUGS, SLUG_TO_MODULE, TAREAS_SEED_COUNT, USER_ROLE_STORAGE_KEY } from './types';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CreateProjectModal from './components/CreateProjectModal';
import ResumenProyectoView from './modules/resumen/ResumenProyectoView';
import TareasView from './modules/tareas/TareasView';
import SedesView from './modules/sedes/SedesView';
import CronogramaView from './modules/cronograma/CronogramaView';
import CronogramaGanttView from './modules/cronograma-gantt/CronogramaGanttView';
import ReunionesView from './modules/reuniones/ReunionesView';
import ReporteadorView from './modules/reporteador/ReporteadorView';
import EquipoView from './modules/equipo/EquipoView';
import HitosView from './modules/hitos/HitosView';
import ActasAcuerdosView from './modules/actas/ActasAcuerdosView';
import ConfiguracionView from './modules/configuracion/ConfiguracionView';
import FloatingChatAssistant from './components/FloatingChatAssistant';

type Binds = { notify: (m: string) => void; setView?: (v: string) => void };

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  region: string;
  subtext?: string;
  budget?: string;
  sponsor?: string;
  riskLevel?: string;
  metodologia?: string;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'p1',
    code: 'PRJ-OPS-2027-01',
    name: 'Programa Maestro Operativo 2027',
    region: 'Junín',
    subtext: 'Seguimiento de operaciones',
    budget: 'S/ 850,000',
    sponsor: 'Comité Directivo',
    riskLevel: 'Medio',
    metodologia: 'Híbrido: Hitos Clave + Tareas de Campo',
  },
];

const readStoredModule = (): ModuleKey => {
  try {
    const saved = localStorage.getItem(MODULE_STORAGE_KEY) as ModuleKey;
    const validModules: ModuleKey[] = ['resumen', 'cronograma', 'sedes', 'tareas', 'hitos', 'reuniones', 'reportes', 'usuarios', 'actas', 'configuracion'];
    if (validModules.includes(saved)) return saved;
    return 'tareas'; // estado de reposo que refleja el diseño del sidebar (Tareas activo)
  } catch {
    return 'tareas';
  }
};

const resolveModuleFromPath = (path: string): ModuleKey => {
  try {
    const clean = path.replace(/\/+$/, '') || '/';
    if (SLUG_TO_MODULE[clean]) {
      return SLUG_TO_MODULE[clean];
    }
  } catch {
    /* fallback */
  }
  return readStoredModule();
};

const seedTasksCount = (): number => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('qaway-tasks-v1') || 'null');
    return Array.isArray(parsed) && parsed.every((x) => typeof x === 'object') ? parsed.length : TAREAS_SEED_COUNT;
  } catch {
    return TAREAS_SEED_COUNT;
  }
};

const readStoredRole = (): UserRole => {
  return 'coordinador';
};

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  // Módulo activo unificado: la URL canónica es la fuente única de verdad (cero rebotes)
  const active: ModuleKey = resolveModuleFromPath(location.pathname);
  const [tasksCount, setTasksCount] = useState<number>(seedTasksCount);
  const [userRole, setUserRole] = useState<UserRole>(readStoredRole);
  const [cronogramaPerspective, setCronogramaPerspective] = useState<'maestro' | 'territorial'>(() =>
    readStoredRole() === 'coordinador' ? 'maestro' : 'territorial'
  );

  const [projects, setProjects] = useState<ProjectItem[]>(() => {
    try {
      const stored = localStorage.getItem('qaway-gp-projects-v1');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const defaultProject = DEFAULT_PROJECTS[0];
          const userProject = parsed.find((p: ProjectItem) => p.id !== 'p1');
          if (userProject) {
            const twoOnly = [userProject, defaultProject];
            localStorage.setItem('qaway-gp-projects-v1', JSON.stringify(twoOnly));
            return twoOnly;
          }
          return [defaultProject];
        }
      }
    } catch {
      /* fallback */
    }
    return DEFAULT_PROJECTS;
  });
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem('qaway-gp-active-project-id');
      if (saved) return saved;
    } catch {
      /* fallback */
    }
    return 'p1';
  });
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('qaway-sidebar-collapsed');
      if (saved !== null) return saved === 'true';
      return window.innerWidth < 1024;
    } catch {
      return false;
    }
  });

  const toggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('qaway-sidebar-collapsed', String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 960 && !sidebarCollapsed) {
        setSidebarCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarCollapsed]);

  useEffect(() => {
    try {
      localStorage.setItem('qaway-gp-active-project-id', activeProjectId);
    } catch {
      /* fallback */
    }
  }, [activeProjectId]);

  const binds = useRef<Partial<Record<ModuleKey, Binds>>>({});

  // Sincronizar y redirigir a ruta canónica con prefijo /hub/gestor_proyecto
  useEffect(() => {
    const clean = location.pathname.replace(/\/+$/, '') || '/';
    const matched = SLUG_TO_MODULE[clean];
    const canonicalSlug = MODULE_SLUGS[active];

    if (matched) {
      // Si entró por un alias corto (ej. /reuniones), asegurar la URL canónica con prefijo
      if (location.pathname !== MODULE_SLUGS[matched]) {
        navigate(MODULE_SLUGS[matched], { replace: true });
      }
    } else {
      // Si la ruta es '/', '/hub/gestor_proyecto' o desconocida, llevar al slug canónico del módulo activo
      if (location.pathname !== canonicalSlug) {
        navigate(canonicalSlug, { replace: true });
      }
    }
  }, [location.pathname, active, navigate]);

  useEffect(() => {
    try {
      localStorage.setItem(MODULE_STORAGE_KEY, active);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [active]);

  useEffect(() => {
    try {
      localStorage.setItem(USER_ROLE_STORAGE_KEY, userRole);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [userRole]);

  useEffect(() => {
    try {
      localStorage.setItem('qaway-gp-projects-v1', JSON.stringify(projects));
    } catch {
      /* almacenamiento no disponible */
    }
  }, [projects]);

  const handleSelectModule = (next: ModuleKey) => {
    try {
      localStorage.setItem(MODULE_STORAGE_KEY, next);
    } catch {
      /* almacenamiento no disponible */
    }
    const targetSlug = MODULE_SLUGS[next];
    if (targetSlug && location.pathname !== targetSlug) {
      navigate(targetSlug);
    }
  };

  const handleChangeRole = (next: UserRole) => {
    setUserRole(next);
    setCronogramaPerspective(next === 'coordinador' ? 'maestro' : 'territorial');
    notifyActive(
      next === 'coordinador'
        ? 'Perspectiva: Carlos Mendoza (Coordinador General - Control de Proyectos y Gantt)'
        : 'Perspectiva: María Salazar (Gestora Territorial - Monitoreo Operativo)'
    );
  };

  const handleCreateProject = (newProj: {
    id: string;
    code: string;
    name: string;
    region: string;
    entidad: string;
    metodologia: string;
    budget?: string;
    sponsor?: string;
    riskLevel?: string;
  }) => {
    const item: ProjectItem = {
      id: newProj.id,
      code: newProj.code,
      name: newProj.name,
      region: newProj.region,
      subtext: newProj.entidad,
      budget: newProj.budget,
      sponsor: newProj.sponsor,
      riskLevel: newProj.riskLevel,
      metodologia: newProj.metodologia,
    };
    try {
      localStorage.setItem(`qaway-gantt-items-${item.id}`, JSON.stringify([]));
    } catch {
      /* fallback */
    }
    setProjects((prev) => [item, ...prev]);
    setActiveProjectId(item.id);
    navigate(MODULE_SLUGS['cronograma']);
    setCronogramaPerspective('maestro');
    notifyActive(`Proyecto "${item.name}" creado con éxito. Cronograma maestro y frentes listos.`);
  };

  const handleDeleteProject = (id: string) => {
    try {
      localStorage.removeItem(`qaway-gantt-items-${id}`);
    } catch {
      /* fallback */
    }
    setProjects((prev) => {
      const next = prev.filter((p) => p.id !== id);
      const finalProjects =
        next.length > 0
          ? next
          : [
              {
                id: 'p-' + Date.now().toString(36),
                code: 'PRJ-01',
                name: 'Nuevo Proyecto',
                region: 'General',
                subtext: 'Seguimiento de operaciones',
                budget: 'S/ 0',
                sponsor: 'Comité Directivo',
                riskLevel: 'Bajo',
                metodologia: 'Híbrido: Hitos Clave + Tareas de Campo',
              },
            ];
      try {
        localStorage.setItem('qaway-gp-projects-v1', JSON.stringify(finalProjects));
      } catch {
        /* fallback */
      }
      const nextActiveId = finalProjects[0].id;
      setActiveProjectId(nextActiveId);
      navigate(MODULE_SLUGS['cronograma']);
      return finalProjects;
    });
    notifyActive('Proyecto eliminado definitivamente. Se abrió el cronograma del proyecto activo.');
  };

  const handleUpdateProject = (updated: ProjectItem) => {
    setProjects((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      try {
        localStorage.setItem('qaway-gp-projects-v1', JSON.stringify(next));
      } catch {
        /* fallback */
      }
      return next;
    });
    notifyActive(`Proyecto "${updated.name}" actualizado con éxito.`);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const notifyActive = (m: string) => {
    binds.current[active]?.notify(m);
  };

  const setTasksView = (v: string) => {
    binds.current['tareas']?.setView?.(v);
  };

  return (
    <div className={`qm-root ${sidebarCollapsed ? 'qm-sidebar-is-collapsed' : ''}`}>
      <div className={`qm-side qt-v2 ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <Sidebar
          active={active}
          onModule={handleSelectModule}
          tasksCount={tasksCount}
          notifyActive={notifyActive}
          setTasksView={setTasksView}
          userRole={userRole}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={setActiveProjectId}
          onOpenCreateProject={() => setIsCreateProjectOpen(true)}
        />
      </div>
      <div className="qm-main-container">
        <Topbar
          activeModule={active}
          userRole={userRole}
          onChangeRole={handleChangeRole}
          notify={notifyActive}
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={toggleSidebar}
          activeProject={activeProject}
        />
        <main className="qm-canvas">
          <div className={active === 'resumen' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <ResumenProyectoView
              userRole={userRole}
              onOpenCreateProject={() => setIsCreateProjectOpen(true)}
              onActions={(h) => { binds.current['resumen'] = h; }}
            />
          </div>
          <div className={active === 'tareas' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <TareasView
              activeProject={activeProject}
              onTasksCount={setTasksCount}
              onActions={(h) => { binds.current['tareas'] = h; }}
            />
          </div>
          <div
            className={
              active === 'cronograma' && cronogramaPerspective === 'maestro'
                ? 'gantt-v2 qm-pane-active'
                : 'gantt-v2 qm-pane'
            }
          >
            <CronogramaGanttView
              activeProject={activeProject}
              onSwitchPerspective={setCronogramaPerspective}
              onActions={(h) => { binds.current['cronograma'] = h; }}
            />
          </div>
          <div className={active === 'sedes' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <SedesView
              activeProjectId={activeProjectId}
              onActions={(h) => { binds.current['sedes'] = h; }}
            />
          </div>
          <div
            className={
              active === 'cronograma' && cronogramaPerspective === 'territorial'
                ? 'qc-v1 qm-pane-active'
                : 'qc-v1 qm-pane'
            }
          >
            <CronogramaView
              onSwitchPerspective={setCronogramaPerspective}
              onActions={(h) => { binds.current['cronograma'] = h; }}
            />
          </div>
          <div className={active === 'hitos' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <HitosView onActions={(h) => { binds.current['hitos'] = h; }} />
          </div>
          <div className={active === 'reuniones' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <ReunionesView onActions={(h) => { binds.current['reuniones'] = h; }} />
          </div>
          <div className={active === 'reportes' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <ReporteadorView onActions={(h) => { binds.current['reportes'] = h; }} />
          </div>
          <div className={active === 'usuarios' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <EquipoView
              activeProject={activeProject}
              onActions={(h) => { binds.current['usuarios'] = h; }}
            />
          </div>
          <div className={active === 'actas' ? 'act-v1 qm-pane-active' : 'act-v1 qm-pane'}>
            <ActasAcuerdosView onActions={(h) => { binds.current['actas'] = h; }} />
          </div>
          <div className={active === 'configuracion' ? 'cfg-v1 qm-pane-active' : 'cfg-v1 qm-pane'}>
            <ConfiguracionView
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={setActiveProjectId}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onActions={(h) => { binds.current['configuracion'] = h; }}
            />
          </div>
        </main>
      </div>

      {/* Modal para Crear Nuevo Proyecto Regional (Exclusivo Coordinador) */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreate={handleCreateProject}
      />

      {/* Asistente Territorial con IA Flotante (Context-Aware para todos los módulos) */}
      <FloatingChatAssistant
        activeModule={active}
        userRole={userRole}
        onNavigateModule={handleSelectModule}
        notify={notifyActive}
      />
    </div>
  );
}

export default App;
