# 📄 spec.md — Especificación & Alcance: Gestor de Proyectos Universal

**Módulo:** `src/pages/5-qaway-hub/11-gestor-de-proyectos`  
**Versión:** 1.0.0 (Suite Enterprise Qaway Lab)  
**Metodología:** Spec-Driven Development (SDD Multi-Agente)

---

## 1. Visión y Propósito del Producto

El **Gestor de Proyectos de Qaway Lab** es una plataforma universal de planificación, ejecución y control de proyectos aplicable a **cualquier industria y nicho** (desarrollo de software, consultoría, construcción, operaciones, marketing o ingeniería). 

Supera el sesgo de herramientas hiperespecíficas (diseño de logos o sitios web) para consolidar en una sola aplicación las cuatro metodologías de trabajo más demandadas en el mercado profesional:
1. **Agile / Scrum:** Sprints, Backlogs, velocidad del equipo y estimación por puntos.
2. **PMBOK & Primavera P6:** Cronogramas Gantt, ruta crítica (CPM), dependencias y control de hitos con actas de entrega.
3. **Kanban Continuo (Estilo Trello / Linear):** Flujo ágil de tarjetas, estados visuales y límites WIP.
4. **Wiki & Documentación (Estilo Notion):** Notas enriquecidas, minutas de reunión y especificaciones técnicas en bloques.

---

## 2. Entidades de Datos Maestras (Modelo Universal)

### A. Proyecto (`Project`)
```typescript
interface Project {
  id: string;                      // ej: "proj-001"
  code: string;                    // ej: "PRJ-ALPHA"
  name: string;                    // ej: "Plataforma Core Cloud"
  client: string;                  // Cliente o Área interna
  description: string;
  category: "software" | "ingenieria" | "consultoria" | "operaciones" | "marketing";
  methodology: "scrum" | "pmbok_p6" | "kanban" | "hibrido";
  status: "planificacion" | "en_curso" | "pausado" | "completado";
  health: "optimo" | "atencion" | "critico";
  budget: {
    currency: "PEN" | "USD";
    allocated: number;
    spent: number;
  };
  startDate: string;               // ISO Date
  targetDate: string;              // ISO Date
  progress: number;                // 0 a 100%
  activeSprint?: string;
  manager: string;
  membersCount: number;
}
```

### B. Tarea / Work Item (`WorkItem`)
```typescript
interface WorkItem {
  id: string;                      // ej: "TSK-101"
  projectId: string;
  sprintId?: string;
  title: string;
  description?: string;
  state: "backlog" | "todo" | "in_progress" | "review" | "done";
  priority: "URGENTE" | "ALTA" | "MEDIA" | "BAJA";
  assignee: {
    name: string;
    avatar?: string;
    role: string;
  };
  storyPoints?: number;            // Para Scrum
  durationDays?: number;           // Para Gantt P6
  startDate?: string;
  endDate?: string;
  predecessors?: string[];         // IDs de tareas previas obligatorias (FS)
  isCriticalPath?: boolean;        // Indicador de ruta crítica CPM
}
```

### C. Sprint (`Sprint`)
```typescript
interface Sprint {
  id: string;                      // ej: "sprint-01"
  projectId: string;
  name: string;                    // ej: "Sprint 1: Cimientos y Auth"
  goal: string;
  startDate: string;
  endDate: string;
  status: "planificacion" | "activo" | "cerrado";
  totalPoints: number;
  completedPoints: number;
  goalVelocity?: number;
}
```

### D. Métricas de Burndown & Sprint Snapshots (`BurndownSnapshot`)
```typescript
interface BurndownSnapshot {
  dayNumber: number;               // Día del sprint (1..14)
  date: string;                    // YYYY-MM-DD
  idealRemainingPoints: number;    // Línea de quemado ideal teórica
  actualRemainingPoints: number;   // Puntos pendientes reales
}
```

### E. Hito Contractual (`Milestone` - PMBOK)
```typescript
interface Milestone {
  id: string;
  projectId: string;
  phaseNumber: number;             // ej: 1 a 6
  name: string;                    // ej: "Aprobación de Arquitectura"
  targetDate: string;
  status: "pendiente" | "en_revision" | "aprobado";
  deliverableSummary: string;
  signOffRequired: boolean;
}
```

