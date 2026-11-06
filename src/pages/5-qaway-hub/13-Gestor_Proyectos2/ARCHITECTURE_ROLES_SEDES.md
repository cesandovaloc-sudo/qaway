# Arquitectura de Gestor: organización, unidades y proyectos

## 1. Alcance

Gestor es la capa de planificación, seguimiento y control operativo de una organización. Usa la identidad y el acceso general del Qaway Hub, pero mantiene sus relaciones operativas propias.

En esta fase se implementa el modelo de datos y su contexto explícito. **No se conecta todavía con login, `auth.uid()`, invitaciones ni asignaciones automáticas del Hub.** Esa conexión queda reservada para la fase de seguridad.

## 2. Estructura funcional

```text
Tenant / organización principal
├── Unidades operativas
│   ├── Central
│   ├── UGEL
│   ├── Obra
│   ├── Jefatura
│   ├── Tienda
│   ├── Oficina
│   └── Departamento
├── Proyectos
│   ├── Unidad central
│   └── Unidades participantes
├── Miembros y trabajadores
└── Responsabilidades operativas
```

“Unidad operativa” es el término universal. Puede representar una sede física, una obra, una UGEL, una jefatura o cualquier área de trabajo; no se presupone que sea una ubicación física.

## 3. Entidades persistentes de Gestor

### `gestor_unidades`

Catálogo de unidades pertenecientes a un tenant. Soporta jerarquía con `parent_unit_id`, región, macroregión y tipos operativos.

### `gestor_unidad_miembros`

Relación futura entre usuarios del Hub y unidades. Usa `public.users.id`, pero durante la fase actual `user_id` puede permanecer vacío para permitir preparar la estructura antes de conectar login.

### `gestor_proyectos`

Cada proyecto puede pertenecer a un tenant y tener una unidad central. Los registros históricos mantienen temporalmente esos campos vacíos hasta ejecutar la clasificación de datos.

### `gestor_proyecto_unidades`

Relaciona proyectos con una o varias unidades participantes.

## 4. Acceso general y responsabilidades

Los roles generales del Hub siguen siendo:

```text
admin · editor · viewer · guest
```

Gestor no crea otro sistema de roles. Las responsabilidades operativas son datos de contexto, por ejemplo:

```text
project_manager
unit_responsible
reviewer
progress_editor
field_collaborator
```

No se usan cargos como `RECTOR`, `SUPERVISOR` o `EJECUTOR` como permisos globales.

## 5. Inventario y Gestor

El módulo de Inventario tiene una interfaz de Sedes y la tabla `inventory_locations` para almacenes y ubicaciones internas. Esa tabla no es el catálogo universal de Gestor. No se enlazan automáticamente ambos dominios ni se reutilizan sus datos demo.

Si en el futuro se requiere una integración, se hará mediante una relación explícita y aprobada, sin cambiar el significado de ninguna entidad.

## 6. Contexto de transición

Mientras login no esté conectado, las pantallas y servicios pueden recibir un `tenantId` explícito. No se debe interpretar ese contexto como seguridad: las políticas actuales del cronograma siguen pendientes de endurecimiento.

La secuencia para activar seguridad será:

1. Clasificar proyectos históricos y asignarles tenant.
2. Completar unidades y miembros.
3. Conectar `public.users` y `auth.uid()`.
4. Sustituir el contexto manual por el tenant del usuario autenticado.
5. Activar RLS tenant-aware en todas las tablas Gestor.

## 7. Reglas de compatibilidad

- El cronograma conserva sus IDs y comportamiento actual.
- Los campos nuevos son aditivos y no sustituyen `region`, `gestor` ni `gestores` hasta completar la migración funcional.
- Las relaciones nuevas no deben borrar ni reinterpretar datos históricos.
- No se ejecutan migraciones automáticamente desde el frontend.
