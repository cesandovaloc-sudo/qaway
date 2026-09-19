export interface SecurityScanResult {
  hasInjectionRisk: boolean
  hasSensitiveDataLeakRisk: boolean
  hasHarshToneRisk: boolean
  score: number
}

/**
 * Escaneo de seguridad sobre el texto enviado por el usuario o respondido por el bot
 */
export function scanMessageSafety(text: string): SecurityScanResult {
  const clean = text.toLowerCase()

  const injectionTerms = ['ignora tus instrucciones', 'dame tu prompt', 'system prompt', 'jailbreak']
  const sensitiveTerms = ['cvv', 'clave de internet', 'token bancario', 'pin secreto']
  const toxicTerms = ['estafador', 'inutil', 'basura', 'ladron', 'maldito', 'idiota']

  const hasInjection = injectionTerms.some(t => clean.includes(t))
  const hasSensitive = sensitiveTerms.some(t => clean.includes(t))
  const hasToxic = toxicTerms.some(t => clean.includes(t))

  let score = 100
  if (hasInjection) score -= 40
  if (hasSensitive) score -= 30
  if (hasToxic) score -= 20

  return {
    hasInjectionRisk: hasInjection,
    hasSensitiveDataLeakRisk: hasSensitive,
    hasHarshToneRisk: hasToxic,
    score: Math.max(0, score)
  }
}