### F. Gestión del Valor Ganado (`EarnedValueMetrics` - EVM / Primavera P6)
```typescript
interface EarnedValueMetrics {
  plannedValue: number;            // PV: Presupuesto planificado a la fecha
  earnedValue: number;             // EV: Valor del trabajo real completado
  actualCost: number;              // AC: Costo real devengado
  costVariance: number;            // CV = EV - AC
  scheduleVariance: number;        // SV = EV - PV
  cpi: number;                     // Cost Performance Index = EV / AC (>1 óptimo, <1 sobrecosto)
  spi: number;                     // Schedule Performance Index = EV / PV (>1 adelantado, <1 atrasado)
  estimateAtCompletion: number;    // EAC proyectado
}
```

### G. Capacidad y Balance de Carga del Equipo (`TeamWorkload`)
```typescript
interface TeamMemberWorkload {
  memberName: string;
  role: string;
  avatar?: string;
  capacityPoints: number;          // Capacidad máxima de puntos por sprint
  assignedPoints: number;          // Puntos asignados en el sprint actual
  workloadPercentage: number;      // (assignedPoints / capacityPoints) * 100
  isOverloaded: boolean;           // true si supera el 100% (alerta de riesgo burnout)
}
```

### H. Documento / Wiki (`ProjectDoc` - Notion Style)
```typescript
interface ProjectDoc {
  id: string;
  projectId: string;
  title: string;
  icon: string;                    // Emoji o Lucide icon
  category: "especificacion" | "acta_reunion" | "manual" | "general";
  lastEdited: string;
  author: string;
  content: string;                 // Markdown enriquecido
}
```

### I. Jerarquía Universal de Ámbitos Territoriales (`Scope`)
```typescript
export type ScopeType = 'pais' | 'region' | 'ugel' | 'iiee';

interface Scope {
  id: string;                      // ej: "scp-ugel-huancavelica"
  code: string;                    // ej: "UGEL-301" / CM "0234567"
  name: string;                    // ej: "UGEL Huancavelica"
  type: ScopeType;
  parentId?: string;               // Apunta a DRE Junín, etc. (Estructura fractal infinita)
}
```

### J. Trazabilidad de Comunicaciones & Feedback de Campo
```typescript
export type TaskOriginType = 'oficial_oficio' | 'accion_emergente';
export type TaskResponseStatus = 'sin_notificar' | 'esperando_respuesta' | 'respondido';

interface NotificationAudit {
  whatsappSentAt?: string;
  whatsappSentBy?: string;
  emailSentAt?: string;
  emailSentBy?: string;
  appNotifiedAt?: string;
}

interface GestorFeedback {
  responseStatus: TaskResponseStatus;
  lastResponseNote?: string;
  respondedAt?: string;
  respondedBy?: string;
}
```

---

## 3. Modelo de Roles y Jerarquía Multi-Tenant (4 Niveles)

1. **Nivel 1 — Super Administrador (Carlos Sandoval / Fundador Qaway Hub):**
   - Control supremo del SaaS. Crea y configura instancias institucionales (`tenants`: MINEDU-DIGERE, PRONIED, DRE, etc.).
2. **Nivel 2 — Director de DIGERE / Jefe General de Coordinadores (Tenant Admin):**
   - Torre de Control Nacional. Monitorea el avance integral del Oficio Múltiple (OM 032-2026, OM 050-2027), semáforo de las 26 regiones y KPIs consolidados.
3. **Nivel 3 — Coordinadores de Gestores (Macro-Región / Sede):**
   - Supervisa un equipo de gestores territoriales asignados a una zona (Sierra Central, Selva, Costa Norte). Detecta alertas preventivas y cuellos de botella.
4. **Nivel 4 — Gestores Territoriales (Operación en Campo):**
   - Monitorea y opera directamente su cartera de UGELs asignadas (ejemplo: todas las UGEL de Junín + 2 de Oxapampa). Emite alertas, registra actas y notifica por WhatsApp en 1 clic.
5. **Nivel 5 — Puntos Focales e Instituciones Educativas (Extensión Futura):**
   - Usuarios de UGEL o Directores de II.EE. (Código Modular) para consulta y firma de actas de recepción.

---

