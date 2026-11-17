# Bitácora · 17-nov-2026 · RLS del BLOQUE B — políticas de las 6 entidades (orden del responsable)

**Proyecto Supabase:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** agente opencode vía MCP de Supabase
**Autorización:** orden expresa del responsable (17-nov): *"las policy RLS y demás se deben crear, te lo dije"* —
con el **patrón exacto de las tablas de catálogo 1–9** y pruebas idénticas (`20261117-verificacion-seguridad-rls-gp.sql`).
**Fuente:** patrón del Hub verificado el 16-nov (4 políticas por tabla, `authenticated`, sin políticas `anon`).
**Nota de compatibilidad:** el `0004` corregido (16-nov) **omite toda tabla que ya tenga políticas** ⇒ no
genera RLS híbrido; al aplicarse solo añadirá helpers v2, triggers, índices y RLS para las tablas 19–34.

---

## 1 · Aplicación

Migración registrada vía `apply_migration`: **`gp_entidades_principales_rls`** —
`ALTER TABLE ... ENABLE ROW LEVEL SECURITY` en las 6 + 24 políticas (4 por tabla, misma convención
`<tabla>_select/_insert/_update/_delete`). SIN DROP destructivo (los `DROP POLICY IF EXISTS` son del
patrón idempotente ya usado en 9–12).

## 2 · Pruebas — TAL CUAL el script de las tablas 1–9

**§0 Helpers requeridos por el patrón:**
| Helper | Estado |
|---|---|
| `user_can_use_app` | ✅ FUNCTION (viva) |
| `is_platform_admin` | ✅ FUNCTION (viva) |
| `gp_is_empresa_member` · `gp_is_project_member` | ⏳ llegan con `0004` (esperado en esta etapa) |

**§1 Resumen por tabla (columnas · políticas · RLS):**
| Tabla | Columnas | Políticas | RLS |
|---|---|---|---|
| `gp_proyectos` | 24 | **4** | **true** |
| `gp_personas` | 19 | **4** | **true** |
| `gp_fases` | 20 | **4** | **true** |
| `gp_nodos_edt` | 31 | **4** | **true** |
| `gp_tareas` | 25 | **4** | **true** |
| `gp_equipos` | 13 | **4** | **true** |

**§3 Tablas gp_* SIN RLS: `[]` (0 filas)** ✅
**§4 Políticas permisivas (qual=true / with_check=true): `[]` (0 filas)** ✅
**§5 Políticas para `anon`: `[]` (0 filas)** ✅

**§7 Detalle de políticas (24, patrón idéntico en las 6 tablas):**
| Política | cmd | roles | expresión |
|---|---|---|---|
| `<tabla>_select` | SELECT | authenticated | USING `user_can_use_app('gestor-proyectos'::text)` |
| `<tabla>_insert` | INSERT | authenticated | WITH CHECK `is_platform_admin()` |
| `<tabla>_update` | UPDATE | authenticated | USING + WITH CHECK `is_platform_admin()` |
| `<tabla>_delete` | DELETE | authenticated | USING `is_platform_admin()` |

**§9 Resumen final de salud:**
| tablas_gp | sin_rls | politicas_permisivas | politicas_anon |
|---|---|---|---|
| **20** | **0** ✅ | **0** ✅ | **0** ✅ |

**Prueba anon (PostgREST, con anon key):** las 6 tablas → **`200` + `[]`**:
`gp_proyectos` · `gp_personas` · `gp_fases` · `gp_nodos_edt` · `gp_tareas` · `gp_equipos` —
idéntico al patrón verificado para las tablas de catálogo: `anon` alcanza el endpoint y RLS le devuelve cero filas.

## 3 · Implicación operativa (documentada para el equipo)

- Lectura de las 6 entidades: cualquier usuario autenticado con `gestor-proyectos` contratado en el Hub.
- Escritura: reservada a `is_platform_admin()` (fail-closed), igual que los catálogos. Si más adelante
  el responsable decide granularidad por empresa/proyecto (`0-INDICE` §6.3 sigue abierta: ¿admin de la
  app administra toda la cartera o solo sus proyectos?), se añaden/refinan políticas EXPLÍCITAMENTE
  (los helpers `gp_is_empresa_member`/`gp_is_project_member` llegan con `0004`); nunca en silencio.

## 4 · Corrección de documentación asociada

- `20261117-aplicacion-bloque-b-0002-entidades.md` §5 → marcado **SUPERADO** por esta bitácora.
- Tracker `5.2` PASO 2 y PASO 4 → actualizados (la regla "no crear políticas a mano" queda sustituida
  por este orden del responsable; `0004` omite tablas con políticas ya existentes).
- `0-INDICE` §3 → línea añadida al bloque 17-nov.
