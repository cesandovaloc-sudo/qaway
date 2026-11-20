/* ==============================================================
   QAWAY SHARED NOTIFICATIONS - HELPERS (PUROS)
   ==============================================================

   Funciones Helper puras para transformaciones de datos de notificación.
   - No tienen efectos secundarios (no tocan localStorage, Supabase, etc.)
   - Son seguras para importar y usar inmediatamente
   - Cada app usa solo las que necesita
   ------------------------------------------------------------------ */

/**
 * Convierte un objeto plano en un SharedNotification asegurando
 * que todos los campos obligatorios tengan valores por defecto.
 */
export function normalizeSharedNotification(
  data: Partial<SharedNotification>
): SharedNotification {
  const now = new Date().toISOString()

  return {
    id: data.id || `notif-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    recipient_id: data.recipient_id || 'unknown-user',
    type: data.type || 'system',
    title: data.title || 'Notificación',
    message: data.message || '',
    created_at: data.created_at || now,
    is_read: data.is_read !== undefined ? data.is_read : false,
    link: data.link,
    priority: data.priority,
    tenant_id: data.tenant_id,
  }
}

/**
 * Extrae solo los campos necesarios para mostrar en una UI mínima
 * (campanita, contador, etc.) sin traer el mensaje completo si no se necesita.
 */
export function getNotificationSummary(notification: SharedNotification) {
  return {
    id: notification.id,
    title: notification.title,
    type: notification.type,
    priority: notification.priority,
    is_read: notification.is_read,
    created_at: notification.created_at,
    // No incluimos `message` aquí por defecto - la app decidirá si mostrarla
  }
}

/**
 * Formatea la fecha de creación en un formato humano leyendo tipo "hace X tiempo"
 * Ejemplo: "hace 5 minutos", "hace 2 días", "15/11/2024"
 */
export function formatRelativeTime(isoDateString: string): string {
  if (!isoDateString) return 'hasta ahora'

  const date = new Date(isoDateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMinutes < 1) {
    return 'justo ahora'
  } else if (diffMinutes < 60) {
    return `hace ${diffMinutes} ${diffMinute === 1 ? 'minuto' : 'minutos'}`
  } else if (diffHours < 24) {
    return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`
  } else if (diffDays < 30) {
    return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`
  } else {
    // Formato DD/MM/YYYY
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }
}

/**
 * Determina el ícono/color de prioridad basado en el tipo
 */
export function getPriorityClass(priority?: NotificationPriority): string {
  switch (priority) {
    case 'HIGH':
      return 'priority-high'
    case 'MEDIUM':
      return 'priority-medium'
    case 'LOW':
      return 'priority-low'
    default:
      return 'priority-medium'
  }
}

/**
 * Determina si una notificación debe mostrarse como "urgente" basándose en su tipo y prioridad
 */
export function isUrgentNotification(notification: SharedNotification): boolean {
  const urgentTypes = ['task', 'purchase', 'system']
  const urgentPriorities = ['HIGH']

  return (
    urgentTypes.includes(notification.type) ||
    urgentPriorities.includes(notification.priority as NotificationPriority)
  )
}

/**
 * Comprueba si la notificación es de tipo "academic_event" (usada por la app Academy)
 */
export function isAcademicEvent(notification: SharedNotification): boolean {
  return notification.type === 'academic_event'
}

/**
 * Comprueba si la notificación es de tipo "inventory" (usada por la app Inventario)
 */
export function isInventoryAlert(notification: SharedNotification): boolean {
  return notification.type === 'inventory_alert'
}

/**
 * Comprueba si la notificación es de tipo "subscription" (usada por la app Ventas/Hub)
 */
export function isSubscriptionNotification(notification: SharedNotification): boolean {
  return notification.type === 'subscription'
}