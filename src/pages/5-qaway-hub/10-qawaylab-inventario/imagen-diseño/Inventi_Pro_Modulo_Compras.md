# Inventi Pro --- Especificación funcional del módulo Compras

**Producto:** Inventi Pro\
**Alcance:** Órdenes de compra, recepciones, proveedores e
interconexiones con Productos, Inventario, Movimientos, Finanzas y
Reportes.

## 1. Propósito

El módulo **Compras** administra el abastecimiento desde la orden al
proveedor hasta la recepción de mercancía y el registro de la
documentación comercial vinculada. Centraliza órdenes de compra,
recepciones, diferencias, documentos, proveedores e historial comercial.

Compras es un módulo independiente. Se conecta con los demás módulos sin
duplicar productos, existencias, movimientos ni obligaciones
financieras.

## 2. Estructura

### 2.1 Órdenes de compra

Administra las órdenes emitidas a proveedores, sus productos,
cantidades, precios, condiciones comerciales, almacén de destino y
seguimiento de recepción.

### 2.2 Recepciones

Registra la mercancía recibida en relación con una orden. Permite
recepciones completas o parciales, cantidades recibidas, diferencias,
documentos y confirmación del ingreso al inventario.

### 2.3 Proveedores

Administra datos comerciales y de contacto, condiciones de pago, plazo
habitual de entrega e historial de órdenes, recepciones, documentos,
productos y precios.

## 3. Flujo operativo

**Orden de compra → Recepción de mercancía → Actualización de inventario
→ Registro de factura del proveedor → Cuenta por pagar → Pago**

Cada etapa conserva su propio registro y estado. Una orden no significa
que la mercancía haya sido recibida; una recepción no significa que la
factura esté pagada.

### 3.1 Orden de compra

1.  Seleccionar proveedor.
2.  Agregar productos, presentaciones, unidades, cantidades y precios.
3.  Definir sede y almacén de destino.
4.  Registrar fecha de compra y fecha estimada de recepción, cuando
    corresponda.
5.  Registrar condiciones de pago, moneda, descuentos, impuestos,
    referencias y observaciones.
6.  Guardar y gestionar la orden según su estado.
7.  Mantener la orden disponible para una o varias recepciones.

### 3.2 Recepción

1.  Seleccionar la orden de compra.
2.  Consultar cantidades solicitadas, recibidas y pendientes.
3.  Registrar cantidades recibidas por producto.
4.  Registrar faltantes, sobrantes, daños, productos equivocados o
    rechazados, cuando existan.
5.  Adjuntar guía de remisión y otros documentos disponibles.
6.  Confirmar la recepción.
7.  Generar el movimiento de ingreso y actualizar las existencias del
    almacén con las cantidades aceptadas.

### 3.3 Factura y obligación de pago

1.  Registrar la factura del proveedor asociada a la compra y al
    proveedor.
2.  Vincular la factura con la obligación financiera correspondiente.
3.  Registrar importe, moneda, fecha de emisión, vencimiento, saldo y
    estado de pago.
4.  Registrar los pagos en Finanzas y reflejarlos en la consulta de la
    compra.
5.  Conservar la referencia y el estado de la documentación vinculada.

La recepción física y el pago son eventos distintos.

## 4. Órdenes de compra

### 4.1 Datos de la orden

-   Número único.
-   Proveedor.
-   Fecha de compra y fecha estimada de recepción.
-   Sede y almacén de destino.
-   Usuario responsable.
-   Productos, presentaciones y unidades.
-   Cantidad solicitada.
-   Precio unitario, descuentos, impuestos, subtotal y total.
-   Moneda y condiciones de pago.
-   Referencia, observaciones y documentos adjuntos.
-   Estado de la orden.

### 4.2 Seguimiento por producto

Cada línea muestra cantidad solicitada, cantidad recibida acumulada,
cantidad pendiente, precio acordado, importe y estado de recepción.

### 4.3 Estados

-   **Borrador:** orden en preparación.
-   **Pendiente de aprobación:** requiere autorización según la
    configuración de la empresa.
-   **Aprobada:** autorizada para su gestión.
-   **Enviada al proveedor:** comunicada al proveedor.
-   **Confirmada por el proveedor:** el proveedor confirma la orden o
    sus condiciones.
-   **Recepción parcial:** se recibió una parte.
-   **Recibida completamente:** se completó la recepción de las
    cantidades aceptadas.
