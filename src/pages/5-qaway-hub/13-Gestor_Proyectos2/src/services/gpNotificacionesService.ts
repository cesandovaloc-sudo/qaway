/**
 * gpNotificacionesService.ts — avisos de vencimiento y asignación en GP2.
 * ======================================================================
 * GP2 ya tiene campanita propia (`NotificationPopover` + `qaway-gp-notifications-v1`)
 * y el adaptador del Hub la proyecta al motor compartido. Este servicio es el
 * lado que FALTA en GP2: decide cuándo nace un aviso operativo y lo deposita en
 * su propio almacén, sin tocar diseño ni crear una segunda campanita.
 *
 * Dos reglas, ambas idempotentes por id determinista:
 *
 *   · Vencimiento: un registro del cronograma o una tarea operativa avisa
 *     cuando faltan `diasAvisoPrevio` días hábiles (parámetro ya existente del
 *     cronograma) y vuelve a avisar cuando ya venció. Un aviso por responsable
 *     real del directorio del tenant; si el responsable no tiene cuenta, el
 *     aviso queda igual para la empresa (sin inventar `recipientUserId`).
 *   · Asignación: al asignar una tarea desde el panel de asignación, el
 *     asignado recibe su aviso con `recipientUserId` real cuando su nombre
 *     coincide con un usuario del directorio de la empresa.
 *
 * La identidad nunca se inventa: `resolverDestinatario` solo devuelve un
 * usuario del directorio que la app entrega (hoy `usePerfilVisible().contactos`).
 * El contrato compartido de estas dos reglas vive en el framework
 * (`14-Librerías/services/notificationRules.js`, doc 11); GP2 las aplica con su
 * propia persistencia hasta el Escalón 2 del adaptador.
 */

import { pushAppNotification } from '../components/NotificationPopover'
import { NOTIFICATIONS_STORAGE_KEY, type AppNotification, type NotificationPriority } from '../types'
import {
  getParametrosCronograma,
  workingDaysBetween,
  type ParametrosCronograma,
} from './gpCronogramaConfigService'

export interface DestinatarioGp {
  userId: string
  nombre: string
  email: string
}

export interface TareaAsignadaGp {
  id: string | number
  title: string
  owner?: string
  due?: string
  priority?: string
  milestone?: string
  assignedBy?: string
}

export interface CronogramaItemGp {
  id: string
  code?: string
  name?: string
  end?: string
  status?: string
  progress?: number
  gestor?: string
  gestores?: string[]
}

export interface TareaGp {
  id: string | number
  title?: string
  due?: string
  status?: string
  owner?: string
}

export interface FuenteVencimiento {
  ref: string
  nombre: string
  codigo?: string
  vence: string
  responsable: string
  modulo: 'cronograma' | 'tareas2'
}

export type EstadoVencimiento = 'vencido' | 'por_vencer'

const normalizar = (valor: unknown): string =>
  String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

const soloIso = (valor: unknown): string | null =>
  typeof valor === 'string' && /^\d{4}-\d{2}-\d{2}/.test(valor) ? valor.slice(0, 10) : null

const estaCompletado = (status: unknown, progress?: number): boolean => {
  if (typeof progress === 'number' && progress >= 100) return true
  const s = normalizar(status)
  return s === 'completado' || s === 'completada' || s === 'cumple' || s === 'cumplido'
}

/** Resuelve una persona del directorio real del tenant por nombre. Sin coincidencia ⇒ null. */
export function resolverDestinatario(
  nombre: string | undefined,
  directorio: DestinatarioGp[] = []
): DestinatarioGp | null {
  const buscado = normalizar(nombre)
  if (!buscado || buscado === 'sin asignar') return null
  return directorio.find((persona) => normalizar(persona.nombre) === buscado) || null
}

