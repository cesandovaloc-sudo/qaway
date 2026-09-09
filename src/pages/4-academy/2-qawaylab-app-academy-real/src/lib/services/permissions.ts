import { supabase } from '@/lib/supabase'

export interface RolePermissionRow {
  role: string
  action: string
  allowed: boolean
}

/**
 * Fetch all role permissions.
 * Returns an array of { role, action, allowed } objects.
 */
export async function getRolePermissions(): Promise<RolePermissionRow[]> {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('role, action, allowed')
    .order('role', { ascending: true })
    .order('action', { ascending: true })

  if (error) throw error
  return (data as RolePermissionRow[]) || []
}

/**
 * Fetch permissions for a specific role.
 * Returns an object mapping action → allowed.
 */
export async function getPermissionsForRole(role: string): Promise<Record<string, boolean>> {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('action, allowed')
    .eq('role', role)

  if (error) throw error

  const map: Record<string, boolean> = {}
  for (const row of (data as RolePermissionRow[]) || []) {
    map[row.action] = row.allowed
  }
  return map
}

/**
 * Check if a role has a specific permission.
 */
export async function hasPermission(role: string, action: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('role_permissions')
    .select('allowed')
    .eq('role', role)
    .eq('action', action)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data?.allowed || false
}

/**
 * Update a permission for a role.
 */
export async function updatePermission(role: string, action: string, allowed: boolean): Promise<RolePermissionRow | null> {
  const { data, error } = await supabase
    .from('role_permissions')
    .upsert(
      { role, action, allowed },
      { onConflict: 'role,action' }
    )
    .select()
    .single()

  if (error) throw error
  return (data as RolePermissionRow) || null
}
