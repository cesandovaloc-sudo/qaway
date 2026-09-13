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
    async createOrder(userId, items, { paymentMethod = null, shippingAddress = null, notes = null } = {}) {
      const total = items.reduce((sum, item) => sum + (item.unit_price * (item.quantity || 1)), 0)
      const isGuest = !userId

      let order
      if (isGuest) {
        const id = genId()
        const payload = {
          id,
          user_id: null,
          total,
          payment_method: paymentMethod,
          shipping_address: shippingAddress,
          notes,
          status: 'pending',
          created_at: new Date().toISOString(),
        }
        try {
          const { error: orderError } = await supabase.from('orders').insert(payload)
          if (orderError) console.warn('[OrdersService] Supabase orders table warning:', orderError.message)
        } catch (err) {
          console.warn('[OrdersService] Supabase insert fallback:', err)
        }
        order = payload
      } else {
        try {
          const { data, error: orderError } = await supabase
            .from('orders')
            .insert({
              user_id: userId,
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
          console.warn('[OrdersService] Supabase insert fallback (user):', err)
          order = {
            id: genId(),
            user_id: userId,
            total,
            payment_method: paymentMethod,
            shipping_address: shippingAddress,
            notes,
            status: 'pending',
            created_at: new Date().toISOString(),
          }
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

        if (itemsError) console.warn('[OrdersService] Supabase order_items warning:', itemsError.message)
      } catch (err) {
        console.warn('[OrdersService] Supabase order_items fallback:', err)
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
