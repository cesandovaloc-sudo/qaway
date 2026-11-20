/* Matriz de adopción: qué necesita cada app del Hub y si el centro ya lo cubre.
   Es el checklist que se revisa antes de conectar una app (empezando por
   Gestor de Proyectos). `cubierto` = el motor ya lo resuelve hoy. */

export const FRAMEWORK_FEATURES = [
  { id: 'inbox', label: 'Bandeja unificada por usuario y tenant', api: 'listNotifications()' },
  { id: 'unread-badge', label: 'Contador de no leídas por app', api: 'getUnreadCount()' },
  { id: 'mark-read', label: 'Marcar leída / todas leídas', api: 'markRead(), markAllRead()' },
  { id: 'filters', label: 'Filtros por app, tipo, prioridad y canal', api: 'listNotifications(filters)' },
  { id: 'priorities', label: 'Prioridades (CRITICAL/PREVENTIVE/INFO → HIGH/MEDIUM/LOW)', api: 'priority' },
  { id: 'internal-channel', label: 'Canal interno en la app', api: "channels: ['internal']" },
  { id: 'email-channel', label: 'Canal correo con auditoría de envío', api: "channels: ['email']" },
  { id: 'whatsapp-channel', label: 'Canal WhatsApp con estado (sent/delivered/read/failed)', api: "channels: ['whatsapp']" },
  { id: 'whatsapp-response', label: 'Seguimiento de respuesta de tarea por WhatsApp', api: 'taskResponseStatus' },
  { id: 'quiet-hours', label: 'Horario de silencio por usuario', api: 'preferences.notifications.quiet_hours' },
  { id: 'only-urgent', label: 'Modo solo urgentes', api: 'preferences.notifications.only_urgent' },
  { id: 'tenant-gate', label: 'Bloqueo por tenant (canales y envío)', api: 'settings.tenant' },
  { id: 'events', label: 'Evento para refrescar la campanita de cada app', api: 'qaway-notification-hub:changed' },
  { id: 'transport-plugin', label: 'Transportes conectables por app (proveedor real)', api: 'registerTransport()' },
  { id: 'profiles', label: 'Perfiles unificados (rol, tenant, apps)', api: 'getProfiles()' },
  { id: 'roles-permissions', label: 'Cargos dinámicos y 19 permisos con ajuste por usuario', api: 'resolvePermissions(), hasPermission(), setPermissionOverride()' },
  { id: 'user-status', label: 'Estado del usuario (activo / inactivo / invitado)', api: 'setProfileStatus()' },
  { id: 'profile-prefs', label: 'Preferencias por usuario (tema, idioma, canales)', api: 'updateProfile()' },
  { id: 'audit', label: 'Auditoría de entrega (quién, cuándo, estado)', api: 'delivery[]' },
  { id: 'task-origin', label: 'Origen de tarea (oficial / emergente)', api: 'taskOrigin' },
  { id: 'image-optimization', label: 'Optimización de imágenes (avatar / producto / evidencia)', api: 'optimizarImagen(), optimizarAvatar(), optimizarProducto(), optimizarEvidencia()' },
]

const NEED = (id, status = 'cubierto', note = '') => {
  const feature = FRAMEWORK_FEATURES.find((item) => item.id === id)
  return { id, label: feature?.label || id, status, note }
}

