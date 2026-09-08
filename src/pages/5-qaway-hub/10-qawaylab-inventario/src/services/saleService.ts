import { supabase } from '@/config/supabase'
import { handleAuthError } from '@/lib/auth'
import type {
  Customer,
  PaginatedResponse,
  PaginationParams,
  PaymentMethod,
  PaymentStatus,
  Sale,
  SaleWithRelations,
} from '@/types'
import { calcSaleTotals } from '@/utils/sales'

export interface SaleItemInput {
  product_id: string
  product_title: string
  quantity: number
  unit_price: number
  tax_code?: string
  unit_sunat?: string
}

export interface SaleInput {
  customer?: Customer | null
  items: SaleItemInput[]
  discount?: number
  currency?: string
  payment_method?: PaymentMethod
  payment_amount?: number
  notes?: string
}

export interface SalesFilter {
  payment_status?: PaymentStatus
  search?: string
}

export interface SaleDebt {
  sale: Sale
  paid: number
  pending: number
}

export const saleService = {
  async getSales(params?: PaginationParams & SalesFilter): Promise<PaginatedResponse<Sale>> {
    const page = params?.page || 1
    const perPage = params?.per_page || 20

    let query = supabase.from('sales').select('*', { count: 'exact' })

    if (params?.payment_status) {
      query = query.eq('payment_status', params.payment_status)
    }
    if (params?.search) {
      query = query.or(
        `sale_number.ilike.%${params.search}%,customer_name.ilike.%${params.search}%,doc_number.ilike.%${params.search}%`
      )
    }

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1)

    if (error) {
      await handleAuthError(error)
      throw error
    }

    return {
      data: data || [],
      total: count || 0,
      page,
      per_page: perPage,
      total_pages: Math.ceil((count || 0) / perPage),
    }
  },

  async getSaleById(id: string): Promise<SaleWithRelations> {
    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .single()

    if (saleError) throw saleError

    const { data: items, error: itemsError } = await supabase
      .from('sale_items')
      .select('*')
      .eq('sale_id', id)

    if (itemsError) throw itemsError

    const { data: payments, error: paymentsError } = await supabase
      .from('sale_payments')
      .select('*')
      .eq('sale_id', id)
      .order('received_at', { ascending: false })

    if (paymentsError) throw paymentsError

    return {
      ...sale,
      items: items || [],
      payments: payments || [],
    }
  },

  async assertStock(items: SaleItemInput[]): Promise<void> {
    const productIds = [...new Set(items.map(item => item.product_id))]

    const { data: products, error } = await supabase
      .from('products')
      .select('id, stock, name')
      .in('id', productIds)

    if (error) throw error

    const stockMap = new Map((products || []).map(p => [p.id, p]))
    for (const item of items) {
      const product = stockMap.get(item.product_id)
      if (!product) continue
      if (product.stock > 0 && item.quantity > product.stock) {
        throw new Error(`Stock insuficiente de "${product.name}": disponible ${product.stock}, se pidieron ${item.quantity}`)
      }
    }
  },

  async createSale(input: SaleInput): Promise<Sale> {
    const totals = calcSaleTotals(input.items, input.discount)

    const { data: saleNumber, error: numberError } = await supabase.rpc('next_sale_number')
    if (numberError) throw numberError

    await this.assertStock(input.items)

    const snapshot = input.customer
      ? {
          customer_name: input.customer.name,
          doc_type: input.customer.doc_type,
          doc_number: input.customer.doc_number,
          fiscal_name: input.customer.fiscal_name,
          fiscal_address: input.customer.address,
        }
      : {
          customer_name: null,
          doc_type: null,
          doc_number: null,
          fiscal_name: null,
          fiscal_address: null,
        }

    const { data: sale, error: saleError } = await supabase
      .from('sales')
      .insert({
        sale_number: saleNumber,
        customer_id: input.customer?.id || null,
        ...snapshot,
        subtotal: totals.subtotal,
        discount: totals.discount,
        igv_total: 0,
        total: totals.total,
        currency: input.currency || 'PEN',
        payment_method: input.payment_method || 'efectivo',
        notes: input.notes || null,
        created_by: (await supabase.auth.getUser()).data.user?.id || null,
      })
      .select()
      .single()

    if (saleError) throw saleError

    const items = input.items.map(item => ({
      sale_id: sale.id,
      product_id: item.product_id,
      product_title: item.product_title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.quantity * item.unit_price,
      tax_code: item.tax_code || '10',
      unit_sunat: item.unit_sunat || 'NIU',
    }))

    const { error: itemsError } = await supabase.from('sale_items').insert(items)
    if (itemsError) throw itemsError

    const amount = input.payment_amount ?? 0
    if (amount > 0) {
      await this.registerPayment(sale.id, amount, input.payment_method || 'efectivo', 'Pago al registrar la venta')
    } else {
      await supabase
        .from('sales')
        .update({ payment_status: totals.total > 0 ? 'deuda' : 'pagado' })
        .eq('id', sale.id)
    }

    return this.getSaleById(sale.id)
  },

  async registerPayment(saleId: string, amount: number, method: PaymentMethod, notes?: string): Promise<Sale> {
    if (amount <= 0) throw new Error('El monto del pago debe ser mayor a 0')

    const { error: paymentError } = await supabase
      .from('sale_payments')
      .insert({
        sale_id: saleId,
        amount,
        method,
        notes: notes || null,
        created_by: (await supabase.auth.getUser()).data.user?.id || null,
      })

    if (paymentError) throw paymentError

    const { data: sale } = await supabase
      .from('sales')
      .select('*')
      .eq('id', saleId)
      .single()

    if (!sale) throw new Error('Venta no encontrada')

    const { data: payments } = await supabase
      .from('sale_payments')
      .select('amount')
      .eq('sale_id', saleId)

    const paid = (payments || []).reduce((sum, p) => sum + p.amount, 0)
    const paymentStatus: PaymentStatus =
      paid >= sale.total ? 'pagado' : paid > 0 ? 'parcial' : 'deuda'

    const { data: updated } = await supabase
      .from('sales')
      .update({
        payment_status: paymentStatus,
        paid_at: paymentStatus === 'pagado' ? new Date().toISOString() : null,
      })
      .eq('id', saleId)
      .select()
      .single()

    return updated
  },

  async getDebts(customerId?: string): Promise<SaleDebt[]> {
    let query = supabase
      .from('sales')
      .select('*')
      .eq('status', 'active')
      .in('payment_status', ['deuda', 'parcial'])
      .order('created_at', { ascending: false })

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    const { data: sales, error } = await query
    if (error) throw error

    const debts: SaleDebt[] = []
    for (const sale of sales || []) {
      const { data: payments } = await supabase
        .from('sale_payments')
        .select('amount')
        .eq('sale_id', sale.id)

      const paid = (payments || []).reduce((sum, p) => sum + p.amount, 0)
      debts.push({ sale, paid, pending: Math.max(0, sale.total - paid) })
    }

    return debts
  },

  async cancelSale(id: string): Promise<Sale> {
    const sale = await this.getSaleById(id)
    if (sale.status === 'cancelled') return sale

    const { data: updated, error: updateError } = await supabase
      .from('sales')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single()

    if (updateError) throw updateError

    for (const item of sale.items) {
      if (!item.product_id) continue

      const { error: movError } = await supabase.from('inventory_movements').insert({
        product_id: item.product_id,
        type: 'entry',
        quantity: item.quantity,
        reference: `ANUL-${sale.sale_number}`,
        notes: `Anulación de ${sale.sale_number}`,
        created_by: (await supabase.auth.getUser()).data.user?.id || null,
      })
      if (movError) throw movError

      const { error: stockError } = await supabase.rpc('restore_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })
      if (stockError) throw stockError
    }

    return updated
  },
}
