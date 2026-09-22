# Invitación de usuarios — iteración

## app_implementación (invitar/)

- `InvitarPage.jsx`: wrapper de conexión. Resuelve sesión real y rol.
  - Super Admin (`is_platform_admin=true`): carga `tenants` activos y presenta selector de empresa destino (opera globalmente).
  - Tenant Admin: `tenant_id` fijado al suyo, sin selector (no cambiable).
- `HubInviteUserModule.jsx`: módulo visual externo (503 líneas). Conexión aditiva:
  - Props nuevas opcionales: `tenantOptions` (array {id,name}) y `tenantName`; sin ellas el comportamiento es idéntico (backward compatible).
  - Paso 1: selector "Empresa destino" visible solo con `tenantOptions`.
  - Paso 4: muestra empresa destino bajo el correo.
  - Envío usa `inviteTenantId` y valida que exista.
- Edge `invite-user`: sin cambios — ya rechaza a no-global con tenant ajeno (403) y valida tenant activo.

## Resultado jerárquico

- Invitación → `user_invites` → email Auth → alta → trigger → `users` + `user_app_roles` por app.
- `Ana | EPC | CRM | Editor` — asignación por aplicación.

## Pendiente

- E2E en vivo contra Central con Service Role (caso EPC Contable).
- Inventario: conectar `user_app_role('inventario')` con `rolePermissions`.