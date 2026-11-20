# 6-compatibilidad-migracion.md

## Compatibilidad y migración: qué conecta al núcleo, qué necesita adaptador, qué se mantiene independiente

**Propósito:** Determinar qué implementaciones existentes podrían conectarse al Notification Core común sin reescritura, cuáles necesitarían adaptadores y cuáles deberían permanecer independientes.

**Principio:** No proponemos migraciones destructivas ni sustitución de sistemas que actualmente funcionan. El objetivo es integración progresiva.

---

### Directrices de compatibilidad

| Criterio | Decisión | Justificación |
|----------|----------|---------------|
| **No reescribir lógica de negocio** | ✅ Nunca | Cada app mantiene sus reglas de qué dispara notificaciones |
| **Compartir contratos, no implementaciones** | ✅ Sí | Interfaces y helpers puros, no flujos completos |
| **Adaptadores opcionales** | ✅ Sí | Cada app decide si conecta o no |
| **Migración forzosa** | ❌ No | Sistemas que funcionan hoy no se tocan |
| **Aislamiento por tenant** | ✅ Sí | Configuración por tenant, no global |
| **Diseño visual independiente** | ✅ Sí | Cada app su estilo propio |

---

### qué de cada app podría conectarse al núcleo

#### Academy (✅ Conectable con adaptador mínimo)

| Componente | Status | Qué se conectaría | Qué se mantiene independiente |
|------------|--------|-------------------|------------------------------|
| Estructura `Notification` interface | ✅ Compartible | El tipo `SharedNotification` con `id`, `user_id`, `type`, `title`, `message`, `is_read`, `created_at` | Su implementación Realtime con Supabase channel |
| `subscribeToNotifications()` | ⚠️ Adaptador necesario | Patrón `event dispatcher` - Academy proveería el adaptador que conecta su canal Supabase al core | Las reglas de qué eventos académicos disparan notificación (nuevo curso, matrícula, etc.) |
| `getUnreadCount()` | ✅ Compartible | Lógica pura de contar `is_read = false` | Su contexto académico (contar solo cursos del estudiante vs todo) |
| `markAllNotificationsRead()` | ✅ Compartible | Update `is_read = true` por lotes | Su lógica de "marcar todas las de un curso" vs "todas las del usuario" |
| `timeAgo()` helper | ✅ Compartible | Helper puro `formatDate(created_at)` | Su formateo estilístico específico |
| Panel visual `NotificationPopover` | ❌ No compartir | Diseño Academy específico | Estructura subyacente podría reutilizarse como base, pero vista completamente distinta |

**Esfuerzo de conect Academy:** Bajo. Crear adaptador que traduce su canal Supabase al evento dispatcher del core. No tocar su lógica de negocio.

---

#### Gestor Proyectos2 (✅ Conectable con adaptador)

| Componente | Status | Qué se conectaría | Qué se mantiene independiente |
|------------|--------|-------------------|------------------------------|
| `NotificationPopover` con prioridades | ⚠️ Adaptador necesario | Patrón evento `qaway-gp-notifications-updated` - adaptor lo suscribe al core | Sus prioridades CRITICAL/PREVENTIVE/INFO y reglas de asignación |
| localStorage `qaway_gp_notifications` | ✅ Compartible (adaptado) | Estructura de datos podría normalizarse a `SharedNotification` | Su persistencia en localStorage y clave específica |
| Eventos custom de asignación/tareas | ❌ No compartir | Reglas de negocio: "tarea asignada → notificación" | El patrón evento sí se podría reutilizar, el contenido no |
| Sistema "marcar todo" | ✅ Compartible | Lógica `markAllRead` una vez normalizado el contrato | Su UI de agrupación por prioridad y estilos visuales |

**Esfuerzo de conect GP2:** Medio. Crear adaptador que lea de localStorage y suscriba al evento dispatcher. El cambio es de paradigma (localStorage → posible BD/shared), pero la lógica de negocio se mantiene.

---

#### CRM (✅ Se mantiene independiente - no conecta)

| Componente | Status | Razón |
|------------|--------|-------|
| `notify(msg, type)` function | ❌ No conectar | Es configuración de preferencias, no sistema de notificaciones operacional |
| `soundOnHandover`, `soundOnNewLead` flags | ❌ No conectar | Preferencias de usuario individuales, rubro-specific |
| `wabaExpirationWarning` | ❌ No conectar | Regla de negocio WABA/WhastApp, específica de integraciones |
| Preferencias en localStorage `qaway_crm_notify_settings` | ❌ No conectar | Estructura propia, no notificaciones multiusuario operacionales |

