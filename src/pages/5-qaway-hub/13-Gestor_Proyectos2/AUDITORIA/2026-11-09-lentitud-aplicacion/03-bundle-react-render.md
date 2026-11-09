# Fase 3 — Bundle, React y renderizado

## Estado

COMPLETADA — bundle, módulos cargados y estado de renderizado inspeccionados usando la aplicación real en navegador Chromium.

Fecha de ejecución: 2026-11-09

## Objetivo

Determinar si la demora ocurre en la descarga de JavaScript, evaluación del bundle, montaje de componentes, efectos, re-renderizados o pintado inicial.

## Actividades

- Revisar chunks descargados en el flujo.
- Confirmar qué módulos se cargan antes de ser visitados.
- Medir montaje y renderizado.
- Detectar componentes pesados montados innecesariamente.
- Revisar lazy, Suspense, Keep-Alive e `isActive` con evidencia.
- Detectar efectos duplicados y trabajo en paneles ocultos.

## Entregable

Determinación técnica del coste de bundle, React o renderizado.

## Evidencia real del navegador

La sesión persistente del navegador registró recursos de desarrollo Vite/HMR. Por ese motivo los tiempos de red de módulos `.tsx` no representan un build de producción; sí permiten identificar qué módulos se solicitan y cuáles son cargados durante el flujo.

Recurso pesado observado:

```text
CronogramaGanttView.tsx
decodedBodySize: aproximadamente 1.66 MB
transferSize: aproximadamente 1.66 MB en una de las cargas observadas
```

Otros recursos relevantes observados:

```text
edtPmbokModel.ts             decodedBodySize: aproximadamente 129 KB
CronogramaOrganigramaView.tsx                         156 KB
sedesCatalogSeeds.ts                                      150 KB
MapaTerritorialView.tsx                                  182 KB
GanttEditorDrawer.tsx                                    388 KB
TareasView.tsx                                           338 KB
```

La aplicación también solicitó durante la sesión recursos de módulos y estilos que no corresponden a la pantalla mínima de un directorio ligero, incluyendo componentes del cronograma y archivos del equipo.

## Correlación confirmada con el código

Se confirmó lo siguiente:

1. `App.tsx` importa `SedesView` de forma estática:

```tsx
import SedesView from './modules/sedes/SedesView';
```

2. `SedesView.tsx` importa de forma estática:

```tsx
import MapaTerritorialView from './MapaTerritorialView';
import '../cronograma-gantt/gantt.css';
```

3. `App.tsx` mantiene `CronogramaGanttView` como carga diferida, pero el flujo real solicita su módulo pesado porque la aplicación mantiene/monta la perspectiva de cronograma en el canvas según el estado de navegación y los módulos visitados.

4. El recurso `CronogramaGanttView.tsx` se observó con aproximadamente 1.66 MB decodificados. Esto es una determinación de peso del módulo en el entorno real de desarrollo, no una estimación.

5. El Keep-Alive conserva paneles montados después de visitarlos. Por tanto, conservar el estado no equivale a detener la evaluación, efectos o recursos ya cargados.

6. `CronogramaGanttView` ejecuta un efecto para cargar unidades remotas al montarse. La existencia de una variable de resultado (`UNIDADES_REMOTAS`) no evita dos solicitudes simultáneas pendientes.

## Mediciones de navegación observadas

En una evaluación posterior de la misma sesión, el navegador reportó:

```text
DOMContentLoaded: aproximadamente 794 ms
loadEventEnd:      aproximadamente 799 ms
```

Esta medición ocurrió con módulos ya calientes/HMR y no sustituye la línea base fría de la Fase 1:

```text
Carga completa en línea base fría: aproximadamente 14.459 s
```

La diferencia demuestra que el coste depende del estado de caché/sesión; no autoriza a afirmar que la carga fría esté resuelta.

## Determinaciones confirmadas

```text
1. Existe un módulo de cronograma de aproximadamente 1.66 MB decodificados.
2. Sedes se importa de forma eager y no usa lazy en App.tsx.
3. El mapa territorial se importa de forma eager desde SedesView, aunque la vista del mapa se selecciona condicionalmente.
4. El CSS pesado del cronograma se importa directamente desde SedesView.
5. La aplicación utiliza Keep-Alive, pero Keep-Alive no impide que los módulos montados ejecuten efectos.
6. La medición caliente de aproximadamente 0.8 s no invalida la medición fría de 14.459 s.
7. No se puede atribuir todo el tiempo frío únicamente al render React: la evidencia confirma coste de módulos y efectos, pero el reparto exacto requiere profiling de CPU/Performance adicional.
```

## Hipótesis descartadas como determinación

No se declara que `Suspense` sea la causa principal. Tampoco se declara que `lazy` por sí solo explique los 14.459 segundos. La evidencia disponible demuestra carga eager, módulos pesados y ejecución de efectos; la causa raíz final se decide en la Fase 4 después de correlacionar las fases 1–3.

## Archivos revisados

```text
src/App.tsx
src/modules/sedes/SedesView.tsx
src/modules/cronograma-gantt/CronogramaGanttView.tsx
src/modules/cronograma-gantt/GanttEditorDrawer.tsx
src/modules/sedes/MapaTerritorialView.tsx
```

## Archivos modificados

```text
Ninguno de la aplicación.
Solo se actualizó este registro de auditoría.
```

## Decisión para la siguiente fase

Continuar con la **Fase 4 — Causa raíz y plan**. Allí se consolidarán los hechos medidos, se separarán causas principales y secundarias, y se definirá una corrección mínima con archivos protegidos y métricas objetivo. No aplicar correcciones todavía.
