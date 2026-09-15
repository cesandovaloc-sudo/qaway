// Métodos de pago y camino de pago — fuente única de verdad del checkout.
//
// POR QUÉ EXISTE
// Antes cada método era solo una etiqueta: algunos no podían completarse y el
// comprador terminaba en un callejón sin salida. Aquí cada método declara si
// está habilitado, cuál es su proveedor y cuál es el siguiente paso real.
//
// REGLA DE ORO (ver REGLAS-PAGOS-SEGUROS.md): nunca se ofrece un método que no
// pueda completarse sin decirlo. Los no habilitados se muestran con su aviso,
// pero NO son seleccionables.
//
// RECORTE DE MÉTODOS (decisión de producto 2026-09-14)
// Quedan 3, cada uno con una razón distinta:
//   1. Mercado Pago → tarjetas nacionales e internacionales + Yape + cuotas.
//   2. TAYPI        → QR interoperable (Yape, Plin y la app de cualquier banco).
//   3. Manual       → Yape / Plin / Transferencia + voucher. Respaldo siempre vivo.
// Se retiraron:
//   · "Tarjeta Internacional (Stripe)": Stripe no abre cuenta de comercio para
//     Perú (requiere empresa en EE.UU.) y Mercado Pago ya cubre lo internacional.
//   · "Yape / Plin Directo" y "Transferencia bancaria / Pago Directo": mostraban
//     EXACTAMENTE el mismo bloque de datos. Se unificaron en "manual".

/** Datos de cobro manual. Deben ser los reales del negocio. */
export const ACCOUNT_INFO = {
  bank: 'Banco de Crédito del Perú (BCP)',
  accountType: 'Cuenta de Ahorros',
  accountNumber: '191-78901234-0-55',
  cci: '002-191-0078901234055-52',
  holder: 'Qaway Lab E.I.R.L.',
  yape: '999 888 777',
}

/** Canal de coordinación usado en los próximos pasos del pedido. */
export const MANUAL_CONTACT = {
  whatsapp: '51930756781',
  label: 'Coordinar por WhatsApp',
  hours: 'Lun a Sáb, 9:00 a 19:00 (hora de Perú)',
}

/**
 * ORDEN POR FRICCIÓN Y USO REAL (decisión 2026-09-14)
 * El orden del array ES el orden en que se muestran: de menor a mayor fricción.
 * NO se reordena por estado de habilitación — eso invertía el ranking y ponía
 * arriba el método de mayor fricción.
 *
 *   1. QR (TAYPI)      → mínima fricción. Yape supera los 14 millones de
 *                        usuarios activos en Perú, más que las tarjetas activas
 *                        del país, y pagar con QR no exige escribir datos.
 *   2. Mercado Pago    → fricción media: tarjeta o redirección, pero habilita
 *                        cuotas e internacional.
 *   3. Manual          → MÁXIMA fricción: salir de la web, transferir, capturar
 *                        el voucher, subirlo y esperar verificación humana.
 *                        Por eso va último, como respaldo.
 *
 * Consecuencia asumida: mientras el QR y Mercado Pago estén "en habilitación",
 * los dos aparecen ARRIBA del manual con su aviso. Es el precio de respetar el
 * ranking; al habilitarlos el orden ya es el definitivo.
 */
export const PAYMENT_METHODS = [
  {
    id: 'taypi',
    provider: 'taypi',
    label: 'Pago con QR (Yape, Plin y tu banco)',
    description:
      'Escaneas un código QR con la app de tu banco, Yape o Plin. La confirmación es automática.',
    enabled: false,
    notice:
      'En habilitación: falta conectar la pasarela de QR. Mientras tanto puedes pagar por transferencia.',
  },
  {
    id: 'mercadopago',
    provider: 'mercadopago',
    label: 'Mercado Pago (Tarjetas, Yape, Cuotas)',
    description:
      'Tarjetas nacionales e internacionales, Yape y cuotas sin interés. El cobro se confirma automáticamente.',
    // Seleccionable para poder PROBAR la pasarela de verdad. Mientras el
    // deploy + los secretos no estén puestos, el comprador que la elija verá el
    // error, pero NO es el método por defecto: ese es siempre el manual (ver
    // `isDefault`), así que la ruta de compra nunca termina en un callejón.
    enabled: true,
    notice:
      'En habilitación: falta conectar la pasarela. Mientras tanto puedes pagar por Yape, Plin o transferencia.',
  },
  {
    id: 'manual',
    provider: 'manual',
    label: 'Yape / Plin / Transferencia',
    description:
      'Pagas desde tu app o por transferencia y nos envías el voucher. Verificamos y arrancamos.',
    enabled: true,
    // Este es SIEMPRE el método preseleccionado: es el único que cierra la
    // compra sin depender de una pasarela externa.
    isDefault: true,
    // Datos de cobro declarados por el método: el checkout NO decide por id.
    showAccounts: true,
  },
]

