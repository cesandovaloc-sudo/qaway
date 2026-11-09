// Tipos compartidos del shell maestro.
export type ModuleKey = 'resumen' | 'cronograma' | 'sedes' | 'tareas' | 'tareas2' | 'hitos' | 'reuniones' | 'reuniones2' | 'reportes' | 'reportes2' | 'usuarios' | 'actas' | 'pruebas' | 'configuracion';

export interface ConfigurableModuleInfo {
  key: string;
  name: string;
  defaultSubtitle: string;
}

// Lista oficial y canónica de módulos sincronizada 1:1 con el panel lateral izquierdo
export const CONFIGURABLE_MODULES: ConfigurableModuleInfo[] = [
  { key: 'resumen', name: 'Resumen del proyecto', defaultSubtitle: 'Métricas clave y estado general del proyecto.' },
  { key: 'cronograma', name: 'Proyecto', defaultSubtitle: 'Línea de tiempo oficial y calibración de entregables.' },
  { key: 'sedes', name: 'Sedes', defaultSubtitle: 'Seguimiento territorial de DRE y UGEL en tiempo real.' },
  { key: 'usuarios', name: 'Equipo', defaultSubtitle: 'Padrón operativo y frentes territoriales.' },
  { key: 'tareas2', name: 'Tareas', defaultSubtitle: 'Tablero operativo de tareas.' },
  { key: 'reuniones', name: 'Reuniones', defaultSubtitle: 'Coordinación de sesiones de trabajo y agenda.' },
  { key: 'reuniones2', name: 'Reuniones 2', defaultSubtitle: 'Segunda perspectiva de coordinación y actas.' },
  { key: 'reportes', name: 'Reportes', defaultSubtitle: 'Consolidado de informes territoriales.' },
  { key: 'reportes2', name: 'Reportes 2', defaultSubtitle: 'Analítica territorial complementaria.' },
];

// Ruta pública canónica del Gestor de Proyectos dentro del sistema (sin prefijo /hub)
export const BASE_PATH = '/gestor_proyectos';

// Slugs canónicos oficiales para cada módulo en la URL
export const MODULE_SLUGS: Record<ModuleKey, string> = {
  resumen: `${BASE_PATH}/resumen`,
  cronograma: `${BASE_PATH}/proyecto`,
  sedes: `${BASE_PATH}/sedes`,
  tareas: `${BASE_PATH}/tareas`,
  tareas2: `${BASE_PATH}/tareas-2`,
  hitos: `${BASE_PATH}/componentes`,
  reuniones: `${BASE_PATH}/reuniones`,
  reuniones2: `${BASE_PATH}/reuniones-2`,
  reportes: `${BASE_PATH}/reportes`,
  reportes2: `${BASE_PATH}/reportes-2`,
  usuarios: `${BASE_PATH}/equipo`,
  actas: `${BASE_PATH}/actas`,
  pruebas: `${BASE_PATH}/pruebas`,
  configuracion: `${BASE_PATH}/configuracion`,
};

// Mapeo inverso de slugs (y alias compatibles) hacia la clave de módulo interna
export const SLUG_TO_MODULE: Record<string, ModuleKey> = {
  // Rutas canónicas oficiales bajo /gestor_proyectos
  [`${BASE_PATH}/proyecto`]: 'cronograma',
  [`${BASE_PATH}/cronograma`]: 'cronograma',
  [`${BASE_PATH}/sedes`]: 'sedes',
  [`${BASE_PATH}/resumen`]: 'resumen',
  [`${BASE_PATH}/tareas`]: 'tareas',
  [`${BASE_PATH}/tareas-2`]: 'tareas2',
  [`${BASE_PATH}/componentes`]: 'hitos',
  [`${BASE_PATH}/hitos`]: 'hitos',
  [`${BASE_PATH}/reuniones`]: 'reuniones',
  [`${BASE_PATH}/reuniones-2`]: 'reuniones2',
  [`${BASE_PATH}/reportes`]: 'reportes',
  [`${BASE_PATH}/reportes-2`]: 'reportes2',
  [`${BASE_PATH}/equipo`]: 'usuarios',
  [`${BASE_PATH}/usuarios`]: 'usuarios',
  [`${BASE_PATH}/actas`]: 'actas',
  [`${BASE_PATH}/actas-acuerdos`]: 'actas',
  [`${BASE_PATH}/actas-y-acuerdos`]: 'actas',
  [`${BASE_PATH}/configuracion`]: 'configuracion',
  [`${BASE_PATH}/pruebas`]: 'pruebas',

  // Rutas directas sin prefijo (compatibilidad interna)
  '/proyecto': 'cronograma',
  '/cronograma': 'cronograma',
  '/sedes': 'sedes',
  '/resumen': 'resumen',
  '/tareas': 'tareas',
  '/tareas-2': 'tareas2',
  '/componentes': 'hitos',
  '/hitos': 'hitos',
  '/reuniones': 'reuniones',
  '/reuniones-2': 'reuniones2',
  '/reportes': 'reportes',
  '/reportes-2': 'reportes2',
  '/equipo': 'usuarios',
  '/usuarios': 'usuarios',
  '/actas': 'actas',
  '/actas-acuerdos': 'actas',
  '/configuracion': 'configuracion',
  '/pruebas': 'pruebas',

  // Compatibilidad hacia atrás con rutas legacy que contenían /hub
  '/hub/gestor_proyectos/proyecto': 'cronograma',
  '/hub/gestor_proyectos/cronograma': 'cronograma',
  '/hub/gestor_proyectos/sedes': 'sedes',
  '/hub/gestor_proyectos/resumen': 'resumen',
  '/hub/gestor_proyectos/tareas': 'tareas',
  '/hub/gestor_proyectos/tareas-2': 'tareas2',
  '/hub/gestor_proyectos/componentes': 'hitos',
  '/hub/gestor_proyectos/hitos': 'hitos',
  '/hub/gestor_proyectos/reuniones': 'reuniones',
  '/hub/gestor_proyectos/reuniones-2': 'reuniones2',
  '/hub/gestor_proyectos/reportes': 'reportes',
  '/hub/gestor_proyectos/reportes-2': 'reportes2',
  '/hub/gestor_proyectos/equipo': 'usuarios',
  '/hub/gestor_proyectos/usuarios': 'usuarios',
  '/hub/gestor_proyectos/actas': 'actas',
  '/hub/gestor_proyectos/configuracion': 'configuracion',
  '/hub/gestor_proyectos/proyecto/cronograma': 'cronograma',
  '/hub/gestor_proyectos/proyecto/sedes': 'sedes',
  '/hub/gestor_proyectos/proyecto/resumen': 'resumen',
  '/hub/gestor_proyectos/proyecto/tareas': 'tareas',
  '/hub/gestor_proyectos/proyecto/tareas-2': 'tareas2',
  '/hub/gestor_proyectos/proyecto/componentes': 'hitos',
  '/hub/gestor_proyectos/proyecto/reuniones': 'reuniones',
  '/hub/gestor_proyectos/proyecto/reuniones-2': 'reuniones2',
  '/hub/gestor_proyectos/proyecto/reportes': 'reportes',
  '/hub/gestor_proyectos/proyecto/reportes-2': 'reportes2',
  '/hub/gestor_proyectos/proyecto/equipo': 'usuarios',
  '/hub/gestor_proyectos/proyecto/actas': 'actas',
};

