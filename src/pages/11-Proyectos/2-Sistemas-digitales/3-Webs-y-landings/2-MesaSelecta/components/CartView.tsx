"use client";

import Link from "next/link";
import { useCart } from "./CartContext";
import { ProductVisual } from "./ProductVisual";
import { formatPrice } from "@/lib/format";

export function CartView() {
  const { items, update, remove } = useCart();
  const priced = items.every((item) => item.product.priceCents != null);
  const subtotal = items.reduce((sum, item) => sum + (item.product.priceCents ?? 0) * item.quantity, 0);
  if (!items.length) return <div className="empty-state"><h3>Tu pedido está vacío</h3><p className="muted">Agrega productos desde el catálogo para continuar.</p><br /><Link className="button button-primary" href="/catalogo">Ver catálogo</Link></div>;
  return (
    <div className="cart-layout">
      <div className="cart-items">
        {items.map((item) => (
          <article className="cart-item" key={item.product.id}>
            <ProductVisual product={item.product} compact />
            <div><span className="product-brand">{item.product.brand}</span><h3>{item.product.name}</h3><p>{item.product.format}{item.product.weightG ? ` · ${item.product.weightG} g` : ""}</p></div>
            <div className="cart-item-actions">
              <div className="quantity-control"><button onClick={() => update(item.product.id, item.quantity - 1)} aria-label="Restar uno">−</button><span>{item.quantity}</span><button onClick={() => update(item.product.id, item.quantity + 1)} aria-label="Sumar uno">+</button></div>
              <strong>{formatPrice(item.product.priceCents == null ? null : item.product.priceCents * item.quantity)}</strong>
              <button className="remove-link" onClick={() => remove(item.product.id)}>Retirar</button>
            </div>
          </article>
        ))}
      </div>
      <aside className="order-summary">
        <h2>Resumen</h2>
        <div className="summary-row"><span>Productos</span><strong>{items.reduce((sum, item) => sum + item.quantity, 0)}</strong></div>
        <div className="summary-row"><span>Subtotal</span><strong>{priced ? formatPrice(subtotal) : "Por confirmar"}</strong></div>
        <div className="summary-row"><span>Delivery</span><strong>Según zona</strong></div>
        <p className="summary-note">Puedes elegir el descuento desde 3 unidades o el beneficio de delivery desde 4 unidades. No son acumulables.</p>
        <Link className="button button-primary" style={{ width: "100%" }} href="/finalizar-compra">Continuar con el pedido</Link>
      </aside>
    </div>
  );
}