function leerNotificacionesGp2(): AppNotification[] {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Inserta solo si el id no existe: repetir un barrido no duplica la campanita. */
function publicarSiNuevo(notification: AppNotification): boolean {
  if (leerNotificacionesGp2().some((n) => n.id === notification.id)) return false
  pushAppNotification(notification)
  return true
}

function prioridadAsignacion(prioridad: unknown): NotificationPriority {
  const s = normalizar(prioridad)
  if (s === 'alta' || s === 'urgente') return 'CRITICAL'
  if (s === 'baja') return 'INFO'
  return 'PREVENTIVE'
}

/* ---------------- asignación ---------------- */

export interface OpcionesAsignacion {
  directorio?: DestinatarioGp[]
  tenantId?: string
  notificar?: boolean
}

export function emitirNotificacionAsignacion(
  tarea: TareaAsignadaGp,
  options: OpcionesAsignacion = {}
): AppNotification | null {
  if (!tarea || tarea.id == null || !String(tarea.title || '').trim()) return null
  if (options.notificar === false) return null

  const destinatario = resolverDestinatario(tarea.owner, options.directorio)
  const fecha = soloIso(tarea.due)
  const notification: AppNotification = {
    id: `asignacion-${tarea.id}-${destinatario?.userId || 'responsable'}`,
    title: `Tarea asignada: ${String(tarea.title).trim()}`,
    description: [
      `Asignada a ${tarea.owner || 'responsable sin identificar'}`,
      fecha ? `vence el ${fecha}` : '',
      tarea.milestone ? `origen: ${tarea.milestone}` : '',
    ]
      .filter(Boolean)
      .join(' · '),
    priority: prioridadAsignacion(tarea.priority),
    category: 'asignacion',
    ...(destinatario ? { recipientUserId: destinatario.userId } : {}),
    ...(tarea.assignedBy ? { senderName: tarea.assignedBy } : {}),
    ...(options.tenantId ? { tenantId: options.tenantId } : {}),
    targetModule: 'tareas2',
    targetEntityId: String(tarea.id),
    read: false,
    createdAt: new Date().toISOString(),
  }

  return publicarSiNuevo(notification) ? notification : null
}

/* ---------------- vencimientos ---------------- */

/** Convierte cronograma + tareas operativas en fuentes con responsable. */
export function recolectarVencimientos(
  items: CronogramaItemGp[] = [],
  tareas: TareaGp[] = []
): FuenteVencimiento[] {
  const fuentes: FuenteVencimiento[] = []
  const vistos = new Set<string>()

  const agregar = (fuente: FuenteVencimiento) => {
    const clave = `${fuente.ref}|${fuente.vence}|${normalizar(fuente.responsable)}`
    if (vistos.has(clave)) return
    vistos.add(clave)
    fuentes.push(fuente)
  }

  for (const item of items) {
    if (!item?.id) continue
    const vence = soloIso(item.end)
    if (!vence || estaCompletado(item.status, item.progress)) continue
    const responsables = (item.gestores && item.gestores.length ? item.gestores : [item.gestor])
      .filter((nombre): nombre is string => typeof nombre === 'string' && nombre.trim() !== '')
    const lista = responsables.length ? responsables : ['']
    for (const responsable of lista) {
      agregar({
        ref: String(item.id),
        nombre: item.name || item.code || String(item.id),
        ...(item.code ? { codigo: item.code } : {}),
        vence,
        responsable,
        modulo: 'cronograma',
      })
    }
  }

  for (const tarea of tareas) {
    if (tarea?.id == null) continue
    const vence = soloIso(tarea.due)
    if (!vence || estaCompletado(tarea.status)) continue
    agregar({
      ref: String(tarea.id),
      nombre: String(tarea.title || 'Tarea operativa'),
      vence,
      responsable: String(tarea.owner || ''),
      modulo: 'tareas2',
    })
  }

  return fuentes
}

/** Estado frente al corte: usa la semana laboral y el aviso previo del cronograma. */
export function estadoVencimiento(
  fuente: FuenteVencimiento,
  hoy: string,
  params: ParametrosCronograma = getParametrosCronograma()
): EstadoVencimiento | null {
  if (!fuente.vence) return null
  if (hoy > fuente.vence) return 'vencido'
  const restantes = workingDaysBetween(
    hoy,
    fuente.vence,
    params.semanaLaboral,
    params.diasLaboralesCustom
  )
  if (restantes >= 0 && restantes <= params.diasAvisoPrevio) return 'por_vencer'
  return null
}

export interface OpcionesVencimientos {
  items?: CronogramaItemGp[]
  tareas?: TareaGp[]
  hoy?: string
  directorio?: DestinatarioGp[]
  tenantId?: string
  params?: ParametrosCronograma
}

export function emitirNotificacionesVencimiento(
  options: OpcionesVencimientos = {}
): AppNotification[] {
  const params = options.params || getParametrosCronograma()
  const hoy = options.hoy || new Date().toISOString().slice(0, 10)
  const emitidas: AppNotification[] = []

  for (const fuente of recolectarVencimientos(options.items, options.tareas)) {
    const estado = estadoVencimiento(fuente, hoy, params)
    if (!estado) continue

    const destinatario = resolverDestinatario(fuente.responsable, options.directorio)
    const vencido = estado === 'vencido'
    const restantes = vencido
      ? null
      : workingDaysBetween(hoy, fuente.vence, params.semanaLaboral, params.diasLaboralesCustom)

    const sufijo = destinatario?.userId || normalizar(fuente.responsable) || 'empresa'
    const notification: AppNotification = {
      id: `vencimiento-${vencido ? 'vencido' : 'por-vencer'}-${fuente.modulo}-${fuente.ref}-${fuente.vence}-${sufijo}`,
      title: vencido
        ? `Vencido: ${fuente.nombre}`
        : restantes === 0
          ? `Vence hoy: ${fuente.nombre}`
          : `Vence en ${restantes} día${restantes === 1 ? '' : 's'}: ${fuente.nombre}`,
      description: [
        fuente.codigo || '',
        `fecha límite ${fuente.vence}`,
        fuente.responsable ? `responsable: ${fuente.responsable}` : 'sin responsable asignado',
      ]
        .filter(Boolean)
        .join(' · '),
      priority: vencido ? 'CRITICAL' : 'PREVENTIVE',
      category: 'hito_vencido',
      ...(destinatario ? { recipientUserId: destinatario.userId } : {}),
      ...(options.tenantId ? { tenantId: options.tenantId } : {}),
      targetModule: fuente.modulo,
      targetEntityId: fuente.ref,
      read: false,
      createdAt: new Date().toISOString(),
    }

    if (publicarSiNuevo(notification)) emitidas.push(notification)
  }

  return emitidas
}
