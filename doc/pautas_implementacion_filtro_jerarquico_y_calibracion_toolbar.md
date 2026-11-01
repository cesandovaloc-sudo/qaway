# Pautas de Implementación: Depuración de Barra Superior, Filtro Jerárquico Escalable y Calibración Ergonómica de Botones

**Módulo**: Gestor de Proyectos 2 · Cronograma Maestro  
**Fecha**: 2026-11-01  
**Repositorio**: `1-qawaylab-web`  

---

## 1. Diagnóstico y Necesidades Identificadas

A partir de la auditoría visual y las directrices del usuario:

1. **Eliminar desplegable redundante de Estado (Color Rojo)**:
   - En la barra superior ya existen pestañas para `Todos`, `En proceso`, `Con retraso` y `Completados`.
   - El desplegable `ESTADO` en la barra de herramientas intermedia duplica esta funcionalidad y satura el espacio. Debe eliminarse.

2. **Filtro de Nivel Jerárquico Escalable (Color Verde)**:
   - Las pestañas `Hitos` y `Subprocesos` en la barra superior no escalan: si el proyecto cuenta con Niveles 3, 4 o 5 (sub-subprocesos, tareas, evidencias), la barra horizontal se saturaría.
   - Las pestañas superiores quedan dedicadas exclusivamente a **Estados Globales**: `Todos`, `En proceso`, `Con retraso`, `Completados`.
   - El filtro jerárquico se canaliza al botón desplegable `NIVEL / TIPO`, adoptando el estándar visual y funcional del motor universal de tablas (`src/shared/table-engine/ColumnHeaderMenu.tsx`):
     - Selector rápido: `Solo Hitos`, `Solo Subprocesos`, `Todos`.
     - Buscador integrado.
     - Árbol jerárquico indentado con checkboxes y contadores:
       - `[✓] Todos los niveles`
       - `[ ] ◆ Nivel 1 · Hitos Rectores` (rombo azul)
       - `[ ] └─ Nivel 2 · Subprocesos`
       - `[ ]    └─ Nivel 3 · Sub-subprocesos / Tareas`
       - `[ ]       └─ Nivel 4 · Entregables / Evidencias`

3. **Eliminar desplegable de Responsable de la barra de filtros (Color Azul)**:
   - En las columnas de la tabla ya existe el filtro nativo de `Responsable` con su menú contextual `ColumnHeaderMenu`.
   - Se retira el botón desplegable `RESPONSABLE` de la barra de herramientas para evitar duplicidad y desatascar la barra.

4. **Calibración de Altura y Posición de Botones (Flecha Verde)**:
   - **Posición**: Pestañas de estado a la izquierda y selector de vistas a la derecha. Se ratifica su validez tras contrastar con referentes mundiales (Linear, Jira, Notion, ClickUp).
   - **Altura**: `.view-mode-switcher` y sus botones `.view-mode-btn` (actualmente de 28px de altura) se encuentran disminuidos frente a los controles de la fila inferior (42px). Se calibra `.view-mode-switcher` a 40px con botones de 34px para lograr coherencia ergonómica.

---

## 2. Plan de Modificaciones de Código (Archivos Involucrados)

### Archivo 1: `src/modules/cronograma-gantt/CronogramaGanttView.tsx`
- **Pestañas Superiores (`.tabs-list`)**:
  - Conservar únicamente: `Todos`, `En proceso`, `Con retraso`, `Completados`.
  - Retirar `Hitos` y `Subprocesos` de la lista de pestañas planas.
- **Barra de Filtros (`.filters`)**:
  - Eliminar el bloque del desplegable `activeMenu === 'state'` (Estado).
  - Eliminar el bloque del desplegable `activeMenu === 'gestor'` (Responsable).
  - Transformar el desplegable `activeMenu === 'type'` en el popover avanzado de jerarquía con soporte multinivel y estética `TableEngine`.
- **Botón Limpiar**:
  - Actualizar para restablecer `search`, `regionFilter` y `typeFilter`.

### Archivo 2: `src/modules/cronograma-gantt/gantt.css`
- **Escala de `.view-mode-switcher` y `.view-mode-btn`**:
  - Elevar la altura del switcher a 40px y de los botones a 34px (con tipografía de 13px bold y padding de 14px).
- **Estilos del Popover Jerárquico**:
  - Incorporar estilos para árbol de niveles (`.level-row`, `.level-indent`, `.level-badge`, `.level-count`) reutilizando las clases base de `tableEngine.css`.

---

## 3. Checklist de Tareas (Task List)

- [x] **Tarea 1**: Depurar pestañas superiores en `CronogramaGanttView.tsx` (remover `Hitos` y `Subprocesos`, dejando solo Estados).
- [x] **Tarea 2**: Eliminar desplegable de `Estado` (`activeMenu === 'state'`) de la barra de herramientas intermedia.
- [x] **Tarea 3**: Eliminar desplegable de `Responsable` (`activeMenu === 'gestor'`) de la barra de herramientas intermedia.
- [x] **Tarea 4**: Implementar el popover jerárquico multinivel para `TIPO / NIVEL` con diseño inspirado en `ColumnHeaderMenu.tsx`.
- [x] **Tarea 5**: Calibrar la altura de `.view-mode-switcher` y `.view-mode-btn` en `gantt.css` para igualar la escala ergonómica de la barra inferior.
- [x] **Tarea 6**: Validar compilación con `npx tsc --noEmit` y pruebas con `vitest run src/shared/table-engine/engine.test.ts`.
