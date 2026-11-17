# Bitácora · 17-nov-2026 · Aplicación Tabla 12 `gp_tipos_archivo_c` vía MCP (BLOQUE A cerrado)

**Proyecto Supabase:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** agente opencode vía MCP de Supabase
(remoto, scope `project_ref`; PAT en `~/.config/opencode/opencode.jsonc`, NUNCA en doc2)
**Fuente SQL:** `3.7-SQL-propuesto-sin-ejecutar/20261117_0023_gp_tipos_archivo_c.sql` (aplicado VERBATIM)
**Autorización:** instrucción del responsable del 17-nov ("antes de crear cada tabla deben indicarme
de qué trata… luego recién me indicas que ya está") — tomada como la palabra "aplica".
**Plan previo:** `7-Bitacoras/20261117-plan-mcp-aplicacion-tablas-9-12.md`

---

## 1 · PASO 0 — Verificación de terreno (antes de tocar nada)

13 tablas `gp_*` en `public`. **Tablas 9, 10 y 11 YA EXISTÍAN** (creadas por el responsable):

| Tabla | Columnas | RLS | Políticas | Filas | Códigos en vivo |
|---|---|---|---|---|---|
| `gp_tipos_reunion_c` | 10 | true | 4 | **8** | KICKOFF, SEGUIMIENTO, COMITE, PLANIFICACION, REVISION, RETROSPECTIVA, CIERRE, DAILY |
| `gp_estados_reunion_c` | 10 | true | 4 | **6** | PROGRAMADA, EN_CURSO, REALIZADA, CANCELADA, POSPUESTA, REPROGRAMADA |
| `gp_tipos_avance_c` | 10 | true | 4 | **6** | FISICO, FINANCIERO, HITO, CRONOGRAMA, COSTO, CALIDAD |

⇒ **`0022` queda SATISFECHO EN VIVO** (códigos exactos, sin sobrantes ni faltantes). No se aplicó.
⇒ Única pendiente del Bloque A: **tabla 12 `gp_tipos_archivo_c`** (no existía).

## 2 · Referentes reales (exigencia del responsable)

- Barrido de `src/` del Gestor (`tipo_archivo|tipoArchivo|tipos_archivo|tiposArchivo`): **0 coincidencias en código** — la app actual NO define vocabulario de tipos de archivo (tareas usan `attachments: string[]` crudo; cronograma adjunta PDF de referencia sin clasificar).
- Barrido de adjuntos (`adjunt|attachment|upload|mime|fileType`): solo adjunción cruda, sin tipología.
- **Conclusión:** no hay referentes a migrar ⇒ se define aquí, como autorizó el responsable. Fuente del seed: gestión documental PMI/PMBOK (`0023` §2).
- **Decisión abierta que esto CIERRA:** `4.2` §85 ("¿derivar del mime o lista?") → **LISTA**: el mime describe el formato físico; el tipo describe la NATURALEZA documental (mime no puede distinguir un acta de un informe). `3.8` §230 ("sin seed hasta definición") → la definición es `0023`.
- Consumidor futuro: `gp_archivos.tipo_codigo` (FK NULL-able, `ON UPDATE CASCADE`, en `0003`/`6.4` L1732 — Bloque C).

## 3 · Qué trata la tabla (explicado al responsable ANTES de crear)

Catálogo que clasifica cada archivo adjunto del proyecto por su naturaleza documental:
7 tipos (`PLANO`, `CONTRATO`, `FOTO`, `ACTA`, `INFORME`, `CORRESPONDENCIA`, `OTRO`), con
`nombre` internacional en inglés + `alias` en español + `descripcion` amigable. NO vacía: seed incluido.

## 4 · Aplicación

- Vía `apply_migration` (MCP) · nombre registrado: `gp_tipos_archivo_c` · resultado: **success**.
- Contenido verbatim de `0023`: CREATE TABLE IF NOT EXISTS (10 col) + ADD COLUMN IF NOT EXISTS alias + seed 7 filas `ON CONFLICT (codigo) DO UPDATE` + COMMENT ON TABLE único + RLS con 4 políticas (sin DROP destructivo; los `DROP POLICY IF EXISTS` son del patrón idempotente ya usado en 9–11).

## 5 · Verificación post-aplicación (evidencia en vivo, 17-nov)

| Criterio | Esperado | **Real** |
|---|---|---|
| Columnas | 10 | **10** ✅ |
| Filas | 7 | **7** ✅ |
| Políticas | 4 | **4** ✅ |
| RLS | true | **true** ✅ |
| Alias nulos | 0 | **0** ✅ |
| COMMENT ON TABLE | presente, con columnas | **770 chars** ✅ |

**Políticas (idénticas al patrón de las tablas 9–11):**
| Política | cmd | roles | expresión |
|---|---|---|---|
| `gp_tipos_archivo_c_select` | SELECT | authenticated | USING `user_can_use_app('gestor-proyectos'::text)` |
| `gp_tipos_archivo_c_insert` | INSERT | authenticated | WITH CHECK `is_platform_admin()` |
| `gp_tipos_archivo_c_update` | UPDATE | authenticated | USING + WITH CHECK `is_platform_admin()` |
| `gp_tipos_archivo_c_delete` | DELETE | authenticated | USING `is_platform_admin()` |

**Filas en vivo (orden 1–7, todas activo=true):**
PLANO/Drawing/Plano · CONTRATO/Contract/Contrato · FOTO/Photo/Fotografía · ACTA/Minutes/Acta · INFORME/Report/Informe · CORRESPONDENCIA/Correspondence/Correspondencia · OTRO/Other/Otro

**Estructura de columnas (information_schema):** id uuid NOT NULL · codigo text NOT NULL (UNIQUE) · nombre text NOT NULL · alias text · descripcion text · activo boolean NOT NULL · orden integer · metadata jsonb NOT NULL · created_at timestamptz NOT NULL · updated_at timestamptz NOT NULL.

**Prueba anon (PostgREST, con la anon key del `.env`):** `GET /rest/v1/gp_tipos_archivo_c?select=codigo&limit=5` → **STATUS 200 · BODY `[]`** — mismo patrón verificado el 16-nov: `anon` alcanza el endpoint pero RLS le devuelve cero filas (no tiene política).

## 6 · Estado resultante

- **BLOQUE A COMPLETO: 12/12** (13 tablas `gp_*` en total contando `gp_roles_proyecto_v2_c`).
- Siguiente paso del modelo (otra sesión/otro agente): **BLOQUE B — entidades principales** (`0002`, tablas 13–18), ya auditado en `6.4` FASE 3.
- Para el agente de CONEXIONES: leer este catálogo vía `gpCatalogosService` (patrón de `6.3`: cliente/sesión compartida, servicio fail-closed); punto de conexión mapeado: selector de tipo de archivo en los adjuntos de tareas/cronograma cuando exista `gp_archivos`.

## 7 · Seguridad de credenciales

- El PAT fue pegado por el responsable en el plan (`.md` dentro del repo) → **retirado y ocultado en ese archivo**; vive solo en `~/.config/opencode/opencode.jsonc`. Regla: **jamás versionar tokens en doc2**.
