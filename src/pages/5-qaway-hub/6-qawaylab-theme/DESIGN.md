---
name: Qaway Theme Studio Pro
description: Suite avanzada de diseño, armonías cromáticas, auditoría WCAG 2.1 y exportación de tokens
colors:
  primary: "#0f172a"
  surface: "#f8fafc"
  accent: "#ff4b0b"
  accent-dark: "#dc3d00"
  line: "#e2e8f0"
  muted: "#475569"
  success: "#16a34a"
  white: "#ffffff"
  amber: "#f59e0b"
  rose: "#ef4444"
  slate: "#64748b"
typography:
  display:
    fontFamily: "Outfit, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Outfit, system-ui, sans-serif"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    useFor: ["valores hex", "rgb", "hsl", "tamanos", "tokens exportados"]
spacing:
  page: "max-w-[1500px] mx-auto px-4 sm:px-6"
  section: "space-y-6"
rounded:
  card: "rounded-2xl"
  control: "rounded-lg"
  pill: "rounded-full"
dials:
  variance: 6
  motion: 3
  density: 6
identity:
  whiteLabel: true
  appNameEnv: "VITE_APP_NAME"
  fallbackName: "Theme Studio Pro"
---

# Design - Qaway Theme Studio Pro

## Design Read

Estudio de diseño visual y calibración de tokens para marcas del ecosistema Qaway. Layout de precisión en 3 columnas: panel de controles especializado (Color, Degradados, Marcas, Layout), lienzo de previsualización en vivo (Sitio Web, Métricas/Waterfall, Sistema UI) y exportador multi-formato (CSS :root, Tailwind v4, JSON).

## Principios

1. **Precisión cromática y perceptiva**: cálculos en tiempo real con `colord` para luminancia, armonías y contrastes WCAG 2.1 (AA/AAA).
2. **Previsualización contextual real**: la marca se prueba en vivo contra superficies de landing page, dashboards de métricas operativas y controles de interfaz.
3. **Control visual de alta densidad**: selector visual con `react-colorful` integrado con conversores HEX/RGB/HSL y copiado inmediato.
4. **Arquetipos de marca calibrados**: presets para sectores (Gastronomía/Burgers, Financiero/Contable, Tech/SaaS, Salud/Bio, Artesanal/Café).
5. **Desacople universal**: el sistema genera tokens universales y se exporta como un componente React modular (`<ThemeStudio />`).

## Sistema Visual

### Layout

- **Columna 1 (Controles)**: pestañas de navegación rápida (Color, Degradado, Marcas, Layout), rampa tonal 50-950, armonías cromáticas, auditoría WCAG.
- **Columna 2 (Lienzo Central)**: selector de vista (Sitio Web, Métricas & Waterfall, Sistema UI).
- **Columna 3 (Tokens)**: visor de código con pestañas CSS, Tailwind 4 y JSON con botones de copiado y descarga.

### Tipografía

- UI general: Outfit.
- Valores técnicos y códigos de color: JetBrains Mono.
- Arquetipos tipográficos soportados: Outfit, Space Grotesk, Inter, JetBrains Mono, Serif (Georgia).

### Color & Contraste

- Base `#f8fafc`, superficies `#ffffff`, líneas `#e2e8f0`, tinta `#0f172a`, muted `#475569`.
- Tokens activos del tema independientes del shell de la herramienta.
- Cumplimiento WCAG 2.1 AA/AAA verificado algorítmicamente.
