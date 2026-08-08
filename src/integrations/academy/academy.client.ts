import { createClient, type SupabaseClient } from '@supabase/supabase-js'

/**
 * Cliente SEPARADO de Academy (solo lectura pública del catálogo).
 * No se mezcla con el Supabase de la Web (leads/briefs/formularios).
 * Nunca usa service_role ni credenciales administrativas.
 */
const academyUrl = import.meta.env.VITE_ACADEMY_SUPABASE_URL || ''
const academyAnonKey = import.meta.env.VITE_ACADEMY_SUPABASE_ANON_KEY || ''

export const academyConfigured = Boolean(academyUrl && academyAnonKey)

export const academyClient: SupabaseClient | null = academyConfigured
  ? createClient(academyUrl, academyAnonKey)
  : null

export function getAcademyUrl(): string {
  return (import.meta.env.VITE_ACADEMY_URL as string | undefined) ?? ''
}

export function getAcademyAssetsUrl(): string {
  return (import.meta.env.VITE_ACADEMY_ASSETS_URL as string | undefined) ?? ''
}
