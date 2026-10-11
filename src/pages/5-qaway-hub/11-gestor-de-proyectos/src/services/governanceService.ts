// ─────────────────────────────────────────────────────────────────────────
// governanceService.ts — Store Local-First de Gobernanza (GOVERNANCE-01)
//
// Usuarios + Cargos dinámicos de la organización activa. 100% cliente,
// persistencia reactiva en localStorage bajo `qaway_governance_v1` con
// patrón observable compatible con `useSyncExternalStore`.
// Cero Supabase, cero bloqueos remotos (AGENTS.md §2).
// ─────────────────────────────────────────────────────────────────────────
import type {
  OrganizationRoleDefinition,
  ProjectModulePermissions,
} from '@/types/project.types'
import {
  ADMIN_PROJECT_PERMISSIONS,
  EMPTY_PROJECT_PERMISSIONS,
} from '@/types/project.types'

export interface OrgUser {
  id: string
  name: string
  email: string
  roleId: string
  status: 'activo' | 'inactivo'
  createdAt: string
}

interface GovernanceDataset {
  users: OrgUser[]
  roles: OrganizationRoleDefinition[]
}

type Listener = () => void

const STORAGE_KEY = 'qaway_governance_v1'

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function nowISO(): string {
  return new Date().toISOString()
}

function seedRoles(): OrganizationRoleDefinition[] {
  const stamp = nowISO()
  const coordAll: ProjectModulePermissions = {
    ...EMPTY_PROJECT_PERMISSIONS,
    can_edit_projects: true,
    can_assign_users: true,
    can_assign_regions: true,
    can_reassign_territories: true,
    can_audit_territorial_map: true,
    can_approve_milestones: true,
    can_edit_gantt_dependencies: true,
    can_configure_wip_limits: true,
    can_create_field_tasks: true,
    can_upload_evidences_pecosa: true,
    can_validate_checklists: true,
    can_escalate_blockers: true,
  }
  const auditor: ProjectModulePermissions = {
    ...EMPTY_PROJECT_PERMISSIONS,
    can_audit_territorial_map: true,
    can_validate_checklists: true,
    can_upload_evidences_pecosa: true,
  }
  const gestor: ProjectModulePermissions = {
    ...EMPTY_PROJECT_PERMISSIONS,
    can_create_field_tasks: true,
    can_upload_evidences_pecosa: true,
    can_validate_checklists: true,
    can_escalate_blockers: true,
  }
  return [
    {
      id: 'role-super-admin',
      name: 'Super Administrador',
      description: 'Control supremo del SaaS. Fijo del sistema.',
      organizationId: '*',
      isSystem: true,
      permissions: clone(ADMIN_PROJECT_PERMISSIONS),
      createdAt: stamp,
    },
    {
      id: 'role-admin',
      name: 'Administrador de Organización',
      description: 'Máxima autoridad de la entidad. Gobierna cargos y aprueba proyectos.',
      organizationId: '*',
      isSystem: true,
      permissions: clone(ADMIN_PROJECT_PERMISSIONS),
      createdAt: stamp,
    },
    {
      id: 'role-coordinador-general',
      name: 'Coordinador General',
      description: 'Torre de control operativo nacional.',
      organizationId: '*',
      isSystem: false,
      permissions: coordAll,
      createdAt: stamp,
    },
    {
      id: 'role-auditor-pecosa',
      name: 'Auditor PECOSA',
      description: 'Audita evidencias y mapa territorial.',
      organizationId: '*',
      isSystem: false,
      permissions: auditor,
      createdAt: stamp,
    },
    {
      id: 'role-gestor-territorial',
      name: 'Gestor Territorial',
      description: 'Ejecución en campo por UGEL asignada.',
      organizationId: '*',
      isSystem: false,
      permissions: gestor,
      createdAt: stamp,
    },
  ]
}

