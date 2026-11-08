import React from 'react';

export interface ProjectShellFiltersProps {
  className?: string;
  children: React.ReactNode;
}

/** Contenedor universal para la barra de filtros contextuales del Gestor de Proyectos */
export default function ProjectShellFilters({ className = '', children }: ProjectShellFiltersProps) {
  return <div className={`filters ${className}`.trim()}>{children}</div>;
}
