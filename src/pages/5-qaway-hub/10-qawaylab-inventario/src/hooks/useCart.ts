import { useCallback, useEffect, useState } from 'react'
import type { CartItem } from '../../contracts/commerce/v1.types'
import { isValidCartItem } from '../../contracts/commerce/v1.schema'

const STORAGE_KEY = 'qaway-cart-v1'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      // Validar contra el contrato commerce v1: descartar datos corruptos
      return Array.isArray(parsed) ? parsed.filter(isValidCartItem) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
      // almacenamiento no disponible: el carrito vive solo en memoria
    }
  }, [items])

  const add = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product_id === item.product_id)
      if (existing) {
        return prev.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        )
      }
      return [...prev, item]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product_id !== productId)
        : prev.map((i) => (i.product_id === productId ? { ...i, quantity } : i))
    )
  }, [])

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product_id !== productId))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const count = items.reduce((sum, i) => sum + i.quantity, 0)
  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)

  return { items, add, updateQuantity, remove, clear, count, subtotal }
}
