# SUSII_REFERENCIA.md — Modelo de datos de la app de referencia

> Extraído el 2026-08-13 navegando `https://sistema.susii.com` (sesión real: empresa **Love For Pets S.A.C. Elizabeth**, usuario `loveforpets`).
> Evidencia visual en `susii-evidence/*.png` (24 capturas).
> Propósito: base de comparación para el informe de brechas (gap report) del sistema de inventario del repo `10-qawaylab-inventario`.

---

## 0. Arquitectura y conceptos transversales

| Concepto | Detalle |
|---|---|
| **Multi-empresa / multi-sede** | Un login → selector de empresa/sede. El usuario tiene 4 sedes: Elizabeth, Sede 3, Callao, Jazmines (todas "Love For Pets S.A.C."). Cada sede tiene sus propios datos (ventas, series, SUNAT). |
| **Conexión SUNAT por empresa** | Menú usuario → "Conectar a SUNAT" / badge "Conectado a SUNAT". Es un paso explícito de configuración por sede. |
| **Roles / usuarios** | Módulo Usuarios (ruta `/employees`): tabla **Usuario | Email | Grupo** ("Grupo" = rol). Botón "Nuevo usuario". |
| **Correlativos por documento** | Ventas numeradas (00101…00113) y comprobantes con **Serie + Correlativo** (B001-00002). |
| **Auditoría por usuario** | Casi todas las tablas muestran el usuario que registró (loveforpets, loveforpets.elizabeth). |
| **Moneda** | PEN (S/) y USD ($) seleccionables por documento y en configuración de Monedas. |
| **Categorías de impuestos SUNAT** | IGV, Exonerado (EXON), Inafecto (INAF), retiros gravados (GRT-GRAV-PREMIO, GRT-GRAV-DON), etc. |

---

## 1. Ventas (módulo `/sales`)

### 1.1 Lista de ventas
Columnas: **Venta (correlativo) | Cliente | Total | Estado | Fecha | Docs | Usuario**

- Correlativo: 00109, 00108, … (secuencial por sede)
- Cliente: nombre o "—" (venta sin cliente) — nombres incluyen la mascota: `TOBY: ADRIANZEN SANDOVAL ALEXANDRA STEPHANIE`, `LULA: SANDOVAL SALAZAR JUANA MILAGROS`, `TOXICA: OCAÑA SOZA SANTOS HORTENCIA`
- Total: `S/ 60.00`
- **Estado: `Pagado` / `Deuda`** → el sistema soporta **ventas al crédito / cuentas por cobrar**
- Fecha: `01 oct. 2024 09:49`
- Docs: enlace a comprobantes (boleta/factura asociada)
- Usuario: quien registró
- Filtros: Desde / Hasta, paginación, "Mostrar totales"

### 1.2 Formulario nueva venta (`/sales/add-edit/`)
Campos:
- **Buscar producto** (búsqueda rápida por nombre/código)
- Líneas de items: cantidad, precio por unidad
- **Tipo de documento: `Boleta` / `Factura`** (conmutable)
- **Método de pago** (combobox): Efectivo, YAPE, "+ Nuevo" (métodos configurables)
- **Moneda**: Soles / Dólares americanos
- Fecha de la venta (editable)
- **Descuento** (spinbutton)
- **"+ Pago"** → una venta puede tener **múltiples pagos parciales** (parcial + saldo en deuda)
- **Cliente** (searchbox) + botón "Nuevo cliente" (creación inline)
- Observaciones / Nota

### 1.3 Detalle/edición de venta (`/sales/add-edit/:id`)
Además del formulario anterior:
- **Descuentos (-)** por línea
- **Observaciones (visible en la impresión del comprobante)** vs **Nota (no visible en la impresión)**
- Botones: **Clonar**, **Guardar**

---

## 2. Facturación electrónica (módulo `/sales/billing`)

### 2.1 Lista de comprobantes
Columnas: **Serie - Correlativo | Tipo de documento | Fecha | Cliente | Total | Estado**

- Ejemplos: `B001 - 00002` | **Boleta de venta** | 09 feb. 2024 | — | S/ 25.00 | **Generado**
- Tipos de documento vistos: Boleta de venta (B001), Factura (F001)
- Estados: **Generado** (también se configuran/visualizan otros estados SUNAT: enviado, aceptado, rechazado, etc. según series)
- Filtros Desde/Hasta, "Mostrar totales"

