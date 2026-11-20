/* ==============================================================
   QAWAY SHARED NOTIFICATIONS - SERVICE
   ==============================================================

   Capa de servicio para conexión con sistemas de notificaciones.
   Define la interfaz que las apps implementarán según su arquitectura.
   ------------------------------------------------------------------ */

import type { SharedNotification, NotificationType, NotificationPriority, RecipientRole, TenantNotificationPreferences, UserNotificationPreferences, NotificationFilters } from './types'

// ==============================================================
// NOTIFICACIONES POR TENANT
// ==============================================================

/** Verificar si las notificaciones están habilitadas para un tenant */
export function areNotificationsEnabled(
  prefs: TenantNotificationPreferences | undefined
): boolean {
  return prefs?.enabled === true
}

/** Obtener el mecanismo de entrega preferido */
export function getDeliveryMechanism(
  prefs: TenantNotificationPreferences | undefined
): 'none' | 'localStorage' | 'supabase-realtime' | 'both' {
  return prefs?.deliveryMechanism || 'none'
}

/** Obtener prioridades por defecto */
export function getDefaultPriorities(
  prefs: TenantNotificationPreferences | undefined
): NotificationPriority[] {
  return prefs?.defaultPriorities || ['MEDIUM']
}

/** Verificar si un canal está habilitado */
export function isChannelEnabled(
  prefs: TenantNotificationPreferences | undefined,
  channel: 'internal' | 'email' | 'push'
): boolean {
  return prefs?.channels?.[channel] ?? false
}

// ==============================================================
// PREFERENCIAS DE USUARIO
// ==============================================================

/** Verificar si usuario quiere sonido */
export function userWantsSound(prefs: UserNotificationPreferences): boolean {
  return prefs.sound !== false
}

/** Verificar si usuario quiere email */
export function userWantsEmail(prefs: UserNotificationPreferences): boolean {
  return prefs.email !== false
}

/** Verificar si usuario quiere push */
export function userWantsPush(prefs: UserNotificationPreferences): boolean {
  return prefs.push !== false
}

/** Obtener horario de silencio */
export function getQuietHours(
  prefs: UserNotificationPreferences
): { start: string; end: string } | undefined {
  return prefs.quietHours
}

// ==============================================================
// FILTROS Y BÚSQUEDA
// ==============================================================

/** Aplicar filtros a un array de notificaciones */
export function filterNotifications(
  notifications: SharedNotification[],
  filters: NotificationFilters
): SharedNotification[] {
  return notifications.filter(notif => {
    // Filtrar por tipo
    if (filters.type && !Array.isArray(filters.type)) {
      if (notif.type !== filters.type) return false
    } else if (filters.type && Array.isArray(filters.type)) {
      if (!filters.type.includes(notif.type)) return false
    }

    // Filtrar por prioridad
    if (filters.priority && !Array.isArray(filters.priority)) {
      if (notif.priority !== filters.priority) return false
    } else if (filters.priority && Array.isArray(filters.priority)) {
      if (!filters.priority.includes(notif.priority as NotificationPriority)) return false
    }

    // Filtrar por leído/no leído
    if (filters.is_read !== undefined && notif.is_read !== filters.is_read) return false

    // Filtrar por tenant
    if (filters.tenant_id && notif.tenant_id !== filters.tenant_id) return false

    return true
  })
}

/** Ordenar notificaciones por fecha (más recientes primero) */
export function sortByRecentFirst(
  notifications: SharedNotification[]
): SharedNotification[] {
  return [...notifications].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

/** Obtener notificaciones no leídas */
export function getUnreadNotifications(
  notifications: SharedNotification[]
): SharedNotification[] {
  return filterNotifications(notifications, { is_read: false })
}

// ==============================================================
// ESTADO DE LECTURA
// ==============================================================

/** Marcar notificación como leída (firma - la app implementa el almacenamiento) */
export type MarkReadHandler = (notificationId: string) => Promise<void> | void

/** Marcar todas como leídas */
export type MarkAllReadHandler = (notificationIds: string[]) => Promise<void> | void

// ==============================================================
// EVENTOS
// ==============================================================

/** Tipo de callback para cuando llega una notificación nueva */
export type OnNewNotification = (notification: SharedNotification) => void

/** Tipo de callback para cuando cambia el estado de lectura */
export type OnReadChange = (notification: SharedNotification) => void

// ==============================================================
// EXPORTACIÓN DE FUNCIONES PRINCIPALES
// ==============================================================

export type {
  SharedNotification,
  NotificationType,
  NotificationPriority,
  RecipientRole,
  TenantNotificationPreferences,
  UserNotificationPreferences,
  NotificationFilters,
  MarkReadHandler,
  MarkAllReadHandler,
  OnNewNotification,
  OnReadChange
}