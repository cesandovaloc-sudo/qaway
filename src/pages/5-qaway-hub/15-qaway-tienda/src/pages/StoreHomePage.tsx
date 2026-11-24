import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StoreLayout from '../components/layout/StoreLayout';
import ProductCard from '../components/shared/ProductCard';
import { storefrontService } from '../services/storefront.service';
import { useCart } from '../hooks/useCart';
import { productToCartItem } from '../lib/cart';
import { resolveTenantSlug } from '../lib/tenant';
import type { StoreHomeData, StoreProduct } from '../types/storefront';

export default function StoreHomePage() {
  const tenantSlug = resolveTenantSlug(useParams().tenantSlug);
  const [data, setData] = useState<StoreHomeData | null>(null);
  const { add, count } = useCart();
  useEffect(() => { storefrontService.getHome(tenantSlug).then(setData); }, [tenantSlug]);
  const onAdd = (p: StoreProduct) => add(productToCartItem(p, tenantSlug));

  if (!data) return <div className="qwt-v1"><div className="qwt-container qwt-section">Cargando tienda...</div></div>;
  const { tenant, banners, categories, featured, offers } = data;
  const hero = banners[0];
  return (
    <StoreLayout tenant={tenant} categories={categories} cartCount={count}>
      <section className="qwt-hero">
        <div className="qwt-container qwt-hero-grid">
          <div className="qwt-hero-copy">
            <div className="qwt-eyebrow">Colección destacada</div>
            <h1>{hero?.title || 'Descubre lo nuevo'}</h1>
            <p>{hero?.subtitle || 'Explora productos seleccionados para tu tienda.'}</p>
            {hero?.ctaHref && <Link className="qwt-btn qwt-btn-primary" to={hero.ctaHref}>{hero.ctaLabel || 'Ver más'}</Link>}
          </div>
          <div className="qwt-hero-media">{hero?.imageUrl && <img src={hero.imageUrl} alt={hero.title} />}</div>
        </div>
      </section>

      {categories.length > 0 && (
        <section className="qwt-section">
          <div className="qwt-container">
            <div className="qwt-section-head"><div><h2>Categorías</h2><p>Encuentra lo que buscas por categoría.</p></div></div>
            <div className="qwt-cats">
              {categories.map(c => (
                <Link key={c.id} to={`/tienda/${tenantSlug}/c/${c.slug}`} className="qwt-cat">
                  <div className="qwt-cat-img">{c.imageUrl ? <img src={c.imageUrl} alt={c.name} loading="lazy" /> : null}</div>
                  <span>{c.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {featured.length > 0 ? (
        <section className="qwt-section" style={{ paddingTop: categories.length ? 0 : undefined }}>
          <div className="qwt-container">
            <div className="qwt-section-head"><div><h2>Productos destacados</h2><p>Selección recomendada para ti.</p></div>{categories[0] && <Link className="qwt-link" to={`/tienda/${tenantSlug}/c/${categories[0].slug}`}>Ver todo</Link>}</div>
            <div className="qwt-grid">{featured.map(p => <ProductCard key={p.id} product={p} tenantSlug={tenantSlug} onAdd={onAdd} />)}</div>
          </div>
        </section>
      ) : (
        <section className="qwt-section" style={{ paddingTop: categories.length ? 0 : undefined }}>
          <div className="qwt-container">
            <div className="qwt-section-head"><div><h2>Tu tienda está lista</h2><p>Aún no hay productos publicados para este tenant.</p></div></div>
            <div style={{ border: '1px dashed #cbd5e1', borderRadius: 16, padding: 24, background: '#fff', color: '#475569' }}>
              Cuando subas productos en Inventario, aparecerán aquí automáticamente.
            </div>
          </div>
        </section>
      )}

      {offers.length > 0 && (
        <section className="qwt-section" style={{ paddingTop: 0 }}>
          <div className="qwt-container">
            <div className="qwt-section-head"><div><h2>Ofertas</h2><p>Precios especiales por tiempo limitado.</p></div></div>
            <div className="qwt-grid">{offers.map(p => <ProductCard key={p.id} product={p} tenantSlug={tenantSlug} onAdd={onAdd} />)}</div>
          </div>
        </section>
      )}
    </StoreLayout>
  );
}