export const APP_ADOPTION = [
  {
    slug: 'gestor_proyectos',
    name: 'Gestor de Proyectos (legacy)',
    role: 'primera app a migrar',
    ready: true,
    notes: 'Ya tiene campanita propia y lógica de tareas; se conecta al motor sin tocar su diseño.',
    needs: [
      NEED('inbox'),
      NEED('unread-badge'),
      NEED('mark-read'),
      NEED('priorities'),
      NEED('email-channel'),
      NEED('whatsapp-channel'),
      NEED('whatsapp-response'),
      NEED('task-origin'),
      NEED('events', 'cubierto', 'GP2 ya usa un evento propio; se mapea al evento del centro.'),
      NEED('profiles', 'cubierto', 'El centro ya unifica perfil, cargo, estado y apps.'),
      NEED('roles-permissions', 'cubierto', 'Los 19 permisos y los 5 cargos de la app verde ya viven en el núcleo.'),
      NEED('user-status'),
    ],
  },
  {
    slug: 'gestor_proyectos_2',
    name: 'Gestor de Proyectos 2',
    role: 'donante de lógica',
    ready: true,
    notes: 'Aporta prioridades, expiración local y respuesta de tareas por WhatsApp.',
    needs: [
      NEED('inbox'),
      NEED('unread-badge'),
      NEED('priorities'),
      NEED('whatsapp-channel'),
      NEED('whatsapp-response'),
      NEED('events'),
      NEED('task-origin'),
      NEED('audit'),
      NEED('image-optimization', 'cubierto', 'Mi Perfil usa optimizarAvatar y sube el WebP al bucket avatars.'),
    ],
  },
  {
    slug: 'academy',
    name: 'Academy',
    role: 'donante de lógica',
    ready: true,
    notes: 'Aporta tipos académicos, is_read en base de datos y preferencias de correo/push.',
    needs: [
      NEED('inbox'),
      NEED('unread-badge'),
      NEED('mark-read'),
      NEED('email-channel'),
      NEED('profile-prefs'),
      NEED('events', 'parcial', 'Hoy depende de Supabase Realtime; el centro emite evento local.'),
    ],
  },
  {
    slug: 'crm',
    name: 'CRM',
    role: 'donante de lógica',
    ready: true,
    notes: 'Aporta los 5 flags de aviso por evento y el envío por correo/WhatsApp.',
    needs: [
      NEED('email-channel'),
      NEED('whatsapp-channel'),
      NEED('quiet-hours'),
      NEED('only-urgent'),
      NEED('profiles'),
    ],
  },
  {
    slug: 'inventario',
    name: 'Inventario',
    role: 'donante de lógica',
    ready: true,
    notes: 'Aporta alertas de stock y avisos de suscripción.',
    needs: [
      NEED('inbox'),
      NEED('priorities'),
      NEED('tenant-gate'),
      NEED('profiles'),
    ],
  },
  {
    slug: 'agenda',
    name: 'Agenda',
    role: 'donante de lógica',
    ready: false,
    notes: 'Recordatorios de citas; falta revisar su código de avisos antes de conectar.',
    needs: [
      NEED('inbox'),
      NEED('whatsapp-channel'),
      NEED('quiet-hours'),
      NEED('profiles', 'parcial', 'El perfil del cliente final hoy no está unificado.'),
    ],
  },
  {
    slug: 'hub',
    name: 'Hub',
    role: 'proveedor de identidad',
    ready: true,
    notes: 'Aporta perfiles, roles, tenant y preferencias de tema/idioma.',
    needs: [
      NEED('profiles'),
      NEED('profile-prefs'),
      NEED('tenant-gate'),
    ],
  },
]

export const STATUS_LABELS = {
  cubierto: 'Cubierto',
  parcial: 'Parcial',
  no_cubierto: 'No cubierto',
}

export function getAdoptionPlan(slug) {
  const app = APP_ADOPTION.find((item) => item.slug === slug)
  if (!app) return null
  const counts = app.needs.reduce(
    (acc, need) => {
      acc[need.status] = (acc[need.status] || 0) + 1
      return acc
    },
    { cubierto: 0, parcial: 0, no_cubierto: 0 }
  )
  return {
    ...app,
    counts,
    total: app.needs.length,
    ready: counts.no_cubierto === 0,
    blockers: app.needs.filter((need) => need.status !== 'cubierto'),
  }
}

export function getAdoptionSummary() {
  return APP_ADOPTION.map((app) => getAdoptionPlan(app.slug))
}
