/* Adaptador GP2 → motor compartido (Escalón 1).
   Lee la campanita local del Gestor de Proyectos 2 (`qaway-gp-notifications-v1`)
   y la proyecta en el motor del Hub. Es de solo lectura: no escribe en GP2, no
   toca su diseño ni su campanita, y no inventa destinatarios. GP2 no expone
   usuarios en su capa de notificaciones, así que la identidad entra por
   `recipientId`; si no se entrega, se usa el perfil activo del motor, que es el
   único destinatario verificado hoy. El contrato completo y el alcance están en
   `Documentación/10-adaptador-gp2-motor.md`.

   Uso:
     const stop = watchGp2Notifications((result) => console.log(result.added))
     stop() // al desmontar el shell que lo haya conectado
*/

import { getActiveProfile, getSettings, importNotifications } from '../notificationEngine'

export const GP2_STORAGE_KEY = 'qaway-gp-notifications-v1'
export const GP2_UPDATED_EVENT = 'qaway-gp-notifications-updated'
export const GP2_APP_SLUG = 'gestor_proyectos'
export const GP2_ID_PREFIX = 'gp2-'

/* Taxonomía GP2 → taxonomía del motor (ver seed.PRIORITIES.legacy). */
export const GP2_PRIORITY_MAP = Object.freeze({
  CRITICAL: 'HIGH',
  PREVENTIVE: 'MEDIUM',
  INFO: 'LOW',
})

/* Categorías de GP2 → tipos del catálogo del motor. `mencion` no tiene tipo
   propio en NOTIFICATION_TYPES, por eso se conserva como `custom`. */
export const GP2_TYPE_MAP = Object.freeze({
  hito_vencido: 'task',
  prorroga: 'task',
  asignacion: 'task',
  mencion: 'custom',
  nudo_critico: 'system',
})

function defaultStorage() {
  return typeof localStorage === 'undefined' ? null : localStorage
}

/* Lectura tolerante: storage ausente, JSON corrupto o formato inesperado
   devuelven lista vacía, nunca lanzan. */
export function readGp2Notifications(storage = defaultStorage()) {
  if (!storage) return []
  try {
    const raw = storage.getItem(GP2_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/* Traduce una alerta de GP2 al modelo del motor sin decidir por la app:
   - prioridad y tipo salen de las tablas de arriba;
   - `description` pasa a `message`;
   - `read` pasa a `is_read`;
   - el enlace lo resuelve el consumidor (`resolveLink`) porque solo GP2
     conoce sus rutas;
   - la identidad llega por `recipientId` (ver cabecera);
   - `origin` conserva módulo/entidad de destino para el Escalón 2. */
export function mapGp2Notification(item, options = {}) {
  if (!item || !item.id || !item.title) return null

  const recipientId = options.recipientId || getActiveProfile()?.id
  if (!recipientId) return null

  const settings = getSettings()

  return {
    id: `${GP2_ID_PREFIX}${item.id}`,
    app_slug: GP2_APP_SLUG,
    recipient_id: recipientId,
    tenant_id: options.tenantId || settings.tenant?.tenant_id,
    type: GP2_TYPE_MAP[item.category] || 'custom',
    priority: GP2_PRIORITY_MAP[item.priority] || 'MEDIUM',
    title: String(item.title).trim(),
    message: item.description || '',
    created_at: item.createdAt || new Date().toISOString(),
    is_read: Boolean(item.read),
    link: (options.resolveLink ? options.resolveLink(item) : '') || '',
    source: 'GP2',
    channels: ['internal'],
    origin: {
      adapter: 'gp2',
      ref: item.id,
      targetModule: item.targetModule || null,
      targetEntityId: item.targetEntityId || null,
    },
  }
}

/* Sincroniza el estado actual de GP2 con el motor. Idempotente: las alertas ya
   importadas se omiten y conservan su estado de lectura en el motor. */
export function syncGp2Notifications(options = {}) {
  const raw = readGp2Notifications(options.storage)
  const mapped = raw.map((item) => mapGp2Notification(item, options)).filter(Boolean)
  const result = importNotifications(mapped)
  return { ...result, total: raw.length, mapped: mapped.length }
}

/* Conecta la campanita de GP2 con el motor: sincroniza al montar y en cada
   `qaway-gp-notifications-updated`. Devuelve la función para desconectarse. */
export function watchGp2Notifications(onSync, options = {}) {
  const run = () => {
    const result = syncGp2Notifications(options)
    if (typeof onSync === 'function') onSync(result)
    return result
  }

  run()

  if (typeof window === 'undefined') return () => {}

  const handler = () => run()
  window.addEventListener(GP2_UPDATED_EVENT, handler)
  return () => window.removeEventListener(GP2_UPDATED_EVENT, handler)
}
