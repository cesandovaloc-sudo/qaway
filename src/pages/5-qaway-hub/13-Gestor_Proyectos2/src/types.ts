// Tipos compartidos del shell maestro.
export type ModuleKey = 'resumen' | 'cronograma' | 'tareas' | 'hitos' | 'reuniones' | 'reportes' | 'usuarios' | 'actas';

// Slugs canónicos para cada módulo en la URL
export const MODULE_SLUGS: Record<ModuleKey, string> = {
  resumen: '/resumen',
  cronograma: '/cronograma',
  tareas: '/tareas',
  hitos: '/hitos',
  reuniones: '/reuniones',
  reportes: '/reportes',
  usuarios: '/equipo',
  actas: '/actas',
};

// Mapeo inverso de slugs (y alias compatibles) hacia la clave de módulo interna
export const SLUG_TO_MODULE: Record<string, ModuleKey> = {
  '/resumen': 'resumen',
  '/cronograma': 'cronograma',
  '/tareas': 'tareas',
  '/hitos': 'hitos',
  '/reuniones': 'reuniones',
  '/reportes': 'reportes',
  '/equipo': 'usuarios',
  '/usuarios': 'usuarios',
  '/actas': 'actas',
  '/actas-acuerdos': 'actas',
  '/actas-y-acuerdos': 'actas',
};

// Conteo semilla del módulo Tareas (paridad con `initial` del módulo: 7 tareas).
// El valor vivo se actualiza desde TareasView vía onTasksCount en cuanto monta.
export const TAREAS_SEED_COUNT = 7;

export const MODULE_STORAGE_KEY = 'qaway-gp-module-v1';

export type UserRole = 'gestor' | 'coordinador';
export const USER_ROLE_STORAGE_KEY = 'qaway-gp-user-role-v1';
