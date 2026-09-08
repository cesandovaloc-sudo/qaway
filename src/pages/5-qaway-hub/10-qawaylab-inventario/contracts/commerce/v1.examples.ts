import type { CartItem, CheckoutRequest } from './v1.types'

export const cartItemExample: CartItem = {
  product_id: '123e4567-e89b-12d3-a456-426614174000',
  title: 'Zapatillas Running Pro',
  unit_price: 249.9,
  quantity: 1,
  product_type: 'physical',
  image_url: 'https://cdn.ejemplo.com/zapatillas.jpg',
  metadata: { sku: 'RUN-001' },
}

export const checkoutRequestExample: CheckoutRequest = {
  items: [
    cartItemExample,
    {
      product_id: '123e4567-e89b-12d3-a456-426614174001',
      title: 'Medias Deportivas',
      unit_price: 29.9,
      quantity: 2,
      product_type: 'physical',
    },
  ],
  currency: 'PEN',
  bucketName: 'resources',
  userId: null,
  returnUrl: 'https://inventario.qawaylab.com',
}
