/**
 * src/modules/sedes/types.ts
 *
 * Modelo de referencia territorial para la vista /sedes.
 * SedesView.tsx es un wrapper de <CronogramaGanttView perspective="territorial" />;
 * la fila operativa real es la interfaz `Item` de CronogramaGanttView.tsx.
 *
 * Este archivo expone tipos auxiliares de dominio territorial sin reemplazar
 * ni duplicar el motor de rendering del Gantt.
 */

import type { SedeBlockerRequest } from '../../types';

// ---------------------------------------------------------------------------
// Estado de procesamiento de una solicitud territorial
// ---------------------------------------------------------------------------
export type SedeRequestStatus = 'pending' | 'approved' | 'rejected' | 'info';

// ---------------------------------------------------------------------------
// SedeDeliverableRow — modelo de referencia territorial
// Representa el estado de una sede/UGEL dentro de un paquete de trabajo específico.
// NO reemplaza Item; úsala para lógica de negocio, formularios y drawer de sede.
// ---------------------------------------------------------------------------
export interface SedeDeliverableRow {
  /** ID único de la combinación sede+entregable, ej. "ugel-junin_pt-1.6" */
  id: string;
  /** Código del paquete de trabajo al que pertenece, ej. "pt-1.6" */
  deliverableCode: string;
  /** Nombre del paquete de trabajo, ej. "CDL - Carta de Dotación Local" */
  deliverableName: string;
  /** ID de la sede/UGEL/frente */
  sedeId: string;
  /** Nombre visible de la sede/UGEL */
  sedeNombre: string;
  /** Región geográfica (ej. "Junín") */
  region?: string;
  /** Porcentaje de avance reportado por el gestor territorial (0–100) */
  progress: number;
  /** Estado operativo de la sede en este paquete */
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'at_risk';
  /** Fecha inicio planificada (ISO 8601) */
  startDate: string;
  /** Fecha fin planificada (ISO 8601) */
  endDate: string;
  /** ID del gestor territorial asignado (referencia a Integrante.id) */
  gestorId?: string;
  /** Nombre del gestor territorial para display */
  gestorNombre?: string;
  /** Estado de Nudo Crítico o Solicitud de Prórroga para este paquete */
  blockerInfo?: SedeBlockerRequest;
  /** Timestamp del último reporte de avance */
  lastUpdatedAt?: string;
  /** Notas operativas del gestor territorial */
  notes?: string;
}

// ---------------------------------------------------------------------------
// SedeAlertSummary — resumen de alertas para el panel de Coordinación
// Permite agrupar alertas por paquete en lugar de disparar una por sede
// (patrón Anti-Saturación aprobado en la arquitectura)
// ---------------------------------------------------------------------------
export interface SedeAlertSummary {
  deliverableCode: string;
  deliverableName: string;
  totalSedes: number;
  sedesConBlocker: number;
  sedesEnRiesgo: number;
  sedesPendientesProrroga: number;
  /** Lista de sedeIds afectadas para navegación directa */
  affectedSedeIds: string[];
}
