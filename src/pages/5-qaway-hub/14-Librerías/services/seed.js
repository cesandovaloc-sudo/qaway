/* Datos iniciales: unifica en un solo modelo lo que hoy vive disperso en
   Academy (is_read en Supabase), GP2 (localStorage + prioridades), CRM (flags
   de aviso), Inventario (alertas de stock) y Hub (perfiles/tenant). */

const MIN = 60000
const ago = (minutes) => new Date(Date.now() - minutes * MIN).toISOString()

export const APPS = [
  { slug: 'academy', name: 'Academy', color: '#2563eb' },
  { slug: 'gestor_proyectos', name: 'Gestor de Proyectos', color: '#14532d' },
  { slug: 'crm', name: 'CRM', color: '#7c3aed' },
  { slug: 'inventario', name: 'Inventario', color: '#ea580c' },
  { slug: 'agenda', name: 'Agenda', color: '#0891b2' },
  { slug: 'hub', name: 'Hub', color: '#334155' },
]

export const NOTIFICATION_TYPES = [
  { value: 'task', label: 'Tarea' },
  { value: 'purchase', label: 'Compra' },
  { value: 'system', label: 'Sistema' },
  { value: 'academic_event', label: 'Evento académico' },
  { value: 'inventory_alert', label: 'Alerta de inventario' },
  { value: 'subscription', label: 'Suscripción' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'email', label: 'Correo' },
  { value: 'custom', label: 'Personalizada' },
]

export const PRIORITIES = [
  { value: 'HIGH', label: 'Alta', legacy: 'CRITICAL' },
  { value: 'MEDIUM', label: 'Media', legacy: 'PREVENTIVE' },
  { value: 'LOW', label: 'Baja', legacy: 'INFO' },
]

export const TASK_RESPONSE_STATUSES = [
  { value: 'sin_notificar', label: 'Sin notificar' },
  { value: 'esperando_respuesta', label: 'Esperando respuesta' },
  { value: 'respondido', label: 'Respondido' },
]

export const CHANNELS = [
  { value: 'internal', label: 'En la app' },
  { value: 'email', label: 'Correo' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'push', label: 'Push' },
]

/* Permisos recuperados del Gestor de Proyectos verde (ProjectModulePermissions):
   19 capacidades agrupadas por módulo. Un cargo concede; el perfil puede
   forzar sí/no encima (mismo modelo que resolvePermissions de la app verde). */
export const PROJECT_PERMISSIONS = [
  { key: 'can_create_projects', label: 'Crear proyectos', group: 'Cartera' },
  { key: 'can_edit_projects', label: 'Editar proyectos', group: 'Cartera' },
  { key: 'can_archive_projects', label: 'Archivar proyectos', group: 'Cartera' },
  { key: 'can_configure_budget', label: 'Configurar presupuesto', group: 'Cartera' },
  { key: 'can_change_methodology', label: 'Cambiar metodología', group: 'Cartera' },
  { key: 'can_manage_roles', label: 'Administrar cargos', group: 'Gobernanza' },
  { key: 'can_assign_users', label: 'Asignar usuarios', group: 'Gobernanza' },
  { key: 'can_delegate_permissions', label: 'Delegar permisos', group: 'Gobernanza' },
  { key: 'can_assign_regions', label: 'Asignar regiones', group: 'Territorio' },
  { key: 'can_reassign_territories', label: 'Reasignar territorios', group: 'Territorio' },
  { key: 'can_audit_territorial_map', label: 'Auditar mapa territorial', group: 'Territorio' },
  { key: 'can_approve_milestones', label: 'Aprobar hitos', group: 'Planificación' },
  { key: 'can_edit_gantt_dependencies', label: 'Editar dependencias Gantt', group: 'Planificación' },
  { key: 'can_configure_wip_limits', label: 'Configurar límites WIP', group: 'Planificación' },
  { key: 'can_create_field_tasks', label: 'Crear tareas de campo', group: 'Campo' },
  { key: 'can_upload_evidences_pecosa', label: 'Subir evidencias PECOSA', group: 'Campo' },
  { key: 'can_validate_checklists', label: 'Validar checklists', group: 'Campo' },
  { key: 'can_escalate_blockers', label: 'Escalar bloqueos', group: 'Campo' },
]

