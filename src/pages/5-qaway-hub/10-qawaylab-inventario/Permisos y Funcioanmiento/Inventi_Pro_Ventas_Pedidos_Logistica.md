# Inventi Pro — Definición funcional de Ventas, Pedidos y Logística

**Estado:** definición funcional de trabajo  
**Alcance:** paneles comerciales y operativos conectados  
**Nombre acordado del módulo de pedidos:** **Pedidos**  
**Nombre propuesto para el tercer módulo:** **Logística**

> Este documento consolida lo definido en la conversación y distingue las prácticas documentadas en los referentes de las decisiones propuestas para Inventi Pro. Los flujos son una especificación funcional inicial, no una confirmación de que ya estén implementados en el código.

\---

## 1\. Arquitectura general

Inventi Pro tendrá tres paneles independientes, conectados entre sí:

1. **Ventas:** registra la operación comercial y concentra las ventas de todos los canales.
2. **Pedidos:** administra los pedidos que requieren seguimiento, preparación o cumplimiento posterior, sin importar el canal de origen.
3. **Logística:** organiza la preparación, despacho, transporte, entrega y seguimiento de los pedidos.

El **Inventario** es una capacidad transversal: proporciona disponibilidad, reservas y movimientos de stock a los tres paneles. **Clientes**, **Productos**, **Almacenes**, **Pagos** y **Comprobantes** también se relacionan con estos procesos.

### Principio de conexión

* Una venta puede existir sin pedido cuando la operación se completa en el momento, por ejemplo, una compra presencial con entrega inmediata.
* Una venta puede estar vinculada a un pedido cuando se necesita preparar, despachar, entregar o programar un recojo.
* Un pedido no debe generar una segunda venta por el hecho de pasar a logística.
* Logística no vuelve a registrar la venta: gestiona su cumplimiento.
* Un pedido puede originarse en la tienda online, WhatsApp, redes sociales, teléfono o una venta presencial con entrega posterior.

\---

# 2\. Panel de Ventas

## Propósito

Registrar y consultar las operaciones comerciales, independientemente de dónde se originaron y de cómo se pagaron o entregaron.

## Orígenes de venta

El campo **Canal de origen** permitirá clasificar las operaciones, por ejemplo:

* Tienda física
* Tienda online
* WhatsApp
* Instagram
* Facebook
* TikTok
* Teléfono
* Otro canal

El canal es un dato de la operación y un filtro de consulta; no requiere un módulo separado por cada canal.

## Funciones principales

* Registrar una venta directa.
* Registrar una venta procedente de un pedido.
* Asociar cliente, productos, cantidades, precios, descuentos e impuestos.
* Registrar el estado y los movimientos de pago.
* Gestionar comprobantes según la configuración del negocio.
* Consultar el estado comercial y el vínculo con el pedido.
* Acceder al pedido relacionado y a su seguimiento logístico, cuando corresponda.

## Modalidad de cumplimiento

Al registrar una venta, el sistema debe permitir indicar cómo se atenderá:

* **Entrega inmediata / retiro en el local:** normalmente no requiere un pedido logístico posterior.
* **Entrega posterior en dirección del cliente:** genera o vincula un pedido.
* **Recojo programado:** genera o vincula un pedido con fecha de retiro.
* **Envío por transportista o motorizado:** genera o vincula un pedido que se gestionará en Logística.

## Estados comerciales sugeridos

Estos estados describen la operación comercial y no deben confundirse con el estado de pago ni con el de entrega:

* Borrador
* Registrada
* Anulada
* Devuelta / con devolución (cuando aplique)

El estado exacto y las reglas de emisión de comprobantes deben alinearse con la integración contable y tributaria que use el producto.

## Estados de pago separados

* Pendiente
* En verificación
* Pagado
* Pago rechazado / fallido
* Parcialmente pagado (si se admiten pagos parciales)
* Reembolsado / parcialmente reembolsado

**Regla:** un voucher adjunto no equivale a un pago confirmado. En pagos manuales, una persona autorizada debe verificar el ingreso y registrar la confirmación. En pagos integrados, el sistema debe basarse en la confirmación fiable del proveedor de pagos, no solo en que el cliente haya iniciado el proceso.

\---

# 3\. Panel de Pedidos

## Propósito

