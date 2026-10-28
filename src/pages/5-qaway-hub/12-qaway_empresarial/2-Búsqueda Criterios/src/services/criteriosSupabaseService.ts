/**
 * ============================================================================
 * SERVICIO DE PERSISTENCIA SUPABASE DESACOPLADO (RAG CRITERIOS)
 * Módulo: Búsqueda de Criterios (Qaway Lab & MINEDU)
 *
 * Características:
 * - Aislamiento total: Tablas exclusivas (rag_projects, rag_sessions, rag_turns, rag_sources
 *   y rag_document_chunks con pgvector/HNSW para la lectura vectorial remota).
 * - Cero colisiones con el resto del schema de Qaway Lab.
 * - Soporte BYODB (Bring Your Own Database) para migración autónoma a Cloudflare Pages.
 * - Resiliencia offline/fallback: Si las tablas no existen en la base de datos remota,
 *   opera con caché local reactivo sin arrojar errores bloqueantes.
 * ============================================================================
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getStoredGeminiApiKey } from "./geminiRAGService";

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isCustom: boolean;
}

const STORAGE_KEY_CUSTOM_URL = "qaway_rag_supabase_url";
const STORAGE_KEY_CUSTOM_KEY = "qaway_rag_supabase_anon_key";

/**
 * Obtiene la configuración activa de Supabase (Personalizada o Entorno)
 */
export function getActiveSupabaseConfig(): SupabaseConfig {
  let customUrl = "";
  let customKey = "";

  try {
    customUrl = localStorage.getItem(STORAGE_KEY_CUSTOM_URL) || "";
    customKey = localStorage.getItem(STORAGE_KEY_CUSTOM_KEY) || "";
  } catch {
    // Entornos sin localStorage
  }

  if (customUrl.trim() && customKey.trim()) {
    return {
      url: customUrl.trim(),
      anonKey: customKey.trim(),
      isCustom: true,
    };
  }

  // Fallback a variables de entorno del host
  const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL || "https://qrusdsqgygfolxfrafyd.supabase.co";
  const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || "sb_publishable_k6LYbA5uAOOMBYsP-4NNLA_dKvYh8Yi";

  return {
    url: envUrl,
    anonKey: envKey,
    isCustom: false,
  };
}

/**
 * Guarda credenciales personalizadas de Supabase para cuando la app viva en su propia DB
 */
export function saveCustomSupabaseConfig(url: string, anonKey: string): void {
  try {
    if (url.trim() && anonKey.trim()) {
      localStorage.setItem(STORAGE_KEY_CUSTOM_URL, url.trim());
      localStorage.setItem(STORAGE_KEY_CUSTOM_KEY, anonKey.trim());
    } else {
      localStorage.removeItem(STORAGE_KEY_CUSTOM_URL);
      localStorage.removeItem(STORAGE_KEY_CUSTOM_KEY);
    }
    clientInstance = null; // Reiniciar instancia
    remoteChunksTableAvailable = null; // Re-probar la tabla vectorial con las nuevas credenciales
  } catch (err) {
    console.warn("[RAG Supabase] No se pudieron guardar credenciales en localStorage:", err);
  }
}

let clientInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (!clientInstance) {
    const config = getActiveSupabaseConfig();
    clientInstance = createClient(config.url, config.anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }
  return clientInstance;
}

/**
 * Prueba de conexión a Supabase y verificación de esquema RAG
 */
export async function testSupabaseConnection(): Promise<{
  connected: boolean;
  hasTables: boolean;
  message: string;
  url: string;
}> {
  const config = getActiveSupabaseConfig();
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.from("rag_sessions").select("id").limit(1);

    if (error) {
      if (error.code === "PGRST205" || error.message.includes("Could not find the table")) {
        return {
          connected: true,
          hasTables: false,
          message: "Conectado a Supabase exitosamente. Las tablas 'rag_*' aún no han sido migradas.",
          url: config.url,
        };
      }
      return {
        connected: false,
        hasTables: false,
        message: `Error al conectar: ${error.message}`,
        url: config.url,
      };
    }

    return {
      connected: true,
      hasTables: true,
      message: "Conexión a Supabase operativa y esquema RAG verificado.",
      url: config.url,
    };
  } catch (err: any) {
    return {
      connected: false,
      hasTables: false,
      message: `Fallo de red: ${err.message || String(err)}`,
      url: config.url,
    };
  }
}

