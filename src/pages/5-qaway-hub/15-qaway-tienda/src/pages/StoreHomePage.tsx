import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [heroIndex, setHeroIndex] = useState(0);
  const { add, count } = useCart();
  useEffect(() => { storefrontService.getHome(tenantSlug).then(setData); }, [tenantSlug]);
  const onAdd = (p: StoreProduct) => add(productToCartItem(p, tenantSlug));

  const banners = data?.banners || [];
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = window.setInterval(() => setHeroIndex((i) => (i + 1) % banners.length), 5000);
    return () => window.clearInterval(t);
  }, [banners.length]);

  if (!data) return <div className="qwt-v1"><div className="qwt-container qwt-section">Cargando tienda...</div></div>;
  const { tenant, categories, featured, offers } = data;
  const hero = banners[heroIndex] || banners[0];
  const heroHref = hero?.ctaHref || `/tienda/${tenantSlug}`;
  return (
    <StoreLayout tenant={tenant} categories={categories} cartCount={count}>
      <section className="qwt-hero" aria-label="Promociones principales">
        <div className="qwt-hero-slider">
          {hero ? (
            <Link to={heroHref} className="qwt-hero-slide" aria-label={hero.title || 'Ver promoción'}>
              {hero.imageUrl ? (
                <img className="qwt-hero-bg" src={hero.imageUrl} alt={hero.title || 'Banner principal'} />
              ) : (
                <div className="qwt-hero-bg" style={{ background: '#e5e7eb' }} aria-hidden="true" />
              )}
              <div className="qwt-hero-overlay" />
              <div className="qwt-container qwt-hero-content">
                <p className="qwt-hero-eyebrow">{tenant.name}</p>
                <h1>{hero.title || 'Descubre lo nuevo'}</h1>
                {hero.subtitle && <p className="qwt-hero-sub">{hero.subtitle}</p>}
                <span className="qwt-btn qwt-btn-primary qwt-hero-cta">{hero.ctaLabel || 'Ver más'}</span>
              </div>
            </Link>
          ) : (
            <div className="qwt-hero-slide qwt-hero-empty">
              <div className="qwt-container qwt-hero-content">
                <p className="qwt-hero-eyebrow">{tenant.name}</p>
                <h1>Tu tienda está lista</h1>
                <p className="qwt-hero-sub">Agrega banners desde tu panel para mostrarlos aquí.</p>
              </div>
            </div>
          )}

          {banners.length > 1 && (
            <>
              <button type="button" className="qwt-hero-nav prev" aria-label="Banner anterior" onClick={(e) => { e.preventDefault(); setHeroIndex((i) => (i - 1 + banners.length) % banners.length); }}>
                <ChevronLeft size={22} />
              </button>
              <button type="button" className="qwt-hero-nav next" aria-label="Siguiente banner" onClick={(e) => { e.preventDefault(); setHeroIndex((i) => (i + 1) % banners.length); }}>
                <ChevronRight size={22} />
              </button>
              <div className="qwt-hero-dots" role="tablist" aria-label="Banners">
                {banners.map((b, i) => (
                  <button key={b.id || i} type="button" role="tab" aria-selected={i === heroIndex} aria-label={`Banner ${i + 1}`} className={`qwt-hero-dot ${i === heroIndex ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setHeroIndex(i); }} />
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section className="qwt-section">
        <div className="qwt-container">
          <div className="qwt-section-head"><div><h2>Categorías</h2><p>Encuentra lo que buscas por categoría.</p></div></div>
          <div className="qwt-cats">
            {categories.map(c => (
              <Link key={c.id} to={`/tienda/${tenantSlug}/c/${c.slug}`} className="qwt-cat" aria-label={c.name}>
                <div className="qwt-cat-img">{c.imageUrl ? <img src={c.imageUrl} alt={c.name} loading="lazy" /> : null}</div>
                <span>{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="qwt-section" style={{ paddingTop: 0 }}>
        <div className="qwt-container">
          <div className="qwt-section-head">
            <div><h2>Productos destacados</h2><p>Selección recomendada para ti.</p></div>
            {categories[0] && <Link className="qwt-link" to={`/tienda/${tenantSlug}/c/${categories[0].slug}`}>Ver todo</Link>}
          </div>
          <div className="qwt-grid">{featured.map(p => <ProductCard key={p.id} product={p} tenantSlug={tenantSlug} onAdd={onAdd} />)}</div>
        </div>
      </section>

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
