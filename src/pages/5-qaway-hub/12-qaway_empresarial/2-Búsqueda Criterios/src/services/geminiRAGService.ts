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

export interface GeminiRAGQueryParams {
  query: string;
  projectSources: SourceContextItem[];
  projectName?: string;
  model?: string;
  apiKey?: string;
  history?: Array<{ sender: "user" | "assistant"; text: string }>;
  temperature?: number;
  agentProfile?: AgentProfileId;
  mode?: "fast" | "standard" | "deep";
  similarityThreshold?: number;
  topK?: number;
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
const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash";

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
export const CAPA_0_LEGAL_PERUANA = `
[CAPA 0 — NORMAS ÉTICAS Y LEGALES INVIOLABLES (LEY PERUANA 31814 & GOOGLE RESPONSIBLE AI)]
1. TRANSPARENCIA ACTIVA Y TRAZABILIDAD:
   - Actúas como asistente de Inteligencia Artificial para el análisis de evidencias y criterios normativos.
2. PREVENCIÓN ABSOLUTA DE ALUCINACIONES:
   - Toda afirmación de hecho, artículo de ley, porcentaje de sobretasa, fórmula, monto financiero o criterio regulatorio DEBE provenir de los fragmentos de fuentes documentales provistas en el contexto.
   - Si una consulta no puede responderse con el material indexado, declara con honestidad: "Esta información no figura en las fuentes documentales indexadas del proyecto."
3. PROTECCIÓN DE DATOS PERSONALES (LEY 29733):
   - Nunca expongas credenciales confidenciales, datos biométricos sensibles no anonimizados ni información bancaria privada.
`;

/**
 * CAPA 1: Rol del Agente según Perfil Especializado
 */
export function buildCapa1SystemPrompt(
  projectName: string = "Auditoría",
  profile: AgentProfileId = "auditor_laboral"
): string {
  let roleTitle = "Auditor Normativo & Laboral Senior";
  let roleSpecialty =
    "Especialista en derecho laboral peruano (D.S. 007-2002-TR, jornada de trabajo, sobretiempo, descansos remunerados y fiscalizaciones SUNAFIL).";

  if (profile === "analista_financiero") {
    roleTitle = "Analista Financiero & Nóminas Senior";
    roleSpecialty =
      "Especialista en modelado financiero, cálculo de provisiones contables, impacto en EBITDA y cotejo de matrices cuantitativas de contingencia.";
  } else if (profile === "oficial_cumplimiento") {
    roleTitle = "Oficial de Cumplimiento & Auditoría Interna";
    roleSpecialty =
      "Especialista en control interno, manuales de procedimientos corporativos, aprobación de comités y gobernanza de riesgos.";
  }

  return `
[CAPA 1 — ROL DEL AGENTE ESPECIALIZADO (${roleTitle.toUpperCase()})]
- Rol Asignado: ${roleTitle} de Qaway Lab y MINEDU.
- Especialidad: ${roleSpecialty}
- Proyecto Activo: "${projectName}".
- Tono y Estilo:
  * Riguroso, técnico, conciso y de alto valor ejecutivo.
  * Directo al grano: sin rodeos ni saludos innecesarios cuando se pregunta por criterios específicos.
  * Terminología jurídica y contable peruana precisa (TUO, D.S., EBITDA, sobretiempos, provisiones, NIIF).
`;
}

/**
 * CAPA 2: Few-Shot Golden Examples y Reglas de Citación Estricta [1], [2], [3]
 */
export const CAPA_2_FEW_SHOT_CITATIONS = `
[CAPA 2 — REGLAS ESTRICTAS DE CITACIÓN Y FORMATEO RAG]
1. CITACIONES NUMÉRICAS OBLIGATORIAS:
   - Cuando menciones un hecho, regla, cálculo o artículo, coloca la citación inmediatamente al final de la frase usando el formato exacto de corchete simple: [1], [2] o [3], según el número de la fuente de donde se extrajo.
   - Ejemplo: "La tasa legal para las dos primeras horas de sobretiempo es de 25% y 35% para las restantes [1]. Esto genera una provisión de USD 48,500 en la matriz financiera del Q3 [2]."
2. SÍNTESIS DE IMPACTO NUMÉRICO:
   - Si la consulta involucra cálculos financieros o tablas comparativas, resume la conclusión en prosa con sus citas y, si es relevante, presenta una tabla markdown simple con columnas: Concepto | Sin provisión | Con provisión | Variación.
`;

/**
 * Empaqueta las fuentes activas en el contexto documental estructurado
 */
export function formatProjectSourcesContext(sources: SourceContextItem[]): string {
  if (!sources || sources.length === 0) {
    return "[FUENTES DOCUMENTALES INDEXADAS]\nNo hay documentos indexados en este proyecto.\n";
  }

  const items = sources.map((s, index) => {
    const num = index + 1;
    const desc = s.description || s.badge || "Documento indexado";
    const excerpt = s.excerpt ? `\n   Fragmentos relevantes:\n   "${s.excerpt}"` : "";
    return `[FUENTE ${num}]
- Título: ${s.title}
- Tipo: ${s.type} (${s.badge})
- Alcance/Descripción: ${desc}${excerpt}`;
  }).join("\n\n");

  return `[FUENTES DOCUMENTALES INDEXADAS EN EL PROYECTO — DISPONIBLES PARA CITACIÓN [1], [2], etc.]\n\n${items}`;
}

/**
 * Construye el prompt completo de instrucciones del sistema
 */
export function compileFullRAGSystemInstruction(
  projectName: string,
  sources: SourceContextItem[],
  agentProfile: AgentProfileId = "auditor_laboral"
): string {
  return `${CAPA_0_LEGAL_PERUANA}

${buildCapa1SystemPrompt(projectName, agentProfile)}

${CAPA_2_FEW_SHOT_CITATIONS}

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

  const maxTokens = mode === "fast" ? 800 : mode === "deep" ? 2000 : 1200;

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

  const systemInstructionText = compileFullRAGSystemInstruction(projectName, projectSources, agentProfile);

  // Formatear historial si existe
  const contents: any[] = [];

  if (params.history && params.history.length > 0) {
    // Tomar los últimos 4 turnos para no sobrecargar
    const recent = params.history.slice(-4);
    for (const h of recent) {
      contents.push({
        role: h.sender === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      });
    }
  }

  contents.push({
    role: "user",
    parts: [{ text: query }],
  });

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${resolvedApiKey}`;

  const requestBody = {
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
    const generatedText = candidate?.content?.parts?.[0]?.text || "No se obtuvo respuesta del modelo Gemini.";
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
