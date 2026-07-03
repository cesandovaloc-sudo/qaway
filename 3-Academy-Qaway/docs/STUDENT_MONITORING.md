# Guia de Monitoreo de Alumnos — Qaway Academy

## Objetivo

Detectar alumnos que necesitan motivacion o reactivacion y enviarles correos automatizados para mantenerlos activos en la plataforma.

---

## 1. Sistema de Monitoreo (Activity Logs)

La tabla `activity_logs` registra automaticamente cada accion importante del alumno:

| Tipo de actividad | Cuando se registra |
|---|---|
| `login` | Cada vez que el alumno inicia sesion |
| `course_start` | Al inscribirse o iniciar un curso |
| `lesson_view` | Al abrir una leccion |
| `lesson_complete` | Al marcar una leccion como completada |
| `resource_download` | Al descargar un recurso |
| `assignment_submit` | Al entregar una tarea |
| `assignment_grade` | Al recibir calificacion |
| `certificate_issued` | Al obtener un certificado |
| `course_complete` | Al completar un curso |
| `inactivity_alert` | Al superar X dias sin actividad |

### Consulta SQL para obtener alumnos inactivos

```sql
-- Alumnos sin actividad en los ultimos 5 dias
select
  p.id,
  p.full_name,
  p.email,
  max(al.created_at) as last_activity,
  count(distinct e.id) as enrolled_courses,
  avg(e.progress)::int as avg_progress
from public.profiles p
left join public.activity_logs al on al.user_id = p.id
left join public.enrollments e on e.user_id = p.id
where p.role = 'student'
group by p.id
having
  max(al.created_at) < now() - interval '5 days'
  or max(al.created_at) is null
order by last_activity asc nulls first;
```

---

## 2. Criterios para enviar emails de motivacion

### Nivel 1 — Recordatorio suave (5-7 dias sin actividad)

- Progreso: Cualquiera
- Accion: Email recordatorio con enlace directo al curso donde se quedaron
- Frecuencia: Una vez
- Asunto sugerido: "Tu curso te esta esperando, [nombre]"

### Nivel 2 — Alerta de riesgo (8-14 dias sin actividad + progreso < 50%)

- Progreso: Menos de 50%
- Accion: Email con resumen de avance y oferta de apoyo
- Frecuencia: Cada 3 dias
- Asunto sugerido: "Te ayudamos a retomar [nombre del curso]"

### Nivel 3 — Reactivacion (15+ dias sin actividad)

- Progreso: Cualquiera
- Accion: Email con contenido exclusivo o descuento para siguiente modulo
- Frecuencia: Cada 7 dias, maximo 3 envios
- Asunto sugerido: "[nombre], tenemos algo especial para ti"

### Alumnos que completaron un curso

- Accion: Email de felicitacion + invitacion al siguiente curso de la ruta
- Timing: 1 dia despues de completar
- Asunto sugerido: "Felicidades, [nombre]! Has completado [curso]"

---

## 3. Dashboard de monitoreo (Panel Admin)

El panel `/admin` muestra:

- **Total de alumnos** y desglose por estado (activo, en riesgo, inactivo)
- **Alumnos que necesitan motivacion** (5+ dias sin actividad y < 50% progreso)
- **Progreso promedio** general
- **Resumen de cursos** con alumnos inscritos

La pagina `/admin/alumnos` permite:

- Filtrar por estado (todos, activos, en riesgo, inactivos, necesitan email)
- Ver ultima actividad de cada alumno
- Identificar rapidamente quien necesita un email de motivacion
- Columna "Email" con recomendacion de accion

---

## 4. Automatizacion sugerida (Fase futura)

### Con Supabase Edge Functions

```sql
-- Funcion para obtener alumnos para campana de email
create or replace function get_students_for_campaign(
  min_inactive_days int default 5,
  max_progress int default 50
)
returns table (
  user_id uuid,
  full_name text,
  email text,
  last_activity timestamptz,
  avg_progress int,
  campaign_level text
) as $$
  select
    p.id,
    p.full_name,
    u.email,
    max(al.created_at) as last_activity,
    avg(e.progress)::int as avg_progress,
    case
      when max(al.created_at) < now() - interval '15 days' then 'reactivation'
      when max(al.created_at) < now() - interval '8 days' and avg(e.progress) < 50 then 'at-risk'
      when max(al.created_at) < now() - interval '5 days' then 'gentle-reminder'
      else 'none'
    end as campaign_level
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.activity_logs al on al.user_id = p.id
  left join public.enrollments e on e.user_id = p.id
  where p.role = 'student'
  group by p.id, u.email
  having max(al.created_at) < now() - (min_inactive_days || ' days')::interval
    and avg(e.progress) < max_progress
  order by last_activity asc;
$$ language sql security definer;
```

### Integracion con WooCommerce/Express

El backend Express existente puede consumir esta query mediante webhook programado (cron job) y disparar los emails usando:

1. Consultar `get_students_for_campaign()` cada 24h
2. Para cada alumno, determinar el nivel de campana
3. Enviar email via WooCommerce email API o servicio de emails transaccionales
4. Registrar el envio en `activity_logs` con tipo `inactivity_alert`

### Ejemplo de Edge Function

```typescript
// supabase/functions/send-motivation/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

serve(async (req) => {
  const { data: students } = await req.client
    .rpc('get_students_for_campaign', { min_inactive_days: 5, max_progress: 50 })

  for (const student of students) {
    // Enviar email segun campaign_level
    await sendEmail({
      to: student.email,
      subject: student.campaign_level === 'gentle-reminder'
        ? `Tu curso te esta esperando, ${student.full_name}`
        : `Te ayudamos a retomar, ${student.full_name}`,
      template: student.campaign_level,
    })

    // Registrar envio
    await req.client.from('activity_logs').insert({
      user_id: student.user_id,
      activity_type: 'inactivity_alert',
      description: `Email de ${student.campaign_level} enviado automaticamente`,
      metadata: { campaign_level: student.campaign_level },
    })
  }

  return new Response(JSON.stringify({ sent: students.length }))
})
```

---

## 5. Monitoreo manual desde el panel

Si no hay automatizacion configurada, el admin puede:

1. Ir a `/admin/alumnos`
2. Filtrar por "Necesitan email" para ver alumnos que requieren atencion
3. Para cada alumno, hacer clic en "Enviar motivacion"
4. Usar la informacion mostrada (ultima actividad, progreso, cursos) para personalizar el mensaje

### Template de email manual

```
Asunto: [nombre], tu progreso en [curso] te espera

Hola [nombre],

Notamos que hace [dias] dias no visitas [curso].
Llevas un [progreso]% de avance y te quedan [lecciones_restantes] lecciones por completar.

No dejes tu aprendizaje. Entra ahora y continua donde lo dejaste:
[enlace al curso]

Si necesitas ayuda, responde a este correo.

Qaway Academy
```

---

## 6. Notas tecnicas

- La tabla `activity_logs` tiene un indice compuesto por `(user_id, activity_type, created_at)` para consultas rapidas
- El campo `metadata` (JSONB) permite guardar datos adicionales como `course_id`, `lesson_id`, `campaign_level`
- Los RLS policies permiten que el admin vea todos los activity logs (rol = 'admin')
- Para produccion, implementar un batch limit (ej. max 50 emails por ejecucion) para evitar sobrecarga
