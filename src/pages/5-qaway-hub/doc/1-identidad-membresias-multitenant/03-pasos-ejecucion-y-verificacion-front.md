# 03 - Pasos de ejecución y verificación front

Se ejecuta en **3 pasos grandes**. Cada paso se cierra solo cuando su verificación visible en front/ruta funciona. No se deja deuda invisible dentro del paso.

## Paso 1 - Identidad, membresías y contexto activo

### Alcance

- Crear modelo de membresías persona–tenant (DB, alcance agente DB).
- Definir contexto activo: en qué tenant está trabajando la persona.
- Permitir que una identidad tenga varias membresías, con aislamiento total.
- Implementar selector de contexto cuando haya más de un tenant válido.
- Mantener entrada directa cuando solo haya un contexto válido.

### Rutas / comportamiento esperado

- Entrada por app/slug: si el usuario tiene 1 membresía válida para ese contexto, entra directo.
- Entrada por Hub/login común: si tiene varias membresías, ve selector de tenant.
- Selector muestra solo tenants donde tiene membresía activa; ejemplo:
  - DIGERE
  - Financiera Pulir
  - Caballeros del Zodiaco
- Al elegir tenant, la sesión/contexto queda fijado a ese tenant; no mezcla datos.

### Sesión / contraseña (aclaración)

- En opción 1, la persona tiene **una identidad** y **una credencial** de esa identidad (salvo métodos adicionales vinculados a la misma cuenta).
- No se crean contraseñas distintas por tenant.
- Flujo tipo Outlook:
  1. Usuario inicia sesión con su cuenta.
  2. Si tiene varios tenants, selecciona contexto.
  3. Puede cerrar sesión.
  4. Al volver a ingresar, se autentica con la misma cuenta y el sistema le vuelve a mostrar el contexto adecuado: directo si solo hay uno, selector si hay varios.
- Si entra por un slug/app específico, el sistema primero autentica identidad y luego valida si esa identidad tiene membresía para ese tenant/app.

### Verificación front (cierre de paso)

- Usuario con 1 tenant: entra directo, sin selector innecesario.
- Usuario con 3 tenants: al ingresar ve selector con los 3; al entrar a cada uno ve solo datos de ese tenant.
- Cambiar de tenant actualiza branding, datos, apps y permisos visibles.
- No hay mezcla de datos entre tenants.

## Paso 2 - Apps, suscripciones, roles y conexión con lo existente

### Alcance

- Conectar membresía/contexto con `tenant_app_subscriptions` y `user_app_roles`.
- Mantener Hub opcional: acceso directo por app o por Hub.
- Reusar onboarding/tablas/lógica existente; no rehacer ni borrar.
- Adaptar gates para que usen contexto activo + membresía + suscripción + rol.

### Rutas / comportamiento esperado

- Tenant con 1 app: entra directo a esa app.
- Tenant con varias apps: ve solo las apps suscritas por el tenant y permitidas para su rol.
- Usuario en DIGERE ve apps de DIGERE; en Financiera Pulir ve apps de Financiera Pulir, aunque sea el mismo correo.
- Onboarding/suscripciones: queda documentado y conectado por fases; si está pausado por pruebas, el gate debe ser explícito y reversible.

### Verificación front (cierre de paso)

- En cada tenant, el catálogo visible coincide con sus suscripciones.
- El rol por app se respeta (admin/editor/viewer/guest según corresponda).
- Entrar por slug de app no permitida muestra bloqueo claro, no datos de otro tenant.
- El flujo existente de onboarding/suscripciones no se pierde; se puede reactivar según deuda documentada.

## Paso 3 - Administración, offboarding y controles de plataforma

### Alcance

- Invitar usuarios a tenant y asignar apps/roles.
- Permitir quitar/desactivar acceso desde front.
- Definir reasignación de responsabilidad y preservación de data.
- Implementar regla de creación de tenants adicionales: bloqueada por defecto, habilitable/aprobable por plataforma admin.

### Rutas / comportamiento esperado

- Admin de tenant: gestiona usuarios de su tenant, invita, asigna apps/roles, desactiva acceso.
- Plataforma admin: puede aprobar/habilitar creación de tenant adicional para identidad existente.
- Usuario despedido/renunciado: pierde acceso al tenant, pero no desaparece su trabajo.

### Verificación front (cierre de paso)

- Admin de tenant puede desactivar usuario y el usuario ya no entra a ese tenant.
- El avance del usuario removido sigue visible: proyectos, tareas, registros, auditoría.
- Se puede reasignar responsable/propietario operativo.
- Crear tenant adicional con mismo correo está bloqueado por defecto; solo funciona si plataforma admin lo aprueba/habilita.

## Estado de ejecución

### Paso 1 - CERRADO (verificación visible front/ruta)

- **DB aplicado y validado**: migración `20261125000000_identity_memberships_step1.sql` aplicada. Creadas `tenant_memberships`, `user_active_context`, `identity_tenant_creation_grants`; backfill 5 membresías activas + 5 contextos activos; helpers/RPCs/RLS presentes.
- **Front implementado**: `AuthContext` carga membresías/contexto activo; 1 membresía entra directo; múltiples sin contexto activo exigen selector (`RequireAuth`); `set_active_tenant` sincroniza `users.tenant_id` por compatibilidad.
- **Ajustes de cierre durante verificación**:
  - `AuthContext`: con múltiples membresías y sin contexto activo ya no hace fallback a `users.tenant_id`; deja `activeTenantId=null` para mostrar selector.
  - `HubAccessGuard`: resuelve tenant por `user_active_context` + `tenant_memberships` (fallback legacy `users.tenant_id`); si hay múltiples membresías sin contexto activo en ruta de app, deja pasar al selector de la app.
  - DB: `prevent_role_escalation` ajustado para permitir que el propio usuario sincronice su `users.tenant_id` solo a un tenant donde tenga membresía activa (compatibilidad de `set_active_tenant`), sin permitir cambios de `is_platform_admin` ni escalación.
