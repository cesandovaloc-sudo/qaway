# Q-Inventy (Inventi Pro) --- Especificación funcional del módulo Categorías

**Producto:** Q-Inventy / Inventi Pro
**Alcance:** Administración del árbol de categorías y subcategorías que
clasifican el catálogo maestro de productos. Incluye la pantalla
`/hub/inventario/logistica/categorias`, su panel de diseño y las
interconexiones con Productos, Catálogos, Precios y reportes.
**Estado del documento:** Inventario técnico-funcional basado en el código
(CategoriesPage, CategoriasPanel), la migración baseline de Supabase y los
servicios existentes. Las funcionalidades marcadas como pendientes o
propuestas no deben considerarse implementadas.

---

## 1. Propósito

El módulo **Categorías** administra la taxonomía que organiza el catálogo
de productos de Inventi Pro: categorías raíz, subcategorías (árbol de un
nivel de jerarquía declarado en el esquema) y su presentación visual
(ícono y color).

Categorías es un módulo de **clasificación y navegación**, no de operación:
no administra stock, no registra movimientos, no define precios. Su única
fuente de verdad es la tabla `categories`, consumida por Productos
(`products.category_id` y `products.subcategory_id`) y por los demás
módulos que agrupan productos.

**Estado de implementación importante:** la pantalla actual es un
**panel de diseño funcional en memoria (mock local)**. Las operaciones de
alta, edición, duplicado y eliminación se ejecutan sobre el estado local
del componente (`useState(initialCategories)`) y **no persisten en
Supabase**. El propio componente lo declara: *"Para producción,
sustituye initialCategories por datos de tu API/Supabase"*. La tabla
`categories` sí existe y está poblada en el esquema; lo que falta es la
capa de servicio y el cableado de la pantalla a esa capa.

## 2. Responsabilidades del módulo

### 2.1 Taxonomía del catálogo

Administra por categoría:

* Nombre (único dentro del panel, validado case-insensitive).
* Slug (columna obligatoria en BD; el panel de diseño aún no lo genera).
* Descripción (presente en el panel; no existe como columna en la tabla).
* Categoría padre para conformar subcategorías (`parent_id` en BD).
* Estado operativo: Activa / Inactiva (panel). En BD no existe columna de
  estado; el esquema contempla `sort_order`, `icon` y `created_at`.
* Identidad visual: ícono (12 opciones fijas de lucide-react) y color
  (paleta fija de 7 colores).
* Orden de presentación (`sort_order` en BD, aún sin control en el panel).

### 2.2 Métricas de apoyo

El panel muestra indicadores agregados en memoria: total de categorías,
categorías con productos, sin productos y total de productos clasificados.
Estas cifras derivan de los datos demo, no de consultas a BD.

### 2.3 Lo que el módulo NO hace

* No asigna ni cambia la categoría de un producto (eso es Productos).
* No administra subcategorías como entidades separadas de segundo nivel:
  en el panel la subcategoría es una categoría con `parent` distinto de
  vacío; en BD es la misma tabla con `parent_id`.
* No controla disponibilidad comercial ni visibilidad pública.

## 3. Rutas y pantallas

### 3.1 Ruta principal

* `/hub/inventario/logistica/categorias` → `CategoriesPage`
  (protegida por `RequireAuth` + `RequirePlanFeature feature="products"`).

`CategoriesPage` compone dos piezas:

1. `3-CategoriasPanelLiteral.jsx` --- literalmente importa y renderiza el
   panel completo de **Productos** (versión "Literal" conectada a
   `productService` y `TenantContext`). Se muestra encima de la vista de
   categorías.
2. `3-CategoriasPanel.jsx` --- el panel de Categorías propiamente dicho
   (mock en memoria).

**Nota de auditoría:** este apilado de dos paneles completos uno sobre
otro es una composición atípica que conviene revisar en UI: el usuario ve
el listado de productos (con sus métricas) y debajo el listado de
categorías. No hay filtro cruzado "categoría → sus productos".

### 3.2 Pantalla del panel de Categorías

El panel incluye:

* Cabecera con acción "＋ Nueva categoría".
* 4 métricas: total de categorías, con productos, sin productos y total de
  productos (con notas comparativas de ejemplo "vs. mes anterior").
* Toolbar sticky: búsqueda por nombre/descripción/categoría padre, filtro
  por estado (Todas/Activa/Inactiva), orden (nombre A–Z / Z–A, más
  productos, menos productos) y filtro adicional "Con productos / Sin
  productos".
* Tabla con: selección múltiple (checkbox), categoría (ícono+color+nombre
  clicable), descripción (truncada a 47 caracteres), contador de productos,
  estado (chips: Activa / Inactiva / "Sin productos"), fecha de creación y
  última actualización, y acciones.
