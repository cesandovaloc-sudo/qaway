# Qaway Lab — Pasarela de Pagos

**Creación por Qaway Lab**

---

## 1. Descripción del proyecto

Módulo de pagos reutilizable, agnóstico y autónomo, diseñado para integrarse en cualquier proyecto web (academias, tiendas, landing pages, servicios) sin depender de WooCommerce, Shopify ni plataformas externas de ecommerce.

Este módulo vive como un paquete aislado (`qaway-pago`) que cualquier proyecto puede instalar y usar, manteniendo su propia base de datos, lógica de cobro, panel de administración y flujo de confirmación.

---

## 2. Objetivo

Construir un sistema de pagos que permita:

- **Vender cualquier tipo de producto:** cursos, productos digitales (bases de datos, scripts, ebooks), servicios (marketing, automatizaciones) y productos físicos (merch).
- **Aceptar múltiples métodos de pago peruanos:**
  - Yape QR (automático vía Culqi)
  - Tarjetas crédito/débito (automático vía Culqi)
  - PagoEfectivo (automático vía Culqi)
  - Pago Directo (manual: el usuario paga por transferencia/Yape, envía comprobante, el admin aprueba en panel)
- **Funcionar como paquete aislado:** que se instale (`npm install`) en cualquier proyecto sin depender de su stack específico.
- **Tener su propio carrito de compras** con cross-selling y sugerencias.
- **Tener panel de administración** para gestionar ventas, productos y pagos pendientes.
- **Ser escalable a cualquier rubro:** academias, café, servicios, tiendas digitales, etc.

---

## 3. Principios de trabajo

- **Marca Qaway Lab.** Todo el código y diseño llevan el sello de Qaway Lab. Cada proyecto que use este módulo dirá "Desarrollado por Qaway Lab".
- **Aislado.** El módulo no depende del proyecto que lo usa. Se instala como dependencia.
- **Sin iframes.** El carrito, checkout y panel son componentes React nativos o web components. No hay páginas embebidas de terceros.
- **Sin WooCommerce.** No dependemos de plugins ni plataformas de ecommerce externas. Todo es código propio.
- **Pagos peruanos primero.** Yape, PagoEfectivo, tarjetas y transferencia bancaria son los métodos base.
- **Híbrido automático + manual.** Quien pueda pagar con tarjeta/Yape lo hace automáticamente. Quien no, usa Pago Directo con aprobación manual del admin.
- **Reutilizable.** Un solo paquete sirve para Academy, para la web de café, para una tienda de scripts, etc.

---

## 4. Métodos de pago

| Método | Tipo | Automatización | Proveedor | Comisión |
|--------|------|---------------|-----------|----------|
| **Yape QR** | Billetera móvil | ✅ Automático | Culqi API → Webhook | ~3.9% + S/0.50 |
| **Tarjeta crédito/débito** | Visa, Mastercard, Amex | ✅ Automático | Culqi API → Webhook | ~3.9% + S/0.50 |
| **PagoEfectivo** | Depósito en agentes | ✅ Automático | Culqi API → Webhook | ~3.9% + S/0.50 |
| **Pago Directo** | Transferencia / Yape manual | 🔶 Semi-automático (admin aprueba) | Manual + WhatsApp + Correo | **0%** |

### Flujo Pago Directo

```
1. Usuario selecciona "Pago Directo" en el checkout
2. Ve los datos de la cuenta bancaria/Yape del negocio
3. Realiza el pago
4. Toma foto del comprobante
5. Envía el comprobante por WhatsApp o sube foto al sistema
6. Llega notificación al correo del admin: "Nuevo pago pendiente"
7. Admin ingresa al panel, ve el comprobante
8. Admin hace clic en "Aprobar"
9. El sistema desbloquea el producto automáticamente
10. Usuario recibe correo: "¡Tu compra ha sido confirmada!"
```

---

## 5. Estructura del paquete

