import { Link } from 'react-router-dom';
import type { StoreProduct } from '../../types/storefront';

type Props = { product: StoreProduct; tenantSlug: string; onAdd?: (p: StoreProduct) => void };

export default function ProductCard({ product, tenantSlug, onAdd }: Props) {
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;
  return (
    <article className="qwt-card">
      <Link to={`/tienda/${tenantSlug}/p/${product.slug}`} className="qwt-card-media">
        {discount > 0 && <span className="qwt-card-discount">-{discount}%</span>}
        <img src={product.images[0]} alt={product.name} loading="lazy" />
      </Link>
      <div className="qwt-card-brand">{product.brand || 'Tienda'}</div>
      <Link to={`/tienda/${tenantSlug}/p/${product.slug}`}><h3 className="qwt-card-name">{product.name}</h3></Link>
      <div className="qwt-price-row">
        <span className="qwt-price">S/ {product.price.toFixed(2)}</span>
        {product.compareAtPrice ? <span className="qwt-compare">S/ {product.compareAtPrice.toFixed(2)}</span> : null}
      </div>
      {onAdd && <div className="qwt-card-actions"><button className="qwt-btn qwt-btn-outline" onClick={() => onAdd(product)}>Agregar</button></div>}
    </article>
  );
}
