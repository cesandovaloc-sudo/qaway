/**
 * ========================================================
 * SERVICIO DE INVESTIGACIÓN Y TENDENCIAS ORGÁNICAS
 * QAWAY CAMPAIGN CONSOLE - MÓDULO 03A
 * ========================================================
 */

import { getOrganicResearchPrompt } from '../../prompts/organicResearchPrompt'

export const organicResearchService = {
  /**
   * Genera 4 oportunidades estratégicas de contenido basadas en el contexto actual
   * @param {Function} executeIaTask Función del context para llamar al router
   * @param {Object} campaignState Estado actual que incluye brief y diagnóstico
   * @param {Object} aiConfig Configuración IA activa
   * @returns {Promise<Array>} Lista de oportunidades
   */
  async generateResearchOpportunities(executeIaTask, campaignState, aiConfig) {
    const brief = campaignState?.brief || {}
    const diagnostico = campaignState?.diagnostico || {}

    console.log('[organicResearchService] Generando investigación para:', brief.marca)

    const promptText = getOrganicResearchPrompt(brief, diagnostico)
    const systemPrompt = "Eres un estratega de contenido y crecimiento orgánico de élite. Tu objetivo es detectar oportunidades de alta conversión y valor educativo. Debes responder estrictamente en formato JSON válido."

    try {
      // Intentamos llamar a la IA real si tiene llaves configuradas o local Ollama
      const hasKey = aiConfig?.apiKeys?.openai || aiConfig?.apiKeys?.gemini || aiConfig?.apiKeys?.anthropic || aiConfig?.apiKeys?.deepseek || aiConfig?.localModelConfig?.enabled
      
      if (hasKey) {
        const response = await executeIaTask('investigacion', promptText, systemPrompt, campaignState)
        if (response?.success && response?.text) {
          // Intentar parsear el JSON de la respuesta
          try {
            const data = JSON.parse(response.text.replace(/```json|```/g, '').trim())
            if (data?.oportunidades && Array.isArray(data.oportunidades)) {
              return data.oportunidades.map(op => ({
                ...op,
                estado: 'pendiente'
              }))
            }
          } catch (parseError) {
            console.error('[organicResearchService] Error parseando JSON de IA, usando fallback inteligente:', parseError)
          }
        }
      }
    } catch (error) {
      console.error('[organicResearchService] Fallo en la llamada a IA, derivando a simulación:', error)
    }

    // Fallback de simulación inteligente y contextual (Punto 5 y 11)
    return new Promise((resolve) => {
      setTimeout(() => {
        const brand = brief.marca || 'Marca Pro'
        const product = brief.productoServicio || 'nuestro servicio'
        const problem = brief.problemaPrincipal || 'desorganización y pérdida de tiempo'

        const isNotionOrContent = 
          brand.toLowerCase().includes('notion') || 
          brand.toLowerCase().includes('sistema') ||
          product.toLowerCase().includes('contenido') || 
          product.toLowerCase().includes('plantilla')

        const simOpportunities = isNotionOrContent
          ? [
              {
                id: 'op-notion-ia',
                tituloOportunidad: 'La trampa del minimalismo en Notion: Por qué los dashboards estéticos te hacen procrastinar',
                tendenciaDetectada: 'El auge de la estética en Notion sobre la operatividad real y el cansancio de plantillas sobrecargadas.',
                porQueImporta: 'Los profesionales y creadores pasan más tiempo acomodando iconos y widgets de clima que ejecutando su flujo de contenido.',
                relacionConLaOferta: 'Introduce sutilmente la necesidad de contar con un sistema ágil y rápido orientado a la acción, no a la decoración.',
                riesgoDeContenidoBasico: 'Decirle al usuario "organiza tus tareas en Notion". Es aburrido y ya nadie lo lee.',
                anguloRecomendado: 'Derrumbar la creencia de que un Notion bonito equivale a ser productivo. Proponer operatividad veloz.',
                formatosSugeridos: ['carrusel', 'post'],
                nivelImpacto: 'alto',
                estado: 'pendiente'
              },
              {
                id: 'op-ia-saturacion',
                tituloOportunidad: 'El burnout de los agentes IA: Cómo usar prompts estructurados sin convertirte en un spammer genérico',
                tendenciaDetectada: 'La saturación de posts creados con IA de baja calidad que aburren a las audiencias en LinkedIn e Instagram.',
                porQueImporta: 'Las marcas que usan copy-paste de ChatGPT están perdiendo engagement orgánico de manera drástica.',
                relacionConLaOferta: 'Valida nuestro enfoque estructurado (brief + diagnóstico) que calibra la IA para mantener la identidad de la marca.',
                riesgoDeContenidoBasico: 'Hacer un post básico de "los 10 mejores prompts de IA". La gente ya está cansada de listas genéricas.',
                anguloRecomendado: 'Explicar que la IA no es para escribir posts rápidos, sino para calibrar marcos de razonamiento y resolver cuellos de botella.',
                formatosSugeridos: ['post', 'reel'],
                nivelImpacto: 'alto',
                estado: 'pendiente'
              },
              {
                id: 'op-workflow-fuga',
                tituloOportunidad: 'El costo invisible del caos creativo: ¿Cuántas ideas de $1,000 dejas morir en tus chats de WhatsApp?',
                tendenciaDetectada: 'La falta de captura express centralizada. Las mejores ideas nacen en la calle y mueren olvidadas en notas de voz.',
                porQueImporta: 'Los creadores y equipos pierden el 80% de su inspiración diaria al no tener un laboratorio de ideas integrado.',
                relacionConLaOferta: 'Introduce la bandeja de entrada express y captura centralizada que ofrece el Brief Maestro.',
                riesgoDeContenidoBasico: 'Dar consejos vacíos como "lleva siempre un cuaderno". Es impráctico.',
                anguloRecomendado: 'Confrontar al usuario con la pérdida monetaria y de tiempo real que representa no tener un flujo operativo editorial.',
                formatosSugeridos: ['reel', 'historia', 'carrusel'],
                nivelImpacto: 'alto',
                estado: 'pendiente'
              },
              {
                id: 'op-algoritmo-educar',
                tituloOportunidad: 'La falacia del calendario de 30 días: Por qué publicar a diario sin embudo está destruyendo tu algoritmo',
                tendenciaDetectada: 'El cansancio de la regla de "publica todos los días a las 6 PM" impuesta por gurús tradicionales.',
                porQueImporta: 'Publicar piezas sin conexión estratégica enfría el alcance y entrena al algoritmo a ignorar tus posts.',
                relacionConLaOferta: 'Establece la importancia de planificar en base a la temperatura y segmentación TOFU/MOFU/BOFU antes de empujar la oferta.',
                riesgoDeContenidoBasico: 'Hacer un post de "ideas de temas para publicar el lunes". No tiene fondo estratégico.',
                anguloRecomendado: 'Enseñar la regla del 80% valor educativo y 20% urgencia comercial como modelo de crecimiento sostenible.',
                formatosSugeridos: ['carrusel', 'post'],
                nivelImpacto: 'medio',
                estado: 'pendiente'
              }
            ]
          : [
              {
                id: 'op-generica-1',
                tituloOportunidad: `El mito del costo versus valor: Por qué lo que consideras "caro" de ${brand} te está ahorrando miles de dólares`,
                tendenciaDetectada: 'Clientes que priorizan la opción más barata sin medir el costo del soporte deficiente y las fallas técnicas.',
                porQueImporta: 'La audiencia suele comparar precios fríos en lugar de evaluar el retorno de inversión estratégica.',
                relacionConLaOferta: 'Justifica de manera impecable el precio premium de la oferta mediante la confiabilidad operativa.',
                riesgoDeContenidoBasico: `Publicar una lista de precios tradicionales. Es poco persuasivo.`,
                anguloRecomendado: 'Mostrar una tabla comparativa de pérdidas por usar soluciones inestables versus la paz de nuestro servicio.',
                formatosSugeridos: ['post', 'carrusel'],
                nivelImpacto: 'alto',
                estado: 'pendiente'
              },
              {
                id: 'op-generica-2',
                tituloOportunidad: `El error crítico al intentar resolver el problema de ${problem} de forma aislada`,
                tendenciaDetectada: 'Profesionales intentando apagar fuegos con tips individuales en lugar de corregir la raíz.',
                porQueImporta: 'La gente busca soluciones instantáneas "parche" que fallan a las dos semanas.',
                relacionConLaOferta: `Valida la necesidad de una solución integral y estructurada como la que provee ${brand}.`,
                riesgoDeContenidoBasico: 'Dar "3 tips rápidos de organización". No resuelven el dolor de fondo.',
                anguloRecomendado: 'Exponer por qué las soluciones temporales fracasan y plantear una metodología sistémica.',
                formatosSugeridos: ['reel', 'post'],
                nivelImpacto: 'alto',
                estado: 'pendiente'
              },
              {
                id: 'op-generica-3',
                tituloOportunidad: `Cambios silenciosos del sector: Lo que nadie te está diciendo sobre la evolución de ${product}`,
                tendenciaDetectada: 'Nuevas expectativas de mercado y mayor exigencia de personalización por parte del cliente ideal.',
                porQueImporta: 'Las empresas estancadas en metodologías del 2024 se están volviendo irrelevantes rápidamente.',
                relacionConLaOferta: 'Estructura autoridad y demuestra que nuestra oferta está alineada con el estado del arte actual.',
                riesgoDeContenidoBasico: 'Hacer un listado de noticias genéricas. Nadie lo comparte.',
                anguloRecomendado: 'Analizar dos cambios críticos del sector que impactan directamente el bolsillo del usuario final.',
                formatosSugeridos: ['post', 'historia'],
                nivelImpacto: 'medio',
                estado: 'pendiente'
              },
              {
                id: 'op-generica-4',
                tituloOportunidad: 'Cómo delegar de forma segura sin que la calidad y la identidad comercial se desplomen',
                tendenciaDetectada: 'El miedo de fundadores y directores a perder el control creativo y el tono de marca al descentralizar tareas.',
                porQueImporta: 'Muchos dueños de negocio siguen actuando como cuellos de botella por falta de sistemas claros.',
                relacionConLaOferta: 'Introduce la robustez del ecosistema modular de Qaway para transferir directrices de comunicación.',
                riesgoDeContenidoBasico: 'Hacer un checklist básico de "cómo delegar". Falta profundidad psicológica.',
                anguloRecomendado: 'Abordar el dolor de delegar desde el miedo al caos y proponer un protocolo de transferencia rápida.',
                formatosSugeridos: ['carrusel', 'reel'],
                nivelImpacto: 'alto',
                estado: 'pendiente'
              }
            ]

        resolve(simOpportunities)
      }, 800)
    })
  },

  /**
   * Toma una oportunidad y mejora su impacto
   * @param {Object} opportunity Oportunidad a mejorar
   * @returns {Object} Oportunidad mejorada
   */
  improveOpportunityImpact(opportunity) {
    console.log('[organicResearchService] Mejorando impacto de:', opportunity.tituloOportunidad)
    return {
      ...opportunity,
      tituloOportunidad: opportunity.tituloOportunidad.replace('Por qué', 'El Secreto Silencioso de por qué').replace('trampa', 'Trampa Mortal') + ' (Versión de Alto Impacto 🚀)',
      anguloRecomendado: `[IMPACTO MEJORADO] ${opportunity.anguloRecomendado} Añadimos tensión psicológica inicial y una comparación directa con datos empíricos de la competencia.`,
      nivelImpacto: 'alto'
    }
  }
}
