# 02 - Estado actual, conexiones y deuda

## Estado actual confirmado (Supabase)

Confirmado por consulta al proyecto:

### Tablas base

- `public.users`
  - 1 fila por persona, ligada a Auth (`id`).
  - Tiene `tenant_id` único, `role`, `permissions`, `is_platform_admin`.
  - **No existe tabla de membresías** (`user_tenant`/`membership` no encontradas).
- `public.tenants`
  - Incluye `id`, `slug`, `name`, `status`, `branding`, `content`, `features`, `payment_settings`, etc.
- `public.tenant_app_subscriptions` (10 filas)
  - Relación por `tenant_id + app_id`.
  - Campos relevantes: `plan`, `status`, `trial_*`, `mp_preapproval_id`, `current_period_*`.
- `public.user_app_roles` (5 filas)
  - Relación por `user_id + tenant_id + app_id`.
  - Campos relevantes: `role`, `permissions`, timestamps.

### Funciones/RLS críticas

- `get_auth_tenant_id()`:
  - devuelve `tenant_id` desde `public.users` donde `id = auth.uid()`.
  - Esto fuerza el modelo actual de **un tenant por identidad**.
- `is_platform_admin()`:
  - considera admin de plataforma por rol admin + `is_platform_admin` o `tenant_id is null`.

## Conexiones existentes que NO se deben perder

### Onboarding / Hub

- `HubOnboardingPage.jsx` ya consulta `tenant_app_subscriptions` para retomar el paso.
- El onboarding ya hace `upsert` en `user_app_roles` al asignar apps/roles.
- El modelo SaaS ya tiene migraciones/estructura para:
  - `app_catalog`
  - `tenant_app_subscriptions`
  - `user_app_roles`
  - helpers como `tenant_app_plan`, `user_can_use_app`, `user_app_role`

### Modelo actual en uso

- Front y servicios asumen en varios puntos `users.tenant_id`.
- RLS y helpers asumen tenant único por usuario autenticado.
- Apps/hub ya tienen lógica de suscripción por app y rol por app; esto es base reutilizable.

## Deuda controlada (se pausa, no se elimina)

Por practicidad de pruebas y primeros suscriptores, se puede trabajar sin onboarding completo y sin activar todo el flujo comercial, pero queda **deuda obligatoria**:

1. **Conectar modelo de membresías con onboarding existente**.
   - No rehacer onboarding desde cero.
   - Adaptar para que cree/seleccione tenant y membresía, no solo `users.tenant_id`.
2. **Conectar suscripciones por app**.
   - `tenant_app_subscriptions` debe seguir siendo fuente de habilitación por tenant/app.
3. **Conectar roles por app**.
   - `user_app_roles` debe seguir siendo fuente de rol/permisos por usuario/tenant/app.
4. **Revisar gates y activación**.
   - Cualquier gate deshabilitado por pruebas debe quedar documentado, con ruta de reactivación.
5. **RLS/funciones**.
   - Migrar de `get_auth_tenant_id()` single-tenant a contexto/membresía validada.

## Brechas principales

| Brecha | Estado actual | Objetivo |
|---|---|---|
| Identidad vs tenant | `users.tenant_id` único | Membresía usuario–tenant múltiple |
| Contexto activo | Implícito en usuario | Contexto activo explícito y validado |
| RLS tenant | `get_auth_tenant_id()` lee `users.tenant_id` | Resolver tenant activo por membresía/sesión/contexto |
| Crear tenant adicional | No gobernado para multi-membresía | Bloqueado por defecto; aprobación/regla plataforma admin |
| Offboarding | No definido como flujo completo | Desactivar acceso, preservar data, reasignar |
| Onboarding | Avanzado pero ligado a tenant único | Deuda: adaptar sin perder tablas/lógica |