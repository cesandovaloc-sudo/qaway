# Delimitación Funcional y Homologación Visual por Fases: Resumen vs. Reportes

**Proyecto**: Qaway Lab · Gestor de Proyectos 2 (MINEDU · Dotación 2027)  
**Fecha**: 4 de noviembre de 2026  
**Documento de Referencia**: `doc/guia_maestra_estilo_capsula_cronograma.md`  

---

## INTRODUCCIÓN Y MARCO METODOLÓGICO

Conforme a las mejores prácticas de dirección de proyectos (**PMBOK 7.ª Edición**, **PRINCE2** y la **Metodología de Monitoreo y Gestión por Resultados en el Sector Público - CEPAL/MEF**), existe una frontera rigurosa entre **el control situacional del estado de salud del proyecto** y **la rendición de cuentas analítica y documental**.

Este documento establece:
1. **Fase 1**: Delimitación metodológica y funcional estricta (Separación de responsabilidades: qué hace y qué NO hace cada módulo).
2. **Fase 2**: Especificación de diseño y arquitectura visual basada en el estándar **Cronograma Maestro** (`.gantt-v2 .app`).
3. **Fase 3**: Hoja de ruta de implementación controlada con Candado Visual.

---

## FASE 1: DELIMITACIÓN METODOLÓGICA Y FUNCIONAL

```
+-----------------------------------------------------------------------------------+
|                                 GESTOR DE PROYECTOS                               |
+-----------------------------------------+-----------------------------------------+
|                RESUMEN                  |                REPORTES                 |
|   (Sala de Situación y Control Diario)  |    (Analítica y Rendición de Cuentas)   |
+-----------------------------------------+-----------------------------------------+
| • ¿Dónde hay fuego HOY?                 | • ¿Cómo sustentamos el avance formal?   |
| • Nivel directivo-operativo inmediato   | • Nivel técnico-analítico y auditoría   |
| • Semáforos de sedes y cuellos de botella| • Árbol WBS/EDT de entregables normativos|
| • Fases del flujo y corte del día       | • Curvas multivariables Recharts        |
| • Acciones correctivas urgentes         | • Dossiers de rendición al MINEDU       |
+-----------------------------------------+-----------------------------------------+
```

---

### Módulo 1: Resumen del Proyecto (`/hub/gestor_proyecto/resumen`)
**Rol Metodológico**: *Work Performance Information* · Sala de Situación Operativa.  
**Pregunta Rectora**: *«¿Cuál es el estado de salud del proyecto hoy y qué sedes requieren intervención inmediata?»*

#### Lo que SÍ hace:
1. **Gobernanza y Visión Multirregional**: Permite al Coordinador General supervisar proyectos territoriales y dar de alta nuevas regiones.
2. **Semáforo Situacional de Sedes**: Clasifica las sedes operativas en *Cumplen*, *En proceso* e *Incumplen / En riesgo* con umbrales inmediatos.
3. **Control del Embudo de Fases Activas**: Monitorea el flujo en caliente del subproceso en curso (Fase 1: Planificación, Fase 2: Registro en sistema, Fase 3: Validación).
4. **Curva S Acumulada Ejecutiva**: Muestra el progreso real vs. la meta programada a la fecha de corte actual.
5. **Radar de Sedes Prioritarias**: Lista focalizada de sedes en 0% o con desfase crítico para activar gestores de campo.

#### Lo que NO hace (Frontera de exclusión):
* **NO** desglosa árboles jerárquicos profundos de entregables ni subhitos técnicos (WBS/EDT).
* **NO** genera dossiers de auditoría formal ni memorias de gestión.
* **NO** contiene analítica de series temporales complejas ni proyecciones de valor ganado.

---

### Módulo 2: Reporteador Territorial y Analítica (`/hub/gestor_proyecto/reportes`)
**Rol Metodológico**: *Work Performance Reports* · Motor de Analítica, Rendición de Cuentas y Evidencias.  
**Pregunta Rectora**: *«¿Cómo sustentamos técnica, histórica y documentalmente el cumplimiento del proyecto ante comités y fiscalizadores?»*

