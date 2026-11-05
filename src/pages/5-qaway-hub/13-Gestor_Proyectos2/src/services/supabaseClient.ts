import { createClient, SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://qrusdsqgygfolxfrafyd.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_k6LYbA5uAOOMBYsP-4NNLA_dKvYh8Yi';

let client: SupabaseClient | null = null;
try {
  if (supabaseUrl && supabaseAnonKey) {
    client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        storageKey: 'qaway_gestor_proyectos_auth',
        persistSession: true,
        autoRefreshToken: true,
      },
    });
  }
} catch (e) {
  console.warn('[Gestor Proyectos] Supabase no pudo inicializarse, usando modo local:', e);
}

export const supabase = client;
