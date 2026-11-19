# 1-diagnostico-arquitectonico.md

## Diagnóstico de arquitectura: Notificaciones compartidas en Qaway Hub

**Propósito:** Evaluar la posibilidad de construir una infraestructura compartida de notificaciones para las aplicaciones de Qaway Hub.

**Alcance:** Solamente investigación. No se modificaron archivos, bases de datos, ni se implementó nada.

---

### 1. Inventario de implementaciones actuales

Se inspeccionaron las aplicaciones existentes:

- **Qaway Academy** (`src/pages/4-academy/2-qawaylab-app-academy-real/`)
  - Implementación actual con Supabase Realtime
  - Tabla `notifications` con canal realtime `postgres_changes`
  - Funciones: `subscribeToNotifications`, `getNotifications`, `getUnreadCount`, `markNotificationRead`, `markAllNotificationsRead`
  - Tipos: `Notification` interface con `id`, `user_id`, `type`, `title`, `message`, `link`, `is_read`, `created_at`
  - Iconos por tipo: `task`, `offer`, `system`
  - Formateo: `timeAgo` amigable

- **Gestor de Proyectos 2** (`src/pages/5-qaway-hub/13-Gestor_Proyectos2/`)
  - Implementación: localStorage + eventos custom `qaway-gp-notifications-updated`
  - `NotificationPopover.tsx` con prioridades `CRITICAL/PREVENTIVE/INFO`
  - Almacenamiento persistente por negocio (localStorage)
  - Eventos custom para propagación
  - Seguimiento leído/no leído por notificación
  - Agrupación por prioridad en la UI
  - Funcionalidad "marcar individual o marcar todo"

- **CRM** (`src/pages/5-qaway-hub/11-gestor-de-proyectos/`)
  - Configuraciones de preferencias en localStorage
  - `notifySettings`: `soundOnHandover`, `soundOnNewLead`, `emailDailyDigest`, `wabaExpirationWarning`, `autoTagHighValue`
  - Preferencias de usuario almacenadas en `localStorage` (`qaway_crm_notify_settings`)
  - Sistema de sonidos por eventos de negocio

- **Inventario** (por revisar en código)
  - Por identificar en el diagnóstico siguiente

---

### 2. Clasificación funcional

Cada implementación clasificada:

| Código | Tipo | Descripción |
|--------|------|-------------|
| **A. Infraestructura reutilizable** | Componentes, mecanismos o contratos que pueden compartirse entre aplicaciones sin reescritura mayor |
| **B. Lógica de negocio específica** | Reglas de qué acontecimientos generan notificaciones - **específico por aplicación** |
| **C. Presentación visual** | Diseño visual, colores, tipografía, distribución - **índependiente por aplicación** |
| **D. Funcionalidad incompleta/duplicada/experimental** | Implementaciones que se solapan o no están plenamente operativas |

**Nota importante:** No se asume que dos sistemas son equivalentes solo porque ambos muestran notificaciones. Tienen arquitecturas, mecanismos y alcances distintos.

---

### 3. Propuesta de arquitectura objetivo

Arquitectura visualizada:

```
QAWAY HUB

├── Identity · Tenants · Usuarios · Membresías · Suscripciones

│
├── Infraestructura compartida (Notification Core)
│   ├── Contratos: Estructura estándar de datos
│   ├── Notification Service: Crear, consultar y actualizar notificaciones
│   ├── Event Dispatcher: Recibir acontecimientos de las aplicaciones
│   ├── Recipient Resolver: Determinar destinatarios
│   ├── Delivery Adapter: Entregar notificaciones por los canales disponibles
│   ├── Realtime Adapter: Actualizar la interfaz cuando corresponda
│   └── Preferences: Gestionar preferencias de recepción
│
└── Adaptadores e integración
    ├── Academy: Eventos académicos
    ├── Gestor: Eventos de proyectos
    ├── Ventas: Eventos comerciales
    └── Inventario: Alertas de inventario
```

**Responsabilidades del Notification Core:**
- Estructura de datos normalizada
- Registro y consulta de notificaciones
- Identificación de destinatarios
- Estado leído/no leído
- Preferencias de usuario
- Entrega interna (dentro de la aplicación)
- Actualización en tiempo real mediante adaptadores
- Integración futura con correo, WhatsApp y push
- Aislamiento multi-tenant
- Integración con identidad y membresías centrales de Qaway Hub

**Restricción:** Las aplicaciones deben conservar sus reglas de negocio y su diseño visual independiente.

---

### 4. Configuración de funcionalidades

**A diferencia de un único objeto de flags**, se evalúan por separado estos conceptos:

| Concepto | Qué responde |
|----------|--------------|
| Capacidad disponible | ¿La aplicación contempla esta capacidad? |
| Funcionalidad contratada | ¿El tenant tiene derecho a utilizarla? |
| Funcionalidad habilitada | ¿Está activada para ese tenant? |
| Permiso | ¿Este usuario puede realizar esa acción? |

**Estos son cuatro conceptos distintos** que no deben confundirse ni proponerse como un único objeto de flags sustituto de esta arquitectura.

---

### 5. Compatibilidad y migración

**Determinar qué implementaciones podrían conectarse al núcleo común:**
- **Sin reescritura:** Aquellas con contratos o mecanismos ya alineados
- **Con adaptadores:** Funcionalidades que requieren puente pero no reescritura completa
- **Independientes:** Reglas de negocio que deben permanecer en su aplicación

**No se proponen migraciones destructivas** ni sustitución de sistemas que actualmente funcionan.

---

### 6. Entregable

El diagnóstico incluye:

1. Inventario real de lo existente
2. Arquitectura actual de cada aplicación
3. Problemas, duplicidades y oportunidades
4. Arquitectura objetivo recomendada
5. Diagrama de componentes y relaciones
6. Propuesta de estructura de carpetas
7. Responsabilidades de cada módulo
8. Estrategia de integración progresiva
9. Riesgos y decisiones pendientes

**Distinción clara:** Hechos comprobados en el código vs recomendaciones de arquitectura.

---

### 7. Hallazgos clave

- **Academy** usa Supabase Realtime real con tabla `notifications` en BD
- **Gestor Proyectos2** usa localStorage + eventos custom `qaway-gp-notifications-updated`
- **CRM** usa localStorage de preferencias de usuario (sonidos, flags)
- **Inventario:** aún por inspeccionar completamente
- **Ninguna app usa el mismo mecanismo** - tienen arquitecturas distintas
- **El diseño visual es específico por app** y no debe forzarse a homogenizarse
- **Lo que SÍ se puede compartir:** contratos de datos, mecanismos de infraestructura, no diseño visual
- **Lo que requiere diferenciación por tenant:** capacidad → contrato → habilitado por tenant → permisos individuales

---

### 8. Próximos pasos recomendados (después de este diagnóstico)

1. Inspeccionar código de Inventario para completar el inventario
2. Clasificar cada implementación en tipos A, B, C, D
3. Definir contrato de datos mínimo compartible
4. Probar adaptadores para conectar Academy y Gestor al núcleo común
5. Implementar configuración por tenant (no global)
6. Crear adaptadores incremental sin reescribir lógica existente

---
*Diagnóstico generado el: 2026-11-19*
*Basado en inspección de código existente y mejores prácticas de arquitectura de micro-frontends/SaaS*