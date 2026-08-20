"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "./CartContext";
import { formatPrice } from "@/lib/format";

export function CheckoutForm() {
  const router = useRouter();
  const { items, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const priced = items.every((item) => item.product.priceCents != null);
  const subtotal = items.reduce((sum, item) => sum + (item.product.priceCents ?? 0) * item.quantity, 0);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) { setError("Agrega al menos un producto antes de confirmar."); return; }
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const payload = {
      customerName: form.get("name"), phone: form.get("phone"), district: form.get("district"), address: form.get("address"),
      promotionChoice: form.get("promotion"), paymentMethod: form.get("payment"), notes: form.get("notes"),
      items: items.map((item) => ({ productId: item.product.id, name: `${item.product.brand} ${item.product.name}`, quantity: item.quantity, unitPriceCents: item.product.priceCents })),
    };
    try {
      const response = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "No se pudo registrar el pedido.");
      clear();
      router.push(`/pedido-confirmado?numero=${encodeURIComponent(result.orderNumber)}`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "No se pudo registrar el pedido.");
    } finally { setSubmitting(false); }
  }

  return (
    <form className="checkout-layout" onSubmit={submit}>
      <div className="checkout-form">
        <section className="form-section">
          <h2>Datos de contacto</h2>
          <div className="form-grid">
            <div className="field"><label htmlFor="name">Nombre</label><input id="name" name="name" required /></div>
            <div className="field"><label htmlFor="phone">WhatsApp</label><input id="phone" name="phone" inputMode="tel" required /></div>
            <div className="field"><label htmlFor="district">Distrito</label><input id="district" name="district" required /></div>
            <div className="field"><label htmlFor="address">Dirección</label><input id="address" name="address" required /></div>
            <div className="field field-full"><label htmlFor="notes">Indicaciones</label><textarea id="notes" name="notes" rows={3} /></div>
          </div>
        </section>
        <section className="form-section">
          <h2>Beneficio</h2>
          <div className="choice-grid">
            <label className="choice"><input type="radio" name="promotion" value="discount" required /><span><strong>Descuento por volumen</strong><br />Desde 3 unidades, descuento por cada paquete.</span></label>
            <label className="choice"><input type="radio" name="promotion" value="delivery" required /><span><strong>Beneficio de delivery</strong><br />Desde 4 unidades, según la zona de entrega.</span></label>
          </div>
          <p className="summary-note">Debes elegir uno. Las promociones no son acumulables.</p>
        </section>
        <section className="form-section">
          <h2>Forma de pago</h2>
          <div className="choice-grid">
            <label className="choice"><input type="radio" name="payment" value="coordinate" required /><span><strong>Coordinar al confirmar</strong><br />Recibirás la validación del total y los datos de pago.</span></label>
            <label className="choice"><input type="radio" name="payment" value="online_pending" required /><span><strong>Pago en línea</strong><br />Quedará disponible cuando se conecte la pasarela elegida.</span></label>
          </div>
        </section>
        {error && <div className="form-status">{error}</div>}
      </div>
      <aside className="order-summary">
        <h2>Tu pedido</h2>
        {items.map((item) => <div className="summary-row" key={item.product.id}><span>{item.quantity} × {item.product.name}</span><strong>{formatPrice(item.product.priceCents == null ? null : item.product.priceCents * item.quantity)}</strong></div>)}
        <div className="summary-row"><span>Subtotal</span><strong>{priced ? formatPrice(subtotal) : "Por confirmar"}</strong></div>
        <p className="summary-note">El total final se confirma al validar precio, stock, promoción y distrito.</p>
        <button className="button button-red" style={{ width: "100%" }} disabled={submitting}>{submitting ? "Registrando…" : "Confirmar pedido"}</button>
      </aside>
    </form>
  );
}
