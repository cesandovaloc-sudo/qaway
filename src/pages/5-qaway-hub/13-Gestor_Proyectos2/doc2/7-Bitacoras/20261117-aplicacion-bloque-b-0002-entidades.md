# Bitácora · 17-nov-2026 · Aplicación BLOQUE B — `0002` Entidades principales (tablas 13–18)

**Proyecto Supabase:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** agente opencode vía MCP de Supabase
**Fuente SQL:** `3.7-SQL-propuesto-sin-ejecutar/20261112_0002_gp_entidades_principales.sql` — aplicado **VERBATIM** (migración 1) + **6 COMMENT ON TABLE** (migración 2, añadido por regla de la casa; `0002` y `6.4` no los traen)
**Autorización:** "esta bien procede aplica" del responsable (17-nov), tras exposición previa del contenido de cada tabla.

---

## 1 · Exposición previa (cumplida antes de crear)

Contenido de las 6 tablas explicado columna por columna al responsable, con criterio anclado a referentes
reales verificados en vivo: `gestor_proyectos` (1 proyecto: code/name/region/subtext/budget/sponsor/
risk_level/metodologia) y `gestor_cronograma_items` (6,701 filas: code/kind/parent/progress/status/
baseline_*/actual_*/region). Cero columnas inventadas: todo sale de `0002` aprobado (auditado en
`3.6` §7.2 y `6.4` R-1) + tracker `5.2`.

## 2 · Referentes y prerrequisitos (verificados en vivo antes de aplicar)

| Prerrequisito | Estado |
|---|---|
| `tenants` (7 filas) · `users` (6) · `gestor_unidades` (251) | ✅ vivos |
| Catálogos FK de `0002`: tablas 1, 2, 3, 4 | ✅ vivos (Bloque A) |
| `gp_roles_proyecto_c` para FK futura de tabla 27 | ✅ existe (deuda `0013`) |
| Cadena Etapa 4 (`0006a→0005→0006b`) | ⏳ pendiente — **NO bloquea** `0002` (es infra RLS/`app_catalog`); `0004` va al final |

## 3 · Aplicación (vía `apply_migration`)

| Migración registrada | Contenido | Resultado |
|---|---|---|
| `gp_entidades_principales` | `0002` verbatim: 6 CREATE TABLE + 20 índices + FK diferida | ✅ success |
| `gp_entidades_principales_comentarios` | 6 COMMENT ON TABLE (solo con contenido aprobado de 0002/tracker/3.3) | ✅ success |

## 4 · Verificación viva (17-nov)

| Tabla | # | Columnas esperadas | Real | COMMENT |
|---|---|---|---|---|
| `gp_proyectos` | 13 | 24 | **24** ✅ | 2,119 chars ✅ |
| `gp_personas` | 14 | 19 | **19** ✅ | 977 ✅ |
| `gp_fases` | 15 | 20 | **20** ✅ | 762 ✅ |
| `gp_nodos_edt` | 16 | 31 | **31** ✅ | 1,583 ✅ |
| `gp_tareas` | 17 | 25 | **25** ✅ | 1,014 ✅ |
| `gp_equipos` | 18 | 13 | **13** ✅ | 603 ✅ |

- Todas **vacías** (0 filas; correcto: entidades operativas, sin seed).
- **Políticas: 0** — correcto por diseño: la RLS de estas 6 llega con `0004` (PASO 4 del tracker, al final).
- **22 FKs verificadas** y correctas, incluidas: `gp_proyectos_estado_codigo_fkey → gp_estados_proyecto_c` ·
  `gp_tareas_estado_codigo_fkey → gp_estados_ejecucion_c` · `gp_tareas_prioridad_codigo_fkey → gp_prioridades_c` ·
  `gp_nodos_edt_sede_unidad_id_fkey → gestor_unidades(id)` · **`gp_proyectos_responsable_fk → gp_personas`
  (FK diferida creada correctamente al final del archivo)**.
- **4 índices únicos presentes:** `uq_gp_proyectos_empresa_codigo` · `uq_gp_personas_empresa_user` ·
  `uq_gp_personas_empresa_documento` · `uq_gp_nodos_edt_wbs`.
- **CHECKs de fechas** en las 5 tablas con fechas + `gp_proyectos_riesgo_ck` (bajo|medio|alto|critico) + `kind CHECK (hito|subproceso)`.
- **Total físico `gp_*` = 20** = 18 numeradas (Bloque A 1–12 + Bloque B 13–18) + 2 extras planificadas
  (`5b gp_roles_proyecto_v2_c`, `7.1 gp_categorias_entregable_c`). La fórmula del tracker (§`5.3` §1)
  cuenta numeradas: **18/34**.

## 5 · Seguridad (ventana conocida y planificada)

- Prueba anon (PostgREST): `gp_proyectos` y `gp_nodos_edt` → **200 + `[]`** (accesibles, vacías).
- **RLS NO activa aún en las 6** (llega con `0004`, PASO 4). Ventana aceptable porque las tablas están
  vacías y el backfill (`0100`, Etapa 7) solo corre DESPUÉS de `0004`. **Regla operativa: no cargar
  datos ni conectar UI de escritura hasta aplicar `0004`.** No se crearon políticas a mano (lo prohíbe
  el PASO 4 del tracker para evitar RLS híbrido).

> **⚠️ §5 SUPERADO (17-nov, horas después):** el responsable ordenó crear las políticas YA, con el
> patrón de las tablas 1–9. RLS aplicada y verificada en las 6 entidades (script de verificación
> completo en verde): ver `20261117-aplicacion-rls-entidades-bloque-b.md`.

## 6 · Estado resultante y siguiente paso

- **18/34 numeradas.** Siguiente: **PASO 3 · BLOQUES C+D** — `0003_gp_entidades_operativas_y_relaciones.sql`
  (16 tablas: 8 operativas 19–26 + 8 relaciones 27–34, con 2 FKs diferidas internas).
- El responsable ya pidió el mismo procedimiento: **exposición previa del contenido de cada tabla
  antes de aplicar** (hacerla con el mismo rigor que esta).
- R-1 de `6.4` satisfecho (`0007` antes de `0002` ✓ en vivo). R-2 (`0008` antes de `0003` por
  UNIQUE(codigo)): `gp_roles_proyecto_c` ya existe limpia desde el 16-nov ⇒ `0008` sin objeto, `0003`
  puede aplicarse directamente.
