// Sidebar único y persistente de "Qaway Gestor de Proyectos".
// Optimizado para altura 100vh sin scroll y con Configuración en la base.
import type { ModuleKey } from '../types';
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  ChevronDown,
  FileText,
  Flag,
  LayoutDashboard,
  Settings,
  UserRound,
  Users
} from 'lucide-react';

type SidebarProps = {
  active: ModuleKey;
  onModule: (k: ModuleKey) => void;
  tasksCount: number;
  notifyActive: (m: string) => void;
  setTasksView?: (v: string) => void;
};

export default function Sidebar({
  active,
  onModule,
  tasksCount,
  notifyActive,
}: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">q</div>
        <div>
          <b>qaway</b>
          <small>GESTOR DE PROYECTOS</small>
        </div>
      </div>

      <div className="side-label">PROYECTO ACTIVO</div>
      <div className="project">
        <i />
        <div>
          <b>MINEDU · Dotación 2027</b>
          <small>Seguimiento regional</small>
        </div>
        <ChevronDown size={15} />
      </div>

      <div className="side-label">PROYECTO</div>
      <button
        className={active === 'resumen' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('resumen')}
      >
        <LayoutDashboard size={17} />
        <span>Resumen del proyecto</span>
      </button>

      <button
        className={active === 'cronograma' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('cronograma')}
      >
        <CalendarDays size={17} />
        <span>Cronograma</span>
      </button>

      <button
        className={active === 'tareas' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('tareas')}
      >
        <CheckSquare size={17} />
        <span>Tareas</span>
        <em>{tasksCount}</em>
      </button>

      <button
        className={active === 'hitos' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('hitos')}
      >
        <Flag size={17} />
        <span>Hitos</span>
      </button>

      <button
        className={active === 'reuniones' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('reuniones')}
      >
        <Users size={17} />
        <span>Reuniones</span>
      </button>

      <button
        className={active === 'reportes' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('reportes')}
      >
        <BarChart3 size={17} />
        <span>Reportes</span>
      </button>

      <button
        className={active === 'usuarios' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('usuarios')}
      >
        <UserRound size={17} />
        <span>Equipo</span>
      </button>

      <button
        className={active === 'actas' ? 'side-link active' : 'side-link'}
        onClick={() => onModule('actas')}
      >
        <FileText size={17} />
        <span>Actas y acuerdos</span>
      </button>

      {/* Espacio flexible para empujar la configuración al fondo */}
      <div style={{ flex: 1, minHeight: '20px' }} />

      {/* Configuración en la base del sidebar */}
      <div style={{ borderTop: '1px solid #35465a', paddingTop: '12px' }}>
        <button
          className="side-link"
          style={{ width: '100%', marginBottom: 0 }}
          onClick={() => notifyActive('Configuración del proyecto y parámetros institucionales')}
        >
          <Settings size={17} />
          <span>Configuración</span>
        </button>
      </div>
    </aside>
  );
}
