# 1. Planificación — Tienda Web Multi-tenant (Qaway)

## Estado
- **Fecha:** 2026-11-23
- **Responsable esta sesión:** agente visual/frontend (plan + ejecución visual).
- **Paralelo:** otro agente está mejorando tablas/Supabase y modelo de datos. No duplicar ese trabajo.

## Objetivo
Crear una **página web/storefront multi-tenant optimizada**, tipo e-commerce, tomando como referencia visual/flujo una referencia externa proporcionada por el usuario (uso interno; no dejar nombre de marca externa en docs), implementada con componentes propios de Qaway. Debe consumir ecosistema existente: **inventario** (productos, stock, precios, tenant) y **carrito/checkout** (ya optimizado).

## Skill obligatoria para creación visual
- **Usar:** `image-to-code` (`C:\Users\csand\.agents\skills\image-to-code`, SKL-028).
- **No** diseñar de memoria ni improvisar código visual sin referencia.
- **Flujo:** generar imagen(es) de referencia por sección primero -> análisis profundo -> implementación fiel.
- Si una sección no es legible, generar imagen adicional/detalle fresca (no recortar).

## Referencia visual/funcional (interna)
- Portada/home e-commerce.
- Categoría/PLP con filtros, orden, breadcrumb, grid.
- PDP con galería, precio, variantes/stock, CTA, relacionados.
- Flujo completo hasta checkout/pago.

## Decisión de arquitectura (definida)
- **Crear carpeta nueva:** `src/pages/5-qaway-hub/15-qaway-tienda/`
- **No** mezclar storefront nueva dentro del admin `10-qawaylab-inventario`.
- **No** crear `15-qaway-ventas`; ventas/stock/pedidos pertenecen a inventario.
- **Reusar carrito/checkout existente:** `/carrito`, `/carrito/checkout`, `/carrito/compras`.

## Evidencia del estado actual (repo)
- Carrito vivo en inventario: `src/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/CartPage.tsx`, `CheckoutPage.tsx`, `PurchasesPage.tsx`.
- Shell/skin: `src/pages/5-qaway-hub/10-qawaylab-inventario/src/components/checkout/TiendaShell.jsx`, `checkout/storefront/*`.
- Host monta carrito desde inventario: `src/router/AppRouter.jsx` ("checkout vive 100% en 10-qawaylab-inventario"; rutas `/carrito*`).
- Web pública actual: `PublicCatalogPage.tsx` en `/hub/inventario/remates/:slug` — catálogo básico, no web de marca completa.
- Tenant branding parcial: `catalog.tenant.branding/content` en `catalogService`/`PublicCatalogPage`.

## Principios
- **No inventar la rueda:** reutilizar carrito, pagos, inventario, tenant, supabase.
- **Separar superficies:** 15-qaway-tienda = storefront pública; 10-qawaylab-inventario = backoffice/admin.
- **Multi-tenant:** misma plantilla; cambia branding, contenido, catálogo y dominio/slug por tenant.
- **Datos por tenant:** filtrar por `tenant_id`; assets por tenant; RLS por agente BD.

## Rutas MVP propuestas
| Flujo | Ruta propuesta | Nota |
|---|---|---|
| Home tenant | `/tienda/:tenantSlug` | Portada marca/tenant |
| Categoría/PLP | `/tienda/:tenantSlug/c/:categorySlug` | Listado, filtros, orden |
| Producto/PDP | `/tienda/:tenantSlug/p/:productSlug` | Galería, precio, stock, CTA |
| Búsqueda | `/tienda/:tenantSlug/buscar?q=` | Opcional MVP+ |
| Carrito | `/carrito` | Reusar existente |
| Checkout | `/carrito/checkout` | Reusar existente |
| Compras | `/carrito/compras` | Reusar existente |

## Nota sobre subdominios (idea, validar infra)
- `pepito.qawaylab.com` fue planteado como idea. Un **subdominio** es un registro DNS (normalmente A/CNAME) que apunta a un servidor/IP.
- Para multi-tenant por subdominio se suele usar: DNS (A/CNAME por subdominio o wildcard `*.dominio.com`) + app que resuelve el tenant por `Host` header + SSL (ideal wildcard).
- En Hostinger: se pueden crear subdominios/DNS desde panel; la viabilidad de wildcard y el enrutamiento dependen del tipo de hosting/plan (shared/VPS/Cloud) y configuración del servidor/proxy. Verificar en panel Hostinger y con soporte antes de comprometer arquitectura.
- **MVP recomendado:** ruta por slug (`/tienda/:tenantSlug`) para no bloquear por DNS/SSL; luego capa de resolución por host/subdominio.

## Entregables visuales
1. Plan y docs de continuidad.
2. Duplicado visual desde referencia externa usando `image-to-code` (home, PLP, PDP, componentes base).
3. Conexiones UI con contratos/adaptadores (sin inventar esquema final BD).

## Riesgos / dependencias
- **BD en paralelo:** contratos pueden cambiar; usar interfaces TS y adaptadores.
- **Cart actual:** requiere shape compatible con `qawaCommerceAdapter`/utils storefront.
- **Assets:** upload logo/portada/fotos depende de Storage/RLS.
- **Subdominio:** DNS wildcard, SSL y resolución por host; no bloquear MVP.

## Bitácora
- 2026-11-23: Revisado estado actual. Confirmado carrito en inventario y PublicCatalogPage básica. Decidida carpeta `15-qaway-tienda`. Creados docs. Establecida skill `image-to-code` como obligatoria. Eliminadas referencias nominales externas de docs internos. Aclarada idea de subdominios como pendiente de validación infra.