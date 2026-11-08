import React from 'react';
import CronogramaGanttView from '../cronograma-gantt/CronogramaGanttView';

export default function EquipoView({
  activeProject,
  onActions,
  ...rest
}: {
  activeProject?: any;
  onActions?: (h: { notify: (m: string) => void }) => void;
  [key: string]: any;
}) {
  return (
    <CronogramaGanttView
      perspective="equipo"
      activeProject={activeProject}
      onActions={onActions}
      {...rest}
    />
  );
}
