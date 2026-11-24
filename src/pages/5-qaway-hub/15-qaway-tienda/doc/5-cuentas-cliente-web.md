# Cuentas de cliente web (futuro)

**Estado:** Pendiente / documentado para después.  
**Prioridad actual:** primero validar que los tenants puedan subir productos a un nuevo tenant y que el flujo tienda funcione.  
**Fecha:** 2026-11-24

## Objetivo

Definir más adelante cómo un cliente final de la tienda web podrá crear cuenta y consultar sus compras, sin romper el checkout actual.

## Decisión recomendada

Usar modelo **híbrido**:

- **Compra como invitado:** sigue disponible. El cliente puede comprar sin registrarse.
- **Cuenta opcional:** el cliente puede crear cuenta si quiere ver historial, guardar datos y facilitar recompras.

**No recomendado por ahora:** obligar registro antes de comprar (modelo tipo Falabella obligatorio), porque puede aumentar abandono.

## MVP sugerido (cuando se retome)

1. **Registro / inicio de sesión de cliente web** separado del acceso admin/hub.
2. **Mi cuenta** con:
   - Mis pedidos
   - Mis datos
   - Mis direcciones
3. **Checkout invitado intacto** (no romper flujo actual).
4. **Vinculación segura de pedidos invitado** a una cuenta, solo con verificación clara (correo/teléfono confirmado). No mezclar datos sin verificación.
5. **Privacidad/RLS**: cada cliente solo ve sus propios datos y pedidos.

## Dejar para después (no MVP)

- Favoritos / wishlist.
- Repetir pedido.
- Beneficios/fidelización avanzada.
- Forzar cuenta obligatoria.

## Auditoría previa obligatoria (antes de implementar)

No crear tablas nuevas sin revisar lo existente. Auditar primero:

- `orders`, `order_items`/detalle de pedido, `payments`.
- Tablas de clientes existentes en inventario (`customers`/fiscal u otras relacionadas).
- Campos de tenant, correo, teléfono, usuario/auth y relación con pedidos invitados.
- Políticas RLS actuales: hoy hay flujos públicos/invitado; cualquier cuenta cliente debe cerrarse bien por propietario.

## Impacto esperado

- **Tienda web (`15-qaway-tienda`)**: UI de cuenta, login/registro cliente, “Mi cuenta”, historial.
- **Inventario/carrito/checkout (`10-qawaylab-inventario`)**: checkout ya existe; revisar asociación pedido-usuario, compras, y compatibilidad invitado.
- **Supabase/DB**: solo después de auditoría; posibles tablas de perfil/direcciones cliente o adaptación de existentes. Cambios de esquema/RLS con revisión cuidadosa.

## Criterio de aceptación futuro

- Un cliente puede comprar como invitado igual que hoy.
- Un cliente puede crear cuenta opcional.
- Un cliente autenticado ve solo sus pedidos/datos.
- No se duplican tablas/conceptos si ya existen en inventario.
- El flujo actual de tenants, productos y checkout no se rompe.
