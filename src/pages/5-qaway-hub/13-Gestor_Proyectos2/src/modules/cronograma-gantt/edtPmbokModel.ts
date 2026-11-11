/**
 * QAWAY LAB · Modelo Oficial de Jerarquía EDT / WBS según PMI – PMBOK
 * Define las entidades metodológicas:
 * - FASE (Agrupador macro opcional del ciclo de vida del proyecto)
 * - COMPONENTE (Nivel 1 de la EDT: grandes bloques de alcance, reemplaza al antiguo "Hito agrupador")
 * - SUBCOMPONENTE (Nivel 2..n recursivo: subdivisión intermedia de alcance)
 * - PAQUETE_TRABAJO (Unidad de menor nivel de la EDT con fechas Inicio/Fin y Entidad responsable)
 * - ENTREGABLE (Producto, resultado o evidencia documental sustentatoria verificable)
 * - HITO (Evento o punto de control de duración cero; nunca es contenedor jerárquico)
 */

export type EdtNodeType =
  | 'FASE'
  | 'COMPONENTE'
  | 'PRODUCTO'
  | 'SUBCOMPONENTE'
  | 'PAQUETE_TRABAJO'
  | 'ENTREGABLE'
  | 'HITO';

export interface Fase {
  id: string;
  code: string;
  name: string;
  description?: string;
  order: number;
}

/**
 * Catálogo oficial de Fases del Ciclo de Vida del Proyecto (PMI/PMBOK).
 * Uso opcional (nullable): si un Componente tiene `faseId = null` o el agrupamiento por Fase
 * no está activo, las vistas renderizan directamente desde el Nivel 1 (Componentes).
 */
export const PROJECT_PHASES_CATALOG: Fase[] = [
  {
    id: 'FASE-INICIO',
    code: 'F-01',
    name: 'Inicio',
    description: 'Constitución formal y lineamientos iniciales del programa',
    order: 1,
  },
  {
    id: 'FASE-PLANIFICACION',
    code: 'F-02',
    name: 'Planificación y Preparación',
    description: 'Planificación de la distribución, habilitación de almacenes, actuaciones preparatorias de contratos y registro de personal de apoyo',
    order: 2,
  },
  {
    id: 'FASE-EJECUCION',
    code: 'F-03',
    name: 'Ejecución (Distribución y Registro)',
    description: 'Recepción en DRE/UGEL, despacho a II.EE., recepción en IE, conformidad UGEL, entrega a beneficiarios, SIAGIE y redistribución',
    order: 3,
  },
  {
    id: 'FASE-MONITOREO',
    code: 'F-04',
    name: 'Monitoreo y Control',
    description: 'Seguimiento transversal de indicadores, alertas de desviación y control de calidad de entregables',
    order: 4,
  },
  {
    id: 'FASE-CIERRE',
    code: 'F-05',
    name: 'Cierre',
    description: 'Balance general, evaluación de lecciones aprendidas e Informe Final de Cierre a MINEDU-DIGERE',
    order: 5,
  },
];

/** Diccionario oficial de etiquetas visibles para cada tipo de nodo de la EDT */
export const EDT_NODE_LABELS: Record<EdtNodeType, string> = {
  FASE: 'Fase',
  COMPONENTE: 'Componente',
  PRODUCTO: 'Producto',
  SUBCOMPONENTE: 'Producto',
  PAQUETE_TRABAJO: 'Paquete de Trabajo',
  ENTREGABLE: 'Entregable',
  HITO: 'Hito',
};

/**
 * Determina la clasificación metodológica PMI/PMBOK de un registro del cronograma
 * preservando compatibilidad total con los registros existentes (`kind: 'hito' | 'subproceso'`).
 */
export function resolveEdtNodeType(
  item: {
    id: string;
    kind?: 'hito' | 'subproceso';
    edtType?: EdtNodeType;
    parentId?: string | undefined;
    start?: string;
    end?: string;
  },
  allItems: Array<{ id: string; parentId?: string | undefined }> = []
): EdtNodeType {
  const hasChildren = allItems.length > 0 && allItems.some((c) => c.parentId === item.id);

  // Un Hito real tiene duración cero o tipo HITO explícito sin hijos
  if (!hasChildren && (item.edtType === 'HITO' || (item.start && item.start === item.end))) {
    return 'HITO';
  }

  // Nivel 1 (sin parentId): Todo agrupador raíz del alcance es un COMPONENTE
  if (!item.parentId) {
    return 'COMPONENTE';
  }

  // Nivel intermedio que posee hijos anidados: PRODUCTO (regla BID/PMBOK)
  if (hasChildren) {
    return 'PRODUCTO';
  }

  if (item.edtType === 'ENTREGABLE') {
    return 'ENTREGABLE';
  }

  // Nodo hoja terminal sin hijos: PAQUETE DE TRABAJO (regla BID/PMBOK)
  return 'PAQUETE_TRABAJO';
}

/**
 * Devuelve la etiqueta visible oficial para la capa de interfaz (UI).
 * Reemplaza el uso erróneo de "Hito" como agrupador por "Componente" (raíz)
 * o "Subcomponente" (nivel hijo agrupador).
 */
