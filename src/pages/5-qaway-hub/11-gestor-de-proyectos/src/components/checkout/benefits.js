// Programa de beneficios de compra — fuente única de verdad de la sección
// "Beneficio de compra" del checkout.
//
// PLANTILLA REUTILIZABLE: otro servicio puede reemplazar BENEFIT_PLANS sin tocar
// el componente ni los estilos. La UI se adapta sola: la grilla reparte las
// tarjetas y la fila "Descuento" del resumen aparece únicamente cuando algún
// beneficio declara `discountPercent > 0`.
//
// Contrato de cada beneficio:
//   id               string   único; es el valor que se persiste en el pedido
//   label            string   título visible
//   description      string   explicación en una línea
//   tag              string   etiqueta corta de esquina
//   icon             string   clave del set en BenefitIcon
//   discountPercent  number   0 = sin efecto en el total (default honesto).
//                             > 0 descuenta de verdad y activa la fila Descuento.
//   appliesTo        'all' | string[]  slugs / skus / ids a los que aplica
//
// ---------------------------------------------------------------------------
// DOS ADVERTENCIAS QUE NO SE DEBEN ROMPER
//
// 1. IDs LEGADOS `discount` y `delivery`: son valores históricos ya persistidos
//    en `orders.shipping_address.promotion` y están fijados por los tests del
//    host Inventario (`10-qawaylab-inventario/src/components/__tests__/Checkout.test.tsx`).
//    No renombrar sin migrar datos y tests al mismo tiempo. Por eso cada
//    beneficio se persiste además con `promotionLabel`, que es el texto legible
//    y evita depender del id para entender un pedido viejo.
//
// 2. DESCUENTOS: `discountPercent` se aplica en el cliente solo para MOSTRAR el
//    total. Antes de cobrar, el backend debe recalcular el descuento y el monto
//    final. Nunca confiar en un total enviado por el navegador.
// ---------------------------------------------------------------------------

import { itemKey } from './storefront/utils.js'

/**
 * Beneficios activos.
 *
 * Para convertirlo en un descuento real en otro servicio basta con poner, por
 * ejemplo, `discountPercent: 10` en un beneficio: la fila "Descuento" aparece,
 * el total se recalcula y el monto se resta del pedido. Sin `discountPercent`,
 * el beneficio es operativo y no altera precios.
 */
export const BENEFIT_PLANS = [
  {
    id: 'discount',
    label: 'Acompañamiento 1:1',
    description:
      'Sesión de arranque con el equipo para definir alcance, entregables y cronograma antes de producir.',
    tag: 'Recomendado',
    icon: 'headset',
    discountPercent: 0,
    appliesTo: 'all',
  },
  {
    id: 'delivery',
    label: 'Soporte Prioritario',
    description:
      'Atención directa por WhatsApp con respuesta en menos de 2 horas durante toda la implementación.',
    tag: 'Sin costo',
    icon: 'bolt',
    discountPercent: 0,
    appliesTo: 'all',
  },
]

/** Aclaración mostrada bajo la grilla. */
export const BENEFIT_NOTE =
  'Los beneficios no son acumulables: se aplica el que elijas.'

function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100
}

function appliesToItem(benefit, item) {
  const scope = benefit?.appliesTo
  if (!scope || scope === 'all') return true
  if (!Array.isArray(scope)) return false

  const keys = [itemKey(item), item?.slug, item?.sku, item?.id, item?.product_id]
    .filter(Boolean)
    .map(String)

  return scope.some((candidate) => keys.includes(String(candidate)))
}

/**
 * Beneficios vigentes para el carrito actual. Con un carrito sin ítems se
 * devuelve el catálogo completo para que la sección nunca quede vacía.
 */
export function resolveBenefits(items = []) {
  const list = Array.isArray(items) ? items : []
  if (!list.length) return BENEFIT_PLANS.slice()
  return BENEFIT_PLANS.filter((benefit) =>
    list.some((item) => appliesToItem(benefit, item))
  )
}

export function findBenefit(id) {
  return BENEFIT_PLANS.find((benefit) => benefit.id === id) || null
}

/**
 * Totales del resumen. `discount` es 0 cuando ningún beneficio tiene
 * `discountPercent`, de modo que activar un descuento no exige tocar la UI.
 */
export function computeBenefitTotals(subtotal, benefit) {
  const base = Number.isFinite(subtotal) && subtotal > 0 ? subtotal : 0
  const percent = Number(benefit?.discountPercent) || 0
  const discount = percent > 0 ? round2(base * (percent / 100)) : 0

  return {
    subtotal: round2(base),
    discount,
    total: round2(base - discount),
    percent,
  }
}
