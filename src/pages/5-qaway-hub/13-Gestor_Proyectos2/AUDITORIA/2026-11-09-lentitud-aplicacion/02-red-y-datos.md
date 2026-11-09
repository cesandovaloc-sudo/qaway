# Fase 2 — Red y datos

## Estado

COMPLETADA — red inspeccionada en la aplicación real mediante la sesión persistente del navegador.

Fecha de ejecución: 2026-11-09

## Objetivo

Determinar si la demora proviene de peticiones HTTP, Supabase, consultas duplicadas, payload excesivo, ausencia de límites, timeouts o procesamiento posterior de datos.

## Actividades

- Identificar todas las peticiones realizadas durante el flujo.
- Medir duración, estado, tamaño y orden de cada petición.
- Identificar tabla, endpoint o servicio responsable.
- Contar filas y tamaño de respuesta.
- Detectar peticiones duplicadas o en cascada.
- Confirmar si existen timeout, cancelación, cache y deduplicación.

## Entregable

Determinación de red/datos con petición responsable y mediciones.

## Evidencia de red real

Se inspeccionaron las peticiones registradas durante la carga real de:

```text
http://localhost:5174/hub/gestor_proyectos/proyecto/sedes
```

La aplicación terminó en:

```text
http://localhost:5174/gestor_proyectos/sedes
```

Todas las peticiones Supabase observadas devolvieron HTTP 200. No se detectó un error HTTP de Supabase como causa del retraso.

## Peticiones identificadas

### Cronograma

```text
GET /rest/v1/gestor_cronograma_items
    ?select=*
    &project_id=eq.p1
    &limit=15000
```

Resultado medido:

```text
2 solicitudes observadas
973 ms en la primera
1,347 ms en la segunda
HTTP 200
content-range: 0-999/*
```

La consulta solicita `select=*` y declara un límite de 15.000, aunque la respuesta observada está limitada por el rango del servidor a 1.000 filas en esa respuesta.

### Unidades

```text
GET /rest/v1/gestor_unidades
    ?select=*
    &order=name.asc
```

Resultado medido:

```text
2 solicitudes observadas
1,090 ms en la primera
1,568 ms en la segunda
HTTP 200
content-range: 0-250/*
```

La consulta descarga todas las columnas (`select=*`), no filtra por proyecto ni tenant en la solicitud observada y devuelve hasta 251 unidades según el rango reportado.

### Proyectos

```text
GET /rest/v1/gestor_proyectos
    ?select=*
    &order=created_at.asc
```

Resultado medido:

```text
2 solicitudes observadas
281 ms en la primera
488 ms en la segunda
HTTP 200
content-range: 0-0/*
```

La respuesta observada contiene un solo registro según el rango `0-0`.

## Correlación con el código

Se confirmó en el código que:

1. `App.tsx` ejecuta `listGestorProjects(gestorTenantId)` en un `useEffect` de montaje.
2. `listGestorProjects` utiliza `select('*')` sin cache ni deduplicación.
3. `CronogramaGanttView` ejecuta `listGestorUnits(null)` en un `useEffect` de montaje.
4. La consulta de unidades utiliza `select('*')` sin filtro de proyecto y sin timeout/cancelación.
5. Existe una caché de resultado para unidades (`UNIDADES_REMOTAS`), pero no existe una promesa compartida para impedir que dos montajes simultáneos disparen dos solicitudes antes de llenar la caché.
6. La consulta de cronograma utiliza `select('*')` y `limit(15000)`.

## Determinaciones confirmadas

```text
1. Hay duplicación real: dos solicitudes de cada recurso durante la carga observada.
2. La duplicación no es un error HTTP: las seis respuestas observadas fueron 200.
3. Las consultas descargan todas las columnas mediante select=*.
4. La consulta de unidades no está filtrada por proyecto ni tenant en la petición observada.
5. La consulta de cronograma permite hasta 15.000 filas por solicitud.
6. No se confirmó todavía el tamaño exacto del payload porque el navegador reportó transferSize=0 para esas respuestas; no se inventa ese dato.
7. No se puede atribuir todavía toda la demora de 14.459 ms únicamente a Supabase: las peticiones observadas duran entre 281 ms y 1.568 ms, por lo que la fase 3 debe medir el trabajo de JavaScript, montaje y carga de chunks.
```

## Causa de la duplicación

La duplicación está confirmada, pero su origen exacto todavía no se declara como hecho. El código demuestra que hay efectos de montaje independientes para proyectos y unidades, y que la caché de unidades no deduplica solicitudes pendientes. La identificación del componente que monta cada instancia durante el flujo queda para la Fase 3.

## Archivos revisados

```text
src/App.tsx
src/services/gestorProjectService.ts
src/services/gestorOrganizacionService.ts
src/services/gestorCronogramaService.ts
src/modules/cronograma-gantt/CronogramaGanttView.tsx
```

## Archivos modificados

```text
Ninguno de la aplicación.
Solo se actualizó este registro de auditoría.
```

## Decisión para la siguiente fase

Continuar con la **Fase 3 — Bundle, React y renderizado** para determinar qué montajes y chunks generan la duplicación y qué trabajo ocurre durante los aproximadamente 12,6 segundos posteriores a `DOMContentLoaded`. No aplicar correcciones todavía.
