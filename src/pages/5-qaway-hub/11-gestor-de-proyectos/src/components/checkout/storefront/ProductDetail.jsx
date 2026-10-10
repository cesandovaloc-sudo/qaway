import { useState } from 'react'
import { Link } from 'react-router-dom'
import { itemTitle, itemPrice, itemImage, itemCategory, money } from './utils.js'

/**
 * Ficha descriptiva de producto (página intermedia).
 *
 * props:
 *  - product        shape canónico del módulo
 *  - onAddToCart    (product, quantity) => void
 *  - catalogHref    ruta del catálogo para el breadcrumb y el CTA (default '/')
 *  - cartHref       ruta del carrito para el aviso "Revisar pedido" (default '/carrito')
 */
export default function ProductDetail({
  product,
  onAddToCart,
  catalogHref = '/',
  cartHref = '/carrito',
}) {
  const [selectedQty, setSelectedQty] = useState(1)
  const [added, setAdded] = useState(false)
  const name = itemTitle(product)
  const image = itemImage(product)
  const category = itemCategory(product)

  if (!product) return null

  return (
    <section className="section">
      <div className="detail-grid">
        {/* Galería de fotos */}
        <div className="detail-gallery">
          <div className="product-media">
            {image ? <img src={image} alt={name} /> : null}
          </div>
          <div className="product-media">
            {image ? (
              <img src={image} alt={name} style={{ filter: 'brightness(0.9)' }} />
            ) : null}
          </div>
          <div className="product-media">
            {image ? (
              <img src={image} alt={name} style={{ filter: 'brightness(1.1)' }} />
            ) : null}
          </div>
        </div>

        {/* Información de la ficha y controles */}
        <div className="detail-info">
          <div className="breadcrumb">
            <Link to={catalogHref}>Catálogo</Link> / {category}
          </div>
          <span className="eyebrow">{category}</span>
          <h1>{name}</h1>
          {product?.description ? (
            <p className="detail-lead">{product.description}</p>
          ) : null}

          <div className="detail-price">{money(itemPrice(product))}</div>

          <div className="detail-actions">
            <label className="quantity" aria-label="Cantidad">
              <select
                value={selectedQty}
                onChange={(e) => setSelectedQty(Number(e.target.value))}
              >
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </label>

            <button
              className="button button-red"
              onClick={() => {
                if (onAddToCart) onAddToCart(product, selectedQty)
                setAdded(true)
              }}
            >
              Agregar a mi pedido
            </button>
          </div>

          {added && (
            <p
              className="summary-note"
              style={{
                fontSize: '0.85rem',
                background: '#fdf5f2',
                padding: '10px 14px',
                borderLeft: '3px solid var(--red)',
              }}
            >
              Producto agregado.{' '}
              <Link className="text-link" to={cartHref}>
                Revisar pedido
              </Link>
            </p>
          )}

          {/* Especificaciones / facts */}
          {product?.facts?.length ? (
            <dl className="facts">
              {product.facts.map(([label, value]) => (
                <div className="fact" key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  )
}
