import type {
  BudgetByProject,
  BurndownSnapshot,
  CostStatus,
  EarnedValueMetrics,
  MethodologyDistribution,
  Milestone,
  NewProjectInput,
  PortfolioKpis,
  Project,
  ProjectDoc,
  ProjectsDataset,
  ProjectMethodology,
  ScheduleStatus,
  Sprint,
  TeamMemberWorkload,
  WorkItem,
  WorkloadRisk,
} from '@/types/project.types'
import {
  HEALTH_SCORE,
  PROJECT_METHODOLOGY_META,
  TSHIRT_POINTS,
} from '@/types/project.types'
import { mockProjectsDataset } from '@/data/mock-projects-data'

// ─────────────────────────────────────────────────────────────────────────
// projectsService.ts — Store Universal Reactivo (Task 2.3)
//
// Cumple la regla de negocio del spec: "Cero dependencias remotas
// bloqueantes: 100% operativo con datos locales y almacenamiento
// localStorage reactivo".
//
// - Persistencia: localStorage bajo `qaway_projects_v1`.
// - Reactividad: patrón observable (subscribe + getSnapshot) compatible con
//   `useSyncExternalStore`, sin acoplar el servicio a React.
// - Aislamiento: no toca Supabase ni el auth del Hub.
// ─────────────────────────────────────────────────────────────────────────

const STORAGE_KEY = 'qaway_projects_v2'

type Listener = () => void

// ── Utilidades de estado ──
function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function isDataset(value: unknown): value is ProjectsDataset {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Partial<ProjectsDataset>
  return (
    Array.isArray(candidate.projects) &&
    Array.isArray(candidate.workItems) &&
    Array.isArray(candidate.sprints) &&
    Array.isArray(candidate.milestones) &&
    Array.isArray(candidate.docs)
  )
}

function nextSequentialId(prefix: string, existing: string[]): string {
  let max = 0
  for (const id of existing) {
    const match = id.match(/(\d+)$/)
    if (match) max = Math.max(max, Number(match[1]))
  }
  return `${prefix}${String(max + 1).padStart(3, '0')}`
}

function readStorage(): ProjectsDataset | null {
  if (typeof window === 'undefined') return null
  try {
    let raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      // Intentar migrar desde v1 si existía previamente
      raw = window.localStorage.getItem('qaway_projects_v1')
    }
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isDataset(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writeStorage(dataset: ProjectsDataset): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset))
  } catch {
    // Almacenamiento no disponible: el store vive solo en memoria.
  }
}

function loadInitialState(): ProjectsDataset {
  const persisted = readStorage()
  if (!persisted) {
    const seeded = clone(mockProjectsDataset)
    writeStorage(seeded)
    return seeded
  }

  // Auto-fusión resiliente: asegurar que los proyectos semilla maestros
  // (incluyendo proj-minedu-2027) estén presentes sin borrar los creados por el usuario
  let hasMissing = false
  const projects = [...persisted.projects]
  const workItems = [...persisted.workItems]
  const sprints = [...persisted.sprints]
  const milestones = [...persisted.milestones]
  const docs = [...persisted.docs]

  for (const seedProject of mockProjectsDataset.projects) {
    if (!projects.some((p) => p.id === seedProject.id)) {
      hasMissing = true
      projects.unshift(clone(seedProject)) // Poner al inicio para máxima visibilidad
      const seedItems = mockProjectsDataset.workItems.filter((w) => w.projectId === seedProject.id)
      workItems.push(...clone(seedItems))
      const seedSprints = mockProjectsDataset.sprints.filter((s) => s.projectId === seedProject.id)
      sprints.push(...clone(seedSprints))
      const seedMilestones = mockProjectsDataset.milestones.filter((m) => m.projectId === seedProject.id)
      milestones.push(...clone(seedMilestones))
      const seedDocs = mockProjectsDataset.docs.filter((d) => d.projectId === seedProject.id)
      docs.push(...clone(seedDocs))
    }
  }

  if (hasMissing) {
    const merged: ProjectsDataset = {
      projects,
      workItems,
      sprints,
      milestones,
      docs,
    }
    writeStorage(merged)
    return merged
  }

  return persisted
}

