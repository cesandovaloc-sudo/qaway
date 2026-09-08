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

export function createOrdersService(supabase) {
  return {
    async createOrder(userId, items, { paymentMethod = null, shippingAddress = null, notes = null } = {}) {
      const total = items.reduce((sum, item) => sum + (item.unit_price * (item.quantity || 1)), 0)
      const isGuest = !userId

      // Invitado (sin sesión): id generado client-side y SIN .select() para no
      // disparar la política SELECT (RLS). El INSERT plano solo pasa por la
      // política de inserción, que permite pedidos de invitado. Así los datos
      // de invitados NO son legibles por anónimos vía REST.
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
        }
        const { error: orderError } = await supabase.from('orders').insert(payload)
        if (orderError) throw orderError
        order = payload
      } else {
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

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) throw itemsError

      return { ...order, items: orderItems }
    },

    async getOrders(userId, { status, limit = 50 } = {}) {
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
