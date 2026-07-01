/**
 * ========================================================
 * PROMPT: GENERACIÓN DE POST INDIVIDUAL ORGÁNICO
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

export function getOrganicPostPrompt(opportunity, estilo, brief, diagnostico) {
  return `Actúa como un estratega de contenido y copywriter elite de Qaway Lab.
Genera una pieza de contenido orgánico de alto impacto basada en una oportunidad estratégica de investigación, con un formato de POST INDIVIDUAL.

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

INDICACIONES DEL ESTILO:
- Profesional Editorial: Limpio, premium, autoridad, jerarquía clara, estructurado.
- Creativo Natural: Humano, cercano, realista, cotidiano, sin fotos de stock falsas.
- Alto Impacto: Scroll stopper, frases potentes, tensión visual, contraste y composición memorable.

PAUTAS DE REDACCIÓN:
1. Queda prohibida la venta directa. El contenido debe educar, posicionar autoridad o abrir conversación en comentarios.
2. Si el estilo es "Alto Impacto", usa un hook impactante y contrastes potentes.
3. El copy principal puede ser conciso y apoyarse en una estrategia de comentarios/hilo.

Devuelve obligatoriamente un JSON válido con esta estructura exacta:
{
  "corePost": {
    "problema": "Descripción del problema de fondo abordado en la pieza",
    "mensajeFuerza": "Mensaje contundente y diferenciador de la marca",
    "cta": "Llamado a la acción suave para comentar, guardar o debatir"
  },
  "versionVisual": {
    "estiloSeleccionado": "${estilo}",
    "concepto": "Descripción conceptual de la imagen o diseño gráfico para redes",
    "promptImagen": "Prompt detallado y ultra-descriptivo para Midjourney o generador de imágenes"
  },
  "copy": "Copy principal persuasivo y formateado para redes, con emojis discretos y saltos de línea",
  "hilosComentarios": [
    "Comentario 1: Explicación de soporte o subtema para continuar la lectura",
    "Comentario 2: Segunda parte del desarrollo táctico",
    "Comentario 3: Pregunta detonadora de debate para los usuarios"
  ],
  "hashtags": ["#QawayLab", "#EstrategiaOrganica", "#MarketingProfesional"]
}`
}
