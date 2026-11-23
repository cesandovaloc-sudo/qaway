# 20-nov-2026 · Flujo de configuración organizacional (decisión adoptada)

## Decisión

Se adopta el **modelo B: sede central con jerarquía propia + sedes externas**.
La pregunta de sedes va **al inicio**, porque es la forma real en que opera una
empresa: primero se sabe si se trabaja desde una sede o desde varias, y después
se elige la nomenclatura (público/privado) y el área encargada.

Queda como **propuesta documental no adoptada** la separación estricta de ejes
de `doc2/8-8-Estructura-organizacional_carlos/3-SEDES.txt:33,53-63`,
`6-sedes.txt:66-75` y `7-sedes detalle.txt:1-9,33`. No se borra ni se reescribe
ese material; simplemente no gobierna esta pantalla. El modelo jerárquico que
sí se implementa es el de `ARCHITECTURE_ROLES_SEDES.md:16-30,43-60`.

## Orden aplicado

| Paso | Pantalla | Evidencia |
|---|---|---|
| 1 | **¿Tienes una sola sede o varias?** La sede central siempre tiene jerarquía propia; "varias" = sede central + sedes externas (sucursales, tiendas, UGEL, obras). Incluye dirección con mapa, cantidad de sedes y alta opcional de las externas. | `OrganizacionTab.tsx` · `SedeUbicacionFields.tsx` |
| 2 | **Sector público / privado.** Define la nomenclatura de la plantilla. | `OrganizacionTab.tsx:404` |
| 3 | **Estructura organizacional** resultante de la combinación de los pasos 1 y 2. | `OrganizacionTab.tsx:487` |
| 4 | **Área encargada de la Sede Central.** Igual para una o varias sedes: siempre hay un área a cargo. | `OrganizacionTab.tsx:594` |
| 5 | **Gobernanza de tareas.** ¿Se asignan tareas a otras sedes/dependencias? (`ninguna`/`autorizadas`/`todas`) más las facultades. | `OrganizacionTab.tsx:614-616` |

## Cambios concretos

### 1. La pregunta de sedes manda sobre la plantilla

`organizacionPlantillas.ts:39` define `CLAVES_SEDES_EXTERNAS`:
`dre`, `ugel-principal`, `ugel-secundaria`, `obra-1`, `obra-2`, `tienda-1`,
`tienda-2`, `sucursal-provincia`.

`construirBorradoresPlantilla` acepta `opts.incluirSedesExternas`
(`:342,348,353`). Con `false` se omiten esos nodos y se re-resuelven los padres
sobre el conjunto final, de modo que no quedan UGEL huérfanas sin DRE.

`OrganizacionTab.tsx:70` pasa `incluirSedesExternas: modoSedes === 'varias'`:
sólo "sede central + sedes externas" incluye esos nodos. Usa **la misma lista**
para la vista previa y para la escritura (`:161` → `borradoresPersonalizados`),
así lo que se ve es lo que se guarda. El paso 1 es obligatorio antes de aplicar
la plantilla. No se crearon tipos nuevos ni se cambió `unit_type`.

### 2. Gobernanza sin tablas nuevas

`handleGuardarGestion` (`OrganizacionTab.tsx:200`) hace `upsert` en
`gp_config_gestion_proyectos` con `onConflict: 'empresa_id'`, usando columnas
existentes: `unidad_responsable_id`, `alcance_asignacion_tareas` y los cuatro
booleanos de coordinación. La tabla ya tenía `UNIQUE (empresa_id)`, FK a
`gp_unidades_organizacionales` y RLS de administrador de tenant.

### 3. Corrección del error de RLS al crear la sede central

El INSERT usaba `tenant_id`, columna que no existe en `gp_sedes`. Ahora usa
`empresa_id` (`OrganizacionTab.tsx:249`), que es NOT NULL y es justo lo que
valida la política `gp_sedes_insert`. No se tocó ninguna política ni dato.

### 4. Consulta de sedes acotada al tenant

`gp_sedes` se filtra por `empresa_id` del perfil antes de derivar
`modoSedes` (0 = sin responder, 1 = "una", >1 = "varias").

### 5. Dirección, mapa y cantidad de sedes

Al elegir "Solo la sede central" o "Sede central + sedes externas" se habilita
el formulario de ubicación de la Sede Central, tanto para el alta como para
editar una sede ya guardada. `SedeUbicacionFields.tsx` captura nombre, País,
Departamento, Provincia, Distrito, Ubigeo, dirección, Referencia, latitud y
longitud. Se usa **Departamento** porque es la columna existente y el término
oficial en Perú, no "región". El mapa usa Leaflet, que ya está en
`package.json:38`, con teselas de OpenStreetMap y marcador arrastrable / clic
para fijar el punto. El alta y la edición escriben esos mismos campos en
`gp_sedes` —`pais`, `departamento`, `provincia`, `distrito`, `ubigeo`,
`direccion`, `referencia_ubicacion`, `latitud` y `longitud`—, columnas que ya
existían; no se crearon columnas nuevas.

