# 📋 tasks.md — Plan de Ejecución Atómica (Subagente OpenCode)

**Módulo:** `src/pages/5-qaway-hub/11-gestor-de-proyectos`  
**Objetivo:** Implementación completa del Gestor de Proyectos Universal adoptando el shell maduro de `10-inventario`.

---

## 🏗️ Fase 1: Scaffolding y Shell Base (Chasis de Inventario)
- [x] **Task 1.1:** Estructurar el árbol de carpetas en `11-gestor-de-proyectos/`:
  - `src/app/layouts/`, `src/app/router/`
  - `src/components/header/`, `src/components/sidebar/`, `src/components/ui/`
  - `src/pages/dashboard/`, `src/pages/projects/`, `src/pages/detail/`
  - `src/data/`, `src/types/`
- [x] **Task 1.2:** Implementar `src/index.css` con los tokens `@theme` y variables de modo (`--hub-bg`, `--hub-text`, `--color-brand: #ff4b0b`).
- [x] **Task 1.3:** Adaptar `AppLayout.tsx` replicando el comportamiento `hub-shell h-dvh overflow-hidden` y sidebar colapsable (256/72px).
- [x] **Task 1.4:** Crear `GestorProyectosAppPage.jsx` con `ErrorBoundary`, `Suspense` y contenedor scoped `.qaway-gestor-proyectos-root`.

---

## 💾 Fase 2: Modelo de Datos & Store Universal Reactivo
- [x] **Task 2.1:** Crear `src/types/project.types.ts` con las interfaces universales (`Project`, `WorkItem`, `Sprint`, `Milestone`, `ProjectDoc`).
- [x] **Task 2.2:** Crear `src/data/mock-projects-data.ts` con proyectos de muestra multi-industria (Software Cloud, Ingeniería Estructural, Campaña Global de Marketing, Consultoría de Procesos).
- [x] **Task 2.3:** Implementar store reactivo con sincronización automática en `localStorage` (`qaway_projects_v1`).

---

## 📊 Fase 3: Dashboard de Cartera & Directorio de Proyectos
- [x] **Task 3.1:** Crear `src/pages/dashboard/PortfolioDashboardPage.tsx`:
  - Tarjetas de KPIs (Salud, Presupuesto Ejecutado, Velocidad de Sprints, Tareas en Riesgo).
  - Tabla de proyectos activos con barras de progreso reactivas.
- [x] **Task 3.2:** Crear `src/pages/projects/ProjectsListPage.tsx`:
  - Tabla interactiva estilo 10-inventario con columnas (Código, Nombre, Cliente, Metodología, Avance, Fechas, Estado).
  - Filtros por metodología (Scrum, P6, Kanban) y buscador en tiempo real.
- [x] **Task 3.3:** Crear modal `CreateProjectModal.tsx` para registrar nuevos proyectos generales con validaciones.

---

## ⚡ Fase 4: Chasis de Detalle de Proyecto & Tablero Kanban (Scrum/Trello)
- [x] **Task 4.1:** Crear `src/pages/projects/ProjectWorkspacePage.tsx` (ruta `proyectos/:id`) con header de proyecto y selector de pestañas (`Resumen`, `Kanban`, `Gantt P6`, `Hitos`, `Wiki Docs`, con `?tab=` persistente).
- [x] **Task 4.2:** Implementar `src/pages/projects/workspace/KanbanBoardTab.tsx`:
  - Columnas fluidas (Backlog, Por Hacer, En Desarrollo, Revisión, Completado).
  - Tarjetas interactivas con badges de prioridad, story points y asignado.
  - Botón inline para añadir tareas rápidamente.
- [x] **Task 4.3:** Crear slide-over lateral `src/components/projects/SlideOverTaskSheet.tsx` para edición profunda de tickets.

---

## ⏱️ Fase 5: Cronograma Gantt & Ruta Crítica (Primavera P6)
- [x] **Task 5.1:** Crear `src/pages/projects/workspace/GanttTab.tsx`:
  - Cabecera de escala de tiempo (semanas y días).
  - Barras horizontales proporcionales a `durationDays`.
  - Resaltado visual de la **Ruta Crítica CPM** (color de alerta).
  - Indicadores de dependencias Fin-Comienzo (FS).

