# Bitácora · 16-nov-2026 · Auditoría real de los 4 catálogos `gp_*`

**Proyecto Supabase:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** responsable, en el SQL Editor
**Método:** script único de auditoría de solo lectura (9 secciones) que devuelve una única
tabla `(seccion, clave, valor)`. Sin DDL, sin `DROP`, sin `TRUNCATE`.
**Resultado global:** 4 de 12 tablas del BLOQUE A creadas. Nada se rompió.

---

## 1 · Inventario (lo que existe de verdad)

| Tabla | RLS | Políticas | Columnas | Filas |
|---|---|---|---|---|
| `gp_estados_proyecto_c` | ✅ | 4 | 9 | 5 |
| `gp_tipos_proyecto_c` | ✅ | 4 | 9 | 6 |
| `gp_estados_ejecucion_c` | ✅ | 4 | 10 | 6 |
| `gp_prioridades_c` | ✅ | 4 | 10 | 4 |

`gp_roles_proyecto_c` **no existe** (tabla 5 del tracker). `gp_estados_tarea_c` no se crea
(sustituida por `gp_estados_ejecucion_c`).

## 2 · Columnas (únicas diferencias frente a `0001`)

En `gp_estados_ejecucion_c` y `gp_prioridades_c` hay una columna **`descripcion text`
NULL-able** que `0001` no traía. Todo lo demás coincide: tipos, `NOT NULL`, `UNIQUE(codigo)`.

**Decisión:** se **adopta** la columna (es opcional y útil) y se corrige la fuente, no la base
(regla de paridad). `0001` y `0007` ya la incluyen; el criterio C1 de `5.5` pasa a 10 columnas.

## 3 · Políticas (RLS) — patrón vivo, adoptado

Las 4 tablas tienen 4 políticas por operación, del Hub:

- `_select` → `user_can_use_app('gestor-proyectos')` (solo quien tiene la app)
- `_insert` → `is_platform_admin()` · `_update` → `is_platform_admin()` · `_delete` → `is_platform_admin()`

Es **mejor** que el par escrito en `0004` (`_select USING(true)` leía para cualquier rol
autenticado). **Corrección aplicada a `0004` (v3):** el bucle de catálogos **omite cualquier
tabla que ya tenga políticas** y, en tablas nuevas, crea este mismo juego de 4. Con esto
`0004` ya se puede aplicar sin RLS híbrido ni ampliación de lectura.

`anon` no tiene ninguna política y **se comprobó** por PostgREST con la anon key del `.env`:
tabla existente → `200` + `[]`; tabla inexistente → `404`.

## 4 · Permisos (GRANT)

`anon` y `authenticated` tienen `ALL` (incluido `TRUNCATE`) en las 4 tablas. Es el **GRANT por
defecto de Supabase** en `public`: no es un error de este módulo y no se filtra porque la
política manda (y `TRUNCATE` no es alcanzable por PostgREST). **Acción: ninguna ahora**
(higiene opcional, no bloquea nada).

## 5 · Seeds (confirmados uno a uno)

| Tabla | Valores en vivo |
|---|---|
| `gp_estados_proyecto_c` | `planificacion, en_curso, pausado, completado, cancelado` |
| `gp_tipos_proyecto_c` | `inversion, mantenimiento, mejora_interna, obra_publica, otro, servicio` |
| `gp_estados_ejecucion_c` | `pendiente, en_proceso, en_revision, completada, bloqueada, cancelada` |
| `gp_prioridades_c` | `baja/1, media/2, alta/3, urgente/4` (todas activas) |

Sin sobrantes ni faltantes. `urgente` **confirmado en vivo** (no `critica`).
⇒ `0009` y `0007` están **satisfechos en vivo**; re-ejecutarlos no cambia nada.

## 6 · Funciones / triggers `gp_*`

Las secciones de funciones y triggers del módulo devolvieron **cero filas**: no hay todavía
`gp_*` funciones ni triggers de `updated_at`. Es lo esperado: son alcance del Paso 4 (`0004`)
y de `0010`, aún no aplicados. Ojo: las políticas usan `is_platform_admin()` y
`user_can_use_app()` — helpers **del Hub**, que sí existen; por eso el RLS funciona.

## 7 · Contexto Hub (`gestor_unidades`)

`filas=251 · rls=t · politicas=1 · columnas=13` ⇒ las 251 semillas siguen intactas.

---

## Consecuencias para los documentos (aplicadas hoy)

1. `5.2` — filas 1-4 del tracker con evidencia y códigos exactos; fila 5 corregida a "no existe".
2. `5.5` — C1 a 10 columnas, C6/C7/C8 al patrón vivo de 4 políticas.
3. `5.4` §3 — discrepancia de roles **disuelta** (la tabla no existe).
4. `0001` + `0007` — `descripcion` adoptada (DDL y guardia de forma).
5. `0004` — bucle de catálogos corregido (no duplica, no amplía lectura).
6. `5.3` — nota de estado del 16-nov en §1.

