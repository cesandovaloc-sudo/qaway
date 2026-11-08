import React from 'react';

export interface ProjectShellTabsProps {
  tabsList?: React.ReactNode;
  viewSwitcher?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}

/** Barra universal de pestañas y selector de vistas del Gestor de Proyectos */
export default function ProjectShellTabs({
  tabsList,
  viewSwitcher,
  className = '',
  children,
}: ProjectShellTabsProps) {
  return (
    <nav className={`tabs ${className}`.trim()}>
      {tabsList && <div className="tabs-list">{tabsList}</div>}
      {viewSwitcher && (
        <div className="view-mode-switcher" role="tablist" aria-label="Modo de presentación">
          {viewSwitcher}
        </div>
      )}
      {children}
    </nav>
  );
}
