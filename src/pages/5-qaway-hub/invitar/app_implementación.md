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

- E2E en vivo contra Central con Service Role (caso EPC Contable) — **PASS** (rama `main`).
- Inventario: conectar `user_app_role('inventario')` con `rolePermissions` — **hecho**.

## Caso B (correo ya cuenta Qaway) — edge `invite-user` v2

- `inviteUserByEmail` rechaza correos ya registrados → antes: 500 genérico ("non-2xx").
- Ahora detecta "already registered" y responde **error claro en español** (HTTP 200 con `{error}`) para que el módulo lo muestre:
  "X ya es una cuenta de Qaway. Asígnalo desde Usuarios en la empresa destino, o usa otro correo."
- OBJETIVO: invitar es para quien NO tiene cuenta; usuarios existentes se asignan desde Usuarios. **Sin auto-asignación silenciosa.**
- **Todos los errores de negocio vuelven HTTP 200 con `{error}` en español** (sesión caducada, solo admin, correo inválido, rol inválido, marca inválida, sin apps, ya es cuenta, correo no enviado) + try/catch final con mensaje — la UI nunca debe mostrar "non-2xx" genérico.
- **Requiere redeplegar `invite-user`** para surtir efecto en vivo.