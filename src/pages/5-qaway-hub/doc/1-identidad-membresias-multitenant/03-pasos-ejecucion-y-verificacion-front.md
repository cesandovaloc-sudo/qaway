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

### Paso 2 - PAUSADO (deuda, no cerrado)

- **Base aplicada**: `AuthContext` refresca perfil/rol al cambiar tenant y emite `qaway:tenant-context-changed`; `HubAccessGuard` reevalúa con contexto activo/membresías y filtra acceso multi-membresía sin contexto por suscripción de app; `RequirePlanFeature` reevalúa al cambiar tenant activo.
- **Deuda pendiente para cerrar**: verificación visible de catálogo Hub por suscripciones del tenant activo; rol por app en rutas reales; bloqueo claro en slug no permitido sin mezclar datos; confirmar onboarding/suscripciones pausado/reusable. No rehacer ni borrar tablas/lógica existente.
- **Estado**: pausado por decisión del usuario (prioridad en otro frente). Retomar antes de dar Paso 2 por cerrado.

### Paso 3 - EN CURSO (avance base)

- **DB/RPC aplicado**: `admin_assign_user_tenant` ahora también upserta `tenant_memberships` (compatibilidad legacy); creada `remove_tenant_member` (desactiva membresía, revoca `user_app_roles` del tenant, limpia contexto activo/legacy `users.tenant_id`, conserva data; auditoría en metadata). Migración: `20261125160000_identity_memberships_step3_offboarding_rpcs.sql`.
- **Front/funciones actualizado**:
  - `UsuariosPage.jsx`: lista desde `tenant_memberships`, “Retirar acceso” no destructivo vía `remove_tenant_member`.
  - `invite-user`: si el correo ya existe, no duplica identidad; agrega/reactiva membresía y roles de app en tenant destino (Option 1).
  - `register-brand`: crear tenant adicional con mismo correo bloqueado por defecto; permite solo con `can_create_additional_tenant`/grant; crea `tenant_memberships` + `user_active_context`.
- **Pendiente para cerrar Paso 3**: UI/flujo de plataforma admin para aprobar/revocar `identity_tenant_creation_grants`; UI de impacto/reasignación antes de offboarding; validación visible front/ruta de retiro de acceso, preservación de data, reasignación y bloqueo/aprobación de tenant adicional. Onboarding/suscripciones siguen como deuda reusable, no rehacer.