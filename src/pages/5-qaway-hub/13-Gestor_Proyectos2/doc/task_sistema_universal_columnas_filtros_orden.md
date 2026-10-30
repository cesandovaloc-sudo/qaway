# TASK · Sistema Universal de Columnas, Filtros y Ordenamiento (Gawey)

Estado: **PLANIFICADO — pendiente de "aplica"** (cambio estructural, multi-archivo).
Candado visual vigente: no alterar identidad visual, tamaños, layout ni responsive.

---

## 0. Diagnóstico del código actual (verificado)

| Hallazgo | Evidencia |
|---|---|
| Solo el **Cronograma Gantt** tiene encabezados interactivos (`th-col-header`, `th-actions`, `th-filter-popover`). | `CronogramaGanttView.tsx` ~L3150-3280, `gantt.css` ~L1716-1780 |
| Columnas hardcodeadas: `ColKey = name\|start\|end\|duration\|progress\|status\|gestor\|region`, con `CANONICAL_COLS`, `DEFAULT_COLS`, `MIN_COLS`, `ALL_COL_META`. No hay definición de tipo ni capacidades. | L73, L433-468 |
| Cada `<th>` está copiado a mano (ocultar + resizer repetidos). Solo **Avance** tiene filtro de columna, con 3 presets fijos que escriben en `customRules`. | L3189-3281 |
| Filtros duplicados en 3 mecanismos: estados sueltos (`stateFilter`, `typeFilter`, `regionFilter`, `gestorFilter`, `phaseFilter`), `customRules {field, op, val}` (solo `val` string, un único valor) y rango de fechas global. | L1474-1518, L2014-2125 |
| Motor de filtrado inline dentro de un `useMemo` de 110 líneas, mezclado con jerarquía (colapso de ancestros) y pestañas. | L2014-2125 |
| **No existe ordenamiento** en el Gantt (orden = orden de `items`, árbol hito → subproceso). | búsqueda `sort` sin resultados en la vista |
| Hay **jerarquía** (hito > subproceso > sub-subproceso). Filtrar/ordenar debe respetar el árbol. | L2054-2064 |
| `priority` ('Alta/Media/Baja') existe solo en el formulario de nueva tarea del Gantt, no como columna del cronograma. No existe columna "Tipo" como tal (hay `kind`: hito/subproceso). | L1033, L5944 |
| Otras tablas son `<table>` estáticas sin filtro/orden: Actas (2), Reporteador, Resumen, Usuarios/Equipo. Reuniones filtra con estados sueltos y `.sort` fijo por fecha. Tareas usa tablero. Hitos, Sedes y Configuración sin tabla detectada. | grep en `src/modules/*` |
| Ya existe `ExcelFilterOption` / `ExcelFilterPopoverProps` (~L734-740 de `CronogramaGanttView.tsx`): **revisar y reutilizar como base** del `MultiSelectPicker` (T5) antes de crear uno nuevo. | L734-740 |
| No hay librería de tablas/virtualización instalada (solo React 19, lucide-react; vitest disponible en la raíz del repo). | `package.json` |
| Cada módulo está en un único `.tsx` grande (Gantt: 6205 líneas) con su propio CSS. | listado de archivos |

---

## 1. Puntos que FALTAN definir (confirmar antes de "aplica")

