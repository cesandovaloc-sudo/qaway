# 07 · Evaluación de velocidad — módulos oficiales (navegador real)

**Fecha:** 09-11-2026 · **Motivo:** comparativa de velocidad post-clonación (Tareas 2, Reuniones 2, Reportes 2)
**Método:** Chromium real (playwright-cli, sesión persistente warm-cache) · Performance API directa.
TTFB / DCL / Load / FCP en ms · recursos y KB reales por navegación directa a cada ruta.
Excluidos por orden del usuario: Tareas, Reuniones, Reportes ("1") y PRUEBAS (oculto).
La suite gstack no está instalada en este entterno (solo skills SEO en .codex); se aplicó el estándar equivalente navegador real + Performance API.

## Tanda 1 (10 módulos)

| Módulo | TTFB | DCL | Load | FCP | Recursos | KB red | KB decod |
|---|---|---|---|---|---|---|---|
| Resumen | 21 | 760 | 1,079 | 1,392 | 78 | 9,271 | 9,260 |
| Proyecto | 9 | 520 | 3,508 | 1,116 | 83 | 9,271 | 9,260 |
| Sedes | 9 | 494 | 2,507 | 2,644 | 80 | 9,271 | 9,260 |
| Componentes | 9 | 453 | 810 | 844 | 83 | 9,271 | 9,260 |
| Equipo | 8 | 488 | 5,590 | 2,580 | 87 | 9,275 | 9,264 |
| Actas | 8 | 474 | 1,159 | 1,068 | 82 | 9,271 | 9,260 |
| Configuración | 8 | 491 | 825 | 944 | 80 | 9,549 | 9,538 |
| Tareas 2 | 9 | 415 | 1,324 | 1,116 | 94 | 12,174 | 12,159 |
| Reuniones 2 | 8 | 485 | 1,380 | 1,180 | 94 | 12,182 | 12,168 |
| Reportes 2 | 10 | 472 | 1,376 | 1,188 | 94 | 12,179 | 12,165 |

## Tanda 2 (verificación de los 3 más lentos)

| Módulo | Load | FCP | DCL | ¿Estable? |
|---|---|---|---|---|
| Equipo | 5,032 | 2,364 | 461 | SÍ — ~5 s repetible |
| Proyecto | 804 | 1,032 | 450 | FCP estable; la tanda 1 (3,508) fue un pico de datos |
| Sedes | 2,495 | 2,604 | 426 | SÍ — FCP ~2.6 s repetible (peor pintura) |

## Determinaciones medidas

1. **Equipo es el módulo más lento** (load ~5.0–5.6 s estable; su evento load espera los fetch de Supabase).
2. **Sedes tiene la peor pintura** (FCP ~2.6 s estable).
3. **Proyecto** pinta especie ~1.1 s; el load varía 0.8–3.5 s según los datos del cronograma.
4. **Los 3 clones** (Tareas 2 / Reuniones 2 / Reportes 2) cost~ idéntico entre sí: FCP ~1.1–1.2 s, load ~1.35 s, **+14 recursos y +2,900 KB decodificados por navegación** vs módulos base (coste de la duplicación literal en dev; sin minificar).
5. **Más rápidos:** Componentes (810 ms load), Configuración (825 ms), Actas (1,159 ms).
6. **Costo base de CUALQUIER navegación directa:** ~9.3 MB decodificados (dev, sin minificar) — el shell completo se sirve en cada ruta en dev.
7. 1 error de consola persistente en todas las rutas (favicon 404, ya identificado en 02).

## Límites de la medición

- 1 muestra por módulo + verificación de los 3 lentos (2da tanda). Dev server Vite/HMR (sin minificar): los KB en producción serán menores.
- Sesión warm-cache (comparable entre módulos; la condición cold użytkowana en Fase 1 ya está documentada).
