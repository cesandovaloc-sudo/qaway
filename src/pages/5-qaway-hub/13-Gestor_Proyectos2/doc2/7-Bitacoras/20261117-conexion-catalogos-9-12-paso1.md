# Bitácora · 17-nov-2026 · Catálogos 9–12: servicio, UI conectada (10) y avisos "por conectar" (9, 11, 12) + inventario de tablas creadas

**Alcance de esta entrada:** capa de lectura (`gpCatalogosService.ts`) + pruebas,
y la conexión de UI de la tabla 10 (estados de reunión) tras la decisión del responsable
(ver §4). La tabla 9 queda con aviso "por conectar" en la app.

## 1 · Qué se añadió

`src/services/gpCatalogosService.ts` (aditivo, sin cambiar el núcleo existente):

| Constante | Tabla | Seed vivo |
|---|---|---|
| `TABLA_TIPOS_REUNION` | `gp_tipos_reunion_c` | 8 |
| `TABLA_ESTADOS_REUNION` | `gp_estados_reunion_c` | 6 |
| `TABLA_TIPOS_AVANCE` | `gp_tipos_avance_c` | 6 |
| `TABLA_TIPOS_ARCHIVO` | `gp_tipos_archivo_c` | 7 |

- 4 entradas en `COLUMNAS_POR_TABLA` con `codigo,nombre,alias,orden,activo`
  (las cuatro tablas comparten forma: + `descripcion`, `metadata`, `created_at`, `updated_at`).
- 4 atajos: `listarTiposReunionGestor`, `listarEstadosReunionGestor`,
  `listarTiposAvanceGestor`, `listarTiposArchivoGestor`.

Se reutiliza el listador existente ⇒ heredan **caché de sesión**, **dedup en vuelo**,
**fail-closed** (el `error` no se cachea) y la lectura `activo = true`.

## 2 · Verificación

- **Pruebas** (`gpCatalogosService.test.ts`, 15 casos): 4 nuevos casos con los seeds vivos
  (8/6/6/7, orden de presentación, alias en español) + un caso de **enrutado por tabla**
  que confirma que las 4 constantes piden catálogos distintos y no colisionan en caché.
  Resultado: **15/15 en verde**.
- **Fallo preexistente corregido:** el caso "filas inválidas se descartan" comparaba con
  `toEqual` sin los campos que el evaluador normaliza a `null` (`alias`, `icono`,
  `categoriaCodigo`, `alcance`). Fue una aserción obsoleta, no un bug del servicio;
  ahora compara el objeto completo.
- **Datos vivos (Management API, `qrusdsqgygfolxfrafyd`):** `codigo·nombre·alias·orden·activo`
  no nulos en el 100 % de las filas →

```
gp_estados_reunion_c  filas=6  columnas_ok=6
gp_tipos_archivo_c    filas=7  columnas_ok=7
gp_tipos_avance_c     filas=6  columnas_ok=6
gp_tipos_reunion_c    filas=8  columnas_ok=8
```

- `tsc -b`: **0 errores atribuibles a estos archivos** (el proyecto arrastra errores previos
  en `cronograma-gantt/*` y `tsconfig.node.json`, ajenos a este cambio).

## 3 · Riesgo declarado

La lectura real desde el navegador exige sesión **authenticated** con
`user_can_use_app('gestor-proyectos')`. Sin credencial de un usuario del tenant, la ruta
'authenticated' **no está probada en vivo**; solo se verificó que las columnas y datos existen.
`anon` sigue devolviendo `200 + []` (deny-all por diseño, ya documentado).

## 4 · DECISIÓN TOMADA · alineación de vocabulario (tabla 10)

`modules/reuniones/ReunionesView.tsx` (pantalla local, sin Supabase) usa 4 estados:

```
'Programada' | 'En preparación' | 'Realizada' | 'Por confirmar'
```

El catálogo vivo tiene 6 códigos:

```
PROGRAMADA · EN_CURSO · REALIZADA · CANCELADA · POSPUESTA · REPROGRAMADA
```

Coinciden 2. **'En preparación' y 'Por confirmar' no existen en el catálogo**, y
`EN_CURSO` ("en desarrollo") no equivale a "en preparación". Conectar el `<select>` con
un filtro de compatibilidad (patrón `PrioridadCatalogoSelect`) **eliminaría dos opciones**
del formulario. **Decisión (17-nov-2026): el catálogo es la fuente válida; la pantalla se alinea y lo
antiguo se mapea a lo más parecido.** Implementado así:

- `src/modules/reuniones/estadoReunion.ts` (nuevo): tipo `EstadoReunionCodigo`, orden y
  alias reales del catálogo, `LEGACY_A_CODIGO` (`En preparación`→`EN_CURSO`,
  `Por confirmar`→`PROGRAMADA`), y helpers `normalizarEstadoReunion`,
  `etiquetaEstadoReunion`, `claseEstadoReunion` (6 estados → 4 clases de pill ya
  existentes: no se tocó el CSS).
- `src/modules/reuniones/EstadoReunionCatalogoSelect.tsx` (nuevo): selector conectado a
  `gp_estados_reunion_c` con el patrón fail-closed de `PrioridadCatalogoSelect`
  (cargando/lista/vacío/error con fallback local).
- `ReunionesView.tsx`: `MeetingStatus` = código del catálogo; seeds y formulario
  reetiquetados; **migración automática** del `localStorage` `qaway-meetings-v1`
  (vocabulario viejo → códigos); conteos y pestañas generados desde el catálogo
  (antes 4 hardcodeados, ahora 6); pills y CSV muestran el alias español.
- Tabla 9: el formulario muestra el campo "Tipo de reunión" **deshabilitado** con el
  aviso "Por conectar · gp_tipos_reunion_c" (decisión del responsable: dejar el mensaje
  en la app en vez de inventar el selector).

Verificación: `tsc -b` sin errores atribuibles a estos archivos, `oxlint` 0 errores
(17 warnings preexistentes de imports no usados en la cabecera del archivo).

## 5 · Avisos "por conectar" en la UI (decisión: no paralizar)

**Criterio acordado con el responsable:** no se inventan formularios ni se conectan
selectores a medias; en su lugar se deja **marcado en pantalla el punto exacto donde se
insertará cada tabla** cuando el flujo la requiera. El aviso se retira en el mismo cambio
en que se conecta el selector real.

Componente reusable: `src/components/TablaPorConectar.tsx`
(`campo` + `tabla` + `nota`, borde punteado, punto ámbar, `title` explicativo).

| Tabla | Dónde queda el aviso | Texto visible |
|---|---|---|
| 9 `gp_tipos_reunion_c` | Formulario de reunión · campo "Tipo de reunión" | Select deshabilitado `Por conectar · gp_tipos_reunion_c` + "La tabla existe en Supabase con 8 tipos (PMI)…" |
| 11 `gp_tipos_avance_c` | Editor Gantt · bloque **Avance** (§6) | "Tipo de avance: por conectar · gp_tipos_avance_c — 6 tipos PMI; aquí se clasificará cada registro de avance con su sustento" |
| 12 `gp_tipos_archivo_c` | Expediente del integrante · pestaña **Documentos Adjuntos** | "Clasificación del adjunto: por conectar · gp_tipos_archivo_c — 7 tipos PMI" |

Se verificó el inventario completo: **9, 11 y 12 son las ÚNICAS tablas `gp_*` sin
consumidor en la UI**. El resto de catálogos ya tiene selector conectado
(prioridades, tipos de proyecto/dependencia/entregable, estados, roles, categorías).

## 6 · Inventario REAL de tablas `gp_*` creadas en Supabase (20)

Consultado en vivo con `pg_tables` sobre `qrusdsqgygfolxfrafyd` (17-nov-2026).

**Catálogos (14, comparten forma `codigo·nombre·alias·descripcion·orden·activo`):**

| Tabla | Filas | Consumidor en UI |
|---|---|---|
| `gp_tipos_proyecto_c` | seed | `TipoProyectoCatalogoSelect` |
| `gp_roles_proyecto_c` | seed | asignación de roles |
| `gp_roles_proyecto_v2_c` | seed | resolución de discrepancia (tabla 8) |
| `gp_estados_proyecto_c` | seed | `PanelCicloVidaProyecto` / `CicloVidaEstadoChip` |
| `gp_prioridades_c` | seed | `PrioridadCatalogoSelect` |
| `gp_estados_ejecucion_c` | seed | `EstadoEjecucionCatalogoSelect` |
| `gp_tipos_entregable_c` | seed | `TipoEntregableCatalogoSelect` |
| `gp_estados_entregable_c` | seed | `EstadoEntregableCatalogoSelect` |
| `gp_categorias_entregable_c` | seed | clasificación de entregables |
| `gp_tipos_dependencia_c` | seed | `TipoDependenciaCatalogoSelect` |
| `gp_tipos_reunion_c` (9) | 8 | **sin conectar** → aviso en UI |
| `gp_estados_reunion_c` (10) | 6 | **CONECTADA** (`EstadoReunionCatalogoSelect`) |
| `gp_tipos_avance_c` (11) | 6 | **sin conectar** → aviso en UI |
| `gp_tipos_archivo_c` (12) | 7 | **sin conectar** → aviso en UI |

