// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TasksInboxPage from '@/pages/tasks/TasksInboxPage'
import type { Project, WorkItem } from '@/types/project.types'

vi.mock('@/hooks/useProjects', () => ({
  useTenantFilteredProjects: vi.fn(),
  useProjectsDataset: vi.fn(),
}))

vi.mock('@/context/TenantContext', () => ({
  useTenant: () => ({ scopedTenant: null }),
}))

vi.mock('@/context/ProjectPerspectiveContext', () => ({
  useProjectPerspective: () => ({
    perspective: 'gestor',
    currentPersona: { name: 'Ana Gestora', title: 'Gestora Territorial' },
    isGestor: true,
    isSuperAdmin: false,
    isCoordinador: false,
    isAdmin: false,
  }),
}))

import { useTenantFilteredProjects, useProjectsDataset } from '@/hooks/useProjects'

const projects: Project[] = [
  {
    id: 'proj-t1',
    code: 'PRJ-T1',
    name: 'Proyecto Test',
    client: 'Entidad Test',
    description: 'Proyecto de prueba',
    category: 'operaciones',
    methodology: 'kanban',
    status: 'en_curso',
    health: 'optimo',
    budget: { currency: 'PEN', allocated: 10000, spent: 1000 },
    startDate: '2026-01-01',
    targetDate: '2026-12-31',
    progress: 40,
    manager: 'Ana Gestora',
    membersCount: 2,
  },
]

const base: Omit<WorkItem, 'id' | 'title' | 'state' | 'priority'> = {
  projectId: 'proj-t1',
  assignee: { name: 'Ana Gestora', role: 'Gestora' },
}

const workItems: WorkItem[] = [
  { ...base, id: 'TSK-A', title: 'Verificar pecosa zona norte', state: 'todo', priority: 'MEDIA' },
  { ...base, id: 'TSK-B', title: 'Entrega urgente de actas', state: 'in_progress', priority: 'URGENTE', endDate: '2020-01-05' },
  { ...base, id: 'TSK-C', title: 'Cierre de informe', state: 'done', priority: 'BAJA', completedAt: '2026-09-01T10:00:00' },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <TasksInboxPage />
    </MemoryRouter>,
  )
}

describe('TasksInboxPage', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.mocked(useTenantFilteredProjects).mockReturnValue(projects)
    vi.mocked(useProjectsDataset).mockReturnValue({
      projects,
      workItems,
      sprints: [],
      milestones: [],
      docs: [],
    })
  })

  it('renderiza cabecera de gestora, mini-KPIs y grupos por estado', () => {
    renderPage()
    expect(screen.getByText('Mi Bandeja')).toBeDefined()
    for (const kpi of ['Total tareas', 'Atrasadas', 'En curso', 'Completadas']) {
      expect(screen.getByText(kpi)).toBeDefined()
    }
    expect(screen.getByText('No iniciadas')).toBeDefined()
    expect(screen.getByText('En progreso')).toBeDefined()
    expect(screen.getByText('Verificar pecosa zona norte')).toBeDefined()
    expect(screen.getByText('Entrega urgente de actas')).toBeDefined()
    // Semáforo de vencimiento (KPI + badge de fila)
    expect(screen.getAllByText(/Atrasada/).length).toBeGreaterThanOrEqual(2)
  })

  it('el buscador filtra las filas visibles', () => {
    renderPage()
    const search = screen.getByPlaceholderText(/Buscar por tarea/)
    fireEvent.change(search, { target: { value: 'pecosa' } })
    expect(screen.getByText('Verificar pecosa zona norte')).toBeDefined()
    expect(screen.queryByText('Entrega urgente de actas')).toBeNull()
  })

  it('colapsar un grupo oculta sus tareas', () => {
    renderPage()
    fireEvent.click(screen.getByText('No iniciadas'))
    expect(screen.queryByText('Verificar pecosa zona norte')).toBeNull()
    fireEvent.click(screen.getByText('No iniciadas'))
    expect(screen.getByText('Verificar pecosa zona norte')).toBeDefined()
  })

  it('clic en una fila abre el slide-over de la tarea', () => {
    renderPage()
    fireEvent.click(screen.getByText('Entrega urgente de actas'))
    expect(screen.getByDisplayValue('Entrega urgente de actas')).toBeDefined()
  })
})
