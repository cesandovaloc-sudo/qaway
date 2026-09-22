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

## Iteracion 2 (2026-09-22) — Modelo rol/tenant (SOLO frontend, sin Supabase)
- Nueva prop `isPlatformAdmin` (panelAuth.isPlatformAdmin, BD `users.role='admin' AND is_platform_admin`)
  como fuente de verdad; el modulo YA NO re-deriva el rol del JWT/metadata.
- Nueva prop `tenantName` (marca del tenant_admin) para la columna "Empresa".
- Gate + consulta:
  * platform_admin -> universo de usuarios (sin filtro; is_admin() en BD).
  * tenant_admin/vista -> SOLO `eq('tenant_id', tenantId)` (su marca).
  * sin rol ni tenant -> no consulta el universo global.
  * Plataforma enriquece "Empresa" con el nombre real del tenant (lectura `tenants` de su alcance).
- Roles del modelo BD alineados en la tabla/filtro/leyenda: Super Admin (admin+flag) / Admin (admin de marca)
  / Editor / Visor / Invitado; el tenant_admin nunca ve "Super Admin" en sus opciones ni Mock de otras marcas.
- Soporte del detalle: deep-link `/hub/panel/usuarios?usuario=id` resalta y centra la fila
  (siempre dentro del alcance permitido por tenant). Invitación dirigida a `/hub/invitar`.
- `HubSuperEmpresasModule.jsx`: gate `isPlatformAdmin` (solo el Super Admin consulta el listado global
  de `tenants`; tenant_admin ve "Acceso restringido", defensa en profundidad ademas del nav y la RLS).
- Diseno del panel y de los modulos intacto. Sin cambios en Supabase/migraciones.