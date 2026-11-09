# Fase 4 — Causa raíz y plan de corrección

## Estado

COMPLETADA PARA EL ALCANCE PROYECTO → CRONOGRAMA → SEDES → EQUIPO

Fecha de consolidación: 2026-11-09

## Objetivo

Consolidar la evidencia de las fases anteriores y decidir una corrección mínima, aislada y verificable.

## Actividades

- Separar hechos medidos de hipótesis descartadas.
- Identificar la causa raíz principal.
- Identificar causas secundarias, si existen.
- Definir archivos permitidos para la corrección.
- Definir archivos protegidos.
- Establecer métrica objetivo y criterio de no regresión.
- Esperar autorización antes de editar código.

## Entregable

Plan de corrección aprobado o bloqueo documentado si la evidencia es insuficiente.

## Alcance

Esta Fase 4 consolida únicamente las mediciones realizadas con la aplicación real hasta Equipo. No se extrapola el resultado a módulos posteriores.

## Hechos medidos

1. La línea base fría registrada en Fase 1 terminó aproximadamente en 14,459 ms.
2. Se observaron dos solicitudes de `gestor_proyectos`, dos de `gestor_cronograma_items` y dos de `gestor_unidades`.
3. Las peticiones observadas respondieron HTTP 200.
4. Las consultas usan `select=*`.
5. La consulta de cronograma permite `limit=15000`.
6. La consulta de unidades observada no incluye filtro de proyecto ni tenant.
7. Durante los cambios de ruta hasta Equipo se observaron solicitudes abortadas.
8. `CronogramaGanttView.tsx` se observó con aproximadamente 1.66 MB decodificados.
9. `SedesView` importa de forma estática el mapa territorial y el CSS del cronograma.
10. La navegación hasta Equipo cargó recursos compartidos del cronograma y recursos propios de Equipo.

## Causa raíz principal confirmada

La causa principal confirmada para este alcance es trabajo duplicado y carga compartida pesada durante el montaje/navegación del shell:

```text
montaje de módulos compartidos
→ efectos independientes de proyectos, cronograma y unidades
→ consultas repetidas sin deduplicación de solicitudes pendientes
→ carga/evaluación de un motor de cronograma de aproximadamente 1.66 MB
→ recursos compartidos cargados antes o durante la llegada a Equipo
```

No se atribuye toda la demora a una sola petición ni a `Suspense`.

## Causas secundarias confirmadas

- Consultas con `select=*`.
- Consulta de cronograma con límite potencial de 15.000 filas.
- Consulta de unidades sin filtro de proyecto/tenant en el flujo observado.
- Caché de unidades sin promesa compartida para solicitudes simultáneas.
- Importación eager de Sedes y del mapa territorial.
- Keep-Alive que conserva módulos montados, sin demostrar que todos sus efectos costosos estén pausados.
- Cambios de ruta con solicitudes abortadas.

## Hipótesis no confirmadas

No se confirmó que `Suspense`, `lazy`, el mapa o un subcomponente específico de Equipo sean por sí solos responsables de los 14.459 ms.

## Plan de corrección propuesto

1. Crear promesas compartidas por recurso para deduplicar proyectos, unidades y cronograma.
2. Reemplazar `select=*` por columnas explícitas después de verificar consumidores.
3. Mantener bajo demanda los módulos pesados y cargar mapa, drawers y vistas secundarias solo al necesitarlos.
4. Verificar `isActive`, cancelación y limpieza de efectos al cambiar de ruta.
5. Repetir en navegador frío y caliente el flujo Proyecto → Cronograma → Sedes → Equipo.

## Archivos permitidos inicialmente

```text
src/services/gestorProjectService.ts
src/services/gestorOrganizacionService.ts
src/services/gestorCronogramaService.ts
```

## Archivos protegidos

```text
src/modules/cronograma-gantt/**
src/modules/sedes/**
src/modules/equipo/**
src/App.tsx
src/components/Sidebar.tsx
src/components/Topbar.tsx
src/styles/**
```

No se permite sustituir vistas ni rediseñar módulos como parte de la corrección de rendimiento.

## Métricas objetivo

```text
1. Eliminar solicitudes duplicadas durante un mismo montaje.
2. Mantener HTTP 200 y contenido funcional equivalente.
3. Reducir de forma demostrable la línea base fría de 14.459 ms.
4. No introducir solicitudes abortadas causadas por la corrección.
5. No cambiar apariencia ni interacciones de Proyecto, Cronograma, Sedes o Equipo.
6. typecheck y build sin errores.
```

## Decisión

La causa raíz y el plan quedan determinados para Proyecto hasta Equipo. No se modificó código y no se aplica ninguna corrección sin autorización explícita del usuario.