const grant = (...keys) =>
  keys.reduce((acc, key) => {
    acc[key] = true
    return acc
  }, {})

export const ORG_ROLES = [
  {
    id: 'role-admin',
    name: 'Administrador de Organización',
    description: 'Máxima autoridad de la entidad: gobierna cargos y aprueba proyectos.',
    system: true,
    permissions: grant(...PROJECT_PERMISSIONS.map((permission) => permission.key)),
  },
  {
    id: 'role-coordinador-general',
    name: 'Coordinador General',
    description: 'Torre de control operativo: cobertura, hitos y bloqueos.',
    system: false,
    permissions: grant(
      'can_edit_projects',
      'can_assign_users',
      'can_assign_regions',
      'can_reassign_territories',
      'can_audit_territorial_map',
      'can_approve_milestones',
      'can_edit_gantt_dependencies',
      'can_configure_wip_limits',
      'can_create_field_tasks',
      'can_upload_evidences_pecosa',
      'can_validate_checklists',
      'can_escalate_blockers'
    ),
  },
  {
    id: 'role-auditor-pecosa',
    name: 'Auditor PECOSA',
    description: 'Audita evidencias y el mapa territorial, sin editar la cartera.',
    system: false,
    permissions: grant('can_audit_territorial_map', 'can_validate_checklists', 'can_upload_evidences_pecosa'),
  },
  {
    id: 'role-gestor-territorial',
    name: 'Gestor Territorial',
    description: 'Ejecución en campo por UGEL o sede asignada.',
    system: false,
    permissions: grant(
      'can_create_field_tasks',
      'can_upload_evidences_pecosa',
      'can_validate_checklists',
      'can_escalate_blockers'
    ),
  },
  {
    id: 'role-cliente',
    name: 'Cliente / Externo',
    description: 'Acceso de solo lectura al avance de su proyecto.',
    system: true,
    permissions: {},
  },
]