/**
 * Guarda o actualiza una sesión de chat en Supabase
 */
export async function syncSessionToSupabase(session: {
  id: string;
  projectId: string;
  title: string;
  preview: string;
  provider?: string;
  mode?: string;
  agentProfile?: string;
  tone?: string;
  messagesCount: number;
}): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from("rag_sessions").upsert({
      id: session.id,
      project_id: session.projectId,
      title: session.title,
      preview: session.preview,
      provider: session.provider || "Google DeepMind",
      mode: session.mode || "standard",
      agent_profile: session.agentProfile || "auditor_laboral",
      tone: session.tone || "ejecutivo",
      messages_count: session.messagesCount,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("[RAG Supabase] Sesión no sincronizada en DB remota (modo local activo):", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[RAG Supabase] Error al sincronizar sesión:", err);
    return false;
  }
}

/**
 * Guarda un turno/mensaje en Supabase
 */
export async function syncTurnToSupabase(sessionId: string, turn: {
  id: string;
  sender: "user" | "assistant";
  text: string;
  latency?: string;
  scenarioId?: string;
  hasTable?: boolean;
  tableData?: any;
  sources?: any;
}): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from("rag_turns").upsert({
      id: turn.id,
      session_id: sessionId,
      sender: turn.sender,
      text: turn.text,
      latency: turn.latency || null,
      scenario_id: turn.scenarioId || null,
      has_table: turn.hasTable || false,
      table_data: turn.tableData || null,
      sources: turn.sources || null,
      created_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("[RAG Supabase] Turno no sincronizado en DB remota (modo local activo):", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[RAG Supabase] Error al sincronizar turno:", err);
    return false;
  }
}

/**
 * Carga sesiones desde Supabase si la tabla existe
 */
export async function fetchSessionsFromSupabase(projectId: string): Promise<any[] | null> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("rag_sessions")
      .select("*, rag_turns(*)")
      .eq("project_id", projectId)
      .order("updated_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data.map((s) => ({
      id: s.id,
      title: s.title,
      preview: s.preview,
      date: new Date(s.updated_at).toLocaleDateString("es-PE", { day: "2-digit", month: "short" }),
      messagesCount: s.messages_count,
      provider: s.provider,
      mode: s.mode,
      agentProfile: s.agent_profile,
      turns: (s.rag_turns || []).map((t: any) => ({
        id: t.id,
        sender: t.sender,
        text: t.text,
        timestamp: new Date(t.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        latency: t.latency,
        scenarioId: t.scenario_id,
        hasTable: t.has_table,
        tableData: t.table_data,
        sources: t.sources,
      })),
    }));
  } catch {
    return null;
  }
}

/**
 * Guarda o actualiza un proyecto en Supabase
 */
export async function syncProjectToSupabase(project: {
  id: string;
  name: string;
  category: string;
  badge?: string;
  sourcesCount?: number;
}): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from("rag_projects").upsert({
      id: project.id,
      name: project.name,
      category: project.category,
      badge: project.badge || "Activo",
      updated_at: new Date().toISOString(),
    });

    if (error) {
      console.warn("[RAG Supabase] Proyecto no sincronizado en DB remota (modo local activo):", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[RAG Supabase] Error al sincronizar proyecto:", err);
    return false;
  }
}

/**
 * Carga proyectos desde Supabase si la tabla existe
 */
export async function fetchProjectsFromSupabase(): Promise<any[] | null> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client
      .from("rag_projects")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error || !data || data.length === 0) {
      return null;
    }

    return data.map((p) => ({
      id: p.id,
      name: p.name,
      category: p.category,
      badge: p.badge || "Activo",
      sourcesCount: 0,
    }));
  } catch {
    return null;
  }
}

/**
 * Elimina un proyecto en Supabase
 */
export async function deleteProjectFromSupabase(projectId: string): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    const { error } = await client.from("rag_projects").delete().eq("id", projectId);
    return !error;
  } catch {
    return false;
  }
}

