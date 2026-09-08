# AGENTS.md — Clinica (Qaway Lab)

App independiente del ecosistema Qaway Lab. Historial clínico dual (humano + veterinaria), vendible por separado.

## Stack
- React 19 · Vite 8 · Tailwind v4 (CSS-first, @theme en src/index.css) · React Router 7
- Supabase (auth + postgres + storage); lógica server-side en Edge Functions (Deno)
- framer-motion · lucide-react

## Comandos
- `npm run dev` (puerto 9500) · `npm run build` · `npm run lint` (oxlint)

## Arquitectura
- `src/clinica/context/ClinicaContext.jsx` — auth, carga de datos, CRUD (pacientes, dueños, consultas SOAP, vacunas, alergias, recetas), link seguro del dueño y expediente público por token.
- `src/clinica/pages/` — HomePage, LoginPage, DashboardPage, PatientDetailPage (tabs), PublicRecordPage (solo lectura).
- `supabase/migrations/0001_clinica_schema.sql` — 12 tablas multi-tenant, 13 políticas RLS, RPC `get_public_record(token)` (security definer, el anon NO toca tablas).
- `supabase/functions/send-notifications/` — cola `reminders` → Resend (email) + WhatsApp (Meta). Cron cada 5 min (ver README).

## Seguridad (no romper)
- **RLS**: solo el personal con membresía en la clínica accede (`get_user_clinic_ids`). Nunca abrir tablas a `anon`.
- **Acceso del dueño**: SOLO por la RPC `get_public_record` con token activo/no expirado. No añadir políticas anon sobre pacientes/consultas.
- Credenciales en `.env` (nunca en el código). La app usa `supabaseConfigured` para no crashear si faltan.

## Reglas
- No depender de otras apps ni de la web. Conectar solo por enlaces (jamás iframes).
- Estilos únicamente con tokens del @theme y paleta dark (#111111 / #18181b / #ff4b0b).
- Cada app tiene su propio proyecto Supabase y su .env.
- Planificar y pedir aprobación antes de aplicar cambios grandes.
