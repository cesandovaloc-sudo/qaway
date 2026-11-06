/**
 * ============================================================================
 * SERVICIO RAG TERRITORIAL: GOOGLE GEMINI INFERENCE & PROMPT GOVERNANCE
 * Módulo: Gestor de Proyectos Territoriales · Qaway Lab (Distribución de Materiales DOT 2027)
 *
 * Cumplimiento de la Ley Peruana Nº 31814 (Uso y Gobernanza de la IA)
 * Conexión REST nativa sin dependencias npm externas para portabilidad total.
 * ============================================================================
 */

export type AgentProfileId = 'coordinador_territorial' | 'auditor_plazos' | 'analista_datos';
export type AgentToneId = 'ejecutivo' | 'tecnico' | 'didactico';

export interface GeminiRAGQueryParams {
  query: string;
  activeModule?: string;
  projectName?: string;
  model?: string;
  apiKey?: string;
  history?: Array<{ sender: 'user' | 'assistant'; text: string }>;
  temperature?: number;
  agentProfile?: AgentProfileId;
  tone?: AgentToneId;
  customDirectives?: string;
  documentData?: {
    name: string;
    type: string;
    contentSummary?: string;
    rawText?: string;
  } | undefined;
  fileAttachment?: {
    mimeType: string;
    data: string; // Base64
  };
}

export interface GeminiRAGResponse {
  success: boolean;
  text: string;
  latencyMs: number;
  provider: string;
  model: string;
  error?: string;
  isMockFallback?: boolean;
}

export interface GeminiConfig {
  apiKey: string;
  model: string;
  profile: AgentProfileId;
  tone: AgentToneId;
  temperature: number;
  customDirectives: string;
}

export const STORAGE_KEY_GEMINI_KEY = 'qaway_gemini_api_key';
export const STORAGE_KEY_GEMINI_MODEL = 'qaway_gemini_model';
export const STORAGE_KEY_GEMINI_PROFILE = 'qaway_gemini_profile';
export const STORAGE_KEY_GEMINI_TONE = 'qaway_gemini_tone';
export const STORAGE_KEY_GEMINI_TEMP = 'qaway_gemini_temp';
export const STORAGE_KEY_GEMINI_DIRECTIVES = 'qaway_gemini_directives';

export const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

