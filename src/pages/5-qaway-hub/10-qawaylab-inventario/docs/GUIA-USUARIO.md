# 📘 Guía de Uso — QawayLab Inventario

**Para:** Usuario nuevo que acaba de recibir acceso a la app  
**Objetivo:**-configurar y empezar a usar el sistema en el orden correcto

---

## 🧭 Orden lógico de uso

La app está pensada para seguir estos pasos **en orden**. Saltar pasos puede causar que algo no funcione (por ejemplo, no puedes vender si no tienes productos).

```
1️⃣  Configuración        ← Primero: quién soy, cómo me veo
2️⃣  Logística            ← Segundo: mis productos y almacén
3️⃣  Comercial            ← Tercero: mis clientes y precios
4️⃣  Ventas               ← Cuarto: vender (el día a día)
5️⃣  Finanzas             ← Quinto: controlar el dinero
6️⃣  Promociones          ← Sexto: atraer más ventas
7️⃣  Reportes             ← Séptimo: analizar y decidir
```

---

## 1️⃣ CONFIGURACIÓN (hacer una vez)

> **Objetivo:** Definir quién eres, cómo se ve tu app y configurar datos fiscales.

### Paso 1.1 — Datos del negocio

1. Ve a **⚙️ Configuración**
2. Completa:
   - Nombre del negocio
   - RUC (si facturas)
   - Dirección
   - Teléfono
   - Email de contacto

### Paso 1.2 — Branding (tu marca)

1. En **Configuración → Branding**
2. Sube tu **logo**
3. Elige el **color principal** (el de tu marca)
4. Elige el **color secundario**
5. Ajusta **bordes** (redondeados, cuadrados, etc.)
6. Click **Guardar**

> La app cambiará de color al instante. Tus clientes que usen la versión white-label también verán estos cambios.

### Paso 1.3 — Configuración fiscal (si facturas con SUNAT)

1. En **Configuración → Fiscal**
2. Configura:
   - **Serie de boletas:** B001 (para boletas menores a S/ 700)
   - **Serie de facturas:** F001 (para facturas)
   - **Correlativo inicial:** 000001
   - **IGV:** 18% (estándar en Perú)
