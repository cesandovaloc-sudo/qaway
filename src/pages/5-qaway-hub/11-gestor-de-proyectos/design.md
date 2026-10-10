# 🎨 design.md — Especificación de UI / UX: Gestor de Proyectos Universal

**Módulo:** `src/pages/5-qaway-hub/11-gestor-de-proyectos`  
**Estándar de Calidad:** Nivel Enterprise / Qaway Master Suite (`frontend-design` + `tailwind-css-patterns`)

---

## 1. Principios de Diseño & Ergonomía Visual

1. **Anti-Diseño Básico:** Prohibidas las tablas planas o layouts tipo plantilla genérica. Se aplican tarjetas con bordes sutiles (`border-zinc-200/80`), sombras suaves y jerarquía de superficies.
2. **Ergonomía Tipográfica:**
   - Textos de contenido y descripciones: Mínimo 14.5px a 16px (estándar de alta legibilidad).
   - Códigos y métricas: Fuente monoespaciada (`JetBrains Mono` / `font-mono`).
3. **Consistencia de Tokens de Marca:**
   - Color primario de acción: `--color-brand: #ff4b0b` con hover `#e03f06`.
   - Soporte total para los 4 modos del Hub: `blanco`, `grises`, `contraste` y `oscuro`.
4. **Física de Animación y Microinteracciones:**
   - Curva de aceleración: `cubic-bezier(0.16, 1, 0.3, 1)` para apertura de modales, slide-overs y tabs.
   - Transiciones hover con escalado máximo de 1.015 para evitar deformaciones.

---

## 2. Mapa de Vistas y Pantallas

```
┌────────────────────────────────────────────────────────────────────────┐
│                        MAPA DE PANTALLAS                               │
├────────────────────────────────────────────────────────────────────────┤
│ 1. DASHBOARD DE CARTERA (`/`)                                          │
│    • KPIs globales: Salud, Presupuesto Ejecutado, Velocidad, En Riesgo │
│    • Gráfico de distribución de proyectos por metodología              │
│    • Lista de proyectos recientes con barra de avance reactiva         │
├────────────────────────────────────────────────────────────────────────┤
│ 2. DIRECTORIO DE PROYECTOS (`/proyectos`)                              │
│    • Tabla interactiva inspirada en 10-inventario                      │
│    • Filtros: Metodología (Scrum, P6, Kanban), Estado, Cliente         │
│    • Acciones: Ver detalle, archivar, duplicar                         │
├────────────────────────────────────────────────────────────────────────┤
│ 3. CHASSIS DETALLE DE PROYECTO (`/proyectos/:id`)                      │
│    ├── Pestaña 1: Resumen & Métricas (KPIs, Capacidad Equipo, Salud)   │
│    ├── Pestaña 2: Tablero Kanban (Límites WIP, Filtro Avatares, Cards) │
│    ├── Pestaña 3: Sprints & Burndown (Planificación, Gráfico Quemado)  │
│    ├── Pestaña 4: Cronograma Gantt P6 (Barras, EVM CPI/SPI, CPM)       │
│    ├── Pestaña 5: Hitos PMBOK (Stepper formal y actas de conformidad)  │
│    └── Pestaña 6: Wiki & Docs Notion (Notas en bloques, especificaciones│
├────────────────────────────────────────────────────────────────────────┤
│ 4. MODALES & SLIDE-OVERS                                               │
│    • Modal "Nuevo Proyecto" (Nombre, Metodología, Fechas, Presupuesto) │
│    • Slide-Over Lateral "Detalle de Tarea" (Edición, Story Points, CPM)│
│    • Modal "Completar Sprint" (Resumen de velocidad y traspaso de ítems│
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Especificación Detallada de Componentes Clave

### A. Vista Gantt & Cronograma (Primavera P6 + EVM)
- **Cabecera Temporal:** Escala de semanas y días con línea indicadora de "Hoy" (`marker-today`).
- **Barra de Métricas EVM:** Chips superiores con índices **CPI** (eficiencia de costo) y **SPI** (eficiencia de cronograma) calculados en tiempo real.
- **Filas de Tareas:** Barra horizontal proporcional a la duración (`durationDays`), con código identificador (`TSK-xxx`) y asignado.
- **Ruta Crítica (CPM):** Tareas en la ruta crítica destacadas en color rojo/naranja advertencia con badge `CRÍTICA`.
- **Líneas de Dependencia:** Flechas conectivas de relación Fin-Comienzo (FS).

### B. Tablero Kanban Fluido (Scrum / Trello / Linear + Supervisión Territorial)
- **Barra de Filtros Ergonómica (Solución al Desorden Horizontal):**
  - **Selector Desplegable `Filtrar Gestor [Todos (N) ▾]`:** Menú compacto con buscador en tiempo real, conteo de tareas pendientes por gestor y badges numéricos de urgencia. Evita saturar el encabezado horizontal con botones infinitos.
  - **Avatares de Alerta Preventiva (Acceso Inmediato):** Junto al selector desplegable, se muestran únicamente los avatares circulares de gestores con alertas críticas (tareas vencidas o con plazo ≤ 72h), dotados de un pulso sutil de advertencia (`ring-2 ring-rose-500/50 animate-pulse`).
  - **Filtro de Jornada para el Coordinador:** Segmentación rápida con un clic para auditar el día:
    - `[Todos]` | `[Esperando Respuesta]` | `[Respondidos Hoy]` | `[Sin Notificar]`.
- **Columnas con Límites WIP:** Header de cada columna con contador de trabajo en proceso (ej. `3 / 4 WIP`). Si el número excede el límite, la cabecera activa un badge ámbar/rojo de alerta de cuello de botella.
- **Tarjetas Enriquecidas de Monitoreo:**
  - **Diferenciación Visual de Origen de Tarea:**
    - `[OM 032 · Hito X.X]`: Subproceso formal del Oficio Múltiple (estilo institucional índigo con icono `FileText` y borde distintivo).
    - `[Acción Táctica]`: Tarea operativa de campo creada para destrabar gestiones (estilo ámbar/púrpura con icono `Zap`).
  - **Chip Territorial:** Etiqueta clara de ámbito/jurisdicción (`[UGEL Huancavelica]`, `[UGEL Oxapampa]`, etc.).
  - **Trazabilidad de Comunicación (Triple-Check Auditable):**
    - Chips compactos con estado de contacto: `[✓ WA]` (WhatsApp enviado con tooltip de fecha/hora), `[✓ Mail]` (correo institucional remitido), `[✓ App]` (notificación interna).
  - **Feedback y Alerta de Respuesta del Gestor:**
    - Badge con pulso visual `[RESPONDIDO]` en verde esmeralda cuando el gestor territorial remitió su descargo/avance, permitiendo al coordinador identificarlo inmediatamente sin abrir la tarjeta.
  - **Asignación Co-Responsable (Multi-Gestor):**
    - Renderizado de avatares superpuestos (`-space-x-2`) para directrices generales asignadas a múltiples gestores a la vez.
- **Acción Rápida:** Botón inline `+ Añadir Tarea` al pie de cada columna.

### C. Motor de Sprints & Burndown Chart (Scrum Pro)
- **Cabecera de Ciclo:** Selector de sprint activo (`Sprint 1`, `Sprint 2`), meta (`Sprint Goal`), fechas de inicio/fin y botones de acción (`Iniciar Sprint` / `Completar Sprint`).
- **Gráfico Burndown (SVG Interactivo):**
  - Eje Y: Puntos de historia restantes (Story Points).
  - Eje X: Días del sprint (Día 1 al Día 14).
  - Línea gris punteada: Descenso ideal teórico hacia 0.
  - Línea naranja de marca (`#ff4b0b`): Descenso real según tareas completadas.
  - Indicador de estado: "A tiempo" (bajo la línea ideal) o "En riesgo de desvío" (sobre la línea ideal).
