# Qaway Lab - Editor Web (Theme Studio)

Editor visual para modificar colores, textos, tamanos y estilos de webs desde botones y campos. App independiente, instalable y vendible por separado.

## Stack

React 19 - TypeScript - Vite 8 - Tailwind CSS 4 - React Router 7 - Supabase

## Instalacion

```bash
npm install
cp .env.example .env   # pegar credenciales del proyecto Supabase propio
npm run dev            # http://localhost:6100 (configurable con PORT)
```

## Scripts

```bash
npm run dev        # dev server
npm run typecheck  # tsc --noEmit
npm run lint       # oxlint
npm run build      # tsc --noEmit && vite build
npm run preview    # servidor de preview del build
```

## Variables de entorno

Ver .env.example. La app funciona sin credenciales (sin pantalla blanca) y se conecta a Supabase cuando existen.
