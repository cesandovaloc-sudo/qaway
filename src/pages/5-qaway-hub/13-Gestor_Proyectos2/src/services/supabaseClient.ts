import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Cliente Supabase del módulo — SESIÓN COMPARTIDA CON QAWAY HUB (Etapa 4).
 *
 * Cambios de la Etapa 4 (integración de seguridad):
 *  · El storageKey personalizado 'qaway_gestor_proyectos_auth' fue ELIMINADO:
 *    se crea el cliente igual que el Hub (src/config/supabase.js:10) — sin
 *    opciones ⇒ storageKey por defecto `sb-<ref>-auth-token`, persistSession y
 *    autoRefreshToken por defecto. Resultado: el módulo opera con la MISMA
 *    sesión y el MISMO auth.uid() que el resto de Qaway Hub.
 *  · El fallback de credenciales hardcodeadas fue ELIMINADO: sin
 *    VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY el cliente queda `null` y el
 *    módulo opera en modo local explícito (fail-closed, sin sesión real).
 *
 * Mismo proyecto Supabase que el Hub (mismo .env del bundle Vite raíz).
 */
const env = (import.meta as any).env || {};
const supabaseUrl: string = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey: string = env.VITE_SUPABASE_ANON_KEY || '';

let client: SupabaseClient | null = null;
if (supabaseUrl && supabaseAnonKey) {
  try {
    // SIN storageKey ni opciones personalizadas: idéntico al cliente del Hub
    // (misma clave de sesión en localStorage ⇒ sesión compartida real).
    client = createClient(supabaseUrl, supabaseAnonKey);
  } catch (e) {
    console.warn('[Gestor Proyectos] Supabase no pudo inicializarse, modo local:', e);
    client = null;
  }
}

export const supabase = client;
