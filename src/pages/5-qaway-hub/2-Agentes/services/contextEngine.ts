import {
  TenantAgentWorkspace,
  TenantContext,
  ContextPackage,
  VectorSearchResult,
  ToolDefinition,
  ConversationMemory,
  KnowledgeItem,
  FaqItem
} from '../types/agent.types'
import { supabase } from '@/config/supabase'

/**
 * CONTEXT ENGINE
 * 
 * Recupera contexto selectivo por tenant resuelto.
 * TenantContext es OBLIGATORIO - no hay fallback a workspace global.
 * Vector store: en Fase 1 usa RPC real search_unified_context con vector demo determinista.
 * En Fase 2+ usa pgvector real via Edge Function generate-embeddings.
 */

const DEFAULT_TOP_K = 3
const DEFAULT_MEMORY_TURNS = 8

// Vector demo DETERMINISTA (768 dims, idéntico al seed SQL)
export const DEMO_VECTOR_768 = new Array(768).fill(0.01)

async function searchUnifiedContext(
  tenantId: string,
  query: string,
  topK: number
): Promise<VectorSearchResult[]> {
  const { data, error } = await supabase.rpc('search_unified_context', {
    p_tenant_id: tenantId,
    p_query_embedding: DEMO_VECTOR_768,
    p_top_k: topK,
  })

  if (error) {
    console.warn('[ContextEngine] search_unified_context error:', error.message)
    return []
  }

  return (data || []).map(r => ({
    id: r.id,
    title: r.title,
    category: r.category || 'general',
    description: r.content,
    referencePrice: r.reference_price,
    score: r.similarity,
    source: r.source
  }))
}

function buildAllowedTools(workspace: TenantAgentWorkspace): ToolDefinition[] {
  const tools: ToolDefinition[] = [
    {
      name: 'search_knowledge_base',
      description: 'Buscar en la base de conocimiento de la empresa',
      parameters: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Consulta de búsqueda' }
        },
        required: ['query']
      },
      tenantScoped: true
    },
    {
      name: 'get_faq_answer',
      description: 'Obtener respuesta de preguntas frecuentes',
      parameters: {
        type: 'object',
        properties: {
          question: { type: 'string', description: 'Pregunta del usuario' }
        },
        required: ['question']
      },
      tenantScoped: true
    },
    {
      name: 'handoff_to_human',
      description: 'Transferir conversación a asesor humano',
      parameters: {
        type: 'object',
        properties: {
          reason: { type: 'string', description: 'Motivo del traspaso' }
        },
        required: ['reason']
      },
      tenantScoped: true
    },
    {
      name: 'get_pricing_info',
      description: 'Obtener información de precios orientativos',
      parameters: {
        type: 'object',
        properties: {
          service: { type: 'string', description: 'Servicio o producto' }
        },
        required: ['service']
      },
      tenantScoped: true
    }
  ]

  return tools
}

function buildConversationMemory(
  conversationId: string,
  messages: Array<{ role: 'user' | 'agent'; content: string; timestamp: number }>
): ConversationMemory {
  const recentTurns = messages.slice(-DEFAULT_MEMORY_TURNS)

  return {
    conversationId,
    recentTurns: recentTurns.map(m => ({
      role: m.role,
      content: m.content,
      timestamp: m.timestamp
    })),
    summary: recentTurns.length > 5
      ? `Conversación con ${recentTurns.length} intercambios. Temas: ${recentTurns.filter(t => t.role === 'user').slice(0, 3).map(t => t.content.slice(0, 30)).join(', ')}`
      : undefined
  }
}

export async function buildTenantContext(
  tenantId: string,
  workspace: TenantAgentWorkspace,
  conversationId: string,
  conversationHistory: Array<{ role: 'user' | 'agent'; content: string; timestamp: number }>
): Promise<TenantContext> {
  if (!tenantId) {
    throw new Error('TenantContext requiere tenantId real (public.get_auth_tenant_id())')
  }
  if (!workspace || !workspace.id) {
    throw new Error('TenantContext requiere workspace válido')
  }

  return {
    tenantId,
    config: {
      agentName: workspace.agentName,
      tone: workspace.tone,
      role: workspace.role,
      channel: workspace.channel,
      aiSettings: {
        provider: workspace.aiSettings.provider,
        model: workspace.aiSettings.model,
        temperature: workspace.aiSettings.temperature,
        human_handoff_keywords: workspace.aiSettings.human_handoff_keywords || []
      }
    },
    knowledgeIndex: {
      async search(query: string, options?: { topK?: number }): Promise<VectorSearchResult[]> {
        return searchUnifiedContext(tenantId, query, options?.topK ?? DEFAULT_TOP_K)
      }
    },
    memory: buildConversationMemory(conversationId, conversationHistory),
    allowedTools: buildAllowedTools(workspace),
    rlsContext: {
      userId: `user-${conversationId}`,
      tenantId
    }
  }
}

export async function buildContextForTurn(
  tenantContext: TenantContext,
  userMessage: string,
  conversationId: string
): Promise<ContextPackage> {
  if (!tenantContext || !tenantContext.tenantId) {
    throw new Error('TenantContext es obligatorio para recuperar contexto')
  }

  const [relevantKnowledge, memory] = await Promise.all([
    tenantContext.knowledgeIndex.search(userMessage, { topK: DEFAULT_TOP_K }),
    Promise.resolve(tenantContext.memory)
  ])

  return {
    config: tenantContext.config,
    relevantKnowledge,
    memory,
    allowedTools: tenantContext.allowedTools,
    retrievedAt: Date.now(),
    query: userMessage
  }
}

export function createContextInspection(
  tenantContext: TenantContext,
  contextPackage: ContextPackage
) {
  return {
    tenantId: tenantContext.tenantId,
    query: contextPackage.query,
    knowledgeResults: contextPackage.relevantKnowledge,
    memoryTurns: contextPackage.memory.recentTurns.length,
    toolsAvailable: contextPackage.allowedTools.map(t => t.name),
    retrievedAt: contextPackage.retrievedAt
  }
}

export function formatContextForPrompt(contextPackage: ContextPackage): string {
  const parts: string[] = []

  if (contextPackage.relevantKnowledge.length > 0) {
    const knowledgeText = contextPackage.relevantKnowledge
      .map((k, i) => `${i + 1}. [${k.category}] ${k.title}: ${k.description}${k.referencePrice ? ` (Precio: ${k.referencePrice})` : ''} [score: ${k.score.toFixed(2)}]`)
      .join('\n')
    parts.push(`[CONOCIMIENTO RELEVANTE RECUPERADO]\n${knowledgeText}`)
  }

  if (contextPackage.memory.recentTurns.length > 0) {
    const memoryText = contextPackage.memory.recentTurns
      .map(t => `${t.role === 'user' ? 'Cliente' : 'Agente'}: ${t.content}`)
      .join('\n')
    parts.push(`[MEMORIA DE CONVERSACIÓN - Últimos ${contextPackage.memory.recentTurns.length} turnos]\n${memoryText}`)
  }

  if (contextPackage.allowedTools.length > 0) {
    const toolsText = contextPackage.allowedTools
      .map(t => `- ${t.name}: ${t.description}`)
      .join('\n')
    parts.push(`[HERRAMIENTAS DISPONIBLES PARA ESTE TENANT]\n${toolsText}`)
  }

  return parts.length > 0 ? parts.join('\n\n') : ''
}