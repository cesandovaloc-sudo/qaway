# Bitácora: Clonación Exacta de Cronograma Maestro a Módulo Equipo

## Contexto y Alcance
* **Módulo Origen**: Cronograma Maestro real (`src/modules/cronograma-gantt`), el cual contiene toda la arquitectura de alta gama:
  - Header institucional de proyecto.
  - Tarjetas métricas KPI de colores (Azul, Verde, Naranja, Rojo, Circular).
  - Pestañas de filtros por píldoras (*Todos*, *Hitos*, *Subprocesos*, *En proceso*, etc.).
  - Toolbar completa (Buscador, Ubicación, selector Hoy, escalas Día/Semana/Mes/Trimestre, rango de fechas).
  - Vistas conmutables (**Gantt**, **Lista**, **Kanban**, **Calendario**).
  - Tabla interactiva con columnas calibradas, avatares, estados y motor `useTableEngine`.
  - Panel lateral de inspección derecho (Drawer).
  - Estilos de alta fidelidad contenidos en `gantt.css` bajo el scope `.gantt-v2`.
* **Módulo Destino**: `src/modules/equipo/`.

## Acciones Realizadas
1. **Reemplazo y Clonación Completa**:
   - Se removió el prototipo territorial anterior.
   - Se copió literalmente la carpeta completa `src/modules/cronograma-gantt` a `src/modules/equipo`:
     * `EquipoView.tsx` (duplicado de `CronogramaGanttView.tsx`)
     * `CronogramaListaView.tsx`
     * `CronogramaKanbanView.tsx`
     * `CronogramaCalendarioView.tsx`
     * `gantt.css`
     * `scheduleMetrics.ts`
2. **Integración en Shell Maestro (`App.tsx`)**:
   - Conectado a la pestaña **Equipo** del Sidebar (`active === 'usuarios'`).
   - Envuelto con la clase de contenedor oficial `.gantt-v2 qm-pane-active` para heredar el 100% de la hoja de estilos y dimensiones.
   - Pasadas las props `activeProject` y `onActions`.
3. **Verificación Técnica**:
   - TypeScript: 0 errores (`npx tsc --noEmit`).