#### Lo que SÍ hace:
1. **Estructura Desglosada de Trabajo (WBS / EDT)**: Desglose jerárquico normativo de hitos rectores (1.4, 1.6, 2.1, 3.1, 4.1, 5.1) y subentregables de segundo y tercer nivel (`1.6.1.a`, `1.6.1.b`, etc.).
2. **Analítica Avanzada Multivariable (Recharts)**: Gráficos de tendencias temporales, curvas de aceleración, gráficos de barras de distribución territorial y gráficos circulares de estado de cumplimiento.
3. **Perspectiva "Doble Clic por Hito"**: Vista analítica profunda para desglosar un hito específico:
   - Histórico de avance en el tiempo.
   - Comparativo individual de cumplimiento sede por sede.
   - Pasos secuenciales de conformidad normativa.
4. **Formatos Formatos de Presentación Oficial**: Clasificación formal de entregables por tipo de reporte:
   - Matriz de entregables normativos.
   - Línea de tiempo de hitos.
   - Registro y balance de cantidades.
   - Resumen ejecutivo consolidado.
5. **Generador y Exportador de Dossiers**: Exportación estructurada de informes para presentación formal a comités y entidades del Estado.

#### Lo que NO hace (Frontera de exclusión):
* **NO** gestiona el alta de proyectos ni configuraciones de gobernanza territorial.
* **NO** es una bandeja de tareas diarias de apagado de incendios.
* **NO** compite con el semáforo operativo de Resumen; Reportes explica el *por qué* y el *historial* del dato.

---

## FASE 2: DISEÑO Y HOMOLOGACIÓN VISUAL (ESTÁNDAR CRONOGRAMA MAESTRO)

Ambos módulos deben adoptar la arquitectura visual consolidada en `doc/guia_maestra_estilo_capsula_cronograma.md`:

```html
<div class="gantt-v2">
  <div class="app">
    <header class="header"> ... </header>
    <section class="metrics"> ... </section>
    <main class="workspace">
      <nav class="tabs"> ... </nav>
      <div class="filters"> ... </div>
      <div class="content-view"> ... </div>
      <footer class="footer"> ... </footer>
    </main>
  </div>
</div>
```

---

### 2.1. Arquitectura de Capas para `Resumen del Proyecto`

1. **Montaje DOM (`App.tsx`)**:
   - Cambiar clase de montaje a: `<div className={active === 'resumen' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>`.

2. **Capa 1: Cabecera Oficial (`header.header`)**:
   - **Icono**: `<Activity size={26} />` en cápsula `.heading-icon`.
   - **Supertítulo**: `SALA DE SITUACIÓN · DRE JUNÍN`.
   - **Título**: `Resumen Ejecutivo del Proyecto`.
   - **Subtítulo**: `Monitoreo en tiempo real del estado de salud, semáforo de sedes y avance acumulado.`
   - **Acciones (`.head-actions`)**:
     - `.btn.secondary`: `<RefreshCw size={15} /> Sincronizar Corte`.
     - `.btn.primary`: `<Plus size={16} /> Crear Proyecto Regional` (accesible para Coordinador).

3. **Capa 2: Métricas Directivas (`section.metrics`)**:
   - **Azul (`.metric.blue`)**: Sedes Monitoreadas (Total 13 sedes territoriales).
   - **Verde (`.metric.green`)**: Sedes que Cumplen (Fases completadas con éxito).
   - **Ámbar (`.metric.amber`)**: Sedes en Proceso (Avance activo parcial).
   - **Rojo (`.metric.red`)**: Sedes en Alerta / No Cumplen (Requieren asistencia prioritaria).
   - Micrográficos `.bars` interactivos con filtrado al clic.

4. **Capa 3: La Cápsula Central (`main.workspace`)**:
   - **Tabs de Conteo**: `Todas las sedes (13)`, `Cumplen (2)`, `En proceso (3)`, `En alerta (8)`.
   - **Switcher de Vistas**:
     - `Semáforo de Sedes` (Directorio y estado de intervención de sedes).
     - `Fases y Curva S` (Progreso de fases operativas y gráfico de avance regional).
   - **Barra de Filtros Oficial (`.filters`)**:
     - Input `.search` con lupa y botón para limpiar.
     - Desplegables popover oficiales `.filter-card-btn` + `.filter-card-popover`:
       1. **Fase Operativa** (Todas / Fase 1 / Fase 2 / DEI).
       2. **Estado de Cumplimiento** (Todos / Cumple / En proceso / No cumple).
     - Botón de limpieza rápida.
   - **Contenido Principal**:
     - Vista 1: Tabla de sedes y próximos hitos críticos bajo `.cronograma-lista-table`.
     - Vista 2: Barras de fase de trabajo y Curva S estilizada institucionalmente.
   - **Pie de Página (`.footer`)**:
     - `Mostrando X de 13 sedes territoriales monitoreadas`.

