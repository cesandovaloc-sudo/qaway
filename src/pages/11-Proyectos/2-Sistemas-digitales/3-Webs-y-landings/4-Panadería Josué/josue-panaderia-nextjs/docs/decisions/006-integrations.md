# Decisión

## Contexto

El sitio integra WhatsApp mediante enlaces `wa.me`. El estándar exige capa de adaptadores para que ningún componente visual dependa de un proveedor concreto, y preparar la base para Supabase/CRM/agenda futuros.

## Opción elegida

**Centralizar las integraciones en `data/site.ts` (`whatsappUrl`) y mantener la separación Componente → dato → proveedor.** Los botones consumen la función central; ningún componente construye URLs manualmente.

## Razón

- Permite cambiar número, mensaje o proveedor (WhatsApp API, negocio) sin tocar componentes.
- Alinea con la regla: ningún componente visual consulta Supabase directamente.
- Sin Supabase todavía, no se instalan dependencias innecesarias (criterio del estándar).

## Alternativas

- Instalar `@supabase/supabase-js` ahora: descartado, no hay backend actual.
- Integración WhatsApp API: fuera de alcance, requiere backend.

## Impacto

- Mínimo: solo centralización de URLs y mensajes.
- La base queda lista para añadir adaptadores cuando exista backend.

## Mitigación

- Documentar en `docs/INTEGRATIONS.md` el mapa de futuras integraciones.

## Fecha

2026-08-07

## Estado

Aceptado
