"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function CatalogClient({ products }: { products: Product[] }) {
  const formats = Array.from(new Set(products.map((product) => product.format)));
  const brands = Array.from(new Set(products.map((product) => product.brand)));
  const moments = Array.from(new Set(products.flatMap((product) => product.moments)));
  const [selectedFormats, setFormats] = useState<string[]>([]);
  const [selectedBrands, setBrands] = useState<string[]>([]);
  const [selectedMoments, setMoments] = useState<string[]>([]);
  const [sort, setSort] = useState("recommended");

  const toggle = (value: string, values: string[], setter: (values: string[]) => void) => setter(values.includes(value) ? values.filter((item) => item !== value) : [...values, value]);
  const visible = useMemo(() => {
    const filtered = products.filter((product) =>
      (!selectedFormats.length || selectedFormats.includes(product.format)) &&
      (!selectedBrands.length || selectedBrands.includes(product.brand)) &&
      (!selectedMoments.length || product.moments.some((moment) => selectedMoments.includes(moment)))
    );
    if (sort === "name") return [...filtered].sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "brand") return [...filtered].sort((a, b) => a.brand.localeCompare(b.brand));
    return [...filtered].sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [products, selectedFormats, selectedBrands, selectedMoments, sort]);

  const selected = [...selectedFormats, ...selectedBrands, ...selectedMoments];
  const groups: Array<[string, string[], string[], (values: string[]) => void]> = [
    ["Formato", formats, selectedFormats, setFormats],
    ["Marca", brands, selectedBrands, setBrands],
    ["Momento", moments, selectedMoments, setMoments],
  ];
  return (
    <div className="catalog-shell">
      <aside className="filter-panel" aria-label="Filtros del catálogo">
        {groups.map(([title, options, values, setter]) => (
          <div className="filter-group" key={title}>
            <h2 className="filter-title">{title}</h2>
            <div className="filter-options">
              {options.map((option) => (
                <label className="filter-option" key={option}>
                  <input type="checkbox" checked={values.includes(option)} onChange={() => toggle(option, values, setter)} />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </aside>
      <div>
        <div className="catalog-toolbar">
          <span className="results-count">{visible.length} productos</span>
          <select className="sort-select" value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Ordenar productos">
            <option value="recommended">Recomendados</option>
            <option value="name">Nombre</option>
            <option value="brand">Marca</option>
          </select>
        </div>
        {!!selected.length && <div className="active-filters">{selected.map((item) => <button key={item} className="active-filter" onClick={() => { if (selectedFormats.includes(item)) toggle(item, selectedFormats, setFormats); if (selectedBrands.includes(item)) toggle(item, selectedBrands, setBrands); if (selectedMoments.includes(item)) toggle(item, selectedMoments, setMoments); }}>{item} ×</button>)}</div>}
        {visible.length ? <div className="product-grid">{visible.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-state"><h3>No encontramos una coincidencia</h3><p className="muted">Quita un filtro o escríbenos y te ayudamos a elegir.</p></div>}
      </div>
    </div>
  );
}
