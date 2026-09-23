# Fase B — Accesos por rol: pendientes para Supabase

> Mensaje de traspaso para el agente Supabase. **No es migración lista para aplicar**;
> revisar cada punto y confirmar antes de crear archivos SQL.

## Contexto

El panel `/hub/panel/*` quedó separado por rol en el frontend:

- `platform_admin` → nav global completo.
- admin de marca (`users.role = 'admin'` con `tenant_id`) → `TENANT_ADMIN_NAV`.
- trabajador (`editor` / `viewer` / `guest`) → "Mi espacio" + apps asignadas
  (`user_app_roles` propias) + secciones otorgadas en `users.permissions.panel`.

El nuevo editor "Gestionar permisos" (tab Usuarios del panel) otorga apps con rol
(admin/editor/viewer/guest) y secciones de panel otorgables (Reportes, Pagos,
Suscripciones, Planes, Soporte). **Usuarios y Configuración son exclusivas de
administrador** y el frontend las bloquea por `ADMIN_ONLY_NAV`.

## Estado real del backend (ya existe, no rehacer)

Verificado en migraciones aplicadas:

| Capacidad | Mecanismo | Ubicación |
|---|---|---|
| `is_tenant_admin()` = rol `admin` con tenant | función SQL | `20260921133000` |
| tenant admin lee/escribe `user_app_roles` del su tenant | `uar_tenant_admin_manage` **FOR ALL** | `20260921133000` |
| tenant admin actualiza `users` de su tenant (incl. `permissions`) | `users_tenant_admin_update` | `20260921133000` |
| plataforma gestiona `user_app_roles` | `uar_admin_all` | `20260921130000` |
| anti-escalada: solo plataforma mueve tenant/bandera o otorga `admin` | `prevent_role_escalation` v3 | `20260921133000` |

El frontend ya usa **escritura directa por RLS** para ambos administradores
(updates a `user_app_roles` + `users.permissions`); **no se requieren RPC nuevos**.

## ÚNICO punto accionable

### 1. Rol `'manager'` aceptado pero imposible de guardar

`public.admin_assign_user_tenant(p_user_id, p_tenant_id, p_role)`
(`20260921133000` línea ~175) permite `p_role IN ('viewer','editor','manager','admin')`,
pero el CHECK de `public.users.role` solo admite `('admin','editor','viewer','guest')`
(`20260812000000` línea 37). Cualquier llamada con `'manager'` revienta en el UPDATE.

Decisión a tomar (una de las dos):
- **A)** Agregar `'manager'` al CHECK de `users.role` y al allowlist del editor del
  frontend si el rol debe existir de verdad, o
- **B)** quitar `'manager'` del allowlist de `admin_assign_user_tenant` si es un rol
  que no se usa (recomendado: hoy el panel solo maneja admin/editor/viewer/guest).

## Observaciones (no bloqueantes, decidir si endurecer)

### 2. Auto-otorgamiento de `permissions` por el propio trabajador

`users_update_own_or_admin` (`20260812000000`) permite `auth.uid() = id`, y
`prevent_role_escalation` v3 solo vigila `role` / `tenant_id` / `is_platform_admin`,
**no `permissions`**. Un trabajador podría auto-otorgarse secciones del panel vía
directo. El frontend ya bloquea Usuarios/Configuración (`ADMIN_ONLY_NAV`), pero si se
quiere blindar server-side: extender `prevent_role_escalation` para rechazar cambios
a `permissions` cuando `auth.uid() = new.id` a menos que `is_platform_admin()` o
`is_tenant_admin()` del mismo tenant.

### 3. Directorio visible para todo el tenant

`users_tenant_read` (`20260921133000`) permite SELECT de todos los usuarios del tenant
a cualquier miembro (incl. `viewer`). Si el directorio debe ser solo de administración,
acotar la política a `is_tenant_admin()`.

## Frontend ya entregado

- `src/pages/5-qaway-hub/HubPanelPage.jsx` — navegación por rol, guard, `WorkerHome`,
  `RestrictedCard`, branch de Inicio.
- `src/pages/5-qaway-hub/HubSuperUsersModule.jsx` — editor "Gestionar permisos" por
  usuario (escritura directa RLS para plataforma y admin de marca).
- Estado: typecheck y oxlint verdes; sin commit ni push (coordinar rama `main-web`).