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
