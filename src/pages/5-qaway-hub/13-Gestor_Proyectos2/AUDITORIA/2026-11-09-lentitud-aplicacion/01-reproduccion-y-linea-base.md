# Fase 1 — Reproducción y línea base

## Estado

COMPLETADA — reproducción realizada con la aplicación real mediante navegador Chromium.

Fecha de ejecución: 2026-11-09

## Objetivo

Reproducir la lentitud en la aplicación real y establecer una línea base medible antes de revisar o modificar código.

## Actividades

- Abrir la URL afectada en navegador.
- Medir carga en primera visita.
- Medir segunda visita.
- Medir navegación desde otros paneles.
- Repetir el flujo al menos tres veces.
- Registrar tiempos de inicio, primer contenido útil y disponibilidad interactiva.
- Guardar screenshots y evidencia del estado visible.

## Entregable

Tabla de tiempos reproducibles y definición exacta del flujo lento.

## Evidencia de ejecución real

Flujo ejecutado:

```text
1. Abrir http://localhost:5174/hub/gestor_proyectos/proyecto/sedes
2. Observar la URL efectiva y el estado de la aplicación.
3. Registrar la navegación, recursos y peticiones de red del navegador.
```

La aplicación redirigió la URL a:

```text
http://localhost:5174/gestor_proyectos/sedes
```

Título observado:

```text
Reuniones · Qaway Gestor de Proyectos
```

## Mediciones capturadas

Medición de navegación del navegador:

```text
responseEnd:       17.8 ms
DOMContentLoaded:  1,855.3 ms
loadEventEnd:      14,459.1 ms
```

Peticiones Supabase observadas al final de la carga:

```text
gestor_cronograma_items?select=*&project_id=eq.p1&limit=15000  — 2 peticiones
gestor_unidades?select=*&order=name.asc                         — 2 peticiones
gestor_proyectos?select=*&order=created_at.asc                  — 2 peticiones
```

Duraciones observadas individualmente:

```text
gestor_cronograma_items: 973.3 ms y 1,347.4 ms
gestor_unidades:         1,089.4 ms y 1,568.3 ms
gestor_proyectos:          280.6 ms y   488.1 ms
```

## Determinación de esta fase

La demora es reproducible en la aplicación real: la carga completa del documento terminó aproximadamente a los **14.46 segundos**.

También queda demostrado que durante la carga se ejecutan **dos solicitudes de cada uno** de estos recursos:

- Cronograma.
- Unidades.
- Proyectos.

Esto es un hecho medido, no una hipótesis. La causa exacta de la duplicación y el tiempo de trabajo entre `DOMContentLoaded` y `loadEventEnd` se determinará en las fases 2 y 3.

## Errores observados

```text
favicon.ico — HTTP 404
```

Este error no explica los 14.46 segundos medidos.

## Evidencias generadas

```text
C:\Users\csand\AppData\Local\Temp\opencode\auditoria-sedes-snapshot-2.md
Registro de red obtenido desde la sesión persistente del navegador Playwright.
Registro de consola obtenido desde la sesión persistente del navegador Playwright.
```

## Archivos modificados

```text
Ninguno de la aplicación.
Solo se actualizó este registro de auditoría.
```

## Decisión para la siguiente fase

Continuar con la **Fase 2 — Red y datos** para identificar qué componentes disparan las solicitudes duplicadas, cuántas filas/payload se transfieren y qué servicio inicia cada petición. No aplicar correcciones todavía.
