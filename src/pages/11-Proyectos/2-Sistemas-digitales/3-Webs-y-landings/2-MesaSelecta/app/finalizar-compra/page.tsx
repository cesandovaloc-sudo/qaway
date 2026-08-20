import type { Metadata } from "next";
import { CheckoutForm } from "@/components/CheckoutForm";
export const metadata: Metadata = { title: "Finalizar compra" };
export default function CheckoutPage() { return <main><section className="page-hero"><div className="container"><span className="eyebrow">Finalizar compra</span><h1>Confirma los datos.</h1><p>El pedido se registra y el total final se valida según precio, stock, promoción elegida y distrito.</p></div></section><section className="section"><div className="container"><CheckoutForm /></div></section></main>; }
