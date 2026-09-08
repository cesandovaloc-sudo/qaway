import { supabase } from '@/config/supabase'
import type { PriceList, PriceListType } from '@/types'

// ── Interface ──
export interface PriceListsAdapter {
  getPriceLists(): Promise<PriceList[]>
  getPriceListById(id: string): Promise<PriceList | null>
  createPriceList(data: Partial<PriceList>): Promise<PriceList | null>
  updatePriceList(id: string, data: Partial<PriceList>): Promise<PriceList | null>
  deletePriceList(id: string): Promise<boolean>
  toggleActive(id: string, isActive: boolean): Promise<boolean>
}

// ── Default price lists ──
const defaultPriceLists: Partial<PriceList>[] = [
  { name: 'Precio normal', type: 'normal', is_active: true, description: 'Lista de precios estándar' },
  { name: 'Precio mayorista', type: 'wholesale', is_active: false, description: 'Precios para compras al por mayor' },
  { name: 'Precio oferta', type: 'offer', is_active: false, description: 'Precios en promoción temporal' },
  { name: 'Precio liquidación', type: 'liquidation', is_active: false, description: 'Precios de liquidación y remate' },
]

// ── Supabase Implementation ──
export const supabasePriceListAdapter: PriceListsAdapter = {
  async getPriceLists() {
    const { data, error } = await supabase
      .from('price_lists')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching price lists:', error)
      return []
    }
    return data || []
  },

  async getPriceListById(id) {
    const { data, error } = await supabase
      .from('price_lists')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  },

  async createPriceList(listData) {
    const { data, error } = await supabase
      .from('price_lists')
      .insert(listData)
      .select()
      .single()

    if (error) {
      console.error('Error creating price list:', error)
      return null
    }
    return data
  },

  async updatePriceList(id, listData) {
    const { data, error } = await supabase
      .from('price_lists')
      .update(listData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating price list:', error)
      return null
    }
    return data
  },

  async deletePriceList(id) {
    const { error } = await supabase
      .from('price_lists')
      .delete()
      .eq('id', id)

    return !error
  },

  async toggleActive(id, isActive) {
    const { error } = await supabase
      .from('price_lists')
      .update({ is_active: isActive })
      .eq('id', id)

    return !error
  },
}

// ── Service ──
let adapter: PriceListsAdapter = supabasePriceListAdapter

export function setPriceListAdapter(newAdapter: PriceListsAdapter) {
  adapter = newAdapter
}

export const priceListService = {
  async getPriceLists(): Promise<PriceList[]> {
    return adapter.getPriceLists()
  },

  async getPriceListById(id: string): Promise<PriceList | null> {
    return adapter.getPriceListById(id)
  },

  async createPriceList(data: Partial<PriceList>): Promise<PriceList | null> {
    return adapter.createPriceList(data)
  },

  async createDefaultLists(): Promise<PriceList[]> {
    const created: PriceList[] = []
    for (const list of defaultPriceLists) {
      const result = await adapter.createPriceList(list)
      if (result) created.push(result)
    }
    return created
  },

  async updatePriceList(id: string, data: Partial<PriceList>): Promise<PriceList | null> {
    return adapter.updatePriceList(id, data)
  },

  async deletePriceList(id: string): Promise<boolean> {
    return adapter.deletePriceList(id)
  },

  async toggleActive(id: string, isActive: boolean): Promise<boolean> {
    return adapter.toggleActive(id, isActive)
  },
}

// ── Type labels ──
export const priceListTypeLabels: Record<PriceListType, string> = {
  normal: 'Normal',
  wholesale: 'Mayorista',
  offer: 'Oferta',
  liquidation: 'Liquidación',
  institutional: 'Institucional',
  campaign: 'Campaña',
}

// ── Type colors ──
export const priceListTypeColors: Record<PriceListType, { bg: string; text: string }> = {
  normal: { bg: 'bg-blue-50', text: 'text-blue-700' },
  wholesale: { bg: 'bg-purple-50', text: 'text-purple-700' },
  offer: { bg: 'bg-amber-50', text: 'text-amber-700' },
  liquidation: { bg: 'bg-red-50', text: 'text-red-700' },
  institutional: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
  campaign: { bg: 'bg-pink-50', text: 'text-pink-700' },
}
