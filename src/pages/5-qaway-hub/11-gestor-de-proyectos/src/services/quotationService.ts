import { supabase } from '@/config/supabase'
import type { 
  Quotation, 
  QuotationItem, 
  QuotationStatus, 
  Customer, 
  Product,
  PaginatedResponse, 
  PaginationParams 
} from '@/types'

// ── Quotation with relations ──
export interface QuotationWithItems extends Quotation {
  customer?: Customer
  items: (QuotationItem & { product?: Product })[]
}

// ── Quotation Input ──
export interface QuotationInput {
  customer_id?: string | null
  items: QuotationItemInput[]
  discount?: number
  valid_until?: string | null
  notes?: string | null
}

export interface QuotationItemInput {
  product_id: string
  bundle_id?: string | null
  quantity: number
  unit_price: number
  discount?: number
}

// ── Quotation Stats ──
export interface QuotationStats {
  total: number
  draft: number
  sent: number
  accepted: number
  rejected: number
  total_value: number
}

// ── Quotation Service ──
export const quotationService = {
  // Get all quotations
  async getQuotations(params?: PaginationParams): Promise<PaginatedResponse<Quotation>> {
    const page = params?.page || 1
    const perPage = params?.per_page || 20

    const { count } = await supabase
      .from('quotations')
      .select('*', { count: 'exact', head: true })

    const { data, error } = await supabase
      .from('quotations')
      .select('*, customer:customers(name, company)')
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (error) throw error

    return {
      data: data || [],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    }
  },

  // Get quotation by ID with items
  async getQuotationById(id: string): Promise<QuotationWithItems> {
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .select('*, customer:customers(*)')
      .eq('id', id)
      .single()

    if (quotationError) throw quotationError

    // Get items with products
    const { data: items, error: itemsError } = await supabase
      .from('quotation_items')
      .select('*, product:products(*)')
      .eq('quotation_id', id)

    if (itemsError) throw itemsError

    return {
      ...quotation,
      items: items || [],
    }
  },

  // Create quotation
  async createQuotation(input: QuotationInput): Promise<Quotation> {
    // Calculate totals
    const subtotal = input.items.reduce((sum, item) => {
      const itemTotal = item.quantity * item.unit_price
      return sum + itemTotal - (item.discount || 0)
    }, 0)

    const discount = input.discount || 0
    const total = subtotal - discount

    // Create quotation
    const { data: quotation, error: quotationError } = await supabase
      .from('quotations')
      .insert({
        customer_id: input.customer_id || null,
        status: 'draft',
        subtotal,
        discount,
        total,
        valid_until: input.valid_until || null,
        notes: input.notes || null,
      })
      .select()
      .single()

    if (quotationError) throw quotationError

    // Create items
    if (input.items.length > 0) {
      const items = input.items.map(item => ({
        quotation_id: quotation.id,
        product_id: item.product_id,
        bundle_id: item.bundle_id || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        subtotal: item.quantity * item.unit_price - (item.discount || 0),
      }))

      await supabase.from('quotation_items').insert(items)
    }

    return quotation
  },

  // Update quotation
  async updateQuotation(id: string, updates: Partial<Quotation>): Promise<Quotation> {
    const { data, error } = await supabase
      .from('quotations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Update status
  async updateStatus(id: string, status: QuotationStatus): Promise<Quotation> {
    return this.updateQuotation(id, { status })
  },

  // Delete quotation
  async deleteQuotation(id: string): Promise<void> {
    // Delete items first
    await supabase.from('quotation_items').delete().eq('quotation_id', id)
    
    const { error } = await supabase
      .from('quotations')
      .delete()
      .eq('id', id)

    if (error) throw error
  },

  // Add item to quotation
  async addItem(quotationId: string, item: QuotationItemInput): Promise<QuotationItem> {
    const subtotal = item.quantity * item.unit_price - (item.discount || 0)

    const { data, error } = await supabase
      .from('quotation_items')
      .insert({
        quotation_id: quotationId,
        product_id: item.product_id,
        bundle_id: item.bundle_id || null,
        quantity: item.quantity,
        unit_price: item.unit_price,
        discount: item.discount || 0,
        subtotal,
      })
      .select()
      .single()

    if (error) throw error

    // Recalculate quotation total
    await this.recalculateTotal(quotationId)

    return data
  },

  // Remove item from quotation
  async removeItem(quotationId: string, itemId: string): Promise<void> {
    const { error } = await supabase
      .from('quotation_items')
      .delete()
      .eq('id', itemId)

    if (error) throw error

    // Recalculate quotation total
    await this.recalculateTotal(quotationId)
  },

  // Recalculate quotation total
  async recalculateTotal(quotationId: string): Promise<void> {
    const { data: items } = await supabase
      .from('quotation_items')
      .select('subtotal')
      .eq('quotation_id', quotationId)

    const subtotal = (items || []).reduce((sum, item) => sum + (item.subtotal || 0), 0)

    const { data: quotation } = await supabase
      .from('quotations')
      .select('discount')
      .eq('id', quotationId)
      .single()

    const discount = quotation?.discount || 0
    const total = subtotal - discount

    await supabase
      .from('quotations')
      .update({ subtotal, total })
      .eq('id', quotationId)
  },

  // Get stats
  async getStats(): Promise<QuotationStats> {
    const { data: quotations } = await supabase
      .from('quotations')
      .select('status, total')

    if (!quotations) {
      return {
        total: 0,
        draft: 0,
        sent: 0,
        accepted: 0,
        rejected: 0,
        total_value: 0,
      }
    }

    return {
      total: quotations.length,
      draft: quotations.filter(q => q.status === 'draft').length,
      sent: quotations.filter(q => q.status === 'sent').length,
      accepted: quotations.filter(q => q.status === 'accepted').length,
      rejected: quotations.filter(q => q.status === 'rejected').length,
      total_value: quotations.reduce((sum, q) => sum + (q.total || 0), 0),
    }
  },
}

// ── Status Helpers ──
export const statusConfig: Record<QuotationStatus, { label: string; color: string; bgColor: string }> = {
  draft: { label: 'Borrador', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  sent: { label: 'Enviada', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  accepted: { label: 'Aceptada', color: 'text-green-600', bgColor: 'bg-green-100' },
  rejected: { label: 'Rechazada', color: 'text-red-600', bgColor: 'bg-red-100' },
  expired: { label: 'Expirada', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
}
