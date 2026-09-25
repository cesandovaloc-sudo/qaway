---
target: Qaway Hub panel admin (HubPanelPage shell + 9 paneles HubSuper)
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
p2_count: 2
timestamp: 2026-09-25T01-15-31Z
slug: src-pages-5-qaway-hub-hubpanelpage-jsx
---
# Impeccable Critique — Qaway Hub (Panel Admin) — 2026-09-24

Method: dual-agent (A: ses_f29e6179dffebeOg4mPq2FVkkf · B: ses_f29e5f637ffeucoEtZIuv2s7tS)

## Design Health Score

| # | Heurística | Score | Problema clave |
|---|-----------|-------|----------------|
| 1 | Visibilidad del estado del sistema | 2 | Paginación y selects decorativos (sin onClick/onChange); footer "Mostrando X de Y" miente |
| 2 | Coincidencia sistema/mundo real | 3 | Etiquetas en español correctas, pero estados falsos y jerga sin glosario |
| 3 | Control y libertad del usuario | 2 | Filtros que cambian estado silenciosamente; sin borrar filtros visible; sin undo |
| 4 | Consistencia y estándares | 1 | 12 clases de tamaño de título, 5 recetas de botón primario, 18 naranjas/ámbar, 13 radios, paneles encapsulados en contenedor propio |
| 5 | Prevención de errores | 2 | ErrorBoundary presente, pero controles falsos y sin validación visible |
| 6 | Reconocimiento vs recuerdo | 3 | Nav icono+etiqueta; estado de filtro solo vía tooltip |
| 7 | Flexibilidad y eficiencia | 1 | Sin atajos; selección masiva decorativa bloquea batch |
| 8 | Estética y diseño minimalista | 2 | Multi-grids KPI; Reportes isla inline; exceso de naranjas |
| 9 | Recuperación de errores | 2 | ErrorBoundary con acciones; fallos silenciosos de controles falsos |
| 10 | Ayuda y documentación | 1 | Sin ayuda contextual ni docs |
| **Total** | | **20/40** | **Acceptable (borde inferior)** |

## Design Specificity Verdict

