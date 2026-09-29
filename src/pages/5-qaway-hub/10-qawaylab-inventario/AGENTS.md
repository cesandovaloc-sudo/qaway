# AGENTS.md — QawayLab Inventario

Archivo de inicialización del agente para esta carpeta. Define el alcance, la
arquitectura real verificada en código y las reglas de trabajo.

---

## 1. Alcance y límites

- **Carpeta de trabajo única:** `src/pages/5-qaway-hub/10-qawaylab-inventario/`
- **Repositorio:** `1-qawaylab-web` · **Rama:** `main-web` · **Módulo:** `qawaylab-inventario`
- Esta carpeta es un **proyecto autónomo Vite + React 19 + TypeScript anidado dentro
  del monorepo**. No es una carpeta de rutas del Hub: tiene su propio `package.json`,
  `vite.config.ts`, `tsconfig.*`, `vitest.config.ts` y `node_modules`.
- **No salir de esta carpeta** para trabajar. Los módulos hermanos del Hub
  (`1-qawayLab-CRM`, `2-Agentes`, `8-qawaylab-agenda`, etc.) son territorio de otros
  agentes: solo lectura si una investigación lo exige, nunca edición.
- No crear ramas. No hacer `push` (lo hace un agente específico). No ejecutar
  `reset`, `clean`, `checkout .`, `restore .`, `revert` ni `push --force`.

## 2. Qué es código real y qué es referencia

| Ruta | Naturaleza |
|---|---|
| `src/` | **App que se ejecuta.** Entrada: `src/main.tsx` → `src/App.tsx` |
| `contracts/commerce/` | Contrato de datos versionado `v1` (esquema, tipos, ejemplos) con sus tests |
| `supabase/migrations/` | Migraciones SQL: baseline de inventario, RLS, fiscal, ventas, compras, contabilidad |
| `supabase/functions/consulta-ruc-dni/` | Edge Function (consulta RUC/DNI) |
| `InventarioAppPage.jsx`, `TiendaClientePage.jsx` | Wrappers de entrada del módulo desde el Hub |
| `imagen-diseño/` | **Prototipos de diseño.** No se ejecutan. No son fuente de verdad funcional |
| `docs/` | Documentación de producto ya existente (despliegue, guía de usuario, decisiones) |
| `_docs/` | Bitácoras de implementación previas |
| `doc/` | Bitácora del agente (ver sección 8) |
| `coverage/`, `dist/`, `.gstack/` | Artefactos generados, ignorados por git |

## 3. Stack y comandos

React 19 · TypeScript · Vite 7 · Tailwind CSS v4 (plugin `@tailwindcss/vite`) ·
Supabase JS · react-router-dom 7 · vitest 3 (jsdom, `globals: true`) · oxlint.

Alias: `@` → `./src`. Puerto dev y preview: **9600**.

```bash
npm run dev            # vite --port 9600
npm run build          # tsc -b && vite build
npm run lint           # oxlint .
npm run typecheck      # tsc --noEmit -p tsconfig.app.json
npm run test:run       # vitest run (suite completa)
npm run test:unit      # excluye *.integration.test.ts
npm run test:integration   # requiere credenciales reales en .env.test
npm run test:coverage      # v8, incluye contracts/
```

**Verificación obligatoria antes de dar por cerrado cualquier cambio:**
`npm run typecheck` + `npm run lint` + `npm run test:run` (los tres, sin excepción).

Notas de entorno ya resueltas en la config, no "reparar" sin entender:
- `preserveSymlinks: true` — obligatorio porque la dependencia local
  `@qawaylab/pago` (paquete `file:`, repo hermano) se instala como symlink.
- `server.deps.inline: ['@qawaylab/pago']` en vitest — sin esto Node lanza
  `ERR_UNKNOWN_FILE_EXTENSION` por los `.jsx` internos del paquete.
- `preserveSymlinks` está replicado en `vitest.config.ts` por el mismo motivo.

## 4. Mapa de arquitectura

```
src/
  app/          AppLayout, AppRouter, RequireAuth, RequirePermission, ErrorBoundary
  pages/        páginas por dominio: inventory, sales, purchases, finance, pricing,
                quotations, customers, liquidation, reports, config, raíz (Dashboard,
                Login, Capture, carrito/checkout, catálogo público)
  components/   agrupadas por dominio: products, sales, customers, capture, catalog,
                bundles, liquidation, pricing, quotations, reports, settings, shared,
                header, sidebar, dashboard, checkout
  services/     ÚNICA capa que habla con Supabase (por dominio)
  hooks/        useProducts, useCart, useCustomers, useSales… (estado de datos de página)
  context/      AuthContext, BrandingContext
  lib/          auth, supabaseQuery, postgrestFilters (helpers de consulta/RLS)
  services/adapters/  commerceAdapter, sunatLookupAdapter, supabaseProductAdapter
  services/qawa/      cliente de la API Qawa (orders, payments, products) + .d.ts propios
  config/       supabase, site
  types/        user (roles y permisos), product, index
  utils/        fiscal, formatters, sales, salesExport, excelImport, seo
  test/         setup.ts (globals de test), supabase-test.ts
```

