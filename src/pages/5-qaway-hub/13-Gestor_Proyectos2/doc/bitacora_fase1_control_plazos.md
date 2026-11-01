# Fase 1 · Control de plazos del cronograma (línea base, fecha real, desviación)

**Fecha:** 31-oct-2026 · **Commit:** A315

## Qué se agregó
| Elemento | Dónde |
|---|---|
| Modelo: `baselineStart/End`, `actualStart/End` en cada ítem | `Item` y `GanttItemData` |
| Lógica pura y probada (14 pruebas) | `src/modules/cronograma-gantt/scheduleMetrics.ts` (+ `.test.ts`) |
| Columna **Desviación** (opcional; visible por defecto solo en presets nuevos de Lista) | cabecera, fila, motor de tabla (`number`: filtra y ordena) |
| Columna **Fecha real** (opcional) | cabecera, fila, motor de tabla (`date`) |
| Botón ancla en la barra: fija la línea base solo donde no existe | `freezeBaselines` (deshacible con Ctrl+Z) |
| Bloque "Línea base y cumplimiento" en el panel de detalle | pestaña Información |
| Persistencia | `supabase/02_gestor_cronograma_linea_base.sql` + servicio tolerante al esquema |

## Reglas
- **Línea base:** se fija explícitamente; nunca se pisa en silencio. En el panel se puede actualizar por registro.
- **Fecha real:** el inicio se registra al salir de Pendiente / avanzar; el fin al completar. Al reabrir, el fin real se limpia. Cualquier edición manual se respeta.
- **Desviación (días)** = fin previsto − fin de la línea base.
  - Completado: fin real (o fin vigente si no hay).
  - Abierto y vencido: hoy (crece cada día hasta completar o reprogramar).
  - Abierto y vigente: fin vigente.
  - `+N días` retraso · `0 días` en plazo · `−N días` adelanto · `—` sin línea base.

## Pendiente del usuario
1. Ejecutar `supabase/02_gestor_cronograma_linea_base.sql` en el SQL Editor de Supabase (es idempotente).
   Mientras no se ejecute, la app sigue sincronizando el resto de campos y conserva línea base/fechas reales en el respaldo local.
2. Pulsar el botón ancla de la barra para fijar la línea base de los registros existentes.
3. Activar **Desviación** / **Fecha real** desde el selector de columnas si el layout ya estaba guardado.

## Siguiente
Fase 2: Dependencias (datos, columna con códigos, validación de ciclos).
