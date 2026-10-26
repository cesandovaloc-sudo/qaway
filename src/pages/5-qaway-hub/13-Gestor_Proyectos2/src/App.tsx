// Shell maestro consolidado: Sidebar único persistente + Canvas conmutable.
// Los tres módulos viven nativamente en src/modules (sin alias ni subproyectos).
// Keep-alive: los canvas permanecen montados (display:none en el inactivo) para
// preservar estado de UI/filtros/drawer y eliminar el parpadeo al alternar.
import { useEffect, useRef, useState } from 'react';
import type { ModuleKey } from './types';
import { MODULE_STORAGE_KEY, TAREAS_SEED_COUNT } from './types';
import Sidebar from './components/Sidebar';
import TareasView from './modules/tareas/TareasView';
import CronogramaView from './modules/cronograma/CronogramaView';
import ReunionesView from './modules/reuniones/ReunionesView';
import ReporteadorView from './modules/reporteador/ReporteadorView';
import UsuariosView from './modules/usuarios/UsuariosView';

type Binds = { notify: (m: string) => void; setView?: (v: string) => void };

const readStoredModule = (): ModuleKey => {
  try {
    const saved = localStorage.getItem(MODULE_STORAGE_KEY);
    if (saved === 'tareas' || saved === 'cronograma' || saved === 'reuniones' || saved === 'reportes' || saved === 'usuarios') return saved;
    return 'tareas'; // estado de reposo que refleja el diseño del sidebar (Tareas activo)
  } catch {
    return 'tareas';
  }
};

const seedTasksCount = (): number => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem('qaway-tasks-v1') || 'null');
    return Array.isArray(parsed) && parsed.every((x) => typeof x === 'object') ? parsed.length : TAREAS_SEED_COUNT;
  } catch {
    return TAREAS_SEED_COUNT;
  }
};

function App() {
  const [active, setActive] = useState<ModuleKey>(readStoredModule);
  const [tasksCount, setTasksCount] = useState<number>(seedTasksCount);
  const binds = useRef<Partial<Record<ModuleKey, Binds>>>({});

  useEffect(() => {
    try {
      localStorage.setItem(MODULE_STORAGE_KEY, active);
    } catch {
      /* almacenamiento no disponible */
    }
  }, [active]);

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
          onModule={setActive}
          tasksCount={tasksCount}
          notifyActive={notifyActive}
          setTasksView={setTasksView}
        />
      </div>
      <main className="qm-canvas">
        <div className={active === 'tareas' ? 'qt-v2 qm-pane-active' : 'qt-v2 qm-pane'}>
          <TareasView
            onTasksCount={setTasksCount}
            onActions={(h) => { binds.current['tareas'] = h; }}
          />
        </div>
        <div className={active === 'cronograma' ? 'qc-v1 qm-pane-active' : 'qc-v1 qm-pane'}>
          <CronogramaView onActions={(h) => { binds.current['cronograma'] = h; }} />
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
      </main>
    </div>
  );
}

export default App;