### 2.2 Detalle de comprobante (`/sales/billing/invoices-add-edit/:id`)
- Líneas de items con **IGV 18%** (impuesto por línea)
- **Tipo de descuento: "Desc. Monto" / "Desc. %"**
- **Moneda: PEN (S/) / USD ($)**
- Fecha
- **Observaciones (visible en la impresión del comprobante)** / **Nota (no visible)**
- Botones: **Clonar**, **Guardar**

---

## 3. Cotizaciones (módulo `/sales/quotations`)

- Submódulo con "**Nueva cotización**"
- Lista vacía en esta sede (sin datos de ejemplo), filtros Desde/Hasta
- Misma lógica de venta (productos, cliente, totales) sin generar comprobante

---

## 4. Compras (módulo `/purchases`)

Submódulos: **Compras | Órdenes de compra | Almacén | Nueva compra**

- **Compras**: registro de compras (con proveedor, documento, montos). Lista vacía en esta sede.
- **Órdenes de compra**: subflujo propio (OC a proveedores)
- **Almacén** → movimientos de inventario (ver §5)
- **Nueva compra**: formulario de compra (proveedor, items, costos)

---

## 5. Almacén / Movimientos (módulo `/warehouse`)

### Lista de movimientos
Columnas: **Nº (correlativo) | Tipo | Fecha | Usuario | Referencia**

- Ejemplos: `00113` | **Salida** | 01 oct. 2024 09:49 | loveforpets | **Venta 109** (vínculo al documento que originó el movimiento)
- Tipos: **Salida** (por venta), **Entrada** (por compra), ajustes
- **Tracking completo**: cada salida se origina de una venta (referencia cruzada)
- Acción: **"Nueva entrada / salida de almacén"**
- Filtros Desde/Hasta

---

## 6. Productos (módulo `/products`)

Submódulos: **Productos | Paquetes | Categorías | Importar productos**

### 6.1 Lista de productos
Columnas: **Código | Nombre | Unidad | Precio | Cant. | Categoría** + acciones

- Ejemplos: `235152` SOGA TRENZADA, UNIDAD, S/ 14.00, cant. -1, cat. —
- **Unidad** es la unidad SUNAT (UNIDAD, KGM, etc.)
- **Cant.** = stock actual (puede ser negativo → sin validación estricta o stock deficitario)
- Filtros de lista: checkbox "Con stock", "Con impuestos", "Selectores" (con variantes)

### 6.2 Formulario nuevo producto (modal)
Campos básicos:
- **Con stock** (checkbox, default on)
- **Selectores** (variantes/atributos) — botón "Nuevo selector" / "Buscar selector ya creado"
- **Nombre\***
- **Código\*** (SKU interno)
- Categoría (combobox) + "Crear categoría" inline
- **Precio de venta\***
- **Con impuestos** (checkbox) + **Impuesto ISC** + impuesto principal (IGV)
- **Unidad\*** (buscar unidad SUNAT — botón "Buscar unidad")
- **Subir imagen** (una imagen principal)
- Botones: "Ver detalle", Cancelar, Guardar

### 6.3 Opciones avanzadas del producto
- **Precio inicial de compra** (costo)
- **Con impuestos** (checkbox, propio del costo)
- **Peso bruto (KGM)** — peso con unidad SUNAT
- **Alias** (nombre alternativo/búsqueda)
- **Stock mínimo**
- **Stock inicial**
- **Porcentaje de ganancia** (markup automático)
- **Descuento** (%)
- **Búsqueda en ventas** (checkbox, visible en el buscador de ventas)

### 6.4 Importar productos
- Ruta `/products/import` — importación masiva desde archivo

---

## 7. Categorías de productos (módulo `/products/product-categories`)

Columnas: **Ordenar | Orden | Nombre | Por defecto | Acciones**
- Lista **plana ordenada** (drag & drop con "Ordenar aquí"), categoría "Por defecto"

---

## 8. Paquetes (módulo `/products/packages`)

Columnas: **Paquete | Nombre | Unidad | Precio | Elementos | Cant.**
- Kits/combinaciones de productos con precio propio y elementos que lo componen (con cantidad)

---

## 9. Clientes / Proveedores (módulo `/clients`)

### 9.1 Lista
Columnas: **Nombre / Razón Social | Documento | Tipo | Dirección | Teléfono** + acciones

