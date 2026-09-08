---
name: Qaway Agenda
description: Sistema de reservas online multi-negocio, premium y operativo
colors:
  primary: "#ff4b0b"
  primary-hover: "#dc3d00"
  ink: "#0c0c0e"
  ink-2: "#151518"
  ink-3: "#1d1d21"
  line: "#26262b"
  muted: "#8b8b93"
  muted-bright: "#a6a6ae"
  success: "#22c55e"
  warning: "#f59e0b"
  danger: "#ef4444"
typography:
  display:
    fontFamily: "Space Grotesk, Inter, system-ui, sans-serif"
    fontWeight: 700
    letterSpacing: "-0.02em"
  body:
    fontFamily: "Inter, system-ui, sans-serif"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, monospace"
    useFor: ["horas", "fechas", "duraciones", "datos operativos"]
spacing:
  page: "max-w-6xl mx-auto px-4 sm:px-6"
  section: "py-14 sm:py-20"
  gap-card: "gap-4 sm:gap-5"
rounded:
  card: "rounded-2xl"
  control: "rounded-xl"
  pill: "rounded-full"
shadow:
  card: "shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_30px_rgba(0,0,0,0.35)]"
  accent: "shadow-[0_0_0_1px_rgba(255,75,11,0.4)_inset]"
dials:
  variance: 6
  motion: 5
  density: 5
identity:
  whiteLabel: true
  appNameEnv: "VITE_APP_NAME"
  fallbackName: "Reserva"
  poweredBy: "Powered by Qaway Lab"
---

# Design - Qaway Agenda

## Design Read

Producto operativo de reservas B2B2C para negocios locales, con lenguaje premium y cercano (familia Calendly/Picktime pero con identidad propia). Base oscura operativa, acento naranja único de marca, tipografía display con carácter (Space Grotesk) y mono para todo lo operativo (horas, fechas, duraciones).

## Principios

1. **El tiempo es el protagonista**: horas, duraciones y fechas siempre en mono, legibles, con jerarquía clara.
2. **Un acento, un sistema**: naranja `#ff4b0b` es el único acento. Estados (éxito, alerta, error) solo en contextos de estado real.
3. **Menos cajas, más ritmo**: no tarjetas genéricas; líneas hairlines y espacio negativo organizan. Las tarjetas existen solo donde hay elevación real.
4. **White-label desde el día uno**: el nombre y logo del producto se leen de configuración, no están hardcodeados.
5. **Micro-interacciones con intención**: el flujo de reserva avanza con motion contenido (pasos, no decoración infinita). `prefers-reduced-motion` respetado.

## Sistema visual

### Layout

- Hero de home: **split asimétrico** (copy izquierda, vista previa real del flujo a la derecha). No centrado, no 3 cards iguales.
- Página pública de reserva: flujo por pasos con **progreso real**, columna de resumen sticky a la derecha.
- Panel admin: densidad de herramienta, mono en datos, hairlines, sin cajas genéricas.
- Breakpoints estándar: `sm 640 / md 768 / lg 1024 / xl 1280`. `min-h-[100dvh]`, nunca `h-screen`.

### Tipografía

- Display: Space Grotesk (700, `-0.02em`) para títulos y números grandes.
- Body: Inter.
- Mono: JetBrains Mono para horas (formato slot), fechas, duraciones, slugs, precios.
- Sin em-dash en ningún texto visible. Separadores con guion, coma o punto.

### Color

- Fondo: `#0c0c0e` (ink), superficies `#151518` / `#1d1d21`, líneas `#26262b`.
- Acento: `#ff4b0b` (primary) / `#dc3d00` hover.
- Texto: blanco, `#8b8b93` (muted), `#a6a6ae` (muted-bright). Contraste WCAG AA.
- Sin glow neón: sombras tintadas al fondo, `shadow` de card con highlight interior sutil.

### Formas

- Tarjetas `rounded-2xl`, controles/inputs `rounded-xl`, pills/fechas `rounded-full`. Sistema único, consistente en toda la app.

### Estados

- Loading: skeletons que imitan la forma final del layout (calendario, slots, listas).
- Empty: compuestos, con indicación clara de cómo llenar (ej: "Aún no tienes citas. Comparte tu link").
- Error: inline en formularios, contextual; toast solo para transitorios.
- Feedback táctil: `:active` con `scale-[0.98]` / `translate-y-[1px]`.

## Antirreferencias

- No "3 tarjetas iguales en fila" en el home.
- No Inter como única tipografía.
- No hero centrado genérico.
- No logo cuadrado `Q` hardcodeado; logo/identidad vienen de configuración.
- No glow naranja (`shadow-[0_0_30px]`) como decoración.
- No dots decorativos, no scroll cues, no version footers.
- No separador `·` repetido como decoración.

## Componentes clave

1. **BrandMark**: logo configurable (inicial + gradiente textura) leído de `VITE_APP_NAME`.
2. **ProgressSteps**: progreso real del flujo de reserva (1 fecha, 2 hora, 3 datos) con animación contenida.
3. **TimeSlotGrid**: grilla de slots en mono, estados selected/hover/unavailable.
4. **MonthCalendar**: calendario con disponibilidad real, celdas de estado, navegación por mes.
5. **AdminTabs**: navegación operativa del panel (disponibilidad, servicios, agenda).
6. **DataRows**: filas de datos con hairline dividers, mono para horas, estados de cita (confirmed/pending/cancelled).

## Movimiento

- `MOTION 5`: entradas suaves (opacity + y), transición entre pasos con AnimatePresence, micro-hover en controles.
- Flujo de reserva: cada paso entra con stagger corto; el resumen se actualiza sin saltos.
- `prefers-reduced-motion`: todo colapsa a estático.
