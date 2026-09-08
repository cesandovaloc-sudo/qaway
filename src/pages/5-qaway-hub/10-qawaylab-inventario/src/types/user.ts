// ── User Roles ──
export type UserRole = 'admin' | 'editor' | 'viewer' | 'guest'

// ── Granular Permissions ──
export interface UserPermissions {
  // Inventario
  can_view_products: boolean
  can_create_products: boolean
  can_edit_products: boolean
  can_delete_products: boolean
  can_view_inventory: boolean
  can_adjust_stock: boolean
  can_view_movements: boolean
  
  // Captura IA
  can_capture_products: boolean
  
  // Precios
  can_view_prices: boolean
  can_edit_prices: boolean
  can_create_price_lists: boolean
  can_apply_pricing_rules: boolean
  
  // Paquetes
  can_view_packages: boolean
  can_create_packages: boolean
  can_edit_packages: boolean
  
  // Liquidación
  can_view_campaigns: boolean
  can_create_campaigns: boolean
  can_edit_campaigns: boolean
  can_manage_catalogs: boolean
  
  // Clientes
  can_view_customers: boolean
  can_create_customers: boolean

  // Ventas
  can_view_sales: boolean
  can_create_sales: boolean
  can_register_payments: boolean

  // Configuración
  can_access_settings: boolean
  can_access_fiscal_settings: boolean
  can_manage_users: boolean
  can_manage_locations: boolean
  
  // Enlace compartido (guest)
  can_set_purchase_price: boolean
  can_upload_photos: boolean
  can_add_notes: boolean
  can_view_only_assigned: boolean
}

// ── Default Permission Presets ──
export const rolePermissions: Record<UserRole, UserPermissions> = {
  admin: {
    can_view_products: true,
    can_create_products: true,
    can_edit_products: true,
    can_delete_products: true,
    can_view_inventory: true,
    can_adjust_stock: true,
    can_view_movements: true,
    can_capture_products: true,
    can_view_prices: true,
    can_edit_prices: true,
    can_create_price_lists: true,
    can_apply_pricing_rules: true,
    can_view_packages: true,
    can_create_packages: true,
    can_edit_packages: true,
    can_view_campaigns: true,
    can_create_campaigns: true,
    can_edit_campaigns: true,
    can_manage_catalogs: true,
    can_view_customers: true,
    can_create_customers: true,
    can_view_sales: true,
    can_create_sales: true,
    can_register_payments: true,
    can_access_settings: true,
    can_access_fiscal_settings: true,
    can_manage_users: true,
    can_manage_locations: true,
    can_set_purchase_price: true,
    can_upload_photos: true,
    can_add_notes: true,
    can_view_only_assigned: false,
  },
  editor: {
    can_view_products: true,
    can_create_products: true,
    can_edit_products: true,
    can_delete_products: false,
    can_view_inventory: true,
    can_adjust_stock: true,
    can_view_movements: true,
    can_capture_products: true,
    can_view_prices: true,
    can_edit_prices: true,
    can_create_price_lists: true,
    can_apply_pricing_rules: false,
    can_view_packages: true,
    can_create_packages: true,
    can_edit_packages: true,
    can_view_campaigns: true,
    can_create_campaigns: false,
    can_edit_campaigns: true,
    can_manage_catalogs: true,
    can_view_customers: true,
    can_create_customers: true,
    can_view_sales: true,
    can_create_sales: true,
    can_register_payments: true,
    can_access_settings: false,
    can_access_fiscal_settings: false,
    can_manage_users: false,
    can_manage_locations: true,
    can_set_purchase_price: true,
    can_upload_photos: true,
    can_add_notes: true,
    can_view_only_assigned: false,
  },
  viewer: {
    can_view_products: true,
    can_create_products: false,
    can_edit_products: false,
    can_delete_products: false,
    can_view_inventory: true,
    can_adjust_stock: false,
    can_view_movements: true,
    can_capture_products: false,
    can_view_prices: true,
    can_edit_prices: false,
    can_create_price_lists: false,
    can_apply_pricing_rules: false,
    can_view_packages: true,
    can_create_packages: false,
    can_edit_packages: false,
    can_view_campaigns: true,
    can_create_campaigns: false,
    can_edit_campaigns: false,
    can_manage_catalogs: false,
    can_view_customers: true,
    can_create_customers: false,
    can_view_sales: true,
    can_create_sales: false,
    can_register_payments: false,
    can_access_settings: false,
    can_access_fiscal_settings: false,
    can_manage_users: false,
    can_manage_locations: false,
    can_set_purchase_price: false,
    can_upload_photos: false,
    can_add_notes: false,
    can_view_only_assigned: false,
  },
  guest: {
    can_view_products: true,
    can_create_products: false,
    can_edit_products: false,
    can_delete_products: false,
    can_view_inventory: false,
    can_adjust_stock: false,
    can_view_movements: false,
    can_capture_products: false,
    can_view_prices: true,
    can_edit_prices: false,
    can_create_price_lists: false,
    can_apply_pricing_rules: false,
    can_view_packages: true,
    can_create_packages: false,
    can_edit_packages: false,
    can_view_campaigns: true,
    can_create_campaigns: false,
    can_edit_campaigns: false,
    can_manage_catalogs: false,
    can_view_customers: false,
    can_create_customers: false,
    can_view_sales: false,
    can_create_sales: false,
    can_register_payments: false,
    can_access_settings: false,
    can_access_fiscal_settings: false,
    can_manage_users: false,
    can_manage_locations: false,
    can_set_purchase_price: false,  // Default, admin can enable per guest
    can_upload_photos: false,
    can_add_notes: true,
    can_view_only_assigned: true,
  },
}

// ── User Entity ──
export interface User {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  role: UserRole
  permissions: Partial<UserPermissions>  // Override defaults
  created_at: string
  last_active_at: string | null
}

// ── Shared Access Link (for guests) ──
export interface SharedAccessLink {
  id: string
  token: string
  created_by: string
  guest_name: string | null
  guest_email: string | null
  permissions: Partial<UserPermissions>
  expires_at: string | null
  max_uses: number | null
  use_count: number
  is_active: boolean
  products: string[] | null  // Product IDs the guest can access (null = all)
  created_at: string
  last_used_at: string | null
}

// ── Helper: Merge permissions ──
export function resolvePermissions(
  role: UserRole,
  overrides: Partial<UserPermissions>
): UserPermissions {
  const base = { ...rolePermissions[role] }
  return { ...base, ...overrides }
}

// ── Helper: Check permission ──
export function hasPermission(
  permissions: UserPermissions,
  key: keyof UserPermissions
): boolean {
  return permissions[key] === true
}
