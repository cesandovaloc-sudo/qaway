# Inventi Pro --- Especificacion funcional del modulo Productos

**Producto:** Inventi Pro  
**Alcance:** Catalogo maestro de productos, existencias base, variantes,
imagenes, precios e interconexiones con los demas modulos de Inventi Pro.  
**Estado del documento:** Inventario tecnico-funcional basado en el codigo y
las migraciones existentes. Las funcionalidades marcadas como pendientes o
propuestas no deben considerarse implementadas.

## 1. Proposito

El modulo **Productos** administra la ficha maestra de los articulos y
servicios que utiliza Inventi Pro. Es la fuente comun para identificar un
producto por nombre, SKU, slug y otros atributos; consultar su existencia;
asociarlo con categorias, ubicaciones, listas de precios, paquetes,
catalogos, campañas y operaciones comerciales.

Productos no debe duplicar la logica de ventas, compras o movimientos. Esos
modulos consumen la referencia del producto y registran sus propios eventos,
documentos y estados.

## 2. Responsabilidades del modulo

### 2.1 Catalogo maestro

Administra los datos comunes del producto:

* Nombre, slug, SKU y descripcion.
* Categoria y subcategoria.
* Marca, unidad de medida y tipo de producto.
* Estado operativo: activo, inactivo o archivado.
* Estado comercial: disponible, reservado, vendido u otros estados
  permitidos por el esquema.
* Condicion del producto, en una escala de 1 a 10.
* Codigo de barras, imagenes y notas cuando esten disponibles en el panel.

### 2.2 Existencias de referencia

Mantiene el stock base y el stock minimo del producto, junto con su
ubicacion principal. Los movimientos, ventas, recepciones, ajustes y
transferencias deben ser los eventos que explican los cambios de existencia.

El campo `products.stock` es la existencia agregada utilizada por varias
consultas actuales. El soporte detallado por almacen o sede debe mantenerse
alineado con `inventory_locations` y con los movimientos correspondientes.

### 2.3 Variantes

Un producto puede tener variantes con nombre, SKU, atributos JSON, stock,
costo, precio y condicion propios. Las variantes se relacionan con el
producto mediante `product_variants.product_id`.

### 2.4 Imagenes

Permite almacenar varias imagenes por producto, definir una imagen principal,
ordenarlas y conservar texto alternativo. Las imagenes se almacenan en
`product_images` y se eliminan en cascada al eliminar el producto.

### 2.5 Precios

El precio base vive en `products.base_price`. Los precios por lista, cantidad
minima y canal se administran en `product_prices`, relacionados con
`price_lists`. La configuracion y las reglas de listas pertenecen al modulo
Precios, no al catalogo maestro.

## 3. Rutas y pantallas

### 3.1 Listado de productos

Rutas principales:

* `/hub/inventario/productos`
* `/hub/inventario/logistica`
* `/hub/inventario/inventario`

Las rutas anteriores resuelven al listado principal de Productos. Tambien
existen alias equivalentes sin el prefijo `/hub`, segun el montaje del
router.

El listado soporta, de acuerdo con `2-ProductosPanel.jsx` y el servicio de
productos:

* Busqueda por nombre, SKU y descripcion.
* Filtros por categoria, estado, estado comercial, ubicacion, marca y rango
  de precio.
* Filtros visuales por stock: todos, con stock, stock bajo y sin stock.
* Ordenamiento por fecha, nombre, SKU, precio base, stock y actualizacion.
* Paginacion.
* Vista de tarjetas y vista de lista.
* Seleccion individual y acciones masivas.
* Indicadores de total, stock disponible, stock bajo, sin stock y valor de
  inventario.
* Exportacion CSV de los productos seleccionados.
* Importacion masiva desde Excel/CSV mediante `productService.createProducts`.
* Alta, edicion, duplicacion, archivado/eliminacion y cambios masivos de
  estado, segun el flujo activo del panel y los permisos disponibles.

