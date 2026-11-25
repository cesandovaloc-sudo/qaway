/* Motor de notificaciones del Hub: reúne en un solo modelo el comportamiento
   real de todas las apps (bandeja, prioridades, canales, seguimiento de envío,
   respuesta de tareas y lectura) y expone una API para que cada app lo consuma.

   Persistencia: localStorage. Los envíos externos usan transportes
   registrables; por defecto hay un transporte demo que deja auditoría
   (enviado por / fecha / estado) sin depender de credenciales. */

import { emitChange, newId, readJSON, writeJSON } from './storage'
import {
  APPS,
  NOTIFICATION_TYPES,
  ORG_ROLES,
  PRIORITIES,
  PROJECT_PERMISSIONS,
  defaultNotifications,
  defaultProfiles,
  defaultSettings,
} from './seed'

const KEY_NOTIFICATIONS = 'notifications'
const KEY_PROFILES = 'profiles'
const KEY_SETTINGS = 'settings'

export const DELIVERY_STATUS = {
  SENT: 'enviado',
  SKIPPED: 'omitido',
  PENDING: 'pendiente',
  FAILED: 'fallido',
}

const DEFAULT_PREFERENCES = {
  theme: 'system',
  language: 'es',
  notifications: {
    enabled: true,
    only_urgent: false,
    sound: true,
    channels: { internal: true, email: true, push: true, whatsapp: false },
    quiet_hours: { enabled: false, start: '22:00', end: '07:00' },
  },
  session: { remember_me: true, auto_logout_minutes: 60 },
}

/* ---------------- transportes ---------------- */

const transports = new Map()

export function registerTransport(channel, handler, options = {}) {
  transports.set(channel, { handler, simulated: options.simulated !== false })
}

export function getRegisteredTransports() {
  return Array.from(transports.entries()).map(([channel, value]) => ({
    channel,
    simulated: value.simulated,
  }))
}

// Transporte demo: deja rastro auditable mientras se conecta el proveedor real.
registerTransport('email', async (notification) => ({
  ok: true,
  messageId: `demo-${newId('email')}`,
  to: notification.recipient_id,
}))
registerTransport('whatsapp', async (notification) => ({
  ok: true,
  messageId: `demo-${newId('wa')}`,
  to: notification.recipient_id,
}))

/* ---------------- estado ---------------- */

function ensure() {
  let notifications = readJSON(KEY_NOTIFICATIONS, null)
  if (!Array.isArray(notifications)) {
    notifications = defaultNotifications()
    writeJSON(KEY_NOTIFICATIONS, notifications)
  }
  let profiles = readJSON(KEY_PROFILES, null)
  if (!Array.isArray(profiles) || profiles.length === 0) {
    profiles = defaultProfiles()
    writeJSON(KEY_PROFILES, profiles)
  }
  let settings = readJSON(KEY_SETTINGS, null)
  if (!settings || typeof settings !== 'object') {
    settings = defaultSettings()
    writeJSON(KEY_SETTINGS, settings)
  }
  return { notifications, profiles, settings }
}

export function getSettings() {
  return ensure().settings
}

export function updateSettings(patch) {
  const { settings } = ensure()
  const next = {
    ...settings,
    ...patch,
    tenant: { ...settings.tenant, ...(patch.tenant || {}) },
    rules: {
      ...settings.rules,
      ...(patch.rules || {}),
      deadlines: {
        ...settings.rules?.deadlines,
        ...(patch.rules?.deadlines || {}),
      },
    },
  }
  writeJSON(KEY_SETTINGS, next)
  emitChange({ kind: 'settings' })
  return next
}

export function getActiveProfile() {
  const { profiles, settings } = ensure()
  return profiles.find((p) => p.id === settings.activeProfileId) || profiles[0] || null
}

export function setActiveProfile(profileId) {
  updateSettings({ activeProfileId: profileId })
}

export function getProfiles() {
  return ensure().profiles
}

export function getProfileById(id) {
  return ensure().profiles.find((p) => p.id === id) || null
}

/* ── Cargos y permisos ────────────────────────────────────────────────────
   Mismo modelo que la app verde: el cargo concede, el perfil puede forzar
   sí o no encima. `permissions` del perfil solo guarda ajustes explícitos. */