export function defaultProfiles() {
  return [
    {
      id: 'usr-ana',
      display_name: 'Ana Quispe',
      full_name: 'Ana Lucía Quispe Rojas',
      email: 'ana.quispe@qawaylab.com',
      role: 'admin',
      cargo_id: 'role-admin',
      status: 'activo',
      avatar_url: null,
      permissions: {},
      tenant_id: 'tenant-qaway',
      tenant_name: 'Qaway Lab',
      apps: [
        { slug: 'gestor_proyectos', role: 'admin' },
        { slug: 'academy', role: 'editor' },
        { slug: 'hub', role: 'admin' },
      ],
      created_at: '2026-02-11T10:00:00.000Z',
      preferences: {
        theme: 'dark',
        language: 'es',
        notifications: {
          enabled: true,
          only_urgent: false,
          sound: true,
          channels: { internal: true, email: true, push: true, whatsapp: true },
          quiet_hours: { enabled: true, start: '22:00', end: '07:00' },
        },
        session: { remember_me: true, auto_logout_minutes: 120 },
      },
    },
    {
      id: 'usr-luis',
      display_name: 'Luis Paredes',
      full_name: 'Luis Alberto Paredes Soto',
      email: 'luis.paredes@qawaylab.com',
      role: 'editor',
      cargo_id: 'role-gestor-territorial',
      status: 'activo',
      avatar_url: null,
      // Ajuste individual sobre el cargo: puede aprobar hitos pese a ser gestor.
      permissions: { can_approve_milestones: true },
      tenant_id: 'tenant-qaway',
      tenant_name: 'Qaway Lab',
      apps: [
        { slug: 'gestor_proyectos', role: 'editor' },
        { slug: 'inventario', role: 'operativo' },
      ],
      created_at: '2026-03-04T15:30:00.000Z',
      preferences: {
        theme: 'system',
        language: 'es',
        notifications: {
          enabled: true,
          only_urgent: true,
          sound: false,
          channels: { internal: true, email: true, push: false, whatsapp: true },
          quiet_hours: { enabled: false, start: '22:00', end: '07:00' },
        },
        session: { remember_me: true, auto_logout_minutes: 45 },
      },
    },
    {
      id: 'usr-maria',
      display_name: 'María Fernández',
      full_name: 'María Fernanda Fernández Cruz',
      email: 'maria.fernandez@cliente.pe',
      role: 'customer',
      cargo_id: 'role-cliente',
      status: 'activo',
      avatar_url: null,
      permissions: {},
      tenant_id: 'tenant-cora',
      tenant_name: 'Corporación Ramírez',
      apps: [
        { slug: 'academy', role: 'viewer' },
        { slug: 'agenda', role: 'viewer' },
      ],
      created_at: '2026-05-19T09:10:00.000Z',
      preferences: {
        theme: 'light',
        language: 'es',
        notifications: {
          enabled: true,
          only_urgent: false,
          sound: true,
          channels: { internal: true, email: true, push: true, whatsapp: false },
          quiet_hours: { enabled: false, start: '22:00', end: '07:00' },
        },
        session: { remember_me: false, auto_logout_minutes: 30 },
      },
    },
    {
      id: 'usr-carlos',
      display_name: 'Carlos Mendoza',
      full_name: 'Carlos Mendoza Vega',
      email: 'carlos@qawaylab.com',
      role: 'operativo',
      cargo_id: 'role-coordinador-general',
      status: 'inactivo',
      avatar_url: null,
      permissions: { can_edit_projects: false },
      tenant_id: 'tenant-qaway',
      tenant_name: 'Qaway Lab',
      apps: [
        { slug: 'inventario', role: 'operativo' },
        { slug: 'crm', role: 'editor' },
      ],
      created_at: '2026-06-22T11:45:00.000Z',
      preferences: {
        theme: 'system',
        language: 'es',
        notifications: {
          enabled: true,
          only_urgent: false,
          sound: true,
          channels: { internal: true, email: false, push: true, whatsapp: true },
          quiet_hours: { enabled: true, start: '20:00', end: '08:00' },
        },
        session: { remember_me: true, auto_logout_minutes: 60 },
      },
    },
  ]
}

