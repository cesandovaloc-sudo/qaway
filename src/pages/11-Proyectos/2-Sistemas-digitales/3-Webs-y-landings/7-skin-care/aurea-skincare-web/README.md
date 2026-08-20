# Auréa — Skincare Botánico

Web editorial/e-commerce de una sola página construida con React + TypeScript + Vite.

## Dirección
- Base visual: editorial botánica, premium, cálida y minimalista.
- Idioma: español.
- Estructura inspirada en la referencia entregada, pero con variaciones de jerarquía, bloques y copy para evitar una réplica literal.
- Assets locales preparados a partir de las referencias visuales entregadas.

## Animación
- `motion` para entradas, hover, cambios de fórmula y microinteracciones.
- Reveal al entrar en viewport.
- Hover en productos, botones e imágenes.
- `prefers-reduced-motion` contemplado.

## Ejecutar

```bash
npm install
npm run dev
```

## Validación

```bash
npm run typecheck
npm run lint
npm run build
```

## Próximo paso
Conectar catálogo, carrito, autenticación y Supabase mediante servicios/adaptadores sin acoplar componentes visuales al backend.
