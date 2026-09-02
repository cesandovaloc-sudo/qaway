export type PostStatus = 'borrador' | 'publicado' | 'archivado'

export interface Post {
  id: string
  title: string
  slug: string
  excerpt: string
  category: string
  tags?: string[]
  coverUrl: string
  coverAlt?: string
  headerLayout?: 'editorial-cta' | 'split' | 'banner' // Estilo de cabecera: Portada + CTA Lateral, 2 Columnas o Panorámica Superior
  headerCtaTag?: string
  headerCtaTitle?: string
  headerCtaDesc?: string
  headerCtaBtnText?: string
  headerCtaUrl?: string
  body: string // Texto plano fallback
  contentHtml?: string // Contenido formateado WYSIWYG
  contentJson?: string // Estructura JSON de nodos Tiptap
  readingTime?: number // Minutos estimados de lectura
  author?: {
    name: string
    avatar?: string
    role?: string
  }
  status: PostStatus
  createdAt: string
  updatedAt: string
  publishedAt?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
}

export type LeadFormType = 'inline' | 'popup' | 'slide-in' | 'top-banner'

export interface LeadFormData {
  type: LeadFormType
  title: string
  description?: string
  buttonText: string
  successMessage?: string
  downloadUrl?: string
  themeColor?: string
  textColor?: string
  fields: {
    name: boolean
    email: boolean
    phone: boolean
    company?: boolean
  }
  triggerScrollPercent?: number
  triggerDelaySeconds?: number
}