* Acciones por fila: Editar, Ver detalle, Duplicar (precarga el formulario
  con los datos de la categoría), Eliminar (bloqueado si tiene productos
  asociados, con toast explicativo).
* Paginación (10/20/50 filas por página, máximo 5 botones de página).
* Modal de creación/edición: nombre (requerido, máx. 80), descripción
  (máx. 200 con contador), estado, ícono (grid de 12), color (paleta de 7)
  y categoría padre (opcional; excluye la propia categoría para evitar
  auto-referencia).
* Panel lateral de detalle con pestañas: Resumen (información general +
  estadísticas de stock + categorías relacionadas), Productos (contador y
  tabla de ejemplo), Precios (placeholders) y Más datos (ID, padre,
  subcategorías, estado).
* Toasts de confirmación y cierre por Escape / click fuera (modal, detalle
  y menús), alineado con el estándar visual de los demás tableros.

## 4. Operaciones de datos

### 4.1 Estado actual (panel de diseño)

* CRUD **en memoria**: `saveCategory` (crear/editar con validación de
  nombre duplicado), `removeCategory` (bloqueo si `products > 0`),
  duplicado como precarga de formulario.
* Sin capa de servicio propia: no existe `categoryService.ts`.
* Las métricas, fechas y estadísticas del detalle son datos demo o valores
  derivados del array local.

### 4.2 Estado objetivo (pendiente de conectar)

La tabla `categories` ya existe en la migración baseline
(`20260813000001_baseline_inventario.sql`) con: `id`, `name`, `slug`,
`parent_id` (auto-referenciada, `on delete set null`), `icon`,
`sort_order`, `created_at`; índices en `parent_id` y `slug`; grants a
`authenticated` y `service_role`. Pendientes documentados del baseline:
RLS versionada y grants anon para catálogos públicos.

Para producción el módulo requiere:

1. `categoryService` (listado, alta, edición, eliminación, árbol).
2. Generación y unicidad de `slug`.
3. Resolución de `tenant_id` (la tabla baseline aún no lo declara; el
   resto del inventario filtra por tenant).
4. Cableado de CategoriesPage al servicio, reemplazando el mock.
5. Definir columnas faltantes usadas por el panel: `description`,
   `color`, `status`, `related` (o descartarlas del diseño).

### 4.3 Productos como consumidor real

Hoy la única relación persistente real es desde Productos:
`products.category_id` y `products.subcategory_id` referencian
`categories(id)` con `on delete set null`, e
`supabaseProductAdapter` filtra por `category_id`. Además,
`productDetailService` resuelve la categoría en el detalle del producto.
Los otros consumidores actuales (filtros de paneles de diseño, captura IA,
dashboard) usan la columna de texto legacy `products.category`.

## 5. Permisos

### 5.1 Permisos aplicables hoy

* La ruta exige sesión (`RequireAuth`) y feature `products`
  (`RequirePlanFeature`).
* No existe un permiso granular específico de categorías
  (p. ej. `can_manage_categories`); el CRUD del panel tampoco consulta
  permisos porque opera en memoria.
* Por herencia del modelo de Productos, las operaciones de escritura
  deberían gobernarse con `can_create_products` / `can_edit_products` /
  `can_delete_products` (o un permiso propio a definir), y la lectura con
  `can_view_products`.

### 5.2 Pendientes de permisos

* Definir si Categorías es un permiso propio o hereda los de Productos.
* Aplicar `RequirePermission` en la ruta o en las acciones de escritura
  cuando el panel se conecte a BD.
* Verificar RLS por tenant en la tabla `categories` (hoy solo grants, RLS
  no versionada).

## 6. Modelo de datos

### 6.1 `categories` (BD real)

| Columna | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid PK | default `gen_random_uuid()` |
| `name` | text not null | |
| `slug` | text not null | índice propio |
| `parent_id` | uuid FK → categories.id | `on delete set null`; índice propio |
| `icon` | text | nombre de ícono |
| `sort_order` | int | default 0 |
| `created_at` | timestamptz | default now() |

No tiene: `description`, `color`, `status`, `tenant_id`, `updated_at`.
Con `parent_id` soporta árbol de subcategorías; el panel actual presenta
una jerarquía plana con referencia por nombre.

### 6.2 Relación con `products`

* `products.category_id` → `categories.id` (`on delete set null`).
* `products.subcategory_id` → `categories.id` (`on delete set null`).
* `products.category` (text) --- columna legacy usada por paneles de
  diseño, tests y captura IA; la app real usa `category_id`.

Eliminar una categoría con productos **no elimina productos**: deja el
campo en `null`. El panel de diseño es más estricto que la BD (bloquea el
borrado si hay productos); esa regla debe decidirse y aplicarse de forma
consistente en servicio y RLS.

## 7. Interconexiones con otros módulos

### 7.1 Categorías y Productos

**Vinculación:** directa y estructural --- la más importante del módulo.