export function getOrgRoles() {
  return ORG_ROLES
}

export function getPermissionCatalog() {
  return PROJECT_PERMISSIONS
}

export function getRoleOf(profile) {
  if (!profile) return null
  return ORG_ROLES.find((role) => role.id === profile.cargo_id) || null
}

/** Permisos efectivos: base del cargo + ajustes del perfil. */
export function resolvePermissions(target) {
  const profile = typeof target === 'string' ? getProfileById(target) : target || getActiveProfile()
  const role = getRoleOf(profile)
  const effective = {}
  PROJECT_PERMISSIONS.forEach((permission) => {
    effective[permission.key] = Boolean(role?.permissions?.[permission.key])
  })
  Object.entries(profile?.permissions || {}).forEach(([key, value]) => {
    effective[key] = Boolean(value)
  })
  return effective
}

export function hasPermission(target, permissionKey) {
  return Boolean(resolvePermissions(target)[permissionKey])
}

/** Ajuste explícito: true/false fuerza; null vuelve a heredar del cargo. */
export function setPermissionOverride(profileId, permissionKey, value) {
  const profile = getProfileById(profileId)
  if (!profile) return null
  const permissions = { ...(profile.permissions || {}) }
  if (value === null || value === undefined) delete permissions[permissionKey]
  else permissions[permissionKey] = Boolean(value)
  return updateProfile(profileId, { permissions })
}

export function setProfileStatus(profileId, status) {
  const allowed = ['activo', 'inactivo', 'invitado']
  if (!allowed.includes(status)) return null
  return updateProfile(profileId, { status })
}

export function getPreferences(profile) {
  const target = profile || getActiveProfile()
  const stored = target?.preferences || {}
  const channels = { ...DEFAULT_PREFERENCES.notifications.channels, ...(stored.notifications?.channels || {}) }
  return {
    theme: stored.theme || DEFAULT_PREFERENCES.theme,
    language: stored.language || DEFAULT_PREFERENCES.language,
    notifications: {
      ...DEFAULT_PREFERENCES.notifications,
      ...(stored.notifications || {}),
      channels,
      quiet_hours: {
        ...DEFAULT_PREFERENCES.notifications.quiet_hours,
        ...(stored.notifications?.quiet_hours || {}),
      },
    },
    session: { ...DEFAULT_PREFERENCES.session, ...(stored.session || {}) },
  }
}

export function updateProfile(profileId, patch) {
  const { profiles } = ensure()
  const index = profiles.findIndex((p) => p.id === profileId)
  if (index === -1) return null
  const current = profiles[index]
  const next = {
    ...current,
    ...patch,
    preferences: {
      ...current.preferences,
      ...(patch.preferences || {}),
      notifications: {
        ...current.preferences?.notifications,
        ...(patch.preferences?.notifications || {}),
        channels: {
          ...current.preferences?.notifications?.channels,
          ...(patch.preferences?.notifications?.channels || {}),
        },
        quiet_hours: {
          ...current.preferences?.notifications?.quiet_hours,
          ...(patch.preferences?.notifications?.quiet_hours || {}),
        },
      },
      session: {
        ...current.preferences?.session,
        ...(patch.preferences?.session || {}),
      },
    },
  }
  profiles[index] = next
  writeJSON(KEY_PROFILES, profiles)
  emitChange({ kind: 'profile', id: profileId })
  return next
}

/* ---------------- consultas ---------------- */

export function getNotifications() {
  return ensure().notifications
}

function toArray(value) {
  if (value == null) return null
  return Array.isArray(value) ? value : [value]
}

function matchesSearch(notification, term) {
  if (!term) return true
  const needle = term.toLowerCase()
  return (
    notification.title?.toLowerCase().includes(needle) ||
    notification.message?.toLowerCase().includes(needle) ||
    appName(notification.app_slug).toLowerCase().includes(needle)
  )
}

