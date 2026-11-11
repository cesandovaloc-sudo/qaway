// ─────────────────────────────────────────────────────────────────────────────
// Vocabulario canónico de entregables — única fuente para los 4 módulos del
// Gestor de Proyectos (tareas-2, cronograma-gantt, reportes-2, reuniones-2).
//
// Son DOS vocabularios de negocio distintos que comparten dominio pero no
// significado. NO unificarlos:
//  · DeliverableFormat → formato del archivo adjunto en el picker del drawer
//    de detalle del cronograma (5 valores, inglés).
//  · DeliverableType   → formato oficial del entregable de una tarea nueva
//    creada desde TareaNuevaModal (4 valores, español).
// ─────────────────────────────────────────────────────────────────────────────

/** Formato del entregable adjunto (picker del drawer de detalle). */
export type DeliverableFormat = 'document' | 'spreadsheet' | 'presentation' | 'link' | 'physical';

/** Formato oficial del entregable de una tarea nueva (modal TareaNuevaModal). */
export type DeliverableType = 'Videoconferencia' | 'Documento' | 'Asistencia técnica' | 'Acta/Registro';
