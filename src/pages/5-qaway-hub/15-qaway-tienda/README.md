# 15-qaway-tienda — Storefront Multi-tenant

Storefront pública multi-tenant (MVP por ruta). Superficie separada de `10-qawaylab-inventario`.

## Rutas
- `/tienda/:tenantSlug` — Home
- `/tienda/:tenantSlug/c/:categorySlug` — PLP/categoría
- `/tienda/:tenantSlug/p/:productSlug` — PDP
- `/tienda/:tenantSlug/buscar?q=` — Búsqueda

## Conexiones preparadas (frontend)

| Área | Archivo | Estado |
|---|---|---|
| Contrato UI | `src/services/storefront.service.ts` | `StorefrontService` con implementación Supabase real + fallback mock defensivo |
| Tipos | `src/types/storefront.ts` | StoreTenant/Product/Category/Banner/Home/PLP/PDP/Search/CartItem |
| Cart mapper | `src/lib/cart.ts` | `productToCartItem()` → shape commerce v1 / `qaway-cart-v1` |
| Tenant resolver | `src/lib/tenant.ts` | MVP por ruta; placeholder fase 2 por Host/subdominio |
| Cart/checkout real | `/carrito`, `/carrito/checkout`, `/carrito/compras` | Reutiliza inventario existente |

## Conexión Supabase (actual)
- Cliente: `@/config/supabase` (web app).
- Tenant: `tenants` (slug/id, branding/content).
- Productos: `inv_products` (filtra por `tenant_id`, excluye inactive/archived/unavailable; mapea precio/stock/imágenes/categoría/variantes).
- Categorías: `categories`.
- Fallback: si Supabase no responde, RLS bloquea, o no hay datos, usa mock para no romper demo.

## Pendiente de validar con datos reales
1. Confirmar que `tenants.slug` (o campo equivalente) existe y es público/legible por anon.
2. Confirmar políticas RLS anon para lectura pública de storefront (tenant, categorías, productos publicados).
3. Confirmar fuente real de banners/home por tenant (hoy usa banner fallback + branding).
4. Confirmar dominio/subdominio por tenant en fase 2.

## Aislamiento visual
- Raíz CSS: `.qwt-v1`
- Estilos scoped en `src/styles/storefront.css`
- Carga lazy desde `src/router/AppRouter.jsx`
- Sin imports de estilos de otras apps/web pública
