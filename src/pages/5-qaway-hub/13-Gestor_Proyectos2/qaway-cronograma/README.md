# Qaway · Cronograma del Proyecto

Módulo independiente de React + TypeScript + Vite + Tailwind CSS 4 + Lucide React, diseñado para acoplarse posteriormente al ecosistema Qaway / HubPro.

## Incluye
- Vistas internas: Estructura, Gantt, Por unidad ejecutora, Hitos, Seguimiento y Matriz.
- Jerarquía flexible: Proyecto → Proceso → Subproceso → Fase → Hito/Actividad. La estructura no obliga a utilizar todos los niveles.
- Filtros combinables por región, unidad ejecutora, nivel, fase, estado y búsqueda.
- Gantt con periodo navegable, escalas de tiempo, barras de avance, estados, selección de elementos y panel contextual.
- Ficha de elemento con descripción, responsable, fechas, entregable y resumen de tareas relacionadas.
- Hitos y entregables, lista de seguimiento, vista comparativa por UGEL y matriz exportable a CSV.
- Formulario para añadir elementos al árbol del cronograma.
- Responsive para escritorio, tablet y móvil. Iconos exclusivamente Lucide React.

## Ejecutar
Requiere Node.js compatible con la versión de Vite seleccionada.

```bash
npm install
npm run dev
```

Validaciones disponibles:

```bash
npm run typecheck
npm run lint
npm run build
```

## Estado de esta entrega
Es un prototipo funcional de interfaz con datos demostrativos y estado en memoria. No está conectado a Supabase ni a otra base de datos; los cambios no sobreviven a una recarga. Los datos de región, UGEL, responsables, fechas, avances y tareas son ilustrativos y deben sustituirse por los registros reales del proyecto.

## Integración prevista
- Mantener el módulo como feature independiente para incorporarlo a la aplicación existente.
- Las actividades del cronograma y las tareas operativas deben ser entidades distintas relacionadas mediante IDs, no duplicados.
- Las tareas independientes no se insertan automáticamente en el cronograma.
- Las tareas derivadas de reuniones/actas conservarán la referencia de origen.
- La actualización del avance agregado y de los hitos requiere reglas de cálculo acordadas y datos reales.
- La edición de fechas, dependencias, calendario laboral, ruta crítica, auditoría persistente y permisos aún no están conectados.
