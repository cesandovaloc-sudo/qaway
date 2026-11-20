# 5. Destello de interfaz vacía al entrar al Gestor de Proyectos 2

**Fecha:** 20 de noviembre de 2026
**Estado:** corregido de raíz. Sin `setTimeout`, sin ocultar lentitud y sin usar `localStorage` como fuente de datos.

## Problema reportado

Al entrar al Gestor (o cambiar de módulo) se ve durante unos milisegundos una pantalla sin datos:

- Módulo de Proyectos / Gantt: "Sin proyecto activo" y "Cronograma nuevo · Listo para estructurar" antes de que aparezca el cronograma real.
- Topbar: "Cargando..." y "Proyecto" antes de mostrar el nombre real.
- Sidebar: "Sin proyectos" antes de listar los proyectos del tenant.
- Configuración: "Mi Perfil" sin nombre y "Datos de la Empresa" con el formulario en blanco antes de llenarse.

## Causa real (confirmada en código)

No era un temporizador ni una espera faltante: era el **orden de renderizado**.

1. `usePerfilGp()` nace con `perfil = undefined` y `cargando = true`
   (`13-Gestor_Proyectos2/src/services/gpPermisosService.ts:232-243`).
   Para resolverse necesita, en fila: `getUser` (`contextoSesion.ts:176`) →
   `users` + dos RPC (`contextoSesion.ts:211-215`) → `app_catalog`
   (`gpPermisosService.ts:172`) → `user_app_roles` (`gpPermisosService.ts:175-180`).

2. Los proyectos esperan a la identidad. El effect solo corre cuando
   `cargandoPerfilGp` ya es `false` (`App.tsx:416`) y recién ahí llama a
   `listGestorProjects` (`App.tsx:423`). Es decir, **dos esperas en serie**.

3. Mientras tanto, el `return` de `App.tsx` se ejecuta desde el primer render
   (`App.tsx:569` antes de la corrección). El comentario de `App.tsx:600-602`
   lo decía literalmente: *"La maqueta se monta siempre… con la interfaz completa"*.
   Por eso se veía vacía: el Sidebar (`Sidebar.tsx:128`), el Topbar
   (`Topbar.tsx:76,178`), el Gantt (`CronogramaView.tsx:69-71`) y
   `CronogramaGanttView.tsx:9931` se pintaban antes de que llegaran los datos.

4. Configuración repetía el problema por separado: `PerfilTab.tsx` y
   `EmpresaTab.tsx` consultaban por su cuenta `getUser` + `users` + `tenants`,
   y el Topbar hacía lo mismo otra vez (`Topbar.tsx:90,96,104`).

5. El intento anterior documentado en `1-Pop Up.txt:16-19` agregó el estado
   local `cargandoNube` en `CronogramaGanttView.tsx:1259,9899`. Eso solo
   tapaba el Gantt: no cubría Sidebar, Topbar ni Configuración.

## Corrección aplicada

### Una sola puerta de entrada (`App.tsx`)

- Nuevo estado `cargandoProyectos`, que arranca en `true` y se apaga en `then`,
  en `catch` y en la rama sin sesión (`App.tsx:150,424,430,438,448`).
- `listo = !cargandoPerfilGp && !cargandoProyectos && !cargandoPerfilVisible`
  (`App.tsx:151`).
- Mientras `!listo`, se muestra el loader oficial que ya existía
  (`ModuleLoadingFallback`, `App.tsx:585`; estilos en `styles.css:340-405`) y
  **no se monta** Sidebar, Topbar ni canvas. Cuando la puerta se abre, todo se
  monta con datos reales. Si el tenant tiene 0 proyectos, el estado vacío es
  legítimo: aparece recién cuando la BD lo confirmó.

### Un solo perfil visible (`services/perfilVisibleService.ts`)

- `usePerfilVisible()` resuelve **una vez** (caché en vuelo) `getUser` + `users`
  + `tenants` + usuarios del tenant para el responsable. Expone
  `perfil`, `cargando` y `recargar()`; la caché se invalida solo en eventos de
  identidad.