/* -------------------------------------------------------------------------- */
/* LECTURA VECTORIAL REMOTA: pgvector + HNSW y embeddings Gemini (BYOK)        */
/* -------------------------------------------------------------------------- */

/** Modelo y geometría fijados en la tabla remota (vector(768)). */
export const REMOTE_EMBEDDING_MODEL = "text-embedding-004";
export const REMOTE_EMBEDDING_DIMENSIONS = 768;

const GEMINI_EMBED_ENDPOINT_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
const EMBEDDING_BATCH_SIZE = 50;
const EMBEDDING_INPUT_MAX_CHARS = 6000;
const EMBEDDING_FETCH_TIMEOUT_MS = 20000;

export interface RemoteChunkRow {
  id: string;
  project_id: string;
  document_id: string;
  document_title: string;
  document_type: string;
  locator_label: string;
  page_number: number | null;
  content: string;
  similarity: number;
}

export interface RemoteChunkInsertRow {
  id: string;
  project_id: string;
  document_id: string;
  document_title: string;
  document_type: string;
  locator_label: string;
  page_number: number | null;
  content: string;
  embedding: number[];
}

export interface EmbeddingInputItem {
  content: string;
  title?: string;
}

/** Indica si hay API key de Gemini disponible (misma fuente BYOK del chat). */
export function isGeminiEmbeddingConfigured(): boolean {
  return Boolean(getStoredGeminiApiKey());
}

/** fetch con timeout acotado para no colgar la ingesta si la red se demora. */
async function fetchEmbeddingWithTimeout(url: string, body: unknown): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), EMBEDDING_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

/** Embedding (768) de la consulta con taskType de recuperación. */
export async function generateGeminiQueryEmbedding(query: string): Promise<number[] | null> {
  const apiKey = getStoredGeminiApiKey();
  if (!apiKey) return null;
  const text = query.trim().slice(-EMBEDDING_INPUT_MAX_CHARS);
  if (!text) return null;
  try {
    const response = await fetchEmbeddingWithTimeout(
      `${GEMINI_EMBED_ENDPOINT_BASE}/${REMOTE_EMBEDDING_MODEL}:embedContent?key=${apiKey}`,
      {
        content: { parts: [{ text }] },
        taskType: "RETRIEVAL_QUERY",
      }
    );
    if (!response.ok) {
      const errData = await response.json().catch(() => null);
      throw new Error(errData?.error?.message || `HTTP ${response.status}`);
    }
    const data = await response.json();
    const values = data?.embedding?.values;
    if (!Array.isArray(values) || values.length !== REMOTE_EMBEDDING_DIMENSIONS) {
      throw new Error(`Dimensión de embedding inesperada (${Array.isArray(values) ? values.length : "n/d"})`);
    }
    return values as number[];
  } catch (err) {
    console.warn("[RAG Supabase] Embedding de consulta no disponible:", err);
    return null;
  }
}

/** Embeddings (768) por lotes de 50 con batchEmbedContents (RETRIEVAL_DOCUMENT). */
export async function generateGeminiChunkEmbeddings(
  items: EmbeddingInputItem[]
): Promise<number[][] | null> {
  const apiKey = getStoredGeminiApiKey();
  if (!apiKey) return null;
  if (!items || items.length === 0) return [];
  try {
    const vectors: number[][] = new Array(items.length);
    for (let start = 0; start < items.length; start += EMBEDDING_BATCH_SIZE) {
      const batch = items.slice(start, start + EMBEDDING_BATCH_SIZE);
      const requests = batch.map((item) => ({
        model: `models/${REMOTE_EMBEDDING_MODEL}`,
        content: { parts: [{ text: item.content.slice(0, EMBEDDING_INPUT_MAX_CHARS) }] },
        taskType: "RETRIEVAL_DOCUMENT",
        ...(item.title && item.title.trim() ? { title: item.title.trim() } : {}),
      }));
      const response = await fetchEmbeddingWithTimeout(
        `${GEMINI_EMBED_ENDPOINT_BASE}/${REMOTE_EMBEDDING_MODEL}:batchEmbedContents?key=${apiKey}`,
        { requests }
      );
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.error?.message || `HTTP ${response.status}`);
      }
      const data = await response.json();
      const embeddings = data?.embeddings;
      if (!Array.isArray(embeddings) || embeddings.length !== batch.length) {
        throw new Error("Respuesta de batchEmbedContents incompleta");
      }
      for (let i = 0; i < batch.length; i++) {
        const values = embeddings[i]?.values;
        if (!Array.isArray(values) || values.length !== REMOTE_EMBEDDING_DIMENSIONS) {
          throw new Error(`Dimensión de embedding inesperada (${Array.isArray(values) ? values.length : "n/d"})`);
        }
        vectors[start + i] = values as number[];
      }
    }
    return vectors;
  } catch (err) {
    console.warn("[RAG Supabase] Embeddings de fragmentos no disponibles:", err);
    return null;
  }
}

