/**
 * ========================================================
 * PROMPT: INVESTIGACIÓN Y OPORTUNIDADES ORGÁNICAS
 * QAWAY CAMPAIGN CONSOLE
 * ========================================================
 */

export function getOrganicResearchPrompt(brief, diagnostico) {
  return `Actúa como un estratega de contenido y crecimiento orgánico de élite.
Basándote en el siguiente Brief Maestro y Diagnóstico Comercial, investiga y detecta tendencias, temas actuales y oportunidades estratégicas de posicionamiento que eduquen a la audiencia, generen autoridad o abran debate, evitando la venta directa.

CONTEXTO DEL BRIEF MAESTRO:
- Marca: ${brief?.marca || 'Marca Pro'}
- Producto/Servicio: ${brief?.productoServicio || 'Servicio Premium'}
- Oferta Principal: ${brief?.oferta || 'Oferta Principal'}
- Precio: ${brief?.precio || 'Variable'}
- Público Objetivo: ${brief?.publicoObjetivo || 'Público general'}
- Problema Principal: ${brief?.problemaPrincipal || 'Pérdida de impacto'}
- Deseo Principal: ${brief?.deseoPrincipal || 'Crecimiento estratégico'}
- Beneficios: ${JSON.stringify(brief?.beneficios || [])}
- Diferenciadores: ${JSON.stringify(brief?.diferenciadores || [])}
- Tono: ${brief?.tono || 'estratégico, directo'}
- Restricciones: ${JSON.stringify(brief?.restricciones || [])}

DIAGNÓSTICO COMERCIAL:
- Nivel de Conciencia: ${diagnostico?.nivelConciencia || brief?.nivelConciencia || 'Consciente del Problema'}
- Problema Central: ${diagnostico?.problemaCentral || 'Falta de consistencia y automatización'}
- Dolores Principales: ${JSON.stringify(diagnostico?.doloresPrincipales || [])}
- Deseo Profundo: ${diagnostico?.deseoProfundo || 'Crecimiento de negocio'}
- Objeciones: ${JSON.stringify(diagnostico?.objecionesComerciales || [])}
- Ángulo Estratégico: ${diagnostico?.anguloEstrategico || 'Eficiencia operativa extrema'}

TAREA:
Genera exactamente 4 oportunidades estratégicas de contenido orgánico de alto impacto. No deben ser ideas genéricas (como "organiza tu contenido"), sino ángulos creativos, profundos y sumamente específicos para el sector/producto.

Debes devolver obligatoriamente un JSON estructurado con el siguiente formato:
{
  "oportunidades": [
    {
      "id": "string-unico-1",
      "tituloOportunidad": "Título llamativo y retador de la oportunidad",
      "tendenciaDetectada": "La tendencia de mercado, debate actual, cambio tecnológico o educativo detectado",
      "porQueImporta": "Explicación detallada de por qué este tema conecta con el público actual",
      "relacionConLaOferta": "Cómo prepara mentalmente esta oportunidad al usuario para la oferta final, de forma indirecta",
      "riesgoDeContenidoBasico": "Qué error de contenido genérico comete la competencia en este tema y por qué debemos evitarlo",
      "anguloRecomendado": "El enfoque diferenciado y disruptivo que usaremos en la pieza",
      "formatosSugeridos": ["post", "carrusel", "reel", "historia"],
      "nivelImpacto": "alto" // "alto" o "medio" o "bajo"
    }
  ]
}`
}
