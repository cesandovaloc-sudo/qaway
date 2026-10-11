import { useMemo, useSyncExternalStore } from 'react'
import { projectsService } from '@/services/projectsService'
import { useTenant } from '@/context/TenantContext'
import type {
  BudgetByProject,
  BurndownSnapshot,
  EarnedValueMetrics,
  MethodologyDistribution,
  PortfolioKpis,
  Project,
  ProjectKanbanSettings,
  ProjectsDataset,
  Sprint,
  TeamMemberWorkload,
  WorkItem,
} from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// useProjects.ts — Puente React ↔ store reactivo de proyectos
//
// Usa `useSyncExternalStore` para que cualquier mutación del servicio
// (`createProject`, `updateWorkItem`, …) re-renderice de forma inmediata y
// consistente, respetando la regla de rendimiento del spec (< 50ms).
// ─────────────────────────────────────────────────────────────────────────

// Referencias estables: evitan resuscribir en cada render.
const subscribe = projectsService.subscribe
const getSnapshot = projectsService.getSnapshot
const getServerSnapshot = projectsService.getServerSnapshot

export function useProjectsDataset(): ProjectsDataset {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}

export function useProjects(): Project[] {
  return useProjectsDataset().projects
}

// ── Alcance por entidad (Fase 17): filtra proyectos por cliente ──

function normalizeClient(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

/** Proyectos de la entidad elegida en el Header; todos si no hay selección. */
export function useTenantFilteredProjects(): Project[] {
  const projects = useProjects()
  const { scopedTenant } = useTenant()
  return useMemo(() => {
    const match = scopedTenant?.projectClientMatch?.trim()
    if (!match) return projects
    const needle = normalizeClient(match)
    return projects.filter((project) => normalizeClient(project.client).includes(needle))
  }, [projects, scopedTenant])
}

export function useProject(projectId: string | undefined): Project | undefined {
  const projects = useProjects()
  return useMemo(
    () => (projectId ? projects.find((project) => project.id === projectId) : undefined),
    [projects, projectId],
  )
}

export function useProjectWorkItems(projectId: string | undefined): WorkItem[] {
  const workItems = useProjectsDataset().workItems
  return useMemo(
    () => (projectId ? workItems.filter((item) => item.projectId === projectId) : workItems),
    [workItems, projectId],
  )
}

export function usePortfolioKpis(): PortfolioKpis {
  const dataset = useProjectsDataset()
  return useMemo(() => projectsService.getPortfolioKpis(), [dataset])
}

export function useMethodologyDistribution(): MethodologyDistribution[] {
  const dataset = useProjectsDataset()
  return useMemo(() => projectsService.getMethodologyDistribution(), [dataset])
}

export function useBudgetByProject(): BudgetByProject[] {
  const dataset = useProjectsDataset()
  return useMemo(() => projectsService.getBudgetByProject(), [dataset])
}

// ── Suite Metodológica Pro (Fase 9) ──

export function useProjectSprints(projectId: string | undefined): Sprint[] {
  const sprints = useProjectsDataset().sprints
  return useMemo(
    () => (projectId ? sprints.filter((sprint) => sprint.projectId === projectId) : sprints),
    [sprints, projectId],
  )
}

export function useSprintBurndown(sprintId: string | undefined): BurndownSnapshot[] {
  const dataset = useProjectsDataset()
  return useMemo(
    () => (sprintId ? projectsService.getSprintBurndown(sprintId) : []),
    [dataset, sprintId],
  )
}

export function useProjectEVM(projectId: string | undefined): EarnedValueMetrics | null {
  const dataset = useProjectsDataset()
  return useMemo(
    () => (projectId ? projectsService.getProjectEVM(projectId) : null),
    [dataset, projectId],
  )
}

export function useTeamWorkload(projectId: string | undefined): TeamMemberWorkload[] {
  const dataset = useProjectsDataset()
  return useMemo(
    () => (projectId ? projectsService.getTeamWorkload(projectId) : []),
    [dataset, projectId],
  )
}

// ── Ajustes Kanban por proyecto (Fase 1 STATIK) ──

const NO_PROJECT_ID = '__no_project__'

export function useProjectKanbanSettings(projectId: string | undefined): ProjectKanbanSettings {
  const dataset = useProjectsDataset()
  return useMemo(
    () => projectsService.getProjectKanbanSettings(projectId ?? NO_PROJECT_ID),
    [dataset, projectId],
  )
}

/** Acciones del store (mutaciones). Referencia estable, segura para handlers. */
export function useProjectActions() {
  return projectsService
}