- `Topbar.tsx:5,39,72-91`: recibe `perfilVisible` como prop. Se eliminaron su
  estado "Cargando..." y sus consultas propias. Conserva solo la redirección a
  `/login` cuando no hay sesión o cuando llega `SIGNED_OUT`.
- `PerfilTab.tsx:6,21-26`: lee nombre, correo, rol y empresa del hook compartido.
  Ya no puede mostrar "Sin nombre registrado" durante la carga.
- `EmpresaTab.tsx:5,32-49`: inicializa `form`, prefijo y responsable desde el
  mismo hook; tras guardar llama a `recargar()` sin volver a mostrar el
  formulario vacío. Sigue conservando `content`/`features` con spread.

### Retiro del parche local

- `CronogramaGanttView.tsx:1259-1261`: se quitó `cargandoNube`.
- `CronogramaGanttView.tsx:9899`: la condición quedó en `cargandoPerfilGp`,
  que ya es `false` cuando el canvas se monta gracias a la puerta de entrada.

## Validación

- `npm run typecheck` → sin errores.
- Greps de fuente: 7 usos de `setCargandoProyectos`/`listo` en `App.tsx`,
  12 referencias a `usePerfilVisible`, 0 usos de `cargandoNube` y 0 de
  `obtenerUsuarioSesion` en el Topbar.
- No se ejecutó `build`/`dist`. No se hizo commit ni push.
- No se tocó trabajo ajeno: `OrganizacionTab.tsx`, `CronogramaView.tsx`,
  `HubPage.jsx`, notificaciones ni `AGENTS.md`.

## 6. Unificación de la vista de carga (20-nov-2026)

El usuario reportó demasiadas vistas encadenadas: rueda naranja "Qaway ·
Cargando" → barras azules → salto al aparecer la app → salto de reacomodación
→ recálculo. Se midieron tres puntos distintos que mostraban la rueda naranja
para esta ruta:

- `RouteSuspense.jsx:10` (fallback mientras se descarga el chunk lazy).
- `HubAccessGuard.jsx:253` (fallback mientras comprueba acceso).
- `AppRouter.jsx:161` (`renderRoute` envuelve las 4 rutas del Gestor).

**Implicancia de borrar la rueda naranja:** `RouteLoading` es global: lo usan
todas las rutas lazy del Hub. Borrarlo de `RouteSuspense.jsx` habría cambiado
el loader de TODAS las apps. Por eso se hizo puntual:

- Archivo nuevo `src/router/GestorRouteLoading.jsx`: una sola vista, barras
  azules + texto "QAWAY CARGANDO". Estilos inline porque el router se muestra
  antes de que cargue el CSS del Gestor.
- `RouteSuspense` acepta `fallback` opcional; `HubAccessGuard` acepta
  `loadingFallback` opcional. El resto del Hub sigue con su rueda intacta.
- `renderGestorRoute()` (`AppRouter.jsx:167-170`) aplica ese fallback a las
  4 rutas `/hub/gestor_proyectos…`.
- `App.tsx:585` reutiliza el MISMO componente en la puerta de entrada: no hay
  cambio visual entre el router y el shell.
- `styles.css:352-405`: barras de 12 px y alturas 44/34/24 (antes 9 px y
  38/28/20). Se eliminaron `box-shadow`, el gradiente y el `drop-shadow`
  neón del keyframe, y el parpadeo del texto.

**Pendiente evaluado, no aplicado:** los dos saltos posteriores vienen de
`App.tsx:182-200` (un efecto cambia `userRole` y `cronogramaPerspective`
después de montar el shell) y de los `Suspense` internos de cada módulo, que
consultan Supabase al montarse. Requieren derivar rol/perspectiva en el mismo
render y unificar esos fallbacks; se dejó para una aprobación aparte porque
toca lógica de permisos.
