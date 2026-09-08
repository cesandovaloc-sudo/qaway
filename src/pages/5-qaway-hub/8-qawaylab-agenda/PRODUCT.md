# Product

<!-- impeccable:product-schema 1 -->

## Platform

web (responsive móvil primero; candidata a PWA por uso frecuente desde el celular)

## Users

Dos perfiles:

- Negocios locales (barberías, consultorios, estéticas, abogados, coaches, talleres): necesitan recibir reservas sin llamadas ni cadenas de WhatsApp.
- Clientes finales: reservan en línea viendo horarios libres en su zona horaria, sin registrarse.

## Product Purpose

Que un negocio comparta un link y sus clientes reserven al instante, con confirmación y recordatorios automáticos (email y WhatsApp). Éxito = reservas creadas sin fricción + cero dobles reservas + pagos opcionales cobrados en línea.

## Positioning

Multi-negocio con aislamiento real de datos (RLS): cada cliente tiene su propia base sin compartir información. Cobro opcional por servicio (Stripe) integrado al flujo de reserva.

## Operating Context

Flujo público (link del negocio): selección de servicio, calendario con disponibilidad real, hora, datos del cliente, confirmación. Flujo de gestión (panel): login, disponibilidad semanal, servicios/eventos, agenda de citas, link de reserva para compartir.

## Capabilities and Constraints

- Constraint: el negocio no necesita cuenta pública para el cliente; el cliente nunca ve el panel.
- Stack: React 19 + Vite 8 + TypeScript + Tailwind v4, Supabase (Auth + Postgres + RLS), Stripe opcional, recordatorios por Edge Function (Resend + WhatsApp).
- Constraint de diseño: identidad white-label configurable (VITE_APP_NAME), lista para revender sin acoplar a Qaway Lab.
- Cancelación/reprogramación vía token en email.

## Brand Commitments

- Cero doble reservas: la base de datos rechaza solapes a nivel atómico.
- Confirmación y recordatorios automáticos 24h y 1h antes.
- El negocio es dueño de sus datos (multi-tenant, RLS).
- Sin fricción para el cliente: sin registrarse, reserva en menos de 1 minuto.
