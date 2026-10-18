import { useState } from 'react'
import { SlideOverTaskSheet } from '@/components/projects/SlideOverTaskSheet'
import { TerritoryReporterTab } from '@/features/territory-reporter/TerritoryReporterTab'

/**
 * TerritoryReporterPage — Módulo autónomo de Seguimiento y Monitoreo Territorial (CdD - MC SIGA / UGEL).
 * Ubicado en la sección de SEGUIMIENTO & CONTROL (separado de hitos y proyectos individuales).
 */
export default function TerritoryReporterPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-[1800px]">
      <TerritoryReporterTab onOpenTask={setSelectedTaskId} />
      <SlideOverTaskSheet
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onOpenTask={setSelectedTaskId}
      />
    </div>
  )
}
