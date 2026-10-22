import { useState } from 'react'
import { SlideOverTaskSheet } from '@/components/projects/SlideOverTaskSheet'
import { TerritoryReporterV2Tab } from '@/features/territory-reporter/TerritoryReporterV2Tab'

/**
 * TerritoryReporterV2Page — Módulo autónomo V2 de Monitoreo Territorial en 3 Fases
 * (Fase 1: Carga Inicial MC SIGA | Fase Intermedia: Drive Regional 22/10 | Fase 2: Cierre Oficial RAR 26/10).
 * Creado de forma 100% aislada para preservar intacta la versión 1.
 */
export default function TerritoryReporterV2Page() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-[1800px] font-['DM_Sans',sans-serif]">
      <TerritoryReporterV2Tab projectId="proj-minedu-2027" onOpenTask={setSelectedTaskId} />
      <SlideOverTaskSheet
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onOpenTask={setSelectedTaskId}
      />
    </div>
  )
}
