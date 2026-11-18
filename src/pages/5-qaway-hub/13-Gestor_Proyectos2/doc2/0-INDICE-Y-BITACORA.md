# DOC2 · Índice maestro y bitácora del Gestor de Proyectos 2

**Este es el archivo que se abre primero.** Dice qué es cada documento, en qué orden se leen,
en qué etapa estamos y cuál es el siguiente archivo a crear.

Última actualización: **17-11-2026**

---

## 1. Regla de nomenclatura (para que nunca haya "30 archivos en desorden")

```
doc2/
  N-<Nombre-de-la-carpeta>/        ← bloque temático, en orden de lectura
     N.M-<Nombre-descriptivo>.<ext>  ← documento dentro del bloque
     sql/                            ← excepción: nombres con fecha, no se renombran
```

- **El número manda.** Si dudas cuál sigue, es el número mayor creado + 1, dentro del bloque.
- **El nombre describe el contenido en 3–7 palabras.** Nunca `doc_final_v3_ok.md`.
- **Un bloque terminado no se renumera.** Se agrega `N.M+1`, no se reordena.
- **Los SQL conservan `20261112_0001_...`** porque es la convención de migraciones de Supabase;
  su orden ya está en el nombre.
- Si un documento se reemplaza, **no se borra**: se marca `[SUPERADO por N.M]` en su primera línea.

---

## 2. Mapa actual (lo que existe hoy)

| Orden | Archivo / carpeta | Qué es | Estado |
|---|---|---|---|
| 0 | `0-INDICE-Y-BITACORA.md` | Este archivo: mapa, estado y siguiente paso. | ✅ vigente |
| **1** | **`1-Auditoria-y-decision/`** | **Por qué se descarta la infraestructura actual y qué se conserva.** | |
| 1.1 | `1.1-Hallazgos-criticos-y-eliminar-todo-menos-infraestructura.txt` | Hallazgos que obligan el rediseño: `anon key` expuesta, RLS `using(true)`, PK = código de negocio, esquema no versionado. Conclusión: eliminar todo menos infraestructura. | ✅ cerrado (insumo histórico) |
| **2** | **`2-Modelo-de-datos/`** | **La propuesta de modelo relacional, antes de escribir SQL.** | |
| 2.1 | `2.1-Modelo-relacional-v2.md` | Principios, entidades, claves, RLS y estrategia de migración. Primer borrador del v2. | ⚠️ superado en detalle por 3.1 y 3.6; se conserva como historia |
| 2.2 | `2.2-Mapeo-legacy-a-v2-y-plan-de-migracion.md` | De dónde sale cada dato (`localStorage`, `gestor_*`) y cómo se migra sin cortar el servicio. | ⚠️ ajustado por 3.6 §7.5 |
| **3** | **`3-Diseno-de-base-de-datos/`** | **El diseño definitivo y cómo se integra con el Qaway Hub.** | |
| 3.1 | `3.1-Diseno-definitivo-etapa-2A.md` | Diseño cerrado de las tablas `gp_*`: entidades, columnas, claves. | ⚠️ pendiente de aplicar el recorte de 3.6 (§7) |
| 3.2 | `3.2-ERD-relaciones-y-cardinalidades.md` | Diagrama lógico y cardinalidades de todo el esquema. | ⚠️ ídem |
| 3.3 | `3.3-Diccionario-de-datos.md` | Columna por columna, tabla por tabla: tipo, nulo, default, descripción. | ⚠️ ídem |
| 3.4 | `3.4-Correspondencia-antiguo-nuevo.md` | Tabla vieja → tabla nueva, para el backfill. | ⚠️ ídem |
| 3.5 | `3.5-Preparacion-de-pruebas-etapa-2C.md` | Cómo validar en un entorno aislado, sin tocar producción. | ⚠️ ídem |
| 3.6 | `3.6-Evaluacion-de-pertinencia-Hub.md` | **Documento clave:** las 41 tablas `gp_*` contrastadas contra el Hub real. 33 crear, 1 adaptar, 7 eliminar. FKs, RLS, bug de seguridad y diff a los SQL. | ✅ **vigente — es el que manda** |
| 3.7 | `3.7-SQL-propuesto-sin-ejecutar/` | Los 4 SQL de migración + backfill. **Propuestos: nunca ejecutados.** | ⚠️ pendiente de aplicar §7 de 3.6 |
| 3.7.1 | `.../20261112_0001_gp_catalogos_base.sql` | Catálogos y seeds. | ⚠️ a recortar (3 tablas fuera) |
| 3.7.2 | `.../20261112_0002_gp_entidades_principales.sql` | Proyectos, personas, fases, EDT, tareas, equipos. | ⚠️ a ajustar |
| 3.7.3 | `.../20261112_0003_gp_entidades_operativas_y_relaciones.sql` | Entregables, líneas base, avances, reuniones, relaciones. | ⚠️ a ajustar |
| 3.7.4 | `.../20261112_0004_gp_funciones_triggers_rls_indices.sql` | Funciones, triggers, RLS, índices. | ⚠️ a reescribir RLS (bug) |
| 3.7.5 | `.../backfill/20261112_0100_backfill_idempotente.sql` | Carga inicial desde el modelo antiguo. | ⚠️ a suprimir bloques de 3 tablas |

