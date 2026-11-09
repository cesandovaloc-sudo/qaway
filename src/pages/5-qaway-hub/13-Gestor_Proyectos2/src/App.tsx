// Shell maestro consolidado: Sidebar único persistente + Canvas conmutable.
// Los tres módulos viven nativamente en src/modules (sin alias ni subproyectos).
// Keep-alive perezoso: cada canvas se monta solo al visitarlo por primera vez y
// luego conserva su estado mientras permanece oculto.
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { ModuleKey, UserRole } from './types';
import { MODULE_STORAGE_KEY, MODULE_SLUGS, SLUG_TO_MODULE, TAREAS_SEED_COUNT, USER_ROLE_STORAGE_KEY } from './types';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CreateProjectModal from './components/CreateProjectModal';
import ResumenProyectoView from './modules/resumen/ResumenProyectoView';
import TareasView from './modules/tareas/TareasView';
const Tareas2View = lazy(() => import('./modules/tareas-2/Tareas2View'));
import SedesView from './modules/sedes/SedesView';
const CronogramaView = lazy(() => import('./modules/cronograma/CronogramaView'));
const CronogramaGanttView = lazy(() => import('./modules/cronograma-gantt/CronogramaGanttView'));
const GanttElementDetailView = lazy(() => import('./modules/cronograma-gantt/GanttElementDetailView'));
const ReunionesView = lazy(() => import('./modules/reuniones/ReunionesView'));
const ReporteadorView = lazy(() => import('./modules/reporteador/ReporteadorView'));
const EquipoView = lazy(() => import('./modules/equipo/EquipoView'));
const HitosView = lazy(() => import('./modules/hitos/HitosView'));
const ActasAcuerdosView = lazy(() => import('./modules/actas/ActasAcuerdosView'));
const ConfiguracionView = lazy(() => import('./modules/configuracion/ConfiguracionView'));
const PruebasView = lazy(() => import('./modules/pruebas/PruebasView'));
import FloatingChatAssistant from './components/FloatingChatAssistant';
import { deleteGestorProject, listGestorProjects, upsertGestorProject } from './services/gestorProjectService';

type Binds = { notify: (m: string) => void; setView?: (v: string) => void };

export interface ProjectItem {
  id: string;
  code: string;
  name: string;
  region: string;
  subtext?: string | undefined;
  budget?: string | undefined;
  sponsor?: string | undefined;
  riskLevel?: string | undefined;
  metodologia?: string | undefined;
}

const DEFAULT_PROJECTS: ProjectItem[] = [
  {
    id: 'p1',
    code: 'PRJ-MIN-2027-01',
    name: 'MINEDU · Dotación 2027',
    region: 'Nacional',
    subtext: 'Seguimiento de operaciones',
    budget: 'S/ 850,000',
    sponsor: 'MINEDU - DIGERE',
    riskLevel: 'Medio',
    metodologia: 'Híbrido: Hitos Clave + Tareas de Campo',
  },
];

