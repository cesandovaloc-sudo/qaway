/**
 * cronograma-core — tipos canónicos del cronograma (Fase 2, paso 2)
 *
 * Fuente única de los tipos compartidos por la familia v2
 * (tareas-2, cronograma-gantt, reportes-2, reuniones-2).
 * Este archivo NO renderiza nada y NO depende de React.
 *
 * Superset acordado de las 4 copias locales previas:
 * - WbsNodeType incluye 'PRODUCTO' (nodo intermedio BID/PMBOK, feature EDT).
 * - ColKey incluye 'deliverable' y 'reportType' (variantes de las copias).
 * - Item incluye taskType/icon (única diferencia detectada entre copias).
 */
import type { EdtNodeType } from './edtPmbokModel';
import type { DeliverableFormat } from '../../shared/deliverableTypes';

/** Estado oficial del cronograma (vocabulario MINEDU aprobado). */
export type Status = 'Completado' | 'En curso' | 'En proceso' | 'Pendiente' | 'Con retraso' | 'Cumple';

/** Naturaleza del elemento del cronograma. */
export type Kind = 'hito' | 'subproceso';

/** Nivel oficial de la EDT/WBS. */
export type WbsNodeType = 'COMPONENTE' | 'PRODUCTO' | 'SUBCOMPONENTE' | 'PAQUETE_TRABAJO' | 'HITO';

/** Claves de columnas de la tabla del cronograma (abierto: columnas dinámicas permitidas). */
export type ColKey =
  | 'name'
  | 'code'
  | 'kind'
  | 'deliverable'
  | 'parent'
  | 'start'
  | 'end'
  | 'duration'
  | 'progress'
  | 'status'
  | 'dependencies'
  | 'gestor'
  | 'region'
  | 'distrito'
  | 'sede'
  | 'deviation'
  | 'actualEnd'
  | 'reportType'
  | 'actions'
  | (string & {});

export type EditField = ColKey;

/** Entregable oficial vinculado a un item del cronograma. */
export interface DeliverableItem {
  id: string;
  name: string;
  type: DeliverableFormat;
  url?: string | undefined;
  fileName?: string;
}

/** Adjunto del expediente del item. */
export interface AttachmentItem {
  id: string;
  name: string;
  date: string;
  url?: string;
  type?: string;
}

/** Elemento del cronograma maestro (item del Gantt). */
export interface Item {
  id: string;
  code: string;
  name: string;
  kind: Kind;
  /** Clasificación metodológica formal PMI/PMBOK de la EDT/WBS */
  edtType?: EdtNodeType;
  wbsNodeType?: WbsNodeType;
  /** Contenedor macro de ciclo de vida temporal (opcional / nullable) */
  faseId?: string | null | undefined;
  parentId?: string | undefined;
  children?: Item[];
  start: string;
  end: string;
  progress: number;
  status: Status;
  expanded?: boolean;
  description?: string;
  deliverable?: string;
  deliverables?: DeliverableItem[];
  attachments?: AttachmentItem[];
  reportType?: string;
  region?: string;
  distrito?: string | undefined;
  sede?: string | undefined;
  gestor?: string;
  gestores?: string[];
  tasks?: number;
  done?: number;
  unit?: string;
  phase?: string | null;
  /** Línea base aprobada (fechas originales contra las que se mide la desviación). */
  baselineStart?: string;
  baselineEnd?: string | undefined;
  /** Fechas reales de ejecución (se registran al iniciar/completar; editables). */
  actualStart?: string | undefined;
  actualEnd?: string | undefined;
  /** Tareas o hitos predecesores en la cadena de prelación / ruta crítica. */
  dependencies?: string[];
  /** Entidad responsable oficial del componente (DRE / UGEL / región). */
  entidadResponsable?: string | undefined;
  /** Estado de Nudo Critico o Solicitud de Prorroga desde sede territorial.
   *  Solo se popula en perspective="territorial"; ignorado en vista central. */
  blockerInfo?: import('../../types').SedeBlockerRequest;
  /** Tipo de tarea oficial (Reunión, Asistencia técnica, Informe, etc.) e icono Lucide */
  taskType?: string;
  icon?: string;
}
