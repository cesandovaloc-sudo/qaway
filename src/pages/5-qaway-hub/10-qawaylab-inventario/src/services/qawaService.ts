import { createOrdersService } from './qawa/orders.js'
import { createPaymentsService } from './qawa/payments.js'
import { createProductsService } from './qawa/products.js'
import { supabase } from '@/config/supabase'

export function createQawaServices(sb = supabase, options = {}) {
  return {
    products: createProductsService(sb),
    orders: createOrdersService(sb),
    payments: createPaymentsService(sb, options),
  }
}

export const qawaServices = createQawaServices(supabase, {
  onPaymentCompleted: (payment: unknown) => {
    console.info('[Qaway Pago] Pago completado:', (payment as { id?: string })?.id)
  },
})
