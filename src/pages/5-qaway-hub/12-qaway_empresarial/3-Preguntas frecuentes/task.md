# 📝 TASK: Plan de Tareas Atómicas e Incrementales

## Estado de Avance General
- [x] **Fase 1: Análisis y Arquitectura**
  - [x] Inspección de código de `index.html` (96 KB) y extracción de las 14 casuísticas canónicas.
  - [x] Verificación de ejecución del servidor en `http://localhost:4100`.
  - [x] Definición de documentación SDD (`spec.md`, `stack.md`, `task.md`, `qa.md`, `agents.md`).

- [x] **Fase 2: Estructura de Datos y Componentes Core**
  - [x] Definir interfaces TypeScript en `src/types/casuistica.ts`.
  - [x] Crear el dataset maestro inicial en `src/data/defaultCasuisticas.ts`.
  - [x] Implementar el algoritmo de búsqueda con normalización y tolerancia difusa.
  - [x] Implementar componentes atómicos:
    - [x] `HeaderBanner.tsx`
    - [x] `DirectionsGrid.tsx`
    - [x] `SearchBar.tsx`
    - [x] `CaseAccordion.tsx`
    - [x] `CasesList.tsx`
    - [x] `ManagementModal.tsx`
    - [x] `Toast.tsx`

- [x] **Fase 3: Integración y Aplicación Principal**
  - [x] Crear `src/PreguntasFrecuentesApp.tsx` con manejo de estado unificado.
  - [x] Crear `PreguntasFrecuentesAppPage.jsx` con ErrorBoundary y Suspense.
  - [x] Registrar rutas en `src/router/AppRouter.jsx` (`/hub/preguntas-frecuentes` y `/hub/casuisticas`).

- [x] **Fase 4: Verificación y QA**
  - [x] Validar compilación y typecheck sin errores (0 errores tsc).
  - [x] Verificar navegación y reactividad en `http://localhost:4100/hub/preguntas-frecuentes` (HTTP 200 OK).
  - [x] Validar responsive móvil (<480px, <768px).