-   **Cancelada:** orden anulada, conservando el historial.

Los estados de aprobación y confirmación se aplican según el flujo
operativo habilitado. La recepción parcial conserva lo recibido y lo
pendiente.

### 4.4 Acciones

Ver detalle, editar según estado y permisos, duplicar, guardar borrador,
aprobar o enviar según el flujo, registrar recepción, consultar
recepciones y documentos, descargar o imprimir, cancelar conservando
historial y consultar cambios.

## 5. Recepciones

### 5.1 Datos

Número de recepción, proveedor, orden relacionada, fecha y hora, sede y
almacén, responsable, productos, cantidades
esperadas/recibidas/pendientes, estados por producto, diferencias,
observaciones, documentos y estado de recepción.

### 5.2 Recepciones parciales

Una orden puede tener varias recepciones. Ejemplo: 100 unidades
ordenadas; primera recepción de 60 y segunda de 40. El sistema conserva
cada recepción y actualiza el acumulado recibido y el saldo pendiente.

### 5.3 Diferencias

Registrar faltantes, sobrantes, productos dañados, equivocados,
rechazados o diferencias de presentación/unidad, con motivo y
observaciones. Las cantidades aceptadas se distinguen de las observadas
o rechazadas.

### 5.4 Documentos

-   Guía de remisión del proveedor.
-   Factura del proveedor, cuando esté disponible.
-   Otros documentos de entrega o sustento.
-   Referencias y observaciones.

La guía de remisión sustenta información del traslado; no reemplaza la
factura ni la obligación de pago. Los documentos se vinculan con la
recepción, orden y proveedor según corresponda.

### 5.5 Estados

-   **Borrador:** recepción en preparación.
-   **Confirmada:** recepción validada y registrada.
-   **Anulada:** operación anulada mediante un proceso controlado,
    conservando historial y ajustes correspondientes.

La confirmación genera el ingreso al inventario de las cantidades
aceptadas.

## 6. Proveedores

### 6.1 Ficha

Tipo de proveedor, nombre o razón social, nombre comercial, RUC o
identificación fiscal, contacto, teléfono, correo, dirección, moneda,
condiciones y plazo de pago, plazo habitual de entrega, estado,
observaciones y documentos.

### 6.2 Historial comercial

Consultar órdenes, recepciones, facturas y documentos, compras por
período, productos suministrados, historial de precios, condiciones
comerciales, obligaciones y pagos vinculados mediante Finanzas.

### 6.3 Acciones

Ver y editar ficha; consultar órdenes, recepciones, documentos,
productos, precios históricos y estado del proveedor.

## 7. Documentos y trazabilidad

  -----------------------------------------------------------------------
  Documento               Registro principal      Función
  ----------------------- ----------------------- -----------------------
  Orden de compra         Orden de compra         Detalla productos y
                                                  condiciones
                                                  solicitados.

  Guía de remisión del    Recepción               Sustenta la información
  proveedor                                       del traslado.

  Factura del proveedor   Compra / registro       Sustenta la operación y
                          financiero              alimenta la obligación
                                                  de pago.

  Otros documentos        Orden, recepción o      Conserva documentación
                          proveedor               complementaria.
  -----------------------------------------------------------------------

Los archivos pueden adjuntarse y consultarse desde el registro
relacionado, con vista previa, descarga o impresión cuando corresponda.

## 8. Interconexión con otros módulos

### Productos

Compras utiliza el catálogo central, sus variantes, presentaciones,
códigos y unidades. Registra precios de adquisición por operación y
proveedor, y conserva el historial de precios. No mantiene un catálogo
paralelo.

### Inventario

-   La orden de compra no incrementa el stock disponible.
-   Una recepción en borrador no incrementa el stock.
-   La recepción confirmada ingresa las cantidades aceptadas en el
    almacén seleccionado.
-   Cada ingreso conserva la referencia de origen.

### Movimientos

Cada recepción confirmada genera el movimiento de entrada con
referencias a recepción, orden, proveedor, productos, cantidades, sede,
almacén, usuario y fecha. Compras no mantiene un Kardex independiente.

### Proveedores

La ficha central se reutiliza en órdenes, recepciones y documentos,
evitando duplicar datos.

### Finanzas / Cuentas por pagar

