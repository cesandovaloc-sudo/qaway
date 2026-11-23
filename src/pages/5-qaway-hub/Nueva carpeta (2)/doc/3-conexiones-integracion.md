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

## Contrato UI (adaptador recomendado)
Crear `15-qaway-tienda/services/storefront.service.ts` con funciones estables para UI:

```ts
getTenantBySlug(slug)
getStoreHome(tenantSlug)
getCategories(tenantSlug)
getCategoryPage(tenantSlug, categorySlug, filters)
getProductPage(tenantSlug, productSlug)
searchProducts(tenantSlug, query)
```

La UI no debe hacer queries Supabase directas dispersas; centralizar en servicio/adaptador.

## Multi-tenant y subdominios
- **MVP:** resolver `tenantSlug` desde ruta (`/tienda/:tenantSlug`).
- **Fase infra:** resolver por host/subdominio (`tenant.dominio.com`). Requiere DNS (A/CNAME/wildcard), SSL y lectura de `Host` en capa de routing/proxy/app.
- **Hostinger:** viable crear subdominios/DNS; wildcard/routing depende del plan/tipo de hosting. Validar antes de implementar. No bloquear MVP por esto.
- Todas las consultas públicas acotadas por tenant; assets en path/bucket por tenant.

## Checklist de integración
- [ ] Definir interfaz TS de TenantStorefront, StoreProduct, StoreCategory, Banner.
- [ ] Confirmar con agente BD nombres de tabla/campos/RPC/views.
- [ ] Mapear producto inventario -> card PDP/PLP.
- [ ] Mapear add-to-cart al shape del cart actual.
- [ ] Validar stock/precio/publicado antes de mostrar CTA.
- [ ] Manejar estados: loading, vacío, error, no encontrado.

## Bitácora
- 2026-11-23: Mapeadas rutas vivas de carrito y fuente en inventario. Aclarado subdominio como fase infra, MVP por ruta. Pendiente contrato final con agente BD. No se modificó BD.