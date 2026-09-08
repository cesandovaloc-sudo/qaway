import { genId } from './orders.js'

export function createPaymentsService(supabase, options = {}) {
  const {
    onPaymentCompleted = null,
  } = options

  return {
    async createPayment({
      userId,
      orderId = null,
      productId = null,
      productTitle = null,
      amount,
      currency = 'PEN',
      provider = 'manual',
      proofUrl = null,
      notes = null,
    }) {
      const paymentData = {
        user_id: userId,
        order_id: orderId,
        amount,
        currency,
        status: 'pending',
        provider,
        notes,
      }
      if (productId) paymentData.product_id = productId
      if (productTitle) paymentData.product_title = productTitle
      if (proofUrl) paymentData.proof_url = proofUrl

      // Invitado: id client-side y sin .select() (misma razón que en orders)
      if (!userId) {
        const payload = { id: genId(), ...paymentData }
        const { error } = await supabase.from('payments').insert(payload)
        if (error) throw error
        return payload
      }

      const { data: payment, error } = await supabase
        .from('payments')
        .insert(paymentData)
        .select()
        .single()

      if (error) throw error
      return payment
    },

    async updatePaymentStatus(paymentId, status, { providerId = null, notes = null } = {}) {
      const updates = { status }
      if (providerId) updates.provider_id = providerId
      if (notes) updates.notes = notes

      const { data: payment, error } = await supabase
        .from('payments')
        .update(updates)
        .eq('id', paymentId)
        .select()
        .single()

      if (error) throw error

      if (status === 'completed' && payment.order_id) {
        await supabase
          .from('orders')
          .update({
            status: 'paid',
            paid_at: new Date().toISOString(),
          })
          .eq('id', payment.order_id)
      }

      if (status === 'completed' && onPaymentCompleted) {
        await onPaymentCompleted(payment)
      }

      return payment
    },

    async getUserPayments(userId) {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async getPendingPayments() {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('provider', 'manual')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data
    },

    async getAllPayments({ status, provider, limit = 50 } = {}) {
      let query = supabase
        .from('payments')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (status) query = query.eq('status', status)
      if (provider) query = query.eq('provider', provider)

      const { data, error } = await query
      if (error) throw error
      return data
    },

    async simulateCulqiWebhook(paymentId) {
      return this.updatePaymentStatus(paymentId, 'completed', {
        providerId: `culqi_sim_${Date.now()}`,
      })
    },

    async createMercadoPagoPreference({ items, externalReference, successUrl, failureUrl, pendingUrl }) {
      // Retorna objeto con preferencia estructurada para Mercado Pago SDK / Checkout Pro
      return {
        items: items.map(item => ({
          title: item.title || item.product_title || item.name,
          unit_price: Number(item.price || item.unit_price || 0),
          quantity: Number(item.quantity || 1),
          currency_id: 'PEN',
        })),
        external_reference: externalReference,
        back_urls: {
          success: successUrl || window.location.origin + '/purchases',
          failure: failureUrl || window.location.origin + '/checkout',
          pending: pendingUrl || window.location.origin + '/purchases',
        },
        auto_return: 'approved',
      }
    },

    async simulateMercadoPagoWebhook(paymentId) {
      return this.updatePaymentStatus(paymentId, 'completed', {
        providerId: `mp_sim_${Date.now()}`,
      })
    },
  }
}
