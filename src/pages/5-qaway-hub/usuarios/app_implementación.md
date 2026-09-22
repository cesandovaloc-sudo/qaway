# app_implementacion — Usuarios (Hub Panel)

Carpeta de la seccion Usuarios del Qaway Hub Panel.

Nota: `UsuariosPage.jsx` es la pagina "Usuarios y marca" (por tenant, diseno claro)
que continua viviendo en `/hub/usuarios`. NO se reemplaza ni se elimina.

## Iteracion 1 (2026-09-22) — Modulo de usuarios del Super Admin dentro del panel (30.X)
- Modulo acoplado: `HubSuperUsersModule.jsx` (UsersModule), mismo contrato que EmpresasModule:
  sin router, sin layout, sin auth; recibe `tenantId`, `session`, `supabase`, `onInviteUser`, `onOpenUser`.
- Se renderiza como seccion del panel en `HubPanelPage.jsx` cuando `activeTab === 'Usuarios'`
  (ruta `/hub/panel/usuarios`), usando el contexto real sesion+tenant del panel.
- `onInviteUser` dirige a `/hub/invitar`. `onOpenUser` navega a `/hub/panel/usuarios?usuario=id`.
- Shell oscuro + sidebar + topbar intactos; diseno del modulo intacto (KPIs, tarjetas blancas).
- `/hub/usuarios` (pagina de marca por tenant) permanece sin cambios. `AppRouter.jsx` sin cambios.
- No requiere wrapper ni version standalone: el modulo ya no tiene version duplicada que limpiar.