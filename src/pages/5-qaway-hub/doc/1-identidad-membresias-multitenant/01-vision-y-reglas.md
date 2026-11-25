# 01 - Visión y reglas

## Objetivo

Definir el modelo de identidad y acceso de Qaway para que una misma persona pueda participar en varios tenants/apps sin mezclar datos, manteniendo slugs por app, suscripciones por tenant y control administrativo.

## Modelo base (opción elegida)

- **1 identidad = 1 persona = 1 correo** en Supabase Auth.
- **Múltiples membresías por tenant**: la misma persona puede pertenecer a DIGERE, Financiera Pulir y su propio tenant.
- **Acceso por contexto**: toda autorización debe evaluarse por `usuario + tenant activo + app + rol + suscripción`.
- **Aislamiento total**: compartir identidad no comparte datos, permisos, historial ni configuración entre tenants.
- **Hub opcional**: la empresa puede entrar directo a una app por slug; el Hub sirve para descubrir/cambiar apps o contextos cuando aplica.
- **Login opcional como experiencia**: la entrada puede resolverse por slug/app/sesión; si hay un solo contexto válido, entra directo; si hay varios, se pide elegir contexto.

## Reglas de negocio

### 1. Membresía multi-tenant

- Una persona puede tener membresías en varios tenants.
- Cada membresía define su estado y rol en ese tenant.
- El acceso a apps depende de:
  - membresía activa en el tenant;
  - app habilitada/suscrita por el tenant (`tenant_app_subscriptions`);
  - rol/permisos del usuario en esa app (`user_app_roles`).

### 2. Crear varios tenants con el mismo correo

- **Por defecto: bloqueado**. Una identidad no debe crear tenants adicionales sin control.
- **Opcional y configurable**: la capacidad puede habilitarse por regla de plataforma.
- **Aprobación de plataforma admin**: antes de habilitar o aprobar la creación de un tenant adicional para una identidad ya existente, debe existir control/aprobación de admin de plataforma (o regla explícita activada por plataforma).
- **No es limitación de Auth**: Supabase Auth impide duplicar la identidad por correo; no impide que la misma identidad tenga otra membresía/propiedad. El límite es regla de negocio/producto.

### 3. Sin mezcla de datos

- Ninguna consulta, vista, acción o ruta debe usar solo `users.tenant_id` como verdad final en el modelo objetivo.
- El contexto activo debe ser explícito y validado contra membresía.
- Cambiar de tenant cambia el contexto completo: datos, apps visibles, roles, suscripciones, branding y permisos.

### 4. Offboarding / salida

- El tenant puede quitar o desactivar el acceso de un usuario desde front.
- Quitar acceso **no elimina el avance** ni la data creada por el usuario.
- Los registros deben conservar autoría/historial; la responsabilidad operativa se reasigna.

## Decisiones ya tomadas

- No duplicar cuentas Auth por app con el mismo correo.
- No usar “cuenta Qaway por tenant” como modelo por defecto.
- Mantener slugs y entradas independientes por app.
- Reusar la base existente de suscripciones/roles por app; no perderla.
- Implementar por pasos grandes, con verificación visible en front al final de cada paso.
- Trabajo de esquema/RLS/funciones DB: alcance de agente DB cuando se ejecute; este documento define el contrato.