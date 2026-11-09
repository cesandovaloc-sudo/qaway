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

---

# RESULTADO DE LA APLICACIÓN — P3 (autorizada) — 09-11-2026

**Autorización:** usuario: "has un commit total y luego aplica p3". Commit realizado primero: **391 (9c719e0e)** con todo el trabajo en vuelo incluido (mis fixes + cambios en vivo de otros agentes + eliminación de zips). Luego P3.

## Cambio aplicado (2 toques, `src/App.tsx`)
1. `import SedesView from './modules/sedes/SedesView'` → `const SedesView = lazy(() => import('./modules/sedes/SedesView'))` (mismo patrón que las demás vistas lazy).
2. Su pane keep-alive quedó envuelto con `<Suspense fallback={<ModuleLoadingFallback text="Cargando Sedes…" />}>` (patrón idéntico a los panes de cronograma/reportes2; sin él lazy no compila en React).
*Nota técnica: el bloque del pane tenía una indentación distinta a la mostrada por el lector de archivos; se aplicó por captura de bloque exacto con verificación byte a byte (el fallback quedó con U+2026 correcto).*

## Evidencia de build (mapa de chunks reales, dist/)
| Chunk | Antes de P3 | Después de P3 |
|---|---|---|
| `index-*.js` | **1,241.43 kB** | **623.6 kB (−49.8 %)** |
| `CronogramaGanttView-*.js` (motor) | sin chunk (embebido en index) | **257.1 kB — chunk propio devuelto** |
| `index-*.css` | 275.4 kB | 253.8 kB |
| Tareas2/Reuniones2/Reportes2 `.js` | 292.2 kB c/u | 285.8 kB c/u (+ chunk compartido `gestorOrganizacionService` 290.9 kB que antes venía triplicado dentro de cada clon) |
| Warnings de imports estáticos de Vite | presentes (SedesView → CronogramaGanttView) | **0 — desaparecieron** |

## Evidencia de comportamiento (navegador real)
| Métrica | Antes (tanda 1) | Después |
|---|---|---|
| **Sedes FCP (tibio)** | ~2,600 ms (peor de la app) | **1,176 ms (−55 %)** |
| Proyecto load | variable 0.8–3.5 s | **1,183 ms** |
| Equipo | dcl pesado + 5 s | dcl **277 ms**; load ~5.2 s (dominado por el procesamiento de datos del propio Equipo en dev, no por la carga del bundle) |
| Consola en las 3 rutas | 0 errores (ya con P4) | **0 errores** |
| Petición de red Sedes | — | 2 únicas [200] (proyectos + unidades) |

**Comportamiento visible declarado:** al PRIMER ingreso por sesión a Sedes aparece el "Cargando Sedes…" existente mientras llega su chunk; luego nunca más (keep-alive). El mapa de Leaflet y todo lo demás idéntico.

## Estado final del plan gstack (08)
- ✅ **P1 + P2** dedup + columnas (commit 391) — verificado en red: Equipo 10→4 llamadas, 0 duplicados.
- ✅ **P3** engine fuera del índice — FCP Sedes −55 %, index −50 %, motor con chunk propio, 0 warnings.
- ✅ **P4** favicon — 0 errores de consola en todas las rutas.
- ⏳ **P5** re-medición fría+tibia completa y medición de build de producción — queda como cierre (la dedup y el motor ya mostradas en navegador real; la producción no ha medido nunca y sería la validación objetiva final).
- Pendiente: **commit total 392** a la palabra del usuario.

---

# FASE ESTRUCTURAL DEFINITIVA — F1-F5 (ordenada por el usuario: "ya nada de soluciones pasajeras o parches") — 09-11-2026

## Síntomas del usuario (percepción real, sesión dev)
- Sedes ~4 s · Equipo 6-7 s → "un asco". **La percepción está servida por DEV (5174)**: la medición P5 de producción demostró que ~85 % del coste es infraestructura dev (módulos transformados, lib supabase de 713 KB decodificados, React dev), no producto.

