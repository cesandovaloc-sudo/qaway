import { BLOG_CATEGORIES, blogPosts } from './blog.data'

const CATEGORY_ALIASES = {
  artificial: 'artificial',
  'inteligencia-artificial': 'artificial',
  productividad: 'productividad',
  marketing: 'marketing',
  diseno: 'diseno',
  'diseno-branding': 'diseno',
  automatizacion: 'automatizacion',
}

const normalizeText = (value) => value?.toString().trim().toLowerCase() ?? ''

const extractBlockText = (block) => {
  if (!block) return ''
  if (block.type === 'list') return block.items.join(' ')
  return block.content ?? ''
}

export function normalizeCategorySlug(category) {
  return CATEGORY_ALIASES[normalizeText(category)] ?? null
}

export function getSortedPosts(posts = blogPosts) {
  return [...posts].sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
}

export function getCategoryBySlug(category) {
  const normalized = normalizeCategorySlug(category)
  return BLOG_CATEGORIES.find((item) => item.slug === normalized) ?? null
}

export function getPostBySlug(slug) {
  return getSortedPosts().find((post) => post.slug === slug) ?? null
}

export function getFeaturedPosts() {
  return getSortedPosts().filter((post) => post.featured)
}

export function getSecondaryPosts() {
  return getSortedPosts().filter((post) => !post.featured)
}

export function filterPosts({ category = null, query = '' } = {}) {
  const normalizedCategory = normalizeCategorySlug(category)
  const normalizedQuery = normalizeText(query)

  return getSortedPosts().filter((post) => {
    const matchesCategory = normalizedCategory ? post.category === normalizedCategory : true
    const searchableText = [
      post.title,
      post.excerpt,
      post.categoryLabel,
      post.formatLabel,
      ...(post.keywords ?? []),
      ...post.blocks.map(extractBlockText),
    ]
      .join(' ')
      .toLowerCase()

    const matchesQuery = normalizedQuery ? searchableText.includes(normalizedQuery) : true
    return matchesCategory && matchesQuery
  })
}

export function getRelatedPosts(currentSlug, limit = 3) {
  const currentPost = getPostBySlug(currentSlug)
  if (!currentPost) return []

  return getSortedPosts()
    .filter((post) => post.slug !== currentSlug)
    .sort((a, b) => {
      const sameCategoryA = a.category === currentPost.category ? 1 : 0
      const sameCategoryB = b.category === currentPost.category ? 1 : 0
      return sameCategoryB - sameCategoryA
    })
    .slice(0, limit)
}

export function getSuggestionsByTerm(term, limit = 4) {
  const normalizedTerm = normalizeText(term)
  if (!normalizedTerm) return []

  return getSortedPosts()
    .filter((post) => {
      const searchable = [post.title, ...(post.keywords ?? []), post.excerpt].join(' ').toLowerCase()
      return searchable.includes(normalizedTerm)
    })
    .slice(0, limit)
}

export function formatBlogDate(date, locale = 'es-PE') {
  return new Date(date).toLocaleDateString(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}