La factura origina o alimenta la obligación financiera. Esta conserva
importe, moneda, emisión, vencimiento y saldo. Los pagos se registran en
Finanzas; Compras muestra el estado de la obligación y sus pagos
relacionados.

### Reportes

Los datos alimentan reportes de compras por período, proveedor y
producto; cantidades compradas y recibidas; órdenes pendientes;
recepciones parciales y diferencias; evolución de precios; e importes
facturados y estado de pago mediante Finanzas.

## 9. Funciones operativas integradas

### Alertas y pendientes

Órdenes pendientes de envío o confirmación, órdenes pendientes de
recepción, recepciones parciales, fechas estimadas vencidas, diferencias
por resolver, documentos pendientes de asociar y obligaciones próximas a
vencer mediante Finanzas.

### Historial y auditoría

Las órdenes, recepciones y fichas conservan creación, modificaciones,
cambios de estado, confirmaciones, recepciones vinculadas,
cancelaciones/anulaciones, usuario y fecha.

### Búsqueda y filtros

Buscar por número de orden o recepción, proveedor, producto o código,
estado, fecha, sede, almacén, estado de recepción y estado documental o
de pago mediante la conexión financiera.

## 10. Devoluciones a proveedores

La devolución se vincula con la compra y recepción de origen. Registra
proveedor, orden, recepción, productos, cantidades, motivo, fecha,
responsable, documentos y estado.

La devolución genera el movimiento de salida o ajuste correspondiente y
se vincula con Finanzas cuando produce nota de crédito, ajuste o saldo a
favor.

## 11. Reglas funcionales

1.  La orden de compra no modifica las existencias disponibles.
2.  Una recepción en borrador no modifica las existencias.
3.  La recepción confirmada ingresa únicamente las cantidades aceptadas.
4.  Una orden puede tener varias recepciones.
5.  Se muestran cantidades solicitadas, recibidas y pendientes.
6.  Las diferencias de recepción quedan registradas explícitamente.
7.  Cada ingreso conserva la referencia a su recepción y orden.
8.  Factura y pago se mantienen separados de la recepción física.
9.  Las obligaciones y pagos se administran mediante Finanzas.
10. Cancelaciones y anulaciones conservan trazabilidad.
11. Productos y proveedores se reutilizan desde sus registros centrales.
12. Los importes, cantidades y estados se consultan desde los registros
    relacionados, sin copias independientes.

## 12. Vistas principales

### Órdenes de compra

-   Listado con búsqueda, filtros e indicadores de pendientes.
-   Formulario de nueva compra.
-   Detalle de orden.
-   Historial de recepciones y documentos.
-   Acciones contextuales.

### Recepciones

-   Listado con filtros por proveedor, orden, fecha, almacén y estado.
-   Formulario de registro de recepción.
-   Detalle de recepción.
-   Registro de cantidades y diferencias.
-   Vista previa de documentos.
-   Historial de movimientos generados.

### Proveedores

-   Listado y formulario de alta.
-   Detalle de proveedor.
-   Historial de compras y recepciones.
-   Documentos y datos comerciales.
-   Historial de precios y productos suministrados.

## 13. Interconexiones: mapa resumido

  -----------------------------------------------------------------------
  Módulo relacionado                  Relación con Compras
  ----------------------------------- -----------------------------------
  **Productos**                       Proporciona catálogo, variantes,
                                      presentaciones y unidades.

  **Inventario**                      Recibe el ingreso de cantidades
                                      aceptadas al confirmar una
                                      recepción.

  **Movimientos**                     Registra la entrada y mantiene la
                                      trazabilidad del movimiento.

  **Proveedores**                     Centraliza los datos e historial
                                      comercial del proveedor.

  **Finanzas / Cuentas por pagar**    Registra facturas, obligaciones,
                                      vencimientos, saldos y pagos.

  **Reportes**                        Consolida compras, recepción,
                                      precios, proveedores y estados
                                      financieros.
  -----------------------------------------------------------------------

## 14. Resultado funcional

Compras administra el abastecimiento y mantiene conectados, sin
duplicación, los siguientes registros:

**Proveedor → Orden de compra → Recepción → Movimiento de inventario →
Factura → Cuenta por pagar → Pago**

Cada registro conserva su identidad, estado, documentos e historial. La
orden controla lo solicitado; la recepción controla lo recibido;
Inventario refleja las existencias; y Finanzas administra las
obligaciones y los pagos.
