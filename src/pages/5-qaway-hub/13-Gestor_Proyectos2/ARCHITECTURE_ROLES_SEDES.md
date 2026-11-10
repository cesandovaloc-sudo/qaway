# Arquitectura de Gestor de Proyectos: organización, unidades y proyectos

## 1. Alcance

Gestor de Proyectos, es una aplicación de planificación, seguimiento y control operativo de una organización basado en metodologías, entre ellas usa EDT. Usa la identidad y el acceso general del Qaway Hub, pero mantiene sus relaciones operativas propias.



Arquitectura Funcional: Estructura Organizacional y Jerarquía de Monitoreo


1. El Contenedor Raíz (Tenant)

El Tenant representa la organización principal o el cliente global dentro del sistema (por ejemplo, un Ministerio, una corporación transnacional o una cadena de retail). Es el límite administrativo supremo; nada de lo que ocurre dentro de un Tenant es visible para otros Tenants.

2. El Modelo de Sedes (Jerarquía Recursiva Fractal)

El núcleo del sistema no utiliza estructuras rígidas, sino un modelo de Sedes Jerárquicas Autorreferenciadas. Esto significa que cualquier oficina, dirección o local es un Nodo, y cada nodo tiene la capacidad de replicar el comportamiento de la Sede Central en una escala menor.
text
[Tenant: Organización Principal]
       │
       └── [Sede Central (Nodo Raíz)]
                │
                ├── [Sede Externa Nivel 1 (Nodo Hijo)]
                │         │
                │         └── [Sede Externa Nivel 2 (Nodo Nieto)]
                │                  │
                │                  └── [Sede Externa Nivel 3 (Sub-escala)]
                │
                └── [Sede Externa Nivel 1.2]
Usa el código con precaución.

Características de cada Sede (Nodo):

• Autonomía Organizacional: Cada sede, sin importar su tamaño, cuenta con su propio organigrama, trabajadores internos y flujo de trabajo.
• Capacidad de Monitoreo: Cada sede de nivel superior tiene la responsabilidad y las herramientas (Gantt, tableros, indicadores de gestión, control documental) para supervisar, auditar y consolidar la información de las sedes que están bajo su subordinación directa.
• Ubicación Agnóstica: Las sedes dependientes pueden ser físicas (oficinas externas, tiendas en otros distritos) o puramente administrativas/funcionales (direcciones internas dentro del mismo edificio).

3. Ejemplos de Aplicación por Sectores

Para demostrar la flexibilidad del modelo, la estructura se adapta perfectamente a diferentes realidades mediante la relación Padre-Hijo:

A. Sector Público / Educación (Caso MINEDU)

1. Sede Central (Nodo Raíz): Ministerio de Educación (Alta dirección, asesores, monitores globales).
2. Escala Menor (Hijo): DRE (Dirección Regional de Educación) -> Cuenta con su propio Director y especialistas.
3. Escala Siguiente (Nieto): UGEL (Unidad de Gestión Educativa Local) -> Monitoreada por la DRE, pero monitorea a los colegios.
4. Última Escala (Sub-escala): IIEE (Instituciones Educativas / Colegios) -> Directores y docentes del plantel.

B. Sector Público / Finanzas (Caso MEF)

1. Sede Central: Ministerio de Economía y Finanzas.
2. Escala Menor: Direcciones Presupuestales Generales.
3. Escala Siguiente: Direcciones sectoriales o unidades ejecutoras subalternas.

C. Sector Privado / Retail o Negocios

1. Sede Central: Corporativo / Gerencia General (Gerente, directores, analistas de operaciones).
2. Escala Menor: Tiendas o Sucursales por Distrito (Cada una con su propio Administrador y jefes de área).
3. Escala Siguiente: Almacenes satélites, módulos de venta o sub-áreas dentro de la tienda.


4. Gestión del Personal y Roles (El Organigrama y Control Centralizado)

El personal dentro del Tenant se divide bajo una lógica estricta de pertenencia a la Sede Central para funciones de control, o pertenencia a Sedes Externas para funciones operativas.
text
[Sede Central (Nodo Raíz)]
   ├── Personal Directivo/Interno (Gerente, Director General)
   └── EQUIPO DE MONITOREO CENTRALIZADO ────────┐ (Control Vertical Exclusivo)
                                                │
   ┌────────────────────────────────────────────┴──────────────────────────┐
   ▼                                                                       ▼
[Sede Externa A (Nodo Hijo)]                               [Sede Externa B (Nodo Hijo)]
   └── Personal Operativo/Directivo Interno                   └── Personal Operativo/Directivo Interno
       (Ejecutan, reportan KPIs y Gantt locales)                 (Ejecutan, reportan KPIs y Gantt locales)
Usa el código con precaución.

Clasificación de Perfiles y Ubicación

1. Equipo de Monitoreo y Supervisión (Centralizado en la Sede Central):
	• Ubicación: Pertenecen única y exclusivamente a la Sede Central. No forman parte de la planilla ni de la estructura de las sedes externas.
	• Función: Es el equipo de control encargado de auditar de forma vertical y transversal a toda la organización. Tienen credenciales globales para revisar los diagramas de Gantt, hitos, KPIs, indicadores y seguimiento documental de todas las sedes dependientes (hijos, nietos, etc.).
2. Personal Operativo / Directivo Interno (Distribuido por Sede):
	• Ubicación: Pertenecen obligatoriamente a la sede específica donde laboran (sea la Sede Central o una Sede Externa).
	• Función: Gestión y ejecución local. Son los responsables de alimentar el sistema con los avances de sus proyectos, cumplir las tareas asignadas a su nodo y responder por los indicadores de su propia sede. No monitorean a otras sedes.

Ejemplos Prácticos de Control Centralizado


A. Caso Sector Público: Ministerio de Educación (MINEDU)

• En la Sede Central (MINEDU): Se encuentra el Equipo de Control y Seguimiento de Proyectos Pedagógicos. Este equipo humano trabaja físicamente en el ministerio y pertenece a la Sede Central. Su único rol en el sistema es monitorear, evaluar y auditar mediante Gantt e indicadores cómo avanzan las metas de las regiones.
• En las Sedes Externas (DRE / UGEL / Colegios): El Director de la DRE Cusco, el jefe de la UGEL Canchis o el Director del colegio son Personal Operativo/Directivo Interno de sus respectivas sedes. Ellos reportan la información en el sistema, pero no tienen un equipo de monitoreo propio para fiscalizar a otros; son fiscalizados verticalmente por el equipo central del MINEDU.

B. Caso Sector Privado: Franquicia de Restaurantes (Ej. Bembos / Rustica)

• En la Sede Central (Oficina Corporativa / Gerencia General): Se encuentra el Equipo de Auditores de Operaciones y Calidad. Este equipo pertenece a la Sede Central. Utiliza la herramienta para monitorear los indicadores de ventas, mermas, tiempos de entrega (Gantt de campañas) y control documental de todas las sucursales del país.
• En las Sedes Externas (Tiendas por Distrito - Ej. Sucursal Miraflores, Sucursal Trujillo): En cada restaurante hay un Administrador de Tienda, Jefes de Cocina y Cajeros. Ellos son Personal Operativo Interno de esa sucursal. Su trabajo en el sistema es registrar sus rendimientos diarios y proyectos locales. Ningún empleado de la tienda de Miraflores audita a otra tienda; todo el control viene del equipo de monitoreo alojado en la Sede Central corporativa.




Tabla Comparativa de Variables de Tareas (Modelo Completo)





