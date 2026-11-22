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
| 1 | **¿Tienes una sola sede o varias?** La sede central siempre tiene jerarquía propia; "varias" = sede central + sedes externas (sucursales, tiendas, UGEL, obras). | `OrganizacionTab.tsx:306` |
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

## Deudas visibles (no ocultas)

1. Alta de sedes externas desde esta pestaña: sigue sin existir; sólo se registra la sede central.
2. "Sólo sedes autorizadas" guarda el alcance, pero no hay UI para elegir sedes concretas (`gp_config_gestion_alcance_r` sigue con 0 filas).
3. "Sin sede física" es guía de UI; no se persiste entre recargas.
4. Paso 6 del documento original (modalidades de intervención) sin UI.
5. El árbol escribe en `gestor_unidades` (`organizacionEscritura.ts:623-637`) y se lee/renombra en `gp_unidades_organizacionales`. No se cambió para no destruir lo que ya funciona.
6. `gp_sedes` no tiene DDL versionado en `supabase/`, aunque existe en BD con RLS propio.

## Verificación

- `npm run typecheck`: limpio.
- Sin `build`, `dist`, `build:dev`, push ni commit.
- Sin tocar `ConfiguracionView.tsx`, `EmpresaTab.tsx` ni `PreferenciasTab.tsx`.
