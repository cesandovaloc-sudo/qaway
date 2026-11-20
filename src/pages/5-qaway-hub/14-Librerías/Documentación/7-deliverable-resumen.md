# 7-deliverable-resumen.md

## Entregable final: Diagnóstico de arquitectura de notificaciones compartidas en Qaway Hub

### 1. Hechos comprobados (lo que inspeccionamos en el código)

**Aplicaciones inspeccionadas:**

| # | Aplicación | Ruta principal | Mecanismo principal | Almacenamiento |
|---|------------|----------------|---------------------|----------------|
| 1 | Qaway Academy | `src/pages/4-academy/2-qawaylab-app-academy-real/` | Supabase Realtime (`postgres_changes`) | BD PostgreSQL |
| 2 | Gestor Proyectos 2 | `src/pages/5-qaway-hub/13-Gestor_Proyectos2/` | localStorage + eventos custom | localStorage |
| 3 | CRM | `src/pages/5-qaway-hub/11-gestor-de-proyectos/` | `notify()` function + preferencias localStorage | localStorage |
| 4 | Inventario | *Por inspeccionar* | *Por inspeccionar* | *Por inspeccionar* |
| 5 | Ventas | *Por crear* | *Por definir* | *Por definir* |

**Componentes visuales identificados (NUNCA compartidos):**

- Academy: `NotificationPopover` con íconos por tipo y `timeAgo`
- Gestor Proyectos2: `NotificationPopover` con prioridades CRITICAL/PREVENTIVE/INFO
- CRM: tostadas `notify(msg, type)` sin panel desplegable
- *Cada app tiene diseño visual 100% propio*

**Estructuras de datos (diferentes entre apps):**

- Academy: `Notification` interface con `user_id`, `type`, `is_read`, `link`
- Gestor Proyectos2: `Notification` propia con `priority` (CRITICAL/PREVENTIVE/INFO)
- CRM: configuraciones `notifySettings` con 5 flags de sonido
- *Mismo nombre "notifications", esquemas totalmente distintos*

---

### 2. Arquitectura actual de cada aplicación

**Academy:**
- Completamente integrada con Supabase
- Realtime real mediante canales `postgres_changes`
- Todas las notificaciones van a tabla `public.notifications`
- Sin configuraciones de usuario - todas van al `user_id` conectado
- Panel visual propio con categorías y filtros

**Gestor Proyectos2:**
- Standalone, sin dependencias externas
- localStorage como fuente única de verdad
- Eventos custom `qaway-gp-notifications-updated` para propagación
- Prioridades de negocio: CRITICAL, PREVENTIVE, INFO
- Almacenamiento persistente por negocio (no BD compartida)

**CRM:**
- Panel de configuraciones de usuario
- 5 preferencias: `soundOnHandover`, `soundOnNewLead`, `emailDailyDigest`, `wabaExpirationWarning`, `autoTagHighValue`
- Sin sistema de notificaciones multiusuario operacional
- Tostadas simples via `notify(msg, type)` function
- Configuraciones almacenadas en `localStorage` (`qaway_crm_notify_settings`)

**Inventario:** *Por inspeccionar en siguiente paso*

**Ventas:** *Por crear, diseñará alineada al núcleo compartido*

---

### 3. Problemas, duplicidades y oportunidades

**Problemas identificados:**

1. **Sistemas incompatibles:** Academy usa BD + Realtime, GP2 usa localStorage, CRM usa preferencias de usuario. No hay terreno común técnico.

2. **Duplicidad de conceptos:** "Marcar como leído" existe en las 3 apps pero:
   - Academy: update en BD `is_read`
   - GP2: flag en localStorage
   - CRM: flag de sonido/preferencia
   - Mismo efecto, implementaciones totalmente distintas

3. **Confusión de conceptos:** CRM tiene "notificaciones" en panel de configuración pero es solo preferencias de sonido, no un sistema de entrega multiusuario. Esto confunde la clasificación.

4. **Diseño forzado nunca:** Ningún intento de unificación visual ha prosperado (y no debería), cada app conserva su identidad.

**Oportunidades:**

1. **Contratos de datos compartidos:** Las interfaces TypeScript pueden ser compatibles si se define un mínimo (`SharedNotification`).

2. **Patrón de evento dispatcher:** Tanto Academy como GP2 usan conceptos de "algo sucede → callback", el patrón puede estandarizarse.

3. **Integración progresiva:** No se necesita construir todo al mismo tiempo. Empezar por tipos, después por adaptadores, luego por habilitación por tenant.

4. **Nuevas aplicaciones diseñadas alineadas:** La app de ventas (por crear) puede diseñarse desde el día 1 consumiendo el núcleo, evitando la deuda de "arrear" apps existentes.

---

### 4. Arquitectura objetivo recomendada