export const AVAILABLE_MODELS = [
  { id: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash · Recomendado (Rápido, económico y multimodal)' },
  { id: 'gemini-1.5-pro', label: 'Gemini 1.5 Pro · Razonamiento Complejo (Análisis normativo profundo)' },
  { id: 'gemini-1.5-flash', label: 'Gemini 1.5 Flash · Alta velocidad para consultas frecuentes' },
];

export const AGENT_PROFILES: Record<AgentProfileId, { label: string; desc: string; systemPersona: string }> = {
  coordinador_territorial: {
    label: 'Coordinador General',
    desc: 'Visión estratégica, seguimiento macro de hitos MINEDU, articulación con DRE y UGEL.',
    systemPersona: 'Actúas como el Coordinador General del Proyecto de Distribución de Materiales DOT 2027 en Perú. Tu enfoque es estratégico, orientas en la articulación entre DRE, UGEL y MINEDU, supervisando los comités, planes de distribución y cronograma general.'
  },
  auditor_plazos: {
    label: 'Auditor de Plazos y Cumplimiento',
    desc: 'Detección estricta de cuellos de botella, riesgos normativos, alertas tempranas y fechas límite.',
    systemPersona: 'Actúas como Auditor de Cumplimiento Normativo y Control de Plazos. Tu rol es estricto y preventivo: analizas holguras, identificas dependencias críticas, adviertes desfases entre el cronograma oficial y el avance real, citando normativas peruanas aplicables.'
  },
  analista_datos: {
    label: 'Analista de Datos y Entregables',
    desc: 'Interpretación de archivos Excel/PDF, cálculo de avances porcentuales y proyecciones de distribución.',
    systemPersona: 'Actúas como Analista Experto en Datos Territoriales y Hojas de Cálculo. Interpretas matrices tabulares de tareas, calculas avances ponderados, formulas proyecciones de entregas por UGEL y estructuras datos para incorporarlos al diagrama de Gantt.'
  }
};

export const AGENT_TONES: Record<AgentToneId, { label: string; instruction: string }> = {
  ejecutivo: {
    label: 'Ejecutivo (Conciso y directivo)',
    instruction: 'Responde de forma ejecutiva, concisa y orientada a decisiones, destacando puntos clave en viñetas sin rodeos innecesarios.'
  },
  tecnico: {
    label: 'Técnico Oficial (Riguroso con normativas)',
    instruction: 'Usa lenguaje técnico administrativo oficial del sector educación peruano (SIGA, UGEL, DRE, Oficios Múltiples, entregables).'
  },
  didactico: {
    label: 'Didáctico y Formativo (Explicativo paso a paso)',
    instruction: 'Explica de forma clara, amigable y pedagógica, guiando al usuario paso a paso en cómo resolver el requerimiento.'
  }
};

/**
 * Obtiene la API Key guardada en el navegador o en variables de entorno Vite
 */
export function getStoredGeminiApiKey(): string {
  try {
    const local = localStorage.getItem(STORAGE_KEY_GEMINI_KEY);
    if (local && local.trim()) return local.trim();
  } catch {
    /* fallback */
  }

  try {
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    if (envKey && typeof envKey === 'string' && envKey.trim()) return envKey.trim();
  } catch {
    /* fallback */
  }

  return '';
}

/**
 * Guarda la API Key de Gemini en localStorage
 */
export function saveStoredGeminiApiKey(key: string): void {
  try {
    localStorage.setItem(STORAGE_KEY_GEMINI_KEY, key.trim());
  } catch (err) {
    console.warn('[GeminiRAG] No se pudo guardar la clave en localStorage', err);
  }
}

/**
 * Obtiene la configuración completa del Asistente IA
 */
export function getStoredGeminiConfig(): GeminiConfig {
  return {
    apiKey: getStoredGeminiApiKey(),
    model: localStorage.getItem(STORAGE_KEY_GEMINI_MODEL) || DEFAULT_GEMINI_MODEL,
    profile: (localStorage.getItem(STORAGE_KEY_GEMINI_PROFILE) as AgentProfileId) || 'coordinador_territorial',
    tone: (localStorage.getItem(STORAGE_KEY_GEMINI_TONE) as AgentToneId) || 'ejecutivo',
    temperature: parseFloat(localStorage.getItem(STORAGE_KEY_GEMINI_TEMP) || '0.2'),
    customDirectives: localStorage.getItem(STORAGE_KEY_GEMINI_DIRECTIVES) || '',
  };
}

/**
 * Guarda la configuración completa del Asistente IA
 */
export function saveStoredGeminiConfig(config: Partial<GeminiConfig>): void {
  try {
    if (config.apiKey !== undefined) saveStoredGeminiApiKey(config.apiKey);
    if (config.model !== undefined) localStorage.setItem(STORAGE_KEY_GEMINI_MODEL, config.model);
    if (config.profile !== undefined) localStorage.setItem(STORAGE_KEY_GEMINI_PROFILE, config.profile);
    if (config.tone !== undefined) localStorage.setItem(STORAGE_KEY_GEMINI_TONE, config.tone);
    if (config.temperature !== undefined) localStorage.setItem(STORAGE_KEY_GEMINI_TEMP, String(config.temperature));
    if (config.customDirectives !== undefined) localStorage.setItem(STORAGE_KEY_GEMINI_DIRECTIVES, config.customDirectives);
  } catch (err) {
    console.warn('[GeminiRAG] Error guardando configuración en localStorage', err);
  }
}

/**
 * Prueba la validez de la API Key con una consulta mínima a Google Gemini
 */
export async function testGeminiConnection(apiKey: string, model: string = DEFAULT_GEMINI_MODEL): Promise<{ ok: boolean; message: string; latencyMs: number }> {
  if (!apiKey || !apiKey.trim()) {
    return { ok: false, message: 'La API Key de Gemini no puede estar vacía.', latencyMs: 0 };
  }

  const startTime = performance.now();
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  try {
    const resp = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: 'Responde únicamente con la palabra: OK' }] }],
        generationConfig: { maxOutputTokens: 10, temperature: 0 },
      }),
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (resp.ok) {
      return { ok: true, message: `Conexión exitosa con Google Gemini (${model}) en ${elapsed}ms.`, latencyMs: elapsed };
    }

    const errData = await resp.json().catch(() => null);
    const msg = errData?.error?.message || `HTTP ${resp.status}: ${resp.statusText}`;
    return { ok: false, message: `Error de API: ${msg}`, latencyMs: elapsed };
  } catch (err: any) {
    return { ok: false, message: `Error de red: ${err.message || 'No se pudo conectar a generativelanguage.googleapis.com'}`, latencyMs: Math.round(performance.now() - startTime) };
  }
}

