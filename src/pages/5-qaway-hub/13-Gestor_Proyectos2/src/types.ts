// Tipos compartidos del shell maestro.
export type ModuleKey = 'resumen' | 'cronograma' | 'sedes' | 'tareas' | 'hitos' | 'reuniones' | 'reportes' | 'usuarios' | 'actas' | 'configuracion';

// Prefijo base del Gestor de Proyectos acoplado al Hub
export const BASE_PATH = '/hub/gestor_proyecto';

// Slugs canónicos para cada módulo en la URL
export const MODULE_SLUGS: Record<ModuleKey, string> = {
  resumen: `${BASE_PATH}/resumen`,
  cronograma: `${BASE_PATH}/cronograma`,
  sedes: `${BASE_PATH}/sedes`,
  tareas: `${BASE_PATH}/tareas`,
  hitos: `${BASE_PATH}/componentes`,
  reuniones: `${BASE_PATH}/reuniones`,
  reportes: `${BASE_PATH}/reportes`,
  usuarios: `${BASE_PATH}/equipo`,
  actas: `${BASE_PATH}/actas`,
  configuracion: `${BASE_PATH}/configuracion`,
};

// Mapeo inverso de slugs (y alias compatibles) hacia la clave de módulo interna
export const SLUG_TO_MODULE: Record<string, ModuleKey> = {
  // Rutas canónicas con prefijo /hub/gestor_proyecto
  [`${BASE_PATH}/resumen`]: 'resumen',
  [`${BASE_PATH}/cronograma`]: 'cronograma',
  [`${BASE_PATH}/sedes`]: 'sedes',
  [`${BASE_PATH}/tareas`]: 'tareas',
  [`${BASE_PATH}/componentes`]: 'hitos',
  [`${BASE_PATH}/hitos`]: 'hitos',
  [`${BASE_PATH}/reuniones`]: 'reuniones',
  [`${BASE_PATH}/reportes`]: 'reportes',
  [`${BASE_PATH}/equipo`]: 'usuarios',
  [`${BASE_PATH}/usuarios`]: 'usuarios',
  [`${BASE_PATH}/actas`]: 'actas',
  [`${BASE_PATH}/actas-acuerdos`]: 'actas',
  [`${BASE_PATH}/actas-y-acuerdos`]: 'actas',
  [`${BASE_PATH}/configuracion`]: 'configuracion',

  // Rutas cortas sin prefijo (compatibilidad y redirección si el usuario entra a /reuniones, etc.)
  '/resumen': 'resumen',
  '/cronograma': 'cronograma',
  '/sedes': 'sedes',
  '/tareas': 'tareas',
  '/componentes': 'hitos',
  '/hitos': 'hitos',
  '/reuniones': 'reuniones',
  '/reportes': 'reportes',
  '/equipo': 'usuarios',
  '/usuarios': 'usuarios',
  '/actas': 'actas',
  '/actas-acuerdos': 'actas',
  '/configuracion': 'configuracion',
};

// Conteo semilla del módulo Tareas (paridad con `initial` del módulo: 7 tareas).
// El valor vivo se actualiza desde TareasView vía onTasksCount en cuanto monta.
export const TAREAS_SEED_COUNT = 7;

export const MODULE_STORAGE_KEY = 'qaway-gp-module-v1';

export type UserRole = 'gestor' | 'coordinador';
export const USER_ROLE_STORAGE_KEY = 'qaway-gp-user-role-v1';
