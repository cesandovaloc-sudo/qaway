import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { ProductVisual } from "./ProductVisual";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="product-card">
      <ProductVisual product={product} />
      <div className="product-body">
        <span className="product-brand">{product.brand}</span>
        <h2 className="product-name">{product.name}</h2>
        <p className="product-desc">{product.descriptionShort}</p>
        <div className="product-meta">
          <span className="meta-chip">{product.format}</span>
          {product.weightG && <span className="meta-chip">{product.weightG} g</span>}
          {product.origin && <span className="meta-chip">{product.origin}</span>}
        </div>
        <div className="product-footer">
          <span className="product-price">{formatPrice(product.priceCents)}</span>
          <Link className="product-link" href={`/producto/${product.slug}`}>Ver detalles →</Link>
        </div>
      </div>
    </article>
  );
}
