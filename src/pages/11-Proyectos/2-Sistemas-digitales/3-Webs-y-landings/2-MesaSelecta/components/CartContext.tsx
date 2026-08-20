"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { CartItem, Product } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  count: number;
  add: (product: Product, quantity?: number) => void;
  update: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "mesa-selecta-cart";
const COOKIE_KEY = "mesa_selecta_cart";

function readStoredCart(): CartItem[] {
  try {
    const stored = window.localStorage.getItem(KEY);
    if (stored) return JSON.parse(stored);
  } catch {}
  try {
    const raw = document.cookie.split("; ").find((entry) => entry.startsWith(`${COOKIE_KEY}=`))?.split("=")[1];
    if (raw) return JSON.parse(decodeURIComponent(raw));
  } catch {}
  return [];
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => setItems(readStoredCart()));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  function persist(next: CartItem[]) {
    try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    try { document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(next))}; path=/; max-age=604800; SameSite=Lax`; } catch {}
    return next;
  }

  const value = useMemo<CartContextValue>(() => ({
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    add(product, quantity = 1) {
      setItems((current) => {
        const found = current.find((item) => item.product.id === product.id);
        if (found) return persist(current.map((item) => item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item));
        return persist([...current, { product, quantity }]);
      });
    },
    update(productId, quantity) {
      if (quantity < 1) return;
      setItems((current) => persist(current.map((item) => item.product.id === productId ? { ...item, quantity } : item)));
    },
    remove(productId) { setItems((current) => persist(current.filter((item) => item.product.id !== productId))); },
    clear() { setItems(persist([])); },
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart debe usarse dentro de CartProvider");
  return value;
}
