# Decisión

## Contexto

El sitio muestra la ubicación de la panadería en la sección Contacto y el Footer mediante una imagen estática de mapa. El estándar exige contenido separado del diseño y configuración por entorno.

## Opción elegida

**Ubicación dinámica y configurable por variables de entorno.** Se centraliza en `data/site.ts`:

- `NEXT_PUBLIC_GOOGLE_MAPS_URL`: enlace propio de Google Maps si se define.
- Si está vacío, se genera automáticamente un enlace de búsqueda a partir de la dirección configurada.
- `NEXT_PUBLIC_MAP_LAT` / `NEXT_PUBLIC_MAP_LNG`: coordenadas para el schema `geo` (SEO local).
- El mapa se vuelve un enlace funcional "Cómo llegar" que abre Google Maps; la dirección también enlaza.

## Razón

- La ubicación no debe quedar incrustada como valor fijo en componentes.
- Evita iframes (requisito del brief) y mejora la conversión (CTA de navegación real).
- El schema con `geo` y `hasMap` mejora la presencia en Google Maps y resultados locales.

## Alternativas

- Embed de Google Maps (iframe): descartado por el brief ("sin iframes").
- Mapa estático sin enlace: se descartó por no aportar valor de conversión.

## Impacto

- Cambio en `data/site.ts`, `Contact.tsx`, `Footer.tsx`, `.env.example` y README.
- Sin cambios visuales al diseño aprobado.

## Mitigación

- Documentar las variables en `.env.example` con valores de referencia; el cliente debe confirmar coordenadas y enlace reales antes de producción.

## Fecha

2026-08-07

## Estado

Aceptado