```
qaway-pago/                          ← Paquete instalable (npm)
├── server/
│   ├── culqi-webhook.js            ← Recibe confirmaciones de Culqi
│   ├── culqi-client.js             ← Cliente API Culqi (generar QR, cargos)
│   ├── verify-payment.js           ← Lógica de verificación
│   └── email-notifications.js      ← Envío de correos (confirmación, pendiente)
│
├── supabase/
│   ├── 00001_schema.sql            ← Tablas: products, orders, order_items, payments
│   ├── 00002_rls_policies.sql      ← Políticas de seguridad
│   └── seed.sql                    ← Datos de ejemplo
│
├── components/
│   ├── Cart.jsx                    ← Carrito de compras con cross-selling
│   ├── Checkout.jsx                ← Selección de método de pago
│   ├── YapeQR.jsx                  ← Muestra QR + input para código de confirmación
│   ├── PagoDirectoForm.jsx         ← Formulario: datos de cuenta + subir comprobante
│   ├── PaymentStatus.jsx           ← Estado: pendiente/confirmado/fallido
│   └── OrderHistory.jsx            ← Historial de compras del usuario
│
├── admin/
│   ├── ProductsList.jsx            ← Gestión de productos (CRUD)
│   ├── ProductForm.jsx             ← Crear/editar producto
│   ├── OrdersList.jsx              ← Lista de órdenes con filtros
│   ├── PendingPayments.jsx         ← Pagos pendientes de aprobar (Pago Directo)
│   └── SalesDashboard.jsx          ← Métricas de ventas
│
├── lib/
│   ├── index.js                    ← Barrel export
│   ├── supabase.js                 ← Cliente Supabase (recibido como parámetro)
│   └── permissions.js              ← Roles: admin puede aprobar, usuario puede ver sus compras
│
└── README.md                       ← Instrucciones de instalación y uso
```

---

## 6. Modelo de datos

```sql
-- Productos (cursos, digitales, servicios, físicos)
products
  id            uuid PK
  title         text              ← "Curso Desarrollo Web" / "Script BD Clientes"
  description   text
  price         decimal(10,2)
  compare_price decimal(10,2)     ← Precio antes de descuento (opcional)
  image_url     text
  type          text              ← 'course' | 'digital' | 'service' | 'physical'
  category      text
  status        text              ← 'active' | 'draft' | 'archived'
  metadata      jsonb             ← Peso (físico), link de descarga (digital), duración (servicio)
  created_at    timestamptz
  updated_at    timestamptz

-- Órdenes (una orden puede tener múltiples items)
orders
  id            uuid PK
  user_id       uuid FK → profiles.id
  status        text              ← 'pending' | 'paid' | 'approved' | 'shipped' | 'cancelled'
  total         decimal(10,2)
  payment_method text             ← 'yape' | 'card' | 'pagoefectivo' | 'directo'
  notes         text              ← Notas del admin (Pago Directo)
  created_at    timestamptz
  paid_at       timestamptz

-- Items de la orden
order_items
  id            uuid PK
  order_id      uuid FK → orders.id
  product_id    uuid FK → products.id
  quantity      int               ← >1 solo para productos físicos
  unit_price    decimal(10,2)
  subtotal      decimal(10,2)

-- Pagos (la misma tabla que ya existe en Academy, ampliada)
payments
  id            uuid PK
  order_id      uuid FK → orders.id
  student_id    uuid FK → profiles.id
  product_id    uuid FK → products.id
  amount        decimal(10,2)
  currency      text              ← 'PEN' | 'USD'
  status        text              ← 'pending' | 'completed' | 'failed' | 'refunded'
  provider      text              ← 'culqi' | 'manual'
  provider_id   text              ← ID de transacción en Culqi (si aplica)
  proof_url     text              ← URL del comprobante (Pago Directo)
  approved_by   uuid FK → profiles.id  ← Admin que aprobó (Pago Directo)
  created_at    timestamptz
```

---

## 7. Integración con Culqi

Culqi es el proveedor de pagos automatizados (Yape QR, tarjetas, PagoEfectivo).

### Flujo automatizado

```
Frontend (React)
  │
  ├── 1. Usuario elige Yape/Tarjeta/PagoEfectivo
  ├── 2. Se genera orden local en BD (status: pending)
  ├── 3. Culqi.js muestra QR (Yape) o formulario (tarjeta)
  │
  └── Culqi API
        │
        ├── 4. Usuario paga
        ├── 5. Culqi envía webhook al servidor
        │
        └── Servidor (Edge Function)
              │
              ├── 6. Verifica firma del webhook
              ├── 7. Actualiza payment → status: completed
              ├── 8. Desbloquea producto
              └── 9. Envía correo de confirmación al usuario
```

### Variables de entorno requeridas

