# Bitácora · 17-nov-2026 · Conexión de código de los catálogos 9–12 (PASO 1: servicio)

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

## 5 · Siguiente

- Tabla 10: definir vocabulario (arriba) → selector de estado.
- Tabla 9: decidir si el formulario de reunión gana el campo "Tipo de reunión" (8 valores PMI).
- Tabla 11: no hay pantalla de avances/registro de progreso todavía.
- Tabla 12: consumidor real identificado en `cronograma-gantt/GanttEditorDrawer.tsx`
  (documentos de sustento) y `cronograma-core/types.ts` (§Adjunto) — requiere añadir el
  tipo al modelo de adjunto, en un archivo que otro agente tiene modificado.
