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

## Fase A — Congelar y auditar el módulo de referencia

Antes de copiar:

- Elegir un módulo de referencia validado.
- Identificar todos sus archivos, imports, estilos, servicios y componentes secundarios.
- Registrar qué partes son propias del dominio y cuáles parecen reutilizables.
- Crear una lista de archivos protegidos.
- Confirmar que el módulo de referencia compila y funciona antes de iniciar.

### Archivos protegidos por defecto

Mientras se construye otro panel, no deben modificarse sin autorización explícita:

- `src/App.tsx`
- `src/modules/cronograma-gantt/**`
- `src/services/gestorCronogramaService.ts`
- CSS global del Gestor
- Tipos y servicios del módulo Proyecto
- Componentes compartidos ya validados

Si el nuevo módulo necesita tocar un archivo protegido, el agente debe detenerse, explicar la razón y pedir autorización. No debe resolverlo por iniciativa propia.

## Fase B — Clonación literal controlada

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

## Fase C — Verificación de identidad

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

## Fase D — Adaptación específica del proyecto

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

## Fase E — Extracción posterior de componentes comunes

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

## Fase F — Desvinculación controlada

Después de extraer lo común, cada módulo conserva únicamente:

- Datos propios.
- Servicio propio.
- Columnas propias.
- Reglas del dominio.
- Permisos propios.
- Acciones propias.

Los elementos visuales y comportamientos comunes pasan a `src/shared/` o a la capa común correspondiente.

La desvinculación no significa separar visualmente los módulos. Significa que cada módulo deja de depender de datos o lógica de otro módulo.

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

# Auditoría mínima de las cinco fases de rendimiento ya aplicadas

Esta auditoría debe repetirse antes de ampliar los demás paneles. No sustituye una auditoría de rendimiento con navegador, pero confirma que los lineamientos mínimos estén presentes.

## Fase 1 — Keep-alive perezoso

### Objetivo

Montar cada módulo únicamente cuando se visita por primera vez y conservar su estado después de visitarlo.

### Comprobar

- Existe un registro equivalente a `visitedModules`.
- El módulo inicial es el único que se monta inicialmente.
- Los módulos no visitados no ejecutan hooks ni consultas.
- Los módulos visitados conservan su estado.
- PRUEBAS no se activa desde una ruta almacenada ni desde el inicio.

## Fase 2 — Code splitting

### Objetivo

Cargar los módulos pesados bajo demanda.

### Comprobar

- Las vistas pesadas usan `lazy(() => import(...))`.
- Cada carga diferida tiene un `Suspense` con fallback.
- El detalle del Gantt también se carga de forma diferida.
- El build produce chunks separados.
- PRUEBAS mantiene su chunk separado y no se descarga durante el inicio normal.

## Fase 3 — Control de actividad

### Objetivo

Pausar consultas, sincronizaciones y procesos costosos de vistas ocultas.

### Comprobar

- Las vistas pesadas reciben `isActive`.
- `CronogramaGanttView`, Sedes y Equipo respetan `isActive`.
- Los efectos de Supabase no se ejecutan cuando la vista está inactiva.
- Suscripciones y procesos costosos se limpian correctamente.
- Cambiar de panel no provoca consultas duplicadas innecesarias.

## Fase 4 — Carga de datos resistente y escalable

### Objetivo

Evitar bloqueos indefinidos y preparar las consultas para datos crecientes.

### Comprobar

- Las consultas tienen timeout o cancelación.
- Se utiliza `AbortController` cuando el cliente lo permite.
- El timeout se limpia con `finally`.
- La interfaz conserva fallback local o cacheado.
- Las consultas tienen filtros por proyecto.
- No se cargan datasets completos sin límite o sin justificación.
- Los próximos servicios nuevos usan paginación o límites explícitos.

## Fase 5 — Scroll progresivo y precarga

### Objetivo

No pintar todas las filas desde el primer render y preparar el siguiente bloque antes de llegar al final.

### Comprobar

- El render inicial está limitado por bloques.
- Existe carga progresiva del siguiente bloque.
- Se utiliza `IntersectionObserver` o equivalente.
- El margen de precarga está definido.
- Los filtros y ordenamiento se aplican antes de limitar las filas visibles.
- No se pierde la selección, edición o navegación al agregar filas.
- Para datasets muy grandes se planifica virtualización real y paginación de servidor.

### Nota

El scroll progresivo actual no equivale todavía a virtualización completa. En futuras fases, si los volúmenes crecen significativamente, se debe evaluar virtualización real con filas fuera del viewport desmontadas.

---

# Criterio de aceptación de cada módulo

Un módulo nuevo se considera listo únicamente si:

- Conserva el cascarón del módulo de referencia.
- Sus diferencias están limitadas al dominio autorizado.
- No modifica el módulo Proyecto.
- No modifica archivos protegidos.
- Usa los componentes comunes oficiales cuando ya existen.
- Tiene carga perezosa si es pesado.
- Respeta `isActive` si conserva estado montado.
- Consulta datos por proyecto y con límites adecuados.
- No carga datos innecesarios al iniciar.
- Pasa typecheck y build.
- Tiene diff revisable y commit independiente.

---

# Orden recomendado de construcción

```text
1. Congelar Proyecto.
2. Auditar las cinco fases de rendimiento.
3. Elegir módulo de referencia.
4. Clonar literalmente.
5. Verificar identidad visual y funcional.
6. Adaptar datos y reglas del nuevo proyecto.
7. Integrar paginación, filtros y carga bajo demanda.
8. Extraer únicamente piezas comprobadas como comunes.
9. Hacer que referencia y clon usen esas piezas.
10. Verificar que la referencia no cambió.
11. Desvincular servicios y datos específicos.
12. Crear commit independiente.
```

Este proceso busca obtener primero la fidelidad que necesitan los paneles y, posteriormente, la reutilización y mantenibilidad esperadas de una aplicación profesional.
