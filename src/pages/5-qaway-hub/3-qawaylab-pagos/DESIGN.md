---
name: Qaway Pagos
description: Modulo de pagos embebible, tema claro editorial, montos en mono
colors:
  primary: "#ff4b0b"
  primary-dark: "#df3900"
  paper: "#f4f3f0"
  paper-2: "#ebe7df"
  white: "#fbfaf8"
  ink: "#20201f"
  muted: "#6d6b68"
  line: "#d8d2c8"
  green: "#2e5b4a"
  shadow: "0 18px 50px rgba(34, 28, 22, 0.08)"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Inter, sans-serif"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    useFor: ["montos", "números de cuenta", "CCI", "códigos de pedido"]
spacing:
  page: "min(1180px, calc(100% - 40px))"
  section: "56px 0"
rounded:
  card: "0px (esquinas vivas editoriales)"
  control: "0px"
  pill: "999px"
dials:
  variance: 5
  motion: 3
  density: 4
identity:
  whiteLabel: true
  appNameEnv: "VITE_APP_NAME"
  fallbackName: "Qaway Lab"
---

# Design - Qaway Pagos

## Design Read

Módulo de pagos embebible con **tema claro editorial "papel"**: esquinas vivas, tipografía display con carácter (Space Grotesk), montos y datos bancarios en mono. Es un componente de confianza: los datos de pago se ven como un documento, no como una app de marketing. Diseño pensado para insertarse en webs de clientes sin chocar con su identidad.

## Principios

1. **El pago se ve como documento**: esquinas vivas, hairlines, papel cálido. Nada de glassmorphism ni gradientes.
2. **Montos y cuentas en mono**: todo número crítico (precio, cuenta, CCI, Yape, código de pedido) en JetBrains Mono, imposible de confundir.
3. **Un acento**: naranja `#ff4b0b` para acciones y datos de pago. Verde `#2e5b4a` solo para estados de éxito real.
4. **White-label**: el nombre del negocio desde configuración (`VITE_APP_NAME`), listo para revender.
5. **Clases prefijadas y variables CSS propias**: el módulo convive con cualquier CSS del host sin romperlo.

## Sistema visual

### Layout

- Demo: header sticky con blur, catálogo en grilla 3 columnas, ficha de producto sticky, carrito 2 columnas, checkout 2 columnas con resumen sticky.
- Checkout: formulario en columna izquierda, resumen del pedido a la derecha. Métodos de pago como opciones seleccionables con acento.
- Panel admin: tarjetas planas con hairline.

### Tipografía

- Display: Space Grotesk (700, `-0.03em`) para títulos y marca.
- Body: Inter. Mono: JetBrains Mono para montos, cuentas, CCI, códigos.
- Sin em-dash en texto visible.

### Color

- Papel: `#f4f3f0` fondo, `#fbfaf8` superficies, `#ebe7df` medios. Ink `#20201f`. Líneas `#d8d2c8`.
- Acento: `#ff4b0b` / `#df3900` hover. Verde `#2e5b4a` solo éxito.
- Contraste WCAG AA.

### Formas

- Esquinas vivas (0px) en tarjetas, inputs y botones. Sistema editorial único, coherente con el tema claro.

### Estados

- Loading: skeletons que imitan la forma final.
- Empty: "Tu pedido está vacío" con CTA al catálogo.
- Error: inline en formularios (`form-status`).
- Éxito: pantalla de pedido registrado con datos de pago claros y montos en mono.

## Antirreferencias

- No emojis en la UI (incluida la pantalla de éxito del checkout).
- No glassmorphism ni gradientes decorativos.
- No montos sin símbolo de moneda.
- No hardcode del nombre de negocio.
- No glow neón.

## Componentes clave

1. **BrandBar**: header del demo, marca configurable.
2. **ProductCard**: ficha de producto con precio en mono.
3. **Checkout**: formulario + métodos de pago + resumen sticky. Pantalla de éxito con datos de transferencia en mono.
4. **PurchaseHistory**: historial de compras por usuario.
5. **PaymentsPanel / ProductsManager**: administración en tarjetas planas.

## Movimiento

- `MOTION 3`: solo hover/active (estados CSS). Sin animaciones automáticas; es un módulo de confianza, no una landing.
- `prefers-reduced-motion`: default.
