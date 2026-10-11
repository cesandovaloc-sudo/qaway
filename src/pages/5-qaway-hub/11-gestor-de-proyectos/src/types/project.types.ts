// ─────────────────────────────────────────────────────────────────────────
// project.types.ts — Modelo de Datos Maestro: Gestor de Proyectos Universal
// Fuente de verdad: spec.md §2 (Entidades de Datos Maestras)
//
// Este archivo es 100% erasable (solo tipos + mapas de presentación), por lo
// que respeta `erasableSyntaxOnly` del tsconfig del módulo.
// ─────────────────────────────────────────────────────────────────────────

// ── Enums de dominio (uniones literales) ──
export type ProjectCategory =
  | 'software'
  | 'ingenieria'
  | 'consultoria'
  | 'operaciones'
  | 'marketing'

export type ProjectMethodology = 'scrum' | 'pmbok_p6' | 'kanban' | 'hibrido'

export type ProjectStatus =
  | 'planificacion'
  | 'en_curso'
  | 'pausado'
  | 'completado'

export type ProjectHealth = 'optimo' | 'atencion' | 'critico'

export type Currency = 'PEN' | 'USD'

// ── A. Proyecto ──
export interface ProjectBudget {
  currency: Currency
  allocated: number
  spent: number
}

export interface Project {
  id: string // ej: "proj-001"
  code: string // ej: "PRJ-ALPHA"
  name: string // ej: "Plataforma Core Cloud"
  client: string // Cliente o Área interna
  description: string
  category: ProjectCategory
  methodology: ProjectMethodology
  status: ProjectStatus
  health: ProjectHealth
  budget: ProjectBudget
  startDate: string // ISO Date
  targetDate: string // ISO Date
  progress: number // 0 a 100%
  activeSprint?: string
  manager: string
  membersCount: number
  kanbanSettings?: ProjectKanbanSettings // Límites WIP y políticas por proyecto (Fase 1 STATIK)
}

// ── B. Tarea / Work Item ──
export type WorkItemState =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'done'

export type WorkItemPriority = 'URGENTE' | 'ALTA' | 'MEDIA' | 'BAJA'

/** Estimación ágil por tallas (Fase 9 — Suite Metodológica Pro). */
export type TShirtSize = 'XS' | 'S' | 'M' | 'L' | 'XL'

export interface WorkItemAssignee {
  name: string
  avatar?: string
  role: string
  phone?: string // WhatsApp del gestor territorial (Fase 10)
  email?: string // Correo institucional (Fase 10)
}

// ── Fase 11: Trazabilidad & Coordinación Territorial ──
export type TaskOriginType = 'oficial_oficio' | 'accion_emergente'
export type TaskResponseStatus = 'sin_notificar' | 'esperando_respuesta' | 'respondido'

// ── Fase 2 (A35): Naturaleza contractual de la tarea ──
export type TaskNature =
  | 'obligacion_normativa'
  | 'control_complementario'
  | 'contingencia_operativa'

/** Subetapa operativa verificable dentro de una tarjeta (Fase 4 A37). */
export interface TaskChecklistItem {
  id: string
  title: string
  completed: boolean
  completedAt?: string // ISO DateTime del marcado
  completedBy?: string // Responsable que la verificó
}

export interface NotificationAudit {
  whatsappSentAt?: string
  whatsappSentBy?: string
  emailSentAt?: string
  emailSentBy?: string
  appNotifiedAt?: string
}

export interface GestorFeedback {
  responseStatus: TaskResponseStatus
  lastResponseNote?: string
  respondedAt?: string
  respondedBy?: string
}

