// Shell maestro consolidado: Sidebar único persistente + Canvas conmutable.
// Los tres módulos viven nativamente en src/modules (sin alias ni subproyectos).
// Keep-alive perezoso: cada canvas se monta solo al visitarlo por primera vez y
// luego conserva su estado mientras permanece oculto.
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import type { ModuleKey, UserRole } from './types';
import { MODULE_STORAGE_KEY, MODULE_SLUGS, SLUG_TO_MODULE, USER_ROLE_STORAGE_KEY } from './types';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import CreateProjectModal from './components/CreateProjectModal';
import CambiarContrasenaModal from './components/CambiarContrasenaModal';
import { supabase } from './services/supabaseClient';
import { obtenerUsuarioSesion } from './services/contextoSesion';
import { usePerfilGp, capacidadesDe } from './services/gpPermisosService';
import { usePerfilVisible } from './services/perfilVisibleService';
import { GestorRouteLoading } from '../../../../router/GestorRouteLoading';
import ResumenProyectoView from './modules/resumen/ResumenProyectoView';
import TareasView from './modules/tareas/TareasView';
const Tareas2View = lazy(() => import('./modules/tareas-2/Tareas2View'));
const Reuniones2View = lazy(() => import('./modules/reuniones-2/Reuniones2View'));
const Reportes2View = lazy(() => import('./modules/reportes-2/Reportes2View'));
const SedesView = lazy(() => import('./modules/sedes/SedesView'));
const CronogramaView = lazy(() => import('./modules/cronograma/CronogramaView'));
const CronogramaGanttView = lazy(() => import('./modules/cronograma-gantt/CronogramaGanttView'));
const GanttElementDetailView = lazy(() => import('./modules/cronograma-gantt/GanttElementDetailView'));
const ReunionesView = lazy(() => import('./modules/reuniones/ReunionesView'));
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
  descProyecto?: string | undefined;
  descSedes?: string | undefined;
  moduleDescriptions?: Record<string, string> | undefined;
  budget?: string | undefined;
  sponsor?: string | undefined;
  riskLevel?: string | undefined;
  metodologia?: string | undefined;
  /** Etapa 6.3: estado general (código de gp_estados_proyecto_c). NULL/ausente = "Sin clasificar" (B-8). */
  estadoCodigo?: string | undefined;
  /** Etapa 6.3: clasificación administrativa (código de gp_tipos_proyecto_c). NULL = "Sin clasificar". */
  tipoProyectoCodigo?: string | undefined;
}

// NO existen proyectos por defecto. Un tenant nuevo debe arrancar totalmente
// vacío: cualquier semilla global (p1 / MINEDU) se filtraba a todos los tenants.

const readStoredModule = (): ModuleKey => {
  try {
    const saved = localStorage.getItem(MODULE_STORAGE_KEY) as ModuleKey;
    if (saved === 'tareas') return 'tareas2';
    const validModules: ModuleKey[] = ['resumen', 'cronograma', 'sedes', 'tareas2', 'reuniones', 'reuniones2', 'reportes2', 'usuarios', 'configuracion'];
    if (validModules.includes(saved)) return saved;
    return 'cronograma';
  } catch {
    return 'cronograma';
  }
};

const resolveModuleFromPath = (path: string): ModuleKey => {
  try {
    const clean = path.replace(/\/+$/, '') || '/';
    if (clean.startsWith(`${MODULE_SLUGS.configuracion}/`)) {
      return 'configuracion';
    }
    if (SLUG_TO_MODULE[clean]) {
      // PRUEBAS, HITOS (Componentes) y ACTAS quedan desactivados del shell principal
      if (SLUG_TO_MODULE[clean] === 'pruebas' || SLUG_TO_MODULE[clean] === 'hitos' || SLUG_TO_MODULE[clean] === 'actas') return 'cronograma';
      return SLUG_TO_MODULE[clean];
    }
  } catch {
    /* fallback */
  }
  return readStoredModule();
};

const readStoredRole = (): UserRole => {
  try {
    const saved = localStorage.getItem(USER_ROLE_STORAGE_KEY) as UserRole | null;
    if (saved === 'gestor' || saved === 'coordinador') return saved;
  } catch {
    /* fallback */
  }
  return 'coordinador';
};

