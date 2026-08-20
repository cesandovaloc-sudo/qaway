import type { Metadata } from "next";
import { CatalogClient } from "@/components/CatalogClient";
import { getProducts } from "@/lib/data";

export const metadata: Metadata = { title: "Catálogo" };
export default async function CatalogPage() {
  const products = await getProducts();
  return <main><section className="page-hero"><div className="container"><span className="eyebrow">Catálogo</span><h1>Encuentra tu café.</h1><p>Filtra por formato, marca o momento. Cada ficha muestra solo información confirmada y puede actualizarse directamente desde Supabase.</p></div></section><section className="section"><div className="container"><CatalogClient products={products} /></div></section></main>;
}