Centralizar los pedidos de todos los canales y las ventas que requieren preparación, entrega posterior o recojo programado.

## Canales de origen

El pedido debe conservar el canal de origen:

* Tienda online
* WhatsApp
* Instagram
* Facebook
* TikTok
* Tienda física
* Teléfono
* Otro

## Datos principales del pedido

* Código único del pedido
* Cliente y datos de contacto
* Canal de origen
* Venta asociada, si ya se generó
* Productos, cantidades y precios acordados
* Almacén de preparación
* Estado del pago
* Estado del pedido
* Modalidad y dirección de entrega o punto de recojo
* Fecha prometida y franja horaria, si corresponde
* Observaciones e instrucciones
* Historial de cambios y responsables

## Estados propuestos del pedido

Flujo principal:

**Recibido → Confirmado → En preparación → Listo para despacho/recojo → En tránsito (si hay envío) → Entregado / Retirado → Completado**

Estados alternativos o de excepción:

* Pendiente de pago
* Pago en verificación
* En espera / retenido
* Cancelado
* Entrega fallida
* Reprogramado
* Devuelto

No todos los pedidos deben recorrer todos los estados. Por ejemplo, un pedido de recojo no necesita «En tránsito». Un pedido con pago directo confirmado puede pasar de confirmado a preparación; uno con voucher puede permanecer en verificación.

### Separación de estados

El estado del pedido, el pago y la entrega deben ser campos independientes. Ejemplo:

* Pedido: En preparación
* Pago: Pagado
* Entrega: Pendiente de despacho

Así se evita que una única etiqueta intente representar situaciones distintas.

## Crear pedidos desde distintos puntos

* **Tienda online:** el pedido se crea desde el checkout.
* **WhatsApp o redes:** el operador registra el pedido y selecciona el canal.
* **Venta presencial con entrega posterior:** desde Ventas se genera o vincula un pedido.
* **Venta presencial de entrega inmediata:** puede registrarse directamente en Ventas, sin crear un pedido logístico.

\---

# 4\. Política de stock y reservas

## Qué se toma de los referentes

### ERPNext

La documentación de ERPNext contempla reservar stock contra un pedido de venta o una lista de preparación. La reserva se registra por artículo, almacén y cantidad; puede liberarse mediante una acción de desreserva. La documentación también indica que reservar stock no equivale a generar un movimiento de inventario.

Referencia: https://docs.frappe.io/erpnext/stock-reservation

### InvenTree

InvenTree permite asignar unidades de stock a pedidos y a envíos. Un pedido puede tener uno o varios envíos, y el sistema permite asignar stock manualmente o mediante asignación automática. Las asignaciones de un envío completado quedan protegidas; el envío se completa cuando se confirma la salida.

Referencia: https://docs.inventree.org/en/stable/sales/sales\_order/

### ERPNext: compromiso del pedido

ERPNext describe el pedido de venta como el compromiso comercial que habilita procesos posteriores —preparación, entrega, facturación, compra o cobro—. La reserva puede activarse en los artículos del pedido cuando está configurada.

Referencia: https://docs.frappe.io/erpnext/sales-order

## Política propuesta para Inventi Pro

### A. Carrito sin confirmar

* Consultar y mostrar la disponibilidad actual.
* No mantener una reserva indefinida solo porque el producto esté en el carrito.
* Volver a validar la disponibilidad al confirmar el pedido.

### B. Pedido confirmado con pago online en proceso

* Validar el stock de forma atómica al confirmar el pedido.
* Si hay disponibilidad, crear una **reserva temporal** vinculada al pedido y al almacén.
* Mantenerla durante un plazo configurable para completar el pago.
* Si el pago se confirma, mantener la reserva hasta la preparación/despacho.
* Si el pago falla, se cancela o vence el plazo, liberar la reserva automáticamente, salvo que exista una incidencia que requiera revisión.
* Evitar que dos compras simultáneas reserven las mismas unidades.

**El plazo exacto de reserva queda por definir.** Debe configurarse según el medio de pago y el comportamiento real del checkout; no se fija aquí una cantidad de minutos u horas sin validar el flujo de pago.

### C. Pedido con voucher o pago manual