La ficha de producto referencia `category_id` y `subcategory_id`; el
listado de Productos filtra por categoría; el formulario de alta/editar
selecciona categorías activas. Flujo: categoría creada/activada →
disponible en el selector de productos → producto clasificado → filtros y
agrupaciones operan sobre esa referencia.

Reglas: una categoría inactiva "no se mostrará al seleccionar productos"
(según el propio panel), pero el producto ya clasificado la conserva. Al
eliminar una categoría, los productos quedan sin clasificar (null) en BD.

### 7.2 Categorías y Catálogos públicos

**Vinculación:** indirecta a través del producto.

`catalogService` proyecta el producto con su `category` (texto legacy)
hacia los catálogos y la tienda pública (`/remates/:slug`). La categoría
participa de la ficha pública; no hay tablas de categorías públicas ni
configuración de visibilidad por categoría. Pendiente validar que la
proyección pública no exponga datos internos.

### 7.3 Categorías y Dashboard

**Vinculación:** lectura.

`dashboardService.getCategoryData()` distribuye productos por la columna
`products.category` (texto legacy), no por `category_id`. Esto implica que
los gráficos por categoría pueden divergir del árbol real si los productos
están clasificados solo por referencia. Debe unificarse el criterio.

### 7.4 Categorías y Captura IA

**Vinculación:** escritura asistida.

`aiSuggestionService` propone una categoría entre un set fijo (Mobiliario,
Tecnología, Electrónica, Herramientas, Material, Otros) como texto, no como
`category_id`. La propuesta es editable antes de crear el producto. La
captura IA no consulta el árbol real de `categories`.

### 7.5 Categorías y Precios / Reportes

**Vinculación:** agrupación analítica, sin FK.

Los paneles de diseño de Precios, Kits, Liquidaciones, Compras, Ventas y
Pedidos derivan listas de categorías desde `products.category` (texto) para
sus filtros. No existe pricing por categoría ni reglas que usen el árbol.
Cualquier estadística por categoría hereda la limitación del texto legacy.

### 7.6 Categorías y Movimientos / Sedes

**Vinculación:** ninguna directa. Movimientos y Sedes operan sobre
productos y ubicaciones; la categoría viaja implícita dentro de la ficha
del producto cuando los listados la muestran.

## 8. Reglas de integridad operativa

* El nombre de categoría debe ser único dentro de la empresa (validado
  hoy solo en el mock; debe vivir en servicio/BD con constraint o
  validación por tenant).
* El slug debe ser único, estable y generado desde el nombre; alimenta
  rutas y búsquedas futuras.
* La jerarquía se expresa con `parent_id`; debe impedirse el
  auto-referenciado y definirse la profundidad máxima (el panel sugiere 1
  nivel de subcategoría).
* Eliminar una categoría con productos debe bloquearse o decidirse
  explícitamente el comportamiento (hoy: mock bloquea, BD deja null).
* La categoría debe viajar siempre por referencia (`category_id`); el uso
  del texto `products.category` es legacy y debe migrarse o sincronizarse.
* Toda consulta y escritura debe respetar `tenant_id` y RLS cuando se
  implemente la capa de datos.

## 9. Funcionalidades implementadas y limitaciones conocidas

### 9.1 Implementado (UI funcional sobre datos demo)

* Tabla completa con búsqueda, filtros (estado, con/sin productos),
  ordenamiento y paginación.
* CRUD en memoria: crear, editar, duplicar (precarga), eliminar con
  bloqueo si tiene productos.
* Validación de nombre duplicado y campos requeridos.
* Identidad visual: 12 íconos, paleta de 7 colores, herencia al crear.
* Jerarquía por categoría padre en formulario y detalle.
* Panel de detalle con pestañas Resumen / Productos / Precios / Más datos.
* Selección múltiple, métricas agregadas y toasts.
* Cierre por Escape y click fuera (corregido el 2026-09-30, ver
  `Correcciones/2026-09-30-cierre-paneles-escape-click-fuera-inventario.md`).
* Relación persistente real Productos ↔ Categorías vía `category_id` /
  `subcategory_id` y filtro de listado en el adaptador.

### 9.2 Pendientes o riesgos a resolver

* **No hay persistencia:** el CRUD opera en memoria; recargar la página
  descarta los cambios. Es la brecha principal del módulo.
* Falta `categoryService` y el cableado de CategoriesPage a Supabase.
* La tabla `categories` no tiene `tenant_id`, `description`, `color`,
  `status` ni `updated_at`; el diseño del panel asume esas columnas.
* `slug` obligatorio en BD pero no generado por la UI; falta regla de
  unicidad.
* El bloqueo de borrado con productos existe solo en el mock; en BD un
  delete deja `category_id` en null (política por decidir).
