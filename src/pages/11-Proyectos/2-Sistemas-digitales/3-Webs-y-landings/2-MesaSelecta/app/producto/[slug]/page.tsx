import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/AddToCartButton";
import { ProductCard } from "@/components/ProductCard";
import { ProductVisual } from "@/components/ProductVisual";
import { formatPrice } from "@/lib/format";
import { getProductBySlug, getProducts } from "@/lib/data";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await getProductBySlug((await params).slug);
  return { title: product ? `${product.brand} ${product.name}` : "Producto" };
}
export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await getProductBySlug((await params).slug);
  if (!product) notFound();
  const related = (await getProducts()).filter((item) => item.id !== product.id).sort((a, b) => Number(b.brand === product.brand) - Number(a.brand === product.brand)).slice(0, 3);
  const facts = [["Presentación", `${product.format}${product.weightG ? ` · ${product.weightG} g` : ""}`], ["Origen", product.origin], ["Variedad", product.variety], ["Tueste", product.roast], ["Proceso", product.process], ["Métodos", product.methods.length ? product.methods.join(", ") : null]].filter((item) => item[1]);
  return <main><section className="section"><div className="container detail-grid"><div className="detail-gallery"><ProductVisual product={product} /><ProductVisual product={product} compact /><ProductVisual product={product} compact /></div><div className="detail-info"><div className="breadcrumb"><Link href="/catalogo">Catálogo</Link> / {product.brand}</div><span className="eyebrow">{product.brand}</span><h1>{product.name}</h1><p className="detail-lead">{product.description}</p><div className="detail-price">{formatPrice(product.priceCents)}</div><AddToCartButton product={product} /><dl className="facts">{facts.map(([label, value]) => <div className="fact" key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl></div></div></section><section className="section-compact"><div className="container"><div className="heading-row"><div><span className="eyebrow">También podría interesarte</span><h2 className="section-title">Otros cafés.</h2></div></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></div></section></main>;
}