**Leyenda de estado:** ✅ vigente y correcto · ⚠️ vigente pero requiere cambio ya especificado · ❌ superado.

---

## 3. Dónde estamos

| Etapa | Contenido | Estado |
|---|---|---|
| ETAPA 0 | Auditoría del modelo actual | ✅ |
| ETAPA 1 | Taxonomía EDT / reglas de dominio | ✅ |
| ETAPA 2A | Diseño definitivo de tablas | ✅ (a recortar) |
| ETAPA 2B | Migraciones SQL + backfill | ✅ (a recortar) |
| ETAPA 2C | Preparación de pruebas | ✅ |
| **ETAPA 2C-bis** | **Evaluación de pertinencia frente al Hub** | ✅ **3.6 entregado** |
| Aprobación | Recorte 41 → 34 tablas | ✅ aplicado en `0001`–`0003` de 3.7 (`0004` RLS queda para el final) |
| **ETAPA 3** | **Creación de las 34 tablas en Supabase, una por una** | 🟡 **en curso — bloque `4-`** |
| **ETAPA 4** | **Unidades seguras e integradas con el Hub** (implementación definitiva: cliente/sesión compartida, `contextoSesion`, servicios fail-closed, `0004` v3, `0006a`/`0006b`, pruebas, `3.9`) | 🟢 **entregado — pendiente de aplicación SQL y verificación en vivo (procedimiento en `3.9`)** |
| ETAPA 2D | Integración real con el Hub (sesión compartida, slug en `app_catalog`, RLS activa) | 🟢 absorbida por ETAPA 4 (queda la verificación en vivo) |
| **ETAPA 5** | **Creación progresiva de tablas `gp_*`** (tracker `5.2`) | 🟢 **34/34 numeradas** — BLOQUE A 12/12 + BLOQUE B 6/6 + BLOQUE C+D 16/16 (17-nov, vía MCP; evidencia en bitácoras `20261117-*`) · **36 físicas en vivo** (34 + extras `5b`/`7.1`) · RLS tenant-scoped granular en TODAS (145 políticas; §9: sin_rls=0 · permisivas=0 · anon=0) · helper `gp_is_project_member` creado y conectado a las `_select` de entidades (17-nov) |
| **ETAPA 6** | **Vinculación de catálogos GP con la app** (`doc2/6.1`) | 🟡 6.1 entregada (selector de prioridad ← `gp_prioridades_c`, pendiente de verificación viva); **6.2 arquitectura APROBADA** y **6.3 IMPLEMENTADA** (`doc2/6.3`: clasificación + ciclo de vida + permisos reales, 44/44 pruebas del núcleo, SQL pendiente de aplicación manual); **6.4 AUDITADA Y EMPAQUETADA** (`doc2/6.4`: paquete único con las 12 migraciones en orden definitivo FASE 0-4, diagnósticos D, verificaciones V, riesgos R-1..R-10, recuperación y checklist — cero correcciones de contenido, `0011` opcional); **6-A conectado (17-nov):** selector Tipo de reunión ← `gp_tipos_reunion_c` (emite códigos del catálogo al form/localStorage; cutover Etapa 7; evidencia `7-Bitacoras/20261117-etapa6-a-tipo-reunion-conectado.md`) |

