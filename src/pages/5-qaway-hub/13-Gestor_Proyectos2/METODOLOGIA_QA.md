# Metodología QA

## Criterio de Control de Calidad: Sincronización de Estado en Hidratación y Persistencia

• **Nombre formal del defecto:** Inconsistencia de Estado por Fallback Estático (Stale State Flash / Hardcoded Fallback Desynchronization).
• **Categoría del defecto:** Inconsistencia de Estado Inicial / Condición de Carrera en Hidratación Local (State Initialization Race Condition).
• **Impacto / Severidad:** Media - Alta (Afecta directamente la experiencia de usuario / UX y puede provocar acciones erróneas basadas en datos obsoletos).

Este proceso busca obtener primero la fidelidad que necesitan los paneles y, posteriormente, la reutilización y mantenibilidad esperadas de una aplicación profesional.





\# Auditoría mínima de las cinco fases de rendimiento ya aplicadas



Esta auditoría debe repetirse antes de ampliar los demás paneles. No sustituye una auditoría de rendimiento con navegador, pero confirma que los lineamientos mínimos estén presentes.



\## Fase 1 — Keep-alive perezoso



\### Objetivo



Montar cada módulo únicamente cuando se visita por primera vez y conservar su estado después de visitarlo.



\### Comprobar



\- Existe un registro equivalente a `visitedModules`.

\- El módulo inicial es el único que se monta inicialmente.

\- Los módulos no visitados no ejecutan hooks ni consultas.

\- Los módulos visitados conservan su estado.

\- PRUEBAS no se activa desde una ruta almacenada ni desde el inicio.



\## Fase 2 — Code splitting



\### Objetivo



Cargar los módulos pesados bajo demanda.



\### Comprobar



\- Las vistas pesadas usan `lazy(() => import(...))`.

\- Cada carga diferida tiene un `Suspense` con fallback.

\- El detalle del Gantt también se carga de forma diferida.

\- El build produce chunks separados.

\- PRUEBAS mantiene su chunk separado y no se descarga durante el inicio normal.



\## Fase 3 — Control de actividad



\### Objetivo



Pausar consultas, sincronizaciones y procesos costosos de vistas ocultas.



\### Comprobar



\- Las vistas pesadas reciben `isActive`.

\- `CronogramaGanttView`, Sedes y Equipo respetan `isActive`.

\- Los efectos de Supabase no se ejecutan cuando la vista está inactiva.

\- Suscripciones y procesos costosos se limpian correctamente.

\- Cambiar de panel no provoca consultas duplicadas innecesarias.



\## Fase 4 — Carga de datos resistente y escalable



\### Objetivo



Evitar bloqueos indefinidos y preparar las consultas para datos crecientes.



\### Comprobar



\- Las consultas tienen timeout o cancelación.

\- Se utiliza `AbortController` cuando el cliente lo permite.

\- El timeout se limpia con `finally`.

\- La interfaz conserva fallback local o cacheado.

\- Las consultas tienen filtros por proyecto.

\- No se cargan datasets completos sin límite o sin justificación.

\- Los próximos servicios nuevos usan paginación o límites explícitos.



\## Fase 5 — Scroll progresivo y precarga



\### Objetivo



No pintar todas las filas desde el primer render y preparar el siguiente bloque antes de llegar al final.



\### Comprobar



\- El render inicial está limitado por bloques.

\- Existe carga progresiva del siguiente bloque.

\- Se utiliza `IntersectionObserver` o equivalente.

\- El margen de precarga está definido.

\- Los filtros y ordenamiento se aplican antes de limitar las filas visibles.

\- No se pierde la selección, edición o navegación al agregar filas.

\- Para datasets muy grandes se planifica virtualización real y paginación de servidor.



\### Nota



El scroll progresivo actual no equivale todavía a virtualización completa. En futuras fases, si los volúmenes crecen significativamente, se debe evaluar virtualización real con filas fuera del viewport desmontadas.



\---



\# Criterio de aceptación de cada módulo



Un módulo nuevo se considera listo únicamente si:



\- Conserva el cascarón del módulo de referencia.

\- Sus diferencias están limitadas al dominio autorizado.

\- No modifica el módulo Proyecto.

\- No modifica archivos protegidos.

\- Usa los componentes comunes oficiales cuando ya existen.

\- Tiene carga perezosa si es pesado.

\- Respeta `isActive` si conserva estado montado.

\- Consulta datos por proyecto y con límites adecuados.

\- No carga datos innecesarios al iniciar.

\- Pasa typecheck y build.

\- Tiene diff revisable y commit independiente.



\---



\# Orden recomendado de construcción



```text

1\. Congelar Proyecto.

2\. Auditar las cinco fases de rendimiento.

3\. Elegir módulo de referencia.

4\. Clonar literalmente.

5\. Verificar identidad visual y funcional.

6\. Adaptar datos y reglas del nuevo proyecto.

7\. Integrar paginación, filtros y carga bajo demanda.

8\. Extraer únicamente piezas comprobadas como comunes.

9\. Hacer que referencia y clon usen esas piezas.

10\. Verificar que la referencia no cambió.

11\. Desvincular servicios y datos específicos.

12\. Crear commit independiente.

```