export function getEdtNodeDisplayLabel(
  item: {
    id: string;
    kind?: 'hito' | 'subproceso';
    edtType?: EdtNodeType;
    parentId?: string | undefined;
    start?: string;
    end?: string;
  },
  allItems: Array<{ id: string; parentId?: string | undefined }> = []
): string {
  const resolved = resolveEdtNodeType(item, allItems);
  return EDT_NODE_LABELS[resolved] || 'Paquete de Trabajo';
}

/**
 * Estructura tipada de referencia oficial del Cronograma Regional DRE Junín - Distribución de Materiales DOT 2027
 * (11 Componentes de Nivel 1, Subcomponentes intermedios, Paquetes de Trabajo y Entregables)
 */
export interface OfficialEdtReferenceRow {
  id: string;
  code: string;
  name: string;
  edtType: EdtNodeType;
  kind: 'hito' | 'subproceso';
  faseId: string | null;
  parentId?: string | undefined;
  subprocesoGroup?: string;
  start: string;
  end: string;
  isContinuousRule?: string;
  entidadResponsable?: string;
  entregableVerificable?: string;
}

export const DRE_JUNIN_DOTACION_2027_EDT: OfficialEdtReferenceRow[] = [
  // =========================================================================
  // COMPONENTE 1: PLANIFICACIÓN DE LA DISTRIBUCIÓN
  // =========================================================================
  {
    id: 'comp-1',
    code: '1.',
    name: 'PLANIFICACIÓN DE LA DISTRIBUCIÓN',
    edtType: 'COMPONENTE',
    kind: 'hito',
    faseId: 'FASE-PLANIFICACION',
    start: '2026-09-04',
    end: '2026-12-01',
    entidadResponsable: 'DRE / UGEL',
  },
  {
    id: 'pt-1.1',
    code: '1.1',
    name: 'Conformación del Comité Regional para el Seguimiento y Monitoreo a la distribución del ME Distribución de Materiales DOT 2027',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-1',
    subprocesoGroup: 'Planificación',
    start: '2026-09-04',
    end: '2026-09-25',
    entidadResponsable: 'DRE',
    entregableVerificable: 'Resolución Directoral Regional de conformación del Comité',
  },
  {
    id: 'pt-1.2',
    code: '1.2',
    name: 'Conformación del Comité de Distribución de ME en las UGEL',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-1',
    subprocesoGroup: 'Planificación',
    start: '2026-09-04',
    end: '2026-09-25',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Resolución Directoral UGEL de conformación del Comité Local',
  },
  {
    id: 'pt-1.3',
    code: '1.3',
    name: 'Elaboración y aprobación del Plan de Monitoreo Regional de la Distribución',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-1',
    subprocesoGroup: 'Planificación',
    start: '2026-09-04',
    end: '2026-09-25',
    entidadResponsable: 'DRE',
    entregableVerificable: 'Resolución Directoral y Plan de Monitoreo Regional aprobado',
  },
  {
    id: 'pt-1.4',
    code: '1.4',
    name: 'Elaboración y aprobación del Plan de Distribución Local en las UGEL',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-1',
    subprocesoGroup: 'Planificación',
    start: '2026-09-04',
    end: '2026-09-25',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Resolución Directoral y Plan de Distribución Local aprobado',
  },
  {
    id: 'pt-1.5',
    code: '1.5',
    name: 'Solicitud de habilitación de códigos modulares en el MC SIGA a DIGERE (DEP / DISER)',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-1',
    subprocesoGroup: 'Planificación',
    start: '2026-09-04',
    end: '2026-09-14',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Oficio de la UGEL, Informe técnico de sustento y archivo Excel',
  },
  {
    id: 'pt-1.6',
    code: '1.6',
    name: 'Elaboración, revisión, validación y actualización del Cuadro de Distribución Local (CDL) en el MC SIGA',
    edtType: 'SUBCOMPONENTE',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-1',
    subprocesoGroup: 'Planificación',
    start: '2026-09-30',
    end: '2026-10-20',
    entidadResponsable: 'DRE / UGEL',
    entregableVerificable: 'Captura de pantalla de confirmación y reporte de cierre CDL en MC SIGA',
  },
  {
    id: 'pt-1.6-dre-junin',
    code: '1.6.0',
    name: 'DRE Junín (Sede Regional Matriz)',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-09-30',
    end: '2026-10-20',
    entidadResponsable: 'DRE',
    entregableVerificable: 'Acta de Conformación del Comité Regional y Matriz CDL consolidada',
  },
  {
    id: 'pt-1.6-chupaca',
    code: '1.6.1',
    name: 'UGEL Chupaca',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-09-30',
    end: '2026-10-15',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Chupaca',
  },
  {
    id: 'pt-1.6-concepcion',
    code: '1.6.2',
    name: 'UGEL Concepción',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-09-30',
    end: '2026-10-15',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Concepción',
  },
  {
    id: 'pt-1.6-huancayo',
    code: '1.6.3',
    name: 'UGEL Huancayo',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-10-02',
    end: '2026-10-18',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Huancayo',
  },
  {
    id: 'pt-1.6-jauja',
    code: '1.6.4',
    name: 'UGEL Jauja',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-10-02',
    end: '2026-10-18',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Jauja',
  },
  {
    id: 'pt-1.6-junin',
    code: '1.6.5',
    name: 'UGEL Junín',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-10-02',
    end: '2026-10-18',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Junín',
  },
  {
    id: 'pt-1.6-satipo',
    code: '1.6.6',
    name: 'UGEL Satipo',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-10-04',
    end: '2026-10-20',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Satipo',
  },
  {
    id: 'pt-1.6-tarma',
    code: '1.6.7',
    name: 'UGEL Tarma',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-10-04',
    end: '2026-10-20',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Tarma',
  },
  {
    id: 'pt-1.6-chanchamayo',
    code: '1.6.8',
    name: 'UGEL Chanchamayo',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-10-04',
    end: '2026-10-20',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Chanchamayo',
  },
  {
    id: 'pt-1.6-yauli',
    code: '1.6.9',
    name: 'UGEL Yauli',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-10-04',
    end: '2026-10-20',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Yauli',
  },
  {
    id: 'pt-1.6-pichanaki',
    code: '1.6.10',
    name: 'UGEL Pichanaki',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-10-04',
    end: '2026-10-20',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Pichanaki',
  },
  {
    id: 'pt-1.6-rio-tambo',
    code: '1.6.11',
    name: 'UGEL Río Tambo',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-10-05',
    end: '2026-10-20',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Río Tambo',
  },
  {
    id: 'pt-1.6-pangoa',
    code: '1.6.12',
    name: 'UGEL Pangoa',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-10-05',
    end: '2026-10-20',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Pangoa',
  },
  {
    id: 'pt-1.6-perene',
    code: '1.6.13',
    name: 'UGEL Perené',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'pt-1.6',
    start: '2026-10-05',
    end: '2026-10-20',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte CDL aprobado y registrado en MC SIGA - UGEL Perené',
  },
  {
    id: 'sub-1.7',
    code: '1.7',
    name: 'Comunicaciones y capacitación a II.EE. (Directores y COGECO)',
    edtType: 'PRODUCTO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-1',
    subprocesoGroup: 'Planificación',
    start: '2026-11-02',
    end: '2026-12-01',
    entidadResponsable: 'UGEL',
  },
  {
    id: 'pt-1.7.1',
    code: '1.7.1',
    name: 'Comunicación a las II.EE. (Directores y COGECO) sobre pautas y distribución del ME Distribución de Materiales DOT 2027',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'sub-1.7',
    subprocesoGroup: 'Planificación',
    start: '2026-11-02',
    end: '2026-11-24',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Oficio Múltiple emitido por la UGEL dirigido a las II.EE. Sustento de publicación.',
  },
  {
    id: 'pt-1.7.2',
    code: '1.7.2',
    name: 'Capacitación a directores e integrantes de COGECO sobre pautas de recepción, verificación y resguardo',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'sub-1.7',
    subprocesoGroup: 'Planificación',
    start: '2026-11-23',
    end: '2026-12-01',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Registro de asistencia, actas y material de capacitación',
  },

  // =========================================================================
  // COMPONENTE 2: GESTIÓN DE ALMACENES
  // =========================================================================
  {
    id: 'comp-2',
    code: '2.',
    name: 'GESTIÓN DE ALMACENES',
    edtType: 'COMPONENTE',
    kind: 'hito',
    faseId: 'FASE-PLANIFICACION',
    start: '2026-09-04',
    end: '2026-09-11',
    entidadResponsable: 'DRE/UGEL',
  },
  {
    id: 'pt-2.1',
    code: '2.1',
    name: 'Habilitación y acondicionamiento de almacenes o centros de recepción (espacios y seguridad)',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-2',
    subprocesoGroup: 'Gestión de almacenes',
    start: '2026-09-04',
    end: '2026-09-11',
    entidadResponsable: 'DRE/UGEL',
    entregableVerificable: 'Informe de verificación y panel fotográfico de almacenes habilitados (externo, interno EPP etc)',
  },
  {
    id: 'pt-2.2',
    code: '2.2',
    name: 'Comunicación oficial del directorio de almacenes y personal autorizado a MINEDU-DIGERE',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-2',
    subprocesoGroup: 'Gestión de almacenes',
    start: '2026-09-04',
    end: '2026-09-11',
    entidadResponsable: 'DRE/UGEL',
    entregableVerificable: 'Oficio remitido a materialesdigere@minedu.gob.pe con directorio',
  },

  // =========================================================================
  // COMPONENTE 3: RECEPCIÓN DE MATERIAL EDUCATIVO EN DRE / UGEL
  // =========================================================================
  {
    id: 'comp-3',
    code: '3.',
    name: 'RECEPCIÓN DE MATERIAL EDUCATIVO EN DRE / UGEL',
    edtType: 'COMPONENTE',
    kind: 'hito',
    faseId: 'FASE-EJECUCION',
    start: '2026-09-15',
    end: '2027-01-30',
    entidadResponsable: 'DRE/UGEL',
  },
  {
    id: 'pt-3.1',
    code: '3.1',
    name: 'Carga de archivos RAR en el MC SIGA para la generación técnica de NEA',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-3',
    subprocesoGroup: 'Recepción en UGEL',
    start: '2026-09-15',
    end: '2027-01-30',
    isContinuousRule: 'En cada llegada de ME',
    entidadResponsable: 'DRE/UGEL',
    entregableVerificable: 'Reporte de carga de archivos RAR en el MC SIGA',
  },
  {
    id: 'pt-3.2',
    code: '3.2',
    name: 'Verificación física de llegada del ME a almacén UGEL y suscripción de PECOSA / Guías / Actas',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-3',
    subprocesoGroup: 'Recepción en UGEL',
    start: '2026-09-15',
    end: '2027-01-30',
    isContinuousRule: 'En cada llegada de ME',
    entidadResponsable: 'DRE/UGEL',
    entregableVerificable: 'PECOSA MINEDU firmado / Actas de incidencia o actas complementarias y registro fotográfico de la actividad (transporte, materiales educativos)',
  },
  {
    id: 'pt-3.3',
    code: '3.3',
    name: 'Registro inmediato de las Notas de Entrada de Almacén (NEA) en el MC SIGA',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-3',
    subprocesoGroup: 'Recepción en UGEL',
    start: '2026-09-15',
    end: '2027-01-30',
    isContinuousRule: 'En cada llegada de ME',
    entidadResponsable: 'DRE/UGEL',
    entregableVerificable: 'NEA registradas en MC SIGA con fecha de PECOSA o acta',
  },

  // =========================================================================
  // COMPONENTE 4: GESTIÓN DE CONTRATOS PARA EL SERVICIO DE DISTRIBUCIÓN DE UGEL A II.EE.
  // =========================================================================
  {
    id: 'comp-4',
    code: '4.',
    name: 'GESTIÓN DE CONTRATOS PARA EL SERVICIO DE DISTRIBUCIÓN DE UGEL A II.EE.',
    edtType: 'COMPONENTE',
    kind: 'hito',
    faseId: 'FASE-PLANIFICACION',
    start: '2026-10-01',
    end: '2027-02-26',
    entidadResponsable: 'UGEL',
  },
  {
    id: 'sub-4.1',
    code: '4.1',
    name: 'Actuaciones preparatorias según tipo de procedimiento de contratación',
    edtType: 'SUBCOMPONENTE',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-4',
    subprocesoGroup: 'Gestión de contratos',
    start: '2026-10-01',
    end: '2027-02-01',
    entidadResponsable: 'UGEL',
  },
  {
    id: 'pt-4.1a',
    code: '4.1a',
    name: 'Actuaciones preparatorias (TDR, indagación, disponibilidad, bases): UE con Procesos de Selección',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'sub-4.1',
    subprocesoGroup: 'Gestión de contratos',
    start: '2026-10-01',
    end: '2026-11-25',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Requerimiento aprobado e inclusión en PAC / Expediente de contratación',
  },
  {
    id: 'pt-4.1b',
    code: '4.1b',
    name: 'Actuaciones preparatorias (TDR, cotizaciones, certificación): UE con Procesos Menores a 8 UIT',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'sub-4.1',
    subprocesoGroup: 'Gestión de contratos',
    start: '2026-12-01',
    end: '2027-02-01',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'TDR aprobados y Certificación de Crédito Presupuestario',
  },
  {
    id: 'pt-4.2',
    code: '4.2',
    name: 'Procedimiento de selección / contratación del servicio de transporte y distribución',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-4',
    subprocesoGroup: 'Gestión de contratos',
    start: '2026-12-01',
    end: '2027-02-01',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Contrato suscrito / Orden de Servicio perfeccionada',
  },
  {
    id: 'pt-4.3',
    code: '4.3',
    name: 'Registro oportuno de contratos del servicio de distribución en el MC SIGA',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-4',
    subprocesoGroup: 'Gestión de contratos',
    start: '2027-02-02',
    end: '2027-02-05',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Constancia de registro del contrato en el MC SIGA',
  },
  {
    id: 'pt-4.4',
    code: '4.4',
    name: 'Ejecución contractual, supervisión de rutas y cumplimiento de prestaciones',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-4',
    subprocesoGroup: 'Gestión de contratos',
    start: '2027-02-02',
    end: '2027-02-26',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Informes de supervisión de transporte e incidencias',
  },

  // =========================================================================
  // COMPONENTE 5: REGISTRO DE PERSONAL DE APOYO PARA LA RECEPCIÓN EN II.EE. (PERÍODO VACACIONAL)
  // =========================================================================
  {
    id: 'comp-5',
    code: '5.',
    name: 'REGISTRO DE PERSONAL DE APOYO PARA LA RECEPCIÓN EN II.EE. (PERÍODO VACACIONAL)',
    edtType: 'COMPONENTE',
    kind: 'hito',
    faseId: 'FASE-PLANIFICACION',
    start: '2026-10-01',
    end: '2027-01-13',
    entidadResponsable: 'UGEL / II.EE.',
  },
  {
    id: 'sub-5.1',
    code: '5.1',
    name: 'Solicitud y remisión del padrón de personal de apoyo en II.EE.',
    edtType: 'SUBCOMPONENTE',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-5',
    subprocesoGroup: 'Personal de apoyo',
    start: '2026-10-01',
    end: '2026-11-24',
    entidadResponsable: 'UGEL / II.EE.',
  },
  {
    id: 'pt-5.1a',
    code: '5.1a',
    name: 'Envío de oficio de UGEL solicitando el listado de personal de apoyo a COGECO en II.EE.',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'sub-5.1',
    subprocesoGroup: 'Personal de apoyo',
    start: '2026-10-01',
    end: '2026-10-30',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Oficio múltiple cursado a directores de II.EE. Priorizadas. Sustento de publicación.',
  },
  {
    id: 'pt-5.1b',
    code: '5.1b',
    name: 'Remisión de respuesta con el listado de personal de apoyo por parte de las II.EE. a la UGEL',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'sub-5.1',
    subprocesoGroup: 'Personal de apoyo',
    start: '2026-11-02',
    end: '2026-11-24',
    entidadResponsable: 'II.EE.',
    entregableVerificable: 'Oficios de respuesta de las II.EE. con padrón de personas de apoyo',
  },
  {
    id: 'pt-5.2',
    code: '5.2',
    name: 'Emisión de Resolución Directoral de reconocimiento al personal de apoyo para el periodo vacacional',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-5',
    subprocesoGroup: 'Personal de apoyo',
    start: '2026-11-30',
    end: '2026-12-15',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Resolución Directoral UGEL de aprobación de lista de personal de apoyo',
  },
  {
    id: 'pt-5.3',
    code: '5.3',
    name: 'Capacitación en la IE al personal de apoyo sobre pautas de verificación y recepción (1.7)',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-5',
    subprocesoGroup: 'Personal de apoyo',
    start: '2026-12-01',
    end: '2026-12-15',
    entidadResponsable: 'II.EE.',
    entregableVerificable: 'Actas de capacitación institucional y firmas en la IE. Registro fotográfico',
  },
  {
    id: 'pt-5.4',
    code: '5.4',
    name: 'Registro en el MC SIGA del personal de apoyo para la recepción del ME periodo vacacional 2027',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-PLANIFICACION',
    parentId: 'comp-5',
    subprocesoGroup: 'Personal de apoyo',
    start: '2026-12-21',
    end: '2027-01-13',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte de registro validado por Residente SIGA en MC SIGA',
  },

  // =========================================================================
  // COMPONENTE 6: DESPACHO DE ME DE UGEL A LAS II.EE.
  // =========================================================================
  {
    id: 'comp-6',
    code: '6.',
    name: 'DESPACHO DE ME DE UGEL A LAS II.EE.',
    edtType: 'COMPONENTE',
    kind: 'hito',
    faseId: 'FASE-EJECUCION',
    start: '2026-12-15',
    end: '2027-02-12',
    entidadResponsable: 'UGEL',
  },
  {
    id: 'pt-6.1',
    code: '6.1',
    name: 'Atención a nuevos servicios educativos (CM creados no previstos en CDL inicial)',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-6',
    subprocesoGroup: 'Despacho UGEL',
    start: '2026-12-15',
    end: '2027-02-02',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Informe de AGP/Estadística y creación de centro de costo',
  },
  {
    id: 'pt-6.2',
    code: '6.2',
    name: 'Generación y emisión de PECOSA mediante el MC SIGA',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-6',
    subprocesoGroup: 'Despacho UGEL',
    start: '2027-02-02',
    end: '2027-02-10',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'PECOSA emitidos en MC SIGA impresos en almacén',
  },
  {
    id: 'pt-6.3',
    code: '6.3',
    name: 'Modulado, embalaje y rotulado del ME según criterios y PECOSA',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-6',
    subprocesoGroup: 'Despacho UGEL',
    start: '2027-02-02',
    end: '2027-02-12',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Cargos de entrega de paquetes modulados al transportista',
  },
  {
    id: 'pt-6.4',
    code: '6.4',
    name: 'Orientaciones e inducción al proveedor del servicio de transporte sobre protocolos de entrega (1.7)',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-6',
    subprocesoGroup: 'Despacho UGEL',
    start: '2027-02-02',
    end: '2027-02-09',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Acta de reunión técnica de coordinación con empresa transportista. Registro fotográfico',
  },
  {
    id: 'pt-6.5',
    code: '6.5',
    name: 'Comunicación y difusión a las II.EE. y comunidad educativa sobre el cronograma de despacho',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-6',
    subprocesoGroup: 'Despacho UGEL',
    start: '2027-02-02',
    end: '2027-02-09',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Oficios múltiples, comunicados web/redes sociales y spots radiales',
  },

  // =========================================================================
  // COMPONENTE 7: RECEPCIÓN DE ME EN LA IE
  // =========================================================================
  {
    id: 'comp-7',
    code: '7.',
    name: 'RECEPCIÓN DE ME EN LA IE',
    edtType: 'COMPONENTE',
    kind: 'hito',
    faseId: 'FASE-EJECUCION',
    start: '2027-01-15',
    end: '2027-02-26',
    entidadResponsable: 'UGEL / II.EE.',
  },
  {
    id: 'pt-7.1',
    code: '7.1',
    name: 'Recepción física, verificación y suscripción de PECOSA en la IE',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-7',
    subprocesoGroup: 'Recepción en IE',
    start: '2027-01-15',
    end: '2027-02-26',
    entidadResponsable: 'UGEL / II.EE.',
    entregableVerificable: 'PECOSA original firmado y sellado',
  },
  {
    id: 'pt-7.2',
    code: '7.2',
    name: 'Tratamiento, formulación y reporte de Actas de Incidencia de recepción',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-7',
    subprocesoGroup: 'Recepción en IE',
    start: '2027-01-15',
    end: '2027-02-26',
    entidadResponsable: 'UGEL / II.EE.',
    entregableVerificable: 'Actas de Incidencia y registro fotográfico de mermas/daños',
  },

  // =========================================================================
  // COMPONENTE 8: CONFORMIDAD DE ENTREGA DE ME A LAS II.EE. A CARGO DE LA UGEL
  // =========================================================================
  {
    id: 'comp-8',
    code: '8.',
    name: 'CONFORMIDAD DE ENTREGA DE ME A LAS II.EE. A CARGO DE LA UGEL',
    edtType: 'COMPONENTE',
    kind: 'hito',
    faseId: 'FASE-MONITOREO',
    start: '2027-01-20',
    end: '2027-03-09',
    entidadResponsable: 'UGEL',
  },
  {
    id: 'pt-8.1',
    code: '8.1',
    name: 'Verificación y control de firmas de PECOSAs de retorno para otorgar conformidad del servicio',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-MONITOREO',
    parentId: 'comp-8',
    subprocesoGroup: 'Conformidad UGEL',
    start: '2027-01-20',
    end: '2027-03-05',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Informe de culminacion del servicio emitido por Almacén/Abastecimiento',
  },
  {
    id: 'pt-8.2',
    code: '8.2',
    name: 'Registro sistemático y progresivo de la conformidad de PECOSA en el MC SIGA',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-MONITOREO',
    parentId: 'comp-8',
    subprocesoGroup: 'Conformidad UGEL',
    start: '2027-01-20',
    end: '2027-03-09',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte de registro de conformidad al 100% en MC SIGA',
  },

  // =========================================================================
  // COMPONENTE 9: ENTREGA DE ME A BENEFICIARIOS Y REGISTRO EN EL MÓDULO MATERIALES SIAGIE
  // =========================================================================
  {
    id: 'comp-9',
    code: '9.',
    name: 'ENTREGA DE ME A BENEFICIARIOS Y REGISTRO EN EL MÓDULO MATERIALES SIAGIE',
    edtType: 'COMPONENTE',
    kind: 'hito',
    faseId: 'FASE-EJECUCION',
    start: '2027-02-01',
    end: '2027-07-27',
    entidadResponsable: 'UGEL / II.EE.',
  },
  {
    id: 'sub-9.1',
    code: '9.1',
    name: 'Planificación e implementación de capacitación sobre Módulo Materiales SIAGIE',
    edtType: 'SUBCOMPONENTE',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-9',
    subprocesoGroup: 'SIAGIE ME',
    start: '2027-02-01',
    end: '2027-03-16',
    entidadResponsable: 'UGEL',
  },
  {
    id: 'pt-9.1a',
    code: '9.1a',
    name: 'Elaboración del Plan de Capacitación para registro en Módulo Materiales SIAGIE',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'sub-9.1',
    subprocesoGroup: 'SIAGIE ME',
    start: '2027-02-01',
    end: '2027-02-24',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Plan de capacitación aprobado conteniendo la estrategia y el cronograma de capacitacion como minimo.',
  },
  {
    id: 'pt-9.1b',
    code: '9.1b',
    name: 'Implementación del Plan de Capacitación para registro en Módulo Materiales SIAGIE',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'sub-9.1',
    subprocesoGroup: 'SIAGIE ME',
    start: '2027-02-01',
    end: '2027-03-16',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Oficios, comunicado de convocatoria a la capacitacion, listas de directores capacitados, registro fotografico de las capacitaciones.',
  },
  {
    id: 'sub-9.2',
    code: '9.2',
    name: 'Registro de recepción de ME en SIAGIE (BIAE y Post BIAE)',
    edtType: 'SUBCOMPONENTE',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-9',
    subprocesoGroup: 'SIAGIE ME',
    start: '2027-03-01',
    end: '2027-07-13',
    entidadResponsable: 'UGEL / II.EE.',
  },
  {
    id: 'pt-9.2a',
    code: '9.2a',
    name: 'Registro de recepción de ME en SIAGIE: Materiales distribuidos antes de inicio de clases (ME BIAE)',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'sub-9.2',
    subprocesoGroup: 'SIAGIE ME',
    start: '2027-03-01',
    end: '2027-04-12',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Reporte SIAGIE de registro de recepción de ME BIAE',
  },
  {
    id: 'pt-9.2b',
    code: '9.2b',
    name: 'Registro de recepción de ME en SIAGIE: Materiales distribuidos tras inicio de clases (ME Post BIAE)',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'sub-9.2',
    subprocesoGroup: 'SIAGIE ME',
    start: '2027-04-19',
    end: '2027-07-13',
    entidadResponsable: 'UGEL / II.EE.',
    entregableVerificable: 'Reporte SIAGIE de registro de recepción de ME Post BIAE',
  },
  {
    id: 'pt-9.3',
    code: '9.3',
    name: 'Entrega efectiva de cuadernos y textos a beneficiarios finales (estudiantes y docentes de aula)',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-9',
    subprocesoGroup: 'Beneficiarios',
    start: '2027-03-15',
    end: '2027-03-22',
    entidadResponsable: 'UGEL / II.EE.',
    entregableVerificable: 'Padrones y cargos de entrega firmados por estudiantes/padres',
  },
  {
    id: 'sub-9.4',
    code: '9.4',
    name: 'Registro de asignación nominal a estudiantes en SIAGIE (BIAE y Post BIAE)',
    edtType: 'SUBCOMPONENTE',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-9',
    subprocesoGroup: 'SIAGIE ME',
    start: '2027-03-15',
    end: '2027-07-27',
    entidadResponsable: 'UGEL / II.EE.',
  },
  {
    id: 'pt-9.4a',
    code: '9.4a',
    name: 'Registro de asignación nominal a estudiantes en SIAGIE: ME BIAE',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'sub-9.4',
    subprocesoGroup: 'SIAGIE ME',
    start: '2027-03-15',
    end: '2027-04-27',
    entidadResponsable: 'UGEL / II.EE.',
    entregableVerificable: 'Reporte SIAGIE de porcentaje de asignación a beneficiarios BIAE',
  },
  {
    id: 'pt-9.4b',
    code: '9.4b',
    name: 'Registro de asignación nominal a estudiantes en SIAGIE: ME Post BIAE',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'sub-9.4',
    subprocesoGroup: 'SIAGIE ME',
    start: '2027-05-03',
    end: '2027-07-27',
    entidadResponsable: 'UGEL / II.EE.',
    entregableVerificable: 'Reporte SIAGIE de porcentaje de asignación a beneficiarios Post BIAE',
  },

  // =========================================================================
  // COMPONENTE 10: REDISTRIBUCIÓN Y DISTRIBUCIÓN LOCAL DE ME PARA ALCANZAR SUFICIENCIA
  // =========================================================================
  {
    id: 'comp-10',
    code: '10.',
    name: 'REDISTRIBUCIÓN Y DISTRIBUCIÓN LOCAL DE ME PARA ALCANZAR SUFICIENCIA',
    edtType: 'COMPONENTE',
    kind: 'hito',
    faseId: 'FASE-EJECUCION',
    start: '2027-05-03',
    end: '2027-06-14',
    entidadResponsable: 'UGEL / DRE',
  },
  {
    id: 'pt-10.1',
    code: '10.1',
    name: 'Cálculo y validación del cuadro de déficit y excedentes de ME por IE frente a matrícula real',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-10',
    subprocesoGroup: 'Redistribución',
    start: '2027-05-03',
    end: '2027-05-18',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Cuadro validado por directores de déficit y excedencia por IE',
  },
  {
    id: 'pt-10.2',
    code: '10.2',
    name: 'Envío del cuadro consolidado de ME excedente y déficit por título de las UGEL a la DRELP',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-10',
    subprocesoGroup: 'Redistribución',
    start: '2027-05-19',
    end: '2027-05-24',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Oficio remitido por UGEL a DRELP con cuadro consolidado',
  },
  {
    id: 'pt-10.3',
    code: '10.3',
    name: 'Consolidación regional de déficit/excedencias y formulación de propuesta de redistribución',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-10',
    subprocesoGroup: 'Redistribución',
    start: '2027-05-25',
    end: '2027-05-28',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Propuesta técnica de redistribución regional elaborada por DRELP',
  },
  {
    id: 'pt-10.4',
    code: '10.4',
    name: 'Redistribución Regional inter-UGEL mediante generación de PECOSA en MC SIGA (de requerirse)',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-10',
    subprocesoGroup: 'Redistribución',
    start: '2027-06-01',
    end: '2027-06-08',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'PECOSA SIGA inter-UGEL y actas de transferencia de materiales',
  },
  {
    id: 'pt-10.5',
    code: '10.5',
    name: 'Ejecución de distribución y redistribución de ME a II.EE. para alcanzar el 100% de suficiencia',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-EJECUCION',
    parentId: 'comp-10',
    subprocesoGroup: 'Redistribución',
    start: '2027-06-01',
    end: '2027-06-14',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'PECOSA de entrega y registro de estrategia en MC SIGA',
  },

  // =========================================================================
  // COMPONENTE 11: BALANCE Y CIERRE DEL PROCESO DE DISTRIBUCIÓN Y REDISTRIBUCIÓN
  // =========================================================================
  {
    id: 'comp-11',
    code: '11.',
    name: 'BALANCE Y CIERRE DEL PROCESO DE DISTRIBUCIÓN Y REDISTRIBUCIÓN',
    edtType: 'COMPONENTE',
    kind: 'hito',
    faseId: 'FASE-CIERRE',
    start: '2027-08-02',
    end: '2027-08-25',
    entidadResponsable: 'UGEL / DRE',
  },
  {
    id: 'pt-11.1',
    code: '11.1',
    name: 'Balance general y evaluación de lecciones aprendidas de los subprocesos de la Distribución de Materiales DOT 2027',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-CIERRE',
    parentId: 'comp-11',
    subprocesoGroup: 'Balance y cierre',
    start: '2027-08-02',
    end: '2027-08-10',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Informe de balance técnico de distribución regional y local',
  },
  {
    id: 'pt-11.2',
    code: '11.2',
    name: 'Elaboración y remisión del Informe Final de Cierre del proceso a MINEDU-DIGERE',
    edtType: 'PAQUETE_TRABAJO',
    kind: 'subproceso',
    faseId: 'FASE-CIERRE',
    parentId: 'comp-11',
    subprocesoGroup: 'Balance y cierre',
    start: '2027-08-11',
    end: '2027-08-25',
    entidadResponsable: 'UGEL',
    entregableVerificable: 'Informe de cierre institucional remitido mediante Oficio a DIGERE',
  },
];