function seedUsers(): OrgUser[] {
  const stamp = nowISO()
  return [
    { id: 'user-001', name: 'Director / Administrador', email: 'admin@organizacion.pe', roleId: 'role-admin', status: 'activo', createdAt: stamp },
    { id: 'user-002', name: 'Coordinador General', email: 'coordinador@organizacion.pe', roleId: 'role-coordinador-general', status: 'activo', createdAt: stamp },
    { id: 'user-003', name: 'Auditor PECOSA', email: 'auditor@organizacion.pe', roleId: 'role-auditor-pecosa', status: 'activo', createdAt: stamp },
  ]
}

function readStorage(): GovernanceDataset | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<GovernanceDataset>
    if (!Array.isArray(parsed.users) || !Array.isArray(parsed.roles)) return null
    return parsed as GovernanceDataset
  } catch {
    return null
  }
}

function writeStorage(dataset: GovernanceDataset): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(dataset))
  } catch {
    // Solo memoria si el storage no está disponible.
  }
}

function loadInitialState(): GovernanceDataset {
  const persisted = readStorage()
  if (persisted) {
    // Auto-fusión: garantizar roles de sistema sin borrar cargos creados.
    const roles = [...persisted.roles]
    let changed = false
    for (const seed of seedRoles().filter((r) => r.isSystem)) {
      if (!roles.some((r) => r.id === seed.id)) {
        roles.unshift(clone(seed))
        changed = true
      }
    }
    if (changed) {
      const merged = { users: persisted.users, roles }
      writeStorage(merged)
      return merged
    }
    return persisted
  }
  const seeded: GovernanceDataset = { users: seedUsers(), roles: seedRoles() }
  writeStorage(seeded)
  return seeded
}

let state: GovernanceDataset = loadInitialState()
const listeners = new Set<Listener>()

function setState(next: GovernanceDataset): void {
  state = next
  writeStorage(next)
  listeners.forEach((listener) => listener())
}

function nextId(prefix: string, existing: string[]): string {
  let max = 0
  for (const id of existing) {
    const m = id.match(/(\d+)$/)
    if (m) max = Math.max(max, Number(m[1]))
  }
  return `${prefix}-${String(max + 1).padStart(3, '0')}`
}

export const governanceService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  getSnapshot(): GovernanceDataset {
    return state
  },

  getServerSnapshot(): GovernanceDataset {
    return state
  },

  listUsers(): OrgUser[] {
    return state.users
  },

  listRoles(): OrganizationRoleDefinition[] {
    return state.roles
  },

  getRole(roleId: string): OrganizationRoleDefinition | undefined {
    return state.roles.find((r) => r.id === roleId)
  },

  createUser(input: { name: string; email: string; roleId: string }): OrgUser {
    const user: OrgUser = {
      id: nextId('user', state.users.map((u) => u.id)),
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      roleId: input.roleId,
      status: 'activo',
      createdAt: nowISO(),
    }
    setState({ ...state, users: [user, ...state.users] })
    return user
  },

  toggleUserStatus(userId: string): void {
    setState({
      ...state,
      users: state.users.map((u) =>
        u.id === userId ? { ...u, status: u.status === 'activo' ? 'inactivo' : 'activo' } : u,
      ),
    })
  },

  createRole(input: { name: string; description: string; organizationId: string; permissions: ProjectModulePermissions }): OrganizationRoleDefinition {
    const role: OrganizationRoleDefinition = {
      id: `role-${Date.now().toString(36)}`,
      name: input.name.trim(),
      description: input.description.trim(),
      organizationId: input.organizationId,
      isSystem: false,
      permissions: clone(input.permissions),
      createdAt: nowISO(),
    }
    setState({ ...state, roles: [role, ...state.roles] })
    return role
  },

  deleteRole(roleId: string): void {
    const target = state.roles.find((r) => r.id === roleId)
    if (!target || target.isSystem) return
    setState({ ...state, roles: state.roles.filter((r) => r.id !== roleId) })
  },

  resetDemo(): void {
    setState({ users: seedUsers(), roles: seedRoles() })
  },
}

export default governanceService
