# 4-arquitectura-objetivo.md

## Arquitectura objetivo recomendada para Notification Core en Qaway Hub

**Propósito:** Definir cómo podría construirse un núcleo de notificaciones compartido que permita integración progresiva sin reescribir funcionalidades existentes.

**Principio fundamental:** Las aplicaciones conservan sus reglas de negocio y su diseño visual independiente. El núcleo provee infraestructura, no funcionalidad.

---

### Estructura propuesta

```
Notification Core (infraestructura compartida)

├── 1. Contratos (Data Structures)
│   └── Estructura estándar de notificación
│       ├── id: string
│       ├── user_id: string (quién recibe)
│       ├── type: string (categoría: task/purchase/system/academic_event)
│       ├── title: string
│       ├── message: string
│       ├── is_read: boolean
│       ├── created_at: string
│       ├── link?: string (relacionado elemento)
│       └── priority?: 'CRITICAL' | 'PREVENTIVE' | 'INFO' | 'commerce'
│
├── 2. Notification Service
│   ├── create(notification: SharedNotification): Promise<Notification>
│   ├── getById(id: string): Promise<Notification | null>
│   ├── getUnreadCount(userId: string): Promise<number>
│   ├── markRead(id: string, userId: string): Promise<void>
│   ├── markAllRead(userId: string): Promise<void>
│   ├── list(userId: string, filters?: { type?, priority?, is_read? }): Promise<Notification[]>
│
├── 3. Event Dispatcher
│   ├── receive(eventName: string, payload: any): void
│   ├── subscribe(application: string, callback: (payload) => void): void
│   └── trigger(application: string, eventName: string, payload: any): void
│
├── 4. Recipient Resolver
│   ├── resolve(userId: string, tenantId: string, role?: string): string[] 
│   ├── getSubscribedUsers(eventType: string, tenantId: string): Promise<string[]>
│   └── checkPermissions(userId: string, action: string, resource: string): boolean
│
├── 5. Delivery Adapter (entrega interna)
│   ├── pushToUI(userId: string, notification: SharedNotification): void
│   ├── updateCounter(userId: string, count: number): void
│   ├── showPopover(userId: string): void
│   └── markReadInUI(notificationId: string): void
│
├── 6. Realtime Adapter (opcional, por aplicación)
│   ├── subscribeRealtime(userId: string, onChange: (notif) => void): () => void
│   └── connect(userId: string): void
│   └── disconnect(): void
│
├── 7. Preferences
│   ├── getPreferences(userId: string): Promise<Preferences>
│   ├── updatePreferences(userId: string, prefs: Preferences): Promise<void>
│   └── defaults: { sound: boolean, email: boolean, push: boolean }
│
└── 8. Tenant Isolation
    ├── validateTenantAccess(userId: string, tenantId: string): boolean
    ├── getTenantNotifications(tenantId: string, filters): Promise<Notification[]>
    └── perTenantPreferences: { [tenantId]: Preferences }
```

---

### Flujo de trabajo propuesto

#### Escenario 1: Nueva notificación en Academy

```
1. Academia dispara evento: "curso-nuevo"
2. Event Dispatcher recibe y procesa
3. Recipient Resolver determina destinatarios (estudiantes inscritos)
4. Notification Service crea registro en BD
5. Realtime Adapter envía a canal Supabase
6. UI actualiza automáticamente por subscription
```

#### Escenario 2: Nueva compra en app de Ventas

```
1. Ventas dispara evento: "compra-realizada"
2. Event Dispatcher recibe y procesa
3. Recipient Resolver determina destinatarios (administrador del tenant)
4. Notification Service crea registro (puede usar tabla propia o shared)
5. Delivery Adapter muestra en UI (estilo ventas, no estilo academy)
6. Opcional: Realtime Adapter si el tenant lo contrató
```

#### Escenario 3: Usuario marca como leído

```
1. Usuario hace clic en campanita
2. UI llama: markReadInUI(notificationId)
3. Notification Service actualiza is_read = true
4. Delivery Counter actualiza contador
5. Si tiene Realtime Adapter → envía update a todos los dispositivos
```

---

### Adaptadores por aplicación (ejemplo mínima)