* Validar disponibilidad al registrar el pedido.
* Reservar unidades durante un plazo de verificación configurable, si el negocio desea garantizar stock mientras revisa el comprobante.
* Mantener el pedido como **Pago en verificación** hasta que se confirme el ingreso.
* Si no se confirma dentro del plazo, permitir liberar la reserva y cancelar o poner en espera el pedido, siguiendo una regla visible para el operador.
* La carga del voucher no confirma automáticamente el pago.

### D. Pedido confirmado y pagado

* Mantener la reserva de stock hasta que se prepare y despache el producto.
* Al completar la salida física, registrar el movimiento de inventario correspondiente.
* No descontar el stock dos veces: la reserva reduce la disponibilidad para nuevas ventas, pero el movimiento físico debe registrarse una sola vez al momento definido por la política de inventario.

### E. Pedido sin stock suficiente

* No confirmar una cantidad que supere la disponibilidad vendible, salvo que el negocio habilite expresamente ventas bajo pedido o reposición futura.
* Informar qué producto o cantidad no está disponible.
* Permitir modificar cantidades, seleccionar otro almacén o dejar el pedido en espera de reposición, si esa opción está habilitada.

### F. Cancelación, vencimiento y devolución

* Cancelar o vencer un pedido debe liberar las reservas aún no consumidas.
* Una devolución posterior a la entrega no debe incrementar el stock automáticamente sin registrar recepción y revisión del producto.
* Mantener un historial auditable de reserva, liberación, despacho, cancelación y devolución.

### Definiciones técnicas necesarias

* Separar **stock físico**, **stock reservado** y **stock disponible para vender**.
* Fórmula de referencia: `disponible = stock físico vendible − reservas activas` (considerando también bloqueos, cuarentena u otras restricciones si el sistema las incorpora).
* Ejecutar la validación y reserva de forma transaccional para evitar sobreventa por concurrencia.
* Registrar quién o qué proceso creó, confirmó, liberó o consumió la reserva.
* Definir la regla de prioridad cuando varios pedidos compiten por las últimas unidades.

\---

# 5\. Panel de Logística

## Nombre

**Logística** es el nombre propuesto para el módulo independiente. Dentro del módulo, las áreas principales pueden llamarse **Preparación**, **Despachos**, **Entregas** y **Transportistas**.

El módulo estará separado de Pedidos, pero conectado a cada pedido y a su venta asociada.

## Propósito

Planificar y controlar la preparación, despacho, transporte, entrega y resolución de incidencias, desde que el pedido está habilitado para prepararse hasta que se confirma su entrega o recojo.

## Áreas funcionales

### 5.1 Preparación

* Cola de pedidos listos para preparar.
* Almacén y ubicación de origen.
* Lista de productos y cantidades por recoger.
* Confirmación de picking y verificación.
* Empaquetado y marcado como listo.
* Registro de faltantes o diferencias.
* Responsable y marcas de tiempo.

### 5.2 Despachos

* Crear un despacho asociado a uno o varios pedidos, según las reglas operativas.
* Asignar almacén de salida.
* Registrar fecha y hora de salida.
* Generar referencia o número de despacho.
* Registrar productos y cantidades despachadas.
* Permitir entregas parciales cuando corresponda.
* Registrar guía o documento de transporte si aplica.

### 5.3 Entregas

* Dirección y datos de contacto del destinatario.
* Fecha prometida y franja horaria.
* Fecha programada y fecha efectiva.
* Modalidad: motorizado propio, transportista externo, recojo en tienda u otra.
* Responsable asignado.
* Estado de la entrega.
* Evidencia o confirmación de entrega, según la política del negocio.
* Incidencias, reprogramaciones y motivo de entrega fallida.

### 5.4 Transportistas y motorizados

Registro de proveedores y responsables de reparto:

* Nombre o razón social
* Tipo: proveedor externo, motorizado propio u otro
* Contacto y teléfono
* Zonas de cobertura
* Tarifas o condiciones, si se gestionan
* Estado activo/inactivo
* Pedidos o despachos asignados
* Datos de seguimiento o referencia externa, si existe integración

La existencia de una ficha de transportista no implica que haya seguimiento GPS. La ubicación en tiempo real requeriría una integración específica.

### 5.5 Seguimiento e incidencias

