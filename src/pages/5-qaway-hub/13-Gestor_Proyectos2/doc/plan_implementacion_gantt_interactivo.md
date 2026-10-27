# Plan de Implementación: Gantt Maestro Interactivo de Alta Gama (Qaway Lab)

## 1. Alcance y Archivos de Trabajo
* **Módulo:** Cronograma Gantt Maestro (Perspectiva Coordinador General).
* **Ruta y Slug Canónico:** `/hub/gestor_proyecto/cronograma` (con alias `/cronograma`).
* **Archivos Principales:**
  * `src/modules/cronograma-gantt/CronogramaGanttView.tsx` (Lógica interactiva, handlers, estados y celdas editables).
  * `src/modules/cronograma-gantt/gantt.css` (Estilos, resizers, drag-handles, popovers de celda, scroll sticky).
  * `src/types.ts` (Modelos de datos y slugs).
* **Servidor de Desarrollo:** `http://localhost:5174/`

---

## 2. Los 5 Pilares de Transformación Funcional

### Pilar 1: Separadores de Columnas Ajustables (Column Resizing)
* **Objetivo:** Permitir al usuario arrastrar el separador vertical entre cada columna del encabezado de la tabla para personalizar el ancho sin deformar la cuadrícula.
* **Columnas involucradas:**
  1. `Hito Rector / Subproceso Oficial` (Ancho inicial: 380px, mín: 280px).
  2. `Inicio` (Ancho inicial: 95px, mín: 80px).
  3. `Fin` (Ancho inicial: 95px, mín: 80px).
  4. `Duración` (Ancho inicial: 85px, mín: 70px).
  5. `Avance` (Ancho inicial: 120px, mín: 90px).
  6. `Estado` (Ancho inicial: 105px, mín: 90px).
  7. `Timeline Gantt` (Ancho dinámico `minmax(360px, 1fr)`).
* **Implementación:**
  * Estado `colWidths: Record<string, number>`.
  * Manillar `<div className="col-resizer" onMouseDown={...} />` al borde derecho de cada `th` / header div.
  * Captura de `mousemove` y `mouseup` globales con cursor `col-resize` y límites `Math.max(minWidth, newWidth)`.
  * Actualización en tiempo real de `gridTemplateColumns` sobre `.table-head` y cada `.row`.

---

### Pilar 2: Scroll Controlado (Viewport Inteligente)
* **Objetivo:** El scroll vertical no debe perder la barra de filtros ni la cabecera. Al deslizarse hacia abajo, los filtros y la cabecera de la tabla se anclan de manera fija (`position: sticky`), o la tabla interna cuenta con un contenedor con scroll propio delimitado (`max-height: calc(100vh - 360px); overflow-y: auto`).
* **Implementación:**
  * La sección de pestañas y filtros (`.filters`, `.tabs`) se mantiene visible arriba.
  * La cabecera `.table-head` permanece sticky (`top: 0`, `z-index: 10`).
  * Solo se desplazan verticalmente las filas de datos, garantizando que el usuario nunca pierda la referencia temporal del cronograma.

---

### Pilar 3: Línea de Tiempo "Hoy" Dinámica y Matemática
* **Objetivo:** La línea vertical roja de seguimiento temporal debe reflejar la fecha actual (o la fecha de corte seleccionada) con exactitud milimétrica dentro de la escala temporal visual.
* **Implementación:**
  * Cálculo dinámico:
    $$\text{posPercent} = \frac{\text{CurrentDate} - \text{TimelineStart}}{\text{TimelineEnd} - \text{TimelineStart}} \times 100$$
  * Sincronización con el ancho dinámico del área fija de la tabla:
    `left: calc(var(--table-fixed-width) + (100% - var(--table-fixed-width)) * (posPercent / 100))`
  * Actualización automática de `var(--table-fixed-width)` sumando los anchos actuales de las 6 columnas redimensionables.

---

### Pilar 4: Filtros y Escalas Temporales 100% Operativos
* **Objetivo:** Hacer funcionales todos los controles de la barra superior que actualmente son estáticos.
* **Controles a energizar:**
  * **Buscador:** Filtro reactivo en tiempo real por texto (código o nombre).
  * **Región / Macro:** Filtra elementos asignados a la región elegida (*Junín, Loreto, Huancavelica, Pasco, Cusco*).
  * **Gestor Territorial:** Filtra por gestor responsable (*Carlos Mendoza, María Salazar, Lucía Ramos, Javier Ruiz*).
  * **Estado:** Filtra por estado de cumplimiento (*Cumple, En curso, En proceso, Con retraso, Pendiente*).
  * **Tipo:** Filtra por nivel (*Hitos* o *Subprocesos*).
  * **Rango de Fechas (`01 sep. 2026 – 30 abr. 2027`):** Selector de rango funcional que acota la visualización de actividades dentro del período.
  * **Escala Temporal (*Día / Semana / Mes / Trimestre*):** Conmuta la granularidad del grid superior de meses y la densidad de las barras del Gantt.
  * **Botón Limpiar:** Resetea todos los filtros a sus valores predeterminados de forma instantánea.

---

### Pilar 5: Edición Directa en Celda (Tablero Interactivo tipo Monday / Notion / ClickUp)
* **Objetivo:** Convertir la tabla en un tablero operativo donde el usuario modifique los datos directamente en la celda sin abrir obligatoriamente el panel lateral.
* **Interacciones por Celda:**
  1. **Celda Nombre:** Doble clic o clic en lápiz abre input inline para editar el nombre del hito/subproceso (guarda con `Enter` o `onBlur`).
  2. **Celda Inicio / Fin:** Clic abre selector de fecha emergente (`<input type="date">` popup estilizado). Al cambiar la fecha, se recalculan automáticamente la **Duración** y la posición/longitud de la barra en el Gantt.
  3. **Celda Duración:** Al cambiar inicio/fin se actualiza automáticamente; si se edita directamente la cantidad de días, se recalcula la fecha de fin sumando los días a la fecha de inicio.
  4. **Celda Avance:** Clic abre popover con input numérico o slider de 0% a 100% con guardado inmediato.
  5. **Celda Estado:** Clic en la pastilla de estado abre dropdown flotante rápido con las opciones oficiales (*Cumple, En curso, En proceso, Con retraso, Pendiente*) con cambio a 1 clic.
  6. **Panel Lateral de Detalle:** Se desvincula del clic general de la fila. Solo se abre mediante un botón dedicado de *"Ver Detalle / Info"* (`PanelRightOpen` o `MoreHorizontal`) ubicado al final de la celda o en hover de la fila.

---

## 3. Protocolo de Calidad y Candado Visual
* **Prohibición absoluta:** No tocar colores base (Slate-50 / Navy `#19283b`), no destruir la jerarquía tipográfica aprobada (`Inter` 14px / 18px), no alterar el diseño de otros módulos ni de la barra lateral.
* **Compatibilidad Keep-Alive:** Mantener el montaje en DOM del lienzo (`qm-pane` / `qm-pane-active`) sin parpadeos.
