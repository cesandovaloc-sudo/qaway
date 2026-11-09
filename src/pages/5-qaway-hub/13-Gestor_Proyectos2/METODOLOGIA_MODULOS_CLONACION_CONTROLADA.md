# Metodología de módulos por clonación controlada

## Propósito

Este documento define la forma oficial de crear nuevos paneles del Gestor de Proyectos sin perder la fidelidad visual y funcional del módulo de referencia, evitando iteraciones repetidas, interpretaciones distintas de los agentes y regresiones en el módulo Proyecto.

La estrategia combina dos necesidades:

1. **Obtener primero un cascarón idéntico y verificable.**
2. **Separar después las piezas reutilizables sin forzar una abstracción prematura.**

La clonación literal es intencional y temporal. No es el estado arquitectónico final.

---

## Principio principal

> Primero se copia literalmente un módulo validado. Después se cambian únicamente los datos y reglas propias del nuevo dominio. Solo cuando existan dos implementaciones funcionando y comparables se extraen los componentes realmente comunes.

No se debe pedir a un agente que “haga algo parecido”, “lo replique visualmente” o “lo adapte como Proyecto”. Esas instrucciones dejan espacio para interpretaciones.

La orden correcta es:

> Duplica literalmente la implementación de referencia. Conserva estructura, estilos, medidas, estados, iconos, orden, comportamiento y responsive. Cambia solamente lo autorizado para el nuevo dominio. No refactorices ni rediseñes durante esta fase.

---

# Flujo por fases para cada nuevo módulo


## Fase A — Clonación literal controlada

Crear el nuevo módulo copiando la estructura de referencia, sin reinterpretarla.

### Debe conservarse exactamente

- Estructura JSX.
- Orden de controles y secciones.
- Clases CSS.
- Tamaños, alturas, anchos y paddings.
- Tipografía, colores y densidad visual.
- Iconos y estados.
- Botones de filtro y menú de columnas.
- Tabla, toolbar y acciones.
- Estados de carga, vacío y error.
- Modales, drawers y paneles laterales.
- Responsive y comportamiento de scroll.
- Animaciones y transiciones.

### Cambios permitidos en esta fase

Solamente:

- Nombre del módulo.
- Textos específicos del dominio.
- Fuente de datos.
- Servicio del nuevo dominio.
- Columnas propias.
- Acciones propias del panel.
- Permisos específicos.

### Cambios prohibidos

- Rediseñar.
- Modernizar.
- Simplificar JSX.
- Renombrar clases por preferencia personal.
- Crear otra versión de un botón existente.
- Cambiar dimensiones “para mejorar” la interfaz.
- Instalar dependencias.
- Refactorizar el módulo de referencia.

Si falta una capacidad, se reporta antes de editar. No se improvisa.

## Fase B — Verificación de identidad

Antes de hacer mejoras de dominio se debe comprobar que el nuevo módulo es equivalente al patrón.

### Verificación técnica

- `npm run typecheck`
- `npm run build`
- `git diff --stat`
- Lista de archivos modificados.
- Confirmación de que no se modificaron archivos protegidos.

### Verificación visual y funcional

Comparar referencia y clon en los mismos estados:

- Vista inicial.
- Filtros cerrados.
- Filtro activo.
- Menú de columnas abierto.
- Tabla con datos.
- Tabla vacía.
- Estado de carga.
- Modal o drawer abierto.
- Hover, focus y disabled.
- Resolución de escritorio.
- Resolución reducida.

No se acepta “se ve parecido”. La aceptación significa que conserva la misma composición, medidas, densidad, estados e interacción.

## Fase C — Adaptación específica del proyecto

Una vez aprobado el cascarón, se incorporan las necesidades reales del nuevo módulo:

- Modelo de datos propio.
- Servicio de Supabase propio.
- Filtros del dominio.
- Columnas propias.
- Acciones y permisos.
- Estados específicos.
- Paginación y consultas filtradas.
- Identidad de proyecto mediante `projectId` o contexto de proyecto.

