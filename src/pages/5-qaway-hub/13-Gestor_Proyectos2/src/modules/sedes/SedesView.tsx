import React from 'react';
import CronogramaGanttView from '../cronograma-gantt/CronogramaGanttView';

export default function SedesView({
  activeProject,
  activeProjectId,
  onActions,
}: {
  activeProject?: any;
  activeProjectId?: string;
  onActions?: (h: any) => void;
}) {
  return (
    <CronogramaGanttView
      activeProject={activeProject}
      perspective="territorial"
      onActions={onActions}
    />
  );
}
