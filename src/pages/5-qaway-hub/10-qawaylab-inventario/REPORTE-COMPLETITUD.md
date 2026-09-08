# REPORTE-COMPLETITUD.md — Brechas vs. SUSII (sistema.susii.com)

> **Fecha:** 2026-08-13
> **Repo auditado:** `10-qawaylab-inventario` (Inventario Qaway)
> **Referencia:** `SUSII_REFERENCIA.md` (capturado de la sede "Love For Pets S.A.C. Elizabeth")
> **Método:** recorrido real de SUSII con navegador headless (24 screenshots en `susii-evidence/`) + lectura a fondo del repo (types, services, componentes, rutas, migraciones SQL).
> **Alcance:** solo diagnóstico. No se modificó ningún archivo de código de la aplicación.

---

## 1. Resumen ejecutivo

El repo ya cubre bien la **gestión de inventario, catálogo, liquidación y comercio digital (carrito/pagos online)** — incluso supera a SUSII en permisos granulares, jerarquía de categorías y enlaces compartidos. Pero SUSII es un **sistema comercial/fiscal completo (POS + SUNAT)** y el repo carece del 100% de la capa fiscal y de operación de tienda física:

| Bloque | SUSII | Repo | Estado |
|---|---|---|---|
| Inventario / productos | ✅ | ✅ | **Completo** (con ventaja en ubicaciones/condición) |
| Ventas (POS) | ✅ | ⚠️ solo ecommerce | **Parcial** |
| Facturación electrónica SUNAT | ✅ | ❌ | **Falta** (brecha mayor) |
| Compras / Órdenes de compra | ✅ | ❌ | **Falta** |
| Clientes con doc. fiscal + SUNAT | ✅ | ⚠️ | **Parcial** |
| Caja chica / Gastos | ✅ | ❌ | **Falta** |
| Contabilidad / Transacciones | ✅ | ❌ | **Falta** |
| Reportes (Kardex, contables) | ✅ | ⚠️ solo dashboard | **Parcial** |
| Roles y permisos | ✅ | ✅ | **Completo** (repo es superior) |
| Configuraciones (series, impuestos) | ✅ | ❌ | **Falta** |
| Multi-empresa / multi-sede | ✅ | ❌ | **Falta** |

**Conclusión:** si el objetivo es replicar/mejorar SUSII, el trabajo se concentra en la **capa comercial-fiscal**: facturación SUNAT, POS con crédito, compras, caja chica, reportes fiscales y multi-sede.

---

## 2. Tabla por módulo: SUSII vs Repo