/**
 * Comparador numérico natural para códigos WBS / EDT (ej. "1.", "1.1", "1.7a", "1.10", "2.", "10.", "11.").
 * Evita el ordenamiento alfabético estándar donde "10." precede erróneamente a "2.".
 */
export function compareWbsCodes(codeA?: string, codeB?: string): number {
  if (!codeA && !codeB) return 0;
  if (!codeA) return 1;
  if (!codeB) return -1;
  const segsA = codeA.replace(/\.$/, '').split('.');
  const segsB = codeB.replace(/\.$/, '').split('.');
  const len = Math.max(segsA.length, segsB.length);
  for (let i = 0; i < len; i++) {
    const sA = segsA[i];
    const sB = segsB[i];
    if (sA === undefined) return -1;
    if (sB === undefined) return 1;
    const matchA = sA.match(/^(\d+)(.*)$/);
    const matchB = sB.match(/^(\d+)(.*)$/);
    if (matchA && matchB) {
      const numA = parseInt(matchA[1] ?? '', 10);
      const numB = parseInt(matchB[1] ?? '', 10);
      if (numA !== numB) return numA - numB;
      const suffComp = (matchA[2] ?? '').localeCompare(matchB[2] ?? '');
      if (suffComp !== 0) return suffComp;
    } else {
      const cmp = sA.localeCompare(sB, undefined, { numeric: true });
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
}

/**
 * Ordena canónicamente una lista jerárquica respetando:
 * 1. Nodos raíz (Componentes principales) ordenados por código WBS ("1.", "2." ... "10.", "11.").
 * 2. Hijos directamente anidados bajo su padre, ordenados por código WBS.
 * 3. Sub-hijos (Nivel 3) anidados bajo su respectivo subcomponente.
 */
export function sortWbsHierarchy<T extends { id: string; code?: string | undefined; parentId?: string | undefined }>(items: T[]): T[] {
  const ids = new Set(items.map((r) => r.id));
  const children = new Map<string, T[]>();
  const roots: T[] = [];
  items.forEach((r) => {
    const pid = r.parentId;
    if (pid && ids.has(pid)) {
      const list = children.get(pid) || [];
      list.push(r);
      children.set(pid, list);
    } else {
      roots.push(r);
    }
  });

  const out: T[] = [];
  const seen = new Set<string>();
  const walk = (list: T[]) => {
    [...list].sort((a, b) => compareWbsCodes(a.code, b.code)).forEach((r) => {
      if (seen.has(r.id)) return;
      seen.add(r.id);
      out.push(r);
      const kids = children.get(r.id);
      if (kids) walk(kids);
    });
  };
  walk(roots);
  return out.length === items.length ? out : items;
}

/**
 * Predicado universal para detectar y aislar registros residuales (mocks de prueba antiguos h1..h9, s11..s99, huérfanos).
 */
export const isLegacyCronogramaItem = (it: { id?: string; name?: string; code?: string }): boolean => {
  if (!it || !it.id) return true;
  if (/^h\d+$/i.test(it.id) || /^s\d+$/i.test(it.id)) return true;
  if (it.id.startsWith('h-') || it.id.startsWith('new-')) return true;
  if (typeof it.name === 'string') {
    const low = it.name.toLowerCase();
    if (low.includes('nuevo hito') || low.includes('nuevo subproceso')) return true;
    if (it.name === 'Planificación de la distribución y conformación de comités') return true;
    if (it.name === 'Distribución y Transporte a II.EE.') return true;
    if (it.name === 'Cierre, PECOSA y Consolidado Regional') return true;
    if (it.name === 'Informe Técnico Final MINEDU - DIGERE') return true;
  }
  return false;
};
