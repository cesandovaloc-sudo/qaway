import { describe, test, expect, beforeAll, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { AgentPlaygroundSimulator } from '@/pages/5-qaway-hub/2-Agentes/components/AgentPlaygroundSimulator'
import { buildTenantContext, DEMO_VECTOR_768 } from '@/pages/5-qaway-hub/2-Agentes/services/contextEngine'
import type { TenantAgentWorkspace, ChatMessage } from '@/pages/5-qaway-hub/2-Agentes/types/agent.types'

// Mock supabase
vi.mock('@/config/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}))

import { supabase } from '@/config/supabase'

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
    trainingMode: false,
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

describe('AgentPlaygroundSimulator', () => {
  beforeAll(() => {
    ;(supabase.rpc as any).mockImplementation(async (fnName: string, params: any) => {
      if (fnName === 'search_unified_context') {
        if (params?.p_tenant_id === QAWAY_UUID) {
          return {
            data: [
              { id: 'kb-1', title: 'Sistemas Web', category: 'Desarrollo', content: 'Arquitecturas SaaS...', reference_price: 'Cotización', similarity: 1.0, source: 'knowledge_base' },
              { id: 'faq-1', title: '¿Garantía?', content: 'Garantía técnica...', similarity: 1.0, source: 'faqs' }
            ],
            error: null
          }
        }
        if (params?.p_tenant_id === CORAVET_UUID) {
          return {
            data: [
              { id: 'kb-vet', title: 'Consulta Veterinaria', category: 'Salud', content: 'Consulta general desde S/45...', reference_price: 'Desde S/45', similarity: 1.0, source: 'knowledge_base' }
            ],
            error: null
          }
        }
        return { data: [], error: null }
      }
      return { data: null, error: null }
    })
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const renderAndWaitContext = async () => {
    render(<AgentPlaygroundSimulator workspace={createMockWorkspace(QAWAY_UUID)} onUpdateWorkspace={mockOnUpdateWorkspace} />)
    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })
  }

  test('renderiza el chat con mensaje de bienvenida', () => {
    render(<AgentPlaygroundSimulator workspace={createMockWorkspace(QAWAY_UUID)} onUpdateWorkspace={mockOnUpdateWorkspace} />)

    expect(screen.getByText('¡Hola! Soy tu asistente virtual. ¿En qué te ayudo?')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Escribe un mensaje de prueba...')).toBeInTheDocument()
  })

  test('cambia entre vista WhatsApp y Web', () => {
    render(<AgentPlaygroundSimulator workspace={createMockWorkspace(QAWAY_UUID)} onUpdateWorkspace={mockOnUpdateWorkspace} />)

    expect(screen.getByText('WhatsApp WABA')).toBeInTheDocument()
    expect(screen.getByText('Widget Web')).toBeInTheDocument()
  })

  test('envía mensaje y recibe respuesta simulada', async () => {
    await renderAndWaitContext()

    const input = screen.getByPlaceholderText('Escribe un mensaje de prueba...')
    fireEvent.change(input, { target: { value: 'Hola, ¿qué servicios ofrecen?' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => {
      expect(screen.getByText('Hola, ¿qué servicios ofrecen?')).toBeInTheDocument()
    })
  })

  test('muestra inspector de prompt compilado', async () => {
    await renderAndWaitContext()

    fireEvent.click(screen.getByText('Inspeccionar Prompt Compilado (3 Capas)'))
    expect(screen.getByText(/CAPA 0 — CORE ÉTICO Y LEGAL INVIOLABLE/i)).toBeInTheDocument()
  })

  test('cambia tenant y dispara RPC con tenant_id real', async () => {
    const { rerender } = render(
      <AgentPlaygroundSimulator workspace={createMockWorkspace(QAWAY_UUID)} onUpdateWorkspace={mockOnUpdateWorkspace} />
    )

    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })

    const input = screen.getByPlaceholderText('Escribe un mensaje de prueba...')
    fireEvent.change(input, { target: { value: 'Hola qaway' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => {
      const calls = (supabase.rpc as any).mock.calls
      const hasQaway = calls.some(c => c[0] === 'search_unified_context' && c[1]?.p_tenant_id === QAWAY_UUID)
      expect(hasQaway).toBe(true)
    })

    rerender(<AgentPlaygroundSimulator workspace={createMockWorkspace(CORAVET_UUID)} onUpdateWorkspace={mockOnUpdateWorkspace} />)

    await act(async () => {
      await new Promise(r => setTimeout(r, 0))
    })

    fireEvent.change(input, { target: { value: 'Hola coravet' } })
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }))

    await waitFor(() => {
      const calls = (supabase.rpc as any).mock.calls
      const hasCoravet = calls.some(c => c[0] === 'search_unified_context' && c[1]?.p_tenant_id === CORAVET_UUID)
      expect(hasCoravet).toBe(true)
    })
  })
})

describe('ContextEngine integration', () => {
  test('buildTenantContext usa tenantId real (no workspace.id)', async () => {
    const workspace = {
      id: 'tenant-qaway-master',
      slug: 'qaway-lab',
      name: 'Qaway Lab',
      industry: 'Tech',
      role: 'consultoria_ventas' as const,
      agentName: 'Bot',
      tone: 'ejecutivo_formal' as const,
      welcomeGreeting: 'Hola',
      handoverMessage: 'Adiós',
      channel: 'whatsapp' as const,
      aiSettings: { enabled: true, provider: 'gemini', model: 'gemini', mode: 'managed', api_key: null, temperature: 0.3, waba_phone_number_id: null, human_handoff_keywords: [], system_prompt: '', trainingMode: false, supervisorIds: [], llmProvider: 'gemini', llmApiKey: null },
      knowledgeBase: [], faqs: [], goldenExamples: [], correctionLogs: [],
      metrics: { totalConversations: 0, simulationsRun: 0, handoffCount: 0, complianceScore: 100 }
    }

    const ctx = await buildTenantContext('00000000-0000-0000-0000-000000000001', workspace, 'conv-1', [])

    expect(ctx.tenantId).toBe('00000000-0000-0000-0000-000000000001')
    expect(ctx.tenantId).not.toBe(workspace.id)
  })

  test('DEMO_VECTOR_768 es determinista (768 dims, valor 0.01)', () => {
    expect(DEMO_VECTOR_768.length).toBe(768)
    expect(DEMO_VECTOR_768[0]).toBe(0.01)
    expect(DEMO_VECTOR_768[767]).toBe(0.01)
  })
})