Cada aplicación implementa solo los adaptadores que necesita:

| Aplicación | Contratos usa | Service usa | Event Dispatcher usa | Real-time Adapter | Delivery Adapter |
|------------|---------------|-------------|----------------------|-------------------|------------------|
| **Academy** | ✅ Estructura completa | ✅ Con Supabase | ✅ Para eventos acad. | ✅ Usa canal Realtime | ✅ Popover academy |
| **Gestor Proyectos2** | ✅ Estructura base | ✅ Con localStorage | ✅ Para eventos gp | ❌ Ninguno (ya tiene own) | ✅ Popover gp2 style |
| **CRM** | ⚠️ Estructura mínima | ⚠️ Solo preferences | ❌ No usa dispatcher | ❌ Ninguno | ⚠️ Tostadas notify() |
| **Ventas (por crear)** | ✅ Estructura compartida | ✅ Según necesidad | ✅ Según eventos vent. | ⚠️ Si usa Supabase | ✅ Diseño propio |

**Nota:** Las columnas marcadas con ✅ opcional significan que la aplicación **puede** usar ese componente, no que esté obligado. Las de ⚠️ significan uso condicional según contratos/tenant. Las de ❌ significan que la aplicación no usa ese componente (tiene propio o no necesita).

---

### Integración multi-tenant

**Cada concepto queda diferenciado:**

| Concepto | Qué responde | Ejemplo |
|----------|--------------|---------|
| Capacidad disponible | ¿La aplicación contempla esta capacidad? | Academy: sí, tiene Realtime |
| Funcionalidad contratada | ¿El tenant tiene derecho a utilizarla? | Tenant X contrató módulo notificaciones |
| Funcionalidad habilitada | ¿Está activada para ese tenant? | API flag: `tenant.notifications.enabled` |
| Permiso | ¿Este usuario puede realizar esa acción? | `user.role === 'admin'` para crear notificaciones |

**Flujo completo por tenant:**

1. Al iniciar sesión, verificar `tenant.notifications.enabled`
2. Si está habilitado, cargar las capacidades que ese tenant tiene disponibles
3. Las aplicaciones consultan qué tienen habilitado antes de mostrar funcionalidades
4. Los permisos de usuario se validan independientemente

---

### Migración progresiva (no destructiva)

**Fase 1 - Contratos compartidos (ahora):**
- Definir `SharedNotification` interface
- Extraer helpers puros (timeAgo, format)
- Crear Notification Service básico con mocked data
- Ninguna app toca su código existente

**Fase 2 - Event Dispatcher básico (3 meses):**
- Implementar receive/trigger sin consecuencias reales
- Cada app lo importa pero usa o no
- Probar que no rompe nada

**Fase 3 - Adaptadores por aplicación (6 meses):**
- Academy conecta su Realtime al core
- Gestor Proyectos2 conecta sus eventos custom
- CRM usa las preferences si quiere
- Ventas implementa su primer adaptador

**Fase 4 - Tenant flags (12 meses):**
- Habilitar/deshabilitar funcionalidades por tenant
- Permisos por rol dentro de cada tenant
- Panel de configuración central para admins

**Fase 5 - Canales adicionales (18 meses):**
- Email, WhatsApp, Push si es necesario
- Solo para tenants que lo contraten
- A aislar de notificaciones internas

---

### Qué NO contiene el núcleo compartido

❌ Reglas de negocio: "qué dispara una notificación"  
❌ Implementaciones de eventos por aplicación  
❌ Diseño visual o componentes UI  
❌ Canales de entrega externos (email/WhatsApp/Push forzados)  
❌ Sistema de preferencias único para todos  
❌ Base de datos compartida obligatoria  
❌ Arquitectura Realtime obligatoria  

**Sólo contiene:**
✅ Contratos de datos normalizados  
✅ Servicios CRUD básicos  
✅ Pattern de event dispatching  
✅ Resolución de destinatarios  
✅ Entrega interna (UI updates)  
✅ Aislamiento por tenant  
✅ Preferences opcionales por tenant  

---
*Arquitectura objetivo generada el: 2026-11-19*
*Recomendación: implementar Fase 1 antes que nada. Nada destructivo.*