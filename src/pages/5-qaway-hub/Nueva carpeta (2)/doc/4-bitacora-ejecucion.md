# 4. Bitácora de ejecución — Tienda

## Propósito
Registro vivo para retomar la implementación sin perder contexto.

## Estado
- Fase: ejecución MVP + conexión Supabase frontend.
- Última actualización: 2026-11-23

## Sesión 2026-11-23 (planificación)
### Hecho
- Investigación de estructura hub/rutas y app inventario.
- Plan creado en docs 1-3; AGENTS creado.
- Decisión: nueva app `15-qaway-tienda`, `/tienda/:tenantSlug` MVP, subdominio fase 2.
- Reutilizar carrito/checkout/compras de `10-qawaylab-inventario`.

## Sesión 2026-11-23 (referencias visuales)
### Hecho
- Intentos image-gen fallaron por credenciales (grok/gemini).
- Se agregó `playwright-cli` a biblioteca: `BIB-019` en `biblioteca.seed.json`, `SKL-039` en `skills-matrix.seed.json`.
- Capturas reales con Playwright: `ref-home-real.png`, `ref-plp-real.png`, `ref-pdp-real.png`.
- Extracción DOM/CSS con Playwright para tokens/estructura.

## Sesión 2026-11-23 (ejecución scaffold con “aplica”)
### Hecho
- Creado scaffold `src/pages/5-qaway-hub/15-qaway-tienda/` (aislado, `.qwt-v1`, lazy).
- Rutas: `/tienda`, `/tienda/:tenantSlug`, `/tienda/:tenantSlug/c/:categorySlug`, `/tienda/:tenantSlug/p/:productSlug`, `/tienda/:tenantSlug/buscar?q=`.
- Páginas: Home, PLP/categoría, PDP, búsqueda. Componentes: header, footer, layout, product card.
- Datos: mock adapter en `src/services/storefront.service.ts`; reemplazable por Supabase.
- Cart: hook local compatible con `qaway-cart-v1` y shape `CartItem`; checkout reutiliza `/carrito`.
- Router: lazy import + rutas en `src/router/AppRouter.jsx`. Entrada en `src/config/routesRegistry.js`.
- `tsc --noEmit` EXIT:0.

## Sesión 2026-11-23 (iteración datos/filtros/galería)
### Hecho
- Mock ampliado a 20 productos, 4 categorías, marcas/precios/ofertas/stock, múltiples imágenes por producto.
- PDP: galería con thumbnails, flechas automáticas cuando >1 imagen, auto-slide 4s, pausa hover/zoom, lightbox zoom.
- PLP: filtros funcionales (categoría, marca, precio máximo, solo ofertas) + orden.
- Home: destacados/ofertas con 8 productos.
- `tsc --noEmit` EXIT:0.

## Sesión 2026-11-23 (preparación y conexión Supabase frontend)
### Hecho
- `StorefrontService` tipado e implementado con Supabase real (`@/config/supabase`) en `src/services/storefront.service.ts`.
- Consultas reales: `tenants`, `categories`, `inv_products`; mapeo defensivo a tipos storefront.
- Fallback mock defensivo si Supabase falla, RLS bloquea o no hay datos (demo no se rompe).
- Mapper carrito centralizado: `src/lib/cart.ts` (`productToCartItem`, compatible `qaway-cart-v1` / commerce v1).
- Tenant resolver MVP: `src/lib/tenant.ts` (ruta; placeholder host/subdominio fase 2).
- Páginas Home/PLP/PDP/Search usan servicio + mapper + resolver.
- Docs actualizados: `3-conexiones-integracion.md`, `15-qaway-tienda/README.md`.
- `tsc --noEmit` EXIT:0.

### Pendiente / validación con datos reales
- Confirmar `tenants.slug` (o campo equivalente) y RLS anon para lectura pública de `tenants`, `categories`, `inv_products`.
- Confirmar fuente real de banners/home por tenant (hoy fallback banner + branding).
- Validar reglas finales: publicado/precio/stock/tenant activo antes de CTA.
- Resolver tenant por subdominio/Host en fase infra.

### Archivos clave
- `src/pages/5-qaway-hub/15-qaway-tienda/src/services/storefront.service.ts` — conexión Supabase + fallback.
- `src/pages/5-qaway-hub/15-qaway-tienda/src/lib/cart.ts` — mapper cart.
- `src/pages/5-qaway-hub/15-qaway-tienda/src/lib/tenant.ts` — tenant resolver.
- `src/router/AppRouter.jsx` — rutas `/tienda`.
- `src/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/CartPage.tsx` / `CheckoutPage.tsx` — checkout reutilizado.
