# Auditoría Fase A — Módulo de referencia Proyecto

## Estado

**Fase A completada: módulo de referencia auditado y congelado.**

No se creó todavía Tareas 2, no se duplicó ningún módulo y no se modificó el módulo Proyecto.

## Referencia oficial

Para la copia literal de **Tareas 2**, el módulo de referencia será la perspectiva **Proyecto** implementada principalmente por:

```text
src/pages/5-qaway-hub/13-Gestor_Proyectos2/src/modules/cronograma-gantt/CronogramaGanttView.tsx
```

La referencia no es `TareasView.tsx`.

## Archivos que componen la referencia auditada

### Vista principal

```text
src/modules/cronograma-gantt/CronogramaGanttView.tsx
```

### Componentes visuales y funcionales dependientes

```text
src/modules/cronograma-gantt/GanttEditorDrawer.tsx
src/modules/cronograma-gantt/GanttElementDetailView.tsx
src/modules/cronograma-gantt/CronogramaArbolView.tsx
src/modules/cronograma-gantt/CronogramaCalendarioView.tsx
src/modules/cronograma-gantt/CronogramaKanbanView.tsx
src/modules/cronograma-gantt/CronogramaListaView.tsx
src/modules/cronograma-gantt/CronogramaOrganigramaView.tsx
```

### Estilos y modelos utilizados por la referencia

```text
src/modules/cronograma-gantt/gantt.css
src/modules/cronograma-gantt/edtPmbokModel.ts
src/modules/cronograma-gantt/regionalCoordinationModel.ts
src/modules/cronograma-gantt/scheduleMetrics.ts
src/modules/cronograma-gantt/sedesCatalogSeeds.ts
```

### Servicios y shell que deben considerarse durante la integración

```text
src/services/gestorCronogramaService.ts
src/shared/project-shell/ProjectShellHeader.tsx
src/shared/project-shell/ProjectShellWorkspace.tsx
src/shared/project-shell/ProjectShellFilters.tsx
src/shared/project-shell/ProjectShellTabs.tsx
```

Estos archivos quedan protegidos durante la creación inicial de Tareas 2. No deben modificarse para resolver necesidades del nuevo módulo sin autorización explícita.

## Archivos protegidos

```text
src/App.tsx
src/types.ts
src/components/Sidebar.tsx
src/components/Topbar.tsx
src/components/FloatingChatAssistant.tsx
src/modules/cronograma-gantt/**
src/services/gestorCronogramaService.ts
src/shared/project-shell/**
src/styles/**
```

La protección incluye evitar cambios indirectos de rutas, navegación, tipos globales, estilos globales y contexto del asistente durante la clonación literal.

## Archivos permitidos para la copia inicial

En la siguiente fase solo se podrán crear archivos dentro de:

```text
src/modules/tareas-2/**
```

La integración con el menú o la ruta se hará únicamente después de verificar la copia y con una tarea explícita separada.

## Características que deben conservarse

La copia debe conservar literalmente, antes de cualquier adaptación:

- Estructura del shell de Proyecto.
- Encabezado y toolbar.
- Filtros y controles de columnas.
- Tabla y densidad visual.
- Estados de carga, vacío y error.
- Botones, iconos, tamaños y espaciados.
- Menús, drawers y modales.
- Estados hover, active, focus y disabled.
- Scroll, responsive y comportamiento de interacción.
- Carga progresiva y control de actividad que correspondan al cascarón.

## Validación realizada

El repositorio estaba limpio salvo un cambio accidental de espacio en `Sidebar.tsx`, que fue retirado. No hay actualmente una copia incorrecta de Tareas 2.

La siguiente fase debe comenzar únicamente con la clonación literal de la referencia Proyecto y debe modificar exclusivamente `src/modules/tareas-2/**`.
