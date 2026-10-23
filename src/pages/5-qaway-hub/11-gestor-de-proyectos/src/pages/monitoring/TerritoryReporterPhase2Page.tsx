import { useState } from 'react'
import { SlideOverTaskSheet } from '@/components/projects/SlideOverTaskSheet'
import { TerritoryReporterPhase2Tab } from '@/features/territory-reporter/TerritoryReporterPhase2Tab'

/**
 * TerritoryReporterPhase2Page — Módulo autónomo exclusivo de Monitoreo Territorial Fase 2 (RAR Oficial).
 * Soporte Multi-Región: Región Junín (13 UGEL) y Región Pasco (Oxapampa y Daniel Alcides Carrión).
 */
export default function TerritoryReporterPhase2Page() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-[1800px] font-['DM_Sans',sans-serif]">
      <TerritoryReporterPhase2Tab projectId="proj-minedu-2027" onOpenTask={setSelectedTaskId} />
      <SlideOverTaskSheet
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onOpenTask={setSelectedTaskId}
      />
    </div>
  )
}