---

## 📝 Fase 6: Wiki & Documentación de Proyectos (Notion Style)
- [x] **Task 6.1:** Crear `src/pages/projects/workspace/DocsTab.tsx` (+ `OverviewTab.tsx` para la pestaña Resumen):
  - Navegador lateral de documentos del proyecto (Requerimientos, Minutas, SOPs).
  - Lienzo de lectura/edición con bloques enriquecidos y marcas temporales.

---

## 🔗 Fase 7: Acoplamiento Oficial & Integración en Host
- [x] **Task 7.1:** Registrar el alias en `vite.config.js`:
  - Mapear `@/` hacia `11-gestor-de-proyectos/src` cuando el importador pertenezca a este módulo.
- [x] **Task 7.2:** Registrar la ruta principal en `src/router/AppRouter.jsx` bajo `/hub/proyectos/*`.

---

## 🛡️ Fase 8: Doble Auditoría de QA y Verificación de Fase Base
- [x] **Task 8.1:** Validar 0 errores de TypeScript en todos los componentes del workspace y router (`typecheck`).
- [x] **Task 8.2:** Comprobar respuesta HTTP 200 en dev server (`/hub/proyectos/proyectos/proj-001`).

---

## 🚀 Fase 9: Suite Metodológica Pro (Scrum Engine, Burndown, WIP, EVM & Anti-Burnout)
- [x] **Task 9.1:** Extender modelo de datos en `src/types/project.types.ts` y `src/data/mock-projects-data.ts`:
  - `WorkItem`: `epicTitle`, `acceptanceCriteria`, `tShirtSize`, `isBlocked`, `blockerReason`, `completedAt`.
  - Entidades `BurndownSnapshot`, `EarnedValueMetrics`, `TeamMemberWorkload` + consts (`TSHIRT_POINTS`, `KANBAN_WIP_LIMITS`, metas).
  - Sprints semilla con históricos de puntos e ítems asignados.
- [x] **Task 9.2:** Extender store reactivo en `src/services/projectsService.ts` y `src/hooks/useProjects.ts`:
  - Métodos `startSprint(sprintId)`, `closeSprint(sprintId, targetSprintId?)` (con arrastre de remanente).
  - Métodos de cálculo reactivo `getSprintBurndown(sprintId)`, `getProjectEVM(projectId)`, `getTeamWorkload(projectId)` + `toggleBlockWorkItem`.
  - Hooks `useProjectSprints`, `useSprintBurndown`, `useProjectEVM`, `useTeamWorkload`.
- [x] **Task 9.3:** Crear componente `src/pages/projects/workspace/SprintEngineTab.tsx`:
  - Cabecera con selector de sprint activo, meta del sprint, fechas y botones *Iniciar Sprint* / *Completar Sprint*.
  - Gráfico interactivo vectorial SVG de **Burndown** (Línea ideal vs. Línea real con tooltip de puntos).
  - Sección de planificación: *Sprint Backlog* vs. *Product Backlog* con traspaso directo de tareas.
- [x] **Task 9.4:** Enriquecer `src/pages/projects/workspace/KanbanBoardTab.tsx`:
  - Filtro rápido de avatares del equipo en la cabecera del tablero.
  - Indicadores de límites WIP por columna con alerta visual en caso de exceso de tarjetas.
  - Badge BLOQUEADA + motivo en tarjeta; sellado `completedAt` al mover a Hecho (alimenta el burndown).
- [x] **Task 9.5:** Enriquecer `src/pages/projects/workspace/GanttTab.tsx`:
  - Barra superior con métricas financieras y de tiempo **EVM (CPI y SPI)** calculadas automáticamente.
- [x] **Task 9.6:** Enriquecer `src/pages/projects/workspace/OverviewTab.tsx`:
  - Widget de Balance de Capacidad del Equipo y alerta de sobrecarga (*Riesgo de Burnout*).
- [x] **Task 9.7:** Integrar pestaña de Sprints en `src/pages/projects/ProjectWorkspacePage.tsx`:
  - Pestaña `sprints` con icono `Flame`, badge de tareas del sprint y navegación con `?tab=sprints`.
- [x] **Task 9.8:** Auditoría y verificación de compilación 0 errores TS.
