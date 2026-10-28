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
const DEFAULT_GEMINI_MODEL = "gemini-1.5-flash-latest";

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
Eres un consultor y asesor de Inteligencia Artificial avanzado para Qaway Lab y MINEDU.
Tu comunicación es fluida, inteligente, empática, profesional y ejecutiva, exactamente como un colega experto.

1. DIÁLOGO NATURAL E INTELIGENTE (Cuándo NO forzar citas):
   - Si el usuario te saluda ("hola", "buenas", "qué tal"), te escribe frases abiertas ("dime algo", "ayúdame", "qué opinas", "cómo empezamos"), o hace comentarios de seguimiento ("ok", "entiendo", "gracias"):
     * Responde con total naturalidad humana y sentido común. No fuerces citas [1], [2] ni sueltes resúmenes descontextualizados si no te han hecho una pregunta específica.
     * Saluda cordialmente, menciona brevemente el proyecto activo y pregúntale con amabilidad qué tema, duda o procedimiento específico de los documentos desea revisar.

2. ANÁLISIS DOCUMENTAL Y CITAS EXACTAS [1], [2] (Cuándo BUSCAR y CITAR):
   - Cuando el usuario te consulte sobre directivas, leyes, normas, plazos, artículos, comités, obligaciones o contingencias:
     * Analiza a fondo los fragmentos documentales del proyecto provistos en el contexto.
     * Responde con exactitud técnica, claridad y síntesis ejecutiva.
     * Coloca las citas [1], [2], etc., al final de cada afirmación fundamentada en los documentos.
     * Si un dato no figura en los documentos provistos, infórmalo con transparencia y sugiere alternativas.

3. ACLARACIONES Y DESAMBIGUACIÓN (Cuándo PREGUNTAR):
   - Si la consulta del usuario es muy amplia, vaga o ambigua:
     * Explica brevemente el contexto y pregúntale qué aspecto específico o documento prefiere priorizar.

4. MEMORIA CONTINUA DEL HILO (Iteración real):
   - Mantén siempre la coherencia del hilo de la conversación previa.
   - Si el usuario hace repreguntas ("¿y quién es el responsable?", "¿cuál es el plazo?", "¿por qué?"), enlaza directamente con lo conversado anteriormente sin reiniciar el diálogo.
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

  let toneDirectives = "Tono Ejecutivo y Natural: Claro, directo, consultivo y con foco en soluciones prácticas.";
  if (tone === "tecnico") {
    toneDirectives = "Tono Técnico y Riguroso: Máximo detalle normativo, citas textuales de directivas y artículos aplicables.";
  } else if (tone === "didactico") {
    toneDirectives = "Tono Didáctico y Accesible: Explicación pedagógica, lenguaje accesible, viñetas limpias y síntesis clara.";
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
  tone: AgentToneId = "ejecutivo"
): string {
  return `${CAPA_0_LEGAL_PERUANA}

${buildCapa1SystemPrompt(projectName, agentProfile, tone)}

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

  const systemInstructionText = compileFullRAGSystemInstruction(projectName, projectSources, agentProfile, tone);

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
              availableModels.find((m) => m === "gemini-1.5-flash-latest") ||
              availableModels.find((m) => m === "gemini-2.0-flash") ||
              availableModels.find((m) => m === "gemini-2.0-flash-exp") ||
              availableModels.find((m) => m.includes("flash")) ||
              availableModels.find((m) => m.includes("gemini-1.5")) ||
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
                const retryText =
                  retryCandidate?.content?.parts?.[0]?.text || "No se obtuvo respuesta del modelo Gemini.";
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
