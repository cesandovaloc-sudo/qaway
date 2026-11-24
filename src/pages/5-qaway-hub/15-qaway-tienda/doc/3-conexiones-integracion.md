# 3. Conexiones e integración — Tienda + Inventario + Carrito

## Objetivo
Conectar la storefront visual con el ecosistema existente, sin duplicar dominio.

## Mapa de integración

| Capa | Fuente actual | Uso en tienda | Estado |
|---|---|---|---|
| Inventario/productos | `10-qawaylab-inventario` + Supabase | catálogo, PDP, stock, precios | Existe, validar contrato público |
| Carrito/checkout/pagos | `10-qawaylab-inventario` (`CartPage`, `CheckoutPage`, `PurchasesPage`) | add to cart, checkout, compras | Existe, reutilizar |
| Tenant/branding | parcial en `tenants.branding/content` / gestor-proyectos | logo, portada, colores, textos | Parcial, agente BD ajusta |
| Órdenes/ventas | inventario/supabase | confirmar compra, historial, admin ventas | Existe en dominio inventario |
| Assets | Supabase Storage (por definir por agente BD) | fotos tenant/producto/banner | Depende BD |

## Carrito: contrato a respetar
- Rutas host actuales: `/carrito`, `/carrito/checkout`, `/carrito/compras`.
- Páginas fuente: `src/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/CartPage.tsx`, `CheckoutPage.tsx`, `PurchasesPage.tsx`.
- Wrapper: `TiendaClientePage.jsx`.
- Adaptador/shape: revisar `qawaCommerceAdapter`, `useCart`, `checkout/storefront/utils`.
- **Regla:** la tienda nueva debe emitir ítems compatibles; no crear otro checkout.

## Inventario: datos mínimos para storefront
- Tenant: id, slug, nombre, branding, contacto, dominio futuro.
- Producto: id, slug, nombre, descripción, categoría, marca, precio, precio oferta, stock, imágenes, estado/publicado.
- Categoría: id, slug, nombre, padre, orden, imagen/banner.
- Banners/home: imagen, título, CTA, orden, activo, tenant.

> Nombres finales de tablas/campos los define el agente BD. La UI debe consumir mediante servicio/adaptador.

## Contrato UI (implementado)
`src/pages/5-qaway-hub/15-qaway-tienda/src/services/storefront.service.ts` exporta `StorefrontService`:

```ts
interface StorefrontService {
  getHome(tenantSlug: string): Promise<StoreHomeData>;
  getCategoryPage(tenantSlug: string, categorySlug: string): Promise<StoreCategoryPageData>;
  getProductPage(tenantSlug: string, productSlug: string): Promise<StoreProductPageData>;
  getCategories(tenantSlug: string): Promise<StoreCategory[]>;
  search(tenantSlug: string, q: string): Promise<StoreSearchResult>;
}
```

- UI consume solo este servicio. **Punto único de swap**: `export const storefrontService: StorefrontService = mockStorefrontService`.
- Tipos: `src/pages/5-qaway-hub/15-qaway-tienda/src/types/storefront.ts`.
- Mapper carrito: `src/pages/5-qaway-hub/15-qaway-tienda/src/lib/cart.ts` (`productToCartItem` → `qaway-cart-v1` / commerce v1).
- Tenant resolver MVP: `src/pages/5-qaway-hub/15-qaway-tienda/src/lib/tenant.ts` (ruta ahora; host/subdominio fase 2).

## Multi-tenant y subdominios
- **MVP:** resolver `tenantSlug` desde ruta (`/tienda/:tenantSlug`).
- **Fase infra:** resolver por host/subdominio (`tenant.dominio.com`). Requiere DNS (A/CNAME/wildcard), SSL y lectura de `Host` en capa de routing/proxy/app.
- **Hostinger:** viable crear subdominios/DNS; wildcard/routing depende del plan/tipo de hosting. Validar antes de implementar. No bloquear MVP por esto.
- Todas las consultas públicas acotadas por tenant; assets en path/bucket por tenant.

## Checklist de integración
- [x] Definir interfaz TS de StoreTenant, StoreProduct, StoreCategory, StoreBanner, StoreHomeData, StoreCategoryPageData, StoreProductPageData, StoreSearchResult, CartItem.
- [x] Centralizar UI en `StorefrontService` (mock swap point único).
- [x] Mapear producto inventario/storefront -> card PDP/PLP (componentes conectados al servicio).
- [x] Mapear add-to-cart al shape del cart actual (`productToCartItem`, `qaway-cart-v1`, commerce v1).
- [x] Validar stock antes de mostrar CTA (PDP deshabilita CTA sin stock).
- [x] Manejar estados: loading, vacío, no encontrado básico (mock). Error boundary/API real pendiente con BD.
- [ ] Confirmar con agente BD nombres de tabla/campos/RPC/views y reemplazar mock en `storefront.service.ts`.
- [ ] Conectar branding real por tenant (logo/colores/banner/contacto) desde BD.
- [ ] Validar precio/publicado/tenant activo desde fuente real antes de CTA.

## Bitácora
- 2026-11-23: Mapeadas rutas vivas de carrito y fuente en inventario. Aclarado subdominio como fase infra, MVP por ruta. Pendiente contrato final con agente BD. No se modificó BD.
- 2026-11-23: Preparadas conexiones frontend: `StorefrontService` tipado, `productToCartItem`, `resolveTenantSlug`, páginas usando adaptador/mappers, tipos `StoreSearchResult`. Pendiente solo swap a Supabase por agente BD.