/* Reglas compartidas de notificación del Hub: vencimientos y asignaciones.

   El motor (`notificationEngine`) sabe guardar, entregar y leer notificaciones,
   pero no decide *cuándo* nace una. Estas reglas son esa decisión, en dos
   casos que todas las apps comparten:

   1. Vencimiento ("corte"): un registro con fecha límite avisa cuando faltan
      `daysAhead` días hábiles y vuelve a avisar cuando ya venció. El estado se
      congela en el id, así que reprogramar la fecha genera un aviso nuevo y
      repetir el barrido no duplica nada.
   2. Asignación: cuando una tarea se asigna a una persona, nace una
      notificación de tarea para esa persona, con su origen auditable.

   Principios (los mismos del adaptador GP2):
   - Ninguna regla inventa destinatarios: los resuelve la app con su directorio
     real y los entrega como lista de ids. Sin destinatario no hay notificación.
   - La inserción es idempotente y no pisa el estado de lectura.
   - Los canales externos no se disparan aquí: el aviso entra como `internal`.
     Enviar correo/WhatsApp/push es una decisión aparte del transporte.

   La configuración por tenant vive en `settings.rules.deadlines` y se edita con
   `updateDeadlineRule`. Contrato completo en
   `Documentación/11-reglas-vencimientos-y-asignaciones.md`. */

import { getSettings, importNotifications, updateSettings } from './notificationEngine'

export const DEADLINE_STATE = Object.freeze({
  VENCIDO: 'vencido',
  PROXIMO_VENCER: 'proximo_vencer',
})

export const DEFAULT_DEADLINE_RULE = Object.freeze({
  /** Días hábiles de aviso previo al vencimiento. */
  daysAhead: 5,
  /** Si el registro ya venció, se avisa igual (prioridad alta). */
  includeOverdue: true,
  /** Días laborables (0 = domingo). */
  workingDays: Object.freeze([1, 2, 3, 4, 5]),
})

const DAY_MS = 86400000
const MAX_DAYS_AHEAD = 60

/* Fechas de calendario a mediodía local: evita el corrimiento de zona horaria
   que sí produce `new Date('2026-11-24')` (UTC). */
function toDay(value) {
  if (typeof value !== 'string') return null
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim())
  if (!match) return null
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), 12)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toIsoDay(value) {
  const date = value instanceof Date ? value : toDay(value)
  if (!date || Number.isNaN(date.getTime())) return ''
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, '0'),
    String(date.getDate()).padStart(2, '0'),
  ].join('-')
}

/** Regla efectiva: defaults → configuración del tenant → overrides puntuales. */
export function resolveDeadlineRule(overrides = {}) {
  const stored = getSettings().rules?.deadlines || {}
  const merged = { ...DEFAULT_DEADLINE_RULE, ...stored, ...(overrides || {}) }
  const daysAhead = Number(merged.daysAhead)
  const workingDays = Array.isArray(merged.workingDays)
    ? Array.from(new Set(merged.workingDays.map(Number).filter((d) => Number.isInteger(d) && d >= 0 && d <= 6)))
    : []

  return {
    daysAhead: Number.isFinite(daysAhead)
      ? Math.min(MAX_DAYS_AHEAD, Math.max(0, Math.round(daysAhead)))
      : DEFAULT_DEADLINE_RULE.daysAhead,
    includeOverdue: merged.includeOverdue !== false,
    workingDays: workingDays.length ? workingDays : [...DEFAULT_DEADLINE_RULE.workingDays],
  }
}

/** Guarda la regla en la configuración del tenant y devuelve la regla efectiva. */
export function updateDeadlineRule(patch = {}) {
  const next = resolveDeadlineRule(patch)
  updateSettings({ rules: { deadlines: next } })
  return next
}

