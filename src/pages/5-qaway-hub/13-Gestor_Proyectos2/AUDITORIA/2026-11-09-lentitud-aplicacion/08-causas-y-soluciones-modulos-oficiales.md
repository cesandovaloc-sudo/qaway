# 08 · Investigación gstack — causas raíz y planteamientos (módulos oficiales)

**Fecha:** 09-11-2026 · **Método:** skill `docs/3-skills/gstack-investigate` (vendida en el repo) — 4 fases: investigar → analizar → hipotetizar → implementar. **Iron Law: no hay fix sin causa raíz.**
**Entrada de evidencia:** `07-evaluacion-velocidad-modulos-oficiales.md` (tanda 1 + verificación), collectors de red del navegador real, y lectura de código (App.tsx, módulos).

## Hipótesis raíz (testables) — Fase 1

### H1 · Equipo = el más lento (load 5.0–5.6 s estable)
**Reproducción (hoy, serial):** 10 peticiones de datos en la ruta:
`gestor_proyectos (select=*) ×2` · `gestor_cronograma_items (select=*, limit=15000) ×2` · `gestor_unidades ×6` (misma consulta ×4 + otra variante ×2).
**Hipótesis raíz:** los efectos de montaje de `CronogramaGanttView` (vista Equipo) y del shell montan fetches duplicados SIN memoria de promesa compartida: cada módulo pide lo mismo por su cuenta; el `load` espera la cola completa incluidos duplicados (patrón gstack: duplicated-fetch / shared-promise ausente).
**Testable:** si se deduplica con promesa compartida por recurso (in-flight + cache por proyecto), la tanda baja a ~5 únicas y el load de Equipo debe caer ~40-50 % (~2.5–3 s primera medición).

### H2 · Sedes = peor pintura (FCP ~2.6 s repetible)
**Código:** `App.tsx:17` importa `SedesView` ESTÁTICAMENTE. `SedesView` es el wrapper territorial que importa `CronogramaGanttView` → el motor completo (view ~386 KB TSX + `gantt.css` 244 KB + drawer 94 KB + subvistas) queda dentro del chunk índice (confirmado por warning de Vite en build).
**Hipótesis raíz:** el índice se engorda con el motor del cronograma por la cadena estática `App → SedesView → CronogramaGanttView` (y el stub de Equipo re-exporta el mismo motor). Primera pintura de Sedes bloquea sobre ese JS/CSS acumulado.
**Testable:** si SedesView pasa a lazy y el motor obtiene su propio chunk, el índice baja y el FCP de Sedes debe acercarse a ~1.0–1.3 s.

### H3 · Proyecto (FCP ~1.1 s bien; load variable 0.8–3.5 s)
**Código/red:** `gestor_cronograma_items?select=*&project_id=eq.p1&limit=15000` ×2 (duplicado persistente tras commits de otros agentes) + payload completo `select=*`.
**Hipótesis raíz:** duplicación de fetch del inventario gantt + payload innecesariamente ancho (todas las columnas) sobre 6,000+ items — el `load` absorbe ambas.
**Testable:** dedup + columnas explícitas → la segunda llamada desaparece y el byteset cae; load estable ~1–1.5 s.

### H4 · Clones (Tareas 2 / Reuniones 2 / Reportes 2): FCP ~1.1–1.2 s, load ~1.35 s
**Código:** literal espejo → +14 recursos y +2,900 KB decodificados por navegación en dev (prod: +292 KB JS cada uno, CSS deduplicado por Rollup).
**Hipótesis raíz:** NO son lentos respecto a Proyecto: el coste extra es el grueso de la literalidad (esperado y aceptado por metodología de clonación). Ningún plan de acción ahora; medición de referencia guardada.

### H5 · Módulos rápidos (Componentes 810 ms, Configuración 825 ms, Actas 1,159 ms, Resumen 1,079 ms)
**Hipótesis:** su coste es mayormente el coste compartido de shell (índice). Beneficiarios pasivos de H2. Sin acciones dedicadas.
Soloerror común persistente: 1 error de consola (favicon 404) en TODAS las rutas — fix trivial pendiente.

## Planteamientos de solución — Fase 4 (REQUIEREN TU AUTORIZACIÓN — nada está aplicado)

| # | Planteamiento | Archivos | Efecto esperado (medible) | Costo |
|---|---|---|---|---|
| P1 | Dedup con promesa compartida por recurso+proyecto en los servicios | `gestorProjectService`, `gestorOrganizacionService`, `gestorCronogramaService` (con timeout ya existente en cronograma) | load Equipo ~5s → ~2.5–3s; desaparecen duplicados ×2/×6 | pequeño; solo servicios (protegidos = avisar) |
| P2 | Columnas explícitas en vez de `select=*` + revisar `limit=15000` | mismos services | byteset −30/50 % en las rutas del gantt | pequeño |
| P3 | `SedesView` lazy en `App.tsx:17` + dynamic import del motor desde el wrapper Equipo | `App.tsx`, `modules/equipo/EquipoView.tsx` | índice −engine; FCP Sedes ~2.6s → ~1.2s; devuelve el chunk propio del motor | pequeño-medio; toca módulos protegidos |
| P4 | Favicon real (error de consola global) | `index.html` del subproyecto | 0 errores de consola | trivial |
| P5 | (Después de P1-P3) re-medición completa fría+tibia del flujo y cierre del plan de Fase 5 | playbook igual al 07 | comparativa antes/después | medición |

