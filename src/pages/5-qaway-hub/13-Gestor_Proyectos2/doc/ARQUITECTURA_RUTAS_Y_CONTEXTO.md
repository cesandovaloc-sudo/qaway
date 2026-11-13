# Arquitectura de rutas y contexto — Gestor de Proyectos

## Ruta pública definitiva

La aplicación se presenta dentro del Qaway Hub como **Gestor de Proyectos**.
La ruta canónica usa plural y separa explícitamente el ámbito de proyecto:

```text
/hub/gestor_proyectos/proyecto/<vista>
```

Ejemplo local:

```text
http://localhost:5174/hub/gestor_proyectos/proyecto/gantt
```

Ejemplo productivo:

```text
https://www.qawaylab.com/hub/gestor_proyectos/proyecto/gantt
```

## Vistas canónicas

| Vista | Ruta |
|---|---|
| Resumen | `/hub/gestor_proyectos/proyecto/resumen` |
| Gantt | `/hub/gestor_proyectos/proyecto/gantt` |
| Estructura | `/hub/gestor_proyectos/proyecto/estructura` |
| Unidades ejecutoras | `/hub/gestor_proyectos/proyecto/unidades` |
| Tareas | `/hub/gestor_proyectos/proyecto/tareas` |
| Hitos | `/hub/gestor_proyectos/proyecto/hitos` |
| Reuniones | `/hub/gestor_proyectos/proyecto/reuniones` |
| Reportes | `/hub/gestor_proyectos/proyecto/reportes` |
| Usuarios | `/hub/gestor_proyectos/proyecto/equipo` |
| Actas | `/hub/gestor_proyectos/proyecto/actas` |
| Configuración | `/hub/gestor_proyectos/proyecto/configuracion` |

## Contexto actual del proyecto

Por ahora el módulo trabaja con un proyecto activo local, identificado internamente
como `p1`:

```text
Distribución de Materiales DOT 2027
```

La ruta pública no muestra todavía `p1` porque el selector de proyecto actual es
parte del shell existente y la persistencia de proyectos todavía se encuentra en
fase local/tolerante. Cuando se formalice el selector multi-proyecto y la
clasificación en Supabase, la ruta podrá evolucionar de forma compatible a:

```text
/hub/gestor_proyectos/proyecto/<proyectoId>/gantt
```

No se debe agregar manualmente el identificador hasta conectar esa navegación con
la entidad persistida; hacerlo antes produciría URLs que aparentan aislamiento
por proyecto sin que todavía exista ese aislamiento en los datos.

## Cambio de proyecto

Al seleccionar otro proyecto, el sistema debe cambiar conjuntamente:

- proyecto activo;
- cronograma y tareas;
- hitos y reuniones;
- unidades operativas;
- responsables y usuarios visibles;
- reportes y configuración del proyecto.

El nombre del proyecto no debe quedar solamente en el texto del encabezado ni en
`localStorage`. La siguiente fase deberá sincronizar el selector con el proyecto
persistido y, después, incorporar `<proyectoId>` en la URL.

## Entrada de usuarios

La entrada general será:

```text
/hub/gestor_proyectos
```

Después del login compartido del Hub, la autorización debe resolver el tenant, la
aplicación Gestor y los proyectos/unidades permitidos para el usuario. El usuario
no debe ser enviado al flujo de pagos si ya tiene acceso a Gestor.

Casos previstos:

1. Un usuario con un proyecto: entrar al resumen de ese proyecto.
2. Un usuario con varios proyectos: mostrar el selector de proyectos.
3. Un usuario sin proyectos: mostrar estado vacío, sin inventar permisos.
4. Coordinador general: administrar los proyectos y unidades autorizados de su
   tenant, sin convertirse en administrador de la plataforma Qaway.

## Cartera, programa y proyecto

Son niveles diferentes y no deben mezclarse:

```text
Cartera
└── Programa
    └── Proyecto
        ├── Cronograma
        ├── Tareas
        ├── Hitos
        ├── Unidades
        ├── Reuniones
        └── Reportes
```

El caso MINEDU actual es un **proyecto**:

```text
Distribución de Materiales DOT 2027
```

No debe convertirse automáticamente en programa o cartera. Las rutas futuras de
esos niveles, si se habilitan, serán independientes:

```text
/hub/gestor_proyectos/carteras/<carteraId>
/hub/gestor_proyectos/programas/<programaId>
/hub/gestor_proyectos/proyectos/<proyectoId>
```

## Compatibilidad

Las rutas antiguas bajo `/hub/gestor_proyecto` se mantienen temporalmente para no
romper enlaces locales o históricos. No deben utilizarse para nuevos enlaces,
documentos ni publicaciones. Todo nuevo enlace debe usar:

```text
/hub/gestor_proyectos/proyecto/...
```

## Estado real del acoplamiento al Hub (2026-11-13)

La app **ya no se sirve como web independiente**: comparte el despliegue de
`1-qawaylab-web` y se monta en el `AppRouter.jsx` central.

| Pieza | Estado |
|---|---|
| Montaje en el router central | `/hub/gestor_proyectos/*` y `/hub/gestor_proyecto/*` → `GestorProyectos2AppPage` |
| Ruta base interna | `BASE_PATH = '/hub/gestor_proyectos'` (`src/types.ts`) |
| URLs antiguas sin prefijo | `/gestor_proyectos/*` redirige conservando subcamino y query |
| Shell visual | Propio (sidebar + canvas del módulo); no usa el `Layout` del Hub, por lo que no hay doble cabecera |
| Bundle | Entra al build principal como chunk `GestorProyectos2AppPage-*.js` |

El servidor de desarrollo válido es el de la raíz del repo:

```text
http://localhost:4100/hub/gestor_proyectos/sedes
```

El `vite.config.ts` y el `index.html` propios de esta carpeta quedan solo como
resto del modo standalone; no participan del despliegue.

### Bitácora de acoplamiento

**AC-09 · Rutas fuera del namespace del Hub**

- *Falla detectada:* `BASE_PATH` apuntaba a `/gestor_proyectos`, fuera del
  namespace `/hub`; el router central solo registra `/hub/gestor_proyectos`, así
  que la navegación interna salía del módulo montado.
- *Impacto:* URLs escritas a mano daban 404 y la app solo funcionaba en su
  servidor standalone (`:5174`).
- *Solución aplicada:* `BASE_PATH = '/hub/gestor_proyectos'`, alias anidados
  preservados y `LegacyGestorProyectosRedirect` para las URLs antiguas.
- *Validación:* `tsc --noEmit` sin errores nuevos en `types.ts` / `App.tsx`;
  `oxlint` sin errores en `AppRouter.jsx`; `npm run build` de la raíz completo
  (56.79 s) con el chunk del módulo generado.

**AC-10 · Fuga de estilos globales al montar en el Hub**

- *Falla detectada:* `src/styles.css` declaraba `body { font-family; margin: 0 }`,
  que al importarse desde el wrapper reescribía el `body` de toda la web.
- *Impacto:* tras visitar el Gestor, el resto del Hub quedaba con la tipografía y
  márgenes del módulo.
- *Solución aplicada:* la regla se acotó a `body:has(.qm-root)`; como la app
  siempre renderiza `.qm-root`, el resultado visual es idéntico.
- *Validación:* build de la raíz sin errores; sin cambios en clases ni en JSX.

### Pendiente de acoplamiento

- El módulo usa un cliente Supabase con `storageKey` propio
  (`qaway_gestor_proyectos_auth`). Evita desconexiones cruzadas, pero al montarse
  en el Hub no hereda la sesión del usuario, así que las lecturas con RLS caen a
  modo local. Conectar la sesión compartida queda para cuando existan las tablas
  `gp_*` y el slug en `app_catalog`.

## Límites actuales

- No se ejecutan migraciones automáticamente.
- No se envían invitaciones ni correos.
- El tenant y la autorización real todavía deben conectarse mediante Supabase.
- La URL con `<proyectoId>` queda preparada como siguiente fase, pero no se finge
  aislamiento por proyecto antes de conectar la persistencia real.
