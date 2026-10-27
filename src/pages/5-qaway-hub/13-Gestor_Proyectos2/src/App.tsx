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
import CronogramaView from './modules/cronograma/CronogramaView';
import CronogramaGanttView from './modules/cronograma-gantt/CronogramaGanttView';
import ReunionesView from './modules/reuniones/ReunionesView';
import ReporteadorView from './modules/reporteador/ReporteadorView';
import UsuariosView from './modules/usuarios/UsuariosView';
import HitosView from './modules/hitos/HitosView';
import ActasAcuerdosView from './modules/actas/ActasAcuerdosView';

type Binds = { notify: (m: string) => void; setView?: (v: string) => void };

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  region: string;
  subtext?: string;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'p1',
    code: 'PRJ-MIN-2027-01',
    name: 'MINEDU · Dotación 2027',
    region: 'DRE Junín (9 UGEL)',
    subtext: 'Seguimiento regional',
  },
  {
    id: 'p2',
    code: 'PRJ-MIN-2027-02',
    name: 'MINEDU · Conectividad Rural 2027',
    region: 'DRE Cusco (14 UGEL)',
    subtext: 'Infraestructura digital',
  },
];

const readStoredModule = (): ModuleKey => {
  try {
    const saved = localStorage.getItem(MODULE_STORAGE_KEY) as ModuleKey;
    const validModules: ModuleKey[] = ['resumen', 'cronograma', 'tareas', 'hitos', 'reuniones', 'reportes', 'usuarios', 'actas'];
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
  try {
    const saved = localStorage.getItem(USER_ROLE_STORAGE_KEY);
    return saved === 'coordinador' ? 'coordinador' : 'gestor';
  } catch {
    return 'gestor';
  }
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
      if (stored) return JSON.parse(stored);
    } catch {
      /* fallback */
    }
    return DEFAULT_PROJECTS;
  });
  const [activeProjectId, setActiveProjectId] = useState<string>('p1');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);

  const binds = useRef<Partial<Record<ModuleKey, Binds>>>({});

  // Redirigir a ruta canónica si se ingresa a la raíz '/' o a una ruta no mapeada
  useEffect(() => {
    const clean = location.pathname.replace(/\/+$/, '') || '/';
    if (!SLUG_TO_MODULE[clean]) {
      const targetSlug = MODULE_SLUGS[active] || '/resumen';
      navigate(targetSlug, { replace: true });
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
  }) => {
    const item: ProjectItem = {
      id: newProj.id,
      code: newProj.code,
      name: newProj.name,
      region: newProj.region,
      subtext: newProj.entidad,
    };
    setProjects((prev) => [item, ...prev]);
    setActiveProjectId(item.id);
    navigate(MODULE_SLUGS['cronograma']);
    setCronogramaPerspective('maestro');
    notifyActive(`Proyecto regional "${item.name}" creado con éxito. Cronograma maestro listo para configurar.`);
  };

  const notifyActive = (m: string) => {
    binds.current[active]?.notify(m);
  };

  const setTasksView = (v: string) => {
    binds.current['tareas']?.setView?.(v);
  };

  return (
    <div className="qm-root">
      <div className="qm-side qt-v2">
        <Sidebar
          active={active}
          onModule={handleSelectModule}
          tasksCount={tasksCount}
          notifyActive={notifyActive}
          setTasksView={setTasksView}
          userRole={userRole}
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
        />
        <main className="qm-canvas">
          <div className={active === 'resumen' ? 'res-v1 qm-pane-active' : 'res-v1 qm-pane'}>
            <ResumenProyectoView
              userRole={userRole}
              onOpenCreateProject={() => setIsCreateProjectOpen(true)}
              onActions={(h) => { binds.current['resumen'] = h; }}
            />
          </div>
          <div className={active === 'tareas' ? 'qt-v2 qm-pane-active' : 'qt-v2 qm-pane'}>
            <TareasView
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
              onSwitchPerspective={setCronogramaPerspective}
              onActions={(h) => { binds.current['cronograma'] = h; }}
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
          <div className={active === 'hitos' ? 'hit-v1 qm-pane-active' : 'hit-v1 qm-pane'}>
            <HitosView onActions={(h) => { binds.current['hitos'] = h; }} />
          </div>
          <div className={active === 'reuniones' ? 'rm-v1 qm-pane-active' : 'rm-v1 qm-pane'}>
            <ReunionesView onActions={(h) => { binds.current['reuniones'] = h; }} />
          </div>
          <div className={active === 'reportes' ? 'rep-v1 qm-pane-active' : 'rep-v1 qm-pane'}>
            <ReporteadorView onActions={(h) => { binds.current['reportes'] = h; }} />
          </div>
          <div className={active === 'usuarios' ? 'usr-v1 qm-pane-active' : 'usr-v1 qm-pane'}>
            <UsuariosView onActions={(h) => { binds.current['usuarios'] = h; }} />
          </div>
          <div className={active === 'actas' ? 'act-v1 qm-pane-active' : 'act-v1 qm-pane'}>
            <ActasAcuerdosView onActions={(h) => { binds.current['actas'] = h; }} />
          </div>
        </main>
      </div>

      {/* Modal para Crear Nuevo Proyecto Regional (Exclusivo Coordinador) */}
      <CreateProjectModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreate={handleCreateProject}
      />
    </div>
  );
}

export default App;
