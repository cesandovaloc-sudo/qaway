/**
 * Cabecera oficial de las páginas de cliente de la tienda.
 *
 * Orden y diseño establecidos: línea de migas de pan (`steps`) → kicker
 * (`.eyebrow`) → título (`.section-title`) → párrafo (`.section-copy`).
 *
 * Vive en un solo componente a propósito: el carrito y el checkout deben
 * mostrar exactamente la misma cabecera, y con el marcado duplicado en cada
 * página terminaban divergiendo.
 *
 * La distancia entre las migas y el kicker la aporta `.checkout-steps`
 * (margen inferior), no este componente: así el aire es el mismo en ambas
 * páginas y se ajusta en un único sitio.
 */
export default function TiendaHeader({ eyebrow, title, copy, steps = null }) {
  return (
    <>
      {steps}
      <span className="eyebrow">{eyebrow}</span>
      <h1 className="section-title">{title}</h1>
      <p className="section-copy">{copy}</p>
    </>
  )
}