## 4. Historias de Usuario & Flujos Principales

1. **HU-01: Gestión de Cartera:** Como líder de proyecto, deseo ver un panel consolidado de todos los proyectos activos con sus KPIs de salud, avance y presupuesto para detectar desvíos oportunamente.
2. **HU-02: Creación de Proyecto Universal:** Como usuario, deseo registrar un proyecto asignando su metodología (Scrum, PMBOK, Kanban, Híbrido), fechas y presupuesto sin restricciones de rubro.
3. **HU-03: Ejecución Ágil (Kanban & Sprints):** Como equipo de desarrollo/operaciones, deseo mover tarjetas de estado, ver sprints activos y filtrar por responsable y prioridad de forma instantánea.
4. **HU-04: Cronograma Gantt & Ruta Crítica:** Como director de proyecto, deseo visualizar el cronograma temporal con dependencias entre tareas para controlar los plazos críticos tipo Primavera P6.
5. **HU-05: Documentación Centralizada (Notion):** Como miembro del equipo, deseo redactar minutas y requerimientos en una wiki interna ligada al proyecto sin recurrir a software externo.
6. **HU-06: Gestión de Sprints y Burndown Chart (Scrum Pro):** Como Scrum Master o desarrollador, deseo planificar ciclos cerrados (Sprints), comprometer tareas desde el Backlog y monitorear la curva de quemado de puntos (Burndown) en tiempo real para anticipar desvíos antes de cerrar el ciclo.
7. **HU-07: Control de Límites WIP y Flujo Continuo (Kanban Pro):** Como facilitador de flujo, deseo configurar límites máximos de trabajo en progreso (WIP Limits) por columna con alertas visuales de cuello de botella para evitar sobrecargar etapas clave.
8. **HU-08: Gestión de Valor Ganado EVM y Rendimiento Financiero (PMBOK/P6):** Como director de proyectos o PMO, deseo auditar los índices CPI y SPI calculados automáticamente para conocer la salud financiera y temporal real frente al presupuesto.
9. **HU-09: Balance de Carga del Equipo & Prevención de Burnout:** Como líder de equipo, deseo visualizar la capacidad de puntos asignados vs disponibles por integrante para balancear el esfuerzo y evitar sobrecargas de trabajo.
10. **HU-10: Trazabilidad de Comunicaciones (Triple Check WhatsApp/Email/App):** Como coordinador, deseo registrar visualmente con fecha y hora cuándo notifiqué al gestor por WhatsApp o correo para tener evidencia de contacto oportuno.
11. **HU-11: Feedback y Notificación Visual de Respuesta del Gestor:** Como coordinador, deseo que la tarjeta active un badge verde y pulso visual de "RESPONDIDO" cuando el gestor remita su reporte de avance, permitiéndome filtrar rápidamente al final del día quién respondió y quién sigue pendiente.
12. **HU-12: Clasificación de Tareas Oficiales vs. Acciones Emergentes:** Como usuario directivo y operativo, deseo distinguir visualmente con chips claros si una tarea es un entregable directo del Oficio Múltiple (Hito Oficial) o una acción emergente creada por el equipo para destrabar la operación en campo.
13. **HU-13: Asignación Co-Responsable y Despliegue Territorial:** Como coordinador, deseo asignar una tarea a múltiples gestores a la vez cuando una disposición aplique a varias UGELs de forma simultánea.

---

## 5. Reglas de Negocio y Criterios de Aceptación

- **Cero dependencias remotas bloqueantes:** 100% operativo con datos locales y almacenamiento `localStorage` reactivo (`qaway_projects_v2`).
- **Aislamiento de sesiones:** No interferir con el auth principal ni con otros módulos del Hub.
- **Rendimiento:** Las transiciones de pestañas y modales deben ser instantáneas (< 50ms) y fluidas (60 FPS).
- **Cálculo reactivo de métricas ágiles y EVM:** Las variaciones en tareas (cambio a `done`, edición de puntos de historia o costos) deben recalcular inmediatamente el Burndown, los índices CPI/SPI y las cargas de trabajo sin necesidad de recargar la página.
- **Persistencia de auditoría de contacto:** El clic en el botón de WhatsApp o Correo registra automáticamente la marca temporal de notificación sin recargar la pantalla.
