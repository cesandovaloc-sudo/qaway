// Métodos de pago y camino de pago — fuente única de verdad del checkout.
//
// POR QUÉ EXISTE
// Antes cada método era solo una etiqueta: algunos no podían completarse y el
// comprador terminaba en un callejón sin salida (se registraba el pedido y la
// pantalla no decía qué hacer). Aquí cada método declara si está operativo y,
// cuando no lo está, por qué. El checkout muestra el aviso y la pantalla de
// confirmación explica el siguiente paso real.
//
// `operational: false` NO oculta el método: se muestra igual con su aviso, para
// que el comprador sepa que existe y qué alternativa tiene. Nunca se ofrece un
// método que no pueda completarse sin decirlo.
//
// Yape y Transferencia son manuales y SÍ funcionan: el siguiente paso es la
// coordinación por WhatsApp, que es el canal que el negocio ya usa.

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

export const PAYMENT_METHODS = [
  {
    id: 'mercadopago',
    label: 'Mercado Pago (Tarjetas, Yape, Cuotas)',
    description: 'Paga con tarjeta de crédito/débito en Soles (PEN), cuotas sin interés o saldo Mercado Pago.',
    operational: false,
    notice: 'Pasarela en habilitación. Si confirmas, registramos tu pedido y coordinamos el cobro por WhatsApp.',
  },
  {
    id: 'yape',
    label: 'Yape / Plin Directo',
    description: 'Escanea el código QR o Yapea al número oficial. Adjunta tu voucher.',
    operational: true,
  },
  {
    id: 'stripe',
    label: 'Tarjeta Internacional (Stripe)',
    description: 'Tarjeta de crédito o débito Visa, Mastercard o Amex en USD.',
    operational: false,
    notice: 'Pasarela en habilitación. Para pagos internacionales hoy coordinamos por WhatsApp.',
  },
  {
    id: 'directo',
    label: 'Transferencia bancaria / Pago Directo',
    description: 'Transferencia a nuestra cuenta BCP. Te enviamos los datos.',
    operational: true,
  },
]

export const DEFAULT_METHOD_ID = 'mercadopago'

export function findPaymentMethod(id) {
  return PAYMENT_METHODS.find((method) => method.id === id) || null
}

/**
 * Próximos pasos reales según el método elegido. Se renderizan en la pantalla
 * de confirmación: es lo que evita que el comprador quede sin saber qué hacer.
 */
export function paymentSteps(methodId) {
  const common = [
    {
      title: 'Pedido registrado',
      detail: 'Guardamos tu pedido con su código y el monto exacto a pagar.',
    },
    {
      title: 'Te enviamos la constancia',
      detail:
        'Te escribimos por WhatsApp al número que registraste para dejarte la constancia del pedido.',
    },
  ]

  if (methodId === 'yape' || methodId === 'directo') {
    return [
      {
        title: 'Transfiere o Yapea el monto exacto',
        detail: 'Usa los datos de la cuenta o el Yape que te mostramos. El monto ya quedó fijado.',
      },
      {
        title: 'Adjunta tu voucher',
        detail:
          'Súbelo en el checkout o envíalo por WhatsApp indicando el código del pedido, así lo ubicamos sin demora.',
      },
      {
        title: 'Confirmamos y arrancamos',
        detail: 'Al verificar el pago, tu pedido pasa a "Pagado" y comenzamos con la implementación.',
      },
    ]
  }

  if (methodId === 'stripe') {
    return [
      ...common,
      {
        title: 'Coordinamos el pago internacional',
        detail:
          'La pasarela de tarjeta internacional está en habilitación. Te contactamos para completar el pago en USD.',
      },
    ]
  }

  return [
    ...common,
    {
      title: 'Coordinamos el cobro en línea',
      detail:
        'La pasarela de Mercado Pago está en habilitación. Te escribimos por WhatsApp para completar el pago con tarjeta, Yape o cuotas, sin perder la prioridad de tu pedido.',
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
