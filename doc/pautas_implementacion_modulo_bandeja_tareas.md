# Pautas de Implementación: Módulo Dedicado de Bandeja de Tareas (Task Inbox)

## 1. Contexto y Objetivos del Negocio
Actualmente en el Sidebar (`Sidebar.tsx`), el ítem **Bandeja de Tareas** (`Mi Bandeja`) apunta a:
`/proyectos/proj-minedu-2027?tab=kanban&view=bandeja`
Esto es una duplicación errónea de la vista de Planificación (Kanban de un solo proyecto hardcodeado).

El usuario requiere transformar este módulo en una **Bandeja de Tareas Ejecutiva y Operativa Dedicada**, inspirada en la referencia internacional (estilo ClickUp / Asana / Linear) con vista de listas agrupadas colapsables, filtros potentes y trazabilidad completa, sin limitarse a un diseño plano.

---

## 2. Alcance y Arquitectura Técnica

### A. Nueva Página Dedicada
* **Archivo a crear:**
  `src/pages/5-qaway-hub/11-gestor-de-proyectos/src/pages/tasks/TasksInboxPage.tsx`
* **Ruta limpia en `AppRouter.tsx`:**
  `<Route path="bandeja" element={<TasksInboxPage />} />`
* **Enlace en `Sidebar.tsx`:**
  Actualizar el ítem de navegación para que `to: '/bandeja'` sea su destino canónico.
  Mantener el contador reactivo (`badge: myTaskCount`) y la detección de URL activa.

---

## 3. Especificación Visual y de Interacción (Basada en la Referencia + Mejoras)

### A. Cabecera y Barra de Control (Toolbar Superior)
1. **Título y Contexto:**
   - Título: `Bandeja de Tareas` (o `Mi Bandeja` si la perspectiva es de Gestor).
   - Subtexto informativo: Conteo de tareas pendientes, atrasadas y completadas según la organización activa.
2. **Selectores y Filtros Rápidos (Pills ergonómicas):**
   - **Agrupador (`Group: ... ⌄`):**
     Dropdown para agrupar por:
     - `Estado` (Por defecto: No iniciadas / En progreso / En revisión / Completadas).
     - `Proyecto` (Agrupa por cada proyecto activo).
     - `Prioridad` (Urgente, Alta, Normal, Baja).
     - `Vencimiento` (Atrasadas, Hoy, Esta semana, Próximas).
   - **Filtro de Asignación (`Assignee ⌄`):**
     - `Mis tareas` (solo asignadas al usuario actual).
     - `Todo el equipo` (todas las tareas de la entidad).
   - **Filtro de Estado Cerrado (`Closed ⌄`):**
     - Alternar entre ocultar o mostrar tareas completadas (`done`).
   - **Buscador en tiempo real (`Search`):**
     - Campo de texto para filtrar por nombre de tarea, código, responsable o etiqueta.
3. **Acciones Superiores:**
   - Botón primario: `+ Nueva tarea` (abre modal rápido o slide-over para crear tarea).
   - Acciones secundarias discretas: `Exportar`, `Personalizar columnas`.

### B. Tira de Mini-KPIs Operativos (Encima de la lista)
Cuatro indicadores rápidos para control visual inmediato:
1. `Total Tareas`: Conteo global activo.
2. `Atrasadas (Overdue)`: Tareas cuya fecha límite venció (acento rojo/ámbar).
3. `En curso`: Tareas en ejecución activa (acento celeste).
4. `Completadas`: Tareas cerradas en el periodo (acento esmeralda).

### C. Bloques de Tarjetas Colapsables por Grupo (Acordeones con Código Cromático)
Cada grupo (ej. Por Estado: `No iniciadas`, `En progreso`, `En revisión / Pendientes`, `Completadas`) se renderiza como una tarjeta contenedor independiente con:
* **Cabecera de Grupo:**
  - Icono distintivo del grupo.
  - Título del grupo y contador numérico en badge (ej. `No iniciadas 3`, `En progreso 4`, `Pendientes 2`).
  - Chevron interactivo para colapsar / expandir el bloque con animación suave.
  - Acento cromático sutil en borde o encabezado:
    - No iniciadas: Índigo / Púrpura suave (`indigo-500`).
    - En progreso: Celeste / Cian suave (`sky-500`).
    - Pendientes / Revisión: Naranja / Ámbar (`amber-500`).
    - Completadas: Esmeralda (`emerald-500`).

* **Tabla Ergonómica de Tareas (Desktop y Mobile):**
  - **NAME (Nombre):**
    Icono de estado/tipo + Título de la tarea + Badge opcional del código del proyecto.
  - **PROJECT (Proyecto):**
    Nombre del proyecto al que pertenece la tarea.
  - **ASSIGNEE (Responsable):**
    Avatar con foto o iniciales de color + Nombre del gestor asignado.
  - **DUE (Vencimiento):**
    Lógica de semáforo temporal:
    - Si está vencida: Badge o texto `Atrasada` en rojo/ámbar con fecha.
    - Si vence en <= 3 días: Texto `Vence en X días` en azul/cian.
    - Fecha normal formateada en es-PE (ej. `20 oct 2026`).
  - **PRIORITY (Prioridad):**
    Bandera de color Lucide + Texto de prioridad:
    - `URGENTE`: Bandera roja.
    - `ALTA`: Bandera ámbar.
    - `MEDIA`: Bandera azul.
    - `BAJA`: Bandera verde.
  - **TAGS (Etiquetas / Ámbito):**
    Chips redondeados con `scopeTag` (UGEL/Territorio), naturaleza de la tarea (`Normativa`, `Control`, etc.) o épica.
  - **Interacción de Fila:**
    Al hacer clic en cualquier fila, se invoca `setSelectedTaskId(task.id)`, abriendo el componente nativo `SlideOverTaskSheet` para ver y editar la tarea en profundidad.
  - **Fila inferior `+ Agregar tarea`:**
    Botón rápido al pie de cada grupo para añadir una tarea con ese estado preasignado.

---

## 4. Integración de Datos y Gobernanza
* **Fuente de Datos:** Utilizar `useProjectsDataset()` y filtrar tareas por la organización activa (`scopedTenant` de `useTenant()`).
* **Perspectiva:** Leer `useProjectPerspective()` para respetar la identidad del usuario actual (`currentPersona.name`).
* **Slide-Over:** Reutilizar `<SlideOverTaskSheet taskId={selectedTaskId} onClose={() => setSelectedTaskId(null)} onOpenTask={(id) => setSelectedTaskId(id)} />` ya probado en `ProjectWorkspacePage.tsx`.

---

## 5. Criterios de Aceptación y Calidad
1. `npx tsc --noEmit` debe compilar con 0 errores en los archivos creados/modificados.
2. Navegación fluida: Al hacer clic en `Bandeja de Tareas` en el Sidebar, se carga `/bandeja` de forma instantánea.
3. Cero rupturas visuales, tokens de diseño 100% coherentes con el estándar de Qaway Lab Hub (`text-sm font-medium`, `rounded-xl`, bordes `zinc-200`, fondos limpios).
