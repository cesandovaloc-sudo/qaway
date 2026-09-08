# AGENTS.md — Agenda (Qaway Lab)

App independiente. Patrón: 2-qawaylab-academy. Portable y vendible por separado.

## Stack
- React 19 · Vite 8 · Tailwind v4 (CSS-first, @theme en src/index.css) · React Router 7
- Supabase (auth + postgres + storage); lógica server-side en Edge Functions
- framer-motion · lucide-react

## Comandos
- npm run dev (puerto 8500) · npm run build · npm run lint (oxlint)

## Reglas
- No depender de otras apps ni de la web. Conectar solo por enlaces (jamás iframes).
- Estilos únicamente con tokens del @theme; nada de colores hardcodeados.
- Cada app tiene su propio proyecto Supabase y su .env.
- Planificar y pedir aprobación antes de aplicar cambios grandes.
