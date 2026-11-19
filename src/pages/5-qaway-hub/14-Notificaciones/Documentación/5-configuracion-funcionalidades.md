# 5-configuracion-funcionalidades.md

## Configuración de funcionalidades: capacidades, tenant y permisos

**Propósito:** Differenciar cuatro conceptos que a menudo se confunden y definir cómo configurar funcionalidades por tenant, no global.

**Error común:** Usar un único objeto de flags (como `features = { x: true }`) como sustituto de arquitectura completa. Esto no permite activación por tenant ni permisos individuales.

---

### Los cuatro conceptos diferenciados

| Concepto | Pregunta clave | Qué responde | Ejemplo en Qaway Hub |
|----------|----------------|--------------|----------------------|
| **Capacidad disponible** | ¿La aplicación contempla esta capacidad? | Features técnicas o mecanismos que la app tiene implementados | Academy tiene Realtime, Gestor Proyectos2 tiene localStorage, CRM tiene preferencias |
| **Funcionalidad contratada** | ¿El tenant tiene derecho a utilizarla? | Suscripción o membresía que otorga acceso | Tenant "Inventario" contrató módulo alertas de stock, Tenant "Ventas" contrató módulo pedidos |
| **Funcionalidad habilitada** | ¿Está activada para ese tenant? | Flag/configuración a nivel tenant, puede ser cambiada por admin | `tenant.notifications.enabled = true/false`, `tenant.purchase_notifications = true` |
| **Permiso** | ¿Este usuario puede realizar esa acción? | Roles y permisos individuales dentro del tenant | `user.role === 'admin'` puede crear notificaciones, `user.role === 'student' solo puede verlas |

---

### Matriz de configuración por tenant

| Aplicación | Capacidad | Contratada por defecto | Habilitada | Permisos típicos |
|------------|-----------|-----------------------|------------|------------------|
| **Academy** | Realtime Supabase | Sí (todas las apps la tienen disponible) | Por contratar por tenant | admin: crear/curso, student: ver/notif |
| **Gestor Proyectos2** | localStorage + eventos | Sí (mecánica disponible) | Por contratar por tenant | admin: crear/tarea, integrante: ver/recibir |
| **CRM** | Preferencias usuario | Sí (flags de sonido) | Siempre activa por usuario | admin: configurar, usuario: ver own |
| **Ventas (por crear)** | Por definir | Por definir | Por definir | Por definir |

---

### Flujo de verificación cuando una aplicación inicia

```typescript
// Pseudocódigo: qué hace cada app al cargar

function verificarNotificacionesDisponibles() {
  // 1. Verificar capacidad técnica (tiene la app el mecanismo?)
  const hasMechanism = checkAppMechanism('notifications')
  
  // 2. Verificar si tenantcontrató la funcionalidad
  const isContracted = checkTenantFeature('notifications', tenantId)
  
  // 3. Verificar si está habilitada para este tenant
  const isEnabled = checkTenantEnabled('notifications', tenantId)
  
  // 4. Verificar permisos del usuario actual
  const hasPermission = checkUserPermission('notifications', userId, 'view')
  
  // 5. Mostrar/ocultar según resultado
  return hasMechanism && isContracted && isEnabled && hasPermission
}
```

**Resultado posible:**
- `true` → Mostrar funcionalidad de notificaciones
- `false` → Ocultar o mostrar mensaje "esta funcionalidad no está disponible para tu tenant"

---

### Implementación práctica: flags por tenant vs flags globales

#### ❌ Mal: Flags globales (lo que advirtió el diagnóstico)

```typescript
// No hacer esto - no respeta tenant ni permisos
const features = {
  notifications: true,   // Global - todas las apps lo ven
  purchaseNotifications: false, // Global
  realtime: false,       // Global
}
```

**Problemas:**
- No distingue por tenant
- No distingue por usuario/rol
- Forza a todas las apps a ver lo mismo
- Genera conflictos de activación

#### ✅ Bien: Flags por tenant con validación

```typescript
// Hacer esto - respeta la arquitectura multi-tenant
interface TenantFeatures {
  notifications: {
    enabled: boolean      // ¿Está este tenant suscrito?
    type: 'realtime' | 'localstorage' | 'none' // ¿Qué mecanismo usa?
    preferences: {
      sound: boolean
      email: boolean
    }
  }
}