- Ejemplos:
  - `Cardenas ramitez . Molly . cliente love` | SIN DOCUMENTO 00000000 | Cliente | 914935227-01/01/24 | —
  - `BARBIE CARRILLO VILLANUEVA TERESA CARMEN` | **DNI 25612262** | Cliente | JR OLAYA 587 BELLAVISTA | 995097295
- **Tipo de documento fiscal**: DNI / RUC / SIN DOCUMENTO (00000000) / otros (pasaporte, carné extranjería)
- **Mascota en el nombre** (formato `MASCOTA: NOMBRE COMPLETO`) — contexto veterinaria/pet shop; en el formulario va en "Datos adicionales"

### 9.2 Formulario nuevo cliente / proveedor (modal)
- **Tipo de documento** (combobox: DNI, RUC, …)
- **Nº de Documento\***
- **Botón "SUNAT"** → consulta automática a la API de SUNAT (autocompleta razón social/dirección desde el RUC/DNI)
- **Nombre legal\*** (razón social o nombre)
- **Dirección**
- Combobox geográfico (departamento/provincia/distrito)
- **Opciones avanzadas**: **Alias**, **Género**, **Teléfono**, **Correo electrónico**, **Datos adicionales**
- Botones: Cancelar, Guardar

---

## 10. Caja chica (módulo `/petty-cash/movements`)

- **"Nuevo movimiento"**: **Fecha | Tipo (Ingreso / Egreso) | concepto | monto**
- **"Abrir nueva"** → apertura de caja por usuario (cajas: `loveforpets 13 ago. 00:00 Actual`, `loveforpets.elizabeth 13 ago. 00:00`)
- **"Ticket"** → impresión de ticket
- Caja por usuario/sede, estado "Actual"

---

## 11. Gastos (módulo `/expenses`)

Columnas: **Fecha | Descripción | Cuenta | Usuario | Monto**

- Formulario: **Descripción | Cuenta** (combobox de cuentas/categorías de gasto) | **Fecha | Monto**
- "Nuevo gasto" + submodulo Caja chica

---

## 12. Reportes (módulo `/reports`)

Submódulos: **Hoy | Productos | Kardex | Contables | Clientes | Descargas**

- **Hoy**: resumen del día (ventas del día/mes)
- **Productos** (`/reports/per-product`): columnas **Código | Producto | Último Precio de venta | Total**
- **Kardex** (`/reports/kardex`): **kardex valorizado por producto** con filtros **Desde/Hasta + producto**
- **Contables** (`/reports/accounting`): reportes contables
- **Clientes**: reportes por cliente
- **Descargas**: exportaciones/descargas
- Filtros de periodo con atajos **D / S / M** (día / semana / mes) en varios reportes

---

## 13. Usuarios (módulo `/employees`)

Columnas: **Usuarios | Email | Grupo**
- "Grupo" = rol (grupos de permisos)
- Botón "Nuevo usuario"

---

## 14. Transacciones / Contabilidad (módulo `/accounting`)

Columnas: **Fecha | Descripción | Usuario | Origen | Cuenta | Monto**
- Registro financiero global (pagos de venta, origen de la transacción)
- Ejemplos: `Pago de venta` | YAPE | + S/ 18.00
- Es el libro de movimientos financieros (vincula ventas, pagos, caja)

---

## 15. Configuraciones (módulo `/configurations`)

Submódulos: **Impuestos | Unidades | Monedas | Pagos | Series | Negocio**

- **Impuestos** (`/configurations/taxes`): **Nombre | Abreviatura | Por defecto | Activar** — catálogo: IGV (Default), Exonerado (EXON), Inafecto (INAF), [Gratuita] Gravado - Retiro por premio (GRT-GRAV-PREMIO), [Gratuita] Gravado - Retiro por donación (GRT-GRAV-DON)
- **Unidades**: catálogo de unidades (SUNAT)
- **Monedas**: catálogo de monedas (PEN/USD/…)
- **Pagos**: métodos de pago configurables (Efectivo, YAPE, + Nuevo)
- **Series** (`/configurations/serials`): **Serie | Correlativo | Tipo de Documento | Descripción | Desactivar**
  - B001/00003 → Boleta de venta ("Serie Boletas")
  - F001/00001 → Factura ("Serie Facturas")
  - BC01/00001 → Nota de crédito (boletas)
  - FC01/00001 → Nota de crédito (facturas)
  - BD01/00001 → Nota de débito (boletas)
  - FD01/00001 → Nota de débito (facturas)
  - Tipos disponibles: Factura, Boleta de venta, Nota de crédito, Nota de débito, **Guía de remisión remitente**, **Comprobante de Percepción**
