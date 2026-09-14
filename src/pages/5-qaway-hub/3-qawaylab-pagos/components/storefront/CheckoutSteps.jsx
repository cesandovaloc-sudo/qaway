/**
 * Indicador de pasos de la compra.
 *
 * Informativo y aditivo: no reemplaza ningún bloque existente. Su función es que
 * el comprador siempre sepa en qué punto del camino está, que era justamente lo
 * que faltaba en el flujo de pago.
 */
const STEPS = ['Carrito', 'Datos y pago', 'Confirmación']

export default function CheckoutSteps({ active = 2 }) {
  return (
    <ol className="checkout-steps" aria-label="Pasos de la compra">
      {STEPS.map((label, index) => {
        const step = index + 1
        const state = step < active ? 'is-done' : step === active ? 'is-active' : 'is-pending'
        return (
          <li
            key={label}
            className={`checkout-step ${state}`}
            aria-current={step === active ? 'step' : undefined}
          >
            <span className="checkout-step-num" aria-hidden="true">
              {step < active ? '✓' : step}
            </span>
            <span className="checkout-step-label">{label}</span>
          </li>
        )
      })}
    </ol>
  )
}
