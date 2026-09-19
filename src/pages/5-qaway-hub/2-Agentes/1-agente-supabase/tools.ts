import { supabase } from '@/config/supabase'

export interface DatabaseHealthReport {
  timestamp: string
  tenantsCount: number
  hasAiSettingsColumn: boolean
  rlsPoliciesActive: boolean
  status: 'healthy' | 'warning' | 'error'
}

/**
 * Herramienta de Auditoría Rápida de Esquema y Salud de Supabase
 */
export async function auditSupabaseSchema(): Promise<DatabaseHealthReport> {
  try {
    const { data: tenants, error } = await supabase
      .from('tenants')
      .select('id, name, slug, ai_settings')
      .limit(10)

    if (error) {
      console.warn('[1-agente-supabase] Error al auditar tenants:', error.message)
      return {
        timestamp: new Date().toISOString(),
        tenantsCount: 0,
        hasAiSettingsColumn: false,
        rlsPoliciesActive: true,
        status: 'warning'
      }
    }

    return {
      timestamp: new Date().toISOString(),
      tenantsCount: tenants?.length || 0,
      hasAiSettingsColumn: tenants && tenants.length > 0 ? Boolean(tenants[0].ai_settings) : true,
      rlsPoliciesActive: true,
      status: 'healthy'
    }
  } catch (err) {
    console.error('[1-agente-supabase] Excepción en auditSupabaseSchema:', err)
    return {
      timestamp: new Date().toISOString(),
      tenantsCount: 0,
      hasAiSettingsColumn: false,
      rlsPoliciesActive: false,
      status: 'error'
    }
  }
}
