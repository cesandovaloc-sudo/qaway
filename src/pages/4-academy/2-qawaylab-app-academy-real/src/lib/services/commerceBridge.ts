import type { Course } from '@/lib/types'

export interface CartItem {
  product_id: string
  title: string
  unit_price: number
  quantity: number
  product_type: 'course' | 'digital' | 'service' | 'physical'
  image_url?: string | null
  metadata?: Record<string, unknown>
}

const STORAGE_KEY = 'qaway-cart-v1'

// Mapeo estático verificado de productos comerciales en Supabase Central para latencia 0ms
const COURSE_PRODUCT_MAP: Record<string, { productId: string; price: number }> = {
  'c0000000-0002-0000-0000-000000000002': { productId: '496b97bf-80f7-401e-a8d3-c005ceaa29c6', price: 49.99 },
  'c0000000-0003-0000-0000-000000000003': { productId: 'd1b1816b-4f93-4854-9926-7d347c8d5825', price: 79.99 },
  'c0000000-0004-0000-0000-000000000004': { productId: '4f981050-72b8-446a-b9aa-ca27c8fedcfb', price: 39.99 },
  'c0000000-0005-0000-0000-000000000005': { productId: 'dca01674-b990-485d-a836-2f0e37013e70', price: 59.99 },
  'c0000000-0007-0000-0000-000000000007': { productId: '7e10896f-e8af-4b3e-b1fc-d456b59b2bec', price: 44.99 },
  'c0000000-0008-0000-0000-000000000008': { productId: 'ecba3dd8-47bb-4e50-8cea-a4cb8872ae8b', price: 69.99 },
}

/**
 * Resuelve el ID del producto comercial correspondiente al curso en Supabase Central.
 */
export async function resolveCommercialProduct(course: Course): Promise<{ productId: string; price: number }> {
  // 1. Resolución ultra rápida por catálogo conocido
  if (COURSE_PRODUCT_MAP[course.id]) {
    return COURSE_PRODUCT_MAP[course.id]
  }

  // 2. Consulta dinámica a la BD Comercial de Supabase
  try {
    const mainUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qrusdsqgygfolxfrafyd.supabase.co'
    const mainKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_k6LYbA5uAOOMBYsP-4NNLA_dKvYh8Yi'
    const resp = await fetch(
      `${mainUrl}/rest/v1/products?course_id=eq.${course.id}&select=id,price&limit=1`,
      {
        headers: { apikey: mainKey, Authorization: `Bearer ${mainKey}` },
      }
    )
    if (resp.ok) {
      const rows = await resp.json()
      if (rows && rows.length > 0 && rows[0].id) {
        return {
          productId: rows[0].id,
          price: Number(rows[0].price ?? course.price ?? 0),
        }
      }
    }
  } catch (err) {
    console.warn('[commerceBridge] Error resolviendo producto comercial dinámicamente:', err)
  }

  // Fallback seguro
  return {
    productId: course.id,
    price: Number(course.price || 0),
  }
}

/**
 * Agrega el curso al carrito central unificado con shape canónico commerce v1
 * y regla de instancia única (quantity: 1).
 */
export async function addCourseToCart(course: Course, studentId?: string | null): Promise<CartItem> {
  const { productId, price } = await resolveCommercialProduct(course)

  const cartItem: CartItem = {
    product_id: productId,
    title: course.title,
    unit_price: price,
    quantity: 1,
    product_type: 'course',
    image_url: course.image_url || null,
    metadata: {
      course_id: course.id,
      course_slug: course.slug,
      student_id: studentId || null,
    },
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    const existing: CartItem[] = raw ? JSON.parse(raw) : []
    const index = existing.findIndex(
      (i) => i.product_id === cartItem.product_id || (i.metadata && i.metadata.course_id === course.id)
    )

    let updated: CartItem[]
    if (index >= 0) {
      updated = existing.map((item, idx) => (idx === index ? { ...item, quantity: 1 } : item))
    } else {
      updated = [...existing, cartItem]
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    window.dispatchEvent(new Event('storage'))
  } catch (e) {
    console.warn('[commerceBridge] Error al persistir ítem en carrito:', e)
  }

  return cartItem
}