```
Notification Core (infraestructura compartida)

1. Contratos: Estructura SharedNotification mínima
2. Notification Service: CRUD básico (create, get, markRead, markAllRead)
3. Event Dispatcher: receive/trigger patron estandarizado
4. Recipient Resolver: determinar destinatarios por tenant/role
5. Delivery Adapter: actualizar UI internamente (cada app su estilo)
6. Realtime Adapter: opcional, por aplicación (Supabase, localStorage, ninguno)
7. Preferences: por tenant, no global (flags de sonido, canales)
8. Tenant Isolation: validación de acceso por tenant y permisos por usuario
```

**Qué NUNCA contiene el núcleo:**
- ❌ Reglas de negocio (qué dispara notificaciones)
- ❌ Implementaciones de eventos por aplicación
- ❌ Diseño visual o componentes UI
- ❌ Canales externos forzados (email/WhatsApp/Push)
- ❌ Base de datos compartida obligatoria
- ❌ Arquitectura Realtime obligatoria

---

### 5. Configuración de funcionalidades (por tenant, no global)

**Los 4 conceptos diferenciados:**

| Concepto | Academia | Gestor Proyectos2 | CRM | Ventas (por crear) |
|----------|----------|-------------------|-----|-------------------|
| Capacidad disponible | Realtime Supabase | localStorage + eventos | 5 flags de sonido | Por definir |
| Funcionalidad contratada | Por contrato tenant | Por contrato tenant | Siempre (preferencias usuario) | Por definir |
| Funcionalidad habilitada | Flag tenant | Flag tenant | Siempre activa por usuario | Flag tenant |
| Permisos por rol | admin/student/teacher | admin/integrante | usuario propio | Por definir |

**Flujo de verificación al iniciar cualquiera de las apps:**

```
1. ¿La app tiene el mecanismo técnico? (Sí/No)
2. ¿El tenant contrató esta funcionalidad? (Sí/No)
3. ¿Está habilitada para este tenant? (Sí/No)
4. ¿El usuario tiene permiso para ver/crear? (Sí/No)
5. Mostrar u ocultar funcionalidad según resultados
```

---

### 6. Clificación de implementaciones

| Tipo | Descripción | Aplicaciones que tienen |
|------|-------------|------------------------|
| **A. Infraestructura reutilizable** | Tipos/Helpers puros que pueden compartir | Academy (interface, timeAgo), GP2 (event pattern), CRM (estructura preferences) |
| **B. Lógica de negocio específica** | Reglas de qué eventos disparan notificación | Academy (cursos, matrícula), GP2 (tareas, reuniones), CRM (preferencias usuario) |
| **C. Presentación visual** | Diseño, colores, tipografía, distribución | 100% propia en todas las apps (NUNCA compartir) |
| **D. Funcionalidad incompleta/duplicada** | Sistemas que hacen lo mismo pero distinto | "Marcar como leído" en las 3 apps (mismo efecto, distinto implementación) |

**Qué compartir de cada tipo:**

- **De A:** Solo interfaces TypeScript mínimas y helpers puros (sin efectos secundarios)
- **De B:** Nunca compartir directamente, solo el patrón general
- **De C:** Absolutamente nada (cada app mantiene su diseño)
- **De D:** Identificar y documentar, noForzar unificación

---

### 7. Riesgos y decisiones pendientes

**Riesgos identificados:**

1. **Fuerzar unificación prematura:** Intentar conectar Academy y GP2 ahora generaría reescritura de lógica de negocio y resistencia del equipo.

2. **Confundir preferencias con sistema:** CRM tiene panel de "notificaciones" pero es solo 5 flags de sonido. Si se mezcla con sistema operacional, se pierde la claridad de qué es cada cosa.

3. **Subestimar el multi-tenant:** Asumir que un flag global funciona para todos los tenants es error. Necesita validación por tenant.

4. **Subestimar el costo de adaptadores:** Cada adaptador (Academy → core, GP2 → core) requiere trabajo pero es menor que reescribir toda la lógica.

**Decisiones pendientes:**

1. **¿Inspeccionar Inventario?** Pendiente definir si conectar o mantener independiente.

2. **¿Primer adaptador: Academy o GP2?** Academy usa Realtime (arquitectura más moderna), GP2 usa localStorage (más antigua). Por orden de arquitectura, Academy primero quizás.

3. **¿Contratar notificaciones como módulo opcional por tenant?** Opcional desde el inicio o agregar cuando haya demanda real?

4. **¿Documentación para los desarrolladores?** Los archivos 1-6 ya están en `src/pages/5-qaway-hub/14-Notificaciones/Documentación/`. ¿Suficiente o se necesita más?

5. **¿Comenzar Fase 1 (contratos compartidos) inmediatamente?** Los archivos ya están creados. ¿Se comienza a importar el `SharedNotification` interface en las apps?

---
*Entregable completado el: 2026-11-19*
*Todos los archivos están en: `src/pages/5-qaway-hub/14-Notificaciones/Documentación/`*
*Archivos: 1-diagnostico-arquitectonico.md, 2-inventario-implementaciones.md, 3-clasificacion-functional.md, 4-arquitectura-objetivo.md, 5-configuracion-funcionalidades.md, 6-compatibilidad-migracion.md, 7-deliverable-resumen.md*
*Principio rector: integración progresiva sin reescribir lógica de negocio existente*