El campo **Dirección** muestra sugerencias tipo buscador mientras se escribe,
con debounce de 700 ms y sólo cuando el campo está enfocado. Usa Nominatim
(`https://nominatim.openstreetmap.org/search`, `countrycodes=pe`,
`accept-language=es`, `limit=5`), sin clave ni Google Maps. Al elegir una
sugerencia se llenan dirección, latitud, longitud, País, Departamento,
Provincia y Distrito, y el marcador del mapa se mueve solo. Si la red falla,
se pueden digitar latitud y longitud manualmente o arrastrar el marcador.

La **cantidad de sedes** aparece sólo con "Sede central + sedes externas",
después de registrar o actualizar la Sede Central. Con "Solo la sede central"
la cantidad queda fijada en 1 y no se muestra ese bloque. El valor se guarda en
`gp_config_gestion_proyectos.metadata` junto con
`modalidad_sedes`, sin DDL nuevo. Con `cantidad_sedes > sedes.length` se pregunta
si se registran las demás ahora o se continúa después; al elegir "Registrar
ahora" aparece el alta de sedes externas con el mismo formulario de ubicación.
Esas filas se insertan con `tipo_codigo: 'sede_operativa'`, valor que el catálogo
`gp_tipos_sede_c` define como "Sede operativa / externa". No se copia la
dirección de la Sede Central a las externas.

"Sin sede física" ya no es sólo guía de UI: `handleSeleccionarModo` persiste
`modalidad_sedes: 'sin_sede'` y `cantidad_sedes: 0` en el mismo `metadata`, de modo
que sobrevive a la recarga.

Los mensajes de guardado, incluido **"Cantidad de sedes guardada."**, usan el
mismo aviso temporal que `ConfiguracionView.tsx:305-310,359-381`: aviso fijo
arriba, estilo de la app y desaparición automática a los 3 segundos
(`OrganizacionTab.tsx:59`).

### 6. Teléfono del perfil: colisión de clave de caché (causa real)

Verificado en Supabase: `public.users` tiene `users_update_own_or_admin`
(`auth.uid() = id`), no hay trigger que ponga `phone` en NULL y los
`PATCH /rest/v1/users` escriben el número. La fila de
`carlossandoval172@gmail.com` quedó con `phone = +51888888888` y `updated_at`
del 2026-11-22. Es decir: **el número sí se guardaba**; se perdía al leer.

Causa: `consultaCacheada()` (`src/router/sessionCache.js:41-57`) guarda por
clave, sin importar el `select`. Tres consumidores usaban la misma clave
`user:<id>` con consultas distintas:

- `HubAccessGuard.jsx:108` y `contextoSesion.ts:224`: `select` **sin `phone`**.
- `perfilVisibleService.ts:81`: `select` **con `phone`**.

El guardián de ruta corre primero al recargar (F5), llena `user:<id>` con una
fila sin `phone` y el perfil visible recibe esa fila cacheada: `phone` queda
`null` y el campo aparece vacío aunque Supabase tenga el número. A veces la
lectura con `phone` se hacía primero y funcionaba, de ahí lo intermitente.

Corrección:

- `perfilVisibleService.ts:80-86`: clave propia `user-perfil:<id>` para la
  consulta que sí trae `phone`. Ya no comparte clave con los otros dos.
- `sessionCache.js:59-61`: `invalidarCacheClave(key)` nueva, para limpiar una
  sola clave sin derribar todas las de acceso.
- `perfilVisibleService.ts:58,79,182-187`: se recuerda el `id` cacheado y
  `invalidarPerfilVisible()` limpia `user-perfil:<id>` antes de avisar a los
  hooks suscritos, para que no recarguen datos viejos.
- `PerfilTab.tsx:108-117`: el `UPDATE` lleva `.select('id')` y lanza error si no
  devolvió filas, para que "Cambios guardados correctamente." no se muestre
  cuando Supabase no guardó nada.
- Formato: el campo pinta `999 999 999` sólo para lectura
  (`PerfilTab.tsx:318`); lo que se guarda es `+51888888888`, sin espacios,
  según `comunicacionesService.ts:20-45`.

### 7. Exportación del directorio: código de país y número separados

`public.users` tiene una sola columna `phone`, sin campo aparte para el código.
El código se guarda dentro del valor (`+51999999999`, formato E.164) para que
`wa.me` funcione sin adivinar el país. En la descarga se separa en dos columnas
sin tocar la BD ni el formato guardado:

- `UsuariosView.tsx:38`: `separarTelefono` normaliza con
  `normalizarTelefono` y busca el prefijo más largo en `PAISES` (`@/config/paises`).
- `UsuariosView.tsx:300-304`: el CSV del botón **Exportar CSV** pasa de una
  columna `Teléfono` a `Código de país` + `Teléfono`. Para el ejemplo queda
  `+51` y `999999999`, sin espacios.
- No se creó ninguna columna ni migración nueva.

### 8. Verificación de lineamientos GP en tablas usadas (incluso heredadas)

Revisado contra `doc2/10-Estandar-tablas-y-nomenclatura/10.1` y el SQL canónico
`3.7-SQL-propuesto-sin-ejecutar/20261112_0004:33-69`: toda tabla con
`updated_at` debe actualizarlo con `gp_set_updated_at()` mediante un trigger
`trg_<tabla>_updated_at`. No se creó tabla de auditoría.