export function listNotifications(filters = {}) {
  const { notifications } = ensure()
  const types = toArray(filters.type)
  const priorities = toArray(filters.priority)
  const apps = toArray(filters.app_slug)

  return notifications
    .filter((n) => {
      if (apps && !apps.includes(n.app_slug)) return false
      if (types && !types.includes(n.type)) return false
      if (priorities && !priorities.includes(n.priority)) return false
      if (filters.is_read !== undefined && Boolean(n.is_read) !== Boolean(filters.is_read)) return false
      if (filters.recipient_id && n.recipient_id !== filters.recipient_id) return false
      if (filters.tenant_id && n.tenant_id !== filters.tenant_id) return false
      if (filters.channel) {
        const hasChannel = (n.delivery || []).some((d) => d.channel === filters.channel) || (n.channels || []).includes(filters.channel)
        if (!hasChannel) return false
      }
      if (filters.taskResponseStatus && n.taskResponseStatus !== filters.taskResponseStatus) return false
      if (!matchesSearch(n, filters.search)) return false
      return true
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

export function getUnreadCount(filters = {}) {
  return listNotifications({ ...filters, is_read: false }).length
}

export function appName(slug) {
  return APPS.find((app) => app.slug === slug)?.name || slug
}

export function getStats() {
  const notifications = getNotifications()
  const byApp = new Map()
  for (const app of APPS) byApp.set(app.slug, { total: 0, unread: 0 })
  for (const notification of notifications) {
    const entry = byApp.get(notification.app_slug) || { total: 0, unread: 0 }
    entry.total += 1
    if (!notification.is_read) entry.unread += 1
    byApp.set(notification.app_slug, entry)
  }
  return {
    total: notifications.length,
    unread: notifications.filter((n) => !n.is_read).length,
    byApp: Array.from(byApp.entries()).map(([slug, value]) => ({
      slug,
      name: appName(slug),
      ...value,
    })),
  }
}

/* ---------------- envío ---------------- */

function minutesOf(hhmm) {
  const [hours, minutes] = String(hhmm || '00:00').split(':').map(Number)
  return (hours || 0) * 60 + (minutes || 0)
}

export function isWithinQuietHours(quietHours, date = new Date()) {
  if (!quietHours?.enabled) return false
  const now = date.getHours() * 60 + date.getMinutes()
  const start = minutesOf(quietHours.start)
  const end = minutesOf(quietHours.end)
  if (start === end) return false
  if (start < end) return now >= start && now < end
  return now >= start || now < end
}

function skip(channel, reason) {
  return { channel, status: DELIVERY_STATUS.SKIPPED, reason }
}

/* Decide y ejecuta la entrega de una notificación.
   Devuelve la lista de canales con su resultado, sin fingir envíos. */
async function deliver(notification, options = {}) {
  const settings = getSettings()
  const profile = getProfileById(notification.recipient_id) || getActiveProfile()
  const preferences = getPreferences(profile)
  const tenant = settings.tenant || {}
  const requested = notification.channels || ['internal']
  const results = []
  const now = options.now || new Date()

  if (tenant.enabled === false) {
    return requested.map((channel) => skip(channel, 'tenant_deshabilitado'))
  }

  const onlyUrgent = Boolean(preferences.notifications.only_urgent)
  const urgent = notification.priority === 'HIGH'
  const quiet = tenant.quietHoursEnforced !== false && isWithinQuietHours(preferences.notifications.quiet_hours, now)

  for (const channel of requested) {
    if (channel === 'internal') {
      results.push(
        tenant.channels?.internal === false
          ? skip('internal', 'tenant_deshabilitado')
          : { channel: 'internal', status: DELIVERY_STATUS.SENT }
      )
      continue
    }

    if (tenant.channels?.[channel] === false) {
      results.push(skip(channel, 'tenant_deshabilitado'))
      continue
    }
    if (preferences.notifications.enabled === false) {
      results.push(skip(channel, 'preferencias_desactivadas'))
      continue
    }
    if (onlyUrgent && !urgent) {
      results.push(skip(channel, 'solo_urgentes'))
      continue
    }
    if (channel === 'push' && quiet) {
      results.push(skip(channel, 'horario_silencio'))
      continue
    }
    if (channel === 'whatsapp' && quiet) {
      results.push(skip(channel, 'horario_silencio'))
      continue
    }
    if (preferences.notifications.channels?.[channel] === false) {
      results.push(skip(channel, 'canal_desactivado'))
      continue
    }

    const transport = transports.get(channel)
    if (!transport) {
      results.push(skip(channel, 'sin_transporte'))
      continue
    }

    try {
      const response = await transport.handler(notification)
      if (response?.ok === false) {
        results.push({ channel, status: DELIVERY_STATUS.FAILED, reason: response.error || 'error_proveedor' })
        continue
      }
      results.push({
        channel,
        status: DELIVERY_STATUS.SENT,
        messageId: response?.messageId,
        simulated: transport.simulated,
        at: now.toISOString(),
        by: profile?.id || 'sistema',
      })
    } catch (error) {
      results.push({ channel, status: DELIVERY_STATUS.FAILED, reason: String(error?.message || error) })
    }
  }

  return results
}

function applyDelivery(notification, results) {
  const byChannel = new Map(results.map((r) => [r.channel, r]))
  const email = byChannel.get('email')
  const whatsapp = byChannel.get('whatsapp')

  const next = { ...notification, delivery: results }

  if (email?.status === DELIVERY_STATUS.SENT) {
    next.emailData = { sentAt: email.at, sentBy: email.by, messageId: email.messageId }
  }
  if (whatsapp?.status === DELIVERY_STATUS.SENT) {
    next.whatsappData = {
      status: 'sent',
      sentAt: whatsapp.at,
      sentBy: whatsapp.by,
      messageId: whatsapp.messageId,
    }
    if (notification.taskResponseStatus === 'sin_notificar') {
      next.taskResponseStatus = 'esperando_respuesta'
    }
  }
  return next
}

/* Vista previa sin efectos: qué pasaría con cada canal pedido. */
export function previewChannels(recipientId, priority, channels = ['internal']) {
  const profile = getProfileById(recipientId) || getActiveProfile()
  const preferences = getPreferences(profile)
  const tenant = getSettings().tenant || {}
  const urgent = priority === 'HIGH'
  const quiet = tenant.quietHoursEnforced !== false && isWithinQuietHours(preferences.notifications.quiet_hours)

  return channels.map((channel) => {
    if (channel === 'internal') return { channel, allowed: tenant.channels?.internal !== false, reason: 'Canal interno' }
    if (tenant.channels?.[channel] === false) return { channel, allowed: false, reason: 'Deshabilitado por el tenant' }
    if (preferences.notifications.enabled === false) return { channel, allowed: false, reason: 'Preferencias desactivadas' }
    if (preferences.notifications.only_urgent && !urgent) return { channel, allowed: false, reason: 'Solo urgentes' }
    if ((channel === 'push' || channel === 'whatsapp') && quiet) return { channel, allowed: false, reason: 'Horario de silencio' }
    if (preferences.notifications.channels?.[channel] === false) return { channel, allowed: false, reason: 'Canal desactivado por el usuario' }
    if (!transports.has(channel)) return { channel, allowed: false, reason: 'Sin transporte registrado' }
    return { channel, allowed: true, reason: 'Se enviará' }
  })
}

export function validateNotificationInput(input) {
  const errors = []
  if (!input?.title || !String(input.title).trim()) errors.push('El título es obligatorio.')
  if (!input?.recipient_id) errors.push('Elige un destinatario.')
  if (!input?.app_slug) errors.push('Elige la app de origen.')
  return errors
}

export async function sendNotification(input, options = {}) {
  const errors = validateNotificationInput(input)
  if (errors.length) return { ok: false, errors }

  const { notifications } = ensure()
  const now = options.now || new Date()
  const notification = {
    id: newId('ntf'),
    app_slug: input.app_slug,
    recipient_id: input.recipient_id,
    tenant_id: input.tenant_id || getProfileById(input.recipient_id)?.tenant_id || getSettings().tenant.tenant_id,
    type: input.type || 'custom',
    priority: input.priority || 'MEDIUM',
    title: String(input.title).trim(),
    message: input.message || '',
    created_at: now.toISOString(),
    is_read: false,
    link: input.link || '',
    source: input.source || appName(input.app_slug),
    channels: input.channels?.length ? input.channels : ['internal'],
    taskResponseStatus: input.type === 'task' ? input.taskResponseStatus || 'sin_notificar' : undefined,
    taskOrigin: input.taskOrigin || undefined,
  }

  const results = await deliver(notification, { now })
  const stored = applyDelivery(notification, results)

  writeJSON(KEY_NOTIFICATIONS, [stored, ...notifications])
  emitChange({ kind: 'notification', id: stored.id, app: stored.app_slug })

  return {
    ok: true,
    notification: stored,
    delivery: results,
    anythingDelivered: results.some((r) => r.status === DELIVERY_STATUS.SENT),
  }
}

/* ---------------- importación desde adaptadores ----------------

   Puerta de entrada para los adaptadores de las apps (hoy GP2). Es de solo
   inserción: si el id ya existe no se toca, para no borrar el estado de lectura
   del usuario ni duplicar la notificación en cada sincronización. No ejecuta
   transportes ni escribe auditoría de envío: solo proyecta el dato ya existente
   en la app de origen. */

export function importNotifications(items) {
  const incoming = (Array.isArray(items) ? items : []).filter((item) => item && item.id)
  if (!incoming.length) return { ok: true, added: 0, skipped: 0, notifications: [] }

  const { notifications } = ensure()
  const known = new Set(notifications.map((notification) => notification.id))
  const accepted = []
  let skipped = 0

  for (const item of incoming) {
    if (known.has(item.id) || validateNotificationInput(item).length) {
      skipped += 1
      continue
    }
    known.add(item.id)
    accepted.push(item)
  }

  if (accepted.length) {
    writeJSON(KEY_NOTIFICATIONS, [...accepted, ...notifications])
    emitChange({ kind: 'notification', imported: accepted.length, app: accepted[0].app_slug })
  }

  return { ok: true, added: accepted.length, skipped, notifications: accepted }
}

export async function retryDelivery(notificationId, channels, options = {}) {
  const { notifications } = ensure()
  const index = notifications.findIndex((n) => n.id === notificationId)
  if (index === -1) return { ok: false, errors: ['Notificación inexistente.'] }
  const notification = { ...notifications[index], channels }
  const results = await deliver(notification, { now: options.now || new Date() })
  const merged = new Map((notifications[index].delivery || []).map((entry) => [entry.channel, entry]))
  for (const result of results) merged.set(result.channel, result)
  const stored = applyDelivery(notification, Array.from(merged.values()))
  notifications[index] = stored
  writeJSON(KEY_NOTIFICATIONS, notifications)
  emitChange({ kind: 'notification', id: stored.id, app: stored.app_slug })
  return { ok: true, notification: stored, delivery: Array.from(merged.values()) }
}

/* ---------------- lectura / estado ---------------- */

export function markRead(notificationId, isRead = true) {
  const { notifications } = ensure()
  const index = notifications.findIndex((n) => n.id === notificationId)
  if (index === -1) return null
  notifications[index] = { ...notifications[index], is_read: Boolean(isRead) }
  writeJSON(KEY_NOTIFICATIONS, notifications)
  emitChange({ kind: 'notification', id: notificationId })
  return notifications[index]
}

export function markAllRead(filters = {}) {
  const { notifications } = ensure()
  const targets = new Set(listNotifications(filters).map((n) => n.id))
  let changed = 0
  const next = notifications.map((notification) => {
    if (!targets.has(notification.id) || notification.is_read) return notification
    changed += 1
    return { ...notification, is_read: true }
  })
  writeJSON(KEY_NOTIFICATIONS, next)
  emitChange({ kind: 'notification' })
  return changed
}

export function removeNotification(notificationId) {
  const { notifications } = ensure()
  const next = notifications.filter((n) => n.id !== notificationId)
  writeJSON(KEY_NOTIFICATIONS, next)
  emitChange({ kind: 'notification', id: notificationId })
  return next.length !== notifications.length
}

export function setTaskResponse(notificationId, status) {
  const { notifications } = ensure()
  const index = notifications.findIndex((n) => n.id === notificationId)
  if (index === -1) return null
  notifications[index] = { ...notifications[index], taskResponseStatus: status }
  writeJSON(KEY_NOTIFICATIONS, notifications)
  emitChange({ kind: 'notification', id: notificationId })
  return notifications[index]
}

export function resetLibrary() {
  writeJSON(KEY_NOTIFICATIONS, defaultNotifications())
  writeJSON(KEY_PROFILES, defaultProfiles())
  writeJSON(KEY_SETTINGS, defaultSettings())
  emitChange({ kind: 'reset' })
}

export const CATALOG = { APPS, NOTIFICATION_TYPES, PRIORITIES, ORG_ROLES, PROJECT_PERMISSIONS }
