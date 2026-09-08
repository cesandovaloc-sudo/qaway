import {
  itemId,
  itemTitle,
  itemPrice,
  itemQty,
  itemImage,
  itemCategory,
  money,
} from './utils.js'

/**
 * Lista de ítems del carrito (estilo "Mi pedido").
 *
 * props:
 *  - items              ítems de carrito (id|product_id, title|name, price|unit_price,
 *                       quantity, image_url|image, category)
 *  - onUpdateQuantity   (id, qty) => void  — qty <= 0 debería eliminar el ítem
 *  - onRemove           (id) => void
 *  - fallbackImage      imagen opcional cuando el ítem no trae foto
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
        const id = itemId(item)
        const image = itemImage(item) || fallbackImage || null
        return (
          <article className="cart-item" key={id ?? itemTitle(item)}>
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
              <div className="quantity-control">
                <button
                  onClick={() => onUpdateQuantity?.(id, itemQty(item) - 1)}
                  aria-label="Restar uno"
                >
                  −
                </button>
                <span>{itemQty(item)}</span>
                <button
                  onClick={() => onUpdateQuantity?.(id, itemQty(item) + 1)}
                  aria-label="Sumar uno"
                >
                  +
                </button>
              </div>
              <strong style={{ fontSize: '1rem' }}>
                {money(itemPrice(item) * itemQty(item))}
              </strong>
              {onRemove ? (
                <button
                  className="remove-link"
                  onClick={() => onRemove(id)}
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
