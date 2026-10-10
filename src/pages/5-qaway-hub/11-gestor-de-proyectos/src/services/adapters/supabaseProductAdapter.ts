import { supabase } from '@/config/supabase'
import { ilikeOr } from '@/lib/postgrestFilters'
import type {
  Product,
  ProductFilters,
  PaginationParams,
  PaginatedResponse,
  DashboardStats,
} from '@/types'

// ── Interface ──
export interface ProductsAdapter {
  getProducts(filters?: ProductFilters, pagination?: PaginationParams): Promise<PaginatedResponse<Product>>
  getProductById(id: string): Promise<Product | null>
  getProductBySku(sku: string): Promise<Product | null>
  createProduct(data: Partial<Product>): Promise<Product | null>
  createProducts(data: Partial<Product>[]): Promise<Product[]>
  updateProduct(id: string, data: Partial<Product>): Promise<Product | null>
  deleteProduct(id: string): Promise<boolean>
  getDashboardStats(): Promise<DashboardStats>
  searchProducts(query: string): Promise<Product[]>
}

// ── Helpers Multi-Tenant ──
function getStoredScopedTenant(): { id: string; name: string } | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem('qaway.scopedTenant')
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed.id === 'string') return parsed
    }
  } catch {}
  return null
}

async function resolveTenantContext(providedTenantId?: string): Promise<{
  tenantId: string | null
  isPlatformAdmin: boolean
  error?: string
}> {
  if (providedTenantId) {
    return { tenantId: providedTenantId, isPlatformAdmin: false }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { tenantId: null, isPlatformAdmin: false, error: 'No hay sesión de usuario activa' }
  }

  const { data: userData } = await supabase
    .from('users')
    .select('tenant_id, is_platform_admin, role')
    .eq('id', user.id)
    .maybeSingle()

  const isPlatformAdmin = Boolean(
    userData?.is_platform_admin === true ||
    (userData?.role === 'admin' && !userData?.tenant_id)
  )

  if (isPlatformAdmin) {
    const scoped = getStoredScopedTenant()
    if (!scoped?.id) {
      return {
        tenantId: null,
        isPlatformAdmin: true,
        error: 'Debes seleccionar una empresa antes de realizar esta operación. Usa el selector de empresa en la barra superior.'
      }
    }
    return { tenantId: scoped.id, isPlatformAdmin: true }
  }

  const userTenantId = userData?.tenant_id || null
  if (!userTenantId) {
    return {
      tenantId: null,
      isPlatformAdmin: false,
      error: 'El usuario no tiene una empresa asignada en el sistema.'
    }
  }

  return { tenantId: userTenantId, isPlatformAdmin: false }
}

