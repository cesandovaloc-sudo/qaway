import { beforeEach, describe, expect, it } from 'vitest'
import { getNotifications, markRead, resetLibrary } from './notificationEngine'
import {
  DEADLINE_STATE,
  businessDaysBetween,
  buildDeadlineNotifications,
  deadlineStateFor,
  notifyAssignment,
  resolveDeadlineRule,
  syncDeadlineNotifications,
  updateDeadlineRule,
} from './notificationRules'

/* Martes 24/11/2026: viernes 27/11 está a 3 días hábiles. */
const HOY = '2026-11-24'

beforeEach(() => {
  resetLibrary()
})

describe('regla de vencimientos', () => {
  it('cuenta días hábiles y salta el fin de semana', () => {
    expect(businessDaysBetween(HOY, '2026-11-27')).toBe(3)
    expect(businessDaysBetween(HOY, '2026-11-30')).toBe(4)
    expect(businessDaysBetween(HOY, '2026-11-20')).toBe(-2)
    expect(businessDaysBetween(HOY, HOY)).toBe(0)
    expect(businessDaysBetween('2026-11-24', '2026-11-25', [])).toBe(0)
  })

  it('clasifica próximo, vencido y cumplido', () => {
    expect(deadlineStateFor({ ref: 'a', due: '2026-11-20' }, { today: HOY })).toEqual({
      state: DEADLINE_STATE.VENCIDO,
      daysRemaining: -2,
    })
    expect(deadlineStateFor({ ref: 'b', due: '2026-11-27' }, { today: HOY })).toEqual({
      state: DEADLINE_STATE.PROXIMO_VENCER,
      daysRemaining: 3,
    })
    // 01/12 está a 5 días hábiles, justo en el umbral por defecto.
    expect(deadlineStateFor({ ref: 'c', due: '2026-12-01' }, { today: HOY })?.state).toBe(
      DEADLINE_STATE.PROXIMO_VENCER
    )
    expect(deadlineStateFor({ ref: 'd', due: '2026-12-02' }, { today: HOY })).toBeNull()
    expect(deadlineStateFor({ ref: 'e', due: '2026-11-20', done: true }, { today: HOY })).toBeNull()
    expect(deadlineStateFor({ ref: 'f', due: 'sin-fecha' }, { today: HOY })).toBeNull()
  })

  it('construye un aviso por destinatario con id determinista', () => {
    const notifications = buildDeadlineNotifications({
      items: [{ ref: 'pt-1.6', code: '1.6', name: 'Paquete 1.6', due: '2026-11-27' }],
      today: HOY,
      appSlug: 'gestor_proyectos',
      adapter: 'gp2',
      tenantId: 'tenant-qaway',
      now: '2026-11-24T08:00:00.000Z',
      resolveRecipients: () => ['usr-ana', 'usr-luis', 'usr-ana'],
      resolveLink: (item) => `/hub/proyectos/${item.ref}`,
    })

    expect(notifications).toHaveLength(2)
    expect(notifications.map((n) => n.id)).toEqual([
      'deadline:gp2:pt-1.6:2026-11-27:proximo_vencer:usr-ana',
      'deadline:gp2:pt-1.6:2026-11-27:proximo_vencer:usr-luis',
    ])
    expect(notifications[0]).toMatchObject({
      app_slug: 'gestor_proyectos',
      recipient_id: 'usr-ana',
      tenant_id: 'tenant-qaway',
      type: 'task',
      priority: 'MEDIUM',
      title: 'Vence en 3 días: Paquete 1.6',
      link: '/hub/proyectos/pt-1.6',
      channels: ['internal'],
      is_read: false,
    })
    expect(notifications[0].origin).toMatchObject({
      adapter: 'gp2',
      rule: 'deadline',
      state: DEADLINE_STATE.PROXIMO_VENCER,
      daysRemaining: 3,
    })
  })

  it('no emite nada si no hay destinatario real', () => {
    expect(
      buildDeadlineNotifications({
        items: [{ ref: 'pt-1.6', due: '2026-11-27' }],
        today: HOY,
        appSlug: 'gestor_proyectos',
        resolveRecipients: () => [],
      })
    ).toEqual([])
  })

  it('sincroniza sin duplicar y conserva la lectura', () => {
    const options = {
      items: [{ ref: 'pt-1.6', code: '1.6', name: 'Paquete 1.6', due: '2026-11-27' }],
      today: HOY,
      appSlug: 'gestor_proyectos',
      adapter: 'gp2',
      resolveRecipients: () => ['usr-ana'],
    }

    const first = syncDeadlineNotifications(options)
    expect(first.added).toBe(1)
    expect(first.skipped).toBe(0)
    expect(first.candidates).toBe(1)

    markRead(first.notifications[0].id)
    const second = syncDeadlineNotifications(options)
    expect(second.added).toBe(0)
    expect(second.skipped).toBe(1)
    expect(getNotifications().find((n) => n.id === first.notifications[0].id)?.is_read).toBe(true)
  })

  it('lee el umbral de la configuración del tenant', () => {
    expect(resolveDeadlineRule().daysAhead).toBe(5)
    updateDeadlineRule({ daysAhead: 1 })

    expect(resolveDeadlineRule().daysAhead).toBe(1)
    expect(
      deadlineStateFor({ ref: 'c', due: '2026-12-01' }, { today: HOY })
    ).toBeNull()
    // El vencido sigue avisando aunque el umbral sea corto.
    expect(
      deadlineStateFor({ ref: 'a', due: '2026-11-20' }, { today: HOY })?.state
    ).toBe(DEADLINE_STATE.VENCIDO)
  })
})

