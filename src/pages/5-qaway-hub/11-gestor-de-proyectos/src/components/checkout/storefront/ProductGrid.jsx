import ProductCard from './ProductCard.jsx'

/**
 * Grid de productos del storefront.
 *
 * props:
 *  - products    array de productos (shape canónico del módulo)
 *  - renderCard  opcional: (product) => ReactNode, permite personalizar la tarjeta
 */
export default function ProductGrid({ products = [], renderCard }) {
  return (
    <div className="product-grid">
      {products.map((product, index) =>
        renderCard ? (
          renderCard(product)
        ) : (
          <ProductCard
            key={product?.id || product?.slug || index}
            product={product}
          />
        )
      )}
    </div>
  )
}
