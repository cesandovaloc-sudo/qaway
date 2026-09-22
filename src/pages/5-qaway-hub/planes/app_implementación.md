# app_implementacion — Planes y Precios (Hub Panel)

Carpeta de la seccion Planes y Precios del Qaway Hub Panel.

## Iteracion 1 (2026-09-22) — Modulo de planes dentro del panel (30.X)
- Modulo acoplado: `HubSuperPlanesPreciosPage.jsx` (PlanesPreciosPage).
  Autocontenido, sin props, sin router. Datos iniciales reproducen la referencia visual;
  las acciones abren modales locales listos para conectar Supabase sin rehacer la UI.
- Se renderiza como seccion del panel en `HubPanelPage.jsx` cuando `activeTab === 'Planes'`
  (ruta `/hub/panel/planes`).
- Shell oscuro + sidebar + topbar intactos; diseno del modulo intacto (fondo claro propio #f8f9fb).
- `AppRouter.jsx` sin cambios; no requiere wrapper ni version standalone.