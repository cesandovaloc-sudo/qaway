import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, within, cleanup } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import DashboardPage from '@/pages/DashboardPage'
import { AuthProvider } from '@/context/AuthContext'
import { TenantProvider } from '@/context/TenantContext'
import type { Milestone, Project, WorkItem } from '@/types/project.types'

vi.mock('@/hooks/useProjects', () => ({
  useTenantFilteredProjects: vi.fn(),
  useProjectsDataset: vi.fn(),
}))

import { useTenantFilteredProjects, useProjectsDataset } from '@/hooks/useProjects'

const YEAR = new Date().getFullYear()

const projects: Project[] = [
  {
    id: 'proj-a',
    code: 'PRJ-A',
    name: 'MINEDU Dotación 2027',
    client: 'MINEDU - DIGERE',
    description: 'Dotación nacional',
    category: 'operaciones',
    methodology: 'hibrido',
    status: 'en_curso',
    health: 'atencion',
    budget: { currency: 'PEN', allocated: 620000, spent: 420000 },
    startDate: `${YEAR}-01-15`,
    targetDate: `${YEAR}-12-20`,
    progress: 58,
    manager: 'Coordinador General',
    membersCount: 6,
    orgId: 'org-minedu',
  },
  {
    id: 'proj-b',
    code: 'PRJ-B',
    name: 'Plataforma Qaway Lab',
    client: 'Qaway Lab',
    description: 'SaaS interno',
    category: 'software',
    methodology: 'scrum',
    status: 'en_curso',
    health: 'optimo',
    budget: { currency: 'PEN', allocated: 200000, spent: 90000 },
    startDate: `${YEAR}-03-01`,
    targetDate: `${YEAR}-09-30`,
    progress: 72,
    manager: 'Andrea Salazar',
    membersCount: 4,
    orgId: 'org-qaway',
  },
]

const milestones: Milestone[] = [
  { id: 'm1', projectId: 'proj-a', phaseNumber: 1, name: 'Aprobación del plan de trabajo', targetDate: `${YEAR}-06-10`, status: 'aprobado', deliverableSummary: '', signOffRequired: true },
  { id: 'm2', projectId: 'proj-a', phaseNumber: 2, name: 'Validación UGEL', targetDate: `${YEAR}-10-20`, status: 'pendiente', deliverableSummary: '', signOffRequired: true },
  { id: 'm3', projectId: 'proj-b', phaseNumber: 1, name: 'Release interno', targetDate: `${YEAR}-11-05`, status: 'pendiente', deliverableSummary: '', signOffRequired: false },
]

const workItems: WorkItem[] = [
  {
    id: 'TSK-1',
    projectId: 'proj-a',
    title: 'Verificar PECOSA en campo',
    state: 'in_progress',
    priority: 'ALTA',
    assignee: { name: 'María Gómez', role: 'Gestora' },
  },
  {
    id: 'TSK-2',
    projectId: 'proj-b',
    title: 'Deploy a producción',
    state: 'done',
    priority: 'MEDIA',
    assignee: { name: 'Luis Pérez', role: 'Dev' },
    completedAt: `${YEAR}-09-01T10:00:00`,
  },
]

function renderPage() {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TenantProvider>
          <DashboardPage />
        </TenantProvider>
      </AuthProvider>
    </MemoryRouter>,
  )
}

describe('DashboardPage — Resumen ejecutivo de cartera', () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.mocked(useTenantFilteredProjects).mockReturnValue(projects)
    vi.mocked(useProjectsDataset).mockReturnValue({
      projects,
      workItems,
      sprints: [],
      milestones,
      docs: [],
    })
  })

  it('renderiza cabecera, vistas, roadmap con Hoy y los 4 KPIs', () => {
    renderPage()
    expect(screen.getByText('Cartera de Proyectos')).toBeDefined()
    for (const tab of ['Resumen', 'Cronograma', 'Hitos', 'Riesgos', 'Presupuesto']) {
      expect(screen.getAllByText(tab).length).toBeGreaterThanOrEqual(1)
    }
    expect(screen.getByText('Macro-Roadmap de cartera · ' + YEAR)).toBeDefined()
    expect(screen.getAllByText('Hoy').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByText('Proyectos activos')).toBeDefined()
    expect(screen.getByText('Avance promedio')).toBeDefined()
    expect(screen.getByText('Desviación de cronograma')).toBeDefined()
    expect(screen.getByText('Presupuesto ejecutado')).toBeDefined()
  })

  it('elimina las tortas de metodología y salud abstracta', () => {
    renderPage()
    expect(screen.queryByText('Proyectos por metodología')).toBeNull()
    expect(screen.queryByText('Salud de cartera')).toBeNull()
  })

  it('muestra la tabla con semáforo operativo y acordeón con Curva S', () => {
    renderPage()
    const table = within(screen.getByTestId('portfolio-table'))
    expect(table.getByText('MINEDU Dotación 2027')).toBeDefined()
    expect(screen.getAllByText('En riesgo').length).toBeGreaterThanOrEqual(2)
    expect(screen.getAllByText('En objetivo').length).toBeGreaterThanOrEqual(2)
    expect(table.getByText('Validación UGEL')).toBeDefined()

    fireEvent.click(table.getByText('MINEDU Dotación 2027'))
    expect(screen.getByText('Hitos principales')).toBeDefined()
    expect(screen.getByText('Avance del proyecto · Curva S')).toBeDefined()
    expect(screen.getByText('Presupuesto y equipo')).toBeDefined()
    expect(screen.getByText('Aprobación del plan de trabajo')).toBeDefined()
  })

  it('filtra por píldoras y muestra agenda lateral', () => {
    renderPage()
    fireEvent.click(screen.getAllByText('En objetivo')[0])
    const table = within(screen.getByTestId('portfolio-table'))
    // La tabla filtra; el roadmap conserva la visión completa de cartera
    expect(table.queryByText('MINEDU Dotación 2027')).toBeNull()
    expect(table.getByText('Plataforma Qaway Lab')).toBeDefined()

    fireEvent.click(screen.getByText('Todos'))
    expect(within(screen.getByTestId('portfolio-table')).getByText('MINEDU Dotación 2027')).toBeDefined()
    expect(screen.getByText('Proyectos en atención (1)')).toBeDefined()
    expect(screen.getByText('Actividad reciente')).toBeDefined()
  })
})
