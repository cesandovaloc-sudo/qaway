# 4. Bitácora de ejecución — Storefront Multi-tenant

## Propósito
Registro corto para retomar si se corta la sesión. Solo lo vital.

## Sesión 2026-11-23 (planificación)

### Hecho
- Revisado estado actual del repo.
- Confirmado: carrito/checkout/compras viven en `10-qawaylab-inventario` y host los monta en `/carrito`, `/carrito/checkout`, `/carrito/compras` (`src/router/AppRouter.jsx`).
- Confirmado: página web pública actual es `PublicCatalogPage.tsx` en `/hub/inventario/remates/:slug`; es catálogo básico, no web de marca completa.
- Decisión: crear carpeta nueva `src/pages/5-qaway-hub/15-qaway-tienda/` para storefront; no mezclar con admin inventario; no crear 15-qaway-ventas.
- Se creó carpeta de docs: `src/pages/5-qaway-hub/Nueva carpeta (2)/doc/`.
- Se crearon docs: `1-planificacion.md`, `2-creacion-pagina-referencia.md`, `3-conexiones-integracion.md`, `4-bitacora-ejecucion.md`.
- Se retiró mock demo temporal agregado antes en `src/pages/5-qaway-hub/10-qawaylab-inventario/src/hooks/useCatalogs.ts`.
- Se eliminó rastro nominal de referencia externa en docs internos y se renombró doc 2.
- Se estableció skill obligatoria: `image-to-code` (SKL-028). Flujo: imagen primero -> análisis profundo -> implementación fiel. Prohibido diseñar de memoria.
- Subdominios: `pepito.qawaylab.com` queda como idea a validar en infra Hostinger/DNS/SSL; MVP por ruta `/tienda/:tenantSlug`.

### Pendiente inmediato (siguiente sesión)
1. Crear estructura base `src/pages/5-qaway-hub/15-qaway-tienda/`.
2. Usar skill `image-to-code`: generar imágenes de referencia por sección (home, PLP, PDP) y analizarlas antes de codificar.
3. Definir tipos TS/adaptador (`storefront.ts`, `storefront.service.ts`) con contrato provisional.
4. Implementar Home visual fiel a referencias generadas.
5. Implementar PLP y PDP visuales.
6. Conectar CTA PDP -> cart existente (shape compatible).
7. Coordinar con agente BD: tablas/campos tenant branding, banners, categorías públicas, productos publicados.

### Decisiones que no se deben revertir sin motivo
- Carrito/checkout no se reescribe; se reutiliza.
- Storefront nueva va en `15-qaway-tienda`, separada del admin inventario.
- Multi-tenant por `tenantSlug` en MVP; subdominio después de validar infra.
- Creación visual con `image-to-code`, no de memoria.

### Archivos clave
- `src/router/AppRouter.jsx` — monta carrito y rutas host.
- `src/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/PublicCatalogPage.tsx` — web pública actual básica.
- `src/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/CartPage.tsx` — carrito.
- `src/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/CheckoutPage.tsx` — checkout.
- `src/pages/5-qaway-hub/10-qawaylab-inventario/src/pages/PurchasesPage.tsx` — compras.
- `src/pages/5-qaway-hub/10-qawaylab-inventario/src/services/catalogService.ts` — referencia tenant branding/content.

## Sesión 2026-11-23 (intento ejecución visual)

### Hecho
- Se leyó `AGENTS.md` raíz y se confirmó alineación.
- Se espejó AGENTS en raíz y en `Nueva carpeta (2)/doc/AGENTS.md`.
- Intentos image-gen fallaron (grok: Invalid credential; gemini-nano-banana-2.1: API key not valid).
- Se agregó `playwright-cli` a biblioteca: `BIB-019` en `biblioteca.seed.json` y `SKL-039` en `skills-matrix.seed.json`.
- Se capturaron screenshots reales con `playwright-cli` en `doc/`: `ref-home-real.png`, `ref-plp-real.png`, `ref-pdp-real.png`.

### Bloqueo
- El modelo actual no puede leer/analizar imágenes (input de imagen no soportado). Hay capturas reales, pero el análisis visual profundo image-to-code no puede completarse automáticamente por este modelo.

### Pendiente
- Obtener análisis visual (usuario/modelo con visión) o usar snapshots DOM/playwright para extracción estructural.
- Presentar plan estructural y esperar **"aplica"** antes de crear `15-qaway-tienda` (cambio estructural).

### Formato para próximas entradas
- Fecha/hora
- Hecho
- Archivos tocados
- Pendiente
- Bloqueos/dependencias BD