/**
 * Método que se selecciona al abrir el checkout.
 *
 * Se marca explícitamente con `isDefault` en vez de "el primero habilitado":
 * así una pasarela puede estar SELECCIONABLE (para probarla) sin convertirse
 * en el método por defecto y dejar al comprador en un callejón sin salida.
 * Si no hay ninguno marcado, cae al primero habilitado.
 */
export function firstEnabledMethod() {
  return (
    PAYMENT_METHODS.find((method) => method.isDefault && method.enabled) ??
    PAYMENT_METHODS.find((method) => method.enabled) ??
    PAYMENT_METHODS[0] ??
    null
  )
}

export function findPaymentMethod(id) {
  return PAYMENT_METHODS.find((method) => method.id === id) || null
}

/**
 * Próximos pasos reales según el método elegido. Se renderizan en la pantalla
 * de confirmación: es lo que evita que el comprador quede sin saber qué hacer.
 */
export function paymentSteps(methodId) {
  if (methodId === 'manual') {
    return [
      {
        title: 'Transfiere o Yapea el monto exacto',
        detail: 'Usa el Yape, la cuenta o el CCI que te mostramos. El monto ya quedó fijado.',
      },
      {
        title: 'Envíanos el voucher',
        detail:
          'Súbelo en el checkout o mándalo por WhatsApp indicando el código del pedido, así lo ubicamos sin demora.',
      },
      {
        title: 'Confirmamos y arrancamos',
        detail: 'Al verificar el pago, tu pedido pasa a "Pagado" y comenzamos con la implementación.',
      },
    ]
  }

  if (methodId === 'taypi') {
    return [
      {
        title: 'Escanea el código QR',
        detail: 'Ábrelo con la app de tu banco, Yape o Plin. El monto ya viene cargado.',
      },
      {
        title: 'La confirmación es automática',
        detail: 'En cuanto pagas, la pasarela nos avisa y tu pedido se marca como pagado.',
      },
      {
        title: 'Empezamos',
        detail: 'Te escribimos por WhatsApp para coordinar el arranque de la implementación.',
      },
    ]
  }

  if (methodId === 'mercadopago') {
    return [
      {
        title: 'Pago seguro en Mercado Pago',
        detail: 'Completas tu pago con tarjeta, Yape o cuotas en la pasarela oficial.',
      },
      {
        title: 'Confirmación instantánea',
        detail: 'En cuanto Mercado Pago confirma la operación, tu pedido pasa a Pagado automáticamente.',
      },
      {
        title: 'Coordinación inmediata',
        detail: 'Te contactamos por WhatsApp para iniciar el desarrollo de tu proyecto.',
      },
    ]
  }

  return [
    {
      title: 'Pedido registrado',
      detail: 'Guardamos tu pedido con su código y el monto exacto a pagar.',
    },
    {
      title: 'Te enviamos la constancia',
      detail:
        'Te escribimos por WhatsApp al número que registraste para dejarte la constancia del pedido.',
    },
    {
      title: 'Coordinación de pedido',
      detail:
        'Te escribimos por WhatsApp para completar los detalles de tu pedido sin perder la prioridad.',
    },
  ]
}

/** Enlace de WhatsApp con el pedido y el monto ya redactados. */
export function whatsappOrderLink({ code, amount, currencyLabel = 'S/', intent = 'pago' }) {
  const text =
    intent === 'voucher'
      ? `Hola Qaway Lab, adjunto el voucher del pedido #${code} por ${currencyLabel} ${amount}. Quiero confirmar mi pago.`
      : `Hola Qaway Lab, acabo de registrar el pedido #${code} por ${currencyLabel} ${amount}. Quiero completar el pago.`
  return `https://wa.me/${MANUAL_CONTACT.whatsapp}?text=${encodeURIComponent(text)}`
}