### 3.2 Detalle de producto

Rutas:

* `/hub/inventario/productos/:id`
* `/hub/inventario/logistica/:id`
* `/hub/inventario/inventario/:id`
* `/:id` como ruta de detalle dentro del layout protegido.

El detalle consulta el producto y sus relaciones mediante
`productDetailService.getProductById`. Presenta:

* Galeria de imagenes.
* Informacion general.
* Variantes y stock por variante.
* Paquetes que contienen el producto.
* Liquidaciones o campañas que contienen el producto.
* Precios por lista.
* Ultimos movimientos de inventario, hasta diez registros.
* Categoria y ubicacion relacionada cuando existen.

Las pestañas implementadas son **Informacion**, **Precios** e **Historial**.

### 3.3 Nuevo producto

Rutas:

* `/hub/inventario/productos/nuevo`
* `/hub/inventario/logistica/nuevo`
* `/hub/inventario/inventario/nuevo`
* `/hub/inventario/nuevo`

La pantalla `NewProductPage` utiliza `ProductDraftForm`. El formulario
permite registrar nombre, categoria, descripcion, marca, material, color,
condicion, cantidad, precio, costo y notas. La creacion guarda el producto
con estado activo, estado comercial disponible, unidad `unit` y tipo
`simple`.

El servicio genera automaticamente un SKU cuando no se proporciona y genera
un slug a partir del nombre. La insercion asigna el `tenant_id` del contexto
activo y evita registrar productos sin una empresa seleccionada.

### 3.4 Captura asistida por IA

La captura se expone en `/hub/inventario/captura`. Puede analizar una imagen,
proponer datos y pasar el resultado a un formulario de confirmacion. La
confirmacion es editable antes de crear el producto.

La captura requiere `can_capture_products`. No sustituye la validacion del
usuario ni la creacion normal del catalogo.

## 4. Operaciones de datos

### 4.1 Servicios

* `productService`: listado, consulta por ID o SKU, alta individual, alta
  masiva, actualizacion, eliminacion, busqueda y estadisticas.
* `supabaseProductAdapter`: persistencia en Supabase, paginacion, filtros,
  ordenamiento y resolucion del tenant activo.
* `productDetailService`: detalle con relaciones, imagenes, variantes,
  precios, movimientos, paquetes y campañas.
* `productPriceService`: consulta, alta, actualizacion y eliminacion de
  precios asociados a listas.
* `useProducts`: estado y operaciones del listado.
* `useProduct`: carga y operaciones del detalle, imagenes y producto.

### 4.2 Identidad y multiempresa

El adaptador resuelve la empresa desde el usuario autenticado o desde el
tenant seleccionado por un administrador de plataforma. El listado filtra
por `tenant_id`; la creacion asigna el tenant activo; la actualizacion y la
eliminacion verifican que el producto pertenezca al tenant seleccionado.

Un administrador de plataforma debe seleccionar una empresa antes de
consultar o modificar productos. Esto evita mezclar catalogos de empresas
distintas.

### 4.3 Alta masiva

La importacion masiva:

1. Recibe una lista de productos.
2. Genera SKU faltantes.
3. Genera slug faltantes y agrega un sufijo para filas repetidas.
4. Asigna el tenant activo.
5. Inserta el lote en `products`.

La validacion de duplicados, errores por fila, rollback parcial y reporte de
filas rechazadas deben considerarse antes de usar esta operacion como flujo
contable o de carga critica.

## 5. Permisos

### 5.1 Permisos directos

* `can_view_products`: consultar el catalogo y el detalle.
* `can_create_products`: crear productos individuales o lotes.
* `can_edit_products`: modificar la ficha y los datos comerciales permitidos.
* `can_delete_products`: eliminar o archivar segun la politica operativa.
* `can_view_inventory`: consultar existencias y datos de inventario.
* `can_adjust_stock`: realizar ajustes de stock.
* `can_view_movements`: consultar el historial de movimientos.
* `can_capture_products`: utilizar la captura asistida por IA.
* `can_manage_locations`: administrar sedes, almacenes y ubicaciones
  relacionadas.