* La ruta muestra el panel de Productos encima del de Categorías
  (`3-CategoriasPanelLiteral`); composición a revisar en UI.
* No hay permisos granulares ni `RequirePermission` para la ruta.
* RLS de `categories` no versionada; grants anon para público pendientes.
* Métricas "vs. mes anterior" y estadísticas del detalle son datos demo.
* Divergencia `category` (texto legacy) vs `category_id` en dashboard,
  catálogos y captura IA.
* Selección múltiple de la tabla sin acciones masivas asociadas.

## 10. Criterio de cierre del módulo

El módulo Categorías puede considerarse integrado cuando:

1. El CRUD persiste en `categories` mediante un `categoryService` con
   tenant y RLS verificados.
2. El slug se genera, es único y estable; el nombre es único por empresa.
3. La jerarquía padre/hijo se controla (sin ciclos, profundidad definida).
4. El borrado con productos dependientes se bloquea o se archiva de forma
   consistente entre UI, servicio y BD.
5. La ruta queda protegida por permisos definidos y `RequirePermission`.
6. Productos, dashboard, catálogos y captura IA consumen la misma fuente
   (`category_id`), retirando gradualmente el texto legacy.
7. Las pruebas cubren CRUD, unicidad, jerarquía, borrado con dependencias,
   multiempresa y el filtro de productos por categoría.

## 11. Encaje en el modelo comercial de Qaway

### 11.1 Modelo existente en Supabase

Igual que el resto de la app `inventario` (ver doc de Productos, sección
11): el acceso se resuelve con `user_can_use_app('inventario')`, el nivel
comercial con `tenant_app_plan(tenant_id, 'inventario')` y las operaciones
con `user_app_roles` + permisos granulares. Categorías no es una app ni
tiene suscripción propia.

### 11.2 Recomendación de adaptación

Categorías debe permanecer como **submódulo funcional de la app
`inventario`**, dentro del paquete base del catálogo:

* **Basico:** CRUD de categorías y subcategorías, unicidad de nombre,
  orden de presentación --- la taxonomía es parte del núcleo
  (`products.core`) y no debe bloquearse por plan.
* **Intermedio:** sin diferenciación adicional recomendada; quizá
  importación/exportación masiva de taxonomía si se aprueba.
* **Premium:** reglas avanzadas de taxonomía (profundidad mayor del árbol,
  categorías públicas configurables para catálogos, analytics por
  categoría) solo si producto lo aprueba.

Esta división es **una propuesta comercial, no una capacidad
implementada**. Hoy la ruta responde al gate `products`, alineado con la
matriz de features (`products.core` en todos los niveles). No deben
crearse tablas, suscripciones ni apps separadas para Categorías.

### 11.3 Separación correcta de controles

Mantener separadas las tres decisiones (doc de Productos, 11.3):

1. La empresa contrató Inventario → `user_can_use_app('inventario')`.
2. La empresa tiene un nivel comercial → `tenant_app_plan`.
3. El usuario puede operar → `user_app_roles` + permisos granulares
   (hoy heredados de Productos; si se define `can_manage_categories`,
   vivirá aquí).

### 11.4 Optimización de recursos y duplicidades a evitar

* Mantener una sola tabla maestra (`categories`) con jerarquía por
  `parent_id`; no crear `subcategories` como tabla aparte.
* No duplicar el selector de categorías por módulo: un solo servicio
  consumido por Productos, Precios, Kits, etc.
* No copiar el listado de Categorías por plan; reutilizar el gate
  `products` ya existente.
* No usar la columna legacy `products.category` como fuente nueva;
  migrar lecturas hacia `category_id`.
* Cargar el árbol de categorías una vez por sesión/tenant y derivar
  selectores y filtros en memoria.

### 11.5 Orden de implementación recomendado

1. Extender la migración de `categories` (`tenant_id`, `description`,
   `color`, `status`, `updated_at`) o recortar el diseño del panel a las
   columnas reales.
2. Crear `categoryService` + adaptador Supabase con generación de slug,
   unicidad por tenant y árbol.
3. Cablear CategoriesPage al servicio (reemplazar mock) manteniendo el
   diseño actual.
4. Definir y aplicar permisos (heredados de Productos o propios) con
   `RequirePermission` en escritura.
5. Versionar RLS de `categories` y decidir política de borrado con
   dependencias.
6. Migrar dashboard, catálogos y captura IA de texto legacy a
   `category_id`.
7. Medir uso antes de offrir features premium sobre taxonomía.

---
*Documento generado por auditoría de código (CategoriesPage.tsx,
3-CategoriasPanel.jsx, 3-CategoriasPanelLiteral.jsx, AppRouter.tsx,
supabaseProductAdapter.ts, productDetailService.ts, dashboardService.ts,
aiSuggestionService.ts, migración 20260813000001_baseline_inventario.sql).
Fecha: 2026-09-30.*