export interface WorkItem {
  id: string // ej: "TSK-101"
  projectId: string
  sprintId?: string
  milestoneId?: string // Hito Rector vinculado (Fase 10)
  milestoneRef?: string // Referencia normativa oficial ej: "OM 032 · Hito 1.2" (Fase 11)
  originType?: TaskOriginType // 'oficial_oficio' vs 'accion_emergente' (Fase 11)
  taskNature?: TaskNature // Obligación normativa vs control/contingencia (Fase 2 A35)
  threatensMilestone?: boolean // Su retraso amenaza al hito aunque sea complementaria (Fase 2 A35)
  threatNote?: string // Motivo de la amenaza preventiva al hito (Fase 2 A35)
  checklist?: TaskChecklistItem[] // Subetapas operativas verificables (Fase 4 A37)
  epicTitle?: string // Épica / agrupador funcional (Fase 9)
  title: string
  description?: string
  acceptanceCriteria?: string[] // Criterios de aceptación verificables (Fase 9)
  state: WorkItemState
  priority: WorkItemPriority
  assignee: WorkItemAssignee
  multiAssignees?: WorkItemAssignee[] // Co-responsables territoriales (Fase 11)
  notificationAudit?: NotificationAudit // Trazabilidad de contacto auditable (Fase 11)
  gestorFeedback?: GestorFeedback // Feedback y descargo de campo del gestor (Fase 11)
  storyPoints?: number // Para Scrum
  tShirtSize?: TShirtSize // Estimación ágil por tallas (Fase 9)
  durationDays?: number // Para Gantt P6
  startDate?: string
  endDate?: string
  completedAt?: string // ISO DateTime de cierre — motor del burndown (Fase 9)
  followUpDate?: string // ISO Date de seguimiento preventivo (Fase 10)
  scopeTag?: string // UGEL / Ámbito territorial (Fase 10)
  predecessors?: string[] // IDs de tareas previas obligatorias (FS)
  isCriticalPath?: boolean // Indicador de ruta crítica CPM
  isBlocked?: boolean // Bloqueo activo / impedimento (Fase 9)
  blockerReason?: string // Motivo del bloqueo (Fase 9)
}

// ── C. Sprint ──
export type SprintStatus = 'planificacion' | 'activo' | 'cerrado'

export interface Sprint {
  id: string // ej: "sprint-01"
  projectId: string
  name: string // ej: "Sprint 1: Cimientos y Auth"
  goal: string
  startDate: string
  endDate: string
  status: SprintStatus
  totalPoints: number
  completedPoints: number
}

// ── D. Hito Contractual (PMBOK) ──
export type MilestoneStatus = 'pendiente' | 'en_revision' | 'aprobado'

export interface Milestone {
  id: string
  projectId: string
  phaseNumber: number // ej: 1 a 6
  name: string // ej: "Aprobación de Arquitectura"
  targetDate: string
  status: MilestoneStatus
  deliverableSummary: string
  signOffRequired: boolean
}

// ── E. Documento / Wiki (Notion Style) ──
export type ProjectDocCategory =
  | 'especificacion'
  | 'acta_reunion'
  | 'manual'
  | 'general'

export interface ProjectDoc {
  id: string
  projectId: string
  title: string
  icon: string // Emoji o Lucide icon
  category: ProjectDocCategory
  lastEdited: string
  author: string
  content: string // Markdown enriquecido
}

// ── Agregado persistido en el store reactivo ──
export interface ProjectsDataset {
  projects: Project[]
  workItems: WorkItem[]
  sprints: Sprint[]
  milestones: Milestone[]
  docs: ProjectDoc[]
}

// ── F. Suite Metodológica Pro (Fase 9) ──

/** Punto diario del gráfico burndown: línea ideal vs. línea real. */
export interface BurndownSnapshot {
  date: string // ISO Date del día del sprint
  label: string // Etiqueta corta del eje (ej: "12 feb")
  ideal: number // Puntos restantes ideales (recta start → 0)
  actual: number | null // Puntos restantes reales (null = día futuro)
}

export type ScheduleStatus = 'adelantado' | 'en_tiempo' | 'atrasado'
export type CostStatus = 'bajo_costo' | 'en_presupuesto' | 'sobrecosto'

/** Métricas de Valor Ganado (EVM) calculadas sobre presupuesto y avance. */
export interface EarnedValueMetrics {
  budgetAtCompletion: number // BAC = presupuesto asignado
  plannedValue: number // PV = BAC × % tiempo transcurrido
  earnedValue: number // EV = BAC × % avance real
  actualCost: number // AC = presupuesto ejecutado
  cpi: number // EV / AC (eficiencia de costo)
  spi: number // EV / PV (eficiencia de cronograma)
  estimateAtCompletion: number // EAC = AC + (BAC − EV) / CPI
  varianceAtCompletion: number // VAC = BAC − EAC
  progressPct: number // 0-100 avance real
  plannedPct: number // 0-100 avance planificado por fecha
  scheduleStatus: ScheduleStatus
  costStatus: CostStatus
}

