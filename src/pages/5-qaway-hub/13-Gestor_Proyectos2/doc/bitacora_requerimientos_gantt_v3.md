# Bitácora y Requerimientos de Corrección · Cronograma Gantt (MINEDU 2027)

**Fecha:** 30 de Octubre de 2026  
**Módulo:** Gestor de Proyectos 2 · Qaway Lab (`/hub/gestor_proyecto/cronograma`)  
**Documento:** Requerimientos solicitados por usuario, diagnóstico de fallas y plan de ejecución.

---

## 1. Lista Detallada de Requerimientos del Usuario

### A. Reubicación del Botón Colapsador de Columnas
* **Solicitud:** El botón que colapsa las columnas secundarias para dejar solo la columna principal y el gráfico Gantt (`PanelLeftClose` / `PanelLeftOpen`) debe estar **al borde derecho absoluto de la cabecera `Hito / Subproceso`**, justo antes de la línea divisoria vertical con la columna `Inicio`.
* **Falla visual detectada:** Actualmente permanecía agrupado junto a los demás iconos en medio de la cabecera.

### B. Corrección de Texto Recortado y Espacio Vacío Enorme en Filas de Nombre
* **Solicitud:** El nombre del hito o subproceso debe mostrarse lo más completo posible en su celda. Actualmente se recorta prematuramente (ej: *"Planificación de la ..."*, *"Gestión de Almac..."*) dejando un espacio vacío enorme a la derecha de la celda de cada fila.
* **Comportamiento solicitado:** El nombre debe ocupar todo el ancho disponible y solo recortarse al pasar el cursor o cuando se muestren las acciones de fila.

### C. Eliminación del Botón de Flechas Opuestas (`ArrowLeftRight`)
* **Solicitud:** Eliminar el botón de flechas opuestas (`cols-reset-btn`) de la cabecera de la columna principal, ya que sobrecarga la barra y sus funciones están cubiertas por el colapsador general y la configuración de columnas.

### D. Corrección Definitiva del Redimensionador de la Columna "Duración"
* **Solicitud:** Al arrastrar el borde divisor de la columna "Duración" para ampliar o reducir su ancho, debe alterar única y exclusivamente el ancho de "Duración" y no de otra columna adyacente.
* **Causa técnica diagnosticada:** Desalineamiento entre el orden de claves en `visibleCols` (que cambiaba su orden al ocultar/mostrar) y las pistas del CSS Grid `gridTemplateColumns`.

### E. Popover de Filtro Fiel al Estándar Real de Excel
* **Solicitud:** El filtro de columna debe replicar exactamente la estructura del menú contextual de Excel proporcionada en la imagen de referencia:
  1. **Acciones de Ordenamiento:** `Ordenar de A a Z` y `Ordenar de Z a A` (o de Menor a Mayor en números/fechas).
  2. **Acción de Limpieza:** `Borrar filtro de "[Columna]"`.
  3. **Caja de Búsqueda:** Input rectangular con placeholder `"Buscar"`.
  4. **Lista de Selección Scrolleable:**
     * `[x] (Seleccionar todo)`
     * Lista de opciones únicas con checkboxes individuales.
  5. **Botones de Pie:**
     * Botón `ACEPTAR` (Aplica los checkboxes seleccionados y filtra la tabla).
     * Botón `Cancelar` (Cierra el menú sin alterar los filtros).

---

## 2. Diagnóstico Técnico de Causas Raíz

| Elemento | Causa Raíz en Código | Solución Técnica |
| :--- | :--- | :--- |
| **Colapsador de panel** | El botón estaba anidado dentro de `.head-col-actions`. | Extraer el botón fuera de `.head-col-actions`, posicionándolo con `margin-left: auto; margin-right: 0;` en `.name-head`. |
| **Espacio vacío en nombres** | `.quick-row-actions` tenía `display: inline-flex; opacity: 0;` en estado de reposo, reservando 120px fijos que obligaban al texto a truncarse con ellipsis. | Modificar `.quick-row-actions` para que en reposo esté oculto (`display: none` o posicionado absolutamente con `position: absolute; right: 6px;`). |
| **Botón de flechas** | Botón `<ArrowLeftRight />` presente en JSX. | Remover el elemento del JSX de cabecera. |
| **Columna Duración** | `visibleCols` mutaba su orden al ocultar/mostrar (`[...prev, key]`), desfasando los índices del `gridTemplateColumns` respecto al DOM. | Normalizar el cálculo con `CANONICAL_COLS` inmutable, garantizando concordancia 1:1 entre track de grid y resizer. |
| **Filtro tipo Excel** | Popover anterior no incluía opciones de ordenamiento A-Z/Z-A ni la disposición visual del estándar Excel. | Rediseñar el componente `ExcelFilterPopover` con la botonera A-Z, Z-A, input de búsqueda, lista con scroll y botones `ACEPTAR` / `Cancelar`. |

