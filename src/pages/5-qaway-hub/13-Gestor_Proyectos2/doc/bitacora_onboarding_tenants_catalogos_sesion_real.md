# Bitácora: Onboarding de Tenants sin Pago, Sesión Real y Alineación de Catálogos
**Fecha:** 16–17 de Noviembre de 2026  
**Ámbito:** Qaway Hub (`src/pages/5-qaway-hub/`) y Gestor de Proyectos 2 (`src/pages/5-qaway-hub/13-Gestor_Proyectos2/`)

---

## 1. Contexto y Objetivos
1. Permitir el alta asistida de nuevas empresas (tenants) directamente desde el Hub Panel administrativo sin exigir pasarela de pagos ni obligar a pasar por el embudo de onboarding comercial (`/onboarding`).
2. Suministrar credenciales iniciales con DNI (contraseña temporal = DNI) forzando cambio de clave al entrar, generando enlaces de acceso directo a la aplicación contratada (`/login?redirect=/gestor_proyectos`) o al Hub Panel (`/login?redirect=/hub/panel`).
3. Aislar la navegación del tenant: en el menú Wafer y en el módulo Aplicaciones solo deben figurar las apps activas contratadas por su empresa; en el Sidebar del tenant se ocultan módulos en construcción y solo quedan `Usuarios` y `Suscripciones`.
4. Conectar la sesión real de Supabase en el Topbar de Gestor de Proyectos 2: eliminar avatar y rol hardcodeados ("Carlos Sandoval / Coordinador General"), mostrar identidad real de `public.users` / `public.tenants` y ejecutar cierre de sesión real (`signOut()` hacia `/login`).
5. Alinear el catálogo de estados de ejecución `gp_estados_ejecucion_c`: transición de `completada` a `completado`, desactivación lógica de estados sin UI (`en_revision`, `bloqueada`, `cancelada`), incorporación del componente selector `EstadoEjecucionCatalogoSelect` y sincronización con `Tareas2View.tsx` al 100% de progreso.

---

## 2. Modificaciones Realizadas

### 2.1 Alta Directa de Tenant sin Pago (Hub Panel)
* **Archivo:** `src/pages/5-qaway-hub/HubSuperSuscripcionesPanel.jsx`
  * Botón de encabezado `+ Nueva suscripción` abre pop-up modal directo.
  * Inserta en `public.tenants` con `status = 'active'` y `features = {"onboarding_completed": true}` evitando el rebote de `HubPanelPage.jsx` hacia `/onboarding`.
  * Registra las suscripciones correspondientes en `public.tenant_app_subscriptions` con `status = 'active'`.
  * Toggle **"Alta con contraseña"**: captura DNI de 8 dígitos y provisiona automáticamente al usuario administrador usando la Edge Function `admin-provision-user` (contraseña inicial = DNI).
  * Botones para copiar credenciales y enlaces directos con el parámetro canónico `?redirect=`.

### 2.2 Despliegue de Backend
* **Función:** `supabase/functions/admin-provision-user/`
  * Desplegada en producción en el proyecto Supabase (`npx supabase functions deploy admin-provision-user --use-api`).

### 2.3 Aislamiento de Navegación y Menús
* **Archivo:** `src/pages/5-qaway-hub/HubPanelPage.jsx`
  * `TENANT_ADMIN_NAV`: reducido a `Usuarios` y `Suscripciones` para administradores de tenant.
  * Consulta reactiva de `allowedAppSlugs` desde `tenant_app_subscriptions` para el tenant en sesión.
* **Archivo:** `src/pages/5-qaway-hub/5-gestor-de-proyectos/components/AppSwitcherDropdown.jsx`
  * Menú Wafer filtrado por `allowedAppSlugs` (usuarios de tenant solo ven sus aplicaciones contratadas).
  * Incorporado acceso directo a **Gestor de Proyectos 2** (`/gestor_proyectos`).
* **Archivo:** `src/pages/5-qaway-hub/HubsuperAplicacionesModule.jsx`
  * Cuadrícula de aplicaciones filtrada por `allowedAppSlugs`.

### 2.4 Sesión e Identidad Real en Gestor de Proyectos 2
* **Archivo:** `src/pages/5-qaway-hub/13-Gestor_Proyectos2/src/components/Topbar.tsx`
  * Eliminada data mock de demostración.
  * Carga asíncrona de usuario desde `supabase.auth.getUser()`, datos de `public.users` y nombre de empresa en `public.tenants`.
  * Escucha de cambios de autenticación con `onAuthStateChange`: si el usuario cierra sesión o expira, redirecciona a `/login`.
  * Acción de "Cerrar sesión": invoca `supabase.auth.signOut()` real y redirige a `/login`.

### 2.5 Catálogos de Dominio y Estados de Ejecución
* **Base de Datos Supabase (`gp_estados_ejecucion_c`):**
  * Código `completada` actualizado a `completado`.
  * Estados `en_revision`, `bloqueada` y `cancelada` marcados con `activo = false` para preservarlos en el esquema sin exponerlos prematuramente en la UI.
* **Archivo:** `src/pages/5-qaway-hub/13-Gestor_Proyectos2/src/services/gpCatalogosService.ts`
  * Incorporado `TABLA_TIPOS_DEPENDENCIA = 'gp_tipos_dependencia_c'` con soporte para columna `alias`.
  * Exportadas funciones helper `listarEstadosEjecucionGestor()` y `listarTiposDependenciaGestor()`.
* **Archivo:** `src/pages/5-qaway-hub/13-Gestor_Proyectos2/src/modules/tareas-2/EstadoEjecucionCatalogoSelect.tsx` (Nuevo)
  * Selector reactivo que consume `gp_estados_ejecucion_c` donde `activo = true` (`Pendiente`, `En proceso`, `Completado`).
* **Archivos:** `Tareas2View.tsx` y `GanttElementDetailView.tsx`
  * Sincronización de progreso al 100% asigna `'Completado'` en lugar de `'Cumple'`.
  * `STATUS_OPTIONS` actualizados priorizando `'Completado'`.

---

## 3. Estado de Verificación
* Creación de tenants operativos comprobada sin pasar por checkout ni trial bloqueante.
* Cierre de sesión real en ambas pestañas probado.
* Verificación en SQL Editor: catálogo `gp_estados_ejecucion_c` reporta 3 estados activos (`completado`, `en_proceso`, `pendiente`) y 3 inactivos.
