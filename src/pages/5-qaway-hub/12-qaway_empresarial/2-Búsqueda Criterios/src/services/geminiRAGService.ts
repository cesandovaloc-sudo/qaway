/**
 * ============================================================================
 * SERVICIO RAG AUTOCONTENIDO: GOOGLE GEMINI INFERENCE & PROMPT GOVERNANCE
 * Módulo: Búsqueda de Criterios (Qaway Lab & MINEDU)
 *
 * Arquitectura de Gobernanza Desacoplada (Cloudflare Pages Ready):
 * - Capa 0: Seguridad, Ética y Cumplimiento de la Ley Peruana Nº 31814 y Ley 29733.
 * - Capa 1: Auditor Normativo, Legal y Financiero de Alta Especialización.
 * - Capa 2: Few-Shot In-Context Learning con Citaciones Estrictas [1], [2], [3].
 * - Consumo REST Nativo: Zero dependencias npm externas para portabilidad total.
 * ============================================================================
 */

export interface SourceContextItem {
  id: string | number;
  title: string;
  type: string;
  badge: string;
  description: string;
  section?: string;
  tab?: number;
  excerpt?: string;
}

export type AgentProfileId = "auditor_laboral" | "analista_financiero" | "oficial_cumplimiento";
export type AgentToneId = "ejecutivo" | "tecnico" | "didactico";

export interface GeminiRAGQueryParams {
  query: string;
  projectSources: SourceContextItem[];
  projectName?: string;
  model?: string;
  apiKey?: string;
  history?: Array<{ sender: "user" | "assistant"; text: string }>;
  temperature?: number;
  agentProfile?: AgentProfileId;
  tone?: AgentToneId;
  mode?: "fast" | "standard" | "deep";
  similarityThreshold?: number;
  topK?: number;
  webSearch?: boolean;
  customDirectives?: string;
  image?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiRAGResponse {
  success: boolean;
  text: string;
  latencyMs: number;
  provider: string;
  model: string;
  citations: number[];
  tableData?: Array<{
    concept: string;
    sin: string;
    con: string;
    var: string;
    isNegative?: boolean;
  }>;
  error?: string;
  isMockFallback?: boolean;
}

const STORAGE_KEY_GEMINI_KEY = "qaway_gemini_api_key";
// Calibración Free Tier: gemini-2.0-flash ≈ 1.500 req/día (15 RPM) frente a las
// ~20 req/día de gemini-2.5-flash. Es el default institucional del chat.
const DEFAULT_GEMINI_MODEL = "gemini-2.0-flash";
const QUOTA_FALLBACK_MODEL = "gemini-2.0-flash";

/** "gemini-2.5-flash" → "Gemini 2.5 Flash" (para mensajes de cuota al usuario). */
function prettyModelName(model: string): string {
  return model
    .replace(/^gemini-([0-9.]+)/, "Gemini $1")
    .replace(/-flash$/, " Flash")
    .replace(/-pro$/, " Pro");
}

/**
 * Obtiene la API Key de Gemini desde almacenamiento local o variables de entorno
 */
export function getStoredGeminiApiKey(): string {
  try {
    const local = localStorage.getItem(STORAGE_KEY_GEMINI_KEY);
    if (local && local.trim()) return local.trim();
  } catch {
    // Entornos sin acceso a localStorage
  }

  // Fallback a Vite env si existe
  try {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && typeof envKey === "string" && envKey.trim()) return envKey.trim();
  } catch {
    // No env available
  }

  return "";
}

/**
 * Guarda la API Key de Gemini en el navegador para persistencia BYOK
 */
export function saveStoredGeminiApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
  } catch {
    console.warn("[GeminiRAG] No se pudo guardar la clave en localStorage");
  }
}

/**
 * CAPA 0: Core Ético, Legal y Prevención de Alucinaciones
 * Cumplimiento Ley Peruana Nº 31814 (Ley de IA) y Ley Nº 29733 (Datos Personales)
 */
/**
 * CAPA 0: Directrices Maestras de Inteligencia Conversacional, Ética y RAG
 * Cumplimiento Ley Peruana Nº 31814 (Ley de IA) y Google Responsible AI
 */
