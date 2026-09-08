---
name: Qaway Expedientes
description: Historial clinico digital humano + veterinaria, confiable y premium
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
    useFor: ["dosis", "fechas de vacunas", "signos vitales", "IDs de paciente", "datos clinicos"]
spacing:
  page: "max-w-6xl mx-auto px-4 sm:px-6"
  section: "py-14 sm:py-20"
rounded:
  card: "rounded-2xl"
  control: "rounded-xl"
  pill: "rounded-full"
shadow:
  card: "shadow-[0_1px_0_rgba(255,255,255,0.04)_inset,0_8px_30px_rgba(0,0,0,0.35)]"
dials:
  variance: 6
  motion: 4
  density: 5
identity:
  whiteLabel: true
  appNameEnv: "VITE_APP_NAME"
  fallbackName: "Expedientes"
  poweredBy: "Powered by Qaway Lab"
---

# Design - Qaway Expedientes

## Design Read

Producto de confianza (datos de salud) para clínicas humanas y veterinarias. Lenguaje premium y sereno: oscuro operativo con acento naranja único, display con carácter (Space Grotesk) y mono para todos los datos clínicos. La confianza se comunica con orden, no con adornos.

## Principios

1. **Confianza = orden**: jerarquía clara, datos legibles, cero ruido decorativo. Un expediente médico no se decora, se organiza.
2. **El dato clínico en mono**: dosis, fechas de vacunas, signos vitales, IDs de paciente y resultados siempre en JetBrains Mono.
3. **Un acento, un sistema**: naranja `#ff4b0b` único. Estados (éxito, alerta, error) solo en contexto clínico real (vacuna vencida, alergia, alerta).
4. **White-label desde el día uno**: nombre del producto desde `VITE_APP_NAME`.
5. **Sin fricción para el paciente**: link seguro, sin login, expediente legible en el celular.

## Sistema visual

### Layout

- Home: hero **split asimétrico** (copy izquierda, tarjeta de expediente de ejemplo a la derecha). No centrado genérico, no 3 cards iguales.
- Dashboard clínico: densidad de herramienta, filas planas con hairline, datos en mono.
- Ficha del paciente: secciones claras (identidad, vitales, vacunas, alergias, recetas) con jerarquía tipo historia clínica real.
- Registro público: expediente legible tipo documento, mono en datos, sin login.
- `min-h-[100dvh]`, nunca `h-screen`.

### Tipografía

- Display: Space Grotesk (700, `-0.02em`).
- Body: Inter. Mono: JetBrains Mono para datos clínicos.
- Sin em-dash en texto visible.

### Color

- Fondo: `#0c0c0e` (ink), superficies `#151518` / `#1d1d21`, líneas `#26262b`.
- Acento: `#ff4b0b` / hover `#dc3d00`. Texto: blanco, `#8b8b93` (muted), `#a6a6ae` (muted-bright). Contraste WCAG AA.
- Sin glow neón; sombras tintadas al fondo.

### Formas

- Tarjetas `rounded-2xl`, controles `rounded-xl`, pills `rounded-full`. Sistema único.

### Estados

- Loading: skeletons que imitan la forma final (fila de paciente, ficha).
- Empty: compuestos ("Aún no hay pacientes. Agrega tu primer paciente").
- Error: inline en formularios, contextual; nunca rompe la página.
- Feedback táctil: `:active` con `scale-[0.98]`.

## Antirreferencias

- No "3 tarjetas iguales en fila".
- No Inter como única tipografía.
- No hero centrado genérico con glow.
- No hardcode del nombre de producto.
- No estados "solo éxito"; los datos clínicos siempre muestran estado real (vencida, pendiente, confirmada).
- No emojis en la UI.

## Componentes clave

1. **BrandMark**: logo configurable desde `VITE_APP_NAME`.
2. **VitalSignsRow**: signos vitales en mono, legibles en una línea.
3. **RecordTimeline**: línea de tiempo de consultas (SOAP) ordenada cronológicamente.
4. **AlertBadge**: alertas clínicas reales (vacuna por vencer, alergia registrada) con color de estado.
5. **PatientCard**: ficha compacta de paciente con ID en mono.
6. **DocumentExport**: acciones de exportar PDF/DOCX/Excel.

## Movimiento

- `MOTION 4`: entradas suaves (opacity + y), transición entre vistas, micro-hover en controles.
- `prefers-reduced-motion`: todo colapsa a estático.
