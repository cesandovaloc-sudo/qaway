import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ZoomIn, X } from 'lucide-react';
import StoreLayout from '../components/layout/StoreLayout';
import ProductCard from '../components/shared/ProductCard';
import { storefrontService } from '../services/storefront.service';
import { useCart } from '../hooks/useCart';
import { productToCartItem } from '../lib/cart';
import { resolveTenantSlug } from '../lib/tenant';
import type { StoreProductPageData, StoreProduct } from '../types/storefront';

export default function StoreProductPage() {
  const params = useParams();
  const tenantSlug = resolveTenantSlug(params.tenantSlug);
  const productSlug = params.productSlug || '';
  const [data, setData] = useState<StoreProductPageData | null>(null);
  const [selected, setSelected] = useState<Record<string,string>>({});
  const [activeImg, setActiveImg] = useState(0);
  const [paused, setPaused] = useState(false);
  const [zoom, setZoom] = useState(false);
  const [added, setAdded] = useState(false);
  const { add, count } = useCart();

  useEffect(() => { setData(null); setSelected({}); setActiveImg(0); setZoom(false); storefrontService.getProductPage(tenantSlug, productSlug).then(setData); }, [tenantSlug, productSlug]);

  const images = data?.product.images || [];
  useEffect(() => {
    if (paused || zoom || images.length <= 1) return;
    const id = window.setInterval(() => setActiveImg(i => (i + 1) % images.length), 4000);
    return () => window.clearInterval(id);
  }, [paused, zoom, images.length, productSlug]);

  const prev = () => setActiveImg(i => (i - 1 + images.length) % images.length);
  const next = () => setActiveImg(i => (i + 1) % images.length);

  const onAdd = (p: StoreProduct) => {
    const item = productToCartItem(p, tenantSlug);
    add({ ...item, metadata: { ...item.metadata, variants: selected } });
    setAdded(true); window.setTimeout(() => setAdded(false), 1500);
  };

  if (!data) return <div className="qwt-v1"><div className="qwt-container qwt-section">Cargando producto...</div></div>;
  const { tenant, categories, product, related } = data;
  if (!product) {
    return (
      <StoreLayout tenant={tenant} categories={categories} cartCount={count}>
        <div className="qwt-container qwt-section">
          <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Producto no encontrado</h1>
          <p style={{ color: '#64748b', marginBottom: 16 }}>Este producto no existe o aún no está disponible en esta tienda.</p>
          <Link className="qwt-btn qwt-btn-primary" to={`/tienda/${tenantSlug}`}>Volver al inicio</Link>
        </div>
      </StoreLayout>
    );
  }
  const discount = product.compareAtPrice && product.compareAtPrice > product.price ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100) : 0;
  return (
    <StoreLayout tenant={tenant} categories={categories} cartCount={count}>
      <div className="qwt-container">
        <div className="qwt-breadcrumb"><Link to={`/tienda/${tenantSlug}`}>Inicio</Link><span>/</span><Link to={`/tienda/${tenantSlug}/c/${product.categorySlug}`}>{product.categoryName || 'Categoría'}</Link><span>/</span><span>{product.name}</span></div>
        <div className="qwt-pdp">
          <div>
            <div className="qwt-gallery-main" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
              <img src={product.images[activeImg] || product.images[0]} alt={product.name} />
              {product.images.length > 1 && (
                <>
                  <button type="button" className="qwt-gallery-nav prev" onClick={prev} aria-label="Imagen anterior"><ChevronLeft size={20} /></button>
                  <button type="button" className="qwt-gallery-nav next" onClick={next} aria-label="Siguiente imagen"><ChevronRight size={20} /></button>
                </>
              )}
              <button type="button" className="qwt-gallery-zoom" onClick={() => setZoom(true)} aria-label="Ampliar imagen"><ZoomIn size={18} /></button>
            </div>
            {product.images.length > 1 && (
              <div className="qwt-gallery-thumbs">
                {product.images.map((img, idx) => (
                  <button key={img + idx} type="button" className={`qwt-gallery-thumb ${idx === activeImg ? 'active' : ''}`} onClick={() => setActiveImg(idx)} aria-label={`Imagen ${idx + 1}`}>
                    <img src={img} alt={`${product.name} ${idx + 1}`} loading="lazy" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <div className="qwt-pdp-brand">{product.brand || 'Marca'}</div>
            <h1>{product.name}</h1>
            <div className="qwt-pdp-price">
              <span className="qwt-price">S/ {product.price.toFixed(2)}</span>
              {product.compareAtPrice ? <span className="qwt-compare">S/ {product.compareAtPrice.toFixed(2)}</span> : null}
              {discount > 0 && <span className="qwt-badge">-{discount}%</span>}
            </div>
            {product.variants?.map(v => (
              <div key={v.type} className="qwt-variant">
                <label>{v.type}</label>
                <div className="qwt-variant-options">
                  {v.options.map(opt => (
                    <button key={opt} type="button" className={`qwt-variant-opt ${selected[v.type]===opt?'active':''}`} onClick={() => setSelected(s => ({...s,[v.type]:opt}))}>{opt}</button>
                  ))}
                </div>
              </div>
            ))}
            <div className={`qwt-stock ${product.stock<=0?'out':''}`}>{product.stock>0 ? `Stock disponible (${product.stock})` : 'Sin stock'}</div>
            <div style={{ display:'flex', gap:12, flexWrap:'wrap' }}>
              <button className="qwt-btn qwt-btn-primary" disabled={product.stock<=0} onClick={() => onAdd(product)}>{added ? 'Agregado' : 'Agregar al carrito'}</button>
              <Link className="qwt-btn qwt-btn-outline" to="/carrito">Ir al carrito</Link>
            </div>
            <div className="qwt-pdp-desc">
              <h3>Descripción</h3>
              <p>{product.description || 'Producto seleccionado de la tienda.'}</p>
            </div>
          </div>
        </div>

        <section className="qwt-section" style={{ paddingTop: 0 }}>
          <div className="qwt-section-head"><div><h2>Productos relacionados</h2></div></div>
          <div className="qwt-grid">{related.map(p => <ProductCard key={p.id} product={p} tenantSlug={tenantSlug} onAdd={onAdd} />)}</div>
        </section>
      </div>

      {zoom && (
        <div className="qwt-lightbox" onClick={() => setZoom(false)} role="dialog" aria-modal="true">
          <button type="button" className="qwt-lightbox-close" onClick={() => setZoom(false)} aria-label="Cerrar"><X size={22} /></button>
          <img src={product.images[activeImg] || product.images[0]} alt={product.name} onClick={e => e.stopPropagation()} />
        </div>
      )}
    </StoreLayout>
  );
}
