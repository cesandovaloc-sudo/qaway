# Protocolo de Aislamiento CSS — `5-qaway-hub`

## Objetivo
Encapsular cada aplicación de `src/pages/5-qaway-hub` para que:
1. Conserve **su propio diseño, colores, fuentes y layout** sin alteraciones.
2. **No contamine** a la web principal (`1-qawaylab-web`), ni a las landings (`src/pages/8-landings`), ni a otras apps del Hub.
3. **No sea invadida** por los estilos globales de `src/index.css`.

> **Referencia ya implementada:** `13-Gestor_Proyectos2/src/styles.css` + exclusión en `src/index.css`.

---

## Reglas obligatorias (sin `if` ni parches)

1. **Un solo `@import "tailwindcss";` en toda la web:**
   - Solo `src/index.css` debe tener `@import "tailwindcss";`.
   - Eliminar `@import "tailwindcss";` de las sub-apps del Hub (Vite + `@tailwindcss/vite` ya escanea todos los `.jsx`/`.tsx` del proyecto).
2. **Cero `:root`, `html`, `body` o `*` globales en sub-apps:**
   - Mover cualquier `:root { ... }` a la **clase raíz exclusiva** de esa app (ej. `.actas-root`, `.clinica-root`, `.agenda-root`, `.inventario-root`).
   - Encerrar `body`, `*` y clases genéricas (`.card`, `.btn`, `.sidebar`, `.topbar`, `.panel-title`, etc.) dentro de esa clase raíz.
   - Si una app usa `createPortal(..., document.body)`, incluir la clase del portal junto a la clase raíz para sus variables CSS.
3. **Excluir la clase raíz en `src/index.css`:**
   - Agregar `:not(.mi-app-root):not(.mi-app-root *)` a las reglas globales de `h1`, `h2`, `h3`, `h4` en `src/index.css` (igual que `.academy-app-root`, `.epc-landing`, `.qaway-landing-root` y `.qm-root`).

---

## Archivos detectados para aislar en `5-qaway-hub`

1. **`13-Crador Actas/src/styles.css`** *(Prioridad Alta)*
   - Problema actual: `@import "tailwindcss";`, `:root { font-size: 14px; ... }` (achica `rem` en toda la web), `*{box-sizing:border-box}`, `body{margin:0}`, clases sin prefijo (`.sidebar`, `.topbar`, `.panel-title`).
2. **`10-qawaylab-inventario/src/index.css`**
   - Problema actual: `@import "tailwindcss";`, `:root { --shadow-card, ... }`, `*`, `body`.
3. **`11-gestor-de-proyectos/src/index.css`**
   - Problema actual: `@import "tailwindcss";`, `:root { --shadow-card, ... }`, `*`, `body`.
4. **`6-qawaylab-theme/src/index.css`**
   - Problema actual: `@import "tailwindcss";`, `html`, `body`.
5. **`8-qawaylab-agenda/src/index.css`**
   - Problema actual: `@import "tailwindcss";`, `body`.
6. **`9-qawaylab-clinica/src/index.css`**
   - Problema actual: `@import "tailwindcss";`, `body`.
7. **`5-gestor-de-proyectos/styles/gestor-proyectos.css`**
   - Problema actual: `:root { ... }` global.
8. **`0-Estructuras SaaS/3- Tutorial/qaway-mascota-react/qaway-mascota-react/src/styles.css`**
   - Problema actual: `:root`, `*`, `body` globales.

---

## Verificación final
- Ejecutar `npx vite build` en `1-qawaylab-web` (0 errores).
- Navegar entre una app del Hub y las landings (`/landings/desarrollo-web`, `/landings/sistema-contenido-notion`, `/landings/identidad-visual`) comprobando que ninguna cambia su tipografía, márgenes ni sombras.
