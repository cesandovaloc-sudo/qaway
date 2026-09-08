// Webhook de Stripe: confirma el pago de una reserva y libera/confirma la cita.
// Registrar en Stripe Dashboard -> Webhooks -> https://TU-PROYECTO.supabase.co/functions/v1/stripe-webhook
// con evento checkout.session.completed (o payment_intent.succeeded).
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14?target=deno'

const stripeKey = Deno.env.get('STRIPE_SECRET_KEY')!
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

serve(async (req) => {
  const stripe = new Stripe(stripeKey)
  const signature = req.headers.get('stripe-signature')

  let event
  try {
    const body = await req.text()
    event = stripe.webhooks.constructEvent(body, signature || '', webhookSecret)
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Firma inválida: ' + e.message }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }

  if (event.type !== 'payment_intent.succeeded') {
    return new Response(JSON.stringify({ ok: true, ignored: event.type }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  const intent = event.data.object
  const supabase = createClient(supabaseUrl, serviceKey)

  // Marcar la cita como pagada y confirmada (el anon nunca pudo forzar esto)
  const { data, error } = await supabase
    .from('bookings')
    .update({ payment_status: 'paid', status: 'confirmed' })
    .eq('payment_intent_id', intent.id)
    .select()

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  return new Response(JSON.stringify({ ok: true, confirmed: data?.length }), { status: 200, headers: { 'Content-Type': 'application/json' } })
})
