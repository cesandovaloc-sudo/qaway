# Bitácora · 17-nov-2026 · Etapa 6-A — Selector "Tipo de reunión" conectado a `gp_tipos_reunion_c`

**Proyecto:** `qrusdsqgygfolxfrafyd` · **Ejecutor:** agente opencode · **Autorización:** "Procede" del responsable (17-nov) tras exposición previa en chat del alcance y los 2 archivos.
**Incremento:** Etapa 6-A ("Por conectar") del plan expuesto en chat (sin artefactos nuevos).

---

## 1 · Alcance honesto (ajustado tras el relevo)

De los 4 puntos pendientes, solo uno tenía destino real hoy; el resto se queda marcado o se traslada:

| Punto | Decisión | Motivo |
|---|---|---|
| **Tipo de reunión** (form nueva reunión) | ✅ **CONECTADO** | El catálogo vive y el form existe |
| Tipo de avance (`GanttEditorDrawer` L~1686) | ⏸ `TablaPorConectar` se queda | No existe pantalla de registro de avances; escribir en `gp_avances` hoy es imposible (tablas padre vacías hasta backfill `0100`, Etapa 7) |
| Clasificación de adjunto (`EquipoExpedienteModal` L~403) | ⏸ `TablaPorConectar` se queda | No hay carga de documentos ni bucket de Storage |
| **Unidad de adscripción** | ⏸ trasladado a 6-B | Pertenece al flujo de invitación de personas (`gp.registrar_personas`); `gp_personas` vacía hasta backfill |

## 2 · Cambios (2 archivos, solo lectura de catálogo + estado local)

**1 · NUEVO `src/modules/reuniones/TipoReunionCatalogoSelect.tsx`**
- Mismo contrato que `EstadoReunionCatalogoSelect` (cargando → sin parpadeo · catálogo → opciones en `orden` · vacio → deshabilitado honesto · **error → deshabilitado honesto, SIN fallback inventado** porque no existe vocabulario local de tipos — a diferencia de los estados).
- Lee `listarTiposReunionGestor()` (fetcher ya existente, `gpCatalogosService.ts` L250).
- Emite SIEMPRE el `codigo` del catálogo (persistirá en `gp_reuniones.tipo_codigo` en el cutover Etapa 7).

**2 · `src/modules/reuniones/ReunionesView.tsx` — 5 toques**
- Import del nuevo selector (tras L63).
- `type Meeting`: + `tipoCodigo?: string;` (nullable — reuniones previas quedan "Sin clasificar", regla B-8).
- Formulario: el `<select disabled>` "Por conectar" sustituido por `<TipoReunionCatalogoSelect>` + `field-help` con los 8 tipos vivos.
- `openCreate`: reset incluye `tipoCodigo: ''`.
- `saveForm`: el Meeting construido incluye `tipoCodigo: form.tipoCodigo || ''` → viaja a `saveMeetings` (localStorage `qaway-meetings-v1`; `openEdit` lo propaga con `{...m}`).

## 3 · Catálogo vivo (verificado contra producción al escribir)

`gp_tipos_reunion_c` (8 tipos PMI, `activo=true`, en `orden`):

| # | codigo | nombre | alias |
|---|---|---|---|
| 1 | `KICKOFF` | Kickoff meeting | Reunión de inicio |
| 2 | `SEGUIMIENTO` | Status meeting | Reunión de seguimiento |
| 3 | `COMITE` | Steering committee | Comité directivo |
| 4 | `PLANIFICACION` | Planning session | Sesión de planificación |
| 5 | `REVISION` | Review meeting | Reunión de revisión |
| 6 | `RETROSPECTIVA` | Retrospective | Retrospectiva |
| 7 | `CIERRE` | Closure meeting | Reunión de cierre |
| 8 | `DAILY` | Daily standup | Reunión diaria |

## 4 · Verificación

- ✅ `npm run typecheck` (`tsc --noEmit -p tsconfig.json`) — **0 errores** en todo el bundle.
- Persistencia sin cambio de modelo: `qaway-meetings-v1` (cutover a `gp_reuniones` es Etapa 7; el código del catálogo ya queda guardado y viaja al backfill sin re-trabajo).
- Sin DDL: ninguna tabla ni política tocada.

## 5 · Estado resultante

- El formulario de reuniones registra el TIPO con vocabulario real de Supabase; el marcador "Por conectar" de ese punto desaparece.
- Quedan 2 marcadores honestos (`gp_tipos_avance_c`, `gp_tipos_archivo_c`) que se retiran en el cutover.
- Siguiente propuesto: **6-B** (permisos granulares en UI: `user_app_roles` rol + `permissions` jsonb condicionando acciones; pantalla de permisos curables; campo Unidad de adscripción dentro del flujo de invitación).
