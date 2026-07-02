const SITE_MODE = import.meta.env.MODE || 'development'

export const isPublicSiteMode = SITE_MODE === 'public'

const routeVisibility = {
  inicio: true,
  estudio: true,
  brief: false,
  sistemasDigitales: false,
  academy: false,
  hub: false,
  recursos: false,
  blog: false,
  landings: false,
  auth: false,
  pruebas: false,
}

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
]

export function isRouteEnabled(routeKey) {
  if (!isPublicSiteMode) return true
  return Boolean(routeVisibility[routeKey])
}

function isLinkVisible(link) {
  return isRouteEnabled(link.key)
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