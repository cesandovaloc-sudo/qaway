import { supabase } from '@/config/supabase'

export interface CategoryRow {
  id: string
  name: string
  slug: string
  parent_id: string | null
  icon: string | null
  sort_order: number
  created_at: string
}

export interface CategoryWithCount extends CategoryRow {
  products: number
}

export interface CategoryStats {
  total: number
  withProducts: number
  withoutProducts: number
  totalProducts: number
  categories: CategoryWithCount[]
  /** Categorías creadas por mes (últimos 6 meses, orden ascendente). */
  createdByMonth: { month: string; count: number }[]
}

export interface CreateCategoryInput {
  name: string
  parent_id?: string | null
  icon?: string | null
  sort_order?: number
}

function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/** "—" → 0, texto inválido → 0 */
function toInt(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? Math.trunc(n) : 0
}

function lastMonths(count: number): { key: string; label: string }[] {
  const out: { key: string; label: string }[] = []
  const now = new Date()
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    out.push({
      key,
      label: d.toLocaleDateString('es-PE', { month: 'short' }).replace('.', ''),
    })
  }
  return out
}

export const categoryService = {
  /** Catálogo de categorías filtrado estrictamente por tenant. */
  async getCategories(tenantId?: string | null): Promise<CategoryRow[]> {
    let query = supabase
      .from('categories')
      .select('id, name, slug, parent_id, icon, sort_order, created_at')

    if (tenantId) {
      query = query.eq('tenant_id', tenantId)
    }

    const { data, error } = await query
      .order('sort_order', { ascending: true })
      .order('name', { ascending: true })

    if (error) throw error
    return (data ?? []) as CategoryRow[]
  },

  /**
   * Métricas de categorías para las tarjetas superiores.
   * Relación relacional pura: Tenant -> Categories -> Products (FK category_id).
   * Sin fallback textual y sin mezclas de tenants.
   */
  async getCategoryStats(tenantId?: string | null): Promise<CategoryStats> {
    const categories = await this.getCategories(tenantId)

    let countQuery = supabase
      .from('products')
      .select('id, category_id')

    if (tenantId) countQuery = countQuery.eq('tenant_id', tenantId)

    const { data: rows, error } = await countQuery
    if (error) throw error

    const productRows = (rows ?? []) as { id: string; category_id?: string | null }[]

    // Conteo relacional estricto O(1) por categories.id
    const counts = new Map<string, number>()
    for (const c of categories) {
      counts.set(c.id, 0)
    }

    for (const p of productRows) {
      if (p.category_id && counts.has(p.category_id)) {
        counts.set(p.category_id, counts.get(p.category_id)! + 1)
      }
    }

    const enriched: CategoryWithCount[] = categories.map(c => ({
      ...c,
      products: counts.get(c.id) ?? 0,
    }))

    const buckets = lastMonths(6)
    const perMonth = new Map<string, number>(buckets.map(b => [b.key, 0]))
    for (const c of categories) {
      const d = new Date(c.created_at)
      if (Number.isNaN(d.getTime())) continue
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
      if (perMonth.has(key)) perMonth.set(key, (perMonth.get(key) ?? 0) + 1)
    }

    return {
      total: enriched.length,
      withProducts: enriched.filter(c => c.products > 0).length,
      withoutProducts: enriched.filter(c => c.products === 0).length,
      // Total de productos: todos los productos reales del tenant
      totalProducts: productRows.length,
      categories: enriched,
      createdByMonth: buckets.map(b => ({
        month: b.label,
        count: perMonth.get(b.key) ?? 0,
      })),
    }
  },

  /** Variación porcentual del mes actual vs. el mes anterior. */
  getMonthTrend(createdByMonth: { count: number }[]): number | null {
    if (createdByMonth.length < 2) return null
    const current = toInt(createdByMonth[createdByMonth.length - 1]?.count)
    const previous = toInt(createdByMonth[createdByMonth.length - 2]?.count)
    if (previous === 0) return current === 0 ? 0 : null
    return Math.round(((current - previous) / previous) * 100)
  },

  /** Sparkline SVG (0..100 x, 0..18 y) a partir de una serie numérica real. */
  toSparkline(values: number[], height = 18): string {
    if (!values.length) return '0,14 100,14'
    const max = Math.max(...values)
    const min = Math.min(...values)
    const span = max - min
    const stepX = values.length > 1 ? 100 / (values.length - 1) : 100

    return values
      .map((v, i) => {
        const ratio = span === 0 ? 0.5 : (v - min) / span
        const y = (height - ratio * height).toFixed(1)
        return `${(i * stepX).toFixed(1)},${y}`
      })
      .join(' ')
  },

  async createCategory(input: CreateCategoryInput, tenantId?: string | null): Promise<CategoryRow | null> {
    const name = input.name.trim()
    if (!name) throw new Error('El nombre de la categoría es obligatorio')

    const payload: Record<string, unknown> = {
      name,
      slug: slugify(name),
      parent_id: input.parent_id ?? null,
      icon: input.icon ?? null,
      sort_order: input.sort_order ?? 0,
    }
    if (tenantId) {
      payload.tenant_id = tenantId
    }

    const { data, error } = await supabase
      .from('categories')
      .insert(payload)
      .select('id, name, slug, parent_id, icon, sort_order, created_at')
      .single()

    if (error) throw error
    return data as CategoryRow
  },

  async updateCategory(id: string, input: Partial<CreateCategoryInput>): Promise<CategoryRow | null> {
    const patch: Record<string, unknown> = { ...input }
    if (input.name) {
      const name = input.name.trim()
      patch.name = name
      patch.slug = slugify(name)
    }

    const { data, error } = await supabase
      .from('categories')
      .update(patch)
      .eq('id', id)
      .select('id, name, slug, parent_id, icon, sort_order, created_at')
      .single()

    if (error) throw error
    return data as CategoryRow
  },

  async deleteCategory(id: string): Promise<boolean> {
    const { error } = await supabase.from('categories').delete().eq('id', id)
    if (error) throw error
    return true
  },
}