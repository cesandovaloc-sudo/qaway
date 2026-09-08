# Clínica (Qaway Lab)

App independiente y vendible de **historial clínico electrónico** (dual: humanos + veterinaria) con Supabase.

## Qué hace

- **Expediente completo**: fichas de pacientes (mascotas con especie/raza/microchip o personas con DNI), notas SOAP por consulta, signos vitales, diagnósticos, vacunas con refuerzos, alergias con severidad y recetas.
- **Alertas automáticas**: vacunas por vencer (próximos 30 días), recordatorios de seguimiento y citas → notificaciones reales por **email (Resend)** y **WhatsApp (Meta Cloud API)** vía edge function + cron.
- **Link seguro del dueño**: el tutor accede al expediente de su paciente **sin login** por un enlace con token único (solo lectura). El `anon` no puede leer ninguna tabla; solo la RPC `get_public_record`.
- **Multi-tenant**: cada clínica es un tenant aislado con **RLS estricto** (un usuario solo ve los datos de sus clínicas vía `clinic_memberships`).

## Setup

1. `npm install`
2. Crear proyecto Supabase propio y ejecutar `supabase/migrations/0001_clinica_schema.sql` (tablas + RLS + RPC segura).
3. Desplegar la edge function `send-notifications`.
4. Activar `pg_cron` en Supabase Dashboard y programar:
   ```sql
   select cron.schedule('clinica-reminders', '*/5 * * * *',
     $$ select net.http_post(url := 'https://TU-PROYECTO.supabase.co/functions/v1/send-notifications',
        headers := jsonb_build_object('Content-Type','application/json',
          'Authorization', 'Bearer TU_SERVICE_ROLE_KEY'),
        body := '{}'::jsonb) $$);
   ```
5. Configurar `.env`: Supabase, Resend (`RESEND_API_KEY`), WhatsApp (`WHATSAPP_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`).
6. Crear el usuario admin en Supabase Auth (Users → Add user) y entrar en `/panel`.

## Rutas

- `/` — landing
- `/login` — acceso del personal
- `/panel` — dashboard (pacientes + alertas)
- `/paciente/:id` — expediente completo con tabs
- `/expediente/:token` — vista solo-lectura del dueño (sin login)
