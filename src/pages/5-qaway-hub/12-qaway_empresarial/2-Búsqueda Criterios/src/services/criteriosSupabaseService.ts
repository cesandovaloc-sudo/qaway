/**
 * ============================================================================
 * SERVICIO DE PERSISTENCIA SUPABASE DESACOPLADO (RAG CRITERIOS)
 * Módulo: Búsqueda de Criterios (Qaway Lab & MINEDU)
 *
 * Características:
 * - Aislamiento total: Tablas exclusivas (rag_projects, rag_sessions, rag_turns, rag_sources).
 * - Cero colisiones con el resto del schema de Qaway Lab.
 * - Soporte BYODB (Bring Your Own Database) para migración autónoma a Cloudflare Pages.
 * - Resiliencia offline/fallback: Si las tablas no existen en la base de datos remota,
 *   opera con caché local reactivo sin arrojar errores bloqueantes.
 * ============================================================================
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";

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
