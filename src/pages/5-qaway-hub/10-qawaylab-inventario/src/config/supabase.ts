import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        // Sin storageKey custom: usa la llave default del ecosistema
        // (sb-<ref>-auth-token), la misma que el Hub/Web principal.
        // Mismo proyecto + misma llave = sesión única nativa.
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient('https://placeholder.supabase.co', 'placeholder-key')

if (typeof localStorage !== 'undefined') {
  localStorage.removeItem('qaway_inventario_auth_token')
}