1. **Alcance de la Fase 1.** Propuesta: construir el núcleo + migrar **Cronograma Gantt** primero (única tabla con encabezados interactivos), luego Actas, Equipo, Reporteador, Resumen y Reuniones en fases. ¿Se acepta, o se desea todo en una sola entrega?
2. **Módulos inexistentes como tabla:** *Gestión de contratos* y *Sedes de supervisión* no tienen tabla hoy (Sedes es otra vista). ¿Qué vista corresponde o se difiere?
3. **Columnas del ejemplo (Sección 13) que no existen en el Gantt:** *Código* (hoy fusionado con Nombre), *Tipo* (hoy `kind`), *Responsable* (hoy `gestor`, con múltiples), *Prioridad* (solo en tareas). ¿Se agregan como columnas nuevas, y con qué datos de origen para prioridad?
4. **Jerarquía vs. ordenamiento:** ¿Ordenar dentro de cada nivel manteniendo hijos bajo su padre (recomendado) o aplanar la lista al ordenar?
5. **Jerarquía vs. filtrado:** si un subproceso coincide pero su hito no, ¿se muestra el hito padre como contexto (recomendado) o se oculta?
6. **Persistencia:** ¿guardar filtros/orden por usuario y módulo en `localStorage` (consistente con visibilidad/anchos de columna actuales)? ¿Se reflejan en la URL?
7. **Configuración editable por el usuario:** el orden personalizado de estados/prioridades, ¿se edita desde Configuración (`ConfiguracionView`) o queda en código por ahora?
8. **Convivencia con filtros existentes:** barra superior (Región, Gestor, Estado, Tipo, Fechas) y panel "Filtros avanzados" (`customRules`). Propuesta: unificarlos sobre el nuevo motor, conservando su apariencia, y migrar `customRules` al nuevo modelo sin cambiar el aspecto.
9. **Zona horaria/fechas:** formato interno (ISO `YYYY-MM-DD`) y semana ISO lunes-domingo para "esta semana". Confirmar.
10. **Relación (Hito padre, sede):** ¿filtra por nombre visible o por ID? Propuesta: ID interno y etiqueta visible.
11. **Pruebas:** autorización para añadir tests unitarios (vitest) del motor puro. La regla pide no ejecutar builds salvo orden explícita; se ejecutaría solo `vitest` del motor si se aprueba.
12. **Accesibilidad:** menú de encabezado con teclado (Esc, flechas, foco) y `aria-*`. Propuesta: incluir.
13. **Fuera de alcance explícito:** nuevos estilos, edición de datos desde el menú, creación de columnas por el usuario final (la arquitectura lo permitirá después).

---

## 2. Arquitectura propuesta (carpeta nueva, sin tocar módulos existentes salvo integración)

```
src/shared/table-engine/
  types.ts              # ColumnType, ColumnDef, FilterState, SortCriterion, operadores
  columnTypes/          # un archivo por tipo, registrados en un registro
    text.ts select.ts multiSelect.ts person.ts date.ts dateRange.ts
    number.ts percent.ts processState.ts relation.ts boolean.ts
    index.ts            # registerColumnType() / getColumnType()
  filterEngine.ts       # función pura: applyFilters(rows, columns, filters)
  sortEngine.ts         # función pura: applySort(rows, columns, criteria, {hierarchy})
  useTableEngine.ts     # hook: estado de filtros/orden, persistencia, memoización
  components/
    ColumnHeaderMenu.tsx        # menú que interpreta la ColumnDef
    MultiSelectPicker.tsx       # estilo Excel, búsqueda, virtualizado
    FilterControls/             # Text, Number, Percent, Date, Boolean
    SortSummary.tsx             # orden multi-criterio con prioridad
    ActiveFiltersBar.tsx        # indicadores + "Limpiar todos"
  tableEngine.css       # SOLO reutiliza clases/tokens existentes (th-filter-popover, filter-item-btn…)
```

Modelo de columna:

```ts
type ColumnDef<Row> = {
  id: string; label: string;
  type: ColumnTypeId;              // 'text' | 'select' | ... extensible
  accessor: (row: Row) => unknown;
  options?: { value: string; label: string; order?: number; color?: string }[]
         | ((rows: Row[]) => Option[]);          // opciones dinámicas
  sortable?: boolean; filterable?: boolean; searchable?: boolean; multiple?: boolean;
  sortOrder?: string[];            // orden personalizado (prioridad, flujo de estados)
  filterOps?: OperatorId[];        // restringe operadores del tipo
  format?: ...;                    // visualización (se conserva la barra de progreso actual)
};
```

Cada `ColumnType` declara: operadores de filtro válidos, controles UI, comparador de orden, etiquetas de orden (A–Z, Antigua→Reciente, Menor→Mayor, “según flujo”), normalización de vacíos y serialización.

---

## 3. Tareas (ejecutar en orden, verificar cada una)

### T1 · Núcleo de tipos y registro
- [ ] `types.ts`, registro de tipos extensible.
- [ ] Tipos iniciales: texto, selección, selección múltiple, persona, fecha, rango de fechas, número, porcentaje, estado de proceso, relación, booleano.
- [ ] Operadores por tipo exactamente como la especificación (secciones 4.A–4.G).