### Siguiente acción concreta

> **ESTADO REAL MEDIDO EL 17-NOV-2026 (vía MCP de Supabase, verificación viva):**
> **BLOQUE A COMPLETO — 12/12 catálogos** con el patrón del Hub (RLS true · 4 políticas por
> tabla · lectura `user_can_use_app('gestor-proyectos')` · escritura `is_platform_admin()` ·
> `anon` sin política, probado 200 + `[]`). Tablas 9–11 verificadas en vivo con códigos
> exactos de `0022` (`gp_tipos_reunion_c` 8, `gp_estados_reunion_c` 6, `gp_tipos_avance_c` 6).
> Tabla 12 `gp_tipos_archivo_c` **creada hoy vía MCP** con `0023` verbatim (10 cols · 7 filas
> PMI/PMBOK · COMMENT ON TABLE único · 0 alias nulos) — cierra la decisión abierta de `4.2` §85
> (lista vs mime: LISTA) y el "sin seed hasta definición" de `3.8`. Sin referentes en la app
> actual ⇒ definido aquí, autorizado por el responsable. Evidencia: `7-Bitacoras/20261117-aplicacion-tabla-12-gp_tipos_archivo_c.md`.
> BLOQUE B aplicado el mismo día (`0002` verbatim + 6 COMMENT ON TABLE; tablas 13–18 verificadas:
> columnas exactas, 22 FKs ok, FK diferida del responsable creada, 4 índices únicos, anon 200+`[]`;
> evidencia: `7-Bitacoras/20261117-aplicacion-bloque-b-0002-entidades.md`). **RLS del Bloque B
> aplicada y refinada el mismo día** — del patrón 1–9 al **modelo tenant-scoped granular** del
> responsable (`0004a`): roles `admin/editor/operativo/visor` + permisos delicados granulares +
> `gp_personas.unidad_id`; script §0–§9 en verde + anon 200+`[]` en las 6 (evidencia:
> `7-Bitacoras/20261117-aplicacion-0004a-rls-tenant-granular.md`).
> **BLOQUE C+D APLICADO el mismo día (`0003` VERBATIM: tablas 19–34 — 16 tablas + FK diferida
> `gp_archivos_reunion_fk` + 16 COMMENT ON TABLE + infra de `0004`: triggers `updated_at`,
> índices, políticas de `gp_corridas_migracion`) con RLS granular (60 políticas): EDT DELICADO
> (`gp_edt_responsables_r`, `gp_nodo_dependencias_r` → solo `admin` o `gp.administrar_edt`),
> `operativo` registra avances/archivos (cada quien edita lo suyo), auditoría escrita SOLO
> plataforma (`service_role`); bloques gruesos de `0004` OMITIDOS por conflicto con el modelo.
> Verificación: 36 físicas, §9 verde (`tablas_gp=36 · sin_rls=0 · permisivas=0 · anon=0`,
> 145 políticas) + anon 200+`[]` en las 16. **CIERRA ETAPA 5: 34/34 numeradas.** ✅
> `gp_is_project_member` CREADA y CONECTADA el mismo día (helper verbatim de `0004` + rama en las
> 12 `_select` de entidades; §9: 145 políticas, drop+create 1:1; anon 200+`[]` en las 12; evidencia:
> `7-Bitacoras/20261117-helper-gp_is_project_member-rama-select.md`). Evidencia C+D:
> `7-Bitacoras/20261117-aplicacion-bloques-cd-0003-rls-granular.md`.
> El estado del 16-nov queda como historia.
>
> **ESTADO REAL MEDIDO EL 16-NOV-2026** (evidencia: `7-Bitacoras/20261116-auditoria-4-catalogos-gp.md`):
> existen **5 de 12** catálogos del BLOQUE A — `gp_estados_proyecto_c` (5), `gp_tipos_proyecto_c` (6),
> `gp_estados_ejecucion_c` (6), `gp_prioridades_c` (4) y `gp_roles_proyecto_c` (6, creada el 16-nov,
> marcada DEUDA en `0013`) — con RLS activa y el patrón del Hub. Además se creó
> `gp_roles_proyecto_v2_c` (4 roles internacionales owner/manager/member/viewer + alias en
> español), que es el catálogo canónico a partir de ahora.
> (lectura con `user_can_use_app('gestor-proyectos')`, escritura con `is_platform_admin()`).
> La discrepancia de `gp_roles_proyecto_c` queda **disuelta** (no existía y ya se creó limpia). `0007` y `0009`
> ya están reflejados en vivo; `0008` deja de ser necesario. `0004` fue **corregido** para no
> duplicar ni ampliar políticas ⇒ **ya es aplicable**. Por tanto, la secuencia FASE por FASE de
> `6.4` sigue siendo válida, pero debe omitir lo que ya está aplicado (`0001` tablas 1-4, `0007`,
> `0009`) y puede saltar `0008`.
>
> **Responsable:**
> **1) Prerrequisitos de la Etapa 4** (procedimiento exacto en `3.9`): aplicar en
> Supabase, en este orden, los SQL de `3.7-SQL-propuesto-sin-ejecutar/` —
> `20261114_0006a` (registro en `app_catalog`) → `20261114_0005` (columna `orden`)
> → `20261114_0006b` (RLS definitiva de `gestor_unidades`) — y después `0004`
> (v3, cuando toque la capa `gp_*`). Queries de contraste: `5.4` §1.
> **2) Etapa 5 — creación progresiva de tablas:** aplicar la tabla 4
> `gp_prioridades_c` (APROBADA) con el paquete completo
> **`5.5-Paquete-aplicacion-tabla-4-gp_prioridades_c.md`** (consulta previa → SQL
> `0007` → verificaciones V-1..V-8 → criterios exactos → registro). No tocar
> `gp_roles_proyecto_c` (tabla 5, **congelada** por discrepancia — dump de
> contraste y decisiones en `5.4` §3). Tras validar la tabla 4, continuar con la
> tabla 6 `gp_tipos_dependencia_c`.
> **3) Etapa 6 — vinculación de catálogos con la app** (`doc2/6.1`): integración de
> lectura entregada (selector de prioridad ← `gp_prioridades_c` vía servicio con el
> cliente compartido). Para VERLA funcionar en producción: aplicar `0007` (punto 2),
> ejecutar la query de acceso de `6.1` §4 y comprobar el hover/Network según `6.1` §6.
> El resto de catálogos tiene su punto de conexión mapeado y decisiones abiertas
> (`6.1` §7). Nada se declara operativo sin verificación viva.
> **4) Etapa 6.2 — arquitectura de configuración y ciclo de vida** (`doc2/6.2`):
> ✅ **APROBADA** por el responsable (decisiones ratificadas: estado se cambia desde
> la FICHA Resumen, no desde Configuración; historial reutiliza `gp_eventos_auditoria`
> sin tablas nuevas; tipo = clasificación administrativa sin efecto automático en
> EDT/cronograma; resolver `5.4 §3` (roles) de forma no destructiva antes del Paso 3).
> **5) Etapa 6.3 — implementación de clasificación y ciclo de vida** (`doc2/6.3`,
> ✅ ENTREGADA): servicio central `gpCicloVidaService` (núcleo puro probado + única
> vía de escritura = RPC atómica), componentes `TipoProyectoCatalogoSelect` /
> `CicloVidaEstadoChip` / `PanelCicloVidaProyecto`, cableado en creación del
> proyecto, ficha Resumen y Configuración (Clasificación + Estado solo lectura +
> Equipo y accesos con banner de bloqueo), historial en Auditoría, **44/44
> pruebas** del núcleo (módulo 192/194; 2 fallos PRE-existentes de cronograma,
> fuera de alcance) y **3 SQL listos, SIN EJECUTAR**:
> `20261115_0008` (resolución aditiva roles 9↔10 + seed con `permisos jsonb`) →
> `20261115_0009` (seed 6 tipos) → `20261115_0010` (RPCs SECURITY DEFINER
> atómicas). ⚠️ **SUPERADO por 6.4:** la cadena `0006a → 0005 → 0006b → 0004 →
> 0008 → 0009 → 0010` propuesta aquí resultó INCOMPLETA en la auditoría 6.4
> (omitía `0007`, `0001`, `0002`, `0003` y colocaba `0004` antes de sus tablas).
> NO aplicar tal cual: el orden definitivo y el paquete verbatim están en
> `doc2/6.4` §1 y §4.
> **6) Etapa 6.4 — paquete de ejecución en producción** (`doc2/6.4`,
> ✅ ENTREGADO): auditoría íntegra de los 12 SQL (`0006a`, `0005`, `0006b`,
> `0001`, `0007`, `0008`, `0009`, `0002`, `0003`, `0004`, `0010` + `0011`
> opcional): **cero operaciones destructivas sobre datos**; inconsistencias
> resueltas por ORDEN (R-1: `0007` antes de `0002` por el FK de prioridad;
> R-2: `0008` antes de `0003` por `UNIQUE(codigo)`; `0002`/`0003` faltaban en
> TODA secuencia anterior y `0010` §1 aborta sin ellas) y hallazgo R-4
> (bypass de `estado_codigo` por UPDATE directo) mitigado con `0011` opcional.
> PRÓXIMA ACCIÓN DEL RESPONSABLE: aplicar el paquete `6.4` FASE por FASE —
> FASE 0 diagnósticos D-1..D-8 con dumps de respaldo → FASE 1 `0006a` →
> acciones admin del Hub (suscripción + rol) → `0005` → `0006b` → FASE 2
> `0001` → `0007` → `0008` → `0009` → FASE 3 `0002` → `0003` → `0004` →
> FASE 4 `0010` → (`0011` si se decide) — con las verificaciones V de `6.4`
> §5, cada migración envuelta en BEGIN/COMMIT (`6.4` §7) y todo registrado en
> `7-Bitacoras/`. Backfill `0100` y cutover quedan para la Etapa 7.
> **Sin evidencia real pegada en bitácora, nada se marca ✅.**

