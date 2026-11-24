import type { CartItem, StoreProduct } from '../types/storefront';

/** Mapea un producto de storefront al shape de carrito canónico (qaway-cart-v1 / commerce v1). */
export function productToCartItem(product: StoreProduct, tenantSlug: string): CartItem {
  return {
    product_id: product.id,
    title: product.name,
    unit_price: product.price,
    quantity: 1,
    product_type: 'physical',
    image_url: product.images[0] || null,
    metadata: {
      sku: product.sku ?? null,
      slug: product.slug,
      tenant_slug: tenantSlug,
      brand: product.brand ?? null,
      category_slug: product.categorySlug,
    },
  };
}
