const SITE_MODE = import.meta.env.MODE || 'development'

export const isPublicSiteMode = SITE_MODE === 'public'

const routeVisibility = {
  inicio: true,
  estudio: true,
  proyectos: true,
  brief: false,
  sistemasDigitales: true,
  academy: true,
  hub: false,
  recursos: false,
  blog: false,
  landings: true,
  auth: false,
  pruebas: false,
}

const publicPathAllowList = new Set([
  '/',
  '/estudio',
  '/proyectos',
  '/proyectos/horizonte',
  '/sistemas-digitales',
  '/landings/sistema-contenido-notion',
  '/landings/identidad-visual',
  '/landings/desarrollo-web',
  '/landings/desarrollo-web-superpower',
  '/landings/hostinger',
  '/landings/desarrollo-web-hostinger',
  '/landings/desarrollo-web-qaway',
  '/academy',
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
  return publicPathAllowList.has(normalizedPath)
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

