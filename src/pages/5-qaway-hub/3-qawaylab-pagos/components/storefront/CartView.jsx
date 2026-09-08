import { Link } from 'react-router-dom'
import CartItems from './CartItems.jsx'
import OrderSummary from './OrderSummary.jsx'
import { itemQty, itemPrice } from './utils.js'

/**
 * Página "Mi pedido" del storefront: estado vacío, lista de ítems y resumen.
 *
 * props:
 *  - items, onUpdateQuantity, onRemove   igual que CartItems
 *  - count, subtotal, deliveryLabel, deliveryValue, note, fallbackImage
 *  - eyebrow / title / copy              encabezado de la página
 *  - emptyHref                           ruta del catálogo desde el estado vacío (default '/')
 *  - checkoutHref                        ruta del checkout del CTA (default '/checkout')
 *  - action                              CTA custom (reemplaza el Link por defecto)
 */
export default function CartView({
  items = [],
  onUpdateQuantity,
  onRemove,
  count,
  subtotal,
  deliveryLabel,
  deliveryValue,
  note,
  fallbackImage,
  eyebrow = 'Compra',
  title = 'Mi pedido.',
  copy = 'Revisa productos y cantidades antes de completar los datos de entrega.',
  emptyHref = '/',
  checkoutHref = '/checkout',
  action,
}) {
  const totalCount =
    typeof count === 'number'
      ? count
      : items.reduce((sum, item) => sum + itemQty(item), 0)
  const totalSubtotal =
    typeof subtotal === 'number'
      ? subtotal
      : items.reduce((sum, item) => sum + itemPrice(item) * itemQty(item), 0)

  return (
    <section className="section">
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="section-title">{title}</h1>
      <p className="section-copy">{copy}</p>

      {items.length === 0 ? (
        <div className="empty-state" style={{ marginTop: '24px' }}>
          <h3>Tu pedido está vacío</h3>
          <p className="muted">Agrega productos desde el catálogo para continuar.</p>
          <br />
          <Link className="button button-primary" to={emptyHref}>
            Ver catálogo
          </Link>
        </div>
      ) : (
        <div className="cart-layout">
          <CartItems
            items={items}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemove}
            fallbackImage={fallbackImage}
          />
          <OrderSummary
            items={items}
            count={totalCount}
            subtotal={totalSubtotal}
            deliveryLabel={deliveryLabel}
            deliveryValue={deliveryValue}
            note={note}
            action={
              action ?? (
                <Link
                  className="button button-red"
                  style={{ width: '100%' }}
                  to={checkoutHref}
                >
                  Continuar con el pedido
                </Link>
              )
            }
          />
        </div>
      )}
    </section>
  )
}