* Cola de entregas pendientes, programadas y en tránsito.
* Consulta por código de pedido, cliente, teléfono o referencia de envío.
* Historial de estados con fecha, hora y responsable.
* Entrega fallida, cliente ausente, dirección incorrecta, daño o retraso.
* Reprogramación y nueva fecha comprometida.
* Confirmación de entrega o recojo.

## Estados logísticos propuestos

### Preparación

* Pendiente de preparación
* En picking
* En verificación / empaquetado
* Listo para despacho
* En espera por incidencia

### Despacho y transporte

* Pendiente de asignación
* Asignado a transportista
* Despachado / En tránsito
* En intento de entrega
* Entrega fallida
* Reprogramado

### Resultado

* Entregado
* Retirado en tienda
* Devuelto al origen
* Cancelado antes del despacho

Los estados se deben adaptar al tipo de entrega. Un recojo en tienda no necesita transportista ni estado «En tránsito».

## Entregas parciales

El modelo debe permitir que un pedido se entregue en más de un despacho, cuando sea necesario. Cada despacho tendrá sus productos, cantidades, transportista y estado. El pedido solo se considerará completamente atendido cuando se hayan cumplido todas sus cantidades o se haya resuelto formalmente el saldo pendiente.

Esta posibilidad está alineada con el modelo de InvenTree, que admite varios envíos asociados a un pedido de venta.

\---

# 6\. WhatsApp y comunicación con el cliente

## Alcance funcional propuesto

### Notificaciones

El sistema podría enviar mensajes cuando ocurran eventos relevantes:

* Pedido recibido
* Pago confirmado
* Pedido en preparación
* Pedido listo para recojo
* Pedido despachado
* Pedido en camino (si se dispone de esa actualización)
* Entrega completada
* Incidencia o reprogramación

Los mensajes deben usar plantillas configurables y respetar las autorizaciones y reglas del canal.

### Consulta de estado

El cliente podría consultar el estado mediante un enlace de seguimiento o por WhatsApp. La consulta debe recuperar el estado real del pedido y no prometer ubicación en tiempo real si no existe esa integración.

### Comunicación con el repartidor

En una primera etapa, el equipo interno puede asignar el transportista y registrar manualmente los cambios de estado. En una etapa posterior podría incorporarse un acceso móvil para el repartidor o una integración con el proveedor logístico.

**No se presupone que WhatsApp, GPS, mensajería automática ni portales de seguimiento estén actualmente implementados.** Son capacidades por evaluar y desarrollar.

\---

# 7\. Interconexión entre los tres paneles

## Flujo A: tienda online con pago directo

1. La tienda consulta disponibilidad.
2. El checkout valida stock y crea pedido con reserva temporal.
3. El proveedor de pagos confirma o rechaza el pago.
4. Si se confirma, se registra el pago y el pedido queda habilitado para preparación.
5. Ventas registra o vincula la operación comercial sin duplicarla.
6. Logística prepara, despacha y gestiona la entrega.
7. El despacho registra la salida de stock una sola vez.
8. La entrega actualiza el estado del pedido y cierra el cumplimiento.

## Flujo B: pedido por WhatsApp o redes con voucher

1. El operador registra el pedido y el canal de origen.
2. El sistema valida stock y, si corresponde, crea una reserva temporal.
3. El cliente envía el voucher.
4. El operador verifica el ingreso y registra el pago.
5. La venta queda vinculada al pedido.
6. El pedido pasa a preparación.
7. Logística asigna transporte, coordina y registra la entrega.

## Flujo C: venta presencial con entrega posterior

1. El usuario registra la venta en Ventas.
2. Selecciona entrega posterior o recojo programado.
3. El sistema genera o vincula un pedido.
4. Se reserva el stock disponible para ese pedido.
5. Logística prepara y cumple la entrega.
6. El pedido se cierra al confirmar la entrega o el recojo.

## Flujo D: venta presencial con entrega inmediata

1. Se registra la venta.
2. Se registra el pago.
3. Se entrega el producto y se registra la salida de stock.
4. No se requiere un pedido logístico independiente, salvo que el negocio necesite trazabilidad adicional.

\---

# 8\. Responsabilidades y fuente de verdad

