import { artificialPosts } from '../1-inteligencia-artificial/posts'
import { productividadPosts } from '../2-productividad/posts'
import { marketingPosts } from '../3-marketing/posts'
import { disenoPosts } from '../4-diseno/posts'
import { automatizacionPosts } from '../5-automatizacion/posts'

export const BLOG_CATEGORIES = [
  {
    slug: 'artificial',
    label: 'Artificial',
    path: '/blog/artificial',
    description: 'Ideas, herramientas y criterio aplicado para entender la IA mas alla del ruido.',
    icon: 'Sparkles',
  },
  {
    slug: 'productividad',
    label: 'Productividad',
    path: '/blog/productividad',
    description: 'Sistemas, habitos y recursos para trabajar con mas claridad y menos friccion.',
    icon: 'BookOpen',
  },
  {
    slug: 'marketing',
    label: 'Marketing',
    path: '/blog/marketing',
    description: 'Captacion, contenidos, CRM y decisiones comerciales conectadas a negocio real.',
    icon: 'TrendingUp',
  },
  {
    slug: 'diseno',
    label: 'Diseno',
    path: '/blog/diseno',
    description: 'Comunicacion visual, identidad y percepcion de marca con criterio digital.',
    icon: 'Target',
  },
  {
    slug: 'automatizacion',
    label: 'Automatizacion',
    path: '/blog/automatizacion',
    description: 'Workflows, integraciones y operaciones digitales que ahorran tiempo y errores.',
    icon: 'Cpu',
  },
]

const categoryMap = Object.fromEntries(BLOG_CATEGORIES.map((category) => [category.slug, category]))

export const blogPosts = [
  ...artificialPosts,
  ...productividadPosts,
  ...marketingPosts,
  ...disenoPosts,
  ...automatizacionPosts,
].map((post) => ({
  ...post,
  categoryLabel: categoryMap[post.category]?.label ?? post.category,
}))