| Variable | Propósito |
|----------|-----------|
| `VITE_CULQI_PUBLIC_KEY` | Llave pública Culqi (frontend) |
| `CULQI_SECRET_KEY` | Llave secreta Culqi (servidor) |
| `CULQI_WEBHOOK_SECRET` | Para verificar firmas de webhooks |

---

## 8. Modos de uso

### Modo A: React (para proyectos propios)

```jsx
import { Cart, Checkout } from 'qaway-pago'

function Tienda() {
  return (
    <>
      <CatalogoProductos />
      <Cart />          {/* Carrito con cross-selling */}
      <Checkout />      {/* Yape/Tarjeta/PagoEfectivo/PagoDirecto */}
    </>
  )
}
```

### Modo B: Script embed (para clientes sin React)

```html
<script src="https://cdn.qwaylab.com/pago.js"
        data-public-key="pk_xxxx"
        data-product-id="PROD-001">
</script>
```

### Modo C: API REST (cualquier lenguaje)

```bash
curl -X POST https://api.qwaylab.com/v1/crear-orden \
  -H "Authorization: Bearer pk_xxxx" \
  -d '{"product_id":"PROD-001", "metodo":"yape"}'
```

---

## 9. Carrito con cross-selling

El carrito es un componente React propio con:

- **Lista de items** con cantidad, precio subtotal
- **Sugerencias automáticas:**
  - Misma categoría → "Otros cursos que te pueden interesar"
  - Complementarios → "Completa tu aprendizaje con..."
  - Populares → "Lo más vendido esta semana"
  - Packs con descuento → "Lleva el pack completo por S/XX"
- **Resumen** con total + botón "Pagar"
- **Persistencia** en localStorage o BD (usuario logueado)

---

## 10. Panel de administración

| Sección | Función |
|---------|---------|
| **Productos** | CRUD completo: crear, editar, publicar, archivar productos |
| **Órdenes** | Lista de todas las órdenes con filtros por estado/fecha |
| **Pagos Pendientes** | 🔴 Pagos manuales por aprobar con comprobante adjunto |
| **Ventas** | Métricas: ingresos, productos más vendidos, conversión |

### Pago Directo en el panel

```
[Admin → Ventas → Pagos Pendientes]
┌─────────────────────────────────────────────────────────────┐
│ 🔴 Pendientes (2)                                           │
│                                                             │
│ ┌───────────────────────────────────────────────────────┐   │
│ │ 📋 Juan Pérez — S/69.80 — Script BD + Curso Web      │   │
│ │    Comprobante: [📎 Ver imagen]                       │   │
│ │    WhatsApp: +51 999 888 777                          │   │
│ │    Enviado: Hoy 14:32                                 │   │
│ │                               [✅ Aprobar] [❌ Rechazar] │   │
│ └───────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

Al aprobar:
1. Payment → `status: completed`, `approved_by: admin_id`
2. Orden → `status: paid`, `paid_at: now()`
3. Producto desbloqueado para el usuario
4. Correo automático: "¡Tu compra ha sido confirmada!"

---

## 11. Criterio de aceptación

El módulo se considera listo cuando:

- [ ] Un producto se puede crear desde el panel admin
- [ ] Un usuario puede añadirlo al carrito
- [ ] Puede pagar con Yape QR (Culqi) y se desbloquea automáticamente
- [ ] Puede pagar con tarjeta (Culqi) y se desbloquea automáticamente
- [ ] Puede pagar con Pago Directo y el admin puede aprobar desde el panel
- [ ] Al aprobar, el usuario recibe correo y el producto se desbloquea
- [ ] El admin ve todas las ventas con métricas
- [ ] El paquete se puede instalar en otro proyecto (Academy, café, etc.)
- [ ] El script embed funciona en HTML plano
- [ ] La API REST responde correctamente

---

## 12. Notas

- Este módulo es **parte del ecosistema Qaway Lab**. Todo proyecto que lo use llevará "Desarrollado por Qaway Lab".
- No está atado a Academy ni a café ni a ningún proyecto específico. Es un producto independiente.
- Cuando se construya la web de café, este módulo se instalará como dependencia.
- Cuando se conecte con Qaway Lab web, este módulo será el puente de pagos.

---

*Documento creado para planificación. Se irá refinando durante la implementación.*

*Qaway Lab — Julio 2026*
