import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import StoreLayout from '../components/layout/StoreLayout';
import ProductCard from '../components/shared/ProductCard';
import { storefrontService } from '../services/storefront.service';
import { useCart } from '../hooks/useCart';
import { productToCartItem } from '../lib/cart';
import { resolveTenantSlug } from '../lib/tenant';
import type { StoreCategoryPageData, StoreProduct } from '../types/storefront';

export default function StoreCategoryPage() {
  const params = useParams();
  const tenantSlug = resolveTenantSlug(params.tenantSlug);
  const categorySlug = params.categorySlug || '';
  const [data, setData] = useState<StoreCategoryPageData | null>(null);
  const [sort, setSort] = useState('relevant');
  const [brand, setBrand] = useState('all');
  const [offerOnly, setOfferOnly] = useState(false);
  const [maxPrice, setMaxPrice] = useState(500);
  const { add, count } = useCart();
  useEffect(() => { storefrontService.getCategoryPage(tenantSlug, categorySlug).then(d => { setData(d); setBrand('all'); setOfferOnly(false); setMaxPrice(500); }); }, [tenantSlug, categorySlug]);
  const onAdd = (p: StoreProduct) => add(productToCartItem(p, tenantSlug));

  const brands = useMemo(() => ['all', ...Array.from(new Set((data?.products || []).map(p => p.brand).filter(Boolean) as string[]))], [data]);
  const priceCeil = useMemo(() => Math.max(100, Math.ceil(Math.max(...(data?.products || []).map(p => p.price), 100) / 50) * 50), [data]);
  const products = useMemo(() => {
    let list = [...(data?.products || [])];
    if (brand !== 'all') list = list.filter(p => p.brand === brand);
    if (offerOnly) list = list.filter(p => p.compareAtPrice && p.compareAtPrice > p.price);
    list = list.filter(p => p.price <= maxPrice);
    if (sort === 'price-asc') list.sort((a,b) => a.price - b.price);
    if (sort === 'price-desc') list.sort((a,b) => b.price - a.price);
    if (sort === 'name') list.sort((a,b) => a.name.localeCompare(b.name));
    return list;
  }, [data, sort, brand, offerOnly, maxPrice]);

  if (!data) return <div className="qwt-v1"><div className="qwt-container qwt-section">Cargando categoría...</div></div>;
  const { tenant, categories, category } = data;
  return (
    <StoreLayout tenant={tenant} categories={categories} cartCount={count}>
      <div className="qwt-container">
        <div className="qwt-breadcrumb"><Link to={`/tienda/${tenantSlug}`}>Inicio</Link><span>/</span><span>{category.name}</span></div>
        <div className="qwt-plp-head">
          <div><h1>{category.name}</h1><p>{products.length} resultados</p></div>
        </div>
        <div className="qwt-plp-layout">
          <aside className="qwt-filters">
            <div className="qwt-filter-group">
              <h3>Categoría</h3>
              {categories.map(c => <Link key={c.id} to={`/tienda/${tenantSlug}/c/${c.slug}`} className="qwt-filter-option" style={{ fontWeight: c.slug===category.slug?700:400 }}>{c.name}</Link>)}
            </div>
            <div className="qwt-filter-group">
              <h3>Marca</h3>
              {brands.map(b => (
                <label key={b} className="qwt-filter-option"><input type="radio" name="brand" checked={brand===b} onChange={() => setBrand(b)} />{b==='all' ? 'Todas' : b}</label>
              ))}
            </div>
            <div className="qwt-filter-group">
              <h3>Precio máximo</h3>
              <input type="range" min={50} max={priceCeil} step={10} value={Math.min(maxPrice, priceCeil)} onChange={e => setMaxPrice(Number(e.target.value))} style={{ width:'100%' }} />
              <div className="qwt-muted" style={{ fontSize: 13, marginTop: 6 }}>Hasta S/ {Math.min(maxPrice, priceCeil).toFixed(0)}</div>
            </div>
            <div className="qwt-filter-group">
              <h3>Ofertas</h3>
              <label className="qwt-filter-option"><input type="checkbox" checked={offerOnly} onChange={e => setOfferOnly(e.target.checked)} />Solo productos en oferta</label>
            </div>
          </aside>
          <div>
            <div className="qwt-sortbar">
              <span className="qwt-muted">{products.length} productos</span>
              <select value={sort} onChange={e => setSort(e.target.value)} aria-label="Ordenar">
                <option value="relevant">Relevantes</option>
                <option value="price-asc">Precio: menor a mayor</option>
                <option value="price-desc">Precio: mayor a menor</option>
                <option value="name">Nombre</option>
              </select>
            </div>
            {products.length ? (
              <div className="qwt-grid">{products.map(p => <ProductCard key={p.id} product={p} tenantSlug={tenantSlug} onAdd={onAdd} />)}</div>
            ) : (data.products.length === 0 ? (
              <div className="qwt-grid">
                {Array.from({ length: 4 }, (_, i) => (
                  <Link key={`ph-${i + 1}`} to={`/tienda/${tenantSlug}/c/${category.slug}`} className="qwt-card" aria-label={`Producto ${i + 1}`}>
                    <div className="qwt-card-media" style={{ background: '#f1f5f9' }} />
                    <div className="qwt-card-brand">&nbsp;</div>
                    <h3 className="qwt-card-name">Producto {i + 1}</h3>
                    <div className="qwt-price-row"><span className="qwt-price" style={{ color: '#94a3b8' }}>S/ —</span></div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="qwt-empty">No hay productos con estos filtros.</div>
            ))}
          </div>
        </div>
      </div>
    </StoreLayout>
  );
}
