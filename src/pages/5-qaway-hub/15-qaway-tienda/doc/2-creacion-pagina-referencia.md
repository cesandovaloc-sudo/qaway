# 2. Creación de página — Duplicado visual desde referencia externa

## Objetivo
Crear la UI storefront multi-tenant inspirada en una referencia e-commerce externa proporcionada por el usuario (uso interno, no documentar nombre/marca en repo). Implementación propia Qaway. No copiar código/activos propietarios; replicar estructura, jerarquía, espaciado y flujo UX.

## Skill obligatoria (no memoria, no improvisación)
- **Skill:** `image-to-code` (`C:\Users\csand\.agents\skills\image-to-code`)
- **Matriz biblioteca:** SKL-028, "Foto de web → código fiel", vigente/global.
- **Flujo obligatorio:** 1) generar imagen(es) de diseño primero, 2) análisis profundo de las imágenes, 3) implementar frontend a partir de ese análisis.
- **Regla:** no empezar por código libre. No usar "a ojo/memoria". Si falta claridad, generar más imágenes de detalle/sección.
- **Regla de fidelidad:** respetar layout, jerarquía, espaciado, tipografía, CTA, componentes, tratamiento de imagen y ritmo visual. Evitar drift a plantilla genérica.

## Referencia interna (no dejar nombre externo en docs públicos)
- Home/portada e-commerce.
- PLP/categoría con filtros, orden, grid, breadcrumb.
- PDP con galería, precio, variantes/stock, CTA, descripción, relacionados.
- Flujo hasta checkout/pago.

> Las capturas/URLs exactas se manejan en sesión de trabajo; no se versionan con nombre de marca externa.

## Estructura propuesta en repo
```text
src/pages/5-qaway-hub/15-qaway-tienda/
  README.md
  routes/
  pages/
    StoreHomePage.tsx
    StoreCategoryPage.tsx       # PLP
    StoreProductPage.tsx        # PDP
    StoreSearchPage.tsx         # opcional MVP+
  components/
    layout/      StoreHeader, StoreFooter, StoreMegaMenu, StoreSearchBar
    home/        HeroBanner, PromoGrid, CategoryRail, ProductCarousel
    plp/         Breadcrumbs, FilterSidebar, SortBar, ProductGrid, Pagination
    pdp/         ProductGallery, ProductInfo, VariantSelector, AddToCartBar, RelatedProducts
    shared/      ProductCard, PriceTag, StockBadge, TenantBrand
  hooks/         useTenantStorefront, useStoreProducts, useStoreProduct
  services/      storefront.service.ts
  types/         storefront.ts
  styles/        storefront.css (scoped)
```

## Pantallas MVP

### A. Home (`/tienda/:tenantSlug`)
- Header: logo tenant, buscador, categorías, cuenta, carrito.
- Hero/banner configurable por tenant.
- Secciones: destacados, ofertas, categorías, novedades.
- Footer: contacto, redes, legales.

### B. PLP (`/tienda/:tenantSlug/c/:categorySlug`)
- Breadcrumb, filtros, orden, grid cards, paginación.

### C. PDP (`/tienda/:tenantSlug/p/:productSlug`)
- Galería, nombre/marca/SKU, precio/descuento, stock, variantes, CTA add-to-cart, descripción, relacionados.

### D. Checkout/Pago
- No rehacer. Reusar: `/carrito`, `/carrito/checkout`, `/carrito/compras`.

## Checklist visual
- [ ] Imagen(es) de referencia generadas con `image-to-code` antes de codificar.
- [ ] Análisis profundo documentado (tipografía, spacing, colores, componentes, CTA).
- [ ] Layout responsive mobile/desktop.
- [ ] Header sticky y buscador usable.
- [ ] Cards producto con hover/loading/empty.
- [ ] PLP con filtros y orden.
- [ ] PDP con galería y CTA claro.
- [ ] Branding por tenant por tokens CSS.
- [ ] Estados vacíos/error/no encontrado.
- [ ] Accesibilidad básica.

## Convenciones
- CSS scoped bajo `.qawa-tienda`.
- No tocar estilos globales del host.
- UI no consulta Supabase disperso; usar adaptador/servicio.
- Datos mock solo detrás de flag/adaptador; retirar antes de cierre.

## Bitácora
- 2026-11-23: Definida estructura y alcance MVP. Se estableció `image-to-code` como skill obligatoria. Se eliminaron referencias nominales externas de la documentación interna. Pendiente: generar imágenes de referencia por sección e iniciar implementación.