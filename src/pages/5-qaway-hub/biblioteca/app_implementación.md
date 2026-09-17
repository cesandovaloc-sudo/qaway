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

## Iteración 10 — BIB-013 Security Audit Skill (2026-09-16)
- Verificado real: `github.com/cloudflare/security-audit-skill`, MIT, ~6,682 estrellas. Skill agnóstica (Claude Code, Codex, cualquier agente con sub-agentes), 6 fases con validación adversarial + `REPORT.md` + `findings.json`.
- Instalación: `npx skills add https://github.com/cloudflare/security-audit-skill --skill security-audit`. Requiere Node.js para validador.
- Seed v3 total 13, estado `verificado`, costo gratis, prioridad alta. Visible con `seguridad` o `audit`. Sin commit, sin push.

## Iteración 11 — Curso + rutas + alias (2026-09-16)
- Seed v4: + `alias_busqueda[]` en 13/13 + `curso_repo{usar_en_curso, curso, modulo, leccion, orden, rol, prerequisitos, resultado}` en 13/13. En curso: BIB-012 DIA-03 L1 demo, BIB-011 DIA-04 L1 practica, BIB-013 DIA-04 L2 practica.
- Nuevo `curso.seed.json` v1: CUR-001 cero-a-despliegue, 4 días (DIA-01 redes, DIA-02 whatsapp con lecciones por-crear, DIA-03 marca con BIB-012, DIA-04 despliegue con BIB-011+BIB-013).
- Nuevo `rutas.seed.json` v1: RUTA-001 web-de-0-a-produccion, 7 pasos (BIB-007→002→004→006→012→013→011). Ids cruzados validados.
- Página: buscador incluye alias+curso, ficha muestra bloque `Uso en curso`. Misma arte, lint limpio. Sin commit, sin push.

## Iteración 12 — BIB-014 + Destacados (2026-09-16)
- Nuevo `BIB-014 Strands Agents SDK (AWS)`: lib, Infra IA / SDK agentes, pip/npm, gratis Apache 2.0, verificado (~6,984 estrellas), prioridad alta, alias con chatbot/mcp.
- Sección `Destacados — no olvidar` en principal (entre header y filtros): BIB-002 Omniroute + BIB-014 Strands, borde lima, abre ficha. Misma arte.
- Seed v4 total 14, validado. Lint limpio. Sin commit, sin push.

## Iteración 13 — Sin navbar + logo (2026-09-16)
- Ruta `hub/biblioteca` movida fuera de `Layout` (patrón de hub tools): sin navbar ni footer oficial.
- Logo lima arriba (`Link to="/"`) como única salida a la principal. Misma arte.
- Lint limpio (2 warnings preexistentes). Sin commit, sin push.

## Iteración 14 — Títulos simples (2026-09-16)
- Nuevo `nombre_simple` en 14/14 (ej. Omniroute → “IAs gratis para probar”, Strands → “Creador de asistentes con IA”, Security Audit → “Revisión de seguridad automática”).
- Cards, destacados y ficha muestran el simple grande + nombre técnico chico. Buscador lo incluye. Misma arte, lint limpio. Sin commit, sin push.

## Iteración 15 — Navbar fuera real + BIB-015 (2026-09-16)
- Fix real: las rutas estaban dentro del `Layout` (abría en línea 338). Movidas fuera (líneas 340/344, `Layout` en 347). Ahora sí sin navbar. Recarga dura requerida.
- Nuevo `BIB-015 tgrep (Microsoft)`: app CLI Rust, índice trigramas hasta 52x vs ripgrep, cliente/servidor + watcher, lo usa Copilot CLI, MIT ~3.2k estrellas, verificado, gratis, prioridad alta.
- Seed v4 total 15, validado. Lint limpio (2 warnings preexistentes). Sin commit, sin push.