const readStoredModule = (): ModuleKey => {
  try {
    const saved = localStorage.getItem(MODULE_STORAGE_KEY) as ModuleKey;
    const validModules: ModuleKey[] = ['resumen', 'cronograma', 'sedes', 'tareas', 'tareas2', 'hitos', 'reuniones', 'reportes', 'usuarios', 'actas', 'configuracion'];
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
      // PRUEBAS queda oculto temporalmente y no debe activarse por una ruta guardada.
      if (SLUG_TO_MODULE[clean] === 'pruebas') return 'tareas';
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

function GestorProyectosApp() {
  const location = useLocation();
  const navigate = useNavigate();

  // Módulo activo unificado: la URL canónica es la fuente única de verdad (cero rebotes)
  const active: ModuleKey = resolveModuleFromPath(location.pathname);
  const [visitedModules, setVisitedModules] = useState<Set<ModuleKey>>(() => new Set([active]));
  const [tasksCount, setTasksCount] = useState<number>(seedTasksCount);
  const [userRole, setUserRole] = useState<UserRole>(readStoredRole);
  const [cronogramaPerspective, setCronogramaPerspective] = useState<'maestro' | 'territorial'>(() =>
    readStoredRole() === 'coordinador' ? 'maestro' : 'territorial'
  );

  useEffect(() => {
    setVisitedModules((previous) => {
      if (previous.has(active)) return previous;
      const next = new Set(previous);
      next.add(active);
      return next;
    });
  }, [active]);

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
  // Fase previa al login: se mantiene explícito y vacío hasta conectar el Hub.
  const gestorTenantId: string | null = null;
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
  const canvasRef = useRef<HTMLElement | null>(null);

  // Coordinación universal de scroll en .qm-canvas con interpolación suave (ease-out 60fps):
  // Al girar la rueda hacia abajo, desliza progresivamente .header (--canvas-scroll) para ocultar las tarjetas superiores
  // manteniendo el borde inferior de .workspace 100% anclado por Flexbox al borde inferior de la ventana sin temblor.
  useEffect(() => {
    const scrollCanvas = canvasRef.current;
    if (!scrollCanvas) return;

    let currentCollapse = 0;
    let targetScroll = 0;
    let rafId: number | null = null;

    const updateDockedStatus = () => {
      const activePane = scrollCanvas.querySelector('.qm-pane-active') as HTMLElement | null;
      const ws = activePane?.querySelector('.workspace') as HTMLElement | null;
      if (!ws) return;

      scrollCanvas.style.setProperty('--canvas-scroll', `${currentCollapse}px`);
      const wsRect = ws.getBoundingClientRect();
      const canvasRect = scrollCanvas.getBoundingClientRect();
      const delta = wsRect.top - canvasRect.top - 8;
      const isStuck = delta <= 2;

      if (ws.classList.contains('is-docked') !== isStuck) {
        ws.classList.toggle('is-docked', isStuck);
      }
    };

    const stepSmoothScroll = () => {
      const diff = targetScroll - currentCollapse;
      if (Math.abs(diff) < 0.6) {
        currentCollapse = targetScroll;
        rafId = null;
        updateDockedStatus();
        return;
      }
      currentCollapse += diff * 0.38;
      updateDockedStatus();
      rafId = requestAnimationFrame(stepSmoothScroll);
    };

    const startSmoothScroll = () => {
      if (rafId === null) {
        rafId = requestAnimationFrame(stepSmoothScroll);
      }
    };

    const findScrollableUp = (el: HTMLElement | null, boundary: HTMLElement): HTMLElement | null => {
      let cur = el;
      while (cur && cur !== boundary && cur !== document.body) {
        const style = window.getComputedStyle(cur);
        const overflowY = style.overflowY;
        if ((overflowY === 'auto' || overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight + 1) {
          return cur;
        }
        cur = cur.parentElement;
      }
      return null;
    };

    const handleWheel = (e: WheelEvent) => {
      if (e.defaultPrevented || e.shiftKey || e.ctrlKey || Math.abs(e.deltaY) < 1) return;
      const targetEl = e.target as HTMLElement | null;
      // Los drawers son capas independientes: su rueda no debe activar el
      // scroll personalizado del canvas que queda detrás.
      if (targetEl?.closest('.editor, .editor-backdrop, .drawer, .modal, .cols-pop, .cols-popover, .cols-dropdown-wrap, .filter-card-dropdown, .filter-card-popover, .filter-popover-list, .filter-dropdown-wrap, .adv-filter-pop, .cell-pop, .th-popover, .column-header-menu, .table-engine-filter-popover, [role="dialog"], [role="menu"], [role="listbox"]')) {
        return;
      }

      const activePane = scrollCanvas.querySelector('.qm-pane-active') as HTMLElement | null;
      const ws = activePane?.querySelector('.workspace') as HTMLElement | null;
      if (!ws) return;

      if (rafId === null) {
        targetScroll = currentCollapse;
      }

      const wsRect = ws.getBoundingClientRect();
      const canvasRect = scrollCanvas.getBoundingClientRect();
      const delta = wsRect.top - canvasRect.top - 8;
      const maxTarget = Math.max(0, currentCollapse + delta);
      const remainingDown = maxTarget - targetScroll;

      if (e.deltaY > 0 && remainingDown > 0.5) {
        e.preventDefault();
        const consume = Math.min(e.deltaY, remainingDown);
        const leftover = e.deltaY - consume;
        targetScroll += consume;
        startSmoothScroll();
        if (leftover > 0) {
          const innerScroll = findScrollableUp(targetEl, ws);
          if (innerScroll) innerScroll.scrollTop += leftover;
        }
        return;
      }

      if (e.deltaY < 0 && targetScroll > 0.5) {
        const innerScroll = findScrollableUp(targetEl, ws);
        if (!innerScroll || innerScroll.scrollTop <= 0) {
          e.preventDefault();
          targetScroll = Math.max(0, targetScroll + e.deltaY);
          startSmoothScroll();
        }
      }
    };

    scrollCanvas.addEventListener('wheel', handleWheel, { passive: false });
    window.addEventListener('resize', updateDockedStatus, { passive: true });
    updateDockedStatus();

    return () => {
      scrollCanvas.removeEventListener('wheel', handleWheel);
      window.removeEventListener('resize', updateDockedStatus);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, []);

  // Sincronizar estado acoplado (.is-docked) al conmutar entre módulos
  useEffect(() => {
    const scrollCanvas = canvasRef.current;
    if (!scrollCanvas) return;
    const timer = setTimeout(() => {
      const activePane = scrollCanvas.querySelector('.qm-pane-active') as HTMLElement | null;
      const ws = activePane?.querySelector('.workspace') as HTMLElement | null;
      if (!ws) return;
      const wsRect = ws.getBoundingClientRect();
      const canvasRect = scrollCanvas.getBoundingClientRect();
      const delta = wsRect.top - canvasRect.top - 8;
      ws.classList.toggle('is-docked', delta <= 2);
    }, 40);
    return () => clearTimeout(timer);
  }, [active]);

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

  // Sincronización tolerante: si Supabase aún no tiene la migración aplicada,
  // el Gestor conserva el estado local y no bloquea la interfaz.
  useEffect(() => {
    let cancelled = false;
    listGestorProjects(gestorTenantId)
      .then((remoteProjects) => {
        if (cancelled || remoteProjects.length === 0) return;
        setProjects((current) => {
          const localOnly = current.filter((project) => !remoteProjects.some((remote) => remote.id === project.id));
          return [...remoteProjects, ...localOnly];
        });
      })
      .catch((error) => console.warn('[Gestor Projects] modo local:', error?.message || error));
    return () => {
      cancelled = true;
    };
  }, []);

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
        ? 'Perspectiva: Carlos Sandoval (Coordinador General - Control de Proyectos y Gantt)'
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
    void upsertGestorProject(item, gestorTenantId).catch((error) => {
      console.warn('[Gestor Projects] no se pudo persistir el proyecto:', error?.message || error);
    });
    setActiveProjectId(item.id);
    navigate(MODULE_SLUGS['cronograma']);
    setCronogramaPerspective('maestro');
    notifyActive(`Proyecto "${item.name}" creado con éxito. Cronograma maestro y frentes listos.`);
  };

  const handleDeleteProject = (id: string) => {
    void deleteGestorProject(id).catch((error) => {
      console.warn('[Gestor Projects] no se pudo eliminar el proyecto:', error?.message || error);
    });
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
      const nextActiveId = finalProjects[0]?.id ?? '';
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
    void upsertGestorProject(updated, gestorTenantId).catch((error) => {
      console.warn('[Gestor Projects] no se pudo actualizar el proyecto:', error?.message || error);
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
        <main ref={canvasRef} className="qm-canvas">
           {visitedModules.has('resumen') && <div className={active === 'resumen' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
             <ResumenProyectoView userRole={userRole} onOpenCreateProject={() => setIsCreateProjectOpen(true)} onActions={(h) => { binds.current['resumen'] = h; }} />
           </div>}
           {visitedModules.has('tareas') && <div className={active === 'tareas' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
             <TareasView activeProject={activeProject} onTasksCount={setTasksCount} onActions={(h) => { binds.current['tareas'] = h; }} />
           </div>}
           {visitedModules.has('tareas2') && <Suspense fallback={<div className="qm-module-loading">Cargando Tareas 2…</div>}><div className={active === 'tareas2' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
             <Tareas2View activeProject={activeProject} isActive={active === 'tareas2'} />
           </div></Suspense>}
           {visitedModules.has('cronograma') && <Suspense fallback={<div className="qm-module-loading">Cargando cronograma…</div>}><div
            className={
              active === 'cronograma' && cronogramaPerspective === 'maestro'
                ? 'gantt-v2 qm-pane-active'
                : 'gantt-v2 qm-pane'
            }
          >
            <CronogramaGanttView
              activeProject={activeProject}
              isActive={active === 'cronograma' && cronogramaPerspective === 'maestro'}
              onSwitchPerspective={setCronogramaPerspective}
              onActions={(h) => { binds.current['cronograma'] = h; }}
            />
           </div></Suspense>}
           {visitedModules.has('sedes') && <div className={active === 'sedes' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <SedesView
              activeProjectId={activeProjectId}
              activeProject={activeProject}
              isActive={active === 'sedes'}
              onActions={(h) => { binds.current['sedes'] = h; }}
            />
           </div>}
           {visitedModules.has('cronograma') && <Suspense fallback={<div className="qm-module-loading">Cargando vista territorial…</div>}><div
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
           </div></Suspense>}
           {visitedModules.has('hitos') && <Suspense fallback={<div className="qm-module-loading">Cargando hitos…</div>}><div className={active === 'hitos' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <HitosView onActions={(h) => { binds.current['hitos'] = h; }} />
           </div></Suspense>}
           {visitedModules.has('reuniones') && <Suspense fallback={<div className="qm-module-loading">Cargando reuniones…</div>}><div className={active === 'reuniones' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <ReunionesView onActions={(h) => { binds.current['reuniones'] = h; }} />
           </div></Suspense>}
           {visitedModules.has('reportes') && <Suspense fallback={<div className="qm-module-loading">Cargando reportes…</div>}><div className={active === 'reportes' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <ReporteadorView onActions={(h) => { binds.current['reportes'] = h; }} />
           </div></Suspense>}
           {visitedModules.has('usuarios') && <Suspense fallback={<div className="qm-module-loading">Cargando equipo…</div>}><div className={active === 'usuarios' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <EquipoView
              activeProject={activeProject}
              isActive={active === 'usuarios'}
              onActions={(h) => { binds.current['usuarios'] = h; }}
            />
           </div></Suspense>}
           {visitedModules.has('actas') && <Suspense fallback={<div className="qm-module-loading">Cargando actas…</div>}><div className={active === 'actas' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <ActasAcuerdosView onActions={(h) => { binds.current['actas'] = h; }} />
           </div></Suspense>}
          <div className={active === 'pruebas' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            {active === 'pruebas' && (
              <Suspense fallback={<div className="pruebas-loading">Cargando laboratorio PRUEBAS…</div>}>
                <PruebasView activeProject={activeProject} />
              </Suspense>
            )}
          </div>
           {visitedModules.has('configuracion') && <Suspense fallback={<div className="qm-module-loading">Cargando configuración…</div>}><div className={active === 'configuracion' ? 'cfg-v1 qm-pane-active' : 'cfg-v1 qm-pane'}>
            <ConfiguracionView
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={setActiveProjectId}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onActions={(h) => { binds.current['configuracion'] = h; }}
            />
           </div></Suspense>}
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

function App() {
  const location = useLocation();

  if (/\/hub\/gestor_proyectos\/proyecto\/gantt\/elemento\/[^/]+/.test(location.pathname)) {
    return <Suspense fallback={<div className="qm-module-loading">Cargando detalle…</div>}><GanttElementDetailView /></Suspense>;
  }

  return <GestorProyectosApp />;
}

export default App;
