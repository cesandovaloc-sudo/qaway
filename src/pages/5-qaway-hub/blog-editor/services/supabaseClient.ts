import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Base URL pública del sitio: en producción fijarla con VITE_APP_URL para que los
// correos (confirmación, recuperación, OAuth) apunten al dominio real aunque el
// registro se haga desde localhost. Sin variable, cae al origen actual.
export const APP_BASE_URL = (import.meta.env.VITE_APP_URL as string | undefined) || window.location.origin

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl !== 'https://your-project.supabase.co' &&
    !supabaseUrl.includes('placeholder')
  )
}

let client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null
  }
  if (!client) {
    client = createClient(supabaseUrl, supabaseAnonKey)
  }
  return client
}
