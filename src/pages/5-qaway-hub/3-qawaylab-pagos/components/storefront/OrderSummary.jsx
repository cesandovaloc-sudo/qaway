import { itemId, itemTitle, itemPrice, itemQty, money } from './utils.js'

/**
 * Resumen lateral del pedido.
 *
 * props:
 *  - items           ítems de carrito para las filas
 *  - count           cantidad total de ítems
 *  - subtotal        subtotal numérico (si no se pasa, se calcula de items)
 *  - deliveryLabel   texto de la fila de entrega (default 'Delivery / Acceso')
 *  - deliveryValue   valor de la fila de entrega (default 'Gratis')
 *  - note            nota bajo el resumen
 *  - action          ReactNode del CTA (ej. <Link to="/checkout">…</Link>)
 */
export default function OrderSummary({
  items = [],
  count,
  subtotal,
  deliveryLabel = 'Delivery / Acceso',
  deliveryValue = 'Gratis',
  note = 'Puedes elegir el beneficio de descuento o soporte al completar tu pedido.',
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
    <aside className="order-summary">
      <h2>Resumen</h2>

      {items.map((item, idx) => (
        <div className="summary-row" key={itemId(item) ?? idx}>
          <span>
            {itemQty(item)} × {itemTitle(item)}
          </span>
          <strong>{money(itemPrice(item) * itemQty(item))}</strong>
        </div>
      ))}

      <div className="summary-row">
        <span>Productos</span>
        <strong>{totalCount}</strong>
      </div>
      <div className="summary-row">
        <span>Subtotal</span>
        <strong>{money(totalSubtotal)}</strong>
      </div>
      <div className="summary-row">
        <span>{deliveryLabel}</span>
        <strong style={{ color: 'var(--green)' }}>{deliveryValue}</strong>
      </div>

      <p className="summary-note">{note}</p>
      {action}
    </aside>
  )
}
