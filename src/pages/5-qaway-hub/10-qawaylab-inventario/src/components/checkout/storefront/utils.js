// Helpers compartidos de los componentes storefront.
// Normalizan productos/ítems al "shape canónico" del módulo, de modo que
// funcionen igual productos del demo (title/price/image_url) que del
// inventario (name/base_price/images) o ítems de carrito (product_id/unit_price).

export function itemId(item) {
  return item?.id || item?.product_id || item?.uid || null
}

export function itemTitle(item) {
  return item?.title || item?.product_title || item?.name || 'Producto'
}

export function itemPrice(item) {
  const p = item?.price ?? item?.unit_price ?? item?.base_price
  return typeof p === 'number' ? p : 0
}

export function itemQty(item) {
  const q = item?.quantity
  return typeof q === 'number' && q > 0 ? q : 1
}

export function itemImage(item) {
  return (
    item?.image_url ||
    item?.image ||
    item?.images?.[0]?.processed_url ||
    item?.images?.[0]?.original_url ||
    null
  )
}

export function itemCategory(item) {
  return item?.category || ''
}

export function itemDescription(item) {
  return item?.description || item?.short_description || item?.metadata?.description || ''
}

/**
 * Clave canónica de una línea de carrito.
 *
 * Un mismo producto puede llegar con identidades distintas según su origen: el
 * catálogo estático usa slugs como "one-web" mientras la tabla `products` de
 * Supabase usa UUID. Comparar por `id` los trata como productos diferentes y
 * duplica la fila. La clave canónica prioriza el identificador de negocio
 * (sku → slug) y deja el `id` como último recurso, de modo que la misma
 * entidad resuelva siempre al mismo valor.
 */
export function itemKey(item) {
  return String(item?.sku || item?.slug || item?.id || item?.product_id || '')
}

/**
 * Servicios y cursos son intangibles de compra única: no admiten cantidad
 * mayor a 1 ni filas duplicadas dentro del carrito.
 */
export function isSingleInstance(item) {
  const type = item?.type || item?.product_type
  return type === 'service' || type === 'course'
}

/**
 * Normaliza un carrito ya persistido antes de usarlo.
 *
 * Carritos guardados con la identidad antigua pueden contener el mismo producto
 * dos veces (una línea por slug y otra por UUID de Supabase). Se colapsan por
 * clave canónica y se fuerza cantidad 1 en servicios y cursos, de modo que la
 * deduplicación también aplique a sesiones ya iniciadas.
 */
export function normalizeCart(items) {
  if (!Array.isArray(items)) return []

  const byKey = new Map()
  for (const item of items) {
    if (!item || typeof item !== 'object') continue

    const key = itemKey(item) || itemTitle(item)
    const quantity = isSingleInstance(item) ? 1 : itemQty(item)
    const current = byKey.get(key)

    if (current) {
      if (!isSingleInstance(current)) {
        byKey.set(key, { ...current, quantity: current.quantity + quantity })
      }
      continue
    }

    byKey.set(key, { ...item, quantity })
  }

  return [...byKey.values()]
}

export function money(value, currency = 'S/') {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return `${currency} ${n.toFixed(2)}`
}

/** Tamaño de archivo legible, para mostrar el comprobante de pago cargado. */
export function formatBytes(bytes) {
  const n = Number(bytes)
  if (!Number.isFinite(n) || n <= 0) return '0 KB'
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}
