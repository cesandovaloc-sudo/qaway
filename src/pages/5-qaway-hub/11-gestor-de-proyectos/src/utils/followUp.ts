import type { FollowUpStatus, WorkItem } from '@/types/project.types'

// ─────────────────────────────────────────────────────────────────────────
// followUp.ts — Utilidades de seguimiento territorial (Fase 10)
// Semáforo preventivo de fechas + contacto en 1 clic (WhatsApp / Correo)
// con mensaje institucional MINEDU-DIGERE preformateado.
// ─────────────────────────────────────────────────────────────────────────

const DAY_MS = 86_400_000

function startOfToday(): number {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return now.getTime()
}

function parseFollowUp(value: string | undefined): number | null {
  if (!value) return null
  const time = new Date(value.length <= 10 ? `${value}T00:00:00` : value).getTime()
  return Number.isNaN(time) ? null : time
}

/**
 * Semáforo preventivo: vencido (pasó la fecha), alerta (≤ 72h),
 * a tiempo (resto). Sin fecha → sin_fecha. Tarea cerrada → a tiempo.
 */
export function getFollowUpStatus(
  followUpDate: string | undefined,
  state?: WorkItem['state'],
): FollowUpStatus {
  if (state === 'done') return 'a_tiempo'
  const target = parseFollowUp(followUpDate)
  if (target === null) return 'sin_fecha'
  const diffDays = Math.floor((target - startOfToday()) / DAY_MS)
  if (diffDays < 0) return 'vencido'
  if (diffDays <= 3) return 'alerta'
  return 'a_tiempo'
}

/** Normaliza un teléfono a dígitos para wa.me (conserva código país). */
export function normalizePhoneForWa(phone: string | undefined): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 6 ? digits : null
}

export function formatFollowUpDate(value: string | undefined): string {
  if (!value) return 'Sin fecha'
  const date = new Date(value.length <= 10 ? `${value}T00:00:00` : value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export interface FollowUpContact {
  gestor: string
  ugel: string
  titulo: string
  fecha: string
  bloqueada: boolean
  motivoBloqueo?: string
}

export function toFollowUpContact(item: WorkItem): FollowUpContact {
  return {
    gestor: item.assignee.name,
    ugel: item.scopeTag || 'ámbito por definir',
    titulo: item.title,
    fecha: formatFollowUpDate(item.followUpDate),
    bloqueada: Boolean(item.isBlocked),
    motivoBloqueo: item.blockerReason,
  }
}

/** Mensaje institucional según plantilla del doc MINEDU (sección 4.2). */
export function buildFollowUpMessage(contact: FollowUpContact): string {
  const base =
    `Estimado ${contact.gestor}, recordatorio MINEDU-DIGERE sobre ${contact.ugel}: ` +
    `La tarea "${contact.titulo}" vence el ${contact.fecha}. Favor remitir estado urgente.`
  if (contact.bloqueada && contact.motivoBloqueo) {
    return `${base} Bloqueo reportado: ${contact.motivoBloqueo}`
  }
  return base
}

export function buildWhatsAppUrl(phone: string | undefined, message: string): string | null {
  const digits = normalizePhoneForWa(phone)
  if (!digits) return null
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function buildMailtoUrl(
  email: string | undefined,
  contact: FollowUpContact,
): string | null {
  if (!email || !email.includes('@')) return null
  const subject = `Seguimiento MINEDU-DIGERE: ${contact.ugel} — ${contact.titulo}`
  const body =
    `${buildFollowUpMessage(contact)}\n\n` +
    `Atentamente,\nEquipo de Monitoreo Territorial DIGERE`
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}
