import { supabase } from '@/config/supabase'
import { safeQuery } from '@/lib/supabaseQuery'
import type {
  BusinessSettings,
  Tax,
  SunatUnit,
  InvoiceSeries,
} from '@/types'

const DEFAULT_BUSINESS_ID = '00000000-0000-0000-0000-000000000001'

export const fiscalService = {
  // ── Negocio ──
  async getBusinessSettings(): Promise<BusinessSettings> {
    return safeQuery(() =>
      supabase
        .from('business_settings')
        .select('*')
        .eq('id', DEFAULT_BUSINESS_ID)
        .single()
    )
  },

  async updateBusinessSettings(updates: Partial<Omit<BusinessSettings, 'id' | 'created_at' | 'updated_at'>>): Promise<BusinessSettings> {
    const { data, error } = await supabase
      .from('business_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', DEFAULT_BUSINESS_ID)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // ── Impuestos ──
  async getTaxes(): Promise<Tax[]> {
    const { data, error } = await supabase
      .from('taxes')
      .select('*')
      .order('codigo')

    if (error) throw error
    return data || []
  },

  async createTax(input: Omit<Tax, 'id' | 'created_at'>): Promise<Tax> {
    const { data, error } = await supabase
      .from('taxes')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateTax(id: string, updates: Partial<Tax>): Promise<Tax> {
    const { data, error } = await supabase
      .from('taxes')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteTax(id: string): Promise<void> {
    const { error } = await supabase.from('taxes').delete().eq('id', id)
    if (error) throw error
  },

  // ── Unidades SUNAT ──
  async getUnits(): Promise<SunatUnit[]> {
    const { data, error } = await supabase
      .from('sunat_units')
      .select('*')
      .order('codigo')

    if (error) throw error
    return data || []
  },

  async createUnit(input: Omit<SunatUnit, 'id' | 'created_at'>): Promise<SunatUnit> {
    const { data, error } = await supabase
      .from('sunat_units')
      .insert(input)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateUnit(id: string, updates: Partial<SunatUnit>): Promise<SunatUnit> {
    const { data, error } = await supabase
      .from('sunat_units')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteUnit(id: string): Promise<void> {
    const { error } = await supabase.from('sunat_units').delete().eq('id', id)
    if (error) throw error
  },

  // ── Series de comprobantes ──
  async getSeries(): Promise<InvoiceSeries[]> {
    const { data, error } = await supabase
      .from('series')
      .select('*')
      .order('tipo_doc')
      .order('serie')

    if (error) throw error
    return data || []
  },

  async createSeries(input: Omit<InvoiceSeries, 'id' | 'correlativo_actual' | 'created_at'>): Promise<InvoiceSeries> {
    const { data, error } = await supabase
      .from('series')
      .insert({ ...input, correlativo_actual: 0 })
      .select()
      .single()

    if (error) throw error
    return data
  },

  async updateSeries(id: string, updates: Partial<InvoiceSeries>): Promise<InvoiceSeries> {
    const { data, error } = await supabase
      .from('series')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  async deleteSeries(id: string): Promise<void> {
    const { error } = await supabase.from('series').delete().eq('id', id)
    if (error) throw error
  },

  // Correlativo transaccional (SELECT ... FOR UPDATE en la BD)
  async nextCorrelativo(seriesId: string): Promise<number> {
    const { data, error } = await supabase.rpc('next_correlativo', { p_serie_id: seriesId })
    if (error) throw error
    return data as number
  },
}
