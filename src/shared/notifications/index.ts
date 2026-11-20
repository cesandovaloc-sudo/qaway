/* ==============================================================
   QAWAY SHARED NOTIFICATIONS - PUBLIC API
   ==============================================================

   Este módulo provee la infraestructura mínima compartida para notificaciones
   en todas las aplicaciones Qaway Hub. Cada app puede importar solo lo que necesita.

   Principio: Importa solo lo que necesitas, cuando lo necesitas.
   ------------------------------------------------------------------ */

export type {
  // 1. Contrato mínimo de notificación compartido
  SharedNotification,
} from './types'

export {
  // 2. Tipos auxiliares
  NotificationType,
  NotificationPriority,
  RecipientRole,
} from './types'

// 3. Versión actual del paquete (para future versioning)
export const VERSION = '1.0.0'