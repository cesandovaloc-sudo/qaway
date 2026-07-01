/**
 * ========================================================
 * PROMPT: GENERACIÓN DE SCRIPT PARA REEL/VIDEO CORTO
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

export function getOrganicReelPrompt(opportunity, estilo, brief, diagnostico) {
  return `Actúa como un estratega de contenido y copywriter elite de Qaway Lab.
Genera una pieza de contenido orgánico de alto impacto basada en una oportunidad estratégica de investigación, con un formato de REEL / VIDEO CORTO.

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
Genera un guion de video corto dinámico, ágil y de alta retención. Debe contener hook inicial, desarrollo segmentado en 3 escenas y cierre claro.

Devuelve obligatoriamente un JSON válido con esta estructura exacta:
{
  "coreReel": {
    "problema": "El síntoma o dolor que detona el video",
    "mensajeFuerza": "Mensaje principal a transmitir",
    "cta": "Llamado a la acción (ej. comenta abajo, lee el caption, etc.)"
  },
  "guion": {
    "hookInicial": "Frase de enganche de los primeros 3 segundos (ej. Si sigues haciendo X, vas a perder Y...)",
    "escena1": "Desarrollo escena 1: Presenta el problema con tensión o empatía",
    "escena2": "Desarrollo escena 2: Ofrece la solución de valor o el hack",
    "escena3": "Desarrollo escena 3: Explica por qué esto cambia las reglas del juego",
    "cierre": "Llamado a la acción conversacional (ej. Comenta si te ha pasado...)"
  },
  "textoEnPantalla": [
    "Texto Overlay 1 (Hook)",
    "Texto Overlay 2 (Paso clave)",
    "Texto Overlay 3 (CTA)"
  ],
  "indicacionesVisuales": "Instrucciones de actuación, encuadre de cámara, transiciones y ritmo del video",
  "caption": "Texto del post que acompaña al video (debe complementar el video)",
  "hashtags": ["#ReelsEstrategicos", "#VideoCorto", "#CreadoresDeContenido"]
}`
}