### 5.2 Permisos relacionados

* `can_view_prices` y `can_edit_prices` para consultar o modificar precios.
* `can_create_price_lists` y `can_apply_pricing_rules` para administrar
  listas y reglas.
* `can_view_packages`, `can_create_packages` y `can_edit_packages` para
  paquetes.
* `can_manage_catalogs` para publicar productos en catalogos.
* `can_view_campaigns`, `can_create_campaigns` y `can_edit_campaigns` para
  liquidaciones.
* Permisos de ventas, compras y clientes para operar los documentos que
  consumen productos.

### 5.3 Roles predeterminados

* **Administrador:** acceso completo.
* **Editor:** puede consultar, crear, editar, ajustar stock y administrar
  relaciones comerciales; no puede eliminar por defecto.
* **Viewer:** puede consultar productos, precios, inventario y movimientos;
  no puede crear, editar, eliminar ni ajustar stock.
* **Guest:** puede consultar productos y precios visibles, pero no acceder al
  inventario interno, movimientos ni operaciones de escritura.

La ruta de creacion esta protegida explicitamente por
`RequirePermission(can_create_products)`. La visibilidad de las rutas de
consulta debe mantenerse alineada con `can_view_products` y
`can_view_inventory`; en el router actual varias rutas de lectura dependen de
la autenticacion y de las politicas RLS, por lo que debe verificarse la
proteccion efectiva antes de declarar el control de permisos como completo.

## 6. Modelo de datos

### 6.1 `products`

Tabla principal del modulo. Incluye, entre otros:

* `id`, `tenant_id`, `sku`, `name`, `slug` y `description`.
* `category_id`, `subcategory_id`, `category` y `brand`.
* `type`, `status`, `condition` y `unit`.
* `min_stock`, `stock` y `location_id`.
* `cost`, `base_price`, `commercial_status` y `notes`.
* `created_at` y `updated_at`.

Tipos aceptados: `simple`, `variant` y `composite`. Estados operativos:
`active`, `inactive` y `archived`. La condicion debe estar entre 1 y 10.

### 6.2 Tablas relacionadas

* `categories`: clasificacion del producto.
* `inventory_locations`: ubicacion principal o almacen relacionado.
* `product_variants`: presentaciones o variantes.
* `product_images`: galeria e imagen principal.
* `product_prices`: precios por lista y cantidad minima.
* `price_lists`: definicion de listas de precios.
* `inventory_movements`: entradas, salidas, ajustes y transferencias.
* `bundle_items` y `bundles`: composicion de paquetes.
* `catalog_items` y `catalogs`: inclusion en catalogos comerciales.
* `liquidation_items` y `liquidation_campaigns`: campañas y precios de
  liquidacion.
* `users`: usuario responsable de movimientos y contexto de tenant.

Las relaciones con producto usan normalmente `product_id`. La eliminacion
en cascada esta definida para imagenes, variantes y precios; las operaciones
comerciales que usan productos deben conservar sus politicas de historial y
referencias antes de permitir eliminaciones fisicas.

## 7. Interconexiones con otros modulos

### 7.1 Productos e Inventario

**Vinculacion:** directa y estructural.

Productos define la ficha, el stock base, el minimo y la ubicacion. El
submodulo Inventario consulta esos datos y registra los cambios mediante
`inventory_movements`.

**Flujo:** producto creado o actualizado → existencia inicial o ajuste →
movimiento registrado → stock visible actualizado.

El ajuste de stock no debe resolverse editando silenciosamente `products.stock`
sin dejar movimiento, referencia, notas y usuario responsable.

