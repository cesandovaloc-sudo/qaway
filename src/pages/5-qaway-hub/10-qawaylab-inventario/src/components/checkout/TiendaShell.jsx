import '@/components/checkout/storefront.css'

/**
 * Marco de las páginas de cliente de la tienda (carrito, checkout, compras).
 *
 * Aporta la piel "papel y tinta" del storefront y el contenedor centrado.
 * `storefront.css` está íntegramente scoped bajo `.qawa-storefront` (no define
 * `:root`, `body` ni `*`), así que este marco puede montarse dentro del host
 * —con el navbar oficial de Qaway Lab— sin tocar su sistema de estilos.
 *
 * El `paddingTop` cubre el navbar fijo del host (`fixed ... h-20` = 80px).
 *
 * El fondo es blanco a propósito, igual que el navbar de la web: la piel del
 * storefront define `--paper` (beige) para su demo, pero dentro de la web las
 * páginas de cliente van sobre blanco.
 */
export default function TiendaShell({ children, offsetTop = '96px' }) {
  return (
    <div
      className="qawa-storefront"
      style={{
        background: '#ffffff',
        minHeight: '60vh',
        paddingTop: offsetTop,
        paddingBottom: '96px',
      }}
    >
      <main className="container">{children}</main>
    </div>
  )
}