- **Negocio** (`/configurations/business`): datos de la empresa (RUC, razón social, dirección) — contenido en modal, no capturado en detalle

---

## 16. Menú / navegación (sidebar)

Nivel 1: **Ventas · Compras · Productos · Clientes · Caja chica · Reportes · Más**
Nivel 2 (al expandir "Más"): **Usuarios · Gastos · Transacciones · Configuraciones**

Menú de usuario (avatar): Mi cuenta · Soporte · Pagos · **Configurar Susii** · **Conectar a SUNAT** · Cerrar sesión · **Mis empresas / Administrar empresas**

---

## 17. Evidencia (screenshots)

| # | Archivo | Contenido |
|---|---|---|
| 01 | `susii-evidence/01-ventas-lista.png` | Lista de ventas (correlativo, cliente, total, estado Pagado/Deuda) |
| 02 | `susii-evidence/02-nueva-venta.png` | Formulario nueva venta (Boleta/Factura, pago, moneda) |
| 03 | `susii-evidence/03-facturacion.png` | Lista de comprobantes (B001-00002, Boleta de venta) |
| 04 | `susii-evidence/04-factura-detalle.png` | Detalle comprobante (IGV 18%, desc. %, moneda) |
| 05 | `susii-evidence/05-cotizaciones.png` | Cotizaciones |
| 06 | `susii-evidence/06-compras.png` | Compras (Órdenes de compra, Almacén) |
| 07 | `susii-evidence/07-almacen-movimientos.png` | Movimientos de almacén (Salida, ref. Venta 109) |
| 08 | `susii-evidence/08-productos-lista.png` | Lista de productos (Código, Nombre, Unidad, Precio, Cant.) |
| 09 | `susii-evidence/09-producto-nuevo-modal.png` | Modal nuevo producto (básico) |
| 10 | `susii-evidence/10-producto-opciones-avanzadas.png` | Opciones avanzadas (costo, peso, stock mín, % ganancia) |
| 11 | `susii-evidence/11-clientes-lista.png` | Clientes (Documento DNI/RUC, Tipo, Dirección) |
| 12 | `susii-evidence/12-cliente-form.png` | Formulario cliente (Nº doc + SUNAT, Nombre legal, avanzados) |
| 13 | `susii-evidence/13-caja-chica.png` | Caja chica (Ingreso/Egreso, apertura) |
| 14 | `susii-evidence/14-reportes.png` | Reportes (Hoy, Productos, Kardex, Contables, Clientes, Descargas) |
| 15 | `susii-evidence/15-kardex.png` | Kardex |
| 16 | `susii-evidence/16-usuarios.png` | Usuarios (Usuario, Email, Grupo) |
| 17 | `susii-evidence/17-config-impuestos.png` | Impuestos (IGV, EXON, INAF, retiros) |
| 18 | `susii-evidence/18-config-series.png` | Series (B001, F001, notas crédito/débito) |
| 19 | `susii-evidence/19-config-negocio.png` | Negocio + menú usuario (Conectar a SUNAT) |
| 20 | `susii-evidence/20-venta-detalle.png` | Detalle/edición de venta (descuentos, +Pago, Clonar) |
| 21 | `susii-evidence/21-categorias.png` | Categorías de producto (planas, ordenadas) |
| 22 | `susii-evidence/22-paquetes.png` | Paquetes (Paquete, Nombre, Unidad, Precio, Elementos, Cant.) |
| 23 | `susii-evidence/23-gastos.png` | Gastos (Fecha, Descripción, Cuenta, Usuario, Monto) |
| 24 | `susii-evidence/24-transacciones.png` | Transacciones/contabilidad (Fecha, Descripción, Origen, Cuenta, Monto) |

---

## 18. Notas de captura

- Las capturas se tomaron sobre la sede **Elizabeth** (los datos de las otras sedes no se recorrieron; misma estructura de módulos).
- No se creó ni modificó ningún dato en SUSII (solo lectura de pantallas; los formularios se cerraron con Cancelar).
- El módulo "Negocio" mostró el contenido dentro de un modal que no se pudo extraer; se anota su existencia y su rol (datos de empresa/RUC).
- El módulo "Reportes → Contables" existe pero no se profundizó (mismo patrón de filtros que Kardex).