## 8 · Tabla 5 creada después de la auditoría — `gp_roles_proyecto_c`

**Ejecutada por el responsable en el SQL Editor** (bloque autocontenido: `CREATE TABLE IF NOT EXISTS`
+ seed de 6 roles con la matriz de `6.3` + RLS de 4 políticas + comprobación). Evidencia pegada
+por el responsable, salida literal:

```json
[{ "columnas": 10, "filas": 6, "politicas": 4, "rls": true }]
```

**Lectura vs lo esperado:**

| Criterio | Esperado | Medido | Veredicto |
|---|---|---|---|
| Columnas | 10 (`0001`) | 10 | ✅ paridad exacta con la fuente |
| Filas (seed) | 6 roles de `6.3` | 6 | ✅ |
| Políticas | 4 (`_select/_insert/_update/_delete`) | 4 | ✅ patrón del Hub replicado |
| RLS | `true` | `true` | ✅ |

Con esto **la discrepancia 9↔10 columnas queda cerrada por la vía correcta**: la tabla nunca
existió, se creó con la forma canónica de `0001` y el seed de `0008` §3. `0008` como migración
(§0-§2: dump y `ALTER`) **no se aplicará**: no tiene objeto. `0009` sigue satisfecho en vivo.

**Estado del Paso 1: 6 de 12 catálogos.** Tabla 6 `gp_tipos_dependencia_c` creada con migración `0014` (aditiva, con columna `alias`).

---

## 10 · 17-nov — Catálogo `gp_tipos_dependencia_c` (tabla 6) creado y verificado (parcial)

**Migración:** `20261117_0014_gp_tipos_dependencia_c.sql` (aditiva; soporta tabla preexistente sin `alias`).
**Valores (4, estándar PMI/PMBOK):** FS, SS, FF, SF — con `alias` en español (Fin a comienzo · Comienzo a comienzo · Fin a fin · Comienzo a fin).

**Verificación:**

| Criterio | Esperado | Medido | Veredicto |
|---|---|---|---|
| Filas (seed) | 4 | 4 | ✅ |
| `alias` poblado | sin NULL | 4/4 (detalle compartido) | ✅ |
| Funciones de seguridad | `user_can_use_app`, `is_platform_admin` | ambas presentes | ✅ |
| RLS habilitado | `true` | `true` | ✅ |
| RLS habilitado | `true` | `true` | ✅ |
| Políticas totales | 4 (previstas) | **5 (finales)** | ✅ (admin_all + 4 estándar) |
| `admin_all` (ALL) | — | `is_platform_admin()` | ✅ seguro (redundante, conservado) |
| `_select` (SELECT) | `user_can_use_app(...)` | `user_can_use_app(...)` | ✅ |
| `select_auth` (SELECT) | — | eliminada (`DROP`) | ✅ agujero cerrado |
| `_insert/_update/_delete` | `is_platform_admin()` | `is_platform_admin()` | ✅ |
| Políticas para `anon` | 0 | 0 | ✅ |

**Nota:** la tabla ya existía en vivo sin `alias`; el script se hizo aditivo (`ALTER ADD COLUMN` + backfill) sin pérdida de datos. `COMMENT ON TABLE` único con definición de columnas incluida. `NOT NULL` en `alias` quedó opcional (comentado) hasta confirmar 0 NULLs.

**Acción de seguridad ejecutada:** `DROP POLICY gp_tipos_dependencia_c_select_auth` ✅ (agujero cerrado). `admin_all` conservado. **Tabla 6 verificada al 100%.**

**Auditoría RLS global ejecutada (solo lectura):** todas las tablas `gp_*` tienen 4 políticas (5 en `gp_tipos_dependencia_c` tras la limpieza) y **ninguna** tiene `select_auth` (qual=true). No hay agujero global. Patrón consistente y seguro en todo el catálogo.

**Siguiente:** tabla 7 `gp_tipos_entregable_c` (vacía hasta definición funcional, FK NULL-able).

---

## 11 · 17-nov — Catálogo `gp_tipos_entregable_c` (tabla 7) creado y verificado

**Migración:** `20261117_0015_gp_tipos_entregable_c.sql` (aditiva; soporta tabla preexistente sin `alias`/`descripcion`).
**Valores:** 0 (vacía por diseño; se llena solo cuando el negocio defina la tipología).

**Verificación:**

