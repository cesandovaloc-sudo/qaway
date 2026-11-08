import React, { forwardRef } from 'react';

export interface ProjectShellWorkspaceProps {
  id?: string;
  className?: string;
  isFullscreen?: boolean;
  isDocked?: boolean;
  children: React.ReactNode;
}

/** Contenedor universal del área de trabajo (workspace) del Gestor de Proyectos */
const ProjectShellWorkspace = forwardRef<HTMLElement, ProjectShellWorkspaceProps>(
  ({ id, className = '', isFullscreen = false, isDocked = false, children }, ref) => {
    const classList = [
      'workspace',
      isFullscreen ? 'fullscreen-mode' : '',
      isDocked ? 'is-docked' : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <main ref={ref} id={id} className={classList}>
        {children}
      </main>
    );
  }
);

ProjectShellWorkspace.displayName = 'ProjectShellWorkspace';

export default ProjectShellWorkspace;
