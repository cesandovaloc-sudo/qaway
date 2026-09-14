import { Link } from 'react-router-dom'
import CartItems from './CartItems.jsx'
import OrderSummary from './OrderSummary.jsx'
import TiendaHeader from './TiendaHeader.jsx'
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
 *  - loading                             true mientras se resuelve una precarga
 *                                        (?add=), para no mostrar "vacío" mientras
 *                                        el producto todavía viaja hacia el carrito
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
  loading = false,
  steps = null,
}) {
  const totalCount =
    typeof count === 'number'
      ? count
      : items.reduce((sum, item) => sum + itemQty(item), 0)
  const totalSubtotal =
    typeof subtotal === 'number'
      ? subtotal
      : items.reduce((sum, item) => sum + itemPrice(item) * itemQty(item), 0)

  const cabecera = (
    <TiendaHeader eyebrow={eyebrow} title={title} copy={copy} steps={steps} />
  )

  return (
    <section className="section">
      {items.length === 0 ? (
        <>
          {cabecera}
          {loading ? (
            // Hay una precarga (?add=) en curso: mostrar carga en vez del estado
            // vacío, que aparecía un instante al entrar desde la landing.
            <div className="empty-state" style={{ marginTop: '24px' }}>
              <h3>Agregando tu producto…</h3>
              <p className="muted">Estamos preparando el detalle de tu selección.</p>
            </div>
          ) : (
            <div className="empty-state" style={{ marginTop: '24px' }}>
              <h3>Tu pedido está vacío</h3>
              <p className="muted">Agrega productos desde el catálogo para continuar.</p>
              <br />
              <Link className="button button-primary" to={emptyHref}>
                Ver catálogo
              </Link>
            </div>
          )}
        </>
      ) : (
        // La cabecera abre la columna izquierda: así el resumen —y su total—
        // arranca a esa misma altura y se ve de entrada, sin bajar. El resumen
        // es `sticky`, de modo que se mantiene fijo mientras se recorre la lista.
        <div className="cart-layout cart-layout--cabecera">
          <div>
            {cabecera}
            <CartItems
              items={items}
              onUpdateQuantity={onUpdateQuantity}
              onRemove={onRemove}
              fallbackImage={fallbackImage}
            />
          </div>
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
