# Product

<!-- impeccable:product-schema 1 -->

## Platform

Módulo embebible (npm package) para cualquier web Vite/React + demo de referencia. Tema claro editorial listo para insertarse en webs de clientes.

## Users

Dos perfiles:

- Negocios que venden digital o físico: cursos, plantillas, membresías, productos. Integran el checkout en su web existente.
- Compradores finales: completan datos de contacto y eligen método de pago (Mercado Pago, Yape/Plin con voucher, Stripe, transferencia).

## Product Purpose

Que cualquier web tenga checkout, historial de compras y panel de pagos sin construir nada. Éxito = pedido registrado con datos correctos, voucher adjunto (si aplica) y pago trazable.

## Positioning

Módulo reutilizable desacoplado: componentes (Checkout, PurchaseHistory, PaymentsPanel, ProductsManager) + capa de servicios intercambiables (adaptadores). Multi-método de pago para Perú y LATAM. No es una pasarela: orquesta pasarelas y métodos manuales.

## Operating Context

Flujo de compra: catálogo → ficha de producto → carrito → checkout (datos + método de pago) → pedido registrado con instrucciones de pago. Historial de compras por usuario. Panel admin: pagos recibidos y gestión de productos.

## Capabilities and Constraints

- Constraint: módulo embebible, no una app standalone; el CSS del host debe poder convivir (clases prefijadas, variables CSS propias).
- Constraint: los montos siempre en mono y con símbolo de moneda explícito; cero ambigüedad en datos de transferencia.
- Stack demo: React 18 + Vite + react-router + Supabase (mock en demo). El módulo funciona con cualquier supabase client.
- Constraint de diseño: identidad white-label (nombre del negocio desde configuración), lista para revender.
- Soporta: Mercado Pago (PEN), Yape/Plin con voucher, Stripe (USD), transferencia bancaria.

## Brand Commitments

- El comprador siempre sabe exactamente a dónde y cuánto pagar.
- El voucher queda adjunto y trazable en el pedido.
- El módulo se integra sin reescribir la web del cliente.
- Datos de pago aislados por organización (RLS).