### 7.2 Productos, Sedes y Almacenes

**Vinculacion:** `products.location_id` apunta a
`inventory_locations`. Sedes y almacenes determinan donde se guarda y
opera el stock.

La configuracion de Sedes debe definir si se permite vender, comprar,
transferir y manejar stock por almacen. Productos consume esa configuracion;
no la reemplaza.

### 7.3 Productos y Movimientos

**Vinculacion:** `inventory_movements.product_id` y opcionalmente
`variant_id`.

El historial del detalle muestra los diez movimientos mas recientes. Los
tipos previstos por el esquema incluyen entradas, salidas, ajustes,
transferencias, ventas y compras, segun la migracion vigente.

Movimientos es el registro auditable del cambio de existencia; Productos es
el maestro consultado por ese registro.

### 7.4 Productos y Ventas / Punto de Venta

**Vinculacion:** las lineas de venta guardan `product_id`, cantidad y precio
unitario. El POS selecciona productos del catalogo y utiliza sus precios y
stock para construir una venta.

Al confirmar una venta, el flujo de Ventas debe:

1. Validar que el producto exista y pueda venderse.
2. Registrar la linea con el producto y precio aplicado.
3. Descontar stock mediante el evento de venta.
4. Crear el movimiento correspondiente.

El producto no debe guardar una copia independiente de la venta. Las ventas
pueden cambiar el estado comercial o la existencia mediante sus propios
servicios y triggers.

### 7.5 Productos y Pedidos / Pedidos web

**Vinculacion:** los items del pedido referencian `product_id`, titulo, precio
y cantidad. El pedido puede originarse en el catalogo publico, carrito,
checkout o pedidos administrativos.

El pedido consulta el producto publicado, pero debe conservar en su propia
linea el precio y descripcion aplicados al momento de la compra. La
confirmacion o preparacion del pedido debe coordinar con Ventas e Inventario
para evitar descontar stock dos veces.

### 7.6 Productos y Compras

**Vinculacion:** las lineas de orden de compra referencian `product_id`,
cantidad y precio de compra.

El flujo es:

1. Compras selecciona productos existentes.
2. La orden conserva cantidades y costos acordados.
3. La recepcion confirma cantidades aceptadas.
4. Inventario registra el ingreso.
5. Productos refleja la existencia resultante.

Crear una orden no debe aumentar stock; la recepcion confirmada es el evento
que debe producir el ingreso.

### 7.7 Productos y Precios

**Vinculacion:** `product_prices.product_id` con `price_lists.id` mediante
`price_list_id`.

Productos muestra el precio base y las listas vinculadas. Precios administra
listas, reglas, canales, clientes, promociones e historial. El mismo
producto puede tener varios precios por lista y cantidad minima.

Los cambios de precio no deben modificar el costo ni registrar una venta con
el precio nuevo retroactivamente. Las lineas de documentos comerciales deben
conservar el precio aplicado.

### 7.8 Productos y Paquetes / Kits

**Vinculacion:** `bundle_items.product_id` relaciona componentes con un
`bundle_id`.

Un paquete puede consultar nombre, SKU, precio y stock de sus componentes.
Al vender o preparar un paquete, el modulo de Paquetes debe calcular los
componentes comprometidos y coordinar los movimientos de stock. Productos
solo mantiene la ficha de cada componente y permite consultar los paquetes
relacionados.

### 7.9 Productos y Catalogos

**Vinculacion:** `catalog_items.product_id` publica productos en catalogos.

Catalogos consume una proyeccion publica de los productos y evita exponer
campos internos como costo o stock sensible. Un producto puede estar en uno o
varios catalogos, con su disponibilidad comercial controlada por el catalogo
y el estado del producto.

### 7.10 Productos y Liquidaciones / Promociones

**Vinculacion:** `liquidation_items.product_id` conecta el producto con una
campaña y un precio de liquidacion.

