import { Link } from 'react-router-dom'
import { itemTitle, itemPrice, itemImage, itemCategory, money } from './utils.js'

/**
 * Tarjeta de producto del storefront.
 *
 * props:
 *  - product      shape canónico del módulo (id, title/name, price/unit_price/base_price,
 *                 image_url/image/images, category, description, slug, facts)
 *  - action       ReactNode opcional que reemplaza el CTA por defecto ("Ver producto")
 *  - detailHref   ruta opcional de la ficha (default `/producto/${slug}` si hay slug)
 */
export default function ProductCard({ product, action, detailHref }) {
  const href =
    detailHref || (product?.slug ? `/producto/${product.slug}` : null)
  const image = itemImage(product)
  const name = itemTitle(product)
  const category = itemCategory(product)

  return (
    <article className="product-card">
      <div className="product-media">
        {image ? <img src={image} alt={name} /> : null}
      </div>
      <div className="product-body">
        {category ? <span className="product-brand">{category}</span> : null}
        <h3 className="product-name">{name}</h3>
        {product?.description ? (
          <p className="product-desc">{product.description}</p>
        ) : null}
        <div className="product-footer">
          <span className="product-price">{money(itemPrice(product))}</span>
          {action ??
            (href ? (
              <Link className="button button-red" to={href}>
                Ver producto
              </Link>
            ) : null)}
        </div>
      </div>
    </article>
  )
}
