/**
 * Módulo central de Meta Pixel para Qaway Lab.
 *
 * Punto único de emisión de eventos. Ningún componente debe llamar a
 * `window.fbq` directamente: así se garantiza el gate de consentimiento,
 * el nombre estándar del evento y los parámetros en un solo lugar.
 *
 * El código base (librería + PageView inicial) vive en `index.html`, dentro
 * de <head>, tal como especifica Meta. Este módulo NO carga la librería.
 *
 * Referencia oficial:
 * https://developers.facebook.com/docs/meta-pixel/get-started
 * https://developers.facebook.com/docs/meta-pixel/implementation/conversion-tracking
 */

/** ID canónico de Qaway Lab (único píxel válido del proyecto). */
export const META_PIXEL_ID = '1787532068936007'

/** Clave única de consentimiento, escrita por CookieBanner. */
const CONSENT_KEY = 'qaway_cookie_consent'

/** Cookies de identificación de Meta que deben limpiarse al revocar. */
const META_COOKIES = ['_fbp', '_fbc', 'fr']

/**
 * Consentimiento vigente.
 * Política acordada: carga por defecto (opt-out). Solo un rechazo explícito
 * del usuario detiene el píxel, sin importar su ubicación geográfica.
 */
export function hasConsent() {
  if (typeof window === 'undefined') return false
  try {
    return window.localStorage.getItem(CONSENT_KEY) !== 'declined'
  } catch {
    // Almacenamiento no disponible (modo privado estricto): carga por defecto.
    return true
  }
}

/**
 * Emisor interno. Encapsula las tres guardas: entorno, consentimiento y
 * disponibilidad de `fbq`. Si la librería aún no cargó, el stub de
 * `index.html` ya dejó `window.fbq` disponible como cola, así que la llamada
 * no se pierde.
 */
function emit(...args) {
  if (typeof window === 'undefined') return
  if (!hasConsent()) return
  if (typeof window.fbq !== 'function') return
  try {
    window.fbq(...args)
  } catch (error) {
    // Nunca romper la UI por analítica.
    console.warn('[metaPixel] No se pudo emitir el evento:', error)
  }
}

/**
 * PageView de navegación SPA. Se invoca en cada transición real de ruta,
 * nunca en el montaje inicial (de eso ya se encarga el código base).
 */
export function pageview() {
  emit('track', 'PageView')
}

/**
 * Evento estándar de Meta, con su nombre oficial estricto.
 * @param {string} eventName  Ej. 'Lead', 'Contact', 'Purchase'.
 * @param {object} [params]   Parámetros oficiales (content_name, value, currency...).
 */
export function trackStandard(eventName, params) {
  if (params && Object.keys(params).length > 0) {
    emit('track', eventName, params)
  } else {
    emit('track', eventName)
  }
}

/**
 * Evento `Lead`: el estándar oficial de Meta para formularios enviados
 * (presupuestos, cotizaciones, registros de prospecto).
 * @param {string} source        Origen legible del formulario -> `content_name`.
 * @param {object} [extraParams] Parámetros adicionales opcionales.
 */
export function trackLead(source, extraParams = {}) {
  trackStandard('Lead', { content_name: source, ...extraParams })
}

/**
 * Revoca el consentimiento en caliente: el usuario rechazó las cookies
 * opcionales DESPUÉS de que el píxel ya se hubiera cargado.
 *
 * Meta no documenta un `fbq('consent','revoke')`; su mecanismo oficial es
 * `dataProcessingOptions` (Limited Data Use, solo EE.UU.). Por eso la
 * revocación real consiste en detener la emisión de eventos (lo hace
 * `hasConsent()`) y eliminar los identificadores ya escritos.
 */
export function revokeMetaPixel() {
  if (typeof document === 'undefined' || typeof window === 'undefined') return
  const host = window.location.hostname
  const rootDomain = host.split('.').slice(-2).join('.')
  const domains = ['', host, `.${host}`, `.${rootDomain}`]

  META_COOKIES.forEach((name) => {
    domains.forEach((domain) => {
      const domainAttr = domain ? `; domain=${domain}` : ''
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttr}`
    })
  })
}