- **Pruebas**: `RequireAuth.test.tsx` pasando (7/7).
- **Verificación visible (2026-11-25, localhost:4100)**:
  - Usuario 1 tenant (`connectingperu.online@gmail.com`, Prueba Chulls): entró directo a `/hub/inventario`, sin selector; cabecera mostró "Empresa asignada: Prueba Chulls" y datos del tenant (actividad "Ropa 1").
  - Usuario 3 membresías (cuenta de prueba temporal con Constructora/DIGERE/Prueba Chulls): al entrar a `/hub/inventario` vio selector "Selecciona una empresa" con los 3 tenants; al elegir Constructora cargó contexto Constructora (`/tienda/minedu-prueba-2-kjos` en links de tienda); tras limpiar contexto y elegir Prueba Chulls cargó contexto Prueba Chulls (`/tienda/prueba-chulls`), sin mezcla visible. Datos temporales de prueba limpiados.
- **Estado**: Paso 1 cerrado.

### Paso 2 - IMPLEMENTACIÓN COMPLETA (solo validación visual pendiente)

- **Implementado**:
  - `AuthContext` refresca perfil/rol al cambiar tenant y emite `qaway:tenant-context-changed`; `HubAccessGuard` reevalúa por contexto activo/membresía/suscripción de app.
  - `useAppAccess` reevalúa `user_can_use_app` al cambiar contexto y ya no usa lista fija limitada; consulta catálogo y refresca por evento.
  - `HubPanelPage` filtra catálogo/rutas visibles por suscripción activa del tenant (`tenant_app_subscriptions` active/trialing) + permiso por app (`user_can_use_app`/denied), y refresca con `qaway:tenant-context-changed`.
  - `AplicacionesModule` recibe `allowedAppSlugs` y muestra solo apps permitidas por tenant.
  - Rutas de app no permitidas quedan bloqueadas por `HubAccessGuard` con `AppAccessLockedView` (sin exponer datos de otro tenant).
  - Onboarding/suscripciones permanece pausado/reusable (gate explícito reversible en `HubAccessGuard`, tablas/lógica existentes intactas; no rehacer ni borrar).
- **Pendiente**: solo validación visual del usuario en front/ruta.

### Paso 3 - IMPLEMENTACIÓN COMPLETA (solo validación visual pendiente)

- **Implementado**:
  - `admin_assign_user_tenant` upserta `tenant_memberships`; `remove_tenant_member` desactiva membresía, revoca roles de app del tenant, limpia contexto activo/legacy, conserva data y deja auditoría en metadata.
  - `UsuariosPage` tiene offboarding no destructivo con modal previo de impacto/reasignación: muestra membresía, apps/roles del tenant, advertencia de preservación de data/historial, responsable operativo opcional y motivo de auditoría.
  - `invite-user` agrega/reactiva membresía para identidad existente; `register-brand` bloquea tenant adicional por defecto y exige grant/aprobación de plataforma.
  - `HubSuperUsersModule` (plataforma admin) incluye UI para aprobar/revocar `identity_tenant_creation_grants`, con max tenants extra, motivo y auditoría (approved_by/fechas/estado).
- **Pendiente**: solo validación visual del usuario en front/ruta.


## Checklist de validación visual pendiente (usuario)

### Paso 2
- URL: `http://localhost:4100/hub/panel/aplicaciones` (usuario con tenant activo y suscripciones conocidas).
  - Ver que el catálogo visible coincide con apps suscritas activas/trial del tenant activo.
  - Cambiar contexto/tenant (selector de empresa o flujo de contexto activo) y confirmar que el catálogo se actualiza al tenant activo.
- URL: `http://localhost:4100/hub/panel` y rutas de apps (ej. `/hub/inventario`, `/hub/crm`, `/hub/agenda`, `/hub/blog-editor` según suscripción).
  - Entrar por slug de app no permitida para el tenant/rol activo: debe mostrar bloqueo claro (`AppAccessLockedView`), sin datos de otro tenant.
- Confirmar que onboarding/suscripciones sigue pausado/reusable: no hay rework destructivo; flujo existente intacto.

### Paso 3
- URL: `http://localhost:4100/hub/panel/usuarios` como admin de tenant.
  - En “Personal de tu marca”, pulsar “Retirar acceso”: debe abrir modal de impacto/reasignación antes de confirmar.
  - Verificar que modal muestra usuario, membresía, apps/roles, aviso de preservación de data/historial, campo de reasignación operativa y motivo.
  - Confirmar retiro: usuario pierde acceso a ese tenant; su data/avance/historial no se borra.
- URL: `http://localhost:4100/hub/panel/usuarios` como plataforma admin (`s.admin@qawaylab.com`).
  - Ver bloque “Aprobaciones: crear tenant adicional”.
  - Aprobar/revocar grant para una identidad, con max tenants extra y motivo; verificar estado/auditoría en tabla.
- Flujo register-brand (mismo correo, tenant adicional): por defecto bloqueado; con grant aprobado por plataforma admin debe permitir según regla.
