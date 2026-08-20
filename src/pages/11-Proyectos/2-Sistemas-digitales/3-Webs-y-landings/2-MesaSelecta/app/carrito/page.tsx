import type { Metadata } from "next";
import { CartView } from "@/components/CartView";
export const metadata: Metadata = { title: "Mi pedido" };
export default function CartPage() { return <main><section className="page-hero"><div className="container"><span className="eyebrow">Compra</span><h1>Mi pedido.</h1><p>Revisa productos y cantidades antes de completar los datos de entrega.</p></div></section><section className="section"><div className="container"><CartView /></div></section></main>; }