/** Días hábiles con signo entre dos fechas ISO; 0 si es el mismo día. */
export function businessDaysBetween(fromIso, toIso, workingDays = DEFAULT_DEADLINE_RULE.workingDays) {
  const from = toDay(fromIso)
  const to = toDay(toIso)
  if (!from || !to) return 0
  if (from.getTime() === to.getTime()) return 0

  const forward = to > from
  const start = forward ? from : to
  const end = forward ? to : from
  const dias = new Set(workingDays)
  let count = 0
  const cursor = new Date(start.getTime())
  cursor.setDate(cursor.getDate() + 1)
  let guard = 0
  while (cursor <= end && guard < 4000) {
    if (dias.has(cursor.getDay())) count += 1
    cursor.setDate(cursor.getDate() + 1)
    guard += 1
  }
  return forward ? count : -count
}

/** Diferencia en días de calendario con signo (positivo si `toIso` es posterior). */
export function calendarDaysBetween(fromIso, toIso) {
  const from = toDay(fromIso)
  const to = toDay(toIso)
  if (!from || !to) return 0
  return Math.round((to.getTime() - from.getTime()) / DAY_MS)
}

/* Estado de un registro frente a su fecha límite.
   `item`: { ref|id, due, done } — `done` en true significa cumplido y no avisa.
   Devuelve `{ state, daysRemaining }` o `null` si aún está lejos o no aplica. */
export function deadlineStateFor(item, options = {}) {
  if (!item) return null
  const due = toDay(item.due)
  if (!due) return null
  if (item.done === true) return null

  const todayIso = options.today || toIsoDay(new Date())
  const rule = options.rule || resolveDeadlineRule()
  const today = toDay(todayIso)
  if (!today) return null

  if (due < today) {
    if (!rule.includeOverdue) return null
    return {
      state: DEADLINE_STATE.VENCIDO,
      daysRemaining: businessDaysBetween(todayIso, item.due, rule.workingDays),
    }
  }

  const remaining = businessDaysBetween(todayIso, item.due, rule.workingDays)
  if (remaining <= rule.daysAhead) {
    return { state: DEADLINE_STATE.PROXIMO_VENCER, daysRemaining: remaining }
  }
  return null
}

function defaultDeadlineTitle(item, evaluation) {
  const name = String(item.title || item.name || item.ref || item.id || '').trim()
  if (evaluation.state === DEADLINE_STATE.VENCIDO) return `Vencido: ${name}`
  if (evaluation.daysRemaining <= 0) return `Vence hoy: ${name}`
  return `Vence en ${evaluation.daysRemaining} día${evaluation.daysRemaining === 1 ? '' : 's'}: ${name}`
}

function defaultDeadlineMessage(item, evaluation) {
  const parts = []
  if (item.code) parts.push(String(item.code))
  if (item.due) parts.push(`fecha límite ${toIsoDay(item.due)}`)
  if (evaluation.state === DEADLINE_STATE.VENCIDO) {
    const atraso = Math.abs(evaluation.daysRemaining)
    parts.push(`venció hace ${atraso} día${atraso === 1 ? '' : 's'} hábil${atraso === 1 ? '' : 'es'}`)
  } else if (evaluation.daysRemaining > 0) {
    parts.push(`faltan ${evaluation.daysRemaining} día${evaluation.daysRemaining === 1 ? '' : 's'} hábil${evaluation.daysRemaining === 1 ? '' : 'es'}`)
  } else {
    parts.push('vence el día de hoy')
  }
  return parts.join(' · ')
}

/* Construye (sin persistir) una notificación por registro y destinatario.
   La app decide los destinatarios con `resolveRecipients(item, evaluation)`.
   `items` debe traer `ref` (o `id`), `due` y opcionalmente `title`, `name`,
   `code`, `done`. */
