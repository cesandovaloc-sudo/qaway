export type ModelProvider = 'gemini' | 'openai' | 'anthropic'

export type BillingMode = 'managed' | 'byok'

export type AgentRole = 
  | 'consultoria_ventas'
  | 'soporte_tecnico'
  | 'agendamiento_citas'
  | 'calificacion_leads'
  | 'atencion_general'

export type ToneArchetype = 
  | 'ejecutivo_formal'
  | 'cercano_empatico'
  | 'dinamico_innovador'
  | 'clinico_profesional'

export interface KnowledgeItem {
  id: string
  title: string
  category: string
  description: string
  referencePrice?: string
  urlOrDoc?: string
}

export interface FaqItem {
  id: string
  question: string
  answer: string
}

export interface GoldenExample {
  id: string
  category: 'precio' | 'fuera_catalogo' | 'queja_insulto' | 'tecnica' | 'casual'
  userQuestion: string
  idealAnswer: string
  rationale: string
  isApproved: boolean
}

export interface CorrectionLogItem {
  id: string
  timestamp: number
  dateString: string
  userQuery: string
  badAgentReply: string
  humanCorrection: string
  status: 'pendiente' | 'aplicado'
}

export interface StressTestCase {
  id: string
  round: '1_happy_path' | '2_fuera_catalogo' | '3_human_handoff' | '4_insultos_seguridad'
  name: string
  userPrompt: string
  expectedBehavior: string
  lastRunResult?: 'passed' | 'failed' | 'untested'
  lastReply?: string
}

export interface AiSettingsPayload {
  enabled: boolean
  provider: ModelProvider
  model: string
  mode: BillingMode
  api_key: string | null
  temperature: number
  system_prompt: string
  waba_phone_number_id: string | null
  human_handoff_keywords: string[]
  // Modo entrenamiento 24h obligatorio
  trainingMode?: boolean
  trainingStartedAt?: number
  supervisorIds?: string[]
  // LLM configuración explícita
  llmProvider?: ModelProvider
  llmApiKey?: string
}

export interface TenantAgentWorkspace {
  id: string
  slug: string
  name: string
  industry: string
  role: AgentRole
  agentName: string
  tone: ToneArchetype
  aiSettings: AiSettingsPayload
  knowledgeBase: KnowledgeItem[]
  faqs: FaqItem[]
  goldenExamples: GoldenExample[]
  correctionLogs: CorrectionLogItem[]
  welcomeGreeting: string
  handoverMessage: string
  channel: 'whatsapp' | 'web'
  metrics: {
    totalConversations: number
    simulationsRun: number
    handoffCount: number
    complianceScore: number
  }
}

export interface ChatMessage {
  id: string
  sender: 'user' | 'agent' | 'system'
  text: string
  timestamp: number
  time: string
  complianceFlag?: {
    isAiDeclared?: boolean
    isHumanRequested?: boolean
    isSensitiveDataBlocked?: boolean
    isAntiInjectionBlocked?: boolean
  }
}

export interface ComplianceAuditResult {
  passed: boolean
  overallScore: number
  checks: {
    transparencyDeclared: boolean
    humanHandoffFunctional: boolean
    financialPrivacyProtected: boolean
    antiInjectionResilient: boolean
    ergonomicLengthValid: boolean
    lowTemperatureConfigured: boolean
  }
  feedback: string[]
}

/**
 * CONTEXT ENGINE TYPES
 * 
 * TenantContext es OBLIGATORIO para cualquier recuperación de knowledge, memoria o tools.
 * El Context Engine consulta únicamente el tenant resuelto por backend.
 * No depende de filtros posteriores ni del prompt para separar empresas.
 */

export interface VectorSearchResult {
  id: string
  title: string
  category: string
  description: string
  referencePrice?: string
  score: number
  source: 'knowledgeBase' | 'faqs'
}

export interface ToolDefinition {
  name: string
  description: string
  parameters: Record<string, unknown>
  required?: string[]
  tenantScoped: boolean
}

export interface ConversationMemory {
  conversationId: string
  recentTurns: Array<{
    role: 'user' | 'agent'
    content: string
    timestamp: number
  }>
  summary?: string
  entities?: Record<string, unknown>
}

export interface TenantContext {
  tenantId: string
  config: {
    agentName: string
    tone: ToneArchetype
    role: AgentRole
    channel: 'whatsapp' | 'web'
    aiSettings: {
      provider: ModelProvider
      model: string
      temperature: number
      human_handoff_keywords: string[]
    }
  }
  knowledgeIndex: {
    search: (query: string, options?: { topK?: number }) => Promise<VectorSearchResult[]>
  }
  memory: ConversationMemory
  allowedTools: ToolDefinition[]
  rlsContext: {
    userId: string
    tenantId: string
  }
}

export interface ContextPackage {
  config: TenantContext['config']
  relevantKnowledge: VectorSearchResult[]
  memory: ConversationMemory
  allowedTools: ToolDefinition[]
  retrievedAt: number
  query: string
}

export interface ContextInspection {
  tenantId: string
  query: string
  knowledgeResults: VectorSearchResult[]
  memoryTurns: number
  toolsAvailable: string[]
  retrievedAt: number
}
