# 8-funcionalidades-framework.md

## Catálogo de Funcionalidades Compartibles para Notificaciones

**Propósito:** Catálogo mínimo y ligero de funcionalidades que pueden ser consumidas por nuevas aplicaciones (como la app de ventas) sin generar deuda ni problemas de rendimiento.

**Principio base:** Este catálogo **NUNCA** incluye:
- ✅ Diseño visual o componentes UI
- ✅ Lógica de negocio específica (qué dispara cada notificación)
- ✅ Implementaciones completas por aplicación
- ✅ Dependencias pesadas o acoplamiento fuerte

**Sólo incluye:**
- �Interfaces TypeScript mínimas
- ✅ Patrones técnicos reutilizables
- ✅ Contratos de datos normalizados
- ✅ Helpers puros (sin efectos secundarios)

---

### Estructura del Framework

El framework se visualiza como un menú de opciones que el agente puede presentar al crear una nueva app:

```
NOTIFICATION FRAMEWORK (Qaway Hub)
│
├── 1. CONTRATOS (siempre opcional)
│   └── SharedNotification: estructura mínima de datos
│
├── 2. PATRONES TÉCNICOS (elige los que necesites)
│   ├── Event Dispatcher Pattern
│   ├── Recipient Resolver Pattern
│   ├── State Persistence Pattern (localStorage vs BD)
│   └── Preferences Storage Pattern
│
├── 3. ADAPTADORES DISPONIBLES (solo para consultar)
│   ├── Academy Adapter: usa Supabase Realtime
│   ├── GP2 Adapter: usa localStorage + eventos custom
│   ├── CRM Adapter: usa preferencias usuario localStorage
│   └── [Tu App] Adapter: por definir
│
└── 4. PREFERENCIAS POR TENANT (estructuras opcionales)
    └── TenantNotificationPreferences: flags por tenant
```

---

### 1. Contratos (siempre opcional)

#### `SharedNotification` - Estructura mínima

```typescript
export interface SharedNotification {
  id: string                              // Identificador único
  user_id: string                         // Quién recibe
  type: string                            // Categoría: task|purchase|system|academic_event
  title: string                           // Título de la notificación
  message: string                         // Mensaje descriptivo
  is_read: boolean                        // ¿Ya fue leída?
  created_at: string                      // Cuándo fue creada
  link?: string                           // Elemento relacionado (URL o ID)
  priority?: 'LOW' | 'MEDIUM' | 'HIGH'   // Nivel de prioridad
}
```

**Por qué es seguro compartir:** Es solo una interfaz TypeScript. Zero runtime cost. Cada app la importa si necesita, si no, nada pasa.

**Cómo usarla en una nueva app (ejemplo ventas):**
```typescript
import { SharedNotification } from '~lib/notifications-framework'

// Cuando llega una nueva compra:
const notif: SharedNotification = {
  id: `pur-${Date.now()}`,
  user_id: user.id,
  type: 'purchase',
  title: 'Nueva compra recibida',
  message: `Cliente ${client.name} realizó un pedido por S/ ${amount}`,
  is_read: false,
  created_at: new Date().toISOString(),
  link: `/ventas/compra/${client.id}`,
}
```

**Costo:** 1 línea de importación. Beneficio: tipo de dato consistente en toda la organización.

---

### 2. Patrones Técnicos (elige los que necesitas)

#### Patrón 1: Event Dispatcher Básico

**Qué es:** Un sistema simple para que componentes puedan "disparar" acontecimientos y otros puedan suscribirse.

**Implementación mínima (solo si lo necesitas):**

```typescript
// events.ts - Arquitectura opcional
type Notifier = (notification: SharedNotification) => void

class EventDispatcher {
  private notifiers: Notifier[] = []

  subscribe(cb: Notifier) {
    this.notifiers.push(cb)
    return () => { this.notifiers = this.notifiers.filter(n => n !== cb) }
  }

  publish(notification: SharedNotification) {
    this.notifiers.forEach(cb => cb(notification))
  }
}

// Uso en cualquier componente:
const dispatcher = new EventDispatcher()

// Suscribirse (solo una vez en la app):
dispatcher.subscribe((notif) => {
  showLocalNotification(notif)
  updateCounter()
})

// Despachar (desde donde ocurra el evento):
dispatcher.publish({
  id: `pur-${Date.now()}`,
  user_id: user.id,
  type: 'purchase',
  title: 'Nueva compra',
  message: `Pedido #${orderId}`,
  is_read: false,
  created_at: new Date().toISOString(),
})
```

**Cuándo usarlo:** Cuando necesites que varios componentes se enteren de un evento sin acoplamiento directo.

**Costo:** Negligible. Un archivo pequeño con una clase simple.

---

#### Patrón 2: Recipient Resolver

**Qué es:** Determina Quiénes deben recibir una notificación basándose en rol, tenant, etc.

**Implementación mínima:**

```typescript
// recipient-resolver.ts
export interface Recipient {
  userId: string
  role: 'admin' | 'user' | 'viewer' | 'customer'
}

