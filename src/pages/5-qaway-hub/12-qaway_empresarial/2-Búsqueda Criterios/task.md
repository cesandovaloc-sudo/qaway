# 📝 TASK: Plan de Ejecución Atómica (SDD Task Breakdown)

Este documento desglosa paso a paso las tareas necesarias para modularizar, acoplar y verificar el motor de **Búsqueda de Criterios (RAG Engine)** sin generar fricción en el repositorio central de Qaway Lab y facilitando su futura extracción a Cloudflare.

---

## Estado Global de Tareas
- [x] **Fase 1: Andamiaje y Tipos de Datos (Scaffolding)**
- [x] **Fase 2: Componentes Core y Desglose Modular**
- [x] **Fase 3: Envoltorio Integrador y Enrutamiento en Qaway Web**
- [x] **Fase 4: Verificación Standalone para Cloudflare**
- [x] **Fase 5: Documentación y Bitácora en `/doc`**
- [x] **Fase 6: Nivelación Interactiva y Cierre Visual (OpenCode)**

---

## Detalle de Tareas

### 🔹 Fase 1: Andamiaje y Tipos de Datos
* [x] **TASK-1.1:** Crear estructura interna de carpetas bajo `src/pages/5-qaway-hub/12-qaway_empresarial/2-Búsqueda Criterios/src/`.
* [x] **TASK-1.2:** Implementar `src/types/criterios.ts` con todos los contratos de interfaz (locators, chunks, scenarios, themes).
* [x] **TASK-1.3:** Implementar `src/data/scenarios.ts` extrayendo y limpiando los escenarios de prueba realistas (Laboral, EBITDA, MINEDU) de `Propuesta de codigo.txt`.
* [x] **TASK-1.4:** Crear `src/components/ui/HubIcon.tsx` para aislamiento de íconos seguros con Lucide.

### 🔹 Fase 2: Componentes Core y Desglose Modular
* [x] **TASK-2.1:** Implementar los visores del Inspector Polimórfico (Legal, Excel con fórmulas fx, Documental).
* [x] **TASK-2.2:** Implementar componentes de búsqueda, filtrado, respuestas con citas interactivas y tabla comparativa.
* [x] **TASK-2.3:** Implementar `SqlArchitectureModal.tsx` con el código SQL `pgvector` y Supabase Edge Function.
* [x] **TASK-2.4:** Ensamblar `CriteriosApp.tsx` integrando todos los subcomponentes con estado centralizado autónomo y candado visual.

### 🔹 Fase 3: Envoltorio Integrador y Enrutamiento en Qaway Web
* [x] **TASK-3.1:** Crear `CriteriosAppPage.jsx` con `ErrorBoundary`, scoped wrapper `.qaway-criterios-app-page` y Suspense fallback.
* [x] **TASK-3.2:** Registrar la ruta `/hub/criterios` en `src/router/AppRouter.jsx` con lazy-loading y guardia de acceso oficial `HubAccessGuard`.
* [x] **TASK-3.3:** Verificar que el menú o navegación no presente interferencias y que el Navbar/Footer del host no colisionen con la app.

### 🔹 Fase 4: Verificación Standalone para Cloudflare
* [x] **TASK-4.1:** Crear `package.json` y `index.html` en la raíz de `2-Búsqueda Criterios/` para validar portabilidad directa a Cloudflare Pages.
* [x] **TASK-4.2:** Comprobar que no existan imports que salgan de la carpeta (`../..` al host), manteniendo 100% de aislamiento.

### 🔹 Fase 5: Documentación y Bitácora en `/doc`
* [x] **TASK-5.1:** Crear archivo de registro `doc/pautas_implementacion_modulo_busqueda_criterios_rag.md` documentando el acoplamiento y estrategia Cloudflare.
* [x] **TASK-5.2:** Ejecutar verificación de calidad y preparar reporte de cierre.

### 🔹 Fase 6: Nivelación Interactiva y Cierre Visual (OpenCode)
* [x] **TASK-6.1:** Conmutación dinámica de los 4 Escenarios (`auditoria`, `normativa`, `financiero`, `procedimiento` de `src/data/scenarios.ts` actualizando query, respuesta, tabla y fuentes).
* [x] **TASK-6.2:** Interactividad de citaciones (`[1]`, `[2]`) y filas de fuentes para abrir Inspector y conmutar a la pestaña correspondiente (`1: Ley`, `2: Excel`, `3: Doc`).
* [x] **TASK-6.3:** Acciones de respuesta funcionales: toggle en "Guardar", copiado con toast en "Compartir", y desplegable en `···` (más opciones).
* [x] **TASK-6.4:** Implementar botón interactivo "Abrir en Excel completo" en la pestaña de Excel del Inspector.
* [x] **TASK-6.5:** Desplegable de usuario en Header (avatar Carlos con chevron) y respuesta de selección en la navegación lateral del Sidebar.

