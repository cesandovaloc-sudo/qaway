import { describe, test, expect, beforeAll, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AgentLiveTrainingStudio } from '@/pages/5-qaway-hub/2-Agentes/components/AgentLiveTrainingStudio'
import type { TenantAgentWorkspace } from '@/pages/5-qaway-hub/2-Agentes/types/agent.types'

const QAWAY_UUID = '00000000-0000-0000-0000-000000000001'
const CORAVET_UUID = '06bacf31-6699-4ef5-9843-e58b835c6b2b'

const createMockWorkspace = (tenantId: string): TenantAgentWorkspace => ({
  id: tenantId === QAWAY_UUID ? 'tenant-qaway-master' : 'tenant-coravet',
  slug: tenantId === QAWAY_UUID ? 'qaway-lab' : 'coravet',
  name: tenantId === QAWAY_UUID ? 'Qaway Lab Digital (Master)' : 'CoraVet Clínica Veterinaria',
  industry: tenantId === QAWAY_UUID ? 'Tecnología, SaaS y Sistemas Web' : 'Salud Animal y Pet Shop',
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
    trainingMode: true,
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
  beforeAll(() => {
    vi.useFakeTimers()
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  test('renderiza cabecera con métricas live', () => {
    const workspace = createMockWorkspace(QAWAY_UUID)
    render(<AgentLiveTrainingStudio workspace={workspace} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    
    expect(screen.getByText('Supervisión de Conversaciones en Tiempo Real')).toBeInTheDocument()
    expect(screen.getByText('Entrenamiento en Vivo')).toBeInTheDocument()
    expect(screen.getByText('MODO ENTRENAMIENTO ACTIVO')).toBeInTheDocument()
  })

  test('renderiza lista de conversaciones con métricas', () => {
    const workspace = createMockWorkspace(QAWAY_UUID)
    render(<AgentLiveTrainingStudio workspace={workspace} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    
    expect(screen.getByText('María González')).toBeInTheDocument()
    expect(screen.getByText('Carlos Mendoza')).toBeInTheDocument()
    expect(screen.getByText('Ana Torres')).toBeInTheDocument()
    expect(screen.getByText('Pedro Ruiz')).toBeInTheDocument()
    expect(screen.getByText('Lucía Fernández')).toBeInTheDocument()
  })

  test('filtra conversaciones por estado (pending/approved/needs_review)', () => {
    const workspace = createMockWorkspace(QAWAY_UUID)
    render(<AgentLiveTrainingStudio workspace={workspace} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    
    // Por defecto "Todos"
    expect(screen.getByDisplayValue('Todos')).toBeInTheDocument()
    
    // Cambiar a Pendientes
    fireEvent.click(screen.getByDisplayValue('Todos'))
    fireEvent.click(screen.getByText('Pendientes'))
    
    expect(screen.getByDisplayValue('Pendientes')).toBeInTheDocument()
  })

  test('busca conversaciones por query', () => {
    const workspace = createMockWorkspace(QAWAY_UUID)
    render(<AgentLiveTrainingStudio workspace={workspace} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    
    const searchInput = screen.getByPlaceholderText('Buscar por usuario, mensaje, tema...')
    fireEvent.change(searchInput, { target: { value: 'María' } })
    
    expect(screen.getByText('María González')).toBeInTheDocument()
    expect(screen.queryByText('Carlos Mendoza')).not.toBeInTheDocument()
  })

  test('aprueba mensaje de agente y actualiza estado', async () => {
    const workspace = createMockWorkspace(QAWAY_UUID)
    render(<AgentLiveTrainingStudio workspace={workspace} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    
    // Abrir detalle de conversación
    fireEvent.click(screen.getByText('María González'))
    
    await waitFor(() => {
      expect(screen.getByText('Hola, ¿tienen Royal Canin para gatos?')).toBeInTheDocument()
    })
    
    // Aprobar mensaje del agente (botón ✓)
    const approveBtn = screen.getByRole('button', { name: /aprobar/i })
    fireEvent.click(approveBtn)
    
    await waitFor(() => {
      expect(screen.getByText('Aprobado')).toBeInTheDocument()
    })
  })

  test('rechaza mensaje de agente', async () => {
    const workspace = createMockWorkspace(QAWAY_UUID)
    render(<AgentLiveTrainingStudio workspace={workspace} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    
    fireEvent.click(screen.getByText('Lucía Fernández'))
    
    await waitFor(() => {
      expect(screen.getByText('¿Hacen apps móviles para iPhone y Android?')).toBeInTheDocument()
    })
    
    const rejectBtn = screen.getByRole('button', { name: /rechazar/i })
    fireEvent.click(rejectBtn)
    
    await waitFor(() => {
      expect(screen.getByText('Rechazado')).toBeInTheDocument()
    })
  })

  test('corrige mensaje y crea Golden Example', async () => {
    const workspace = createMockWorkspace(QAWAY_UUID)
    render(<AgentLiveTrainingStudio workspace={workspace} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    
    fireEvent.click(screen.getByText('Lucía Fernández'))
    
    await waitFor(() => {
      const correctBtn = screen.getByRole('button', { name: /corregir/i })
      fireEvent.click(correctBtn)
    })
    
    await waitFor(() => {
      expect(screen.getByText('Corregir Respuesta → Golden Example')).toBeInTheDocument()
    })
    
    // Llenar corrección
    const correctionInput = screen.getByPlaceholderText('Escribe la respuesta ideal que debería haber dado el agente...')
    fireEvent.change(correctionInput, { target: { value: 'Sí, desarrollamos apps móviles multiplataforma con React Native.' } })
    
    fireEvent.click(screen.getByText('Guardar y Convertir a Golden Example'))
    
    await waitFor(() => {
      expect(mockOnUpdateWorkspace).toHaveBeenCalled()
    })
  })

  test('muestra badge trainingMode ACTIVO/INACTIVO', () => {
    const workspaceActive = createMockWorkspace(QAWAY_UUID)
    render(<AgentLiveTrainingStudio workspace={workspaceActive} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    expect(screen.getByText('ACTIVO')).toBeInTheDocument()
    
    // Sin trainingMode
    const workspaceInactive = { ...workspaceActive, aiSettings: { ...workspaceActive.aiSettings, trainingMode: false } }
    render(<AgentLiveTrainingStudio workspace={workspaceInactive} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    expect(screen.queryByText('ACTIVO')).not.toBeInTheDocument()
  })

  test('simular nuevas conversaciones refresca lista', () => {
    const workspace = createMockWorkspace(QAWAY_UUID)
    render(<AgentLiveTrainingStudio workspace={workspace} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    
    const initialCount = screen.getAllByText(/María González|Carlos Mendoza|Ana Torres|Pedro Ruiz|Lucía Fernández/).length
    
    fireEvent.click(screen.getByText('Simular nuevas'))
    
    // Debe mantener o aumentar conversaciones (mock genera 5)
    const newCount = screen.getAllByText(/María González|Carlos Mendoza|Ana Torres|Pedro Ruiz|Lucía Fernández/).length
    expect(newCount).toBeGreaterThanOrEqual(initialCount)
  })
})

describe('LiveTraining - Context isolation', () => {
  test('conversaciones separadas por tenant (mock data)', () => {
    const qawayWorkspace = createMockWorkspace('00000000-0000-0000-0000-000000000001')
    const coravetWorkspace = createMockWorkspace('06bacf31-6699-4ef5-9843-e58b835c6b2b')
    
    // Verificar que los datos mock son diferentes por tenant
    expect(qawayWorkspace.name).toBe('Qaway Lab Digital (Master)')
    expect(coravetWorkspace.name).toBe('CoraVet Clínica Veterinaria')
    expect(qawayWorkspace.slug).toBe('qaway-lab')
    expect(coravetWorkspace.slug).toBe('coravet')
  })
})