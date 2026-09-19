export interface CatalogOffer {
  id: string
  title: string
  priceDisplay: string
  checkoutUrl?: string
}

/**
 * Consulta de ofertas comerciales activas
 */
export function getActiveOffers(): CatalogOffer[] {
  return [
    {
      id: 'offer-notion-pro',
      title: 'Sistema Operativo Notion Pro Enterprise',
      priceDisplay: 'S/ 49 o $15 USD',
      checkoutUrl: '/carrito/checkout'
    },
    {
      id: 'offer-waba-crm',
      title: 'Comercio Conversacional WhatsApp CRM WABA',
      priceDisplay: 'Desde $49 USD/mes'
    },
    {
      id: 'offer-custom-saas',
      title: 'Desarrollo Web & SaaS a Medida',
      priceDisplay: 'Sujeto a alcance tras diagnóstico técnico'
    }
  ]
}
