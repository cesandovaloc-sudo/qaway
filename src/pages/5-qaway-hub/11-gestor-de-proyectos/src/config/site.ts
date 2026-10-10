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

/**
 * N-05 (run-2 · inventario.bundle.computed-env-embeds-unrequested-vars):
 * el acceso computado `import.meta.env[key]` impedía la sustitución estática
 * de Vite y serializaba el objeto env COMPLETO en el bundle (observado en
 * dist/assets/CheckoutPage-*.js con claves anon y refs de proyecto que este
 * módulo nunca pide). Con acceso punteado estático, Vite reemplaza cada
 * `import.meta.env.VITE_X` por su literal (o undefined) y el bundle solo
 * contiene las variables realmente solicitadas.
 *
 * REGLA: nunca reintroducir acceso computado ni desestructurar import.meta.env.
 */
function trimEnv(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

export const siteConfig: SiteConfig = {
  siteUrl: trimEnv(import.meta.env.VITE_PUBLIC_SITE_URL) || window.location.origin,
  appUrl: trimEnv(import.meta.env.VITE_PUBLIC_APP_URL) || window.location.origin,
  whatsapp: trimEnv(import.meta.env.VITE_PUBLIC_WHATSAPP) || null,
  phone: trimEnv(import.meta.env.VITE_PUBLIC_PHONE) || null,
  cart: {
    appUrl: trimEnv(import.meta.env.VITE_CART_APP_URL) || null,
    enabled:
      trimEnv(import.meta.env.VITE_CART_ENABLED) === 'true' ||
      Boolean(trimEnv(import.meta.env.VITE_CART_APP_URL)),
  },
}
