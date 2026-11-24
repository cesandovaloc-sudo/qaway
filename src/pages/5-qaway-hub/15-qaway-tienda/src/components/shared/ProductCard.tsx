import { Link } from 'react-router-dom';
import type { StoreProduct } from '../../types/storefront';

type Props = { product: StoreProduct; tenantSlug: string; onAdd?: (p: StoreProduct) => void };

export default function ProductCard({ product, tenantSlug, onAdd }: Props) {
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;
  const img = product.images?.[0];
  const isPlaceholder = !img && product.price === 0;
  return (
    <article className="qwt-card">
      <Link to={`/tienda/${tenantSlug}/p/${product.slug}`} className="qwt-card-media">
        {discount > 0 && <span className="qwt-card-discount">-{discount}%</span>}
        {img ? <img src={img} alt={product.name} loading="lazy" /> : <div style={{ width: '100%', height: '100%', background: '#f1f5f9' }} />}
      </Link>
      <div className="qwt-card-brand">{product.brand || 'Tienda'}</div>
      <Link to={`/tienda/${tenantSlug}/p/${product.slug}`}><h3 className="qwt-card-name">{product.name}</h3></Link>
      <div className="qwt-price-row">
        <span className="qwt-price" style={isPlaceholder ? { color: '#94a3b8' } : undefined}>{isPlaceholder ? 'S/ —' : `S/ ${product.price.toFixed(2)}`}</span>
        {product.compareAtPrice ? <span className="qwt-compare">S/ {product.compareAtPrice.toFixed(2)}</span> : null}
      </div>
      {onAdd && !isPlaceholder && <div className="qwt-card-actions"><button className="qwt-btn qwt-btn-outline" onClick={() => onAdd(product)}>Agregar</button></div>}
    </article>
  );
}