Resultado de la verificación en BD:

- `users`: `created_at` + `updated_at` con `set_users_updated_at`
  (`handle_updated_at()`). Cumple.
- `tenants`: `created_at` + `updated_at` con `on_tenant_updated_at`. Cumple.
- `gp_personas`, `gp_proyectos`, `gp_tareas`: trigger
  `trg_<tabla>_updated_at` con `gp_set_updated_at()`. Cumplen.
- **Faltaban 12 tablas con `updated_at` y ningún trigger**: `gp_config_gestion_proyectos`,
  `gp_sedes`, `gp_unidades_organizacionales`, `gp_config_gestion_alcance_r`,
  `gp_sede_unidades_r`, `gp_tipos_sede_c`, `gp_modalidades_intervencion_c`,
  `gp_dependencia_modalidades_r`, `gp_plantilla_estructura_org_c`,
  `gestor_unidades`, `gestor_proyectos`, `gestor_cronograma_items`.
  Algunas escrituras ponían `updated_at` a mano en código
  (`organizacionEscritura.ts:910,993,1005,1052`, `gestorCronogramaService.ts:79`),
  pero no todas: el dato podía quedar viejo.

Aplicado: `supabase/migrations/20261122000000_gp_updated_at_triggers.sql`.
Reutiliza `public.gp_set_updated_at()` y la nomenclatura `trg_<tabla>_updated_at`
del estándar; es idempotente y no toca los triggers propios de `users`/`tenants`.
Verificado después de aplicar: 0 tablas con `updated_at` sin trigger.

Nota: `updated_at` guarda la **fecha del último cambio**, no el historial de
valores. `public.users` no guarda números anteriores; no hay tabla de auditoría
por decisión del usuario.

### 9. Estrategia de recuperación de datos (aclaración)

No se crea auditoría global. La estrategia real de la app es **borrado lógico**:
`is_deleted` en `gp_proyectos`, `gp_tareas`, `gp_personas`, `gp_sedes`,
`gp_unidades_organizacionales`, `gestor_unidades`, etc.; `deleted_at` en
`tenants`; `status` en tablas heredadas. Recuperar = volver a poner la bandera.
`gpTareasService.ts:245` ya lo hace así.

Excepciones con **borrado físico** (no recuperables desde la app):
`gestorProjectService.ts:133` (`gestor_proyectos`),
`gestorCronogramaService.ts:299` (`gestor_cronograma_items`) y la limpieza en
`organizacionJerarquiaLectura.ts:120`. El propio UI de `ConfiguracionView.tsx:1537`
avisa que esa acción es irrecuperable.

`gp_eventos_auditoria` ya existe pero **no es global**: el único escritor es
`gp_cambiar_estado_proyecto()` y registra sólo `STATE_CHANGE` de
`gp_proyectos`. Hoy tiene 0 filas. Cubrir todas las tablas exigiría triggers o
escrituras explícitas por tabla, y sólo ayudaría a recuperar lo que ocurra
**después** de activarse; no es retroactivo ni reaparece un borrado físico ya
hecho.

Peso medido: tabla vacía 96 kB con 5 índices; un payload JSONB típico de fila
completa mide 392–972 bytes (`pg_column_size`). Con dos payloads por evento
(antes/después) + índices, el orden es 1–3 kB por cambio: ~1–3 MB por cada
1.000 cambios, ~12–36 MB/año a ese ritmo.

**Deshacer / Rehacer del Gantt no es respaldo.** `CronogramaGanttView.tsx:2070,3752-3782`
guarda la pila en `useState` del navegador, máximo 30 pasos. Se pierde al
recargar y nunca se escribe en Supabase.

### 10. Plan de contingencia ante "se borraron o cambiaron mis datos"

1. **Ya activo, sin costo extra:** borrado lógico (`is_deleted`, `deleted_at`),
   fecha de último cambio (triggers del punto 8) y botón manual
   **Exportar Copia de Seguridad (JSON)** en `ConfiguracionView.tsx:823`.
   Si el dato sigue en la fila, se recupera cambiando la bandera.
2. **Pendiente de confirmar en el panel de Supabase:** copias automáticas y
   restauración a una fecha (PITR). Es lo único que recupera un borrado físico
   real (`gestor_proyectos`, `gestor_cronograma_items`). Depende del plan
   contratado; verificar retención antes de prometerlo al cliente.
3. **Opcional, decidir con el cliente:** historial de cambios por tabla. Coste
   estimado en el punto 9. No se activa sin autorización.

Los triggers del punto 8 no guardan copias: sólo escriben la hora de cambio.
No añaden cargo económico; el gasto real es el plan de Supabase (espacio y
consultas), y éstos son insignificantes frente a una consulta normal.

### 11. Escala SaaS y respaldo (pregunta del usuario)

El cálculo del punto 9 era **por cada 1.000 cambios**, no por usuario. En SaaS
se multiplica por personas y por apps. Fórmula sencilla:
`personas × cambios por persona al día × 30 × 12 × 1–3 kB`.

