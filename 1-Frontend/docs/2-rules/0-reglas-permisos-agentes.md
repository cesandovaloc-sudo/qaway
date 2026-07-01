# Reglas Generales de Permisos y Autorizaciones — Qaway Lab

**IMPORTANTE:** Este documento contiene las reglas supremas de permisos. Todo agente debe leer y asimilar estas reglas antes de interactuar con el proyecto.

## 1. Regla de Lectura Libre (No Destructiva)
- Todas las operaciones de solo lectura **están totalmente permitidas y autorizadas de forma permanente**.
- El asistente **NUNCA debe solicitar confirmación ni pedir permiso al usuario** para acciones como:
  - Leer, buscar o visualizar código y archivos.
  - Listar directorios.
  - Analizar bases de datos.
  - Consultar el historial de conversaciones (ej. Engram).
  - Previsualizar el servidor local o ver la web.
- Una vez otorgada la autorización inicial de lectura para el proyecto, **NO se debe solicitar confirmación repetida** para estas operaciones.

## 2. Acciones que SÍ Requieren Permiso (Permisos Excluyentes)
Solo se solicitará permiso explícito al usuario para **acciones destructivas o de modificación del entorno**, tales como:
- Modificar o escribir código en archivos existentes.
- Crear nuevos archivos.
- Eliminar, mover, extraer o renombrar archivos.
- Ejecutar scripts o comandos en terminal que alteren de manera permanente el sistema operativo o el estado del proyecto.

## 3. Permisos Preevaluados para Desarrollo Local
No se requerirá autorización adicional (tienen permiso explícito) para ejecutar los siguientes comandos dentro de la carpeta `1-Web-Qaway-React`:
- Ejecutar `npm install` para instalar dependencias (limitar a una vez por sesión si es posible).
- Ejecutar `npm run dev` para levantar el servidor Vite en el puerto 3000.

## 4. Reglas Estrictas de Control de Versiones (GIT)
**CRÍTICO PARA TODOS LOS AGENTES:** El espacio de trabajo local en el que inicies tu tarea (por ejemplo, una subcarpeta específica) **NO es la raíz del repositorio Git**. El repositorio Git global siempre se encuentra en la carpeta raíz principal (`C:\LEO\EMPRESAS\QAWAY LAB`).

Antes de realizar cualquier modificación, debes seguir obligatoriamente este flujo de trabajo:
1. **Crear Rama Separada:** Sitúate lógicamente en la carpeta raíz superior (`C:\LEO\EMPRESAS\QAWAY LAB`) para operaciones Git, y crea una rama nueva y aislada para tu tarea (ej. `git checkout -b feature/nombre-de-la-tarea`).
2. **Modificar Código:** Realiza tus modificaciones en tu carpeta base asignada, pero guarda los cambios (commits) ÚNICAMENTE en tu rama separada.
3. **PROHIBIDO INICIALIZAR GIT LOCAL:** Está **estrictamente prohibido** ejecutar `git init` en cualquier subcarpeta. Solo existe un Git y es el global.
4. **PROHIBIDO CREAR SUBCARPETAS INNECESARIAS:** No crees subcarpetas físicas anidadas para trabajar a menos que se te indique explícitamente la creación de un nuevo componente.
