/**
 * ========================================================
 * CAMPAIGN & IA GLOBAL CONTEXT PROVIDER
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

import React, { createContext, useContext, useState, useEffect } from 'react'
import { INITIAL_AI_CONFIG } from '../../config/aiModels'
import { APP_MODES } from '../../config/appModes'
import { saveCampaignState, loadCampaignState } from './campaignStorage'
import { routeIaTask } from '../ai/modelRouter'

const CampaignContext = createContext()

export function CampaignProvider({ children }) {
  // 1. Modo de aplicación: saas, local o white_label
  const [appMode, setAppMode] = useState('saas') // 'saas', 'local', 'white_label'
  
  // 2. Configuración IA Global
  const [aiConfig, setAiConfig] = useState(() => {
    const saved = localStorage.getItem('qaway_ai_global_config')
    return saved ? JSON.parse(saved) : INITIAL_AI_CONFIG
  })

  // 3. Marca del Cliente (Para modo Marca Blanca / White-Label)
  const [whiteLabelBranding, setWhiteLabelBranding] = useState(() => {
    const saved = localStorage.getItem('qaway_whitelabel_branding')
    return saved ? JSON.parse(saved) : {
      clientName: 'Qaway Lab Consola',
      primaryColor: '#FFD200',
      logoUrl: ''
    }
  })

  // Guardar configuración de IA al mutar
  useEffect(() => {
    localStorage.setItem('qaway_ai_global_config', JSON.stringify(aiConfig))
  }, [aiConfig])

  // Guardar configuración de White Label
  useEffect(() => {
    localStorage.setItem('qaway_whitelabel_branding', JSON.stringify(whiteLabelBranding))
  }, [whiteLabelBranding])

  /**
   * Ejecuta una tarea IA desde cualquier módulo pasando por el modelRouter
   * @param {string} stage Etapa actual ('brief', 'diagnostico', etc.)
   * @param {string} prompt Prompt a procesar
   * @param {string} [systemPrompt] Prompt de sistema
   * @param {Object} campaignState Estado activo de la campaña
   * @returns {Promise<Object>}
   */
  const executeIaTask = async (stage, prompt, systemPrompt, campaignState) => {
    try {
      const result = await routeIaTask({
        stage,
        prompt,
        systemPrompt,
        outputFormat: 'json',
        campaignContext: {
          ...campaignState,
          appMode
        },
        approvedHistory: campaignState?.approvedModules || [],
        aiConfig
      })
      return result
    } catch (e) {
      console.error(`[CampaignContext] Error en tarea IA de ${stage}:`, e)
      throw e
    }
  }

  const value = {
    appMode,
    setAppMode,
    appModeDetails: APP_MODES[appMode.toUpperCase()] || APP_MODES.SAAS,
    aiConfig,
    setAiConfig,
    whiteLabelBranding,
    setWhiteLabelBranding,
    executeIaTask,
    saveCampaignState: (data) => saveCampaignState(appMode, data),
    loadCampaignState: (brandName) => loadCampaignState(appMode, brandName)
  }

  return React.createElement(CampaignContext.Provider, { value: value }, children)
}

export function useCampaign() {
  const context = useContext(CampaignContext)
  if (!context) {
    throw new Error('useCampaign debe ser usado dentro de un CampaignProvider')
  }
  return context
}
