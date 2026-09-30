// Id para pedidos de invitado: uuid v4 client-side (fallback si crypto no existe)
export function genId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

// Helper para persistencia local de respaldo
function saveLocalOrder(order) {
  try {
    const orders = JSON.parse(localStorage.getItem('qaway_orders') || '[]')
    orders.unshift(order)
    localStorage.setItem('qaway_orders', JSON.stringify(orders.slice(0, 50)))
  } catch (e) {
    console.warn('[OrdersService] Error guardando orden local:', e)
  }
}

export function createOrdersService(supabase) {
  return {
    async createOrder(userId, items, { paymentMethod = null, shippingAddress = null, notes = null, discount = 0, tenantId = null } = {}) {
      const gross = items.reduce((sum, item) => sum + (item.unit_price * (item.quantity || 1)), 0)
      // El descuento del programa de beneficios se resta del total del pedido.
      // Es un valor de presentación: antes de cobrar, el backend debe recalcularlo.
      const appliedDiscount = Number(discount) > 0 ? Number(discount) : 0
      const total = Math.max(0, Math.round((gross - appliedDiscount) * 100) / 100)
      const isGuest = !userId

      let order
      if (isGuest) {
        const id = genId()
        const payload = {
          id,
          user_id: null,
          tenant_id: tenantId,
          total,
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
          notes,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
        // N-04 fail-closed: el error de insert se PROPAGA. Antes se degradaba a
        // console.warn y se devolvía el payload no persistido, mostrando "Pedido
        // registrado con éxito" al cliente con un pedido que la DB rechazó.
        const { error: orderError } = await supabase.from('orders').insert(payload)
        if (orderError) {
          const e = new Error(orderError.message)
          e.code = orderError.code
          throw e
        }
        order = payload
      } else {
        try {
          const { data, error: orderError } = await supabase
            .from('orders')
            .insert({
              user_id: userId,
              tenant_id: tenantId,
              total,
              payment_method: paymentMethod,
              shipping_address: shippingAddress,
              notes,
              status: 'pending',
            })
            .select()
            .single()

          if (orderError) throw orderError
          order = data
        } catch (err) {
          // N-04 fail-closed: sin pedido real no hay éxito falso. Se propaga y el
          // catch de createLocalOrder (Checkout) se lo muestra al comprador.
          console.error('[OrdersService] Supabase insert rechazado:', err)
          throw err
        }
      }

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        product_type: item.product_type,
        product_title: item.product_title,
        quantity: item.quantity || 1,
        unit_price: item.unit_price,
        subtotal: item.unit_price * (item.quantity || 1),
      }))

      try {
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems)

        if (itemsError) throw itemsError
      } catch (err) {
        throw err
      }

      const completedOrder = { ...order, items: orderItems }
      saveLocalOrder(completedOrder)

      return completedOrder
    },

    async getOrders(userId, { status, limit = 50 } = {}) {
      try {
        let query = supabase
          .from('orders')
          .select(`*, items:order_items (*)`)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(limit)

        if (status) query = query.eq('status', status)

        const { data, error } = await query
        if (error) throw error
        return data
      } catch (err) {
        console.warn('[OrdersService] Supabase getOrders fallback:', err)
        const local = JSON.parse(localStorage.getItem('qaway_orders') || '[]')
        return local.filter(o => !userId || o.user_id === userId)
      }
    },

    async getOrder(orderId) {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, items:order_items (*)`)
        .eq('id', orderId)
        .single()

      if (error) throw error
      return data
    },

    async getAllOrders({ status, limit = 50 } = {}) {
      let query = supabase
        .from('orders')
        .select(`*, items:order_items (*)`)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (status) query = query.eq('status', status)

      const { data, error } = await query
      if (error) throw error
      return data
    },

    async cancelOrder(orderId) {
      const { data: order, error } = await supabase
        .from('orders')
        .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
        .eq('id', orderId)
        .eq('status', 'pending')
        .select()
        .single()

      if (error) throw error
      return order
    },
  }
}