**Decisión:** CRM se mantiene completamente independiente. No hay beneficio ni necesidad de conectarlo al núcleo compartido. Sus 5 flags son "preferencias de usuario" (Tipo B clasificación), no "sistema de notificaciones" (Tipo A).

**Justificación:** "No todas las aplicaciones necesitan usar el sistema. Necesitas que todas tengan la posibilidad de integrarse cuando lo necesiten." - Esto es CRM por excelencia: tiene su propio sistema, punto.

---

#### Inventario (✅ Por inspeccionar y clasificar)

| Componente | Status | Acción |
|------------|--------|--------|
| *Por definir en diagnóstico siguiente* | *Pendiente* | Clasificar como A, B, C y determinar conectividad |

**Próximo paso:** Inspeccionar `src/pages/5-qaway-hub/inventario/` o la ruta correspondiente para completar este apartado.

---

#### Ventas (por crear - diseñando para conectividad)

| Componente | Status | Diseño para conectar |
|------------|--------|----------------------|
| Estructura de notificación de compra | ✅ Desde el inicio usará `SharedNotification` | Definida en contrato compartido, no reinventada |
| Evento "nueva-compra" | ✅ Usará Event Dispatcher | Academy/Gestor pueden escuchar si lo desean |
| Adaptador UI | ✅ Diseño propio desde cero | No hereda de Academy o GP2, es diseño ventas |
| Realtime opcional | ⚠️ Si el tenant lo contrata | Adaptador que conecta al core o usa propia configuración |

**Ventaja:** Al diseñar desde cero alineada al núcleo, el conectividad costo es mínimo.

---

### Ruta de migración sugerida (fases)

#### Fase 1: Contratos compartidos (lo que hicimos en documentación anterior)
- ✅ Definir `SharedNotification` interface
- ✅ Extraer helpers puros (timeAgo, format)
- ✅ Crear Notification Service básico con mocked data
- **Costo:** 1 semana de trabajo
- **Impacto:** Ninguno en apps existentes (nuevo archivo solo de tipos)

#### Fase 2: Adaptadores mínimos (3-6 semanas)
- Academy: adaptador que conecta su canal Supabase al Event Dispatcher
- Gestor Proyectos2: adaptador que lee localStorage y publica eventos
- **Costo:** Cada adaptador ~2-3 días de trabajo
- **Impacto:** Academi y GP2 pueden "hablar" el mismo lenguaje de eventos sin cambiar lógica

#### Fase 3: Habilitación por tenant (6-12 semanas)
- Agregar flags `tenant.notifications.enabled` en configuración
- Cada app chequea flag al iniciar
- Panel admin para habilitar/deshabilitar por tenant
- **Costo:** Configuración + UI admin
- **Impacto:** Las apps existen, solo se ocultan/muestran según contrato

#### Fase 4: Nuevas aplicaciones (en adelante)
- Aplicaciones nuevas diseñan con contrato compartido desde el día 1
- Costo de conectividad: mínimo (solo importar tipos y usar adaptadores que necesiten)
- **Costo:** Depende de la app, pero menor que reescribir una existente

---

### Tabla resumen: qué conecta vs qué no

| Aplicación | Se conecta al núcleo | Adaptador necesario | Se mantiene independiente | Comentario |
|------------|---------------------|--------------------|--------------------------|------------|
| **Academy** | ✅ Sí (opcional) | Sí - traduce Supabase → dispatcher | Parte lógica de negocio | Bajo esfuerzo, alto valor |
| **Gestor Proyectos2** | ✅ Sí (opcional) | Sí - traduce localStorage → dispatcher | Parte diseño visual y reglas de evento | Medio esfuerzo |
| **CRM** | ❌ No | Ninguno (no corresponde) | Totalmente independiente | Por tipo de implementación (preferencias) |
| **Inventario** | ❓ Por definir | ❓ Por definir | ❓ Por definir | Pendiente inspeccionar |
| **Ventas (nueva)** | ✅ Diseñado para | ✅ Mínimo (usa tipos compartidos) | ✅ Diseño propio | Cero deuda si se diseña alineado |

---
*Compatibilidad y migración generado el: 2026-11-19*
*Enfoque: integración progresiva sin destructivo, respetando implementaciones existentes*