3. Si necesitas integración con SUNAT, configura la Edge Function con tu token de [apis.net.pe](https://apis.net.pe)

---

## 2️⃣ LOGÍSTICA (hacer una vez, actualizar cuando sea necesario)

> **Objetivo:** Registrar todo lo que vendes, dónde está guardado y en qué cantidad.

### Paso 2.1 — Categorías

1. Ve a **📦 Logística → 📁 Categorías**
2. Crea las categorías de tus productos:
   - Ejemplo: "Electrónica", "Ropa", "Alimentos", "Accesorios"
3. Puedes crear subcategorías dentro de cada una

> **Tip:** Empieza con pocas categorías y ve agregando. No crees 50 de una.

### Paso 2.2 — Ubicaciones

1. Ve a **📦 Logística → 📍 Ubicaciones**
2. Registra dónde guardas tu mercadería:
   - Ejemplo: "Almacén Principal", "Tienda Física", "Bodega"
3. Puedes crear ubicaciones más específicas:
   - Ejemplo: "Estante A-1", "Pasillo 3"

### Paso 2.3 — Productos

1. Ve a **📦 Logística → 📦 Productos**
2. Click **"+ Nuevo Producto"**
3. Completa:
   - **Nombre*** (obligatorio)
   - **SKU** (código interno, se genera solo si lo dejas vacío)
   - **Descripción**
   - **Categoría** (selecciona la que creaste)
   - **Unidad** (unidad, kg, litro, caja, par, etc.)
   - **Precio de venta** (S/)
   - **Costo** (S/) — cuánto te cuesta
   - **Stock actual** (cuántas unidades tienes)
   - **Stock mínimo** — para recibir alertas cuando se agote
   - **Ubicación** (dónde lo guardas)
4. Click **"Guardar"**

**Para productos con imágenes:**
- En la ficha del producto, sube fotos desde tu celular o computadora
- Puedes subir varias imágenes por producto

**Para importar muchos productos de golpe:**
- Click **"Importar productos"**
- Descarga la plantilla Excel
- Llena la plantilla con tus productos
- Sube el archivo
- La app los importa automáticamente

### Paso 2.4 — Paquetes (bundles)

Si vendes productos组合ados (ej: "Kit de regalo" = producto A + producto B):

1. Ve a **📦 Logística → 🎁 Paquetes**
2. Click **"+ Nuevo Paquete"**
3. Selecciona los productos que lo componen
4. Asigna un precio al paquete
5. Guardar

> El stock del paquete se calcula automáticamente del stock de sus productos individuales.

---

## 3️⃣ COMERCIAL (hacer una vez, actualizar cuando lleguen clientes nuevos)

> **Objetivo:** Registrar a quién le vendes y a qué precios.

### Paso 3.1 — Clientes

1. Ve a **👥 Comercial → 👥 Clientes**
2. Click **"+ Nuevo Cliente"**
3. Completa:
   - **Nombre / Razón Social*** (obligatorio)
   - **Tipo de documento:** DNI (8 dígitos) o RUC (11 dígitos)
   - **N° Documento**
   - **Dirección** (necesario para facturas)
   - **Teléfono**
   - **Email**
4. Click **"Guardar"**

**Consulta automática SUNAT:**
- Si ingresas un RUC, la app puede buscar automáticamente los datos en SUNAT (nombre, dirección, estado)
- Necesita que la Edge Function esté configurada

**Para importar clientes:**
- Click **"Importar clientes"**
- Sube un Excel con la lista

### Paso 3.2 — Listas de precios

Si tienes diferentes precios para diferentes clientes o mercados:

1. Ve a **💰 Comercial → 💰 Precios**
2. Crea listas de precios:
   - Ejemplo: "Precio General", "Precio Mayorista", "Precio VIP"
3. Asigna un precio por producto en cada lista

### Paso 3.3 — Cotizaciones

Antes de hacer una venta formal, puedes enviar una cotización:

1. Ve a **📋 Comercial → 📋 Cotizaciones**
2. Click **"+ Nueva Cotización"**
3. Selecciona cliente, productos y cantidades
4. Envía la cotización (se genera un PDF)
5. Si el cliente acepta, conviértela en venta directamente

---

## 4️⃣ VENTAS (el día a día)

> **Objetivo:** Vender productos y registrar cobros. Esto es lo que harás todos los días.

### Paso 4.1 — Punto de Venta (POS)

1. Ve a **🛒 Ventas → 🛒 Punto de Venta**
2. **Buscar producto** — escribe el nombre o escanea el código
3. **Agregar al carrito** — selecciona cantidad
4. **Repetir** para cada producto
5. **Seleccionar cliente** (opcional — puedes vender sin cliente registrado)
6. **Elegir método de pago:** Efectivo, Yape, Plin, Transferencia, Tarjeta
7. **Confirmar venta**

**Después de la venta:**
- El stock se actualiza automáticamente
- Se genera un correlativo (B000001, B000002...)
- Puedes imprimir un ticket o comprobante
- Si el cliente no paga todo, queda como "deuda"

### Paso 4.2 — Ventas a crédito

Si le vendes a un cliente y paga después:

1. En el POS, selecciona el cliente
2. En método de pago, selecciona **"Crédito"** o **"Pendiente"**
3. Confirmar
4. La venta queda como **"Por cobrar"**
5. Cuando el cliente pague, ve a la venta → click **"+ Pago"**
6. Registra el pago (parcial o total)

### Paso 4.3 — Historial de ventas

1. Ve a **🛒 Ventas → 📊 Historial**
2. Aquí ves todas las ventas con:
   - N° correlativo
   - Cliente
   - Total
   - Estado (Pagado / Deuda)
   - Fecha
3. Puedes buscar por fecha, cliente o estado

---

## 5️⃣ FINANZAS (semanal o mensual)

> **Objetivo:** Controlar el dinero que entra y sale del negocio.

### Paso 5.1 — Caja Chica

1. Ve a **💰 Finanzas → 💵 Caja Chica**
2. **Registrar ingresos:** dinero que entra (efectivo de ventas, transferencias recibidas)
3. **Registrar egresos:** dinero que sale (pagos urgentes, cambios)
4. El **balance** se calcula automáticamente

> La caja chica es para movimientos pequeños del día a día. No confundir con gastos fijos.

### Paso 5.2 — Gastos

1. Ve a **💰 Finanzas → 📤 Gastos**
2. Click **"+ Nuevo Gasto"**
3. Completa:
   - **Concepto** (ej: "Pago luz julio", "Transporte mercadería")
   - **Monto**
   - **Categoría** (Servicios, Transporte, Alquiler, Sueldos, etc.)
   - **Fecha**
4. Guardar

> Los gastos se agrupan por categoría y se muestran en un gráfico de torta para ver en qué se va tu dinero.

### Paso 5.3 — Contabilidad (avanzado)

Si necesitas llevar contabilidad formal:

1. Ve a **💰 Finanzas → 📒 Contabilidad**
2. Crea **asientos contables** con:
   - Débito (lo que entra)
   - Crédito (lo que sale)
3. Cada asiento debe estar **cuadrado** (débito = crédito)
4. Estados: **Borrador** → **Contabilizado**

> Ejemplo de asiento por venta al contado:
> - Débito: Caja S/ 118.00
> - Crédito: Ventas S/ 100.00 + IGV S/ 18.00

---

## 6️⃣ PROMOCIONES (cuando quieras atraer más ventas)

> **Objetivo:** Crear ofertas temporales y catálogos para vender más.

### Paso 6.1 — Campañas

1. Ve a **⚡ Promociones → ⚡ Campañas**
2. Click **"+ Nueva Campaña"**
3. Configura:
   - **Nombre** (ej: "Liquidación Agosto", "Oferta Back to School")
   - **Productos** incluidos
   - **Descuento** (porcentaje o monto fijo)
   - **Período** (fecha inicio y fin)
4. Guardar

> La campaña se activa automáticamente en las fechas indicadas.

### Paso 6.2 — Catálogos

1. Ve a **📄 Promociones → 📄 Catálogos**
2. Crea un catálogo online con tus productos
3. Se genera un **enlace público** (ej: `qawaylab.com/catalogo/tu-negocio`)
4. Comparte el enlace por WhatsApp o redes sociales
5. Los clientes ven tus productos y pueden pedir

---

## 7️⃣ REPORTES (semanal o mensual)

> **Objetivo:** Entender tu negocio para tomar mejores decisiones.

### Paso 7.1 — Kardex (movimiento de inventario)

1. Ve a **📈 Reportes → 📋 Kardex**
2. Selecciona rango de fechas
3. Ves cada movimiento: entradas, salidas, ajustes
4. **Exportar** a CSV o PDF

### Paso 7.2 — Productos más vendidos

1. Ve a **📈 Reportes → 📦 Productos**
2. Ranking de productos por unidades vendidas e ingreso
3. Sabes qué se vende más y qué no

### Paso 7.3 — Clientes

1. Ve a **📈 Reportes → 👥 Clientes**
2. Historial de compras por cliente
3. Sabes quién es tu mejor cliente

### Paso 7.4 — Ventas

1. Ve a **📈 Reportes → 📊 Ventas**
2. **Resumen:** total vendido, promedio por venta, cobrado vs. por cobrar
3. **Gráfico de tendencia:** ventas por día o por semana
4. **Comparación:** este período vs. el anterior

### Paso 7.5 — Libro Mayor (contabilidad)

1. Ve a **📈 Reportes → 📒 Libro Mayor**
2. Filtra por cuenta contable
3. Ves todos los movimientos con saldo acumulado

---

## 📱 Resumen rápido — Qué hago cada día

| Frecuencia | Qué hacer |
|---|---|
| **Todos los días** | Ventas (POS), registrar pagos |
| **Cuando llegue mercadería** | Registrar entrada de stock (Movimientos) |
| **Cuando llegue un cliente nuevo** | Crear cliente (Clientes) |
| **Cuando pague un deudor** | Registrar pago (Ventas → Pago) |
| **Al final del día** | Revisar caja chica, registrar gastos |
| **Cada semana** | Revisar reportes de ventas, productos más vendidos |
| **Cada mes** | Revisar libro mayor, comparar ventas mes anterior, crear campañas |

---

## ❓ Preguntas frecuentes

**¿Puedo vender sin registrar al cliente?**  
Sí. El cliente es opcional en el POS. Pero para facturas (RUC) necesitas el cliente.

**¿Qué pasa si me quedo sin stock?**  
La app muestra una alerta de "Stock bajo" cuando llegas al mínimo configurado. También puedes verlo en el Dashboard.

**¿Puedo editar una venta ya cerrada?**  
Depende. Puedes agregar pagos, pero no modificar los productos de una venta ya confirmada (por trazabilidad).

**¿Cómo devuelvo un producto?**  
Registra un movimiento de tipo "Salida" por devolución desde la sección de Movimientos.

**¿Puedo tener varios usuarios?**  
Sí. Cada usuario se registra con su email. Los roles (admin, vendedor, almacenero) se configuran en la base de datos.

**¿Mis datos están seguros?**  
Sí. Supabase tiene RLS (Row Level Security) — cada usuario solo ve sus propios datos.

---

*Guía de uso para QawayLab Inventario v0.1.0*
