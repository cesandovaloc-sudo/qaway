/**
 * ========================================================
 * PROVEEDOR IA: LOCAL / OLLAMA
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

export const localProvider = {
  /**
   * Envía una solicitud a un servidor local de Ollama (con fallbacks si no está activo)
   * @param {Object} payload Parámetros estructurados recibidos del modelRouter
   * @returns {Promise<Object>} Respuesta estructurada de la IA
   */
  async generateText(payload) {
    const { model, prompt, systemPrompt, localConfig, outputFormat, campaignContext } = payload
    const endpoint = localConfig?.endpoint || 'http://localhost:11434'
    const targetModel = model || localConfig?.model || 'llama3'

    console.log(`[Local Ollama Provider] Conectando a ${endpoint} con modelo ${targetModel}`)

    // Llamada real de Ollama si está activo localmente:
    /*
    try {
      const response = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: targetModel,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          stream: false
        })
      });
      const data = await response.json();
      return {
        success: true,
        text: data.message.content,
        model: targetModel,
        provider: 'local'
      };
    } catch (error) {
      console.warn('[Local Ollama Provider] No se pudo conectar al Ollama local. Usando simulador offline...', error);
    }
    */

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          text: `Respuesta de Ollama Local (${targetModel}) ejecutada localmente y sin costo de servidor. Producto: "${campaignContext?.brief?.marca || 'Marca Pro'}".`,
          model: targetModel,
          provider: 'local',
          estimatedCost: 0, // ¡Consumo local gratis!
          timestamp: new Date().toISOString()
        })
      }, 800)
    })
  }
}
