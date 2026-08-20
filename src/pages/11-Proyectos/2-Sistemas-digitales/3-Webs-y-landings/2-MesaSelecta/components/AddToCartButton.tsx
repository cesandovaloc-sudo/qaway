"use client";

import { useState } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useCart } from "./CartContext";

export function AddToCartButton({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const { add } = useCart();
  return (
    <>
      <div className="detail-actions">
        <label className="quantity" aria-label="Cantidad">
          <select value={quantity} onChange={(event) => setQuantity(Number(event.target.value))} aria-label="Cantidad">
            {[1, 2, 3, 4, 5, 6].map((value) => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
        <button className="button button-primary" onClick={() => { add(product, quantity); setAdded(true); }}>Agregar a mi pedido</button>
      </div>
      {added && <p className="summary-note">Producto agregado. <Link className="text-link" href="/carrito">Revisar pedido</Link></p>}
    </>
  );
}