- **Planificador de Backlog:** Lista compacta de Product Backlog (tareas sin asignar a sprint) con botón de incorporación inmediata al sprint activo.

### D. Balance de Capacidad del Equipo & Anti-Burnout
- **Widget de Carga por Integrante:** Muestra para cada persona:
  - Puntos asignados vs. Capacidad recomendada (ej. `18 / 20 pts`).
  - Barra de progreso porcentual: verde (< 80%), ámbar (80-100%), rojo (> 100% con advertencia de riesgo de sobrecarga/burnout).

### E. Wiki & Documentos (Notion Style)
- **Navegador Lateral de Documentos:** Lista jerárquica con iconos/emojis categorizados por tipo (Requerimientos, Minutas, Guías).
- **Lienzo de Lectura/Edición:** Tipografía enriquecida, bloques de código, listas de verificación y marcas de tiempo de edición.

### F. Slide-Over Lateral: Trazabilidad y Descargo Territorial
- **Bloque de Auditoría de Envíos:** Botones de acción directa con sellado de tiempo:
  - Botón verde `WhatsApp`: Abre mensaje preformateado y registra automáticamente la marca `whatsappSentAt`.
  - Botón azul `Correo`: Abre cliente de correo institucional y sella `emailSentAt`.
- **Bloque de Respuesta / Descargo de Campo:**
  - Selector de estado: `Sin Notificar` $\rightarrow$ `Esperando Respuesta` $\rightarrow$ `Respondido`.
  - Área de texto para registro de minuta de descargo, compromisos o acta de visita del gestor.
  - Marca temporal automática de respuesta (`respondedAt`) y usuario firmante.
- **Selector de Co-Responsables:** Permite agregar o remover gestores adicionales para asignaciones transversales.

---

## 4. Adaptabilidad Móvil (Mobile-First Real)

- **< 768px (Tablets y Smartphones):**
  - El Sidebar se pliega automáticamente como cajón lateral con overlay oscuro.
  - La tabla de proyectos conmuta a tarjetas compactas apiladas verticalmente.
  - El cronograma Gantt y el tablero Kanban habilitan scroll horizontal suave con indicadores de desplazamiento para evitar quiebres de layout.
  - El dropdown de gestores se adapta a pantalla completa como bottom sheet con buscador táctil ergonómico.