---

### 2.2. Arquitectura de Capas para `Reporteador Territorial y Analítica`

1. **Montaje DOM (`App.tsx`)**:
   - Cambiar clase de montaje a: `<div className={active === 'reportes' ? 'gantt-v2 qm-pane-active' : 'gantt-v2 qm-pane'}>`.

2. **Capa 1: Cabecera Oficial (`header.header`)**:
   - **Icono**: `<BarChart3 size={26} />` en cápsula `.heading-icon`.
   - **Supertítulo**: `ANALÍTICA Y RENDICIÓN DE CUENTAS · DOTACIÓN 2027`.
   - **Título**: `Reporteador Territorial y Analítica`.
   - **Subtítulo**: `Evaluación estructural de hitos normativos, tendencias de aceleración y generación de dossiers.`
   - **Acciones (`.head-actions`)**:
     - `.btn.secondary`: `<FileText size={15} /> Generar Informe`.
     - `.btn.primary`: `<Download size={16} /> Exportar Dossier Ejecutivo`.

3. **Capa 2: Métricas Directivas (`section.metrics`)**:
   - **Azul (`.metric.blue`)**: Hitos Rectores WBS (Total de paquetes de trabajo).
   - **Verde (`.metric.green`)**: Entregables con Conformidad (Validados al 100%).
   - **Ámbar (`.metric.amber`)**: Subprocesos en Ejecución (En proceso analítico).
   - **Rojo (`.metric.red`)**: Desviaciones Registradas (Entregables fuera de fecha).
   - Micrográficos `.bars` interactivos.

4. **Capa 3: La Cápsula Central (`main.workspace`)**:
   - **Tabs de Conteo**: `Todos los hitos (6)`, `Conformidad (2)`, `En proceso (2)`, `Pendientes (2)`.
   - **Switcher de Vistas**:
     - `Resumen Analítico` (Árbol jerárquico EDT/WBS y gráficos consolidados de Recharts).
     - `Detalle por Hito` (Ficha profunda del hito seleccionado: distribución por sede, historial y pasos de validación).
   - **Barra de Filtros Oficial (`.filters`)**:
     - Input `.search` con lupa y botón para limpiar.
     - Desplegables popover oficiales `.filter-card-btn` + `.filter-card-popover`:
       1. **Ámbito Territorial** (Región Junín - 13 UGEL / Macro-región).
       2. **Formato de Reporte** (Matriz de entregables / Línea de tiempo / Registro de cantidades / Resumen ejecutivo).
       3. **Estado del Hito** (Todos / Cumple / En proceso / Pendiente).
     - Botón de limpieza rápida.
   - **Contenido Principal**:
     - Vista Overview: Tabla jerárquica estilizada con motor universal + paneles analíticos Recharts.
     - Vista Detalle: Panel de hito con histórico, pasos secuenciales y barras de dispersión territorial.
   - **Pie de Página (`.footer`)**:
     - `Mostrando X de 6 hitos rectores normativos analizados`.

---

## FASE 3: PLAN DE EJECUCIÓN PASO A PASO (TASK-BY-TASK CON CANDADO VISUAL)

Para garantizar cero errores, cero regresiones y estricta fidelidad a las instrucciones de desarrollo:

1. **Etapa 1: Aprobación del presente documento rector** (Estado actual).
2. **Etapa 2: Homologación de `Resumen` (`ResumenProyectoView.tsx`)**:
   - Commit total preventivo.
   - Adaptación de `App.tsx` (`res-v1` -> `gantt-v2`).
   - Aplicación de las 3 capas: Header, Metrics y Workspace (Fases + Semáforo) con filtros popover y tabla homologada.
   - Validación de compilación TypeScript (`npx tsc --noEmit`).
   - Commit de entrega.
3. **Etapa 3: Homologación de `Reportes` (`ReporteadorView.tsx`)**:
   - Commit total preventivo.
   - Adaptación de `App.tsx` (`rep-v1` -> `gantt-v2`).
   - Aplicación de las 3 capas: Header, Metrics y Workspace (Analítica WBS + Detalle por Hito) con Recharts y filtros popover.
   - Validación de compilación TypeScript (`npx tsc --noEmit`).
   - Commit de entrega.

---
*Fin del documento rector.*