export const CAPA_0_LEGAL_PERUANA = `
[DIRECTRICES MAESTRAS DEL ASISTENTE INTELIGENTE]
Eres un consultor y asesor de IA de alto nivel para Qaway Lab y MINEDU. Te comunicas como un colega experto, cercano, ágil y empático; jamás como un contestador automático ni un bot rígido.

1. PROTOCOLO DE ANÁLISIS PROFUNDO PREVIO (VERIFICAR ANTES DE RESPONDER):
   - NUNCA respondas por inercia ni de forma superficial. Antes de redactar una sola línea:
     a) Revisa el hilo completo de la conversación para identificar con exactitud de qué documento, resolución o tema está hablando el usuario (ej. NO confundas la RM N° 0401-2008-ED del Banco del Libro con la RM N° 057-2026-MINEDU de Compromisos de Desempeño si la repregunta se refiere al turno anterior).
     b) Analiza todos los fragmentos documentales de las fuentes activas y contrasta fechas, artículos, numerales, vigencia, derogatorias y responsabilidades.
     c) Si la Búsqueda Web está activa, realiza una búsqueda rigurosa de la norma o documento específico, verifica su denominación oficial, fecha de publicación, estado de vigencia (o normas que la actualizaron/derogaron) y sintetiza el análisis antes de responder.

2. ECONOMÍA VERBAL, CALIDEZ Y CERO PREÁMBULOS ROBÓTICOS:
   - ESTRICTAMENTE PROHIBIDO usar aperturas acartonadas, defensivas o sermoneadoras como:
     * "Entiendo perfectamente tu punto y aprecio tu interés..."
     * "Comprendo tu solicitud y me dispongo a..."
     * "Como modelo de lenguaje / asistente..."
   - Responde de forma directa, fresca y humana desde la primera palabra.
   - Si el usuario bromea, te desafía con humor o hace comentarios informales ("cuéntame un chiste", "¿estás en piloto automático?", "hola", "qué tal"):
     * Responde con chispa, naturalidad y simpatía genuina.
     * NO metas con calzador un remate forzado como "Ahora bien, volviendo a la gestión institucional..." si el usuario no ha pedido volver al trabajo.
     * NUNCA agregues fuentes ni citas [1], [2] en interacciones conversacionales, saludos o bromas.

3. ANÁLISIS DOCUMENTAL Y CITAS EXACTAS [1], [2] (Cuándo BUSCAR y CITAR):
   - Activa el análisis de documentos y citas ÚNICAMENTE cuando el usuario pregunte por directivas, leyes, normas, plazos, artículos, comités, cálculos o procesos del proyecto local:
     * Responde con rigor técnico, síntesis ejecutiva y precisión analítica.
     * Coloca las citas [1], [2], etc., al final de cada afirmación fundamentada en los documentos provistos.
     * Si un dato no figura en los documentos provistos, dilo con franqueza y sugiere alternativas sin rodeos.
   - Si la consulta es sobre noticias del día, actualidad, programas de YouTube, podcasts o temas externos al proyecto:
     * NUNCA agregues citas [1], [2] de documentos del proyecto que no tengan relación con el tema solicitado.
     * Basa tu respuesta al 100% en los resultados frescos de Google Search Grounding y entrega los enlaces verificados.

4. ACLARACIONES Y DESAMBIGUACIÓN (Cuándo PREGUNTAR):
   - Si la consulta sobre el proyecto es muy amplia o ambigua, haz una pregunta breve y directa para orientar la búsqueda, sin discursos burocráticos.

5. MEMORIA CONTINUA DEL HILO (Iteración fluida):
   - Mantén la coherencia continua del hilo de conversación previa.
   - Si el usuario hace repreguntas ("¿y quién es el responsable?", "¿cuál es el plazo?", "verifica el link que me enviaste", "¿sigue vigente?"), enlaza directamente con el documento y tema exacto del turno inmediato anterior sin cambiar de norma por error.

6. PRIORIZACIÓN ESTRICTA DE BÚSQUEDA WEB Y CERO ENLACES ADIVINADOS (0% 404):
   - PROHIBICIÓN ABSOLUTA DE INFERIR, ADIVINAR O ARMAR URLs EN TU TEXTO:
     * NUNCA inventes números correlativos, slugs de normativas (ej. ".../normas-legales/12345-..."), ni enlaces con "?term=...".
     * Si la Búsqueda Web está activa, la ÚNICA fuente válida para enlaces externos es Google Search Grounding.
     * Si necesitas citar una norma o enlace web, prioriza siempre el portal oficial del organismo rector correspondiente (ej. MEF para presupuesto/finanzas, MINEDU para educación, El Peruano para leyes publicadas).
     * ESTRICTAMENTE PROHIBIDO añadir disculpas, explicaciones técnicas o paréntesis defensivos como:
       - "(Este enlace es un ejemplo, ya que el sistema no me permite...)"
       - "(Nota: no puedo generar URLs exactas...)"
       Redacta con total seguridad, aplomo y autoridad ejecutiva profesional.
   - GENERACIÓN DE CONSULTAS RESTRICTIVAS Y PRECISAS PARA GOOGLE SEARCH:
     * Para normas legales oficiales: genera consultas con el número completo, año y sitio oficial, ej: "Ley 32513 site:mef.gob.pe", "Resolución Ministerial 057-2026-MINEDU site:gob.pe", "site:elperuano.pe".
     * Para programas y canales de YouTube: "site:youtube.com/@canalYAAAAA", "Marco Sifuentes #LaEncerrona".
   - Si no obtienes un enlace verificado directo tras la búsqueda, dilo con honestidad ejecutiva: "No se encontró un enlace web verificado en línea para este documento", pero NUNCA inventes una URL para disimular.
   - Si la Búsqueda Web está desactivada y el usuario pide buscar información o enlaces en internet:
     * Indícale con claridad: "Este documento local no incluye el enlace web externo. Si deseas que lo busque y verifique en línea, activa el botón '🌐 Búsqueda Web' en la barra inferior del chat (o en Configuración > Motor RAG)."
   - Si el usuario adjunta una captura de pantalla (ej. error 404 o documento):
     * Analiza de inmediato la imagen adjunta, identifica qué documento o enlace falló según el turno anterior, corrige el dato con precisión sobre esa misma norma y no la confundas con otro documento del proyecto.

7. BÚSQUEDA WEB EN VIVO, PROGRAMAS DIARIOS Y NOTICIAS EN TIEMPO REAL:
   - Cuando la Búsqueda Web está activada (Google Search):
     * TIENES ACCESO PLENO A INTERNET Y GOOGLE SEARCH EN TIEMPO REAL.
     * ESTRICTAMENTE PROHIBIDO emitir negativas automatizadas o frases de modelo limitado como:
       - "Como soy una IA, no tengo acceso en tiempo real a transmisiones en vivo ni a contenidos al instante..."
       - "Mi información tiene un corte y no puedo navegar por la web en vivo..."
       - "No puedo buscar episodios de hoy ni videos en YouTube..."
     * Para programas y noticieros diarios en YouTube, medios o podcasts (ej. "La Encerrona" de Marco Sifuentes, RPP, etc.):
       - Los episodios matutinos (7:00 a.m.) NO suelen titularse con la fecha rígida del día (ej. no ponen "28 de octubre"), sino con el titular de la noticia del día y hashtags (ej. "Lanzan VIDEOJUEGO de Keiko y sus tap tap para TikTok #LaEncerrona").
       - Búsqueda a profundidad obligatoria: busca en el canal de YouTube (@canalYAAAAA, Marco Sifuentes), identifica el último video subido hoy, extrae su título exacto, explica de qué trata el episodio y entrega el enlace directo al video o a la sección de videos recientes del canal oficial (https://www.youtube.com/@canalYAAAAA/videos).
       - NUNCA digas que "no se ha subido" o "no existe" solo porque no viste la fecha textual en el título; revisa los temas subidos en las últimas horas del día.
`;

