# cronograma-core — núcleo compartido de la familia v2 (Fase 2)

Fuente única de verdad para el motor del cronograma compartido por la familia
de módulos v2 (`tareas-2`, `reportes-2`, `reuniones-2`, `cronograma-gantt`).

## Regla de oro

Este módulo NO renderiza nada y NO conoce perspectivas: solo contiene
modelos puros, catálogos, tipos y utilidades sin dependencia de React.

## Estado de la desvinculación (commit 424)

| Archivo | Estado |
| --- | --- |
| `edtPmbokModel.ts` | Canonical (copia idéntica de tareas-2). `cronograma-gantt` aún mantiene copia local por WIP en curso del agente EDT — migrar cuando se libere. |
| `regionalCoordinationModel.ts` | Canonical ×4 → shims activos en tareas-2 / reportes-2 / reuniones-2. |
| `sedesCatalogSeeds.ts` | Canonical ×4 → shims activos en tareas-2 / reportes-2 / reuniones-2. |
| `scheduleMetrics.ts` | Canonical ×4 → shims activos en tareas-2 / reportes-2 / reuniones-2. |
| `scheduleMetrics.test.ts` | Canonical único (las copias locales se retiraron). |

## Siguientes pasos acordados (orden interno Fase 2)

1. ✅ Modelos puros + catálogos (este commit).
2. Tipos compartidos (`Item`, `Status`, `Kind`, `WbsNodeType`) — pendiente, viven hoy en las Views (módulos protegidos, migrar post-agente EDT).
3. Drawers (`GanttEditorDrawer`, `GanttElementDetailView`) — pendiente, copias divergen entre módulos: diff fino antes de canonicalizar.
4. Vistas compartidas (`CronogramaLista/Kanban/Calendario/Arbol/Organigrama`) — pendiente, ídem.
5. `gantt.css` (2 copias divergidas 251KB/246KB) — reconciliar antes de canonicalizar.

## Convención de migración

Cada copia local se reemplaza por un shim de una línea
(`export * from '../../cronograma-core/<archivo>';`) para que los imports
relativos existentes de cada módulo sigan funcionando sin tocar las Views
con `@ts-nocheck`.
