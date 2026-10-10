import { useCallback, useEffect, useState } from 'react'
import type { CartItem } from '../../contracts/commerce/v1.types'
import { isValidCartItem } from '../../contracts/commerce/v1.schema'
import { isSingleInstance, normalizeCart } from '@/components/checkout/storefront/utils'

const STORAGE_KEY = 'qaway-cart-v1'

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      const parsed: unknown = raw ? JSON.parse(raw) : []
      if (!Array.isArray(parsed)) return []
      // Normalizar ANTES de validar, con las reglas del carrito: colapsa líneas
      // duplicadas del mismo producto (identidad antigua por slug vs UUID) y
      // fuerza cantidad 1 en servicios y cursos. Sin esto, un carrito ya
      // persistido con cantidad > 1 en un servicio sobrevivía a la recarga y
      // el resumen mostraba "3 × One Web" mientras la fila decía "1 (Servicio
      // único)".
      return normalizeCart(parsed).filter(isValidCartItem)
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
      // Servicios y cursos son intangibles de compra única: volver a agregarlos
      // no acumula cantidad, solo confirma que ya están en el pedido.
      const incomingIsSingle = isSingleInstance(item)
      const quantity = incomingIsSingle ? 1 : item.quantity
      const existing = prev.find((i) => i.product_id === item.product_id)

      if (existing) {
        return prev.map((i) =>
          i.product_id === item.product_id
            ? { ...i, quantity: isSingleInstance(i) || incomingIsSingle ? 1 : i.quantity + quantity }
            : i
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product_id !== productId)
        : prev.map((i) =>
            i.product_id === productId
              ? { ...i, quantity: isSingleInstance(i) ? 1 : quantity }
              : i
          )
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
