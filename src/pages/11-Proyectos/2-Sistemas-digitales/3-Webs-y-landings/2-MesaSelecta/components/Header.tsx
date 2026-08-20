"use client";

import Link from "next/link";
import { useCart } from "./CartContext";

export function Header() {
  const { count } = useCart();
  return (
    <>
      <div className="announcement">Desde 3 unidades: descuento por paquete · Desde 4 unidades: beneficio de delivery según zona · No acumulables</div>
      <header className="site-header">
        <div className="container header-inner">
          <Link href="/" className="brand">Mesa <span>Selecta</span></Link>
          <nav className="main-nav" aria-label="Navegación principal">
            <Link href="/catalogo">Catálogo</Link>
            <Link href="/como-elegir">Cómo elegir</Link>
            <Link href="/blog">Guía de café</Link>
            <Link href="/entrega-y-pagos">Entrega y pagos</Link>
            <Link href="/contacto">Contacto</Link>
          </nav>
          <div className="header-actions">
            <a className="button button-secondary" href="https://instagram.com/mesa_selecta" target="_blank" rel="noreferrer">Instagram</a>
            <Link href="/carrito" className="cart-link">Mi pedido <span className="cart-count">{count}</span></Link>
          </div>
        </div>
      </header>
    </>
  );
}
