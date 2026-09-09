// Supabase Edge Function: send-course-offer
// Envía una notificación de oferta de curso a los estudiantes inscritos
//
// Deploy: supabase functions deploy send-course-offer --no-verify-jwt
// (La verificación del JWT se hace manualmente con admin.auth.getUser(token),
//  porque el gateway elimina el header Authorization cuando verify_jwt está activo.
//  El endpoint exige un usuario admin o support autenticado.)
//
// Uso (desde panel admin):
//   POST https://<project-ref>.supabase.co/functions/v1/send-course-offer
//   Authorization: Bearer <JWT del usuario admin>
//   Body: {
//     "title": "Nuevo curso: React Avanzado",
//     "message": "Aprovecha 50% de descuento esta semana",
//     "link": "/cursos/react-avanzado",
//     "courseId": "<uuid opcional: si se indica, solo estudiantes inscritos en ese curso>"
//   }

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

interface OfferPayload {
  title: string
  message: string
  link?: string
  courseId?: string
}

serve(async (req: Request) => {
  try {
    if (req.method !== 'POST') {
      return json({ error: 'Método no permitido' }, 405)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const admin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

    // 1. Verificar el JWT del llamante
    const authHeader = req.headers.get('Authorization') || ''
    const token = authHeader.replace(/^Bearer\s+/i, '')
    if (!token) {
      return json({ error: 'Token de autorización requerido' }, 401)
    }

    const { data: { user }, error: authError } = await admin.auth.getUser(token)
    if (authError || !user) {
      return json({ error: 'Sesión inválida o expirada' }, 401)
    }

    // 2. Solo administradores pueden enviar ofertas
    const { data: profile } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!profile || !['admin', 'support'].includes(profile.role)) {
      return json({ error: 'No tienes permisos para enviar ofertas' }, 403)
    }

    // 3. Validar payload
    let payload: OfferPayload
    try {
      payload = await req.json()
    } catch {
      return json({ error: 'Body inválido: se espera JSON' }, 400)
    }
    if (!payload.title || !payload.message) {
      return json({ error: 'Faltan los campos title y message' }, 400)
    }

    // 4. Destinatarios: estudiantes con matrícula activa (o solo de un curso específico)
    let query = admin
      .from('enrollments')
      .select('student_id')
      .eq('status', 'active')

    if (payload.courseId) {
      query = query.eq('course_id', payload.courseId)
    }

    const { data: enrollments, error: enrollError } = await query
    if (enrollError) throw enrollError

    const studentIds = [...new Set((enrollments || []).map((e) => e.student_id))]
    if (studentIds.length === 0) {
      return json({ success: true, sent: 0 })
    }

    const rows = studentIds.map((userId) => ({
      user_id: userId,
      type: 'offer',
      title: payload.title,
      message: payload.message,
      link: payload.link || '/cursos',
    }))

    const { error: insertError } = await admin.from('notifications').insert(rows)
    if (insertError) throw insertError

    return json({ success: true, sent: studentIds.length })
  } catch (err) {
    return json({
      success: false,
      error: err instanceof Error ? err.message : 'Error desconocido',
    }, 500)
  }
})

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    headers: { 'Content-Type': 'application/json' },
    status,
  })
}
