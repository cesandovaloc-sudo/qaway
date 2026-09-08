# Decisión 007 — Producto modular vendible (inventario + catálogo + carrito/pagos)

## Contexto

Qaway Lab mantiene `10-qawaylab-inventario` (inventario + catálogo de liquidación) y
`3-qawaylab-pagos` (módulo `@qawaylab/pago`: carrito + checkout + historial + admin
de pagos). Los clientes piden combinaciones distintas:

```text
solo carrito
carrito + catálogo
inventario + carrito
inventario + catálogo + carrito
```

Hoy son dos repositorios independientes. Se necesita un único producto capaz de
vender **módulos** de forma desacoplada, sin reconstruir la interfaz por cliente.

## Opción elegida

Un único producto con **módulos conmutables por configuración**, no ramas ni
copias. La base es esta app (inventario) y el carrito/pagos se integra como
módulo (contrato commerce v1 + adaptador), sin acoplarse.

Arquitectura objetivo:

```text
App (inventario) ── panel admin ── inventario (siempre en admin)
      │
      └── módulo catálogo público  (/remates/:slug)      [opcional]
      └── módulo carrito + checkout (módulo @qawaylab/pago) [opcional]
           │
           └── contrato commerce v1 (contracts/commerce/)
           └── adaptador (services/adapters/commerceAdapter.ts)
```

Activación por configuración (env o flag de despliegue), de forma que un mismo
build sirva a cualquier combinación de módulos.

## Razón

- El estándar §37/§39 exige aplicaciones revendibles, autónomas y desacopladas.
- El contrato commerce v1 ya fija el shape de datos entre ambas apps (§48).
- El adaptador permite sustituir el proveedor de pagos sin tocar componentes (§49).
- Un solo build configurable evita mantener N variantes del mismo producto.

## Alternativas

1. **Apps separadas que se enlazan por URL** — rechazada: fragmenta UX (login, carrito,
   catálogo) y duplica infraestructura.
2. **Copias del repo por cliente** — rechazada: insostenible para actualizaciones.
3. **Monorepo multi-paquete** — viable a futuro si crece el número de módulos;
   hoy se conservan los dos repos con el contrato como frontera.

## Impacto

- La UI pública de esta app debe quedar lista para consumir el módulo de carrito
  (ruta `/carrito` + botón "Agregar al carrito" gated por `siteConfig.cart.enabled`).
- El módulo `@qawaylab/pago` debe alinearse a React 19 para instalarse sin fricción.
- El contrato commerce v1 es el contrato de venta entre módulos: no debe romperse
  sin bump de versión.

## Mitigación

- Validar cada combinación de módulos en el smoke test.
- El contrato se versiona (v1) y se valida en runtime.
- Los módulos se documentan en PRODUCT.md como activables por configuración.

## Fecha

2026-08-12

## Estado

Aprobado (dirección). Implementación por etapas: actualización de dependencias →
acople del carrito → activación por configuración.

### Avance 2026-08-12 — método A elegido e implementado

- Se eligió **A: instalar como dependencia local** (`file:../3-qawaylab-pagos`), validado
  en el demo del módulo. La web (1-qawaylab-web) NO consume el módulo hoy (sin dependencia
  ni paquete instalado); el módulo queda libre para usarse en inventario y después en web.
- Implementado: módulo instalado, `preserveSymlinks`, `/carrito` con `<Checkout>`, botón
  de carrito en catálogo público (flag `VITE_CART_ENABLED`), carrito localStorage validado
  con contrato v1. Validado (typecheck/lint/tests/build/smoke).
- Pendiente: schema.sql del módulo en Supabase, claves de pago, bucket storage, y decidir
  si la piel del storefront se mueve al módulo (evitar duplicar estilos).