function ModuleLoadingFallback(_props: { text?: string }) {
  return <GestorRouteLoading />;
}

function GestorProyectosApp() {
  const location = useLocation();
  const navigate = useNavigate();

  // Módulo activo unificado: la URL canónica es la fuente única de verdad (cero rebotes)
  const active: ModuleKey = resolveModuleFromPath(location.pathname);
  const [visitedModules, setVisitedModules] = useState<Set<ModuleKey>>(() => new Set([active]));
  const [tasksCount] = useState<number>(0);
  const [manualUserRole, setUserRole] = useState<UserRole>(readStoredRole);
  const [manualPerspective, setCronogramaPerspective] = useState<'maestro' | 'territorial' | null>(null);

  useEffect(() => {
    setVisitedModules((previous) => {
      if (previous.has(active)) return previous;
      const next = new Set(previous);
      next.add(active);
      return next;
    });
  }, [active]);

  // Arranque SIEMPRE vacío. La única fuente de proyectos es Supabase, filtrada
  // por el tenant real de la sesión. localStorage NO se usa como fuente: no está
  // separado por tenant y era la vía por la que un tenant nuevo veía el proyecto
  // MINEDU de DIGERE (y cualquier otro dato persistido por otro usuario).
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  // Topbar → Configuración: seq crece en cada clic para que el tab cambie
  // aunque el módulo ya esté montado (keep-alive).
  const [configTabRequest, setConfigTabRequest] = useState<{ tab: string; seq: number } | null>(null);
  // Etapa 6-B: permisos granulares del modelo GP. El gating SOLO aplica con
  // sesión real (perfilGp no nulo); sin sesión el estado permanece vacío.
  // La DB (RLS) sigue siendo el mando real; esto es UX.
  const { perfil: perfilGp, capacidades: capGp, cargando: cargandoPerfilGp } = usePerfilGp();
  // Perfil visible (Topbar / Mi Perfil / Empresa): una sola consulta compartida.
  const { perfil: perfilVisible, cargando: cargandoPerfilVisible } = usePerfilVisible();
  const sesionReal = !cargandoPerfilGp && perfilGp !== null;
  // Puerta de entrada del shell: nada se monta hasta que respondan las TRES
  // fuentes reales (identidad, proyectos del tenant, perfil visible). Esperar
  // datos, no tiempo: sin setTimeout y sin localStorage como fuente.
  const [cargandoProyectos, setCargandoProyectos] = useState(true);
  const listo = !cargandoPerfilGp && !cargandoProyectos && !cargandoPerfilVisible;
  // Tenant REAL de la sesión compartida del Hub (public.users.tenant_id =
  // get_auth_tenant_id()). Nunca se infiere de localStorage ni se fuerza a null.
  const gestorTenantId: string | null = perfilGp?.tenantId ?? null;
  const [mustChangePassword, setMustChangePassword] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    const checkUser = (u: { user_metadata?: Record<string, unknown> } | null | undefined) => {
      const meta = u?.user_metadata || {};
      return Boolean(
        meta.must_change_password ||
        meta.requiere_cambio_clave ||
        meta.force_password_change ||
        meta.primer_ingreso ||
        meta.needs_password_change
      );
    };
    // La sesión ya la resolvió contextoSesion: NO repetir getUser aquí.
    obtenerUsuarioSesion()
      .then((usuario) => {
        if (checkUser(usuario)) setMustChangePassword(true);
      })
      .catch(() => {});
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setMustChangePassword(checkUser(session?.user));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Etapa 6-D: perspectiva UI derivada síncronamente en el mismo render desde perfilGp (sin doble render).
  const userRole: UserRole = useMemo(() => {
    if (!perfilGp) return manualUserRole;
    const cap = capacidadesDe(perfilGp.rol, perfilGp.permisos, perfilGp.esPlataforma, true);
    return (
      perfilGp.esPlataforma ||
      perfilGp.rol === 'admin' ||
      perfilGp.rol === 'editor' ||
      cap.crearProyecto ||
      cap.editarProyecto ||
      cap.administrarEdt ||
      cap.administrarPermisos
    )
      ? 'coordinador'
      : 'gestor';
  }, [perfilGp, manualUserRole]);

  const cronogramaPerspective: 'maestro' | 'territorial' =
    manualPerspective ?? (userRole === 'coordinador' ? 'maestro' : 'territorial');

  const puedeCrearProyectoUi = sesionReal ? capGp.crearProyecto : userRole === 'coordinador';

  const handleOpenCreateProject = () => {
    if (perfilGp && !capGp.crearProyecto) {
      notifyActive('No tienes permiso para crear proyectos (requiere rol admin o la llave gp.crear_proyecto).');
      return;
    }
    setIsCreateProjectOpen(true);
  };
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

  const binds = useRef<Partial<Record<ModuleKey, Binds>>>({});
  const canvasRef = useRef<HTMLElement | null>(null);

  // Coordinación universal de scroll en .qm-canvas con interpolación suave (ease-out 60fps):
  // Al girar la rueda hacia abajo, desliza progresivamente .header (--canvas-scroll) para ocultar las tarjetas superiores
  // manteniendo el borde inferior de .workspace 100% anclado por Flexbox al borde inferior de la ventana sin temblor.
  useEffect(() => {
    const scrollCanvas = canvasRef.current;
    if (!scrollCanvas) return;

    // Bandera de pausa: cambiar a true para reactivar el scroll automático de cabecera
    const ENABLE_CANVAS_SCROLL = false;
    if (!ENABLE_CANVAS_SCROLL) {
      scrollCanvas.style.setProperty('--canvas-scroll', '0px');
      return;
    }

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
    if (clean.startsWith(`${MODULE_SLUGS.configuracion}/`)) return;
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
    if (sesionReal) return; // sesión real: no persistir perspectiva simulada
    try {
      localStorage.setItem(USER_ROLE_STORAGE_KEY, userRole);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [userRole, sesionReal]);

  // Carga ÚNICA de proyectos: solo desde Supabase y solo del tenant de la sesión.
  // Si la BD devuelve 0 filas el estado permanece vacío: no se fusiona con nada
  // local, porque localStorage no distingue tenants.
  useEffect(() => {
    let cancelled = false;
    setCargandoProyectos(true);
    if (cargandoPerfilGp) return () => { cancelled = true; };
    if (!sesionReal || (!gestorTenantId && !perfilGp?.esPlataforma)) {
      // Sin sesión o sin empresa asignada: vacío, nunca datos de otro tenant.
      setProjects([]);
      setActiveProjectId('');
      setCargandoProyectos(false);
      return () => { cancelled = true; };
    }
    listGestorProjects(gestorTenantId)
      .then((remoteProjects) => {
        if (cancelled) return;
        const delTenant = Array.isArray(remoteProjects) ? remoteProjects : [];
        setProjects(delTenant);
        setCargandoProyectos(false);
        setActiveProjectId((curr) =>
          delTenant.some((r) => r.id === curr) ? curr : (delTenant[0]?.id ?? '')
        );
      })
      .catch((error) => {
        if (cancelled) return;
        console.warn('[Gestor Projects] no se pudieron cargar los proyectos:', error?.message || error);
        setProjects([]);
        setActiveProjectId('');
        setCargandoProyectos(false);
      });
    return () => {
      cancelled = true;
    };
  }, [cargandoPerfilGp, sesionReal, gestorTenantId, perfilGp?.esPlataforma]);

  const handleSelectModule = (next: ModuleKey) => {
    try {
      localStorage.setItem(MODULE_STORAGE_KEY, next);
    } catch {
      /* almacenamiento no disponible */
    }
    const targetSlug = MODULE_SLUGS[next];
    if (targetSlug) {
      const yaEnSubrutaConfig =
        next === 'configuracion' && location.pathname.startsWith(`${targetSlug}/`);
      if (!yaEnSubrutaConfig && location.pathname !== targetSlug) {
        navigate(targetSlug);
      }
    }
  };

  const handleOpenConfig = (tab: 'perfil' | 'preferencias') => {
    setConfigTabRequest((prev) => ({ tab, seq: (prev?.seq || 0) + 1 }));
    handleSelectModule('configuracion');
    navigate(`${MODULE_SLUGS.configuracion}/${tab}`);
  };

  const handleChangeRole = (next: UserRole) => {
    if (sesionReal) {
      notifyActive('La perspectiva se deriva de tu sesión en Qaway Hub.');
      return;
    }
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
    tipoProyectoCodigo?: string | null;
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
      // Etapa 6.3: nuevo proyecto arranca en 'planificacion' (equivale al DEFAULT
      // de INSERT nuevos en gp_proyectos.estado_codigo, 0002 L45) y conserva la
      // clasificación elegida en el modal (NULL ⇒ "Sin clasificar").
      estadoCodigo: 'planificacion',
      tipoProyectoCodigo: newProj.tipoProyectoCodigo || undefined,
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
      // Sin proyecto sustituto inventado: si era el último, queda vacío.
      setActiveProjectId(next[0]?.id ?? '');
      return next;
    });
    if (projects.length > 1) navigate(MODULE_SLUGS['cronograma']);
    notifyActive(
      projects.length > 1
        ? 'Proyecto eliminado definitivamente. Se abrió el cronograma del proyecto activo.'
        : 'Proyecto eliminado definitivamente. No quedan proyectos en esta empresa.'
    );
  };

  const handleUpdateProject = (updated: ProjectItem) => {
    setProjects((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    void upsertGestorProject(updated, gestorTenantId).catch((error) => {
      console.warn('[Gestor Projects] no se pudo actualizar el proyecto:', error?.message || error);
    });
    notifyActive(`Proyecto "${updated.name}" actualizado con éxito.`);
  };

  /**
   * Etapa 6.3 · Ciclo de vida: tras una transición EXITOSA (ya persistida en
   * Supabase por la RPC atómica gp_cambiar_estado_proyecto), la app actualiza su
   * modelo del proyecto para reflejar el chip/estado. La fuente de verdad del
   * estado es gp_proyectos.estado_codigo; este modelo local es el reflejo
   * transicional (mismo patrón que el resto de campos de ProjectItem).
   */
  const handleEstadoCambiado = (proyectoId: string, estadoNuevo: string) => {
    setProjects((prev) => prev.map((p) => (p.id === proyectoId ? { ...p, estadoCodigo: estadoNuevo } : p)));
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  const notifyActive = (m: string) => {
    binds.current[active]?.notify(m);
  };

  const setTasksView = (v: string) => {
    binds.current['tareas']?.setView?.(v);
  };

  // Hasta aquí NO se monta nada del shell. Antes se renderizaba de inmediato
  // con projects=[] y "Cargando...", y el usuario veía la cara vacía durante
  // milisegundos. Ahora el loader real cubre toda la espera; si el tenant tiene
  // 0 proyectos, el estado vacío aparece recién cuando la BD lo confirmó.
  if (!listo) {
    // MISMO loader que usó el router: una sola vista desde la ruta hasta el shell.
    return <GestorRouteLoading />;
  }

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
          canCreateProject={puedeCrearProyectoUi}
          collapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
          projects={projects}
          activeProjectId={activeProjectId}
          onSelectProject={setActiveProjectId}
          onOpenCreateProject={handleOpenCreateProject}
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
          onOpenConfig={handleOpenConfig}
          perfilVisible={perfilVisible}
        />
        <main ref={canvasRef} className="qm-canvas">
          {/* La maqueta se monta siempre, incluso sin proyecto del tenant.
              Los módulos consultan el tenant real y muestran sus tablas/Gantt
              vacíos: sin datos ajenos, pero con la interfaz completa. */}
           {visitedModules.has('resumen') && <div className={active === 'resumen' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
             <ResumenProyectoView userRole={userRole} canCreateProject={puedeCrearProyectoUi} sesionReal={sesionReal} proyecto={activeProject} onEstadoCambiado={handleEstadoCambiado} onOpenCreateProject={handleOpenCreateProject} onActions={(h) => { binds.current['resumen'] = h; }} />
           </div>}
           {visitedModules.has('tareas2') && <Suspense fallback={<ModuleLoadingFallback text="Cargando Tareas 2…" />}><div className={active === 'tareas2' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
             <Tareas2View activeProject={activeProject} isActive={active === 'tareas2'} />
           </div></Suspense>}
           {visitedModules.has('reuniones2') && <Suspense fallback={<ModuleLoadingFallback text="Cargando Reuniones 2…" />}><div className={active === 'reuniones2' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
             <Reuniones2View activeProject={activeProject} isActive={active === 'reuniones2'} />
           </div></Suspense>}
           {visitedModules.has('reportes2') && <Suspense fallback={<ModuleLoadingFallback text="Cargando Reportes…" />}><div className={active === 'reportes2' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
             <Reportes2View activeProject={activeProject} isActive={active === 'reportes2'} />
           </div></Suspense>}
           {visitedModules.has('cronograma') && (
             <Suspense fallback={<ModuleLoadingFallback text="Cargando cronograma maestro…" />}>
               <div
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
               </div>
             </Suspense>
           )}
           {visitedModules.has('sedes') && <Suspense fallback={<ModuleLoadingFallback text="Cargando Sedes…" />}><div className={active === 'sedes' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <SedesView
              activeProjectId={activeProjectId}
              activeProject={activeProject}
              isActive={active === 'sedes'}
              onActions={(h) => { binds.current['sedes'] = h; }}
            />
           </div></Suspense>}
           {visitedModules.has('cronograma') && cronogramaPerspective === 'territorial' && (
             <Suspense fallback={<ModuleLoadingFallback text="Cargando vista territorial…" />}>
               <div
                 className={
                   active === 'cronograma' && cronogramaPerspective === 'territorial'
                     ? 'qc-v1 qm-pane-active'
                     : 'qc-v1 qm-pane'
                 }
               >
                 <CronogramaView
                   activeProject={activeProject}
                   onSwitchPerspective={setCronogramaPerspective}
                   onActions={(h) => { binds.current['cronograma'] = h; }}
                 />
               </div>
             </Suspense>
           )}
           {visitedModules.has('hitos') && <Suspense fallback={<ModuleLoadingFallback text="Cargando componentes rectores…" />}><div className={active === 'hitos' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <HitosView onActions={(h) => { binds.current['hitos'] = h; }} />
           </div></Suspense>}
           {visitedModules.has('reuniones') && <Suspense fallback={<ModuleLoadingFallback text="Cargando agenda de reuniones…" />}><div className={active === 'reuniones' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <ReunionesView onActions={(h) => { binds.current['reuniones'] = h; }} />
           </div></Suspense>}
           {visitedModules.has('usuarios') && <Suspense fallback={<ModuleLoadingFallback text="Cargando directorio de equipo…" />}><div className={active === 'usuarios' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <EquipoView
              activeProject={activeProject}
              isActive={active === 'usuarios'}
              onActions={(h) => { binds.current['usuarios'] = h; }}
            />
           </div></Suspense>}
           {visitedModules.has('actas') && <Suspense fallback={<ModuleLoadingFallback text="Cargando actas y acuerdos…" />}><div className={active === 'actas' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            <ActasAcuerdosView onActions={(h) => { binds.current['actas'] = h; }} />
           </div></Suspense>}
          <div className={active === 'pruebas' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>
            {active === 'pruebas' && (
              <Suspense fallback={<ModuleLoadingFallback text="Cargando laboratorio de pruebas…" />}>
                <PruebasView activeProject={activeProject} />
              </Suspense>
            )}
          </div>
           {visitedModules.has('configuracion') && <Suspense fallback={<ModuleLoadingFallback text="Cargando configuración…" />}><div className={active === 'configuracion' ? 'cfg-v1 qm-pane-active' : 'cfg-v1 qm-pane'}>
            <ConfiguracionView
              projects={projects}
              activeProjectId={activeProjectId}
              onSelectProject={setActiveProjectId}
              onUpdateProject={handleUpdateProject}
              onDeleteProject={handleDeleteProject}
              onIrAFicha={() => navigate(MODULE_SLUGS['resumen'])}
              tabRequest={configTabRequest}
              notifyExterno={notifyActive}
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
      <CambiarContrasenaModal
        open={mustChangePassword}
        onSuccess={() => setMustChangePassword(false)}
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
