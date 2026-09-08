import { supabase } from '@/config/supabase'
import type { PaginatedResponse, PaginationParams } from '@/types'

export interface PurchaseOrderItemInput {
  product_id: string | null
  product_title: string
  quantity: number
  unit_price: number
  tax_code?: string
}

export interface PurchaseOrderInput {
  supplier_id?: string | null
  supplier_name?: string | null
  items: PurchaseOrderItemInput[]
  currency?: string
  notes?: string
}

export interface PurchaseOrderItem {
  id: string
  order_id: string
  product_id: string | null
  product_title: string
  quantity: number
  unit_price: number
  tax_code: string | null
  total: number
  created_at: string
}

export interface PurchaseOrder {
  id: string
  order_number: string
  supplier_id: string | null
  supplier_name: string | null
  subtotal: number
  igv_total: number
  total: number
  currency: string
  status: string
  notes: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface PurchaseOrderWithItems extends PurchaseOrder {
  items: PurchaseOrderItem[]
}

export interface PurchaseOrderFilter {
  status?: string
  search?: string
}

function calcOrderTotals(items: PurchaseOrderItemInput[]) {
  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0)
  return {
    subtotal,
    igv_total: 0,
    total: subtotal,
  }
}

export const purchaseService = {
  async getOrders(
    params?: PaginationParams & PurchaseOrderFilter
  ): Promise<PaginatedResponse<PurchaseOrder>> {
    const page = params?.page || 1
    const perPage = params?.per_page || 20

    let query = supabase.from('purchase_orders').select('*', { count: 'exact' })

    if (params?.status) {
      query = query.eq('status', params.status)
    }
    if (params?.search) {
      query = query.or(
        `order_number.ilike.%${params.search}%,supplier_name.ilike.%${params.search}%`
      )
    }

    const { data, error, count } = await query
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

  async getOrderById(id: string): Promise<PurchaseOrderWithItems> {
    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .select('*')
      .eq('id', id)
      .single()

    if (orderError) throw orderError

    const { data: items, error: itemsError } = await supabase
      .from('purchase_order_items')
      .select('*')
      .eq('order_id', id)

    if (itemsError) throw itemsError

    return {
      ...order,
      items: items || [],
    }
  },

  async createOrder(input: PurchaseOrderInput): Promise<PurchaseOrder> {
    if (input.items.length === 0) {
      throw new Error('Agrega al menos un producto a la orden')
    }

    const totals = calcOrderTotals(input.items)

    // Generar número de orden correlativo
    const { data: lastOrder } = await supabase
      .from('purchase_orders')
      .select('order_number')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let nextNumber = 1
    if (lastOrder?.order_number) {
      const match = lastOrder.order_number.match(/OC-(\d+)/)
      if (match) nextNumber = parseInt(match[1], 10) + 1
    }
    const orderNumber = `OC-${String(nextNumber).padStart(6, '0')}`

    const userId = (await supabase.auth.getUser()).data.user?.id || null

    const { data: order, error: orderError } = await supabase
      .from('purchase_orders')
      .insert({
        order_number: orderNumber,
        supplier_id: input.supplier_id || null,
        supplier_name: input.supplier_name || null,
        subtotal: totals.subtotal,
        igv_total: totals.igv_total,
        total: totals.total,
        currency: input.currency || 'PEN',
        status: 'draft',
        notes: input.notes || null,
        created_by: userId,
      })
      .select()
      .single()

    if (orderError) throw orderError

    const items = input.items.map(item => ({
      order_id: order.id,
      product_id: item.product_id,
      product_title: item.product_title,
      quantity: item.quantity,
      unit_price: item.unit_price,
      tax_code: item.tax_code || '10',
      total: item.quantity * item.unit_price,
    }))

    const { error: itemsError } = await supabase.from('purchase_order_items').insert(items)
    if (itemsError) throw itemsError

    return order
  },

  async updateStatus(id: string, status: string): Promise<PurchaseOrder> {
    const validStatuses = ['draft', 'pending', 'approved', 'received', 'cancelled']
    if (!validStatuses.includes(status)) {
      throw new Error(`Estado inválido: ${status}`)
    }

    const { data: order, error } = await supabase
      .from('purchase_orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Si se recibe la orden, registrar entradas de stock
    if (status === 'received') {
      const orderWithItems = await this.getOrderById(id)
      for (const item of orderWithItems.items) {
        if (!item.product_id) continue

        // Registrar movimiento de entrada
        await supabase.from('inventory_movements').insert({
          product_id: item.product_id,
          type: 'entry',
          quantity: item.quantity,
          reference: `COMPRA-${order.order_number}`,
          notes: `Compra a proveedor: ${order.supplier_name || 'Sin proveedor'}`,
          created_by: (await supabase.auth.getUser()).data.user?.id || null,
        })

        // Actualizar stock del producto
        await supabase.rpc('add_stock', {
          p_product_id: item.product_id,
          p_quantity: item.quantity,
        })
      }
    }

    return order
  },

  async deleteOrder(id: string): Promise<void> {
    const { error } = await supabase.from('purchase_orders').delete().eq('id', id)
    if (error) throw error
  },
}