---

## 3. Estado de Archivos
* **Archivos a intervenir tras confirmación:**
  * `src/modules/cronograma-gantt/CronogramaGanttView.tsx`
  * `src/modules/cronograma-gantt/gantt.css`

---

## 4. Iteración A323: Calibración de Ubicación, Chips de Nivel y Blindaje de Color Azul en Hitos

### Requerimientos abordados:
1. **Nomenclatura y Jerarquía Territorial Universal (`Región`, `Distrito`, `Sede`)**:
   - Reemplazo de terminología rígida `"Zona / Frente"` por `"Ubicación"` en la barra de filtros y metadata.
   - Sincronización con las regiones reales del proyecto (`Junín`, `Loreto`, `Huancavelica`, `Lima Provincias`, `Multi-región / Nacional`).
   - Propagación reactiva de `regionFilter` hacia `CronogramaCalendarioView`.

2. **Calibración y Proporción de Chips Rápidos de Nivel Jerárquico**:
   - Reemplazo de botones redondeados a 999px que rompían a dos filas por una grilla técnica en una sola fila `display: grid; grid-template-columns: 1fr 1fr 1.15fr; gap: 6px;`.
   - Altura compacta calibrada a `25px`, radio de borde `6px`, fuente `11px`, etiquetas concisas (`Todos`, `Solo Hitos`, `Subprocesos`).

3. **Blindaje de Color Azul Oficial en Hitos Rectores (Vista Calendario)**:
   - Diagnóstico: Conflicto de especificidad en CSS donde `.cal-gantt-bar.bar-progress` (declarado después) sobreescribía a `.cal-gantt-bar.bar-major` dejando la barra en naranja.
   - Solución: En `CronogramaCalendarioView.tsx`, si `ev.kind === 'hito'`, la clase asignada es estrictamente `bar-major`. En `gantt.css`, se blindó `.cal-gantt-bar.bar-major` con degradado azul `#0052cc` ➔ `#0066ff` y diamante `◆`.

---

## 5. Iteración A325: Restauración de Cápsulas Nativas de Gantt, Multi-selección de Regiones y Encabezados Adaptables

### Requerimientos abordados:
1. **Restauración de Cápsulas Nativas de Gantt**:
   - Eliminación del botón y popover artificial `NIVEL / TIPO` de la barra de herramientas inferior.
   - Reincorporación de las cápsulas oficiales en la botonera superior de pestañas:
     `[ Todos (36) ]  [ Hitos (9) ]  [ Subprocesos (27) ]  [ En proceso (3) ]  [ Con retraso (0) ]  [ Completados (3) ]`.
   - Filtrado instantáneo a un solo clic con contadores vivos de entregables y línea azul activa.

2. **Filtro Multi-Región con Árbol Territorial en Cascada**:
   - Selector multirregión con checkboxes individuales que permite seleccionar una, varias o todas las regiones concurrentemente (`selectedRegions: string[]`).
   - Mapeo territorial coherente con expansión interactiva:
     - Junín (Tarma · UGEL Tarma, Concepción · UGEL Concepción, Huancayo · UGEL Huancayo).
     - Lima (San Juan de Miraflores · UGEL 01, Huaral · UGEL 10, Breña · UGEL 03).
     - Tumbes (Tumbes · UGEL Tumbes, Zarumilla · UGEL Zarumilla).
     - Loreto (Maynas · UGEL Maynas).
     - Huancavelica (Tayacaja · UGEL Tayacaja).
   - Acción rápida `Limpiar (N)` y botón `Todas las Ubicaciones`.

3. **Encabezados Adaptables y Columnas en Tablero**:
   - Integración de columnas `Región`, `Distrito` y `UGEL / Sede` en `ALL_COL_META`, `MIN_COLS` y `GANTT_COLUMNS`.
   - Soporte para etiquetas adaptables según el contexto del proyecto (Edificación: `Edificio / Frente`, MINEDU: `UGEL / Sede`, Servicios: `Sede / Local`).
   - Sincronización transparente con vista Calendario mensual.