// Conteo semilla del módulo Tareas (paridad con `initial` del módulo: 7 tareas).
// El valor vivo se actualiza desde TareasView vía onTasksCount en cuanto monta.
export const TAREAS_SEED_COUNT = 7;

export const MODULE_STORAGE_KEY = 'qaway-gp-module-v1';

export type UserRole = 'gestor' | 'coordinador';
export const USER_ROLE_STORAGE_KEY = 'qaway-gp-user-role-v1';

// ==============================================================================
// EXTENSIÓN ADITIVA: GOBERNANZA TERRITORIAL, SEDES Y ALERTAS (ARCHITECTURE_ROLES_SEDES.md)
// Todas las interfaces son opcionales (?) y 100% retrocompatibles.
// ==============================================================================

// 1. Los 3 Arquetipos de Gobernanza base (sin alterar UserRole)
export type GovernanceArchetype = 'RECTOR' | 'SUPERVISOR' | 'EJECUTOR';

// Helper de compatibilidad: deduce el arquetipo a partir del UserRole actual
export const resolveArchetypeFromRole = (role: UserRole): GovernanceArchetype => {
  return role === 'coordinador' ? 'RECTOR' : 'EJECUTOR';
};

// 2. Definición opcional de cargos dinámicos (2 a N niveles de cascada)
export interface GovernanceRoleDefinition {
  id: string;
  name: string;                         // Ej: "Coordinador Macroregional", "Jefe de Zona", "Especialista UGEL"
  archetype: GovernanceArchetype;        // 'RECTOR' | 'SUPERVISOR' | 'EJECUTOR'
  level?: number;                       // 1 (Central), 2..N-1 (Táctico), N (Sede/Campo)
  parentRoleId?: string;                // Para cascadas de reporte anidadas
  canApproveBaseline?: boolean;         // Exclusivo Nivel 1 (Sede Central)
}

// 3. Estructura opcional de Delegación de Autoridad (Trazable)
export interface DelegatedPermission {
  id: string;
  grantedToUserId: string;              // Usuario que recibe la facultad
  grantedByUserId: string;              // Rector que autoriza
  canEditWbsAndDates?: boolean;         // Permiso delegado para editar fechas marco
  canManageStaffSedes?: boolean;        // Permiso para reasignar personal a sedes
  scopeSedeIds?: string[] | 'ALL';       // Cobertura autorizada (sedes específicas o todas)
  grantedAt?: string;
  expiresAt?: string;                   // Vigencia temporal opcional
  active: boolean;
}

// 4. Doble Horizonte en Sedes: Nudos Críticos y Prórrogas locales
export interface SedeBlockerRequest {
  hasBlocker?: boolean;                 // true si la sede tiene un nudo crítico activo
  blockerReason?: string;               // Detalle del bloqueo (falta de personal, presupuesto, etc.)
  requestedEndDate?: string;            // Solicitud de prórroga local de la sede
  requestNote?: string;                 // Sustento de la prórroga para Sede Central
  requestStatus?: 'pending' | 'approved' | 'rejected';
}

// 5. Taxonomía de Notificaciones para la Campana del Topbar (Estilo Trello / Linear)
export type NotificationPriority = 'CRITICAL' | 'PREVENTIVE' | 'INFO';

export interface AppNotification {
  id: string;
  title: string;
  description?: string;
  priority: NotificationPriority;       // 'CRITICAL' (Badge rojo), 'PREVENTIVE', 'INFO'
  category?: 'mencion' | 'nudo_critico' | 'prorroga' | 'hito_vencido' | 'asignacion';
  recipientUserId?: string;
  senderName?: string;
  targetModule?: ModuleKey;             // Módulo destino al hacer clic (ej. 'sedes', 'cronograma')
  targetEntityId?: string;              // ID de la tarea, UGEL o sede relacionada
  read: boolean;
  createdAt: string;
}

// Storage keys aditivas para persistencia segura
export const DELEGATIONS_STORAGE_KEY = 'qaway-gp-delegations-v1';
export const NOTIFICATIONS_STORAGE_KEY = 'qaway-gp-notifications-v1';