| Criterio | Esperado | Medido | Veredicto |
|---|---|---|---|
| Columnas | 10 | 10 | ✅ |
| Filas (seed) | 0 (vacía por diseño) | 0 | ✅ |
| Políticas RLS | 4 | 4 | ✅ |
| RLS habilitado | `true` | `true` | ✅ |
| Políticas para `anon` | 0 | 0 | ✅ |
| `select_auth` (qual=true) | 0 | 0 | ✅ (sin agujero) |

**Nota:** tabla vacía por diseño; FK `gp_entregables.tipo_codigo` es NULL-able, no rompe nada. `COMMENT ON TABLE` único con definición de columnas. Alias/descripcion agregados de forma aditiva.

---

## 12 · 17-nov — Catálogos de entregable divididos (0016): 7.1 categorías + 7 tipos

**Migración:** `20261117_0016_gp_categorias_entregable_c_y_tipos.sql` (aditiva, idempotente).

**Decisión de diseño (corrección del usuario):** se dividen en dos tablas normalizadas:
- `gp_categorias_entregable_c` (tabla 7.1): 24 categorías con icono Lucide y alcance.
- `gp_tipos_entregable_c` (tabla 7): 261 tipos con `categoria_codigo` FK a 7.1, icono por tipo.

`codigo` (GEN-001) es UNIQUE, no PK (PK sigue siendo `id` uuid).

**Limpieza:** si se aplicó la versión integrada previa, se quitan las columnas denormalizadas `categoria` y `categoria_icono`.
**Nombres:** `nombre` y `alias` duplican el español (no hay término inglés estándar que sume; regla "verifica, no fuerces").
**Iconos inválidos corregidos en seed:** `chart-funnel` → `filter`, `clipboard-search` → `file-search`.
**Alcance:** guardado en `metadata->>'alcance'` (Transversal/Proyectos/Sectorial).

**Post-verificación esperada:** categorías: columnas=12 · filas=24 · políticas=4; tipos: columnas=12 · filas=261 · categorías distintas=24 · políticas=4.

---

## Lo que sigue

- **Paso 1 del tracker:** tablas **6 a 12** (los catálogos restantes de `0001`).
- **Paso 4:** aplicar `0004` v3 (ya seguro) → entonces aparecen funciones, triggers de
  `updated_at` y los índices.
- **Paso 2 en adelante:** `0002` (entidades principales) y `0003` (operativas y relaciones).
- `0008` deja de ser necesario; `0009`/`0007` ya están reflejados en vivo.

---

## 9 · 16-nov (mismo día) — Catálogo canónico `gp_roles_proyecto_v2_c` (internacional)

Decisión aprobada por el responsable ("aplica"): los 6 códigos legacy de `gp_roles_proyecto_c`
(administrador/gestor/coordinador/supervisor/colaborador/lector) son terminología local, no
estándar — ninguna app de referencia (Jira, Asana, ClickUp) los usa — y 4 de ellos eran
idénticos en permisos ({}). Se creó una tabla nueva con 4 roles de comportamiento distinto
y nombres internacionales, con `alias` en español para la interfaz.

**Archivos:**
- `3.7/.../20261116_0012_gp_roles_proyecto_v2_c.sql` (CREATE + seed 4 + RLS + comentarios)
- `3.7/.../20261116_0013_comentarios_y_deuda.sql` (comentarios de las 5 tablas + marca de deuda)

**Roles (esperado tras pegar 0012):**

| codigo   | nombre  | alias (español)        | permisos (acción → true) |
|----------|---------|------------------------|--------------------------|
| owner    | Owner   | Propietario del proyecto | iniciar, pausar, reanudar, completar, cancelar, reabrir, editar_tipo, asignar_roles |
| manager  | Manager | Gestor del proyecto     | iniciar, pausar, reanudar, completar |
| member   | Member  | Miembro del equipo      | editar_tareas, comentar |
| viewer   | Viewer  | Observador              | (ninguno — solo lectura) |

**Verificación esperada (pegar salida real cuando se ejecute):**
`columnas=11 · filas=4 · politicas=4 · rls=true · alias_vacios=0`.

**Deuda registrada:** `gp_roles_proyecto_c` queda marcada DEPRECIADA (COMMENT) y no se
borra hasta migrar el FK de `gp_proyecto_miembros_r` (tabla 27) y actualizar
`gpCicloVidaService.ts` (mapeo ampliado con los códigos nuevos en esta misma sesión).

**Verificación ejecutada (16-nov, salida real):**
- `gp_roles_proyecto_v2_c`: 11 columnas · 4 filas · 4 políticas · RLS `true` · 0 alias vacíos.
- Roles: owner (Propietario del proyecto, 8 permisos) · manager (Gestor del proyecto, 4) · member (Miembro del equipo, 2) · viewer (Observador, 0).
- 6 de 6 tablas con glosario en `COMMENT ON TABLE`.
- `gp_roles_proyecto_c` marcada DEPRECIADA (deuda) en `0013`, sin borrar.
