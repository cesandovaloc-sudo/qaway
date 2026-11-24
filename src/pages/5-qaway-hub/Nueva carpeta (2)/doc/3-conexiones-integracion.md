# 3. Conexiones e integración — Tienda + Inventario + Carrito

## Objetivo
Conectar la storefront visual con el ecosistema existente, sin duplicar dominio.

## Mapa de integración

| Capa | Fuente actual | Uso en tienda | Estado |
|---|---|---|---|
| Inventario/productos | `10-qawaylab-inventario` + Supabase | catálogo, PDP, stock, precios | Conectado vía `StorefrontService` (Supabase + fallback mock) |
| Carrito/checkout/pagos | `10-qawaylab-inventario` (`CartPage`, `CheckoutPage`, `PurchasesPage`) | add to cart, checkout, compras | Existe, reutilizado |
| Tenant/branding | `tenants.branding/content` | logo, portada, colores, textos | Mapeado defensivamente; validar datos reales |
| Órdenes/ventas | inventario/supabase | confirmar compra, historial, admin ventas | Existe en dominio inventario |
| Assets | Supabase Storage / URLs | fotos tenant/producto/banner | Depende BD/RLS |

## Carrito: contrato a respetar
- Rutas host actuales: `/carrito`, `/carrito/checkout`, `/carrito/compras`.
- Páginas fuente: `src/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/CartPage.tsx`, `CheckoutPage.tsx`, `PurchasesPage.tsx`.
- Wrapper: `TiendaClientePage.jsx`.
- Shape: `qaway-cart-v1` / commerce v1 (`product_id`, `title`, `unit_price`, `quantity`, `product_type`, `image_url`, `metadata`).
- **Regla:** la tienda nueva emite ítems compatibles; no crea otro checkout.

## Contrato UI (implementado)
`src/pages/5-qaway-hub/15-qaway-tienda/src/services/storefront.service.ts`

```ts
interface StorefrontService {
  getHome(tenantSlug: string): Promise<StoreHomeData>;
  getCategoryPage(tenantSlug: string, categorySlug: string): Promise<StoreCategoryPageData>;
  getProductPage(tenantSlug: string, productSlug: string): Promise<StoreProductPageData>;
  getCategories(tenantSlug: string): Promise<StoreCategory[]>;
  search(tenantSlug: string, q: string): Promise<StoreSearchResult>;
}
```

- UI consume solo este servicio.
- Implementación actual: Supabase real (`@/config/supabase`) con fallback mock defensivo.
- Tablas consultadas: `tenants`, `categories`, `inv_products`.
- Mapper carrito: `src/pages/5-qaway-hub/15-qaway-tienda/src/lib/cart.ts`.
- Tenant resolver MVP: `src/pages/5-qaway-hub/15-qaway-tienda/src/lib/tenant.ts`.

## Multi-tenant y subdominios
- **MVP:** resolver `tenantSlug` desde ruta (`/tienda/:tenantSlug`).
- **Fase infra:** resolver por host/subdominio (`tenant.dominio.com`). Requiere DNS (A/CNAME/wildcard), SSL y lectura de `Host`.
- Todas las consultas públicas acotadas por tenant.

## Checklist de integración
- [x] Definir interfaz TS de StoreTenant, StoreProduct, StoreCategory, StoreBanner, StoreHomeData, StoreCategoryPageData, StoreProductPageData, StoreSearchResult, CartItem.
- [x] Centralizar UI en `StorefrontService`.
- [x] Implementar conexión Supabase real en `storefront.service.ts` con fallback mock defensivo.
- [x] Mapear producto storefront -> card PDP/PLP.
- [x] Mapear add-to-cart al shape del cart actual (`productToCartItem`, `qaway-cart-v1`).
- [x] Validar stock antes de mostrar CTA (PDP deshabilita CTA sin stock).
- [x] Manejar estados loading/vacío/no encontrado básico; fallback mock si Supabase falla/RLS bloquea.
- [ ] Confirmar con datos reales: `tenants.slug`/campo equivalente, RLS anon lectura tenants/categories/inv_products publicados.
- [ ] Confirmar fuente real de banners/home por tenant (actual: fallback banner + branding).
- [ ] Validar precio/publicado/tenant activo desde fuente real antes de CTA (reglas finales).

## Bitácora
- 2026-11-23: Mapeadas rutas vivas de carrito y fuente en inventario. Subdominio fase infra, MVP por ruta. No se modificó BD.
- 2026-11-23: Preparadas conexiones frontend: `StorefrontService` tipado, `productToCartItem`, `resolveTenantSlug`, páginas usando adaptador/mappers.
- 2026-11-23: Conectado `storefront.service.ts` a Supabase real (`tenants`, `categories`, `inv_products`) con mapeo defensivo y fallback mock. Pendiente validar RLS/slug/campos en datos reales.