## No tocar (protecciones vigentes)
- Contenido/estética de los módulos oficiales; no se reemplaza ni rediseña nada.
- Los clones permanecen literales; sus datos propios llegarán con la adaptación por dominio.

## Verificación prevista (Fase 3 → 4)
Cada fix se verifica con: (1) réplica serial de `requests` = 0 duplicados, (2) misma métrica Performance API del doc 07 (tanda fría + tibia), (3) `typecheck` + `build`, (4) capturas del navegador. Criterio de éxito por fix: mejora objetiva en la métrica del módulo objetivo SIN regresión en los demás (tabla antes/después).

---

# RESULTADO DE LA APLICACIÓN — P1 + P2 + P4 (autorizadas) — 09-11-2026

**Autorización:** el usuario aprobó P1 (dedup servicios) + P2 (columnas explícitas) + P4 (favicon). P3 NO autorizada todavía. **Alcance real:** 4 servicios (`gestorProjectService`, `gestorOrganizacionService`, `gestorCronogramaService` + `gestorEquipoService` — cuarto servicio descubierto como origen de las unidades ×4; su inclusión queda explícitamente declarada aquí) + `index.html`.

## Archivos tocados (6)
| Archivo | Cambio |
|---|---|
| `src/services/gestorProjectService.ts` | dedup en vuelo (`inFlightProjects` Map) + columnas reales + tolerancia al esquema |
| `src/services/gestorOrganizacionService.ts` | dedup ×3 (`units/members/projectUnits`) + columnas reales + tolerancia en members |
| `src/services/gestorCronogramaService.ts` | dedup por proyecto (`inFlightCronograma`) + 25 columnas fijas + re-lectura tolerante select=* (mismo criterio de upsertRows) |
| `src/services/gestorEquipoService.ts` | promesa en vuelo compartida en carga fría (caché TTL de 5 min conservada intacta) |
| `index.html` | favicon SVG embebido (data-URI, marca q sobre #172334) |
| doc 07 / doc 08 | registro |

## Hallazgos durante la aplicación (gstack-browse cazó 2 regresiones potenciales ANTES de llegar al usuario)
1. **Primer intento P2 → 400 real**: la lista explícita incluyó `tenant_id`/`central_unit_id` que **NO existen** en `gestor_proyectos` (confirmado contra `supabase/01_gestor_cronograma.sql`: la tabla real solo tiene id, code, name, region, subtext, budget, sponsor, risk_level, metodologia, created_at, updated_at). La app caía a "modo local". **Fix:** lista ajustada a columnas reales + tolerancia de re-lectura en todos los reads.
2. **Medición "2,424 ms" invalidada**: en esa pasada el read roto devolvía 400 instantáneo sin datos, disparando el `load` antes. Con datos sanos el número honesto es ~4.9 s. **Lección registrada: metricar con datos sanos, no con estados de fallo.**

## Evidencia de red (navegador real, carga fresca, 09-11-2026)
**Equipo — antes vs después:**
| Recurso | Antes | Después |
|---|---|---|
| gestor_proyectos | ×2 (`select=*`) | **×1** (10 columnas reales, 200) |
| gestor_cronograma_items | ×2 (`select=*` limit 15000) | **×1** (25 columnas fijas, 200) |
| gestor_unidades (forma equipo: id,name,region,unit_type,metadata) | ×4 | **×1** (200) |
| gestor_unidades (forma organizacion: 11 columnas) | ×2 | **×1** (200) |
| **TOTAL de llamadas de datos** | **10** | **4** |

**Proyecto — después:** 3 llamadas [200] sin duplicados (antes: proyectos ×2 y cronograma ×2).
**Consola:** 0 errores, 0 warnings en ambas rutas (antes: 1 error favicon 404 en TODAS las rutas + 2 warnings modo-local).
**typecheck + build:** OK (30.32 s).

## Lo que NO se movió (limitación honesta)
`load` de Equipo tibio quedó en **~4.94 s** (línea base 5.03–5.59 s): la mejora es real pero modesta — el grueso del coste restante NO es la duplicación sino el resto del listado de hipótesis: motor completo del cronograma dentro del índice por la cadena estática (`App.tsx:17` → SedesView → CronogramaGanttView) **= P3, pendiente de autorización**, más payload/procesamiento en dev. P5 (re-medición fría+tibia del flujo completo y medición de build producción) queda programada como cierre cuando se decida P3.

## Estado: listo para commit total (a la palabra del usuario) — nada de lo demás pendiente fue alterado (clones intactos, módulos protegidos intactos, otros agentes sin conflictos)