export class SimpleRecipientResolver {
  // Determina quiénes reciben basado en el tipo de evento
  resolve(eventType: string, tenantId: string, actor?: Recipient): Recipient[] {
    // Lógica básica - cada app puede sobrescribir o extender
    const baseRecipients = this.getTenantUsers(tenantId, actor?.role)

    switch (eventType) {
      case 'purchase':
        return baseRecipients.filter(u => u.role === 'admin' || u.role === 'manager')
      case 'system':
        return baseRecipients
      default:
        return baseRecipients
    }
  }

  private getTenantUsers(tenantId: string, actorRole?: string): Recipient[] {
    // Esto sería conexión con tu BD/usuarios real
    // Por ahora, retorna estructura vacía/placeholder
    return []
  }
}
```

**Cuándo usarlo:** Cuando necesitas que notificaciones vayan a roles específicos, no a todos los usuarios ciegamente.

**Costo:** Muy bajo. Lógica pura, sin llamadas a BD en tiempo de ejecución si la app gestiona su propio listado de usuarios.

---

#### Patrón 3: State Persistence Pattern

**Qué es:** Cómo persiste el estado de lectura/marcado.

**Opciones (elige una por app):**

| Opción | Descripción | Costo |
|--------|-------------|-------|
| **localStorage** | `localStorage.setItem('notif-read-${id}', 'true')` | Muy bajo, funciona offline |
| **En BD (Supabase)** | `UPDATE notifications SET is_read = true WHERE id = $1` | Medio, requiere conexión |
| **Ambas** | Persistir en ambas según necesidad | Medio-alto |

**Recomendación:** Para apps nuevas, empezar con **localStorage** como capa rápida, y agregar BD solo si se necesita historial histórico o multi-device synchronization.

**Costo:** Depende de la opción elegida, pero todas son implementaciones simples (~20-30 líneas).

---

#### Patrón 4: Preferences Storage Pattern

**Qué es:** Preferencias de recepción por usuario/tenant.

**Estructura mínima:**

```typescript
// preferences.ts - Arquitectura opcional
export interface UserNotificationPreferences {
  sound: boolean
  email: boolean
  push: boolean
  quietHours?: {
    start: string  // HH:MM format
    end: string
  }
}

// Almacenamiento ejemplo:
const STORAGE_KEY = 'user_notify_prefs'

export const savePreferences = (prefs: UserNotificationPreferences) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs))
}