La adaptación no debe alterar el cascarón compartido. Si una necesidad exige cambiar una medida o comportamiento general, se registra como propuesta separada.

## Fase D — Extracción posterior de componentes comunes

Esta fase ocurre solo después de que el clon funciona y se ha comparado con la referencia.

Se extraen únicamente las partes demostrablemente iguales en ambos módulos:

- Botón de filtro.
- Menú de columnas.
- Toolbar.
- Shell de tabla.
- Paginación.
- Estados de carga y vacío.
- Botones y controles comunes.
- Tokens de medidas y espaciado.

### Regla de extracción

1. Extraer desde una implementación real.
2. Hacer que el módulo de referencia use el componente extraído.
3. Hacer que el clon use el mismo componente.
4. Verificar que el módulo de referencia no cambió visualmente.
5. Verificar que el clon tampoco cambió.
6. Solo después reutilizarlo en más módulos.

No se deben crear componentes genéricos basados únicamente en una suposición de lo que quizá se reutilice.

## Fase E — Desvinculación controlada (Desacople Estricto de Contenido)

La Fase E es una instrucción general para el módulo nuevo. **Solo desvincula el contenido y la fuente de datos del clon validado; jamás reemplaza, transforma ni rediseña el módulo original de referencia.**

1. **Partir de un módulo nuevo ya validado:**
   - La copia literal debe haber pasado la comparación visual y funcional.
   - El módulo original de referencia permanece 100% intacto.

2. **Desacoplar únicamente el módulo nuevo:**
   - Sustituir gradualmente sus imports, servicios, tipos y datos compartidos.
   - Crear versiones propias dentro de la carpeta del nuevo módulo cuando sea necesario.
   - Mantener rigurosamente la misma interfaz visual, densidad, botones, filtros y comportamiento funcional.

3. **No modificar módulos protegidos:**
    - Prohibido reemplazar vistas existentes o alterar su implementación aprobada.
    - Prohibido cambiar componentes originales o sustituir el cascarón por vistas planas no autorizadas.
   - Prohibido alterar rutas, navegación del Sidebar, estilos globales o servicios compartidos sin autorización explícita.
   - Prohibido usar la desvinculación como excusa para rediseñar.

4. **Cambios permitidos:**
   - Datos del dominio nuevo.
   - Servicios propios de base de datos.
   - Columnas y etiquetas específicas.
   - Permisos y roles.
   - Acciones específicas.
   - Tipos y estados internos del módulo nuevo.

5. **Validación obligatoria:**
    - Comparar módulo original y módulo nuevo lado a lado.
    - Confirmar que el módulo original no cambió.
    - Ejecutar `npm run typecheck` (`npx tsc --noEmit`).
    - Ejecutar `npm run build` (`npx vite build`).
    - Verificar estados de carga, vacío, error, responsive e interacciones.
    - Revisar `git diff` para confirmar que los cambios están limitados al módulo nuevo y a la integración autorizada.

---

# Contrato obligatorio para agentes

Todo agente que trabaje en un nuevo panel debe recibir o seguir estas reglas:

```text
El módulo de referencia debe copiarse literalmente durante la primera fase.
No rediseñes, refactorices ni modernices.
No cambies medidas, clases, iconos, orden, estados, responsive ni comportamiento.
Solo cambia los archivos y valores autorizados para el nuevo dominio.
No modifiques Proyecto, App.tsx, CronogramaGanttView ni servicios protegidos.
Si necesitas tocar un archivo protegido, detente y pide autorización.
Antes de finalizar ejecuta typecheck y build, muestra el diff y confirma los archivos modificados.
No hagas commit sin autorización.
```

## Lista blanca recomendada

Cada tarea debe definir los archivos que sí puede modificar, por ejemplo:

```text
Permitidos:
- src/modules/sedes/**
- src/services/sedesService.ts
- src/types/sedes.ts

Prohibidos:
- src/App.tsx
- src/modules/cronograma-gantt/**
- src/services/gestorCronogramaService.ts
- src/modules/proyecto/**
- CSS global
```

---
