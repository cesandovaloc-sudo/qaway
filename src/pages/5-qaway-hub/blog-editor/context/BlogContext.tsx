import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import type { Post, PostStatus, Category } from '../types'
import { getSupabaseClient, isSupabaseConfigured } from '../services/supabaseClient'
import { idbGet, idbSet } from '../services/idbStorage'

const STORAGE_KEY_POSTS = 'qaway_blog_posts_v3'
const STORAGE_KEY_CATEGORIES = 'qaway_blog_categories_v3'

// 5 Categorías Oficiales de Qaway Lab Blog
const initialCategories: Category[] = [
  { id: 'cat-ia', name: 'I. Artificial', slug: 'i-artificial', color: '#16a34a' },
  { id: 'cat-prod', name: 'Productividad', slug: 'productividad', color: '#0284c7' },
  { id: 'cat-mkt', name: 'Marketing', slug: 'marketing', color: '#dc2626' },
  { id: 'cat-design', name: 'Diseño', slug: 'diseno', color: '#db2777' },
  { id: 'cat-auto', name: 'Automatización', slug: 'automatizacion', color: '#ea580c' },
]

const initialPosts: Post[] = []

export type SyncState = 'local' | 'synced' | 'syncing' | 'error'

interface BlogContextValue {
  posts: Post[]
  categories: Category[]
  syncState: SyncState
  isCloudConnected: boolean
  getPost: (id: string) => Post | undefined
  savePost: (post: Partial<Post> & { title: string }) => Promise<Post>
  deletePost: (id: string) => Promise<void>
  setStatus: (id: string, status: PostStatus) => Promise<void>
  addCategory: (name: string) => Promise<Category>
}

const BlogContext = createContext<BlogContextValue | null>(null)

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

