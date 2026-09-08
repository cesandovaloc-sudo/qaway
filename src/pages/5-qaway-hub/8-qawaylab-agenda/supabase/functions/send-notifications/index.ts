// Envía las notificaciones pendientes de la cola `reminders`
// (confirmaciones y recordatorios) por email (Resend) y WhatsApp (Meta).
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const RESEND_KEY = Deno.env.get('RESEND_API_KEY')
const WHATSAPP_TOKEN = Deno.env.get('WHATSAPP_TOKEN')
const WHATSAPP_PHONE_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID')
const APP_URL = Deno.env.get('PUBLIC_APP_URL') || 'http://localhost:8500'
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Citas Qaway <no-reply@qawaylab.com>'

serve(async () => {
  const supabase = createClient(supabaseUrl, serviceKey)

  // 1. Recoger recordatorios vencidos y pendientes
  const { data: due } = await supabase
    .from('reminders')
    .select('*, bookings(*, event_types(*), businesses(*))')
    .eq('status', 'pending')
    .lte('send_at', new Date().toISOString())
    .limit(50)

  if (!due || due.length === 0) {
    return new Response(JSON.stringify({ ok: true, sent: 0 }), { status: 200, headers: { 'Content-Type': 'application/json' } })
  }

  let sent = 0
  for (const reminder of due) {
    const b = reminder.bookings
    if (!b) continue
    const title = b.event_types?.title || 'Cita'
    const start = new Date(b.start_at)
    const dateStr = start.toLocaleDateString('es-PE', { weekday: 'long', day: 'numeric', month: 'long' })
    const timeStr = start.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })
    const isReminder = reminder.kind === 'reminder'
    const subject = isReminder
      ? `Recordatorio: ${title} · ${dateStr} ${timeStr}`
      : `Confirmación de cita: ${title}`
    const manageLink = `${APP_URL}/gestionar/${b.cancel_token}`

    let ok = false

    // Email vía Resend
    if (reminder.channel === 'email' && RESEND_KEY) {
      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${RESEND_KEY}` },
          body: JSON.stringify({
            from: FROM_EMAIL,
            to: [b.customer_email],
            subject,
            html: `
              <h2>${isReminder ? '⏰ Recordatorio' : '✅ Confirmación'}</h2>
              <p>Hola <b>${b.customer_name}</b>,</p>
              <p>${isReminder ? 'Te recordamos tu próxima cita:' : 'Tu cita fue confirmada:'}</p>
              <p style="background:#f4f4f5;padding:14px;border-radius:8px">
                <b>${title}</b><br/>
                📅 ${dateStr}<br/>
                🕒 ${timeStr}
              </p>
              <p>¿Necesitas cambios? <a href="${manageLink}">Gestiona o cancela aquí</a>.</p>
            `,
          }),
        })
        ok = res.ok
      } catch (_e) { ok = false }
    }

    // WhatsApp vía Meta (plantilla de texto libre dentro de ventana 24h; usar plantillas aprobadas en producción)
    if (reminder.channel === 'whatsapp' && WHATSAPP_TOKEN && WHATSAPP_PHONE_ID) {
      try {
        const res = await fetch(`https://graph.facebook.com/v20.0/${WHATSAPP_PHONE_ID}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${WHATSAPP_TOKEN}` },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: b.customer_phone,
            type: 'template',
            template: {
              name: 'booking_' + (isReminder ? 'reminder' : 'confirmation'),
              language: { code: 'es' },
              components: [{ type: 'body', parameters: [{ type: 'text', text: b.customer_name }, { type: 'text', text: title }, { type: 'text', text: `${dateStr} ${timeStr}` }] }],
            },
          }),
        })
        ok = res.ok
      } catch (_e) { ok = false }
    }

    // 2. Marcar como enviado/failido
    await supabase.from('reminders').update({ status: ok ? 'sent' : 'failed', error_message: ok ? null : 'error al enviar' }).eq('id', reminder.id)
    if (ok) sent++
  }

  return new Response(JSON.stringify({ ok: true, sent }), { status: 200, headers: { 'Content-Type': 'application/json' } })
})
