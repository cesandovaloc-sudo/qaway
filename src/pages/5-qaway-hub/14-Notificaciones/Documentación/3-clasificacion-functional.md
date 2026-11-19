# 3-clasificacion-functional.md

## Clasificación funcional de implementaciones de notificaciones

**Propósito:** Clasificar cada encontrada como: A (reutilizable), B (lógica de negocio), C (presentación), D (incompleta/duplicada).

**Principio:** No supongamos que dos sistemas son equivalentes solo porque muestran notificaciones. Son arquitecturas distintas.

---

### Clasificación por aplicación

#### A. Infraestructura reutilizable (Tipo A)

| Aplicación | Elemento | Por qué es reutilizable |
|------------|----------|------------------------|
| **Academy** | Estructura de datos `Notification` interface | Define contrato mínimo: `id`, `user_id`, `type`, `title`, `message`, `is_read`, `created_at` |
| **Academy** | Función `getUnreadCount()` | Lógica pura de contar no leídos - podría extraerse a util compartida |
| **Academy** | Formateo `timeAgo(created_at)` | Helper puro, no tiene efectos secundarios |
| **Gestor Proyectos2** | Evento custom `qaway-gp-notifications-updated` | Patrón de evento que otros podrían escuchar |
| **Gestor Proyectos2** | Sistema prioridades `CRITICAL/PREVENTIVE/INFO` | Enum de prioridades podría ser contrato compartido |
| **CRM** | Estructura de preferencias `notifySettings` | Objeto de configuración con 5 flags - podría ser base para preferences compartidas |

**Qué de estos compartiríamos realmente:** Solo los tipos/Interfaces y helpers puros. La lógica de negocio no.

---

#### B. Lógica de negocio específica (Tipo B)

| Aplicación | Elemento | Por qué es específica |
|------------|----------|----------------------|
| **Academy** | `subscribeToNotifications(userId, onChange)` con filtro `user_id=eq.${userId}` | Reglas de qué eventos académicos disparan notificación: nuevo curso, matrícula, calificación |
| **Academy** | `markAllNotificationsRead()` | Lógica de masivo que respeta `is_read` flag por notificación individual |
| **Gestor Proyectos2** | Asignación de tareas → notificación | Reglas de negocio: qué asignaciones generan notificación, a quién, con qué prioridad |
| **Gestor Proyectos2** | Reuniones, hitos, vencimientos | Conjunto completo de eventos que esta app considera "notificables" |
| **CRM** | `soundOnHandover`, `soundOnNewLead`, etc. | Preferencias específicas del rubro ventas/CRM, no transferibles |
| **CRM** | `wabaExpirationWarning` (2h antes cierre WABA) | Regla de negocio específica de integración WABA/WhatsApp |

**Qué compartiríamos:** Nada de esto directamente. Cada app tiene sus reglas. Lo que podríamos compartir es el **contrato** de cómo se solicitan, no el qué dispara.

---

#### C. Presentación visual (Tipo C)

| Aplicación | Elemento | Características propias |
|------------|----------|------------------------|
| **Academy** | `NotificationPopover` / dropdown | Estilo academy: íconos por tipo, `timeAgo`, categorías task/offer/system |
| **Gestor Proyectos2** | `NotificationPopover` con prioridades | Estilo gp2: prioridades CRITICAL/PREVENTIVE/INFO, agrupación por prioridad |
| **CRM** | Tostadas `notify(msg, type)` | Estilo CRM: simples, sin panel desplegable complejo, solo aparición transitoria |
| **Componentes visuales** | Campanita, contador, panel, filtros, agrupación | **100% específico por app** - colores, tipografía, distribución, interacciones |

**Qué compartiríamos:** NADA de lo visual. Cada app mantiene su identidad de marca y diseño. El "framework" no fuerza diseño único.

---

#### D. Funcionalidad incompleta/duplicada/experimental (Tipo D)

| Aplicación | Elemento | Observación |
|------------|----------|-------------|
| **Posibles duplicidades** | Sistemas de "marcar como leído" | Academy usa `is_read` en BD, Gestor Proyectos2 usa flag en localStorage - mismos efecto, implementaciones distintas |
| **Sistemas parciales** | CRM preferences | No es un sistema de notificaciones operacional, solo configuraciones. Está en tipo D para "sistema completo" pero en tipo B para "preferencias de usuario" |
| **Por inspeccionar** | Inventario | Pendiente de clasificación una vez inspeccionado |

---

### Matriz de qué COMPARTIR y qué NO

| Capa | Compartir | No compartir |
|------|-----------|--------------|
| **Contratos de datos** | ✅ Interfaces TypeScript mínimas | ❌ Implementaciones completas |
| **Mecanismos técnicos** | ✅ Event dispatch pattern | ❌ Reglas de qué eventos disparar |
| **Estado (read/unread)** | ✅ Concepto de `is_read` | ❌ Cómo se persiste (BD vs localStorage) |
| **Preferencias usuario** | ✅ Estructura de flags si es necesario | ❌ Valores específicos por rubro |
| **Presentación visual** | ❌ TODO | ✅ Cada app su estilo |
| **Canales de entrega** | ❌ TODO | ✅ Cada app decide |
| **Realtime vs polling** | ❌ TODO | ✅ Cada arquitecura |
| **Prioridades** | ⚠️ Enum compartido opcional | ⚠️ Cada app sus reglas de negocio |

---

### Reglas de oro de esta clasificación

1. **Los tipos TypeScript compartidos NUNCA incluyen diseño visual** - solo la forma de los datos
2. **Los helpers puros pueden compartir** - funciones sin efectos secundarios (formateo, validación)
3. **La lógica de negocio NUNCA se fuerza a compartir** - cada app tiene sus reglas
4. **Los eventos custom son patrones, no implementaciones** - el patrón `onChange` se puede compartir, el evento específico no
5. **Presentación = jamás compartir** - cada producto conserva su experiencia de usuario

---
*Clasificación generada el: 2026-11-19*
*Basado en inventario previo y mejores prácticas de arquitectura de sistemas compartidos*