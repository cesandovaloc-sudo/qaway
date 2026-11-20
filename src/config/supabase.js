import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('[Supabase] ¡Faltan las credenciales en el archivo .env!')
}

// IMPORTANTE: este cliente se crea al importar el módulo (antes de que monte React).
// Con `detectSessionInUrl` en true consumía y BORRABA el hash de los enlaces de
// recuperación antes de que AuthLinkHandler / RootIndexRoute pudieran ver
// `type=recovery`, y emitía PASSWORD_RECOVERY en un cliente que nadie escuchaba.
// El único cliente que debe procesar la URL es `getSupabaseClient()` de
// `services/supabaseClient.ts`, usado por AuthLinkHandler y UpdatePasswordPage.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: { detectSessionInUrl: false },
})
