import React from 'react';
import { CalendarDays, Building2, Users } from 'lucide-react';

export interface ProjectShellHeaderProps {
  title: string;
  description: string;
  perspective?: 'maestro' | 'territorial' | 'equipo';
  actions?: React.ReactNode;
}

/** Encabezado universal compartido por las perspectivas del Gestor de Proyectos. */
export default function ProjectShellHeader({ title, description, perspective = 'maestro', actions }: ProjectShellHeaderProps) {
  const renderIcon = () => {
    if (perspective === 'territorial') return <Building2 size={26} />;
    if (perspective === 'equipo') return <Users size={26} />;
    return <CalendarDays size={26} />;
  };

  return (
    <header className="header">
      <div className="heading">
        <span className="heading-icon">
          {renderIcon()}
        </span>
        <div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
      </div>
      <div className="head-actions">{actions}</div>
    </header>
  );
}
