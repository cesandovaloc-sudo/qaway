# Módulo Equipo · Qaway Gestor de Proyectos

## Propósito y Alcance
Módulo especializado para la gestión integral del personal, frentes operativos, organigrama y capacidad operativa en proyectos de Qaway Lab.

## Reglas Críticas del Módulo
1. **Neutralidad Institucional Absoluta**:
   - Cero nombres de ministerios, entidades estatales, regiones o sedes fijas codificadas en encabezados, tabs, filtros o toolbars.
   - Toda denominación específica proviene estrictamente de los datos vivos parametrizados por el usuario.
2. **Desacople de Estados**:
   - **Estado Operativo del Integrante**: `En funciones`, `Licencia / Permiso`, `Desvinculado`.
   - **Estado de Cuenta de Acceso**: `Invitación Pendiente`, `Habilitada`, `Suspendida`.
3. **Cálculo de Carga Operativa**:
   - Medición objetiva basada en Capacidad Nominal disponible vs. Esfuerzo de asignaciones vivas en el período evaluado. Cero umbrales arbitrarios.
4. **Sistema de Vistas Especializadas**:
   - **Directorio Maestro**: Tabla densa interactiva con motor `useTableEngine`, selección múltiple, barra de acciones masivas flotante y presets de vistas guardadas.
   - **Organigrama**: Lienzo espacial interactivo con zoom, paneo, expansión de ramas jerárquicas y panel contextual.
   - **Frentes Territoriales**: Matriz de sedes con ratio de cobertura, responsables designados y alertas de sedes desatendidas.
   - **Carga de Trabajo / Capacidad**: Matriz temporal de dedicación y balanceo de tareas.
5. **Ficha del Integrante en Dos Niveles**:
   - **Drawer Lateral Derecho**: Consulta rápida, edición ágil, botones de llamada/WhatsApp/correo, tabs: *General*, *Asignaciones*, *Historial* y *Notas*.
   - **Expediente Completo**: Maximizado inmersivo con preservación total del estado de fondo (scroll, fila seleccionada, filtros).
