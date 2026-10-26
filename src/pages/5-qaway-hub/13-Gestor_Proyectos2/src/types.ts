// Tipos compartidos del shell maestro.
export type ModuleKey = 'tareas' | 'cronograma' | 'reuniones';

// Conteo semilla del módulo Tareas (paridad con `initial` del módulo: 7 tareas).
// El valor vivo se actualiza desde TareasView vía onTasksCount en cuanto monta.
export const TAREAS_SEED_COUNT = 7;

export const MODULE_STORAGE_KEY = 'qaway-gp-module-v1';
