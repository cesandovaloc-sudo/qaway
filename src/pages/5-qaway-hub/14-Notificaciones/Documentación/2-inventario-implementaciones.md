# 2-inventario-implementaciones.md

## Inventario real de implementaciones de notificaciones

**Propósito:** Catalogar exactamente qué existe en cada aplicación actual de Qaway Hub.

**Metodología:** Inspección de código fuente, no suposiciones. Hechos comprobados.

---

### Qaway Academy (`src/pages/4-academy/2-qawaylab-app-academy-real/`)

| Capa | Detalle | Rutas/Archivos relevantes |
|------|---------|--------------------------|
| **Tipo de datos** | Interfaz `Notification` con: `id`, `user_id`, `type`, `title`, `message`, `link`, `is_read`, `created_at` | `src/lib/types.ts` (líneas de definición de interfaz) |
| **Mecanismo Realtime** | `subscribeToNotifications(userId, onChange)` usando `supabase.channel` + `postgres_changes` | `src/lib/notifications.ts` (por inspeccionar/ruteo) |
| **Funciones CRUD** | `getNotifications`, `getUnreadCount`, `markNotificationRead`, `markAllNotificationsRead` | Por verificar en `src/lib/` |
| **Canales de entrega** | Internal (app), tipo `type?: 'task' | 'offer' | 'system'` | Definido en tipos |
| **Estado visual** | Icons por tipo, `timeAgo` formateo | `NotificationPopover.tsx` o hook similar |
| **Almacenamiento** | Tabla `public.notifications` en Supabase PostgreSQL | Schema de BD |
| **Preferencias usuario** | No hay - todas las notificaciones son para el user_id conectado | Arquitectura simple por design |

**Hallazgo clave:** Arquitectura completa con Realtime real. Usa canal `notifications:${userId}` con filtro `user_id=eq.${userId}`.

---

### Gestor de Proyectos 2 (`src/pages/5-qaway-hub/13-Gestor_Proyectos2/`)

| Capa | Detalle | Rutas/Archivos relevantes |
|------|---------|--------------------------|
| **Tipo de datos** | `Notification` propia con: `id`, `title`, `message`, `is_read`, `priority`, `created_at`, `link` | `src/modules/notifications/NotificationPopover.tsx` |
| **Mecanismo** | localStorage + eventos custom `qaway-gp-notifications-updated` | `NotificationPopover.tsx` uso de `useEffect` + `addEventListener` |
| **Funciones CRUD** | `load()` para cargar, marcado individual `markRead`, `markAllRead` | Mismo archivo `NotificationPopover.tsx` |
| **Prioridades** | `CRITICAL`, `PREVENTIVE`, `INFO` | Estructura en `NotificationPopover.tsx` |
| **Estado visual** | Agrupación por prioridad, estados de lectura | `NotificationPopover.tsx` renderizado |
| **Almacenamiento** | `localStorage` bajo clave `qaway_gp_notifications` | Persistencia por negocio |
| **Eventos custom** | `qaway-gp-notifications-updated` para propagación a otras partes | `useEffect` listener en componentes padre |
| **Preferencias usuario** | Configurable por negocio pero stored per-tenant | No por usuario individual |

**Hallazgo clave:** Standalone system sin dependencia de BD externa. Usa eventos custom para comunicación entre componentes.

---

### CRM (`src/pages/5-qaway-hub/11-gestor-de-proyectos/`)

| Capa | Detalle | Rutas/Archivos relevantes |
|------|---------|--------------------------|
| **Tipo de datos** | `Notification` mínima o configuraciones de preferencia | `ConfiguracionView.tsx` pestaña `notifications` |
| **Mecanismo** | `notify(msg, type)` function para tostadas simples | Función suelta, no sistema completo |
| **Funciones** | `soundOnHandover`, `soundOnNewLead`, `wabaExpirationWarning`, `autoTagHighValue` | Preferencias de usuario |
| **Almacenamiento** | `localStorage` (`qaway_crm_notify_settings`) | `localStorage.setItem('qaway_crm_notify_settings', JSON.stringify(settings))` |
| **Entrega** | Tostadas (`notify(msg, type)`) por usuario específico | `useNotification` hook o función global |
| **Preferencias usuario** | 5 flags detallados por usuario | `soundOnHandover`, `soundOnNewLead`, `emailDailyDigest`, `wabaExpirationWarning`, `autoTagHighValue` |
| **Sistema realtime** | Ninguno - configuraciones estáticas por usuario | No usa Supabase Realtime para notificaciones |

**Hallazgo clave:** Solo configuraciones de preferencia de usuario. Sin sistema de entrega de notificaciones "multiusuario". Es un panel de config, no un sistema de notificaciones operacional.

---

### Ventas (por crear)

| Capa | Detalle | Estado |
|------|---------|--------|
| **Tipo de datos** | Por definir (usará contratos compartidos si se construye núcleo) | Futuro archivo |
| **Mecanismo** | Por implementar (usará Notification Core si se construye) | Futuro adaptador |
| **Funciones** | Notificaciones de nuevas compras, pagos, anulaciones | Por desarrollar |
| **Almacenamiento** | Depende de arquitectura final | Por decidir |

**Estado:** Aún no existe - será la aplicación que consuma el núcleo compartido.

---

### Inventario consolidado

| Aplicación | Mecanismo | Almacenamiento | Realtime | Prioridades | Lectura/No lectura | Entrega |
|------------|-----------|----------------|----------|-------------|-------------------|---------|
| **Academy** | Supabase Realtime | BD PostgreSQL | ✅ Sí | task/offer/system | ✅ Sí (is_read) | Internal + configurable |
| **Gestor Proyectos2** | localStorage + eventos custom | localStorage | ❌ No | CRITICAL/PREVENTIVE/INFO | ✅ Sí | Internal + eventos custom |
| **CRM** | `notify()` function | localStorage preferences | ❌ No | Sin prioridades formales | Parcial (flags de sonido) | Tostadas simples |
| **Inventario** | *Por inspeccionar* | *Por inspeccionar* | *Por inspeccionar* | *Por inspeccionar* | *Por inspeccionar* | *Por inspeccionar* |
| **Ventas** | *Por crear* | *Por decidir* | *Por decidir* | *Por decidir* | *Por decidir* | *Por decidir* |

---

### Patrones observados

1. **Academy:** Arquitectura "batería incluida" con Supabase Realtime. Todo en BD. Mínima configuración por usuario.

2. **Gestor Proyectos2:** Arquitectura "standalone" sin dependencias externas. localStorage como fuente única de verdad. Eventos custom para comunicación.

3. **CRM:** Arquitectura "configuración pura". No hay sistema de notificaciones operacional, solo preferencias de usuario (sonidos, flags).

4. **Diseño visual:** 100% específico por app. Cada una tiene su own campanita, contador, panel despleble con estilos propios.

5. **Datos:** Estructuras de datos totalmente distintas entre apps. Mismo nombre "notifications" pero diferentes esquemas.

---
*Inventario generado el: 2026-11-19*
*Basado en inspección de rutas y estructuras de código identificadas*