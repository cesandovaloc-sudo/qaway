const SITE_MODE = import.meta.env.MODE || 'development'

export const isPublicSiteMode = SITE_MODE === 'public'

export const routeVisibility = {
  inicio: true,
  estudio: true,
  proyectos: true,
  brief: false,
  sistemasDigitales: true,
  academy: false,
  hub: true,
  recursos: true,
  blog: true,
  landings: true,
  auth: true,
  pruebas: false,
}

const publicPathAllowList = new Set([
  '/',
  '/blog',
  '/blog/articulo/habilidades-clave-para-trabajar-con-ia-guia-practica',
  '/editor/:id',
  '/editor/new',
  '/estudio',
  '/hub',
  '/hub/blog-editor',
  '/hub/blog-editor/editor/:id',
  '/hub/optimizador-webp',
  '/landings/desarrollo-web',
  '/login',
  '/portal/:slug',
  '/proyectos',
  '/proyectos/aurea-skincare',
  '/proyectos/panaderia-josue',
  '/proyectos/vallet',
  '/proyectos/vallet/propiedad/departamento-miraflores',
  '/proyectos/vallet/propiedades',
  '/recursos',
  '/recursos/optimizador-imagenes-webp',
  '/recursos/primeros-flujos-ia',
  '/sistemas-digitales',
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
  if (publicPathAllowList.has(normalizedPath) || normalizedPath.startsWith('/recursos')) return true

  for (const allowed of publicPathAllowList) {
    if (allowed.includes(':')) {
      const pattern = '^' + allowed.replace(/:[a-zA-Z0-9_]+/g, '[^/]+') + '$'
      if (new RegExp(pattern).test(normalizedPath)) return true
    }
  }
  return false
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

