# 🛡️ qa.md — Protocolo de Doble Auditoría Especializada de QA

**Módulo:** `src/pages/5-qaway-hub/11-gestor-de-proyectos`  
**Criterio de Aprobación:** Ambos bloques deben estar en verde (`PASS`) antes de la confirmación final.

---

## 🔍 Auditoría 1: Funcional & Interacción
*Objetivo:* Garantizar cero errores en tiempo de ejecución, navegación fluida e integridad del modelo de datos.

- [ ] **QA-F01 (Compilación):** `vite build` finaliza con código 0 y sin errores de TypeScript ni imports rotos.
- [ ] **QA-F02 (Navegación Shell):** El botón hamburguesa del Header colapsa y expande el Sidebar (256px $\leftrightarrow$ 72px) sin desalinear el contenido.
- [ ] **QA-F03 (Selectores de Tema):** Conmutar entre los 4 modos (`blanco`, `grises`, `contraste`, `oscuro`) actualiza los tokens de color inmediatamente.
- [ ] **QA-F04 (Buscador y Filtros):** El buscador de proyectos y el filtro de metodología filtran la tabla en tiempo real.
- [ ] **QA-F05 (Creación de Proyectos):** El modal de "Nuevo Proyecto" valida campos requeridos y añade el registro reactivamente al store.
- [ ] **QA-F06 (Tablero Kanban):** Las tareas se visualizan correctamente agrupadas por columna con sus badges de prioridad y story points.
- [ ] **QA-F07 (Slide-Over de Tareas):** Hacer clic en una tarjeta abre el panel lateral permitiendo editar título, estado y asignado.
- [ ] **QA-F08 (Cronograma Gantt):** La vista temporal de Primavera P6 renderiza las barras proporcionales y destaca las tareas de ruta crítica.
- [ ] **QA-F09 (Wiki Notion):** El visor documental permite seleccionar notas de la barra lateral y ver el contenido enriquecido.
- [ ] **QA-F10 (Persistencia Local):** Al recargar el navegador (`F5`), los cambios realizados en proyectos y tareas se conservan en `localStorage`.
- [ ] **QA-F11 (Burndown Chart Reactivo):** Al completar o desmarcar tareas del sprint activo, la curva real de quemado se actualiza de inmediato.
- [ ] **QA-F12 (Límites WIP Kanban):** Si una columna supera su límite configurado de tarjetas, el indicador activa la alerta visual de cuello de botella.
- [ ] **QA-F13 (Métricas EVM P6):** Los indicadores CPI y SPI reflejan correctamente el ratio de costo y cronograma según las fórmulas estándares de PMBOK.
- [ ] **QA-F14 (Balance de Carga y Anti-Burnout):** Si un integrante acumula más puntos de su capacidad recomendada, se visualiza el badge de sobrecarga.

---

## 🎨 Auditoría 2: Estética & Pulido Visual (`taste` / Impecable)
*Objetivo:* Garantizar interfaz de nivel clase mundial, cero apariencia genérica, coherencia tipográfica y ergonomía visual.

- [ ] **QA-V01 (Anti-Diseño Básico):** Ningún elemento tiene aspecto plano o sin jerarquía. Uso correcto de sombras sutiles, bordes armonizados y fondos de superficie.
- [ ] **QA-V02 (Tokens de Marca):** El color `--color-brand: #ff4b0b` se aplica en botones de acción principales y elementos destacados con hover suave (`#e03f06`).
- [ ] **QA-V03 (Ergonomía Tipográfica):** Ningún texto de cuerpo o descripción es menor a 14.5px. Los títulos guardan escalas proporcionales en toda la aplicación.
- [ ] **QA-V04 (Microinteracciones):** Las transiciones de apertura de modales, tabs y slide-overs utilizan curvas suaves `cubic-bezier(0.16, 1, 0.3, 1)`.
- [ ] **QA-V05 (Mobile-First Real):** En resoluciones móviles (< 768px y < 480px) no existe desbordamiento horizontal (`overflow-x` no deseado) y los botones son fácilmente cliqueables (mínimo 44px de área táctil).
- [ ] **QA-V06 (Densidad de Datos):** Las tablas y listas tienen paddings balanceados que facilitan la lectura prolongada sin fatiga visual.
- [ ] **QA-V07 (Visualización de Gráficos SVG):** El gráfico Burndown y las barras Gantt renderizan con precisión vectorial nítida en pantallas estándar y Retina/HiDPI.

---

## 📊 Veredicto de Certificación

| Auditoría | Responsable | Estado | Fecha |
| :--- | :--- | :--- | :--- |
| **Auditoría 1: Funcional** | Auditor Funcional (Orquestador) | ⏳ Pendiente de Ejecución | — |
| **Auditoría 2: Visual & Taste** | Auditor de Diseño (`frontend-design`) | ⏳ Pendiente de Ejecución | — |

> **Nota:** Solo cuando ambos estados cambien a `✅ APROBADO (PASS)` se presentará el módulo al usuario para la verificación final.
