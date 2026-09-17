# app_implementación — Biblioteca

## Iteración 1 — Maqueta visual (2026-09-16)
- Ruta carpeta: `src/pages/5-qaway-hub/biblioteca`
- Archivo: `BibliotecaPage.jsx` — solo maqueta, sin datos reales, sin router, sin tocar diseño existente.
- Propuesta propia aislada: fondo `#0E0E11`, panel `#16161A`, acento lima `#D8FF3E`, tarjetas papel `#F2EFE6`, serif Georgia + mono.
- Bloques: header archivo + buscador mock, filtros Tipo / Funcionalidad / Nicho (estado local visual), grid 6 cards placeholder, paginación mock.
- No se altera `AppRouter.jsx` ni `DESIGN.md`. Pendiente tu `aplica` para cablear ruta y datos.

## Iteración 2 — Cableado ruta (2026-09-16)
- `AppRouter.jsx`: lazy `BibliotecaPage` + ruta `hub/biblioteca` con `renderRoute('hub', ...)`, dentro de `Layout`, sin ProtectedRoute para vista directa en local.
- URL local: `http://localhost:4100/hub/biblioteca`.
- Sin commit, sin push.

## Iteración 3 — Fix blanco (2026-09-16)
- Causa: `lazy + Suspense fallback=null` dejaba blanco si el chunk nuevo fallaba.
- Solución: import estático `BibliotecaPage` en `AppRouter.jsx`, misma ruta `hub/biblioteca`.
- Enlace completo: `http://localhost:4100/hub/biblioteca`.

## Iteración 4 — Seed v2 + conexión (2026-09-16)
- Nuevo `biblioteca.seed.json`: 11 ítems BIB-001…BIB-011, esquema cerrado (tipo, instalacion.metodo, acceso.tipo_key, integraciones, nichos, funcionalidad_corta, caso_uso, estado, prioridad_qaway, tags). Sin URLs inventadas (`url_repo: ""`, estado `por-verificar`). Incluye Hostinger faltante. Corrige `populaidad`.
- `BibliotecaPage.jsx`: mismo diseño, ahora lee seed, buscador activo, filtros Tipo/Skills/Apps/Repos + funcionalidad + nicho en local, contador real, footer por ítem `metodo · key`.
- Lint limpio (solo 2 warnings preexistentes). JSON validado: 11 items.
- Sin commit, sin push.

## Iteración 5 — Taxonomía pareja v3 (2026-09-16)
- Sin tocar diseño ni `BibliotecaPage.jsx`.
- Seed v3: + `costo` (gratis 5, freemium 5, suscripcion 1), + `plataforma[]`, + `nivel`, + `licencia: desconocida` (sin inventar).
- Verificado: gratis = Archify, Omniroute, Omakub, AnyDoc, Grillme. Freemium = Herder, Orca, DeepSeek, Open Montage, Mander. Suscripción = Hostinger.
- JSON validado seed-v3 11/11.

## Iteración 6 — Visualizar categorías (2026-09-16)
- Misma arte, solo texto: filtro `Costo: todos/gratis/freemium/suscripcion` en fila de filtros, card con línea `costo · plataforma · nivel`, footer intacto `metodo · key`.
- Buscador ahora incluye costo/plataforma/nivel. Contador seed-v3.
- Lint limpio. Sin commit, sin push.

## Iteración 7 — Sticky filtros + fix badge (2026-09-16)
- Filtros con tope: `sticky top-0 z-20`, mismo fondo `#0E0E11` + hairline inferior. Da tope al scrollear sin cambiar arte.
- Badge `⌘K` → `Ctrl K` (el glifo se veía como chino según fuente).
- Lint limpio. Sin commit, sin push.

## Iteración 8 — Ficha funcional (2026-09-16)
- `Abrir ficha` ahora es botón: abre modal con ficha completa del seed (instalación, acceso, stack, plataforma/nivel, integraciones+tags, nichos, popularidad, estado, prioridad). Cierra con backdrop o botón. Misma arte papel.
- Para probar: filtra `gratis` o busca `omniroute`, abre ficha BIB-002.
- Lint limpio. Sin commit, sin push.

## Iteración 9 — BIB-012 Symbl.space (2026-09-16)
- Nuevo ítem `BIB-012 symbl-space`: tipo app, Diseño / Test de logos, web sin instalación, gratis sin key, plataforma web, nivel no-code, prioridad alta (branding Qaway).
- Funcionalidad: probar logos en tamaños, fondos, distancia, contraste y legibilidad antes de enviar a cliente.
- Seed v3 total 12, validado. Visible con buscador `symbl` o `logo`, filtro `gratis`. Sin commit, sin push.