/**
 * CAPA 1: Rol del Agente según Perfil Especializado y Tono
 */
export function buildCapa1SystemPrompt(
  projectName: string = "Auditoría",
  profile: AgentProfileId = "auditor_laboral",
  tone: AgentToneId = "ejecutivo"
): string {
  let roleTitle = "Asesor Senior de Gestión y Normatividad";
  let roleSpecialty = "Especialista en análisis de evidencias normativas, directivas institucionales y optimización de procesos.";

  if (profile === "analista_financiero") {
    roleTitle = "Analista Financiero & Nóminas Senior";
    roleSpecialty = "Especialista en modelado financiero, cálculo de provisiones contables, matrices cuantitativas e impacto presupuestal.";
  } else if (profile === "oficial_cumplimiento") {
    roleTitle = "Oficial de Cumplimiento & Control Interno";
    roleSpecialty = "Especialista en control interno, manuales de procedimientos corporativos, aprobación de comités y gobernanza de riesgos.";
  }

  let toneDirectives = "Tono Ejecutivo y Colaborativo: Natural, directo, empático, sin preámbulos robóticos y con foco en soluciones prácticas.";
  if (tone === "tecnico") {
    toneDirectives = "Tono Técnico y Riguroso: Precisión normativa y citas exactas al analizar documentos, con redacción fluida y sin fórmulas mecánicas.";
  } else if (tone === "didactico") {
    toneDirectives = "Tono Didáctico y Cercano: Explicación amigable, síntesis pedagógica, viñetas limpias y conversación fluida sin tecnicismos innecesarios.";
  }

  return `
[CONTEXTO DE TRABAJO]
- Rol Asignado: ${roleTitle}
- Especialidad: ${roleSpecialty}
- Proyecto Activo: "${projectName}"
- Estilo: ${toneDirectives}
`;
}

/**
 * Empaqueta las fuentes activas en el contexto documental estructurado
 */
export function formatProjectSourcesContext(sources: SourceContextItem[]): string {
  if (!sources || sources.length === 0) {
    return "[FUENTES DOCUMENTALES DEL PROYECTO]\nNo hay documentos indexados en este proyecto.\n";
  }

  const items = sources.map((s, index) => {
    const num = index + 1;
    const desc = s.description || s.badge || "Documento indexado";
    const excerpt = s.excerpt && s.excerpt.trim() ? `\n   Fragmentos relevantes:\n   "${s.excerpt}"` : "";
    return `[FUENTE ${num}]
- Título: ${s.title}
- Tipo: ${s.type} (${s.badge})
- Descripción: ${desc}${excerpt}`;
  }).join("\n\n");

  return `[DOCUMENTOS DISPONIBLES EN EL PROYECTO — PARA CITACIÓN [1], [2], etc.]\n\n${items}`;
}

