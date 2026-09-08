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

export function money(value, currency = 'S/') {
  const n = typeof value === 'number' && Number.isFinite(value) ? value : 0
  return `${currency} ${n.toFixed(2)}`
}
