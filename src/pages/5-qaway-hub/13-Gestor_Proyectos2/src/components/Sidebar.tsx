// Sidebar único y persistente de "Qaway Gestor de Proyectos".
// Markup copiado 1:1 del sidebar del módulo Tareas (ver código vendido original).
// Únicas alteraciones, autorizadas por el usuario: los tres botones ya existentes
// de la sección PROYECTO (Cronograma / Tareas / Reuniones) conmutan el canvas.
// Ninguna sección, clase, texto, espaciado ni icono nuevo.
import type { ModuleKey } from '../types';
import { Activity, BarChart3, CalendarDays, CheckSquare, ChevronDown, FileText, Flag, FolderKanban, LayoutDashboard, MoreHorizontal, UserRound, Users } from 'lucide-react';

const espacioItems = [
  [LayoutDashboard, 'Resumen'],
  [FolderKanban, 'Proyectos'],
  [CheckSquare, 'Mis tareas'],
  [CalendarDays, 'Reuniones'],
  [FileText, 'Documentos'],
] as const;

type SidebarProps = {
  active: ModuleKey;
  onModule: (k: ModuleKey) => void;
  tasksCount: number;
  notifyActive: (m: string) => void;
  setTasksView: (v: string) => void;
};

export default function Sidebar({ active, onModule, tasksCount, notifyActive, setTasksView }: SidebarProps) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">q</div>
        <div>
          <b>qaway</b>
          <small>GESTOR DE PROYECTOS</small>
        </div>
      </div>
      <div className="side-label">ESPACIO DE TRABAJO</div>
      {espacioItems.map(([Icon, label]: any) => (
        <button
          className="side-link"
          key={label}
          onClick={() => {
            if (label === 'Mis tareas') {
              onModule('tareas');
              setTasksView('Mis tareas');
            } else {
              notifyActive(`${label}: se conectará en la siguiente fase`);
            }
          }}
        >
          <Icon size={17} />
          <span>{label}</span>
        </button>
      ))}
      <div className="side-label space">PROYECTO ACTIVO</div>
      <div className="project">
        <i /> <div>
          <b>MINEDU · Dotación 2027</b>
          <small>Seguimiento regional</small>
        </div>
        <ChevronDown size={15} />
      </div>
      <div className="side-label">PROYECTO</div>
      <button className="side-link">
        <Activity size={17} />
        <span>Resumen del proyecto</span>
      </button>
      <button className={active === 'cronograma' ? 'side-link active' : 'side-link'} onClick={() => onModule('cronograma')}>
        <CalendarDays size={17} />
        <span>Cronograma</span>
      </button>
      <button className={active === 'tareas' ? 'side-link active' : 'side-link'} onClick={() => onModule('tareas')}>
        <CheckSquare size={17} />
        <span>Tareas</span>
        <em>{tasksCount}</em>
      </button>
      <button className="side-link" onClick={() => notifyActive('Hitos se conectará al cronograma del proyecto.')}>
        <Flag size={17} />
        <span>Hitos</span>
      </button>
      <button className={active === 'reuniones' ? 'side-link active' : 'side-link'} onClick={() => onModule('reuniones')}>
        <Users size={17} />
        <span>Reuniones</span>
      </button>
      <button className={active === 'reportes' ? 'side-link active' : 'side-link'} onClick={() => onModule('reportes')}>
        <BarChart3 size={17} />
        <span>Reportes</span>
      </button>
      <button className={active === 'usuarios' ? 'side-link active' : 'side-link'} onClick={() => onModule('usuarios')}>
        <UserRound size={17} />
        <span>Equipo</span>
      </button>
      <button className="side-link" onClick={() => notifyActive('Actas y acuerdos se integrará con Reuniones.')}>
        <FileText size={17} />
        <span>Actas y acuerdos</span>
      </button>
      <div className="profile">
        <div className="avatar dark">MS</div>
        <div>
          <b>María Salazar</b>
          <small>Gestora · Demostración</small>
        </div>
        <MoreHorizontal size={18} />
      </div>
    </aside>
  );
}
