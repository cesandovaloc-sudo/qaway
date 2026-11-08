import React from 'react';

export interface ProjectShellActionsProps {
  className?: string;
  children: React.ReactNode;
}

/** Contenedor universal de acciones superiores en el header */
export default function ProjectShellActions({ className = '', children }: ProjectShellActionsProps) {
  return <div className={`head-actions ${className}`.trim()}>{children}</div>;
}
