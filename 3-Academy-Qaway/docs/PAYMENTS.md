# Medios de Pago — Qaway Academy

## Arquitectura

```
[Frontend React] → [Backend] → [WooCommerce] → [Stripe]
                      ↓
               [Supabase DB]
```

## Estrategia: WooCommerce como puente inicial

### Por que WooCommerce primero

- Ya usas WooCommerce en la parte comercial de Qaway Studio
- Sin necesidad de implementar un sistema de pagos desde cero
- Los pedidos y transacciones quedan registrados en WooCommerce
- Se puede migrar a Stripe directamente despues sin perder datos

### Integracion WooCommerce (plugin REST API)

WooCommerce expone una REST API que permite:

1. **Crear productos** (cursos) desde el admin de WordPress/WooCommerce
2. **Sincronizar cursos** entre la Academy y WooCommerce via webhooks
3. **Procesar pagos** a traves de WooCommerce Payments (Stripe integrado)
4. **Consultar pedidos** para validar acceso a cursos

### Variables de entorno necesarias

```env
# WooCommerce
VITE_WOOCOMMERCE_URL=https://tu-tienda.com/wp-json/wc/v3
VITE_WOOCOMMERCE_CONSUMER_KEY=ck_tu_key_aqui
VITE_WOOCOMMERCE_CONSUMER_SECRET=cs_tu_secret_aqui

# Stripe (cuando migres)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_tu_key_aqui
STRIPE_SECRET_KEY=sk_test_tu_key_aqui
STRIPE_WEBHOOK_SECRET=whsec_tu_secret_aqui
```

### Tabla de pagos en Supabase

```sql
-- Tabla de transacciones (pedidos sincronizados desde WooCommerce o Stripe)
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'pending',        -- pending, completed, failed, refunded
  provider VARCHAR(20) NOT NULL,                         -- 'woocommerce', 'stripe', 'manual'
  provider_order_id VARCHAR(255),                        -- ID del pedido en WooCommerce o Stripe
  metadata JSONB DEFAULT '{}',                            -- Datos extra del proveedor
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabla de metodos de pago disponibles
CREATE TABLE payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0
);

-- Metodos de pago por defecto
INSERT INTO payment_methods (name, slug, description, sort_order) VALUES
  ('Tarjeta de credito/debito', 'card', 'Paga con Visa, Mastercard o American Express', 1),
  ('Transferencia bancaria', 'transfer', 'Transferencia directa a cuenta bancaria', 2),
  ('PayPal', 'paypal', 'Paga con tu cuenta de PayPal', 3);
```

### Flujo de pago

```
1. Alumno selecciona curso de pago
2. Frontend muestra resumen + boton "Comprar ahora"
3. Alumno elige metodo de pago
4. Backend crea pedido en WooCommerce (o session en Stripe)
5. Alumno completa pago en la plataforma externa
6. Webhook notifica al backend → se actualiza `payments` y `enrollments`
7. Alumno obtiene acceso inmediato al curso
```

### Webhooks a implementar

```javascript
// Endpoint: POST /api/webhooks/woocommerce
// Eventos: order.created, order.completed, order.failed

// Endpoint: POST /api/webhooks/stripe
// Eventos: checkout.session.completed, payment_intent.succeeded
```

## Migracion futura a Stripe Directo

Cuando quieras migrar de WooCommerce a Stripe:

1. Configurar Stripe Connect o Stripe Checkout Session
2. Reemplazar `provider` en `payments` de `woocommerce` a `stripe`
3. Actualizar los webhooks en Stripe Dashboard
4. Los datos historicos de WooCommerce se conservan en Supabase

## Separacion de logica

Importante: **nunca mezclar logica de pagos con logica academica**.

- `payments` y `enrollments` son tablas separadas
- El acceso a contenido se valida contra `enrollments`, no contra `payments`
- Un alumno puede tener acceso sin pagar (cupon, promocion, manual)
- El estado de pago solo afecta a `enrollments` cuando el provider confirma