// ── Utilidades Fase 9 (Suite Metodológica Pro) ──
const DAY_MS = 86_400_000
const SPRINT_CAPACITY_POINTS = 10

function toISODate(time: number): string {
  return new Date(time).toISOString().slice(0, 10)
}

function todayISODate(): string {
  return toISODate(Date.now())
}

function parseDateOnly(value: string | undefined): number | null {
  if (!value) return null
  const time = new Date(value.length <= 10 ? `${value}T00:00:00` : value).getTime()
  return Number.isNaN(time) ? null : time
}

/** Puntos computables: storyPoints → talla → duración. Base de burndown y carga. */
function resolvePoints(item: WorkItem): number {
  if (typeof item.storyPoints === 'number') return Math.max(0, item.storyPoints)
  if (item.tShirtSize) return TSHIRT_POINTS[item.tShirtSize]
  if (typeof item.durationDays === 'number') return Math.max(0, Math.round(item.durationDays))
  return 0
}

function round2(value: number): number {
  return Math.round(value * 100) / 100
}

// ── Estado del módulo ──
let state: ProjectsDataset = loadInitialState()
const listeners = new Set<Listener>()

function setState(next: ProjectsDataset): void {
  state = next
  writeStorage(next)
  listeners.forEach((listener) => listener())
}