/** Disponibilidad de la tabla vectorial remota (probe liviano, cacheado por sesión). */
let remoteChunksTableAvailable: boolean | null = null;

export async function isRemoteChunkStoreAvailable(): Promise<boolean> {
  if (remoteChunksTableAvailable !== null) return remoteChunksTableAvailable;
  try {
    const client = getSupabaseClient();
    const { error } = await client
      .from("rag_document_chunks")
      .select("id", { count: "exact", head: true })
      .limit(0);
    remoteChunksTableAvailable = !error;
    if (error) {
      console.warn("[RAG Supabase] Tabla 'rag_document_chunks' aún no migrada (motor local activo):", error.message);
    }
  } catch {
    remoteChunksTableAvailable = false;
  }
  return remoteChunksTableAvailable;
}

/** Purga idempotente de fragmentos remotos por documento (re-index sin huérfanos). */
export async function purgeRemoteDocumentChunks(documentId: string, projectId?: string): Promise<boolean> {
  try {
    const client = getSupabaseClient();
    let query = client.from("rag_document_chunks").delete().eq("document_id", documentId);
    if (projectId) query = query.eq("project_id", projectId);
    const { error } = await query;
    if (error) {
      console.warn("[RAG Supabase] Purga remota de fragmentos fallida:", error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn("[RAG Supabase] Purga remota de fragmentos fallida:", err);
    return false;
  }
}

/** Inserción por lotes de 50 filas con embedding vector(768). */
export async function insertRemoteChunkRows(rows: RemoteChunkInsertRow[]): Promise<boolean> {
  if (!rows || rows.length === 0) return true;
  try {
    const client = getSupabaseClient();
    for (let start = 0; start < rows.length; start += EMBEDDING_BATCH_SIZE) {
      const batch = rows.slice(start, start + EMBEDDING_BATCH_SIZE);
      const { error } = await client.from("rag_document_chunks").insert(batch);
      if (error) {
        console.warn("[RAG Supabase] Inserción remota de fragmentos fallida:", error.message);
        return false;
      }
    }
    return true;
  } catch (err) {
    console.warn("[RAG Supabase] Inserción remota de fragmentos fallida:", err);
    return false;
  }
}

/** RPC match_rag_chunks (HNSW coseno). null = remoto no disponible este turno. */
export async function fetchRemoteChunkMatches(
  queryVector: number[],
  matchThreshold: number,
  matchCount: number,
  projectId: string
): Promise<RemoteChunkRow[] | null> {
  try {
    const client = getSupabaseClient();
    const { data, error } = await client.rpc("match_rag_chunks", {
      query_embedding: queryVector,
      match_threshold: matchThreshold,
      match_count: matchCount,
      filter_project_id: projectId,
    });
    if (error) {
      console.warn("[RAG Supabase] match_rag_chunks no disponible:", error.message);
      return null;
    }
    return (data ?? []) as RemoteChunkRow[];
  } catch (err) {
    console.warn("[RAG Supabase] match_rag_chunks falló:", err);
    return null;
  }
}

/** Conteo exacto de fragmentos remotos del proyecto (contrato de recuperación). */
export async function fetchRemoteProjectChunkCount(projectId: string): Promise<number | null> {
  try {
    const client = getSupabaseClient();
    const { count, error } = await client
      .from("rag_document_chunks")
      .select("id", { count: "exact", head: true })
      .eq("project_id", projectId);
    if (error) return null;
    return typeof count === "number" ? count : null;
  } catch {
    return null;
  }
}
