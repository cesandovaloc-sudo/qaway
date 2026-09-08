export type ContentFormat = 'reel' | 'carrusel' | 'story' | 'post' | 'blog'

export type ContentStatus = 
  | 'idea' 
  | 'guion_aprobado' 
  | 'listo_grabar' 
  | 'en_edicion' 
  | 'programado' 
  | 'publicado'

export type PlatformTarget = 'instagram' | 'linkedin' | 'tiktok' | 'youtube' | 'blog_qaway'

// ==========================================
// ARQUITECTURA MULTI-TENANT (SAAS READY)
// ==========================================
export type SubscriptionTier = 'starter' | 'creator_pro' | 'agency_scale'

export interface TenantWorkspace {
  id: string
  name: string
  slug: string
  niche: string
  brandVoice: string
  logoUrl?: string
  tier: SubscriptionTier
  limits: {
    maxMonthlyPieces: number
    maxCompetitors: number
    maxLeadMagnets: number
    manyChatEnabled: boolean
  }
  currentMonthProgress: {
    planned: number
    recorded: number
    published: number
    targetMonth: string // ej: "Septiembre 2026"
  }
}

export interface CompetitorVideo {
  id: string
  tenantId: string
  creatorName: string
  handle: string
  avatarUrl?: string
  videoUrl: string
  title: string
  views: number
  saves: number
  shares: number
  hookText: string
  coreThesis: string
  format: ContentFormat
}

export interface ScriptItem {
  id: string
  tenantId: string
  title: string
  format: ContentFormat
  platform: PlatformTarget
  hook: {
    text: string
    variant: 'curiosidad' | 'resultado_especifico' | 'pregunta_abierta' | 'contrarian' | 'urgencia'
    durationSec: number
    wordCount: number
  }
  retentionBridge: string
  coreBody: string
  cta: {
    text: string
    triggerKeyword: string // ej. "SKILL", "AUDITORIA"
    leadMagnetName: string
  }
  descriptionCopy: string
  blogMeta?: {
    seoTitle: string
    metaDescription: string
    targetKeywords: string[]
    readingTimeMin: number
    contentMarkdown: string
  }
  postVisualText?: string
  status: ContentStatus
  scheduledDate?: string
  createdAt: string
  updatedAt: string
}

export interface MatrixVariant {
  id: string
  tenantId: string
  baseScriptId: string
  hookId: string
  hookText: string
  bodySummary: string
  ctaText: string
  status: ContentStatus
}

export interface CarouselSlide {
  id: string
  slideNumber: number
  type: 'portada' | 'contenido' | 'revelacion' | 'cta'
  title: string
  subtitle?: string
  bullets?: string[]
  codeSnippet?: string
  footerNote?: string
}

export interface CarouselDeck {
  id: string
  tenantId: string
  title: string
  niche: string
  slides: CarouselSlide[]
  theme: 'dark_qaway' | 'minimal_editorial' | 'high_contrast'
}

export interface LeadMagnetResource {
  id: string
  tenantId: string
  title: string
  category: string
  summary: string
  triggerKeyword: string
  targetFormat: 'checklist' | 'sop_markdown' | 'prompt_maestro' | 'guia_pdf'
  contentMarkdown: string
}

export interface CreatorTask {
  id: string
  tenantId: string
  title: string
  priority: 'alta' | 'media' | 'baja'
  type: 'grabar' | 'revisar' | 'manychat' | 'lead_magnet'
  dueDate: string
  completed: boolean
}
