# app_implementacion — Aplicaciones (Hub Panel)

Carpeta de la seccion Aplicaciones del Qaway Hub Panel.

## Iteracion 1 (2026-09-22) — Modulo de aplicaciones del Super Admin dentro del panel (30.X)
- Modulo acoplado: `HubSuperAplicacionesModule.jsx` (AplicacionesModule).
  Contrato: `tenantId`, `session`. Sin router, sin layout, sin auth.
  UI con catalogo estatico (INITIAL_APPS); cuando se conecte a datos reales usara el
  cliente Supabase central (no crea tablas ni RLS).
- Se renderiza como seccion del panel en `HubPanelPage.jsx` cuando `activeTab === 'Aplicaciones'`
  (ruta `/hub/panel/aplicaciones`), usando el contexto real sesion+tenant del panel.
- Shell oscuro + sidebar + topbar intactos; diseno del modulo intacto (fondo claro propio #f8f8f7).
- `AppRouter.jsx` sin cambios; no requiere wrapper ni version standalone.