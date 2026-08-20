import type { Product } from "@/lib/types";

export function ProductVisual({ product, compact = false }: { product: Product; compact?: boolean }) {
  const isSpecial = product.format.toLowerCase().includes("especial");
  const isKienti = product.brand === "Kiénti";
  const style = {
    "--pack-color": isKienti ? "#9f2d26" : isSpecial ? "#f7f3ea" : "#171717",
    "--pack-ink": isSpecial ? "#171717" : "#ffffff",
  } as React.CSSProperties;
  return (
    <div className="product-media" aria-label={product.imageAlt ?? `Presentación de ${product.brand} ${product.name}`}>
      {!compact && <span className="product-badge">{product.moments[0] ?? product.format}</span>}
      <div className="product-pack" style={style}>
        <strong>{product.brand}</strong>
        <small>{product.name}</small>
      </div>
    </div>
  );
}
