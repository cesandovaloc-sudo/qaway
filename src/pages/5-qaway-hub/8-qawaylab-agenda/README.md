# Agenda (Qaway Lab)

App independiente y vendible de reservas en línea (estilo Cal.com) con Supabase.

## Flujo
1. **Negocio** entra al panel (`/panel`, login Supabase Auth) y configura disponibilidad + servicios.
2. **Cliente** abre el link público `/:slug` o `/:slug/:evento`, ve horarios libres en su zona horaria y reserva en 3 pasos.
3. **Notificaciones**: confirmación (email + WhatsApp) y recordatorios 24h/1h antes, vía edge functions + cron.
4. **Cliente** puede cancelar desde el link seguro `/gestionar/:token`.

## Setup
1. `npm install`
2. Crear proyecto Supabase propio y ejecutar `supabase/migrations/0001_agenda_schema.sql` (tablas + RLS + anti doble-reserva).
3. Desplegar edge function central `agenda-send-notifications` (vive en `supabase/functions/` raíz). Sin Stripe ni create-payment.
4. Configurar claves en `.env`: Supabase, Resend, WhatsApp (Meta). Sin Stripe (no opera en Perú).
5. Activar el cron de recordatorios (comentado al final de la migración).
6. `npm run dev` → http://localhost:8500

## Reglas
Ver `AGENTS.md`. Multi-tenant con RLS por `business_id`; cada cliente su propio proyecto Supabase para vender.
