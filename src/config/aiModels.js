/**
 * ========================================================
 * CONFIGURACIÓN DE PROVEEDORES Y MODELOS DE INTELIGENCIA ARTIFICIAL
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

export const AI_PROVIDERS = {
  OPENAI: {
    id: 'openai',
    name: 'OpenAI',
    defaultModel: 'gpt-4o-mini',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Rápido y Económico)', cost: 'Bajo', type: 'fast' },
      { id: 'gpt-4o', name: 'GPT-4o (Completo y Balanceado)', cost: 'Medio', type: 'creative' },
      { id: 'o1-mini', name: 'o1-mini (Razonamiento Lógico)', cost: 'Alto', type: 'analytical' }
    ]
  },
  GEMINI: {
    id: 'gemini',
    name: 'Google Gemini',
    defaultModel: 'gemini-1.5-flash',
    models: [
      { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash (Velocidad extrema)', cost: 'Bajo', type: 'fast' },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro (Razonamiento y contexto amplio)', cost: 'Medio', type: 'analytical' },
      { id: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash (Experimental)', cost: 'Bajo', type: 'creative' }
    ]
  },
  ANTHROPIC: {
    id: 'anthropic',
    name: 'Anthropic Claude',
    defaultModel: 'claude-3-5-haiku',
    models: [
      { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku (Conversacional Rápido)', cost: 'Medio', type: 'fast' },
      { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet (Máxima Persuasión y Calidad)', cost: 'Alto', type: 'persuasive' }
    ]
  },
  DEEPSEEK: {
    id: 'deepseek',
    name: 'DeepSeek',
    defaultModel: 'deepseek-chat',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3 (Chat & Razonamiento general)', cost: 'Muy Bajo', type: 'creative' },
      { id: 'deepseek-coder', name: 'DeepSeek Coder (Estructuración técnica)', cost: 'Muy Bajo', type: 'analytical' }
    ]
  },
  OPENROUTER: {
    id: 'openrouter',
    name: 'OpenRouter (Multi-modelo)',
    defaultModel: 'meta-llama/llama-3-8b-instruct',
    models: [
      { id: 'meta-llama/llama-3-8b-instruct', name: 'Llama 3 8B Instruct', cost: 'Bajo', type: 'fast' },
      { id: 'meta-llama/llama-3-70b-instruct', name: 'Llama 3 70B Instruct', cost: 'Medio', type: 'creative' },
      { id: 'mistralai/mixtral-8x7b-instruct', name: 'Mixtral 8x7B', cost: 'Bajo', type: 'analytical' }
    ]
  },
  LOCAL: {
    id: 'local',
    name: 'Ollama / Servidor Local',
    defaultModel: 'llama3',
    models: [
      { id: 'llama3', name: 'Llama 3 (Local)', cost: 'Gratis / Local', type: 'fast' },
      { id: 'mistral', name: 'Mistral (Local)', cost: 'Gratis / Local', type: 'creative' },
      { id: 'phi3', name: 'Phi-3 (Ligero / Local)', cost: 'Gratis / Local', type: 'fast' }
    ]
  },
  CUSTOM: {
    id: 'custom',
    name: 'Endpoint Personalizado',
    defaultModel: 'custom-model',
    models: [
      { id: 'custom-model', name: 'Modelo Personalizado (Propio)', cost: 'Variable', type: 'creative' }
    ]
  }
}

// Configuración por Etapa
export const STAGE_DEFAULT_MODELS = {
  brief: { provider: 'openai', model: 'gpt-4o-mini', desc: 'Rápido y económico para recopilación de datos base.' },
  diagnostico: { provider: 'anthropic', model: 'claude-3-5-sonnet', desc: 'Razonamiento avanzado para priorizar dolores y objeciones.' },
  investigacion: { provider: 'gemini', model: 'gemini-1.5-pro', desc: 'Acceso amplio a contexto y tendencias actualizadas.' },
  contenidoOrganico: { provider: 'openai', model: 'gpt-4o', desc: 'Alta capacidad creativa y estructuración de hooks.' },
  copies: { provider: 'anthropic', model: 'claude-3-5-sonnet', desc: 'Psicología de ventas y variantes persuasivas.' },
  embudo: { provider: 'openai', model: 'gpt-4o-mini', desc: 'Estructuración modular de temperaturas del embudo.' },
  whatsapp: { provider: 'openai', model: 'gpt-4o-mini', desc: 'Respuestas conversacionales fluidas y ágiles.' },
  optimizacion: { provider: 'deepseek', model: 'deepseek-coder', desc: 'Rigurosidad analítica y auditoría de métricas.' }
}

// Estado base de la configuración global
export const INITIAL_AI_CONFIG = {
  defaultProvider: 'openai',
  defaultModel: 'gpt-4o-mini',
  stageModels: {
    brief: { provider: 'openai', model: 'gpt-4o-mini' },
    diagnostico: { provider: 'anthropic', model: 'claude-3-5-sonnet' },
    investigacion: { provider: 'gemini', model: 'gemini-1.5-pro' },
    contenidoOrganico: { provider: 'openai', model: 'gpt-4o' },
    copies: { provider: 'anthropic', model: 'claude-3-5-sonnet' },
    embudo: { provider: 'openai', model: 'gpt-4o-mini' },
    whatsapp: { provider: 'openai', model: 'gpt-4o-mini' },
    optimizacion: { provider: 'deepseek', model: 'deepseek-coder' }
  },
  apiKeys: {
    openai: '',
    gemini: '',
    anthropic: '',
    deepseek: '',
    openrouter: ''
  },
  localModelConfig: {
    enabled: false,
    endpoint: 'http://localhost:11434',
    model: 'llama3'
  }
}
