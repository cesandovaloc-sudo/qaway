const SITE_MODE = import.meta.env.MODE || 'development'

export const isPublicSiteMode = SITE_MODE === 'public'

const routeVisibility = {
  inicio: true,
  estudio: false,
  proyectos: true,
  brief: false,
  sistemasDigitales: false,
  academy: false,
  hub: true,
  recursos: true,
  blog: true,
  landings: true,
  auth: false,
  pruebas: false,
}

const publicPathAllowList = new Set([
  '/',
  '/proyectos',
  '/landings/desarrollo-web',
  '/blog',
  '/blog/articulo/habilidades-clave-para-trabajar-con-ia-guia-practica',
  '/recursos',
  '/recursos/primeros-flujos-ia',
  '/recursos/optimizador-imagenes-webp',
  '/recursos/optimizador-webp',
  '/recursos/ebooks/google-calendar-dominado',
  '/hub',
  '/hub/optimizador-webp',
  '/hub/marketing',
  '/hub/marketing2',
])

const navigationRegistry = [
  {
    key: 'estudio',
    label: 'Estudio',
    path: '/estudio',
    navbar: true,
    footerGroup: 'areas',
  },
  {
    key: 'sistemasDigitales',
    label: 'Sistemas digitales',
    path: '/sistemas-digitales',
    navbar: true,
    footerGroup: 'areas',
  },
  {
    key: 'academy',
    label: 'Academy',
    path: '/academy',
    navbar: true,
    footerGroup: 'areas',
  },
  {
    key: 'hub',
    label: 'Qaway Hub',
    path: '/hub',
    navbar: true,
    footerGroup: 'areas',
  },
  {
    key: 'recursos',
    label: 'Recursos',
    path: '/recursos',
    navbar: true,
    footerGroup: 'resources',
  },
  {
    key: 'blog',
    label: 'Blog',
    path: '/blog',
    navbar: true,
    footerGroup: 'resources',
  },
  {
    key: 'proyectos',
    label: 'Proyectos',
    path: '/proyectos',
    navbar: true,
    footerGroup: 'areas',
  },
]

export function isRouteEnabled(routeKey) {
  if (!isPublicSiteMode) return true
  return Boolean(routeVisibility[routeKey])
}

export function isPublicPathAllowed(pathname) {
  if (!isPublicSiteMode) return true
  const normalizedPath = pathname === '/' ? '/' : pathname.replace(/\/$/, '')
  return publicPathAllowList.has(normalizedPath) || normalizedPath.startsWith('/recursos')
}

function isLinkVisible(link) {
  return isRouteEnabled(link.key) && isPublicPathAllowed(link.path)
}

export function getNavbarLinks() {
  return navigationRegistry.filter((link) => link.navbar && isLinkVisible(link))
}

export function getFooterLinks(group) {
  return navigationRegistry.filter(
    (link) => link.footerGroup === group && isLinkVisible(link)
  )
}

export const publicRouteKeys = new Set(
  Object.entries(routeVisibility)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key)
)

export const publicPaths = Array.from(publicPathAllowList)

