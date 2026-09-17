/**
 * @file Contratos y Tipos Canónicos del CRM - 1-qawayLab-CRM
 * Define los modelos de datos de acuerdo con el Estándar V4 de Qaway Lab
 * y las especificaciones de la WhatsApp Business Platform (WABA / Cloud API).
 */

/**
 * Estados del embudo de ventas
 * @typedef {'new' | 'contactado' | 'propuesta' | 'negociacion' | 'ganado' | 'perdido'} LeadStatus
 */
export const LEAD_STATUSES = {
  NEW: 'new',
  CONTACTADO: 'contactado',
  PROPUESTA: 'propuesta',
  NEGOCIACION: 'negociacion',
  GANADO: 'ganado',
  PERDIDO: 'perdido'
}

/**
 * Roles con permisos y visibilidad segmentada
 * @typedef {'management' | 'marketing' | 'sales'} CrmRole
 */
export const CRM_ROLES = {
  MANAGEMENT: 'management',
  MARKETING: 'marketing',
  SALES: 'sales'
}

/**
 * Tipos de mensajes soportados en la conversación
 * @typedef {'text' | 'template' | 'flow' | 'interactive' | 'image' | 'document'} MessageType
 */

/**
 * Objeto de atribución de Meta Ads (Click-to-WhatsApp Ads / CTWA)
 * Capturado desde messages[].referral de la Cloud API
 * @typedef {Object} LeadReferral
 * @property {string} [ad_id] - ID único del anuncio de Meta
 * @property {string} [source_id] - ID de la página o cuenta origen
 * @property {string} [source_url] - Enlace al anuncio o post que generó el clic
 * @property {string} [headline] - Título del anuncio
 * @property {string} [body] - Texto del anuncio
 * @property {string} [media_type] - Tipo de contenido ('image' | 'video')
 * @property {string} [image_url] - Miniatura del anuncio
 * @property {string} [video_url] - URL de vista previa del video
 * @property {number} [ctwa_timestamp] - Marca de tiempo del clic para ventana de 72h gratuita
 */

/**
 * Estructura de mensaje individual en el historial
 * @typedef {Object} ChatMessage
 * @property {string} [id] - Identificador local del mensaje
 * @property {string} [wamid] - WhatsApp Message ID único (idempotencia)
 * @property {'agent' | 'lead' | 'system'} sender - Origen del mensaje
 * @property {string} text - Contenido en texto plano
 * @property {string} time - Hora formateada (ej. '12:30')
 * @property {number} [timestamp] - Timestamp epoch en milisegundos
 * @property {MessageType} [type] - Tipo de payload
 * @property {'sent' | 'delivered' | 'read' | 'failed'} [status] - Estado de entrega
 */

/**
 * Modelo canónico de un Prospecto / Lead
 * @typedef {Object} Lead
 * @property {string} id - UUID del prospecto
 * @property {string} name - Nombre completo o alias de contacto
 * @property {string} whatsapp - Número de teléfono internacional (E.164)
 * @property {string} [email] - Correo electrónico
 * @property {string} [campaignId] - ID de campaña asociada
 * @property {string} [campaignName] - Nombre de campaña
 * @property {LeadStatus} status - Etapa actual en el embudo
 * @property {'low' | 'medium' | 'high'} [priority] - Prioridad comercial
 * @property {number} [budget] - Presupuesto estimado en USD
 * @property {string} [agent] - Nombre del asesor asignado
 * @property {string} [lastMessage] - Último mensaje registrado
 * @property {number} [unreadCount] - Contador de mensajes no leídos
 * @property {ChatMessage[]} history - Historial cronológico de la conversación
 * @property {LeadReferral} [referral] - Datos de atribución de Meta Ads
 * @property {number} [lastCustomerMessageTimestamp] - Para cálculo de la ventana de 24h
 * @property {boolean} [windowActive24h] - Indicador de si la ventana de 24h está abierta
 * @property {'whatsapp' | 'instagram' | 'messenger' | 'email' | 'comment'} [channel] - Canal de procedencia omnicanal
 * @property {boolean} [isHumanRequested] - Indicador de solicitud de atención humana (Handover Protocol)
 * @property {string} [humanHandoffRequestedAt] - Marca de tiempo ISO de cuando se solicitó el asesor
 * @property {Record<string, any>} [metadata] - Parámetros adicionales
 * @property {string} [created_at] - Fecha ISO de registro
 */

/**
 * Duración máxima de la ventana de servicio al cliente de WhatsApp (24 horas en milisegundos)
 */
export const WABA_SERVICE_WINDOW_MS = 24 * 60 * 60 * 1000

/**
 * Duración de la ventana gratuita de conversación por Click-to-WhatsApp (72 horas en milisegundos)
 */
export const CTWA_FREE_WINDOW_MS = 72 * 60 * 60 * 1000
