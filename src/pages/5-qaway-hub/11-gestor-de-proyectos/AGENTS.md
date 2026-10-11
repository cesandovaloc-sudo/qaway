# Instrucciones del Módulo: Gestor de Proyectos (11-gestor-de-proyectos)

Este documento rige el desarrollo, mantenimiento y evolución del módulo de **Gestor de Proyectos Universal** de Qaway Hub.

---

## 1. Identidad y Misión del Módulo
El Gestor de Proyectos es una suite híbrida multiplataforma (Scrum, PMBOK/P6, Kanban y Modo Híbrido) orientada a la supervisión operativa territorial (caso MINEDU Buen Inicio del Año Escolar) y gestión de proyectos de cualquier categoría (software, ingeniería, operaciones, consultoría y marketing).

---

## 2. Restricciones y Reglas Mandatorias

### 🔒 Candado Visual y Ergonomía
- **Inmutabilidad de diseño:** Prohibido alterar tamaños tipográficos, interlineados, paddings o romper la grilla de 5 columnas del tablero Kanban.
- **Tokens Canónicos:** Respetar los tokens establecidos en `index.css` y las paletas neutras anti-tóxicas con acento de marca dinámico (`--hub-brand`).
- **Mobile First Real:** Cero desbordamiento horizontal y accesibilidad ergonómica en toda vista.

### 💾 Fuente de Verdad y Persistencia Local-First
- **Aislamiento Total:** El módulo opera con 100% autonomía en el cliente a través de `projectsService.ts`.
- **Clave de Persistencia:** Almacenamiento reactivo en `localStorage` bajo `qaway_projects_v3` mediante el patrón observable compatible con `useSyncExternalStore`.
- **Cero bloqueos remotos:** No introducir llamadas a Supabase ni alterar el auth general del Hub para este módulo.

### 👥 Gobernanza de Roles (`ProjectPerspectiveContext`)
- **Gestor Territorial (`isGestor`):** Vista de ejecución en campo. Acceso de solo lectura a políticas de columna y límites WIP.
- **Coordinador PMO (`isCoordinador`):** Torre de control operativo. Permiso de edición sobre límites WIP, políticas de columna y auditorías.
- **Super Administrador (`isSuperAdmin`):** Acceso total de configuración global.

### 🔄 Multi-Agente y Delegación
- **Líder (Orquestador):** Planifica, audita y valida la calidad técnica y de diseño.
- **Subagente (OpenCode):** Recibe las tareas atómicas por el terminal Orca CLI (`orca terminal send`) y ejecuta la codificación.
- **Commits:** Formato `YYYY-MM-DD_HH:MM_A<NUM>@@@_motivo-en-kebab-case`. Prohibido ejecutar `git push`.
