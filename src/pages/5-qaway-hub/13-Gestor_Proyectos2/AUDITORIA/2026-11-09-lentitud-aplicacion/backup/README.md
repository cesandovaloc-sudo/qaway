# Auditoría de rendimiento de la aplicación

## Fecha

2026-11-09

## Motivo

Determinar con mediciones reales por qué determinados paneles de la aplicación presentan demoras de carga o navegación, evitando suposiciones y cambios no demostrados.

## Alcance

- Aplicación Gestor de Proyectos.
- Carga inicial.
- Navegación entre paneles.
- Peticiones de red y Supabase.
- Descarga de bundles y chunks.
- Tiempo de ejecución de JavaScript.
- Renderizado React y montaje de componentes.
- Estados de carga, Keep-Alive, lazy loading y Suspense.
- Rendimiento visual únicamente cuando existan evidencias de bloqueo de renderizado o FPS.

## Regla de trabajo

No se corregirá ningún archivo hasta identificar y registrar la causa con evidencia reproducible. Cada fase se ejecutará en orden y se documentará al terminar.

## Alcance ejecutado hasta esta entrega

La auditoría se ejecutó con la aplicación real, desde Proyecto y avanzando en orden hasta Equipo:

```text
Proyecto → Cronograma → Sedes → Equipo
```

No se repitieron las mediciones ya registradas de Sedes. Se conservaron las evidencias de las Fases 1–3 y se amplió la medición real a Proyecto, Cronograma y Equipo.

## Estado general

```text
FASES 1–3 COMPLETADAS PARA EL ALCANCE PROYECTO → EQUIPO

Fase 4 pendiente de consolidación y aprobación del plan.
```

## Herramientas y skills previstas

1. `gstack-browse`: reproducir el problema usando la aplicación real.
2. `gstack-investigate`: determinar la causa raíz.
3. `react-best-practices`: contrastar la implementación técnica.
4. `gstack-qa`: aplicar una corrección autorizada y verificarla.
5. `gsap-performance`: solo si las mediciones demuestran un problema de animación o FPS.

## Regla de documentación por fase

Al finalizar cada fase se actualizará su archivo correspondiente con:

- Fecha y hora.
- Estado: completada, bloqueada o no aplicable.
- Flujo exacto reproducido.
- Mediciones obtenidas.
- Evidencias generadas.
- Determinación confirmada.
- Archivos revisados o modificados.
- Decisión para la siguiente fase.

No se avanzará a la siguiente fase sin dejar registrada la anterior.
