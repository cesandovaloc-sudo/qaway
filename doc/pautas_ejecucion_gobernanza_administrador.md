# 📋 Pautas de Ejecución: Gobernanza de Roles, Administrador y Gestión de Proyectos
**Módulo:** `src/pages/5-qaway-hub/11-gestor-de-proyectos`  
**Destinatario:** Subagente OpenCode (`opencode`)  
**Fecha y Hora:** 11/10/2026 - 17:05  
**Líder / Orquestador:** Antigravity  

---

## 🎯 1. Objetivo General de la Tarea

Transformar la lógica de roles, usuarios y configuración de **Qaway Gestor de Proyectos (11-gestor-de-proyectos)** para que el usuario pueda:
1. **Entrar como Administrador de la Organización (Dueño de Marca)** desde el selector de perspectivas del Header.
2. **Gestionar y crear usuarios** pertenecientes a su organización.
3. **Crear y configurar cargos dinámicos** (ej. *Coordinador General*, *Coordinador Macroregional*, *Auditor PECOSA*, *Gestor Territorial*).
4. **Asignar funciones/facultades** mediante una matriz interactiva de **checks generales con acordeón desplegable de repercusiones** (impacto operativo y territorial).
5. **Crear y dar de alta proyectos** institucionales con asignación de responsables y fechas sin errores de enrutamiento ni desajustes visuales.

---

## 🔒 2. Candado Visual y Reglas Estrictas de Diseño

* **PROHIBIDO destruir, alterar o regenerar el diseño visual existente:**
  * Mantener inmutables los tokens tipográficos (`text-sm font-medium` para navegación y tablas, `text-xs font-semibold` para badges/tags).
  * Respetar los radios ergonómicos oficiales de Qaway Lab (`rounded-lg`, `rounded-xl`).
  * Respetar los colores institucionales: variable `--hub-brand` (Terracota, Rojo MINEDU, o personalizado activo), bordes `border-zinc-200`, textos `text-zinc-900` / `text-zinc-500`.
  * Mantener los tamaños de iconos Lucide (`size={18}` para sidebar/navegación principal, `size={16}` para botones secundarios y acciones).
* **Cero cambios destructivos en layouts hermanos, padres ni contenedores maestros.**
* **Cero parches temporales:** Toda persistencia debe quedar reactiva en el dataset local-first (`projectsService.ts`, `userService.ts` o localStorage) para que los datos persistan al recargar.

---

## 🛠️ 3. Desglose Técnico de Tareas para OpenCode

### Tarea A: Integración del Rol Administrador en el Contexto de Perspectivas
* **Archivo:** `src/pages/5-qaway-hub/11-gestor-de-proyectos/src/context/ProjectPerspectiveContext.tsx`
* **Acción:**
  * Extender `ProjectPerspectiveRole`:
    ```typescript
    export type ProjectPerspectiveRole = 'super_admin' | 'admin' | 'coordinador' | 'gestor'
    ```
  * Incorporar en `PROJECT_PERSONAS` el perfil canónico del **Administrador de la Organización**:
    ```typescript
    admin: {
      role: 'admin',
      name: 'Director / Administrador',
      title: 'Administrador de Organización',
      scope: 'Organización Activa (MINEDU, Qaway, etc.)',
      avatar: 'AD',
      description: 'Máxima autoridad de la entidad. Gobierna la organización, crea cargos, asigna facultades a coordinadores y aprueba proyectos.',
      tag: 'Administrador Org',
      accentColor: '#8b5cf6',
    }
    ```
  * Exponer el booleano `isAdmin: perspective === 'admin'` en el contexto.
* **Archivo:** `src/pages/5-qaway-hub/11-gestor-de-proyectos/src/components/header/Header.tsx`
  * Asegurar que el selector de perspectivas del Header liste y permita seleccionar `'admin'` sin desbordar el popover y con su respectivo badge/avatar.

---

### Tarea B: Modernización de Permisos y Tipos de Roles en Proyectos
* **Archivos:**
  * `src/pages/5-qaway-hub/11-gestor-de-proyectos/src/types/project.types.ts`
  * `src/pages/5-qaway-hub/11-gestor-de-proyectos/src/types/user.ts`