export function defaultNotifications() {
  return [
    {
      id: 'ntf-001',
      app_slug: 'gestor_proyectos',
      recipient_id: 'usr-ana',
      tenant_id: 'tenant-qaway',
      type: 'task',
      priority: 'HIGH',
      title: 'Tarea vencida: Validar expediente EDT 3.2',
      message: 'La tarea oficial venció ayer y no registra avance. Se notificó al responsable por WhatsApp.',
      created_at: ago(35),
      is_read: false,
      link: '/hub/proyectos/bandeja',
      source: 'GP2',
      channels: ['internal', 'whatsapp'],
      whatsappData: { status: 'delivered', sentAt: ago(34), sentBy: 'usr-ana' },
      taskResponseStatus: 'esperando_respuesta',
      taskOrigin: 'oficial_oficio',
    },
    {
      id: 'ntf-002',
      app_slug: 'academy',
      recipient_id: 'usr-maria',
      tenant_id: 'tenant-cora',
      type: 'academic_event',
      priority: 'MEDIUM',
      title: 'Nueva clase disponible',
      message: 'Se publicó el módulo 4 de Excel aplicado a proyectos. Tu acceso vence en 21 días.',
      created_at: ago(120),
      is_read: false,
      link: '/academy',
      source: 'Academy',
      channels: ['internal', 'email'],
      emailData: { sentAt: ago(119), sentBy: 'sistema' },
    },
    {
      id: 'ntf-003',
      app_slug: 'inventario',
      recipient_id: 'usr-carlos',
      tenant_id: 'tenant-qaway',
      type: 'inventory_alert',
      priority: 'HIGH',
      title: 'Stock crítico: cemento tipo I',
      message: 'Quedan 8 bolsas (mínimo configurable: 25). Reposición sugerida al proveedor habitual.',
      created_at: ago(240),
      is_read: false,
      source: 'Inventario',
      channels: ['internal', 'whatsapp'],
      whatsappData: { status: 'sent', sentAt: ago(238), sentBy: 'sistema' },
    },
    {
      id: 'ntf-004',
      app_slug: 'crm',
      recipient_id: 'usr-carlos',
      tenant_id: 'tenant-qaway',
      type: 'purchase',
      priority: 'MEDIUM',
      title: 'Nuevo lead desde la landing',
      message: 'Formulario de cotización recibido: 3 ambientes, distrito Santiago de Surco.',
      created_at: ago(400),
      is_read: true,
      link: '/hub/crm',
      source: 'CRM',
      channels: ['internal', 'email'],
      emailData: { sentAt: ago(399), sentBy: 'sistema' },
    },
    {
      id: 'ntf-005',
      app_slug: 'gestor_proyectos',
      recipient_id: 'usr-ana',
      tenant_id: 'tenant-qaway',
      type: 'system',
      priority: 'LOW',
      title: 'Cronograma recalculado',
      message: 'El Gantt ajustó 4 hitos tras el cambio de fecha de inicio del EDT 2.',
      created_at: ago(600),
      is_read: true,
      link: '/hub/proyectos/proyectos',
      source: 'GP2',
      channels: ['internal'],
    },
    {
      id: 'ntf-006',
      app_slug: 'agenda',
      recipient_id: 'usr-maria',
      tenant_id: 'tenant-cora',
      type: 'custom',
      priority: 'HIGH',
      title: 'Recordatorio: reunión de obra',
      message: 'Hoy 15:00 con el residente. Confirmaste asistencia por WhatsApp.',
      created_at: ago(50),
      is_read: false,
      source: 'Agenda',
      channels: ['internal', 'whatsapp'],
      whatsappData: { status: 'read', sentAt: ago(48), sentBy: 'sistema' },
    },
    {
      id: 'ntf-007',
      app_slug: 'hub',
      recipient_id: 'usr-luis',
      tenant_id: 'tenant-qaway',
      type: 'subscription',
      priority: 'MEDIUM',
      title: 'Tu plan vence en 5 días',
      message: 'Plan Empresa · renueva antes del 25/11 para no perder el acceso a Inventario.',
      created_at: ago(1500),
      is_read: false,
      link: '/hub/suscripciones',
      source: 'Hub',
      channels: ['internal', 'email'],
      emailData: { sentAt: ago(1499), sentBy: 'sistema' },
    },
    {
      id: 'ntf-008',
      app_slug: 'gestor_proyectos',
      recipient_id: 'usr-luis',
      tenant_id: 'tenant-qaway',
      type: 'task',
      priority: 'MEDIUM',
      title: 'Acción emergente asignada',
      message: 'Inspección de seguridad en obra, plazo 48 horas.',
      created_at: ago(180),
      is_read: false,
      source: 'GP2',
      channels: ['internal', 'email', 'whatsapp'],
      taskResponseStatus: 'sin_notificar',
      taskOrigin: 'accion_emergente',
    },
  ]
}

export function defaultSettings() {
  return {
    tenant: {
      tenant_id: 'tenant-qaway',
      enabled: true,
      deliveryMechanism: 'both',
      channels: { internal: true, email: true, push: true, whatsapp: true },
      defaultExpirationDays: 30,
      quietHoursEnforced: true,
    },
    activeProfileId: 'usr-ana',
  }
}
