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

## Límites actuales

- No se ejecutan migraciones automáticamente.
- No se envían invitaciones ni correos.
- El tenant y la autorización real todavía deben conectarse mediante Supabase.
- La URL con `<proyectoId>` queda preparada como siguiente fase, pero no se finge
  aislamiento por proyecto antes de conectar la persistencia real.
