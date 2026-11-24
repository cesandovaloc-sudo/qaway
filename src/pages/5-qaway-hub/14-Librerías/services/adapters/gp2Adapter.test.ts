import { beforeEach, describe, expect, it } from 'vitest'
import { getNotifications, markRead, resetLibrary } from '../notificationEngine'
import {
  GP2_STORAGE_KEY,
  mapGp2Notification,
  readGp2Notifications,
  syncGp2Notifications,
} from './gp2Adapter'

/* Storage en memoria: este entorno de pruebas no expone localStorage, así que se
   usa la opción `storage` del adaptador (la misma que usa el navegador). */
function createStorage() {
  const data = new Map<string, string>()
  return {
    getItem: (key: string) => (data.has(key) ? (data.get(key) as string) : null),
    setItem: (key: string, value: string) => {
      data.set(key, value)
    },
    removeItem: (key: string) => {
      data.delete(key)
    },
  }
}

const criticalAlert = {
  id: 'seed-3',
  title: 'Revisión de línea base',
  description: 'Revisa desviaciones del cronograma maestro.',
  priority: 'CRITICAL',
  category: 'nudo_critico',
  targetModule: 'cronograma',
  read: false,
  createdAt: '2026-11-24T10:00:00.000Z',
}

describe('adaptador GP2 → motor', () => {
  beforeEach(() => {
    resetLibrary()
  })

  it('traduce prioridad, tipo, lectura y metadatos de GP2', () => {
    const mapped = mapGp2Notification(criticalAlert, { recipientId: 'usr-luis' })

    expect(mapped).toMatchObject({
      id: 'gp2-seed-3',
      app_slug: 'gestor_proyectos',
      recipient_id: 'usr-luis',
      tenant_id: 'tenant-qaway',
      type: 'system',
      priority: 'HIGH',
      title: 'Revisión de línea base',
      message: 'Revisa desviaciones del cronograma maestro.',
      created_at: '2026-11-24T10:00:00.000Z',
      is_read: false,
      source: 'GP2',
      channels: ['internal'],
    })
    expect(mapped?.origin).toEqual({
      adapter: 'gp2',
      ref: 'seed-3',
      targetModule: 'cronograma',
      targetEntityId: null,
    })
  })

  it('mapea tareas, menciones e informativas y resuelve el enlace en el consumidor', () => {
    expect(mapGp2Notification({ ...criticalAlert, category: 'hito_vencido', priority: 'PREVENTIVE' })?.type).toBe(
      'task'
    )
    expect(mapGp2Notification({ ...criticalAlert, category: 'mencion' })?.type).toBe('custom')
    expect(mapGp2Notification({ ...criticalAlert, priority: 'INFO' })?.priority).toBe('LOW')
    expect(
      mapGp2Notification(criticalAlert, { resolveLink: (item) => `/gestor/${item.targetModule}` })?.link
    ).toBe('/gestor/cronograma')
  })

  it('usa el perfil activo cuando GP2 no entrega destinatario', () => {
    expect(mapGp2Notification(criticalAlert)?.recipient_id).toBe('usr-ana')
  })

  it('sincroniza sin duplicar y conserva el estado de lectura del motor', () => {
    const storage = createStorage()
    storage.setItem(
      GP2_STORAGE_KEY,
      JSON.stringify([criticalAlert, { ...criticalAlert, id: 'seed-1', priority: 'PREVENTIVE' }])
    )

    const first = syncGp2Notifications({ recipientId: 'usr-ana', storage })
    expect(first.added).toBe(2)
    expect(first.skipped).toBe(0)
    expect(getNotifications().filter((n) => n.id.startsWith('gp2-'))).toHaveLength(2)

    markRead('gp2-seed-3')
    const second = syncGp2Notifications({ recipientId: 'usr-ana', storage })
    expect(second.added).toBe(0)
    expect(second.skipped).toBe(2)
    expect(getNotifications().find((n) => n.id === 'gp2-seed-3')?.is_read).toBe(true)
  })

  it('no rompe con storage vacío, JSON corrupto ni formatos inesperados', () => {
    expect(readGp2Notifications(createStorage())).toEqual([])

    const corrupt = createStorage()
    corrupt.setItem(GP2_STORAGE_KEY, '{no-es-json')
    expect(readGp2Notifications(corrupt)).toEqual([])

    const shapeless = createStorage()
    shapeless.setItem(GP2_STORAGE_KEY, JSON.stringify([{ title: 'sin id' }]))
    expect(syncGp2Notifications({ storage: shapeless }).added).toBe(0)
  })
})