| # | Módulo | En SUSII | En mi repo | Estado | Brechas concretas |
|---|---|---|---|---|---|
| 1 | **Productos** | Código, Nombre, Unidad (SUNAT), Precio, Stock, Categoría, Selectores (variantes), Impuestos (IGV/ISC), Costo, Peso, Alias, Stock mín/inicial, % ganancia, descuento, imagen | `products` con sku, name, slug, description, category/subcategory, brand, type, status, condition 1-10, unit, min_stock, location, cost, base_price, images, variants + importación Excel | **Completo** | Sin **impuestos por producto** (IGV/ISC), sin catálogo de **unidades SUNAT**, sin **peso bruto**, sin **alias** de búsqueda, sin **% de ganancia** automático. El repo agrega: condición Likert 1-10, ubicaciones, slug, marca (ventaja) |
| 2 | **Categorías** | Lista plana ordenada con drag & drop + "por defecto" | Árbol jerárquico (parent_id, icono, orden) | **Completo** | El repo es superior (jerárquico). SUSII no tiene subcategorías |
| 3 | **Ventas / POS** | Correlativo por venta, cliente, **estado Pagado/Deuda (crédito)**, boleta/factura, método pago, moneda, descuento, **múltiples pagos parciales**, observaciones/nota, **clonar** | Módulo `@qawaylab/pago`: `orders` (pending/paid/cancelled/refunded) + `payments` + carrito/checkout online | **Parcial** | No hay **venta de mostrador (POS)** ni **crédito/cuentas por cobrar** (estado Deuda), ni **correlativo de venta**, ni **múltiples pagos parciales** por orden, ni **clonar venta**. El ecommerce cubre el checkout online pero no la tienda física |
| 4 | **Facturación electrónica (SUNAT)** | Series+correlativo (B001/F001/BC01/FC01/BD01/FD01), tipos (boleta, factura, nota crédito/débito, guía remisión, percepción), IGV 18% por línea, estados del comprobante (Generado…), **conexión SUNAT por empresa** | — | **Falta** | No existe ningún módulo de comprobantes electrónicos: sin series, sin IGV configurable, sin envío a SUNAT, sin estados de comprobante. **Brecha crítica si se factura legalmente** |
| 5 | **Cotizaciones** | Cotización con productos, cliente, totales | `quotations` + `quotation_items` con estados draft/sent/accepted/rejected/expired | **Completo** | Equivalente. Detalle menor: SUSII permite convertir cotización → venta (no verificado en repo) |
| 6 | **Compras** | Compras + **Órdenes de compra** + Nueva compra (proveedor, items, costos) | — | **Falta** | No existe módulo de compras ni órdenes de compra ni proveedores como entidad |
| 7 | **Almacén / Movimientos** | Movimientos con **correlativo**, tipo, usuario, **referencia al documento origen** (Venta 109) | `inventory_movements` (entry/exit/transfer/adjustment/sale/reservation, from/to location, created_by) + página Movements | **Parcial** | El modelo existe pero **no hay correlativo de movimiento**, ni **referencia al documento origen** (venta/compra), ni se registran automáticamente desde ventas (hoy son manuales en el detalle del producto) |
| 8 | **Paquetes** | Paquete + elementos + cantidades | `bundles` + `bundle_items` | **Completo** | Equivalente |
| 9 | **Clientes / Proveedores** | **Documento fiscal (DNI/RUC/SIN DOC)** + **botón consulta SUNAT**, nombre legal, dirección, género, teléfono, email, alias, datos adicionales (mascota); **cliente y proveedor unificados** | `customers` (name, company, email, phone, type, notes) | **Parcial** | **Falta documento fiscal** (DNI/RUC) → impide facturación; falta **consulta SUNAT**; falta **dirección**; falta **género/datos adicionales**; **no hay proveedores** (ni tipo proveedor) |
| 10 | **Caja chica** | Movimientos ingreso/egreso, **apertura de caja por usuario**, tickets | — | **Falta** | No existe |
| 11 | **Gastos** | Fecha, descripción, **cuenta**, usuario, monto | — | **Falta** | No existe |
| 12 | **Transacciones / Contabilidad** | Libro financiero: fecha, descripción, usuario, **origen**, cuenta, monto | Solo `payments` del módulo pago | **Falta** | No hay un registro financiero unificado (origen = venta/pago/gasto) |
| 13 | **Reportes** | **Kardex valorizado**, por producto (últ. precio, total), Hoy, **Contables**, por cliente, Descargas; filtros D/S/M | Dashboard con métricas (total, stock, valor, low/out stock) + gráficas 6 meses | **Parcial** | **Falta Kardex** (crítico), **reportes contables**, **reporte por cliente**, **exportaciones/descargas**, filtros por periodo |
| 14 | **Usuarios / Roles** | Usuarios con **Grupo** (rol) + email | `users` con 4 roles + **28 permisos granulares** + `shared_access_links` (invitados) | **Completo** | **El repo es superior** (permisos granulares, enlaces compartidos, protección anti-escalada en SQL) |
| 15 | **Configuraciones** | **Impuestos, Unidades, Monedas, Pagos, Series, Negocio** (RUC/empresa) | `SettingsPage` = placeholder "Próximamente"; white-label via env | **Falta** | No hay catálogo de impuestos, unidades SUNAT, monedas, métodos de pago, **series de comprobantes**, ni datos de negocio/RUC |
| 16 | **Multi-empresa / Multi-sede** | Selector de empresa/sede, datos y series por sede, conexión SUNAT por sede | Solo `inventory_locations` (almacenes/zonas internos) | **Falta** | No existe concepto de **sede comercial** (empresa + serie + SUNAT + caja por sede). Lo más cercano son las ubicaciones internas de almacén |
| 17 | **Importar productos** | `/products/import` | Importación Excel/CSV con SKU autogenerado, sinónimos, errores por fila | **Completo** | Equivalente (el repo es robusto) |
| 18 | **Ecommerce / Pagos online** | No es el foco (solo métodos de pago en POS) | Carrito + checkout + payments (yape/card/mercadopago/stripe…) + contrato commerce v1 | **Extra del repo** | SUSII no tiene tienda online pública; el repo sí (ventaja) |

