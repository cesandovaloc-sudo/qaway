import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import StoreLayout from '../components/layout/StoreLayout';
import ProductCard from '../components/shared/ProductCard';
import { storefrontService } from '../services/storefront.service';
import { useCart } from '../hooks/useCart';
import { productToCartItem } from '../lib/cart';
import { resolveTenantSlug } from '../lib/tenant';
import type { StoreProduct, StoreSearchResult } from '../types/storefront';

export default function StoreSearchPage() {
  const tenantSlug = resolveTenantSlug(useParams().tenantSlug);
  const [sp] = useSearchParams();
  const q = sp.get('q') || '';
  const [data, setData] = useState<StoreSearchResult | null>(null);
  const { add, count } = useCart();
  useEffect(() => { storefrontService.search(tenantSlug, q).then(setData); }, [tenantSlug, q]);
  const onAdd = (p: StoreProduct) => add(productToCartItem(p, tenantSlug));

  if (!data) return <div className="qwt-v1"><div className="qwt-container qwt-section">Buscando...</div></div>;
  return (
    <StoreLayout tenant={data.tenant} categories={data.categories} cartCount={count}>
      <div className="qwt-container qwt-section">
        <div className="qwt-section-head"><div><h2>Resultados para "{q}"</h2><p>{data.products.length} productos encontrados</p></div></div>
        {data.products.length ? <div className="qwt-grid">{data.products.map(p => <ProductCard key={p.id} product={p} tenantSlug={tenantSlug} onAdd={onAdd} />)}</div> : <div className="qwt-empty">No encontramos productos para tu búsqueda.</div>}
      </div>
    </StoreLayout>
  );
}