## Evidencia de red que define el trabajo (navegador real, post-P1-P3)
- Cada llamada a Supabase: proyectos 941 ms, cronograma 1,673 ms, unidades 1,572–1,743 ms (la red manda).
- Equipo durable aún: gantt completo con limit=15000 EN PERSPECTIVA EQUIPO (no se usa) + unidades ×2 (dos archivos, dos formas de consulta).

## Cambios estructurales aplicados
| # | Cambio | Archivos |
|---|---|---|
| **F1** | Ruta ÚNICA de unidades: `gestorEquipoService` destruye su consulta propia y consume la promesa compartida de `listGestorUnits` (dedup en vuelo). Se reescribió el archivo completo. | `gestorEquipoService.ts` |
| **F2** | El motor solo descarga el gantt con perspectiva `maestro`: `perspective !== 'maestro'` corta el fetch en equipo y territorial (el cronograma de 6,000 filas voló del módulo Equipo). | `CronogramaGanttView.tsx` + re-espejo 3 clones (394,8xx chars, 0 residuos del nombre original) |
| **F3** | Escritura del respaldo local NO bloqueante: el stringify de ~6,000 filas se pospone al idle del hilo (requestIdleCallback/timeout) en vez de congelar el render final. | `gestorCronogramaService.ts` |
| **F5** | Medición en PRODUCCIÓN (vite build + vite preview 4175) — nunca había existido. | docs |
| **F5b** | Prefetch en la INTENCIÓN: `handleModule` en Sidebar arranca la promesa compartida al clic del módulo (antes de montar el pane); el montaje reutiliza la misma promesa. 10 sitios reemplazados. | `Sidebar.tsx` |
| tipos | `GestorUnitType` incluía 'dre' faltante (la BD sí tiene DRE — el any previo lo tapaba); `SedeFrente.region` requerido facilitado con `''` | `gestorOrganizacionService.ts` |

## Resultados medidos (navegador real)
**Producción (`vite preview`, 4175) — primicias absolutas:**
| Métrica | Valor |
|---|---|
| Sedes carga fría | dcl 453 ms · load **458.5 ms** · FCP 1,772 ms |
| Sedes tibia (recarga) | dcl 39.2 ms · FCP **112 ms** · load **41.5 ms** |
| Equipo carga fría | dcl 484.8 ms · FCP 1,052 ms · load **487.5 ms** · **2 llamadas de datos** (proyectos ×1 + unidades ×1) — **el gantt de 6,000 filas ya no se baja** |
| Consola | 0 errores en rutas medidas |

**DEV (la ventana del usuario, con F1-F3):**
| Métrica | Antes del día | Ahora |
|---|---|---|
| Equipo llamadas de datos | 10 (con duplicados) | **2** |
| Equipo load | 5,032–5,590 ms | **3,845 ms** (el resto es infra desarrollo: lib supabase 713 KB + 14,000+ módulos transformados + React dev) |
| FCP Equipo | ~2.4–2.8 s | **668 ms** |

## Bloqueo externo documentado (NO mío)
`typecheck` = 10 errores en `src/modules/tareas-2/CoordinadorTareasPortadaView.tsx` (9) y `src/modules/tareas-2/Tareas2View.tsx` (1 — llamada con `activeProject` inválida), provenientes del **refactor en vivo de otro agente** (las líneas de error se movían entre corridas; luego se estabilizaron). No se toca su archivo: el commit total previo lo integra cuando su edit converge. Mi ABIAR (servicios/engine/Core-Clonado/resync/prefetch) NO introduce ningún error.

## Prueba auténtica de flujo con prefetch
`vite preview` sigue corriendo en **http://localhost:4175** para verificar producto real: frío ~2 s por primera entrada de módulo (limitado por la respuesta de la BD ~2.0 s, incompresible desde front), ~instantáneo dentro de la sesión (caché de promesa compartida).



