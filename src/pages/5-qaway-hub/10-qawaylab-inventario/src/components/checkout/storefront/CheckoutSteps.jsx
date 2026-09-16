import { Link } from 'react-router-dom'

/**
 * Indicador de pasos de la compra.
 *
 * Informativo y navegable: permite al comprador retroceder a pasos ya
 * completados (ej. volver a `/carrito` desde el checkout para editar productos).
 */
const STEPS = [
  { label: 'Carrito', path: '/carrito' },
  { label: 'Datos y pago', path: '/carrito/checkout' },
  { label: 'Confirmación', path: null },
]

export default function CheckoutSteps({ active = 2 }) {
  return (
    <ol className="checkout-steps" aria-label="Pasos de la compra">
      {STEPS.map((item, index) => {
        const step = index + 1
        const state = step < active ? 'is-done' : step === active ? 'is-active' : 'is-pending'
        const content = (
          <>
            <span className="checkout-step-num" aria-hidden="true">
              {step < active ? '✓' : step}
            </span>
            <span className="checkout-step-label">{item.label}</span>
          </>
        )

        return (
          <li
            key={item.label}
            className={`checkout-step ${state}`}
            aria-current={step === active ? 'step' : undefined}
          >
            {step < active && item.path ? (
              <Link
                to={item.path}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
                title={`Volver a ${item.label}`}
              >
                {content}
              </Link>
            ) : (
              content
            )}
          </li>
        )
      })}
    </ol>
  )
}
