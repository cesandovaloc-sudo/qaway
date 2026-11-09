import React from 'react';
import CronogramaGanttView from '../cronograma-gantt/CronogramaGanttView';

export default function SedesView({
  activeProject,
  activeProjectId,
  onActions,
  isActive = true,
}: {
  activeProject?: any;
  activeProjectId?: string;
  onActions?: (h: any) => void;
  isActive?: boolean;
}) {
  return (
    <CronogramaGanttView
      activeProject={activeProject}
      perspective="territorial"
      onActions={onActions}
      isActive={isActive}
    />
  );
}
