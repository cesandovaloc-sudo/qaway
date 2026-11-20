import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  getNotifications,
  getProfiles,
  hasPermission,
  getUnreadCount,
  isWithinQuietHours,
  listNotifications,
  markAllRead,
  markRead,
  previewChannels,
  resetLibrary,
  resolvePermissions,
  sendNotification,
  setPermissionOverride,
  setProfileStatus,
  setTaskResponse,
} from './notificationEngine'
import { getAdoptionPlan } from './adoptionMatrix'

describe('motor de notificaciones', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined' && window.localStorage) window.localStorage.clear()
    resetLibrary()
  })

  it('arranca con datos unificados de todas las apps', () => {
    expect(getNotifications().length).toBeGreaterThan(0)
    expect(getProfiles().length).toBeGreaterThan(0)
    const apps = new Set(getNotifications().map((n) => n.app_slug))
    expect(apps.has('academy')).toBe(true)
    expect(apps.has('gestor_proyectos')).toBe(true)
  })

  it('filtra por app, prioridad y lectura', () => {
    const gp = listNotifications({ app_slug: 'gestor_proyectos' })
    expect(gp.every((n) => n.app_slug === 'gestor_proyectos')).toBe(true)

    const urgent = listNotifications({ priority: 'HIGH' })
    expect(urgent.every((n) => n.priority === 'HIGH')).toBe(true)

    const unreadBefore = getUnreadCount()
    expect(unreadBefore).toBeGreaterThan(0)
  })

  it('marca una y todas como leídas', () => {
    const [first] = listNotifications({ is_read: false })
    markRead(first.id)
    expect(getNotifications().find((n) => n.id === first.id)?.is_read).toBe(true)

    markAllRead()
    expect(getUnreadCount()).toBe(0)
  })

  it('envía por correo y WhatsApp registrando auditoría', async () => {
    const result = await sendNotification(
      {
        app_slug: 'gestor_proyectos',
        recipient_id: 'usr-ana',
        type: 'task',
        priority: 'HIGH',
        title: 'Prueba de envío',
        message: 'Debe auditar canales',
        channels: ['internal', 'email', 'whatsapp'],
        taskResponseStatus: 'sin_notificar',
      },
      { now: new Date('2026-11-20T15:00:00.000Z') }
    )

    expect(result.ok).toBe(true)
    const channels = result.delivery.map((entry: { channel: string }) => entry.channel)
    expect(channels).toEqual(['internal', 'email', 'whatsapp'])
    expect(result.notification.emailData?.sentAt).toBeTruthy()
    expect(result.notification.whatsappData?.status).toBe('sent')
    expect(result.notification.taskResponseStatus).toBe('esperando_respuesta')
  })

  it('respeta solo urgentes: prioridad media no sale por canales externos', async () => {
    const result = await sendNotification({
      app_slug: 'gestor_proyectos',
      recipient_id: 'usr-luis',
      type: 'custom',
      priority: 'MEDIUM',
      title: 'Aviso medio',
      channels: ['internal', 'email', 'whatsapp'],
    })

    const skipped = result.delivery.filter((entry: { status: string }) => entry.status === 'omitido')
    expect(skipped.length).toBeGreaterThan(0)
    expect(result.notification.emailData).toBeUndefined()
  })

  it('respeta el horario de silencio del destinatario', async () => {
    // Ana tiene silencio 22:00–07:00.
    expect(isWithinQuietHours({ enabled: true, start: '22:00', end: '07:00' }, new Date('2026-11-20T23:30:00'))).toBe(true)
    const result = await sendNotification(
      {
        app_slug: 'gestor_proyectos',
        recipient_id: 'usr-ana',
        type: 'system',
        priority: 'HIGH',
        title: 'Aviso nocturno',
        channels: ['whatsapp', 'email'],
      },
      { now: new Date('2026-11-20T23:30:00') }
    )
    const whatsapp = result.delivery.find((entry: { channel: string }) => entry.channel === 'whatsapp')
    const email = result.delivery.find((entry: { channel: string }) => entry.channel === 'email')
    expect(whatsapp?.status).toBe('omitido')
    expect(whatsapp?.reason).toBe('horario_silencio')
    expect(email?.status).toBe('enviado')
  })

  it('rechaza envíos sin título o destinatario', async () => {
    const result = await sendNotification({ app_slug: 'crm', title: '   ' })
    expect(result.ok).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(2)
  })

  it('actualiza el estado de respuesta de una tarea', () => {
    const task = getNotifications().find((n) => n.type === 'task')
    setTaskResponse(task.id, 'respondido')
    expect(getNotifications().find((n) => n.id === task.id)?.taskResponseStatus).toBe('respondido')
  })

  it('la vista previa explica cada canal sin enviar', () => {
    const preview = previewChannels('usr-luis', 'MEDIUM', ['internal', 'email'])
    const email = preview.find((entry: { channel: string }) => entry.channel === 'email')
    expect(email?.allowed).toBe(false)
    expect(email?.reason).toBe('Solo urgentes')
  })

  it('resuelve permisos por cargo con ajuste individual (modelo de la app verde)', () => {
    // Luis es Gestor Territorial, pero tiene un ajuste que le permite aprobar hitos.
    expect(resolvePermissions('usr-luis').can_create_field_tasks).toBe(true)
    expect(resolvePermissions('usr-luis').can_approve_milestones).toBe(true)
    expect(resolvePermissions('usr-luis').can_manage_roles).toBe(false)

    // Carlos es Coordinador General, pero un ajuste le quita editar proyectos.
    expect(resolvePermissions('usr-carlos').can_assign_regions).toBe(true)
    expect(resolvePermissions('usr-carlos').can_edit_projects).toBe(false)
    expect(hasPermission('usr-carlos', 'can_edit_projects')).toBe(false)

    // Cliente: cargo sin permisos.
    expect(Object.values(resolvePermissions('usr-maria')).some(Boolean)).toBe(false)
  })

  it('permite forzar y devolver al cargo un permiso, y cambiar el estado', () => {
    setPermissionOverride('usr-maria', 'can_edit_projects', true)
    expect(hasPermission('usr-maria', 'can_edit_projects')).toBe(true)

    setPermissionOverride('usr-maria', 'can_edit_projects', null)
    expect(hasPermission('usr-maria', 'can_edit_projects')).toBe(false)

    setProfileStatus('usr-ana', 'inactivo')
    expect(getProfiles().find((profile) => profile.id === 'usr-ana')?.status).toBe('inactivo')
    expect(setProfileStatus('usr-ana', 'borrado')).toBeNull()
  })

})

describe('matriz de adopción', () => {
  it('marca Gestor de Proyectos como primera app y sin bloqueos', () => {
    const plan = getAdoptionPlan('gestor_proyectos')
    expect(plan?.role).toContain('primera app')
    expect(plan?.counts.parcial).toBe(0)
    expect(plan?.counts.no_cubierto).toBe(0)
    expect(plan?.counts.cubierto).toBe(plan?.total)
  })

  it('detecta pendientes en Agenda', () => {
    const plan = getAdoptionPlan('agenda')
    expect(plan?.blockers.length).toBeGreaterThan(0)
  })
})
