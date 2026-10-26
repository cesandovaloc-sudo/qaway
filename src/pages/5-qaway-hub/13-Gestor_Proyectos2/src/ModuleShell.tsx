import { useState } from 'react'
import { CalendarDays, CheckSquare, Milestone } from 'lucide-react'
// Shell de módulos de "Qaway Gestor de Proyectos".
// Ninguno de los tres módulos fue modificado:
//   - Reuniones: src/App.tsx (intacto, se monta tal cual).
//   - Tareas: qaway-tareas-v2-completo/qaway-tareas/src/App.tsx (intacto;
//     su CSS se sirve desde la copia con scope .qt-v2: ../../tareas-v2.scoped.css)
//   - Cronograma: qaway-cronograma/src/App.tsx (intacto;
//     su CSS se sirve desde la copia con scope .qc-v1: ../../cronograma.scoped.css)
// Los stubs de tipos (tareas-vendor.d.ts / cronograma-vendor.d.ts) evitan que tsc
// revise los .tsx vendidos; Vite los empaqueta vía alias en vite.config.ts.
import ReunionesApp from './App'
import TareasApp from '@tareas-v2/app'
import CronogramaApp from '@cronograma/app'
import './module-bar.css'
import '../tareas-v2.scoped.css'
import '../cronograma.scoped.css'

type ModuleKey = 'tareas' | 'cronograma' | 'reuniones'
const STORAGE_KEY = 'qaway-gp-module-v1'

const readInitialModule = (): ModuleKey => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved === 'tareas' || saved === 'cronograma' || saved === 'reuniones') return saved
    return 'reuniones'
  } catch {
    return 'reuniones'
  }
}

export default function ModuleShell() {
  const [active, setActive] = useState<ModuleKey>(readInitialModule)

  const selectModule = (key: ModuleKey) => {
    setActive(key)
    try {
      localStorage.setItem(STORAGE_KEY, key)
    } catch {
      /* storage no disponible */
    }
  }

  return (
    <div className="qm-root">
      <header className="qm-bar">
        <div className="qm-brand">
          <span className="qm-brand-mark">q</span>
          <div>
            <b>qaway</b>
            <small>GESTOR DE PROYECTOS</small>
          </div>
        </div>
        <span className="qm-divider" />
        <nav className="qm-tabs" aria-label="Módulos">
          <button
            type="button"
            className={active === 'tareas' ? 'qm-tab active' : 'qm-tab'}
            onClick={() => selectModule('tareas')}
          >
            <CheckSquare size={15} />
            <span>Tareas</span>
          </button>
          <button
            type="button"
            className={active === 'cronograma' ? 'qm-tab active' : 'qm-tab'}
            onClick={() => selectModule('cronograma')}
          >
            <Milestone size={15} />
            <span>Cronograma</span>
          </button>
          <button
            type="button"
            className={active === 'reuniones' ? 'qm-tab active' : 'qm-tab'}
            onClick={() => selectModule('reuniones')}
          >
            <CalendarDays size={15} />
            <span>Reuniones</span>
          </button>
        </nav>
        <span className="qm-tag">Prototipo · Datos demo</span>
      </header>
      <div className="qm-body">
        {active === 'tareas' ? (
          <div className="qt-v2">
            <TareasApp />
          </div>
        ) : active === 'cronograma' ? (
          <div className="qc-v1">
            <CronogramaApp />
          </div>
        ) : (
          <ReunionesApp />
        )}
      </div>
    </div>
  )
}