---

## 3. Campos faltantes por entidad

### 3.1 `products` (+ variantes)
| Campo SUSII | En repo | Prioridad |
|---|---|---|
| Impuestos (IGV / ISC) por producto | ❌ | **Crítica** (requisito SUNAT) |
| Unidad según catálogo SUNAT (UNIDAD, KGM…) | ⚠️ `unit` libre (sin catálogo ni validación) | Alta |
| Peso bruto (con unidad) | ❌ | Media |
| Alias (búsqueda alternativa) | ❌ | Media |
| Porcentaje de ganancia (markup) | ❌ | Media |
| Descuento por defecto | ⚠️ vía price_lists/pricing_rules | Baja |
| Stock inicial (en creación) | ⚠️ stock vía ubicaciones | Media |
| Selectores/variantes (atributos) | ✅ `variants` + attributes | — |
| Imagen | ✅ | — |
| Costo / precio compra | ✅ `cost` | — |

### 3.2 `customers` (y proveedores)
| Campo SUSII | En repo | Prioridad |
|---|---|---|
| **Tipo + Nº de documento fiscal** (DNI/RUC/pasaporte/SIN DOC) | ❌ | **Crítica** (impide facturar) |
| **Consulta automática SUNAT** (botón por RUC/DNI) | ❌ | **Crítica** |
| Dirección (+ geografía) | ❌ | Alta |
| Género | ❌ | Baja |
| Alias | ❌ | Baja |
| Datos adicionales (mascota) | ❌ (solo `notes`) | Media |
| **Tipo proveedor** (cliente/proveedor unificados) | ❌ | **Alta** (base de compras) |
| Teléfono / email | ✅ | — |
| Tipo comercial (particular/empresa/mayorista/revendedor) | ✅ | — |

### 3.3 Ventas / Órdenes
| Campo SUSII | En repo | Prioridad |
|---|---|---|
| **Correlativo de venta** (00101…) | ❌ | Alta |
| **Estado Deuda / crédito (cuentas por cobrar)** | ❌ | **Crítica** |
| **Múltiples pagos parciales por venta** | ⚠️ 1 `payment` por orden | Alta |
| Tipo de documento (boleta/factura) por venta | ❌ | **Crítica** |
| Observaciones / nota (impresión) | ⚠️ `notes` | Media |
| Clonar venta | ❌ | Baja |
| Moneda | ✅ PEN fijo (contract permite currency) | Media |
| Venta de mostrador sin login de cliente | ❌ (requiere carrito/ecommerce) | Alta (para POS) |

### 3.4 Movimientos de almacén
| Campo SUSII | En repo | Prioridad |
|---|---|---|
| Correlativo de movimiento | ❌ | Media |
| **Referencia al documento origen** (venta/compra) | ❌ | **Alta** (tracking) |
| Registro automático desde venta/compra | ❌ (manual) | **Alta** |
| Usuario que registra | ✅ `created_by` | — |

### 3.5 Configuración
| Campo SUSII | En repo | Prioridad |
|---|---|---|
| Catálogo de impuestos (IGV, EXON, INAF…) | ❌ | **Crítica** |
| Catálogo de unidades SUNAT | ❌ | Alta |
| Catálogo de monedas | ❌ | Media |
| Métodos de pago configurables | ⚠️ hardcodeados en contrato | Media |
| **Series de comprobantes** (B001, F001, notas) | ❌ | **Crítica** |
| Datos de negocio/RUC (por sede) | ❌ | **Crítica** |
| Conexión SUNAT (credenciales por empresa) | ❌ | **Crítica** |

