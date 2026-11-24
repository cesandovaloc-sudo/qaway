import { useCallback, useEffect, useState } from 'react';
import type { CartItem } from '../types/storefront';

const STORAGE_KEY = 'qaway-cart-v1';

function normalize(items: unknown[]): CartItem[] {
  if (!Array.isArray(items)) return [];
  const map = new Map<string, CartItem>();
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue;
    const it = raw as any;
    const product_id = String(it.product_id || it.id || '');
    const title = String(it.title || it.name || 'Producto');
    const unit_price = Number(it.unit_price ?? it.price ?? it.base_price ?? 0);
    const quantity = Math.max(1, Number(it.quantity || 1));
    const product_type = (it.product_type || it.type || 'physical') as CartItem['product_type'];
    if (!product_id || !Number.isFinite(unit_price)) continue;
    const single = product_type === 'service' || product_type === 'course';
    const prev = map.get(product_id);
    if (prev) {
      map.set(product_id, { ...prev, quantity: single ? 1 : prev.quantity + (single ? 1 : quantity) });
    } else {
      map.set(product_id, { product_id, title, unit_price, quantity: single ? 1 : quantity, product_type, image_url: it.image_url ?? it.image ?? null, metadata: it.metadata ?? {} });
    }
  }
  return [...map.values()];
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return normalize(JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]')); } catch { return []; }
  });

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch {}
  }, [items]);

  const add = useCallback((item: CartItem) => {
    setItems(prev => {
      const single = item.product_type === 'service' || item.product_type === 'course';
      const ex = prev.find(i => i.product_id === item.product_id);
      if (ex) return prev.map(i => i.product_id === item.product_id ? { ...i, quantity: (single || i.product_type === 'service' || i.product_type === 'course') ? 1 : i.quantity + (single ? 1 : item.quantity) } : i);
      return [...prev, { ...item, quantity: single ? 1 : Math.max(1, item.quantity || 1) }];
    });
  }, []);

  const remove = useCallback((id: string) => setItems(prev => prev.filter(i => i.product_id !== id)), []);
  const clear = useCallback(() => setItems([]), []);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);
  return { items, add, remove, clear, count, subtotal };
}