/**
 * Construye el prompt completo de instrucciones del sistema
 */
export function compileFullRAGSystemInstruction(
  projectName: string,
  sources: SourceContextItem[],
  agentProfile: AgentProfileId = "auditor_laboral",
  tone: AgentToneId = "ejecutivo",
  webSearchEnabled: boolean = false,
  customDirectives: string = ""
): string {
  const webStatusBanner = webSearchEnabled
    ? `[ESTADO OPERATIVO CRÍTICO: 🌐 BÚSQUEDA WEB EN TIEMPO REAL CONECTADA (GOOGLE SEARCH)]
ATENCIÓN MODELO: Tienes conexión directa y activa a Google Search en este turno.
ESTRICTAMENTE PROHIBIDO que respondas con frases como:
- "Como soy una IA, no tengo acceso en tiempo real a transmisiones en vivo..."
- "Mi información tiene un corte y no puedo navegar por la web en vivo..."
- "No puedo buscar el episodio exacto del día en YouTube..."
Si el usuario te pregunta por un programa de hoy (ej. La Encerrona de Marco Sifuentes), noticias recientes o enlaces:
1. EJECUTA DE INMEDIATO LA BÚSQUEDA WEB.
2. BÚSQUEDA INTELIGENTE DE CONTENIDOS AUDIOVISUALES: En YouTube y podcasts, los videos diarios casi nunca llevan la fecha escrita en el título, sino el titular temático del día (ej. en el canal @canalYAAAAA, Marco Sifuentes titula por el tema coyuntural + #LaEncerrona). Busca por el canal oficial (@canalYAAAAA, Marco Sifuentes), identifica el último video subido hoy, describe de qué trata y entrega el enlace directo al video o a https://www.youtube.com/@canalYAAAAA/videos.`
    : `[ESTADO OPERATIVO: BÚSQUEDA WEB DESACTIVADA]
Operando exclusivamente con los documentos locales indexados en el proyecto activo.`;

  const customDirectivesBlock =
    customDirectives && customDirectives.trim()
      ? `\n[DIRECTIVAS INSTITUCIONALES PERSONALIZADAS (REGLAS DEL USUARIO)]\n${customDirectives.trim()}\n`
      : "";

  return `${webStatusBanner}

${CAPA_0_LEGAL_PERUANA}

${buildCapa1SystemPrompt(projectName, agentProfile, tone)}
${customDirectivesBlock}
${formatProjectSourcesContext(sources)}
`;
}

/**
 * Extrae números de citaciones [1], [2] del texto generado
 */
export function extractCitations(text: string): number[] {
  const matches = text.match(/\[(\d+)\]/g);
  if (!matches) return [];
  const numbers = matches.map((m) => parseInt(m.replace(/\D/g, ""), 10));
  return Array.from(new Set(numbers)).filter((n) => !isNaN(n));
}

/**
 * Intenta extraer datos de tabla comparativa si el LLM generó una tabla Markdown
 */
