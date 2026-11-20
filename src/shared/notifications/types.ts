/* ==============================================================
   QAWAY SHARED NOTIFICATIONS - TYPES
   ==============================================================

   Definiciones de tipos compartidos para notificaciones.
   Estas interfaces son seguras para compartir porque solo describen
   la estructura de datos, no tienen lógica de negocio ni efectos secundarios.
   ------------------------------------------------------------------ */

export type WhatsAppStatus = 'sent' | 'delivered' | 'read' | 'failed'

export type TaskResponseStatus = 'sin_notificar' | 'esperando_respuesta' | 'respondido'

export type TaskOriginType = 'oficial_oficio' | 'accion_emergente'

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH'

export type NotificationType =
  | 'task'
  | 'purchase'
  | 'system'
  | 'academic_event'
  | 'inventory_alert'
  | 'subscription'
  | 'custom'
  | 'whatsapp'
  | 'email'

export type RecipientRole = 'admin' | 'user' | 'viewer' | 'customer'

export interface SharedNotification {
  /** Identificador único de la notificación */
  id: string
  /** Quién recibe (user_id o tenant_id) */
  recipient_id: string
  /** Tipo de notificación (para categorización) */
  type: NotificationType
  /** Título de la notificación */
  title: string
  /** Mensaje descriptivo */
  message: string
  /** Fecha de creación (ISO string) */
  created_at: string
  /** Ya fue leída? */
  is_read: boolean
  /** Enlace relacionado (URL o ID del elemento) */
  link?: string
  /** Nivel de prioridad */
  priority?: NotificationPriority
  /** ID del tenant/empresa asociada */
  tenant_id?: string
  /** Datos específicos de WhatsApp */
  whatsappData?: {
    status: WhatsAppStatus
    sentAt?: string
    sentBy?: string
    messageSid?: string
  }
  /** Datos específicos de email */
  emailData?: {
    sentAt?: string
    sentBy?: string
    messageId?: string
  }
  /** Seguimiento de respuesta de tarea */
  taskResponseStatus?: TaskResponseStatus
  /** Origen de la tarea */
  taskOrigin?: TaskOriginType
}

/** Estructura para preferencias de notificación por usuario */
export interface UserNotificationPreferences {
  /** Si el usuario quiere sonido */
  sound: boolean
  /** Si el usuario quiere email */
  email: boolean
  /** Si el usuario quiere push notifications */
  push: boolean
  /** Si el usuario quiere notificaciones WhatsApp */
  whatsapp: boolean
  /** Si el usuario quiere notificaciones push de WhatsApp */
  whatsappPush: boolean
  /** Horario de silencio (opcional) */
  quietHours?: {
    start: string // HH:MM format
    end: string // HH:MM format
  }
}

/** Estructura para preferencias de notificación por tenant */
export interface TenantNotificationPreferences {
  /** Si las notificaciones están habilitadas para este tenant */
  enabled: boolean
  /** Mecanismo de entrega preferido */
  deliveryMechanism: 'none' | 'localStorage' | 'supabase-realtime' | 'both'
  /** Prioridades por defecto a mostrar */
  defaultPriorities: NotificationPriority[]
  /** Canales de entrega */
  channels: {
    internal: boolean // Mostrar en la app
    email: boolean // Enviar email
    push: boolean // Notificaciones push del navegador
    whatsapp: boolean // Enviar por WhatsApp
  }
  /** Cuántos días mantener la notificación en vista */
  defaultExpirationDays?: number
}

/** Filtros para consultar/notificar */export interface NotificationFilters {
  /** Filtrar por tipo */
  type?: NotificationType | NotificationType[]
  /** Filtrar por prioridad */
  priority?: NotificationPriority | NotificationPriority[]
  /** Filtrar por leído/no leído */
  is_read?: boolean
  /** Filtrar por tenant */
  tenant_id?: string
  /** Filtrar por fecha (después de esta fecha) */
  after?: string // ISO string
  /** Filtrar por fecha (antes de esta fecha) */
  before?: string // ISO string
  /** Filtrar por estado de respuesta de tarea */
  taskResponseStatus?: TaskResponseStatus
  /** Filtrar por tipo de origen de tarea */
  taskOrigin?: TaskOriginType
}