export type WorkloadRisk = 'saludable' | 'alerta' | 'sobrecarga'

/** Carga de trabajo por integrante para el widget Anti-Burnout. */
export interface TeamMemberWorkload {
  memberName: string
  role: string
  activeTasks: number
  blockedTasks: number
  totalPoints: number
  capacityPoints: number
  loadPct: number // 0+ (puede superar 100)
  riskLevel: WorkloadRisk
}

// ── Entrada del modal "Nuevo Proyecto" (Task 3.3) ──
export interface NewProjectInput {
  code: string
  name: string
  client: string
  description: string
  category: ProjectCategory
  methodology: ProjectMethodology
  currency: Currency
  budgetAllocated: number
  startDate: string
  targetDate: string
  manager: string
  membersCount: number
}

// ── KPIs de Cartera (Task 3.1 — Dashboard) ──
export interface PortfolioKpis {
  totalProjects: number
  activeProjects: number
  completedProjects: number
  atRiskProjects: number
  avgHealthScore: number // 0-100
  budgetAllocated: number
  budgetSpent: number
  budgetExecutionPct: number // 0-100
  sprintVelocity: number // puntos completados por sprint (promedio)
  tasksAtRisk: number
  totalTasks: number
  doneTasks: number
  globalProgress: number // 0-100
}

// ── Distribuciones para gráficos ──
export interface MethodologyDistribution {
  methodology: ProjectMethodology
  label: string
  count: number
  color: string
}

export interface BudgetByProject {
  projectId: string
  code: string
  name: string
  allocated: number
  spent: number
  currency: Currency
}

// ─────────────────────────────────────────────────────────────────────────
// Metadatos de presentación (labels, colores, badges)
// Patrón espejo de product.ts (`conditionConfig`) para consumo directo en UI.
// ─────────────────────────────────────────────────────────────────────────

export interface DisplayMeta {
  label: string
  short: string
  color: string
  badgeClass: string
}

export const PROJECT_METHODOLOGY_META: Record<ProjectMethodology, DisplayMeta> = {
  scrum: {
    label: 'Ágil / Scrum',
    short: 'SCRUM',
    color: '#cf7143',
    badgeClass: 'bg-[#fdf3ed] text-[#b85a2f] border-[#f5d8c8]',
  },
  pmbok_p6: {
    label: 'PMBOK / Primavera P6',
    short: 'P6',
    color: '#8b829e',
    badgeClass: 'bg-[#f4f2f7] text-[#6d6480] border-[#dedae6]',
  },
  kanban: {
    label: 'Kanban Continuo',
    short: 'KANBAN',
    color: '#404040',
    badgeClass: 'bg-[#f4f4f5] text-[#27272a] border-[#e4e4e7]',
  },
  hibrido: {
    label: 'Híbrido',
    short: 'HÍBRIDO',
    color: '#a3998e',
    badgeClass: 'bg-[#f7f5f2] text-[#786e64] border-[#e8e4de]',
  },
}

export const PROJECT_HEALTH_META: Record<ProjectHealth, DisplayMeta> = {
  optimo: {
    label: 'Óptimo',
    short: 'ÓPTIMO',
    color: '#404040',
    badgeClass: 'bg-[#f4f4f5] text-[#27272a] border-[#e4e4e7]',
  },
  atencion: {
    label: 'En atención',
    short: 'ATENCIÓN',
    color: '#cf7143',
    badgeClass: 'bg-[#fdf3ed] text-[#b85a2f] border-[#f5d8c8]',
  },
  critico: {
    label: 'Crítico',
    short: 'CRÍTICO',
    color: '#b83328',
    badgeClass: 'bg-[#fcedea] text-[#9a2820] border-[#f5cfca]',
  },
}

