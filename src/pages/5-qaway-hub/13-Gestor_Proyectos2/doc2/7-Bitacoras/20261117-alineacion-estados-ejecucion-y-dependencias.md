# Bitácora · 17-nov-2026 · Alineación de Estados de Ejecución y Creación de Dependencias

**Proyecto Supabase:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** responsable en SQL Editor  
**Ámbito:** `gp_estados_ejecucion_c` · `gp_tipos_dependencia_c` · Componentes Tareas-2

---

## 1. Ajustes en Catálogo `gp_estados_ejecucion_c`
* **Transición de valor de negocio:**
  ```sql
  UPDATE public.gp_estados_ejecucion_c
  SET codigo = 'completado', nombre = 'Completado', updated_at = now()
  WHERE codigo = 'completada';
  ```
* **Baja lógica de estados sin UI:**
  ```sql
  UPDATE public.gp_estados_ejecucion_c
  SET activo = false, updated_at = now()
  WHERE codigo IN ('en_revision', 'bloqueada', 'cancelada');
  ```
* **Resultado verificado en BD:**
  * 3 filas activas (`completado`, `en_proceso`, `pendiente`).
  * 3 filas inactivas (`en_revision`, `bloqueada`, `cancelada`).

---

## 2. Creación de Tabla 6: `gp_tipos_dependencia_c`
* **Definición PMI/PMBOK:** `FS` (Fin a comienzo), `SS` (Comienzo a comienzo), `FF` (Fin a fin), `SF` (Comienzo a fin).
* **Columnas:** `id`, `codigo`, `nombre`, `alias`, `descripcion`, `activo`, `orden`, `metadata`, `created_at`, `updated_at`.
* **Políticas:** RLS activo, SELECT autenticado con `user_can_use_app('gestor-proyectos')`, INSERT/UPDATE/DELETE reservado a `is_platform_admin()`.

---

## 3. Integración en la App
* `gpCatalogosService.ts`: incorpora `TABLA_TIPOS_DEPENDENCIA` y helpers de lectura.
* `EstadoEjecucionCatalogoSelect.tsx`: componente desacoplado que solo lee estados `activo = true`.
* `Tareas2View.tsx`: sincronización de avance al 100% fija `'Completado'` (alineado con catálogo, preservando semáforos).
