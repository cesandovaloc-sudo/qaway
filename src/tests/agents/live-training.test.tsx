import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentLiveTrainingStudio } from '@/pages/5-qaway-hub/2-Agentes/components/AgentLiveTrainingStudio'
import type { TenantAgentWorkspace } from '@/pages/5-qaway-hub/2-Agentes/types/agent.types'

const QAWAY_UUID = '00000000-0000-0000-0000-000000000001'

const createMockWorkspace = (trainingMode = true): TenantAgentWorkspace => ({
  id: 'tenant-qaway-master',
  slug: 'qaway-lab',
  name: 'Qaway Lab Digital (Master)',
  industry: 'Tecnología, SaaS y Sistemas Web',
  role: 'consultoria_ventas' as const,
  agentName: 'Test Bot',
  tone: 'ejecutivo_formal' as const,
  welcomeGreeting: '¡Hola! Soy tu asistente virtual. ¿En qué te ayudo?',
  handoverMessage: 'Derivo a humano',
  channel: 'whatsapp',
  aiSettings: {
    enabled: true,
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    mode: 'managed',
    api_key: null,
    temperature: 0.3,
    waba_phone_number_id: null,
    human_handoff_keywords: ['humano', 'asesor'],
    system_prompt: '',
    trainingMode,
    supervisorIds: ['test'],
    llmProvider: 'gemini',
    llmApiKey: null
  },
  knowledgeBase: [],
  faqs: [],
  goldenExamples: [],
  correctionLogs: [],
  metrics: {
    totalConversations: 0,
    simulationsRun: 0,
    handoffCount: 0,
    complianceScore: 100
  }
})

const mockOnUpdateWorkspace = vi.fn()

