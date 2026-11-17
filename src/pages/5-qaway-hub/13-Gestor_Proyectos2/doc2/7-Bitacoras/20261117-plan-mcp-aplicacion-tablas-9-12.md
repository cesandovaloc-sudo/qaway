# Bitácora · 17-nov-2026 · Plan de aplicación vía MCP — Tablas 9–12 del Bloque A

**Proyecto Supabase:** `qrusdsqgygfolxfrafyd` (Qaway Lab Project)
**Vía de ejecución:** MCP de Supabase (remote, `https://mcp.supabase.com/mcp?project_ref=qrusdsqgygfolxfrafyd`)
**Estado al abrir este plan:** tablas 1–8 y 5b ✅ verificadas · 9–12 pendientes (tracker `5.2`) — el
responsable no recuerda si 9/10 ya se aplicaron, por eso el PASO 0 verifica en vivo antes de tocar nada.

---

## 0 · Reglas que aplican

1. Nada se ejecuta sin la palabra **"aplica"** del responsable (regla nº1 de `0-INDICE`).
2. Todos los SQL son **aditivos e idempotentes** (sin DROP/TRUNCATE): re-ejecutar no duplica.
3. Si un paso falla: copiar el error íntegro a bitácora, corregir la fuente y re-ejecutar **ese** paso.
4. Cada paso termina con su verificación pegada en bitácora. **Sin evidencia, no se marca ✅.**

---

## PASO 0 · Verificación de terreno (siempre primero)

```sql
-- 0.1 Tablas gp_* existentes en public
select table_name
from information_schema.tables
where table_schema = 'public' and table_name like 'gp\_%' escape '\'
order by 1;

-- 0.2 Estado por tabla: columnas · RLS · políticas
select c.relname as tabla,
       (select count(*) from information_schema.columns col
         where col.table_schema='public' and col.table_name=c.relname) as columnas,
       c.relrowsecurity as rls,
       (select count(*) from pg_policies p
         where p.schemaname='public' and p.tablename=c.relname) as politicas
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname='public' and c.relkind='r' and c.relname like 'gp\_%' escape '\'
order by 1;
```

**Decisión según resultado:**
- Si NO existen `gp_tipos_reunion_c` / `gp_estados_reunion_c` / `gp_tipos_avance_c` / `gp_tipos_archivo_c` → crear con los PASOS 1–4.
- Si ya existe alguna (p. ej. 9/10 aplicadas a mano) → **omitir su paso** y aplicar `0022` (seed idempotente) y `0023` solo si falta la 12.

---

## PASO 1 · Tabla 9 `gp_tipos_reunion_c` — SQL `20261117_0019`

- Ejecutar `3.7-SQL-propuesto-sin-ejecutar/20261117_0019_gp_tipos_reunion_c.sql` (completo).
- **Verificación:** existe · 10 columnas · RLS true · 4 políticas (patrón del Hub) · 0 filas (se crea vacía por diseño).

## PASO 2 · Tabla 10 `gp_estados_reunion_c` — SQL `20261117_0020`

- Ejecutar `20261117_0020_gp_estados_reunion_c.sql` (completo).
- **Verificación:** ídem Paso 1 (10 columnas · RLS true · 4 políticas · 0 filas).

## PASO 3 · Tabla 11 `gp_tipos_avance_c` — SQL `20261117_0021`

- Ejecutar `20261117_0021_gp_tipos_avance_c.sql` (completo).
- **Verificación:** ídem (10 columnas · RLS true · 4 políticas · 0 filas).

## PASO 4 · Seeds de 9/10/11 — SQL `20261117_0022` + Tabla 12 `gp_tipos_archivo_c` — SQL `20261117_0023`

- Ejecutar `20261117_0022_seed_gp_tipos_reunion_estados_avance.sql` (autocontenido: crea si faltan y sembraría).
- Ejecutar `20261117_0023_gp_tipos_archivo_c.sql` (tabla 12 **con seed incluido**).

### Verificación final del Bloque A (pegar resultado en bitácora)

```sql
select 'gp_tipos_reunion_c' tabla, count(*) filas from public.gp_tipos_reunion_c
union all select 'gp_estados_reunion_c', count(*) from public.gp_estados_reunion_c
union all select 'gp_tipos_avance_c', count(*) from public.gp_tipos_avance_c
union all select 'gp_tipos_archivo_c', count(*) from public.gp_tipos_archivo_c
order by 1;

select tablename, policyname, cmd
from pg_policies
where schemaname='public'
  and tablename in ('gp_tipos_reunion_c','gp_estados_reunion_c','gp_tipos_avance_c','gp_tipos_archivo_c')
order by tablename, policyname;
```

**Criterios exactos de aceptación (C1):**
| Tabla | Filas esperadas | Códigos exactos |
|---|---|---|
| `gp_tipos_reunion_c` | **8** | KICKOFF, SEGUIMIENTO, COMITE, PLANIFICACION, REVISION, RETROSPECTIVA, CIERRE, DAILY |
| `gp_estados_reunion_c` | **6** | PROGRAMADA, EN_CURSO, REALIZADA, CANCELADA, POSPUESTA, REPROGRAMADA |
| `gp_tipos_avance_c` | **6** | FISICO, FINANCIERO, HITO, CRONOGRAMA, COSTO, CALIDAD |
| `gp_tipos_archivo_c` | **7** | PLANO, CONTRATO, FOTO, ACTA, INFORME, CORRESPONDENCIA, OTRO |

- 4 políticas por tabla: `_select` → `user_can_use_app('gestor-proyectos')` · `_insert/_update/_delete` → `is_platform_admin()`.
- `anon` sin política (lectura vacía con anon key).

---

## PASO 5 · Cierre ordenado

1. Registrar evidencia en **`7-Bitacoras/20261117-aplicacion-tablas-9-12-mcp.md`** (nuevo archivo).
2. Actualizar **tracker `5.2`**: filas 9, 10, 11, 12 → ✅ con fecha y conteo de columnas/filas/políticas.
3. Actualizar `0-INDICE` §3 si procede.
4. **Bloque A completo (12/12).** Siguiente natural según `5.2`: PASO 2 · BLOQUE B (`0002`, entidades principales) — ya auditado en `6.4` FASE 3.

---

## Notas de montaje del MCP (17-nov)

- MCP añadido en `~/.config/opencode/opencode.jsonc` → bloque `mcp.supabase` (remote, scope
  `?project_ref=qrusdsqgygfolxfrafyd`, header `Authorization: Bearer <PAT>`).
- El PAT lo genera el responsable en **supabase.com/dashboard/account/tokens** ("Generate new token").
  Tras pegarlo en la config, **reiniciar la sesión de opencode** para que el MCP cargue.
- Si el MCP no conecta: comprobar que el PAT no está revocado y que el header quedó bien formado.
  Alternativa documentada: quitar `?project_ref=...` de la URL (modo cuenta completa, menos restrictivo).

 sbp_[OCULTADO — instalado en ~/.config/opencode/opencode.jsonc; NO versionar tokens en doc2])
