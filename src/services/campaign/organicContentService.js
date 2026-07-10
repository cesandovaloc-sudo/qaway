/**
 * ========================================================
 * SERVICIO DE GENERACIÓN DE PIEZAS ORGÁNICAS
 * QAWAY CAMPAIGN CONSOLE - MÓDULO 03B
 * ========================================================
 */

import { getOrganicPostPrompt } from '../../prompts/organicPostPrompt'
import { getOrganicCarouselPrompt } from '../../prompts/organicCarouselPrompt'
import { getOrganicReelPrompt } from '../../prompts/organicReelPrompt'

export const organicContentService = {
  /**
   * Genera una pieza orgánica en base al formato y estilo
   * @param {string} format Formato ('post', 'carrusel', 'reel', 'historia', 'video_corto', 'hilos')
   * @param {string} style Estilo ('Profesional Editorial', 'Creativo Natural', 'Alto Impacto')
   * @param {Object} opportunity Oportunidad de investigación seleccionada
   * @param {Function} executeIaTask Función del context para llamar al router
   * @param {Object} campaignState Estado actual de la campaña
   * @param {Object} aiConfig Configuración IA
   * @returns {Promise<Object>} Pieza de contenido generada
   */
  async generateOrganicPiece({ format, style, opportunity, executeIaTask, campaignState, aiConfig }) {
    const brief = campaignState?.brief || {}
    const diagnostico = campaignState?.diagnostico || {}

    console.log(`[organicContentService] Generando pieza orgánica: Formato=${format}, Estilo=${style}`)

    let promptText = ''
    let systemPrompt = "Eres un estratega de contenido elite de Qaway Lab. Tu tarea es generar piezas orgánicas de altísimo valor que generen conversación o autoridad sin sonar promocionales."

    // Normalizar formato
    const normFormat = format.toLowerCase()

    if (normFormat.includes('carrusel')) {
      promptText = getOrganicCarouselPrompt(opportunity, style, brief, diagnostico)
    } else if (normFormat.includes('reel') || normFormat.includes('video') || normFormat.includes('corto')) {
      promptText = getOrganicReelPrompt(opportunity, style, brief, diagnostico)
    } else {
      promptText = getOrganicPostPrompt(opportunity, style, brief, diagnostico)
    }

    try {
      const hasKey = aiConfig?.apiKeys?.openai || aiConfig?.apiKeys?.gemini || aiConfig?.apiKeys?.anthropic || aiConfig?.apiKeys?.deepseek || aiConfig?.localModelConfig?.enabled

      if (hasKey) {
        const response = await executeIaTask('contenidoOrganico', promptText, systemPrompt, campaignState)
        if (response?.success && response?.text) {
          try {
            const data = JSON.parse(response.text.replace(/```json|```/g, '').trim())
            return {
              success: true,
              format: format,
              style: style,
              data: data,
              timestamp: new Date().toISOString()
            }
          } catch (parseError) {
            console.error('[organicContentService] Error parseando JSON de pieza:', parseError)
          }
        }
      }
    } catch (e) {
      console.error('[organicContentService] Fallo de IA, utilizando fallback:', e)
    }

    // Fallbacks inteligentes según el formato (Punto 5, 8, 11)
    return new Promise((resolve) => {
      setTimeout(() => {
        const brand = brief.marca || 'Marca Pro'
        const product = brief.productoServicio || 'nuestro servicio'
        const price = brief.precio || '$49'
        const problemText = opportunity?.tituloOportunidad || 'Falta de orden estratégico'

        let resultData = {}

        if (normFormat.includes('carrusel')) {
          resultData = {
            coreCarrusel: {
              problema: `La desconexión total entre tu plan diario y tus objetivos. Intentas curar la desorganización con parches.`,
              mensajeFuerza: `Un sistema no se mide por lo bonito que luce, sino por los clics operativos que te ahorra y la claridad que le da a tu equipo.`,
              cta: `Comenta "SISTEMA" y te envío la auditoría en privado.`
            },
            estructuraSlides: [
              {
                slide: 1,
                objetivo: 'Scroll Stopper / Atrapar la atención con tensión estratégica',
                textoPrincipal: opportunity?.tituloOportunidad || 'La trampa del minimalismo en Notion',
                textoSecundario: 'Por qué priorizar la estética visual está matando el ritmo de tu negocio. Desmitificando plantillas.',
                indicacionVisual: `Estilo ${style}. Composición limpia con una tipografía gigante, fondo de alto contraste, y una captura real de un flujo de trabajo desordenado.`
              },
              {
                slide: 2,
                objetivo: 'Confrontar el síntoma del caos operativo',
                textoPrincipal: '1. Pasar 3 horas buscando un guion',
                textoSecundario: 'Si tus ideas viven en notas de WhatsApp, borradores de Instagram y libretas, estás perdiendo el 80% de tu tiempo creativo.',
                indicacionVisual: 'Líneas limpias, diagramación tipo Bento Grid mostrando tres cajas grises que representan ideas perdidas.'
              },
              {
                slide: 3,
                objetivo: 'Dar el marco estratégico',
                textoPrincipal: '2. Operatividad sobre Decoración',
                textoSecundario: 'Un Notion eficiente no necesita widgets de clima. Necesita un Laboratorio de Ideas Express que capture destellos en 5 segundos.',
                indicacionVisual: 'Una flecha direccional verde esmeralda apuntando desde un diseño complejo hacia uno simple y funcional.'
              },
              {
                slide: 4,
                objetivo: 'Explicar el beneficio de fondo',
                textoPrincipal: '3. Flujo en lugar de impulsos',
                textoSecundario: 'El secreto es conectar cada pilar educativo con etapas inbound claras (TOFU/MOFU/BOFU) para educar de forma consistente.',
                indicacionVisual: 'Tres círculos concéntricos representando el embudo comercial.'
              },
              {
                slide: 5,
                objetivo: 'Llamado a la Acción educativo suave',
                textoPrincipal: '¿Listo para auditar tu flujo?',
                textoSecundario: 'Deja de improvisar y automatiza tu Consola. Escribe "SISTEMA" en los comentarios y te comparto las directrices.',
                indicacionVisual: 'Slide final con tipografía gigante, botón simulado de guardar y compartir, y logo sutil de la marca.'
              }
            ],
            promptVisualGeneral: `Carrusel de alto impacto en estilo ${style}. Paleta de colores minimalista con fondo oscuro mate y acento amarillo primario. Tipografía sans-serif bold, composición geométrica premium y sin ruido visual redundante.`,
            copyCaption: `¿Cuánto tiempo pasas organizando tus tableros en lugar de producir?\n\nLa estética sin estructura es solo procrastinación decorativa. En este carrusel te revelamos por qué el caos operativo te cuesta dinero.\n\nEscribe "SISTEMA" y te comparto el diagnóstico.\n\n#QawayLab #MarketingEstrategico #NotionTips`,
            hashtags: ['#QawayLab', '#EstrategiaDigital', '#ProductividadReal']
          }
        } else if (normFormat.includes('reel') || normFormat.includes('video') || normFormat.includes('corto')) {
          resultData = {
            coreReel: {
              problema: `La improvisación diaria que arruina el alcance de tu marca.`,
              mensajeFuerza: `Deja de crear contenido "por cumplir". Cada pieza debe ser un puente educativo hacia tu oferta.`,
              cta: `Comenta "SISTEMA" para auditar tus guiones gratis.`
            },
            guion: {
              hookInicial: `[0-3s] Deja de publicar todos los días. Estás destruyendo tu cuenta y cansando a tu público. Te explico por qué...`,
              escena1: `[3-15s] (Encuadre medio, hablando directo a cámara con gesticulación tranquila). Crear posts genéricos "por rellenar el calendario" entrena al algoritmo de Instagram a ignorarte porque tu audiencia pierde interés.`,
              escena2: `[15-30s] (Muestra pantalla con la consola estructurada). La solución no es más cantidad, es profundidad. Necesitas un Laboratorio de Ideas que capture tendencias y las procese en base a dolores reales de tu cliente.`,
              escena3: `[30-45s] (Volviendo a cámara). Al educar al mercado antes de empujar la oferta, reduces la fricción y aumentas el valor percibido. Tu precio ya no es una barrera.`,
              cierre: `[45-60s] ¿Quieres ver la plantilla exacta que usamos para planificar? Escribe "SISTEMA" y te la envío en un mensaje directo.`
            },
            textoEnPantalla: [
              `❌ ERROR: Publicar a diario sin estrategia`,
              `💡 SOLUCIÓN: Conectar cada post con un embudo`,
              `👉 Escribe "SISTEMA" abajo`
            ],
            indicacionesVisuales: `Estilo ${style}. Grabación en primer plano con iluminación suave de tres puntos. Subtítulos dinámicos de alto contraste, tipografía Outfit bold y transiciones de corte rápido en momentos de énfasis comercial.`,
            caption: `El algoritmo no premia el volumen vacío, premia la retención estratégica.\n\nDejar de improvisar es el primer paso para escalar tu marca. Mira este video y descubre la diferencia.\n\n#ReelsDeValor #AutomatizacionNotion #QawayLab`,
            hashtags: ['#MarketingEstrategico', '#ConsolaOrganica', '#QawayHub']
          }
        } else {
          // Post Individual
          resultData = {
            corePost: {
              problema: `El mito del contenido masivo y la consecuente pérdida de engagement.`,
              mensajeFuerza: `Es mejor tener 100 lectores altamente calificados educados por un sistema que 10,000 visitas frías que ignoran tu valor.`,
              cta: `Comenta si crees que la IA ha saturado tu sector y qué haces para diferenciarte.`
            },
            versionVisual: {
              estiloSeleccionado: style,
              concepto: `Una composición minimalista que muestra una balanza estilizada equilibrando la calidad de contenido con la cantidad masiva, favoreciendo el valor estructural.`,
              promptImagen: `Estilo ${style}. Fotografía editorial minimalista, una balanza de metal negro pulido sobre un fondo de cemento gris texturizado. En un lado de la balanza hay una pila de hojas en blanco desordenadas, en el otro una sola tarjeta dorada brillante perfectamente alineada. Iluminación lateral dramática, profundidad de campo baja, f/1.8.`
            },
            copy: `La saturación de contenido genérico ha creado un usuario inmune al spam. Hoy, publicar "3 tips para mejorar" ya no te diferencia.\n\nEl verdadero posicionamiento orgánico nace al descifrar el dolor central de tu público y atacarlo con un ángulo educativo profundo. No necesitas publicar más, necesitas estructurar mejor.\n\nNuestra propuesta en ${brand} se enfoca precisamente en eliminar el caos operativo.\n\n👇 ¿Sigues alguna estructura para tus posts? Cuéntanos en los comentarios.`,
            hilosComentarios: [
              `1/3 El 90% de las marcas comete el error de hablarle al público frío de la misma manera que al tibio, arruinando su tasa de conversión.`,
              `2/3 Para evitarlo, cada pieza debe orientarse a un nivel de conciencia específico. Capturar una tendencia no es copiarla, es adaptarla a tu marco de valor.`,
              `3/3 Si quieres ver cómo estructuramos este flujo completo paso a paso en nuestra consola, coméntame abajo.`
            ],
            hashtags: ['#QawayLab', '#LinkedInMarketing', '#EstrategiaInbound']
          }
        }

        resolve({
          success: true,
          format: format,
          style: style,
          data: resultData,
          timestamp: new Date().toISOString()
        })
      }, 1000)
    })
  }
}
