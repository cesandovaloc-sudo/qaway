/**
 * ========================================================
 * PROMPT: GENERACIÓN DE CARRUSEL ESTRUCTURADO ORGÁNICO
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

export function getOrganicCarouselPrompt(opportunity, estilo, brief, diagnostico) {
  return `Actúa como un estratega de contenido y copywriter elite de Qaway Lab.
Genera una pieza de contenido orgánico de alto impacto basada en una oportunidad estratégica de investigación, con un formato de CARRUSEL.

OPORTUNIDAD DE BASE:
- Título: ${opportunity?.tituloOportunidad}
- Tendencia: ${opportunity?.tendenciaDetectada}
- Ángulo Recomendado: ${opportunity?.anguloRecomendado}
- ¿Por qué importa?: ${opportunity?.porQueImporta}

DIRECTRICES DEL BRIEF Y DIAGNÓSTICO:
- Marca: ${brief?.marca}
- Producto/Servicio: ${brief?.productoServicio}
- Tono General: ${brief?.tono}
- Dolores del Cliente: ${JSON.stringify(diagnostico?.doloresPrincipales || [])}
- Estilo Visual Seleccionado: ${estilo} (Profesional Editorial, Creativo Natural o Alto Impacto)

TAREA:
Genera un carrusel completo y secuencial. Debe contener entre 4 y 6 slides reales:
- Slide 1: Portada (Scroll stopper con hook potente)
- Slides de desarrollo: Entregan el valor práctico paso a paso.
- Slide final: Cierre y CTA suave.

Devuelve obligatoriamente un JSON válido con esta estructura exacta:
{
  "coreCarrusel": {
    "problema": "Descripción del problema de fondo abordado",
    "mensajeFuerza": "Mensaje contundente y diferenciador de la marca",
    "cta": "Llamado a la acción suave para comentar o guardar"
  },
  "estructuraSlides": [
    {
      "slide": 1,
      "objetivo": "Objetivo de este slide (ej. Ganar atención, mantener curiosidad, etc.)",
      "textoPrincipal": "Frase de gancho principal en tipografía grande",
      "textoSecundario": "Cuerpo o explicación en tipografía secundaria",
      "indicacionVisual": "Instrucción de diseño visual para este slide específico"
    }
  ],
  "promptVisualGeneral": "Prompt general detallado para Midjourney o herramientas de diseño que describa la paleta de colores, tipografías y composición del carrusel",
  "copyCaption": "Caption persuasivo para acompañar el carrusel en redes sociales",
  "hashtags": ["#EstrategiaDeMarca", "#CarruselDigital", "#QawayLab"]
}`
}
