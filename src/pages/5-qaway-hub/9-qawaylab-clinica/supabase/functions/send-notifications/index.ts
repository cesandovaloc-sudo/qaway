// Envía los recordatorios pendientes de la cola `reminders`
// por email (Resend) y WhatsApp (Meta Cloud API).
// Cron: ver README (pg_cron dispara esta funcion cada 5 min).
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_KEY = Deno.env.get('RESEND_API_KEY')
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN')
const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Clinica Qaway <no-reply@qawaylab.com>'

const supabase = createClient(supabaseUrl, serviceKey)

async function sendEmail(to: string, subject: string, html: string) {
  if (!RESEND_KEY) return false
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM_EMAIL, to, subject, html }),
  })
  return res.ok
}

async function sendWhatsApp(phone: string, message: string) {
  if (!WHATSAPP_TOKEN || !WHATSAPP_PHONE_ID) return false
  const res = await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp', to: phone,
      type: 'text', text: { body: message },
    }),
  })
  return res.ok
}

serve(async () => {
  const now = new Date().toISOString()
  const { data: pending, error } = await supabase
    .from('reminders')
    .select('*, owners(email, phone), patients(first_name, last_name)')
    .eq('status', 'pending')
    .lte('send_at', now)
    .limit(20)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }

  let sent = 0
  let failed = 0

  for (const r of (pending || [])) {
    const owner = r.owners
    let ok = false
    const patientName = r.patients?.first_name || 'paciente'

    if (r.channel === 'whatsapp' && owner?.phone) {
      ok = await sendWhatsApp(owner.phone, `${r.title}\n${r.message || ''}`)
    } else if (owner?.email) {
      ok = await sendEmail(
        owner.email,
        r.title,
        `<h2>${r.title}</h2><p>${r.message || ''}</p><p>Paciente: <b>${patientName}</b></p>`
      )
    }

    await supabase.from('reminders').update({ status: ok ? 'sent' : 'failed' }).eq('id', r.id)
    if (ok) sent++
    else failed++
  }

  return new Response(JSON.stringify({ processed: (pending || []).length, sent, failed }), {
    status: 200, headers: { 'Content-Type': 'application/json' },
  })
})