export function buildDeadlineNotifications(options = {}) {
  const items = Array.isArray(options.items) ? options.items : []
  const todayIso = options.today || toIsoDay(new Date())
  const rule = options.rule || resolveDeadlineRule()
  const appSlug = options.appSlug
  const adapter = options.adapter || appSlug || 'generic'
  const tenantId = options.tenantId || getSettings().tenant?.tenant_id
  const createdAt = options.now || new Date().toISOString()
  const notifications = []

  for (const item of items) {
    const ref = item?.ref || item?.id
    if (!ref) continue
    const evaluation = deadlineStateFor(item, { today: todayIso, rule })
    if (!evaluation) continue

    const resolved = typeof options.resolveRecipients === 'function'
      ? options.resolveRecipients(item, evaluation)
      : []
    const recipientIds = Array.from(new Set((resolved || []).filter(Boolean)))
    const dueDay = toIsoDay(item.due)
    const overdue = evaluation.state === DEADLINE_STATE.VENCIDO

    for (const recipientId of recipientIds) {
      notifications.push({
        id: `deadline:${adapter}:${ref}:${dueDay}:${evaluation.state}:${recipientId}`,
        app_slug: appSlug,
        recipient_id: recipientId,
        tenant_id: tenantId,
        type: options.type || 'task',
        priority: overdue ? 'HIGH' : 'MEDIUM',
        title: options.buildTitle
          ? String(options.buildTitle(item, evaluation) || '').trim()
          : defaultDeadlineTitle(item, evaluation),
        message: options.buildMessage
          ? String(options.buildMessage(item, evaluation) || '')
          : defaultDeadlineMessage(item, evaluation),
        created_at: createdAt,
        is_read: false,
        link: options.resolveLink ? options.resolveLink(item) || '' : '',
        source: options.source || appSlug || 'Motor',
        channels: ['internal'],
        origin: {
          adapter,
          rule: 'deadline',
          ref: String(ref),
          due: dueDay,
          state: evaluation.state,
          daysRemaining: evaluation.daysRemaining,
        },
      })
    }
  }

  return notifications
}

/* Barrido completo: construye e importa con ids deterministas.
   Repetirlo no duplica ni pisa `is_read` (regla de `importNotifications`). */
export function syncDeadlineNotifications(options = {}) {
  const notifications = buildDeadlineNotifications(options)
  const result = importNotifications(notifications)
  return {
    ...result,
    evaluated: Array.isArray(options.items) ? options.items.length : 0,
    candidates: notifications.length,
  }
}

/* ---------------- asignaciones ---------------- */

/* Contrato mínimo para avisar una asignación:
   { ref, title, assigneeId, appSlug, tenantId?, due?, priority?, message?,
     assignerId?, assignerName?, assignedAt?, link?, source?, adapter?,
     taskOrigin? } */
export function buildAssignmentNotification(input = {}) {
  const ref = input.ref
  const title = String(input.title || '').trim()
  const assigneeId = input.assigneeId
  const appSlug = input.appSlug
  if (!ref || !title || !assigneeId || !appSlug) return null

  const assignedAt = input.assignedAt || new Date().toISOString()
  const adapter = input.adapter || appSlug
  const dueDay = input.due ? toIsoDay(input.due) : ''
  const dueText = dueDay ? ` con fecha límite ${dueDay}` : ''

  return {
    id: `assignment:${adapter}:${ref}:${assigneeId}:${assignedAt}`,
    app_slug: appSlug,
    recipient_id: assigneeId,
    tenant_id: input.tenantId || getSettings().tenant?.tenant_id,
    type: 'task',
    priority: input.priority || 'HIGH',
    title: `Tarea asignada: ${title}`,
    message: input.message || `Se te asignó la tarea «${title}»${dueText}.`,
    created_at: assignedAt,
    is_read: false,
    link: input.link || '',
    source: input.source || appSlug,
    channels: ['internal'],
    taskResponseStatus: 'sin_notificar',
    taskOrigin: input.taskOrigin || 'asignacion',
    origin: {
      adapter,
      rule: 'assignment',
      ref: String(ref),
      assigneeId,
      assignedBy: input.assignerId || null,
      assignedByName: input.assignerName || null,
      due: dueDay || null,
    },
  }
}

/* Inserta el aviso de asignación. Es idempotente: la misma asignación
   (`ref` + `assigneeId` + `assignedAt`) no se duplica. */
export function notifyAssignment(input = {}) {
  const notification = buildAssignmentNotification(input)
  if (!notification) {
    return {
      ok: false,
      added: 0,
      skipped: 0,
      notifications: [],
      notification: null,
      errors: ['La asignación necesita ref, title, assigneeId y appSlug.'],
    }
  }
  const result = importNotifications([notification])
  return { ...result, notification: result.notifications[0] || null }
}
