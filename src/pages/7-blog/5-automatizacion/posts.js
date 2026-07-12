export const automatizacionPosts = [
  {
    slug: 'como-automatizar-facturacion-make-chatgpt',
    category: 'automatizacion',
    formatLabel: 'Tutorial',
    title: 'Como estructurar una facturacion automatica con Make y ChatGPT',
    excerpt:
      'Automatiza la generacion de facturas, almacenamiento de PDFs y envio por correo sin mover un solo dedo.',
    featured: true,
    publishedAt: '2026-06-04',
    readTime: '5 min',
    coverImage:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
    keywords: ['make', 'chatgpt', 'facturacion', 'automatizacion', 'pdf'],
    blocks: [
      {
        type: 'paragraph',
        content:
          'Automatizar tareas repetitivas suele ser una de las inversiones mas rentables cuando aplicas IA al negocio. Un flujo bien disenado puede recibir datos de venta, estructurar la factura, generar el PDF y enviarlo sin intervencion manual.',
      },
      {
        type: 'subheading',
        content: 'El workflow en 3 pasos clave',
      },
      {
        type: 'list',
        items: [
          'Trigger: detectar una nueva compra desde Stripe, WooCommerce u otra fuente.',
          'Procesamiento: usar IA para validar datos, formatear conceptos y estructurar informacion fiscal.',
          'Salida: generar el PDF final y enviarlo automaticamente por correo.',
        ],
      },
      {
        type: 'paragraph',
        content:
          'Bien montado, este sistema reduce errores de facturacion y libera tiempo operativo para tareas de mayor valor.',
      },
    ],
  },
]