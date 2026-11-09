# Ampliación de auditoría — Proyecto hasta Equipo

## Estado

COMPLETADA — medición realizada con la aplicación real mediante una sesión Chromium independiente.

Fecha: 2026-11-09

## Flujo ejecutado

```text
/hub/gestor_proyectos/proyecto
/hub/gestor_proyectos/proyecto/cronograma
/hub/gestor_proyectos/proyecto/sedes
/hub/gestor_proyectos/proyecto/equipo
```

La aplicación normalizó las rutas al prefijo efectivo `/gestor_proyectos/...`.

## Mediciones de navegación

```text
Proyecto:   DOMContentLoaded 403 ms, load 411 ms
Cronograma: DOMContentLoaded 358 ms, load 366 ms
Sedes:      DOMContentLoaded 878 ms, load 884 ms
Equipo:     DOMContentLoaded 499 ms, load 506 ms
```

Estas mediciones son navegaciones posteriores dentro de una sesión inicializada. No reemplazan la línea base fría de Sedes de 14.459 segundos.

## Peticiones reales observadas

Proyecto disparó dos solicitudes de:

```text
gestor_proyectos?select=*&order=created_at.asc
```

Duraciones observadas: 712 ms y 1.050 ms.

El recorrido de Cronograma mostró solicitudes duplicadas de:

```text
gestor_cronograma_items?select=*&project_id=eq.p1&limit=15000
gestor_unidades?select=*&order=name.asc
```

También se observó una solicitud POST de sincronización de cronograma y solicitudes abortadas durante los cambios de ruta.

En Sedes no se repitió la medición ya documentada. Se conserva la determinación previa de dos solicitudes de cada recurso: cronograma, unidades y proyectos.

En Equipo, la navegación terminó en `/gestor_proyectos/equipo` y se observaron dos solicitudes de proyectos, con duraciones de 334 ms y 634 ms. En el recorrido completo también se observaron:

```text
gestor_cronograma_items?select=*&project_id=eq.p1&limit=15000
gestor_unidades?select=id,name,region,unit_type,metadata&order=id.asc
gestor_unidades?select=*&order=name.asc
```

Se observaron solicitudes abortadas (`net::ERR_ABORTED`) durante cambios de ruta. Esto demuestra trabajo de red iniciado durante una navegación que queda cancelado o compite con la siguiente navegación.

## Chunks y módulos observados hasta Equipo

```text
CronogramaGanttView.tsx        ~1.66 MB decodificados
TareasView.tsx                 ~338 KB
GanttEditorDrawer.tsx          ~388 KB
MapaTerritorialView.tsx        ~182 KB
CronogramaOrganigramaView.tsx  ~156 KB
EquipoDirectorioView.tsx       ~154 KB
EquipoDrawer.tsx               ~132 KB
EquipoExpedienteModal.tsx      ~109 KB
edtPmbokModel.ts               ~129 KB
mineduUnidades.ts              ~150 KB
peru_departamental_simple.json ~140 KB
gantt.css                      ~262 KB
```

## Determinaciones confirmadas

```text
1. El alcance medido cubre Proyecto, Cronograma, Sedes y Equipo.
2. Proyecto dispara dos consultas de proyectos durante el montaje observado.
3. El recorrido hasta Equipo conserva actividad de cronograma y unidades.
4. Se observan solicitudes abortadas al cambiar de ruta.
5. Equipo usa carga diferida en App.tsx, pero los recursos compartidos pesados ya fueron cargados por el recorrido anterior.
6. CronogramaGanttView es el recurso más pesado observado: aproximadamente 1.66 MB decodificados.
7. Equipo tiene subcomponentes de tamaño significativo, pero esta medición no atribuye por sí sola una demora específica a un subcomponente.
8. No se modificó código de la aplicación.
```

## Evidencias

```text
C:\Users\csand\AppData\Local\Temp\opencode\hasta-equipo-real.json
C:\Users\csand\AppData\Local\Temp\opencode\hasta-equipo-requests.txt
```

## Decisión

El alcance solicitado hasta Equipo queda medido. Continuar con la Fase 4 para consolidar causa raíz y plan de corrección, sin repetir las fases ya completadas ni editar código antes de aprobar el plan.
