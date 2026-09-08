# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Dueños de negocio, agencias y equipos de producto del ecosistema Qaway Lab que necesitan definir, afinar y exportar sistemas visuales completos (colores, tipografía, degradados, armonías, contrastes WCAG 2.1 y tokens) con previsualización en vivo para webs y dashboards analíticos.

## Product Purpose

Estudio avanzado de diseño y tokens cromáticos (`ThemeStudio`): suite visual interactiva con `react-colorful` y `colord` para manipulación de color, armonías automáticas (análogos, complementarios, tríadas), rampas tonales 50-950, auditoría WCAG 2.1, generador de degradados CSS y exportación instantánea en `:root`, Tailwind v4 `@theme` y JSON estructurado.

## Positioning

Módulo universal de identidad visual desacoplado y white-label: integrable nativamente como componente (`<ThemeStudio />`) en cualquier panel administrativo, dashboard de analítica o aplicación del ecosistema Qaway.

## Operating Context

Flujo: selección de arquetipo de marca / personalización cromática precisa → auditoría de accesibilidad en vivo → previsualización interactiva multimodo (Sitio Web, Métricas/Waterfall, Sistema UI) → exportación multi-formato (CSS :root, Tailwind v4, JSON).

## Capabilities and Constraints

- Stack: React 19 + Vite 8 + TypeScript + Tailwind v4 + framer-motion + colord + react-colorful.
- Suite de color: Colord con plugins `harmonies` y `a11y`.
- Selector: `react-colorful` interactivo con formatos HEX, RGB, HSL y copia rápida.
- Exportación: Tokens universales CSS `:root`, Tailwind v4 `@theme`, y esquema JSON para backend/Supabase.
- Cero dependencias externas rígidas: modular y portable por diseño.

## Brand Commitments

- Precisión cromática perceptiva y accesibilidad garantizada (WCAG 2.1 AA/AAA).
- Cambios reflejados en tiempo real sin recargas ni pérdida de estado.
- Tokens limpios y compatibles con toda la suite web y paneles de métricas.