export const PROJECT_STATUS_META: Record<ProjectStatus, DisplayMeta> = {
  planificacion: {
    label: 'Planificación',
    short: 'PLAN',
    color: '#52525b',
    badgeClass: 'bg-zinc-100 text-zinc-700 border-zinc-200',
  },
  en_curso: {
    label: 'En curso',
    short: 'CURSO',
    color: '#d9532f',
    badgeClass: 'bg-[#fdf0ec] text-[#b83d1c] border-[#f7d6cc]',
  },
  pausado: {
    label: 'Pausado',
    short: 'PAUSA',
    color: '#71717a',
    badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  },
  completado: {
    label: 'Completado',
    short: 'DONE',
    color: '#404040',
    badgeClass: 'bg-[#f4f4f5] text-[#27272a] border-[#e4e4e7]',
  },
}

export const PROJECT_CATEGORY_META: Record<ProjectCategory, { label: string }> = {
  software: { label: 'Software' },
  ingenieria: { label: 'Ingeniería' },
  consultoria: { label: 'Consultoría' },
  operaciones: { label: 'Operaciones' },
  marketing: { label: 'Marketing' },
}

export const WORK_ITEM_PRIORITY_META: Record<
  WorkItemPriority,
  { color: string; badgeClass: string }
> = {
  URGENTE: { color: '#b83328', badgeClass: 'bg-[#fcedea] text-[#9a2820] border-[#f5cfca]' },
  ALTA: { color: '#cf7143', badgeClass: 'bg-[#fdf3ed] text-[#b85a2f] border-[#f5d8c8]' },
  MEDIA: { color: '#52525b', badgeClass: 'bg-[#f4f4f5] text-[#3f3f46] border-[#e4e4e7]' },
  BAJA: { color: '#71717a', badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
}

export const TASK_NATURE_META: Record<
  TaskNature,
  { label: string; badgeClass: string; isContractual: boolean }
> = {
  obligacion_normativa: {
    label: 'Obligación normativa',
    badgeClass: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    isContractual: true,
  },
  control_complementario: {
    label: 'Control complementario',
    badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200',
    isContractual: false,
  },
  contingencia_operativa: {
    label: 'Contingencia operativa',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    isContractual: false,
  },
}

export const WORK_ITEM_STATE_META: Record<
  WorkItemState,
  { label: string; accent: string }
> = {
  backlog: { label: 'Backlog', accent: '#a1a1aa' },
  todo: { label: 'Por Hacer', accent: '#52525b' },
  in_progress: { label: 'En Desarrollo', accent: '#d9532f' },
  review: { label: 'En Revisión', accent: '#8b829e' },
  done: { label: 'Completado', accent: '#404040' },
}

/** Orden canónico de columnas Kanban (Fase 4). */
export const KANBAN_STATE_ORDER: WorkItemState[] = [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'done',
]

export const MILESTONE_STATUS_META: Record<MilestoneStatus, DisplayMeta> = {
  pendiente: {
    label: 'Pendiente',
    short: 'PEND',
    color: '#71717a',
    badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200',
  },
  en_revision: {
    label: 'En revisión',
    short: 'REV',
    color: '#cf7143',
    badgeClass: 'bg-[#fdf3ed] text-[#b85a2f] border-[#f5d8c8]',
  },
  aprobado: {
    label: 'Aprobado',
    short: 'OK',
    color: '#404040',
    badgeClass: 'bg-[#f4f4f5] text-[#27272a] border-[#e4e4e7]',
  },
}

export const PROJECT_DOC_CATEGORY_META: Record<ProjectDocCategory, { label: string }> = {
  especificacion: { label: 'Especificación' },
  acta_reunion: { label: 'Acta de reunión' },
  manual: { label: 'Manual' },
  general: { label: 'General' },
}

/** Puntaje de salud 0-100 usado por el KPI agregado de cartera. */
export const HEALTH_SCORE: Record<ProjectHealth, number> = {
  optimo: 100,
  atencion: 60,
  critico: 25,
}

/** Equivalencia de tallas a story points (Fase 9). */
export const TSHIRT_POINTS: Record<TShirtSize, number> = {
  XS: 1,
  S: 2,
  M: 3,
  L: 5,
  XL: 8,
}

/** Criterios explícitos de entrada/salida de una columna Kanban (Fase 1 STATIK). */
export interface ColumnPolicy {
  entryCriteria: string[]
  exitCriteria: string[]
}

/** Configuración Kanban por proyecto: WIP + políticas explícitas (Fase 1 STATIK). */
export interface ProjectKanbanSettings {
  wipLimits: Record<WorkItemState, number>
  columnPolicies: Record<WorkItemState, ColumnPolicy>
}

/** Límites WIP por columna Kanban; 99 = sin límite (Fase 9). */
export const KANBAN_WIP_LIMITS: Record<WorkItemState, number> = {
  backlog: 99,
  todo: 6,
  in_progress: 4,
  review: 3,
  done: 99,
}

/** Ajustes Kanban universales: límites actuales + políticas genéricas (Fase 1 STATIK). */
export const DEFAULT_KANBAN_SETTINGS: ProjectKanbanSettings = {
  wipLimits: {
    backlog: 99,
    todo: 6,
    in_progress: 4,
    review: 3,
    done: 99,
  },
  columnPolicies: {
    backlog: {
      entryCriteria: ['La tarjeta tiene título claro y responsable asignado'],
      exitCriteria: ['Priorizada y movida a Por Hacer para planificar'],
    },
    todo: {
      entryCriteria: ['Compromiso del equipo en la planificación'],
      exitCriteria: ['Trabajo iniciado o devuelto a Backlog con motivo'],
    },
    in_progress: {
      entryCriteria: ['Un responsable activo tomó la tarjeta'],
      exitCriteria: ['Trabajo terminado y listo para revisión'],
    },
    review: {
      entryCriteria: ['Entregable disponible para verificar'],
      exitCriteria: ['Aprobada contra los criterios de aceptación'],
    },
    done: {
      entryCriteria: ['Verificación aprobada en revisión'],
      exitCriteria: ['Valor entregado y avance registrado'],
    },
  },
}

export const WORKLOAD_RISK_META: Record<
  WorkloadRisk,
  { label: string; color: string; badgeClass: string }
> = {
  saludable: {
    label: 'Saludable',
    color: '#404040',
    badgeClass: 'bg-[#f4f4f5] text-[#27272a] border-[#e4e4e7]',
  },
  alerta: {
    label: 'En alerta',
    color: '#cf7143',
    badgeClass: 'bg-[#fdf3ed] text-[#b85a2f] border-[#f5d8c8]',
  },
  sobrecarga: {
    label: 'Sobrecarga',
    color: '#b83328',
    badgeClass: 'bg-[#fcedea] text-[#9a2820] border-[#f5cfca]',
  },
}

export const SCHEDULE_STATUS_META: Record<ScheduleStatus, { label: string; color: string }> = {
  adelantado: { label: 'Adelantado', color: '#404040' },
  en_tiempo: { label: 'En tiempo', color: '#52525b' },
  atrasado: { label: 'Atrasado', color: '#b83328' },
}

export const COST_STATUS_META: Record<CostStatus, { label: string; color: string }> = {
  bajo_costo: { label: 'Bajo costo', color: '#404040' },
  en_presupuesto: { label: 'En presupuesto', color: '#52525b' },
  sobrecosto: { label: 'Sobrecosto', color: '#b83328' },
}

/** Semáforo preventivo de fecha de seguimiento (Fase 10). */
export type FollowUpStatus = 'vencido' | 'alerta' | 'a_tiempo' | 'sin_fecha'

export const FOLLOW_UP_META: Record<
  FollowUpStatus,
  { label: string; color: string; badgeClass: string }
> = {
  vencido: {
    label: 'Vencido',
    color: '#b83328',
    badgeClass: 'bg-[#fcedea] text-[#9a2820] border-[#f5cfca]',
  },
  alerta: {
    label: 'Vence ≤ 72h',
    color: '#cf7143',
    badgeClass: 'bg-[#fdf3ed] text-[#b85a2f] border-[#f5d8c8]',
  },
  a_tiempo: {
    label: 'En plazo',
    color: '#404040',
    badgeClass: 'bg-[#f4f4f5] text-[#27272a] border-[#e4e4e7]',
  },
  sin_fecha: {
    label: 'Sin fecha',
    color: '#71717a',
    badgeClass: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  },
}