|Dato o proceso|Panel responsable|Relación|
|-|-|-|
|Operación comercial, precios y total vendido|Ventas|Puede vincularse con un pedido|
|Canal de origen|Ventas / Pedidos|Se conserva en la operación y el pedido|
|Pedido y sus estados|Pedidos|Origina tareas de preparación y entrega|
|Pago y estado de pago|Ventas / Pagos|Actualiza la condición para continuar el pedido|
|Disponibilidad y reservas|Inventario|Consultado por checkout, Pedidos y Ventas|
|Picking y empaquetado|Logística|Actualiza el pedido|
|Despacho y transportista|Logística|Puede haber varios despachos por pedido|
|Movimiento físico de salida|Inventario|Se registra al evento de salida definido|
|Entrega y evidencia|Logística|Actualiza el cumplimiento del pedido|
|Mensajes y seguimiento|Integración de comunicación / Logística|Usa el estado vigente del pedido|

\---

# 9\. Funciones que requieren verificación en el código actual

El contexto técnico disponible indica que Inventi Pro cuenta con productos, ventas, pedidos, clientes, almacenes y registros comerciales. También se han señalado aspectos de la lógica de stock que requieren revisión.

No se ha confirmado que ya existan, de forma completa:

* Reservas de stock con vencimiento automático.
* Bloqueo transaccional contra sobreventa en compras simultáneas.
* Liberación automática de reservas por pago fallido o expiración.
* Flujo completo de picking y empaquetado.
* Despachos con entregas parciales.
* Registro y asignación de transportistas o motorizados.
* Fechas, franjas y reprogramación de entregas.
* Evidencia de entrega e incidencias.
* Notificaciones automáticas por WhatsApp.
* Portal de seguimiento para clientes o interfaz para repartidores.

Estos puntos deben contrastarse con el código, las tablas, las funciones y las migraciones vigentes antes de convertirlos en tareas definitivas.

\---

# 10\. Decisiones consolidadas y pendientes

## Definido

* El módulo se llamará **Pedidos**, no «Pedidos web».
* Ventas será el registro general de las operaciones comerciales de todos los canales.
* Pedidos será un módulo propio, separado e interconectado.
* Una venta presencial podrá generar un pedido si requiere entrega posterior o recojo programado.
* Una venta de entrega inmediata podrá registrarse directamente en Ventas.
* Los canales de origen serán un campo/filtro, no módulos separados por canal.
* La compra online debe validar la disponibilidad de stock antes de confirmar el pedido.
* El pago, el estado del pedido y el estado de entrega serán estados separados.
* Logística será un módulo propio e interconectado con Pedidos, Ventas e Inventario.

## Propuesto para validar

* Nombre del módulo logístico: **Logística**.
* Reserva temporal durante el pago, con duración configurable.
* Reserva mantenida tras el pago hasta la preparación y salida.
* Liberación de reservas por cancelación, fallo o vencimiento.
* Estados detallados de preparación, despacho y entrega.
* Posibilidad de múltiples despachos por pedido.
* Gestión de transportistas, motorizados, incidencias y reprogramaciones.
* Notificaciones y consulta de estado mediante WhatsApp o enlace de seguimiento.

## Pendiente de decisión

* Duración exacta de la reserva para cada método de pago.
* Qué pedidos pueden avanzar con pago pendiente y bajo qué condiciones.
* Cuándo se emite el comprobante en cada flujo y cómo se vincula con la venta.
* Si los transportistas tendrán acceso propio o si el equipo interno actualizará los estados.
* Si se requiere seguimiento GPS o basta con estados operativos.
* Qué evidencia de entrega será obligatoria.
* Qué eventos enviarán mensajes al cliente y qué proveedor de mensajería se utilizará.

\---

# 11\. Referentes consultados

* **ERPNext — Stock Reservation:** reserva y liberación de stock vinculadas a pedidos de venta o listas de preparación. https://docs.frappe.io/erpnext/stock-reservation
* **ERPNext — Sales Order:** pedido como compromiso que habilita procesos posteriores de preparación, entrega, facturación y cobro. https://docs.frappe.io/erpnext/sales-order
* **InvenTree — Sales Orders:** estados del pedido, asignación de stock y gestión de uno o varios envíos. https://docs.inventree.org/en/stable/sales/sales\_order/

Las referencias describen funcionalidades de esos productos; las reglas propuestas para Inventi Pro son una síntesis de diseño y deben validarse con las necesidades del negocio y la implementación existente.