- 100 personas × 20 cambios/día → 0,7–2 GB/año.
- 1.000 personas × 20 cambios/día → 7–22 GB/año.
- 10.000 personas × 20 cambios/día → 70–220 GB/año.

Sólo se cuenta el Gestor; si otras apps guardaran historial, se suma por app.
Base real hoy: **81 MB**, 3 usuarios, 11 tenants, 1 proyecto, 0 tareas.

Según la documentación oficial de Supabase
(https://supabase.com/docs/guides/platform/backups):

- Copias diarias automáticas en Pro/Team/Enterprise. Retención: Pro 7 días,
  Team 14 días, Enterprise 30 días. En Free no se pueden descargar.
- PITR (volver a cualquier segundo) es un complemento de pago: ~US$100/mes
  por 7 días, ~US$200 por 14, ~US$400 por 28. Requiere compute Small.
  Al activarlo se dejan de hacer copias diarias. Reponer deja el proyecto
  inaccesible mientras dura la restauración.
- Las copias de la base **no incluyen archivos de Storage** (fotos, adjuntos).
- Recomendación de Supabase: activar PITR si se espera una base > 4 GB.

Gmail/Drive no reemplaza a Supabase: sirve como copia fría exportada, no como
mecanismo de restauración. La cuenta de Gmail que se usa para entrar a la app
es autenticación, no respaldo.

### 12. Plan contratado: Free (confirmado por el usuario)

Con Free **no hay copias diarias descargables ni PITR** (ambos son de Pro/Team/
Enterprise, según la doc oficial). Si alguien hace un borrado físico, Supabase
no ofrece una copia que podamos bajar. La documentación de Supabase recomienda
en Free exportar con `supabase db dump` y guardar la copia fuera del proyecto.

El botón **Exportar Copia de Seguridad (JSON)** de `ConfiguracionView.tsx:266-281`
**no es un respaldo completo**: sólo guarda el proyecto activo y el cronograma
que está en `localStorage` del navegador. No incluye usuarios, teléfonos,
sedes, tareas ni archivos de Storage.

Opciones planteadas al usuario:

1. **ELEGIDA: seguir en Free** con exportación manual cada 7 días a Google Drive.
2. Pasar a Pro (~US$25/mes): copias diarias con 7 días de retención.
3. Pro + PITR (~US$100/mes adicionales): volver a cualquier minuto.

El usuario no planea pagar hasta tener muchos tenants.

**Verificación de MCP para descarga automática:** no hay ningún servidor MCP de
Google Drive conectado (`list_mcp_resources` devuelve 0 recursos y 0 plantillas;
el catálogo sólo tiene Supabase y OpenCode). Por lo tanto **no se puede crear la
descarga automática a Drive desde esta sesión**. Queda como tarea manual, o se
puede automatizar con Google Apps Script según la sección 15.

Supabase Free sí tiene `pg_cron` 1.6.4 instalado, pero programar un job cada 7
días no sirve sin un destino Drive: haría falta un Edge Function con un token de
Google guardado en Vault, y esa integración no existe hoy. No se creó nada de
esto para no generar deuda ni espacio innecesario.

**Procedimiento manual acordado, cada 7 días:**

1. Entrar a Supabase → SQL Editor.
2. Pegar y ejecutar la consulta de exportación de la sección 13.
3. Descargar el resultado como CSV.
4. Subirlo a Google Drive en una carpeta `Respaldos Qaway/<año>/`.
5. Nombre sugerido: `qaway-gp-YYYY-MM-DD.csv`.

**Medidas de seguridad ya activas dentro de Free (sin costo extra):**

- RLS activo en **las 50 tablas** del Gestor (`gp_*`, `gestor_*`, `users`,
  `tenants`); ninguna queda sin protección. Revisado en BD el 22-11-2026.
- `updated_at` con trigger en todas las tablas que lo tienen (punto 8).
- Borrado lógico (`is_deleted`, `deleted_at`) en los puntos 9 y 10.
- No se creó tabla de auditoría: no agrega espacio ni obliga a comprar Pro.

La recuperación real sigue siendo el borrado lógico; la copia de Drive cubre
sólo el borrado físico de `gestor_proyectos` y `gestor_cronograma_items`.

### 13. Consulta de exportación para el respaldo de cada 7 días

Pegar en Supabase → SQL Editor → Run → descargar como CSV. Todas las tablas
incluidas tienen columna `id` (verificado en BD). `to_jsonb` guarda **todas**
las columnas de la fila, sin depender de qué columnas tenga cada tabla:

```sql
SELECT 'users' AS tabla, id::text AS id, to_jsonb(u) AS fila FROM public.users u
UNION ALL SELECT 'tenants', id::text, to_jsonb(t) FROM public.tenants t
UNION ALL SELECT 'gp_config_gestion_proyectos', id::text, to_jsonb(x) FROM public.gp_config_gestion_proyectos x
UNION ALL SELECT 'gp_sedes', id::text, to_jsonb(x) FROM public.gp_sedes x
UNION ALL SELECT 'gp_unidades_organizacionales', id::text, to_jsonb(x) FROM public.gp_unidades_organizacionales x
UNION ALL SELECT 'gp_personas', id::text, to_jsonb(x) FROM public.gp_personas x
UNION ALL SELECT 'gp_equipos', id::text, to_jsonb(x) FROM public.gp_equipos x
UNION ALL SELECT 'gp_proyectos', id::text, to_jsonb(x) FROM public.gp_proyectos x
UNION ALL SELECT 'gp_tareas', id::text, to_jsonb(x) FROM public.gp_tareas x
UNION ALL SELECT 'gp_nodos_edt', id::text, to_jsonb(x) FROM public.gp_nodos_edt x
UNION ALL SELECT 'gp_entregables', id::text, to_jsonb(x) FROM public.gp_entregables x
UNION ALL SELECT 'gp_avances', id::text, to_jsonb(x) FROM public.gp_avances x
UNION ALL SELECT 'gp_reuniones', id::text, to_jsonb(x) FROM public.gp_reuniones x
UNION ALL SELECT 'gp_archivos', id::text, to_jsonb(x) FROM public.gp_archivos x
UNION ALL SELECT 'gestor_unidades', id::text, to_jsonb(x) FROM public.gestor_unidades x
UNION ALL SELECT 'gestor_proyectos', id::text, to_jsonb(x) FROM public.gestor_proyectos x
UNION ALL SELECT 'gestor_cronograma_items', id::text, to_jsonb(x) FROM public.gestor_cronograma_items x
UNION ALL SELECT 'gp_eventos_auditoria', id::text, to_jsonb(x) FROM public.gp_eventos_auditoria x
ORDER BY tabla, id;
```

No incluye archivos de Storage (fotos/adjuntos): éstos se bajan aparte desde
Storage si hiciera falta.

### 14. Ejecución real del respaldo (22-11-2026)

La consulta de la sección 13 **sí se ejecutó desde esta sesión** (MCP de
Supabase). Lo que no se pudo hacer solo fue subir el archivo a Drive: no hay
MCP de Google conectado. Sí hay CLI de Supabase en
`C:\Users\csand\AppData\Roaming\npm\supabase.ps1`, pero `db dump` necesita la
contraseña de la base, que no está en esta sesión.

Archivo generado: `C:\Users\csand\Respaldos Qaway\qaway-gp-2026-11-22.csv`.

- **14.041 filas**, **21.024.751 bytes (≈21 MB)**.
- Por tabla: `gestor_cronograma_items` 6.743, `gp_nodos_edt` 6.704,
  `gestor_unidades` 302, `gp_sedes` 252, `tenants` 11, `users` 3,
  `gp_config_gestion_proyectos` 2, `gp_proyectos` 1, `gestor_proyectos` 1.
- Corrección: el CSV **no es pequeño** (21 MB). Aun así no obliga a comprar Pro:
  se guarda en Drive, no en Supabase. Guardando 4 copias son ~84 MB de tus 5 TB.
- No hay carpeta local sincronizada de Google Drive en este equipo (sí hay
  OneDrive). Falta subir el CSV a Drive a mano o activar el método de la
  sección 15.

### 15. ¿Existe conexión Supabase → Drive?

**No hay botón nativo** en Supabase ni MCP de Google en esta sesión. La forma
gratis de automatizarlo es **Google Apps Script**, que vive dentro de tu Drive:

1. En Drive: **Nuevo → Más → Google Apps Script**.
2. En Supabase: **Settings → API → service_role key** (clave secreta; copiarla,
   nunca pegarla en un chat ni en la app).
3. Pegar este script, reemplazando `URL`, `CLAVE` y el nombre de la carpeta:

```javascript
const URL = 'https://qrusdsqgygfolxfrafyd.supabase.co/rest/v1/';
const CLAVE = 'PEGAR_AQUI_LA_SERVICE_ROLE_KEY';
const TABLAS = ['users','tenants','gp_config_gestion_proyectos','gp_sedes',
  'gp_unidades_organizacionales','gp_personas','gp_equipos','gp_proyectos',
  'gp_tareas','gp_nodos_edt','gp_entregables','gp_avances','gp_reuniones',
  'gp_archivos','gestor_unidades','gestor_proyectos',
  'gestor_cronograma_items','gp_eventos_auditoria'];

function respaldar() {
  const lineas = ['tabla,id,fila'];
  for (const tabla of TABLAS) {
    const res = UrlFetchApp.fetch(URL + tabla + '?select=*', {
      headers: { apikey: CLAVE, Authorization: 'Bearer ' + CLAVE },
      muteHttpExceptions: true
    });
    if (res.getResponseCode() !== 200) throw new Error(tabla + ': ' + res.getContentText());
    for (const fila of JSON.parse(res.getContentText())) {
      const json = JSON.stringify(fila).replace(/"/g, '""');
      lineas.push('"' + tabla + '","' + fila.id + '","' + json + '"');
    }
  }
  const nombre = 'qaway-gp-' + Utilities.formatDate(new Date(), 'America/Lima', 'yyyy-MM-dd') + '.csv';
  const carpeta = DriveApp.getFoldersByName('Respaldos Qaway');
  const destino = carpeta.hasNext() ? carpeta.next() : DriveApp.createFolder('Respaldos Qaway');
  destino.createFile(nombre, lineas.join('\n'), 'text/csv');
}

function programar() {
  ScriptApp.newTrigger('respaldar').timeBased()
    .everyWeeks(1).onWeekDay(ScriptApp.WeekDay.MONDAY).create();
}
```

4. Ejecutar `programar` **una sola vez** desde el menú del editor. Eso crea el
   disparador cada 7 días.
5. Ejecutar `respaldar` una vez para probar y revisar el CSV en Drive.

No se activó todavía: requiere que el usuario pegue su clave secreta. Es gratis
y no aumenta el espacio de Supabase. Si no quiere dejar la clave en el script,
se mantiene el procedimiento manual de la sección 13.

### 16. Flujo de "Sede central + sedes externas" (22-11-2026)

Sólo se cambió esa modalidad. **No se tocó** "Solo la sede central", el botón
**Editar** ni los estados **Guardado** de la tarjeta. Tampoco se tocó
`SedeUbicacionFields.tsx` (otro agente está trabajando en él).

Orden nuevo:

1. Elegir **Sede central + sedes externas**.
2. **Cantidad de sedes** (mínimo 2) y **Guardar cantidad**. Hasta aquí no se
   muestra el formulario de la sede principal.
3. Recién entonces aparece **Registrar Sede Central** con su mapa.
4. Al guardarla, el mapa se pliega: queda una línea
   `Sede Central registrada: <nombre>` con **Ver / editar ubicación**.
5. Debajo, con más peso, aparece **¿Registrar las demás sedes ahora?** e indica
   cuántas sedes externas faltan. Botones: **Registrar ahora** y
   **Continuar después**.
6. Al dar **Continuar después**, el aviso **no desaparece**: se queda en gris
   con el texto **Registro de sedes externas pendiente · Guardado para después**
   y el botón **Registrar ahora** sigue disponible para retomarlo. Igual que los
   demás campos guardados: se deja visible en gris, no se borra.
7. Al registrar, se abren los formularios de las sedes externas.

Cuidados aplicados:

- El aviso exige que ya exista sede principal; si no, las externas se contaban
  de más (`cantidad - sedes.length`).
- En "varias", cantidad 1 ya no cambia la modalidad a "una": muestra error.
- La cantidad no se escribe dos veces: si ya está guardada,
  `handleCrearSedeCentral` omite ese `upsert`.
- En "varias" no se cierra la tarjeta al guardar la principal (antes se cerraba
  y el aviso quedaba escondido tras **Editar**). En "una" se mantiene el cierre.

Verificación: `npm run typecheck` limpio. Sin `build`, push ni commit.

### 17. Plantilla del sector público corregida (22-11-2026)

La lista que se venía mostrando en el paso 2 **no era la trabajada**. Se
reemplazó `PLANTILLA_SECTOR_PUBLICO` en `organizacionPlantillas.ts:80-203` por
la lista completa del Estado:

```
1      Titular / Alta Dirección de la Entidad
1.1    Órganos de Asesoramiento
1.1.1    Planeamiento y Presupuesto
1.1.2    Asesoría Jurídica
1.2    Órganos de Apoyo
1.2.1    Administración
1.2.1.1    Recursos Humanos
1.2.1.2    Finanzas / Contabilidad / Tesorería
1.2.1.3    Logística / Abastecimiento / Patrimonio
1.2.1.4    Tecnologías de la Información
1.3    Órganos de Línea
1.3.1    Dirección de Línea A
1.3.2    Dirección de Línea B
1.4    Órgano de Control Institucional
```

Fuentes: `doc2/8-8-Estructura-organizacional_carlos/5-estructuras-convencionales-investigadas.md:37-58`
y `1-concepto.txt:20-64`. `4-aclaración.txt:10` ya indicaba que esto era lo que
debía reflejarse y "distinto de lo que se creó hoy".

**DRE y UGEL ya no son áreas de la sede central.** Se sacaron de la plantilla.
Se registran como sedes externas en el Paso 1, igual que dice el flujograma
(`ARCHITECTURE_ROLES_SEDES.md:43-48`: DRE hija, UGEL nieta). Con "solo sede
central" no aparecen; con "central + sedes externas" se registran en el bloque
de sedes, nunca dentro del organigrama de la entidad. El nodo 1.5
"Órganos Desconcentrados" tampoco se precarga: `1-concepto.txt:62` dice que no
se agrega automáticamente.

**Sin tocar diseño:** no se cambió `OrganizacionTab.tsx` (render, botones
**Editar**, estados **Guardado**) ni `SedeUbicacionFields.tsx`. La numeración
sale sola del orden de definición: los hijos de "Entidad" son asesoramiento,
apoyo, línea y control → 1.1, 1.2, 1.3, 1.4. Sólo se cambiaron datos.

Nota técnica: los tests se alinearon después con esta misma plantilla
(sección 19). La validación acordada sigue siendo sólo `npm run typecheck`.

### 18. Origen de la plantilla vieja y limpieza (22-11-2026)

**De dónde salió la otra lista** (Entidad raíz, Despacho, OCI, DRE, UGEL,
Unidad sin clasificar): estaba escrita **sólo en el front**, en
`organizacionPlantillas.ts` → `PLANTILLA_SECTOR_PUBLICO`. No venía de Supabase.
Sus nombres se inspiraron en `doc2/8-8-Estructura-organizacional_carlos/1-concepto.txt`
y en los aliases de `gp_plantilla_estructura_org_c`, pero el array que se
mostraba vivía en el front.

**A qué alimentaba:** a un solo lugar, `OrganizacionTab.tsx:107-109`:
la misma lista se usaba para la vista previa del paso 2 y para escribir la
estructura (`borradoresPersonalizados`). El front **no lee**
`gp_plantilla_estructura_org_c` (grep en `src`: 0 usos; sólo aparece en doc2).

**Supabase revisado:**

| Tabla | Resultado |
|---|---|
| `gp_plantilla_estructura_org_c` (22 filas) | 2 aliases tenían "Órganos de Línea (Misionales)" y "Oficina de Planeamiento y Presupuesto". Se cambió el primero a **Órganos de Línea** (nombre y alias). Verificado: 0 filas con "Misional". |
| `gp_unidades_organizacionales` | 1 alias con "Órganos de Línea (Misionales)". Cambiado a **Órganos de Línea**. Verificado: 0 filas con "Misional". |
| `gestor_unidades` (302 filas, 260 DRE/UGEL) | **NO se tocó**: es el catálogo legado real documentado en `doc2/1-Auditoria-y-decision/1.1-Hallazgos-criticos-y-eliminar-todo-menos-infraestructura.txt:65`. Es datos de tenant, no la plantilla del front. |
| `gp_config_gestion_proyectos` | 0 filas con nombres viejos. |

También se quitó "(Misionales)" del nombre de la plantilla del front.

### 19. Alineación total y barrera anti-listas (22-11-2026)

**Tests alineados con la plantilla pública correcta:**

| Archivo | Cambio |
|---|---|
| `organizacionEscritura.test.ts` | 14 nodos, sufijos `AAAA`–`NNNN`, claves `asesoramiento`/`apoyo`/`linea`/`oci`, numeración 1 → 1.4, nombres "Titular / Alta Dirección de la Entidad", "Órganos de Línea", "Dirección de Línea A". Fallos inyectados en INSERT #5 y #16; semillas intactas; 15 filas de tenant al final. |
| `organizacionJerarquia.test.ts` | `nombre_original` = "Titular / Alta Dirección de la Entidad"; `soloActivadas` = 9 nodos coherentes, sin DRE/UGEL. |

**Barrera para que ningún agente invente otra lista:**

1. `organizacionPlantillas.ts` lleva un comentario **REGLA CANÓNICA** justo
   encima de `PLANTILLA_SECTOR_PUBLICO`: esa es la única lista del sector
   público; para cambiarla se edita primero el documento fuente y luego el
   array; está prohibido crear otra lista o reintroducir los nombres viejos.
2. El documento fuente `5-estructuras-convencionales-investigadas.md:31,51-54,59`
   usa los mismos nombres (sin "(Misionales)" ni "(misión 1/2)"). Fuente y
   código ya no se contradicen.
3. Los tests ya no recuerdan la lista vieja: no hay fixtures con "Entidad
   (raíz)", "Despacho de Alta Dirección", DRE, UGEL ni "Unidad sin clasificar".
4. Supabase: 0 filas con "Misional" en `gp_plantilla_estructura_org_c` y
   `gp_unidades_organizacionales`. `gestor_unidades` sigue intacto (catálogo
   legado de tenants).

**Verificación:** grep de nombres viejos en `src` sólo devuelve el comentario
de la barrera y las menciones históricas de esta bitácora. `npm run typecheck`:
limpio. Sin `build`, commit ni push.

### 20. Sucursales visibles en el paso 2 (22-11-2026)

**Reporte del tenant Roberto Gómez:** guardó Sede Central Lima + 2 sucursales
en el Paso 1 (datos confirmados en `gp_sedes`: `Sede Oxpamapa`, `Sede Huacho`),
pero el paso 2 sólo mostraba el árbol de áreas del sector.

**Causa:** `plantillaPreview` se construía sólo desde
`construirBorradoresPlantilla(sector, …)`. Ese array no lee `gp_sedes`, así que
las sedes guardadas nunca aparecían en la vista previa.

**Cambio:** en el paso 2, dentro del modo edición, se agregó un bloque
**Sedes registradas** arriba del árbol de áreas:

- Sede Principal en el primer nivel.
- Sucursales indentadas debajo (una por fila, con el nombre guardado).
- Texto corto: «Las sedes se registran en el Paso 1 y no se convierten en áreas
  del organigrama».

No se metió a las sedes en `PLANTILLA_SECTOR_PUBLICO`, no se crearon unidades
nuevas y no se borraron las estructuras antiguas del tenant. Es sólo vista: el
mismo criterio de la sección 16 (DRE/UGEL y sucursales = sedes externas, no
áreas de la sede central). No se tocó el render del paso 1 ni
`SedeUbicacionFields.tsx`.

**Verificación:** `npm run typecheck` limpio. Sin `build`, commit ni push.

## Deudas visibles (no ocultas)

1. "Sólo sedes autorizadas" guarda el alcance, pero no hay UI para elegir sedes concretas (`gp_config_gestion_alcance_r` sigue con 0 filas).
2. Paso 6 del documento original (modalidades de intervención) sin UI.
3. El árbol escribe en `gestor_unidades` (`organizacionEscritura.ts:623-637`) y se lee/renombra en `gp_unidades_organizacionales`. No se cambió para no destruir lo que ya funciona.
4. `gp_sedes` no tiene DDL versionado en `supabase/`, aunque existe en BD con RLS propio.
5. El mapa depende de las teselas públicas de OpenStreetMap; si no hay red, las coordenadas se pueden digitar igualmente.
6. **DEUDA PENDIENTE (veremos después): respaldo automático en Google Drive.**
   Elegimos Free sin pagar. Hay un CSV real generado el 22-11-2026 en
   `C:\Users\csand\Respaldos Qaway\qaway-gp-2026-11-22.csv` (14.041 filas, 21 MB),
   pero **no está subido a Drive** y **no hay descarga automática cada 7 días**:
   no hay MCP de Google conectado ni botón nativo en Supabase. La alternativa
   gratis con Google Apps Script está escrita en la sección 15, sin activar
   porque requiere la clave secreta del usuario. Mientras tanto, el respaldo es
   manual (sección 13) y la recuperación real sigue siendo el borrado lógico.
   No se activó pg_cron/Edge Function para no generar espacio ni costo.

## Verificación

- `npm run typecheck`: limpio.
- Ubicación: `SedeUbicacionFields.tsx:1-328` (mapa en `:23-92`, sugerencias Nominatim en `:118-285`); Leaflet en `package.json:38`.
- Alta y edición de Sede Central: `OrganizacionTab.tsx:368`; alta de externas: `OrganizacionTab.tsx:452`.
- Modalidad y cantidad: `OrganizacionTab.tsx:139,368,422`; bloque de cantidad y pregunta en `OrganizacionTab.tsx:649,672`.
- Aviso temporal de 3 s: `OrganizacionTab.tsx:59,501`.
- Columnas usadas confirmadas en BD: `gp_sedes.pais/departamento/provincia/distrito/ubigeo/direccion/referencia_ubicacion/latitud/longitud` y `gp_config_gestion_proyectos.metadata`.
- `gp_tipos_sede_c`: `sede_operativa` = "Sede operativa / externa".
- Sin `build`, `dist`, `build:dev`, push ni commit.
- Sin tocar `ConfiguracionView.tsx`, `EmpresaTab.tsx` ni `PreferenciasTab.tsx`.


### 21. Decisión Opción A — Unificación en `public.gestor_unidades` (22-11-2026)

**Problema detectado:** `organizacionEscritura.ts` insertaba la estructura organizacional en `public.gestor_unidades`, mientras `OrganizacionTab.tsx` intentaba leer/renombrar en `gp_unidades_organizacionales` (cayendo a `gestor_unidades` como respaldo) y `gp_config_gestion_proyectos.unidad_responsable_id` tenía la FK `gp_config_gestion_proyectos_unidad_responsable_id_fkey` apuntando a `gp_unidades_organizacionales(id)`. Al guardar el Paso 3, PostgreSQL rechazaba el `id` por violación de clave foránea.

**Decisión aprobada (Opción A):**
- `public.gestor_unidades` pasa a ser la **única fuente de verdad** para crear, leer, renombrar (`name`, conservando `metadata.plantilla.nombre_original`), reiniciar y referenciar la unidad responsable.
- **Migración SQL requerida en Supabase:** `supabase/migrations/20261122000001_gp_config_gestion_fk_gestor_unidades.sql` (reapunta `gp_config_gestion_proyectos_unidad_responsable_id_fkey` a `public.gestor_unidades(id)` con `ON DELETE SET NULL`).
- **Frontend (`OrganizacionTab.tsx`):** `cargarEstado()` lee directamente vía `listarUnidadesParaJerarquia` (`gestor_unidades` + `calcularNumeracion`) y `handleGuardarAliasesLote()` actualiza `gestor_unidades.name` acotado por `tenant_id`.

- **Ajuste de tipo verificado en PostgreSQL (22-11-2026):** al ejecutar la migración en Supabase se confirmó `ERROR: 42883: operator does not exist: text = uuid` porque `public.gestor_unidades.id` es `text` mientras `gp_config_gestion_proyectos.unidad_responsable_id` era `uuid`. Se actualizó `20261122000001_gp_config_gestion_fk_gestor_unidades.sql` para convertir `unidad_responsable_id` a `text` (solución estructural de esquema, no parche), limpiar huérfanos y recrear la FK hacia `public.gestor_unidades(id)`.
- **Tablero de permisos (`PermisosTab.tsx`):** se agregó el **Esquema de Permisos del Gestor** agrupado por módulo (*Proyectos*, *Estructura EDT*, *Tareas y Seguimiento*, *Equipo y Gobernanza*) con diseño nativo de Qaway Lab, mostrando roles base, usuarios con llave curable y edición directa sobre `user_app_roles`.
