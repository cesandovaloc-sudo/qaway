import { createQawaServices } from '@qawaylab/pago'
import { supabase } from '@/config/supabase'

export const qawaServices = createQawaServices(supabase, {
  onPaymentCompleted: (payment: unknown) => {
    console.info('[Qaway Pago] Pago completado:', (payment as { id?: string })?.id)
  },
})
