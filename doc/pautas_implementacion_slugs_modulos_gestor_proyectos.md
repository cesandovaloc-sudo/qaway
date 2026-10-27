# Bitácora e Implementación: Slugs Canónicos para Módulos de Gestor de Proyectos

## 1. Contexto y Requerimiento
* **Objetivo**: Asignar a cada submódulo del Gestor de Proyectos (`http://localhost:5174/`) su propio slug en la barra de direcciones URL, permitiendo acceso directo a cada vista, historial de navegación y compatibilidad con marcadores.
* **Restricción**: Preservar la arquitectura *keep-alive* con `display: none` para no destruir estado ni filtros en caliente, y aplicar Candado Visual estricto (0 cambios en CSS, tamaños o disposición espacial).

## 2. Mapeo de Slugs Canónicos
* `/resumen` -> Resumen del proyecto
* `/cronograma` -> Cronograma (Gantt macro / vista territorial)
* `/tareas` -> Tareas
* `/hitos` -> Hitos rectores
* `/reuniones` -> Reuniones y agenda
* `/reportes` -> Reportes y estadísticas
* `/equipo` -> Equipo del proyecto (alias: `/usuarios`)
* `/actas` -> Actas y acuerdos (alias: `/actas-acuerdos`)

## 3. Cambios Técnicos Realizados
1. `src/types.ts`: Definición y exportación de `MODULE_SLUGS` y `SLUG_TO_MODULE`.
2. `src/App.tsx`:
   - Vinculación con `useLocation()` y `useNavigate()` de `react-router`.
   - Inicialización de estado con `resolveModuleFromPath(location.pathname)`.
   - Redirección automática desde la raíz `/` hacia el slug del módulo activo o recordado.
   - Sincronización del Sidebar y del modal de creación de proyectos hacia los nuevos slugs.
3. Validación de tipos con `tsc --noEmit` exitosa (0 errores).