// Validación por aplicación al iniciar
function initNotifications(tenantId, userId, appName) {
  const tenant = await getTenant(tenantId)
  const user = await getUser(userId)
  
  // Academy chequea su mecanismo
  if (appName === 'academy' && tenant.notifications.enabled && 
      tenant.notifications.type === 'realtime') {
    // conectar supabase realtime
  }
  
  // Gestor Proyectos2 chequea el suyo
  if (appName === 'gp2' && tenant.notifications.enabled && 
      tenant.notifications.type === 'localstorage') {
    // inicializar localStorage system
  }
  
  // CRM siempre tiene sus preferencias
  if (appName === 'crm') {
    // cargar preferencias del usuario
  }
  
  // Ventas (nueva) chequea qué tiene
  if (appName === 'sales') {
    // implementar según contrato
  }
}
```

---

### Ejemplo de estructura de datos por tenant

```typescript
// En base de datos o configuración central

tenantId: "academy-premium-tenant-123"
tenantName: "Academia Premium Empresa X"
features: {
  notifications: {
    enabled: true,
    deliveryMechanism: 'supabase-realtime',  // o 'localStorage', 'none'
    priorities: ['CRITICAL', 'PREVENTIVE', 'INFO'],
    channels: {
      internal: true,   // mostrar en app
      email: false,     // no enviar email
      push: true        // push notifications
    },
    permissions: {
      admin: ['create', 'manage', 'view-all'],
      teacher: ['create-course', 'view-own'],
      student: ['view-own'],
      parent: ['view-limited']
    }
  },
  purchaseNotifications: {
    enabled: false,  // no contratado este módulo
    mechanism: 'none'
  }
}
```

---

### Panel de configuración para administradores

**Qué debería tener un panel central (futuro, no ahora):**

| Opción | Descripción | Valor por defecto |
|--------|-------------|-------------------|
| Habilitar notificaciones | Activa/desactiva para todo el tenant | `true` o `false` por defecto |
| Mecanismo de entrega | Realtime, localStorage, ninguno | `realtime` si la app lo soporta |
| Tipos de prioridad | Cuáles mostrar por defecto | `['INFO', 'PREVENTIVE']` |
| Canales de contacto | Email, Push, WhatsApp activados | `internal: true, email: false, push: false` |
| Roles con permisos | Quién puede crear/ver/todas | Basado en roles existentes |

**Nota:** Este panel NO existe hoy. El diagnóstico lo recomienda para futuro, no como requisito inicial.

---

### Estrategia de migración para apps existentes

**Academy (ya tiene Realtime):**
1. No tocar su implementación actual
2. Agregar `tenant.notifications.enabled` flag en su BD/config
3. Cuando haya nuevo tenant, verificar flag antes de conectar Realtime
4. El usuario final no nota cambio

**Gestor Proyectos2 (usa localStorage):**
1. Igual, agregar flag en su configuración de tenant
2. Su sistema sigue usando localStorage, el flag solo habilita/deshabilita
3. Panel admin puede desactivar si el tenant no contrató el módulo

**CRM (solo preferencias):**
1. Sus 5 flags de sonido ya son "preferencias por usuario"
2. El diagnóstico los clasifica como "tipo B - lógica de negocio"
3. No requiere cambio arquitectónico, son configuraciones existentes

**Nueva app de Ventas:**
1. Diseñar desde el inicio con contrato compartido
2. Definir qué mecanismo usa (realtime vs localStorage vs ninguno)
3. Definir flags de tenant en el setup inicial
4. Crear adaptador que consuma el Notification Core si es necesario

---
*Configuración generada el: 2026-11-19*
*Enfoque: diferenciación de 4 conceptos críticos para arquitectura multi-tenant SaaS*