### T2 · Motor de filtrado (puro)
- [ ] Regla: valores dentro de una columna = OR; entre columnas = AND.
- [ ] Soporte de exclusión, vacíos, "sin asignar", rangos, presets de fecha relativos (hoy, ayer, mañana, semana, mes, trimestre, año).
- [ ] Índice previo de valores únicos por columna para listas de cientos de valores y miles de filas (una sola pasada, memoizado).
- [ ] Integración con jerarquía (decisión punto 1.5).

### T3 · Motor de ordenamiento (puro)
- [ ] Comparador por tipo; orden personalizado vía `sortOrder` (Crítica>Alta>Media>Baja, flujo de estados).
- [ ] Multi-criterio con prioridad, reordenar y eliminar criterios; ordenamiento estable.
- [ ] Respeto del árbol (decisión punto 1.4).

### T4 · Hook `useTableEngine`
- [ ] Estado de filtros, orden y búsqueda; derivados memoizados; limpiar por columna y global.
- [ ] Persistencia opcional por `tableId` (decisión 1.6).

### T5 · Componentes visuales
- [ ] `ColumnHeaderMenu`: abre directo con acciones, **sin título "Filtrar por X"**; orden: ordenar asc/desc → filtros → buscador → selección múltiple → condiciones → limpiar.
- [ ] `MultiSelectPicker`: seleccionar/desmarcar todos, búsqueda que conserva selección, excluir, contador discreto, Aplicar/Cancelar, renderizado en ventana (sin librería nueva, o con aprobación).
- [ ] Controles de condiciones (texto, número, porcentaje, fecha con selector y rango, booleano).
- [ ] Indicadores en encabezado: filtro activo y orden activo **visualmente distintos**; botón "Limpiar todos".
- [ ] Reutilizar clases y tokens existentes (Slate/Navy, `th-action-btn`, `th-filter-popover`, `filter-item-btn`). Cero estilos nuevos que alteren apariencia.
- [ ] Posicionamiento del popover sin desbordar (<480px y <768px), curvas `cubic-bezier(0.16,1,0.3,1)`.

### T6 · Integración en Cronograma Gantt (piloto)
- [ ] Definir `ColumnDef[]`: Nombre/Código, Tipo, Inicio, Fin, Duración, Avance, Estado, Responsable, Región (+ Prioridad si se aprueba 1.3).
- [ ] Reemplazar los `<th>` copiados por un render a partir de definiciones, conservando resize, ocultar y `grid-template-columns`.
- [ ] Migrar `stateFilter/typeFilter/regionFilter/gestorFilter` y `customRules` al motor sin cambiar su UI. Conservar `search`, `tab`, `phaseFilter` y rango oficial de fechas como filtros de contexto.
- [ ] Verificar que keep-alive, Gantt, barras y colapso jerárquico siguen idénticos.

### T7 · Migración al resto de módulos (fases posteriores)
- [ ] Actas (2 tablas), Equipo/Usuarios, Reporteador, Resumen, Reuniones (Lista), y Contratos/Sedes según 1.2.
- [ ] Cada módulo solo aporta sus `ColumnDef[]`.

### T8 · Verificación
- [ ] Tests unitarios del motor (OR/AND, vacíos, orden personalizado, multi-orden, fechas relativas, 5.000 filas) si se aprueba 1.11.
- [ ] Auditoría móvil <480px y <768px, teclado y foco.
- [ ] Revisión visual contra el diseño actual (antes/después) bajo el candado visual.
- [ ] Rendimiento: lista de 500 valores únicos y 5.000 filas sin bloqueo.

### T9 · Documentación
- [ ] Actualizar `agents.md` con el sistema de columnas y cómo registrar un tipo nuevo.
- [ ] Registrar iteración en `doc/` (bitácora).

---

## 4. Riesgos
- `CronogramaGanttView.tsx` (6.2k líneas): editar por bloques acotados, sin refactor ajeno.
- Doble fuente de verdad durante la migración de filtros: mitigada migrando por columna con prueba visual.
- Filtrado con jerarquía puede ocultar contexto: depende de la decisión 1.5.

## 5. Criterios de aceptación
- Ninguna columna tiene lógica de filtro propia: todo sale de su `ColumnDef`.
- Agregar un tipo nuevo no requiere tocar módulos.
- Sin títulos redundantes en menús; sin opciones sin sentido para el tipo.
- Apariencia idéntica a la actual salvo los nuevos indicadores discretos.