export function extractMarkdownTable(text: string): Array<{ concept: string; sin: string; con: string; var: string; isNegative?: boolean }> | undefined {
  try {
    const lines = text.split("\n").map(l => l.trim()).filter(l => l.startsWith("|") && l.endsWith("|"));
    if (lines.length < 3) return undefined; // Header + Separator + At least 1 row

    // Verificar si es una tabla con 4 columnas aproximadas
    const dataRows = lines.slice(2);
    const result: Array<{ concept: string; sin: string; con: string; var: string; isNegative?: boolean }> = [];

    for (const row of dataRows) {
      const cols = row.split("|").map(c => c.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
      if (cols.length >= 4) {
        const varText = cols[3];
        const isNeg = varText.startsWith("-") || varText.toLowerCase().includes("reduc");
        result.push({
          concept: cols[0],
          sin: cols[1],
          con: cols[2],
          var: cols[3],
          isNegative: isNeg,
        });
      }
    }

    return result.length > 0 ? result : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Extrae el texto completo de todas las partes no-thought del candidato Gemini
 */
function extractCandidateText(candidate: any): string {
  const parts = candidate?.content?.parts;
  if (!Array.isArray(parts) || parts.length === 0) return "";
  const text = parts
    .filter((p: any) => typeof p?.text === "string" && !p?.thought)
    .map((p: any) => p.text)
    .join("");
  return text.trim();
}

/**
 * Asigna un título limpio, legible y representativo a cada enlace según su entidad
 */
function enhanceLinkTitle(uri: string, originalTitle: string): string {
  const cleanTitle = (originalTitle || "").trim();
  const lowerUri = uri.toLowerCase();

  const isGeneric =
    !cleanTitle ||
    cleanTitle.toLowerCase() === "enlace web verificado" ||
    cleanTitle.toLowerCase().startsWith("http") ||
    /^[\w.-]+\.(pe|com|org|gob|net)(\.pe)?$/i.test(cleanTitle);

  if (lowerUri.includes("mef.gob.pe") || lowerUri.includes("/institucion/mef/")) {
    return isGeneric ? "Ministerio de Economía y Finanzas (MEF) - Portal Oficial" : `${cleanTitle} (MEF)`;
  }
  if (lowerUri.includes("minedu.gob.pe") || lowerUri.includes("/institucion/minedu/")) {
    return isGeneric ? "Ministerio de Educación (MINEDU) - Portal Oficial" : `${cleanTitle} (MINEDU)`;
  }
  if (lowerUri.includes("elperuano.pe")) {
    return isGeneric ? "Diario Oficial El Peruano - Normas Legales" : cleanTitle;
  }
  if (lowerUri.includes("gob.pe")) {
    return isGeneric ? "Plataforma Digital Única del Estado Peruano (gob.pe)" : cleanTitle;
  }
  if (lowerUri.includes("lpderecho.pe")) {
    return isGeneric ? "LP Pasión por el Derecho (Portal Jurídico)" : cleanTitle;
  }
  if (lowerUri.includes("gacetajuridica.com.pe")) {
    return isGeneric ? "Gaceta Jurídica" : cleanTitle;
  }
  if (lowerUri.includes("larepublica.pe")) {
    return isGeneric ? "Diario La República (Prensa)" : cleanTitle;
  }
  if (lowerUri.includes("elcomercio.pe")) {
    return isGeneric ? "Diario El Comercio (Prensa)" : cleanTitle;
  }
  if (lowerUri.includes("gestion.pe")) {
    return isGeneric ? "Diario Gestión (Economía y Negocios)" : cleanTitle;
  }
  if (lowerUri.includes("rpp.pe")) {
    return isGeneric ? "RPP Noticias" : cleanTitle;
  }
  if (lowerUri.includes("youtube.com/@canalyaaaaa") || lowerUri.includes("canalyaaaaa")) {
    return isGeneric ? "Marco Sifuentes - La Encerrona en YouTube" : cleanTitle;
  }

  return cleanTitle || uri;
}

/**
 * Calcula el puntaje de autoridad oficial para que los portales del Estado (.gob.pe / sector consultado)
 * aparezcan siempre primero, y los diarios o medios periodísticos queden al final.
 */
function calculateLinkAuthorityScore(uri: string, queryContext: string = ""): number {
  const lowerUri = uri.toLowerCase();
  const lowerQ = queryContext.toLowerCase();
  let score = 50;

  // Detección contextual del sector consultado
  const isMef = /mef|presupuesto|econom[ií]a|finanzas|fiscal|tribut|uit|deuda/i.test(lowerQ);
  const isMinedu = /minedu|educaci[oó]n|colegio|docente|banco de libro|ugel|drelm/i.test(lowerQ);
  const isMinsa = /minsa|salud|hospital|digemid|m[eé]dico/i.test(lowerQ);
  const isMtpe = /mtpe|trabajo|laboral|sunafil|empleo/i.test(lowerQ);
  const isOsce = /osce|seace|contrataci[oó]n|licitaci[oó]n/i.test(lowerQ);

  // 1. MÁXIMA PRIORIDAD: Entidad rectora o ministerio específico consultado (Score +150)
  if (isMef && (lowerUri.includes("mef.gob.pe") || lowerUri.includes("/institucion/mef/"))) {
    score += 150;
  } else if (isMinedu && (lowerUri.includes("minedu.gob.pe") || lowerUri.includes("/institucion/minedu/"))) {
    score += 150;
  } else if (isMinsa && (lowerUri.includes("minsa.gob.pe") || lowerUri.includes("/institucion/minsa/"))) {
    score += 150;
  } else if (isMtpe && (lowerUri.includes("mtpe.gob.pe") || lowerUri.includes("/institucion/mtpe/") || lowerUri.includes("sunafil.gob.pe"))) {
    score += 150;
  } else if (isOsce && (lowerUri.includes("osce.gob.pe") || lowerUri.includes("seace.gob.pe"))) {
    score += 150;
  }

  // 2. ALTA PRIORIDAD: Portales Oficiales del Estado / Diario Oficial (Score +80)
  if (lowerUri.includes("gob.pe") || lowerUri.includes("elperuano.pe") || lowerUri.includes("spij.minjus.gob.pe")) {
    score += 80;
  }

  // 3. PRIORIDAD MEDIA-ALTA: Entidades públicas / Congreso / BCRP / Universidades (Score +30)
  if (lowerUri.includes(".edu.pe") || lowerUri.includes("congreso.gob.pe") || lowerUri.includes("bcrp.gob.pe")) {
    score += 30;
  }

  // 4. PRIORIDAD MEDIA: Portales jurídicos especializados de análisis (Score +10)
  if (lowerUri.includes("lpderecho.pe") || lowerUri.includes("gacetajuridica.com.pe") || lowerUri.includes("enfoquederecho.com")) {
    score += 10;
  }

  // 5. PRIORIDAD SECUNDARIA (AL FINAL): Prensa y medios periodísticos (Score -35)
  if (
    lowerUri.includes("larepublica.pe") ||
    lowerUri.includes("elcomercio.pe") ||
    lowerUri.includes("rpp.pe") ||
    lowerUri.includes("gestion.pe") ||
    lowerUri.includes("trome.pe") ||
    lowerUri.includes("infobae.com") ||
    lowerUri.includes("andina.pe")
  ) {
    score -= 35;
  }

  return score;
}

/**
 * Extrae y ordena los enlaces web reales verificados por Google Search Grounding:
 * Primero el portal del Estado / sector específico consultado (.gob.pe, MEF, etc.), y al final los diarios.
 */
function extractGroundingWebLinks(candidate: any, queryContext: string = ""): Array<{ title: string; uri: string }> {
  const chunks = candidate?.groundingMetadata?.groundingChunks;
  if (!Array.isArray(chunks)) return [];
  const seen = new Set<string>();
  const links: Array<{ title: string; uri: string }> = [];
  for (const chunk of chunks) {
    let uri = chunk?.web?.uri;
    let title = (chunk?.web?.title || "Enlace web verificado").trim();
    if (typeof uri === "string" && uri.startsWith("http")) {
      // Normalizar enlaces genéricos de YouTube a la pestaña de videos del canal si se menciona Marco Sifuentes / La Encerrona
      const lowerTitle = title.toLowerCase();
      const isGenericYoutube =
        uri === "https://www.youtube.com" ||
        uri === "https://youtube.com" ||
        uri === "https://www.youtube.com/" ||
        uri === "https://youtube.com/";
      if (
        isGenericYoutube &&
        (lowerTitle.includes("marco sifuentes") ||
          lowerTitle.includes("encerrona") ||
          lowerTitle.includes("canalya") ||
          lowerTitle.includes("sifuentes"))
      ) {
        uri = "https://www.youtube.com/@canalYAAAAA/videos";
        title = "Marco Sifuentes - Videos Recientes en YouTube";
      }

      // Descartar raíces genéricas sin contenido útil (ej. https://youtube.com pelado) si no tienen canal o video
      if (isGenericYoutube && uri.endsWith(".com")) {
        continue;
      }

      if (!seen.has(uri)) {
        seen.add(uri);
        links.push({
          title: enhanceLinkTitle(uri, title),
          uri,
        });
      }
    }
  }

  // Ordenar por nivel de autoridad: sector oficial (.gob.pe) primero, prensa y diarios al final
  links.sort((a, b) => calculateLinkAuthorityScore(b.uri, queryContext) - calculateLinkAuthorityScore(a.uri, queryContext));

  return links;
}

/**
 * Normaliza una URI para comparación robusta ignorando protocolos y barras finales
 */
function normalizeUriForComparison(uri: string): string {
  try {
    const parsed = new URL(uri);
    return `${parsed.hostname}${parsed.pathname}`.replace(/\/+$/, "").toLowerCase();
  } catch {
    return uri.replace(/^https?:\/\//i, "").replace(/\/+$/, "").toLowerCase();
  }
}

/**
 * Enriquecer la respuesta con los enlaces reales de Google Search Grounding,
 * priorizando fuentes gubernamentales del sector (.gob.pe) y validando que NINGUNA URL rota pase al usuario.
 */
function enrichTextWithGroundingLinks(
  rawText: string,
  candidate: any,
  isWebSearchActive = true,
  queryContext = ""
): string {
  if (!rawText) return "No se obtuvo respuesta del modelo Gemini.";
  const groundingLinks = extractGroundingWebLinks(candidate, queryContext);
  const verifiedUris = new Set(groundingLinks.map((l) => normalizeUriForComparison(l.uri)));
  const primaryVerifiedUri = groundingLinks.length > 0 ? groundingLinks[0].uri : "";

  // 1. Sanitizar enlaces Markdown [Texto](url): validar contra las URLs reales devueltas por Google Grounding
  let cleanedText = rawText.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (fullMatch, label, url) => {
      const norm = normalizeUriForComparison(url);

      // Si la URL fue explícitamente verificada por Google Search Grounding, es 100% segura
      if (verifiedUris.has(norm)) {
        return fullMatch;
      }

      // Si es un dominio institucional o multimedia donde los LLMs suelen alucinar slugs (gob.pe, minedu, elperuano, youtube)
      const isSensitiveDomain = /gob\.pe|minedu\.gob\.pe|elperuano\.pe|youtube\.com|youtu\.be/i.test(url);
      if (isSensitiveDomain) {
        if (primaryVerifiedUri) {
          return `[${label}](${primaryVerifiedUri})`;
        } else {
          return `**${label}** *(enlace web no verificado en línea)*`;
        }
      }

      // Si la búsqueda web está activa y Google nos dio enlaces reales, redirigir al enlace prioritario oficial
      if (isWebSearchActive && primaryVerifiedUri) {
        return `[${label}](${primaryVerifiedUri})`;
      }

      // Si no hay verificación web en vivo, no permitir enlaces externos dudosos
      if (!isWebSearchActive) {
        return `**${label}** *(enlace externo)*`;
      }

      return fullMatch;
    }
  );

  // 2. Limpiar URLs directas sueltas con ?term= o slugs genéricos
  cleanedText = cleanedText.replace(
    /https?:\/\/www\.gob\.pe\/institucion\/minedu\/normas-legales\?term=[^\s)\]]+/gi,
    primaryVerifiedUri || "https://www.gob.pe/institucion/minedu/normas-legales"
  );

  // 3. Adjuntar bloque de enlaces verificados de Google Search ordenados (portal del sector primero, prensa al final)
  if (groundingLinks.length > 0) {
    const missingLinks = groundingLinks.filter((l) => !cleanedText.includes(l.uri)).slice(0, 4);
    if (missingLinks.length > 0) {
      const formattedLinks = missingLinks
        .map((l) => `- [${l.title}](${l.uri})`)
        .join("\n");
      cleanedText = `${cleanedText.trim()}\n\n**🌐 Enlaces directos verificados (Google Search):**\n${formattedLinks}`;
    }
  }

  return cleanedText;
}

/**
 * Ejecuta una consulta RAG contra la API de Google Gemini (v1beta REST)
 */
export async function queryGeminiRAG(params: GeminiRAGQueryParams): Promise<GeminiRAGResponse> {
  const startTime = performance.now();
  const {
    query,
    projectSources,
    projectName = "Auditoría Q3",
    model = DEFAULT_GEMINI_MODEL,
    agentProfile = "auditor_laboral",
    tone = "ejecutivo",
    mode = "standard",
  } = params;

  const resolvedTemp =
    params.temperature !== undefined
      ? params.temperature
      : mode === "fast"
      ? 0.1
      : mode === "deep"
      ? 0.25
      : 0.2;

  const maxTokens = mode === "fast" ? 1200 : mode === "deep" ? 3200 : 2048;

  const resolvedApiKey = (params.apiKey && params.apiKey.trim()) || getStoredGeminiApiKey();

  // Si no hay API Key configurada, informamos de forma amigable
  if (!resolvedApiKey) {
    return {
      success: false,
      text: "",
      latencyMs: Math.round(performance.now() - startTime),
      provider: "Google Gemini",
      model,
      citations: [],
      error: "API_KEY_MISSING",
      isMockFallback: true,
    };
  }

  const systemInstructionText = compileFullRAGSystemInstruction(
    projectName,
    projectSources,
    agentProfile,
    tone,
    Boolean(params.webSearch),
    params.customDirectives || ""
  );

  // Formatear historial de iteración conversacional compatible con Gemini v1beta
  const contents: any[] = [];

  if (params.history && params.history.length > 0) {
    // Tomar los turnos recientes para contexto
    const recent = params.history.slice(-8);
    let firstUserFound = false;
    let lastRole: string | null = null;

    for (const h of recent) {
      if (!h.text || !h.text.trim()) continue;
      const role = h.sender === "user" ? "user" : "model";

      // Gemini exige estrictamente que el primer turno sea 'user'
      if (!firstUserFound) {
        if (role !== "user") continue; // Descartar saludos iniciales del modelo
        firstUserFound = true;
      }

      // Evitar turnos consecutivos del mismo rol
      if (role === lastRole) {
        if (contents.length > 0) {
          contents[contents.length - 1].parts[0].text += `\n${h.text}`;
        }
        continue;
      }

      contents.push({
        role,
        parts: [{ text: h.text }],
      });
      lastRole = role;
    }

    // Si el último turno del historial fue 'user', concatenarlo o removerlo para que el query actual sea el 'user' final
    if (contents.length > 0 && contents[contents.length - 1].role === "user") {
      contents.pop();
    }
  }

  // Consulta actual del usuario como turno activo
  const userParts: any[] = [{ text: query }];
  if (params.image && params.image.data) {
    userParts.push({
      inline_data: {
        mime_type: params.image.mimeType || "image/png",
        data: params.image.data,
      },
    });
  }
  contents.push({
    role: "user",
    parts: userParts,
  });

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${resolvedApiKey}`;

  const requestBody: any = {
    system_instruction: {
      parts: [{ text: systemInstructionText }],
    },
    contents,
    generationConfig: {
      temperature: resolvedTemp,
      topP: 0.95,
      maxOutputTokens: maxTokens,
    },
  };

  if (params.webSearch) {
    requestBody.tools = [{ google_search: {} }];
  }

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      const errMsg = errorData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error("[GeminiRAG] Error en respuesta de Gemini API:", errMsg);

      // ── Cuota del Free Tier excedida (429): conmutación transparente ──
      // Gemini 2.5 Flash: ~20 req/día · Gemini 2.0 Flash: ~1.500 req/día (15 RPM).
      const quotaTriggered =
        response.status === 429 || /quota|exceeded|exhausted/i.test(errMsg);
      if (quotaTriggered && model !== QUOTA_FALLBACK_MODEL) {
        try {
          console.warn(
            "[GeminiRAG] Cuota del modelo seleccionado agotada; conmutando en transparente a gemini-2.0-flash…"
          );
          const quotaEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${QUOTA_FALLBACK_MODEL}:generateContent?key=${resolvedApiKey}`;
          const quotaResp = await fetch(quotaEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          });
          if (quotaResp.ok) {
            const quotaData = await quotaResp.json();
            const quotaCandidate = quotaData.candidates?.[0];
            const rawQuotaText =
              extractCandidateText(quotaCandidate) ||
              "No se obtuvo respuesta del modelo Gemini.";
            const quotaText = enrichTextWithGroundingLinks(
              rawQuotaText,
              quotaCandidate,
              Boolean(params.webSearch),
              query
            );
            return {
              success: true,
              text: quotaText,
              latencyMs: Math.round(performance.now() - startTime),
              provider: "Google Gemini",
              model: QUOTA_FALLBACK_MODEL,
              citations: extractCitations(quotaText),
              tableData: extractMarkdownTable(quotaText),
            };
          }
        } catch (quotaErr) {
          console.warn("[GeminiRAG] Fallback transparente por cuota falló:", quotaErr);
        }
        return {
          success: false,
          text: `Has alcanzado la cuota de prueba de ${prettyModelName(model)} (20 consultas/día en Free Tier). Conmuta a Gemini 2.0 Flash en Configuración para disfrutar de 1,500 consultas diarias gratuitas.`,
          latencyMs: elapsed,
          provider: "Google Gemini",
          model,
          citations: [],
          error: errMsg,
        };
      }

      // Auto-recuperación si el modelo no está disponible en la versión de API
      if (response.status === 404 || errMsg.toLowerCase().includes("not found")) {
        try {
          const listEndpoint = `https://generativelanguage.googleapis.com/v1beta/models?key=${resolvedApiKey}`;
          const listResp = await fetch(listEndpoint);
          if (listResp.ok) {
            const listData = await listResp.json();
            const availableModels: string[] = (listData.models || [])
              .filter((m: any) => m.supportedGenerationMethods?.includes("generateContent"))
              .map((m: any) => m.name.replace(/^models\//, ""));

            const fallbackModel =
              availableModels.find((m) => m !== model && m === "gemini-2.0-flash") ||
              availableModels.find((m) => m !== model && m === "gemini-2.5-flash") ||
              availableModels.find((m) => m !== model && m === "gemini-1.5-flash") ||
              availableModels.find((m) => m !== model && m === "gemini-1.5-flash-latest") ||
              availableModels.find((m) => m !== model && m.includes("flash")) ||
              availableModels.find((m) => m !== model && m.includes("gemini-2")) ||
              availableModels.find((m) => m !== model) ||
              availableModels[0];

            if (fallbackModel && fallbackModel !== model) {
              console.log(`[GeminiRAG] Auto-reintentando con modelo compatible: ${fallbackModel}`);
              const retryEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${fallbackModel}:generateContent?key=${resolvedApiKey}`;
              const retryResp = await fetch(retryEndpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
              });

              if (retryResp.ok) {
                const retryData = await retryResp.json();
                const retryCandidate = retryData.candidates?.[0];
                const rawRetryText =
                  extractCandidateText(retryCandidate) || "No se obtuvo respuesta del modelo Gemini.";
                const retryText = enrichTextWithGroundingLinks(rawRetryText, retryCandidate, Boolean(params.webSearch), query);
                return {
                  success: true,
                  text: retryText,
                  latencyMs: Math.round(performance.now() - startTime),
                  provider: "Google Gemini",
                  model: fallbackModel,
                  citations: extractCitations(retryText),
                  tableData: extractMarkdownTable(retryText),
                };
              }
            }
          }
        } catch (autoErr) {
          console.warn("[GeminiRAG] No se pudo ejecutar auto-descubrimiento de modelos:", autoErr);
        }
      }

      return {
        success: false,
        text: `Error al consultar Google Gemini (${errMsg}). Por favor verifica tu API Key o conexión.`,
        latencyMs: elapsed,
        provider: "Google Gemini",
        model,
        citations: [],
        error: errMsg,
      };
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];
    const rawGeneratedText = extractCandidateText(candidate) || "No se obtuvo respuesta del modelo Gemini.";
    const generatedText = enrichTextWithGroundingLinks(rawGeneratedText, candidate, Boolean(params.webSearch), query);
    const citations = extractCitations(generatedText);
    const tableData = extractMarkdownTable(generatedText);

    return {
      success: true,
      text: generatedText,
      latencyMs: elapsed,
      provider: "Google Gemini",
      model,
      citations,
      tableData,
    };
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - startTime);
    console.error("[GeminiRAG] Excepción en fetch:", err);
    return {
      success: false,
      text: `Error de red al conectar con Google Gemini: ${err.message || String(err)}`,
      latencyMs: elapsed,
      provider: "Google Gemini",
      model,
      citations: [],
      error: err.message || String(err),
    };
  }
}
