# Arquitectura y Especificación Funcional · Módulo Equipo

## 1. Visión General
El módulo **Equipo** constituye el centro de gobernanza y coordinación de personas en el Gestor de Proyectos de Qaway Lab. Provee herramientas avanzadas para la administración de personal, organigrama jerárquico, distribución de frentes territoriales y análisis de capacidad operativa.

## 2. Principios de Diseño
- **Neutralidad Institucional**: Código base, encabezados y selectores agnósticos a entidades o regiones específicas.
- **Consistencia Visual Qaway**: Apego estricto al estándar de diseño del Cronograma Maestro (Slate/Navy, tokens tipográficos, motor `useTableEngine` y Drawer lateral).
- **Composición Especializada**: Cada vista (Directorio, Organigrama, Sedes, Capacidad) dispone de una composición optimizada para su propósito funcional sin forzar gráficos innecesarios.

## 3. Entidades y Modelo de Datos
- **Persona / Integrante**: Datos biográficos humanos y estado operativo laboral (`En funciones`, `Licencia / Permiso`, `Desvinculado`).
- **Cuenta de Usuario**: Estado técnico de autenticación (`Invitación Pendiente`, `Habilitada`, `Suspendida`) y último acceso.
- **Rol RBAC**: Permisos de software (`Administrador`, `Gestor`, `Colaborador`, `Consulta`).
- **Cargo y Dependencia**: Puesto funcional y jerarquía de reporte en el organigrama.
- **Sede / Frente Territorial**: Locación operativa asignada.
- **Asignaciones**: Vínculos con tareas e hitos del proyecto activo.
- **Historial de Auditoría**: Trazabilidad inmutable de eventos con autor y timestamp.

## 4. Vistas Operativas
1. **Directorio Maestro**: Matriz densa con paginación, selección múltiple, acciones masivas, selector de columnas y presets de vista guardados.
2. **Organigrama Interactivo**: Visualización jerárquica espacial con zoom, paneo, colapso de niveles y panel contextual.
3. **Distribución Territorial**: Control de cobertura por sede, identificación de responsables y detección de brechas.
4. **Capacidad y Carga**: Medición de esfuerzo relativo vs. capacidad nominal disponible sin umbrales arbitrarios.

## 5. Ficha del Integrante
- **Nivel 1 (Drawer Lateral)**: Pestañas *General*, *Asignaciones Vivas*, *Historial* y *Notas Internas*. Accesos rápidos a WhatsApp, correo y teléfono.
- **Nivel 2 (Expediente Completo)**: Modo inmersivo con preservación total del estado de fondo (scroll, fila activa y filtros intactos al cerrar).
