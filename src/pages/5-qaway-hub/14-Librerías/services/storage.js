/* Almacenamiento del Centro de Notificaciones y Perfiles.
   Funciona con localStorage y cae a memoria cuando no existe (tests / SSR). */

const PREFIX = 'qaway.notif-hub.'

const memory = new Map()

function emitter() {
  if (typeof window === 'undefined') return null
  return window
}

export function readJSON(key, fallback) {
  if (typeof localStorage === 'undefined') {
    return memory.has(key) ? memory.get(key) : fallback
  }
  try {
    const raw = localStorage.getItem(PREFIX + key)
    if (raw == null) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeJSON(key, value) {
  if (typeof localStorage === 'undefined') {
    memory.set(key, value)
    return
  }
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value))
  } catch {
    memory.set(key, value)
  }
}

export function removeJSON(key) {
  memory.delete(key)
  if (typeof localStorage !== 'undefined') localStorage.removeItem(PREFIX + key)
}

export function newId(prefix = 'id') {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`
}

/* Evento único que cualquier app puede escuchar para sincronizar su campanita. */
export const CHANGE_EVENT = 'qaway-notification-hub:changed'

export function emitChange(detail = {}) {
  const target = emitter()
  if (!target) return
  target.dispatchEvent(new CustomEvent(CHANGE_EVENT, { detail }))
}

export function onExternalChange(callback) {
  const target = emitter()
  if (!target) return () => {}
  const handler = (event) => callback(event.detail || {})
  target.addEventListener(CHANGE_EVENT, handler)
  return () => target.removeEventListener(CHANGE_EVENT, handler)
}

export function formatDateTime(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function relativeTime(iso) {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000)
  if (minutes < 1) return 'ahora'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  const days = Math.floor(hours / 24)
  if (days < 30) return `hace ${days} d`
  return date.toLocaleDateString('es-PE')
}