export const getPreferences = (): UserNotificationPreferences => {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : {
    sound: true,
    email: false,
    push: false,
    quietHours: undefined
  }
}
```

**Cuándo usarlo:** Cuando los usuarios finales deben poder configurar cómo reciben notificaciones (sonidos, email, etc.).

**Costo:** Muy bajo. Unas pocas líneas para guardar/cargar configuraciones.

---

### 3. Adaptadores Disponibles (solo para consultar)

Estos son los adaptadores que existen en las apps actuales. **No se comparten los implementaciones completas**, solo sus firmas para que se sepan existan:

| Adaptador | Arquitectura | Qué hace | ¿Tu app puede usar? |
|-----------|-------------|----------|---------------------|
| **Academy Adapter** | Supabase Realtime | Conecta canal `postgres_changes` a Event Dispatcher | ✅ Si tu app usa Supabase |
| **GP2 Adapter** | localStorage + eventos custom | Lee de localStorage, publica `qaway-gp-notifications-updated` | ✅ Si tu app usa localStorage |
| **CRM Adapter** | Preferencias usuario | Carga/guarda 5 flags de sonido/preferencias | ✅ Si tu app tiene preferencias de usuario |

**Nota importante:** Estos adaptadores **no se comparten como código completo**. Solo se comparten los patrones (cómo están estructurados) para que tu app pueda implementar la que necesita o diseñar la suya propia.

**Excepción documentada:** el adaptador GP2 ya existe como módulo real del framework en `services/adapters/gp2Adapter.js` (solo lectura y con identidad inyectada). Su contrato, mapeo y límites están en `10-adaptador-gp2-motor.md`.

---

### 4. Preferencias Por Tenant (estructuras opcionales)

#### `TenantNotificationPreferences` - Estructura mínima

```typescript
export interface TenantNotificationPreferences {
  enabled: boolean          // ¿Notificaciones activadas para este tenant?
  deliveryMechanism: 'none' | 'localStorage' | 'supabase-realtime' | 'both'
  priorities: 'LOW' | 'MEDIUM' | 'HIGH'[]  // Qué prioridades mostrar por defecto
  channels: {
    internal: boolean       // Mostrar en la app
    email: boolean         // Enviar email
    push: boolean          // Notificaciones push del navegador
  }
  defaultExpirationDays?: number  // Cuántos días mantener en vista
}
```

**Uso en configuración por tenant:**

```typescript
// Ejemplo: Tenant "Empresa X" contrató notificaciones
tenantNotifPrefs = {
  enabled: true,
  deliveryMechanism: 'supabase-realtime',
  priorities: ['HIGH', 'MEDIUM'],
  channels: {
    internal: true,
    email: false,
    push: true
  }
}
```

**Validación en app al iniciar:**

```typescript
function initNotifications(tenantId) {
  const prefs = await getTenantNotifPrefs(tenantId)
  
  if (!prefs.enabled) {
    // Ocultar toda funcionalidad de notificaciones
    return
  }
  
  // Configurar según mecanismo contratado
  switch (prefs.deliveryMechanism) {
    case 'supabase-realtime':
      // Conectar adaptador Academy-style
      break
    case 'localStorage':
      // Inicializar patrón localStorage
      break
  }
  
  // Aplicar preferencias de canal
  if (!prefs.channels.internal) {
    // Ocultar campanita/panel en UI
  }
}
```

**Costo:** Estructura de datos simple. La lógica de validación la escribe cada app según su necesidad.

---

### Matriz de qué TOMAR por tipo de app

| Tipo de app | Contratos (SharedNotification) | Event Dispatcher | Recipient Resolver | State Persistence | Preferences | Adaptador existente |
|-------------|--------------------------------|------------------|--------------------|-------------------|-------------|---------------------|
| **Academy** | ✅ Sí (usa Supabase) | ✅ Sí (propio) | ✅ Sí (por roles) | ✅ Sí (en BD) | ⚠️ Opcional | ✅ Ya existe |
| **Gestor Proyectos2** | ✅ Sí (base) | ⚠️ Puede usar | ✅ Sí (por equipo) | ✅ Sí (localStorage) | ⚠️ Opcional | ✅ Ya existe |
| **CRM** | ✅ Sí (mínimo) | ❌ No usa | ❌ No es su rol | ⚠️ Solo flags | ✅ Ya tiene 5 flags | ❌ Preferencias propias |
| **Ventas (nueva)** | ✅ **Recomendado** | ✅ **Elige uno** | ✅ **Según roles** | ✅ **LocalStorage inicial** | ✅ **Opcional** | ❌ Diseña tuyo |
| **Inventario** | ✅ Sí (si usa productos) | ✅ **Elige uno** | ✅ **Según stock** | ✅ **Ambas opciones** | ⚠️ Opcional | ❓ Por inspeccionar |

---

### Guía de decisión para nueva app

Cuando el agente te pregunte por una nueva app (como ventas), el flujo es:

1. **¿Necesitas notificaciones multiusuario?** → Si/no
   - Si no → No imports nada del framework, implementa lo mínimo que tu app requiera
   - Si sí → Continuar

2. **¿Usas Supabase?** → Si/no
   - Si sí → Puedes usar patrón Academy (Realtime)
   - Si no → Usar localStorage o preferences simples

3. **¿Necesitas preferencias de usuario?** → Si/no
   - Si sí → Implementar `UserNotificationPreferences` estructura mínima
   - Si no → Omitir, mantenerlo simple

4. **¿Necesitas roles/destinatarios específicos?** → Si/no
   - Si sí → Implementar `RecipientResolver` patrón básico
   - Si no → Enviar a todos los usuarios/tenant activos

5. **¿Qué patrón de persistencia?** → localStorage / BD / ambas
   - Empezar con localStorage (más rápido, cero costo de API)
   - Agregar BD después si se necesita historial

---

### Resumen: Lo que SÍ y Lo que NO tener en cuenta

| ✅ SÍ HACER | ❌ NO HACER |
|-------------|------------|
| Compartir interfaz `SharedNotification` | Componer componentes visuales completos |
| Usar patrón Event Dispatcher si lo necesitas | Forzar a todas las apps a usarlo |
| Empezar con localStorage para persistencia | Empezar con BD compleja sin necesidad |
| Definir preferencias por tenant si hay demanda | Crear panel de configuraciones completas desde el día 1 |
| Importar solo lo que tu app necesita | Importar "todo el framework" por anticipado |
| Dejar que cada app tenga su propio diseño visual | Obligar a todas a tener el mismo estilo de campanita |

**Cero deuda garantizado:** Si tu app de ventas importa solo `SharedNotification` interface y usa `localStorage` para marcar leído, has añadido **aproximadamente 5KB** a tu bundle y **0 segundos** de tiempo de carga. Eso es lo que buscamos.

---
*Framework generado el: 2026-11-19*
*Principio rector: "Importa solo lo que necesitas, cuando lo necesitas".*
*Nada de "arrear" todas las funcionalidades desde el inicio.*