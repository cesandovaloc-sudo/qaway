export interface SiteConfig {
  siteUrl: string
  appUrl: string
  whatsapp: string | null
  phone: string | null
  cart: {
    /** URL externa opcional de la app de carrito (si algún día es remota) */
    appUrl: string | null
    /** true cuando el carrito (módulo @qawaylab/pago) está activo */
    enabled: boolean
  }
}

function readEnv(key: string): string {
  const value = import.meta.env[key]
  return typeof value === 'string' ? value.trim() : ''
}

export const siteConfig: SiteConfig = {
  siteUrl: readEnv('VITE_PUBLIC_SITE_URL') || window.location.origin,
  appUrl: readEnv('VITE_PUBLIC_APP_URL') || window.location.origin,
  whatsapp: readEnv('VITE_PUBLIC_WHATSAPP') || null,
  phone: readEnv('VITE_PUBLIC_PHONE') || null,
  cart: {
    appUrl: readEnv('VITE_CART_APP_URL') || null,
    enabled: readEnv('VITE_CART_ENABLED') === 'true' || Boolean(readEnv('VITE_CART_APP_URL')),
  },
}
