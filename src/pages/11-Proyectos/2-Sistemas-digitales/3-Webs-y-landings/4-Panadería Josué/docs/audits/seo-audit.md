# Auditoría SEO

**Sitio:** Josué Panadería (one-page)
**Fecha:** 2026-08-07
**Alcance:** verificación de reglas SEO fundamentales antes de publicación

## Resumen

El sitio cumple las reglas SEO fundamentales del estándar Qaway v3 para una web pública one-page. Las mejoras de esta iteración se enfocaron en schema local completo, metadata rica y ubicación dinámica.

## Título y metadata

| Elemento | Estado |
|---|---|
| `title` (default + template) | OK |
| `meta description` | OK |
| `canonical` | OK (`alternates.canonical`) |
| Open Graph (type, locale, url, imágenes 1200×630) | OK |
| Twitter Card (summary_large_image) | OK |
| `robots` + `googleBot` | OK |
| `lang="es-PE"` | OK |
| Favicon + manifest | OK |

## Schema (JSON-LD)

- **Bakery** con `@id`, nombre, descripción, url, imagen, teléfono, email, `priceRange`, `servesCuisine`, dirección postal, **`geo`** (coordenadas por env), **`hasMap`**, `openingHoursSpecification`, `areaServed`, `sameAs`.
- **WebSite** vinculado al Bakery vía `publisher`.
- Validación pendiente en [validator.schema.org](https://validator.schema.org) con la URL real de producción.
- `NEXT_PUBLIC_MAP_LAT` / `NEXT_PUBLIC_MAP_LNG` deben confirmarse con las coordenadas reales del negocio.

## Estructura y contenido

- Un solo `h1` en el hero; secciones con `h2` jerárquicos: OK.
- Textos reales en HTML (no incrustados en imágenes): OK.
- Alt descriptivo en imágenes informativas; alt vacío en iconos decorativos: OK.
- 404 personalizada con enlaces a inicio y WhatsApp: agregada.

## Indexabilidad

- `robots.txt` generado con sitemap: OK.
- `sitemap.xml` con la URL principal: OK (revisar al tener más rutas).
- Renderizado estático (contenido en HTML inicial): OK.

## Imágenes

- WebP/AVIF configurado (`next.config.ts`).
- `sizes` y `fill` correctos en componentes.
- Hero con `priority` (logo) y CSS `image-set` con WebP + PNG.

## Pendientes antes de producción

1. Confirmar la URL real de producción en `NEXT_PUBLIC_SITE_URL`.
2. Confirmar el número real de WhatsApp.
3. Confirmar enlace real de Google Maps y coordenadas del negocio.
4. Sustituir fotografías reconstruidas por originales si se dispone de ellas.
5. Revalidar con Lighthouse (LCP ≤ 2.5 s, INP ≤ 200 ms, CLS ≤ 0.1) sobre la URL desplegada.
6. Validar schema con Schema.org Validator.

## Nota

El 100% de la página es prerrenderizado estático; el contenido visible y el schema son coherentes entre sí.
