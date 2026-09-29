import { supabase } from '@/config/supabase'
import type { User, UserRole, UserPermissions, SharedAccessLink } from '@/types/user'
import { rolePermissions, resolvePermissions } from '@/types/user'// ── User Service ──
export const userService = {
  // Get current user profile
  // Optimización de arranque: `auth.getUser` es imprescindible primero, pero
  // la fila `users` y el RPC `user_app_role` se lanzan EN PARALELO en cuanto
  // hay user id (antes: users → RPC → perfiles encadenados ≈ +450ms por
  // salto con ~450ms de RTT a Supabase).
  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    // Ambas llamadas parten a la vez; ninguna depende de la otra.
    const usersQuery = supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()
    const appRoleQuery = supabase.rpc('user_app_role', { p_app_slug: 'inventario' })

    const [{ data, error }, appRoleResult] = await Promise.all([usersQuery, appRoleQuery])
    const appRole = appRoleResult.data

    if (error || !data) {
      // Fallback a public.profiles o metadata de auth para superadministrador
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      // El objeto cumple el contrato `User` (types/user.ts): la columna de
      // nombre es `full_name` — es la que leen el topbar y los guards de
      // permisos — y no existen `status`/`updated_at` en ese contrato.
      return {
        id: user.id,
        email: user.email || '',
        full_name: profileData?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'Super Administrador',
        avatar_url: profileData?.avatar_url || null,
        role: 'admin' as UserRole,
        permissions: rolePermissions['admin'],
        created_at: profileData?.created_at || new Date().toISOString(),
        last_active_at: profileData?.last_active_at || null,
      }
    }

    // Rol autoritativo de ESTA app: user_app_roles (SaaS). Si no hay fila
    // (acceso legacy/plataforma), se conserva users.role (comportamiento actual).
    const isPlatformAdmin = data.is_platform_admin === true
    let effectiveRole = data.role as UserRole
    if (appRole && !isPlatformAdmin && ['admin', 'editor', 'viewer', 'guest'].includes(appRole)) {
      effectiveRole = appRole as UserRole
    }

    return {
      ...data,
      role: effectiveRole,
      permissions: resolvePermissions(effectiveRole, (data.permissions as Partial<UserPermissions>) || {}),
    }
  },

  // Get all users (admin only)
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Update user role (admin only)
  async updateUserRole(userId: string, role: UserRole): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ role, permissions: rolePermissions[role] })
      .eq('id', userId)

    if (error) throw error
  },

  // Update user permissions (admin only)
  async updateUserPermissions(
    userId: string,
    permissions: Partial<UserPermissions>
  ): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({ permissions })
      .eq('id', userId)

    if (error) throw error
  },

  // Get user's effective permissions
  getEffectivePermissions(user: User): UserPermissions {
    return resolvePermissions(user.role, user.permissions || {})
  },

  // Check if user has a specific permission
  hasPermission(user: User, permission: keyof UserPermissions): boolean {
    const perms = this.getEffectivePermissions(user)
    return perms[permission] === true
  },
}

// ── Shared Access Links (Guest Access) ──
export const sharedAccessService = {
  // Create a shared link
  async createLink(params: {
    guestName?: string
    guestEmail?: string
    permissions: Partial<UserPermissions>
    expiresInHours?: number
    maxUses?: number
    productIds?: string[]
  }): Promise<SharedAccessLink> {
    const token = generateToken()
    
    const { data: { user } } = await supabase.auth.getUser()

    const linkData = {
      token,
      created_by: user?.id,
      guest_name: params.guestName || null,
      guest_email: params.guestEmail || null,
      permissions: params.permissions,
      expires_at: params.expiresInHours
        ? new Date(Date.now() + params.expiresInHours * 60 * 60 * 1000).toISOString()
        : null,
      max_uses: params.maxUses || null,
      use_count: 0,
      is_active: true,
      products: params.productIds || null,
    }

    const { data, error } = await supabase
      .from('shared_access_links')
      .insert(linkData)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // Get all active links
  async getActiveLinks(): Promise<SharedAccessLink[]> {
    const { data, error } = await supabase
      .from('shared_access_links')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // Validate and consume a link token
  async validateToken(token: string): Promise<{
    valid: boolean
    link?: SharedAccessLink
    error?: string
  }> {
    const { data: link, error } = await supabase
      .from('shared_access_links')
      .select('*')
      .eq('token', token)
      .eq('is_active', true)
      .single()

    if (error || !link) {
      return { valid: false, error: 'Link not found or inactive' }
    }

    // Check expiration
    if (link.expires_at && new Date(link.expires_at) < new Date()) {
      return { valid: false, error: 'Link has expired' }
    }

    // Check max uses
    if (link.max_uses && link.use_count >= link.max_uses) {
      return { valid: false, error: 'Link has reached maximum uses' }
    }

    // Increment use count
    await supabase
      .from('shared_access_links')
      .update({ 
        use_count: link.use_count + 1,
        last_used_at: new Date().toISOString()
      })
      .eq('id', link.id)

    return { valid: true, link }
  },

  // Deactivate a link
  async deactivateLink(linkId: string): Promise<void> {
    const { error } = await supabase
      .from('shared_access_links')
      .update({ is_active: false })
      .eq('id', linkId)

    if (error) throw error
  },

  // Delete a link
  async deleteLink(linkId: string): Promise<void> {
    const { error } = await supabase
      .from('shared_access_links')
      .delete()
      .eq('id', linkId)

    if (error) throw error
  },
}

// ── Helper ──
function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let token = ''
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return token
}