export function BlogProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSTS)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Error leyendo posts locales:', e)
    }
    return initialPosts
  })

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES)
      if (saved) return JSON.parse(saved)
    } catch (e) {
      console.error('Error leyendo categorías locales:', e)
    }
    return initialCategories
  })

  const [syncState, setSyncState] = useState<SyncState>(() =>
    isSupabaseConfigured() ? 'synced' : 'local'
  )
  const isCloudConnected = isSupabaseConfigured()

  // Carga complementaria garantizada desde IndexedDB (Sin límites de 5MB)
  useEffect(() => {
    idbGet<Post[]>(STORAGE_KEY_POSTS).then(idbPosts => {
      if (idbPosts && Array.isArray(idbPosts) && idbPosts.length > 0) {
        setPosts(prev => {
          const map = new Map<string, Post>()
          prev.forEach(p => map.set(p.id, p))
          idbPosts.forEach(p => {
            const existing = map.get(p.id)
            if (!existing || new Date(p.updatedAt).getTime() >= new Date(existing.updatedAt).getTime()) {
              map.set(p.id, p)
            }
          })
          return Array.from(map.values())
        })
      }
    })
  }, [])

  // Guardar en IndexedDB y localStorage ante cualquier cambio
  useEffect(() => {
    idbSet(STORAGE_KEY_POSTS, posts)
    try {
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(posts))
    } catch (e) {
      console.debug('Storage size warning (IndexedDB activo):', e)
    }
  }, [posts])

  useEffect(() => {
    idbSet(STORAGE_KEY_CATEGORIES, categories)
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories))
    } catch (e) {
      console.debug('Categories storage warning:', e)
    }
  }, [categories])

  // Cargar datos remotos desde Supabase (Posts y Categorías)
  useEffect(() => {
    const supabase = getSupabaseClient()
    if (!supabase) return

    let isMounted = true
    async function loadFromSupabase() {
      setSyncState('syncing')
      try {
        // 1. Cargar Posts
        const { data: postsData, error: postsError } = await supabase!
          .from('posts')
          .select('*')
          .order('updated_at', { ascending: false })

        if (postsError) throw postsError
        if (isMounted) {
          const remotePosts: Post[] = (postsData || []).map((d: any) => {
            const meta = (typeof d.content_json === 'object' && d.content_json !== null)
              ? d.content_json.metadata || {}
              : {}
            return {
              id: d.id,
              title: d.title,
              slug: d.slug,
              excerpt: d.excerpt || '',
              category: d.category || 'General',
              coverUrl: d.cover_url || '',
              coverAlt: d.cover_alt || '',
              headerLayout: meta.headerLayout || d.header_layout || 'editorial-cta',
              headerCtaTag: meta.headerCtaTag || d.header_cta_tag || '',
              headerCtaTitle: meta.headerCtaTitle || d.header_cta_title || '',
              headerCtaDesc: meta.headerCtaDesc || d.header_cta_desc || '',
              headerCtaBtnText: meta.headerCtaBtnText || d.header_cta_btn_text || '',
              headerCtaUrl: meta.headerCtaUrl || d.header_cta_url || '',
              body: d.body || '',
              contentHtml: d.content_html || '',
              contentJson: d.content_json ? (typeof d.content_json === 'string' ? d.content_json : JSON.stringify(d.content_json)) : '',
              readingTime: d.reading_time || 2,
              status: d.status || 'borrador',
              createdAt: d.created_at,
              updatedAt: d.updated_at,
              publishedAt: d.published_at,
            }
          })

          setPosts(remotePosts)
          idbSet(STORAGE_KEY_POSTS, remotePosts)
          try {
            localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(remotePosts))
          } catch (e) {
            console.debug(e)
          }
        }

        // 2. Cargar Categorías directamente de Supabase
        const { data: catData, error: catError } = await supabase!
          .from('categories')
          .select('*')
          .order('name', { ascending: true })

        if (!catError && catData && catData.length > 0 && isMounted) {
          const remoteCategories: Category[] = catData.map((c: any) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            description: c.description || '',
            color: c.color || '#ff4b0b',
          }))
          setCategories(remoteCategories)
        }

        if (isMounted) setSyncState('synced')
      } catch (err) {
        console.warn('No se pudo sincronizar con Supabase, usando respaldo local:', err)
        if (isMounted) setSyncState('local')
      }
    }

    loadFromSupabase()
    return () => {
      isMounted = false
    }
  }, [])

  const addCategory = useCallback(
    async (name: string): Promise<Category> => {
      const trimmed = name.trim()
      const found = categories.find(c => c.name.toLowerCase() === trimmed.toLowerCase())
      if (found) return found

      const newCat: Category = {
        id: `cat-${Date.now()}`,
        name: trimmed,
        slug: slugify(trimmed),
        color: '#ff4b0b',
      }

      setCategories(prev => [...prev, newCat])

      const supabase = getSupabaseClient()
      if (supabase) {
        try {
          await supabase.from('categories').upsert({
            id: newCat.id,
            name: newCat.name,
            slug: newCat.slug,
            color: newCat.color,
          })
        } catch (e) {
          console.warn('Error guardando categoría en Supabase:', e)
        }
      }
      return newCat
    },
    [categories]
  )

  const calculateReadingTime = (text: string): number => {
    const words = text.trim().split(/\s+/).filter(Boolean).length
    return Math.max(1, Math.ceil(words / 200))
  }

  const savePost = useCallback(
    async (input: Partial<Post> & { title: string }): Promise<Post> => {
      const now = new Date().toISOString()
      const rawText = (input.body || input.contentHtml || '').replace(/<[^>]*>/g, ' ')
      const readingTime = calculateReadingTime(rawText)

      let resultPost: Post

      if (input.id) {
        // Actualizar existente
        const existing = posts.find(p => p.id === input.id)
        resultPost = {
          ...existing,
          ...input,
          id: input.id,
          title: input.title,
          slug: input.slug || slugify(input.title),
          excerpt: input.excerpt || '',
          category: input.category || 'General',
          coverUrl: input.coverUrl || '',
          coverAlt: input.coverAlt || '',
          body: input.body || '',
          contentHtml: input.contentHtml || '',
          contentJson: input.contentJson || '',
          readingTime,
          status: input.status || existing?.status || 'borrador',
          createdAt: existing?.createdAt || now,
          updatedAt: now,
          publishedAt:
            input.status === 'publicado'
              ? existing?.publishedAt || now
              : existing?.publishedAt,
        } as Post

        setPosts(prev => {
          const updated = prev.map(p => (p.id === input.id ? resultPost : p))
          try {
            localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated))
          } catch (e) {
            console.debug(e)
          }
          return updated
        })
      } else {
        // Crear nuevo
        const newId = `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
        resultPost = {
          id: newId,
          title: input.title,
          slug: input.slug || slugify(input.title),
          excerpt: input.excerpt || '',
          category: input.category || 'General',
          coverUrl: input.coverUrl || '',
          coverAlt: input.coverAlt || '',
          headerLayout: input.headerLayout || 'editorial-cta',
          headerCtaTag: input.headerCtaTag || '',
          headerCtaTitle: input.headerCtaTitle || '',
          headerCtaDesc: input.headerCtaDesc || '',
          headerCtaBtnText: input.headerCtaBtnText || '',
          headerCtaUrl: input.headerCtaUrl || '',
          body: input.body || '',
          contentHtml: input.contentHtml || '',
          contentJson: input.contentJson || '',
          readingTime,
          status: input.status || 'borrador',
          createdAt: now,
          updatedAt: now,
          publishedAt: input.status === 'publicado' ? now : undefined,
        }
        setPosts(prev => {
          const updated = [resultPost, ...prev]
          try {
            localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated))
          } catch (e) {
            console.debug(e)
          }
          return updated
        })
      }

      // Sincronizar en Supabase si está disponible
      const supabase = getSupabaseClient()
      if (supabase) {
        try {
          let parsedJson: any = null
          if (resultPost.contentJson) {
            parsedJson = typeof resultPost.contentJson === 'string'
              ? JSON.parse(resultPost.contentJson)
              : resultPost.contentJson
          } else {
            parsedJson = { type: 'doc', content: [] }
          }
          if (typeof parsedJson === 'object' && parsedJson !== null) {
            parsedJson.metadata = {
              headerLayout: resultPost.headerLayout || 'editorial-cta',
              headerCtaTag: resultPost.headerCtaTag || '',
              headerCtaTitle: resultPost.headerCtaTitle || '',
              headerCtaDesc: resultPost.headerCtaDesc || '',
              headerCtaBtnText: resultPost.headerCtaBtnText || '',
              headerCtaUrl: resultPost.headerCtaUrl || '',
            }
          }

          const dbPayload = {
            id: resultPost.id,
            title: resultPost.title,
            slug: resultPost.slug,
            excerpt: resultPost.excerpt,
            category: resultPost.category,
            cover_url: resultPost.coverUrl,
            cover_alt: resultPost.coverAlt,
            body: resultPost.body,
            content_html: resultPost.contentHtml,
            content_json: parsedJson,
            reading_time: resultPost.readingTime,
            status: resultPost.status,
            updated_at: resultPost.updatedAt,
            published_at: resultPost.publishedAt || null,
          }
          const { error } = await supabase.from('posts').upsert(dbPayload)
          if (error) {
            console.error('[BlogContext] Error sincronizando post en Supabase:', error)
            setSyncState('error')
            throw error
          } else {
            setSyncState('synced')
          }
        } catch (e) {
          console.error('Error sincronizando post con Supabase:', e)
          setSyncState('error')
          throw e
        }
      }

      // Invalidar caché de catálogo para sincronización inmediata en la web
      try {
        localStorage.removeItem('qaway_blog_articles_cache')
      } catch (e) {}

      return resultPost
    },
    [posts]
  )

  const deletePost = useCallback(
    async (id: string): Promise<void> => {
      setPosts(prev => {
        const updated = prev.filter(p => p.id !== id)
        idbSet(STORAGE_KEY_POSTS, updated)
        try {
          localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated))
          localStorage.removeItem('qaway_blog_articles_cache')
        } catch (e) {}
        return updated
      })

      const supabase = getSupabaseClient()
      if (supabase) {
        try {
          await supabase.from('posts').delete().eq('id', id)
        } catch (e) {
          console.warn('Error borrando post en Supabase:', e)
        }
      }
    },
    []
  )

  const setStatus = useCallback(
    async (id: string, status: PostStatus): Promise<void> => {
      const now = new Date().toISOString()
      setPosts(prev =>
        prev.map(p =>
          p.id === id
            ? {
                ...p,
                status,
                updatedAt: now,
                publishedAt: status === 'publicado' ? p.publishedAt || now : p.publishedAt,
              }
            : p
        )
      )
      const supabase = getSupabaseClient()
      if (supabase) {
        try {
          await supabase
            .from('posts')
            .update({
              status,
              updated_at: now,
              published_at: status === 'publicado' ? now : null,
            })
            .eq('id', id)
        } catch (e) {
          console.warn('Error actualizando estado en Supabase:', e)
        }
      }
    },
    []
  )

  const getPost = useCallback(
    (id: string): Post | undefined => {
      return posts.find(p => p.id === id)
    },
    [posts]
  )

  return (
    <BlogContext.Provider
      value={{
        posts,
        categories,
        syncState,
        isCloudConnected,
        getPost,
        savePost,
        deletePost,
        setStatus,
        addCategory,
      }}
    >
      {children}
    </BlogContext.Provider>
  )
}

export function useBlog() {
  const ctx = useContext(BlogContext)
  if (!ctx) {
    throw new Error('useBlog debe usarse dentro de un BlogProvider')
  }
  return ctx
}