---

## 4. Flujos que SUSII tiene y el repo no

1. **Venta de mostrador con crédito**: registrar venta → pagar parcial o dejar en **Deuda** → cobrar después (cuentas por cobrar). El repo solo tiene checkout online pagado.
2. **Facturación electrónica**: emitir boleta/factura → serie+correlativo → IGV → enviar a SUNAT → estado del comprobante → notas de crédito/débito, guía de remisión.
3. **Compras con proveedores**: registrar compra a proveedor → entra a almacén → costo del producto.
4. **Apertura y movimiento de caja chica** por usuario/sede con tickets.
5. **Gastos por cuenta** (categorización financiera).
6. **Kardex valorizado** por producto con filtro por periodo.
7. **Multi-sede**: cada sede con sus datos, series, SUNAT y caja.
8. **Reportes contables y por cliente** + descargas/exportación.

---

## 5. Prioridades y justificación

| Prioridad | Brecha | Justificación |
|---|---|---|
| **Crítica** | Facturación electrónica SUNAT (series, IGV, estados, conexión) | Requisito legal en Perú para emitir boletas/facturas; el repo lo descartó explícitamente en PRODUCT.md ("No construir en MVP") |
| **Crítica** | Documento fiscal en clientes + consulta SUNAT | Sin DNI/RUC no se puede emitir comprobante a nombre de nadie |
| **Crítica** | Datos de negocio/RUC + configuración de series/impuestos | Configuración previa indispensable de cualquier facturación |
| **Crítica** | Ventas al crédito (estado Deuda / cuentas por cobrar) | Modelo de negocio real de tienda física; SUSII lo usa (Pagado/Deuda en la lista) |
| **Alta** | Módulo de compras + proveedores + órdenes de compra | Cierra el ciclo de inventario (entrada = compra); SUSII lo tiene |
| **Alta** | Movimientos automáticos con referencia al documento origen | Trazabilidad de inventario (kardex); hoy los movimientos son manuales |
| **Alta** | Kardex valorizado y reportes por cliente/contables | Decisiones de negocio; SUSII los expone en primer nivel de Reportes |
| **Alta** | POS / venta de mostrador | SUSII es ante todo un sistema de caja; el repo solo vende online |
| **Alta** | Caja chica + gastos | Control de efectivo diario; SUSII lo tiene como módulos propios |
| **Media** | Multi-sede / multi-empresa | Relevante solo si el producto se vende a negocios con varias sucursales |
| **Media** | Correlativos de venta/movimiento | Estética operativa y auditoría; SUSII numera todo |
| **Media** | Unidades SUNAT, peso, alias, % ganancia en producto | Completitud de ficha de producto |
| **Baja** | Clonar venta, género, descuento por defecto | Comodidades; sin impacto regulatorio |

---

## 6. Evidencia

- Modelo de datos SUSII: `SUSII_REFERENCIA.md` (§1–§18)
- Screenshots por módulo: `susii-evidence/01-*.png` … `susii-evidence/24-*.png` (índice completo en `SUSII_REFERENCIA.md` §17)
- Repo auditado: `src/types/index.ts` (modelo de datos), `src/services/*` (operaciones), `src/app/router/AppRouter.tsx` (rutas), `supabase/migrations/*.sql` (schema DB), `PRODUCT.md` (declaración "No construir en MVP: Facturación")

---

## 7. Notas metodológicas

- Los módulos de SUSII se recorrieron **solo en lectura**: ningún dato fue creado o modificado.
- La sede auditada fue **Elizabeth**; las otras 3 (Sede 3, Callao, Jazmines) comparten estructura.
- El módulo "Negocio" de SUSII muestra su contenido en un modal no extraíble; se anota su existencia (datos de empresa/RUC).
- La comparación de "Ventas" asume que el módulo `@qawaylab/pago` es el único mecanismo de venta del repo (validado en `docs/decisions/007` y `contracts/commerce`).
