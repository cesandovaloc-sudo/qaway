# DOC2 · Índice maestro y bitácora del Gestor de Proyectos 2

**Este es el archivo que se abre primero.** Dice qué es cada documento, en qué orden se leen,
en qué etapa estamos y cuál es el siguiente archivo a crear.

Última actualización: **12-11-2026**

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
| ETAPA 2D | Integración real con el Hub (sesión compartida, slug en `app_catalog`, RLS activa) | ⬜ no iniciada |

### Siguiente acción concreta

> Aplicar el §7 de `3.6` a `3.1`–`3.5` y a los 4 SQL + backfill.
> Resultado esperado: **34 tablas propias** (hoy 41), 6 helpers de RLS nuevos y el bug de
> `gp_is_project_member` corregido. **No se ejecuta nada en Supabase.**

---

## 4. Numeración reservada (para que el próximo archivo no aparezca suelto)

| Bloque | Tema previsto | Estado |
|---|---|---|
| `4-Creacion-guiada-en-Supabase/` | **EN USO:** las 34 tablas, una por una, ejecutadas por el responsable en el SQL Editor. Arranca en `4.1-Paso-0-Verificar-terreno.md`. | 🟡 en curso |
| `5-Implementacion-y-cutover/` | Plan de cutover: doble escritura, verificación de conteos, retiro de `localStorage`. | ⬜ reservado |
| `6-Integracion-con-el-Hub/` | ETAPA 2D: sesión compartida con el Hub, slug `gestor-proyectos` en `app_catalog`, activación de RLS, resolución de usuario en el Gestor 2. | ⬜ reservado |
| `7-Bitacoras/` | Registro de ejecuciones reales en Supabase (fecha, migración, resultado, rollback). | ⬜ reservado |

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
