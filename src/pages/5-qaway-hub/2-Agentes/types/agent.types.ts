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