**LLM**: shell autorado para Qaway (naranja #ff4b0b, zinc oscuro, badges editoriales, gradientes por pilar); módulos intercambiables de categoría (cards genéricas slate/zinc); ReportesPanel isla 100% inline. **Detector**: 111 hallazgos, 79% (88) en HubSuperReportesPanel.jsx:263-286 (radios px 5/7/8/9/12/13, Inter, ~13 hexes). **Overlays**: no disponibles (browser no expuesto), fallback none.

## Overall Impression

Shell con carácter propio y secciones funcionales reales, pero construido módulo a módulo sin sistema de diseño: cada pantalla inventa escala tipográfica, receta de botón y naranja. Mayor oportunidad: escala de títulos única, una sola receta de botón primario y re-centralizar tokens de color.

## What's Working

1. Shell estructuralmente coherente: nav por roles, app switcher, ErrorBoundary con recuperación (HubPanelPage:28-60,94-141).
2. Identidad de marca en superficies clave: gradientes de pilar y naranja #ff4b0b (HubPanelPage:373, :293).
3. Estados idle/loading/error razonables en listados (Empresas/Users/Support).

## Priority Issues

0. **[P1] Paneles encapsulados en contenedor propio** (no viven como página sobre el lienzo maestro `#fafafa` p-6 max-w-1300, sino como caja anidada). Correctos: Inicio, Empresas (`:362`), Usuarios (`:601`). Encapsulados: Aplicaciones (`bg-[#f8f8f7]` :398), Planes (`#f8f9fb`+`main 1500` :630,651), Pagos (`zinc-50`+`main` :447-448), Suscripciones (`#f8f9fb`+`main 1480` :467-468), Soporte (`#f8f9fb`+`main 1500` :282-283), Mi cuenta (`#f8f9fb`+`main 1500` :229-230), Configuración (`#f7f8fa`+sidebar doble :323,379,429), Reportes (`background:#fff;padding:28px` :261-263). Fix: roots transparentes sin `<main>`/`max-w` propios. Comando: `$impeccable layout`.

1. **[P1] Jerarquía de títulos rota**: h1 en 3 familias (`text-2xl md:text-3xl` vs `text-[29px]` vs `text-[28px] slate-900`); títulos de sección en text-sm/lg/[14px]/[15px]/[12px]; 12 clases; colores zinc/slate/gray. Fix: escala única h1/h2/h3. Comando: `$impeccable typeset`.
2. **[P1] Botón primario 5 recetas + 5 hover-oranges**: estructuralmente distintos (h-10/h-9/h-11, px-4/px-5, rounded-lg/xl, text-xs/sm, text-[11px]/[12px]), hover #eb4207/#e94308/#e94309/#e94408/#f04406; doble receta en un mismo archivo (Users:313 vs :635). Fix: componente Button único. Comando: `$impeccable polish`.
3. **[P1] Controles decorativos con apariencia viva**: paginación sin handlers (Pagos:742-767, Planes:757-763, Support:461-485), footers que mienten (Planes:755, Support:458), selects sin onChange (Support:489-493, Reportes:357), checkbox tabla Users decorativos (:803-807,:850-854). Fix: implementar o quitar. Comando: `$impeccable audit`.
4. **[P2] ReportesPanel isla de diseño**: 0 Tailwind semántico, 100% inline (263-286), Inter, radios px, 13 hexes, naranjas de gráfico fuera de token; KPI text-3xl vs text-2xl. Fix: migrar a DS + MetricCard compartido. Comando: `$impeccable layout`.
5. **[P2] Deriva de token de color**: 18 naranjas/ámbar, segundo acento saturado (indigo/purple) contra DS, 6+ fondos de página casi-blancos (#fafafa/#f8f9fb/#f7f8fa/#f8f8f7), cards p-6 vs p-4. Detalle por zona: FABs indigo→purple (IA, HubPanelPage.jsx:1790) y #ff4b0b→#ff8c00 (Chatbot, :1793); widget Planes #f97316/#3b82f6/#eab308 (:426,:535,:630); app cards #fe6612 (3: ROUTES 69,70,72) y #191918 (WABA :74); badges rol semáforo UsersModule:64-67; chips KPI multicolor; canvas por módulo. Fix: tokens unificados. Comando: `$impeccable colorize`.
6. **[P3] Contraste gray-on-color**: Aplicaciones:909, Support:373. Fix: subir a zinc-800/900.
7. **[P3] Estados/artefactos**: Filtros cíclico sin pressed (Empresas), timezone duplicado ×3 (Profile:361), labels text-[10px], tabs text-[10px tracking-0.12em], font-serif ×3, badges mixtos. Fix: aria-pressed + dedupe + tamaños mínimos.

## Persona Red Flags

**Alex**: sin atajos; selección masiva decorativa bloquea batch; paginación/selects muertos rompen confianza. **Sam**: encabezados sub-16px, text-[10px] en tabs/headers, gray-on-color, estado de filtro solo tooltip (no ARIA). **Riley**: footers "X de Y" falsos, controles aparentemente vivos que no responden, filtro cíclico sin feedback.

## Minor Observations

- Config MetricCard sparkline text-orange-500 en superficie slate (143-147).
- Aplicaciones KPI text-3xl vs resto text-2xl (213 vs 253).
- 7 tabs toplevel Config (109-117), 5 Support (140-146) — >4 opciones.
- Section-title split 3-way; eyebrow tracking inconsistente.
- Support reutiliza paleta de prioridad para status (rojo/azul/verde).

## Questions to Consider

- ¿El panel debe leerse como "producto Qaway" (editorial, naranja ácido) o "administración neutra"?
- ¿Vale la pena el shell oscuro con 5 fondos casi-blancos internos distintos?
- ¿Qué vería un admin en "Reportes" — hoy es la pantalla más inconsistente?

## Run Notes (snapshot)

- Slug: src-pages-5-qaway-hub-hubpanelpage-jsx; ignore list vacía.
- Assessments independientes (dual-agent): A y B aislados.
- Detector CLI: 111 hallazgos exit 2; salida stdout, sin archivos en repo; temp scripts de B eliminados.
- Browser: no disponible (fallback none); sin live-server.
- Config DS: .impeccable/design.json; sin config.json.
