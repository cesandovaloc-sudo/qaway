/**
 * ========================================================
 * ENRUTADOR ESTRATÉGICO DE MODELOS IA: modelRouter
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

import { openaiProvider } from './providers/openaiProvider'
import { geminiProvider } from './providers/geminiProvider'
import { anthropicProvider } from './providers/anthropicProvider'
import { openrouterProvider } from './providers/openrouterProvider'
import { localProvider } from './providers/localProvider'
import { STAGE_DEFAULT_MODELS } from '../../config/aiModels'

/**
 * Rutea una tarea de campaña hacia el proveedor y modelo IA configurado
 * @param {Object} params Parámetros de la tarea
 * @param {string} params.stage Módulo o etapa actual ('brief', 'diagnostico', etc.)
 * @param {string} params.prompt Prompt específico a resolver
 * @param {string} [params.systemPrompt] Instrucciones de sistema (opcional)
 * @param {string} [params.outputFormat='json'] Formato de salida ('json' o 'text')
 * @param {Object} params.campaignContext Contexto de la campaña (Brief, Diagnóstico, etc.)
 * @param {Array} [params.approvedHistory=[]] Historial de módulos previamente aprobados
 * @param {Object} params.aiConfig Configuración global de IA de la Consola
 * @returns {Promise<Object>} Resultado estructurado
 */
export async function routeIaTask(params) {
  const {
    stage,
    prompt,
    systemPrompt,
    outputFormat = 'json',
    campaignContext,
    approvedHistory = [],
    aiConfig
  } = params

  console.log(`[modelRouter] Ruteando tarea de etapa "${stage}"...`)

  // 1. Determinar qué proveedor y modelo usar para esta etapa específica
  const stageSettings = aiConfig?.stageModels?.[stage] || STAGE_DEFAULT_MODELS[stage]
  const providerId = stageSettings?.provider || aiConfig?.defaultProvider || 'openai'
  const modelId = stageSettings?.model || aiConfig?.defaultModel || 'gpt-4o-mini'

  // 2. Obtener la API key correspondiente
  const apiKey = aiConfig?.apiKeys?.[providerId] || ''

  // 3. Crear el payload enriquecido de contexto para la IA (Punto 9 de requerimientos)
  const enrichedPayload = {
    provider: providerId,
    model: modelId,
    stage: stage,
    prompt: prompt,
    systemPrompt: systemPrompt || `Eres un redactor y estratega de marketing elite de Qaway Lab. Formato esperado: ${outputFormat}.`,
    outputFormat: outputFormat,
    apiKey: apiKey,
    campaignContext: {
      brief: campaignContext?.brief || {},
      diagnostico: campaignContext?.diagnostico || {},
      campaignData: campaignContext?.campaignData || {},
      appMode: campaignContext?.appMode || 'saas',
      restricciones: campaignContext?.brief?.restricciones || []
    },
    approvedHistory: approvedHistory,
    localConfig: aiConfig?.localModelConfig || {}
  }

  // 4. Derivar al proveedor adecuado
  let response
  try {
    if (aiConfig?.localModelConfig?.enabled || providerId === 'local') {
      response = await localProvider.generateText(enrichedPayload)
    } else {
      switch (providerId) {
        case 'openai':
          response = await openaiProvider.generateText(enrichedPayload)
          break
        case 'gemini':
          response = await geminiProvider.generateText(enrichedPayload)
          break
        case 'anthropic':
          response = await anthropicProvider.generateText(enrichedPayload)
          break
        case 'openrouter':
          response = await openrouterProvider.generateText(enrichedPayload)
          break
        case 'deepseek':
          // Reutiliza la estructura compatible de OpenAI o Gemini
          response = await openaiProvider.generateText({
            ...enrichedPayload,
            model: modelId || 'deepseek-chat'
          })
          break
        default:
          console.warn(`[modelRouter] Proveedor no reconocido: ${providerId}. Utilizando OpenAI por defecto.`)
          response = await openaiProvider.generateText(enrichedPayload)
      }
    }

    return {
      success: true,
      provider: providerId,
      model: modelId,
      stage: stage,
      outputFormat: outputFormat,
      text: response?.text || '',
      estimatedCost: response?.estimatedCost || 0,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error(`[modelRouter] Error fatal ruteando tarea de ${stage}:`, error)
    throw error
  }
}
