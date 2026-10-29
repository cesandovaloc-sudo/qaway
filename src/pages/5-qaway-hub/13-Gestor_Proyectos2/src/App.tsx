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
import UsuariosView from './modules/usuarios/UsuariosView';
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
    code: 'PRJ-MIN-2027-01',
    name: 'MINEDU · Dotación 2027',
    region: 'DRE Junín (9 UGEL)',
    subtext: 'Seguimiento regional',
    budget: 'S/ 850,000',
    sponsor: 'MINEDU - DIGERE',
    riskLevel: 'Medio',
    metodologia: 'Híbrido: Hitos Clave + Tareas de Campo',
  },
  {
    id: 'p2',
    code: 'PRJ-MIN-2027-02',
    name: 'MINEDU · Conectividad Rural 2027',
    region: 'DRE Cusco (14 UGEL)',
    subtext: 'Infraestructura digital',
    budget: 'S/ 1,200,000',
    sponsor: 'MINEDU - PRONATEL',
    riskLevel: 'Alto',
    metodologia: 'Gestión por Frentes y Sedes de Supervisión',
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

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

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
          activeProject={activeProject}
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
              activeProject={activeProject}
              onSwitchPerspective={setCronogramaPerspective}
              onActions={(h) => { binds.current['cronograma'] = h; }}
            />
          </div>
          <div className={active === 'sedes' ? 'sd-v1 qm-pane-active' : 'sd-v1 qm-pane'}>
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
          <div className={active === 'configuracion' ? 'cfg-v1 qm-pane-active' : 'cfg-v1 qm-pane'}>
            <ConfiguracionView onActions={(h) => { binds.current['configuracion'] = h; }} />
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
