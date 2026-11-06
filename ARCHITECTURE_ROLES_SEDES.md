# ARQUITECTURA GENERAL: GOBERNANZA, ROLES Y MODELO MULTI-SEDE

## 1. Concepto Rector del Sistema
Este sistema es una plataforma de supervisión, planificación y control de operaciones desarrollada con estándar PM4R (BID) / PMI y ejecución ágil en territorio.

- **Sede Central:** Somos nosotros (la Oficina de Coordinación Central / PMO / Gerencia de Supervisión). Desde aquí se planifica, se aprueban las líneas base, se definen los cronogramas maestros y se monitorea el avance consolidado.
- **Sedes Supervisadas (Capa Territorial / Descentralizada):** Son los puntos o unidades descentralizadas donde ocurre la ejecución física o administrativa. Cada sede cuenta con su propio personal, avances locales, evidencias y nudos críticos.

### Adaptabilidad por Sector de Negocio:
1. **Educación / Sector Público:** Sede Central (MINEDU/DRE) monitorea a las UGEL y DRE (ej. UGEL Huancayo, UGEL Satipo, DRE Junín).
2. **Construcción e Inmobiliaria:** Sede Central monitorea Obras / Proyectos (ej. Proyecto Casa Blanca, Edificio Monteverde).
3. **Retail y Cafeterías:** Sede Central monitorea Sucursales, Locales comerciales o Puntos de venta.
4. **Corporativo / Entidad Única:** Sede Central monitorea Direcciones Generales, Gerencias o Jefaturas internas.

---

## 2. Jerarquía de Roles y Matriz de Responsabilidad

| Rol en el Sistema | Equivalencia Empresarial / Sectorial | Nivel de Decisión | Atribuciones y Permisos |
| :--- | :--- | :--- | :--- |
| **Coordinador General** | Gerente de Proyecto / Gerente General / Director Rector | Estratégico (Sede Central) | **Exclusividad total:** Aprobar y congelar Líneas Base, autorizar prórrogas formales, delegar permisos temporales de edición a coordinadores y reabrir planificación. |
| **Coordinador Regional / Marco** | Jefe de Área / Gerente de Operaciones / Supervisor Zonal | Táctico / Supervisión | Supervisa el grupo de sedes asignadas, monitorea el cumplimiento de hitos y dependencias. Edición restringida a lo delegado por el Coordinador General. |
| **Gestor de Campo / Especialista** | Residente de Obra / Especialista UGEL / Monitor Territorial / Trabajador de Campo | Operativo (En Sede) | Actualiza el avance físico (0-100%), completa checklists de tareas operativas, registra evidencias (actas, PECOSA) y reporta nudos críticos / bloqueos. **No puede modificar plazos marco del proyecto.** |

---

## 3. Relación entre Módulos del Sistema

1. **Módulo Proyecto (`/cronograma` o `/proyecto`):**
   - Reside en la **Sede Central**.
   - Alberga el Cronograma Maestro (Gantt) y la Estructura Desglosada del Trabajo (EDT / Organigrama).
   - Administra la Línea Base oficial, la Ruta Crítica (CPM) y las dependencias (Fin-Inicio, Inicio-Inicio, Fin-Fin).
2. **Módulo Sedes (`/sedes`):**
   - Representa la **Capa de Supervisión Territorial**.
   - Cada tarjeta o fila corresponde a una sede (ej. UGEL Huancayo, Edificio Monteverde).
   - Su panel lateral (Drawer) permite actualizar el cumplimiento de esa sede específica para cada entregable sin romper el calendario general.
3. **Módulo Tareas (`/tareas`):**
   - Corresponde a la **Gestión Ágil / Micro-operativa** del personal de campo.
   - Cada paquete de trabajo de la EDT se alimenta del checklist diario de actividades en este módulo.

---

## 4. Reglas Estrictas de Programación y UI
- Las fechas contractuales del proyecto solo se editan desde la Sede Central con perfil de Coordinador General o permiso delegado.
- Los menús y filtros WBS no deben contener niveles ficticios ni textos saturados.
- Todo desarrollo nuevo debe consultar este archivo como Fuente Única de Verdad metodológica.