La campaña controla vigencia, precio promocional y reglas de la oferta. El
detalle del producto solo muestra las campañas relacionadas. La aplicacion de
la liquidacion y el registro de ventas deben pertenecer a los modulos de
Promociones, Ventas e Inventario.

### 7.11 Productos y Captura IA

**Vinculacion:** la captura genera una propuesta de ficha que termina en
`productService.createProduct` despues de la confirmacion del usuario.

Las sugerencias de nombre, categoria, condicion, cantidad, costo y precio son
asistidas; no constituyen datos maestros hasta ser confirmadas.

## 8. Reglas de integridad operativa

* El SKU debe identificar una presentacion comercial y no debe duplicarse sin
  una regla explicita de variantes.
* El slug debe ser estable para enlaces publicos; cambiarlo requiere revisar
  catalogos, pedidos y enlaces emitidos.
* Un producto inactivo o archivado no deberia aparecer como disponible para
  nuevas ventas, aunque debe conservarse en documentos historicos.
* Las ventas, compras y pedidos deben guardar sus cantidades y precios
  propios, ademas del `product_id`.
* Los cambios de stock deben tener movimiento, tipo, cantidad, usuario y
  referencia cuando proceda.
* La eliminacion fisica debe bloquearse o sustituirse por archivado cuando el
  producto tenga ventas, compras, pedidos, movimientos, paquetes o catalogos
  historicos.
* Todas las consultas y escrituras deben respetar `tenant_id` y las politicas
  RLS de Supabase.

## 9. Funcionalidades implementadas y limitaciones conocidas

### 9.1 Implementado

* CRUD base de productos mediante adaptador Supabase.
* Generacion de SKU y slug en altas.
* Alta masiva.
* Busqueda, filtros, ordenamiento y paginacion.
* Detalle con relaciones de imagenes, variantes, precios, movimientos,
  paquetes y liquidaciones.
* Gestion de imagen principal.
* Consulta y mantenimiento de precios por lista a nivel de servicio.
* Resolucion multi-tenant para operaciones principales.
* Integracion de productos en ventas, pedidos, compras, carrito y catalogos.

### 9.2 Pendientes o riesgos a resolver

* El boton de edicion del detalle aun utiliza una accion de demostracion y no
  abre un formulario persistente.
* El ajuste de stock debe verificarse para que siempre genere un movimiento
  auditable y no solo actualice el campo agregado.
* La ruta de detalle permite eliminar mediante confirmacion, pero la politica
  de archivado y la proteccion por `can_delete_products` deben comprobarse en
  UI, router y RLS.
* La importacion masiva requiere validacion por fila y reporte de errores para
  cargas productivas.
* Debe definirse si el stock se controla globalmente o por almacen; el panel
  visual muestra almacenes de ejemplo mientras el modelo persistente usa
  `location_id` y `inventory_movements`.
* Debe evitarse que pedidos, ventas o recepciones descuenten o ingresen stock
  dos veces cuando comparten triggers y servicios.
* Debe validarse la proteccion efectiva de lectura para `can_view_products`,
  `can_view_inventory` y `can_view_movements`.

## 10. Criterio de cierre del modulo

El modulo Productos puede considerarse integrado cuando:

1. Cada alta, modificacion y archivado respeta permisos y tenant.
2. Cada venta, pedido, recepcion, ajuste, transferencia o baja deja un
   movimiento consistente.
3. Las lineas historicas conservan nombre, SKU, cantidad y precio aplicados.
4. Los catalogos publicos no exponen costo ni datos internos.
5. Paquetes, listas de precios, campañas y ubicaciones consultan el mismo
   producto sin duplicar su ficha.
6. La eliminacion se bloquea cuando existen dependencias historicas o se
   reemplaza por archivado.
7. Las pruebas cubren altas, importacion, permisos, multiempresa, stock,
   precios y las interconexiones con Ventas, Pedidos y Compras.