* **Acción:**
  * Reemplazar los permisos residuales de tienda/inventario (`can_adjust_stock`, `can_view_products`) por la **Matriz Oficial de Permisos de Gestión de Proyectos**:
    ```typescript
    export interface ProjectModulePermissions {
      // 1. Cartera y Proyectos
      can_create_projects: boolean
      can_edit_projects: boolean
      can_archive_projects: boolean
      can_configure_budget: boolean
      can_change_methodology: boolean

      // 2. Gobernanza y Cargos
      can_manage_roles: boolean
      can_assign_users: boolean
      can_delegate_permissions: boolean

      // 3. Cobertura y Territorio
      can_assign_regions: boolean
      can_reassign_territories: boolean
      can_audit_territorial_map: boolean

      // 4. Planificación y Cronograma
      can_approve_milestones: boolean
      can_edit_gantt_dependencies: boolean
      can_configure_wip_limits: boolean

      // 5. Operación en Campo
      can_create_field_tasks: boolean
      can_upload_evidences_pecosa: boolean
      can_validate_checklists: boolean
      can_escalate_blockers: boolean
    }

    export interface OrganizationRoleDefinition {
      id: string
      name: string
      description: string
      organizationId: string
      isSystem: boolean // true para super_admin y admin fijos
      permissions: ProjectModulePermissions
      createdAt: string
    }
    ```

---

### Tarea C: Pantalla de «Cargos & Usuarios» en Configuración
* **Archivo:** `src/pages/5-qaway-hub/11-gestor-de-proyectos/src/pages/SettingsPage.tsx`
* **Acción:**
  * Reemplazar las pestañas residuales de series fiscales, impuestos y unidades comerciales por una pestaña o vista canónica: **«Usuarios & Cargos»** (o integrarla armónicamente en la configuración).
  * **Sección 1: Creación y Listado de Usuarios de la Organización:**
    * Tabla o lista limpia de usuarios con Avatar, Nombre, Correo, Cargo asignado y Estado (Activo/Inactivo).
    * Botón `+ Nuevo Usuario` con modal o drawer limpio para registrar nombre, email y asociarle un cargo existente.
  * **Sección 2: Creación de Cargos con Matriz de Checks Desplegables:**
    * Botón `+ Nuevo Cargo` para definir el nombre (ej. *Coordinador Macroregional*, *Auditor PECOSA*).
    * Acordeón con los 5 bloques funcionales:
      1. **Gestión de Cartera y Proyectos:** Check general + despliegue con checks específicos e impacto.
      2. **Gobernanza de Cargos y Equipo:** Check general + despliegue con checks específicos e impacto.
      3. **Ámbito Territorial y Cobertura:** Check general + despliegue con checks específicos e impacto.
      4. **Planificación, Hitos y Cronograma:** Check general + despliegue con checks específicos e impacto.
      5. **Operación en Campo y Evidencias:** Check general + despliegue con checks específicos e impacto.
    * Guardado persistente en `localStorage` o store reactivo de `projectsService.ts`.

---

### Tarea D: Subida y Creación de Proyectos por el Administrador
* **Archivos:**
  * `src/pages/5-qaway-hub/11-gestor-de-proyectos/src/pages/projects/ProjectsListPage.tsx`
  * `src/pages/5-qaway-hub/11-gestor-de-proyectos/src/components/projects/CreateProjectModal.tsx`
* **Acción:**
  * Verificar que el Administrador pueda hacer clic en `+ Nuevo Proyecto`, completar los datos (Nombre, Metodología, Organización, Responsable, Fechas de inicio/fin, Presupuesto) y que el proyecto se registre de inmediato.
  * Al guardar:
    1. Se actualiza el store reactivo de proyectos.
    2. Aparece en el listado de `ProjectsListPage`.
    3. Aparece disponible en la navegación del Sidebar bajo la organización correspondiente.
    4. Cero fallos al navegar hacia `/proyectos/<nuevo-id>?tab=resumen`.

---

## 🚀 4. Protocolo de Verificación y Criterio de Entrega

1. **Compilación estricta:**
   * Ejecutar `npx tsc --noEmit` y confirmar **0 errores de TypeScript**.
2. **Revisión del Candado Visual:**
   * Verificar que la vista de proyectos, header, sidebar y modales no tengan desbordamientos ni saltos visuales.
3. **Reporte estandarizado al Líder:**
   * Al culminar, enviar a través de `orca terminal send` el mensaje:
     ```text
     [ROL: SUBAGENTE -> LIDER] [REPORTE #GOVERNANCE-01: LISTO]
     - Estado: LISTO (0 errores TypeScript)
     - Cambios realizados: Rol Administrador habilitado, matriz de 5 módulos con checks y acordeón desplegable en Configuración, creación de usuarios y subida de proyectos verificada.
     - Archivos afectados: ProjectPerspectiveContext.tsx, Header.tsx, user.ts, project.types.ts, SettingsPage.tsx, CreateProjectModal.tsx
     - Siguiente paso: Esperando validación final de Antigravity.
     ```
