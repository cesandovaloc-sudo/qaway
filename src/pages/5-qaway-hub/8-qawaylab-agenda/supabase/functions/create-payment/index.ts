// Crea un PaymentIntent de Stripe para una reserva con precio.
// El frontend usa el clientSecret para abrir Stripe Payment Element.
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')

serve(async (req) => {
  if (!stripeKey) {
    return new Response(JSON.stringify({ error: 'STRIPE_SECRET_KEY no configurada' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  try {
    const { amount, currency, description } = await req.json()
    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Monto inválido' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
    }

    const stripe = new Stripe(stripeKey)
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency || 'PEN',
      description: description || 'Reserva',
      automatic_payment_methods: { enabled: true },
    })

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
})
