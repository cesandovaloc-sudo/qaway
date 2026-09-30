import { supabase } from '@/config/supabase'
import { safeQuery } from '@/lib/supabaseQuery'
import type {
  BusinessSettings,
  Tax,
  SunatUnit,
  InvoiceSeries,
} from '@/types'

export const fiscalService = {
  // ── Negocio ──
  async getBusinessSettings(tenantId: string): Promise<BusinessSettings> {
    const { data, error } = await supabase
      .from('business_settings')
      .select('*')
      .eq('tenant_id', tenantId)
      .maybeSingle()

    if (error) throw error
    if (data) return data

    // Una empresa puede tener Inventario contratado sin haber configurado
    // todavía sus datos fiscales. Crear la fila evita tratar ese estado
    // normal como un error de carga.
    const { data: created, error: createError } = await supabase
      .from('business_settings')
      .insert({
        tenant_id: tenantId,
        regimen: 'general',
        igv_rate: 18,
        moneda: 'PEN',
        sunat_connected: false,
      })
      .select()
      .single()

    if (createError) throw createError
    return created
  },

  async updateBusinessSettings(tenantId: string, updates: Partial<Omit<BusinessSettings, 'id' | 'tenant_id' | 'created_at' | 'updated_at'>>): Promise<BusinessSettings> {
    const { data, error } = await supabase
      .from('business_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ── Impuestos ──
  async getTaxes(tenantId: string): Promise<Tax[]> {
    const { data, error } = await supabase
        .from('taxes')
        .select('*')
        .eq('tenant_id', tenantId)
      .order('codigo')

    if (error) throw error
    return data || []
  },

  async createTax(tenantId: string, input: Omit<Tax, 'id' | 'tenant_id' | 'created_at'>): Promise<Tax> {
    const { data, error } = await supabase
      .from('taxes')
        .insert({ ...input, tenant_id: tenantId })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTax(tenantId: string, id: string, updates: Partial<Omit<Tax, 'id' | 'tenant_id' | 'created_at'>>): Promise<Tax> {
    const { data, error } = await supabase
      .from('taxes')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTax(tenantId: string, id: string): Promise<void> {
    const { error } = await supabase.from('taxes').delete().eq('id', id).eq('tenant_id', tenantId)
    if (error) throw error
  },

  // ── Unidades SUNAT ──
  async getUnits(tenantId: string): Promise<SunatUnit[]> {
    const { data, error } = await supabase
        .from('sunat_units')
        .select('*')
        .eq('tenant_id', tenantId)
      .order('codigo')

    if (error) throw error
    return data || []
  },

  async createUnit(tenantId: string, input: Omit<SunatUnit, 'id' | 'tenant_id' | 'created_at'>): Promise<SunatUnit> {
    const { data, error } = await supabase
      .from('sunat_units')
        .insert({ ...input, tenant_id: tenantId })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateUnit(tenantId: string, id: string, updates: Partial<Omit<SunatUnit, 'id' | 'tenant_id' | 'created_at'>>): Promise<SunatUnit> {
    const { data, error } = await supabase
      .from('sunat_units')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteUnit(tenantId: string, id: string): Promise<void> {
    const { error } = await supabase.from('sunat_units').delete().eq('id', id).eq('tenant_id', tenantId)
    if (error) throw error
  },

  // ── Series de comprobantes ──
  async getSeries(tenantId: string): Promise<InvoiceSeries[]> {
    const { data, error } = await supabase
        .from('series')
        .select('*')
        .eq('tenant_id', tenantId)
      .order('tipo_doc')
      .order('serie')

    if (error) throw error
    return data || []
  },

  async createSeries(tenantId: string, input: Omit<InvoiceSeries, 'id' | 'tenant_id' | 'correlativo_actual' | 'created_at'>): Promise<InvoiceSeries> {
    const { data, error } = await supabase
      .from('series')
        .insert({ ...input, tenant_id: tenantId, correlativo_actual: 0 })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateSeries(tenantId: string, id: string, updates: Partial<Omit<InvoiceSeries, 'id' | 'tenant_id' | 'created_at'>>): Promise<InvoiceSeries> {
    const { data, error } = await supabase
      .from('series')
        .update(updates)
        .eq('id', id)
        .eq('tenant_id', tenantId)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteSeries(tenantId: string, id: string): Promise<void> {
    const { error } = await supabase.from('series').delete().eq('id', id).eq('tenant_id', tenantId)
    if (error) throw error
  },

  // Correlativo transaccional (SELECT ... FOR UPDATE en la BD)
  async nextCorrelativo(seriesId: string): Promise<number> {
    const { data, error } = await supabase.rpc('next_correlativo', { p_serie_id: seriesId })
    if (error) throw error
    return data as number
  },
}
