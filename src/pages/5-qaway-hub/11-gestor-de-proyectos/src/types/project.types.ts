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
    color: '#2563eb',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  pmbok_p6: {
    label: 'PMBOK / Primavera P6',
    short: 'P6',
    color: '#7c3aed',
    badgeClass: 'bg-violet-50 text-violet-700 border-violet-200',
  },
  kanban: {
    label: 'Kanban Continuo',
    short: 'KANBAN',
    color: '#059669',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  hibrido: {
    label: 'Híbrido',
    short: 'HÍBRIDO',
    color: '#d97706',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
}

export const PROJECT_HEALTH_META: Record<ProjectHealth, DisplayMeta> = {
  optimo: {
    label: 'Óptimo',
    short: 'ÓPTIMO',
    color: '#059669',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  atencion: {
    label: 'En atención',
    short: 'ATENCIÓN',
    color: '#d97706',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  critico: {
    label: 'Crítico',
    short: 'CRÍTICO',
    color: '#e11d48',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

export const PROJECT_STATUS_META: Record<ProjectStatus, DisplayMeta> = {
  planificacion: {
    label: 'Planificación',
    short: 'PLAN',
    color: '#2563eb',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  en_curso: {
    label: 'En curso',
    short: 'CURSO',
    color: '#ff4b0b',
    badgeClass: 'bg-orange-50 text-orange-700 border-orange-200',
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
    color: '#059669',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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
  URGENTE: { color: '#e11d48', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200' },
  ALTA: { color: '#ea580c', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  MEDIA: { color: '#2563eb', badgeClass: 'bg-blue-50 text-blue-700 border-blue-200' },
  BAJA: { color: '#71717a', badgeClass: 'bg-zinc-100 text-zinc-600 border-zinc-200' },
}

export const WORK_ITEM_STATE_META: Record<
  WorkItemState,
  { label: string; accent: string }
> = {
  backlog: { label: 'Backlog', accent: '#a1a1aa' },
  todo: { label: 'Por Hacer', accent: '#2563eb' },
  in_progress: { label: 'En Desarrollo', accent: '#ff4b0b' },
  review: { label: 'En Revisión', accent: '#7c3aed' },
  done: { label: 'Completado', accent: '#059669' },
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
    color: '#d97706',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  aprobado: {
    label: 'Aprobado',
    short: 'OK',
    color: '#059669',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
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

/** Límites WIP por columna Kanban; 99 = sin límite (Fase 9). */
export const KANBAN_WIP_LIMITS: Record<WorkItemState, number> = {
  backlog: 99,
  todo: 6,
  in_progress: 4,
  review: 3,
  done: 99,
}

export const WORKLOAD_RISK_META: Record<
  WorkloadRisk,
  { label: string; color: string; badgeClass: string }
> = {
  saludable: {
    label: 'Saludable',
    color: '#059669',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  alerta: {
    label: 'En alerta',
    color: '#d97706',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  sobrecarga: {
    label: 'Sobrecarga',
    color: '#e11d48',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
}

export const SCHEDULE_STATUS_META: Record<ScheduleStatus, { label: string; color: string }> = {
  adelantado: { label: 'Adelantado', color: '#059669' },
  en_tiempo: { label: 'En tiempo', color: '#2563eb' },
  atrasado: { label: 'Atrasado', color: '#e11d48' },
}

export const COST_STATUS_META: Record<CostStatus, { label: string; color: string }> = {
  bajo_costo: { label: 'Bajo costo', color: '#059669' },
  en_presupuesto: { label: 'En presupuesto', color: '#2563eb' },
  sobrecosto: { label: 'Sobrecosto', color: '#e11d48' },
}

/** Semáforo preventivo de fecha de seguimiento (Fase 10). */
export type FollowUpStatus = 'vencido' | 'alerta' | 'a_tiempo' | 'sin_fecha'

export const FOLLOW_UP_META: Record<
  FollowUpStatus,
  { label: string; color: string; badgeClass: string }
> = {
  vencido: {
    label: 'Vencido',
    color: '#e11d48',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  alerta: {
    label: 'Vence ≤ 72h',
    color: '#d97706',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  a_tiempo: {
    label: 'En plazo',
    color: '#059669',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  sin_fecha: {
    label: 'Sin fecha',
    color: '#71717a',
    badgeClass: 'bg-zinc-100 text-zinc-500 border-zinc-200',
  },
}
