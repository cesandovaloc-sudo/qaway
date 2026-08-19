# INTEGRATIONS

## Actual
- WhatsApp mediante enlace `wa.me` (centralizado en `data/site.ts`).
- Ubicación dinámica: enlace a Google Maps ("Cómo llegar") generado desde `NEXT_PUBLIC_GOOGLE_MAPS_URL` o automáticamente desde la dirección; sin iframes.

## Preparado para futuro
- Catálogo y carrito.
- Supabase u otro backend mediante repositorios/adaptadores.
- CRM.
- Agenda.
- Analítica.

Regla: ningún componente visual debe consultar Supabase directamente.
