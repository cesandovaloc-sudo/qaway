/**
 * Set de iconos del bloque de beneficios.
 *
 * SVG inline a propósito: `@qawaylab/pago` no depende de librerías de iconos
 * (solo tiene peers de React), de modo que el módulo funciona dentro de
 * cualquier host sin arrastrar dependencias. Para añadir un icono, agrega una
 * clave nueva en PATHS y referénciala desde `icon` en lib/benefits.js.
 */
const PATHS = {
  headset: (
    <>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 14h3v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M20 14h-3v5a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1z" />
    </>
  ),
  bolt: <path d="M13 2 4.5 13.5H11l-1 8.5L19.5 10H13z" />,
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5z" />
      <path d="m3 13 9 5 9-5" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 5 6v5c0 4.5 3 8.5 7 10 4-1.5 7-5.5 7-10V6z" />
      <path d="m9 12 2 2 4-4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
      <path d="m6.6 6.6 2.1 2.1M15.3 15.3l2.1 2.1M17.4 6.6l-2.1 2.1M8.7 15.3l-2.1 2.1" />
    </>
  ),
}

export default function BenefitIcon({ name, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name] || PATHS.spark}
    </svg>
  )
}