---

## 4. Numeración reservada (para que el próximo archivo no aparezca suelto)

| Bloque | Tema previsto | Estado |
|---|---|---|
| `4-Creacion-guiada-en-Supabase/` | **EN USO:** las 34 tablas, una por una, ejecutadas por el responsable en el SQL Editor. Arranca en `4.1-Paso-0-Verificar-terreno.md`. | 🟡 en curso |
| `5-Implementacion-y-cutover/` | Plan de cutover: doble escritura, verificación de conteos, retiro de `localStorage`. | ⬜ reservado |
| `6-Integracion-con-el-Hub/` | ETAPA 2D: sesión compartida con el Hub, slug `gestor-proyectos` en `app_catalog`, activación de RLS, resolución de usuario en el Gestor 2. | ⬜ reservado |
| `7-Bitacoras/` | Registro de ejecuciones reales en Supabase (fecha, migración, resultado, rollback). | 🟡 en uso — primer registro: `20261116-auditoria-4-catalogos-gp.md` |

**Nada se crea fuera de estos bloques.** Si aparece un tema nuevo, se crea `N-<Nombre>/` con su `N.1`.

---

## 5. Reglas de la casa (válidas para todo el módulo)

1. **No ejecutar migraciones, DDL, `DROP` ni `TRUNCATE`** sin la palabra **"aplica"** del responsable.
2. **No modificar infraestructura compartida** del Hub (`auth`, `users`, `tenants`, `app_catalog`,
   `user_app_roles`, `gestor_unidades`) sin aprobación explícita y coordinación con las otras apps.
3. **No retirar `localStorage`** ni hacer cutover hasta que la nueva persistencia esté migrada y verificada.
4. **Commit numerado:** `N_HH:MM DD-MM-YYYY_ motivo`. El número continúa el último del repo.
5. **Documento nuevo = número nuevo.** Nunca sobrescribir un documento cerrado: se marca `[SUPERADO]`.

---

## 6. Decisiones que dependen de ti (detalle en `3.6` §8)

1. Slug `gestor-proyectos` en `app_catalog` (sin él, la RLS solo deja pasar al platform admin).
2. Aceptar las 2 columnas aditivas y el `CHECK unit_type` en `gestor_unidades`.
3. ¿Un `admin`/`editor` de la app administra toda la cartera o solo sus proyectos?
4. Confirmar que el Gestor registra personas sin cuenta (`gp_personas.user_id` opcional).
5. Sesión compartida Hub ↔ Gestor 2 (requisito de la ETAPA 2D, no de esta).
6. Bucket de archivos: reusar `resources` con prefijo `gp/<empresa_id>/` o crear uno propio.
