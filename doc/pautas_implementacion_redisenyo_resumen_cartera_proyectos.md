# Pautas de Implementación: Rediseño Ejecutivo del Resumen de Cartera de Proyectos

## 1. Contexto y Objetivos
El usuario ha solicitado rediseñar el módulo de **Resumen** (`DashboardPage.tsx`) en el **Gestor de Proyectos** (`src/pages/5-qaway-hub/11-gestor-de-proyectos/src/pages/DashboardPage.tsx`), basándose en el diseño ejecutivo de referencia internacional (`orca-paste-1791759943101-7ef8a390-0fe4-4224-9ad9-e98b75d03139.png`).

### Diferenciación Conceptual de Dominio (PMBOK / ISO 21500)
1. **Proyecto**: Unidad de ejecución individual con alcance, fechas de inicio y fin, presupuesto asignado, hitos medibles y equipo responsable.
2. **Programa**: Conjunto coordinado de proyectos que comparten una meta institucional.
3. **Cartera (Portafolio)**: Visión ejecutiva consolidada de toda la organización (ej. MINEDU - DIGERE o Qaway Lab) para controlar el avance global, los desvíos en días, el presupuesto ejecutado y los proyectos críticos en riesgo.

---

## 2. Elementos que se ELIMINAN de `DashboardPage.tsx`
* ❌ **Eliminar: "Proyectos por metodología"**:
  El gráfico de torta (PieChart) de distribución Scrum vs P6 vs Kanban vs Híbrido se retira por completo. La metodología se conserva exclusivamente como una insignia discreta (badge tipo `PMBOK`, `Scrum`, `Híbrido`, `Kanban`) en la lista de proyectos.
* ❌ **Eliminar: "Salud de la cartera" (Gráfico de torta abstracto con score %)**:
  Se elimina la torta y el porcentaje abstracto ("84%"). Se sustituye por un **Semáforo Operativo Real**:
  - `En objetivo` (verde)
  - `En riesgo` (ámbar / naranja)
  - `Bloqueado` (rojo)

---

## 3. Componentes a IMPLEMENTAR (Fieles a la Referencia)

### A. Cabecera y Macro-Roadmap de Cartera (Arriba)
* **Pestañas de vista bajo el título**:
  `[Resumen]` (activo) · `[Cronograma]` · `[Hitos]` · `[Riesgos]` · `[Presupuesto]`
  Selector de mes (`Octubre 2026 < >`) y botón `Filtros`.
* **Macro-Gantt / Roadmap Temporal**:
  - Eje X: Meses del año (`Ene`, `Feb`, `Mar`, `Abr`, `May`, `Jun`, `Jul`, `Ago`, `Sep`, `Oct`, `Nov`, `Dic`).
  - Línea vertical punteada con indicador flotante **"Hoy"** posicionado en el mes actual (Octubre).
  - Barras horizontales por proyecto con colores de identidad (MINEDU Dotación 2027, Plataforma Qaway Lab, SIGA Territorial, Soporte UGEL 2026, Implementación VAR, Sitio web CoraVet).
  - Indicadores de hitos clave (rombos y círculos) sobre las barras de cronograma.

### B. Tira Ejecutiva de 4 KPIs Clave
1. **Proyectos activos**: `6`  
   Subtexto: `2 en riesgo · 1 bloqueado` (con indicadores cromáticos de estado).
2. **Avance promedio**: `58%`  
   Subtexto: `+12% vs. mes anterior` con mini barra de progreso.
3. **Desviación de cronograma**: `+8 días`  
   Subtexto: `desviación de cronograma` con gráfico sparkline SVG de tendencia de atraso/adelanto.
4. **Presupuesto ejecutado**: `S/ 420,000`  
   Subtexto: `de S/ 620,000 (68%)` con barra de avance financiero.

### C. Tabla de Cartera con Acordeón Interactivo y Curva S (Columna Principal)
* **Píldoras de filtro rápido**:
  `[Todos 6]` · `[En riesgo 2]` · `[Bloqueados 1]` · `[En objetivo 3]` + buscador de proyectos.
* **Columnas de la tabla**:
  1. `Proyecto` (Nombre y entidad asociada, ej. *MINEDU Dotación 2027 / MINEDU - DIGERE*).
  2. `Metodología` (Badge discreto: `PMBOK`, `Scrum`, `Híbrido`, `Kanban`).
  3. `Avance` (Barra de progreso + porcentaje, ej. `72%`).
  4. `Cronograma` (Sparkline SVG de ritmo).
  5. `Próximo hito` (Nombre de hito + fecha, ej. *Validación UGEL · 20 oct 2026*).
  6. `Estado` (Badge con punto de color: `En riesgo`, `En objetivo`, `Bloqueado`).
* **Fila Desplegable Expandible (Acordeón)**:
  Al hacer clic en un proyecto (ej. *MINEDU Dotación 2027*), se despliega un panel interior con 3 sub-bloques:
  1. **Hitos principales**: Lista con checks de estado (Aprobación del plan de trabajo [✓], Validación UGEL [○], Entrega de informe [○], Cierre regional [○]).
  2. **Avance del proyecto (Curva S)**: Gráfico de área/línea comparativo:
     - Línea punteada: `-- Planificado` (0% a 100% de Ene a Dic).
     - Línea sólida: `— Ejecutado` con relleno sombreado hasta la fecha "Hoy".
  3. **Presupuesto y Equipo**:
     - `S/ 420,000 de S/ 620,000` (barra de porcentaje).
     - Avatares del equipo asignado (`María Gómez`, `Luis Pérez`, `+2`).

### D. Columna Lateral Derecha (Agenda y Alertas Críticas)
* **Pestañas superiores**:
  `[Hoy]` · `[Próximos]` · `[Tareas críticas]`
  - Agenda horaria del día:
    - `09:00` Validación territorial (`MINEDU Dotación 2027 · Hito`)
    - `11:00` Revisión de configuración (`Plataforma Qaway Lab · Tarea`)
    - `15:00` Seguimiento con UGEL Maynas (`MINEDU Dotación 2027 · Reunión`)
  - Enlace inferior: `Ver calendario completo →`
* **Widget: Proyectos en atención (3)**:
  - MINEDU Dotación 2027 (Validación UGEL · 20 oct)
  - Implementación VAR (Pruebas piloto · 28 oct)
  - SIGA Territorial (Entrega de informe · 30 oct)
* **Widget: Actividad reciente**:
  - Feed en vivo con avatares y descripciones cortas de avances del equipo.

---

## 4. Restricciones Técnicas y Candado Visual
1. **Tokens y Paletas**: Usar variables CSS del Hub (`--hub-brand`, `--hub-bg`, `--hub-border`, `--hub-surface`, `--hub-text`, etc.) y Tailwind CSS.
2. **Cero Parches / Cero Rupturas**: No romper navegación de rutas, contexto de `TenantContext` ni `ProjectPerspectiveContext`.
3. **Tipos e Integridad**: Validar con `npx tsc --noEmit` que no existan errores de compilación.
4. **Git**: No realizar reset, rebase, revert ni push.