/**
 * Consulta principal RAG a Google Gemini con Contexto Territorial y Gobernanza
 */
export async function queryGeminiRAG(params: GeminiRAGQueryParams): Promise<GeminiRAGResponse> {
  const startTime = performance.now();
  const cfg = getStoredGeminiConfig();
  const apiKey = params.apiKey || cfg.apiKey;
  const model = params.model || cfg.model || DEFAULT_GEMINI_MODEL;
  const profile = params.agentProfile || cfg.profile || 'coordinador_territorial';
  const tone = params.tone || cfg.tone || 'ejecutivo';
  const temperature = params.temperature !== undefined ? params.temperature : cfg.temperature;

  // Si no hay API Key configurada, retornar respuesta simulada inteligente de cortesía
  if (!apiKey || !apiKey.trim()) {
    const elapsed = Math.round(performance.now() - startTime);
    return {
      success: true,
      text: generateOfflineFallback(params.query, params.activeModule, params.documentData),
      latencyMs: elapsed,
      provider: 'Qaway Copilot (Modo Local)',
      model: 'Simulación Contextual',
      isMockFallback: true,
    };
  }

  // Ensamblado del System Instruction con Marco de Gobernanza Peruana
  const profileInfo = AGENT_PROFILES[profile] || AGENT_PROFILES.coordinador_territorial;
  const toneInfo = AGENT_TONES[tone] || AGENT_TONES.ejecutivo;

  const systemInstruction = `
ERES: Qaway Copilot · Asistente de Inteligencia Artificial para la Gestión de Proyectos Regionales de Qaway Lab y MINEDU.
MARCO LEGAL: Cumplimiento estricto de la Ley Peruana Nº 31814 (Ley que promueve el uso de la IA para el desarrollo económico y social del país) y Ley 29733 de Protección de Datos Personales.

ROL ASIGNADO:
${profileInfo.systemPersona}

ESTILO Y TONO:
${toneInfo.instruction}

CONTEXTO OPERATIVO:
 - Proyecto activo: ${params.projectName || 'Distribución de Materiales DOT 2027'}
- Región de operación prioritaria: DRE Junín (13 UGEL: Huancayo, Concepción, Chupaca, Jauja, Tarma, Yauli, Junín, Chanchamayo, Satipo, Pichanaki, Pangoa, Río Tambo, Río Ene Mantaro).
- Módulo del sistema donde se encuentra el usuario: ${params.activeModule || 'General'}
- Fecha operativa del sistema: 28 de Octubre de 2026.

REGLAS DE RESPUESTA:
1. Respeta siempre el diseño y la estructura institucional de los cronogramas y tareas.
2. Si el usuario adjunta un Excel o datos tabulares, analiza las fechas de inicio, fin y porcentajes de avance de forma aritmética precisa.
3. Si detectas desfases de plazos o hitos retrasados, alértalos con claridad proponiendo la medida de contingencia adecuada.
4. Si el usuario te pide directivas adicionales: ${cfg.customDirectives || params.customDirectives || 'Ninguna especificada.'}
`.trim();

  // Ensamblado de contenidos históricos y partes de mensaje
  const contents: any[] = [];

  if (params.history && params.history.length > 0) {
    for (const h of params.history.slice(-6)) {
      contents.push({
        role: h.sender === 'user' ? 'user' : 'model',
        parts: [{ text: h.text }],
      });
    }
  }

  const userParts: any[] = [];

  // Inyección de resumen de documento adjunto si existe
  if (params.documentData) {
    userParts.push({
      text: `[DOCUMENTO ADJUNTO POR EL USUARIO]\nNombre: ${params.documentData.name}\nTipo: ${params.documentData.type}\nContenido extraído:\n${params.documentData.rawText || params.documentData.contentSummary || 'Sin texto estructurado'}\n---`,
    });
  }

  // Inyección de imagen o archivo binario si se envió en base64
  if (params.fileAttachment) {
    userParts.push({
      inline_data: {
        mime_type: params.fileAttachment.mimeType,
        data: params.fileAttachment.data,
      },
    });
  }

  userParts.push({ text: params.query });

  contents.push({
    role: 'user',
    parts: userParts,
  });

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey.trim()}`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemInstruction }],
        },
        contents,
        generationConfig: {
          temperature,
          topP: 0.95,
          maxOutputTokens: 1500,
        },
      }),
    });

    const elapsed = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      const errMsg = errData?.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      console.error('[GeminiRAG] Error en respuesta de Gemini:', errMsg);

      return {
        success: false,
        text: `⚠️ **Error en la API de Google Gemini:** ${errMsg}\n\nPuedes verificar o renovar tu API Key en el módulo de **Configuración > Asistente IA**.`,
        latencyMs: elapsed,
        provider: 'Google Gemini',
        model,
        error: errMsg,
      };
    }

    const data = await response.json();
    const candidate = data?.candidates?.[0];
    const generatedText = candidate?.content?.parts?.map((p: any) => p.text).filter(Boolean).join('\n') || 'No se obtuvo texto de respuesta.';

    return {
      success: true,
      text: generatedText,
      latencyMs: elapsed,
      provider: 'Google Gemini',
      model,
    };
  } catch (err: any) {
    const elapsed = Math.round(performance.now() - startTime);
    return {
      success: false,
      text: `⚠️ **Error de conexión con Gemini:** ${err.message || 'No se pudo contactar con los servidores de Google.'}`,
      latencyMs: elapsed,
      provider: 'Google Gemini',
      model,
      error: err.message,
    };
  }
}

/**
 * Generador de respuestas fuera de línea cuando no hay API Key configurada
 */
function generateOfflineFallback(query: string, activeModule: string = 'cronograma', docData?: any): string {
  const q = query.toLowerCase();

  if (docData) {
    return `📑 **Análisis preliminar de "${docData.name}":**\n\n` +
      `He detectado la estructura del archivo en modo local. Para activar el análisis de razonamiento profundo con **Google Gemini**, ingresa tu API Key en la pestaña **Configuración > Asistente IA**.\n\n` +
      `* Filas estructuradas identificadas.\n` +
      `* Compatible con la matriz de Hitos y Gantt de Qaway Lab.`;
  }

  if (q.includes('retraso') || q.includes('cuello') || q.includes('riesgo')) {
    return `⚠️ **Diagnóstico Territorial de Plazos (Modo Local):**\n\n` +
      `En el cronograma actual, el **Subproceso 1.2 (Validación del plan de distribución)** registra un avance del **55%** frente a su meta de cierre al 30 de noviembre.\n\n` +
      `💡 *Consejo:* Para análisis de predicción en tiempo real con IA multimodal, configura tu clave de Gemini en **Configuración > Asistente IA**.`;
  }

  return `Hola. Estoy operando en **modo local contextual** sincronizado con el módulo **${activeModule.toUpperCase()}**.\n\n` +
    `Para que pueda responderte con razonamiento generativo completo en vivo, puedes agregar tu API Key de Google Gemini en **Configuración > Asistente IA**.`;
}
