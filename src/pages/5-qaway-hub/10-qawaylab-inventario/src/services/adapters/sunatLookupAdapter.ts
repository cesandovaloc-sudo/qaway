// ─────────────────────────────────────────────────────────────
// Adaptador de consulta SUNAT (RUC/DNI) — conecta la app con la
// Edge Function `consulta-ruc-dni`. La UI depende de esta
// interfaz, no del proveedor concreto (estándar §21.5 / §49,
// mismo patrón que commerceAdapter.ts). El token del proveedor
// vive en los secrets de la Edge Function, nunca en el bundle.
// ─────────────────────────────────────────────────────────────
import { supabase, supabaseConfigured } from '@/config/supabase'
import type { CustomerDocType, FiscalDocLookupResult } from '@/types'

export interface SunatLookupAdapter {
  /** Consulta SUNAT/RENIEC y devuelve razón social / domicilio fiscal */
  lookup(docType: CustomerDocType, docNumber: string): Promise<FiscalDocLookupResult>
}

interface EdgeResponse {
  success: boolean
  data?: FiscalDocLookupResult
  error?: string
}

export const sunatLookupAdapter: SunatLookupAdapter = {
  async lookup(docType, docNumber) {
    if (!supabaseConfigured) {
      throw new Error('Supabase no configurado (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)')
    }

    const { data, error } = await supabase.functions.invoke<EdgeResponse>('consulta-ruc-dni', {
      body: { doc_type: docType, doc_number: docNumber },
    })

    if (error) {
      throw new Error(`Consulta SUNAT falló: ${error.message}`)
    }
    if (!data) {
      throw new Error('Consulta SUNAT falló: respuesta vacía')
    }
    if (!data.success) {
      throw new Error(data.error || 'No se pudo consultar el documento')
    }
    if (!data.data) {
      throw new Error('Consulta SUNAT falló: respuesta inválida')
    }

    return {
      fiscal_name: data.data.fiscal_name,
      address: data.data.address ?? null,
      raw: data.data.raw,
    }
  },
}
