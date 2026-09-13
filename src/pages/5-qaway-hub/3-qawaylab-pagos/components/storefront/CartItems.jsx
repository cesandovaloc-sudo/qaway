import {
  itemKey,
  itemTitle,
  itemPrice,
  itemQty,
  itemImage,
  itemCategory,
  isSingleInstance,
  money,
} from './utils.js'

/**
 * Lista de ítems del carrito (estilo "Mi pedido").
 *
 * props:
 *  - items              ítems de carrito (sku|slug|id|product_id, title|name,
 *                       price|unit_price, quantity, image_url|image, category)
 *  - onUpdateQuantity   (itemKey, qty) => void  — qty <= 0 debería eliminar el ítem
 *  - onRemove           (itemKey) => void
 *  - fallbackImage      imagen opcional cuando el ítem no trae foto
 *
 * Las líneas se identifican con `itemKey` (sku → slug → id) para que el mismo
 * producto resuelva a la misma clave venga del catálogo estático o de Supabase.
 * Servicios y cursos son de compra única: se muestran fijos en 1 sin controles
 * de cantidad, conservando el botón "Retirar".
 */
export default function CartItems({
  items = [],
  onUpdateQuantity,
  onRemove,
  fallbackImage,
}) {
  return (
    <div className="cart-items">
      {items.map((item) => {
        const key = itemKey(item) || itemTitle(item)
        const image = itemImage(item) || fallbackImage || null
        const singleInstance = isSingleInstance(item)
        return (
          <article className="cart-item" key={key}>
            <div
              className="product-media"
              style={{ width: '80px', height: '80px', borderRadius: '4px' }}
            >
              {image ? <img src={image} alt="" /> : null}
            </div>
            <div>
              {itemCategory(item) ? (
                <span className="product-brand">{itemCategory(item)}</span>
              ) : null}
              <h3
                style={{
                  margin: '4px 0',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                }}
              >
                {itemTitle(item)}
              </h3>
              <p className="muted" style={{ fontSize: '0.78rem' }}>
                {money(itemPrice(item))} c/u
              </p>
            </div>
            <div className="cart-item-actions">
              {singleInstance ? (
                <div className="quantity-control">
                  <span style={{ padding: '0 10px', whiteSpace: 'nowrap' }}>
                    1 (Servicio único)
                  </span>
                </div>
              ) : (
                <div className="quantity-control">
                  <button
                    onClick={() => onUpdateQuantity?.(key, itemQty(item) - 1)}
                    aria-label="Restar uno"
                  >
                    −
                  </button>
                  <span>{itemQty(item)}</span>
                  <button
                    onClick={() => onUpdateQuantity?.(key, itemQty(item) + 1)}
                    aria-label="Sumar uno"
                  >
                    +
                  </button>
                </div>
              )}
              <strong style={{ fontSize: '1rem' }}>
                {money(itemPrice(item) * itemQty(item))}
              </strong>
              {onRemove ? (
                <button
                  className="remove-link"
                  onClick={() => onRemove(key)}
                >
                  Retirar
                </button>
              ) : null}
            </div>
          </article>
        )
      })}
    </div>
  )
}
