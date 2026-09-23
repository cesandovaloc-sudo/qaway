import { describe, test, expect, beforeAll, vi } from 'vitest'
import { buildTenantContext } from '@/pages/5-qaway-hub/2-Agentes/services/contextEngine'
import { DEMO_VECTOR_768 } from '@/pages/5-qaway-hub/2-Agentes/services/contextEngine'
import type { TenantAgentWorkspace } from '@/pages/5-qaway-hub/2-Agentes/types/agent.types'

// Mock supabase para tests unitarios (no requiere BD real)
vi.mock('@/config/supabase', () => ({
  supabase: {
    rpc: vi.fn()
  }
}))

import { supabase } from '@/config/supabase'

// UUIDs reales de tenants (según BD Central)
const QAWAY_UUID = '00000000-0000-0000-0000-000000000001'      // qaway-lab
const CORAVET_UUID = '06bacf31-6699-4ef5-9843-e58b835c6b2b'    // coravet
const VALLET_UUID = '22222222-3333-4444-5555-666666666666'    // vallet-inmobiliaria

// Workspace demo mínimo para tests - id es demo, tenantId real se pasa aparte
const createMockWorkspace = (demoId: string, realTenantId: string): TenantAgentWorkspace => ({
  id: demoId, // demo id: 'tenant-qaway-master', 'tenant-coravet', 'tenant-vallet'
  slug: realTenantId === QAWAY_UUID ? 'qaway-lab' : realTenantId === CORAVET_UUID ? 'coravet' : 'vallet-inmobiliaria',
  name: realTenantId === QAWAY_UUID ? 'Qaway Lab Digital (Master)' : realTenantId === CORAVET_UUID ? 'CoraVet Clínica Veterinaria' : 'Vallet Grupo Inmobiliario',
  industry: realTenantId === QAWAY_UUID ? 'Tecnología, SaaS y Sistemas Web' : realTenantId === CORAVET_UUID ? 'Salud Animal y Pet Shop' : 'Bienes Raíces y Proyectos Residenciales',
  role: 'consultoria_ventas' as const,
  agentName: 'Test Bot',
  tone: 'ejecutivo_formal' as const,
  welcomeGreeting: 'Hola',
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

describe('Cross-tenant isolation (ContextEngine)', () => {
  beforeAll(() => {
    // Mock RPC response para search_unified_context
    // supabase.rpc se llama con (functionName, params)
    ;(supabase.rpc as any).mockImplementation(async (fnName: string, params: any) => {
      if (fnName === 'search_unified_context') {
        const p_tenant_id = params?.p_tenant_id
        if (p_tenant_id === QAWAY_UUID) {
          // Simula seeds demo con vector = DEMO_VECTOR_768 → similarity 1.0
          return {
            data: [
              { id: 'kb-1', title: 'Sistemas Web', category: 'Desarrollo', content: 'Arquitecturas SaaS...', reference_price: 'Cotización', similarity: 1.0, source: 'knowledge_base' },
              { id: 'kb-2', title: 'Notion Enterprise', category: 'Operaciones', content: 'Sistemas operativos...', reference_price: 'S/ 49', similarity: 1.0, source: 'knowledge_base' },
              { id: 'faq-1', title: '¿Garantía?', content: 'Garantía técnica...', similarity: 1.0, source: 'faqs' },
              { id: 'gold-1', title: 'Precio Notion', content: 'Nuestros precios reflejan...', similarity: 1.0, source: 'golden_examples' },
              { id: 'gold-2', title: 'Reparación laptops', content: 'Nos especializamos en software...', similarity: 1.0, source: 'golden_examples' }
            ],
            error: null
          }
        }
        // Otros tenants: sin seeds demo → 0 resultados
        return { data: [], error: null }
      }
      return { data: null, error: null }
    })
  })

  test('CoraVet NO ve knowledge de Vallet (cross-tenant isolation)', async () => {
    const workspace = createMockWorkspace('tenant-coravet', CORAVET_UUID)
    const ctx = await buildTenantContext(CORAVET_UUID, workspace, 'conv-test-1', [])
    
    const results = await ctx.knowledgeIndex.search('departamentos Miraflores', { topK: 5 })
    
    expect(results.length).toBe(0)
  })

  test('Vallet NO ve knowledge de CoraVet (cross-tenant isolation)', async () => {
    const workspace = createMockWorkspace('tenant-vallet', VALLET_UUID)
    const ctx = await buildTenantContext(VALLET_UUID, workspace, 'conv-test-2', [])
    
    const results = await ctx.knowledgeIndex.search('Royal Canin gatos', { topK: 5 })
    
    expect(results.length).toBe(0)
  })

  test('qaway-lab VE sus propios seeds (similitud 1.0 con DEMO_VECTOR_768)', async () => {
    const workspace = createMockWorkspace('tenant-qaway-master', QAWAY_UUID)
    const ctx = await buildTenantContext(QAWAY_UUID, workspace, 'conv-test-3', [])
    
    const results = await ctx.knowledgeIndex.search('Sistemas Web', { topK: 5 })
    
    expect(results.length).toBeGreaterThan(0)
    // Verifica similitud 1.0 (vector demo determinista)
    expect(results[0].score).toBeCloseTo(1.0, 1)
    // Verifica que vienen de sources esperados
    const sources = results.map(r => r.source)
    expect(sources).toContain('knowledge_base')
  })

  test('Tools son tenant-scoped', async () => {
    const workspace = createMockWorkspace('tenant-coravet', CORAVET_UUID)
    const ctx = await buildTenantContext(CORAVET_UUID, workspace, 'conv-test-4', [])
    
    expect(ctx.allowedTools.length).toBeGreaterThan(0)
    expect(ctx.allowedTools.every(t => t.tenantScoped === true)).toBe(true)
  })

  test('TenantContext usa UUID real (no workspace.id demo)', async () => {
    const workspace = createMockWorkspace('tenant-coravet', CORAVET_UUID)
    const ctx = await buildTenantContext(CORAVET_UUID, workspace, 'conv-test-5', [])
    
    expect(ctx.tenantId).toBe(CORAVET_UUID)
    expect(ctx.tenantId).not.toBe(workspace.id) // workspace.id es 'tenant-coravet' demo
  })

  test('RPC search_unified_context llamado con tenantId correcto', async () => {
    const workspace = createMockWorkspace('tenant-coravet', CORAVET_UUID)
    const ctx = await buildTenantContext(CORAVET_UUID, workspace, 'conv-test-6', [])
    
    await ctx.knowledgeIndex.search('test query', { topK: 3 })
    
    expect(supabase.rpc).toHaveBeenCalledWith('search_unified_context', expect.objectContaining({
      p_tenant_id: CORAVET_UUID,
      p_query_embedding: DEMO_VECTOR_768,
      p_top_k: 3
    }))
  })
})