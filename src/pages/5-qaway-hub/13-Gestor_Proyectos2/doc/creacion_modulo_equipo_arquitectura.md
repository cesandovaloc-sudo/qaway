# Arquitectura y Especificación Funcional · Módulo Equipo

## 1. Visión General
El módulo **Equipo** constituye el centro de gobernanza y coordinación de personas en el Gestor de Proyectos de Qaway Lab. Provee herramientas avanzadas para la administración de personal, organigrama jerárquico, distribución de frentes territoriales y análisis de capacidad operativa.

## 2. Principios de Diseño
- **Neutralidad Institucional**: Código base, encabezados y selectores agnósticos a entidades o regiones específicas.
- **Consistencia Visual Qaway**: Apego estricto al estándar de diseño del Cronograma Maestro (Slate/Navy, tokens tipográficos, motor `useTableEngine` y Drawer lateral).
- **Composición Especializada**: Cada vista (Directorio, Organigrama, Sedes, Capacidad) dispone de una composición optimizada para su propósito funcional sin forzar gráficos innecesarios.

## 3. Entidades y Modelo de Datos (Implementado en `types.ts` y `mockData.ts`)
- **Persona / Integrante**: Datos biográficos humanos y estado operativo laboral (`En funciones`, `Licencia / Permiso`, `Desvinculado`).
- **Cuenta de Usuario**: Estado técnico de autenticación (`Invitación Pendiente`, `Habilitada`, `Suspendida`) y último acceso.
- **Rol RBAC**: Permisos de software (`Administrador`, `Gestor`, `Colaborador`, `Consulta`).
- **Cargo y Dependencia**: Puesto funcional y jerarquía de reporte en el organigrama.
- **Sede / Frente Territorial**: Locación operativa asignada (`INITIAL_SEDES`).
- **Asignaciones**: Vínculos con tareas e hitos del proyecto activo (`INITIAL_ASIGNACIONES`).
- **Historial de Auditoría**: Trazabilidad inmutable de eventos con autor y timestamp.
- **Presets de Vistas Guardadas**: Persistencia de filtros y columnas visibles (`INITIAL_PRESETS`).

## 4. Estado de Avance por Fases
- [x] **Fase 1: Modelo de Tipos, Estados y Almacenamiento Persistente** (Completada).
- [x] **Fase 2: Directorio Maestro y Motor de Tabla con Presets y Acciones Masivas** (Completada).
- [x] **Fase 3: Drawer Lateral de Ficha de Integrante y Expediente Completo con Preservación de Estado** (Completada).
- [x] **Fase 4: Vista de Frentes Territoriales y Distribución de Sedes** (Completada).
- [x] **Fase 5: Organigrama Jerárquico y Matriz de Capacidad** (Completada).