**Operativas (6):** `gp_proyectos`, `gp_fases`, `gp_nodos_edt`, `gp_tareas`,
`gp_personas`, `gp_equipos`.

**Salvedades detectadas al inventariar (no se corrigieron: requieren DDL y autorización):**

1. `gp_eventos_auditoria` **está referenciada por el código pero NO existe** en la base
   (no aparece en `pg_tables`). Cualquier escritura de auditoría fallará hasta crearla.
2. `gp_tipos_avance_c` es la **única** tabla `gp_*` sin `COMMENT ON TABLE` (el resto de las
   20 sí lo tiene) ⇒ no cumple la convención de documentación en origen.
3. `gp_rol_proyecto_actual` y `gp_roles_proyecto_v` no son tablas: son función y vista
   (por eso no entran en el conteo de 20).

## 7 · Tablas NO conectadas · cerrado, no se vuelve sobre ellas

| Tabla | Motivo por el que no se conecta | Estado |
|---|---|---|
| 9 `gp_tipos_reunion_c` | El formulario de reunión no tenía campo de tipo; inventarlo era decisión de producto | Aviso en UI. Se conecta cuando el flujo pida clasificar reuniones |
| 11 `gp_tipos_avance_c` | **No existe pantalla de registro de avances** (solo % calculado/rollup) | Aviso en UI. Se conecta cuando exista la bitácora de avances |
| 12 `gp_tipos_archivo_c` | Requiere ampliar el modelo de adjunto (`cronograma-core/types.ts` §Adjunto) en archivos que otro agente está tocando | Aviso en UI. Se conecta al definir si el tipo va por adjunto |

**Decisión de cierre:** estas tres quedan documentadas y **no se les da más vueltas**
ni se abren hilos nuevos por ellas hasta que el flujo funcional las requiera.

## 8 · Siguiente (fuera de este alcance)

- **Tablas 19–34** (bloque `0003_gp_entidades_operativas_y_relaciones.sql`, 16 tablas):
  aquí **no falta UI, falta DDL**. Esperando "aplica".
- Corregir las 2 salvedades de §6 (`gp_eventos_auditoria`, `COMMENT` de
  `gp_tipos_avance_c`) en el próximo bloque SQL autorizado.
- Ruta **authenticated/RLS sin probar en vivo** (falta credencial de usuario del tenant).

## 9 · Verificación · las 34 tablas y el caso "sedes / 251 unidades"

**Aplicado:** las 34 tablas del tracker ya existen. En `public` hay **36 tablas `gp_*`**
(34 numeradas + `gp_roles_proyecto_v2_c` y `gp_categorias_entregable_c`).

**Las 251 sedes NO están en ninguna tabla `gp_*`.** Viven en la tabla **legacy**
`public.gestor_unidades` (id `text` `unit-001..251`, `tenant_id NULL`, jerarquía
`parent_unit_id`, `address` **vacío en las 251**): 228 UGEL + 23 DRE.
`gp_unidades_territoriales` y `gp_tipos_unidad_territorial_c` del diseño (3.4 / 3.8)
**no existen todavía**.

El grafo `gp_*` ya depende de la legacy por **FK `text`**:
`gp_nodos_edt.sede_unidad_id`, `gp_personas.unidad_id`, `gp_proyecto_unidades_r.unidad_id`.
⇒ Crear `gp_unidades_territoriales` **no rompe nada** mientras las FK sigan apuntando a
`gestor_unidades`; la migración debe ser aditiva (columna `uuid` nueva + backfill por
`code`), nunca reemplazo.

`territory_ugel_monitoring.directions` **no son direcciones postales**: es un jsonb de
avance por dirección/departamento de la UGEL (DEI, DEP, DES, DEBA, DEIB, DISER).
No sirve como fuente de domicilios.

## 10 · Nota de concurrencia

Otro agente trabaja en `modules/reuniones/` al mismo tiempo (`calendarExport.ts` nuevo y
`reuniones.css` modificado). Los cambios de esta bitácora **no tocan** ese CSS ni ese
archivo; en `ReunionesView.tsx` ambos cambios conviven (imports de calendario + estado
por catálogo). El commit global `5c4204e8` (14:33) arrastró `estadoReunion.ts`,
`EstadoReunionCatalogoSelect.tsx` y `gpCatalogosService.ts`.