describe('regla de asignación', () => {
  const assignment = {
    ref: 'task-1732500000000',
    title: 'Validar expediente',
    assigneeId: 'usr-luis',
    appSlug: 'gestor_proyectos',
    tenantId: 'tenant-qaway',
    due: '2026-11-30',
    assignerId: 'usr-ana',
    assignerName: 'Ana Quispe',
    assignedAt: '2026-11-24T09:00:00.000Z',
  }

  it('crea la notificación de tarea para el asignado', () => {
    const result = notifyAssignment(assignment)

    expect(result.ok).toBe(true)
    expect(result.added).toBe(1)
    expect(result.notification).toMatchObject({
      app_slug: 'gestor_proyectos',
      recipient_id: 'usr-luis',
      tenant_id: 'tenant-qaway',
      type: 'task',
      priority: 'HIGH',
      title: 'Tarea asignada: Validar expediente',
      message: 'Se te asignó la tarea «Validar expediente» con fecha límite 2026-11-30.',
      is_read: false,
      channels: ['internal'],
      taskResponseStatus: 'sin_notificar',
      taskOrigin: 'asignacion',
    })
    expect(result.notification?.origin).toEqual({
      adapter: 'gestor_proyectos',
      rule: 'assignment',
      ref: 'task-1732500000000',
      assigneeId: 'usr-luis',
      assignedBy: 'usr-ana',
      assignedByName: 'Ana Quispe',
      due: '2026-11-30',
    })
  })

  it('no duplica la misma asignación ni pisa la lectura', () => {
    const first = notifyAssignment(assignment)
    markRead(first.notification.id)

    const second = notifyAssignment(assignment)
    expect(second.added).toBe(0)
    expect(second.skipped).toBe(1)
    expect(getNotifications().find((n) => n.id === first.notification.id)?.is_read).toBe(true)
  })

  it('rechaza asignaciones sin destinatario', () => {
    const result = notifyAssignment({ ...assignment, assigneeId: '' })
    expect(result.ok).toBe(false)
    expect(result.errors?.length).toBe(1)
    expect(getNotifications().filter((n) => n.id.startsWith('assignment:'))).toHaveLength(0)
  })
})