// ─────────────────────────────────────────────────────────────────────────
// API pública del store
// ─────────────────────────────────────────────────────────────────────────
export const projectsService = {
  // ── Suscripción (React: useSyncExternalStore) ──
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  getSnapshot(): ProjectsDataset {
    return state
  },

  getServerSnapshot(): ProjectsDataset {
    return state
  },

  // ── Lecturas ──
  listProjects(): Project[] {
    return state.projects
  },

  getProject(projectId: string): Project | undefined {
    return state.projects.find((project) => project.id === projectId)
  },

  getWorkItems(projectId?: string): WorkItem[] {
    return projectId
      ? state.workItems.filter((item) => item.projectId === projectId)
      : state.workItems
  },

  // ── Mutaciones ──
  createProject(input: NewProjectInput): Project {
    const project: Project = {
      id: nextSequentialId(
        'proj-',
        state.projects.map((item) => item.id),
      ),
      code: input.code.trim().toUpperCase(),
      name: input.name.trim(),
      client: input.client.trim(),
      description: input.description.trim(),
      category: input.category,
      methodology: input.methodology,
      status: 'planificacion',
      health: 'optimo',
      budget: {
        currency: input.currency,
        allocated: Math.max(0, input.budgetAllocated),
        spent: 0,
      },
      startDate: input.startDate,
      targetDate: input.targetDate,
      progress: 0,
      manager: input.manager.trim(),
      membersCount: Math.max(1, Math.round(input.membersCount)),
    }

    setState({ ...state, projects: [project, ...state.projects] })
    return project
  },

  updateProject(projectId: string, patch: Partial<Project>): void {
    setState({
      ...state,
      projects: state.projects.map((project) =>
        project.id === projectId ? { ...project, ...patch, id: project.id } : project,
      ),
    })
  },

  archiveProject(projectId: string): void {
    setState({
      ...state,
      projects: state.projects.map((project) =>
        project.id === projectId ? { ...project, status: 'completado' } : project,
      ),
    })
  },

  deleteProject(projectId: string): void {
    setState({
      ...state,
      projects: state.projects.filter((project) => project.id !== projectId),
      workItems: state.workItems.filter((item) => item.projectId !== projectId),
      sprints: state.sprints.filter((sprint) => sprint.projectId !== projectId),
      milestones: state.milestones.filter((milestone) => milestone.projectId !== projectId),
      docs: state.docs.filter((doc) => doc.projectId !== projectId),
    })
  },

  createWorkItem(input: Omit<WorkItem, 'id'>): WorkItem {
    const workItem: WorkItem = {
      ...input,
      id: nextSequentialId(
        'TSK-',
        state.workItems.map((item) => item.id),
      ),
    }
    setState({ ...state, workItems: [...state.workItems, workItem] })
    return workItem
  },

  updateWorkItem(workItemId: string, patch: Partial<WorkItem>): void {
    setState({
      ...state,
      workItems: state.workItems.map((item) =>
        item.id === workItemId ? { ...item, ...patch, id: item.id } : item,
      ),
    })
  },

  deleteWorkItem(workItemId: string): void {
    setState({
      ...state,
      workItems: state.workItems.filter((item) => item.id !== workItemId),
    })
  },

  updateMilestone(milestoneId: string, patch: Partial<Milestone>): void {
    setState({
      ...state,
      milestones: state.milestones.map((milestone) =>
        milestone.id === milestoneId ? { ...milestone, ...patch, id: milestone.id } : milestone,
      ),
    })
  },

  createDoc(input: Omit<ProjectDoc, 'id' | 'lastEdited'>): ProjectDoc {
    const doc: ProjectDoc = {
      ...input,
      id: nextSequentialId(
        'DOC-',
        state.docs.map((item) => item.id),
      ),
      lastEdited: new Date().toISOString(),
    }
    setState({ ...state, docs: [doc, ...state.docs] })
    return doc
  },

  updateDoc(docId: string, patch: Partial<ProjectDoc>): void {
    setState({
      ...state,
      docs: state.docs.map((doc) =>
        doc.id === docId
          ? { ...doc, ...patch, id: doc.id, lastEdited: new Date().toISOString() }
          : doc,
      ),
    })
  },

  // ── KPIs de Cartera (Task 3.1) ──
  getPortfolioKpis(): PortfolioKpis {
    const { projects, workItems, sprints } = state
    const totalProjects = projects.length
    const activeProjects = projects.filter((project) => project.status === 'en_curso').length
    const completedProjects = projects.filter((project) => project.status === 'completado').length
    const atRiskProjects = projects.filter((project) => project.health !== 'optimo').length

    const healthSum = projects.reduce(
      (sum, project) => sum + HEALTH_SCORE[project.health],
      0,
    )
    const avgHealthScore = totalProjects > 0 ? Math.round(healthSum / totalProjects) : 0

    const budgetAllocated = projects.reduce(
      (sum, project) => sum + project.budget.allocated,
      0,
    )
    const budgetSpent = projects.reduce((sum, project) => sum + project.budget.spent, 0)
    const budgetExecutionPct =
      budgetAllocated > 0 ? Math.round((budgetSpent / budgetAllocated) * 100) : 0

    const velocitySprints = sprints.filter((sprint) => sprint.status === 'cerrado')
    const velocityPool = velocitySprints.length
      ? velocitySprints
      : sprints.filter((sprint) => sprint.status === 'activo')
    const sprintVelocity =
      velocityPool.length > 0
        ? Math.round(
            (velocityPool.reduce((sum, sprint) => sum + sprint.completedPoints, 0) /
              velocityPool.length) *
              10,
          ) / 10
        : 0

    const doneTasks = workItems.filter((item) => item.state === 'done').length
    const tasksAtRisk = workItems.filter(
      (item) =>
        item.state !== 'done' &&
        (item.priority === 'URGENTE' || item.priority === 'ALTA' || Boolean(item.isCriticalPath)),
    ).length

    const progressSum = projects.reduce((sum, project) => sum + project.progress, 0)
    const globalProgress = totalProjects > 0 ? Math.round(progressSum / totalProjects) : 0

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      atRiskProjects,
      avgHealthScore,
      budgetAllocated,
      budgetSpent,
      budgetExecutionPct,
      sprintVelocity,
      tasksAtRisk,
      totalTasks: workItems.length,
      doneTasks,
      globalProgress,
    }
  },

  getMethodologyDistribution(): MethodologyDistribution[] {
    const counts = new Map<ProjectMethodology, number>()
    for (const project of state.projects) {
      counts.set(project.methodology, (counts.get(project.methodology) ?? 0) + 1)
    }
    return (Object.keys(PROJECT_METHODOLOGY_META) as ProjectMethodology[]).map(
      (methodology) => ({
        methodology,
        label: PROJECT_METHODOLOGY_META[methodology].short,
        count: counts.get(methodology) ?? 0,
        color: PROJECT_METHODOLOGY_META[methodology].color,
      }),
    )
  },

  getBudgetByProject(): BudgetByProject[] {
    return state.projects.map((project) => ({
      projectId: project.id,
      code: project.code,
      name: project.name,
      allocated: project.budget.allocated,
      spent: project.budget.spent,
      currency: project.budget.currency,
    }))
  },

  // ── Suite Metodológica Pro (Fase 9) ──

  getSprintBurndown(sprintId: string): BurndownSnapshot[] {
    const sprint = state.sprints.find((item) => item.id === sprintId)
    if (!sprint) return []
    const start = parseDateOnly(sprint.startDate) ?? Date.now()
    const endRaw = parseDateOnly(sprint.endDate)
    const end = endRaw !== null && endRaw >= start ? endRaw : start + 13 * DAY_MS
    const days = Math.min(42, Math.max(1, Math.round((end - start) / DAY_MS) + 1))
    const scope = state.workItems.filter((item) => item.sprintId === sprintId)
    const total = scope.reduce((sum, item) => sum + resolvePoints(item), 0)
    const todayStart = parseDateOnly(todayISODate()) ?? Date.now()

    const snapshots: BurndownSnapshot[] = []
    for (let i = 0; i < days; i++) {
      const dayStart = start + i * DAY_MS
      const ideal = days === 1 ? 0 : round2(total * (1 - i / (days - 1)))
      let actual: number | null = null
      if (dayStart <= todayStart) {
        const dayEnd = dayStart + DAY_MS - 1
        const donePoints = scope.reduce((sum, item) => {
          const closedAt = item.completedAt ? new Date(item.completedAt).getTime() : NaN
          if (item.state === 'done' && !Number.isNaN(closedAt) && closedAt <= dayEnd) {
            return sum + resolvePoints(item)
          }
          return sum
        }, 0)
        actual = round2(total - donePoints)
      }
      snapshots.push({
        date: toISODate(dayStart),
        label: new Date(dayStart).toLocaleDateString('es-PE', { day: '2-digit', month: 'short' }),
        ideal,
        actual,
      })
    }
    return snapshots
  },

  getProjectEVM(projectId: string): EarnedValueMetrics {
    const fallback: EarnedValueMetrics = {
      budgetAtCompletion: 0,
      plannedValue: 0,
      earnedValue: 0,
      actualCost: 0,
      cpi: 1,
      spi: 1,
      estimateAtCompletion: 0,
      varianceAtCompletion: 0,
      progressPct: 0,
      plannedPct: 0,
      scheduleStatus: 'en_tiempo',
      costStatus: 'en_presupuesto',
    }
    const project = state.projects.find((item) => item.id === projectId)
    if (!project) return fallback

    const bac = Math.max(0, project.budget.allocated)
    const progressPct = Math.min(100, Math.max(0, project.progress))
    const start = parseDateOnly(project.startDate)
    const target = parseDateOnly(project.targetDate)
    let plannedPct = 0
    if (start !== null && target !== null && target > start) {
      plannedPct = Math.min(100, Math.max(0, ((Date.now() - start) / (target - start)) * 100))
    } else if (start !== null && Date.now() >= start) {
      plannedPct = 100
    }

    const ev = (bac * progressPct) / 100
    const pv = (bac * plannedPct) / 100
    const ac = Math.max(0, project.budget.spent)
    const cpi = ac > 0 ? ev / ac : 1
    const spi = pv > 0 ? ev / pv : 1
    const eac = cpi > 0 ? ac + (bac - ev) / cpi : bac

    const scheduleStatus: ScheduleStatus =
      spi >= 1.03 ? 'adelantado' : spi <= 0.97 ? 'atrasado' : 'en_tiempo'
    const costStatus: CostStatus =
      cpi >= 1.03 ? 'bajo_costo' : cpi <= 0.97 ? 'sobrecosto' : 'en_presupuesto'

    return {
      budgetAtCompletion: Math.round(bac),
      plannedValue: Math.round(pv),
      earnedValue: Math.round(ev),
      actualCost: Math.round(ac),
      cpi: round2(cpi),
      spi: round2(spi),
      estimateAtCompletion: Math.round(eac),
      varianceAtCompletion: Math.round(bac - eac),
      progressPct: Math.round(progressPct),
      plannedPct: Math.round(plannedPct),
      scheduleStatus,
      costStatus,
    }
  },

  getTeamWorkload(projectId: string): TeamMemberWorkload[] {
    const active = state.workItems.filter(
      (item) => item.projectId === projectId && item.state !== 'done',
    )
    const byMember = new Map<string, { role: string; items: WorkItem[] }>()
    for (const item of active) {
      const name = item.assignee.name.trim() || 'Sin asignar'
      const entry = byMember.get(name) ?? { role: item.assignee.role, items: [] }
      entry.items.push(item)
      byMember.set(name, entry)
    }
    const result: TeamMemberWorkload[] = []
    for (const [memberName, entry] of byMember) {
      const totalPoints = entry.items.reduce((sum, item) => sum + resolvePoints(item), 0)
      const blockedTasks = entry.items.filter((item) => item.isBlocked).length
      const loadPct = Math.round((totalPoints / SPRINT_CAPACITY_POINTS) * 100)
      const riskLevel: WorkloadRisk =
        loadPct >= 100 || blockedTasks >= 2
          ? 'sobrecarga'
          : loadPct >= 70
            ? 'alerta'
            : 'saludable'
      result.push({
        memberName,
        role: entry.role,
        activeTasks: entry.items.length,
        blockedTasks,
        totalPoints,
        capacityPoints: SPRINT_CAPACITY_POINTS,
        loadPct,
        riskLevel,
      })
    }
    return result.sort((a, b) => b.loadPct - a.loadPct)
  },

  startSprint(sprintId: string): void {
    const sprint: Sprint | undefined = state.sprints.find((item) => item.id === sprintId)
    if (!sprint || sprint.status === 'cerrado') return
    const today = todayISODate()
    setState({
      ...state,
      sprints: state.sprints.map((item) =>
        item.id === sprintId
          ? {
              ...item,
              status: 'activo',
              startDate: item.startDate || today,
              completedPoints: item.completedPoints,
            }
          : item,
      ),
      projects: state.projects.map((project) =>
        project.id === sprint.projectId ? { ...project, activeSprint: sprintId } : project,
      ),
    })
  },

  closeSprint(sprintId: string, targetSprintId?: string): void {
    const sprint: Sprint | undefined = state.sprints.find((item) => item.id === sprintId)
    if (!sprint || sprint.status === 'cerrado') return
    const donePoints = state.workItems
      .filter((item) => item.sprintId === sprintId && item.state === 'done')
      .reduce((sum, item) => sum + resolvePoints(item), 0)
    setState({
      ...state,
      sprints: state.sprints.map((item) =>
        item.id === sprintId
          ? { ...item, status: 'cerrado', endDate: todayISODate(), completedPoints: donePoints }
          : item,
      ),
      workItems: state.workItems.map((item) => {
        if (item.sprintId !== sprintId || item.state === 'done') return item
        if (targetSprintId) return { ...item, sprintId: targetSprintId, state: 'todo' as const }
        const { sprintId: _dropped, ...rest } = item
        void _dropped
        return rest
      }),
      projects: state.projects.map((project) =>
        project.id === sprint.projectId && project.activeSprint === sprintId
          ? { ...project, activeSprint: undefined }
          : project,
      ),
    })
  },

  toggleBlockWorkItem(workItemId: string, reason?: string): WorkItem | undefined {
    const current = state.workItems.find((item) => item.id === workItemId)
    if (!current) return undefined
    const blocking = !current.isBlocked
    const updated: WorkItem = {
      ...current,
      isBlocked: blocking,
      blockerReason: blocking
        ? reason?.trim() || current.blockerReason || 'Bloqueo reportado por el equipo.'
        : current.blockerReason,
    }
    setState({
      ...state,
      workItems: state.workItems.map((item) => (item.id === workItemId ? updated : item)),
    })
    return updated
  },

  // ── Utilidades de demo ──
  resetDemoData(): void {
    setState(clone(mockProjectsDataset))
  },
}

export default projectsService