// ── Supabase Implementation ──
export const supabaseProductAdapter: ProductsAdapter = {
  async getProducts(filters = {}, pagination = { page: 1, per_page: 20 }) {
    // 1. Resolver contexto multi-tenant para no mezclar productos de distintas marcas
    let targetTenantId = filters.tenant_id
    if (!targetTenantId) {
      try {
        const ctx = await resolveTenantContext()
        if (ctx.isPlatformAdmin) {
          if (!ctx.tenantId) {
            // Super Administrador sin empresa seleccionada: lista vacía para evitar mezcla de marcas
            return { data: [], total: 0, page: pagination.page, per_page: pagination.per_page, total_pages: 0 }
          }
          targetTenantId = ctx.tenantId
        } else if (ctx.tenantId) {
          targetTenantId = ctx.tenantId
        }
      } catch (err) {
        console.warn('[supabaseProductAdapter] Error resolviendo tenant en getProducts:', err)
      }
    }

    let query = supabase
      .from('products')
      .select('*', { count: 'exact' })

    if (targetTenantId) {
      query = query.eq('tenant_id', targetTenantId)
    }

    // Apply filters
    if (filters.search) {
      // C-2: término saneado — nunca interpolar input crudo en el DSL or=
      const orFilter = ilikeOr(['name', 'sku', 'description'], filters.search)
      if (orFilter) query = query.or(orFilter)
    }
    if (filters.category_id) {
      query = query.eq('category_id', filters.category_id)
    }
    if (filters.status) {
      query = query.eq('status', filters.status)
    }
    if (filters.commercial_status) {
      query = query.eq('commercial_status', filters.commercial_status)
    }
    if (filters.location_id) {
      query = query.eq('location_id', filters.location_id)
    }
    if (filters.min_price !== undefined) {
      query = query.gte('base_price', filters.min_price)
    }
    if (filters.max_price !== undefined) {
      query = query.lte('base_price', filters.max_price)
    }
    if (filters.brand) {
      query = query.ilike('brand', `%${filters.brand}%`)
    }

    // Apply pagination
    const from = (pagination.page - 1) * pagination.per_page
    const to = from + pagination.per_page - 1

    // C-2 (sink dormido): allowlist de columnas de orden — sort_by nunca llega crudo a .order()
    const SORTABLE_COLUMNS = new Set(['created_at', 'updated_at', 'name', 'sku', 'base_price', 'stock'])
    const sortColumn = SORTABLE_COLUMNS.has(pagination.sort_by || '') ? pagination.sort_by! : 'created_at'

    query = query
      .range(from, to)
      .order(sortColumn, { ascending: pagination.sort_order === 'asc' })

    const { data, error, count } = await query

    if (error) {
      console.error('Error fetching products:', error)
      return { data: [], total: 0, page: pagination.page, per_page: pagination.per_page, total_pages: 0 }
    }

    return {
      data: data || [],
      total: count || 0,
      page: pagination.page,
      per_page: pagination.per_page,
      total_pages: Math.ceil((count || 0) / pagination.per_page),
    }
  },

  async getProductById(id) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching product:', error)
      return null
    }
    return data
  },

  async getProductBySku(sku) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('sku', sku)
      .single()

    if (error) return null
    return data
  },

  async createProduct(productData) {
    let payload = { ...productData }
    
    // 2. Asignación de tenant_id sin fallback ciego al Master Tenant
    if (!payload.tenant_id) {
      const ctx = await resolveTenantContext()
      if (!ctx.tenantId) {
        throw new Error(ctx.error || 'Debes seleccionar una empresa antes de registrar productos.')
      }
      payload.tenant_id = ctx.tenantId
    }

    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()
      .single()

    if (error) {
      console.error('Error creating product:', error)
      throw new Error(error.message || 'Error al crear producto en base de datos')
    }
    return data
  },

  async createProducts(productsData) {
    const ctx = await resolveTenantContext()
    if (!ctx.tenantId) {
      throw new Error(ctx.error || 'Debes seleccionar una empresa antes de registrar productos.')
    }

    const payload = productsData.map(p => ({
      ...p,
      tenant_id: p.tenant_id || ctx.tenantId
    }))

    const { data, error } = await supabase
      .from('products')
      .insert(payload)
      .select()

    if (error) {
      console.error('Error creating products:', error)
      throw new Error(error.message || 'Error al registrar lote de productos')
    }
    return data || []
  },

  async updateProduct(id, productData) {
    // 3. Verificar que el producto exista y pertenezca al tenant activo antes de modificar
    const { data: existing, error: fetchErr } = await supabase
      .from('products')
      .select('id, tenant_id')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existing) {
      throw new Error('Producto no encontrado para actualizar.')
    }

    const ctx = await resolveTenantContext()
    if (ctx.isPlatformAdmin) {
      if (!ctx.tenantId) {
        throw new Error('Debes seleccionar una empresa para modificar productos.')
      }
      if (existing.tenant_id && existing.tenant_id !== ctx.tenantId) {
        throw new Error('No puedes modificar este producto porque pertenece a otra empresa.')
      }
    } else if (ctx.tenantId && existing.tenant_id && existing.tenant_id !== ctx.tenantId) {
      throw new Error('No tienes permiso para modificar productos de otra empresa.')
    }

    const targetTenant = existing.tenant_id || ctx.tenantId
    let query = supabase
      .from('products')
      .update({ ...productData, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (targetTenant) {
      query = query.eq('tenant_id', targetTenant)
    }

    const { data, error } = await query
      .select()
      .single()

    if (error) {
      console.error('Error updating product:', error)
      throw new Error(error.message || 'Error al actualizar producto en base de datos')
    }
    return data
  },

  async deleteProduct(id) {
    // 4. Verificar que el producto pertenezca al tenant activo antes de eliminar
    const { data: existing, error: fetchErr } = await supabase
      .from('products')
      .select('id, tenant_id')
      .eq('id', id)
      .maybeSingle()

    if (fetchErr || !existing) {
      throw new Error('Producto no encontrado para eliminar.')
    }

    const ctx = await resolveTenantContext()
    if (ctx.isPlatformAdmin) {
      if (!ctx.tenantId) {
        throw new Error('Debes seleccionar una empresa antes de eliminar productos.')
      }
      if (existing.tenant_id && existing.tenant_id !== ctx.tenantId) {
        throw new Error('No puedes eliminar este producto porque pertenece a otra empresa.')
      }
    } else if (ctx.tenantId && existing.tenant_id && existing.tenant_id !== ctx.tenantId) {
      throw new Error('No tienes permiso para eliminar productos de otra empresa.')
    }

    const targetTenant = existing.tenant_id || ctx.tenantId
    let query = supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (targetTenant) {
      query = query.eq('tenant_id', targetTenant)
    }

    const { error } = await query

    if (error) {
      console.error('Error deleting product:', error)
      throw new Error(error.message || 'Error al eliminar producto')
    }
    return true
  },

  async getDashboardStats() {
    let targetTenantId: string | null = null
    try {
      const ctx = await resolveTenantContext()
      if (ctx.tenantId) targetTenantId = ctx.tenantId
    } catch {}

    let totalQ = supabase.from('products').select('*', { count: 'exact', head: true })
    let activeQ = supabase.from('products').select('*', { count: 'exact', head: true }).eq('status', 'active')
    let lowStockQ = supabase.from('products').select('*', { count: 'exact', head: true }).filter('min_stock', 'gt', 0).filter('stock', 'lte', 'min_stock')

    if (targetTenantId) {
      totalQ = totalQ.eq('tenant_id', targetTenantId)
      activeQ = activeQ.eq('tenant_id', targetTenantId)
      lowStockQ = lowStockQ.eq('tenant_id', targetTenantId)
    }

    const [{ count: total_products }, { count: active_products }, { count: low_stock_count }] = await Promise.all([
      totalQ,
      activeQ,
      lowStockQ
    ])

    return {
      total_products: total_products || 0,
      total_stock: 0,
      inventory_value: 0,
      low_stock_count: low_stock_count || 0,
      out_of_stock_count: 0,
      active_products: active_products || 0,
      products_in_offer: 0,
      products_in_liquidation: 0,
    }
  },

  async searchProducts(query) {
    let targetTenantId: string | null = null
    try {
      const ctx = await resolveTenantContext()
      if (ctx.tenantId) targetTenantId = ctx.tenantId
    } catch {}

    const orFilter = ilikeOr(['name', 'sku'], query)
    let request = supabase
      .from('products')
      .select('*')
    if (targetTenantId) request = request.eq('tenant_id', targetTenantId)
    if (orFilter) request = request.or(orFilter)
    const { data, error } = await request.limit(10)

    if (error) return []
    return data || []
  },
}