Dependencias hacia abajo: `pages` → `hooks` → `services` → `lib/config` → Supabase.
Nunca al revés.

## 5. Acceso a datos

- `src/services/*` es la **única** capa autorizada para tocar Supabase. Verificado: solo
  `services/`, `lib/`, `context/AuthContext.tsx` y las tres páginas del flujo público
  (`CartPage`, `CheckoutPage`, `GuestAccessPage`) importan `@/config/supabase`.
- **Excepción documentada:** el flujo público (catálogo → carrito → checkout → compras,
  más el acceso por enlace) consulta Supabase desde la página porque no tiene sesión de
  staff ni permisos. Si se toca ese flujo, mantener el patrón.
- `lib/supabaseQuery.ts` y `lib/postgrestFilters.ts` son los helpers compartidos de
  consulta/filtrado: usarlos antes de escribir un `.from()` a mano.
- **El RLS es la segunda barrera, no un detalle.** El modelo de permisos del front
  (`RequirePermission`) y las policies de Postgres deben coincidir. Un permiso que el
  front concede y la migration no, es un bug: se corrige en ambos o en ninguno.
- Toda migración nueva va en `supabase/migrations/` con timestamp `AAAAMMDDHHMMSS_nombre.sql`.

## 6. Rutas y permisos

`src/app/router/AppRouter.tsx` es la única fuente de verdad del árbol de rutas.

- Público (sin `AppLayout`): `login`, `remates/:slug`, `carrito`, `carrito/checkout`,
  `carrito/compras`, `acceso/:token`.
- Protegido por `RequireAuth` + `AppLayout`: el resto.
- Afines por `RequirePermission`: `can_create_products` (nuevo producto),
  `can_view_sales` / `can_create_sales` (ventas), `can_access_fiscal_settings`
  (caja, gastos, contabilidad), `can_access_settings` (configuración, enlaces).
- El mapa de permisos por rol vive en `src/types/user.ts` (`rolePermissions`:
  admin, editor, viewer, guest). **Cualquier permiso nuevo se declara ahí y en el tipo
  `UserPermissions`**, nunca suelto en un componente.
- Existen rutas alias (`/inventario`, `/logistica`, `/compras`, `/nuevo`…) que coexisten
  por enlaces ya emitidos. No borrarlas sin un plan de redirects.

## 7. Convenciones de código

- Imports con alias `@/`. Estilo de comillas dobles en `.tsx` de `app/`, `pages/`;
  respeta el estilo del archivo que edites, no impongas uno nuevo.
- Sin comentarios que narren lo obvio. Un comentario explica el porqué (RLS, symlink,
  workarounds de Supabase) — nunca el qué.
- Tipos explícitos en exports públicos de `services/`, `hooks/` y `types/`.
- Un `__tests__` junto al módulo que prueba; los de integración se nombran
  `*.integration.test.ts` y son opcionales por defecto.
- Lógica de negocio en `services/`, no en el JSX de la página. Si una página supera
  ~400 líneas de lógica, es una señal de que falta un hook o un service.
- Prohibido: parches temporales, parches superficiales y código muerto.
  "Todos son soluciones, nunca parches."

## 8. Documentación del agente

- `doc/` — bitácora de iteración. `doc/.gitignore` excluye lo efímero.
  Nomenclatura: `bitacora_<tema>.md`, `creacion_implementacion_<tema>.md`.
- `doc/` y `_docs/` conviven: `_docs/` es histórico y no se reescribe.
- Toda comunicación y todo plan se acuerdan en el chat con el usuario, no como
  artefactos. Este `AGENTS.md` es el único archivo de onboarding.

## 9. Git

- Nomenclatura de entrega: `<numero>_<hora>_<fecha>_<motivo>`, p. ej.
  `23_19:10_2026-09-28_separacion-interaccion-clic-producto-y-drawer-detalle`.
- Commit solo cuando el cambio esté completo y reportado por el usuario.
- Commits globales: se rastrea todo el proyecto, sin backups ni carpetas duplicadas.
- Los commits existentes son históricos e inmutables. Consultar un commit anterior es
  solo lectura; jamás se revierte el estado para volver a él.
