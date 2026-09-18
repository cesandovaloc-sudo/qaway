# Qaway Academy - Task Doc

## 1. Propósito

Este documento convierte el brief en un plan de ejecución por fases para que una IA construya la Academy de forma ordenada, verificable y escalable.

La fuente de verdad es:

- `ACADEMY-BRIEF.md`

El trabajo debe vivir exclusivamente en:

- `C:\LEO\EMPRESAS\QAWAY LAB\7-Academy-Qaway-vf`

## 2. Reglas base

- Leer primero el brief completo.
- No mezclar este proyecto con otros workspaces o ramas.
- No reconstruir lo que ya funciona.
- No avanzar por intuición.
- No cerrar una fase sin validación.
- No dejar residuos innecesarios.
- No tocar diseño salvo que sea necesario para que la estructura funcione.

## 3. Orden correcto de trabajo

### Fase 0. Lectura y diagnóstico

- Revisar el brief.
- Revisar el estado real del proyecto.
- Identificar qué existe, qué falta y qué está duplicado.
- Confirmar rutas, estructura, datos y dependencias.

### Fase 1. Base del producto

- Crear la base estructural del proyecto.
- Definir router, layout y navegación principal.
- Preparar la capa de datos base.
- Dejar el proyecto listo para crecer sin romper lo existente.

### Fase 2. Capa pública

- Inicio.
- Catálogo.
- Detalle de curso.
- Acceso.
- Registro.
- Recuperación.
- Filtros, destacados, nuevos, recomendados y navegación entre cursos.

**Seed data:**
- Crear cursos de prueba con fotos de stock (picsum.photos).
- Cada lección debe tener un link de video diferente (YouTube / Vimeo) para simular visualización real y medir avance.
- Incluir enrollments de prueba para que las secciones automáticas (populares, nuevos, mejor calificados) tengan datos significativos.
- Las primeras 1-2 lecciones de cada curso deben ser de acceso libre (vista previa), controlado por `free_preview_lessons` en la tabla courses.

**Free preview lessons:**
- Campo `free_preview_lessons int default 1` en la tabla `courses`.
- El admin/docente elige cuántas lecciones iniciales son gratis al crear/editar un curso.
- En el detalle del curso, las lecciones de preview se marcan con etiqueta "Vista previa gratis".
- En la página de lección, si el usuario no está inscrito pero la lección es preview, se permite ver el video.
- Los videos de lecciones se renderizan como iframe embebido (YouTube) desde `video_url`.

### Fase 3. Capa del alumno

- Panel principal.
- Hub del curso.
- Lección / reproductor.
- Recursos.
- Tareas.
- Certificados.
- Progreso y continuidad.

### Fase 4. Capa docente

- Panel docente.
- Cursos asignados.
- Revisión de tareas.
- Recursos y materiales.
- Monitoreo de alumnos.

### Fase 5. Capa admin

- Dashboard admin.
- Gestión de cursos.
- Gestión de alumnos.
- Gestión de docentes.
- Roles y permisos.
- Métricas y auditoría básica.

### Fase 6. Pagos e inscripción

- Preparar la arquitectura de cobro.
- Dejar lista la integración de WooCommerce como puente inicial.
- Validar el flujo de inscripción.
- No confirmar pagos desde React.

### Fase 7. Seguridad

- RLS en tablas sensibles.
- Claves privadas fuera del frontend.
- Roles bien separados.
- Storage privado para materiales premium.
- Rutas protegidas.

### Fase 8. Auditoría

- Revisar permisos.
- Revisar exposición de datos.
- Revisar formularios.
- Revisar dependencias.
- Revisar rutas.
- Revisar errores visibles.

### Fase 9. Limpieza y cierre

- Eliminar residuos.
- Unificar duplicados.
- Dejar el proyecto legible.
- Preparar el cierre final.

## 4. Qué debe validar cada fase

- Que la estructura exista.
- Que la navegación funcione.
- Que las páginas mínimas estén completas.
- Que el usuario correcto vea lo correcto.
- Que el contenido sensible no quede expuesto.
- Que el flujo pueda escalar sin rehacer todo.

## 5. Checklist funcional mínimo

- Catálogo con filtros y estados.
- Tarjetas de curso con progreso y badges.
- Navegación multipágina clara.
- Curso con detalle completo.
- Lección con recursos, transcripción y siguiente paso.
- Hub del alumno con continuidad.
- Admin con CRUD completo.
- Docente con alcance acotado.
- Inscripción y pagos preparados.
- Seguridad base aplicada.
- Auditoría técnica realizada.

## 6. Criterio de avance

No pasar a la siguiente fase hasta:

- revisar lo anterior
- cerrar lo pendiente
- validar el resultado
- dejar nota de lo que sigue

## 7. Prompt base para la IA

Actúa como agente principal de desarrollo para Qaway Academy.

Primero lee y respeta el archivo `ACADEMY-BRIEF.md`. Después usa este `ACADEMY-TASK.md` como orden de ejecución.

Tu trabajo debe seguir este orden:

1. Revisar el brief completo.
2. Inspeccionar el estado real del proyecto.
3. Identificar lo que existe, lo que falta y lo que sobra.
4. Ejecutar por fases sin saltarte pasos.
5. Validar cada fase antes de seguir.
6. No tocar ramas, workspaces o carpetas ajenas.
7. No reconstruir lo que ya está bien.
8. No dejar residuos ni duplicados.
9. Aplicar seguridad desde la base.
10. Hacer auditoría técnica antes del cierre.

La Academy debe quedar como un producto vendible, escalable y autónomo, con estas áreas:

- público
- alumno
- docente
- admin
- pagos
- seguridad
- auditoría

Si falta algo, lo propones y lo construyes por orden.
Si algo ya existe, lo corriges en lugar de rehacerlo.
Si encuentras un bloqueo real, lo informas con precisión y propones la siguiente acción mínima.

No improvises diseño ni flujos que no estén en el brief.
No des por resuelto nada sin validarlo.
No avancen fases saltadas.

Entregables por cada fase:

- qué revisaste
- qué cambiaste
- qué validaste
- qué falta
- cuál es el siguiente paso

