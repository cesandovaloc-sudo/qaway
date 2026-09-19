export interface HandoffTriggerResult {
  triggered: boolean
  matchedKeyword?: string
  actionMessage: string
}

/**
 * Validador de triggers de Traspaso Humano (Human Handoff)
 */
export function evaluateHandoffTrigger(userText: string, keywords: string[]): HandoffTriggerResult {
  const clean = userText.toLowerCase().trim()
  const matched = keywords.find(k => clean.includes(k.toLowerCase()))

  if (matched) {
    return {
      triggered: true,
      matchedKeyword: matched,
      actionMessage: 'He registrado tu solicitud de contacto directo. En breve un asesor de nuestro equipo continuará la atención contigo.'
    }
  }

  return {
    triggered: false,
    actionMessage: ''
  }
}