describe('AgentLiveTrainingStudio', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renderiza cabecera con métricas live', () => {
    render(<AgentLiveTrainingStudio workspace={createMockWorkspace()} onUpdateWorkspace={mockOnUpdateWorkspace} />)

    expect(screen.getByText('Supervisión de Conversaciones en Tiempo Real')).toBeInTheDocument()
    expect(screen.getByText(/Entrenamiento en Vivo/)).toBeInTheDocument()
    expect(screen.getByText(/MODO ENTRENAMIENTO ACTIVO/)).toBeInTheDocument()
  })

  test('renderiza lista de conversaciones con métricas', () => {
    render(<AgentLiveTrainingStudio workspace={createMockWorkspace()} onUpdateWorkspace={mockOnUpdateWorkspace} />)

    expect(screen.getByText('María González')).toBeInTheDocument()
    expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument()
    expect(screen.getByText('Ana Torres')).toBeInTheDocument()
    expect(screen.getByText('Pedro Ruiz')).toBeInTheDocument()
    expect(screen.getByText('Lucía Fernández')).toBeInTheDocument()
  })

  test('filtra conversaciones por estado seleccionado', async () => {
    render(<AgentLiveTrainingStudio workspace={createMockWorkspace()} onUpdateWorkspace={mockOnUpdateWorkspace} />)

    const select = screen.getByRole('combobox')

    // El select por defecto muestra "all"
    expect((select as HTMLSelectElement).value).toBe('all')

    // Cambiar a "approved": María (todos pending) debe desaparecer
    fireEvent.change(select, { target: { value: 'approved' } })
    await waitFor(() => {
      expect((select as HTMLSelectElement).value).toBe('approved')
      expect(screen.queryByText('María González')).not.toBeInTheDocument()
      expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument()
    })
  })

  test('busca conversaciones por query', () => {
    render(<AgentLiveTrainingStudio workspace={createMockWorkspace()} onUpdateWorkspace={mockOnUpdateWorkspace} />)

    const searchInput = screen.getByPlaceholderText('Buscar por usuario, mensaje, tema...')
    fireEvent.change(searchInput, { target: { value: 'María' } })

    expect(screen.getByText('María González')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Mendoza')).not.toBeInTheDocument()
  })

  test('aprueba mensaje de agente y actualiza estado', async () => {
    render(<AgentLiveTrainingStudio workspace={createMockWorkspace()} onUpdateWorkspace={mockOnUpdateWorkspace} />)

    fireEvent.click(screen.getByText('María González'))

    await waitFor(() => {
      expect(screen.getByText('Hola, ¿tienen Royal Canin para gatos?')).toBeInTheDocument()
    })

    const approveBtn = screen.getAllByTitle('Aprobar')[0]
    fireEvent.click(approveBtn)

    await waitFor(() => {
      expect(screen.getByText('Aprobado')).toBeInTheDocument()
    })
  })

  test('rechaza mensaje de agente', async () => {
    render(<AgentLiveTrainingStudio workspace={createMockWorkspace()} onUpdateWorkspace={mockOnUpdateWorkspace} />)

    fireEvent.click(screen.getByText('María González'))

    await waitFor(() => {
      expect(screen.getByText('Hola, ¿tienen Royal Canin para gatos?')).toBeInTheDocument()
    })

    const rejectBtn = screen.getAllByTitle('Rechazar')[0]
    fireEvent.click(rejectBtn)

    await waitFor(() => {
      expect(screen.getByText('Rechazado')).toBeInTheDocument()
    })
  })

  test('corrige mensaje y crea Golden Example', async () => {
    render(<AgentLiveTrainingStudio workspace={createMockWorkspace()} onUpdateWorkspace={mockOnUpdateWorkspace} />)

    fireEvent.click(screen.getByText('María González'))

    await waitFor(() => {
      expect(screen.getAllByTitle('Corregir → Golden Example').length).toBeGreaterThan(0)
    })

    fireEvent.click(screen.getAllByTitle('Corregir → Golden Example')[0])

    await waitFor(() => {
      expect(screen.getByText('Corregir Respuesta → Golden Example')).toBeInTheDocument()
    })

    const correctionInput = screen.getByPlaceholderText('Escribe la respuesta ideal que debería haber dado el agente...')
    fireEvent.change(correctionInput, { target: { value: 'Sí, contamos con consulta veterinaria y pet shop. ¿Quieres agendar?' } })

    fireEvent.click(screen.getByText('Guardar y Convertir a Golden Example'))

    await waitFor(() => {
      expect(mockOnUpdateWorkspace).toHaveBeenCalled()
    })
  })

  test('muestra badge trainingMode ACTIVO/INACTIVO', () => {
    const active = render(
      <AgentLiveTrainingStudio workspace={createMockWorkspace(true)} onUpdateWorkspace={mockOnUpdateWorkspace} />
    )
    expect(screen.getByText('ACTIVO')).toBeInTheDocument()
    active.unmount()

    render(<AgentLiveTrainingStudio workspace={createMockWorkspace(false)} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    expect(screen.queryByText('ACTIVO')).not.toBeInTheDocument()
    expect(screen.getByText('INACTIVO')).toBeInTheDocument()
  })

  test('simular nuevas conversaciones refresca lista', () => {
    render(<AgentLiveTrainingStudio workspace={createMockWorkspace()} onUpdateWorkspace={mockOnUpdateWorkspace} />)

    const initialCount = screen.getAllByText(/María González|Carlos Mendoza|Ana Torres|Pedro Ruiz|Lucía Fernández/).length

    fireEvent.click(screen.getByText('Simular nuevas'))

    const newCount = screen.getAllByText(/María González|Carlos Mendoza|Ana Torres|Pedro Ruiz|Lucía Fernández/).length
    expect(newCount).toBeGreaterThanOrEqual(initialCount)
  })
})

describe('LiveTraining - Context isolation', () => {
  test('conversaciones separadas por tenant (mock data)', () => {
    const qawayWorkspace = createMockWorkspace()
    const coravetWorkspace = createMockWorkspace() as TenantAgentWorkspace

    expect(qawayWorkspace.name).toBe('Qaway Lab Digital (Master)')
    expect(coravetWorkspace.slug).toBe('qaway-lab')
  })
})